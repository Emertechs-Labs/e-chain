import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EventFactory, EventTicket } from '../typechain-types';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('EventFactory', function () {
  let eventFactory: EventFactory;
  let eventTicketTemplate: EventTicket;
  let owner: HardhatEthersSigner;
  let organizer: HardhatEthersSigner;
  let user: HardhatEthersSigner;
  let treasury: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, organizer, user, treasury] = await ethers.getSigners();

    // Deploy EventTicket template
    const EventTicket = await ethers.getContractFactory('EventTicket');
    const deployedTicket = await EventTicket.deploy();
    await deployedTicket.waitForDeployment();
    eventTicketTemplate = deployedTicket as unknown as EventTicket;

    // Deploy EventFactory
    const EventFactory = await ethers.getContractFactory('EventFactory');
    const deployedFactory = await EventFactory.deploy(await eventTicketTemplate.getAddress(), treasury.address);
    await deployedFactory.waitForDeployment();
    eventFactory = deployedFactory as unknown as EventFactory;
  });

  describe('Deployment', function () {
    it('Should set the correct template and treasury', async function () {
      expect(await eventFactory.eventTicketTemplate()).to.equal(await eventTicketTemplate.getAddress());
      expect(await eventFactory.treasury()).to.equal(treasury.address);
    });

    it('Should verify the owner as organizer', async function () {
      expect(await eventFactory.isVerifiedOrganizer(owner.address)).to.equal(true);
    });

    it('Should start with zero events', async function () {
      expect(await eventFactory.eventCount()).to.equal(0);
    });
  });

  describe('Organizer Management', function () {
    it('Should allow owner to verify organizers', async function () {
      await eventFactory.verifyOrganizer(organizer.address);
      expect(await eventFactory.isVerifiedOrganizer(organizer.address)).to.equal(true);
    });

    it('Should allow owner to unverify organizers', async function () {
      await eventFactory.verifyOrganizer(organizer.address);
      await eventFactory.unverifyOrganizer(organizer.address);
      expect(await eventFactory.isVerifiedOrganizer(organizer.address)).to.equal(false);
    });

    it('Should emit events when verifying/unverifying', async function () {
      await expect(eventFactory.verifyOrganizer(organizer.address))
        .to.emit(eventFactory, 'OrganizerVerified')
        .withArgs(organizer.address);

      await expect(eventFactory.unverifyOrganizer(organizer.address))
        .to.emit(eventFactory, 'OrganizerUnverified')
        .withArgs(organizer.address);
    });

    it('Should reject non-owner attempts to verify organizers', async function () {
      await expect(eventFactory.connect(user).verifyOrganizer(organizer.address)).to.be.revertedWithCustomError(
        eventFactory,
        'OwnableUnauthorizedAccount',
      );
    });
  });

  describe('Event Creation', function () {
    beforeEach(async function () {
      await eventFactory.verifyOrganizer(organizer.address);
    });

    it('Should create an event successfully', async function () {
      const name = 'Test Event';
      const metadataURI = 'ipfs://QmTest123';
      const ticketPrice = ethers.parseEther('0.1');
      const maxTickets = 100;
      const startTime = Math.floor(Date.now() / 1000) + 86400; // 24 hours from now
      const endTime = startTime + 7200; // 2 hours duration

      const tx = await eventFactory
        .connect(organizer)
        .createEvent(name, metadataURI, ticketPrice, maxTickets, startTime, endTime);

      await expect(tx).to.emit(eventFactory, 'EventCreated');

      expect(await eventFactory.eventCount()).to.equal(1);
    });

    it('Should store event details correctly', async function () {
      const name = 'Test Event';
      const metadataURI = 'ipfs://QmTest123';
      const ticketPrice = ethers.parseEther('0.1');
      const maxTickets = 100;
      const startTime = Math.floor(Date.now() / 1000) + 86400;
      const endTime = startTime + 7200;

      await eventFactory.connect(organizer).createEvent(name, metadataURI, ticketPrice, maxTickets, startTime, endTime);

      const event = await eventFactory.events(1);
      expect(event.id).to.equal(1);
      expect(event.organizer).to.equal(organizer.address);
      expect(event.name).to.equal(name);
      expect(event.metadataURI).to.equal(metadataURI);
      expect(event.ticketPrice).to.equal(ticketPrice);
      expect(event.maxTickets).to.equal(maxTickets);
      expect(event.startTime).to.equal(startTime);
      expect(event.endTime).to.equal(endTime);
      expect(event.isActive).to.equal(true);
    });

    it("Should track organizer's events", async function () {
      await eventFactory
        .connect(organizer)
        .createEvent(
          'Event 1',
          'ipfs://QmTest1',
          ethers.parseEther('0.1'),
          100,
          Math.floor(Date.now() / 1000) + 86400,
          Math.floor(Date.now() / 1000) + 86400 + 7200,
        );

      await eventFactory
        .connect(organizer)
        .createEvent(
          'Event 2',
          'ipfs://QmTest2',
          ethers.parseEther('0.2'),
          200,
          Math.floor(Date.now() / 1000) + 86400,
          Math.floor(Date.now() / 1000) + 86400 + 7200,
        );

      const organizerEvents = await eventFactory.getOrganizerEvents(organizer.address);
      expect(organizerEvents).to.have.lengthOf(2);
      expect(organizerEvents[0]).to.equal(1);
      expect(organizerEvents[1]).to.equal(2);
    });

    it('Should reject event creation from unverified organizers', async function () {
      await expect(
        eventFactory
          .connect(user)
          .createEvent(
            'Test Event',
            'ipfs://QmTest123',
            ethers.parseEther('0.1'),
            100,
            Math.floor(Date.now() / 1000) + 86400,
            Math.floor(Date.now() / 1000) + 86400 + 7200,
          ),
      ).to.be.revertedWith('Not verified organizer');
    });

    it('Should reject invalid event parameters', async function () {
      const validStartTime = Math.floor(Date.now() / 1000) + 86400;
      const validEndTime = validStartTime + 7200;

      // Empty name
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('', 'ipfs://QmTest123', ethers.parseEther('0.1'), 100, validStartTime, validEndTime),
      ).to.be.revertedWith('Invalid event name length');

      // Empty metadata URI
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Test Event', '', ethers.parseEther('0.1'), 100, validStartTime, validEndTime),
      ).to.be.revertedWith('Invalid metadata URI length');

      // Zero max tickets
      await expect(
        eventFactory
          .connect(organizer)
          .createEvent('Test Event', 'ipfs://QmTest123', ethers.parseEther('0.1'), 0, validStartTime, validEndTime),
      ).to.be.revertedWith('Invalid max tickets range');

      // Start time in past
      await expect(
        eventFactory.connect(organizer).createEvent(
          'Test Event',
          'ipfs://QmTest123',
          ethers.parseEther('0.1'),
          100,
          Math.floor(Date.now() / 1000) - 86400, // Past time
          validEndTime,
        ),
      ).to.be.revertedWith('Start time must be at least 1 hour in future');

      // End time before start
      await expect(
        eventFactory.connect(organizer).createEvent(
          'Test Event',
          'ipfs://QmTest123',
          ethers.parseEther('0.1'),
          100,
          validStartTime,
          validStartTime - 1, // End before start
        ),
      ).to.be.revertedWith('End time before start');
    });
  });

  describe('Event Management', function () {
    beforeEach(async function () {
      await eventFactory.verifyOrganizer(organizer.address);
      await eventFactory
        .connect(organizer)
        .createEvent(
          'Test Event',
          'ipfs://QmTest123',
          ethers.parseEther('0.1'),
          100,
          Math.floor(Date.now() / 1000) + 86400,
          Math.floor(Date.now() / 1000) + 86400 + 7200,
        );
    });

    it('Should allow organizer to update event', async function () {
      const newName = 'Updated Event';
      const newMetadataURI = 'ipfs://QmUpdated456';

      await expect(eventFactory.connect(organizer).updateEvent(1, newName, newMetadataURI))
        .to.emit(eventFactory, 'EventUpdated')
        .withArgs(1, newName, newMetadataURI);

      const event = await eventFactory.events(1);
      expect(event.name).to.equal(newName);
      expect(event.metadataURI).to.equal(newMetadataURI);
    });

    it('Should allow organizer to change event status', async function () {
      await expect(eventFactory.connect(organizer).setEventStatus(1, false))
        .to.emit(eventFactory, 'EventStatusChanged')
        .withArgs(1, false);

      const event = await eventFactory.events(1);
      expect(event.isActive).to.equal(false);
    });

    it('Should reject updates from non-organizers', async function () {
      await expect(eventFactory.connect(user).updateEvent(1, 'Hacked Event', 'ipfs://QmHacked')).to.be.revertedWith(
        'Not event organizer',
      );
    });
  });

  describe('Active Events Query', function () {
    beforeEach(async function () {
      await eventFactory.verifyOrganizer(organizer.address);

      // Create multiple events
      for (let i = 0; i < 5; i++) {
        await eventFactory
          .connect(organizer)
          .createEvent(
            `Event ${i + 1}`,
            `ipfs://QmTest${i + 1}`,
            ethers.parseEther('0.1'),
            100,
            Math.floor(Date.now() / 1000) + 86400,
            Math.floor(Date.now() / 1000) + 86400 + 7200,
          );
      }
    });

    it('Should return active events with pagination', async function () {
      const [eventIds, hasMore] = await eventFactory.getActiveEvents(0, 3);

      expect(eventIds).to.have.lengthOf(3);
      expect(eventIds[0]).to.equal(1);
      expect(eventIds[1]).to.equal(2);
      expect(eventIds[2]).to.equal(3);
      // Since we have 5 events total and requesting first 3, there should be more
      expect(hasMore).to.equal(true);
    });

    it('Should handle pagination correctly', async function () {
      const [eventIds, hasMore] = await eventFactory.getActiveEvents(3, 3);

      expect(eventIds).to.have.lengthOf(2); // Only 2 remaining events
      expect(eventIds[0]).to.equal(4);
      expect(eventIds[1]).to.equal(5);
      expect(hasMore).to.equal(false);
    });
  });
});
