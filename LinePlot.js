if(!Dave_js.Plotter){Dave_js.Plotter = {};}

Dave_js.Plotter.LinePlot = function LinePlot(dataStore, vars, chart){

  //make sure we actually have some variables defined
  if (!vars) {
    console.log('No variables names set. Can not calculate pixel map.');
    return null;
  } else {
    this.vars = vars;
  }
  if (!dataStore || typeof dataStore.getVarData !== 'function') {
    console.log('No data store set. Can not calcualte pixel map.');
    return null;
  } else {
    this.dataStore = dataStore;
  }

  //get the subset of data points we are using from the chart.range object
  //if it is not set, use the full data set
  this.start =
    chart.range.start || 0;
  this.stop =
    chart.range.stop ||
    ((dataStore.getVarData(vars.indep) || []).length - 1);

  //get info about the y variables we are going to plot
  this.yVarNames = vars.deps || [];
  this.numVars = this.yVarNames.length;
  this.numPts = this.stop - this.start + 1;
  console.log(this, this.numPts);
  //get the min and max values that will be plotted
  this.chartMin = chart.limits.min;
  this.chartMax = chart.limits.max;

  //figure out the value to pixel conversion
  this.xSpacing = chart.sizes.width / (this.numPts - 1);
  this.ySpacing = chart.sizes.height / (this.chartMax - this.chartMin);

};

Dave_js.Plotters.LinePlot.prototype.decorate = function decorate(){


};

Dave_js.Plotters.LinePlot.prototype.getPixelMap = function getPixelMap(){
  return {
    //x-axis pixels are based on array index only
    independent: (function independentVarMap(){
      var
        xMap = [],
        pnt_i;
      
      for(pnt_i = 0; pnt_i < this.numPts; pnt_i++){
        xMap.push(pnt_i * this.xSpacing);
      }

      return xMap;
    }()),

    //y-axis pixels are based on line height
    dependent: (function dependentVarMap(){
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
    }())
  };
};