Dave_js.Utils = {};

Dave_js.Utils.autoRange = function autoRange(unranged){

  var ranged = {
    data: unranged.data || [],
    min: +unranged.min || null,
    max: +unranged.max || null
  };
  
  ranged.min = +unranged.min || null;
  ranged.max = +unranged.max || null;
  
  if(ranged.min === null){
    //no minimum was set for this variable,
    //find the smallest element in the array
    ranged.min = Math.min.apply(null, ranged.data);
  } else {
    //There was a minimum set, 
    //make sure the array does not contain any points smaller than the minimum
    ranged.data = Dave_js.Utils.applyBounds(ranged.data, ranged.min, null);
  }
  if(ranged.max === null){
    ranged.max = Math.max.apply(null, ranged.data);
  } else {
    ranged.data = Dave_js.Utils.applyBounds(ranged.data, null, ranged.max);
  }

  return ranged;
};

Dave_js.Utils.applyBounds = function applyBounds(data, min, max) {
  var
    pnt_i,
    result = data.slice(0);
  
  if(!isNaN(min)){
    for(pnt_i = 0; pnt_i < result.length; pnt_i++){
      result[pnt_i] = Math.min(min, result[pnt_i]);
    }
  }
  
  if(!isNaN(max)){
    for(pnt_i = 0; pnt_i < result.length; pnt_i++){
      result[pnt_i] = Math.max(max, result[pnt_i]);
    }
  }
  return result;
};

Dave_js.Utils.drawTic = function drawTic(ctx, ticLabel, offset) {
  if(ticLabel == "--") {ticLabel = "No Label";}
  ctx.fillText(ticLabel, -5, offset + 5);
  ctx.beginPath();
  ctx.moveTo(0, offset);
  ctx.lineTo(5, offset);
  ctx.stroke();
};

Dave_js.Utils.rangeToArray = function rangeToArray(min, max, length){
  var
    i,
    interval,
    result = [];
  
  interval = (max - min) / length;

  for (i = 0; i < length; i++) {
    result[i] = (min + (i * interval)).toFixed(3);
  }

  return result;
};
