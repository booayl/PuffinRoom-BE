const db = require("./db/connection");

exports.fetchTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Non-existent ID" });
      }
      return rows[0];
    });
};

exports.fetchArticles = (sort_by = "created_at", order = "DESC") => {
  let sqlQueryString = `SELECT articles.*,
    COUNT(comments.article_id)::INT AS comment_count
    FROM comments
    RIGHT JOIN articles
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id `;

  sqlQueryString += `ORDER BY ${sort_by} ${order}`;

  return db.query(sqlQueryString).then(({ rows }) => {
    return rows;
  });
};

exports.fetchCommentsByArticleID = (article_id,sort_by = "created_at", order = "DESC") =>{
    let sqlQueryString = `SELECT comments.* 
    FROM comments 
    INNER JOIN articles 
    ON comments.article_id = articles.article_id `

    sqlQueryString += `WHERE comments.article_id = $1 ORDER BY ${sort_by} ${order};`

    return db.query(sqlQueryString,[article_id])
    .then(({rows})=>{
        if (rows.length === 0) {
            return Promise.reject({ status: 404, msg: "Non-existent ID" });
          }
        return rows
    })
}
