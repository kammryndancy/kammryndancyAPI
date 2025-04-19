const authMiddleware = require('../../middleware/auth');

// Save original environment variables
const originalEnv = { ...process.env };

describe('Auth Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Setup fresh mocks for each test
    req = { headers: {} };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(() => res)
    };
    next = jest.fn();
    
    // Setup test environment variables
    process.env.USER_ID = 'test-user';
    process.env.API_KEY = 'test-key';
    process.env.FRONTEND_ORIGIN = 'https://example.com';
  });
  
  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });
  
  test('should return 401 if Authorization header is missing', () => {
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should return 401 if Authorization header is invalid format', () => {
    req.headers.authorization = 'Invalid';
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should return 401 if base64 encoding is invalid', () => {
    req.headers.authorization = 'Basic invalid!base64';
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should return 401 if credentials are invalid', () => {
    const base64Credentials = Buffer.from('wrong-user:wrong-key').toString('base64');
    req.headers.authorization = `Basic ${base64Credentials}`;
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should call next() with valid credentials and set default role', () => {
    const base64Credentials = Buffer.from('test-user:test-key').toString('base64');
    req.headers.authorization = `Basic ${base64Credentials}`;
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'test-user', role: 'default' });
    expect(res.status).not.toHaveBeenCalled();
  });
  
  test('should set admin role if provided in credentials', () => {
    const base64Credentials = Buffer.from('test-user:test-key:admin').toString('base64');
    req.headers.authorization = `Basic ${base64Credentials}`;
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'test-user', role: 'admin' });
  });
  
  test('should set frontend role for requests from frontend origin', () => {
    const base64Credentials = Buffer.from('test-user:test-key').toString('base64');
    req.headers.authorization = `Basic ${base64Credentials}`;
    req.headers.origin = 'https://example.com';
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: 'test-user', role: 'frontend' });
  });
});
