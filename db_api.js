const Promise = require('bluebird');
let Code = require('./models/Code.js');
let Lesson = require('./models/Lesson.js');

class DatabaseApi{
	get_code(id){
		return new Promise((resolve, reject) => {
			Code.findOne({ where: {id: id} }).then(code => {
				resolve(code);
			});
		});
	}

	add_code(code){
		return new Promise((resolve, reject) => {
			Code.create({code: code}).then(newcode => {
				resolve(newcode.id);
			});
		});
	}

	get_lessons(){
		return new Promise((resolve, reject) => {
			Lesson.findAll().then(lessons => {
				resolve(lessons);
			});
		});
	}

	get_lesson_by_id(id){
		return new Promise((resolve, reject) => {
			Lesson.findOne({ where: {id: id}}).then(lesson => {
				resolve(lesson);
			});
		});
	}

	get_lesson_by_title(title){
		return new Promise((resolve, reject) => {
			Lesson.findOne({ where: {title: title}}).then(lesson => {
				resolve(lesson);
			});
		});
	}
}

module.exports = DatabaseApi;
