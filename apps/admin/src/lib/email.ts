import { Resend } from 'resend'

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) { console.warn('[email] RESEND_API_KEY not set — skipping email'); return null }
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'SerendiGO <creators@serendigo.app>'
const PORTAL = process.env.NEXT_PUBLIC_CREATOR_PORTAL_URL ?? 'http://localhost:3002'

// ─── Creator application emails ───────────────────────────────────────────

export async function sendCreatorApprovedEmail(to: string, name: string) {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: "You're approved — welcome to SerendiGO Creators",
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A1A2E">
        <div style="background:#E8832A;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:26px;color:#fff;font-family:Georgia,serif">SerendiGO Creators</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #E5DDD0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:18px;font-family:Georgia,serif;margin:0 0 16px">Hi ${name},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
            Your application to become a SerendiGO Creator has been <strong>approved</strong>.
            You can now log in and start submitting arcs.
          </p>
          <a href="${PORTAL}/creators/login"
             style="display:inline-block;background:#E8832A;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 28px;border-radius:100px;text-decoration:none;margin:8px 0 24px">
            Go to your dashboard →
          </a>
          <p style="font-size:13px;color:#5A5A7A;line-height:1.6;margin:0">
            Questions? Reply to this email and we'll get back to you.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendCreatorRejectedEmail(to: string, name: string, reason: string | null) {
  const resend = getResend()
  if (!resend) return

  const reasonBlock = reason
    ? `<div style="background:#FDF0EE;border:1px solid #F5C5BF;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:14px;color:#A8332A;line-height:1.6">
        <strong>Feedback from our editors:</strong><br>${reason}
       </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your SerendiGO Creator application',
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A1A2E">
        <div style="background:#E8832A;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:26px;color:#fff;font-family:Georgia,serif">SerendiGO Creators</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #E5DDD0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:18px;font-family:Georgia,serif;margin:0 0 16px">Hi ${name},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 8px">
            Thank you for applying to SerendiGO Creators. After reviewing your application,
            we&apos;re unable to approve it at this time.
          </p>
          ${reasonBlock}
          <p style="font-size:14px;color:#5A5A7A;line-height:1.6;margin:16px 0 0">
            You&apos;re welcome to apply again in the future. If you have questions, reply to this email.
          </p>
        </div>
      </div>
    `,
  })
}

// ─── Arc submission emails ───────────────────────────────��─────────────────

export async function sendSubmissionPublishedEmail(to: string, name: string, arcTitle: string) {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your arc "${arcTitle}" is now live on SerendiGO`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A1A2E">
        <div style="background:#E8832A;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:26px;color:#fff;font-family:Georgia,serif">SerendiGO Creators</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #E5DDD0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:18px;font-family:Georgia,serif;margin:0 0 16px">Hi ${name},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 16px">
            Great news — your arc <strong>&ldquo;${arcTitle}&rdquo;</strong> has been reviewed and is now
            <strong>published</strong> on SerendiGO. Travellers can discover and complete it right now.
          </p>
          <a href="${PORTAL}/creators/dashboard"
             style="display:inline-block;background:#E8832A;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 28px;border-radius:100px;text-decoration:none;margin:8px 0 24px">
            View your submissions →
          </a>
          <p style="font-size:13px;color:#5A5A7A;line-height:1.6;margin:0">
            Thank you for contributing to the island&apos;s story.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendSubmissionRejectedEmail(
  to: string,
  name: string,
  arcTitle: string,
  feedback: string | null,
) {
  const resend = getResend()
  if (!resend) return

  const feedbackBlock = feedback
    ? `<div style="background:#FDF0EE;border:1px solid #F5C5BF;border-radius:8px;padding:14px 18px;margin:16px 0;font-size:14px;color:#A8332A;line-height:1.6">
        <strong>Editor feedback:</strong><br>${feedback}
       </div>`
    : ''

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your arc "${arcTitle}" needs changes`,
    html: `
      <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1A1A2E">
        <div style="background:#E8832A;padding:28px 32px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:26px;color:#fff;font-family:Georgia,serif">SerendiGO Creators</h1>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #E5DDD0;border-top:none;border-radius:0 0 12px 12px">
          <p style="font-size:18px;font-family:Georgia,serif;margin:0 0 16px">Hi ${name},</p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 8px">
            We&apos;ve reviewed your arc <strong>&ldquo;${arcTitle}&rdquo;</strong> and it needs a few changes
            before it&apos;s ready to publish.
          </p>
          ${feedbackBlock}
          <a href="${PORTAL}/creators/dashboard"
             style="display:inline-block;background:#E8832A;color:#fff;font-family:Arial,sans-serif;font-weight:700;font-size:15px;padding:14px 28px;border-radius:100px;text-decoration:none;margin:16px 0 24px">
            Edit your submission →
          </a>
          <p style="font-size:13px;color:#5A5A7A;line-height:1.6;margin:0">
            Make your changes and resubmit — we&apos;ll review it again promptly.
          </p>
        </div>
      </div>
    `,
  })
}
