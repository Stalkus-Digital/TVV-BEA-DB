const fs = require('fs');
const files = [
  'src/modules/customer/api/enquiries.handlers.ts',
  'src/app/api/checkout/razorpay/route.ts',
  'src/app/api/checkout/razorpay/verify/route.ts',
  'src/app/api/admin/leads/route.ts',
  'src/app/api/admin/dashboard/kpis/route.ts',
  'src/app/api/admin/leads/[id]/assign/route.ts',
  'src/app/api/admin/leads/[id]/route.ts',
  'src/app/api/admin/landing-pages/[id]/route.ts',
  'src/app/api/admin/landing-pages/[id]/export/route.ts',
  'src/app/api/admin/leads/[id]/status/route.ts',
  'src/app/api/admin/landing-pages/route.ts'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/import \{ PrismaClient \} from "@prisma\/client";\s*const prisma = new PrismaClient\(\);/m, 'import { prisma } from "@/shared/database/prisma-client";');
    fs.writeFileSync(f, content);
    console.log("Updated", f);
  } else {
    console.log("Missing", f);
  }
});
