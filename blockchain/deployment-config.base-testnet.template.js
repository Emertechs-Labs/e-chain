const deploymentConfig = {
  // Private key of the deployer account, beginning with 0x
  // Set via environment variable: DEPLOYER_PRIVATE_KEY
  deployerPrivateKey:
    process.env.DEPLOYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000',

  // Full URL such as https://abc123.multibaas.com
  // Set via environment variable: MULTIBAAS_ENDPOINT
  deploymentEndpoint: process.env.MULTIBAAS_ENDPOINT || 'https://<YOUR_DEPLOYMENT_ID>.multibaas.com',

  // API key to access MultiBaas web3 endpoint
  // Note that the API key MUST be part of the "Web3" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  // Set via environment variable: MULTIBAAS_WEB3_KEY
  web3Key: process.env.MULTIBAAS_WEB3_KEY || '<API_KEY_IN_WEB3_GROUP>',

  // RPC URL for Base Sepolia testnet
  // Set via environment variable: BASE_TESTNET_RPC_URL (optional, defaults to public RPC)
  rpcUrl: process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org',

  // API key to access MultiBaas from deployer
  // Note that the API key MUST be part of the "Administrators" group
  // Create one on MultiBaas via navigation bar > Admin > API Keys
  // Set via environment variable: MULTIBAAS_ADMIN_KEY
  adminApiKey: process.env.MULTIBAAS_ADMIN_KEY || '<API_KEY_IN_ADMINISTRATOR_GROUP>',

  // Base Sepolia testnet specific configuration
  chainId: 84532, // Base Sepolia testnet chain ID
  networkName: 'base-sepolia',
  blockExplorer: 'https://sepolia-explorer.base.org',

  // Gas configuration for Base
  gasPrice: 'auto',
  gasLimit: 'auto',
};

module.exports = {
  deploymentConfig,
};
