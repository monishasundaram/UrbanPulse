const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Send complaint confirmation email
async function sendComplaintConfirmation(toEmail, complaintData) {
  try {
    await transporter.sendMail({
      from: `"UrbanPulse" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `✅ Complaint Filed — ${complaintData.complaint_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px;">
          <div style="background: #2563eb; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">UrbanPulse</h1>
            <p style="margin: 4px 0 0; opacity: 0.8;">Smart Transparent Public Grievance System</p>
          </div>

          <h2 style="color: #22c55e;">✅ Complaint Filed Successfully!</h2>
          <p style="color: #94a3b8;">Your complaint has been recorded and is now publicly visible.</p>

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Complaint ID</p>
            <p style="color: #60a5fa; font-size: 20px; font-weight: bold; margin: 0;">${complaintData.complaint_number}</p>
          </div>

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #64748b; padding: 4px 0; font-size: 14px;">Title</td>
                <td style="color: #ffffff; padding: 4px 0; font-size: 14px;">${complaintData.title}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 4px 0; font-size: 14px;">Category</td>
                <td style="color: #ffffff; padding: 4px 0; font-size: 14px;">${complaintData.category}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 4px 0; font-size: 14px;">Location</td>
                <td style="color: #ffffff; padding: 4px 0; font-size: 14px;">${complaintData.location}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding: 4px 0; font-size: 14px;">Status</td>
                <td style="color: #fbbf24; padding: 4px 0; font-size: 14px;">Filed</td>
              </tr>
            </table>
          </div>

          <div style="background: #064e3b; border: 1px solid #065f46; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #34d399; margin: 0; font-size: 14px;">
              🔐 Blockchain hash generated<br/>
              👤 Your identity is protected<br/>
              📋 Complaint is publicly visible<br/>
              ⏳ Officials will be notified
            </p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });
    console.log('✅ Confirmation email sent!');
    return true;
  } catch (error) {
    console.error('Email failed:', error.message);
    return false;
  }
}

// Send action notification email
async function sendActionNotification(toEmail, complaintData, actionData) {
  try {
    await transporter.sendMail({
      from: `"UrbanPulse" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🔔 Update on Complaint ${complaintData.complaint_number}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #ffffff; padding: 32px; border-radius: 16px;">
          <div style="background: #2563eb; padding: 16px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
            <h1 style="margin: 0; font-size: 24px;">UrbanPulse</h1>
          </div>

          <h2 style="color: #60a5fa;">🔔 Action Taken on Your Complaint</h2>

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Complaint</p>
            <p style="color: #60a5fa; font-weight: bold; margin: 0;">${complaintData.complaint_number}</p>
            <p style="color: #ffffff; margin: 4px 0 0;">${complaintData.title}</p>
          </div>

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px;">Action Taken</p>
            <p style="color: #ffffff; margin: 0;">${actionData.description}</p>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0;">
              By Officer #${actionData.officer_id} • ${new Date(actionData.created_at).toLocaleString()}
            </p>
          </div>

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 4px;">Current Status</p>
            <p style="color: #fbbf24; font-weight: bold; margin: 0;">${complaintData.status}</p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });
    console.log('✅ Action notification email sent!');
    return true;
  } catch (error) {
    console.error('Email failed:', error.message);
    return false;
  }
}
// Send welcome email for new registration
async function sendWelcomeEmail(toEmail, citizenData) {
  try {
    await transporter.sendMail({
      from: `"UrbanPulse" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `🎉 Welcome to UrbanPulse — Account Created!`,
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

          <div style="background: #1e293b; padding: 16px; border-radius: 12px; margin: 16px 0;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0;">
              You can now file complaints at <a href="http://localhost:3000/file-complaint" style="color: #60a5fa;">UrbanPulse</a> and track them publicly.
            </p>
          </div>

          <p style="color: #475569; font-size: 12px; text-align: center; margin-top: 24px;">
            UrbanPulse — Smart Transparent Public Grievance System
          </p>
        </div>
      `,
    });
    console.log('✅ Welcome email sent!');
    return true;
  } catch (error) {
    console.error('Email failed:', error.message);
    return false;
  }
}
module.exports = { sendComplaintConfirmation, sendActionNotification, sendWelcomeEmail };