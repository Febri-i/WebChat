document.querySelector(".profileIcon").addEventListener("click", ev => {
  if (!document.querySelector(".mainProfile")) {
    main.innerHTML = createProfile(id, "20 sep 2020");
  } else {
    Array.from(main.children).forEach((item) => {
      item.remove();
    });
  }
});