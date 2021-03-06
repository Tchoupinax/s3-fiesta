const { S3 } = require('./lib/index');

const s3Client = new S3({ config: {
  endpoint: 's3.fr-par.scw.cloud',
  useSSL: false,
  accessKey: '',
  secretKey: '',
  region: 'fr-par',
}, logger: { trace: console.log }});

async function run() {
  s3Client.createFolder('dzaiohdzadz', 'toto');
  s3Client.uploadDocument('dzaiohdzadz', 'toto/a', 'TOTO');
  console.log(await s3Client.listBuckets());
  console.log(await s3Client.listFolders('dzaiohdzadz'));
  console.log(await s3Client.listFiles('dzaiohdzadz', 'toto'));
  await s3Client.deleteFolder;
}

run();
