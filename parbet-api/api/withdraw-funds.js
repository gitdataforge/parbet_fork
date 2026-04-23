import crypto from 'crypto';

export default async function handler(req, res) {
  // Enforce POST method for transaction security
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method Not Allowed. Please use POST for withdrawal requests.'
    });
  }

  try {
    const { 
      seller_id, 
      fund_account_id, 
      amount_in_rupees, 
      payout_mode, 
      narration 
    } = req.body;

    // Strict validation of required fields
    if (!seller_id || !fund_account_id || !amount_in_rupees || !payout_mode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: seller_id, fund_account_id, amount_in_rupees, or payout_mode.'
      });
    }

    // Validate payout mode against RazorpayX supported modes
    const validModes = ['NEFT', 'RTGS', 'IMPS', 'UPI'];
    if (!validModes.includes(payout_mode.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payout mode. Supported modes are NEFT, RTGS, IMPS, UPI.'
      });
    }

    // Convert amount to paise (Razorpay standard)
    const amount_in_paise = parseInt(amount_in_rupees) * 100;
    
    if (amount_in_paise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is 1 INR.'
      });
    }

    // Verify environment variables are present
    const razorpayXKeyId = process.env.RAZORPAYX_KEY_ID;
    const razorpayXKeySecret = process.env.RAZORPAYX_KEY_SECRET;
    const razorpayXAccountNumber = process.env.RAZORPAYX_ACCOUNT_NUMBER;

    if (!razorpayXKeyId || !razorpayXKeySecret || !razorpayXAccountNumber) {
      console.error('Server configuration error: RazorpayX credentials missing.');
      return res.status(500).json({
        success: false,
        message: 'Internal server configuration error.'
      });
    }

    // Generate a unique reference ID for idempotency and tracking
    const referenceId = `payout_${seller_id}_${crypto.randomUUID().replace(/-/g, '').substring(0, 16)}`;

    // Here you MUST insert real database logic to verify the seller has sufficient wallet balance.
    // Example: const sellerBalance = await database.wallets.getBalance(seller_id);
    // if (sellerBalance < amount_in_rupees) { throw new Error('Insufficient funds'); }
    // IMPORTANT: Deduct the balance or lock the funds in the database BEFORE calling RazorpayX to prevent double-spending.
    // Example: await database.wallets.lockFunds(seller_id, amount_in_rupees, referenceId);

    // Construct the RazorpayX Payout payload
    const payoutPayload = {
      account_number: razorpayXAccountNumber,
      fund_account_id: fund_account_id,
      amount: amount_in_paise,
      currency: 'INR',
      mode: payout_mode.toUpperCase(),
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: referenceId,
      narration: narration || 'Seller Wallet Withdrawal'
    };

    // Create Basic Authentication header
    const authString = Buffer.from(`${razorpayXKeyId}:${razorpayXKeySecret}`).toString('base64');

    // Execute the live transaction to RazorpayX API
    const response = await fetch('https://api.razorpay.com/v1/payouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payoutPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      // Transaction failed at Razorpay level.
      // Revert the locked funds in the database here.
      // Example: await database.wallets.unlockFunds(seller_id, amount_in_rupees, referenceId);
      
      console.error('RazorpayX Payout Error:', data);
      return res.status(response.status).json({
        success: false,
        message: 'Payout initiation failed with RazorpayX.',
        error: data.error || data
      });
    }

    // Transaction successfully initiated or queued by RazorpayX.
    // Confirm the deduction in the database and save the Razorpay payout ID.
    // Example: await database.transactions.recordPayout(seller_id, data.id, referenceId, 'PROCESSING');

    return res.status(200).json({
      success: true,
      message: 'Withdrawal initiated successfully.',
      data: {
        payoutId: data.id,
        status: data.status,
        referenceId: data.reference_id,
        amountTransferred: amount_in_rupees
      }
    });

  } catch (error) {
    console.error('Exception during fund withdrawal:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error during withdrawal process.'
    });
  }
}