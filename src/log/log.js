/**
 * 打印log
 */
import logArt from './log.art'
import itemArt from './item.art'

import basePlugin from '../basePlugin'
import $ from '../util/query'
import './log.less'
class logTabPlugin extends basePlugin {

    constructor(...args) {
        super(...args)

        this.$log_content = null
        this.console = {}

        this._init()
        this._bindEvent()
    }

    _init() {
        //init dom
        this.$log_content = $.toDom(logArt({active: this.active}))
        if (!this.active) {
            $.addClass(this.$log_content, "hide")
        }

        //init console method
        const methodList = ['log', 'info', 'warn', 'error'];

        methodList.map(method => {
            this.console[method] = window.console[method]
        })

        methodList.map(method => {
            window.console[method] = (...args) => {
                this._printLog({
                    logs: args,
                    type: method
                })
            }
        })
    }

    _bindEvent() {
        $.bind($.one('.log-cmd', this.$log_content), 'submit', (e) => {
            e.preventDefault();

            let cmd = e.target[0].value
            if (cmd == '') {
                return false
            }
            this._evalCommand(cmd)
            e.target[0].value = ''
        })
    }

    _printLog(param) {
        $.one('.mt-log', this.$log_content).appendChild($.toDom(itemArt(param)))
    }
    _evalCommand(cmd) {
        this._printLog({
            logs: cmd,
            type: 'input',
            code: true
        })

        let result
        try {
            result = eval.call(window, cmd)
        } catch (e) {
            window.console.error(e.message)
            result = ''
        }

        if (result == '') {
            return false
        }
        this._printLog({
            logs: result,
            type: 'output',
            code: true
        })
    }

    /**
     *  ========= public methods =======
     */

    clear() {
        // let elements = $.all('.mt-log-item')
        // let parentNode = $.one('.mt-log')
        // for(let i = elements.length - 1; i >= 0; i--) {
        //     parentNode.removeChild(elements[i]);
        // }

        $.remove($.one('.mt-log'))
    }

    render(callback) {
        callback(this.$log_content)
    }
}

export default logTabPlugin
