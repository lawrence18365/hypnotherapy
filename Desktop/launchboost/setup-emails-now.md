# 15-MINUTE EMAIL SETUP FOR INDIESAASDEALS

## Step 1: Choose Resend (5 minutes)
1. Go to resend.com
2. Sign up with GitHub
3. Verify your domain (or use their test domain)
4. Copy API key
5. Add to .env.local: `RESEND_API_KEY=your_key`

## Step 2: Install Resend (1 minute)
```bash
npm install resend
```

## Step 3: Create Email Service (5 minutes)
Create `/src/lib/email-service.ts`:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'IndieSaasDeals <hello@yourdomain.com>';

export async function sendWelcomeEmail(email: string) {
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Welcome to IndieSaasDeals!',
    html: `
      <h1>Welcome to IndieSaasDeals!</h1>
      <p>Thanks for joining our community of SaaS deal hunters!</p>
      <p>We'll keep you updated on the best exclusive SaaS deals.</p>
    `
  });
}

export async function sendDealCodeEmail(email: string, dealTitle: string, code: string) {
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Your ${dealTitle} discount code`,
    html: `
      <h1>Your Discount Code</h1>
      <p>Here's your exclusive discount code for <strong>${dealTitle}</strong>:</p>
      <h2 style="background: #fbf55c; padding: 10px; border: 2px solid black;">${code}</h2>
      <p>Enjoy your savings!</p>
    `
  });
}
```

## Step 4: Update Your APIs (4 minutes)
Replace the TODO comments with actual email calls:

In `/api/newsletter/subscribe/route.ts` line 56:
```typescript
import { sendWelcomeEmail } from '@/lib/email-service';
// Replace TODO line with:
await sendWelcomeEmail(email);
```

In `/api/deals/[slug]/claim/route.ts` line 123:
```typescript
import { sendDealCodeEmail } from '@/lib/email-service';
// Replace TODO line with:
await sendDealCodeEmail(userEmail, deal.title, code.code);
```

## DONE! 
Total time: 15 minutes
Cost: FREE (3,000 emails/month)
Your platform now sends emails!

## Launch Checklist:
- [ ] Resend account created
- [ ] API key added to .env.local
- [ ] Email service file created  
- [ ] APIs updated
- [ ] Test email sent

YOU'RE READY TO LAUNCH!