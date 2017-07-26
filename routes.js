const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const mime = require('mime');

let connection = require('./DatabaseApi/src/db_connection.js')(false);
connection.connect();

const DbApi = require('./DatabaseApi/src/db_sql_api.js');
let dbApi = new DbApi(connection);

module.exports = (app) => {

	// Use csurf with cookieparser
	app.use(cookieParser());
	app.use(csrf({ cookie: true }));

	app.use(flash());

	const checkAuth = (req, res, next) => {
		return !req.session.user ? res.redirect('/login') : next();
	};

	app.get('/', (req, res) => {
		if(req.session.user) {
			res.render("dashboard", {
				user: req.session.user,
				avatar: req.session.avatar
			});
		}
		else {
			dbApi.getCourses(
			'',
			3,
			0).then(courses => {
				console.log(courses);
				res.render("home", {
					courses
				});
			});
		}
	});

	app.get('/code',(req,res) => { res.render("editor"); });

	app.get('/code/:id', (req, res)=>{
		res.redirect("/code/#/saved/"+req.params.id); // redirect to front-end route
	});

	app.get('/login', (req, res) => {
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

	app.post('/login', (req, res) => {
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
				id : result.id
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

	app.get('/signup', (req, res) => {
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

	app.post('/signup', (req, res) => {

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

		dbApi.signupUser(
			req.body.email,
			req.body.password,
			req.body.name,
			'default.svg', //default avatar
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

	app.get('/logout', (req, res) => {
		req.session.user = undefined;
		res.redirect('/');
	});


	app.get('/profile', checkAuth, (req, res) => {
		res.render("profile");
	});

	app.get('/contribute', checkAuth, (req, res) => {
		res.render("contribute", {
			csrfToken: req.csrfToken()
		});
	});

	app.post('/course/add', checkAuth, (req, res) => {
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

	app.get('/course/:name/add', checkAuth, (req, res) => {
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data || !data.length) { return res.send("Not found");}
			let course = data[0];
			dbApi.getCourseAuthors(data[0].id).then(data => {
				if(!req.session.user) isAuthor = false;
				else isAuthor = hasUser(req.session.user.email, data);

				res.render("module/add", {course, isAuthor, csrfToken: req.csrfToken()});
			});
		});
	});

	app.post('/course/:name/add', checkAuth, (req, res) => {
		let markdownContent = req.body.markdown;
		dbApi.getCourseByUrl(req.params.name).then(data => {
			if(!data.length) return res.send("Not send");
			dbApi.addModule(data[0].id, {text_md: markdownContent, title: req.body.title}).then(data => {
				req.flash('success', 'Module added');
				res.redirect('/course/'+req.params.name);
			});
		});
	});

	// Workaround
	app.get('/course/:name/editor.wasm', checkAuth, (req, res) => {
		res.sendFile(path.join(__dirname, "static", "webasm", "editor.wasm"));
	});

	app.get('/course/:name/modules/:index', checkAuth, (req, res) => {
		res.render("module/view");
	});
};
