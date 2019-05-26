import * as AWS from 'aws-sdk';
import { injectable } from 'inversify';

import FileStorage from './FileStorage';

import { config } from '../../config';

@injectable()
class FileStorageAWS implements FileStorage {
  private settings: any;

  constructor() {
    this.settings = config.storage;
  }

  upload = (fileName, data): Promise<any> => {
    const fileToUpload = {
      ACL: 'private',
      Bucket: this.settings.bucket,
      Key: fileName,
      Body: Buffer.from(data, 'binary')
    };

    return new Promise((resolve, reject) => {
      const awsConfig = new AWS.Config({ region: this.settings.region });
      const s3 = new AWS.S3(awsConfig);

      s3.upload(fileToUpload, (error, uploadData) => {
        if (error) {
          reject(error);
        } else {
          resolve(uploadData);
        }
      });
    });
  }

  download = (path): Promise<any> => {
    const fileToDownload = {
      Bucket: this.settings.bucket,
      Key: path
    };

    return new Promise((resolve, reject) => {
      const awsConfig = new AWS.Config({ region: this.settings.region });
      const s3 = new AWS.S3(awsConfig);

      s3.getObject(fileToDownload, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
}

export default FileStorageAWS;
