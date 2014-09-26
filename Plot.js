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

Dave_js.Plot.prototype.renderInto = function(canvasDivID) {
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
  this.ctx.translate(
    this.chart.origin.x, this.chart.origin.y
  );
};

Dave_js.Cartesian.prototype.decorate = function decorate(labels) {
  labels = labels || {};

  //draw background and border
  this.ctx.save();
  if (this.chart.bgImg) {
    this.ctx.drawImage( this.chart.bgImg, 0, 0 );
  } else {
    this.ctx.fillStyle = this.chart.colors.bgColor;
    this.ctx.fillRect( 0, 0, this.chart.width, this.chart.height );
  }
  this.ctx.strokeStyle = this.chart.colors.borderColor;
  this.ctx.strokeRect(0, 0, this.chart.width, this.chart.height);
  this.ctx.restore();

  //print title (bold)
  if (labels.plotTitle) {
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
  
  //print axis labels
  this.plotter.labelAxes.call(this, labels.axisLabels);

  //add the grid
  if(labels.axisVars){
    if(!this.chart.flags.hasPixelConversion){
      this.plotter.mapPixels.call(this, labels.axisVars);
    }
    this.plotter.drawGrid.call(this, labels.axisVars);
  }
};

Dave_js.Plot.prototype.setOrigin = function(x, y) {
  this.chart.origin.x = Dave_js.forceNumber(x) || this.chart.origin.x;
  this.chart.origin.y = Dave_js.forceNumber(y) || this.chart.origin.y;
};

Dave_js.Plot.prototype.setChartSize = function(sizes) {
  var margin, height, width;

  if(!sizes){
    return;
  }

  if((margin = Dave_js.Utils.forceNumber(sizes.margin))){
    this.chart.margin = Math.max(0, margin);
  }

  if((height = Dave_js.Utils.forceNumber(sizes.height))){
    this.chart.height = height;
    this.canvas.height = height + this.chart.margin;
  }

  if((width = Dave_js.Utils.forceNumber(sizes.width))){
    this.chart.width = width;
    this.canvas.width = width + this.chart.margin;
  }

  this.chart.height = height;
  this.chart.width = width;
  
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

Dave_js.Plot.prototype.getChartProps = function() {
  return this.chart;
};

Dave_js.Plot.prototype.drawData = function drawData(data) {
  var
    plotter = this.plotter,
    style;

  //make sure we already have the pixel map configured
  if(!this.chart.flags.hasPixelConversion){
      this.plotter.mapPixels.call(this, labels.axisVars);
  }

  //make sure the required variables are set
  if(!data || !data.vars){
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
