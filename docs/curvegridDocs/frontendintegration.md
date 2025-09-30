Build a frontend app on MultiBaas
Once you have created a MultiBaas deployment, you can use it to build a frontend application. Typically, you will write a smart contract in Solidity, deploy it via MultiBaas' web UI or via our Hardhat or Forge plugins, and then use one of our SDKs, or the MultiBaas API directly, to interact with the blockchain.

Provision a frontend API key
API keys for frontend apps can be provisioned via the MultiBaas web UI. MultiBaas API keys can be directly embedded into a frontend app, provided they are only in the DApp User group. These API keys will not be able to make changes to MultiBaas, but can read from smart contract functions, compose unsigned transactions, and interact with smart contract event data.

MultiBaas features for frontend apps
MultiBaas combines a number of different features that are useful for building frontend apps:

Interact with smart contract functions
Compose, have the user sign (see below), and submit transactions to the blockchain
Efficiently read and aggregate smart contract events
CORS Origin
You must configure Cross-Origin Resource Sharing (CORS) settings in MultiBaas for your frontend app to make API calls directly to MultiBaas. You will need to add both your development URL (e.g. http://localhost:3000) and your public deployment URL (e.g. https://your-app-name-here.vercel.com) for things to work correctly.

To manage your allowed origins:

Navigate to the CORS settings from your MultiBaas dashboard:

You will see the list of allowed origins on the CORS page. Here, you can view existing allowed origins or add new ones.

To add a new allowed origin, click "Add Origin" and enter the origin URL in the provided input field. Confirm by clicking "Save".

cors-menu-modal

Alternatively, you can manage CORS settings programmatically via the MultiBaas REST API.

Transaction signing via a browser-based web3 wallet
When building a web UI directly on top of MultiBaas, or when passing unsigned transactions from MultiBaas via a backend to a frontend, it is typical to have a browser-based web3 wallet (e.g. MetaMask) sign the transaction and submit it to the blockchain. There are a few different ways to do this using frontend toolkits.

Unsigned transactions returned by the MultiBaas API will contain a complete set of fields required to successfully include the transaction into a block, and can be signed and submitted to the blockchain directly. However, web3 JS web toolkits used to interface with browser-based web3 wallets will require the transaction fields to be reformatted slightly from what is return from MultiBaas. This can also include removing the gas-related and nonce fields in order to let the browser-based web3 wallet recompute these, to increase the chances of the transaction being successfully included in a block.

Examples of an unsigned transaction
If you want to start by testing out frontend code, an absolutely minimal transaction might be to send some quantity of ETH to another address. Note that the transaction below does not include any gas or nonce fields, and the web3 browser-based wallet (e.g. MetaMask) would typically compute and add these, before passing the transaction to the user to review and sign.

Sending a quantity of ETH to the zero address
const verySimpleTx = {
  to: '0x0000000000000000000000000000000000000000',
  value: '10000000000000000', // 0.0001 ETH
  type: 2,
};

More practically, the MultiBaas API can compute an unsigned transaction. The following minimal example uses the MultiBaas TypeScript SDK to call a smart contract function, which returns the unsigned transaction.

Getting an unsigned transaction from the MultiBaas API by calling a smart contract function
const MultiBaas = require('@curvegrid/multibaas-sdk');
const { isAxiosError } = require('axios');

const config = new MultiBaas.Configuration({
  basePath: 'http://<YOUR MULTIBAAS DEPLOYMENT ID>.multibaas.com/api/v0',
  accessToken: '<YOUR API KEY HERE>',
});

const contractsApi = new MultiBaas.ContractsApi(config);
const chain = 'ethereum';
const deployedAddressOrAlias = '<your-deployed-or-linked-contract-alias>';
const contractLabel = '<your-contract-label>';
const contractMethod = '<your-contract-menthod>';

const payload = {
  args: [],
  from: '0x0000000000000000000000000000000000000000',
};

(async function () {
  try {
    const resp = await contractsApi.callContractFunction(
      chain,
      deployedAddressOrAlias,
      contractLabel,
      contractMethod,
      payload,
    );
    console.log('Function call result:\n', resp.data.result);
  } catch (e) {
    if (isAxiosError(e)) {
      console.log(
        `MultiBaas error with status '${e.response.data.status}' and message: ${e.response.data.message}`,
      );
    } else {
      console.log('An unexpected error occurred:', e);
    }
  }
})();


ethers.js
ethers.js is a JS toolkit for managing blockchain interactions. The unsigned transaction from MultiBaas needs to be reformatted slightly for ethers.js. The following sample code will take transaction data (txData) in the format output by MultiBaas, reformat the returned unsigned transaction for ethers.js, and submit it to a connected web3 browser wallet for signing and submission to the blockchain.

Example code to pass an unsigned transaction from a frontend app to a web3 browser-based wallet (e.g. MetaMask) using ethers.js
// on page where ethers.js is installed (e.g. https://playground.ethers.org/)

// Function to format an unsigned transaction returned by the MultiBaas API
// to a format that is suitable for ethers.js and a web3 browser-based wallet,
// by removing nonce and gas fields so that the wallet can recompute them
function formatTransaction(txData) {
  const formattedTx = JSON.parse(JSON.stringify(txData));

  // convert fields that need to be converted
  formattedTx.value = BigInt(formattedTx.value);

  formattedTx.gasLimit = formattedTx.gas;
  delete formattedTx.gas;

  // let the wallet decide on the following parameters:
  delete formattedTx.nonce;
  delete formattedTx.gasPrice;
  delete formattedTx.gasFeeCap;
  delete formattedTx.gasTipCap;
  delete formattedTx.from;
  delete formattedTx.hash;
  return formattedTx;
}

// Function to sign your transaction using MetaMask's eth_sendTransaction
async function signAndSendTransaction(txData) {
  try {
    if (typeof ethers === 'undefined') {
      throw new Error('ethers.js is not loaded.');
    }

    if (!window.ethereum) {
      throw new Error('No Web3 provider detected.');
    }

    // Connect to the provider
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log('Connected to provider');

    // Request account access
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    console.log('Connected account:', address);

    // Reformat transaction for ethers.js and web3 browser-based wallet
    const formattedTx = formatTransaction(txData);
    console.log('Transaction to sign:', formattedTx);

    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction(formattedTx);
    console.log('Transaction sent!');
    console.log('Transaction hash:', tx.hash);
    console.log('Full response:', tx);
    return tx;

    return {
      signedData: { hash: dataHash, signature: signature },
      formattedTx: formattedTx,
    };
  } catch (error) {
    console.error('Error during transaction signing:', error);
    throw error;
  }
}

wagmi and viem
wagmi is a set of React hooks for interacting with the blockchain. viem is it's corresponding JS toolkit. Viem can be used on its own, in a similar way to ethers.js.

Example code to pass an unsigned transaction from a frontend app to a web3 browser-based wallet (e.g. MetaMask) using wagmi/viem
const { createWalletClient, custom, http } = await import('https://esm.sh/viem');
console.log('viem imported successfully!');

async function getChainId() {
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  return parseInt(chainIdHex, 16);
}

// Get chain ID
const chainId = await getChainId();
console.log(`Connected to chain ID: ${chainId}`);

// Create a chain config based on chainId
const chain = {
  id: chainId,
  name: chainId === 1337 ? 'Local Development Chain' : `Chain ${chainId}`,
};

// Create a client with public and wallet actions
// This approach is recommended by the viem docs for test environments
const client = createWalletClient({
  chain,
  transport: custom(window.ethereum),
});

// Function to format an unsigned transaction returned by the MultiBaas API
// to a format that is suitable for wagmi/viem and a web3 browser-based wallet,
// by removing nonce and gas fields so that the wallet can recompute them
function formatTransaction(txData, address) {
  const formattedTx = JSON.parse(JSON.stringify(txData));

  // convert fields that need to be converted
  formattedTx.value = BigInt(formattedTx.value);

  formattedTx.gasLimit = formattedTx.gas;
  delete formattedTx.gas;

  // let the wallet decide on the following parameters:
  delete formattedTx.nonce;
  delete formattedTx.gasPrice;
  delete formattedTx.gasFeeCap;
  delete formattedTx.gasTipCap;
  delete formattedTx.from;
  delete formattedTx.hash;
  formattedTx.account = address;
  return formattedTx;
}

async function signAndSendTransaction(txData) {
  try {
    // Check if ethereum provider is available
    if (!window.ethereum) {
      throw new Error(
        'No Web3 provider detected. Please install MetaMask or another Web3 wallet extension.',
      );
    }

    // Request account access
    const accounts = await client.requestAddresses();
    const address = accounts[0];
    console.log('Connected to wallet:', address);

    // Reformat transaction for wagmi/viem and web3 browser-based wallet
    const formattedTx = formatTransaction(txData, address);
    console.log('Sending transaction:', formattedTx);

    // Send the transaction
    const hash = await client.sendTransaction(formattedTx);

    console.log('Transaction sent successfully!');
    console.log('Transaction hash:', hash);
    return hash;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
}


For practical frontend use cases, you can simply pass the unsigned transaction to functions like sendTransactionAsync from wagmi. You may checkout our sample-app for more details.