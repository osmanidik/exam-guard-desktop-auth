import React, { useEffect, useState } from 'react';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import './App.css'

const firebaseConfig = {
  apiKey: "AIzaSyCl6GmEgISrQQu7t6n-WbqBOplfluy5rVE",
  authDomain: "exam-guard.firebaseapp.com",
  projectId: "exam-guard",
  storageBucket: "exam-guard.appspot.com",
  messagingSenderId: "507674917189",
  appId: "1:507674917189:web:5912b3c63760cfa330262c",
  measurementId: "G-NJJGK89N8M"
};

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

const registerStudent = (name, surname, number) => {
  db.collection('students').add({
    uid: firebase.auth().currentUser.uid,
    name: name,
    surname: surname,
    number: number
  });
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
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [number, setNumber] = useState("");

  useEffect(() => {
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      setIsSignedIn(!!user);
    });
    return () => unregisterAuthObserver();
  }, []);

  useEffect(() => {
    const userRegisteredObserver = db.collection('students').onSnapshot(snap => {
      snap.forEach((doc) => {
        if (doc.data()["uid"] === firebase.auth().currentUser?.uid) {
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
        <h1 className='regtitle'>Sistemde kayıtlı değilsiniz. Lütfen bilgilerinizi giriniz.</h1>
        <span className='respan'>Adınız:</span>
        <input className='reginput' onChange={(e) => setName(e.target.value)}/>
        <span className='respan'>Soyadınız:</span>
        <input className='reginput' onChange={(e) => setSurname(e.target.value)}/>
        <span className='respan'>Numaranız:</span>
        <input className='reginput' onChange={(e) => setNumber(e.target.value)}/>
        <br/>
        <button className='regbutton' onClick={() => registerStudent(name, surname, number)}>Kaydol</button>
        <br/>
        <button className='regexit' onClick={() => {firebase.auth().signOut();localStorage.clear();setIsSignedIn(false);setIsRegistered(false);}}>Çıkış Yap</button>
      </div>
    );
  }

  exportUser(firebase.auth().currentUser);

  return (
    <div>
      <h1>Exam Guard</h1>
      <p>Merhaba {firebase.auth().currentUser.email}! Giriş yaptınız! Bu sayfayı kapatarak Exam Guard programından devam edebilirsiniz.</p>
    </div>
  );
}

export default App;
