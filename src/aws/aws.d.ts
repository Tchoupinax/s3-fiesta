export interface Configuration {
  config: {
    endpoint: string;
    accessKey: string;
    secretKey: string;
    useSSL: boolean;
    port?: number;
    region?: string;
  }
  logger?: any
}
