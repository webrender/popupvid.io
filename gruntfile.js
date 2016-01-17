// Gruntfile.js
module.exports = function(grunt) {

  grunt.initConfig({

    // JS TASKS ================================================================
    // check all js files for errors
    jshint: {
      all: ['public/src/js/**/*.js']
    },

    // take all the js files and minify them into app.min.js
    uglify: {
      build: {
        files: {
          'public/dist/js/app.min.js': ['public/src/js/**/*.js', 'public/src/js/*.js']
        }
      }
    },

    // CSS TASKS ===============================================================
    // process the less file to style.css
    less: {
      build: {
        files: {
          'public/dist/css/style.css': 'public/src/css/style.less'
        }
      }
    },

    // take the processed style.css file and minify
    cssmin: {
      build: {
        files: {
          'public/dist/css/style.min.css': 'public/dist/css/style.css'
        }
      }
    },

    // COOL TASKS ==============================================================
    // watch css and js files and process the above tasks
    watch: {
      css: {
        files: ['public/src/css/**/*.less'],
        tasks: ['less', 'cssmin']
      },
      js: {
        files: ['public/src/js/**/*.js'],
        tasks: ['jshint', 'uglify']
      }
    },

    express: {
      dev: {
        options: {
          script: 'server.js',
          background: false,
          port: 8080
        }
      }
    },

    // run watch and nodemon at the same time
    concurrent: {
      options: {
        logConcurrentOutput: true
      },
      tasks: ['express', 'watch']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify', 'concurrent']);

};
