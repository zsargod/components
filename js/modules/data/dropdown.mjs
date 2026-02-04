import lucide from '../lib/lucide.mjs';

export default () => ({
    // reactive data
    dropdown_open: false,
    // methods
    dropdown_toggle() {
        this.dropdown_open = !this.dropdown_open
    },
    // bindings
    dropdown_pre: {
        ['x-text']() { return this.$stringify(this.formData) },
        ["@click"]() { return this.$dispatch('wtf') },
    },

    icon: lucide,
});