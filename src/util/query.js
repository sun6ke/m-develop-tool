function isArray(value) {
    return Object.prototype.toString.call(value) == '[object Array]';
}

const $ = {};

/**
 * get single element
 * @public
 */
$.one = function(selector, contextElement) {
  try {
    return (contextElement || document).querySelector(selector) || undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * get multiple elements
 * @public
 */
$.all = function(selector, contextElement) {
  try {
    const nodeList = (contextElement || document).querySelectorAll(selector);
    return Array.from(nodeList);
  } catch (e) {
    return [];
  }
}

/**
 * see whether an element contains a className
 * @public
 */
$.hasClass = function($el, className) {
  if (!$el || !$el.classList) {
    return false;
  }
  return $el.classList.contains(className);
}

$.addClass = function($el, className) {
    if (!$el) {
        return;
    }
    if (!isArray($el)) {
        $el = [$el];
    }
    for (let i=0; i<$el.length; i++) {
        let name = $el[i].className || '',
            arr = name.split(' ');
        if (arr.indexOf(className) > -1) {
            continue;
        }
        arr.push(className);
        $el[i].className = arr.join(' ');
    }
}

$.removeClass = function($el, className) {
    if (!$el) {
        return;
    }
    if (!isArray($el)) {
        $el = [$el];
    }
    for (let i=0; i<$el.length; i++) {
        let arr = $el[i].className.split(' ');
        for (let j=0; j<arr.length; j++) {
            if (arr[j] == className) {
                arr[j] = '';
            }
        }
        $el[i].className = arr.join(' ').trim();
    }
}

$.toDom = function(str) {
    let div = document.createElement("div");
    if(typeof str == "string") div.innerHTML = str;
    return div.childNodes[0];
}

$.remove = function($el) {
    for(let i = $el.childNodes.length - 1; i >= 0; i--) {
        $el.removeChild($el.childNodes[i]);
    }
}


/**
 * bind an event to element(s)
 * @public
 * @param  array    $el      element object or array
 * @param  string    eventType  name of the event
 * @param  function  fn
 * @param  boolean    useCapture
 */
$.bind = function($el, eventType, fn, useCapture) {
  if (!$el) {
    return;
  }
  if (!isArray($el)) {
    $el = [$el];
  }
  $el.forEach((el) => {
    el.addEventListener(eventType, fn, !!useCapture);
  })
}

$.parents = function($el, class_name) {
    let $node = $el
    while (!$.hasClass($node, class_name)) {
        $node = $node.parentElement
    }
    return $node
}


/**
 * export
 */
export default $;