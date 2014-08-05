requirejs.config(
  baseUrl: 'lib',
  paths: {
    davejs: 'davejs',
    modules: 'davejs/modules'
  }
});

requirejs(['dave']);
