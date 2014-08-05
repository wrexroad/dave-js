define(function(require){
  var davejs = require('davejs/dave');

  davejs.configure({
    //davejs needs to know where its style sheet lives
    'style': 'styles/dave-js.css',

    //specify the container object for all of the davejs plots.
    //This is the body tag by default.
    'container': document.getElementById('davejs_container'),

    //this is where the main plotting library can be overridden
    //if 'plotter' is not set, it will default to 'dave-chart'
    'plotter': 'davejsModules/dave-chart',
    
    //Specify any plugins. These should all be in the davejs/modules directory 
    'plugins': [
      'davejsModules/dave-chart_zoom',
      'davejsModules/dave-colorPallet',
      'davejsModules/dave-data_filters',
      'davejsModules/dave-message'
    ]
  });

  //Now that davejs is configured we can create an instance of a plot
  var plotInst = new davejs.plot();

  //Data can be loaded here as an object literal holding arrays
  plotInst.loadData({'x': [0,1,2], 'y':[0,1,2]});

  //once everything is ready tell davejs to draw the plot
  plotInst.draw();
});
