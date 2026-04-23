// api/verify-payment.js
import crypto from 'crypto';

/**
 * PARBET SECURE PAYMENT VERIFICATION GATEWAY
 * Purpose: Cryptographically validates the authenticity of Razorpay web checkout success callbacks.
 * Logic: Implements HMAC-SHA256 to ensure data payload integrity before authorizing database mutations.
 */
export default async function handler(req, res) {
  // CORS configuration for cross-origin frontend requests
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Strict method gate
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method Not Allowed. Verification requires a POST request.' 
    });
  }

  try {
    // 1. Extract the payment envelope from the frontend
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 2. Strict Payload Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.warn("[Parbet Security] Verification attempt rejected due to missing cryptographic parameters.");
      return res.status(400).json({ 
        success: false, 
        message: 'Malformed Request: Missing required payment parameters.' 
      });
    }

    // 3. Server-Side Secret Acquisition
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      console.error('[Parbet API Critical] RAZORPAY_KEY_SECRET is undefined in the server environment.');
      return res.status(500).json({ 
        success: false, 
        message: 'Internal Gateway Error. Unable to process verification.' 
      });
    }

    // 4. Construct the Canonical Payload
    // Razorpay standard dictates the exact format: order_id + "|" + payment_id
    const generated_signature_payload = razorpay_order_id + '|' + razorpay_payment_id;

    // 5. Execute HMAC-SHA256 Cryptography
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(generated_signature_payload.toString())
      .digest('hex');

    // 6. Signature Reconciliation
    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      console.log(`[Parbet Ledger] Signature verified successfully for Order: ${razorpay_order_id}`);
      
      return res.status(200).json({
        success: true,
        message: 'Transaction cryptographically verified and authentic.',
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        }
      });
    } else {
      console.error(`[Parbet Security Alert] Signature mismatch detected for Order: ${razorpay_order_id}. Potential tampering.`);
      return res.status(400).json({ 
        success: false, 
        message: 'Transaction Failed: Cryptographic signature mismatch.' 
      });
    }
  } catch (error) {
    console.error('[Parbet API] Unhandled exception during payment verification:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error during transaction reconciliation.' 
    });
  }
}