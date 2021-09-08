/// <reference types="node" />
import AWS from 'aws-sdk';
import * as minio from 'minio';
import { Configuration } from './aws';
import { EventEmitter } from 'events';
export default class AwsDatalayer {
    private logger;
    private awsClient;
    private minioClient;
    private channel;
    constructor({ config, logger }: Configuration, channel: EventEmitter);
    listBuckets(): Promise<{
        name: string;
        createdAt: string;
    }>;
    listObjects(name: string, folder?: string, recursive?: boolean): Promise<minio.BucketStream<minio.BucketItem>>;
    createFolder(name: string, path: string): Promise<minio.UploadedObjectInfo>;
    upload(bucket: string, folder: string, stream: any): Promise<unknown>;
    getUrl(bucket: string, file: string): Promise<string>;
    downloadFile(bucket: string, file: string): Promise<import("aws-sdk/lib/request").PromiseResult<AWS.S3.GetObjectOutput, AWS.AWSError>>;
}
