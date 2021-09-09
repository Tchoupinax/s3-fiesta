import assert from 'assert';
import AWS from 'aws-sdk';
import * as minio from 'minio';
import { EventEmitter } from 'events';

import { Configuration } from './aws';

export default class AwsDatalayer {
  private logger: any;
  private awsClient: AWS.S3;
  private minioClient: minio.Client;
  private channel : EventEmitter;

  constructor({ config, logger }: Configuration, channel: EventEmitter) {
    this.logger = logger;
    this.channel = channel;

    assert(config.endpoint, 'endpoint required');
    assert(config.accessKey, 'accessKey required');
    assert(config.secretKey, 'secretKey required');
    assert(typeof config.useSSL === 'boolean', 'useSSL required');

    const minioConfig = {
      ...config,
      endPoint: config.endpoint,
    };

    this.minioClient = new minio.Client(minioConfig);

    const s3Config: any = {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
      endpoint: config.endpoint,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      sslEnabled: config.useSSL,
    };

    if (config.port) {
      s3Config.endpoint = `${config.endpoint}:${config.port}`;
    }

    if (config.region) {
      s3Config.region = config.region;
    }

    this.awsClient = new AWS.S3(s3Config);
  }

  async listBuckets(): Promise<{ name: string, createdAt: string }> {
    this.logger.trace('AwsDatalayer.listBuckets');

    return new Promise((resolve, reject) => {
      this.awsClient.listBuckets(function(err: any, data: any) {
        if (err) {
          return reject(err);
        } else {
          const formatedData = data.Buckets.map((bucket: { Name: string, CreationDate: string }) => ({
            name: bucket.Name,
            createdAt: bucket.CreationDate,
          }));

          return resolve(formatedData);
        }
      });
    });
  }

  async createBucket(name: string) {
    this.logger.trace('AwsDatalayer.createBucket [name=%s]', name);

    return new Promise((resolve, reject) => {
      this.awsClient.createBucket({ Bucket: name }, function(err: any, data: any) {
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  async deleteBucket(name: string) {
    this.logger.trace('AwsDatalayer.deleteBucket [name=%s]', name);

    return new Promise((resolve, reject) => {
      this.awsClient.deleteBucket({ Bucket: name }, function(err: any, data: any) {
        if (err) {
          return reject(err);
        } else {
          return resolve(data);
        }
      });
    });
  }

  async listObjects(name: string, folder?: string, recursive?: boolean) {
    this.logger.trace('AwsDatalayer.listObjects');

    return this.minioClient.listObjects(name, folder, recursive);
  }

  async createFolder(name: string, path: string) {
    this.logger.trace('MinioApi.createFolder [name=%s, path=%s]', name, path);

    return this.minioClient.putObject(name, `${path}/.keep`, '_');
  }

  async upload(bucket: string, folder: string, stream: any) {
    this.logger.trace('AWSService.uploadDatalayer [bucket=%s, folder=%s]', bucket, folder);

    const params = {
      Body: stream,
      Bucket: bucket,
      ContentType: 'application/octet-stream',
      Key: folder,
    };

    return new Promise((resolve, reject) => {
      this.awsClient
        .upload(params, {}, (err, data) => {
          if (err) {
            this.logger.error(err);
            return reject(err);
          }

          return resolve(data);
        })
        .on('httpUploadProgress', progress => {
          this.channel.emit('S3SERVICE_UPLOAD_PROGRESS', {
            folder,
            loaded: progress.loaded,
            percentage: progress.loaded / progress.total * 100,
            percentageLabel: `${(progress.loaded / progress.total * 100).toFixed(2)}%`,
            total: progress.total,
          });

          this.logger.debug(`[S3] - ${folder} - ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
        });
    });
  }

  async getUrl(bucket: string, file: string) {
    this.logger.trace('MinioApi.getUrl (bucketName: %s, filename: %s)', bucket, file);

    return this.minioClient.presignedGetObject(bucket, file);
  }

  async downloadFile(bucket: string, file: string) {
    this.logger.trace('S3Datalayer.downloadfile');

    return this.awsClient.getObject({ Bucket: bucket, Key: file }).promise();
  }

  async deleteObject(bucket: string, object: string) {
    this.logger.trace('AwsDatalayer.deleteObject [bucket=%s, object=%s]', bucket, object);

    return this.awsClient.deleteObject({ Bucket: bucket, Key: object }).promise();
  }
}
