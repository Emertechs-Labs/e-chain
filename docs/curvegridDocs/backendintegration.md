Build a backend app on MultiBaas
Once you have created a MultiBaas deployment, you can use it to build a backend application. Typically, you will write a smart contract in Solidity, deploy it via MultiBaas' web UI or via our Hardhat or Forge plugins, and then use one of our SDKs, or the MultiBaas API directly, to interact with the blockchain.

Provision a backend API key
API keys for backend apps can be provisioned via the MultiBaas web UI. For API keys that need to make changes to MultiBaas, for example to link new contracts or add aliases to addresses, or to sign Cloud Wallet transactions, the Administrators permission should be selected. Since any API key with this level of permission has full control over the MultiBaas deployment, special care must be taken to protect and secure API keys. Administrator API keys should never be publicly exposed.

MultiBaas features for backend apps
MultiBaas combines a number of different features that are useful for building backend apps:

Interact with smart contract functions
Compose, sign (see next section), and submit transactions to the blockchain, monitor them, and be notified via a webhook
Efficiently read and aggregate smart contract events
Sign transactions
Cloud Wallets
Cloud Wallets are the easiest way to sign and submit transactions to the blockchain with MultiBaas. Simply pass the "signAndSubmit": true parameter along with a smart contract function call that writes to the blockchain, and MultiBaas will have the Cloud Wallet sign the transaction, and automatically submit it to the blockchain for you. This also works with transferring ETH and deploying contracts. MultiBaas will return a signed transaction hash, that can be used to look up the transaction or its receipt via the API, or via the transaction explorer in the MultiBaas web UI.

Cloud Wallet transactions can also be managed with the Transaction Manager (TXM) and can be configured to issue webhooks once included in a block. Cloud Wallets can also be used to sign and submit raw transactions as well as to sign typed or untyped data.

Seed phrases or private keys
Within a backend app, here are any number of ways to store and manage seed phrases and private keys. The following examples will assume the private keys are imported via environment variables and otherwise managed securely.

MultiBaas also offers an API endpoint to submit signed transactions to the blockchain, so that a separate JSON RPC provider is not needed.

TypeScript (JavaScript)
ethers.js is a JS toolkit for managing blockchain interactions. The unsigned transaction from MultiBaas needs to be reformatted slightly for ethers.js. The following sample code will call a smart contract write function, reformat the returned unsigned transaction, and submit it to a connected web3 browser wallet for signing and submission to the blockchain.

Getting an unsigned transaction from the MultiBaas API by calling a smart contract function, signing the transaction, and submitting it to the blockchain
require('dotenv').config();
const { ethers } = require('ethers');
const MultiBaas = require('@curvegrid/multibaas-sdk');
const { isAxiosError } = require('axios');

const { PRIVATE_KEY, SEED_PHRASE, RPC_URL, MULTIBAAS_API_KEY, MULTIBAAS_BASE_URL } = process.env;

if (!PRIVATE_KEY && !SEED_PHRASE) {
  throw new Error('Missing PRIVATE_KEY or SEED_PHRASE in environment.');
}
if (!MULTIBAAS_API_KEY) {
  throw new Error('Missing MULTIBAAS_API_KEY in environment.');
}
if (!RPC_URL) {
  throw new Error('Missing RPC_URL in environment.');
}

// Setup MultiBaas
const config = new MultiBaas.Configuration({
  basePath: `${MULTIBAAS_BASE_URL || 'http://<YOUR MULTIBAAS DEPLOYMENT ID>.multibaas.com'}/api/v0`,
  accessToken: MULTIBAAS_API_KEY,
});
const contractsApi = new MultiBaas.ContractsApi(config);
const chainsClient = new MultiBaas.ChainsApi(config);

const provider = new ethers.JsonRpcProvider(RPC_URL);

// Set up wallet
let wallet;
if (PRIVATE_KEY) {
  wallet = new ethers.Wallet(PRIVATE_KEY, provider);
} else {
  const hdNode = ethers.HDNodeWallet.fromPhrase(SEED_PHRASE);
  wallet = new ethers.Wallet(hdNode.privateKey, provider);
}
console.log('Wallet address:', wallet.address);

async function getUnsignedTransaction(
  AddressAliasOrRawAddress,
  contractLabel,
  contractMethod,
  payload,
) {
  try {
    // Fetch unsigned transaction from MultiBaas
    const resp = await contractsApi.callContractFunction(
      'ethereum',
      AddressAliasOrRawAddress,
      contractLabel,
      contractMethod,
      payload,
    );
    const unsignedTx = resp.data.result.tx;
    console.log('Unsigned Tx:', unsignedTx);
    return unsignedTx;
  } catch (error) {
    console.error('Error fetching unsigned transaction:', error);
  }
}

async function getChainId() {
  const resp = await chainsClient.getChainStatus('ethereum');
  return resp.data.result.chainID;
}

async function signAndSendTransaction(txData) {
  try {
    if (!txData) {
      throw new Error('Transaction data is undefined');
    }

    // Create a properly formatted transaction object with correct field names
    const formattedTx = {
      to: txData.to,
      from: txData.from,
      nonce: txData.nonce,
      data: txData.data,
      value: txData.value || '0x0',
      gasLimit: txData.gas, // Map gas to gasLimit
      maxFeePerGas: txData.gasFeeCap, // Map gasFeeCap to maxFeePerGas
      maxPriorityFeePerGas: txData.gasTipCap, // Map gasTipCap to maxPriorityFeePerGas
      type: txData.type,
      chainId: await getChainId(),
    };

    // Sign transaction
    const signedTx = await wallet.signTransaction(formattedTx);
    console.log('Signed Tx:', signedTx);

    // Submit via ethers provider
    const txResponse = await provider.broadcastTransaction(signedTx);
    console.log('Transaction submitted:', txResponse.hash);

    return {
      txHash: txResponse.hash,
      signedTx,
      rawResponse: txResponse,
    };
  } catch (error) {
    if (isAxiosError(error)) {
      console.error(
        `MultiBaas error [${error.response?.status}]: ${error.response?.data?.message}`,
      );
    } else {
      console.error('Transaction error:', error);
    }
    throw error;
  }
}

// Parse command-line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i += 2) {
    if (args[i].startsWith('-')) {
      const key = args[i].substring(1);
      const value = args[i + 1];
      params[key] = value;
    }
  }
  return params;
}

async function main() {
  try {
    const params = parseArgs();
    // Validate required parameters
    if (!params.address && !params.alias) {
      throw new Error('Missing required parameter: address or alias');
    }
    if (!params.method) {
      throw new Error('Missing required parameter: -method');
    }
    if (!params['contract-label']) {
      throw new Error('Missing required parameter: -contract-label');
    }

    // Parse payload if provided
    let args = [];
    if (params.args) {
      try {
        args = JSON.parse(params.args);
      } catch (e) {
        console.warn('Could not parse payload as JSON, using as string argument');
        args = [params.args];
      }
    }

    const { alias, address, 'contract-label': contractLabel, method: contractMethod } = params;

    // Prepare payload for MultiBaas callContractFunction
    payload = {
      args: args,
      from: wallet.address,
    };

    const txData = await getUnsignedTransaction(
      alias || address,
      contractLabel,
      contractMethod,
      payload,
    );
    const result = await signAndSendTransaction(txData);
    console.log('Transaction complete!');
    console.log('Transaction hash:', result.txHash);
  } catch (error) {
    console.error('Error in main:', error.message);
    process.exit(1);
  }
}

// Execute main function if this script is run directly
if (require.main === module) {
  main().catch(console.error);
}

// Export the function for use in other scripts
module.exports = {
  signAndSendTransaction,
};


You can run it as follows:

node index.js -address <0x-your-contract-address> -contract-label <your-contract-label> -method <your-contract-method-name>


Go
The following is a complete command line application where MultiBaas composes a transaction to transfer ERC20 tokens from one address to another, which is then signed by a private key within the Go application, and then submitted back to the blockchain via MultiBaas.

Some setup is required by setting the following environment variables:

export MULTIBAAS_DEPLOYMENT_URL="https://<YOUR MULTIBAAS DEPLOYMENT ID>.multibaas.com"
export MULTIBAAS_API_KEY="<YOUR MULTIBAAS DAPP USER API KEY>"
export PRIVATE_KEY_IN_HEX="<PRIVATE KEY FOR SIGNING THE TRANSACTION>"

In addition, an ERC20 smart contract must be deployed on the blockchain, and the signing (sending) address must have sufficient token balance.

The program can then be run by specifying a few command line arguments:

go run . -addressOrAlias sampletoken -to 0x1C568f7B1de5fdEe019fD1213160241F4e470e02 -amount 1


Where -addressOrAlias sampletoken is the address alias where the ERC20 smart contract has been deployed, -to 0x1C568f7B1de5fdEe019fD1213160241F4e470e02 is the recipient address, and -amount 1 is the quantity of ERC20 tokens to send.

If successful, the program will output something like:

Signed transaction hash: 0x969978e258248b1648cdf510de29c787a6346f16b7376cd0bdaf41f796a77d7e
Transaction submitted successfully!
