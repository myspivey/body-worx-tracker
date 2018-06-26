(function() {
    "use strict";
    var LIVERELOAD_PORT, lrSnippet, mountFolder;
    const serveStatic = require('serve-static');
    const userInfo = require('user-info');
    const modRewrite = require('connect-modrewrite');

    LIVERELOAD_PORT = 35728;

    lrSnippet = require("connect-livereload")({
        port: LIVERELOAD_PORT
    });

    mountFolder = function(connect, dir) {
        return serveStatic(require("path").resolve(dir));
    };

    module.exports = function(grunt) {
        var yeomanConfig;
        require("load-grunt-tasks")(grunt);
        require("time-grunt")(grunt);

        /* configurable paths */
        yeomanConfig = {
            app: "src",
            bwt: "src/bwt",
            dist: "dist",
            tmp: ".tmp"
        };

        try {
            yeomanConfig.app = require("./bower.json").appPath || yeomanConfig.app;
            yeomanConfig.version = require('./bower.json').version || '-1';
            yeomanConfig.username = userInfo().username;
        } catch(_error) {
        }

        grunt.initConfig({
            yeoman: yeomanConfig,
            watch: {
                compass: {
                    files: ["<%= yeoman.app %>/styles/**/*.{scss,sass}"],
                    tasks: ["compass:server"]
                },
                gruntfile: {
                    files: ['Gruntfile.js']
                },
                livereload: {
                    options: {
                        livereload: LIVERELOAD_PORT
                    },
                    files: [
                        "<%= yeoman.app %>/**/*.html",
                        "<%= yeoman.app %>/**/*.js",
                        "<%= yeoman.app %>/images/**/*.{png,jpg,jpeg,gif,webp,svg}",
                        "<%= yeoman.tmp %>/styles/**/*.css",
                        "environments/**/*.js"
                    ]
                }
            },
            connect: {
                options: {
                    port: 9009,
                    hostname: "localhost"
                },
                livereload: {
                    options: {
                        middleware: function(connect) {
                            return [modRewrite(['!\\.woff|\\ttf|\\.html|\\.js|\\.svg|\\.css|\\.jpg|\\.png$ /index.html [L]']), lrSnippet, mountFolder(connect, ".tmp"), mountFolder(connect, yeomanConfig.app), mountFolder(connect, yeomanConfig.app + "/bower_components/font-awesome")];
                        }
                    }
                },
                dist: {
                    options: {
                        middleware: function(connect) {
                            return [modRewrite(['!\\.woff|\\ttf|\\.html|\\.js|\\.svg|\\.css|\\.jpg|\\.png$ /index.html [L]']), mountFolder(connect, yeomanConfig.dist)];
                        }
                    }
                }
            },
            open: {
                server: {
                    url: "http://localhost:<%= connect.options.port %>"
                }
            },
            clean: {
                dist: {
                    files: [
                        {
                            dot: true,
                            src: ["<%= yeoman.tmp %>", "<%= yeoman.dist %>/*", "!<%= yeoman.dist %>/.git*"]
                        }
                    ]
                },
                all: [
                    ".DS_Store",
                    ".sass-cache",
                    "node_modules",
                    "<%= yeoman.app %>/bower_components",
                    "<%= yeoman.tmp %>"
                ],
                server: "<%= yeoman.tmp %>"
            },
            jshint: {
                options: {
                    jshintrc: ".jshintrc"
                },
                all: ["Gruntfile.js", "<%= yeoman.bwt %>/**/*.js"]
            },
            injector: {
                options: {
                    relative: true
                },
                local_dependencies: {
                    files: {
                        "<%= yeoman.app %>/index.html": [
                            "<%= yeoman.bwt %>/**/*.module.js",
                            "<%= yeoman.bwt %>/**/*.factory.js",
                            "<%= yeoman.bwt %>/**/*.controller.js",
                            "<%= yeoman.bwt %>/**/*.directive.js",
                            "<%= yeoman.bwt %>/**/*.js"
                        ]
                    }
                }
            },
            compass: {
                options: {
                    sassDir: "<%= yeoman.app %>/styles",
                    cssDir: "<%= yeoman.tmp %>/styles",
                    generatedImagesDir: "<%= yeoman.tmp %>/styles/ui/images/",
                    imagesDir: "<%= yeoman.app %>/styles/ui/images/",
                    javascriptsDir: "<%= yeoman.bwt %>",
                    fontsDir: "<%= yeoman.app %>/fonts",
                    importPath: "<%= yeoman.app %>/bower_components",
                    httpImagesPath: "styles/ui/images/",
                    httpGeneratedImagesPath: "styles/ui/images/",
                    httpFontsPath: "fonts",
                    relativeAssets: true
                },
                dist: {
                    options: {
                        outputStyle: 'compressed',
                        debugInfo: false,
                        noLineComments: true,
                        sourcemap: false
                    }
                },
                server: {
                    options: {
                        noLineComments: true,
                        sourcemap: true,
                        debugInfo: true
                    }
                },
                forvalidation: {
                    options: {
                        debugInfo: false,
                        noLineComments: false
                    }
                }
            },
            useminPrepare: {
                html: "<%= yeoman.app %>/index.html",
                options: {
                    dest: "<%= yeoman.dist %>",
                    flow: {
                        steps: {
                            js: ["concat", "uglifyjs"],
                            css: ["cssmin"]
                        },
                        post: []
                    }
                }
            },
            usemin: {
                html: ["<%= yeoman.dist %>/**/*.html"],
                css: ["<%= yeoman.dist %>/styles/**/*.css"],
                options: {
                    dirs: ["<%= yeoman.dist %>"]
                }
            },
            htmlmin: {
                dist: {
                    options: {
                        collapseWhitespace: true
                    },
                    files: [
                        {
                            expand: true,
                            cwd: "<%= yeoman.app %>",
                            src: ["index.html"],
                            dest: "<%= yeoman.dist %>"
                        }
                    ]
                }
            },
            copy: {
                dist: {
                    files: [
                        {
                            expand: true,
                            dot: true,
                            cwd: "<%= yeoman.app %>",
                            dest: "<%= yeoman.dist %>",
                            src: [
                                "index.html",
                                "favicon.ico",
                                "favicon/*",
                                "fonts/**/*",
                                "images/**/*",
                                "styles/fonts/**/*",
                                "styles/img/**/*",
                                "styles/ui/images/*"
                            ]
                        }, {
                            expand: true,
                            cwd: "<%= yeoman.tmp %>",
                            dest: "<%= yeoman.dist %>",
                            src: ["assets/**"]
                        }, {
                            expand: true,
                            cwd: "<%= yeoman.tmp %>/images",
                            dest: "<%= yeoman.dist %>/images",
                            src: ["generated/**"]
                        }, {
                            expand: true,
                            cwd: "<%= yeoman.app %>/bower_components/font-awesome",
                            dest: "<%= yeoman.dist %>",
                            src: ["fonts/**"]
                        }, {
                            expand: true,
                            cwd: "<%= yeoman.app %>/bower_components/themify-icons",
                            dest: "<%= yeoman.dist %>",
                            src: ["fonts/**"]
                        }
                    ]
                },
                styles: {
                    expand: true,
                    cwd: "<%= yeoman.app %>/styles",
                    dest: "<%= yeoman.tmp %>/styles/",
                    src: "**/*.css"
                }
            },
            concurrent: {
                server: ["compass:server", "copy:styles"],
                dist: ["compass:dist", "copy:styles", "htmlmin"]
            },
            cssmin: {
                options: {
                    keepSpecialComments: '0'
                },
                dist: {}
            },
            concat: {
                dist: {}
            },
            uglify: {
                options: {
                    mangle: true,
                    compress: {
                        drop_console: true
                    }
                },
                dist: {}
            },
            ngAnnotate: {
                options: {
                    singleQuotes: true
                },
                dist: {
                    files: [{
                        expand: true,
                        cwd: '<%= yeoman.tmp %>/concat/scripts',
                        src: '*.js',
                        dest: '<%= yeoman.tmp %>/concat/scripts'
                    }]
                }
            },
            ngtemplates: {
                app: {
                    cwd: '<%= yeoman.app %>',
                    src: 'bwt/**/*.html',
                    dest: '<%= yeoman.tmp %>/template.js',
                    options: {
                        module: 'bwt',
                        usemin: 'scripts/bwt.min.js', // <~~ This came from the <!-- build:js --> block
                        htmlmin: {
                            collapseBooleanAttributes:      true,
                            collapseWhitespace:             true,
                            removeAttributeQuotes:          true,
                            removeComments:                 true, // Only if you don't use comment directives!
                            removeEmptyAttributes:          true,
                            removeRedundantAttributes:      true,
                            removeScriptTypeAttributes:     true,
                            removeStyleLinkTypeAttributes:  true
                        }
                    }
                }
            },
            replace: {
                local: {
                    options: {
                        patterns: [{
                            json: grunt.file.readJSON('environments/constants.local.json')
                        }]
                    },
                    files: [{
                        expand: true,
                        flatten: true,
                        src: ['environments/constants.js'],
                        dest: '<%= yeoman.tmp %>/'
                    }]
                },
                dev: {
                    options: {
                        patterns: [{
                            json: grunt.file.readJSON('environments/constants.dev.json')
                        }]
                    },
                    files: [{
                        expand: true,
                        flatten: true,
                        src: ['environments/constants.js'],
                        dest: '<%= yeoman.tmp %>/'
                    }]
                },
                prod: {
                    options: {
                        patterns: [{
                            json: grunt.file.readJSON('environments/constants.prod.json')
                        }]
                    },
                    files: [{
                        expand: true,
                        flatten: true,
                        src: ['environments/constants.js'],
                        dest: '<%= yeoman.tmp %>/'
                    }]
                }
            }
        });
        grunt.registerTask("server", function(target) {
            grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        });
        grunt.registerTask("serve", function(target) {
            if(target === "dist") {
                return grunt.task.run(["buildlocal", "open", "connect:dist:keepalive"]);
            }
            return grunt.task.run(["clean:server", "replace:local", "concurrent:server", "connect:livereload", "open", "watch"]);
        });

        grunt.registerTask("build", ["injector", "useminPrepare", "concurrent:dist", "copy:dist", "cssmin", "ngtemplates", "concat", "ngAnnotate", "uglify", "usemin"]);

        grunt.registerTask("local", ["clean:dist", "replace:local", "build"]);
        grunt.registerTask("dev", ["clean:dist", "replace:dev", "build"]);
        grunt.registerTask("prod", ["clean:dist", "replace:prod", "build"]);

        return grunt.registerTask("default", ["serve"]);
    };
})();
