const router = require('express').Router();
const auth = require('../middlewares/auth');

const { login, createUser } = require('../controllers/users');

const { createUserValidation, loginValidation } = require('../middlewares/celebrate');

router.post('/signin', loginValidation, login);
router.post('/signup', createUserValidation, createUser);

router.use(auth);

router.use('/users', require('./users'));
router.use('/cards', require('./cards'));

module.exports = router;
