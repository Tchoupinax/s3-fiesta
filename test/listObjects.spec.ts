import { expect } from 'chai';
import { s3Client } from './_config';

describe('[TI] - List objects', () => {
  it('should correctly make a real call', async () => {
    return expect(s3Client.listObjects('corentin', '')).to.be.fulfilled('').then(result => {
      expect(result).to.be.an('array');
    });
  });

  it('should correctly make a real call', async () => {
    return expect(s3Client.listObjects('corentin', 'divers', true)).to.be.fulfilled('').then(result => {
      expect(result).to.be.an('array');
    });
  });
});
