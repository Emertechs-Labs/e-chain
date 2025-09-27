/* eslint-disable */
import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('Security Tests - Core Functionality', function () {
  let eventFactory: any;
  let organizer: any;
  let attacker: any;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [, organizer, , attacker] = signers;

    // Deploy contracts
    const EventTicket = await ethers.getContractFactory('EventTicket');
    const eventTicketTemplate = await EventTicket.deploy();
    await eventTicketTemplate.waitForDeployment();

    const EventFactory = await ethers.getContractFactory('EventFactory');
    eventFactory = await EventFactory.deploy(await eventTicketTemplate.getAddress(), signers[0].address);
    await eventFactory.waitForDeployment();

    await eventFactory.verifyOrganizer(organizer.address);
  });

  describe('EventFactory Security', function () {
    it('Should prevent unverified organizers from creating events', async function () {
      const startTime = Math.floor(Date.now() / 1000) + 7200;
      const endTime = startTime + 7200;
      
      await expect(
        eventFactory
          .connect(attacker)
          .createEvent('Evil Event', 'ipfs://evil', ethers.parseEther('0.1'), 100, startTime, endTime),
      ).to.be.revertedWith('Not verified organizer');
    });

    it('Should validate event parameters', async function () {
      const startTime = Math.floor(Date.now() / 1000) + 7200;
      const endTime = startTime + 7200;
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime),
      ).to.be.revertedWith('Invalid event name length');
    });

    it('Should prevent non-owners from verifying organizers', async function () {
      await expect(eventFactory.connect(attacker).verifyOrganizer(attacker.address)).to.be.revertedWithCustomError(
        eventFactory,
        'OwnableUnauthorizedAccount',
      );
    });

    it('Should allow owner to pause/unpause', async function () {
      await eventFactory.pause();
      
      const startTime = Math.floor(Date.now() / 1000) + 7200;
      const endTime = startTime + 7200;
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Test', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime),
      ).to.be.revertedWithCustomError(eventFactory, 'EnforcedPause');

      await eventFactory.unpause();
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Test', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime),
      ).to.not.be.reverted;
    });

    it('Should prevent platform fee manipulation by non-owners', async function () {
      await expect(eventFactory.connect(attacker).setPlatformFee(5000)).to.be.revertedWithCustomError(
        eventFactory,
        'OwnableUnauthorizedAccount',
      );
    });

    it('Should prevent excessive platform fees', async function () {
      await expect(
        eventFactory.setPlatformFee(1500), // 15% - too high
      ).to.be.revertedWith('Fee too high');
    });
  });

  describe('Basic Validation Tests', function () {
    it('Should enforce max ticket limits', async function () {
      const startTime = Math.floor(Date.now() / 1000) + 7200;
      const endTime = startTime + 7200;
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Big Event', 'ipfs://test', ethers.parseEther('0.1'), 200000, startTime, endTime),
      ).to.be.revertedWith('Invalid max tickets range');
    });

    it('Should enforce reasonable ticket prices', async function () {
      const startTime = Math.floor(Date.now() / 1000) + 7200;
      const endTime = startTime + 7200;
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Expensive Event', 'ipfs://test', ethers.parseEther('5000'), 100, startTime, endTime),
      ).to.be.revertedWith('Ticket price too high');
    });

    it('Should enforce proper timing constraints', async function () {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const futureTime = Math.floor(Date.now() / 1000) + 7200;
      
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Past Event', 'ipfs://test', ethers.parseEther('0.1'), 100, pastTime, futureTime),
      ).to.be.revertedWith('Start time must be at least 1 hour in future');
    });
  });
});
