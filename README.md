# Serverless Axiom Layer Plugin

## Overview

This Serverless plugin automates the integration of the [Axiom layer](https://github.com/axiomhq/axiom-lambda-extension) into your Serverless functions.

## Installation

```bash
npm install --save-dev @spytecgps/serverless-axiom-layer-plugin
```

## Configuration
Add the plugin to your `serverless.yml`:

```yaml
plugins:
  - '@spytecgps/serverless-axiom-layer-plugin'
```

Specify the Axiom plugin configuration:

```yaml
custom:
  axiom:
    account: YOUR_AXIOM_ACCOUNT                     # Default: 694952825951
    layerVersion: YOUR_AXIOM_LAYER_VERSION          # Default: 11
    defaultArchitecture: YOUR_DEFAULT_ARCHITECTURE  # Default: x86_64
    enabled: true/false                             # Default: true
    fullLayerArn: THE_FULL_AXIOM_LAYER_ARN          # Default: null
```

If the `fullLayerArn` is defined, it will be used without any automatic layer creation. Hence, the `account`, `layerVersion` and `defaultArchitecture` will be ignored.

Is possible to only define the `fullLayerArn` or `layerVersion` inside a specific function:

```yaml
function:
  handler: 'src/index.run'
  axiom:
    fullLayerArn: THE_FULL_AXIOM_LAYER_ARN          # Default: null
    layerVersion: YOUR_AXIOM_LAYER_VERSION          # Default: null
```

If the `fullLayerArn` or `layerVersion` is defined at the function level, it will take predecedence over the `custom.axiom`, if it's defined.
## Usage

Run `serverless deploy` to deploy your function with the Axiom layer.

For a correct plugin uninstall: 
  - Change the configuration to false, in order to remove the layer from all the lambda functions.
  - Run `serverless plugin uninstall --name '@spytecgps/serverless-axiom-layer-plugin'`

## License

MIT License