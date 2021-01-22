Array.from(document.querySelectorAll("input")).forEach(item => {
  if (item.value) {
    document.querySelector(`.${item.id}`).style = "top: 22.38px; left: 5px;";
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

document.querySelector(".loginForm").addEventListener("submit", e => {
  fetch("/login", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: e.target[0].value,
      password: e.target[1].value
    })
  })
    .then(response => response.json())
    .then(response => {
      response.success
        ? (window.location.href = response.redir)
        : alert(response.err);
    });
  e.preventDefault();
});
