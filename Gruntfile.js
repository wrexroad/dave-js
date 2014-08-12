module.exports = function(grunt) {
  var
    pkg = grunt.file.readJSON('package.json'),
    srcFiles =
      (function buildSrcList(){
        var
          fileList = [pkg.davePath + 'dave.js'],
          length = pkg.daveMods.length;
        while(length--){
          fileList.push(pkg.davePath + pkg.daveMods.pop());
        }

        return fileList;
      })();

  grunt.initConfig({
    pkg: pkg,
    buildName: '<%= pkg.name %>-<%= pkg.version%>',
    concatFile: '<%= pkg.outputDir %><%= buildName %>.concat.js',
    uglyFile: '<%= pkg.outputDir %><%= buildName %>.min.js',

    concat: {
      build: {
        src: srcFiles,
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
  grunt.registerTask('build', ['jshint', 'concat:build', 'uglify:build']);
  grunt.registerTask('default', ['build']);
};