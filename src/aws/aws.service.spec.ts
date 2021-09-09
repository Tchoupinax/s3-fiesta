import { expect } from 'chai';
import { EventEmitter } from 'events';

import AwsService from './aws.service';

let service: any;
describe('aws.service', () => {
  before(() => {
    service = new AwsService({
      config: {
        endpoint: 'endpoint',
        accessKey: '_',
        secretKey: '_',
        useSSL: true,
      },
    });
  });

  it('when calling getChannel should return an eventEmitter channel', () => {
    expect(service.getChannel()).to.be.instanceOf(EventEmitter);
  });
});