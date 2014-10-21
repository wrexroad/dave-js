Dave_js.Utils = {};

Dave_js.Utils.autoRange = function autoRange(unranged){

  var
    ranged = {
      data: unranged.data || [],
      min: +unranged.min || null,
      max: +unranged.max || null
    },
    pad = 0;
  
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
  

  //pad data range by 5%
  pad = (ranged.max - ranged.min) * 0.05;
  ranged.min -= pad;
  ranged.max += pad;

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

Dave_js.Utils.getRange = function getRange(data){
  var
    numbers = [],
    num, length, i;

  if(!Array.isArray(data)){return;}

  length = data.length;

  for (i = 0; i < length; i++) {
    num = Dave_js.Utils.forceNumber(data[i]);
    if(!isNaN(num)){
      numbers.push(num);
    }
  }

  return {
    min: Math.min.apply(null, numbers), max: Math.max.apply(null, numbers)
  };
};

Dave_js.Utils.createLabels = function createLabels(min, max, length, converter){
  var
    i,
    interval,
    value,
    result = [];
  
  interval = (max - min) / length;

  for (i = 0; i <= length; i++) {
    value = (min + (i * interval));
    result[i] = {
      text: converter(value),
      coord: value - min
    };
  }

  return result;
};

Dave_js.Utils.forceNumber = function isNaN(num){
  if(typeof num === 'number'){
    //the input was already a number so there is nothing to do
    return num;
  } else if(num ==='0') {
    //make sure '0' is not converted to NaN
    return 0;
  } else {
    //convert anything falsey to NaN and anything truthy to a number
    return (!num ? NaN : +num);
  }
};

Dave_js.Utils.squareDotFactory = function squareDotFactory(opts) {
  //set defaults for missing options
  opts = opts || {};
  var
    color = opts.color || 'black',
    width = +opts.width || 2,
    halfWidth = Math.min((width / 2), 1);

    /*a possible better way of choosing point size
    //take a best guess at point size
    this.setPointSize(
      parseInt((this.chart.sizes.width / this.chart.range.numOfPts / 2), 10)
    );

    //make sure the point is between 2 and 8
    this.setPointSize(
      Math.max(1, Math.min(8, this.chart.sizes.pointSize))
    );
    */

  function dot(coords) {
    this.ctx.fillRect(coords.x - halfWidth, coords.y - halfWidth, width, width);
  }

  return dot;
};

Dave_js.Utils.arrayToObject = function arrayToObject(array){
  var
    i,
    object = {},
    length = (array || []).length || 0;

  for (i = 0; i < array.length; i++) {
     object[array[i]] = array[i];
  }

  return object;
};

Dave_js.Utils.splitFloat = function splitFloat(num){
  var
    parts = ('' + num).split('.'),
    whole = parts[0] || '',
    fract = parts[1] || '',
    exp = fract.length;

  return [
    +whole,
    +fract,
    +exp
  ];
};

Dave_js.Utils.floatSubtraction = function floatSubtraction(num1, num2){
  var
    parts1 = Dave_js.Utils.splitFloat(num1),
    parts2 = Dave_js.Utils.splitFloat(num2),
    wholeDiff = parts1[0] - parts2[0],
    fract1 = parts1[1] * Math.pow(10, parts2[2]),
    fract2 = parts2[1] * Math.pow(10, parts1[2]),
    fractDiff = fract1 - fract2,
    minusone = fractDiff < 0 ? 1 : 0;

  return +(wholeDiff + '.' + Math.abs(fractDiff) - minusone);
};