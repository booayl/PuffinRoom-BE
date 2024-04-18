const commentRouter = require("express").Router();

const {
  deleteComment,
  patchComment
} = require("../controllers");

commentRouter.route('/:comment_id', deleteComment)
.delete(deleteComment)
.patch(patchComment);


module.exports = commentRouter;