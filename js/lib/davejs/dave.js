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

  this.plot = function plot(){
    //give this instance of the plot its own module reference and data store
    this.data;
    this.modules = {}
    console.log(this.modules);
  };

  plot.prototype.loadData = function loadData(){
    
  };

  plot.prototype.draw = function draw(){
    var 
      modules = this.modules,
      module,
      moduleName;

    require(config.modules, function(){
      for(var i = 0; i < arguments.length; i++){
        module = arguments[i];
        if(module && module.getName){ 
          moduleName = module.getName();
          modules[moduleName] = module;
          console.log("Loaded Dave.js module: " + moduleName);
        }
      }
    });
  };

  return {
    'configure': configure,
    'plot': plot
  }
});

