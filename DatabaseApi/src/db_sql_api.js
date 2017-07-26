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

	/**
	 * @typedef {Object} CodeBound
	 * @property {string} code The cpp code
	 * @property {Object[]} breakpoints The breakpoints
	 * @property {Object[]} watches Expressions to be watched
	 */

	/**
	 * Save codeBound to database for codesharing
	 * @param {CodeBound} codeBound
	 */
	saveCodeForSharing(codeBound) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO code_sharing (code) VALUES (?)`,
				[codeBound.code],
				(err, results, fields) => {
					if (err) reject(err);
					this.addBreakpointsToCode(results.insertId, codeBound.breakpoints).then(
						this.addWatchesToCode(results.insertId, codeBound.watches).then(data => {
							resolve(data);
						})
					);
				}
			);
		});
	}

	/**
	 * Adds breakpoints to some codeBound.
	 * @param {number} - Id of the code to which to add the breakpoints
	 * @param {Object[]} breakpoints - The breakpoints to be added.
	 * @param {number} breakpoints[].line - The line of the breakpoint.
	 * @param {number} breakpoints[].temporary - 1 if the breakpoint should be temporary
	 * @param {string} breakpoints[].condition - Breakpoint condition
	 */
	addBreakpointsToCode(codeId, breakpoints) {
		return new Promise((resolve, reject) => {
			var values = [];
			for (var i = 0; i < breakpoints.length; i++) {
				var value = [codeId, breakpoints[i].line, breakpoints[i].temporary, breakpoints[i].condition];
				values.push(value);
			}
			this.connection.query(
				"INSERT INTO breakpoints (parent_id, line, temporary, `condition`) VALUES ?",
				[values],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Adds watches to some codeBound.
	 * @param {number} - Id of the code to which to add the watches
	 * @param {Object[]} watches - The watch to be added.
	 * @param {string} watches[].expr - Watch expression
	 */
	addWatchesToCode(codeId, watches) {
		return new Promise((resolve, reject) => {
			var values = [];
			for (var i = 0; i < watches.length; i++) {
				var value = [codeId, watches[i].expr];
				values.push(value);
			}
			this.connection.query(
				"INSERT INTO watches (parent_id, `expr`) VALUES ?",
				[values],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Retrieves codeBound from database
	 * @param {number} codeId
	 * @returns {CodeBound} - The CodeBound with specified id
	 */
	getCodeBound(codeId) {
		var codeBound = {};
		return new Promise((resolve, reject) => {
			this.connection.query(
				"SELECT * FROM code_sharing WHERE id=?",
				[codeId],
				(err, results, fields) => {
					if (err) reject(err);
					results = results[0];
					codeBound.id = results.id;
					codeBound.code = results.code;
					this.getBreakpoints(codeBound.id).then(data => {
						codeBound.breakpoints = data;
						this.getWatches(codeBound.id).then(data => {
							codeBound.watches = data;
							resolve(codeBound);
						});
					});
				}
			);
		});
	}

	/**
	 * Gets array of breakpoints from database
	 * @param {number} codeId 
	 */
	getBreakpoints(codeId) {
		var codeBound;
		return new Promise((resolve, reject) => {
			this.connection.query(
				"SELECT line, temporary, `condition` FROM breakpoints WHERE parent_id=?",
				[codeId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Gets array of watches from database
	 * @param {number} codeId 
	 */
	getWatches(codeId) {
		var codeBound;
		return new Promise((resolve, reject) => {
			this.connection.query(
				"SELECT expr FROM watches WHERE parent_id=?",
				[codeId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}
}

module.exports = DbApi;
