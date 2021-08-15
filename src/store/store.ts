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
import {
  actionTypes,
  firebaseReducer,
  getFirebase,
  ProfileType,
} from "react-redux-firebase";
import { firestoreReducer } from "redux-firestore";
import createMigrate from "redux-persist/es/createMigrate";
import { MigrationManifest } from "redux-persist/es/types";
import goalsReducer, { replaceGoalsFromRemote } from "./goalsSlice";
import depotReducer, { replaceDepotFromRemote } from "./depotSlice";
import syncReducer, { setDirty } from "./syncSlice";

const rootReducer = combineReducers({
  goals: goalsReducer,
  depot: depotReducer,
  sync: syncReducer,
  firebase: firebaseReducer,
  firestore: firestoreReducer,
});

const migrations = {};

const persistConfig = {
  key: "root",
  version: 2,
  storage: localForage,
  migrate: createMigrate(migrations, { debug: true }),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const WRITE_TO_FIREBASE_DEBOUNCE_MS = 500;
let writeTimeoutHandle: NodeJS.Timeout | null = null;
let pendingWrite: Partial<ProfileType> | null = null;
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (pendingWrite) {
      const firebase = getFirebase();
      firebase.updateProfile(pendingWrite);
    }
  });
}
const writeToFirebaseMiddleware = (getFirebase) => (store) => (next) => (
  action
) => {
  const state = store.getState();
  if (state.firebase.auth.isLoaded && !state.firebase.auth.isEmpty) {
    if (action.type.startsWith("depot") || action.type.startsWith("goals")) {
      console.log("in writeToFirebaseMiddleware");
      if (
        action.type === replaceGoalsFromRemote.toString() ||
        action.type === replaceDepotFromRemote.toString()
      ) {
        console.log("it's a remote update, skipping");
      } else {
        store.dispatch(setDirty());
        console.log("action:", action);
        const firebase = getFirebase();
        const retVal = next(action);
        const { goals, depot, _persist } = store.getState();
        pendingWrite = { goals, depot, version: _persist.version };
        console.log("writing new data:", pendingWrite);
        if (writeTimeoutHandle !== null) {
          clearTimeout(writeTimeoutHandle);
        }
        writeTimeoutHandle = setTimeout(() => {
          console.log("setTimeout timer is up!");
          firebase.updateProfile(pendingWrite);
        }, WRITE_TO_FIREBASE_DEBOUNCE_MS);
        return retVal;
      }
    } else if (action.type === actionTypes.SET_PROFILE) {
      console.log("saw SET_PROFILE action");
      // this means we just fetched remote.
      // (1) if remote.version >= local.version: immediately update local depot/goals.
      // (2) if remote.version < local.version: update profile.version and save the change.
      // n.b. we'll have to deal with the fact that case (2) will fire another SET_PROFILE action
      // which will duplicate a write (since it will then trigger case (1).)
      const localVersion = state._persist.version;
      const remoteVersion = action.profile.version;
      if (remoteVersion >= localVersion) {
        console.log("remote is up to date");
        const retVal = next(action);
        store.dispatch(replaceGoalsFromRemote(action.profile.goals));
        store.dispatch(replaceDepotFromRemote(action.profile.depot));
        return retVal;
      }
      console.warn("remote is not up to date");
      const retVal = next(action);
      store.dispatch(setDirty());
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
    }),
  // }).concat(writeToFirebaseMiddleware(getFirebase)),
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
