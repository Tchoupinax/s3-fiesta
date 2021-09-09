import config from 'config';
import { expect } from 'chai';
import { s3Client } from './_config';

const bucket : string = config.get('bucketName');

describe('[TI] - List objects', () => {
  before(async () => {
    await s3Client.createFolder(bucket, 'folder1');
    await s3Client.createFolder(bucket, 'folder2');
    await s3Client.createFolder(bucket, 'folder3');
    await s3Client.uploadDocument(bucket, 'banana', Buffer.from('Foo'));
    await s3Client.uploadDocument(bucket, 'folder3/tata', Buffer.from('Foo'));
  });

  after(async () => {
    await s3Client.deleteFolder(bucket, 'folder1');
    await s3Client.deleteFolder(bucket, 'folder2');
    await s3Client.deleteFolder(bucket, 'folder3');
    await s3Client.deleteFile(bucket, 'banana');
  });

  it('should only list the object located in the root of the bucket', async () => {
    return expect(s3Client.listFiles(bucket)).to.be.fulfilled('').then(result => {
      expect(result).to.deep.eq(['banana']);
    });
  });

  it('should correctly make a real call', async () => {
    return expect(s3Client.listFiles(bucket, 'folder3')).to.be.fulfilled('').then(result => {
      expect(result).to.deep.eq(['tata']);
    });
  });
});
