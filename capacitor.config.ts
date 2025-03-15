import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'tft-app',
    webDir: 'www',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            launchAutoHide: true,
            backgroundColor: "#00bd7e;",
            androidSplashResourceName: "splash",
            androidScaleType: "CENTER_CROP",
            showSpinner: true,
            androidSpinnerStyle: "large",
            iosSpinnerStyle: "small",
            spinnerColor: "#999999",
            splashFullScreen: true,
            splashImmersive: true,
            layoutName: "launch_screen",
            useDialog: true,
        },
        CapacitorSQLite: {
            iosDatabaseLocation: 'Library/CapacitorDatabase',
            iosIsEncryption: true,
            iosKeychainPrefix: 'angular-sqlite-app-starter',
            iosBiometric: {
                biometricAuth: false,
                biometricTitle: "Biometric login for capacitor sqlite"
            },
            androidIsEncryption: true,
            androidBiometric: {
                biometricAuth: false,
                biometricTitle: "Biometric login for capacitor sqlite",
                biometricSubTitle: "Log in using your biometric"
            },
            electronIsEncryption: true,
            electronWindowsLocation: "C:\\ProgramData\\CapacitorDatabases",
            electronMacLocation: "/Volumes/Development_Lacie/Development/Databases",
            electronLinuxLocation: "Databases"
        }
    }
}

export default config;
