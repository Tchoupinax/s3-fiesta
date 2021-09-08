/// <reference types="node" />
import { Configuration } from './aws';
import { EventEmitter } from 'events';
export default class AwsService {
    private logger;
    private api;
    private channel;
    constructor(configuration: Configuration);
    getChannel(): EventEmitter;
    /**
     * List all buckets
     */
    listBuckets(): Promise<{
        name: string;
        createdAt: string;
    }>;
    /**
     * List all object in a bucket
     */
    listObjects(name: string, folder?: string, recursive?: boolean): Promise<any[]>;
    listFolders(name: string): Promise<any[]>;
    /**
     *
     * @param bucket Name of the bucket
     * @param folder Name of the folder
     * @returns
     */
    createFolder(bucket: string, folder: string): Promise<import("minio").UploadedObjectInfo>;
    upload(bucket: string, folder: string, buffer?: Buffer, path?: string): Promise<unknown>;
    getUrl(bucket: string, file: string): Promise<string>;
    downloadFile(bucket: string, file: string): Promise<import("aws-sdk/clients/s3").Body | undefined>;
}
