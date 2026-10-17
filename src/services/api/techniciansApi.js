import { baseApi } from './baseApi'

export const techniciansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTechnicians: builder.query({
      query: () => '/technicians',
      providesTags: [{ type: 'Technician', id: 'LIST' }],
    }),
    createTechnician: builder.mutation({
      query: (body) => ({ url: '/technicians', method: 'POST', body }),
      invalidatesTags: [{ type: 'Technician', id: 'LIST' }],
    }),
    updateTechnician: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/technicians/${id}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Technician', id: 'LIST' }],
    }),
    getTechnicianAssignments: builder.query({
      query: (id) => `/technicians/${id}/assignments`,
    }),
  }),
})

export const {
  useGetTechniciansQuery,
  useCreateTechnicianMutation,
  useUpdateTechnicianMutation,
  useGetTechnicianAssignmentsQuery,
} = techniciansApi
