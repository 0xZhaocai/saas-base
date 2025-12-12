// app/lib/i18n/types.ts
// i18n 类型定义

export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'ja' | 'fr' | 'ko' | 'es';

export interface I18nContent {
    nav: {
        home: string;
        dashboard: string;
        login: string;
        logout: string;
        register: string;
        blog: string;
        myPosts: string;
    };
    home: {
        heroTitle: string;
        heroSubtitle: string;
        ctaStart: string;
        ctaLearn: string;
        featureTitle: string;
        features: {
            auth: { title: string; desc: string };
            database: { title: string; desc: string };
            edge: { title: string; desc: string };
            typescript: { title: string; desc: string };
            ui: { title: string; desc: string };
            i18n: { title: string; desc: string };
        };
        developerExperience: {
            title: string;
            cloudflareDesc: string;
            pages: string;
            d1: string;
            r2: string;
            moduleDesc: string;
        };
    };
    dashboard: {
        title: string;
        welcome: string;
        statRevenue: string;
        statUsers: string;
        statGrowth: string;
        recentActivity: string;
        quickStart: string;
        steps: {
            createAccount: { title: string; desc: string };
            configProject: { title: string; desc: string };
            inviteTeam: { title: string; desc: string };
        };
    };
    auth: {
        login: string;
        register: string;
        email: string;
        password: string;
        confirmPassword: string;
        name: string;
        loginBtn: string;
        registerBtn: string;
        noAccount: string;
        hasAccount: string;
        welcomeBack: string;
        createAccount: string;
        fillInfo: string;
        enterCredentials: string;
        forgotPassword: string;
        googleLogin: string;
        loginWithGoogle: string;
        orWithEmail: string;
        namePlaceholder: string;
        emailPlaceholder: string;
        passwordPlaceholder: string;
        confirmPasswordPlaceholder: string;
    };
    verifyEmail: {
        title: string;
        checking: string;
        success: string;
        successMessage: string;
        failed: string;
        resend: string;
        checkInbox: string;
        verificationSent: string;
        redirecting: string;
        seconds: string;
    };
    forgotPassword: {
        title: string;
        subtitle: string;
        sendLink: string;
        backToLogin: string;
        emailSent: string;
        resetTitle: string;
        resetSubtitle: string;
        newPassword: string;
        resetBtn: string;
        resetSuccess: string;
    };
    common: {
        theme: string;
        themeLight: string;
        themeDark: string;
        themeSystem: string;
        language: string;
        loading: string;
        settings: string;
        profile: string;
        signOut: string;
        search: string;
        notifications: string;
        help: string;
    };
    pageTitles: {
        home: string;
        login: string;
        register: string;
        dashboard: string;
        profile: string;
        forgotPassword: string;
        resetPassword: string;
        verifyEmail: string;
    };
    errors: {
        userExists: string;
        emailNotVerified: string;
        invalidCredentials: string;
        passwordMismatch: string;
        passwordTooShort: string;
        emailInvalid: string;
        networkError: string;
        unknownError: string;
        resetLinkSent: string;
        resetLinkFailed: string;
        userNotFound: string;
        passwordMatch: string;
    };
    passwordRequirements: {
        title: string;
        minLength: string;
        hasUppercase: string;
        hasLowercase: string;
        hasNumber: string;
        hasSpecial: string;
    };
    profile: {
        title: string;
        basicInfo: string;
        security: string;
        linkedAccounts: string;
        dangerZone: string;
        avatar: string;
        uploadAvatar: string;
        nickname: string;
        email: string;
        emailVerified: string;
        emailNotVerified: string;
        resendVerification: string;
        verificationSent: string;
        saveNickname: string;
        saving: string;
        saved: string;
        changePassword: string;
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string;
        updatePassword: string;
        passwordUpdated: string;
        google: string;
        github: string;
        linked: string;
        notLinked: string;
        deleteAccount: string;
        deleteAccountDesc: string;
        deleteAccountConfirm: string;
        deleteAccountWarning: string;
        confirmDelete: string;
        cancel: string;
        sessions: string;
        sessionsDesc: string;
        currentDevice: string;
        updateFailed: string;
        passwordMismatch: string;
        currentPasswordWrong: string;
        // Linked accounts messages
        securityHigh: string;
        securityHint: string;
        linkFailed: string;
        unlinkConfirm: string;
        setPasswordFirst: string;
        unlinkFailed: string;
        setPasswordFailed: string;
    };
    blog: {
        title: string;
        newPost: string;
        editPost: string;
        deletePost: string;
        deleteConfirm: string;
        titleLabel: string;
        contentLabel: string;
        titlePlaceholder: string;
        contentPlaceholder: string;
        save: string;
        cancel: string;
        noContent: string;
        by: string;
        myPosts: string;
        manageYourPosts: string;
        updated: string;
        view: string;
        backToList: string;
    };
}

export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    'zh-CN': '简体中文',
    'zh-TW': '繁體中文',
    ja: '日本語',
    fr: 'Français',
    ko: '한국어',
    es: 'Español',
};

// Get browser preferred language
export function getBrowserLanguage(): Language {
    if (typeof navigator === 'undefined') return 'en';

    const browserLang = navigator.language;
    if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant')) return 'zh-TW';
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('ko')) return 'ko';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
}
