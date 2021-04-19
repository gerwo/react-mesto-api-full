const router = require('express').Router();

const {
  createCardValidation,
  deleteCardValidation,
  changeCardLikeStatus,
} = require('../middlewares/celebrate');

const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCardValidation, createCard);
router.delete('/:cardId', deleteCardValidation, deleteCard);
router.put('/:cardId/likes', changeCardLikeStatus, likeCard);
router.delete('/:cardId/likes', changeCardLikeStatus, dislikeCard);

module.exports = router;
