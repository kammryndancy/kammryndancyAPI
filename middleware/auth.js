// Auth middleware: expects 'authorization: Basic <base64(userid:apikey:role)>'
const roles = require('./roles');

module.exports = function (req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const encoded = authHeader.slice(6).trim();
  let decoded;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8');
  } catch {
    return res.status(401).json({ error: 'Invalid base64 encoding' });
  }

  const [userId, apiKey, role] = decoded.split(':');
  if (
    userId !== process.env.USER_ID ||
    apiKey !== process.env.API_KEY
  ) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  // Role check
  const reqOrigin = req.headers['origin'] || req.headers['referer'] || '';
  let assignedRole = role || 'default';
  if (userId === process.env.USER_ID && assignedRole !== 'admin' && reqOrigin.includes(process.env.FRONTEND_ORIGIN)) {
    assignedRole = 'frontend';
  }
  req.user = { userId, role: assignedRole };
  next();
};
