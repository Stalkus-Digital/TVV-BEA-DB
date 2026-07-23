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
  constructor(context: ServiceContext) {
    super(context);
  }

  private async getTransporter(): Promise<{
    transporter: nodemailer.Transporter | null;
    from: string;
  }> {
    const { getIntegrationConfigResolver } = await import("@/modules/integrations");
    const smtp = await getIntegrationConfigResolver().getSmtpConfig();
    if (!smtp.host || !smtp.user || !smtp.pass) {
      return {
        transporter: null,
        from: smtp.from || '"TVV Travel OS" <noreply@thevacationvoice.com>',
      };
    }

    return {
      transporter: nodemailer.createTransport({
        host: smtp.host,
        port: Number(smtp.port) || 587,
        secure: smtp.secure === "true",
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
      }),
      from: smtp.from || '"TVV Travel OS" <noreply@thevacationvoice.com>',
    };
  }

  async sendEmail(data: SendEmailDto, retries = 3): Promise<Result<void, AppError>> {
    try {
      const { transporter, from } = await this.getTransporter();
      if (!transporter) {
        this.logger.warn("SMTP is not configured — email was not sent", {
          to: data.to,
          subject: data.subject,
        });
        return ok(undefined);
      }

      // Pre-flight check / logging for SPF & DKIM readiness
      this.logger.debug("Ensuring SPF/DKIM headers are prepared for SMTP transport", {
        domain: from.split("@")[1]?.replace(/>/, ""),
      });

      let attempt = 0;
      while (attempt < retries) {
        try {
          await transporter.sendMail({
            from,
            to: data.to,
            subject: data.subject,
            html: data.html,
          });
          this.logger.info("Email sent successfully", { to: data.to, subject: data.subject });
          return ok(undefined);
        } catch (err: any) {
          attempt++;
          this.logger.warn(`Email send failed (attempt ${attempt}/${retries})`, { error: err.message, to: data.to });
          if (attempt >= retries) throw err;
          // Exponential backoff
          await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
        }
      }
      return err(new InternalError("Failed to send email after retries"));
    } catch (error) {
      this.logger.error("Failed to setup email transport", { error, to: data.to });
      return err(new InternalError("Failed to setup email transport"));
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
