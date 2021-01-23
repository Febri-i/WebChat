function addMessage(id) {
  main.innerHTML = chat(id);
  if (chatAss[id] && chatAss[id].Message) {
    chatAss[id].Message.forEach(message => {
      const chat = document.querySelector('.chat');
      chat.innerHTML += createChat(message.messageContent, message.recive);
      chat.scrollTop = chat.scrollHeight
    });
  }
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
    document.querySelector('main').innerHTML += `<div class="addContactAlert">
      <span class="addContactAlertText">Add to contact?</span>
      <span class="addedContactAlertQ">
        <span onclick="instantContact(${id})" class="addContactAlertYes">Yes</span>
        <span class="addContactAlertNo">No</span>
      </span>
    </div>`
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
  document.querySelector('.chat').scrollTop = chat.scrollHeight
  event.preventDefault();
  socket.emit('chat', {
    from: id,
    to: document.querySelector('.sendBtn').dataset.id,
    message: document.querySelector('.messageContent').value
  })
}



function instantContact(id) {
  if (!document.querySelector('.containerAddContact')) {
    section.innerHTML += `<div class="containerAddContact" onclick="removeAddContact(event.target)"></div>
    <form class="addContactForm">
    <input class="contactForm" placeholder="Username" type="text">
    <input type="image" src="./img/dark/person_add-black-36dp.svg" alt="Add contact" onclick="addContactHandler(event, ${id})">
    </form>`
  }
  summonAddContactForm();
}

function changeUsrnam() {
  document.querySelector('.inputer').style.transform = "translateY(0)";
  document.querySelector('.usrnamrss').style.transform = "translateY(105%)"
};

async function changeNam(lol) {
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
        self: false,
        username: usrInput,
        accountId: lol.dataset.id
      })
    }).then(res => success = res.json())

  if (success.success) {
    document.querySelector('.usernamess').innerText = usrInput;
    const usrnam = document.querySelector('.username');
    if (usrnam && usrnam.innerText !== usrInput) document.querySelector('.username').innerText = usrInput
    document.querySelector('.inpt').value = '';
  }
  document.querySelector('.usrnamrss').style.transform = "translateY(0)";
  document.querySelector('.inputer').style.transform = "translateY(-105%)"
}