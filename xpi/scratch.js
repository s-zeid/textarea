 let windowPromise = null;
 if (browser.windows)
  windowPromise = browser.windows.getCurrent();
 else
  windowPromise = new Promise(resolve => resolve(null));
 
 windowPromise.then(window => {
  return connection.postMessage({
   type: "register",
   uiLocation: UI_LOCATION,
   windowID: (window) ? window.id : null
  });
 }).then(() => {


 watchGeometry(iwin, iroot, 250);


:root {
 background: url("http://127.0.0.1:9255/") calc(var(--screen-x) * -1) calc(var(--screen-y) * -1) / var(--screen-width) var(--screen-height);
}


function watchGeometry(win, el, interval) {
 if (!interval || Number.isNaN(interval) || !Number.isFinite(interval))
  throw new RangeError("invalid interval");
 
 let geometry = {x: null, y: null, w: null, h: null};
 win.setInterval(() => {
  let x = win.mozInnerScreenX || 0;
  let y = win.mozInnerScreenY || 0;
  let w = win.screen.width;
  let h = win.screen.height;
  if (x !== geometry.x || y !== geometry.y || w !== geometry.w || h != geometry.h) {
   el.style.setProperty("--screen-x", x + "px");
   el.style.setProperty("--screen-y", y + "px");
   el.style.setProperty("--screen-width", win.screen.width + "px");
   el.style.setProperty("--screen-height", win.screen.height + "px");
   Object.assign(geometry, {x: x, y: y, w: w, h: h});
  }
 }, interval);
}
