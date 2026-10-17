import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { toast } from 'sonner'

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json')
    return headers
  },
})

const baseQueryWithErrorHandling = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)
  if (result.error) {
    const status = result.error.status
    const data = result.error.data
    const message = Array.isArray(data?.message)
      ? data.message.join(', ')
      : data?.message || 'Request failed'
    if (status === 401 && !String(args.url || args).includes('/auth/login')) {
      // session expired — pages handle redirect via ProtectedRoute
    } else if (status !== 401) {
      // avoid noisy toasts for expected auth checks
      if (extraOptions?.silent !== true) {
        // mutation errors often toasted in components; keep quiet for queries
      }
    }
    result.error.message = message
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithErrorHandling,
  tagTypes: [
    'Auth',
    'Customer',
    'Device',
    'RepairTicket',
    'Technician',
    'Inventory',
    'Payment',
    'Notification',
    'Dashboard',
    'Report',
    'Shop',
  ],
  endpoints: () => ({}),
})

export { toast }
