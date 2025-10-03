import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@typechain/hardhat';
import 'hardhat-multibaas-plugin';
import path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let deployerPrivateKey =
  process.env.DEPLOYER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
let deploymentEndpoint = process.env.MULTIBAAS_ENDPOINT || '';
let adminApiKey = process.env.MULTIBAAS_ADMIN_KEY || '';
let web3Key = process.env.MULTIBAAS_WEB3_KEY || '';
let rpcUrl = process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org'; // Required if web3Key is not provided

if (process.env['HARDHAT_NETWORK']) {
  const CONFIG_FILE = path.join(__dirname, `./deployment-config.${process.env['HARDHAT_NETWORK']}`);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  ({
    deploymentConfig: { deploymentEndpoint, deployerPrivateKey, web3Key, adminApiKey, rpcUrl },
    // eslint-disable-next-line @typescript-eslint/no-require-imports
  } = require(CONFIG_FILE));
}

const web3Url = web3Key ? `${deploymentEndpoint}/web3/${web3Key}` : rpcUrl;

const config: HardhatUserConfig = {
  networks: {
    localhost: {
      url: 'http://127.0.0.1:8545',
      accounts: [deployerPrivateKey],
      chainId: 31337,
    },
    development: {
      url: web3Url,
      accounts: [deployerPrivateKey],
    },
    testing: {
      url: web3Url,
      accounts: [deployerPrivateKey],
    },
    'base-testnet': {
      url: 'https://sepolia.base.org',
      accounts: [deployerPrivateKey],
      chainId: 84532,
      gasPrice: 'auto',
    },
  },
  etherscan: {
    apiKey: process.env.BASESCAN_API_KEY || 'A86YHZ4PPM6DS6BPSV9ERMUYAWF9FI6FZ6',
    customChains: [
      {
        network: 'base-sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
    ],
  },
  mbConfig: {
    apiKey: adminApiKey,
    host: deploymentEndpoint,
    allowUpdateAddress: ['development', 'testing', 'base-testnet'],
    allowUpdateContract: ['development', 'base-testnet'],
  },
  typechain: {
    outDir: '../frontend/lib/typechain-types',
    target: 'ethers-v6',
  },
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
          evmVersion: 'paris', // until PUSH0 opcode is widely supported
        },
      },
    ],
  },
};

export default config;
