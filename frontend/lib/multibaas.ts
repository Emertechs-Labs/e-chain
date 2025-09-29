import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// Validate environment variables
const validateEnvironment = () => {
  const requiredEnvVars = {
    NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
    NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('Missing environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return requiredEnvVars;
};

// Validate environment on module load
const envVars = validateEnvironment();

// MultiBaas API client configuration
const multiBaasConfig = new Configuration({
  basePath: envVars.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  apiKey: envVars.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY,
});

// Create API clients
export const contractsApi = new ContractsApi(multiBaasConfig);

// Helper function to call contract read methods
export const callContractRead = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = []
) => {
  try {
    console.log('MultiBaas callContractRead:', {
      address,
      contractLabel,
      method,
      args,
      basePath: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
      hasApiKey: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
    });

    const response = await contractsApi.callContractFunction(
      'ethereum', // chain
      address, // addressOrAlias
      contractLabel, // contract
      method, // method
      { args } // postMethodArgs
    );

    console.log('MultiBaas response:', response.data);

    const result = response.data.result;
    if (result.kind === 'MethodCallResponse') {
      return result.output;
    } else {
      throw new Error(`Unexpected response type for read call: ${result.kind}`);
    }
  } catch (error: any) {
    console.error('MultiBaas callContractRead error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};

// Helper function to call contract write methods (transactions)
export const callContractWrite = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  from: string, // Required for write operations
  value?: string // For payable functions
) => {
  try {
    console.log('MultiBaas callContractWrite:', {
      address,
      contractLabel,
      method,
      args,
      from,
      value,
      basePath: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
      hasApiKey: !!process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
    });

    const response = await contractsApi.callContractFunction(
      'ethereum', // chain
      address, // addressOrAlias
      contractLabel, // contract
      method, // method
      {
        args,
        from, // Required for write operations
        ...(value && { value }) // Include value for payable functions
      }
    );

    console.log('MultiBaas write response:', response.data);

    const result = response.data.result;
    if (result.kind === 'TransactionToSignResponse') {
      return result;
    } else {
      throw new Error(`Unexpected response type for write call: ${result.kind}`);
    }
  } catch (error: any) {
    console.error('MultiBaas callContractWrite error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
};

// Helper function to get unsigned transaction for wallet signing
export const getUnsignedTransaction = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  from: string, // Required for transaction preparation
  value?: string
) => {
  try {
    console.log('MultiBaas getUnsignedTransaction:', {
      address,
      contractLabel,
      method,
      args,
      from,
      value
    });

    const response = await contractsApi.callContractFunction(
      'ethereum',
      address,
      contractLabel,
      method,
      {
        args,
        from, // Required for transaction preparation
        ...(value && { value })
      }
    );

    console.log('MultiBaas unsigned transaction response:', response.data);

    const result = response.data.result;
    if (result.kind === 'TransactionToSignResponse') {
      return result;
    } else {
      throw new Error(`Unexpected response type for unsigned transaction: ${result.kind}`);
    }
  } catch (error: any) {
    console.error('MultiBaas getUnsignedTransaction error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error;
  }
};