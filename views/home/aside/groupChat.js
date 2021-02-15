document.querySelector(".groupchatIcon").addEventListener("click", e => {
  section.innerHTML = listContainer;
  if (!document.querySelector("#groupChat")) {
    document.querySelector(".listContainer").setAttribute("id", "groupChat");
  }

  if (!document.querySelector('.addGroups')) {
    section.innerHTML += `<div class="addGroups"  onclick="questionGroupMethod()">
    <img src="./img/light/group_add-white-36dp.svg" alt="Add groups" class="addGroup">
    </div>
    <div class="groupMethod" style="height: 45px;">
    <img src="./img/light/link-white-36dp.svg" alt="Join group" onclick="showLinkGroup()" class="groupLink">
    <img src="./img/light/group_add-white-36dp.svg" alt="Create group" onclick="createGroup()" class="groupCreate">
    </div>
    <form onsubmit="joinGroup(event)" class="joinGroup">
      <input type="image" class="propeller" style="opacity: 0; " src="./img/light/done-white-18dp.svg">
      <input type="text" class="linkGroup" name="linkGroup">
    </form>
    `;
    document.querySelector('.addGroups').addEventListener('animationend', ev => ev.target.style.animationName = "l");
  }


  Object.keys(groupChat).forEach(item => {

    document.querySelector(".listContainer").innerHTML += createListChatGroup(item);
  });

});