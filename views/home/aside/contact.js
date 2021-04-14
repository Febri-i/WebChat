document.querySelector(".contactIcon").addEventListener("click", ev => {
  if (!document.querySelector("#contactList")) {
    section.innerHTML = listContainer;
    document.querySelector(".listContainer").setAttribute("id", "contactList");
  }
  if (!document.querySelector('.addContacts')) {
    section.innerHTML += `<div class="addContacts">
    <img src="./img/ui/person_add-white-36dp.svg" onclick="summonAddContactForm()" alt="Add contacts" class="addContact">
    </div>
    <form onsubmit="addContact(event)" class="addContactForm">
      <input type="image" class="addContactBtn" style="opacity: 0; " src="./img/ui/done-white-18dp.svg">
      <input type="text" class="formAddContact">
    </form>
    `
  }
  if (contacts && !document.querySelector('.list')) {
    Object.keys(contacts).forEach(item => {
      document.querySelector(".listContainer").innerHTML += createListContact("profilePict", item);
    });
  }
});

function addContactHandler(username, accountId) {
  if (typeof username == "string", typeof accountId == "number", accountId.toString().length == 6) {
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
        const ppusernam = document.querySelector('.usernamess');
        const chtusrnam = document.getElementById(`#${accountId}`);
        const usrnam = document.querySelector('.chatProfileName');
        if (ppusernam && ppusernam.dataset.id == accountId) ppusernam.innerText = username
        if (chtusrnam && chtusrnam.innerText !== username) {
          document.querySelector('.usrnamrss').style.transition = "none";
          document.querySelector('.usrnamrss').style.paddingLeft = '34px';
          chtusrnam.innerText = username
          document.querySelector('.changEd').style.display = "flex";
          document.querySelector('.inputer').style.display = "flex";
          document.querySelector('.usrnamrss').style.transition = "transform .3s";
        }
        if (usrnam && usrnam.dataset.id == accountId) usrnam.innerText = username
        contacts[parseInt(accountId)] = username;
        if (document.querySelector('#contactList'))
          document.querySelector('#contactList').innerHTML += createListContact("profilePict", parseInt(accountId));
        if (document.querySelector('.sendBtn') && document.querySelector('.sendBtn').dataset && document.querySelector('.sendBtn').dataset.id == accountId) document.querySelector('.chatProfileName').innerText = username;
        contacts[parseInt(accountId)] = username;
      };
      if (!res.success) {
        alerter(res.err)
      } else if (res.scroll && accountId) {
        const addedContact = document.getElementById(accountId)
        addedContact.setAttribute('tabindex', '-1');
        addedContact.focus();
        addedContact.removeAttribute('tabindex')
      };
    });
  } else {
    alerter('Use correct format!')
  }
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
      const ppusernam = document.querySelector('.usernamess');
      if (ppusernam && ppusernam.dataset.id == id) {
        ppusernam.innerText = id;
        const cb = (e) => {
          document.querySelector('.usrnamrss').style.transition = "none";
          document.querySelector('.changEd').style.display = "none";
          document.querySelector('.inputer').style.display = "none";
          document.querySelector('.usrnamrss').style.paddingLeft = 0;
          if (e) e.target.removeEventListener('transitionend', cb);
        };
        if (document.querySelector('.usrnamrss').style.transform == 'translateY(105%)') {
          document.querySelector('.inputer').style.transform = "translateY(105%)"
          document.querySelector('.usrnamrss').style.transform = 'translateY(0px)';
          document.querySelector('.usrnamrss').addEventListener('transitionend', cb);
        } else cb();
      }
      if (usernam && usernam.dataset.id == id) usernam.innerText = id;
      delete contacts[id];
    } else alerter(res.err)
  });
}