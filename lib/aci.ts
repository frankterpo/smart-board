import { ACI } from 'aci-sdk';

let aciClient: ACI | null = null;

export function getACIClient() {
  if (!aciClient) {
    const apiKey = process.env.ACI_API_KEY;
    if (!apiKey) {
      throw new Error('ACI_API_KEY is not configured');
    }
    aciClient = new ACI({ apiKey });
  }
  return aciClient;
}

export async function createCardAgent(cardId: string, title: string, description: string) {
  try {
    const client = getACIClient();

    // Derive intent from card content
    const intent = `${title} ${description || ''}`.trim();

    // Create agent record in our database (we'll handle this via API route)
    const agentData = {
      card_id: cardId,
      agent_name: `Agent-${cardId}`,
      description: `AI agent for card: ${title}`,
      intent: intent,
      status: 'active'
    };

    return agentData;
  } catch (error) {
    console.error('Failed to create ACI card agent:', error);
    throw error;
  }
}

export async function searchACITools(intent: string, categories?: string[], limit: number = 10) {
  try {
    const client = getACIClient();

    const apps = await client.apps.search({
      intent,
      categories,
      limit,
      allowed_apps_only: false,
      include_functions: true
    });

    return apps;
  } catch (error) {
    console.error('Failed to search ACI tools:', error);
    throw error;
  }
}

export async function getAppDetails(appName: string) {
  try {
    const client = getACIClient();

    const appDetails = await client.apps.get(appName);
    return appDetails;
  } catch (error) {
    console.error('Failed to get app details:', error);
    throw error;
  }
}

export async function createAppConfiguration(cardId: string, appName: string, securityScheme: string) {
  try {
    const client = getACIClient();

    const configuration = await client.app_configurations.create({
      app_name: appName,
      security_scheme: securityScheme as any
    });

    return configuration;
  } catch (error) {
    console.error('Failed to create app configuration:', error);
    throw error;
  }
}

export async function linkAccount(
  cardId: string,
  appName: string,
  linkedAccountOwnerId: string,
  securityScheme: string,
  apiKey?: string
) {
  try {
    const client = getACIClient();

    const result = await client.linked_accounts.link({
      app_name: appName,
      linked_account_owner_id: linkedAccountOwnerId,
      security_scheme: securityScheme as any,
      ...(apiKey && { api_key: apiKey })
    });

    return result;
  } catch (error) {
    console.error('Failed to link account:', error);
    throw error;
  }
}

export async function executeFunction(
  functionName: string,
  functionArguments: any,
  linkedAccountOwnerId: string
) {
  try {
    const client = getACIClient();

    const result = await client.functions.execute({
      function_name: functionName,
      function_arguments: functionArguments,
      linked_account_owner_id: linkedAccountOwnerId
    });

    return result;
  } catch (error) {
    console.error('Failed to execute function:', error);
    throw error;
  }
}

export async function getFunctionDefinition(functionName: string) {
  try {
    const client = getACIClient();

    const definition = await client.functions.get_definition({
      function_name: functionName,
      format: 'OPENAI' as any
    });

    return definition;
  } catch (error) {
    console.error('Failed to get function definition:', error);
    throw error;
  }
}
