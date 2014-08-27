Dave_js.DataStore = (function DataStoreFactory() {

  var //these variables will keep track of all instances of DataStore
    stores = {},
    totalStores = 0;
    
  function DataStore() {
    this.id = totalStores++; //use the total number of stores as the store id
    
    var store = stores[this.id] = {};//init the new store to be an empty object

    store.dataSets = {}; //Keeps all of the data sets in this store
    store.setNames = []; //Name of each data set. The length of this array is 
                         // limited by maxSets.
    store.maxSets = 10;  //Total number of old data sets we will store before 
                         // deleting old ones.
  }

  DataStore.prototype.hasDataSet = function hasDataSet(name) {
    return stores[this.id].dataSets.hasOwnProperty(name);
  };

  DataStore.prototype.cacheLength = function cacheSize() {
    return stores[this.id].length;
  };

  DataStore.prototype.getDataSet = function getDataSet(name) {
    if (this.hasDataSet(name)) {
      return {
        'name': name,
        'data': stores[this.id].dataSets[name]};
    } else {
      return false;
    }
  };

  DataStore.prototype.dataDump = function dataDump(name) {
    return JSON.parse(JSON.stringify(stores[this.id].dataSets));
  };

  DataStore.prototype.addDataSet = function addDataSet(dataSet, force) {
    var store = stores[this.id];
    
    if (this.hasDataSet(name)) {
      //do not overwrite the old dataset unless force is set
      if (force !== true){
        console.log(
          'DataStore id = ' + this.id +
          " already has a dataset named " + name + "."
        );
        return false;
      } else {
        //get ready for new the replacement dataSet
        this.removeDataSet(name);
      }
    }

    //add the new dataset to the store
    store.dataSets[name] = dataSet;
    store.setNames.push(name);

    //check if we need to remove old data
    if(this.cacheLength() > store.maxSets){
      this.removeSet(store.setNames[0]);
    }

    return true;
  };

  DataStore.prototype.removeDataSet = function removeDataSet(name){
    var
      names = stores[this.id].setNames,
      namesLength = names.length,
      name_i;
    
    //remove the name from the list
    for(name_i = 0; name_i < namesLength; name_i++){
      if(names[name_i] === name){
        names.splice(name_i, 1);
        delete stores[this.id].dataSets[name];
        return true;
      }
    }

    //could not find data set
    return false;
  };

  DataStore.prototype.listDataSets = function listDataSets() {
    return stores[this.id].names.join(', ');
  };

  DataStore.prototype.destroy = function addDataSet() {
    delete stores[this.id];
  };

  return DataStore;
})();