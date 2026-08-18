import { prisma } from "../shared/database/prisma-client";



async function main() {
  console.log("Fixing Kerala destination region...");

  const kerala = await prisma.destination.findFirst({
    where: { slug: "kerala" }
  });

  if (!kerala) {
    console.log("Kerala destination not found.");
    return;
  }

  console.log(`Kerala current parent ID: ${kerala.parentDestinationId}`);

  const india = await prisma.destination.findFirst({
    where: { slug: "india" }
  });

  if (!india) {
    console.log("India destination not found.");
    return;
  }

  await prisma.destination.update({
    where: { id: kerala.id },
    data: { parentDestinationId: india.id, continent: "Asia" }
  });

  console.log(`Updated Kerala parent to: ${india.name} (ID: ${india.id})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
