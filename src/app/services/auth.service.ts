import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, updateProfile, user, onAuthStateChanged, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, sendPasswordResetEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Subscription, from } from 'rxjs';
import { UserType } from '../types/user.class';
import { Firestore, doc, setDoc, } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  currentUser: User | null = null; // Variable, um den aktuellen Benutzer zu speichern


  email: string = '';
  password: string = '';
  name: string = '';
  photoURL = './assets/img/profils/standardPic.svg';


  showLogin: boolean = true;
  showSignUp: boolean = false;
  showSignUpPicture: boolean = false;
  showSignUpPictureUpload = false;
  showResetPassword: boolean = false;
  registerError: string = ""
  user$ = user(this.auth);
  userSubscription: Subscription = new Subscription();
  userUid: string = ''
  provider = new GoogleAuthProvider();
  constructor() {
    this.userSubscription = this.user$.subscribe((user: User | null) => {
      // Aktualisieren Sie die currentUser Variable, wenn sich der Authentifizierungsstatus ändert
      this.currentUser = user;
    });
  }



  private createUserObject(): UserType {
    return {
      name: this.name,
      email: this.email,
      photoURL: this.photoURL
    };
  }

  async login(): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.currentUser = userCredential.user;
      this.userUid = this.currentUser.uid;
      this.router.navigate(['']);
    } catch (error) {
      throw error;
    }
  }


  async register(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: this.name });
      await updateProfile(user, { photoURL: this.photoURL });
      const userObject: UserType = this.createUserObject();
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, userObject);
    }
    catch (error) {
      throw error;
    }
  }


  loginWithGoogle() {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
          const token = credential.accessToken;
          this.currentUser = result.user;
          const profile = getAdditionalUserInfo(result)?.profile
          if (profile !== null && profile !== undefined) {
            if (typeof profile['name'] === 'string') {
              this.name = profile['name'];
            }
            if (typeof profile['picture'] === 'string') {
              this.photoURL = profile['picture'];
            }
            if (typeof profile['email'] === 'string') {
              this.email = profile['email'];
            }
          }
          const userObject: UserType = this.createUserObject()
          const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);
          setDoc(userDocRef, userObject);
          this.router.navigate(['']);
        }
      }).catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }

  toggleSignUp() {
    this.showLogin = !this.showLogin;
    this.showSignUp = !this.showSignUp;
  }
  toggleToPicture() {
    this.showSignUp = !this.showSignUp;
    this.showSignUpPicture = !this.showSignUpPicture;
  }
  toggleOwnPicture() {
    this.showSignUpPictureUpload = !this.showSignUpPictureUpload
    this.showSignUpPicture = !this.showSignUpPicture;
  }

  toggleResetPasswort() {
    this.showLogin = !this.showLogin;
    this.showResetPassword = !this.showResetPassword;
  }
  sendPasswortReset(email: string) {
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        // Password reset email sent!
        // ..
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }
}


