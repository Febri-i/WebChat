const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
const url = "mongodb://127.0.0.1:3000";
const option = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 10 || 1
};
let connection = null;
module.exports.connect = () => new Promise((resolve, reject) => {
  MongoClient.connect(url, option, function(err, db) {
    if(err) {
      reject(err);
      return;
    };
    resolve(db);
    connection = db;
  });
});
module.exports.get = () => {
  if(!connection) {
    throw new Error('Call connect first!');
  }
  return connection;
}
