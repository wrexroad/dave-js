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
    axisVars = labels.axisVars || {},
    top, bottom, left, right;

  //calculate the top margin based on the font height
  top = labels.plotTitle ? this.chart.fontSize : 0;

  //figure out how wide each axis label set will be
  bottom = this.getAxisSize.call(this, axisVars.x);
  left = this.getAxisSize.call(this, axisVars.y);
  
  return {
    top: (top || 0) + this.chart.fontSize,
    bottom: (bottom || 0) + this.chart.fontSize,
    left: (left || 0) + this.chart.fontSize,
    right: (right || 0) + this.chart.fontSize
  };
};

Dave_js.Cartesian.prototype.getAxisSize = function getAxisSize(varName) {
  var
    converter = Dave_js.Converters[varName] || Dave_js.Converters.default,
    varData = (this.dataStore.getVar(varName) || {}),
    min = varData.min || 0,
    max = varData.max || 0,
    diff = Dave_js.Utils.floatSubtraction(max, min),
    text1, text2;

  //if we werent able to calculate a range, assume we have a constant value
  //and bump it by 10% in either direction.
  //If we STILL dont have a range, just use -1 to 1
  if (!diff) {
    min = (min || max) * 0.9 || -1;
    max = (min || max) * 1.1 || 1;
    diff = max - min;
  }
  
  //convert the min and max values to determin which has the longer label
  //use the difference between max and min to figure out sigFigs
  text1 = converter(min, ('' + diff).length);
  text2 = converter(max, ('' + diff).length);

  return (
    this.ctx.measureText(text1.length > text2.length ? text1 : text2).width
  );
};

Dave_js.Cartesian.prototype.drawGrid = function drawGrid() {
  var
    chart = this.chart || {},
    plotRegion = chart.plotRegion || {},
    vars = chart.axisVars || {},
    ctx = this.ctx || {},
    labels, converter, numTics, coords, pnt_i;
  
  //configure the drawing context
  ctx.save();
  ctx.strokeStyle = chart.colors.borderColor;
  ctx.textAlign = "end";

  //outline the grid
  ctx.translate(plotRegion.left, plotRegion.top);
  ctx.strokeRect(0, 0, chart.width, chart.height);

  //draw the y axis tics and labels
  ctx.translate(0, chart.height);
  numTics = (chart.height / chart.fontSize || 25) >> 0;
  converter = Dave_js.Converters[vars.y] || Dave_js.Converters.default;
  labels =
    Dave_js.Utils.createLabels(
      this.range.yMin,
      this.range.yMax,
      numTics,
      converter
    );
  for (pnt_i = 0; pnt_i <= numTics; pnt_i ++) {
    Dave_js.Utils.drawTic(
      ctx, labels[pnt_i].text, -labels[pnt_i].coord * this.spacing.y
    );
  }

  //draw the x axis tics and labels
  ctx.rotate(1.5 * Math.PI);
  numTics = (chart.width / chart.fontSize || 25) >> 0;
  converter = Dave_js.Converters[vars.x] || Dave_js.Converters.default;
  labels =
    Dave_js.Utils.createLabels(
      this.range.xMin,
      this.range.xMax,
      numTics,
      converter
    );
  for (pnt_i = 0; pnt_i <= numTics; pnt_i++) {
    Dave_js.Utils.drawTic(
      ctx, labels[pnt_i].text, labels[pnt_i].coord * this.spacing.x
    );
  }
  ctx.restore();
};

Dave_js.Cartesian.prototype.autoRange = function autoRange() {
  var
    vars = this.chart.axisVars || {},
    dataStore = this.dataStore,
    yVar = dataStore.getVar(vars.y),
    xVar = dataStore.getVar(vars.x),
    range = this.range,
    xMin, xMax, yMin, yMax;

  //set the y variable first
  if(!yVar){
    console.log("No axis variables set. Can not determine plot scale.");
    return false;
  }
  yMin = Dave_js.Utils.forceNumber(yVar.min);
  yMin = isNaN(yMin) ? range.yMin : yMin;
  yMin = Dave_js.Utils.ground(yMin);
  yMax = Dave_js.Utils.forceNumber(yVar.max);
  yMax = isNaN(yMax) ? range.yMax : yMax;
  yMax = Dave_js.Utils.sky(yMax);

  //if no x var was set, use the y index for the range
  if(!xVar){
    xMin = yVar.keys[0];
    xMax = yVar.keys[yVar.length - 1];
  } else {
    xMin = Dave_js.Utils.forceNumber(xVar.min);
    xMin = isNaN(xMin) ? range.xMin : xMin;
    xMax = Dave_js.Utils.forceNumber(xVar.max);
    xMax = isNaN(xMax) ? range.xMax : xMax;
  }

  //make sure the max and min of either axis are not the same
  if(xMax === xMin){
    if(xMax === 0){
      xMax = 1;
      xMin = -1;
    } else {
      xMax *= 1.1;
      xMin /= 1.1;
    }
  }
  if(yMax === yMin){
   if(yMax === 0){
      yMax = 1;
      yMin = -1;
    } else {
      yMax *= 1.1;
      yMin /= 1.1;
    }
  }

console.log({
    x: {min: xMin, max: xMax},
    y: {min: yMin, max: yMax}
  })
;
  this.setAxisRange({
    x: {min: xMin, max: xMax},
    y: {min: yMin, max: yMax}
  });
};

Dave_js.Cartesian.prototype.labelAxes = function labelAxes(labels) {
  var left, right;
  if(!labels){return;}
  
  this.ctx.save();

  if(labels.x){
    this.ctx.fillStyle = this.chart.colors.text;
    this.ctx.textAlign = "start";
    this.ctx.fillText(labels.x, -50, (this.chart.height + 40));
  }

  if(labels.y){
    this.ctx.translate(-45, (this.chart.height / 2) );
    this.ctx.rotate(1.5 * Math.PI);
    this.ctx.textAlign = "center";
    this.ctx.fillText(labels.y, 0, -20);
  }

  this.ctx.restore();

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

Dave_js.Cartesian.prototype.drawLines = function drawLines(coords) {
  var
    ctx = this.ctx,
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
    ctx = this.ctx,
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