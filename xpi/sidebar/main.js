import * as Utils from "/utils.js";


const SidebarLoadedEvent = new Event("sidebarLoaded");


let connection = browser.runtime.connect({name: `textarea:${Date.now()}`});


let iframe = document.querySelector("iframe");
iframe.addEventListener("load", () => {
 let idoc = iframe.contentDocument;
 let iwin = iframe.contentWindow;
 
 idoc.documentElement.id = "sidebar";
 
 let style = Utils.addCustomCSSElement(idoc, connection, "sidebar");
 
 idoc.querySelector("#info").style.transform = "scale(0.75)";
 idoc.querySelector("#info > div > div").style.padding = "0 0";
 idoc.querySelector("#what").textContent = "This is a simple scratchpad.";
 idoc.querySelector("#start").textContent = "This message will disappear when you click in the text area.";
 idoc.querySelector("#footer").remove();
 
 Utils.getOption("showInfo").then(showInfo => {
  if (showInfo === false)
   iwin.hideInfo(true);
  
  idoc.dispatchEvent(SidebarLoadedEvent);
 });
});
