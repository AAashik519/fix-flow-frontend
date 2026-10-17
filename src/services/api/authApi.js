import { baseApi } from './baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth', 'Notification', 'Dashboard'],
    }),
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
})

export const { useRegisterMutation, useLoginMutation, useLogoutMutation, useMeQuery } = authApi
