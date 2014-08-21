/*
AjaxDataConnector defines how DaveJS will collect the data it is meant to plot.
This is a very simple module just meant to demonstrate how to write a custom 
data collector for DaveJS. However its use is not required.
*/

Dave_js.AjaxDataConnector = function AjaxDataConnector() {
  this.settings = {};
  this.data = {};

  //default settings
  settings = {
    'url': '',

    //dataFormat can be 'json' or 'table'.
    //if 'table' is set, a 'tableOpts' must also be set.
    'dataFormat': 'json',

    //Set the delimiter for ASCII table columns
    'tableOpts': {
      'delim': ',', //column delimiter
      'header': true, //is there is a title line to use for variable names?
      'commentChar': '#' //lines starting with this character will be ignored
    }
  };

  return this;
};

Dave_js.AjaxDataConnector.prototype.config = function config(s){
  for(var opt in s){
    if(s[opt] !== null){
      this.settings[opt] = s[opt];
    }
  }
};

Dave_js.AjaxDataConnector.prototype.fetchData = function fetchData(callback) {
  var
    self = this,
    dataFormat = this.settings.dataFormat,
    xhr;

  if (this.settings.url === '') {
    console.log("No URL set for AjaxDataConnector");
    return;
  }
  
  xhr = new XMLHttpRequest();
  xhr.open('GET', './'+this.settings.url, true);
  xhr.onreadystatechange = function onreadystatechange(){
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        if ((dataFormat + '').toLowerCase() == 'table') {
          self.processTableData(xhr.response);
        } else if ((dataFormat + '').toLowerCase() == 'json') {
          self.data = xhr.response;
        } else {
          self.data = xhr.response;
          console.log('Unknown data format was specified: ' + dataFormat);
        }
        
        if (typeof callback === 'function') {
          callback();
        }

      } else {
        console.log(
          'Could not load data from ' +
          self.settings.url + ' : ' +
          xhr.status);
      }
    }
  };

  xhr.send();
};

Dave_js.AjaxDataConnector.prototype.getDataField = function getDataField() {
  var
    arg,
    args = Array.prototype.slice.call(arguments, 0),
    argLength = arguments.length,
    result;

  if (argLength === 0) {return;}
  
  result = this.data;

  while ((arg = args.shift())) {
    if (result[arg]) {
      result = result[arg];
    } else {
      console.log("Could not follow full reference chain:");
      console.log("AjaxDataConnector.data" + args);
      break;
    }
  }

  return result;
};

Dave_js.AjaxDataConnector.prototype.processTableData = function processTableData(d){
  var
    line,
    lines = d.split('\n'),
    lineNumber,
    field_i,
    fields = [],
    fieldNames = [],
    data = this.data,
    tableOpts = this.settings.tableOpts;

  if(!lines){
    console.log('Empty dataset from ' + this.settings.url);
    return;
  }

  if (tableOpts.delim === '') {
    console.log('No table delimiter set. Can\'t process data');
  }

  //Get column names and initialize arrays
  fields = (tableOpts.header ? lines.shift() : lines[0]).split(tableOpts.delim);

  if (tableOpts.header) {
    for(field_i = 0; field_i < fields.length; field_i++){
      fieldNames[field_i] = fields[field_i];
      data[fieldNames[field_i]] = [];
    }
  } else {
    for (field_i = 0; field_i < fields.length; field_i++) {
      fieldNames[field_i] = 'var' + field_i;
      data[fieldNames[field_i]] = [];
    }
  }
  
  lineNumber = 0;
  while ((line = lines.shift())) {
    if (line.charAt(0) !== tableOpts.commentChar){
      fields = line.split(tableOpts.delim);
    }

    for(field_i = 0; field_i < fieldNames.length; field_i++){
      data[fieldNames[field_i]].push(fields[field_i]);
    }

    lineNumber++;
  }
};