module.exports = function(grunt) {

  //add the davePath string to the begenning of each module name
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
    concatFile: '<%= buildName %>.concat.js',
    uglyFile: '<%= buildName %>.min.js',

    concat: {
      build: {
        src: srcFiles,
        dest: '<%= pkg.buildPath%><%= concatFile %>'
      }
    },

    uglify: {
      banner:
        '/*! <%= buildName %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
      build: {
        src: '<%= pkg.buildPath%><%= concatFile %>',
        dest: '<%= pkg.buildPath%><%= uglyFile %>'
      }
    },

    copy: {
      dave:{
        files: [{
          expand: true,
          cwd: '<%= pkg.buildPath%>',
          src: '**',
          dest: '<%= pkg.distPath %><%= pkg.davePath %>'
        }]
      },
      app: {
        src: '<%= pkg.appPath%>/**',
        dest: '<%= pkg.distPath %>'
      },
      html: {
        src: '<%= pkg.htmlPath%>/**',
        dest: '<%= pkg.distPath %>'
      }
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
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('test', ['jshint']);
  grunt.registerTask('build', ['jshint', 'concat:build', 'uglify:build']);
  grunt.registerTask('dist', ['build', 'copy:dave', 'copy:app', 'copy:html']);
  grunt.registerTask('default', ['build']);
};