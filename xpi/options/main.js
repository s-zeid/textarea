import * as Utils from "/utils.js";


function id(s) {
 return document.getElementById(s);
}


function load() {
 return Utils.getOptions().then(
  (options) => {
   for (var el of document.querySelectorAll("form [id]")) {
    if (options[el.id] !== undefined)
     set(el, options[el.id]);
    else if (defaults[el.id] !== undefined)
     set(el, defaults[el.id]);
    else
     set(el, "");
   }
  },
  (error) => { 
   console.log(`Error: ${error}`);
   for (var el of document.querySelectorAll("form [id]")) {
    el.disabled = true;
    el.title = "There was an error while loading the options.";
   }
  }
 );
}


function save() {
 let options = {};
 
 for (var el of document.querySelectorAll("form [id]"))
  options[el.id] = get(el);
 
 return browser.storage.sync.set({options: options}).then(() => {
  browser.runtime.sendMessage({"type": "options-saved"});
 });
}


function get(el) {
 switch (el.nodeName) {
  case "TEXTAREA":
   return el.value;
  case "INPUT":
   switch (el.type) {
    case "checkbox":
    case "radio":
     return el.checked;
    default:
     return el.value;
   }
   break;
 }
}


function set(el, value) {
 if (value === null)
  value = defaults[key];
 
 switch (el.nodeName) {
  case "TEXTAREA":
   el.value = value;
   break;
  case "INPUT":
   switch (el.type) {
    case "checkbox":
    case "radio":
     el.checked = value;
     break;
    default:
     el.value = value;
     break;
   }
   break;
 }
}


function autoResizeTextarea(el, max) {
 function listener() {
  el.style.height = "auto";
  
  let height = Math.min(el.scrollHeight + window.devicePixelRatio, max || Infinity);
  el.style.height = `${height}px`;
  el.style.overflowY = (height == max) ? "auto" : "hidden";
 }
 
 el.addEventListener("input", listener);
 listener();
}


let defaults = {};

window.addEventListener("DOMContentLoaded", () => {
 defaults = JSON.parse(id("defaults").textContent);
 
 load().then(() => {
  document.querySelector("form").addEventListener("submit", e => {
   e.preventDefault();
   save();
  });
  
  document.querySelector("button[type='submit']").disabled = false;
  
  for (let el of document.querySelectorAll("textarea")) {
   el.style.setProperty("--computed-line-height", window.getComputedStyle(el).lineHeight);
   autoResizeTextarea(el, 300);
   
   el.addEventListener("keyup", e => {
    if (e.ctrlKey && e.code.match(/^(Numpad)?Enter$/))
     save();
   });
  }
 });
});
