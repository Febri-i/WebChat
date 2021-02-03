function addMessage(id) {
  main.innerHTML = chat(id);
  if (chatAss[id] && chatAss[id].Message) {
    chatAss[id].Message.forEach(message => {
      const chat = document.querySelector('.chat');
      chat.innerHTML += createChat(message.messageContent, message.recive);
    });
  }
  document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight
}

function addMessageGroup(id) {
  let member = "";
  Object.keys(groupChat[id].member).forEach(item => {
    console.log(item, groupChat[id].member);
    if (item === Object.keys(groupChat[id].member)[Object.keys(groupChat[id].member).length - 1]) {
      member += `${groupChat[id].member[item].username}`;
    } else {
      member += `${groupChat[id].member[item].username}, `;
    }
  });
  main.innerHTML = chatGroup(id, member);
  if (groupChat[id].message) {
    groupChat[id].message.forEach(message => {
      document.querySelector(".chat").innerHTML += createChatGroup(message.messageContent, message.recive, groupChat[id].member[message.from].username);
    });
  }
}

function searchChat(keyword) {
  if (keyword) {
    if (document.querySelector(".list")) {
      Array.from(document.querySelectorAll(".list")).forEach(item => {
        if (!item.children[1].children[0].textContent.toLowerCase().includes(keyword.toLowerCase())) item.style.display = "none";
        else item.style.display = "flex";
      });
    }
  } else {
    Array.from(document.querySelectorAll(".list")).forEach(item => {
      item.style.display = "flex";
    });
  }
}

function showContactProfile(id, e) {
  e.stopPropagation();
  main.innerHTML = contactProfile(id);
  if (!contacts[id]) {
    document.querySelector('.changEd').style.display = "none";
    document.querySelector('.inputer').style.display = "none";
    document.querySelector('.usrnamrss').style.paddingLeft = 0;
  }
}

function getUsrName(id) {
  if (contacts[id]) {
    return contacts[id]
  } else {
    return id
  }
}

function sendMessage(event) {
  event.preventDefault();
  socket.emit('chat', {
    from: id,
    to: document.querySelector('.sendBtn').dataset.id,
    message: document.querySelector('.messageContent').value
  })
}

function changeUsrnam() {
  document.querySelector('.inputer').style.transform = "translateY(0)";
  document.querySelector('.usrnamrss').style.transform = "translateY(105%)"
};

async function changeNam(lol, self) {
  let success = {
    success: false
  };
  let usrInput = document.querySelector('.inpt').value;
  if (usrInput.length)
    success = await fetch('/chcontact', {
      method: 'post',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        self: self,
        username: usrInput,
        accountId: lol.dataset.id
      })
    }).then(res => success = res.json())

  if (success.success) {
    document.querySelector('.usernamess').innerText = usrInput;
    if (!self) {
      const usrnam = document.getElementById(`#${lol.dataset.id}`);
      if (usrnam && usrnam.innerText !== usrInput) document.querySelector('.username').innerText = usrInput
    }
    document.querySelector('.inpt').value = '';
    if (!self) contacts[lol.dataset.id] = usrInput;
  }
  document.querySelector('.usrnamrss').style.transform = "translateY(0)";
  document.querySelector('.inputer').style.transform = "translateY(-105%)"
}

function alerter(message, dur) {
  if (!document.querySelector('.alerter')) {
    if (dur) document.querySelector('.alerters').innerHTML += `<div class="alerter" style="animation-duration: ${dur}s;"><span class="alerterMessage">${message}</span></div>`;
    else document.querySelector('.alerters').innerHTML += `<div class="alerter"><span class="alerterMessage">${message}</span></div>`;
    document.querySelector('.alerter').addEventListener('animationend', ev => {
      ev.target.remove();
    });
  }
}

const deleteCb = (ev) => {
  console.log(ev.target.parentElement.offsetWidth);
  if (ev.target.parentElement.offsetWidth == 40) {
    ev.target.style.display = "none"
    ev.target.removeEventListener('transitionend', deleteCb)
  }
}

function questionGroupMethod() {
  const propeller = parseInt(document.querySelector('.propeller').style.opacity)
  if (propeller) {
    document.querySelector('.joinGroup').style = "";
    document.querySelector('.propeller').style.opacity = 0;
    document.querySelector('.linkGroup').style.opacity = 0;
    document.querySelector('.linkGroup').addEventListener('transitionend', deleteCb);
    document.querySelector('.propeller').addEventListener('transitionend', deleteCb);
  };
  if (document.querySelector('.groupMethod').style.height == "135px") {
    document.querySelector('.groupMethod').style = `height: 45px;
    padding-bottom: 0;`
    document.querySelector('.groupCreate').style.opacity = 0;
  } else if (document.querySelector('.groupMethod').style.height == "45px" && propeller == 0) {
    // console.log(document.querySelector('.groupMethod').style.height);
    document.querySelector('.groupCreate').style.opacity = 1;
    document.querySelector('.groupMethod').style = `height: 135px;
    padding-bottom: 75px;
    box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    -webkit-box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    -moz-box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    `
  }
}

function createGroup() {

}

function joinGroup(e) {
  e.preventDefault();
  document.querySelector('.joinGroup').style = "";
  document.querySelector('.propeller').style.opacity = 0;
  document.querySelector('.linkGroup').style.opacity = 0;
  document.querySelector('.linkGroup').addEventListener('transitionend', deleteCb);
  document.querySelector('.propeller').addEventListener('transitionend', deleteCb);
}

function summonAddContactForm() {
  const addContactBtn = parseInt(document.querySelector('.addContactBtn').style.opacity)
  if (addContactBtn) {
    document.querySelector('.addContactForm').style = "";
    document.querySelector('.addContactBtn').style.opacity = 0;
    document.querySelector('.formAddContact').style.opacity = 0;
    document.querySelector('.formAddContact').addEventListener('transitionend', deleteCb);
    document.querySelector('.addContactBtn').addEventListener('transitionend', deleteCb);
  } else {
    const formAddContact = setTimeout(function () {
      document.querySelector('.formAddContact').style.display = "flex";
      document.querySelector('.addContactBtn').style.display = "flex";
      clearTimeout(formAddContact);
    }, 100);
    document.querySelector('.formAddContact').style.opacity = 1;
    document.querySelector('.addContactBtn').style.opacity = 1;
    document.querySelector('.addContactForm').style = `width : 387.5px; left: 60px;
    box-shadow: 5px 5px 17px -6px rgb(0 0 0 / 75%);
    -webkit-box-shadow: 5px 5px 17px -6px rgb(0 0 0 / 75%);
    -moz-box-shadow: 5px 5px 17px -6px rgba(0, 0, 0, 0.75);
    `
  }
}

function addContact(e) {
  document.querySelector('.addContactForm').style = "";
  document.querySelector('.addContactBtn').style.opacity = 0;
  document.querySelector('.formAddContact').style.opacity = 0;
  document.querySelector('.formAddContact').addEventListener('transitionend', deleteCb);
  document.querySelector('.addContactBtn').addEventListener('transitionend', deleteCb);
  e.preventDefault()
  const form = document.querySelector('.formAddContact').value.split("#")
  addContactHandler(form[0], parseInt(form[1]))
}

function showLinkGroup() {
  const linkGroup = setTimeout(function () {
    document.querySelector('.linkGroup').style.display = "flex";
    document.querySelector('.propeller').style.display = "flex";
    clearTimeout(linkGroup);
  }, 100);
  document.querySelector('.linkGroup').style.opacity = 1;
  document.querySelector('.propeller').style.opacity = 1;
  document.querySelector('.joinGroup').style = `width : 387.5px; left: 60px;
  box-shadow: 5px 5px 17px -6px rgb(0 0 0 / 75%);
    -webkit-box-shadow: 5px 5px 17px -6px rgb(0 0 0 / 75%);
    -moz-box-shadow: 5px 5px 17px -6px rgba(0, 0, 0, 0.75);
  `
  document.querySelector('.groupMethod').style = `height: 45px;
  padding-bottom: 0;`
  document.querySelector('.groupCreate').style.opacity = 0;
}