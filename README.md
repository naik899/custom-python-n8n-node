# Custom Python n8n Node

This repository contains a simple n8n node named `AzurePythonRunner` which fetches a public Python file and sends its contents to an Azure Container App Session Pools endpoint for execution.

## Node

The node can be found in `nodes/AzurePythonRunner.node.ts` and exposes one parameter:

- **Python File URL** – public URL of the Python script to execute.

The endpoint and credentials for Azure are read from environment variables:

- `AZURE_TENANT_ID`
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_SESSION_URL`

The node retrieves the file from the supplied URL, then posts the code to the specified endpoint. The response from the endpoint is returned as the node output.

## Usage

1. Build the node with the rest of your n8n extensions.
2. Ensure the environment variables listed above are set.
3. Configure the Python File URL when using the node in your workflow.

This repository contains only the source TypeScript file. You may need to transpile it to JavaScript before loading it into n8n depending on your setup.
