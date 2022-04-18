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
  db.collection('students').doc(number).set({
    uid: firebase.auth().currentUser.uid,
    name: name,
    surname: surname,
    number: number
  }, { merge: true });
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
      <div className='App'>
        <div className='login' style={{backgroundColor: "#fffafa"}}>
          <div className="card buttonLogin">
              <h3 style={{color: "black"}}>Welcome!</h3>
              <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
            </div>
        </div>
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className='App'>
        <div className='register'>
          <h3 className='regtitle'>Sistemde kayıtlı değilsiniz. Lütfen bilgilerinizi giriniz.</h3>
          <h5 className='regspan'>Adınız:</h5>
          <input className='reginput' onChange={(e) => setName(e.target.value)}/>
          <h5 className='regspan'>Soyadınız:</h5>
          <input className='reginput' onChange={(e) => setSurname(e.target.value)}/>
          <h5 className='regspan'>Numaranız:</h5>
          <input className='reginput' onChange={(e) => setNumber(e.target.value)}/>
          <br/>
          <button className='regbutton' onClick={() => registerStudent(name, surname, number)}>Kaydol</button>
          <br/>
          <button className='regbutton' onClick={() => {firebase.auth().signOut();localStorage.clear();setIsSignedIn(false);setIsRegistered(false);}}>Çıkış Yap</button>
        </div>
      </div>
    );
  }

  exportUser(firebase.auth().currentUser);

  return (
    <div className='App'>
      <div className='login' style={{backgroundColor: "#fffafa"}}>
        <div className="card success">
          <h3>Exam Guard</h3>
          <span>Merhaba {firebase.auth().currentUser.displayName}! Giriş yaptınız! Bu sayfayı kapatarak Exam Guard programından devam edebilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}

export default App;
