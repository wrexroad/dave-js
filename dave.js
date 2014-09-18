var Dave_js = {};

(function () {
  //autoload the style sheet.
  var bodyEl = document.getElementsByTagName("body")[0];
  var style = document.createElement("link");
  style.rel = "stylesheet";
  style.type = "text/css";
  style.href = "../css/dave-js.css";
  bodyEl.appendChild(style);
})();