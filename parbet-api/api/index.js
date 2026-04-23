const admin = require('firebase-admin');
const { Resend } = require('resend');
const cors = require('cors')({ origin: true });

// FEATURE 1: Strict Environment Variable Guards
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.error("CRITICAL: FIREBASE_SERVICE_ACCOUNT environment variable is missing in Vercel.");
}
if (!process.env.RESEND_API_KEY) {
    console.error("CRITICAL: RESEND_API_KEY environment variable is missing in Vercel.");
}

/**
 * FEATURE 2: Secure Firebase Admin Initialization
 * Uses a singleton pattern to prevent multiple initializations during Vercel cold starts.
 * Security: Credentials are pulled strictly from the encrypted Vercel Environment Variables.
 */
if (!admin.apps.length && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized Successfully.");
    } catch (error) {
        console.error("CRITICAL: Firebase Admin Initialization Failed. Check JSON string format in Vercel.", error.message);
    }
}

/**
 * FEATURE 3: Resend SDK Initialization
 */
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

module.exports = async (req, res) => {
    // Handle Cross-Origin Resource Sharing (CORS) for Parbet Frontend Apps
    cors(req, res, async () => {
        
        // FEATURE 4: Strict Method Guard
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed. This endpoint strictly requires a POST request.' });
        }

        // FEATURE 5: Runtime Dependency Check
        if (!admin.apps.length || !resend) {
            console.error("Endpoint Execution Blocked: Server misconfiguration detected.");
            return res.status(500).json({ error: 'Server misconfiguration. Environment variables for Firebase or Resend are missing or invalid.' });
        }

        const { email, name } = req.body;

        // FEATURE 6: Input Validation
        if (!email) {
            return res.status(400).json({ error: 'Email address is required.' });
        }

        // FEATURE 7: Request Path Routing Engine
        // Extracts the target route from the rewritten Vercel URL
        const urlPath = req.url.split('?')[0];
        const appName = "Parbet";

        try {
            // ROUTE A: PASSWORD RECOVERY PIPELINE
            if (urlPath.includes('/api/resetPassword')) {
                const resetLink = await admin.auth().generatePasswordResetLink(email);
                
                const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                    <div style="display: none; max-height: 0px; overflow: hidden;">Securely reset your ${appName} account password.</div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e2e2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="text-align: center; padding: 30px 20px; border-bottom: 4px solid #8cc63f; background-color: #ffffff;">
                            <h2 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px;">
                                <span style="color: #54626c;">par</span><span style="color: #8cc63f;">bet</span>
                            </h2>
                        </div>
                        <div style="padding: 40px 40px 10px; text-align: center;">
                            <h1 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 800;">Reset Your Password</h1>
                        </div>
                        <div style="padding: 10px 40px;">
                            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello,</p>
                            <p style="color: #54626c; font-size: 16px; line-height: 1.6; margin-bottom: 0;">We received a request to access your ${appName} account (<strong>${email}</strong>). Click the button below to safely create a new password.</p>
                        </div>
                        <div style="padding: 35px 40px; text-align: center;">
                            <a href="${resetLink}" style="background-color: #458731; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Change Password</a>
                        </div>
                        <div style="padding: 0 40px 20px; text-align: center;">
                            <p style="color: #c21c3a; font-size: 13px; margin: 0; font-weight: 700;">&#9888; Security Link: Expires in 1 hour.</p>
                        </div>
                        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 40px; border: 1px solid #eaebed; word-break: break-all;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px; font-weight: 600; text-transform: uppercase;">Trouble with the button?</p>
                            <p style="margin: 0;"><a href="${resetLink}" style="color: #2563eb; font-size: 13px; text-decoration: underline;">${resetLink}</a></p>
                        </div>
                        <div style="padding: 10px 40px 30px;">
                            <p style="color: #1f2937; font-size: 14px; margin-bottom: 5px; font-weight: 700;">Didn't make this request?</p>
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-top: 0;">If you did not request a password change, please ignore this message. Your account remains secure.</p>
                        </div>
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

                const { error } = await resend.emails.send({
                    from: 'Parbet Security <onboarding@resend.dev>',
                    to: [email],
                    reply_to: 'auth.parbet@outlook.com',
                    subject: `Security: Password Reset for ${appName}`,
                    html: htmlContent,
                });

                if (error) {
                    console.error("Resend API Dispatch Error:", JSON.stringify(error, null, 2));
                    return res.status(500).json({ error: 'Resend API failed to dispatch the email. Please check Vercel Logs.' });
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Password reset link dispatched via Resend Sandbox.',
                    details: 'Delivered to verified sandbox recipient.'
                });

            } 
            
            // ROUTE B: EMAIL VERIFICATION PIPELINE
            else if (urlPath.includes('/api/sendVerification')) {
                const verificationLink = await admin.auth().generateEmailVerificationLink(email);
                const displayName = name || 'User';
                
                const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
                    <div style="display: none; max-height: 0px; overflow: hidden;">Verify your ${appName} account email address.</div>
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e2e2e2; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                        <div style="text-align: center; padding: 30px 20px; border-bottom: 4px solid #8cc63f; background-color: #ffffff;">
                            <h2 style="margin: 0; font-size: 36px; font-weight: 900; letter-spacing: -1.5px;">
                                <span style="color: #54626c;">par</span><span style="color: #8cc63f;">bet</span>
                            </h2>
                        </div>
                        <div style="padding: 40px 40px 10px; text-align: center;">
                            <h1 style="color: #1a1a1a; margin: 0; font-size: 26px; font-weight: 800;">Verify Your Account</h1>
                        </div>
                        <div style="padding: 10px 40px;">
                            <p style="color: #1a1a1a; font-size: 16px; line-height: 1.6; margin-bottom: 15px;">Hello ${displayName},</p>
                            <p style="color: #54626c; font-size: 16px; line-height: 1.6; margin-bottom: 0;">Welcome to ${appName}! Please verify your email address (<strong>${email}</strong>) by clicking the button below to unlock full access to the marketplace.</p>
                        </div>
                        <div style="padding: 35px 40px; text-align: center;">
                            <a href="${verificationLink}" style="background-color: #458731; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Verify Email Address</a>
                        </div>
                        <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin: 20px 40px; border: 1px solid #eaebed; word-break: break-all;">
                            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px; font-weight: 600; text-transform: uppercase;">Trouble with the button?</p>
                            <p style="margin: 0;"><a href="${verificationLink}" style="color: #2563eb; font-size: 13px; text-decoration: underline;">${verificationLink}</a></p>
                        </div>
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

                const { error } = await resend.emails.send({
                    from: 'Parbet Security <onboarding@resend.dev>',
                    to: [email],
                    reply_to: 'auth.parbet@outlook.com',
                    subject: `Security: Verify your ${appName} Account`,
                    html: htmlContent,
                });

                if (error) {
                    console.error("Resend API Dispatch Error:", JSON.stringify(error, null, 2));
                    return res.status(500).json({ error: 'Resend API failed to dispatch the email. Please check Vercel Logs.' });
                }

                return res.status(200).json({ 
                    success: true, 
                    message: 'Verification link dispatched via Resend Sandbox.',
                });
            } 
            
            // CATCH-ALL ROUTE (404)
            else {
                return res.status(404).json({ error: 'API route not found. Master function intercepted an unknown path.' });
            }

        } catch (error) {
            console.error('Critical Backend Pipeline Failure:', error.message);
            console.error(error.stack);
            return res.status(500).json({ error: 'Failed to process request due to server logic error. Check Vercel logs.' });
        }
    });
};