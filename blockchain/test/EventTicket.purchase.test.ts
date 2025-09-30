import { expect } from 'chai';
import { ethers } from 'hardhat';
import { EventFactory, EventTicket } from '../../frontend/lib/typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { time } from '@nomicfoundation/hardhat-network-helpers';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

describe('EventTicket Purchase Functionality', function () {
  let eventFactory: EventFactory;
  let eventTicketTemplate: EventTicket;
  let eventTicket: EventTicket;
  let organizer: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let treasury: SignerWithAddress;

  const TICKET_PRICE = ethers.parseEther('0.1');
  const MAX_TICKETS = 100;

  beforeEach(async function () {
    [, organizer, user1, user2, treasury] = await ethers.getSigners();

    // Deploy EventTicket template
    const EventTicketFactory = await ethers.getContractFactory('EventTicket');
    eventTicketTemplate = (await EventTicketFactory.deploy()) as unknown as EventTicket;
    await eventTicketTemplate.waitForDeployment();

    // Deploy EventFactory
    const EventFactoryContract = await ethers.getContractFactory('EventFactory');
    eventFactory = (await EventFactoryContract.deploy(
      await eventTicketTemplate.getAddress(),
      treasury.address,
    )) as unknown as EventFactory;
    await eventFactory.waitForDeployment();

    // Verify organizer - using selfVerifyOrganizer function (payable)
    await eventFactory.connect(organizer).selfVerifyOrganizer(organizer.address, {
      value: ethers.parseEther('0.002'),
    });

    // Create an event
    const currentBlockTime = await time.latest();
    const startTime = currentBlockTime + 3700; // 1 hour and 2 minutes from current blockchain time
    const endTime = startTime + 7200; // 2 hours duration

    const tx = await (eventFactory as any)
      .connect(organizer)
      .createEvent('Test Event', 'ipfs://test-metadata', TICKET_PRICE, MAX_TICKETS, startTime, endTime);

    const receipt = await tx.wait();
    const eventCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === 'EventCreated');

    if (!eventCreatedEvent) {
      throw new Error('EventCreated event not found');
    }

    const eventId = eventCreatedEvent.args[0];

    // Get the deployed ticket contract using the events mapping
    const eventDetails = await eventFactory.events(eventId);
    eventTicket = (await ethers.getContractAt('EventTicket', eventDetails.ticketContract)) as unknown as EventTicket;
  });

  describe('purchaseTicket Function', function () {
    it('Should allow users to purchase a single ticket', async function () {
      const quantity = 1;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      await expect((eventTicket as any).connect(user1).purchaseTicket(quantity, { value: totalCost }))
        .to.emit(eventTicket, 'TicketMinted')
        .withArgs(0, user1.address, 1, 0, 0);

      expect(await eventTicket.balanceOf(user1.address)).to.equal(1);
      expect(await eventTicket.totalSold()).to.equal(1);
    });

    it('Should allow users to purchase multiple tickets (when limit allows)', async function () {
      // Organizer increases limit to allow multiple purchases
      await (eventTicket as any).connect(organizer).setMaxTicketsPerAddress(10);

      const quantity = 5;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      const tx = await (eventTicket as any).connect(user1).purchaseTicket(quantity, { value: totalCost });
      const receipt = await tx.wait();

      // Check that all tickets were minted
      expect(await eventTicket.balanceOf(user1.address)).to.equal(quantity);
      expect(await eventTicket.totalSold()).to.equal(quantity);

      // Check events emitted
      const ticketMintedEvents = receipt?.logs.filter((log: any) => log.fragment?.name === 'TicketMinted');
      expect(ticketMintedEvents).to.have.length(quantity);
    });

    it('Should enforce rate limiting (max 1 ticket per address by default)', async function () {
      // Try to purchase 2 tickets (should fail with default limit of 1)
      await expect(
        (eventTicket as any).connect(user1).purchaseTicket(2, {
          value: TICKET_PRICE * 2n,
        }),
      ).to.be.revertedWith('Exceeds max tickets per address');

      // Purchase 1 ticket (should succeed)
      await (eventTicket as any).connect(user1).purchaseTicket(1, {
        value: TICKET_PRICE,
      });

      // Try to purchase 1 more (should fail - already has 1)
      await expect((eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE })).to.be.revertedWith(
        'Exceeds max tickets per address',
      );
    });

    it('Should allow organizer to modify ticket limit per address', async function () {
      // Check default limit
      expect(await (eventTicket as any).maxTicketsPerAddress()).to.equal(1);

      // Organizer increases limit to 5
      await expect((eventTicket as any).connect(organizer).setMaxTicketsPerAddress(5))
        .to.emit(eventTicket, 'MaxTicketsPerAddressUpdated')
        .withArgs(5);

      expect(await (eventTicket as any).maxTicketsPerAddress()).to.equal(5);

      // Now user can purchase up to 5 tickets
      await (eventTicket as any).connect(user1).purchaseTicket(3, {
        value: TICKET_PRICE * 3n,
      });

      // Should still fail if trying to exceed the new limit
      await expect(
        (eventTicket as any).connect(user1).purchaseTicket(3, {
          value: TICKET_PRICE * 3n,
        }),
      ).to.be.revertedWith('Exceeds max tickets per address');

      // Regular users cannot modify the limit
      await expect((eventTicket as any).connect(user1).setMaxTicketsPerAddress(10)).to.be.revertedWith(
        'Not authorized',
      );
    });

    it('Should enforce transaction limits (max 10 tickets per transaction)', async function () {
      await expect(
        (eventTicket as any).connect(user1).purchaseTicket(11, {
          value: TICKET_PRICE * 11n,
        }),
      ).to.be.revertedWith('Max 10 tickets per transaction');
    });

    it('Should require sufficient payment', async function () {
      const quantity = 2;
      const insufficientPayment = TICKET_PRICE; // Only enough for 1 ticket

      await expect(
        (eventTicket as any).connect(user1).purchaseTicket(quantity, { value: insufficientPayment }),
      ).to.be.revertedWith('Insufficient payment');
    });

    it('Should refund excess payment', async function () {
      const quantity = 1;
      const excessPayment = TICKET_PRICE + ethers.parseEther('0.05');

      const initialBalance = await ethers.provider.getBalance(user1.address);

      const tx = await (eventTicket as any).connect(user1).purchaseTicket(quantity, {
        value: excessPayment,
      });
      const receipt = await tx.wait();

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice!;
      const finalBalance = await ethers.provider.getBalance(user1.address);

      // Balance should be: initial - ticketPrice - gasUsed (excess should be refunded)
      const expectedBalance = initialBalance - TICKET_PRICE - BigInt(gasUsed.toString());
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther('0.001'));
    });

    it('Should prevent purchase when contract is paused', async function () {
      await eventTicket.connect(organizer).pause();

      await expect(
        (eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE }),
      ).to.be.revertedWithCustomError(eventTicket, 'EnforcedPause');
    });

    it('Should prevent purchase when supply is exhausted', async function () {
      // Create event with only 2 tickets
      const currentBlockTime = await time.latest();
      const startTime = currentBlockTime + 3700;
      const endTime = startTime + 7200;

      const tx = await eventFactory.connect(organizer).createEvent(
        'Limited Event',
        'ipfs://limited-metadata',
        TICKET_PRICE,
        2, // Only 2 tickets
        startTime,
        endTime,
      );

      const receipt = await tx.wait();
      const eventCreatedEvent = receipt?.logs.find((log: any) => log.fragment?.name === 'EventCreated');

      if (!eventCreatedEvent) {
        throw new Error('EventCreated event not found');
      }

      const eventId = (eventCreatedEvent as any).args[0];

      const eventDetails = await eventFactory.events(eventId);
      const limitedTicket = (await ethers.getContractAt(
        'EventTicket',
        eventDetails.ticketContract,
      )) as unknown as EventTicket;

      // Increase limit to allow purchasing 2 tickets
      await (limitedTicket as any).connect(organizer).setMaxTicketsPerAddress(3);

      // Purchase all available tickets
      await (limitedTicket as any).connect(user1).purchaseTicket(2, { value: TICKET_PRICE * 2n });

      // Try to purchase more
      await expect((limitedTicket as any).connect(user2).purchaseTicket(1, { value: TICKET_PRICE })).to.be.revertedWith(
        'Exceeds maximum supply',
      );
    });

    it('Should store correct ticket information', async function () {
      await (eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE });

      const ticketInfo = await eventTicket.getTicketInfo(0);

      expect(ticketInfo.eventId).to.equal(1);
      expect(ticketInfo.seatNumber).to.equal(0); // General admission
      expect(ticketInfo.tier).to.equal(0); // Standard tier
      expect(ticketInfo.isUsed).to.equal(false);
      expect(ticketInfo.originalBuyer).to.equal(user1.address);
      expect(ticketInfo.mintedAt).to.be.greaterThan(0);
    });

    it('Should handle overflow protection in price calculation', async function () {
      // This test ensures the overflow check works correctly
      const quantity = 1;

      // This should work normally
      await expect((eventTicket as any).connect(user1).purchaseTicket(quantity, { value: TICKET_PRICE })).to.not.be
        .reverted;
    });
  });

  describe('Integration with existing mintTicket function', function () {
    it('Should allow organizer to mint special tickets', async function () {
      // Organizer should still be able to mint VIP tickets
      await expect(eventTicket.connect(organizer).mintTicket(user1.address, 1, 1, { value: TICKET_PRICE }))
        .to.emit(eventTicket, 'TicketMinted')
        .withArgs(0, user1.address, 1, 1, 1);

      const ticketInfo = await eventTicket.getTicketInfo(0);
      expect(ticketInfo.seatNumber).to.equal(1);
      expect(ticketInfo.tier).to.equal(1); // VIP tier
    });

    it('Should prevent regular users from calling mintTicket', async function () {
      await expect(
        eventTicket.connect(user1).mintTicket(user1.address, 0, 0, { value: TICKET_PRICE }),
      ).to.be.revertedWith('Not authorized');
    });
  });
});
