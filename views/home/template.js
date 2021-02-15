function chat(id) {
  return `
  <div class="chatProfileInfo">
  <img src="./pp/profile.jpeg" alt="Photo Profile" onclick="showContactProfile(${id}, event)" class="profile chatProfilePicture">
  <span class="chatProfileName" data-id="${id}" >${getUsrName(id)}</span>
  <img src="./img/light/menu-black-36dp.svg" alt="Option" class="option">
  </div>
  <div class="chat">
  </div>
  <form class="sendingMessage">
  <input type="text" name="sendingMessage" class="messageContent">
  <input type="image" src="./img/light/send-black-36dp.svg" data-id="${parseInt(id)}" onclick="sendMessage(event)" class="sendBtn" alt="Send Message">
  </form>`;
}

function chatGroup(id) {
  let member = "";
  groupChat[id].member.forEach(item => {
    console.log(item, groupChat[id].member);
    if (item == groupChat[id].member[groupChat[id].member.length - 1]) {
      member += `${getUsrName(item.accountId)}`;
    } else {
      member += `${getUsrName(item.accountId)}, `;
    }
  });
  return `<div class="chatProfileInfo">
    <img src="./pp/profile.jpeg" alt="Photo Profile" class="profile chatProfilePicture" />
    <span class="chatProfileName" >${groupChat[id].groupName}<br /> <span class="member">${member}</span></span>
    <img src="./img/light/menu-black-36dp.svg" alt="Option" class="option" />
  </div>
  <div class="chat"></div>
  <form class="sendingMessage">
    <input type="text" name="sendingMessage" class="messageContent" />
    <input type="image" onclick="sendGroupMessage(this, event)" src="./img/light/send-black-36dp.svg" data-id="${id}" class="sendBtn" alt="Send Message" />
  </form>`;
}

function createListContact(profilePict, id) {
  return `<div class="list" id="${id}" onclick="addMessage(this.id)"><img src="./pp/profile.jpeg" onclick="showContactProfile(${id}, event)" alt="Photo Profile" class="profile clPhotoProfile" /><div class="listInfo"><span class="username">${getUsrName(id)}</span><img class="deleteContact" onclick="deleteContact(this.dataset.id, event)" data-id="${parseInt(id)}" src="./img/light/delete-black-18dp.svg"></div></div> `;
}

function createListChat(profilePict, lastChat, id) {
  return `<div class="list" id="${id}" onclick="addMessage(this.id)"><img src="./pp/profile.jpeg" onclick="showContactProfile(${id}, event)" alt="Photo Profile" class="profile clPhotoProfile" /><div class="listInfo"><span class="username">${getUsrName(id)}</span><span class="lastChat">${lastChat}</span></div></div> `;
}

function createListChatGroup(id) {
  function lastMessage() {
    if (groupChat[id].message.length) {
      let sender = getUsrName(groupChat[id].message[groupChat[id].message.length - 1].from);
      return `${sender}: ${groupChat[id].message[groupChat[id].message.length - 1].messageContent}`;
    } else return "";
  }
  return `<div class="list" id="${id}" onclick="addMessageGroup(this.id)"><img src="./pp/profile.jpeg" alt="Photo Profile" class="profile clPhotoProfile" /><div class="listInfo"><span class="username">${groupChat[id].groupName}</span><span class="lastChatGroup">${lastMessage()}</span></div></div> `;
}


function createChat(Message, from) {
  if (from == id) {
    return `<div class="usrCht"><span class="chatContent">${Message}</span></div>`;
  } else {
    return `<div class="oppCht"><span class="chatContent">${Message}</span></div>`;
  }
}

function createSelectContact(id) {
  return `<div class="list" id="${id}" onclick="addContactToList(this)">
        <img src="./pp/profile.jpeg" alt="Photo Profile" class="profile clPhotoProfile" />
        <div class="listInfo">
          <span class="username">${getUsrName(id)}</span>
        </div>
      </div>`
}

function createChatGroup(Message, from) {
  if (from == id) {
    return `<div class="usrCht"><span class="chatContent">${Message}</span></div>`;
  } else {
    return `<div class="oppCht"><strong>${getUsrName(from)}</strong><span class="chatContent">${Message}</span></div>`;
  }
}
const listContainer = `<form class="searchChat"><input type="text" oninput="searchChat(this)"/><input type="image" src="./img/light/search-black-36dp.svg" alt="Search" /> </form><div id="normalChat" class="listContainer"></div>`;

function createProfile(id, date) {
  return `<div class="mainProfile">
    <img src="./pp/profile.jpeg" class="aclPhotoProfile" alt="Photo Profile" />
    <div class="container">
      <div class="usrnamrss">
        <span class="usernamess" data-id="${id}" >${accUserName}</span>
        <img src="./img/light/edit-white-18dp.svg" class="changEd" style="cursor: pointer" onclick="changeUsrnam()">
      </div>
      <div class="inputer">
        <input class="inpt" type="text">
        <img src="./img/light/done-white-18dp.svg" class="changDone" onclick="changeNam(this, true)" style="cursor: pointer">
      </div>
    </div>
    <input type="file" name="pprofile" id="prfileiN" />
  </div>
  <div class="profileInfo">
    <div class="usrProfileId">
      <strong>Account id</strong>
      <span>${id}</span>
    </div>
    <div class="date">
      <strong>Account created at</strong>
      <span>${date}</span>
    </div>
  </div>`;
}

function contactProfile(id) {
  return `<div class="mainProfile">
  <img src="./pp/profile.jpeg" class="aclPhotoProfile" alt="Photo Profile">
  <div class="container">
    <div class="usrnamrss">
      <span class="usernamess" data-id="${id}" >${getUsrName(id)}</span>
      <img src="./img/light/edit-white-18dp.svg" class="changEd" style="cursor: pointer" onclick="changeUsrnam()">
    </div>
    <div class="inputer">
      <input class="inpt" type="text">
      <img src="./img/light/done-white-18dp.svg" class="changDone" onclick="changeNam(this)" data-id="${id}" style="cursor: pointer">
    </div>
  </div>
  </div>
  <div class="profileInfo">
    <div class="usrProfileId">
      <strong>Account id</strong>
      <span>${id}</span>
    </div>
  `;
}