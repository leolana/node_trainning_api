module.exports = (di) => {
    di.provide('$fileStorage', () => Promise.resolve({
        upload: (fileName, data) => Promise.resolve({ key: fileName, Location: 'http://file-url' }),
        download: (filename) => Promise.resolve()
    }))
};
