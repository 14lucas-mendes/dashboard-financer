
export default class ThemeController {
    constructor() {
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.themeUser = localStorage.getItem('theme');
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
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.savedTheme = theme;
    }

    bindSystemThemeListener() {
        const handler = () => {
            const hasUserTheme = localStorage.getItem('theme') !== null;
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
