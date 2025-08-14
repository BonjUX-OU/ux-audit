import { mg } from "./mailgun";

export async function SendVerificationEmail(email: string, token: string) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: "MyApp <no-reply@myapp.com>",
      to: [email],
      subject: "UX Must , Verify your email",
      html: `
        <h1>UX-MUST Verify Your Email</h1>
        <button>Click <a href="${link}">here</a> to verify your account.</button>
        <p>This link expires in 15 minutes.</p>
      `,
    });
  } catch (error) {
    console.error("Mailgun send error:", error);
    throw new Error("Failed to send verification email");
  }
}