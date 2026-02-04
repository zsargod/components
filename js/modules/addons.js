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
    let setValue = function (obj,key,value,defaultValue) {
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
    Alpine.magic('html', () => (el, html, name) => el.querySelector(`[x-ignore${name?'="'+name+'"':''}]`).innerHTML = html);
    Alpine.magic('log', () => function () {
        console.log(...arguments);
        return [...arguments].pop();
    });
    Alpine.magic('set', () => setValue);
    Alpine.magic('fetch', () => function (url, options) {
        return fetch(url, options)
        .then(res => ({res}))
        .then(obj=>obj.res.clone().json().then(json => Object.assign(obj, {json})))
        .then(obj=>obj.res.clone().text().then(text=>Object.assign(obj,{text})));
    });

    Alpine.magic('next', () => ({
        set:(targetObj,key,value,defaultValue) => obj => (setValue(targetObj,key,value.split('.').reduce((o,i)=>o[i],obj),defaultValue), obj),
    }));
    Alpine.magic('template', () => (el, url, options) => template(url, options).then(html => el.innerHTML = cleanupHtml(el, html)));
    // Data
    Alpine.data('load', urls => {
        urls = [].concat(urls);

        return {
            load_done: false,

            init() {
                _import(urls).then(modules => {
                    let names = urls.map(url => url.split('/').pop().replace('.mjs', ''));

                    for (let i = 0; i < modules.length; i++){
                       Alpine.data(names[i], function () { return Object.assign(modules[i](), ...arguments); }); 
                    }
                
                    this.load_done = true;
                });
            }
        }
    });
});