const html = `<div class="user">
              <div class="user-info">
                <div class="name">{{name}}</div>
                <div class="surname">{{surname}}</div>
                <div class="amount">$ {{amount}}</div>
              </div>
              <div>
                <button type="button" value="{{id}}" class="green --deposit">
                  Deposit
                </button>
                <button type="button" value="{{id}}" class="yellow --withdraw">
                  Withdraw
                </button>
                <button type="button" value="{{id}}" class="red --delete">
                  Delete
                </button>
              </div>
            </div>`;

window.addEventListener("load", () => {
  // keys for local storage
  const LAST_ID_LS = "userLastSavedId";
  const USERS_LS = "usersList";
  let destroyId = 0;
  let addId = 0;

  // select elements
  const closeButtons = document.querySelectorAll(".--close");
  const createModal = document.querySelector(".modal--create");
  const storeButton = createModal.querySelector(".--submit");
  const createButton = document.querySelector(".--create");
  const listHtml = document.querySelector(".--list");
  const deleteModal = document.querySelector(".modal--delete");
  const deleteButton = deleteModal.querySelector(".--submit");
  const depositModal = document.querySelector(".modal--deposit");
  const depositButton = depositModal.querySelector(".--submit");
  const withdrawModal = document.querySelector(".modal--withdraw");
  const withdrawButton = withdrawModal.querySelector(".--submit");
  //extra
  const totalAmount = document.querySelector(".total--amount");
  const totalUsers = document.querySelector(".total--users");
  const alert = document.querySelector(".alert");

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

  // writes data to local storage
  const write = (data) => {
    localStorage.setItem(USERS_LS, JSON.stringify(data));
  };
  // reads from local storage
  const read = () => {
    const data = localStorage.getItem(USERS_LS);
    //return empty array is there is no users
    if (null === data) {
      return [];
    }
    // parse data before sorting
    const sortedItems = JSON.parse(data).sort(compareBySurname);
    return sortedItems;
  };

  const compareBySurname = (a, b) => {
    // Convert names to lowercase for case-insensitive sorting
    const nameA = a.holderSurname.toLowerCase();
    const nameB = b.holderSurname.toLowerCase();

    // Compare the names
    if (nameA < nameB) {
      return -1; // Name A comes before name B
    }
    if (nameA > nameB) {
      return 1; // Name A comes after name B
    }
    return 0; // Names are equal
  };

  //opens modal
  const showModal = (modal) => (modal.style.display = "flex");

  //hides modal
  const hideModal = (modal) => {
    modal.querySelectorAll("[name]").forEach((i) => {
      i.value = "";
    });
    modal.style.display = "none";
  };

  const storeData = (data) => {
    const storeData = read();
    data.id = getId();
    data.amount = 0; // set amount to 0
    storeData.push(data);

    write(storeData);
  };

  const destroyData = (id) => {
    const data = read();
    const deleteData = data.filter((d) => d.id != id);
    write(deleteData);
  };
  //LS
  const updateData = (id, data) => {
    const updateData = read().map((p) => (p.id == id ? { ...data, id } : p));
    write(updateData);
  };

  const showList = () => {
    let usersHtml = "";
    read().forEach((u) => {
      let temp = html;
      temp = temp.replaceAll("{{id}}", u.id);
      temp = temp.replaceAll("{{name}}", u.holderName);
      temp = temp.replaceAll("{{surname}}", u.holderSurname);
      temp = temp.replaceAll("{{amount}}", u.amount);
      usersHtml += temp;
    });
    listHtml.innerHTML = usersHtml;
    registerAction(deleteModal, "delete");
    registerAction(depositModal, "deposit");
    registerAction(withdrawModal, "withdraw");
    countTotalSum();
    countTotalUsers();
  };
  // shows in modal users name and surname
  const prepareModal = (modal, id) => {
    const user = read().find((p) => p.id == id);
    const name = user.holderName;
    const surname = user.holderSurname;
    modal.querySelector(".user--title").innerText = `${name} ${surname}`;
  };
  // counts how many users in the list
  const countTotalUsers = () => {
    const data = read();
    totalUsers.innerText = data.length;
  };
  // counts total amount of all users
  const countTotalSum = () => {
    const data = read();
    let total = 0;
    data.forEach((u) => {
      total += u.amount;
    });
    totalAmount.innerText = `$ ${total}`;
  };

  // display alert with message
  const displayAlert = (text, action) => {
    alert.textContent = text;
    alert.classList.add(`alert-${action}`);
    // remove alert
    setTimeout(function () {
      alert.textContent = "";
      alert.classList.remove(`alert-${action}`);
    }, 2000);
  };

  //CRUD
  // reads all data
  const getDataFromForm = (form) => {
    const data = {};
    form.querySelectorAll("[name]").forEach((i) => {
      data[i.getAttribute("name")] = i.value;
    });

    return data;
  };
  // stores data
  const store = () => {
    const data = getDataFromForm(createModal);
    storeData(data);
    hideModal(createModal);
    showList();
    displayAlert(
      `The user named ${data.holderName} ${data.holderSurname} was created successfully`,
      "success"
    );
  };
  //deletes user
  const destroy = () => {
    const user = read().find((p) => p.id == destroyId);
    if (user.amount == 0) {
      destroyData(destroyId); //LS
      hideModal(deleteModal);
      displayAlert(
        `The user named ${user.holderName} ${user.holderSurname} was deleted successfully`,
        "success"
      );
    } else {
      displayAlert(
        `Please withdraw the funds before proceeding with deletion.`,
        "danger"
      );
    }
    showList();
  };

  const performTransaction = (actionType) => {
    const users = read(); // finds all users in ls
    const user = users.find((p) => p.id == addId); // finds right user
    const input = document.querySelector(
      `input[name='${actionType}Amount']`
    ).value; // input amount
    if (actionType === "deposit") {
      user.amount += parseFloat(input); // adds input value to user amount
      hideModal(depositModal);
      displayAlert(
        `${input}$ was successfully deposited to account of ${user.holderName} ${user.holderSurname}.`,
        "success"
      );
    } else if (actionType === "withdraw") {
      if (user.amount >= input) {
        user.amount -= parseFloat(input); // withdraws input value to user amount
        hideModal(withdrawModal);
        displayAlert(
          `${input}$ was successfully withdrawn from the account of ${user.holderName} ${user.holderSurname}.`,
          "success"
        );
      } else {
        displayAlert(`Insufficient Funds.`, "danger");
      }
    }
    updateData(addId, user);
    //hideModal(actionType === "deposit" ? depositModal : withdrawModal);
    // displayAlert(
    //   actionType === "deposit"
    //     ? `${input}$ was successfully deposited to account of ${user.holderName} ${user.holderSurname}.`
    //     : `${input}$ was successfully withdrawn from the account of ${user.holderName} ${user.holderSurname}.`,
    //   "success"
    // );
    showList();
  };

  //Events
  //
  const registerAction = (actionModal, actionType) => {
    document.querySelectorAll(`.--${actionType}`).forEach((b) => {
      b.addEventListener("click", () => {
        showModal(actionModal);
        prepareModal(actionModal, b.value);
        if (actionType === "delete") {
          destroyId = parseInt(b.value);
        } else {
          addId = parseInt(b.value);
        }
      });
    });
  };
  // dev button and seed
  const devBtn = document.querySelector(".seed");

  const seed = () => {
    write(seedData);
    localStorage.setItem(LAST_ID_LS, 10);
  };

  devBtn.addEventListener("click", () => {
    seed();
    showList();
  });

  // find right modal to close
  closeButtons.forEach((b) => {
    b.addEventListener("click", () => {
      hideModal(b.closest(".--modal"));
    });
  });
  // on button click opens create modal
  createButton.addEventListener("click", () => showModal(createModal));
  // stores data to LS
  storeButton.addEventListener("click", () => store());
  // deletes user
  deleteButton.addEventListener("click", () => destroy());
  //opens deposit modal and adds money
  depositButton.addEventListener("click", () => performTransaction("deposit"));
  // opens withdraw button and withdraws money
  withdrawButton.addEventListener("click", () =>
    performTransaction("withdraw")
  );

  showList();
  // setTimeout((_) => showList(), 2000);
});

const seedData = [
  {
    id: 1,
    holderName: "Dwight",
    holderSurname: "Fairfield",
    amount: 50,
  },
  {
    id: 2,
    holderName: "Meg",
    holderSurname: "Thomas",
    amount: 1000,
  },
  {
    id: 3,
    holderName: "Claudette",
    holderSurname: "Morel",
    amount: 3250,
  },
  {
    id: 4,
    holderName: "Jake",
    holderSurname: "Park",
    amount: 10,
  },
  {
    id: 5,
    holderName: "Nea",
    holderSurname: "Karlsson",
    amount: 500,
  },
  {
    id: 6,
    holderName: "Laurie",
    holderSurname: "Strode",
    amount: 10000,
  },
  {
    id: 7,
    holderName: "Ace",
    holderSurname: "Visconti",
    amount: 0,
  },
  {
    id: 8,
    holderName: "William",
    holderSurname: "Overbeck",
    amount: 300,
  },
  {
    id: 9,
    holderName: "Feng",
    holderSurname: "Min",
    amount: 50,
  },
  {
    id: 10,
    holderName: "David",
    holderSurname: "King",
    amount: 14,
  },
];
