module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    buildName: '<%= pkg.name %>-<%= pkg.version%>',
    concatFile: '<%= pkg.outputDir %><%= buildName %>.concat.js',
    uglyFile: '<%= pkg.outputDir %><%= buildName %>.min.js',

    concat: {
      build: {
        src: [].concat('<%= pkg.davePath %>dave.js', '<%= pkg.daveMods %>'),
        dest: '<%= concatFile %>'
      }
    },

    uglify: {
      banner:
        '/*! <%= buildName %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      build: {
        src: '<%= concatFile %>',
        dest: '<%= uglyFile %>'
      }
    },
    
    jshint: {
      files: ['<%= pkg.davePath %>*.js']
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
  grunt.registerTask('default', ['jshint', 'concat:build', 'uglify:build']);
};