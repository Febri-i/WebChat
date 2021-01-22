const socket = io("localhost:2020");
socket.emit('login', id);
Array.from(document.querySelector("aside").children).forEach((element) => {
  element.addEventListener("click", (ev) => {
    Array.from(document.querySelector("aside").children).forEach((element) => {
      element.style.backgroundColor = "white";
    });
    ev.target.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
  });
});
Array.from(document.querySelector("aside").children).forEach((child) => {
  child.addEventListener("click", (ev) => {
    Array.from(document.querySelector("aside").children).forEach((item) => {
      if (ev.target !== item && item.style.backgroundColor == "rgba(0, 0, 0, 0.3)") {
        item.style.backgroundColor = "white";
      }
    });
  });
});
socket.on(event.toString(), (data) => {
  const chat = document.querySelector('.chat')
  if (data.message.recive) {
    socketProcs(data.to, data, createChatTrue)
  } else {
    socketProcs(data.from, data, createChatFalse)
  }
});

function socketProcs(fto, data, func) {
  const elem = document.getElementById(fto)
  const sendBtn = document.querySelector('.sendBtn');
  if (sendBtn.getAttribute('data-id') == fto) {
    document.querySelector('.chat').innerHTML += func(data.message.messageContent);
  };
  console.log(elem, elem.length);
  if (document.getElementById(fto)) {
    if (elem) {
      elem.children[1].children[1].innerText = data.message.messageContent;
    } else {
      document.querySelector('.listContainer').innerHTML += createListChat('profilePict', contacts[parseInt(fto)], data.message.messageContent, fto)
    }
  }
}