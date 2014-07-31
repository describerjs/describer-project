/**
 * Created by aotten77 on 31.03.2014.
 */
module.exports = function(grunt){

	var getObjFor = function(path, searchpath){
		return {
			from: new RegExp("\'"+ path.replace(/\//g, '\\/') +"[^/\\n]*\'", "g"),
			// string replacement
			to: function(matchedWord, index, fullText, regexMatches){
				var _filename = '';
				var _searchpath = searchpath || '';
				grunt.file.recurse(_searchpath+path, callback);
				function callback(abspath, rootdir, subdir, filename) {
					var str = filename;
					var patt = new RegExp('^'+matchedWord.replace(/\'/g, "").replace(path, "")+'\\.(.*)');
					var res = patt.test(str);
					if(res && (subdir == undefined)){
						str = str.substring(0, str.length - ((str.substr(str.length - 3) === '.js') ? 3 : 4));
						_filename = str;
					}
				}
				return "\'"+ path + _filename +"\'";
			}
		};
	};
	// here we want to preserver the BOM of the layout file, otherwise all of the umlauts will die
	grunt.file.defaultEncoding = 'utf8';
	grunt.file.preserveBOM = true;

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-asset-revisions');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks("grunt-remove-logging");
	grunt.loadNpmTasks('grunt-dalek');
	grunt.loadNpmTasks('grunt-imageoptim');
	grunt.loadNpmTasks('grunt-webp');

	grunt.registerTask('task_step1', function(){
		grunt.initConfig({
			clean: {
				clean: ["css/min/", "js/build/"]
			},
			uglify: {
				build : {
					src     : ['**/*.js', '!*.min.js', '!main.js'],
					cwd     : 'js/',
					dest    : 'js/build/',
					expand  : true
				}
			},
			copy: {
				main: {
					src: ['**/*.js', '!*.min.js', '!main.js'],
					cwd: 'js/',
					dest: 'js/build/',
					expand  : true
				}
			},
			cssmin: {
				compress: {
					files: {
						'css/min/style.css': ['css/style.css'],
						'js/build/require-css/video.css': ['js/require-css/video.css']
					}
				}
			},
			revisions: {
				rename: {
					src: ['js/build/**', 'css/min/**'],
					dest: ''
				}
			}
		});
	});

	grunt.registerTask('task_step2', function(){
		grunt.initConfig({
			replace: {
				example: {
					src: ['js/main.js'],             // source files array (supports minimatch)
					dest: 'js/build/main.js',             // destination directory or file
					replacements: [
						getObjFor('externals/customized/', 'js/build/'),
						getObjFor('externals/customized/overwritings/', 'js/build/'),
						getObjFor('externals/originalReferenceSource/', 'js/build/'),
						getObjFor('externals/vendor/', 'js/build/'),
						getObjFor('mylibs/', 'js/build/'),
						getObjFor('mylibs/actions/', 'js/build/'),
						getObjFor('mylibs/add-ons/', 'js/build/'),
						getObjFor('mylibs/ayyildiz/', 'js/build/'),
						getObjFor('mylibs/jmtools/', 'js/build/'),
						getObjFor('mylibs/modules/', 'js/build/'),
						getObjFor('mylibs/modules/formcomponents/', 'js/build/'),
						getObjFor('mylibs/utils/', 'js/build/'),
						getObjFor('require-css/', 'js/build/')
					]
				}
			}
		});
	});
	// Project configuration.
	grunt.registerTask('task_step3', function(){
		grunt.initConfig({
			uglify: {
				build : {
					src     : ['js/build/main.js'],
					expand  : true
				}
			},
			revisions: {
				rename: {
					src: 'js/build/main.js',
					dest: ''
				}
			}
		});
	});

	grunt.registerTask('task_step4', function(){
		grunt.initConfig({
			replace: {
				example: {
					src: ['Views/Shared/_Layout.cshtml'],             // source files array (supports minimatch)
					dest: 'Views/Shared/_Layout.cshtml',             // destination directory or file
					replacements: [{
						from: /css\/min\/(.*?)\.css/g,                   // string replacement
						to: function(matchedWord, index, fullText, regexMatches){
							var _filename = '';
							grunt.file.recurse('css/min', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^style.(.*)/g);
								var res = patt.test(str);
								if(res){
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "css/min/"+ _filename;
						}
					},
					{
						from: /js\/build\/externals\/customized\/require.2.1.11(.*?)\.js/g,                   // string replacement
						to: function(matchedWord, index, fullText, regexMatches){
							var _filename = '';
							grunt.file.recurse('js/build/externals/customized', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^require.2.1.11.(.*)/g);
								var res = patt.test(str);
								if(res){
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "js/build/externals/customized/"+ _filename;
						}
					},
					{
						from: /js\/build\/externals\/customized\/modernizr.custom(.*?)\.js/g,                   // string replacement
						to: function (matchedWord, index, fullText, regexMatches) {
							var _filename = '';
							grunt.file.recurse('js/build/externals/customized', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^modernizr.custom.(.*)/g);
								var res = patt.test(str);
								if (res) {
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "js/build/externals/customized/" + _filename;
						}
					},
					{
						from: /js\/build\/externals\/vendor\/matchmedia(.*?)\.js/g,                   // string replacement
						to: function (matchedWord, index, fullText, regexMatches) {
							var _filename = '';
							grunt.file.recurse('js/build/externals/vendor', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^matchmedia.(.*)/g);
								var res = patt.test(str);
								if (res) {
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "js/build/externals/vendor/" + _filename;
						}
					},
					{
						from: /js\/build\/externals\/originalReferenceSource\/picturefill2(.*?)\.js/g,                   // string replacement
						to: function (matchedWord, index, fullText, regexMatches) {
							var _filename = '';
							grunt.file.recurse('js/build/externals/originalReferenceSource', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^picturefill2.(.*)/g);
								var res = patt.test(str);
								if (res) {
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "js/build/externals/originalReferenceSource/" + _filename;
						}
					},
					{
						from: /\/js\/build\/main(.*)\'/g,                   // string replacement
						to: function(matchedWord, index, fullText, regexMatches){
							var _filename = '';
							grunt.file.recurse('js/build', callback);
							function callback(abspath, rootdir, subdir, filename) {
								var str = filename;
								var patt = new RegExp(/^main.(.*)/g);
								var res = patt.test(str);
								if(res){
									//grunt.log.write('res: '+_filename);
									_filename = str;
								}

							}
							return "/js/build/"+ _filename + "'";
						}
					}]
				}
			}
		});
	});

	// Project configuration.
	grunt.registerTask('task_step5', function(){
		grunt.initConfig({
			imageoptim: {
				imgcomp: {
					options: {
						jpegMini: true,
						imageAlpha: true,
						quitAfter: true
					},
					src: ['img/charge-credit-opening']
				}
			}
		});
	});

	grunt.registerTask('task_step6', function(){
		grunt.initConfig({
			// WebP configuration
			webp: {
				files: {
					expand: true,
					//cwd: 'path/to/source/images',
/*					src: ['img/add-on-steps/add-on-steps-1.png'],
					dest: '/'*/
					src: ['**/*.jpg', '**/*.png', '!**/productimages/*.png'] ,
					cwd: 'img/',
					dest: 'img/'
				},
				options: {
					binpath: require('webp-bin').path,
					preset: 'photo',
					verbose: true,
					quality: 80,
					alphaQuality: 80,
					compressionMethod: 6,
					segments: 4,
					psnr: 50,
					sns: 50,
					filterStrength: 40,
					filterSharpness: 3,
					simpleFilter: true,
					partitionLimit: 50,
					analysisPass: 6,
					multiThreading: true,
					lowMemory: false,
					alphaMethod: 0,
					alphaFilter: 'best',
					alphaCleanup: true,
					noAlpha: false,
					lossless: false
				}
			}

		});

	});





	grunt.registerTask('default1', ['task_step1', 'clean', 'uglify', 'cssmin', 'revisions' ]);
	grunt.registerTask('default2', ['task_step2', 'replace' ]);
	grunt.registerTask('default3', ['task_step3', 'uglify', 'revisions' ]);
	grunt.registerTask('default4', ['task_step4', 'replace' ]);
	grunt.registerTask('default5', ['task_step5', 'imageoptim' ]);
	grunt.registerTask('default6', ['task_step6', 'webp' ]);

	//grunt.registerTask('ErstelleMainJSMitVersioniertenJSVerweisen', ['createMainJS', 'replace']);
	grunt.registerTask('default', ['default1', 'default2', 'default3', 'default4']);
};