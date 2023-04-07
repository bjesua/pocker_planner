// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCZ4o6dbfO2DXWvi3XVpmxVJiqMUrBodvY',
  authDomain: 'host-c3714.firebaseapp.com',
  databaseURL: 'https://host-c3714.firebaseio.com',
  projectId: 'host-c3714',
  storageBucket: 'host-c3714.appspot.com',
  messagingSenderId: '925567757986',
  appId: '1:925567757986:web:94ef40df3e2d0cecfcf1fb',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
