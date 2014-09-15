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
  var pnt_i, var_i, xSpacing, ySpacing, limits, coords, numPts;

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
  for(pnt_i = 0; pnt_i < numPts; pnt_i++){
    coords.x[pnt_i] *= xSpacing;
  }
  for(var_i = 0; var_i < coords.y.length; var_i++){
    for(pnt_i = 0; pnt_i < numPts; pnt_i++){
      coords.y[var_i][pnt_i] *= ySpacing;
    }
  }

  this.drawLines(coords);
  this.drawPoints(coords);
  
};

Dave_js.Cartesian.prototype.drawLines = function drawLines(xPix, yPix){
  var onPath = false;

  this.ctx.save();
  this.ctx.lineWidth = this.chart.sizes.lineWidth;

  //set colors for this plot
  this.ctx.fillStyle = this.colors.data[plt_i];
  this.ctx.strokeStyle = colors.data[plt_i];
  
  //move to the plot origin
  this.ctx.translate(0, this.chart.sizes.height);
  
  this.ctx.restore();
};

Dave_js.Cartesian.prototype.drawPoints = function drawPoints(xPix, yPix){
  this.ctx.save();

  this.ctx.translate(0, chart.sizes.height);

  this.ctx.restore();
};

Dave_js.Cartesian.prototype.mapXData = function mapXData(){
  //x-axis pixels are based on array index only
  var
    xMap = [],
    pnt_i;
    
  for(pnt_i = 0; pnt_i < this.numPts; pnt_i++){
    xMap.push(pnt_i * this.xSpacing);
  }

  return xMap;
};

Dave_js.Cartesian.prototype.mapYData = function mapYData(){
  var
    mappedVars = {},
    yData,
    var_i,
    pnt_i;

  for(var_i = 0; var_i < this.numVars; var_i++){
    //get a copy of the y axis data for this
    //variable during the selected range
    yData =
      (this.dataStore.getVarData(this.yVarNames[var_i]) || []).
      slice(this.start, (this.stop + 1));

    for(pnt_i = 0; pnt_i < this.numPts; pnt_i++){
      //pixel origin is at the upper left corner, so to get to the plot 
      //origin we need to start at chartMin
      yData[pnt_i] = (this.chartMin - yData[pnt_i]) * this.ySpacing;
    }

    mappedVars[this.yVarNames[var_i]] = yData;
  }

  return mappedVars;
};



    
    for (plt_i = 0; plt_i < numDepVars; plt_i++) {
      //cache the data set for this plot
      y_data = pixelData.dependent[depVarNames[plt_i]] || [];

      
      //initial point height.
      //heights must be negative to move up in the plot
      //y = y_data[range_start];
      y = y_data[0];
      x = x_data[0];
      
      //if we are drawing a line, set the line origin and start the line
      if (flags.lines) {
        if (isNaN(y)) {y = 0;}
        if (isNaN(x)) {x = 0;}
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
      
      //if we are drawing points, plot the initial point
      if (flags.points) {
        plotPnt(x, y);
      }
      
      //step through the data points
      for (var pnt_i = 1; pnt_i < pixelData.independent.length; pnt_i++) {
        //try to plot the point
        //make sure we have a numerical value to plot
        if (isNaN(y_data[pnt_i])) {continue;}
        
        //figure out current pixel location
        y = y_data[pnt_i];
        x = x_data[pnt_i];
        if (flags.lines) {ctx.lineTo(x, y);}
        if (flags.points) {plotPnt(x, y);}
      }

      if (flags.lines) {ctx.stroke();}

      //draw legend
      if (flags.legend) {
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
    }

    //return to the canvas origin
    ctx.translate(0, -1 * chart.sizes.height);
