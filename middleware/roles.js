// roles.js
// Define allowed roles and origins

const roles = {
  admin: {
    can: ['*'],
    origins: ['*']
  },
  frontend: {
    can: ['read', 'filter', 'view'],
    origins: [process.env.FRONTEND_ORIGIN]
  },
  default: {
    can: ['read'],
    origins: []
  }
};

module.exports = roles;
