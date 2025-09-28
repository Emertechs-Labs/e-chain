import { ethers } from 'hardhat';

/**
 * Simple deployment script for Echain contracts
 * This script deploys the core contracts with minimal configuration
 */
async function main() {
  console.log('🚀 Starting Echain deployment...');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);

  // Deploy EventTicket template
  const EventTicket = await ethers.getContractFactory('EventTicket');
  const eventTicketTemplate = await EventTicket.deploy();
  await eventTicketTemplate.waitForDeployment();

  const ticketAddress = await eventTicketTemplate.getAddress();
  console.log('EventTicket template deployed to:', ticketAddress);

  // Deploy EventFactory
  const EventFactory = await ethers.getContractFactory('EventFactory');
  const eventFactory = await EventFactory.deploy(ticketAddress, deployer.address);
  await eventFactory.waitForDeployment();

  const factoryAddress = await eventFactory.getAddress();
  console.log('EventFactory deployed to:', factoryAddress);

  console.log('✅ Deployment completed successfully!');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
