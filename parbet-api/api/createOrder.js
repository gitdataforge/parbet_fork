// api/create-order.js
const Razorpay = require('razorpay');

/**
 * PARBET SECURE ORDER GATEWAY
 * Purpose: Generates unique Order IDs for Listing Fees and Wallet Transactions.
 * Logic: Strictly enforces integer paise values and server-side secret management.
 */
export default async function handler(req, res) {
    // CORS configuration for cross-origin frontend requests
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Handle preflight pre-authorization
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Strict method gate
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            message: 'Method Not Allowed. This endpoint requires a POST request containing transaction details.' 
        });
    }

    try {
        const { amount, currency = 'INR', receipt, notes } = req.body;

        // 1. Transaction Integrity Validation
        if (!amount || isNaN(amount) || amount < 100) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid transaction volume. The minimum allowable amount is 100 paise (₹1).' 
            });
        }

        // 2. Server-Side Credential Verification
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("[Parbet API Critical] Razorpay Environment Keys are undefined.");
            return res.status(500).json({ 
                success: false, 
                message: 'Gateway configuration error. Please contact Parbet system administration.' 
            });
        }

        // 3. Razorpay SDK Initialization
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // 4. Order Payload Construction
        // We use 'notes' to carry metadata like 'type: listing_fee' or 'type: wallet_deposit'
        // This metadata is cryptographically bound to the order ID in the Razorpay cloud.
        const options = {
            amount: Math.round(amount), 
            currency: currency,
            receipt: receipt || `prbt_rcpt_${Date.now()}`,
            notes: notes || {
                platform: "Parbet Seller Dashboard",
                timestamp: new Date().toISOString()
            }
        };

        // 5. Razorpay Cloud Execution
        const order = await razorpay.orders.create(options);

        if (!order || !order.id) {
            throw new Error("Razorpay upstream failed to provide a valid order object.");
        }

        // 6. Success Response
        // We return the full order object which includes the secure ID required by the frontend modal.
        return res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt
        });

    } catch (error) {
        console.error("[Parbet API] Secure Order Generation Failure:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal Gateway Error. Unable to generate a secure transaction ID.',
            error_code: error.code || 'GATEWAY_TIMEOUT'
        });
    }
}