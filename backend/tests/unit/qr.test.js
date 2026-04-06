const jwt = require('jsonwebtoken');

/**
 * QR Service Test
 * Verifies signed JWT token requirements for ShowBook
 */
describe('QR Token Hardening', () => {
    const secret = 'test_secret';
    process.env.JWT_SECRET = secret;

    const payload = {
        bookingId: '60d21b4667d0d8992e610c85',
        userId: '60d21b4667d0d8992e610c86',
        showtimeId: '60d21b4667d0d8992e610c87'
    };

    test('should generate a valid signed JWT', () => {
        const token = jwt.sign(payload, secret, { expiresIn: '2h' });
        const decoded = jwt.verify(token, secret);
        
        expect(decoded.bookingId).toBe(payload.bookingId);
        expect(decoded.userId).toBe(payload.userId);
    });

    test('should reject tampered tokens', () => {
        const token = jwt.sign(payload, secret);
        const tamperedToken = token.slice(0, -5) + 'abcde';
        
        expect(() => {
            jwt.verify(tamperedToken, secret);
        }).toThrow();
    });

    test('should detect expired tokens', (done) => {
        const token = jwt.sign(payload, secret, { expiresIn: '1s' });
        
        setTimeout(() => {
            expect(() => {
                jwt.verify(token, secret);
            }).toThrow('jwt expired');
            done();
        }, 1500);
    });
});
