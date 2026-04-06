const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('Auth Hardening Integration', () => {
    
    test('should prevent account lockout after 5 failed attempts', async () => {
        const email = 'testuser@example.com';
        await User.create({
            name: 'Test User',
            email,
            password: 'CorrectPass123!'
        });

        // 5 Failed attempts
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/api/auth/login')
                .send({ email, password: 'WrongPassword' });
        }

        // 6th attempt should be locked
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email, password: 'CorrectPass123!' });
        
        expect(res.status).toBe(401);
        expect(res.body.error).toContain('Account locked');
    });

    test('should enforce strong password policy', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'New User',
                email: 'new@example.com',
                password: 'small'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.status).toBe('fail');
        expect(res.body.error.details[0].msg).toContain('at least 8 characters');
    });
});
