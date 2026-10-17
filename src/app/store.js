import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '../services/api/baseApi'
import uiReducer from '../features/ui/uiSlice'

// side-effect imports to register endpoints
import '../services/api/authApi'
import '../services/api/customersApi'
import '../services/api/devicesApi'
import '../services/api/repairTicketsApi'
import '../services/api/techniciansApi'
import '../services/api/inventoryApi'
import '../services/api/paymentsApi'
import '../services/api/notificationsApi'
import '../services/api/dashboardApi'
import '../services/api/reportsApi'
import '../services/api/shopsApi'

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

setupListeners(store.dispatch)
