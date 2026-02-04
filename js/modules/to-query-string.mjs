const module = obj => {
    const searchParams = new URLSearchParams();

    Object.keys(obj)
        .forEach(key => {
            const value = obj[key];

            if (value) {
                if (Array.isArray(value)) {
                    value.forEach(d => searchParams.append(key, d));
                } else {
                    searchParams.append(key, value);
                }
            }
        });

    return searchParams.toString();
};

export default module;