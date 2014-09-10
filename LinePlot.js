Dave_js.LinePlot = function LinePlot(dataStore, vars, chart){
  var
    xSpacing, ySpacing, yVarNames, numVars, numPts, start, stop, chartMin, chartMax;

  //make sure we actually have some variables defined
  if (!vars) {
    console.log('No variables names set. Can not calculate pixel map.');
    return null;
  }
  if (!dataStore || typeof dataStore.getVarData !== 'function') {
    console.log('No data store set. Can not calcualte pixel map.');
    return null;
  }

  //get the subset of data points we are using from the chart.range object
  //if it is not set, use the full data set
  start =
    chart.range.start || 0;
  stop =
    chart.range.stop ||
    ((dataStore.getVarData(vars.indep) || []).length - 1);

  //get info about the y variables we are going to plot
  yVarNames = vars.deps || [];
  numVars = yVarNames.length;
  numPts = stop - start + 1;
  
  //get the min and max values that will be plotted
  chartMin = chart.limits.min;
  chartMax = chart.limits.max;

  //figure out the value to pixel conversion
  xSpacing = chart.sizes.width / (numPts - 1);
  ySpacing = chart.sizes.height / (chartMax - chartMin);
  
  //calculate the pixel maping
  return {
    //x-axis pixels are based on array index only
    independent: (function independentVarMap(){
      var
        xMap = [],
        pnt_i;
      
      for(pnt_i = 0; pnt_i < numPts; pnt_i++){
        xMap.push(pnt_i * xSpacing);
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

      for(var_i = 0; var_i < numVars; var_i++){
        //get a copy of the y axis data for this
        //variable during the selected range
        yData =
          (dataStore.getVarData(yVarNames[var_i]) || []).
          slice(start, (stop + 1));

        for(pnt_i = 0; pnt_i < numPts; pnt_i++){
          //pixel origin is at the upper left corner, so to get to the plot 
          //origin we need to start at chartMin
          yData[pnt_i] = (chartMin - yData[pnt_i]) * ySpacing;
        }

        mappedVars[yVarNames[var_i]] = yData;
      }

      return mappedVars;
    }())
  };
};