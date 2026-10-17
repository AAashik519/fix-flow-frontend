import { baseApi } from './baseApi'

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInventory: builder.query({
      query: (params) => ({ url: '/inventory', params }),
      providesTags: [{ type: 'Inventory', id: 'LIST' }],
    }),
    getInventoryItem: builder.query({
      query: (id) => `/inventory/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Inventory', id }],
    }),
    getLowStock: builder.query({
      query: () => '/inventory/low-stock',
      providesTags: [{ type: 'Inventory', id: 'LOW' }],
    }),
    createInventoryItem: builder.mutation({
      query: (body) => ({ url: '/inventory', method: 'POST', body }),
      invalidatesTags: [{ type: 'Inventory', id: 'LIST' }, { type: 'Inventory', id: 'LOW' }],
    }),
    updateInventoryItem: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/inventory/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'LOW' },
      ],
    }),
    addStockMovement: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/inventory/${id}/stock-movements`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Inventory', id },
        { type: 'Inventory', id: 'LIST' },
        { type: 'Inventory', id: 'LOW' },
      ],
    }),
    getStockMovements: builder.query({
      query: (id) => `/inventory/${id}/stock-movements`,
      providesTags: (_r, _e, id) => [{ type: 'Inventory', id }],
    }),
  }),
})

export const {
  useGetInventoryQuery,
  useGetInventoryItemQuery,
  useGetLowStockQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useAddStockMovementMutation,
  useGetStockMovementsQuery,
} = inventoryApi
