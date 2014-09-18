Dave_js.Cartesian = function Cartesian(ctx, dataStore, chart){

  //make sure everything is defined
  if (!dataStore || typeof dataStore.getVarData !== 'function') {
    console.log('No data store set. Can not calcualte pixel map.');
    return null;
  } else {
    this.dataStore = dataStore;
  }

  if(!chart){
    console.log('No chart options!');
    return;
  } else {
    this.chart = chart;
  }

  if(!ctx){
    console.log('No canvas context!');
    return;
  } else {
    this.ctx = ctx;
  }

  //a copy of all the variable data that is pulled from dataStore
  this.data = {};

  //vars will contain the name of the variables plotted on each axis
  this.vars = {
    x: "",
    y: []
  };
  
  //value to pixel conversion factors
  this.spacing = {x: 0, y: 0};

  //range for the x and y axis
  this.range = {
    yMin: null,
    yMax: null,
    xMin: null,
    xMax: null
  };
};

/*
  //get info about the y variables we are going to plot
  this.yVarNames = vars.deps || [];
  this.numVars = this.yVarNames.length;
  this.numPts = this.stop - this.start + 1;

  //get the min and max values that will be plotted
  this.chartMin = chart.limits.min;
  this.chartMax = chart.limits.max;

};
*/

Dave_js.Cartesian.prototype.loadData = function loadData(vars) {
  var
    ranged, numPts, pnt_i, numVars, var_i, pnts;

  if(!vars){
    console.log('Could not load data into plot, no variables set.');
    return;
  }

  this.vars = vars;

  //y variables are expected to be listed in an array
  if(!this.vars.y){
    console.log('No y-axis variables set for plot.');
    return;
  }
  this.vars.y = [].concat(this.vars.y);
  numVars = this.vars.y.length;

  //create a copy of the data that is to be plotted
  this.data = {y:[], x:[]};
  for (var_i = 0; var_i < numVars; var_i++) {
    this.data.y[var_i] =
      (this.dataStore.getVarData(this.vars.y[var_i]) || []).slice(0);
  }
  
  //make sure all the y variables are the same length
  numPts = this.data.y[0].length || 0;
  for(var_i = 0; var_i < numVars; var_i++){
    if(numPts && numPts != this.data.y[var_i].length){
      console.log('Found y-axis variables with different lengths.');
      console.log('\t' + this.vars.y[var_i] + ': ' + this.data.y[var_i].length);
      console.log('\t' + this.vars.y[var_i] + ': ' + numPts);
      return;
    }
    
    numPts = this.data.y[var_i].length;
  }

  //if the x variable has not been set, create an array of indicies the 
  //same length as the first y variable data
  if ((this.data.x = this.dataStore.getVarData(this.vars.x)) === null) {
    for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
      this.data.x[pnt_i] = pnt_i;
    }
  } else {
    //we were able to get a reference to the x variable data, so make a new copy
    this.data.x = this.data.x.slice(0);
  }

  //range the data
  ranged = Dave_js.autoRange({
    data: this.data.x,
    min: this.chart.limits.xmin,
    max: this.chart.limits.xmax
  });
  this.range.xMin = ranged.min;
  this.range.xMax = ranged.max;

  for(var_i = 0; var_i < numVars; var_i++){
    ranged = Dave_js.autoRange({
      data: this.data.y[var_i],
      min: this.chart.limits.ymin,
      max: this.chart.limits.ymax
    });
    this.range.yMin = Math.min(ranged.min, this.range.yMin);
    this.range.yMax = Math.max(ranged.max, this.range.yMax);
  }

  //calculate the pixel conversion factor
  this.spacing.x =
    this.chart.sizes.width / (this.range.xMax - this.range.xMin);
  this.spacing.y =
    this.chart.sizes.height / (this.range.yMax - this.range.yMin);
};

Dave_js.Cartesian.prototype.getCoords = function getCoords(x, y) {
  return {
    x: (x - this.range.xMin) * this.spacing.x,
    y: (this.range.yMax - y) * this.spacing.y
  };
};

Dave_js.Cartesian.prototype.decorate = function decorate(labels) {
  this.callYTics();
  this.callXTics();
};

Dave_js.Cartesian.prototype.plot = function plot() {
  var
    pnt_i, var_i, limits, numVars, numPts, pnts, dot;

  if(!this.vars){
    console.log("Plot variables not set!");
    return;
  }

  numVars = this.vars.y.length;

  //move to the plot origin
  this.ctx.save();
  //this.ctx.translate(0, this.chart.sizes.height);

  //draw all the lines
  for(var_i = 0; var_i < numVars; var_i++){
    this.drawLines(
      this.data.x,
      this.data.y[var_i],
      this.chart.colors.data[var_i]
    );
  }

  //draw all the points
  for(var_i = 0; var_i < numVars; var_i++){
    //define what the points will look like
    dot = Dave_js.Cartesian.prototype.squareDotFactory({
      color: this.chart.colors.data[var_i], width: '2', ctx: this.ctx
    });

    this.drawPoints(this.data.x, this.data.y[var_i], dot);
  }

  //restore the context to the pre-plotting state
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(x, y, color) {
  var
    onPath = false,
    coords,
    pnt_i;

  this.ctx.save();

  this.ctx.lineWidth = this.chart.sizes.lineWidth;

  //set colors for this plot
  color = color || 'black';
  this.ctx.fillStyle = color;
  this.ctx.strokeStyle = color;
  
  for(pnt_i = 0; pnt_i < x.length; pnt_i++){
    //if we hit a data gap, end the current path
    if (isNaN(y[pnt_i])) {
      this.ctx.stroke();
      onPath = false;
    } else {
      //convert the data point to pixel coordinates
      coords = this.getCoords(x[pnt_i], y[pnt_i]);

      //make sure we have a current path
      if (!onPath) {
        this.ctx.moveTo(coords.x, coords.y);
        this.ctx.beginPath();
        onPath = true;
      } else {
        this.ctx.lineTo(coords.x, coords.y);
      }
    }
  }

  this.ctx.stroke();
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawPoints = function drawPoints(x, y, dot) {
  var coords, pnt_i;

  this.ctx.save();

  //make sure the dot function is set
  if (typeof dot != 'function') {
    dot = Dave_js.Cartesian.squareDotFactory({color: color, width: 2});
  }

  for (pnt_i = 0; pnt_i < x.length; pnt_i++) {
    coords = this.getCoords(x[pnt_i], y[pnt_i]);
    dot(coords.x, coords.y);
  }

  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawLegend = function drawLegend() {
  var var_i;

  this.ctx.save();
  
  for (var_i = 0; var_i < vars.y; var_i++) {
    //draw legend
    ctx.strokeStyle = colors.data[plt_i];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chart.sizes.width, y);
    ctx.lineTo(chart.sizes.width + legendOffset, y);
    ctx.stroke();

    ctx.fillStyle = colors.data[plt_i];
    ctx.textAlign = "start";
    ctx.fillText(
      depVarNames[plt_i], chart.sizes.width + legendOffset, y
    );
  }

  //return to the canvas origin
  ctx.translate(0, -1 * chart.sizes.height);

  this.ctx.restore();
};

Dave_js.Cartesian.prototype.squareDotFactory = function squareDotFactory(opts) {
  //set defaults for missing options
  opts = opts || {};
  var
    color = opts.color || 'black',
    width = +opts.width || 2,
    halfWidth = Math.min((width / 2), 1),
    ctx = opts.ctx;

  //make sure there is a context defined
  if (!ctx) {
    console.log('Could not draw dot, no canvas context');
    return;
  }

  function dot(x, y) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    ctx.fillRect(x - halfWidth, y - halfWidth, width, width);
    ctx.restore();
  }

  return dot;
};

Dave_js.Cartesian.prototype.callXTics = function callXTics() {
  var
    chartWidth, labelWidth, numTics, skipTics,
    offset, ticLabel, pnt_i, var_i, data;
  
  data = this.dataStore.getVarData(this.vars.x).slice();

  chartWidth = +this.chart.sizes.width;
  labelWidth = parseInt(this.ctx.font, 10) * 1.5;
  numTics = (chartWidth / labelWidth) >> 0;
  skipTics = Math.ceil(numTics / numTics);
  labels = Dave_js.rangeToArray(
    Math.min.apply(null, data),
    Math.max.apply(null, data),
    numTics
  );

  //draw xAxis tic marks and labels
  this.ctx.save();
  this.ctx.textAlign = "end";
  this.ctx.translate(0, this.chart.sizes.height);
  this.ctx.rotate(1.5 * Math.PI);

  for (pnt_i = 0; pnt_i < numTics; pnt_i += skipTics) {
    offset = pnt_i * labelWidth;
    ticLabel = labels[pnt_i];

    Dave_js.drawTic(this.ctx, ticLabel, offset);
  }

  this.ctx.restore();
};

Dave_js.Cartesian.prototype.callYTics = function callYTics() {
  var
    chartHeight, labelWidth, numTics, skipTics,
    offset, ticLabel, pnt_i, var_i, data;

  data = [];
  for(var_i = 0; var_i < this.vars.y.length; var_i++){
    data = data.concat(this.dataStore.getVarData(this.vars.y[var_i]));
  }

  chartHeight = +this.chart.sizes.height;
  labelWidth = parseInt(this.ctx.font, 10) * 1.5;
  numTics = (chartHeight / labelWidth) >> 0;
  skipTics = Math.ceil(numTics / numTics);
  labels = Dave_js.rangeToArray(
    Math.min.apply(null, data),
    Math.max.apply(null, data),
    numTics
  );

  //draw yAxis tic marks and labels
  this.ctx.save();
  this.ctx.textAlign = "end";
  this.ctx.translate(0, this.chart.sizes.height);
  for (pnt_i = 0; pnt_i < numTics; pnt_i += skipTics) {
    offset = -pnt_i * labelWidth;
    ticLabel = labels[pnt_i];

    Dave_js.drawTic(this.ctx, ticLabel, offset);
  }

  this.ctx.restore();
};