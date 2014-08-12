module.exports = function(grunt) {
  var version = '0.0.1';
  var pkgName = 'dave-' + version;

  //where do all of the dave.js library files live?
  var davePath = 'www/js/lib/davejs/';

  //list of all dave.js modules. Do not include dave.js itself
  var daveMods = [
    'dave-chart.js',
    'dave-chart_zoom.js',
    'dave-colorPallet.js',
    'dave-data_filters.js',
    'dave-messages.js'
  ];

  var output = 'build/';

  grunt.initConfig({
    concat: {
      src: [].concat('dave.js', daveMods),
      dest: output + 'dave-' + version + '.concat.js'
    },

    uglify: {
      banner: 
        '/*! ' + pkgName + ' <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      src: output + pkgName + '.concat.js',
      dest: output + pkgName + '.min.js'
    },
    
    jshint: {
      files: [davePath +'/*.js']
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
}