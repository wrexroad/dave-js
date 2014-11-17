module.exports = function(grunt) {
  //add the davePath string to the begenning of each module name
  var
    pkg = grunt.file.readJSON('package.json'),
    //get a list of files to compile
    srcFiles = [pkg.bigjsPath].concat(pkg.daveFiles),
    //create the filename for the minified version of DaveJS
    uglyName = pkg.name + '-' + pkg.version + '.min.js';

  grunt.initConfig({
    pkg: pkg,
    buildName: '<%= pkg.name %>-<%= pkg.version%>',
    concatFile: '<%= buildName %>.concat.js',
    uglyFile: uglyName,

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
      js: {
        files: [{
          expand: true,
          cwd: '<%= pkg.buildPath%>',
          src: '<%= uglyFile %>',
          dest: '<%= pkg.distPath %>'
        }]
      },
      css: {
        src: '<%= pkg.cssPath%>/dave-js.css',
        dest: '<%= pkg.distPath %>'
      }/*,
      html: {
        src: '<%= pkg.htmlPath%>/**',
        dest: '<%= pkg.distPath %>',
        options: {
          process: function (content, srcpath) {
            return content.replace('btaps.js', uglyName);
          }
        }
      }*/
    },

    jshint: {
      files: ['*.js']
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
  grunt.registerTask('debug', ['test', 'concat:build']);
  grunt.registerTask('build', ['debug', 'uglify:build']);
  grunt.registerTask('dist', ['build', 'copy']);
  grunt.registerTask('default', ['dist']);
};