const conth = {
  groupChat: [{
      groupId: 321456,
      role: "member",
      member: [123456, 654321],
      message: [{
        recive: false,
        from: 654321,
        messageContent: "blablabla"
      }]
    },
    {
      groupId: 321456,
      role: "admin",
      member: [123456, 654321],
      message: [{
        recive: false,
        from: 654321,
        messageContent: "blablabla"
      }]
    }
  ]
}

for (var i = 0; i < conth.groupChat.length; i++) {
  if (conth.groupChat[i].role == "admin") {
    i = conth.groupChat.length
  } else console.log(conth.groupChat[i]);
}