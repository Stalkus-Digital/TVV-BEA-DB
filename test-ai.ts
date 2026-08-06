
require("dotenv").config();
import { prisma } from "@/shared/database/prisma-client";
import { AIService } from "@/modules/ai/ai.service";

async function run() {
  const dest = await prisma.destination.findFirst({
    where: { name: { contains: "Kerala" } }
  });
  
  if (!dest) {
    console.error("No destination found for Kerala.");
    return;
  }
  
  console.log("Found destination:", dest.name, dest.id);

  const context = {
    logger: { info: console.log, error: console.error, debug: console.log, warn: console.log },
    userId: "test"
  } as any;

  const aiService = new AIService(context);
  
  console.log("Generating package...");
  const result = await aiService.generateHolidayPackage({
    destination: dest.id,
    durationDays: 3,
    theme: "Relaxation"
  });

  if (result.ok) {
    console.log("SUCCESS! Created Package:", result.value.title);
  } else {
    console.error("FAILED:", result.error);
  }
  
  await prisma.$disconnect();
}

run().catch(console.error);

