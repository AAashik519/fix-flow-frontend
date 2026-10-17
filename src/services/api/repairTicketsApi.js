import { baseApi } from './baseApi'

export const repairTicketsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepairTickets: builder.query({
      query: (params) => ({ url: '/repair-tickets', params }),
      providesTags: [{ type: 'RepairTicket', id: 'LIST' }],
    }),
    getRepairTicket: builder.query({
      query: (id) => `/repair-tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'RepairTicket', id }],
    }),
    createRepairTicket: builder.mutation({
      query: (body) => ({ url: '/repair-tickets', method: 'POST', body }),
      invalidatesTags: [{ type: 'RepairTicket', id: 'LIST' }, 'Dashboard', 'Notification'],
    }),
    updateRepairTicket: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/repair-tickets/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RepairTicket', id }, { type: 'RepairTicket', id: 'LIST' }],
    }),
    assignTechnician: builder.mutation({
      query: ({ id, technicianId }) => ({
        url: `/repair-tickets/${id}/assign-technician`,
        method: 'PATCH',
        body: { technicianId },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RepairTicket', id }, 'Notification'],
    }),
    updateRepairStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/repair-tickets/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'RepairTicket', id },
        { type: 'RepairTicket', id: 'LIST' },
        'Dashboard',
        'Notification',
      ],
    }),
    addDiagnostics: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/repair-tickets/${id}/diagnostics`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RepairTicket', id }, 'Notification'],
    }),
    addNote: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/repair-tickets/${id}/notes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'RepairTicket', id }],
    }),
    addParts: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/repair-tickets/${id}/parts`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'RepairTicket', id },
        'Inventory',
        'Dashboard',
      ],
    }),
    getTicketHistory: builder.query({
      query: (id) => `/repair-tickets/${id}/history`,
      providesTags: (_r, _e, id) => [{ type: 'RepairTicket', id }],
    }),
    trackRepair: builder.query({
      query: (token) => `/public/tracking/${token}`,
    }),
  }),
})

export const {
  useGetRepairTicketsQuery,
  useGetRepairTicketQuery,
  useCreateRepairTicketMutation,
  useUpdateRepairTicketMutation,
  useAssignTechnicianMutation,
  useUpdateRepairStatusMutation,
  useAddDiagnosticsMutation,
  useAddNoteMutation,
  useAddPartsMutation,
  useGetTicketHistoryQuery,
  useTrackRepairQuery,
} = repairTicketsApi
