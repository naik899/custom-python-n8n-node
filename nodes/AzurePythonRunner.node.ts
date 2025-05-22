import axios from 'axios';
import { IExecuteFunctions } from 'n8n-core';
import { INodeType, INodeTypeDescription, IDataObject } from 'n8n-workflow';

export class AzurePythonRunner implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Azure Python Runner',
        name: 'azurePythonRunner',
        group: ['transform'],
        version: 1,
        description: 'Execute a public Python file on Azure Container App Session Pools',
        defaults: {
            name: 'Azure Python Runner',
            color: '#00AAFF',
        },
        inputs: ['main'],
        outputs: ['main'],
        properties: [
            {
                displayName: 'Python File URL',
                name: 'pythonFileUrl',
                type: 'string',
                default: '',
                placeholder: 'https://example.com/script.py',
                description: 'Public URL to the Python script',
            },
            {
                displayName: 'Azure Session Pools Endpoint',
                name: 'endpoint',
                type: 'string',
                default: '',
                placeholder: 'https://your-app.azurecontainerapps.io/run',
                description: 'Endpoint that runs the Python code',
            },
        ],
    };

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData = [] as IDataObject[];

        for (let i = 0; i < items.length; i++) {
            const pythonFileUrl = this.getNodeParameter('pythonFileUrl', i) as string;
            const endpoint = this.getNodeParameter('endpoint', i) as string;

            const fileResponse = await axios.get<string>(pythonFileUrl);
            const code = fileResponse.data;

            const response = await axios.post(endpoint, { code });
            returnData.push({ json: response.data });
        }

        return [
            {
                json: returnData,
            },
        ];
    }
}
