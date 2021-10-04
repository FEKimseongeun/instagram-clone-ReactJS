import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyDyLQd7Mp4fKoR2uTmGujhjygMeyYr5tzQ",
  authDomain: "instagram-clone-bc617.firebaseapp.com",
  databaseURL: "https://instagram-clone-bc617-default-rtdb.firebaseio.com",
  projectId: "instagram-clone-bc617",
  storageBucket: "instagram-clone-bc617.appspot.com",
  messagingSenderId: "266568423080",
  appId: "1:266568423080:web:6e2e2454c48c171761149d"
});

  const db= firebaseApp.firestore();
  const auth=firebase.auth();
  const storage=firebase.storage();


  export {db, auth, storage};