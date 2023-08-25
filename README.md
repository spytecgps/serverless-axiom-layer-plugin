# Serverless Axiom Layer Plugin

## Overview

This Serverless plugin automates the integration of the Axiom layer into your Serverless functions.

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

Specify the Axiom layer version you want to use:

```yaml
custom:
  axiom:
    account: YOUR_AXIOM_ACCOUNT          # Default: 694952825951
    layerVersion: YOUR_AXIOM_LAYER_VERSION  # Default: 4
```

## Usage

Run `serverless deploy` to deploy your function with the Axiom layer.


## License

MIT License