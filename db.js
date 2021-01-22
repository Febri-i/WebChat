const mariadb = require('mariadb')
const conn = mariadb.createConnection({
  host: "localhost",
  user: "root",
  database: "chatapp",
  password: "bayu12345",
  port: 3001,
});
const query = function(params) {
  return new Promise(function(resolve, reject) {
    conn.then(async (conn) => {
      try {
        const result = await conn.query(params)
        resolve({
          success: true,
          data: result
        })
      } catch (e) {
        console.log(e)
        reject({
          success: false
        });
      }
    });
  });
};
module.exports = {
  query,
}
