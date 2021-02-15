function addMessage(id) {
  main.innerHTML = chat(id);
  if (chatAss[id] && chatAss[id].Message) {
    chatAss[id].Message.forEach(message => {
      const chat = document.querySelector('.chat');
      chat.innerHTML += createChat(message.messageContent, message.from);
    });
  }
  document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight
}

function addMessageGroup(id) {
  main.innerHTML = chatGroup(id);
  if (groupChat[id].message) {
    groupChat[id].message.forEach(message => {
      document.querySelector(".chat").innerHTML += createChatGroup(message.messageContent, message.from);
    });
  }
}

function sendGroupMessage(elemnt, e) {
  e.preventDefault();
  const message = elemnt.parentElement.children[0].value;
  if (document.getElementById("groupChat")) {
    document.getElementById(elemnt.dataset.id).querySelector('.lastChatGroup').innerText = `You: ${message}`
  }
  document.querySelector('.chat').innerHTML += createChatGroup(message, id);
  groupChat[elemnt.dataset.id].message.push({
    from: id,
    messageContent: message
  })
  socket.emit("groupChat", {
    groupId: parseInt(elemnt.dataset.id),
    messageContent: message
  })
}

function searchChat(elem) {
  if (elem.value) {
    if (elem.parentElement.parentElement.children[1].children) {
      Array.from(elem.parentElement.parentElement.children[1].children).forEach(item => {
        if (!item.children[1].children[0].textContent.toLowerCase().includes(elem.value.toLowerCase())) item.style.display = "none";
        else item.style.display = "flex";
      });
    }
  } else {
    Array.from(elem.parentElement.parentElement.children[1].children).forEach(item => {
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

function getUsrName(ids) {
  if (contacts[ids]) {
    return contacts[ids]
  } else if (ids == id) {
    return "You";
  } else {
    return ids
  }
}

function sendMessage(event) {
  event.preventDefault();
  const message = document.querySelector('.messageContent').value
  const elem = document.getElementById(event.target.dataset.id);
  if (!chatAss[event.target.dataset.id]) chatAss[event.target.dataset.id] = {
    Message: []
  };
  chatAss[event.target.dataset.id].Message.push({
    from: id,
    messageContent: message
  });
  document.querySelector('.chat').innerHTML += createChat(message, id);
  document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight;
  if (document.getElementById('normalChat')) {
    if (elem) {
      elem.children[1].children[1].innerText = message;
    } else {
      document.querySelector('.listContainer').innerHTML += createListChat('profilePict', data.message.messageContent, fto)
    }
  }
  if (message.length) socket.emit('chat', {
    to: parseInt(document.querySelector('.sendBtn').dataset.id),
    message: message
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
    document.querySelector('.groupCreate').style.opacity = 1;
    document.querySelector('.groupMethod').style = `height: 135px;
    padding-bottom: 75px;
    box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    -webkit-box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    -moz-box-shadow: 5px 5px 17px -6px rgba(0,0,0,0.75);
    `
  }
}
let listCreateGroup = [];

function addContactToList(elemnt) {
  if (listCreateGroup.includes(parseInt(elemnt.id))) {
    listCreateGroup = listCreateGroup.filter(item => item.toString() !== elemnt.id.toString())
    elemnt.style.backgroundColor = ""
  } else {
    elemnt.style.backgroundColor = `rgb(${Math.floor(Math.random() * 125) + 125}, ${Math.floor(Math.random() * 125) + 125}, ${Math.floor(Math.random() * 125) + 125})`
    listCreateGroup.push(parseInt(elemnt.id))
  }
}

async function CreateTheGroup(e) {
  e.preventDefault();
  const groupName = document.querySelector('.groupName').value
  if (groupName.length) {
    success = await fetch('/groupChat', {
      method: 'post',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        groupName: groupName,
        member: listCreateGroup
      })
    }).then(res => res.json())
  }
}


function createGroup() {
  if (Object.keys(contacts).length >= 2) {
    main.innerHTML = `
    <div class="createGroupOptContainer">
      <img src="./pp/profile.jpeg" class="groupProfile">
      <form class="createGroupName" onsubmit="CreateTheGroup(event)" method="post">
        <input type="text" name="groupName" class="groupName" placeholder="Enter group name">
        <input type="image" src="./img/light/done-white-18dp.svg">
      </form>
    </div>
    <div class="listContainerSelect">
    </div>
    `
    Object.keys(contacts).forEach(id => {
      document.querySelector('.listContainerSelect').innerHTML += createSelectContact(id)
    });
    document.querySelector('.groupMethod').style = `height: 45px;
    padding-bottom: 0;`
    document.querySelector('.groupCreate').style.opacity = 0;
  } else alerter("You only have 1 contacts!(Need more than 2 people to make group)")
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