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
import goalsReducer, { replaceGoalsFromRemote } from "./goalsSlice";
import depotReducer, { replaceDepotFromRemote } from "./depotSlice";

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

const WRITE_TO_FIREBASE_DEBOUNCE_MS = 500;
let writeTimeoutHandle: NodeJS.Timeout | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    const firebase = getFirebase();
    firebase.updateProfile(newData);
  });
}
const writeToFirebaseMiddleware = (getFirebase) => (store) => (next) => (
  action
) => {
  const state = store.getState();
  if (
    state.firebase.auth.isLoaded &&
    !state.firebase.auth.isEmpty &&
    (action.type.startsWith("depot") || action.type.startsWith("goals"))
  ) {
    console.log("in writeToFirebaseMiddleware");
    if (
      action.type === replaceGoalsFromRemote.toString() ||
      action.type === replaceDepotFromRemote.toString()
    ) {
      console.log("it's a remote update, skipping");
    } else {
      console.log("action:", action);
      const firebase = getFirebase();
      const retVal = next(action);
      const { goals, depot } = store.getState();
      const newData = { goals, depot };
      console.log("writing new data:", newData);
      if (writeTimeoutHandle !== null) {
        clearTimeout(writeTimeoutHandle);
      }
      writeTimeoutHandle = setTimeout(() => {
        console.log("setTimeout timer is up!");
        firebase.updateProfile(newData);
      }, WRITE_TO_FIREBASE_DEBOUNCE_MS);
      return retVal;
    }
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
