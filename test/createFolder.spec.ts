import config from 'config';
import { expect } from 'chai';
import { s3Client } from './_config';

const bucket : string = config.get('bucketName');

describe('[TI] - Create an folder', () => {
  it('should correctly make a real call', async () => {
    return expect(s3Client.createFolder(bucket, 'toto22')).to.be.fulfilled('').then(result => {
      expect(result).to.have.keys(['etag', 'versionId']);
    });
  });
});
