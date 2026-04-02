
export default class ThemeController {
    constructor() {
        this.storageKey = 'dashboard-financer:theme';
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.themeUser = localStorage.getItem(this.storageKey);
        this.savedTheme = this.getEffectiveTheme();

        this.applyTheme(this.savedTheme);
        this.bindSystemThemeListener();
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? 'dark' : 'light';
    }

    getEffectiveTheme() {
        return this.themeUser || this.getSystemTheme();
    }

    getTheme() {
        return this.savedTheme;
    }

    setTheme(theme) {
        this.themeUser = theme;
        localStorage.setItem(this.storageKey, theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.savedTheme = theme;
    }

    bindSystemThemeListener() {
        const handler = () => {
            const hasUserTheme = localStorage.getItem(this.storageKey) !== null;
            if(hasUserTheme) return;

            this.themeUser = null;
            this.applyTheme(this.getSystemTheme());
        };

        if(typeof this.mediaQuery.addEventListener === 'function') {
            this.mediaQuery.addEventListener('change', handler);
        }
    }

    toggleTheme() {
        const currentTheme = this.getEffectiveTheme();
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
        this.applyTheme(nextTheme);
    }
}
