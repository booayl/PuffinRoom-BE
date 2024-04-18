const articleRouter = require("express").Router();

const {
    getArticleById,
    getArticles,
    getCommentsByArticleID,
    postComment,
    patchArticle
  } = require("../controllers");
  
articleRouter.get('/:article_id', getArticleById);
articleRouter.get('/', getArticles);


articleRouter.get("/:article_id/comments", getCommentsByArticleID);
articleRouter.post("/:article_id/comments", postComment);
articleRouter.patch("/:article_id", patchArticle);
  
module.exports = articleRouter;