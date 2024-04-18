const comments = require("./db/data/test-data/comments");
const {
  fetchTopics,
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticleID,
  checkArticleExists,
  createComment,
  updatedArticle,
  removeComment,
  fetchUsers,
  validateQuery,
  retrieveUser,
  updateComment,
  createArticle,
  countRows
} = require("./model");

exports.getTopics = (req, res, next) => {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
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
  const { sort_by, order, topic, limit, p } = req.query;
  const queries = Object.keys(req.query);

  Promise.all([fetchArticles(sort_by, order, topic, limit, p), validateQuery(queries)])
    .then(([articles]) => {
      res.status(200).send({ allArticles: articles});
    })
    .catch((err) => {
      next(err);
    });
};

exports.getCommentsByArticleID = (req, res, next) => {
  const { article_id } = req.params;
  const { sort_by, order } = req.query;

  Promise.all([
    fetchCommentsByArticleID(article_id, sort_by, order),
    checkArticleExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ allComments: comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (req, res, next) => {
  const { article_id } = req.params;
  const newComment = req.body;
  createComment(article_id, newComment)
    .then((comments) => {
      res.status(201).send({ postedComment: comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updatedArticle(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ updatedArticle: article });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  removeComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUsers = (req, res, next) => {
  fetchUsers().then((users) => {
    res.status(200).send({ users });
  });
};

exports.selectUser = (req, res, next) => {
  const { username } = req.params;
  retrieveUser(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;
  updateComment(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ updatedComment: comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArticle = (req,res,next) =>{
  const newArticle = req.body;
  createArticle(newArticle)
    .then((article) => {
      res.status(201).send({ newArticle: article });
    })
    .catch((err) => {
      next(err);
    });
}