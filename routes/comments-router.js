const commentRouter = require("express").Router();

const {
  deleteComment,
} = require("../controllers");

commentRouter.delete('/:comment_id', deleteComment);

module.exports = commentRouter;