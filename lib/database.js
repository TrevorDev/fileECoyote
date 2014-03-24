var Sequelize = null
var sequelize = null

exports.init = function(options){
	Sequelize = require("sequelize")
	sequelize = new Sequelize(options.database, options.user, options.password, {
	  host: options.host
	})
}

exports.getSequelize = function(){
	return Sequelize
}

exports.getSequelizeInstance = function(){
	return sequelize
}