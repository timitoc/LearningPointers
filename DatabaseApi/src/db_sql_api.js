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
				'SELECT id, password FROM `users` WHERE `email` = ?',
				[email],
				(err, results, fields) => {
					if(err) reject(err);
					if(!results.length)
						return reject('No such email!');

					if(bcrypt.compareSync(password,results[0]['password'])) {
						resolve(results[0]);
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

	createCourseUrl(name) {
		return name
			.split(' ')
			.map(item => {
				return item.toLowerCase();
			})
			.join('-');
	}

	/**
	 * Adds a new course
	 * @param {number} userId /// id of the author
	 * @param {course} course
	 * course format
	 *	name: title of the course
	 *	description: short course description
	 *	difficulty: difficulty of the course(beginner, intermediate, advanced)
	 */
	addCourse(userId, course) {
		console.log(course);
		return new Promise((resolve, reject) => {
			let course_url = this.createCourseUrl(course.name);
			this.connection.query(
				`INSERT INTO courses (name, description, difficulty, url) VALUES (?, ?, ?, ?)`,
				[course.name, course.description, course.difficulty, course_url],
				(err, results, fields) => {
					if (err) reject(err);
					this.bindAuthorToCourse(userId, results.insertId).then(data => {
						resolve(course_url);
					});
				}
			);
		});
	}

	/**
	 *
	 */
	getCourseByUrl(url) {
		return new Promise((resolve, reject) => {
			this.connection.query('SELECT * FROM courses WHERE url = ?', [url], (err, results, fields) => {
				if(err) reject(err);
				resolve(results);
			});
		});
	}

	/**
	 *
	 * @param {number} courseId
	 * @param {module} mod
	 * module format
	 * 	title, text_md
	 */
	addModule(courseId, mod) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO modules (title, text_md, parent_course_id) VALUES (?, ?, ?)`,
				[mod.title, mod.text_md, courseId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Get's all modules of the course with courseId
	 * OBS: doesn't retrieve the content of the module as well, just
	 * id, title, avg_rating
	 * @param {number} courseId
	 */
	getModulesFromCourse(courseId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT id, title, avg_rating FROM modules WHERE parent_course_id = ?`,
				[courseId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}
}

module.exports = DbApi;
