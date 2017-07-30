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

	describe('Testing courses queries', () => {
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
				// insert result checked in get query.
			});
		});

		it('Subscribe to course', function() {
			return new Promise((resolve, reject) => {
				dbApi.subscribeToCourse(2, 3).then(dbApi.getMyCourses(2, 0, 1).then(data => {
					resolve(data);
				}));
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[0].url).to.equal("proba");
			});
		})


		it ('Add new module', function() {
			return new Promise((resolve, reject) => {
				dbApi.addModule(3, {title: 'smen', text_md: '##f_smenărie'}).then(data => {
					resolve(data);
				});
			}).then(data => {
				//console.log(data);
				// insert result checked in get query.
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

		it ('Get Nth Module from Course', function() {
			return new Promise((resolve, reject) => {
				dbApi.getNthModuleFromCourse(1, 1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data.title).to.equal("lore1");
			});
		});

		it ('User finish course', function() {
			return new Promise((resolve, reject) => {
				dbApi.saveUserFinishedModule(1, 1).then(data => {
					resolve(data);
				});
			}).then(data => {
				//console.log(data);
				// insert result checked in get query.
			});
		});

		it ('retrieve user finished course', function() {
			return new Promise((resolve, reject) => {
				dbApi.hasUserFinishedModule(1, 1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data).to.equal(true);
			});
		});
	});

	describe('Testing rating and comments', () => {
		it ('Rating a Module', function() {
			return new Promise((resolve, reject) => {
				dbApi.rateModule(1, 1, 5).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				// insert result checked in get query.
			});
		});

		it ('Checks User rating a Module', function() {
			return new Promise((resolve, reject) => {
				dbApi.moduleRatingFromUser(1, 1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data).to.equal(5);
			});
		}); 

		it ('Adding a comment', function() {
			return new Promise((resolve, reject) => {
				dbApi.addCommentToModule(1, 1, "Imi place frontend-ul").then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				// insert result checked in get query.
			});
		});

		it ('Retrieving comments', function() {
			return new Promise((resolve, reject) => {
				dbApi.getCommentsFromModule(1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[0].comment_text).to.equal('Imi place frontend-ul');
			});
		});
	});

	describe('Testing evaluation', () => {
		var qId, aId;
		it('Checks entire test when empty', function() {
			return new Promise((resolve, reject) => {
				dbApi.getEntireTest(1).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data).to.be.empty;
			});
		});

		it ('Adding a question', function() {
			return new Promise((resolve, reject) => {
				dbApi.addQuestionToCourse(1, "Cate mere are Ana ?").then((data) => {
					resolve(data);
				});
			}).then(data => {
				qId = data;
				chai.expect(data).to.equal(1);
			});
		});

		it ('Adding an answer', function() {
			return new Promise((resolve, reject) => {
				dbApi.addAnswerToQuestion(qId, "patru").then((data) => {
					resolve(data);
				});
			}).then(data => {
				aId = data;
				chai.expect(data).to.equal(1);
			});
		});

		it ('Adding another answer', function() {
			return new Promise((resolve, reject) => {
				dbApi.addAnswerToQuestion(qId, "șase cai").then((data) => {
					resolve(data);
				});
			}).then(data => {
				chai.expect(data).to.equal(2);
			});
		});

		it ('Setting the correct answer', function() {
			return new Promise((resolve, reject) => {
				dbApi.setCorrectAnswer(qId, aId).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				// insert result checked in get query.
			});
		});

		it ('Checks retrieving question answers', function() {
			return new Promise((resolve, reject) => {
				dbApi.getQuestionAnswers(qId).then((data) => {
					resolve(data);
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[1].answer_text).to.equal("șase cai");
			});
		});

		it('Checks entire test', function() {
			return new Promise((resolve, reject) => {
				/// First add another question and an answer to it
				dbApi.addQuestionToCourse(1, "Cate pere are ana?").then(data => {
					let iq = data;
					dbApi.addAnswerToQuestion(data, "Important e ca are").then(data => {
						dbApi.setCorrectAnswer(iq, data).then(data => {
							dbApi.getEntireTest(1).then((data) => {
								resolve(data);
							});
						});
					});
				});
			}).then(data => {
				//console.log(JSON.stringify(data));
				chai.expect(data[0].question).to.equal("Cate mere are Ana ?");
				chai.expect(data[1].answers[0].answerText).to.equal("Important e ca are");
			});
		});
		
	});

	describe('Testing code_sharing queries', () => {
		it ('Add new codeBound', function() {
			return new Promise((resolve, reject) => {
				dbApi.saveCodeForSharing({code: '#include <iostream>', 
					breakpoints: [{line: 7, temporary: 0, condition: 'true'},
								  {line:9, temporary: 0, condition: "1==3"}], 
					watches: [{expr: 'x'}]}).then(data => {
					resolve(data);
				});
			}).then(data => {
				//console.log(data);
				// insert result checked in get query.
			});
		});

		it ('Get codeBound', function() {
			return new Promise((resolve, reject) => {
				dbApi.getCodeBound(1).then(data => {
					resolve(data);
				});
			}).then(data => {
				chai.expect(data.code).to.equal("#include <iostream>");
				chai.expect(data.breakpoints[0].line).to.equal(7);
				chai.expect(data.breakpoints[1].condition).to.equal("1==3");
				chai.expect(data.watches[0].expr).to.equal("x");
			});
		});
	});
});
