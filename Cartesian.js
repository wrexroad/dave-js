Dave_js.Cartesian = function Cartesia1n(owner){
  //override any functions in Plot.js that are set here
  if(!owner){return;}
  for(var i in this){
    owner[i] = this[i];
  }

  owner.range = {
    xMin: NaN,
    xMax: NaN,
    yMin: NaN,
    yMax: NaN
  };
};

Dave_js.Cartesian.prototype.calculateMargins=function calculateMargins(labels) {
  var
    top, bottom, left, right,
    fontSize = this.chart.fontSize || 0,
    axisVars = labels.axisVars || {},
    labelLength = (this.dataStore.getVar(axisVars.x) || {}).labelLength || 1;

  //calculate the top and bottom margins based on the font height
  top = labels.plotTitle ? fontSize : 0;
  bottom = fontSize << 1; //possible 2 rows of axis labels

  //figure out how wide each axis label set will be
  left = this.decorCtx.measureText((new Array(labelLength)).join('W')).width;
  
  return {
    top: (top || 0) + fontSize,
    bottom: (bottom || 0) + fontSize,
    left: (left || 0) + fontSize,
    right: (right || 0) + fontSize
  };
};

Dave_js.Cartesian.prototype.drawGrid = function drawGrid() {
  var
    chart = this.chart || {},
    fontSize = chart.fontSize,
    plotRegion = chart.plotRegion || {},
    dataStore = this.dataStore || {},
    vars = chart.axisVars || {},
    x = dataStore.getVar(vars.x),
    y = dataStore.getVar(vars.y),
    ctx = this.decorCtx || {},
    skipTics = 1,
    ticLocation = 0,
    lastText = 0,
    labels, maxTics, numLabels, pnt_i, labelText, halfWidth, ticLength;
  
  //configure the drawing context
  ctx.save();
  ctx.strokeStyle = chart.colors.borderColor;
  ctx.textAlign = "end";

  //outline the grid
  ctx.translate(plotRegion.left, plotRegion.top);
  ctx.strokeRect(0, 0, chart.width, chart.height);

  //draw the y axis tics and labels
  ctx.translate(0, chart.height);
  
  labels =
    Dave_js.Utils.createLabels(
      this.range.yMin,
      this.range.yMax,
      y
    );
  numLabels = labels.length;

  for (pnt_i = 0, ticLocation = 0; pnt_i < numLabels; pnt_i ++) {
    ticLocation = -labels[pnt_i].coord * this.spacing.y;
    ctx.fillText(labels[pnt_i].text, -5, ticLocation + 5);
    ctx.beginPath();
    ctx.moveTo(0, ticLocation);
    ctx.lineTo(5, ticLocation);
    ctx.stroke();
  }

  //draw the x axis tics and labels
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  labels =
    Dave_js.Utils.createTimeLabels(
      this.range.xMin,
      this.range.xMax,
      dataStore.getVar(vars.x)
    );
    
  numLabels = labels.length;
  halfWidth =
    Math.ceil(ctx.measureText((new Array(x.labelLength)).join('W')).width);

  for (pnt_i = 0, ticLocation = 0; pnt_i < numLabels; pnt_i++) {
    labelText = labels[pnt_i].text;
    ticLocation = labels[pnt_i].coord * this.spacing.x;

    if(ticLocation > lastText) {
      ctx.fillText(labelText, ticLocation, fontSize);
      lastText = ticLocation + halfWidth;
      ticLength = -15;
    } else {
      ticLength = -5;
    }

    ctx.beginPath();
    ctx.moveTo(ticLocation, 0);
    ctx.lineTo(ticLocation, ticLength);
    ctx.stroke();
  }
  ctx.restore();
};

Dave_js.Cartesian.prototype.autoRange = function autoRange() {
  var
    vars = this.chart.axisVars || {},
    dataStore = this.dataStore,
    range = this.range,
    
    xVarData = dataStore.getVar(vars.x),
    xMin = xVarData.min,
    xMax = xVarData.max,
    
    yVarNames = vars.y,
    yMinSet = [],
    yMaxSet = [],
    yMin, yMax, yVarData, name_i;

  //set the y variable first
  if(!yVarNames){
    console.log("No axis variables set. Can not determine plot scale.");
    return false;
  }
  
  //get the range of all y variables
  for (name_i in yVarNames) {
    yVarData = dataStore.getVar(yVarNames[name_i]);
    yMin = yVarData.min;
    yMax = yVarData.max;

    if (yMin !== "" && !isNaN(yMin)) {yMinSet.push(yMin);}
    if (yMax !== "" && !isNaN(yMax)) {yMaxSet.push(yMax);}
  }

  //make sure we have valid min and max values
  yMin = yMinSet.length !== 0 ? Math.min.apply(null, yMinSet) : range.yMin || 0;
  yMax = yMaxSet.length !== 0 ? Math.max.apply(null, yMaxSet) : range.yMax || 0;
  
  //check if this is a constant variable  
  if (yVarData.constant) {
    yMin -= 1;
    yMax += 1;
  } else {
    //create some nicely rounded min and max values
    yMin = Dave_js.Utils.ground(yMin);
    yMax = Dave_js.Utils.sky(yMax);
  }
  //make sure min and max arent set to zero
  if (yMax === yMin === 0) {
    yMax = 1;
    yMin = -1;
  }

  //if no x var was set, use the last y index for the range
  if(!xVarData){
    xMin = yVarData.keys[0];
    xMax = yVarData.keys[yVar.length - 1];
  } else {
    if(xVarData.constant){
      xMin -= 1;
      xMax += 1;
    } else {
      xMin = !isNaN(xMin) ? xMin : range.xMin || 0;
      xMax = !isNaN(xMax) ? xMax : range.xMax || 0;
    }
  }

  this.setAxisRange({
    x: {min: xMin, max: xMax},
    y: {min: yMin, max: yMax}
  });
};

Dave_js.Cartesian.prototype.labelAxes = function labelAxes(labels) {
  var
    ctx = this.decorCtx,
    left, right;

  if(!labels){return;}
  
  ctx.save();

  if(labels.x){
    ctx.fillStyle = this.chart.colors.text;
    ctx.textAlign = "start";
    ctx.fillText(labels.x, -50, (this.chart.height + 40));
  }

  if(labels.y){
    ctx.translate(-45, (this.chart.height / 2) );
    ctx.rotate(1.5 * Math.PI);
    ctx.textAlign = "center";
    ctx.fillText(labels.y, 0, -20);
  }

  ctx.restore();

  return {
    left: left || 0,
    right: right || 0,
  };
};

Dave_js.Cartesian.prototype.getCoords = function getCoords(data) {
  var
    x = this.dataStore.getVar(data.vars.x),
    y = this.dataStore.getVar(data.vars.y),
    xSpacing = this.spacing.x,
    ySpacing = this.spacing.y,
    xMin = this.range.xMin || 0,
    yMin = this.range.yMin || 0,
    coords = [], data_i, pnt_i, xData, yData;
    
    //check if we have an good data
    if (y === null) {
      return;
    } else {
      yData = y.data;
    }
    if (x === null) {
      //No x axis variable was set use the indexing values from y
      xData = Dave_js.Utils.arrayToObject(y.keys);
    } else {
      xData = x.data;
    }

    keys = y.keys || {};
    numPts = y.length || 0;

    for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
      data_i = keys[pnt_i];
      coords[pnt_i] = {
        x : (xData[data_i] - xMin) * xSpacing,
        y : (yData[data_i] - yMin) * ySpacing
      };
    }

  return coords;
};

Dave_js.Cartesian.prototype.invertPlotCoords = function getCoords(coords) {
  var
    range = this.range,
    chart = this.chart;
    
  return {
    x: range.xMin + coords.x / this.spacing.x,
    y: range.yMax - coords.y / this.spacing.y
  };
};

Dave_js.Cartesian.prototype.invertCanvasCoords = function getCoords(coords) {
  var
    range = this.range,
    chart = this.chart,
    plotRegion = chart.plotRegion;
    
  return {
    x: range.xMin + (coords.x - plotRegion.left) / this.spacing.x,
    y: range.yMax - (coords.y - plotRegion.top) / this.spacing.y
  };
};


Dave_js.Cartesian.prototype.drawLines = function drawLines(coords) {
  var
    ctx = this.dataCtx,
    onPath = false,
    numPts = coords.length || 0,
    pnt_i, x, y;
  
  for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
    x = coords[pnt_i].x;
    y = coords[pnt_i].y;

    //if we hit a data gap, end the current path
    if (isNaN(coords[pnt_i].y)) {
      ctx.stroke();
      onPath = false;
    } else {
      //make sure we have a current path
      if (!onPath) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        onPath = true;
      } else {
        ctx.lineTo(x, y);
      }
    }
  }

  ctx.stroke();
};

Dave_js.Cartesian.prototype.drawLegend = function drawLegend() {
  var
    ctx = this.decorCtx,
    vars = this.vars,
    chart = this.chart,
    var_i;

  ctx.save();
  
  for (var_i = 0; var_i < vars.y; var_i++) {
    //draw legend
    ctx.strokeStyle = colors.data[plt_i];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(chart.width, y);
    ctx.lineTo(chart.width + legendOffset, y);
    ctx.stroke();

    ctx.fillStyle = colors.data[plt_i];
    ctx.textAlign = "start";
    ctx.fillText(
      depVarNames[plt_i], chart.width + legendOffset, y
    );
  }

  //return to the canvas origin
  ctx.translate(0, -1 * chart.height);

  ctx.restore();
};

Dave_js.Cartesian.prototype.setAxisRange = function setAxisRange(range) {
  range = range || {};
  var
    x = range.x || {},
    y = range.y || {},
    xMin = Dave_js.Utils.forceNumber(x.min),
    xMax = Dave_js.Utils.forceNumber(x.max),
    yMin = Dave_js.Utils.forceNumber(y.min),
    yMax = Dave_js.Utils.forceNumber(y.max);

  this.range.xMin = isNaN(xMin) ? this.range.xMin : xMin;
  this.range.xMax = isNaN(xMax) ? this.range.xMax : xMax;
  this.range.yMin = isNaN(yMin) ? this.range.yMin : yMin;
  this.range.yMax = isNaN(yMax) ? this.range.yMax : yMax;

  //calculate the pixel conversion factor
  this.spacing = {
    x: this.chart.width / (xMax - xMin),
    y: this.chart.height / (yMax - yMin)
  };

  this.chart.flags.hasPixelConversion = true;
};

Dave_js.Cartesian.prototype.getAxisRange = function getAxisRange() {
  return this.range;
};