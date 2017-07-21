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
});
