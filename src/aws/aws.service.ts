import AwsDatalayer from './aws.datalayer';
import { Configuration } from './aws';
import { createReadStream } from 'fs';

import { EventEmitter } from 'events';

export default class AwsService {
  private logger: any;
  private api: AwsDatalayer;
  private channel : EventEmitter;

  constructor(configuration: Configuration) {
    this.logger = configuration.logger ?? { trace: () => {}, error: () => {} };
    configuration.logger = this.logger;
    this.channel = new EventEmitter();

    this.api = new AwsDatalayer(configuration, this.channel);
  }

  getChannel() {
    return this.channel;
  }

  /**
   * List all buckets
   */
  async listBuckets(): Promise<{ name: string, createdAt: string }> {
    this.logger.trace('AWSService.listBuckets');

    return this.api.listBuckets();
  }

  async createBucket(name: string) {
    this.logger.trace('AWSService.createBucket [name=%s]', name);

    try {
      await this.api.createBucket(name);
    } catch (err: any) {
      switch(err.code) {
      case 'BucketAlreadyOwnedByYou':
        throw new Error('BUCKET_ALREADY_CREATED_AND_OWNED_BY_YOU');
      case 'BucketAlreadyExists':
        throw new Error('BUCKET_ALREADY_USED');
      default:
        throw err;
      }
    }

    return true;
  }

  async deleteBucket(name: string) {
    this.logger.trace('AWSService.deleteBucket [name=%s]', name);

    return this.api.deleteBucket(name);
  }

  /**
   * List all object in a bucket
   */
  async listObjects(bucket: string, folder?: string) {
    this.logger.trace('AWSService.listObjects [bucket=%s, folder=%s]', bucket, folder);

    const objects : any[] = [];

    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      const stream = await this.api.listObjects(bucket, folder, folder ? true : false);

      stream.on('data', (obj) => { objects.push(obj); });
      stream.on('error', (err) => { return reject(err); });
      stream.on('end', () => { return resolve(objects); });
    });

    return objects
      .filter((o: any) => {
        if (o.name) {
          return !o.name.includes('keep');
        }

        return true;
      })
      .map(o => o.prefix?.slice(0, -1) ?? o.name.replace(`${folder}/`, ''));
  }

  async listFiles(bucket: string, folder?: string) {
    this.logger.trace('AWSService.listFiles [bucket=%s, folder=%s]', bucket, folder);

    const objects : any[] = [];

    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      const stream = await this.api.listObjects(bucket, folder, folder ? true : false);

      stream.on('data', (obj) => { objects.push(obj); });
      stream.on('error', (err) => { return reject(err); });
      stream.on('end', () => { return resolve(objects); });
    });

    return objects
      .filter(o => o.name)
      .map(o => o.name.replace(`${folder}/`, ''))
      .filter(o => o !== '.keep');
  }

  async listFolders(name: string) {
    this.logger.trace('AWSService.listFolder');

    const objects : any[] = [];

    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      const stream = await this.api.listObjects(name, '', false);

      stream.on('data', (obj) => { objects.push(obj); });
      stream.on('error', (err) => { return reject(err); });
      stream.on('end', () => { return resolve(objects); });
    });

    return objects.filter(o => o.prefix).map(o => o.prefix.slice(0, -1));
  }

  /**
   * Allows to create a folder in the given bucket
   * @param bucket Name of the bucket
   * @param folder Name of the folder you want to create
   * @returns
   */
  async createFolder(bucket: string, folder: string) {
    this.logger.trace('AWSService.createFolder [bucket=%s, folder=%s]', bucket, folder);

    return this.api.createFolder(bucket, folder);
  }

  /**
   * Allows to upload a stream or a file (file will be taken from the given path)
   * @param bucket Name of the bucket you target
   * @param folder Name of the folder you will upload to
   * @param buffer Name of the buffer to upload. If you want to provide a path, provide undefined here
   * @param path If given, data will be taken from file instead of buffer
   * @returns
   */
  async uploadDocument(bucket: string, folder: string, buffer?: Buffer, path?: string) {
    this.logger.trace('AWSService.uploadDocument [bucket=%s, folder=%s]', bucket, folder);

    let stream;
    if(!path) {
      stream = buffer;
    } else {
      stream = createReadStream(path);
    }

    return this.api.upload(bucket, folder, stream);
  }

  async getUrl(bucket: string, file: string) {
    this.logger.trace('MinioService.getUrl');

    return this.api.getUrl(bucket, file);
  }

  /**
   * Returns an object as a buffer
   * @param bucket
   * @param file
   * @returns
   */
  async downloadFile(bucket: string, file: string) {
    this.logger.trace('AWSService.downloadfile');

    return (await this.api.downloadFile(bucket, file)).Body;
  }

  /**
   * Allows to delete a folder
   *
   * ⚠️ All files inside will be DESTROYED !!
   *
   * @param bucket Name of the bucket
   * @param folder Name of the folder to delete
   */
  async deleteFolder(bucket: string, folder: string): Promise<boolean> {
    this.logger.trace('AWSService.deleteFolder [bucket=%s, file=%s]', bucket, folder);

    const filesInTheFolder = await this.listObjects(bucket, folder);

    await Promise.allSettled(['.keep', ...filesInTheFolder].map(file => this.api.deleteObject(bucket, `${folder}/${file}`)));

    return true;
  }

  /**
   * Allows to delete a file according its path in S3 (can be deep)
   *
   * @param bucket Name of the bucket
   * @param folder Path of the file to delete (e.g: myFile or myFolder/toto/myFile2)
   */
  async deleteFile(bucket: string, path: string): Promise<Boolean> {
    this.logger.trace('AWSService.deleteFolder [bucket=%s, path=%s]', bucket, path);

    await this.api.deleteObject(bucket, path);

    return true;
  }
}
