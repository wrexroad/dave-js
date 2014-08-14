//add the main zoom function to the chart object
Dave_js.chart_zoom = function(plot, data, els, chart) {
  var self = this;
  
  var startPnt; //stores the coordinate of the mouse at mousedown event
  var mousedown = false; //flag to determine the behavior of maskMove
  
  //set up the masking divs
  var mask =
    (function(){
      var l = document.createElement("div");
      var r = document.createElement("div");
      
      l.className = r.className = "daveMask";
      
      //stop any mouseover propagation
      //l.addEventListener("mouseover", function(e){});//e.stopPropagation()});
      //r.addEventListener("mouseover", function(e){});//e.stopPropagation()});
      
      //set mask height to match plot
      l.style.top = r.style.top =
        (els.canvas.offsetTop + chart.origin.y) + "px";
      l.style.height = r.style.height =
         chart.sizes.height + "px";
         
      //add the masks to the DOM
      els.canvasBox.appendChild(l);
      els.canvasBox.appendChild(r);
      
      return {"l" : l, "r" : r};
    })();
   
  //figure offset from cursor origin to plot origin
  var chartOffset = {
    "x": (chart.origin.x - els.canvasBox.offsetLeft),
    "y": (chart.origin.y - els.canvasBox.offsetTop)
  };
  
  self.getZoomMask = function(){
    return mask;
  };
  self.setMousedown = function(b){
    mousedown = b;
  };
  self.getMousedown = function(){
    return mousedown;
  };
  self.setStart = function(p){
    startPnt = parseInt(p, 10);
  };
  self.getStart = function(){
    return startPnt;
  };
  self.getPlotInstance = function(){
    return plot;
  };
  self.getPlotElement = function(){
    var retObj = els;
    for(var arg_i = 0; arg_i < arguments.length; arg_i++){
      retObj = retObj[arguments[arg_i]];
    }
    return retObj;
  };
  self.getChartProp = function(){
    var retObj = chart;
     
    for(var arg_i = 0; arg_i < arguments.length; arg_i++){
      retObj = retObj[arguments[arg_i]];
    }

    return retObj;
  };
  
  self.getData = function(){
    var retObj = data;
    
    for(var arg_i = 0; arg_i < arguments.length; arg_i++){
      retObj = retObj[arguments[arg_i]];
    }
     
    return retObj;
  };
  
  self.getChartOffset = function(){
    return chartOffset;
  };
};

/*Dave_js.chart_zoom.prototype.getDataIndex = function(e){
  var self = this;
  
  //figure out the conversion of horiz pixel location to data point index
  var scale =
    (self.getData("range", "numOfPts") - 1)/ self.getChartProp("sizes", "width");
   
  //do the conversion to index
  var index = Math.round((e.pageX - self.getChartOffset().x) * scale);
   
  //index needs to be offset in case we are not
  //starting at the beginning of the data set
  index -= self.getData("range", "start");
  alert(index);
  return ;
}
*/

Dave_js.chart_zoom.prototype.start = function(i){
  var self = this;

  //make sure the calculated index is within the currently displayed range
  i = Math.max(self.getData("range", "start"), i);
  i = Math.min(self.getData("range", "stop"), i);
  
  self.setMousedown(true);
  self.setStart(i);
};

Dave_js.chart_zoom.prototype.stop = function(i, x){
  var self = this;
  
  //ignore mouseup events unless the mouse was just down
  if(!self.getMousedown()){return;}
  
  //make sure the calculated index is within the currently displayed range
  i = Math.max(self.getData("range", "start"), i);
  i = Math.min(self.getData("range", "stop"), i);
  
  self.setMousedown(false);
  
  //shrink the highlighted region back down
  self.moveMask(x);
  
  //remove the coordinate display
  var message = self.getPlotElement("coordMsg");
  if(message){message.box.parentNode.removeChild(message.box);}
  
  //zoom to fit selected points
  if(self.getStart() == i){
    //did not select any points, unzoom
    self.getPlotInstance().buildPlot();
  } else {
    //use Math.min/max to determine the order
    self.getPlotInstance().buildPlot(
      Math.min(self.getStart(), i), Math.max(self.getStart(), i)
    );
  }
};

Dave_js.chart_zoom.prototype.moveMask = function(x){
  var self = this;
  
  var canvas = self.getPlotElement("canvas");
  var mask = self.getZoomMask();
  
  //calculate the right hand mask first because it always is resized
  mask.r.style.left =
    Math.max( //make sure the left edge of the right mask never leaves the plot
      (x + 2), (canvas.offsetLeft + self.getChartProp("origin", "x"))
    ) + "px";
  mask.r.style.width =
    Math.min( //make sure the right mask is never larger than the plot width
      Math.max( //make sure the right mask width is never negative
        (
          self.getChartProp("sizes", "width") -
          parseInt((mask.r.style.left), 10) +
          canvas.offsetLeft + self.getChartProp("origin", "x")
        ),
        0
      ),
      self.getChartProp("sizes", "width")
    ) + "px";
  
  //only calculate the left mask if the mouse button is not down
  if(!self.getMousedown()){
    mask.l.style.left =
      canvas.offsetLeft + self.getChartProp("origin", "x") + "px";
    mask.l.style.width =
      Math.min(
        Math.max(
          (x - canvas.offsetLeft - self.getChartProp("origin", "x") - 2), 0
        ),
        self.getChartProp("sizes", "width")
      ) + "px";
  }
};

Dave_js.chart_zoom.prototype.destroy = function(){
  var self = this;
  var mask = self.getZoomMask();
  
  if(mask.l.parentNode !== undefined){
    mask.l.parentNode.removeChild(mask.l);
    mask.r.parentNode.removeChild(mask.r);
  }
  mask = null;
  
  return null;
};