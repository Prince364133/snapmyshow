const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 465,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for others
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const premiumStyle = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0a09; margin: 0; padding: 0; color: #ffffff; }
    .container { width: 100%; max-width: 600px; margin: 20px auto; background-color: #171717; border: 1px solid #262626; border-radius: 24px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #e11d48 0%, #9f1239 100%); padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 32px; font-style: italic; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
    .content { padding: 40px; }
    .info-box { background-color: #262626; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #404040; }
    .info-item { margin-bottom: 12px; }
    .label { color: #a3a3a3; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; }
    .value { color: #ffffff; font-size: 16px; font-weight: 700; margin-top: 4px; }
    .footer { padding: 24px; text-align: center; font-size: 12px; color: #737373; border-top: 1px solid #262626; }
    .btn { display: inline-block; padding: 16px 32px; background-color: #e11d48; color: #ffffff; text-decoration: none; border-radius: 12px; font-weight: 900; text-transform: uppercase; font-style: italic; font-size: 14px; letter-spacing: 1px; }
`;

const sendBookingConfirmation = async (userEmail, userName, bookingDetails, pdfBuffer) => {
    const { movie, theater, showtime, totalAmount } = bookingDetails;
    
    const mailOptions = {
        from: '"ShowBook" <snapshiksha@gmail.com>',
        to: userEmail,
        subject: `CONFIRMED: ${movie.title}`,
        html: `
            <html>
            <head><style>${premiumStyle}</style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ShowBook</h1>
                    </div>
                    <div class="content">
                        <h2 style="font-weight: 900; font-style: italic; font-size: 24px; margin: 0; color: #e11d48;">BOOKING CONFIRMED</h2>
                        <p style="color: #a3a3a3; font-size: 14px;">Hello ${userName}, get ready for an amazing cinematic experience.</p>
                        
                        <div class="info-box">
                            <div class="info-item">
                                <div class="label">Movie</div>
                                <div class="value" style="font-size: 20px; color: #e11d48; font-style: italic;">${movie.title}</div>
                            </div>
                            <div style="display: flex; gap: 20px;">
                                <div class="info-item" style="flex: 1;">
                                    <div class="label">Date</div>
                                    <div class="value">${new Date(showtime.date).toDateString()}</div>
                                </div>
                                <div class="info-item" style="flex: 1;">
                                    <div class="label">Time</div>
                                    <div class="value">${showtime.startTime}</div>
                                </div>
                            </div>
                            <div class="info-item">
                                <div class="label">Location</div>
                                <div class="value">${theater.name}, ${theater.city}</div>
                            </div>
                            <div class="info-item" style="margin-top: 20px; border-top: 1px dashed #404040; pt: 20px;">
                                <div class="label">Total Amount Due</div>
                                <div class="value" style="font-size: 24px; color: #ffffff;">Rs. ${totalAmount}</div>
                                <p style="font-size: 10px; color: #a3a3a3;">* Please pay at the counselor/counter upon arrival.</p>
                            </div>
                        </div>

                        <p style="text-align: center; color: #737373; font-size: 12px; margin-top: 40px;">
                            We've attached your digital ticket as a PDF. Simply scan the QR code at the theater to enter.
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `,
        attachments: [
            {
                filename: `Ticket-${movie.title.replace(/\s+/g, '-')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending confirmation email:', err);
    }
};

const sendPaymentApproved = async (userEmail, userName, movieTitle) => {
    const mailOptions = {
        from: '"ShowBook" <snapshiksha@gmail.com>',
        to: userEmail,
        subject: `SUCCESS: Payment Received - ${movieTitle}`,
        html: `
            <html>
            <head><style>${premiumStyle}</style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ShowBook</h1>
                    </div>
                    <div class="content" style="text-align: center;">
                        <div style="width: 60px; height: 60px; background-color: #10b981; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 30px;">✓</div>
                        <h2 style="font-weight: 900; font-style: italic; font-size: 24px; margin: 0; color: #10b981;">PAYMENT APPROVED</h2>
                        <p style="color: #a3a3a3; font-size: 14px; margin-top: 10px;">Enjoy your movie, ${userName}!</p>
                        <p style="margin-top: 30px; font-size: 18px; font-weight: 700;">${movieTitle}</p>
                        <p style="color: #737373; font-size: 12px;">Your transaction has been finalized at the venue.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending payment approval email:', err);
    }
};

const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: '"ShowBook" <snapshiksha@gmail.com>',
        to: userEmail,
        subject: 'WELCOME TO SHOWBOOK',
        html: `
            <html>
            <head><style>${premiumStyle}</style></head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ShowBook</h1>
                    </div>
                    <div class="content" style="text-align: center;">
                        <h2 style="font-weight: 900; font-style: italic; font-size: 28px; margin: 0; color: #e11d48;">WELCOME ABOARD!</h2>
                        <p style="color: #a3a3a3; font-size: 16px; margin-top: 20px;">Hello ${userName}, we're thrilled to have you here.</p>
                        <p style="margin: 30px 0;">Experience the magic of cinema with real-time seat selection and instant bookings.</p>
                        <a href="${process.env.FRONTEND_URL}" class="btn">Explore Now Showing</a>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending welcome email:', err);
    }
};

const sendCancellationEmail = async (userEmail, userName, movieTitle, reason = 'expired or manually cancelled') => {
    const mailOptions = {
        from: '"ShowBook" <snapshiksha@gmail.com>',
        to: userEmail,
        subject: `CANCELLATION: ${movieTitle}`,
        html: `
            <html>
            <head><style>${premiumStyle}</style></head>
            <body>
                <div class="container">
                    <div class="header" style="background: #262626;">
                        <h1>ShowBook</h1>
                    </div>
                    <div class="content">
                        <h2 style="font-weight: 900; font-style: italic; font-size: 24px; margin: 0; color: #a3a3a3;">BOOKING CANCELLED</h2>
                        <p style="color: #a3a3a3; font-size: 14px; margin-top: 10px;">Hello ${userName}, your booking for <b>${movieTitle}</b> has been cancelled.</p>
                        <div class="info-box">
                            <div class="label">Reason for cancellation</div>
                            <div class="value">${reason}</div>
                        </div>
                        <p style="color: #737373; font-size: 12px; margin-top: 40px;">If this was a mistake, you can always visit our platform to re-book your seats.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (err) {
        console.error('Error sending cancellation email:', err);
    }
};

module.exports = {
    sendBookingConfirmation,
    sendPaymentApproved,
    sendWelcomeEmail,
    sendCancellationEmail
};
