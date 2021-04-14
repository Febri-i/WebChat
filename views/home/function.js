let chatSelected = [];

function endSelectingChat(id) {
  document.querySelector('.chatProfileInfo').style.backgroundColor = "";
  document.querySelector('.chatProfileInfo').innerHTML = `<img src="./pp/profile.jpeg" alt="Photo Profile" onclick="showContactProfile(${id}, event)" class="profile chatProfilePicture">
  <span class="chatProfileName" data-id="${id}" >${getUsrName(id)}</span>
  <img src="./img/ui/menu-black-36dp.svg" alt="Option" class="option">
  `
}

function startSelectingChat() {
  document.querySelector('.chatProfileInfo').style.backgroundColor = "deepskyblue";
  document.querySelector('.chatProfileInfo').innerHTML = selectingChat;
}


function chatOPtion(e) {
  const optionOutCB = e => {
    e.target.style.display = "none";
    e.target.removeEventListener("animationend", optionOutCB)
  };
  if (document.querySelector('.messageOption').style.display == "none") {
    document.querySelector('.messageOption').style.display = "flex"
    document.querySelector('.messageOption').style.animationName = "option";
  } else if (document.querySelector('.messageOption').style.display == "flex") {
    document.querySelector('.messageOption').style.animationName = "optionOut";
    document.querySelector('.messageOption').addEventListener('animationend', optionOutCB);
  }
}

function addMessage(id) {
  main.innerHTML = chat(id);
  if (chatAss[id] && chatAss[id].Message[0]) {
    chatAss[id].Message.forEach(({
      from,
      messageContent,
      messageId
    }) => {
      const chat = document.querySelector('.chat');
      chat.innerHTML += createChat(messageContent, from, messageId);
    });
  }
  document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight
}

function addMessageGroup(id) {
  main.innerHTML = chatGroup(id);
  if (groupChat[id].message[0]) {
    groupChat[id].message.forEach(({
      messageContent,
      from,
      messageId
    }) => {
      document.querySelector(".chat").innerHTML += createChatGroup(messageContent, from, messageId);
    });
  }
}

function messageOption(elem, isGroupChat) {
  elem.parentElement.style.backgroundColor = "rgba(0, 0, 0, .1)";
}

function sendGroupMessage(elemnt, e) {
  const messageId = Math.floor(Math.random() * 214748364);
  e.preventDefault();
  const message = elemnt.parentElement.children[0].value;
  if (document.getElementById("groupChat")) {
    document.getElementById(elemnt.dataset.id).querySelector('.lastChatGroup').innerText = `You: ${message}`
  }
  document.querySelector('.chat').innerHTML += createChatGroup(message, id, messageId);
  groupChat[elemnt.dataset.id].message.push({
    from: id,
    messageContent: message,
    messageId
  })
  socket.emit("groupChat", {
    groupId: parseInt(elemnt.dataset.id),
    messageContent: message,
    messageId
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
  const messageId = Math.floor(Math.random() * 214748364)
  event.preventDefault();
  const message = document.querySelector('.messageContent').value
  const elem = document.getElementById(event.target.dataset.id);
  if (!chatAss[event.target.dataset.id]) chatAss[event.target.dataset.id] = {
    Message: []
  };
  chatAss[event.target.dataset.id].Message.push({
    from: id,
    messageContent: message,
    messageId
  });
  document.querySelector('.chat').innerHTML += createChat(message, id, messageId);
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
    message: message,
    messageId
  })
  document.querySelector('.messageContent').value = "";
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
    main.innerHTML = `<div class="createGroupOptContainer">
      <img src="./pp/profile.jpeg" class="groupProfile">
      <form class="createGroupName" onsubmit="CreateTheGroup(event)" method="post">
        <input type="text" name="groupName" class="groupName" placeholder="Enter group name">
        <input type="image" src="./img/ui/done-white-18dp.svg">
      </form>
    </div>
    <div class="listContainerSelect">
    </div>
    `;
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

let searchMessageNum = 0;
let searchMessageKeyword;
let lastestIndex;

function messageSearchHandler(e) {
  e.preventDefault();
  searchMessages(e.target.children[0].value)
}

function searchMessages(keyword) {
  let sameSearch = false;
  if (keyword == searchMessageKeyword) {
    searchMessageNum += 1;
    sameSearch = true;
  } else {
    searchMessageKeyword = keyword;
    searchMessageNum = 0;
  }
  let index = [];
  const chat = Array.from(document.querySelector('.chat').children);
  for (var i = 0; i < chat.length; i++) {
    let message = chat[i].children[0].innerText;
    if (chat[i].children[0].tagName == "STRONG") message = chat[i].children[1].innerText;
    if (message && message.toLowerCase().includes(keyword.toLowerCase().trim())) {
      index.push(i);
    }
    if (chat[i].style.animationName) {
      if (chat[i].style.animationName == "includedMsg") {
        document.querySelector('.chat').children[i].style.animationName = "includedMsgOut";
      } else {
        document.querySelector('.chat').children[i].style.animationName = "";
      }
    }
  }
  if (index.length) {
    if (sameSearch) {
      if (Array.from(document.querySelector('.chat').children)[index[searchMessageNum]]) {
        Array.from(document.querySelector('.chat').children)[index[searchMessageNum]].scrollIntoView({
          block: "center"
        });
        lastestIndex = index[searchMessageNum];
        Array.from(document.querySelector('.chat').children)[index[searchMessageNum]].style.animationName = "includedMsg";
      } else {
        Array.from(document.querySelector('.chat').children)[index[0]].scrollIntoView({
          block: "center"
        });
        lastestIndex = index[0]
        Array.from(document.querySelector('.chat').children)[index[0]].style.animationName = "includedMsg";
        searchMessageNum = 0;
      }
    } else {
      Array.from(document.querySelector('.chat').children)[index[0]].scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      lastestIndex = index[0]
      Array.from(document.querySelector('.chat').children)[index[0]].style.animationName = "includedMsg";
    }
  }
}

function optChatClicked() {
  const optionOutCB = e => {
    e.target.style.display = "none";
    e.target.removeEventListener("animationend", optionOutCB)
  };
  document.querySelector('.messageOption').style.animationName = "optionOut";
  document.querySelector('.messageOption').addEventListener('animationend', optionOutCB);
}

function searchOptHandler() {

  document.querySelector('.messageSearchForm').style.top = "51px";
  const optionDelete = (e) => {
    console.log(e.target.classList[0]);
    if (e.target.classList[0] !== "opt" && e.target.classList[0] !== "searchMessageInput" && e.target.classList[0] !== "searchMessageSubmit" && e.target.classList[0] !== "messageSearchInputer" && e.target.classList[0] !== "messageSearchForm") {
      document.querySelector('.messageSearchForm').style.top = "-10px";
      document.removeEventListener("click", optionDelete);
    };
    if (lastestIndex || lastestIndex == 0) {
      document.querySelector('.chat').children[lastestIndex].style.animationName = "includedMsgOut";
    }
  }
  document.addEventListener('click', optionDelete);
}

async function clearChatHandler() {
  accountId = document.querySelector('.sendBtn').dataset.id;
  if (chatAss[accountId]) {
    document.getElementById(accountId).style.transform = "translateX(-100%)";
    document.getElementById(accountId).addEventListener('transitionend', e => {
      e.target.remove();
    });
    const res = await fetch('/message', {
      method: 'delete',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accountId: accountId
      })
    }).then(res => res.json())
    if (res.success) {
      chatAss[accountId].Message = [];
    } else {
      alerter("An error occured!");
      return 0;
    }
  } else if (groupChat[accountId]) {
    const res = await fetch("/groupChat", {
      method: "delete",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        groupId: accountId
      })
    }).then(res => res.json());
    console.log(res);
    if (res.success) {
      groupChat[accountId].message = [];
      document.getElementById(accountId).children[1].children[1].innerText = "";
    } else {
      alerter("An error occured!");
      return 0;
    }
  } else {
    alerter("error id not found!");
    return 0;
  }
  let index = -1;
  const mainWidth = document.getElementsByTagName("main")[0].getBoundingClientRect().width;
  const deleteChat = setInterval(function () {
    if (index >= Array.from(document.querySelector('.chat').children).length - 2) {
      clearInterval(deleteChat);
    }
    let indd = index + 1;
    if (document.querySelector('.chat').children[indd].classList[0] == "oppCht") {
      document.querySelector('.chat').children[indd].style.transform = `translateX(${mainWidth}px)`;
      document.querySelector(".chat").children[indd].style.opacity = 0;
    } else {
      document.querySelector('.chat').children[indd].style.transform = `translateX(-${mainWidth}px)`;
      document.querySelector(".chat").children[indd].style.opacity = 0;
    }
    index++;
  }, 30);

}