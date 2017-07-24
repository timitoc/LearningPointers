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
					if(err) {
						return reject(err);
					}
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
			this.connection.query(
				'SELECT password FROM `users` WHERE `email` = ?',
				[email],
				(err, results, fields) => {
					if(err) reject(err);
					if(!results.length)
						return reject('No such email!');

					if(bcrypt.compareSync(password,results[0]['password'])) {
						resolve(true);
					} else {
						reject('Wrong password');
					}
				});
		});
	}

	getAvatarByEmail(email) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT avatar FROM users WHERE email = ?',
				[email],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				});
			});
	}

	getAvatarById(id) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT avatar FROM users WHERE id = ?',
				[id],
				(err, results, fields) => {
					if(err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Get Top courses with title matching the regex with respective offset.
	 * @param regex // title matching criteria
	 * @param offset // number of courses to omit
	 * @param count // number of courses to be retrieved
	 */
	getCourses(regex, offset, count) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				'SELECT * FROM courses WHERE name LIKE ? ORDER BY avg_rating DESC LIMIT ? OFFSET ?',
				['%' + regex + '%', count, offset],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Get user courses with pagination
	 * @param userId // user for whom to retrieve courses
	 * @param offset // number of courses to omit
	 * @param count // number of courses to be retrieved
	 */
	getMyCourses(userID, offset, count) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT user_id, course_id, courses.name as course_name, avg_rating 
				FROM users JOIN user_courses ON users.id = user_id JOIN courses ON course_id=courses.id 
				WHERE users.id=? 
				ORDER BY avg_rating DESC LIMIT ? OFFSET ?;`,
				[userID, count, offset],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Add user as author of course
	 * @param {number} userID // id of the author
	 * @param {number} courseID // id of the course 
	 */
	bindAuthorToCourse(userID, courseID) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO authors VALUES(?, ?)`,
				[userID, courseID],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Get a list of the authors of a course
	 * @param {number} courseID 
	 */
	getCourseAuthors(courseID) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM authors JOIN users ON course_id=? AND user_id=users.id`,
				[courseID],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Adds a new course
	 * @param {number} userID /// id of the author 
	 * @param {course} course
	 * course format
	 *	name: title of the course
	 *	description: short course description
	 */
	addCourse(userID, course) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO courses (name) VALUES (?)`,
				[course.name],
				(err, results, fields) => {
					if (err) reject(err);
					this.bindAuthorToCourse(userID, results.insertId).then(data => {
						resolve(data);
					}); 
				}
			);
		});
	}
}

module.exports = DbApi;
