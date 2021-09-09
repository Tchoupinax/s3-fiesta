import assert from 'assert';
import config from 'config';
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinonChai from 'sinon-chai';
import dirtyChai from 'dirty-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';
// import rewiremock from "rewiremock";
// import forEach from "mocha-each";

// rewiremock.overrideEntryPoint(module); // this is important. This command is "transfering" this module parent to rewiremock

chai.use(chaiHttp);
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(chaiShallowDeepEqual);

import { S3 } from '../src/index';

assert(config.get('AWS_ACCESS_KEY'), 'Please provide an AWS_ACCESS_KEY that will be used for the TEST');
assert(config.get('AWS_SECRET_KEY'), 'Please provide an AWS_SECRET_KEY that will be used for the TEST');

const s3Client: InstanceType<typeof S3> = new S3({
  config: {
    endpoint: 's3.fr-par.scw.cloud',
    useSSL: false,
    accessKey: config.get('AWS_ACCESS_KEY'),
    secretKey: config.get('AWS_SECRET_KEY'),
    region: 'fr-par',
  },
  logger: { trace: () => {}, debug: () => {}, error: () => {} },
});

export { s3Client };
