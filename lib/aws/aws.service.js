"use strict";
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
const aws_datalayer_1 = __importDefault(require("./aws.datalayer"));
const fs_1 = require("fs");
const events_1 = require("events");
class AwsService {
    constructor(configuration) {
        var _a;
        this.logger = (_a = configuration.logger) !== null && _a !== void 0 ? _a : { trace: () => { }, error: () => { } };
        configuration.logger = this.logger;
        this.channel = new events_1.EventEmitter();
        this.api = new aws_datalayer_1.default(configuration, this.channel);
    }
    getChannel() {
        return this.channel;
    }
    /**
     * List all buckets
     */
    listBuckets() {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.listBuckets');
            return this.api.listBuckets();
        });
    }
    /**
     * List all object in a bucket
     */
    listObjects(name, folder, recursive = false) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.listObjects');
            const objects = [];
            // eslint-disable-next-line no-async-promise-executor
            yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const stream = yield this.api.listObjects(name, folder, recursive);
                stream.on('data', (obj) => { objects.push(obj); });
                stream.on('error', (err) => { return reject(err); });
                stream.on('end', () => { return resolve(objects); });
            }));
            if (!recursive) {
                return objects.filter(o => o.name).map(o => o.name);
            }
            // // NOTE: In not recursive mode, folder has a property "prefix"
            // // in this method we only want theses folders so we filter
            return objects.map((o) => o.name).filter((o) => !o.includes('keep'));
        });
    }
    listFolders(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.listFolder');
            const objects = [];
            // eslint-disable-next-line no-async-promise-executor
            yield new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                const stream = yield this.api.listObjects(name, '', false);
                stream.on('data', (obj) => { objects.push(obj); });
                stream.on('error', (err) => { return reject(err); });
                stream.on('end', () => { return resolve(objects); });
            }));
            return objects.filter(o => o.prefix);
        });
    }
    /**
     *
     * @param bucket Name of the bucket
     * @param folder Name of the folder
     * @returns
     */
    createFolder(bucket, folder) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.createFolder [bucket=%s, folder=%s]', bucket, folder);
            return this.api.createFolder(bucket, folder);
        });
    }
    upload(bucket, folder, buffer, path) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.upload');
            let stream;
            if (!path) {
                stream = buffer;
            }
            else {
                stream = (0, fs_1.createReadStream)(path);
            }
            return this.api.upload(bucket, folder, stream);
        });
    }
    getUrl(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('MinioService.getUrl');
            return this.api.getUrl(bucket, file);
        });
    }
    downloadFile(bucket, file) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.trace('AWSService.downloadfile');
            return (yield this.api.downloadFile(bucket, file)).Body;
        });
    }
}
exports.default = AwsService;
