const authMiddleware = require('../../middleware/auth');

// Mock the roles module
jest.mock('../../middleware/roles', () => ({
  admin: { can: ['*'], origins: ['*'] },
  frontend: { can: ['read', 'filter', 'view'], origins: ['https://example.com'] },
  default: { can: ['read'], origins: [] }
}));

describe('Auth Middleware', () => {
  // Store original environment variables
  const originalEnv = process.env;
  
  beforeEach(() => {
    // Setup environment for tests
    process.env = { 
      ...originalEnv,
      USER_ID: 'test-user',
      API_KEY: 'test-key',
      FRONTEND_ORIGIN: 'https://example.com'
    };
    
    // Reset mocks for each test
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Cleanup
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Restore environment
    process.env = originalEnv;
  });
  
  test('should reject requests without authorization header', () => {
    const req = { headers: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    authMiddleware(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
  
  test('should authenticate valid credentials', () => {
    const credentials = Buffer.from('test-user:test-key').toString('base64');
    const req = { headers: { authorization: `Basic ${credentials}` } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('test-user');
    expect(req.user.role).toBe('default');
  });
  
  test('should assign admin role when specified', () => {
    const credentials = Buffer.from('test-user:test-key:admin').toString('base64');
    const req = { headers: { authorization: `Basic ${credentials}` } };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('admin');
  });
  
  test('should assign frontend role for frontend requests', () => {
    const credentials = Buffer.from('test-user:test-key').toString('base64');
    const req = { 
      headers: { 
        authorization: `Basic ${credentials}`,
        origin: 'https://example.com'
      } 
    };
    const res = { status: jest.fn(), json: jest.fn() };
    const next = jest.fn();
    
    authMiddleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user.role).toBe('frontend');
  });
});
