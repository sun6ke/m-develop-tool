/**
 * 主入口
 */
import {deepCopy} from '../util/tool'
import $ from '../util/query.js';
import coreArt from './core.art'
import logTabPlugin from '../log/log'
import './core.less'
import storagePlugin from "../storage/storage";
import elementPlugin from "../element/element";
import networkPlugin from "../network/network";
export default class mDevelopTool {
    constructor(opt) {

        //init params
        this.options = {
            plugins: ['log', 'network', 'element', 'storage']
        }
        this.options = deepCopy(opt, this.options)
        this.pluginList = {}
        this.$main = null
        this.currentTab = 'log'

        //create plugins
        this._createPlugins()

        if (document !== undefined) {
            if (document.readyState == 'complete') {
                this._onLoad()
            } else {
                window.addEventListener('load', this._onLoad.bind(this))
            }
        } else {
            let timer
            let later = () => {
                if (document && document.readyState == 'complete') {
                    clearTimeout(timer)
                    this._onLoad()
                } else {
                    timer = setTimeout(later, 100)
                }
            }
            timer = setTimeout(later, 100)
        }
    }

    _initPlugins() {
        for (let id in this.pluginList) {
            this.pluginList[id].render(($dom) => {
                this.$main.querySelector('.mt-content').appendChild($dom)
            })
        }
    }

    _onLoad() {
        this.render()
        this._bindEvent()
        this._initPlugins()
    }

    _createPlugins() {

        const plugins = {
            log: {plugin: logTabPlugin, name: 'log', active: true},
            network: {plugin: networkPlugin, name: 'network', active: false},
            element: {plugin: elementPlugin, name: 'element', active: false},
            storage: {plugin: storagePlugin, name: 'storage', active: false}
        }

        let list = this.options.plugins
        for (let i=0; i<list.length; i++) {
            let tab = plugins[list[i]]
            if (!tab) {
                continue
            }
            this._addPlugin(new tab.plugin(list[i], tab.name, tab.active))
        }
    }

    _addPlugin(plugin) {
        //plugin已经存在
        if (this.pluginList[plugin.id]) {
            return false
        }

        this.pluginList[plugin.id] = plugin
    }

    _bindEvent() {

        let $tabs = $.all('.mt-tab')
        $.bind($tabs, 'click', (event) => {
            let id = event.target.id.replace('mt-tab-', '')
            if (this.currentTab == id) {
                return false
            }
            this.pluginList[id].trigger('active', [id, true])
            this.pluginList[this.currentTab].trigger('active', [this.currentTab, false])
            this.currentTab = id

            $.removeClass($tabs, 'active')
            $.addClass(event.target, 'active')
        })

        //clear
        $.bind($.one('#clear'), 'click', (event) => {
            if (!this.pluginList[this.currentTab].clear) {
                return false
            }
            this.pluginList[this.currentTab].clear.call(this.pluginList[this.currentTab])
        })

        $.bind($.one('.mt-overlay', this.$main), 'click', (e) => {
            if (e.target != $.one('.mt-overlay')) {
                return false;
            }
            this.hide();
        });
    }

    _removePlugin(pluginId) {
        if (this.pluginList[pluginId].remove) {
            this.pluginList[pluginId].remove()
        }
        delete this.pluginList[pluginId]
    }


    render() {

        this.$main = document.createElement("div")
        this.$main.innerHTML = coreArt({pluginList: this.pluginList})
        document.body.after(this.$main)
    }

    destroy() {
        for (let key in this.pluginList) {
            this._removePlugin(key)
        }
        this.$main.remove()
    }

    show() {
        $.one('.mt-panel', this.$main).style.display = 'block';
        $.one('.mt-overlay', this.$main).style.display = 'block';
        setTimeout(() => {
            $.addClass($.one('#mt-main', this.$main), 'mt-toggle')
        }, 10)
    }
    hide() {
        $.removeClass($.one('#mt-main', this.$main), 'mt-toggle')
        setTimeout(() => {
            $.one('.mt-panel', this.$main).style.display = 'none';
            $.one('.mt-overlay', this.$main).style.display = 'none';
        }, 300)
    }
}