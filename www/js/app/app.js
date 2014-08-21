(function loadDemo() {

  //check if the main plotter has be built into DaveJS
  if (typeof Dave_js !== 'object' || !Dave_js.chart) {
    window.alert("DaveJS plotter has not been built correctly.");
    return;
  }

  //demo how to load a plot that has the data written directly in the js code
  (function hardcodedData() {
    
    
    var plot = new Dave_js.chart("plot");
    var xVals, yVals;

    //add dataset called "first"
    xVals = [50,60,190,-135];
    yVals = [0,10,50,45];
    plot.setData(xVals, yVals, "first");
    
    //add dataset called "second"
    xVals = [0,10,90,25];
    yVals = [10,20,30,40];
    plot.setData(xVals, yVals, "second");
    
    plot.setChartSize(300,300);
    plot.setLineWidth(1);
    plot.setPointSize(6);
    //name of the div that will hold the new canvas
    plot.setCanvasHolder("canvasHolder");

    //arguments for lables are the plot title, x-axis, and y-axis
    plot.setLabels("hardcoded data","x","y");

    plot.setColor("data",["green","black"]);

    plot.setGrid();

    plot.setLegend();

    //plot.setType("hist");
    //plot.setType("polar-points-line");
    plot.setType("xy-points-line");

    plot.buildPlot();
  }());

  //demo creating a plot from a remote file
  (function remoteData() {
    
    var
      plot = new Dave_js.chart("plot"),
      data = new Dave_js.DataCollector();

    //get the plot configured
    plot.setChartSize(300,300);
    plot.setCanvasHolder("canvasHolder");
    plot.setLabels("remote data","Time","Data");
    plot.setColor("data","green");
    plot.setGrid();
    plot.setLegend();
    plot.setType("xy-points");
    plot.setPointSize(1);

    //start the data request
    data.config({
      'url': 'test.data',
      'dataFormat': 'table',
      'tableOpts': {
        'delim': ',',
        'header': 'true',
        'commentChar': '#'
      }
    });

    data.fetchData(function dataCallback() {
      plot.setData(data.getDataField('LC1'), data.getDataField('LC1'), "LC1");
      plot.buildPlot();
    });
  }());
  

  //demo the message module that has been built
  (function messageDemo() {
    if (!Dave_js.message) {
      return;
    }
    var width = 200;
    var height = 200;

    var x = (window.innerWidth - width ) / 2;
    var y = (window.innerHeight  - height ) / 2;

    var message = new Dave_js.message();
    message.setSize(width, height);
    message.showMessage("test", x, y);
  }());
  
  //demo the color pallet that has been built
  (function colorDemo() {
    if (!Dave_js.colorPallet) {
      return;
    }

    var pallet = new Dave_js.colorPallet("rainbow", 10);
    pallet.buildPallet();
    pallet.displayColors(document.getElementById("pallet"), 10, 10);
  })();
})();