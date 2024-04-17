import { Injectable, inject } from '@angular/core';
import { Auth, User, createUserWithEmailAndPassword, updateProfile, user, browserSessionPersistence, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo, sendPasswordResetEmail, updateEmail, signOut, sendEmailVerification, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, from, map } from 'rxjs';
import { UserType } from '../types/user.class';
import { Firestore, collection, doc, getDoc, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { OverlayService } from './overlay.service';
import { setPersistence } from '@firebase/auth';
import { LoginService } from './login.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private overlayService: OverlayService = inject(OverlayService);
  private loginService: LoginService = inject(LoginService);
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);

  private _currentUserSubject: BehaviorSubject<UserType | null> = new BehaviorSubject<UserType | null>(null);
  currentUser$ = this._currentUserSubject.asObservable();
  currentUser: any;
  user:any
  uid: string = '';
  email: string = '';
  password: string = '';
  name: string = '';
  photoURL = './assets/img/profils/standardPic.svg';
  chatRefs: any;

  registerError: string = ''

  provider = new GoogleAuthProvider();

  constructor() {
    this.setPersistence();
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.user = user
        this.uid = user.uid;
        const userDocRef = doc(this.firestore, 'users', this.uid);
        onSnapshot(userDocRef, (doc) => {
          if (!doc.exists()) {
            this.router.navigate(['/']);
          } else {
            this.currentUser = {...doc.data() } as UserType;
            console.log(this.currentUser)
            this._currentUserSubject.next(this.currentUser);
          }
        }, (error) => {
          console.error('Error fetching user document:', error);
          // Handle error
        });
      } else {
        this._currentUserSubject.next(null);
        this.router.navigate(['/']);
      }
    });
  }

  private setPersistence(): void {
    // Firebase initialisieren
   
    
    // Authentifizierung initialisieren
  

    // Setzen der Persistenzoption auf "local"
    setPersistence(this.auth, browserSessionPersistence)
      .then(() => {
        console.log('Firebase persistence set to local');
      })
      .catch((error) => {
        console.error('Error setting Firebase persistence:', error);
      });
  }

  private createUserObject(): UserType {
    return {
      uid: this.uid,
      name: this.name,
      email: this.email,
      photoURL: this.photoURL,
      chatRefs: this.uid
    };
  }

  async login(): Promise<void> {
    try {
      await setPersistence(this.auth, browserSessionPersistence);
      await signInWithEmailAndPassword(this.auth, this.email, this.password);
      this.overlayService.showOverlay('Anmelden')
      setTimeout(() => {
        this.overlayService.hideOverlay();
      }, 1500);

      this.router.navigate(['/start']);

    } catch (error) {
      console.log(error)
      throw error;
    }
  }

  async register(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: this.name
      });
      await updateProfile(user, {
        photoURL: this.photoURL
      });
      this.chatRefs = [user.uid];
      const userObject: UserType = this.createUserObject();
      const userDocRef = doc(this.firestore, 'users', user.uid);
      await setDoc(userDocRef, userObject);
      this.loginService.toggleLogin
      //erst ab hier zulassen dass  die Registrierung fertig ist und der user weiterleitet wird
      this.overlayService.showOverlay('Konto erfolgreich erstellt!')
      setTimeout(() => {
        this.overlayService.hideOverlay();
        this.router.navigate(['/start']);
      }, 1500);
    } catch (error) {
      throw error;
    }
  }

  async updateInfo(name: string, email: string) {

    const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);
    await updateEmail(this.user, email);
    await updateDoc(userDocRef, { email: email, name: name });

  };


  loginWithGoogle() {
    signInWithPopup(this.auth, new GoogleAuthProvider())
      .then((result) => {
        this.overlayService.showOverlay('Anmelden');
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential) {
         
          console.log(result.user)
          const userData: UserType = {
            uid: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || '',
            photoURL: result.user.photoURL || '',
            chatRefs:[result.user.uid]
          };
          const userDocRef = doc(this.firestore, 'users', result.user.uid);
          //check if user  already exists in the database and create it if not
          getDoc(userDocRef).then((docSnapshot) => {
              if (!docSnapshot.exists()) {
                setDoc(userDocRef, userData);
              }}
          );
          this._currentUserSubject.next(userData); // Aktualisieren Sie currentUser im BehaviorSubject
          this.router.navigate(['/start']);
          setTimeout(() => {
            this.overlayService.hideOverlay();
          }, 1500);
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

  sendPasswortReset(email: string) {
    sendPasswordResetEmail(this.auth, email)
      .then(() => {
        this.overlayService.showOverlay('<img src="./../assets/img/icons/send_white.svg"> E-Mail gesendet');
        setTimeout(() => {
          this.overlayService.hideOverlay();
          this.loginService.toggleResetPasswort()
        }, 1500);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
      });
  }


  async logout(): Promise<void> {
    try {
      this.overlayService.showOverlay('Abmelden')
      await signOut(this.auth);
      setTimeout(() => {
        this.overlayService.hideOverlay();
      }, 1500);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

}
