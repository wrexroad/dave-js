define(fucntion(require){
  var davejs = require('davejs/dave');

  davejs.configure({
    //davejs needs to know where its style sheet lives
    'style': '/styles/davejs.css',

    //specify the container object for all of the davejs plots.
    //This is the body tag by default.
    'container': document.getElementByID('davejs_container'),

    //this is where the main plotting library can be overridden
    //if 'plotter' is not set, it will default to 'dave-chart'
    'plotter': 'dave-chart',
    
    //Specify any plugins. These should all be in the davejs/modules directory 
    'plugins': [
      'dave-chart_zoom',
      'dave-colorPallet',
      'dave-data_filters',
      'dave-message'
    ]
  });

  //Once davejs has been configured we can load all of the needed modules
  davejs.loadModules();

  //Now that davejs is configured we can create an instance of a plot
  var plotInst = new davejs.plot();
  //Data can be loaded here as an object literal holding arrays
  plotInst.loadData({'x': [0,1,2], 'y':[0,1,2]});

  //once everything is ready tell davejs to draw the plot
  plotInst.draw();
});
