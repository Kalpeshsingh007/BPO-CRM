const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'tecnetlimited2020@gmail.com', // Replace with your email
    pass: ' ' // Replace with your password or app-specific password
  }
});

// Function to send email
async function sendEmail(to, subject, text, html, attachments = []) {
  try {
    // Create mail options
    const mailOptions = {
      from: '"BPO CRM" <tecnetlimited2020@gmail.com>',
      to: to,
      subject: subject,
      text: text,
      html: html,
      attachments: attachments
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendEmail
};