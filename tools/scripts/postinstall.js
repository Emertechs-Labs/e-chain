const fs = require('fs');
const readline = require('readline');
const { Wallet } = require('ethers');

// Global vars /////////////////////////

// Ripped from wagmi/chains with a couple of manual additions
const CHAIN_ID_TO_RPC = {
  1: {
    url: "https://eth.merkle.io",
    name: "Ethereum"
  },
  10: {
    url: "https://mainnet.optimism.io",
    name: "OP Mainnet"
  },
  14: {
    url: "https://flare-api.flare.network/ext/C/rpc",
    name: "Flare Mainnet"
  },
  56: {
    url: "https://rpc.ankr.com/bsc",
    name: "BNB Smart Chain"
  },
  97: {
    url: "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    name: "Binance Smart Chain Testnet"
  },
  100: {
    url: "https://rpc.gnosischain.com",
    name: "Gnosis"
  },
  114: {
    url: "https://coston2-api.flare.network/ext/C/rpc",
    name: "Flare Testnet Coston2"
  },
  137: {
    url: "https://polygon-rpc.com",
    name: "Polygon"
  },
  5000: {
    url: "https://rpc.mantle.xyz",
    name: "Mantle"
  },
  5001: {
    url: "https://rpc.testnet.mantle.xyz",
    name: "Mantle Testnet"
  },
  8453: {
    url: "https://mainnet.base.org",
    name: "Base"
  },
  17000: {
    url: "https://ethereum-holesky-rpc.publicnode.com",
    name: "Holesky"
  },
  42161: {
    url: "https://arb1.arbitrum.io/rpc",
    name: "Arbitrum One"
  },
  42220: {
    url: "https://forno.celo.org",
    name: "Celo"
  },
  43113: {
    url: "https://api.avax-test.network/ext/bc/C/rpc",
    name: "Avalanche Fuji"
  },
  43114: {
    url: "https://api.avax.network/ext/bc/C/rpc",
    name: "Avalanche"
  },
  44787: {
    url: "https://alfajores-forno.celo-testnet.org",
    name: "Alfajores"
  },
  48899: {
    url: "https://zircuit1-testnet.p2pify.com",
    name: "Zircuit Testnet"
  },
  48900: {
    url: "https://zircuit1-mainnet.p2pify.com",
    name: "Zircuit Mainnet"
  },
  80002: {
    url: "https://rpc-amoy.polygon.technology",
    name: "Polygon Amoy"
  },
  84532: {
    url: "https://sepolia.base.org",
    name: "Base Sepolia"
  },
  421614: {
    url: "https://sepolia-rollup.arbitrum.io/rpc",
    name: "Arbitrum Sepolia"
  },
  534351: {
    url: "https://sepolia-rpc.scroll.io",
    name: "Scroll Sepolia"
  },
  534352: {
    url: "https://rpc.scroll.io",
    name: "Scroll"
  },
  11155111: {
    url: "https://sepolia.drpc.org",
    name: "Sepolia"
  },
  11155420: {
    url: "https://sepolia.optimism.io",
    name: "OP Sepolia"
  },
  245022926: {
    url: "https://devnet.neonevm.org",
    name: "Neon EVM DevNet"
  },
  245022934: {
    url: "https://neon-proxy-mainnet.solana.p2p.org",
    name: "Neon EVM MainNet"
  },

  // Manual additions
  1440000: {
    url: "https://rpc.xrplevm.org",
    name: "XRPL EVM Mainnet"
  },
  1449000: {
    url: "https://rpc.testnet.xrplevm.org",
    name: "XRPL EVM Testnet"
  },
  1135: {
    url: "https://rpc.api.lisk.com",
    name: "Lisk"
  },
  4202: {
    url: "https://rpc.sepolia-api.lisk.com",
    name: "Lisk Sepolia"
  }

}


const configFiles = [
  {
    source: 'frontend/.env.example',
    destination: 'frontend/.env.development',
  },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


// Functions ///////////////////////////

async function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function prompt(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/N): `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

async function copyFiles() {
  for (const { source, destination } of configFiles) {
    if (fs.existsSync(destination)) {
      const overwrite = await prompt(`⚠️  ${destination} already exists. Overwrite?`);
      if (!overwrite) {
        console.log(`❌ Skipped: ${destination}`);
        continue;
      }
    }
    fs.copyFileSync(source, destination);
    console.log(`✅ Copied ${source} → ${destination}`);
  }
}

async function setupDeployerWallet() {
  const wallet = Wallet.createRandom();
  console.log('✅ Generated Ethereum Wallet for deployment:');
  console.log(`   Address: ${wallet.address}`);
  console.log(`   Private Key: ${wallet.privateKey}`);
  console.log('');
  console.log('💸 IMPORTANT: Fund this wallet with Base Sepolia ETH from:');
  console.log('   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
  console.log('');

  return { wallet };
}

async function promptForWalletKitId() {
  let reownProjectId = await askQuestion('Enter Reown WalletKit project ID (optional, press Enter to skip): ');
  reownProjectId = reownProjectId.replace(/[\r\n\s]+/g, ''); // Remove newlines and spaces

  return { reownProjectId };
}

async function writeFrontendConfiguration(config) {
  // Update frontend config file
  const frontendConfigPath = configFiles[0].destination;
  let frontendConfig = fs.readFileSync(frontendConfigPath, 'utf8');

  // Update contract addresses for Base Sepolia deployment
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=.*/, `NEXT_PUBLIC_EVENT_FACTORY_ADDRESS=0xA97cB40548905B05A67fCD4765438aFBEA4030fc`);
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_EVENT_TICKET_ADDRESS=.*/, `NEXT_PUBLIC_EVENT_TICKET_ADDRESS=0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C`);
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_POAP_ADDRESS=.*/, `NEXT_PUBLIC_POAP_ADDRESS=0x08344CfBfB3afB2e114A0dbABbaF40e7eB62FD33`);
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_INCENTIVE_ADDRESS=.*/, `NEXT_PUBLIC_INCENTIVE_ADDRESS=0x1cfDae689817B954b72512bC82f23F35B997617D`);
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_MARKETPLACE_ADDRESS=.*/, `NEXT_PUBLIC_MARKETPLACE_ADDRESS=0xD061393A54784da5Fea48CC845163aBc2B11537A`);

  // Update network configuration
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_CHAIN_ID=.*/, `NEXT_PUBLIC_CHAIN_ID=84532`);
  frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_RPC_URL=.*/, `NEXT_PUBLIC_RPC_URL=https://sepolia.base.org`);

  // Update WalletKit project ID if provided
  if (config.reownProjectId) {
    frontendConfig = frontendConfig.replace(/NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID=.*/, `NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID='${config.reownProjectId}'`);
  }

  fs.writeFileSync(frontendConfigPath, frontendConfig, 'utf8');
  console.log(`✅ Updated ${frontendConfigPath} with Base Sepolia contract addresses.`);
}

async function runConfig() {
  // Main script

  console.log("\n#### Echain Direct Deployment Setup ####\n");
  console.log("\nThis will configure your development environment for direct Base Sepolia deployment.\n");

  const proceed = await prompt("\nContinue with setup?");

  if (!proceed) {
    console.log('Skipping setup\n');
    rl.close();
    return;
  }

  console.log("🚀 Copying configuration files...\n");
  await copyFiles();

  console.log('\n🔧 Development Environment Configuration...\n');

  // Setup deployer wallet
  const walletConfig = await setupDeployerWallet();

  // Optional WalletKit setup
  const walletKitConfig = await promptForWalletKitId();

  const config = {
    ...walletConfig,
    ...walletKitConfig
  };

  // Write frontend configuration
  await writeFrontendConfiguration(config);

  console.log('\n#### Configuration Complete! 🦦 ####\n\n');

  console.log('Next steps:');
  console.log('');
  console.log('1. Fund your deployer wallet with Base Sepolia ETH:');
  console.log('   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
  console.log('');
  console.log('2. Update blockchain/.env with your deployer private key');
  console.log('');
  console.log('3. Deploy contracts (if needed):');
  console.log('   cd blockchain');
  console.log('   npm run deploy:events:dev');
  console.log('');
  console.log('4. Start the frontend:');
  console.log('   cd frontend');
  console.log('   npm run dev');
  console.log('');

  rl.close();
}

runConfig();
