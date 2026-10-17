import { baseApi } from './baseApi'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardOverview: builder.query({
      query: () => '/dashboard/overview',
      providesTags: ['Dashboard'],
    }),
    getRepairStatistics: builder.query({
      query: () => '/dashboard/repair-statistics',
      providesTags: ['Dashboard'],
    }),
    getRevenueStatistics: builder.query({
      query: () => '/dashboard/revenue-statistics',
      providesTags: ['Dashboard'],
    }),
    getTechnicianWorkload: builder.query({
      query: () => '/dashboard/technician-workload',
      providesTags: ['Dashboard'],
    }),
  }),
})

export const {
  useGetDashboardOverviewQuery,
  useGetRepairStatisticsQuery,
  useGetRevenueStatisticsQuery,
  useGetTechnicianWorkloadQuery,
} = dashboardApi
