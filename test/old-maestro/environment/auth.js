let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let fs = require('fs');
let env = {};

describe.skip('$Auth', () => {
    before('Loading modules / mocks', () => {
        return di
			.loadFiles('./src/environment/auth', './src/model/roles')
			.provide('@auth-settings', () => Promise.resolve({
		        address: 'http://localhost:9100',
				adminUsername: 'admin',
	            adminPassword: 'sa',
		        clientId: 'alpe-bko',
		        clientSecret: 'f621a27e-54bd-439c-a56a-f8e125ce7d39',
		        publicKey: '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAg2WepCsYPl2BvK7BclDAqZNAQvDH+qPpmWCWjliuQT01DkkRzcm2\n4uBshONGg62gBsI5inh8WmwEF1Uu7Aj5RR8cMw3Wznne2GbscqbLBZmIykBwacSe\nxGN48kBr3lSTMY2ZTLOILpww+CueAz06YZ5NhBqh4nCPFQaE1I7txz13C5oWMBfO\n7Mm7hKNDwXfrI1M7c0fFAICmuXOQX7KrQ5B5u7YJtp48aE417/GXc8fBvRsyEp4j\nDpS7dUD4liEGYKupt3m2SikJxJRuPu0W0iKqYwkGrtjbS1+ma3be3mmrkx83UcQu\naHpUY2wQBYb1H10LJZQrvq5PqknY6i8MhQIDAQAB\n-----END RSA PUBLIC KEY-----\n',
				realm: 'master'
		    }))
            .start()
            .then(di => {
				env.auth = di.resolve('$auth');
				env.settings = di.resolve('@auth-settings');
                env.roles = di.resolve('@@roles');
            });
    });

    describe.skip('Authentication', () => {
        it('Should return access token.', (done) => {
            env.auth
				.generateToken({
					email: 'luiggi@itlab',
					password: 'abcd1234'
				})
                .then(token => {
					token.should.be.ok();
                    done();
                })
                .catch(error => done(error));
        });
    });

	describe.skip('Authorization', () => {
		it('Should call next when user has one of the specified roles.', (done) => {
			let middleware = env.auth.require(env.roles.fornecedor, env.roles.ec);
			let res = {
				catch: (error) => done(error)
			};
			let req = { user: { resource_access: { } } };
			req.user.resource_access[env.settings.clientId] = {
				roles: [env.roles.ec]
			};

			middleware(req, res, () => {
				done();
			})
		});

		it('Should call next when user is a super-user.', (done) => {
			let middleware = env.auth.require(env.roles.fornecedor, env.roles.ec);
			let res = {
				catch: (error) => done(error)
			};
			let req = { user: { resource_access: { } } };
			req.user.resource_access[env.settings.clientId] = {
				roles: [env.roles.super]
			};

			middleware(req, res, () => {
				done();
			})
		});

		it('Should return Access-Denied error when user does not have the specified roles and is not a super-user.', (done) => {
			let middleware = env.auth.require(env.roles.fornecedor);
			let res = {
				catch: (error) => {
					error.should.be.exactly('access-denied');
					done();
				}
			};
			let req = { user: { resource_access: { } } };
			req.user.resource_access[env.settings.clientId] = {
				roles: [env.roles.ec]
			};

			middleware(req, res, () => done('next called!'));
		});
	});

	describe.skip('User management', () => {
		it('Should create user.', (done) => {
			let user = {
				username: 'johndoe',
				firstName: 'John',
				lastName: 'Doe',
				email: 'john.doe@acme.com',
				password: 'abcd1234'
			};

			env.auth.createUser(user)
				.then(() => done())
				.catch(error => done(error));
		});

        it('Should change user\'s password.', (done) => {
			let user = {
				id: 'd8849f2d-de9f-46b5-aa19-7a8fb3631bf4',
				newPassword: 'qwerty01'
			};

			env.auth.changeUserPassword(user)
				.then(() => done())
				.catch(error => done(error));
		})
	});
});
