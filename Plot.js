Dave_js.Plot = function Plot(type) {
  //figure out what plotter we will be using
  if (typeof Dave_js[type] !== 'function') {
    console.log('Unknown plot type: "' + type + '"');
    return null;
  }
  
  //associate this.plotters functions with this
  this.plotter = new Dave_js[type](this);
  this.loadData = this.plotter.loadData;
  this.plotData = this.plotter.plotData;
  this.decorate = this.plotter.decorate;
  
  this.ctx = null;
  this.vars = {
    x: "",
    y: []
  };
  this.dataStore = null;
};