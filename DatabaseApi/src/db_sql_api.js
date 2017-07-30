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
				'SELECT name, id, password, avatar FROM `users` WHERE `email` = ?',
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
				`SELECT user_id, course_id, courses.name as course_name, avg_rating, courses.url as url
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
	 * Get all user courses
	 * @param userId The id of the user
	 */

	getAllMyCourses(userId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT user_id, course_id, courses.name as course_name, avg_rating
				FROM users JOIN user_courses ON users.id = user_id JOIN courses ON course_id=courses.id
				WHERE users.id=?
				ORDER BY avg_rating DESC;`,
				[userId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});

	}

	/**
	 * Subscribes user to course
	 * @param {number} userId
	 * @param {number} courseId
	 */
	subscribeToCourse(userId, courseId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO user_courses VALUES(?, ?)`,
				[userId, courseId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Add user as author of course
	 * @param {number} userId // id of the author
	 * @param {number} courseId // id of the course
	 */
	bindAuthorToCourse(userId, courseId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO authors VALUES(?, ?)`,
				[userId, courseId],
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
	//Just for development
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
	 * Edits the content of a course
	 * @param {number} courseId
	 * @param {string} textMd - new md text
	 */
	editModule(courseId, textMd) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`UPDATE modules SET text_md = ? WHERE id = ?`,
				[textMd, courseId],
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

	getNthModuleFromCourse(courseId, n) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM modules WHERE parent_course_id = ? LIMIT ? OFFSET ?`,
				[courseId, 1, (n-1)],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results ? results[0] : undefined);
				}
			);
		});
	}

	/**
	 * Rate a module
	 * @param {number} userId
	 * @param {number} moduleId
	 * @param {number} rating - Number from 0 to 5
	 */
	rateModule(userId, moduleId, rating) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`REPLACE INTO ratings (user_id, module_id, rating) VALUES (?, ?, ?)`,
				[userId, moduleId, rating],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
					this.propagateModuleRating(moduleId);
				}
			);
		});
	}

	/**
	 * Retrieves the rating given by an user to a module
	 * @param {number} userId
	 * @param {number} moduleID
	 * @returns {(number|-1)} What rating had this user given to this module or -1 if none
	 */
	moduleRatingFromUser(userId, moduleId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM ratings WHERE user_id=? AND module_id=?`,
				[userId, moduleId],
				(err, results, fields) => {
					if (err) reject(err);
					if (results.length > 0)
						resolve(results[0].rating);
					else
						resolve(-1);
				}
			);
		});
	}

	propagateModuleRating(moduleId) {
		this.connection.query(
			`UPDATE modules SET avg_rating=(SELECT AVG(rating) FROM ratings WHERE module_id=?) WHERE id=?`,
			[moduleId, moduleId],
			(err, results, fields) => {
				if (err) reject(err);
				//console.log("propagate 1: ");
				this.getModuleParent(moduleId).then(data => {
					this.propagateCourseRating(data);
				});
			}
		);
	}

	/**
	 * Get course parent of module
	 * @param {number} moduleId
	 * @returns id of the course which is parent to this module
	 */
	getModuleParent(moduleId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT parent_course_id FROM modules WHERE id = ?`,
				[moduleId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results[0].parent_course_id);
					//propagateCourseRating(getModuleParent(moduleId));
				}
			);
		});
	}

	propagateCourseRating(courseId) {
		this.connection.query(
			`UPDATE courses SET avg_rating=(SELECT AVG(avg_rating) FROM modules WHERE parent_course_id=?) WHERE id=?`,
			[courseId, courseId],
			(err, results, fields) => {
				if (err) reject(err);
				//console.log("propagate 2: ");
			}
		);
	}

	/**
	 * Adds comment by user(userId) to module(moduleId)
	 * @param {number} userId
	 * @param {number} moduleId
	 * @param {string} comment
	 */
	addCommentToModule(userId, moduleId, comment) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO comments (user_id, module_id, comment_text) VALUES (?, ?, ?)`,
				[userId, moduleId, comment],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Retrieves all comments for module(moduleID)
	 * @param {number} moduleId
	 * @returns {object[]} - array of comments
	 */
	getCommentsFromModule(moduleId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM comments WHERE module_id=?`,
				[moduleId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Marks in database that user(userId) finished module(moduleId)
	 * @param {number} userId
	 * @param {number} moduleId
	 */
	saveUserFinishedModule(userId, moduleId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO finished (user_id, module_id) VALUES (?, ?)`,
				[userId, moduleId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Returns true / false wether the user finished the module
	 * @param {number} userId
	 * @param {number} moduleId
	 */
	hasUserFinishedModule(userId, moduleId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM finished WHERE user_id=? AND module_id=?`,
				[userId, moduleId],
				(err, results, fields) => {
					if (err) reject(err);
					if (results.length > 0)
						resolve(true);
					else
						resolve(false);
				}
			);
		});
	}

	/**
	 * Adds a question to course (courseId)
	 * @param {number} courseId
	 * @param {string} questionText
	 * @returns {number} - The id of the question inserted
	 */
	addQuestionToCourse(courseId, questionText) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO exercises (course_parent, question) VALUES (?, ?)`,
				[courseId, questionText],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results.insertId);
				}
			);
		});
	}

	/**
	 * Adds an answer to question (questionId)
	 * @param {number} questionId
	 * @param {string} answerText
	 * @returns {number} - the id of the inserted answer
	 */
	addAnswerToQuestion(questionId, answerText) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`INSERT INTO answers (exercise_parent, answer_text) VALUES (?, ?)`,
				[questionId, answerText],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results.insertId);
				}
			);
		});
	}

	/**
	 * Sets which is the correct answer for question (questionId)
	 * @param {number} questionId
	 * @param {number} answerId
	 */
	setCorrectAnswer(questionId, answerId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`UPDATE exercises SET correct_answer=? WHERE id=?`,
				[answerId, questionId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * Retrives all answers from a question
	 * @param {number} questionId
	 */
	getQuestionAnswers(questionId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT * FROM answers WHERE exercise_parent=?`,
				[questionId],
				(err, results, fields) => {
					if (err) reject(err);
					resolve(results);
				}
			);
		});
	}

	/**
	 * @typedef {Object} Exercise
	 * @property {number} id The id of the exercise / question
	 * @property {string} question The question of the exercise
	 * @property {Object[]} answers The possible answers of the question
	 */

	/**
	 * Retrieves all question(without correct column) + their answers
	 * @param {number} courseId
	 * @returns {Exercise[]} all the exercises for that course
	 */
	getEntireTest(courseId) {
		return new Promise((resolve, reject) => {
			this.connection.query(
				`SELECT id, question FROM exercises WHERE course_parent=?`,
				[courseId],
				(err, results, fields) => {
					if (err) reject(err);
					let exes = results;
					if (!exes || !exes.length || exes.length < 1) {
						resolve([]);
						return;
					}
					this.connection.query(
						`SELECT exercises.id as exercise_id, answers.id as answer_id, answer_text FROM exercises JOIN answers on exercises.id = exercise_parent AND exercises.course_parent=?
						ORDER BY exercise_id ASC`,
						[courseId],
						(err, results, fields) => {
							var i = 0;
							exes[0].answers = [];
							for (var j = 0; j < results.length; j++) {
								while (results[j].exercise_id != (i+1) && i < exes.length) {
									i++;
									exes[i].answers = [];
								}
								if (i >= exes.length) break;
								exes[i].answers.push({id: results[j].answer_id, answerText: results[j].answer_text});
							}
							resolve(exes);
						}
					);
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
	 * @returns {number} - The id of the inserted codeBound
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
							resolve(results.insertId);
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
			if (!breakpoints.length)
				resolve();
			else {
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
			}
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
			if (!watches.length)
				resolve();
			else {
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
			}
		});
	}

	/**
	 * Retrieves codeBound from database
	 * @param {number} codeId
	 * @returns {CodeBound} - The CodeBound with specified id
	 */
	getCodeBound(codeId) {
		var codeBound = {};
		console.log("Want tot take code " + codeId);
		return new Promise((resolve, reject) => {
			this.connection.query(
				"SELECT * FROM code_sharing WHERE id=?",
				[codeId],
				(err, results, fields) => {
					if (err) reject(err);
					console.log("here " + JSON.stringify(results));
					if (!results || !results.length || results.length < 1)
						resolve();
					else {
						results = results[0];
						codeBound.id = results.id;
						codeBound.code = results.code;
						this.getBreakpoints(codeBound.id).then(data => {
							console.log("then here " + JSON.stringify(data));
							codeBound.breakpoints = data;
							this.getWatches(codeBound.id).then(data => {
								console.log("and then here " + JSON.stringify(data));
								codeBound.watches = data;
								resolve(codeBound);
							});
						});
					}
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
