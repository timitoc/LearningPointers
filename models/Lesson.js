const Sequelize = require('sequelize');
let sequelize = require('../sequelize');

const Lesson = sequelize.define('lesson', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	title: {
		type: Sequelize.STRING(30),
		allowNull: false,
		unique: true
	},
	content: {
		type: Sequelize.TEXT,
		allowNull: false
	}
});

if(process.env.ENVIRONMENT == 'development'){
	Lesson.sync({force: true}).then(() => {
		Lesson.create({
			title: "Introducere",
			content: "##Asta este continutul"
		});
		Lesson.create({
			title: "A doua lectie",
			content: "Asta este continutul"
		});

	});
}

module.exports = Lesson;
