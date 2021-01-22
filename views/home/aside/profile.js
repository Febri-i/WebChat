document.querySelector(".profileIcon").addEventListener("click", ev => {
  if (!document.querySelector(".mainProfile")) {
    main.innerHTML = createProfile(id, "febri", "20 sep 2020");
  }
});
