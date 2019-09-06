var { gulp, src, dest, watch, series } = require('gulp');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
const px2rem = require('gulp-px2rem');
var browserSync = require('browser-sync').create();


//sass编译成css
function fnsass(){
	return src('./sass/*.scss')
		.pipe(sass({outputStyle:"expanded"}).on('error', sass.logError))
		.pipe(dest('./css'));
}
//配置
var option = {
  rootValue: 62,
  unitPrecision: 5,
  propertyBlackList: [],
  propertyWhiteList: [],
  replace: true,
  // mediaQuery: false,
  minPx: 1
}
//px转rem
function fnpx2rem(){
	return src('./css/*.css')
		.pipe(px2rem(option))
		.pipe(dest('./style'));
}
//browser-sync
function fnbrow(){
	browserSync.init({
        server: {
            baseDir: "./"
        }
    });
}

function fnwatch(){
	watch('./sass/*.scss', series(fnsass, fnpx2rem));
	watch('*.html').on('change', browserSync.reload);
	watch('./style/*.css').on('change', browserSync.reload);
	watch('./js/*.js').on('change', browserSync.reload);
	fnbrow();
}


exports.w = fnwatch;




