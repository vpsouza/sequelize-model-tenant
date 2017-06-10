'use strict';

import modelTenant from '../index';

jest.mock('fs', () => ({
	readdirSync: jest.fn((dirName) => ['user.js'])
}));

jest.mock('sequelize', () => {
	return jest.fn((database, username, password, dbConnectonOptions) => ({
		import: jest.fn(path => ({
			name: 'user',
			schema: function(schemaName) {
				this['associate'] = (models) => {}
				this.$schema = schemaName;
				return this;
			}
		}))
	}));
});

test('smoke Test with tenant definition', () => {
	let models = modelTenant('fakedir', {
			dialect: 'postgre',
			port: 5432,
			host: 'localhost',
			database: 'test',
			username: 'test',
			password: 'test'
		}, 
		{}, 'test');
	
	expect(models.User).toBeDefined();
	expect(models.User.$schema).toBe('test');
	expect(models.User.associate).toBeDefined();
	
});

test('Test without pool', () => {
	let serverInstance = {};

	let models = modelTenant('fakedir', {
			dialect: 'postgre',
			port: 5432,
			host: 'localhost',
			database: 'test',
			username: 'test',
			password: 'test'
		}, 
		serverInstance, 'test', true);
	
	expect(models.User).toBeDefined();
	expect(models.User.$schema).toBe('test');
	expect(serverInstance.test).not.toBeDefined();
});