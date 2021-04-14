   const cookieParser = require("cookie-parser"),
     cookie = require('cookie'),
     express = require("express"),
     app = express(),
     path = require("path"),
     bodyParser = require("body-parser"),
     session = require("express-session"),
     {
       query
     } = require("./db.js"),
     MemoryStore = new session.MemoryStore(),
     bcrypt = require("bcrypt"),
     assert = require("assert"),
     dbName = "message",
     pool = require('./pool'),
     uuid = require("uuid").v4,
     server = require("http").Server(app),
     io = require("socket.io")(server);
   pool.connect();
   let eventCollections = {};
   app.use(bodyParser.urlencoded({
     extended: true
   }));
   app.use(cookieParser());
   app.set("trust proxy", 1);
   app.use(session({
     store: MemoryStore,
     key: "session",
     secret: "secret",
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
   app.get("/", async (req, res) => {
     const eventKey = uuid();
     if (req.session.accountId) {
       const dataAcc = await query(`SELECT username FROM account WHERE id="${req.session.accountId}"`);
       const collection = pool.get().db("message").collection("message");
       const groupChatCollection = pool.get().db("message").collection("group");
       const dataAccount = await collection.find({
         accountId: req.session.accountId
       }).toArray();
       let b = {};
       let admin = false;
       dataAccount[0].contacts.forEach((item, i) => {
         b[item.accountId] = item.username;
       });
       dataAccount[0].contacts = b;
       b = {};
       dataAccount[0].chat.forEach((item, i) => {
         if (!b[item.accountId]) b[item.accountId] = {
           Message: item.Message
         }
       });
       dataAccount[0].chat = b;
       b = {};
       for (var i = 0; i < dataAccount[0].groupChat.length; i++) {
         item = dataAccount[0].groupChat[i];
         const groupChatData = await groupChatCollection.find({
           groupId: item.groupId
         }).toArray();
         b[item.groupId] = {
           groupName: groupChatData[0].groupName,
           role: groupChatData[0].member.filter(item => item.accountId == req.session.accountId)[0].role,
           member: groupChatData[0].member,
           message: item.message
         };
       };
       dataAccount[0].groupChat = b;
       res.render("./home/index.ejs", {
         data: dataAccount[0],
         event: eventKey,
         username: dataAcc.data[0].username
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
         const collection = pool.get().db("message").collection("message");
         req.session.accountId = dataAccount.data[0].id;
         const dataMongo = await collection.find({
           accountId: dataAccount.data[0].id,
         }).toArray();
         let listGroup = {};
         for (var i = 0; i < dataMongo[0].groupChat.length; i++) {
           const item = dataMongo[0].groupChat[i];
           const collection = pool.get().db("message").collection("group");
           const dataGroupChat = await collection.find({
             groupId: item.groupId
           }).toArray();
           listGroup[item.groupId] = dataGroupChat[0].roomKey;
         }
         req.session.groupChat = listGroup;
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
       } else if (eventCollections[dataAccount.data[0].id]) {
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
             groupChat: [],
             contacts: [],
             chat: [],
             chatted: []
           })
         });
         delete req.session.register
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

   app.delete("/groupChat", async (req, res) => {
     if (req.session.accountId) {
       const collection = pool.get().db("message").collection("message");
       const ress = await collection.updateOne({
         accountId: req.session.accountId,
         "groupChat.groupId": parseInt(req.body.groupId)
       }, {
         $set: {
           "groupChat.$.message": []
         }
       })
       if (ress.result.nModified) {
         res.json({
           success: true
         })
       }
     }
   })

   app.delete("/message", async (req, res) => {
     if (req.session.accountId) {
       const collection = pool.get().db("message").collection("message");
       const ress = await collection.updateOne({
         accountId: req.session.accountId
       }, {
         $pull: {
           chat: {
             accountId: parseInt(req.body.accountId)
           }
         }
       })
       if (ress.result.nModified) {
         res.json({
           success: true
         })
       }
     }
   })


   app.post('/groupChat', (req, res) => {
     if (req.session.accountId) {
       const groupId = randomNumber(100000, 1000000);
       const roomKey = uuid();
       const collection = pool.get().db("message").collection("message");
       const member = req.body.member.filter(item => item !== req.session.accountId)
       const members = [];
       collection.updateOne({
         accountId: req.session.accountId
       }, {
         $push: {
           groupChat: {
             groupId: groupId,
             role: "admin",
             message: []
           }
         }
       }).then(async ress => {
         let success = false;
         if (ress.result.nModified) {
           for (var i = 0; i < req.body.member.length; i++) {
             const item = req.body.member[i]
             if (item !== req.session.accountId) {
               members.push({
                 accountId: item,
                 role: "member"
               })
               await collection.updateOne({
                 accountId: item
               }, {
                 $push: {
                   groupChat: {
                     groupId: groupId,
                     role: "member",
                     message: []
                   }
                 }
               }).then(result => success = result.result.nModified)
             }

           }
         }
         pool.get().db("message").collection("group").insertOne({
           groupId: groupId,
           groupName: req.body.groupName,
           roomKey: roomKey,
           member: [{
             accountId: req.session.accountId,
             role: "admin"
           }, ...members]
         }).then(ress => {
           if (ress.result.n) res.json({
             success: true
           })
           else res.json({
             success: false
           })
         })
         if (success) {
           let groupMember = [req.session.accountId, ...req.body.member];
           for (var i = 0; i < groupMember.length; i++) {
             const socketId = eventCollections[groupMember[i]];
             if (socketId) {
               let role = "member";
               if (groupMember[i] == req.session.accountId) role = "admin"
               const socket = io.sockets.sockets.get(socketId);
               socket.join(roomKey)
               socket.emit("joinedGroup", {
                 groupId: groupId,
                 groupName: req.body.groupName,
                 role: role,
                 member: [{
                   accountId: req.session.accountId,
                   role: "admin"
                 }, ...members],
               })
             }
           }
         }
       })
     }
   })
   app.post('/chcontact', async (req, res) => {
     if (req.body.self) {
       const chang = await query(`UPDATE account SET username="${req.body.username}" WHERE id=${req.session.accountId}`);
       res.json({
         success: chang.success
       })
     } else {
       const collection = pool.get().db("message").collection("message");
       const result = await collection.updateOne({
         accountId: req.session.accountId,
         "contacts.accountId": parseInt(req.body.accountId)
       }, {
         $set: {
           "contacts.$.username": req.body.username
         }
       });
       res.json({
         success: result.result.nModified
       })
     }
   });

   app.get("/logout", (req, res) => {
     delete req.session.accountId;
     delete req.session.groupChat;
     res.redirect("/login");
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
   io.on('connection', async (socket) => {
     const collection = await pool.get().db("message").collection("message");
     const cookieString = socket.request.headers.cookie;
     const cookieParsed = cookie.parse(cookieString);
     let listRoom;
     const sidParsed = cookieParser.signedCookie(cookieParsed.session, "secret");
     await MemoryStore.get(sidParsed, async (err, dataSession) => {
       if (err) console.log(err);
       if (dataSession) {
         listRoom = dataSession.groupChat;
         if (dataSession.groupChat) {
           Object.keys(dataSession.groupChat).forEach((item) => {
             socket.join(dataSession.groupChat[item]);
           });
         }
         socket.on("disconnect", () => delete eventCollections[dataSession.accountId]);
         eventCollections[dataSession.accountId] = socket.id;
         ////////////SENDING CHAT/////////////
         //Group chat
         socket.on('groupChat', async data => {
           if (!listRoom[data.groupId]) {
             const rooms = await pool.get().db("message").collection("group").find({
               groupId: data.groupId,
               "member.accountId": dataSession.accountId
             }).toArray();
             listRoom[rooms[0].groupId] = rooms[0].roomKey
           };
           if (listRoom[data.groupId]) {
             socket.to(listRoom[data.groupId]).broadcast.emit('groupChat', {
               groupId: data.groupId,
               from: dataSession.accountId,
               message: data.messageContent,
               messageId: data.messageId
             });
             collection.updateMany({
               "groupChat.groupId": data.groupId
             }, {
               $push: {
                 "groupChat.$.message": {
                   from: dataSession.accountId,
                   messageContent: data.messageContent,
                   messageId: data.messageId
                 }
               }
             })
           }
         })

         //Normal chat
         socket.on('chat', async data => {
           if (eventCollections[data.to]) io.to(eventCollections[data.to]).emit(`chats`, {
             from: dataSession.accountId,
             message: data.message,
             messageId: data.messageId
           });
           const checkMsgTo = await collection.find({
             accountId: data.to
           }).toArray();
           if (checkMsgTo[0]) {
             collection.updateOne({
               accountId: dataSession.accountId,
               'chat.accountId': data.to
             }, {
               $push: {
                 "chat.$.Message": {
                   from: dataSession.accountId,
                   messageContent: data.message,
                   messageId: data.messageId
                 }
               }
             }).then(result => {
               if (!result.result.nModified)
                 collection.updateOne({
                   accountId: dataSession.accountId
                 }, {
                   $push: {
                     chat: {
                       accountId: data.to,
                       Message: [{
                         from: dataSession.accountId,
                         messageContent: data.message,
                         messageId: data.messageId
                       }]
                     }
                   }
                 })
             })

             collection.updateOne({
               accountId: data.to,
               'chat.accountId': dataSession.accountId
             }, {
               $push: {
                 "chat.$.Message": {
                   from: dataSession.accountId,
                   messageContent: data.message,
                   messageId: data.messageId
                 }
               }
             }).then(result => {
               if (!result.result.nModified)
                 collection.updateOne({
                   accountId: data.to
                 }, {
                   $push: {
                     chat: {
                       accountId: dataSession.accountId,
                       Message: [{
                         from: dataSession.accountId,
                         messageContent: data.message,
                         messageId: data.messageId
                       }]
                     }
                   }
                 })
             })
           }
         })
       } else socket.disconnect();
     });
   });

   function randomNumber(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
   }

   function newContact(id, username) {
     const contact = {};
     contact[`contacts.${id}`] = username;
     return contact;
   }