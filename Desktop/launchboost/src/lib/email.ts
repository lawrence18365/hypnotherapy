import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// For production, use your custom domain email
// For now, we'll use the resend.dev domain for testing
const FROM_EMAIL = process.env.NODE_ENV === 'production' 
  ? 'IndieSaasDeals <hello@indiesaasdeals.com>' 
  : 'IndieSaasDeals <onboarding@resend.dev>';

export async function sendWelcomeEmail(email: string, name?: string) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to IndieSaasDeals! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; margin-bottom: 20px;">Welcome to IndieSaasDeals!</h1>
          
          <p>Hey ${name ? name : 'there'}! 👋</p>
          
          <p>Thanks for joining our community of indie hackers and SaaS enthusiasts!</p>
          
          <p>Here's what you can expect:</p>
          <ul>
            <li>🎯 <strong>Exclusive SaaS deals</strong> curated for indie hackers</li>
            <li>💰 <strong>Save up to 90%</strong> on tools you actually need</li>
            <li>🚀 <strong>Discover new tools</strong> before they get expensive</li>
            <li>🏆 <strong>Support indie founders</strong> like yourself</li>
          </ul>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🔥 Browse Active Deals</h3>
            <p>Check out our current deals and start saving today!</p>
            <a href="https://indiesaasdeals.com/deals" 
               style="background: #000; color: #fbf55c; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              View Deals →
            </a>
          </div>
          
          <p>Questions? Just reply to this email - we read every message!</p>
          
          <p>Happy deal hunting! 🎯</p>
          
          <p>The IndieSaasDeals Team</p>
          
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            You're receiving this because you signed up for IndieSaasDeals. 
            <a href="https://indiesaasdeals.com" style="color: #666;">Visit our website</a>
          </p>
        </div>
      `
    });

    console.log('Welcome email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

export async function sendDealCodeEmail(email: string, dealTitle: string, code: string, instructions?: string) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your ${dealTitle} discount code 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; margin-bottom: 20px;">Your Discount Code is Ready! 🎉</h1>
          
          <p>Awesome choice! Here's your exclusive discount code for <strong>${dealTitle}</strong>:</p>
          
          <div style="background: #fbf55c; border: 3px solid #000; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
            <h2 style="font-size: 28px; margin: 0; color: #000; letter-spacing: 2px; font-family: monospace;">
              ${code}
            </h2>
          </div>
          
          ${instructions ? `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">📋 How to Redeem</h3>
            <p>${instructions}</p>
          </div>
          ` : ''}
          
          <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Save this email! Your code might be useful later if you need support or have questions about the product.</p>
          </div>
          
          <p>Enjoy your savings, and don't forget to check back for more exclusive deals!</p>
          
          <p>Happy building! 🚀</p>
          
          <p>The IndieSaasDeals Team</p>
          
          <hr style="margin: 30px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            This code was requested from your IndieSaasDeals account. 
            <a href="https://indiesaasdeals.com" style="color: #666;">Browse more deals</a>
          </p>
        </div>
      `
    });

    console.log('Deal code email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send deal code email:', error);
    return { success: false, error };
  }
}

export async function sendPaymentConfirmationEmail(email: string, amount: number, description: string) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Payment Confirmed - IndieSaasDeals ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; margin-bottom: 20px;">Payment Confirmed! ✅</h1>
          
          <p>Your payment has been successfully processed:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)} USD</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your listing will be processed and go live within 24 hours. We'll notify you once it's active!</p>
          
          <p>Thanks for choosing IndieSaasDeals! 🚀</p>
          
          <p>The IndieSaasDeals Team</p>
        </div>
      `
    });

    console.log('Payment confirmation email sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    return { success: false, error };
  }
}

export async function sendAdminNotification(subject: string, message: string) {
  try {
    const adminEmail = 'lawrencebrennan@gmail.com'; // Your admin email
    
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `[IndieSaasDeals Admin] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #000; margin-bottom: 20px;">Admin Notification</h1>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px;">
            <h3 style="margin-top: 0;">${subject}</h3>
            <p>${message}</p>
          </div>
          
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          
          <p><a href="https://indiesaasdeals.com/admin" style="background: #000; color: #fbf55c; padding: 10px 20px; text-decoration: none; border-radius: 6px;">View Admin Dashboard →</a></p>
        </div>
      `
    });

    console.log('Admin notification sent successfully:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return { success: false, error };
  }
}