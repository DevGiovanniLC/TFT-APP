import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.vitaweight.app',
    appName: 'Vita Weight',
    webDir: 'www',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 2000,
            showSpinner: false,
            splashFullScreen: true,
            splashImmersive: true,
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
