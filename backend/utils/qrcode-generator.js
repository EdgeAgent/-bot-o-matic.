const QRCode = require('qrcode');
const { nanoid } = require('nanoid');

/**
 * Generate a unique redemption code
 * @returns {string} - Short, unique code (e.g., "abc123XYZ")
 */
function generateRedemptionCode() {
    return nanoid(10);
}

/**
 * Generate QR code data URL for redemption
 * @param {string} code - Redemption code
 * @returns {Promise<string>} - QR code data URL
 */
async function generateQRCode(code) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redemptionUrl = `${appUrl}/redeem/${code}`;

    try {
        const qrDataUrl = await QRCode.toDataURL(redemptionUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 300
        });

        return qrDataUrl;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
}

/**
 * Get redemption URL from code
 * @param {string} code - Redemption code
 * @returns {string} - Full redemption URL
 */
function getRedemptionUrl(code) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${appUrl}/redeem/${code}`;
}

module.exports = {
    generateRedemptionCode,
    generateQRCode,
    getRedemptionUrl
};
