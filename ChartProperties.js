Dave_js.ChartProperties = function ChartProperties(){
  //canvas id based on the user specified name
  this.id = Math.random() + "-canvas";
  
  //default canvas size
  this.sizes = {
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
    halfPointSize : 3
  };

  //default x and y origins for the canvas coordinate system   
  this.origin = { x : 60, y : 20};
  this.totalOffsetX = 0;
  this.totalOffsetY = 0;
  
  //the id attribute for an image tag on the 
  //page which contains the desired background
  this.bgImg = undefined;
  
  //settings for chart text
  this.cssFont = '14px sans-serif';
  this.labels = {
    title : "",
    indep : "",
    dep : ""
  };
  
  //Default number of y tics to skip
  this.skipTics = {dep : 1, indep : 1 };
  
  //number of pixels per point in each dimension
  this.pntSpacing = {dep : 1, indep : 1};
  
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
};