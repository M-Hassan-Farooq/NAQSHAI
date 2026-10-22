import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/phoneVerification.js';

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: 'Both mobile phone number and 6-digit OTP code are required.' },
        { status: 400 }
      );
    }

    const result = verifyOtp(phone, code);
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to verify OTP code.' },
      { status: 500 }
    );
  }
}
