var Dave_js = {
   //autoload the style sheet.
   init : function(){ 
      var bodyEl = document.getElementsByTagName("body")[0];
      var style = document.createElement("link");
      style.rel = "stylesheet";
      style.type = "text/css";
      style.href = "dave-js.css";
      bodyEl.appendChild(style);
   }(),
   
   //location for all Dave_js components
   libRoot : "",
   
   //flag that tells functions if they need to wait for modules to load
   loaded : false,
   
   setLibRoot : function(path){
      Dave_js.libRoot = path;
   }
};