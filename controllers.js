const { fetchTopics, fetchArticleById, fetchArticles, fetchCommentsByArticleID } = require("./model");

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send(topics);
  });
};

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  const { sort_by, order } = req.query;
  fetchArticles(sort_by, order).then((articles) => {
    res.status(200).send({ allArticles: articles });
  });
};

exports.getCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { sort_by, order } = req.query;
  fetchCommentsByArticleID(article_id, sort_by, order).then((comments) => {
    res.status(200).send({ allComments: comments });
  }).catch((err) => {
    next(err);
  });
};
