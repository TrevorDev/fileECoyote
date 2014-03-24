var Database = require('./../database')
var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()
var Download = require('./download')

var STATUS = {CREATING: "creating", ACTIVE: "active", DELETED: "deleted"}
var File = sequelize.define('File', 
	{
		name: Sequelize.STRING,
		size: Sequelize.INTEGER,
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.CREATING, STATUS.ACTIVE, STATUS.DELETED]
	  }
	}, {
		classMethods: {
    	
	  },
	  instanceMethods: {
	  }
	}
)

File.hasMany(Download)

File.STATUS = STATUS
module.exports = File