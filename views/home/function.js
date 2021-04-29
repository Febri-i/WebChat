let chatSelected = [];

function escape(string) {
  var str = '' + string;
  var matchHtmlRegExp = /["'&<>]/;
  var match = matchHtmlRegExp.exec(str);

  if (!match) {
    return str;
  }

  var escape;
  var html = '';
  var index = 0;
  var lastIndex = 0;

  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34: // "
        escape = '&quot;';
        break;
      case 38: // &
        escape = '&amp;';
        break;
      case 39: // '
        escape = '&#39;';
        break;
      case 60: // <
        escape = '&lt;';
        break;
      case 62: // >
        escape = '&gt;';
        break;
      default:
        continue;
    }

    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }

    lastIndex = index + 1;
    html += escape;
  }

  return lastIndex !== index ?
    html + str.substring(lastIndex, index) :
    html;
}


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


function cancelChangeProf() {
  document.querySelector('.ppreview').style.animationName = "opaFadeOut";
  document.querySelector('.ppreview').addEventListener('animationend', ev => document.querySelector('.ppreview').remove());
}

async function uploadPP() {
  const target = document.querySelector('.target');
  const selected = document.querySelector('.selected');
  const width = Math.ceil(selected.getBoundingClientRect().width * (target.naturalHeight / target.offsetHeight))

  const res = await fetch('/profile', {
    method: 'post',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      image: target.src,
      left: (selected.offsetLeft - target.offsetLeft) * (target.naturalWidth / target.offsetWidth),
      top: (selected.offsetTop - target.offsetTop) * (target.naturalHeight / target.offsetHeight),
      width: width,
      height: width
    })
  }).then(ress => ress.json())

  if (res.success) {
    document.querySelector('.aclPhotoProfile').src = "http://localhost:2020/profile/" + id + "?new=" + Math.floor(Math.random() * 1011);
  } else alerter(res.err);
  cancelChangeProf();
}

async function cropInputed(elem) {
  await reader.readAsDataURL(elem.files[0]);
}
const reader = new FileReader();
const image = new Image();

reader.onload = e => {
  image.src = e.target.result;
  image.onload = () => {
    if (image.width < 256 || image.height < 256) {
      alerter("Image resolution too small! you need more than 256px")
    } else {
      let style = (image.height > image.width) ? "height: 100%" : "width: 100%";

      document.querySelector('main').innerHTML += `<div class="ppreview">
    <div class="backDonePP">
    <img src="./img/ui/arrow_back_ios-white-36dp.svg" onclick="cancelChangeProf()">
    <img src="./img/ui/done_white_36dp.svg" onclick="uploadPP()" class="doneCrop">
    </div>
    <div class="cropImage">
      <img src="${e.target.result}" style="${style}" class="target">
    </div>
    </div>
    `
      if (image.width !== image.height && image.width !== 256) {
        let minimalSelected = (256 / Math.min(image.width, image.width) * Math.min(document.querySelector('.ppreview').offsetWidth, document.querySelector('.ppreview').offsetHeight))
        document.querySelector('.cropImage').innerHTML += `
      <div style="width: ${minimalSelected}px; height: ${minimalSelected}px;" class="selected">
        <div class="corner"></div>
      </div>`;
        cropProcess(reader.result, image)
      }
    }
  }
  delete reader;
  delete image;
}

function cropProcess(base64, {
  width,
  height
}) {
  const sele = document.querySelector('.target')
  const min = 256 / Math.min(width, height) * Math.min(sele.offsetWidth, sele.offsetHeight)
  const max = Math.min(sele.offsetWidth, sele.offsetHeight);
  let mouseStartPos;
  let selectedMouseDown = false;

  let cornerDown = false;
  let cornerMouseStart;

  document.querySelector('.selected').addEventListener('mousedown', (e) => {
    e.preventDefault();
    mouseStartPos = [e.clientX, e.clientY]
    selectedMouseDown = true;
  });

  document.querySelector('.selected').addEventListener('mouseleave', ev => {
    selectedMouseDown = false;
  });

  document.querySelector('.corner').addEventListener('mousedown', e => {
    e.preventDefault();
    cornerDown = true;
    cornerMouseStart = [e.clientX, e.clientY]
  });

  document.addEventListener('mouseup', e => {
    if (cornerDown) cornerDown = false
    if (selectedMouseDown) selectedMouseDown = false
  });

  const target = document.querySelector('.target')
  document.addEventListener('mousemove', e => {
    if (selectedMouseDown && !cornerDown) {
      let posY = e.target.offsetTop + (e.clientY - mouseStartPos[1])
      let posX = e.target.offsetLeft + (e.clientX - mouseStartPos[0])
      if (posX < target.offsetLeft) posX = target.offsetLeft;
      else if (posX + e.target.offsetWidth > target.offsetLeft + target.offsetWidth) posX = target.offsetLeft + (target.offsetWidth - e.target.offsetWidth);
      if (posY < target.offsetTop) posY = target.offsetTop;
      else if (posY + e.target.offsetHeight > target.offsetTop + target.offsetHeight) posY = target.offsetTop + (target.offsetHeight - e.target.offsetHeight);
      e.target.style.top = posY + "px"
      e.target.style.left = posX + "px"
      mouseStartPos = [e.clientX, e.clientY]
    } else if (cornerDown) {
      console.log(e.target.classList[0]);
      const selected = document.querySelector('.selected');
      let widHei;
      if (e.clientX < cornerMouseStart[0] && e.clientY < cornerMouseStart[1]) {
        widHei = selected.offsetWidth - (((cornerMouseStart[0] - e.clientY) + (cornerMouseStart[1] - e.clientX)) / 2);
      } else {
        widHei = selected.offsetWidth + (((e.clientY - cornerMouseStart[0]) + (e.clientX - cornerMouseStart[1])) / 2);
      }
      console.log(widHei > max);
      if (widHei < min) widHei = min;
      if (widHei > max) widHei = max;

      if (selected.offsetLeft + widHei > target.offsetLeft + target.offsetWidth) document.querySelector('.selected').style.left = target.offsetLeft + (target.offsetWidth - widHei) + "px";
      if (selected.offsetTop + widHei > target.offsetTop + target.offsetHeight) document.querySelector('.selected').style.top = target.offsetTop + (target.offsetHeight - widHei) + "px";
      document.querySelector('.selected').style.width = widHei + "px";
      document.querySelector('.selected').style.height = widHei + "px";
      cornerMouseStart = [e.clientX, e.clientY]
    }
  });


}


function addMessage(id) {
  console.log(id);
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
  if (!blocking.includes(parseInt(id))) document.querySelector('.messageContent').focus();
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
  document.querySelector('.chat').scrollTop = document.querySelector('.chat').scrollHeight
  document.querySelector('.messageContent').focus();
}

function messageOption(elem, isGroupChat) {
  elem.parentElement.style.backgroundColor = "rgba(0, 0, 0, .1)";
}

function sendGroupMessage(elemnt, e) {
  const message = escape(elemnt.parentElement.children[0].value.toString().trim());
  e.preventDefault();
  if (message.length) {
    const messageId = Math.floor(Math.random() * 214748364);
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
  const message = escape(document.querySelector('.messageContent').value.toString().trim())
  event.preventDefault();
  if (message.length) {
    const messageId = Math.floor(Math.random() * 214748364)
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
        document.querySelector('.listContainer').innerHTML += createListChat('profilePict', message, event.target.dataset.id)
      }
    }
    if (message.length) socket.emit('chat', {
      to: parseInt(document.querySelector('.sendBtn').dataset.id),
      message: message,
      messageId
    })
    document.querySelector('.messageContent').value = "";
  }
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
        Array.from(document.querySelector('.chat').children)[index[searchMessageNum]].children[0].style.animationName = "includedMsg";
      } else {
        Array.from(document.querySelector('.chat').children)[index[0]].scrollIntoView({
          block: "center"
        });
        lastestIndex = index[0]
        Array.from(document.querySelector('.chat').children)[index[0]].children[0].style.animationName = "includedMsg";
        searchMessageNum = 0;
      }
    } else {
      Array.from(document.querySelector('.chat').children)[index[0]].scrollIntoView({
        block: "center",
        behavior: "smooth"
      });
      lastestIndex = index[0]
      Array.from(document.querySelector('.chat').children)[index[0]].children[0].style.animationName = "includedMsg";
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
    if (e.target.classList[0] !== "opt" && e.target.classList[0] !== "searchMessageInput" && e.target.classList[0] !== "searchMessageSubmit" && e.target.classList[0] !== "messageSearchInputer" && e.target.classList[0] !== "messageSearchForm") {
      document.querySelector('.searchMessageInput').value = "";
      document.querySelector('.sendingMessage').focus();
      document.querySelector('.messageSearchForm').style.top = "-10px";
      document.removeEventListener("click", optionDelete);
    };
    if (lastestIndex || lastestIndex == 0) {
      console.log(document.querySelector('.chat').children[lastestIndex].children[0]);
      document.querySelector('.chat').children[lastestIndex].children[0].style.animationName = "includedMsgOut";
    }
  }
  document.addEventListener('click', optionDelete);
  document.querySelector('.searchMessageInput').focus()
}

async function backFromShow() {
  document.querySelector('.showProfile').style.animationName = "opaFadeOut";
  await setTimeout(function () {
    document.querySelector('.showProfile').remove();
  }, 200);
}


function fullScreenPP() {
  document.querySelector('main').innerHTML += `<div class="showProfile">
    <img src="./img/ui/arrow_back_ios-white-36dp.svg" onclick="backFromShow()" class="backFromShow">
    <img src="${document.querySelector('.aclPhotoProfile').src}" class="bigProfile">
  </div>`
}

function cropHandler() {
  document.querySelector('.fileInputer').click()
}

async function clearChatHandler() {
  const sendBtn = document.querySelector('.sendBtn');
  accountId = (sendBtn) ? sendBtn.dataset.id : document.querySelector('.blockId').dataset.id;
  if (chatAss[accountId]) {
    if (document.getElementById("normalChat")) {
      document.getElementById(accountId).style.transform = "translateX(-100%)";
      document.getElementById(accountId).addEventListener('transitionend', e => {
        e.target.remove();
      });
    }
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

function trynaScroll() {
  Array.from(document.querySelectorAll('.usrCht')).forEach(item => {
    item.children[1].style.left = `-${parseInt(item.children[1].children[0].getBoundingClientRect().width * 4) + 5}px`
  });
}

const optRemoveCb = (elem, e) => {
  if (e.target.classList[0] !== "messageInPlaceOpt" && e.target.parentElement.classList[0] !== "messageInPlaceOpt") {
    document.removeEventListener('click', optRemoveCb);
    if (elem.children[1].style.left == "-140px") {
      elem.children[1].style.left = 0;
    } else {
      elem.children[1].style.right = 0;
    }
  }
}

function leftMessageDb(elem) {
  elem.children[1].style.right = `-${140}px`;
  document.addEventListener('click', optRemoveCb.bind(event, elem), false);
}

function rightMessageDb(elem) {
  document.addEventListener('click', optRemoveCb.bind(event, elem), false);
  elem.children[1].style.left = `-${140}px`;
}

function blockContact() {
  const id = document.querySelector('.sendBtn') ? parseInt(document.querySelector('.sendBtn').dataset.id) : parseInt(document.querySelector('.blockId').dataset.id);

  fetch('/block', {
    method: 'post',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: id
    })
  });
  const blocked = blocking.includes(id);
  (blocked) ? (blocking = blocking.filter((item) => item !== id)) : blocking.push(id)

  const optText = (!blocked) ? "Unblock" : "Block"
  document.querySelector('.blockOpt').innerText = optText;

  const template = blocking.includes(id) ? `<span class="blockId" data-id="${id}"> You blocked this account! Unblock if you want to message</span>` : `<input type="text" name="sendingMessage" class="messageContent">
  <input type="image" src="./img/ui/send-white-36dp.svg" data-id="${parseInt(id)}" onclick="sendMessage(event)" class="sendBtn" alt="Send Message">
  `;
  document.querySelector('.sendingMessage').innerHTML = template;
}