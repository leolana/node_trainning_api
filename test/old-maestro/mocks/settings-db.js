module.exports = (di) => {
    di.provide('@db-settings', () => Promise.resolve({
        mainDb: { connection: 'postgres://postgres:sa@localhost:5432/alpe-tests' }
    }))
   .provide('@siscof-settings', () => Promise.resolve({
       user: 'itlab',
       password: '7PzOmjYJac84',
       connectString: '127.0.0.2:1522/dbsiscof',
   }));
};