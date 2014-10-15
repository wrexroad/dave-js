Dave_js.ChartProperties = function ChartProperties(){
  //canvas id based on the user specified name
  this.id = Math.random() + "-canvas";
  
  //default canvas size
  this.sizes = {
    lineWidth : 3,
    pointSize : 6,
    halfPointSize : 3
  };

  this.height = 0;
  this.width = 0;
  this.margin = 200;

  //default x and y origins for the canvas coordinate system   
  this.origin = { x : 60, y : 20};
  this.totalOffsetX = 0;
  this.totalOffsetY = 0;
  
  //the id attribute for an image tag on the 
  //page which contains the desired background
  this.bgImg = undefined;
  
  //settings for chart text
  this.cssFont = '14px "Courier New", Courier, "Lucida Sans Typewriter", "Lucida Typewriter", monospace';
  this.labels = {
    title : "",
    indep : "",
    dep : ""
  };
  
  //Default number of y tics to skip
  this.skipTics = {dep : 1, indep : 1 };
  
  //number of pixels per point in each dimension
  this.pntSpacing = {dep : 1, indep : 1};
  
  //variables that will be used to labels the tic marks on each axis
  this.axisVars = {};

  //min and max values for dependent variables
  this.limits = {xmin : 0, xmax : 0, ymin : 0, ymax : 0};
  
  //default settings for plot scale
  this.scale = {"type" : "lin", "value" : 1};
  
  //histogram bar width plus margin
  this.histBarTotal = undefined;
  this.histBarWidth = undefined;
  this.histBarMargin = undefined;
  
  //default 90% histogram bar width
  this.histBarRatio = 0.9;
  
  //direction of increasing angles in polar plots
  // -1 = anticlockwise; 1 = clockwise
  this.polarRot = -1;
  
  //where 0 degrees is located on the polar plot
  this.zeroAngle = 0;

  //define plot range
  this.range = {
    "start" : Number.NEGATIVE_INFINITY,
    "stop" : Number.POSITIVE_INFINITY,
    "numOfPts" : 0
  };

  //holds the different colors used for in the plot
  this.colors = {
    // default colors
    activePoint : "#00FF00",
    text : "black",
    grid : "gray",
    data : ['Red','Blue','Green', 'Yellow'],
    borderColor : '#000000',
    bgColor : '#CCCCCC'
  };

  this.flags = {
    //indicated that a value to pixel conversion has been calculated
    hasRange : false,
    autoRange: true,

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
};