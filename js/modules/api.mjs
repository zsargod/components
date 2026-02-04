const fetchStream = async function fetchStream(req, emit = () => { }) {
    emit('api-start', req);
    const response = await req;

    if (!response.body) {
        let error = 'ReadableStream not supported in this environment.';

        emit('api-error', error);
        throw new Error(error);
    }

    const reader = response.clone().body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Convert Uint8Array chunks into text
        let chunk = decoder.decode(value, { stream: true });
        emit('api-chunk', value);
        emit('api-chunk-text', chunk);
    }

    // Final decode (flushes buffer)
    emit(response.ok ? 'api-response' : 'api-error', response);

    return req;
};

const module = (url, options = {}, emit) => ({
    fetch: () => {
        let request = fetch(url, options);

        return fetchStream(request.then(r => r.ok ? r : Promise.reject(r)), emit);
    },
    then(cb) { return this.fetch().then(cb); },
});

export default module;