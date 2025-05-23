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
                displayName: 'Bearer Token',
                name: 'bearerToken',
                type: 'string',
                default: '',
                placeholder: '',
                description: 'Token to the Python script',
            },
            {
                displayName: 'sessionUrl',
                name: 'sessionUrl',
                type: 'string',
                default: '',
                placeholder: '',
                description: '  Python script',
            },
        ],
    };

    generateSessionId(prefix: string = 'sess'): string {
        const timestamp = Date.now().toString(36); // base36 timestamp for compactness
        const randomPart = Math.random().toString(36).substring(2, 10); // random alphanumeric
        return `${prefix}-${timestamp}-${randomPart}`;
    }

    async execute(this: IExecuteFunctions) {
        const items = this.getInputData();
        const returnData = [] as INodeExecutionData[];
        const sessionUrl = this.getNodeParameter('sessionUrl', 1) as string;
        if (!sessionUrl) {
            throw new Error('AZURE_SESSION_URL environment variable must be set');
        }

        const token = this.getNodeParameter('bearerToken', 0) as string;
    
        const pythonScript = `import requests\nimport pandas as pd\nfrom io import StringIO\nimport json\n\ndef fetch_time_series_data():\n    """\n    Fetch time series data from a public source and return it as JSON.\n    """\n    url = "https://datahub.io/core/global-temp/r/monthly.csv"  # Public source for global temperature data\n\n    try:\n        response = requests.get(url)\n        response.raise_for_status()  # Raise an error for bad status codes\n\n        # Convert the CSV data to a pandas DataFrame\n        data = pd.read_csv(StringIO(response.text))\n        return data.to_json(orient='records')  # Return the data as JSON\n\n    except requests.exceptions.RequestException as e:\n        raise Exception(f"Error fetching data: {e}")\n\nfetch_time_series_data()`;
        console.log('Python Script:', pythonScript);
        const sessionId = AzurePythonRunner.prototype.generateSessionId();
        const sessionUrlWithId = `${sessionUrl}&identifier=${sessionId}`;

        try {
            const payload = {
                code: pythonScript,
                codeInputType: 'Inline',
                executionType: 'Synchronous',
                timeoutInSeconds: 240,
            };

            const response = await axios.post(sessionUrlWithId, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            returnData.push({ json: response.data });
            return [returnData];
        } catch (error) {
            console.error('Error executing Python script:', error);
            return [[{ json: { error: error instanceof Error ? error.message : String(error) } }]];
        }
    }
}
