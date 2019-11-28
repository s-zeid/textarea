   var textarea = document.getElementById("textarea");
   function getBookmarkletURL() {
    var url = "data:text/html,<!DOCTYPE html>\n<html>\n ";
    url += document.getElementsByTagName("head")[0].outerHTML+"\n <body>";
    url += document.body.innerHTML.replace(/[\n ]+$/gm, "");
    url += "\n </body>\n</html>";
    url = url.replace(/\xC2\xA9|\u00A9/gi, "&copy;");
    url = url.replace(/#/g, "\x2523");
    url = url.replace(/&/g, "\x2526");
    return url.replace(/\x0D\x0A|\x0D|\x0A/g, "\x250A");
   }
   function hideInfo(force) {
    if (force !== true && !textarea.value) return;
    document.getElementById("info").style.display = "none";
    textarea.focus();
    textarea.onkeyup = undefined;
    textarea.oninput = undefined;
    document.body.onclick = undefined;
   }
   window.onload = function() {
    var bookmarklet = document.getElementById("bookmarklet");
    if (bookmarklet)
     bookmarklet.setAttribute("href", getBookmarkletURL());
    textarea.onkeyup = hideInfo;
    textarea.oninput = hideInfo;
    document.body.onclick = function() { hideInfo(!0); };
    textarea.focus();
    hideInfo();
   };
   textarea.focus();
