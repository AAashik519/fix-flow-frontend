import { baseApi } from './baseApi'

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepairsReport: builder.query({
      query: (params) => ({ url: '/reports/repairs', params }),
      providesTags: ['Report'],
    }),
    getPaymentsReport: builder.query({
      query: (params) => ({ url: '/reports/payments', params }),
      providesTags: ['Report'],
    }),
    getInventoryReport: builder.query({
      query: () => '/reports/inventory',
      providesTags: ['Report'],
    }),
  }),
})

export const {
  useGetRepairsReportQuery,
  useGetPaymentsReportQuery,
  useGetInventoryReportQuery,
} = reportsApi
