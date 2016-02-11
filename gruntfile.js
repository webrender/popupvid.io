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
        options: {
          mangle: false
        },
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
      },
      views: {
        files: ['public/src/views/**.*'],
        tasks: ['copy:views']
      },
      images: {
        files: ['public/src/img/**.*'],
        tasks: ['copy:images']
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
    },

    copy: {
      views: {
        files: [{
          expand: true,
          cwd: 'public/src/views/',
          src: ['**'],
          dest: 'public/dist/views/'
        }]
      },
      images: {
        files: [{
          expand: true,
          cwd: 'public/src/img/',
          src: ['**'],
          dest: 'public/dist/img/'
        }]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-express-server');

  grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify', 'copy', 'concurrent']);

};
