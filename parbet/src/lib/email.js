import emailjs from '@emailjs/browser';
export const sendVerificationEmail = async (email, code) => {
    try {
        await emailjs.send(
            import.meta.env.VITE_EMAILJS_SERVICE_ID,
            import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
            { to_email: email, verification_code: code },
            import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
        return { success: true };
    } catch (e) { console.error('EmailJS Error:', e); return { success: false }; }
};