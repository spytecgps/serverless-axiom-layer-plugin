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
    layerVersion: YOUR_AXIOM_LAYER_VERSION          # Default: 4
    defaultArchitecture: YOUR_DEFAULT_ARCHITECTURE  # Default: x86_64
    enabled: true/false                             # Default: true
```

## Usage

Run `serverless deploy` to deploy your function with the Axiom layer.

For a correct plugin uninstall: 
  - Change the configuration to false, in order to remove the layer from all the lambda functions.
  - Run `serverless plugin uninstall --name '@spytecgps/serverless-axiom-layer-plugin'`

## License

MIT License