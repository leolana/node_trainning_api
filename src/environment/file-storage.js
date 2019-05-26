let AWS = require('aws-sdk');

module.exports = di => {
    di.provide('$fileStorage', '@storage-settings', (settings) => new Promise((resolve, reject) => {
        resolve({
            upload: (fileName, data) => {
                let fileToUpload = {
                    ACL: "private",
                    Bucket: settings.bucket,
                    Key: fileName,
                    Body: Buffer.from(data, 'binary')
                };

                return new Promise((resolve, reject) => {
                    let config = new AWS.Config({ region: settings.region });
                    let s3 = new AWS.S3(config);

                    s3.upload(fileToUpload, (error, data) => {
                        if (error)
                            reject(error);
                        else
                            resolve(data);
                    });
                });
            },
            download: (path) => {
                let fileToDownload = {
                    Bucket: settings.bucket,
                    Key: path
                };

                return new Promise((resolve, reject) => {
                    let config = new AWS.Config({ region: settings.region });
                    let s3 = new AWS.S3(config);

                    s3.getObject(fileToDownload, (error,data) => {
                        if (error)
                            reject(error);
                        else
                            resolve(data);
                    });
                });
            }
        });
    }));
};
