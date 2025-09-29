import { Configuration, ContractsApi } from '@curvegrid/multibaas-sdk';

// MultiBaas API client configuration
const multiBaasConfig = new Configuration({
  basePath: process.env.NEXT_PUBLIC_MULTIBAAS_DEPLOYMENT_URL,
  apiKey: process.env.NEXT_PUBLIC_MULTIBAAS_DAPP_USER_API_KEY
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
  value?: string // For payable functions
) => {
  try {
    const response = await contractsApi.callContractFunction(
      'ethereum', // chain
      address, // addressOrAlias
      contractLabel, // contract
      method, // method
      {
        args,
        ...(value && { value }) // Include value for payable functions
      }
    );

    const result = response.data.result;
    if (result.kind === 'TransactionToSignResponse') {
      return result;
    } else {
      throw new Error('Unexpected response type for write call');
    }
  } catch (error) {
    console.error('Error calling contract write method:', error);
    throw error;
  }
};

// Helper function to get unsigned transaction for wallet signing
export const getUnsignedTransaction = async (
  address: string,
  contractLabel: string,
  method: string,
  args: any[] = [],
  value?: string
) => {
  try {
    const response = await contractsApi.callContractFunction(
      'ethereum',
      address,
      contractLabel,
      method,
      {
        args,
        ...(value && { value })
      }
    );

    const result = response.data.result;
    if (result.kind === 'TransactionToSignResponse') {
      return result;
    } else {
      throw new Error('Unexpected response type for unsigned transaction');
    }
  } catch (error) {
    console.error('Error getting unsigned transaction:', error);
    throw error;
  }
};