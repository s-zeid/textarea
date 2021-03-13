import * as Utils from "/utils.js";


const UI_LOCATION = new URLSearchParams(location.search).get("ui-location") || "iframe";

const TextareaLoadedEvent = new Event("textareaLoaded");


async function main(e) {
 let connection = browser.runtime.connect({name: `textarea.${UI_LOCATION}:${Date.now()}`});
 
 let iframe = e.target;
 let iwin = iframe.contentWindow;
 let idoc = iframe.contentDocument;
 
 let root = idoc.documentElement;
 let textarea = idoc.querySelector("textarea");
 
 root.classList.add(UI_LOCATION);
 textarea.classList.add(UI_LOCATION);
 
 addCustomCSSElement(idoc, "iframe");
 connection.onMessage.addListener((message, sender) => {
  switch (message.type) {
   case "options-saved":
    // Reload instead of setting CSS textContent so that background images are reloaded.
    // The text area's value will be preserved by the browser.
    idoc.location.reload();
    break;
  }
 });
 
 idoc.querySelector("#what").textContent = "This is a simple scratchpad.";
 idoc.querySelector("#start").textContent = "This message will disappear when you click in the text area.";
 idoc.querySelector("#footer").remove();
 
 if (UI_LOCATION == "sidebar" || UI_LOCATION == "subpanel") {
  idoc.querySelector("#info").style.transform = "scale(0.75)";
  idoc.querySelector("#info > div > div").style.padding = "0 0";
 }
 
 if (await Utils.getOption("showInfo") === false)
  iwin.hideInfo(true);
 
 let tabId = null, windowId = null;
 if (browser.tabs) {
  let tab = await browser.tabs.getCurrent();
  if (tab)
   tabId = tab.id;
 }
 if (browser.windows)
  windowId = (await browser.windows.getCurrent()).id;
 
 await connection.postMessage({
  type: "register",
  ids: {tab: tabId, window: windowId},
  uiLocation: UI_LOCATION,
  isPrivate: browser.extension.inIncognitoContext,
 });
 
 connection.onMessage.addListener((message, sender, x) => {
  switch (message.type) {
   case "get-value":
    connection.postMessage({
     type: "value",
     value: textarea.value
    });
    break;
   case "set-value":
    textarea.value = message.value;
    break;
  }
 });
 
 idoc.dispatchEvent(TextareaLoadedEvent);
}


function addCustomCSSElement(doc, uiLocation) {
 const optionKey = uiLocation + "CSS";
 
 let el = doc.createElement("style");
 
 if (uiLocation)
  el.id = uiLocation;
 
 Utils.getOption(optionKey, "").then(value => {
  if (value !== undefined)
   el.textContent = value;
 });
 
 doc.querySelector("head").append(el);
 return el;
}


document.querySelector("iframe").addEventListener("load", e => main(e));
