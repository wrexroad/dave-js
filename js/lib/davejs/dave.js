define(function(require){   
  var body = document.getElementsByTagName("body")[0];
  var config = {};

  var configure = function configure(settings){
    if(settings.style){
      //autoload the style sheet.
      var style = document.createElement("link");
      style.rel = "stylesheet";
      style.type = "text/css";
      style.href = settings.style;
      body.appendChild(style);
    }

    config.container = settings.container || body;

    config.plotter = settings.plotter || 'dave-chart';
    config.modules = [].concat(config.plotter, settings.plugins);
  }

  var plot = (function plot(){
    //load all of the modules 
    var moduleIndex = {};
    require(config.modules, function(){
      for(var i = 0; i < arguments.length; i++){
        if(arguments[i]){ 
          moduleIndex[arguments[i].getName()] = arguments[i];
          console.log("Loaded Dave.js module: " + arguments[i].getName());
        }
      }
    });
    
    var loadData = (function loadData(){

    });

    var draw = (function draw(){

    });

    return {
      'loadData': loadData,
      'draw': draw
    }
  });

  return {
    'configure': configure,
    'plot': plot
  }
});
