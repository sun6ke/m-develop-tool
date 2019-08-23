import basePlugin from "../basePlugin";
import networkArt from './network.art'
import lineArt from './line.art'
import $ from '../util/query'
import {generateId} from '../util/tool'
import './network.less'

class networkPlugin extends basePlugin {

    constructor(...args) {
        super(...args)

        this.$network_content = $.toDom(networkArt())

        this.ajax_list = {}
        this._defineXMLHttp()
    }

    _init() {
        for (let key in this.ajax_list) {
            this._renderItem(this.ajax_list[key])
        }
    }

    _renderItem(item) {
        if (!item || !this.complete) {
            return false
        }

        if ([0,1,2,3].indexOf(item.readyState) !== -1) {
            item.status = 'pending...';
        } if (item.readyState == 4) {
            item.error = (item.status !== 200)
        } else {
            item.status = 'unknown';
        }

        let $line = $.toDom(lineArt(item))
        if (item.show) {
            item.view.parentElement.replaceChild($line, item.view)
        } else {

            $.one('.mt-network-content', this.$network_content).appendChild($line)
            item.show = true
        }

        item.view = $line
        $.bind($.one('.mt-row', $line), 'click', (event) => {
            let $detail = $.one('.mt-network-detail', $line)
            if ($.hasClass($detail, 'mt-hide')) {
                $.removeClass($detail, 'mt-hide')
            } else {
                $.addClass($detail, 'mt-hide')
            }
        })
    }

    _defineXMLHttp() {
        this.open = window.XMLHttpRequest.prototype.open
        this.send = window.XMLHttpRequest.prototype.send

        let self = this
        window.XMLHttpRequest.prototype.open = function () {
            let XMLHttp = this
            let args = [].slice.call(arguments)

            XMLHttp._id  = generateId()
            XMLHttp._method  = arguments[0]
            XMLHttp._url  = arguments[1]

            // self.ajax_list[XMLHttp._id] = {
            //     method: arguments[0],
            //     url: arguments[1]
            // }

            //onreadystatechange
            let _onreadystatechange = this.onreadystatechange || function() {};
            let onreadystatechange = function() {

                let request = self.ajax_list[XMLHttp._id] || {}
                request['readyState'] = XMLHttp.readyState
                request['status'] = XMLHttp.status

                switch (XMLHttp.readyState) {
                    case 0:
                        if (!request.start_time) {
                            request.start_time = new Date().getTime()
                        }
                        break;
                    case 1:
                        if (!request.start_time) {
                            request.start_time = new Date().getTime()
                        }
                        break;
                    case 2:
                        let header = XMLHttp.getAllResponseHeaders()
                        request.header = header.split('\n').filter(h => h.trim() != '').map(h => {
                            let arr = h.split(': ')
                            return {key: arr[0], value: arr[1]}
                        })
                        break;
                    case 3:
                        break;
                    case 4:
                        request.end_time = new Date().getTime()
                        request.response = XMLHttp.response
                        request.duration = self._format(request.end_time - request.start_time)
                        break;
                }

                //add request in ajax_list
                self.ajax_list[XMLHttp._id] = request

                //render
                self._renderItem(request)

                return _onreadystatechange.apply(this, [].slice.call(arguments))
            }
            this.onreadystatechange = onreadystatechange

            self.open.apply(this, args)
        }



        window.XMLHttpRequest.prototype.send = function () {
            let XMLHttp = this
            let args = [].slice.call(arguments)

            let request = self.ajax_list[XMLHttp._id] || {}

            let query = XMLHttp._url.split('?')
            request['url'] = query.shift()
            request['method'] = XMLHttp._method.toUpperCase()
            request['name'] = XMLHttp._url.substr(XMLHttp._url.lastIndexOf('/')+1)

            if (query.length > 0) {
                request.params = {};
                query = query.join('?')
                query = query.split('&')
                for (let q of query) {
                    q = q.split('=');
                    request.params[q[0]] = decodeURIComponent(q[1]);
                }
            }

            if (request.method == "POST") {
                if (typeof args[0] == 'string') {
                    try {
                        //json
                        request.postParams = JSON.parse(args[0])
                        request.requestType = 'json'
                    } catch (e) {
                        request.postParams = {};
                        let arr = args[0].split('&');
                        for (let q of arr) {
                            q = q.split('=');
                            request.postParams[q[0]] = q[1];
                        }
                    }
                } else {
                    request.postParams = args[0]
                }
            }

            self.send.apply(this, args)
        }
    }

    _format(time) {
        let temp_time = Math.floor(time/1000)
        if (temp_time < 1) {
            return time+'ms'
        }

        let min = Math.floor(temp_time/60)
        if (min < 1) {
            return temp_time + 's'
        }

        return min + 'min'
    }


    render(callback) {
        callback(this.$network_content)
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

export default networkPlugin