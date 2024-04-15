const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const endpoints = require("../endpoints.json");

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("404 Invalid Endpoint", () => {
  test("GET ALL 404: Endpoint not found", () => {
    return request(app)
      .get("/api/topic")
      .expect(404)
      .then((body) => {
        expect(body.status).toBe(404);
        expect(body.text).toBe("Invalid Endpoint");
      });
  });
});

describe("GET /api", () => {
  test("GET200: provide a description of all other endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});

describe("GET /api/topics", () => {
  test("GET200: Endpoint responds with an array of topic objects with slug and description", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const topics = body;
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(typeof topic.slug).toBe("string");
          expect(typeof topic.description).toBe("string");
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("GET200: Endpoint responds with selected article by its ID", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(typeof article.author).toBe("string");
        expect(typeof article.title).toBe("string");
        expect(typeof article.article_id).toBe("number");
        expect(typeof article.body).toBe("string");
        expect(typeof article.topic).toBe("string");
        expect(typeof article.created_at).toBe("string");
        expect(typeof article.votes).toBe("number");
        expect(typeof article.article_img_url).toBe("string");
      });
  });
  test("GET400: Invalid ID Input", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid ID Input");
      });
  });
  test("GET400: Invalid Input Type", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid ID Type");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET200: Endpoint responds with an array of article objects with all properties from articles table, and additionally a comment_count queried from comment table. Articles default sorted by date in descending order.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles.length).toBe(13);
        expect(allArticles).toBeSortedBy("created_at", { descending: true });
        allArticles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("GET200: Endpoint responds with an array of comments objects from selected article by article ID. Comments served with the most recent comments first.", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body: { allComments } }) => {
        expect(allComments.length).toBe(11);
        expect(allComments).toBeSortedBy("created_at", { descending: true });
        allComments.forEach((comment) => {
          expect(typeof comment.comment_id).toBe("number");
          expect(typeof comment.votes).toBe("number");
          expect(typeof comment.created_at).toBe("string");
          expect(typeof comment.author).toBe("string");
          expect(typeof comment.body).toBe("string");
          expect(comment.article_id).toBe(1);
        });
      });
  }) ;
  test("GET400: Invalid ID Input", () => {
    return request(app)
      .get("/api/articles/99/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid ID Input");
      });
  });
  test("GET400: Invalid Input Type", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid ID Type");
      });
  });
});
