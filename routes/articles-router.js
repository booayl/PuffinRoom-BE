const articleRouter = require("express").Router();

const {
    getArticleById,
    getArticles,
    getCommentsByArticleID,
    postComment,
    patchArticle
  } = require("../controllers");
  
articleRouter.get('/', getArticles);

articleRouter.route('/:article_id')
.get(getArticleById)
.patch(patchArticle);

articleRouter.route('/:article_id/comments')
.get(getCommentsByArticleID)
.post(postComment);

module.exports = articleRouter;