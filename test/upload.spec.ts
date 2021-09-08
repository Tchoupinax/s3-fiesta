import { expect } from 'chai';
import { s3Client } from './_config';

const bucketTestName = 'corentin';

describe('[TI] - Upload an object', () => {
  it('Test to upload a file on S3', async () => {
    const fileName = `${new Date().toISOString()}-elem.txt`;

    await s3Client.upload(bucketTestName, fileName, undefined, `${process.cwd()}/test/data/elem.txt`);

    return expect(s3Client.listObjects(bucketTestName)).to.be.fulfilled()
      .then(res => {
        expect(res.includes(fileName)).to.be.true(); // If not true, it means that the file was not uploaded
      });
  });

  it('Test to upload a buffer on S3', async () => {
    const fileName = `${new Date().toISOString()}-buffer.txt`;

    await s3Client.upload(bucketTestName, fileName, Buffer.from('CECI EST UN BUFFER'));

    return expect(s3Client.listObjects(bucketTestName)).to.be.fulfilled()
      .then(res => {
        expect(res.includes(fileName)).to.be.true(); // If not true, it means that the file was not uploaded
      });
  });
});
