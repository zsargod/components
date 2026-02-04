import Router from '../router.mjs';

export default (routes, strategy, base) => ({
    ROUTE: { is: () => false },
    routes: Router(routes, strategy, base),

    router_update() {
        this.ROUTE = this.routes();
    },

    init() {
        this.router_event = this.router_update.bind(this);
        this.router_update();
        window.addEventListener('popstate', this.router_event);
    },

    destroy() {
        window.removeEventListener('popstate', this.router_event);
    },
});