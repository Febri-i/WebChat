document.querySelector(".groupchatIcon").addEventListener("click", e => {
  if (document.querySelector(".mainProfile")) {
    Array.from(document.querySelector("main").children).forEach(item => {
      item.remove();
    });
  }
  section.innerHTML = listContainer;
  if (document.querySelector("#normalChat")) {
    document.querySelector("#normalChat").setAttribute("id", "groupChat");
  }

  if (
    document.querySelector("#groupChat") ||
    !document.querySelector(".listContainer")
  ) {
    Object.keys(groupChat).forEach(item => {
      document.querySelector(".listContainer").innerHTML += createListChatGroup(
        "profilePict",
        groupChat[item].groupName,
        groupChat[item].message[groupChat[item].message.length - 1]
          .messageContent,
        groupChat[item].member[
          groupChat[item].message[groupChat[item].message.length - 1].from
        ].username,
        item
      );
    });
  }
});
