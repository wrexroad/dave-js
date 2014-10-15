Dave_js.Plot = function Plot(type) {
  //figure out what plotter we will be using
  if (typeof Dave_js[type] !== 'function') {
    console.log('Unknown plot type: "' + type + '"');
    return null;
  }
  
  this.type = type;

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
};

//this is an obect which defines the bounds on the data
//each plot type will define this object differently so it will be overridden
Dave_js.Plot.prototype.range = null;

Dave_js.Plot.prototype.renderInto = function renderInto(canvasDivID) {
  var el = document.getElementById(canvasDivID);
  
  if (this.canvasBox !== null) {
    this.canvasBox = el;
  } else {
    console.log(
      'Could not attach canvas to ' + canvasDivID + '. Element does not exist.'
    );
    console.log(
      'Attaching to body tag instead.'
    );
  }

  this.canvasBox.appendChild(this.canvas);
};

Dave_js.Plot.prototype.configure = function configure(labels) {
  var plotRegion = this.chart.plotRegion;

  labels = labels || {};

  //print axis labels
  plotRegion = this.decorate(this, labels);
  this.chart.width = this.canvas.width - plotRegion.left - plotRegion.right;
  this.chart.height = this.canvas.height - plotRegion.top - plotRegion.bottom;

  //draw background and border
  this.ctx.save();
  if (this.chart.bgImg) {
    //resize the image to fit the plotting area
    this.chart.bgImg.width = this.canvas.width;
    this.chart.bgImg.height = this.canvas.height;

    this.ctx.drawImage( this.chart.bgImg, plotRegion.left, plotRegion.top );
  } else {
    this.ctx.fillStyle = this.chart.colors.bgColor;
    this.ctx.fillRect(
      plotRegion.left, plotRegion.top, this.canvas.width, this.canvas.height
    );
  }
  this.ctx.strokeStyle = this.chart.colors.borderColor;
  this.ctx.strokeRect(0, 0, this.chart.width, this.chart.height);
  this.ctx.restore();

  //set up the axes tic marks
  this.chart.axisVars = labels.axisVars || {};
  if (this.chart.flags.autoRange) {
    this.plotter.autoRange.call(this);
  }
  //add the grid based on the 
  if (!this.chart.flags.hasRange) {
    this.plotter.drawGrid.call(this);
  }
};

Dave_js.Plot.prototype.decorate = function decorate(labels) {
  var top = 0, bottom = 0, labelWidth;

  //print title (bold)
  if (typeof labels.plotTitle == "string") {
    top = parseInt(ctx.font, 10) * 1.5 || 30;
    this.ctx.save();
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = this.chart.colors.text;
    this.ctx.font = "bold " + this.chart.cssFont;
    this.ctx.fillText(
      labels.plotTitle,
      (this.chart.width / 2), -5
    );
    this.ctx.restore();
  }
  
  if (labels.axisLabels) {
    labelWidth = this.plotter.labelAxes.call(labels.axisLabels);
  }

  return {
    top: top || 0,
    bottom: bottom || 0,
    left: labelWidth.left || 0,
    right: labelWidth.right || 0
  };
};

Dave_js.Plot.prototype.setOrigin = function setOrigin(x, y) {
  this.chart.origin.x = Dave_js.forceNumber(x) || this.chart.origin.x;
  this.chart.origin.y = Dave_js.forceNumber(y) || this.chart.origin.y;
};

Dave_js.Plot.prototype.setCanvasSize = function setCanvasSize(sizes) {
  var size;

  if(!sizes){
    return;
  }

  if((size = Dave_js.Utils.forceNumber(sizes.height))){
    this.canvas.height = size;
  }
  if((size = Dave_js.Utils.forceNumber(sizes.width))){
    this.canvas.width = size;
  }
};

Dave_js.Plot.prototype.setColor = function setColor(type, color) {
  this.chart.colors[type] = color;
};

Dave_js.Plot.prototype.setSubPlot = function setSubPlot(bool) {
  this.chart.flags.subPlot = bool;
};

Dave_js.Plot.prototype.setCoordDisp = function setCoordDisp(bool) {
  this.chart.flags.showCoords = bool;
};

//first argument is an array containing the name of each tracker. 
//each aditional argument is an array containing tracker data
Dave_js.Plot.prototype.setTrackers = function setTrackers() {
  this.vars.trackLabels = arguments[0].slice(0);
  for (var array_i = 1 ; array_i < arguments.length; array_i) {
    this.vars.trackers[array_i] = arguments[array_i].slice(0);
  }
};

Dave_js.Plot.prototype.setHistBars = function setHistBars(ratio) {
  this.chart.histBarRatio = +ratio || 1;
};

Dave_js.Plot.prototype.setBorderColor = function setBorderColor(color) {
  this.chart.colors.borderColor = color;
};

Dave_js.Plot.prototype.setBackgroundColor = function setBackgroundColor(color) {
  this.chart.colors.bgColor = color;
};

Dave_js.Plot.prototype.setBackgroundImage = function setBackgroundImage(id) {
  var el = document.getElementById(id);
  if(!id || id.tagName != 'IMG'){
    console.log(
      'Could not set background image, ' + el + ' is not an "IMG" tag.'
    );
  } else {
    this.chart.bgImg = el;
  }
};

Dave_js.Plot.prototype.setGrid = function setGrid() {
  this.chart.flags.grid = true;
};

Dave_js.Plot.prototype.setLegend = function setLegend() {
  this.chart.flags.legend = true;
};

Dave_js.Plot.prototype.setZoomable = function setZoomable() {
  this.chart.flags.zoomable = true;
};

Dave_js.Plot.prototype.setAutoRange = function setAutoRange(bool) {
  this.chart.flags.autoRange = bool;
};

Dave_js.Plot.prototype.getDataStore = function getDataStore() {
  return this.dataStore;
};

Dave_js.Plot.prototype.setDataStore = function setDataStore(ds) {
  this.dataStore = ds;
};

Dave_js.Plot.prototype.getChartProps = function getChartProps() {
  return this.chart;
};

Dave_js.Plot.prototype.drawData = function drawData(data) {
  var
    plotter = this.plotter,
    style;

  //make sure the required variables are set
  if(!data || !data.vars){
    console.log('No data to draw!');
    return;
  }

  //default to drawing just a line plot
  style = (data.style || "line").toLowerCase();
  
  //draw the various styles that were specified
  if(style.indexOf("line") != -1){
    if(typeof plotter.drawLines == 'function'){
      plotter.drawLines.call(this, data);
    } else {
      console.log(this.type + " plotter can not plot lines.");
    }
  }

  if(style.indexOf("point") != -1){
    if(typeof plotter.drawPoints == 'function'){
      plotter.drawPoints.call(this, data);
    } else {
      console.log(this.type + " plotter can not plot points.");
    }
  }

  if(style.indexOf("function") != -1){
    if(typeof plotter.drawFunction == 'function'){
      plotter.drawPoints.call(this, data);
    } else {
      console.log(this.type + " plotter can not plot function.");
    }
  }

  if(this.chart.flags.legend){
    //this.plotter.drawLegend(data);
  }
};
