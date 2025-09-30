import { ethers } from 'ethers';

// Contract addresses from Base Sepolia deployment
const CONTRACT_ADDRESSES = {
  EventFactory: '0xbE36039Bfe7f48604F73daD61411459B17fd2e85',
};

// EventFactory ABI (minimal for verification)
const EVENT_FACTORY_ABI = [
  'function verifyOrganizer(address organizer) external',
  'function isVerifiedOrganizer(address organizer) external view returns (bool)',
  'function owner() external view returns (address)',
];

async function verifyOrganizer(organizerAddress: string) {
  console.log('🚀 Verifying organizer on Base Sepolia...');

  // Check environment variables
  const rpcUrl = process.env.BASE_TESTNET_RPC_URL || 'https://sepolia.base.org';
  const privateKey = process.env.OWNER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("OWNER_PRIVATE_KEY environment variable not set. This should be the contract owner's private key.");
  }

  // Setup provider and signer
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('📋 Verification Details:');
  console.log(`  Owner: ${wallet.address}`);
  console.log(`  Organizer to verify: ${organizerAddress}`);
  console.log(`  Network: Base Sepolia`);

  // Connect to EventFactory contract
  const eventFactory = new ethers.Contract(CONTRACT_ADDRESSES.EventFactory, EVENT_FACTORY_ABI, wallet);

  // Check if caller is the owner
  const owner: string = (await eventFactory.owner()) as string;
  if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
    throw new Error(`Wallet ${wallet.address} is not the contract owner (${owner})`);
  }

  // Check if organizer is already verified
  const isAlreadyVerified: boolean = (await eventFactory.isVerifiedOrganizer(organizerAddress)) as boolean;
  if (isAlreadyVerified) {
    console.log(`✅ Organizer ${organizerAddress} is already verified`);
    return;
  }

  // Verify the organizer
  console.log(`🔄 Verifying organizer ${organizerAddress}...`);
  const tx = (await eventFactory.verifyOrganizer(organizerAddress)) as ethers.ContractTransactionResponse;
  console.log(`📝 Transaction submitted: ${tx.hash}`);

  // Wait for confirmation
  const receipt = (await tx.wait()) as ethers.TransactionReceipt;
  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

  // Verify the organizer is now verified
  const isVerified: boolean = (await eventFactory.isVerifiedOrganizer(organizerAddress)) as boolean;
  if (isVerified) {
    console.log(`🎉 Organizer ${organizerAddress} successfully verified!`);
  } else {
    throw new Error('Verification failed - organizer is still not verified');
  }
}

// Main execution
const organizerAddress = process.argv[2];
if (!organizerAddress) {
  console.error('Usage: npx ts-node verify-organizer.ts <organizer-address>');
  process.exit(1);
}

if (!organizerAddress.startsWith('0x') || organizerAddress.length !== 42) {
  console.error('Invalid Ethereum address format');
  process.exit(1);
}

verifyOrganizer(organizerAddress)
  .then(() => {
    console.log('\n✅ Organizer verification completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Organizer verification failed:', error);
    process.exit(1);
  });
