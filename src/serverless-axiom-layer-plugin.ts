type ServerlessInstance = {
  service: {
    custom: any;
    getAllFunctions: () => string[];
    getFunction: (name: string) => any;
    provider: {
      region: string;
    };
  };
  providers: {
    aws: {
      sdk: any;
    };
  };
  cli: {
    log: (message: string) => void;
  };
};

type Options = {
  function?: string;
};

export default class ServerlessAxiomLayerPlugin {
  private serverless: ServerlessInstance;
  private options: Options;
  private axiomLayerVersion: number;
  private axiomAccount: number;
  private defaultArchitecture: string;
  public hooks: { [key: string]: () => Promise<void> };

  constructor(serverless: ServerlessInstance, options: Options) {
    this.serverless = serverless;
    this.options = options;
    this.axiomLayerVersion = 4;
    this.axiomAccount = 694952825951;
    this.defaultArchitecture = 'x86_64';

    const axiomConfig = this.serverless.service.custom.axiom;

    if (axiomConfig) {
      this.axiomAccount = axiomConfig.account || this.axiomAccount;
      this.axiomLayerVersion =
        axiomConfig.layerVersion || this.axiomLayerVersion;
      this.defaultArchitecture =
        axiomConfig.defaultArchitecture || this.defaultArchitecture;
    }

    this.serverless.cli.log(`Axiom Layer Version: ${this.axiomLayerVersion}`);
    this.serverless.cli.log(`Axiom Account: ${this.axiomAccount}`);

    this.hooks = {
      'deployLayer:deploy': this.deployLayer.bind(this),
      'after:deploy:deploy': this.deployLayer.bind(this),
    };
  }

  async deployLayer(): Promise<void> {
    const AWS = this.serverless.providers.aws.sdk;
    const AWS_REGION = this.serverless.service.provider.region;
    const lambda = new AWS.Lambda({
      region: this.serverless.service.provider.region,
    });

    const functions = this.options.function
      ? [this.options.function]
      : this.serverless.service.getAllFunctions();

    try {
      const provider = this.serverless.service.provider as any;

      for (const func of functions) {
        const f = this.serverless.service.getFunction(func);

        const functionName = f.name;
        const architecture =
          f.architecture || provider.architecture || this.defaultArchitecture;

        const AXIOM_LAYER_ARN = `arn:aws:lambda:${AWS_REGION}:${this.axiomAccount}:layer:axiom-extension-${architecture}:${this.axiomLayerVersion}`;

        await lambda
          .updateFunctionConfiguration({
            FunctionName: functionName,
            Layers: [AXIOM_LAYER_ARN],
          })
          .promise();

        this.serverless.cli.log(`Added Axiom layer to ${functionName}`);
      }
    } catch (err: any) {
      this.serverless.cli.log(err);
    }
  }
}
