import { expect } from 'chai';
import { s3Client } from './_config';

describe('[TI] - List folders', () => {
  it('should correctly make a real call', async () => {
    return expect(s3Client.listFolders('pictures-prod')).to.be.fulfilled('').then(result => {
      expect(result).to.be.an('array');
    });
  });
});
