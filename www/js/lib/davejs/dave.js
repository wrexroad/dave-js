var Dave_js = {};

Dave_js.init = (function init() {
  //autoload the style sheet.
  var bodyEl = document.getElementsByTagName("body")[0];
  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.type = "text/css";
  style.href = "../css/dave-js.css";
  bodyEl.appendChild(style);
});

Dave_js.init();