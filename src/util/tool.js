export function deepCopy(p, c, filters) {
    var c = c || {};
    for (var i in p) {
        if (Array.isArray(filters) && filters.indexOf(i) != -1) {
            continue
        }
        if (typeof p[i] === 'object' && p[i] != null) {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}

export function generateId() {
    let id = 'xxxx-xxxx-xxxx-xxxx'.replace(/(x)/g, (x) => {
        return (Math.random()*15|0).toString(16).toUpperCase()
    })
    return id
}