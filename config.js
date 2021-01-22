module.exports = callback => {
  const cookieParser = require("cookie-parser"),
    express = require("express"),
    app = express(),
    email = require("./emailer"),
    path = require("path"),
    bodyParser = require("body-parser"),
    session = require("express-session"),
    {
      query
    } = require("./db.js"),
    bcrypt = require("bcrypt"),
    MongoClient = require("mongodb").MongoClient,
    assert = require("assert"),
    url = "mongodb://localhost:27017",
    dbName = "message",
    uuid = require("uuid").v4;
  server = require("http").Server(app);
  io = require("socket.io")(server);
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10 || 1
  };
  app.use(cookieParser());
  app.set("trust proxy", 1);
  app.use(session({
    key: "session",
    secret: "session",
    resave: false,
    saveUninitialized: false
  }));
  app.use(bodyParser.json());
  app.use("/", express.static(path.join(__dirname, "views", "home")));
  app.use("/login", express.static(path.join(__dirname, "views", "login")));
  app.use("/register", express.static(path.join(__dirname, "views", "register")));
  app.set("view engine", "ejs");
  app.get("/login", (req, res) => {
    if(req.session.accountId) {
      res.redir("/");
    } else {
      res.render("./login/index.ejs");
    }
  });
  app.get("/register", (req, res) => {
    if(req.session.register) {
      res.render("./register/index.ejs", {
        emails: req.session.register
      });
    } else if(req.session.accountId) {
      res.redirect("/");
    } else {
      res.render("./register/index.ejs", {
        emails: undefined
      });
    }
  });
  const eventCollection = {};
  app.get("/", async (req, res) => {
    const eventKey = uuid();
    req.session.accountId = 319660;
    if(req.session.accountId) {
      MongoClient.connect(url, connectionOptions, async (err, database) => {
        const collection = await database.db("message").collection("message");
        if(err) throw err;
        const dataAccount = await collection.find({
          accountId: 319660
        }).toArray();
        eventCollection[req.session.accountId] = eventKey;
        res.render("./home/index.ejs", {
          data: dataAccount[0],
          event: eventKey
        });
        database.close();
      });
    } else {
      res.redirect("/login");
    }
  });
  app.post("/login", async (req, res) => {
    if(req.body.email && req.body.password) {
      const dataAccount = await query(`SELECT password, id FROM account WHERE email='${req.body.email}'`);
      if(await bcrypt.compare(req.body.password, dataAccount.data[0].password)) {
        req.session.accountId = dataAccount.data[0].id;
        res.json({
          success: true,
          redir: '/'
        });
      } else res.json({
        success: false,
        err: 'Wrong password'
      })
    }
  });
  app.post("/register", async (req, res) => {
    const verifKey = await query(`SELECT email, verifKey FROM account WHERE email="${req.body.email}"`);
    if(verifKey.data[0]) {
      if(verifKey.data[0].email && verifKey.data[0].verifKey && verifKey.data[0].verifKey == req.body.verifyCode) {
        query(`UPDATE account SET verifStatus=1 WHERE email="${req.body.email}"`);
        res.json({
          success: true,
          redir: "/login"
        });
      } else res.json({
        success: false,
        err: "Wrong code"
      });
    } else res.json({
      success: false,
      err: "Please try again/refresh the page!"
    });
  });
  app.put("/register", async (req, res) => {
    if(req.body.email && req.body.password && req.body.username) {
      const checkEmail = await query(`SELECT email, verifStatus, password, username FROM account WHERE email='${req.body.email}'`);
      if(checkEmail.data[0]) {
        const compare = await bcrypt.compare(req.body.password, checkEmail.data[0].password);
        console.log(checkEmail.data[0].verifStatus);
        if(checkEmail.data[0].verifStatus == 1) res.json({
          success: true,
          redir: "/login"
        });
        else if(checkEmail.data[0].verifStatus == 0 && compare && req.body.username == checkEmail.data[0].username) res.json({
          success: true
        });
        else res.json({
          success: false,
          err: "email used!"
        });
      } else {
        query(`INSERT INTO account(id,username,password,email,verifKey,verifStatus)VALUES(${parseInt(
            randomNumber(100000, 1000000)
          )},
          '${req.body.username}',
          '${await bcrypt.hash(req.body.password, 10)}',
          '${req.body.email}',
          ${parseInt(randomNumber(1000, 10000))},0)`).then(suc => {
          if(suc.success) {
            req.session.register = {
              email: req.body.email,
              password: req.body.password,
              username: req.body.username
            };
            res.json({
              success: suc.success,
              redir: "/login"
            });
          } else res.json({
            success: false,
            err: "try again later!"
          });
        });
      }
    } else res.json({
      success: false,
      err: "Fill the form!"
    });
  });
  server.listen(2020);
  io.on('connection', (socket) => {
    socket.on('chat', data => {
      MongoClient.connect(url, connectionOptions, async (err, database) => {
        if(err) throw err;
        const collection = await database.db("message").collection("message");
        saveMessage(collection, data.message, data.from, true, data.to)
        saveMessage(collection, data.message, data.to, false, data.from)
        database.close();
      });
      if(eventCollection[data.from]) {
        socket.emit(`${eventCollection[data.from]}`, {
          from: data.to,
          message: {
            recive: true,
            messageContent: data.message
          }
        })
      }
      if(eventCollection[data.to]) {
        socket.emit(`${eventCollection[data.to]}`, {
          from: data.from,
          message: {
            recive: false,
            messageContent: data.message
          }
        })
      }
    })
  });
};