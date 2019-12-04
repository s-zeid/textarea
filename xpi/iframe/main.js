import * as Utils from "/utils.js";


const UI_LOCATION = new URLSearchParams(location.search).get("ui-location") || "iframe";

const TextareaLoadedEvent = new Event("textareaLoaded");


let connection = browser.runtime.connect({name: `textarea.${UI_LOCATION}:${Date.now()}`});


function main(e) {
 let iframe = e.target;
 let idoc = iframe.contentDocument;
 let iwin = iframe.contentWindow;
 
 idoc.documentElement.id = UI_LOCATION;
 
 let globalStyle = addCustomCSSElement(idoc, connection, "iframe");
 let uiLocationStyle = null;
 if (UI_LOCATION != "iframe")
  uiLocationStyle = addCustomCSSElement(idoc, connection, UI_LOCATION);
 
 idoc.querySelector("#info").style.transform = "scale(0.75)";
 idoc.querySelector("#info > div > div").style.padding = "0 0";
 idoc.querySelector("#what").textContent = "This is a simple scratchpad.";
 idoc.querySelector("#start").textContent = "This message will disappear when you click in the text area.";
 idoc.querySelector("#footer").remove();
 
 Utils.getOption("showInfo").then(showInfo => {
  if (showInfo === false)
   iwin.hideInfo(true);
  
  idoc.dispatchEvent(TextareaLoadedEvent);
 });
}


function setTextFromOption(el, key, defaultValue) {
 return Utils.getOption(key, defaultValue).then(value => {
  if (value !== undefined)
   el.textContent = value;
 });
}


function addCustomCSSElement(doc, connection, uiLocation) {
 const optionKey = uiLocation + "CSS";
 
 let el = doc.createElement("style");
 if (uiLocation)
  el.id = uiLocation;
 
 doc.querySelector("head").append(el);
 
 function listener(message, sender) {
  switch (message.type) {
   case "options-saved":
    setTextFromOption(el, optionKey);
    break;
  }
 }
 connection.onMessage.addListener(listener);
 setTextFromOption(el, optionKey);
 
 return el;
}


document.querySelector("iframe").addEventListener("load", main);
