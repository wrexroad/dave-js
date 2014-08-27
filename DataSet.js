Dave_js.DataSet = function DataSet(ds) {
  if(!ds){
    console.log("Can not create null DataSet.");
    return;
  }

  //make sure the DataSet has the appropriate labels set
  if (!this.testDS(ds)) {
    return false;
  }

  //the data needs to be reorganized as an object whose properties are 
  //the indepVar values set to the depVar values... because that's not
  //confusing...
  return this.associateData(ds);
};

Dave_js.DataSet.prototype.testDS = function associateData(ds){
  var
    depVar = ds.depVar,
    indepVar = ds.indepVar,
    var_i;

  if (!ds.id) {
    console.log('DataSet.id must be set.');
    return false;
  }

  if (!indepVar) {
    console.log('DataSet.indepVar must be set.');
    return  false;
  }

  if (!ds[indepVar]) {
    console.log(
      'DataSet.' + indepVar + ' is listed as DataSet.indepVar, ' +
      'but does not exist.'
    );
    return  false;
  }

  if (depVar.length < 1) {
    console.log('No dependent variables listed in DataSet.depVap.');
    return  false;
  }

  for (var_i = 0; var_i < depVar.length; var_i++) {
    if (!ds[depVar[var_i]]) {
      console.log(
        'DataSet.' + ds[depVar[var_i]] + ' is listed in DataSet.depVar, ' +
        'but does not exist.'
      );
      return  false;
    }
  }

  return true;
};

Dave_js.DataSet.prototype.associateData = function associateData(ds){
  var
    id = ds.id,
    indepVar = ds.indepVar,
    depVar = [].concat(ds.depVar),
    totalPts = ds[indepVar].length,
    pnt_i,
    data = {};
  
  for (pnt_i = 0; pnt_i < totalPnts; pnt_i++) {
    data[ds[indepVar][pnt_i]] = ds[depVar][pnt_i];
  }

  return {
    'id': id,
    'indepVar': indepVar,
    'depVar': depVar,
    'data': data
  };
};