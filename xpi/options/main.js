function id(s) {
 return document.getElementById(s);
}


function load() {
 return browser.storage.sync.get("options").then(
  (result) => {
   let options = result.options;
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


let defaults = {};

window.addEventListener("DOMContentLoaded", () => {
 defaults = JSON.parse(id("defaults").textContent);
 
 load().then(() => {
  document.querySelector("form").addEventListener("submit", e => {
   e.preventDefault();
   save();
  });
  
  document.querySelector("button[type='submit']").disabled = false;
 });
});
