export interface DepositPayload {
  amount: number;
  paymentReference: string;
  description: string;
}

export interface DepositResponse {
  success: boolean;
  data?: {
    id: string;
    amount: number;
    paymentReference: string;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
  };
  error?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'Deposit';
  status: 'Completed' | 'Pending' | 'Failed';
  paymentReference: string;
  description: string;
  createdAt: Date;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  totalTransactions: number;
  currentPage: number;
  totalPages: number;
}

export interface UseWalletReturn {
    deposit: (payload: DepositPayload) => Promise<DepositResponse>;
    transactions: () => Promise<TransactionsResponse>;
    getBalance: () => Promise<{balance: number}>;
  isLoading: boolean;
  error: string | null;
} 