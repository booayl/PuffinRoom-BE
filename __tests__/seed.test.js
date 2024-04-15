const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const endpoints = require("../endpoints.json")

beforeAll(() => seed(data));
afterAll(() => db.end());

describe("404 Invalid Endpoint",()=>{
    test("GET ALL 404: Endpoint not found",()=>{
        return request(app)
        .get("/api/topic")
        .expect(404)
        .then((body)=>{
            expect(body.status).toBe(404)
            expect(body.text).toBe("Invalid Endpoint")
        })
      });
})

describe("GET /api", () => {
    test("GET200: provide a description of all other endpoints available", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then((res) => {
          expect(res.body.endpoints).toEqual(endpoints);
        });
    })
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
  })
});
