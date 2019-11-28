import * as Utils from "/utils.js";


const TST_ID = "treestyletab@piro.sakura.ne.jp";


let connections = new Set();

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
    url: `moz-extension://${location.host}/subpanel/main.html`
   }
  });
  subpanelRegistered = true;
 } catch (_) {}
}


let unregisterSubPanel = () => {};


function init() {
 browser.browserAction.onClicked.addListener(tab => {
  browser.sidebarAction.open();
 });
 
 browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
   case "options-saved":
    Utils.getOptions().then(options => {
     for (const connection of connections) {
      connection.postMessage(message);
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
 
 browser.runtime.onConnect.addListener(port => {
  connections.add(port);
  port.onDisconnect.addListener(() => connections.delete(port));
 });
 
 Utils.getOptions().then(options => {
  if (options.enableSubpanel !== false)
   registerSubPanel();
 });
}


init();
