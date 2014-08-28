Dave_js.DataSet = function DataSet(ds) {
  if(!ds){
    console.log("Can not create null DataSet.");
    return;
  }

  //make sure the DataSet has the appropriate labels set
  if (!this.verify(ds)) {
    return false;
  }

};

Dave_js.DataSet.prototype.verify = function verify(ds) {
  var
    depVar = ds.depVar,
    indepVar = ds.indepVar,
    numOfPnts = ds[depVar].length,
    var_i,
    depVarData;

  if (!ds.id) {
    console.log('DataSet.id must be set.');
    return false;
  }

  if (!indepVar) {
    console.log('DataSet.indepVar must be set.');
    return false;
  }

  if (!ds[indepVar]) {
    console.log(
      'DataSet.' + indepVar + ' is listed as DataSet.indepVar, ' +
      'but does not exist.'
    );
    return false;
  }

  if (depVar.length < 1) {
    console.log('No dependent variables listed in DataSet.depVar.');
    return false;
  }

  for (var_i = 0; var_i < depVar.length; var_i++) {
    depVarData = ds[depVar[var_i]];

    //make sure the specified variables are set
    if (!depVarData) {
      console.log(
        'DataSet.' + depVar[var_i] + ' is listed in DataSet.depVar, ' +
        'but does not exist.'
      );
      return false;
    }

    //make sure all the variables are the same length
    if(depVarData.length !== numOfPnts){
       console.log(
        'DataSet.' + depVar[var_i] + ' has a length of ' + depVarData.length +
        ' but DataSet.' + indepVar + ' has set the variable length to ' +
        numOfPnts + '.'
      );
      return false;
    }
  }

  return true;
};