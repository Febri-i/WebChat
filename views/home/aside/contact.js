document.querySelector(".contactIcon").addEventListener("click", ev => {
  if (!document.querySelector("#contactList")) {
    section.innerHTML = listContainer;
    document.querySelector(".listContainer").setAttribute("id", "contactList");
  }
  if (!document.querySelector('.addContacts') && !document.querySelector('.containerAddContact')) {
    section.innerHTML += `<div class="addContacts">
    <img src="./img/light/person_add-white-36dp.svg" onclick="summonAddContactForm()" alt="Add contacts" class="addContact">
    </div>`
    section.innerHTML += `<div class="containerAddContact" onclick="removeAddContact(event.target)"></div>
    <form class="addContactForm">
    <input class="contactForm" placeholder="Username#id" type="text">
    <input type="image" src="./img/dark/person_add-black-36dp.svg" alt="Add contact" onclick="addContactHandler(event)">
    </form>`
  }
  if (contacts && !document.querySelector('.list')) {
    Object.keys(contacts).forEach(item => {
      document.querySelector(".listContainer").innerHTML += createListContact("profilePict", item);
    });
  }
});

function summonAddContactForm(id) {
  document.querySelector('.containerAddContact').style = 'display: flex; opacity: 1;';
  document.querySelector('.addContactForm').style = 'display: flex; animation-name: munculAddC;'
}

function addContactHandler(e, defaultValue) {
  e.preventDefault();
  const splitted = document.querySelector('.contactForm').value.split('#');
  const username = splitted[0]
  let accountId = splitted[1]
  if (defaultValue) accountId = defaultValue;
  if (accountId && document.querySelector('.contactForm').value && typeof username == "string" && parseInt(accountId) !== NaN && accountId.toString().length == 6) {
    fetch('/contact', {
      method: 'post',
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        accountId: parseInt(accountId)
      })
    }).then(res => res.json()).then(res => {
      if (res.success) {
        const ppusernam = document.querySelector('.profileusrname');
        const chtusrnam = document.querySelector('.listInfo').querySelector('.username');
        const usrnam = document.querySelector('.chatProfileName');
        const asker = document.querySelector('.addContactAlert');
        if (asker) asker.style.animationName = 'addContactAlertAnimBack';
        if (ppusernam && ppusernam.innerText !== username) ppusernam.innerText = username
        if (chtusrnam && chtusrnam.innerText !== username) chtusrnam.innerText = username
        if (usrnam && usrnam.innerText !== username) usrnam.innerText = username
        contacts[parseInt(accountId)] = username;
        if (document.querySelector('#contactList'))
          document.querySelector('#contactList').innerHTML += createListContact("profilePict", parseInt(accountId));
        if (document.querySelector('.sendBtn') && document.querySelector('.sendBtn').dataset && document.querySelector('.sendBtn').dataset.id == accountId) document.querySelector('.chatProfileName').innerText = username;
        contacts[parseInt(accountId)] = username;
      };
      if (!res.success) {
        alert(res.err)
      } else if (res.scroll && accountId) {
        removeAddContact(document.querySelector('.containerAddContact'))
        const addedContact = document.getElementById(accountId)
        addedContact.setAttribute('tabindex', '-1');
        addedContact.focus();
        addedContact.removeAttribute('tabindex')
        removeAddContact(document.querySelector('.containerAddContact'))
      };
    });
  } else {
    alert('Use correct format!')
  }
}

function removeAddContact(e) {
  e.style.opacity = 0;
  if (document.querySelector('.addContactForm')) {
    document.querySelector('.addContactForm').style.animationName = 'keluarAddC';
  }
  const contactAnimEndCall = () => {
    document.querySelector('.addContactForm').style.display = 'none';
    e.style.display = 'none';
    document.querySelector('.addContactForm').removeEventListener('animationend', contactAnimEndCall)
  }
  document.querySelector('.addContactForm').addEventListener('animationend', contactAnimEndCall)
}

function deleteContact(id, e) {
  e.stopPropagation()
  fetch('/contact', {
    method: 'delete',
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      accountId: id,
      username: document.getElementById(id).parentElement.querySelector('.username').textContent
    })
  }).then(res => res.json()).then(res => {
    if (res.success) {
      document.getElementById(id).remove();
      const usernam = document.querySelector('.chatProfileName');
      const ppusernam = document.querySelector('.profileusrname');
      const editBtn = document.querySelector('.changeContactUseraname');
      if (editBtn) editBtn.style.display = 'none';
      if (ppusernam && ppusernam.innerText !== id) ppusernam.innerText = id;
      if (usernam && usernam.innerText !== id) usernam.innerText = id;
      delete contacts[id];
    } else alert(res.err)
  });
}