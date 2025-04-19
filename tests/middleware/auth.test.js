const auth = require('../../middleware/auth');

// Store original environment variables
const originalEnv = process.env;

describe('Auth Middleware', () => {
  // Mock request, response, and next function
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Reset mocks before each test
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    // Mock environment variables
    process.env = {
      ...originalEnv,
      USER_ID: 'test-user',
      API_KEY: 'test-api-key',
      FRONTEND_ORIGIN: 'https://example.com'
    };
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  it('should return 401 if authorization header is missing', () => {
    auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header format is invalid', () => {
    req.headers.authorization = 'InvalidFormat';
    
    auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if base64 encoding is invalid', () => {
    req.headers.authorization = 'Basic !!!invalid-base64!!!';
    
    auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if credentials are invalid', () => {
    // Valid base64 but wrong credentials
    const invalidCredentials = Buffer.from('wrong-user:wrong-key:admin').toString('base64');
    req.headers.authorization = `Basic ${invalidCredentials}`;
    
    auth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should set user with admin role and call next() if valid admin credentials', () => {
    const validCredentials = Buffer.from('test-user:test-api-key:admin').toString('base64');
    req.headers.authorization = `Basic ${validCredentials}`;
    
    auth(req, res, next);
    
    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: 'test-user',
      role: 'admin'
    });
  });

  it('should assign frontend role for valid credentials with frontend origin', () => {
    const validCredentials = Buffer.from('test-user:test-api-key').toString('base64');
    req.headers.authorization = `Basic ${validCredentials}`;
    req.headers.origin = 'https://example.com';
    
    auth(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: 'test-user',
      role: 'frontend'
    });
  });

  it('should use default role if no role provided and not from frontend', () => {
    const validCredentials = Buffer.from('test-user:test-api-key').toString('base64');
    req.headers.authorization = `Basic ${validCredentials}`;
    // No origin or referer set
    
    auth(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: 'test-user',
      role: 'default'
    });
  });

  it('should use provided role if valid and not from frontend', () => {
    const validCredentials = Buffer.from('test-user:test-api-key:custom-role').toString('base64');
    req.headers.authorization = `Basic ${validCredentials}`;
    // No origin or referer set
    
    auth(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({
      userId: 'test-user',
      role: 'custom-role'
    });
  });
});
