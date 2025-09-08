import { mg } from "./mailgun";

export async function SendVerificationEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: "uxmust <no-reply@uxmust.com>",
      to: [email],
      subject: "UX Must , Verify your email",
      html: `
        <html>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f7;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center" style="padding: 40px 0;">
          <table width="600" cellpadding="0" cellspacing="0" role="presentation" 
                 style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background-color:#4f46e5; padding: 20px; text-align: center;">
                <h1 style="margin:0; font-size: 22px; color: #ffffff;">UX-MUST</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; text-align: center; color: #333;">
                <h2 style="margin-top:0; font-size: 20px;">Verify Your Email Address</h2>
                <p style="font-size: 15px; line-height: 22px; margin-bottom: 30px;">
                  Thanks for signing up! Please confirm that 
                  <strong>this is your email address</strong> by clicking the button below.
                </p>
                
                <!-- Button -->
                <a href="${link}" 
                   style="display:inline-block; padding: 12px 24px; background-color:#4f46e5; 
                          color:#ffffff; text-decoration:none; font-size:16px; font-weight:bold; 
                          border-radius:6px;">
                  Verify Email
                </a>

                <p style="margin-top:30px; font-size: 13px; color:#666;">
                  This link will expire in <strong>15 minutes</strong>.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f9fafb; text-align:center; padding:20px; font-size:12px; color:#999;">
                If you did not create an account, you can ignore this email.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
      `,
    });
  } catch (error) {
    console.error("Mailgun send error:", error);
    throw new Error("Failed to send verification email");
  }
}