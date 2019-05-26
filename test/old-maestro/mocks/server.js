module.exports = (di) => {
	di.provide('$server', () => Promise.resolve({
		get: () => { },
		post: () => { },
		put: () => { },
		del: () => { }
	}));
};
