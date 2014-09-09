Dave_js.LinePlot = function LinePlot(dataStore, vars, chart){
  var
    xSpacing, ySpacing, yVarNames, numVars, start, stop;

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
    ((dataStore.getVarData(vars.independent) || []).length - 1);

  //get info about the y variables we are going to plot
  yVarNames = vars.dependent || [];
  numVars = depVars.length;
  
  //figure out the value to pixel conversion
  xSpacing = (chart.sizes.width / (stop - start + 1)) >> 0;
  ySpacing = (chart.sizes.height / (chart.limits.max - chart.limits.min)) >> 0;
  
  //calculate the pixel maping
  return {

    //x-axis pixels are based on array index only
    independent: (function independentVarMap(){
      var
        xMap = [],
        pnt_i;

      for(pnt_i = start; pnt_i <= stop; pnt_i++){
        xMap.push(pnt_i * xSpacing);
      }
    }()),

    //y-axis pixels are based on line height
    dependent: (function dependentVarMap(){
      var
        mappedVars = {},
        yData,
        var_i,
        pnt_i;

      for(var_i in yVarNames){
        if(yVarNames.hasOwnProperty(var_i)){
          yData = dataStore.getVarData(var_i) || [];

          for(pnt_i = start; pnt_i <= stop; pnt_i++){
            mappedVars[var_i][pnt_i] = yData[pnt_i] * ySpacing;
          }
        }
      }

      return mappedVars;
    }())
  };
};