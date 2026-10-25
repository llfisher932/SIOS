// Development: always prints emails, and also sends them if RESEND_API_KEY is set.
// Production: never prints. Reset links in logs would let anyone with log access take over accounts.
import { Resend } from "resend";

type Email = {
  to: string;
  subject: string;
  text: string;
  idempotencyKey?: string;
};

// onboarding@resend.dev only delivers to the Resend account owner until a domain is verified.
const EMAIL_FROM = process.env.EMAIL_FROM ?? "SIOS <onboarding@resend.dev>";
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const RETRY_DELAY_MS = 1000;

// Never throws, so forgot-password responds the same whether or not the email went out.
async function sendEmail(email: Email): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.log(
      [
        "",
        `──────── email (dev copy${resend ? ", also sent via Resend" : ", not sent"}) ────────`,
        `To: ${email.to}`,
        `Subject: ${email.subject}`,
        "",
        email.text,
        "────────────────────────────────────────────────",
        "",
      ].join("\n"),
    );
  }

  if (!resend) {
    if (isProduction) console.warn(`Email provider not configured; "${email.subject}" was not sent.`);
    return !isProduction;
  }

  // Retry once on temporary failures.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { error } = await resend.emails.send(
        { from: EMAIL_FROM, to: email.to, subject: email.subject, text: email.text },
        email.idempotencyKey ? { idempotencyKey: email.idempotencyKey } : undefined,
      );
      if (!error) return true;

      // Never log the body: it may contain a reset link.
      console.error(`Resend rejected "${email.subject}" (attempt ${attempt}): ${error.name}: ${error.message}`);
      const temporary = ["rate_limit_exceeded", "application_error", "internal_server_error"].includes(error.name);
      if (!temporary) return false;
    } catch (err) {
      console.error(`Couldn't reach Resend for "${email.subject}" (attempt ${attempt}):`, err instanceof Error ? err.message : err);
    }
    if (attempt === 1) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }
  return false;
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string,
  expiresInMinutes: number,
  idempotencyKey: string,
): Promise<boolean> {
  return sendEmail({
    to,
    subject: "Reset your SIOS password",
    text: [
      "We received a request to reset the password for your SIOS account.",
      "",
      `Choose a new password here (this link expires in ${expiresInMinutes} minutes and can only be used once):`,
      resetLink,
      "",
      "If you didn't ask for this, you can ignore this email. Your password won't change.",
    ].join("\n"),
    idempotencyKey,
  });
}
