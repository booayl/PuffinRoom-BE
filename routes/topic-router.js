const topicRouter = require("express").Router();

const {
  getTopics,
  getCommentsByArticleID,
  postComment,
  patchArticle,
  deleteComment,
  getUsers,
} = require("../controllers");

topicRouter.get('/', getTopics);

module.exports = topicRouter;
