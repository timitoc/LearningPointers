const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
const mime = require('mime');

let connection = require('./DatabaseApi/src/db_connection.js');
connection.connect();

const DbApi = require('./DatabaseApi/src/db_sql_api.js');
let dbApi = new DbApi(connection);

module.exports = (app) => {

	// Use csurf with cookieparser
	app.use(cookieParser());
	app.use(csrf({ cookie: true }));

	app.use(flash());

	app.get('/', (req, res) => {
		if(req.session.user) {
			res.render("dashboard", {
				user: req.session.user,
				avatar: req.session.avatar
			});
		}
		else res.render("home");
	});

	app.get('/code',(req,res)=>{
		res.render("editor");
	});

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
			req.session.user = req.body.email;

			dbApi.getAvatarByEmail(req.body.email).then(data => {
				req.session.avatar = data[0]['avatar'];
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

		//if(!req.files)
		//	avatarFileName = 'default.svg';
		//else {

		//	if(req.files.avatar) {
		//		if(allowedMimeTypes.includes(mime.lookup(req.files.avatar.name))) {
		//			avatarFileName = randomstring.generate(10) + '.' + mime.extension(mime.lookup(req.files.avatar.name));
		//		} else {
		//			req.flash('error', 'Please upload an image!');
		//			return res.redirect('/signup');
		//		}
		//	}
		//	else avatarFileName = 'default.svg';
		//}

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


	app.get('/profile', (req, res) => {
		if(req.session.user) {
			res.render("profile");
		} else {
			res.redirect('/login');
		}
	});

	app.get('/contribute', (req, res) => {
		if(req.session.user) {
			res.render("contribute");
		} else {
			res.redirect('/login');
		}
	});
};
