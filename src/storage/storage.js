import basePlugin from "../basePlugin";
import storageArt from './storage.art';
import storageItemArt from './item.art';
import $ from '../util/query'
import './storage.less'

class storagePlugin extends basePlugin {

    constructor(...args) {
        super(...args)

        this.type = 'local'
        this.storages = []
        this.$storage_content = $.toDom(storageArt({
            active: this.active,
            type: this.type
        }))

        this._bindEvent()
    }

    _init() {
        switch (this.type) {
            case 'local':
                this.storages = this._getStorages(window.localStorage);
                break;
            case 'session':
                this.storages = this._getStorages(window.sessionStorage);
                break;
        }

        this._print()

        //click td
        let $tds = $.all('.item-enabled-click', this.$storage_content)
        $.bind($tds, 'click', (event) => {
            let current_storage = this.storages[event.target.dataset.key]

            if ((current_storage.key == null && event.target.classList.contains('storage-value'))
                || $.all('input', event.target).length) {
                return false
            }
            this._addStorage(event, (current_storage.key == null?'add':'edit'), current_storage)
        })

        let $del_tds = $.all('.delete-storage', this.$storage_content)
        $.bind($del_tds, 'click', (event) => {
            let current_storage = this.storages[event.target.dataset.key]
            this._removeItem(current_storage.key)
            this.refresh()
        })
    }

    _print() {
        let table = $.toDom(storageItemArt({storages: this.storages}))
        let dom = $.one('tbody', table)
        $.one('.mt-all-storages', this.$storage_content).appendChild(dom)
    }

    _getStorages(orgStorage) {
        let storages = []
        for (let i=0; i<=orgStorage.length; i++) {
            let key = orgStorage.key(i)
            let storage = {
                key: key,
                value: orgStorage.getItem(key)
            }

            storages.push(storage)
        }

        return storages
    }

    _bindEvent() {
        //change sub tab
        let $tabs = $.all('.sub-tab', this.$storage_content)
        $.bind($tabs, 'click', (event) => {
            let id = event.target.id
            if (this.type == id) {
                return false
            }
            this.type = id
            $.removeClass($tabs, 'active')
            $.addClass(event.target, 'active')

            this.refresh()
        })
    }

    _addStorage(event, type, item) {

        let $td = event.target
        let $input = document.createElement('input')
        if (type == 'edit') {
            $.remove($td)
            $input.value = item.value
        }

        $td.appendChild($input)
        $.bind($input, 'click', event => event.stopPropagation())
        $.bind($input, 'change', e => {
            if (type == 'add') {
                this._addItem(e.target.value, '')
                this.refresh()
            } else {
                $input.remove()
                this._addItem(item.key, e.target.value)
                item.value = e.target.value
                $td.innerText = e.target.value
            }
        })
    }
    _addItem(key, val) {
        switch (this.type) {
            case 'local':
                window.localStorage.setItem(key, val)
                break;
            case 'session':
                window.sessionStorage.setItem(key, val);
                break;
        }
    }
    _removeItem(key) {
        switch (this.type) {
            case 'local':
                window.localStorage.removeItem(key)
                break;
            case 'session':
                window.sessionStorage.removeItem(key)
                break;
        }
    }

    /**
     *  ========= public methods =======
     */
    refresh() {
        $.one('.mt-all-storages tbody', this.$storage_content).remove()
        this._init()
    }
    
    render(callback) {
        callback(this.$storage_content)
    }

    clear() {
        switch (this.type) {
            case 'local':
                window.localStorage.clear()
                break;
            case 'session':
                window.sessionStorage.clear()
                break;
        }

        this.refresh()
    }
    destroy() {
        this.type = 'local'
        this.storages = []
        this.complete = false
        this.$storage_content.remove()
    }

    /**
     *  ========== event =========
     */
    activeEvent(id, data) {
        super.activeEvent(id, data)

        if (this.complete) {
            return false
        }
        this.complete = true
        this._init()
    }
}

export default storagePlugin