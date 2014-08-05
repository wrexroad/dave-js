requirejs.config({
  baseUrl: 'js/lib',
  paths: {
    app: '../app',
    davejsModules: 'davejs/modules'
  }
});

requirejs(['app/main']);
