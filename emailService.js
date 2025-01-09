const nodemailer = require('nodemailer');

// Create a transporter object using Gmail's SMTP settings
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Gmail SMTP host
    port: 465, // Use 465 for SSL
    secure: true, // Set to true for port 465
    auth: {
        user: process.env.EMAIL_USER='stevemurigu2@gmail.com', // Your Gmail email address
        pass: process.env.EMAIL_PASS='mtil xrdb ouky sixf' // Your Gmail app-specific password
    }
});

// Function to send an email
const sendEmail = async (to, subject, text, html = null) => {
    try {
        await transporter.sendMail({
            from: `"Your Company" <${process.env.EMAIL_USER}>`, // Sender's email address
            to, // Recipient's email address
            subject, // Email subject
            text, // Plain text body
            ...(html && { html }) // Optional: HTML body if provided
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = sendEmail;
