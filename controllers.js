const { fetchTopics, fetchArticle } = require("./model");

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send(topics);
  });
};

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticle(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};
