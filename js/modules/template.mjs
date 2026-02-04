const cache = {};
const module = (url, options) => {
    if (!url) return Promise.resolve('');

    if(!cache[url]) {
        cache[url] = fetch(url, options).then(r => r.text());
    }
    
    return Promise.resolve(cache[url]);
};

export default module;