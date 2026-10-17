import { baseApi } from './baseApi'

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (params) => ({ url: '/payments', params }),
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
    createPayment: builder.mutation({
      query: (body) => ({ url: '/payments', method: 'POST', body }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }, 'RepairTicket', 'Dashboard', 'Notification'],
    }),
    getTicketPayments: builder.query({
      query: (ticketId) => `/repair-tickets/${ticketId}/payments`,
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
    refundPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payments/${id}/refunds`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }, 'RepairTicket', 'Dashboard'],
    }),
  }),
})

export const {
  useGetPaymentsQuery,
  useCreatePaymentMutation,
  useGetTicketPaymentsQuery,
  useRefundPaymentMutation,
} = paymentsApi
