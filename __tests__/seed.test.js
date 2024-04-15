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
      .then(({ body:{topics} }) => {
        expect(topics.length).toBe(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
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
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET404: Non-existent ID", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent ID");
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
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
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
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
});
test("GET404: Invalid ID Input", () => {
  return request(app)
    .get("/api/articles/99/comments")
    .expect(404)
    .then(({ body }) => {
      const { msg } = body;
      expect(msg).toBe("Non-existent ID");
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
