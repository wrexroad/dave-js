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

  //create the canvas elements
  this.dataCanvas = document.createElement("canvas");
  this.dataCanvas.id = this.chart.dataCanvasId;
  this.dataCanvas.className = "davejs-data-canvas";
  this.decorCanvas = document.createElement("canvas");
  this.decorCanvas.id = this.chart.decorCanvasId;
  this.decorCanvas.className = "davejs-decor-canvas";
  
  //initialize canvas context
  this.dataCtx = this.dataCanvas.getContext("2d");
  this.decorCtx = this.decorCanvas.getContext("2d");

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

  this.canvasBox.appendChild(this.dataCanvas);
  this.canvasBox.appendChild(this.decorCanvas);
};

Dave_js.Plot.prototype.configure = function configure(labels) {
  var
    decorCanvas = this.decorCanvas || {},
    dataCanvas = this.dataCanvas || {},
    chart = this.chart || {},
    flags = chart.flags || {},
    dataCtx = this.dataCtx || {},
    decorCtx = this.decorCtx || {},
    plotter = this.plotter,
    font = this.chart.cssFont || '',
    plotRegion, fontSize;

  labels = labels || {};
  
  //save which variables are for which axis
  chart.axisVars = labels.axisVars || {};
  
  //verify font and measure its height
  if (typeof font !== 'string') {
    font = '12px monospace';
    fontSize = 12;
  } else {
    fontSize = parseInt(font, 10);
    if (!fontSize) {
      fontSize = 12;
      font = '12px ' + font;
    }
  }
  chart.cssFont = dataCtx.font = decorCtx.font = font;
  chart.fontSize = fontSize;

  //figure out how much space the ticmarks and labels will occupy
  this.chart.plotRegion = plotRegion =
    this.plotter.calculateMargins.call(this, labels);

  //get the size of the plotting area
  dataCanvas.width = chart.width;
  dataCanvas.height = chart.height;
  decorCanvas.width = chart.width + plotRegion.left + plotRegion.right;
  decorCanvas.height = chart.height + plotRegion.top + plotRegion.bottom;
  
  //move the data canvas to the origin
  dataCanvas.style.left = plotRegion.left + "px";
  dataCanvas.style.top = plotRegion.top + "px";

  //draw background of the data canvas
  dataCtx.save();
  if (chart.bgImg) {
    //resize the image to fit the plotting area
    chart.bgImg.width = dataCanvas.width;
    chart.bgImg.height = dataCanvas.height;

    dataCtx.drawImage(chart.bgImg,0 , 0);
  } else {
    dataCtx.fillStyle = chart.colors.bgColor;
    dataCtx.fillRect(0,0, dataCanvas.width, dataCanvas.height);
  }
  dataCtx.restore();

  //calculate the value/pixes ratio
  if (flags.autoRange) {
    plotter.autoRange.call(this);
  }
};

Dave_js.Plot.prototype.decorate = function decorate(labels) {
  var ctx = this.decorCtx;

  //print title (bold)
  if (typeof labels.plotTitle == "string") {
    
    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = this.chart.colors.text;
    ctx.font = "bold " + this.chart.cssFont;
    ctx.fillText(
      labels.plotTitle,
      (this.chart.width / 2), -5
    );
    this.ctx.restore();
  }
  
  if (labels.axisLabels) {
    plotter.labelAxes.call(labels.axisLabels);
  }
};

Dave_js.Plot.prototype.setOrigin = function setOrigin(x, y) {
  this.chart.origin.x = Dave_js.forceNumber(x) || this.chart.origin.x;
  this.chart.origin.y = Dave_js.forceNumber(y) || this.chart.origin.y;
};

Dave_js.Plot.prototype.setPlotSize = function setPlotSize(sizes) {
  var size;

  if(!sizes){
    return;
  }

  if((size = Dave_js.Utils.forceNumber(sizes.height))){
    this.chart.height = size;
  }
  if((size = Dave_js.Utils.forceNumber(sizes.width))){
    this.chart.width = size;
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
    ctx = this.dataCtx || {},
    chart = this.chart || {},
    plotRegion = chart.plotRegion || {},
    brushWidth = +data.brushWidth || 2,
    color = data.color || 'black',
    style, coords, dot;

  //make sure the required variables are set
  if(!data || !data.vars){
    console.log('No data to draw!');
    return;
  }

  //default to drawing just a line plot
  style = (data.style || "line").toLowerCase();
  
  //convert all of the values to pixel coordinates
  coords = plotter.getCoords.call(this, data);

  //configure plotting context
  ctx.save();
  ctx.translate(0, chart.height);
  ctx.scale(1, -1);

  //set colors for this plot
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  //draw the various styles that were specified
  if(style.indexOf("line") != -1){
    if(typeof plotter.drawLines == 'function'){
      plotter.drawLines.call(this, coords);
    } else {
      console.log(this.type + " plotter can not plot lines.");
    }
  }
  if(style.indexOf("point") != -1){
    dot = (
      typeof data.dot == 'function' ?
        dot :
        Dave_js.Utils.squareDotFactory({color: color, width: brushWidth})
    );

    coords.forEach(dot, this);
  }
  if(style.indexOf("function") != -1){
    if(typeof plotter.drawFunction == 'function'){
      plotter.drawPoints.call(this, data);
    } else {
      console.log(this.type + " plotter can not plot function.");
    }
  }

  ctx.restore();
};

Dave_js.Plot.prototype.invertCoords = function invertCoords(coords) {
  return this.plotter.invertCoords(coords);
};

Dave_js.Plot.prototype.drawTitleLegend = function drawTitleLegend(vars) {
  var
    ctx = this.decorCtx,
    numVars = vars.length,
    offset = 0, var_i;

  ctx.save();
  ctx.translate(this.chart.plotRegion.left, 0);
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
    while ((var_i = vars.pop())) {
      ctx.fillStyle = var_i.color;
      ctx.fillText(var_i.text, offset, 0);
      offset += ctx.measureText(var_i.text + ' ').width;
    }
  ctx.restore();
};

Dave_js.Plot.prototype.drawAxes = function drawAxes() {
  var
    chart = this.chart || {},
    flags = chart.flags || {},
    plotRegion = chart.plotRegion || {},
    ctx = this.decorCtx;

  //add the grid based on the 
  if (!flags.hasRange) {
    this.plotter.drawGrid.call(this);
  }
};

Dave_js.Plot.prototype.getMargins = function getPlotMargins() {
  return this.chart.plotRegion;
};