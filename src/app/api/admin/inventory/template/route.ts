import { NextResponse } from 'next/server';
import * as xlsx from 'xlsx';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'HOTEL';

    let data: any[] = [];

    if (type === 'HOTEL') {
      data = [
        {
          'Name': 'Example Grand Hotel',
          'Location': 'Dubai, UAE',
          'Stars': 5,
          'Rooms': 200,
          'NightlyRate': 15000,
          'Status': 'ACTIVE',
          'Destination ID': '',
          'Description': 'A luxury hotel in the heart of Dubai.'
        }
      ];
    } else if (type === 'ACTIVITY') {
      data = [
        {
          'Name': 'Desert Safari',
          'Location': 'Dubai Desert',
          'Duration': '6 hours',
          'Price': 2500,
          'Status': 'ACTIVE',
          'Destination ID': '',
          'Description': 'An exciting evening desert safari with dinner.'
        }
      ];
    }

    // Create a new workbook and add the data
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    
    // Auto-size columns slightly
    worksheet['!cols'] = [
      { wch: 25 }, // Name
      { wch: 20 }, // Location
      { wch: 10 }, // Stars/Duration
      { wch: 10 }, // Rooms/Price
      { wch: 15 }, // Rate/Status
      { wch: 10 }, // Status/DestID
      { wch: 20 }, // DestID/Description
      { wch: 40 }, // Description
    ];

    xlsx.utils.book_append_sheet(workbook, worksheet, `${type}s`);

    // Generate buffer
    const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Return as downloadable file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${type.toLowerCase()}_import_template.xlsx"`,
      },
    });

  } catch (error: any) {
    console.error('Template generation error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate template' }, { status: 500 });
  }
}
