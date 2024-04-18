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
      .then(({ body: { topics } }) => {
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
          created_at: expect.toBeDateString(),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("GET404: Respond with an error when passed ID is valid but non-existent", () => {
    return request(app)
      .get("/api/articles/99")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent ID");
      });
  });
  test("GET400: Respond with an error when passed an ID that is of the incorrect type", () => {
    return request(app)
      .get("/api/articles/not-a-number")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/articles", () => {
  test("GET200: Endpoint responds with an array of article objects with all properties from articles table, and additionally a comment_count queried from comment table. Articles default sorted by date in descending order.", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles).toBeSortedBy("created_at", { descending: true });
        allArticles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.toBeDateString(),
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
            created_at: expect.toBeDateString(),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 1,
          });
        });
      });
  });
  test("GET200: Endpoint responds with an empty array when selected article by article ID have no comment.", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { allComments } }) => {
        allComments.forEach((comment) => {
          expect(comment).toEqual([]);
        });
      });
  });
  test("GET404: Respond with an error when passed ID is valid but non-existent", () => {
    return request(app)
      .get("/api/articles/99/comments")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent Article ID");
      });
  });
  test("GET400: Respond with an error when passed an ID that is of the incorrect type", () => {
    return request(app)
      .get("/api/articles/not-a-number/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST201: post a comment for an article(seleted by article ID), accept VARCHAR properties: username and body. Will responds with the newly posted comment", () => {
    const newComment = {
      username: "rogersop",
      body: "Isn't that sweet, i guess so",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { postedComment } }) => {
        expect(postedComment).toMatchObject({
          comment_id: 19,
          votes: expect.any(Number),
          created_at: expect.toBeDateString(),
          author: newComment.username,
          body: newComment.body,
          article_id: 2,
        });
      });
  });
  test("POST404: Respond with an error when passed ID is valid but non-existent. ", () => {
    const newComment = {
      username: "rogersop",
      body: "Isn't that sweet, i guess so",
    };
    return request(app)
      .post("/api/articles/99/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
  test("POST400: Respond with an error when an input article ID is the incorrect type", () => {
    const newComment = {
      username: "rogersop",
      body: "Isn't that sweet, i guess so",
    };
    return request(app)
      .post("/api/articles/not-a-number/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
  test("POST404: Respond with an error when new input comments type is incorrect", () => {
    const newComment = {
      username: 123,
      body: "Isn't that sweet, i guess so",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
  test("POST400: Respond with an error when incomplete/missing body", () => {
    const newComment = {
      username: "rogersop",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Incomplete/Missing Body");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH200: update an article by article_id, and respond with new updated article ", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(200)
      .then(({ body: { updatedArticle } }) => {
        expect(updatedArticle).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          created_at: expect.toBeDateString(),
          votes: 101,
          article_img_url: expect.any(String),
        });
      });
  });
  test("PATCH400: Respond with an error when newVote is not in the required obj key pair value form", () => {
    const newVote = "1";
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid Form Body");
      });
  });
  test("PATCH404: Respond with an error when passed ID is valid but non-existent.", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/99")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent Article ID");
      });
  });
  test("PATCH400: Respond with an error when an input article ID is the incorrect type", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/articles/not-a-number")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
  test("PATCH400: Respond with an error when invalid body", () => {
    const newVote = {
      inc_votes: "abc",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE204: delete the given comment by comment_id", () => {
    return request(app)
      .delete("/api/comments/1")
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
  test("DELETE404: Respond with an error when passed ID is valid but non-existent.", () => {
    return request(app)
      .delete("/api/comments/99")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent Comment ID");
      });
  });
  test("DELETE400: Respond with an error when an input comment ID is the incorrect type", () => {
    return request(app)
      .delete("/api/comments/not-a-number")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("GET /api/users", () => {
  test("GET200: Endpoint responds with an array of users objects with username, name, avatar_url", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users.length).toBe(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles (Add Feature: topic query)", () => {
  test("GET200: Endpoint accept topic query and responds articles with seleted topics", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles.length).toBe(1);
        allArticles.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: "cats",
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.toBeDateString(),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET404: Respond with an error when passed non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=abc")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Query Not Found");
      });
  });
  test("GET400: Respond with an error when invalid query", () => {
    return request(app)
      .get("/api/articles?abc=cats")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid query");
      });
  });
});

describe("GET /api/articles/:article_id (Add Feature: comment_count)", () => {
  test("GET200: Endpoint responds with selected article by its ID and including it's total count of comment(comment_count)", () => {
    return request(app)
      .get("/api/articles/10")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 10,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.toBeDateString(),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
  });
});

describe("GET /api/articles (Add Feature: sorting queries)", () => {
  test("GET200: Endpoint now accept queries for sort_by (any valid column from articles) and order (asc or desc)", () => {
    return request(app)
      .get("/api/articles?sort_by=comment_count&order=asc")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles).toBeSortedBy("comment_count", { ascending: true });
        allArticles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.toBeDateString(),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("GET200: Sort_by and order queries are optional, if not exsist, default is sort_by = created_at, order = descending.", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles).toBeSortedBy("author", { descending: true });
      });
  });
  test("GET400: Respond with an error when passed in invalid / non-existent sort_by queries", () => {
    return request(app)
      .get("/api/articles?sort_by=abc")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid query");
      });
  });
  test("GET400: Respond with an error when passed in invalid / non-existent order queries", () => {
    return request(app)
      .get("/api/articles?order=abc")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid query");
      });
  });
});

describe("GET /api/users/:username", () => {
  test("GET200: Endpoint responds user by username with an array of users objects with username, name, avatar_url", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: expect.any(String),
          name: expect.any(String),
          avatar_url: expect.any(String),
        });
      });
  });
  test("GET404: Respond with an error when passed in a non-existent or invalid username", () => {
    return request(app)
      .get("/api/users/abc")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent Username");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("PATCH200: update the votes on the selected comment by it's ID, and respond with new updated comment ", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/2")
      .send(newVote)
      .expect(200)
      .then(({ body: { updatedComment } }) => {
        expect(updatedComment).toMatchObject({
          comment_id: 2,
          body: expect.any(String),
          article_id: expect.any(Number),
          author: expect.any(String),
          created_at: expect.toBeDateString(),
          votes: 15,
        });
      });
  });
  test("PATCH400: Respond with an error when newVote is not in the required obj key pair value form", () => {
    const newVote = "1";
    return request(app)
      .patch("/api/comments/2")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Invalid Form Body");
      });
  });
  test("PATCH404: Respond with an error when passed ID is valid but non-existent.", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/123")
      .send(newVote)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Non-existent Comment ID");
      });
  });
  test("PATCH400: Respond with an error when an input comment ID is the incorrect type", () => {
    const newVote = {
      inc_votes: 1,
    };
    return request(app)
      .patch("/api/comments/not-a-number")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
  test("PATCH400: Respond with an error when invalid body", () => {
    const newVote = {
      inc_votes: "abc",
    };
    return request(app)
      .patch("/api/comments/1")
      .send(newVote)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Bad Request");
      });
  });
});

describe("POST /api/articles", () => {
  test("POST201: adds a new article, will responds with the newly added article.", () => {
    const newPost = {
      author: "rogersop",
      title: "Which is your favourite Taylor Swift boyfriend",
      body: "Joe, I mean have you seen the easter eggs for The Tortured Poets Department? ",
      topic : "cats",
      article_img_url : "https://media.tenor.com/K-4KulpZoNUAAAAM/yes-taylor-swift.gif"
    };
    return request(app)
      .post("/api/articles")
      .send(newPost)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.toBeDateString(),
          author: newPost.author,
          body: newPost.body,
          title: newPost.title,
          topic: newPost.topic,
          article_img_url: newPost.article_img_url,
        });
      });  
  });
  test("POST201: Responds with the newly added article includes comment_count", () => {
    const newPost = {
      author: "rogersop",
      title: "Which is your favourite Taylor Swift boyfriend",
      body: "Joe, I mean have you seen the easter eggs for The Tortured Poets Department? ",
      topic : "cats",
      article_img_url : "https://media.tenor.com/K-4KulpZoNUAAAAM/yes-taylor-swift.gif"
    };
    return request(app)
      .post("/api/articles")
      .send(newPost)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.toBeDateString(),
          author: newPost.author,
          body: newPost.body,
          title: newPost.title,
          topic: newPost.topic,
          article_img_url: newPost.article_img_url,
          comment_count: expect.any(Number)
        });
      });  
  });
  test("POST201: will default article_img_url if not provided", () => {
    const newPost = {
      author: "rogersop",
      title: "Which is your favourite Taylor Swift boyfriend",
      body: "Joe, I mean have you seen the easter eggs for The Tortured Poets Department? ",
      topic : "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newPost)
      .expect(201)
      .then(({ body: { newArticle } }) => {
        expect(newArticle).toMatchObject({
          article_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.toBeDateString(),
          author: newPost.author,
          body: newPost.body,
          title: newPost.title,
          topic: newPost.topic,
          article_img_url: "https://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png",
          comment_count: expect.any(Number)
        });
      });  
  });
  test("POST404: Respond with an error when foreign key (author & topic) is invalid or non-existence", () => {
    const newPost = {
      author: 123,
      title: "Which is your favourite Taylor Swift boyfriend",
      body: "Joe, I mean have you seen the easter eggs for The Tortured Poets Department? ",
      topic : "abc",
    };
    return request(app)
      .post("/api/articles")
      .send(newPost)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Not Found");
      });
  });
  test("POST400: Respond with an error when incomplete/missing body", () => {
    const newComment = {
      author: "rogersop",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Incomplete/Missing Body");
      });
  });
});

describe("GET /api/articles (pagination)",()=>{
  test("GET200: Implement pagination on /api/articles, accept two queries: limit (default to 10) and p (start page), will responds with the articles paginated according to the inputs, and a total_count preperty",()=>{
    return request(app)
      .get("/api/articles?sort_by=article_id&order=asc&topic=mitch&limit=3&p=2")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles.length).toBe(3);
        allArticles.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.toBeDateString(),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
            total_count: 12
          });
        });
      });
  })
  test("GET200: set limit default to 10 and page default to first page",()=>{
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { allArticles } }) => {
        expect(allArticles.length).toBe(10);
        allArticles.forEach((article) => {
          expect(article).toMatchObject({
            title: expect.any(String),
            topic: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            created_at: expect.toBeDateString(),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
            total_count: 16
          });
        });
      });
  })
  test("GET400: respond with error when requested page not exisit",()=>{
    return request(app)
      .get("/api/articles?p=3")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("Query Not Found");
      });
  })
})