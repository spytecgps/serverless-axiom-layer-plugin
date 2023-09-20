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

interface FunctionPluginConfiguration {
  functionName: string;
  axiomLayerArn: string;
  existingLayerArns?: string[];
}

export default class ServerlessAxiomLayerPlugin {
  private serverless: ServerlessInstance;
  private options: Options;
  private axiomLayerVersion: number;
  private axiomAccount: number;
  private defaultArchitecture: string;
  private axiomLayerName: string;
  private enabled: boolean;

  public hooks: { [key: string]: () => Promise<void> };

  constructor(serverless: ServerlessInstance, options: Options) {
    this.serverless = serverless;
    this.options = options;
    this.axiomLayerVersion = 4;
    this.axiomAccount = 694952825951;
    this.defaultArchitecture = 'x86_64';
    this.axiomLayerName = 'axiom-extension';
    this.enabled = true;

    const axiomConfig = this.serverless.service.custom.axiom;

    if (axiomConfig) {
      this.axiomAccount = axiomConfig.account || this.axiomAccount;
      this.axiomLayerVersion = axiomConfig.layerVersion || this.axiomLayerVersion;
      this.defaultArchitecture = axiomConfig.defaultArchitecture || this.defaultArchitecture;
      this.enabled = axiomConfig.enabled !== undefined ? axiomConfig.enabled : this.enabled;
    }

    this.serverless.cli.log(`Axiom Layer Version: ${this.axiomLayerVersion}`);
    this.serverless.cli.log(`Axiom Account: ${this.axiomAccount}`);

    this.hooks = {
      'deployLayer:deploy': this.enabled
        ? this.deployLayer.bind(this)
        : this.removeLayer.bind(this),
      'after:deploy:deploy': this.enabled
        ? this.deployLayer.bind(this)
        : this.removeLayer.bind(this),
    };
  }

  async getAllFunctionsNamesAndAxiomArn(): Promise<FunctionPluginConfiguration[]> {
    const AWS = this.serverless.providers.aws.sdk;
    const lambda = new AWS.Lambda({
      region: this.serverless.service.provider.region,
    });
    const AWS_REGION = this.serverless.service.provider.region;
    const functions = this.options.function
      ? [this.options.function]
      : this.serverless.service.getAllFunctions();

    const provider = this.serverless.service.provider as any;
    const result: FunctionPluginConfiguration[] = [];
    for (const func of functions) {
      const f = this.serverless.service.getFunction(func);
      const functionName = f.name;
      const architecture = f.architecture || provider.architecture || this.defaultArchitecture;

      const functionConfiguration = await lambda
        .getFunctionConfiguration({
          FunctionName: functionName,
        })
        .promise();

      const AXIOM_LAYER_ARN = `arn:aws:lambda:${AWS_REGION}:${this.axiomAccount}:layer:${this.axiomLayerName}-${architecture}:${this.axiomLayerVersion}`;
      result.push({
        functionName,
        axiomLayerArn: AXIOM_LAYER_ARN,
        existingLayerArns: functionConfiguration.Layers.map((layer: any) => layer.Arn),
      });
    }
    return result;
  }

  removeAxiomLayer(existingLayerArns: string[] = []): string[] {
    return existingLayerArns.filter((layerArn) => !layerArn.includes(this.axiomLayerName));
  }

  async deployLayer(): Promise<void> {
    const AWS = this.serverless.providers.aws.sdk;
    const lambda = new AWS.Lambda({
      region: this.serverless.service.provider.region,
    });

    try {
      for (const functionPluginConfiguration of await this.getAllFunctionsNamesAndAxiomArn()) {
        const {
          functionName,
          axiomLayerArn,
          existingLayerArns: existingLayers,
        } = functionPluginConfiguration;
        this.serverless.cli.log(`Adding Axiom layer ${axiomLayerArn} to ${functionName}`);
        const layersWithoutAxiom = this.removeAxiomLayer(existingLayers);

        await lambda
          .updateFunctionConfiguration({
            FunctionName: functionName,
            Layers: layersWithoutAxiom.concat(axiomLayerArn),
          })
          .promise();

        this.serverless.cli.log(`Added Axiom layer ${axiomLayerArn} to ${functionName}`);
      }
    } catch (err: any) {
      this.serverless.cli.log(err);
    }
  }

  async removeLayer(): Promise<void> {
    const AWS = this.serverless.providers.aws.sdk;
    const lambda = new AWS.Lambda({
      region: this.serverless.service.provider.region,
    });

    try {
      for (const functionPluginConfiguration of await this.getAllFunctionsNamesAndAxiomArn()) {
        const {
          functionName,
          axiomLayerArn,
          existingLayerArns: existingLayers,
        } = functionPluginConfiguration;
        this.serverless.cli.log(`Removing Axiom layer ${axiomLayerArn} from ${functionName}`);
        const layersWithoutAxiom = this.removeAxiomLayer(existingLayers);

        await lambda
          .updateFunctionConfiguration({
            FunctionName: functionName,
            Layers: layersWithoutAxiom,
          })
          .promise();

        this.serverless.cli.log(`Removed Axiom layer ${axiomLayerArn} from ${functionName}`);
      }
    } catch (err: any) {
      this.serverless.cli.log(err);
    }
  }
}
