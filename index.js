const cookieParser = require("cookie-parser"),
  express = require("express"),
  app = express(),
  path = require("path"),
  bodyParser = require("body-parser"),
  session = require("express-session"),
  {
    query
  } = require("./db.js"),
  bcrypt = require("bcrypt"),
  assert = require("assert"),
  dbName = "message",
  pool = require('./pool'),
  uuid = require("uuid").v4;
server = require("http").Server(app);
io = require("socket.io")(server);
pool.connect();
app.use(bodyParser.urlencoded({
  extended: true
}));
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
  if (req.session.accountId) {
    res.redirect("/");
  } else {
    res.render("./login/index.ejs");
  }
});
app.get("/register", (req, res) => {
  if (req.session.register) {
    res.render("./register/index.ejs", {
      emails: req.session.register
    });
  } else if (req.session.accountId) {
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
  if (req.session.accountId) {
    const collection = await pool.get().db("message").collection("message");
    const dataAccount = await collection.find({
      accountId: req.session.accountId
    }).toArray();
    let b = {};
    dataAccount[0].contacts.forEach((item, i) => {
      b[item.accountId] = item.username;
    });
    console.log(b, '\n\n\n', dataAccount[0], '\n\n\n', dataAccount[0].contacts);
    dataAccount[0].contacts = b;
    eventCollection[req.session.accountId] = eventKey;
    res.render("./home/index.ejs", {
      data: dataAccount[0],
      event: eventKey
    });
  } else {
    res.redirect("/login");
  }
});
app.post('/contact', async (req, res) => {
  if (req.session.id) {
    if (req.body.username && req.body.accountId) {
      const collection = pool.get().db("message").collection("message");
      const account = await query(`SELECT username FROM account WHERE id=${req.body.accountId}`)
      const mongoCheck = await collection.find({
        accountId: req.session.accountId
      }).toArray();
      if (account.data[0] && !mongoCheck[0].contacts[parseInt(req.body.accountId)]) {
        collection.updateOne({
          accountId: parseInt(req.session.accountId)
        }, {
          $push: {
            contacts: {
              accountId: req.body.accountId,
              username: req.body.username
            }
          }
        }).then(resl => resl.result.n && resl.result.nModified && resl.result.ok ? (res.json({
          success: true,
          scroll: true
        })) : (res.json({
          success: false,
          err: 'error!'
        })))
      } else if (mongoCheck[0].contacts[parseInt(req.body.accountId)]) {
        res.json({
          success: false,
          scroll: true,
          err: `you've been save this contact`
        })
      } else {
        res.json({
          success: false,
          err: "id doesn't available"
        })
      }
    }
  } else {
    res.json({
      success: false,
      err: 'login properly!'
    })
  }
})
app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    const dataAccount = await query(`SELECT password, id, verifStatus, username, email FROM account WHERE email='${req.body.email}'`);
    if (dataAccount.data[0] && await bcrypt.compare(req.body.password, dataAccount.data[0].password) && parseInt(dataAccount.data[0].verifStatus)) {
      req.session.accountId = dataAccount.data[0].id;
      res.json({
        success: true,
        redir: '/'
      });
    } else if (dataAccount.data[0] && !parseInt(dataAccount.data[0].verifStatus)) {
      req.session.register = {
        email: dataAccount.data[0].email,
        password: dataAccount.data[0].password,
        username: dataAccount.data[0].username
      }
      res.json({
        success: true,
        redir: '/register'
      });
    } else if (eventCollection[dataAccount.data[0].password]) {
      res.json({
        success: false,
        err: 'No multiple login'
      })
    } else res.json({
      success: false,
      err: 'Wrong password'
    })
  }
});
app.post("/register", async (req, res) => {
  const verifKey = await query(`SELECT email, id, verifKey FROM account WHERE email="${req.body.email}"`);
  if (verifKey.data[0]) {
    if (verifKey.data[0].email && verifKey.data[0].verifKey && verifKey.data[0].verifKey == req.body.verifyCode) {
      query(`UPDATE account SET verifStatus=1 WHERE email="${req.body.email}"`).then(value => {
        const collection = pool.get().db("message").collection("message");
        collection.insertOne({
          accountId: verifKey.data[0].id,
          groupChat: {},
          contacts: [],
          chat: {}
        }).then(res => console.log(res))
      });
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
  if (req.body.email && req.body.password && req.body.username) {
    const checkEmail = await query(`SELECT email, verifStatus, password, username FROM account WHERE email='${req.body.email}'`);
    console.log(checkEmail);
    if (checkEmail.data[0]) {
      const compare = await bcrypt.compare(req.body.password, checkEmail.data[0].password);
      if (checkEmail.data[0].verifStatus == 1) res.json({
        success: true,
        redir: "/login"
      });
      else if (checkEmail.data[0].verifStatus == 0 && compare && req.body.username == checkEmail.data[0].username) res.json({
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
        if (suc.success) {
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
app.post('/chcontact', async (req, res) => {
  const collection = pool.get().db("message").collection("message");
  const result = await collection.updateOne({
    accountId: req.session.accountId,
    "contacts.accountId": parseInt(req.body.accountId)
  }, {
    $set: {
      "contacts.$.username": req.body.username
    }
  });
  console.log(result.result);
  res.json({
    success: result.result.nModified
  })
})
app.delete('/contact', (req, res) => {
  if (req.session.accountId && req.body.accountId && req.body.username) {
    pool.get().db("message").collection("message")
      .updateOne({
        accountId: req.session.accountId
      }, {
        $pull: {
          contacts: {
            accountId: parseInt(req.body.accountId)
          }
        }
      }).then(ressl => {
        if (ressl.result.nModified) res.json({
          success: true
        })
        else res.json({
          success: false,
          err: 'try again/refresh the page!'
        })
      })
  } else {
    res.json({
      success: false,
      err: 'please refresh the page!'
    })
  }
})
server.listen(2020, () => {
  console.log('listen')
});
let eventCollections = {};
io.on('connection', (socket) => {
  socket.once('login', data => {
    socket.once('disconnect', () => {
      delete eventCollections[data.accountId];
      delete eventCollection[data.accountId];
    });
    if (data) {
      eventCollections[data] = socket.id;
    } else {
      socket.disconnect()
    }
    socket.on('chat', async data => {
      const collection = await pool.get().db("message").collection("message");
      saveMessage(collection, data.message, parseInt(data.from), true, parseInt(data.to))
      saveMessage(collection, data.message, parseInt(data.to), false, parseInt(data.from))
      if (eventCollection[data.from] && eventCollections[data.from]) {
        io.to(eventCollections[data.from]).emit(`${eventCollection[data.from]}`, {
          from: data.from,
          to: data.to,
          message: {
            recive: true,
            messageContent: data.message
          }
        })
      }
      if (eventCollection[data.to] && eventCollections[data.to]) {
        io.to(eventCollections[data.to]).emit(`${eventCollection[data.to]}`, {
          from: data.from,
          to: data.to,
          message: {
            recive: false,
            messageContent: data.message
          }
        })
      }
    })
  });
});

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}
async function saveMessage(collection, message, accountId, status, to) {
  collection.find({
    accountId: accountId
  }).toArray().then(checkMsg => {
    if (checkMsg[0]) {
      if (checkMsg[0].chat[`${to}`]) {
        collection.updateOne({
          accountId: accountId,
        }, {
          $push: newMsg(to, status, message),
        })
      } else {
        collection.updateOne({
          "accountId": accountId
        }, {
          $set: newChat(to, status, message)
        })
      }
    }
  });
}

function newMsg(accountId, status, message) {
  let chat = {};
  chat[`chat.${accountId}.Message`] = {
    recive: status,
    messageContent: message,
  };
  return chat
}

function newChat(accountId, status, message) {
  let sets = {
    chat: {}
  };
  sets.chat[accountId] = {
    Message: [{
      recive: status,
      messageContent: message
    }]
  };
  return sets
}

function newContact(id, username) {
  const contact = {};
  contact[`contacts.${id}`] = username;
  return contact;
}