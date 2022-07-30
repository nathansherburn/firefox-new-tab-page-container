let containerButtons = null;
let containerButtonTemplate = null;
let currentContainer = null;

function changeContainer(node) {
  browser.tabs.getCurrent().then(
    (tabInfo) => {
      browser.tabs.create({
        cookieStoreId: node.getAttribute("data-container"),
        index: tabInfo.index + 1,
      });
      browser.tabs.remove(tabInfo.id);
    },
    () => console.error("Cannot change contextual identity for current tab")
  );
}

function createButton(identity) {
  let node = containerButtonTemplate.content
    .querySelector(".container-button")
    .cloneNode(true);
  node.querySelector(".name").innerText = identity.name;
  node.querySelector(".icon").setAttribute("src", identity.iconUrl);
  node.querySelector(".icon-container").style.backgroundColor =
    identity.colorCode;
  node.setAttribute("data-container", identity.cookieStoreId);
  node.addEventListener("click", function () {
    changeContainer(node);
  });
  return node;
}

window.addEventListener("load", init);

async function init() {
  containerButtons = document.querySelector("#container-buttons");
  containerButtonTemplate = document.querySelector(
    "#container-button-template"
  );
  currentContainer = document.querySelector("#current-container-color");

  currentContainerId = await getCurrentContainerId();
  currentContainer.style.backgroundColor = "rgb(162, 162, 162)";

  browser.contextualIdentities.query({}).then((identities) => {
    if (!identities.length) {
      containerButtons.innerText =
        "It looks like you don't have any account containers.";
      return;
    }

    for (let identity of identities) {
      let node = createButton(identity);
      containerButtons.appendChild(node);
      if (identity.cookieStoreId === currentContainerId) {
        currentContainer.style.backgroundColor = identity.colorCode;
      }
    }

    containerButtons.appendChild(
      createButton({
        cookieStoreId: "",
        iconUrl: "resource://usercontext-content/circle.svg",
        colorCode: "#a2a2a2",
        name: "Default Container",
      })
    );
  });
}

async function getCurrentContainerId() {
  let tabInfo = await browser.tabs.getCurrent();
  return tabInfo.cookieStoreId;
}
