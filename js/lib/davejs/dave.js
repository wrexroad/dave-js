define(function (require){
   //autoload the style sheet.
   var bodyEl = document.getElementsByTagName("body")[0];
   var style = document.createElement("link");
   style.rel = "stylesheet";
   style.type = "text/css";
   style.href = "styles/dave-js.css";
   bodyEl.appendChild(style);
});
