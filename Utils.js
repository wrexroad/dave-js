Dave_js.Utils = {};

Dave_js.Utils.ground = function ground(num) {
  var mag, exp, sign;
  
  if(!(num = +num)){return 0;}
  
  //round the value down to the most significant digit    
  exp = num < 1 ?
    -Math.ceil(Math.abs(Math.log10(num))) :
    Math.ceil(Math.abs(Math.log10(num))) - 1;
  mag = Math.pow(10, exp);
  num = (((num / mag)) >> 0) * mag;
  
  return num;
};

Dave_js.Utils.sky = function sky(num) {
  var mag, exp, sign;
  
  if(!(num = +num)){return 0;}

  //round up the value to the incremented most significant digit
  exp = num < 1 ?
    -Math.ceil(Math.abs(Math.log10(num))) :
    Math.ceil(Math.abs(Math.log10(num))) - 1;
  mag = Math.pow(10, exp);
  num = (((num / mag) + 1) >> 0) * mag;

  return num;
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

Dave_js.Utils.createLabels=function createLabels(min, max, varData) {
  var
    label_i, stepSize, converter, sigFigs, range, labels = [], numLabels = 10;

  varData = varData || {};
  converter = varData.converter || Dave_js.Converters.default;
  sigFigs = varData.sigFigs;
  min = new Big(min || 0);
  max = new Big(max || 0);

  //get the range of values
  range = max.minus(min);
  
  //make sure there is a range
  if(max.eq(min)){
    console.error('Dave_js: Cannot create labels when min == max:');
    console.error('\t(' + min + ' == ' + max + ')');
    return [];
  }

  stepSize = range.div(numLabels);
  for (label_i = min; label_i.lte(max); label_i = label_i.plus(stepSize)) {
    labels.push({
      text: converter(+label_i, sigFigs),
      coord: +label_i.minus(min)
    });
  }

  return labels;
};

Dave_js.Utils.createTimeLabels = function createTimeLabels(min, max, varData) {
  var
    label_i, stepSize, sigFigs, range, startDate, numLabels,
    inverseConverse, minute, hr, sec, ms, getDateObject, dateFormatter,
    labels = [];

  varData = varData || {};
  
  //get the Date object and string converters
  dateFormatter =
    varData.converter ||
    (function(time){return (new Date(time)).toUTCString();});

  if(typeof (getDateObject = dateFormatter.toDateObject) !== "function"){
    getDateObject = Dave_js.Converters.jsTime;
  }
  
  //get an inverter for the converter
  inverseConverse = 1 / getDateObject(1);

  //convert min and max to javascript date objects
  min = getDateObject(min);
  max = getDateObject(max);
  startDate = new Date(min);
  
  //get the range of values and the setpSize
  if(max == min){
    console.error('Dave_js: Cannot create labels when min == max:');
    console.error('\t(' + min + ' == ' + max + ')');
    return [];
  }
  range = Math.abs(max - min);

  //Use the range to determine step size and number of labels.
  //Round the starting date based on the stepSize
  if (range <= 10) { //10ms range: 2ms resolution
    stepSize = 2;
  } else if (range <= 100) { //100ms: 20ms res
    stepSize = 20;

    ms = (((startDate.getUTCMilliseconds() / 20) >> 0) * 20);
    startDate.setUTCMilliseconds(ms);

  } else if (range <= 1000) { //1sec: 200ms res
    stepSize = 200;

    ms = startDate.getUTCMilliseconds();
    ms = (((ms / 200) >> 0) * 200) + 200;
    startDate.setUTCMilliseconds(ms);

  } else if (range <= 60000) { //1min: 10sec res
    stepSize = 10000;

    sec = (((startDate.getUTCSeconds() / 10) >> 0) * 10);
    startDate.setUTCSeconds(sec);
    startDate.setUTCMilliseconds(0);

  } else if (range <= 600000) { //10min: 1min res
    stepSize = 60000;

    startDate.setUTCSeconds(60);
    startDate.setUTCMilliseconds(0);

  } else if (range <= 900000) { //15min: 3min res
    stepSize = 180000;

    minutes = (((startDate.getUTCMinutes() / 3) >> 0) * 3);
    startDate.setUTCMinutes(minutes);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);

  } else if (range <= 1800000) { //30min: 5min res
    stepSize = 300000;
   
    minutes = (((startDate.getUTCMinutes() / 5) >> 0) * 5);
    startDate.setUTCMinutes(minutes);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);

  } else if (range <= 3600000) { //1hr: 10min res
    stepSize = 600000;

    minutes = (((startDate.getUTCMinutes() / 10) >> 0) * 10);
    startDate.setUTCMinutes(minutes);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);

  } else if (range <= 43200000) { //12hr: 1hr res
    stepSize = 3600000;

    startDate.setUTCMinutes(60);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);
  } else if (range <= 86400000) { //24hr: 6hr res
    stepSize = 3600000;

    hr = (((startDate.getUTCHours() / 6) >> 0) * 6);
    startDate.setUTCHours(hr);
    startDate.setUTCMinutes(0);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);

  } else { //24hr res
    stepSize = 36000000;
    hr = (((startDate.getUTCHours() / 10) >> 0) * 10);
    startDate.setUTCHours(hr);
    startDate.setUTCMinutes(0);
    startDate.setUTCSeconds(0);
    startDate.setUTCMilliseconds(0);
  }

  for (label_i = +startDate; label_i <= max; label_i += stepSize) {
    if(label_i < min){continue;}
    
    labels.push({
      text: dateFormatter(new Date(label_i)),
      coord: (label_i - min) * inverseConverse
    });
  }

  return labels;
};

Dave_js.Utils.forceNumber = function forceNumber(num){
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

Dave_js.Utils.isNumber = function isNumber(num){
  return !isNaN(Dave_js.Utils.forceNumber(num));
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

Dave_js.Utils.getSigFigs = function getSigFigs(num) {
  var
    significand, parts, numDigits, char_i;

  //check if num is a literal 0
  if (num === 0) {
    return 0;
  }

  //make sure num is a string that can be parsed as a number. 
  //If it is already a number, precision information will be lost
  if (typeof num !== 'string' || isNaN(num)) {
    return null;
  }

  //strip off any scientific notation
  num = num.split('e')[0];
  
  //strip off any negative sign
  if(num.charAt(0) == '-'){num = num.substring(1);}

  //break number into integer and fractional parts
  parts = num.split('.');

  //make sure there is something in the fractional part
  parts[1] = parts[1] || '';

  //remove leading zeros from the integer part
  char_i = 0;
  while (parts[0].charAt(char_i) == '0'){
    char_i++;
  }
  parts[0] = parts[0].substring(char_i);

  //remove leading zeros from the fractional part if integer part is empty
  if(parts[0].length === 0){
    char_i = 0;
    while (parts[1].charAt(char_i) == '0'){
      char_i++;
    }
    parts[1] = parts[1].substring(char_i);
  }

  //count the remaining digits
  return (parts[0].length + parts[1].length);
};