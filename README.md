# Custom Python n8n Node

This repository contains a simple n8n node named `AzurePythonRunner` which fetches a public Python file and sends its contents to an Azure Container App Session Pools endpoint for execution.

## Node

The node can be found in `nodes/AzurePythonRunner.node.ts` and exposes two parameters:

- **Python File URL** – public URL of the Python script to execute.
- **Azure Session Pools Endpoint** – HTTP endpoint of your Azure Container App Session Pools instance.

The node retrieves the file from the supplied URL, then posts the code to the specified endpoint. The response from the endpoint is returned as the node output.

## Usage

1. Build the node with the rest of your n8n extensions.
2. Configure the two parameters when using the node in your workflow.

This repository contains only the source TypeScript file. You may need to transpile it to JavaScript before loading it into n8n depending on your setup.
