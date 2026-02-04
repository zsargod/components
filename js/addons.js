document.addEventListener('alpine:init', () => {
    let _import = url => {
        let importModule = u => import(u).then(mod => mod.default || mod);
        let formatUrl = u => u.includes('://') ? u : '../' + u;

        if (Array.isArray(url)) {
            let urls = url.map(u => formatUrl(u));
            return Promise.all(urls.map(importModule));
        }
        return importModule(formatUrl(url));
    };
    let cleanupHtml = (el, html) => ([...el.querySelectorAll(':scope > *')].forEach(e => e.remove()), html);
    let template = (url, options) => _import('js/modules/template.mjs').then(m => m(url, options));
    let setValue = function (obj, key, value, defaultValue) {
        obj[key] = value !== undefined ? value : defaultValue;
        return obj[key];
    };
    // Directives
    Alpine.directive('destroy', (el, { expression }, { evaluateLater, cleanup }) => {
        const clean = evaluateLater(expression);
        cleanup(() => clean());
    });
    // Magics
    Alpine.magic('import', () => _import);
    Alpine.magic('cleanup', () => cleanupHtml);
    Alpine.magic('stringify', () => JSON.stringify);
    Alpine.magic('assign', () => Object.assign);
    Alpine.magic('pathname', () => () => location.pathname.replace('/',''));
    Alpine.magic('html', () => (el, html, name) => el.querySelector(`[x-ignore${name ? '="' + name + '"' : ''}]`).innerHTML = html);
    Alpine.magic('log', () => function () {
        console.log(...arguments);
        return [...arguments].pop();
    });
    Alpine.magic('set', () => setValue);
    Alpine.magic('fetch', () => function (url, options) {
        return fetch(url, options)
            .then(res => ({ res }))
            .then(obj => obj.res.clone().json().then(json => Object.assign(obj, { json })))
            .then(obj => obj.res.clone().text().then(text => Object.assign(obj, { text })));
    });

    Alpine.magic('next', () => ({
        set: (targetObj, key, value, defaultValue) => obj => (setValue(targetObj, key, value.split('.').reduce((o, i) => o[i], obj), defaultValue), obj),
    }));
    Alpine.magic('template', () => (el, url, options) => template(url, options).then(html => el.innerHTML = cleanupHtml(el, html)));
    // Data
    Alpine.data('load', modulesObject => ({
        load_done: false,

        init() {
            _import(Object.values(modulesObject)).then(modules => {
                modules.forEach((mod, i) => {
                    this[Object.keys(modulesObject)[i]] = mod;
                });  

                this.load_done = true;
            });
        }
    }));
});