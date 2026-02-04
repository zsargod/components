import toQueryString from './to-query-string.mjs';
import pathToRegexp from './lib/path-to-regexp.mjs';
import routeSort from './lib/route-sort.mjs';

function parseJSONSafe(value) {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function parseObjectSafe(obj) {
    Object.keys(obj).forEach(key => {
        obj[key] = parseJSONSafe(obj[key]);
    });
    return obj;
}

function parseValuesString(obj) {
    Object.keys(obj).forEach(key => {
        obj[key] = String(obj[key]);
    });
    return obj;
}

function getQueryParams(value) {
    const params = {};
    const searchParams = new URLSearchParams(value || window.location.search);
    for (const [key, value] of searchParams.entries()) {
        params[key] = parseJSONSafe(value);
    }
    return params;
}

const module = (paths = { home: '/' }, strategy = 'hash', base = '') => {
    let routes = [];
    let routeObject = (key, p) => ({ name: key, value: p, match: pathToRegexp.match(base + p) });

    Object.keys(paths).forEach(key => {
        let path = Array.isArray(paths[key]) ? paths[key].map(p => routeObject(key, p)) : [routeObject(key, paths[key])];
        routes = routes.concat(path);
    });

    let sortedRoutes = routeSort([...new Set(routes.map(r => r.value))])
        .map(sr => routes.filter(r => r.value === sr)
            .reduce((prev, curr) => {
                if (!prev) {
                    prev = curr;
                    prev.name = [].concat(prev.name);
                } else {
                    prev.name = [].concat(prev.name, curr.name);
                }

                return prev;
            }, null));

    return routePath => {
        let route, query, pathMatch;
        const is = name => (pathMatch || { name: [] }).name.includes(String(name)) || (name instanceof RegExp && (pathMatch || { name: [] }).name.some(n => n.match(name)));
        const parse = (url, { query, params } = {}) => {
            let newUrl;
            let implicitQuery = url.split('?')[1];
            let queryString = (query ? '?' + toQueryString(query) : '') + (implicitQuery ? (query ? '&' : '?') + implicitQuery : '');
            url = pathToRegexp.compile(url.split('?')[0])(parseValuesString(params || {}));

            if (strategy === 'hash') {
                newUrl = (url.startsWith('#') ? url : '#' + url) + queryString;
            } else {
                newUrl = base + url + queryString;
            }

            return newUrl;
        };
        const go = (url, { query, params, method = 'pushState' } = {}) => {
            if (strategy === 'hash') {
                location.hash = parse(url, { query, params });
                return;
            }

            history[method]({}, '', parse(url, { query, params }));
            window.dispatchEvent(new PopStateEvent('popstate'));
        };

        if (strategy === 'hash' && window.location.hash === '') {
            window.location.hash = '/';
        } else if (window.location.pathname === '') {
            window.location.pathname = '/';
        }

        routePath = routePath || (strategy === 'hash' ? window.location.hash : window.location.pathname);
        if (routePath.startsWith('#/')) {
            route = routePath.replace('#/', '/').split('?');
        } else {
            route = [routePath, window.location.search];
        }
        query = getQueryParams(route[1]);

        pathMatch = sortedRoutes.find(r => r.match(route[0])) || { name: ['404'] };

        let pathDetails = pathMatch.match ? pathMatch.match(route[0]) : { params: {} };
        pathDetails.params = parseObjectSafe(pathDetails.params);

        return Object.assign(pathDetails, pathMatch, { query, is, go, parse, paths });
    };
};

export default module;