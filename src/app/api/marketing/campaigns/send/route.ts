import { NextResponse } from "next/server";
import { prisma } from "@/shared/database/prisma-client";
import { EmailService } from "@/modules/email/email.service";
import { ConsoleLogger } from "@/shared/logger/console-logger";

const emailService = new EmailService({ logger: new ConsoleLogger({ scope: "EmailService" }) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.campaignId) {
      return NextResponse.json({ error: "campaignId is required" }, { status: 400 });
    }

    const campaign = await prisma.marketingCampaign.update({
      where: { id: body.campaignId },
      data: { status: "ACTIVE" }
    });

    const emailResult = await emailService.sendEmail({
      to: body.email || "subscribers@example.com",
      subject: `New Campaign: ${campaign.name}`,
      html: `<h2>Check out our new campaign!</h2>`,
    });

    if (!emailResult.ok) {
      return NextResponse.json({ error: emailResult.error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data: campaign,
      message: "Campaign emails sent successfully" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
