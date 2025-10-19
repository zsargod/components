document.addEventListener('alpine:init', () => {
    const fetchAsText = (url, options) => url ? fetch(url, options).then(r => r.text()) : null;

    Alpine.directive('destroy', (el, {expression}, {evaluateLater, cleanup}) => {
        const clean = evaluateLater(expression);
        cleanup(() => clean());
    });

    Alpine.magic('log', () => value => {
        console.log(value);
        return value;
    });

    Alpine.magic('load', () => (el, url, options) => {
        [...el.querySelectorAll(':scope > *')].forEach(e => e.remove());
        return fetchAsText(url, options);
    });

    Alpine.magic('assign', () => (obj = {}, promise = {}) => {
        const reactiveData = Alpine.reactive(obj);

        Promise.resolve(promise).then(r => [].concat(r).forEach(d => Object.assign(reactiveData, d.default ? d.default() : d)));
        return reactiveData;
    });

    Alpine.magic('fetchAsText', () => fetchAsText);
    Alpine.magic('fetchAsJson', () => (url, options) => url ? fetch(url, options).then(r => r.json()) : null);
});