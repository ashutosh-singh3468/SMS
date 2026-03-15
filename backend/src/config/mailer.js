import nodemailer from 'nodemailer';
import { env } from './env.js';

const hasSmtp = env.smtpHost && env.smtpUser && env.smtpPass;

export const mailer = hasSmtp
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

export async function sendVerificationEmail(email, token) {
  const verificationUrl = `${env.frontendUrl}/verify-email?token=${token}`;
  const subject = 'Verify your Care Pulse account';
  const text = `Welcome to Care Pulse. Verify your account by opening this link: ${verificationUrl}`;

  if (!mailer) {
    console.info(`[SMTP not configured] Verification link for ${email}: ${verificationUrl}`);
    return;
  }

  await mailer.sendMail({
    from: env.smtpFrom,
    to: email,
    subject,
    text,
  });
}
