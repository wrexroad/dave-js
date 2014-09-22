Dave_js.Cartesian = function Cartesian(owner){
  //override any functions in Plot.js that are set here
  if(!owner){return;}
  for(var i in this){
    owner[i] = this[i];
  }
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
  ranged = Dave_js.Utils.autoRange({
    data: this.data.x,
    min: chart.limits.xmin,
    max: chart.limits.xmax
  });
  this.range = {
    xMin: ranged.min,
    xMax: ranged.max
  };

  for(var_i = 0; var_i < numVars; var_i++){
    ranged = Dave_js.Utils.autoRange({
      data: this.data.y[var_i],
      min: chart.limits.ymin,
      max: chart.limits.ymax
    });

    this.range.yMin = Math.min(ranged.min, (this.range.yMin || ranged.min));
    this.range.yMax = Math.max(ranged.max, (this.range.yMax || ranged.min));

  }

  //calculate the pixel conversion factor
  this.spacing = {
    x: chart.sizes.width / (this.range.xMax - this.range.xMin),
    y: chart.sizes.height / (this.range.yMax - this.range.yMin)
  };
};

Dave_js.Cartesian.prototype.getCoords = function getCoords(x, y) {
  //console.log(x,this.range.xMin,this.spacing.x);
  //console.log(this.range.yMax, y, this.spacing.y);
  return {
    x: (x - this.range.xMin) * this.spacing.x,
    y: (this.range.yMax - y) * this.spacing.y
  };
};

Dave_js.Cartesian.prototype.decorate = function decorate(labels) {
  //draw background and border
  if (this.chart.bgImg) {
    this.ctx.drawImage( this.chart.bgImg, 0, 0 );
  } else {
    this.ctx.fillStyle = this.chart.colors.bgColor;
    this.ctx.fillRect( 0, 0, this.chart.sizes.width, this.chart.sizes.height );
  }
  this.ctx.strokeStyle = this.chart.colors.borderColor;
  this.ctx.strokeRect(0, 0, this.chart.sizes.width, this.chart.sizes.height);

  //print title (bold)
  if (this.chart.flags.title) {
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = this.chart.colors.text;
    this.ctx.font = "bold " + this.chart.cssFont;
    this.ctx.fillText(
      this.chart.labels.title,
      (this.chart.sizes.width / 2), -5
    );
  }
  
  //print axis labels
  if (this.chart.flags.axis) {
    this.ctx.font = this.chart.cssFont;
    this.ctx.fillStyle = this.chart.colors.text;
    this.ctx.textAlign = "start";
    this.ctx.fillText(
      this.chart.labels.indep,
       -50, (this.chart.sizes.height + 40)
    );
    this.ctx.save();
    this.ctx.translate(-45, (this.chart.sizes.height / 2) );
    this.ctx.rotate(1.5 * Math.PI);
    this.ctx.textAlign = "center";
    this.ctx.fillText(this.chart.labels.dep, 0, -20);
    this.ctx.restore();
  }

  Dave_js.Cartesian.prototype.callYTics.apply(this, null);
  Dave_js.Cartesian.prototype.callXTics.apply(this, null);
};

Dave_js.Cartesian.prototype.plotData = function plotData() {
  var
    chart = this.chart,
    ctx = this.ctx,
    numVars = this.vars.y.length,
    pnt_i, var_i, limits, numPts, pnts, dot;

  //move to the plot origin
  ctx.save();
  //ctx.translate(0, chart.sizes.height);

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
    ticLabel, pnt_i, var_i, coords,
    ctx = this.ctx,
    dataStore = this.dataStore,
    vars = this.vars,
    sizes = this.chart.sizes,
    chartWidth = +sizes.width || 0,
    labelWidth = parseInt(ctx.font, 10) * 1.5,
    numTics = (chartWidth / labelWidth) >> 0,
    skipTics = Math.ceil(numTics / numTics),
    data = dataStore.getVarData(vars.x).slice(),
    labels = Dave_js.Utils.rangeToArray(
      Math.min.apply(null, data),
      Math.max.apply(null, data),
      numTics
    );

  //draw xAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, sizes.height);
  ctx.rotate(1.5 * Math.PI);

  for (pnt_i = 0; pnt_i < numTics; pnt_i += skipTics) {
    ticLabel = labels[pnt_i];
    
    coords =
      Dave_js.Cartesian.prototype.getCoords.call(this, labels[pnt_i], 0);
    Dave_js.Utils.drawTic(ctx, ticLabel, coords.x);
  }

  ctx.restore();
};

Dave_js.Cartesian.prototype.callYTics = function callYTics() {
  var
    ticLabel, pnt_i, var_i, coords, labels, data,
    vars = this.vars,
    ctx = this.ctx,
    dataStore = this.dataStore,
    chartHeight = +this.chart.sizes.height || 0,
    labelWidth = parseInt(ctx.font, 10) * 1.5,
    numTics = (chartHeight / labelWidth) >> 0,
    skipTics = Math.ceil(numTics / numTics);

  data = [];
  for(var_i = 0; var_i < vars.y.length; var_i++){
    data = data.concat(dataStore.getVarData(vars.y[var_i]));
  }

  labels = Dave_js.Utils.rangeToArray(
    Math.min.apply(null, data),
    Math.max.apply(null, data),
    numTics
  );

  //draw yAxis tic marks and labels
  ctx.save();
  ctx.textAlign = "end";
  ctx.translate(0, 0);//this.chart.sizes.height);
  for (pnt_i = 0; pnt_i < numTics; pnt_i += skipTics) {
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
