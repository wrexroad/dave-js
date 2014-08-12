module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildName: '<%= pkg.name %>-<%= pkg.version%>',

    concat: {
      src: [].concat(
        '<%= pkg.davePath %>dave.js', '<%= pkg.daveMods %>'),
      dest: '<%= pkg.outputDir %><%= pkg.outputDir %><%= buildName %>'
    },

    uglify: {
      banner: 
        '/*! <%= buildName %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      src: '<%= pkg.outputDir %><%= buildName %>.concat.js',
      dest: '<%= pkg.outputDir %><%= buildName %>.min.js'
    },
    
    jshint: {
      files: ['<%= pkg.davePath %>/*.js']
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