/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

// Contract addresses from Base Sepolia deployment
const CONTRACT_ADDRESSES = {
  EventFactory: '0xbE36039Bfe7f48604F73daD61411459B17fd2e85',
  EventTicket: '0x127b53D8f29DcDe4DDfcCb24ad8b88B515D08180',
  POAPAttendance: '0x405061e2ef1F748fA95A1e7725fc1a008e8c2196',
  IncentiveManager: '0x8290c12f874DF9D03FDadAbE10C7c6321B69Ded9',
};

// Contract labels for MultiBaas
const CONTRACT_LABELS = {
  EventFactory: 'eventfactory',
  EventTicket: 'eventticket',
  POAPAttendance: 'poapattendance',
  IncentiveManager: 'incentivemanager',
};

// Contract ABIs
const CONTRACT_ABIS = {
  EventFactory: require('../artifacts/contracts/core/EventFactory.sol/EventFactory.json').abi,
  EventTicket: require('../artifacts/contracts/core/EventTicket.sol/EventTicket.json').abi,
  POAPAttendance: require('../artifacts/contracts/modules/POAPAttendance.sol/POAPAttendance.json').abi,
  IncentiveManager: require('../artifacts/contracts/modules/IncentiveManager.sol/IncentiveManager.json').abi,
};

async function registerContract(
  deploymentUrl: string,
  adminApiKey: string,
  contractName: string,
  address: string,
  label: string,
  abi: any[],
) {
  const url = `${deploymentUrl}/api/v0/contracts`;

  const payload = {
    address,
    label: label,
    abi: JSON.stringify(abi),
    name: contractName,
    description: `${contractName} contract for Echain platform`,
    chain: 'ethereum',
  };

  console.log(`📝 Registering ${contractName} at ${url}...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 409) {
      console.log(`⚠️  ${contractName} already registered, skipping...`);
      return true; // Not an error
    }
    throw new Error(`Failed to register ${contractName}: ${response.status} ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Successfully registered ${contractName}`);
  return result;
}

async function registerContracts() {
  console.log('🚀 Registering Echain contracts with MultiBaas...');

  // Check environment variables
  const deploymentUrl = process.env.MULTIBAAS_ENDPOINT;
  const adminApiKey = process.env.MULTIBAAS_ADMIN_KEY;

  if (!deploymentUrl) {
    throw new Error(
      'MULTIBAAS_ENDPOINT environment variable not set. Set it to your MultiBaas deployment URL (e.g., https://your-deployment.multibaas.com)',
    );
  }
  if (!adminApiKey) {
    throw new Error('MULTIBAAS_ADMIN_KEY environment variable not set. Use your Admin API key from MultiBaas console.');
  }

  try {
    // Register each contract
    for (const [contractName, address] of Object.entries(CONTRACT_ADDRESSES)) {
      const label = CONTRACT_LABELS[contractName as keyof typeof CONTRACT_LABELS];
      const abi = CONTRACT_ABIS[contractName as keyof typeof CONTRACT_ABIS];

      await registerContract(deploymentUrl, adminApiKey, contractName, address, label, abi);
    }

    console.log('\n🎉 All contracts registered successfully!');
    console.log('\n📋 Registered Contracts:');
    Object.entries(CONTRACT_ADDRESSES).forEach(([name, address]) => {
      const label = CONTRACT_LABELS[name as keyof typeof CONTRACT_LABELS];
      console.log(`  ${name}: ${address} (label: ${label})`);
    });

    console.log('\n🔗 You can now test event creation in the frontend!');
  } catch (error: any) {
    console.error('\n❌ Registration failed:', error.message);
    throw error;
  }
}

// Run the registration
registerContracts()
  .then(() => {
    console.log('\n✅ Contract registration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Contract registration failed:', error);
    process.exit(1);
  });
