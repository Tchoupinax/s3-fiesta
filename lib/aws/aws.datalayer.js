"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const minio = __importStar(require("minio"));
class AwsDatalayer {
    constructor({ config, logger }, channel) {
        this.logger = logger;
        this.channel = channel;
        const minioConfig = Object.assign(Object.assign({}, config), { endPoint: config.endpoint });
        this.minioClient = new minio.Client(minioConfig);
        const s3Config = {
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
        this.awsClient = new aws_sdk_1.default.S3(s3Config);
    }
    listBuckets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AwsDatalayer.listBuckets');
            return new Promise((resolve, reject) => {
                this.awsClient.listBuckets(function (err, data) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        const formatedData = data.Buckets.map((bucket) => ({
                            name: bucket.Name,
                            createdAt: bucket.CreationDate,
                        }));
                        return resolve(formatedData);
                    }
                });
            });
        });
    }
    listObjects(name, folder, recursive) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AwsDatalayer.listObjects');
            return this.minioClient.listObjects(name, folder, recursive);
        });
    }
    createFolder(name, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('MinioApi.createFolder [name=%s, path=%s]', name, path);
            return this.minioClient.putObject(name, `${path}/.keep`, '_');
        });
    }
    upload(bucket, folder, stream) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('MinioApi.upload');
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
        });
    }
    getUrl(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('MinioApi.getUrl (bucketName: %s, filename: %s)', bucket, file);
            return this.minioClient.presignedGetObject(bucket, file);
        });
    }
    downloadFile(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('S3Datalayer.downloadfile');
            return this.awsClient.getObject({ Bucket: bucket, Key: file }).promise();
        });
    }
}
exports.default = AwsDatalayer;
