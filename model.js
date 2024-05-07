const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = (article_id) => {
  let sqlQueryString = `SELECT articles.*,
    COUNT(comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id`;

  return db.query(sqlQueryString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Non-existent ID" });
    }
    return rows[0];
  });
};

exports.fetchArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 1
) => {
  const validSortBys = [
    "created_at",
    "votes",
    "article_id",
    "author",
    "body",
    "article_img_url",
    "title",
    "topic",
    "comment_count",
  ];
  const validOrder = ["desc", "asc"];

  if (!validSortBys.includes(sort_by) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid query" });
  }

  let sqlQueryString = `SELECT articles.*,
    COUNT(comments.article_id)::INT AS comment_count,
    COUNT(*) OVER()::INT AS total_count
    FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id `;

  let topicValue = [];

  if (topic) {
    sqlQueryString += `WHERE topic LIKE $1 `;
    topicValue.push(topic);
  }

  sqlQueryString += `GROUP BY articles.article_id ORDER BY ${sort_by} ${order.toUpperCase()} LIMIT ${limit} `;

  if (p) {
    sqlQueryString += `OFFSET ${limit} * ${p - 1};`;
  }

  return db.query(`SELECT slug FROM topics WHERE slug = $1`, [topic])
    .then(({ rows }) => {
      if (rows.length === 0 && topic) {
        return Promise.reject({ status: 404, msg: "Query Not Found" });
      }
      return db.query(sqlQueryString, topicValue);
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.validateQuery = (queries) => {
  return db
    .query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'articles'`
    )
    .then(({ rows }) => {
      let validQuery = rows.flatMap(Object.values);
      validQuery += [, "sort_by", "order", "limit", "p"];

      const invalidQuery = queries.filter(
        (query) => !validQuery.includes(query)
      );

      if (invalidQuery.length > 0) {
        return Promise.reject({ status: 400, msg: "Invalid query" });
      }
    });
};

exports.fetchCommentsByArticleID = (
  article_id,
  sort_by = "created_at",
  order = "DESC",
  limit = 10,
  p = 1
) => {
  let sqlQueryString = `SELECT comments.* 
    FROM comments 
    INNER JOIN articles 
    ON comments.article_id = articles.article_id `;

  sqlQueryString += `WHERE comments.article_id = $1 ORDER BY ${sort_by} ${order} LIMIT ${limit} `;

  if (p) {
    sqlQueryString += `OFFSET ${limit} * ${p - 1};`;
  }

  return db.query(sqlQueryString, [article_id]).then(({ rows }) => {
    return rows;
  });
};

exports.validateQueryPagination = (queries) => {
   const validQuery = ["limit", "p"];

    const invalidQuery = queries.filter(
      (query) => !validQuery.includes(query)
    );

    if (invalidQuery.length > 0) {
      return Promise.reject({ status: 400, msg: "Invalid query" });
    }
  }

exports.checkArticleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Article ID" });
      }
      return rows;
    });
};

exports.createComment = (article_id, newComment) => {
  return db
    .query(
      `INSERT INTO comments(author,body,article_id) VALUES ($1,$2,$3) RETURNING *;`,
      [newComment.username, newComment.body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.updatedArticle = (article_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid Form Body" });
  }
  return db
    .query(
      `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Article ID" });
      }
      return rows[0];
    });
};

exports.removeComment = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1;`, [comment_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Comment ID" });
      }
      return result;
    });
};

exports.fetchUsers = () => {
  return db.query(`SELECT * FROM users;`).then(({ rows }) => {
    return rows;
  });
};

exports.retrieveUser = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1;`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Username" });
      }
      return rows[0];
    });
};

exports.updateComment = (comment_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Invalid Form Body" });
  }
  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Comment ID" });
      }
      return rows[0];
    });
};

exports.createArticle = (newArticle) => {
  if (!newArticle.article_img_url) {
    newArticle.article_img_url =
      "https://grin2b.com/wp-content/uploads/2017/01/Grin2B_icon_NEWS.png";
  }

  return db
    .query(
      `INSERT INTO articles(author,title,body,topic,article_img_url) VALUES ($1,$2,$3,$4,$5) RETURNING *;`,
      [
        newArticle.author,
        newArticle.title,
        newArticle.body,
        newArticle.topic,
        newArticle.article_img_url,
      ]
    )
    .then(({ rows }) => {
      const newArticle = rows[0];
      const newArticleID = newArticle.article_id;

      return db.query(
        `SELECT articles.*,
      COUNT(comments.article_id)::INT AS comment_count
      FROM comments
      RIGHT JOIN articles
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id`,
        [newArticleID]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.createTopic = (newTopic) =>{
  return db.query(
    `INSERT INTO topics(slug, description) VALUES ($1, $2) RETURNING *`,[newTopic.slug,newTopic.description]
  )
  .then(({rows})=>{
    return rows[0]
  })
}

exports.removeArticle = (article_id) =>{
  return db
    .query(`DELETE FROM articles WHERE article_id = $1;`, [article_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent Article ID" });
      }
      return result;
    });
}