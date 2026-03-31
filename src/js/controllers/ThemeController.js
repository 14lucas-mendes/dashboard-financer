
export default class ThemeController {
    constructor() {
        this.savedTheme = localStorage.getItem('theme') || 'light';
    }

    getTheme() {
        return this.savedTheme;
    }

    setTheme(theme) {
        this.savedTheme = theme;
        localStorage.setItem('theme', theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.savedTheme);
    }
 
}

