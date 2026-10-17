import { baseApi } from './baseApi'

export const shopsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShop: builder.query({
      query: () => '/shops/me',
      providesTags: ['Shop'],
    }),
    updateShop: builder.mutation({
      query: (body) => ({ url: '/shops/me', method: 'PATCH', body }),
      invalidatesTags: ['Shop', 'Auth'],
    }),
  }),
})

export const { useGetShopQuery, useUpdateShopMutation } = shopsApi
