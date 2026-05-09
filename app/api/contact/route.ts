import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/contact
 * Phase 1 stub — logs form data, returns 200.
 * Replace the body of this handler with real email/CRM logic later.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const { name, email, project, message } = body;
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required.' },
        { status: 400 }
      );
    }

    // TODO: Replace with Resend / Nodemailer / HubSpot CRM call
    console.log('[Ukiyo Contact]', { name, email, project, message, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
