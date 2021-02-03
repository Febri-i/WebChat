const socket = io("localhost:2020");
socket.emit('login', id);
Array.from(document.querySelector("aside").children).forEach((element) => {
  element.addEventListener("click", (ev) => {
    Array.from(document.querySelector("aside").children).forEach((element) => {
      if (ev.target.classList[0].toString() !== "profileIcon") element.style.backgroundColor = "white";
    });
    ev.target.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    if (document.querySelector('.mainProfile')) {
      document.querySelector('.profileIcon').style.backgroundColor = "rgba(0, 0, 0, 0.3)";
    } else {
      if (ev.target.classList[0].toString() == "profileIcon") ev.target.style.backgroundColor = "white";
    }
  });
});
socket.on(event.toString(), (data) => {
  console.log(data);
  console.log(data.message);
  const chat = document.querySelector('.chat')
  if (data.message.recive) {
    if (!chatAss[data.to]) {
      chatAss[data.to] = {};
      chatAss[data.to].Message = [];
    };
    chatAss[data.to].Message.push(data.message)
    socketProcs(data.to, data, createChatTrue)
  } else {
    if (!chatAss[data.from]) {
      chatAss[data.from] = {};
      chatAss[data.from].Message = [];
    };
    chatAss[data.from].Message.push(data.message)
    socketProcs(data.from, data, createChatFalse)
  }
});

function socketProcs(fto, data, func) {
  const sendBtn = document.querySelector('.sendBtn');
  if (sendBtn && sendBtn.getAttribute('data-id') == fto) {
    document.querySelector('.chat').innerHTML += func(data.message.messageContent);
    document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight;
  };
  const elem = document.getElementById(fto)
  if (document.getElementById('normalChat')) {
    if (elem) {
      elem.children[1].children[1].innerText = data.message.messageContent;
    } else {
      document.querySelector('.listContainer').innerHTML += createListChat('profilePict', data.message.messageContent, fto)
    }
  }
}