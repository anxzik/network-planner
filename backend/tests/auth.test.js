const authMiddleware = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');

process.env.JWT_SECRET = 'testsecret';

describe('Auth Middleware', () => {
    it('should return 401 if no token is provided', () => {
        const req = httpMocks.createRequest();
        const res = httpMocks.createResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(res._getJSONData()).toEqual({ message: 'Access Denied' });
        expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if valid token is provided', () => {
        const token = jwt.sign({ id: '123' }, 'testsecret');
        const req = httpMocks.createRequest({
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
        expect(req.user.id).toBe('123');
    });

    it('should return 400 if token is invalid', () => {
        const req = httpMocks.createRequest({
            headers: {
                Authorization: 'Bearer invalidtoken'
            }
        });
        const res = httpMocks.createResponse();
        const next = jest.fn();

        authMiddleware(req, res, next);

        expect(res.statusCode).toBe(400);
        expect(res._getJSONData()).toEqual({ message: 'Invalid Token' });
        expect(next).not.toHaveBeenCalled();
    });
});
