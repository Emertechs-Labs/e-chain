import { NextResponse } from 'next/server';
import { getUnsignedTransaction, getUnsignedTransactionForChain } from '../../../../lib/multibaas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, contractLabel, method, args, from, value, traceId, blockchain } = body || {};

    // Normalize alias-like inputs: MultiBaas requires aliases to be lowercase and contain
    // only lowercase letters, digits, underscores, or hyphens, and must not start with '0x'.
    const normalizeAlias = (s?: string) => {
      if (!s || typeof s !== 'string') return s;
      // Preserve hex addresses that start with 0x (case-insensitive)
      if (/^0x[a-fA-F0-9]+$/.test(s)) return s;
      // Lowercase and replace whitespace with hyphens
      return s.trim().toLowerCase().replace(/\s+/g, '-');
    };

    const isValidAlias = (s?: string) => {
      if (!s || typeof s !== 'string') return false;
      // Hex addresses allowed
      if (/^0x[a-fA-F0-9]{40}$/.test(s)) return true;
      // Alias must be lowercase letters/digits/underscores/hyphens
      return /^[a-z0-9_-]+$/.test(s);
    };

    const normalizedAddress = normalizeAlias(address);
    const normalizedContract = normalizeAlias(contractLabel);

    // Map known aliases to instance aliases (from MultiBaas deployment)
    // aliasToInstance maps a "contract label" (logical name) to a specific instance alias
    const aliasToInstance: Record<string, string> = {
      'eventfactory': 'eventfactory',
      'eventticket': 'eventticket',
      'incentivemanager': 'incentivemanager',
      'poapattendance': 'poapattendance',
      'marketplace': 'marketplace',
    };

    // Determine the values to pass to the SDK:
    // - addressOrAlias should be the instance alias (or hex address)
    // - contractToCall should be the logical contract label (without instance suffix)
    let addressOrAlias: string | undefined = normalizedAddress;
    let contractToCall: string | undefined = normalizedContract;

    if (normalizedContract) {
      // If we have a contract label and a known alias for it, use the alias as the address
      if (aliasToInstance[normalizedContract]) {
        addressOrAlias = aliasToInstance[normalizedContract];
        contractToCall = normalizedContract;
      } else {
        // keep addressOrAlias as provided (could be an address or alias) and use normalizedContract as the contract label
        contractToCall = normalizedContract;
      }
    } else if (normalizedAddress && aliasToInstance[normalizedAddress]) {
      // If caller passed the contract label in the `address` field, use the mapped alias and set contract label accordingly
      addressOrAlias = aliasToInstance[normalizedAddress];
      contractToCall = normalizedAddress;
    }
    
    // Add additional check for direct hex addresses
    if (normalizedAddress && /^0x[a-fA-F0-9]{40}$/.test(normalizedAddress)) {
      // If it's a direct hex address, use it as is
      addressOrAlias = normalizedAddress;
      // Try to determine the contract label from the address if not already set
      if (!contractToCall) {
        // Look up contract label from address if possible
        const addressToLabel: Record<string, string> = {
          '0xA97cB40548905B05A67fCD4765438aFBEA4030fc': 'eventfactory',
          '0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C': 'eventticket',
          '0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33': 'poapattendance',
          '0x1cfDae689817B954b72512bC82f23F35B997617D': 'incentivemanager',
          '0xD061393A54784da5Fea48CC845163aBc2B11537A': 'marketplace',
        };
        
        contractToCall = addressToLabel[normalizedAddress] || contractLabel;
      }
    }

    // Normalize args: convert hex strings to decimal strings for numeric fields
    const normalizeArgs = (args: any[]): any[] => {
      return args.map(arg => {
        if (typeof arg === 'string' && arg.startsWith('0x') && /^[0-9a-fA-F]+$/.test(arg.slice(2))) {
          // Convert hex string to decimal string
          try {
            return BigInt(arg).toString();
          } catch {
            return arg; // fallback if not a valid hex number
          }
        }
        return arg;
      });
    };
    const normalizedArgs = normalizeArgs(args || []);

    console.debug('[app/api/multibaas/unsigned] start (sdk)', { 
      traceId, 
      address: normalizedAddress, 
      resolvedAddress: addressOrAlias,
      contractLabel: normalizedContract, 
      resolvedContract: contractToCall,
      method, 
      args: normalizedArgs, 
      from, 
      value, 
      blockchain 
    });

    // Use the server-side SDK helper which handles basePath, apiKey and correct method/path
    try {
      // If the client provided an explicit blockchain label/id, use it to override the default
      // Validate alias formats before calling the SDK to provide clearer errors and avoid
      // upstream 400 responses from MultiBaas.
      // Validate the resolved values we will send to the SDK
      if (!isValidAlias(addressOrAlias)) {
        return NextResponse.json({ error: 'Invalid address/alias format', message: `Provided address/alias '${addressOrAlias ?? address}' is not a valid MultiBaas alias or hex address.` }, { status: 400 });
      }
      if (!isValidAlias(contractToCall)) {
        return NextResponse.json({ error: 'Invalid contractLabel format', message: `Provided contractLabel '${contractToCall ?? contractLabel}' is not a valid MultiBaas contract alias.` }, { status: 400 });
      }

      // Add better debugging for blockchain parameter
      const resolvedBlockchain = blockchain || 'base-sepolia';
      console.debug('[app/api/multibaas/unsigned] using blockchain', { 
        providedBlockchain: blockchain,
        resolvedBlockchain,
        traceId
      });
      
      const result = blockchain
        ? await getUnsignedTransactionForChain(resolvedBlockchain, addressOrAlias || '', contractToCall || '', method, normalizedArgs, from, value)
        : await getUnsignedTransaction(addressOrAlias || '', contractToCall || '', method, normalizedArgs, from, value);

      console.debug('[app/api/multibaas/unsigned] sdk result', { traceId, result });

      // Validate the result has the expected structure
      if (!result || result.kind !== 'TransactionToSignResponse' || !result.tx) {
        console.error('[app/api/multibaas/unsigned] invalid result from SDK', { traceId, result });
        return NextResponse.json({ error: 'Invalid unsigned transaction response from MultiBaas', result }, { status: 500 });
      }

      // Validate the 'to' address on the unsigned tx is present and looks like a valid hex address
      const toAddr = result.tx?.to;
      const isValidHexAddress = typeof toAddr === 'string' && /^0x[a-fA-F0-9]{40}$/.test(toAddr);
      if (!isValidHexAddress) {
        console.error('[app/api/multibaas/unsigned] unsigned tx missing/invalid "to" address', { traceId, toAddr, result });
        return NextResponse.json({
          error: 'Unsigned transaction missing or invalid "to" address',
          message: 'Check that the contract label is registered in MultiBaas and mapped to a valid on-chain address, and that the contract ABI/method signature matches.',
          to: toAddr,
          result
        }, { status: 500 });
      }

      // Return the raw result (SDK returns TransactionToSignResponse)
      return NextResponse.json(result, { status: 200 });
    } catch (upstreamErr: any) {
      console.error('[app/api/multibaas/unsigned] upstream SDK error', { 
        traceId, 
        message: upstreamErr?.message, 
        status: upstreamErr?.response?.status, 
        data: upstreamErr?.response?.data,
        contractInfo: {
          addressOrAlias,
          contractToCall,
          method
        }
      });
      
      // Provide more helpful error messages based on common MultiBaas errors
      let errorMessage = 'MultiBaas proxy error';
      const status = upstreamErr?.response?.status ?? 500;
      
      if (status === 404) {
        errorMessage = `Contract or method not found: ${contractToCall}`;
      } else if (status === 400) {
        errorMessage = `Invalid request to MultiBaas: ${upstreamErr?.message}`;
      } else if (status === 401 || status === 403) {
        errorMessage = 'Authentication error with MultiBaas';
      }
      
      const data = upstreamErr?.response?.data ?? { error: upstreamErr?.message ?? errorMessage };
      return NextResponse.json({ error: errorMessage, status, body: data }, { status });
    }

  } catch (err: any) {
    console.error('[app/api/multibaas/unsigned] Server proxy to MultiBaas failed:', { error: err?.message ?? err, stack: err?.stack });
    return NextResponse.json({ error: err?.message ?? 'Unknown error' }, { status: 500 });
  }
}
