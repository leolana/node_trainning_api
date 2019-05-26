let Maestro = require('maestro-io');
let di = new Maestro(`${__dirname}/../..`);
let fs = require('fs');
let env = {};

describe.skip('$FileStorage', () => {
    before('Loading modules / mocks', () => {
        return di
            .loadFiles('./src/environment/file-storage')
            .start()
            .then(di => {
                env.fileStorage = di.resolve('$fileStorage');
            });
    });

    describe('File Storage.', () => {
        it('Should return TRUE when upload valid file.', (done) => {
            let file = fs.readFileSync('./test/fake-data/upload-file.txt');
            let filename = Date.now().toString() + '.txt';

            env.fileStorage
                .upload(filename, file)
                .then(data => {
                    data.should.have.property('ETag');
                    done();
                })
                .catch(error => done(error));
        });
    });
});
