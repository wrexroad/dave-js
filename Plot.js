Dave_js.Plot = function Plot(type) {
  //figure out what plotter we will be using
  if (typeof Dave_js[type] !== 'function') {
    console.log('Unknown plot type: "' + type + '"');
    return null;
  }
  
  //associate this.plotters functions with this
  this.plotter = new Dave_js[type](this);
  this.loadData = this.plotter.loadData;
  this.plotData = this.plotter.plotData;
  this.decorate = this.plotter.decorate;
  
  this.vars = {
    x: "",
    y: []
  };

  this.chart = new Dave_js.ChartProperties();
};

Dave_js.Plot.prototype.elms = {
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

Dave_js.Plot.prototype.flags = {
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

// Add a new canvas to the "canvasBox" element, 
// gets the canvas context, and draws a skeleton graph
Dave_js.Plot.prototype.buildCanvas = function buildCanvas() {
  var timer = (new Date()).getTime();

  //if this is not part of an existing plot, clear the canvas
  if(this.flags.subplot != 1) {
    //remove old canvas element
    if(this.elms.canvas) {
      this.elms.canvasBox.removeChild(this.elms.canvas);
      this.elms.canvas = null;
    }
    //create a canvas and insert it into the canvasBox
    this.elms.canvas = document.createElement("canvas");
    this.elms.canvas.id = this.chart.id;
    this.elms.canvas.width = this.chart.sizes.canvas.width;
    this.elms.canvas.height = this.chart.sizes.canvas.height;
    this.elms.canvasBox.appendChild(this.elms.canvas);
  }

  //initialize canvas context
  ctx = null;
  ctx = this.elms.canvas.getContext("2d");
  
  //move coord origin to the upper left corner of plot area
  ctx.translate(
    this.chart.origin.x, this.chart.origin.y
  );
  
  if (!this.flags.subplot) {
    //draw background and border
    if (this.chart.bgImg) {
      ctx.drawImage( this.chart.bgImg, 0, 0 );
    } else {
      ctx.fillStyle = this.chart.colors.bgColor;
      ctx.fillRect( 0, 0, this.chart.sizes.width, this.chart.sizes.height );
    }

    ctx.strokeStyle = this.chart.colors.borderColor;
    ctx.strokeRect(0, 0, this.chart.sizes.width, this.chart.sizes.height);
    
    //print title (bold)
    if (this.flags.title) {
      ctx.textAlign = "center";
      ctx.fillStyle = this.chart.colors.text;
      ctx.font = "bold " + this.chart.cssFont;
      ctx.fillText(
        this.chart.labels.title,
        (this.chart.sizes.width / 2), -5
      );
    }
    
    //print axis labels
    if (this.flags.axis) {
      ctx.font = this.chart.cssFont;
      ctx.fillStyle = this.chart.colors.text;
      ctx.textAlign = "start";
      ctx.fillText(
        this.chart.labels.indep,
         -50, (this.chart.sizes.height + 40)
      );
      ctx.save();
      ctx.translate(-45, (this.chart.sizes.height / 2) );
      ctx.rotate(1.5 * Math.PI);
      ctx.textAlign = "center";
      ctx.fillText(this.chart.labels.dep, 0, -20);
      ctx.restore();
    }
  }

  //add coordinate display if this is an xy plot and the coord flag is set
  if(this.flags.xy && this.flags.showCoords) {
    //create a message holder 
    this.elms.coordMsg = new Dave_js.message();
    this.elms.coordMsg.box.style.opacity = "0.8";
    this.elms.coordMsg.box.style.filter = "alpha(opacity=80)";
  }

  //add event listeners to display coordinates in the message holder
  //this.elms.canvas.addEventListener("mouseover", canvasMouseIn);
  //this.elms.canvasBox.addEventListener("mouseover", canvasMouseOut);

  timer = (new Date()).getTime() - timer;
  console.log("Canvas Build = " + timer / 1000);
};

Dave_js.Plot.prototype.setCanvasHolder = function(canvasHolderID) {
  this.elms.canvasBox = document.getElementById(canvasHolderID);
};

Dave_js.Plot.prototype.setOrigin = function(x,y) {
  this.chart.origin.x = x;
  this.chart.origin.y = y;
};

Dave_js.Plot.prototype.setCanvasSize = function(height, width, margin) {
  this.chart.sizes.canvas.height = height;
  this.chart.sizes.canvas.width = width;
  this.chart.sizes.canvas.margin = margin;

  this.chart.sizes.height = height - this.chart.sizes.canvas.margin;
  this.chart.sizes.width = width - this.chart.sizes.canvas.margin;

  this.chart.sizes.radius =
  Math.max(width, height) - (this.chart.sizes.canvas.margin) / 2;
};

Dave_js.Plot.prototype.setChartSize = function(height, width) {
  this.chart.sizes.height = height;
  this.chart.sizes.width = width;

  this.chart.sizes.canvas.height = height + this.chart.sizes.canvas.margin;
  this.chart.sizes.canvas.width = width + this.chart.sizes.canvas.margin;

  this.chart.sizes.radius = Math.max(width, height) / 2;
};

Dave_js.Plot.prototype.setColor = function(type, color) {
  this.chart.colors[type] = color;
};

Dave_js.Plot.prototype.setVars = function setVars(vars) {
  this.vars = vars;
};

Dave_js.Plot.prototype.setSubPlot = function(bool) {
  this.flags.subPlot = bool;
};

Dave_js.Plot.prototype.setCoordDisp = function(bool) {
  this.flags.showCoords = bool;
};

//first argument is an array containing the name of each tracker. 
//each aditional argument is an array containing tracker data
Dave_js.Plot.prototype.setTrackers = function() {
  this.vars.trackLabels = arguments[0].slice(0);
  for (var array_i = 1 ; array_i < arguments.length; array_i) {
    this.vars.trackers[array_i] = arguments[array_i].slice(0);
  }
};

//sets the chart lables
Dave_js.Plot.prototype.setLabels = function(labels) {
  if (labels.title) {
    this.chart.labels.title = labels.title;
    this.flags.title = true;
  }

  if (labels.independent) {
    this.chart.labels.indep = labels.independent;
    this.flags.axis = true;
  }

  if (labels.dependent) {
    this.chart.labels.dep = labels.dependent;
    this.flags.axis = true;
  }
};

//set the data to be scaled in some way
Dave_js.Plot.prototype.setScale = function(scale) {
  this.flags.scaled = true;

  var scaleParams = scale.split("_");

  this.chart.scale.type = scaleParams[0];
  this.chart.scale.value = parseInt((scaleParams[1]), 10);
};

//set the min and max values for the yaxis
Dave_js.Plot.prototype.setLimits = function(min,max) {
  if (!isNaN(0 + min) && !isNaN(0 + max)) {
    this.chart.limits.ymin = 0 + min;
    this.chart.limits.ymax = 0 + max;
    this.flags.limits = true;
  } else {
    alert("Plot limits could not be set.");
  }
};

Dave_js.Plot.prototype.setLineWidth = function(width) {
  this.chart.sizes.lineWidth = width;
};

Dave_js.Plot.prototype.setPointSize = function(width) {
  //stop from auto calculating point size
  this.flags.fixedPtSize = true;

  //make sure the supplied point size is not too small
  this.chart.sizes.pointSize = Math.max(1, width);
  this.chart.sizes.halfPointSize = parseInt((this.chart.sizes.pointSize / 2), 10);
};

Dave_js.Plot.prototype.setHistBars = function(ratio) {
  this.chart.histBarRatio = ratio;
};

Dave_js.Plot.prototype.setBorderColor = function(color) {
  this.chart.colors.borderColor = color;
};

Dave_js.Plot.prototype.setBackgroundColor = function(color) {
  this.chart.colors.bgColor = color;
};

Dave_js.Plot.prototype.setBackgroundImage = function(id) {
  this.chart.bgImg = document.getElementById(id);
};

Dave_js.Plot.prototype.setGrid = function() {
  this.flags.grid = true;
};

Dave_js.Plot.prototype.setLegend = function() {
  this.flags.legend = true;
};

Dave_js.Plot.prototype.setZoomable = function() {
  this.flags.zoomable = true;
};

Dave_js.Plot.prototype.getDataStore = function() {
  return this.dataStore;
};

Dave_js.Plot.prototype.setDataStore = function setDataStore(ds) {
  this.dataStore = ds;
};

Dave_js.Plot.prototype.getPlotElements = function() {
  return elms;
};

Dave_js.Plot.prototype.getChartProps = function() {
  return this.chart;
};

Dave_js.Plot.prototype.buildPlot = function(start, stop) {
  //var
  //  indepVarLength = (dataStore.getVarData(vars.indep) || []).length;

  //set the start and stop indecies for all the loops
  this.setDataRange(+start || 0, +stop || this.dataStore.getVarData(this.vars.y[0]).length);

  //figure out the point size
  if (!this.flags.fixedPtSize) {
    //take a best guess at point size
    this.setPointSize(
      parseInt((this.chart.sizes.width / this.chart.range.numOfPts / 2), 10)
    );

    //make sure the point is between 2 and 8
    this.setPointSize(
      Math.max(1, Math.min(8, this.chart.sizes.pointSize))
    );
  }

  //Adjust the data as needed
  if (this.flags.scaled && !this.flags.replot) {
    scaler();
  }
  
  this.flags.replot = true;
  
  //initalize the canvas element and context
  this.buildCanvas();
/*  
  //figure out axis and radii lengths
  // or limit dependent data sets
  this.doLimits();


  //determine what type of plot we are generating
  if (this.flags.xy) {
    configSpacing();
    drawLinesPoints();
  }
  
  if (this.flags.polar) {
    configSpacing();
    configPolar();

    if (!this.flags.subPlot && this.flags.setGrid) {
      drawPolarGrid();
    }

    drawPolarPlot();
  }
  
  if (this.flags.hist) {
    configHistBars();
    configSpacing();
    callYTics();
    callXTics();

    drawHistBars();
  }
  */
};