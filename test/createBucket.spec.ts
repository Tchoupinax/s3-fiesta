import { expect } from 'chai';
import { s3Client } from './_config';

describe('[TI] - Create a bucket', () => {
  after(async () => {
    await s3Client.deleteBucket('decimals');
    await s3Client.deleteBucket('alreadydxistsefizhfejh');
  });

  it('should correctly create a bucket', async () => {
    return expect(s3Client.createBucket('decimals')).to.be.fulfilled('').then(result => {
      expect(result).to.be.true();
    });
  });

  it('should throw a specific error when the bucket already exists', async () => {
    await s3Client.createBucket('alreadydxistsefizhfejh');

    return expect(s3Client.createBucket('alreadydxistsefizhfejh')).to.be.rejected('').then(result => {
      expect(result.message).to.eq('BUCKET_ALREADY_CREATED_AND_OWNED_BY_YOU');
    });
  });

  it('should throw a specific error when the bucket name is not available', async () => {
    return expect(s3Client.createBucket('bucket')).to.be.rejected('').then(result => {
      expect(result.message).to.eq('BUCKET_ALREADY_USED');
    });
  });
});
