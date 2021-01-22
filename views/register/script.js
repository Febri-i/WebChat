if (prev) {
  document.querySelector(".loginForm").style.marginLeft = "100%";
  document.querySelector(".verifForm").style.marginLeft = "0px";
  document.querySelector("#email").value = prev.email;
  document.querySelector("#usrnam").value = prev.username;
  document.querySelector("#passw").value = prev.password;
}

Array.from(document.querySelectorAll("input")).forEach(item => {
  if (item.value) {
    document.querySelector(`.${item.id}`).style =
      "top: 0; left: 3; color: dodgerblue;";
  }
  item.addEventListener("input", e => {
    if (!e.target.value)
      document.querySelector(`.${e.target.id}`).style =
        "top: 22.38px; left: 5px;";
    else
      document.querySelector(`.${e.target.id}`).style =
        "top: 0; left: 3; color: dodgerblue;";
  });
});

document.querySelector(".sub").addEventListener("click", e => {
  fetch("/register", {
    method: "put",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: document.querySelector("#usrnam").value,
      email: document.querySelector("#email").value,
      password: document.querySelector("#passw").value
    })
  })
    .then(response => response.json())
    .then(response => {
      if (response.success) {
        if (document.querySelector(".verifForm").style.marginLeft !== "0px") {
          document.querySelector(".loginForm").style.marginLeft = "100%";
          document.querySelector(".verifForm").style.marginLeft = "0px";
        }
      } else if (!response.success) alert(response.err);
    });
  e.preventDefault();
});

document.querySelector(".mit").addEventListener("click", e => {
  fetch("/register", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: document.querySelector("#usrnam").value,
      email: document.querySelector("#email").value,
      password: document.querySelector("#passw").value,
      verifyCode: document.querySelector("#verify").value
    })
  })
    .then(response => response.json())
    .then(response => {
      if (response.success || response.redir) {
        window.location.href = response.redir;
      } else if (!response.success) alert(response.err);
    });
  e.preventDefault();
});
