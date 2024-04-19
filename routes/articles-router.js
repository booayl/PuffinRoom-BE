const articleRouter = require("express").Router();

const {
    getArticleById,
    getArticles,
    getCommentsByArticleID,
    postComment,
    patchArticle,
    postArticle,
    deleteArticle
  } = require("../controllers");
  
articleRouter.route('/')
.get(getArticles)
.post(postArticle);

articleRouter.route('/:article_id')
.get(getArticleById)
.patch(patchArticle)
.delete(deleteArticle)


articleRouter.route('/:article_id/comments')
.get(getCommentsByArticleID)
.post(postComment);

module.exports = articleRouter;