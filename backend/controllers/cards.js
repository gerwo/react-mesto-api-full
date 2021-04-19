const Card = require('../models/card');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const userId = req.user._id;
  const { name, link } = { ...req.body };

  Card.create({ name, link, owner: userId })
    .then((card) => {
      if (!card) {
        throw new BadRequestError('Переданы некорректные данные');
      }

      res.send(card);
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  const id = req.params.cardId;

  Card.findById({ _id: id })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Указанная карточка не найдена');
      }
      if (JSON.stringify(card.owner) !== JSON.stringify(req.user._id)) {
        throw new ForbiddenError('У вас нет прав для удаления данной карточки');
      }

      Card.deleteOne({ _id: id })
        .then((deletedCard) => {
          res.send(deletedCard);
        });
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  const id = req.params.cardId;
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    id,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }

      res.send(card);
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  const id = req.params.cardId;
  const userId = req.user._id;

  Card.findByIdAndUpdate(id, { $pull: { likes: userId } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      res.send(card);
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
