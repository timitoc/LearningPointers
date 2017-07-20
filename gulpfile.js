const gulp = require('gulp');
const concat = require('gulp-concat');
const path = require('path');
const fs = require('fs');
const uglify = require('gulp-uglify')

let files =  fs.readdirSync('./static/scripts')
	.map(item => {
		return './static/scripts/'+item;
	});

gulp.task('default', function() {
  gulp.src(
	[
		'./static/scripts/converter.js',
		'./static/scripts/button_mapping.js',
		'./static/scripts/editor_gutter_setup.js',
		'./static/scripts/editor_setup.js',
		'./static/scripts/gdb_events.js',
		'./static/scripts/manage_code.js',
		'./static/scripts/watch_table_handler.js',
		'./static/scripts/memory_table_handler.js',
		'./static/scripts/memory_var_x.js',
		'./static/scripts/main_logic.js'
	]
  )
	.pipe(concat('all.js'))
	.pipe(uglify())
	.pipe(gulp.dest('./static/dist/'))
});
