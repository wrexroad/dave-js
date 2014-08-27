(function loadDemo() {

  //check if the main plotter has be built into DaveJS
  if (typeof Dave_js !== 'object' || !Dave_js.chart) {
    window.alert("DaveJS plotter has not been built correctly.");
    return;
  }

  //demo the message module that has been built
  (function messageDemo() {
    if (!Dave_js.message) {
      return;
    }
    var width = 200;
    var height = 200;

    var x = (window.innerWidth - width ) / 2;
    var y = (window.innerHeight - height ) / 2;

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

  //create a place to store data
  if(Dave_js.DataStore){
    var dataStore = new Dave_js.DataStore();
  }

  //demo how to load a plot that has the data written directly in the js code
  function hardcodedData() {
    var plot = new Dave_js.chart("plot1");

    //add datasets
    dataStore.addDataSet(
      'first', {'xVals': [0,10,20,30], 'yVals': [0,10,50,45]}
    );
    dataStore.addDataSet(
      'second', {'xVals': [0,10,20,30], 'yVals': [0,10,20,30]}
    );

    //add the data to the plot
    plot.setData(dataStore.getDataSet('first')); //using the data store
    plot.setData(dataStore.getDataSet('second'));
    plot.setData([0,10,20,30], [0,-10,-20,-30], 'third'); //adding data manually
    
    plot.setChartSize(300, 300);
    plot.setLineWidth(1);
    plot.setPointSize(6);
    //name of the div that will hold the new canvas
    plot.setCanvasHolder("canvasHolder");

    //arguments for lables are the plot title, x-axis, and y-axis
    plot.setLabels('hardcoded data', 'x', 'y');

    plot.setColor('data', ['green', 'red', 'black']);

    plot.setGrid();

    plot.setLegend();

    //plot.setType("hist");
    //plot.setType("polar-points-line");
    plot.setType("xy-points-line");

    plot.buildPlot();
  }

  //demo creating a plot from a remote file
  function remoteData() {
    var
      plot = new Dave_js.chart("plot2"),
      ajax = new Dave_js.AjaxDataConnector();
    
    ajax.config({
      'url': 'test.data',
      'dataFormat': 'table',
      'tableOpts': {
        'delim': ',',
        'header': 'true',
        'commentChar': '#'
      }
    });

    //get the plot configured
    plot.setChartSize(300,300);
    plot.setCanvasHolder("canvasHolder");
    plot.setLabels("remote data","Time","Data");
    plot.setColor("data","green");
    plot.setGrid();
    plot.setLegend();
    plot.setType("xy-points");
    plot.setPointSize(2);

    ajax.fetchData(function dataCallback() {
      plot.setData(ajax.getDataField('LC1'), ajax.getDataField('LC1'), "LC1");
      plot.buildPlot();
    });
  }

  //draw the plots asynchronously
  setTimeout(hardcodedData, 100);
  setTimeout(remoteData, 100);
})();