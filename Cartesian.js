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

Dave_js.Cartesian.prototype.decorate = function decorate(labels){


};

Dave_js.Cartesian.prototype.plot = function plot(vars){
  var pnt_i, var_i, xSpacing, ySpacing, limits, coords, numPts, pnts;

  if(!vars){
    console.log("Plot variables not set!");
    return;
  }

  //y variables are expected to be listed in an array
  vars.y = [].concat(vars.y);

  //create a copy of the data that is to be plotted
  coords = {};
  for (var_i = 0; var_i < vars.y.length; var_i++) {
    coords.y[var_i] = (dataStore.getVarData(vars.y[var_i]) || []).slice(0);
  }

  if ((coords.x = dataStore.getVarData(vars.x)) === null){
    //if the x variable has not been set, create an array of indicies the 
    //same length as the first y variable data
    numPts = coords.y[0].length;
    
    for(pnt_i = 0; pnt_i < numPts; pnt_i++){
      coords.x[pnt_i] = pnt_i;
    }
  } else {
    //we were able to get a reference to the x variable data, so make a new copy
    coords.x = coords.x.slice(0);
  }

  //figure out the plot limits
  limits = {
    xMin : chart.limits.xmin || Math.min.apply(null, vars.x),
    xMax : chart.limits.xmax || Math.max.apply(null, vars.x),
    yMin : chart.limits.ymin,
    yMax : chart.limits.ymax
  };

  //calculate the pixel conversion factor
  xSpacing =
    this.chart.sizes.width / (limits.xMax - limits.xMin);
  ySpacing =
    this.chart.sizes.height / (limits.yMax - limits.yMin);
  
  //convert all data points to coordinates
  pnts = coords.x;
  for(pnt_i = 0; pnt_i < numPts; pnt_i++){
    pnts[pnt_i] *= xSpacing;
  }
  for(var_i = 0; var_i < coords.y.length; var_i++){
    pnts = coords.y[var_i];
    for(pnt_i = 0; pnt_i < numPts; pnt_i++){
      pnts[pnt_i] = (limits.yMax - pnts[pnt_i]) * ySpacing;
    }
  }

  this.drawLines(coords, this.chart.colors.data[var_i]);
  this.drawPoints(
    coords, Dave_js.Cartesian.prototype.dotFactory(10), chart.colors.data[var_i]
  );
  
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(coords, color){
  var
    onPath = false,
    numPts, pnt_i, xCoords, yCoords;

  this.ctx.save();

  this.ctx.lineWidth = this.chart.sizes.lineWidth;

  //set colors for this plot
  color = color || 'black';
  this.ctx.fillStyle = color;
  this.ctx.strokeStyle = color;
  
  //move to the plot origin
  this.ctx.translate(0, this.chart.sizes.height);

  numPts = coords.x.length;
  xCoords = coords.x;
  yCoords = coords.y;
  for(pnt_i = 0; pnt_i < numPts; pnt_i++){
    //if we hit a data gap, end the current path
    if(!yCoords[pnt_i]){
      this.ctx.stroke();
      onPath = false;
    } else {

      //make sure we have a current path
      if (!onPath) {
        this.ctx.beginPath();
        onPath = true;
      }
      
      this.ctx.moveTo(xCoords[pnt_i], yCoords[pnt_i]);
    }
  }

  this.ctx.stroke();
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawPoints=function drawPoints(coords, dot, color){
  var
    numPts, pnt_i, xCoords, yCoords;

  this.ctx.save();

  //set colors for this plot
  color = color || 'black';
  this.ctx.fillStyle = color;
  this.ctx.strokeStyle = color;

  numPts = coords.x.length;
  xCoords = coords.x;
  yCoords = coords.y;
  for(pnt_i = 0; pnt_i < numPts; pnt_i++){
    dot(xCoords, yCoords);
  }

  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawLegend = function drawPoints(){
  var var_i;

  this.ctx.save();
  
  for(var_i = 0; var_i < vars.y; var_i++){
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

Dave_js.Cartesian.prototype.squareDotFactory = function squareDotFactory(opts){
  //set defaults for missing options
  opts = opts || {};
  opts.color = opts.color || 'black';
  opts.width = +opts.width || 2;
  opts.halfWidth = opts.width / 2;

  return function dot(x, y) {
    var
      pointSize = opts.width;
      halfPointSize = pointsSize / 2;

    ctx.fillRect(
      x - halfPointSize, y - halfPointSize, pointSize, pointSize
    );
  };
};