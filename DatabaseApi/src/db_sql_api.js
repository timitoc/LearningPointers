const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

class DbApi {
	constructor(connection) {
		this.connection = connection;
	}

	signupUser(email, password, name, avatar, bio) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT 1 from `users` where `email` = ?',
				[email],
				(err, results, fields) => {
					if(!results.length) {
						this.connection.query(
							'INSERT INTO `users`(email, password, name, avatar, bio) VALUES( ?, ?, ?, ?, ?)',
							[email, bcrypt.hashSync(password), name, avatar, bio],
							(err, results, fields) => {
								if(err) reject(err);
								resolve(results);
							});
					} else {
						console.log(results);
						reject('email taken');
					}
				});
		});
	}

	loginUser(email, password) {
		return new Promise((resolve, reject) => {
			// Prepared statement :))
			this.connection.query(
				'SELECT password FROM `users` WHERE `email` = ?',
				[email],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
		});
	}
}

module.exports = DbApi;
