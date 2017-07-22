const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const flash = require('express-flash');
let csrfProtection = csrf({ cookie: true });

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
		if(req.session.user)
			res.render("dashboard");
		else res.render("home");
	});

	app.get('/code',(req,res)=>{
		res.render("editor");
	});

	app.get('/code/:id', (req, res)=>{
		res.redirect("/code/#/saved/"+req.params.id); // redirect to front-end route
	});

	app.get('/login', (req, res) => {
		res.render("login", {
			csrfToken: req.csrfToken()
		});
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
			req.flash('success', 'Successfully logged in!');
			return res.redirect('/');
		})
		.catch(err => {
			req.flash('error', 'Incorrect email or password!');
			return res.redirect('/login');
		});
	});

	app.get('/signup', (req, res) => {
		res.render("signup",{
			csrfToken: req.csrfToken()
		});
	});

	app.post('/signup', (req, res) => {

		if(!req.body.email) {
			req.flash('error', 'Email is required!');
			return res.redirect('/signup');
		}

		if(!req.body.password) {
			req.flash('error', 'Password is required!');
			return res.redirect('/signup');
		}

		dbApi.signupUser(
			req.body.email,
			req.body.password,
			req.body.name,
			req.body.avatar,
			req.body.bio
		).then(result => {
			req.flash('success', 'Account successfully created!');
			return res.redirect('/login');
		}).catch((err) => {
			req.flash('error', 'Email address already taken!');
			res.redirect('/signup');
		});
	});

	app.get('/signup/success', (req, res) => {
		if(req.session.suceess) {
			req.session.suceess = undefined;
			res.render("signup_success", {
				"suceess" : req.flash().suceess
			});
		} else {
			res.redirect('/signup');
		}
	});

	app.get('/logout', (req, res) => {
		req.session.user = undefined;
		res.redirect('/');
	});
};
