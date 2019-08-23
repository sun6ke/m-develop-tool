import $ from '../util/query';
import nodeArt from './node.art'

class Node {
    constructor(node) {
        this.node = node

        this._$el = this.render()
    }

    get $el() {
        return this._$el;
    }

    render() {
        let $el = document.createElement('div')
        if (this.node.children.length) {
            $el.classList.add('mt-el-parent')
        }

        switch (this.node.nodeType) {
            case document.ELEMENT_NODE:
                this._createElementNode(this.node, $el);
                break;
            case document.TEXT_NODE:
                this._createTextNode(this.node, $el);
                break;
        }

        return $el
    }

    _createElementNode(node, $el) {
        let isLeaf = false
        if (!node.children || !node.children.length) {
            isLeaf = true
        }

        let $node = $.toDom(nodeArt(this.node))

        $el.appendChild($node)
        if (isLeaf) {
            //TODO
            $.addClass($el, 'is-leaf')
        } else {
            for (let i=0; i<node.children.length; i++) {
                let $child = document.createElement('div')
                $child.classList.add('mt-el-parent')

                $el.appendChild($child)
            }
        }

        //end
        let $end = document.createElement('span')
        $end.classList.add('mt-el-node')
        $end.innerHTML = '&lt;/'+ node.tagName.toLowerCase() + '&gt;'
        $el.appendChild($end)
    }
    _createTextNode(node, $el) {
        if (!node.textContent) {
            return false
        }
        $.addClass($el, 'leaf-node')
        $el.appendChild(document.createTextNode(node.textContent))
    }
}
export default Node