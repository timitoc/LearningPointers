const chai = require('chai');
const path = require('path');
require('dotenv').config({path: '../.env'});

var connection = require('../src/db_connection.js')(1);
let DbApi = require('../src/db_sql_api.js');

const childProcess = require('child_process');

const ls = childProcess.execFileSync(path.join(__dirname,'prepare.sh'), 
	[process.env.DB_PASS, process.env.DB_NAME_TEST, path.join(__dirname,'generate_tables.sql')]);

describe('Database api', () => {
	describe('Database connection', () => {
		it('Check database connection', (done) => {
			connection.connect(err => {
				done(err);
			});
		});
	});

	describe('Testing find queries', () => {
		dbApi = new DbApi(connection);
		it('Getting courses', function() {
			return new Promise((resolve, reject) => {
				dbApi.getCourses('', 1, 2).then((data) => {
					resolve(data);
				});

			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[0].id).to.equal(2);
			});
		});
		it('Getting my courses', function() {
			return new Promise((resolve, reject) => {
				dbApi.getMyCourses(1, 0, 2).then((data) => {
					resolve(data);
				});

			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[1].course_name).to.equal("ipsum");
			});
		});

		it('Bind and get Author of Course', function() {
			return new Promise((resolve, reject) => {
				dbApi.bindAuthorToCourse(3, 1).then(dbApi.getCourseAuthors(1).then((data) => {
					resolve(data);
				}));
			}).then(data => {
				//console.log(data[0].user_id);
				chai.expect(data[0].user_id).to.equal(3);
			});
		});

		it ('Add new course', function() {
			return new Promise((resolve, reject) => {
				dbApi.addCourse(3, {name: 'proba', description: 'merge', difficulty: 'beginer'}).then(data => {
					resolve(data);
				});
			}).then(data => {
				//console.log(data);
			});
		});

		it ('Add new module', function() {
			return new Promise((resolve, reject) => {
				dbApi.addModule(3, {title: 'smen', text_md: '##f_smen'}).then(data => {
					resolve(data);
				});
			}).then(data => {
				//console.log(data);
			});
		});

		it ('Get Modules from Course', function() {
			return new Promise((resolve, reject) => {
				dbApi.getModulesFromCourse(1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[0].title).to.equal("lore1");
				chai.expect(data[1].title).to.equal("lore2");
			});
		});
	});
});
