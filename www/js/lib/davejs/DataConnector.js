/*
DataCollector defines how DaveJS will collect the data it is meant to plot.
This is a very simple module just meant to demonstrate how to write a custom 
data collector for DaveJS. However its use is not required.
*/

Dave_js.DataCollector = function DataCollector() {
  var
    settings,
    dataLoadEvent = new Event('dataLoaded'),
    data = {};

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

  return {'data': data};
};

Dave_js.DataCollector.prototype.config = function config(s){
  for(var opt in s){
    if(s[opt] !== null){
      this.settings[opt] = s[opt];
    }
  }
};

Dave_js.DataCollector.prototype.fetchData = function fetchData() {
  var
    self = this,
    xhr;

  if (this.settings.url === '') {
    console.log("No URL set for DataCollector");
    return;
  }
  
  xhr = new XMLHttpRequest();
  xhr.open('GET', this.settings.url, true);
  xhr.onreadystatechange = function onreadystatechange(){
    if (xhr.readyState == 4) {
      if (xhr.staus == 200) {
        if (self.dataFormat.toLowerCase() == 'table') {
          self.processTableData(xhr.response);
        } else if (self.dataFormat.toLowerCase() == 'json') {
          self.data = xhr.response;
        } else {
          self.data = xhr.response;
          console.log('Unknown data format was specified: ' + self.dataFormat);
        }

        window.document.getElementsByTagName('body')[0].
          dispatchEvent(this.dataLoadEvent);
      } else {
        console.log(
          'Could not load data from ' +
          this.settings.url + ' : ' +
          xhr.status);
      }
    }
  };

  xhr.send();
};

Dave_js.DataCollector.prototype.getDataField = function getDataField() {
  var
    args = arguments,
    argLength = arguments.length,
    arg_i,
    result;

  if (argLength === 0) {return;}
  
  result = data;

  arg_i = 0;
  while (arg_i < argLength) {
    if (result[args[arg_i]]) {
      result = result[args[arg_i]];
    }else {
      console.log("Could not follow full reference chain:");
      console.log("DataCollector.data" + args);

      break;
    }
  }

  return result;
};

Dave_js.DataCollector.prototype.processTableData = function processTableData(d){
  var
    line,
    lines,
    field_i,
    fields,
    fieldNames,
    data = this.data,
    tableOpts = this.settings.tableOpts;

  if (tableOpts.delim === '') {
    console.log('No table delimiter set. Can\'t process data');
  }

  //figure out what to name each column of data
  fields = (tableOpts.header ? lines.shift() : lines[0]).split(tableOpts.delim);

  if (tableOpts.header) {
    for(field_i = 0; field_i < fields.length; field_i++){
      fieldNames[field_i] = fields[field_i];
    }
  } else {
    for (field_i = 0; field_i < fields.length; field_i++) {
      fieldNames[field_i] = 'var' + field_i;
    }
  }
  
  lines = d.split('\n');
  lineNumber = 0;
  do {
    line = lines.shift();

    if (line.charAt(0) !== tableOpts.commentChar){
      fields = line.split(tableOpts.delim);
    }

    for(field_i = 0; field_i < fields.length; field_i++){
      data[fieldNames[field_i]].push(fields[field_i]);
    }

    line_i++;
  } while (lines);
};