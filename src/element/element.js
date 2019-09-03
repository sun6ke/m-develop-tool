import basePlugin from "../basePlugin"
import elementArt from "./element.art"
import $ from '../util/query'
import './element.less'
import Node from './node'

class elementPlugin extends basePlugin {
    constructor(...args) {
        super(...args)

        this.$element_content = $.toDom(elementArt())

        let MutationObserver = window.MutationObserver
        let self = this
        this.observer = new MutationObserver(function(mutations) {
            for (let i=0; i<mutations.length; i++) {

                //do nothing if mutation in mDevelopTool
                if (self._isInMDevelopTool(mutations[i].target)) {
                    continue
                }

                switch (mutations[i].type) {
                    case 'childList':
                        if (mutations[i].removedNodes.length) {
                            self._removeElement(mutations[i])
                        }
                        if (mutations[i].addedNodes.length) {
                            self._addElement(mutations[i])
                        }
                        break;
                    case 'attributes':
                        self._changeAttributes(mutations[i])
                }
            }
        })
    }

    _init() {
        let node = this._getNode(document.documentElement)
        // 第一级默认展开
        node.toggle = true
        this._renderNode(node, $.one('.mt-element', this.$element_content), 'add', true)

        this.observer.observe(document.documentElement, {
            childList: true,
            attributes: true,
            subtree: true,
            characterData: false
        })
    }
    _isInMDevelopTool(elem) {
        let target = elem
        while (target != undefined) {
            if (target.id == 'mt-main') {
                return true
            }
            target = target.parentNode
        }
        return false
    }

    _getNode(elem) {
        if (this._isEmptyElement(elem)) {
            return false
        }

        let node = elem.temp_nodes || {}
        node.nodeType = elem.nodeType
        node.tagName = elem.tagName
        node.nodeName = elem.nodeName
        node.textContent = ''
        if (elem.nodeType == elem.TEXT_NODE) {
            node.textContent = elem.textContent.trim()
        }

        node.id == elem.id
        node.classList = elem.classList
        node.attributes = []
        if (elem.hasAttributes && elem.hasAttributes()) {
            for (let i=0; i<elem.attributes.length; i++) {
                node.attributes.push({
                    name: elem.attributes[i].name,
                    value: elem.attributes[i].value
                })
            }
        }

        //children
        node.children = []
        for (let i=0; i<elem.childNodes.length; i++) {
            let child = this._getNode(elem.childNodes[i])
            if (!child) {
                continue
            }

            node.children.push(child)
        }

        elem.temp_nodes = node
        return node
    }
    _isEmptyElement(elem) {
        if (elem.nodeType == elem.TEXT_NODE) {
            // trim
            if (elem.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$|\n+/g, '') == '') {
                return true;
            }
        }
        return false;
    }
    _renderNode(node, $ele, type, isInit) {
        let view = new Node(node).$el
        node.$el = view

        if (type == 'replace') {
            $ele.parentNode.replaceChild(view, $ele)
        } else if (type == 'insertBefore') {
            $ele.parentNode.insertBefore(view, $ele)
        } else {
            $ele.appendChild(view)
        }

        if (node.toggle && isInit) {
            $.addClass(node.$el, 'mt-toggle')
            this._renderChildren(node, node.$el, true)
        }

        $.bind($.one('.mt-el-node', view), 'click', (event) => {
            event.stopPropagation()
            let $parent = $.parents(event.target, 'mt-el-parent')

            node.toggle = !node.toggle
            if (node.toggle) {
                $.addClass($parent, 'mt-toggle')
            } else {
                $.removeClass($parent, 'mt-toggle')
                return false
            }

            //禁止递归
            this._renderChildren(node, $parent, false)
        })

    }
    _renderChildren(node, $parent, init) {
        let childIndex = -1
        for (let i=0; i<$parent.children.length; i++) {
            let $child = $parent.children[i]
            if (!$.hasClass($child, 'mt-el-parent')) {
                continue
            }
            childIndex ++
            if ($child.children.length > 0) {
                continue
            }
            if (!node.children[childIndex]) {
                continue
            }

            this._renderNode(node.children[childIndex], $child, 'replace', init)
        }
    }

    _removeElement(mutation) {
        let $target = mutation.target
        let nodeInDom = $target.temp_nodes

        for (let i = 0; i < mutation.removedNodes.length; i++) {
            let removed = mutation.removedNodes[i]
            let node = removed.temp_nodes
            if (!node || !node.$el) {
                continue
            }

            node.$el.parentElement.removeChild(node.$el)
        }

        this._getNode($target);
    }
    //add node
    _addElement(mutation) {
        let $target = mutation.target
        let nodeInDom = $target.temp_nodes

        this._getNode($target);
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            let added = mutation.addedNodes[i]
            let node = added.temp_nodes
            if (!node) {
                continue
            }

            // create view
            if (mutation.nextSibling !== null) {
                //has nextSibling
                let sibling = mutation.nextSibling.temp_nodes
                if (!sibling || !sibling.$el) {
                    continue
                }
                this._renderNode(node, sibling.$el, 'insertBefore');
            } else {
                if (!nodeInDom || !nodeInDom.$el) {
                    continue
                }
                if (nodeInDom.$el.lastChild) {
                    this._renderNode(node, nodeInDom.$el.lastChild, 'insertBefore');
                } else {
                    this._renderNode(node, nodeInDom.$el);
                }
            }
        }
    }
    //change attributes
    _changeAttributes(mutation) {
        let $target = mutation.target
        let nodeInDom = $target.temp_nodes
        if (!nodeInDom) {
            return false
        }

        //refresh
        nodeInDom.attributes = []
        for (let i=0; i<$target.attributes.length; i++) {
            nodeInDom.attributes.push({
                name: $target.attributes[i].name,
                value: $target.attributes[i].value
            })
        }

        if (nodeInDom.$el) {
            this._renderNode(nodeInDom, nodeInDom.$el, 'replace', true);
        }
    }

    render(callback) {
        callback(this.$element_content)
    }

    /**
     *  ========== event =========
     */
    destroy() {
        this.observer.disconnect();
        this.complete = false
        this.$element_content.remove()
    }

    activeEvent(id, data) {
        super.activeEvent(id, data)

        if (this.complete) {
            return false
        }
        this.complete = true

        this._init()
    }
}

export default elementPlugin