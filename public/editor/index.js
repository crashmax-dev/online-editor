const app = document.querySelector("#app");
document.body.classList.add("surface");

let files = [];
let activeTab = "tab-index.js";

function renderEditor(time) {
  const codeSection = document.createElement("section");
  codeSection.classList.add("tabs");

  const menu = document.createElement("menu");
  menu.setAttribute("role", "tablist");
  codeSection.replaceChildren(menu);

  for (const file of files) {
    const tabButton = document.createElement("button");
    tabButton.addEventListener("click", (event) => {
      event.preventDefault();
      const tabs = menu.querySelectorAll("menu[role=tablist] > button");
      for (const tab of tabs) {
        if (
          tab.getAttribute("aria-controls") ===
          event.target.getAttribute("aria-controls")
        ) {
          tab.setAttribute("aria-selected", true);
          openTab(event);
        } else {
          tab.setAttribute("aria-selected", false);
        }
      }
    });

    tabButton.style.fontSize = "14px";
    tabButton.setAttribute("role", "tab");
    const tabName = `tab-${file.name}`;
    tabButton.setAttribute("aria-controls", tabName);
    tabButton.setAttribute("aria-selected", activeTab === tabName);
    tabButton.textContent = file.name;
    menu.append(tabButton);

    const tabPanel = document.createElement("article");
    tabPanel.setAttribute("role", "tabpanel");
    tabPanel.setAttribute("id", tabName);
    tabPanel.hidden = activeTab !== tabName;
    codeSection.append(tabPanel);

    const textarea = document.createElement("textarea");
    Object.assign(textarea.style, {
      width: "100%",
      minHeight: "600px",
      resize: "vertical",
      fontSize: "16px",
      fontFamily: "monospace",
    });
    textarea.value = file.source;
    textarea.addEventListener("input", () => (file.source = textarea.value));
    tabPanel.append(textarea);
  }

  const fieldActions = document.createElement("section");
  fieldActions.classList.add("field-row");
  fieldActions.style.justifyContent = "flex-end";

  const saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.addEventListener("click", sendFiles);
  fieldActions.append(saveButton);

  const iframeSection = document.createElement("article");
  iframeSection.setAttribute("role", "tabpanel");
  iframeSection.setAttribute("iframe", "1");
  iframeSection.style.marginTop = "9px";

  const iframe = document.createElement("iframe");
  iframe.style.width = "100%";
  iframe.setAttribute("frameborder", "0");
  iframe.src = "/output/index.html";
  iframeSection.append(iframe);

  if (time) {
    const buildTime = document.createElement("div");
    Object.assign(buildTime.style, {
      position: "absolute",
      bottom: "4px",
      right: "6px",
      fontSize: "12px",
      color: "gray",
    });
    buildTime.textContent = `built in ${time}ms`;
    iframeSection.append(buildTime);
  }

  app.replaceChildren(codeSection, fieldActions, iframeSection);
}

function renderError(data) {
  const iframe = document.querySelector("article[iframe]");
  const errorMessage = document.createElement("pre");
  errorMessage.textContent = data.message.replace(
    /\u001b\[(31|39|36|33)m/g,
    ""
  );
  iframe.replaceChildren(errorMessage);
}

function openTab(event) {
  const articles = document.body.querySelectorAll('article[role="tabpanel"]');
  const targetTab = event.target.getAttribute("aria-controls");
  for (const article of articles) {
    if (article.getAttribute("iframe")) continue;
    if (targetTab === article.id) {
      article.removeAttribute("hidden");
      activeTab = targetTab;
    } else {
      article.setAttribute("hidden", true);
    }
  }
}

async function fetchFiles() {
  try {
    const req = await fetch("/api/files");
    const data = await req.json();
    files = data;
  } catch (err) {
    console.error(err);
  }
}

async function sendFiles() {
  try {
    const req = await fetch("/api/files", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(files),
    });
    const data = await req.json();
    if (data.time) {
      renderEditor(data.time);
    } else {
      renderError(data);
    }
  } catch (err) {
    console.error(err);
  }
}

fetchFiles().then(renderEditor);

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "s") {
    if (!files.length) return;
    event.preventDefault();
    sendFiles();
  }
});
