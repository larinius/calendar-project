import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import appReducer from "./features/app/appSlice";
import calendarReducer from "./features/calendar/calendarSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["app", "calendar"],
};

const persistedAppReducer = persistReducer(persistConfig, appReducer);

export const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  reducer: {
    app: persistedAppReducer,
    calendar: calendarReducer,
  },
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);
