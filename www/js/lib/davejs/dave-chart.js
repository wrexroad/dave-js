Dave_js.chart = function(name) {
   var self = this;
   
   //////////////////////////Private Members//////////////////////////////

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
      
      //min and max values for dependant variables
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
      zeroAngle : 0
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
   
   //contains user provided data for plotting
   var data = {
      dep : [],
      indep : [],
      varLabels : [],
      trackers : [],
      trackLabels : [],
      range: {"start" : 0, "stop" : 0, "numOfPts" : 0}
   };

   //////////////////////////Private Methods//////////////////////////////

   //method to test the browser's ability to display HTML5 canvas
   function browserTest(){
      //set special values based on browser
      var userAgent=navigator.userAgent;
      if (userAgent.indexOf("MSIE") != -1){
         if (parseInt(navigator.appVersion, 10) < 9){
            alert(
               'Internet Explorer does not support HTML5 canvas. ' +
               'Please use Google Chrome, Firefox, Opera, or Safari'
            );
            return;
         }
      }
      else if(userAgent.indexOf("Firefox") != -1){
         if (parseInt(navigator.appVersion, 10) < 3){
            alert(
               "Firefox 3.0 or later required for proper display"
            );
         }
      }
   }
   
   // Add a new canvas to the "canvasBox" element, 
   // gets the canvas context, and draws a skeleton graph
   function buildCanvas(){
      var timer = (new Date()).getTime();

      //if this is not part of an existing plot, clear the canvas
      if(flags.subplot != 1){
         //remove old canvas element
         if(elms.canvas){
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
      
      if(!flags.subplot){
         //draw background and border
         if(chart.bgImg){
            ctx.drawImage( chart.bgImg, 0, 0 );
         }
         else{
            ctx.fillStyle = colors.bgColor;
            ctx.fillRect(
               0, 0,
               chart.sizes.width, chart.sizes.height
            );
         }
         ctx.strokeStyle = colors.borderColor;
         ctx.strokeRect(0, 0, chart.sizes.width, chart.sizes.height);
         
         //print title (bold)
         if(flags.title){
            ctx.textAlign = "center";
            ctx.fillStyle = colors.text;
            ctx.font = "bold " + chart.cssFont;
            ctx.fillText(
               chart.labels.title,
               (chart.sizes.width / 2), -5
            );
         }
         
         //print axis labels
         if(flags.axis){
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
      if(flags.xy && flags.showCoords){
         //keeps track of current index of the data point closest to the mouse
         var coord_i = 0;
         
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
   
   function canvasMouseIn(e){
      e.stopPropagation();
      
      //create zoom object if one does not yet exist
      if(Dave_js.chart_zoom && flags.zoomable){
         if(!chart.zoom){
            chart.zoom = new Dave_js.chart_zoom(self, data, elms, chart);
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
   
   function canvasMouseOut(e){
      //make sure the mouse out did not occur because of running over a mask
      if(e.target.className == "daveMask"){return;}
      
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
      if(chart.zoom){chart.zoom = chart.zoom.destroy();}
      
      //remove the coordinate message
      if(flags.showCoords && elms.coordMsg.box.parentNode){
         elms.coordMsg.box.hidden = true;
      }
   }
   
   function mouseDown(e){
      if(Dave_js.chart_zoom && flags.zoomable){ //stop tracking mouse
         //start tracking the mouse pointer
         chart.zoom.start(coord_i);
      }
   }
   
   function mouseUp(e){
      if(Dave_js.chart_zoom && flags.zoomable){ //stop tracking mouse
         chart.zoom.stop(coord_i, e.pageX);
      }
   }
   
   function mouseMove(e){
      //x coordinate of cursor relative to canvas
      var x = e.pageX - chart.origin.x - elms.canvasBox.offsetLeft;
      
      //calculate the data point index we are closest to
      coord_i =
         Math.round(x * (data.range.numOfPts - 1) / chart.sizes.width) +
         data.range.start;
      
      //make sure the coord_i is within the data set
      coord_i = Math.min(coord_i, (data.indep.length - 1));
      coord_i = Math.max(coord_i, 0);
         
      if(Dave_js.message && flags.showCoords){
         showCoord(coord_i, e.pageX, e.pageY);
      }
      if(Dave_js.chart_zoom && flags.zoomable){ //stop tracking mouse
         if(!chart.zoom){

         }
         chart.zoom.moveMask(e.pageX);
      }
   }
   
   function showCoord(coord_i, x, y){
      var message, yCoord, xCoord;
      
      //make sure the coordinate box is visible
      elms.coordMsg.box.hidden = false;
      
      //create message and show message if we are within the plot
      if(data.indep[coord_i] !== undefined){
         xCoord = data.indep[coord_i];
         message = chart.labels.indep + " = " + xCoord;
         
         for(var plt_i = 0; plt_i < data.dep.length; plt_i++){
            //make sure the yCoord is a number
            //try stepping backwards and forwards until a number is found ,
            //or the end of the dataset is reached
            var negOffset, posOffset;
            negOffset = posOffset = coord_i;
            while(1){
               //try to step back
               if(negOffset >= 0){
                  yCoord = data.dep[plt_i][negOffset];
               }
               //try to step forward
               if(isNaN(yCoord) && posOffset < data.dep.length){
                  yCoord = data.dep[plt_i][posOffset];
               }
               //check to see if it is time to break
               if(
                  !isNaN(yCoord) ||
                  (negOffset < 0 && posOffset > data.dep.length)
               ) break;
               
               negOffset--;
               posOffset++;
            }
            
            //unscale the yCoord if needed
            if(flags.scaled){
               if(chart.scale.type == "log"){
                  yCoord = Math.pow(chart.scale.value, yCoord);
               }else if(chart.scale.type == "lin"){
                  yCoord /= chart.scale.value;
               }
            }
            
            //drop values past 3 decimal places
            if(((yCoord % 1) !== 0) && (typeof yCoord == "function")){
               yCoord = yCoord.toFixed(3);
            }
            
            message +=
               "<br />" + data.varLabels[plt_i] + " = " + yCoord;
         }
         
         elms.coordMsg.showMessage(
            message, (x + 10), (y + 10)
         );
      }
   }
   
   //Scales the data set by either a linear value or logrithmically 
   function scaler(){
      var timer = (new Date()).getTime();

      var scale_type = chart.scale.type;
      var scale_val = chart.scale.value;
      
      var plt_i, pnt_i, y_data;

      if(scale_type == "log"){//log plot
         for(plt_i = 0; plt_i < data.dep.length; plt_i++){
            y_data = data.dep[plt_i];

            for(pnt_i = 0; pnt_i <= data.indep.length; pnt_i++){
               if(y_data[pnt_i] !== 0 && !isNaN(y_data[pnt_i])){
                  y_data[pnt_i] =
                     Math.log(y_data[pnt_i]) / Math.log(scale_val);
               }
            }
         }
      }
      else if(scale_type == "lin"){ //linear plot
         for(plt_i = 0; plt_i < data.dep.length; plt_i++){
            y_data = data.dep[plt_i];

            for(pnt_i = 0; pnt_i <= data.indep.length; pnt_i++){
               if(!isNaN(y_data[pnt_i])){
                  y_data[pnt_i] *= scale_val;
               }
            }
         }
      }

      timer = (new Date()).getTime() - timer;
      console.log("Scale Data = " + timer / 1000);
   }
   
   //either apply limits to dependant data, or generate axis limits from it
   function doLimits(){
      var timer = (new Date()).getTime();
      var plt_i, pnt_i;

      if(!flags.limits){
         //user has not defined limits, so take the max and  of the data set
         
         //make sure the min and max values are numbers
         chart.limits.min = parseFloat(chart.limits.min);
         chart.limits.max = parseFloat(chart.limits.max);
         
         //create an array of max and mins for each subset
         var max = [];
         var min = [];

         
         for(plt_i = 0; plt_i < data.dep.length; plt_i++){
            //find first real data point for initial min/max
            for(pnt_i; pnt_i < data.range.numOfPts; pnt_i++){
               if(!isNaN(data.dep[plt_i][pnt_i + data.range.start])){
                  min[plt_i] = max[plt_i] =
                     parseFloat(data.dep[plt_i][pnt_i + data.range.start]);
                  break;
               }
            }
            
            //go through the rest of the data points looking for min/max
            for(pnt_i; pnt_i < data.range.numOfPts; pnt_i++){
               if(isNaN(data.dep[plt_i][pnt_i + data.range.start])){
                  continue;
               }
               min[plt_i] =
                  Math.min(
                     data.dep[plt_i][pnt_i + data.range.start], min[plt_i]
                  );
               max[plt_i] =
                  Math.max(
                     data.dep[plt_i][pnt_i + data.range.start], max[plt_i]
                  );
            }
         }
         
         //select the extremes from the max and min arrays
         chart.limits.min = Math.min.apply(null, min);
         chart.limits.max = Math.max.apply(null, max);
         
      }else{
         //the user has predefined data limits, so apply to each subset
         for(plt_i = 0; plt_i < data.dep; plt_i++){
            for(pnt_i = 0; pnt_i < data.range.numOfPts; pnt_i++){
               data.dep[plt_i][pnt_i] =
                  Math.min(
                     data.dep[plt_i][pnt_i + data.range.start],
                     chart.limits.max
                  );
               data.dep[plt_i][pnt_i] =
                  Math.max(
                     data.dep[plt_i][pnt_i + data.range.start],
                     chart.limits.min
                  );
            }
         }
      }
      
      //Make sure the ymax and min are not the same value
      if(chart.limits.min == chart.limits.max){
         chart.limits.min -=
            chart.sizes.height / 2;
         chart.limits.max +=
            chart.sizes.height / 2;
      }
      
      //if we have a log plot, make the y axis start and end at an integer 
      if(flags.scaled && chart.scale.type == "log"){
         chart.limits.min = Math.floor(chart.limits.min) ;
         chart.limits.max = Math.ceil(chart.limits.max);
      }

      timer = (new Date()).getTime() - timer;
      console.log("Limits Calculated = " + timer / 1000);
   }
   
   function configSpacing(){
      var depRange =
         Math.abs(chart.limits.max - chart.limits.min);
         
      chart.skipTics.indep =
         Math.max(1, parseInt((20 * data.range.numOfPts / chart.sizes.width), 10));
      
      chart.skipTics.dep =
         Math.max(1, parseInt((20 * depRange / chart.sizes.height), 10));
      
      if(flags.polar){//polar plots only need spacing in the radial direction
         chart.pntSpacing.dep = chart.sizes.radius / chart.limits.max;
      }else{ // all other plots are rectangular and need x/y spacing
         chart.pntSpacing.indep = chart.sizes.width / (data.range.numOfPts - 1);
         chart.pntSpacing.dep = chart.sizes.height / depRange;
      }
   }
   
   function callYTics(){
      var ticHeight, offset, ticLabel;
      //draw yAxis tic marks and labels
      ctx.textAlign = "end";
      for(
         var i = chart.limits.min;
         i <= chart.limits.max;
         i += chart.skipTics.dep
      ){
         ticHeight = i - chart.limits.min;
         offset =
            chart.sizes.height - (ticHeight * chart.pntSpacing.dep);
         
         ticLabel = i;
         
         //unscale the y axis value if needed
         if(flags.scaled){
            if(chart.scale.type == "log"){
               ticLabel = Math.pow(chart.scale.value, ticLabel);
            }else if(chart.scale.type == "lin"){
               ticLabel /= chart.scale.value;
            }
         }
         
         if(!isNaN(ticLabel) && (ticLabel % 1) !== 0){
            ticLabel = ticLabel.toFixed(2);
         }
         
         drawTic(ticLabel, offset);
      }
   }
   
   function callXTics(){
      var offset, ticLabel, spacing, textShift;
      if(flags.hist){
         spacing =  chart.histBarTotal;
         
         //we need to shift the text lables a bit 
         //so they will line up with the bard
         textShift = 0.5;
      }
      else{
         spacing = chart.pntSpacing.indep;
         textShift = 0;
      }
      
      //draw xAxis tic marks and labels
      ctx.save();
      ctx.translate(0, chart.sizes.height);
      ctx.rotate(1.5 * Math.PI);
      
      for(
         var pnt_i = 0;
         pnt_i < data.range.numOfPts;
         pnt_i += chart.skipTics.indep
      ){
         offset = (pnt_i * spacing) + textShift;
         ticLabel = data.indep[pnt_i + data.range.start];
         
         //only draw the tic mark if it is defined
         if(ticLabel !== undefined){drawTic(ticLabel, offset);}
      }
      ctx.restore();
   }
   
   function drawTic(ticLabel, offset){
      if(ticLabel == "--") {ticLabel = "No Label";}
      ctx.fillText(ticLabel, -5, offset + 5);
      ctx.beginPath();
      ctx.moveTo(0, offset);
      ctx.lineTo(5, offset);
      ctx.stroke();
   }
   
   function drawLinesPoints(){
      var x = 0, y = 0; //screen coordinate for the plotted point
      var timer = (new Date()).getTime();

      var legendOffset = 10;
      
      var range_start = data.range.start;
      var chart_min = chart.limits.min;
      var y_spacing = chart.pntSpacing.dep;
      var x_spacing = chart.pntSpacing.indep;

      //move to the plot origin
      ctx.translate(0, chart.sizes.height);
      
      for(var plt_i = 0; plt_i < data.dep.length; plt_i++){
         //cache the data set for this plot
         var y_data = data.dep[plt_i];
         var x_data = data.indep[plt_i];

         //set colors for this plot
         ctx.fillStyle = colors.data[plt_i];
         ctx.strokeStyle = colors.data[plt_i];
         
         //initial point height.
         //heights must be negative to move up in the plot
         y = parseInt(((chart_min - y_data[data.range.start]) * y_spacing), 10);
         
         //if we are drawing a line, set the line origin and start the line
         if(flags.lines){
            ctx.lineWidth = chart.sizes.lineWidth;
            
            if (isNaN(y)){y = 0;}
            ctx.beginPath();
            ctx.moveTo(0, y);
         }
         
         //if we are drawing points, plot the initial point
         if(flags.points){
            plotPnt(0, y);
         }
         
         //step through the data points
         for(var pnt_i = 1; pnt_i < data.range.numOfPts; pnt_i++){
            //try to plot the point
            //make sure we have a numerical value to plot
            if(isNaN(y_data[pnt_i + range_start])){continue;}
            
            //figure out current pixel location
            y = ((chart_min - y_data[pnt_i + range_start]) * y_spacing);
            x = (pnt_i * x_spacing);
            
            if(flags.lines){ctx.lineTo(x, y);}
            if(flags.points){plotPnt(x, y);}
         }

         if(flags.lines){ctx.stroke();}
         
         //draw legend
         if(flags.legend){
            ctx.strokeStyle = colors.data[plt_i];
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(chart.sizes.width, y);
            ctx.lineTo(chart.sizes.width + legendOffset, y);
            ctx.stroke();
            
            ctx.fillStyle = colors.data[plt_i];
            ctx.textAlign = "start";
            ctx.fillText(
               data.varLabels[plt_i], chart.sizes.width + legendOffset, y
            );
         }
      }
      //return to the canvas origin
      ctx.translate(0, -1 * chart.sizes.height);

      timer = (new Date()).getTime() - timer;
      console.log("Draw Time = " + timer/1000);
   }
   
   function plotPnt(x, y){
      ctx.fillRect(
         x - chart.sizes.pointSize / 2,
         y - (chart.sizes.pointSize / 2),
         chart.sizes.pointSize, chart.sizes.pointSize
      );
   }

   function configHistBars(){
      //figure out total possible bar size
      chart.histBarTotal =
         parseInt((chart.sizes.width / data.indep.length), 10);
      
      if(chart.histBarTotal < 1){
         chart.histBarTotal = 1;
         chart.histBarWidth = 1;
         chart.histBarMargin = 0;
      }
      else{
         chart.histBarWidth =
            parseInt((chart.histBarTotal * chart.histBarRatio), 10);
         chart.histBarMargin =
            chart.histBarTotal - chart.histBarWidth;
      }
   }
   
   function drawHistBars(){
      var baseLineOffset, barHeight;
      
      //set bar width
      ctx.lineWidth = chart.histBarWidth;
      
      //move to the chart origin
      ctx.translate(
         0, chart.sizes.height + chart.limits.min * chart.pntSpacing.dep
      );
      
      //if ymax>0>ymin, we need to find the location of the 0 line to plot from
      if(chart.limits.min < 0 && chart.limits.min > 0){
         baseLineOffset = chart.limits.min;
      }else{
         baseLineOffset = 0;
      }
      
      //loop once for each array stored in data.dep
      for(var plt_i = 0; plt_i < data.dep.length; plt_i++){
         //set stroke color
         ctx.strokeStyle = colors.data[plt_i];
         
         //loop through each sub array
         for(var pnt_i = 0; pnt_i < data.range.numOfPts; pnt_i++){
            try{
               barHeight =  -1 * data.dep[plt_i][pnt_i + data.range.start];
               
               ctx.beginPath();
               ctx.moveTo(
                  chart.histBarTotal * ( pnt_i + 0.5 ),
                  (baseLineOffset * chart.pntSpacing.dep)
               );
               ctx.lineTo(
                  chart.histBarTotal * (pnt_i + 0.5),
                  (barHeight * chart.pntSpacing.dep)
               );
               ctx.stroke();
            }catch(err){
               continue;
            }
         }
      }
      
      //translate the coord system back
      ctx.translate(
         0, -1 * (chart.sizes.height + chart.limits.min * chart.pntSpacing.dep)
      );
   }
   
   function configPolar(){
      //move to center of plot 
      ctx.translate((chart.sizes.width) / 2, (chart.sizes.height) / 2);
      
      //convert radius values to angles if this is a map
      if(flags.map){
         for(var plt_i = 0; plt_i < data.dep.length; plt_i++){
            for(var pnt_i = 0; pnt_i < data.range.numOfPts; pnt_i++){
               data.dep[plt_i][pnt_i + data.range.start] -= 90;
            }
         }
      }
   }
   
   function drawPolarGrid(){
      //rotate the plot
      ctx.rotate(chart.zeroAngle);
      
      //set colors
      ctx.strokeStyle = colors.grid;
      ctx.fillStyle = colors.text;
      
      //Draw a set of radius circles and angle markers if flag is set
      if(flags.grid){
         var grid={
            "radii": [],
            "angles": []
         };
         
         //Draw 4 radius circles
         grid.radii=[
            (0.25 * chart.limits.max),
            (0.5 * chart.limits.max),
            (0.75 * chart.limits.max),
            (chart.limits.max)
         ];
         ctx.textAlign = "end";
         for(var radius_i = 0; radius_i < grid.radii.length; radius_i++){
            ctx.beginPath();
            ctx.arc(
               0, 0, chart.pntSpacing.dep * grid.radii[radius_i],
               0,2 * Math.PI,
               true
            );
            ctx.closePath();
            ctx.stroke();
            
            //if this is a map, radii should display as latitude angles
            if(flags.map){
               ctx.fillText(
                  90 - grid.radii[radius_i] + "\u00B0",
                  0,    chart.pntSpacing.dep * grid.radii[radius_i] - 5
               );
            }
            else{
               ctx.fillText(
                  grid.radii[radius_i],
                  0, chart.pntSpacing.dep * grid.radii[radius_i] - 5
               );
            }
         }
         
         //Draw 6 angle markers
         if(flags.map){
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
         }
         else{
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
         
         ctx.textAlign="start";
         for(var angle_i = 0; angle_i < grid.angles.length; angle_i++){
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.save();
            
            //rotate the coordinate system and draw a straight line
            ctx.rotate(chart.polarRot * grid.angles[angle_i]);
            ctx.lineTo(
               chart.limits.max * chart.pntSpacing.dep , 0
            );
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
   
   function drawPolarPlot(){
      var angle, radius;
      
      //rotate the plot so zero lines up with where the use wants
      ctx.save();
      ctx.rotate( -1 * chart.polarRot * chart.zeroAngle);
      
      //Draw lines and points      
      for(var plt_i = 0; plt_i < data.dep.length; plt_i++){
         //set colors
         if(!colors.data[plt_i]){
            colors.data[plt_i] = "Black";
         }
         ctx.fillStyle = colors.data[plt_i];
         ctx.strokeStyle = colors.data[plt_i];
         
         //start line path
         if(flags.lines){
            ctx.lineWidth = chart.sizes.lineWidth;
            ctx.save();
            ctx.rotate(chart.polarRot * angle);
            ctx.beginPath();
            ctx.rotate(chart.polarRot * angle);
            ctx.moveTo(radius * chart.pntSpacing.dep);
            ctx.restore();
         }
         
         for(var pnt_i = 0; pnt_i < data.range.numOfPts; pnt_i++){
            //get the angle and radius of the next point
            angle = data.indep[pnt_i + data.rang.start] * Math.PI / 180;
            radius = data.dep[plt_i][pnt_i + data.rang.start];
            pntOffset = -1 * chart.sizes.pointSize / 2;
            angle -= 90 * Math.PI / 180;
            ctx.save();
            ctx.rotate(chart.polarRot * angle);
            
            try{
               if(flags.points){
                  //rotate coord system, plot point, rotate back
                  ctx.fillRect(
                     radius * chart.pntSpacing.dep + pntOffset,
                     pntOffset,
                     chart.sizes.pointSize, chart.sizes.pointSize
                  );
               }
               if(flags.lines){
                  //rotate coord system, plot point, rotate back
                  ctx.lineTo(radius * chart.pntSpacing.dep, 0);
               }
            }catch(err){
               continue;
            }
            
            ctx.restore();
         }
         
         //finish line path
         if(flags.lines){
            ctx.stroke();
         }
         
         //add perimiter label
         if(flags.legend){
            ctx.lineWidth = 1;
            ctx.save();
            ctx.rotate(chart.polarRot * angle);
            ctx.beginPath();
            ctx.moveTo(chart.pntSpacing.dep * radius, 0);
            ctx.lineTo( (chart.sizes.radius + 5), 0 );
            ctx.fillText(
               data.varLabels[plt_i],
               (chart.sizes.radius + 5), 0
            );
            ctx.stroke();
            ctx.restore();
         }
      }
   
      //rotate the plot back
      ctx.restore();
   }
   
   //////////////////////////Accessors////////////////////////// 

   self.setCanvasHolder = function(canvasHolderID){
      elms.canvasBox = document.getElementById(canvasHolderID);
   };
   
   self.setOrigin = function(x,y){
      chart.origin.x = x;
      chart.origin.y = y;
   };
   
   self.setCanvasSize = function(height, width, margin){
      chart.sizes.canvas.height = height;
      chart.sizes.canvas.width = width;
      chart.sizes.canvas.margin = margin;
      
      chart.sizes.height = height - chart.sizes.canvas.margin;
      chart.sizes.width = width - chart.sizes.canvas.margin;
      
      chart.sizes.radius =
         Math.max(width, height) - (chart.sizes.canvas.margin) / 2;
   };
   
   self.setChartSize = function(height, width){
      chart.sizes.height = height;
      chart.sizes.width = width;
      
      chart.sizes.canvas.height = height + chart.sizes.canvas.margin;
      chart.sizes.canvas.width = width + chart.sizes.canvas.margin;
      
      chart.sizes.radius = Math.max(width, height) / 2;
   };
   
   self.setColor = function(type, color){
      colors[type] = color;
   };
   
   self.setData = function(xDataArr, yDataArr, dataSetLabel, id){
      //if no id is set, just use use the next open slot
      if(!id){id = data.dep.length;}
      
      //copies the array rather than taking a reference to it
      data.indep = xDataArr.slice(0);
      data.dep[id] = yDataArr.slice(0) ;
      data.varLabels[id] = dataSetLabel;
      
      //empty the original arrays
      xDataArr = null;
      yDataArr = null;
      dataSetLabels = null;
      
      return id;
   };
   
   self.setDataRange = function(start, stop){
      //make sure the index range is within the data set and save it
      data.range.start = Math.max(start, 0);
      data.range.stop = Math.min(stop, data.indep.length - 1);
      
      //figure out how manys data points we have
      data.range.numOfPts = data.range.stop - data.range.start + 1;
   };
   
   self.setSubPlot = function(bool){
      flags.subPlot = bool;
   };
   
   self.setCoordDisp = function(bool){
      flags.showCoords = bool;
   };
   
   //first argument is an array containing the name of each tracker. 
   //each aditional argument is an array containing tracker data
   self.setTrackers = function(){
      data.trackLabels = arguments[0].slice(0);
      for(var array_i = 1 ; array_i < arguments.length; array_i){
         data.trackers[array_i] = arguments[array_i].slice(0);
      }
   };
   
   //sets the chart lables
   self.setLabels = function(title,xaxis,yaxis){
      if(title){
         chart.labels.title = title;
         flags.title = true;
      }
      if(xaxis && yaxis){
         chart.labels.indep = xaxis;
         chart.labels.dep = yaxis;
         flags.axis = true;
      }
   };

   //sets the type of chart to be drawn
   self.setType = function(type){
      chart.type = type;
      
      //set xy or polar plot flags
      if(chart.type.indexOf("xy") != -1){
         //found a rectangular plot type set the flag and check the subtype.
         flags.xy = true;
      }
      else if(chart.type.indexOf("hist") != -1){
            flags.hist = true;
      }
      else if(chart.type.indexOf("polar") != -1){
         flags.polar = true;
         if(chart.type.indexOf("map") != -1){
            chart.zeroAngle =  -1 * Math.PI / 2;
            flags.map = true;
            self.setLimits(0, 90);
         }
         if(
            chart.type.indexOf("south") != -1 || chart.type.indexOf("cw") != -1
         ){
            chart.polarRot = 1;
         }
      }
      
      //set how the data will be drawn
      if(chart.type.indexOf("line") != -1){
         flags.lines = true;
      }
      if(chart.type.indexOf("point") != -1){
         flags.points = true;
      }
   };

   //set the data to be scaled in some way
   self.setScale = function(scale){
      flags.scaled = true;
      
      var scaleParams = scale.split("_");
      
      chart.scale.type = scaleParams[0];
      chart.scale.value = parseInt((scaleParams[1]), 10);
   };
   
   //set the min and max values for the yaxis
   self.setLimits = function(min,max){
      if(!isNaN(0 + min) && !isNaN(0 + max)){
         chart.limits.min = 0 + min;
         chart.limits.max = 0 + max;
         flags.limits = true;
      }else{
         alert("Plot limits could not be set.");
      }
   };

   self.setLineWidth = function(width){
      chart.sizes.lineWidth = width;
   };
   
   self.setPointSize = function(width){
      //stop from auto calculating point size
      flags.fixedPtSize = true;

      //make sure the supplied point size is not too small
      chart.sizes.pointSize = Math.max(1, width);
   };
   
   self.setHistBars = function(ratio){
      chart.histBarRatio = ratio;
   };
   
   self.setBorderColor = function(color){
      colors.borderColor = color;
   };
   
   self.setBackgroundColor = function(color){
      colors.bgColor = color;
   };
   
   self.setBackgroundImage = function(id){
      chart.bgImg = document.getElementById(id);
   };
   
   self.setGrid = function(){
      flags.grid = true;
   };
   
   self.setLegend = function(){
      flags.legend = true;
   };
   
   self.setZoomable = function(){
      flags.zoomable = true;
   };
   
   self.getData = function(){
      return data;
   };
   
   self.getPlotElements = function(){
      return elms;
   };
   
   self.getChartProps = function(){
      return chart;
   };


   //////////////////////////Public Methods////////////////////////// 
 
   self.buildPlot = function(start, stop){
      //determine if start and stop indicies were set
      //if not, set for full range
      if(start === undefined){start = 0;}
      if(stop === undefined){stop = data.indep.length - 1;}
      
      //set the start and stop indecies for all the loops
      self.setDataRange(start, stop);
     
      //figure out the point size
      if(!flags.fixedPtSize){
         //take a best guess at point size
         chart.sizes.pointSize =
            parseInt((chart.sizes.width / data.range.numOfPts / 2), 10);

         //make sure the point is between 2 and 8
         chart.sizes.pointSize =
            Math.max(1, Math.min(8, chart.sizes.pointSize));
      }
 
      //Adjust the data as needed
      if(flags.scaled && !flags.replot){
         scaler();
      }
      
      flags.replot = true;
      
      //initalize the canvas element and context
      buildCanvas();
      
      //figure out axis and radii lengths
      // or limit dependant data sets
      doLimits();
      //determine what type of plot we are generating
      if(flags.xy){
         configSpacing();
         callYTics();
         callXTics();
         drawLinesPoints();
      }
      
      if(flags.polar){
         
         configSpacing();
         configPolar();
         
         if(!flags.subPlot && flags.setGrid){
            drawPolarGrid();
         }
         
         drawPolarPlot();
         
      }
      
      if(flags.hist){
         configHistBars();
         configSpacing();
         callYTics();
         callXTics();
         
         drawHistBars();
      }
   };
};