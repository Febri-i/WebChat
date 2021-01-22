document.querySelector(".chatIcon").addEventListener("click", e => {
  if(document.querySelector(".mainProfile")) {
    Array.from(document.querySelector("main").children).forEach(item => {
      item.remove();
    });
  }
  if(document.querySelector("#groupChat")) {
    document.querySelector("#groupChat").setAttribute("id", "normalChat");
  }
  if(!document.querySelector(".listContainer") || !document.querySelector("#groupChat")) {
    section.innerHTML = listContainer;
    if(chatAss) {
      Object.keys(chatAss).forEach(item => {
        document.querySelector(".listContainer").innerHTML += createListChat("profilePict", chatAss[item].Message[chatAss[item].Message.length - 1].messageContent, item);
      });
    }
  }
});