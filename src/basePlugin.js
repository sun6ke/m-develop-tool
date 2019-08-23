class basePlugin {

    constructor(id, name, active) {
        this.id = id
        this.name = name
        this.active = active

        // complete load storage
        this._complete = false
    }

    get id() {
        return this._id
    }

    set id(value) {
        if (!value) {
            throw 'id is empty';
        }
        this._id = value
    }

    get name() {
        return this._name
    }

    set name(value) {
        this._name = value
    }

    get active() {
        return this._active
    }

    set active(value) {
        this._active = value
    }

    get complete() {
        return this._complete;
    }

    set complete(value) {
        this._complete = value;
    }

    /**
     * trigger event
     * @param eventName
     * @param data
     */
    trigger(eventName, data) {
        let method = eventName + 'Event'
        if (typeof this[method] == 'function') {
            this[method].call(this, ...data)
        }
    }

    /**
     * change tabs
     * @param id
     * @param data
     * @returns {boolean}
     * @private
     */
    activeEvent(id, data) {
        let domStr = '$' + id + '_content'
        if (typeof this[domStr] == 'undefined') {
            return false
        }

        if (data) {
            this[domStr].classList.add('active')
        } else {
            this[domStr].classList.remove('active')
        }
    }
}

export default basePlugin