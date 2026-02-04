/*
<button @click="$h.api('stream').stream($el).then($log)"
        @api-start="$log($event.detail)"
        @api-chunk="$log($event.detail)"
        @api-chunk-text="$log($event.detail)"
        @api-response="$log($event.detail)"
        @api-error="$log($event.detail)">Api request <span x-text="api.state.busy">Busy</span></button>
*/
import Api from '../api.mjs';
    
export default () => ({
    api_create(url, options = {}) {
        return Api(url, options, this.$dispatch);
    },
    api_json: response => response.json(),
    api_set(key) {
        let that = this;
        return response => that[key] = response;
    },
});