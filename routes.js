const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const mime = require('mime');
const download = require('download-file')
const randomstring = require('randomstring');

let connection = require('./DatabaseApi/src/db_connection.js')(false);
connection.connect();

const DbApi = require('./DatabaseApi/src/db_sql_api.js');
let dbApi = new DbApi(connection);

module.exports = (app) => {
	app.use(cookieParser());
	let _csrf = csrf({ cookie: true });

	app.use(flash());

	const checkAuth = (req, res, next) => {
		return !req.session.user ? res.redirect('/login') : next();
	};

	app.get('/', (req, res) => {
		if(req.session.user) {
			dbApi.getAllMyCourses(req.session.user.id).then(data => {
				res.render("dashboard", {
					user: req.session.user,
					subscribed_courses: data
				});
			});
		} else {
			dbApi.getCourses( '', 0, 3)
			.then(courses => {
				res.render("home", {
					courses
				});
			});
		}
	});

	app.get('/code',(req,res) => { res.render("editor"); });

	app.get('/code/:id', (req, res)=>{
		res.render("editor", {
			id: req.params.id
		});
	});

	app.get('/login', _csrf, (req, res) => {
		if(req.session.login_attempts > 3) {
			res.render("login", {
				csrfToken: req.csrfToken()
			});
		} else {
			//TODO: Add CAPTCHA
			res.render("login", {
				csrfToken: req.csrfToken()
			});
		}
	});

	app.post('/login',_csrf, (req, res) => {
		if(!req.body.email) {
			req.flash('error', 'Email is required!');
			return res.redirect('/login');
		}

		if(!req.body.password) {
			req.flash('error', 'Password is required!');
			return res.redirect('/login');
		}

		dbApi.loginUser(
			req.body.email,
			req.body.password
		).then(result => {
			req.session.user = {
				email : req.body.email,
				id : result.id,
				avatar: result.avatar,
				name: result.name
			};

			dbApi.getAvatarByEmail(req.body.email).then(data => {
				req.session.avatar = data.avatar;
				req.flash('success', 'Successfully logged in!');
				// Clean all login attempts
				req.session.login_attempts = undefined;

				return res.redirect('/');
			});

		})
		.catch(err => {
			console.log(err);
			req.flash('error', 'Incorrect email or password!');

			// Increase login attempts
			req.session.login_attempts = req.session.login_attempts ? req.session.login_attempts + 1 : 1;

			return res.redirect('/login');
		});
	});

	app.get('/signup', _csrf, (req, res) => {
		res.render("signup",{
			csrfToken: req.csrfToken()
		});
	});

	// A list of mime types allowed at upload
	//const allowedMimeTypes = [
	//	'image/bmp',
	//	'image/x-windows-bmp',
	//	'image/gif',
	//	'image/jpeg',
	//	'image/png',
	//	'image/tiff',
	//	'image/x-tiff'
	//];

	app.post('/signup', _csrf,(req, res) => {

		if(!req.body.email) {
			req.flash('error', 'Email is required!');
			return res.redirect('/signup');
		}

		if(!req.body.password) {
			req.flash('error', 'Password is required!');
			return res.redirect('/signup');
		}

		if(req.body.password.length < 7) {
			req.flash('error', 'Password should be minimum 7 characters long');
			return res.redirect('/signup');
		}

		if(!req.body.name) {
			req.flash('error', 'Name is required!');
			return res.redirect('/signup');
		}

		// Get avatar from adorable avatars

		let filename = randomstring.generate(10) + '.png';

		download('https://api.adorable.io/avatars/150/'+filename, {
			directory: './static/avatars',
			filename
		}, (err) => {
			if(err) throw err;

			dbApi.signupUser(
				req.body.email,
				req.body.password,
				req.body.name,
				filename,
				'' // default bio
			).then(result => {
				req.flash('success', 'Account successfully created!');
				req.flash('email', req.body.email);
				return res.redirect('/login');
			}).catch((err) => {
				req.flash('error', 'Email address already taken!');
				res.redirect('/signup');
			});

		});

	});

	app.get('/logout', (req, res) => {
		req.session.user = undefined;
		res.redirect('/');
	});


	app.get('/profile', checkAuth, (req, res) => {
		res.render("profile");
	});

	app.get('/contribute', checkAuth, _csrf, (req, res) => {
		res.render("contribute", {
			csrfToken: req.csrfToken()
		});
	});

	app.post('/course/add', checkAuth, _csrf, (req, res) => {
		dbApi.addCourse(req.session.user.id, {
			name: req.body.course_name,
			description: req.body.course_description,
			difficulty:req.body.course_difficulty
		}).then(data => {
			req.flash('success', 'Course added!');
			return res.redirect('/course/'+data.toString());
		});
	});

	let hasUser = (user, data) => {
		return data.filter(item => item.email == user).length;
	};

	app.get('/course/search', (req, res) => {
		//res.json(req.query);
		dbApi.getCourses(
			req.query.query ? req.query.query : "", // This should be the regex
			0, //offset
			10 //count
		).then(data => {
			console.log(data);
			res.render("course/search", {
				courses: data,
				user: req.session.user,
				query: req.query.query
			});
		});
	});

	app.get('/course/:name', (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) { return res.send("Not found");}
			let course = data[0];
			dbApi.getCourseAuthors(data[0].id).then(data => {
				dbApi.getModulesFromCourse(course.id).then(modules => {
					if(!req.session.user) isAuthor = false;
					else isAuthor = hasUser(req.session.user.email, data);
					res.render("course", {course, modules, isAuthor});
				});
			});
		});
	});

	app.get('/course/:name/subscribe', checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) { return res.send("Not found");}
			let course = data[0];
			dbApi.subscribeToCourse(req.session.user.id, course.id).then(data => {
				res.redirect('/course/'+req.params.name);
			});
		});
	});

	app.get('/course/:name/modules/add', _csrf, checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) { return res.send("Not found");}
			let course = data[0];
			dbApi.getCourseAuthors(data[0].id).then(data => {
				if(!req.session.user) isAuthor = false;
				else isAuthor = hasUser(req.session.user.email, data);

				res.render("module/add", {course, isAuthor, csrfToken: req.csrfToken()});
			}).catch(err => console.log(err));
		}).catch(err => console.log(err));
	});

	app.post('/course/:name/modules/add', _csrf, checkAuth, (req, res) => {
		let markdownContent = req.body.markdown;
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) return res.send("Not found");
			dbApi.addModule(data[0].id, {text_md: markdownContent, title: req.body.title}).then(data => {
				req.flash('success', 'Module added');
				res.redirect('/course/'+req.params.name);
			});
		});
	});

	app.get('/course/:name/test', _csrf, checkAuth, (req, res) => {

	});

	app.get('/course/:name/test/edit', _csrf, checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) { return res.send("Not found");}
			let course = data[0];
			dbApi.getCourseAuthors(data[0].id).then(data => {
				if(!req.session.user) isAuthor = false;
				else isAuthor = hasUser(req.session.user.email, data);
				if(!isAuthor) return res.send("No privileges");

				dbApi.getEntireTest(course.id).then(test => {
					console.log(test);
					res.render("test/edit", {course, isAuthor, csrfToken: req.csrfToken()});
				});

			}).catch(err => console.log(err));
		}).catch(err => console.log(err));

	});

	// Workaround
	app.get('/course/:name/editor.wasm', checkAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "static", "webasm", "editor.wasm"));
	});

	app.get('/course/:name/modules/editor.wasm', checkAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "static", "webasm", "editor.wasm"));
	});

	app.get('/course/:name/modules/:index/editor.wasm', checkAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "static", "webasm", "editor.wasm"));
	});
	app.get('/course/:name/modules/:index', checkAuth, (req, res) => {


			dbApi.getCourseByUrl(req.params.name).then(data => {
				if(!data || !data.length) return res.send("Not found");
				dbApi.getCourseAuthors(data[0].id).then(data2 => {
					if(!req.session.user) isAuthor = false;
					else isAuthor = hasUser(req.session.user.email, data2);

					dbApi.getNthModuleFromCourse(data[0].id, parseInt(req.params.index)).then(data1=>{
						if(!data1) return res.send("Not found");

						dbApi.getCommentsFromModule(data1.id).then(comments => {
							res.render("module/view", {
								course: data[0],
								module: data1,
								module_index: req.params.index,
								isAuthor,
								comments
							});
						});
					});
				});
			});
	});

	app.post('/comments/:module/add', checkAuth, (req, res) => {
		dbApi.addCommentToModule(req.session.user.id, req.params.module, req.body.comment).then(data => {
			res.json(true);
		}).catch(err => {
			res.json(false);
		});
	});

	app.post('/rating/:module/add', checkAuth, (req, res) => {
		dbApi.rateModule(req.session.user.id, req.params.module, req.body.rating).then(data => {
			res.json(true);
		}).catch(err=>{
			res.json(false);
		});
	});

	app.get('/course/:name/modules/:index/edit', _csrf, checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) return res.send("Not found");
			dbApi.getCourseAuthors(data[0].id).then(data2 => {

				if(!req.session.user) isAuthor = false;
				else isAuthor = hasUser(req.session.user.email, data2);

				if(!isAuthor) return res.send("No privileges");

				dbApi.getNthModuleFromCourse(data[0].id, parseInt(req.params.index)).then(data1=>{
					if(!data1) return res.send("Not found");
					res.render("module/edit", {
						course: data[0],
						module: data1,
						module_index: req.params.index,
						isAuthor,
						csrfToken: req.csrfToken()
					});
				});
			});
		});
	});


	app.post('/course/:name/modules/:index/edit', checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) return res.send("Not found");

			dbApi.getCourseAuthors(data[0].id).then(data2 => {

				let isAuthor = true;
				if(!req.session.user) isAuthor = false;
				else isAuthor = hasUser(req.session.user.email, data2);

				if(!isAuthor) return res.send("No privileges");

				dbApi.getNthModuleFromCourse(data[0].id, parseInt(req.params.index)).then(data1=>{
					if(!data1) return res.send("Not found");

					dbApi.editModule(data1.id, req.body.markdown).then(ok => {
						req.flash('success', 'Module modified');
						res.redirect('/course/'+req.params.name+'/modules/'+req.params.index);
					});

				});
			});
		});
	});

};
