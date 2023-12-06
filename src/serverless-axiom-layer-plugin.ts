import * as Serverless from 'serverless';

export interface ExtendedFunctionDefinition extends Serverless.FunctionDefinitionHandler {
  architecture?: string;
  layers?: string[];
  axiom?: {
    fullLayerArn?: string;
    axiomLayerVersion?: number;
  };
}

interface FunctionPluginConfiguration {
  serverlesFunction: ExtendedFunctionDefinition;
  axiomLayerArn: string;
  existingLayerArns?: string[];
}

export default class ServerlessAxiomLayerPlugin {
  private serverless: Serverless;
  private options: Serverless.Options;
  private axiomLayerVersion: number;
  private axiomAccount: number;
  private defaultArchitecture: string;
  private axiomLayerName: string;
  private enabled: boolean;
  private fullLayerArn: string | null;

  public hooks: { [key: string]: () => Promise<void> | void };

  constructor(serverless: Serverless, options: Serverless.Options) {
    this.serverless = serverless;
    this.options = options;
    this.axiomLayerVersion = 8;
    this.axiomAccount = 694952825951;
    this.defaultArchitecture = 'x86_64';
    this.axiomLayerName = 'axiom-extension';
    this.enabled = true;
    this.fullLayerArn = null;

    const axiomConfig = this.serverless.service.custom.axiom;

    if (axiomConfig) {
      this.axiomAccount = axiomConfig.account ?? this.axiomAccount;
      this.axiomLayerVersion = axiomConfig.layerVersion ?? this.axiomLayerVersion;
      this.defaultArchitecture = axiomConfig.defaultArchitecture ?? this.defaultArchitecture;
      this.enabled = axiomConfig.enabled !== undefined ? axiomConfig.enabled : this.enabled;
      this.fullLayerArn = axiomConfig.fullLayerArn ?? null;
    }

    this.serverless.cli.log(`Axiom Layer Version: ${this.axiomLayerVersion}`);
    this.serverless.cli.log(`Axiom Account: ${this.axiomAccount}`);

    this.hooks = {
      'before:package:createDeploymentArtifacts': this.enabled
        ? this.deployLayer.bind(this)
        : this.removeLayer.bind(this),
      'before:deploy:function:packageFunction': this.enabled
        ? this.deployLayer.bind(this)
        : this.removeLayer.bind(this),
    };
  }

  getAllFunctionsNamesAndAxiomArn(): FunctionPluginConfiguration[] {
    const AWS_REGION = this.serverless.service.provider.region;
    const functions = this.options.function
      ? [this.options.function]
      : this.serverless.service.getAllFunctions();

    const provider = this.serverless.service.provider as any;
    const result: FunctionPluginConfiguration[] = [];
    for (const func of functions) {
      const serverlesFunction: ExtendedFunctionDefinition = this.serverless.service.getFunction(
        func,
      ) as ExtendedFunctionDefinition;
      if (serverlesFunction) {
        const architecture =
          serverlesFunction.architecture ?? provider.architecture ?? this.defaultArchitecture;

        const existingLayerArns = serverlesFunction.layers ?? [];

        const AXIOM_LAYER_VERSION =
          serverlesFunction.axiom?.axiomLayerVersion ?? this.axiomLayerVersion;

        const AXIOM_LAYER_ARN =
          serverlesFunction.axiom?.fullLayerArn ??
          this.fullLayerArn ??
          `arn:aws:lambda:${AWS_REGION}:${this.axiomAccount}:layer:${this.axiomLayerName}-${architecture}:${AXIOM_LAYER_VERSION}`;

        result.push({
          serverlesFunction,
          axiomLayerArn: AXIOM_LAYER_ARN,
          existingLayerArns,
        });
        this.serverless.cli.log(`Function ${serverlesFunction.name} pushed`);
      } else {
        this.serverless.cli.log(`Function ${func} not found`);
      }
    }
    return result;
  }

  removeAxiomLayer(existingLayerArns: string[] = []): string[] {
    return existingLayerArns.filter((layerArn) => !layerArn.includes(this.axiomLayerName));
  }

  deployLayer(): void {
    try {
      for (const functionPluginConfiguration of this.getAllFunctionsNamesAndAxiomArn()) {
        const {
          serverlesFunction,
          axiomLayerArn,
          existingLayerArns: existingLayers,
        } = functionPluginConfiguration;
        this.serverless.cli.log(`Adding Axiom layer ${axiomLayerArn} to ${serverlesFunction.name}`);
        const layersWithoutAxiom = this.removeAxiomLayer(existingLayers);

        serverlesFunction.layers = layersWithoutAxiom.concat(axiomLayerArn);

        this.serverless.cli.log(`Added Axiom layer ${axiomLayerArn} to ${serverlesFunction.name}`);
      }
    } catch (err: any) {
      this.serverless.cli.log(err);
    }
  }

  async removeLayer(): Promise<void> {
    try {
      for (const functionPluginConfiguration of this.getAllFunctionsNamesAndAxiomArn()) {
        const { serverlesFunction, axiomLayerArn, existingLayerArns } = functionPluginConfiguration;
        this.serverless.cli.log(
          `Removing Axiom layer ${axiomLayerArn} from ${serverlesFunction.name}`,
        );
        const layersWithoutAxiom = this.removeAxiomLayer(existingLayerArns);

        serverlesFunction.layers = layersWithoutAxiom;

        this.serverless.cli.log(
          `Removed Axiom layer ${axiomLayerArn} from ${serverlesFunction.name}`,
        );
      }
    } catch (err: any) {
      this.serverless.cli.log(err);
    }
  }
}
