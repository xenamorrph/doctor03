const gulp = require('gulp');
const argv = require('yargs').argv;
//const debug = require('gulp-debug');
const concat = require('gulp-concat');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const inject = require('gulp-inject');
const autoprefixer = require('gulp-autoprefixer');
const fs = require('fs');
const gulpsync = require('gulp-sync')(gulp);
const color = require('gulp-color');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const browserSync = require('browser-sync');
const rename = require("gulp-rename");
const del = require('del');
//const merge = require('gulp-merge');
const each = require('gulp-each');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const path = require('path');
const named = require('vinyl-named');

//const folders = require('gulp-folders');

//https://github.com/imagemin/imagemin-webp#imageminwebpoptions
const webp = require('gulp-webp');

// https://github.com/jakubpawlowicz/clean-css#level-1-optimizations
const cleanCSS = require('gulp-clean-css');

const buildMode = argv.d ? 'dev' : 'prod';

const buildSource = argv.m ? true : false;

const buildConfig = JSON.parse(fs.readFileSync("./config.json", "utf8"));

const timestamp = '?v=' + (+ new Date());
//const subDirectories = fs.readdirSync('app');
/*gulp.task('test', function(done) {

// subDirectories.forEach(function (directoryName) {  // don't use

 for (const directoryName of subDirectories) {  // use this
console.log(directoryName);
	  //gulp.src(path.join(articlePath, directoryName, 'media', '*.{jpg,jpeg,png,gif}'))
	 // gulp.src(path.join(directoryName, '*.{jpg,jpeg,png,gif}'))
	    // do your stuff
	   // .pipe(gulp.dest(path.join('dist', directoryName)))
  };
  done();
});
*/






gulp.task('jsJSON', function(){
	return gulp
		.src(['app/**/script.js', '!app/_template/**/*.js', '!app/_blocks/**/*.js'])
		.pipe(require('gulp-filelist')('js.json', { relative: true }))
		.pipe(gulp.dest('dev'));
});

gulp.task('pug:dev', function(){
	return gulp
		.src(['app/**/index.pug', 'app/**/detail*.pug', 'app/**/section*.pug', '!app/_template/**/*.pug', '!app/_blocks/**/*.pug'])
		.pipe(plumber())
		.pipe(pug({pretty: '\t', basedir: 'app'}))
		//.pipe(replace(/(<img.[^>]*src=(?:"|'))(.[^"]*)(?:"|')/g, '$1'+prjConfig.name+'\/$2"'))
		//.pipe(replace(/(:\surl\("?)(.[^")]*)/g, '$1'+prjConfig.name+'\/$2'))
		//.pipe(replace(/(<script.[^>]*src=(?:"|'))(?!http)(.[^"]*)(?:"|')/g, '$1'+prjConfig.name+'\/$2"'))
		.pipe(gulp.dest('dev'))
		.pipe(browserSync.stream());
});


gulp.task('pugJSON:dev', function(){
	return gulp
		.src(['app/**/index.pug', 'app/**/**/index.pug', '!app/_template/**/*.pug', '!app/_blocks/**/*.pug'])
		.pipe(plumber())
		.pipe(pug({pretty: '\t', basedir: 'app'}))
		//.pipe(replace(/(<img.[^>]*src=(?:"|'))(.[^"]*)(?:"|')/g, '$1'+prjConfig.name+'\/$2"'))
		//.pipe(replace(/(:\surl\("?)(.[^")]*)/g, '$1'+prjConfig.name+'\/$2'))
		//.pipe(replace(/(<script.[^>]*src=(?:"|'))(?!http)(.[^"]*)(?:"|')/g, '$1'+prjConfig.name+'\/$2"'))
		.pipe(require('gulp-filelist')('pages.json', { relative: true }))
		//.pipe(require('gulp-filelist')('pages.json', { relative: true, destRowTemplate: formatter }))
		.pipe(gulp.dest('dev'));	
});

gulp.task("watch:dev", function () {
	browserSync.init({
	server: "dev/",
	notify: false,
	open: true,
	cors: true,
	ui: false
	});

	gulp.watch("app/**/*.js", gulp.series(["jsJSON", "js:dev"]));
	//gulp.watch("app/src/svg/*.svg", gulp.series("svg:dev"));
	gulp.watch(["app/**/*.{jpg,jpeg,png,svg}", "!app/_template/**/*", '!app/_blocks/**/*'], gulp.series("images:dev"));
	gulp.watch(["app/**/*.scss"], gulp.series("css:dev"));
	//gulp.watch(["app/**/*.pug"], gulp.series("pug:dev")).on("change", browserSync.reload);
	gulp.watch(["app/**/*.pug"], gulp.series("pug:dev"));
});


gulp.task('jsCopy:dev', function(done){

});

gulp.task('js:dev', function(){
	return gulp.src('app/**/*.js').pipe(gulp.dest('dev'));
});

gulp.task('images:dev', function(){
	return gulp
		.src(['app/**/*.{jpg,jpeg,png,svg}', '!app/_template/**/*', '!app/_blocks/**/*'])
		.pipe(gulp.dest('dev'));
});

gulp.task('css:dev', function(){
	
	gulp.src(['app/_template/scss/*.{scss,sass}', 'app/_template/*.{scss,sass}'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		/*
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
			}))
		.pipe(each(function(content, file, callback) {

			// определяем вложенность относительно папки build, для замены путей
			var nested = file.path.split(/[\/\\]build[\/\\]/),
				depth = 0;
			
			//if(nested.length > 1){
			depth = nested[1].split(/[\/\\]/).length;
			//}
			newPath = '../'.repeat(depth);

			
            callback(null, content);
        }))*/
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		//.pipe(rename({ suffix: '_' + new Date().getTime()+'.min' }))
		//.pipe(rename({ suffix: '.min' }))
		/*.pipe(rename(function(path){
				path.basename = path.dirname;
				path.dirname = '';
			}))*/
		.pipe(concat('template.css'))
		//.pipe(rename('template.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev/css'))
		.pipe(browserSync.stream());

	return gulp.src(['!app/**/styles.{scss,sass}', 'app/**/style.{scss,sass}', '!app/_template/**/*.{scss,sass}', '!app/_blocks/**/*.{scss,sass}', '!app/src/**/*.{scss,sass}'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
		.pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
			}))
		/*
		.pipe(each(function(content, file, callback) {

			// определяем вложенность относительно папки build, для замены путей
			var nested = file.path.split(/[\/\\]build[\/\\]/),
				depth = 0;
			
			//if(nested.length > 1){
				depth = nested[1].split(/[\/\\]/).length;
			//}
			newPath = '../'.repeat(depth);

			
            callback(null, content);
        }))
        */
		// подставляем пути к картинкам для текущей директории сайта
		//.pipe(replace(/(url\((?:"|')?)(.[^)]*)\)/g, '$1\/'+devPath.relativePath+'\/$2)'))
		//.pipe(replace(/(url\((?:"|')?)(?!data)(.[^)]*)\)/g, '$1\/'+devPath.relativePath+'\/$2)'))
		//.pipe(replace(/(url\((?:"|')?)(.[^)^:]*)\)/g, '$1\/'+devPath.relativePath+'\/$2)'))
/*			.pipe(rename(function(path){
			// убираем вложенность у CSS файлов
			path.dirname = '';
		}))*/
		//.pipe(rename('styles.min.css'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('dev'))
		.pipe(browserSync.stream());
});


gulp.task('copy:dev', function(done){
	// копируем ресурсы
	gulp.src('app/font/*.*').pipe(gulp.dest('dev/font'));
	gulp.src('app/src/fonts/*.*').pipe(gulp.dest('dev/src/fonts'));
	gulp.src('app/src/i/*.*').pipe(gulp.dest('dev/src/i'));
	gulp.src('app/**/i/*.*')
		.pipe(rename(function(path){
			path.dirname = path.dirname.replace(/^index[\/\\]/, '');
		}))
		.pipe(gulp.dest('dev'));
	gulp.src('app/src/img/*.*').pipe(gulp.dest('dev/src/img'));
	gulp.src('app/src/js/dev.js').pipe(gulp.dest('dev/src/js'));
	//gulp.src('app/src/js/*').pipe(gulp.dest('dev/src/js'));
	//gulp.src('app/src/libs/*').pipe(gulp.dest('dev/src/libs'));

	done();
});




gulp.task("run", gulp.series("copy:dev", "css:dev", "pugJSON:dev", "pug:dev", "images:dev", "jsJSON", "js:dev", "watch:dev"));




/////////////////////////////////////////////////////////////////////////////////


gulp.task('js:prod', function(done){
	return gulp.src('app/**/*.js').pipe(gulp.dest('prod'));
});

gulp.task('copy:prod', function(done){
	// не копируем ресурсы
	if(!buildSource) done();

	// копируем ресурсы
	gulp.src(['app/src/**/*.*', '!app/src/js/dev.js']).pipe(gulp.dest('prod/src'));
	gulp.src(['app/**/i/*', 'app/**/img/*'])
		.pipe(gulp.dest('prod'));

	done();
});

gulp.task('clean:prod', function(done){
	// чистим директорию	
	del.sync(['prod/**/*']);

	done();
});

gulp.task('default:prod', function(){
	// собираем default
	return gulp.src([
			'app/**/*.{scss,sass}', 
			'app/_template/scss/*.{scss,sass}',
			'app/_template/*.{scss,sass}',
			'!app/index/**/*.{scss,sass}',
			'!app/_blocks/**/*.{scss,sass}',
			'!app/src/**/*.{scss,sass}'
		])
		.pipe(plumber())
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(each(function(content, file, callback) {

			// заменяем пути на абсолютные из настроек для сервера
			// путь до корня build
			var newPath = buildConfig[buildMode].path.server;

			content = content.replace(/(url\(\s*(?:"|')?)\/(src\/.[^)]*)\s*\)/gi, '$1'+newPath+'$2)');

            callback(null, content);
        }))
		.pipe(concat('default.min.css'))
		.pipe(cleanCSS({compatibility: 'ie8', level: {1: {specialComments: 0}}}))
		.pipe(gulp.dest('prod/css'));
});

gulp.task('template:prod', function(){
/*
	gulp.src(['app/_template/_admin.scss'])
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(rename(function(path){
			console.log('test');
			path.basename = 'admin';
		}))
		.pipe(gulp.dest('prod/css'));
*/
	gulp.src(['app/_template/scss/*.scss'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(gulp.dest('prod/css'));
	// собираем template
	return gulp.src(['app/_template/*.scss', 'app/_template/scss/*.scss'])
		.pipe(plumber())
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(each(function(content, file, callback) {

			// заменяем пути на абсолютные из настроек для сервера
			// путь до корня build
			var newPath = buildConfig[buildMode].path.server;

			content = content.replace(/(url\(\s*(?:"|')?)\/(src\/.[^)]*)\s*\)/gi, '$1'+newPath+'$2)');

            callback(null, content);
        }))
		.pipe(concat('template.min.css'))
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		//.pipe(rename({ suffix: '_' + new Date().getTime()+'.min' }))
		.pipe(gulp.dest('prod/css'));
});

gulp.task('fullcss:prod', function(done){
	
	// собираем полный css страницы по директориям с включением template.css
	gulp.src(['app/**/*.scss', '!app/_template/**/*.scss', '!app/_blocks/**/*.scss', '!app/src/**/*.scss'])
		.pipe(plumber())
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(each(function(content, file, callback) {

			// заменяем пути на абсолютные из настроек для сервера
			var relativePath = file.path.split(/[\/\\]app[\/\\]/)[1]
				.replace(/[^\/\\]+$/, '')
				.replace(/\\/g, '/'),
				str = false,
				indexPage = false;

			if(relativePath == 'index/'){
				indexPage = true;
				relativePath = '';
			}

			var absPath = buildConfig[buildMode].path.server,
				relPath = buildConfig[buildMode].path.server + relativePath;

			// проверяем существование файла, чтобы избежать ошибки при его отсутствие
			if (fs.existsSync('prod/css/template.min.css')) {
		    	// добавляем общие стили для всех страниц
				str = fs.readFileSync('prod/css/template.min.css', "utf8");

					// заменяем пути к папке ресурсов /src/
					str = str.replace(/(url\(\s*(?:"|')?)\/(src\/.[^)]*)\s*\)/gi, '$1'+absPath+'$2)');

					// заменяем пути к картинкам img/
					//str = str.replace(/(url\((?:"|')?)\.\.\/(img\/.[^)]*)\)/gi, '$1'+newPath+'$2)');


			} else {
				console.log(
					'############################' + "\n"
				 + color('TEMPLATE CSS DOES NOT EXISTS', 'RED')
				 + "\n############################");
			}

			content = content.replace(/(url\(\s*(?:"|')?)\/(src\/.[^)]*)\s*\)/gi, '$1'+absPath+'$2)');

			if(indexPage){
				content = content.replace(/(url\(\s*(?:"|')?)\/(img\/.[^)]*)\s*\)/gi, '$1'+absPath+'$2)');
			} else {
				content = content.replace(/(url\(\s*(?:"|')?)(img\/.[^)]*)\s*\)/gi, '$1'+relPath+'$2)');
			}
			

			if(str){
	        	content = str + content;
			}
            callback(null, content);
        }))
		.pipe(sass({outputStyle: 'compressed', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
		//.pipe(rename({ suffix: '_' + new Date().getTime()+'.min' }))
		//.pipe(rename({ suffix: '.min' }))
		/*.pipe(rename(function(path){
				path.basename = path.dirname;
				path.dirname = '';
			}))*/
		.pipe(rename(function(path){
			if(path.dirname == 'index') path.dirname = 'css';
			path.basename = path.basename+'.min';
		}))
		.pipe(gulp.dest('prod'));
   

	done();
});

gulp.task('pagecss:prod', function(done){
	// собираем css по директориям без добавления template
	gulp.src(['app/**/*.scss', '!app/_template/**/*.{scss,sass}', '!app/_blocks/**/*.{scss,sass}', '!app/src/**/*.{scss,sass}'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(each(function(content, file, callback) {

			// заменяем пути из настроек для сервера
			var relativePath = file.path.split(/[\/\\]app[\/\\]/)[1]
				.replace(/[^\/\\]+$/, '')
				.replace(/\\/g, '/'),
				indexPage = false;

			if(relativePath == 'index/'){
				indexPage = true;
				relativePath = '';
			}

			var absPath = buildConfig[buildMode].path.server,
				relPath = buildConfig[buildMode].path.server + relativePath;

			content = content.replace(/(url\(\s*(?:"|')?)\/(src\/.[^)]*)\s*\)/gi, '$1'+absPath+'$2)');


			if(indexPage){
				content = content.replace(/(url\(\s*(?:"|')?)\/(img\/.[^)]*)\s*\)/gi, '$1'+absPath+'$2)');
			} else {
				content = content.replace(/(url\(\s*(?:"|')?)(img\/.[^)]*)\s*\)/gi, '$1'+relPath+'$2)');
			}

            callback(null, content);
        }))
		.pipe(rename(function(path){
			if(path.dirname == 'index') path.dirname = 'css';
			path.basename = 'page_'+path.basename+'.min';
		}))
		.pipe(gulp.dest('prod'));
   

	done();
});

gulp.task('webp:prod', function(){
	return gulp
		.src('prod/**/*.{jpg,jpeg,png}')
        .pipe(webp({quality: 90}))
        .pipe(gulp.dest('prod'))
});

gulp.task('pug:prod', function(){
	return gulp
		.src(['app/**/*.pug', '!app/_template/**/*.pug', '!app/_blocks/**/*.pug'])
		.pipe(plumber())
		.pipe(pug({pretty: '\t', basedir: 'app'}))
		.pipe(gulp.dest('prod'));
});

//gulp.task("build", gulp.series("clean:prod", "template:prod", "default:prod", "pagecss:prod", "fullcss:prod", "copy:prod", "jsJSON", "js:prod", "pug:prod")); //  "copy", "production", "webp:prod"





gulp.task('css2:prod', function(done){
	
	gulp.src(['app/**/*.scss', '!app/_template/**/*.{scss,sass}', '!app/src/**/*.{scss,sass}'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'expanded', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(each(function(content, file, callback) {

			// заменяем пути из настроек для сервера
/*			var relativePath = file.path.split(/[\/\\]app[\/\\]/)[1]
				.replace(/[^\/\\]+$/, '')
				.replace(/\\/g, '/'),
				indexPage = false;

			var absPath = buildConfig[buildMode].path.server,
				relPath = buildConfig[buildMode].path.server + relativePath;*/


			// определяем вложенность относительно папки build, для замены путей
/*			var nested = file.path.split(/[\/\\]app[\/\\]/),
				depth = 1, newPath = '';

			if(nested.length > 1){
				depth = nested[1].split(/[\/\\]/).length - 1;
			}*/

			//newPath = '../'.repeat(depth);
			newPath = '../';

			content = content.replace(/(url\(\s*(?:"|')?)(img\/.[^)'"]*)((?:"|')?\s*\))/gi, '$1'+newPath+'$2'+timestamp+'$3');

            callback(null, content);
        }))
		.pipe(gulp.dest('prod'));
   
	gulp.src(['app/**/*.scss', '!app/_template/**/*.{scss,sass}', '!app/src/**/*.{scss,sass}'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(rename(function(path){
			path.basename = path.basename+'.min';
		}))
		.pipe(gulp.dest('prod'));

	done();
});
gulp.task('js2:prod', function(done){
	return gulp.src('app/**/*.js').pipe(gulp.dest('prod'));
});
gulp.task('pug2:prod', function(){
	return gulp
		.src(['app/**/*.pug', '!app/_template/**/*.pug', '!app/_blocks/**/*.pug'])
		.pipe(plumber())
		.pipe(pug({pretty: '\t', basedir: 'app'}))
		.pipe(each(function(content, file, callback) {

			// определяем вложенность относительно папки build, для замены путей
			var nested = file.path.split(/[\/\\]app[\/\\]/),
				depth = 1, newPath = '';

			if(nested.length > 1){
				depth = nested[1].split(/[\/\\]/).length - 1;
			}

			newPath = '../'.repeat(depth);

			content = content.replace(/(src=")\/(src\/)/gi, '$1'+newPath+'$2');
			content = content.replace(/(href=")\/(css\/)/gi, '$1'+newPath+'$2');
			
            callback(null, content);
        }))
		.pipe(gulp.dest('prod'));
});
gulp.task('template2:prod', function(){
	// не минифицированная версия
	gulp.src(['app/_template/scss/*.scss', 'app/_template/*.scss'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'expanded', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
		.pipe(each(function(content, file, callback) {
			// заменяем пути на абсолютные из настроек для сервера
			// путь до корня build
			//var newPath = buildConfig[buildMode].path.server;
			// заменяем пути к шрифтам на абсолютные

			var newPath = '../';
			content = content.replace(/(url\(\s*(?:"|')?)\/src\/(fonts\/.[^)'"]*)((?:"|')?\s*\))/gi, '$1'+newPath+'$2'+timestamp+'$3');

            callback(null, content);
        }))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(gulp.dest('prod/css'));

	// минифицированная версия .min
	gulp.src(['app/_template/scss/*.scss', 'app/_template/*.scss'])
		.pipe(plumber())
		.pipe(sass({outputStyle: 'compressed', includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
		.pipe(each(function(content, file, callback) {
			// заменяем пути на абсолютные из настроек для сервера
			// путь до корня build
			//var newPath = buildConfig[buildMode].path.server;
			// заменяем пути к шрифтам на абсолютные

			var newPath = '../';
			content = content.replace(/(url\(\s*(?:"|')?)\/src\/(fonts\/.[^)'"]*)((?:"|')?\s*\))/gi, '$1'+newPath+'$2'+timestamp+'$3');

            callback(null, content);
        }))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(rename(function(path){
			path.basename = path.basename+'.min';
		}))
		.pipe(gulp.dest('prod/css'));


	// объединенный файл
	return gulp.src(['app/_template/*.scss', 'app/_template/scss/*.scss', '!app/_template/scss/fonts.scss'])
		.pipe(plumber())
		.pipe(sass({includePaths: ['app/src/js', 'app/_template', 'app/_blocks']}).on('error', sass.logError))
		.pipe(each(function(content, file, callback) {
			// заменяем пути на абсолютные из настроек для сервера
			// путь до корня build
			//var newPath = buildConfig[buildMode].path.server;
			// заменяем пути к шрифтам на абсолютные

			var newPath = '../';

			content = content.replace(/(url\(\s*(?:"|')?)\/src\/(fonts\/.[^)'"]*)((?:"|')?\s*\))/gi, '$1'+newPath+'$2'+timestamp+'$3');

            callback(null, content);
        }))
        .pipe(autoprefixer({
				browsers: ['> 1%', 'last 20 versions', 'Firefox < 20'],
				cascade: false
		}))
		.pipe(concat('template.css'))
		.pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
		.pipe(gulp.dest('prod/css'));
});
gulp.task('copy2:prod', function(done){
	// не копируем ресурсы
	if(!buildSource) done();

	// копируем ресурсы
	gulp.src(['app/src/**/*.*', '!app/src/js/dev.js']).pipe(gulp.dest('prod/src'));
	gulp.src(['app/**/i/*', 'app/**/img/*'])
		.pipe(gulp.dest('prod'));

	done();
});
gulp.task("build", gulp.series("clean:prod", "template2:prod", /*"default:prod",*/ "css2:prod", /*"fullcss:prod",*/ "copy2:prod", "js2:prod", "pug2:prod")); //  "copy", "production", "webp:prod"