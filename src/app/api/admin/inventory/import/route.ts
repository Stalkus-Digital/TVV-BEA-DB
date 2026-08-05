import { NextResponse } from 'next/server';
import { prisma } from "@/shared/database/prisma-client";
import * as xlsx from 'xlsx';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'HOTEL';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Read the file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file using XLSX (handles both .xlsx and .csv)
    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data: any[] = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return NextResponse.json({ success: false, error: 'File is empty' }, { status: 400 });
    }

    let importedCount = 0;

    // Process the rows and insert into database
    for (const row of data) {
      // Validate the minimum required fields
      const name = row['Name'] || row['Title'];
      if (!name) continue;

      if (type === 'HOTEL') {
        await prisma.inventoryItem.create({
          data: {
            kind: 'HOTEL',
            title: String(name),
            status: String(row['Status'] || 'ACTIVE').toUpperCase(),
            destinationId: row['Destination ID'] || null,
            details: {
              address: row['Location'] || row['Address'] || '',
              starRating: parseInt(row['Stars']) || 3,
              rooms: parseInt(row['Rooms']) || 0,
              avgRate: parseFloat(row['NightlyRate'] || row['AvgRate']) || 0,
              shortDescription: row['Description'] || '',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        importedCount++;
      } else if (type === 'ACTIVITY') {
        await prisma.inventoryItem.create({
          data: {
            kind: 'ACTIVITY',
            title: String(name),
            status: String(row['Status'] || 'ACTIVE').toUpperCase(),
            destinationId: row['Destination ID'] || null,
            details: {
              location: row['Location'] || row['Address'] || '',
              duration: row['Duration'] || '',
              price: parseFloat(row['Price']) || 0,
              shortDescription: row['Description'] || '',
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        });
        importedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully imported ${importedCount} items`,
      count: importedCount 
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process file' }, { status: 500 });
  }
}
