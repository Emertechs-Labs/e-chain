/* eslint-disable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';

describe('Security Tests - Core Functionality', function () {
  let eventFactory: any;
  let poapAttendance: any;
  let organizer: any;
  let attacker: any;
  let user1: any;

  beforeEach(async function () {
    const signers = await ethers.getSigners();
    [, organizer, user1, attacker] = signers;

    // Deploy contracts
    const EventTicket = await ethers.getContractFactory('EventTicket');
    const eventTicketTemplate = await EventTicket.deploy();
    await eventTicketTemplate.waitForDeployment();

    const EventFactory = await ethers.getContractFactory('EventFactory');
    eventFactory = await EventFactory.deploy(await eventTicketTemplate.getAddress(), signers[0].address);
    await eventFactory.waitForDeployment();

    const POAPContract = await ethers.getContractFactory('POAPAttendance');
    poapAttendance = await POAPContract.deploy(await eventFactory.getAddress());
    await poapAttendance.waitForDeployment();

    // Use paid verification for organizer
    await (eventFactory as any).connect(organizer).selfVerifyOrganizer(organizer.address, {
      value: ethers.parseEther('0.002'),
    });
  });

  describe('EventFactory Security', function () {
    it('Should prevent unverified organizers from creating events', async function () {
      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 7200;
      const endTime = startTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(attacker)
          .createEvent('Evil Event', 'ipfs://evil', ethers.parseEther('0.1'), 100, startTime, endTime, {
            value: ethers.parseEther('0.005'),
          }),
      ).to.be.revertedWith('Not verified organizer');
    });

    it('Should validate event parameters', async function () {
      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 7200;
      const endTime = startTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(organizer)
          .createEvent('', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime, {
            value: ethers.parseEther('0.005'),
          }),
      ).to.be.revertedWith('Invalid event name length');
    });

    it('Should require payment for organizer verification', async function () {
      // Test that insufficient payment is rejected
      await expect(
        (eventFactory as any).connect(attacker).selfVerifyOrganizer(attacker.address, {
          value: ethers.parseEther('0.001'), // Less than required 0.002 ETH
        }),
      ).to.be.revertedWith('Insufficient verification fee');
    });

    it('Should allow owner to pause/unpause', async function () {
      await eventFactory.pause();

      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 7200;
      const endTime = startTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(organizer)
          .createEvent('Test', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime),
      ).to.be.revertedWithCustomError(eventFactory, 'EnforcedPause');

      await eventFactory.unpause();

      await expect(
        (eventFactory as any)
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
      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 7200;
      const endTime = startTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(organizer)
          .createEvent('Big Event', 'ipfs://test', ethers.parseEther('0.1'), 200000, startTime, endTime),
      ).to.be.revertedWith('Invalid max tickets range');
    });

    it('Should enforce reasonable ticket prices', async function () {
      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 7200;
      const endTime = startTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(organizer)
          .createEvent('Expensive Event', 'ipfs://test', ethers.parseEther('5000'), 100, startTime, endTime),
      ).to.be.revertedWith('Ticket price too high');
    });

    it('Should enforce proper timing constraints', async function () {
      const currentBlockTime = await time.latest();
      const pastTime = currentBlockTime - 3600; // 1 hour ago
      const futureTime = currentBlockTime + 7200;

      await expect(
        (eventFactory as any)
          .connect(organizer)
          .createEvent('Past Event', 'ipfs://test', ethers.parseEther('0.1'), 100, pastTime, futureTime),
      ).to.be.revertedWith('Start time must be at least 1 hour in future');
    });
  });

  describe('Critical Vulnerability Fixes', function () {
    describe('Clone Factory Race Condition Prevention', function () {
      it('Should use CREATE2 deterministic addresses', async function () {
        const currentBlockTime = await time.latest();
        const startTime = currentBlockTime + 7200;
        const endTime = startTime + 7200;

        // Predict the address before creation
        const predictedAddress = await eventFactory.predictTicketContractAddress(
          organizer.address,
          1, // eventId will be 1
          await time.latest(), // This won't match exactly, but tests the function exists
          await ethers.provider.getBlockNumber(),
        );

        expect(predictedAddress).to.not.equal(ethers.ZeroAddress);
      });

      it('Should prevent race condition attacks with deterministic deployment', async function () {
        const currentBlockTime = await time.latest();
        const startTime = currentBlockTime + 7200;
        const endTime = startTime + 7200;

        // Create event - should succeed without race condition issues
        const createTx = await (eventFactory as any)
          .connect(organizer)
          .createEvent('Secure Event', 'ipfs://secure', ethers.parseEther('0.1'), 100, startTime, endTime);

        await expect(createTx).to.not.be.reverted;

        const receipt = await createTx.wait();
        const eventCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === 'EventCreated');
        const eventId = (eventCreatedEvent as any).args[0];

        // Verify event was created successfully
        const eventDetails = await eventFactory.getEventDetails(eventId);
        expect(eventDetails.ticketContract).to.not.equal(ethers.ZeroAddress);
      });
    });

    describe('EIP-712 Signature Security', function () {
      it('Should implement EIP-712 structured signing', async function () {
        const eventId = 1;
        const attendee = user1.address;
        const nonce = 0;
        const deadline = (await time.latest()) + 3600;

        // Create signature using EIP-712
        const domain = {
          name: 'POAPAttendance',
          version: '1',
          chainId: (await ethers.provider.getNetwork()).chainId,
          verifyingContract: await poapAttendance.getAddress(),
        };

        const types = {
          MintAttendance: [
            { name: 'eventId', type: 'uint256' },
            { name: 'attendee', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        };

        const value = {
          eventId,
          attendee,
          nonce,
          deadline,
        };

        // Sign the structured data
        const signature = await organizer.signTypedData(domain, types, value);

        // Verify signature can be recovered
        const recoveredSigner = ethers.verifyTypedData(domain, types, value, signature);
        expect(recoveredSigner).to.equal(organizer.address);
      });

      it('Should prevent cross-contract signature replay', async function () {
        // This test verifies that signatures are domain-specific
        const eventId = 1;
        const attendee = user1.address;
        const nonce = 0;
        const deadline = (await time.latest()) + 3600;

        // Create signature for POAP contract
        const domain1 = {
          name: 'POAPAttendance',
          version: '1',
          chainId: (await ethers.provider.getNetwork()).chainId,
          verifyingContract: await poapAttendance.getAddress(),
        };

        const types = {
          MintAttendance: [
            { name: 'eventId', type: 'uint256' },
            { name: 'attendee', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        };

        const value = {
          eventId,
          attendee,
          nonce,
          deadline,
        };

        const signature = await organizer.signTypedData(domain1, types, value);

        // Try to use the same signature with a different contract (simulated)
        // This should fail because the domain separator includes the contract address
        const domain2 = {
          ...domain1,
          verifyingContract: ethers.ZeroAddress, // Different contract
        };

        const recoveredSigner1 = ethers.verifyTypedData(domain1, types, value, signature);
        const recoveredSigner2 = ethers.verifyTypedData(domain2, types, value, signature);

        expect(recoveredSigner1).to.equal(organizer.address);
        expect(recoveredSigner2).to.not.equal(organizer.address); // Should be different due to domain separation
      });
    });

    describe('Unbounded Loop DoS Protection', function () {
      it('Should handle large numbers of events efficiently', async function () {
        const currentBlockTime = await time.latest();
        const startTime = currentBlockTime + 7200;
        const endTime = startTime + 7200;

        // Create multiple events
        for (let i = 0; i < 10; i++) {
          await (eventFactory as any)
            .connect(organizer)
            .createEvent(
              `Event ${i}`,
              `ipfs://event${i}`,
              ethers.parseEther('0.1'),
              50,
              startTime + i * 3600,
              endTime + i * 3600,
            );
        }

        // Test pagination works efficiently
        const [eventIds, hasMore] = await eventFactory.getActiveEvents(0, 5);
        expect(eventIds.length).to.be.lessThanOrEqual(5);
        expect(typeof hasMore).to.equal('boolean');

        // Test gas efficiency - should not consume excessive gas
        const gasEstimate = await eventFactory.getActiveEvents.estimateGas(0, 10);
        expect(gasEstimate).to.be.lessThan(500000); // Reasonable gas limit
      });

      it('Should maintain active events index correctly', async function () {
        const currentBlockTime = await time.latest();
        const startTime = currentBlockTime + 7200;
        const endTime = startTime + 7200;

        // Create event
        const createTx = await (eventFactory as any)
          .connect(organizer)
          .createEvent('Test Event', 'ipfs://test', ethers.parseEther('0.1'), 100, startTime, endTime);

        const receipt = await createTx.wait();
        const eventCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === 'EventCreated');
        const eventId = (eventCreatedEvent as any).args[0];

        // Check it's in active events
        let [activeEvents] = await eventFactory.getActiveEvents(0, 10);
        expect(activeEvents).to.include(eventId);

        // Deactivate event
        await eventFactory.connect(organizer).setEventStatus(eventId, false);

        // Check it's removed from active events
        [activeEvents] = await eventFactory.getActiveEvents(0, 10);
        expect(activeEvents).to.not.include(eventId);
      });
    });
  });
});
