import * as Utils from "/utils.js";


const TST_ID = "treestyletab@piro.sakura.ne.jp";


let instances = new Map();
let serialized = null;

let subpanelRegistered = false;


async function registerSubPanel() { 
 try {
  await browser.runtime.sendMessage(TST_ID, {
   type: "register-self",
   name: browser.runtime.getManifest().name,
   icons: browser.runtime.getManifest().icons,
   listeningTypes: ["wait-for-shutdown"],
   subPanel: {
    title: browser.runtime.getManifest().name,
    url: getIframeURL("subpanel")
   }
  });
  subpanelRegistered = true;
 } catch (_) {}
}


let unregisterSubPanel = () => {};


async function getAllValues() {
 let result = new Map();
 for (let instance of instances.values()) {
  let value = await new Promise(resolve => {
   instance.connection.postMessage({type: "get-value"});
   let callback = value => {
    instance.onValue.delete(callback);
    resolve(value);
   };
   instance.onValue.add(callback);
  });
  result.set(instance, value);
 }
 return result;
}


async function serialize() {
 let values = await getAllValues();
 let serialized = [];
 for (const [instance, value] of values) {
  serialized.push({
   ids: instance.ids,
   uiLocation: instance.uiLocation,
   isPrivate: instance.isPrivate,
   value: value
  });
 }
 return serialized;
}


function getIframeURL(uiLocation) {
 const urlBase = `moz-extension://${location.host}/iframe/main.html`;
 if (uiLocation)
  return `${urlBase}?ui-location=${uiLocation}`;
 else
  return urlBase;
}


function openIn(uiLocation) {
 switch (uiLocation) {
  case "window":
   return browser.windows.create({
    url: getIframeURL("window"),
    type: "popup",
    width: 420,
    height: 480,
   });
  case "sidebar":
   return browser.sidebarAction.open();
  case "tab":
   return browser.tabs.create({
    url: getIframeURL("tab")
   });
 }
}


function setupConnections() {
 browser.runtime.onConnect.addListener(connection => {
  instances.set(connection, {
   connection: connection,
   ids: {frame: connection.sender.frameId, tab: null, window: null},
   uiLocation: null,
   isPrivate: null,
   onValue: new Set()
  });
  connection.onDisconnect.addListener(() => instances.delete(connection));
  connection.onMessage.addListener((message, sender) => {
   let instance = instances.get(connection);
   
   switch (message.type) {
    case "register":
     message.ids.frame = instance.ids.frame;
     Object.assign(instance, message);
     delete instance.type;
     for (let i of serialized) {
      if (instance.uiLocation == i.uiLocation) {
       if (i.uiLocation == "subpanel" && i.ids.frame == instance.ids.frame)
	instance.connection.postMessage({type: "set-value", value: i.value});
       if (i.uiLocation == "sidebar" && i.ids.window == instance.ids.window)
	instance.connection.postMessage({type: "set-value", value: i.value});
      }
     }
     break;
    case "value":
     for (let f of instance.onValue)
      f(message.value);
     break;
   }
  });
 });
}


async function setupSerialization() {
 browser.runtime.onUpdateAvailable.addListener(details => {
  serialize().then(serialized => {
   browser.storage.local.set("serialized", serialized).then(() => {
    browser.runtime.reload();
   });
  });
 });
 
 let result = await browser.storage.local.get("serialized");
 browser.storage.local.remove("serialized");
 serialized = new Set(result.serialized || []);
 window.serialized = serialized;
}


async function init() {
 console.log(1);
 await setupSerialization();
 setupConnections();
 
 browser.commands.onCommand.addListener(command => {
  if (command.match(/^open-/)) {
   let uiLocation = command.replace(/^open-/, "");
   openIn(uiLocation);
  }
 });
 
 browser.browserAction.onClicked.addListener(tab => {
  openIn("window");
 });
 
 browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
   case "options-saved":
    Utils.getOptions().then(options => {
     for (const instance of instances.values()) {
      instance.connection.postMessage(message);
     }
     if (options.enableSubpanel === false) {
      if (subpanelRegistered)
       unregisterSubPanel();
     } else if (!subpanelRegistered) {
      registerSubPanel();
     }
    });
    break;
  }
 });
 
 browser.runtime.onMessageExternal.addListener((message, sender) => {
  if (sender.id === TST_ID) {
   switch (message.type) {
    case "ready":
     registerSubPanel();
     break;
    case "wait-for-shutdown":
     return new Promise((resolve, reject) => {
      unregisterSubPanel = () => {
       resolve(true);
       subpanelRegistered = false;
       unregisterSubPanel = () => {};
      };
      window.addEventListener("beforeunload", () => unregisterSubPanel());
     });
   }
  }
 });
 
 let options = await Utils.getOptions();
 if (options.enableSubpanel !== false)
  registerSubPanel();
}


// for debugging
window.getAllValues = getAllValues;
window.instances = instances;
window.instanceArray = () => Array.from(window.instances.values());
window.openIn = openIn;
window.serialize = serialize;


init();
