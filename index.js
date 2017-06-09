'use strict';

const fs = require('fs'),
	path = require('path'),
	Sequelize = require('sequelize');

function initNewDB(dirName, config, server, tenantID, withoutPool) {

	let db = {};

	let sequelize = null;

	if (!tenantID) {
		tenantID = 'public';
	}

	let dbConnectonOptions = {
		dialect: config.dialect,
		port: config.port,
		schema: tenantID,
		host: config.host
	};

	if (withoutPool) {
		dbConnectonOptions['pool'] = false;
	}

	dbConnectonOptions.logging = function (log) {
		if (process.env.NODE_ENV == 'development')
			console.log(log);
	};

	sequelize = new Sequelize(config.database, config.username, config.password, dbConnectonOptions);

	sequelize.custom_schema = tenantID;

	fs
		.readdirSync(dirName)
		.filter(function (file) {
			return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
		})
		.forEach(function (file) {
			var model = sequelize['import'](path.join(dirName, file));
			let modelName = model.name.charAt(0).toUpperCase() + model.name.slice(1);
			db[modelName] = model.schema(tenantID);
		});

	Object.keys(db).forEach(function (modelName) {
		if (db[modelName].associate) {
			db[modelName].associate(db);
		}
	});

	db.sequelize = sequelize;
	db.Sequelize = Sequelize;

	return db;
}

module.exports = function (dirName, dbConfig, server, tenantID, withoutPool) {

	if (withoutPool) {
		return initNewDB(dirName, dbConfig, server, tenantID, withoutPool);
	} else {
		if (!server[tenantID]) {
			server[tenantID] = initNewDB(dirName, dbConfig, server, tenantID);
		}

		return server[tenantID];
	}
}
