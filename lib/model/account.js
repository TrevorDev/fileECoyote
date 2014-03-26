var Database = require('./../database')
var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()
var File = require('./file')

var STATUS = {ACTIVE: "active", DELETED: "deleted"}
var Account = sequelize.define('Account', 
	{
		name: {type: Sequelize.STRING, unique: true},
		token: Sequelize.STRING,
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.ACTIVE, STATUS.DELETED]
	  }
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)

Account.hasMany(File)

Account.STATUS = STATUS
module.exports = Account