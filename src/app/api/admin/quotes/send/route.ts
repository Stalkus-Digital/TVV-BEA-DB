import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { EmailService } from "@/modules/email/email.service";
import { ConsoleLogger } from "@/shared/logger/console-logger";

const emailService = new EmailService({ logger: new ConsoleLogger({ scope: "EmailService" }) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.quoteId) {
      return NextResponse.json({ error: "quoteId is required" }, { status: 400 });
    }

    const quote = await prisma.package.findUnique({ where: { id: body.quoteId } });
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    const emailResult = await emailService.sendEmail({
      to: body.email || "customer@example.com",
      subject: `Your Quote: ${quote.title}`,
      html: `<h2>Here is your quote for ${quote.title}</h2>`,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Quote sent successfully" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
