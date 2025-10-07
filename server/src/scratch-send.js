
import 'dotenv/config';
import { sendTemplate } from './emails/mailer.js';

await sendTemplate(
  'forgotPasswordOTP',
  'arbababby111@gmail.com',
  { name: 'Arbab', otp: '123456', expiryMinutes: 15 }
);

console.log('Email sent ✅');
