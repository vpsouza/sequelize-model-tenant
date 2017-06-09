'use strict';

const modelTenant = require('../index');

jest.mock('fs', () => ({
	readdirSync: jest.fn((dirName) => ['user.js'])
}));

jest.mock('sequelize', () => {
	return jest.fn((database, username, password, dbConnectonOptions) => ({
		import: jest.fn(path => ({
			name: 'user',
			schema: schemaName => {
				this['associate'] = (models) => {}
				this.$schema = schemaName;
				return this;
			},
			associate: jest.fn(() => {})
		}))
	}))
});

test('smoke Test without tenant definition', () => {
	let models = modelTenant('fakedir', {
			dialect: 'postgre',
			port: 5432,
			host: 'localhost',
			database: 'test',
			username: 'test',
			password: 'test'
		}, 
		{});
	
	expect(models.User).toBeDefined();
	expect(models.User.$schema).toBe('public');
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
		serverInstance, null, true);
	
	expect(models.User).toBeDefined();
	expect(models.User.$schema).toBe('public');
	expect(serverInstance.test).not.toBeDefined();
});