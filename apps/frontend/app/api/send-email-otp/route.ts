import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return Response.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    // Check if we have the Resend API key
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      // If we have the API key, use Resend to send the email
      const { Resend } = await import('resend');
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: 'onboarding@yourdomain.com',
        to: email,
        subject: 'Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Email Verification</h1>
            <p>Your verification code is: <strong>${otp}</strong></p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });

      if (error) {
        console.error('Error sending email:', error);
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({
        success: true,
        message: 'OTP sent successfully',
        id: data?.id
      });
    } else {
      // If no API key, log the OTP for development purposes
      console.log(`[DEV] OTP ${otp} generated for ${email}`);
      console.warn('RESEND_API_KEY not found. In production, set this environment variable to send actual emails.');
      
      // Still return success to allow the flow to continue in development
      return Response.json({
        success: true,
        message: 'OTP sent successfully (development mode - check console for OTP)'
      });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}