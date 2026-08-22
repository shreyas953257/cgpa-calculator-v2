# CGPA Calculator Android Build Guide

The project is configured as a **Capacitor Android application** with the Android application ID `com.shreyas.cgpacalculator` and the launcher name **CGPA Calculator**. Capacitor packages the compiled web application in the Android project; its `webDir` therefore targets `dist/public`, which contains the final `index.html` and bundled application assets.[1][2]

| Area | Prepared configuration |
|---|---|
| Android project | `android/` — open this directory in Android Studio |
| App name | **CGPA Calculator** |
| Application ID | `com.shreyas.cgpacalculator` |
| Launcher icon | Custom teal Gradebook mark in Android density and adaptive-icon resources |
| Offline app bundle | Space artwork, decorative images, fonts, JavaScript, CSS, and HTML are packaged locally |
| Local data | Semester history continues to use browser `localStorage` inside the Android WebView |

## Build a Debug APK

Install Node.js, pnpm, and Android Studio with an Android SDK. From the repository root, run the following commands.

```bash
pnpm install
pnpm run cap:sync
pnpm exec cap open android
```

The sync command first creates the Capacitor-specific production bundle and then copies it into `android/app/src/main/assets/public`. The Android project can then be opened in Android Studio. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)** to produce a debug APK. Capacitor’s standard flow is to build the web assets and run `cap sync` before opening or building a native platform.[1]

For a command-line debug build, configure `ANDROID_HOME` or `sdk.dir` for the installed Android SDK, then run:

```bash
pnpm run cap:apk:debug
```

The resulting APK is written to:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Update Workflow

After changing the calculator UI or web behavior, run `pnpm run cap:sync` before building in Android Studio. This preserves the existing Android project and refreshes only the packaged web app bundle. Avoid editing `android/app/src/main/assets/public` manually because the next sync regenerates it.

> The sandbox verified the Capacitor web bundle, native-project synchronization, bundled launcher resources, and the full calculator regression suite. A debug APK could not be assembled here because this environment does not include an Android SDK; Android Studio supplies that SDK on a development machine.

## References

[1] [Capacitor — Installing Capacitor](https://capacitorjs.com/docs/getting-started)

[2] [Capacitor — Configuration](https://capacitorjs.com/docs/config)
