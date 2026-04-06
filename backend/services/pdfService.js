const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { generateQRCodeBuffer } = require('./qrService');

/**
 * Generates a dynamic PDF ticket
 * @param {object} booking - Booking and associated details
 * @returns {Promise<Buffer>} - Ticket PDF as a buffer
 */
const generateTicketPDF = async (booking) => {
    try {
        const { user, movie, theater, screen, showtime, seats, totalAmount, qrToken } = booking;
        
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([400, 600]);
        const { height } = page.getSize();
        
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Header - BookMyShow Branding
        page.drawRectangle({
            x: 0,
            y: height - 80,
            width: 400,
            height: 80,
            color: rgb(0.88, 0.11, 0.28) // #E11D48
        });

        page.drawText('BookMyShow Ticket', {
            x: 50,
            y: height - 50,
            size: 24,
            font: boldFont,
            color: rgb(1, 1, 1)
        });

        // Movie Info
        page.drawText(movie.title, { x: 50, y: height - 100, size: 18, font: boldFont });
        page.drawText(`${showtime.language} | ${showtime.format}`, { x: 50, y: height - 120, size: 12, font });

        // Theater & Screen
        page.drawText(`${theater.name}, ${theater.city}`, { x: 50, y: height - 150, size: 14, font });
        page.drawText(`${screen.name}`, { x: 50, y: height - 170, size: 12, font });

        // Date & Time
        const dateStr = new Date(showtime.date).toLocaleDateString('en-US', {
            weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
        });
        page.drawText(`${dateStr} | ${showtime.startTime}`, { x: 50, y: height - 200, size: 14, font: boldFont });

        // Seats
        const seatStr = seats.map(s => `${s.row}${s.col} (${s.type})`).join(', ');
        page.drawText(`Seats: ${seatStr}`, { x: 50, y: height - 230, size: 12, font });

        // Amount Due
        page.drawText(`AMOUNT DUE AT THEATER: Rs. ${totalAmount}`, {
            x: 50, y: height - 260, size: 14, font: boldFont, color: rgb(0, 0, 0)
        });

        // QR Code embedding
        const qrBuffer = await generateQRCodeBuffer(qrToken);
        const qrImage = await pdfDoc.embedPng(qrBuffer);
        const qrDims = qrImage.scale(0.5);

        page.drawImage(qrImage, {
            x: 125,
            y: 50,
            width: qrDims.width,
            height: qrDims.height
        });

        page.drawText('Scan at theater to pay & enter', {
            x: 110,
            y: 30,
            size: 10,
            font,
            color: rgb(0.4, 0.4, 0.4)
        });

        const pdfBytes = await pdfDoc.save();
        return Buffer.from(pdfBytes);
    } catch (err) {
        console.error('Error generating PDF:', err);
        throw new Error('PDF generation failed');
    }
};

module.exports = {
    generateTicketPDF
};
