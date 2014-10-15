Dave_js.Cartesian = function Cartesian(owner){
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

Dave_js.Cartesian.prototype.getCoords = function getCoords(x, y) {
  return {
    x: (x - this.range.xMin) * this.spacing.x,
    y: (this.range.yMax - y) * this.spacing.y
  };
};

Dave_js.Cartesian.prototype.drawGrid = function drawGrid(){
  var vars = this.chart.axisVars || {};
  
  Dave_js.Cartesian.prototype.drawXTics.call(this, vars.x);
  Dave_js.Cartesian.prototype.drawYTics.call(this, vars.y);
};

Dave_js.Cartesian.prototype.autoRange = function autoRange(){
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
  yMax = Dave_js.Utils.forceNumber(yVar.max);
  yMax = isNaN(yMax) ? range.yMax : yMax;

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
    xMax *= 1.1;
    xMin /= 1.1;
  }
  if(yMax === yMin){
    yMax *= 1.1;
    yMin /= 1.1;
  }

  this.setAxisRange({
    x: {min: xMin, max: xMax},
    y: {min: yMin, max: yMax}
  });
};

Dave_js.Cartesian.prototype.labelAxes = function labelAxes(labels){
  var left, right;
  if(!labels){return;}
  
  this.ctx.save();

  if(labels.x){
    this.ctx.font = this.chart.cssFont;
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

Dave_js.Cartesian.prototype.drawLines = function drawLines(data) {
  var
    ctx = this.ctx,
    x = this.dataStore.getVar(data.vars.x),
    y = this.dataStore.getVar(data.vars.y),
    color = data.color || 'black',
    brushWidth = +data.brushWidth || 2,
    onPath = false,
    coords, pnt_i, index, keys, xData, yData, numPts;
  
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

  ctx.save();

  ctx.lineWidth = brushWidth;

  //set colors for this plot
  color = color || 'black';
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
    index = keys[pnt_i];

    //if we hit a data gap, end the current path
    if (isNaN(yData[index])) {
      ctx.stroke();
      onPath = false;
    } else {
      //convert the data point to pixel coordinates
      coords =
        Dave_js.Cartesian.prototype.getCoords.call(
          this, xData[index], yData[index]
        );

      //make sure we have a current path
      if (!onPath) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        onPath = true;
      } else {
        ctx.lineTo(coords.x, coords.y);
      }
    }
  }

  ctx.stroke();
  ctx.restore();
};

Dave_js.Cartesian.prototype.drawPoints = function drawPoints(data) {
  var
    ctx = this.ctx,
    x = this.dataStore.getVar(data.vars.x),
    y = this.dataStore.getVar(data.vars.y),
    color = data.color || 'black',
    brushWidth = +data.brushWidth || 2,
    dot =
      (typeof data.dot == 'function' ?
       dot :
       Dave_js.Utils.squareDotFactory({color: color, width: brushWidth})
      ),
    coords, pnt_i, index, keys, xData, yData, numPts;
  
  if(y === null) {
    return;
  } else {
    yData = y.data;
  }
  if (x === null) {
    xData = Dave_js.Utils.arrayToObject(y.keys);
  } else {
    xData = x.data;
  }
  keys = y.keys || {};
  numPts = y.length || 0;

  ctx.save();

  for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
    index = keys[pnt_i];
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(
        this, xData[index] ,yData[index]
      );
    dot.call(this, coords.x, coords.y);
  }

  ctx.restore();
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

Dave_js.Cartesian.prototype.drawXTics = function drawXTics(varName) {
  var
    labels,// = (this.dataStore.getVar(varName) || {}).data,
    pnt_i, coords,
    ctx = this.ctx,
    chart = this.chart,
    chartWidth = +chart.width || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartWidth / labelWidth) >> 0,
    converter = Dave_js.Converters[varName] || Dave_js.Converters.default,
    stepSize;

  //if a labels array were passed in, calculate how many labels to skip per tic 
  //mark. If we dont have any labels, generate some from the axis range
  if (Array.isArray(labels)) {
    stepSize = (labels.length / numTics) || 1;
  } else {
    stepSize = 1;
    labels =
      Dave_js.Utils.createLabels(
        this.range.xMin,
        this.range.xMax,
        numTics,
        converter
      );
  }

  //draw xAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, chart.height);
  ctx.rotate(1.5 * Math.PI);

  for (pnt_i = 0; pnt_i <= numTics; pnt_i += stepSize) {
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, labels[pnt_i].value, 0);
    Dave_js.Utils.drawTic(ctx, labels[pnt_i].text, coords.x);
  }

  ctx.restore();
};

Dave_js.Cartesian.prototype.drawYTics = function drawYTics(varName) {
  var
    pnt_i, coords,
    labels,// = (this.dataStore.getVar(varName) || {}).data,
    ctx = this.ctx,
    chart = this.chart,
    chartHeight = +chart.height || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartHeight / labelWidth) >> 0,
    converter = Dave_js.Converters[varName] || Dave_js.Converters.default,
    stepSize;

  if (Array.isArray(labels)) {
    stepSize = (labels.length / numTics) || 1;
  } else {
    stepSize = 1;
    labels =
      Dave_js.Utils.createLabels(
        this.range.yMin,
        this.range.yMax,
        numTics,
        converter
      );
  }

  //draw yAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, 0);//chartHeight);
  for (pnt_i = 0; pnt_i <= numTics; pnt_i ++) {
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, 0, labels[pnt_i].value);

    Dave_js.Utils.drawTic(ctx, labels[pnt_i].text, coords.y);
  }

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

/*
Dave_js.Cartesian.prototype.mapPixels = function mapPixels(data){
  var
    chartRange = this.range,
    xMin = chartRange.xMin,
    xMax = chartRange.xMax,
    yMin = chartRange.yMin,
    yMax = chartRange.yMax,
    xVar, yVar;
  
  //make sure we have a minimum of plot info to move forward
  if(!data && isNaN(yMin + yMax)){
    console.log('Could not create pixel mappings.');
    return false;
  }
  data = data || {};

  yVar = this.dataStore.getVar(data.y) || {};
  xVar = this.dataStore.getVar(data.x) || {};

  //expand the range if needed
  if(!isNaN(+xVar.min)){
    xMin = Math.min(xVar.min, xMin || xVar.min);
  }
  if(!isNaN(+xVar.max)){
    xMax = Math.max(xVar.max, xMax || xVar.max);
  }
  if(!isNaN(+yVar.min)){
    yMin = Math.min(yVar.min, yMin || yVar.min);
  }
  if(!isNaN(+xVar.max)){
    yMax = Math.max(yVar.max, yMax || yVar.max);
  }

  //save the new range
  Dave_js.Cartesian.prototype.setAxisRange.call(this, {
    x: {min: xMin, max: xMax},
    y: {min: yMin, max: yMax}
  });

  
  return true;
};
*/