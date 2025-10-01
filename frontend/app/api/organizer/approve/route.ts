import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Organizer approval request received:', body);

    const { organizerAddress, paymentMethod, amount } = body;

    // Validate input
    if (!organizerAddress || !ethers.isAddress(organizerAddress)) {
      return NextResponse.json(
        { error: 'Invalid organizer address' },
        { status: 400 }
      );
    }

    // Check environment variables
    const multibaasEndpoint = process.env.MULTIBAAS_ENDPOINT || 'https://kwp44rxeifggriyd4hmbjq7dey.multibaas.com';
    const multibaasAdminKey = process.env.MULTIBAAS_ADMIN_KEY;

    if (!multibaasAdminKey) {
      console.error('MULTIBAAS_ADMIN_KEY not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Processing organizer approval for:', organizerAddress);

    // Use MultiBaas to call selfVerifyOrganizer with payment
    console.log('Calling selfVerifyOrganizer via MultiBaas...');

    const verificationResponse = await fetch(`${multibaasEndpoint}/api/v0/chains/eip155-84532/contracts/eventfactory/selfVerifyOrganizer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${multibaasAdminKey}`,
      },
      body: JSON.stringify({
        args: [organizerAddress],
        from: organizerAddress, // User calls this themselves
        value: '2000000000000000', // 0.002 ETH in wei - updated verification fee
      }),
    });

    if (!verificationResponse.ok) {
      const errorData = await verificationResponse.json();
      console.error('MultiBaas verification API error:', errorData);
      return NextResponse.json(
        { error: `Verification failed: ${errorData.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const verificationResult = await verificationResponse.json();
    console.log('MultiBaas verification API result:', verificationResult);

    console.log('Organizer verification request submitted successfully');

    return NextResponse.json({
      success: true,
      message: 'Organizer verification request submitted',
      organizerAddress
    });

  } catch (error) {
    console.error('Organizer approval error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}