import { expect } from 'chai';
import { s3Client } from './_config';

describe('[TI] - List buckets', () => {
  it('should correctly make a real call', async () => {
    return expect(s3Client.listBuckets()).to.be.fulfilled('').then(result => {
      expect(result).to.be.an('array');

      if (result.length > 0) {
        expect(result[0]).to.have.keys(['name', 'createdAt']);
      }
    });
  });
});
