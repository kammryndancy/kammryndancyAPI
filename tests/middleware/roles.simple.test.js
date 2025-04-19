process.env.FRONTEND_ORIGIN = 'https://example.com';
describe('Roles Configuration', () => {
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv, FRONTEND_ORIGIN: 'https://example.com' };
    // Clear require cache for roles middleware
    delete require.cache[require.resolve('../../middleware/roles')];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('should have admin role with all permissions', () => {
    const roles = require('../../middleware/roles');
    expect(roles.admin).toBeDefined();
    expect(roles.admin.can).toContain('*');
    expect(roles.admin.origins).toContain('*');
  });

  test('should have frontend role with specific permissions', () => {
    const roles = require('../../middleware/roles');
    expect(roles.frontend).toBeDefined();
    expect(roles.frontend.can).toContain('read');
    expect(roles.frontend.can).toContain('filter');
    expect(roles.frontend.can).toContain('view');
    expect(roles.frontend.can).not.toContain('*');
    expect(roles.frontend.origins).toContain('https://example.com');
  });

  test('should have default role with minimal permissions', () => {
    const roles = require('../../middleware/roles');
    expect(roles.default).toBeDefined();
    expect(roles.default.can).toContain('read');
    expect(roles.default.can).not.toContain('*');
    expect(roles.default.can).not.toContain('write');
    expect(roles.default.origins).toEqual([]);
  });
});
