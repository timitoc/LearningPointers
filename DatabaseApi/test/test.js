const chai = require('chai');
require('dotenv').config({path: '../.env'});

var connection = require('../src/db_connection.js');
let DbApi = require('../src/db_sql_api.js');

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
	});

});
