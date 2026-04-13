const admin = require('firebase-admin');
const { Resend } = require('resend');
const cors = require('cors')({ origin: true });

/**
 * FEATURE 1: Secure Firebase Admin Initialization
 * Uses a singleton pattern to prevent multiple initializations during Vercel cold starts.
 * Security: Credentials are pulled strictly from the encrypted Vercel Environment Variables.
 */
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("CRITICAL: Firebase Admin Initialization Failed. Check FIREBASE_SERVICE_ACCOUNT env var string format.");
    }
}

/**
 * FEATURE 2: Resend SDK Initialization
 */
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
    // Handle Cross-Origin Resource Sharing (CORS) for Parbet Frontend Apps
    cors(req, res, async () => {
        
        // FEATURE 3: Strict Method Guard
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed. This endpoint strictly requires a POST request.' });
        }

        const { email } = req.body;

        // FEATURE 4: Input Validation
        if (!email) {
            return res.status(400).json({ error: 'Email address is required to process the reset request.' });
        }

        try {
            /**
             * FEATURE 5: Generate Secure Reset Link
             * Uses the Admin SDK to create the official OOB (Out-Of-Band) code.
             * This allows us to use custom HTML templates instead of Firebase's locked ones.
             */
            const resetLink = await admin.auth().generatePasswordResetLink(email);
            const appName = "Parbet";

            /**
             * FEATURE 6: Enterprise 9-Section HTML Template
             * Fully responsive, branded design with accessibility support.
             */
            const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                <!-- SECTION 1: Preheader -->
                <div style="display: none; max-height: 0px; overflow: hidden;">Securely reset your ${appName} account password.</div>

                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e2e2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    
                    <!-- SECTION 2: Header -->
                    <div style="text-align: center; padding: 30px 20px; border-bottom: 4px solid #8cc63f; background-color: #ffffff;">
                        <h2 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px;">
                            <span style="color: #54626c;">par</span><span style="color: #8cc63f;">bet</span>
                        </h2>
                    </div>

                    <!-- SECTION 3: Hero Area -->
                    <div style="padding: 40px 40px 10px; text-align: center;">
                        <h1 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 800;">Reset Your Password</h1>
                    </div>

                    <!-- SECTION 4: Contextual Greeting -->
                    <div style="padding: 10px 40px;">
                        <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello,</p>
                        <p style="color: #54626c; font-size: 16px; line-height: 1.6; margin-bottom: 0;">We received a request to access your ${appName} account (<strong>${email}</strong>). Click the button below to safely create a new password.</p>
                    </div>

                    <!-- SECTION 5: Primary Action (CTA) -->
                    <div style="padding: 35px 40px; text-align: center;">
                        <a href="${resetLink}" style="background-color: #458731; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Change Password</a>
                    </div>

                    <!-- SECTION 6: Security Notice -->
                    <div style="padding: 0 40px 20px; text-align: center;">
                        <p style="color: #c21c3a; font-size: 13px; margin: 0; font-weight: 700;">&#9888; Security Link: Expires in 1 hour.</p>
                    </div>

                    <!-- SECTION 7: Fallback URL -->
                    <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 40px; border: 1px solid #eaebed; word-break: break-all;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px; font-weight: 600; text-transform: uppercase;">Trouble with the button?</p>
                        <p style="margin: 0;"><a href="${resetLink}" style="color: #2563eb; font-size: 13px; text-decoration: underline;">${resetLink}</a></p>
                    </div>

                    <!-- SECTION 8: Disclaimer -->
                    <div style="padding: 10px 40px 30px;">
                        <p style="color: #1f2937; font-size: 14px; margin-bottom: 5px; font-weight: 700;">Didn't make this request?</p>
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 0;">If you did not request a password change, please ignore this message. Your account remains secure.</p>
                    </div>

                    <!-- SECTION 9: Legal Footer -->
                    <div style="padding: 35px 20px; border-top: 1px solid #f3f4f6; background-color: #fcfcfc; text-align: center;">
                        <p style="color: #111827; font-size: 14px; margin: 0 0 5px;">Best regards,</p>
                        <p style="color: #111827; font-size: 14px; font-weight: 800; margin: 0 0 25px;">The ${appName} Global Security Team</p>
                        <p style="color: #9ca3af; font-size: 12px; margin: 0; line-height: 1.5;">
                            &copy; 2026 ${appName} Technologies. All rights reserved.<br>
                            This is an automated security notification.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `;

            /**
             * FEATURE 7: Dispatch via Resend Sandbox Engine
             * MANDATORY: Since no domain is owned, 'from' MUST be exactly 'onboarding@resend.dev'
             * NOTE: Emails will only be delivered to your signup email (testcodecfg@gmail.com)
             */
            const { data, error } = await resend.emails.send({
                from: 'Parbet Security <onboarding@resend.dev>',
                to: [email],
                reply_to: 'auth.parbet@outlook.com',
                subject: `Security: Password Reset for ${appName}`,
                html: htmlContent,
            });

            if (error) {
                console.error("Resend Sandbox Dispatch Error:", error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ 
                success: true, 
                message: 'Password reset link dispatched via Resend Sandbox.',
                details: 'Delivered to verified sandbox recipient.'
            });

        } catch (error) {
            console.error('Critical Backend Pipeline Failure:', error);
            return res.status(500).json({ error: 'Failed to process security request. Please check server logs.' });
        }
    });
};