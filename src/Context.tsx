import React from "react";
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { createFirestoreInstance } from "redux-firestore";
import { Provider } from "react-redux";
import { ReactReduxFirebaseProvider } from "react-redux-firebase";
import { PersistGate } from "redux-persist/es/integration/react";
import { persistor, store } from "./store/store";

const firebaseConfig = {
  apiKey: "AIzaSyDuexwK6LnPRY3ckoxFbp-xSZHZ5y8AR2s",
  authDomain: "arknights-tools-e9261.firebaseapp.com",
  databaseURL: "https://arknights-tools-e9261-default-rtdb.firebaseio.com",
  projectId: "arknights-tools-e9261",
  storageBucket: "arknights-tools-e9261.appspot.com",
  messagingSenderId: "837208309037",
  appId: "1:837208309037:web:099ab53a53572ddf1267a4",
  measurementId: "G-8PTRXNV7RH",
};

firebase.initializeApp(firebaseConfig);

const rrfConfig = {
  userProfile: "users",
  useFirestoreForProfile: true,
};

export const rrfProps = {
  firebase: typeof window !== "undefined" ? firebase : {},
  config: rrfConfig,
  dispatch: store.dispatch,
  createFirestoreInstance,
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default ({ element }) => (
  <Provider store={store}>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <ReactReduxFirebaseProvider {...rrfProps}>
      <PersistGate loading={null} persistor={persistor}>
        {element}
      </PersistGate>
    </ReactReduxFirebaseProvider>
  </Provider>
);
