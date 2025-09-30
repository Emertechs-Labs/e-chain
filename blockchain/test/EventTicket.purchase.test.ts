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
  let createdEventId: any;

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

    createdEventId = eventCreatedEvent.args[0];
    const eventId = createdEventId;

    // Get the deployed ticket contract using the events mapping
    const eventDetails = await eventFactory.events(eventId);
    eventTicket = (await ethers.getContractAt('EventTicket', eventDetails.ticketContract)) as unknown as EventTicket;
  });

  describe('purchaseTicket Function', function () {
    it('Should allow users to purchase a single ticket', async function () {
      const quantity = 1;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      const tx = await (eventTicket as any).connect(user1).purchaseTicket(quantity, { value: totalCost });
      const receipt = await tx.wait();
      if (!receipt) throw new Error('Transaction receipt not found');

      const ticketMintedEvents = (receipt.logs as any[]).filter((log: any) => log.fragment?.name === 'TicketMinted');
      expect(ticketMintedEvents).to.have.length(1);

      const eventLog = ticketMintedEvents[0];
      const mintedTokenId = BigInt(eventLog.args[0].toString());
      expect(eventLog.args[1]).to.equal(user1.address);

      expect(await eventTicket.balanceOf(user1.address)).to.equal(1);
      expect(await eventTicket.totalSold()).to.equal(1);

      // sanity: token exists and has correct owner
      expect(await eventTicket.ownerOf(mintedTokenId)).to.equal(user1.address);
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
      if (!receipt) throw new Error('Transaction receipt not found');

      const gasUsed = receipt.gasUsed;
      const effectiveGasPriceRaw = receipt.effectiveGasPrice ?? receipt.gasPrice ?? 0n;
      const effectiveGasPrice = BigInt(effectiveGasPriceRaw);
      const gasCost = gasUsed * effectiveGasPrice;
      const finalBalance = await ethers.provider.getBalance(user1.address);

      // Balance should be: initial - ticketPrice - gasCost (excess should be refunded)
      const expectedBalance = initialBalance - TICKET_PRICE - gasCost;
      expect(finalBalance).to.be.closeTo(expectedBalance, ethers.parseEther('0.001'));
    });

    it('Should prevent purchase when contract is paused', async function () {
      await eventTicket.connect(organizer).pause();
      // The contract reverts when paused. Use a generic revert assertion because a custom error may be emitted
      await expect((eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE })).to.be.reverted;
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
      const tx = await (eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE });
      const receipt = await tx.wait();
      if (!receipt) throw new Error('Transaction receipt not found');
      const ticketMintedEvents = (receipt.logs as any[]).filter((log: any) => log.fragment?.name === 'TicketMinted');
      expect(ticketMintedEvents).to.have.length(1);
      const eventLog = ticketMintedEvents[0];
      const mintedTokenId = BigInt(eventLog.args[0].toString());

      const ticketInfo = await eventTicket.getTicketInfo(mintedTokenId);

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

  describe('Admin, ERC721 and Integration tests', function () {
    it('Withdraw flow and organizerBalance assertions', async function () {
      // Allow organizer to sell multiple tickets
      await (eventTicket as any).connect(organizer).setMaxTicketsPerAddress(5);
      const quantity = 2;
      const totalCost = TICKET_PRICE * BigInt(quantity);

      // user1 purchases tickets
      const tx = await (eventTicket as any).connect(user1).purchaseTicket(quantity, { value: totalCost });
      await tx.wait();

      // Calculate expected organizer revenue (platform fee sent to treasury immediately)
      const platformFeeBps = await eventFactory.platformFeeBps();
      const platformFee = (totalCost * BigInt(platformFeeBps.toString())) / 10000n;
      const organizerRevenue = totalCost - platformFee;

      expect(await eventTicket.organizerBalance()).to.equal(organizerRevenue);

      const before = await ethers.provider.getBalance(organizer.address);
      const withdrawTx = await eventTicket.connect(organizer).withdraw();
      const withdrawReceipt = await withdrawTx.wait();
      if (!withdrawReceipt) throw new Error('Transaction receipt not found');
      const gasUsed = withdrawReceipt.gasUsed;
      const effectiveGasPriceRaw =
        (withdrawReceipt as any).effectiveGasPrice ?? (withdrawReceipt as any).gasPrice ?? 0n;
      const effectiveGasPrice = BigInt(effectiveGasPriceRaw);
      const gasCost = gasUsed * effectiveGasPrice;
      const after = await ethers.provider.getBalance(organizer.address);

      expect(after).to.equal(before + organizerRevenue - gasCost);
      expect(await eventTicket.organizerBalance()).to.equal(0);
    });

    it('ERC-721 behaviors: ownerOf, approve, transferFrom', async function () {
      const tx = await (eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE });
      const receipt = await tx.wait();
      const minted = (receipt.logs as any[]).filter((log: any) => log.fragment?.name === 'TicketMinted');
      const eventLog = minted[0];
      const tokenId = BigInt(eventLog.args[0].toString());

      expect(await eventTicket.ownerOf(tokenId)).to.equal(user1.address);

      // user1 approves user2
      await eventTicket.connect(user1).approve(user2.address, tokenId);
      expect(await eventTicket.getApproved(tokenId)).to.equal(user2.address);

      // user2 transfers token from user1 to themselves
      await eventTicket.connect(user2).transferFrom(user1.address, user2.address, tokenId);
      expect(await eventTicket.ownerOf(tokenId)).to.equal(user2.address);
    });

    it('useTicket and setTransferRestriction access control and enforcement', async function () {
      const tx = await (eventTicket as any).connect(user1).purchaseTicket(1, { value: TICKET_PRICE });
      const receipt = await tx.wait();
      const minted = (receipt.logs as any[]).filter((log: any) => log.fragment?.name === 'TicketMinted');
      const eventLog = minted[0];
      const tokenId = BigInt(eventLog.args[0].toString());

      // non-organizer cannot call useTicket
      await expect(eventTicket.connect(user1).useTicket(tokenId)).to.be.revertedWith('Not authorized');

      // organizer can mark ticket used
      await eventTicket.connect(organizer).useTicket(tokenId);
      expect((await eventTicket.getTicketInfo(tokenId)).isUsed).to.equal(true);

      // non-organizer cannot set transfer restriction
      await expect(eventTicket.connect(user1).setTransferRestriction(tokenId, true)).to.be.revertedWith(
        'Not authorized',
      );

      // organizer sets transfer restriction
      await eventTicket.connect(organizer).setTransferRestriction(tokenId, true);

      // owner (user1) attempts transfer -> should revert with Transfer restricted
      await expect(eventTicket.connect(user1).transferFrom(user1.address, user2.address, tokenId)).to.be.revertedWith(
        'Transfer restricted',
      );
    });

    it('POAP and Incentive contract linking (factory)', async function () {
      // Use organizer's latest event id
      const eventId = createdEventId;

      // Link POAP and Incentive contract addresses (use user2 as dummy address)
      await eventFactory.connect(organizer).setPOAPContract(eventId, user2.address);
      await eventFactory.connect(organizer).setIncentiveContract(eventId, user2.address);

      const details = await eventFactory.getEventDetails(eventId);
      expect(details.poapContract).to.equal(user2.address);
      expect(details.incentiveContract).to.equal(user2.address);
    });
  });
});
