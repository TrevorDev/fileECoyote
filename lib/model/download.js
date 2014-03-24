var Database = require('./../database')
var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()

var Download = sequelize.define('Download', 
	{
		name: Sequelize.STRING,
		size: Sequelize.INTEGER
	}, {
		classMethods: {
	  },
	  instanceMethods: {
	  }
	}
)

module.exports = Download