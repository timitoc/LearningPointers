const mysql = require('mysql');

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME_TEST
});

module.exports = (isTest)=>{
	return 	mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: isTest ? process.env.DB_NAME_TEST : process.env.DB_NAME
	});
};
