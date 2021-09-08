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

  /**
   * List all object in a bucket
   */
  async listObjects(name: string, folder?: string, recursive: boolean = false) {
    this.logger.trace('AWSService.listObjects');

    const objects : any[] = [];

    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      const stream = await this.api.listObjects(name, folder, recursive);

      stream.on('data', (obj) => { objects.push(obj); });
      stream.on('error', (err) => { return reject(err); });
      stream.on('end', () => { return resolve(objects); });
    });

    if (!recursive) {
      return objects.filter(o => o.name).map(o => o.name);
    }

    // // NOTE: In not recursive mode, folder has a property "prefix"
    // // in this method we only want theses folders so we filter
    return objects.map((o: any) => o.name).filter((o: any) => !o.includes('keep'));
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

    return objects.filter(o => o.prefix);
  }

  /**
   *
   * @param bucket Name of the bucket
   * @param folder Name of the folder
   * @returns
   */
  async createFolder(bucket: string, folder: string) {
    this.logger.trace('AWSService.createFolder [bucket=%s, folder=%s]', bucket, folder);

    return this.api.createFolder(bucket, folder);
  }

  async upload(bucket: string, folder: string, buffer?: Buffer, path?: string) {
    this.logger.trace('AWSService.upload');

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

  async downloadFile(bucket: string, file: string) {
    this.logger.trace('AWSService.downloadfile');

    return (await this.api.downloadFile(bucket, file)).Body;
  }
}
