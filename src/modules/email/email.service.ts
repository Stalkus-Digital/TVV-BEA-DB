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
        return err(new InternalError("SMTP is not configured in the environment variables. Cannot send email."));
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
}
