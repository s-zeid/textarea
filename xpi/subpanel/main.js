import * as Utils from "/utils.js";


let connection = browser.runtime.connect({name: `textarea:${Date.now()}`});


let iframe = document.querySelector("iframe").contentDocument.querySelector("iframe");
iframe.addEventListener("load", () => {
 let idoc = iframe.contentDocument;
 let iwin = iframe.contentWindow;
 
 idoc.addEventListener("sidebarLoaded", () => {
  idoc.documentElement.id = "subpanel";
  
  let style = Utils.addCustomCSSElement(idoc, connection, "subpanel");
 });
});
