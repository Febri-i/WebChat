document.querySelector(".chatIcon").addEventListener("click", e => {
  section.innerHTML = listContainer;
  if (!document.querySelector("#normalChat")) {
    document.querySelector(".listContainer").setAttribute("id", "normalChat");
  }
  if (chatAss) {
    Object.keys(chatAss).forEach(item => {
      document.querySelector(".listContainer").innerHTML += createListChat("profilePict", chatAss[item].Message[chatAss[item].Message.length - 1].messageContent, item);
    });
  }
});