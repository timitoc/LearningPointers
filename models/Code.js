const Sequelize = require('sequelize');
let sequelize = require('../sequelize');

const Code = sequelize.define('code', {
	id: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		primaryKey: true
	},
	code : {
		type: Sequelize.STRING(1234),
		allowNull: false
	}
});

if(process.env.ENVIRONMENT == 'development'){
	Code.sync({force: true}).then(() => {});
}

module.exports = Code;
