import config from 'config';
import { expect } from 'chai';
import { s3Client } from './_config';

const bucket : string = config.get('bucketName');

describe('[TI] - List folders', () => {
  before(async () => {
    await s3Client.createFolder(bucket, 'folder1');
    await s3Client.createFolder(bucket, 'folder2');
    await s3Client.createFolder(bucket, 'folder3');
    await s3Client.uploadDocument(bucket, 'folder3/toto', Buffer.from('zoifhzefi'));
  });

  after(async () => {
    await s3Client.deleteFolder(bucket, 'folder1');
    await s3Client.deleteFolder(bucket, 'folder2');
    await s3Client.deleteFolder(bucket, 'folder3');
  });

  it('should correctly list the folder in the bucket', async () => {
    return expect(s3Client.listFolders(bucket)).to.be.fulfilled('').then(result => {
      expect(result).to.deep.eq(['folder1', 'folder2', 'folder3']);
    });
  });
});
