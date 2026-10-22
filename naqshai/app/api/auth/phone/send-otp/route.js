import { NextResponse } from 'next/server';
import { sendOtp } from '@/lib/phoneVerification.js';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Mobile phone number is required.' },
        { status: 400 }
      );
    }

    const result = await sendOtp(phone);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to send OTP code.' },
      { status: 400 }
    );
  }
}
