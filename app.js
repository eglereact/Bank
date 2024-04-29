console.log("hello");

window.addEventListener("load", () => {
  // keys for local storage
  const LAST_ID_LS = "userLastSavedId";
  const USERS_LS = "usersList";

  // select elements
  const closeButtons = document.querySelectorAll(".--close");
  const createModal = document.querySelector(".modal--create");
  const storeButton = createModal.querySelector(".--submit");
  const createButton = document.querySelector(".--create");

  // creats new id for a user or gets if created
  const getId = () => {
    // gets id from local storage
    const id = localStorage.getItem(LAST_ID_LS);
    // if local storage empty, we create and return 1
    if (id === null) {
      localStorage.setItem(LAST_ID_LS, 1);
      return 1;
    }
    // if id already exist
    localStorage.setItem(LAST_ID_LS, parseInt(id) + 1);
    return parseInt(id) + 1;
  };

  //opens modal
  const showModal = (modal) => (modal.style.display = "flex");

  const hideModal = (modal) => {
    modal.querySelectorAll("[name]").forEach((i) => {
      i.value = "";
    });
    modal.style.display = "none";
  };

  //Events
  // find right modal to close
  closeButtons.forEach((b) => {
    b.addEventListener("click", () => {
      hideModal(b.closest(".--modal"));
    });
  });
  // opens
  createButton.addEventListener("click", () => showModal(createModal));
});
