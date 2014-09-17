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

Dave_js.Cartesian.prototype.decorate = function decorate(labels) {
  //draw the grid
  this.callXTics();
  this.callYTics();
};

Dave_js.Cartesian.prototype.plot = function plot(vars) {
  var
    pnt_i, var_i, xSpacing, ySpacing, limits, coords, numVars, numPts, pnts, dot;

  if(!vars){
    console.log("Plot variables not set!");
    return;
  }

  //move to the plot origin
  this.ctx.save();
  //this.ctx.translate(0, this.chart.sizes.height);

  //y variables are expected to be listed in an array
  vars.y = [].concat(vars.y);
  numVars = vars.y.length;

  //create a copy of the data that is to be plotted
  coords = {y:[], x:[]};
  for (var_i = 0; var_i < numVars; var_i++) {
    coords.y[var_i] = (this.dataStore.getVarData(vars.y[var_i]) || []).slice(0);
  }
  numPts = coords.y[0].length || 0;

  if ((coords.x = this.dataStore.getVarData(vars.x)) === null) {
    //if the x variable has not been set, create an array of indicies the 
    //same length as the first y variable data
    
    for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
      coords.x[pnt_i] = pnt_i;
    }
  } else {
    //we were able to get a reference to the x variable data, so make a new copy
    coords.x = coords.x.slice(0);
  }

  //figure out the plot limits
  limits = {
    xMin : this.chart.limits.xmin || Math.min.apply(null, coords.x),
    xMax : this.chart.limits.xmax || Math.max.apply(null, coords.x),
    yMin : this.chart.limits.ymin,
    yMax : this.chart.limits.ymax
  };

  //calculate the pixel conversion factor
  xSpacing = this.chart.sizes.width / (limits.xMax - limits.xMin);
  ySpacing = this.chart.sizes.height / (limits.yMax - limits.yMin);
  
  //convert all data points to coordinates
  pnts = coords.x;
  for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
    pnts[pnt_i] = (pnts[pnt_i] - limits.xMin) * xSpacing;
  }
  for (var_i = 0; var_i < numVars; var_i++) {
    pnts = coords.y[var_i];
    for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
      pnts[pnt_i] = (limits.yMax - pnts[pnt_i]) * ySpacing;
    }
  }

  //draw all the lines
  for(var_i = 0; var_i < numVars; var_i++){
    this.drawLines(coords.x, coords.y[var_i], this.chart.colors.data[var_i]);
  }

  //draw all the points
  for(var_i = 0; var_i < numVars; var_i++){
    //define what the points will look like
    dot = Dave_js.Cartesian.prototype.squareDotFactory({
      color: this.chart.colors.data[var_i], width: '2', ctx: this.ctx
    });

    this.drawPoints(coords.x, coords.y[var_i], dot);
  }

  //restore the context to the pre-plotting state
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(x, y, color) {
  var
    onPath = false,
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
      //make sure we have a current path
      if (!onPath) {
        this.ctx.moveTo(x[pnt_i], y[pnt_i]);
        this.ctx.beginPath();
        onPath = true;
      } else {
        this.ctx.lineTo(x[pnt_i], y[pnt_i]);
      }
    }
  }

  this.ctx.stroke();
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawPoints = function drawPoints(x, y, dot) {
  var pnt_i;

  this.ctx.save();

  //make sure the dot function is set
  if (typeof dot != 'function') {
    dot = Dave_js.Cartesian.squareDotFactory({color: color, width: 2});
  }

  for (pnt_i = 0; pnt_i < x.length; pnt_i++) {
    dot(x[pnt_i], y[pnt_i]);
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

Dave_js.Cartesian.prototype.callYTics = function callYTics() {
  var
    maxLimit = chart.limits.ymax,
    minLimit = chart.limits.ymin,
    skipTics = chart.skipTics.dep,
    spacing = chart.pntSpacing.dep,
    chartHeight = chart.sizes.height,
    scaleValue = chart.scale.value,
    scaleType = chart.scale.type,
    ticHeight,
    offset,
    ticLabel,
    i;

  //draw yAxis tic marks and labels
  ctx.textAlign = "end";
  for (i = minLimit; i <= maxLimit; i += skipTics) {
    ticHeight = i - minLimit;
    offset = chartHeight - (ticHeight * spacing);

    ticLabel = i;

    //unscale the y axis value if needed
    if(flags.scaled) {
      if(scaleType == "log") {
        ticLabel = Math.pow(scaleValue, ticLabel);
      } else if(scaleType == "lin") {
        ticLabel /= scaleValue;
      }
    }
     
    if (!isNaN(ticLabel) && (ticLabel % 1) !== 0) {
      ticLabel = ticLabel.toFixed(2);
    }
    
    drawTic(ticLabel, offset);
  }
};

Dave_js.Cartesian.prototype.callXTics = function callXTics() {
  var
    indepVarData = dataStore.getVarData(vars.indep) || [],
    numOfPts = chart.range.numOfPts,
    start = chart.range.start,
    offset,
    ticLabel,
    spacing,
    textShift,
    pnt_i;

  if (flags.hist) {
    spacing =  chart.histBarTotal;
     
    //we need to shift the text lables a bit 
    //so they will line up with the bard
    textShift = 0.5;
  } else {
    spacing = chart.pntSpacing.indep;
    textShift = 0;
  }

  //draw xAxis tic marks and labels
  ctx.save();
  ctx.translate(0, chart.sizes.height);
  ctx.rotate(1.5 * Math.PI);
  
  for (pnt_i = 0; pnt_i < numOfPts; pnt_i += chart.skipTics.indep) {
    offset = (pnt_i * spacing) + textShift;
    ticLabel = indepVarData[pnt_i + start];

    //only draw the tic mark if it is defined
    if (ticLabel !== undefined) {drawTic(ticLabel, offset);}
  }
  ctx.restore();
};