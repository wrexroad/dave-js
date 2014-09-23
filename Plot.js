Dave_js.Plot = function Plot(type) {
  //figure out what plotter we will be using
  if (typeof Dave_js[type] !== 'function') {
    console.log('Unknown plot type: "' + type + '"');
    return null;
  }

  this.plotter = new Dave_js[type](this);
  
  //get a new set of properties
  this.chart = new Dave_js.ChartProperties();

  //create the canvas element
  this.canvas = document.createElement("canvas");
  this.canvas.id = this.chart.id;
  
  //initialize canvas context
  this.ctx = this.canvas.getContext("2d");
  
  //move coord origin to the upper left corner of plot area
  this.ctx.translate(
    this.chart.origin.x, this.chart.origin.y
  );

  this.canvasBox = document.getElementsByTagName("body")[0];
  this.canvasBox.appendChild(this.canvas);
};

Dave_js.Plot.prototype.renderInto = function(canvasDivID) {
  this.canvasBox = document.getElementById(canvasDivID);
};

Dave_js.Plot.prototype.setOrigin = function(x, y) {
  this.chart.origin.x = isNaN(x) ? (+this.chart.origin.x || 0) : x;
  this.chart.origin.y = isNaN(y) ? (+this.chart.origin.y || 0) : y;
};

Dave_js.Plot.prototype.setCanvasSize = function(height, width, margin) {
  height = +height || 0;
  width = +width || 0;
  margin = +margin || 0;

  this.chart.sizes.canvas.height = height;
  this.chart.sizes.canvas.width = width;
  this.chart.sizes.canvas.margin = margin;

  this.setChartSize((height - margin), (width - margin));
};

Dave_js.Plot.prototype.setChartSize = function(height, width) {
  height = +height || 0;
  width = +width || 0;

  this.chart.sizes.height = height;
  this.chart.sizes.width = width;
  
  this.chart.sizes.radius = Math.max(width, height) / 2;
};

Dave_js.Plot.prototype.setColor = function(type, color) {
  this.chart.colors[type] = color;
};

Dave_js.Plot.prototype.setSubPlot = function(bool) {
  this.chart.flags.subPlot = bool;
};

Dave_js.Plot.prototype.setCoordDisp = function(bool) {
  this.chart.flags.showCoords = bool;
};

//first argument is an array containing the name of each tracker. 
//each aditional argument is an array containing tracker data
Dave_js.Plot.prototype.setTrackers = function() {
  this.vars.trackLabels = arguments[0].slice(0);
  for (var array_i = 1 ; array_i < arguments.length; array_i) {
    this.vars.trackers[array_i] = arguments[array_i].slice(0);
  }
};

Dave_js.Plot.prototype.setLineWidth = function(width) {
  this.chart.sizes.lineWidth = +width || 1;
};

Dave_js.Plot.prototype.setPointSize = function(width) {
  var
    size = +width || 2,
    halfSize = size >> 1;

  //stop from auto calculating point size
  this.chart.flags.fixedPtSize = true;

  //make sure the supplied point size is not too small
  this.chart.sizes.pointSize = Math.max(2, size);
  this.chart.sizes.halfPointSize = halfSize;
};

Dave_js.Plot.prototype.setHistBars = function(ratio) {
  this.chart.histBarRatio = +ratio || 1;
};

Dave_js.Plot.prototype.setBorderColor = function(color) {
  this.chart.colors.borderColor = color;
};

Dave_js.Plot.prototype.setBackgroundColor = function(color) {
  this.chart.colors.bgColor = color;
};

Dave_js.Plot.prototype.setBackgroundImage = function(id) {
  var el = document.getElementById(id);
  if(!id || id.tagName != 'IMG'){
    console.log(
      'Could not set background image, ' + el + ' is not an "IMG" tag.'
    );
  } else {
    this.chart.bgImg = el;
  }
};

Dave_js.Plot.prototype.setGrid = function() {
  this.chart.flags.grid = true;
};

Dave_js.Plot.prototype.setLegend = function() {
  this.chart.flags.legend = true;
};

Dave_js.Plot.prototype.setZoomable = function() {
  this.chart.flags.zoomable = true;
};

Dave_js.Plot.prototype.getDataStore = function() {
  return this.dataStore;
};

Dave_js.Plot.prototype.setDataStore = function setDataStore(ds) {
  this.dataStore = ds;
};

Dave_js.Plot.prototype.getPlotElements = function() {
  return this.elms;
};

Dave_js.Plot.prototype.getChartProps = function() {
  return this.chart;
};

Dave_js.Plot.prototype.buildPlot = function(start, stop) {
  //var
  //  indepVarLength = (dataStore.getVarData(vars.indep) || []).length;

  //set the start and stop indecies for all the loops
  this.setDataRange(+start || 0, +stop || this.dataStore.getVarData(this.vars.y[0]).length);

  //figure out the point size
  if (!this.chart.flags.fixedPtSize) {
    //take a best guess at point size
    this.setPointSize(
      parseInt((this.chart.sizes.width / this.chart.range.numOfPts / 2), 10)
    );

    //make sure the point is between 2 and 8
    this.setPointSize(
      Math.max(1, Math.min(8, this.chart.sizes.pointSize))
    );
  }
  
  this.chart.flags.replot = true;
  
/*  
  //figure out axis and radii lengths
  // or limit dependent data sets
  this.doLimits();


  //determine what type of plot we are generating
  if (this.chart.flags.xy) {
    configSpacing();
    drawLinesPoints();
  }
  
  if (this.chart.flags.polar) {
    configSpacing();
    configPolar();

    if (!this.chart.flags.subPlot && this.chart.flags.setGrid) {
      drawPolarGrid();
    }

    drawPolarPlot();
  }
  
  if (this.chart.flags.hist) {
    configHistBars();
    configSpacing();
    callYTics();
    callXTics();

    drawHistBars();
  }
  */
};