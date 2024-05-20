const topicRouter = require("express").Router();

const {
  getTopics,
  postTopic,
  deleteTopic
} = require("../controllers");

topicRouter.route('/')
.get(getTopics)
.post(postTopic)

topicRouter.route('/:topic_slug')
.delete(deleteTopic)

module.exports = topicRouter;
