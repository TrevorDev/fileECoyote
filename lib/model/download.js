var Database = require('./../database')
var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()

var Download = sequelize.define('Download', 
	{
		userName: Sequelize.STRING
	}, {
		classMethods: {
	  },
	  instanceMethods: {
	  }
	}
)

module.exports = Download