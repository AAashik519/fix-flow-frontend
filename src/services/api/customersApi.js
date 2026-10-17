import { baseApi } from './baseApi'

export const customersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query({
      query: (params) => ({ url: '/customers', params }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((c) => ({ type: 'Customer', id: c._id })),
              { type: 'Customer', id: 'LIST' },
            ]
          : [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomer: builder.query({
      query: (id) => `/customers/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation({
      query: (body) => ({ url: '/customers', method: 'POST', body }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    updateCustomer: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/customers/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Customer', id }, { type: 'Customer', id: 'LIST' }],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `/customers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Customer', id: 'LIST' }],
    }),
    getCustomerRepairHistory: builder.query({
      query: (id) => `/customers/${id}/repair-history`,
      providesTags: (_r, _e, id) => [{ type: 'Customer', id }],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerRepairHistoryQuery,
} = customersApi
