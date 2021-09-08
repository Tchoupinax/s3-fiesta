import { S3Service } from '../src/index';

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

const s3Client: InstanceType<typeof S3Service> = new S3Service({
  config: {
    endpoint: 's3.fr-par.scw.cloud',
    useSSL: false,
    accessKey: '',
    secretKey: '',
    region: 'fr-par',
  },
  logger: { trace: () => {}, debug: () => {}, error: () => {} },
});

export { s3Client };
