const router = require('express').Router();

const {
  getUserByIdValidation,
  updateUserProfileValidation,
  updateUserAvatarValidation,
} = require('../middlewares/celebrate');

const {
  getCurrentUser,
  getUsers,
  getUserById,
  updateUserProfile,
  updateUserAvatar,
} = require('../controllers/users');

router.get('/me', getCurrentUser);
router.get('/', getUsers);
router.get('/:userId', getUserByIdValidation, getUserById);
router.patch('/me', updateUserProfileValidation, updateUserProfile);
router.patch('/me/avatar', updateUserAvatarValidation, updateUserAvatar);

module.exports = router;
