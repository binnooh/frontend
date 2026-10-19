# Android APK

This frontend is packaged for Android with Capacitor. The APK uses the production React build, so configure the backend URL before syncing:

```powershell
$env:REACT_APP_API_URL = "https://your-public-api.example.com"
npm.cmd run android:sync
npx.cmd cap open android
```

Replace the example URL with the deployed HTTPS API base URL. The backend must be reachable from users' phones and allow requests from the Capacitor app origin. Do not use `127.0.0.1` for a hosted APK; it refers to the device itself.

Install Android Studio with its Android SDK and a supported JDK to build the APK. In Android Studio, use **Build > Generate Signed Bundle / APK > APK** for a distributable release. Keep the signing key private and backed up; never commit it. Upload the signed APK as a GitHub Release asset or to your download website.

The current environment does not have the Android SDK or Java configured, and the backend has not yet been deployed, so a working release APK cannot be built yet.
