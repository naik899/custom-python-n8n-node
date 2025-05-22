import axios from 'axios';

async function getAzureAccessToken(): Promise<string> {
    const tenant = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!tenant || !clientId || !clientSecret) {
        throw new Error('Azure credentials (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET) must be set as environment variables');
    }

    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('grant_type', 'client_credentials');
    params.append('scope', 'https://management.azure.com/.default');

    const response = await axios.post(url, params.toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });

    return response.data.access_token as string;
}
import {
    IExecuteFunctions,
    INodeType,
    INodeTypeDescription,
    IDataObject,
    INodeExecutionData,
} from 'n8n-workflow';

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
            // The Azure session endpoint is provided via the AZURE_SESSION_URL environment variable
        ],
    };

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData = [] as INodeExecutionData[];

        const sessionUrl = process.env.AZURE_SESSION_URL;
        if (!sessionUrl) {
            throw new Error('AZURE_SESSION_URL environment variable must be set');
        }

        const token = await getAzureAccessToken();

        for (let i = 0; i < items.length; i++) {
            const pythonFileUrl = this.getNodeParameter('pythonFileUrl', i) as string;

            const fileResponse = await axios.get<string>(pythonFileUrl);
            const code = fileResponse.data;

            const response = await axios.post(sessionUrl, { code }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            returnData.push({ json: response.data });
        }

        return [returnData];
    }
}
