Dave_js.chart = function(name) {
  var self = this;

  //////////////////////////Private Members////////////////////////////// 

  //keeps track of current index of the data point closest to the mouse
  var coord_i = 0;
  
  //contains all of the canvas attributes the user will set
  var chart = {
    //canvas id based on the user specified name
    id : name + "-canvas",
    
    //Type of chart to be drawn. 
    //Options are xy (lines and or points), polar, hist
    type : "",
    
    //default canvas size
    sizes : {
      canvas : {
        //drawable area height and width
        width : 0,
        height : 0,
        //margin between canvas edge and ploting region 
        //(used for titels, labels, etc...)
        margin : 200
      },

      //chart height and width or radius
      width : 0,
      height : 0,
      radius : 0,
      
      lineWidth : 3,
      pointSize : 6,
      halfPointSize : 3,
    },

    //default x and y origins for the canvas coordinate system   
    origin : { x : 60, y : 20},
    totalOffsetX : 0,
    totalOffsetY : 0,
    
    //the id attribute for an image tag on the 
    //page which contains the desired background
    bgImg : undefined,
    
    //settings for chart text
    cssFont : '14px sans-serif',
    labels : {
      title : "",
      indep : "",
      dep : ""
    },
    
    //Default number of y tics to skip
    skipTics : {dep : 1, indep : 1 },
    
    //number of pixels per point in each dimension
    pntSpacing : {dep : 1, indep : 1},
    
    //min and max values for dependent variables
    limits : {min : 0, max : 0},
    
    //default settings for plot scale
    scale : {"type" : "lin", "value" : 1},
    
    //histogram bar width plus margin
    histBarTotal : undefined,
    histBarWidth : undefined,
    histBarMargin : undefined,
    
    //default 90% histogram bar width
    histBarRatio : 0.9,
    
    //direction of increasing angles in polar plots
    // -1 = anticlockwise; 1 = clockwise
    polarRot : -1,
    
    //where 0 degrees is located on the polar plot
    zeroAngle : 0,

    //define plot range
    range: {
      "start" : Number.NEGATIVE_INFINITY,
      "stop" : Number.POSITIVE_INFINITY,
      "numOfPts" : 0
    }
  };

  //holds all of the info for the coordinat display
  var coordDisp = {
    xId : undefined,
    yId : undefined,
    oldIndex : 0,
    index : 0
  };
 
  //holds the different colors used for in the plot
  var colors = {
    // default colors
    activePoint : "#00FF00",
    text : "black",
    grid : "gray",
    data : ['Red','Blue','Green', 'Yellow'],
    borderColor : '#000000',
    bgColor : '#CCCCCC',
  };

  //canvas context used for drawing
  var ctx = null;
   
  //contains all of the page elements that the plotter will use
  var elms = {
    //element reference for a div that will hold the canvas element. 
    //If not specified, canvas will be generated in the "body" tag.
    canvasBox : document.getElementsByTagName("body")[0],
    
    //element reference to the canvas we will draw to
    canvas : undefined,
    
    //divs to hold the pointer coordinats. 
    //Coord event listener will not be created without both of these
    xCoordBox : undefined,
    yCoordBox : undefined
  };

  //contains flags that may be set to govern the plotter's behavior
  var flags = {
    //set true if the data has been plotted once. 
    //Prevents scaling data multiple times
    replot : false,
    
    //set this to indicate a polar
    polar : false,
    
    //draw a bar from zero up to the point value
    hist : false,
    
    //rectangular box for an xy plot
    xy : false,
    
    //setting this true indicates we are drawing on top of an existing plot.
    //Frame, background, axis labels, tics, and limits are all skipped.
    subPlot : false,
    
    //setting this true will add an event listener to the plot 
    //so we can display exact mouseover plot values
    showCoords : true,
    
    //values will be connected with a line
    lines : false,
    
    //values will be represented by a point
    points : false,
   
    //the user sets a fixed point width
    fixedPtSize : false,
   
    //convert angular/radial values to longitude/lattitude
    map : false,
    
    //scale the data before plotting
    scaled : false,
    
    //false for fitting the y axis to the data, 
    //true to use pre defined axis limits
    limits : false,
    
    //draw a background grid (only for polar plots right now)
    grid : false,
    
    axis : false,
    
    title : false,
    
    //on xy plots this lists variable names in their color along the top, 
    //in polar plots, this draws a line from a colored variable name to 
    //the last drawn point
    legend : false,
    
    //makes plot zoomable by clicking and dragging over the desired area
    zoomable : true
  };

  var vars = {
    indep : "",
    deps : [],
    trackers : [],
    trackLabels : []
  };

  //Contains a reference to the data store we will be using
  var dataStore;

  //////////////////////////Private Methods//////////////////////////////

  //method to test the browser's ability to display HTML5 canvas
  function browserTest() {
    //set special values based on browser
    var userAgent=navigator.userAgent;
    if (userAgent.indexOf("MSIE") != -1) {
      if (parseInt(navigator.appVersion, 10) < 9) {
        alert(
          'Internet Explorer does not support HTML5 canvas. ' +
          'Please use Google Chrome, Firefox, Opera, or Safari'
        );
        return;
      }
    } else if(userAgent.indexOf("Firefox") != -1) {
      if (parseInt(navigator.appVersion, 10) < 3) {
        alert(
          "Firefox 3.0 or later required for proper display"
        );
      }
    }
  }

  // Add a new canvas to the "canvasBox" element, 
  // gets the canvas context, and draws a skeleton graph
  function buildCanvas() {
    var timer = (new Date()).getTime();

    //if this is not part of an existing plot, clear the canvas
    if(flags.subplot != 1) {
      //remove old canvas element
      if(elms.canvas) {
        elms.canvasBox.removeChild(elms.canvas);
        elms.canvas = null;
      }
      //create a canvas and insert it into the canvasBox
      elms.canvas = document.createElement("canvas");
      elms.canvas.id = chart.id;
      elms.canvas.width = chart.sizes.canvas.width;
      elms.canvas.height = chart.sizes.canvas.height;
      elms.canvasBox.appendChild(elms.canvas);
    }

    //initialize canvas context
    ctx = null;
    ctx = elms.canvas.getContext("2d");
    
    //move coord origin to the upper left corner of plot area
    ctx.translate(
      chart.origin.x, chart.origin.y
    );
    
    if (!flags.subplot) {
      //draw background and border
      if (chart.bgImg) {
        ctx.drawImage( chart.bgImg, 0, 0 );
      } else {
        ctx.fillStyle = colors.bgColor;
        ctx.fillRect( 0, 0, chart.sizes.width, chart.sizes.height );
      }

      ctx.strokeStyle = colors.borderColor;
      ctx.strokeRect(0, 0, chart.sizes.width, chart.sizes.height);
      
      //print title (bold)
      if (flags.title) {
        ctx.textAlign = "center";
        ctx.fillStyle = colors.text;
        ctx.font = "bold " + chart.cssFont;
        ctx.fillText(
          chart.labels.title,
          (chart.sizes.width / 2), -5
        );
      }
      
      //print axis labels
      if (flags.axis) {
        ctx.font = chart.cssFont;
        ctx.fillStyle = colors.text;
        ctx.textAlign = "start";
        ctx.fillText(
          chart.labels.indep,
           -50, (chart.sizes.height + 40)
        );
        ctx.save();
        ctx.translate(-45, (chart.sizes.height / 2) );
        ctx.rotate(1.5 * Math.PI);
        ctx.textAlign = "center";
        ctx.fillText(chart.labels.dep, 0, -20);
        ctx.restore();
      }
    }

    //add coordinate display if this is an xy plot and the coord flag is set
    if(flags.xy && flags.showCoords) {
      //create a message holder 
      elms.coordMsg = new Dave_js.message();
      elms.coordMsg.box.style.opacity = "0.8";
      elms.coordMsg.box.style.filter = "alpha(opacity=80)";
    }

    //add event listeners to display coordinates in the message holder
    elms.canvas.addEventListener("mouseover", canvasMouseIn);
    elms.canvasBox.addEventListener("mouseover", canvasMouseOut);

    timer = (new Date()).getTime() - timer;
    console.log("Canvas Build = " + timer / 1000);
  }

  function canvasMouseIn(e) {
    e.stopPropagation();
    
    //create zoom object if one does not yet exist
    if(Dave_js.chart_zoom && flags.zoomable) {
      if (!chart.zoom) {
        chart.zoom = new Dave_js.chart_zoom(self, dataStore, elms, chart);
      }
    }
    
    //add event listeners for tracking mouse pointer
    elms.canvasBox.addEventListener(
      "mousedown", mouseDown
    );
    elms.canvasBox.addEventListener(
      "mouseup", mouseUp
    );
    elms.canvasBox.addEventListener(
      "mousemove", mouseMove
    );
  }

  function canvasMouseOut(e) {
    //make sure the mouse out did not occur because of running over a mask
    if (e.target.className == "daveMask") {return;}
    
    //remove event listeners
    elms.canvasBox.removeEventListener(
      "mousedown", mouseDown
    );
    elms.canvasBox.removeEventListener(
      "mouseup", mouseUp
    );
    elms.canvasBox.removeEventListener(
      "mousemove", mouseMove
    );
    
    //remove the masking divs
    if (chart.zoom) {chart.zoom = chart.zoom.destroy();}
    
    //remove the coordinate message
    if (flags.showCoords && elms.coordMsg.box.parentNode) {
      elms.coordMsg.box.hidden = true;
    }
  }

  function mouseDown(e) {
    if(Dave_js.chart_zoom && flags.zoomable) { //stop tracking mouse
      //start tracking the mouse pointer
      chart.zoom.start(coord_i);
     }
   }

  function mouseUp(e) {
    if(Dave_js.chart_zoom && flags.zoomable) { //stop tracking mouse
      chart.zoom.stop(coord_i, e.pageX);
    }
  }

  function mouseMove(e) {
    var
      //x coordinate of cursor relative to canvas
      x = e.pageX - chart.origin.x - elms.canvasBox.offsetLeft,
      range = chart.range,
      indepVarData = dataStore.getVarData(vars.indep) || [],
      indepVarLength = indepVarData.length;
    
    //calculate the data point index we are closest to
    coord_i =
      Math.round(x * (range.numOfPts - 1) / chart.sizes.width) + range.start;
    
    //make sure the coord_i is within the data set
    coord_i = Math.min(coord_i, (indepVarLength - 1));
    coord_i = Math.max(coord_i, 0);

    if(Dave_js.message && flags.showCoords) {
      showCoord(coord_i, e.pageX, e.pageY);
    }

    if(Dave_js.chart_zoom && flags.zoomable) { //stop tracking mouse
      if(!chart.zoom) {

      }
      chart.zoom.moveMask(e.pageX);
    }
  }

  function showCoord(coord_i, x, y) {
    var
      indepVarData = dataStore.getVarData(vars.indep) || [],
      indepVarLength = indepVarData.length,
      depVarNames = vars.deps || [],
      numDepVars = vars.deps.length,
      scaleType = chart.scale.type,
      scaleValue = chart.scale.value,
      depVarData,
      depVarLength,
      message,
      yCoord,
      xCoord,
      plt_i,
      negOffset,
      taposOffset;
    
    //make sure the coordinate box is visible
    elms.coordMsg.box.hidden = false;
    
    //create message and show message if we are within the plot
    if((xCoord = indepVarData[coord_i]) === undefined){
      return;
    }

    message = chart.labels.indep + " = " + xCoord;

    for (plt_i = 0; plt_i < numDepVars; plt_i++) {
      depVarData = dataStore.getVarData(depVarNames[plt_i]);

      //make sure the yCoord is a number
      //try stepping backwards and forwards until a number is found ,
      //or the end of the dataset is reached
      negOffset = posOffset = coord_i;
      while (1) {
        //try to step back
        if (negOffset >= 0) {
          yCoord = depVarData[negOffset];
        }
        //try to step forward
        if (isNaN(yCoord) && posOffset < numDepVars) {
          yCoord = depVarData[posOffset];
        }
        //check to see if it is time to break
        if (!isNaN(yCoord) || (negOffset < 0 && posOffset > numDepVars)) {
          break;
        }

        negOffset--;
        posOffset++;
      }

      //unscale the yCoord if needed
      if (flags.scaled) {
        if (scaleType == "log") {
          yCoord = Math.pow(scaleValue, yCoord);
        } else if(scaleType == "lin") {
          yCoord /= scaleValue;
        }
      }
      
      //drop values past 3 decimal places
      if (((yCoord % 1) !== 0) && (typeof yCoord == "function")) {
        yCoord = yCoord.toFixed(3);
      }
      
      message += "<br />" + depVarNames[plt_i] + " = " + yCoord;
    }

    elms.coordMsg.showMessage(
      message, (x + 10), (y + 10)
    );
  }
   
  //Scales the data set by either a linear value or logrithmically 
  function scaler() {
    var
      indepVarData = dataStore.getVarData(vars.indep) || [],
      indepVarLength = indepVarData.length,
      depVarNames = vars.deps || [],
      numDepVars = vars.deps.length,
      message,
      timer = (new Date()).getTime(),
      scale_type = chart.scale.type,
      scale_val = chart.scale.value,
      plt_i,
      pnt_i,
      y_data;

    if (scale_type == "log") { //log plot
      for (plt_i = 0; plt_i < numDepVars; plt_i++) {
        y_data = dataStore.getVarData(dapVarNames[plt_i]);

        for (pnt_i = 0; pnt_i <= indepVarLength; pnt_i++) {
          if (y_data[pnt_i] !== 0 && !isNaN(y_data[pnt_i])) {
            y_data[pnt_i] =
            Math.log(y_data[pnt_i]) / Math.log(scale_val);
          }
        }
      }
    } else if (scale_type == "lin") { //linear plot
      for (plt_i = 0; plt_i < numDepVars; plt_i++) {
        y_data = dataStore.getVarData(dapVarNames[plt_i]);

        for (pnt_i = 0; pnt_i <= indepVarLength; pnt_i++) {
          if (!isNaN(y_data[pnt_i])) {
            y_data[pnt_i] *= scale_val;
          }
        }
      }
    }

    timer = (new Date()).getTime() - timer;
    console.log("Scale Data = " + timer / 1000);
  }

  //either apply limits to dependent data, or generate axis limits from it
  function doLimits() {
    var
      start = chart.range.start,
      stop = chart.range.stop,
      numOfPts = chart.range.numOfPts,
      timer = (new Date()).getTime(),
      indepVarData = dataStore.getVarData(vars.indep) || [],
      indepVarLength = indepVarData.length,
      depVarNames = vars.deps || [],
      numDepVars = vars.deps.length,
      depVarData,
      plt_i,
      pnt_i,
      minLimit,
      maxLimit,
      pltMax,
      pltMin;

    if (!flags.limits) {
      //user has not defined limits, so take the max and of the data set

      //create an array of max and mins for each subset
      pltMax = [];
      pltMin = [];

      for (plt_i = 0; plt_i < numDepVars; plt_i++) {
        depVarData = dataStore.getVarData(depVarNames[plt_i]);

        //find first real data point for initial min/max
        for (pnt_i = 0; pnt_i < numOfPts; pnt_i++) {
          if (!isNaN(depVarData[pnt_i + start])) {
            pltMin[plt_i] = pltMax[plt_i] =
              parseFloat(depVarData[pnt_i + start]);
            break;
          }
        }
         
        //go through the rest of the data points looking for min/max
        for (pnt_i; pnt_i < numOfPts; pnt_i++) {
          if (isNaN(depVarData[pnt_i + start])) {
            continue;
          }

          pltMin[plt_i] =
            Math.min(depVarData[pnt_i + start], pltMin[plt_i]);

          pltMax[plt_i] =
            Math.max(depVarData[pnt_i + start], pltMax[plt_i]);
        }
      }

      //select the extremes from the max and min arrays
      minLimit = Math.min.apply(null, pltMin);
      maxLimit = Math.max.apply(null, pltMax);
    } else {
      minLimit = +chart.limits.min || 0;
      maxLimit = +chart.limits.max || 0;

      //the user has predefined data limits, so apply to each subset
      for (plt_i = 0; plt_i < numDepVars; plt_i++) {
        depVarData = dataStore.getVarData(depVarNames[plt_i]);

        for (pnt_i = 0; pnt_i < numOfPts; pnt_i++) {
          depVarData[pnt_i] =
            Math.min( depVarData[pnt_i + start], maxLimit );

          depVarData[pnt_i] =
            Math.max( depVarData[pnt_i + start], minLimit );
        }
      }
    }

    //Make sure the ymax and min are not the same value
    if (minLimit == maxLimit) {
      minLimit -= chart.sizes.height / 2;
      maxLimit += chart.sizes.height / 2;
    }
    
    //if we have a log plot, make the y axis start and end at an integer 
    if (flags.scaled && chart.scale.type == "log") {
      minLimit = Math.floor(minLimit);
      maxLimit = Math.ceil(maxLimit);
    }
    
    chart.limits.min = minLimit;
    chart.limits.max = maxLimit;

    timer = (new Date()).getTime() - timer;
    console.log("Limits Calculated = " + timer / 1000);
  }

  function configSpacing() {
    var
      numOfPts = chart.range.numOfPts,
      depRange = Math.abs(chart.limits.max - chart.limits.min);

    chart.skipTics.indep =
    Math.max(1, parseInt((20 * numOfPts / chart.sizes.width), 10));
    
    chart.skipTics.dep =
    Math.max(1, parseInt((20 * depRange / chart.sizes.height), 10));
    
    if (flags.polar) {//polar plots only need spacing in the radial direction
      chart.pntSpacing.dep = chart.sizes.radius / chart.limits.max;
    } else { // all other plots are rectangular and need x/y spacing
      chart.pntSpacing.indep = chart.sizes.width / (numOfPts - 1);
      chart.pntSpacing.dep = chart.sizes.height / depRange;
    }
  }

  function callYTics() {
    var
      maxLimit = chart.limits.max,
      minLimit = chart.limits.min,
      skipTics = chart.skipTics.dep,
      spacing = chart.pntSpacing.dep,
      chartHeight = chart.sizes.height,
      scaleValue = chart.scale.value,
      scaleType = chart.scale.type,
      ticHeight,
      offset,
      ticLabel,
      i;

    //draw yAxis tic marks and labels
    ctx.textAlign = "end";
    for (i = minLimit; i <= maxLimit; i += skipTics) {
      ticHeight = i - minLimit;
      offset = chartHeight - (ticHeight * spacing);

      ticLabel = i;

      //unscale the y axis value if needed
      if(flags.scaled) {
        if(scaleType == "log") {
          ticLabel = Math.pow(scaleValue, ticLabel);
        } else if(scaleType == "lin") {
          ticLabel /= scaleValue;
        }
      }
       
      if (!isNaN(ticLabel) && (ticLabel % 1) !== 0) {
        ticLabel = ticLabel.toFixed(2);
      }
      
      drawTic(ticLabel, offset);
    }
  }

  function callXTics() {
    var
      indepVarData = dataStore.getVarData(vars.indep) || [],
      numOfPts = chart.range.numOfPts,
      start = chart.range.start,
      offset,
      ticLabel,
      spacing,
      textShift,
      pnt_i;

    if (flags.hist) {
      spacing =  chart.histBarTotal;
       
      //we need to shift the text lables a bit 
      //so they will line up with the bard
      textShift = 0.5;
    } else {
      spacing = chart.pntSpacing.indep;
      textShift = 0;
    }

    //draw xAxis tic marks and labels
    ctx.save();
    ctx.translate(0, chart.sizes.height);
    ctx.rotate(1.5 * Math.PI);
    
    for (pnt_i = 0; pnt_i < numOfPts; pnt_i += chart.skipTics.indep) {
      offset = (pnt_i * spacing) + textShift;
      ticLabel = indepVarData[pnt_i + start];

      //only draw the tic mark if it is defined
      if (ticLabel !== undefined) {drawTic(ticLabel, offset);}
    }
    ctx.restore();
  }

  function drawTic(ticLabel, offset) {
    if(ticLabel == "--") {ticLabel = "No Label";}
    ctx.fillText(ticLabel, -5, offset + 5);
    ctx.beginPath();
    ctx.moveTo(0, offset);
    ctx.lineTo(5, offset);
    ctx.stroke();
  }

  function drawLinesPoints() {
    var
      x = 0,
      y = 0, //screen coordinate for the plotted point
      timer = (new Date()).getTime(),
      legendOffset = 10,
      range_start = chart.range.start,
      chart_min = chart.limits.min,
      y_spacing = chart.pntSpacing.dep,
      x_spacing = chart.pntSpacing.indep,
      x_data = dataStore.getVarData(vars.indep) || [],
      depVarNames = vars.deps || [],
      numDepVars = depVarNames.length,
      numOfPts = chart.range.numOfPts,
      y_data,
      plt_i,
      pixelData = new Dave_js.LinePlot(dataStore, vars, chart);

    //move to the plot origin
    ctx.translate(0, chart.sizes.height);

    ctx.lineWidth = chart.sizes.lineWidth;
    for (plt_i = 0; plt_i < numDepVars; plt_i++) {
      //cache the data set for this plot
      y_data = pixelData.dependent[depVarNames[plt_i]] || [];

      //set colors for this plot
      ctx.fillStyle = colors.data[plt_i];
      ctx.strokeStyle = colors.data[plt_i];
      
      //initial point height.
      //heights must be negative to move up in the plot
      y = y_data[range_start];

      //if we are drawing a line, set the line origin and start the line
      if (flags.lines) {
        if (isNaN(y)) {y = 0;}
        ctx.beginPath();
        ctx.moveTo(0, y);
      }
      
      //if we are drawing points, plot the initial point
      if (flags.points) {
        plotPnt(0, y);
      }
      
      //step through the data points
      for (var pnt_i = 1; pnt_i < numOfPts; pnt_i++) {
        //try to plot the point
        //make sure we have a numerical value to plot
        if (isNaN(y_data[pnt_i + range_start])) {continue;}
        
        //figure out current pixel location
        y = y_data[pnt_i + range_start];
        x = pixelData.independent[pnt_i];
        
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

    timer = (new Date()).getTime() - timer;
    console.log("Draw Time = " + timer / 1000);
  }

  function plotPnt(x, y) {
    var
      pointSize = chart.sizes.pointSize,
      halfPointSize = chart.sizes.halfPointSize;

    ctx.fillRect(
      x - halfPointSize, y - halfPointSize, pointSize, pointSize
    );
  }

  function configHistBars() {
    var
      numOfPts = (dataStore.getVarData(vars.indep) || []).length;

    //figure out total possible bar size
    chart.histBarTotal =
      parseInt((chart.sizes.width / numOfPts), 10);
    
    if (chart.histBarTotal < 1) {
      chart.histBarTotal = 1;
      chart.histBarWidth = 1;
      chart.histBarMargin = 0;
    } else {
      chart.histBarWidth =
        parseInt((chart.histBarTotal * chart.histBarRatio), 10);
      chart.histBarMargin =
        chart.histBarTotal - chart.histBarWidth;
    }
  }

  function drawHistBars() {
    var
      numOfPts = chart.range.numOfPts,
      start = chart.range.start,
      depVarNames = vars.deps || [],
      numDepVars = depVarNames.length,
      spacing = chart.pntSpacing.dep,
      minLimit = chart.limits.min,
      chartHeight = chart.sizes.height,
      depVarData,
      baseLineOffset,
      barHeight,
      plt_i,
      pnt_i;
    
    //set bar width
    ctx.lineWidth = chart.histBarWidth;
    
    //move to the chart origin
    //ctx.translate( 0, chartHeight + minLimit * spacing );
    ctx.save();

    //if ymax>0>ymin, we need to find the location of the 0 line to plot from
    if (minLimit < 0 && minLimit > 0) {
      baseLineOffset = minLimit;
    } else {
      baseLineOffset = 0;
    }
    
    //loop once for each array stored in data.dep
    for (plt_i = 0; plt_i < numDepVars; plt_i++) {
      depVarData = dataStore.getVarData(depVarNames[plt_i]);

      //set stroke color
      ctx.strokeStyle = colors.data[plt_i];
      
      //loop through each sub array
      for (pnt_i = 0; pnt_i < numOfPts; pnt_i++) {
        try {
          barHeight =  -1 * depVarData[pnt_i + start];

          ctx.beginPath();

          ctx.moveTo(
            chart.histBarTotal * ( pnt_i + 0.5 ), (baseLineOffset * spacing)
          );
          ctx.lineTo(
            chart.histBarTotal * ( pnt_i + 0.5 ), (barHeight * spacing)
          );

          ctx.stroke();
        } catch(err) {
          continue;
        }
      }
    }

    //translate the coord system back
    //ctx.translate( 0, -1 * (chartHeight + minLimit * spacing) );
    ctx.restore();
  }

  function configPolar() {
    var
      numOfPts = chart.range.numOfPts,
      start = chart.range.start,
      depVarNames = vars.deps || [],
      numDepVars = depVarNames.length,
      depVarData,
      plt_i,
      pnt_i;

    //move to center of plot 
    ctx.translate((chart.sizes.width) / 2, (chart.sizes.height) / 2);
    
    //convert radius values to angles if this is a map
    if (flags.map) {
      for (plt_i = 0; plt_i < numDepVars; plt_i++) {
        depVarData = dataStore.getVarData(depVarNames[plt_i]);

        for (pnt_i = 0; pnt_i < numOfPts; pnt_i++) {
          depVarData[pnt_i + start] -= 90;
        }
      }
    }
  }

  function drawPolarGrid() {
    var
      grid,
      radius_i,
      angle_i,
      spacing = chart.pntSpacing.dep,
      maxLimit = chart.limits.max;

    //rotate the plot
    ctx.rotate(chart.zeroAngle);
    
    //set colors
    ctx.strokeStyle = colors.grid;
    ctx.fillStyle = colors.text;
    
    //Draw a set of radius circles and angle markers if flag is set
    if(flags.grid) {
      grid = {
        "radii": [],
        "angles": []
      };

      //Draw 4 radius circles
      grid.radii = [
        (0.25 * maxLimit),
        (0.5 * maxLimit),
        (0.75 * maxLimit),
        (maxLimit)
      ];

      ctx.textAlign = "end";
      
      for (radius_i = 0; radius_i < grid.radii.length; radius_i++) {
        ctx.beginPath();
        ctx.arc(
          0, 0, spacing * grid.radii[radius_i],
          0,2 * Math.PI,
          true
        );
        ctx.closePath();
        ctx.stroke();

        //if this is a map, radii should display as latitude angles
        if (flags.map) {
          ctx.fillText(
            90 - grid.radii[radius_i] + "\u00B0",
            0, spacing * grid.radii[radius_i] - 5
          );
        } else {
          ctx.fillText(
            grid.radii[radius_i],
            0, spacing * grid.radii[radius_i] - 5
          );
        }
      }

      //Draw 6 angle markers
      if (flags.map) {
        //grid angles for map should be -180 to 180, 
        //angles for a polar plot should be 0  to 360
        grid.angles = [
          0,
          Math.PI / 4,
          Math.PI / 2,
          3 * Math.PI / 4,
          Math.PI,
          -1 * Math.PI / 4,
          -1 * Math.PI / 2,
          -3 * Math.PI / 4
        ];
      } else {
        grid.angles = [
          0,
          Math.PI / 4,
          Math.PI / 2,
          3 * Math.PI / 4,
          Math.PI,
          5 * Math.PI / 4,
          3 * Math.PI / 2,
          7 * Math.PI / 4
        ];
      }

      ctx.textAlign = "start";
      for (angle_i = 0; angle_i < grid.angles.length; angle_i++) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.save();
        
        //rotate the coordinate system and draw a straight line
        ctx.rotate(chart.polarRot * grid.angles[angle_i]);
        ctx.lineTo(maxLimit * spacing , 0);
        ctx.stroke();
        
        //move coord system to text location
        ctx.textAlign = "end";
        
        ctx.fillText(
          (180 * grid.angles[angle_i] / Math.PI) + "\u00B0",
          chart.sizes.radius, 0
        );
        ctx.restore();
      }
    }
  }

  function drawPolarPlot() {
    var
      indepVarData = dataStore.getVarData(vars.indep),
      numOfPts = chart.range.numOfPts,
      start = chart.range.start,
      depVarNames = vars.deps || [],
      numDepVars = depVarNames.length,
      depVarData,
      spacing = chart.pntSpacing.dep,
      angle,
      radius,
      plt_i,
      pnt_i;

    //rotate the plot so zero lines up with where the use wants
    ctx.save();
    ctx.rotate( -1 * chart.polarRot * chart.zeroAngle);
    ctx.lineWidth = chart.sizes.lineWidth;
    pntOffset = -1 * chart.sizes.halfPointSize;

    //Draw lines and points      
    for (plt_i = 0; plt_i < numDepVars; plt_i++) {
      //set colors
      if (!colors.data[plt_i]) {
        colors.data[plt_i] = "Black";
      }
      ctx.fillStyle = colors.data[plt_i];
      ctx.strokeStyle = colors.data[plt_i];
       
      //start line path
      if (flags.lines) {
        ctx.save();
        ctx.rotate(chart.polarRot * angle);
        ctx.beginPath();
        ctx.rotate(chart.polarRot * angle);
        ctx.moveTo(radius * spacing);
        ctx.restore();
      }
       
      depVarData = dataStore.getVarData(depVarNames[plt_i]);

      for (pnt_i = 0; pnt_i < numOfPts; pnt_i++) {
        //get the angle and radius of the next point
        angle = indepVarData[pnt_i + start] * Math.PI / 180;
        radius = depVarData[pnt_i + start];
        angle -= 90 * Math.PI / 180;
        ctx.save();
        ctx.rotate(chart.polarRot * angle);
          
        try {
          if (flags.points) {
            //rotate coord system, plot point, rotate back
            ctx.fillRect(
              radius * spacing + pntOffset, pntOffset,
              chart.sizes.pointSize, chart.sizes.pointSize
            );
          }
          if (flags.lines) {
            //rotate coord system, plot point, rotate back
            ctx.lineTo(radius * spacing, 0);
          }
        } catch(err) {
          continue;
        }
        
        ctx.restore();
      }

      //finish line path
      if (flags.lines) {
        ctx.stroke();
      }
       
      //add perimiter label
      if (flags.legend) {
        ctx.lineWidth = 1;
        ctx.save();
        ctx.rotate(chart.polarRot * angle);
        ctx.beginPath();
        ctx.moveTo(chart.pntSpacing.dep * radius, 0);
        ctx.lineTo( (chart.sizes.radius + 5), 0 );
        ctx.fillText(depVarNames[plt_i], (chart.sizes.radius + 5), 0);
        ctx.stroke();
        ctx.restore();
      }
    }

    //rotate the plot back
    ctx.restore();
  }

 //////////////////////////Accessors////////////////////////// 

  self.setCanvasHolder = function(canvasHolderID) {
    elms.canvasBox = document.getElementById(canvasHolderID);
  };
 
  self.setOrigin = function(x,y) {
    chart.origin.x = x;
    chart.origin.y = y;
  };
 
  self.setCanvasSize = function(height, width, margin) {
    chart.sizes.canvas.height = height;
    chart.sizes.canvas.width = width;
    chart.sizes.canvas.margin = margin;

    chart.sizes.height = height - chart.sizes.canvas.margin;
    chart.sizes.width = width - chart.sizes.canvas.margin;

    chart.sizes.radius =
    Math.max(width, height) - (chart.sizes.canvas.margin) / 2;
  };
  
  self.setChartSize = function(height, width) {
    chart.sizes.height = height;
    chart.sizes.width = width;

    chart.sizes.canvas.height = height + chart.sizes.canvas.margin;
    chart.sizes.canvas.width = width + chart.sizes.canvas.margin;

    chart.sizes.radius = Math.max(width, height) / 2;
  };
  
  self.setColor = function(type, color) {
    colors[type] = color;
  };
  
  self.setVars = function setVars(v) {
    vars.indep = v.independent;
    vars.deps = [].concat(v.dependent);
  };

  self.setDataRange = function(start, stop) {
    var
      indepVarData = dataStore.getVarData(vars.indep) || [],
      indepVarLength = indepVarData.length,
      range = chart.range;

    //make sure the index range is within the data set and save it
    range.start = Math.max(start, 0);
    range.stop = Math.min(stop, indepVarLength - 1);

    //figure out how manys data points we have
    range.numOfPts = range.stop - range.start + 1;
  };

  self.setSubPlot = function(bool) {
    flags.subPlot = bool;
  };

  self.setCoordDisp = function(bool) {
    flags.showCoords = bool;
  };

  //first argument is an array containing the name of each tracker. 
  //each aditional argument is an array containing tracker data
  self.setTrackers = function() {
    vars.trackLabels = arguments[0].slice(0);
    for (var array_i = 1 ; array_i < arguments.length; array_i) {
      vars.trackers[array_i] = arguments[array_i].slice(0);
    }
  };
 
  //sets the chart lables
  self.setLabels = function(labels) {
    if (labels.title) {
      chart.labels.title = labels.title;
      flags.title = true;
    }

    if (labels.independent) {
      chart.labels.indep = labels.independent;
      flags.axis = true;
    }

    if (labels.dependent) {
      chart.labels.dep = labels.dependent;
      flags.axis = true;
    }
  };

  //sets the type of chart to be drawn
  self.setType = function(type) {
    chart.type = type;

    //set xy or polar plot flags
    if (chart.type.indexOf("xy") != -1) {
      //found a rectangular plot type set the flag and check the subtype.
      flags.xy = true;
    } else if (chart.type.indexOf("hist") != -1) {
      flags.hist = true;
    } else if (chart.type.indexOf("polar") != -1) {
      flags.polar = true;

      if (chart.type.indexOf("map") != -1) {
        chart.zeroAngle =  -1 * Math.PI / 2;
        flags.map = true;
        self.setLimits(0, 90);
      }
      if (chart.type.indexOf("south") != -1 || chart.type.indexOf("cw") != -1) {
        chart.polarRot = 1;
      }
    }

    //set how the data will be drawn
    if (chart.type.indexOf("line") != -1) {
      flags.lines = true;
    }
    if (chart.type.indexOf("point") != -1) {
      flags.points = true;
    }
  };

  //set the data to be scaled in some way
  self.setScale = function(scale) {
    flags.scaled = true;

    var scaleParams = scale.split("_");

    chart.scale.type = scaleParams[0];
    chart.scale.value = parseInt((scaleParams[1]), 10);
  };
 
  //set the min and max values for the yaxis
  self.setLimits = function(min,max) {
    if (!isNaN(0 + min) && !isNaN(0 + max)) {
      chart.limits.min = 0 + min;
      chart.limits.max = 0 + max;
      flags.limits = true;
    } else {
      alert("Plot limits could not be set.");
    }
  };

  self.setLineWidth = function(width) {
    chart.sizes.lineWidth = width;
  };
 
  self.setPointSize = function(width) {
    //stop from auto calculating point size
    flags.fixedPtSize = true;

    //make sure the supplied point size is not too small
    chart.sizes.pointSize = Math.max(1, width);
    chart.sizes.halfPointSize = parseInt((chart.sizes.pointSize / 2), 10);
  };

  self.setHistBars = function(ratio) {
    chart.histBarRatio = ratio;
  };

  self.setBorderColor = function(color) {
    colors.borderColor = color;
  };

  self.setBackgroundColor = function(color) {
    colors.bgColor = color;
  };

  self.setBackgroundImage = function(id) {
    chart.bgImg = document.getElementById(id);
  };

  self.setGrid = function() {
    flags.grid = true;
  };

  self.setLegend = function() {
    flags.legend = true;
  };

  self.setZoomable = function() {
    flags.zoomable = true;
  };

  self.getDataStore = function() {
    return dataStore;
  };

  self.setDataStore = function setDataStore(ds) {
    dataStore = ds;
  };

  self.getPlotElements = function() {
    return elms;
  };

  self.getChartProps = function() {
    return chart;
  };


  //////////////////////////Public Methods////////////////////////// 

  self.buildPlot = function(start, stop) {
    var
      indepVarLength = (dataStore.getVarData(vars.indep) || []).length;

    //determine if start and stop indicies were set
    //if not, set for full range
    if (start === undefined) {start = 0;}
    if (stop === undefined) {stop = indepVarLength - 1;}
    
    //set the start and stop indecies for all the loops
    self.setDataRange(start, stop);

    //figure out the point size
    if (!flags.fixedPtSize) {
      //take a best guess at point size
      this.setPointSize(
        parseInt((chart.sizes.width / chart.range.numOfPts / 2), 10)
      );

      //make sure the point is between 2 and 8
      this.setPointSize(
        Math.max(1, Math.min(8, chart.sizes.pointSize))
      );
    }

    //Adjust the data as needed
    if (flags.scaled && !flags.replot) {
      scaler();
    }
    
    flags.replot = true;
    
    //initalize the canvas element and context
    buildCanvas();
    
    //figure out axis and radii lengths
    // or limit dependent data sets
    doLimits();

    //determine what type of plot we are generating
    if (flags.xy) {
      configSpacing();
      callYTics();
      callXTics();
      drawLinesPoints();
    }
    
    if (flags.polar) {
      configSpacing();
      configPolar();

      if (!flags.subPlot && flags.setGrid) {
        drawPolarGrid();
      }

      drawPolarPlot();
    }
    
    if (flags.hist) {
      configHistBars();
      configSpacing();
      callYTics();
      callXTics();

      drawHistBars();
    }
  };
};