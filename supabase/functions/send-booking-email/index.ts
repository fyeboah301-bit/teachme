import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    const { type, booking, clientEmail, clientName, teacherName, teacherEmail, subject, amount, message } = await req.json()

    let emailTo = ''
    let emailSubject = ''
    let emailHtml = ''

    if (type === 'new_booking_teacher') {
      // Email to teacher when new booking request comes in
      emailTo = teacherEmail
      emailSubject = `New booking request — ${subject}`
      emailHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #1E3A5F; padding: 2rem; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">Teach<span style="color: #FFD700;">Me</span></h1>
          </div>
          <div style="padding: 2rem;">
            <h2 style="color: #111; font-size: 20px; margin-bottom: 1rem;">New booking request 📅</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${teacherName}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">You have a new booking request from <strong>${clientName}</strong>.</p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Subject</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">${subject}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Student</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">${clientName}</td></tr>
                ${amount > 0 ? `<tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Amount</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">GH₵ ${amount}</td></tr>` : ''}
                ${message ? `<tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif; vertical-align: top;">Message</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-family: sans-serif;">${message}</td></tr>` : ''}
              </table>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Please log in to TeachMe to confirm or decline this booking.</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="https://teachme.vercel.app/dashboard" style="background: #2563EB; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-family: sans-serif; font-weight: 600;">View booking →</a>
            </div>
          </div>
          <div style="background: #F8FAFC; padding: 1rem 2rem; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; font-family: sans-serif; margin: 0;">© TeachMe · You received this because you are registered as a teacher.</p>
          </div>
        </div>
      `
    } else if (type === 'booking_confirmed') {
      // Email to client when teacher confirms
      emailTo = clientEmail
      emailSubject = `Your booking is confirmed — ${subject} with ${teacherName}`
      emailHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #1E3A5F; padding: 2rem; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">Teach<span style="color: #FFD700;">Me</span></h1>
          </div>
          <div style="padding: 2rem;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
              <div style="background: #DCFCE7; border-radius: 50%; width: 64px; height: 64px; display: inline-flex; align-items: center; justify-content: center; font-size: 28px;">✅</div>
            </div>
            <h2 style="color: #111; font-size: 20px; margin-bottom: 1rem; text-align: center;">Booking confirmed!</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${clientName}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Great news! <strong>${teacherName}</strong> has confirmed your booking request.</p>
            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 1.25rem; margin: 1.5rem 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Subject</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">${subject}</td></tr>
                <tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Teacher</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">${teacherName}</td></tr>
                ${amount > 0 ? `<tr><td style="padding: 6px 0; color: #64748B; font-size: 14px; font-family: sans-serif;">Amount</td><td style="padding: 6px 0; color: #111; font-size: 14px; font-weight: 600; font-family: sans-serif;">GH₵ ${amount}</td></tr>` : ''}
              </table>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Your teacher will be in touch with further details. You can also view your booking in your dashboard.</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="https://teachme.vercel.app/dashboard" style="background: #2563EB; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-family: sans-serif; font-weight: 600;">View dashboard →</a>
            </div>
          </div>
          <div style="background: #F8FAFC; padding: 1rem 2rem; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; font-family: sans-serif; margin: 0;">© TeachMe · You received this because you made a booking on TeachMe.</p>
          </div>
        </div>
      `
    } else if (type === 'booking_declined') {
      // Email to client when teacher declines
      emailTo = clientEmail
      emailSubject = `Booking update — ${subject} with ${teacherName}`
      emailHtml = `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden;">
          <div style="background: #1E3A5F; padding: 2rem; text-align: center;">
            <h1 style="color: #fff; font-size: 24px; margin: 0;">Teach<span style="color: #FFD700;">Me</span></h1>
          </div>
          <div style="padding: 2rem;">
            <h2 style="color: #111; font-size: 20px; margin-bottom: 1rem;">Booking update</h2>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Hi <strong>${clientName}</strong>,</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Unfortunately <strong>${teacherName}</strong> is unable to take your booking for <strong>${subject}</strong> at this time.</p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">Don't worry — there are many other great teachers on TeachMe. Browse and find another teacher who suits your needs.</p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="https://teachme.vercel.app/teachers" style="background: #2563EB; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 15px; font-family: sans-serif; font-weight: 600;">Find another teacher →</a>
            </div>
          </div>
          <div style="background: #F8FAFC; padding: 1rem 2rem; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #94A3B8; font-size: 12px; font-family: sans-serif; margin: 0;">© TeachMe · You received this because you made a booking on TeachMe.</p>
          </div>
        </div>
      `
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'TeachMe <onboarding@resend.dev>',
        to: emailTo,
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: res.ok ? 200 : 400,
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})