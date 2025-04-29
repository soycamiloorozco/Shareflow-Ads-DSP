import request from '../helpers/request';

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export const paymentApi = {
  createPaymentIntent: async (data: any): Promise<PaymentIntentResponse> => {
    const response = await request.post('/payment/create-intent', data);
    return response.data;
  },

  confirmPayment: async (paymentMethodId: string, paymentIntentId: string): Promise<any> => {
    const response = await request.post('/payment/confirm', {
      paymentMethodId,
      paymentIntentId
    });
    return response.data;
  },

  savePaymentMethod: async (paymentMethodId: string): Promise<PaymentMethod> => {
    const response = await request.post('/payment/save-method', {
      paymentMethodId
    });
    return response.data;
  }
}; 