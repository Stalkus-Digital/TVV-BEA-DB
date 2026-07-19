import { BaseService, type ServiceContext } from "@/shared/services";
import { ok, err, type Result } from "@/shared/types";
import { InternalError, type AppError } from "@/shared/errors";
import nodemailer from "nodemailer";

export interface SendEmailDto {
  to: string;
  subject: string;
  html: string;
}

export class EmailService extends BaseService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(context: ServiceContext) {
    super(context);

    // Use SMTP configuration if provided, otherwise mock it for development
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(data: SendEmailDto): Promise<Result<void, AppError>> {
    try {
      if (!this.transporter) {
        // Dev fallback: log instead of failing hard so local flows remain usable.
        this.logger.warn("SMTP is not configured — logging email instead of sending", {
          to: data.to,
          subject: data.subject,
        });
        this.logger.info("Email body (dev)", { html: data.html });
        return ok(undefined);
      }

      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || '"TVV Travel OS" <noreply@thevacationvoice.com>',
        to: data.to,
        subject: data.subject,
        html: data.html,
      });
      this.logger.info("Email sent successfully", { to: data.to, subject: data.subject });
      return ok(undefined);
    } catch (error) {
      this.logger.error("Failed to send email", { error, to: data.to });
      return err(new InternalError("Failed to send email"));
    }
  }

  async sendBookingConfirmation(email: string, bookingNumber: string, amountPaid: number, currency: string): Promise<Result<void, AppError>> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto border p-6 rounded-lg">
        <h2 style="color: #0f766e;">Booking Confirmed!</h2>
        <p>Dear Traveler,</p>
        <p>Your payment of <strong>${currency} ${amountPaid}</strong> has been successfully processed.</p>
        <p>Your Booking Reference is: <strong>${bookingNumber}</strong></p>
        <p>We are currently finalizing your travel arrangements with our suppliers. You will receive your final vouchers shortly.</p>
        <br/>
        <p>Thank you for choosing The Vacation Voice.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmation: ${bookingNumber}`,
      html,
    });
  }

  async sendEmailVerification(email: string, verifyUrl: string): Promise<Result<void, AppError>> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto border p-6 rounded-lg">
        <h2 style="color: #0f766e;">Verify your email</h2>
        <p>Welcome to The Vacation Voice.</p>
        <p>Please confirm your email address to activate your customer account.</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background:#0f766e;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;">
            Verify email
          </a>
        </p>
        <p style="color:#666;font-size:13px;">If the button does not work, copy and paste this link into your browser:</p>
        <p style="color:#666;font-size:13px;word-break:break-all;">${verifyUrl}</p>
        <p style="color:#666;font-size:13px;">This link expires in 24 hours.</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Verify your The Vacation Voice account",
      html,
    });
  }

  async sendPasswordReset(email: string, resetUrl: string): Promise<Result<void, AppError>> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-w-xl mx-auto border p-6 rounded-lg">
        <h2 style="color: #0f766e;">Reset your password</h2>
        <p>We received a request to reset the password for your The Vacation Voice account.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#0f766e;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block;">
            Reset password
          </a>
        </p>
        <p style="color:#666;font-size:13px;">If you did not request this, you can ignore this email.</p>
        <p style="color:#666;font-size:13px;word-break:break-all;">${resetUrl}</p>
      </div>
    `;
    return this.sendEmail({
      to: email,
      subject: "Reset your The Vacation Voice password",
      html,
    });
  }
}
