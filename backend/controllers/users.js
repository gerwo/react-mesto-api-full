const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET } = process.env;
const User = require('../models/user');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email и пароль не должны быть пустыми');
  }

  User.findUserByCredentials(email, password)
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Неправильные почта или пароль');
      }

      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
        { expiresIn: '7d' },
      );

      res.cookie('jwt', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        expiresIn: (3600 * 24 * 7),
      })
        .send({ message: 'Вы авторизовались!' });
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Email и пароль не должны быть пустыми');
  }
  User.findOne({ email })
    .then((existedUser) => {
      if (existedUser) {
        throw new BadRequestError('Пользователь с таким email уже существует');
      }

      bcrypt.hash(password, 10)
        .then((hash) => User.create({
          name,
          about,
          avatar,
          email,
          password: hash,
        }))
        .then((createdUser) => {
          if (!createdUser) {
            throw new BadRequestError('Переданы некорректные данные');
          }

          User.findOne({ email })
            .then((user) => res.send(user));
        });
    })
    .catch(next);
};

const signout = (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  }).send({ message: 'Успешный выход' });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      res.send(user);
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователя с указанным id не существует');
      }

      res.send(user);
    })
    .catch(next);
};

const updateUserProfile = (req, res, next) => {
  const userId = req.user._id;
  const { name, about } = { ...req.body };

  User.findByIdAndUpdate(
    userId,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        throw new BadRequestError('Переданы некорректные данные');
      }

      res.send(user);
    })
    .catch(next);
};

const updateUserAvatar = (req, res, next) => {
  const userId = req.user._id;
  const { avatar } = { ...req.body };

  User.findByIdAndUpdate(
    userId,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((avatar) => {
      if (!avatar) {
        throw new BadRequestError('Переданы некорректные данные');
      }

      res.send(avatar);
    })
    .catch(next);
};

module.exports = {
  login,
  createUser,
  signout,
  getCurrentUser,
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
};
