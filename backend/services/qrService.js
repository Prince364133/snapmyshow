const QRCode = require('qrcode');

/**
 * Generates a QR Code as a Data URL (Base64 string)
 * @param {string} text - The content to encode in the QR code (e.g. Booking Token)
 * @returns {Promise<string>} - Base64 Data URL
 */
const generateQRCodeBase64 = async (text) => {
    try {
        const qrDataURL = await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        return qrDataURL;
    } catch (err) {
        console.error('Error generating QR code:', err);
        throw new Error('QR Code generation failed');
    }
};

/**
 * Generates a QR Code as a Buffer (useful for PDF embedding)
 * @param {string} text - The content to encode
 * @returns {Promise<Buffer>} - Image buffer
 */
const generateQRCodeBuffer = async (text) => {
    try {
        const qrBuffer = await QRCode.toBuffer(text, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300
        });
        return qrBuffer;
    } catch (err) {
        console.error('Error generating QR buffer:', err);
        throw new Error('QR Code generation failed');
    }
};

module.exports = {
    generateQRCodeBase64,
    generateQRCodeBuffer
};
