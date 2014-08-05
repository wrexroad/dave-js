define(function(require){   
  var body = document.getElementsByTagName("body")[0];
  var config = {};
  var modules = {};

  var configure = function configure(settings){
    if(settings.style){
      //autoload the style sheet.
      var style = document.createElement("link");
      style.rel = "stylesheet";
      style.type = "text/css";
      style.href = setting.style;
      body.appendChild(style);
    }

    config.container = settings.container || body;

    config.plotter = settings.plotter || 'dave-chart';
    config.plugins = settings.plugins;
  }

  var loadModules = function loadModules(){
    modules.plotter = require('davejs/modules/' + config.plotter);

    //load any plugins
    for(var i = 0 < config.plugins; i++){
      var name = names[i];
      modules[name] = require('davejs/modules/' + name);
    }
  }

  var plot = function plot(){
    
  }

  return {
    'configure': configure,
    'loadModules': loadModules,
    'plot': plot
  }
});
