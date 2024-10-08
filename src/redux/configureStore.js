import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { thunk } from 'redux-thunk';

import authReducer from './auth/authReducer';
import rideReducer from './riders/rideReducer';
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ride'],
};

const RootReducer = combineReducers({
  auth: authReducer,
  ride: rideReducer,
  // ACA VAN LOS ESTADOS
});

const persistedReducer = persistReducer(persistConfig, RootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(thunk),
});

export default store;
// export type RootState = ReturnType<typeof RootReducer>;

// Define el tipo de tu estado global
