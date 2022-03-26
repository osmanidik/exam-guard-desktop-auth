import React, { useEffect, useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import './App.css'

const firebaseConfig = {
  apiKey: "AIzaSyDk2zZgj6v3lYXP7t2nMRt_ed0Yx_GHUDs",
  authDomain: "test-74c4e.firebaseapp.com",
  projectId: "test-74c4e",
  storageBucket: "test-74c4e.appspot.com",
  messagingSenderId: "1042584282399",
  appId: "1:1042584282399:web:db92447f7c8b3e215efc2a"
}

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const uiConfig = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false,
  },
};

const checkStudentSecret = (secret) => {
  db.collection('student').get().then((query) => {
    query.forEach((doc) => {
      if (doc.data()["secret"] === secret) {
        db.collection('student').doc(doc.id).set({
          sid: firebase.auth().currentUser.uid,
          snumber: doc.data()["snumber"],
          secret: doc.data()["secret"]
        });
      }
    });
  })
};

const exportUser = (user) => {
  if (!localStorage.getItem("jwt") || !localStorage.getItem("refresh"))
    user.getIdToken().then(token => {
      localStorage.setItem('jwt', token);
    });
    localStorage.setItem("refresh", user.refreshToken);
    window.history.replaceState({additionalInformation: 'Success!'}, document.title, window.location.href.split("#success").pop() + '#success')
}

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [secret, setSecret] = useState("");

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver();
  }, []);

  useEffect(() => {
    const userRegisteredObserver = db.collection('student').onSnapshot(snap => {
      snap.forEach((doc) => {
        if (doc.data()["sid"] === firebase.auth().currentUser?.uid) {
          setIsRegistered(true);
        }
      });
    });
    return () => userRegisteredObserver();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className='register'>
        <h1>Lütfen size gönderilmiş olan şifreyi giriniz:</h1>
        <input onChange={(e) => setSecret(e.target.value)}/>
        <button onClick={() => checkStudentSecret(secret)}>Onayla</button>
        <br/>
        <a onClick={() => {firebase.auth().signOut();localStorage.clear();setIsSignedIn(false);setIsRegistered(false);}}>Çıkış Yap</a>
      </div>
    );
  }

  exportUser(firebase.auth().currentUser);

  return (
    <div>
      <h1>Exam Guard</h1>
      <p>Merhaba {firebase.auth().currentUser.email}! Giriş yaptınız!</p>
      <a onClick={() => {firebase.auth().signOut();localStorage.clear();setIsSignedIn(false);setIsRegistered(false);}}>Çıkış Yap</a>
    </div>
  );
}

export default App;
