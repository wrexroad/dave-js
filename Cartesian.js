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

  //create a copy of the data that is to be plotted
  this.data = {y:[], x:[]};
  for (var_i = 0; var_i < numVars; var_i++) {
    this.data.y[var_i] =
      (dataStore.getVarData(vars.y[var_i]) || []).slice(0);
  }
  
  //make sure all the y variables are the same length
  numPts = this.data.y[0].length || 0;
  for(var_i = 0; var_i < numVars; var_i++){
    if(numPts && numPts != this.data.y[var_i].length){
      console.log('Found y-axis variables with different lengths.');
      console.log('\t' + vars.y[var_i] + ': ' + this.data.y[var_i].length);
      console.log('\t' + vars.y[var_i] + ': ' + numPts);
      return;
    }
    
    numPts = this.data.y[var_i].length;
  }

  //if the x variable has not been set, create an array of indicies the 
  //same length as the first y variable data
  if ((this.data.x = dataStore.getVarData(vars.x)) === null) {
    for (pnt_i = 0; pnt_i < numPts; pnt_i++) {
      this.data.x[pnt_i] = pnt_i;
    }
  } else {
    //we were able to get a reference to the x variable data, so make a new copy
    this.data.x = this.data.x.slice(0);
  }

  //range the data

  this.range = {
    xMin: ranged.min,
    xMax: ranged.max
  };

};

Dave_js.Cartesian.prototype.mapPixels = function mapPixels(data){
  var ranged;

  //get the min and max values for each axis
  ranged = Dave_js.Utils.autoRange({
    data: this.dataStore.getVarData(data.x),
    min: this.chart.limits.xmin,
    max: this.chart.limits.xmax
  });
  this.range.xMin = Math.min(ranged.min, (this.range.xMin || ranged.min));
  this.range.xMax = Math.max(ranged.max, (this.range.xMax || ranged.min));

  ranged = Dave_js.Utils.autoRange({
    data: this.dataStore.getVarData(data.y),
    min: this.chart.limits.ymin,
    max: this.chart.limits.ymax
  });
  this.range.yMin = Math.min(ranged.min, (this.range.yMin || ranged.min));
  this.range.yMax = Math.max(ranged.max, (this.range.yMax || ranged.min));
  
  //calculate the pixel conversion factor
  this.spacing = {
    x: this.chart.width / (this.range.xMax - this.range.xMin),
    y: this.chart.height / (this.range.yMax - this.range.yMin)
  };

  this.chart.flags.hasPixelConversion = true;
};

Dave_js.Cartesian.prototype.getCoords = function getCoords(x, y) {
  //console.log(x,this.range.xMin,this.spacing.x);
  //console.log(this.range.yMax, y, this.spacing.y);
  return {
    x: (x - this.range.xMin) * this.spacing.x,
    y: (this.range.yMax - y) * this.spacing.y
  };
};

Dave_js.Cartesian.prototype.drawGrid = function drawGrid(dataVars){
  if(!dataVars){return;}

  Dave_js.Cartesian.prototype.drawXTics.call(
    this, this.dataStore.getVarData(dataVars.x).slice()
  );
  Dave_js.Cartesian.prototype.drawYTics.call(
    this, this.dataStore.getVarData(dataVars.y).slice()
  );
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

Dave_js.Cartesian.prototype.plotData = function plotData() {
  var
    chart = this.chart,
    ctx = this.ctx,
    numVars = this.vars.y.length,
    pnt_i, var_i, limits, numPts, pnts, dot;

  //move to the plot origin
  ctx.save();
  //ctx.translate(0, chart.height);

  //draw all the lines
  for(var_i = 0; var_i < numVars; var_i++){
    Dave_js.Cartesian.prototype.drawLines.call(
      this,
      this.data.x,
      this.data.y[var_i],
      chart.colors.data[var_i]
    );
  }

  //draw all the points
  for(var_i = 0; var_i < numVars; var_i++){
    //define what the points will look like
    dot = Dave_js.Cartesian.prototype.squareDotFactory({
      color: chart.colors.data[var_i], width: '2', ctx: ctx
    });

    Dave_js.Cartesian.prototype.drawPoints.call(
      this, this.data.x, this.data.y[var_i], dot
    );
  }

  //restore the context to the pre-plotting state
  ctx.restore();
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(x, y, color) {
  var
    ctx = this.ctx,
    onPath = false,
    coords,
    pnt_i;

  ctx.save();

  ctx.lineWidth = this.chart.sizes.lineWidth;

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

Dave_js.Cartesian.prototype.drawPoints = function drawPoints(x, y, dot) {
  var
    ctx = this.ctx,
    coords, pnt_i;

  ctx.save();

  //make sure the dot function is set
  if (typeof dot != 'function') {
    dot = Dave_js.Cartesian.squareDotFactory({color: color, width: 2});
  }

  for (pnt_i = 0; pnt_i < x.length; pnt_i++) {
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, x[pnt_i], y[pnt_i]);
    dot(coords.x, coords.y);
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

Dave_js.Cartesian.prototype.squareDotFactory = function squareDotFactory(opts) {
  //set defaults for missing options
  opts = opts || {};
  var
    color = opts.color || 'black',
    width = +opts.width || 2,
    halfWidth = Math.min((width / 2), 1),
    ctx = opts.ctx;

    /*a possible better way of choosing point size
    //take a best guess at point size
    this.setPointSize(
      parseInt((this.chart.sizes.width / this.chart.range.numOfPts / 2), 10)
    );

    //make sure the point is between 2 and 8
    this.setPointSize(
      Math.max(1, Math.min(8, this.chart.sizes.pointSize))
    );
    */

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

Dave_js.Cartesian.prototype.drawXTics = function drawXTics(data) {
  var
    ticLabel, pnt_i, coords,
    ctx = this.ctx,
    chart = this.chart,
    chartWidth = +chart.width || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartWidth / labelWidth) >> 0,
    labels = Dave_js.Utils.rangeToArray(
      Math.min.apply(null, data),
      Math.max.apply(null, data),
      numTics
    );

  //draw xAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, chart.height);
  ctx.rotate(1.5 * Math.PI);

  for (pnt_i = 0; pnt_i < numTics; pnt_i ++) {
    ticLabel = labels[pnt_i];
    
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, labels[pnt_i], 0);
    Dave_js.Utils.drawTic(ctx, ticLabel, coords.x);
  }

  ctx.restore();
};

Dave_js.Cartesian.prototype.drawYTics = function drawYTics(data) {
  var
    ticLabel, pnt_i, coords,
    ctx = this.ctx,
    chart = this.chart,
    chartHeight = +chart.height || 0,
    labelWidth = (parseInt(ctx.font, 10) * 1.5) || 25,
    numTics = (chartHeight / labelWidth) >> 0,
    labels = Dave_js.Utils.rangeToArray(
      Math.min.apply(null, data),
      Math.max.apply(null, data),
      numTics
    );

  //draw yAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, 0);//chartHeight);
  for (pnt_i = 0; pnt_i < numTics; pnt_i ++) {
    ticLabel = +labels[pnt_i];
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, 0, ticLabel);

    Dave_js.Utils.drawTic(ctx, ticLabel, coords.y);
  }

  ctx.restore();
};

Dave_js.Cartesian.prototype.setDataRange = function setDataRange(start, stop) {
  var
    xData = this.dataStore.getVarData(this.vars.indep) || [],
    xLength = xData.length;

  //make sure the index range is within the data set and save it
  this.chart.range.start = Math.max(start, 0);
  this.chart.range.stop = Math.min(stop, xLength - 1);
 
  //figure out how manys data points we have
  this.chart.range.numOfPts = this.chart.range.stop - this.chart.range.start + 1;
};
