const { Resend } = require('resend');
require('dotenv').config();

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
  }
  return new Resend(process.env.RESEND_API_KEY);
}

// Send welcome email
async function sendWelcomeEmail(toEmail, citizenData) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'UrbanPulse <onboarding@resend.dev>',
      to: toEmail,
      subject: '🎉 Welcome to UrbanPulse — Account Created!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px;">
          <div style="background: #2563eb; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">UrbanPulse</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Smart Transparent Public Grievance System</p>
          </div>
          <h2 style="color: #22c55e;">🎉 Account Created Successfully!</h2>
          <p style="color: #94a3b8;">Welcome to UrbanPulse! Your anonymous citizen account is ready.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Your Citizen ID</p>
            <p style="color: #60a5fa; font-size: 20px; font-weight: bold; margin: 0;">${citizenData.pseudoId}</p>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0;">This is your public identity — your real info is encrypted</p>
          </div>
          <div style="background: #064e3b; border: 1px solid #065f46; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #34d399; margin: 0; font-size: 14px;">
              🔐 Your identity is fully protected<br/>
              👤 Public only sees your Citizen ID<br/>
              📋 You can now file complaints<br/>
              🔒 Aadhaar never shown publicly
            </p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error (welcome):', error);
      return false;
    }

    console.log('✅ Welcome email sent! ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ sendWelcomeEmail failed:', error.message);
    return false;
  }
}

// Send complaint confirmation
async function sendComplaintConfirmation(toEmail, complaintData) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'UrbanPulse <onboarding@resend.dev>',
      to: toEmail,
      subject: `✅ Complaint Filed — ${complaintData.complaint_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px;">
          <div style="background: #2563eb; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">UrbanPulse</h1>
          </div>
          <h2 style="color: #22c55e;">✅ Complaint Filed Successfully!</h2>
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Complaint ID</p>
            <p style="color: #60a5fa; font-size: 20px; font-weight: bold; margin: 0;">${complaintData.complaint_number}</p>
          </div>
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #94a3b8; font-size: 14px;"><strong style="color: #fff;">Title:</strong> ${complaintData.title}</p>
            <p style="margin: 4px 0; color: #94a3b8; font-size: 14px;"><strong style="color: #fff;">Category:</strong> ${complaintData.category}</p>
            <p style="margin: 4px 0; color: #94a3b8; font-size: 14px;"><strong style="color: #fff;">Location:</strong> ${complaintData.location}</p>
            <p style="margin: 4px 0; color: #fbbf24; font-size: 14px;"><strong style="color: #fff;">Status:</strong> Filed</p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error (complaint):', error);
      return false;
    }

    console.log('✅ Complaint confirmation email sent! ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ sendComplaintConfirmation failed:', error.message);
    return false;
  }
}

// Send action notification
async function sendActionNotification(toEmail, complaintData, actionData) {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: 'UrbanPulse <onboarding@resend.dev>',
      to: toEmail,
      subject: `🔔 Update on Complaint ${complaintData.complaint_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px;">
          <div style="background: #2563eb; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">UrbanPulse</h1>
          </div>
          <h2 style="color: #60a5fa;">🔔 Action Taken on Your Complaint</h2>
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #60a5fa; font-weight: bold; margin: 0;">${complaintData.complaint_number}</p>
            <p style="color: #ffffff; margin: 4px 0 0;">${complaintData.title}</p>
          </div>
          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Action Taken</p>
            <p style="color: #ffffff; margin: 0;">${actionData.description}</p>
          </div>
          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend API error (action):', error);
      return false;
    }

    console.log('✅ Action notification email sent! ID:', data.id);
    return true;
  } catch (error) {
    console.error('❌ sendActionNotification failed:', error.message);
    return false;
  }
}

module.exports = { sendWelcomeEmail, sendComplaintConfirmation, sendActionNotification };