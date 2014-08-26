(function btaps() {

  //make sure we can access DaveJS
  if (typeof Dave_js !== 'object' || !Dave_js.chart) {
    window.alert("DaveJS plotter has not been built correctly.");
    return;
  }

  //create a place to store data
  if(Dave_js.DataStore){
    var dataStore = new Dave_js.DataStore();
  }

  //load data from 
  function remoteData() {

    /*
      Qurey string for loading data:
      object=<spacecraft name>&
      pktstarttime=<start time>&
      pktendtime=<end time>&
      numpts=<number of points>&
      mnemonics=<mnemonic list>
    */

    var
      plot = new Dave_js.chart("plot"),
      ajax = new Dave_js.AjaxDataConnector();
    
    ajax.config({
      'url': 'https://opsweb.ssl.berkeley.edu/cgi-bin/btaps_cgi_service.cgi',
      'qs': {
        'object': 'nustar_flight',
        'pktstarttime': 1397088000,
        'pktendtime': 1397952000,
        'numpts': 1000,
        'mnemonics': 'epsfast_buscurld+epsfast_busvoltage',
      },
      'dataFormat': 'table',
      'tableOpts': {
        'delim': ',',
        'header': 'true',
        'commentChar': '#'
      }
    });

    //get the plot configured
    plot.setChartSize(300, 800);
    plot.setCanvasHolder('canvasHolder');
    plot.setLabels('remote data', 'Time', 'Data');
    plot.setColor('data', ['green', 'red']);
    plot.setGrid();
    plot.setLegend();
    plot.setType("xy-lines");
    plot.setPointSize(2);
    plot.setLineWidth(1);

    ajax.fetchData(function dataCallback() {
      plot.setData(
        ajax.getDataField('Time'),
        ajax.getDataField('epsfast_buscurld'),
        "epsfast_buscurld"
      );
      plot.setData(
        ajax.getDataField('Time'),
        ajax.getDataField('epsfast_busvoltage'),
        "epsfast_busvoltage"
      );
      plot.buildPlot();
    });
  }

  //draw the plots asynchronously
  setTimeout(remoteData, 100);
})();