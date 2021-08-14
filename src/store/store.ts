import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import localForage from "localforage";
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
import { combineReducers } from "redux";
import { firebaseReducer, getFirebase } from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore";
import goalsReducer from "./goalsSlice";
import depotReducer from "./depotSlice";

const rootReducer = combineReducers({
  goals: goalsReducer,
  depot: depotReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer,
});

const persistConfig = {
  key: "root",
  version: 1,
  storage: localForage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const writeToFirebaseMiddleware = (getFirebase) => (store) => (next) => (
  action
) => {
  const state = store.getState();
  if (
    (action.type.startsWith("depot") || action.type.startsWith("goals")) &&
    state.firebase.auth.isLoaded &&
    !state.firebase.auth.isEmpty
  ) {
    const firebase = getFirebase();
    const sliceName = action.type.split("/")[0];
    const retVal = next(action);
    const sliceData = store.getState()[sliceName];
    firebase.updateProfile({ [sliceName]: sliceData });
    return retVal;
  }
  return next(action);
};

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(writeToFirebaseMiddleware(getFirebase)),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
