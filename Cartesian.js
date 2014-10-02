Dave_js.Cartesian = function Cartesian(owner){
  //override any functions in Plot.js that are set here
  if(!owner){return;}
  for(var i in this){
    owner[i] = this[i];
  }

  owner.range = {
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null
  };
};

Dave_js.Cartesian.prototype.loadData = function loadData(vars) {
  var
    chart = this.chart,
    dataStore = this.dataStore,
    ranged, numPts, pnt_i, numVars, var_i, pnts;

  if(!vars){
    console.log('Could not load data into plot, no variables set.');
    return;
  }

  this.vars = vars;

  //y variables are expected to be listed in an array
  if(!vars.y){
    console.log('No y-axis variables set for plot.');
    return;
  }
  vars.y = [].concat(vars.y);
  numVars = vars.y.length;

  //get the data that is to be plotted
  this.data = {y:[], x:[]};
  for (var_i = 0; var_i < numVars; var_i++) {
    this.data.y[var_i] = dataStore.getVar(vars.y[var_i]);
  }
  this.data.x = dataStore.getVar(vars.x);
};

Dave_js.Cartesian.prototype.mapPixels = function mapPixels(data){
  var
    newRange,
    chartRange = this.range,
    xMin = chartRange.xMin,
    xMax = chartRange.xMax,
    yMin = chartRange.yMin,
    yMax = chartRange.yMax,
    xVar, yVar;
  
  //make sure that we have either a range preset or some data from which we can 
  //create a range
  if(!data && !(xMin && xMax && yMin && yMax)){
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

  //calculate the pixel conversion factor
  this.spacing = {
    x: this.chart.width / (xMax - xMin),
    y: this.chart.height / (yMax - yMin)
  };

  this.chart.flags.hasPixelConversion = true;
  return true;
};

Dave_js.Cartesian.prototype.getCoords = function getCoords(x, y) {
  return {
    x: (x - this.range.xMin) * this.spacing.x,
    y: (this.range.yMax - y) * this.spacing.y
  };
};

Dave_js.Cartesian.prototype.drawGrid = function drawGrid(labels){
  labels = labels || {};

  Dave_js.Cartesian.prototype.drawXTics.call(this, labels.x);
  Dave_js.Cartesian.prototype.drawYTics.call(this, labels.y);
};

Dave_js.Cartesian.prototype.labelAxes = function labelAxes(labels){
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
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(data) {
  var
    ctx = this.ctx,
    x = this.dataStore.getVarData(data.vars.x),
    y = this.dataStore.getVarData(data.vars.y),
    color = data.color || 'black',
    brushWidth = +data.brushWidth || 2,
    onPath = false,
    coords, pnt_i;

  ctx.save();

  ctx.lineWidth = brushWidth;

  //set colors for this plot
  color = color || 'black';
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  
  for(pnt_i = 0; pnt_i < x.length; pnt_i++){
    //if we hit a data gap, end the current path
    if (isNaN(y[pnt_i])) {
      ctx.stroke();
      onPath = false;
    } else {
      //convert the data point to pixel coordinates
      coords =
        Dave_js.Cartesian.prototype.getCoords.call(this, x[pnt_i], y[pnt_i]);

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
    x = this.dataStore.getVarData(data.vars.x),
    y = this.dataStore.getVarData(data.vars.y),
    color = data.color || 'black',
    brushWidth = +data.brushWidth || 2,
    dot =
      (typeof data.dot == 'function' ?
       dot :
       Dave_js.Utils.squareDotFactory({color: color, width: brushWidth})
      ),
    coords, pnt_i;

  ctx.save();

  for (pnt_i = 0; pnt_i < x.length; pnt_i++) {
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, x[pnt_i], y[pnt_i]);
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

Dave_js.Cartesian.prototype.drawXTics = function drawXTics(labels) {
  var
    pnt_i, coords,
    ctx = this.ctx,
    chart = this.chart,
    chartWidth = +chart.width || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartWidth / labelWidth) >> 0,
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
        numTics
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

Dave_js.Cartesian.prototype.drawYTics = function drawYTics(labels) {
  var
    pnt_i, coords,
    ctx = this.ctx,
    chart = this.chart,
    chartHeight = +chart.height || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartHeight / labelWidth) >> 0,
    stepSize;

  if (Array.isArray(labels)) {
    stepSize = (labels.length / numTics) || 1;
  } else {
    stepSize = 1;
    labels =
      Dave_js.Utils.createLabels(
        this.range.yMin,
        this.range.yMax,
        numTics
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
    y = range.y || {};

  this.range.xMin = x.min || this.range.xMin || 0;
  this.range.xMax = x.max || this.range.xMax || 0;
  this.range.yMin = y.min || this.range.yMin || 0;
  this.range.yMax = y.max || this.range.yMax || 0;
};