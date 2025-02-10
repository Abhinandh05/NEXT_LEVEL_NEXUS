import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const gmailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Gmail email
      pass: process.env.EMAIL_PASS, // Gmail password or App Password
    },
  });
  
  // Function to send an email
  export const sendEmail = async (to, subject, html) => {
    try {
      await brevoTransporter.sendMail({
        from: `"NextLevel Nexus" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
    //   console.log("Email sent successfully via Brevo to", to);
    } catch (error) {
    //   console.error("Error sending email via Brevo, trying Gmail...", error);
  
      // Fallback to Gmail if Brevo fails
      try {
        await gmailTransporter.sendMail({
          from: `"NextLevel Nexus" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html,
        });
        // console.log("Email sent successfully via Gmail to", to);
      } catch (gmailError) {
        // console.error("Error sending email via Gmail as well:", gmailError);
      }
    }
  };

export default transporter;
