(function(){
var ColorPallet = function(t, n) { 
   var self = this;
   
   //make sure we have valid input
   //valid types are:
   //   "rainbow", rev-rainbow" (reverse rainbow),
   //   "redblue", "rev-redblue",
   //   "blackwhite", "rev-blackwhite",
   if(
      t.indexOf("rainbow") == -1 && 
      t.indexOf("redblue") == -1 && 
      t.indexOf("blackwhite") == -1
   ){
      t = "rainbow";
   }
   //make sure the number of colors is between 1 and 255
   if(isNaN(n) || n == "" || n <= 0){ n = 1;}
   else if(n > 255){ n = 255; }
   
   var type = t; 
   var numOfColors = n;
   
   //define color object
   self.color = function(r,g,b){
      var self = this;
      var vals = {};
      
      self.toHexStr = function(){
         var self = this;
         
         function numToHex(num){
            var hexRef =
               ["0", "1", "2", "3", "4", "5", "6", "7",
               "8", "9", "A", "B", "C", "D", "E", "F"];
            
            var upper = num % 16;
            var lower = parseInt(num / 16);
            
            return hexRef[upper] + "" + hexRef[lower];
         }
         return "#" + numToHex(r) + numToHex(g) + numToHex(b);
      }
      self.toRgbStr = function(){
         return "rgb(" + r + "," + g + "," + b + ")";
      }
   }

   //an array of color objects
   var pallet = new Array();
   
   //Acessors
   self.setType = function(t){
      type = t;
   }
   self.setNumOfColors = function(n){
      numOfColors = n;
   }
   self.putPalletVal = function(r, g, b){
      pallet.push(new self.color(r, g, b));
   }
   self.getType = function(){
      return type;
   }
   self.getNumOfColors = function(){
      return numOfColors;
   }
   self.getColors = function(){
      return pallet;
   }
   self.reversePallet = function(){
      pallet = pallet.reverse();
   }
}

//calculates the pallet values
ColorPallet.prototype.buildPallet = function(){
   var self = this;
   var num = self.getNumOfColors();
   
   if(self.getType().indexOf("rainbow") != -1){
      var stepSize = Math.floor(2 * (255 / num));
      var midpoint = Math.floor(num / 2);
      
      //reduce the loop by two because we manually set the last color
      num -= 1; 
      
      for(var color_i = 0; color_i < midpoint; color_i++){
         self.putPalletVal(
            (255 - (color_i * stepSize)), (color_i * stepSize), 0
         );
      }
      
      for(var color_i = midpoint; color_i < num; color_i++){
         self.putPalletVal(
            0,
            (255 - ((color_i - midpoint) * stepSize)),
            ((color_i - midpoint) * stepSize)
         );
      }
      
      //get last color
      self.putPalletVal(0, 0, 255);
      
      
   }else if(self.getType().indexOf("redblue") != -1){
      var stepSize = Math.floor(255 / num);
      
      for(var color_i = 0; color_i < num; color_i++){
         self.putPalletVal((255 - (color_i * stepSize)), 0, (color_i * stepSize));
      }
   }else if(self.getType().indexOf("blackwhite") != -1){
      var stepSize = Math.floor(255 / num);
      
      for(var color_i = 0; color_i < num; color_i++){
         self.putPalletVal(
            (color_i * stepSize), (color_i * stepSize), (color_i * stepSize)
         );
      }
   }
   
   if(self.getType().indexOf("rev") != -1){
      self.reversePallet();
   }
}

//Takes a div element as input and fills it with color boxes
//The size input determines the pixel width of the color boxes
ColorPallet.prototype.displayColors = function(
   divEl, width, height, border
){
   var self = this;
   var pallet = self.getColors();
   var num = self.getNumOfColors();
   
   //check for a good size
   if(width == 0 || isNaN(width)){
      width = 5;
   }
   if(height == 0 || isNaN(height)){
      height = 5;
   }
   
   //make a valid border size
   if(isNaN(border)){border = 0;}
   
   //make sure a valid div element was given
   if(divEl.tagName != "DIV"){return;}
   
   try{
      var tmpEl;
      
      for(var color_i = 0; color_i < num; color_i++){
         tmpEl = document.createElement("div");
         tmpEl.style.backgroundColor = pallet[color_i].toRgbStr();
         tmpEl.style.border = "solid";
         tmpEl.style.borderWidth = border + "px";
         tmpEl.style.float = "left";
         tmpEl.style.width = width + "px";
         tmpEl.style.height = height + "px";
         
         divEl.appendChild(tmpEl);
      }
      
      tmpEl = document.createElement("div");
      tmpEl.style.float = "clear";
      divEl.appendChild(tmpEl);
   }catch(err){
      
   }
}

//Return an array of color codes in rgb or hex format
ColorPallet.prototype.getPallet = function(f){
   var self = this;
   var pallet = self.getColors();
   var num = self.getNumOfColors();
   var out = new Array(num);
   
   for(var color_i = 0; color_i < num; color_i++){
      if(f == "hex") out[color_i] = pallet[color_i].toHexStr();
      else out[color_i] = pallet[color_i].toRgbStr();
   }
   
   return out;
}

define(function(require){
  return {
    'getName': function(){return "ColorPallet";},
    'init': ColorPallet
  }
});
})();
