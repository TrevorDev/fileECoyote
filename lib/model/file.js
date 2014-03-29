var Database = require('./../database')
var Sequelize = Database.getSequelize()
var sequelize = Database.getSequelizeInstance()
var Download = require('./download')

var STATUS = {CREATING: "creating", ACTIVE: "active", DELETED: "deleted"}
var PRIVACY = {PUBLIC: "public", PRIVATE: "private"}
var File = sequelize.define('File', 
	{
		name: Sequelize.STRING,
		bytes: Sequelize.INTEGER,
		status: {
	    type:   Sequelize.ENUM,
	    values: [STATUS.CREATING, STATUS.ACTIVE, STATUS.DELETED]
	  },
	  privacy: {
	    type:   Sequelize.ENUM,
	    values: [PRIVACY.PUBLIC, PRIVACY.PRIVATE]
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
File.PRIVACY = PRIVACY
module.exports = File