import { baseApi } from './baseApi'

export const devicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevices: builder.query({
      query: (params) => ({ url: '/devices', params }),
      providesTags: [{ type: 'Device', id: 'LIST' }],
    }),
    getDevice: builder.query({
      query: (id) => `/devices/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Device', id }],
    }),
    createDevice: builder.mutation({
      query: (body) => ({ url: '/devices', method: 'POST', body }),
      invalidatesTags: [{ type: 'Device', id: 'LIST' }],
    }),
    updateDevice: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/devices/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Device', id }, { type: 'Device', id: 'LIST' }],
    }),
    uploadDevicePhotos: builder.mutation({
      query: ({ id, files }) => {
        const formData = new FormData()
        files.forEach((file) => formData.append('photos', file))
        return { url: `/devices/${id}/photos`, method: 'POST', body: formData }
      },
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Device', id }, { type: 'Device', id: 'LIST' }],
    }),
    removeDevicePhoto: builder.mutation({
      query: ({ id, url }) => ({
        url: `/devices/${id}/photos`,
        method: 'DELETE',
        body: { url },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Device', id }, { type: 'Device', id: 'LIST' }],
    }),
    deleteDevice: builder.mutation({
      query: (id) => ({ url: `/devices/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Device', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetDevicesQuery,
  useGetDeviceQuery,
  useCreateDeviceMutation,
  useUpdateDeviceMutation,
  useUploadDevicePhotosMutation,
  useRemoveDevicePhotoMutation,
  useDeleteDeviceMutation,
} = devicesApi
