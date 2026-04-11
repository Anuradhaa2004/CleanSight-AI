const nodemailer = require('nodemailer');

let transporter;

const setupTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    console.log('✅ Gmail SMTP Transporter Initialized!');
  } else {
    console.log('\n--- WARNING: No SMTP credentials in .env ---');
    transporter = null;
  }
};

setupTransporter();

const sendOTP = async (email, otp) => {
  if (!transporter) {
    console.log('\n=======================================');
    console.log(`[TERMINAL LOG] OTP FOR: ${email}`);
    console.log(`CODE: ${otp}`);
    console.log('=======================================\n');
    return true;
  }

  try {
    console.log(`[EmailService] Attempting to send OTP email to ${email}...`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Your OTP for CleanSight AI",
      text: `Your OTP is: ${otp}`,
      html: `<b>Your OTP is: ${otp}</b>`,
    });
    console.log("Real Email Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const sendPasswordReset = async (email, resetUrl) => {
  if (!transporter) {
    console.log('\n=======================================');
    console.log(`[TEST MODE] PASSWORD RESET FOR: ${email}`);
    console.log(`RESET LINK: ${resetUrl}`);
    console.log('=======================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: '"CleanSight AI" <no-reply@cleansight.ai>',
      to: email,
      subject: 'Reset your CleanSight AI password',
      text: `Reset your password using this link: ${resetUrl}`,
      html: `<p>Reset your password using this link:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    });
    console.log('Real Email Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

const sendResetOTP = async (email, otp) => {
  if (!transporter) {
    console.log('\n=======================================');
    console.log(`[TERMINAL LOG] PASSWORD RESET OTP FOR: ${email}`);
    console.log(`CODE: ${otp}`);
    console.log('=======================================\n');
    return true;
  }

  try {
    console.log(`[EmailService] Attempting to send Reset OTP email to ${email}...`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset Code - CleanSight AI",
      text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
          <h2 style="color: #1E75FF; text-align: center;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your CleanSight AI password. Use the code below to complete the process:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #0f172a; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
          </div>
          <p>This code will expire in 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">CleanSight AI - Professional Waste Management Platform</p>
        </div>
      `,
    });
    console.log("Reset OTP Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending reset OTP email:", error);
    return false;
  }
};

const sendCitizenConfirmation = async (ticket) => {
  if (!transporter) return true;
  try {
    const { _id, aiCategory, location, user_name, userEmail } = ticket;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: `Ticket Confirmation - ${aiCategory} [#${_id.toString().slice(-6).toUpperCase()}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;">
          <h2 style="color: #4F46E5;">CleanSight AI: Report Received</h2>
          <p>Hello <b>${user_name}</b>,</p>
          <p>Your waste report has been successfully submitted and is being processed by the municipal authorities.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><b>Tracking ID:</b> #${_id.toString().toUpperCase()}</p>
            <p><b>Category:</b> ${aiCategory}</p>
            <p><b>Location:</b> ${location}</p>
          </div>
          <p>You can track the live status of your report on your dashboard.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">CleanSight AI - Making cities cleaner through technology.</p>
        </div>
      `,
    });
    console.log(`Confirmation email sent to citizen: ${userEmail}`);
  } catch (error) {
    console.error("Error sending citizen confirmation:", error);
  }
};

const sendAuthorityAlert = async (ticket, authorityEmail) => {
  if (!transporter) return true;
  try {
    const { _id, aiCategory, location, user_name, description, googleMapsUrl } = ticket;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: authorityEmail,
      subject: `URGENT: New Incident in ${location.split(',').pop().trim()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff;">
          <h2 style="color: #ef4444;">⚠️ New Waste Incident Reported</h2>
          <p>A new complaint has been filed in your assigned area. Please review the details below:</p>
          <div style="background: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
            <p><b>Citizen Name:</b> ${user_name}</p>
            <p><b>Category:</b> ${aiCategory}</p>
            <p><b>Description:</b> ${description || 'No description provided'}</p>
            <p><b>Location:</b> ${location}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${googleMapsUrl}" style="background: #1E75FF; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Interactive Map</a>
          </div>
          <p>Action is required to maintain the cleanliness standards of our smart city.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b; text-align: center;">Authority Command Center - CleanSight AI Notification System</p>
        </div>
      `,
    });
    console.log(`Alert email sent to authority: ${authorityEmail}`);
  } catch (error) {
    console.error("Error sending authority alert:", error);
  }
};

module.exports = { 
  sendOTP, 
  sendPasswordReset, 
  sendResetOTP, 
  sendCitizenConfirmation, 
  sendAuthorityAlert 
};
