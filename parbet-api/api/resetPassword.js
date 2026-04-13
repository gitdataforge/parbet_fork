const admin = require('firebase-admin');
const sgMail = require('@sendgrid/mail');
const cors = require('cors')({ origin: true }); // Allows cross-origin requests from your React apps

// FEATURE 1: Secure Firebase Admin Initialization (Cold-Start Safe)
if (!admin.apps.length) {
    try {
        // The service account JSON must be injected via Vercel Environment Variables
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("CRITICAL: Firebase Admin Initialization Failed. Ensure FIREBASE_SERVICE_ACCOUNT is set as a valid JSON string in Vercel.");
    }
}

// FEATURE 2: Secure SendGrid Initialization
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = async (req, res) => {
    // Wrap the entire function in the CORS middleware to handle preflight OPTIONS requests
    cors(req, res, async () => {
        // FEATURE 3: Strict Method Guard
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
        }

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email address is required.' });
        }

        try {
            // FEATURE 4: Generate Secure Firebase Password Reset Link via Admin SDK
            const resetLink = await admin.auth().generatePasswordResetLink(email);

            const appName = "Parbet";

            // FEATURE 5: Inject Link into 1:1 Enterprise 9-Section HTML Template
            const htmlContent = `
            <!-- SECTION 1: Hidden Preheader (For Email Client Previews) -->
            <div style="display: none; max-height: 0px; overflow: hidden;">Securely reset your ${appName} password inside.</div>

            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e2e2; border-radius: 8px; overflow: hidden;">
                
                <!-- SECTION 2: Brand Header -->
                <div style="text-align: center; padding: 25px 0; border-bottom: 3px solid #f8f9fa;">
                    <h2 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px;">
                        <span style="color: #54626c;">par</span><span style="color: #8cc63f;">bet</span>
                    </h2>
                </div>

                <!-- SECTION 3: Hero Title -->
                <div style="padding: 30px 30px 10px; text-align: center;">
                    <h1 style="color: #1a1a1a; margin: 0; font-size: 24px; font-weight: bold;">Password Reset Request</h1>
                </div>

                <!-- SECTION 4: Greeting & Main Context -->
                <div style="padding: 10px 30px;">
                    <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello,</p>
                    <p style="color: #54626c; font-size: 16px; line-height: 1.6; margin-bottom: 0;">We received a request to reset the password associated with your ${appName} account (<strong>${email}</strong>). You can securely set a new password by clicking the button below.</p>
                </div>

                <!-- SECTION 5: Primary Call to Action -->
                <div style="padding: 25px 30px; text-align: center;">
                    <a href="${resetLink}" style="background-color: #458731; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Reset My Password</a>
                </div>

                <!-- SECTION 6: Time Sensitivity / Urgency Warning -->
                <div style="padding: 0 30px 15px; text-align: center;">
                    <p style="color: #c21c3a; font-size: 13px; margin: 0; font-weight: bold;">&#9888; For your security, this link will expire shortly.</p>
                </div>

                <!-- SECTION 7: Fallback Raw Link -->
                <div style="padding: 15px 20px; background-color: #f8f9fa; border-radius: 6px; margin: 15px 30px; word-break: break-all; border: 1px solid #e2e2e2;">
                    <p style="color: #54626c; font-size: 13px; margin: 0 0 8px; font-weight: bold;">If the button doesn't work, copy and paste this link into your browser:</p>
                    <p style="margin: 0;"><a href="${resetLink}" style="color: #0064d2; font-size: 13px;">${resetLink}</a></p>
                </div>

                <!-- SECTION 8: Security & Ignorability Disclaimer -->
                <div style="padding: 15px 30px;">
                    <p style="color: #1a1a1a; font-size: 14px; margin-bottom: 5px; font-weight: bold;">Didn't request this change?</p>
                    <p style="color: #54626c; font-size: 14px; line-height: 1.5; margin-top: 0;">If you didn't ask to reset your password, you can safely ignore this email. Your account is completely secure and your password will not be changed.</p>
                </div>

                <!-- SECTION 9: Sign-off & Legal Footer -->
                <div style="padding: 30px; border-top: 1px solid #e2e2e2; margin-top: 10px; background-color: #f8f9fa; text-align: center;">
                    <p style="color: #1a1a1a; font-size: 14px; margin: 0 0 5px;">Thanks,</p>
                    <p style="color: #1a1a1a; font-size: 14px; font-weight: bold; margin: 0 0 20px;">The ${appName} Trust & Safety Team</p>
                    <p style="color: #a0a0a0; font-size: 12px; margin: 0; line-height: 1.4;">
                        &copy; 2026 ${appName}. All rights reserved.<br>
                        Secure Ticketing Marketplace
                    </p>
                </div>

            </div>
            `;

            // FEATURE 6: Configure SendGrid Dispatch Payload
            const msg = {
                to: email,
                from: {
                    email: 'noreply@parbet-44902.firebaseapp.com', // CRITICAL: This email MUST be verified in your SendGrid account sender settings
                    name: 'Parbet Security'
                },
                replyTo: 'auth.parbet@outlook.com',
                subject: `Password Reset Request - ${appName}`,
                html: htmlContent,
            };

            // FEATURE 7: Dispatch via SendGrid
            await sgMail.send(msg);

            return res.status(200).json({ success: true, message: 'Password reset link securely generated and dispatched via SendGrid.' });

        } catch (error) {
            console.error('Password Reset Pipeline Error:', error);
            // Return a generic error to the frontend to prevent enumeration, but log the strict failure securely in Vercel logs
            return res.status(500).json({ error: 'Failed to process password reset request. Ensure SendGrid Sender is verified.' });
        }
    });
};