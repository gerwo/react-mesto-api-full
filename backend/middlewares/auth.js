const jwt = require('jsonwebtoken');

const { JWT_SECRET = 'secret-key' } = process.env;

const UnauthorizedError = require('../errors/unauthorized-err');

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    throw new UnauthorizedError('Токен не передан');
  }

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new UnauthorizedError('Передан некорректный токен');
  }

  req.user = payload;

  next();
};

module.exports = auth;
