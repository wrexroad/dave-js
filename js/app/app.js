Dave_js.setLibRoot(".");
Dave_js.loadMod("chart");
Dave_js.loadMod("message");
Dave_js.loadMod("colorPallet");
Dave_js.loadMod("chart_zoom");

var plot, message;

function init(){
   if(Dave_js.loaded){
      plot = new Dave_js.chart("plot");
   
      var xVals = [50,60,190,-135];
      var yVals = [0,10,50,45];
      plot.setData(xVals, yVals, "first");
      
      xVals = [0,10,90,25];
      yVals = [10,20,30,40];
      plot.setData(xVals, yVals, "second");
      
      plot.setChartSize(300,300);
      
      plot.setCanvasHolder("canvasHolder");
      plot.setLabels("title","x","y");
      plot.setColor("data",["green","black"]);
      plot.setGrid();
      plot.setLegend();
      //plot.setType("hist");
      //plot.setType("polar-points-line");
      plot.setType("xy-points-line");
      plot.buildPlot();
      
      (function (){
         
         var width = 200;
         var height = 200;
      
         var x = (window.innerWidth - width ) / 2;
         var y = (window.innerHeight  - height ) / 2;
         
         
         message = new Dave_js.message();
         message.setSize(200,200);
         message.showMessage("test", x, y);
      }());
      
      var pallet = new Dave_js.colorPallet("rainbow", 10);
      pallet.buildPallet();
      pallet.displayColors(document.getElementById("pallet"), 10, 10);
   }
   else{
      setTimeout(init, 100);
   }
}
init();