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
		res.render("home");
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
		res.render("login");
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

		dbApi.signupUser(
			req.body.email,
			req.body.password,
			req.body.name,
			req.body.avatar,
			req.body.bio
		).then(result => {
			res.send(""+result.insertId);
		}).catch(() => {
			req.flash('error', 'Email address already taken!');
			res.redirect('/signup');
		});
	});
};
