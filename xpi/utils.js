export async function getOptions() {
 let result = await browser.storage.sync.get("options");
 return result.options;
}


export async function getOption(key, defaultValue) {
 let result = await browser.storage.sync.get("options");
 let options = result.options;
 if (options[key] === undefined)
  return defaultValue;
 return options[key];
}


export function setTextFromOption(el, key, defaultValue) {
 getOption(key, defaultValue).then(value => {
  if (value !== undefined)
   el.textContent = value;
 });
}


export function addCustomCSSElement(doc, connection, id) {
 let el = doc.createElement("style");
 if (id)
  el.id = id;
 
 doc.querySelector("head").append(el);
 
 function listener(message, sender) {
  switch (message.type) {
   case "options-saved":
    setTextFromOption(el, id + "CSS");
    break;
  }
 }
 connection.onMessage.addListener(listener);
 setTextFromOption(el, id + "CSS");
 
 return el;
}