(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var document = require('global/document')
var hyperx = require('hyperx')
var onload = require('on-load')

var SVGNS = 'http://www.w3.org/2000/svg'
var XLINKNS = 'http://www.w3.org/1999/xlink'

var BOOL_PROPS = {
  autofocus: 1,
  checked: 1,
  defaultchecked: 1,
  disabled: 1,
  formnovalidate: 1,
  indeterminate: 1,
  readonly: 1,
  required: 1,
  selected: 1,
  willvalidate: 1
}
var COMMENT_TAG = '!--'
var SVG_TAGS = [
  'svg',
  'altGlyph', 'altGlyphDef', 'altGlyphItem', 'animate', 'animateColor',
  'animateMotion', 'animateTransform', 'circle', 'clipPath', 'color-profile',
  'cursor', 'defs', 'desc', 'ellipse', 'feBlend', 'feColorMatrix',
  'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting',
  'feDisplacementMap', 'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB',
  'feFuncG', 'feFuncR', 'feGaussianBlur', 'feImage', 'feMerge', 'feMergeNode',
  'feMorphology', 'feOffset', 'fePointLight', 'feSpecularLighting',
  'feSpotLight', 'feTile', 'feTurbulence', 'filter', 'font', 'font-face',
  'font-face-format', 'font-face-name', 'font-face-src', 'font-face-uri',
  'foreignObject', 'g', 'glyph', 'glyphRef', 'hkern', 'image', 'line',
  'linearGradient', 'marker', 'mask', 'metadata', 'missing-glyph', 'mpath',
  'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect',
  'set', 'stop', 'switch', 'symbol', 'text', 'textPath', 'title', 'tref',
  'tspan', 'use', 'view', 'vkern'
]

function belCreateElement (tag, props, children) {
  var el

  // If an svg tag, it needs a namespace
  if (SVG_TAGS.indexOf(tag) !== -1) {
    props.namespace = SVGNS
  }

  // If we are using a namespace
  var ns = false
  if (props.namespace) {
    ns = props.namespace
    delete props.namespace
  }

  // Create the element
  if (ns) {
    el = document.createElementNS(ns, tag)
  } else if (tag === COMMENT_TAG) {
    return document.createComment(props.comment)
  } else {
    el = document.createElement(tag)
  }

  // If adding onload events
  if (props.onload || props.onunload) {
    var load = props.onload || function () {}
    var unload = props.onunload || function () {}
    onload(el, function belOnload () {
      load(el)
    }, function belOnunload () {
      unload(el)
    },
    // We have to use non-standard `caller` to find who invokes `belCreateElement`
    belCreateElement.caller.caller.caller)
    delete props.onload
    delete props.onunload
  }

  // Create the properties
  for (var p in props) {
    if (props.hasOwnProperty(p)) {
      var key = p.toLowerCase()
      var val = props[p]
      // Normalize className
      if (key === 'classname') {
        key = 'class'
        p = 'class'
      }
      // The for attribute gets transformed to htmlFor, but we just set as for
      if (p === 'htmlFor') {
        p = 'for'
      }
      // If a property is boolean, set itself to the key
      if (BOOL_PROPS[key]) {
        if (val === 'true') val = key
        else if (val === 'false') continue
      }
      // If a property prefers being set directly vs setAttribute
      if (key.slice(0, 2) === 'on') {
        el[p] = val
      } else {
        if (ns) {
          if (p === 'xlink:href') {
            el.setAttributeNS(XLINKNS, p, val)
          } else if (/^xmlns($|:)/i.test(p)) {
            // skip xmlns definitions
          } else {
            el.setAttributeNS(null, p, val)
          }
        } else {
          el.setAttribute(p, val)
        }
      }
    }
  }

  function appendChild (childs) {
    if (!Array.isArray(childs)) return
    for (var i = 0; i < childs.length; i++) {
      var node = childs[i]
      if (Array.isArray(node)) {
        appendChild(node)
        continue
      }

      if (typeof node === 'number' ||
        typeof node === 'boolean' ||
        typeof node === 'function' ||
        node instanceof Date ||
        node instanceof RegExp) {
        node = node.toString()
      }

      if (typeof node === 'string') {
        if (el.lastChild && el.lastChild.nodeName === '#text') {
          el.lastChild.nodeValue += node
          continue
        }
        node = document.createTextNode(node)
      }

      if (node && node.nodeType) {
        el.appendChild(node)
      }
    }
  }
  appendChild(children)

  return el
}

module.exports = hyperx(belCreateElement, {comments: true})
module.exports.default = module.exports
module.exports.createElement = belCreateElement

},{"global/document":4,"hyperx":7,"on-load":29}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
/* global HTMLElement */

'use strict'

module.exports = function emptyElement (element) {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError('Expected an element')
  }

  var node
  while ((node = element.lastChild)) element.removeChild(node)
  return element
}

},{}],4:[function(require,module,exports){
(function (global){
var topLevel = typeof global !== 'undefined' ? global :
    typeof window !== 'undefined' ? window : {}
var minDoc = require('min-document');

var doccy;

if (typeof document !== 'undefined') {
    doccy = document;
} else {
    doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'];

    if (!doccy) {
        doccy = topLevel['__GLOBAL_DOCUMENT_CACHE@4'] = minDoc;
    }
}

module.exports = doccy;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"min-document":2}],5:[function(require,module,exports){
(function (global){
var win;

if (typeof window !== "undefined") {
    win = window;
} else if (typeof global !== "undefined") {
    win = global;
} else if (typeof self !== "undefined"){
    win = self;
} else {
    win = {};
}

module.exports = win;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],6:[function(require,module,exports){
module.exports = attributeToProperty

var transform = {
  'class': 'className',
  'for': 'htmlFor',
  'http-equiv': 'httpEquiv'
}

function attributeToProperty (h) {
  return function (tagName, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr]
        delete attrs[attr]
      }
    }
    return h(tagName, attrs, children)
  }
}

},{}],7:[function(require,module,exports){
var attrToProp = require('hyperscript-attribute-to-property')

var VAR = 0, TEXT = 1, OPEN = 2, CLOSE = 3, ATTR = 4
var ATTR_KEY = 5, ATTR_KEY_W = 6
var ATTR_VALUE_W = 7, ATTR_VALUE = 8
var ATTR_VALUE_SQ = 9, ATTR_VALUE_DQ = 10
var ATTR_EQ = 11, ATTR_BREAK = 12
var COMMENT = 13

module.exports = function (h, opts) {
  if (!opts) opts = {}
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b)
  }
  if (opts.attrToProp !== false) {
    h = attrToProp(h)
  }

  return function (strings) {
    var state = TEXT, reg = ''
    var arglen = arguments.length
    var parts = []

    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i+1]
        var p = parse(strings[i])
        var xstate = state
        if (xstate === ATTR_VALUE_DQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_SQ) xstate = ATTR_VALUE
        if (xstate === ATTR_VALUE_W) xstate = ATTR_VALUE
        if (xstate === ATTR) xstate = ATTR_KEY
        p.push([ VAR, xstate, arg ])
        parts.push.apply(parts, p)
      } else parts.push.apply(parts, parse(strings[i]))
    }

    var tree = [null,{},[]]
    var stack = [[tree,-1]]
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length-1][0]
      var p = parts[i], s = p[0]
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length-1][1]
        if (stack.length > 1) {
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === OPEN) {
        var c = [p[1],{},[]]
        cur[2].push(c)
        stack.push([c,cur[2].length-1])
      } else if (s === ATTR_KEY || (s === VAR && p[1] === ATTR_KEY)) {
        var key = ''
        var copyKey
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1])
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === 'object' && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey]
                }
              }
            } else {
              key = concat(key, parts[i][2])
            }
          } else break
        }
        if (parts[i][0] === ATTR_EQ) i++
        var j = i
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][1])
            else cur[1][key] = concat(cur[1][key], parts[i][1])
          } else if (parts[i][0] === VAR
          && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key]) cur[1][key] = strfn(parts[i][2])
            else cur[1][key] = concat(cur[1][key], parts[i][2])
          } else {
            if (key.length && !cur[1][key] && i === j
            && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              // https://html.spec.whatwg.org/multipage/infrastructure.html#boolean-attributes
              // empty string is falsy, not well behaved value in browser
              cur[1][key] = key.toLowerCase()
            }
            break
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length-1][1]
          stack.pop()
          stack[stack.length-1][0][2][ix] = h(
            cur[0], cur[1], cur[2].length ? cur[2] : undefined
          )
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === undefined || p[2] === null) p[2] = ''
        else if (!p[2]) p[2] = concat('', p[2])
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2])
        } else {
          cur[2].push(p[2])
        }
      } else if (s === TEXT) {
        cur[2].push(p[1])
      } else if (s === ATTR_EQ || s === ATTR_BREAK) {
        // no-op
      } else {
        throw new Error('unhandled: ' + s)
      }
    }

    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift()
    }

    if (tree[2].length > 2
    || (tree[2].length === 2 && /\S/.test(tree[2][1]))) {
      throw new Error(
        'multiple root elements must be wrapped in an enclosing tag'
      )
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === 'string'
    && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h(tree[2][0][0], tree[2][0][1], tree[2][0][2])
    }
    return tree[2][0]

    function parse (str) {
      var res = []
      if (state === ATTR_VALUE_W) state = ATTR
      for (var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        if (state === TEXT && c === '<') {
          if (reg.length) res.push([TEXT, reg])
          reg = ''
          state = OPEN
        } else if (c === '>' && !quot(state) && state !== COMMENT) {
          if (state === OPEN) {
            res.push([OPEN,reg])
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY,reg])
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE,reg])
          }
          res.push([CLOSE])
          reg = ''
          state = TEXT
        } else if (state === COMMENT && /-$/.test(reg) && c === '-') {
          if (opts.comments) {
            res.push([ATTR_VALUE,reg.substr(0, reg.length - 1)],[CLOSE])
          }
          reg = ''
          state = TEXT
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg],[ATTR_KEY,'comment'],[ATTR_EQ])
          }
          reg = c
          state = COMMENT
        } else if (state === TEXT || state === COMMENT) {
          reg += c
        } else if (state === OPEN && /\s/.test(c)) {
          res.push([OPEN, reg])
          reg = ''
          state = ATTR
        } else if (state === OPEN) {
          reg += c
        } else if (state === ATTR && /[^\s"'=/]/.test(c)) {
          state = ATTR_KEY
          reg = c
        } else if (state === ATTR && /\s/.test(c)) {
          if (reg.length) res.push([ATTR_KEY,reg])
          res.push([ATTR_BREAK])
        } else if (state === ATTR_KEY && /\s/.test(c)) {
          res.push([ATTR_KEY,reg])
          reg = ''
          state = ATTR_KEY_W
        } else if (state === ATTR_KEY && c === '=') {
          res.push([ATTR_KEY,reg],[ATTR_EQ])
          reg = ''
          state = ATTR_VALUE_W
        } else if (state === ATTR_KEY) {
          reg += c
        } else if ((state === ATTR_KEY_W || state === ATTR) && c === '=') {
          res.push([ATTR_EQ])
          state = ATTR_VALUE_W
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c)) {
          res.push([ATTR_BREAK])
          if (/[\w-]/.test(c)) {
            reg += c
            state = ATTR_KEY
          } else state = ATTR
        } else if (state === ATTR_VALUE_W && c === '"') {
          state = ATTR_VALUE_DQ
        } else if (state === ATTR_VALUE_W && c === "'") {
          state = ATTR_VALUE_SQ
        } else if (state === ATTR_VALUE_DQ && c === '"') {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_SQ && c === "'") {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE_W && !/\s/.test(c)) {
          state = ATTR_VALUE
          i--
        } else if (state === ATTR_VALUE && /\s/.test(c)) {
          res.push([ATTR_VALUE,reg],[ATTR_BREAK])
          reg = ''
          state = ATTR
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ
        || state === ATTR_VALUE_DQ) {
          reg += c
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT,reg])
        reg = ''
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE,reg])
        reg = ''
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY,reg])
        reg = ''
      }
      return res
    }
  }

  function strfn (x) {
    if (typeof x === 'function') return x
    else if (typeof x === 'string') return x
    else if (x && typeof x === 'object') return x
    else return concat('', x)
  }
}

function quot (state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ
}

var hasOwn = Object.prototype.hasOwnProperty
function has (obj, key) { return hasOwn.call(obj, key) }

var closeRE = RegExp('^(' + [
  'area', 'base', 'basefont', 'bgsound', 'br', 'col', 'command', 'embed',
  'frame', 'hr', 'img', 'input', 'isindex', 'keygen', 'link', 'meta', 'param',
  'source', 'track', 'wbr', '!--',
  // SVG TAGS
  'animate', 'animateTransform', 'circle', 'cursor', 'desc', 'ellipse',
  'feBlend', 'feColorMatrix', 'feComposite',
  'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap',
  'feDistantLight', 'feFlood', 'feFuncA', 'feFuncB', 'feFuncG', 'feFuncR',
  'feGaussianBlur', 'feImage', 'feMergeNode', 'feMorphology',
  'feOffset', 'fePointLight', 'feSpecularLighting', 'feSpotLight', 'feTile',
  'feTurbulence', 'font-face-format', 'font-face-name', 'font-face-uri',
  'glyph', 'glyphRef', 'hkern', 'image', 'line', 'missing-glyph', 'mpath',
  'path', 'polygon', 'polyline', 'rect', 'set', 'stop', 'tref', 'use', 'view',
  'vkern'
].join('|') + ')(?:[\.#][a-zA-Z0-9\u007F-\uFFFF_:-]+)*$')
function selfClosing (tag) { return closeRE.test(tag) }

},{"hyperscript-attribute-to-property":6}],8:[function(require,module,exports){
'use strict';

exports = module.exports = require('./lib/parser')['default'];
exports['default'] = exports;

},{"./lib/parser":9}],9:[function(require,module,exports){
"use strict";

exports["default"] = (function() {
  /*
   * Generated by PEG.js 0.8.0.
   *
   * http://pegjs.majda.cz/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function SyntaxError(message, expected, found, offset, line, column) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.offset   = offset;
    this.line     = line;
    this.column   = column;

    this.name     = "SyntaxError";
  }

  peg$subclass(SyntaxError, Error);

  function parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},

        peg$FAILED = {},

        peg$startRuleFunctions = { start: peg$parsestart },
        peg$startRuleFunction  = peg$parsestart,

        peg$c0 = [],
        peg$c1 = function(elements) {
                return {
                    type    : 'messageFormatPattern',
                    elements: elements
                };
            },
        peg$c2 = peg$FAILED,
        peg$c3 = function(text) {
                var string = '',
                    i, j, outerLen, inner, innerLen;

                for (i = 0, outerLen = text.length; i < outerLen; i += 1) {
                    inner = text[i];

                    for (j = 0, innerLen = inner.length; j < innerLen; j += 1) {
                        string += inner[j];
                    }
                }

                return string;
            },
        peg$c4 = function(messageText) {
                return {
                    type : 'messageTextElement',
                    value: messageText
                };
            },
        peg$c5 = /^[^ \t\n\r,.+={}#]/,
        peg$c6 = { type: "class", value: "[^ \\t\\n\\r,.+={}#]", description: "[^ \\t\\n\\r,.+={}#]" },
        peg$c7 = "{",
        peg$c8 = { type: "literal", value: "{", description: "\"{\"" },
        peg$c9 = null,
        peg$c10 = ",",
        peg$c11 = { type: "literal", value: ",", description: "\",\"" },
        peg$c12 = "}",
        peg$c13 = { type: "literal", value: "}", description: "\"}\"" },
        peg$c14 = function(id, format) {
                return {
                    type  : 'argumentElement',
                    id    : id,
                    format: format && format[2]
                };
            },
        peg$c15 = "number",
        peg$c16 = { type: "literal", value: "number", description: "\"number\"" },
        peg$c17 = "date",
        peg$c18 = { type: "literal", value: "date", description: "\"date\"" },
        peg$c19 = "time",
        peg$c20 = { type: "literal", value: "time", description: "\"time\"" },
        peg$c21 = function(type, style) {
                return {
                    type : type + 'Format',
                    style: style && style[2]
                };
            },
        peg$c22 = "plural",
        peg$c23 = { type: "literal", value: "plural", description: "\"plural\"" },
        peg$c24 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: false,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                };
            },
        peg$c25 = "selectordinal",
        peg$c26 = { type: "literal", value: "selectordinal", description: "\"selectordinal\"" },
        peg$c27 = function(pluralStyle) {
                return {
                    type   : pluralStyle.type,
                    ordinal: true,
                    offset : pluralStyle.offset || 0,
                    options: pluralStyle.options
                }
            },
        peg$c28 = "select",
        peg$c29 = { type: "literal", value: "select", description: "\"select\"" },
        peg$c30 = function(options) {
                return {
                    type   : 'selectFormat',
                    options: options
                };
            },
        peg$c31 = "=",
        peg$c32 = { type: "literal", value: "=", description: "\"=\"" },
        peg$c33 = function(selector, pattern) {
                return {
                    type    : 'optionalFormatPattern',
                    selector: selector,
                    value   : pattern
                };
            },
        peg$c34 = "offset:",
        peg$c35 = { type: "literal", value: "offset:", description: "\"offset:\"" },
        peg$c36 = function(number) {
                return number;
            },
        peg$c37 = function(offset, options) {
                return {
                    type   : 'pluralFormat',
                    offset : offset,
                    options: options
                };
            },
        peg$c38 = { type: "other", description: "whitespace" },
        peg$c39 = /^[ \t\n\r]/,
        peg$c40 = { type: "class", value: "[ \\t\\n\\r]", description: "[ \\t\\n\\r]" },
        peg$c41 = { type: "other", description: "optionalWhitespace" },
        peg$c42 = /^[0-9]/,
        peg$c43 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c44 = /^[0-9a-f]/i,
        peg$c45 = { type: "class", value: "[0-9a-f]i", description: "[0-9a-f]i" },
        peg$c46 = "0",
        peg$c47 = { type: "literal", value: "0", description: "\"0\"" },
        peg$c48 = /^[1-9]/,
        peg$c49 = { type: "class", value: "[1-9]", description: "[1-9]" },
        peg$c50 = function(digits) {
            return parseInt(digits, 10);
        },
        peg$c51 = /^[^{}\\\0-\x1F \t\n\r]/,
        peg$c52 = { type: "class", value: "[^{}\\\\\\0-\\x1F \\t\\n\\r]", description: "[^{}\\\\\\0-\\x1F \\t\\n\\r]" },
        peg$c53 = "\\\\",
        peg$c54 = { type: "literal", value: "\\\\", description: "\"\\\\\\\\\"" },
        peg$c55 = function() { return '\\'; },
        peg$c56 = "\\#",
        peg$c57 = { type: "literal", value: "\\#", description: "\"\\\\#\"" },
        peg$c58 = function() { return '\\#'; },
        peg$c59 = "\\{",
        peg$c60 = { type: "literal", value: "\\{", description: "\"\\\\{\"" },
        peg$c61 = function() { return '\u007B'; },
        peg$c62 = "\\}",
        peg$c63 = { type: "literal", value: "\\}", description: "\"\\\\}\"" },
        peg$c64 = function() { return '\u007D'; },
        peg$c65 = "\\u",
        peg$c66 = { type: "literal", value: "\\u", description: "\"\\\\u\"" },
        peg$c67 = function(digits) {
                return String.fromCharCode(parseInt(digits, 16));
            },
        peg$c68 = function(chars) { return chars.join(''); },

        peg$currPos          = 0,
        peg$reportedPos      = 0,
        peg$cachedPos        = 0,
        peg$cachedPosDetails = { line: 1, column: 1, seenCR: false },
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$reportedPos, peg$currPos);
    }

    function offset() {
      return peg$reportedPos;
    }

    function line() {
      return peg$computePosDetails(peg$reportedPos).line;
    }

    function column() {
      return peg$computePosDetails(peg$reportedPos).column;
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        peg$reportedPos
      );
    }

    function error(message) {
      throw peg$buildException(message, null, peg$reportedPos);
    }

    function peg$computePosDetails(pos) {
      function advance(details, startPos, endPos) {
        var p, ch;

        for (p = startPos; p < endPos; p++) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }
        }
      }

      if (peg$cachedPos !== pos) {
        if (peg$cachedPos > pos) {
          peg$cachedPos = 0;
          peg$cachedPosDetails = { line: 1, column: 1, seenCR: false };
        }
        advance(peg$cachedPosDetails, peg$cachedPos, pos);
        peg$cachedPos = pos;
      }

      return peg$cachedPosDetails;
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, pos) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0180-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1080-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      var posDetails = peg$computePosDetails(pos),
          found      = pos < input.length ? input.charAt(pos) : null;

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        pos,
        posDetails.line,
        posDetails.column
      );
    }

    function peg$parsestart() {
      var s0;

      s0 = peg$parsemessageFormatPattern();

      return s0;
    }

    function peg$parsemessageFormatPattern() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsemessageFormatElement();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsemessageFormatElement();
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c1(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsemessageFormatElement() {
      var s0;

      s0 = peg$parsemessageTextElement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseargumentElement();
      }

      return s0;
    }

    function peg$parsemessageText() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$currPos;
      s3 = peg$parse_();
      if (s3 !== peg$FAILED) {
        s4 = peg$parsechars();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (s5 !== peg$FAILED) {
            s3 = [s3, s4, s5];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$c2;
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$currPos;
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            s4 = peg$parsechars();
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c3(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parsews();
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parsemessageTextElement() {
      var s0, s1;

      s0 = peg$currPos;
      s1 = peg$parsemessageText();
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c4(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parseargument() {
      var s0, s1, s2;

      s0 = peg$parsenumber();
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = [];
        if (peg$c5.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c6); }
        }
        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            if (peg$c5.test(input.charAt(peg$currPos))) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c6); }
            }
          }
        } else {
          s1 = peg$c2;
        }
        if (s1 !== peg$FAILED) {
          s1 = input.substring(s0, peg$currPos);
        }
        s0 = s1;
      }

      return s0;
    }

    function peg$parseargumentElement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 123) {
        s1 = peg$c7;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parseargument();
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$currPos;
              if (input.charCodeAt(peg$currPos) === 44) {
                s6 = peg$c10;
                peg$currPos++;
              } else {
                s6 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c11); }
              }
              if (s6 !== peg$FAILED) {
                s7 = peg$parse_();
                if (s7 !== peg$FAILED) {
                  s8 = peg$parseelementFormat();
                  if (s8 !== peg$FAILED) {
                    s6 = [s6, s7, s8];
                    s5 = s6;
                  } else {
                    peg$currPos = s5;
                    s5 = peg$c2;
                  }
                } else {
                  peg$currPos = s5;
                  s5 = peg$c2;
                }
              } else {
                peg$currPos = s5;
                s5 = peg$c2;
              }
              if (s5 === peg$FAILED) {
                s5 = peg$c9;
              }
              if (s5 !== peg$FAILED) {
                s6 = peg$parse_();
                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 125) {
                    s7 = peg$c12;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;
                    if (peg$silentFails === 0) { peg$fail(peg$c13); }
                  }
                  if (s7 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c14(s3, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseelementFormat() {
      var s0;

      s0 = peg$parsesimpleFormat();
      if (s0 === peg$FAILED) {
        s0 = peg$parsepluralFormat();
        if (s0 === peg$FAILED) {
          s0 = peg$parseselectOrdinalFormat();
          if (s0 === peg$FAILED) {
            s0 = peg$parseselectFormat();
          }
        }
      }

      return s0;
    }

    function peg$parsesimpleFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c15) {
        s1 = peg$c15;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c16); }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 4) === peg$c17) {
          s1 = peg$c17;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c18); }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 4) === peg$c19) {
            s1 = peg$c19;
            peg$currPos += 4;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c20); }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 44) {
            s4 = peg$c10;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parse_();
            if (s5 !== peg$FAILED) {
              s6 = peg$parsechars();
              if (s6 !== peg$FAILED) {
                s4 = [s4, s5, s6];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }
          if (s3 === peg$FAILED) {
            s3 = peg$c9;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c21(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c22) {
        s1 = peg$c22;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c23); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c24(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectOrdinalFormat() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 13) === peg$c25) {
        s1 = peg$c25;
        peg$currPos += 13;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c26); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = peg$parsepluralStyle();
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c27(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselectFormat() {
      var s0, s1, s2, s3, s4, s5, s6;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6) === peg$c28) {
        s1 = peg$c28;
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c29); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 44) {
            s3 = peg$c10;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c11); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parse_();
            if (s4 !== peg$FAILED) {
              s5 = [];
              s6 = peg$parseoptionalFormatPattern();
              if (s6 !== peg$FAILED) {
                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseoptionalFormatPattern();
                }
              } else {
                s5 = peg$c2;
              }
              if (s5 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c30(s5);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseselector() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      s1 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 61) {
        s2 = peg$c31;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c32); }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parsenumber();
        if (s3 !== peg$FAILED) {
          s2 = [s2, s3];
          s1 = s2;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }
      } else {
        peg$currPos = s1;
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$parsechars();
      }

      return s0;
    }

    function peg$parseoptionalFormatPattern() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;

      s0 = peg$currPos;
      s1 = peg$parse_();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseselector();
        if (s2 !== peg$FAILED) {
          s3 = peg$parse_();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 123) {
              s4 = peg$c7;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c8); }
            }
            if (s4 !== peg$FAILED) {
              s5 = peg$parse_();
              if (s5 !== peg$FAILED) {
                s6 = peg$parsemessageFormatPattern();
                if (s6 !== peg$FAILED) {
                  s7 = peg$parse_();
                  if (s7 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 125) {
                      s8 = peg$c12;
                      peg$currPos++;
                    } else {
                      s8 = peg$FAILED;
                      if (peg$silentFails === 0) { peg$fail(peg$c13); }
                    }
                    if (s8 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c33(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parseoffset() {
      var s0, s1, s2, s3;

      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7) === peg$c34) {
        s1 = peg$c34;
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c35); }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = peg$parsenumber();
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c36(s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsepluralStyle() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseoffset();
      if (s1 === peg$FAILED) {
        s1 = peg$c9;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (s2 !== peg$FAILED) {
          s3 = [];
          s4 = peg$parseoptionalFormatPattern();
          if (s4 !== peg$FAILED) {
            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseoptionalFormatPattern();
            }
          } else {
            s3 = peg$c2;
          }
          if (s3 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c37(s1, s3);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$c2;
      }

      return s0;
    }

    function peg$parsews() {
      var s0, s1;

      peg$silentFails++;
      s0 = [];
      if (peg$c39.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c40); }
      }
      if (s1 !== peg$FAILED) {
        while (s1 !== peg$FAILED) {
          s0.push(s1);
          if (peg$c39.test(input.charAt(peg$currPos))) {
            s1 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c40); }
          }
        }
      } else {
        s0 = peg$c2;
      }
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c38); }
      }

      return s0;
    }

    function peg$parse_() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsews();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parsews();
      }
      if (s1 !== peg$FAILED) {
        s1 = input.substring(s0, peg$currPos);
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c41); }
      }

      return s0;
    }

    function peg$parsedigit() {
      var s0;

      if (peg$c42.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c43); }
      }

      return s0;
    }

    function peg$parsehexDigit() {
      var s0;

      if (peg$c44.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c45); }
      }

      return s0;
    }

    function peg$parsenumber() {
      var s0, s1, s2, s3, s4, s5;

      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 48) {
        s1 = peg$c46;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c47); }
      }
      if (s1 === peg$FAILED) {
        s1 = peg$currPos;
        s2 = peg$currPos;
        if (peg$c48.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c49); }
        }
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$parsedigit();
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$parsedigit();
          }
          if (s4 !== peg$FAILED) {
            s3 = [s3, s4];
            s2 = s3;
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }
        } else {
          peg$currPos = s2;
          s2 = peg$c2;
        }
        if (s2 !== peg$FAILED) {
          s2 = input.substring(s1, peg$currPos);
        }
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c50(s1);
      }
      s0 = s1;

      return s0;
    }

    function peg$parsechar() {
      var s0, s1, s2, s3, s4, s5, s6, s7;

      if (peg$c51.test(input.charAt(peg$currPos))) {
        s0 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c52); }
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 2) === peg$c53) {
          s1 = peg$c53;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c54); }
        }
        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c55();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 2) === peg$c56) {
            s1 = peg$c56;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c57); }
          }
          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c58();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 2) === peg$c59) {
              s1 = peg$c59;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) { peg$fail(peg$c60); }
            }
            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c61();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 2) === peg$c62) {
                s1 = peg$c62;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) { peg$fail(peg$c63); }
              }
              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c64();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 2) === peg$c65) {
                  s1 = peg$c65;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) { peg$fail(peg$c66); }
                }
                if (s1 !== peg$FAILED) {
                  s2 = peg$currPos;
                  s3 = peg$currPos;
                  s4 = peg$parsehexDigit();
                  if (s4 !== peg$FAILED) {
                    s5 = peg$parsehexDigit();
                    if (s5 !== peg$FAILED) {
                      s6 = peg$parsehexDigit();
                      if (s6 !== peg$FAILED) {
                        s7 = peg$parsehexDigit();
                        if (s7 !== peg$FAILED) {
                          s4 = [s4, s5, s6, s7];
                          s3 = s4;
                        } else {
                          peg$currPos = s3;
                          s3 = peg$c2;
                        }
                      } else {
                        peg$currPos = s3;
                        s3 = peg$c2;
                      }
                    } else {
                      peg$currPos = s3;
                      s3 = peg$c2;
                    }
                  } else {
                    peg$currPos = s3;
                    s3 = peg$c2;
                  }
                  if (s3 !== peg$FAILED) {
                    s3 = input.substring(s2, peg$currPos);
                  }
                  s2 = s3;
                  if (s2 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c67(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              }
            }
          }
        }
      }

      return s0;
    }

    function peg$parsechars() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parsechar();
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsechar();
        }
      } else {
        s1 = peg$c2;
      }
      if (s1 !== peg$FAILED) {
        peg$reportedPos = s0;
        s1 = peg$c68(s1);
      }
      s0 = s1;

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
    }
  }

  return {
    SyntaxError: SyntaxError,
    parse:       parse
  };
})();


},{}],10:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlMessageFormat = require('./lib/main')['default'];

// Add all locale data to `IntlMessageFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlMessageFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlMessageFormat;
exports['default'] = exports;

},{"./lib/locales":2,"./lib/main":15}],11:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports["default"] = Compiler;

function Compiler(locales, formats, pluralFn) {
    this.locales  = locales;
    this.formats  = formats;
    this.pluralFn = pluralFn;
}

Compiler.prototype.compile = function (ast) {
    this.pluralStack        = [];
    this.currentPlural      = null;
    this.pluralNumberFormat = null;

    return this.compileMessage(ast);
};

Compiler.prototype.compileMessage = function (ast) {
    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new Error('Message AST is not of type: "messageFormatPattern"');
    }

    var elements = ast.elements,
        pattern  = [];

    var i, len, element;

    for (i = 0, len = elements.length; i < len; i += 1) {
        element = elements[i];

        switch (element.type) {
            case 'messageTextElement':
                pattern.push(this.compileMessageText(element));
                break;

            case 'argumentElement':
                pattern.push(this.compileArgument(element));
                break;

            default:
                throw new Error('Message element does not have a valid type');
        }
    }

    return pattern;
};

Compiler.prototype.compileMessageText = function (element) {
    // When this `element` is part of plural sub-pattern and its value contains
    // an unescaped '#', use a `PluralOffsetString` helper to properly output
    // the number with the correct offset in the string.
    if (this.currentPlural && /(^|[^\\])#/g.test(element.value)) {
        // Create a cache a NumberFormat instance that can be reused for any
        // PluralOffsetString instance in this message.
        if (!this.pluralNumberFormat) {
            this.pluralNumberFormat = new Intl.NumberFormat(this.locales);
        }

        return new PluralOffsetString(
                this.currentPlural.id,
                this.currentPlural.format.offset,
                this.pluralNumberFormat,
                element.value);
    }

    // Unescape the escaped '#'s in the message text.
    return element.value.replace(/\\#/g, '#');
};

Compiler.prototype.compileArgument = function (element) {
    var format = element.format;

    if (!format) {
        return new StringFormat(element.id);
    }

    var formats  = this.formats,
        locales  = this.locales,
        pluralFn = this.pluralFn,
        options;

    switch (format.type) {
        case 'numberFormat':
            options = formats.number[format.style];
            return {
                id    : element.id,
                format: new Intl.NumberFormat(locales, options).format
            };

        case 'dateFormat':
            options = formats.date[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'timeFormat':
            options = formats.time[format.style];
            return {
                id    : element.id,
                format: new Intl.DateTimeFormat(locales, options).format
            };

        case 'pluralFormat':
            options = this.compileOptions(element);
            return new PluralFormat(
                element.id, format.ordinal, format.offset, options, pluralFn
            );

        case 'selectFormat':
            options = this.compileOptions(element);
            return new SelectFormat(element.id, options);

        default:
            throw new Error('Message element does not have a valid format type');
    }
};

Compiler.prototype.compileOptions = function (element) {
    var format      = element.format,
        options     = format.options,
        optionsHash = {};

    // Save the current plural element, if any, then set it to a new value when
    // compiling the options sub-patterns. This conforms the spec's algorithm
    // for handling `"#"` syntax in message text.
    this.pluralStack.push(this.currentPlural);
    this.currentPlural = format.type === 'pluralFormat' ? element : null;

    var i, len, option;

    for (i = 0, len = options.length; i < len; i += 1) {
        option = options[i];

        // Compile the sub-pattern and save it under the options's selector.
        optionsHash[option.selector] = this.compileMessage(option.value);
    }

    // Pop the plural stack to put back the original current plural value.
    this.currentPlural = this.pluralStack.pop();

    return optionsHash;
};

// -- Compiler Helper Classes --------------------------------------------------

function StringFormat(id) {
    this.id = id;
}

StringFormat.prototype.format = function (value) {
    if (!value && typeof value !== 'number') {
        return '';
    }

    return typeof value === 'string' ? value : String(value);
};

function PluralFormat(id, useOrdinal, offset, options, pluralFn) {
    this.id         = id;
    this.useOrdinal = useOrdinal;
    this.offset     = offset;
    this.options    = options;
    this.pluralFn   = pluralFn;
}

PluralFormat.prototype.getOption = function (value) {
    var options = this.options;

    var option = options['=' + value] ||
            options[this.pluralFn(value - this.offset, this.useOrdinal)];

    return option || options.other;
};

function PluralOffsetString(id, offset, numberFormat, string) {
    this.id           = id;
    this.offset       = offset;
    this.numberFormat = numberFormat;
    this.string       = string;
}

PluralOffsetString.prototype.format = function (value) {
    var number = this.numberFormat.format(value - this.offset);

    return this.string
            .replace(/(^|[^\\])#/g, '$1' + number)
            .replace(/\\#/g, '#');
};

function SelectFormat(id, options) {
    this.id      = id;
    this.options = options;
}

SelectFormat.prototype.getOption = function (value) {
    var options = this.options;
    return options[value] || options.other;
};


},{}],12:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils"), src$es5$$ = require("./es5"), src$compiler$$ = require("./compiler"), intl$messageformat$parser$$ = require("intl-messageformat-parser");
exports["default"] = MessageFormat;

// -- MessageFormat --------------------------------------------------------

function MessageFormat(message, locales, formats) {
    // Parse string messages into an AST.
    var ast = typeof message === 'string' ?
            MessageFormat.__parse(message) : message;

    if (!(ast && ast.type === 'messageFormatPattern')) {
        throw new TypeError('A message must be provided as a String or AST.');
    }

    // Creates a new object with the specified `formats` merged with the default
    // formats.
    formats = this._mergeFormats(MessageFormat.formats, formats);

    // Defined first because it's used to build the format pattern.
    src$es5$$.defineProperty(this, '_locale',  {value: this._resolveLocale(locales)});

    // Compile the `ast` to a pattern that is highly optimized for repeated
    // `format()` invocations. **Note:** This passes the `locales` set provided
    // to the constructor instead of just the resolved locale.
    var pluralFn = this._findPluralRuleFunction(this._locale);
    var pattern  = this._compilePattern(ast, locales, formats, pluralFn);

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var messageFormat = this;
    this.format = function (values) {
        return messageFormat._format(pattern, values);
    };
}

// Default format options used as the prototype of the `formats` provided to the
// constructor. These are used when constructing the internal Intl.NumberFormat
// and Intl.DateTimeFormat instances.
src$es5$$.defineProperty(MessageFormat, 'formats', {
    enumerable: true,

    value: {
        number: {
            'currency': {
                style: 'currency'
            },

            'percent': {
                style: 'percent'
            }
        },

        date: {
            'short': {
                month: 'numeric',
                day  : 'numeric',
                year : '2-digit'
            },

            'medium': {
                month: 'short',
                day  : 'numeric',
                year : 'numeric'
            },

            'long': {
                month: 'long',
                day  : 'numeric',
                year : 'numeric'
            },

            'full': {
                weekday: 'long',
                month  : 'long',
                day    : 'numeric',
                year   : 'numeric'
            }
        },

        time: {
            'short': {
                hour  : 'numeric',
                minute: 'numeric'
            },

            'medium':  {
                hour  : 'numeric',
                minute: 'numeric',
                second: 'numeric'
            },

            'long': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            },

            'full': {
                hour        : 'numeric',
                minute      : 'numeric',
                second      : 'numeric',
                timeZoneName: 'short'
            }
        }
    }
});

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(MessageFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(MessageFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlMessageFormat is missing a ' +
            '`locale` property'
        );
    }

    MessageFormat.__localeData__[data.locale.toLowerCase()] = data;
}});

// Defines `__parse()` static method as an exposed private.
src$es5$$.defineProperty(MessageFormat, '__parse', {value: intl$messageformat$parser$$["default"].parse});

// Define public `defaultLocale` property which defaults to English, but can be
// set by the developer.
src$es5$$.defineProperty(MessageFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

MessageFormat.prototype.resolvedOptions = function () {
    // TODO: Provide anything else?
    return {
        locale: this._locale
    };
};

MessageFormat.prototype._compilePattern = function (ast, locales, formats, pluralFn) {
    var compiler = new src$compiler$$["default"](locales, formats, pluralFn);
    return compiler.compile(ast);
};

MessageFormat.prototype._findPluralRuleFunction = function (locale) {
    var localeData = MessageFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find a `pluralRuleFunction` to return.
    while (data) {
        if (data.pluralRuleFunction) {
            return data.pluralRuleFunction;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlMessageFormat is missing a ' +
        '`pluralRuleFunction` for :' + locale
    );
};

MessageFormat.prototype._format = function (pattern, values) {
    var result = '',
        i, len, part, id, value;

    for (i = 0, len = pattern.length; i < len; i += 1) {
        part = pattern[i];

        // Exist early for string parts.
        if (typeof part === 'string') {
            result += part;
            continue;
        }

        id = part.id;

        // Enforce that all required values are provided by the caller.
        if (!(values && src$utils$$.hop.call(values, id))) {
            throw new Error('A value must be provided for: ' + id);
        }

        value = values[id];

        // Recursively format plural and select parts' option — which can be a
        // nested pattern structure. The choosing of the option to use is
        // abstracted-by and delegated-to the part helper object.
        if (part.options) {
            result += this._format(part.getOption(value), values);
        } else {
            result += part.format(value);
        }
    }

    return result;
};

MessageFormat.prototype._mergeFormats = function (defaults, formats) {
    var mergedFormats = {},
        type, mergedType;

    for (type in defaults) {
        if (!src$utils$$.hop.call(defaults, type)) { continue; }

        mergedFormats[type] = mergedType = src$es5$$.objCreate(defaults[type]);

        if (formats && src$utils$$.hop.call(formats, type)) {
            src$utils$$.extend(mergedType, formats[type]);
        }
    }

    return mergedFormats;
};

MessageFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(MessageFormat.defaultLocale);

    var localeData = MessageFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlMessageFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};


},{"./compiler":11,"./es5":14,"./utils":16,"intl-messageformat-parser":8}],13:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"}};


},{}],14:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var src$utils$$ = require("./utils");

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!src$utils$$.hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (src$utils$$.hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};
exports.defineProperty = defineProperty, exports.objCreate = objCreate;


},{"./utils":16}],15:[function(require,module,exports){
/* jslint esnext: true */

"use strict";
var src$core$$ = require("./core"), src$en$$ = require("./en");

src$core$$["default"].__addLocaleData(src$en$$["default"]);
src$core$$["default"].defaultLocale = 'en';

exports["default"] = src$core$$["default"];


},{"./core":12,"./en":13}],16:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
exports.extend = extend;
var hop = Object.prototype.hasOwnProperty;

function extend(obj) {
    var sources = Array.prototype.slice.call(arguments, 1),
        i, len, source, key;

    for (i = 0, len = sources.length; i < len; i += 1) {
        source = sources[i];
        if (!source) { continue; }

        for (key in source) {
            if (hop.call(source, key)) {
                obj[key] = source[key];
            }
        }
    }

    return obj;
}
exports.hop = hop;


},{}],17:[function(require,module,exports){
IntlRelativeFormat.__addLocaleData({"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"minute":{"displayName":"minute","relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-001","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-150","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AS","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AT","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-AU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BI","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-BZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CH","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CX","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-CY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DE","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DK","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-DM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-Dsrt","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"fields":{"year":{"displayName":"Year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"other":"+{0} y"},"past":{"other":"-{0} y"}}},"month":{"displayName":"Month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"other":"+{0} m"},"past":{"other":"-{0} m"}}},"day":{"displayName":"Day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"other":"+{0} d"},"past":{"other":"-{0} d"}}},"hour":{"displayName":"Hour","relativeTime":{"future":{"other":"+{0} h"},"past":{"other":"-{0} h"}}},"minute":{"displayName":"Minute","relativeTime":{"future":{"other":"+{0} min"},"past":{"other":"-{0} min"}}},"second":{"displayName":"Second","relative":{"0":"now"},"relativeTime":{"future":{"other":"+{0} s"},"past":{"other":"-{0} s"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-ER","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FI","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FJ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-FM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GD","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GU","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-GY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-HK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IL","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-IO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-JE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-JM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KE","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KI","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-KY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LR","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-LS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MH","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MP","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MT","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-MY","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NF","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NL","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NR","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-NZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PN","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PR","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-PW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-RW","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SB","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SD","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SE","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SH","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SI","parentLocale":"en-150"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SL","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SX","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-SZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-Shaw","pluralRuleFunction":function (n,ord){if(ord)return"other";return"other"},"fields":{"year":{"displayName":"Year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"other":"+{0} y"},"past":{"other":"-{0} y"}}},"month":{"displayName":"Month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"other":"+{0} m"},"past":{"other":"-{0} m"}}},"day":{"displayName":"Day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"other":"+{0} d"},"past":{"other":"-{0} d"}}},"hour":{"displayName":"Hour","relativeTime":{"future":{"other":"+{0} h"},"past":{"other":"-{0} h"}}},"minute":{"displayName":"Minute","relativeTime":{"future":{"other":"+{0} min"},"past":{"other":"-{0} min"}}},"second":{"displayName":"Second","relative":{"0":"now"},"relativeTime":{"future":{"other":"+{0} s"},"past":{"other":"-{0} s"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"en-TC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TK","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TO","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TT","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TV","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-TZ","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-UG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-UM","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-US","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VC","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VG","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VI","parentLocale":"en"});
IntlRelativeFormat.__addLocaleData({"locale":"en-VU","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-WS","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZA","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZM","parentLocale":"en-001"});
IntlRelativeFormat.__addLocaleData({"locale":"en-ZW","parentLocale":"en-001"});

},{}],18:[function(require,module,exports){
IntlRelativeFormat.__addLocaleData({"locale":"es","pluralRuleFunction":function (n,ord){if(ord)return"other";return n==1?"one":"other"},"fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"anteayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-419","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-AR","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-BO","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CL","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CO","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-CR","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-CU","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-DO","parentLocale":"es-419","fields":{"year":{"displayName":"Año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"Mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"Día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"anteayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"Minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"Segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-EA","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-EC","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-GQ","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-GT","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-HN","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-IC","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-MX","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el año próximo","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el mes próximo","-1":"el mes pasado"},"relativeTime":{"future":{"one":"en {0} mes","other":"en {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-NI","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-PA","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-PE","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PH","parentLocale":"es"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PR","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-PY","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antes de ayer","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-SV","parentLocale":"es-419","fields":{"year":{"displayName":"año","relative":{"0":"este año","1":"el próximo año","-1":"el año pasado"},"relativeTime":{"future":{"one":"dentro de {0} año","other":"dentro de {0} años"},"past":{"one":"hace {0} año","other":"hace {0} años"}}},"month":{"displayName":"mes","relative":{"0":"este mes","1":"el próximo mes","-1":"el mes pasado"},"relativeTime":{"future":{"one":"dentro de {0} mes","other":"dentro de {0} meses"},"past":{"one":"hace {0} mes","other":"hace {0} meses"}}},"day":{"displayName":"día","relative":{"0":"hoy","1":"mañana","2":"pasado mañana","-2":"antier","-1":"ayer"},"relativeTime":{"future":{"one":"dentro de {0} día","other":"dentro de {0} días"},"past":{"one":"hace {0} día","other":"hace {0} días"}}},"hour":{"displayName":"hora","relativeTime":{"future":{"one":"dentro de {0} hora","other":"dentro de {0} horas"},"past":{"one":"hace {0} hora","other":"hace {0} horas"}}},"minute":{"displayName":"minuto","relativeTime":{"future":{"one":"dentro de {0} minuto","other":"dentro de {0} minutos"},"past":{"one":"hace {0} minuto","other":"hace {0} minutos"}}},"second":{"displayName":"segundo","relative":{"0":"ahora"},"relativeTime":{"future":{"one":"dentro de {0} segundo","other":"dentro de {0} segundos"},"past":{"one":"hace {0} segundo","other":"hace {0} segundos"}}}}});
IntlRelativeFormat.__addLocaleData({"locale":"es-US","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-UY","parentLocale":"es-419"});
IntlRelativeFormat.__addLocaleData({"locale":"es-VE","parentLocale":"es-419"});

},{}],19:[function(require,module,exports){
/* jshint node:true */

'use strict';

var IntlRelativeFormat = require('./lib/main')['default'];

// Add all locale data to `IntlRelativeFormat`. This module will be ignored when
// bundling for the browser with Browserify/Webpack.
require('./lib/locales');

// Re-export `IntlRelativeFormat` as the CommonJS default exports with all the
// locale data registered, and with English set as the default locale. Define
// the `default` prop for use with other compiled ES6 Modules.
exports = module.exports = IntlRelativeFormat;
exports['default'] = exports;

},{"./lib/locales":2,"./lib/main":24}],20:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";
var intl$messageformat$$ = require("intl-messageformat"), src$diff$$ = require("./diff"), src$es5$$ = require("./es5");
exports["default"] = RelativeFormat;

// -----------------------------------------------------------------------------

var FIELDS = ['second', 'minute', 'hour', 'day', 'month', 'year'];
var STYLES = ['best fit', 'numeric'];

// -- RelativeFormat -----------------------------------------------------------

function RelativeFormat(locales, options) {
    options = options || {};

    // Make a copy of `locales` if it's an array, so that it doesn't change
    // since it's used lazily.
    if (src$es5$$.isArray(locales)) {
        locales = locales.concat();
    }

    src$es5$$.defineProperty(this, '_locale', {value: this._resolveLocale(locales)});
    src$es5$$.defineProperty(this, '_options', {value: {
        style: this._resolveStyle(options.style),
        units: this._isValidUnits(options.units) && options.units
    }});

    src$es5$$.defineProperty(this, '_locales', {value: locales});
    src$es5$$.defineProperty(this, '_fields', {value: this._findFields(this._locale)});
    src$es5$$.defineProperty(this, '_messages', {value: src$es5$$.objCreate(null)});

    // "Bind" `format()` method to `this` so it can be passed by reference like
    // the other `Intl` APIs.
    var relativeFormat = this;
    this.format = function format(date, options) {
        return relativeFormat._format(date, options);
    };
}

// Define internal private properties for dealing with locale data.
src$es5$$.defineProperty(RelativeFormat, '__localeData__', {value: src$es5$$.objCreate(null)});
src$es5$$.defineProperty(RelativeFormat, '__addLocaleData', {value: function (data) {
    if (!(data && data.locale)) {
        throw new Error(
            'Locale data provided to IntlRelativeFormat is missing a ' +
            '`locale` property value'
        );
    }

    RelativeFormat.__localeData__[data.locale.toLowerCase()] = data;

    // Add data to IntlMessageFormat.
    intl$messageformat$$["default"].__addLocaleData(data);
}});

// Define public `defaultLocale` property which can be set by the developer, or
// it will be set when the first RelativeFormat instance is created by
// leveraging the resolved locale from `Intl`.
src$es5$$.defineProperty(RelativeFormat, 'defaultLocale', {
    enumerable: true,
    writable  : true,
    value     : undefined
});

// Define public `thresholds` property which can be set by the developer, and
// defaults to relative time thresholds from moment.js.
src$es5$$.defineProperty(RelativeFormat, 'thresholds', {
    enumerable: true,

    value: {
        second: 45,  // seconds to minute
        minute: 45,  // minutes to hour
        hour  : 22,  // hours to day
        day   : 26,  // days to month
        month : 11   // months to year
    }
});

RelativeFormat.prototype.resolvedOptions = function () {
    return {
        locale: this._locale,
        style : this._options.style,
        units : this._options.units
    };
};

RelativeFormat.prototype._compileMessage = function (units) {
    // `this._locales` is the original set of locales the user specified to the
    // constructor, while `this._locale` is the resolved root locale.
    var locales        = this._locales;
    var resolvedLocale = this._locale;

    var field        = this._fields[units];
    var relativeTime = field.relativeTime;
    var future       = '';
    var past         = '';
    var i;

    for (i in relativeTime.future) {
        if (relativeTime.future.hasOwnProperty(i)) {
            future += ' ' + i + ' {' +
                relativeTime.future[i].replace('{0}', '#') + '}';
        }
    }

    for (i in relativeTime.past) {
        if (relativeTime.past.hasOwnProperty(i)) {
            past += ' ' + i + ' {' +
                relativeTime.past[i].replace('{0}', '#') + '}';
        }
    }

    var message = '{when, select, future {{0, plural, ' + future + '}}' +
                                 'past {{0, plural, ' + past + '}}}';

    // Create the synthetic IntlMessageFormat instance using the original
    // locales value specified by the user when constructing the the parent
    // IntlRelativeFormat instance.
    return new intl$messageformat$$["default"](message, locales);
};

RelativeFormat.prototype._getMessage = function (units) {
    var messages = this._messages;

    // Create a new synthetic message based on the locale data from CLDR.
    if (!messages[units]) {
        messages[units] = this._compileMessage(units);
    }

    return messages[units];
};

RelativeFormat.prototype._getRelativeUnits = function (diff, units) {
    var field = this._fields[units];

    if (field.relative) {
        return field.relative[diff];
    }
};

RelativeFormat.prototype._findFields = function (locale) {
    var localeData = RelativeFormat.__localeData__;
    var data       = localeData[locale.toLowerCase()];

    // The locale data is de-duplicated, so we have to traverse the locale's
    // hierarchy until we find `fields` to return.
    while (data) {
        if (data.fields) {
            return data.fields;
        }

        data = data.parentLocale && localeData[data.parentLocale.toLowerCase()];
    }

    throw new Error(
        'Locale data added to IntlRelativeFormat is missing `fields` for :' +
        locale
    );
};

RelativeFormat.prototype._format = function (date, options) {
    var now = options && options.now !== undefined ? options.now : src$es5$$.dateNow();

    if (date === undefined) {
        date = now;
    }

    // Determine if the `date` and optional `now` values are valid, and throw a
    // similar error to what `Intl.DateTimeFormat#format()` would throw.
    if (!isFinite(now)) {
        throw new RangeError(
            'The `now` option provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    if (!isFinite(date)) {
        throw new RangeError(
            'The date value provided to IntlRelativeFormat#format() is not ' +
            'in valid range.'
        );
    }

    var diffReport  = src$diff$$["default"](now, date);
    var units       = this._options.units || this._selectUnits(diffReport);
    var diffInUnits = diffReport[units];

    if (this._options.style !== 'numeric') {
        var relativeUnits = this._getRelativeUnits(diffInUnits, units);
        if (relativeUnits) {
            return relativeUnits;
        }
    }

    return this._getMessage(units).format({
        '0' : Math.abs(diffInUnits),
        when: diffInUnits < 0 ? 'past' : 'future'
    });
};

RelativeFormat.prototype._isValidUnits = function (units) {
    if (!units || src$es5$$.arrIndexOf.call(FIELDS, units) >= 0) {
        return true;
    }

    if (typeof units === 'string') {
        var suggestion = /s$/.test(units) && units.substr(0, units.length - 1);
        if (suggestion && src$es5$$.arrIndexOf.call(FIELDS, suggestion) >= 0) {
            throw new Error(
                '"' + units + '" is not a valid IntlRelativeFormat `units` ' +
                'value, did you mean: ' + suggestion
            );
        }
    }

    throw new Error(
        '"' + units + '" is not a valid IntlRelativeFormat `units` value, it ' +
        'must be one of: "' + FIELDS.join('", "') + '"'
    );
};

RelativeFormat.prototype._resolveLocale = function (locales) {
    if (typeof locales === 'string') {
        locales = [locales];
    }

    // Create a copy of the array so we can push on the default locale.
    locales = (locales || []).concat(RelativeFormat.defaultLocale);

    var localeData = RelativeFormat.__localeData__;
    var i, len, localeParts, data;

    // Using the set of locales + the default locale, we look for the first one
    // which that has been registered. When data does not exist for a locale, we
    // traverse its ancestors to find something that's been registered within
    // its hierarchy of locales. Since we lack the proper `parentLocale` data
    // here, we must take a naive approach to traversal.
    for (i = 0, len = locales.length; i < len; i += 1) {
        localeParts = locales[i].toLowerCase().split('-');

        while (localeParts.length) {
            data = localeData[localeParts.join('-')];
            if (data) {
                // Return the normalized locale string; e.g., we return "en-US",
                // instead of "en-us".
                return data.locale;
            }

            localeParts.pop();
        }
    }

    var defaultLocale = locales.pop();
    throw new Error(
        'No locale data has been added to IntlRelativeFormat for: ' +
        locales.join(', ') + ', or the default locale: ' + defaultLocale
    );
};

RelativeFormat.prototype._resolveStyle = function (style) {
    // Default to "best fit" style.
    if (!style) {
        return STYLES[0];
    }

    if (src$es5$$.arrIndexOf.call(STYLES, style) >= 0) {
        return style;
    }

    throw new Error(
        '"' + style + '" is not a valid IntlRelativeFormat `style` value, it ' +
        'must be one of: "' + STYLES.join('", "') + '"'
    );
};

RelativeFormat.prototype._selectUnits = function (diffReport) {
    var i, l, units;

    for (i = 0, l = FIELDS.length; i < l; i += 1) {
        units = FIELDS[i];

        if (Math.abs(diffReport[units]) < RelativeFormat.thresholds[units]) {
            break;
        }
    }

    return units;
};


},{"./diff":21,"./es5":23,"intl-messageformat":10}],21:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

var round = Math.round;

function daysToYears(days) {
    // 400 years have 146097 days (taking into account leap year rules)
    return days * 400 / 146097;
}

exports["default"] = function (from, to) {
    // Convert to ms timestamps.
    from = +from;
    to   = +to;

    var millisecond = round(to - from),
        second      = round(millisecond / 1000),
        minute      = round(second / 60),
        hour        = round(minute / 60),
        day         = round(hour / 24),
        week        = round(day / 7);

    var rawYears = daysToYears(day),
        month    = round(rawYears * 12),
        year     = round(rawYears);

    return {
        millisecond: millisecond,
        second     : second,
        minute     : minute,
        hour       : hour,
        day        : day,
        week       : week,
        month      : month,
        year       : year
    };
};


},{}],22:[function(require,module,exports){
// GENERATED FILE
"use strict";
exports["default"] = {"locale":"en","pluralRuleFunction":function (n,ord){var s=String(n).split("."),v0=!s[1],t0=Number(s[0])==n,n10=t0&&s[0].slice(-1),n100=t0&&s[0].slice(-2);if(ord)return n10==1&&n100!=11?"one":n10==2&&n100!=12?"two":n10==3&&n100!=13?"few":"other";return n==1&&v0?"one":"other"},"fields":{"year":{"displayName":"year","relative":{"0":"this year","1":"next year","-1":"last year"},"relativeTime":{"future":{"one":"in {0} year","other":"in {0} years"},"past":{"one":"{0} year ago","other":"{0} years ago"}}},"month":{"displayName":"month","relative":{"0":"this month","1":"next month","-1":"last month"},"relativeTime":{"future":{"one":"in {0} month","other":"in {0} months"},"past":{"one":"{0} month ago","other":"{0} months ago"}}},"day":{"displayName":"day","relative":{"0":"today","1":"tomorrow","-1":"yesterday"},"relativeTime":{"future":{"one":"in {0} day","other":"in {0} days"},"past":{"one":"{0} day ago","other":"{0} days ago"}}},"hour":{"displayName":"hour","relativeTime":{"future":{"one":"in {0} hour","other":"in {0} hours"},"past":{"one":"{0} hour ago","other":"{0} hours ago"}}},"minute":{"displayName":"minute","relativeTime":{"future":{"one":"in {0} minute","other":"in {0} minutes"},"past":{"one":"{0} minute ago","other":"{0} minutes ago"}}},"second":{"displayName":"second","relative":{"0":"now"},"relativeTime":{"future":{"one":"in {0} second","other":"in {0} seconds"},"past":{"one":"{0} second ago","other":"{0} seconds ago"}}}}};


},{}],23:[function(require,module,exports){
/*
Copyright (c) 2014, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

/* jslint esnext: true */

"use strict";

// Purposely using the same implementation as the Intl.js `Intl` polyfill.
// Copyright 2013 Andy Earnshaw, MIT License

var hop = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var realDefineProp = (function () {
    try { return !!Object.defineProperty({}, 'a', {}); }
    catch (e) { return false; }
})();

var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

var defineProperty = realDefineProp ? Object.defineProperty :
        function (obj, name, desc) {

    if ('get' in desc && obj.__defineGetter__) {
        obj.__defineGetter__(name, desc.get);
    } else if (!hop.call(obj, name) || 'value' in desc) {
        obj[name] = desc.value;
    }
};

var objCreate = Object.create || function (proto, props) {
    var obj, k;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (k in props) {
        if (hop.call(props, k)) {
            defineProperty(obj, k, props[k]);
        }
    }

    return obj;
};

var arrIndexOf = Array.prototype.indexOf || function (search, fromIndex) {
    /*jshint validthis:true */
    var arr = this;
    if (!arr.length) {
        return -1;
    }

    for (var i = fromIndex || 0, max = arr.length; i < max; i++) {
        if (arr[i] === search) {
            return i;
        }
    }

    return -1;
};

var isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[object Array]';
};

var dateNow = Date.now || function () {
    return new Date().getTime();
};
exports.defineProperty = defineProperty, exports.objCreate = objCreate, exports.arrIndexOf = arrIndexOf, exports.isArray = isArray, exports.dateNow = dateNow;


},{}],24:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./core":20,"./en":22,"dup":15}],25:[function(require,module,exports){
(function (global){
// Expose `IntlPolyfill` as global to add locale data into runtime later on.
global.IntlPolyfill = require('./lib/core.js');

// Require all locale data for `Intl`. This module will be
// ignored when bundling for the browser with Browserify/Webpack.
require('./locale-data/complete.js');

// hack to export the polyfill as global Intl if needed
if (!global.Intl) {
    global.Intl = global.IntlPolyfill;
    global.IntlPolyfill.__applyLocaleSensitivePrototypes();
}

// providing an idiomatic api for the nodejs version of this module
module.exports = global.IntlPolyfill;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lib/core.js":26,"./locale-data/complete.js":2}],26:[function(require,module,exports){
(function (global){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
};

var jsx = function () {
  var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  return function createRawReactElement(type, props, key, children) {
    var defaultProps = type && type.defaultProps;
    var childrenLength = arguments.length - 3;

    if (!props && childrenLength !== 0) {
      props = {};
    }

    if (props && defaultProps) {
      for (var propName in defaultProps) {
        if (props[propName] === void 0) {
          props[propName] = defaultProps[propName];
        }
      }
    } else if (!props) {
      props = defaultProps || {};
    }

    if (childrenLength === 1) {
      props.children = children;
    } else if (childrenLength > 1) {
      var childArray = Array(childrenLength);

      for (var i = 0; i < childrenLength; i++) {
        childArray[i] = arguments[i + 3];
      }

      props.children = childArray;
    }

    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: type,
      key: key === undefined ? null : '' + key,
      ref: null,
      props: props,
      _owner: null
    };
  };
}();

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            return step("next", value);
          }, function (err) {
            return step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var defineEnumerableProperties = function (obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  return obj;
};

var defaults = function (obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
};

var defineProperty$1 = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var _instanceof = function (left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
};

var interopRequireDefault = function (obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
};

var interopRequireWildcard = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj.default = obj;
    return newObj;
  }
};

var newArrowCheck = function (innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
};

var objectDestructuringEmpty = function (obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var selfGlobal = typeof global === "undefined" ? self : global;

var set = function set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
};

var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();

var slicedToArrayLoose = function (arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

var taggedTemplateLiteral = function (strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
};

var taggedTemplateLiteralLoose = function (strings, raw) {
  strings.raw = raw;
  return strings;
};

var temporalRef = function (val, name, undef) {
  if (val === undef) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
};

var temporalUndefined = {};

var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};



var babelHelpers$1 = Object.freeze({
  jsx: jsx,
  asyncToGenerator: asyncToGenerator,
  classCallCheck: classCallCheck,
  createClass: createClass,
  defineEnumerableProperties: defineEnumerableProperties,
  defaults: defaults,
  defineProperty: defineProperty$1,
  get: get,
  inherits: inherits,
  interopRequireDefault: interopRequireDefault,
  interopRequireWildcard: interopRequireWildcard,
  newArrowCheck: newArrowCheck,
  objectDestructuringEmpty: objectDestructuringEmpty,
  objectWithoutProperties: objectWithoutProperties,
  possibleConstructorReturn: possibleConstructorReturn,
  selfGlobal: selfGlobal,
  set: set,
  slicedToArray: slicedToArray,
  slicedToArrayLoose: slicedToArrayLoose,
  taggedTemplateLiteral: taggedTemplateLiteral,
  taggedTemplateLiteralLoose: taggedTemplateLiteralLoose,
  temporalRef: temporalRef,
  temporalUndefined: temporalUndefined,
  toArray: toArray,
  toConsumableArray: toConsumableArray,
  typeof: _typeof,
  extends: _extends,
  instanceof: _instanceof
});

var realDefineProp = function () {
    var sentinel = function sentinel() {};
    try {
        Object.defineProperty(sentinel, 'a', {
            get: function get() {
                return 1;
            }
        });
        Object.defineProperty(sentinel, 'prototype', { writable: false });
        return sentinel.a === 1 && sentinel.prototype instanceof Object;
    } catch (e) {
        return false;
    }
}();

// Need a workaround for getters in ES3
var es3 = !realDefineProp && !Object.prototype.__defineGetter__;

// We use this a lot (and need it for proto-less objects)
var hop = Object.prototype.hasOwnProperty;

// Naive defineProperty for compatibility
var defineProperty = realDefineProp ? Object.defineProperty : function (obj, name, desc) {
    if ('get' in desc && obj.__defineGetter__) obj.__defineGetter__(name, desc.get);else if (!hop.call(obj, name) || 'value' in desc) obj[name] = desc.value;
};

// Array.prototype.indexOf, as good as we need it to be
var arrIndexOf = Array.prototype.indexOf || function (search) {
    /*jshint validthis:true */
    var t = this;
    if (!t.length) return -1;

    for (var i = arguments[1] || 0, max = t.length; i < max; i++) {
        if (t[i] === search) return i;
    }

    return -1;
};

// Create an object with the specified prototype (2nd arg required for Record)
var objCreate = Object.create || function (proto, props) {
    var obj = void 0;

    function F() {}
    F.prototype = proto;
    obj = new F();

    for (var k in props) {
        if (hop.call(props, k)) defineProperty(obj, k, props[k]);
    }

    return obj;
};

// Snapshot some (hopefully still) native built-ins
var arrSlice = Array.prototype.slice;
var arrConcat = Array.prototype.concat;
var arrPush = Array.prototype.push;
var arrJoin = Array.prototype.join;
var arrShift = Array.prototype.shift;

// Naive Function.prototype.bind for compatibility
var fnBind = Function.prototype.bind || function (thisObj) {
    var fn = this,
        args = arrSlice.call(arguments, 1);

    // All our (presently) bound functions have either 1 or 0 arguments. By returning
    // different function signatures, we can pass some tests in ES3 environments
    if (fn.length === 1) {
        return function () {
            return fn.apply(thisObj, arrConcat.call(args, arrSlice.call(arguments)));
        };
    }
    return function () {
        return fn.apply(thisObj, arrConcat.call(args, arrSlice.call(arguments)));
    };
};

// Object housing internal properties for constructors
var internals = objCreate(null);

// Keep internal properties internal
var secret = Math.random();

// Helper functions
// ================

/**
 * A function to deal with the inaccuracy of calculating log10 in pre-ES6
 * JavaScript environments. Math.log(num) / Math.LN10 was responsible for
 * causing issue #62.
 */
function log10Floor(n) {
    // ES6 provides the more accurate Math.log10
    if (typeof Math.log10 === 'function') return Math.floor(Math.log10(n));

    var x = Math.round(Math.log(n) * Math.LOG10E);
    return x - (Number('1e' + x) > n);
}

/**
 * A map that doesn't contain Object in its prototype chain
 */
function Record(obj) {
    // Copy only own properties over unless this object is already a Record instance
    for (var k in obj) {
        if (obj instanceof Record || hop.call(obj, k)) defineProperty(this, k, { value: obj[k], enumerable: true, writable: true, configurable: true });
    }
}
Record.prototype = objCreate(null);

/**
 * An ordered list
 */
function List() {
    defineProperty(this, 'length', { writable: true, value: 0 });

    if (arguments.length) arrPush.apply(this, arrSlice.call(arguments));
}
List.prototype = objCreate(null);

/**
 * Constructs a regular expression to restore tainted RegExp properties
 */
function createRegExpRestore() {
    if (internals.disableRegExpRestore) {
        return function () {/* no-op */};
    }

    var regExpCache = {
        lastMatch: RegExp.lastMatch || '',
        leftContext: RegExp.leftContext,
        multiline: RegExp.multiline,
        input: RegExp.input
    },
        has = false;

    // Create a snapshot of all the 'captured' properties
    for (var i = 1; i <= 9; i++) {
        has = (regExpCache['$' + i] = RegExp['$' + i]) || has;
    }return function () {
        // Now we've snapshotted some properties, escape the lastMatch string
        var esc = /[.?*+^$[\]\\(){}|-]/g,
            lm = regExpCache.lastMatch.replace(esc, '\\$&'),
            reg = new List();

        // If any of the captured strings were non-empty, iterate over them all
        if (has) {
            for (var _i = 1; _i <= 9; _i++) {
                var m = regExpCache['$' + _i];

                // If it's empty, add an empty capturing group
                if (!m) lm = '()' + lm;

                // Else find the string in lm and escape & wrap it to capture it
                else {
                        m = m.replace(esc, '\\$&');
                        lm = lm.replace(m, '(' + m + ')');
                    }

                // Push it to the reg and chop lm to make sure further groups come after
                arrPush.call(reg, lm.slice(0, lm.indexOf('(') + 1));
                lm = lm.slice(lm.indexOf('(') + 1);
            }
        }

        var exprStr = arrJoin.call(reg, '') + lm;

        // Shorten the regex by replacing each part of the expression with a match
        // for a string of that exact length.  This is safe for the type of
        // expressions generated above, because the expression matches the whole
        // match string, so we know each group and each segment between capturing
        // groups can be matched by its length alone.
        exprStr = exprStr.replace(/(\\\(|\\\)|[^()])+/g, function (match) {
            return '[\\s\\S]{' + match.replace('\\', '').length + '}';
        });

        // Create the regular expression that will reconstruct the RegExp properties
        var expr = new RegExp(exprStr, regExpCache.multiline ? 'gm' : 'g');

        // Set the lastIndex of the generated expression to ensure that the match
        // is found in the correct index.
        expr.lastIndex = regExpCache.leftContext.length;

        expr.exec(regExpCache.input);
    };
}

/**
 * Mimics ES5's abstract ToObject() function
 */
function toObject(arg) {
    if (arg === null) throw new TypeError('Cannot convert null or undefined to object');

    if ((typeof arg === 'undefined' ? 'undefined' : babelHelpers$1['typeof'](arg)) === 'object') return arg;
    return Object(arg);
}

function toNumber(arg) {
    if (typeof arg === 'number') return arg;
    return Number(arg);
}

function toInteger(arg) {
    var number = toNumber(arg);
    if (isNaN(number)) return 0;
    if (number === +0 || number === -0 || number === +Infinity || number === -Infinity) return number;
    if (number < 0) return Math.floor(Math.abs(number)) * -1;
    return Math.floor(Math.abs(number));
}

function toLength(arg) {
    var len = toInteger(arg);
    if (len <= 0) return 0;
    if (len === Infinity) return Math.pow(2, 53) - 1;
    return Math.min(len, Math.pow(2, 53) - 1);
}

/**
 * Returns "internal" properties for an object
 */
function getInternalProperties(obj) {
    if (hop.call(obj, '__getInternalProperties')) return obj.__getInternalProperties(secret);

    return objCreate(null);
}

/**
* Defines regular expressions for various operations related to the BCP 47 syntax,
* as defined at http://tools.ietf.org/html/bcp47#section-2.1
*/

// extlang       = 3ALPHA              ; selected ISO 639 codes
//                 *2("-" 3ALPHA)      ; permanently reserved
var extlang = '[a-z]{3}(?:-[a-z]{3}){0,2}';

// language      = 2*3ALPHA            ; shortest ISO 639 code
//                 ["-" extlang]       ; sometimes followed by
//                                     ; extended language subtags
//               / 4ALPHA              ; or reserved for future use
//               / 5*8ALPHA            ; or registered language subtag
var language = '(?:[a-z]{2,3}(?:-' + extlang + ')?|[a-z]{4}|[a-z]{5,8})';

// script        = 4ALPHA              ; ISO 15924 code
var script = '[a-z]{4}';

// region        = 2ALPHA              ; ISO 3166-1 code
//               / 3DIGIT              ; UN M.49 code
var region = '(?:[a-z]{2}|\\d{3})';

// variant       = 5*8alphanum         ; registered variants
//               / (DIGIT 3alphanum)
var variant = '(?:[a-z0-9]{5,8}|\\d[a-z0-9]{3})';

//                                     ; Single alphanumerics
//                                     ; "x" reserved for private use
// singleton     = DIGIT               ; 0 - 9
//               / %x41-57             ; A - W
//               / %x59-5A             ; Y - Z
//               / %x61-77             ; a - w
//               / %x79-7A             ; y - z
var singleton = '[0-9a-wy-z]';

// extension     = singleton 1*("-" (2*8alphanum))
var extension = singleton + '(?:-[a-z0-9]{2,8})+';

// privateuse    = "x" 1*("-" (1*8alphanum))
var privateuse = 'x(?:-[a-z0-9]{1,8})+';

// irregular     = "en-GB-oed"         ; irregular tags do not match
//               / "i-ami"             ; the 'langtag' production and
//               / "i-bnn"             ; would not otherwise be
//               / "i-default"         ; considered 'well-formed'
//               / "i-enochian"        ; These tags are all valid,
//               / "i-hak"             ; but most are deprecated
//               / "i-klingon"         ; in favor of more modern
//               / "i-lux"             ; subtags or subtag
//               / "i-mingo"           ; combination
//               / "i-navajo"
//               / "i-pwn"
//               / "i-tao"
//               / "i-tay"
//               / "i-tsu"
//               / "sgn-BE-FR"
//               / "sgn-BE-NL"
//               / "sgn-CH-DE"
var irregular = '(?:en-GB-oed' + '|i-(?:ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu)' + '|sgn-(?:BE-FR|BE-NL|CH-DE))';

// regular       = "art-lojban"        ; these tags match the 'langtag'
//               / "cel-gaulish"       ; production, but their subtags
//               / "no-bok"            ; are not extended language
//               / "no-nyn"            ; or variant subtags: their meaning
//               / "zh-guoyu"          ; is defined by their registration
//               / "zh-hakka"          ; and all of these are deprecated
//               / "zh-min"            ; in favor of a more modern
//               / "zh-min-nan"        ; subtag or sequence of subtags
//               / "zh-xiang"
var regular = '(?:art-lojban|cel-gaulish|no-bok|no-nyn' + '|zh-(?:guoyu|hakka|min|min-nan|xiang))';

// grandfathered = irregular           ; non-redundant tags registered
//               / regular             ; during the RFC 3066 era
var grandfathered = '(?:' + irregular + '|' + regular + ')';

// langtag       = language
//                 ["-" script]
//                 ["-" region]
//                 *("-" variant)
//                 *("-" extension)
//                 ["-" privateuse]
var langtag = language + '(?:-' + script + ')?(?:-' + region + ')?(?:-' + variant + ')*(?:-' + extension + ')*(?:-' + privateuse + ')?';

// Language-Tag  = langtag             ; normal language tags
//               / privateuse          ; private use tag
//               / grandfathered       ; grandfathered tags
var expBCP47Syntax = RegExp('^(?:' + langtag + '|' + privateuse + '|' + grandfathered + ')$', 'i');

// Match duplicate variants in a language tag
var expVariantDupes = RegExp('^(?!x).*?-(' + variant + ')-(?:\\w{4,8}-(?!x-))*\\1\\b', 'i');

// Match duplicate singletons in a language tag (except in private use)
var expSingletonDupes = RegExp('^(?!x).*?-(' + singleton + ')-(?:\\w+-(?!x-))*\\1\\b', 'i');

// Match all extension sequences
var expExtSequences = RegExp('-' + extension, 'ig');

// Default locale is the first-added locale data for us
var defaultLocale = void 0;
function setDefaultLocale(locale) {
    defaultLocale = locale;
}

// IANA Subtag Registry redundant tag and subtag maps
var redundantTags = {
    tags: {
        "art-lojban": "jbo",
        "i-ami": "ami",
        "i-bnn": "bnn",
        "i-hak": "hak",
        "i-klingon": "tlh",
        "i-lux": "lb",
        "i-navajo": "nv",
        "i-pwn": "pwn",
        "i-tao": "tao",
        "i-tay": "tay",
        "i-tsu": "tsu",
        "no-bok": "nb",
        "no-nyn": "nn",
        "sgn-BE-FR": "sfb",
        "sgn-BE-NL": "vgt",
        "sgn-CH-DE": "sgg",
        "zh-guoyu": "cmn",
        "zh-hakka": "hak",
        "zh-min-nan": "nan",
        "zh-xiang": "hsn",
        "sgn-BR": "bzs",
        "sgn-CO": "csn",
        "sgn-DE": "gsg",
        "sgn-DK": "dsl",
        "sgn-ES": "ssp",
        "sgn-FR": "fsl",
        "sgn-GB": "bfi",
        "sgn-GR": "gss",
        "sgn-IE": "isg",
        "sgn-IT": "ise",
        "sgn-JP": "jsl",
        "sgn-MX": "mfs",
        "sgn-NI": "ncs",
        "sgn-NL": "dse",
        "sgn-NO": "nsl",
        "sgn-PT": "psr",
        "sgn-SE": "swl",
        "sgn-US": "ase",
        "sgn-ZA": "sfs",
        "zh-cmn": "cmn",
        "zh-cmn-Hans": "cmn-Hans",
        "zh-cmn-Hant": "cmn-Hant",
        "zh-gan": "gan",
        "zh-wuu": "wuu",
        "zh-yue": "yue"
    },
    subtags: {
        BU: "MM",
        DD: "DE",
        FX: "FR",
        TP: "TL",
        YD: "YE",
        ZR: "CD",
        heploc: "alalc97",
        'in': "id",
        iw: "he",
        ji: "yi",
        jw: "jv",
        mo: "ro",
        ayx: "nun",
        bjd: "drl",
        ccq: "rki",
        cjr: "mom",
        cka: "cmr",
        cmk: "xch",
        drh: "khk",
        drw: "prs",
        gav: "dev",
        hrr: "jal",
        ibi: "opa",
        kgh: "kml",
        lcq: "ppr",
        mst: "mry",
        myt: "mry",
        sca: "hle",
        tie: "ras",
        tkk: "twm",
        tlw: "weo",
        tnf: "prs",
        ybd: "rki",
        yma: "lrr"
    },
    extLang: {
        aao: ["aao", "ar"],
        abh: ["abh", "ar"],
        abv: ["abv", "ar"],
        acm: ["acm", "ar"],
        acq: ["acq", "ar"],
        acw: ["acw", "ar"],
        acx: ["acx", "ar"],
        acy: ["acy", "ar"],
        adf: ["adf", "ar"],
        ads: ["ads", "sgn"],
        aeb: ["aeb", "ar"],
        aec: ["aec", "ar"],
        aed: ["aed", "sgn"],
        aen: ["aen", "sgn"],
        afb: ["afb", "ar"],
        afg: ["afg", "sgn"],
        ajp: ["ajp", "ar"],
        apc: ["apc", "ar"],
        apd: ["apd", "ar"],
        arb: ["arb", "ar"],
        arq: ["arq", "ar"],
        ars: ["ars", "ar"],
        ary: ["ary", "ar"],
        arz: ["arz", "ar"],
        ase: ["ase", "sgn"],
        asf: ["asf", "sgn"],
        asp: ["asp", "sgn"],
        asq: ["asq", "sgn"],
        asw: ["asw", "sgn"],
        auz: ["auz", "ar"],
        avl: ["avl", "ar"],
        ayh: ["ayh", "ar"],
        ayl: ["ayl", "ar"],
        ayn: ["ayn", "ar"],
        ayp: ["ayp", "ar"],
        bbz: ["bbz", "ar"],
        bfi: ["bfi", "sgn"],
        bfk: ["bfk", "sgn"],
        bjn: ["bjn", "ms"],
        bog: ["bog", "sgn"],
        bqn: ["bqn", "sgn"],
        bqy: ["bqy", "sgn"],
        btj: ["btj", "ms"],
        bve: ["bve", "ms"],
        bvl: ["bvl", "sgn"],
        bvu: ["bvu", "ms"],
        bzs: ["bzs", "sgn"],
        cdo: ["cdo", "zh"],
        cds: ["cds", "sgn"],
        cjy: ["cjy", "zh"],
        cmn: ["cmn", "zh"],
        coa: ["coa", "ms"],
        cpx: ["cpx", "zh"],
        csc: ["csc", "sgn"],
        csd: ["csd", "sgn"],
        cse: ["cse", "sgn"],
        csf: ["csf", "sgn"],
        csg: ["csg", "sgn"],
        csl: ["csl", "sgn"],
        csn: ["csn", "sgn"],
        csq: ["csq", "sgn"],
        csr: ["csr", "sgn"],
        czh: ["czh", "zh"],
        czo: ["czo", "zh"],
        doq: ["doq", "sgn"],
        dse: ["dse", "sgn"],
        dsl: ["dsl", "sgn"],
        dup: ["dup", "ms"],
        ecs: ["ecs", "sgn"],
        esl: ["esl", "sgn"],
        esn: ["esn", "sgn"],
        eso: ["eso", "sgn"],
        eth: ["eth", "sgn"],
        fcs: ["fcs", "sgn"],
        fse: ["fse", "sgn"],
        fsl: ["fsl", "sgn"],
        fss: ["fss", "sgn"],
        gan: ["gan", "zh"],
        gds: ["gds", "sgn"],
        gom: ["gom", "kok"],
        gse: ["gse", "sgn"],
        gsg: ["gsg", "sgn"],
        gsm: ["gsm", "sgn"],
        gss: ["gss", "sgn"],
        gus: ["gus", "sgn"],
        hab: ["hab", "sgn"],
        haf: ["haf", "sgn"],
        hak: ["hak", "zh"],
        hds: ["hds", "sgn"],
        hji: ["hji", "ms"],
        hks: ["hks", "sgn"],
        hos: ["hos", "sgn"],
        hps: ["hps", "sgn"],
        hsh: ["hsh", "sgn"],
        hsl: ["hsl", "sgn"],
        hsn: ["hsn", "zh"],
        icl: ["icl", "sgn"],
        ils: ["ils", "sgn"],
        inl: ["inl", "sgn"],
        ins: ["ins", "sgn"],
        ise: ["ise", "sgn"],
        isg: ["isg", "sgn"],
        isr: ["isr", "sgn"],
        jak: ["jak", "ms"],
        jax: ["jax", "ms"],
        jcs: ["jcs", "sgn"],
        jhs: ["jhs", "sgn"],
        jls: ["jls", "sgn"],
        jos: ["jos", "sgn"],
        jsl: ["jsl", "sgn"],
        jus: ["jus", "sgn"],
        kgi: ["kgi", "sgn"],
        knn: ["knn", "kok"],
        kvb: ["kvb", "ms"],
        kvk: ["kvk", "sgn"],
        kvr: ["kvr", "ms"],
        kxd: ["kxd", "ms"],
        lbs: ["lbs", "sgn"],
        lce: ["lce", "ms"],
        lcf: ["lcf", "ms"],
        liw: ["liw", "ms"],
        lls: ["lls", "sgn"],
        lsg: ["lsg", "sgn"],
        lsl: ["lsl", "sgn"],
        lso: ["lso", "sgn"],
        lsp: ["lsp", "sgn"],
        lst: ["lst", "sgn"],
        lsy: ["lsy", "sgn"],
        ltg: ["ltg", "lv"],
        lvs: ["lvs", "lv"],
        lzh: ["lzh", "zh"],
        max: ["max", "ms"],
        mdl: ["mdl", "sgn"],
        meo: ["meo", "ms"],
        mfa: ["mfa", "ms"],
        mfb: ["mfb", "ms"],
        mfs: ["mfs", "sgn"],
        min: ["min", "ms"],
        mnp: ["mnp", "zh"],
        mqg: ["mqg", "ms"],
        mre: ["mre", "sgn"],
        msd: ["msd", "sgn"],
        msi: ["msi", "ms"],
        msr: ["msr", "sgn"],
        mui: ["mui", "ms"],
        mzc: ["mzc", "sgn"],
        mzg: ["mzg", "sgn"],
        mzy: ["mzy", "sgn"],
        nan: ["nan", "zh"],
        nbs: ["nbs", "sgn"],
        ncs: ["ncs", "sgn"],
        nsi: ["nsi", "sgn"],
        nsl: ["nsl", "sgn"],
        nsp: ["nsp", "sgn"],
        nsr: ["nsr", "sgn"],
        nzs: ["nzs", "sgn"],
        okl: ["okl", "sgn"],
        orn: ["orn", "ms"],
        ors: ["ors", "ms"],
        pel: ["pel", "ms"],
        pga: ["pga", "ar"],
        pks: ["pks", "sgn"],
        prl: ["prl", "sgn"],
        prz: ["prz", "sgn"],
        psc: ["psc", "sgn"],
        psd: ["psd", "sgn"],
        pse: ["pse", "ms"],
        psg: ["psg", "sgn"],
        psl: ["psl", "sgn"],
        pso: ["pso", "sgn"],
        psp: ["psp", "sgn"],
        psr: ["psr", "sgn"],
        pys: ["pys", "sgn"],
        rms: ["rms", "sgn"],
        rsi: ["rsi", "sgn"],
        rsl: ["rsl", "sgn"],
        sdl: ["sdl", "sgn"],
        sfb: ["sfb", "sgn"],
        sfs: ["sfs", "sgn"],
        sgg: ["sgg", "sgn"],
        sgx: ["sgx", "sgn"],
        shu: ["shu", "ar"],
        slf: ["slf", "sgn"],
        sls: ["sls", "sgn"],
        sqk: ["sqk", "sgn"],
        sqs: ["sqs", "sgn"],
        ssh: ["ssh", "ar"],
        ssp: ["ssp", "sgn"],
        ssr: ["ssr", "sgn"],
        svk: ["svk", "sgn"],
        swc: ["swc", "sw"],
        swh: ["swh", "sw"],
        swl: ["swl", "sgn"],
        syy: ["syy", "sgn"],
        tmw: ["tmw", "ms"],
        tse: ["tse", "sgn"],
        tsm: ["tsm", "sgn"],
        tsq: ["tsq", "sgn"],
        tss: ["tss", "sgn"],
        tsy: ["tsy", "sgn"],
        tza: ["tza", "sgn"],
        ugn: ["ugn", "sgn"],
        ugy: ["ugy", "sgn"],
        ukl: ["ukl", "sgn"],
        uks: ["uks", "sgn"],
        urk: ["urk", "ms"],
        uzn: ["uzn", "uz"],
        uzs: ["uzs", "uz"],
        vgt: ["vgt", "sgn"],
        vkk: ["vkk", "ms"],
        vkt: ["vkt", "ms"],
        vsi: ["vsi", "sgn"],
        vsl: ["vsl", "sgn"],
        vsv: ["vsv", "sgn"],
        wuu: ["wuu", "zh"],
        xki: ["xki", "sgn"],
        xml: ["xml", "sgn"],
        xmm: ["xmm", "ms"],
        xms: ["xms", "sgn"],
        yds: ["yds", "sgn"],
        ysl: ["ysl", "sgn"],
        yue: ["yue", "zh"],
        zib: ["zib", "sgn"],
        zlm: ["zlm", "ms"],
        zmi: ["zmi", "ms"],
        zsl: ["zsl", "sgn"],
        zsm: ["zsm", "ms"]
    }
};

/**
 * Convert only a-z to uppercase as per section 6.1 of the spec
 */
function toLatinUpperCase(str) {
    var i = str.length;

    while (i--) {
        var ch = str.charAt(i);

        if (ch >= "a" && ch <= "z") str = str.slice(0, i) + ch.toUpperCase() + str.slice(i + 1);
    }

    return str;
}

/**
 * The IsStructurallyValidLanguageTag abstract operation verifies that the locale
 * argument (which must be a String value)
 *
 * - represents a well-formed BCP 47 language tag as specified in RFC 5646 section
 *   2.1, or successor,
 * - does not include duplicate variant subtags, and
 * - does not include duplicate singleton subtags.
 *
 * The abstract operation returns true if locale can be generated from the ABNF
 * grammar in section 2.1 of the RFC, starting with Language-Tag, and does not
 * contain duplicate variant or singleton subtags (other than as a private use
 * subtag). It returns false otherwise. Terminal value characters in the grammar are
 * interpreted as the Unicode equivalents of the ASCII octet values given.
 */
function /* 6.2.2 */IsStructurallyValidLanguageTag(locale) {
    // represents a well-formed BCP 47 language tag as specified in RFC 5646
    if (!expBCP47Syntax.test(locale)) return false;

    // does not include duplicate variant subtags, and
    if (expVariantDupes.test(locale)) return false;

    // does not include duplicate singleton subtags.
    if (expSingletonDupes.test(locale)) return false;

    return true;
}

/**
 * The CanonicalizeLanguageTag abstract operation returns the canonical and case-
 * regularized form of the locale argument (which must be a String value that is
 * a structurally valid BCP 47 language tag as verified by the
 * IsStructurallyValidLanguageTag abstract operation). It takes the steps
 * specified in RFC 5646 section 4.5, or successor, to bring the language tag
 * into canonical form, and to regularize the case of the subtags, but does not
 * take the steps to bring a language tag into “extlang form” and to reorder
 * variant subtags.

 * The specifications for extensions to BCP 47 language tags, such as RFC 6067,
 * may include canonicalization rules for the extension subtag sequences they
 * define that go beyond the canonicalization rules of RFC 5646 section 4.5.
 * Implementations are allowed, but not required, to apply these additional rules.
 */
function /* 6.2.3 */CanonicalizeLanguageTag(locale) {
    var match = void 0,
        parts = void 0;

    // A language tag is in 'canonical form' when the tag is well-formed
    // according to the rules in Sections 2.1 and 2.2

    // Section 2.1 says all subtags use lowercase...
    locale = locale.toLowerCase();

    // ...with 2 exceptions: 'two-letter and four-letter subtags that neither
    // appear at the start of the tag nor occur after singletons.  Such two-letter
    // subtags are all uppercase (as in the tags "en-CA-x-ca" or "sgn-BE-FR") and
    // four-letter subtags are titlecase (as in the tag "az-Latn-x-latn").
    parts = locale.split('-');
    for (var i = 1, max = parts.length; i < max; i++) {
        // Two-letter subtags are all uppercase
        if (parts[i].length === 2) parts[i] = parts[i].toUpperCase();

        // Four-letter subtags are titlecase
        else if (parts[i].length === 4) parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);

            // Is it a singleton?
            else if (parts[i].length === 1 && parts[i] !== 'x') break;
    }
    locale = arrJoin.call(parts, '-');

    // The steps laid out in RFC 5646 section 4.5 are as follows:

    // 1.  Extension sequences are ordered into case-insensitive ASCII order
    //     by singleton subtag.
    if ((match = locale.match(expExtSequences)) && match.length > 1) {
        // The built-in sort() sorts by ASCII order, so use that
        match.sort();

        // Replace all extensions with the joined, sorted array
        locale = locale.replace(RegExp('(?:' + expExtSequences.source + ')+', 'i'), arrJoin.call(match, ''));
    }

    // 2.  Redundant or grandfathered tags are replaced by their 'Preferred-
    //     Value', if there is one.
    if (hop.call(redundantTags.tags, locale)) locale = redundantTags.tags[locale];

    // 3.  Subtags are replaced by their 'Preferred-Value', if there is one.
    //     For extlangs, the original primary language subtag is also
    //     replaced if there is a primary language subtag in the 'Preferred-
    //     Value'.
    parts = locale.split('-');

    for (var _i = 1, _max = parts.length; _i < _max; _i++) {
        if (hop.call(redundantTags.subtags, parts[_i])) parts[_i] = redundantTags.subtags[parts[_i]];else if (hop.call(redundantTags.extLang, parts[_i])) {
            parts[_i] = redundantTags.extLang[parts[_i]][0];

            // For extlang tags, the prefix needs to be removed if it is redundant
            if (_i === 1 && redundantTags.extLang[parts[1]][1] === parts[0]) {
                parts = arrSlice.call(parts, _i++);
                _max -= 1;
            }
        }
    }

    return arrJoin.call(parts, '-');
}

/**
 * The DefaultLocale abstract operation returns a String value representing the
 * structurally valid (6.2.2) and canonicalized (6.2.3) BCP 47 language tag for the
 * host environment’s current locale.
 */
function /* 6.2.4 */DefaultLocale() {
    return defaultLocale;
}

// Sect 6.3 Currency Codes
// =======================

var expCurrencyCode = /^[A-Z]{3}$/;

/**
 * The IsWellFormedCurrencyCode abstract operation verifies that the currency argument
 * (after conversion to a String value) represents a well-formed 3-letter ISO currency
 * code. The following steps are taken:
 */
function /* 6.3.1 */IsWellFormedCurrencyCode(currency) {
    // 1. Let `c` be ToString(currency)
    var c = String(currency);

    // 2. Let `normalized` be the result of mapping c to upper case as described
    //    in 6.1.
    var normalized = toLatinUpperCase(c);

    // 3. If the string length of normalized is not 3, return false.
    // 4. If normalized contains any character that is not in the range "A" to "Z"
    //    (U+0041 to U+005A), return false.
    if (expCurrencyCode.test(normalized) === false) return false;

    // 5. Return true
    return true;
}

var expUnicodeExSeq = /-u(?:-[0-9a-z]{2,8})+/gi; // See `extension` below

function /* 9.2.1 */CanonicalizeLocaleList(locales) {
    // The abstract operation CanonicalizeLocaleList takes the following steps:

    // 1. If locales is undefined, then a. Return a new empty List
    if (locales === undefined) return new List();

    // 2. Let seen be a new empty List.
    var seen = new List();

    // 3. If locales is a String value, then
    //    a. Let locales be a new array created as if by the expression new
    //    Array(locales) where Array is the standard built-in constructor with
    //    that name and locales is the value of locales.
    locales = typeof locales === 'string' ? [locales] : locales;

    // 4. Let O be ToObject(locales).
    var O = toObject(locales);

    // 5. Let lenValue be the result of calling the [[Get]] internal method of
    //    O with the argument "length".
    // 6. Let len be ToUint32(lenValue).
    var len = toLength(O.length);

    // 7. Let k be 0.
    var k = 0;

    // 8. Repeat, while k < len
    while (k < len) {
        // a. Let Pk be ToString(k).
        var Pk = String(k);

        // b. Let kPresent be the result of calling the [[HasProperty]] internal
        //    method of O with argument Pk.
        var kPresent = Pk in O;

        // c. If kPresent is true, then
        if (kPresent) {
            // i. Let kValue be the result of calling the [[Get]] internal
            //     method of O with argument Pk.
            var kValue = O[Pk];

            // ii. If the type of kValue is not String or Object, then throw a
            //     TypeError exception.
            if (kValue === null || typeof kValue !== 'string' && (typeof kValue === "undefined" ? "undefined" : babelHelpers$1["typeof"](kValue)) !== 'object') throw new TypeError('String or Object type expected');

            // iii. Let tag be ToString(kValue).
            var tag = String(kValue);

            // iv. If the result of calling the abstract operation
            //     IsStructurallyValidLanguageTag (defined in 6.2.2), passing tag as
            //     the argument, is false, then throw a RangeError exception.
            if (!IsStructurallyValidLanguageTag(tag)) throw new RangeError("'" + tag + "' is not a structurally valid language tag");

            // v. Let tag be the result of calling the abstract operation
            //    CanonicalizeLanguageTag (defined in 6.2.3), passing tag as the
            //    argument.
            tag = CanonicalizeLanguageTag(tag);

            // vi. If tag is not an element of seen, then append tag as the last
            //     element of seen.
            if (arrIndexOf.call(seen, tag) === -1) arrPush.call(seen, tag);
        }

        // d. Increase k by 1.
        k++;
    }

    // 9. Return seen.
    return seen;
}

/**
 * The BestAvailableLocale abstract operation compares the provided argument
 * locale, which must be a String value with a structurally valid and
 * canonicalized BCP 47 language tag, against the locales in availableLocales and
 * returns either the longest non-empty prefix of locale that is an element of
 * availableLocales, or undefined if there is no such element. It uses the
 * fallback mechanism of RFC 4647, section 3.4. The following steps are taken:
 */
function /* 9.2.2 */BestAvailableLocale(availableLocales, locale) {
    // 1. Let candidate be locale
    var candidate = locale;

    // 2. Repeat
    while (candidate) {
        // a. If availableLocales contains an element equal to candidate, then return
        // candidate.
        if (arrIndexOf.call(availableLocales, candidate) > -1) return candidate;

        // b. Let pos be the character index of the last occurrence of "-"
        // (U+002D) within candidate. If that character does not occur, return
        // undefined.
        var pos = candidate.lastIndexOf('-');

        if (pos < 0) return;

        // c. If pos ≥ 2 and the character "-" occurs at index pos-2 of candidate,
        //    then decrease pos by 2.
        if (pos >= 2 && candidate.charAt(pos - 2) === '-') pos -= 2;

        // d. Let candidate be the substring of candidate from position 0, inclusive,
        //    to position pos, exclusive.
        candidate = candidate.substring(0, pos);
    }
}

/**
 * The LookupMatcher abstract operation compares requestedLocales, which must be
 * a List as returned by CanonicalizeLocaleList, against the locales in
 * availableLocales and determines the best available language to meet the
 * request. The following steps are taken:
 */
function /* 9.2.3 */LookupMatcher(availableLocales, requestedLocales) {
    // 1. Let i be 0.
    var i = 0;

    // 2. Let len be the number of elements in requestedLocales.
    var len = requestedLocales.length;

    // 3. Let availableLocale be undefined.
    var availableLocale = void 0;

    var locale = void 0,
        noExtensionsLocale = void 0;

    // 4. Repeat while i < len and availableLocale is undefined:
    while (i < len && !availableLocale) {
        // a. Let locale be the element of requestedLocales at 0-origined list
        //    position i.
        locale = requestedLocales[i];

        // b. Let noExtensionsLocale be the String value that is locale with all
        //    Unicode locale extension sequences removed.
        noExtensionsLocale = String(locale).replace(expUnicodeExSeq, '');

        // c. Let availableLocale be the result of calling the
        //    BestAvailableLocale abstract operation (defined in 9.2.2) with
        //    arguments availableLocales and noExtensionsLocale.
        availableLocale = BestAvailableLocale(availableLocales, noExtensionsLocale);

        // d. Increase i by 1.
        i++;
    }

    // 5. Let result be a new Record.
    var result = new Record();

    // 6. If availableLocale is not undefined, then
    if (availableLocale !== undefined) {
        // a. Set result.[[locale]] to availableLocale.
        result['[[locale]]'] = availableLocale;

        // b. If locale and noExtensionsLocale are not the same String value, then
        if (String(locale) !== String(noExtensionsLocale)) {
            // i. Let extension be the String value consisting of the first
            //    substring of locale that is a Unicode locale extension sequence.
            var extension = locale.match(expUnicodeExSeq)[0];

            // ii. Let extensionIndex be the character position of the initial
            //     "-" of the first Unicode locale extension sequence within locale.
            var extensionIndex = locale.indexOf('-u-');

            // iii. Set result.[[extension]] to extension.
            result['[[extension]]'] = extension;

            // iv. Set result.[[extensionIndex]] to extensionIndex.
            result['[[extensionIndex]]'] = extensionIndex;
        }
    }
    // 7. Else
    else
        // a. Set result.[[locale]] to the value returned by the DefaultLocale abstract
        //    operation (defined in 6.2.4).
        result['[[locale]]'] = DefaultLocale();

    // 8. Return result
    return result;
}

/**
 * The BestFitMatcher abstract operation compares requestedLocales, which must be
 * a List as returned by CanonicalizeLocaleList, against the locales in
 * availableLocales and determines the best available language to meet the
 * request. The algorithm is implementation dependent, but should produce results
 * that a typical user of the requested locales would perceive as at least as
 * good as those produced by the LookupMatcher abstract operation. Options
 * specified through Unicode locale extension sequences must be ignored by the
 * algorithm. Information about such subsequences is returned separately.
 * The abstract operation returns a record with a [[locale]] field, whose value
 * is the language tag of the selected locale, which must be an element of
 * availableLocales. If the language tag of the request locale that led to the
 * selected locale contained a Unicode locale extension sequence, then the
 * returned record also contains an [[extension]] field whose value is the first
 * Unicode locale extension sequence, and an [[extensionIndex]] field whose value
 * is the index of the first Unicode locale extension sequence within the request
 * locale language tag.
 */
function /* 9.2.4 */BestFitMatcher(availableLocales, requestedLocales) {
    return LookupMatcher(availableLocales, requestedLocales);
}

/**
 * The ResolveLocale abstract operation compares a BCP 47 language priority list
 * requestedLocales against the locales in availableLocales and determines the
 * best available language to meet the request. availableLocales and
 * requestedLocales must be provided as List values, options as a Record.
 */
function /* 9.2.5 */ResolveLocale(availableLocales, requestedLocales, options, relevantExtensionKeys, localeData) {
    if (availableLocales.length === 0) {
        throw new ReferenceError('No locale data has been provided for this object yet.');
    }

    // The following steps are taken:
    // 1. Let matcher be the value of options.[[localeMatcher]].
    var matcher = options['[[localeMatcher]]'];

    var r = void 0;

    // 2. If matcher is "lookup", then
    if (matcher === 'lookup')
        // a. Let r be the result of calling the LookupMatcher abstract operation
        //    (defined in 9.2.3) with arguments availableLocales and
        //    requestedLocales.
        r = LookupMatcher(availableLocales, requestedLocales);

        // 3. Else
    else
        // a. Let r be the result of calling the BestFitMatcher abstract
        //    operation (defined in 9.2.4) with arguments availableLocales and
        //    requestedLocales.
        r = BestFitMatcher(availableLocales, requestedLocales);

    // 4. Let foundLocale be the value of r.[[locale]].
    var foundLocale = r['[[locale]]'];

    var extensionSubtags = void 0,
        extensionSubtagsLength = void 0;

    // 5. If r has an [[extension]] field, then
    if (hop.call(r, '[[extension]]')) {
        // a. Let extension be the value of r.[[extension]].
        var extension = r['[[extension]]'];
        // b. Let split be the standard built-in function object defined in ES5,
        //    15.5.4.14.
        var split = String.prototype.split;
        // c. Let extensionSubtags be the result of calling the [[Call]] internal
        //    method of split with extension as the this value and an argument
        //    list containing the single item "-".
        extensionSubtags = split.call(extension, '-');
        // d. Let extensionSubtagsLength be the result of calling the [[Get]]
        //    internal method of extensionSubtags with argument "length".
        extensionSubtagsLength = extensionSubtags.length;
    }

    // 6. Let result be a new Record.
    var result = new Record();

    // 7. Set result.[[dataLocale]] to foundLocale.
    result['[[dataLocale]]'] = foundLocale;

    // 8. Let supportedExtension be "-u".
    var supportedExtension = '-u';
    // 9. Let i be 0.
    var i = 0;
    // 10. Let len be the result of calling the [[Get]] internal method of
    //     relevantExtensionKeys with argument "length".
    var len = relevantExtensionKeys.length;

    // 11 Repeat while i < len:
    while (i < len) {
        // a. Let key be the result of calling the [[Get]] internal method of
        //    relevantExtensionKeys with argument ToString(i).
        var key = relevantExtensionKeys[i];
        // b. Let foundLocaleData be the result of calling the [[Get]] internal
        //    method of localeData with the argument foundLocale.
        var foundLocaleData = localeData[foundLocale];
        // c. Let keyLocaleData be the result of calling the [[Get]] internal
        //    method of foundLocaleData with the argument key.
        var keyLocaleData = foundLocaleData[key];
        // d. Let value be the result of calling the [[Get]] internal method of
        //    keyLocaleData with argument "0".
        var value = keyLocaleData['0'];
        // e. Let supportedExtensionAddition be "".
        var supportedExtensionAddition = '';
        // f. Let indexOf be the standard built-in function object defined in
        //    ES5, 15.4.4.14.
        var indexOf = arrIndexOf;

        // g. If extensionSubtags is not undefined, then
        if (extensionSubtags !== undefined) {
            // i. Let keyPos be the result of calling the [[Call]] internal
            //    method of indexOf with extensionSubtags as the this value and
            // an argument list containing the single item key.
            var keyPos = indexOf.call(extensionSubtags, key);

            // ii. If keyPos ≠ -1, then
            if (keyPos !== -1) {
                // 1. If keyPos + 1 < extensionSubtagsLength and the length of the
                //    result of calling the [[Get]] internal method of
                //    extensionSubtags with argument ToString(keyPos +1) is greater
                //    than 2, then
                if (keyPos + 1 < extensionSubtagsLength && extensionSubtags[keyPos + 1].length > 2) {
                    // a. Let requestedValue be the result of calling the [[Get]]
                    //    internal method of extensionSubtags with argument
                    //    ToString(keyPos + 1).
                    var requestedValue = extensionSubtags[keyPos + 1];
                    // b. Let valuePos be the result of calling the [[Call]]
                    //    internal method of indexOf with keyLocaleData as the
                    //    this value and an argument list containing the single
                    //    item requestedValue.
                    var valuePos = indexOf.call(keyLocaleData, requestedValue);

                    // c. If valuePos ≠ -1, then
                    if (valuePos !== -1) {
                        // i. Let value be requestedValue.
                        value = requestedValue,
                        // ii. Let supportedExtensionAddition be the
                        //     concatenation of "-", key, "-", and value.
                        supportedExtensionAddition = '-' + key + '-' + value;
                    }
                }
                // 2. Else
                else {
                        // a. Let valuePos be the result of calling the [[Call]]
                        // internal method of indexOf with keyLocaleData as the this
                        // value and an argument list containing the single item
                        // "true".
                        var _valuePos = indexOf(keyLocaleData, 'true');

                        // b. If valuePos ≠ -1, then
                        if (_valuePos !== -1)
                            // i. Let value be "true".
                            value = 'true';
                    }
            }
        }
        // h. If options has a field [[<key>]], then
        if (hop.call(options, '[[' + key + ']]')) {
            // i. Let optionsValue be the value of options.[[<key>]].
            var optionsValue = options['[[' + key + ']]'];

            // ii. If the result of calling the [[Call]] internal method of indexOf
            //     with keyLocaleData as the this value and an argument list
            //     containing the single item optionsValue is not -1, then
            if (indexOf.call(keyLocaleData, optionsValue) !== -1) {
                // 1. If optionsValue is not equal to value, then
                if (optionsValue !== value) {
                    // a. Let value be optionsValue.
                    value = optionsValue;
                    // b. Let supportedExtensionAddition be "".
                    supportedExtensionAddition = '';
                }
            }
        }
        // i. Set result.[[<key>]] to value.
        result['[[' + key + ']]'] = value;

        // j. Append supportedExtensionAddition to supportedExtension.
        supportedExtension += supportedExtensionAddition;

        // k. Increase i by 1.
        i++;
    }
    // 12. If the length of supportedExtension is greater than 2, then
    if (supportedExtension.length > 2) {
        // a.
        var privateIndex = foundLocale.indexOf("-x-");
        // b.
        if (privateIndex === -1) {
            // i.
            foundLocale = foundLocale + supportedExtension;
        }
        // c.
        else {
                // i.
                var preExtension = foundLocale.substring(0, privateIndex);
                // ii.
                var postExtension = foundLocale.substring(privateIndex);
                // iii.
                foundLocale = preExtension + supportedExtension + postExtension;
            }
        // d. asserting - skipping
        // e.
        foundLocale = CanonicalizeLanguageTag(foundLocale);
    }
    // 13. Set result.[[locale]] to foundLocale.
    result['[[locale]]'] = foundLocale;

    // 14. Return result.
    return result;
}

/**
 * The LookupSupportedLocales abstract operation returns the subset of the
 * provided BCP 47 language priority list requestedLocales for which
 * availableLocales has a matching locale when using the BCP 47 Lookup algorithm.
 * Locales appear in the same order in the returned list as in requestedLocales.
 * The following steps are taken:
 */
function /* 9.2.6 */LookupSupportedLocales(availableLocales, requestedLocales) {
    // 1. Let len be the number of elements in requestedLocales.
    var len = requestedLocales.length;
    // 2. Let subset be a new empty List.
    var subset = new List();
    // 3. Let k be 0.
    var k = 0;

    // 4. Repeat while k < len
    while (k < len) {
        // a. Let locale be the element of requestedLocales at 0-origined list
        //    position k.
        var locale = requestedLocales[k];
        // b. Let noExtensionsLocale be the String value that is locale with all
        //    Unicode locale extension sequences removed.
        var noExtensionsLocale = String(locale).replace(expUnicodeExSeq, '');
        // c. Let availableLocale be the result of calling the
        //    BestAvailableLocale abstract operation (defined in 9.2.2) with
        //    arguments availableLocales and noExtensionsLocale.
        var availableLocale = BestAvailableLocale(availableLocales, noExtensionsLocale);

        // d. If availableLocale is not undefined, then append locale to the end of
        //    subset.
        if (availableLocale !== undefined) arrPush.call(subset, locale);

        // e. Increment k by 1.
        k++;
    }

    // 5. Let subsetArray be a new Array object whose elements are the same
    //    values in the same order as the elements of subset.
    var subsetArray = arrSlice.call(subset);

    // 6. Return subsetArray.
    return subsetArray;
}

/**
 * The BestFitSupportedLocales abstract operation returns the subset of the
 * provided BCP 47 language priority list requestedLocales for which
 * availableLocales has a matching locale when using the Best Fit Matcher
 * algorithm. Locales appear in the same order in the returned list as in
 * requestedLocales. The steps taken are implementation dependent.
 */
function /*9.2.7 */BestFitSupportedLocales(availableLocales, requestedLocales) {
    // ###TODO: implement this function as described by the specification###
    return LookupSupportedLocales(availableLocales, requestedLocales);
}

/**
 * The SupportedLocales abstract operation returns the subset of the provided BCP
 * 47 language priority list requestedLocales for which availableLocales has a
 * matching locale. Two algorithms are available to match the locales: the Lookup
 * algorithm described in RFC 4647 section 3.4, and an implementation dependent
 * best-fit algorithm. Locales appear in the same order in the returned list as
 * in requestedLocales. The following steps are taken:
 */
function /*9.2.8 */SupportedLocales(availableLocales, requestedLocales, options) {
    var matcher = void 0,
        subset = void 0;

    // 1. If options is not undefined, then
    if (options !== undefined) {
        // a. Let options be ToObject(options).
        options = new Record(toObject(options));
        // b. Let matcher be the result of calling the [[Get]] internal method of
        //    options with argument "localeMatcher".
        matcher = options.localeMatcher;

        // c. If matcher is not undefined, then
        if (matcher !== undefined) {
            // i. Let matcher be ToString(matcher).
            matcher = String(matcher);

            // ii. If matcher is not "lookup" or "best fit", then throw a RangeError
            //     exception.
            if (matcher !== 'lookup' && matcher !== 'best fit') throw new RangeError('matcher should be "lookup" or "best fit"');
        }
    }
    // 2. If matcher is undefined or "best fit", then
    if (matcher === undefined || matcher === 'best fit')
        // a. Let subset be the result of calling the BestFitSupportedLocales
        //    abstract operation (defined in 9.2.7) with arguments
        //    availableLocales and requestedLocales.
        subset = BestFitSupportedLocales(availableLocales, requestedLocales);
        // 3. Else
    else
        // a. Let subset be the result of calling the LookupSupportedLocales
        //    abstract operation (defined in 9.2.6) with arguments
        //    availableLocales and requestedLocales.
        subset = LookupSupportedLocales(availableLocales, requestedLocales);

    // 4. For each named own property name P of subset,
    for (var P in subset) {
        if (!hop.call(subset, P)) continue;

        // a. Let desc be the result of calling the [[GetOwnProperty]] internal
        //    method of subset with P.
        // b. Set desc.[[Writable]] to false.
        // c. Set desc.[[Configurable]] to false.
        // d. Call the [[DefineOwnProperty]] internal method of subset with P, desc,
        //    and true as arguments.
        defineProperty(subset, P, {
            writable: false, configurable: false, value: subset[P]
        });
    }
    // "Freeze" the array so no new elements can be added
    defineProperty(subset, 'length', { writable: false });

    // 5. Return subset
    return subset;
}

/**
 * The GetOption abstract operation extracts the value of the property named
 * property from the provided options object, converts it to the required type,
 * checks whether it is one of a List of allowed values, and fills in a fallback
 * value if necessary.
 */
function /*9.2.9 */GetOption(options, property, type, values, fallback) {
    // 1. Let value be the result of calling the [[Get]] internal method of
    //    options with argument property.
    var value = options[property];

    // 2. If value is not undefined, then
    if (value !== undefined) {
        // a. Assert: type is "boolean" or "string".
        // b. If type is "boolean", then let value be ToBoolean(value).
        // c. If type is "string", then let value be ToString(value).
        value = type === 'boolean' ? Boolean(value) : type === 'string' ? String(value) : value;

        // d. If values is not undefined, then
        if (values !== undefined) {
            // i. If values does not contain an element equal to value, then throw a
            //    RangeError exception.
            if (arrIndexOf.call(values, value) === -1) throw new RangeError("'" + value + "' is not an allowed value for `" + property + '`');
        }

        // e. Return value.
        return value;
    }
    // Else return fallback.
    return fallback;
}

/**
 * The GetNumberOption abstract operation extracts a property value from the
 * provided options object, converts it to a Number value, checks whether it is
 * in the allowed range, and fills in a fallback value if necessary.
 */
function /* 9.2.10 */GetNumberOption(options, property, minimum, maximum, fallback) {
    // 1. Let value be the result of calling the [[Get]] internal method of
    //    options with argument property.
    var value = options[property];

    // 2. If value is not undefined, then
    if (value !== undefined) {
        // a. Let value be ToNumber(value).
        value = Number(value);

        // b. If value is NaN or less than minimum or greater than maximum, throw a
        //    RangeError exception.
        if (isNaN(value) || value < minimum || value > maximum) throw new RangeError('Value is not a number or outside accepted range');

        // c. Return floor(value).
        return Math.floor(value);
    }
    // 3. Else return fallback.
    return fallback;
}

// 8 The Intl Object
var Intl = {};

// 8.2 Function Properties of the Intl Object

// 8.2.1
// @spec[tc39/ecma402/master/spec/intl.html]
// @clause[sec-intl.getcanonicallocales]
function getCanonicalLocales(locales) {
    // 1. Let ll be ? CanonicalizeLocaleList(locales).
    var ll = CanonicalizeLocaleList(locales);
    // 2. Return CreateArrayFromList(ll).
    {
        var result = [];

        var len = ll.length;
        var k = 0;

        while (k < len) {
            result[k] = ll[k];
            k++;
        }
        return result;
    }
}

Object.defineProperty(Intl, 'getCanonicalLocales', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: getCanonicalLocales
});

// Currency minor units output from get-4217 grunt task, formatted
var currencyMinorUnits = {
    BHD: 3, BYR: 0, XOF: 0, BIF: 0, XAF: 0, CLF: 4, CLP: 0, KMF: 0, DJF: 0,
    XPF: 0, GNF: 0, ISK: 0, IQD: 3, JPY: 0, JOD: 3, KRW: 0, KWD: 3, LYD: 3,
    OMR: 3, PYG: 0, RWF: 0, TND: 3, UGX: 0, UYI: 0, VUV: 0, VND: 0
};

// Define the NumberFormat constructor internally so it cannot be tainted
function NumberFormatConstructor() {
    var locales = arguments[0];
    var options = arguments[1];

    if (!this || this === Intl) {
        return new Intl.NumberFormat(locales, options);
    }

    return InitializeNumberFormat(toObject(this), locales, options);
}

defineProperty(Intl, 'NumberFormat', {
    configurable: true,
    writable: true,
    value: NumberFormatConstructor
});

// Must explicitly set prototypes as unwritable
defineProperty(Intl.NumberFormat, 'prototype', {
    writable: false
});

/**
 * The abstract operation InitializeNumberFormat accepts the arguments
 * numberFormat (which must be an object), locales, and options. It initializes
 * numberFormat as a NumberFormat object.
 */
function /*11.1.1.1 */InitializeNumberFormat(numberFormat, locales, options) {
    // This will be a internal properties object if we're not already initialized
    var internal = getInternalProperties(numberFormat);

    // Create an object whose props can be used to restore the values of RegExp props
    var regexpRestore = createRegExpRestore();

    // 1. If numberFormat has an [[initializedIntlObject]] internal property with
    // value true, throw a TypeError exception.
    if (internal['[[initializedIntlObject]]'] === true) throw new TypeError('`this` object has already been initialized as an Intl object');

    // Need this to access the `internal` object
    defineProperty(numberFormat, '__getInternalProperties', {
        value: function value() {
            // NOTE: Non-standard, for internal use only
            if (arguments[0] === secret) return internal;
        }
    });

    // 2. Set the [[initializedIntlObject]] internal property of numberFormat to true.
    internal['[[initializedIntlObject]]'] = true;

    // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
    //    abstract operation (defined in 9.2.1) with argument locales.
    var requestedLocales = CanonicalizeLocaleList(locales);

    // 4. If options is undefined, then
    if (options === undefined)
        // a. Let options be the result of creating a new object as if by the
        // expression new Object() where Object is the standard built-in constructor
        // with that name.
        options = {};

        // 5. Else
    else
        // a. Let options be ToObject(options).
        options = toObject(options);

    // 6. Let opt be a new Record.
    var opt = new Record(),


    // 7. Let matcher be the result of calling the GetOption abstract operation
    //    (defined in 9.2.9) with the arguments options, "localeMatcher", "string",
    //    a List containing the two String values "lookup" and "best fit", and
    //    "best fit".
    matcher = GetOption(options, 'localeMatcher', 'string', new List('lookup', 'best fit'), 'best fit');

    // 8. Set opt.[[localeMatcher]] to matcher.
    opt['[[localeMatcher]]'] = matcher;

    // 9. Let NumberFormat be the standard built-in object that is the initial value
    //    of Intl.NumberFormat.
    // 10. Let localeData be the value of the [[localeData]] internal property of
    //     NumberFormat.
    var localeData = internals.NumberFormat['[[localeData]]'];

    // 11. Let r be the result of calling the ResolveLocale abstract operation
    //     (defined in 9.2.5) with the [[availableLocales]] internal property of
    //     NumberFormat, requestedLocales, opt, the [[relevantExtensionKeys]]
    //     internal property of NumberFormat, and localeData.
    var r = ResolveLocale(internals.NumberFormat['[[availableLocales]]'], requestedLocales, opt, internals.NumberFormat['[[relevantExtensionKeys]]'], localeData);

    // 12. Set the [[locale]] internal property of numberFormat to the value of
    //     r.[[locale]].
    internal['[[locale]]'] = r['[[locale]]'];

    // 13. Set the [[numberingSystem]] internal property of numberFormat to the value
    //     of r.[[nu]].
    internal['[[numberingSystem]]'] = r['[[nu]]'];

    // The specification doesn't tell us to do this, but it's helpful later on
    internal['[[dataLocale]]'] = r['[[dataLocale]]'];

    // 14. Let dataLocale be the value of r.[[dataLocale]].
    var dataLocale = r['[[dataLocale]]'];

    // 15. Let s be the result of calling the GetOption abstract operation with the
    //     arguments options, "style", "string", a List containing the three String
    //     values "decimal", "percent", and "currency", and "decimal".
    var s = GetOption(options, 'style', 'string', new List('decimal', 'percent', 'currency'), 'decimal');

    // 16. Set the [[style]] internal property of numberFormat to s.
    internal['[[style]]'] = s;

    // 17. Let c be the result of calling the GetOption abstract operation with the
    //     arguments options, "currency", "string", undefined, and undefined.
    var c = GetOption(options, 'currency', 'string');

    // 18. If c is not undefined and the result of calling the
    //     IsWellFormedCurrencyCode abstract operation (defined in 6.3.1) with
    //     argument c is false, then throw a RangeError exception.
    if (c !== undefined && !IsWellFormedCurrencyCode(c)) throw new RangeError("'" + c + "' is not a valid currency code");

    // 19. If s is "currency" and c is undefined, throw a TypeError exception.
    if (s === 'currency' && c === undefined) throw new TypeError('Currency code is required when style is currency');

    var cDigits = void 0;

    // 20. If s is "currency", then
    if (s === 'currency') {
        // a. Let c be the result of converting c to upper case as specified in 6.1.
        c = c.toUpperCase();

        // b. Set the [[currency]] internal property of numberFormat to c.
        internal['[[currency]]'] = c;

        // c. Let cDigits be the result of calling the CurrencyDigits abstract
        //    operation (defined below) with argument c.
        cDigits = CurrencyDigits(c);
    }

    // 21. Let cd be the result of calling the GetOption abstract operation with the
    //     arguments options, "currencyDisplay", "string", a List containing the
    //     three String values "code", "symbol", and "name", and "symbol".
    var cd = GetOption(options, 'currencyDisplay', 'string', new List('code', 'symbol', 'name'), 'symbol');

    // 22. If s is "currency", then set the [[currencyDisplay]] internal property of
    //     numberFormat to cd.
    if (s === 'currency') internal['[[currencyDisplay]]'] = cd;

    // 23. Let mnid be the result of calling the GetNumberOption abstract operation
    //     (defined in 9.2.10) with arguments options, "minimumIntegerDigits", 1, 21,
    //     and 1.
    var mnid = GetNumberOption(options, 'minimumIntegerDigits', 1, 21, 1);

    // 24. Set the [[minimumIntegerDigits]] internal property of numberFormat to mnid.
    internal['[[minimumIntegerDigits]]'] = mnid;

    // 25. If s is "currency", then let mnfdDefault be cDigits; else let mnfdDefault
    //     be 0.
    var mnfdDefault = s === 'currency' ? cDigits : 0;

    // 26. Let mnfd be the result of calling the GetNumberOption abstract operation
    //     with arguments options, "minimumFractionDigits", 0, 20, and mnfdDefault.
    var mnfd = GetNumberOption(options, 'minimumFractionDigits', 0, 20, mnfdDefault);

    // 27. Set the [[minimumFractionDigits]] internal property of numberFormat to mnfd.
    internal['[[minimumFractionDigits]]'] = mnfd;

    // 28. If s is "currency", then let mxfdDefault be max(mnfd, cDigits); else if s
    //     is "percent", then let mxfdDefault be max(mnfd, 0); else let mxfdDefault
    //     be max(mnfd, 3).
    var mxfdDefault = s === 'currency' ? Math.max(mnfd, cDigits) : s === 'percent' ? Math.max(mnfd, 0) : Math.max(mnfd, 3);

    // 29. Let mxfd be the result of calling the GetNumberOption abstract operation
    //     with arguments options, "maximumFractionDigits", mnfd, 20, and mxfdDefault.
    var mxfd = GetNumberOption(options, 'maximumFractionDigits', mnfd, 20, mxfdDefault);

    // 30. Set the [[maximumFractionDigits]] internal property of numberFormat to mxfd.
    internal['[[maximumFractionDigits]]'] = mxfd;

    // 31. Let mnsd be the result of calling the [[Get]] internal method of options
    //     with argument "minimumSignificantDigits".
    var mnsd = options.minimumSignificantDigits;

    // 32. Let mxsd be the result of calling the [[Get]] internal method of options
    //     with argument "maximumSignificantDigits".
    var mxsd = options.maximumSignificantDigits;

    // 33. If mnsd is not undefined or mxsd is not undefined, then:
    if (mnsd !== undefined || mxsd !== undefined) {
        // a. Let mnsd be the result of calling the GetNumberOption abstract
        //    operation with arguments options, "minimumSignificantDigits", 1, 21,
        //    and 1.
        mnsd = GetNumberOption(options, 'minimumSignificantDigits', 1, 21, 1);

        // b. Let mxsd be the result of calling the GetNumberOption abstract
        //     operation with arguments options, "maximumSignificantDigits", mnsd,
        //     21, and 21.
        mxsd = GetNumberOption(options, 'maximumSignificantDigits', mnsd, 21, 21);

        // c. Set the [[minimumSignificantDigits]] internal property of numberFormat
        //    to mnsd, and the [[maximumSignificantDigits]] internal property of
        //    numberFormat to mxsd.
        internal['[[minimumSignificantDigits]]'] = mnsd;
        internal['[[maximumSignificantDigits]]'] = mxsd;
    }
    // 34. Let g be the result of calling the GetOption abstract operation with the
    //     arguments options, "useGrouping", "boolean", undefined, and true.
    var g = GetOption(options, 'useGrouping', 'boolean', undefined, true);

    // 35. Set the [[useGrouping]] internal property of numberFormat to g.
    internal['[[useGrouping]]'] = g;

    // 36. Let dataLocaleData be the result of calling the [[Get]] internal method of
    //     localeData with argument dataLocale.
    var dataLocaleData = localeData[dataLocale];

    // 37. Let patterns be the result of calling the [[Get]] internal method of
    //     dataLocaleData with argument "patterns".
    var patterns = dataLocaleData.patterns;

    // 38. Assert: patterns is an object (see 11.2.3)

    // 39. Let stylePatterns be the result of calling the [[Get]] internal method of
    //     patterns with argument s.
    var stylePatterns = patterns[s];

    // 40. Set the [[positivePattern]] internal property of numberFormat to the
    //     result of calling the [[Get]] internal method of stylePatterns with the
    //     argument "positivePattern".
    internal['[[positivePattern]]'] = stylePatterns.positivePattern;

    // 41. Set the [[negativePattern]] internal property of numberFormat to the
    //     result of calling the [[Get]] internal method of stylePatterns with the
    //     argument "negativePattern".
    internal['[[negativePattern]]'] = stylePatterns.negativePattern;

    // 42. Set the [[boundFormat]] internal property of numberFormat to undefined.
    internal['[[boundFormat]]'] = undefined;

    // 43. Set the [[initializedNumberFormat]] internal property of numberFormat to
    //     true.
    internal['[[initializedNumberFormat]]'] = true;

    // In ES3, we need to pre-bind the format() function
    if (es3) numberFormat.format = GetFormatNumber.call(numberFormat);

    // Restore the RegExp properties
    regexpRestore();

    // Return the newly initialised object
    return numberFormat;
}

function CurrencyDigits(currency) {
    // When the CurrencyDigits abstract operation is called with an argument currency
    // (which must be an upper case String value), the following steps are taken:

    // 1. If the ISO 4217 currency and funds code list contains currency as an
    // alphabetic code, then return the minor unit value corresponding to the
    // currency from the list; else return 2.
    return currencyMinorUnits[currency] !== undefined ? currencyMinorUnits[currency] : 2;
}

/* 11.2.3 */internals.NumberFormat = {
    '[[availableLocales]]': [],
    '[[relevantExtensionKeys]]': ['nu'],
    '[[localeData]]': {}
};

/**
 * When the supportedLocalesOf method of Intl.NumberFormat is called, the
 * following steps are taken:
 */
/* 11.2.2 */
defineProperty(Intl.NumberFormat, 'supportedLocalesOf', {
    configurable: true,
    writable: true,
    value: fnBind.call(function (locales) {
        // Bound functions only have the `this` value altered if being used as a constructor,
        // this lets us imitate a native function that has no constructor
        if (!hop.call(this, '[[availableLocales]]')) throw new TypeError('supportedLocalesOf() is not a constructor');

        // Create an object whose props can be used to restore the values of RegExp props
        var regexpRestore = createRegExpRestore(),


        // 1. If options is not provided, then let options be undefined.
        options = arguments[1],


        // 2. Let availableLocales be the value of the [[availableLocales]] internal
        //    property of the standard built-in object that is the initial value of
        //    Intl.NumberFormat.

        availableLocales = this['[[availableLocales]]'],


        // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
        //    abstract operation (defined in 9.2.1) with argument locales.
        requestedLocales = CanonicalizeLocaleList(locales);

        // Restore the RegExp properties
        regexpRestore();

        // 4. Return the result of calling the SupportedLocales abstract operation
        //    (defined in 9.2.8) with arguments availableLocales, requestedLocales,
        //    and options.
        return SupportedLocales(availableLocales, requestedLocales, options);
    }, internals.NumberFormat)
});

/**
 * This named accessor property returns a function that formats a number
 * according to the effective locale and the formatting options of this
 * NumberFormat object.
 */
/* 11.3.2 */defineProperty(Intl.NumberFormat.prototype, 'format', {
    configurable: true,
    get: GetFormatNumber
});

function GetFormatNumber() {
    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    // Satisfy test 11.3_b
    if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for format() is not an initialized Intl.NumberFormat object.');

    // The value of the [[Get]] attribute is a function that takes the following
    // steps:

    // 1. If the [[boundFormat]] internal property of this NumberFormat object
    //    is undefined, then:
    if (internal['[[boundFormat]]'] === undefined) {
        // a. Let F be a Function object, with internal properties set as
        //    specified for built-in functions in ES5, 15, or successor, and the
        //    length property set to 1, that takes the argument value and
        //    performs the following steps:
        var F = function F(value) {
            // i. If value is not provided, then let value be undefined.
            // ii. Let x be ToNumber(value).
            // iii. Return the result of calling the FormatNumber abstract
            //      operation (defined below) with arguments this and x.
            return FormatNumber(this, /* x = */Number(value));
        };

        // b. Let bind be the standard built-in function object defined in ES5,
        //    15.3.4.5.
        // c. Let bf be the result of calling the [[Call]] internal method of
        //    bind with F as the this value and an argument list containing
        //    the single item this.
        var bf = fnBind.call(F, this);

        // d. Set the [[boundFormat]] internal property of this NumberFormat
        //    object to bf.
        internal['[[boundFormat]]'] = bf;
    }
    // Return the value of the [[boundFormat]] internal property of this
    // NumberFormat object.
    return internal['[[boundFormat]]'];
}

function formatToParts() {
    var value = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);
    if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for formatToParts() is not an initialized Intl.NumberFormat object.');

    var x = Number(value);
    return FormatNumberToParts(this, x);
}

Object.defineProperty(Intl.NumberFormat.prototype, 'formatToParts', {
    configurable: true,
    enumerable: false,
    writable: true,
    value: formatToParts
});

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-formatnumbertoparts]
 */
function FormatNumberToParts(numberFormat, x) {
    // 1. Let parts be ? PartitionNumberPattern(numberFormat, x).
    var parts = PartitionNumberPattern(numberFormat, x);
    // 2. Let result be ArrayCreate(0).
    var result = [];
    // 3. Let n be 0.
    var n = 0;
    // 4. For each part in parts, do:
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        // a. Let O be ObjectCreate(%ObjectPrototype%).
        var O = {};
        // a. Perform ? CreateDataPropertyOrThrow(O, "type", part.[[type]]).
        O.type = part['[[type]]'];
        // a. Perform ? CreateDataPropertyOrThrow(O, "value", part.[[value]]).
        O.value = part['[[value]]'];
        // a. Perform ? CreateDataPropertyOrThrow(result, ? ToString(n), O).
        result[n] = O;
        // a. Increment n by 1.
        n += 1;
    }
    // 5. Return result.
    return result;
}

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-partitionnumberpattern]
 */
function PartitionNumberPattern(numberFormat, x) {

    var internal = getInternalProperties(numberFormat),
        locale = internal['[[dataLocale]]'],
        nums = internal['[[numberingSystem]]'],
        data = internals.NumberFormat['[[localeData]]'][locale],
        ild = data.symbols[nums] || data.symbols.latn,
        pattern = void 0;

    // 1. If x is not NaN and x < 0, then:
    if (!isNaN(x) && x < 0) {
        // a. Let x be -x.
        x = -x;
        // a. Let pattern be the value of numberFormat.[[negativePattern]].
        pattern = internal['[[negativePattern]]'];
    }
    // 2. Else,
    else {
            // a. Let pattern be the value of numberFormat.[[positivePattern]].
            pattern = internal['[[positivePattern]]'];
        }
    // 3. Let result be a new empty List.
    var result = new List();
    // 4. Let beginIndex be Call(%StringProto_indexOf%, pattern, "{", 0).
    var beginIndex = pattern.indexOf('{', 0);
    // 5. Let endIndex be 0.
    var endIndex = 0;
    // 6. Let nextIndex be 0.
    var nextIndex = 0;
    // 7. Let length be the number of code units in pattern.
    var length = pattern.length;
    // 8. Repeat while beginIndex is an integer index into pattern:
    while (beginIndex > -1 && beginIndex < length) {
        // a. Set endIndex to Call(%StringProto_indexOf%, pattern, "}", beginIndex)
        endIndex = pattern.indexOf('}', beginIndex);
        // a. If endIndex = -1, throw new Error exception.
        if (endIndex === -1) throw new Error();
        // a. If beginIndex is greater than nextIndex, then:
        if (beginIndex > nextIndex) {
            // i. Let literal be a substring of pattern from position nextIndex, inclusive, to position beginIndex, exclusive.
            var literal = pattern.substring(nextIndex, beginIndex);
            // ii. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
            arrPush.call(result, { '[[type]]': 'literal', '[[value]]': literal });
        }
        // a. Let p be the substring of pattern from position beginIndex, exclusive, to position endIndex, exclusive.
        var p = pattern.substring(beginIndex + 1, endIndex);
        // a. If p is equal "number", then:
        if (p === "number") {
            // i. If x is NaN,
            if (isNaN(x)) {
                // 1. Let n be an ILD String value indicating the NaN value.
                var n = ild.nan;
                // 2. Add new part record { [[type]]: "nan", [[value]]: n } as a new element of the list result.
                arrPush.call(result, { '[[type]]': 'nan', '[[value]]': n });
            }
            // ii. Else if isFinite(x) is false,
            else if (!isFinite(x)) {
                    // 1. Let n be an ILD String value indicating infinity.
                    var _n = ild.infinity;
                    // 2. Add new part record { [[type]]: "infinity", [[value]]: n } as a new element of the list result.
                    arrPush.call(result, { '[[type]]': 'infinity', '[[value]]': _n });
                }
                // iii. Else,
                else {
                        // 1. If the value of numberFormat.[[style]] is "percent" and isFinite(x), let x be 100 × x.
                        if (internal['[[style]]'] === 'percent' && isFinite(x)) x *= 100;

                        var _n2 = void 0;
                        // 2. If the numberFormat.[[minimumSignificantDigits]] and numberFormat.[[maximumSignificantDigits]] are present, then
                        if (hop.call(internal, '[[minimumSignificantDigits]]') && hop.call(internal, '[[maximumSignificantDigits]]')) {
                            // a. Let n be ToRawPrecision(x, numberFormat.[[minimumSignificantDigits]], numberFormat.[[maximumSignificantDigits]]).
                            _n2 = ToRawPrecision(x, internal['[[minimumSignificantDigits]]'], internal['[[maximumSignificantDigits]]']);
                        }
                        // 3. Else,
                        else {
                                // a. Let n be ToRawFixed(x, numberFormat.[[minimumIntegerDigits]], numberFormat.[[minimumFractionDigits]], numberFormat.[[maximumFractionDigits]]).
                                _n2 = ToRawFixed(x, internal['[[minimumIntegerDigits]]'], internal['[[minimumFractionDigits]]'], internal['[[maximumFractionDigits]]']);
                            }
                        // 4. If the value of the numberFormat.[[numberingSystem]] matches one of the values in the "Numbering System" column of Table 2 below, then
                        if (numSys[nums]) {
                            (function () {
                                // a. Let digits be an array whose 10 String valued elements are the UTF-16 string representations of the 10 digits specified in the "Digits" column of the matching row in Table 2.
                                var digits = numSys[nums];
                                // a. Replace each digit in n with the value of digits[digit].
                                _n2 = String(_n2).replace(/\d/g, function (digit) {
                                    return digits[digit];
                                });
                            })();
                        }
                        // 5. Else use an implementation dependent algorithm to map n to the appropriate representation of n in the given numbering system.
                        else _n2 = String(_n2); // ###TODO###

                        var integer = void 0;
                        var fraction = void 0;
                        // 6. Let decimalSepIndex be Call(%StringProto_indexOf%, n, ".", 0).
                        var decimalSepIndex = _n2.indexOf('.', 0);
                        // 7. If decimalSepIndex > 0, then:
                        if (decimalSepIndex > 0) {
                            // a. Let integer be the substring of n from position 0, inclusive, to position decimalSepIndex, exclusive.
                            integer = _n2.substring(0, decimalSepIndex);
                            // a. Let fraction be the substring of n from position decimalSepIndex, exclusive, to the end of n.
                            fraction = _n2.substring(decimalSepIndex + 1, decimalSepIndex.length);
                        }
                        // 8. Else:
                        else {
                                // a. Let integer be n.
                                integer = _n2;
                                // a. Let fraction be undefined.
                                fraction = undefined;
                            }
                        // 9. If the value of the numberFormat.[[useGrouping]] is true,
                        if (internal['[[useGrouping]]'] === true) {
                            // a. Let groupSepSymbol be the ILND String representing the grouping separator.
                            var groupSepSymbol = ild.group;
                            // a. Let groups be a List whose elements are, in left to right order, the substrings defined by ILND set of locations within the integer.
                            var groups = [];
                            // ----> implementation:
                            // Primary group represents the group closest to the decimal
                            var pgSize = data.patterns.primaryGroupSize || 3;
                            // Secondary group is every other group
                            var sgSize = data.patterns.secondaryGroupSize || pgSize;
                            // Group only if necessary
                            if (integer.length > pgSize) {
                                // Index of the primary grouping separator
                                var end = integer.length - pgSize;
                                // Starting index for our loop
                                var idx = end % sgSize;
                                var start = integer.slice(0, idx);
                                if (start.length) arrPush.call(groups, start);
                                // Loop to separate into secondary grouping digits
                                while (idx < end) {
                                    arrPush.call(groups, integer.slice(idx, idx + sgSize));
                                    idx += sgSize;
                                }
                                // Add the primary grouping digits
                                arrPush.call(groups, integer.slice(end));
                            } else {
                                arrPush.call(groups, integer);
                            }
                            // a. Assert: The number of elements in groups List is greater than 0.
                            if (groups.length === 0) throw new Error();
                            // a. Repeat, while groups List is not empty:
                            while (groups.length) {
                                // i. Remove the first element from groups and let integerGroup be the value of that element.
                                var integerGroup = arrShift.call(groups);
                                // ii. Add new part record { [[type]]: "integer", [[value]]: integerGroup } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'integer', '[[value]]': integerGroup });
                                // iii. If groups List is not empty, then:
                                if (groups.length) {
                                    // 1. Add new part record { [[type]]: "group", [[value]]: groupSepSymbol } as a new element of the list result.
                                    arrPush.call(result, { '[[type]]': 'group', '[[value]]': groupSepSymbol });
                                }
                            }
                        }
                        // 10. Else,
                        else {
                                // a. Add new part record { [[type]]: "integer", [[value]]: integer } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'integer', '[[value]]': integer });
                            }
                        // 11. If fraction is not undefined, then:
                        if (fraction !== undefined) {
                            // a. Let decimalSepSymbol be the ILND String representing the decimal separator.
                            var decimalSepSymbol = ild.decimal;
                            // a. Add new part record { [[type]]: "decimal", [[value]]: decimalSepSymbol } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'decimal', '[[value]]': decimalSepSymbol });
                            // a. Add new part record { [[type]]: "fraction", [[value]]: fraction } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'fraction', '[[value]]': fraction });
                        }
                    }
        }
        // a. Else if p is equal "plusSign", then:
        else if (p === "plusSign") {
                // i. Let plusSignSymbol be the ILND String representing the plus sign.
                var plusSignSymbol = ild.plusSign;
                // ii. Add new part record { [[type]]: "plusSign", [[value]]: plusSignSymbol } as a new element of the list result.
                arrPush.call(result, { '[[type]]': 'plusSign', '[[value]]': plusSignSymbol });
            }
            // a. Else if p is equal "minusSign", then:
            else if (p === "minusSign") {
                    // i. Let minusSignSymbol be the ILND String representing the minus sign.
                    var minusSignSymbol = ild.minusSign;
                    // ii. Add new part record { [[type]]: "minusSign", [[value]]: minusSignSymbol } as a new element of the list result.
                    arrPush.call(result, { '[[type]]': 'minusSign', '[[value]]': minusSignSymbol });
                }
                // a. Else if p is equal "percentSign" and numberFormat.[[style]] is "percent", then:
                else if (p === "percentSign" && internal['[[style]]'] === "percent") {
                        // i. Let percentSignSymbol be the ILND String representing the percent sign.
                        var percentSignSymbol = ild.percentSign;
                        // ii. Add new part record { [[type]]: "percentSign", [[value]]: percentSignSymbol } as a new element of the list result.
                        arrPush.call(result, { '[[type]]': 'literal', '[[value]]': percentSignSymbol });
                    }
                    // a. Else if p is equal "currency" and numberFormat.[[style]] is "currency", then:
                    else if (p === "currency" && internal['[[style]]'] === "currency") {
                            // i. Let currency be the value of numberFormat.[[currency]].
                            var currency = internal['[[currency]]'];

                            var cd = void 0;

                            // ii. If numberFormat.[[currencyDisplay]] is "code", then
                            if (internal['[[currencyDisplay]]'] === "code") {
                                // 1. Let cd be currency.
                                cd = currency;
                            }
                            // iii. Else if numberFormat.[[currencyDisplay]] is "symbol", then
                            else if (internal['[[currencyDisplay]]'] === "symbol") {
                                    // 1. Let cd be an ILD string representing currency in short form. If the implementation does not have such a representation of currency, use currency itself.
                                    cd = data.currencies[currency] || currency;
                                }
                                // iv. Else if numberFormat.[[currencyDisplay]] is "name", then
                                else if (internal['[[currencyDisplay]]'] === "name") {
                                        // 1. Let cd be an ILD string representing currency in long form. If the implementation does not have such a representation of currency, then use currency itself.
                                        cd = currency;
                                    }
                            // v. Add new part record { [[type]]: "currency", [[value]]: cd } as a new element of the list result.
                            arrPush.call(result, { '[[type]]': 'currency', '[[value]]': cd });
                        }
                        // a. Else,
                        else {
                                // i. Let literal be the substring of pattern from position beginIndex, inclusive, to position endIndex, inclusive.
                                var _literal = pattern.substring(beginIndex, endIndex);
                                // ii. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
                                arrPush.call(result, { '[[type]]': 'literal', '[[value]]': _literal });
                            }
        // a. Set nextIndex to endIndex + 1.
        nextIndex = endIndex + 1;
        // a. Set beginIndex to Call(%StringProto_indexOf%, pattern, "{", nextIndex)
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    // 9. If nextIndex is less than length, then:
    if (nextIndex < length) {
        // a. Let literal be the substring of pattern from position nextIndex, inclusive, to position length, exclusive.
        var _literal2 = pattern.substring(nextIndex, length);
        // a. Add new part record { [[type]]: "literal", [[value]]: literal } as a new element of the list result.
        arrPush.call(result, { '[[type]]': 'literal', '[[value]]': _literal2 });
    }
    // 10. Return result.
    return result;
}

/*
 * @spec[stasm/ecma402/number-format-to-parts/spec/numberformat.html]
 * @clause[sec-formatnumber]
 */
function FormatNumber(numberFormat, x) {
    // 1. Let parts be ? PartitionNumberPattern(numberFormat, x).
    var parts = PartitionNumberPattern(numberFormat, x);
    // 2. Let result be an empty String.
    var result = '';
    // 3. For each part in parts, do:
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        // a. Set result to a String value produced by concatenating result and part.[[value]].
        result += part['[[value]]'];
    }
    // 4. Return result.
    return result;
}

/**
 * When the ToRawPrecision abstract operation is called with arguments x (which
 * must be a finite non-negative number), minPrecision, and maxPrecision (both
 * must be integers between 1 and 21) the following steps are taken:
 */
function ToRawPrecision(x, minPrecision, maxPrecision) {
    // 1. Let p be maxPrecision.
    var p = maxPrecision;

    var m = void 0,
        e = void 0;

    // 2. If x = 0, then
    if (x === 0) {
        // a. Let m be the String consisting of p occurrences of the character "0".
        m = arrJoin.call(Array(p + 1), '0');
        // b. Let e be 0.
        e = 0;
    }
    // 3. Else
    else {
            // a. Let e and n be integers such that 10ᵖ⁻¹ ≤ n < 10ᵖ and for which the
            //    exact mathematical value of n × 10ᵉ⁻ᵖ⁺¹ – x is as close to zero as
            //    possible. If there are two such sets of e and n, pick the e and n for
            //    which n × 10ᵉ⁻ᵖ⁺¹ is larger.
            e = log10Floor(Math.abs(x));

            // Easier to get to m from here
            var f = Math.round(Math.exp(Math.abs(e - p + 1) * Math.LN10));

            // b. Let m be the String consisting of the digits of the decimal
            //    representation of n (in order, with no leading zeroes)
            m = String(Math.round(e - p + 1 < 0 ? x * f : x / f));
        }

    // 4. If e ≥ p, then
    if (e >= p)
        // a. Return the concatenation of m and e-p+1 occurrences of the character "0".
        return m + arrJoin.call(Array(e - p + 1 + 1), '0');

        // 5. If e = p-1, then
    else if (e === p - 1)
            // a. Return m.
            return m;

            // 6. If e ≥ 0, then
        else if (e >= 0)
                // a. Let m be the concatenation of the first e+1 characters of m, the character
                //    ".", and the remaining p–(e+1) characters of m.
                m = m.slice(0, e + 1) + '.' + m.slice(e + 1);

                // 7. If e < 0, then
            else if (e < 0)
                    // a. Let m be the concatenation of the String "0.", –(e+1) occurrences of the
                    //    character "0", and the string m.
                    m = '0.' + arrJoin.call(Array(-(e + 1) + 1), '0') + m;

    // 8. If m contains the character ".", and maxPrecision > minPrecision, then
    if (m.indexOf(".") >= 0 && maxPrecision > minPrecision) {
        // a. Let cut be maxPrecision – minPrecision.
        var cut = maxPrecision - minPrecision;

        // b. Repeat while cut > 0 and the last character of m is "0":
        while (cut > 0 && m.charAt(m.length - 1) === '0') {
            //  i. Remove the last character from m.
            m = m.slice(0, -1);

            //  ii. Decrease cut by 1.
            cut--;
        }

        // c. If the last character of m is ".", then
        if (m.charAt(m.length - 1) === '.')
            //    i. Remove the last character from m.
            m = m.slice(0, -1);
    }
    // 9. Return m.
    return m;
}

/**
 * @spec[tc39/ecma402/master/spec/numberformat.html]
 * @clause[sec-torawfixed]
 * When the ToRawFixed abstract operation is called with arguments x (which must
 * be a finite non-negative number), minInteger (which must be an integer between
 * 1 and 21), minFraction, and maxFraction (which must be integers between 0 and
 * 20) the following steps are taken:
 */
function ToRawFixed(x, minInteger, minFraction, maxFraction) {
    // 1. Let f be maxFraction.
    var f = maxFraction;
    // 2. Let n be an integer for which the exact mathematical value of n ÷ 10f – x is as close to zero as possible. If there are two such n, pick the larger n.
    var n = Math.pow(10, f) * x; // diverging...
    // 3. If n = 0, let m be the String "0". Otherwise, let m be the String consisting of the digits of the decimal representation of n (in order, with no leading zeroes).
    var m = n === 0 ? "0" : n.toFixed(0); // divering...

    {
        // this diversion is needed to take into consideration big numbers, e.g.:
        // 1.2344501e+37 -> 12344501000000000000000000000000000000
        var idx = void 0;
        var exp = (idx = m.indexOf('e')) > -1 ? m.slice(idx + 1) : 0;
        if (exp) {
            m = m.slice(0, idx).replace('.', '');
            m += arrJoin.call(Array(exp - (m.length - 1) + 1), '0');
        }
    }

    var int = void 0;
    // 4. If f ≠ 0, then
    if (f !== 0) {
        // a. Let k be the number of characters in m.
        var k = m.length;
        // a. If k ≤ f, then
        if (k <= f) {
            // i. Let z be the String consisting of f+1–k occurrences of the character "0".
            var z = arrJoin.call(Array(f + 1 - k + 1), '0');
            // ii. Let m be the concatenation of Strings z and m.
            m = z + m;
            // iii. Let k be f+1.
            k = f + 1;
        }
        // a. Let a be the first k–f characters of m, and let b be the remaining f characters of m.
        var a = m.substring(0, k - f),
            b = m.substring(k - f, m.length);
        // a. Let m be the concatenation of the three Strings a, ".", and b.
        m = a + "." + b;
        // a. Let int be the number of characters in a.
        int = a.length;
    }
    // 5. Else, let int be the number of characters in m.
    else int = m.length;
    // 6. Let cut be maxFraction – minFraction.
    var cut = maxFraction - minFraction;
    // 7. Repeat while cut > 0 and the last character of m is "0":
    while (cut > 0 && m.slice(-1) === "0") {
        // a. Remove the last character from m.
        m = m.slice(0, -1);
        // a. Decrease cut by 1.
        cut--;
    }
    // 8. If the last character of m is ".", then
    if (m.slice(-1) === ".") {
        // a. Remove the last character from m.
        m = m.slice(0, -1);
    }
    // 9. If int < minInteger, then
    if (int < minInteger) {
        // a. Let z be the String consisting of minInteger–int occurrences of the character "0".
        var _z = arrJoin.call(Array(minInteger - int + 1), '0');
        // a. Let m be the concatenation of Strings z and m.
        m = _z + m;
    }
    // 10. Return m.
    return m;
}

// Sect 11.3.2 Table 2, Numbering systems
// ======================================
var numSys = {
    arab: ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"],
    arabext: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
    bali: ["᭐", "᭑", "᭒", "᭓", "᭔", "᭕", "᭖", "᭗", "᭘", "᭙"],
    beng: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
    deva: ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"],
    fullwide: ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"],
    gujr: ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"],
    guru: ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"],
    hanidec: ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"],
    khmr: ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"],
    knda: ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"],
    laoo: ["໐", "໑", "໒", "໓", "໔", "໕", "໖", "໗", "໘", "໙"],
    latn: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    limb: ["᥆", "᥇", "᥈", "᥉", "᥊", "᥋", "᥌", "᥍", "᥎", "᥏"],
    mlym: ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"],
    mong: ["᠐", "᠑", "᠒", "᠓", "᠔", "᠕", "᠖", "᠗", "᠘", "᠙"],
    mymr: ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"],
    orya: ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"],
    tamldec: ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"],
    telu: ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"],
    thai: ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"],
    tibt: ["༠", "༡", "༢", "༣", "༤", "༥", "༦", "༧", "༨", "༩"]
};

/**
 * This function provides access to the locale and formatting options computed
 * during initialization of the object.
 *
 * The function returns a new object whose properties and attributes are set as
 * if constructed by an object literal assigning to each of the following
 * properties the value of the corresponding internal property of this
 * NumberFormat object (see 11.4): locale, numberingSystem, style, currency,
 * currencyDisplay, minimumIntegerDigits, minimumFractionDigits,
 * maximumFractionDigits, minimumSignificantDigits, maximumSignificantDigits, and
 * useGrouping. Properties whose corresponding internal properties are not present
 * are not assigned.
 */
/* 11.3.3 */defineProperty(Intl.NumberFormat.prototype, 'resolvedOptions', {
    configurable: true,
    writable: true,
    value: function value() {
        var prop = void 0,
            descs = new Record(),
            props = ['locale', 'numberingSystem', 'style', 'currency', 'currencyDisplay', 'minimumIntegerDigits', 'minimumFractionDigits', 'maximumFractionDigits', 'minimumSignificantDigits', 'maximumSignificantDigits', 'useGrouping'],
            internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

        // Satisfy test 11.3_b
        if (!internal || !internal['[[initializedNumberFormat]]']) throw new TypeError('`this` value for resolvedOptions() is not an initialized Intl.NumberFormat object.');

        for (var i = 0, max = props.length; i < max; i++) {
            if (hop.call(internal, prop = '[[' + props[i] + ']]')) descs[props[i]] = { value: internal[prop], writable: true, configurable: true, enumerable: true };
        }

        return objCreate({}, descs);
    }
});

/* jslint esnext: true */

// Match these datetime components in a CLDR pattern, except those in single quotes
var expDTComponents = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
// trim patterns after transformations
var expPatternTrimmer = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
// Skip over patterns with these datetime components because we don't have data
// to back them up:
// timezone, weekday, amoung others
var unwantedDTCs = /[rqQASjJgwWIQq]/; // xXVO were removed from this list in favor of computing matches with timeZoneName values but printing as empty string

var dtKeys = ["era", "year", "month", "day", "weekday", "quarter"];
var tmKeys = ["hour", "minute", "second", "hour12", "timeZoneName"];

function isDateFormatOnly(obj) {
    for (var i = 0; i < tmKeys.length; i += 1) {
        if (obj.hasOwnProperty(tmKeys[i])) {
            return false;
        }
    }
    return true;
}

function isTimeFormatOnly(obj) {
    for (var i = 0; i < dtKeys.length; i += 1) {
        if (obj.hasOwnProperty(dtKeys[i])) {
            return false;
        }
    }
    return true;
}

function joinDateAndTimeFormats(dateFormatObj, timeFormatObj) {
    var o = { _: {} };
    for (var i = 0; i < dtKeys.length; i += 1) {
        if (dateFormatObj[dtKeys[i]]) {
            o[dtKeys[i]] = dateFormatObj[dtKeys[i]];
        }
        if (dateFormatObj._[dtKeys[i]]) {
            o._[dtKeys[i]] = dateFormatObj._[dtKeys[i]];
        }
    }
    for (var j = 0; j < tmKeys.length; j += 1) {
        if (timeFormatObj[tmKeys[j]]) {
            o[tmKeys[j]] = timeFormatObj[tmKeys[j]];
        }
        if (timeFormatObj._[tmKeys[j]]) {
            o._[tmKeys[j]] = timeFormatObj._[tmKeys[j]];
        }
    }
    return o;
}

function computeFinalPatterns(formatObj) {
    // From http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Format_Patterns:
    //  'In patterns, two single quotes represents a literal single quote, either
    //   inside or outside single quotes. Text within single quotes is not
    //   interpreted in any way (except for two adjacent single quotes).'
    formatObj.pattern12 = formatObj.extendedPattern.replace(/'([^']*)'/g, function ($0, literal) {
        return literal ? literal : "'";
    });

    // pattern 12 is always the default. we can produce the 24 by removing {ampm}
    formatObj.pattern = formatObj.pattern12.replace('{ampm}', '').replace(expPatternTrimmer, '');
    return formatObj;
}

function expDTComponentsMeta($0, formatObj) {
    switch ($0.charAt(0)) {
        // --- Era
        case 'G':
            formatObj.era = ['short', 'short', 'short', 'long', 'narrow'][$0.length - 1];
            return '{era}';

        // --- Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            formatObj.year = $0.length === 2 ? '2-digit' : 'numeric';
            return '{year}';

        // --- Quarter (not supported in this polyfill)
        case 'Q':
        case 'q':
            formatObj.quarter = ['numeric', '2-digit', 'short', 'long', 'narrow'][$0.length - 1];
            return '{quarter}';

        // --- Month
        case 'M':
        case 'L':
            formatObj.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][$0.length - 1];
            return '{month}';

        // --- Week (not supported in this polyfill)
        case 'w':
            // week of the year
            formatObj.week = $0.length === 2 ? '2-digit' : 'numeric';
            return '{weekday}';
        case 'W':
            // week of the month
            formatObj.week = 'numeric';
            return '{weekday}';

        // --- Day
        case 'd':
            // day of the month
            formatObj.day = $0.length === 2 ? '2-digit' : 'numeric';
            return '{day}';
        case 'D': // day of the year
        case 'F': // day of the week
        case 'g':
            // 1..n: Modified Julian day
            formatObj.day = 'numeric';
            return '{day}';

        // --- Week Day
        case 'E':
            // day of the week
            formatObj.weekday = ['short', 'short', 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';
        case 'e':
            // local day of the week
            formatObj.weekday = ['numeric', '2-digit', 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';
        case 'c':
            // stand alone local day of the week
            formatObj.weekday = ['numeric', undefined, 'short', 'long', 'narrow', 'short'][$0.length - 1];
            return '{weekday}';

        // --- Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B':
            // flexible day periods
            formatObj.hour12 = true;
            return '{ampm}';

        // --- Hour
        case 'h':
        case 'H':
            formatObj.hour = $0.length === 2 ? '2-digit' : 'numeric';
            return '{hour}';
        case 'k':
        case 'K':
            formatObj.hour12 = true; // 12-hour-cycle time formats (using h or K)
            formatObj.hour = $0.length === 2 ? '2-digit' : 'numeric';
            return '{hour}';

        // --- Minute
        case 'm':
            formatObj.minute = $0.length === 2 ? '2-digit' : 'numeric';
            return '{minute}';

        // --- Second
        case 's':
            formatObj.second = $0.length === 2 ? '2-digit' : 'numeric';
            return '{second}';
        case 'S':
        case 'A':
            formatObj.second = 'numeric';
            return '{second}';

        // --- Timezone
        case 'z': // 1..3, 4: specific non-location format
        case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
        case 'O': // 1, 4: miliseconds in day short, long
        case 'v': // 1, 4: generic non-location format
        case 'V': // 1, 2, 3, 4: time zone ID or city
        case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
        case 'x':
            // 1, 2, 3, 4: The ISO8601 varios formats
            // this polyfill only supports much, for now, we are just doing something dummy
            formatObj.timeZoneName = $0.length < 4 ? 'short' : 'long';
            return '{timeZoneName}';
    }
}

/**
 * Converts the CLDR availableFormats into the objects and patterns required by
 * the ECMAScript Internationalization API specification.
 */
function createDateTimeFormat(skeleton, pattern) {
    // we ignore certain patterns that are unsupported to avoid this expensive op.
    if (unwantedDTCs.test(pattern)) return undefined;

    var formatObj = {
        originalPattern: pattern,
        _: {}
    };

    // Replace the pattern string with the one required by the specification, whilst
    // at the same time evaluating it for the subsets and formats
    formatObj.extendedPattern = pattern.replace(expDTComponents, function ($0) {
        // See which symbol we're dealing with
        return expDTComponentsMeta($0, formatObj._);
    });

    // Match the skeleton string with the one required by the specification
    // this implementation is based on the Date Field Symbol Table:
    // http://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
    // Note: we are adding extra data to the formatObject even though this polyfill
    //       might not support it.
    skeleton.replace(expDTComponents, function ($0) {
        // See which symbol we're dealing with
        return expDTComponentsMeta($0, formatObj);
    });

    return computeFinalPatterns(formatObj);
}

/**
 * Processes DateTime formats from CLDR to an easier-to-parse format.
 * the result of this operation should be cached the first time a particular
 * calendar is analyzed.
 *
 * The specification requires we support at least the following subsets of
 * date/time components:
 *
 *   - 'weekday', 'year', 'month', 'day', 'hour', 'minute', 'second'
 *   - 'weekday', 'year', 'month', 'day'
 *   - 'year', 'month', 'day'
 *   - 'year', 'month'
 *   - 'month', 'day'
 *   - 'hour', 'minute', 'second'
 *   - 'hour', 'minute'
 *
 * We need to cherry pick at least these subsets from the CLDR data and convert
 * them into the pattern objects used in the ECMA-402 API.
 */
function createDateTimeFormats(formats) {
    var availableFormats = formats.availableFormats;
    var timeFormats = formats.timeFormats;
    var dateFormats = formats.dateFormats;
    var result = [];
    var skeleton = void 0,
        pattern = void 0,
        computed = void 0,
        i = void 0,
        j = void 0;
    var timeRelatedFormats = [];
    var dateRelatedFormats = [];

    // Map available (custom) formats into a pattern for createDateTimeFormats
    for (skeleton in availableFormats) {
        if (availableFormats.hasOwnProperty(skeleton)) {
            pattern = availableFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                // in some cases, the format is only displaying date specific props
                // or time specific props, in which case we need to also produce the
                // combined formats.
                if (isDateFormatOnly(computed)) {
                    dateRelatedFormats.push(computed);
                } else if (isTimeFormatOnly(computed)) {
                    timeRelatedFormats.push(computed);
                }
            }
        }
    }

    // Map time formats into a pattern for createDateTimeFormats
    for (skeleton in timeFormats) {
        if (timeFormats.hasOwnProperty(skeleton)) {
            pattern = timeFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                timeRelatedFormats.push(computed);
            }
        }
    }

    // Map date formats into a pattern for createDateTimeFormats
    for (skeleton in dateFormats) {
        if (dateFormats.hasOwnProperty(skeleton)) {
            pattern = dateFormats[skeleton];
            computed = createDateTimeFormat(skeleton, pattern);
            if (computed) {
                result.push(computed);
                dateRelatedFormats.push(computed);
            }
        }
    }

    // combine custom time and custom date formats when they are orthogonals to complete the
    // formats supported by CLDR.
    // This Algo is based on section "Missing Skeleton Fields" from:
    // http://unicode.org/reports/tr35/tr35-dates.html#availableFormats_appendItems
    for (i = 0; i < timeRelatedFormats.length; i += 1) {
        for (j = 0; j < dateRelatedFormats.length; j += 1) {
            if (dateRelatedFormats[j].month === 'long') {
                pattern = dateRelatedFormats[j].weekday ? formats.full : formats.long;
            } else if (dateRelatedFormats[j].month === 'short') {
                pattern = formats.medium;
            } else {
                pattern = formats.short;
            }
            computed = joinDateAndTimeFormats(dateRelatedFormats[j], timeRelatedFormats[i]);
            computed.originalPattern = pattern;
            computed.extendedPattern = pattern.replace('{0}', timeRelatedFormats[i].extendedPattern).replace('{1}', dateRelatedFormats[j].extendedPattern).replace(/^[,\s]+|[,\s]+$/gi, '');
            result.push(computeFinalPatterns(computed));
        }
    }

    return result;
}

// this represents the exceptions of the rule that are not covered by CLDR availableFormats
// for single property configurations, they play no role when using multiple properties, and
// those that are not in this table, are not exceptions or are not covered by the data we
// provide.
var validSyntheticProps = {
    second: {
        numeric: 's',
        '2-digit': 'ss'
    },
    minute: {
        numeric: 'm',
        '2-digit': 'mm'
    },
    year: {
        numeric: 'y',
        '2-digit': 'yy'
    },
    day: {
        numeric: 'd',
        '2-digit': 'dd'
    },
    month: {
        numeric: 'L',
        '2-digit': 'LL',
        narrow: 'LLLLL',
        short: 'LLL',
        long: 'LLLL'
    },
    weekday: {
        narrow: 'ccccc',
        short: 'ccc',
        long: 'cccc'
    }
};

function generateSyntheticFormat(propName, propValue) {
    if (validSyntheticProps[propName] && validSyntheticProps[propName][propValue]) {
        var _ref2;

        return _ref2 = {
            originalPattern: validSyntheticProps[propName][propValue],
            _: defineProperty$1({}, propName, propValue),
            extendedPattern: "{" + propName + "}"
        }, defineProperty$1(_ref2, propName, propValue), defineProperty$1(_ref2, "pattern12", "{" + propName + "}"), defineProperty$1(_ref2, "pattern", "{" + propName + "}"), _ref2;
    }
}

// An object map of date component keys, saves using a regex later
var dateWidths = objCreate(null, { narrow: {}, short: {}, long: {} });

/**
 * Returns a string for a date component, resolved using multiple inheritance as specified
 * as specified in the Unicode Technical Standard 35.
 */
function resolveDateString(data, ca, component, width, key) {
    // From http://www.unicode.org/reports/tr35/tr35.html#Multiple_Inheritance:
    // 'In clearly specified instances, resources may inherit from within the same locale.
    //  For example, ... the Buddhist calendar inherits from the Gregorian calendar.'
    var obj = data[ca] && data[ca][component] ? data[ca][component] : data.gregory[component],


    // "sideways" inheritance resolves strings when a key doesn't exist
    alts = {
        narrow: ['short', 'long'],
        short: ['long', 'narrow'],
        long: ['short', 'narrow']
    },


    //
    resolved = hop.call(obj, width) ? obj[width] : hop.call(obj, alts[width][0]) ? obj[alts[width][0]] : obj[alts[width][1]];

    // `key` wouldn't be specified for components 'dayPeriods'
    return key !== null ? resolved[key] : resolved;
}

// Define the DateTimeFormat constructor internally so it cannot be tainted
function DateTimeFormatConstructor() {
    var locales = arguments[0];
    var options = arguments[1];

    if (!this || this === Intl) {
        return new Intl.DateTimeFormat(locales, options);
    }
    return InitializeDateTimeFormat(toObject(this), locales, options);
}

defineProperty(Intl, 'DateTimeFormat', {
    configurable: true,
    writable: true,
    value: DateTimeFormatConstructor
});

// Must explicitly set prototypes as unwritable
defineProperty(DateTimeFormatConstructor, 'prototype', {
    writable: false
});

/**
 * The abstract operation InitializeDateTimeFormat accepts the arguments dateTimeFormat
 * (which must be an object), locales, and options. It initializes dateTimeFormat as a
 * DateTimeFormat object.
 */
function /* 12.1.1.1 */InitializeDateTimeFormat(dateTimeFormat, locales, options) {
    // This will be a internal properties object if we're not already initialized
    var internal = getInternalProperties(dateTimeFormat);

    // Create an object whose props can be used to restore the values of RegExp props
    var regexpRestore = createRegExpRestore();

    // 1. If dateTimeFormat has an [[initializedIntlObject]] internal property with
    //    value true, throw a TypeError exception.
    if (internal['[[initializedIntlObject]]'] === true) throw new TypeError('`this` object has already been initialized as an Intl object');

    // Need this to access the `internal` object
    defineProperty(dateTimeFormat, '__getInternalProperties', {
        value: function value() {
            // NOTE: Non-standard, for internal use only
            if (arguments[0] === secret) return internal;
        }
    });

    // 2. Set the [[initializedIntlObject]] internal property of numberFormat to true.
    internal['[[initializedIntlObject]]'] = true;

    // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
    //    abstract operation (defined in 9.2.1) with argument locales.
    var requestedLocales = CanonicalizeLocaleList(locales);

    // 4. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined below) with arguments options, "any", and "date".
    options = ToDateTimeOptions(options, 'any', 'date');

    // 5. Let opt be a new Record.
    var opt = new Record();

    // 6. Let matcher be the result of calling the GetOption abstract operation
    //    (defined in 9.2.9) with arguments options, "localeMatcher", "string", a List
    //    containing the two String values "lookup" and "best fit", and "best fit".
    var matcher = GetOption(options, 'localeMatcher', 'string', new List('lookup', 'best fit'), 'best fit');

    // 7. Set opt.[[localeMatcher]] to matcher.
    opt['[[localeMatcher]]'] = matcher;

    // 8. Let DateTimeFormat be the standard built-in object that is the initial
    //    value of Intl.DateTimeFormat.
    var DateTimeFormat = internals.DateTimeFormat; // This is what we *really* need

    // 9. Let localeData be the value of the [[localeData]] internal property of
    //    DateTimeFormat.
    var localeData = DateTimeFormat['[[localeData]]'];

    // 10. Let r be the result of calling the ResolveLocale abstract operation
    //     (defined in 9.2.5) with the [[availableLocales]] internal property of
    //      DateTimeFormat, requestedLocales, opt, the [[relevantExtensionKeys]]
    //      internal property of DateTimeFormat, and localeData.
    var r = ResolveLocale(DateTimeFormat['[[availableLocales]]'], requestedLocales, opt, DateTimeFormat['[[relevantExtensionKeys]]'], localeData);

    // 11. Set the [[locale]] internal property of dateTimeFormat to the value of
    //     r.[[locale]].
    internal['[[locale]]'] = r['[[locale]]'];

    // 12. Set the [[calendar]] internal property of dateTimeFormat to the value of
    //     r.[[ca]].
    internal['[[calendar]]'] = r['[[ca]]'];

    // 13. Set the [[numberingSystem]] internal property of dateTimeFormat to the value of
    //     r.[[nu]].
    internal['[[numberingSystem]]'] = r['[[nu]]'];

    // The specification doesn't tell us to do this, but it's helpful later on
    internal['[[dataLocale]]'] = r['[[dataLocale]]'];

    // 14. Let dataLocale be the value of r.[[dataLocale]].
    var dataLocale = r['[[dataLocale]]'];

    // 15. Let tz be the result of calling the [[Get]] internal method of options with
    //     argument "timeZone".
    var tz = options.timeZone;

    // 16. If tz is not undefined, then
    if (tz !== undefined) {
        // a. Let tz be ToString(tz).
        // b. Convert tz to upper case as described in 6.1.
        //    NOTE: If an implementation accepts additional time zone values, as permitted
        //          under certain conditions by the Conformance clause, different casing
        //          rules apply.
        tz = toLatinUpperCase(tz);

        // c. If tz is not "UTC", then throw a RangeError exception.
        // ###TODO: accept more time zones###
        if (tz !== 'UTC') throw new RangeError('timeZone is not supported.');
    }

    // 17. Set the [[timeZone]] internal property of dateTimeFormat to tz.
    internal['[[timeZone]]'] = tz;

    // 18. Let opt be a new Record.
    opt = new Record();

    // 19. For each row of Table 3, except the header row, do:
    for (var prop in dateTimeComponents) {
        if (!hop.call(dateTimeComponents, prop)) continue;

        // 20. Let prop be the name given in the Property column of the row.
        // 21. Let value be the result of calling the GetOption abstract operation,
        //     passing as argument options, the name given in the Property column of the
        //     row, "string", a List containing the strings given in the Values column of
        //     the row, and undefined.
        var value = GetOption(options, prop, 'string', dateTimeComponents[prop]);

        // 22. Set opt.[[<prop>]] to value.
        opt['[[' + prop + ']]'] = value;
    }

    // Assigned a value below
    var bestFormat = void 0;

    // 23. Let dataLocaleData be the result of calling the [[Get]] internal method of
    //     localeData with argument dataLocale.
    var dataLocaleData = localeData[dataLocale];

    // 24. Let formats be the result of calling the [[Get]] internal method of
    //     dataLocaleData with argument "formats".
    //     Note: we process the CLDR formats into the spec'd structure
    var formats = ToDateTimeFormats(dataLocaleData.formats);

    // 25. Let matcher be the result of calling the GetOption abstract operation with
    //     arguments options, "formatMatcher", "string", a List containing the two String
    //     values "basic" and "best fit", and "best fit".
    matcher = GetOption(options, 'formatMatcher', 'string', new List('basic', 'best fit'), 'best fit');

    // Optimization: caching the processed formats as a one time operation by
    // replacing the initial structure from localeData
    dataLocaleData.formats = formats;

    // 26. If matcher is "basic", then
    if (matcher === 'basic') {
        // 27. Let bestFormat be the result of calling the BasicFormatMatcher abstract
        //     operation (defined below) with opt and formats.
        bestFormat = BasicFormatMatcher(opt, formats);

        // 28. Else
    } else {
        {
            // diverging
            var _hr = GetOption(options, 'hour12', 'boolean' /*, undefined, undefined*/);
            opt.hour12 = _hr === undefined ? dataLocaleData.hour12 : _hr;
        }
        // 29. Let bestFormat be the result of calling the BestFitFormatMatcher
        //     abstract operation (defined below) with opt and formats.
        bestFormat = BestFitFormatMatcher(opt, formats);
    }

    // 30. For each row in Table 3, except the header row, do
    for (var _prop in dateTimeComponents) {
        if (!hop.call(dateTimeComponents, _prop)) continue;

        // a. Let prop be the name given in the Property column of the row.
        // b. Let pDesc be the result of calling the [[GetOwnProperty]] internal method of
        //    bestFormat with argument prop.
        // c. If pDesc is not undefined, then
        if (hop.call(bestFormat, _prop)) {
            // i. Let p be the result of calling the [[Get]] internal method of bestFormat
            //    with argument prop.
            var p = bestFormat[_prop];
            {
                // diverging
                p = bestFormat._ && hop.call(bestFormat._, _prop) ? bestFormat._[_prop] : p;
            }

            // ii. Set the [[<prop>]] internal property of dateTimeFormat to p.
            internal['[[' + _prop + ']]'] = p;
        }
    }

    var pattern = void 0; // Assigned a value below

    // 31. Let hr12 be the result of calling the GetOption abstract operation with
    //     arguments options, "hour12", "boolean", undefined, and undefined.
    var hr12 = GetOption(options, 'hour12', 'boolean' /*, undefined, undefined*/);

    // 32. If dateTimeFormat has an internal property [[hour]], then
    if (internal['[[hour]]']) {
        // a. If hr12 is undefined, then let hr12 be the result of calling the [[Get]]
        //    internal method of dataLocaleData with argument "hour12".
        hr12 = hr12 === undefined ? dataLocaleData.hour12 : hr12;

        // b. Set the [[hour12]] internal property of dateTimeFormat to hr12.
        internal['[[hour12]]'] = hr12;

        // c. If hr12 is true, then
        if (hr12 === true) {
            // i. Let hourNo0 be the result of calling the [[Get]] internal method of
            //    dataLocaleData with argument "hourNo0".
            var hourNo0 = dataLocaleData.hourNo0;

            // ii. Set the [[hourNo0]] internal property of dateTimeFormat to hourNo0.
            internal['[[hourNo0]]'] = hourNo0;

            // iii. Let pattern be the result of calling the [[Get]] internal method of
            //      bestFormat with argument "pattern12".
            pattern = bestFormat.pattern12;
        }

        // d. Else
        else
            // i. Let pattern be the result of calling the [[Get]] internal method of
            //    bestFormat with argument "pattern".
            pattern = bestFormat.pattern;
    }

    // 33. Else
    else
        // a. Let pattern be the result of calling the [[Get]] internal method of
        //    bestFormat with argument "pattern".
        pattern = bestFormat.pattern;

    // 34. Set the [[pattern]] internal property of dateTimeFormat to pattern.
    internal['[[pattern]]'] = pattern;

    // 35. Set the [[boundFormat]] internal property of dateTimeFormat to undefined.
    internal['[[boundFormat]]'] = undefined;

    // 36. Set the [[initializedDateTimeFormat]] internal property of dateTimeFormat to
    //     true.
    internal['[[initializedDateTimeFormat]]'] = true;

    // In ES3, we need to pre-bind the format() function
    if (es3) dateTimeFormat.format = GetFormatDateTime.call(dateTimeFormat);

    // Restore the RegExp properties
    regexpRestore();

    // Return the newly initialised object
    return dateTimeFormat;
}

/**
 * Several DateTimeFormat algorithms use values from the following table, which provides
 * property names and allowable values for the components of date and time formats:
 */
var dateTimeComponents = {
    weekday: ["narrow", "short", "long"],
    era: ["narrow", "short", "long"],
    year: ["2-digit", "numeric"],
    month: ["2-digit", "numeric", "narrow", "short", "long"],
    day: ["2-digit", "numeric"],
    hour: ["2-digit", "numeric"],
    minute: ["2-digit", "numeric"],
    second: ["2-digit", "numeric"],
    timeZoneName: ["short", "long"]
};

/**
 * When the ToDateTimeOptions abstract operation is called with arguments options,
 * required, and defaults, the following steps are taken:
 */
function ToDateTimeFormats(formats) {
    if (Object.prototype.toString.call(formats) === '[object Array]') {
        return formats;
    }
    return createDateTimeFormats(formats);
}

/**
 * When the ToDateTimeOptions abstract operation is called with arguments options,
 * required, and defaults, the following steps are taken:
 */
function ToDateTimeOptions(options, required, defaults) {
    // 1. If options is undefined, then let options be null, else let options be
    //    ToObject(options).
    if (options === undefined) options = null;else {
        // (#12) options needs to be a Record, but it also needs to inherit properties
        var opt2 = toObject(options);
        options = new Record();

        for (var k in opt2) {
            options[k] = opt2[k];
        }
    }

    // 2. Let create be the standard built-in function object defined in ES5, 15.2.3.5.
    var create = objCreate;

    // 3. Let options be the result of calling the [[Call]] internal method of create with
    //    undefined as the this value and an argument list containing the single item
    //    options.
    options = create(options);

    // 4. Let needDefaults be true.
    var needDefaults = true;

    // 5. If required is "date" or "any", then
    if (required === 'date' || required === 'any') {
        // a. For each of the property names "weekday", "year", "month", "day":
        // i. If the result of calling the [[Get]] internal method of options with the
        //    property name is not undefined, then let needDefaults be false.
        if (options.weekday !== undefined || options.year !== undefined || options.month !== undefined || options.day !== undefined) needDefaults = false;
    }

    // 6. If required is "time" or "any", then
    if (required === 'time' || required === 'any') {
        // a. For each of the property names "hour", "minute", "second":
        // i. If the result of calling the [[Get]] internal method of options with the
        //    property name is not undefined, then let needDefaults be false.
        if (options.hour !== undefined || options.minute !== undefined || options.second !== undefined) needDefaults = false;
    }

    // 7. If needDefaults is true and defaults is either "date" or "all", then
    if (needDefaults && (defaults === 'date' || defaults === 'all'))
        // a. For each of the property names "year", "month", "day":
        // i. Call the [[DefineOwnProperty]] internal method of options with the
        //    property name, Property Descriptor {[[Value]]: "numeric", [[Writable]]:
        //    true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        options.year = options.month = options.day = 'numeric';

    // 8. If needDefaults is true and defaults is either "time" or "all", then
    if (needDefaults && (defaults === 'time' || defaults === 'all'))
        // a. For each of the property names "hour", "minute", "second":
        // i. Call the [[DefineOwnProperty]] internal method of options with the
        //    property name, Property Descriptor {[[Value]]: "numeric", [[Writable]]:
        //    true, [[Enumerable]]: true, [[Configurable]]: true}, and false.
        options.hour = options.minute = options.second = 'numeric';

    // 9. Return options.
    return options;
}

/**
 * When the BasicFormatMatcher abstract operation is called with two arguments options and
 * formats, the following steps are taken:
 */
function BasicFormatMatcher(options, formats) {
    // 1. Let removalPenalty be 120.
    var removalPenalty = 120;

    // 2. Let additionPenalty be 20.
    var additionPenalty = 20;

    // 3. Let longLessPenalty be 8.
    var longLessPenalty = 8;

    // 4. Let longMorePenalty be 6.
    var longMorePenalty = 6;

    // 5. Let shortLessPenalty be 6.
    var shortLessPenalty = 6;

    // 6. Let shortMorePenalty be 3.
    var shortMorePenalty = 3;

    // 7. Let bestScore be -Infinity.
    var bestScore = -Infinity;

    // 8. Let bestFormat be undefined.
    var bestFormat = void 0;

    // 9. Let i be 0.
    var i = 0;

    // 10. Assert: formats is an Array object.

    // 11. Let len be the result of calling the [[Get]] internal method of formats with argument "length".
    var len = formats.length;

    // 12. Repeat while i < len:
    while (i < len) {
        // a. Let format be the result of calling the [[Get]] internal method of formats with argument ToString(i).
        var format = formats[i];

        // b. Let score be 0.
        var score = 0;

        // c. For each property shown in Table 3:
        for (var property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, property)) continue;

            // i. Let optionsProp be options.[[<property>]].
            var optionsProp = options['[[' + property + ']]'];

            // ii. Let formatPropDesc be the result of calling the [[GetOwnProperty]] internal method of format
            //     with argument property.
            // iii. If formatPropDesc is not undefined, then
            //     1. Let formatProp be the result of calling the [[Get]] internal method of format with argument property.
            var formatProp = hop.call(format, property) ? format[property] : undefined;

            // iv. If optionsProp is undefined and formatProp is not undefined, then decrease score by
            //     additionPenalty.
            if (optionsProp === undefined && formatProp !== undefined) score -= additionPenalty;

            // v. Else if optionsProp is not undefined and formatProp is undefined, then decrease score by
            //    removalPenalty.
            else if (optionsProp !== undefined && formatProp === undefined) score -= removalPenalty;

                // vi. Else
                else {
                        // 1. Let values be the array ["2-digit", "numeric", "narrow", "short",
                        //    "long"].
                        var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];

                        // 2. Let optionsPropIndex be the index of optionsProp within values.
                        var optionsPropIndex = arrIndexOf.call(values, optionsProp);

                        // 3. Let formatPropIndex be the index of formatProp within values.
                        var formatPropIndex = arrIndexOf.call(values, formatProp);

                        // 4. Let delta be max(min(formatPropIndex - optionsPropIndex, 2), -2).
                        var delta = Math.max(Math.min(formatPropIndex - optionsPropIndex, 2), -2);

                        // 5. If delta = 2, decrease score by longMorePenalty.
                        if (delta === 2) score -= longMorePenalty;

                        // 6. Else if delta = 1, decrease score by shortMorePenalty.
                        else if (delta === 1) score -= shortMorePenalty;

                            // 7. Else if delta = -1, decrease score by shortLessPenalty.
                            else if (delta === -1) score -= shortLessPenalty;

                                // 8. Else if delta = -2, decrease score by longLessPenalty.
                                else if (delta === -2) score -= longLessPenalty;
                    }
        }

        // d. If score > bestScore, then
        if (score > bestScore) {
            // i. Let bestScore be score.
            bestScore = score;

            // ii. Let bestFormat be format.
            bestFormat = format;
        }

        // e. Increase i by 1.
        i++;
    }

    // 13. Return bestFormat.
    return bestFormat;
}

/**
 * When the BestFitFormatMatcher abstract operation is called with two arguments options
 * and formats, it performs implementation dependent steps, which should return a set of
 * component representations that a typical user of the selected locale would perceive as
 * at least as good as the one returned by BasicFormatMatcher.
 *
 * This polyfill defines the algorithm to be the same as BasicFormatMatcher,
 * with the addition of bonus points awarded where the requested format is of
 * the same data type as the potentially matching format.
 *
 * This algo relies on the concept of closest distance matching described here:
 * http://unicode.org/reports/tr35/tr35-dates.html#Matching_Skeletons
 * Typically a “best match” is found using a closest distance match, such as:
 *
 * Symbols requesting a best choice for the locale are replaced.
 *      j → one of {H, k, h, K}; C → one of {a, b, B}
 * -> Covered by cldr.js matching process
 *
 * For fields with symbols representing the same type (year, month, day, etc):
 *     Most symbols have a small distance from each other.
 *         M ≅ L; E ≅ c; a ≅ b ≅ B; H ≅ k ≅ h ≅ K; ...
 *     -> Covered by cldr.js matching process
 *
 *     Width differences among fields, other than those marking text vs numeric, are given small distance from each other.
 *         MMM ≅ MMMM
 *         MM ≅ M
 *     Numeric and text fields are given a larger distance from each other.
 *         MMM ≈ MM
 *     Symbols representing substantial differences (week of year vs week of month) are given much larger a distances from each other.
 *         d ≋ D; ...
 *     Missing or extra fields cause a match to fail. (But see Missing Skeleton Fields).
 *
 *
 * For example,
 *
 *     { month: 'numeric', day: 'numeric' }
 *
 * should match
 *
 *     { month: '2-digit', day: '2-digit' }
 *
 * rather than
 *
 *     { month: 'short', day: 'numeric' }
 *
 * This makes sense because a user requesting a formatted date with numeric parts would
 * not expect to see the returned format containing narrow, short or long part names
 */
function BestFitFormatMatcher(options, formats) {
    /** Diverging: this block implements the hack for single property configuration, eg.:
     *
     *      `new Intl.DateTimeFormat('en', {day: 'numeric'})`
     *
     * should produce a single digit with the day of the month. This is needed because
     * CLDR `availableFormats` data structure doesn't cover these cases.
     */
    {
        var optionsPropNames = [];
        for (var property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, property)) continue;

            if (options['[[' + property + ']]'] !== undefined) {
                optionsPropNames.push(property);
            }
        }
        if (optionsPropNames.length === 1) {
            var _bestFormat = generateSyntheticFormat(optionsPropNames[0], options['[[' + optionsPropNames[0] + ']]']);
            if (_bestFormat) {
                return _bestFormat;
            }
        }
    }

    // 1. Let removalPenalty be 120.
    var removalPenalty = 120;

    // 2. Let additionPenalty be 20.
    var additionPenalty = 20;

    // 3. Let longLessPenalty be 8.
    var longLessPenalty = 8;

    // 4. Let longMorePenalty be 6.
    var longMorePenalty = 6;

    // 5. Let shortLessPenalty be 6.
    var shortLessPenalty = 6;

    // 6. Let shortMorePenalty be 3.
    var shortMorePenalty = 3;

    var patternPenalty = 2;

    var hour12Penalty = 1;

    // 7. Let bestScore be -Infinity.
    var bestScore = -Infinity;

    // 8. Let bestFormat be undefined.
    var bestFormat = void 0;

    // 9. Let i be 0.
    var i = 0;

    // 10. Assert: formats is an Array object.

    // 11. Let len be the result of calling the [[Get]] internal method of formats with argument "length".
    var len = formats.length;

    // 12. Repeat while i < len:
    while (i < len) {
        // a. Let format be the result of calling the [[Get]] internal method of formats with argument ToString(i).
        var format = formats[i];

        // b. Let score be 0.
        var score = 0;

        // c. For each property shown in Table 3:
        for (var _property in dateTimeComponents) {
            if (!hop.call(dateTimeComponents, _property)) continue;

            // i. Let optionsProp be options.[[<property>]].
            var optionsProp = options['[[' + _property + ']]'];

            // ii. Let formatPropDesc be the result of calling the [[GetOwnProperty]] internal method of format
            //     with argument property.
            // iii. If formatPropDesc is not undefined, then
            //     1. Let formatProp be the result of calling the [[Get]] internal method of format with argument property.
            var formatProp = hop.call(format, _property) ? format[_property] : undefined;

            // Diverging: using the default properties produced by the pattern/skeleton
            // to match it with user options, and apply a penalty
            var patternProp = hop.call(format._, _property) ? format._[_property] : undefined;
            if (optionsProp !== patternProp) {
                score -= patternPenalty;
            }

            // iv. If optionsProp is undefined and formatProp is not undefined, then decrease score by
            //     additionPenalty.
            if (optionsProp === undefined && formatProp !== undefined) score -= additionPenalty;

            // v. Else if optionsProp is not undefined and formatProp is undefined, then decrease score by
            //    removalPenalty.
            else if (optionsProp !== undefined && formatProp === undefined) score -= removalPenalty;

                // vi. Else
                else {
                        // 1. Let values be the array ["2-digit", "numeric", "narrow", "short",
                        //    "long"].
                        var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];

                        // 2. Let optionsPropIndex be the index of optionsProp within values.
                        var optionsPropIndex = arrIndexOf.call(values, optionsProp);

                        // 3. Let formatPropIndex be the index of formatProp within values.
                        var formatPropIndex = arrIndexOf.call(values, formatProp);

                        // 4. Let delta be max(min(formatPropIndex - optionsPropIndex, 2), -2).
                        var delta = Math.max(Math.min(formatPropIndex - optionsPropIndex, 2), -2);

                        {
                            // diverging from spec
                            // When the bestFit argument is true, subtract additional penalty where data types are not the same
                            if (formatPropIndex <= 1 && optionsPropIndex >= 2 || formatPropIndex >= 2 && optionsPropIndex <= 1) {
                                // 5. If delta = 2, decrease score by longMorePenalty.
                                if (delta > 0) score -= longMorePenalty;else if (delta < 0) score -= longLessPenalty;
                            } else {
                                // 5. If delta = 2, decrease score by longMorePenalty.
                                if (delta > 1) score -= shortMorePenalty;else if (delta < -1) score -= shortLessPenalty;
                            }
                        }
                    }
        }

        {
            // diverging to also take into consideration differences between 12 or 24 hours
            // which is special for the best fit only.
            if (format._.hour12 !== options.hour12) {
                score -= hour12Penalty;
            }
        }

        // d. If score > bestScore, then
        if (score > bestScore) {
            // i. Let bestScore be score.
            bestScore = score;
            // ii. Let bestFormat be format.
            bestFormat = format;
        }

        // e. Increase i by 1.
        i++;
    }

    // 13. Return bestFormat.
    return bestFormat;
}

/* 12.2.3 */internals.DateTimeFormat = {
    '[[availableLocales]]': [],
    '[[relevantExtensionKeys]]': ['ca', 'nu'],
    '[[localeData]]': {}
};

/**
 * When the supportedLocalesOf method of Intl.DateTimeFormat is called, the
 * following steps are taken:
 */
/* 12.2.2 */
defineProperty(Intl.DateTimeFormat, 'supportedLocalesOf', {
    configurable: true,
    writable: true,
    value: fnBind.call(function (locales) {
        // Bound functions only have the `this` value altered if being used as a constructor,
        // this lets us imitate a native function that has no constructor
        if (!hop.call(this, '[[availableLocales]]')) throw new TypeError('supportedLocalesOf() is not a constructor');

        // Create an object whose props can be used to restore the values of RegExp props
        var regexpRestore = createRegExpRestore(),


        // 1. If options is not provided, then let options be undefined.
        options = arguments[1],


        // 2. Let availableLocales be the value of the [[availableLocales]] internal
        //    property of the standard built-in object that is the initial value of
        //    Intl.NumberFormat.

        availableLocales = this['[[availableLocales]]'],


        // 3. Let requestedLocales be the result of calling the CanonicalizeLocaleList
        //    abstract operation (defined in 9.2.1) with argument locales.
        requestedLocales = CanonicalizeLocaleList(locales);

        // Restore the RegExp properties
        regexpRestore();

        // 4. Return the result of calling the SupportedLocales abstract operation
        //    (defined in 9.2.8) with arguments availableLocales, requestedLocales,
        //    and options.
        return SupportedLocales(availableLocales, requestedLocales, options);
    }, internals.NumberFormat)
});

/**
 * This named accessor property returns a function that formats a number
 * according to the effective locale and the formatting options of this
 * DateTimeFormat object.
 */
/* 12.3.2 */defineProperty(Intl.DateTimeFormat.prototype, 'format', {
    configurable: true,
    get: GetFormatDateTime
});

function GetFormatDateTime() {
    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    // Satisfy test 12.3_b
    if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for format() is not an initialized Intl.DateTimeFormat object.');

    // The value of the [[Get]] attribute is a function that takes the following
    // steps:

    // 1. If the [[boundFormat]] internal property of this DateTimeFormat object
    //    is undefined, then:
    if (internal['[[boundFormat]]'] === undefined) {
        // a. Let F be a Function object, with internal properties set as
        //    specified for built-in functions in ES5, 15, or successor, and the
        //    length property set to 0, that takes the argument date and
        //    performs the following steps:
        var F = function F() {
            var date = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

            //   i. If date is not provided or is undefined, then let x be the
            //      result as if by the expression Date.now() where Date.now is
            //      the standard built-in function defined in ES5, 15.9.4.4.
            //  ii. Else let x be ToNumber(date).
            // iii. Return the result of calling the FormatDateTime abstract
            //      operation (defined below) with arguments this and x.
            var x = date === undefined ? Date.now() : toNumber(date);
            return FormatDateTime(this, x);
        };
        // b. Let bind be the standard built-in function object defined in ES5,
        //    15.3.4.5.
        // c. Let bf be the result of calling the [[Call]] internal method of
        //    bind with F as the this value and an argument list containing
        //    the single item this.
        var bf = fnBind.call(F, this);
        // d. Set the [[boundFormat]] internal property of this NumberFormat
        //    object to bf.
        internal['[[boundFormat]]'] = bf;
    }
    // Return the value of the [[boundFormat]] internal property of this
    // NumberFormat object.
    return internal['[[boundFormat]]'];
}

function formatToParts$1() {
    var date = arguments.length <= 0 || arguments[0] === undefined ? undefined : arguments[0];

    var internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

    if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for formatToParts() is not an initialized Intl.DateTimeFormat object.');

    var x = date === undefined ? Date.now() : toNumber(date);
    return FormatToPartsDateTime(this, x);
}

Object.defineProperty(Intl.DateTimeFormat.prototype, 'formatToParts', {
    enumerable: false,
    writable: true,
    configurable: true,
    value: formatToParts$1
});

function CreateDateTimeParts(dateTimeFormat, x) {
    // 1. If x is not a finite Number, then throw a RangeError exception.
    if (!isFinite(x)) throw new RangeError('Invalid valid date passed to format');

    var internal = dateTimeFormat.__getInternalProperties(secret);

    // Creating restore point for properties on the RegExp object... please wait
    /* let regexpRestore = */createRegExpRestore(); // ###TODO: review this

    // 2. Let locale be the value of the [[locale]] internal property of dateTimeFormat.
    var locale = internal['[[locale]]'];

    // 3. Let nf be the result of creating a new NumberFormat object as if by the
    // expression new Intl.NumberFormat([locale], {useGrouping: false}) where
    // Intl.NumberFormat is the standard built-in constructor defined in 11.1.3.
    var nf = new Intl.NumberFormat([locale], { useGrouping: false });

    // 4. Let nf2 be the result of creating a new NumberFormat object as if by the
    // expression new Intl.NumberFormat([locale], {minimumIntegerDigits: 2, useGrouping:
    // false}) where Intl.NumberFormat is the standard built-in constructor defined in
    // 11.1.3.
    var nf2 = new Intl.NumberFormat([locale], { minimumIntegerDigits: 2, useGrouping: false });

    // 5. Let tm be the result of calling the ToLocalTime abstract operation (defined
    // below) with x, the value of the [[calendar]] internal property of dateTimeFormat,
    // and the value of the [[timeZone]] internal property of dateTimeFormat.
    var tm = ToLocalTime(x, internal['[[calendar]]'], internal['[[timeZone]]']);

    // 6. Let result be the value of the [[pattern]] internal property of dateTimeFormat.
    var pattern = internal['[[pattern]]'];

    // 7.
    var result = new List();

    // 8.
    var index = 0;

    // 9.
    var beginIndex = pattern.indexOf('{');

    // 10.
    var endIndex = 0;

    // Need the locale minus any extensions
    var dataLocale = internal['[[dataLocale]]'];

    // Need the calendar data from CLDR
    var localeData = internals.DateTimeFormat['[[localeData]]'][dataLocale].calendars;
    var ca = internal['[[calendar]]'];

    // 11.
    while (beginIndex !== -1) {
        var fv = void 0;
        // a.
        endIndex = pattern.indexOf('}', beginIndex);
        // b.
        if (endIndex === -1) {
            throw new Error('Unclosed pattern');
        }
        // c.
        if (beginIndex > index) {
            arrPush.call(result, {
                type: 'literal',
                value: pattern.substring(index, beginIndex)
            });
        }
        // d.
        var p = pattern.substring(beginIndex + 1, endIndex);
        // e.
        if (dateTimeComponents.hasOwnProperty(p)) {
            //   i. Let f be the value of the [[<p>]] internal property of dateTimeFormat.
            var f = internal['[[' + p + ']]'];
            //  ii. Let v be the value of tm.[[<p>]].
            var v = tm['[[' + p + ']]'];
            // iii. If p is "year" and v ≤ 0, then let v be 1 - v.
            if (p === 'year' && v <= 0) {
                v = 1 - v;
            }
            //  iv. If p is "month", then increase v by 1.
            else if (p === 'month') {
                    v++;
                }
                //   v. If p is "hour" and the value of the [[hour12]] internal property of
                //      dateTimeFormat is true, then
                else if (p === 'hour' && internal['[[hour12]]'] === true) {
                        // 1. Let v be v modulo 12.
                        v = v % 12;
                        // 2. If v is 0 and the value of the [[hourNo0]] internal property of
                        //    dateTimeFormat is true, then let v be 12.
                        if (v === 0 && internal['[[hourNo0]]'] === true) {
                            v = 12;
                        }
                    }

            //  vi. If f is "numeric", then
            if (f === 'numeric') {
                // 1. Let fv be the result of calling the FormatNumber abstract operation
                //    (defined in 11.3.2) with arguments nf and v.
                fv = FormatNumber(nf, v);
            }
            // vii. Else if f is "2-digit", then
            else if (f === '2-digit') {
                    // 1. Let fv be the result of calling the FormatNumber abstract operation
                    //    with arguments nf2 and v.
                    fv = FormatNumber(nf2, v);
                    // 2. If the length of fv is greater than 2, let fv be the substring of fv
                    //    containing the last two characters.
                    if (fv.length > 2) {
                        fv = fv.slice(-2);
                    }
                }
                // viii. Else if f is "narrow", "short", or "long", then let fv be a String
                //     value representing f in the desired form; the String value depends upon
                //     the implementation and the effective locale and calendar of
                //     dateTimeFormat. If p is "month", then the String value may also depend
                //     on whether dateTimeFormat has a [[day]] internal property. If p is
                //     "timeZoneName", then the String value may also depend on the value of
                //     the [[inDST]] field of tm.
                else if (f in dateWidths) {
                        switch (p) {
                            case 'month':
                                fv = resolveDateString(localeData, ca, 'months', f, tm['[[' + p + ']]']);
                                break;

                            case 'weekday':
                                try {
                                    fv = resolveDateString(localeData, ca, 'days', f, tm['[[' + p + ']]']);
                                    // fv = resolveDateString(ca.days, f)[tm['[['+ p +']]']];
                                } catch (e) {
                                    throw new Error('Could not find weekday data for locale ' + locale);
                                }
                                break;

                            case 'timeZoneName':
                                fv = ''; // ###TODO
                                break;

                            case 'era':
                                try {
                                    fv = resolveDateString(localeData, ca, 'eras', f, tm['[[' + p + ']]']);
                                } catch (e) {
                                    throw new Error('Could not find era data for locale ' + locale);
                                }
                                break;

                            default:
                                fv = tm['[[' + p + ']]'];
                        }
                    }
            // ix
            arrPush.call(result, {
                type: p,
                value: fv
            });
            // f.
        } else if (p === 'ampm') {
            // i.
            var _v = tm['[[hour]]'];
            // ii./iii.
            fv = resolveDateString(localeData, ca, 'dayPeriods', _v > 11 ? 'pm' : 'am', null);
            // iv.
            arrPush.call(result, {
                type: 'dayPeriod',
                value: fv
            });
            // g.
        } else {
            arrPush.call(result, {
                type: 'literal',
                value: pattern.substring(beginIndex, endIndex + 1)
            });
        }
        // h.
        index = endIndex + 1;
        // i.
        beginIndex = pattern.indexOf('{', index);
    }
    // 12.
    if (endIndex < pattern.length - 1) {
        arrPush.call(result, {
            type: 'literal',
            value: pattern.substr(endIndex + 1)
        });
    }
    // 13.
    return result;
}

/**
 * When the FormatDateTime abstract operation is called with arguments dateTimeFormat
 * (which must be an object initialized as a DateTimeFormat) and x (which must be a Number
 * value), it returns a String value representing x (interpreted as a time value as
 * specified in ES5, 15.9.1.1) according to the effective locale and the formatting
 * options of dateTimeFormat.
 */
function FormatDateTime(dateTimeFormat, x) {
    var parts = CreateDateTimeParts(dateTimeFormat, x);
    var result = '';

    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        result += part.value;
    }
    return result;
}

function FormatToPartsDateTime(dateTimeFormat, x) {
    var parts = CreateDateTimeParts(dateTimeFormat, x);
    var result = [];
    for (var i = 0; parts.length > i; i++) {
        var part = parts[i];
        result.push({
            type: part.type,
            value: part.value
        });
    }
    return result;
}

/**
 * When the ToLocalTime abstract operation is called with arguments date, calendar, and
 * timeZone, the following steps are taken:
 */
function ToLocalTime(date, calendar, timeZone) {
    // 1. Apply calendrical calculations on date for the given calendar and time zone to
    //    produce weekday, era, year, month, day, hour, minute, second, and inDST values.
    //    The calculations should use best available information about the specified
    //    calendar and time zone. If the calendar is "gregory", then the calculations must
    //    match the algorithms specified in ES5, 15.9.1, except that calculations are not
    //    bound by the restrictions on the use of best available information on time zones
    //    for local time zone adjustment and daylight saving time adjustment imposed by
    //    ES5, 15.9.1.7 and 15.9.1.8.
    // ###TODO###
    var d = new Date(date),
        m = 'get' + (timeZone || '');

    // 2. Return a Record with fields [[weekday]], [[era]], [[year]], [[month]], [[day]],
    //    [[hour]], [[minute]], [[second]], and [[inDST]], each with the corresponding
    //    calculated value.
    return new Record({
        '[[weekday]]': d[m + 'Day'](),
        '[[era]]': +(d[m + 'FullYear']() >= 0),
        '[[year]]': d[m + 'FullYear'](),
        '[[month]]': d[m + 'Month'](),
        '[[day]]': d[m + 'Date'](),
        '[[hour]]': d[m + 'Hours'](),
        '[[minute]]': d[m + 'Minutes'](),
        '[[second]]': d[m + 'Seconds'](),
        '[[inDST]]': false // ###TODO###
    });
}

/**
 * The function returns a new object whose properties and attributes are set as if
 * constructed by an object literal assigning to each of the following properties the
 * value of the corresponding internal property of this DateTimeFormat object (see 12.4):
 * locale, calendar, numberingSystem, timeZone, hour12, weekday, era, year, month, day,
 * hour, minute, second, and timeZoneName. Properties whose corresponding internal
 * properties are not present are not assigned.
 */
/* 12.3.3 */defineProperty(Intl.DateTimeFormat.prototype, 'resolvedOptions', {
    writable: true,
    configurable: true,
    value: function value() {
        var prop = void 0,
            descs = new Record(),
            props = ['locale', 'calendar', 'numberingSystem', 'timeZone', 'hour12', 'weekday', 'era', 'year', 'month', 'day', 'hour', 'minute', 'second', 'timeZoneName'],
            internal = this !== null && babelHelpers$1["typeof"](this) === 'object' && getInternalProperties(this);

        // Satisfy test 12.3_b
        if (!internal || !internal['[[initializedDateTimeFormat]]']) throw new TypeError('`this` value for resolvedOptions() is not an initialized Intl.DateTimeFormat object.');

        for (var i = 0, max = props.length; i < max; i++) {
            if (hop.call(internal, prop = '[[' + props[i] + ']]')) descs[props[i]] = { value: internal[prop], writable: true, configurable: true, enumerable: true };
        }

        return objCreate({}, descs);
    }
});

var ls = Intl.__localeSensitiveProtos = {
    Number: {},
    Date: {}
};

/**
 * When the toLocaleString method is called with optional arguments locales and options,
 * the following steps are taken:
 */
/* 13.2.1 */ls.Number.toLocaleString = function () {
    // Satisfy test 13.2.1_1
    if (Object.prototype.toString.call(this) !== '[object Number]') throw new TypeError('`this` value must be a number for Number.prototype.toLocaleString()');

    // 1. Let x be this Number value (as defined in ES5, 15.7.4).
    // 2. If locales is not provided, then let locales be undefined.
    // 3. If options is not provided, then let options be undefined.
    // 4. Let numberFormat be the result of creating a new object as if by the
    //    expression new Intl.NumberFormat(locales, options) where
    //    Intl.NumberFormat is the standard built-in constructor defined in 11.1.3.
    // 5. Return the result of calling the FormatNumber abstract operation
    //    (defined in 11.3.2) with arguments numberFormat and x.
    return FormatNumber(new NumberFormatConstructor(arguments[0], arguments[1]), this);
};

/**
 * When the toLocaleString method is called with optional arguments locales and options,
 * the following steps are taken:
 */
/* 13.3.1 */ls.Date.toLocaleString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0];

    // 4. If options is not provided, then let options be undefined.
    var options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "any", and "all".
    options = ToDateTimeOptions(options, 'any', 'all');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

/**
 * When the toLocaleDateString method is called with optional arguments locales and
 * options, the following steps are taken:
 */
/* 13.3.2 */ls.Date.toLocaleDateString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleDateString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0],


    // 4. If options is not provided, then let options be undefined.
    options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "date", and "date".
    options = ToDateTimeOptions(options, 'date', 'date');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

/**
 * When the toLocaleTimeString method is called with optional arguments locales and
 * options, the following steps are taken:
 */
/* 13.3.3 */ls.Date.toLocaleTimeString = function () {
    // Satisfy test 13.3.0_1
    if (Object.prototype.toString.call(this) !== '[object Date]') throw new TypeError('`this` value must be a Date instance for Date.prototype.toLocaleTimeString()');

    // 1. Let x be this time value (as defined in ES5, 15.9.5).
    var x = +this;

    // 2. If x is NaN, then return "Invalid Date".
    if (isNaN(x)) return 'Invalid Date';

    // 3. If locales is not provided, then let locales be undefined.
    var locales = arguments[0];

    // 4. If options is not provided, then let options be undefined.
    var options = arguments[1];

    // 5. Let options be the result of calling the ToDateTimeOptions abstract
    //    operation (defined in 12.1.1) with arguments options, "time", and "time".
    options = ToDateTimeOptions(options, 'time', 'time');

    // 6. Let dateTimeFormat be the result of creating a new object as if by the
    //    expression new Intl.DateTimeFormat(locales, options) where
    //    Intl.DateTimeFormat is the standard built-in constructor defined in 12.1.3.
    var dateTimeFormat = new DateTimeFormatConstructor(locales, options);

    // 7. Return the result of calling the FormatDateTime abstract operation (defined
    //    in 12.3.2) with arguments dateTimeFormat and x.
    return FormatDateTime(dateTimeFormat, x);
};

defineProperty(Intl, '__applyLocaleSensitivePrototypes', {
    writable: true,
    configurable: true,
    value: function value() {
        defineProperty(Number.prototype, 'toLocaleString', { writable: true, configurable: true, value: ls.Number.toLocaleString });
        // Need this here for IE 8, to avoid the _DontEnum_ bug
        defineProperty(Date.prototype, 'toLocaleString', { writable: true, configurable: true, value: ls.Date.toLocaleString });

        for (var k in ls.Date) {
            if (hop.call(ls.Date, k)) defineProperty(Date.prototype, k, { writable: true, configurable: true, value: ls.Date[k] });
        }
    }
});

/**
 * Can't really ship a single script with data for hundreds of locales, so we provide
 * this __addLocaleData method as a means for the developer to add the data on an
 * as-needed basis
 */
defineProperty(Intl, '__addLocaleData', {
    value: function value(data) {
        if (!IsStructurallyValidLanguageTag(data.locale)) throw new Error("Object passed doesn't identify itself with a valid language tag");

        addLocaleData(data, data.locale);
    }
});

function addLocaleData(data, tag) {
    // Both NumberFormat and DateTimeFormat require number data, so throw if it isn't present
    if (!data.number) throw new Error("Object passed doesn't contain locale data for Intl.NumberFormat");

    var locale = void 0,
        locales = [tag],
        parts = tag.split('-');

    // Create fallbacks for locale data with scripts, e.g. Latn, Hans, Vaii, etc
    if (parts.length > 2 && parts[1].length === 4) arrPush.call(locales, parts[0] + '-' + parts[2]);

    while (locale = arrShift.call(locales)) {
        // Add to NumberFormat internal properties as per 11.2.3
        arrPush.call(internals.NumberFormat['[[availableLocales]]'], locale);
        internals.NumberFormat['[[localeData]]'][locale] = data.number;

        // ...and DateTimeFormat internal properties as per 12.2.3
        if (data.date) {
            data.date.nu = data.number.nu;
            arrPush.call(internals.DateTimeFormat['[[availableLocales]]'], locale);
            internals.DateTimeFormat['[[localeData]]'][locale] = data.date;
        }
    }

    // If this is the first set of locale data added, make it the default
    if (defaultLocale === undefined) setDefaultLocale(tag);
}

defineProperty(Intl, '__disableRegExpRestore', {
    value: function value() {
        internals.disableRegExpRestore = true;
    }
});

module.exports = Intl;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],27:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],28:[function(require,module,exports){
'use strict';

var range; // Create a range object for efficently rendering strings to elements.
var NS_XHTML = 'http://www.w3.org/1999/xhtml';

var doc = typeof document === 'undefined' ? undefined : document;

var testEl = doc ?
    doc.body || doc.createElement('div') :
    {};

// Fixes <https://github.com/patrick-steele-idem/morphdom/issues/32>
// (IE7+ support) <=IE7 does not support el.hasAttribute(name)
var actualHasAttributeNS;

if (testEl.hasAttributeNS) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttributeNS(namespaceURI, name);
    };
} else if (testEl.hasAttribute) {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.hasAttribute(name);
    };
} else {
    actualHasAttributeNS = function(el, namespaceURI, name) {
        return el.getAttributeNode(namespaceURI, name) != null;
    };
}

var hasAttributeNS = actualHasAttributeNS;


function toElement(str) {
    if (!range && doc.createRange) {
        range = doc.createRange();
        range.selectNode(doc.body);
    }

    var fragment;
    if (range && range.createContextualFragment) {
        fragment = range.createContextualFragment(str);
    } else {
        fragment = doc.createElement('body');
        fragment.innerHTML = str;
    }
    return fragment.childNodes[0];
}

/**
 * Returns true if two node's names are the same.
 *
 * NOTE: We don't bother checking `namespaceURI` because you will never find two HTML elements with the same
 *       nodeName and different namespace URIs.
 *
 * @param {Element} a
 * @param {Element} b The target element
 * @return {boolean}
 */
function compareNodeNames(fromEl, toEl) {
    var fromNodeName = fromEl.nodeName;
    var toNodeName = toEl.nodeName;

    if (fromNodeName === toNodeName) {
        return true;
    }

    if (toEl.actualize &&
        fromNodeName.charCodeAt(0) < 91 && /* from tag name is upper case */
        toNodeName.charCodeAt(0) > 90 /* target tag name is lower case */) {
        // If the target element is a virtual DOM node then we may need to normalize the tag name
        // before comparing. Normal HTML elements that are in the "http://www.w3.org/1999/xhtml"
        // are converted to upper case
        return fromNodeName === toNodeName.toUpperCase();
    } else {
        return false;
    }
}

/**
 * Create an element, optionally with a known namespace URI.
 *
 * @param {string} name the element name, e.g. 'div' or 'svg'
 * @param {string} [namespaceURI] the element's namespace URI, i.e. the value of
 * its `xmlns` attribute or its inferred namespace.
 *
 * @return {Element}
 */
function createElementNS(name, namespaceURI) {
    return !namespaceURI || namespaceURI === NS_XHTML ?
        doc.createElement(name) :
        doc.createElementNS(namespaceURI, name);
}

/**
 * Copies the children of one DOM element to another DOM element
 */
function moveChildren(fromEl, toEl) {
    var curChild = fromEl.firstChild;
    while (curChild) {
        var nextChild = curChild.nextSibling;
        toEl.appendChild(curChild);
        curChild = nextChild;
    }
    return toEl;
}

function morphAttrs(fromNode, toNode) {
    var attrs = toNode.attributes;
    var i;
    var attr;
    var attrName;
    var attrNamespaceURI;
    var attrValue;
    var fromValue;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        attrName = attr.name;
        attrNamespaceURI = attr.namespaceURI;
        attrValue = attr.value;

        if (attrNamespaceURI) {
            attrName = attr.localName || attrName;
            fromValue = fromNode.getAttributeNS(attrNamespaceURI, attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttributeNS(attrNamespaceURI, attrName, attrValue);
            }
        } else {
            fromValue = fromNode.getAttribute(attrName);

            if (fromValue !== attrValue) {
                fromNode.setAttribute(attrName, attrValue);
            }
        }
    }

    // Remove any extra attributes found on the original DOM element that
    // weren't found on the target element.
    attrs = fromNode.attributes;

    for (i = attrs.length - 1; i >= 0; --i) {
        attr = attrs[i];
        if (attr.specified !== false) {
            attrName = attr.name;
            attrNamespaceURI = attr.namespaceURI;

            if (attrNamespaceURI) {
                attrName = attr.localName || attrName;

                if (!hasAttributeNS(toNode, attrNamespaceURI, attrName)) {
                    fromNode.removeAttributeNS(attrNamespaceURI, attrName);
                }
            } else {
                if (!hasAttributeNS(toNode, null, attrName)) {
                    fromNode.removeAttribute(attrName);
                }
            }
        }
    }
}

function syncBooleanAttrProp(fromEl, toEl, name) {
    if (fromEl[name] !== toEl[name]) {
        fromEl[name] = toEl[name];
        if (fromEl[name]) {
            fromEl.setAttribute(name, '');
        } else {
            fromEl.removeAttribute(name, '');
        }
    }
}

var specialElHandlers = {
    /**
     * Needed for IE. Apparently IE doesn't think that "selected" is an
     * attribute when reading over the attributes using selectEl.attributes
     */
    OPTION: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'selected');
    },
    /**
     * The "value" attribute is special for the <input> element since it sets
     * the initial value. Changing the "value" attribute without changing the
     * "value" property will have no effect since it is only used to the set the
     * initial value.  Similar for the "checked" attribute, and "disabled".
     */
    INPUT: function(fromEl, toEl) {
        syncBooleanAttrProp(fromEl, toEl, 'checked');
        syncBooleanAttrProp(fromEl, toEl, 'disabled');

        if (fromEl.value !== toEl.value) {
            fromEl.value = toEl.value;
        }

        if (!hasAttributeNS(toEl, null, 'value')) {
            fromEl.removeAttribute('value');
        }
    },

    TEXTAREA: function(fromEl, toEl) {
        var newValue = toEl.value;
        if (fromEl.value !== newValue) {
            fromEl.value = newValue;
        }

        var firstChild = fromEl.firstChild;
        if (firstChild) {
            // Needed for IE. Apparently IE sets the placeholder as the
            // node value and vise versa. This ignores an empty update.
            var oldValue = firstChild.nodeValue;

            if (oldValue == newValue || (!newValue && oldValue == fromEl.placeholder)) {
                return;
            }

            firstChild.nodeValue = newValue;
        }
    },
    SELECT: function(fromEl, toEl) {
        if (!hasAttributeNS(toEl, null, 'multiple')) {
            var selectedIndex = -1;
            var i = 0;
            var curChild = toEl.firstChild;
            while(curChild) {
                var nodeName = curChild.nodeName;
                if (nodeName && nodeName.toUpperCase() === 'OPTION') {
                    if (hasAttributeNS(curChild, null, 'selected')) {
                        selectedIndex = i;
                        break;
                    }
                    i++;
                }
                curChild = curChild.nextSibling;
            }

            fromEl.selectedIndex = i;
        }
    }
};

var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var COMMENT_NODE = 8;

function noop() {}

function defaultGetNodeKey(node) {
    return node.id;
}

function morphdomFactory(morphAttrs) {

    return function morphdom(fromNode, toNode, options) {
        if (!options) {
            options = {};
        }

        if (typeof toNode === 'string') {
            if (fromNode.nodeName === '#document' || fromNode.nodeName === 'HTML') {
                var toNodeHtml = toNode;
                toNode = doc.createElement('html');
                toNode.innerHTML = toNodeHtml;
            } else {
                toNode = toElement(toNode);
            }
        }

        var getNodeKey = options.getNodeKey || defaultGetNodeKey;
        var onBeforeNodeAdded = options.onBeforeNodeAdded || noop;
        var onNodeAdded = options.onNodeAdded || noop;
        var onBeforeElUpdated = options.onBeforeElUpdated || noop;
        var onElUpdated = options.onElUpdated || noop;
        var onBeforeNodeDiscarded = options.onBeforeNodeDiscarded || noop;
        var onNodeDiscarded = options.onNodeDiscarded || noop;
        var onBeforeElChildrenUpdated = options.onBeforeElChildrenUpdated || noop;
        var childrenOnly = options.childrenOnly === true;

        // This object is used as a lookup to quickly find all keyed elements in the original DOM tree.
        var fromNodesLookup = {};
        var keyedRemovalList;

        function addKeyedRemoval(key) {
            if (keyedRemovalList) {
                keyedRemovalList.push(key);
            } else {
                keyedRemovalList = [key];
            }
        }

        function walkDiscardedChildNodes(node, skipKeyedNodes) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {

                    var key = undefined;

                    if (skipKeyedNodes && (key = getNodeKey(curChild))) {
                        // If we are skipping keyed nodes then we add the key
                        // to a list so that it can be handled at the very end.
                        addKeyedRemoval(key);
                    } else {
                        // Only report the node as discarded if it is not keyed. We do this because
                        // at the end we loop through all keyed elements that were unmatched
                        // and then discard them in one final pass.
                        onNodeDiscarded(curChild);
                        if (curChild.firstChild) {
                            walkDiscardedChildNodes(curChild, skipKeyedNodes);
                        }
                    }

                    curChild = curChild.nextSibling;
                }
            }
        }

        /**
         * Removes a DOM node out of the original DOM
         *
         * @param  {Node} node The node to remove
         * @param  {Node} parentNode The nodes parent
         * @param  {Boolean} skipKeyedNodes If true then elements with keys will be skipped and not discarded.
         * @return {undefined}
         */
        function removeNode(node, parentNode, skipKeyedNodes) {
            if (onBeforeNodeDiscarded(node) === false) {
                return;
            }

            if (parentNode) {
                parentNode.removeChild(node);
            }

            onNodeDiscarded(node);
            walkDiscardedChildNodes(node, skipKeyedNodes);
        }

        // // TreeWalker implementation is no faster, but keeping this around in case this changes in the future
        // function indexTree(root) {
        //     var treeWalker = document.createTreeWalker(
        //         root,
        //         NodeFilter.SHOW_ELEMENT);
        //
        //     var el;
        //     while((el = treeWalker.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        // // NodeIterator implementation is no faster, but keeping this around in case this changes in the future
        //
        // function indexTree(node) {
        //     var nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
        //     var el;
        //     while((el = nodeIterator.nextNode())) {
        //         var key = getNodeKey(el);
        //         if (key) {
        //             fromNodesLookup[key] = el;
        //         }
        //     }
        // }

        function indexTree(node) {
            if (node.nodeType === ELEMENT_NODE) {
                var curChild = node.firstChild;
                while (curChild) {
                    var key = getNodeKey(curChild);
                    if (key) {
                        fromNodesLookup[key] = curChild;
                    }

                    // Walk recursively
                    indexTree(curChild);

                    curChild = curChild.nextSibling;
                }
            }
        }

        indexTree(fromNode);

        function handleNodeAdded(el) {
            onNodeAdded(el);

            var curChild = el.firstChild;
            while (curChild) {
                var nextSibling = curChild.nextSibling;

                var key = getNodeKey(curChild);
                if (key) {
                    var unmatchedFromEl = fromNodesLookup[key];
                    if (unmatchedFromEl && compareNodeNames(curChild, unmatchedFromEl)) {
                        curChild.parentNode.replaceChild(unmatchedFromEl, curChild);
                        morphEl(unmatchedFromEl, curChild);
                    }
                }

                handleNodeAdded(curChild);
                curChild = nextSibling;
            }
        }

        function morphEl(fromEl, toEl, childrenOnly) {
            var toElKey = getNodeKey(toEl);
            var curFromNodeKey;

            if (toElKey) {
                // If an element with an ID is being morphed then it is will be in the final
                // DOM so clear it out of the saved elements collection
                delete fromNodesLookup[toElKey];
            }

            if (toNode.isSameNode && toNode.isSameNode(fromNode)) {
                return;
            }

            if (!childrenOnly) {
                if (onBeforeElUpdated(fromEl, toEl) === false) {
                    return;
                }

                morphAttrs(fromEl, toEl);
                onElUpdated(fromEl);

                if (onBeforeElChildrenUpdated(fromEl, toEl) === false) {
                    return;
                }
            }

            if (fromEl.nodeName !== 'TEXTAREA') {
                var curToNodeChild = toEl.firstChild;
                var curFromNodeChild = fromEl.firstChild;
                var curToNodeKey;

                var fromNextSibling;
                var toNextSibling;
                var matchingFromEl;

                outer: while (curToNodeChild) {
                    toNextSibling = curToNodeChild.nextSibling;
                    curToNodeKey = getNodeKey(curToNodeChild);

                    while (curFromNodeChild) {
                        fromNextSibling = curFromNodeChild.nextSibling;

                        if (curToNodeChild.isSameNode && curToNodeChild.isSameNode(curFromNodeChild)) {
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        curFromNodeKey = getNodeKey(curFromNodeChild);

                        var curFromNodeType = curFromNodeChild.nodeType;

                        var isCompatible = undefined;

                        if (curFromNodeType === curToNodeChild.nodeType) {
                            if (curFromNodeType === ELEMENT_NODE) {
                                // Both nodes being compared are Element nodes

                                if (curToNodeKey) {
                                    // The target node has a key so we want to match it up with the correct element
                                    // in the original DOM tree
                                    if (curToNodeKey !== curFromNodeKey) {
                                        // The current element in the original DOM tree does not have a matching key so
                                        // let's check our lookup to see if there is a matching element in the original
                                        // DOM tree
                                        if ((matchingFromEl = fromNodesLookup[curToNodeKey])) {
                                            if (curFromNodeChild.nextSibling === matchingFromEl) {
                                                // Special case for single element removals. To avoid removing the original
                                                // DOM node out of the tree (since that can break CSS transitions, etc.),
                                                // we will instead discard the current node and wait until the next
                                                // iteration to properly match up the keyed target element with its matching
                                                // element in the original tree
                                                isCompatible = false;
                                            } else {
                                                // We found a matching keyed element somewhere in the original DOM tree.
                                                // Let's moving the original DOM node into the current position and morph
                                                // it.

                                                // NOTE: We use insertBefore instead of replaceChild because we want to go through
                                                // the `removeNode()` function for the node that is being discarded so that
                                                // all lifecycle hooks are correctly invoked
                                                fromEl.insertBefore(matchingFromEl, curFromNodeChild);

                                                fromNextSibling = curFromNodeChild.nextSibling;

                                                if (curFromNodeKey) {
                                                    // Since the node is keyed it might be matched up later so we defer
                                                    // the actual removal to later
                                                    addKeyedRemoval(curFromNodeKey);
                                                } else {
                                                    // NOTE: we skip nested keyed nodes from being removed since there is
                                                    //       still a chance they will be matched up later
                                                    removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                                                }

                                                curFromNodeChild = matchingFromEl;
                                            }
                                        } else {
                                            // The nodes are not compatible since the "to" node has a key and there
                                            // is no matching keyed node in the source tree
                                            isCompatible = false;
                                        }
                                    }
                                } else if (curFromNodeKey) {
                                    // The original has a key
                                    isCompatible = false;
                                }

                                isCompatible = isCompatible !== false && compareNodeNames(curFromNodeChild, curToNodeChild);
                                if (isCompatible) {
                                    // We found compatible DOM elements so transform
                                    // the current "from" node to match the current
                                    // target DOM node.
                                    morphEl(curFromNodeChild, curToNodeChild);
                                }

                            } else if (curFromNodeType === TEXT_NODE || curFromNodeType == COMMENT_NODE) {
                                // Both nodes being compared are Text or Comment nodes
                                isCompatible = true;
                                // Simply update nodeValue on the original node to
                                // change the text value
                                if (curFromNodeChild.nodeValue !== curToNodeChild.nodeValue) {
                                    curFromNodeChild.nodeValue = curToNodeChild.nodeValue;
                                }

                            }
                        }

                        if (isCompatible) {
                            // Advance both the "to" child and the "from" child since we found a match
                            curToNodeChild = toNextSibling;
                            curFromNodeChild = fromNextSibling;
                            continue outer;
                        }

                        // No compatible match so remove the old node from the DOM and continue trying to find a
                        // match in the original DOM. However, we only do this if the from node is not keyed
                        // since it is possible that a keyed node might match up with a node somewhere else in the
                        // target tree and we don't want to discard it just yet since it still might find a
                        // home in the final DOM tree. After everything is done we will remove any keyed nodes
                        // that didn't find a home
                        if (curFromNodeKey) {
                            // Since the node is keyed it might be matched up later so we defer
                            // the actual removal to later
                            addKeyedRemoval(curFromNodeKey);
                        } else {
                            // NOTE: we skip nested keyed nodes from being removed since there is
                            //       still a chance they will be matched up later
                            removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                        }

                        curFromNodeChild = fromNextSibling;
                    }

                    // If we got this far then we did not find a candidate match for
                    // our "to node" and we exhausted all of the children "from"
                    // nodes. Therefore, we will just append the current "to" node
                    // to the end
                    if (curToNodeKey && (matchingFromEl = fromNodesLookup[curToNodeKey]) && compareNodeNames(matchingFromEl, curToNodeChild)) {
                        fromEl.appendChild(matchingFromEl);
                        morphEl(matchingFromEl, curToNodeChild);
                    } else {
                        var onBeforeNodeAddedResult = onBeforeNodeAdded(curToNodeChild);
                        if (onBeforeNodeAddedResult !== false) {
                            if (onBeforeNodeAddedResult) {
                                curToNodeChild = onBeforeNodeAddedResult;
                            }

                            if (curToNodeChild.actualize) {
                                curToNodeChild = curToNodeChild.actualize(fromEl.ownerDocument || doc);
                            }
                            fromEl.appendChild(curToNodeChild);
                            handleNodeAdded(curToNodeChild);
                        }
                    }

                    curToNodeChild = toNextSibling;
                    curFromNodeChild = fromNextSibling;
                }

                // We have processed all of the "to nodes". If curFromNodeChild is
                // non-null then we still have some from nodes left over that need
                // to be removed
                while (curFromNodeChild) {
                    fromNextSibling = curFromNodeChild.nextSibling;
                    if ((curFromNodeKey = getNodeKey(curFromNodeChild))) {
                        // Since the node is keyed it might be matched up later so we defer
                        // the actual removal to later
                        addKeyedRemoval(curFromNodeKey);
                    } else {
                        // NOTE: we skip nested keyed nodes from being removed since there is
                        //       still a chance they will be matched up later
                        removeNode(curFromNodeChild, fromEl, true /* skip keyed nodes */);
                    }
                    curFromNodeChild = fromNextSibling;
                }
            }

            var specialElHandler = specialElHandlers[fromEl.nodeName];
            if (specialElHandler) {
                specialElHandler(fromEl, toEl);
            }
        } // END: morphEl(...)

        var morphedNode = fromNode;
        var morphedNodeType = morphedNode.nodeType;
        var toNodeType = toNode.nodeType;

        if (!childrenOnly) {
            // Handle the case where we are given two DOM nodes that are not
            // compatible (e.g. <div> --> <span> or <div> --> TEXT)
            if (morphedNodeType === ELEMENT_NODE) {
                if (toNodeType === ELEMENT_NODE) {
                    if (!compareNodeNames(fromNode, toNode)) {
                        onNodeDiscarded(fromNode);
                        morphedNode = moveChildren(fromNode, createElementNS(toNode.nodeName, toNode.namespaceURI));
                    }
                } else {
                    // Going from an element node to a text node
                    morphedNode = toNode;
                }
            } else if (morphedNodeType === TEXT_NODE || morphedNodeType === COMMENT_NODE) { // Text or comment node
                if (toNodeType === morphedNodeType) {
                    if (morphedNode.nodeValue !== toNode.nodeValue) {
                        morphedNode.nodeValue = toNode.nodeValue;
                    }

                    return morphedNode;
                } else {
                    // Text node to something else
                    morphedNode = toNode;
                }
            }
        }

        if (morphedNode === toNode) {
            // The "to node" was not compatible with the "from node" so we had to
            // toss out the "from node" and use the "to node"
            onNodeDiscarded(fromNode);
        } else {
            morphEl(morphedNode, toNode, childrenOnly);

            // We now need to loop over any keyed nodes that might need to be
            // removed. We only do the removal if we know that the keyed node
            // never found a match. When a keyed node is matched up we remove
            // it out of fromNodesLookup and we use fromNodesLookup to determine
            // if a keyed node has been matched up or not
            if (keyedRemovalList) {
                for (var i=0, len=keyedRemovalList.length; i<len; i++) {
                    var elToRemove = fromNodesLookup[keyedRemovalList[i]];
                    if (elToRemove) {
                        removeNode(elToRemove, elToRemove.parentNode, false);
                    }
                }
            }
        }

        if (!childrenOnly && morphedNode !== fromNode && fromNode.parentNode) {
            if (morphedNode.actualize) {
                morphedNode = morphedNode.actualize(fromNode.ownerDocument || doc);
            }
            // If we had to swap out the from node with a new node because the old
            // node was not compatible with the target node then we need to
            // replace the old DOM node in the original DOM tree. This is only
            // possible if the original DOM node was part of a DOM tree which
            // we know is the case if it has a parent node.
            fromNode.parentNode.replaceChild(morphedNode, fromNode);
        }

        return morphedNode;
    };
}

var morphdom = morphdomFactory(morphAttrs);

module.exports = morphdom;

},{}],29:[function(require,module,exports){
/* global MutationObserver */
var document = require('global/document')
var window = require('global/window')
var watch = Object.create(null)
var KEY_ID = 'onloadid' + (new Date() % 9e6).toString(36)
var KEY_ATTR = 'data-' + KEY_ID
var INDEX = 0

if (window && window.MutationObserver) {
  var observer = new MutationObserver(function (mutations) {
    if (Object.keys(watch).length < 1) return
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].attributeName === KEY_ATTR) {
        eachAttr(mutations[i], turnon, turnoff)
        continue
      }
      eachMutation(mutations[i].removedNodes, turnoff)
      eachMutation(mutations[i].addedNodes, turnon)
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [KEY_ATTR]
  })
}

module.exports = function onload (el, on, off, caller) {
  on = on || function () {}
  off = off || function () {}
  el.setAttribute(KEY_ATTR, 'o' + INDEX)
  watch['o' + INDEX] = [on, off, 0, caller || onload.caller]
  INDEX += 1
  return el
}

function turnon (index, el) {
  if (watch[index][0] && watch[index][2] === 0) {
    watch[index][0](el)
    watch[index][2] = 1
  }
}

function turnoff (index, el) {
  if (watch[index][1] && watch[index][2] === 1) {
    watch[index][1](el)
    watch[index][2] = 0
  }
}

function eachAttr (mutation, on, off) {
  var newValue = mutation.target.getAttribute(KEY_ATTR)
  if (sameOrigin(mutation.oldValue, newValue)) {
    watch[newValue] = watch[mutation.oldValue]
    return
  }
  if (watch[mutation.oldValue]) {
    off(mutation.oldValue, mutation.target)
  }
  if (watch[newValue]) {
    on(newValue, mutation.target)
  }
}

function sameOrigin (oldValue, newValue) {
  if (!oldValue || !newValue) return false
  return watch[oldValue][3] === watch[newValue][3]
}

function eachMutation (nodes, fn) {
  var keys = Object.keys(watch)
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] && nodes[i].getAttribute && nodes[i].getAttribute(KEY_ATTR)) {
      var onloadid = nodes[i].getAttribute(KEY_ATTR)
      keys.forEach(function (k) {
        if (onloadid === k) {
          fn(k, nodes[i])
        }
      })
    }
    if (nodes[i].childNodes.length > 0) {
      eachMutation(nodes[i].childNodes, fn)
    }
  }
}

},{"global/document":4,"global/window":5}],30:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":32,"path-to-regexp":31}],31:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":27}],32:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],33:[function(require,module,exports){

var orig = document.title;

exports = module.exports = set;

function set(str) {
  var i = 1;
  var args = arguments;
  document.title = str.replace(/%[os]/g, function(_){
    switch (_) {
      case '%o':
        return orig;
      case '%s':
        return args[i++];
    }
  });
}

exports.reset = function(){
  set(orig);
};

},{}],34:[function(require,module,exports){
var bel = require('bel') // turns template tag into DOM elements
var morphdom = require('morphdom') // efficiently diffs + morphs two DOM elements
var defaultEvents = require('./update-events.js') // default events to be copied when dom elements update

module.exports = bel

// TODO move this + defaultEvents to a new module once we receive more feedback
module.exports.update = function (fromNode, toNode, opts) {
  if (!opts) opts = {}
  if (opts.events !== false) {
    if (!opts.onBeforeElUpdated) opts.onBeforeElUpdated = copier
  }

  return morphdom(fromNode, toNode, opts)

  // morphdom only copies attributes. we decided we also wanted to copy events
  // that can be set via attributes
  function copier (f, t) {
    // copy events:
    var events = opts.events || defaultEvents
    for (var i = 0; i < events.length; i++) {
      var ev = events[i]
      if (t[ev]) { // if new element has a whitelisted attribute
        f[ev] = t[ev] // update existing element
      } else if (f[ev]) { // if existing element has it and new one doesnt
        f[ev] = undefined // remove it from existing element
      }
    }
    var oldValue = f.value
    var newValue = t.value
    // copy values for form elements
    if ((f.nodeName === 'INPUT' && f.type !== 'file') || f.nodeName === 'SELECT') {
      if (!newValue && !t.hasAttribute('value')) {
        t.value = f.value
      } else if (newValue !== oldValue) {
        f.value = newValue
      }
    } else if (f.nodeName === 'TEXTAREA') {
      if (t.getAttribute('value') === null) f.value = t.value
    }
  }
}

},{"./update-events.js":35,"bel":1,"morphdom":28}],35:[function(require,module,exports){
module.exports = [
  // attribute events (can be set with attributes)
  'onclick',
  'ondblclick',
  'onmousedown',
  'onmouseup',
  'onmouseover',
  'onmousemove',
  'onmouseout',
  'ondragstart',
  'ondrag',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondrop',
  'ondragend',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onunload',
  'onabort',
  'onerror',
  'onresize',
  'onscroll',
  'onselect',
  'onchange',
  'onsubmit',
  'onreset',
  'onfocus',
  'onblur',
  'oninput',
  // other common events
  'oncontextmenu',
  'onfocusin',
  'onfocusout'
]

},{}],36:[function(require,module,exports){
'use strict';

var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/', function (ctx, next) {
  title('Platzigram');
  var main = document.getElementById('main-container');

  var pictures = [{
    user: {
      username: 'Luis',
      avatar: 'https://lh3.googleusercontent.com/XovXLpWy6M4ggoucnWNge4hgrjAsX22_hT2WDg_hE0e-FNScEnKr8z6J479jvnhjW8_gyu6U6Y4NlMx3cg=w5120-h3200-rw-no'
    },
    url: 'http://materializecss.com/images/office.jpg',
    likes: 123,
    liked: true,
    createdAt: new Date()
  }, {
    user: {
      username: 'German',
      avatar: 'https://lh3.googleusercontent.com/4EibVauK5UIfrNteW8hp7tBREGtnhTSxdEhmLR8j5gE-d5JlqFw1H3BXfqkVKOwzqaNbvbmpPAj1Rl-c=w5120-h3200-rw-no'
    },
    url: 'http://materializecss.com/images/sample-1.jpg',
    likes: 234,
    liked: false,
    createdAt: new Date().setDate(new Date().getDate() - 10)
  }, {
    user: {
      username: 'Luis',
      avatar: 'https://lh3.googleusercontent.com/XovXLpWy6M4ggoucnWNge4hgrjAsX22_hT2WDg_hE0e-FNScEnKr8z6J479jvnhjW8_gyu6U6Y4NlMx3cg=w5120-h3200-rw-no'
    },
    url: 'http://materializecss.com/images/office.jpg',
    likes: 123,
    liked: true,
    createdAt: new Date()
  }, {
    user: {
      username: 'German',
      avatar: 'https://lh3.googleusercontent.com/4EibVauK5UIfrNteW8hp7tBREGtnhTSxdEhmLR8j5gE-d5JlqFw1H3BXfqkVKOwzqaNbvbmpPAj1Rl-c=w5120-h3200-rw-no'
    },
    url: 'http://materializecss.com/images/sample-1.jpg',
    likes: 234,
    liked: false,
    createdAt: new Date().setDate(new Date().getDate() - 10)
  }];

  empty(main).appendChild(template(pictures));
});

},{"./template":37,"empty-element":3,"page":30,"title":33}],37:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div class="container timeline">\n    <div class="row">\n\n        ', '\n    \n    </div>\n  </div>'], ['<div class="container timeline">\n    <div class="row">\n\n        ', '\n    \n    </div>\n  </div>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');
var layout = require('../layout');
var picture = require('../picture-card');

//module.exports para decir que este archivo exporta todo este contenido
module.exports = function (pictures) {
  var el = yo(_templateObject, pictures.map(function (pic) {
    return picture(pic);
  }));

  return layout(el);
};

},{"../layout":40,"../picture-card":41,"yo-yo":34}],38:[function(require,module,exports){
'use strict';

var page = require('page');

require('./homepage');
require('./signup');
require('./signin');

page();

},{"./homepage":36,"./signin":42,"./signup":44,"page":30}],39:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div class="container landing">\n    <div class="row">\n      <div class="col s10 push-s1">\n        <div class="row">\n\n          <div class="col m5 hide-on-small-only">\n            <img class="iphone" src="iphone.png" />\n          </div>\n\n          ', '\n\n        </div>\n      </div>\n    </div>\n  </div>'], ['<div class="container landing">\n    <div class="row">\n      <div class="col s10 push-s1">\n        <div class="row">\n\n          <div class="col m5 hide-on-small-only">\n            <img class="iphone" src="iphone.png" />\n          </div>\n\n          ', '\n\n        </div>\n      </div>\n    </div>\n  </div>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');

module.exports = function landing(box) {
  return yo(_templateObject, box);
};

},{"yo-yo":34}],40:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div>\n    <nav class="header">\n      <div class="nav-wrapper">\n        <div class="container">\n          <div class="row">\n\n            <div class="col s10 m6 ">\n              <a href="/" class="brand-logo platzigram">Platzigram</a>\n            </div>\n\n            <div class="col s2 m1 push-m5">\n              <a href="#" class="btn btn-large btn-flat dropdown-button no-padding button-user-header" data-activates="drop-user">\n                <i class="fa fa-user" aria-hidden="true"></i>\n              </a>\n              <ul id="drop-user" class="dropdown-content">\n                <li><a href="#">Salir</a></li>\n              </ul>\n            </div>\n\n          </div>\n        </div>\n      </div>\n    </nav>\n    <div class="content">\n      ', '\n    </div>\n  </div>\n  '], ['<div>\n    <nav class="header">\n      <div class="nav-wrapper">\n        <div class="container">\n          <div class="row">\n\n            <div class="col s10 m6 ">\n              <a href="/" class="brand-logo platzigram">Platzigram</a>\n            </div>\n\n            <div class="col s2 m1 push-m5">\n              <a href="#" class="btn btn-large btn-flat dropdown-button no-padding button-user-header" data-activates="drop-user">\n                <i class="fa fa-user" aria-hidden="true"></i>\n              </a>\n              <ul id="drop-user" class="dropdown-content">\n                <li><a href="#">Salir</a></li>\n              </ul>\n            </div>\n\n          </div>\n        </div>\n      </div>\n    </nav>\n    <div class="content">\n      ', '\n    </div>\n  </div>\n  ']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');

module.exports = function layout(content) {
  return yo(_templateObject, content);
};

},{"yo-yo":34}],41:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div class="col s12 m6 l6">\n      <div class="card ', '">\n        <div class="card-image">\n          <img class="activator" src="', '">\n        </div>\n        <div class="card-content">\n          <a href="/user/', '" class="card-title">\n            <img src="', '" class="avatar"/>\n            <span class="username">', '</span>\n\n          </a>\n          <small class="right time">', '</small>\n          <p>\n            <a class="left" href="#" onclick=', '><i class="fa fa-heart-o" aria-hidden="true"></i></a>\n            <a class="left" href="#" onclick=', '><i class="fa fa-heart" aria-hidden="true"></i></a>\n            <span class="left likes">', ' me gusta</span>\n          </p>\n        </div>\n      </div>\n    </div>'], ['<div class="col s12 m6 l6">\n      <div class="card ', '">\n        <div class="card-image">\n          <img class="activator" src="', '">\n        </div>\n        <div class="card-content">\n          <a href="/user/', '" class="card-title">\n            <img src="', '" class="avatar"/>\n            <span class="username">', '</span>\n\n          </a>\n          <small class="right time">', '</small>\n          <p>\n            <a class="left" href="#" onclick=', '><i class="fa fa-heart-o" aria-hidden="true"></i></a>\n            <a class="left" href="#" onclick=', '><i class="fa fa-heart" aria-hidden="true"></i></a>\n            <span class="left likes">', ' me gusta</span>\n          </p>\n        </div>\n      </div>\n    </div>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');

if (!window.Intl) {
  window.Intl = require('intl'); // polyfill for `Intl`
}

var IntlRelativeFormat = window.IntlRelativeFormat = require('intl-relativeformat');

require('intl-relativeformat/dist/locale-data/en.js');
require('intl-relativeformat/dist/locale-data/es.js');

var rf = new IntlRelativeFormat('es');

module.exports = function pictureCard(pic) {

  var el;

  function render(picture) {
    return yo(_templateObject, picture.liked ? 'liked' : '', picture.url, picture.user.username, picture.user.avatar, picture.user.username, rf.format(picture.createdAt), like.bind(null, true), like.bind(null, false), picture.likes);
  }

  function like(liked) {
    pic.liked = liked;
    pic.likes += liked ? 1 : -1;
    var newEl = render(pic);
    yo.update(el, newEl);
    return false;
  }

  el = render(pic);
  return el;
};

},{"intl":25,"intl-relativeformat":19,"intl-relativeformat/dist/locale-data/en.js":17,"intl-relativeformat/dist/locale-data/es.js":18,"yo-yo":34}],42:[function(require,module,exports){
'use strict';

var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signin', function (ctx, next) {
  title('Platzigram - Sign In');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":43,"empty-element":3,"page":30,"title":33}],43:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div class="col s12 m7">\n  <div class="row">\n    <div class="signup-box">\n      <h1 class="platzigram">Platzigram</h1>\n\n      <form class="signup-form">\n\n        <div class="section">\n          <a class="btn btn-fb hide-on-small-only">Iniciar sesi\xF3n con Facebook</a>\n          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesi\xF3n</a>\n        </div>\n        <div class="divider"></div>\n        <div class="section">\n          <input type="text" name="username" placeholder="Nombre usuario" />\n          <input type="password" name="password" placeholder="Contrase\xF1a" />\n          <button class="btn waves-effect waves-light btn-signup" type="submit">Inicia Sesion</button>\n        </div>\n      </form>\n    </div>\n  </div>\n  <div class="row">\n    <div class="login-box">\n      \xBFNo tienes una cuenta? <a href="/signup">Registrate</a>\n    </div>\n  </div>\n</div>'], ['<div class="col s12 m7">\n  <div class="row">\n    <div class="signup-box">\n      <h1 class="platzigram">Platzigram</h1>\n\n      <form class="signup-form">\n\n        <div class="section">\n          <a class="btn btn-fb hide-on-small-only">Iniciar sesi\xF3n con Facebook</a>\n          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesi\xF3n</a>\n        </div>\n        <div class="divider"></div>\n        <div class="section">\n          <input type="text" name="username" placeholder="Nombre usuario" />\n          <input type="password" name="password" placeholder="Contrase\xF1a" />\n          <button class="btn waves-effect waves-light btn-signup" type="submit">Inicia Sesion</button>\n        </div>\n      </form>\n    </div>\n  </div>\n  <div class="row">\n    <div class="login-box">\n      \xBFNo tienes una cuenta? <a href="/signup">Registrate</a>\n    </div>\n  </div>\n</div>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');
var landing = require('../landing');

//module.exports para decir que este archivo exporta todo este contenido
var signinForm = yo(_templateObject);
module.exports = landing(signinForm);

},{"../landing":39,"yo-yo":34}],44:[function(require,module,exports){
'use strict';

var page = require('page');
var empty = require('empty-element');
var template = require('./template');
var title = require('title');

page('/signup', function (ctx, next) {
  title('Platzigram - Sign Up');
  var main = document.getElementById('main-container');
  empty(main).appendChild(template);
});

},{"./template":45,"empty-element":3,"page":30,"title":33}],45:[function(require,module,exports){
'use strict';

var _templateObject = _taggedTemplateLiteral(['<div class="col s12 m7">\n  <div class="row">\n    <div class="signup-box">\n      <h1 class="platzigram">Platzigram</h1>\n\n      <form class="signup-form">\n        <h2 class="platzigram-text">Registrate para ver fotos de tus amigos estudiando en Platzi</h2>\n        <div class="section">\n          <a class="btn btn-fb hide-on-small-only">Iniciar sesi\xF3n con Facebook</a>\n          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesi\xF3n</a>\n        </div>\n        <div class="divider"></div>\n        <div class="section">\n          <input type="email" name="email" placeholder="Correo electr\xF3nico" />\n          <input type="text" name="name" placeholder="Nombre completo" />\n          <input type="text" name="username" placeholder="Nombre usuario" />\n          <input type="password" name="password" placeholder="Contrase\xF1a" />\n          <button class="btn waves-effect waves-light btn-signup" type="submit">Reg\xEDstrate</button>\n        </div>\n      </form>\n    </div>\n  </div>\n  <div class="row">\n    <div class="login-box">\n      \xBFTienes una cuenta? <a href="/signin">Entrar</a>\n    </div>\n  </div>\n</div>'], ['<div class="col s12 m7">\n  <div class="row">\n    <div class="signup-box">\n      <h1 class="platzigram">Platzigram</h1>\n\n      <form class="signup-form">\n        <h2 class="platzigram-text">Registrate para ver fotos de tus amigos estudiando en Platzi</h2>\n        <div class="section">\n          <a class="btn btn-fb hide-on-small-only">Iniciar sesi\xF3n con Facebook</a>\n          <a class="btn btn-fb hide-on-med-and-up"><i class="fa fa-facebook-official"></i> Iniciar sesi\xF3n</a>\n        </div>\n        <div class="divider"></div>\n        <div class="section">\n          <input type="email" name="email" placeholder="Correo electr\xF3nico" />\n          <input type="text" name="name" placeholder="Nombre completo" />\n          <input type="text" name="username" placeholder="Nombre usuario" />\n          <input type="password" name="password" placeholder="Contrase\xF1a" />\n          <button class="btn waves-effect waves-light btn-signup" type="submit">Reg\xEDstrate</button>\n        </div>\n      </form>\n    </div>\n  </div>\n  <div class="row">\n    <div class="login-box">\n      \xBFTienes una cuenta? <a href="/signin">Entrar</a>\n    </div>\n  </div>\n</div>']);

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var yo = require('yo-yo');
var landing = require('../landing');

//module.exports para decir que este archivo exporta todo este contenido
var signupForm = yo(_templateObject);
module.exports = landing(signupForm);

},{"../landing":39,"yo-yo":34}]},{},[38])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmVsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIm5vZGVfbW9kdWxlcy9lbXB0eS1lbGVtZW50L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2dsb2JhbC9kb2N1bWVudC5qcyIsIm5vZGVfbW9kdWxlcy9nbG9iYWwvd2luZG93LmpzIiwibm9kZV9tb2R1bGVzL2h5cGVyc2NyaXB0LWF0dHJpYnV0ZS10by1wcm9wZXJ0eS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9oeXBlcngvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0LXBhcnNlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLW1lc3NhZ2Vmb3JtYXQtcGFyc2VyL2xpYi9wYXJzZXIuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvY29tcGlsZXIuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvZW4uanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9lczUuanMiLCJub2RlX21vZHVsZXMvaW50bC1tZXNzYWdlZm9ybWF0L2xpYi9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtbWVzc2FnZWZvcm1hdC9saWIvdXRpbHMuanMiLCJub2RlX21vZHVsZXMvaW50bC1yZWxhdGl2ZWZvcm1hdC9kaXN0L2xvY2FsZS1kYXRhL2VuLmpzIiwibm9kZV9tb2R1bGVzL2ludGwtcmVsYXRpdmVmb3JtYXQvZGlzdC9sb2NhbGUtZGF0YS9lcy5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ludGwtcmVsYXRpdmVmb3JtYXQvbGliL2NvcmUuanMiLCJub2RlX21vZHVsZXMvaW50bC1yZWxhdGl2ZWZvcm1hdC9saWIvZGlmZi5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2xpYi9lbi5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsLXJlbGF0aXZlZm9ybWF0L2xpYi9lczUuanMiLCJub2RlX21vZHVsZXMvaW50bC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pbnRsL2xpYi9jb3JlLmpzIiwibm9kZV9tb2R1bGVzL2lzYXJyYXkvaW5kZXguanMiLCJub2RlX21vZHVsZXMvbW9ycGhkb20vZGlzdC9tb3JwaGRvbS5qcyIsIm5vZGVfbW9kdWxlcy9vbi1sb2FkL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3BhZ2UvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcGFnZS9ub2RlX21vZHVsZXMvcGF0aC10by1yZWdleHAvaW5kZXguanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3RpdGxlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3lvLXlvL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3lvLXlvL3VwZGF0ZS1ldmVudHMuanMiLCJzcmMvaG9tZXBhZ2UvaW5kZXguanMiLCJzcmMvaG9tZXBhZ2UvdGVtcGxhdGUuanMiLCJzcmMvaW5kZXguanMiLCJzcmMvbGFuZGluZy9pbmRleC5qcyIsInNyYy9sYXlvdXQvaW5kZXguanMiLCJzcmMvcGljdHVyZS1jYXJkL2luZGV4LmpzIiwic3JjL3NpZ25pbi9pbmRleC5qcyIsInNyYy9zaWduaW4vdGVtcGxhdGUuanMiLCJzcmMvc2lnbnVwL2luZGV4LmpzIiwic3JjL3NpZ251cC90ZW1wbGF0ZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzkwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5dklBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMXFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5bUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBLElBQUksT0FBTyxRQUFRLE1BQVIsQ0FBWDtBQUNBLElBQUksUUFBUSxRQUFRLGVBQVIsQ0FBWjtBQUNBLElBQUksV0FBVyxRQUFRLFlBQVIsQ0FBZjtBQUNBLElBQUksUUFBUSxRQUFRLE9BQVIsQ0FBWjs7QUFFQSxLQUFLLEdBQUwsRUFBVSxVQUFVLEdBQVYsRUFBZSxJQUFmLEVBQXFCO0FBQzdCLFFBQU0sWUFBTjtBQUNBLE1BQUksT0FBTyxTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQVg7O0FBRUEsTUFBSSxXQUFXLENBQ2I7QUFDRSxVQUFNO0FBQ0osZ0JBQVUsTUFETjtBQUVKLGNBQVE7QUFGSixLQURSO0FBS0UsU0FBSyw2Q0FMUDtBQU1FLFdBQU8sR0FOVDtBQU9FLFdBQU8sSUFQVDtBQVFFLGVBQVcsSUFBSSxJQUFKO0FBUmIsR0FEYSxFQVdiO0FBQ0UsVUFBTTtBQUNKLGdCQUFVLFFBRE47QUFFSixjQUFRO0FBRkosS0FEUjtBQUtFLFNBQUssK0NBTFA7QUFNRSxXQUFPLEdBTlQ7QUFPRSxXQUFPLEtBUFQ7QUFRRSxlQUFXLElBQUksSUFBSixHQUFXLE9BQVgsQ0FBbUIsSUFBSSxJQUFKLEdBQVcsT0FBWCxLQUF1QixFQUExQztBQVJiLEdBWGEsRUFxQmI7QUFDRSxVQUFNO0FBQ0osZ0JBQVUsTUFETjtBQUVKLGNBQVE7QUFGSixLQURSO0FBS0UsU0FBSyw2Q0FMUDtBQU1FLFdBQU8sR0FOVDtBQU9FLFdBQU8sSUFQVDtBQVFFLGVBQVcsSUFBSSxJQUFKO0FBUmIsR0FyQmEsRUErQmI7QUFDRSxVQUFNO0FBQ0osZ0JBQVUsUUFETjtBQUVKLGNBQVE7QUFGSixLQURSO0FBS0UsU0FBSywrQ0FMUDtBQU1FLFdBQU8sR0FOVDtBQU9FLFdBQU8sS0FQVDtBQVFFLGVBQVcsSUFBSSxJQUFKLEdBQVcsT0FBWCxDQUFtQixJQUFJLElBQUosR0FBVyxPQUFYLEtBQXVCLEVBQTFDO0FBUmIsR0EvQmEsQ0FBZjs7QUEyQ0EsUUFBTSxJQUFOLEVBQVksV0FBWixDQUF3QixTQUFTLFFBQVQsQ0FBeEI7QUFDRCxDQWhERDs7Ozs7Ozs7O0FDTEEsSUFBSSxLQUFLLFFBQVEsT0FBUixDQUFUO0FBQ0EsSUFBSSxTQUFTLFFBQVEsV0FBUixDQUFiO0FBQ0EsSUFBSSxVQUFVLFFBQVEsaUJBQVIsQ0FBZDs7QUFFQTtBQUNBLE9BQU8sT0FBUCxHQUFpQixVQUFVLFFBQVYsRUFBb0I7QUFDbkMsTUFBSSxLQUFLLEVBQUwsa0JBR0ksU0FBUyxHQUFULENBQWMsVUFBVSxHQUFWLEVBQWU7QUFDN0IsV0FBTyxRQUFRLEdBQVIsQ0FBUDtBQUNELEdBRkMsQ0FISixDQUFKOztBQVVBLFNBQU8sT0FBTyxFQUFQLENBQVA7QUFDRCxDQVpEOzs7OztBQ0xBLElBQUksT0FBTyxRQUFRLE1BQVIsQ0FBWDs7QUFFQSxRQUFRLFlBQVI7QUFDQSxRQUFRLFVBQVI7QUFDQSxRQUFRLFVBQVI7O0FBRUE7Ozs7Ozs7OztBQ05BLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxPQUFULENBQWlCLEdBQWpCLEVBQXNCO0FBQ3JDLFNBQU8sRUFBUCxrQkFTVSxHQVRWO0FBZUQsQ0FoQkQ7Ozs7Ozs7OztBQ0ZBLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBUyxNQUFULENBQWdCLE9BQWhCLEVBQXlCO0FBQ3hDLFNBQU8sRUFBUCxrQkF3Qk0sT0F4Qk47QUE0QkQsQ0E3QkQ7Ozs7Ozs7OztBQ0ZBLElBQUksS0FBSyxRQUFRLE9BQVIsQ0FBVDs7QUFFQSxJQUFJLENBQUMsT0FBTyxJQUFaLEVBQWtCO0FBQ2hCLFNBQU8sSUFBUCxHQUFjLFFBQVEsTUFBUixDQUFkLENBRGdCLENBQ2U7QUFDaEM7O0FBRUQsSUFBSSxxQkFBcUIsT0FBTyxrQkFBUCxHQUE0QixRQUFRLHFCQUFSLENBQXJEOztBQUVBLFFBQVEsNENBQVI7QUFDQSxRQUFRLDRDQUFSOztBQUVBLElBQUksS0FBSyxJQUFJLGtCQUFKLENBQXVCLElBQXZCLENBQVQ7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsV0FBVCxDQUFxQixHQUFyQixFQUEwQjs7QUFFekMsTUFBSSxFQUFKOztBQUVBLFdBQVMsTUFBVCxDQUFnQixPQUFoQixFQUF5QjtBQUN2QixXQUFPLEVBQVAsa0JBQ3FCLFFBQVEsS0FBUixHQUFnQixPQUFoQixHQUEwQixFQUQvQyxFQUdvQyxRQUFRLEdBSDVDLEVBTXVCLFFBQVEsSUFBUixDQUFhLFFBTnBDLEVBT29CLFFBQVEsSUFBUixDQUFhLE1BUGpDLEVBUWlDLFFBQVEsSUFBUixDQUFhLFFBUjlDLEVBV2tDLEdBQUcsTUFBSCxDQUFVLFFBQVEsU0FBbEIsQ0FYbEMsRUFhMkMsS0FBSyxJQUFMLENBQVUsSUFBVixFQUFnQixJQUFoQixDQWIzQyxFQWMyQyxLQUFLLElBQUwsQ0FBVSxJQUFWLEVBQWdCLEtBQWhCLENBZDNDLEVBZW1DLFFBQVEsS0FmM0M7QUFvQkQ7O0FBRUQsV0FBUyxJQUFULENBQWMsS0FBZCxFQUFvQjtBQUNsQixRQUFJLEtBQUosR0FBWSxLQUFaO0FBQ0EsUUFBSSxLQUFKLElBQWEsUUFBUSxDQUFSLEdBQVksQ0FBQyxDQUExQjtBQUNBLFFBQUksUUFBUSxPQUFPLEdBQVAsQ0FBWjtBQUNBLE9BQUcsTUFBSCxDQUFVLEVBQVYsRUFBYyxLQUFkO0FBQ0EsV0FBTyxLQUFQO0FBQ0Q7O0FBRUQsT0FBSyxPQUFPLEdBQVAsQ0FBTDtBQUNBLFNBQU8sRUFBUDtBQUNELENBckNEOzs7OztBQ2JBLElBQUksT0FBTyxRQUFRLE1BQVIsQ0FBWDtBQUNBLElBQUksUUFBUSxRQUFRLGVBQVIsQ0FBWjtBQUNBLElBQUksV0FBVyxRQUFRLFlBQVIsQ0FBZjtBQUNBLElBQUksUUFBUSxRQUFRLE9BQVIsQ0FBWjs7QUFFQSxLQUFLLFNBQUwsRUFBZ0IsVUFBVSxHQUFWLEVBQWUsSUFBZixFQUFxQjtBQUNuQyxRQUFNLHNCQUFOO0FBQ0EsTUFBSSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBWDtBQUNBLFFBQU0sSUFBTixFQUFZLFdBQVosQ0FBd0IsUUFBeEI7QUFDRCxDQUpEOzs7Ozs7Ozs7QUNMQSxJQUFJLEtBQUssUUFBUSxPQUFSLENBQVQ7QUFDQSxJQUFJLFVBQVUsUUFBUSxZQUFSLENBQWQ7O0FBRUE7QUFDQSxJQUFJLGFBQWEsRUFBYixpQkFBSjtBQTBCQSxPQUFPLE9BQVAsR0FBaUIsUUFBUSxVQUFSLENBQWpCOzs7OztBQzlCQSxJQUFJLE9BQU8sUUFBUSxNQUFSLENBQVg7QUFDQSxJQUFJLFFBQVEsUUFBUSxlQUFSLENBQVo7QUFDQSxJQUFJLFdBQVcsUUFBUSxZQUFSLENBQWY7QUFDQSxJQUFJLFFBQVEsUUFBUSxPQUFSLENBQVo7O0FBRUEsS0FBSyxTQUFMLEVBQWdCLFVBQVUsR0FBVixFQUFlLElBQWYsRUFBcUI7QUFDbkMsUUFBTSxzQkFBTjtBQUNBLE1BQUksT0FBTyxTQUFTLGNBQVQsQ0FBd0IsZ0JBQXhCLENBQVg7QUFDQSxRQUFNLElBQU4sRUFBWSxXQUFaLENBQXdCLFFBQXhCO0FBQ0QsQ0FKRDs7Ozs7Ozs7O0FDTEEsSUFBSSxLQUFLLFFBQVEsT0FBUixDQUFUO0FBQ0EsSUFBSSxVQUFVLFFBQVEsWUFBUixDQUFkOztBQUVBO0FBQ0EsSUFBSSxhQUFhLEVBQWIsaUJBQUo7QUE0QkEsT0FBTyxPQUFQLEdBQWlCLFFBQVEsVUFBUixDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZG9jdW1lbnQgPSByZXF1aXJlKCdnbG9iYWwvZG9jdW1lbnQnKVxudmFyIGh5cGVyeCA9IHJlcXVpcmUoJ2h5cGVyeCcpXG52YXIgb25sb2FkID0gcmVxdWlyZSgnb24tbG9hZCcpXG5cbnZhciBTVkdOUyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydcbnZhciBYTElOS05TID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnXG5cbnZhciBCT09MX1BST1BTID0ge1xuICBhdXRvZm9jdXM6IDEsXG4gIGNoZWNrZWQ6IDEsXG4gIGRlZmF1bHRjaGVja2VkOiAxLFxuICBkaXNhYmxlZDogMSxcbiAgZm9ybW5vdmFsaWRhdGU6IDEsXG4gIGluZGV0ZXJtaW5hdGU6IDEsXG4gIHJlYWRvbmx5OiAxLFxuICByZXF1aXJlZDogMSxcbiAgc2VsZWN0ZWQ6IDEsXG4gIHdpbGx2YWxpZGF0ZTogMVxufVxudmFyIENPTU1FTlRfVEFHID0gJyEtLSdcbnZhciBTVkdfVEFHUyA9IFtcbiAgJ3N2ZycsXG4gICdhbHRHbHlwaCcsICdhbHRHbHlwaERlZicsICdhbHRHbHlwaEl0ZW0nLCAnYW5pbWF0ZScsICdhbmltYXRlQ29sb3InLFxuICAnYW5pbWF0ZU1vdGlvbicsICdhbmltYXRlVHJhbnNmb3JtJywgJ2NpcmNsZScsICdjbGlwUGF0aCcsICdjb2xvci1wcm9maWxlJyxcbiAgJ2N1cnNvcicsICdkZWZzJywgJ2Rlc2MnLCAnZWxsaXBzZScsICdmZUJsZW5kJywgJ2ZlQ29sb3JNYXRyaXgnLFxuICAnZmVDb21wb25lbnRUcmFuc2ZlcicsICdmZUNvbXBvc2l0ZScsICdmZUNvbnZvbHZlTWF0cml4JywgJ2ZlRGlmZnVzZUxpZ2h0aW5nJyxcbiAgJ2ZlRGlzcGxhY2VtZW50TWFwJywgJ2ZlRGlzdGFudExpZ2h0JywgJ2ZlRmxvb2QnLCAnZmVGdW5jQScsICdmZUZ1bmNCJyxcbiAgJ2ZlRnVuY0cnLCAnZmVGdW5jUicsICdmZUdhdXNzaWFuQmx1cicsICdmZUltYWdlJywgJ2ZlTWVyZ2UnLCAnZmVNZXJnZU5vZGUnLFxuICAnZmVNb3JwaG9sb2d5JywgJ2ZlT2Zmc2V0JywgJ2ZlUG9pbnRMaWdodCcsICdmZVNwZWN1bGFyTGlnaHRpbmcnLFxuICAnZmVTcG90TGlnaHQnLCAnZmVUaWxlJywgJ2ZlVHVyYnVsZW5jZScsICdmaWx0ZXInLCAnZm9udCcsICdmb250LWZhY2UnLFxuICAnZm9udC1mYWNlLWZvcm1hdCcsICdmb250LWZhY2UtbmFtZScsICdmb250LWZhY2Utc3JjJywgJ2ZvbnQtZmFjZS11cmknLFxuICAnZm9yZWlnbk9iamVjdCcsICdnJywgJ2dseXBoJywgJ2dseXBoUmVmJywgJ2hrZXJuJywgJ2ltYWdlJywgJ2xpbmUnLFxuICAnbGluZWFyR3JhZGllbnQnLCAnbWFya2VyJywgJ21hc2snLCAnbWV0YWRhdGEnLCAnbWlzc2luZy1nbHlwaCcsICdtcGF0aCcsXG4gICdwYXRoJywgJ3BhdHRlcm4nLCAncG9seWdvbicsICdwb2x5bGluZScsICdyYWRpYWxHcmFkaWVudCcsICdyZWN0JyxcbiAgJ3NldCcsICdzdG9wJywgJ3N3aXRjaCcsICdzeW1ib2wnLCAndGV4dCcsICd0ZXh0UGF0aCcsICd0aXRsZScsICd0cmVmJyxcbiAgJ3RzcGFuJywgJ3VzZScsICd2aWV3JywgJ3ZrZXJuJ1xuXVxuXG5mdW5jdGlvbiBiZWxDcmVhdGVFbGVtZW50ICh0YWcsIHByb3BzLCBjaGlsZHJlbikge1xuICB2YXIgZWxcblxuICAvLyBJZiBhbiBzdmcgdGFnLCBpdCBuZWVkcyBhIG5hbWVzcGFjZVxuICBpZiAoU1ZHX1RBR1MuaW5kZXhPZih0YWcpICE9PSAtMSkge1xuICAgIHByb3BzLm5hbWVzcGFjZSA9IFNWR05TXG4gIH1cblxuICAvLyBJZiB3ZSBhcmUgdXNpbmcgYSBuYW1lc3BhY2VcbiAgdmFyIG5zID0gZmFsc2VcbiAgaWYgKHByb3BzLm5hbWVzcGFjZSkge1xuICAgIG5zID0gcHJvcHMubmFtZXNwYWNlXG4gICAgZGVsZXRlIHByb3BzLm5hbWVzcGFjZVxuICB9XG5cbiAgLy8gQ3JlYXRlIHRoZSBlbGVtZW50XG4gIGlmIChucykge1xuICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCB0YWcpXG4gIH0gZWxzZSBpZiAodGFnID09PSBDT01NRU5UX1RBRykge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVDb21tZW50KHByb3BzLmNvbW1lbnQpXG4gIH0gZWxzZSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRhZylcbiAgfVxuXG4gIC8vIElmIGFkZGluZyBvbmxvYWQgZXZlbnRzXG4gIGlmIChwcm9wcy5vbmxvYWQgfHwgcHJvcHMub251bmxvYWQpIHtcbiAgICB2YXIgbG9hZCA9IHByb3BzLm9ubG9hZCB8fCBmdW5jdGlvbiAoKSB7fVxuICAgIHZhciB1bmxvYWQgPSBwcm9wcy5vbnVubG9hZCB8fCBmdW5jdGlvbiAoKSB7fVxuICAgIG9ubG9hZChlbCwgZnVuY3Rpb24gYmVsT25sb2FkICgpIHtcbiAgICAgIGxvYWQoZWwpXG4gICAgfSwgZnVuY3Rpb24gYmVsT251bmxvYWQgKCkge1xuICAgICAgdW5sb2FkKGVsKVxuICAgIH0sXG4gICAgLy8gV2UgaGF2ZSB0byB1c2Ugbm9uLXN0YW5kYXJkIGBjYWxsZXJgIHRvIGZpbmQgd2hvIGludm9rZXMgYGJlbENyZWF0ZUVsZW1lbnRgXG4gICAgYmVsQ3JlYXRlRWxlbWVudC5jYWxsZXIuY2FsbGVyLmNhbGxlcilcbiAgICBkZWxldGUgcHJvcHMub25sb2FkXG4gICAgZGVsZXRlIHByb3BzLm9udW5sb2FkXG4gIH1cblxuICAvLyBDcmVhdGUgdGhlIHByb3BlcnRpZXNcbiAgZm9yICh2YXIgcCBpbiBwcm9wcykge1xuICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgdmFyIGtleSA9IHAudG9Mb3dlckNhc2UoKVxuICAgICAgdmFyIHZhbCA9IHByb3BzW3BdXG4gICAgICAvLyBOb3JtYWxpemUgY2xhc3NOYW1lXG4gICAgICBpZiAoa2V5ID09PSAnY2xhc3NuYW1lJykge1xuICAgICAgICBrZXkgPSAnY2xhc3MnXG4gICAgICAgIHAgPSAnY2xhc3MnXG4gICAgICB9XG4gICAgICAvLyBUaGUgZm9yIGF0dHJpYnV0ZSBnZXRzIHRyYW5zZm9ybWVkIHRvIGh0bWxGb3IsIGJ1dCB3ZSBqdXN0IHNldCBhcyBmb3JcbiAgICAgIGlmIChwID09PSAnaHRtbEZvcicpIHtcbiAgICAgICAgcCA9ICdmb3InXG4gICAgICB9XG4gICAgICAvLyBJZiBhIHByb3BlcnR5IGlzIGJvb2xlYW4sIHNldCBpdHNlbGYgdG8gdGhlIGtleVxuICAgICAgaWYgKEJPT0xfUFJPUFNba2V5XSkge1xuICAgICAgICBpZiAodmFsID09PSAndHJ1ZScpIHZhbCA9IGtleVxuICAgICAgICBlbHNlIGlmICh2YWwgPT09ICdmYWxzZScpIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICAvLyBJZiBhIHByb3BlcnR5IHByZWZlcnMgYmVpbmcgc2V0IGRpcmVjdGx5IHZzIHNldEF0dHJpYnV0ZVxuICAgICAgaWYgKGtleS5zbGljZSgwLCAyKSA9PT0gJ29uJykge1xuICAgICAgICBlbFtwXSA9IHZhbFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5zKSB7XG4gICAgICAgICAgaWYgKHAgPT09ICd4bGluazpocmVmJykge1xuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlTlMoWExJTktOUywgcCwgdmFsKVxuICAgICAgICAgIH0gZWxzZSBpZiAoL154bWxucygkfDopL2kudGVzdChwKSkge1xuICAgICAgICAgICAgLy8gc2tpcCB4bWxucyBkZWZpbml0aW9uc1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbC5zZXRBdHRyaWJ1dGVOUyhudWxsLCBwLCB2YWwpXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVsLnNldEF0dHJpYnV0ZShwLCB2YWwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRDaGlsZCAoY2hpbGRzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNoaWxkcykpIHJldHVyblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgbm9kZSA9IGNoaWxkc1tpXVxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkobm9kZSkpIHtcbiAgICAgICAgYXBwZW5kQ2hpbGQobm9kZSlcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBub2RlID09PSAnbnVtYmVyJyB8fFxuICAgICAgICB0eXBlb2Ygbm9kZSA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIG5vZGUgaW5zdGFuY2VvZiBEYXRlIHx8XG4gICAgICAgIG5vZGUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgbm9kZSA9IG5vZGUudG9TdHJpbmcoKVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIG5vZGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChlbC5sYXN0Q2hpbGQgJiYgZWwubGFzdENoaWxkLm5vZGVOYW1lID09PSAnI3RleHQnKSB7XG4gICAgICAgICAgZWwubGFzdENoaWxkLm5vZGVWYWx1ZSArPSBub2RlXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobm9kZSlcbiAgICAgIH1cblxuICAgICAgaWYgKG5vZGUgJiYgbm9kZS5ub2RlVHlwZSkge1xuICAgICAgICBlbC5hcHBlbmRDaGlsZChub2RlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBhcHBlbmRDaGlsZChjaGlsZHJlbilcblxuICByZXR1cm4gZWxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBoeXBlcngoYmVsQ3JlYXRlRWxlbWVudCwge2NvbW1lbnRzOiB0cnVlfSlcbm1vZHVsZS5leHBvcnRzLmRlZmF1bHQgPSBtb2R1bGUuZXhwb3J0c1xubW9kdWxlLmV4cG9ydHMuY3JlYXRlRWxlbWVudCA9IGJlbENyZWF0ZUVsZW1lbnRcbiIsIiIsIi8qIGdsb2JhbCBIVE1MRWxlbWVudCAqL1xuXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBlbXB0eUVsZW1lbnQgKGVsZW1lbnQpIHtcbiAgaWYgKCEoZWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGFuIGVsZW1lbnQnKVxuICB9XG5cbiAgdmFyIG5vZGVcbiAgd2hpbGUgKChub2RlID0gZWxlbWVudC5sYXN0Q2hpbGQpKSBlbGVtZW50LnJlbW92ZUNoaWxkKG5vZGUpXG4gIHJldHVybiBlbGVtZW50XG59XG4iLCJ2YXIgdG9wTGV2ZWwgPSB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbCA6XG4gICAgdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB7fVxudmFyIG1pbkRvYyA9IHJlcXVpcmUoJ21pbi1kb2N1bWVudCcpO1xuXG52YXIgZG9jY3k7XG5cbmlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZG9jY3kgPSBkb2N1bWVudDtcbn0gZWxzZSB7XG4gICAgZG9jY3kgPSB0b3BMZXZlbFsnX19HTE9CQUxfRE9DVU1FTlRfQ0FDSEVANCddO1xuXG4gICAgaWYgKCFkb2NjeSkge1xuICAgICAgICBkb2NjeSA9IHRvcExldmVsWydfX0dMT0JBTF9ET0NVTUVOVF9DQUNIRUA0J10gPSBtaW5Eb2M7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRvY2N5O1xuIiwidmFyIHdpbjtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSB3aW5kb3c7XG59IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB3aW4gPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICB3aW4gPSBzZWxmO1xufSBlbHNlIHtcbiAgICB3aW4gPSB7fTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB3aW47XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGF0dHJpYnV0ZVRvUHJvcGVydHlcblxudmFyIHRyYW5zZm9ybSA9IHtcbiAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICdmb3InOiAnaHRtbEZvcicsXG4gICdodHRwLWVxdWl2JzogJ2h0dHBFcXVpdidcbn1cblxuZnVuY3Rpb24gYXR0cmlidXRlVG9Qcm9wZXJ0eSAoaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbikge1xuICAgIGZvciAodmFyIGF0dHIgaW4gYXR0cnMpIHtcbiAgICAgIGlmIChhdHRyIGluIHRyYW5zZm9ybSkge1xuICAgICAgICBhdHRyc1t0cmFuc2Zvcm1bYXR0cl1dID0gYXR0cnNbYXR0cl1cbiAgICAgICAgZGVsZXRlIGF0dHJzW2F0dHJdXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBoKHRhZ05hbWUsIGF0dHJzLCBjaGlsZHJlbilcbiAgfVxufVxuIiwidmFyIGF0dHJUb1Byb3AgPSByZXF1aXJlKCdoeXBlcnNjcmlwdC1hdHRyaWJ1dGUtdG8tcHJvcGVydHknKVxuXG52YXIgVkFSID0gMCwgVEVYVCA9IDEsIE9QRU4gPSAyLCBDTE9TRSA9IDMsIEFUVFIgPSA0XG52YXIgQVRUUl9LRVkgPSA1LCBBVFRSX0tFWV9XID0gNlxudmFyIEFUVFJfVkFMVUVfVyA9IDcsIEFUVFJfVkFMVUUgPSA4XG52YXIgQVRUUl9WQUxVRV9TUSA9IDksIEFUVFJfVkFMVUVfRFEgPSAxMFxudmFyIEFUVFJfRVEgPSAxMSwgQVRUUl9CUkVBSyA9IDEyXG52YXIgQ09NTUVOVCA9IDEzXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGgsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cbiAgdmFyIGNvbmNhdCA9IG9wdHMuY29uY2F0IHx8IGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgcmV0dXJuIFN0cmluZyhhKSArIFN0cmluZyhiKVxuICB9XG4gIGlmIChvcHRzLmF0dHJUb1Byb3AgIT09IGZhbHNlKSB7XG4gICAgaCA9IGF0dHJUb1Byb3AoaClcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoc3RyaW5ncykge1xuICAgIHZhciBzdGF0ZSA9IFRFWFQsIHJlZyA9ICcnXG4gICAgdmFyIGFyZ2xlbiA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICB2YXIgcGFydHMgPSBbXVxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoaSA8IGFyZ2xlbiAtIDEpIHtcbiAgICAgICAgdmFyIGFyZyA9IGFyZ3VtZW50c1tpKzFdXG4gICAgICAgIHZhciBwID0gcGFyc2Uoc3RyaW5nc1tpXSlcbiAgICAgICAgdmFyIHhzdGF0ZSA9IHN0YXRlXG4gICAgICAgIGlmICh4c3RhdGUgPT09IEFUVFJfVkFMVUVfRFEpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSkgeHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICBpZiAoeHN0YXRlID09PSBBVFRSX1ZBTFVFX1cpIHhzdGF0ZSA9IEFUVFJfVkFMVUVcbiAgICAgICAgaWYgKHhzdGF0ZSA9PT0gQVRUUikgeHN0YXRlID0gQVRUUl9LRVlcbiAgICAgICAgcC5wdXNoKFsgVkFSLCB4c3RhdGUsIGFyZyBdKVxuICAgICAgICBwYXJ0cy5wdXNoLmFwcGx5KHBhcnRzLCBwKVxuICAgICAgfSBlbHNlIHBhcnRzLnB1c2guYXBwbHkocGFydHMsIHBhcnNlKHN0cmluZ3NbaV0pKVxuICAgIH1cblxuICAgIHZhciB0cmVlID0gW251bGwse30sW11dXG4gICAgdmFyIHN0YWNrID0gW1t0cmVlLC0xXV1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhcnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VyID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzBdXG4gICAgICB2YXIgcCA9IHBhcnRzW2ldLCBzID0gcFswXVxuICAgICAgaWYgKHMgPT09IE9QRU4gJiYgL15cXC8vLnRlc3QocFsxXSkpIHtcbiAgICAgICAgdmFyIGl4ID0gc3RhY2tbc3RhY2subGVuZ3RoLTFdWzFdXG4gICAgICAgIGlmIChzdGFjay5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgc3RhY2sucG9wKClcbiAgICAgICAgICBzdGFja1tzdGFjay5sZW5ndGgtMV1bMF1bMl1baXhdID0gaChcbiAgICAgICAgICAgIGN1clswXSwgY3VyWzFdLCBjdXJbMl0ubGVuZ3RoID8gY3VyWzJdIDogdW5kZWZpbmVkXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHMgPT09IE9QRU4pIHtcbiAgICAgICAgdmFyIGMgPSBbcFsxXSx7fSxbXV1cbiAgICAgICAgY3VyWzJdLnB1c2goYylcbiAgICAgICAgc3RhY2sucHVzaChbYyxjdXJbMl0ubGVuZ3RoLTFdKVxuICAgICAgfSBlbHNlIGlmIChzID09PSBBVFRSX0tFWSB8fCAocyA9PT0gVkFSICYmIHBbMV0gPT09IEFUVFJfS0VZKSkge1xuICAgICAgICB2YXIga2V5ID0gJydcbiAgICAgICAgdmFyIGNvcHlLZXlcbiAgICAgICAgZm9yICg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwYXJ0c1tpXVswXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGtleSA9IGNvbmNhdChrZXksIHBhcnRzW2ldWzFdKVxuICAgICAgICAgIH0gZWxzZSBpZiAocGFydHNbaV1bMF0gPT09IFZBUiAmJiBwYXJ0c1tpXVsxXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcGFydHNbaV1bMl0gPT09ICdvYmplY3QnICYmICFrZXkpIHtcbiAgICAgICAgICAgICAgZm9yIChjb3B5S2V5IGluIHBhcnRzW2ldWzJdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnRzW2ldWzJdLmhhc093blByb3BlcnR5KGNvcHlLZXkpICYmICFjdXJbMV1bY29weUtleV0pIHtcbiAgICAgICAgICAgICAgICAgIGN1clsxXVtjb3B5S2V5XSA9IHBhcnRzW2ldWzJdW2NvcHlLZXldXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBrZXkgPSBjb25jYXQoa2V5LCBwYXJ0c1tpXVsyXSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBpZiAocGFydHNbaV1bMF0gPT09IEFUVFJfRVEpIGkrK1xuICAgICAgICB2YXIgaiA9IGlcbiAgICAgICAgZm9yICg7IGkgPCBwYXJ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChwYXJ0c1tpXVswXSA9PT0gQVRUUl9WQUxVRSB8fCBwYXJ0c1tpXVswXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgICAgIGlmICghY3VyWzFdW2tleV0pIGN1clsxXVtrZXldID0gc3RyZm4ocGFydHNbaV1bMV0pXG4gICAgICAgICAgICBlbHNlIGN1clsxXVtrZXldID0gY29uY2F0KGN1clsxXVtrZXldLCBwYXJ0c1tpXVsxXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnRzW2ldWzBdID09PSBWQVJcbiAgICAgICAgICAmJiAocGFydHNbaV1bMV0gPT09IEFUVFJfVkFMVUUgfHwgcGFydHNbaV1bMV0gPT09IEFUVFJfS0VZKSkge1xuICAgICAgICAgICAgaWYgKCFjdXJbMV1ba2V5XSkgY3VyWzFdW2tleV0gPSBzdHJmbihwYXJ0c1tpXVsyXSlcbiAgICAgICAgICAgIGVsc2UgY3VyWzFdW2tleV0gPSBjb25jYXQoY3VyWzFdW2tleV0sIHBhcnRzW2ldWzJdKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoa2V5Lmxlbmd0aCAmJiAhY3VyWzFdW2tleV0gJiYgaSA9PT0galxuICAgICAgICAgICAgJiYgKHBhcnRzW2ldWzBdID09PSBDTE9TRSB8fCBwYXJ0c1tpXVswXSA9PT0gQVRUUl9CUkVBSykpIHtcbiAgICAgICAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvaW5mcmFzdHJ1Y3R1cmUuaHRtbCNib29sZWFuLWF0dHJpYnV0ZXNcbiAgICAgICAgICAgICAgLy8gZW1wdHkgc3RyaW5nIGlzIGZhbHN5LCBub3Qgd2VsbCBiZWhhdmVkIHZhbHVlIGluIGJyb3dzZXJcbiAgICAgICAgICAgICAgY3VyWzFdW2tleV0gPSBrZXkudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgY3VyWzFdW3BbMV1dID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChzID09PSBWQVIgJiYgcFsxXSA9PT0gQVRUUl9LRVkpIHtcbiAgICAgICAgY3VyWzFdW3BbMl1dID0gdHJ1ZVxuICAgICAgfSBlbHNlIGlmIChzID09PSBDTE9TRSkge1xuICAgICAgICBpZiAoc2VsZkNsb3NpbmcoY3VyWzBdKSAmJiBzdGFjay5sZW5ndGgpIHtcbiAgICAgICAgICB2YXIgaXggPSBzdGFja1tzdGFjay5sZW5ndGgtMV1bMV1cbiAgICAgICAgICBzdGFjay5wb3AoKVxuICAgICAgICAgIHN0YWNrW3N0YWNrLmxlbmd0aC0xXVswXVsyXVtpeF0gPSBoKFxuICAgICAgICAgICAgY3VyWzBdLCBjdXJbMV0sIGN1clsyXS5sZW5ndGggPyBjdXJbMl0gOiB1bmRlZmluZWRcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVkFSICYmIHBbMV0gPT09IFRFWFQpIHtcbiAgICAgICAgaWYgKHBbMl0gPT09IHVuZGVmaW5lZCB8fCBwWzJdID09PSBudWxsKSBwWzJdID0gJydcbiAgICAgICAgZWxzZSBpZiAoIXBbMl0pIHBbMl0gPSBjb25jYXQoJycsIHBbMl0pXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHBbMl1bMF0pKSB7XG4gICAgICAgICAgY3VyWzJdLnB1c2guYXBwbHkoY3VyWzJdLCBwWzJdKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGN1clsyXS5wdXNoKHBbMl0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocyA9PT0gVEVYVCkge1xuICAgICAgICBjdXJbMl0ucHVzaChwWzFdKVxuICAgICAgfSBlbHNlIGlmIChzID09PSBBVFRSX0VRIHx8IHMgPT09IEFUVFJfQlJFQUspIHtcbiAgICAgICAgLy8gbm8tb3BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5oYW5kbGVkOiAnICsgcylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHJlZVsyXS5sZW5ndGggPiAxICYmIC9eXFxzKiQvLnRlc3QodHJlZVsyXVswXSkpIHtcbiAgICAgIHRyZWVbMl0uc2hpZnQoKVxuICAgIH1cblxuICAgIGlmICh0cmVlWzJdLmxlbmd0aCA+IDJcbiAgICB8fCAodHJlZVsyXS5sZW5ndGggPT09IDIgJiYgL1xcUy8udGVzdCh0cmVlWzJdWzFdKSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ211bHRpcGxlIHJvb3QgZWxlbWVudHMgbXVzdCBiZSB3cmFwcGVkIGluIGFuIGVuY2xvc2luZyB0YWcnXG4gICAgICApXG4gICAgfVxuICAgIGlmIChBcnJheS5pc0FycmF5KHRyZWVbMl1bMF0pICYmIHR5cGVvZiB0cmVlWzJdWzBdWzBdID09PSAnc3RyaW5nJ1xuICAgICYmIEFycmF5LmlzQXJyYXkodHJlZVsyXVswXVsyXSkpIHtcbiAgICAgIHRyZWVbMl1bMF0gPSBoKHRyZWVbMl1bMF1bMF0sIHRyZWVbMl1bMF1bMV0sIHRyZWVbMl1bMF1bMl0pXG4gICAgfVxuICAgIHJldHVybiB0cmVlWzJdWzBdXG5cbiAgICBmdW5jdGlvbiBwYXJzZSAoc3RyKSB7XG4gICAgICB2YXIgcmVzID0gW11cbiAgICAgIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9XKSBzdGF0ZSA9IEFUVFJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjID0gc3RyLmNoYXJBdChpKVxuICAgICAgICBpZiAoc3RhdGUgPT09IFRFWFQgJiYgYyA9PT0gJzwnKSB7XG4gICAgICAgICAgaWYgKHJlZy5sZW5ndGgpIHJlcy5wdXNoKFtURVhULCByZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBPUEVOXG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJz4nICYmICFxdW90KHN0YXRlKSAmJiBzdGF0ZSAhPT0gQ09NTUVOVCkge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gT1BFTikge1xuICAgICAgICAgICAgcmVzLnB1c2goW09QRU4scmVnXSlcbiAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX0tFWSkge1xuICAgICAgICAgICAgcmVzLnB1c2goW0FUVFJfS0VZLHJlZ10pXG4gICAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXMucHVzaChbQ0xPU0VdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBURVhUXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IENPTU1FTlQgJiYgLy0kLy50ZXN0KHJlZykgJiYgYyA9PT0gJy0nKSB7XG4gICAgICAgICAgaWYgKG9wdHMuY29tbWVudHMpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZy5zdWJzdHIoMCwgcmVnLmxlbmd0aCAtIDEpXSxbQ0xPU0VdKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gVEVYVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBPUEVOICYmIC9eIS0tJC8udGVzdChyZWcpKSB7XG4gICAgICAgICAgaWYgKG9wdHMuY29tbWVudHMpIHtcbiAgICAgICAgICAgIHJlcy5wdXNoKFtPUEVOLCByZWddLFtBVFRSX0tFWSwnY29tbWVudCddLFtBVFRSX0VRXSlcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVnID0gY1xuICAgICAgICAgIHN0YXRlID0gQ09NTUVOVFxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBURVhUIHx8IHN0YXRlID09PSBDT01NRU5UKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTiAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgcmVzLnB1c2goW09QRU4sIHJlZ10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gT1BFTikge1xuICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFIgJiYgL1teXFxzXCInPS9dLy50ZXN0KGMpKSB7XG4gICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWVxuICAgICAgICAgIHJlZyA9IGNcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUiAmJiAvXFxzLy50ZXN0KGMpKSB7XG4gICAgICAgICAgaWYgKHJlZy5sZW5ndGgpIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0JSRUFLXSlcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9LRVkgJiYgL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSX0tFWV9XXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZICYmIGMgPT09ICc9Jykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddLFtBVFRSX0VRXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9XXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfSBlbHNlIGlmICgoc3RhdGUgPT09IEFUVFJfS0VZX1cgfHwgc3RhdGUgPT09IEFUVFIpICYmIGMgPT09ICc9Jykge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX0VRXSlcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfV1xuICAgICAgICB9IGVsc2UgaWYgKChzdGF0ZSA9PT0gQVRUUl9LRVlfVyB8fCBzdGF0ZSA9PT0gQVRUUikgJiYgIS9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9CUkVBS10pXG4gICAgICAgICAgaWYgKC9bXFx3LV0vLnRlc3QoYykpIHtcbiAgICAgICAgICAgIHJlZyArPSBjXG4gICAgICAgICAgICBzdGF0ZSA9IEFUVFJfS0VZXG4gICAgICAgICAgfSBlbHNlIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgYyA9PT0gJ1wiJykge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRV9EUVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1cgJiYgYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJfVkFMVUVfU1FcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSAmJiBjID09PSAnXCInKSB7XG4gICAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSxbQVRUUl9CUkVBS10pXG4gICAgICAgICAgcmVnID0gJydcbiAgICAgICAgICBzdGF0ZSA9IEFUVFJcbiAgICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9TUSAmJiBjID09PSBcIidcIikge1xuICAgICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10sW0FUVFJfQlJFQUtdKVxuICAgICAgICAgIHJlZyA9ICcnXG4gICAgICAgICAgc3RhdGUgPSBBVFRSXG4gICAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUVfVyAmJiAhL1xccy8udGVzdChjKSkge1xuICAgICAgICAgIHN0YXRlID0gQVRUUl9WQUxVRVxuICAgICAgICAgIGktLVxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFICYmIC9cXHMvLnRlc3QoYykpIHtcbiAgICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddLFtBVFRSX0JSRUFLXSlcbiAgICAgICAgICByZWcgPSAnJ1xuICAgICAgICAgIHN0YXRlID0gQVRUUlxuICAgICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRXG4gICAgICAgIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRKSB7XG4gICAgICAgICAgcmVnICs9IGNcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHN0YXRlID09PSBURVhUICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW1RFWFQscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfVkFMVUUgJiYgcmVnLmxlbmd0aCkge1xuICAgICAgICByZXMucHVzaChbQVRUUl9WQUxVRSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdGF0ZSA9PT0gQVRUUl9WQUxVRV9EUSAmJiByZWcubGVuZ3RoKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX1ZBTFVFLHJlZ10pXG4gICAgICAgIHJlZyA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRICYmIHJlZy5sZW5ndGgpIHtcbiAgICAgICAgcmVzLnB1c2goW0FUVFJfVkFMVUUscmVnXSlcbiAgICAgICAgcmVnID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3RhdGUgPT09IEFUVFJfS0VZKSB7XG4gICAgICAgIHJlcy5wdXNoKFtBVFRSX0tFWSxyZWddKVxuICAgICAgICByZWcgPSAnJ1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0cmZuICh4KSB7XG4gICAgaWYgKHR5cGVvZiB4ID09PSAnZnVuY3Rpb24nKSByZXR1cm4geFxuICAgIGVsc2UgaWYgKHR5cGVvZiB4ID09PSAnc3RyaW5nJykgcmV0dXJuIHhcbiAgICBlbHNlIGlmICh4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0JykgcmV0dXJuIHhcbiAgICBlbHNlIHJldHVybiBjb25jYXQoJycsIHgpXG4gIH1cbn1cblxuZnVuY3Rpb24gcXVvdCAoc3RhdGUpIHtcbiAgcmV0dXJuIHN0YXRlID09PSBBVFRSX1ZBTFVFX1NRIHx8IHN0YXRlID09PSBBVFRSX1ZBTFVFX0RRXG59XG5cbnZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5XG5mdW5jdGlvbiBoYXMgKG9iaiwga2V5KSB7IHJldHVybiBoYXNPd24uY2FsbChvYmosIGtleSkgfVxuXG52YXIgY2xvc2VSRSA9IFJlZ0V4cCgnXignICsgW1xuICAnYXJlYScsICdiYXNlJywgJ2Jhc2Vmb250JywgJ2Jnc291bmQnLCAnYnInLCAnY29sJywgJ2NvbW1hbmQnLCAnZW1iZWQnLFxuICAnZnJhbWUnLCAnaHInLCAnaW1nJywgJ2lucHV0JywgJ2lzaW5kZXgnLCAna2V5Z2VuJywgJ2xpbmsnLCAnbWV0YScsICdwYXJhbScsXG4gICdzb3VyY2UnLCAndHJhY2snLCAnd2JyJywgJyEtLScsXG4gIC8vIFNWRyBUQUdTXG4gICdhbmltYXRlJywgJ2FuaW1hdGVUcmFuc2Zvcm0nLCAnY2lyY2xlJywgJ2N1cnNvcicsICdkZXNjJywgJ2VsbGlwc2UnLFxuICAnZmVCbGVuZCcsICdmZUNvbG9yTWF0cml4JywgJ2ZlQ29tcG9zaXRlJyxcbiAgJ2ZlQ29udm9sdmVNYXRyaXgnLCAnZmVEaWZmdXNlTGlnaHRpbmcnLCAnZmVEaXNwbGFjZW1lbnRNYXAnLFxuICAnZmVEaXN0YW50TGlnaHQnLCAnZmVGbG9vZCcsICdmZUZ1bmNBJywgJ2ZlRnVuY0InLCAnZmVGdW5jRycsICdmZUZ1bmNSJyxcbiAgJ2ZlR2F1c3NpYW5CbHVyJywgJ2ZlSW1hZ2UnLCAnZmVNZXJnZU5vZGUnLCAnZmVNb3JwaG9sb2d5JyxcbiAgJ2ZlT2Zmc2V0JywgJ2ZlUG9pbnRMaWdodCcsICdmZVNwZWN1bGFyTGlnaHRpbmcnLCAnZmVTcG90TGlnaHQnLCAnZmVUaWxlJyxcbiAgJ2ZlVHVyYnVsZW5jZScsICdmb250LWZhY2UtZm9ybWF0JywgJ2ZvbnQtZmFjZS1uYW1lJywgJ2ZvbnQtZmFjZS11cmknLFxuICAnZ2x5cGgnLCAnZ2x5cGhSZWYnLCAnaGtlcm4nLCAnaW1hZ2UnLCAnbGluZScsICdtaXNzaW5nLWdseXBoJywgJ21wYXRoJyxcbiAgJ3BhdGgnLCAncG9seWdvbicsICdwb2x5bGluZScsICdyZWN0JywgJ3NldCcsICdzdG9wJywgJ3RyZWYnLCAndXNlJywgJ3ZpZXcnLFxuICAndmtlcm4nXG5dLmpvaW4oJ3wnKSArICcpKD86W1xcLiNdW2EtekEtWjAtOVxcdTAwN0YtXFx1RkZGRl86LV0rKSokJylcbmZ1bmN0aW9uIHNlbGZDbG9zaW5nICh0YWcpIHsgcmV0dXJuIGNsb3NlUkUudGVzdCh0YWcpIH1cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9saWIvcGFyc2VyJylbJ2RlZmF1bHQnXTtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGV4cG9ydHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24oKSB7XG4gIC8qXG4gICAqIEdlbmVyYXRlZCBieSBQRUcuanMgMC44LjAuXG4gICAqXG4gICAqIGh0dHA6Ly9wZWdqcy5tYWpkYS5jei9cbiAgICovXG5cbiAgZnVuY3Rpb24gcGVnJHN1YmNsYXNzKGNoaWxkLCBwYXJlbnQpIHtcbiAgICBmdW5jdGlvbiBjdG9yKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gY2hpbGQ7IH1cbiAgICBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7XG4gICAgY2hpbGQucHJvdG90eXBlID0gbmV3IGN0b3IoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFN5bnRheEVycm9yKG1lc3NhZ2UsIGV4cGVjdGVkLCBmb3VuZCwgb2Zmc2V0LCBsaW5lLCBjb2x1bW4pIHtcbiAgICB0aGlzLm1lc3NhZ2UgID0gbWVzc2FnZTtcbiAgICB0aGlzLmV4cGVjdGVkID0gZXhwZWN0ZWQ7XG4gICAgdGhpcy5mb3VuZCAgICA9IGZvdW5kO1xuICAgIHRoaXMub2Zmc2V0ICAgPSBvZmZzZXQ7XG4gICAgdGhpcy5saW5lICAgICA9IGxpbmU7XG4gICAgdGhpcy5jb2x1bW4gICA9IGNvbHVtbjtcblxuICAgIHRoaXMubmFtZSAgICAgPSBcIlN5bnRheEVycm9yXCI7XG4gIH1cblxuICBwZWckc3ViY2xhc3MoU3ludGF4RXJyb3IsIEVycm9yKTtcblxuICBmdW5jdGlvbiBwYXJzZShpbnB1dCkge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBhcmd1bWVudHNbMV0gOiB7fSxcblxuICAgICAgICBwZWckRkFJTEVEID0ge30sXG5cbiAgICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9ucyA9IHsgc3RhcnQ6IHBlZyRwYXJzZXN0YXJ0IH0sXG4gICAgICAgIHBlZyRzdGFydFJ1bGVGdW5jdGlvbiAgPSBwZWckcGFyc2VzdGFydCxcblxuICAgICAgICBwZWckYzAgPSBbXSxcbiAgICAgICAgcGVnJGMxID0gZnVuY3Rpb24oZWxlbWVudHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlICAgIDogJ21lc3NhZ2VGb3JtYXRQYXR0ZXJuJyxcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudHM6IGVsZW1lbnRzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMiA9IHBlZyRGQUlMRUQsXG4gICAgICAgIHBlZyRjMyA9IGZ1bmN0aW9uKHRleHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgICAgIGksIGosIG91dGVyTGVuLCBpbm5lciwgaW5uZXJMZW47XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwLCBvdXRlckxlbiA9IHRleHQubGVuZ3RoOyBpIDwgb3V0ZXJMZW47IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpbm5lciA9IHRleHRbaV07XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yIChqID0gMCwgaW5uZXJMZW4gPSBpbm5lci5sZW5ndGg7IGogPCBpbm5lckxlbjsgaiArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gaW5uZXJbal07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGM0ID0gZnVuY3Rpb24obWVzc2FnZVRleHQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlIDogJ21lc3NhZ2VUZXh0RWxlbWVudCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBtZXNzYWdlVGV4dFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzUgPSAvXlteIFxcdFxcblxcciwuKz17fSNdLyxcbiAgICAgICAgcGVnJGM2ID0geyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIlteIFxcXFx0XFxcXG5cXFxcciwuKz17fSNdXCIsIGRlc2NyaXB0aW9uOiBcIlteIFxcXFx0XFxcXG5cXFxcciwuKz17fSNdXCIgfSxcbiAgICAgICAgcGVnJGM3ID0gXCJ7XCIsXG4gICAgICAgIHBlZyRjOCA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIntcIiwgZGVzY3JpcHRpb246IFwiXFxcIntcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM5ID0gbnVsbCxcbiAgICAgICAgcGVnJGMxMCA9IFwiLFwiLFxuICAgICAgICBwZWckYzExID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiLFwiLCBkZXNjcmlwdGlvbjogXCJcXFwiLFxcXCJcIiB9LFxuICAgICAgICBwZWckYzEyID0gXCJ9XCIsXG4gICAgICAgIHBlZyRjMTMgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJ9XCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJ9XFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMTQgPSBmdW5jdGlvbihpZCwgZm9ybWF0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgOiAnYXJndW1lbnRFbGVtZW50JyxcbiAgICAgICAgICAgICAgICAgICAgaWQgICAgOiBpZCxcbiAgICAgICAgICAgICAgICAgICAgZm9ybWF0OiBmb3JtYXQgJiYgZm9ybWF0WzJdXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMTUgPSBcIm51bWJlclwiLFxuICAgICAgICBwZWckYzE2ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwibnVtYmVyXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJudW1iZXJcXFwiXCIgfSxcbiAgICAgICAgcGVnJGMxNyA9IFwiZGF0ZVwiLFxuICAgICAgICBwZWckYzE4ID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiZGF0ZVwiLCBkZXNjcmlwdGlvbjogXCJcXFwiZGF0ZVxcXCJcIiB9LFxuICAgICAgICBwZWckYzE5ID0gXCJ0aW1lXCIsXG4gICAgICAgIHBlZyRjMjAgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJ0aW1lXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJ0aW1lXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMjEgPSBmdW5jdGlvbih0eXBlLCBzdHlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgOiB0eXBlICsgJ0Zvcm1hdCcsXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlOiBzdHlsZSAmJiBzdHlsZVsyXVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzIyID0gXCJwbHVyYWxcIixcbiAgICAgICAgcGVnJGMyMyA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcInBsdXJhbFwiLCBkZXNjcmlwdGlvbjogXCJcXFwicGx1cmFsXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMjQgPSBmdW5jdGlvbihwbHVyYWxTdHlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgICA6IHBsdXJhbFN0eWxlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG9yZGluYWw6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgOiBwbHVyYWxTdHlsZS5vZmZzZXQgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogcGx1cmFsU3R5bGUub3B0aW9uc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzI1ID0gXCJzZWxlY3RvcmRpbmFsXCIsXG4gICAgICAgIHBlZyRjMjYgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJzZWxlY3RvcmRpbmFsXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJzZWxlY3RvcmRpbmFsXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjMjcgPSBmdW5jdGlvbihwbHVyYWxTdHlsZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgICA6IHBsdXJhbFN0eWxlLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIG9yZGluYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA6IHBsdXJhbFN0eWxlLm9mZnNldCB8fCAwLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBwbHVyYWxTdHlsZS5vcHRpb25zXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgcGVnJGMyOCA9IFwic2VsZWN0XCIsXG4gICAgICAgIHBlZyRjMjkgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJzZWxlY3RcIiwgZGVzY3JpcHRpb246IFwiXFxcInNlbGVjdFxcXCJcIiB9LFxuICAgICAgICBwZWckYzMwID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGUgICA6ICdzZWxlY3RGb3JtYXQnLFxuICAgICAgICAgICAgICAgICAgICBvcHRpb25zOiBvcHRpb25zXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMzEgPSBcIj1cIixcbiAgICAgICAgcGVnJGMzMiA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIj1cIiwgZGVzY3JpcHRpb246IFwiXFxcIj1cXFwiXCIgfSxcbiAgICAgICAgcGVnJGMzMyA9IGZ1bmN0aW9uKHNlbGVjdG9yLCBwYXR0ZXJuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgICA6ICdvcHRpb25hbEZvcm1hdFBhdHRlcm4nLFxuICAgICAgICAgICAgICAgICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlICAgOiBwYXR0ZXJuXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIHBlZyRjMzQgPSBcIm9mZnNldDpcIixcbiAgICAgICAgcGVnJGMzNSA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIm9mZnNldDpcIiwgZGVzY3JpcHRpb246IFwiXFxcIm9mZnNldDpcXFwiXCIgfSxcbiAgICAgICAgcGVnJGMzNiA9IGZ1bmN0aW9uKG51bWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzM3ID0gZnVuY3Rpb24ob2Zmc2V0LCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZSAgIDogJ3BsdXJhbEZvcm1hdCcsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldCA6IG9mZnNldCxcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9uczogb3B0aW9uc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzM4ID0geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBcIndoaXRlc3BhY2VcIiB9LFxuICAgICAgICBwZWckYzM5ID0gL15bIFxcdFxcblxccl0vLFxuICAgICAgICBwZWckYzQwID0geyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIlsgXFxcXHRcXFxcblxcXFxyXVwiLCBkZXNjcmlwdGlvbjogXCJbIFxcXFx0XFxcXG5cXFxccl1cIiB9LFxuICAgICAgICBwZWckYzQxID0geyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBcIm9wdGlvbmFsV2hpdGVzcGFjZVwiIH0sXG4gICAgICAgIHBlZyRjNDIgPSAvXlswLTldLyxcbiAgICAgICAgcGVnJGM0MyA9IHsgdHlwZTogXCJjbGFzc1wiLCB2YWx1ZTogXCJbMC05XVwiLCBkZXNjcmlwdGlvbjogXCJbMC05XVwiIH0sXG4gICAgICAgIHBlZyRjNDQgPSAvXlswLTlhLWZdL2ksXG4gICAgICAgIHBlZyRjNDUgPSB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiWzAtOWEtZl1pXCIsIGRlc2NyaXB0aW9uOiBcIlswLTlhLWZdaVwiIH0sXG4gICAgICAgIHBlZyRjNDYgPSBcIjBcIixcbiAgICAgICAgcGVnJGM0NyA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIjBcIiwgZGVzY3JpcHRpb246IFwiXFxcIjBcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM0OCA9IC9eWzEtOV0vLFxuICAgICAgICBwZWckYzQ5ID0geyB0eXBlOiBcImNsYXNzXCIsIHZhbHVlOiBcIlsxLTldXCIsIGRlc2NyaXB0aW9uOiBcIlsxLTldXCIgfSxcbiAgICAgICAgcGVnJGM1MCA9IGZ1bmN0aW9uKGRpZ2l0cykge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KGRpZ2l0cywgMTApO1xuICAgICAgICB9LFxuICAgICAgICBwZWckYzUxID0gL15bXnt9XFxcXFxcMC1cXHgxRn8gXFx0XFxuXFxyXS8sXG4gICAgICAgIHBlZyRjNTIgPSB7IHR5cGU6IFwiY2xhc3NcIiwgdmFsdWU6IFwiW157fVxcXFxcXFxcXFxcXDAtXFxcXHgxRn8gXFxcXHRcXFxcblxcXFxyXVwiLCBkZXNjcmlwdGlvbjogXCJbXnt9XFxcXFxcXFxcXFxcMC1cXFxceDFGfyBcXFxcdFxcXFxuXFxcXHJdXCIgfSxcbiAgICAgICAgcGVnJGM1MyA9IFwiXFxcXFxcXFxcIixcbiAgICAgICAgcGVnJGM1NCA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIlxcXFxcXFxcXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJcXFxcXFxcXFxcXFxcXFxcXFxcIlwiIH0sXG4gICAgICAgIHBlZyRjNTUgPSBmdW5jdGlvbigpIHsgcmV0dXJuICdcXFxcJzsgfSxcbiAgICAgICAgcGVnJGM1NiA9IFwiXFxcXCNcIixcbiAgICAgICAgcGVnJGM1NyA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIlxcXFwjXCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJcXFxcXFxcXCNcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM1OCA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gJ1xcXFwjJzsgfSxcbiAgICAgICAgcGVnJGM1OSA9IFwiXFxcXHtcIixcbiAgICAgICAgcGVnJGM2MCA9IHsgdHlwZTogXCJsaXRlcmFsXCIsIHZhbHVlOiBcIlxcXFx7XCIsIGRlc2NyaXB0aW9uOiBcIlxcXCJcXFxcXFxcXHtcXFwiXCIgfSxcbiAgICAgICAgcGVnJGM2MSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gJ1xcdTAwN0InOyB9LFxuICAgICAgICBwZWckYzYyID0gXCJcXFxcfVwiLFxuICAgICAgICBwZWckYzYzID0geyB0eXBlOiBcImxpdGVyYWxcIiwgdmFsdWU6IFwiXFxcXH1cIiwgZGVzY3JpcHRpb246IFwiXFxcIlxcXFxcXFxcfVxcXCJcIiB9LFxuICAgICAgICBwZWckYzY0ID0gZnVuY3Rpb24oKSB7IHJldHVybiAnXFx1MDA3RCc7IH0sXG4gICAgICAgIHBlZyRjNjUgPSBcIlxcXFx1XCIsXG4gICAgICAgIHBlZyRjNjYgPSB7IHR5cGU6IFwibGl0ZXJhbFwiLCB2YWx1ZTogXCJcXFxcdVwiLCBkZXNjcmlwdGlvbjogXCJcXFwiXFxcXFxcXFx1XFxcIlwiIH0sXG4gICAgICAgIHBlZyRjNjcgPSBmdW5jdGlvbihkaWdpdHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChkaWdpdHMsIDE2KSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICBwZWckYzY4ID0gZnVuY3Rpb24oY2hhcnMpIHsgcmV0dXJuIGNoYXJzLmpvaW4oJycpOyB9LFxuXG4gICAgICAgIHBlZyRjdXJyUG9zICAgICAgICAgID0gMCxcbiAgICAgICAgcGVnJHJlcG9ydGVkUG9zICAgICAgPSAwLFxuICAgICAgICBwZWckY2FjaGVkUG9zICAgICAgICA9IDAsXG4gICAgICAgIHBlZyRjYWNoZWRQb3NEZXRhaWxzID0geyBsaW5lOiAxLCBjb2x1bW46IDEsIHNlZW5DUjogZmFsc2UgfSxcbiAgICAgICAgcGVnJG1heEZhaWxQb3MgICAgICAgPSAwLFxuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkICA9IFtdLFxuICAgICAgICBwZWckc2lsZW50RmFpbHMgICAgICA9IDAsXG5cbiAgICAgICAgcGVnJHJlc3VsdDtcblxuICAgIGlmIChcInN0YXJ0UnVsZVwiIGluIG9wdGlvbnMpIHtcbiAgICAgIGlmICghKG9wdGlvbnMuc3RhcnRSdWxlIGluIHBlZyRzdGFydFJ1bGVGdW5jdGlvbnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IHN0YXJ0IHBhcnNpbmcgZnJvbSBydWxlIFxcXCJcIiArIG9wdGlvbnMuc3RhcnRSdWxlICsgXCJcXFwiLlwiKTtcbiAgICAgIH1cblxuICAgICAgcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uID0gcGVnJHN0YXJ0UnVsZUZ1bmN0aW9uc1tvcHRpb25zLnN0YXJ0UnVsZV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGV4dCgpIHtcbiAgICAgIHJldHVybiBpbnB1dC5zdWJzdHJpbmcocGVnJHJlcG9ydGVkUG9zLCBwZWckY3VyclBvcyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb2Zmc2V0KCkge1xuICAgICAgcmV0dXJuIHBlZyRyZXBvcnRlZFBvcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsaW5lKCkge1xuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwZWckcmVwb3J0ZWRQb3MpLmxpbmU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29sdW1uKCkge1xuICAgICAgcmV0dXJuIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwZWckcmVwb3J0ZWRQb3MpLmNvbHVtbjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBleHBlY3RlZChkZXNjcmlwdGlvbikge1xuICAgICAgdGhyb3cgcGVnJGJ1aWxkRXhjZXB0aW9uKFxuICAgICAgICBudWxsLFxuICAgICAgICBbeyB0eXBlOiBcIm90aGVyXCIsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiB9XSxcbiAgICAgICAgcGVnJHJlcG9ydGVkUG9zXG4gICAgICApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVycm9yKG1lc3NhZ2UpIHtcbiAgICAgIHRocm93IHBlZyRidWlsZEV4Y2VwdGlvbihtZXNzYWdlLCBudWxsLCBwZWckcmVwb3J0ZWRQb3MpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRjb21wdXRlUG9zRGV0YWlscyhwb3MpIHtcbiAgICAgIGZ1bmN0aW9uIGFkdmFuY2UoZGV0YWlscywgc3RhcnRQb3MsIGVuZFBvcykge1xuICAgICAgICB2YXIgcCwgY2g7XG5cbiAgICAgICAgZm9yIChwID0gc3RhcnRQb3M7IHAgPCBlbmRQb3M7IHArKykge1xuICAgICAgICAgIGNoID0gaW5wdXQuY2hhckF0KHApO1xuICAgICAgICAgIGlmIChjaCA9PT0gXCJcXG5cIikge1xuICAgICAgICAgICAgaWYgKCFkZXRhaWxzLnNlZW5DUikgeyBkZXRhaWxzLmxpbmUrKzsgfVxuICAgICAgICAgICAgZGV0YWlscy5jb2x1bW4gPSAxO1xuICAgICAgICAgICAgZGV0YWlscy5zZWVuQ1IgPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNoID09PSBcIlxcclwiIHx8IGNoID09PSBcIlxcdTIwMjhcIiB8fCBjaCA9PT0gXCJcXHUyMDI5XCIpIHtcbiAgICAgICAgICAgIGRldGFpbHMubGluZSsrO1xuICAgICAgICAgICAgZGV0YWlscy5jb2x1bW4gPSAxO1xuICAgICAgICAgICAgZGV0YWlscy5zZWVuQ1IgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZXRhaWxzLmNvbHVtbisrO1xuICAgICAgICAgICAgZGV0YWlscy5zZWVuQ1IgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHBlZyRjYWNoZWRQb3MgIT09IHBvcykge1xuICAgICAgICBpZiAocGVnJGNhY2hlZFBvcyA+IHBvcykge1xuICAgICAgICAgIHBlZyRjYWNoZWRQb3MgPSAwO1xuICAgICAgICAgIHBlZyRjYWNoZWRQb3NEZXRhaWxzID0geyBsaW5lOiAxLCBjb2x1bW46IDEsIHNlZW5DUjogZmFsc2UgfTtcbiAgICAgICAgfVxuICAgICAgICBhZHZhbmNlKHBlZyRjYWNoZWRQb3NEZXRhaWxzLCBwZWckY2FjaGVkUG9zLCBwb3MpO1xuICAgICAgICBwZWckY2FjaGVkUG9zID0gcG9zO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcGVnJGNhY2hlZFBvc0RldGFpbHM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJGZhaWwoZXhwZWN0ZWQpIHtcbiAgICAgIGlmIChwZWckY3VyclBvcyA8IHBlZyRtYXhGYWlsUG9zKSB7IHJldHVybjsgfVxuXG4gICAgICBpZiAocGVnJGN1cnJQb3MgPiBwZWckbWF4RmFpbFBvcykge1xuICAgICAgICBwZWckbWF4RmFpbFBvcyA9IHBlZyRjdXJyUG9zO1xuICAgICAgICBwZWckbWF4RmFpbEV4cGVjdGVkID0gW107XG4gICAgICB9XG5cbiAgICAgIHBlZyRtYXhGYWlsRXhwZWN0ZWQucHVzaChleHBlY3RlZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJGJ1aWxkRXhjZXB0aW9uKG1lc3NhZ2UsIGV4cGVjdGVkLCBwb3MpIHtcbiAgICAgIGZ1bmN0aW9uIGNsZWFudXBFeHBlY3RlZChleHBlY3RlZCkge1xuICAgICAgICB2YXIgaSA9IDE7XG5cbiAgICAgICAgZXhwZWN0ZWQuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgaWYgKGEuZGVzY3JpcHRpb24gPCBiLmRlc2NyaXB0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgfSBlbHNlIGlmIChhLmRlc2NyaXB0aW9uID4gYi5kZXNjcmlwdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgd2hpbGUgKGkgPCBleHBlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICBpZiAoZXhwZWN0ZWRbaSAtIDFdID09PSBleHBlY3RlZFtpXSkge1xuICAgICAgICAgICAgZXhwZWN0ZWQuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGJ1aWxkTWVzc2FnZShleHBlY3RlZCwgZm91bmQpIHtcbiAgICAgICAgZnVuY3Rpb24gc3RyaW5nRXNjYXBlKHMpIHtcbiAgICAgICAgICBmdW5jdGlvbiBoZXgoY2gpIHsgcmV0dXJuIGNoLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7IH1cblxuICAgICAgICAgIHJldHVybiBzXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxcXC9nLCAgICdcXFxcXFxcXCcpXG4gICAgICAgICAgICAucmVwbGFjZSgvXCIvZywgICAgJ1xcXFxcIicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFx4MDgvZywgJ1xcXFxiJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHQvZywgICAnXFxcXHQnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcbi9nLCAgICdcXFxcbicpXG4gICAgICAgICAgICAucmVwbGFjZSgvXFxmL2csICAgJ1xcXFxmJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cXHIvZywgICAnXFxcXHInKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1tcXHgwMC1cXHgwN1xceDBCXFx4MEVcXHgwRl0vZywgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceDAnICsgaGV4KGNoKTsgfSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx4MTAtXFx4MUZcXHg4MC1cXHhGRl0vZywgICAgZnVuY3Rpb24oY2gpIHsgcmV0dXJuICdcXFxceCcgICsgaGV4KGNoKTsgfSlcbiAgICAgICAgICAgIC5yZXBsYWNlKC9bXFx1MDE4MC1cXHUwRkZGXS9nLCAgICAgICAgIGZ1bmN0aW9uKGNoKSB7IHJldHVybiAnXFxcXHUwJyArIGhleChjaCk7IH0pXG4gICAgICAgICAgICAucmVwbGFjZSgvW1xcdTEwODAtXFx1RkZGRl0vZywgICAgICAgICBmdW5jdGlvbihjaCkgeyByZXR1cm4gJ1xcXFx1JyAgKyBoZXgoY2gpOyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBleHBlY3RlZERlc2NzID0gbmV3IEFycmF5KGV4cGVjdGVkLmxlbmd0aCksXG4gICAgICAgICAgICBleHBlY3RlZERlc2MsIGZvdW5kRGVzYywgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZXhwZWN0ZWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBleHBlY3RlZERlc2NzW2ldID0gZXhwZWN0ZWRbaV0uZGVzY3JpcHRpb247XG4gICAgICAgIH1cblxuICAgICAgICBleHBlY3RlZERlc2MgPSBleHBlY3RlZC5sZW5ndGggPiAxXG4gICAgICAgICAgPyBleHBlY3RlZERlc2NzLnNsaWNlKDAsIC0xKS5qb2luKFwiLCBcIilcbiAgICAgICAgICAgICAgKyBcIiBvciBcIlxuICAgICAgICAgICAgICArIGV4cGVjdGVkRGVzY3NbZXhwZWN0ZWQubGVuZ3RoIC0gMV1cbiAgICAgICAgICA6IGV4cGVjdGVkRGVzY3NbMF07XG5cbiAgICAgICAgZm91bmREZXNjID0gZm91bmQgPyBcIlxcXCJcIiArIHN0cmluZ0VzY2FwZShmb3VuZCkgKyBcIlxcXCJcIiA6IFwiZW5kIG9mIGlucHV0XCI7XG5cbiAgICAgICAgcmV0dXJuIFwiRXhwZWN0ZWQgXCIgKyBleHBlY3RlZERlc2MgKyBcIiBidXQgXCIgKyBmb3VuZERlc2MgKyBcIiBmb3VuZC5cIjtcbiAgICAgIH1cblxuICAgICAgdmFyIHBvc0RldGFpbHMgPSBwZWckY29tcHV0ZVBvc0RldGFpbHMocG9zKSxcbiAgICAgICAgICBmb3VuZCAgICAgID0gcG9zIDwgaW5wdXQubGVuZ3RoID8gaW5wdXQuY2hhckF0KHBvcykgOiBudWxsO1xuXG4gICAgICBpZiAoZXhwZWN0ZWQgIT09IG51bGwpIHtcbiAgICAgICAgY2xlYW51cEV4cGVjdGVkKGV4cGVjdGVkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBTeW50YXhFcnJvcihcbiAgICAgICAgbWVzc2FnZSAhPT0gbnVsbCA/IG1lc3NhZ2UgOiBidWlsZE1lc3NhZ2UoZXhwZWN0ZWQsIGZvdW5kKSxcbiAgICAgICAgZXhwZWN0ZWQsXG4gICAgICAgIGZvdW5kLFxuICAgICAgICBwb3MsXG4gICAgICAgIHBvc0RldGFpbHMubGluZSxcbiAgICAgICAgcG9zRGV0YWlscy5jb2x1bW5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlc3RhcnQoKSB7XG4gICAgICB2YXIgczA7XG5cbiAgICAgIHMwID0gcGVnJHBhcnNlbWVzc2FnZUZvcm1hdFBhdHRlcm4oKTtcblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZW1lc3NhZ2VGb3JtYXRQYXR0ZXJuKCkge1xuICAgICAgdmFyIHMwLCBzMSwgczI7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMSA9IFtdO1xuICAgICAgczIgPSBwZWckcGFyc2VtZXNzYWdlRm9ybWF0RWxlbWVudCgpO1xuICAgICAgd2hpbGUgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxLnB1c2goczIpO1xuICAgICAgICBzMiA9IHBlZyRwYXJzZW1lc3NhZ2VGb3JtYXRFbGVtZW50KCk7XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgIHMxID0gcGVnJGMxKHMxKTtcbiAgICAgIH1cbiAgICAgIHMwID0gczE7XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VtZXNzYWdlRm9ybWF0RWxlbWVudCgpIHtcbiAgICAgIHZhciBzMDtcblxuICAgICAgczAgPSBwZWckcGFyc2VtZXNzYWdlVGV4dEVsZW1lbnQoKTtcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMCA9IHBlZyRwYXJzZWFyZ3VtZW50RWxlbWVudCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlbWVzc2FnZVRleHQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNTtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gW107XG4gICAgICBzMiA9IHBlZyRjdXJyUG9zO1xuICAgICAgczMgPSBwZWckcGFyc2VfKCk7XG4gICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczQgPSBwZWckcGFyc2VjaGFycygpO1xuICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzNSA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHMzID0gW3MzLCBzNCwgczVdO1xuICAgICAgICAgICAgczIgPSBzMztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMjtcbiAgICAgICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICBzMiA9IHBlZyRjMjtcbiAgICAgIH1cbiAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICB3aGlsZSAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMS5wdXNoKHMyKTtcbiAgICAgICAgICBzMiA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgIHMzID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VjaGFycygpO1xuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgIHM1ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzMyA9IFtzMywgczQsIHM1XTtcbiAgICAgICAgICAgICAgICBzMiA9IHMzO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczI7XG4gICAgICAgICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICAgICAgczIgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRjMjtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgczEgPSBwZWckYzMoczEpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICBzMSA9IHBlZyRwYXJzZXdzKCk7XG4gICAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMxID0gaW5wdXQuc3Vic3RyaW5nKHMwLCBwZWckY3VyclBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgczAgPSBzMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZW1lc3NhZ2VUZXh0RWxlbWVudCgpIHtcbiAgICAgIHZhciBzMCwgczE7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMSA9IHBlZyRwYXJzZW1lc3NhZ2VUZXh0KCk7XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgIHMxID0gcGVnJGM0KHMxKTtcbiAgICAgIH1cbiAgICAgIHMwID0gczE7XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2Vhcmd1bWVudCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyO1xuXG4gICAgICBzMCA9IHBlZyRwYXJzZW51bWJlcigpO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICAgIHMxID0gW107XG4gICAgICAgIGlmIChwZWckYzUudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xuICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNik7IH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICB3aGlsZSAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHMxLnB1c2goczIpO1xuICAgICAgICAgICAgaWYgKHBlZyRjNS50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgICAgICAgIHMyID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHMyID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzYpOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMxID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMxID0gaW5wdXQuc3Vic3RyaW5nKHMwLCBwZWckY3VyclBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgczAgPSBzMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZWFyZ3VtZW50RWxlbWVudCgpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMywgczQsIHM1LCBzNiwgczcsIHM4O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSAxMjMpIHtcbiAgICAgICAgczEgPSBwZWckYzc7XG4gICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM4KTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMyA9IHBlZyRwYXJzZWFyZ3VtZW50KCk7XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzNSA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQ0KSB7XG4gICAgICAgICAgICAgICAgczYgPSBwZWckYzEwO1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgczYgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMSk7IH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzNyA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgICAgICBpZiAoczcgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgIHM4ID0gcGVnJHBhcnNlZWxlbWVudEZvcm1hdCgpO1xuICAgICAgICAgICAgICAgICAgaWYgKHM4ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIHM2ID0gW3M2LCBzNywgczhdO1xuICAgICAgICAgICAgICAgICAgICBzNSA9IHM2O1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNTtcbiAgICAgICAgICAgICAgICAgICAgczUgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczU7XG4gICAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzNTtcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoczUgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjOTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzNiA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gMTI1KSB7XG4gICAgICAgICAgICAgICAgICAgIHM3ID0gcGVnJGMxMjtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHM3ID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzEzKTsgfVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMTQoczMsIHM1KTtcbiAgICAgICAgICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlZWxlbWVudEZvcm1hdCgpIHtcbiAgICAgIHZhciBzMDtcblxuICAgICAgczAgPSBwZWckcGFyc2VzaW1wbGVGb3JtYXQoKTtcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMCA9IHBlZyRwYXJzZXBsdXJhbEZvcm1hdCgpO1xuICAgICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMCA9IHBlZyRwYXJzZXNlbGVjdE9yZGluYWxGb3JtYXQoKTtcbiAgICAgICAgICBpZiAoczAgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHMwID0gcGVnJHBhcnNlc2VsZWN0Rm9ybWF0KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VzaW1wbGVGb3JtYXQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczY7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCA2KSA9PT0gcGVnJGMxNSkge1xuICAgICAgICBzMSA9IHBlZyRjMTU7XG4gICAgICAgIHBlZyRjdXJyUG9zICs9IDY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxNik7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCA0KSA9PT0gcGVnJGMxNykge1xuICAgICAgICAgIHMxID0gcGVnJGMxNztcbiAgICAgICAgICBwZWckY3VyclBvcyArPSA0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTgpOyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMxID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgNCkgPT09IHBlZyRjMTkpIHtcbiAgICAgICAgICAgIHMxID0gcGVnJGMxOTtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zICs9IDQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyMCk7IH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczMgPSBwZWckY3VyclBvcztcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQ0KSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRjMTA7XG4gICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzNCA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VjaGFycygpO1xuICAgICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBzNCA9IFtzNCwgczUsIHM2XTtcbiAgICAgICAgICAgICAgICBzMyA9IHM0O1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgIHMzID0gcGVnJGMyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xuICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMyA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczMgPSBwZWckYzk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICBzMSA9IHBlZyRjMjEoczEsIHMzKTtcbiAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VwbHVyYWxGb3JtYXQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNTtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5zdWJzdHIocGVnJGN1cnJQb3MsIDYpID09PSBwZWckYzIyKSB7XG4gICAgICAgIHMxID0gcGVnJGMyMjtcbiAgICAgICAgcGVnJGN1cnJQb3MgKz0gNjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzIzKTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQ0KSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRjMTA7XG4gICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczUgPSBwZWckcGFyc2VwbHVyYWxTdHlsZSgpO1xuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMjQoczUpO1xuICAgICAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VzZWxlY3RPcmRpbmFsRm9ybWF0KCkge1xuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczU7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAxMykgPT09IHBlZyRjMjUpIHtcbiAgICAgICAgczEgPSBwZWckYzI1O1xuICAgICAgICBwZWckY3VyclBvcyArPSAxMztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzI2KTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlXygpO1xuICAgICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDQ0KSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRjMTA7XG4gICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMTEpOyB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgczQgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczUgPSBwZWckcGFyc2VwbHVyYWxTdHlsZSgpO1xuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMjcoczUpO1xuICAgICAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VzZWxlY3RGb3JtYXQoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczY7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCA2KSA9PT0gcGVnJGMyOCkge1xuICAgICAgICBzMSA9IHBlZyRjMjg7XG4gICAgICAgIHBlZyRjdXJyUG9zICs9IDY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMyOSk7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgaWYgKGlucHV0LmNoYXJDb2RlQXQocGVnJGN1cnJQb3MpID09PSA0NCkge1xuICAgICAgICAgICAgczMgPSBwZWckYzEwO1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgczMgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzExKTsgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoczMgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHM0ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgIHM1ID0gW107XG4gICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlb3B0aW9uYWxGb3JtYXRQYXR0ZXJuKCk7XG4gICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHdoaWxlIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgczUucHVzaChzNik7XG4gICAgICAgICAgICAgICAgICBzNiA9IHBlZyRwYXJzZW9wdGlvbmFsRm9ybWF0UGF0dGVybigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzNSA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoczUgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMzAoczUpO1xuICAgICAgICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VzZWxlY3RvcigpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyLCBzMztcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gcGVnJGN1cnJQb3M7XG4gICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDYxKSB7XG4gICAgICAgIHMyID0gcGVnJGMzMTtcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMyID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzMyKTsgfVxuICAgICAgfVxuICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMzID0gcGVnJHBhcnNlbnVtYmVyKCk7XG4gICAgICAgIGlmIChzMyAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMyID0gW3MyLCBzM107XG4gICAgICAgICAgczEgPSBzMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMxO1xuICAgICAgICAgIHMxID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMxO1xuICAgICAgICBzMSA9IHBlZyRjMjtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMSA9IGlucHV0LnN1YnN0cmluZyhzMCwgcGVnJGN1cnJQb3MpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMCA9IHBlZyRwYXJzZWNoYXJzKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VvcHRpb25hbEZvcm1hdFBhdHRlcm4oKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNSwgczYsIHM3LCBzODtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIHMxID0gcGVnJHBhcnNlXygpO1xuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMyID0gcGVnJHBhcnNlc2VsZWN0b3IoKTtcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczMgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBpZiAoaW5wdXQuY2hhckNvZGVBdChwZWckY3VyclBvcykgPT09IDEyMykge1xuICAgICAgICAgICAgICBzNCA9IHBlZyRjNztcbiAgICAgICAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHM0ID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzgpOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoczQgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgczUgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgICAgICAgIGlmIChzNSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgIHM2ID0gcGVnJHBhcnNlbWVzc2FnZUZvcm1hdFBhdHRlcm4oKTtcbiAgICAgICAgICAgICAgICBpZiAoczYgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgIHM3ID0gcGVnJHBhcnNlXygpO1xuICAgICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gMTI1KSB7XG4gICAgICAgICAgICAgICAgICAgICAgczggPSBwZWckYzEyO1xuICAgICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgczggPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGMxMyk7IH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoczggIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgICAgICBzMSA9IHBlZyRjMzMoczIsIHM2KTtcbiAgICAgICAgICAgICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlb2Zmc2V0KCkge1xuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzO1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgNykgPT09IHBlZyRjMzQpIHtcbiAgICAgICAgczEgPSBwZWckYzM0O1xuICAgICAgICBwZWckY3VyclBvcyArPSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjMzUpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczIgPSBwZWckcGFyc2VfKCk7XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMzID0gcGVnJHBhcnNlbnVtYmVyKCk7XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgIHMxID0gcGVnJGMzNihzMyk7XG4gICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlcGx1cmFsU3R5bGUoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0O1xuXG4gICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgczEgPSBwZWckcGFyc2VvZmZzZXQoKTtcbiAgICAgIGlmIChzMSA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMSA9IHBlZyRjOTtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMiA9IHBlZyRwYXJzZV8oKTtcbiAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczMgPSBbXTtcbiAgICAgICAgICBzNCA9IHBlZyRwYXJzZW9wdGlvbmFsRm9ybWF0UGF0dGVybigpO1xuICAgICAgICAgIGlmIChzNCAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgd2hpbGUgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgIHMzLnB1c2goczQpO1xuICAgICAgICAgICAgICBzNCA9IHBlZyRwYXJzZW9wdGlvbmFsRm9ybWF0UGF0dGVybigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMyA9IHBlZyRjMjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgICAgIHMxID0gcGVnJGMzNyhzMSwgczMpO1xuICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICAgIHMwID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwZWckY3VyclBvcyA9IHMwO1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZXdzKCkge1xuICAgICAgdmFyIHMwLCBzMTtcblxuICAgICAgcGVnJHNpbGVudEZhaWxzKys7XG4gICAgICBzMCA9IFtdO1xuICAgICAgaWYgKHBlZyRjMzkudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xuICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XG4gICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0MCk7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICB3aGlsZSAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICBzMC5wdXNoKHMxKTtcbiAgICAgICAgICBpZiAocGVnJGMzOS50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgICAgICBzMSA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XG4gICAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNDApOyB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgIH1cbiAgICAgIHBlZyRzaWxlbnRGYWlscy0tO1xuICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzM4KTsgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlXygpIHtcbiAgICAgIHZhciBzMCwgczEsIHMyO1xuXG4gICAgICBwZWckc2lsZW50RmFpbHMrKztcbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMSA9IFtdO1xuICAgICAgczIgPSBwZWckcGFyc2V3cygpO1xuICAgICAgd2hpbGUgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHMxLnB1c2goczIpO1xuICAgICAgICBzMiA9IHBlZyRwYXJzZXdzKCk7XG4gICAgICB9XG4gICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczEgPSBpbnB1dC5zdWJzdHJpbmcoczAsIHBlZyRjdXJyUG9zKTtcbiAgICAgIH1cbiAgICAgIHMwID0gczE7XG4gICAgICBwZWckc2lsZW50RmFpbHMtLTtcbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMSA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM0MSk7IH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZWRpZ2l0KCkge1xuICAgICAgdmFyIHMwO1xuXG4gICAgICBpZiAocGVnJGM0Mi50ZXN0KGlucHV0LmNoYXJBdChwZWckY3VyclBvcykpKSB7XG4gICAgICAgIHMwID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgcGVnJGN1cnJQb3MrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMwID0gcGVnJEZBSUxFRDtcbiAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzQzKTsgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gczA7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcGVnJHBhcnNlaGV4RGlnaXQoKSB7XG4gICAgICB2YXIgczA7XG5cbiAgICAgIGlmIChwZWckYzQ0LnRlc3QoaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKSkpIHtcbiAgICAgICAgczAgPSBpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpO1xuICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczAgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNDUpOyB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VudW1iZXIoKSB7XG4gICAgICB2YXIgczAsIHMxLCBzMiwgczMsIHM0LCBzNTtcblxuICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgIGlmIChpbnB1dC5jaGFyQ29kZUF0KHBlZyRjdXJyUG9zKSA9PT0gNDgpIHtcbiAgICAgICAgczEgPSBwZWckYzQ2O1xuICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNDcpOyB9XG4gICAgICB9XG4gICAgICBpZiAoczEgPT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgczEgPSBwZWckY3VyclBvcztcbiAgICAgICAgczIgPSBwZWckY3VyclBvcztcbiAgICAgICAgaWYgKHBlZyRjNDgudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xuICAgICAgICAgIHMzID0gaW5wdXQuY2hhckF0KHBlZyRjdXJyUG9zKTtcbiAgICAgICAgICBwZWckY3VyclBvcysrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMzID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNDkpOyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczQgPSBbXTtcbiAgICAgICAgICBzNSA9IHBlZyRwYXJzZWRpZ2l0KCk7XG4gICAgICAgICAgd2hpbGUgKHM1ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzNC5wdXNoKHM1KTtcbiAgICAgICAgICAgIHM1ID0gcGVnJHBhcnNlZGlnaXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzMyA9IFtzMywgczRdO1xuICAgICAgICAgICAgczIgPSBzMztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMjtcbiAgICAgICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwZWckY3VyclBvcyA9IHMyO1xuICAgICAgICAgIHMyID0gcGVnJGMyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzMiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgIHMyID0gaW5wdXQuc3Vic3RyaW5nKHMxLCBwZWckY3VyclBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgczEgPSBzMjtcbiAgICAgIH1cbiAgICAgIGlmIChzMSAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBwZWckcmVwb3J0ZWRQb3MgPSBzMDtcbiAgICAgICAgczEgPSBwZWckYzUwKHMxKTtcbiAgICAgIH1cbiAgICAgIHMwID0gczE7XG5cbiAgICAgIHJldHVybiBzMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwZWckcGFyc2VjaGFyKCkge1xuICAgICAgdmFyIHMwLCBzMSwgczIsIHMzLCBzNCwgczUsIHM2LCBzNztcblxuICAgICAgaWYgKHBlZyRjNTEudGVzdChpbnB1dC5jaGFyQXQocGVnJGN1cnJQb3MpKSkge1xuICAgICAgICBzMCA9IGlucHV0LmNoYXJBdChwZWckY3VyclBvcyk7XG4gICAgICAgIHBlZyRjdXJyUG9zKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzMCA9IHBlZyRGQUlMRUQ7XG4gICAgICAgIGlmIChwZWckc2lsZW50RmFpbHMgPT09IDApIHsgcGVnJGZhaWwocGVnJGM1Mik7IH1cbiAgICAgIH1cbiAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGM1Mykge1xuICAgICAgICAgIHMxID0gcGVnJGM1MztcbiAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNTQpOyB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgczEgPSBwZWckYzU1KCk7XG4gICAgICAgIH1cbiAgICAgICAgczAgPSBzMTtcbiAgICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGM1Nikge1xuICAgICAgICAgICAgczEgPSBwZWckYzU2O1xuICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzU3KTsgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgczEgPSBwZWckYzU4KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHMwID0gczE7XG4gICAgICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgICAgaWYgKGlucHV0LnN1YnN0cihwZWckY3VyclBvcywgMikgPT09IHBlZyRjNTkpIHtcbiAgICAgICAgICAgICAgczEgPSBwZWckYzU5O1xuICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNjApOyB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICAgIHMxID0gcGVnJGM2MSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgIGlmIChzMCA9PT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICBzMCA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGM2Mikge1xuICAgICAgICAgICAgICAgIHMxID0gcGVnJGM2MjtcbiAgICAgICAgICAgICAgICBwZWckY3VyclBvcyArPSAyO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHMxID0gcGVnJEZBSUxFRDtcbiAgICAgICAgICAgICAgICBpZiAocGVnJHNpbGVudEZhaWxzID09PSAwKSB7IHBlZyRmYWlsKHBlZyRjNjMpOyB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgcGVnJHJlcG9ydGVkUG9zID0gczA7XG4gICAgICAgICAgICAgICAgczEgPSBwZWckYzY0KCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgczAgPSBzMTtcbiAgICAgICAgICAgICAgaWYgKHMwID09PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgczAgPSBwZWckY3VyclBvcztcbiAgICAgICAgICAgICAgICBpZiAoaW5wdXQuc3Vic3RyKHBlZyRjdXJyUG9zLCAyKSA9PT0gcGVnJGM2NSkge1xuICAgICAgICAgICAgICAgICAgczEgPSBwZWckYzY1O1xuICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgKz0gMjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgczEgPSBwZWckRkFJTEVEO1xuICAgICAgICAgICAgICAgICAgaWYgKHBlZyRzaWxlbnRGYWlscyA9PT0gMCkgeyBwZWckZmFpbChwZWckYzY2KTsgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoczEgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgICAgICAgICAgIHMyID0gcGVnJGN1cnJQb3M7XG4gICAgICAgICAgICAgICAgICBzMyA9IHBlZyRjdXJyUG9zO1xuICAgICAgICAgICAgICAgICAgczQgPSBwZWckcGFyc2VoZXhEaWdpdCgpO1xuICAgICAgICAgICAgICAgICAgaWYgKHM0ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIHM1ID0gcGVnJHBhcnNlaGV4RGlnaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHM1ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgczYgPSBwZWckcGFyc2VoZXhEaWdpdCgpO1xuICAgICAgICAgICAgICAgICAgICAgIGlmIChzNiAhPT0gcGVnJEZBSUxFRCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgczcgPSBwZWckcGFyc2VoZXhEaWdpdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHM3ICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHM0ID0gW3M0LCBzNSwgczYsIHM3XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgczMgPSBzNDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHMzID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwZWckY3VyclBvcyA9IHMzO1xuICAgICAgICAgICAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgICAgICAgICAgczMgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczM7XG4gICAgICAgICAgICAgICAgICAgIHMzID0gcGVnJGMyO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaWYgKHMzICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIHMzID0gaW5wdXQuc3Vic3RyaW5nKHMyLCBwZWckY3VyclBvcyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBzMiA9IHMzO1xuICAgICAgICAgICAgICAgICAgaWYgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgICAgICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICAgICAgICAgICAgICBzMSA9IHBlZyRjNjcoczIpO1xuICAgICAgICAgICAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGVnJGN1cnJQb3MgPSBzMDtcbiAgICAgICAgICAgICAgICAgICAgczAgPSBwZWckYzI7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIHBlZyRjdXJyUG9zID0gczA7XG4gICAgICAgICAgICAgICAgICBzMCA9IHBlZyRjMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHBlZyRwYXJzZWNoYXJzKCkge1xuICAgICAgdmFyIHMwLCBzMSwgczI7XG5cbiAgICAgIHMwID0gcGVnJGN1cnJQb3M7XG4gICAgICBzMSA9IFtdO1xuICAgICAgczIgPSBwZWckcGFyc2VjaGFyKCk7XG4gICAgICBpZiAoczIgIT09IHBlZyRGQUlMRUQpIHtcbiAgICAgICAgd2hpbGUgKHMyICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgICAgczEucHVzaChzMik7XG4gICAgICAgICAgczIgPSBwZWckcGFyc2VjaGFyKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMxID0gcGVnJGMyO1xuICAgICAgfVxuICAgICAgaWYgKHMxICE9PSBwZWckRkFJTEVEKSB7XG4gICAgICAgIHBlZyRyZXBvcnRlZFBvcyA9IHMwO1xuICAgICAgICBzMSA9IHBlZyRjNjgoczEpO1xuICAgICAgfVxuICAgICAgczAgPSBzMTtcblxuICAgICAgcmV0dXJuIHMwO1xuICAgIH1cblxuICAgIHBlZyRyZXN1bHQgPSBwZWckc3RhcnRSdWxlRnVuY3Rpb24oKTtcblxuICAgIGlmIChwZWckcmVzdWx0ICE9PSBwZWckRkFJTEVEICYmIHBlZyRjdXJyUG9zID09PSBpbnB1dC5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBwZWckcmVzdWx0O1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocGVnJHJlc3VsdCAhPT0gcGVnJEZBSUxFRCAmJiBwZWckY3VyclBvcyA8IGlucHV0Lmxlbmd0aCkge1xuICAgICAgICBwZWckZmFpbCh7IHR5cGU6IFwiZW5kXCIsIGRlc2NyaXB0aW9uOiBcImVuZCBvZiBpbnB1dFwiIH0pO1xuICAgICAgfVxuXG4gICAgICB0aHJvdyBwZWckYnVpbGRFeGNlcHRpb24obnVsbCwgcGVnJG1heEZhaWxFeHBlY3RlZCwgcGVnJG1heEZhaWxQb3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgU3ludGF4RXJyb3I6IFN5bnRheEVycm9yLFxuICAgIHBhcnNlOiAgICAgICBwYXJzZVxuICB9O1xufSkoKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFyc2VyLmpzLm1hcCIsIi8qIGpzaGludCBub2RlOnRydWUgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgSW50bE1lc3NhZ2VGb3JtYXQgPSByZXF1aXJlKCcuL2xpYi9tYWluJylbJ2RlZmF1bHQnXTtcblxuLy8gQWRkIGFsbCBsb2NhbGUgZGF0YSB0byBgSW50bE1lc3NhZ2VGb3JtYXRgLiBUaGlzIG1vZHVsZSB3aWxsIGJlIGlnbm9yZWQgd2hlblxuLy8gYnVuZGxpbmcgZm9yIHRoZSBicm93c2VyIHdpdGggQnJvd3NlcmlmeS9XZWJwYWNrLlxucmVxdWlyZSgnLi9saWIvbG9jYWxlcycpO1xuXG4vLyBSZS1leHBvcnQgYEludGxNZXNzYWdlRm9ybWF0YCBhcyB0aGUgQ29tbW9uSlMgZGVmYXVsdCBleHBvcnRzIHdpdGggYWxsIHRoZVxuLy8gbG9jYWxlIGRhdGEgcmVnaXN0ZXJlZCwgYW5kIHdpdGggRW5nbGlzaCBzZXQgYXMgdGhlIGRlZmF1bHQgbG9jYWxlLiBEZWZpbmVcbi8vIHRoZSBgZGVmYXVsdGAgcHJvcCBmb3IgdXNlIHdpdGggb3RoZXIgY29tcGlsZWQgRVM2IE1vZHVsZXMuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBJbnRsTWVzc2FnZUZvcm1hdDtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGV4cG9ydHM7XG4iLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IENvbXBpbGVyO1xuXG5mdW5jdGlvbiBDb21waWxlcihsb2NhbGVzLCBmb3JtYXRzLCBwbHVyYWxGbikge1xuICAgIHRoaXMubG9jYWxlcyAgPSBsb2NhbGVzO1xuICAgIHRoaXMuZm9ybWF0cyAgPSBmb3JtYXRzO1xuICAgIHRoaXMucGx1cmFsRm4gPSBwbHVyYWxGbjtcbn1cblxuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGUgPSBmdW5jdGlvbiAoYXN0KSB7XG4gICAgdGhpcy5wbHVyYWxTdGFjayAgICAgICAgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRQbHVyYWwgICAgICA9IG51bGw7XG4gICAgdGhpcy5wbHVyYWxOdW1iZXJGb3JtYXQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXMuY29tcGlsZU1lc3NhZ2UoYXN0KTtcbn07XG5cbkNvbXBpbGVyLnByb3RvdHlwZS5jb21waWxlTWVzc2FnZSA9IGZ1bmN0aW9uIChhc3QpIHtcbiAgICBpZiAoIShhc3QgJiYgYXN0LnR5cGUgPT09ICdtZXNzYWdlRm9ybWF0UGF0dGVybicpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBBU1QgaXMgbm90IG9mIHR5cGU6IFwibWVzc2FnZUZvcm1hdFBhdHRlcm5cIicpO1xuICAgIH1cblxuICAgIHZhciBlbGVtZW50cyA9IGFzdC5lbGVtZW50cyxcbiAgICAgICAgcGF0dGVybiAgPSBbXTtcblxuICAgIHZhciBpLCBsZW4sIGVsZW1lbnQ7XG5cbiAgICBmb3IgKGkgPSAwLCBsZW4gPSBlbGVtZW50cy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBlbGVtZW50ID0gZWxlbWVudHNbaV07XG5cbiAgICAgICAgc3dpdGNoIChlbGVtZW50LnR5cGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ21lc3NhZ2VUZXh0RWxlbWVudCc6XG4gICAgICAgICAgICAgICAgcGF0dGVybi5wdXNoKHRoaXMuY29tcGlsZU1lc3NhZ2VUZXh0KGVsZW1lbnQpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnYXJndW1lbnRFbGVtZW50JzpcbiAgICAgICAgICAgICAgICBwYXR0ZXJuLnB1c2godGhpcy5jb21waWxlQXJndW1lbnQoZWxlbWVudCkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTWVzc2FnZSBlbGVtZW50IGRvZXMgbm90IGhhdmUgYSB2YWxpZCB0eXBlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcGF0dGVybjtcbn07XG5cbkNvbXBpbGVyLnByb3RvdHlwZS5jb21waWxlTWVzc2FnZVRleHQgPSBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgIC8vIFdoZW4gdGhpcyBgZWxlbWVudGAgaXMgcGFydCBvZiBwbHVyYWwgc3ViLXBhdHRlcm4gYW5kIGl0cyB2YWx1ZSBjb250YWluc1xuICAgIC8vIGFuIHVuZXNjYXBlZCAnIycsIHVzZSBhIGBQbHVyYWxPZmZzZXRTdHJpbmdgIGhlbHBlciB0byBwcm9wZXJseSBvdXRwdXRcbiAgICAvLyB0aGUgbnVtYmVyIHdpdGggdGhlIGNvcnJlY3Qgb2Zmc2V0IGluIHRoZSBzdHJpbmcuXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdXJhbCAmJiAvKF58W15cXFxcXSkjL2cudGVzdChlbGVtZW50LnZhbHVlKSkge1xuICAgICAgICAvLyBDcmVhdGUgYSBjYWNoZSBhIE51bWJlckZvcm1hdCBpbnN0YW5jZSB0aGF0IGNhbiBiZSByZXVzZWQgZm9yIGFueVxuICAgICAgICAvLyBQbHVyYWxPZmZzZXRTdHJpbmcgaW5zdGFuY2UgaW4gdGhpcyBtZXNzYWdlLlxuICAgICAgICBpZiAoIXRoaXMucGx1cmFsTnVtYmVyRm9ybWF0KSB7XG4gICAgICAgICAgICB0aGlzLnBsdXJhbE51bWJlckZvcm1hdCA9IG5ldyBJbnRsLk51bWJlckZvcm1hdCh0aGlzLmxvY2FsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQbHVyYWxPZmZzZXRTdHJpbmcoXG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50UGx1cmFsLmlkLFxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFBsdXJhbC5mb3JtYXQub2Zmc2V0LFxuICAgICAgICAgICAgICAgIHRoaXMucGx1cmFsTnVtYmVyRm9ybWF0LFxuICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsdWUpO1xuICAgIH1cblxuICAgIC8vIFVuZXNjYXBlIHRoZSBlc2NhcGVkICcjJ3MgaW4gdGhlIG1lc3NhZ2UgdGV4dC5cbiAgICByZXR1cm4gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXFxcIy9nLCAnIycpO1xufTtcblxuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGVBcmd1bWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgdmFyIGZvcm1hdCA9IGVsZW1lbnQuZm9ybWF0O1xuXG4gICAgaWYgKCFmb3JtYXQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBTdHJpbmdGb3JtYXQoZWxlbWVudC5pZCk7XG4gICAgfVxuXG4gICAgdmFyIGZvcm1hdHMgID0gdGhpcy5mb3JtYXRzLFxuICAgICAgICBsb2NhbGVzICA9IHRoaXMubG9jYWxlcyxcbiAgICAgICAgcGx1cmFsRm4gPSB0aGlzLnBsdXJhbEZuLFxuICAgICAgICBvcHRpb25zO1xuXG4gICAgc3dpdGNoIChmb3JtYXQudHlwZSkge1xuICAgICAgICBjYXNlICdudW1iZXJGb3JtYXQnOlxuICAgICAgICAgICAgb3B0aW9ucyA9IGZvcm1hdHMubnVtYmVyW2Zvcm1hdC5zdHlsZV07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkICAgIDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IG5ldyBJbnRsLk51bWJlckZvcm1hdChsb2NhbGVzLCBvcHRpb25zKS5mb3JtYXRcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgY2FzZSAnZGF0ZUZvcm1hdCc6XG4gICAgICAgICAgICBvcHRpb25zID0gZm9ybWF0cy5kYXRlW2Zvcm1hdC5zdHlsZV07XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGlkICAgIDogZWxlbWVudC5pZCxcbiAgICAgICAgICAgICAgICBmb3JtYXQ6IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KGxvY2FsZXMsIG9wdGlvbnMpLmZvcm1hdFxuICAgICAgICAgICAgfTtcblxuICAgICAgICBjYXNlICd0aW1lRm9ybWF0JzpcbiAgICAgICAgICAgIG9wdGlvbnMgPSBmb3JtYXRzLnRpbWVbZm9ybWF0LnN0eWxlXTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgaWQgICAgOiBlbGVtZW50LmlkLFxuICAgICAgICAgICAgICAgIGZvcm1hdDogbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucykuZm9ybWF0XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIGNhc2UgJ3BsdXJhbEZvcm1hdCc6XG4gICAgICAgICAgICBvcHRpb25zID0gdGhpcy5jb21waWxlT3B0aW9ucyhlbGVtZW50KTtcbiAgICAgICAgICAgIHJldHVybiBuZXcgUGx1cmFsRm9ybWF0KFxuICAgICAgICAgICAgICAgIGVsZW1lbnQuaWQsIGZvcm1hdC5vcmRpbmFsLCBmb3JtYXQub2Zmc2V0LCBvcHRpb25zLCBwbHVyYWxGblxuICAgICAgICAgICAgKTtcblxuICAgICAgICBjYXNlICdzZWxlY3RGb3JtYXQnOlxuICAgICAgICAgICAgb3B0aW9ucyA9IHRoaXMuY29tcGlsZU9wdGlvbnMoZWxlbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFNlbGVjdEZvcm1hdChlbGVtZW50LmlkLCBvcHRpb25zKTtcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNZXNzYWdlIGVsZW1lbnQgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIGZvcm1hdCB0eXBlJyk7XG4gICAgfVxufTtcblxuQ29tcGlsZXIucHJvdG90eXBlLmNvbXBpbGVPcHRpb25zID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICB2YXIgZm9ybWF0ICAgICAgPSBlbGVtZW50LmZvcm1hdCxcbiAgICAgICAgb3B0aW9ucyAgICAgPSBmb3JtYXQub3B0aW9ucyxcbiAgICAgICAgb3B0aW9uc0hhc2ggPSB7fTtcblxuICAgIC8vIFNhdmUgdGhlIGN1cnJlbnQgcGx1cmFsIGVsZW1lbnQsIGlmIGFueSwgdGhlbiBzZXQgaXQgdG8gYSBuZXcgdmFsdWUgd2hlblxuICAgIC8vIGNvbXBpbGluZyB0aGUgb3B0aW9ucyBzdWItcGF0dGVybnMuIFRoaXMgY29uZm9ybXMgdGhlIHNwZWMncyBhbGdvcml0aG1cbiAgICAvLyBmb3IgaGFuZGxpbmcgYFwiI1wiYCBzeW50YXggaW4gbWVzc2FnZSB0ZXh0LlxuICAgIHRoaXMucGx1cmFsU3RhY2sucHVzaCh0aGlzLmN1cnJlbnRQbHVyYWwpO1xuICAgIHRoaXMuY3VycmVudFBsdXJhbCA9IGZvcm1hdC50eXBlID09PSAncGx1cmFsRm9ybWF0JyA/IGVsZW1lbnQgOiBudWxsO1xuXG4gICAgdmFyIGksIGxlbiwgb3B0aW9uO1xuXG4gICAgZm9yIChpID0gMCwgbGVuID0gb3B0aW9ucy5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBvcHRpb24gPSBvcHRpb25zW2ldO1xuXG4gICAgICAgIC8vIENvbXBpbGUgdGhlIHN1Yi1wYXR0ZXJuIGFuZCBzYXZlIGl0IHVuZGVyIHRoZSBvcHRpb25zJ3Mgc2VsZWN0b3IuXG4gICAgICAgIG9wdGlvbnNIYXNoW29wdGlvbi5zZWxlY3Rvcl0gPSB0aGlzLmNvbXBpbGVNZXNzYWdlKG9wdGlvbi52YWx1ZSk7XG4gICAgfVxuXG4gICAgLy8gUG9wIHRoZSBwbHVyYWwgc3RhY2sgdG8gcHV0IGJhY2sgdGhlIG9yaWdpbmFsIGN1cnJlbnQgcGx1cmFsIHZhbHVlLlxuICAgIHRoaXMuY3VycmVudFBsdXJhbCA9IHRoaXMucGx1cmFsU3RhY2sucG9wKCk7XG5cbiAgICByZXR1cm4gb3B0aW9uc0hhc2g7XG59O1xuXG4vLyAtLSBDb21waWxlciBIZWxwZXIgQ2xhc3NlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBTdHJpbmdGb3JtYXQoaWQpIHtcbiAgICB0aGlzLmlkID0gaWQ7XG59XG5cblN0cmluZ0Zvcm1hdC5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKCF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlIDogU3RyaW5nKHZhbHVlKTtcbn07XG5cbmZ1bmN0aW9uIFBsdXJhbEZvcm1hdChpZCwgdXNlT3JkaW5hbCwgb2Zmc2V0LCBvcHRpb25zLCBwbHVyYWxGbikge1xuICAgIHRoaXMuaWQgICAgICAgICA9IGlkO1xuICAgIHRoaXMudXNlT3JkaW5hbCA9IHVzZU9yZGluYWw7XG4gICAgdGhpcy5vZmZzZXQgICAgID0gb2Zmc2V0O1xuICAgIHRoaXMub3B0aW9ucyAgICA9IG9wdGlvbnM7XG4gICAgdGhpcy5wbHVyYWxGbiAgID0gcGx1cmFsRm47XG59XG5cblBsdXJhbEZvcm1hdC5wcm90b3R5cGUuZ2V0T3B0aW9uID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICB2YXIgb3B0aW9uID0gb3B0aW9uc1snPScgKyB2YWx1ZV0gfHxcbiAgICAgICAgICAgIG9wdGlvbnNbdGhpcy5wbHVyYWxGbih2YWx1ZSAtIHRoaXMub2Zmc2V0LCB0aGlzLnVzZU9yZGluYWwpXTtcblxuICAgIHJldHVybiBvcHRpb24gfHwgb3B0aW9ucy5vdGhlcjtcbn07XG5cbmZ1bmN0aW9uIFBsdXJhbE9mZnNldFN0cmluZyhpZCwgb2Zmc2V0LCBudW1iZXJGb3JtYXQsIHN0cmluZykge1xuICAgIHRoaXMuaWQgICAgICAgICAgID0gaWQ7XG4gICAgdGhpcy5vZmZzZXQgICAgICAgPSBvZmZzZXQ7XG4gICAgdGhpcy5udW1iZXJGb3JtYXQgPSBudW1iZXJGb3JtYXQ7XG4gICAgdGhpcy5zdHJpbmcgICAgICAgPSBzdHJpbmc7XG59XG5cblBsdXJhbE9mZnNldFN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdmFyIG51bWJlciA9IHRoaXMubnVtYmVyRm9ybWF0LmZvcm1hdCh2YWx1ZSAtIHRoaXMub2Zmc2V0KTtcblxuICAgIHJldHVybiB0aGlzLnN0cmluZ1xuICAgICAgICAgICAgLnJlcGxhY2UoLyhefFteXFxcXF0pIy9nLCAnJDEnICsgbnVtYmVyKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFwjL2csICcjJyk7XG59O1xuXG5mdW5jdGlvbiBTZWxlY3RGb3JtYXQoaWQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLmlkICAgICAgPSBpZDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xufVxuXG5TZWxlY3RGb3JtYXQucHJvdG90eXBlLmdldE9wdGlvbiA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHJldHVybiBvcHRpb25zW3ZhbHVlXSB8fCBvcHRpb25zLm90aGVyO1xufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29tcGlsZXIuanMubWFwIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xudmFyIHNyYyR1dGlscyQkID0gcmVxdWlyZShcIi4vdXRpbHNcIiksIHNyYyRlczUkJCA9IHJlcXVpcmUoXCIuL2VzNVwiKSwgc3JjJGNvbXBpbGVyJCQgPSByZXF1aXJlKFwiLi9jb21waWxlclwiKSwgaW50bCRtZXNzYWdlZm9ybWF0JHBhcnNlciQkID0gcmVxdWlyZShcImludGwtbWVzc2FnZWZvcm1hdC1wYXJzZXJcIik7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IE1lc3NhZ2VGb3JtYXQ7XG5cbi8vIC0tIE1lc3NhZ2VGb3JtYXQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuZnVuY3Rpb24gTWVzc2FnZUZvcm1hdChtZXNzYWdlLCBsb2NhbGVzLCBmb3JtYXRzKSB7XG4gICAgLy8gUGFyc2Ugc3RyaW5nIG1lc3NhZ2VzIGludG8gYW4gQVNULlxuICAgIHZhciBhc3QgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgTWVzc2FnZUZvcm1hdC5fX3BhcnNlKG1lc3NhZ2UpIDogbWVzc2FnZTtcblxuICAgIGlmICghKGFzdCAmJiBhc3QudHlwZSA9PT0gJ21lc3NhZ2VGb3JtYXRQYXR0ZXJuJykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQSBtZXNzYWdlIG11c3QgYmUgcHJvdmlkZWQgYXMgYSBTdHJpbmcgb3IgQVNULicpO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZXMgYSBuZXcgb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBgZm9ybWF0c2AgbWVyZ2VkIHdpdGggdGhlIGRlZmF1bHRcbiAgICAvLyBmb3JtYXRzLlxuICAgIGZvcm1hdHMgPSB0aGlzLl9tZXJnZUZvcm1hdHMoTWVzc2FnZUZvcm1hdC5mb3JtYXRzLCBmb3JtYXRzKTtcblxuICAgIC8vIERlZmluZWQgZmlyc3QgYmVjYXVzZSBpdCdzIHVzZWQgdG8gYnVpbGQgdGhlIGZvcm1hdCBwYXR0ZXJuLlxuICAgIHNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnX2xvY2FsZScsICB7dmFsdWU6IHRoaXMuX3Jlc29sdmVMb2NhbGUobG9jYWxlcyl9KTtcblxuICAgIC8vIENvbXBpbGUgdGhlIGBhc3RgIHRvIGEgcGF0dGVybiB0aGF0IGlzIGhpZ2hseSBvcHRpbWl6ZWQgZm9yIHJlcGVhdGVkXG4gICAgLy8gYGZvcm1hdCgpYCBpbnZvY2F0aW9ucy4gKipOb3RlOioqIFRoaXMgcGFzc2VzIHRoZSBgbG9jYWxlc2Agc2V0IHByb3ZpZGVkXG4gICAgLy8gdG8gdGhlIGNvbnN0cnVjdG9yIGluc3RlYWQgb2YganVzdCB0aGUgcmVzb2x2ZWQgbG9jYWxlLlxuICAgIHZhciBwbHVyYWxGbiA9IHRoaXMuX2ZpbmRQbHVyYWxSdWxlRnVuY3Rpb24odGhpcy5fbG9jYWxlKTtcbiAgICB2YXIgcGF0dGVybiAgPSB0aGlzLl9jb21waWxlUGF0dGVybihhc3QsIGxvY2FsZXMsIGZvcm1hdHMsIHBsdXJhbEZuKTtcblxuICAgIC8vIFwiQmluZFwiIGBmb3JtYXQoKWAgbWV0aG9kIHRvIGB0aGlzYCBzbyBpdCBjYW4gYmUgcGFzc2VkIGJ5IHJlZmVyZW5jZSBsaWtlXG4gICAgLy8gdGhlIG90aGVyIGBJbnRsYCBBUElzLlxuICAgIHZhciBtZXNzYWdlRm9ybWF0ID0gdGhpcztcbiAgICB0aGlzLmZvcm1hdCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgcmV0dXJuIG1lc3NhZ2VGb3JtYXQuX2Zvcm1hdChwYXR0ZXJuLCB2YWx1ZXMpO1xuICAgIH07XG59XG5cbi8vIERlZmF1bHQgZm9ybWF0IG9wdGlvbnMgdXNlZCBhcyB0aGUgcHJvdG90eXBlIG9mIHRoZSBgZm9ybWF0c2AgcHJvdmlkZWQgdG8gdGhlXG4vLyBjb25zdHJ1Y3Rvci4gVGhlc2UgYXJlIHVzZWQgd2hlbiBjb25zdHJ1Y3RpbmcgdGhlIGludGVybmFsIEludGwuTnVtYmVyRm9ybWF0XG4vLyBhbmQgSW50bC5EYXRlVGltZUZvcm1hdCBpbnN0YW5jZXMuXG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoTWVzc2FnZUZvcm1hdCwgJ2Zvcm1hdHMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgIHZhbHVlOiB7XG4gICAgICAgIG51bWJlcjoge1xuICAgICAgICAgICAgJ2N1cnJlbmN5Jzoge1xuICAgICAgICAgICAgICAgIHN0eWxlOiAnY3VycmVuY3knXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAncGVyY2VudCc6IHtcbiAgICAgICAgICAgICAgICBzdHlsZTogJ3BlcmNlbnQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgJ3Nob3J0Jzoge1xuICAgICAgICAgICAgICAgIG1vbnRoOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgZGF5ICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICB5ZWFyIDogJzItZGlnaXQnXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAnbWVkaXVtJzoge1xuICAgICAgICAgICAgICAgIG1vbnRoOiAnc2hvcnQnLFxuICAgICAgICAgICAgICAgIGRheSAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgeWVhciA6ICdudW1lcmljJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ2xvbmcnOiB7XG4gICAgICAgICAgICAgICAgbW9udGg6ICdsb25nJyxcbiAgICAgICAgICAgICAgICBkYXkgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIHllYXIgOiAnbnVtZXJpYydcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdmdWxsJzoge1xuICAgICAgICAgICAgICAgIHdlZWtkYXk6ICdsb25nJyxcbiAgICAgICAgICAgICAgICBtb250aCAgOiAnbG9uZycsXG4gICAgICAgICAgICAgICAgZGF5ICAgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIHllYXIgICA6ICdudW1lcmljJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHRpbWU6IHtcbiAgICAgICAgICAgICdzaG9ydCc6IHtcbiAgICAgICAgICAgICAgICBob3VyICA6ICdudW1lcmljJyxcbiAgICAgICAgICAgICAgICBtaW51dGU6ICdudW1lcmljJ1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ21lZGl1bSc6ICB7XG4gICAgICAgICAgICAgICAgaG91ciAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgbWludXRlOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgc2Vjb25kOiAnbnVtZXJpYydcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICdsb25nJzoge1xuICAgICAgICAgICAgICAgIGhvdXIgICAgICAgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIG1pbnV0ZSAgICAgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIHNlY29uZCAgICAgIDogJ251bWVyaWMnLFxuICAgICAgICAgICAgICAgIHRpbWVab25lTmFtZTogJ3Nob3J0J1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgJ2Z1bGwnOiB7XG4gICAgICAgICAgICAgICAgaG91ciAgICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgbWludXRlICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgc2Vjb25kICAgICAgOiAnbnVtZXJpYycsXG4gICAgICAgICAgICAgICAgdGltZVpvbmVOYW1lOiAnc2hvcnQnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLy8gRGVmaW5lIGludGVybmFsIHByaXZhdGUgcHJvcGVydGllcyBmb3IgZGVhbGluZyB3aXRoIGxvY2FsZSBkYXRhLlxuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KE1lc3NhZ2VGb3JtYXQsICdfX2xvY2FsZURhdGFfXycsIHt2YWx1ZTogc3JjJGVzNSQkLm9iakNyZWF0ZShudWxsKX0pO1xuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KE1lc3NhZ2VGb3JtYXQsICdfX2FkZExvY2FsZURhdGEnLCB7dmFsdWU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCEoZGF0YSAmJiBkYXRhLmxvY2FsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0xvY2FsZSBkYXRhIHByb3ZpZGVkIHRvIEludGxNZXNzYWdlRm9ybWF0IGlzIG1pc3NpbmcgYSAnICtcbiAgICAgICAgICAgICdgbG9jYWxlYCBwcm9wZXJ0eSdcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBNZXNzYWdlRm9ybWF0Ll9fbG9jYWxlRGF0YV9fW2RhdGEubG9jYWxlLnRvTG93ZXJDYXNlKCldID0gZGF0YTtcbn19KTtcblxuLy8gRGVmaW5lcyBgX19wYXJzZSgpYCBzdGF0aWMgbWV0aG9kIGFzIGFuIGV4cG9zZWQgcHJpdmF0ZS5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShNZXNzYWdlRm9ybWF0LCAnX19wYXJzZScsIHt2YWx1ZTogaW50bCRtZXNzYWdlZm9ybWF0JHBhcnNlciQkW1wiZGVmYXVsdFwiXS5wYXJzZX0pO1xuXG4vLyBEZWZpbmUgcHVibGljIGBkZWZhdWx0TG9jYWxlYCBwcm9wZXJ0eSB3aGljaCBkZWZhdWx0cyB0byBFbmdsaXNoLCBidXQgY2FuIGJlXG4vLyBzZXQgYnkgdGhlIGRldmVsb3Blci5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShNZXNzYWdlRm9ybWF0LCAnZGVmYXVsdExvY2FsZScsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlICA6IHRydWUsXG4gICAgdmFsdWUgICAgIDogdW5kZWZpbmVkXG59KTtcblxuTWVzc2FnZUZvcm1hdC5wcm90b3R5cGUucmVzb2x2ZWRPcHRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFRPRE86IFByb3ZpZGUgYW55dGhpbmcgZWxzZT9cbiAgICByZXR1cm4ge1xuICAgICAgICBsb2NhbGU6IHRoaXMuX2xvY2FsZVxuICAgIH07XG59O1xuXG5NZXNzYWdlRm9ybWF0LnByb3RvdHlwZS5fY29tcGlsZVBhdHRlcm4gPSBmdW5jdGlvbiAoYXN0LCBsb2NhbGVzLCBmb3JtYXRzLCBwbHVyYWxGbikge1xuICAgIHZhciBjb21waWxlciA9IG5ldyBzcmMkY29tcGlsZXIkJFtcImRlZmF1bHRcIl0obG9jYWxlcywgZm9ybWF0cywgcGx1cmFsRm4pO1xuICAgIHJldHVybiBjb21waWxlci5jb21waWxlKGFzdCk7XG59O1xuXG5NZXNzYWdlRm9ybWF0LnByb3RvdHlwZS5fZmluZFBsdXJhbFJ1bGVGdW5jdGlvbiA9IGZ1bmN0aW9uIChsb2NhbGUpIHtcbiAgICB2YXIgbG9jYWxlRGF0YSA9IE1lc3NhZ2VGb3JtYXQuX19sb2NhbGVEYXRhX187XG4gICAgdmFyIGRhdGEgICAgICAgPSBsb2NhbGVEYXRhW2xvY2FsZS50b0xvd2VyQ2FzZSgpXTtcblxuICAgIC8vIFRoZSBsb2NhbGUgZGF0YSBpcyBkZS1kdXBsaWNhdGVkLCBzbyB3ZSBoYXZlIHRvIHRyYXZlcnNlIHRoZSBsb2NhbGUnc1xuICAgIC8vIGhpZXJhcmNoeSB1bnRpbCB3ZSBmaW5kIGEgYHBsdXJhbFJ1bGVGdW5jdGlvbmAgdG8gcmV0dXJuLlxuICAgIHdoaWxlIChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLnBsdXJhbFJ1bGVGdW5jdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEucGx1cmFsUnVsZUZ1bmN0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YSA9IGRhdGEucGFyZW50TG9jYWxlICYmIGxvY2FsZURhdGFbZGF0YS5wYXJlbnRMb2NhbGUudG9Mb3dlckNhc2UoKV07XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnTG9jYWxlIGRhdGEgYWRkZWQgdG8gSW50bE1lc3NhZ2VGb3JtYXQgaXMgbWlzc2luZyBhICcgK1xuICAgICAgICAnYHBsdXJhbFJ1bGVGdW5jdGlvbmAgZm9yIDonICsgbG9jYWxlXG4gICAgKTtcbn07XG5cbk1lc3NhZ2VGb3JtYXQucHJvdG90eXBlLl9mb3JtYXQgPSBmdW5jdGlvbiAocGF0dGVybiwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9ICcnLFxuICAgICAgICBpLCBsZW4sIHBhcnQsIGlkLCB2YWx1ZTtcblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IHBhdHRlcm4ubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgcGFydCA9IHBhdHRlcm5baV07XG5cbiAgICAgICAgLy8gRXhpc3QgZWFybHkgZm9yIHN0cmluZyBwYXJ0cy5cbiAgICAgICAgaWYgKHR5cGVvZiBwYXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHBhcnQ7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlkID0gcGFydC5pZDtcblxuICAgICAgICAvLyBFbmZvcmNlIHRoYXQgYWxsIHJlcXVpcmVkIHZhbHVlcyBhcmUgcHJvdmlkZWQgYnkgdGhlIGNhbGxlci5cbiAgICAgICAgaWYgKCEodmFsdWVzICYmIHNyYyR1dGlscyQkLmhvcC5jYWxsKHZhbHVlcywgaWQpKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBIHZhbHVlIG11c3QgYmUgcHJvdmlkZWQgZm9yOiAnICsgaWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFsdWUgPSB2YWx1ZXNbaWRdO1xuXG4gICAgICAgIC8vIFJlY3Vyc2l2ZWx5IGZvcm1hdCBwbHVyYWwgYW5kIHNlbGVjdCBwYXJ0cycgb3B0aW9uIOKAlCB3aGljaCBjYW4gYmUgYVxuICAgICAgICAvLyBuZXN0ZWQgcGF0dGVybiBzdHJ1Y3R1cmUuIFRoZSBjaG9vc2luZyBvZiB0aGUgb3B0aW9uIHRvIHVzZSBpc1xuICAgICAgICAvLyBhYnN0cmFjdGVkLWJ5IGFuZCBkZWxlZ2F0ZWQtdG8gdGhlIHBhcnQgaGVscGVyIG9iamVjdC5cbiAgICAgICAgaWYgKHBhcnQub3B0aW9ucykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IHRoaXMuX2Zvcm1hdChwYXJ0LmdldE9wdGlvbih2YWx1ZSksIHZhbHVlcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgKz0gcGFydC5mb3JtYXQodmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbk1lc3NhZ2VGb3JtYXQucHJvdG90eXBlLl9tZXJnZUZvcm1hdHMgPSBmdW5jdGlvbiAoZGVmYXVsdHMsIGZvcm1hdHMpIHtcbiAgICB2YXIgbWVyZ2VkRm9ybWF0cyA9IHt9LFxuICAgICAgICB0eXBlLCBtZXJnZWRUeXBlO1xuXG4gICAgZm9yICh0eXBlIGluIGRlZmF1bHRzKSB7XG4gICAgICAgIGlmICghc3JjJHV0aWxzJCQuaG9wLmNhbGwoZGVmYXVsdHMsIHR5cGUpKSB7IGNvbnRpbnVlOyB9XG5cbiAgICAgICAgbWVyZ2VkRm9ybWF0c1t0eXBlXSA9IG1lcmdlZFR5cGUgPSBzcmMkZXM1JCQub2JqQ3JlYXRlKGRlZmF1bHRzW3R5cGVdKTtcblxuICAgICAgICBpZiAoZm9ybWF0cyAmJiBzcmMkdXRpbHMkJC5ob3AuY2FsbChmb3JtYXRzLCB0eXBlKSkge1xuICAgICAgICAgICAgc3JjJHV0aWxzJCQuZXh0ZW5kKG1lcmdlZFR5cGUsIGZvcm1hdHNbdHlwZV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lcmdlZEZvcm1hdHM7XG59O1xuXG5NZXNzYWdlRm9ybWF0LnByb3RvdHlwZS5fcmVzb2x2ZUxvY2FsZSA9IGZ1bmN0aW9uIChsb2NhbGVzKSB7XG4gICAgaWYgKHR5cGVvZiBsb2NhbGVzID09PSAnc3RyaW5nJykge1xuICAgICAgICBsb2NhbGVzID0gW2xvY2FsZXNdO1xuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhIGNvcHkgb2YgdGhlIGFycmF5IHNvIHdlIGNhbiBwdXNoIG9uIHRoZSBkZWZhdWx0IGxvY2FsZS5cbiAgICBsb2NhbGVzID0gKGxvY2FsZXMgfHwgW10pLmNvbmNhdChNZXNzYWdlRm9ybWF0LmRlZmF1bHRMb2NhbGUpO1xuXG4gICAgdmFyIGxvY2FsZURhdGEgPSBNZXNzYWdlRm9ybWF0Ll9fbG9jYWxlRGF0YV9fO1xuICAgIHZhciBpLCBsZW4sIGxvY2FsZVBhcnRzLCBkYXRhO1xuXG4gICAgLy8gVXNpbmcgdGhlIHNldCBvZiBsb2NhbGVzICsgdGhlIGRlZmF1bHQgbG9jYWxlLCB3ZSBsb29rIGZvciB0aGUgZmlyc3Qgb25lXG4gICAgLy8gd2hpY2ggdGhhdCBoYXMgYmVlbiByZWdpc3RlcmVkLiBXaGVuIGRhdGEgZG9lcyBub3QgZXhpc3QgZm9yIGEgbG9jYWxlLCB3ZVxuICAgIC8vIHRyYXZlcnNlIGl0cyBhbmNlc3RvcnMgdG8gZmluZCBzb21ldGhpbmcgdGhhdCdzIGJlZW4gcmVnaXN0ZXJlZCB3aXRoaW5cbiAgICAvLyBpdHMgaGllcmFyY2h5IG9mIGxvY2FsZXMuIFNpbmNlIHdlIGxhY2sgdGhlIHByb3BlciBgcGFyZW50TG9jYWxlYCBkYXRhXG4gICAgLy8gaGVyZSwgd2UgbXVzdCB0YWtlIGEgbmFpdmUgYXBwcm9hY2ggdG8gdHJhdmVyc2FsLlxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGxvY2FsZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgbG9jYWxlUGFydHMgPSBsb2NhbGVzW2ldLnRvTG93ZXJDYXNlKCkuc3BsaXQoJy0nKTtcblxuICAgICAgICB3aGlsZSAobG9jYWxlUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhID0gbG9jYWxlRGF0YVtsb2NhbGVQYXJ0cy5qb2luKCctJyldO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIG5vcm1hbGl6ZWQgbG9jYWxlIHN0cmluZzsgZS5nLiwgd2UgcmV0dXJuIFwiZW4tVVNcIixcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIFwiZW4tdXNcIi5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5sb2NhbGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvY2FsZVBhcnRzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGUgPSBsb2NhbGVzLnBvcCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ05vIGxvY2FsZSBkYXRhIGhhcyBiZWVuIGFkZGVkIHRvIEludGxNZXNzYWdlRm9ybWF0IGZvcjogJyArXG4gICAgICAgIGxvY2FsZXMuam9pbignLCAnKSArICcsIG9yIHRoZSBkZWZhdWx0IGxvY2FsZTogJyArIGRlZmF1bHRMb2NhbGVcbiAgICApO1xufTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCIvLyBHRU5FUkFURUQgRklMRVxuXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHtcImxvY2FsZVwiOlwiZW5cIixcInBsdXJhbFJ1bGVGdW5jdGlvblwiOmZ1bmN0aW9uIChuLG9yZCl7dmFyIHM9U3RyaW5nKG4pLnNwbGl0KFwiLlwiKSx2MD0hc1sxXSx0MD1OdW1iZXIoc1swXSk9PW4sbjEwPXQwJiZzWzBdLnNsaWNlKC0xKSxuMTAwPXQwJiZzWzBdLnNsaWNlKC0yKTtpZihvcmQpcmV0dXJuIG4xMD09MSYmbjEwMCE9MTE/XCJvbmVcIjpuMTA9PTImJm4xMDAhPTEyP1widHdvXCI6bjEwPT0zJiZuMTAwIT0xMz9cImZld1wiOlwib3RoZXJcIjtyZXR1cm4gbj09MSYmdjA/XCJvbmVcIjpcIm90aGVyXCJ9fTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW4uanMubWFwIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xudmFyIHNyYyR1dGlscyQkID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG5cbi8vIFB1cnBvc2VseSB1c2luZyB0aGUgc2FtZSBpbXBsZW1lbnRhdGlvbiBhcyB0aGUgSW50bC5qcyBgSW50bGAgcG9seWZpbGwuXG4vLyBDb3B5cmlnaHQgMjAxMyBBbmR5IEVhcm5zaGF3LCBNSVQgTGljZW5zZVxuXG52YXIgcmVhbERlZmluZVByb3AgPSAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7IHJldHVybiAhIU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7fSk7IH1cbiAgICBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn0pKCk7XG5cbnZhciBlczMgPSAhcmVhbERlZmluZVByb3AgJiYgIU9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gcmVhbERlZmluZVByb3AgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOlxuICAgICAgICBmdW5jdGlvbiAob2JqLCBuYW1lLCBkZXNjKSB7XG5cbiAgICBpZiAoJ2dldCcgaW4gZGVzYyAmJiBvYmouX19kZWZpbmVHZXR0ZXJfXykge1xuICAgICAgICBvYmouX19kZWZpbmVHZXR0ZXJfXyhuYW1lLCBkZXNjLmdldCk7XG4gICAgfSBlbHNlIGlmICghc3JjJHV0aWxzJCQuaG9wLmNhbGwob2JqLCBuYW1lKSB8fCAndmFsdWUnIGluIGRlc2MpIHtcbiAgICAgICAgb2JqW25hbWVdID0gZGVzYy52YWx1ZTtcbiAgICB9XG59O1xuXG52YXIgb2JqQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG8sIHByb3BzKSB7XG4gICAgdmFyIG9iaiwgaztcblxuICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgb2JqID0gbmV3IEYoKTtcblxuICAgIGZvciAoayBpbiBwcm9wcykge1xuICAgICAgICBpZiAoc3JjJHV0aWxzJCQuaG9wLmNhbGwocHJvcHMsIGspKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShvYmosIGssIHByb3BzW2tdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuZXhwb3J0cy5kZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5LCBleHBvcnRzLm9iakNyZWF0ZSA9IG9iakNyZWF0ZTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZXM1LmpzLm1hcCIsIi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgc3JjJGNvcmUkJCA9IHJlcXVpcmUoXCIuL2NvcmVcIiksIHNyYyRlbiQkID0gcmVxdWlyZShcIi4vZW5cIik7XG5cbnNyYyRjb3JlJCRbXCJkZWZhdWx0XCJdLl9fYWRkTG9jYWxlRGF0YShzcmMkZW4kJFtcImRlZmF1bHRcIl0pO1xuc3JjJGNvcmUkJFtcImRlZmF1bHRcIl0uZGVmYXVsdExvY2FsZSA9ICdlbic7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gc3JjJGNvcmUkJFtcImRlZmF1bHRcIl07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1haW4uanMubWFwIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xuZXhwb3J0cy5leHRlbmQgPSBleHRlbmQ7XG52YXIgaG9wID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gZXh0ZW5kKG9iaikge1xuICAgIHZhciBzb3VyY2VzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgaSwgbGVuLCBzb3VyY2UsIGtleTtcblxuICAgIGZvciAoaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgc291cmNlID0gc291cmNlc1tpXTtcbiAgICAgICAgaWYgKCFzb3VyY2UpIHsgY29udGludWU7IH1cblxuICAgICAgICBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmIChob3AuY2FsbChzb3VyY2UsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iajtcbn1cbmV4cG9ydHMuaG9wID0gaG9wO1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCJJbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW5cIixcInBsdXJhbFJ1bGVGdW5jdGlvblwiOmZ1bmN0aW9uIChuLG9yZCl7dmFyIHM9U3RyaW5nKG4pLnNwbGl0KFwiLlwiKSx2MD0hc1sxXSx0MD1OdW1iZXIoc1swXSk9PW4sbjEwPXQwJiZzWzBdLnNsaWNlKC0xKSxuMTAwPXQwJiZzWzBdLnNsaWNlKC0yKTtpZihvcmQpcmV0dXJuIG4xMD09MSYmbjEwMCE9MTE/XCJvbmVcIjpuMTA9PTImJm4xMDAhPTEyP1widHdvXCI6bjEwPT0zJiZuMTAwIT0xMz9cImZld1wiOlwib3RoZXJcIjtyZXR1cm4gbj09MSYmdjA/XCJvbmVcIjpcIm90aGVyXCJ9LFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJ5ZWFyXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgeWVhclwiLFwiMVwiOlwibmV4dCB5ZWFyXCIsXCItMVwiOlwibGFzdCB5ZWFyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0geWVhclwiLFwib3RoZXJcIjpcImluIHswfSB5ZWFyc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSB5ZWFyIGFnb1wiLFwib3RoZXJcIjpcInswfSB5ZWFycyBhZ29cIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1vbnRoXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRoaXMgbW9udGhcIixcIjFcIjpcIm5leHQgbW9udGhcIixcIi0xXCI6XCJsYXN0IG1vbnRoXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gbW9udGhcIixcIm90aGVyXCI6XCJpbiB7MH0gbW9udGhzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IG1vbnRoIGFnb1wiLFwib3RoZXJcIjpcInswfSBtb250aHMgYWdvXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZGF5XCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcInRvZGF5XCIsXCIxXCI6XCJ0b21vcnJvd1wiLFwiLTFcIjpcInllc3RlcmRheVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IGRheVwiLFwib3RoZXJcIjpcImluIHswfSBkYXlzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IGRheSBhZ29cIixcIm90aGVyXCI6XCJ7MH0gZGF5cyBhZ29cIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG91clwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gaG91clwiLFwib3RoZXJcIjpcImluIHswfSBob3Vyc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBob3VyIGFnb1wiLFwib3RoZXJcIjpcInswfSBob3VycyBhZ29cIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dGVcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiaW4gezB9IG1pbnV0ZVwiLFwib3RoZXJcIjpcImluIHswfSBtaW51dGVzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IG1pbnV0ZSBhZ29cIixcIm90aGVyXCI6XCJ7MH0gbWludXRlcyBhZ29cIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWNvbmRcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwibm93XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gc2Vjb25kXCIsXCJvdGhlclwiOlwiaW4gezB9IHNlY29uZHNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gc2Vjb25kIGFnb1wiLFwib3RoZXJcIjpcInswfSBzZWNvbmRzIGFnb1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLTAwMVwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tMTUwXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQUdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1BSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUFTXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1BVFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUFVXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQkJcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1CRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUJJXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1CTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUJTXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQldcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1CWlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUNBXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQ0NcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1DSFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0xNTBcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUNLXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tQ01cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1DWFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUNZXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tREVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMTUwXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1ER1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLURLXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tRE1cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1Ec3J0XCIsXCJwbHVyYWxSdWxlRnVuY3Rpb25cIjpmdW5jdGlvbiAobixvcmQpe2lmKG9yZClyZXR1cm5cIm90aGVyXCI7cmV0dXJuXCJvdGhlclwifSxcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiWWVhclwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJ0aGlzIHllYXJcIixcIjFcIjpcIm5leHQgeWVhclwiLFwiLTFcIjpcImxhc3QgeWVhclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IHlcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0geVwifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwiTW9udGhcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyBtb250aFwiLFwiMVwiOlwibmV4dCBtb250aFwiLFwiLTFcIjpcImxhc3QgbW9udGhcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBtXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IG1cIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJEYXlcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidG9kYXlcIixcIjFcIjpcInRvbW9ycm93XCIsXCItMVwiOlwieWVzdGVyZGF5XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gZFwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBkXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcIkhvdXJcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IGhcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0gaFwifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIk1pbnV0ZVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gbWluXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IG1pblwifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcIlNlY29uZFwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJub3dcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBzXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IHNcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1FUlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUZJXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tRkpcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1GS1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUZNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tR0JcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1HRFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdHXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tR0hcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1HSVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tR1VcIixcInBhcmVudExvY2FsZVwiOlwiZW5cIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUdZXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSEtcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1JRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUlMXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSU1cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1JTlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUlPXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tSkVcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1KTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUtFXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tS0lcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1LTlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUtZXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTENcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1MUlwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLUxTXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTUdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1NSFwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTU9cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1NUFwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTVNcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1NVFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU1VXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTVdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1NWVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU5BXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTkZcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1OR1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU5MXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tTlJcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1OVVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLU5aXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUEdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1QSFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVBLXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUE5cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1QUlwiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tUFdcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1SV1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNCXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU0NcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TRFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNFXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU0dcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TSFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNJXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTE1MFwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU0xcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVNYXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tU1pcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1TaGF3XCIsXCJwbHVyYWxSdWxlRnVuY3Rpb25cIjpmdW5jdGlvbiAobixvcmQpe2lmKG9yZClyZXR1cm5cIm90aGVyXCI7cmV0dXJuXCJvdGhlclwifSxcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiWWVhclwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJ0aGlzIHllYXJcIixcIjFcIjpcIm5leHQgeWVhclwiLFwiLTFcIjpcImxhc3QgeWVhclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IHlcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0geVwifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwiTW9udGhcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyBtb250aFwiLFwiMVwiOlwibmV4dCBtb250aFwiLFwiLTFcIjpcImxhc3QgbW9udGhcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBtXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IG1cIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJEYXlcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidG9kYXlcIixcIjFcIjpcInRvbW9ycm93XCIsXCItMVwiOlwieWVzdGVyZGF5XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gZFwifSxcInBhc3RcIjp7XCJvdGhlclwiOlwiLXswfSBkXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcIkhvdXJcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm90aGVyXCI6XCIrezB9IGhcIn0sXCJwYXN0XCI6e1wib3RoZXJcIjpcIi17MH0gaFwifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIk1pbnV0ZVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib3RoZXJcIjpcIit7MH0gbWluXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IG1pblwifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcIlNlY29uZFwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJub3dcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvdGhlclwiOlwiK3swfSBzXCJ9LFwicGFzdFwiOntcIm90aGVyXCI6XCItezB9IHNcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1UQ1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVRLXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVE9cIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1UVFwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVRWXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVFpcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1VR1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVVNXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1VU1wiLFwicGFyZW50TG9jYWxlXCI6XCJlblwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tVkNcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1WR1wiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVZJXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1WVVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVdTXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZW4tWkFcIixcInBhcmVudExvY2FsZVwiOlwiZW4tMDAxXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlbi1aTVwiLFwicGFyZW50TG9jYWxlXCI6XCJlbi0wMDFcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVuLVpXXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVuLTAwMVwifSk7XG4iLCJJbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXNcIixcInBsdXJhbFJ1bGVGdW5jdGlvblwiOmZ1bmN0aW9uIChuLG9yZCl7aWYob3JkKXJldHVyblwib3RoZXJcIjtyZXR1cm4gbj09MT9cIm9uZVwiOlwib3RoZXJcIn0sXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRlYXllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy00MTlcIixcInBhcmVudExvY2FsZVwiOlwiZXNcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUFSXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtQk9cIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1DTFwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUNPXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtQ1JcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRpZXJcIixcIi0xXCI6XCJheWVyXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGTDrWFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGTDrWFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGTDrWFzXCJ9fX0sXCJob3VyXCI6e1wiZGlzcGxheU5hbWVcIjpcImhvcmFcIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBob3Jhc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGhvcmFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBob3Jhc1wifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1pbnV0b1wiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWludXRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1pbnV0b1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1pbnV0b3NcIn19fSxcInNlY29uZFwiOntcImRpc3BsYXlOYW1lXCI6XCJzZWd1bmRvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImFob3JhXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IHNlZ3VuZG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IHNlZ3VuZG9zXCJ9fX19fSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtQ1VcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1ET1wiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiQcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwiTWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcIkTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGVheWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJNaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwiU2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUVBXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1FQ1wiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLUdRXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzXCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1HVFwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiYcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1ITlwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIixcImZpZWxkc1wiOntcInllYXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiYcOxb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIGHDsW9cIixcIjFcIjpcImVsIHByw7N4aW1vIGHDsW9cIixcIi0xXCI6XCJlbCBhw7FvIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBhw7Fvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGHDsW9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBhw7Fvc1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWVzXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgbWVzXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBtZXNcIixcIi0xXCI6XCJlbCBtZXMgcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IG1lc1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gbWVzZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtZXNcIixcIm90aGVyXCI6XCJoYWNlIHswfSBtZXNlc1wifX19LFwiZGF5XCI6e1wiZGlzcGxheU5hbWVcIjpcImTDrWFcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiaG95XCIsXCIxXCI6XCJtYcOxYW5hXCIsXCIyXCI6XCJwYXNhZG8gbWHDsWFuYVwiLFwiLTJcIjpcImFudGllclwiLFwiLTFcIjpcImF5ZXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gZMOtYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gZMOtYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gZMOtYXNcIn19fSxcImhvdXJcIjp7XCJkaXNwbGF5TmFtZVwiOlwiaG9yYVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGhvcmFcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGhvcmFzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImhhY2UgezB9IGhvcmFzXCJ9fX0sXCJtaW51dGVcIjp7XCJkaXNwbGF5TmFtZVwiOlwibWludXRvXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWludXRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWludXRvc1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlZ3VuZG9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiYWhvcmFcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gc2VndW5kb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gc2VndW5kb3NcIn19fX19KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1JQ1wiLFwicGFyZW50TG9jYWxlXCI6XCJlc1wifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtTVhcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBhw7FvIHByw7N4aW1vXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgbWVzIHByw7N4aW1vXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZW4gezB9IG1lc1wiLFwib3RoZXJcIjpcImVuIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50aWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLU5JXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50aWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVBBXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50aWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVBFXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtUEhcIixcInBhcmVudExvY2FsZVwiOlwiZXNcIn0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVBSXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtUFlcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCIsXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcImHDsW9cIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBhw7FvXCIsXCIxXCI6XCJlbCBwcsOzeGltbyBhw7FvXCIsXCItMVwiOlwiZWwgYcOxbyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gYcOxb3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBhw7FvXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gYcOxb3NcIn19fSxcIm1vbnRoXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1lc1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJlc3RlIG1lc1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gbWVzXCIsXCItMVwiOlwiZWwgbWVzIHBhc2Fkb1wifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtZXNcIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1lc2VzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gbWVzZXNcIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkw61hXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImhveVwiLFwiMVwiOlwibWHDsWFuYVwiLFwiMlwiOlwicGFzYWRvIG1hw7FhbmFcIixcIi0yXCI6XCJhbnRlcyBkZSBheWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVNWXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwiLFwiZmllbGRzXCI6e1wieWVhclwiOntcImRpc3BsYXlOYW1lXCI6XCJhw7FvXCIsXCJyZWxhdGl2ZVwiOntcIjBcIjpcImVzdGUgYcOxb1wiLFwiMVwiOlwiZWwgcHLDs3hpbW8gYcOxb1wiLFwiLTFcIjpcImVsIGHDsW8gcGFzYWRvXCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJkZW50cm8gZGUgezB9IGHDsW9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IGHDsW9zXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiaGFjZSB7MH0gYcOxb1wiLFwib3RoZXJcIjpcImhhY2UgezB9IGHDsW9zXCJ9fX0sXCJtb250aFwiOntcImRpc3BsYXlOYW1lXCI6XCJtZXNcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwiZXN0ZSBtZXNcIixcIjFcIjpcImVsIHByw7N4aW1vIG1lc1wiLFwiLTFcIjpcImVsIG1lcyBwYXNhZG9cIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gbWVzXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBtZXNlc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IG1lc1wiLFwib3RoZXJcIjpcImhhY2UgezB9IG1lc2VzXCJ9fX0sXCJkYXlcIjp7XCJkaXNwbGF5TmFtZVwiOlwiZMOtYVwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJob3lcIixcIjFcIjpcIm1hw7FhbmFcIixcIjJcIjpcInBhc2FkbyBtYcOxYW5hXCIsXCItMlwiOlwiYW50aWVyXCIsXCItMVwiOlwiYXllclwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBkw61hXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBkw61hc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IGTDrWFcIixcIm90aGVyXCI6XCJoYWNlIHswfSBkw61hc1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3JhXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImRlbnRybyBkZSB7MH0gaG9yYVwiLFwib3RoZXJcIjpcImRlbnRybyBkZSB7MH0gaG9yYXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBob3JhXCIsXCJvdGhlclwiOlwiaGFjZSB7MH0gaG9yYXNcIn19fSxcIm1pbnV0ZVwiOntcImRpc3BsYXlOYW1lXCI6XCJtaW51dG9cIixcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJkZW50cm8gZGUgezB9IG1pbnV0b3NcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJoYWNlIHswfSBtaW51dG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBtaW51dG9zXCJ9fX0sXCJzZWNvbmRcIjp7XCJkaXNwbGF5TmFtZVwiOlwic2VndW5kb1wiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJhaG9yYVwifSxcInJlbGF0aXZlVGltZVwiOntcImZ1dHVyZVwiOntcIm9uZVwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvXCIsXCJvdGhlclwiOlwiZGVudHJvIGRlIHswfSBzZWd1bmRvc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcImhhY2UgezB9IHNlZ3VuZG9cIixcIm90aGVyXCI6XCJoYWNlIHswfSBzZWd1bmRvc1wifX19fX0pO1xuSW50bFJlbGF0aXZlRm9ybWF0Ll9fYWRkTG9jYWxlRGF0YSh7XCJsb2NhbGVcIjpcImVzLVVTXCIsXCJwYXJlbnRMb2NhbGVcIjpcImVzLTQxOVwifSk7XG5JbnRsUmVsYXRpdmVGb3JtYXQuX19hZGRMb2NhbGVEYXRhKHtcImxvY2FsZVwiOlwiZXMtVVlcIixcInBhcmVudExvY2FsZVwiOlwiZXMtNDE5XCJ9KTtcbkludGxSZWxhdGl2ZUZvcm1hdC5fX2FkZExvY2FsZURhdGEoe1wibG9jYWxlXCI6XCJlcy1WRVwiLFwicGFyZW50TG9jYWxlXCI6XCJlcy00MTlcIn0pO1xuIiwiLyoganNoaW50IG5vZGU6dHJ1ZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBJbnRsUmVsYXRpdmVGb3JtYXQgPSByZXF1aXJlKCcuL2xpYi9tYWluJylbJ2RlZmF1bHQnXTtcblxuLy8gQWRkIGFsbCBsb2NhbGUgZGF0YSB0byBgSW50bFJlbGF0aXZlRm9ybWF0YC4gVGhpcyBtb2R1bGUgd2lsbCBiZSBpZ25vcmVkIHdoZW5cbi8vIGJ1bmRsaW5nIGZvciB0aGUgYnJvd3NlciB3aXRoIEJyb3dzZXJpZnkvV2VicGFjay5cbnJlcXVpcmUoJy4vbGliL2xvY2FsZXMnKTtcblxuLy8gUmUtZXhwb3J0IGBJbnRsUmVsYXRpdmVGb3JtYXRgIGFzIHRoZSBDb21tb25KUyBkZWZhdWx0IGV4cG9ydHMgd2l0aCBhbGwgdGhlXG4vLyBsb2NhbGUgZGF0YSByZWdpc3RlcmVkLCBhbmQgd2l0aCBFbmdsaXNoIHNldCBhcyB0aGUgZGVmYXVsdCBsb2NhbGUuIERlZmluZVxuLy8gdGhlIGBkZWZhdWx0YCBwcm9wIGZvciB1c2Ugd2l0aCBvdGhlciBjb21waWxlZCBFUzYgTW9kdWxlcy5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEludGxSZWxhdGl2ZUZvcm1hdDtcbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IGV4cG9ydHM7XG4iLCIvKlxuQ29weXJpZ2h0IChjKSAyMDE0LCBZYWhvbyEgSW5jLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuQ29weXJpZ2h0cyBsaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBMaWNlbnNlLlxuU2VlIHRoZSBhY2NvbXBhbnlpbmcgTElDRU5TRSBmaWxlIGZvciB0ZXJtcy5cbiovXG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG52YXIgaW50bCRtZXNzYWdlZm9ybWF0JCQgPSByZXF1aXJlKFwiaW50bC1tZXNzYWdlZm9ybWF0XCIpLCBzcmMkZGlmZiQkID0gcmVxdWlyZShcIi4vZGlmZlwiKSwgc3JjJGVzNSQkID0gcmVxdWlyZShcIi4vZXM1XCIpO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBSZWxhdGl2ZUZvcm1hdDtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxudmFyIEZJRUxEUyA9IFsnc2Vjb25kJywgJ21pbnV0ZScsICdob3VyJywgJ2RheScsICdtb250aCcsICd5ZWFyJ107XG52YXIgU1RZTEVTID0gWydiZXN0IGZpdCcsICdudW1lcmljJ107XG5cbi8vIC0tIFJlbGF0aXZlRm9ybWF0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmZ1bmN0aW9uIFJlbGF0aXZlRm9ybWF0KGxvY2FsZXMsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIC8vIE1ha2UgYSBjb3B5IG9mIGBsb2NhbGVzYCBpZiBpdCdzIGFuIGFycmF5LCBzbyB0aGF0IGl0IGRvZXNuJ3QgY2hhbmdlXG4gICAgLy8gc2luY2UgaXQncyB1c2VkIGxhemlseS5cbiAgICBpZiAoc3JjJGVzNSQkLmlzQXJyYXkobG9jYWxlcykpIHtcbiAgICAgICAgbG9jYWxlcyA9IGxvY2FsZXMuY29uY2F0KCk7XG4gICAgfVxuXG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfbG9jYWxlJywge3ZhbHVlOiB0aGlzLl9yZXNvbHZlTG9jYWxlKGxvY2FsZXMpfSk7XG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfb3B0aW9ucycsIHt2YWx1ZToge1xuICAgICAgICBzdHlsZTogdGhpcy5fcmVzb2x2ZVN0eWxlKG9wdGlvbnMuc3R5bGUpLFxuICAgICAgICB1bml0czogdGhpcy5faXNWYWxpZFVuaXRzKG9wdGlvbnMudW5pdHMpICYmIG9wdGlvbnMudW5pdHNcbiAgICB9fSk7XG5cbiAgICBzcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkodGhpcywgJ19sb2NhbGVzJywge3ZhbHVlOiBsb2NhbGVzfSk7XG4gICAgc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KHRoaXMsICdfZmllbGRzJywge3ZhbHVlOiB0aGlzLl9maW5kRmllbGRzKHRoaXMuX2xvY2FsZSl9KTtcbiAgICBzcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkodGhpcywgJ19tZXNzYWdlcycsIHt2YWx1ZTogc3JjJGVzNSQkLm9iakNyZWF0ZShudWxsKX0pO1xuXG4gICAgLy8gXCJCaW5kXCIgYGZvcm1hdCgpYCBtZXRob2QgdG8gYHRoaXNgIHNvIGl0IGNhbiBiZSBwYXNzZWQgYnkgcmVmZXJlbmNlIGxpa2VcbiAgICAvLyB0aGUgb3RoZXIgYEludGxgIEFQSXMuXG4gICAgdmFyIHJlbGF0aXZlRm9ybWF0ID0gdGhpcztcbiAgICB0aGlzLmZvcm1hdCA9IGZ1bmN0aW9uIGZvcm1hdChkYXRlLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiByZWxhdGl2ZUZvcm1hdC5fZm9ybWF0KGRhdGUsIG9wdGlvbnMpO1xuICAgIH07XG59XG5cbi8vIERlZmluZSBpbnRlcm5hbCBwcml2YXRlIHByb3BlcnRpZXMgZm9yIGRlYWxpbmcgd2l0aCBsb2NhbGUgZGF0YS5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShSZWxhdGl2ZUZvcm1hdCwgJ19fbG9jYWxlRGF0YV9fJywge3ZhbHVlOiBzcmMkZXM1JCQub2JqQ3JlYXRlKG51bGwpfSk7XG5zcmMkZXM1JCQuZGVmaW5lUHJvcGVydHkoUmVsYXRpdmVGb3JtYXQsICdfX2FkZExvY2FsZURhdGEnLCB7dmFsdWU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgaWYgKCEoZGF0YSAmJiBkYXRhLmxvY2FsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgJ0xvY2FsZSBkYXRhIHByb3ZpZGVkIHRvIEludGxSZWxhdGl2ZUZvcm1hdCBpcyBtaXNzaW5nIGEgJyArXG4gICAgICAgICAgICAnYGxvY2FsZWAgcHJvcGVydHkgdmFsdWUnXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgUmVsYXRpdmVGb3JtYXQuX19sb2NhbGVEYXRhX19bZGF0YS5sb2NhbGUudG9Mb3dlckNhc2UoKV0gPSBkYXRhO1xuXG4gICAgLy8gQWRkIGRhdGEgdG8gSW50bE1lc3NhZ2VGb3JtYXQuXG4gICAgaW50bCRtZXNzYWdlZm9ybWF0JCRbXCJkZWZhdWx0XCJdLl9fYWRkTG9jYWxlRGF0YShkYXRhKTtcbn19KTtcblxuLy8gRGVmaW5lIHB1YmxpYyBgZGVmYXVsdExvY2FsZWAgcHJvcGVydHkgd2hpY2ggY2FuIGJlIHNldCBieSB0aGUgZGV2ZWxvcGVyLCBvclxuLy8gaXQgd2lsbCBiZSBzZXQgd2hlbiB0aGUgZmlyc3QgUmVsYXRpdmVGb3JtYXQgaW5zdGFuY2UgaXMgY3JlYXRlZCBieVxuLy8gbGV2ZXJhZ2luZyB0aGUgcmVzb2x2ZWQgbG9jYWxlIGZyb20gYEludGxgLlxuc3JjJGVzNSQkLmRlZmluZVByb3BlcnR5KFJlbGF0aXZlRm9ybWF0LCAnZGVmYXVsdExvY2FsZScsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlICA6IHRydWUsXG4gICAgdmFsdWUgICAgIDogdW5kZWZpbmVkXG59KTtcblxuLy8gRGVmaW5lIHB1YmxpYyBgdGhyZXNob2xkc2AgcHJvcGVydHkgd2hpY2ggY2FuIGJlIHNldCBieSB0aGUgZGV2ZWxvcGVyLCBhbmRcbi8vIGRlZmF1bHRzIHRvIHJlbGF0aXZlIHRpbWUgdGhyZXNob2xkcyBmcm9tIG1vbWVudC5qcy5cbnNyYyRlczUkJC5kZWZpbmVQcm9wZXJ0eShSZWxhdGl2ZUZvcm1hdCwgJ3RocmVzaG9sZHMnLCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcblxuICAgIHZhbHVlOiB7XG4gICAgICAgIHNlY29uZDogNDUsICAvLyBzZWNvbmRzIHRvIG1pbnV0ZVxuICAgICAgICBtaW51dGU6IDQ1LCAgLy8gbWludXRlcyB0byBob3VyXG4gICAgICAgIGhvdXIgIDogMjIsICAvLyBob3VycyB0byBkYXlcbiAgICAgICAgZGF5ICAgOiAyNiwgIC8vIGRheXMgdG8gbW9udGhcbiAgICAgICAgbW9udGggOiAxMSAgIC8vIG1vbnRocyB0byB5ZWFyXG4gICAgfVxufSk7XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5yZXNvbHZlZE9wdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgbG9jYWxlOiB0aGlzLl9sb2NhbGUsXG4gICAgICAgIHN0eWxlIDogdGhpcy5fb3B0aW9ucy5zdHlsZSxcbiAgICAgICAgdW5pdHMgOiB0aGlzLl9vcHRpb25zLnVuaXRzXG4gICAgfTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5fY29tcGlsZU1lc3NhZ2UgPSBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICAvLyBgdGhpcy5fbG9jYWxlc2AgaXMgdGhlIG9yaWdpbmFsIHNldCBvZiBsb2NhbGVzIHRoZSB1c2VyIHNwZWNpZmllZCB0byB0aGVcbiAgICAvLyBjb25zdHJ1Y3Rvciwgd2hpbGUgYHRoaXMuX2xvY2FsZWAgaXMgdGhlIHJlc29sdmVkIHJvb3QgbG9jYWxlLlxuICAgIHZhciBsb2NhbGVzICAgICAgICA9IHRoaXMuX2xvY2FsZXM7XG4gICAgdmFyIHJlc29sdmVkTG9jYWxlID0gdGhpcy5fbG9jYWxlO1xuXG4gICAgdmFyIGZpZWxkICAgICAgICA9IHRoaXMuX2ZpZWxkc1t1bml0c107XG4gICAgdmFyIHJlbGF0aXZlVGltZSA9IGZpZWxkLnJlbGF0aXZlVGltZTtcbiAgICB2YXIgZnV0dXJlICAgICAgID0gJyc7XG4gICAgdmFyIHBhc3QgICAgICAgICA9ICcnO1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpIGluIHJlbGF0aXZlVGltZS5mdXR1cmUpIHtcbiAgICAgICAgaWYgKHJlbGF0aXZlVGltZS5mdXR1cmUuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgIGZ1dHVyZSArPSAnICcgKyBpICsgJyB7JyArXG4gICAgICAgICAgICAgICAgcmVsYXRpdmVUaW1lLmZ1dHVyZVtpXS5yZXBsYWNlKCd7MH0nLCAnIycpICsgJ30nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChpIGluIHJlbGF0aXZlVGltZS5wYXN0KSB7XG4gICAgICAgIGlmIChyZWxhdGl2ZVRpbWUucGFzdC5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgcGFzdCArPSAnICcgKyBpICsgJyB7JyArXG4gICAgICAgICAgICAgICAgcmVsYXRpdmVUaW1lLnBhc3RbaV0ucmVwbGFjZSgnezB9JywgJyMnKSArICd9JztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBtZXNzYWdlID0gJ3t3aGVuLCBzZWxlY3QsIGZ1dHVyZSB7ezAsIHBsdXJhbCwgJyArIGZ1dHVyZSArICd9fScgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Bhc3Qge3swLCBwbHVyYWwsICcgKyBwYXN0ICsgJ319fSc7XG5cbiAgICAvLyBDcmVhdGUgdGhlIHN5bnRoZXRpYyBJbnRsTWVzc2FnZUZvcm1hdCBpbnN0YW5jZSB1c2luZyB0aGUgb3JpZ2luYWxcbiAgICAvLyBsb2NhbGVzIHZhbHVlIHNwZWNpZmllZCBieSB0aGUgdXNlciB3aGVuIGNvbnN0cnVjdGluZyB0aGUgdGhlIHBhcmVudFxuICAgIC8vIEludGxSZWxhdGl2ZUZvcm1hdCBpbnN0YW5jZS5cbiAgICByZXR1cm4gbmV3IGludGwkbWVzc2FnZWZvcm1hdCQkW1wiZGVmYXVsdFwiXShtZXNzYWdlLCBsb2NhbGVzKTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5fZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uICh1bml0cykge1xuICAgIHZhciBtZXNzYWdlcyA9IHRoaXMuX21lc3NhZ2VzO1xuXG4gICAgLy8gQ3JlYXRlIGEgbmV3IHN5bnRoZXRpYyBtZXNzYWdlIGJhc2VkIG9uIHRoZSBsb2NhbGUgZGF0YSBmcm9tIENMRFIuXG4gICAgaWYgKCFtZXNzYWdlc1t1bml0c10pIHtcbiAgICAgICAgbWVzc2FnZXNbdW5pdHNdID0gdGhpcy5fY29tcGlsZU1lc3NhZ2UodW5pdHMpO1xuICAgIH1cblxuICAgIHJldHVybiBtZXNzYWdlc1t1bml0c107XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX2dldFJlbGF0aXZlVW5pdHMgPSBmdW5jdGlvbiAoZGlmZiwgdW5pdHMpIHtcbiAgICB2YXIgZmllbGQgPSB0aGlzLl9maWVsZHNbdW5pdHNdO1xuXG4gICAgaWYgKGZpZWxkLnJlbGF0aXZlKSB7XG4gICAgICAgIHJldHVybiBmaWVsZC5yZWxhdGl2ZVtkaWZmXTtcbiAgICB9XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX2ZpbmRGaWVsZHMgPSBmdW5jdGlvbiAobG9jYWxlKSB7XG4gICAgdmFyIGxvY2FsZURhdGEgPSBSZWxhdGl2ZUZvcm1hdC5fX2xvY2FsZURhdGFfXztcbiAgICB2YXIgZGF0YSAgICAgICA9IGxvY2FsZURhdGFbbG9jYWxlLnRvTG93ZXJDYXNlKCldO1xuXG4gICAgLy8gVGhlIGxvY2FsZSBkYXRhIGlzIGRlLWR1cGxpY2F0ZWQsIHNvIHdlIGhhdmUgdG8gdHJhdmVyc2UgdGhlIGxvY2FsZSdzXG4gICAgLy8gaGllcmFyY2h5IHVudGlsIHdlIGZpbmQgYGZpZWxkc2AgdG8gcmV0dXJuLlxuICAgIHdoaWxlIChkYXRhKSB7XG4gICAgICAgIGlmIChkYXRhLmZpZWxkcykge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuZmllbGRzO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YSA9IGRhdGEucGFyZW50TG9jYWxlICYmIGxvY2FsZURhdGFbZGF0YS5wYXJlbnRMb2NhbGUudG9Mb3dlckNhc2UoKV07XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnTG9jYWxlIGRhdGEgYWRkZWQgdG8gSW50bFJlbGF0aXZlRm9ybWF0IGlzIG1pc3NpbmcgYGZpZWxkc2AgZm9yIDonICtcbiAgICAgICAgbG9jYWxlXG4gICAgKTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5fZm9ybWF0ID0gZnVuY3Rpb24gKGRhdGUsIG9wdGlvbnMpIHtcbiAgICB2YXIgbm93ID0gb3B0aW9ucyAmJiBvcHRpb25zLm5vdyAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy5ub3cgOiBzcmMkZXM1JCQuZGF0ZU5vdygpO1xuXG4gICAgaWYgKGRhdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBkYXRlID0gbm93O1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSBpZiB0aGUgYGRhdGVgIGFuZCBvcHRpb25hbCBgbm93YCB2YWx1ZXMgYXJlIHZhbGlkLCBhbmQgdGhyb3cgYVxuICAgIC8vIHNpbWlsYXIgZXJyb3IgdG8gd2hhdCBgSW50bC5EYXRlVGltZUZvcm1hdCNmb3JtYXQoKWAgd291bGQgdGhyb3cuXG4gICAgaWYgKCFpc0Zpbml0ZShub3cpKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgICAgICAgJ1RoZSBgbm93YCBvcHRpb24gcHJvdmlkZWQgdG8gSW50bFJlbGF0aXZlRm9ybWF0I2Zvcm1hdCgpIGlzIG5vdCAnICtcbiAgICAgICAgICAgICdpbiB2YWxpZCByYW5nZS4nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFpc0Zpbml0ZShkYXRlKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcbiAgICAgICAgICAgICdUaGUgZGF0ZSB2YWx1ZSBwcm92aWRlZCB0byBJbnRsUmVsYXRpdmVGb3JtYXQjZm9ybWF0KCkgaXMgbm90ICcgK1xuICAgICAgICAgICAgJ2luIHZhbGlkIHJhbmdlLidcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB2YXIgZGlmZlJlcG9ydCAgPSBzcmMkZGlmZiQkW1wiZGVmYXVsdFwiXShub3csIGRhdGUpO1xuICAgIHZhciB1bml0cyAgICAgICA9IHRoaXMuX29wdGlvbnMudW5pdHMgfHwgdGhpcy5fc2VsZWN0VW5pdHMoZGlmZlJlcG9ydCk7XG4gICAgdmFyIGRpZmZJblVuaXRzID0gZGlmZlJlcG9ydFt1bml0c107XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5zdHlsZSAhPT0gJ251bWVyaWMnKSB7XG4gICAgICAgIHZhciByZWxhdGl2ZVVuaXRzID0gdGhpcy5fZ2V0UmVsYXRpdmVVbml0cyhkaWZmSW5Vbml0cywgdW5pdHMpO1xuICAgICAgICBpZiAocmVsYXRpdmVVbml0cykge1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0aXZlVW5pdHM7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0TWVzc2FnZSh1bml0cykuZm9ybWF0KHtcbiAgICAgICAgJzAnIDogTWF0aC5hYnMoZGlmZkluVW5pdHMpLFxuICAgICAgICB3aGVuOiBkaWZmSW5Vbml0cyA8IDAgPyAncGFzdCcgOiAnZnV0dXJlJ1xuICAgIH0pO1xufTtcblxuUmVsYXRpdmVGb3JtYXQucHJvdG90eXBlLl9pc1ZhbGlkVW5pdHMgPSBmdW5jdGlvbiAodW5pdHMpIHtcbiAgICBpZiAoIXVuaXRzIHx8IHNyYyRlczUkJC5hcnJJbmRleE9mLmNhbGwoRklFTERTLCB1bml0cykgPj0gMCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHVuaXRzID09PSAnc3RyaW5nJykge1xuICAgICAgICB2YXIgc3VnZ2VzdGlvbiA9IC9zJC8udGVzdCh1bml0cykgJiYgdW5pdHMuc3Vic3RyKDAsIHVuaXRzLmxlbmd0aCAtIDEpO1xuICAgICAgICBpZiAoc3VnZ2VzdGlvbiAmJiBzcmMkZXM1JCQuYXJySW5kZXhPZi5jYWxsKEZJRUxEUywgc3VnZ2VzdGlvbikgPj0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgICAgICdcIicgKyB1bml0cyArICdcIiBpcyBub3QgYSB2YWxpZCBJbnRsUmVsYXRpdmVGb3JtYXQgYHVuaXRzYCAnICtcbiAgICAgICAgICAgICAgICAndmFsdWUsIGRpZCB5b3UgbWVhbjogJyArIHN1Z2dlc3Rpb25cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdcIicgKyB1bml0cyArICdcIiBpcyBub3QgYSB2YWxpZCBJbnRsUmVsYXRpdmVGb3JtYXQgYHVuaXRzYCB2YWx1ZSwgaXQgJyArXG4gICAgICAgICdtdXN0IGJlIG9uZSBvZjogXCInICsgRklFTERTLmpvaW4oJ1wiLCBcIicpICsgJ1wiJ1xuICAgICk7XG59O1xuXG5SZWxhdGl2ZUZvcm1hdC5wcm90b3R5cGUuX3Jlc29sdmVMb2NhbGUgPSBmdW5jdGlvbiAobG9jYWxlcykge1xuICAgIGlmICh0eXBlb2YgbG9jYWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbG9jYWxlcyA9IFtsb2NhbGVzXTtcbiAgICB9XG5cbiAgICAvLyBDcmVhdGUgYSBjb3B5IG9mIHRoZSBhcnJheSBzbyB3ZSBjYW4gcHVzaCBvbiB0aGUgZGVmYXVsdCBsb2NhbGUuXG4gICAgbG9jYWxlcyA9IChsb2NhbGVzIHx8IFtdKS5jb25jYXQoUmVsYXRpdmVGb3JtYXQuZGVmYXVsdExvY2FsZSk7XG5cbiAgICB2YXIgbG9jYWxlRGF0YSA9IFJlbGF0aXZlRm9ybWF0Ll9fbG9jYWxlRGF0YV9fO1xuICAgIHZhciBpLCBsZW4sIGxvY2FsZVBhcnRzLCBkYXRhO1xuXG4gICAgLy8gVXNpbmcgdGhlIHNldCBvZiBsb2NhbGVzICsgdGhlIGRlZmF1bHQgbG9jYWxlLCB3ZSBsb29rIGZvciB0aGUgZmlyc3Qgb25lXG4gICAgLy8gd2hpY2ggdGhhdCBoYXMgYmVlbiByZWdpc3RlcmVkLiBXaGVuIGRhdGEgZG9lcyBub3QgZXhpc3QgZm9yIGEgbG9jYWxlLCB3ZVxuICAgIC8vIHRyYXZlcnNlIGl0cyBhbmNlc3RvcnMgdG8gZmluZCBzb21ldGhpbmcgdGhhdCdzIGJlZW4gcmVnaXN0ZXJlZCB3aXRoaW5cbiAgICAvLyBpdHMgaGllcmFyY2h5IG9mIGxvY2FsZXMuIFNpbmNlIHdlIGxhY2sgdGhlIHByb3BlciBgcGFyZW50TG9jYWxlYCBkYXRhXG4gICAgLy8gaGVyZSwgd2UgbXVzdCB0YWtlIGEgbmFpdmUgYXBwcm9hY2ggdG8gdHJhdmVyc2FsLlxuICAgIGZvciAoaSA9IDAsIGxlbiA9IGxvY2FsZXMubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgbG9jYWxlUGFydHMgPSBsb2NhbGVzW2ldLnRvTG93ZXJDYXNlKCkuc3BsaXQoJy0nKTtcblxuICAgICAgICB3aGlsZSAobG9jYWxlUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBkYXRhID0gbG9jYWxlRGF0YVtsb2NhbGVQYXJ0cy5qb2luKCctJyldO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gdGhlIG5vcm1hbGl6ZWQgbG9jYWxlIHN0cmluZzsgZS5nLiwgd2UgcmV0dXJuIFwiZW4tVVNcIixcbiAgICAgICAgICAgICAgICAvLyBpbnN0ZWFkIG9mIFwiZW4tdXNcIi5cbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YS5sb2NhbGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvY2FsZVBhcnRzLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGRlZmF1bHRMb2NhbGUgPSBsb2NhbGVzLnBvcCgpO1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ05vIGxvY2FsZSBkYXRhIGhhcyBiZWVuIGFkZGVkIHRvIEludGxSZWxhdGl2ZUZvcm1hdCBmb3I6ICcgK1xuICAgICAgICBsb2NhbGVzLmpvaW4oJywgJykgKyAnLCBvciB0aGUgZGVmYXVsdCBsb2NhbGU6ICcgKyBkZWZhdWx0TG9jYWxlXG4gICAgKTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5fcmVzb2x2ZVN0eWxlID0gZnVuY3Rpb24gKHN0eWxlKSB7XG4gICAgLy8gRGVmYXVsdCB0byBcImJlc3QgZml0XCIgc3R5bGUuXG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICByZXR1cm4gU1RZTEVTWzBdO1xuICAgIH1cblxuICAgIGlmIChzcmMkZXM1JCQuYXJySW5kZXhPZi5jYWxsKFNUWUxFUywgc3R5bGUpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1wiJyArIHN0eWxlICsgJ1wiIGlzIG5vdCBhIHZhbGlkIEludGxSZWxhdGl2ZUZvcm1hdCBgc3R5bGVgIHZhbHVlLCBpdCAnICtcbiAgICAgICAgJ211c3QgYmUgb25lIG9mOiBcIicgKyBTVFlMRVMuam9pbignXCIsIFwiJykgKyAnXCInXG4gICAgKTtcbn07XG5cblJlbGF0aXZlRm9ybWF0LnByb3RvdHlwZS5fc2VsZWN0VW5pdHMgPSBmdW5jdGlvbiAoZGlmZlJlcG9ydCkge1xuICAgIHZhciBpLCBsLCB1bml0cztcblxuICAgIGZvciAoaSA9IDAsIGwgPSBGSUVMRFMubGVuZ3RoOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgIHVuaXRzID0gRklFTERTW2ldO1xuXG4gICAgICAgIGlmIChNYXRoLmFicyhkaWZmUmVwb3J0W3VuaXRzXSkgPCBSZWxhdGl2ZUZvcm1hdC50aHJlc2hvbGRzW3VuaXRzXSkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5pdHM7XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3JlLmpzLm1hcCIsIi8qXG5Db3B5cmlnaHQgKGMpIDIwMTQsIFlhaG9vISBJbmMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG5Db3B5cmlnaHRzIGxpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIExpY2Vuc2UuXG5TZWUgdGhlIGFjY29tcGFueWluZyBMSUNFTlNFIGZpbGUgZm9yIHRlcm1zLlxuKi9cblxuLyoganNsaW50IGVzbmV4dDogdHJ1ZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHJvdW5kID0gTWF0aC5yb3VuZDtcblxuZnVuY3Rpb24gZGF5c1RvWWVhcnMoZGF5cykge1xuICAgIC8vIDQwMCB5ZWFycyBoYXZlIDE0NjA5NyBkYXlzICh0YWtpbmcgaW50byBhY2NvdW50IGxlYXAgeWVhciBydWxlcylcbiAgICByZXR1cm4gZGF5cyAqIDQwMCAvIDE0NjA5Nztcbn1cblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAvLyBDb252ZXJ0IHRvIG1zIHRpbWVzdGFtcHMuXG4gICAgZnJvbSA9ICtmcm9tO1xuICAgIHRvICAgPSArdG87XG5cbiAgICB2YXIgbWlsbGlzZWNvbmQgPSByb3VuZCh0byAtIGZyb20pLFxuICAgICAgICBzZWNvbmQgICAgICA9IHJvdW5kKG1pbGxpc2Vjb25kIC8gMTAwMCksXG4gICAgICAgIG1pbnV0ZSAgICAgID0gcm91bmQoc2Vjb25kIC8gNjApLFxuICAgICAgICBob3VyICAgICAgICA9IHJvdW5kKG1pbnV0ZSAvIDYwKSxcbiAgICAgICAgZGF5ICAgICAgICAgPSByb3VuZChob3VyIC8gMjQpLFxuICAgICAgICB3ZWVrICAgICAgICA9IHJvdW5kKGRheSAvIDcpO1xuXG4gICAgdmFyIHJhd1llYXJzID0gZGF5c1RvWWVhcnMoZGF5KSxcbiAgICAgICAgbW9udGggICAgPSByb3VuZChyYXdZZWFycyAqIDEyKSxcbiAgICAgICAgeWVhciAgICAgPSByb3VuZChyYXdZZWFycyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBtaWxsaXNlY29uZDogbWlsbGlzZWNvbmQsXG4gICAgICAgIHNlY29uZCAgICAgOiBzZWNvbmQsXG4gICAgICAgIG1pbnV0ZSAgICAgOiBtaW51dGUsXG4gICAgICAgIGhvdXIgICAgICAgOiBob3VyLFxuICAgICAgICBkYXkgICAgICAgIDogZGF5LFxuICAgICAgICB3ZWVrICAgICAgIDogd2VlayxcbiAgICAgICAgbW9udGggICAgICA6IG1vbnRoLFxuICAgICAgICB5ZWFyICAgICAgIDogeWVhclxuICAgIH07XG59O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kaWZmLmpzLm1hcCIsIi8vIEdFTkVSQVRFRCBGSUxFXG5cInVzZSBzdHJpY3RcIjtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0ge1wibG9jYWxlXCI6XCJlblwiLFwicGx1cmFsUnVsZUZ1bmN0aW9uXCI6ZnVuY3Rpb24gKG4sb3JkKXt2YXIgcz1TdHJpbmcobikuc3BsaXQoXCIuXCIpLHYwPSFzWzFdLHQwPU51bWJlcihzWzBdKT09bixuMTA9dDAmJnNbMF0uc2xpY2UoLTEpLG4xMDA9dDAmJnNbMF0uc2xpY2UoLTIpO2lmKG9yZClyZXR1cm4gbjEwPT0xJiZuMTAwIT0xMT9cIm9uZVwiOm4xMD09MiYmbjEwMCE9MTI/XCJ0d29cIjpuMTA9PTMmJm4xMDAhPTEzP1wiZmV3XCI6XCJvdGhlclwiO3JldHVybiBuPT0xJiZ2MD9cIm9uZVwiOlwib3RoZXJcIn0sXCJmaWVsZHNcIjp7XCJ5ZWFyXCI6e1wiZGlzcGxheU5hbWVcIjpcInllYXJcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyB5ZWFyXCIsXCIxXCI6XCJuZXh0IHllYXJcIixcIi0xXCI6XCJsYXN0IHllYXJcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSB5ZWFyXCIsXCJvdGhlclwiOlwiaW4gezB9IHllYXJzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IHllYXIgYWdvXCIsXCJvdGhlclwiOlwiezB9IHllYXJzIGFnb1wifX19LFwibW9udGhcIjp7XCJkaXNwbGF5TmFtZVwiOlwibW9udGhcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidGhpcyBtb250aFwiLFwiMVwiOlwibmV4dCBtb250aFwiLFwiLTFcIjpcImxhc3QgbW9udGhcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSBtb250aFwiLFwib3RoZXJcIjpcImluIHswfSBtb250aHNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gbW9udGggYWdvXCIsXCJvdGhlclwiOlwiezB9IG1vbnRocyBhZ29cIn19fSxcImRheVwiOntcImRpc3BsYXlOYW1lXCI6XCJkYXlcIixcInJlbGF0aXZlXCI6e1wiMFwiOlwidG9kYXlcIixcIjFcIjpcInRvbW9ycm93XCIsXCItMVwiOlwieWVzdGVyZGF5XCJ9LFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gZGF5XCIsXCJvdGhlclwiOlwiaW4gezB9IGRheXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gZGF5IGFnb1wiLFwib3RoZXJcIjpcInswfSBkYXlzIGFnb1wifX19LFwiaG91clwiOntcImRpc3BsYXlOYW1lXCI6XCJob3VyXCIsXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSBob3VyXCIsXCJvdGhlclwiOlwiaW4gezB9IGhvdXJzXCJ9LFwicGFzdFwiOntcIm9uZVwiOlwiezB9IGhvdXIgYWdvXCIsXCJvdGhlclwiOlwiezB9IGhvdXJzIGFnb1wifX19LFwibWludXRlXCI6e1wiZGlzcGxheU5hbWVcIjpcIm1pbnV0ZVwiLFwicmVsYXRpdmVUaW1lXCI6e1wiZnV0dXJlXCI6e1wib25lXCI6XCJpbiB7MH0gbWludXRlXCIsXCJvdGhlclwiOlwiaW4gezB9IG1pbnV0ZXNcIn0sXCJwYXN0XCI6e1wib25lXCI6XCJ7MH0gbWludXRlIGFnb1wiLFwib3RoZXJcIjpcInswfSBtaW51dGVzIGFnb1wifX19LFwic2Vjb25kXCI6e1wiZGlzcGxheU5hbWVcIjpcInNlY29uZFwiLFwicmVsYXRpdmVcIjp7XCIwXCI6XCJub3dcIn0sXCJyZWxhdGl2ZVRpbWVcIjp7XCJmdXR1cmVcIjp7XCJvbmVcIjpcImluIHswfSBzZWNvbmRcIixcIm90aGVyXCI6XCJpbiB7MH0gc2Vjb25kc1wifSxcInBhc3RcIjp7XCJvbmVcIjpcInswfSBzZWNvbmQgYWdvXCIsXCJvdGhlclwiOlwiezB9IHNlY29uZHMgYWdvXCJ9fX19fTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZW4uanMubWFwIiwiLypcbkNvcHlyaWdodCAoYykgMjAxNCwgWWFob28hIEluYy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbkNvcHlyaWdodHMgbGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgTGljZW5zZS5cblNlZSB0aGUgYWNjb21wYW55aW5nIExJQ0VOU0UgZmlsZSBmb3IgdGVybXMuXG4qL1xuXG4vKiBqc2xpbnQgZXNuZXh0OiB0cnVlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vLyBQdXJwb3NlbHkgdXNpbmcgdGhlIHNhbWUgaW1wbGVtZW50YXRpb24gYXMgdGhlIEludGwuanMgYEludGxgIHBvbHlmaWxsLlxuLy8gQ29weXJpZ2h0IDIwMTMgQW5keSBFYXJuc2hhdywgTUlUIExpY2Vuc2VcblxudmFyIGhvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgcmVhbERlZmluZVByb3AgPSAoZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7IHJldHVybiAhIU9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ2EnLCB7fSk7IH1cbiAgICBjYXRjaCAoZSkgeyByZXR1cm4gZmFsc2U7IH1cbn0pKCk7XG5cbnZhciBlczMgPSAhcmVhbERlZmluZVByb3AgJiYgIU9iamVjdC5wcm90b3R5cGUuX19kZWZpbmVHZXR0ZXJfXztcblxudmFyIGRlZmluZVByb3BlcnR5ID0gcmVhbERlZmluZVByb3AgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOlxuICAgICAgICBmdW5jdGlvbiAob2JqLCBuYW1lLCBkZXNjKSB7XG5cbiAgICBpZiAoJ2dldCcgaW4gZGVzYyAmJiBvYmouX19kZWZpbmVHZXR0ZXJfXykge1xuICAgICAgICBvYmouX19kZWZpbmVHZXR0ZXJfXyhuYW1lLCBkZXNjLmdldCk7XG4gICAgfSBlbHNlIGlmICghaG9wLmNhbGwob2JqLCBuYW1lKSB8fCAndmFsdWUnIGluIGRlc2MpIHtcbiAgICAgICAgb2JqW25hbWVdID0gZGVzYy52YWx1ZTtcbiAgICB9XG59O1xuXG52YXIgb2JqQ3JlYXRlID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiAocHJvdG8sIHByb3BzKSB7XG4gICAgdmFyIG9iaiwgaztcblxuICAgIGZ1bmN0aW9uIEYoKSB7fVxuICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgb2JqID0gbmV3IEYoKTtcblxuICAgIGZvciAoayBpbiBwcm9wcykge1xuICAgICAgICBpZiAoaG9wLmNhbGwocHJvcHMsIGspKSB7XG4gICAgICAgICAgICBkZWZpbmVQcm9wZXJ0eShvYmosIGssIHByb3BzW2tdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvYmo7XG59O1xuXG52YXIgYXJySW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mIHx8IGZ1bmN0aW9uIChzZWFyY2gsIGZyb21JbmRleCkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgdmFyIGFyciA9IHRoaXM7XG4gICAgaWYgKCFhcnIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gZnJvbUluZGV4IHx8IDAsIG1heCA9IGFyci5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICBpZiAoYXJyW2ldID09PSBzZWFyY2gpIHtcbiAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIC0xO1xufTtcblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGRhdGVOb3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xufTtcbmV4cG9ydHMuZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eSwgZXhwb3J0cy5vYmpDcmVhdGUgPSBvYmpDcmVhdGUsIGV4cG9ydHMuYXJySW5kZXhPZiA9IGFyckluZGV4T2YsIGV4cG9ydHMuaXNBcnJheSA9IGlzQXJyYXksIGV4cG9ydHMuZGF0ZU5vdyA9IGRhdGVOb3c7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWVzNS5qcy5tYXAiLCIvLyBFeHBvc2UgYEludGxQb2x5ZmlsbGAgYXMgZ2xvYmFsIHRvIGFkZCBsb2NhbGUgZGF0YSBpbnRvIHJ1bnRpbWUgbGF0ZXIgb24uXG5nbG9iYWwuSW50bFBvbHlmaWxsID0gcmVxdWlyZSgnLi9saWIvY29yZS5qcycpO1xuXG4vLyBSZXF1aXJlIGFsbCBsb2NhbGUgZGF0YSBmb3IgYEludGxgLiBUaGlzIG1vZHVsZSB3aWxsIGJlXG4vLyBpZ25vcmVkIHdoZW4gYnVuZGxpbmcgZm9yIHRoZSBicm93c2VyIHdpdGggQnJvd3NlcmlmeS9XZWJwYWNrLlxucmVxdWlyZSgnLi9sb2NhbGUtZGF0YS9jb21wbGV0ZS5qcycpO1xuXG4vLyBoYWNrIHRvIGV4cG9ydCB0aGUgcG9seWZpbGwgYXMgZ2xvYmFsIEludGwgaWYgbmVlZGVkXG5pZiAoIWdsb2JhbC5JbnRsKSB7XG4gICAgZ2xvYmFsLkludGwgPSBnbG9iYWwuSW50bFBvbHlmaWxsO1xuICAgIGdsb2JhbC5JbnRsUG9seWZpbGwuX19hcHBseUxvY2FsZVNlbnNpdGl2ZVByb3RvdHlwZXMoKTtcbn1cblxuLy8gcHJvdmlkaW5nIGFuIGlkaW9tYXRpYyBhcGkgZm9yIHRoZSBub2RlanMgdmVyc2lvbiBvZiB0aGlzIG1vZHVsZVxubW9kdWxlLmV4cG9ydHMgPSBnbG9iYWwuSW50bFBvbHlmaWxsO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdHlwZW9mIG9iajtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG59O1xuXG52YXIganN4ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgUkVBQ1RfRUxFTUVOVF9UWVBFID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIFN5bWJvbC5mb3IgJiYgU3ltYm9sLmZvcihcInJlYWN0LmVsZW1lbnRcIikgfHwgMHhlYWM3O1xuICByZXR1cm4gZnVuY3Rpb24gY3JlYXRlUmF3UmVhY3RFbGVtZW50KHR5cGUsIHByb3BzLCBrZXksIGNoaWxkcmVuKSB7XG4gICAgdmFyIGRlZmF1bHRQcm9wcyA9IHR5cGUgJiYgdHlwZS5kZWZhdWx0UHJvcHM7XG4gICAgdmFyIGNoaWxkcmVuTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCAtIDM7XG5cbiAgICBpZiAoIXByb3BzICYmIGNoaWxkcmVuTGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcm9wcyA9IHt9O1xuICAgIH1cblxuICAgIGlmIChwcm9wcyAmJiBkZWZhdWx0UHJvcHMpIHtcbiAgICAgIGZvciAodmFyIHByb3BOYW1lIGluIGRlZmF1bHRQcm9wcykge1xuICAgICAgICBpZiAocHJvcHNbcHJvcE5hbWVdID09PSB2b2lkIDApIHtcbiAgICAgICAgICBwcm9wc1twcm9wTmFtZV0gPSBkZWZhdWx0UHJvcHNbcHJvcE5hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcHJvcHMpIHtcbiAgICAgIHByb3BzID0gZGVmYXVsdFByb3BzIHx8IHt9O1xuICAgIH1cblxuICAgIGlmIChjaGlsZHJlbkxlbmd0aCA9PT0gMSkge1xuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICB9IGVsc2UgaWYgKGNoaWxkcmVuTGVuZ3RoID4gMSkge1xuICAgICAgdmFyIGNoaWxkQXJyYXkgPSBBcnJheShjaGlsZHJlbkxlbmd0aCk7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW5MZW5ndGg7IGkrKykge1xuICAgICAgICBjaGlsZEFycmF5W2ldID0gYXJndW1lbnRzW2kgKyAzXTtcbiAgICAgIH1cblxuICAgICAgcHJvcHMuY2hpbGRyZW4gPSBjaGlsZEFycmF5O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAkJHR5cGVvZjogUkVBQ1RfRUxFTUVOVF9UWVBFLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGtleToga2V5ID09PSB1bmRlZmluZWQgPyBudWxsIDogJycgKyBrZXksXG4gICAgICByZWY6IG51bGwsXG4gICAgICBwcm9wczogcHJvcHMsXG4gICAgICBfb3duZXI6IG51bGxcbiAgICB9O1xuICB9O1xufSgpO1xuXG52YXIgYXN5bmNUb0dlbmVyYXRvciA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBnZW4gPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmdW5jdGlvbiBzdGVwKGtleSwgYXJnKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGluZm8gPSBnZW5ba2V5XShhcmcpO1xuICAgICAgICAgIHZhciB2YWx1ZSA9IGluZm8udmFsdWU7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5mby5kb25lKSB7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh2YWx1ZSkudGhlbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdGVwKFwibmV4dFwiLCB2YWx1ZSk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHN0ZXAoXCJ0aHJvd1wiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzdGVwKFwibmV4dFwiKTtcbiAgICB9KTtcbiAgfTtcbn07XG5cbnZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG52YXIgY3JlYXRlQ2xhc3MgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KCk7XG5cbnZhciBkZWZpbmVFbnVtZXJhYmxlUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmosIGRlc2NzKSB7XG4gIGZvciAodmFyIGtleSBpbiBkZXNjcykge1xuICAgIHZhciBkZXNjID0gZGVzY3Nba2V5XTtcbiAgICBkZXNjLmNvbmZpZ3VyYWJsZSA9IGRlc2MuZW51bWVyYWJsZSA9IHRydWU7XG4gICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSBkZXNjLndyaXRhYmxlID0gdHJ1ZTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIGRlc2MpO1xuICB9XG5cbiAgcmV0dXJuIG9iajtcbn07XG5cbnZhciBkZWZhdWx0cyA9IGZ1bmN0aW9uIChvYmosIGRlZmF1bHRzKSB7XG4gIHZhciBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZGVmYXVsdHMpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciB2YWx1ZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoZGVmYXVsdHMsIGtleSk7XG5cbiAgICBpZiAodmFsdWUgJiYgdmFsdWUuY29uZmlndXJhYmxlICYmIG9ialtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59O1xuXG52YXIgZGVmaW5lUHJvcGVydHkkMSA9IGZ1bmN0aW9uIChvYmosIGtleSwgdmFsdWUpIHtcbiAgaWYgKGtleSBpbiBvYmopIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBrZXksIHtcbiAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIG9ialtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4gb2JqO1xufTtcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7XG4gICAgICAgIHRhcmdldFtrZXldID0gc291cmNlW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRhcmdldDtcbn07XG5cbnZhciBnZXQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBnZXQocGFyZW50LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChcInZhbHVlXCIgaW4gZGVzYykge1xuICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHZhciBnZXR0ZXIgPSBkZXNjLmdldDtcblxuICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICB9XG59O1xuXG52YXIgaW5oZXJpdHMgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG52YXIgX2luc3RhbmNlb2YgPSBmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHtcbiAgaWYgKHJpZ2h0ICE9IG51bGwgJiYgdHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiByaWdodFtTeW1ib2wuaGFzSW5zdGFuY2VdKSB7XG4gICAgcmV0dXJuIHJpZ2h0W1N5bWJvbC5oYXNJbnN0YW5jZV0obGVmdCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGxlZnQgaW5zdGFuY2VvZiByaWdodDtcbiAgfVxufTtcblxudmFyIGludGVyb3BSZXF1aXJlRGVmYXVsdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBkZWZhdWx0OiBvYmpcbiAgfTtcbn07XG5cbnZhciBpbnRlcm9wUmVxdWlyZVdpbGRjYXJkID0gZnVuY3Rpb24gKG9iaikge1xuICBpZiAob2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbmV3T2JqID0ge307XG5cbiAgICBpZiAob2JqICE9IG51bGwpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSkpIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgbmV3T2JqLmRlZmF1bHQgPSBvYmo7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxufTtcblxudmFyIG5ld0Fycm93Q2hlY2sgPSBmdW5jdGlvbiAoaW5uZXJUaGlzLCBib3VuZFRoaXMpIHtcbiAgaWYgKGlubmVyVGhpcyAhPT0gYm91bmRUaGlzKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBpbnN0YW50aWF0ZSBhbiBhcnJvdyBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxudmFyIG9iamVjdERlc3RydWN0dXJpbmdFbXB0eSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiA9PSBudWxsKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGRlc3RydWN0dXJlIHVuZGVmaW5lZFwiKTtcbn07XG5cbnZhciBvYmplY3RXaXRob3V0UHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmosIGtleXMpIHtcbiAgdmFyIHRhcmdldCA9IHt9O1xuXG4gIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgaWYgKGtleXMuaW5kZXhPZihpKSA+PSAwKSBjb250aW51ZTtcbiAgICBpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGkpKSBjb250aW51ZTtcbiAgICB0YXJnZXRbaV0gPSBvYmpbaV07XG4gIH1cblxuICByZXR1cm4gdGFyZ2V0O1xufTtcblxudmFyIHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4gPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAodHlwZW9mIGNhbGwgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07XG5cbnZhciBzZWxmR2xvYmFsID0gdHlwZW9mIGdsb2JhbCA9PT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiBnbG9iYWw7XG5cbnZhciBzZXQgPSBmdW5jdGlvbiBzZXQob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpO1xuXG4gICAgaWYgKHBhcmVudCAhPT0gbnVsbCkge1xuICAgICAgc2V0KHBhcmVudCwgcHJvcGVydHksIHZhbHVlLCByZWNlaXZlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjICYmIGRlc2Mud3JpdGFibGUpIHtcbiAgICBkZXNjLnZhbHVlID0gdmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIHNldHRlciA9IGRlc2Muc2V0O1xuXG4gICAgaWYgKHNldHRlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZXR0ZXIuY2FsbChyZWNlaXZlciwgdmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbnZhciBzbGljZWRUb0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBzbGljZUl0ZXJhdG9yKGFyciwgaSkge1xuICAgIHZhciBfYXJyID0gW107XG4gICAgdmFyIF9uID0gdHJ1ZTtcbiAgICB2YXIgX2QgPSBmYWxzZTtcbiAgICB2YXIgX2UgPSB1bmRlZmluZWQ7XG5cbiAgICB0cnkge1xuICAgICAgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkge1xuICAgICAgICBfYXJyLnB1c2goX3MudmFsdWUpO1xuXG4gICAgICAgIGlmIChpICYmIF9hcnIubGVuZ3RoID09PSBpKSBicmVhaztcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIF9kID0gdHJ1ZTtcbiAgICAgIF9lID0gZXJyO1xuICAgIH0gZmluYWxseSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIV9uICYmIF9pW1wicmV0dXJuXCJdKSBfaVtcInJldHVyblwiXSgpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKF9kKSB0aHJvdyBfZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gX2FycjtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoYXJyLCBpKSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkge1xuICAgICAgcmV0dXJuIGFycjtcbiAgICB9IGVsc2UgaWYgKFN5bWJvbC5pdGVyYXRvciBpbiBPYmplY3QoYXJyKSkge1xuICAgICAgcmV0dXJuIHNsaWNlSXRlcmF0b3IoYXJyLCBpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBkZXN0cnVjdHVyZSBub24taXRlcmFibGUgaW5zdGFuY2VcIik7XG4gICAgfVxuICB9O1xufSgpO1xuXG52YXIgc2xpY2VkVG9BcnJheUxvb3NlID0gZnVuY3Rpb24gKGFyciwgaSkge1xuICBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7XG4gICAgcmV0dXJuIGFycjtcbiAgfSBlbHNlIGlmIChTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGFycikpIHtcbiAgICB2YXIgX2FyciA9IFtdO1xuXG4gICAgZm9yICh2YXIgX2l0ZXJhdG9yID0gYXJyW1N5bWJvbC5pdGVyYXRvcl0oKSwgX3N0ZXA7ICEoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lOykge1xuICAgICAgX2Fyci5wdXNoKF9zdGVwLnZhbHVlKTtcblxuICAgICAgaWYgKGkgJiYgX2Fyci5sZW5ndGggPT09IGkpIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBfYXJyO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpO1xuICB9XG59O1xuXG52YXIgdGFnZ2VkVGVtcGxhdGVMaXRlcmFsID0gZnVuY3Rpb24gKHN0cmluZ3MsIHJhdykge1xuICByZXR1cm4gT2JqZWN0LmZyZWV6ZShPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHJpbmdzLCB7XG4gICAgcmF3OiB7XG4gICAgICB2YWx1ZTogT2JqZWN0LmZyZWV6ZShyYXcpXG4gICAgfVxuICB9KSk7XG59O1xuXG52YXIgdGFnZ2VkVGVtcGxhdGVMaXRlcmFsTG9vc2UgPSBmdW5jdGlvbiAoc3RyaW5ncywgcmF3KSB7XG4gIHN0cmluZ3MucmF3ID0gcmF3O1xuICByZXR1cm4gc3RyaW5ncztcbn07XG5cbnZhciB0ZW1wb3JhbFJlZiA9IGZ1bmN0aW9uICh2YWwsIG5hbWUsIHVuZGVmKSB7XG4gIGlmICh2YWwgPT09IHVuZGVmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKG5hbWUgKyBcIiBpcyBub3QgZGVmaW5lZCAtIHRlbXBvcmFsIGRlYWQgem9uZVwiKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdmFsO1xuICB9XG59O1xuXG52YXIgdGVtcG9yYWxVbmRlZmluZWQgPSB7fTtcblxudmFyIHRvQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KGFycikgPyBhcnIgOiBBcnJheS5mcm9tKGFycik7XG59O1xuXG52YXIgdG9Db25zdW1hYmxlQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFycikpIHtcbiAgICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSBhcnIyW2ldID0gYXJyW2ldO1xuXG4gICAgcmV0dXJuIGFycjI7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFycmF5LmZyb20oYXJyKTtcbiAgfVxufTtcblxuXG5cbnZhciBiYWJlbEhlbHBlcnMkMSA9IE9iamVjdC5mcmVlemUoe1xuICBqc3g6IGpzeCxcbiAgYXN5bmNUb0dlbmVyYXRvcjogYXN5bmNUb0dlbmVyYXRvcixcbiAgY2xhc3NDYWxsQ2hlY2s6IGNsYXNzQ2FsbENoZWNrLFxuICBjcmVhdGVDbGFzczogY3JlYXRlQ2xhc3MsXG4gIGRlZmluZUVudW1lcmFibGVQcm9wZXJ0aWVzOiBkZWZpbmVFbnVtZXJhYmxlUHJvcGVydGllcyxcbiAgZGVmYXVsdHM6IGRlZmF1bHRzLFxuICBkZWZpbmVQcm9wZXJ0eTogZGVmaW5lUHJvcGVydHkkMSxcbiAgZ2V0OiBnZXQsXG4gIGluaGVyaXRzOiBpbmhlcml0cyxcbiAgaW50ZXJvcFJlcXVpcmVEZWZhdWx0OiBpbnRlcm9wUmVxdWlyZURlZmF1bHQsXG4gIGludGVyb3BSZXF1aXJlV2lsZGNhcmQ6IGludGVyb3BSZXF1aXJlV2lsZGNhcmQsXG4gIG5ld0Fycm93Q2hlY2s6IG5ld0Fycm93Q2hlY2ssXG4gIG9iamVjdERlc3RydWN0dXJpbmdFbXB0eTogb2JqZWN0RGVzdHJ1Y3R1cmluZ0VtcHR5LFxuICBvYmplY3RXaXRob3V0UHJvcGVydGllczogb2JqZWN0V2l0aG91dFByb3BlcnRpZXMsXG4gIHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm46IHBvc3NpYmxlQ29uc3RydWN0b3JSZXR1cm4sXG4gIHNlbGZHbG9iYWw6IHNlbGZHbG9iYWwsXG4gIHNldDogc2V0LFxuICBzbGljZWRUb0FycmF5OiBzbGljZWRUb0FycmF5LFxuICBzbGljZWRUb0FycmF5TG9vc2U6IHNsaWNlZFRvQXJyYXlMb29zZSxcbiAgdGFnZ2VkVGVtcGxhdGVMaXRlcmFsOiB0YWdnZWRUZW1wbGF0ZUxpdGVyYWwsXG4gIHRhZ2dlZFRlbXBsYXRlTGl0ZXJhbExvb3NlOiB0YWdnZWRUZW1wbGF0ZUxpdGVyYWxMb29zZSxcbiAgdGVtcG9yYWxSZWY6IHRlbXBvcmFsUmVmLFxuICB0ZW1wb3JhbFVuZGVmaW5lZDogdGVtcG9yYWxVbmRlZmluZWQsXG4gIHRvQXJyYXk6IHRvQXJyYXksXG4gIHRvQ29uc3VtYWJsZUFycmF5OiB0b0NvbnN1bWFibGVBcnJheSxcbiAgdHlwZW9mOiBfdHlwZW9mLFxuICBleHRlbmRzOiBfZXh0ZW5kcyxcbiAgaW5zdGFuY2VvZjogX2luc3RhbmNlb2Zcbn0pO1xuXG52YXIgcmVhbERlZmluZVByb3AgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbnRpbmVsID0gZnVuY3Rpb24gc2VudGluZWwoKSB7fTtcbiAgICB0cnkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VudGluZWwsICdhJywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VudGluZWwsICdwcm90b3R5cGUnLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTtcbiAgICAgICAgcmV0dXJuIHNlbnRpbmVsLmEgPT09IDEgJiYgc2VudGluZWwucHJvdG90eXBlIGluc3RhbmNlb2YgT2JqZWN0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn0oKTtcblxuLy8gTmVlZCBhIHdvcmthcm91bmQgZm9yIGdldHRlcnMgaW4gRVMzXG52YXIgZXMzID0gIXJlYWxEZWZpbmVQcm9wICYmICFPYmplY3QucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX187XG5cbi8vIFdlIHVzZSB0aGlzIGEgbG90IChhbmQgbmVlZCBpdCBmb3IgcHJvdG8tbGVzcyBvYmplY3RzKVxudmFyIGhvcCA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIE5haXZlIGRlZmluZVByb3BlcnR5IGZvciBjb21wYXRpYmlsaXR5XG52YXIgZGVmaW5lUHJvcGVydHkgPSByZWFsRGVmaW5lUHJvcCA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIChvYmosIG5hbWUsIGRlc2MpIHtcbiAgICBpZiAoJ2dldCcgaW4gZGVzYyAmJiBvYmouX19kZWZpbmVHZXR0ZXJfXykgb2JqLl9fZGVmaW5lR2V0dGVyX18obmFtZSwgZGVzYy5nZXQpO2Vsc2UgaWYgKCFob3AuY2FsbChvYmosIG5hbWUpIHx8ICd2YWx1ZScgaW4gZGVzYykgb2JqW25hbWVdID0gZGVzYy52YWx1ZTtcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5pbmRleE9mLCBhcyBnb29kIGFzIHdlIG5lZWQgaXQgdG8gYmVcbnZhciBhcnJJbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YgfHwgZnVuY3Rpb24gKHNlYXJjaCkge1xuICAgIC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovXG4gICAgdmFyIHQgPSB0aGlzO1xuICAgIGlmICghdC5sZW5ndGgpIHJldHVybiAtMTtcblxuICAgIGZvciAodmFyIGkgPSBhcmd1bWVudHNbMV0gfHwgMCwgbWF4ID0gdC5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICBpZiAodFtpXSA9PT0gc2VhcmNoKSByZXR1cm4gaTtcbiAgICB9XG5cbiAgICByZXR1cm4gLTE7XG59O1xuXG4vLyBDcmVhdGUgYW4gb2JqZWN0IHdpdGggdGhlIHNwZWNpZmllZCBwcm90b3R5cGUgKDJuZCBhcmcgcmVxdWlyZWQgZm9yIFJlY29yZClcbnZhciBvYmpDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIChwcm90bywgcHJvcHMpIHtcbiAgICB2YXIgb2JqID0gdm9pZCAwO1xuXG4gICAgZnVuY3Rpb24gRigpIHt9XG4gICAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgICBvYmogPSBuZXcgRigpO1xuXG4gICAgZm9yICh2YXIgayBpbiBwcm9wcykge1xuICAgICAgICBpZiAoaG9wLmNhbGwocHJvcHMsIGspKSBkZWZpbmVQcm9wZXJ0eShvYmosIGssIHByb3BzW2tdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gU25hcHNob3Qgc29tZSAoaG9wZWZ1bGx5IHN0aWxsKSBuYXRpdmUgYnVpbHQtaW5zXG52YXIgYXJyU2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG52YXIgYXJyQ29uY2F0ID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdDtcbnZhciBhcnJQdXNoID0gQXJyYXkucHJvdG90eXBlLnB1c2g7XG52YXIgYXJySm9pbiA9IEFycmF5LnByb3RvdHlwZS5qb2luO1xudmFyIGFyclNoaWZ0ID0gQXJyYXkucHJvdG90eXBlLnNoaWZ0O1xuXG4vLyBOYWl2ZSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCBmb3IgY29tcGF0aWJpbGl0eVxudmFyIGZuQmluZCA9IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIHx8IGZ1bmN0aW9uICh0aGlzT2JqKSB7XG4gICAgdmFyIGZuID0gdGhpcyxcbiAgICAgICAgYXJncyA9IGFyclNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcblxuICAgIC8vIEFsbCBvdXIgKHByZXNlbnRseSkgYm91bmQgZnVuY3Rpb25zIGhhdmUgZWl0aGVyIDEgb3IgMCBhcmd1bWVudHMuIEJ5IHJldHVybmluZ1xuICAgIC8vIGRpZmZlcmVudCBmdW5jdGlvbiBzaWduYXR1cmVzLCB3ZSBjYW4gcGFzcyBzb21lIHRlc3RzIGluIEVTMyBlbnZpcm9ubWVudHNcbiAgICBpZiAoZm4ubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpc09iaiwgYXJyQ29uY2F0LmNhbGwoYXJncywgYXJyU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzT2JqLCBhcnJDb25jYXQuY2FsbChhcmdzLCBhcnJTbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xufTtcblxuLy8gT2JqZWN0IGhvdXNpbmcgaW50ZXJuYWwgcHJvcGVydGllcyBmb3IgY29uc3RydWN0b3JzXG52YXIgaW50ZXJuYWxzID0gb2JqQ3JlYXRlKG51bGwpO1xuXG4vLyBLZWVwIGludGVybmFsIHByb3BlcnRpZXMgaW50ZXJuYWxcbnZhciBzZWNyZXQgPSBNYXRoLnJhbmRvbSgpO1xuXG4vLyBIZWxwZXIgZnVuY3Rpb25zXG4vLyA9PT09PT09PT09PT09PT09XG5cbi8qKlxuICogQSBmdW5jdGlvbiB0byBkZWFsIHdpdGggdGhlIGluYWNjdXJhY3kgb2YgY2FsY3VsYXRpbmcgbG9nMTAgaW4gcHJlLUVTNlxuICogSmF2YVNjcmlwdCBlbnZpcm9ubWVudHMuIE1hdGgubG9nKG51bSkgLyBNYXRoLkxOMTAgd2FzIHJlc3BvbnNpYmxlIGZvclxuICogY2F1c2luZyBpc3N1ZSAjNjIuXG4gKi9cbmZ1bmN0aW9uIGxvZzEwRmxvb3Iobikge1xuICAgIC8vIEVTNiBwcm92aWRlcyB0aGUgbW9yZSBhY2N1cmF0ZSBNYXRoLmxvZzEwXG4gICAgaWYgKHR5cGVvZiBNYXRoLmxvZzEwID09PSAnZnVuY3Rpb24nKSByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmxvZzEwKG4pKTtcblxuICAgIHZhciB4ID0gTWF0aC5yb3VuZChNYXRoLmxvZyhuKSAqIE1hdGguTE9HMTBFKTtcbiAgICByZXR1cm4geCAtIChOdW1iZXIoJzFlJyArIHgpID4gbik7XG59XG5cbi8qKlxuICogQSBtYXAgdGhhdCBkb2Vzbid0IGNvbnRhaW4gT2JqZWN0IGluIGl0cyBwcm90b3R5cGUgY2hhaW5cbiAqL1xuZnVuY3Rpb24gUmVjb3JkKG9iaikge1xuICAgIC8vIENvcHkgb25seSBvd24gcHJvcGVydGllcyBvdmVyIHVubGVzcyB0aGlzIG9iamVjdCBpcyBhbHJlYWR5IGEgUmVjb3JkIGluc3RhbmNlXG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFJlY29yZCB8fCBob3AuY2FsbChvYmosIGspKSBkZWZpbmVQcm9wZXJ0eSh0aGlzLCBrLCB7IHZhbHVlOiBvYmpba10sIGVudW1lcmFibGU6IHRydWUsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSk7XG4gICAgfVxufVxuUmVjb3JkLnByb3RvdHlwZSA9IG9iakNyZWF0ZShudWxsKTtcblxuLyoqXG4gKiBBbiBvcmRlcmVkIGxpc3RcbiAqL1xuZnVuY3Rpb24gTGlzdCgpIHtcbiAgICBkZWZpbmVQcm9wZXJ0eSh0aGlzLCAnbGVuZ3RoJywgeyB3cml0YWJsZTogdHJ1ZSwgdmFsdWU6IDAgfSk7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkgYXJyUHVzaC5hcHBseSh0aGlzLCBhcnJTbGljZS5jYWxsKGFyZ3VtZW50cykpO1xufVxuTGlzdC5wcm90b3R5cGUgPSBvYmpDcmVhdGUobnVsbCk7XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byByZXN0b3JlIHRhaW50ZWQgUmVnRXhwIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gY3JlYXRlUmVnRXhwUmVzdG9yZSgpIHtcbiAgICBpZiAoaW50ZXJuYWxzLmRpc2FibGVSZWdFeHBSZXN0b3JlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7Lyogbm8tb3AgKi99O1xuICAgIH1cblxuICAgIHZhciByZWdFeHBDYWNoZSA9IHtcbiAgICAgICAgbGFzdE1hdGNoOiBSZWdFeHAubGFzdE1hdGNoIHx8ICcnLFxuICAgICAgICBsZWZ0Q29udGV4dDogUmVnRXhwLmxlZnRDb250ZXh0LFxuICAgICAgICBtdWx0aWxpbmU6IFJlZ0V4cC5tdWx0aWxpbmUsXG4gICAgICAgIGlucHV0OiBSZWdFeHAuaW5wdXRcbiAgICB9LFxuICAgICAgICBoYXMgPSBmYWxzZTtcblxuICAgIC8vIENyZWF0ZSBhIHNuYXBzaG90IG9mIGFsbCB0aGUgJ2NhcHR1cmVkJyBwcm9wZXJ0aWVzXG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gOTsgaSsrKSB7XG4gICAgICAgIGhhcyA9IChyZWdFeHBDYWNoZVsnJCcgKyBpXSA9IFJlZ0V4cFsnJCcgKyBpXSkgfHwgaGFzO1xuICAgIH1yZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBOb3cgd2UndmUgc25hcHNob3R0ZWQgc29tZSBwcm9wZXJ0aWVzLCBlc2NhcGUgdGhlIGxhc3RNYXRjaCBzdHJpbmdcbiAgICAgICAgdmFyIGVzYyA9IC9bLj8qK14kW1xcXVxcXFwoKXt9fC1dL2csXG4gICAgICAgICAgICBsbSA9IHJlZ0V4cENhY2hlLmxhc3RNYXRjaC5yZXBsYWNlKGVzYywgJ1xcXFwkJicpLFxuICAgICAgICAgICAgcmVnID0gbmV3IExpc3QoKTtcblxuICAgICAgICAvLyBJZiBhbnkgb2YgdGhlIGNhcHR1cmVkIHN0cmluZ3Mgd2VyZSBub24tZW1wdHksIGl0ZXJhdGUgb3ZlciB0aGVtIGFsbFxuICAgICAgICBpZiAoaGFzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDE7IF9pIDw9IDk7IF9pKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IHJlZ0V4cENhY2hlWyckJyArIF9pXTtcblxuICAgICAgICAgICAgICAgIC8vIElmIGl0J3MgZW1wdHksIGFkZCBhbiBlbXB0eSBjYXB0dXJpbmcgZ3JvdXBcbiAgICAgICAgICAgICAgICBpZiAoIW0pIGxtID0gJygpJyArIGxtO1xuXG4gICAgICAgICAgICAgICAgLy8gRWxzZSBmaW5kIHRoZSBzdHJpbmcgaW4gbG0gYW5kIGVzY2FwZSAmIHdyYXAgaXQgdG8gY2FwdHVyZSBpdFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbSA9IG0ucmVwbGFjZShlc2MsICdcXFxcJCYnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxtID0gbG0ucmVwbGFjZShtLCAnKCcgKyBtICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gUHVzaCBpdCB0byB0aGUgcmVnIGFuZCBjaG9wIGxtIHRvIG1ha2Ugc3VyZSBmdXJ0aGVyIGdyb3VwcyBjb21lIGFmdGVyXG4gICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlZywgbG0uc2xpY2UoMCwgbG0uaW5kZXhPZignKCcpICsgMSkpO1xuICAgICAgICAgICAgICAgIGxtID0gbG0uc2xpY2UobG0uaW5kZXhPZignKCcpICsgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZXhwclN0ciA9IGFyckpvaW4uY2FsbChyZWcsICcnKSArIGxtO1xuXG4gICAgICAgIC8vIFNob3J0ZW4gdGhlIHJlZ2V4IGJ5IHJlcGxhY2luZyBlYWNoIHBhcnQgb2YgdGhlIGV4cHJlc3Npb24gd2l0aCBhIG1hdGNoXG4gICAgICAgIC8vIGZvciBhIHN0cmluZyBvZiB0aGF0IGV4YWN0IGxlbmd0aC4gIFRoaXMgaXMgc2FmZSBmb3IgdGhlIHR5cGUgb2ZcbiAgICAgICAgLy8gZXhwcmVzc2lvbnMgZ2VuZXJhdGVkIGFib3ZlLCBiZWNhdXNlIHRoZSBleHByZXNzaW9uIG1hdGNoZXMgdGhlIHdob2xlXG4gICAgICAgIC8vIG1hdGNoIHN0cmluZywgc28gd2Uga25vdyBlYWNoIGdyb3VwIGFuZCBlYWNoIHNlZ21lbnQgYmV0d2VlbiBjYXB0dXJpbmdcbiAgICAgICAgLy8gZ3JvdXBzIGNhbiBiZSBtYXRjaGVkIGJ5IGl0cyBsZW5ndGggYWxvbmUuXG4gICAgICAgIGV4cHJTdHIgPSBleHByU3RyLnJlcGxhY2UoLyhcXFxcXFwofFxcXFxcXCl8W14oKV0pKy9nLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiAnW1xcXFxzXFxcXFNdeycgKyBtYXRjaC5yZXBsYWNlKCdcXFxcJywgJycpLmxlbmd0aCArICd9JztcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gdGhhdCB3aWxsIHJlY29uc3RydWN0IHRoZSBSZWdFeHAgcHJvcGVydGllc1xuICAgICAgICB2YXIgZXhwciA9IG5ldyBSZWdFeHAoZXhwclN0ciwgcmVnRXhwQ2FjaGUubXVsdGlsaW5lID8gJ2dtJyA6ICdnJyk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBsYXN0SW5kZXggb2YgdGhlIGdlbmVyYXRlZCBleHByZXNzaW9uIHRvIGVuc3VyZSB0aGF0IHRoZSBtYXRjaFxuICAgICAgICAvLyBpcyBmb3VuZCBpbiB0aGUgY29ycmVjdCBpbmRleC5cbiAgICAgICAgZXhwci5sYXN0SW5kZXggPSByZWdFeHBDYWNoZS5sZWZ0Q29udGV4dC5sZW5ndGg7XG5cbiAgICAgICAgZXhwci5leGVjKHJlZ0V4cENhY2hlLmlucHV0KTtcbiAgICB9O1xufVxuXG4vKipcbiAqIE1pbWljcyBFUzUncyBhYnN0cmFjdCBUb09iamVjdCgpIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIHRvT2JqZWN0KGFyZykge1xuICAgIGlmIChhcmcgPT09IG51bGwpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IG51bGwgb3IgdW5kZWZpbmVkIHRvIG9iamVjdCcpO1xuXG4gICAgaWYgKCh0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogYmFiZWxIZWxwZXJzJDFbJ3R5cGVvZiddKGFyZykpID09PSAnb2JqZWN0JykgcmV0dXJuIGFyZztcbiAgICByZXR1cm4gT2JqZWN0KGFyZyk7XG59XG5cbmZ1bmN0aW9uIHRvTnVtYmVyKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykgcmV0dXJuIGFyZztcbiAgICByZXR1cm4gTnVtYmVyKGFyZyk7XG59XG5cbmZ1bmN0aW9uIHRvSW50ZWdlcihhcmcpIHtcbiAgICB2YXIgbnVtYmVyID0gdG9OdW1iZXIoYXJnKTtcbiAgICBpZiAoaXNOYU4obnVtYmVyKSkgcmV0dXJuIDA7XG4gICAgaWYgKG51bWJlciA9PT0gKzAgfHwgbnVtYmVyID09PSAtMCB8fCBudW1iZXIgPT09ICtJbmZpbml0eSB8fCBudW1iZXIgPT09IC1JbmZpbml0eSkgcmV0dXJuIG51bWJlcjtcbiAgICBpZiAobnVtYmVyIDwgMCkgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5hYnMobnVtYmVyKSkgKiAtMTtcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLmFicyhudW1iZXIpKTtcbn1cblxuZnVuY3Rpb24gdG9MZW5ndGgoYXJnKSB7XG4gICAgdmFyIGxlbiA9IHRvSW50ZWdlcihhcmcpO1xuICAgIGlmIChsZW4gPD0gMCkgcmV0dXJuIDA7XG4gICAgaWYgKGxlbiA9PT0gSW5maW5pdHkpIHJldHVybiBNYXRoLnBvdygyLCA1MykgLSAxO1xuICAgIHJldHVybiBNYXRoLm1pbihsZW4sIE1hdGgucG93KDIsIDUzKSAtIDEpO1xufVxuXG4vKipcbiAqIFJldHVybnMgXCJpbnRlcm5hbFwiIHByb3BlcnRpZXMgZm9yIGFuIG9iamVjdFxuICovXG5mdW5jdGlvbiBnZXRJbnRlcm5hbFByb3BlcnRpZXMob2JqKSB7XG4gICAgaWYgKGhvcC5jYWxsKG9iaiwgJ19fZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzJykpIHJldHVybiBvYmouX19nZXRJbnRlcm5hbFByb3BlcnRpZXMoc2VjcmV0KTtcblxuICAgIHJldHVybiBvYmpDcmVhdGUobnVsbCk7XG59XG5cbi8qKlxuKiBEZWZpbmVzIHJlZ3VsYXIgZXhwcmVzc2lvbnMgZm9yIHZhcmlvdXMgb3BlcmF0aW9ucyByZWxhdGVkIHRvIHRoZSBCQ1AgNDcgc3ludGF4LFxuKiBhcyBkZWZpbmVkIGF0IGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2JjcDQ3I3NlY3Rpb24tMi4xXG4qL1xuXG4vLyBleHRsYW5nICAgICAgID0gM0FMUEhBICAgICAgICAgICAgICA7IHNlbGVjdGVkIElTTyA2MzkgY29kZXNcbi8vICAgICAgICAgICAgICAgICAqMihcIi1cIiAzQUxQSEEpICAgICAgOyBwZXJtYW5lbnRseSByZXNlcnZlZFxudmFyIGV4dGxhbmcgPSAnW2Etel17M30oPzotW2Etel17M30pezAsMn0nO1xuXG4vLyBsYW5ndWFnZSAgICAgID0gMiozQUxQSEEgICAgICAgICAgICA7IHNob3J0ZXN0IElTTyA2MzkgY29kZVxuLy8gICAgICAgICAgICAgICAgIFtcIi1cIiBleHRsYW5nXSAgICAgICA7IHNvbWV0aW1lcyBmb2xsb3dlZCBieVxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOyBleHRlbmRlZCBsYW5ndWFnZSBzdWJ0YWdzXG4vLyAgICAgICAgICAgICAgIC8gNEFMUEhBICAgICAgICAgICAgICA7IG9yIHJlc2VydmVkIGZvciBmdXR1cmUgdXNlXG4vLyAgICAgICAgICAgICAgIC8gNSo4QUxQSEEgICAgICAgICAgICA7IG9yIHJlZ2lzdGVyZWQgbGFuZ3VhZ2Ugc3VidGFnXG52YXIgbGFuZ3VhZ2UgPSAnKD86W2Etel17MiwzfSg/Oi0nICsgZXh0bGFuZyArICcpP3xbYS16XXs0fXxbYS16XXs1LDh9KSc7XG5cbi8vIHNjcmlwdCAgICAgICAgPSA0QUxQSEEgICAgICAgICAgICAgIDsgSVNPIDE1OTI0IGNvZGVcbnZhciBzY3JpcHQgPSAnW2Etel17NH0nO1xuXG4vLyByZWdpb24gICAgICAgID0gMkFMUEhBICAgICAgICAgICAgICA7IElTTyAzMTY2LTEgY29kZVxuLy8gICAgICAgICAgICAgICAvIDNESUdJVCAgICAgICAgICAgICAgOyBVTiBNLjQ5IGNvZGVcbnZhciByZWdpb24gPSAnKD86W2Etel17Mn18XFxcXGR7M30pJztcblxuLy8gdmFyaWFudCAgICAgICA9IDUqOGFscGhhbnVtICAgICAgICAgOyByZWdpc3RlcmVkIHZhcmlhbnRzXG4vLyAgICAgICAgICAgICAgIC8gKERJR0lUIDNhbHBoYW51bSlcbnZhciB2YXJpYW50ID0gJyg/OlthLXowLTldezUsOH18XFxcXGRbYS16MC05XXszfSknO1xuXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7IFNpbmdsZSBhbHBoYW51bWVyaWNzXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA7IFwieFwiIHJlc2VydmVkIGZvciBwcml2YXRlIHVzZVxuLy8gc2luZ2xldG9uICAgICA9IERJR0lUICAgICAgICAgICAgICAgOyAwIC0gOVxuLy8gICAgICAgICAgICAgICAvICV4NDEtNTcgICAgICAgICAgICAgOyBBIC0gV1xuLy8gICAgICAgICAgICAgICAvICV4NTktNUEgICAgICAgICAgICAgOyBZIC0gWlxuLy8gICAgICAgICAgICAgICAvICV4NjEtNzcgICAgICAgICAgICAgOyBhIC0gd1xuLy8gICAgICAgICAgICAgICAvICV4NzktN0EgICAgICAgICAgICAgOyB5IC0gelxudmFyIHNpbmdsZXRvbiA9ICdbMC05YS13eS16XSc7XG5cbi8vIGV4dGVuc2lvbiAgICAgPSBzaW5nbGV0b24gMSooXCItXCIgKDIqOGFscGhhbnVtKSlcbnZhciBleHRlbnNpb24gPSBzaW5nbGV0b24gKyAnKD86LVthLXowLTldezIsOH0pKyc7XG5cbi8vIHByaXZhdGV1c2UgICAgPSBcInhcIiAxKihcIi1cIiAoMSo4YWxwaGFudW0pKVxudmFyIHByaXZhdGV1c2UgPSAneCg/Oi1bYS16MC05XXsxLDh9KSsnO1xuXG4vLyBpcnJlZ3VsYXIgICAgID0gXCJlbi1HQi1vZWRcIiAgICAgICAgIDsgaXJyZWd1bGFyIHRhZ3MgZG8gbm90IG1hdGNoXG4vLyAgICAgICAgICAgICAgIC8gXCJpLWFtaVwiICAgICAgICAgICAgIDsgdGhlICdsYW5ndGFnJyBwcm9kdWN0aW9uIGFuZFxuLy8gICAgICAgICAgICAgICAvIFwiaS1ibm5cIiAgICAgICAgICAgICA7IHdvdWxkIG5vdCBvdGhlcndpc2UgYmVcbi8vICAgICAgICAgICAgICAgLyBcImktZGVmYXVsdFwiICAgICAgICAgOyBjb25zaWRlcmVkICd3ZWxsLWZvcm1lZCdcbi8vICAgICAgICAgICAgICAgLyBcImktZW5vY2hpYW5cIiAgICAgICAgOyBUaGVzZSB0YWdzIGFyZSBhbGwgdmFsaWQsXG4vLyAgICAgICAgICAgICAgIC8gXCJpLWhha1wiICAgICAgICAgICAgIDsgYnV0IG1vc3QgYXJlIGRlcHJlY2F0ZWRcbi8vICAgICAgICAgICAgICAgLyBcImkta2xpbmdvblwiICAgICAgICAgOyBpbiBmYXZvciBvZiBtb3JlIG1vZGVyblxuLy8gICAgICAgICAgICAgICAvIFwiaS1sdXhcIiAgICAgICAgICAgICA7IHN1YnRhZ3Mgb3Igc3VidGFnXG4vLyAgICAgICAgICAgICAgIC8gXCJpLW1pbmdvXCIgICAgICAgICAgIDsgY29tYmluYXRpb25cbi8vICAgICAgICAgICAgICAgLyBcImktbmF2YWpvXCJcbi8vICAgICAgICAgICAgICAgLyBcImktcHduXCJcbi8vICAgICAgICAgICAgICAgLyBcImktdGFvXCJcbi8vICAgICAgICAgICAgICAgLyBcImktdGF5XCJcbi8vICAgICAgICAgICAgICAgLyBcImktdHN1XCJcbi8vICAgICAgICAgICAgICAgLyBcInNnbi1CRS1GUlwiXG4vLyAgICAgICAgICAgICAgIC8gXCJzZ24tQkUtTkxcIlxuLy8gICAgICAgICAgICAgICAvIFwic2duLUNILURFXCJcbnZhciBpcnJlZ3VsYXIgPSAnKD86ZW4tR0Itb2VkJyArICd8aS0oPzphbWl8Ym5ufGRlZmF1bHR8ZW5vY2hpYW58aGFrfGtsaW5nb258bHV4fG1pbmdvfG5hdmFqb3xwd258dGFvfHRheXx0c3UpJyArICd8c2duLSg/OkJFLUZSfEJFLU5MfENILURFKSknO1xuXG4vLyByZWd1bGFyICAgICAgID0gXCJhcnQtbG9qYmFuXCIgICAgICAgIDsgdGhlc2UgdGFncyBtYXRjaCB0aGUgJ2xhbmd0YWcnXG4vLyAgICAgICAgICAgICAgIC8gXCJjZWwtZ2F1bGlzaFwiICAgICAgIDsgcHJvZHVjdGlvbiwgYnV0IHRoZWlyIHN1YnRhZ3Ncbi8vICAgICAgICAgICAgICAgLyBcIm5vLWJva1wiICAgICAgICAgICAgOyBhcmUgbm90IGV4dGVuZGVkIGxhbmd1YWdlXG4vLyAgICAgICAgICAgICAgIC8gXCJuby1ueW5cIiAgICAgICAgICAgIDsgb3IgdmFyaWFudCBzdWJ0YWdzOiB0aGVpciBtZWFuaW5nXG4vLyAgICAgICAgICAgICAgIC8gXCJ6aC1ndW95dVwiICAgICAgICAgIDsgaXMgZGVmaW5lZCBieSB0aGVpciByZWdpc3RyYXRpb25cbi8vICAgICAgICAgICAgICAgLyBcInpoLWhha2thXCIgICAgICAgICAgOyBhbmQgYWxsIG9mIHRoZXNlIGFyZSBkZXByZWNhdGVkXG4vLyAgICAgICAgICAgICAgIC8gXCJ6aC1taW5cIiAgICAgICAgICAgIDsgaW4gZmF2b3Igb2YgYSBtb3JlIG1vZGVyblxuLy8gICAgICAgICAgICAgICAvIFwiemgtbWluLW5hblwiICAgICAgICA7IHN1YnRhZyBvciBzZXF1ZW5jZSBvZiBzdWJ0YWdzXG4vLyAgICAgICAgICAgICAgIC8gXCJ6aC14aWFuZ1wiXG52YXIgcmVndWxhciA9ICcoPzphcnQtbG9qYmFufGNlbC1nYXVsaXNofG5vLWJva3xuby1ueW4nICsgJ3x6aC0oPzpndW95dXxoYWtrYXxtaW58bWluLW5hbnx4aWFuZykpJztcblxuLy8gZ3JhbmRmYXRoZXJlZCA9IGlycmVndWxhciAgICAgICAgICAgOyBub24tcmVkdW5kYW50IHRhZ3MgcmVnaXN0ZXJlZFxuLy8gICAgICAgICAgICAgICAvIHJlZ3VsYXIgICAgICAgICAgICAgOyBkdXJpbmcgdGhlIFJGQyAzMDY2IGVyYVxudmFyIGdyYW5kZmF0aGVyZWQgPSAnKD86JyArIGlycmVndWxhciArICd8JyArIHJlZ3VsYXIgKyAnKSc7XG5cbi8vIGxhbmd0YWcgICAgICAgPSBsYW5ndWFnZVxuLy8gICAgICAgICAgICAgICAgIFtcIi1cIiBzY3JpcHRdXG4vLyAgICAgICAgICAgICAgICAgW1wiLVwiIHJlZ2lvbl1cbi8vICAgICAgICAgICAgICAgICAqKFwiLVwiIHZhcmlhbnQpXG4vLyAgICAgICAgICAgICAgICAgKihcIi1cIiBleHRlbnNpb24pXG4vLyAgICAgICAgICAgICAgICAgW1wiLVwiIHByaXZhdGV1c2VdXG52YXIgbGFuZ3RhZyA9IGxhbmd1YWdlICsgJyg/Oi0nICsgc2NyaXB0ICsgJyk/KD86LScgKyByZWdpb24gKyAnKT8oPzotJyArIHZhcmlhbnQgKyAnKSooPzotJyArIGV4dGVuc2lvbiArICcpKig/Oi0nICsgcHJpdmF0ZXVzZSArICcpPyc7XG5cbi8vIExhbmd1YWdlLVRhZyAgPSBsYW5ndGFnICAgICAgICAgICAgIDsgbm9ybWFsIGxhbmd1YWdlIHRhZ3Ncbi8vICAgICAgICAgICAgICAgLyBwcml2YXRldXNlICAgICAgICAgIDsgcHJpdmF0ZSB1c2UgdGFnXG4vLyAgICAgICAgICAgICAgIC8gZ3JhbmRmYXRoZXJlZCAgICAgICA7IGdyYW5kZmF0aGVyZWQgdGFnc1xudmFyIGV4cEJDUDQ3U3ludGF4ID0gUmVnRXhwKCdeKD86JyArIGxhbmd0YWcgKyAnfCcgKyBwcml2YXRldXNlICsgJ3wnICsgZ3JhbmRmYXRoZXJlZCArICcpJCcsICdpJyk7XG5cbi8vIE1hdGNoIGR1cGxpY2F0ZSB2YXJpYW50cyBpbiBhIGxhbmd1YWdlIHRhZ1xudmFyIGV4cFZhcmlhbnREdXBlcyA9IFJlZ0V4cCgnXig/IXgpLio/LSgnICsgdmFyaWFudCArICcpLSg/OlxcXFx3ezQsOH0tKD8heC0pKSpcXFxcMVxcXFxiJywgJ2knKTtcblxuLy8gTWF0Y2ggZHVwbGljYXRlIHNpbmdsZXRvbnMgaW4gYSBsYW5ndWFnZSB0YWcgKGV4Y2VwdCBpbiBwcml2YXRlIHVzZSlcbnZhciBleHBTaW5nbGV0b25EdXBlcyA9IFJlZ0V4cCgnXig/IXgpLio/LSgnICsgc2luZ2xldG9uICsgJyktKD86XFxcXHcrLSg/IXgtKSkqXFxcXDFcXFxcYicsICdpJyk7XG5cbi8vIE1hdGNoIGFsbCBleHRlbnNpb24gc2VxdWVuY2VzXG52YXIgZXhwRXh0U2VxdWVuY2VzID0gUmVnRXhwKCctJyArIGV4dGVuc2lvbiwgJ2lnJyk7XG5cbi8vIERlZmF1bHQgbG9jYWxlIGlzIHRoZSBmaXJzdC1hZGRlZCBsb2NhbGUgZGF0YSBmb3IgdXNcbnZhciBkZWZhdWx0TG9jYWxlID0gdm9pZCAwO1xuZnVuY3Rpb24gc2V0RGVmYXVsdExvY2FsZShsb2NhbGUpIHtcbiAgICBkZWZhdWx0TG9jYWxlID0gbG9jYWxlO1xufVxuXG4vLyBJQU5BIFN1YnRhZyBSZWdpc3RyeSByZWR1bmRhbnQgdGFnIGFuZCBzdWJ0YWcgbWFwc1xudmFyIHJlZHVuZGFudFRhZ3MgPSB7XG4gICAgdGFnczoge1xuICAgICAgICBcImFydC1sb2piYW5cIjogXCJqYm9cIixcbiAgICAgICAgXCJpLWFtaVwiOiBcImFtaVwiLFxuICAgICAgICBcImktYm5uXCI6IFwiYm5uXCIsXG4gICAgICAgIFwiaS1oYWtcIjogXCJoYWtcIixcbiAgICAgICAgXCJpLWtsaW5nb25cIjogXCJ0bGhcIixcbiAgICAgICAgXCJpLWx1eFwiOiBcImxiXCIsXG4gICAgICAgIFwiaS1uYXZham9cIjogXCJudlwiLFxuICAgICAgICBcImktcHduXCI6IFwicHduXCIsXG4gICAgICAgIFwiaS10YW9cIjogXCJ0YW9cIixcbiAgICAgICAgXCJpLXRheVwiOiBcInRheVwiLFxuICAgICAgICBcImktdHN1XCI6IFwidHN1XCIsXG4gICAgICAgIFwibm8tYm9rXCI6IFwibmJcIixcbiAgICAgICAgXCJuby1ueW5cIjogXCJublwiLFxuICAgICAgICBcInNnbi1CRS1GUlwiOiBcInNmYlwiLFxuICAgICAgICBcInNnbi1CRS1OTFwiOiBcInZndFwiLFxuICAgICAgICBcInNnbi1DSC1ERVwiOiBcInNnZ1wiLFxuICAgICAgICBcInpoLWd1b3l1XCI6IFwiY21uXCIsXG4gICAgICAgIFwiemgtaGFra2FcIjogXCJoYWtcIixcbiAgICAgICAgXCJ6aC1taW4tbmFuXCI6IFwibmFuXCIsXG4gICAgICAgIFwiemgteGlhbmdcIjogXCJoc25cIixcbiAgICAgICAgXCJzZ24tQlJcIjogXCJienNcIixcbiAgICAgICAgXCJzZ24tQ09cIjogXCJjc25cIixcbiAgICAgICAgXCJzZ24tREVcIjogXCJnc2dcIixcbiAgICAgICAgXCJzZ24tREtcIjogXCJkc2xcIixcbiAgICAgICAgXCJzZ24tRVNcIjogXCJzc3BcIixcbiAgICAgICAgXCJzZ24tRlJcIjogXCJmc2xcIixcbiAgICAgICAgXCJzZ24tR0JcIjogXCJiZmlcIixcbiAgICAgICAgXCJzZ24tR1JcIjogXCJnc3NcIixcbiAgICAgICAgXCJzZ24tSUVcIjogXCJpc2dcIixcbiAgICAgICAgXCJzZ24tSVRcIjogXCJpc2VcIixcbiAgICAgICAgXCJzZ24tSlBcIjogXCJqc2xcIixcbiAgICAgICAgXCJzZ24tTVhcIjogXCJtZnNcIixcbiAgICAgICAgXCJzZ24tTklcIjogXCJuY3NcIixcbiAgICAgICAgXCJzZ24tTkxcIjogXCJkc2VcIixcbiAgICAgICAgXCJzZ24tTk9cIjogXCJuc2xcIixcbiAgICAgICAgXCJzZ24tUFRcIjogXCJwc3JcIixcbiAgICAgICAgXCJzZ24tU0VcIjogXCJzd2xcIixcbiAgICAgICAgXCJzZ24tVVNcIjogXCJhc2VcIixcbiAgICAgICAgXCJzZ24tWkFcIjogXCJzZnNcIixcbiAgICAgICAgXCJ6aC1jbW5cIjogXCJjbW5cIixcbiAgICAgICAgXCJ6aC1jbW4tSGFuc1wiOiBcImNtbi1IYW5zXCIsXG4gICAgICAgIFwiemgtY21uLUhhbnRcIjogXCJjbW4tSGFudFwiLFxuICAgICAgICBcInpoLWdhblwiOiBcImdhblwiLFxuICAgICAgICBcInpoLXd1dVwiOiBcInd1dVwiLFxuICAgICAgICBcInpoLXl1ZVwiOiBcInl1ZVwiXG4gICAgfSxcbiAgICBzdWJ0YWdzOiB7XG4gICAgICAgIEJVOiBcIk1NXCIsXG4gICAgICAgIEREOiBcIkRFXCIsXG4gICAgICAgIEZYOiBcIkZSXCIsXG4gICAgICAgIFRQOiBcIlRMXCIsXG4gICAgICAgIFlEOiBcIllFXCIsXG4gICAgICAgIFpSOiBcIkNEXCIsXG4gICAgICAgIGhlcGxvYzogXCJhbGFsYzk3XCIsXG4gICAgICAgICdpbic6IFwiaWRcIixcbiAgICAgICAgaXc6IFwiaGVcIixcbiAgICAgICAgamk6IFwieWlcIixcbiAgICAgICAganc6IFwianZcIixcbiAgICAgICAgbW86IFwicm9cIixcbiAgICAgICAgYXl4OiBcIm51blwiLFxuICAgICAgICBiamQ6IFwiZHJsXCIsXG4gICAgICAgIGNjcTogXCJya2lcIixcbiAgICAgICAgY2pyOiBcIm1vbVwiLFxuICAgICAgICBja2E6IFwiY21yXCIsXG4gICAgICAgIGNtazogXCJ4Y2hcIixcbiAgICAgICAgZHJoOiBcImtoa1wiLFxuICAgICAgICBkcnc6IFwicHJzXCIsXG4gICAgICAgIGdhdjogXCJkZXZcIixcbiAgICAgICAgaHJyOiBcImphbFwiLFxuICAgICAgICBpYmk6IFwib3BhXCIsXG4gICAgICAgIGtnaDogXCJrbWxcIixcbiAgICAgICAgbGNxOiBcInBwclwiLFxuICAgICAgICBtc3Q6IFwibXJ5XCIsXG4gICAgICAgIG15dDogXCJtcnlcIixcbiAgICAgICAgc2NhOiBcImhsZVwiLFxuICAgICAgICB0aWU6IFwicmFzXCIsXG4gICAgICAgIHRrazogXCJ0d21cIixcbiAgICAgICAgdGx3OiBcIndlb1wiLFxuICAgICAgICB0bmY6IFwicHJzXCIsXG4gICAgICAgIHliZDogXCJya2lcIixcbiAgICAgICAgeW1hOiBcImxyclwiXG4gICAgfSxcbiAgICBleHRMYW5nOiB7XG4gICAgICAgIGFhbzogW1wiYWFvXCIsIFwiYXJcIl0sXG4gICAgICAgIGFiaDogW1wiYWJoXCIsIFwiYXJcIl0sXG4gICAgICAgIGFidjogW1wiYWJ2XCIsIFwiYXJcIl0sXG4gICAgICAgIGFjbTogW1wiYWNtXCIsIFwiYXJcIl0sXG4gICAgICAgIGFjcTogW1wiYWNxXCIsIFwiYXJcIl0sXG4gICAgICAgIGFjdzogW1wiYWN3XCIsIFwiYXJcIl0sXG4gICAgICAgIGFjeDogW1wiYWN4XCIsIFwiYXJcIl0sXG4gICAgICAgIGFjeTogW1wiYWN5XCIsIFwiYXJcIl0sXG4gICAgICAgIGFkZjogW1wiYWRmXCIsIFwiYXJcIl0sXG4gICAgICAgIGFkczogW1wiYWRzXCIsIFwic2duXCJdLFxuICAgICAgICBhZWI6IFtcImFlYlwiLCBcImFyXCJdLFxuICAgICAgICBhZWM6IFtcImFlY1wiLCBcImFyXCJdLFxuICAgICAgICBhZWQ6IFtcImFlZFwiLCBcInNnblwiXSxcbiAgICAgICAgYWVuOiBbXCJhZW5cIiwgXCJzZ25cIl0sXG4gICAgICAgIGFmYjogW1wiYWZiXCIsIFwiYXJcIl0sXG4gICAgICAgIGFmZzogW1wiYWZnXCIsIFwic2duXCJdLFxuICAgICAgICBhanA6IFtcImFqcFwiLCBcImFyXCJdLFxuICAgICAgICBhcGM6IFtcImFwY1wiLCBcImFyXCJdLFxuICAgICAgICBhcGQ6IFtcImFwZFwiLCBcImFyXCJdLFxuICAgICAgICBhcmI6IFtcImFyYlwiLCBcImFyXCJdLFxuICAgICAgICBhcnE6IFtcImFycVwiLCBcImFyXCJdLFxuICAgICAgICBhcnM6IFtcImFyc1wiLCBcImFyXCJdLFxuICAgICAgICBhcnk6IFtcImFyeVwiLCBcImFyXCJdLFxuICAgICAgICBhcno6IFtcImFyelwiLCBcImFyXCJdLFxuICAgICAgICBhc2U6IFtcImFzZVwiLCBcInNnblwiXSxcbiAgICAgICAgYXNmOiBbXCJhc2ZcIiwgXCJzZ25cIl0sXG4gICAgICAgIGFzcDogW1wiYXNwXCIsIFwic2duXCJdLFxuICAgICAgICBhc3E6IFtcImFzcVwiLCBcInNnblwiXSxcbiAgICAgICAgYXN3OiBbXCJhc3dcIiwgXCJzZ25cIl0sXG4gICAgICAgIGF1ejogW1wiYXV6XCIsIFwiYXJcIl0sXG4gICAgICAgIGF2bDogW1wiYXZsXCIsIFwiYXJcIl0sXG4gICAgICAgIGF5aDogW1wiYXloXCIsIFwiYXJcIl0sXG4gICAgICAgIGF5bDogW1wiYXlsXCIsIFwiYXJcIl0sXG4gICAgICAgIGF5bjogW1wiYXluXCIsIFwiYXJcIl0sXG4gICAgICAgIGF5cDogW1wiYXlwXCIsIFwiYXJcIl0sXG4gICAgICAgIGJiejogW1wiYmJ6XCIsIFwiYXJcIl0sXG4gICAgICAgIGJmaTogW1wiYmZpXCIsIFwic2duXCJdLFxuICAgICAgICBiZms6IFtcImJma1wiLCBcInNnblwiXSxcbiAgICAgICAgYmpuOiBbXCJiam5cIiwgXCJtc1wiXSxcbiAgICAgICAgYm9nOiBbXCJib2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIGJxbjogW1wiYnFuXCIsIFwic2duXCJdLFxuICAgICAgICBicXk6IFtcImJxeVwiLCBcInNnblwiXSxcbiAgICAgICAgYnRqOiBbXCJidGpcIiwgXCJtc1wiXSxcbiAgICAgICAgYnZlOiBbXCJidmVcIiwgXCJtc1wiXSxcbiAgICAgICAgYnZsOiBbXCJidmxcIiwgXCJzZ25cIl0sXG4gICAgICAgIGJ2dTogW1wiYnZ1XCIsIFwibXNcIl0sXG4gICAgICAgIGJ6czogW1wiYnpzXCIsIFwic2duXCJdLFxuICAgICAgICBjZG86IFtcImNkb1wiLCBcInpoXCJdLFxuICAgICAgICBjZHM6IFtcImNkc1wiLCBcInNnblwiXSxcbiAgICAgICAgY2p5OiBbXCJjanlcIiwgXCJ6aFwiXSxcbiAgICAgICAgY21uOiBbXCJjbW5cIiwgXCJ6aFwiXSxcbiAgICAgICAgY29hOiBbXCJjb2FcIiwgXCJtc1wiXSxcbiAgICAgICAgY3B4OiBbXCJjcHhcIiwgXCJ6aFwiXSxcbiAgICAgICAgY3NjOiBbXCJjc2NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGNzZDogW1wiY3NkXCIsIFwic2duXCJdLFxuICAgICAgICBjc2U6IFtcImNzZVwiLCBcInNnblwiXSxcbiAgICAgICAgY3NmOiBbXCJjc2ZcIiwgXCJzZ25cIl0sXG4gICAgICAgIGNzZzogW1wiY3NnXCIsIFwic2duXCJdLFxuICAgICAgICBjc2w6IFtcImNzbFwiLCBcInNnblwiXSxcbiAgICAgICAgY3NuOiBbXCJjc25cIiwgXCJzZ25cIl0sXG4gICAgICAgIGNzcTogW1wiY3NxXCIsIFwic2duXCJdLFxuICAgICAgICBjc3I6IFtcImNzclwiLCBcInNnblwiXSxcbiAgICAgICAgY3poOiBbXCJjemhcIiwgXCJ6aFwiXSxcbiAgICAgICAgY3pvOiBbXCJjem9cIiwgXCJ6aFwiXSxcbiAgICAgICAgZG9xOiBbXCJkb3FcIiwgXCJzZ25cIl0sXG4gICAgICAgIGRzZTogW1wiZHNlXCIsIFwic2duXCJdLFxuICAgICAgICBkc2w6IFtcImRzbFwiLCBcInNnblwiXSxcbiAgICAgICAgZHVwOiBbXCJkdXBcIiwgXCJtc1wiXSxcbiAgICAgICAgZWNzOiBbXCJlY3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIGVzbDogW1wiZXNsXCIsIFwic2duXCJdLFxuICAgICAgICBlc246IFtcImVzblwiLCBcInNnblwiXSxcbiAgICAgICAgZXNvOiBbXCJlc29cIiwgXCJzZ25cIl0sXG4gICAgICAgIGV0aDogW1wiZXRoXCIsIFwic2duXCJdLFxuICAgICAgICBmY3M6IFtcImZjc1wiLCBcInNnblwiXSxcbiAgICAgICAgZnNlOiBbXCJmc2VcIiwgXCJzZ25cIl0sXG4gICAgICAgIGZzbDogW1wiZnNsXCIsIFwic2duXCJdLFxuICAgICAgICBmc3M6IFtcImZzc1wiLCBcInNnblwiXSxcbiAgICAgICAgZ2FuOiBbXCJnYW5cIiwgXCJ6aFwiXSxcbiAgICAgICAgZ2RzOiBbXCJnZHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGdvbTogW1wiZ29tXCIsIFwia29rXCJdLFxuICAgICAgICBnc2U6IFtcImdzZVwiLCBcInNnblwiXSxcbiAgICAgICAgZ3NnOiBbXCJnc2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIGdzbTogW1wiZ3NtXCIsIFwic2duXCJdLFxuICAgICAgICBnc3M6IFtcImdzc1wiLCBcInNnblwiXSxcbiAgICAgICAgZ3VzOiBbXCJndXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhhYjogW1wiaGFiXCIsIFwic2duXCJdLFxuICAgICAgICBoYWY6IFtcImhhZlwiLCBcInNnblwiXSxcbiAgICAgICAgaGFrOiBbXCJoYWtcIiwgXCJ6aFwiXSxcbiAgICAgICAgaGRzOiBbXCJoZHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhqaTogW1wiaGppXCIsIFwibXNcIl0sXG4gICAgICAgIGhrczogW1wiaGtzXCIsIFwic2duXCJdLFxuICAgICAgICBob3M6IFtcImhvc1wiLCBcInNnblwiXSxcbiAgICAgICAgaHBzOiBbXCJocHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGhzaDogW1wiaHNoXCIsIFwic2duXCJdLFxuICAgICAgICBoc2w6IFtcImhzbFwiLCBcInNnblwiXSxcbiAgICAgICAgaHNuOiBbXCJoc25cIiwgXCJ6aFwiXSxcbiAgICAgICAgaWNsOiBbXCJpY2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIGlsczogW1wiaWxzXCIsIFwic2duXCJdLFxuICAgICAgICBpbmw6IFtcImlubFwiLCBcInNnblwiXSxcbiAgICAgICAgaW5zOiBbXCJpbnNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGlzZTogW1wiaXNlXCIsIFwic2duXCJdLFxuICAgICAgICBpc2c6IFtcImlzZ1wiLCBcInNnblwiXSxcbiAgICAgICAgaXNyOiBbXCJpc3JcIiwgXCJzZ25cIl0sXG4gICAgICAgIGphazogW1wiamFrXCIsIFwibXNcIl0sXG4gICAgICAgIGpheDogW1wiamF4XCIsIFwibXNcIl0sXG4gICAgICAgIGpjczogW1wiamNzXCIsIFwic2duXCJdLFxuICAgICAgICBqaHM6IFtcImpoc1wiLCBcInNnblwiXSxcbiAgICAgICAgamxzOiBbXCJqbHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGpvczogW1wiam9zXCIsIFwic2duXCJdLFxuICAgICAgICBqc2w6IFtcImpzbFwiLCBcInNnblwiXSxcbiAgICAgICAganVzOiBbXCJqdXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIGtnaTogW1wia2dpXCIsIFwic2duXCJdLFxuICAgICAgICBrbm46IFtcImtublwiLCBcImtva1wiXSxcbiAgICAgICAga3ZiOiBbXCJrdmJcIiwgXCJtc1wiXSxcbiAgICAgICAga3ZrOiBbXCJrdmtcIiwgXCJzZ25cIl0sXG4gICAgICAgIGt2cjogW1wia3ZyXCIsIFwibXNcIl0sXG4gICAgICAgIGt4ZDogW1wia3hkXCIsIFwibXNcIl0sXG4gICAgICAgIGxiczogW1wibGJzXCIsIFwic2duXCJdLFxuICAgICAgICBsY2U6IFtcImxjZVwiLCBcIm1zXCJdLFxuICAgICAgICBsY2Y6IFtcImxjZlwiLCBcIm1zXCJdLFxuICAgICAgICBsaXc6IFtcImxpd1wiLCBcIm1zXCJdLFxuICAgICAgICBsbHM6IFtcImxsc1wiLCBcInNnblwiXSxcbiAgICAgICAgbHNnOiBbXCJsc2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIGxzbDogW1wibHNsXCIsIFwic2duXCJdLFxuICAgICAgICBsc286IFtcImxzb1wiLCBcInNnblwiXSxcbiAgICAgICAgbHNwOiBbXCJsc3BcIiwgXCJzZ25cIl0sXG4gICAgICAgIGxzdDogW1wibHN0XCIsIFwic2duXCJdLFxuICAgICAgICBsc3k6IFtcImxzeVwiLCBcInNnblwiXSxcbiAgICAgICAgbHRnOiBbXCJsdGdcIiwgXCJsdlwiXSxcbiAgICAgICAgbHZzOiBbXCJsdnNcIiwgXCJsdlwiXSxcbiAgICAgICAgbHpoOiBbXCJsemhcIiwgXCJ6aFwiXSxcbiAgICAgICAgbWF4OiBbXCJtYXhcIiwgXCJtc1wiXSxcbiAgICAgICAgbWRsOiBbXCJtZGxcIiwgXCJzZ25cIl0sXG4gICAgICAgIG1lbzogW1wibWVvXCIsIFwibXNcIl0sXG4gICAgICAgIG1mYTogW1wibWZhXCIsIFwibXNcIl0sXG4gICAgICAgIG1mYjogW1wibWZiXCIsIFwibXNcIl0sXG4gICAgICAgIG1mczogW1wibWZzXCIsIFwic2duXCJdLFxuICAgICAgICBtaW46IFtcIm1pblwiLCBcIm1zXCJdLFxuICAgICAgICBtbnA6IFtcIm1ucFwiLCBcInpoXCJdLFxuICAgICAgICBtcWc6IFtcIm1xZ1wiLCBcIm1zXCJdLFxuICAgICAgICBtcmU6IFtcIm1yZVwiLCBcInNnblwiXSxcbiAgICAgICAgbXNkOiBbXCJtc2RcIiwgXCJzZ25cIl0sXG4gICAgICAgIG1zaTogW1wibXNpXCIsIFwibXNcIl0sXG4gICAgICAgIG1zcjogW1wibXNyXCIsIFwic2duXCJdLFxuICAgICAgICBtdWk6IFtcIm11aVwiLCBcIm1zXCJdLFxuICAgICAgICBtemM6IFtcIm16Y1wiLCBcInNnblwiXSxcbiAgICAgICAgbXpnOiBbXCJtemdcIiwgXCJzZ25cIl0sXG4gICAgICAgIG16eTogW1wibXp5XCIsIFwic2duXCJdLFxuICAgICAgICBuYW46IFtcIm5hblwiLCBcInpoXCJdLFxuICAgICAgICBuYnM6IFtcIm5ic1wiLCBcInNnblwiXSxcbiAgICAgICAgbmNzOiBbXCJuY3NcIiwgXCJzZ25cIl0sXG4gICAgICAgIG5zaTogW1wibnNpXCIsIFwic2duXCJdLFxuICAgICAgICBuc2w6IFtcIm5zbFwiLCBcInNnblwiXSxcbiAgICAgICAgbnNwOiBbXCJuc3BcIiwgXCJzZ25cIl0sXG4gICAgICAgIG5zcjogW1wibnNyXCIsIFwic2duXCJdLFxuICAgICAgICBuenM6IFtcIm56c1wiLCBcInNnblwiXSxcbiAgICAgICAgb2tsOiBbXCJva2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIG9ybjogW1wib3JuXCIsIFwibXNcIl0sXG4gICAgICAgIG9yczogW1wib3JzXCIsIFwibXNcIl0sXG4gICAgICAgIHBlbDogW1wicGVsXCIsIFwibXNcIl0sXG4gICAgICAgIHBnYTogW1wicGdhXCIsIFwiYXJcIl0sXG4gICAgICAgIHBrczogW1wicGtzXCIsIFwic2duXCJdLFxuICAgICAgICBwcmw6IFtcInBybFwiLCBcInNnblwiXSxcbiAgICAgICAgcHJ6OiBbXCJwcnpcIiwgXCJzZ25cIl0sXG4gICAgICAgIHBzYzogW1wicHNjXCIsIFwic2duXCJdLFxuICAgICAgICBwc2Q6IFtcInBzZFwiLCBcInNnblwiXSxcbiAgICAgICAgcHNlOiBbXCJwc2VcIiwgXCJtc1wiXSxcbiAgICAgICAgcHNnOiBbXCJwc2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIHBzbDogW1wicHNsXCIsIFwic2duXCJdLFxuICAgICAgICBwc286IFtcInBzb1wiLCBcInNnblwiXSxcbiAgICAgICAgcHNwOiBbXCJwc3BcIiwgXCJzZ25cIl0sXG4gICAgICAgIHBzcjogW1wicHNyXCIsIFwic2duXCJdLFxuICAgICAgICBweXM6IFtcInB5c1wiLCBcInNnblwiXSxcbiAgICAgICAgcm1zOiBbXCJybXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHJzaTogW1wicnNpXCIsIFwic2duXCJdLFxuICAgICAgICByc2w6IFtcInJzbFwiLCBcInNnblwiXSxcbiAgICAgICAgc2RsOiBbXCJzZGxcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNmYjogW1wic2ZiXCIsIFwic2duXCJdLFxuICAgICAgICBzZnM6IFtcInNmc1wiLCBcInNnblwiXSxcbiAgICAgICAgc2dnOiBbXCJzZ2dcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNneDogW1wic2d4XCIsIFwic2duXCJdLFxuICAgICAgICBzaHU6IFtcInNodVwiLCBcImFyXCJdLFxuICAgICAgICBzbGY6IFtcInNsZlwiLCBcInNnblwiXSxcbiAgICAgICAgc2xzOiBbXCJzbHNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNxazogW1wic3FrXCIsIFwic2duXCJdLFxuICAgICAgICBzcXM6IFtcInNxc1wiLCBcInNnblwiXSxcbiAgICAgICAgc3NoOiBbXCJzc2hcIiwgXCJhclwiXSxcbiAgICAgICAgc3NwOiBbXCJzc3BcIiwgXCJzZ25cIl0sXG4gICAgICAgIHNzcjogW1wic3NyXCIsIFwic2duXCJdLFxuICAgICAgICBzdms6IFtcInN2a1wiLCBcInNnblwiXSxcbiAgICAgICAgc3djOiBbXCJzd2NcIiwgXCJzd1wiXSxcbiAgICAgICAgc3doOiBbXCJzd2hcIiwgXCJzd1wiXSxcbiAgICAgICAgc3dsOiBbXCJzd2xcIiwgXCJzZ25cIl0sXG4gICAgICAgIHN5eTogW1wic3l5XCIsIFwic2duXCJdLFxuICAgICAgICB0bXc6IFtcInRtd1wiLCBcIm1zXCJdLFxuICAgICAgICB0c2U6IFtcInRzZVwiLCBcInNnblwiXSxcbiAgICAgICAgdHNtOiBbXCJ0c21cIiwgXCJzZ25cIl0sXG4gICAgICAgIHRzcTogW1widHNxXCIsIFwic2duXCJdLFxuICAgICAgICB0c3M6IFtcInRzc1wiLCBcInNnblwiXSxcbiAgICAgICAgdHN5OiBbXCJ0c3lcIiwgXCJzZ25cIl0sXG4gICAgICAgIHR6YTogW1widHphXCIsIFwic2duXCJdLFxuICAgICAgICB1Z246IFtcInVnblwiLCBcInNnblwiXSxcbiAgICAgICAgdWd5OiBbXCJ1Z3lcIiwgXCJzZ25cIl0sXG4gICAgICAgIHVrbDogW1widWtsXCIsIFwic2duXCJdLFxuICAgICAgICB1a3M6IFtcInVrc1wiLCBcInNnblwiXSxcbiAgICAgICAgdXJrOiBbXCJ1cmtcIiwgXCJtc1wiXSxcbiAgICAgICAgdXpuOiBbXCJ1em5cIiwgXCJ1elwiXSxcbiAgICAgICAgdXpzOiBbXCJ1enNcIiwgXCJ1elwiXSxcbiAgICAgICAgdmd0OiBbXCJ2Z3RcIiwgXCJzZ25cIl0sXG4gICAgICAgIHZrazogW1widmtrXCIsIFwibXNcIl0sXG4gICAgICAgIHZrdDogW1widmt0XCIsIFwibXNcIl0sXG4gICAgICAgIHZzaTogW1widnNpXCIsIFwic2duXCJdLFxuICAgICAgICB2c2w6IFtcInZzbFwiLCBcInNnblwiXSxcbiAgICAgICAgdnN2OiBbXCJ2c3ZcIiwgXCJzZ25cIl0sXG4gICAgICAgIHd1dTogW1wid3V1XCIsIFwiemhcIl0sXG4gICAgICAgIHhraTogW1wieGtpXCIsIFwic2duXCJdLFxuICAgICAgICB4bWw6IFtcInhtbFwiLCBcInNnblwiXSxcbiAgICAgICAgeG1tOiBbXCJ4bW1cIiwgXCJtc1wiXSxcbiAgICAgICAgeG1zOiBbXCJ4bXNcIiwgXCJzZ25cIl0sXG4gICAgICAgIHlkczogW1wieWRzXCIsIFwic2duXCJdLFxuICAgICAgICB5c2w6IFtcInlzbFwiLCBcInNnblwiXSxcbiAgICAgICAgeXVlOiBbXCJ5dWVcIiwgXCJ6aFwiXSxcbiAgICAgICAgemliOiBbXCJ6aWJcIiwgXCJzZ25cIl0sXG4gICAgICAgIHpsbTogW1wiemxtXCIsIFwibXNcIl0sXG4gICAgICAgIHptaTogW1wiem1pXCIsIFwibXNcIl0sXG4gICAgICAgIHpzbDogW1wienNsXCIsIFwic2duXCJdLFxuICAgICAgICB6c206IFtcInpzbVwiLCBcIm1zXCJdXG4gICAgfVxufTtcblxuLyoqXG4gKiBDb252ZXJ0IG9ubHkgYS16IHRvIHVwcGVyY2FzZSBhcyBwZXIgc2VjdGlvbiA2LjEgb2YgdGhlIHNwZWNcbiAqL1xuZnVuY3Rpb24gdG9MYXRpblVwcGVyQ2FzZShzdHIpIHtcbiAgICB2YXIgaSA9IHN0ci5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIHZhciBjaCA9IHN0ci5jaGFyQXQoaSk7XG5cbiAgICAgICAgaWYgKGNoID49IFwiYVwiICYmIGNoIDw9IFwielwiKSBzdHIgPSBzdHIuc2xpY2UoMCwgaSkgKyBjaC50b1VwcGVyQ2FzZSgpICsgc3RyLnNsaWNlKGkgKyAxKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyO1xufVxuXG4vKipcbiAqIFRoZSBJc1N0cnVjdHVyYWxseVZhbGlkTGFuZ3VhZ2VUYWcgYWJzdHJhY3Qgb3BlcmF0aW9uIHZlcmlmaWVzIHRoYXQgdGhlIGxvY2FsZVxuICogYXJndW1lbnQgKHdoaWNoIG11c3QgYmUgYSBTdHJpbmcgdmFsdWUpXG4gKlxuICogLSByZXByZXNlbnRzIGEgd2VsbC1mb3JtZWQgQkNQIDQ3IGxhbmd1YWdlIHRhZyBhcyBzcGVjaWZpZWQgaW4gUkZDIDU2NDYgc2VjdGlvblxuICogICAyLjEsIG9yIHN1Y2Nlc3NvcixcbiAqIC0gZG9lcyBub3QgaW5jbHVkZSBkdXBsaWNhdGUgdmFyaWFudCBzdWJ0YWdzLCBhbmRcbiAqIC0gZG9lcyBub3QgaW5jbHVkZSBkdXBsaWNhdGUgc2luZ2xldG9uIHN1YnRhZ3MuXG4gKlxuICogVGhlIGFic3RyYWN0IG9wZXJhdGlvbiByZXR1cm5zIHRydWUgaWYgbG9jYWxlIGNhbiBiZSBnZW5lcmF0ZWQgZnJvbSB0aGUgQUJORlxuICogZ3JhbW1hciBpbiBzZWN0aW9uIDIuMSBvZiB0aGUgUkZDLCBzdGFydGluZyB3aXRoIExhbmd1YWdlLVRhZywgYW5kIGRvZXMgbm90XG4gKiBjb250YWluIGR1cGxpY2F0ZSB2YXJpYW50IG9yIHNpbmdsZXRvbiBzdWJ0YWdzIChvdGhlciB0aGFuIGFzIGEgcHJpdmF0ZSB1c2VcbiAqIHN1YnRhZykuIEl0IHJldHVybnMgZmFsc2Ugb3RoZXJ3aXNlLiBUZXJtaW5hbCB2YWx1ZSBjaGFyYWN0ZXJzIGluIHRoZSBncmFtbWFyIGFyZVxuICogaW50ZXJwcmV0ZWQgYXMgdGhlIFVuaWNvZGUgZXF1aXZhbGVudHMgb2YgdGhlIEFTQ0lJIG9jdGV0IHZhbHVlcyBnaXZlbi5cbiAqL1xuZnVuY3Rpb24gLyogNi4yLjIgKi9Jc1N0cnVjdHVyYWxseVZhbGlkTGFuZ3VhZ2VUYWcobG9jYWxlKSB7XG4gICAgLy8gcmVwcmVzZW50cyBhIHdlbGwtZm9ybWVkIEJDUCA0NyBsYW5ndWFnZSB0YWcgYXMgc3BlY2lmaWVkIGluIFJGQyA1NjQ2XG4gICAgaWYgKCFleHBCQ1A0N1N5bnRheC50ZXN0KGxvY2FsZSkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvZXMgbm90IGluY2x1ZGUgZHVwbGljYXRlIHZhcmlhbnQgc3VidGFncywgYW5kXG4gICAgaWYgKGV4cFZhcmlhbnREdXBlcy50ZXN0KGxvY2FsZSkpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIGRvZXMgbm90IGluY2x1ZGUgZHVwbGljYXRlIHNpbmdsZXRvbiBzdWJ0YWdzLlxuICAgIGlmIChleHBTaW5nbGV0b25EdXBlcy50ZXN0KGxvY2FsZSkpIHJldHVybiBmYWxzZTtcblxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIFRoZSBDYW5vbmljYWxpemVMYW5ndWFnZVRhZyBhYnN0cmFjdCBvcGVyYXRpb24gcmV0dXJucyB0aGUgY2Fub25pY2FsIGFuZCBjYXNlLVxuICogcmVndWxhcml6ZWQgZm9ybSBvZiB0aGUgbG9jYWxlIGFyZ3VtZW50ICh3aGljaCBtdXN0IGJlIGEgU3RyaW5nIHZhbHVlIHRoYXQgaXNcbiAqIGEgc3RydWN0dXJhbGx5IHZhbGlkIEJDUCA0NyBsYW5ndWFnZSB0YWcgYXMgdmVyaWZpZWQgYnkgdGhlXG4gKiBJc1N0cnVjdHVyYWxseVZhbGlkTGFuZ3VhZ2VUYWcgYWJzdHJhY3Qgb3BlcmF0aW9uKS4gSXQgdGFrZXMgdGhlIHN0ZXBzXG4gKiBzcGVjaWZpZWQgaW4gUkZDIDU2NDYgc2VjdGlvbiA0LjUsIG9yIHN1Y2Nlc3NvciwgdG8gYnJpbmcgdGhlIGxhbmd1YWdlIHRhZ1xuICogaW50byBjYW5vbmljYWwgZm9ybSwgYW5kIHRvIHJlZ3VsYXJpemUgdGhlIGNhc2Ugb2YgdGhlIHN1YnRhZ3MsIGJ1dCBkb2VzIG5vdFxuICogdGFrZSB0aGUgc3RlcHMgdG8gYnJpbmcgYSBsYW5ndWFnZSB0YWcgaW50byDigJxleHRsYW5nIGZvcm3igJ0gYW5kIHRvIHJlb3JkZXJcbiAqIHZhcmlhbnQgc3VidGFncy5cblxuICogVGhlIHNwZWNpZmljYXRpb25zIGZvciBleHRlbnNpb25zIHRvIEJDUCA0NyBsYW5ndWFnZSB0YWdzLCBzdWNoIGFzIFJGQyA2MDY3LFxuICogbWF5IGluY2x1ZGUgY2Fub25pY2FsaXphdGlvbiBydWxlcyBmb3IgdGhlIGV4dGVuc2lvbiBzdWJ0YWcgc2VxdWVuY2VzIHRoZXlcbiAqIGRlZmluZSB0aGF0IGdvIGJleW9uZCB0aGUgY2Fub25pY2FsaXphdGlvbiBydWxlcyBvZiBSRkMgNTY0NiBzZWN0aW9uIDQuNS5cbiAqIEltcGxlbWVudGF0aW9ucyBhcmUgYWxsb3dlZCwgYnV0IG5vdCByZXF1aXJlZCwgdG8gYXBwbHkgdGhlc2UgYWRkaXRpb25hbCBydWxlcy5cbiAqL1xuZnVuY3Rpb24gLyogNi4yLjMgKi9DYW5vbmljYWxpemVMYW5ndWFnZVRhZyhsb2NhbGUpIHtcbiAgICB2YXIgbWF0Y2ggPSB2b2lkIDAsXG4gICAgICAgIHBhcnRzID0gdm9pZCAwO1xuXG4gICAgLy8gQSBsYW5ndWFnZSB0YWcgaXMgaW4gJ2Nhbm9uaWNhbCBmb3JtJyB3aGVuIHRoZSB0YWcgaXMgd2VsbC1mb3JtZWRcbiAgICAvLyBhY2NvcmRpbmcgdG8gdGhlIHJ1bGVzIGluIFNlY3Rpb25zIDIuMSBhbmQgMi4yXG5cbiAgICAvLyBTZWN0aW9uIDIuMSBzYXlzIGFsbCBzdWJ0YWdzIHVzZSBsb3dlcmNhc2UuLi5cbiAgICBsb2NhbGUgPSBsb2NhbGUudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIC4uLndpdGggMiBleGNlcHRpb25zOiAndHdvLWxldHRlciBhbmQgZm91ci1sZXR0ZXIgc3VidGFncyB0aGF0IG5laXRoZXJcbiAgICAvLyBhcHBlYXIgYXQgdGhlIHN0YXJ0IG9mIHRoZSB0YWcgbm9yIG9jY3VyIGFmdGVyIHNpbmdsZXRvbnMuICBTdWNoIHR3by1sZXR0ZXJcbiAgICAvLyBzdWJ0YWdzIGFyZSBhbGwgdXBwZXJjYXNlIChhcyBpbiB0aGUgdGFncyBcImVuLUNBLXgtY2FcIiBvciBcInNnbi1CRS1GUlwiKSBhbmRcbiAgICAvLyBmb3VyLWxldHRlciBzdWJ0YWdzIGFyZSB0aXRsZWNhc2UgKGFzIGluIHRoZSB0YWcgXCJhei1MYXRuLXgtbGF0blwiKS5cbiAgICBwYXJ0cyA9IGxvY2FsZS5zcGxpdCgnLScpO1xuICAgIGZvciAodmFyIGkgPSAxLCBtYXggPSBwYXJ0cy5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICAvLyBUd28tbGV0dGVyIHN1YnRhZ3MgYXJlIGFsbCB1cHBlcmNhc2VcbiAgICAgICAgaWYgKHBhcnRzW2ldLmxlbmd0aCA9PT0gMikgcGFydHNbaV0gPSBwYXJ0c1tpXS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgICAgIC8vIEZvdXItbGV0dGVyIHN1YnRhZ3MgYXJlIHRpdGxlY2FzZVxuICAgICAgICBlbHNlIGlmIChwYXJ0c1tpXS5sZW5ndGggPT09IDQpIHBhcnRzW2ldID0gcGFydHNbaV0uY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwYXJ0c1tpXS5zbGljZSgxKTtcblxuICAgICAgICAgICAgLy8gSXMgaXQgYSBzaW5nbGV0b24/XG4gICAgICAgICAgICBlbHNlIGlmIChwYXJ0c1tpXS5sZW5ndGggPT09IDEgJiYgcGFydHNbaV0gIT09ICd4JykgYnJlYWs7XG4gICAgfVxuICAgIGxvY2FsZSA9IGFyckpvaW4uY2FsbChwYXJ0cywgJy0nKTtcblxuICAgIC8vIFRoZSBzdGVwcyBsYWlkIG91dCBpbiBSRkMgNTY0NiBzZWN0aW9uIDQuNSBhcmUgYXMgZm9sbG93czpcblxuICAgIC8vIDEuICBFeHRlbnNpb24gc2VxdWVuY2VzIGFyZSBvcmRlcmVkIGludG8gY2FzZS1pbnNlbnNpdGl2ZSBBU0NJSSBvcmRlclxuICAgIC8vICAgICBieSBzaW5nbGV0b24gc3VidGFnLlxuICAgIGlmICgobWF0Y2ggPSBsb2NhbGUubWF0Y2goZXhwRXh0U2VxdWVuY2VzKSkgJiYgbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBUaGUgYnVpbHQtaW4gc29ydCgpIHNvcnRzIGJ5IEFTQ0lJIG9yZGVyLCBzbyB1c2UgdGhhdFxuICAgICAgICBtYXRjaC5zb3J0KCk7XG5cbiAgICAgICAgLy8gUmVwbGFjZSBhbGwgZXh0ZW5zaW9ucyB3aXRoIHRoZSBqb2luZWQsIHNvcnRlZCBhcnJheVxuICAgICAgICBsb2NhbGUgPSBsb2NhbGUucmVwbGFjZShSZWdFeHAoJyg/OicgKyBleHBFeHRTZXF1ZW5jZXMuc291cmNlICsgJykrJywgJ2knKSwgYXJySm9pbi5jYWxsKG1hdGNoLCAnJykpO1xuICAgIH1cblxuICAgIC8vIDIuICBSZWR1bmRhbnQgb3IgZ3JhbmRmYXRoZXJlZCB0YWdzIGFyZSByZXBsYWNlZCBieSB0aGVpciAnUHJlZmVycmVkLVxuICAgIC8vICAgICBWYWx1ZScsIGlmIHRoZXJlIGlzIG9uZS5cbiAgICBpZiAoaG9wLmNhbGwocmVkdW5kYW50VGFncy50YWdzLCBsb2NhbGUpKSBsb2NhbGUgPSByZWR1bmRhbnRUYWdzLnRhZ3NbbG9jYWxlXTtcblxuICAgIC8vIDMuICBTdWJ0YWdzIGFyZSByZXBsYWNlZCBieSB0aGVpciAnUHJlZmVycmVkLVZhbHVlJywgaWYgdGhlcmUgaXMgb25lLlxuICAgIC8vICAgICBGb3IgZXh0bGFuZ3MsIHRoZSBvcmlnaW5hbCBwcmltYXJ5IGxhbmd1YWdlIHN1YnRhZyBpcyBhbHNvXG4gICAgLy8gICAgIHJlcGxhY2VkIGlmIHRoZXJlIGlzIGEgcHJpbWFyeSBsYW5ndWFnZSBzdWJ0YWcgaW4gdGhlICdQcmVmZXJyZWQtXG4gICAgLy8gICAgIFZhbHVlJy5cbiAgICBwYXJ0cyA9IGxvY2FsZS5zcGxpdCgnLScpO1xuXG4gICAgZm9yICh2YXIgX2kgPSAxLCBfbWF4ID0gcGFydHMubGVuZ3RoOyBfaSA8IF9tYXg7IF9pKyspIHtcbiAgICAgICAgaWYgKGhvcC5jYWxsKHJlZHVuZGFudFRhZ3Muc3VidGFncywgcGFydHNbX2ldKSkgcGFydHNbX2ldID0gcmVkdW5kYW50VGFncy5zdWJ0YWdzW3BhcnRzW19pXV07ZWxzZSBpZiAoaG9wLmNhbGwocmVkdW5kYW50VGFncy5leHRMYW5nLCBwYXJ0c1tfaV0pKSB7XG4gICAgICAgICAgICBwYXJ0c1tfaV0gPSByZWR1bmRhbnRUYWdzLmV4dExhbmdbcGFydHNbX2ldXVswXTtcblxuICAgICAgICAgICAgLy8gRm9yIGV4dGxhbmcgdGFncywgdGhlIHByZWZpeCBuZWVkcyB0byBiZSByZW1vdmVkIGlmIGl0IGlzIHJlZHVuZGFudFxuICAgICAgICAgICAgaWYgKF9pID09PSAxICYmIHJlZHVuZGFudFRhZ3MuZXh0TGFuZ1twYXJ0c1sxXV1bMV0gPT09IHBhcnRzWzBdKSB7XG4gICAgICAgICAgICAgICAgcGFydHMgPSBhcnJTbGljZS5jYWxsKHBhcnRzLCBfaSsrKTtcbiAgICAgICAgICAgICAgICBfbWF4IC09IDE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJySm9pbi5jYWxsKHBhcnRzLCAnLScpO1xufVxuXG4vKipcbiAqIFRoZSBEZWZhdWx0TG9jYWxlIGFic3RyYWN0IG9wZXJhdGlvbiByZXR1cm5zIGEgU3RyaW5nIHZhbHVlIHJlcHJlc2VudGluZyB0aGVcbiAqIHN0cnVjdHVyYWxseSB2YWxpZCAoNi4yLjIpIGFuZCBjYW5vbmljYWxpemVkICg2LjIuMykgQkNQIDQ3IGxhbmd1YWdlIHRhZyBmb3IgdGhlXG4gKiBob3N0IGVudmlyb25tZW504oCZcyBjdXJyZW50IGxvY2FsZS5cbiAqL1xuZnVuY3Rpb24gLyogNi4yLjQgKi9EZWZhdWx0TG9jYWxlKCkge1xuICAgIHJldHVybiBkZWZhdWx0TG9jYWxlO1xufVxuXG4vLyBTZWN0IDYuMyBDdXJyZW5jeSBDb2Rlc1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT1cblxudmFyIGV4cEN1cnJlbmN5Q29kZSA9IC9eW0EtWl17M30kLztcblxuLyoqXG4gKiBUaGUgSXNXZWxsRm9ybWVkQ3VycmVuY3lDb2RlIGFic3RyYWN0IG9wZXJhdGlvbiB2ZXJpZmllcyB0aGF0IHRoZSBjdXJyZW5jeSBhcmd1bWVudFxuICogKGFmdGVyIGNvbnZlcnNpb24gdG8gYSBTdHJpbmcgdmFsdWUpIHJlcHJlc2VudHMgYSB3ZWxsLWZvcm1lZCAzLWxldHRlciBJU08gY3VycmVuY3lcbiAqIGNvZGUuIFRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiAvKiA2LjMuMSAqL0lzV2VsbEZvcm1lZEN1cnJlbmN5Q29kZShjdXJyZW5jeSkge1xuICAgIC8vIDEuIExldCBgY2AgYmUgVG9TdHJpbmcoY3VycmVuY3kpXG4gICAgdmFyIGMgPSBTdHJpbmcoY3VycmVuY3kpO1xuXG4gICAgLy8gMi4gTGV0IGBub3JtYWxpemVkYCBiZSB0aGUgcmVzdWx0IG9mIG1hcHBpbmcgYyB0byB1cHBlciBjYXNlIGFzIGRlc2NyaWJlZFxuICAgIC8vICAgIGluIDYuMS5cbiAgICB2YXIgbm9ybWFsaXplZCA9IHRvTGF0aW5VcHBlckNhc2UoYyk7XG5cbiAgICAvLyAzLiBJZiB0aGUgc3RyaW5nIGxlbmd0aCBvZiBub3JtYWxpemVkIGlzIG5vdCAzLCByZXR1cm4gZmFsc2UuXG4gICAgLy8gNC4gSWYgbm9ybWFsaXplZCBjb250YWlucyBhbnkgY2hhcmFjdGVyIHRoYXQgaXMgbm90IGluIHRoZSByYW5nZSBcIkFcIiB0byBcIlpcIlxuICAgIC8vICAgIChVKzAwNDEgdG8gVSswMDVBKSwgcmV0dXJuIGZhbHNlLlxuICAgIGlmIChleHBDdXJyZW5jeUNvZGUudGVzdChub3JtYWxpemVkKSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcblxuICAgIC8vIDUuIFJldHVybiB0cnVlXG4gICAgcmV0dXJuIHRydWU7XG59XG5cbnZhciBleHBVbmljb2RlRXhTZXEgPSAvLXUoPzotWzAtOWEtel17Miw4fSkrL2dpOyAvLyBTZWUgYGV4dGVuc2lvbmAgYmVsb3dcblxuZnVuY3Rpb24gLyogOS4yLjEgKi9DYW5vbmljYWxpemVMb2NhbGVMaXN0KGxvY2FsZXMpIHtcbiAgICAvLyBUaGUgYWJzdHJhY3Qgb3BlcmF0aW9uIENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QgdGFrZXMgdGhlIGZvbGxvd2luZyBzdGVwczpcblxuICAgIC8vIDEuIElmIGxvY2FsZXMgaXMgdW5kZWZpbmVkLCB0aGVuIGEuIFJldHVybiBhIG5ldyBlbXB0eSBMaXN0XG4gICAgaWYgKGxvY2FsZXMgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5ldyBMaXN0KCk7XG5cbiAgICAvLyAyLiBMZXQgc2VlbiBiZSBhIG5ldyBlbXB0eSBMaXN0LlxuICAgIHZhciBzZWVuID0gbmV3IExpc3QoKTtcblxuICAgIC8vIDMuIElmIGxvY2FsZXMgaXMgYSBTdHJpbmcgdmFsdWUsIHRoZW5cbiAgICAvLyAgICBhLiBMZXQgbG9jYWxlcyBiZSBhIG5ldyBhcnJheSBjcmVhdGVkIGFzIGlmIGJ5IHRoZSBleHByZXNzaW9uIG5ld1xuICAgIC8vICAgIEFycmF5KGxvY2FsZXMpIHdoZXJlIEFycmF5IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciB3aXRoXG4gICAgLy8gICAgdGhhdCBuYW1lIGFuZCBsb2NhbGVzIGlzIHRoZSB2YWx1ZSBvZiBsb2NhbGVzLlxuICAgIGxvY2FsZXMgPSB0eXBlb2YgbG9jYWxlcyA9PT0gJ3N0cmluZycgPyBbbG9jYWxlc10gOiBsb2NhbGVzO1xuXG4gICAgLy8gNC4gTGV0IE8gYmUgVG9PYmplY3QobG9jYWxlcykuXG4gICAgdmFyIE8gPSB0b09iamVjdChsb2NhbGVzKTtcblxuICAgIC8vIDUuIExldCBsZW5WYWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgTyB3aXRoIHRoZSBhcmd1bWVudCBcImxlbmd0aFwiLlxuICAgIC8vIDYuIExldCBsZW4gYmUgVG9VaW50MzIobGVuVmFsdWUpLlxuICAgIHZhciBsZW4gPSB0b0xlbmd0aChPLmxlbmd0aCk7XG5cbiAgICAvLyA3LiBMZXQgayBiZSAwLlxuICAgIHZhciBrID0gMDtcblxuICAgIC8vIDguIFJlcGVhdCwgd2hpbGUgayA8IGxlblxuICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIC8vIGEuIExldCBQayBiZSBUb1N0cmluZyhrKS5cbiAgICAgICAgdmFyIFBrID0gU3RyaW5nKGspO1xuXG4gICAgICAgIC8vIGIuIExldCBrUHJlc2VudCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbSGFzUHJvcGVydHldXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBtZXRob2Qgb2YgTyB3aXRoIGFyZ3VtZW50IFBrLlxuICAgICAgICB2YXIga1ByZXNlbnQgPSBQayBpbiBPO1xuXG4gICAgICAgIC8vIGMuIElmIGtQcmVzZW50IGlzIHRydWUsIHRoZW5cbiAgICAgICAgaWYgKGtQcmVzZW50KSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQga1ZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbFxuICAgICAgICAgICAgLy8gICAgIG1ldGhvZCBvZiBPIHdpdGggYXJndW1lbnQgUGsuXG4gICAgICAgICAgICB2YXIga1ZhbHVlID0gT1tQa107XG5cbiAgICAgICAgICAgIC8vIGlpLiBJZiB0aGUgdHlwZSBvZiBrVmFsdWUgaXMgbm90IFN0cmluZyBvciBPYmplY3QsIHRoZW4gdGhyb3cgYVxuICAgICAgICAgICAgLy8gICAgIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgICAgICAgICBpZiAoa1ZhbHVlID09PSBudWxsIHx8IHR5cGVvZiBrVmFsdWUgIT09ICdzdHJpbmcnICYmICh0eXBlb2Yga1ZhbHVlID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKGtWYWx1ZSkpICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignU3RyaW5nIG9yIE9iamVjdCB0eXBlIGV4cGVjdGVkJyk7XG5cbiAgICAgICAgICAgIC8vIGlpaS4gTGV0IHRhZyBiZSBUb1N0cmluZyhrVmFsdWUpLlxuICAgICAgICAgICAgdmFyIHRhZyA9IFN0cmluZyhrVmFsdWUpO1xuXG4gICAgICAgICAgICAvLyBpdi4gSWYgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAgICAgICAgIC8vICAgICBJc1N0cnVjdHVyYWxseVZhbGlkTGFuZ3VhZ2VUYWcgKGRlZmluZWQgaW4gNi4yLjIpLCBwYXNzaW5nIHRhZyBhc1xuICAgICAgICAgICAgLy8gICAgIHRoZSBhcmd1bWVudCwgaXMgZmFsc2UsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgICAgIGlmICghSXNTdHJ1Y3R1cmFsbHlWYWxpZExhbmd1YWdlVGFnKHRhZykpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiJ1wiICsgdGFnICsgXCInIGlzIG5vdCBhIHN0cnVjdHVyYWxseSB2YWxpZCBsYW5ndWFnZSB0YWdcIik7XG5cbiAgICAgICAgICAgIC8vIHYuIExldCB0YWcgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAgICAgICAgIC8vICAgIENhbm9uaWNhbGl6ZUxhbmd1YWdlVGFnIChkZWZpbmVkIGluIDYuMi4zKSwgcGFzc2luZyB0YWcgYXMgdGhlXG4gICAgICAgICAgICAvLyAgICBhcmd1bWVudC5cbiAgICAgICAgICAgIHRhZyA9IENhbm9uaWNhbGl6ZUxhbmd1YWdlVGFnKHRhZyk7XG5cbiAgICAgICAgICAgIC8vIHZpLiBJZiB0YWcgaXMgbm90IGFuIGVsZW1lbnQgb2Ygc2VlbiwgdGhlbiBhcHBlbmQgdGFnIGFzIHRoZSBsYXN0XG4gICAgICAgICAgICAvLyAgICAgZWxlbWVudCBvZiBzZWVuLlxuICAgICAgICAgICAgaWYgKGFyckluZGV4T2YuY2FsbChzZWVuLCB0YWcpID09PSAtMSkgYXJyUHVzaC5jYWxsKHNlZW4sIHRhZyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkLiBJbmNyZWFzZSBrIGJ5IDEuXG4gICAgICAgIGsrKztcbiAgICB9XG5cbiAgICAvLyA5LiBSZXR1cm4gc2Vlbi5cbiAgICByZXR1cm4gc2Vlbjtcbn1cblxuLyoqXG4gKiBUaGUgQmVzdEF2YWlsYWJsZUxvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb24gY29tcGFyZXMgdGhlIHByb3ZpZGVkIGFyZ3VtZW50XG4gKiBsb2NhbGUsIHdoaWNoIG11c3QgYmUgYSBTdHJpbmcgdmFsdWUgd2l0aCBhIHN0cnVjdHVyYWxseSB2YWxpZCBhbmRcbiAqIGNhbm9uaWNhbGl6ZWQgQkNQIDQ3IGxhbmd1YWdlIHRhZywgYWdhaW5zdCB0aGUgbG9jYWxlcyBpbiBhdmFpbGFibGVMb2NhbGVzIGFuZFxuICogcmV0dXJucyBlaXRoZXIgdGhlIGxvbmdlc3Qgbm9uLWVtcHR5IHByZWZpeCBvZiBsb2NhbGUgdGhhdCBpcyBhbiBlbGVtZW50IG9mXG4gKiBhdmFpbGFibGVMb2NhbGVzLCBvciB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gc3VjaCBlbGVtZW50LiBJdCB1c2VzIHRoZVxuICogZmFsbGJhY2sgbWVjaGFuaXNtIG9mIFJGQyA0NjQ3LCBzZWN0aW9uIDMuNC4gVGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIC8qIDkuMi4yICovQmVzdEF2YWlsYWJsZUxvY2FsZShhdmFpbGFibGVMb2NhbGVzLCBsb2NhbGUpIHtcbiAgICAvLyAxLiBMZXQgY2FuZGlkYXRlIGJlIGxvY2FsZVxuICAgIHZhciBjYW5kaWRhdGUgPSBsb2NhbGU7XG5cbiAgICAvLyAyLiBSZXBlYXRcbiAgICB3aGlsZSAoY2FuZGlkYXRlKSB7XG4gICAgICAgIC8vIGEuIElmIGF2YWlsYWJsZUxvY2FsZXMgY29udGFpbnMgYW4gZWxlbWVudCBlcXVhbCB0byBjYW5kaWRhdGUsIHRoZW4gcmV0dXJuXG4gICAgICAgIC8vIGNhbmRpZGF0ZS5cbiAgICAgICAgaWYgKGFyckluZGV4T2YuY2FsbChhdmFpbGFibGVMb2NhbGVzLCBjYW5kaWRhdGUpID4gLTEpIHJldHVybiBjYW5kaWRhdGU7XG5cbiAgICAgICAgLy8gYi4gTGV0IHBvcyBiZSB0aGUgY2hhcmFjdGVyIGluZGV4IG9mIHRoZSBsYXN0IG9jY3VycmVuY2Ugb2YgXCItXCJcbiAgICAgICAgLy8gKFUrMDAyRCkgd2l0aGluIGNhbmRpZGF0ZS4gSWYgdGhhdCBjaGFyYWN0ZXIgZG9lcyBub3Qgb2NjdXIsIHJldHVyblxuICAgICAgICAvLyB1bmRlZmluZWQuXG4gICAgICAgIHZhciBwb3MgPSBjYW5kaWRhdGUubGFzdEluZGV4T2YoJy0nKTtcblxuICAgICAgICBpZiAocG9zIDwgMCkgcmV0dXJuO1xuXG4gICAgICAgIC8vIGMuIElmIHBvcyDiiaUgMiBhbmQgdGhlIGNoYXJhY3RlciBcIi1cIiBvY2N1cnMgYXQgaW5kZXggcG9zLTIgb2YgY2FuZGlkYXRlLFxuICAgICAgICAvLyAgICB0aGVuIGRlY3JlYXNlIHBvcyBieSAyLlxuICAgICAgICBpZiAocG9zID49IDIgJiYgY2FuZGlkYXRlLmNoYXJBdChwb3MgLSAyKSA9PT0gJy0nKSBwb3MgLT0gMjtcblxuICAgICAgICAvLyBkLiBMZXQgY2FuZGlkYXRlIGJlIHRoZSBzdWJzdHJpbmcgb2YgY2FuZGlkYXRlIGZyb20gcG9zaXRpb24gMCwgaW5jbHVzaXZlLFxuICAgICAgICAvLyAgICB0byBwb3NpdGlvbiBwb3MsIGV4Y2x1c2l2ZS5cbiAgICAgICAgY2FuZGlkYXRlID0gY2FuZGlkYXRlLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaGUgTG9va3VwTWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb24gY29tcGFyZXMgcmVxdWVzdGVkTG9jYWxlcywgd2hpY2ggbXVzdCBiZVxuICogYSBMaXN0IGFzIHJldHVybmVkIGJ5IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QsIGFnYWluc3QgdGhlIGxvY2FsZXMgaW5cbiAqIGF2YWlsYWJsZUxvY2FsZXMgYW5kIGRldGVybWluZXMgdGhlIGJlc3QgYXZhaWxhYmxlIGxhbmd1YWdlIHRvIG1lZXQgdGhlXG4gKiByZXF1ZXN0LiBUaGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gLyogOS4yLjMgKi9Mb29rdXBNYXRjaGVyKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpIHtcbiAgICAvLyAxLiBMZXQgaSBiZSAwLlxuICAgIHZhciBpID0gMDtcblxuICAgIC8vIDIuIExldCBsZW4gYmUgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiByZXF1ZXN0ZWRMb2NhbGVzLlxuICAgIHZhciBsZW4gPSByZXF1ZXN0ZWRMb2NhbGVzLmxlbmd0aDtcblxuICAgIC8vIDMuIExldCBhdmFpbGFibGVMb2NhbGUgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBhdmFpbGFibGVMb2NhbGUgPSB2b2lkIDA7XG5cbiAgICB2YXIgbG9jYWxlID0gdm9pZCAwLFxuICAgICAgICBub0V4dGVuc2lvbnNMb2NhbGUgPSB2b2lkIDA7XG5cbiAgICAvLyA0LiBSZXBlYXQgd2hpbGUgaSA8IGxlbiBhbmQgYXZhaWxhYmxlTG9jYWxlIGlzIHVuZGVmaW5lZDpcbiAgICB3aGlsZSAoaSA8IGxlbiAmJiAhYXZhaWxhYmxlTG9jYWxlKSB7XG4gICAgICAgIC8vIGEuIExldCBsb2NhbGUgYmUgdGhlIGVsZW1lbnQgb2YgcmVxdWVzdGVkTG9jYWxlcyBhdCAwLW9yaWdpbmVkIGxpc3RcbiAgICAgICAgLy8gICAgcG9zaXRpb24gaS5cbiAgICAgICAgbG9jYWxlID0gcmVxdWVzdGVkTG9jYWxlc1tpXTtcblxuICAgICAgICAvLyBiLiBMZXQgbm9FeHRlbnNpb25zTG9jYWxlIGJlIHRoZSBTdHJpbmcgdmFsdWUgdGhhdCBpcyBsb2NhbGUgd2l0aCBhbGxcbiAgICAgICAgLy8gICAgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlcyByZW1vdmVkLlxuICAgICAgICBub0V4dGVuc2lvbnNMb2NhbGUgPSBTdHJpbmcobG9jYWxlKS5yZXBsYWNlKGV4cFVuaWNvZGVFeFNlcSwgJycpO1xuXG4gICAgICAgIC8vIGMuIExldCBhdmFpbGFibGVMb2NhbGUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZVxuICAgICAgICAvLyAgICBCZXN0QXZhaWxhYmxlTG9jYWxlIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuMikgd2l0aFxuICAgICAgICAvLyAgICBhcmd1bWVudHMgYXZhaWxhYmxlTG9jYWxlcyBhbmQgbm9FeHRlbnNpb25zTG9jYWxlLlxuICAgICAgICBhdmFpbGFibGVMb2NhbGUgPSBCZXN0QXZhaWxhYmxlTG9jYWxlKGF2YWlsYWJsZUxvY2FsZXMsIG5vRXh0ZW5zaW9uc0xvY2FsZSk7XG5cbiAgICAgICAgLy8gZC4gSW5jcmVhc2UgaSBieSAxLlxuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gNS4gTGV0IHJlc3VsdCBiZSBhIG5ldyBSZWNvcmQuXG4gICAgdmFyIHJlc3VsdCA9IG5ldyBSZWNvcmQoKTtcblxuICAgIC8vIDYuIElmIGF2YWlsYWJsZUxvY2FsZSBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKGF2YWlsYWJsZUxvY2FsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGEuIFNldCByZXN1bHQuW1tsb2NhbGVdXSB0byBhdmFpbGFibGVMb2NhbGUuXG4gICAgICAgIHJlc3VsdFsnW1tsb2NhbGVdXSddID0gYXZhaWxhYmxlTG9jYWxlO1xuXG4gICAgICAgIC8vIGIuIElmIGxvY2FsZSBhbmQgbm9FeHRlbnNpb25zTG9jYWxlIGFyZSBub3QgdGhlIHNhbWUgU3RyaW5nIHZhbHVlLCB0aGVuXG4gICAgICAgIGlmIChTdHJpbmcobG9jYWxlKSAhPT0gU3RyaW5nKG5vRXh0ZW5zaW9uc0xvY2FsZSkpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBleHRlbnNpb24gYmUgdGhlIFN0cmluZyB2YWx1ZSBjb25zaXN0aW5nIG9mIHRoZSBmaXJzdFxuICAgICAgICAgICAgLy8gICAgc3Vic3RyaW5nIG9mIGxvY2FsZSB0aGF0IGlzIGEgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlLlxuICAgICAgICAgICAgdmFyIGV4dGVuc2lvbiA9IGxvY2FsZS5tYXRjaChleHBVbmljb2RlRXhTZXEpWzBdO1xuXG4gICAgICAgICAgICAvLyBpaS4gTGV0IGV4dGVuc2lvbkluZGV4IGJlIHRoZSBjaGFyYWN0ZXIgcG9zaXRpb24gb2YgdGhlIGluaXRpYWxcbiAgICAgICAgICAgIC8vICAgICBcIi1cIiBvZiB0aGUgZmlyc3QgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlIHdpdGhpbiBsb2NhbGUuXG4gICAgICAgICAgICB2YXIgZXh0ZW5zaW9uSW5kZXggPSBsb2NhbGUuaW5kZXhPZignLXUtJyk7XG5cbiAgICAgICAgICAgIC8vIGlpaS4gU2V0IHJlc3VsdC5bW2V4dGVuc2lvbl1dIHRvIGV4dGVuc2lvbi5cbiAgICAgICAgICAgIHJlc3VsdFsnW1tleHRlbnNpb25dXSddID0gZXh0ZW5zaW9uO1xuXG4gICAgICAgICAgICAvLyBpdi4gU2V0IHJlc3VsdC5bW2V4dGVuc2lvbkluZGV4XV0gdG8gZXh0ZW5zaW9uSW5kZXguXG4gICAgICAgICAgICByZXN1bHRbJ1tbZXh0ZW5zaW9uSW5kZXhdXSddID0gZXh0ZW5zaW9uSW5kZXg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gNy4gRWxzZVxuICAgIGVsc2VcbiAgICAgICAgLy8gYS4gU2V0IHJlc3VsdC5bW2xvY2FsZV1dIHRvIHRoZSB2YWx1ZSByZXR1cm5lZCBieSB0aGUgRGVmYXVsdExvY2FsZSBhYnN0cmFjdFxuICAgICAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgaW4gNi4yLjQpLlxuICAgICAgICByZXN1bHRbJ1tbbG9jYWxlXV0nXSA9IERlZmF1bHRMb2NhbGUoKTtcblxuICAgIC8vIDguIFJldHVybiByZXN1bHRcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFRoZSBCZXN0Rml0TWF0Y2hlciBhYnN0cmFjdCBvcGVyYXRpb24gY29tcGFyZXMgcmVxdWVzdGVkTG9jYWxlcywgd2hpY2ggbXVzdCBiZVxuICogYSBMaXN0IGFzIHJldHVybmVkIGJ5IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QsIGFnYWluc3QgdGhlIGxvY2FsZXMgaW5cbiAqIGF2YWlsYWJsZUxvY2FsZXMgYW5kIGRldGVybWluZXMgdGhlIGJlc3QgYXZhaWxhYmxlIGxhbmd1YWdlIHRvIG1lZXQgdGhlXG4gKiByZXF1ZXN0LiBUaGUgYWxnb3JpdGhtIGlzIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudCwgYnV0IHNob3VsZCBwcm9kdWNlIHJlc3VsdHNcbiAqIHRoYXQgYSB0eXBpY2FsIHVzZXIgb2YgdGhlIHJlcXVlc3RlZCBsb2NhbGVzIHdvdWxkIHBlcmNlaXZlIGFzIGF0IGxlYXN0IGFzXG4gKiBnb29kIGFzIHRob3NlIHByb2R1Y2VkIGJ5IHRoZSBMb29rdXBNYXRjaGVyIGFic3RyYWN0IG9wZXJhdGlvbi4gT3B0aW9uc1xuICogc3BlY2lmaWVkIHRocm91Z2ggVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlcyBtdXN0IGJlIGlnbm9yZWQgYnkgdGhlXG4gKiBhbGdvcml0aG0uIEluZm9ybWF0aW9uIGFib3V0IHN1Y2ggc3Vic2VxdWVuY2VzIGlzIHJldHVybmVkIHNlcGFyYXRlbHkuXG4gKiBUaGUgYWJzdHJhY3Qgb3BlcmF0aW9uIHJldHVybnMgYSByZWNvcmQgd2l0aCBhIFtbbG9jYWxlXV0gZmllbGQsIHdob3NlIHZhbHVlXG4gKiBpcyB0aGUgbGFuZ3VhZ2UgdGFnIG9mIHRoZSBzZWxlY3RlZCBsb2NhbGUsIHdoaWNoIG11c3QgYmUgYW4gZWxlbWVudCBvZlxuICogYXZhaWxhYmxlTG9jYWxlcy4gSWYgdGhlIGxhbmd1YWdlIHRhZyBvZiB0aGUgcmVxdWVzdCBsb2NhbGUgdGhhdCBsZWQgdG8gdGhlXG4gKiBzZWxlY3RlZCBsb2NhbGUgY29udGFpbmVkIGEgVW5pY29kZSBsb2NhbGUgZXh0ZW5zaW9uIHNlcXVlbmNlLCB0aGVuIHRoZVxuICogcmV0dXJuZWQgcmVjb3JkIGFsc28gY29udGFpbnMgYW4gW1tleHRlbnNpb25dXSBmaWVsZCB3aG9zZSB2YWx1ZSBpcyB0aGUgZmlyc3RcbiAqIFVuaWNvZGUgbG9jYWxlIGV4dGVuc2lvbiBzZXF1ZW5jZSwgYW5kIGFuIFtbZXh0ZW5zaW9uSW5kZXhdXSBmaWVsZCB3aG9zZSB2YWx1ZVxuICogaXMgdGhlIGluZGV4IG9mIHRoZSBmaXJzdCBVbmljb2RlIGxvY2FsZSBleHRlbnNpb24gc2VxdWVuY2Ugd2l0aGluIHRoZSByZXF1ZXN0XG4gKiBsb2NhbGUgbGFuZ3VhZ2UgdGFnLlxuICovXG5mdW5jdGlvbiAvKiA5LjIuNCAqL0Jlc3RGaXRNYXRjaGVyKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpIHtcbiAgICByZXR1cm4gTG9va3VwTWF0Y2hlcihhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKTtcbn1cblxuLyoqXG4gKiBUaGUgUmVzb2x2ZUxvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb24gY29tcGFyZXMgYSBCQ1AgNDcgbGFuZ3VhZ2UgcHJpb3JpdHkgbGlzdFxuICogcmVxdWVzdGVkTG9jYWxlcyBhZ2FpbnN0IHRoZSBsb2NhbGVzIGluIGF2YWlsYWJsZUxvY2FsZXMgYW5kIGRldGVybWluZXMgdGhlXG4gKiBiZXN0IGF2YWlsYWJsZSBsYW5ndWFnZSB0byBtZWV0IHRoZSByZXF1ZXN0LiBhdmFpbGFibGVMb2NhbGVzIGFuZFxuICogcmVxdWVzdGVkTG9jYWxlcyBtdXN0IGJlIHByb3ZpZGVkIGFzIExpc3QgdmFsdWVzLCBvcHRpb25zIGFzIGEgUmVjb3JkLlxuICovXG5mdW5jdGlvbiAvKiA5LjIuNSAqL1Jlc29sdmVMb2NhbGUoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcywgb3B0aW9ucywgcmVsZXZhbnRFeHRlbnNpb25LZXlzLCBsb2NhbGVEYXRhKSB7XG4gICAgaWYgKGF2YWlsYWJsZUxvY2FsZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcignTm8gbG9jYWxlIGRhdGEgaGFzIGJlZW4gcHJvdmlkZWQgZm9yIHRoaXMgb2JqZWN0IHlldC4nKTtcbiAgICB9XG5cbiAgICAvLyBUaGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAgICAvLyAxLiBMZXQgbWF0Y2hlciBiZSB0aGUgdmFsdWUgb2Ygb3B0aW9ucy5bW2xvY2FsZU1hdGNoZXJdXS5cbiAgICB2YXIgbWF0Y2hlciA9IG9wdGlvbnNbJ1tbbG9jYWxlTWF0Y2hlcl1dJ107XG5cbiAgICB2YXIgciA9IHZvaWQgMDtcblxuICAgIC8vIDIuIElmIG1hdGNoZXIgaXMgXCJsb29rdXBcIiwgdGhlblxuICAgIGlmIChtYXRjaGVyID09PSAnbG9va3VwJylcbiAgICAgICAgLy8gYS4gTGV0IHIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBMb29rdXBNYXRjaGVyIGFic3RyYWN0IG9wZXJhdGlvblxuICAgICAgICAvLyAgICAoZGVmaW5lZCBpbiA5LjIuMykgd2l0aCBhcmd1bWVudHMgYXZhaWxhYmxlTG9jYWxlcyBhbmRcbiAgICAgICAgLy8gICAgcmVxdWVzdGVkTG9jYWxlcy5cbiAgICAgICAgciA9IExvb2t1cE1hdGNoZXIoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyk7XG5cbiAgICAgICAgLy8gMy4gRWxzZVxuICAgIGVsc2VcbiAgICAgICAgLy8gYS4gTGV0IHIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBCZXN0Rml0TWF0Y2hlciBhYnN0cmFjdFxuICAgICAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgaW4gOS4yLjQpIHdpdGggYXJndW1lbnRzIGF2YWlsYWJsZUxvY2FsZXMgYW5kXG4gICAgICAgIC8vICAgIHJlcXVlc3RlZExvY2FsZXMuXG4gICAgICAgIHIgPSBCZXN0Rml0TWF0Y2hlcihhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKTtcblxuICAgIC8vIDQuIExldCBmb3VuZExvY2FsZSBiZSB0aGUgdmFsdWUgb2Ygci5bW2xvY2FsZV1dLlxuICAgIHZhciBmb3VuZExvY2FsZSA9IHJbJ1tbbG9jYWxlXV0nXTtcblxuICAgIHZhciBleHRlbnNpb25TdWJ0YWdzID0gdm9pZCAwLFxuICAgICAgICBleHRlbnNpb25TdWJ0YWdzTGVuZ3RoID0gdm9pZCAwO1xuXG4gICAgLy8gNS4gSWYgciBoYXMgYW4gW1tleHRlbnNpb25dXSBmaWVsZCwgdGhlblxuICAgIGlmIChob3AuY2FsbChyLCAnW1tleHRlbnNpb25dXScpKSB7XG4gICAgICAgIC8vIGEuIExldCBleHRlbnNpb24gYmUgdGhlIHZhbHVlIG9mIHIuW1tleHRlbnNpb25dXS5cbiAgICAgICAgdmFyIGV4dGVuc2lvbiA9IHJbJ1tbZXh0ZW5zaW9uXV0nXTtcbiAgICAgICAgLy8gYi4gTGV0IHNwbGl0IGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBmdW5jdGlvbiBvYmplY3QgZGVmaW5lZCBpbiBFUzUsXG4gICAgICAgIC8vICAgIDE1LjUuNC4xNC5cbiAgICAgICAgdmFyIHNwbGl0ID0gU3RyaW5nLnByb3RvdHlwZS5zcGxpdDtcbiAgICAgICAgLy8gYy4gTGV0IGV4dGVuc2lvblN1YnRhZ3MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBtZXRob2Qgb2Ygc3BsaXQgd2l0aCBleHRlbnNpb24gYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFuIGFyZ3VtZW50XG4gICAgICAgIC8vICAgIGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0gXCItXCIuXG4gICAgICAgIGV4dGVuc2lvblN1YnRhZ3MgPSBzcGxpdC5jYWxsKGV4dGVuc2lvbiwgJy0nKTtcbiAgICAgICAgLy8gZC4gTGV0IGV4dGVuc2lvblN1YnRhZ3NMZW5ndGggYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dXG4gICAgICAgIC8vICAgIGludGVybmFsIG1ldGhvZCBvZiBleHRlbnNpb25TdWJ0YWdzIHdpdGggYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICAgICAgZXh0ZW5zaW9uU3VidGFnc0xlbmd0aCA9IGV4dGVuc2lvblN1YnRhZ3MubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIDYuIExldCByZXN1bHQgYmUgYSBuZXcgUmVjb3JkLlxuICAgIHZhciByZXN1bHQgPSBuZXcgUmVjb3JkKCk7XG5cbiAgICAvLyA3LiBTZXQgcmVzdWx0LltbZGF0YUxvY2FsZV1dIHRvIGZvdW5kTG9jYWxlLlxuICAgIHJlc3VsdFsnW1tkYXRhTG9jYWxlXV0nXSA9IGZvdW5kTG9jYWxlO1xuXG4gICAgLy8gOC4gTGV0IHN1cHBvcnRlZEV4dGVuc2lvbiBiZSBcIi11XCIuXG4gICAgdmFyIHN1cHBvcnRlZEV4dGVuc2lvbiA9ICctdSc7XG4gICAgLy8gOS4gTGV0IGkgYmUgMC5cbiAgICB2YXIgaSA9IDA7XG4gICAgLy8gMTAuIExldCBsZW4gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgICByZWxldmFudEV4dGVuc2lvbktleXMgd2l0aCBhcmd1bWVudCBcImxlbmd0aFwiLlxuICAgIHZhciBsZW4gPSByZWxldmFudEV4dGVuc2lvbktleXMubGVuZ3RoO1xuXG4gICAgLy8gMTEgUmVwZWF0IHdoaWxlIGkgPCBsZW46XG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgICAgLy8gYS4gTGV0IGtleSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgIC8vICAgIHJlbGV2YW50RXh0ZW5zaW9uS2V5cyB3aXRoIGFyZ3VtZW50IFRvU3RyaW5nKGkpLlxuICAgICAgICB2YXIga2V5ID0gcmVsZXZhbnRFeHRlbnNpb25LZXlzW2ldO1xuICAgICAgICAvLyBiLiBMZXQgZm91bmRMb2NhbGVEYXRhIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBtZXRob2Qgb2YgbG9jYWxlRGF0YSB3aXRoIHRoZSBhcmd1bWVudCBmb3VuZExvY2FsZS5cbiAgICAgICAgdmFyIGZvdW5kTG9jYWxlRGF0YSA9IGxvY2FsZURhdGFbZm91bmRMb2NhbGVdO1xuICAgICAgICAvLyBjLiBMZXQga2V5TG9jYWxlRGF0YSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWxcbiAgICAgICAgLy8gICAgbWV0aG9kIG9mIGZvdW5kTG9jYWxlRGF0YSB3aXRoIHRoZSBhcmd1bWVudCBrZXkuXG4gICAgICAgIHZhciBrZXlMb2NhbGVEYXRhID0gZm91bmRMb2NhbGVEYXRhW2tleV07XG4gICAgICAgIC8vIGQuIExldCB2YWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgICAgIC8vICAgIGtleUxvY2FsZURhdGEgd2l0aCBhcmd1bWVudCBcIjBcIi5cbiAgICAgICAgdmFyIHZhbHVlID0ga2V5TG9jYWxlRGF0YVsnMCddO1xuICAgICAgICAvLyBlLiBMZXQgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gYmUgXCJcIi5cbiAgICAgICAgdmFyIHN1cHBvcnRlZEV4dGVuc2lvbkFkZGl0aW9uID0gJyc7XG4gICAgICAgIC8vIGYuIExldCBpbmRleE9mIGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBmdW5jdGlvbiBvYmplY3QgZGVmaW5lZCBpblxuICAgICAgICAvLyAgICBFUzUsIDE1LjQuNC4xNC5cbiAgICAgICAgdmFyIGluZGV4T2YgPSBhcnJJbmRleE9mO1xuXG4gICAgICAgIC8vIGcuIElmIGV4dGVuc2lvblN1YnRhZ3MgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgICAgICBpZiAoZXh0ZW5zaW9uU3VidGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQga2V5UG9zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWxcbiAgICAgICAgICAgIC8vICAgIG1ldGhvZCBvZiBpbmRleE9mIHdpdGggZXh0ZW5zaW9uU3VidGFncyBhcyB0aGUgdGhpcyB2YWx1ZSBhbmRcbiAgICAgICAgICAgIC8vIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZyB0aGUgc2luZ2xlIGl0ZW0ga2V5LlxuICAgICAgICAgICAgdmFyIGtleVBvcyA9IGluZGV4T2YuY2FsbChleHRlbnNpb25TdWJ0YWdzLCBrZXkpO1xuXG4gICAgICAgICAgICAvLyBpaS4gSWYga2V5UG9zIOKJoCAtMSwgdGhlblxuICAgICAgICAgICAgaWYgKGtleVBvcyAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyAxLiBJZiBrZXlQb3MgKyAxIDwgZXh0ZW5zaW9uU3VidGFnc0xlbmd0aCBhbmQgdGhlIGxlbmd0aCBvZiB0aGVcbiAgICAgICAgICAgICAgICAvLyAgICByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgICAgICAgICAvLyAgICBleHRlbnNpb25TdWJ0YWdzIHdpdGggYXJndW1lbnQgVG9TdHJpbmcoa2V5UG9zICsxKSBpcyBncmVhdGVyXG4gICAgICAgICAgICAgICAgLy8gICAgdGhhbiAyLCB0aGVuXG4gICAgICAgICAgICAgICAgaWYgKGtleVBvcyArIDEgPCBleHRlbnNpb25TdWJ0YWdzTGVuZ3RoICYmIGV4dGVuc2lvblN1YnRhZ3Nba2V5UG9zICsgMV0ubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgcmVxdWVzdGVkVmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGludGVybmFsIG1ldGhvZCBvZiBleHRlbnNpb25TdWJ0YWdzIHdpdGggYXJndW1lbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgVG9TdHJpbmcoa2V5UG9zICsgMSkuXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXF1ZXN0ZWRWYWx1ZSA9IGV4dGVuc2lvblN1YnRhZ3Nba2V5UG9zICsgMV07XG4gICAgICAgICAgICAgICAgICAgIC8vIGIuIExldCB2YWx1ZVBvcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ2FsbF1dXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGludGVybmFsIG1ldGhvZCBvZiBpbmRleE9mIHdpdGgga2V5TG9jYWxlRGF0YSBhcyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgdGhpcyB2YWx1ZSBhbmQgYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGVcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgaXRlbSByZXF1ZXN0ZWRWYWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlUG9zID0gaW5kZXhPZi5jYWxsKGtleUxvY2FsZURhdGEsIHJlcXVlc3RlZFZhbHVlKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBjLiBJZiB2YWx1ZVBvcyDiiaAgLTEsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlUG9zICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IHZhbHVlIGJlIHJlcXVlc3RlZFZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZXF1ZXN0ZWRWYWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpLiBMZXQgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gYmUgdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgY29uY2F0ZW5hdGlvbiBvZiBcIi1cIiwga2V5LCBcIi1cIiwgYW5kIHZhbHVlLlxuICAgICAgICAgICAgICAgICAgICAgICAgc3VwcG9ydGVkRXh0ZW5zaW9uQWRkaXRpb24gPSAnLScgKyBrZXkgKyAnLScgKyB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyAyLiBFbHNlXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgdmFsdWVQb3MgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50ZXJuYWwgbWV0aG9kIG9mIGluZGV4T2Ygd2l0aCBrZXlMb2NhbGVEYXRhIGFzIHRoZSB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB2YWx1ZSBhbmQgYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nIHRoZSBzaW5nbGUgaXRlbVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gXCJ0cnVlXCIuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgX3ZhbHVlUG9zID0gaW5kZXhPZihrZXlMb2NhbGVEYXRhLCAndHJ1ZScpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBiLiBJZiB2YWx1ZVBvcyDiiaAgLTEsIHRoZW5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfdmFsdWVQb3MgIT09IC0xKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGkuIExldCB2YWx1ZSBiZSBcInRydWVcIi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICd0cnVlJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGguIElmIG9wdGlvbnMgaGFzIGEgZmllbGQgW1s8a2V5Pl1dLCB0aGVuXG4gICAgICAgIGlmIChob3AuY2FsbChvcHRpb25zLCAnW1snICsga2V5ICsgJ11dJykpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBvcHRpb25zVmFsdWUgYmUgdGhlIHZhbHVlIG9mIG9wdGlvbnMuW1s8a2V5Pl1dLlxuICAgICAgICAgICAgdmFyIG9wdGlvbnNWYWx1ZSA9IG9wdGlvbnNbJ1tbJyArIGtleSArICddXSddO1xuXG4gICAgICAgICAgICAvLyBpaS4gSWYgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXSBpbnRlcm5hbCBtZXRob2Qgb2YgaW5kZXhPZlxuICAgICAgICAgICAgLy8gICAgIHdpdGgga2V5TG9jYWxlRGF0YSBhcyB0aGUgdGhpcyB2YWx1ZSBhbmQgYW4gYXJndW1lbnQgbGlzdFxuICAgICAgICAgICAgLy8gICAgIGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtIG9wdGlvbnNWYWx1ZSBpcyBub3QgLTEsIHRoZW5cbiAgICAgICAgICAgIGlmIChpbmRleE9mLmNhbGwoa2V5TG9jYWxlRGF0YSwgb3B0aW9uc1ZhbHVlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyAxLiBJZiBvcHRpb25zVmFsdWUgaXMgbm90IGVxdWFsIHRvIHZhbHVlLCB0aGVuXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnNWYWx1ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IHZhbHVlIGJlIG9wdGlvbnNWYWx1ZS5cbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBvcHRpb25zVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIC8vIGIuIExldCBzdXBwb3J0ZWRFeHRlbnNpb25BZGRpdGlvbiBiZSBcIlwiLlxuICAgICAgICAgICAgICAgICAgICBzdXBwb3J0ZWRFeHRlbnNpb25BZGRpdGlvbiA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBpLiBTZXQgcmVzdWx0LltbPGtleT5dXSB0byB2YWx1ZS5cbiAgICAgICAgcmVzdWx0WydbWycgKyBrZXkgKyAnXV0nXSA9IHZhbHVlO1xuXG4gICAgICAgIC8vIGouIEFwcGVuZCBzdXBwb3J0ZWRFeHRlbnNpb25BZGRpdGlvbiB0byBzdXBwb3J0ZWRFeHRlbnNpb24uXG4gICAgICAgIHN1cHBvcnRlZEV4dGVuc2lvbiArPSBzdXBwb3J0ZWRFeHRlbnNpb25BZGRpdGlvbjtcblxuICAgICAgICAvLyBrLiBJbmNyZWFzZSBpIGJ5IDEuXG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgLy8gMTIuIElmIHRoZSBsZW5ndGggb2Ygc3VwcG9ydGVkRXh0ZW5zaW9uIGlzIGdyZWF0ZXIgdGhhbiAyLCB0aGVuXG4gICAgaWYgKHN1cHBvcnRlZEV4dGVuc2lvbi5sZW5ndGggPiAyKSB7XG4gICAgICAgIC8vIGEuXG4gICAgICAgIHZhciBwcml2YXRlSW5kZXggPSBmb3VuZExvY2FsZS5pbmRleE9mKFwiLXgtXCIpO1xuICAgICAgICAvLyBiLlxuICAgICAgICBpZiAocHJpdmF0ZUluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgLy8gaS5cbiAgICAgICAgICAgIGZvdW5kTG9jYWxlID0gZm91bmRMb2NhbGUgKyBzdXBwb3J0ZWRFeHRlbnNpb247XG4gICAgICAgIH1cbiAgICAgICAgLy8gYy5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaS5cbiAgICAgICAgICAgICAgICB2YXIgcHJlRXh0ZW5zaW9uID0gZm91bmRMb2NhbGUuc3Vic3RyaW5nKDAsIHByaXZhdGVJbmRleCk7XG4gICAgICAgICAgICAgICAgLy8gaWkuXG4gICAgICAgICAgICAgICAgdmFyIHBvc3RFeHRlbnNpb24gPSBmb3VuZExvY2FsZS5zdWJzdHJpbmcocHJpdmF0ZUluZGV4KTtcbiAgICAgICAgICAgICAgICAvLyBpaWkuXG4gICAgICAgICAgICAgICAgZm91bmRMb2NhbGUgPSBwcmVFeHRlbnNpb24gKyBzdXBwb3J0ZWRFeHRlbnNpb24gKyBwb3N0RXh0ZW5zaW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyBkLiBhc3NlcnRpbmcgLSBza2lwcGluZ1xuICAgICAgICAvLyBlLlxuICAgICAgICBmb3VuZExvY2FsZSA9IENhbm9uaWNhbGl6ZUxhbmd1YWdlVGFnKGZvdW5kTG9jYWxlKTtcbiAgICB9XG4gICAgLy8gMTMuIFNldCByZXN1bHQuW1tsb2NhbGVdXSB0byBmb3VuZExvY2FsZS5cbiAgICByZXN1bHRbJ1tbbG9jYWxlXV0nXSA9IGZvdW5kTG9jYWxlO1xuXG4gICAgLy8gMTQuIFJldHVybiByZXN1bHQuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBUaGUgTG9va3VwU3VwcG9ydGVkTG9jYWxlcyBhYnN0cmFjdCBvcGVyYXRpb24gcmV0dXJucyB0aGUgc3Vic2V0IG9mIHRoZVxuICogcHJvdmlkZWQgQkNQIDQ3IGxhbmd1YWdlIHByaW9yaXR5IGxpc3QgcmVxdWVzdGVkTG9jYWxlcyBmb3Igd2hpY2hcbiAqIGF2YWlsYWJsZUxvY2FsZXMgaGFzIGEgbWF0Y2hpbmcgbG9jYWxlIHdoZW4gdXNpbmcgdGhlIEJDUCA0NyBMb29rdXAgYWxnb3JpdGhtLlxuICogTG9jYWxlcyBhcHBlYXIgaW4gdGhlIHNhbWUgb3JkZXIgaW4gdGhlIHJldHVybmVkIGxpc3QgYXMgaW4gcmVxdWVzdGVkTG9jYWxlcy5cbiAqIFRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiAvKiA5LjIuNiAqL0xvb2t1cFN1cHBvcnRlZExvY2FsZXMoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcykge1xuICAgIC8vIDEuIExldCBsZW4gYmUgdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiByZXF1ZXN0ZWRMb2NhbGVzLlxuICAgIHZhciBsZW4gPSByZXF1ZXN0ZWRMb2NhbGVzLmxlbmd0aDtcbiAgICAvLyAyLiBMZXQgc3Vic2V0IGJlIGEgbmV3IGVtcHR5IExpc3QuXG4gICAgdmFyIHN1YnNldCA9IG5ldyBMaXN0KCk7XG4gICAgLy8gMy4gTGV0IGsgYmUgMC5cbiAgICB2YXIgayA9IDA7XG5cbiAgICAvLyA0LiBSZXBlYXQgd2hpbGUgayA8IGxlblxuICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgIC8vIGEuIExldCBsb2NhbGUgYmUgdGhlIGVsZW1lbnQgb2YgcmVxdWVzdGVkTG9jYWxlcyBhdCAwLW9yaWdpbmVkIGxpc3RcbiAgICAgICAgLy8gICAgcG9zaXRpb24gay5cbiAgICAgICAgdmFyIGxvY2FsZSA9IHJlcXVlc3RlZExvY2FsZXNba107XG4gICAgICAgIC8vIGIuIExldCBub0V4dGVuc2lvbnNMb2NhbGUgYmUgdGhlIFN0cmluZyB2YWx1ZSB0aGF0IGlzIGxvY2FsZSB3aXRoIGFsbFxuICAgICAgICAvLyAgICBVbmljb2RlIGxvY2FsZSBleHRlbnNpb24gc2VxdWVuY2VzIHJlbW92ZWQuXG4gICAgICAgIHZhciBub0V4dGVuc2lvbnNMb2NhbGUgPSBTdHJpbmcobG9jYWxlKS5yZXBsYWNlKGV4cFVuaWNvZGVFeFNlcSwgJycpO1xuICAgICAgICAvLyBjLiBMZXQgYXZhaWxhYmxlTG9jYWxlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGVcbiAgICAgICAgLy8gICAgQmVzdEF2YWlsYWJsZUxvY2FsZSBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWQgaW4gOS4yLjIpIHdpdGhcbiAgICAgICAgLy8gICAgYXJndW1lbnRzIGF2YWlsYWJsZUxvY2FsZXMgYW5kIG5vRXh0ZW5zaW9uc0xvY2FsZS5cbiAgICAgICAgdmFyIGF2YWlsYWJsZUxvY2FsZSA9IEJlc3RBdmFpbGFibGVMb2NhbGUoYXZhaWxhYmxlTG9jYWxlcywgbm9FeHRlbnNpb25zTG9jYWxlKTtcblxuICAgICAgICAvLyBkLiBJZiBhdmFpbGFibGVMb2NhbGUgaXMgbm90IHVuZGVmaW5lZCwgdGhlbiBhcHBlbmQgbG9jYWxlIHRvIHRoZSBlbmQgb2ZcbiAgICAgICAgLy8gICAgc3Vic2V0LlxuICAgICAgICBpZiAoYXZhaWxhYmxlTG9jYWxlICE9PSB1bmRlZmluZWQpIGFyclB1c2guY2FsbChzdWJzZXQsIGxvY2FsZSk7XG5cbiAgICAgICAgLy8gZS4gSW5jcmVtZW50IGsgYnkgMS5cbiAgICAgICAgaysrO1xuICAgIH1cblxuICAgIC8vIDUuIExldCBzdWJzZXRBcnJheSBiZSBhIG5ldyBBcnJheSBvYmplY3Qgd2hvc2UgZWxlbWVudHMgYXJlIHRoZSBzYW1lXG4gICAgLy8gICAgdmFsdWVzIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSBlbGVtZW50cyBvZiBzdWJzZXQuXG4gICAgdmFyIHN1YnNldEFycmF5ID0gYXJyU2xpY2UuY2FsbChzdWJzZXQpO1xuXG4gICAgLy8gNi4gUmV0dXJuIHN1YnNldEFycmF5LlxuICAgIHJldHVybiBzdWJzZXRBcnJheTtcbn1cblxuLyoqXG4gKiBUaGUgQmVzdEZpdFN1cHBvcnRlZExvY2FsZXMgYWJzdHJhY3Qgb3BlcmF0aW9uIHJldHVybnMgdGhlIHN1YnNldCBvZiB0aGVcbiAqIHByb3ZpZGVkIEJDUCA0NyBsYW5ndWFnZSBwcmlvcml0eSBsaXN0IHJlcXVlc3RlZExvY2FsZXMgZm9yIHdoaWNoXG4gKiBhdmFpbGFibGVMb2NhbGVzIGhhcyBhIG1hdGNoaW5nIGxvY2FsZSB3aGVuIHVzaW5nIHRoZSBCZXN0IEZpdCBNYXRjaGVyXG4gKiBhbGdvcml0aG0uIExvY2FsZXMgYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyIGluIHRoZSByZXR1cm5lZCBsaXN0IGFzIGluXG4gKiByZXF1ZXN0ZWRMb2NhbGVzLiBUaGUgc3RlcHMgdGFrZW4gYXJlIGltcGxlbWVudGF0aW9uIGRlcGVuZGVudC5cbiAqL1xuZnVuY3Rpb24gLyo5LjIuNyAqL0Jlc3RGaXRTdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpIHtcbiAgICAvLyAjIyNUT0RPOiBpbXBsZW1lbnQgdGhpcyBmdW5jdGlvbiBhcyBkZXNjcmliZWQgYnkgdGhlIHNwZWNpZmljYXRpb24jIyNcbiAgICByZXR1cm4gTG9va3VwU3VwcG9ydGVkTG9jYWxlcyhhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKTtcbn1cblxuLyoqXG4gKiBUaGUgU3VwcG9ydGVkTG9jYWxlcyBhYnN0cmFjdCBvcGVyYXRpb24gcmV0dXJucyB0aGUgc3Vic2V0IG9mIHRoZSBwcm92aWRlZCBCQ1BcbiAqIDQ3IGxhbmd1YWdlIHByaW9yaXR5IGxpc3QgcmVxdWVzdGVkTG9jYWxlcyBmb3Igd2hpY2ggYXZhaWxhYmxlTG9jYWxlcyBoYXMgYVxuICogbWF0Y2hpbmcgbG9jYWxlLiBUd28gYWxnb3JpdGhtcyBhcmUgYXZhaWxhYmxlIHRvIG1hdGNoIHRoZSBsb2NhbGVzOiB0aGUgTG9va3VwXG4gKiBhbGdvcml0aG0gZGVzY3JpYmVkIGluIFJGQyA0NjQ3IHNlY3Rpb24gMy40LCBhbmQgYW4gaW1wbGVtZW50YXRpb24gZGVwZW5kZW50XG4gKiBiZXN0LWZpdCBhbGdvcml0aG0uIExvY2FsZXMgYXBwZWFyIGluIHRoZSBzYW1lIG9yZGVyIGluIHRoZSByZXR1cm5lZCBsaXN0IGFzXG4gKiBpbiByZXF1ZXN0ZWRMb2NhbGVzLiBUaGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gLyo5LjIuOCAqL1N1cHBvcnRlZExvY2FsZXMoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcywgb3B0aW9ucykge1xuICAgIHZhciBtYXRjaGVyID0gdm9pZCAwLFxuICAgICAgICBzdWJzZXQgPSB2b2lkIDA7XG5cbiAgICAvLyAxLiBJZiBvcHRpb25zIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGEuIExldCBvcHRpb25zIGJlIFRvT2JqZWN0KG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gbmV3IFJlY29yZCh0b09iamVjdChvcHRpb25zKSk7XG4gICAgICAgIC8vIGIuIExldCBtYXRjaGVyIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgLy8gICAgb3B0aW9ucyB3aXRoIGFyZ3VtZW50IFwibG9jYWxlTWF0Y2hlclwiLlxuICAgICAgICBtYXRjaGVyID0gb3B0aW9ucy5sb2NhbGVNYXRjaGVyO1xuXG4gICAgICAgIC8vIGMuIElmIG1hdGNoZXIgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgICAgICBpZiAobWF0Y2hlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgbWF0Y2hlciBiZSBUb1N0cmluZyhtYXRjaGVyKS5cbiAgICAgICAgICAgIG1hdGNoZXIgPSBTdHJpbmcobWF0Y2hlcik7XG5cbiAgICAgICAgICAgIC8vIGlpLiBJZiBtYXRjaGVyIGlzIG5vdCBcImxvb2t1cFwiIG9yIFwiYmVzdCBmaXRcIiwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3JcbiAgICAgICAgICAgIC8vICAgICBleGNlcHRpb24uXG4gICAgICAgICAgICBpZiAobWF0Y2hlciAhPT0gJ2xvb2t1cCcgJiYgbWF0Y2hlciAhPT0gJ2Jlc3QgZml0JykgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ21hdGNoZXIgc2hvdWxkIGJlIFwibG9va3VwXCIgb3IgXCJiZXN0IGZpdFwiJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gMi4gSWYgbWF0Y2hlciBpcyB1bmRlZmluZWQgb3IgXCJiZXN0IGZpdFwiLCB0aGVuXG4gICAgaWYgKG1hdGNoZXIgPT09IHVuZGVmaW5lZCB8fCBtYXRjaGVyID09PSAnYmVzdCBmaXQnKVxuICAgICAgICAvLyBhLiBMZXQgc3Vic2V0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQmVzdEZpdFN1cHBvcnRlZExvY2FsZXNcbiAgICAgICAgLy8gICAgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi43KSB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAvLyAgICBhdmFpbGFibGVMb2NhbGVzIGFuZCByZXF1ZXN0ZWRMb2NhbGVzLlxuICAgICAgICBzdWJzZXQgPSBCZXN0Rml0U3VwcG9ydGVkTG9jYWxlcyhhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzKTtcbiAgICAgICAgLy8gMy4gRWxzZVxuICAgIGVsc2VcbiAgICAgICAgLy8gYS4gTGV0IHN1YnNldCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIExvb2t1cFN1cHBvcnRlZExvY2FsZXNcbiAgICAgICAgLy8gICAgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi42KSB3aXRoIGFyZ3VtZW50c1xuICAgICAgICAvLyAgICBhdmFpbGFibGVMb2NhbGVzIGFuZCByZXF1ZXN0ZWRMb2NhbGVzLlxuICAgICAgICBzdWJzZXQgPSBMb29rdXBTdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMpO1xuXG4gICAgLy8gNC4gRm9yIGVhY2ggbmFtZWQgb3duIHByb3BlcnR5IG5hbWUgUCBvZiBzdWJzZXQsXG4gICAgZm9yICh2YXIgUCBpbiBzdWJzZXQpIHtcbiAgICAgICAgaWYgKCFob3AuY2FsbChzdWJzZXQsIFApKSBjb250aW51ZTtcblxuICAgICAgICAvLyBhLiBMZXQgZGVzYyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0T3duUHJvcGVydHldXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBtZXRob2Qgb2Ygc3Vic2V0IHdpdGggUC5cbiAgICAgICAgLy8gYi4gU2V0IGRlc2MuW1tXcml0YWJsZV1dIHRvIGZhbHNlLlxuICAgICAgICAvLyBjLiBTZXQgZGVzYy5bW0NvbmZpZ3VyYWJsZV1dIHRvIGZhbHNlLlxuICAgICAgICAvLyBkLiBDYWxsIHRoZSBbW0RlZmluZU93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mIHN1YnNldCB3aXRoIFAsIGRlc2MsXG4gICAgICAgIC8vICAgIGFuZCB0cnVlIGFzIGFyZ3VtZW50cy5cbiAgICAgICAgZGVmaW5lUHJvcGVydHkoc3Vic2V0LCBQLCB7XG4gICAgICAgICAgICB3cml0YWJsZTogZmFsc2UsIGNvbmZpZ3VyYWJsZTogZmFsc2UsIHZhbHVlOiBzdWJzZXRbUF1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIFwiRnJlZXplXCIgdGhlIGFycmF5IHNvIG5vIG5ldyBlbGVtZW50cyBjYW4gYmUgYWRkZWRcbiAgICBkZWZpbmVQcm9wZXJ0eShzdWJzZXQsICdsZW5ndGgnLCB7IHdyaXRhYmxlOiBmYWxzZSB9KTtcblxuICAgIC8vIDUuIFJldHVybiBzdWJzZXRcbiAgICByZXR1cm4gc3Vic2V0O1xufVxuXG4vKipcbiAqIFRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIGV4dHJhY3RzIHRoZSB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgbmFtZWRcbiAqIHByb3BlcnR5IGZyb20gdGhlIHByb3ZpZGVkIG9wdGlvbnMgb2JqZWN0LCBjb252ZXJ0cyBpdCB0byB0aGUgcmVxdWlyZWQgdHlwZSxcbiAqIGNoZWNrcyB3aGV0aGVyIGl0IGlzIG9uZSBvZiBhIExpc3Qgb2YgYWxsb3dlZCB2YWx1ZXMsIGFuZCBmaWxscyBpbiBhIGZhbGxiYWNrXG4gKiB2YWx1ZSBpZiBuZWNlc3NhcnkuXG4gKi9cbmZ1bmN0aW9uIC8qOS4yLjkgKi9HZXRPcHRpb24ob3B0aW9ucywgcHJvcGVydHksIHR5cGUsIHZhbHVlcywgZmFsbGJhY2spIHtcbiAgICAvLyAxLiBMZXQgdmFsdWUgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgIG9wdGlvbnMgd2l0aCBhcmd1bWVudCBwcm9wZXJ0eS5cbiAgICB2YXIgdmFsdWUgPSBvcHRpb25zW3Byb3BlcnR5XTtcblxuICAgIC8vIDIuIElmIHZhbHVlIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhLiBBc3NlcnQ6IHR5cGUgaXMgXCJib29sZWFuXCIgb3IgXCJzdHJpbmdcIi5cbiAgICAgICAgLy8gYi4gSWYgdHlwZSBpcyBcImJvb2xlYW5cIiwgdGhlbiBsZXQgdmFsdWUgYmUgVG9Cb29sZWFuKHZhbHVlKS5cbiAgICAgICAgLy8gYy4gSWYgdHlwZSBpcyBcInN0cmluZ1wiLCB0aGVuIGxldCB2YWx1ZSBiZSBUb1N0cmluZyh2YWx1ZSkuXG4gICAgICAgIHZhbHVlID0gdHlwZSA9PT0gJ2Jvb2xlYW4nID8gQm9vbGVhbih2YWx1ZSkgOiB0eXBlID09PSAnc3RyaW5nJyA/IFN0cmluZyh2YWx1ZSkgOiB2YWx1ZTtcblxuICAgICAgICAvLyBkLiBJZiB2YWx1ZXMgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgICAgICBpZiAodmFsdWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIC8vIGkuIElmIHZhbHVlcyBkb2VzIG5vdCBjb250YWluIGFuIGVsZW1lbnQgZXF1YWwgdG8gdmFsdWUsIHRoZW4gdGhyb3cgYVxuICAgICAgICAgICAgLy8gICAgUmFuZ2VFcnJvciBleGNlcHRpb24uXG4gICAgICAgICAgICBpZiAoYXJySW5kZXhPZi5jYWxsKHZhbHVlcywgdmFsdWUpID09PSAtMSkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCInXCIgKyB2YWx1ZSArIFwiJyBpcyBub3QgYW4gYWxsb3dlZCB2YWx1ZSBmb3IgYFwiICsgcHJvcGVydHkgKyAnYCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZS4gUmV0dXJuIHZhbHVlLlxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIC8vIEVsc2UgcmV0dXJuIGZhbGxiYWNrLlxuICAgIHJldHVybiBmYWxsYmFjaztcbn1cblxuLyoqXG4gKiBUaGUgR2V0TnVtYmVyT3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvbiBleHRyYWN0cyBhIHByb3BlcnR5IHZhbHVlIGZyb20gdGhlXG4gKiBwcm92aWRlZCBvcHRpb25zIG9iamVjdCwgY29udmVydHMgaXQgdG8gYSBOdW1iZXIgdmFsdWUsIGNoZWNrcyB3aGV0aGVyIGl0IGlzXG4gKiBpbiB0aGUgYWxsb3dlZCByYW5nZSwgYW5kIGZpbGxzIGluIGEgZmFsbGJhY2sgdmFsdWUgaWYgbmVjZXNzYXJ5LlxuICovXG5mdW5jdGlvbiAvKiA5LjIuMTAgKi9HZXROdW1iZXJPcHRpb24ob3B0aW9ucywgcHJvcGVydHksIG1pbmltdW0sIG1heGltdW0sIGZhbGxiYWNrKSB7XG4gICAgLy8gMS4gTGV0IHZhbHVlIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICBvcHRpb25zIHdpdGggYXJndW1lbnQgcHJvcGVydHkuXG4gICAgdmFyIHZhbHVlID0gb3B0aW9uc1twcm9wZXJ0eV07XG5cbiAgICAvLyAyLiBJZiB2YWx1ZSBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gTGV0IHZhbHVlIGJlIFRvTnVtYmVyKHZhbHVlKS5cbiAgICAgICAgdmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXG4gICAgICAgIC8vIGIuIElmIHZhbHVlIGlzIE5hTiBvciBsZXNzIHRoYW4gbWluaW11bSBvciBncmVhdGVyIHRoYW4gbWF4aW11bSwgdGhyb3cgYVxuICAgICAgICAvLyAgICBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA8IG1pbmltdW0gfHwgdmFsdWUgPiBtYXhpbXVtKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVmFsdWUgaXMgbm90IGEgbnVtYmVyIG9yIG91dHNpZGUgYWNjZXB0ZWQgcmFuZ2UnKTtcblxuICAgICAgICAvLyBjLiBSZXR1cm4gZmxvb3IodmFsdWUpLlxuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcih2YWx1ZSk7XG4gICAgfVxuICAgIC8vIDMuIEVsc2UgcmV0dXJuIGZhbGxiYWNrLlxuICAgIHJldHVybiBmYWxsYmFjaztcbn1cblxuLy8gOCBUaGUgSW50bCBPYmplY3RcbnZhciBJbnRsID0ge307XG5cbi8vIDguMiBGdW5jdGlvbiBQcm9wZXJ0aWVzIG9mIHRoZSBJbnRsIE9iamVjdFxuXG4vLyA4LjIuMVxuLy8gQHNwZWNbdGMzOS9lY21hNDAyL21hc3Rlci9zcGVjL2ludGwuaHRtbF1cbi8vIEBjbGF1c2Vbc2VjLWludGwuZ2V0Y2Fub25pY2FsbG9jYWxlc11cbmZ1bmN0aW9uIGdldENhbm9uaWNhbExvY2FsZXMobG9jYWxlcykge1xuICAgIC8vIDEuIExldCBsbCBiZSA/IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QobG9jYWxlcykuXG4gICAgdmFyIGxsID0gQ2Fub25pY2FsaXplTG9jYWxlTGlzdChsb2NhbGVzKTtcbiAgICAvLyAyLiBSZXR1cm4gQ3JlYXRlQXJyYXlGcm9tTGlzdChsbCkuXG4gICAge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG5cbiAgICAgICAgdmFyIGxlbiA9IGxsLmxlbmd0aDtcbiAgICAgICAgdmFyIGsgPSAwO1xuXG4gICAgICAgIHdoaWxlIChrIDwgbGVuKSB7XG4gICAgICAgICAgICByZXN1bHRba10gPSBsbFtrXTtcbiAgICAgICAgICAgIGsrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGwsICdnZXRDYW5vbmljYWxMb2NhbGVzJywge1xuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZ2V0Q2Fub25pY2FsTG9jYWxlc1xufSk7XG5cbi8vIEN1cnJlbmN5IG1pbm9yIHVuaXRzIG91dHB1dCBmcm9tIGdldC00MjE3IGdydW50IHRhc2ssIGZvcm1hdHRlZFxudmFyIGN1cnJlbmN5TWlub3JVbml0cyA9IHtcbiAgICBCSEQ6IDMsIEJZUjogMCwgWE9GOiAwLCBCSUY6IDAsIFhBRjogMCwgQ0xGOiA0LCBDTFA6IDAsIEtNRjogMCwgREpGOiAwLFxuICAgIFhQRjogMCwgR05GOiAwLCBJU0s6IDAsIElRRDogMywgSlBZOiAwLCBKT0Q6IDMsIEtSVzogMCwgS1dEOiAzLCBMWUQ6IDMsXG4gICAgT01SOiAzLCBQWUc6IDAsIFJXRjogMCwgVE5EOiAzLCBVR1g6IDAsIFVZSTogMCwgVlVWOiAwLCBWTkQ6IDBcbn07XG5cbi8vIERlZmluZSB0aGUgTnVtYmVyRm9ybWF0IGNvbnN0cnVjdG9yIGludGVybmFsbHkgc28gaXQgY2Fubm90IGJlIHRhaW50ZWRcbmZ1bmN0aW9uIE51bWJlckZvcm1hdENvbnN0cnVjdG9yKCkge1xuICAgIHZhciBsb2NhbGVzID0gYXJndW1lbnRzWzBdO1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuXG4gICAgaWYgKCF0aGlzIHx8IHRoaXMgPT09IEludGwpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBJbnRsLk51bWJlckZvcm1hdChsb2NhbGVzLCBvcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gSW5pdGlhbGl6ZU51bWJlckZvcm1hdCh0b09iamVjdCh0aGlzKSwgbG9jYWxlcywgb3B0aW9ucyk7XG59XG5cbmRlZmluZVByb3BlcnR5KEludGwsICdOdW1iZXJGb3JtYXQnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBOdW1iZXJGb3JtYXRDb25zdHJ1Y3RvclxufSk7XG5cbi8vIE11c3QgZXhwbGljaXRseSBzZXQgcHJvdG90eXBlcyBhcyB1bndyaXRhYmxlXG5kZWZpbmVQcm9wZXJ0eShJbnRsLk51bWJlckZvcm1hdCwgJ3Byb3RvdHlwZScsIHtcbiAgICB3cml0YWJsZTogZmFsc2Vcbn0pO1xuXG4vKipcbiAqIFRoZSBhYnN0cmFjdCBvcGVyYXRpb24gSW5pdGlhbGl6ZU51bWJlckZvcm1hdCBhY2NlcHRzIHRoZSBhcmd1bWVudHNcbiAqIG51bWJlckZvcm1hdCAod2hpY2ggbXVzdCBiZSBhbiBvYmplY3QpLCBsb2NhbGVzLCBhbmQgb3B0aW9ucy4gSXQgaW5pdGlhbGl6ZXNcbiAqIG51bWJlckZvcm1hdCBhcyBhIE51bWJlckZvcm1hdCBvYmplY3QuXG4gKi9cbmZ1bmN0aW9uIC8qMTEuMS4xLjEgKi9Jbml0aWFsaXplTnVtYmVyRm9ybWF0KG51bWJlckZvcm1hdCwgbG9jYWxlcywgb3B0aW9ucykge1xuICAgIC8vIFRoaXMgd2lsbCBiZSBhIGludGVybmFsIHByb3BlcnRpZXMgb2JqZWN0IGlmIHdlJ3JlIG5vdCBhbHJlYWR5IGluaXRpYWxpemVkXG4gICAgdmFyIGludGVybmFsID0gZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKG51bWJlckZvcm1hdCk7XG5cbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHdob3NlIHByb3BzIGNhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIHZhbHVlcyBvZiBSZWdFeHAgcHJvcHNcbiAgICB2YXIgcmVnZXhwUmVzdG9yZSA9IGNyZWF0ZVJlZ0V4cFJlc3RvcmUoKTtcblxuICAgIC8vIDEuIElmIG51bWJlckZvcm1hdCBoYXMgYW4gW1tpbml0aWFsaXplZEludGxPYmplY3RdXSBpbnRlcm5hbCBwcm9wZXJ0eSB3aXRoXG4gICAgLy8gdmFsdWUgdHJ1ZSwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIGlmIChpbnRlcm5hbFsnW1tpbml0aWFsaXplZEludGxPYmplY3RdXSddID09PSB0cnVlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2Agb2JqZWN0IGhhcyBhbHJlYWR5IGJlZW4gaW5pdGlhbGl6ZWQgYXMgYW4gSW50bCBvYmplY3QnKTtcblxuICAgIC8vIE5lZWQgdGhpcyB0byBhY2Nlc3MgdGhlIGBpbnRlcm5hbGAgb2JqZWN0XG4gICAgZGVmaW5lUHJvcGVydHkobnVtYmVyRm9ybWF0LCAnX19nZXRJbnRlcm5hbFByb3BlcnRpZXMnLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZSgpIHtcbiAgICAgICAgICAgIC8vIE5PVEU6IE5vbi1zdGFuZGFyZCwgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzWzBdID09PSBzZWNyZXQpIHJldHVybiBpbnRlcm5hbDtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gMi4gU2V0IHRoZSBbW2luaXRpYWxpemVkSW50bE9iamVjdF1dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdCB0byB0cnVlLlxuICAgIGludGVybmFsWydbW2luaXRpYWxpemVkSW50bE9iamVjdF1dJ10gPSB0cnVlO1xuXG4gICAgLy8gMy4gTGV0IHJlcXVlc3RlZExvY2FsZXMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBDYW5vbmljYWxpemVMb2NhbGVMaXN0XG4gICAgLy8gICAgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi4xKSB3aXRoIGFyZ3VtZW50IGxvY2FsZXMuXG4gICAgdmFyIHJlcXVlc3RlZExvY2FsZXMgPSBDYW5vbmljYWxpemVMb2NhbGVMaXN0KGxvY2FsZXMpO1xuXG4gICAgLy8gNC4gSWYgb3B0aW9ucyBpcyB1bmRlZmluZWQsIHRoZW5cbiAgICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAvLyBhLiBMZXQgb3B0aW9ucyBiZSB0aGUgcmVzdWx0IG9mIGNyZWF0aW5nIGEgbmV3IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAgICAgLy8gZXhwcmVzc2lvbiBuZXcgT2JqZWN0KCkgd2hlcmUgT2JqZWN0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvclxuICAgICAgICAvLyB3aXRoIHRoYXQgbmFtZS5cbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuXG4gICAgICAgIC8vIDUuIEVsc2VcbiAgICBlbHNlXG4gICAgICAgIC8vIGEuIExldCBvcHRpb25zIGJlIFRvT2JqZWN0KG9wdGlvbnMpLlxuICAgICAgICBvcHRpb25zID0gdG9PYmplY3Qob3B0aW9ucyk7XG5cbiAgICAvLyA2LiBMZXQgb3B0IGJlIGEgbmV3IFJlY29yZC5cbiAgICB2YXIgb3B0ID0gbmV3IFJlY29yZCgpLFxuXG5cbiAgICAvLyA3LiBMZXQgbWF0Y2hlciBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb25cbiAgICAvLyAgICAoZGVmaW5lZCBpbiA5LjIuOSkgd2l0aCB0aGUgYXJndW1lbnRzIG9wdGlvbnMsIFwibG9jYWxlTWF0Y2hlclwiLCBcInN0cmluZ1wiLFxuICAgIC8vICAgIGEgTGlzdCBjb250YWluaW5nIHRoZSB0d28gU3RyaW5nIHZhbHVlcyBcImxvb2t1cFwiIGFuZCBcImJlc3QgZml0XCIsIGFuZFxuICAgIC8vICAgIFwiYmVzdCBmaXRcIi5cbiAgICBtYXRjaGVyID0gR2V0T3B0aW9uKG9wdGlvbnMsICdsb2NhbGVNYXRjaGVyJywgJ3N0cmluZycsIG5ldyBMaXN0KCdsb29rdXAnLCAnYmVzdCBmaXQnKSwgJ2Jlc3QgZml0Jyk7XG5cbiAgICAvLyA4LiBTZXQgb3B0LltbbG9jYWxlTWF0Y2hlcl1dIHRvIG1hdGNoZXIuXG4gICAgb3B0WydbW2xvY2FsZU1hdGNoZXJdXSddID0gbWF0Y2hlcjtcblxuICAgIC8vIDkuIExldCBOdW1iZXJGb3JtYXQgYmUgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIG9iamVjdCB0aGF0IGlzIHRoZSBpbml0aWFsIHZhbHVlXG4gICAgLy8gICAgb2YgSW50bC5OdW1iZXJGb3JtYXQuXG4gICAgLy8gMTAuIExldCBsb2NhbGVEYXRhIGJlIHRoZSB2YWx1ZSBvZiB0aGUgW1tsb2NhbGVEYXRhXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAvLyAgICAgTnVtYmVyRm9ybWF0LlxuICAgIHZhciBsb2NhbGVEYXRhID0gaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1tsb2NhbGVEYXRhXV0nXTtcblxuICAgIC8vIDExLiBMZXQgciBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFJlc29sdmVMb2NhbGUgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgIChkZWZpbmVkIGluIDkuMi41KSB3aXRoIHRoZSBbW2F2YWlsYWJsZUxvY2FsZXNdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZlxuICAgIC8vICAgICBOdW1iZXJGb3JtYXQsIHJlcXVlc3RlZExvY2FsZXMsIG9wdCwgdGhlIFtbcmVsZXZhbnRFeHRlbnNpb25LZXlzXV1cbiAgICAvLyAgICAgaW50ZXJuYWwgcHJvcGVydHkgb2YgTnVtYmVyRm9ybWF0LCBhbmQgbG9jYWxlRGF0YS5cbiAgICB2YXIgciA9IFJlc29sdmVMb2NhbGUoaW50ZXJuYWxzLk51bWJlckZvcm1hdFsnW1thdmFpbGFibGVMb2NhbGVzXV0nXSwgcmVxdWVzdGVkTG9jYWxlcywgb3B0LCBpbnRlcm5hbHMuTnVtYmVyRm9ybWF0WydbW3JlbGV2YW50RXh0ZW5zaW9uS2V5c11dJ10sIGxvY2FsZURhdGEpO1xuXG4gICAgLy8gMTIuIFNldCB0aGUgW1tsb2NhbGVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gdGhlIHZhbHVlIG9mXG4gICAgLy8gICAgIHIuW1tsb2NhbGVdXS5cbiAgICBpbnRlcm5hbFsnW1tsb2NhbGVdXSddID0gclsnW1tsb2NhbGVdXSddO1xuXG4gICAgLy8gMTMuIFNldCB0aGUgW1tudW1iZXJpbmdTeXN0ZW1dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gdGhlIHZhbHVlXG4gICAgLy8gICAgIG9mIHIuW1tudV1dLlxuICAgIGludGVybmFsWydbW251bWJlcmluZ1N5c3RlbV1dJ10gPSByWydbW251XV0nXTtcblxuICAgIC8vIFRoZSBzcGVjaWZpY2F0aW9uIGRvZXNuJ3QgdGVsbCB1cyB0byBkbyB0aGlzLCBidXQgaXQncyBoZWxwZnVsIGxhdGVyIG9uXG4gICAgaW50ZXJuYWxbJ1tbZGF0YUxvY2FsZV1dJ10gPSByWydbW2RhdGFMb2NhbGVdXSddO1xuXG4gICAgLy8gMTQuIExldCBkYXRhTG9jYWxlIGJlIHRoZSB2YWx1ZSBvZiByLltbZGF0YUxvY2FsZV1dLlxuICAgIHZhciBkYXRhTG9jYWxlID0gclsnW1tkYXRhTG9jYWxlXV0nXTtcblxuICAgIC8vIDE1LiBMZXQgcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gd2l0aCB0aGVcbiAgICAvLyAgICAgYXJndW1lbnRzIG9wdGlvbnMsIFwic3R5bGVcIiwgXCJzdHJpbmdcIiwgYSBMaXN0IGNvbnRhaW5pbmcgdGhlIHRocmVlIFN0cmluZ1xuICAgIC8vICAgICB2YWx1ZXMgXCJkZWNpbWFsXCIsIFwicGVyY2VudFwiLCBhbmQgXCJjdXJyZW5jeVwiLCBhbmQgXCJkZWNpbWFsXCIuXG4gICAgdmFyIHMgPSBHZXRPcHRpb24ob3B0aW9ucywgJ3N0eWxlJywgJ3N0cmluZycsIG5ldyBMaXN0KCdkZWNpbWFsJywgJ3BlcmNlbnQnLCAnY3VycmVuY3knKSwgJ2RlY2ltYWwnKTtcblxuICAgIC8vIDE2LiBTZXQgdGhlIFtbc3R5bGVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gcy5cbiAgICBpbnRlcm5hbFsnW1tzdHlsZV1dJ10gPSBzO1xuXG4gICAgLy8gMTcuIExldCBjIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0T3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvbiB3aXRoIHRoZVxuICAgIC8vICAgICBhcmd1bWVudHMgb3B0aW9ucywgXCJjdXJyZW5jeVwiLCBcInN0cmluZ1wiLCB1bmRlZmluZWQsIGFuZCB1bmRlZmluZWQuXG4gICAgdmFyIGMgPSBHZXRPcHRpb24ob3B0aW9ucywgJ2N1cnJlbmN5JywgJ3N0cmluZycpO1xuXG4gICAgLy8gMTguIElmIGMgaXMgbm90IHVuZGVmaW5lZCBhbmQgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZVxuICAgIC8vICAgICBJc1dlbGxGb3JtZWRDdXJyZW5jeUNvZGUgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDYuMy4xKSB3aXRoXG4gICAgLy8gICAgIGFyZ3VtZW50IGMgaXMgZmFsc2UsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgICBpZiAoYyAhPT0gdW5kZWZpbmVkICYmICFJc1dlbGxGb3JtZWRDdXJyZW5jeUNvZGUoYykpIHRocm93IG5ldyBSYW5nZUVycm9yKFwiJ1wiICsgYyArIFwiJyBpcyBub3QgYSB2YWxpZCBjdXJyZW5jeSBjb2RlXCIpO1xuXG4gICAgLy8gMTkuIElmIHMgaXMgXCJjdXJyZW5jeVwiIGFuZCBjIGlzIHVuZGVmaW5lZCwgdGhyb3cgYSBUeXBlRXJyb3IgZXhjZXB0aW9uLlxuICAgIGlmIChzID09PSAnY3VycmVuY3knICYmIGMgPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IFR5cGVFcnJvcignQ3VycmVuY3kgY29kZSBpcyByZXF1aXJlZCB3aGVuIHN0eWxlIGlzIGN1cnJlbmN5Jyk7XG5cbiAgICB2YXIgY0RpZ2l0cyA9IHZvaWQgMDtcblxuICAgIC8vIDIwLiBJZiBzIGlzIFwiY3VycmVuY3lcIiwgdGhlblxuICAgIGlmIChzID09PSAnY3VycmVuY3knKSB7XG4gICAgICAgIC8vIGEuIExldCBjIGJlIHRoZSByZXN1bHQgb2YgY29udmVydGluZyBjIHRvIHVwcGVyIGNhc2UgYXMgc3BlY2lmaWVkIGluIDYuMS5cbiAgICAgICAgYyA9IGMudG9VcHBlckNhc2UoKTtcblxuICAgICAgICAvLyBiLiBTZXQgdGhlIFtbY3VycmVuY3ldXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gYy5cbiAgICAgICAgaW50ZXJuYWxbJ1tbY3VycmVuY3ldXSddID0gYztcblxuICAgICAgICAvLyBjLiBMZXQgY0RpZ2l0cyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEN1cnJlbmN5RGlnaXRzIGFic3RyYWN0XG4gICAgICAgIC8vICAgIG9wZXJhdGlvbiAoZGVmaW5lZCBiZWxvdykgd2l0aCBhcmd1bWVudCBjLlxuICAgICAgICBjRGlnaXRzID0gQ3VycmVuY3lEaWdpdHMoYyk7XG4gICAgfVxuXG4gICAgLy8gMjEuIExldCBjZCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gd2l0aCB0aGVcbiAgICAvLyAgICAgYXJndW1lbnRzIG9wdGlvbnMsIFwiY3VycmVuY3lEaXNwbGF5XCIsIFwic3RyaW5nXCIsIGEgTGlzdCBjb250YWluaW5nIHRoZVxuICAgIC8vICAgICB0aHJlZSBTdHJpbmcgdmFsdWVzIFwiY29kZVwiLCBcInN5bWJvbFwiLCBhbmQgXCJuYW1lXCIsIGFuZCBcInN5bWJvbFwiLlxuICAgIHZhciBjZCA9IEdldE9wdGlvbihvcHRpb25zLCAnY3VycmVuY3lEaXNwbGF5JywgJ3N0cmluZycsIG5ldyBMaXN0KCdjb2RlJywgJ3N5bWJvbCcsICduYW1lJyksICdzeW1ib2wnKTtcblxuICAgIC8vIDIyLiBJZiBzIGlzIFwiY3VycmVuY3lcIiwgdGhlbiBzZXQgdGhlIFtbY3VycmVuY3lEaXNwbGF5XV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAvLyAgICAgbnVtYmVyRm9ybWF0IHRvIGNkLlxuICAgIGlmIChzID09PSAnY3VycmVuY3knKSBpbnRlcm5hbFsnW1tjdXJyZW5jeURpc3BsYXldXSddID0gY2Q7XG5cbiAgICAvLyAyMy4gTGV0IG1uaWQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXROdW1iZXJPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgIChkZWZpbmVkIGluIDkuMi4xMCkgd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJtaW5pbXVtSW50ZWdlckRpZ2l0c1wiLCAxLCAyMSxcbiAgICAvLyAgICAgYW5kIDEuXG4gICAgdmFyIG1uaWQgPSBHZXROdW1iZXJPcHRpb24ob3B0aW9ucywgJ21pbmltdW1JbnRlZ2VyRGlnaXRzJywgMSwgMjEsIDEpO1xuXG4gICAgLy8gMjQuIFNldCB0aGUgW1ttaW5pbXVtSW50ZWdlckRpZ2l0c11dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdCB0byBtbmlkLlxuICAgIGludGVybmFsWydbW21pbmltdW1JbnRlZ2VyRGlnaXRzXV0nXSA9IG1uaWQ7XG5cbiAgICAvLyAyNS4gSWYgcyBpcyBcImN1cnJlbmN5XCIsIHRoZW4gbGV0IG1uZmREZWZhdWx0IGJlIGNEaWdpdHM7IGVsc2UgbGV0IG1uZmREZWZhdWx0XG4gICAgLy8gICAgIGJlIDAuXG4gICAgdmFyIG1uZmREZWZhdWx0ID0gcyA9PT0gJ2N1cnJlbmN5JyA/IGNEaWdpdHMgOiAwO1xuXG4gICAgLy8gMjYuIExldCBtbmZkIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgR2V0TnVtYmVyT3B0aW9uIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgICB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcIm1pbmltdW1GcmFjdGlvbkRpZ2l0c1wiLCAwLCAyMCwgYW5kIG1uZmREZWZhdWx0LlxuICAgIHZhciBtbmZkID0gR2V0TnVtYmVyT3B0aW9uKG9wdGlvbnMsICdtaW5pbXVtRnJhY3Rpb25EaWdpdHMnLCAwLCAyMCwgbW5mZERlZmF1bHQpO1xuXG4gICAgLy8gMjcuIFNldCB0aGUgW1ttaW5pbXVtRnJhY3Rpb25EaWdpdHNdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gbW5mZC5cbiAgICBpbnRlcm5hbFsnW1ttaW5pbXVtRnJhY3Rpb25EaWdpdHNdXSddID0gbW5mZDtcblxuICAgIC8vIDI4LiBJZiBzIGlzIFwiY3VycmVuY3lcIiwgdGhlbiBsZXQgbXhmZERlZmF1bHQgYmUgbWF4KG1uZmQsIGNEaWdpdHMpOyBlbHNlIGlmIHNcbiAgICAvLyAgICAgaXMgXCJwZXJjZW50XCIsIHRoZW4gbGV0IG14ZmREZWZhdWx0IGJlIG1heChtbmZkLCAwKTsgZWxzZSBsZXQgbXhmZERlZmF1bHRcbiAgICAvLyAgICAgYmUgbWF4KG1uZmQsIDMpLlxuICAgIHZhciBteGZkRGVmYXVsdCA9IHMgPT09ICdjdXJyZW5jeScgPyBNYXRoLm1heChtbmZkLCBjRGlnaXRzKSA6IHMgPT09ICdwZXJjZW50JyA/IE1hdGgubWF4KG1uZmQsIDApIDogTWF0aC5tYXgobW5mZCwgMyk7XG5cbiAgICAvLyAyOS4gTGV0IG14ZmQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXROdW1iZXJPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwibWF4aW11bUZyYWN0aW9uRGlnaXRzXCIsIG1uZmQsIDIwLCBhbmQgbXhmZERlZmF1bHQuXG4gICAgdmFyIG14ZmQgPSBHZXROdW1iZXJPcHRpb24ob3B0aW9ucywgJ21heGltdW1GcmFjdGlvbkRpZ2l0cycsIG1uZmQsIDIwLCBteGZkRGVmYXVsdCk7XG5cbiAgICAvLyAzMC4gU2V0IHRoZSBbW21heGltdW1GcmFjdGlvbkRpZ2l0c11dIGludGVybmFsIHByb3BlcnR5IG9mIG51bWJlckZvcm1hdCB0byBteGZkLlxuICAgIGludGVybmFsWydbW21heGltdW1GcmFjdGlvbkRpZ2l0c11dJ10gPSBteGZkO1xuXG4gICAgLy8gMzEuIExldCBtbnNkIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2Ygb3B0aW9uc1xuICAgIC8vICAgICB3aXRoIGFyZ3VtZW50IFwibWluaW11bVNpZ25pZmljYW50RGlnaXRzXCIuXG4gICAgdmFyIG1uc2QgPSBvcHRpb25zLm1pbmltdW1TaWduaWZpY2FudERpZ2l0cztcblxuICAgIC8vIDMyLiBMZXQgbXhzZCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnNcbiAgICAvLyAgICAgd2l0aCBhcmd1bWVudCBcIm1heGltdW1TaWduaWZpY2FudERpZ2l0c1wiLlxuICAgIHZhciBteHNkID0gb3B0aW9ucy5tYXhpbXVtU2lnbmlmaWNhbnREaWdpdHM7XG5cbiAgICAvLyAzMy4gSWYgbW5zZCBpcyBub3QgdW5kZWZpbmVkIG9yIG14c2QgaXMgbm90IHVuZGVmaW5lZCwgdGhlbjpcbiAgICBpZiAobW5zZCAhPT0gdW5kZWZpbmVkIHx8IG14c2QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhLiBMZXQgbW5zZCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE51bWJlck9wdGlvbiBhYnN0cmFjdFxuICAgICAgICAvLyAgICBvcGVyYXRpb24gd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJtaW5pbXVtU2lnbmlmaWNhbnREaWdpdHNcIiwgMSwgMjEsXG4gICAgICAgIC8vICAgIGFuZCAxLlxuICAgICAgICBtbnNkID0gR2V0TnVtYmVyT3B0aW9uKG9wdGlvbnMsICdtaW5pbXVtU2lnbmlmaWNhbnREaWdpdHMnLCAxLCAyMSwgMSk7XG5cbiAgICAgICAgLy8gYi4gTGV0IG14c2QgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXROdW1iZXJPcHRpb24gYWJzdHJhY3RcbiAgICAgICAgLy8gICAgIG9wZXJhdGlvbiB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcIm1heGltdW1TaWduaWZpY2FudERpZ2l0c1wiLCBtbnNkLFxuICAgICAgICAvLyAgICAgMjEsIGFuZCAyMS5cbiAgICAgICAgbXhzZCA9IEdldE51bWJlck9wdGlvbihvcHRpb25zLCAnbWF4aW11bVNpZ25pZmljYW50RGlnaXRzJywgbW5zZCwgMjEsIDIxKTtcblxuICAgICAgICAvLyBjLiBTZXQgdGhlIFtbbWluaW11bVNpZ25pZmljYW50RGlnaXRzXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0XG4gICAgICAgIC8vICAgIHRvIG1uc2QsIGFuZCB0aGUgW1ttYXhpbXVtU2lnbmlmaWNhbnREaWdpdHNdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZlxuICAgICAgICAvLyAgICBudW1iZXJGb3JtYXQgdG8gbXhzZC5cbiAgICAgICAgaW50ZXJuYWxbJ1tbbWluaW11bVNpZ25pZmljYW50RGlnaXRzXV0nXSA9IG1uc2Q7XG4gICAgICAgIGludGVybmFsWydbW21heGltdW1TaWduaWZpY2FudERpZ2l0c11dJ10gPSBteHNkO1xuICAgIH1cbiAgICAvLyAzNC4gTGV0IGcgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIHdpdGggdGhlXG4gICAgLy8gICAgIGFyZ3VtZW50cyBvcHRpb25zLCBcInVzZUdyb3VwaW5nXCIsIFwiYm9vbGVhblwiLCB1bmRlZmluZWQsIGFuZCB0cnVlLlxuICAgIHZhciBnID0gR2V0T3B0aW9uKG9wdGlvbnMsICd1c2VHcm91cGluZycsICdib29sZWFuJywgdW5kZWZpbmVkLCB0cnVlKTtcblxuICAgIC8vIDM1LiBTZXQgdGhlIFtbdXNlR3JvdXBpbmddXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gZy5cbiAgICBpbnRlcm5hbFsnW1t1c2VHcm91cGluZ11dJ10gPSBnO1xuXG4gICAgLy8gMzYuIExldCBkYXRhTG9jYWxlRGF0YSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgIGxvY2FsZURhdGEgd2l0aCBhcmd1bWVudCBkYXRhTG9jYWxlLlxuICAgIHZhciBkYXRhTG9jYWxlRGF0YSA9IGxvY2FsZURhdGFbZGF0YUxvY2FsZV07XG5cbiAgICAvLyAzNy4gTGV0IHBhdHRlcm5zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICAgZGF0YUxvY2FsZURhdGEgd2l0aCBhcmd1bWVudCBcInBhdHRlcm5zXCIuXG4gICAgdmFyIHBhdHRlcm5zID0gZGF0YUxvY2FsZURhdGEucGF0dGVybnM7XG5cbiAgICAvLyAzOC4gQXNzZXJ0OiBwYXR0ZXJucyBpcyBhbiBvYmplY3QgKHNlZSAxMS4yLjMpXG5cbiAgICAvLyAzOS4gTGV0IHN0eWxlUGF0dGVybnMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgIC8vICAgICBwYXR0ZXJucyB3aXRoIGFyZ3VtZW50IHMuXG4gICAgdmFyIHN0eWxlUGF0dGVybnMgPSBwYXR0ZXJuc1tzXTtcblxuICAgIC8vIDQwLiBTZXQgdGhlIFtbcG9zaXRpdmVQYXR0ZXJuXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHRoZVxuICAgIC8vICAgICByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2Ygc3R5bGVQYXR0ZXJucyB3aXRoIHRoZVxuICAgIC8vICAgICBhcmd1bWVudCBcInBvc2l0aXZlUGF0dGVyblwiLlxuICAgIGludGVybmFsWydbW3Bvc2l0aXZlUGF0dGVybl1dJ10gPSBzdHlsZVBhdHRlcm5zLnBvc2l0aXZlUGF0dGVybjtcblxuICAgIC8vIDQxLiBTZXQgdGhlIFtbbmVnYXRpdmVQYXR0ZXJuXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgbnVtYmVyRm9ybWF0IHRvIHRoZVxuICAgIC8vICAgICByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2Ygc3R5bGVQYXR0ZXJucyB3aXRoIHRoZVxuICAgIC8vICAgICBhcmd1bWVudCBcIm5lZ2F0aXZlUGF0dGVyblwiLlxuICAgIGludGVybmFsWydbW25lZ2F0aXZlUGF0dGVybl1dJ10gPSBzdHlsZVBhdHRlcm5zLm5lZ2F0aXZlUGF0dGVybjtcblxuICAgIC8vIDQyLiBTZXQgdGhlIFtbYm91bmRGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gdW5kZWZpbmVkLlxuICAgIGludGVybmFsWydbW2JvdW5kRm9ybWF0XV0nXSA9IHVuZGVmaW5lZDtcblxuICAgIC8vIDQzLiBTZXQgdGhlIFtbaW5pdGlhbGl6ZWROdW1iZXJGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG9cbiAgICAvLyAgICAgdHJ1ZS5cbiAgICBpbnRlcm5hbFsnW1tpbml0aWFsaXplZE51bWJlckZvcm1hdF1dJ10gPSB0cnVlO1xuXG4gICAgLy8gSW4gRVMzLCB3ZSBuZWVkIHRvIHByZS1iaW5kIHRoZSBmb3JtYXQoKSBmdW5jdGlvblxuICAgIGlmIChlczMpIG51bWJlckZvcm1hdC5mb3JtYXQgPSBHZXRGb3JtYXROdW1iZXIuY2FsbChudW1iZXJGb3JtYXQpO1xuXG4gICAgLy8gUmVzdG9yZSB0aGUgUmVnRXhwIHByb3BlcnRpZXNcbiAgICByZWdleHBSZXN0b3JlKCk7XG5cbiAgICAvLyBSZXR1cm4gdGhlIG5ld2x5IGluaXRpYWxpc2VkIG9iamVjdFxuICAgIHJldHVybiBudW1iZXJGb3JtYXQ7XG59XG5cbmZ1bmN0aW9uIEN1cnJlbmN5RGlnaXRzKGN1cnJlbmN5KSB7XG4gICAgLy8gV2hlbiB0aGUgQ3VycmVuY3lEaWdpdHMgYWJzdHJhY3Qgb3BlcmF0aW9uIGlzIGNhbGxlZCB3aXRoIGFuIGFyZ3VtZW50IGN1cnJlbmN5XG4gICAgLy8gKHdoaWNoIG11c3QgYmUgYW4gdXBwZXIgY2FzZSBTdHJpbmcgdmFsdWUpLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcblxuICAgIC8vIDEuIElmIHRoZSBJU08gNDIxNyBjdXJyZW5jeSBhbmQgZnVuZHMgY29kZSBsaXN0IGNvbnRhaW5zIGN1cnJlbmN5IGFzIGFuXG4gICAgLy8gYWxwaGFiZXRpYyBjb2RlLCB0aGVuIHJldHVybiB0aGUgbWlub3IgdW5pdCB2YWx1ZSBjb3JyZXNwb25kaW5nIHRvIHRoZVxuICAgIC8vIGN1cnJlbmN5IGZyb20gdGhlIGxpc3Q7IGVsc2UgcmV0dXJuIDIuXG4gICAgcmV0dXJuIGN1cnJlbmN5TWlub3JVbml0c1tjdXJyZW5jeV0gIT09IHVuZGVmaW5lZCA/IGN1cnJlbmN5TWlub3JVbml0c1tjdXJyZW5jeV0gOiAyO1xufVxuXG4vKiAxMS4yLjMgKi9pbnRlcm5hbHMuTnVtYmVyRm9ybWF0ID0ge1xuICAgICdbW2F2YWlsYWJsZUxvY2FsZXNdXSc6IFtdLFxuICAgICdbW3JlbGV2YW50RXh0ZW5zaW9uS2V5c11dJzogWydudSddLFxuICAgICdbW2xvY2FsZURhdGFdXSc6IHt9XG59O1xuXG4vKipcbiAqIFdoZW4gdGhlIHN1cHBvcnRlZExvY2FsZXNPZiBtZXRob2Qgb2YgSW50bC5OdW1iZXJGb3JtYXQgaXMgY2FsbGVkLCB0aGVcbiAqIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbi8qIDExLjIuMiAqL1xuZGVmaW5lUHJvcGVydHkoSW50bC5OdW1iZXJGb3JtYXQsICdzdXBwb3J0ZWRMb2NhbGVzT2YnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBmbkJpbmQuY2FsbChmdW5jdGlvbiAobG9jYWxlcykge1xuICAgICAgICAvLyBCb3VuZCBmdW5jdGlvbnMgb25seSBoYXZlIHRoZSBgdGhpc2AgdmFsdWUgYWx0ZXJlZCBpZiBiZWluZyB1c2VkIGFzIGEgY29uc3RydWN0b3IsXG4gICAgICAgIC8vIHRoaXMgbGV0cyB1cyBpbWl0YXRlIGEgbmF0aXZlIGZ1bmN0aW9uIHRoYXQgaGFzIG5vIGNvbnN0cnVjdG9yXG4gICAgICAgIGlmICghaG9wLmNhbGwodGhpcywgJ1tbYXZhaWxhYmxlTG9jYWxlc11dJykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ3N1cHBvcnRlZExvY2FsZXNPZigpIGlzIG5vdCBhIGNvbnN0cnVjdG9yJyk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGFuIG9iamVjdCB3aG9zZSBwcm9wcyBjYW4gYmUgdXNlZCB0byByZXN0b3JlIHRoZSB2YWx1ZXMgb2YgUmVnRXhwIHByb3BzXG4gICAgICAgIHZhciByZWdleHBSZXN0b3JlID0gY3JlYXRlUmVnRXhwUmVzdG9yZSgpLFxuXG5cbiAgICAgICAgLy8gMS4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgICAgICBvcHRpb25zID0gYXJndW1lbnRzWzFdLFxuXG5cbiAgICAgICAgLy8gMi4gTGV0IGF2YWlsYWJsZUxvY2FsZXMgYmUgdGhlIHZhbHVlIG9mIHRoZSBbW2F2YWlsYWJsZUxvY2FsZXNdXSBpbnRlcm5hbFxuICAgICAgICAvLyAgICBwcm9wZXJ0eSBvZiB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gb2JqZWN0IHRoYXQgaXMgdGhlIGluaXRpYWwgdmFsdWUgb2ZcbiAgICAgICAgLy8gICAgSW50bC5OdW1iZXJGb3JtYXQuXG5cbiAgICAgICAgYXZhaWxhYmxlTG9jYWxlcyA9IHRoaXNbJ1tbYXZhaWxhYmxlTG9jYWxlc11dJ10sXG5cblxuICAgICAgICAvLyAzLiBMZXQgcmVxdWVzdGVkTG9jYWxlcyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIENhbm9uaWNhbGl6ZUxvY2FsZUxpc3RcbiAgICAgICAgLy8gICAgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkIGluIDkuMi4xKSB3aXRoIGFyZ3VtZW50IGxvY2FsZXMuXG4gICAgICAgIHJlcXVlc3RlZExvY2FsZXMgPSBDYW5vbmljYWxpemVMb2NhbGVMaXN0KGxvY2FsZXMpO1xuXG4gICAgICAgIC8vIFJlc3RvcmUgdGhlIFJlZ0V4cCBwcm9wZXJ0aWVzXG4gICAgICAgIHJlZ2V4cFJlc3RvcmUoKTtcblxuICAgICAgICAvLyA0LiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBTdXBwb3J0ZWRMb2NhbGVzIGFic3RyYWN0IG9wZXJhdGlvblxuICAgICAgICAvLyAgICAoZGVmaW5lZCBpbiA5LjIuOCkgd2l0aCBhcmd1bWVudHMgYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcyxcbiAgICAgICAgLy8gICAgYW5kIG9wdGlvbnMuXG4gICAgICAgIHJldHVybiBTdXBwb3J0ZWRMb2NhbGVzKGF2YWlsYWJsZUxvY2FsZXMsIHJlcXVlc3RlZExvY2FsZXMsIG9wdGlvbnMpO1xuICAgIH0sIGludGVybmFscy5OdW1iZXJGb3JtYXQpXG59KTtcblxuLyoqXG4gKiBUaGlzIG5hbWVkIGFjY2Vzc29yIHByb3BlcnR5IHJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGZvcm1hdHMgYSBudW1iZXJcbiAqIGFjY29yZGluZyB0byB0aGUgZWZmZWN0aXZlIGxvY2FsZSBhbmQgdGhlIGZvcm1hdHRpbmcgb3B0aW9ucyBvZiB0aGlzXG4gKiBOdW1iZXJGb3JtYXQgb2JqZWN0LlxuICovXG4vKiAxMS4zLjIgKi9kZWZpbmVQcm9wZXJ0eShJbnRsLk51bWJlckZvcm1hdC5wcm90b3R5cGUsICdmb3JtYXQnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogR2V0Rm9ybWF0TnVtYmVyXG59KTtcblxuZnVuY3Rpb24gR2V0Rm9ybWF0TnVtYmVyKCkge1xuICAgIHZhciBpbnRlcm5hbCA9IHRoaXMgIT09IG51bGwgJiYgYmFiZWxIZWxwZXJzJDFbXCJ0eXBlb2ZcIl0odGhpcykgPT09ICdvYmplY3QnICYmIGdldEludGVybmFsUHJvcGVydGllcyh0aGlzKTtcblxuICAgIC8vIFNhdGlzZnkgdGVzdCAxMS4zX2JcbiAgICBpZiAoIWludGVybmFsIHx8ICFpbnRlcm5hbFsnW1tpbml0aWFsaXplZE51bWJlckZvcm1hdF1dJ10pIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBmb3IgZm9ybWF0KCkgaXMgbm90IGFuIGluaXRpYWxpemVkIEludGwuTnVtYmVyRm9ybWF0IG9iamVjdC4nKTtcblxuICAgIC8vIFRoZSB2YWx1ZSBvZiB0aGUgW1tHZXRdXSBhdHRyaWJ1dGUgaXMgYSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSBmb2xsb3dpbmdcbiAgICAvLyBzdGVwczpcblxuICAgIC8vIDEuIElmIHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgdGhpcyBOdW1iZXJGb3JtYXQgb2JqZWN0XG4gICAgLy8gICAgaXMgdW5kZWZpbmVkLCB0aGVuOlxuICAgIGlmIChpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ10gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBhLiBMZXQgRiBiZSBhIEZ1bmN0aW9uIG9iamVjdCwgd2l0aCBpbnRlcm5hbCBwcm9wZXJ0aWVzIHNldCBhc1xuICAgICAgICAvLyAgICBzcGVjaWZpZWQgZm9yIGJ1aWx0LWluIGZ1bmN0aW9ucyBpbiBFUzUsIDE1LCBvciBzdWNjZXNzb3IsIGFuZCB0aGVcbiAgICAgICAgLy8gICAgbGVuZ3RoIHByb3BlcnR5IHNldCB0byAxLCB0aGF0IHRha2VzIHRoZSBhcmd1bWVudCB2YWx1ZSBhbmRcbiAgICAgICAgLy8gICAgcGVyZm9ybXMgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgdmFyIEYgPSBmdW5jdGlvbiBGKHZhbHVlKSB7XG4gICAgICAgICAgICAvLyBpLiBJZiB2YWx1ZSBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IHZhbHVlIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgICAgIC8vIGlpLiBMZXQgeCBiZSBUb051bWJlcih2YWx1ZSkuXG4gICAgICAgICAgICAvLyBpaWkuIFJldHVybiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEZvcm1hdE51bWJlciBhYnN0cmFjdFxuICAgICAgICAgICAgLy8gICAgICBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggYXJndW1lbnRzIHRoaXMgYW5kIHguXG4gICAgICAgICAgICByZXR1cm4gRm9ybWF0TnVtYmVyKHRoaXMsIC8qIHggPSAqL051bWJlcih2YWx1ZSkpO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIGIuIExldCBiaW5kIGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBmdW5jdGlvbiBvYmplY3QgZGVmaW5lZCBpbiBFUzUsXG4gICAgICAgIC8vICAgIDE1LjMuNC41LlxuICAgICAgICAvLyBjLiBMZXQgYmYgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0NhbGxdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgLy8gICAgYmluZCB3aXRoIEYgYXMgdGhlIHRoaXMgdmFsdWUgYW5kIGFuIGFyZ3VtZW50IGxpc3QgY29udGFpbmluZ1xuICAgICAgICAvLyAgICB0aGUgc2luZ2xlIGl0ZW0gdGhpcy5cbiAgICAgICAgdmFyIGJmID0gZm5CaW5kLmNhbGwoRiwgdGhpcyk7XG5cbiAgICAgICAgLy8gZC4gU2V0IHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgdGhpcyBOdW1iZXJGb3JtYXRcbiAgICAgICAgLy8gICAgb2JqZWN0IHRvIGJmLlxuICAgICAgICBpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ10gPSBiZjtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgW1tib3VuZEZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXNcbiAgICAvLyBOdW1iZXJGb3JtYXQgb2JqZWN0LlxuICAgIHJldHVybiBpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ107XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFRvUGFydHMoKSB7XG4gICAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdO1xuXG4gICAgdmFyIGludGVybmFsID0gdGhpcyAhPT0gbnVsbCAmJiBiYWJlbEhlbHBlcnMkMVtcInR5cGVvZlwiXSh0aGlzKSA9PT0gJ29iamVjdCcgJiYgZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzKHRoaXMpO1xuICAgIGlmICghaW50ZXJuYWwgfHwgIWludGVybmFsWydbW2luaXRpYWxpemVkTnVtYmVyRm9ybWF0XV0nXSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIGZvciBmb3JtYXRUb1BhcnRzKCkgaXMgbm90IGFuIGluaXRpYWxpemVkIEludGwuTnVtYmVyRm9ybWF0IG9iamVjdC4nKTtcblxuICAgIHZhciB4ID0gTnVtYmVyKHZhbHVlKTtcbiAgICByZXR1cm4gRm9ybWF0TnVtYmVyVG9QYXJ0cyh0aGlzLCB4KTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KEludGwuTnVtYmVyRm9ybWF0LnByb3RvdHlwZSwgJ2Zvcm1hdFRvUGFydHMnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBmb3JtYXRUb1BhcnRzXG59KTtcblxuLypcbiAqIEBzcGVjW3N0YXNtL2VjbWE0MDIvbnVtYmVyLWZvcm1hdC10by1wYXJ0cy9zcGVjL251bWJlcmZvcm1hdC5odG1sXVxuICogQGNsYXVzZVtzZWMtZm9ybWF0bnVtYmVydG9wYXJ0c11cbiAqL1xuZnVuY3Rpb24gRm9ybWF0TnVtYmVyVG9QYXJ0cyhudW1iZXJGb3JtYXQsIHgpIHtcbiAgICAvLyAxLiBMZXQgcGFydHMgYmUgPyBQYXJ0aXRpb25OdW1iZXJQYXR0ZXJuKG51bWJlckZvcm1hdCwgeCkuXG4gICAgdmFyIHBhcnRzID0gUGFydGl0aW9uTnVtYmVyUGF0dGVybihudW1iZXJGb3JtYXQsIHgpO1xuICAgIC8vIDIuIExldCByZXN1bHQgYmUgQXJyYXlDcmVhdGUoMCkuXG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIC8vIDMuIExldCBuIGJlIDAuXG4gICAgdmFyIG4gPSAwO1xuICAgIC8vIDQuIEZvciBlYWNoIHBhcnQgaW4gcGFydHMsIGRvOlxuICAgIGZvciAodmFyIGkgPSAwOyBwYXJ0cy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBwYXJ0c1tpXTtcbiAgICAgICAgLy8gYS4gTGV0IE8gYmUgT2JqZWN0Q3JlYXRlKCVPYmplY3RQcm90b3R5cGUlKS5cbiAgICAgICAgdmFyIE8gPSB7fTtcbiAgICAgICAgLy8gYS4gUGVyZm9ybSA/IENyZWF0ZURhdGFQcm9wZXJ0eU9yVGhyb3coTywgXCJ0eXBlXCIsIHBhcnQuW1t0eXBlXV0pLlxuICAgICAgICBPLnR5cGUgPSBwYXJ0WydbW3R5cGVdXSddO1xuICAgICAgICAvLyBhLiBQZXJmb3JtID8gQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhPLCBcInZhbHVlXCIsIHBhcnQuW1t2YWx1ZV1dKS5cbiAgICAgICAgTy52YWx1ZSA9IHBhcnRbJ1tbdmFsdWVdXSddO1xuICAgICAgICAvLyBhLiBQZXJmb3JtID8gQ3JlYXRlRGF0YVByb3BlcnR5T3JUaHJvdyhyZXN1bHQsID8gVG9TdHJpbmcobiksIE8pLlxuICAgICAgICByZXN1bHRbbl0gPSBPO1xuICAgICAgICAvLyBhLiBJbmNyZW1lbnQgbiBieSAxLlxuICAgICAgICBuICs9IDE7XG4gICAgfVxuICAgIC8vIDUuIFJldHVybiByZXN1bHQuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIEBzcGVjW3N0YXNtL2VjbWE0MDIvbnVtYmVyLWZvcm1hdC10by1wYXJ0cy9zcGVjL251bWJlcmZvcm1hdC5odG1sXVxuICogQGNsYXVzZVtzZWMtcGFydGl0aW9ubnVtYmVycGF0dGVybl1cbiAqL1xuZnVuY3Rpb24gUGFydGl0aW9uTnVtYmVyUGF0dGVybihudW1iZXJGb3JtYXQsIHgpIHtcblxuICAgIHZhciBpbnRlcm5hbCA9IGdldEludGVybmFsUHJvcGVydGllcyhudW1iZXJGb3JtYXQpLFxuICAgICAgICBsb2NhbGUgPSBpbnRlcm5hbFsnW1tkYXRhTG9jYWxlXV0nXSxcbiAgICAgICAgbnVtcyA9IGludGVybmFsWydbW251bWJlcmluZ1N5c3RlbV1dJ10sXG4gICAgICAgIGRhdGEgPSBpbnRlcm5hbHMuTnVtYmVyRm9ybWF0WydbW2xvY2FsZURhdGFdXSddW2xvY2FsZV0sXG4gICAgICAgIGlsZCA9IGRhdGEuc3ltYm9sc1tudW1zXSB8fCBkYXRhLnN5bWJvbHMubGF0bixcbiAgICAgICAgcGF0dGVybiA9IHZvaWQgMDtcblxuICAgIC8vIDEuIElmIHggaXMgbm90IE5hTiBhbmQgeCA8IDAsIHRoZW46XG4gICAgaWYgKCFpc05hTih4KSAmJiB4IDwgMCkge1xuICAgICAgICAvLyBhLiBMZXQgeCBiZSAteC5cbiAgICAgICAgeCA9IC14O1xuICAgICAgICAvLyBhLiBMZXQgcGF0dGVybiBiZSB0aGUgdmFsdWUgb2YgbnVtYmVyRm9ybWF0LltbbmVnYXRpdmVQYXR0ZXJuXV0uXG4gICAgICAgIHBhdHRlcm4gPSBpbnRlcm5hbFsnW1tuZWdhdGl2ZVBhdHRlcm5dXSddO1xuICAgIH1cbiAgICAvLyAyLiBFbHNlLFxuICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gYS4gTGV0IHBhdHRlcm4gYmUgdGhlIHZhbHVlIG9mIG51bWJlckZvcm1hdC5bW3Bvc2l0aXZlUGF0dGVybl1dLlxuICAgICAgICAgICAgcGF0dGVybiA9IGludGVybmFsWydbW3Bvc2l0aXZlUGF0dGVybl1dJ107XG4gICAgICAgIH1cbiAgICAvLyAzLiBMZXQgcmVzdWx0IGJlIGEgbmV3IGVtcHR5IExpc3QuXG4gICAgdmFyIHJlc3VsdCA9IG5ldyBMaXN0KCk7XG4gICAgLy8gNC4gTGV0IGJlZ2luSW5kZXggYmUgQ2FsbCglU3RyaW5nUHJvdG9faW5kZXhPZiUsIHBhdHRlcm4sIFwie1wiLCAwKS5cbiAgICB2YXIgYmVnaW5JbmRleCA9IHBhdHRlcm4uaW5kZXhPZigneycsIDApO1xuICAgIC8vIDUuIExldCBlbmRJbmRleCBiZSAwLlxuICAgIHZhciBlbmRJbmRleCA9IDA7XG4gICAgLy8gNi4gTGV0IG5leHRJbmRleCBiZSAwLlxuICAgIHZhciBuZXh0SW5kZXggPSAwO1xuICAgIC8vIDcuIExldCBsZW5ndGggYmUgdGhlIG51bWJlciBvZiBjb2RlIHVuaXRzIGluIHBhdHRlcm4uXG4gICAgdmFyIGxlbmd0aCA9IHBhdHRlcm4ubGVuZ3RoO1xuICAgIC8vIDguIFJlcGVhdCB3aGlsZSBiZWdpbkluZGV4IGlzIGFuIGludGVnZXIgaW5kZXggaW50byBwYXR0ZXJuOlxuICAgIHdoaWxlIChiZWdpbkluZGV4ID4gLTEgJiYgYmVnaW5JbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAvLyBhLiBTZXQgZW5kSW5kZXggdG8gQ2FsbCglU3RyaW5nUHJvdG9faW5kZXhPZiUsIHBhdHRlcm4sIFwifVwiLCBiZWdpbkluZGV4KVxuICAgICAgICBlbmRJbmRleCA9IHBhdHRlcm4uaW5kZXhPZignfScsIGJlZ2luSW5kZXgpO1xuICAgICAgICAvLyBhLiBJZiBlbmRJbmRleCA9IC0xLCB0aHJvdyBuZXcgRXJyb3IgZXhjZXB0aW9uLlxuICAgICAgICBpZiAoZW5kSW5kZXggPT09IC0xKSB0aHJvdyBuZXcgRXJyb3IoKTtcbiAgICAgICAgLy8gYS4gSWYgYmVnaW5JbmRleCBpcyBncmVhdGVyIHRoYW4gbmV4dEluZGV4LCB0aGVuOlxuICAgICAgICBpZiAoYmVnaW5JbmRleCA+IG5leHRJbmRleCkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IGxpdGVyYWwgYmUgYSBzdWJzdHJpbmcgb2YgcGF0dGVybiBmcm9tIHBvc2l0aW9uIG5leHRJbmRleCwgaW5jbHVzaXZlLCB0byBwb3NpdGlvbiBiZWdpbkluZGV4LCBleGNsdXNpdmUuXG4gICAgICAgICAgICB2YXIgbGl0ZXJhbCA9IHBhdHRlcm4uc3Vic3RyaW5nKG5leHRJbmRleCwgYmVnaW5JbmRleCk7XG4gICAgICAgICAgICAvLyBpaS4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImxpdGVyYWxcIiwgW1t2YWx1ZV1dOiBsaXRlcmFsIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdsaXRlcmFsJywgJ1tbdmFsdWVdXSc6IGxpdGVyYWwgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYS4gTGV0IHAgYmUgdGhlIHN1YnN0cmluZyBvZiBwYXR0ZXJuIGZyb20gcG9zaXRpb24gYmVnaW5JbmRleCwgZXhjbHVzaXZlLCB0byBwb3NpdGlvbiBlbmRJbmRleCwgZXhjbHVzaXZlLlxuICAgICAgICB2YXIgcCA9IHBhdHRlcm4uc3Vic3RyaW5nKGJlZ2luSW5kZXggKyAxLCBlbmRJbmRleCk7XG4gICAgICAgIC8vIGEuIElmIHAgaXMgZXF1YWwgXCJudW1iZXJcIiwgdGhlbjpcbiAgICAgICAgaWYgKHAgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgIC8vIGkuIElmIHggaXMgTmFOLFxuICAgICAgICAgICAgaWYgKGlzTmFOKHgpKSB7XG4gICAgICAgICAgICAgICAgLy8gMS4gTGV0IG4gYmUgYW4gSUxEIFN0cmluZyB2YWx1ZSBpbmRpY2F0aW5nIHRoZSBOYU4gdmFsdWUuXG4gICAgICAgICAgICAgICAgdmFyIG4gPSBpbGQubmFuO1xuICAgICAgICAgICAgICAgIC8vIDIuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJuYW5cIiwgW1t2YWx1ZV1dOiBuIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbmFuJywgJ1tbdmFsdWVdXSc6IG4gfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpaS4gRWxzZSBpZiBpc0Zpbml0ZSh4KSBpcyBmYWxzZSxcbiAgICAgICAgICAgIGVsc2UgaWYgKCFpc0Zpbml0ZSh4KSkge1xuICAgICAgICAgICAgICAgICAgICAvLyAxLiBMZXQgbiBiZSBhbiBJTEQgU3RyaW5nIHZhbHVlIGluZGljYXRpbmcgaW5maW5pdHkuXG4gICAgICAgICAgICAgICAgICAgIHZhciBfbiA9IGlsZC5pbmZpbml0eTtcbiAgICAgICAgICAgICAgICAgICAgLy8gMi4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImluZmluaXR5XCIsIFtbdmFsdWVdXTogbiB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdpbmZpbml0eScsICdbW3ZhbHVlXV0nOiBfbiB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gaWlpLiBFbHNlLFxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gSWYgdGhlIHZhbHVlIG9mIG51bWJlckZvcm1hdC5bW3N0eWxlXV0gaXMgXCJwZXJjZW50XCIgYW5kIGlzRmluaXRlKHgpLCBsZXQgeCBiZSAxMDAgw5cgeC5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbFsnW1tzdHlsZV1dJ10gPT09ICdwZXJjZW50JyAmJiBpc0Zpbml0ZSh4KSkgeCAqPSAxMDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBfbjIgPSB2b2lkIDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAyLiBJZiB0aGUgbnVtYmVyRm9ybWF0LltbbWluaW11bVNpZ25pZmljYW50RGlnaXRzXV0gYW5kIG51bWJlckZvcm1hdC5bW21heGltdW1TaWduaWZpY2FudERpZ2l0c11dIGFyZSBwcmVzZW50LCB0aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaG9wLmNhbGwoaW50ZXJuYWwsICdbW21pbmltdW1TaWduaWZpY2FudERpZ2l0c11dJykgJiYgaG9wLmNhbGwoaW50ZXJuYWwsICdbW21heGltdW1TaWduaWZpY2FudERpZ2l0c11dJykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgbiBiZSBUb1Jhd1ByZWNpc2lvbih4LCBudW1iZXJGb3JtYXQuW1ttaW5pbXVtU2lnbmlmaWNhbnREaWdpdHNdXSwgbnVtYmVyRm9ybWF0LltbbWF4aW11bVNpZ25pZmljYW50RGlnaXRzXV0pLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9uMiA9IFRvUmF3UHJlY2lzaW9uKHgsIGludGVybmFsWydbW21pbmltdW1TaWduaWZpY2FudERpZ2l0c11dJ10sIGludGVybmFsWydbW21heGltdW1TaWduaWZpY2FudERpZ2l0c11dJ10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMy4gRWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgbiBiZSBUb1Jhd0ZpeGVkKHgsIG51bWJlckZvcm1hdC5bW21pbmltdW1JbnRlZ2VyRGlnaXRzXV0sIG51bWJlckZvcm1hdC5bW21pbmltdW1GcmFjdGlvbkRpZ2l0c11dLCBudW1iZXJGb3JtYXQuW1ttYXhpbXVtRnJhY3Rpb25EaWdpdHNdXSkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9uMiA9IFRvUmF3Rml4ZWQoeCwgaW50ZXJuYWxbJ1tbbWluaW11bUludGVnZXJEaWdpdHNdXSddLCBpbnRlcm5hbFsnW1ttaW5pbXVtRnJhY3Rpb25EaWdpdHNdXSddLCBpbnRlcm5hbFsnW1ttYXhpbXVtRnJhY3Rpb25EaWdpdHNdXSddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0LiBJZiB0aGUgdmFsdWUgb2YgdGhlIG51bWJlckZvcm1hdC5bW251bWJlcmluZ1N5c3RlbV1dIG1hdGNoZXMgb25lIG9mIHRoZSB2YWx1ZXMgaW4gdGhlIFwiTnVtYmVyaW5nIFN5c3RlbVwiIGNvbHVtbiBvZiBUYWJsZSAyIGJlbG93LCB0aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobnVtU3lzW251bXNdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGRpZ2l0cyBiZSBhbiBhcnJheSB3aG9zZSAxMCBTdHJpbmcgdmFsdWVkIGVsZW1lbnRzIGFyZSB0aGUgVVRGLTE2IHN0cmluZyByZXByZXNlbnRhdGlvbnMgb2YgdGhlIDEwIGRpZ2l0cyBzcGVjaWZpZWQgaW4gdGhlIFwiRGlnaXRzXCIgY29sdW1uIG9mIHRoZSBtYXRjaGluZyByb3cgaW4gVGFibGUgMi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpZ2l0cyA9IG51bVN5c1tudW1zXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gUmVwbGFjZSBlYWNoIGRpZ2l0IGluIG4gd2l0aCB0aGUgdmFsdWUgb2YgZGlnaXRzW2RpZ2l0XS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX24yID0gU3RyaW5nKF9uMikucmVwbGFjZSgvXFxkL2csIGZ1bmN0aW9uIChkaWdpdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRpZ2l0c1tkaWdpdF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA1LiBFbHNlIHVzZSBhbiBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnQgYWxnb3JpdGhtIHRvIG1hcCBuIHRvIHRoZSBhcHByb3ByaWF0ZSByZXByZXNlbnRhdGlvbiBvZiBuIGluIHRoZSBnaXZlbiBudW1iZXJpbmcgc3lzdGVtLlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBfbjIgPSBTdHJpbmcoX24yKTsgLy8gIyMjVE9ETyMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW50ZWdlciA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFjdGlvbiA9IHZvaWQgMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDYuIExldCBkZWNpbWFsU2VwSW5kZXggYmUgQ2FsbCglU3RyaW5nUHJvdG9faW5kZXhPZiUsIG4sIFwiLlwiLCAwKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWNpbWFsU2VwSW5kZXggPSBfbjIuaW5kZXhPZignLicsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNy4gSWYgZGVjaW1hbFNlcEluZGV4ID4gMCwgdGhlbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZWNpbWFsU2VwSW5kZXggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGludGVnZXIgYmUgdGhlIHN1YnN0cmluZyBvZiBuIGZyb20gcG9zaXRpb24gMCwgaW5jbHVzaXZlLCB0byBwb3NpdGlvbiBkZWNpbWFsU2VwSW5kZXgsIGV4Y2x1c2l2ZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnRlZ2VyID0gX24yLnN1YnN0cmluZygwLCBkZWNpbWFsU2VwSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIExldCBmcmFjdGlvbiBiZSB0aGUgc3Vic3RyaW5nIG9mIG4gZnJvbSBwb3NpdGlvbiBkZWNpbWFsU2VwSW5kZXgsIGV4Y2x1c2l2ZSwgdG8gdGhlIGVuZCBvZiBuLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uID0gX24yLnN1YnN0cmluZyhkZWNpbWFsU2VwSW5kZXggKyAxLCBkZWNpbWFsU2VwSW5kZXgubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDguIEVsc2U6XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGludGVnZXIgYmUgbi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZWdlciA9IF9uMjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGZyYWN0aW9uIGJlIHVuZGVmaW5lZC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb24gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gOS4gSWYgdGhlIHZhbHVlIG9mIHRoZSBudW1iZXJGb3JtYXQuW1t1c2VHcm91cGluZ11dIGlzIHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW50ZXJuYWxbJ1tbdXNlR3JvdXBpbmddXSddID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGdyb3VwU2VwU3ltYm9sIGJlIHRoZSBJTE5EIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIGdyb3VwaW5nIHNlcGFyYXRvci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ3JvdXBTZXBTeW1ib2wgPSBpbGQuZ3JvdXA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gTGV0IGdyb3VwcyBiZSBhIExpc3Qgd2hvc2UgZWxlbWVudHMgYXJlLCBpbiBsZWZ0IHRvIHJpZ2h0IG9yZGVyLCB0aGUgc3Vic3RyaW5ncyBkZWZpbmVkIGJ5IElMTkQgc2V0IG9mIGxvY2F0aW9ucyB3aXRoaW4gdGhlIGludGVnZXIuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdyb3VwcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIC0tLS0+IGltcGxlbWVudGF0aW9uOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFByaW1hcnkgZ3JvdXAgcmVwcmVzZW50cyB0aGUgZ3JvdXAgY2xvc2VzdCB0byB0aGUgZGVjaW1hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwZ1NpemUgPSBkYXRhLnBhdHRlcm5zLnByaW1hcnlHcm91cFNpemUgfHwgMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTZWNvbmRhcnkgZ3JvdXAgaXMgZXZlcnkgb3RoZXIgZ3JvdXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2dTaXplID0gZGF0YS5wYXR0ZXJucy5zZWNvbmRhcnlHcm91cFNpemUgfHwgcGdTaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdyb3VwIG9ubHkgaWYgbmVjZXNzYXJ5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGludGVnZXIubGVuZ3RoID4gcGdTaXplKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEluZGV4IG9mIHRoZSBwcmltYXJ5IGdyb3VwaW5nIHNlcGFyYXRvclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kID0gaW50ZWdlci5sZW5ndGggLSBwZ1NpemU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN0YXJ0aW5nIGluZGV4IGZvciBvdXIgbG9vcFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWR4ID0gZW5kICUgc2dTaXplO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBpbnRlZ2VyLnNsaWNlKDAsIGlkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGFydC5sZW5ndGgpIGFyclB1c2guY2FsbChncm91cHMsIHN0YXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTG9vcCB0byBzZXBhcmF0ZSBpbnRvIHNlY29uZGFyeSBncm91cGluZyBkaWdpdHNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGlkeCA8IGVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKGdyb3VwcywgaW50ZWdlci5zbGljZShpZHgsIGlkeCArIHNnU2l6ZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWR4ICs9IHNnU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdGhlIHByaW1hcnkgZ3JvdXBpbmcgZGlnaXRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChncm91cHMsIGludGVnZXIuc2xpY2UoZW5kKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKGdyb3VwcywgaW50ZWdlcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIEFzc2VydDogVGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBncm91cHMgTGlzdCBpcyBncmVhdGVyIHRoYW4gMC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JvdXBzLmxlbmd0aCA9PT0gMCkgdGhyb3cgbmV3IEVycm9yKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gYS4gUmVwZWF0LCB3aGlsZSBncm91cHMgTGlzdCBpcyBub3QgZW1wdHk6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGdyb3Vwcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS4gUmVtb3ZlIHRoZSBmaXJzdCBlbGVtZW50IGZyb20gZ3JvdXBzIGFuZCBsZXQgaW50ZWdlckdyb3VwIGJlIHRoZSB2YWx1ZSBvZiB0aGF0IGVsZW1lbnQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpbnRlZ2VyR3JvdXAgPSBhcnJTaGlmdC5jYWxsKGdyb3Vwcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwiaW50ZWdlclwiLCBbW3ZhbHVlXV06IGludGVnZXJHcm91cCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdpbnRlZ2VyJywgJ1tbdmFsdWVdXSc6IGludGVnZXJHcm91cCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaWlpLiBJZiBncm91cHMgTGlzdCBpcyBub3QgZW1wdHksIHRoZW46XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncm91cHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwiZ3JvdXBcIiwgW1t2YWx1ZV1dOiBncm91cFNlcFN5bWJvbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnZ3JvdXAnLCAnW1t2YWx1ZV1dJzogZ3JvdXBTZXBTeW1ib2wgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAxMC4gRWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwiaW50ZWdlclwiLCBbW3ZhbHVlXV06IGludGVnZXIgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnaW50ZWdlcicsICdbW3ZhbHVlXV0nOiBpbnRlZ2VyIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDExLiBJZiBmcmFjdGlvbiBpcyBub3QgdW5kZWZpbmVkLCB0aGVuOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZyYWN0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgZGVjaW1hbFNlcFN5bWJvbCBiZSB0aGUgSUxORCBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBkZWNpbWFsIHNlcGFyYXRvci5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVjaW1hbFNlcFN5bWJvbCA9IGlsZC5kZWNpbWFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJkZWNpbWFsXCIsIFtbdmFsdWVdXTogZGVjaW1hbFNlcFN5bWJvbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2RlY2ltYWwnLCAnW1t2YWx1ZV1dJzogZGVjaW1hbFNlcFN5bWJvbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBhLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwiZnJhY3Rpb25cIiwgW1t2YWx1ZV1dOiBmcmFjdGlvbiB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHsgJ1tbdHlwZV1dJzogJ2ZyYWN0aW9uJywgJ1tbdmFsdWVdXSc6IGZyYWN0aW9uIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gYS4gRWxzZSBpZiBwIGlzIGVxdWFsIFwicGx1c1NpZ25cIiwgdGhlbjpcbiAgICAgICAgZWxzZSBpZiAocCA9PT0gXCJwbHVzU2lnblwiKSB7XG4gICAgICAgICAgICAgICAgLy8gaS4gTGV0IHBsdXNTaWduU3ltYm9sIGJlIHRoZSBJTE5EIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIHBsdXMgc2lnbi5cbiAgICAgICAgICAgICAgICB2YXIgcGx1c1NpZ25TeW1ib2wgPSBpbGQucGx1c1NpZ247XG4gICAgICAgICAgICAgICAgLy8gaWkuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJwbHVzU2lnblwiLCBbW3ZhbHVlXV06IHBsdXNTaWduU3ltYm9sIH0gYXMgYSBuZXcgZWxlbWVudCBvZiB0aGUgbGlzdCByZXN1bHQuXG4gICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAncGx1c1NpZ24nLCAnW1t2YWx1ZV1dJzogcGx1c1NpZ25TeW1ib2wgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBhLiBFbHNlIGlmIHAgaXMgZXF1YWwgXCJtaW51c1NpZ25cIiwgdGhlbjpcbiAgICAgICAgICAgIGVsc2UgaWYgKHAgPT09IFwibWludXNTaWduXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IG1pbnVzU2lnblN5bWJvbCBiZSB0aGUgSUxORCBTdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtaW51cyBzaWduLlxuICAgICAgICAgICAgICAgICAgICB2YXIgbWludXNTaWduU3ltYm9sID0gaWxkLm1pbnVzU2lnbjtcbiAgICAgICAgICAgICAgICAgICAgLy8gaWkuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJtaW51c1NpZ25cIiwgW1t2YWx1ZV1dOiBtaW51c1NpZ25TeW1ib2wgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbWludXNTaWduJywgJ1tbdmFsdWVdXSc6IG1pbnVzU2lnblN5bWJvbCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gYS4gRWxzZSBpZiBwIGlzIGVxdWFsIFwicGVyY2VudFNpZ25cIiBhbmQgbnVtYmVyRm9ybWF0Lltbc3R5bGVdXSBpcyBcInBlcmNlbnRcIiwgdGhlbjpcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwID09PSBcInBlcmNlbnRTaWduXCIgJiYgaW50ZXJuYWxbJ1tbc3R5bGVdXSddID09PSBcInBlcmNlbnRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IHBlcmNlbnRTaWduU3ltYm9sIGJlIHRoZSBJTE5EIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIHBlcmNlbnQgc2lnbi5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwZXJjZW50U2lnblN5bWJvbCA9IGlsZC5wZXJjZW50U2lnbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwicGVyY2VudFNpZ25cIiwgW1t2YWx1ZV1dOiBwZXJjZW50U2lnblN5bWJvbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbGl0ZXJhbCcsICdbW3ZhbHVlXV0nOiBwZXJjZW50U2lnblN5bWJvbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBhLiBFbHNlIGlmIHAgaXMgZXF1YWwgXCJjdXJyZW5jeVwiIGFuZCBudW1iZXJGb3JtYXQuW1tzdHlsZV1dIGlzIFwiY3VycmVuY3lcIiwgdGhlbjpcbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocCA9PT0gXCJjdXJyZW5jeVwiICYmIGludGVybmFsWydbW3N0eWxlXV0nXSA9PT0gXCJjdXJyZW5jeVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IGN1cnJlbmN5IGJlIHRoZSB2YWx1ZSBvZiBudW1iZXJGb3JtYXQuW1tjdXJyZW5jeV1dLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW5jeSA9IGludGVybmFsWydbW2N1cnJlbmN5XV0nXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjZCA9IHZvaWQgMDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpLiBJZiBudW1iZXJGb3JtYXQuW1tjdXJyZW5jeURpc3BsYXldXSBpcyBcImNvZGVcIiwgdGhlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpbnRlcm5hbFsnW1tjdXJyZW5jeURpc3BsYXldXSddID09PSBcImNvZGVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiBMZXQgY2QgYmUgY3VycmVuY3kuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNkID0gY3VycmVuY3k7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpaS4gRWxzZSBpZiBudW1iZXJGb3JtYXQuW1tjdXJyZW5jeURpc3BsYXldXSBpcyBcInN5bWJvbFwiLCB0aGVuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaW50ZXJuYWxbJ1tbY3VycmVuY3lEaXNwbGF5XV0nXSA9PT0gXCJzeW1ib2xcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IGNkIGJlIGFuIElMRCBzdHJpbmcgcmVwcmVzZW50aW5nIGN1cnJlbmN5IGluIHNob3J0IGZvcm0uIElmIHRoZSBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBoYXZlIHN1Y2ggYSByZXByZXNlbnRhdGlvbiBvZiBjdXJyZW5jeSwgdXNlIGN1cnJlbmN5IGl0c2VsZi5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNkID0gZGF0YS5jdXJyZW5jaWVzW2N1cnJlbmN5XSB8fCBjdXJyZW5jeTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpdi4gRWxzZSBpZiBudW1iZXJGb3JtYXQuW1tjdXJyZW5jeURpc3BsYXldXSBpcyBcIm5hbWVcIiwgdGhlblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChpbnRlcm5hbFsnW1tjdXJyZW5jeURpc3BsYXldXSddID09PSBcIm5hbWVcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEuIExldCBjZCBiZSBhbiBJTEQgc3RyaW5nIHJlcHJlc2VudGluZyBjdXJyZW5jeSBpbiBsb25nIGZvcm0uIElmIHRoZSBpbXBsZW1lbnRhdGlvbiBkb2VzIG5vdCBoYXZlIHN1Y2ggYSByZXByZXNlbnRhdGlvbiBvZiBjdXJyZW5jeSwgdGhlbiB1c2UgY3VycmVuY3kgaXRzZWxmLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNkID0gY3VycmVuY3k7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdi4gQWRkIG5ldyBwYXJ0IHJlY29yZCB7IFtbdHlwZV1dOiBcImN1cnJlbmN5XCIsIFtbdmFsdWVdXTogY2QgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdjdXJyZW5jeScsICdbW3ZhbHVlXV0nOiBjZCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGEuIEVsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaS4gTGV0IGxpdGVyYWwgYmUgdGhlIHN1YnN0cmluZyBvZiBwYXR0ZXJuIGZyb20gcG9zaXRpb24gYmVnaW5JbmRleCwgaW5jbHVzaXZlLCB0byBwb3NpdGlvbiBlbmRJbmRleCwgaW5jbHVzaXZlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgX2xpdGVyYWwgPSBwYXR0ZXJuLnN1YnN0cmluZyhiZWdpbkluZGV4LCBlbmRJbmRleCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlpLiBBZGQgbmV3IHBhcnQgcmVjb3JkIHsgW1t0eXBlXV06IFwibGl0ZXJhbFwiLCBbW3ZhbHVlXV06IGxpdGVyYWwgfSBhcyBhIG5ldyBlbGVtZW50IG9mIHRoZSBsaXN0IHJlc3VsdC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwgeyAnW1t0eXBlXV0nOiAnbGl0ZXJhbCcsICdbW3ZhbHVlXV0nOiBfbGl0ZXJhbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIC8vIGEuIFNldCBuZXh0SW5kZXggdG8gZW5kSW5kZXggKyAxLlxuICAgICAgICBuZXh0SW5kZXggPSBlbmRJbmRleCArIDE7XG4gICAgICAgIC8vIGEuIFNldCBiZWdpbkluZGV4IHRvIENhbGwoJVN0cmluZ1Byb3RvX2luZGV4T2YlLCBwYXR0ZXJuLCBcIntcIiwgbmV4dEluZGV4KVxuICAgICAgICBiZWdpbkluZGV4ID0gcGF0dGVybi5pbmRleE9mKCd7JywgbmV4dEluZGV4KTtcbiAgICB9XG4gICAgLy8gOS4gSWYgbmV4dEluZGV4IGlzIGxlc3MgdGhhbiBsZW5ndGgsIHRoZW46XG4gICAgaWYgKG5leHRJbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAvLyBhLiBMZXQgbGl0ZXJhbCBiZSB0aGUgc3Vic3RyaW5nIG9mIHBhdHRlcm4gZnJvbSBwb3NpdGlvbiBuZXh0SW5kZXgsIGluY2x1c2l2ZSwgdG8gcG9zaXRpb24gbGVuZ3RoLCBleGNsdXNpdmUuXG4gICAgICAgIHZhciBfbGl0ZXJhbDIgPSBwYXR0ZXJuLnN1YnN0cmluZyhuZXh0SW5kZXgsIGxlbmd0aCk7XG4gICAgICAgIC8vIGEuIEFkZCBuZXcgcGFydCByZWNvcmQgeyBbW3R5cGVdXTogXCJsaXRlcmFsXCIsIFtbdmFsdWVdXTogbGl0ZXJhbCB9IGFzIGEgbmV3IGVsZW1lbnQgb2YgdGhlIGxpc3QgcmVzdWx0LlxuICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7ICdbW3R5cGVdXSc6ICdsaXRlcmFsJywgJ1tbdmFsdWVdXSc6IF9saXRlcmFsMiB9KTtcbiAgICB9XG4gICAgLy8gMTAuIFJldHVybiByZXN1bHQuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLypcbiAqIEBzcGVjW3N0YXNtL2VjbWE0MDIvbnVtYmVyLWZvcm1hdC10by1wYXJ0cy9zcGVjL251bWJlcmZvcm1hdC5odG1sXVxuICogQGNsYXVzZVtzZWMtZm9ybWF0bnVtYmVyXVxuICovXG5mdW5jdGlvbiBGb3JtYXROdW1iZXIobnVtYmVyRm9ybWF0LCB4KSB7XG4gICAgLy8gMS4gTGV0IHBhcnRzIGJlID8gUGFydGl0aW9uTnVtYmVyUGF0dGVybihudW1iZXJGb3JtYXQsIHgpLlxuICAgIHZhciBwYXJ0cyA9IFBhcnRpdGlvbk51bWJlclBhdHRlcm4obnVtYmVyRm9ybWF0LCB4KTtcbiAgICAvLyAyLiBMZXQgcmVzdWx0IGJlIGFuIGVtcHR5IFN0cmluZy5cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgLy8gMy4gRm9yIGVhY2ggcGFydCBpbiBwYXJ0cywgZG86XG4gICAgZm9yICh2YXIgaSA9IDA7IHBhcnRzLmxlbmd0aCA+IGk7IGkrKykge1xuICAgICAgICB2YXIgcGFydCA9IHBhcnRzW2ldO1xuICAgICAgICAvLyBhLiBTZXQgcmVzdWx0IHRvIGEgU3RyaW5nIHZhbHVlIHByb2R1Y2VkIGJ5IGNvbmNhdGVuYXRpbmcgcmVzdWx0IGFuZCBwYXJ0LltbdmFsdWVdXS5cbiAgICAgICAgcmVzdWx0ICs9IHBhcnRbJ1tbdmFsdWVdXSddO1xuICAgIH1cbiAgICAvLyA0LiBSZXR1cm4gcmVzdWx0LlxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogV2hlbiB0aGUgVG9SYXdQcmVjaXNpb24gYWJzdHJhY3Qgb3BlcmF0aW9uIGlzIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyB4ICh3aGljaFxuICogbXVzdCBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyKSwgbWluUHJlY2lzaW9uLCBhbmQgbWF4UHJlY2lzaW9uIChib3RoXG4gKiBtdXN0IGJlIGludGVnZXJzIGJldHdlZW4gMSBhbmQgMjEpIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiBUb1Jhd1ByZWNpc2lvbih4LCBtaW5QcmVjaXNpb24sIG1heFByZWNpc2lvbikge1xuICAgIC8vIDEuIExldCBwIGJlIG1heFByZWNpc2lvbi5cbiAgICB2YXIgcCA9IG1heFByZWNpc2lvbjtcblxuICAgIHZhciBtID0gdm9pZCAwLFxuICAgICAgICBlID0gdm9pZCAwO1xuXG4gICAgLy8gMi4gSWYgeCA9IDAsIHRoZW5cbiAgICBpZiAoeCA9PT0gMCkge1xuICAgICAgICAvLyBhLiBMZXQgbSBiZSB0aGUgU3RyaW5nIGNvbnNpc3Rpbmcgb2YgcCBvY2N1cnJlbmNlcyBvZiB0aGUgY2hhcmFjdGVyIFwiMFwiLlxuICAgICAgICBtID0gYXJySm9pbi5jYWxsKEFycmF5KHAgKyAxKSwgJzAnKTtcbiAgICAgICAgLy8gYi4gTGV0IGUgYmUgMC5cbiAgICAgICAgZSA9IDA7XG4gICAgfVxuICAgIC8vIDMuIEVsc2VcbiAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIGEuIExldCBlIGFuZCBuIGJlIGludGVnZXJzIHN1Y2ggdGhhdCAxMOG1luKBu8K5IOKJpCBuIDwgMTDhtZYgYW5kIGZvciB3aGljaCB0aGVcbiAgICAgICAgICAgIC8vICAgIGV4YWN0IG1hdGhlbWF0aWNhbCB2YWx1ZSBvZiBuIMOXIDEw4bWJ4oG74bWW4oG6wrkg4oCTIHggaXMgYXMgY2xvc2UgdG8gemVybyBhc1xuICAgICAgICAgICAgLy8gICAgcG9zc2libGUuIElmIHRoZXJlIGFyZSB0d28gc3VjaCBzZXRzIG9mIGUgYW5kIG4sIHBpY2sgdGhlIGUgYW5kIG4gZm9yXG4gICAgICAgICAgICAvLyAgICB3aGljaCBuIMOXIDEw4bWJ4oG74bWW4oG6wrkgaXMgbGFyZ2VyLlxuICAgICAgICAgICAgZSA9IGxvZzEwRmxvb3IoTWF0aC5hYnMoeCkpO1xuXG4gICAgICAgICAgICAvLyBFYXNpZXIgdG8gZ2V0IHRvIG0gZnJvbSBoZXJlXG4gICAgICAgICAgICB2YXIgZiA9IE1hdGgucm91bmQoTWF0aC5leHAoTWF0aC5hYnMoZSAtIHAgKyAxKSAqIE1hdGguTE4xMCkpO1xuXG4gICAgICAgICAgICAvLyBiLiBMZXQgbSBiZSB0aGUgU3RyaW5nIGNvbnNpc3Rpbmcgb2YgdGhlIGRpZ2l0cyBvZiB0aGUgZGVjaW1hbFxuICAgICAgICAgICAgLy8gICAgcmVwcmVzZW50YXRpb24gb2YgbiAoaW4gb3JkZXIsIHdpdGggbm8gbGVhZGluZyB6ZXJvZXMpXG4gICAgICAgICAgICBtID0gU3RyaW5nKE1hdGgucm91bmQoZSAtIHAgKyAxIDwgMCA/IHggKiBmIDogeCAvIGYpKTtcbiAgICAgICAgfVxuXG4gICAgLy8gNC4gSWYgZSDiiaUgcCwgdGhlblxuICAgIGlmIChlID49IHApXG4gICAgICAgIC8vIGEuIFJldHVybiB0aGUgY29uY2F0ZW5hdGlvbiBvZiBtIGFuZCBlLXArMSBvY2N1cnJlbmNlcyBvZiB0aGUgY2hhcmFjdGVyIFwiMFwiLlxuICAgICAgICByZXR1cm4gbSArIGFyckpvaW4uY2FsbChBcnJheShlIC0gcCArIDEgKyAxKSwgJzAnKTtcblxuICAgICAgICAvLyA1LiBJZiBlID0gcC0xLCB0aGVuXG4gICAgZWxzZSBpZiAoZSA9PT0gcCAtIDEpXG4gICAgICAgICAgICAvLyBhLiBSZXR1cm4gbS5cbiAgICAgICAgICAgIHJldHVybiBtO1xuXG4gICAgICAgICAgICAvLyA2LiBJZiBlIOKJpSAwLCB0aGVuXG4gICAgICAgIGVsc2UgaWYgKGUgPj0gMClcbiAgICAgICAgICAgICAgICAvLyBhLiBMZXQgbSBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGUgZmlyc3QgZSsxIGNoYXJhY3RlcnMgb2YgbSwgdGhlIGNoYXJhY3RlclxuICAgICAgICAgICAgICAgIC8vICAgIFwiLlwiLCBhbmQgdGhlIHJlbWFpbmluZyBw4oCTKGUrMSkgY2hhcmFjdGVycyBvZiBtLlxuICAgICAgICAgICAgICAgIG0gPSBtLnNsaWNlKDAsIGUgKyAxKSArICcuJyArIG0uc2xpY2UoZSArIDEpO1xuXG4gICAgICAgICAgICAgICAgLy8gNy4gSWYgZSA8IDAsIHRoZW5cbiAgICAgICAgICAgIGVsc2UgaWYgKGUgPCAwKVxuICAgICAgICAgICAgICAgICAgICAvLyBhLiBMZXQgbSBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiB0aGUgU3RyaW5nIFwiMC5cIiwg4oCTKGUrMSkgb2NjdXJyZW5jZXMgb2YgdGhlXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIGNoYXJhY3RlciBcIjBcIiwgYW5kIHRoZSBzdHJpbmcgbS5cbiAgICAgICAgICAgICAgICAgICAgbSA9ICcwLicgKyBhcnJKb2luLmNhbGwoQXJyYXkoLShlICsgMSkgKyAxKSwgJzAnKSArIG07XG5cbiAgICAvLyA4LiBJZiBtIGNvbnRhaW5zIHRoZSBjaGFyYWN0ZXIgXCIuXCIsIGFuZCBtYXhQcmVjaXNpb24gPiBtaW5QcmVjaXNpb24sIHRoZW5cbiAgICBpZiAobS5pbmRleE9mKFwiLlwiKSA+PSAwICYmIG1heFByZWNpc2lvbiA+IG1pblByZWNpc2lvbikge1xuICAgICAgICAvLyBhLiBMZXQgY3V0IGJlIG1heFByZWNpc2lvbiDigJMgbWluUHJlY2lzaW9uLlxuICAgICAgICB2YXIgY3V0ID0gbWF4UHJlY2lzaW9uIC0gbWluUHJlY2lzaW9uO1xuXG4gICAgICAgIC8vIGIuIFJlcGVhdCB3aGlsZSBjdXQgPiAwIGFuZCB0aGUgbGFzdCBjaGFyYWN0ZXIgb2YgbSBpcyBcIjBcIjpcbiAgICAgICAgd2hpbGUgKGN1dCA+IDAgJiYgbS5jaGFyQXQobS5sZW5ndGggLSAxKSA9PT0gJzAnKSB7XG4gICAgICAgICAgICAvLyAgaS4gUmVtb3ZlIHRoZSBsYXN0IGNoYXJhY3RlciBmcm9tIG0uXG4gICAgICAgICAgICBtID0gbS5zbGljZSgwLCAtMSk7XG5cbiAgICAgICAgICAgIC8vICBpaS4gRGVjcmVhc2UgY3V0IGJ5IDEuXG4gICAgICAgICAgICBjdXQtLTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGMuIElmIHRoZSBsYXN0IGNoYXJhY3RlciBvZiBtIGlzIFwiLlwiLCB0aGVuXG4gICAgICAgIGlmIChtLmNoYXJBdChtLmxlbmd0aCAtIDEpID09PSAnLicpXG4gICAgICAgICAgICAvLyAgICBpLiBSZW1vdmUgdGhlIGxhc3QgY2hhcmFjdGVyIGZyb20gbS5cbiAgICAgICAgICAgIG0gPSBtLnNsaWNlKDAsIC0xKTtcbiAgICB9XG4gICAgLy8gOS4gUmV0dXJuIG0uXG4gICAgcmV0dXJuIG07XG59XG5cbi8qKlxuICogQHNwZWNbdGMzOS9lY21hNDAyL21hc3Rlci9zcGVjL251bWJlcmZvcm1hdC5odG1sXVxuICogQGNsYXVzZVtzZWMtdG9yYXdmaXhlZF1cbiAqIFdoZW4gdGhlIFRvUmF3Rml4ZWQgYWJzdHJhY3Qgb3BlcmF0aW9uIGlzIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyB4ICh3aGljaCBtdXN0XG4gKiBiZSBhIGZpbml0ZSBub24tbmVnYXRpdmUgbnVtYmVyKSwgbWluSW50ZWdlciAod2hpY2ggbXVzdCBiZSBhbiBpbnRlZ2VyIGJldHdlZW5cbiAqIDEgYW5kIDIxKSwgbWluRnJhY3Rpb24sIGFuZCBtYXhGcmFjdGlvbiAod2hpY2ggbXVzdCBiZSBpbnRlZ2VycyBiZXR3ZWVuIDAgYW5kXG4gKiAyMCkgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIFRvUmF3Rml4ZWQoeCwgbWluSW50ZWdlciwgbWluRnJhY3Rpb24sIG1heEZyYWN0aW9uKSB7XG4gICAgLy8gMS4gTGV0IGYgYmUgbWF4RnJhY3Rpb24uXG4gICAgdmFyIGYgPSBtYXhGcmFjdGlvbjtcbiAgICAvLyAyLiBMZXQgbiBiZSBhbiBpbnRlZ2VyIGZvciB3aGljaCB0aGUgZXhhY3QgbWF0aGVtYXRpY2FsIHZhbHVlIG9mIG4gw7cgMTBmIOKAkyB4IGlzIGFzIGNsb3NlIHRvIHplcm8gYXMgcG9zc2libGUuIElmIHRoZXJlIGFyZSB0d28gc3VjaCBuLCBwaWNrIHRoZSBsYXJnZXIgbi5cbiAgICB2YXIgbiA9IE1hdGgucG93KDEwLCBmKSAqIHg7IC8vIGRpdmVyZ2luZy4uLlxuICAgIC8vIDMuIElmIG4gPSAwLCBsZXQgbSBiZSB0aGUgU3RyaW5nIFwiMFwiLiBPdGhlcndpc2UsIGxldCBtIGJlIHRoZSBTdHJpbmcgY29uc2lzdGluZyBvZiB0aGUgZGlnaXRzIG9mIHRoZSBkZWNpbWFsIHJlcHJlc2VudGF0aW9uIG9mIG4gKGluIG9yZGVyLCB3aXRoIG5vIGxlYWRpbmcgemVyb2VzKS5cbiAgICB2YXIgbSA9IG4gPT09IDAgPyBcIjBcIiA6IG4udG9GaXhlZCgwKTsgLy8gZGl2ZXJpbmcuLi5cblxuICAgIHtcbiAgICAgICAgLy8gdGhpcyBkaXZlcnNpb24gaXMgbmVlZGVkIHRvIHRha2UgaW50byBjb25zaWRlcmF0aW9uIGJpZyBudW1iZXJzLCBlLmcuOlxuICAgICAgICAvLyAxLjIzNDQ1MDFlKzM3IC0+IDEyMzQ0NTAxMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwXG4gICAgICAgIHZhciBpZHggPSB2b2lkIDA7XG4gICAgICAgIHZhciBleHAgPSAoaWR4ID0gbS5pbmRleE9mKCdlJykpID4gLTEgPyBtLnNsaWNlKGlkeCArIDEpIDogMDtcbiAgICAgICAgaWYgKGV4cCkge1xuICAgICAgICAgICAgbSA9IG0uc2xpY2UoMCwgaWR4KS5yZXBsYWNlKCcuJywgJycpO1xuICAgICAgICAgICAgbSArPSBhcnJKb2luLmNhbGwoQXJyYXkoZXhwIC0gKG0ubGVuZ3RoIC0gMSkgKyAxKSwgJzAnKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBpbnQgPSB2b2lkIDA7XG4gICAgLy8gNC4gSWYgZiDiiaAgMCwgdGhlblxuICAgIGlmIChmICE9PSAwKSB7XG4gICAgICAgIC8vIGEuIExldCBrIGJlIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyBpbiBtLlxuICAgICAgICB2YXIgayA9IG0ubGVuZ3RoO1xuICAgICAgICAvLyBhLiBJZiBrIOKJpCBmLCB0aGVuXG4gICAgICAgIGlmIChrIDw9IGYpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCB6IGJlIHRoZSBTdHJpbmcgY29uc2lzdGluZyBvZiBmKzHigJNrIG9jY3VycmVuY2VzIG9mIHRoZSBjaGFyYWN0ZXIgXCIwXCIuXG4gICAgICAgICAgICB2YXIgeiA9IGFyckpvaW4uY2FsbChBcnJheShmICsgMSAtIGsgKyAxKSwgJzAnKTtcbiAgICAgICAgICAgIC8vIGlpLiBMZXQgbSBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiBTdHJpbmdzIHogYW5kIG0uXG4gICAgICAgICAgICBtID0geiArIG07XG4gICAgICAgICAgICAvLyBpaWkuIExldCBrIGJlIGYrMS5cbiAgICAgICAgICAgIGsgPSBmICsgMTtcbiAgICAgICAgfVxuICAgICAgICAvLyBhLiBMZXQgYSBiZSB0aGUgZmlyc3Qga+KAk2YgY2hhcmFjdGVycyBvZiBtLCBhbmQgbGV0IGIgYmUgdGhlIHJlbWFpbmluZyBmIGNoYXJhY3RlcnMgb2YgbS5cbiAgICAgICAgdmFyIGEgPSBtLnN1YnN0cmluZygwLCBrIC0gZiksXG4gICAgICAgICAgICBiID0gbS5zdWJzdHJpbmcoayAtIGYsIG0ubGVuZ3RoKTtcbiAgICAgICAgLy8gYS4gTGV0IG0gYmUgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGhlIHRocmVlIFN0cmluZ3MgYSwgXCIuXCIsIGFuZCBiLlxuICAgICAgICBtID0gYSArIFwiLlwiICsgYjtcbiAgICAgICAgLy8gYS4gTGV0IGludCBiZSB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgaW4gYS5cbiAgICAgICAgaW50ID0gYS5sZW5ndGg7XG4gICAgfVxuICAgIC8vIDUuIEVsc2UsIGxldCBpbnQgYmUgdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIGluIG0uXG4gICAgZWxzZSBpbnQgPSBtLmxlbmd0aDtcbiAgICAvLyA2LiBMZXQgY3V0IGJlIG1heEZyYWN0aW9uIOKAkyBtaW5GcmFjdGlvbi5cbiAgICB2YXIgY3V0ID0gbWF4RnJhY3Rpb24gLSBtaW5GcmFjdGlvbjtcbiAgICAvLyA3LiBSZXBlYXQgd2hpbGUgY3V0ID4gMCBhbmQgdGhlIGxhc3QgY2hhcmFjdGVyIG9mIG0gaXMgXCIwXCI6XG4gICAgd2hpbGUgKGN1dCA+IDAgJiYgbS5zbGljZSgtMSkgPT09IFwiMFwiKSB7XG4gICAgICAgIC8vIGEuIFJlbW92ZSB0aGUgbGFzdCBjaGFyYWN0ZXIgZnJvbSBtLlxuICAgICAgICBtID0gbS5zbGljZSgwLCAtMSk7XG4gICAgICAgIC8vIGEuIERlY3JlYXNlIGN1dCBieSAxLlxuICAgICAgICBjdXQtLTtcbiAgICB9XG4gICAgLy8gOC4gSWYgdGhlIGxhc3QgY2hhcmFjdGVyIG9mIG0gaXMgXCIuXCIsIHRoZW5cbiAgICBpZiAobS5zbGljZSgtMSkgPT09IFwiLlwiKSB7XG4gICAgICAgIC8vIGEuIFJlbW92ZSB0aGUgbGFzdCBjaGFyYWN0ZXIgZnJvbSBtLlxuICAgICAgICBtID0gbS5zbGljZSgwLCAtMSk7XG4gICAgfVxuICAgIC8vIDkuIElmIGludCA8IG1pbkludGVnZXIsIHRoZW5cbiAgICBpZiAoaW50IDwgbWluSW50ZWdlcikge1xuICAgICAgICAvLyBhLiBMZXQgeiBiZSB0aGUgU3RyaW5nIGNvbnNpc3Rpbmcgb2YgbWluSW50ZWdlcuKAk2ludCBvY2N1cnJlbmNlcyBvZiB0aGUgY2hhcmFjdGVyIFwiMFwiLlxuICAgICAgICB2YXIgX3ogPSBhcnJKb2luLmNhbGwoQXJyYXkobWluSW50ZWdlciAtIGludCArIDEpLCAnMCcpO1xuICAgICAgICAvLyBhLiBMZXQgbSBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiBTdHJpbmdzIHogYW5kIG0uXG4gICAgICAgIG0gPSBfeiArIG07XG4gICAgfVxuICAgIC8vIDEwLiBSZXR1cm4gbS5cbiAgICByZXR1cm4gbTtcbn1cblxuLy8gU2VjdCAxMS4zLjIgVGFibGUgMiwgTnVtYmVyaW5nIHN5c3RlbXNcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG52YXIgbnVtU3lzID0ge1xuICAgIGFyYWI6IFtcItmgXCIsIFwi2aFcIiwgXCLZolwiLCBcItmjXCIsIFwi2aRcIiwgXCLZpVwiLCBcItmmXCIsIFwi2adcIiwgXCLZqFwiLCBcItmpXCJdLFxuICAgIGFyYWJleHQ6IFtcItuwXCIsIFwi27FcIiwgXCLbslwiLCBcItuzXCIsIFwi27RcIiwgXCLbtVwiLCBcItu2XCIsIFwi27dcIiwgXCLbuFwiLCBcItu5XCJdLFxuICAgIGJhbGk6IFtcIuGtkFwiLCBcIuGtkVwiLCBcIuGtklwiLCBcIuGtk1wiLCBcIuGtlFwiLCBcIuGtlVwiLCBcIuGtllwiLCBcIuGtl1wiLCBcIuGtmFwiLCBcIuGtmVwiXSxcbiAgICBiZW5nOiBbXCLgp6ZcIiwgXCLgp6dcIiwgXCLgp6hcIiwgXCLgp6lcIiwgXCLgp6pcIiwgXCLgp6tcIiwgXCLgp6xcIiwgXCLgp61cIiwgXCLgp65cIiwgXCLgp69cIl0sXG4gICAgZGV2YTogW1wi4KWmXCIsIFwi4KWnXCIsIFwi4KWoXCIsIFwi4KWpXCIsIFwi4KWqXCIsIFwi4KWrXCIsIFwi4KWsXCIsIFwi4KWtXCIsIFwi4KWuXCIsIFwi4KWvXCJdLFxuICAgIGZ1bGx3aWRlOiBbXCLvvJBcIiwgXCLvvJFcIiwgXCLvvJJcIiwgXCLvvJNcIiwgXCLvvJRcIiwgXCLvvJVcIiwgXCLvvJZcIiwgXCLvvJdcIiwgXCLvvJhcIiwgXCLvvJlcIl0sXG4gICAgZ3VqcjogW1wi4KumXCIsIFwi4KunXCIsIFwi4KuoXCIsIFwi4KupXCIsIFwi4KuqXCIsIFwi4KurXCIsIFwi4KusXCIsIFwi4KutXCIsIFwi4KuuXCIsIFwi4KuvXCJdLFxuICAgIGd1cnU6IFtcIuCpplwiLCBcIuCpp1wiLCBcIuCpqFwiLCBcIuCpqVwiLCBcIuCpqlwiLCBcIuCpq1wiLCBcIuCprFwiLCBcIuCprVwiLCBcIuCprlwiLCBcIuCpr1wiXSxcbiAgICBoYW5pZGVjOiBbXCLjgIdcIiwgXCLkuIBcIiwgXCLkuoxcIiwgXCLkuIlcIiwgXCLlm5tcIiwgXCLkupRcIiwgXCLlha1cIiwgXCLkuINcIiwgXCLlhatcIiwgXCLkuZ1cIl0sXG4gICAga2htcjogW1wi4Z+gXCIsIFwi4Z+hXCIsIFwi4Z+iXCIsIFwi4Z+jXCIsIFwi4Z+kXCIsIFwi4Z+lXCIsIFwi4Z+mXCIsIFwi4Z+nXCIsIFwi4Z+oXCIsIFwi4Z+pXCJdLFxuICAgIGtuZGE6IFtcIuCzplwiLCBcIuCzp1wiLCBcIuCzqFwiLCBcIuCzqVwiLCBcIuCzqlwiLCBcIuCzq1wiLCBcIuCzrFwiLCBcIuCzrVwiLCBcIuCzrlwiLCBcIuCzr1wiXSxcbiAgICBsYW9vOiBbXCLgu5BcIiwgXCLgu5FcIiwgXCLgu5JcIiwgXCLgu5NcIiwgXCLgu5RcIiwgXCLgu5VcIiwgXCLgu5ZcIiwgXCLgu5dcIiwgXCLgu5hcIiwgXCLgu5lcIl0sXG4gICAgbGF0bjogW1wiMFwiLCBcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCIsIFwiOVwiXSxcbiAgICBsaW1iOiBbXCLhpYZcIiwgXCLhpYdcIiwgXCLhpYhcIiwgXCLhpYlcIiwgXCLhpYpcIiwgXCLhpYtcIiwgXCLhpYxcIiwgXCLhpY1cIiwgXCLhpY5cIiwgXCLhpY9cIl0sXG4gICAgbWx5bTogW1wi4LWmXCIsIFwi4LWnXCIsIFwi4LWoXCIsIFwi4LWpXCIsIFwi4LWqXCIsIFwi4LWrXCIsIFwi4LWsXCIsIFwi4LWtXCIsIFwi4LWuXCIsIFwi4LWvXCJdLFxuICAgIG1vbmc6IFtcIuGgkFwiLCBcIuGgkVwiLCBcIuGgklwiLCBcIuGgk1wiLCBcIuGglFwiLCBcIuGglVwiLCBcIuGgllwiLCBcIuGgl1wiLCBcIuGgmFwiLCBcIuGgmVwiXSxcbiAgICBteW1yOiBbXCLhgYBcIiwgXCLhgYFcIiwgXCLhgYJcIiwgXCLhgYNcIiwgXCLhgYRcIiwgXCLhgYVcIiwgXCLhgYZcIiwgXCLhgYdcIiwgXCLhgYhcIiwgXCLhgYlcIl0sXG4gICAgb3J5YTogW1wi4K2mXCIsIFwi4K2nXCIsIFwi4K2oXCIsIFwi4K2pXCIsIFwi4K2qXCIsIFwi4K2rXCIsIFwi4K2sXCIsIFwi4K2tXCIsIFwi4K2uXCIsIFwi4K2vXCJdLFxuICAgIHRhbWxkZWM6IFtcIuCvplwiLCBcIuCvp1wiLCBcIuCvqFwiLCBcIuCvqVwiLCBcIuCvqlwiLCBcIuCvq1wiLCBcIuCvrFwiLCBcIuCvrVwiLCBcIuCvrlwiLCBcIuCvr1wiXSxcbiAgICB0ZWx1OiBbXCLgsaZcIiwgXCLgsadcIiwgXCLgsahcIiwgXCLgsalcIiwgXCLgsapcIiwgXCLgsatcIiwgXCLgsaxcIiwgXCLgsa1cIiwgXCLgsa5cIiwgXCLgsa9cIl0sXG4gICAgdGhhaTogW1wi4LmQXCIsIFwi4LmRXCIsIFwi4LmSXCIsIFwi4LmTXCIsIFwi4LmUXCIsIFwi4LmVXCIsIFwi4LmWXCIsIFwi4LmXXCIsIFwi4LmYXCIsIFwi4LmZXCJdLFxuICAgIHRpYnQ6IFtcIuC8oFwiLCBcIuC8oVwiLCBcIuC8olwiLCBcIuC8o1wiLCBcIuC8pFwiLCBcIuC8pVwiLCBcIuC8plwiLCBcIuC8p1wiLCBcIuC8qFwiLCBcIuC8qVwiXVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHByb3ZpZGVzIGFjY2VzcyB0byB0aGUgbG9jYWxlIGFuZCBmb3JtYXR0aW5nIG9wdGlvbnMgY29tcHV0ZWRcbiAqIGR1cmluZyBpbml0aWFsaXphdGlvbiBvZiB0aGUgb2JqZWN0LlxuICpcbiAqIFRoZSBmdW5jdGlvbiByZXR1cm5zIGEgbmV3IG9iamVjdCB3aG9zZSBwcm9wZXJ0aWVzIGFuZCBhdHRyaWJ1dGVzIGFyZSBzZXQgYXNcbiAqIGlmIGNvbnN0cnVjdGVkIGJ5IGFuIG9iamVjdCBsaXRlcmFsIGFzc2lnbmluZyB0byBlYWNoIG9mIHRoZSBmb2xsb3dpbmdcbiAqIHByb3BlcnRpZXMgdGhlIHZhbHVlIG9mIHRoZSBjb3JyZXNwb25kaW5nIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXNcbiAqIE51bWJlckZvcm1hdCBvYmplY3QgKHNlZSAxMS40KTogbG9jYWxlLCBudW1iZXJpbmdTeXN0ZW0sIHN0eWxlLCBjdXJyZW5jeSxcbiAqIGN1cnJlbmN5RGlzcGxheSwgbWluaW11bUludGVnZXJEaWdpdHMsIG1pbmltdW1GcmFjdGlvbkRpZ2l0cyxcbiAqIG1heGltdW1GcmFjdGlvbkRpZ2l0cywgbWluaW11bVNpZ25pZmljYW50RGlnaXRzLCBtYXhpbXVtU2lnbmlmaWNhbnREaWdpdHMsIGFuZFxuICogdXNlR3JvdXBpbmcuIFByb3BlcnRpZXMgd2hvc2UgY29ycmVzcG9uZGluZyBpbnRlcm5hbCBwcm9wZXJ0aWVzIGFyZSBub3QgcHJlc2VudFxuICogYXJlIG5vdCBhc3NpZ25lZC5cbiAqL1xuLyogMTEuMy4zICovZGVmaW5lUHJvcGVydHkoSW50bC5OdW1iZXJGb3JtYXQucHJvdG90eXBlLCAncmVzb2x2ZWRPcHRpb25zJywge1xuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgICAgIHZhciBwcm9wID0gdm9pZCAwLFxuICAgICAgICAgICAgZGVzY3MgPSBuZXcgUmVjb3JkKCksXG4gICAgICAgICAgICBwcm9wcyA9IFsnbG9jYWxlJywgJ251bWJlcmluZ1N5c3RlbScsICdzdHlsZScsICdjdXJyZW5jeScsICdjdXJyZW5jeURpc3BsYXknLCAnbWluaW11bUludGVnZXJEaWdpdHMnLCAnbWluaW11bUZyYWN0aW9uRGlnaXRzJywgJ21heGltdW1GcmFjdGlvbkRpZ2l0cycsICdtaW5pbXVtU2lnbmlmaWNhbnREaWdpdHMnLCAnbWF4aW11bVNpZ25pZmljYW50RGlnaXRzJywgJ3VzZUdyb3VwaW5nJ10sXG4gICAgICAgICAgICBpbnRlcm5hbCA9IHRoaXMgIT09IG51bGwgJiYgYmFiZWxIZWxwZXJzJDFbXCJ0eXBlb2ZcIl0odGhpcykgPT09ICdvYmplY3QnICYmIGdldEludGVybmFsUHJvcGVydGllcyh0aGlzKTtcblxuICAgICAgICAvLyBTYXRpc2Z5IHRlc3QgMTEuM19iXG4gICAgICAgIGlmICghaW50ZXJuYWwgfHwgIWludGVybmFsWydbW2luaXRpYWxpemVkTnVtYmVyRm9ybWF0XV0nXSkgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIGZvciByZXNvbHZlZE9wdGlvbnMoKSBpcyBub3QgYW4gaW5pdGlhbGl6ZWQgSW50bC5OdW1iZXJGb3JtYXQgb2JqZWN0LicpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBtYXggPSBwcm9wcy5sZW5ndGg7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGhvcC5jYWxsKGludGVybmFsLCBwcm9wID0gJ1tbJyArIHByb3BzW2ldICsgJ11dJykpIGRlc2NzW3Byb3BzW2ldXSA9IHsgdmFsdWU6IGludGVybmFsW3Byb3BdLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlLCBlbnVtZXJhYmxlOiB0cnVlIH07XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gb2JqQ3JlYXRlKHt9LCBkZXNjcyk7XG4gICAgfVxufSk7XG5cbi8qIGpzbGludCBlc25leHQ6IHRydWUgKi9cblxuLy8gTWF0Y2ggdGhlc2UgZGF0ZXRpbWUgY29tcG9uZW50cyBpbiBhIENMRFIgcGF0dGVybiwgZXhjZXB0IHRob3NlIGluIHNpbmdsZSBxdW90ZXNcbnZhciBleHBEVENvbXBvbmVudHMgPSAvKD86W0VlY117MSw2fXxHezEsNX18W1FxXXsxLDV9fCg/Olt5WXVyXSt8VXsxLDV9KXxbTUxdezEsNX18ZHsxLDJ9fER7MSwzfXxGezF9fFthYkJdezEsNX18W2hrSEtdezEsMn18d3sxLDJ9fFd7MX18bXsxLDJ9fHN7MSwyfXxbelpPdlZ4WF17MSw0fSkoPz0oW14nXSonW14nXSonKSpbXiddKiQpL2c7XG4vLyB0cmltIHBhdHRlcm5zIGFmdGVyIHRyYW5zZm9ybWF0aW9uc1xudmFyIGV4cFBhdHRlcm5UcmltbWVyID0gL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nO1xuLy8gU2tpcCBvdmVyIHBhdHRlcm5zIHdpdGggdGhlc2UgZGF0ZXRpbWUgY29tcG9uZW50cyBiZWNhdXNlIHdlIGRvbid0IGhhdmUgZGF0YVxuLy8gdG8gYmFjayB0aGVtIHVwOlxuLy8gdGltZXpvbmUsIHdlZWtkYXksIGFtb3VuZyBvdGhlcnNcbnZhciB1bndhbnRlZERUQ3MgPSAvW3JxUUFTakpnd1dJUXFdLzsgLy8geFhWTyB3ZXJlIHJlbW92ZWQgZnJvbSB0aGlzIGxpc3QgaW4gZmF2b3Igb2YgY29tcHV0aW5nIG1hdGNoZXMgd2l0aCB0aW1lWm9uZU5hbWUgdmFsdWVzIGJ1dCBwcmludGluZyBhcyBlbXB0eSBzdHJpbmdcblxudmFyIGR0S2V5cyA9IFtcImVyYVwiLCBcInllYXJcIiwgXCJtb250aFwiLCBcImRheVwiLCBcIndlZWtkYXlcIiwgXCJxdWFydGVyXCJdO1xudmFyIHRtS2V5cyA9IFtcImhvdXJcIiwgXCJtaW51dGVcIiwgXCJzZWNvbmRcIiwgXCJob3VyMTJcIiwgXCJ0aW1lWm9uZU5hbWVcIl07XG5cbmZ1bmN0aW9uIGlzRGF0ZUZvcm1hdE9ubHkob2JqKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0bUtleXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eSh0bUtleXNbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGlzVGltZUZvcm1hdE9ubHkob2JqKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkdEtleXMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShkdEtleXNbaV0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGpvaW5EYXRlQW5kVGltZUZvcm1hdHMoZGF0ZUZvcm1hdE9iaiwgdGltZUZvcm1hdE9iaikge1xuICAgIHZhciBvID0geyBfOiB7fSB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHRLZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChkYXRlRm9ybWF0T2JqW2R0S2V5c1tpXV0pIHtcbiAgICAgICAgICAgIG9bZHRLZXlzW2ldXSA9IGRhdGVGb3JtYXRPYmpbZHRLZXlzW2ldXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0ZUZvcm1hdE9iai5fW2R0S2V5c1tpXV0pIHtcbiAgICAgICAgICAgIG8uX1tkdEtleXNbaV1dID0gZGF0ZUZvcm1hdE9iai5fW2R0S2V5c1tpXV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCB0bUtleXMubGVuZ3RoOyBqICs9IDEpIHtcbiAgICAgICAgaWYgKHRpbWVGb3JtYXRPYmpbdG1LZXlzW2pdXSkge1xuICAgICAgICAgICAgb1t0bUtleXNbal1dID0gdGltZUZvcm1hdE9ialt0bUtleXNbal1dO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aW1lRm9ybWF0T2JqLl9bdG1LZXlzW2pdXSkge1xuICAgICAgICAgICAgby5fW3RtS2V5c1tqXV0gPSB0aW1lRm9ybWF0T2JqLl9bdG1LZXlzW2pdXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbztcbn1cblxuZnVuY3Rpb24gY29tcHV0ZUZpbmFsUGF0dGVybnMoZm9ybWF0T2JqKSB7XG4gICAgLy8gRnJvbSBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9Gb3JtYXRfUGF0dGVybnM6XG4gICAgLy8gICdJbiBwYXR0ZXJucywgdHdvIHNpbmdsZSBxdW90ZXMgcmVwcmVzZW50cyBhIGxpdGVyYWwgc2luZ2xlIHF1b3RlLCBlaXRoZXJcbiAgICAvLyAgIGluc2lkZSBvciBvdXRzaWRlIHNpbmdsZSBxdW90ZXMuIFRleHQgd2l0aGluIHNpbmdsZSBxdW90ZXMgaXMgbm90XG4gICAgLy8gICBpbnRlcnByZXRlZCBpbiBhbnkgd2F5IChleGNlcHQgZm9yIHR3byBhZGphY2VudCBzaW5nbGUgcXVvdGVzKS4nXG4gICAgZm9ybWF0T2JqLnBhdHRlcm4xMiA9IGZvcm1hdE9iai5leHRlbmRlZFBhdHRlcm4ucmVwbGFjZSgvJyhbXiddKiknL2csIGZ1bmN0aW9uICgkMCwgbGl0ZXJhbCkge1xuICAgICAgICByZXR1cm4gbGl0ZXJhbCA/IGxpdGVyYWwgOiBcIidcIjtcbiAgICB9KTtcblxuICAgIC8vIHBhdHRlcm4gMTIgaXMgYWx3YXlzIHRoZSBkZWZhdWx0LiB3ZSBjYW4gcHJvZHVjZSB0aGUgMjQgYnkgcmVtb3Zpbmcge2FtcG19XG4gICAgZm9ybWF0T2JqLnBhdHRlcm4gPSBmb3JtYXRPYmoucGF0dGVybjEyLnJlcGxhY2UoJ3thbXBtfScsICcnKS5yZXBsYWNlKGV4cFBhdHRlcm5UcmltbWVyLCAnJyk7XG4gICAgcmV0dXJuIGZvcm1hdE9iajtcbn1cblxuZnVuY3Rpb24gZXhwRFRDb21wb25lbnRzTWV0YSgkMCwgZm9ybWF0T2JqKSB7XG4gICAgc3dpdGNoICgkMC5jaGFyQXQoMCkpIHtcbiAgICAgICAgLy8gLS0tIEVyYVxuICAgICAgICBjYXNlICdHJzpcbiAgICAgICAgICAgIGZvcm1hdE9iai5lcmEgPSBbJ3Nob3J0JywgJ3Nob3J0JywgJ3Nob3J0JywgJ2xvbmcnLCAnbmFycm93J11bJDAubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gJ3tlcmF9JztcblxuICAgICAgICAvLyAtLS0gWWVhclxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgY2FzZSAnWSc6XG4gICAgICAgIGNhc2UgJ3UnOlxuICAgICAgICBjYXNlICdVJzpcbiAgICAgICAgY2FzZSAncic6XG4gICAgICAgICAgICBmb3JtYXRPYmoueWVhciA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne3llYXJ9JztcblxuICAgICAgICAvLyAtLS0gUXVhcnRlciAobm90IHN1cHBvcnRlZCBpbiB0aGlzIHBvbHlmaWxsKVxuICAgICAgICBjYXNlICdRJzpcbiAgICAgICAgY2FzZSAncSc6XG4gICAgICAgICAgICBmb3JtYXRPYmoucXVhcnRlciA9IFsnbnVtZXJpYycsICcyLWRpZ2l0JywgJ3Nob3J0JywgJ2xvbmcnLCAnbmFycm93J11bJDAubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gJ3txdWFydGVyfSc7XG5cbiAgICAgICAgLy8gLS0tIE1vbnRoXG4gICAgICAgIGNhc2UgJ00nOlxuICAgICAgICBjYXNlICdMJzpcbiAgICAgICAgICAgIGZvcm1hdE9iai5tb250aCA9IFsnbnVtZXJpYycsICcyLWRpZ2l0JywgJ3Nob3J0JywgJ2xvbmcnLCAnbmFycm93J11bJDAubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICByZXR1cm4gJ3ttb250aH0nO1xuXG4gICAgICAgIC8vIC0tLSBXZWVrIChub3Qgc3VwcG9ydGVkIGluIHRoaXMgcG9seWZpbGwpXG4gICAgICAgIGNhc2UgJ3cnOlxuICAgICAgICAgICAgLy8gd2VlayBvZiB0aGUgeWVhclxuICAgICAgICAgICAgZm9ybWF0T2JqLndlZWsgPSAkMC5sZW5ndGggPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3t3ZWVrZGF5fSc7XG4gICAgICAgIGNhc2UgJ1cnOlxuICAgICAgICAgICAgLy8gd2VlayBvZiB0aGUgbW9udGhcbiAgICAgICAgICAgIGZvcm1hdE9iai53ZWVrID0gJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7d2Vla2RheX0nO1xuXG4gICAgICAgIC8vIC0tLSBEYXlcbiAgICAgICAgY2FzZSAnZCc6XG4gICAgICAgICAgICAvLyBkYXkgb2YgdGhlIG1vbnRoXG4gICAgICAgICAgICBmb3JtYXRPYmouZGF5ID0gJDAubGVuZ3RoID09PSAyID8gJzItZGlnaXQnIDogJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7ZGF5fSc7XG4gICAgICAgIGNhc2UgJ0QnOiAvLyBkYXkgb2YgdGhlIHllYXJcbiAgICAgICAgY2FzZSAnRic6IC8vIGRheSBvZiB0aGUgd2Vla1xuICAgICAgICBjYXNlICdnJzpcbiAgICAgICAgICAgIC8vIDEuLm46IE1vZGlmaWVkIEp1bGlhbiBkYXlcbiAgICAgICAgICAgIGZvcm1hdE9iai5kYXkgPSAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3tkYXl9JztcblxuICAgICAgICAvLyAtLS0gV2VlayBEYXlcbiAgICAgICAgY2FzZSAnRSc6XG4gICAgICAgICAgICAvLyBkYXkgb2YgdGhlIHdlZWtcbiAgICAgICAgICAgIGZvcm1hdE9iai53ZWVrZGF5ID0gWydzaG9ydCcsICdzaG9ydCcsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdycsICdzaG9ydCddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7d2Vla2RheX0nO1xuICAgICAgICBjYXNlICdlJzpcbiAgICAgICAgICAgIC8vIGxvY2FsIGRheSBvZiB0aGUgd2Vla1xuICAgICAgICAgICAgZm9ybWF0T2JqLndlZWtkYXkgPSBbJ251bWVyaWMnLCAnMi1kaWdpdCcsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdycsICdzaG9ydCddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7d2Vla2RheX0nO1xuICAgICAgICBjYXNlICdjJzpcbiAgICAgICAgICAgIC8vIHN0YW5kIGFsb25lIGxvY2FsIGRheSBvZiB0aGUgd2Vla1xuICAgICAgICAgICAgZm9ybWF0T2JqLndlZWtkYXkgPSBbJ251bWVyaWMnLCB1bmRlZmluZWQsICdzaG9ydCcsICdsb25nJywgJ25hcnJvdycsICdzaG9ydCddWyQwLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgcmV0dXJuICd7d2Vla2RheX0nO1xuXG4gICAgICAgIC8vIC0tLSBQZXJpb2RcbiAgICAgICAgY2FzZSAnYSc6IC8vIEFNLCBQTVxuICAgICAgICBjYXNlICdiJzogLy8gYW0sIHBtLCBub29uLCBtaWRuaWdodFxuICAgICAgICBjYXNlICdCJzpcbiAgICAgICAgICAgIC8vIGZsZXhpYmxlIGRheSBwZXJpb2RzXG4gICAgICAgICAgICBmb3JtYXRPYmouaG91cjEyID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiAne2FtcG19JztcblxuICAgICAgICAvLyAtLS0gSG91clxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgY2FzZSAnSCc6XG4gICAgICAgICAgICBmb3JtYXRPYmouaG91ciA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne2hvdXJ9JztcbiAgICAgICAgY2FzZSAnayc6XG4gICAgICAgIGNhc2UgJ0snOlxuICAgICAgICAgICAgZm9ybWF0T2JqLmhvdXIxMiA9IHRydWU7IC8vIDEyLWhvdXItY3ljbGUgdGltZSBmb3JtYXRzICh1c2luZyBoIG9yIEspXG4gICAgICAgICAgICBmb3JtYXRPYmouaG91ciA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne2hvdXJ9JztcblxuICAgICAgICAvLyAtLS0gTWludXRlXG4gICAgICAgIGNhc2UgJ20nOlxuICAgICAgICAgICAgZm9ybWF0T2JqLm1pbnV0ZSA9ICQwLmxlbmd0aCA9PT0gMiA/ICcyLWRpZ2l0JyA6ICdudW1lcmljJztcbiAgICAgICAgICAgIHJldHVybiAne21pbnV0ZX0nO1xuXG4gICAgICAgIC8vIC0tLSBTZWNvbmRcbiAgICAgICAgY2FzZSAncyc6XG4gICAgICAgICAgICBmb3JtYXRPYmouc2Vjb25kID0gJDAubGVuZ3RoID09PSAyID8gJzItZGlnaXQnIDogJ251bWVyaWMnO1xuICAgICAgICAgICAgcmV0dXJuICd7c2Vjb25kfSc7XG4gICAgICAgIGNhc2UgJ1MnOlxuICAgICAgICBjYXNlICdBJzpcbiAgICAgICAgICAgIGZvcm1hdE9iai5zZWNvbmQgPSAnbnVtZXJpYyc7XG4gICAgICAgICAgICByZXR1cm4gJ3tzZWNvbmR9JztcblxuICAgICAgICAvLyAtLS0gVGltZXpvbmVcbiAgICAgICAgY2FzZSAneic6IC8vIDEuLjMsIDQ6IHNwZWNpZmljIG5vbi1sb2NhdGlvbiBmb3JtYXRcbiAgICAgICAgY2FzZSAnWic6IC8vIDEuLjMsIDQsIDU6IFRoZSBJU084NjAxIHZhcmlvcyBmb3JtYXRzXG4gICAgICAgIGNhc2UgJ08nOiAvLyAxLCA0OiBtaWxpc2Vjb25kcyBpbiBkYXkgc2hvcnQsIGxvbmdcbiAgICAgICAgY2FzZSAndic6IC8vIDEsIDQ6IGdlbmVyaWMgbm9uLWxvY2F0aW9uIGZvcm1hdFxuICAgICAgICBjYXNlICdWJzogLy8gMSwgMiwgMywgNDogdGltZSB6b25lIElEIG9yIGNpdHlcbiAgICAgICAgY2FzZSAnWCc6IC8vIDEsIDIsIDMsIDQ6IFRoZSBJU084NjAxIHZhcmlvcyBmb3JtYXRzXG4gICAgICAgIGNhc2UgJ3gnOlxuICAgICAgICAgICAgLy8gMSwgMiwgMywgNDogVGhlIElTTzg2MDEgdmFyaW9zIGZvcm1hdHNcbiAgICAgICAgICAgIC8vIHRoaXMgcG9seWZpbGwgb25seSBzdXBwb3J0cyBtdWNoLCBmb3Igbm93LCB3ZSBhcmUganVzdCBkb2luZyBzb21ldGhpbmcgZHVtbXlcbiAgICAgICAgICAgIGZvcm1hdE9iai50aW1lWm9uZU5hbWUgPSAkMC5sZW5ndGggPCA0ID8gJ3Nob3J0JyA6ICdsb25nJztcbiAgICAgICAgICAgIHJldHVybiAne3RpbWVab25lTmFtZX0nO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0aGUgQ0xEUiBhdmFpbGFibGVGb3JtYXRzIGludG8gdGhlIG9iamVjdHMgYW5kIHBhdHRlcm5zIHJlcXVpcmVkIGJ5XG4gKiB0aGUgRUNNQVNjcmlwdCBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgc3BlY2lmaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlRGF0ZVRpbWVGb3JtYXQoc2tlbGV0b24sIHBhdHRlcm4pIHtcbiAgICAvLyB3ZSBpZ25vcmUgY2VydGFpbiBwYXR0ZXJucyB0aGF0IGFyZSB1bnN1cHBvcnRlZCB0byBhdm9pZCB0aGlzIGV4cGVuc2l2ZSBvcC5cbiAgICBpZiAodW53YW50ZWREVENzLnRlc3QocGF0dGVybikpIHJldHVybiB1bmRlZmluZWQ7XG5cbiAgICB2YXIgZm9ybWF0T2JqID0ge1xuICAgICAgICBvcmlnaW5hbFBhdHRlcm46IHBhdHRlcm4sXG4gICAgICAgIF86IHt9XG4gICAgfTtcblxuICAgIC8vIFJlcGxhY2UgdGhlIHBhdHRlcm4gc3RyaW5nIHdpdGggdGhlIG9uZSByZXF1aXJlZCBieSB0aGUgc3BlY2lmaWNhdGlvbiwgd2hpbHN0XG4gICAgLy8gYXQgdGhlIHNhbWUgdGltZSBldmFsdWF0aW5nIGl0IGZvciB0aGUgc3Vic2V0cyBhbmQgZm9ybWF0c1xuICAgIGZvcm1hdE9iai5leHRlbmRlZFBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoZXhwRFRDb21wb25lbnRzLCBmdW5jdGlvbiAoJDApIHtcbiAgICAgICAgLy8gU2VlIHdoaWNoIHN5bWJvbCB3ZSdyZSBkZWFsaW5nIHdpdGhcbiAgICAgICAgcmV0dXJuIGV4cERUQ29tcG9uZW50c01ldGEoJDAsIGZvcm1hdE9iai5fKTtcbiAgICB9KTtcblxuICAgIC8vIE1hdGNoIHRoZSBza2VsZXRvbiBzdHJpbmcgd2l0aCB0aGUgb25lIHJlcXVpcmVkIGJ5IHRoZSBzcGVjaWZpY2F0aW9uXG4gICAgLy8gdGhpcyBpbXBsZW1lbnRhdGlvbiBpcyBiYXNlZCBvbiB0aGUgRGF0ZSBGaWVsZCBTeW1ib2wgVGFibGU6XG4gICAgLy8gaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjRGF0ZV9GaWVsZF9TeW1ib2xfVGFibGVcbiAgICAvLyBOb3RlOiB3ZSBhcmUgYWRkaW5nIGV4dHJhIGRhdGEgdG8gdGhlIGZvcm1hdE9iamVjdCBldmVuIHRob3VnaCB0aGlzIHBvbHlmaWxsXG4gICAgLy8gICAgICAgbWlnaHQgbm90IHN1cHBvcnQgaXQuXG4gICAgc2tlbGV0b24ucmVwbGFjZShleHBEVENvbXBvbmVudHMsIGZ1bmN0aW9uICgkMCkge1xuICAgICAgICAvLyBTZWUgd2hpY2ggc3ltYm9sIHdlJ3JlIGRlYWxpbmcgd2l0aFxuICAgICAgICByZXR1cm4gZXhwRFRDb21wb25lbnRzTWV0YSgkMCwgZm9ybWF0T2JqKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb21wdXRlRmluYWxQYXR0ZXJucyhmb3JtYXRPYmopO1xufVxuXG4vKipcbiAqIFByb2Nlc3NlcyBEYXRlVGltZSBmb3JtYXRzIGZyb20gQ0xEUiB0byBhbiBlYXNpZXItdG8tcGFyc2UgZm9ybWF0LlxuICogdGhlIHJlc3VsdCBvZiB0aGlzIG9wZXJhdGlvbiBzaG91bGQgYmUgY2FjaGVkIHRoZSBmaXJzdCB0aW1lIGEgcGFydGljdWxhclxuICogY2FsZW5kYXIgaXMgYW5hbHl6ZWQuXG4gKlxuICogVGhlIHNwZWNpZmljYXRpb24gcmVxdWlyZXMgd2Ugc3VwcG9ydCBhdCBsZWFzdCB0aGUgZm9sbG93aW5nIHN1YnNldHMgb2ZcbiAqIGRhdGUvdGltZSBjb21wb25lbnRzOlxuICpcbiAqICAgLSAnd2Vla2RheScsICd5ZWFyJywgJ21vbnRoJywgJ2RheScsICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnXG4gKiAgIC0gJ3dlZWtkYXknLCAneWVhcicsICdtb250aCcsICdkYXknXG4gKiAgIC0gJ3llYXInLCAnbW9udGgnLCAnZGF5J1xuICogICAtICd5ZWFyJywgJ21vbnRoJ1xuICogICAtICdtb250aCcsICdkYXknXG4gKiAgIC0gJ2hvdXInLCAnbWludXRlJywgJ3NlY29uZCdcbiAqICAgLSAnaG91cicsICdtaW51dGUnXG4gKlxuICogV2UgbmVlZCB0byBjaGVycnkgcGljayBhdCBsZWFzdCB0aGVzZSBzdWJzZXRzIGZyb20gdGhlIENMRFIgZGF0YSBhbmQgY29udmVydFxuICogdGhlbSBpbnRvIHRoZSBwYXR0ZXJuIG9iamVjdHMgdXNlZCBpbiB0aGUgRUNNQS00MDIgQVBJLlxuICovXG5mdW5jdGlvbiBjcmVhdGVEYXRlVGltZUZvcm1hdHMoZm9ybWF0cykge1xuICAgIHZhciBhdmFpbGFibGVGb3JtYXRzID0gZm9ybWF0cy5hdmFpbGFibGVGb3JtYXRzO1xuICAgIHZhciB0aW1lRm9ybWF0cyA9IGZvcm1hdHMudGltZUZvcm1hdHM7XG4gICAgdmFyIGRhdGVGb3JtYXRzID0gZm9ybWF0cy5kYXRlRm9ybWF0cztcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHNrZWxldG9uID0gdm9pZCAwLFxuICAgICAgICBwYXR0ZXJuID0gdm9pZCAwLFxuICAgICAgICBjb21wdXRlZCA9IHZvaWQgMCxcbiAgICAgICAgaSA9IHZvaWQgMCxcbiAgICAgICAgaiA9IHZvaWQgMDtcbiAgICB2YXIgdGltZVJlbGF0ZWRGb3JtYXRzID0gW107XG4gICAgdmFyIGRhdGVSZWxhdGVkRm9ybWF0cyA9IFtdO1xuXG4gICAgLy8gTWFwIGF2YWlsYWJsZSAoY3VzdG9tKSBmb3JtYXRzIGludG8gYSBwYXR0ZXJuIGZvciBjcmVhdGVEYXRlVGltZUZvcm1hdHNcbiAgICBmb3IgKHNrZWxldG9uIGluIGF2YWlsYWJsZUZvcm1hdHMpIHtcbiAgICAgICAgaWYgKGF2YWlsYWJsZUZvcm1hdHMuaGFzT3duUHJvcGVydHkoc2tlbGV0b24pKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gYXZhaWxhYmxlRm9ybWF0c1tza2VsZXRvbl07XG4gICAgICAgICAgICBjb21wdXRlZCA9IGNyZWF0ZURhdGVUaW1lRm9ybWF0KHNrZWxldG9uLCBwYXR0ZXJuKTtcbiAgICAgICAgICAgIGlmIChjb21wdXRlZCkge1xuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICAgICAgICAvLyBpbiBzb21lIGNhc2VzLCB0aGUgZm9ybWF0IGlzIG9ubHkgZGlzcGxheWluZyBkYXRlIHNwZWNpZmljIHByb3BzXG4gICAgICAgICAgICAgICAgLy8gb3IgdGltZSBzcGVjaWZpYyBwcm9wcywgaW4gd2hpY2ggY2FzZSB3ZSBuZWVkIHRvIGFsc28gcHJvZHVjZSB0aGVcbiAgICAgICAgICAgICAgICAvLyBjb21iaW5lZCBmb3JtYXRzLlxuICAgICAgICAgICAgICAgIGlmIChpc0RhdGVGb3JtYXRPbmx5KGNvbXB1dGVkKSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRlUmVsYXRlZEZvcm1hdHMucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc1RpbWVGb3JtYXRPbmx5KGNvbXB1dGVkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aW1lUmVsYXRlZEZvcm1hdHMucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFwIHRpbWUgZm9ybWF0cyBpbnRvIGEgcGF0dGVybiBmb3IgY3JlYXRlRGF0ZVRpbWVGb3JtYXRzXG4gICAgZm9yIChza2VsZXRvbiBpbiB0aW1lRm9ybWF0cykge1xuICAgICAgICBpZiAodGltZUZvcm1hdHMuaGFzT3duUHJvcGVydHkoc2tlbGV0b24pKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gdGltZUZvcm1hdHNbc2tlbGV0b25dO1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjcmVhdGVEYXRlVGltZUZvcm1hdChza2VsZXRvbiwgcGF0dGVybik7XG4gICAgICAgICAgICBpZiAoY29tcHV0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgICAgICAgdGltZVJlbGF0ZWRGb3JtYXRzLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWFwIGRhdGUgZm9ybWF0cyBpbnRvIGEgcGF0dGVybiBmb3IgY3JlYXRlRGF0ZVRpbWVGb3JtYXRzXG4gICAgZm9yIChza2VsZXRvbiBpbiBkYXRlRm9ybWF0cykge1xuICAgICAgICBpZiAoZGF0ZUZvcm1hdHMuaGFzT3duUHJvcGVydHkoc2tlbGV0b24pKSB7XG4gICAgICAgICAgICBwYXR0ZXJuID0gZGF0ZUZvcm1hdHNbc2tlbGV0b25dO1xuICAgICAgICAgICAgY29tcHV0ZWQgPSBjcmVhdGVEYXRlVGltZUZvcm1hdChza2VsZXRvbiwgcGF0dGVybik7XG4gICAgICAgICAgICBpZiAoY29tcHV0ZWQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgICAgICAgZGF0ZVJlbGF0ZWRGb3JtYXRzLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29tYmluZSBjdXN0b20gdGltZSBhbmQgY3VzdG9tIGRhdGUgZm9ybWF0cyB3aGVuIHRoZXkgYXJlIG9ydGhvZ29uYWxzIHRvIGNvbXBsZXRlIHRoZVxuICAgIC8vIGZvcm1hdHMgc3VwcG9ydGVkIGJ5IENMRFIuXG4gICAgLy8gVGhpcyBBbGdvIGlzIGJhc2VkIG9uIHNlY3Rpb24gXCJNaXNzaW5nIFNrZWxldG9uIEZpZWxkc1wiIGZyb206XG4gICAgLy8gaHR0cDovL3VuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1LWRhdGVzLmh0bWwjYXZhaWxhYmxlRm9ybWF0c19hcHBlbmRJdGVtc1xuICAgIGZvciAoaSA9IDA7IGkgPCB0aW1lUmVsYXRlZEZvcm1hdHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGRhdGVSZWxhdGVkRm9ybWF0cy5sZW5ndGg7IGogKz0gMSkge1xuICAgICAgICAgICAgaWYgKGRhdGVSZWxhdGVkRm9ybWF0c1tqXS5tb250aCA9PT0gJ2xvbmcnKSB7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IGRhdGVSZWxhdGVkRm9ybWF0c1tqXS53ZWVrZGF5ID8gZm9ybWF0cy5mdWxsIDogZm9ybWF0cy5sb25nO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRlUmVsYXRlZEZvcm1hdHNbal0ubW9udGggPT09ICdzaG9ydCcpIHtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gZm9ybWF0cy5tZWRpdW07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBmb3JtYXRzLnNob3J0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29tcHV0ZWQgPSBqb2luRGF0ZUFuZFRpbWVGb3JtYXRzKGRhdGVSZWxhdGVkRm9ybWF0c1tqXSwgdGltZVJlbGF0ZWRGb3JtYXRzW2ldKTtcbiAgICAgICAgICAgIGNvbXB1dGVkLm9yaWdpbmFsUGF0dGVybiA9IHBhdHRlcm47XG4gICAgICAgICAgICBjb21wdXRlZC5leHRlbmRlZFBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoJ3swfScsIHRpbWVSZWxhdGVkRm9ybWF0c1tpXS5leHRlbmRlZFBhdHRlcm4pLnJlcGxhY2UoJ3sxfScsIGRhdGVSZWxhdGVkRm9ybWF0c1tqXS5leHRlbmRlZFBhdHRlcm4pLnJlcGxhY2UoL15bLFxcc10rfFssXFxzXSskL2dpLCAnJyk7XG4gICAgICAgICAgICByZXN1bHQucHVzaChjb21wdXRlRmluYWxQYXR0ZXJucyhjb21wdXRlZCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLy8gdGhpcyByZXByZXNlbnRzIHRoZSBleGNlcHRpb25zIG9mIHRoZSBydWxlIHRoYXQgYXJlIG5vdCBjb3ZlcmVkIGJ5IENMRFIgYXZhaWxhYmxlRm9ybWF0c1xuLy8gZm9yIHNpbmdsZSBwcm9wZXJ0eSBjb25maWd1cmF0aW9ucywgdGhleSBwbGF5IG5vIHJvbGUgd2hlbiB1c2luZyBtdWx0aXBsZSBwcm9wZXJ0aWVzLCBhbmRcbi8vIHRob3NlIHRoYXQgYXJlIG5vdCBpbiB0aGlzIHRhYmxlLCBhcmUgbm90IGV4Y2VwdGlvbnMgb3IgYXJlIG5vdCBjb3ZlcmVkIGJ5IHRoZSBkYXRhIHdlXG4vLyBwcm92aWRlLlxudmFyIHZhbGlkU3ludGhldGljUHJvcHMgPSB7XG4gICAgc2Vjb25kOiB7XG4gICAgICAgIG51bWVyaWM6ICdzJyxcbiAgICAgICAgJzItZGlnaXQnOiAnc3MnXG4gICAgfSxcbiAgICBtaW51dGU6IHtcbiAgICAgICAgbnVtZXJpYzogJ20nLFxuICAgICAgICAnMi1kaWdpdCc6ICdtbSdcbiAgICB9LFxuICAgIHllYXI6IHtcbiAgICAgICAgbnVtZXJpYzogJ3knLFxuICAgICAgICAnMi1kaWdpdCc6ICd5eSdcbiAgICB9LFxuICAgIGRheToge1xuICAgICAgICBudW1lcmljOiAnZCcsXG4gICAgICAgICcyLWRpZ2l0JzogJ2RkJ1xuICAgIH0sXG4gICAgbW9udGg6IHtcbiAgICAgICAgbnVtZXJpYzogJ0wnLFxuICAgICAgICAnMi1kaWdpdCc6ICdMTCcsXG4gICAgICAgIG5hcnJvdzogJ0xMTExMJyxcbiAgICAgICAgc2hvcnQ6ICdMTEwnLFxuICAgICAgICBsb25nOiAnTExMTCdcbiAgICB9LFxuICAgIHdlZWtkYXk6IHtcbiAgICAgICAgbmFycm93OiAnY2NjY2MnLFxuICAgICAgICBzaG9ydDogJ2NjYycsXG4gICAgICAgIGxvbmc6ICdjY2NjJ1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGdlbmVyYXRlU3ludGhldGljRm9ybWF0KHByb3BOYW1lLCBwcm9wVmFsdWUpIHtcbiAgICBpZiAodmFsaWRTeW50aGV0aWNQcm9wc1twcm9wTmFtZV0gJiYgdmFsaWRTeW50aGV0aWNQcm9wc1twcm9wTmFtZV1bcHJvcFZhbHVlXSkge1xuICAgICAgICB2YXIgX3JlZjI7XG5cbiAgICAgICAgcmV0dXJuIF9yZWYyID0ge1xuICAgICAgICAgICAgb3JpZ2luYWxQYXR0ZXJuOiB2YWxpZFN5bnRoZXRpY1Byb3BzW3Byb3BOYW1lXVtwcm9wVmFsdWVdLFxuICAgICAgICAgICAgXzogZGVmaW5lUHJvcGVydHkkMSh7fSwgcHJvcE5hbWUsIHByb3BWYWx1ZSksXG4gICAgICAgICAgICBleHRlbmRlZFBhdHRlcm46IFwie1wiICsgcHJvcE5hbWUgKyBcIn1cIlxuICAgICAgICB9LCBkZWZpbmVQcm9wZXJ0eSQxKF9yZWYyLCBwcm9wTmFtZSwgcHJvcFZhbHVlKSwgZGVmaW5lUHJvcGVydHkkMShfcmVmMiwgXCJwYXR0ZXJuMTJcIiwgXCJ7XCIgKyBwcm9wTmFtZSArIFwifVwiKSwgZGVmaW5lUHJvcGVydHkkMShfcmVmMiwgXCJwYXR0ZXJuXCIsIFwie1wiICsgcHJvcE5hbWUgKyBcIn1cIiksIF9yZWYyO1xuICAgIH1cbn1cblxuLy8gQW4gb2JqZWN0IG1hcCBvZiBkYXRlIGNvbXBvbmVudCBrZXlzLCBzYXZlcyB1c2luZyBhIHJlZ2V4IGxhdGVyXG52YXIgZGF0ZVdpZHRocyA9IG9iakNyZWF0ZShudWxsLCB7IG5hcnJvdzoge30sIHNob3J0OiB7fSwgbG9uZzoge30gfSk7XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBmb3IgYSBkYXRlIGNvbXBvbmVudCwgcmVzb2x2ZWQgdXNpbmcgbXVsdGlwbGUgaW5oZXJpdGFuY2UgYXMgc3BlY2lmaWVkXG4gKiBhcyBzcGVjaWZpZWQgaW4gdGhlIFVuaWNvZGUgVGVjaG5pY2FsIFN0YW5kYXJkIDM1LlxuICovXG5mdW5jdGlvbiByZXNvbHZlRGF0ZVN0cmluZyhkYXRhLCBjYSwgY29tcG9uZW50LCB3aWR0aCwga2V5KSB7XG4gICAgLy8gRnJvbSBodHRwOi8vd3d3LnVuaWNvZGUub3JnL3JlcG9ydHMvdHIzNS90cjM1Lmh0bWwjTXVsdGlwbGVfSW5oZXJpdGFuY2U6XG4gICAgLy8gJ0luIGNsZWFybHkgc3BlY2lmaWVkIGluc3RhbmNlcywgcmVzb3VyY2VzIG1heSBpbmhlcml0IGZyb20gd2l0aGluIHRoZSBzYW1lIGxvY2FsZS5cbiAgICAvLyAgRm9yIGV4YW1wbGUsIC4uLiB0aGUgQnVkZGhpc3QgY2FsZW5kYXIgaW5oZXJpdHMgZnJvbSB0aGUgR3JlZ29yaWFuIGNhbGVuZGFyLidcbiAgICB2YXIgb2JqID0gZGF0YVtjYV0gJiYgZGF0YVtjYV1bY29tcG9uZW50XSA/IGRhdGFbY2FdW2NvbXBvbmVudF0gOiBkYXRhLmdyZWdvcnlbY29tcG9uZW50XSxcblxuXG4gICAgLy8gXCJzaWRld2F5c1wiIGluaGVyaXRhbmNlIHJlc29sdmVzIHN0cmluZ3Mgd2hlbiBhIGtleSBkb2Vzbid0IGV4aXN0XG4gICAgYWx0cyA9IHtcbiAgICAgICAgbmFycm93OiBbJ3Nob3J0JywgJ2xvbmcnXSxcbiAgICAgICAgc2hvcnQ6IFsnbG9uZycsICduYXJyb3cnXSxcbiAgICAgICAgbG9uZzogWydzaG9ydCcsICduYXJyb3cnXVxuICAgIH0sXG5cblxuICAgIC8vXG4gICAgcmVzb2x2ZWQgPSBob3AuY2FsbChvYmosIHdpZHRoKSA/IG9ialt3aWR0aF0gOiBob3AuY2FsbChvYmosIGFsdHNbd2lkdGhdWzBdKSA/IG9ialthbHRzW3dpZHRoXVswXV0gOiBvYmpbYWx0c1t3aWR0aF1bMV1dO1xuXG4gICAgLy8gYGtleWAgd291bGRuJ3QgYmUgc3BlY2lmaWVkIGZvciBjb21wb25lbnRzICdkYXlQZXJpb2RzJ1xuICAgIHJldHVybiBrZXkgIT09IG51bGwgPyByZXNvbHZlZFtrZXldIDogcmVzb2x2ZWQ7XG59XG5cbi8vIERlZmluZSB0aGUgRGF0ZVRpbWVGb3JtYXQgY29uc3RydWN0b3IgaW50ZXJuYWxseSBzbyBpdCBjYW5ub3QgYmUgdGFpbnRlZFxuZnVuY3Rpb24gRGF0ZVRpbWVGb3JtYXRDb25zdHJ1Y3RvcigpIHtcbiAgICB2YXIgbG9jYWxlcyA9IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmICghdGhpcyB8fCB0aGlzID09PSBJbnRsKSB7XG4gICAgICAgIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsb2NhbGVzLCBvcHRpb25zKTtcbiAgICB9XG4gICAgcmV0dXJuIEluaXRpYWxpemVEYXRlVGltZUZvcm1hdCh0b09iamVjdCh0aGlzKSwgbG9jYWxlcywgb3B0aW9ucyk7XG59XG5cbmRlZmluZVByb3BlcnR5KEludGwsICdEYXRlVGltZUZvcm1hdCcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IERhdGVUaW1lRm9ybWF0Q29uc3RydWN0b3Jcbn0pO1xuXG4vLyBNdXN0IGV4cGxpY2l0bHkgc2V0IHByb3RvdHlwZXMgYXMgdW53cml0YWJsZVxuZGVmaW5lUHJvcGVydHkoRGF0ZVRpbWVGb3JtYXRDb25zdHJ1Y3RvciwgJ3Byb3RvdHlwZScsIHtcbiAgICB3cml0YWJsZTogZmFsc2Vcbn0pO1xuXG4vKipcbiAqIFRoZSBhYnN0cmFjdCBvcGVyYXRpb24gSW5pdGlhbGl6ZURhdGVUaW1lRm9ybWF0IGFjY2VwdHMgdGhlIGFyZ3VtZW50cyBkYXRlVGltZUZvcm1hdFxuICogKHdoaWNoIG11c3QgYmUgYW4gb2JqZWN0KSwgbG9jYWxlcywgYW5kIG9wdGlvbnMuIEl0IGluaXRpYWxpemVzIGRhdGVUaW1lRm9ybWF0IGFzIGFcbiAqIERhdGVUaW1lRm9ybWF0IG9iamVjdC5cbiAqL1xuZnVuY3Rpb24gLyogMTIuMS4xLjEgKi9Jbml0aWFsaXplRGF0ZVRpbWVGb3JtYXQoZGF0ZVRpbWVGb3JtYXQsIGxvY2FsZXMsIG9wdGlvbnMpIHtcbiAgICAvLyBUaGlzIHdpbGwgYmUgYSBpbnRlcm5hbCBwcm9wZXJ0aWVzIG9iamVjdCBpZiB3ZSdyZSBub3QgYWxyZWFkeSBpbml0aWFsaXplZFxuICAgIHZhciBpbnRlcm5hbCA9IGdldEludGVybmFsUHJvcGVydGllcyhkYXRlVGltZUZvcm1hdCk7XG5cbiAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHdob3NlIHByb3BzIGNhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIHZhbHVlcyBvZiBSZWdFeHAgcHJvcHNcbiAgICB2YXIgcmVnZXhwUmVzdG9yZSA9IGNyZWF0ZVJlZ0V4cFJlc3RvcmUoKTtcblxuICAgIC8vIDEuIElmIGRhdGVUaW1lRm9ybWF0IGhhcyBhbiBbW2luaXRpYWxpemVkSW50bE9iamVjdF1dIGludGVybmFsIHByb3BlcnR5IHdpdGhcbiAgICAvLyAgICB2YWx1ZSB0cnVlLCB0aHJvdyBhIFR5cGVFcnJvciBleGNlcHRpb24uXG4gICAgaWYgKGludGVybmFsWydbW2luaXRpYWxpemVkSW50bE9iamVjdF1dJ10gPT09IHRydWUpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCBvYmplY3QgaGFzIGFscmVhZHkgYmVlbiBpbml0aWFsaXplZCBhcyBhbiBJbnRsIG9iamVjdCcpO1xuXG4gICAgLy8gTmVlZCB0aGlzIHRvIGFjY2VzcyB0aGUgYGludGVybmFsYCBvYmplY3RcbiAgICBkZWZpbmVQcm9wZXJ0eShkYXRlVGltZUZvcm1hdCwgJ19fZ2V0SW50ZXJuYWxQcm9wZXJ0aWVzJywge1xuICAgICAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgICAgICAgICAvLyBOT1RFOiBOb24tc3RhbmRhcmQsIGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1swXSA9PT0gc2VjcmV0KSByZXR1cm4gaW50ZXJuYWw7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIDIuIFNldCB0aGUgW1tpbml0aWFsaXplZEludGxPYmplY3RdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBudW1iZXJGb3JtYXQgdG8gdHJ1ZS5cbiAgICBpbnRlcm5hbFsnW1tpbml0aWFsaXplZEludGxPYmplY3RdXSddID0gdHJ1ZTtcblxuICAgIC8vIDMuIExldCByZXF1ZXN0ZWRMb2NhbGVzIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2Fub25pY2FsaXplTG9jYWxlTGlzdFxuICAgIC8vICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBpbiA5LjIuMSkgd2l0aCBhcmd1bWVudCBsb2NhbGVzLlxuICAgIHZhciByZXF1ZXN0ZWRMb2NhbGVzID0gQ2Fub25pY2FsaXplTG9jYWxlTGlzdChsb2NhbGVzKTtcblxuICAgIC8vIDQuIExldCBvcHRpb25zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgVG9EYXRlVGltZU9wdGlvbnMgYWJzdHJhY3RcbiAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwiYW55XCIsIGFuZCBcImRhdGVcIi5cbiAgICBvcHRpb25zID0gVG9EYXRlVGltZU9wdGlvbnMob3B0aW9ucywgJ2FueScsICdkYXRlJyk7XG5cbiAgICAvLyA1LiBMZXQgb3B0IGJlIGEgbmV3IFJlY29yZC5cbiAgICB2YXIgb3B0ID0gbmV3IFJlY29yZCgpO1xuXG4gICAgLy8gNi4gTGV0IG1hdGNoZXIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBHZXRPcHRpb24gYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgKGRlZmluZWQgaW4gOS4yLjkpIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwibG9jYWxlTWF0Y2hlclwiLCBcInN0cmluZ1wiLCBhIExpc3RcbiAgICAvLyAgICBjb250YWluaW5nIHRoZSB0d28gU3RyaW5nIHZhbHVlcyBcImxvb2t1cFwiIGFuZCBcImJlc3QgZml0XCIsIGFuZCBcImJlc3QgZml0XCIuXG4gICAgdmFyIG1hdGNoZXIgPSBHZXRPcHRpb24ob3B0aW9ucywgJ2xvY2FsZU1hdGNoZXInLCAnc3RyaW5nJywgbmV3IExpc3QoJ2xvb2t1cCcsICdiZXN0IGZpdCcpLCAnYmVzdCBmaXQnKTtcblxuICAgIC8vIDcuIFNldCBvcHQuW1tsb2NhbGVNYXRjaGVyXV0gdG8gbWF0Y2hlci5cbiAgICBvcHRbJ1tbbG9jYWxlTWF0Y2hlcl1dJ10gPSBtYXRjaGVyO1xuXG4gICAgLy8gOC4gTGV0IERhdGVUaW1lRm9ybWF0IGJlIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBvYmplY3QgdGhhdCBpcyB0aGUgaW5pdGlhbFxuICAgIC8vICAgIHZhbHVlIG9mIEludGwuRGF0ZVRpbWVGb3JtYXQuXG4gICAgdmFyIERhdGVUaW1lRm9ybWF0ID0gaW50ZXJuYWxzLkRhdGVUaW1lRm9ybWF0OyAvLyBUaGlzIGlzIHdoYXQgd2UgKnJlYWxseSogbmVlZFxuXG4gICAgLy8gOS4gTGV0IGxvY2FsZURhdGEgYmUgdGhlIHZhbHVlIG9mIHRoZSBbW2xvY2FsZURhdGFdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZlxuICAgIC8vICAgIERhdGVUaW1lRm9ybWF0LlxuICAgIHZhciBsb2NhbGVEYXRhID0gRGF0ZVRpbWVGb3JtYXRbJ1tbbG9jYWxlRGF0YV1dJ107XG5cbiAgICAvLyAxMC4gTGV0IHIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBSZXNvbHZlTG9jYWxlIGFic3RyYWN0IG9wZXJhdGlvblxuICAgIC8vICAgICAoZGVmaW5lZCBpbiA5LjIuNSkgd2l0aCB0aGUgW1thdmFpbGFibGVMb2NhbGVzXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAvLyAgICAgIERhdGVUaW1lRm9ybWF0LCByZXF1ZXN0ZWRMb2NhbGVzLCBvcHQsIHRoZSBbW3JlbGV2YW50RXh0ZW5zaW9uS2V5c11dXG4gICAgLy8gICAgICBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBEYXRlVGltZUZvcm1hdCwgYW5kIGxvY2FsZURhdGEuXG4gICAgdmFyIHIgPSBSZXNvbHZlTG9jYWxlKERhdGVUaW1lRm9ybWF0WydbW2F2YWlsYWJsZUxvY2FsZXNdXSddLCByZXF1ZXN0ZWRMb2NhbGVzLCBvcHQsIERhdGVUaW1lRm9ybWF0WydbW3JlbGV2YW50RXh0ZW5zaW9uS2V5c11dJ10sIGxvY2FsZURhdGEpO1xuXG4gICAgLy8gMTEuIFNldCB0aGUgW1tsb2NhbGVdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byB0aGUgdmFsdWUgb2ZcbiAgICAvLyAgICAgci5bW2xvY2FsZV1dLlxuICAgIGludGVybmFsWydbW2xvY2FsZV1dJ10gPSByWydbW2xvY2FsZV1dJ107XG5cbiAgICAvLyAxMi4gU2V0IHRoZSBbW2NhbGVuZGFyXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gdGhlIHZhbHVlIG9mXG4gICAgLy8gICAgIHIuW1tjYV1dLlxuICAgIGludGVybmFsWydbW2NhbGVuZGFyXV0nXSA9IHJbJ1tbY2FdXSddO1xuXG4gICAgLy8gMTMuIFNldCB0aGUgW1tudW1iZXJpbmdTeXN0ZW1dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byB0aGUgdmFsdWUgb2ZcbiAgICAvLyAgICAgci5bW251XV0uXG4gICAgaW50ZXJuYWxbJ1tbbnVtYmVyaW5nU3lzdGVtXV0nXSA9IHJbJ1tbbnVdXSddO1xuXG4gICAgLy8gVGhlIHNwZWNpZmljYXRpb24gZG9lc24ndCB0ZWxsIHVzIHRvIGRvIHRoaXMsIGJ1dCBpdCdzIGhlbHBmdWwgbGF0ZXIgb25cbiAgICBpbnRlcm5hbFsnW1tkYXRhTG9jYWxlXV0nXSA9IHJbJ1tbZGF0YUxvY2FsZV1dJ107XG5cbiAgICAvLyAxNC4gTGV0IGRhdGFMb2NhbGUgYmUgdGhlIHZhbHVlIG9mIHIuW1tkYXRhTG9jYWxlXV0uXG4gICAgdmFyIGRhdGFMb2NhbGUgPSByWydbW2RhdGFMb2NhbGVdXSddO1xuXG4gICAgLy8gMTUuIExldCB0eiBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnMgd2l0aFxuICAgIC8vICAgICBhcmd1bWVudCBcInRpbWVab25lXCIuXG4gICAgdmFyIHR6ID0gb3B0aW9ucy50aW1lWm9uZTtcblxuICAgIC8vIDE2LiBJZiB0eiBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgaWYgKHR6ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gTGV0IHR6IGJlIFRvU3RyaW5nKHR6KS5cbiAgICAgICAgLy8gYi4gQ29udmVydCB0eiB0byB1cHBlciBjYXNlIGFzIGRlc2NyaWJlZCBpbiA2LjEuXG4gICAgICAgIC8vICAgIE5PVEU6IElmIGFuIGltcGxlbWVudGF0aW9uIGFjY2VwdHMgYWRkaXRpb25hbCB0aW1lIHpvbmUgdmFsdWVzLCBhcyBwZXJtaXR0ZWRcbiAgICAgICAgLy8gICAgICAgICAgdW5kZXIgY2VydGFpbiBjb25kaXRpb25zIGJ5IHRoZSBDb25mb3JtYW5jZSBjbGF1c2UsIGRpZmZlcmVudCBjYXNpbmdcbiAgICAgICAgLy8gICAgICAgICAgcnVsZXMgYXBwbHkuXG4gICAgICAgIHR6ID0gdG9MYXRpblVwcGVyQ2FzZSh0eik7XG5cbiAgICAgICAgLy8gYy4gSWYgdHogaXMgbm90IFwiVVRDXCIsIHRoZW4gdGhyb3cgYSBSYW5nZUVycm9yIGV4Y2VwdGlvbi5cbiAgICAgICAgLy8gIyMjVE9ETzogYWNjZXB0IG1vcmUgdGltZSB6b25lcyMjI1xuICAgICAgICBpZiAodHogIT09ICdVVEMnKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGltZVpvbmUgaXMgbm90IHN1cHBvcnRlZC4nKTtcbiAgICB9XG5cbiAgICAvLyAxNy4gU2V0IHRoZSBbW3RpbWVab25lXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG8gdHouXG4gICAgaW50ZXJuYWxbJ1tbdGltZVpvbmVdXSddID0gdHo7XG5cbiAgICAvLyAxOC4gTGV0IG9wdCBiZSBhIG5ldyBSZWNvcmQuXG4gICAgb3B0ID0gbmV3IFJlY29yZCgpO1xuXG4gICAgLy8gMTkuIEZvciBlYWNoIHJvdyBvZiBUYWJsZSAzLCBleGNlcHQgdGhlIGhlYWRlciByb3csIGRvOlxuICAgIGZvciAodmFyIHByb3AgaW4gZGF0ZVRpbWVDb21wb25lbnRzKSB7XG4gICAgICAgIGlmICghaG9wLmNhbGwoZGF0ZVRpbWVDb21wb25lbnRzLCBwcm9wKSkgY29udGludWU7XG5cbiAgICAgICAgLy8gMjAuIExldCBwcm9wIGJlIHRoZSBuYW1lIGdpdmVuIGluIHRoZSBQcm9wZXJ0eSBjb2x1bW4gb2YgdGhlIHJvdy5cbiAgICAgICAgLy8gMjEuIExldCB2YWx1ZSBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24sXG4gICAgICAgIC8vICAgICBwYXNzaW5nIGFzIGFyZ3VtZW50IG9wdGlvbnMsIHRoZSBuYW1lIGdpdmVuIGluIHRoZSBQcm9wZXJ0eSBjb2x1bW4gb2YgdGhlXG4gICAgICAgIC8vICAgICByb3csIFwic3RyaW5nXCIsIGEgTGlzdCBjb250YWluaW5nIHRoZSBzdHJpbmdzIGdpdmVuIGluIHRoZSBWYWx1ZXMgY29sdW1uIG9mXG4gICAgICAgIC8vICAgICB0aGUgcm93LCBhbmQgdW5kZWZpbmVkLlxuICAgICAgICB2YXIgdmFsdWUgPSBHZXRPcHRpb24ob3B0aW9ucywgcHJvcCwgJ3N0cmluZycsIGRhdGVUaW1lQ29tcG9uZW50c1twcm9wXSk7XG5cbiAgICAgICAgLy8gMjIuIFNldCBvcHQuW1s8cHJvcD5dXSB0byB2YWx1ZS5cbiAgICAgICAgb3B0WydbWycgKyBwcm9wICsgJ11dJ10gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICAvLyBBc3NpZ25lZCBhIHZhbHVlIGJlbG93XG4gICAgdmFyIGJlc3RGb3JtYXQgPSB2b2lkIDA7XG5cbiAgICAvLyAyMy4gTGV0IGRhdGFMb2NhbGVEYXRhIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAvLyAgICAgbG9jYWxlRGF0YSB3aXRoIGFyZ3VtZW50IGRhdGFMb2NhbGUuXG4gICAgdmFyIGRhdGFMb2NhbGVEYXRhID0gbG9jYWxlRGF0YVtkYXRhTG9jYWxlXTtcblxuICAgIC8vIDI0LiBMZXQgZm9ybWF0cyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mXG4gICAgLy8gICAgIGRhdGFMb2NhbGVEYXRhIHdpdGggYXJndW1lbnQgXCJmb3JtYXRzXCIuXG4gICAgLy8gICAgIE5vdGU6IHdlIHByb2Nlc3MgdGhlIENMRFIgZm9ybWF0cyBpbnRvIHRoZSBzcGVjJ2Qgc3RydWN0dXJlXG4gICAgdmFyIGZvcm1hdHMgPSBUb0RhdGVUaW1lRm9ybWF0cyhkYXRhTG9jYWxlRGF0YS5mb3JtYXRzKTtcblxuICAgIC8vIDI1LiBMZXQgbWF0Y2hlciBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gd2l0aFxuICAgIC8vICAgICBhcmd1bWVudHMgb3B0aW9ucywgXCJmb3JtYXRNYXRjaGVyXCIsIFwic3RyaW5nXCIsIGEgTGlzdCBjb250YWluaW5nIHRoZSB0d28gU3RyaW5nXG4gICAgLy8gICAgIHZhbHVlcyBcImJhc2ljXCIgYW5kIFwiYmVzdCBmaXRcIiwgYW5kIFwiYmVzdCBmaXRcIi5cbiAgICBtYXRjaGVyID0gR2V0T3B0aW9uKG9wdGlvbnMsICdmb3JtYXRNYXRjaGVyJywgJ3N0cmluZycsIG5ldyBMaXN0KCdiYXNpYycsICdiZXN0IGZpdCcpLCAnYmVzdCBmaXQnKTtcblxuICAgIC8vIE9wdGltaXphdGlvbjogY2FjaGluZyB0aGUgcHJvY2Vzc2VkIGZvcm1hdHMgYXMgYSBvbmUgdGltZSBvcGVyYXRpb24gYnlcbiAgICAvLyByZXBsYWNpbmcgdGhlIGluaXRpYWwgc3RydWN0dXJlIGZyb20gbG9jYWxlRGF0YVxuICAgIGRhdGFMb2NhbGVEYXRhLmZvcm1hdHMgPSBmb3JtYXRzO1xuXG4gICAgLy8gMjYuIElmIG1hdGNoZXIgaXMgXCJiYXNpY1wiLCB0aGVuXG4gICAgaWYgKG1hdGNoZXIgPT09ICdiYXNpYycpIHtcbiAgICAgICAgLy8gMjcuIExldCBiZXN0Rm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQmFzaWNGb3JtYXRNYXRjaGVyIGFic3RyYWN0XG4gICAgICAgIC8vICAgICBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggb3B0IGFuZCBmb3JtYXRzLlxuICAgICAgICBiZXN0Rm9ybWF0ID0gQmFzaWNGb3JtYXRNYXRjaGVyKG9wdCwgZm9ybWF0cyk7XG5cbiAgICAgICAgLy8gMjguIEVsc2VcbiAgICB9IGVsc2Uge1xuICAgICAgICB7XG4gICAgICAgICAgICAvLyBkaXZlcmdpbmdcbiAgICAgICAgICAgIHZhciBfaHIgPSBHZXRPcHRpb24ob3B0aW9ucywgJ2hvdXIxMicsICdib29sZWFuJyAvKiwgdW5kZWZpbmVkLCB1bmRlZmluZWQqLyk7XG4gICAgICAgICAgICBvcHQuaG91cjEyID0gX2hyID09PSB1bmRlZmluZWQgPyBkYXRhTG9jYWxlRGF0YS5ob3VyMTIgOiBfaHI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gMjkuIExldCBiZXN0Rm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQmVzdEZpdEZvcm1hdE1hdGNoZXJcbiAgICAgICAgLy8gICAgIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZCBiZWxvdykgd2l0aCBvcHQgYW5kIGZvcm1hdHMuXG4gICAgICAgIGJlc3RGb3JtYXQgPSBCZXN0Rml0Rm9ybWF0TWF0Y2hlcihvcHQsIGZvcm1hdHMpO1xuICAgIH1cblxuICAgIC8vIDMwLiBGb3IgZWFjaCByb3cgaW4gVGFibGUgMywgZXhjZXB0IHRoZSBoZWFkZXIgcm93LCBkb1xuICAgIGZvciAodmFyIF9wcm9wIGluIGRhdGVUaW1lQ29tcG9uZW50cykge1xuICAgICAgICBpZiAoIWhvcC5jYWxsKGRhdGVUaW1lQ29tcG9uZW50cywgX3Byb3ApKSBjb250aW51ZTtcblxuICAgICAgICAvLyBhLiBMZXQgcHJvcCBiZSB0aGUgbmFtZSBnaXZlbiBpbiB0aGUgUHJvcGVydHkgY29sdW1uIG9mIHRoZSByb3cuXG4gICAgICAgIC8vIGIuIExldCBwRGVzYyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0T3duUHJvcGVydHldXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgLy8gICAgYmVzdEZvcm1hdCB3aXRoIGFyZ3VtZW50IHByb3AuXG4gICAgICAgIC8vIGMuIElmIHBEZXNjIGlzIG5vdCB1bmRlZmluZWQsIHRoZW5cbiAgICAgICAgaWYgKGhvcC5jYWxsKGJlc3RGb3JtYXQsIF9wcm9wKSkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IHAgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBiZXN0Rm9ybWF0XG4gICAgICAgICAgICAvLyAgICB3aXRoIGFyZ3VtZW50IHByb3AuXG4gICAgICAgICAgICB2YXIgcCA9IGJlc3RGb3JtYXRbX3Byb3BdO1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIGRpdmVyZ2luZ1xuICAgICAgICAgICAgICAgIHAgPSBiZXN0Rm9ybWF0Ll8gJiYgaG9wLmNhbGwoYmVzdEZvcm1hdC5fLCBfcHJvcCkgPyBiZXN0Rm9ybWF0Ll9bX3Byb3BdIDogcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gaWkuIFNldCB0aGUgW1s8cHJvcD5dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byBwLlxuICAgICAgICAgICAgaW50ZXJuYWxbJ1tbJyArIF9wcm9wICsgJ11dJ10gPSBwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHBhdHRlcm4gPSB2b2lkIDA7IC8vIEFzc2lnbmVkIGEgdmFsdWUgYmVsb3dcblxuICAgIC8vIDMxLiBMZXQgaHIxMiBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEdldE9wdGlvbiBhYnN0cmFjdCBvcGVyYXRpb24gd2l0aFxuICAgIC8vICAgICBhcmd1bWVudHMgb3B0aW9ucywgXCJob3VyMTJcIiwgXCJib29sZWFuXCIsIHVuZGVmaW5lZCwgYW5kIHVuZGVmaW5lZC5cbiAgICB2YXIgaHIxMiA9IEdldE9wdGlvbihvcHRpb25zLCAnaG91cjEyJywgJ2Jvb2xlYW4nIC8qLCB1bmRlZmluZWQsIHVuZGVmaW5lZCovKTtcblxuICAgIC8vIDMyLiBJZiBkYXRlVGltZUZvcm1hdCBoYXMgYW4gaW50ZXJuYWwgcHJvcGVydHkgW1tob3VyXV0sIHRoZW5cbiAgICBpZiAoaW50ZXJuYWxbJ1tbaG91cl1dJ10pIHtcbiAgICAgICAgLy8gYS4gSWYgaHIxMiBpcyB1bmRlZmluZWQsIHRoZW4gbGV0IGhyMTIgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dXG4gICAgICAgIC8vICAgIGludGVybmFsIG1ldGhvZCBvZiBkYXRhTG9jYWxlRGF0YSB3aXRoIGFyZ3VtZW50IFwiaG91cjEyXCIuXG4gICAgICAgIGhyMTIgPSBocjEyID09PSB1bmRlZmluZWQgPyBkYXRhTG9jYWxlRGF0YS5ob3VyMTIgOiBocjEyO1xuXG4gICAgICAgIC8vIGIuIFNldCB0aGUgW1tob3VyMTJdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byBocjEyLlxuICAgICAgICBpbnRlcm5hbFsnW1tob3VyMTJdXSddID0gaHIxMjtcblxuICAgICAgICAvLyBjLiBJZiBocjEyIGlzIHRydWUsIHRoZW5cbiAgICAgICAgaWYgKGhyMTIgPT09IHRydWUpIHtcbiAgICAgICAgICAgIC8vIGkuIExldCBob3VyTm8wIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2ZcbiAgICAgICAgICAgIC8vICAgIGRhdGFMb2NhbGVEYXRhIHdpdGggYXJndW1lbnQgXCJob3VyTm8wXCIuXG4gICAgICAgICAgICB2YXIgaG91ck5vMCA9IGRhdGFMb2NhbGVEYXRhLmhvdXJObzA7XG5cbiAgICAgICAgICAgIC8vIGlpLiBTZXQgdGhlIFtbaG91ck5vMF1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0IHRvIGhvdXJObzAuXG4gICAgICAgICAgICBpbnRlcm5hbFsnW1tob3VyTm8wXV0nXSA9IGhvdXJObzA7XG5cbiAgICAgICAgICAgIC8vIGlpaS4gTGV0IHBhdHRlcm4gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAgICAgLy8gICAgICBiZXN0Rm9ybWF0IHdpdGggYXJndW1lbnQgXCJwYXR0ZXJuMTJcIi5cbiAgICAgICAgICAgIHBhdHRlcm4gPSBiZXN0Rm9ybWF0LnBhdHRlcm4xMjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGQuIEVsc2VcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgLy8gaS4gTGV0IHBhdHRlcm4gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAgICAgLy8gICAgYmVzdEZvcm1hdCB3aXRoIGFyZ3VtZW50IFwicGF0dGVyblwiLlxuICAgICAgICAgICAgcGF0dGVybiA9IGJlc3RGb3JtYXQucGF0dGVybjtcbiAgICB9XG5cbiAgICAvLyAzMy4gRWxzZVxuICAgIGVsc2VcbiAgICAgICAgLy8gYS4gTGV0IHBhdHRlcm4gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAvLyAgICBiZXN0Rm9ybWF0IHdpdGggYXJndW1lbnQgXCJwYXR0ZXJuXCIuXG4gICAgICAgIHBhdHRlcm4gPSBiZXN0Rm9ybWF0LnBhdHRlcm47XG5cbiAgICAvLyAzNC4gU2V0IHRoZSBbW3BhdHRlcm5dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byBwYXR0ZXJuLlxuICAgIGludGVybmFsWydbW3BhdHRlcm5dXSddID0gcGF0dGVybjtcblxuICAgIC8vIDM1LiBTZXQgdGhlIFtbYm91bmRGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdCB0byB1bmRlZmluZWQuXG4gICAgaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddID0gdW5kZWZpbmVkO1xuXG4gICAgLy8gMzYuIFNldCB0aGUgW1tpbml0aWFsaXplZERhdGVUaW1lRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQgdG9cbiAgICAvLyAgICAgdHJ1ZS5cbiAgICBpbnRlcm5hbFsnW1tpbml0aWFsaXplZERhdGVUaW1lRm9ybWF0XV0nXSA9IHRydWU7XG5cbiAgICAvLyBJbiBFUzMsIHdlIG5lZWQgdG8gcHJlLWJpbmQgdGhlIGZvcm1hdCgpIGZ1bmN0aW9uXG4gICAgaWYgKGVzMykgZGF0ZVRpbWVGb3JtYXQuZm9ybWF0ID0gR2V0Rm9ybWF0RGF0ZVRpbWUuY2FsbChkYXRlVGltZUZvcm1hdCk7XG5cbiAgICAvLyBSZXN0b3JlIHRoZSBSZWdFeHAgcHJvcGVydGllc1xuICAgIHJlZ2V4cFJlc3RvcmUoKTtcblxuICAgIC8vIFJldHVybiB0aGUgbmV3bHkgaW5pdGlhbGlzZWQgb2JqZWN0XG4gICAgcmV0dXJuIGRhdGVUaW1lRm9ybWF0O1xufVxuXG4vKipcbiAqIFNldmVyYWwgRGF0ZVRpbWVGb3JtYXQgYWxnb3JpdGhtcyB1c2UgdmFsdWVzIGZyb20gdGhlIGZvbGxvd2luZyB0YWJsZSwgd2hpY2ggcHJvdmlkZXNcbiAqIHByb3BlcnR5IG5hbWVzIGFuZCBhbGxvd2FibGUgdmFsdWVzIGZvciB0aGUgY29tcG9uZW50cyBvZiBkYXRlIGFuZCB0aW1lIGZvcm1hdHM6XG4gKi9cbnZhciBkYXRlVGltZUNvbXBvbmVudHMgPSB7XG4gICAgd2Vla2RheTogW1wibmFycm93XCIsIFwic2hvcnRcIiwgXCJsb25nXCJdLFxuICAgIGVyYTogW1wibmFycm93XCIsIFwic2hvcnRcIiwgXCJsb25nXCJdLFxuICAgIHllYXI6IFtcIjItZGlnaXRcIiwgXCJudW1lcmljXCJdLFxuICAgIG1vbnRoOiBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiLCBcIm5hcnJvd1wiLCBcInNob3J0XCIsIFwibG9uZ1wiXSxcbiAgICBkYXk6IFtcIjItZGlnaXRcIiwgXCJudW1lcmljXCJdLFxuICAgIGhvdXI6IFtcIjItZGlnaXRcIiwgXCJudW1lcmljXCJdLFxuICAgIG1pbnV0ZTogW1wiMi1kaWdpdFwiLCBcIm51bWVyaWNcIl0sXG4gICAgc2Vjb25kOiBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiXSxcbiAgICB0aW1lWm9uZU5hbWU6IFtcInNob3J0XCIsIFwibG9uZ1wiXVxufTtcblxuLyoqXG4gKiBXaGVuIHRoZSBUb0RhdGVUaW1lT3B0aW9ucyBhYnN0cmFjdCBvcGVyYXRpb24gaXMgY2FsbGVkIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsXG4gKiByZXF1aXJlZCwgYW5kIGRlZmF1bHRzLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gVG9EYXRlVGltZUZvcm1hdHMoZm9ybWF0cykge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZm9ybWF0cykgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdHM7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVEYXRlVGltZUZvcm1hdHMoZm9ybWF0cyk7XG59XG5cbi8qKlxuICogV2hlbiB0aGUgVG9EYXRlVGltZU9wdGlvbnMgYWJzdHJhY3Qgb3BlcmF0aW9uIGlzIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLFxuICogcmVxdWlyZWQsIGFuZCBkZWZhdWx0cywgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbmZ1bmN0aW9uIFRvRGF0ZVRpbWVPcHRpb25zKG9wdGlvbnMsIHJlcXVpcmVkLCBkZWZhdWx0cykge1xuICAgIC8vIDEuIElmIG9wdGlvbnMgaXMgdW5kZWZpbmVkLCB0aGVuIGxldCBvcHRpb25zIGJlIG51bGwsIGVsc2UgbGV0IG9wdGlvbnMgYmVcbiAgICAvLyAgICBUb09iamVjdChvcHRpb25zKS5cbiAgICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSBvcHRpb25zID0gbnVsbDtlbHNlIHtcbiAgICAgICAgLy8gKCMxMikgb3B0aW9ucyBuZWVkcyB0byBiZSBhIFJlY29yZCwgYnV0IGl0IGFsc28gbmVlZHMgdG8gaW5oZXJpdCBwcm9wZXJ0aWVzXG4gICAgICAgIHZhciBvcHQyID0gdG9PYmplY3Qob3B0aW9ucyk7XG4gICAgICAgIG9wdGlvbnMgPSBuZXcgUmVjb3JkKCk7XG5cbiAgICAgICAgZm9yICh2YXIgayBpbiBvcHQyKSB7XG4gICAgICAgICAgICBvcHRpb25zW2tdID0gb3B0MltrXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIDIuIExldCBjcmVhdGUgYmUgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGZ1bmN0aW9uIG9iamVjdCBkZWZpbmVkIGluIEVTNSwgMTUuMi4zLjUuXG4gICAgdmFyIGNyZWF0ZSA9IG9iakNyZWF0ZTtcblxuICAgIC8vIDMuIExldCBvcHRpb25zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kIG9mIGNyZWF0ZSB3aXRoXG4gICAgLy8gICAgdW5kZWZpbmVkIGFzIHRoZSB0aGlzIHZhbHVlIGFuZCBhbiBhcmd1bWVudCBsaXN0IGNvbnRhaW5pbmcgdGhlIHNpbmdsZSBpdGVtXG4gICAgLy8gICAgb3B0aW9ucy5cbiAgICBvcHRpb25zID0gY3JlYXRlKG9wdGlvbnMpO1xuXG4gICAgLy8gNC4gTGV0IG5lZWREZWZhdWx0cyBiZSB0cnVlLlxuICAgIHZhciBuZWVkRGVmYXVsdHMgPSB0cnVlO1xuXG4gICAgLy8gNS4gSWYgcmVxdWlyZWQgaXMgXCJkYXRlXCIgb3IgXCJhbnlcIiwgdGhlblxuICAgIGlmIChyZXF1aXJlZCA9PT0gJ2RhdGUnIHx8IHJlcXVpcmVkID09PSAnYW55Jykge1xuICAgICAgICAvLyBhLiBGb3IgZWFjaCBvZiB0aGUgcHJvcGVydHkgbmFtZXMgXCJ3ZWVrZGF5XCIsIFwieWVhclwiLCBcIm1vbnRoXCIsIFwiZGF5XCI6XG4gICAgICAgIC8vIGkuIElmIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2Ygb3B0aW9ucyB3aXRoIHRoZVxuICAgICAgICAvLyAgICBwcm9wZXJ0eSBuYW1lIGlzIG5vdCB1bmRlZmluZWQsIHRoZW4gbGV0IG5lZWREZWZhdWx0cyBiZSBmYWxzZS5cbiAgICAgICAgaWYgKG9wdGlvbnMud2Vla2RheSAhPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMueWVhciAhPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMubW9udGggIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLmRheSAhPT0gdW5kZWZpbmVkKSBuZWVkRGVmYXVsdHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyA2LiBJZiByZXF1aXJlZCBpcyBcInRpbWVcIiBvciBcImFueVwiLCB0aGVuXG4gICAgaWYgKHJlcXVpcmVkID09PSAndGltZScgfHwgcmVxdWlyZWQgPT09ICdhbnknKSB7XG4gICAgICAgIC8vIGEuIEZvciBlYWNoIG9mIHRoZSBwcm9wZXJ0eSBuYW1lcyBcImhvdXJcIiwgXCJtaW51dGVcIiwgXCJzZWNvbmRcIjpcbiAgICAgICAgLy8gaS4gSWYgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBvcHRpb25zIHdpdGggdGhlXG4gICAgICAgIC8vICAgIHByb3BlcnR5IG5hbWUgaXMgbm90IHVuZGVmaW5lZCwgdGhlbiBsZXQgbmVlZERlZmF1bHRzIGJlIGZhbHNlLlxuICAgICAgICBpZiAob3B0aW9ucy5ob3VyICE9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5taW51dGUgIT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnNlY29uZCAhPT0gdW5kZWZpbmVkKSBuZWVkRGVmYXVsdHMgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyA3LiBJZiBuZWVkRGVmYXVsdHMgaXMgdHJ1ZSBhbmQgZGVmYXVsdHMgaXMgZWl0aGVyIFwiZGF0ZVwiIG9yIFwiYWxsXCIsIHRoZW5cbiAgICBpZiAobmVlZERlZmF1bHRzICYmIChkZWZhdWx0cyA9PT0gJ2RhdGUnIHx8IGRlZmF1bHRzID09PSAnYWxsJykpXG4gICAgICAgIC8vIGEuIEZvciBlYWNoIG9mIHRoZSBwcm9wZXJ0eSBuYW1lcyBcInllYXJcIiwgXCJtb250aFwiLCBcImRheVwiOlxuICAgICAgICAvLyBpLiBDYWxsIHRoZSBbW0RlZmluZU93blByb3BlcnR5XV0gaW50ZXJuYWwgbWV0aG9kIG9mIG9wdGlvbnMgd2l0aCB0aGVcbiAgICAgICAgLy8gICAgcHJvcGVydHkgbmFtZSwgUHJvcGVydHkgRGVzY3JpcHRvciB7W1tWYWx1ZV1dOiBcIm51bWVyaWNcIiwgW1tXcml0YWJsZV1dOlxuICAgICAgICAvLyAgICB0cnVlLCBbW0VudW1lcmFibGVdXTogdHJ1ZSwgW1tDb25maWd1cmFibGVdXTogdHJ1ZX0sIGFuZCBmYWxzZS5cbiAgICAgICAgb3B0aW9ucy55ZWFyID0gb3B0aW9ucy5tb250aCA9IG9wdGlvbnMuZGF5ID0gJ251bWVyaWMnO1xuXG4gICAgLy8gOC4gSWYgbmVlZERlZmF1bHRzIGlzIHRydWUgYW5kIGRlZmF1bHRzIGlzIGVpdGhlciBcInRpbWVcIiBvciBcImFsbFwiLCB0aGVuXG4gICAgaWYgKG5lZWREZWZhdWx0cyAmJiAoZGVmYXVsdHMgPT09ICd0aW1lJyB8fCBkZWZhdWx0cyA9PT0gJ2FsbCcpKVxuICAgICAgICAvLyBhLiBGb3IgZWFjaCBvZiB0aGUgcHJvcGVydHkgbmFtZXMgXCJob3VyXCIsIFwibWludXRlXCIsIFwic2Vjb25kXCI6XG4gICAgICAgIC8vIGkuIENhbGwgdGhlIFtbRGVmaW5lT3duUHJvcGVydHldXSBpbnRlcm5hbCBtZXRob2Qgb2Ygb3B0aW9ucyB3aXRoIHRoZVxuICAgICAgICAvLyAgICBwcm9wZXJ0eSBuYW1lLCBQcm9wZXJ0eSBEZXNjcmlwdG9yIHtbW1ZhbHVlXV06IFwibnVtZXJpY1wiLCBbW1dyaXRhYmxlXV06XG4gICAgICAgIC8vICAgIHRydWUsIFtbRW51bWVyYWJsZV1dOiB0cnVlLCBbW0NvbmZpZ3VyYWJsZV1dOiB0cnVlfSwgYW5kIGZhbHNlLlxuICAgICAgICBvcHRpb25zLmhvdXIgPSBvcHRpb25zLm1pbnV0ZSA9IG9wdGlvbnMuc2Vjb25kID0gJ251bWVyaWMnO1xuXG4gICAgLy8gOS4gUmV0dXJuIG9wdGlvbnMuXG4gICAgcmV0dXJuIG9wdGlvbnM7XG59XG5cbi8qKlxuICogV2hlbiB0aGUgQmFzaWNGb3JtYXRNYXRjaGVyIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCB0d28gYXJndW1lbnRzIG9wdGlvbnMgYW5kXG4gKiBmb3JtYXRzLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGFyZSB0YWtlbjpcbiAqL1xuZnVuY3Rpb24gQmFzaWNGb3JtYXRNYXRjaGVyKG9wdGlvbnMsIGZvcm1hdHMpIHtcbiAgICAvLyAxLiBMZXQgcmVtb3ZhbFBlbmFsdHkgYmUgMTIwLlxuICAgIHZhciByZW1vdmFsUGVuYWx0eSA9IDEyMDtcblxuICAgIC8vIDIuIExldCBhZGRpdGlvblBlbmFsdHkgYmUgMjAuXG4gICAgdmFyIGFkZGl0aW9uUGVuYWx0eSA9IDIwO1xuXG4gICAgLy8gMy4gTGV0IGxvbmdMZXNzUGVuYWx0eSBiZSA4LlxuICAgIHZhciBsb25nTGVzc1BlbmFsdHkgPSA4O1xuXG4gICAgLy8gNC4gTGV0IGxvbmdNb3JlUGVuYWx0eSBiZSA2LlxuICAgIHZhciBsb25nTW9yZVBlbmFsdHkgPSA2O1xuXG4gICAgLy8gNS4gTGV0IHNob3J0TGVzc1BlbmFsdHkgYmUgNi5cbiAgICB2YXIgc2hvcnRMZXNzUGVuYWx0eSA9IDY7XG5cbiAgICAvLyA2LiBMZXQgc2hvcnRNb3JlUGVuYWx0eSBiZSAzLlxuICAgIHZhciBzaG9ydE1vcmVQZW5hbHR5ID0gMztcblxuICAgIC8vIDcuIExldCBiZXN0U2NvcmUgYmUgLUluZmluaXR5LlxuICAgIHZhciBiZXN0U2NvcmUgPSAtSW5maW5pdHk7XG5cbiAgICAvLyA4LiBMZXQgYmVzdEZvcm1hdCBiZSB1bmRlZmluZWQuXG4gICAgdmFyIGJlc3RGb3JtYXQgPSB2b2lkIDA7XG5cbiAgICAvLyA5LiBMZXQgaSBiZSAwLlxuICAgIHZhciBpID0gMDtcblxuICAgIC8vIDEwLiBBc3NlcnQ6IGZvcm1hdHMgaXMgYW4gQXJyYXkgb2JqZWN0LlxuXG4gICAgLy8gMTEuIExldCBsZW4gYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBmb3JtYXRzIHdpdGggYXJndW1lbnQgXCJsZW5ndGhcIi5cbiAgICB2YXIgbGVuID0gZm9ybWF0cy5sZW5ndGg7XG5cbiAgICAvLyAxMi4gUmVwZWF0IHdoaWxlIGkgPCBsZW46XG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgICAgLy8gYS4gTGV0IGZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0XV0gaW50ZXJuYWwgbWV0aG9kIG9mIGZvcm1hdHMgd2l0aCBhcmd1bWVudCBUb1N0cmluZyhpKS5cbiAgICAgICAgdmFyIGZvcm1hdCA9IGZvcm1hdHNbaV07XG5cbiAgICAgICAgLy8gYi4gTGV0IHNjb3JlIGJlIDAuXG4gICAgICAgIHZhciBzY29yZSA9IDA7XG5cbiAgICAgICAgLy8gYy4gRm9yIGVhY2ggcHJvcGVydHkgc2hvd24gaW4gVGFibGUgMzpcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gZGF0ZVRpbWVDb21wb25lbnRzKSB7XG4gICAgICAgICAgICBpZiAoIWhvcC5jYWxsKGRhdGVUaW1lQ29tcG9uZW50cywgcHJvcGVydHkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gaS4gTGV0IG9wdGlvbnNQcm9wIGJlIG9wdGlvbnMuW1s8cHJvcGVydHk+XV0uXG4gICAgICAgICAgICB2YXIgb3B0aW9uc1Byb3AgPSBvcHRpb25zWydbWycgKyBwcm9wZXJ0eSArICddXSddO1xuXG4gICAgICAgICAgICAvLyBpaS4gTGV0IGZvcm1hdFByb3BEZXNjIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRPd25Qcm9wZXJ0eV1dIGludGVybmFsIG1ldGhvZCBvZiBmb3JtYXRcbiAgICAgICAgICAgIC8vICAgICB3aXRoIGFyZ3VtZW50IHByb3BlcnR5LlxuICAgICAgICAgICAgLy8gaWlpLiBJZiBmb3JtYXRQcm9wRGVzYyBpcyBub3QgdW5kZWZpbmVkLCB0aGVuXG4gICAgICAgICAgICAvLyAgICAgMS4gTGV0IGZvcm1hdFByb3AgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBmb3JtYXQgd2l0aCBhcmd1bWVudCBwcm9wZXJ0eS5cbiAgICAgICAgICAgIHZhciBmb3JtYXRQcm9wID0gaG9wLmNhbGwoZm9ybWF0LCBwcm9wZXJ0eSkgPyBmb3JtYXRbcHJvcGVydHldIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAvLyBpdi4gSWYgb3B0aW9uc1Byb3AgaXMgdW5kZWZpbmVkIGFuZCBmb3JtYXRQcm9wIGlzIG5vdCB1bmRlZmluZWQsIHRoZW4gZGVjcmVhc2Ugc2NvcmUgYnlcbiAgICAgICAgICAgIC8vICAgICBhZGRpdGlvblBlbmFsdHkuXG4gICAgICAgICAgICBpZiAob3B0aW9uc1Byb3AgPT09IHVuZGVmaW5lZCAmJiBmb3JtYXRQcm9wICE9PSB1bmRlZmluZWQpIHNjb3JlIC09IGFkZGl0aW9uUGVuYWx0eTtcblxuICAgICAgICAgICAgLy8gdi4gRWxzZSBpZiBvcHRpb25zUHJvcCBpcyBub3QgdW5kZWZpbmVkIGFuZCBmb3JtYXRQcm9wIGlzIHVuZGVmaW5lZCwgdGhlbiBkZWNyZWFzZSBzY29yZSBieVxuICAgICAgICAgICAgLy8gICAgcmVtb3ZhbFBlbmFsdHkuXG4gICAgICAgICAgICBlbHNlIGlmIChvcHRpb25zUHJvcCAhPT0gdW5kZWZpbmVkICYmIGZvcm1hdFByb3AgPT09IHVuZGVmaW5lZCkgc2NvcmUgLT0gcmVtb3ZhbFBlbmFsdHk7XG5cbiAgICAgICAgICAgICAgICAvLyB2aS4gRWxzZVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IHZhbHVlcyBiZSB0aGUgYXJyYXkgW1wiMi1kaWdpdFwiLCBcIm51bWVyaWNcIiwgXCJuYXJyb3dcIiwgXCJzaG9ydFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgXCJsb25nXCJdLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFsnMi1kaWdpdCcsICdudW1lcmljJywgJ25hcnJvdycsICdzaG9ydCcsICdsb25nJ107XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDIuIExldCBvcHRpb25zUHJvcEluZGV4IGJlIHRoZSBpbmRleCBvZiBvcHRpb25zUHJvcCB3aXRoaW4gdmFsdWVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9wdGlvbnNQcm9wSW5kZXggPSBhcnJJbmRleE9mLmNhbGwodmFsdWVzLCBvcHRpb25zUHJvcCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDMuIExldCBmb3JtYXRQcm9wSW5kZXggYmUgdGhlIGluZGV4IG9mIGZvcm1hdFByb3Agd2l0aGluIHZhbHVlcy5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXRQcm9wSW5kZXggPSBhcnJJbmRleE9mLmNhbGwodmFsdWVzLCBmb3JtYXRQcm9wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNC4gTGV0IGRlbHRhIGJlIG1heChtaW4oZm9ybWF0UHJvcEluZGV4IC0gb3B0aW9uc1Byb3BJbmRleCwgMiksIC0yKS5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkZWx0YSA9IE1hdGgubWF4KE1hdGgubWluKGZvcm1hdFByb3BJbmRleCAtIG9wdGlvbnNQcm9wSW5kZXgsIDIpLCAtMik7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUuIElmIGRlbHRhID0gMiwgZGVjcmVhc2Ugc2NvcmUgYnkgbG9uZ01vcmVQZW5hbHR5LlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlbHRhID09PSAyKSBzY29yZSAtPSBsb25nTW9yZVBlbmFsdHk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDYuIEVsc2UgaWYgZGVsdGEgPSAxLCBkZWNyZWFzZSBzY29yZSBieSBzaG9ydE1vcmVQZW5hbHR5LlxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPT09IDEpIHNjb3JlIC09IHNob3J0TW9yZVBlbmFsdHk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA3LiBFbHNlIGlmIGRlbHRhID0gLTEsIGRlY3JlYXNlIHNjb3JlIGJ5IHNob3J0TGVzc1BlbmFsdHkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZGVsdGEgPT09IC0xKSBzY29yZSAtPSBzaG9ydExlc3NQZW5hbHR5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDguIEVsc2UgaWYgZGVsdGEgPSAtMiwgZGVjcmVhc2Ugc2NvcmUgYnkgbG9uZ0xlc3NQZW5hbHR5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChkZWx0YSA9PT0gLTIpIHNjb3JlIC09IGxvbmdMZXNzUGVuYWx0eTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZC4gSWYgc2NvcmUgPiBiZXN0U2NvcmUsIHRoZW5cbiAgICAgICAgaWYgKHNjb3JlID4gYmVzdFNjb3JlKSB7XG4gICAgICAgICAgICAvLyBpLiBMZXQgYmVzdFNjb3JlIGJlIHNjb3JlLlxuICAgICAgICAgICAgYmVzdFNjb3JlID0gc2NvcmU7XG5cbiAgICAgICAgICAgIC8vIGlpLiBMZXQgYmVzdEZvcm1hdCBiZSBmb3JtYXQuXG4gICAgICAgICAgICBiZXN0Rm9ybWF0ID0gZm9ybWF0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZS4gSW5jcmVhc2UgaSBieSAxLlxuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgLy8gMTMuIFJldHVybiBiZXN0Rm9ybWF0LlxuICAgIHJldHVybiBiZXN0Rm9ybWF0O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIEJlc3RGaXRGb3JtYXRNYXRjaGVyIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCB0d28gYXJndW1lbnRzIG9wdGlvbnNcbiAqIGFuZCBmb3JtYXRzLCBpdCBwZXJmb3JtcyBpbXBsZW1lbnRhdGlvbiBkZXBlbmRlbnQgc3RlcHMsIHdoaWNoIHNob3VsZCByZXR1cm4gYSBzZXQgb2ZcbiAqIGNvbXBvbmVudCByZXByZXNlbnRhdGlvbnMgdGhhdCBhIHR5cGljYWwgdXNlciBvZiB0aGUgc2VsZWN0ZWQgbG9jYWxlIHdvdWxkIHBlcmNlaXZlIGFzXG4gKiBhdCBsZWFzdCBhcyBnb29kIGFzIHRoZSBvbmUgcmV0dXJuZWQgYnkgQmFzaWNGb3JtYXRNYXRjaGVyLlxuICpcbiAqIFRoaXMgcG9seWZpbGwgZGVmaW5lcyB0aGUgYWxnb3JpdGhtIHRvIGJlIHRoZSBzYW1lIGFzIEJhc2ljRm9ybWF0TWF0Y2hlcixcbiAqIHdpdGggdGhlIGFkZGl0aW9uIG9mIGJvbnVzIHBvaW50cyBhd2FyZGVkIHdoZXJlIHRoZSByZXF1ZXN0ZWQgZm9ybWF0IGlzIG9mXG4gKiB0aGUgc2FtZSBkYXRhIHR5cGUgYXMgdGhlIHBvdGVudGlhbGx5IG1hdGNoaW5nIGZvcm1hdC5cbiAqXG4gKiBUaGlzIGFsZ28gcmVsaWVzIG9uIHRoZSBjb25jZXB0IG9mIGNsb3Nlc3QgZGlzdGFuY2UgbWF0Y2hpbmcgZGVzY3JpYmVkIGhlcmU6XG4gKiBodHRwOi8vdW5pY29kZS5vcmcvcmVwb3J0cy90cjM1L3RyMzUtZGF0ZXMuaHRtbCNNYXRjaGluZ19Ta2VsZXRvbnNcbiAqIFR5cGljYWxseSBhIOKAnGJlc3QgbWF0Y2jigJ0gaXMgZm91bmQgdXNpbmcgYSBjbG9zZXN0IGRpc3RhbmNlIG1hdGNoLCBzdWNoIGFzOlxuICpcbiAqIFN5bWJvbHMgcmVxdWVzdGluZyBhIGJlc3QgY2hvaWNlIGZvciB0aGUgbG9jYWxlIGFyZSByZXBsYWNlZC5cbiAqICAgICAgaiDihpIgb25lIG9mIHtILCBrLCBoLCBLfTsgQyDihpIgb25lIG9mIHthLCBiLCBCfVxuICogLT4gQ292ZXJlZCBieSBjbGRyLmpzIG1hdGNoaW5nIHByb2Nlc3NcbiAqXG4gKiBGb3IgZmllbGRzIHdpdGggc3ltYm9scyByZXByZXNlbnRpbmcgdGhlIHNhbWUgdHlwZSAoeWVhciwgbW9udGgsIGRheSwgZXRjKTpcbiAqICAgICBNb3N0IHN5bWJvbHMgaGF2ZSBhIHNtYWxsIGRpc3RhbmNlIGZyb20gZWFjaCBvdGhlci5cbiAqICAgICAgICAgTSDiiYUgTDsgRSDiiYUgYzsgYSDiiYUgYiDiiYUgQjsgSCDiiYUgayDiiYUgaCDiiYUgSzsgLi4uXG4gKiAgICAgLT4gQ292ZXJlZCBieSBjbGRyLmpzIG1hdGNoaW5nIHByb2Nlc3NcbiAqXG4gKiAgICAgV2lkdGggZGlmZmVyZW5jZXMgYW1vbmcgZmllbGRzLCBvdGhlciB0aGFuIHRob3NlIG1hcmtpbmcgdGV4dCB2cyBudW1lcmljLCBhcmUgZ2l2ZW4gc21hbGwgZGlzdGFuY2UgZnJvbSBlYWNoIG90aGVyLlxuICogICAgICAgICBNTU0g4omFIE1NTU1cbiAqICAgICAgICAgTU0g4omFIE1cbiAqICAgICBOdW1lcmljIGFuZCB0ZXh0IGZpZWxkcyBhcmUgZ2l2ZW4gYSBsYXJnZXIgZGlzdGFuY2UgZnJvbSBlYWNoIG90aGVyLlxuICogICAgICAgICBNTU0g4omIIE1NXG4gKiAgICAgU3ltYm9scyByZXByZXNlbnRpbmcgc3Vic3RhbnRpYWwgZGlmZmVyZW5jZXMgKHdlZWsgb2YgeWVhciB2cyB3ZWVrIG9mIG1vbnRoKSBhcmUgZ2l2ZW4gbXVjaCBsYXJnZXIgYSBkaXN0YW5jZXMgZnJvbSBlYWNoIG90aGVyLlxuICogICAgICAgICBkIOKJiyBEOyAuLi5cbiAqICAgICBNaXNzaW5nIG9yIGV4dHJhIGZpZWxkcyBjYXVzZSBhIG1hdGNoIHRvIGZhaWwuIChCdXQgc2VlIE1pc3NpbmcgU2tlbGV0b24gRmllbGRzKS5cbiAqXG4gKlxuICogRm9yIGV4YW1wbGUsXG4gKlxuICogICAgIHsgbW9udGg6ICdudW1lcmljJywgZGF5OiAnbnVtZXJpYycgfVxuICpcbiAqIHNob3VsZCBtYXRjaFxuICpcbiAqICAgICB7IG1vbnRoOiAnMi1kaWdpdCcsIGRheTogJzItZGlnaXQnIH1cbiAqXG4gKiByYXRoZXIgdGhhblxuICpcbiAqICAgICB7IG1vbnRoOiAnc2hvcnQnLCBkYXk6ICdudW1lcmljJyB9XG4gKlxuICogVGhpcyBtYWtlcyBzZW5zZSBiZWNhdXNlIGEgdXNlciByZXF1ZXN0aW5nIGEgZm9ybWF0dGVkIGRhdGUgd2l0aCBudW1lcmljIHBhcnRzIHdvdWxkXG4gKiBub3QgZXhwZWN0IHRvIHNlZSB0aGUgcmV0dXJuZWQgZm9ybWF0IGNvbnRhaW5pbmcgbmFycm93LCBzaG9ydCBvciBsb25nIHBhcnQgbmFtZXNcbiAqL1xuZnVuY3Rpb24gQmVzdEZpdEZvcm1hdE1hdGNoZXIob3B0aW9ucywgZm9ybWF0cykge1xuICAgIC8qKiBEaXZlcmdpbmc6IHRoaXMgYmxvY2sgaW1wbGVtZW50cyB0aGUgaGFjayBmb3Igc2luZ2xlIHByb3BlcnR5IGNvbmZpZ3VyYXRpb24sIGVnLjpcbiAgICAgKlxuICAgICAqICAgICAgYG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KCdlbicsIHtkYXk6ICdudW1lcmljJ30pYFxuICAgICAqXG4gICAgICogc2hvdWxkIHByb2R1Y2UgYSBzaW5nbGUgZGlnaXQgd2l0aCB0aGUgZGF5IG9mIHRoZSBtb250aC4gVGhpcyBpcyBuZWVkZWQgYmVjYXVzZVxuICAgICAqIENMRFIgYGF2YWlsYWJsZUZvcm1hdHNgIGRhdGEgc3RydWN0dXJlIGRvZXNuJ3QgY292ZXIgdGhlc2UgY2FzZXMuXG4gICAgICovXG4gICAge1xuICAgICAgICB2YXIgb3B0aW9uc1Byb3BOYW1lcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBkYXRlVGltZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGlmICghaG9wLmNhbGwoZGF0ZVRpbWVDb21wb25lbnRzLCBwcm9wZXJ0eSkpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9uc1snW1snICsgcHJvcGVydHkgKyAnXV0nXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9uc1Byb3BOYW1lcy5wdXNoKHByb3BlcnR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9uc1Byb3BOYW1lcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBfYmVzdEZvcm1hdCA9IGdlbmVyYXRlU3ludGhldGljRm9ybWF0KG9wdGlvbnNQcm9wTmFtZXNbMF0sIG9wdGlvbnNbJ1tbJyArIG9wdGlvbnNQcm9wTmFtZXNbMF0gKyAnXV0nXSk7XG4gICAgICAgICAgICBpZiAoX2Jlc3RGb3JtYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jlc3RGb3JtYXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAxLiBMZXQgcmVtb3ZhbFBlbmFsdHkgYmUgMTIwLlxuICAgIHZhciByZW1vdmFsUGVuYWx0eSA9IDEyMDtcblxuICAgIC8vIDIuIExldCBhZGRpdGlvblBlbmFsdHkgYmUgMjAuXG4gICAgdmFyIGFkZGl0aW9uUGVuYWx0eSA9IDIwO1xuXG4gICAgLy8gMy4gTGV0IGxvbmdMZXNzUGVuYWx0eSBiZSA4LlxuICAgIHZhciBsb25nTGVzc1BlbmFsdHkgPSA4O1xuXG4gICAgLy8gNC4gTGV0IGxvbmdNb3JlUGVuYWx0eSBiZSA2LlxuICAgIHZhciBsb25nTW9yZVBlbmFsdHkgPSA2O1xuXG4gICAgLy8gNS4gTGV0IHNob3J0TGVzc1BlbmFsdHkgYmUgNi5cbiAgICB2YXIgc2hvcnRMZXNzUGVuYWx0eSA9IDY7XG5cbiAgICAvLyA2LiBMZXQgc2hvcnRNb3JlUGVuYWx0eSBiZSAzLlxuICAgIHZhciBzaG9ydE1vcmVQZW5hbHR5ID0gMztcblxuICAgIHZhciBwYXR0ZXJuUGVuYWx0eSA9IDI7XG5cbiAgICB2YXIgaG91cjEyUGVuYWx0eSA9IDE7XG5cbiAgICAvLyA3LiBMZXQgYmVzdFNjb3JlIGJlIC1JbmZpbml0eS5cbiAgICB2YXIgYmVzdFNjb3JlID0gLUluZmluaXR5O1xuXG4gICAgLy8gOC4gTGV0IGJlc3RGb3JtYXQgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBiZXN0Rm9ybWF0ID0gdm9pZCAwO1xuXG4gICAgLy8gOS4gTGV0IGkgYmUgMC5cbiAgICB2YXIgaSA9IDA7XG5cbiAgICAvLyAxMC4gQXNzZXJ0OiBmb3JtYXRzIGlzIGFuIEFycmF5IG9iamVjdC5cblxuICAgIC8vIDExLiBMZXQgbGVuIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0cyB3aXRoIGFyZ3VtZW50IFwibGVuZ3RoXCIuXG4gICAgdmFyIGxlbiA9IGZvcm1hdHMubGVuZ3RoO1xuXG4gICAgLy8gMTIuIFJlcGVhdCB3aGlsZSBpIDwgbGVuOlxuICAgIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgICAgIC8vIGEuIExldCBmb3JtYXQgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBbW0dldF1dIGludGVybmFsIG1ldGhvZCBvZiBmb3JtYXRzIHdpdGggYXJndW1lbnQgVG9TdHJpbmcoaSkuXG4gICAgICAgIHZhciBmb3JtYXQgPSBmb3JtYXRzW2ldO1xuXG4gICAgICAgIC8vIGIuIExldCBzY29yZSBiZSAwLlxuICAgICAgICB2YXIgc2NvcmUgPSAwO1xuXG4gICAgICAgIC8vIGMuIEZvciBlYWNoIHByb3BlcnR5IHNob3duIGluIFRhYmxlIDM6XG4gICAgICAgIGZvciAodmFyIF9wcm9wZXJ0eSBpbiBkYXRlVGltZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgIGlmICghaG9wLmNhbGwoZGF0ZVRpbWVDb21wb25lbnRzLCBfcHJvcGVydHkpKSBjb250aW51ZTtcblxuICAgICAgICAgICAgLy8gaS4gTGV0IG9wdGlvbnNQcm9wIGJlIG9wdGlvbnMuW1s8cHJvcGVydHk+XV0uXG4gICAgICAgICAgICB2YXIgb3B0aW9uc1Byb3AgPSBvcHRpb25zWydbWycgKyBfcHJvcGVydHkgKyAnXV0nXTtcblxuICAgICAgICAgICAgLy8gaWkuIExldCBmb3JtYXRQcm9wRGVzYyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbR2V0T3duUHJvcGVydHldXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0XG4gICAgICAgICAgICAvLyAgICAgd2l0aCBhcmd1bWVudCBwcm9wZXJ0eS5cbiAgICAgICAgICAgIC8vIGlpaS4gSWYgZm9ybWF0UHJvcERlc2MgaXMgbm90IHVuZGVmaW5lZCwgdGhlblxuICAgICAgICAgICAgLy8gICAgIDEuIExldCBmb3JtYXRQcm9wIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgW1tHZXRdXSBpbnRlcm5hbCBtZXRob2Qgb2YgZm9ybWF0IHdpdGggYXJndW1lbnQgcHJvcGVydHkuXG4gICAgICAgICAgICB2YXIgZm9ybWF0UHJvcCA9IGhvcC5jYWxsKGZvcm1hdCwgX3Byb3BlcnR5KSA/IGZvcm1hdFtfcHJvcGVydHldIDogdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAvLyBEaXZlcmdpbmc6IHVzaW5nIHRoZSBkZWZhdWx0IHByb3BlcnRpZXMgcHJvZHVjZWQgYnkgdGhlIHBhdHRlcm4vc2tlbGV0b25cbiAgICAgICAgICAgIC8vIHRvIG1hdGNoIGl0IHdpdGggdXNlciBvcHRpb25zLCBhbmQgYXBwbHkgYSBwZW5hbHR5XG4gICAgICAgICAgICB2YXIgcGF0dGVyblByb3AgPSBob3AuY2FsbChmb3JtYXQuXywgX3Byb3BlcnR5KSA/IGZvcm1hdC5fW19wcm9wZXJ0eV0gOiB1bmRlZmluZWQ7XG4gICAgICAgICAgICBpZiAob3B0aW9uc1Byb3AgIT09IHBhdHRlcm5Qcm9wKSB7XG4gICAgICAgICAgICAgICAgc2NvcmUgLT0gcGF0dGVyblBlbmFsdHk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGl2LiBJZiBvcHRpb25zUHJvcCBpcyB1bmRlZmluZWQgYW5kIGZvcm1hdFByb3AgaXMgbm90IHVuZGVmaW5lZCwgdGhlbiBkZWNyZWFzZSBzY29yZSBieVxuICAgICAgICAgICAgLy8gICAgIGFkZGl0aW9uUGVuYWx0eS5cbiAgICAgICAgICAgIGlmIChvcHRpb25zUHJvcCA9PT0gdW5kZWZpbmVkICYmIGZvcm1hdFByb3AgIT09IHVuZGVmaW5lZCkgc2NvcmUgLT0gYWRkaXRpb25QZW5hbHR5O1xuXG4gICAgICAgICAgICAvLyB2LiBFbHNlIGlmIG9wdGlvbnNQcm9wIGlzIG5vdCB1bmRlZmluZWQgYW5kIGZvcm1hdFByb3AgaXMgdW5kZWZpbmVkLCB0aGVuIGRlY3JlYXNlIHNjb3JlIGJ5XG4gICAgICAgICAgICAvLyAgICByZW1vdmFsUGVuYWx0eS5cbiAgICAgICAgICAgIGVsc2UgaWYgKG9wdGlvbnNQcm9wICE9PSB1bmRlZmluZWQgJiYgZm9ybWF0UHJvcCA9PT0gdW5kZWZpbmVkKSBzY29yZSAtPSByZW1vdmFsUGVuYWx0eTtcblxuICAgICAgICAgICAgICAgIC8vIHZpLiBFbHNlXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAxLiBMZXQgdmFsdWVzIGJlIHRoZSBhcnJheSBbXCIyLWRpZ2l0XCIsIFwibnVtZXJpY1wiLCBcIm5hcnJvd1wiLCBcInNob3J0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBcImxvbmdcIl0uXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWVzID0gWycyLWRpZ2l0JywgJ251bWVyaWMnLCAnbmFycm93JywgJ3Nob3J0JywgJ2xvbmcnXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMi4gTGV0IG9wdGlvbnNQcm9wSW5kZXggYmUgdGhlIGluZGV4IG9mIG9wdGlvbnNQcm9wIHdpdGhpbiB2YWx1ZXMuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3B0aW9uc1Byb3BJbmRleCA9IGFyckluZGV4T2YuY2FsbCh2YWx1ZXMsIG9wdGlvbnNQcm9wKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMy4gTGV0IGZvcm1hdFByb3BJbmRleCBiZSB0aGUgaW5kZXggb2YgZm9ybWF0UHJvcCB3aXRoaW4gdmFsdWVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZvcm1hdFByb3BJbmRleCA9IGFyckluZGV4T2YuY2FsbCh2YWx1ZXMsIGZvcm1hdFByb3ApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyA0LiBMZXQgZGVsdGEgYmUgbWF4KG1pbihmb3JtYXRQcm9wSW5kZXggLSBvcHRpb25zUHJvcEluZGV4LCAyKSwgLTIpLlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRlbHRhID0gTWF0aC5tYXgoTWF0aC5taW4oZm9ybWF0UHJvcEluZGV4IC0gb3B0aW9uc1Byb3BJbmRleCwgMiksIC0yKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpdmVyZ2luZyBmcm9tIHNwZWNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXaGVuIHRoZSBiZXN0Rml0IGFyZ3VtZW50IGlzIHRydWUsIHN1YnRyYWN0IGFkZGl0aW9uYWwgcGVuYWx0eSB3aGVyZSBkYXRhIHR5cGVzIGFyZSBub3QgdGhlIHNhbWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZm9ybWF0UHJvcEluZGV4IDw9IDEgJiYgb3B0aW9uc1Byb3BJbmRleCA+PSAyIHx8IGZvcm1hdFByb3BJbmRleCA+PSAyICYmIG9wdGlvbnNQcm9wSW5kZXggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA1LiBJZiBkZWx0YSA9IDIsIGRlY3JlYXNlIHNjb3JlIGJ5IGxvbmdNb3JlUGVuYWx0eS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRlbHRhID4gMCkgc2NvcmUgLT0gbG9uZ01vcmVQZW5hbHR5O2Vsc2UgaWYgKGRlbHRhIDwgMCkgc2NvcmUgLT0gbG9uZ0xlc3NQZW5hbHR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUuIElmIGRlbHRhID0gMiwgZGVjcmVhc2Ugc2NvcmUgYnkgbG9uZ01vcmVQZW5hbHR5LlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGVsdGEgPiAxKSBzY29yZSAtPSBzaG9ydE1vcmVQZW5hbHR5O2Vsc2UgaWYgKGRlbHRhIDwgLTEpIHNjb3JlIC09IHNob3J0TGVzc1BlbmFsdHk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBkaXZlcmdpbmcgdG8gYWxzbyB0YWtlIGludG8gY29uc2lkZXJhdGlvbiBkaWZmZXJlbmNlcyBiZXR3ZWVuIDEyIG9yIDI0IGhvdXJzXG4gICAgICAgICAgICAvLyB3aGljaCBpcyBzcGVjaWFsIGZvciB0aGUgYmVzdCBmaXQgb25seS5cbiAgICAgICAgICAgIGlmIChmb3JtYXQuXy5ob3VyMTIgIT09IG9wdGlvbnMuaG91cjEyKSB7XG4gICAgICAgICAgICAgICAgc2NvcmUgLT0gaG91cjEyUGVuYWx0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGQuIElmIHNjb3JlID4gYmVzdFNjb3JlLCB0aGVuXG4gICAgICAgIGlmIChzY29yZSA+IGJlc3RTY29yZSkge1xuICAgICAgICAgICAgLy8gaS4gTGV0IGJlc3RTY29yZSBiZSBzY29yZS5cbiAgICAgICAgICAgIGJlc3RTY29yZSA9IHNjb3JlO1xuICAgICAgICAgICAgLy8gaWkuIExldCBiZXN0Rm9ybWF0IGJlIGZvcm1hdC5cbiAgICAgICAgICAgIGJlc3RGb3JtYXQgPSBmb3JtYXQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlLiBJbmNyZWFzZSBpIGJ5IDEuXG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICAvLyAxMy4gUmV0dXJuIGJlc3RGb3JtYXQuXG4gICAgcmV0dXJuIGJlc3RGb3JtYXQ7XG59XG5cbi8qIDEyLjIuMyAqL2ludGVybmFscy5EYXRlVGltZUZvcm1hdCA9IHtcbiAgICAnW1thdmFpbGFibGVMb2NhbGVzXV0nOiBbXSxcbiAgICAnW1tyZWxldmFudEV4dGVuc2lvbktleXNdXSc6IFsnY2EnLCAnbnUnXSxcbiAgICAnW1tsb2NhbGVEYXRhXV0nOiB7fVxufTtcblxuLyoqXG4gKiBXaGVuIHRoZSBzdXBwb3J0ZWRMb2NhbGVzT2YgbWV0aG9kIG9mIEludGwuRGF0ZVRpbWVGb3JtYXQgaXMgY2FsbGVkLCB0aGVcbiAqIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbi8qIDEyLjIuMiAqL1xuZGVmaW5lUHJvcGVydHkoSW50bC5EYXRlVGltZUZvcm1hdCwgJ3N1cHBvcnRlZExvY2FsZXNPZicsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgdmFsdWU6IGZuQmluZC5jYWxsKGZ1bmN0aW9uIChsb2NhbGVzKSB7XG4gICAgICAgIC8vIEJvdW5kIGZ1bmN0aW9ucyBvbmx5IGhhdmUgdGhlIGB0aGlzYCB2YWx1ZSBhbHRlcmVkIGlmIGJlaW5nIHVzZWQgYXMgYSBjb25zdHJ1Y3RvcixcbiAgICAgICAgLy8gdGhpcyBsZXRzIHVzIGltaXRhdGUgYSBuYXRpdmUgZnVuY3Rpb24gdGhhdCBoYXMgbm8gY29uc3RydWN0b3JcbiAgICAgICAgaWYgKCFob3AuY2FsbCh0aGlzLCAnW1thdmFpbGFibGVMb2NhbGVzXV0nKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignc3VwcG9ydGVkTG9jYWxlc09mKCkgaXMgbm90IGEgY29uc3RydWN0b3InKTtcblxuICAgICAgICAvLyBDcmVhdGUgYW4gb2JqZWN0IHdob3NlIHByb3BzIGNhbiBiZSB1c2VkIHRvIHJlc3RvcmUgdGhlIHZhbHVlcyBvZiBSZWdFeHAgcHJvcHNcbiAgICAgICAgdmFyIHJlZ2V4cFJlc3RvcmUgPSBjcmVhdGVSZWdFeHBSZXN0b3JlKCksXG5cblxuICAgICAgICAvLyAxLiBJZiBvcHRpb25zIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgb3B0aW9ucyBiZSB1bmRlZmluZWQuXG4gICAgICAgIG9wdGlvbnMgPSBhcmd1bWVudHNbMV0sXG5cblxuICAgICAgICAvLyAyLiBMZXQgYXZhaWxhYmxlTG9jYWxlcyBiZSB0aGUgdmFsdWUgb2YgdGhlIFtbYXZhaWxhYmxlTG9jYWxlc11dIGludGVybmFsXG4gICAgICAgIC8vICAgIHByb3BlcnR5IG9mIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBvYmplY3QgdGhhdCBpcyB0aGUgaW5pdGlhbCB2YWx1ZSBvZlxuICAgICAgICAvLyAgICBJbnRsLk51bWJlckZvcm1hdC5cblxuICAgICAgICBhdmFpbGFibGVMb2NhbGVzID0gdGhpc1snW1thdmFpbGFibGVMb2NhbGVzXV0nXSxcblxuXG4gICAgICAgIC8vIDMuIExldCByZXF1ZXN0ZWRMb2NhbGVzIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgQ2Fub25pY2FsaXplTG9jYWxlTGlzdFxuICAgICAgICAvLyAgICBhYnN0cmFjdCBvcGVyYXRpb24gKGRlZmluZWQgaW4gOS4yLjEpIHdpdGggYXJndW1lbnQgbG9jYWxlcy5cbiAgICAgICAgcmVxdWVzdGVkTG9jYWxlcyA9IENhbm9uaWNhbGl6ZUxvY2FsZUxpc3QobG9jYWxlcyk7XG5cbiAgICAgICAgLy8gUmVzdG9yZSB0aGUgUmVnRXhwIHByb3BlcnRpZXNcbiAgICAgICAgcmVnZXhwUmVzdG9yZSgpO1xuXG4gICAgICAgIC8vIDQuIFJldHVybiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFN1cHBvcnRlZExvY2FsZXMgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgICAgIC8vICAgIChkZWZpbmVkIGluIDkuMi44KSB3aXRoIGFyZ3VtZW50cyBhdmFpbGFibGVMb2NhbGVzLCByZXF1ZXN0ZWRMb2NhbGVzLFxuICAgICAgICAvLyAgICBhbmQgb3B0aW9ucy5cbiAgICAgICAgcmV0dXJuIFN1cHBvcnRlZExvY2FsZXMoYXZhaWxhYmxlTG9jYWxlcywgcmVxdWVzdGVkTG9jYWxlcywgb3B0aW9ucyk7XG4gICAgfSwgaW50ZXJuYWxzLk51bWJlckZvcm1hdClcbn0pO1xuXG4vKipcbiAqIFRoaXMgbmFtZWQgYWNjZXNzb3IgcHJvcGVydHkgcmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgZm9ybWF0cyBhIG51bWJlclxuICogYWNjb3JkaW5nIHRvIHRoZSBlZmZlY3RpdmUgbG9jYWxlIGFuZCB0aGUgZm9ybWF0dGluZyBvcHRpb25zIG9mIHRoaXNcbiAqIERhdGVUaW1lRm9ybWF0IG9iamVjdC5cbiAqL1xuLyogMTIuMy4yICovZGVmaW5lUHJvcGVydHkoSW50bC5EYXRlVGltZUZvcm1hdC5wcm90b3R5cGUsICdmb3JtYXQnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogR2V0Rm9ybWF0RGF0ZVRpbWVcbn0pO1xuXG5mdW5jdGlvbiBHZXRGb3JtYXREYXRlVGltZSgpIHtcbiAgICB2YXIgaW50ZXJuYWwgPSB0aGlzICE9PSBudWxsICYmIGJhYmVsSGVscGVycyQxW1widHlwZW9mXCJdKHRoaXMpID09PSAnb2JqZWN0JyAmJiBnZXRJbnRlcm5hbFByb3BlcnRpZXModGhpcyk7XG5cbiAgICAvLyBTYXRpc2Z5IHRlc3QgMTIuM19iXG4gICAgaWYgKCFpbnRlcm5hbCB8fCAhaW50ZXJuYWxbJ1tbaW5pdGlhbGl6ZWREYXRlVGltZUZvcm1hdF1dJ10pIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBmb3IgZm9ybWF0KCkgaXMgbm90IGFuIGluaXRpYWxpemVkIEludGwuRGF0ZVRpbWVGb3JtYXQgb2JqZWN0LicpO1xuXG4gICAgLy8gVGhlIHZhbHVlIG9mIHRoZSBbW0dldF1dIGF0dHJpYnV0ZSBpcyBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIGZvbGxvd2luZ1xuICAgIC8vIHN0ZXBzOlxuXG4gICAgLy8gMS4gSWYgdGhlIFtbYm91bmRGb3JtYXRdXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiB0aGlzIERhdGVUaW1lRm9ybWF0IG9iamVjdFxuICAgIC8vICAgIGlzIHVuZGVmaW5lZCwgdGhlbjpcbiAgICBpZiAoaW50ZXJuYWxbJ1tbYm91bmRGb3JtYXRdXSddID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYS4gTGV0IEYgYmUgYSBGdW5jdGlvbiBvYmplY3QsIHdpdGggaW50ZXJuYWwgcHJvcGVydGllcyBzZXQgYXNcbiAgICAgICAgLy8gICAgc3BlY2lmaWVkIGZvciBidWlsdC1pbiBmdW5jdGlvbnMgaW4gRVM1LCAxNSwgb3Igc3VjY2Vzc29yLCBhbmQgdGhlXG4gICAgICAgIC8vICAgIGxlbmd0aCBwcm9wZXJ0eSBzZXQgdG8gMCwgdGhhdCB0YWtlcyB0aGUgYXJndW1lbnQgZGF0ZSBhbmRcbiAgICAgICAgLy8gICAgcGVyZm9ybXMgdGhlIGZvbGxvd2luZyBzdGVwczpcbiAgICAgICAgdmFyIEYgPSBmdW5jdGlvbiBGKCkge1xuICAgICAgICAgICAgdmFyIGRhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMF07XG5cbiAgICAgICAgICAgIC8vICAgaS4gSWYgZGF0ZSBpcyBub3QgcHJvdmlkZWQgb3IgaXMgdW5kZWZpbmVkLCB0aGVuIGxldCB4IGJlIHRoZVxuICAgICAgICAgICAgLy8gICAgICByZXN1bHQgYXMgaWYgYnkgdGhlIGV4cHJlc3Npb24gRGF0ZS5ub3coKSB3aGVyZSBEYXRlLm5vdyBpc1xuICAgICAgICAgICAgLy8gICAgICB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gZnVuY3Rpb24gZGVmaW5lZCBpbiBFUzUsIDE1LjkuNC40LlxuICAgICAgICAgICAgLy8gIGlpLiBFbHNlIGxldCB4IGJlIFRvTnVtYmVyKGRhdGUpLlxuICAgICAgICAgICAgLy8gaWlpLiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXREYXRlVGltZSBhYnN0cmFjdFxuICAgICAgICAgICAgLy8gICAgICBvcGVyYXRpb24gKGRlZmluZWQgYmVsb3cpIHdpdGggYXJndW1lbnRzIHRoaXMgYW5kIHguXG4gICAgICAgICAgICB2YXIgeCA9IGRhdGUgPT09IHVuZGVmaW5lZCA/IERhdGUubm93KCkgOiB0b051bWJlcihkYXRlKTtcbiAgICAgICAgICAgIHJldHVybiBGb3JtYXREYXRlVGltZSh0aGlzLCB4KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8gYi4gTGV0IGJpbmQgYmUgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGZ1bmN0aW9uIG9iamVjdCBkZWZpbmVkIGluIEVTNSxcbiAgICAgICAgLy8gICAgMTUuMy40LjUuXG4gICAgICAgIC8vIGMuIExldCBiZiBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFtbQ2FsbF1dIGludGVybmFsIG1ldGhvZCBvZlxuICAgICAgICAvLyAgICBiaW5kIHdpdGggRiBhcyB0aGUgdGhpcyB2YWx1ZSBhbmQgYW4gYXJndW1lbnQgbGlzdCBjb250YWluaW5nXG4gICAgICAgIC8vICAgIHRoZSBzaW5nbGUgaXRlbSB0aGlzLlxuICAgICAgICB2YXIgYmYgPSBmbkJpbmQuY2FsbChGLCB0aGlzKTtcbiAgICAgICAgLy8gZC4gU2V0IHRoZSBbW2JvdW5kRm9ybWF0XV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgdGhpcyBOdW1iZXJGb3JtYXRcbiAgICAgICAgLy8gICAgb2JqZWN0IHRvIGJmLlxuICAgICAgICBpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ10gPSBiZjtcbiAgICB9XG4gICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgW1tib3VuZEZvcm1hdF1dIGludGVybmFsIHByb3BlcnR5IG9mIHRoaXNcbiAgICAvLyBOdW1iZXJGb3JtYXQgb2JqZWN0LlxuICAgIHJldHVybiBpbnRlcm5hbFsnW1tib3VuZEZvcm1hdF1dJ107XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFRvUGFydHMkMSgpIHtcbiAgICB2YXIgZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcblxuICAgIHZhciBpbnRlcm5hbCA9IHRoaXMgIT09IG51bGwgJiYgYmFiZWxIZWxwZXJzJDFbXCJ0eXBlb2ZcIl0odGhpcykgPT09ICdvYmplY3QnICYmIGdldEludGVybmFsUHJvcGVydGllcyh0aGlzKTtcblxuICAgIGlmICghaW50ZXJuYWwgfHwgIWludGVybmFsWydbW2luaXRpYWxpemVkRGF0ZVRpbWVGb3JtYXRdXSddKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgZm9yIGZvcm1hdFRvUGFydHMoKSBpcyBub3QgYW4gaW5pdGlhbGl6ZWQgSW50bC5EYXRlVGltZUZvcm1hdCBvYmplY3QuJyk7XG5cbiAgICB2YXIgeCA9IGRhdGUgPT09IHVuZGVmaW5lZCA/IERhdGUubm93KCkgOiB0b051bWJlcihkYXRlKTtcbiAgICByZXR1cm4gRm9ybWF0VG9QYXJ0c0RhdGVUaW1lKHRoaXMsIHgpO1xufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoSW50bC5EYXRlVGltZUZvcm1hdC5wcm90b3R5cGUsICdmb3JtYXRUb1BhcnRzJywge1xuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICB2YWx1ZTogZm9ybWF0VG9QYXJ0cyQxXG59KTtcblxuZnVuY3Rpb24gQ3JlYXRlRGF0ZVRpbWVQYXJ0cyhkYXRlVGltZUZvcm1hdCwgeCkge1xuICAgIC8vIDEuIElmIHggaXMgbm90IGEgZmluaXRlIE51bWJlciwgdGhlbiB0aHJvdyBhIFJhbmdlRXJyb3IgZXhjZXB0aW9uLlxuICAgIGlmICghaXNGaW5pdGUoeCkpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHZhbGlkIGRhdGUgcGFzc2VkIHRvIGZvcm1hdCcpO1xuXG4gICAgdmFyIGludGVybmFsID0gZGF0ZVRpbWVGb3JtYXQuX19nZXRJbnRlcm5hbFByb3BlcnRpZXMoc2VjcmV0KTtcblxuICAgIC8vIENyZWF0aW5nIHJlc3RvcmUgcG9pbnQgZm9yIHByb3BlcnRpZXMgb24gdGhlIFJlZ0V4cCBvYmplY3QuLi4gcGxlYXNlIHdhaXRcbiAgICAvKiBsZXQgcmVnZXhwUmVzdG9yZSA9ICovY3JlYXRlUmVnRXhwUmVzdG9yZSgpOyAvLyAjIyNUT0RPOiByZXZpZXcgdGhpc1xuXG4gICAgLy8gMi4gTGV0IGxvY2FsZSBiZSB0aGUgdmFsdWUgb2YgdGhlIFtbbG9jYWxlXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQuXG4gICAgdmFyIGxvY2FsZSA9IGludGVybmFsWydbW2xvY2FsZV1dJ107XG5cbiAgICAvLyAzLiBMZXQgbmYgYmUgdGhlIHJlc3VsdCBvZiBjcmVhdGluZyBhIG5ldyBOdW1iZXJGb3JtYXQgb2JqZWN0IGFzIGlmIGJ5IHRoZVxuICAgIC8vIGV4cHJlc3Npb24gbmV3IEludGwuTnVtYmVyRm9ybWF0KFtsb2NhbGVdLCB7dXNlR3JvdXBpbmc6IGZhbHNlfSkgd2hlcmVcbiAgICAvLyBJbnRsLk51bWJlckZvcm1hdCBpcyB0aGUgc3RhbmRhcmQgYnVpbHQtaW4gY29uc3RydWN0b3IgZGVmaW5lZCBpbiAxMS4xLjMuXG4gICAgdmFyIG5mID0gbmV3IEludGwuTnVtYmVyRm9ybWF0KFtsb2NhbGVdLCB7IHVzZUdyb3VwaW5nOiBmYWxzZSB9KTtcblxuICAgIC8vIDQuIExldCBuZjIgYmUgdGhlIHJlc3VsdCBvZiBjcmVhdGluZyBhIG5ldyBOdW1iZXJGb3JtYXQgb2JqZWN0IGFzIGlmIGJ5IHRoZVxuICAgIC8vIGV4cHJlc3Npb24gbmV3IEludGwuTnVtYmVyRm9ybWF0KFtsb2NhbGVdLCB7bWluaW11bUludGVnZXJEaWdpdHM6IDIsIHVzZUdyb3VwaW5nOlxuICAgIC8vIGZhbHNlfSkgd2hlcmUgSW50bC5OdW1iZXJGb3JtYXQgaXMgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGNvbnN0cnVjdG9yIGRlZmluZWQgaW5cbiAgICAvLyAxMS4xLjMuXG4gICAgdmFyIG5mMiA9IG5ldyBJbnRsLk51bWJlckZvcm1hdChbbG9jYWxlXSwgeyBtaW5pbXVtSW50ZWdlckRpZ2l0czogMiwgdXNlR3JvdXBpbmc6IGZhbHNlIH0pO1xuXG4gICAgLy8gNS4gTGV0IHRtIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgVG9Mb2NhbFRpbWUgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkXG4gICAgLy8gYmVsb3cpIHdpdGggeCwgdGhlIHZhbHVlIG9mIHRoZSBbW2NhbGVuZGFyXV0gaW50ZXJuYWwgcHJvcGVydHkgb2YgZGF0ZVRpbWVGb3JtYXQsXG4gICAgLy8gYW5kIHRoZSB2YWx1ZSBvZiB0aGUgW1t0aW1lWm9uZV1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0LlxuICAgIHZhciB0bSA9IFRvTG9jYWxUaW1lKHgsIGludGVybmFsWydbW2NhbGVuZGFyXV0nXSwgaW50ZXJuYWxbJ1tbdGltZVpvbmVdXSddKTtcblxuICAgIC8vIDYuIExldCByZXN1bHQgYmUgdGhlIHZhbHVlIG9mIHRoZSBbW3BhdHRlcm5dXSBpbnRlcm5hbCBwcm9wZXJ0eSBvZiBkYXRlVGltZUZvcm1hdC5cbiAgICB2YXIgcGF0dGVybiA9IGludGVybmFsWydbW3BhdHRlcm5dXSddO1xuXG4gICAgLy8gNy5cbiAgICB2YXIgcmVzdWx0ID0gbmV3IExpc3QoKTtcblxuICAgIC8vIDguXG4gICAgdmFyIGluZGV4ID0gMDtcblxuICAgIC8vIDkuXG4gICAgdmFyIGJlZ2luSW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJ3snKTtcblxuICAgIC8vIDEwLlxuICAgIHZhciBlbmRJbmRleCA9IDA7XG5cbiAgICAvLyBOZWVkIHRoZSBsb2NhbGUgbWludXMgYW55IGV4dGVuc2lvbnNcbiAgICB2YXIgZGF0YUxvY2FsZSA9IGludGVybmFsWydbW2RhdGFMb2NhbGVdXSddO1xuXG4gICAgLy8gTmVlZCB0aGUgY2FsZW5kYXIgZGF0YSBmcm9tIENMRFJcbiAgICB2YXIgbG9jYWxlRGF0YSA9IGludGVybmFscy5EYXRlVGltZUZvcm1hdFsnW1tsb2NhbGVEYXRhXV0nXVtkYXRhTG9jYWxlXS5jYWxlbmRhcnM7XG4gICAgdmFyIGNhID0gaW50ZXJuYWxbJ1tbY2FsZW5kYXJdXSddO1xuXG4gICAgLy8gMTEuXG4gICAgd2hpbGUgKGJlZ2luSW5kZXggIT09IC0xKSB7XG4gICAgICAgIHZhciBmdiA9IHZvaWQgMDtcbiAgICAgICAgLy8gYS5cbiAgICAgICAgZW5kSW5kZXggPSBwYXR0ZXJuLmluZGV4T2YoJ30nLCBiZWdpbkluZGV4KTtcbiAgICAgICAgLy8gYi5cbiAgICAgICAgaWYgKGVuZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBwYXR0ZXJuJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gYy5cbiAgICAgICAgaWYgKGJlZ2luSW5kZXggPiBpbmRleCkge1xuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdsaXRlcmFsJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcGF0dGVybi5zdWJzdHJpbmcoaW5kZXgsIGJlZ2luSW5kZXgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBkLlxuICAgICAgICB2YXIgcCA9IHBhdHRlcm4uc3Vic3RyaW5nKGJlZ2luSW5kZXggKyAxLCBlbmRJbmRleCk7XG4gICAgICAgIC8vIGUuXG4gICAgICAgIGlmIChkYXRlVGltZUNvbXBvbmVudHMuaGFzT3duUHJvcGVydHkocCkpIHtcbiAgICAgICAgICAgIC8vICAgaS4gTGV0IGYgYmUgdGhlIHZhbHVlIG9mIHRoZSBbWzxwPl1dIGludGVybmFsIHByb3BlcnR5IG9mIGRhdGVUaW1lRm9ybWF0LlxuICAgICAgICAgICAgdmFyIGYgPSBpbnRlcm5hbFsnW1snICsgcCArICddXSddO1xuICAgICAgICAgICAgLy8gIGlpLiBMZXQgdiBiZSB0aGUgdmFsdWUgb2YgdG0uW1s8cD5dXS5cbiAgICAgICAgICAgIHZhciB2ID0gdG1bJ1tbJyArIHAgKyAnXV0nXTtcbiAgICAgICAgICAgIC8vIGlpaS4gSWYgcCBpcyBcInllYXJcIiBhbmQgdiDiiaQgMCwgdGhlbiBsZXQgdiBiZSAxIC0gdi5cbiAgICAgICAgICAgIGlmIChwID09PSAneWVhcicgJiYgdiA8PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IDEgLSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gIGl2LiBJZiBwIGlzIFwibW9udGhcIiwgdGhlbiBpbmNyZWFzZSB2IGJ5IDEuXG4gICAgICAgICAgICBlbHNlIGlmIChwID09PSAnbW9udGgnKSB7XG4gICAgICAgICAgICAgICAgICAgIHYrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gICB2LiBJZiBwIGlzIFwiaG91clwiIGFuZCB0aGUgdmFsdWUgb2YgdGhlIFtbaG91cjEyXV0gaW50ZXJuYWwgcHJvcGVydHkgb2ZcbiAgICAgICAgICAgICAgICAvLyAgICAgIGRhdGVUaW1lRm9ybWF0IGlzIHRydWUsIHRoZW5cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwID09PSAnaG91cicgJiYgaW50ZXJuYWxbJ1tbaG91cjEyXV0nXSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMS4gTGV0IHYgYmUgdiBtb2R1bG8gMTIuXG4gICAgICAgICAgICAgICAgICAgICAgICB2ID0gdiAlIDEyO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gMi4gSWYgdiBpcyAwIGFuZCB0aGUgdmFsdWUgb2YgdGhlIFtbaG91ck5vMF1dIGludGVybmFsIHByb3BlcnR5IG9mXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICBkYXRlVGltZUZvcm1hdCBpcyB0cnVlLCB0aGVuIGxldCB2IGJlIDEyLlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgPT09IDAgJiYgaW50ZXJuYWxbJ1tbaG91ck5vMF1dJ10gPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gMTI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gIHZpLiBJZiBmIGlzIFwibnVtZXJpY1wiLCB0aGVuXG4gICAgICAgICAgICBpZiAoZiA9PT0gJ251bWVyaWMnKSB7XG4gICAgICAgICAgICAgICAgLy8gMS4gTGV0IGZ2IGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgRm9ybWF0TnVtYmVyIGFic3RyYWN0IG9wZXJhdGlvblxuICAgICAgICAgICAgICAgIC8vICAgIChkZWZpbmVkIGluIDExLjMuMikgd2l0aCBhcmd1bWVudHMgbmYgYW5kIHYuXG4gICAgICAgICAgICAgICAgZnYgPSBGb3JtYXROdW1iZXIobmYsIHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gdmlpLiBFbHNlIGlmIGYgaXMgXCIyLWRpZ2l0XCIsIHRoZW5cbiAgICAgICAgICAgIGVsc2UgaWYgKGYgPT09ICcyLWRpZ2l0Jykge1xuICAgICAgICAgICAgICAgICAgICAvLyAxLiBMZXQgZnYgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXROdW1iZXIgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgICAgICAgICAgICAgICAgIC8vICAgIHdpdGggYXJndW1lbnRzIG5mMiBhbmQgdi5cbiAgICAgICAgICAgICAgICAgICAgZnYgPSBGb3JtYXROdW1iZXIobmYyLCB2KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gMi4gSWYgdGhlIGxlbmd0aCBvZiBmdiBpcyBncmVhdGVyIHRoYW4gMiwgbGV0IGZ2IGJlIHRoZSBzdWJzdHJpbmcgb2YgZnZcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgY29udGFpbmluZyB0aGUgbGFzdCB0d28gY2hhcmFjdGVycy5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ2Lmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gZnYuc2xpY2UoLTIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIHZpaWkuIEVsc2UgaWYgZiBpcyBcIm5hcnJvd1wiLCBcInNob3J0XCIsIG9yIFwibG9uZ1wiLCB0aGVuIGxldCBmdiBiZSBhIFN0cmluZ1xuICAgICAgICAgICAgICAgIC8vICAgICB2YWx1ZSByZXByZXNlbnRpbmcgZiBpbiB0aGUgZGVzaXJlZCBmb3JtOyB0aGUgU3RyaW5nIHZhbHVlIGRlcGVuZHMgdXBvblxuICAgICAgICAgICAgICAgIC8vICAgICB0aGUgaW1wbGVtZW50YXRpb24gYW5kIHRoZSBlZmZlY3RpdmUgbG9jYWxlIGFuZCBjYWxlbmRhciBvZlxuICAgICAgICAgICAgICAgIC8vICAgICBkYXRlVGltZUZvcm1hdC4gSWYgcCBpcyBcIm1vbnRoXCIsIHRoZW4gdGhlIFN0cmluZyB2YWx1ZSBtYXkgYWxzbyBkZXBlbmRcbiAgICAgICAgICAgICAgICAvLyAgICAgb24gd2hldGhlciBkYXRlVGltZUZvcm1hdCBoYXMgYSBbW2RheV1dIGludGVybmFsIHByb3BlcnR5LiBJZiBwIGlzXG4gICAgICAgICAgICAgICAgLy8gICAgIFwidGltZVpvbmVOYW1lXCIsIHRoZW4gdGhlIFN0cmluZyB2YWx1ZSBtYXkgYWxzbyBkZXBlbmQgb24gdGhlIHZhbHVlIG9mXG4gICAgICAgICAgICAgICAgLy8gICAgIHRoZSBbW2luRFNUXV0gZmllbGQgb2YgdG0uXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZiBpbiBkYXRlV2lkdGhzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzd2l0Y2ggKHApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdtb250aCc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gcmVzb2x2ZURhdGVTdHJpbmcobG9jYWxlRGF0YSwgY2EsICdtb250aHMnLCBmLCB0bVsnW1snICsgcCArICddXSddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICd3ZWVrZGF5JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gcmVzb2x2ZURhdGVTdHJpbmcobG9jYWxlRGF0YSwgY2EsICdkYXlzJywgZiwgdG1bJ1tbJyArIHAgKyAnXV0nXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmdiA9IHJlc29sdmVEYXRlU3RyaW5nKGNhLmRheXMsIGYpW3RtWydbWycrIHAgKyddXSddXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCB3ZWVrZGF5IGRhdGEgZm9yIGxvY2FsZSAnICsgbG9jYWxlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RpbWVab25lTmFtZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ2ID0gJyc7IC8vICMjI1RPRE9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYXNlICdlcmEnOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnYgPSByZXNvbHZlRGF0ZVN0cmluZyhsb2NhbGVEYXRhLCBjYSwgJ2VyYXMnLCBmLCB0bVsnW1snICsgcCArICddXSddKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBlcmEgZGF0YSBmb3IgbG9jYWxlICcgKyBsb2NhbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnYgPSB0bVsnW1snICsgcCArICddXSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpeFxuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKHJlc3VsdCwge1xuICAgICAgICAgICAgICAgIHR5cGU6IHAsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ2XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGYuXG4gICAgICAgIH0gZWxzZSBpZiAocCA9PT0gJ2FtcG0nKSB7XG4gICAgICAgICAgICAvLyBpLlxuICAgICAgICAgICAgdmFyIF92ID0gdG1bJ1tbaG91cl1dJ107XG4gICAgICAgICAgICAvLyBpaS4vaWlpLlxuICAgICAgICAgICAgZnYgPSByZXNvbHZlRGF0ZVN0cmluZyhsb2NhbGVEYXRhLCBjYSwgJ2RheVBlcmlvZHMnLCBfdiA+IDExID8gJ3BtJyA6ICdhbScsIG51bGwpO1xuICAgICAgICAgICAgLy8gaXYuXG4gICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2RheVBlcmlvZCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IGZ2XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIGcuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcnJQdXNoLmNhbGwocmVzdWx0LCB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ2xpdGVyYWwnLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwYXR0ZXJuLnN1YnN0cmluZyhiZWdpbkluZGV4LCBlbmRJbmRleCArIDEpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBoLlxuICAgICAgICBpbmRleCA9IGVuZEluZGV4ICsgMTtcbiAgICAgICAgLy8gaS5cbiAgICAgICAgYmVnaW5JbmRleCA9IHBhdHRlcm4uaW5kZXhPZigneycsIGluZGV4KTtcbiAgICB9XG4gICAgLy8gMTIuXG4gICAgaWYgKGVuZEluZGV4IDwgcGF0dGVybi5sZW5ndGggLSAxKSB7XG4gICAgICAgIGFyclB1c2guY2FsbChyZXN1bHQsIHtcbiAgICAgICAgICAgIHR5cGU6ICdsaXRlcmFsJyxcbiAgICAgICAgICAgIHZhbHVlOiBwYXR0ZXJuLnN1YnN0cihlbmRJbmRleCArIDEpXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyAxMy5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIEZvcm1hdERhdGVUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgZGF0ZVRpbWVGb3JtYXRcbiAqICh3aGljaCBtdXN0IGJlIGFuIG9iamVjdCBpbml0aWFsaXplZCBhcyBhIERhdGVUaW1lRm9ybWF0KSBhbmQgeCAod2hpY2ggbXVzdCBiZSBhIE51bWJlclxuICogdmFsdWUpLCBpdCByZXR1cm5zIGEgU3RyaW5nIHZhbHVlIHJlcHJlc2VudGluZyB4IChpbnRlcnByZXRlZCBhcyBhIHRpbWUgdmFsdWUgYXNcbiAqIHNwZWNpZmllZCBpbiBFUzUsIDE1LjkuMS4xKSBhY2NvcmRpbmcgdG8gdGhlIGVmZmVjdGl2ZSBsb2NhbGUgYW5kIHRoZSBmb3JtYXR0aW5nXG4gKiBvcHRpb25zIG9mIGRhdGVUaW1lRm9ybWF0LlxuICovXG5mdW5jdGlvbiBGb3JtYXREYXRlVGltZShkYXRlVGltZUZvcm1hdCwgeCkge1xuICAgIHZhciBwYXJ0cyA9IENyZWF0ZURhdGVUaW1lUGFydHMoZGF0ZVRpbWVGb3JtYXQsIHgpO1xuICAgIHZhciByZXN1bHQgPSAnJztcblxuICAgIGZvciAodmFyIGkgPSAwOyBwYXJ0cy5sZW5ndGggPiBpOyBpKyspIHtcbiAgICAgICAgdmFyIHBhcnQgPSBwYXJ0c1tpXTtcbiAgICAgICAgcmVzdWx0ICs9IHBhcnQudmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIEZvcm1hdFRvUGFydHNEYXRlVGltZShkYXRlVGltZUZvcm1hdCwgeCkge1xuICAgIHZhciBwYXJ0cyA9IENyZWF0ZURhdGVUaW1lUGFydHMoZGF0ZVRpbWVGb3JtYXQsIHgpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgcGFydHMubGVuZ3RoID4gaTsgaSsrKSB7XG4gICAgICAgIHZhciBwYXJ0ID0gcGFydHNbaV07XG4gICAgICAgIHJlc3VsdC5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IHBhcnQudHlwZSxcbiAgICAgICAgICAgIHZhbHVlOiBwYXJ0LnZhbHVlXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFdoZW4gdGhlIFRvTG9jYWxUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiBpcyBjYWxsZWQgd2l0aCBhcmd1bWVudHMgZGF0ZSwgY2FsZW5kYXIsIGFuZFxuICogdGltZVpvbmUsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG5mdW5jdGlvbiBUb0xvY2FsVGltZShkYXRlLCBjYWxlbmRhciwgdGltZVpvbmUpIHtcbiAgICAvLyAxLiBBcHBseSBjYWxlbmRyaWNhbCBjYWxjdWxhdGlvbnMgb24gZGF0ZSBmb3IgdGhlIGdpdmVuIGNhbGVuZGFyIGFuZCB0aW1lIHpvbmUgdG9cbiAgICAvLyAgICBwcm9kdWNlIHdlZWtkYXksIGVyYSwgeWVhciwgbW9udGgsIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGFuZCBpbkRTVCB2YWx1ZXMuXG4gICAgLy8gICAgVGhlIGNhbGN1bGF0aW9ucyBzaG91bGQgdXNlIGJlc3QgYXZhaWxhYmxlIGluZm9ybWF0aW9uIGFib3V0IHRoZSBzcGVjaWZpZWRcbiAgICAvLyAgICBjYWxlbmRhciBhbmQgdGltZSB6b25lLiBJZiB0aGUgY2FsZW5kYXIgaXMgXCJncmVnb3J5XCIsIHRoZW4gdGhlIGNhbGN1bGF0aW9ucyBtdXN0XG4gICAgLy8gICAgbWF0Y2ggdGhlIGFsZ29yaXRobXMgc3BlY2lmaWVkIGluIEVTNSwgMTUuOS4xLCBleGNlcHQgdGhhdCBjYWxjdWxhdGlvbnMgYXJlIG5vdFxuICAgIC8vICAgIGJvdW5kIGJ5IHRoZSByZXN0cmljdGlvbnMgb24gdGhlIHVzZSBvZiBiZXN0IGF2YWlsYWJsZSBpbmZvcm1hdGlvbiBvbiB0aW1lIHpvbmVzXG4gICAgLy8gICAgZm9yIGxvY2FsIHRpbWUgem9uZSBhZGp1c3RtZW50IGFuZCBkYXlsaWdodCBzYXZpbmcgdGltZSBhZGp1c3RtZW50IGltcG9zZWQgYnlcbiAgICAvLyAgICBFUzUsIDE1LjkuMS43IGFuZCAxNS45LjEuOC5cbiAgICAvLyAjIyNUT0RPIyMjXG4gICAgdmFyIGQgPSBuZXcgRGF0ZShkYXRlKSxcbiAgICAgICAgbSA9ICdnZXQnICsgKHRpbWVab25lIHx8ICcnKTtcblxuICAgIC8vIDIuIFJldHVybiBhIFJlY29yZCB3aXRoIGZpZWxkcyBbW3dlZWtkYXldXSwgW1tlcmFdXSwgW1t5ZWFyXV0sIFtbbW9udGhdXSwgW1tkYXldXSxcbiAgICAvLyAgICBbW2hvdXJdXSwgW1ttaW51dGVdXSwgW1tzZWNvbmRdXSwgYW5kIFtbaW5EU1RdXSwgZWFjaCB3aXRoIHRoZSBjb3JyZXNwb25kaW5nXG4gICAgLy8gICAgY2FsY3VsYXRlZCB2YWx1ZS5cbiAgICByZXR1cm4gbmV3IFJlY29yZCh7XG4gICAgICAgICdbW3dlZWtkYXldXSc6IGRbbSArICdEYXknXSgpLFxuICAgICAgICAnW1tlcmFdXSc6ICsoZFttICsgJ0Z1bGxZZWFyJ10oKSA+PSAwKSxcbiAgICAgICAgJ1tbeWVhcl1dJzogZFttICsgJ0Z1bGxZZWFyJ10oKSxcbiAgICAgICAgJ1tbbW9udGhdXSc6IGRbbSArICdNb250aCddKCksXG4gICAgICAgICdbW2RheV1dJzogZFttICsgJ0RhdGUnXSgpLFxuICAgICAgICAnW1tob3VyXV0nOiBkW20gKyAnSG91cnMnXSgpLFxuICAgICAgICAnW1ttaW51dGVdXSc6IGRbbSArICdNaW51dGVzJ10oKSxcbiAgICAgICAgJ1tbc2Vjb25kXV0nOiBkW20gKyAnU2Vjb25kcyddKCksXG4gICAgICAgICdbW2luRFNUXV0nOiBmYWxzZSAvLyAjIyNUT0RPIyMjXG4gICAgfSk7XG59XG5cbi8qKlxuICogVGhlIGZ1bmN0aW9uIHJldHVybnMgYSBuZXcgb2JqZWN0IHdob3NlIHByb3BlcnRpZXMgYW5kIGF0dHJpYnV0ZXMgYXJlIHNldCBhcyBpZlxuICogY29uc3RydWN0ZWQgYnkgYW4gb2JqZWN0IGxpdGVyYWwgYXNzaWduaW5nIHRvIGVhY2ggb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzIHRoZVxuICogdmFsdWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgaW50ZXJuYWwgcHJvcGVydHkgb2YgdGhpcyBEYXRlVGltZUZvcm1hdCBvYmplY3QgKHNlZSAxMi40KTpcbiAqIGxvY2FsZSwgY2FsZW5kYXIsIG51bWJlcmluZ1N5c3RlbSwgdGltZVpvbmUsIGhvdXIxMiwgd2Vla2RheSwgZXJhLCB5ZWFyLCBtb250aCwgZGF5LFxuICogaG91ciwgbWludXRlLCBzZWNvbmQsIGFuZCB0aW1lWm9uZU5hbWUuIFByb3BlcnRpZXMgd2hvc2UgY29ycmVzcG9uZGluZyBpbnRlcm5hbFxuICogcHJvcGVydGllcyBhcmUgbm90IHByZXNlbnQgYXJlIG5vdCBhc3NpZ25lZC5cbiAqL1xuLyogMTIuMy4zICovZGVmaW5lUHJvcGVydHkoSW50bC5EYXRlVGltZUZvcm1hdC5wcm90b3R5cGUsICdyZXNvbHZlZE9wdGlvbnMnLCB7XG4gICAgd3JpdGFibGU6IHRydWUsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB2YWx1ZSgpIHtcbiAgICAgICAgdmFyIHByb3AgPSB2b2lkIDAsXG4gICAgICAgICAgICBkZXNjcyA9IG5ldyBSZWNvcmQoKSxcbiAgICAgICAgICAgIHByb3BzID0gWydsb2NhbGUnLCAnY2FsZW5kYXInLCAnbnVtYmVyaW5nU3lzdGVtJywgJ3RpbWVab25lJywgJ2hvdXIxMicsICd3ZWVrZGF5JywgJ2VyYScsICd5ZWFyJywgJ21vbnRoJywgJ2RheScsICdob3VyJywgJ21pbnV0ZScsICdzZWNvbmQnLCAndGltZVpvbmVOYW1lJ10sXG4gICAgICAgICAgICBpbnRlcm5hbCA9IHRoaXMgIT09IG51bGwgJiYgYmFiZWxIZWxwZXJzJDFbXCJ0eXBlb2ZcIl0odGhpcykgPT09ICdvYmplY3QnICYmIGdldEludGVybmFsUHJvcGVydGllcyh0aGlzKTtcblxuICAgICAgICAvLyBTYXRpc2Z5IHRlc3QgMTIuM19iXG4gICAgICAgIGlmICghaW50ZXJuYWwgfHwgIWludGVybmFsWydbW2luaXRpYWxpemVkRGF0ZVRpbWVGb3JtYXRdXSddKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgZm9yIHJlc29sdmVkT3B0aW9ucygpIGlzIG5vdCBhbiBpbml0aWFsaXplZCBJbnRsLkRhdGVUaW1lRm9ybWF0IG9iamVjdC4nKTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbWF4ID0gcHJvcHMubGVuZ3RoOyBpIDwgbWF4OyBpKyspIHtcbiAgICAgICAgICAgIGlmIChob3AuY2FsbChpbnRlcm5hbCwgcHJvcCA9ICdbWycgKyBwcm9wc1tpXSArICddXScpKSBkZXNjc1twcm9wc1tpXV0gPSB7IHZhbHVlOiBpbnRlcm5hbFtwcm9wXSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgZW51bWVyYWJsZTogdHJ1ZSB9O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG9iakNyZWF0ZSh7fSwgZGVzY3MpO1xuICAgIH1cbn0pO1xuXG52YXIgbHMgPSBJbnRsLl9fbG9jYWxlU2Vuc2l0aXZlUHJvdG9zID0ge1xuICAgIE51bWJlcjoge30sXG4gICAgRGF0ZToge31cbn07XG5cbi8qKlxuICogV2hlbiB0aGUgdG9Mb2NhbGVTdHJpbmcgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIG9wdGlvbmFsIGFyZ3VtZW50cyBsb2NhbGVzIGFuZCBvcHRpb25zLFxuICogdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbi8qIDEzLjIuMSAqL2xzLk51bWJlci50b0xvY2FsZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTYXRpc2Z5IHRlc3QgMTMuMi4xXzFcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaXMpICE9PSAnW29iamVjdCBOdW1iZXJdJykgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIG11c3QgYmUgYSBudW1iZXIgZm9yIE51bWJlci5wcm90b3R5cGUudG9Mb2NhbGVTdHJpbmcoKScpO1xuXG4gICAgLy8gMS4gTGV0IHggYmUgdGhpcyBOdW1iZXIgdmFsdWUgKGFzIGRlZmluZWQgaW4gRVM1LCAxNS43LjQpLlxuICAgIC8vIDIuIElmIGxvY2FsZXMgaXMgbm90IHByb3ZpZGVkLCB0aGVuIGxldCBsb2NhbGVzIGJlIHVuZGVmaW5lZC5cbiAgICAvLyAzLiBJZiBvcHRpb25zIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgb3B0aW9ucyBiZSB1bmRlZmluZWQuXG4gICAgLy8gNC4gTGV0IG51bWJlckZvcm1hdCBiZSB0aGUgcmVzdWx0IG9mIGNyZWF0aW5nIGEgbmV3IG9iamVjdCBhcyBpZiBieSB0aGVcbiAgICAvLyAgICBleHByZXNzaW9uIG5ldyBJbnRsLk51bWJlckZvcm1hdChsb2NhbGVzLCBvcHRpb25zKSB3aGVyZVxuICAgIC8vICAgIEludGwuTnVtYmVyRm9ybWF0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciBkZWZpbmVkIGluIDExLjEuMy5cbiAgICAvLyA1LiBSZXR1cm4gdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBGb3JtYXROdW1iZXIgYWJzdHJhY3Qgb3BlcmF0aW9uXG4gICAgLy8gICAgKGRlZmluZWQgaW4gMTEuMy4yKSB3aXRoIGFyZ3VtZW50cyBudW1iZXJGb3JtYXQgYW5kIHguXG4gICAgcmV0dXJuIEZvcm1hdE51bWJlcihuZXcgTnVtYmVyRm9ybWF0Q29uc3RydWN0b3IoYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pLCB0aGlzKTtcbn07XG5cbi8qKlxuICogV2hlbiB0aGUgdG9Mb2NhbGVTdHJpbmcgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIG9wdGlvbmFsIGFyZ3VtZW50cyBsb2NhbGVzIGFuZCBvcHRpb25zLFxuICogdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbi8qIDEzLjMuMSAqL2xzLkRhdGUudG9Mb2NhbGVTdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8gU2F0aXNmeSB0ZXN0IDEzLjMuMF8xXG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGlzKSAhPT0gJ1tvYmplY3QgRGF0ZV0nKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdgdGhpc2AgdmFsdWUgbXVzdCBiZSBhIERhdGUgaW5zdGFuY2UgZm9yIERhdGUucHJvdG90eXBlLnRvTG9jYWxlU3RyaW5nKCknKTtcblxuICAgIC8vIDEuIExldCB4IGJlIHRoaXMgdGltZSB2YWx1ZSAoYXMgZGVmaW5lZCBpbiBFUzUsIDE1LjkuNSkuXG4gICAgdmFyIHggPSArdGhpcztcblxuICAgIC8vIDIuIElmIHggaXMgTmFOLCB0aGVuIHJldHVybiBcIkludmFsaWQgRGF0ZVwiLlxuICAgIGlmIChpc05hTih4KSkgcmV0dXJuICdJbnZhbGlkIERhdGUnO1xuXG4gICAgLy8gMy4gSWYgbG9jYWxlcyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IGxvY2FsZXMgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBsb2NhbGVzID0gYXJndW1lbnRzWzBdO1xuXG4gICAgLy8gNC4gSWYgb3B0aW9ucyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IG9wdGlvbnMgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzWzFdO1xuXG4gICAgLy8gNS4gTGV0IG9wdGlvbnMgYmUgdGhlIHJlc3VsdCBvZiBjYWxsaW5nIHRoZSBUb0RhdGVUaW1lT3B0aW9ucyBhYnN0cmFjdFxuICAgIC8vICAgIG9wZXJhdGlvbiAoZGVmaW5lZCBpbiAxMi4xLjEpIHdpdGggYXJndW1lbnRzIG9wdGlvbnMsIFwiYW55XCIsIGFuZCBcImFsbFwiLlxuICAgIG9wdGlvbnMgPSBUb0RhdGVUaW1lT3B0aW9ucyhvcHRpb25zLCAnYW55JywgJ2FsbCcpO1xuXG4gICAgLy8gNi4gTGV0IGRhdGVUaW1lRm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IGFzIGlmIGJ5IHRoZVxuICAgIC8vICAgIGV4cHJlc3Npb24gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucykgd2hlcmVcbiAgICAvLyAgICBJbnRsLkRhdGVUaW1lRm9ybWF0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciBkZWZpbmVkIGluIDEyLjEuMy5cbiAgICB2YXIgZGF0ZVRpbWVGb3JtYXQgPSBuZXcgRGF0ZVRpbWVGb3JtYXRDb25zdHJ1Y3Rvcihsb2NhbGVzLCBvcHRpb25zKTtcblxuICAgIC8vIDcuIFJldHVybiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEZvcm1hdERhdGVUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZFxuICAgIC8vICAgIGluIDEyLjMuMikgd2l0aCBhcmd1bWVudHMgZGF0ZVRpbWVGb3JtYXQgYW5kIHguXG4gICAgcmV0dXJuIEZvcm1hdERhdGVUaW1lKGRhdGVUaW1lRm9ybWF0LCB4KTtcbn07XG5cbi8qKlxuICogV2hlbiB0aGUgdG9Mb2NhbGVEYXRlU3RyaW5nIG1ldGhvZCBpcyBjYWxsZWQgd2l0aCBvcHRpb25hbCBhcmd1bWVudHMgbG9jYWxlcyBhbmRcbiAqIG9wdGlvbnMsIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuICovXG4vKiAxMy4zLjIgKi9scy5EYXRlLnRvTG9jYWxlRGF0ZVN0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBTYXRpc2Z5IHRlc3QgMTMuMy4wXzFcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHRoaXMpICE9PSAnW29iamVjdCBEYXRlXScpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2B0aGlzYCB2YWx1ZSBtdXN0IGJlIGEgRGF0ZSBpbnN0YW5jZSBmb3IgRGF0ZS5wcm90b3R5cGUudG9Mb2NhbGVEYXRlU3RyaW5nKCknKTtcblxuICAgIC8vIDEuIExldCB4IGJlIHRoaXMgdGltZSB2YWx1ZSAoYXMgZGVmaW5lZCBpbiBFUzUsIDE1LjkuNSkuXG4gICAgdmFyIHggPSArdGhpcztcblxuICAgIC8vIDIuIElmIHggaXMgTmFOLCB0aGVuIHJldHVybiBcIkludmFsaWQgRGF0ZVwiLlxuICAgIGlmIChpc05hTih4KSkgcmV0dXJuICdJbnZhbGlkIERhdGUnO1xuXG4gICAgLy8gMy4gSWYgbG9jYWxlcyBpcyBub3QgcHJvdmlkZWQsIHRoZW4gbGV0IGxvY2FsZXMgYmUgdW5kZWZpbmVkLlxuICAgIHZhciBsb2NhbGVzID0gYXJndW1lbnRzWzBdLFxuXG5cbiAgICAvLyA0LiBJZiBvcHRpb25zIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgb3B0aW9ucyBiZSB1bmRlZmluZWQuXG4gICAgb3B0aW9ucyA9IGFyZ3VtZW50c1sxXTtcblxuICAgIC8vIDUuIExldCBvcHRpb25zIGJlIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgVG9EYXRlVGltZU9wdGlvbnMgYWJzdHJhY3RcbiAgICAvLyAgICBvcGVyYXRpb24gKGRlZmluZWQgaW4gMTIuMS4xKSB3aXRoIGFyZ3VtZW50cyBvcHRpb25zLCBcImRhdGVcIiwgYW5kIFwiZGF0ZVwiLlxuICAgIG9wdGlvbnMgPSBUb0RhdGVUaW1lT3B0aW9ucyhvcHRpb25zLCAnZGF0ZScsICdkYXRlJyk7XG5cbiAgICAvLyA2LiBMZXQgZGF0ZVRpbWVGb3JtYXQgYmUgdGhlIHJlc3VsdCBvZiBjcmVhdGluZyBhIG5ldyBvYmplY3QgYXMgaWYgYnkgdGhlXG4gICAgLy8gICAgZXhwcmVzc2lvbiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsb2NhbGVzLCBvcHRpb25zKSB3aGVyZVxuICAgIC8vICAgIEludGwuRGF0ZVRpbWVGb3JtYXQgaXMgdGhlIHN0YW5kYXJkIGJ1aWx0LWluIGNvbnN0cnVjdG9yIGRlZmluZWQgaW4gMTIuMS4zLlxuICAgIHZhciBkYXRlVGltZUZvcm1hdCA9IG5ldyBEYXRlVGltZUZvcm1hdENvbnN0cnVjdG9yKGxvY2FsZXMsIG9wdGlvbnMpO1xuXG4gICAgLy8gNy4gUmV0dXJuIHRoZSByZXN1bHQgb2YgY2FsbGluZyB0aGUgRm9ybWF0RGF0ZVRpbWUgYWJzdHJhY3Qgb3BlcmF0aW9uIChkZWZpbmVkXG4gICAgLy8gICAgaW4gMTIuMy4yKSB3aXRoIGFyZ3VtZW50cyBkYXRlVGltZUZvcm1hdCBhbmQgeC5cbiAgICByZXR1cm4gRm9ybWF0RGF0ZVRpbWUoZGF0ZVRpbWVGb3JtYXQsIHgpO1xufTtcblxuLyoqXG4gKiBXaGVuIHRoZSB0b0xvY2FsZVRpbWVTdHJpbmcgbWV0aG9kIGlzIGNhbGxlZCB3aXRoIG9wdGlvbmFsIGFyZ3VtZW50cyBsb2NhbGVzIGFuZFxuICogb3B0aW9ucywgdGhlIGZvbGxvd2luZyBzdGVwcyBhcmUgdGFrZW46XG4gKi9cbi8qIDEzLjMuMyAqL2xzLkRhdGUudG9Mb2NhbGVUaW1lU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIC8vIFNhdGlzZnkgdGVzdCAxMy4zLjBfMVxuICAgIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpcykgIT09ICdbb2JqZWN0IERhdGVdJykgdGhyb3cgbmV3IFR5cGVFcnJvcignYHRoaXNgIHZhbHVlIG11c3QgYmUgYSBEYXRlIGluc3RhbmNlIGZvciBEYXRlLnByb3RvdHlwZS50b0xvY2FsZVRpbWVTdHJpbmcoKScpO1xuXG4gICAgLy8gMS4gTGV0IHggYmUgdGhpcyB0aW1lIHZhbHVlIChhcyBkZWZpbmVkIGluIEVTNSwgMTUuOS41KS5cbiAgICB2YXIgeCA9ICt0aGlzO1xuXG4gICAgLy8gMi4gSWYgeCBpcyBOYU4sIHRoZW4gcmV0dXJuIFwiSW52YWxpZCBEYXRlXCIuXG4gICAgaWYgKGlzTmFOKHgpKSByZXR1cm4gJ0ludmFsaWQgRGF0ZSc7XG5cbiAgICAvLyAzLiBJZiBsb2NhbGVzIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgbG9jYWxlcyBiZSB1bmRlZmluZWQuXG4gICAgdmFyIGxvY2FsZXMgPSBhcmd1bWVudHNbMF07XG5cbiAgICAvLyA0LiBJZiBvcHRpb25zIGlzIG5vdCBwcm92aWRlZCwgdGhlbiBsZXQgb3B0aW9ucyBiZSB1bmRlZmluZWQuXG4gICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHNbMV07XG5cbiAgICAvLyA1LiBMZXQgb3B0aW9ucyBiZSB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIFRvRGF0ZVRpbWVPcHRpb25zIGFic3RyYWN0XG4gICAgLy8gICAgb3BlcmF0aW9uIChkZWZpbmVkIGluIDEyLjEuMSkgd2l0aCBhcmd1bWVudHMgb3B0aW9ucywgXCJ0aW1lXCIsIGFuZCBcInRpbWVcIi5cbiAgICBvcHRpb25zID0gVG9EYXRlVGltZU9wdGlvbnMob3B0aW9ucywgJ3RpbWUnLCAndGltZScpO1xuXG4gICAgLy8gNi4gTGV0IGRhdGVUaW1lRm9ybWF0IGJlIHRoZSByZXN1bHQgb2YgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IGFzIGlmIGJ5IHRoZVxuICAgIC8vICAgIGV4cHJlc3Npb24gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQobG9jYWxlcywgb3B0aW9ucykgd2hlcmVcbiAgICAvLyAgICBJbnRsLkRhdGVUaW1lRm9ybWF0IGlzIHRoZSBzdGFuZGFyZCBidWlsdC1pbiBjb25zdHJ1Y3RvciBkZWZpbmVkIGluIDEyLjEuMy5cbiAgICB2YXIgZGF0ZVRpbWVGb3JtYXQgPSBuZXcgRGF0ZVRpbWVGb3JtYXRDb25zdHJ1Y3Rvcihsb2NhbGVzLCBvcHRpb25zKTtcblxuICAgIC8vIDcuIFJldHVybiB0aGUgcmVzdWx0IG9mIGNhbGxpbmcgdGhlIEZvcm1hdERhdGVUaW1lIGFic3RyYWN0IG9wZXJhdGlvbiAoZGVmaW5lZFxuICAgIC8vICAgIGluIDEyLjMuMikgd2l0aCBhcmd1bWVudHMgZGF0ZVRpbWVGb3JtYXQgYW5kIHguXG4gICAgcmV0dXJuIEZvcm1hdERhdGVUaW1lKGRhdGVUaW1lRm9ybWF0LCB4KTtcbn07XG5cbmRlZmluZVByb3BlcnR5KEludGwsICdfX2FwcGx5TG9jYWxlU2Vuc2l0aXZlUHJvdG90eXBlcycsIHtcbiAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHZhbHVlKCkge1xuICAgICAgICBkZWZpbmVQcm9wZXJ0eShOdW1iZXIucHJvdG90eXBlLCAndG9Mb2NhbGVTdHJpbmcnLCB7IHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBscy5OdW1iZXIudG9Mb2NhbGVTdHJpbmcgfSk7XG4gICAgICAgIC8vIE5lZWQgdGhpcyBoZXJlIGZvciBJRSA4LCB0byBhdm9pZCB0aGUgX0RvbnRFbnVtXyBidWdcbiAgICAgICAgZGVmaW5lUHJvcGVydHkoRGF0ZS5wcm90b3R5cGUsICd0b0xvY2FsZVN0cmluZycsIHsgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IGxzLkRhdGUudG9Mb2NhbGVTdHJpbmcgfSk7XG5cbiAgICAgICAgZm9yICh2YXIgayBpbiBscy5EYXRlKSB7XG4gICAgICAgICAgICBpZiAoaG9wLmNhbGwobHMuRGF0ZSwgaykpIGRlZmluZVByb3BlcnR5KERhdGUucHJvdG90eXBlLCBrLCB7IHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUsIHZhbHVlOiBscy5EYXRlW2tdIH0pO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbi8qKlxuICogQ2FuJ3QgcmVhbGx5IHNoaXAgYSBzaW5nbGUgc2NyaXB0IHdpdGggZGF0YSBmb3IgaHVuZHJlZHMgb2YgbG9jYWxlcywgc28gd2UgcHJvdmlkZVxuICogdGhpcyBfX2FkZExvY2FsZURhdGEgbWV0aG9kIGFzIGEgbWVhbnMgZm9yIHRoZSBkZXZlbG9wZXIgdG8gYWRkIHRoZSBkYXRhIG9uIGFuXG4gKiBhcy1uZWVkZWQgYmFzaXNcbiAqL1xuZGVmaW5lUHJvcGVydHkoSW50bCwgJ19fYWRkTG9jYWxlRGF0YScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoZGF0YSkge1xuICAgICAgICBpZiAoIUlzU3RydWN0dXJhbGx5VmFsaWRMYW5ndWFnZVRhZyhkYXRhLmxvY2FsZSkpIHRocm93IG5ldyBFcnJvcihcIk9iamVjdCBwYXNzZWQgZG9lc24ndCBpZGVudGlmeSBpdHNlbGYgd2l0aCBhIHZhbGlkIGxhbmd1YWdlIHRhZ1wiKTtcblxuICAgICAgICBhZGRMb2NhbGVEYXRhKGRhdGEsIGRhdGEubG9jYWxlKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gYWRkTG9jYWxlRGF0YShkYXRhLCB0YWcpIHtcbiAgICAvLyBCb3RoIE51bWJlckZvcm1hdCBhbmQgRGF0ZVRpbWVGb3JtYXQgcmVxdWlyZSBudW1iZXIgZGF0YSwgc28gdGhyb3cgaWYgaXQgaXNuJ3QgcHJlc2VudFxuICAgIGlmICghZGF0YS5udW1iZXIpIHRocm93IG5ldyBFcnJvcihcIk9iamVjdCBwYXNzZWQgZG9lc24ndCBjb250YWluIGxvY2FsZSBkYXRhIGZvciBJbnRsLk51bWJlckZvcm1hdFwiKTtcblxuICAgIHZhciBsb2NhbGUgPSB2b2lkIDAsXG4gICAgICAgIGxvY2FsZXMgPSBbdGFnXSxcbiAgICAgICAgcGFydHMgPSB0YWcuc3BsaXQoJy0nKTtcblxuICAgIC8vIENyZWF0ZSBmYWxsYmFja3MgZm9yIGxvY2FsZSBkYXRhIHdpdGggc2NyaXB0cywgZS5nLiBMYXRuLCBIYW5zLCBWYWlpLCBldGNcbiAgICBpZiAocGFydHMubGVuZ3RoID4gMiAmJiBwYXJ0c1sxXS5sZW5ndGggPT09IDQpIGFyclB1c2guY2FsbChsb2NhbGVzLCBwYXJ0c1swXSArICctJyArIHBhcnRzWzJdKTtcblxuICAgIHdoaWxlIChsb2NhbGUgPSBhcnJTaGlmdC5jYWxsKGxvY2FsZXMpKSB7XG4gICAgICAgIC8vIEFkZCB0byBOdW1iZXJGb3JtYXQgaW50ZXJuYWwgcHJvcGVydGllcyBhcyBwZXIgMTEuMi4zXG4gICAgICAgIGFyclB1c2guY2FsbChpbnRlcm5hbHMuTnVtYmVyRm9ybWF0WydbW2F2YWlsYWJsZUxvY2FsZXNdXSddLCBsb2NhbGUpO1xuICAgICAgICBpbnRlcm5hbHMuTnVtYmVyRm9ybWF0WydbW2xvY2FsZURhdGFdXSddW2xvY2FsZV0gPSBkYXRhLm51bWJlcjtcblxuICAgICAgICAvLyAuLi5hbmQgRGF0ZVRpbWVGb3JtYXQgaW50ZXJuYWwgcHJvcGVydGllcyBhcyBwZXIgMTIuMi4zXG4gICAgICAgIGlmIChkYXRhLmRhdGUpIHtcbiAgICAgICAgICAgIGRhdGEuZGF0ZS5udSA9IGRhdGEubnVtYmVyLm51O1xuICAgICAgICAgICAgYXJyUHVzaC5jYWxsKGludGVybmFscy5EYXRlVGltZUZvcm1hdFsnW1thdmFpbGFibGVMb2NhbGVzXV0nXSwgbG9jYWxlKTtcbiAgICAgICAgICAgIGludGVybmFscy5EYXRlVGltZUZvcm1hdFsnW1tsb2NhbGVEYXRhXV0nXVtsb2NhbGVdID0gZGF0YS5kYXRlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgdGhpcyBpcyB0aGUgZmlyc3Qgc2V0IG9mIGxvY2FsZSBkYXRhIGFkZGVkLCBtYWtlIGl0IHRoZSBkZWZhdWx0XG4gICAgaWYgKGRlZmF1bHRMb2NhbGUgPT09IHVuZGVmaW5lZCkgc2V0RGVmYXVsdExvY2FsZSh0YWcpO1xufVxuXG5kZWZpbmVQcm9wZXJ0eShJbnRsLCAnX19kaXNhYmxlUmVnRXhwUmVzdG9yZScsIHtcbiAgICB2YWx1ZTogZnVuY3Rpb24gdmFsdWUoKSB7XG4gICAgICAgIGludGVybmFscy5kaXNhYmxlUmVnRXhwUmVzdG9yZSA9IHRydWU7XG4gICAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW50bDsiLCJtb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByYW5nZTsgLy8gQ3JlYXRlIGEgcmFuZ2Ugb2JqZWN0IGZvciBlZmZpY2VudGx5IHJlbmRlcmluZyBzdHJpbmdzIHRvIGVsZW1lbnRzLlxudmFyIE5TX1hIVE1MID0gJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGh0bWwnO1xuXG52YXIgZG9jID0gdHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGRvY3VtZW50O1xuXG52YXIgdGVzdEVsID0gZG9jID9cbiAgICBkb2MuYm9keSB8fCBkb2MuY3JlYXRlRWxlbWVudCgnZGl2JykgOlxuICAgIHt9O1xuXG4vLyBGaXhlcyA8aHR0cHM6Ly9naXRodWIuY29tL3BhdHJpY2stc3RlZWxlLWlkZW0vbW9ycGhkb20vaXNzdWVzLzMyPlxuLy8gKElFNysgc3VwcG9ydCkgPD1JRTcgZG9lcyBub3Qgc3VwcG9ydCBlbC5oYXNBdHRyaWJ1dGUobmFtZSlcbnZhciBhY3R1YWxIYXNBdHRyaWJ1dGVOUztcblxuaWYgKHRlc3RFbC5oYXNBdHRyaWJ1dGVOUykge1xuICAgIGFjdHVhbEhhc0F0dHJpYnV0ZU5TID0gZnVuY3Rpb24oZWwsIG5hbWVzcGFjZVVSSSwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZWwuaGFzQXR0cmlidXRlTlMobmFtZXNwYWNlVVJJLCBuYW1lKTtcbiAgICB9O1xufSBlbHNlIGlmICh0ZXN0RWwuaGFzQXR0cmlidXRlKSB7XG4gICAgYWN0dWFsSGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbC5oYXNBdHRyaWJ1dGUobmFtZSk7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgYWN0dWFsSGFzQXR0cmlidXRlTlMgPSBmdW5jdGlvbihlbCwgbmFtZXNwYWNlVVJJLCBuYW1lKSB7XG4gICAgICAgIHJldHVybiBlbC5nZXRBdHRyaWJ1dGVOb2RlKG5hbWVzcGFjZVVSSSwgbmFtZSkgIT0gbnVsbDtcbiAgICB9O1xufVxuXG52YXIgaGFzQXR0cmlidXRlTlMgPSBhY3R1YWxIYXNBdHRyaWJ1dGVOUztcblxuXG5mdW5jdGlvbiB0b0VsZW1lbnQoc3RyKSB7XG4gICAgaWYgKCFyYW5nZSAmJiBkb2MuY3JlYXRlUmFuZ2UpIHtcbiAgICAgICAgcmFuZ2UgPSBkb2MuY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgcmFuZ2Uuc2VsZWN0Tm9kZShkb2MuYm9keSk7XG4gICAgfVxuXG4gICAgdmFyIGZyYWdtZW50O1xuICAgIGlmIChyYW5nZSAmJiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQpIHtcbiAgICAgICAgZnJhZ21lbnQgPSByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoc3RyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmcmFnbWVudCA9IGRvYy5jcmVhdGVFbGVtZW50KCdib2R5Jyk7XG4gICAgICAgIGZyYWdtZW50LmlubmVySFRNTCA9IHN0cjtcbiAgICB9XG4gICAgcmV0dXJuIGZyYWdtZW50LmNoaWxkTm9kZXNbMF07XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHR3byBub2RlJ3MgbmFtZXMgYXJlIHRoZSBzYW1lLlxuICpcbiAqIE5PVEU6IFdlIGRvbid0IGJvdGhlciBjaGVja2luZyBgbmFtZXNwYWNlVVJJYCBiZWNhdXNlIHlvdSB3aWxsIG5ldmVyIGZpbmQgdHdvIEhUTUwgZWxlbWVudHMgd2l0aCB0aGUgc2FtZVxuICogICAgICAgbm9kZU5hbWUgYW5kIGRpZmZlcmVudCBuYW1lc3BhY2UgVVJJcy5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGFcbiAqIEBwYXJhbSB7RWxlbWVudH0gYiBUaGUgdGFyZ2V0IGVsZW1lbnRcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVOb2RlTmFtZXMoZnJvbUVsLCB0b0VsKSB7XG4gICAgdmFyIGZyb21Ob2RlTmFtZSA9IGZyb21FbC5ub2RlTmFtZTtcbiAgICB2YXIgdG9Ob2RlTmFtZSA9IHRvRWwubm9kZU5hbWU7XG5cbiAgICBpZiAoZnJvbU5vZGVOYW1lID09PSB0b05vZGVOYW1lKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0b0VsLmFjdHVhbGl6ZSAmJlxuICAgICAgICBmcm9tTm9kZU5hbWUuY2hhckNvZGVBdCgwKSA8IDkxICYmIC8qIGZyb20gdGFnIG5hbWUgaXMgdXBwZXIgY2FzZSAqL1xuICAgICAgICB0b05vZGVOYW1lLmNoYXJDb2RlQXQoMCkgPiA5MCAvKiB0YXJnZXQgdGFnIG5hbWUgaXMgbG93ZXIgY2FzZSAqLykge1xuICAgICAgICAvLyBJZiB0aGUgdGFyZ2V0IGVsZW1lbnQgaXMgYSB2aXJ0dWFsIERPTSBub2RlIHRoZW4gd2UgbWF5IG5lZWQgdG8gbm9ybWFsaXplIHRoZSB0YWcgbmFtZVxuICAgICAgICAvLyBiZWZvcmUgY29tcGFyaW5nLiBOb3JtYWwgSFRNTCBlbGVtZW50cyB0aGF0IGFyZSBpbiB0aGUgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCJcbiAgICAgICAgLy8gYXJlIGNvbnZlcnRlZCB0byB1cHBlciBjYXNlXG4gICAgICAgIHJldHVybiBmcm9tTm9kZU5hbWUgPT09IHRvTm9kZU5hbWUudG9VcHBlckNhc2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlbGVtZW50LCBvcHRpb25hbGx5IHdpdGggYSBrbm93biBuYW1lc3BhY2UgVVJJLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIHRoZSBlbGVtZW50IG5hbWUsIGUuZy4gJ2Rpdicgb3IgJ3N2ZydcbiAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZXNwYWNlVVJJXSB0aGUgZWxlbWVudCdzIG5hbWVzcGFjZSBVUkksIGkuZS4gdGhlIHZhbHVlIG9mXG4gKiBpdHMgYHhtbG5zYCBhdHRyaWJ1dGUgb3IgaXRzIGluZmVycmVkIG5hbWVzcGFjZS5cbiAqXG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50TlMobmFtZSwgbmFtZXNwYWNlVVJJKSB7XG4gICAgcmV0dXJuICFuYW1lc3BhY2VVUkkgfHwgbmFtZXNwYWNlVVJJID09PSBOU19YSFRNTCA/XG4gICAgICAgIGRvYy5jcmVhdGVFbGVtZW50KG5hbWUpIDpcbiAgICAgICAgZG9jLmNyZWF0ZUVsZW1lbnROUyhuYW1lc3BhY2VVUkksIG5hbWUpO1xufVxuXG4vKipcbiAqIENvcGllcyB0aGUgY2hpbGRyZW4gb2Ygb25lIERPTSBlbGVtZW50IHRvIGFub3RoZXIgRE9NIGVsZW1lbnRcbiAqL1xuZnVuY3Rpb24gbW92ZUNoaWxkcmVuKGZyb21FbCwgdG9FbCkge1xuICAgIHZhciBjdXJDaGlsZCA9IGZyb21FbC5maXJzdENoaWxkO1xuICAgIHdoaWxlIChjdXJDaGlsZCkge1xuICAgICAgICB2YXIgbmV4dENoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgIHRvRWwuYXBwZW5kQ2hpbGQoY3VyQ2hpbGQpO1xuICAgICAgICBjdXJDaGlsZCA9IG5leHRDaGlsZDtcbiAgICB9XG4gICAgcmV0dXJuIHRvRWw7XG59XG5cbmZ1bmN0aW9uIG1vcnBoQXR0cnMoZnJvbU5vZGUsIHRvTm9kZSkge1xuICAgIHZhciBhdHRycyA9IHRvTm9kZS5hdHRyaWJ1dGVzO1xuICAgIHZhciBpO1xuICAgIHZhciBhdHRyO1xuICAgIHZhciBhdHRyTmFtZTtcbiAgICB2YXIgYXR0ck5hbWVzcGFjZVVSSTtcbiAgICB2YXIgYXR0clZhbHVlO1xuICAgIHZhciBmcm9tVmFsdWU7XG5cbiAgICBmb3IgKGkgPSBhdHRycy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICBhdHRyID0gYXR0cnNbaV07XG4gICAgICAgIGF0dHJOYW1lID0gYXR0ci5uYW1lO1xuICAgICAgICBhdHRyTmFtZXNwYWNlVVJJID0gYXR0ci5uYW1lc3BhY2VVUkk7XG4gICAgICAgIGF0dHJWYWx1ZSA9IGF0dHIudmFsdWU7XG5cbiAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0ci5sb2NhbE5hbWUgfHwgYXR0ck5hbWU7XG4gICAgICAgICAgICBmcm9tVmFsdWUgPSBmcm9tTm9kZS5nZXRBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSk7XG5cbiAgICAgICAgICAgIGlmIChmcm9tVmFsdWUgIT09IGF0dHJWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGZyb21Ob2RlLnNldEF0dHJpYnV0ZU5TKGF0dHJOYW1lc3BhY2VVUkksIGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZnJvbVZhbHVlID0gZnJvbU5vZGUuZ2V0QXR0cmlidXRlKGF0dHJOYW1lKTtcblxuICAgICAgICAgICAgaWYgKGZyb21WYWx1ZSAhPT0gYXR0clZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZnJvbU5vZGUuc2V0QXR0cmlidXRlKGF0dHJOYW1lLCBhdHRyVmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFueSBleHRyYSBhdHRyaWJ1dGVzIGZvdW5kIG9uIHRoZSBvcmlnaW5hbCBET00gZWxlbWVudCB0aGF0XG4gICAgLy8gd2VyZW4ndCBmb3VuZCBvbiB0aGUgdGFyZ2V0IGVsZW1lbnQuXG4gICAgYXR0cnMgPSBmcm9tTm9kZS5hdHRyaWJ1dGVzO1xuXG4gICAgZm9yIChpID0gYXR0cnMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgYXR0ciA9IGF0dHJzW2ldO1xuICAgICAgICBpZiAoYXR0ci5zcGVjaWZpZWQgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubmFtZTtcbiAgICAgICAgICAgIGF0dHJOYW1lc3BhY2VVUkkgPSBhdHRyLm5hbWVzcGFjZVVSSTtcblxuICAgICAgICAgICAgaWYgKGF0dHJOYW1lc3BhY2VVUkkpIHtcbiAgICAgICAgICAgICAgICBhdHRyTmFtZSA9IGF0dHIubG9jYWxOYW1lIHx8IGF0dHJOYW1lO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFoYXNBdHRyaWJ1dGVOUyh0b05vZGUsIGF0dHJOYW1lc3BhY2VVUkksIGF0dHJOYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZS5yZW1vdmVBdHRyaWJ1dGVOUyhhdHRyTmFtZXNwYWNlVVJJLCBhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvTm9kZSwgbnVsbCwgYXR0ck5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21Ob2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzeW5jQm9vbGVhbkF0dHJQcm9wKGZyb21FbCwgdG9FbCwgbmFtZSkge1xuICAgIGlmIChmcm9tRWxbbmFtZV0gIT09IHRvRWxbbmFtZV0pIHtcbiAgICAgICAgZnJvbUVsW25hbWVdID0gdG9FbFtuYW1lXTtcbiAgICAgICAgaWYgKGZyb21FbFtuYW1lXSkge1xuICAgICAgICAgICAgZnJvbUVsLnNldEF0dHJpYnV0ZShuYW1lLCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmcm9tRWwucmVtb3ZlQXR0cmlidXRlKG5hbWUsICcnKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxudmFyIHNwZWNpYWxFbEhhbmRsZXJzID0ge1xuICAgIC8qKlxuICAgICAqIE5lZWRlZCBmb3IgSUUuIEFwcGFyZW50bHkgSUUgZG9lc24ndCB0aGluayB0aGF0IFwic2VsZWN0ZWRcIiBpcyBhblxuICAgICAqIGF0dHJpYnV0ZSB3aGVuIHJlYWRpbmcgb3ZlciB0aGUgYXR0cmlidXRlcyB1c2luZyBzZWxlY3RFbC5hdHRyaWJ1dGVzXG4gICAgICovXG4gICAgT1BUSU9OOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdzZWxlY3RlZCcpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogVGhlIFwidmFsdWVcIiBhdHRyaWJ1dGUgaXMgc3BlY2lhbCBmb3IgdGhlIDxpbnB1dD4gZWxlbWVudCBzaW5jZSBpdCBzZXRzXG4gICAgICogdGhlIGluaXRpYWwgdmFsdWUuIENoYW5naW5nIHRoZSBcInZhbHVlXCIgYXR0cmlidXRlIHdpdGhvdXQgY2hhbmdpbmcgdGhlXG4gICAgICogXCJ2YWx1ZVwiIHByb3BlcnR5IHdpbGwgaGF2ZSBubyBlZmZlY3Qgc2luY2UgaXQgaXMgb25seSB1c2VkIHRvIHRoZSBzZXQgdGhlXG4gICAgICogaW5pdGlhbCB2YWx1ZS4gIFNpbWlsYXIgZm9yIHRoZSBcImNoZWNrZWRcIiBhdHRyaWJ1dGUsIGFuZCBcImRpc2FibGVkXCIuXG4gICAgICovXG4gICAgSU5QVVQ6IGZ1bmN0aW9uKGZyb21FbCwgdG9FbCkge1xuICAgICAgICBzeW5jQm9vbGVhbkF0dHJQcm9wKGZyb21FbCwgdG9FbCwgJ2NoZWNrZWQnKTtcbiAgICAgICAgc3luY0Jvb2xlYW5BdHRyUHJvcChmcm9tRWwsIHRvRWwsICdkaXNhYmxlZCcpO1xuXG4gICAgICAgIGlmIChmcm9tRWwudmFsdWUgIT09IHRvRWwudmFsdWUpIHtcbiAgICAgICAgICAgIGZyb21FbC52YWx1ZSA9IHRvRWwudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWhhc0F0dHJpYnV0ZU5TKHRvRWwsIG51bGwsICd2YWx1ZScpKSB7XG4gICAgICAgICAgICBmcm9tRWwucmVtb3ZlQXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIFRFWFRBUkVBOiBmdW5jdGlvbihmcm9tRWwsIHRvRWwpIHtcbiAgICAgICAgdmFyIG5ld1ZhbHVlID0gdG9FbC52YWx1ZTtcbiAgICAgICAgaWYgKGZyb21FbC52YWx1ZSAhPT0gbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIGZyb21FbC52YWx1ZSA9IG5ld1ZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGZpcnN0Q2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICAgICAgaWYgKGZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgIC8vIE5lZWRlZCBmb3IgSUUuIEFwcGFyZW50bHkgSUUgc2V0cyB0aGUgcGxhY2Vob2xkZXIgYXMgdGhlXG4gICAgICAgICAgICAvLyBub2RlIHZhbHVlIGFuZCB2aXNlIHZlcnNhLiBUaGlzIGlnbm9yZXMgYW4gZW1wdHkgdXBkYXRlLlxuICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gZmlyc3RDaGlsZC5ub2RlVmFsdWU7XG5cbiAgICAgICAgICAgIGlmIChvbGRWYWx1ZSA9PSBuZXdWYWx1ZSB8fCAoIW5ld1ZhbHVlICYmIG9sZFZhbHVlID09IGZyb21FbC5wbGFjZWhvbGRlcikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpcnN0Q2hpbGQubm9kZVZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFNFTEVDVDogZnVuY3Rpb24oZnJvbUVsLCB0b0VsKSB7XG4gICAgICAgIGlmICghaGFzQXR0cmlidXRlTlModG9FbCwgbnVsbCwgJ211bHRpcGxlJykpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICB2YXIgY3VyQ2hpbGQgPSB0b0VsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICB3aGlsZShjdXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIHZhciBub2RlTmFtZSA9IGN1ckNoaWxkLm5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIGlmIChub2RlTmFtZSAmJiBub2RlTmFtZS50b1VwcGVyQ2FzZSgpID09PSAnT1BUSU9OJykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQXR0cmlidXRlTlMoY3VyQ2hpbGQsIG51bGwsICdzZWxlY3RlZCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RlZEluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnJvbUVsLnNlbGVjdGVkSW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxudmFyIEVMRU1FTlRfTk9ERSA9IDE7XG52YXIgVEVYVF9OT0RFID0gMztcbnZhciBDT01NRU5UX05PREUgPSA4O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuZnVuY3Rpb24gZGVmYXVsdEdldE5vZGVLZXkobm9kZSkge1xuICAgIHJldHVybiBub2RlLmlkO1xufVxuXG5mdW5jdGlvbiBtb3JwaGRvbUZhY3RvcnkobW9ycGhBdHRycykge1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG1vcnBoZG9tKGZyb21Ob2RlLCB0b05vZGUsIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgICAgICBvcHRpb25zID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIHRvTm9kZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGlmIChmcm9tTm9kZS5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudCcgfHwgZnJvbU5vZGUubm9kZU5hbWUgPT09ICdIVE1MJykge1xuICAgICAgICAgICAgICAgIHZhciB0b05vZGVIdG1sID0gdG9Ob2RlO1xuICAgICAgICAgICAgICAgIHRvTm9kZSA9IGRvYy5jcmVhdGVFbGVtZW50KCdodG1sJyk7XG4gICAgICAgICAgICAgICAgdG9Ob2RlLmlubmVySFRNTCA9IHRvTm9kZUh0bWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRvTm9kZSA9IHRvRWxlbWVudCh0b05vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdldE5vZGVLZXkgPSBvcHRpb25zLmdldE5vZGVLZXkgfHwgZGVmYXVsdEdldE5vZGVLZXk7XG4gICAgICAgIHZhciBvbkJlZm9yZU5vZGVBZGRlZCA9IG9wdGlvbnMub25CZWZvcmVOb2RlQWRkZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uTm9kZUFkZGVkID0gb3B0aW9ucy5vbk5vZGVBZGRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25CZWZvcmVFbFVwZGF0ZWQgPSBvcHRpb25zLm9uQmVmb3JlRWxVcGRhdGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbkVsVXBkYXRlZCA9IG9wdGlvbnMub25FbFVwZGF0ZWQgfHwgbm9vcDtcbiAgICAgICAgdmFyIG9uQmVmb3JlTm9kZURpc2NhcmRlZCA9IG9wdGlvbnMub25CZWZvcmVOb2RlRGlzY2FyZGVkIHx8IG5vb3A7XG4gICAgICAgIHZhciBvbk5vZGVEaXNjYXJkZWQgPSBvcHRpb25zLm9uTm9kZURpc2NhcmRlZCB8fCBub29wO1xuICAgICAgICB2YXIgb25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCA9IG9wdGlvbnMub25CZWZvcmVFbENoaWxkcmVuVXBkYXRlZCB8fCBub29wO1xuICAgICAgICB2YXIgY2hpbGRyZW5Pbmx5ID0gb3B0aW9ucy5jaGlsZHJlbk9ubHkgPT09IHRydWU7XG5cbiAgICAgICAgLy8gVGhpcyBvYmplY3QgaXMgdXNlZCBhcyBhIGxvb2t1cCB0byBxdWlja2x5IGZpbmQgYWxsIGtleWVkIGVsZW1lbnRzIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS5cbiAgICAgICAgdmFyIGZyb21Ob2Rlc0xvb2t1cCA9IHt9O1xuICAgICAgICB2YXIga2V5ZWRSZW1vdmFsTGlzdDtcblxuICAgICAgICBmdW5jdGlvbiBhZGRLZXllZFJlbW92YWwoa2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5ZWRSZW1vdmFsTGlzdCkge1xuICAgICAgICAgICAgICAgIGtleWVkUmVtb3ZhbExpc3QucHVzaChrZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBrZXllZFJlbW92YWxMaXN0ID0gW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiB3YWxrRGlzY2FyZGVkQ2hpbGROb2Rlcyhub2RlLCBza2lwS2V5ZWROb2Rlcykge1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcblxuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChza2lwS2V5ZWROb2RlcyAmJiAoa2V5ID0gZ2V0Tm9kZUtleShjdXJDaGlsZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB3ZSBhcmUgc2tpcHBpbmcga2V5ZWQgbm9kZXMgdGhlbiB3ZSBhZGQgdGhlIGtleVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdG8gYSBsaXN0IHNvIHRoYXQgaXQgY2FuIGJlIGhhbmRsZWQgYXQgdGhlIHZlcnkgZW5kLlxuICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmx5IHJlcG9ydCB0aGUgbm9kZSBhcyBkaXNjYXJkZWQgaWYgaXQgaXMgbm90IGtleWVkLiBXZSBkbyB0aGlzIGJlY2F1c2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGF0IHRoZSBlbmQgd2UgbG9vcCB0aHJvdWdoIGFsbCBrZXllZCBlbGVtZW50cyB0aGF0IHdlcmUgdW5tYXRjaGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhbmQgdGhlbiBkaXNjYXJkIHRoZW0gaW4gb25lIGZpbmFsIHBhc3MuXG4gICAgICAgICAgICAgICAgICAgICAgICBvbk5vZGVEaXNjYXJkZWQoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckNoaWxkLmZpcnN0Q2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3YWxrRGlzY2FyZGVkQ2hpbGROb2RlcyhjdXJDaGlsZCwgc2tpcEtleWVkTm9kZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBjdXJDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlcyBhIERPTSBub2RlIG91dCBvZiB0aGUgb3JpZ2luYWwgRE9NXG4gICAgICAgICAqXG4gICAgICAgICAqIEBwYXJhbSAge05vZGV9IG5vZGUgVGhlIG5vZGUgdG8gcmVtb3ZlXG4gICAgICAgICAqIEBwYXJhbSAge05vZGV9IHBhcmVudE5vZGUgVGhlIG5vZGVzIHBhcmVudFxuICAgICAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBza2lwS2V5ZWROb2RlcyBJZiB0cnVlIHRoZW4gZWxlbWVudHMgd2l0aCBrZXlzIHdpbGwgYmUgc2tpcHBlZCBhbmQgbm90IGRpc2NhcmRlZC5cbiAgICAgICAgICogQHJldHVybiB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlTm9kZShub2RlLCBwYXJlbnROb2RlLCBza2lwS2V5ZWROb2Rlcykge1xuICAgICAgICAgICAgaWYgKG9uQmVmb3JlTm9kZURpc2NhcmRlZChub2RlKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnROb2RlKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKG5vZGUpO1xuICAgICAgICAgICAgd2Fsa0Rpc2NhcmRlZENoaWxkTm9kZXMobm9kZSwgc2tpcEtleWVkTm9kZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gLy8gVHJlZVdhbGtlciBpbXBsZW1lbnRhdGlvbiBpcyBubyBmYXN0ZXIsIGJ1dCBrZWVwaW5nIHRoaXMgYXJvdW5kIGluIGNhc2UgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy8gZnVuY3Rpb24gaW5kZXhUcmVlKHJvb3QpIHtcbiAgICAgICAgLy8gICAgIHZhciB0cmVlV2Fsa2VyID0gZG9jdW1lbnQuY3JlYXRlVHJlZVdhbGtlcihcbiAgICAgICAgLy8gICAgICAgICByb290LFxuICAgICAgICAvLyAgICAgICAgIE5vZGVGaWx0ZXIuU0hPV19FTEVNRU5UKTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgIHZhciBlbDtcbiAgICAgICAgLy8gICAgIHdoaWxlKChlbCA9IHRyZWVXYWxrZXIubmV4dE5vZGUoKSkpIHtcbiAgICAgICAgLy8gICAgICAgICB2YXIga2V5ID0gZ2V0Tm9kZUtleShlbCk7XG4gICAgICAgIC8vICAgICAgICAgaWYgKGtleSkge1xuICAgICAgICAvLyAgICAgICAgICAgICBmcm9tTm9kZXNMb29rdXBba2V5XSA9IGVsO1xuICAgICAgICAvLyAgICAgICAgIH1cbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIC8vIE5vZGVJdGVyYXRvciBpbXBsZW1lbnRhdGlvbiBpcyBubyBmYXN0ZXIsIGJ1dCBrZWVwaW5nIHRoaXMgYXJvdW5kIGluIGNhc2UgdGhpcyBjaGFuZ2VzIGluIHRoZSBmdXR1cmVcbiAgICAgICAgLy9cbiAgICAgICAgLy8gZnVuY3Rpb24gaW5kZXhUcmVlKG5vZGUpIHtcbiAgICAgICAgLy8gICAgIHZhciBub2RlSXRlcmF0b3IgPSBkb2N1bWVudC5jcmVhdGVOb2RlSXRlcmF0b3Iobm9kZSwgTm9kZUZpbHRlci5TSE9XX0VMRU1FTlQpO1xuICAgICAgICAvLyAgICAgdmFyIGVsO1xuICAgICAgICAvLyAgICAgd2hpbGUoKGVsID0gbm9kZUl0ZXJhdG9yLm5leHROb2RlKCkpKSB7XG4gICAgICAgIC8vICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoZWwpO1xuICAgICAgICAvLyAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgLy8gICAgICAgICAgICAgZnJvbU5vZGVzTG9va3VwW2tleV0gPSBlbDtcbiAgICAgICAgLy8gICAgICAgICB9XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH1cblxuICAgICAgICBmdW5jdGlvbiBpbmRleFRyZWUobm9kZSkge1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIHZhciBjdXJDaGlsZCA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY3VyQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tTm9kZXNMb29rdXBba2V5XSA9IGN1ckNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gV2FsayByZWN1cnNpdmVseVxuICAgICAgICAgICAgICAgICAgICBpbmRleFRyZWUoY3VyQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkID0gY3VyQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaW5kZXhUcmVlKGZyb21Ob2RlKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVOb2RlQWRkZWQoZWwpIHtcbiAgICAgICAgICAgIG9uTm9kZUFkZGVkKGVsKTtcblxuICAgICAgICAgICAgdmFyIGN1ckNoaWxkID0gZWwuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgIHdoaWxlIChjdXJDaGlsZCkge1xuICAgICAgICAgICAgICAgIHZhciBuZXh0U2libGluZyA9IGN1ckNoaWxkLm5leHRTaWJsaW5nO1xuXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGdldE5vZGVLZXkoY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHVubWF0Y2hlZEZyb21FbCA9IGZyb21Ob2Rlc0xvb2t1cFtrZXldO1xuICAgICAgICAgICAgICAgICAgICBpZiAodW5tYXRjaGVkRnJvbUVsICYmIGNvbXBhcmVOb2RlTmFtZXMoY3VyQ2hpbGQsIHVubWF0Y2hlZEZyb21FbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1ckNoaWxkLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKHVubWF0Y2hlZEZyb21FbCwgY3VyQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbCh1bm1hdGNoZWRGcm9tRWwsIGN1ckNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhhbmRsZU5vZGVBZGRlZChjdXJDaGlsZCk7XG4gICAgICAgICAgICAgICAgY3VyQ2hpbGQgPSBuZXh0U2libGluZztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG1vcnBoRWwoZnJvbUVsLCB0b0VsLCBjaGlsZHJlbk9ubHkpIHtcbiAgICAgICAgICAgIHZhciB0b0VsS2V5ID0gZ2V0Tm9kZUtleSh0b0VsKTtcbiAgICAgICAgICAgIHZhciBjdXJGcm9tTm9kZUtleTtcblxuICAgICAgICAgICAgaWYgKHRvRWxLZXkpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBhbiBlbGVtZW50IHdpdGggYW4gSUQgaXMgYmVpbmcgbW9ycGhlZCB0aGVuIGl0IGlzIHdpbGwgYmUgaW4gdGhlIGZpbmFsXG4gICAgICAgICAgICAgICAgLy8gRE9NIHNvIGNsZWFyIGl0IG91dCBvZiB0aGUgc2F2ZWQgZWxlbWVudHMgY29sbGVjdGlvblxuICAgICAgICAgICAgICAgIGRlbGV0ZSBmcm9tTm9kZXNMb29rdXBbdG9FbEtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0b05vZGUuaXNTYW1lTm9kZSAmJiB0b05vZGUuaXNTYW1lTm9kZShmcm9tTm9kZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghY2hpbGRyZW5Pbmx5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG9uQmVmb3JlRWxVcGRhdGVkKGZyb21FbCwgdG9FbCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBtb3JwaEF0dHJzKGZyb21FbCwgdG9FbCk7XG4gICAgICAgICAgICAgICAgb25FbFVwZGF0ZWQoZnJvbUVsKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZUVsQ2hpbGRyZW5VcGRhdGVkKGZyb21FbCwgdG9FbCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChmcm9tRWwubm9kZU5hbWUgIT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgICAgICAgICB2YXIgY3VyVG9Ob2RlQ2hpbGQgPSB0b0VsLmZpcnN0Q2hpbGQ7XG4gICAgICAgICAgICAgICAgdmFyIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tRWwuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICB2YXIgY3VyVG9Ob2RlS2V5O1xuXG4gICAgICAgICAgICAgICAgdmFyIGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB2YXIgdG9OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hpbmdGcm9tRWw7XG5cbiAgICAgICAgICAgICAgICBvdXRlcjogd2hpbGUgKGN1clRvTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRvTmV4dFNpYmxpbmcgPSBjdXJUb05vZGVDaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlS2V5ID0gZ2V0Tm9kZUtleShjdXJUb05vZGVDaGlsZCk7XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGN1ckZyb21Ob2RlQ2hpbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVDaGlsZC5pc1NhbWVOb2RlICYmIGN1clRvTm9kZUNoaWxkLmlzU2FtZU5vZGUoY3VyRnJvbU5vZGVDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJUb05vZGVDaGlsZCA9IHRvTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZSBvdXRlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVLZXkgPSBnZXROb2RlS2V5KGN1ckZyb21Ob2RlQ2hpbGQpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY3VyRnJvbU5vZGVUeXBlID0gY3VyRnJvbU5vZGVDaGlsZC5ub2RlVHlwZTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlzQ29tcGF0aWJsZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlVHlwZSA9PT0gY3VyVG9Ob2RlQ2hpbGQubm9kZVR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQm90aCBub2RlcyBiZWluZyBjb21wYXJlZCBhcmUgRWxlbWVudCBub2Rlc1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB0YXJnZXQgbm9kZSBoYXMgYSBrZXkgc28gd2Ugd2FudCB0byBtYXRjaCBpdCB1cCB3aXRoIHRoZSBjb3JyZWN0IGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1clRvTm9kZUtleSAhPT0gY3VyRnJvbU5vZGVLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY3VycmVudCBlbGVtZW50IGluIHRoZSBvcmlnaW5hbCBET00gdHJlZSBkb2VzIG5vdCBoYXZlIGEgbWF0Y2hpbmcga2V5IHNvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbGV0J3MgY2hlY2sgb3VyIGxvb2t1cCB0byBzZWUgaWYgdGhlcmUgaXMgYSBtYXRjaGluZyBlbGVtZW50IGluIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIERPTSB0cmVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChtYXRjaGluZ0Zyb21FbCA9IGZyb21Ob2Rlc0xvb2t1cFtjdXJUb05vZGVLZXldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVDaGlsZC5uZXh0U2libGluZyA9PT0gbWF0Y2hpbmdGcm9tRWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNwZWNpYWwgY2FzZSBmb3Igc2luZ2xlIGVsZW1lbnQgcmVtb3ZhbHMuIFRvIGF2b2lkIHJlbW92aW5nIHRoZSBvcmlnaW5hbFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRE9NIG5vZGUgb3V0IG9mIHRoZSB0cmVlIChzaW5jZSB0aGF0IGNhbiBicmVhayBDU1MgdHJhbnNpdGlvbnMsIGV0Yy4pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2Ugd2lsbCBpbnN0ZWFkIGRpc2NhcmQgdGhlIGN1cnJlbnQgbm9kZSBhbmQgd2FpdCB1bnRpbCB0aGUgbmV4dFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXRlcmF0aW9uIHRvIHByb3Blcmx5IG1hdGNoIHVwIHRoZSBrZXllZCB0YXJnZXQgZWxlbWVudCB3aXRoIGl0cyBtYXRjaGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZWxlbWVudCBpbiB0aGUgb3JpZ2luYWwgdHJlZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBmb3VuZCBhIG1hdGNoaW5nIGtleWVkIGVsZW1lbnQgc29tZXdoZXJlIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIExldCdzIG1vdmluZyB0aGUgb3JpZ2luYWwgRE9NIG5vZGUgaW50byB0aGUgY3VycmVudCBwb3NpdGlvbiBhbmQgbW9ycGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0LlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBOT1RFOiBXZSB1c2UgaW5zZXJ0QmVmb3JlIGluc3RlYWQgb2YgcmVwbGFjZUNoaWxkIGJlY2F1c2Ugd2Ugd2FudCB0byBnbyB0aHJvdWdoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgYHJlbW92ZU5vZGUoKWAgZnVuY3Rpb24gZm9yIHRoZSBub2RlIHRoYXQgaXMgYmVpbmcgZGlzY2FyZGVkIHNvIHRoYXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFsbCBsaWZlY3ljbGUgaG9va3MgYXJlIGNvcnJlY3RseSBpbnZva2VkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tRWwuaW5zZXJ0QmVmb3JlKG1hdGNoaW5nRnJvbUVsLCBjdXJGcm9tTm9kZUNoaWxkKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbU5leHRTaWJsaW5nID0gY3VyRnJvbU5vZGVDaGlsZC5uZXh0U2libGluZztcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBhY3R1YWwgcmVtb3ZhbCB0byBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFkZEtleWVkUmVtb3ZhbChjdXJGcm9tTm9kZUtleSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IHdlIHNraXAgbmVzdGVkIGtleWVkIG5vZGVzIGZyb20gYmVpbmcgcmVtb3ZlZCBzaW5jZSB0aGVyZSBpc1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgIHN0aWxsIGEgY2hhbmNlIHRoZXkgd2lsbCBiZSBtYXRjaGVkIHVwIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBtYXRjaGluZ0Zyb21FbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBub2RlcyBhcmUgbm90IGNvbXBhdGlibGUgc2luY2UgdGhlIFwidG9cIiBub2RlIGhhcyBhIGtleSBhbmQgdGhlcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaXMgbm8gbWF0Y2hpbmcga2V5ZWQgbm9kZSBpbiB0aGUgc291cmNlIHRyZWVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGN1ckZyb21Ob2RlS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgb3JpZ2luYWwgaGFzIGEga2V5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpc0NvbXBhdGlibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzQ29tcGF0aWJsZSA9IGlzQ29tcGF0aWJsZSAhPT0gZmFsc2UgJiYgY29tcGFyZU5vZGVOYW1lcyhjdXJGcm9tTm9kZUNoaWxkLCBjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0NvbXBhdGlibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFdlIGZvdW5kIGNvbXBhdGlibGUgRE9NIGVsZW1lbnRzIHNvIHRyYW5zZm9ybVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGN1cnJlbnQgXCJmcm9tXCIgbm9kZSB0byBtYXRjaCB0aGUgY3VycmVudFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGFyZ2V0IERPTSBub2RlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbChjdXJGcm9tTm9kZUNoaWxkLCBjdXJUb05vZGVDaGlsZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY3VyRnJvbU5vZGVUeXBlID09PSBURVhUX05PREUgfHwgY3VyRnJvbU5vZGVUeXBlID09IENPTU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBCb3RoIG5vZGVzIGJlaW5nIGNvbXBhcmVkIGFyZSBUZXh0IG9yIENvbW1lbnQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNDb21wYXRpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2ltcGx5IHVwZGF0ZSBub2RlVmFsdWUgb24gdGhlIG9yaWdpbmFsIG5vZGUgdG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2hhbmdlIHRoZSB0ZXh0IHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJGcm9tTm9kZUNoaWxkLm5vZGVWYWx1ZSAhPT0gY3VyVG9Ob2RlQ2hpbGQubm9kZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkLm5vZGVWYWx1ZSA9IGN1clRvTm9kZUNoaWxkLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNDb21wYXRpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWR2YW5jZSBib3RoIHRoZSBcInRvXCIgY2hpbGQgYW5kIHRoZSBcImZyb21cIiBjaGlsZCBzaW5jZSB3ZSBmb3VuZCBhIG1hdGNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSB0b05leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1ckZyb21Ob2RlQ2hpbGQgPSBmcm9tTmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWUgb3V0ZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5vIGNvbXBhdGlibGUgbWF0Y2ggc28gcmVtb3ZlIHRoZSBvbGQgbm9kZSBmcm9tIHRoZSBET00gYW5kIGNvbnRpbnVlIHRyeWluZyB0byBmaW5kIGFcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG1hdGNoIGluIHRoZSBvcmlnaW5hbCBET00uIEhvd2V2ZXIsIHdlIG9ubHkgZG8gdGhpcyBpZiB0aGUgZnJvbSBub2RlIGlzIG5vdCBrZXllZFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc2luY2UgaXQgaXMgcG9zc2libGUgdGhhdCBhIGtleWVkIG5vZGUgbWlnaHQgbWF0Y2ggdXAgd2l0aCBhIG5vZGUgc29tZXdoZXJlIGVsc2UgaW4gdGhlXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0YXJnZXQgdHJlZSBhbmQgd2UgZG9uJ3Qgd2FudCB0byBkaXNjYXJkIGl0IGp1c3QgeWV0IHNpbmNlIGl0IHN0aWxsIG1pZ2h0IGZpbmQgYVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaG9tZSBpbiB0aGUgZmluYWwgRE9NIHRyZWUuIEFmdGVyIGV2ZXJ5dGhpbmcgaXMgZG9uZSB3ZSB3aWxsIHJlbW92ZSBhbnkga2V5ZWQgbm9kZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoYXQgZGlkbid0IGZpbmQgYSBob21lXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3VyRnJvbU5vZGVLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTaW5jZSB0aGUgbm9kZSBpcyBrZXllZCBpdCBtaWdodCBiZSBtYXRjaGVkIHVwIGxhdGVyIHNvIHdlIGRlZmVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGFjdHVhbCByZW1vdmFsIHRvIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkS2V5ZWRSZW1vdmFsKGN1ckZyb21Ob2RlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogd2Ugc2tpcCBuZXN0ZWQga2V5ZWQgbm9kZXMgZnJvbSBiZWluZyByZW1vdmVkIHNpbmNlIHRoZXJlIGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgc3RpbGwgYSBjaGFuY2UgdGhleSB3aWxsIGJlIG1hdGNoZWQgdXAgbGF0ZXJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVOb2RlKGN1ckZyb21Ob2RlQ2hpbGQsIGZyb21FbCwgdHJ1ZSAvKiBza2lwIGtleWVkIG5vZGVzICovKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHdlIGdvdCB0aGlzIGZhciB0aGVuIHdlIGRpZCBub3QgZmluZCBhIGNhbmRpZGF0ZSBtYXRjaCBmb3JcbiAgICAgICAgICAgICAgICAgICAgLy8gb3VyIFwidG8gbm9kZVwiIGFuZCB3ZSBleGhhdXN0ZWQgYWxsIG9mIHRoZSBjaGlsZHJlbiBcImZyb21cIlxuICAgICAgICAgICAgICAgICAgICAvLyBub2Rlcy4gVGhlcmVmb3JlLCB3ZSB3aWxsIGp1c3QgYXBwZW5kIHRoZSBjdXJyZW50IFwidG9cIiBub2RlXG4gICAgICAgICAgICAgICAgICAgIC8vIHRvIHRoZSBlbmRcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN1clRvTm9kZUtleSAmJiAobWF0Y2hpbmdGcm9tRWwgPSBmcm9tTm9kZXNMb29rdXBbY3VyVG9Ob2RlS2V5XSkgJiYgY29tcGFyZU5vZGVOYW1lcyhtYXRjaGluZ0Zyb21FbCwgY3VyVG9Ob2RlQ2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tRWwuYXBwZW5kQ2hpbGQobWF0Y2hpbmdGcm9tRWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhFbChtYXRjaGluZ0Zyb21FbCwgY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9uQmVmb3JlTm9kZUFkZGVkUmVzdWx0ID0gb25CZWZvcmVOb2RlQWRkZWQoY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9uQmVmb3JlTm9kZUFkZGVkUmVzdWx0ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvbkJlZm9yZU5vZGVBZGRlZFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJUb05vZGVDaGlsZCA9IG9uQmVmb3JlTm9kZUFkZGVkUmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJUb05vZGVDaGlsZC5hY3R1YWxpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSBjdXJUb05vZGVDaGlsZC5hY3R1YWxpemUoZnJvbUVsLm93bmVyRG9jdW1lbnQgfHwgZG9jKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbUVsLmFwcGVuZENoaWxkKGN1clRvTm9kZUNoaWxkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYW5kbGVOb2RlQWRkZWQoY3VyVG9Ob2RlQ2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgY3VyVG9Ob2RlQ2hpbGQgPSB0b05leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgICAgICBjdXJGcm9tTm9kZUNoaWxkID0gZnJvbU5leHRTaWJsaW5nO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIFdlIGhhdmUgcHJvY2Vzc2VkIGFsbCBvZiB0aGUgXCJ0byBub2Rlc1wiLiBJZiBjdXJGcm9tTm9kZUNoaWxkIGlzXG4gICAgICAgICAgICAgICAgLy8gbm9uLW51bGwgdGhlbiB3ZSBzdGlsbCBoYXZlIHNvbWUgZnJvbSBub2RlcyBsZWZ0IG92ZXIgdGhhdCBuZWVkXG4gICAgICAgICAgICAgICAgLy8gdG8gYmUgcmVtb3ZlZFxuICAgICAgICAgICAgICAgIHdoaWxlIChjdXJGcm9tTm9kZUNoaWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIGZyb21OZXh0U2libGluZyA9IGN1ckZyb21Ob2RlQ2hpbGQubmV4dFNpYmxpbmc7XG4gICAgICAgICAgICAgICAgICAgIGlmICgoY3VyRnJvbU5vZGVLZXkgPSBnZXROb2RlS2V5KGN1ckZyb21Ob2RlQ2hpbGQpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2luY2UgdGhlIG5vZGUgaXMga2V5ZWQgaXQgbWlnaHQgYmUgbWF0Y2hlZCB1cCBsYXRlciBzbyB3ZSBkZWZlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGFjdHVhbCByZW1vdmFsIHRvIGxhdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICBhZGRLZXllZFJlbW92YWwoY3VyRnJvbU5vZGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gTk9URTogd2Ugc2tpcCBuZXN0ZWQga2V5ZWQgbm9kZXMgZnJvbSBiZWluZyByZW1vdmVkIHNpbmNlIHRoZXJlIGlzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICBzdGlsbCBhIGNoYW5jZSB0aGV5IHdpbGwgYmUgbWF0Y2hlZCB1cCBsYXRlclxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTm9kZShjdXJGcm9tTm9kZUNoaWxkLCBmcm9tRWwsIHRydWUgLyogc2tpcCBrZXllZCBub2RlcyAqLyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY3VyRnJvbU5vZGVDaGlsZCA9IGZyb21OZXh0U2libGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBzcGVjaWFsRWxIYW5kbGVyID0gc3BlY2lhbEVsSGFuZGxlcnNbZnJvbUVsLm5vZGVOYW1lXTtcbiAgICAgICAgICAgIGlmIChzcGVjaWFsRWxIYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgc3BlY2lhbEVsSGFuZGxlcihmcm9tRWwsIHRvRWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IC8vIEVORDogbW9ycGhFbCguLi4pXG5cbiAgICAgICAgdmFyIG1vcnBoZWROb2RlID0gZnJvbU5vZGU7XG4gICAgICAgIHZhciBtb3JwaGVkTm9kZVR5cGUgPSBtb3JwaGVkTm9kZS5ub2RlVHlwZTtcbiAgICAgICAgdmFyIHRvTm9kZVR5cGUgPSB0b05vZGUubm9kZVR5cGU7XG5cbiAgICAgICAgaWYgKCFjaGlsZHJlbk9ubHkpIHtcbiAgICAgICAgICAgIC8vIEhhbmRsZSB0aGUgY2FzZSB3aGVyZSB3ZSBhcmUgZ2l2ZW4gdHdvIERPTSBub2RlcyB0aGF0IGFyZSBub3RcbiAgICAgICAgICAgIC8vIGNvbXBhdGlibGUgKGUuZy4gPGRpdj4gLS0+IDxzcGFuPiBvciA8ZGl2PiAtLT4gVEVYVClcbiAgICAgICAgICAgIGlmIChtb3JwaGVkTm9kZVR5cGUgPT09IEVMRU1FTlRfTk9ERSkge1xuICAgICAgICAgICAgICAgIGlmICh0b05vZGVUeXBlID09PSBFTEVNRU5UX05PREUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb21wYXJlTm9kZU5hbWVzKGZyb21Ob2RlLCB0b05vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbk5vZGVEaXNjYXJkZWQoZnJvbU5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbW9ycGhlZE5vZGUgPSBtb3ZlQ2hpbGRyZW4oZnJvbU5vZGUsIGNyZWF0ZUVsZW1lbnROUyh0b05vZGUubm9kZU5hbWUsIHRvTm9kZS5uYW1lc3BhY2VVUkkpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEdvaW5nIGZyb20gYW4gZWxlbWVudCBub2RlIHRvIGEgdGV4dCBub2RlXG4gICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gdG9Ob2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAobW9ycGhlZE5vZGVUeXBlID09PSBURVhUX05PREUgfHwgbW9ycGhlZE5vZGVUeXBlID09PSBDT01NRU5UX05PREUpIHsgLy8gVGV4dCBvciBjb21tZW50IG5vZGVcbiAgICAgICAgICAgICAgICBpZiAodG9Ob2RlVHlwZSA9PT0gbW9ycGhlZE5vZGVUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtb3JwaGVkTm9kZS5ub2RlVmFsdWUgIT09IHRvTm9kZS5ub2RlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlLm5vZGVWYWx1ZSA9IHRvTm9kZS5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGV4dCBub2RlIHRvIHNvbWV0aGluZyBlbHNlXG4gICAgICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gdG9Ob2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtb3JwaGVkTm9kZSA9PT0gdG9Ob2RlKSB7XG4gICAgICAgICAgICAvLyBUaGUgXCJ0byBub2RlXCIgd2FzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIFwiZnJvbSBub2RlXCIgc28gd2UgaGFkIHRvXG4gICAgICAgICAgICAvLyB0b3NzIG91dCB0aGUgXCJmcm9tIG5vZGVcIiBhbmQgdXNlIHRoZSBcInRvIG5vZGVcIlxuICAgICAgICAgICAgb25Ob2RlRGlzY2FyZGVkKGZyb21Ob2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1vcnBoRWwobW9ycGhlZE5vZGUsIHRvTm9kZSwgY2hpbGRyZW5Pbmx5KTtcblxuICAgICAgICAgICAgLy8gV2Ugbm93IG5lZWQgdG8gbG9vcCBvdmVyIGFueSBrZXllZCBub2RlcyB0aGF0IG1pZ2h0IG5lZWQgdG8gYmVcbiAgICAgICAgICAgIC8vIHJlbW92ZWQuIFdlIG9ubHkgZG8gdGhlIHJlbW92YWwgaWYgd2Uga25vdyB0aGF0IHRoZSBrZXllZCBub2RlXG4gICAgICAgICAgICAvLyBuZXZlciBmb3VuZCBhIG1hdGNoLiBXaGVuIGEga2V5ZWQgbm9kZSBpcyBtYXRjaGVkIHVwIHdlIHJlbW92ZVxuICAgICAgICAgICAgLy8gaXQgb3V0IG9mIGZyb21Ob2Rlc0xvb2t1cCBhbmQgd2UgdXNlIGZyb21Ob2Rlc0xvb2t1cCB0byBkZXRlcm1pbmVcbiAgICAgICAgICAgIC8vIGlmIGEga2V5ZWQgbm9kZSBoYXMgYmVlbiBtYXRjaGVkIHVwIG9yIG5vdFxuICAgICAgICAgICAgaWYgKGtleWVkUmVtb3ZhbExpc3QpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpPTAsIGxlbj1rZXllZFJlbW92YWxMaXN0Lmxlbmd0aDsgaTxsZW47IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWxUb1JlbW92ZSA9IGZyb21Ob2Rlc0xvb2t1cFtrZXllZFJlbW92YWxMaXN0W2ldXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsVG9SZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZU5vZGUoZWxUb1JlbW92ZSwgZWxUb1JlbW92ZS5wYXJlbnROb2RlLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWNoaWxkcmVuT25seSAmJiBtb3JwaGVkTm9kZSAhPT0gZnJvbU5vZGUgJiYgZnJvbU5vZGUucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgaWYgKG1vcnBoZWROb2RlLmFjdHVhbGl6ZSkge1xuICAgICAgICAgICAgICAgIG1vcnBoZWROb2RlID0gbW9ycGhlZE5vZGUuYWN0dWFsaXplKGZyb21Ob2RlLm93bmVyRG9jdW1lbnQgfHwgZG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIHdlIGhhZCB0byBzd2FwIG91dCB0aGUgZnJvbSBub2RlIHdpdGggYSBuZXcgbm9kZSBiZWNhdXNlIHRoZSBvbGRcbiAgICAgICAgICAgIC8vIG5vZGUgd2FzIG5vdCBjb21wYXRpYmxlIHdpdGggdGhlIHRhcmdldCBub2RlIHRoZW4gd2UgbmVlZCB0b1xuICAgICAgICAgICAgLy8gcmVwbGFjZSB0aGUgb2xkIERPTSBub2RlIGluIHRoZSBvcmlnaW5hbCBET00gdHJlZS4gVGhpcyBpcyBvbmx5XG4gICAgICAgICAgICAvLyBwb3NzaWJsZSBpZiB0aGUgb3JpZ2luYWwgRE9NIG5vZGUgd2FzIHBhcnQgb2YgYSBET00gdHJlZSB3aGljaFxuICAgICAgICAgICAgLy8gd2Uga25vdyBpcyB0aGUgY2FzZSBpZiBpdCBoYXMgYSBwYXJlbnQgbm9kZS5cbiAgICAgICAgICAgIGZyb21Ob2RlLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG1vcnBoZWROb2RlLCBmcm9tTm9kZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbW9ycGhlZE5vZGU7XG4gICAgfTtcbn1cblxudmFyIG1vcnBoZG9tID0gbW9ycGhkb21GYWN0b3J5KG1vcnBoQXR0cnMpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1vcnBoZG9tO1xuIiwiLyogZ2xvYmFsIE11dGF0aW9uT2JzZXJ2ZXIgKi9cbnZhciBkb2N1bWVudCA9IHJlcXVpcmUoJ2dsb2JhbC9kb2N1bWVudCcpXG52YXIgd2luZG93ID0gcmVxdWlyZSgnZ2xvYmFsL3dpbmRvdycpXG52YXIgd2F0Y2ggPSBPYmplY3QuY3JlYXRlKG51bGwpXG52YXIgS0VZX0lEID0gJ29ubG9hZGlkJyArIChuZXcgRGF0ZSgpICUgOWU2KS50b1N0cmluZygzNilcbnZhciBLRVlfQVRUUiA9ICdkYXRhLScgKyBLRVlfSURcbnZhciBJTkRFWCA9IDBcblxuaWYgKHdpbmRvdyAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcikge1xuICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAobXV0YXRpb25zKSB7XG4gICAgaWYgKE9iamVjdC5rZXlzKHdhdGNoKS5sZW5ndGggPCAxKSByZXR1cm5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG11dGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKG11dGF0aW9uc1tpXS5hdHRyaWJ1dGVOYW1lID09PSBLRVlfQVRUUikge1xuICAgICAgICBlYWNoQXR0cihtdXRhdGlvbnNbaV0sIHR1cm5vbiwgdHVybm9mZilcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGVhY2hNdXRhdGlvbihtdXRhdGlvbnNbaV0ucmVtb3ZlZE5vZGVzLCB0dXJub2ZmKVxuICAgICAgZWFjaE11dGF0aW9uKG11dGF0aW9uc1tpXS5hZGRlZE5vZGVzLCB0dXJub24pXG4gICAgfVxuICB9KVxuICBvYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHtcbiAgICBjaGlsZExpc3Q6IHRydWUsXG4gICAgc3VidHJlZTogdHJ1ZSxcbiAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiB0cnVlLFxuICAgIGF0dHJpYnV0ZUZpbHRlcjogW0tFWV9BVFRSXVxuICB9KVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG9ubG9hZCAoZWwsIG9uLCBvZmYsIGNhbGxlcikge1xuICBvbiA9IG9uIHx8IGZ1bmN0aW9uICgpIHt9XG4gIG9mZiA9IG9mZiB8fCBmdW5jdGlvbiAoKSB7fVxuICBlbC5zZXRBdHRyaWJ1dGUoS0VZX0FUVFIsICdvJyArIElOREVYKVxuICB3YXRjaFsnbycgKyBJTkRFWF0gPSBbb24sIG9mZiwgMCwgY2FsbGVyIHx8IG9ubG9hZC5jYWxsZXJdXG4gIElOREVYICs9IDFcbiAgcmV0dXJuIGVsXG59XG5cbmZ1bmN0aW9uIHR1cm5vbiAoaW5kZXgsIGVsKSB7XG4gIGlmICh3YXRjaFtpbmRleF1bMF0gJiYgd2F0Y2hbaW5kZXhdWzJdID09PSAwKSB7XG4gICAgd2F0Y2hbaW5kZXhdWzBdKGVsKVxuICAgIHdhdGNoW2luZGV4XVsyXSA9IDFcbiAgfVxufVxuXG5mdW5jdGlvbiB0dXJub2ZmIChpbmRleCwgZWwpIHtcbiAgaWYgKHdhdGNoW2luZGV4XVsxXSAmJiB3YXRjaFtpbmRleF1bMl0gPT09IDEpIHtcbiAgICB3YXRjaFtpbmRleF1bMV0oZWwpXG4gICAgd2F0Y2hbaW5kZXhdWzJdID0gMFxuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2hBdHRyIChtdXRhdGlvbiwgb24sIG9mZikge1xuICB2YXIgbmV3VmFsdWUgPSBtdXRhdGlvbi50YXJnZXQuZ2V0QXR0cmlidXRlKEtFWV9BVFRSKVxuICBpZiAoc2FtZU9yaWdpbihtdXRhdGlvbi5vbGRWYWx1ZSwgbmV3VmFsdWUpKSB7XG4gICAgd2F0Y2hbbmV3VmFsdWVdID0gd2F0Y2hbbXV0YXRpb24ub2xkVmFsdWVdXG4gICAgcmV0dXJuXG4gIH1cbiAgaWYgKHdhdGNoW211dGF0aW9uLm9sZFZhbHVlXSkge1xuICAgIG9mZihtdXRhdGlvbi5vbGRWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG4gIGlmICh3YXRjaFtuZXdWYWx1ZV0pIHtcbiAgICBvbihuZXdWYWx1ZSwgbXV0YXRpb24udGFyZ2V0KVxuICB9XG59XG5cbmZ1bmN0aW9uIHNhbWVPcmlnaW4gKG9sZFZhbHVlLCBuZXdWYWx1ZSkge1xuICBpZiAoIW9sZFZhbHVlIHx8ICFuZXdWYWx1ZSkgcmV0dXJuIGZhbHNlXG4gIHJldHVybiB3YXRjaFtvbGRWYWx1ZV1bM10gPT09IHdhdGNoW25ld1ZhbHVlXVszXVxufVxuXG5mdW5jdGlvbiBlYWNoTXV0YXRpb24gKG5vZGVzLCBmbikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHdhdGNoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKG5vZGVzW2ldICYmIG5vZGVzW2ldLmdldEF0dHJpYnV0ZSAmJiBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpKSB7XG4gICAgICB2YXIgb25sb2FkaWQgPSBub2Rlc1tpXS5nZXRBdHRyaWJ1dGUoS0VZX0FUVFIpXG4gICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgaWYgKG9ubG9hZGlkID09PSBrKSB7XG4gICAgICAgICAgZm4oaywgbm9kZXNbaV0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChub2Rlc1tpXS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIGVhY2hNdXRhdGlvbihub2Rlc1tpXS5jaGlsZE5vZGVzLCBmbilcbiAgICB9XG4gIH1cbn1cbiIsIiAgLyogZ2xvYmFscyByZXF1aXJlLCBtb2R1bGUgKi9cblxuICAndXNlIHN0cmljdCc7XG5cbiAgLyoqXG4gICAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gICAqL1xuXG4gIHZhciBwYXRodG9SZWdleHAgPSByZXF1aXJlKCdwYXRoLXRvLXJlZ2V4cCcpO1xuXG4gIC8qKlxuICAgKiBNb2R1bGUgZXhwb3J0cy5cbiAgICovXG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBwYWdlO1xuXG4gIC8qKlxuICAgKiBEZXRlY3QgY2xpY2sgZXZlbnRcbiAgICovXG4gIHZhciBjbGlja0V2ZW50ID0gKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgZG9jdW1lbnQpICYmIGRvY3VtZW50Lm9udG91Y2hzdGFydCA/ICd0b3VjaHN0YXJ0JyA6ICdjbGljayc7XG5cbiAgLyoqXG4gICAqIFRvIHdvcmsgcHJvcGVybHkgd2l0aCB0aGUgVVJMXG4gICAqIGhpc3RvcnkubG9jYXRpb24gZ2VuZXJhdGVkIHBvbHlmaWxsIGluIGh0dHBzOi8vZ2l0aHViLmNvbS9kZXZvdGUvSFRNTDUtSGlzdG9yeS1BUElcbiAgICovXG5cbiAgdmFyIGxvY2F0aW9uID0gKCd1bmRlZmluZWQnICE9PSB0eXBlb2Ygd2luZG93KSAmJiAod2luZG93Lmhpc3RvcnkubG9jYXRpb24gfHwgd2luZG93LmxvY2F0aW9uKTtcblxuICAvKipcbiAgICogUGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoLlxuICAgKi9cblxuICB2YXIgZGlzcGF0Y2ggPSB0cnVlO1xuXG5cbiAgLyoqXG4gICAqIERlY29kZSBVUkwgY29tcG9uZW50cyAocXVlcnkgc3RyaW5nLCBwYXRobmFtZSwgaGFzaCkuXG4gICAqIEFjY29tbW9kYXRlcyBib3RoIHJlZ3VsYXIgcGVyY2VudCBlbmNvZGluZyBhbmQgeC13d3ctZm9ybS11cmxlbmNvZGVkIGZvcm1hdC5cbiAgICovXG4gIHZhciBkZWNvZGVVUkxDb21wb25lbnRzID0gdHJ1ZTtcblxuICAvKipcbiAgICogQmFzZSBwYXRoLlxuICAgKi9cblxuICB2YXIgYmFzZSA9ICcnO1xuXG4gIC8qKlxuICAgKiBSdW5uaW5nIGZsYWcuXG4gICAqL1xuXG4gIHZhciBydW5uaW5nO1xuXG4gIC8qKlxuICAgKiBIYXNoQmFuZyBvcHRpb25cbiAgICovXG5cbiAgdmFyIGhhc2hiYW5nID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFByZXZpb3VzIGNvbnRleHQsIGZvciBjYXB0dXJpbmdcbiAgICogcGFnZSBleGl0IGV2ZW50cy5cbiAgICovXG5cbiAgdmFyIHByZXZDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBSZWdpc3RlciBgcGF0aGAgd2l0aCBjYWxsYmFjayBgZm4oKWAsXG4gICAqIG9yIHJvdXRlIGBwYXRoYCwgb3IgcmVkaXJlY3Rpb24sXG4gICAqIG9yIGBwYWdlLnN0YXJ0KClgLlxuICAgKlxuICAgKiAgIHBhZ2UoZm4pO1xuICAgKiAgIHBhZ2UoJyonLCBmbik7XG4gICAqICAgcGFnZSgnL3VzZXIvOmlkJywgbG9hZCwgdXNlcik7XG4gICAqICAgcGFnZSgnL3VzZXIvJyArIHVzZXIuaWQsIHsgc29tZTogJ3RoaW5nJyB9KTtcbiAgICogICBwYWdlKCcvdXNlci8nICsgdXNlci5pZCk7XG4gICAqICAgcGFnZSgnL2Zyb20nLCAnL3RvJylcbiAgICogICBwYWdlKCk7XG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfCFGdW5jdGlvbnwhT2JqZWN0fSBwYXRoXG4gICAqIEBwYXJhbSB7RnVuY3Rpb249fSBmblxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBwYWdlKHBhdGgsIGZuKSB7XG4gICAgLy8gPGNhbGxiYWNrPlxuICAgIGlmICgnZnVuY3Rpb24nID09PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcmV0dXJuIHBhZ2UoJyonLCBwYXRoKTtcbiAgICB9XG5cbiAgICAvLyByb3V0ZSA8cGF0aD4gdG8gPGNhbGxiYWNrIC4uLj5cbiAgICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZuKSB7XG4gICAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUoLyoqIEB0eXBlIHtzdHJpbmd9ICovIChwYXRoKSk7XG4gICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICBwYWdlLmNhbGxiYWNrcy5wdXNoKHJvdXRlLm1pZGRsZXdhcmUoYXJndW1lbnRzW2ldKSk7XG4gICAgICB9XG4gICAgICAvLyBzaG93IDxwYXRoPiB3aXRoIFtzdGF0ZV1cbiAgICB9IGVsc2UgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgcGF0aCkge1xuICAgICAgcGFnZVsnc3RyaW5nJyA9PT0gdHlwZW9mIGZuID8gJ3JlZGlyZWN0JyA6ICdzaG93J10ocGF0aCwgZm4pO1xuICAgICAgLy8gc3RhcnQgW29wdGlvbnNdXG4gICAgfSBlbHNlIHtcbiAgICAgIHBhZ2Uuc3RhcnQocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENhbGxiYWNrIGZ1bmN0aW9ucy5cbiAgICovXG5cbiAgcGFnZS5jYWxsYmFja3MgPSBbXTtcbiAgcGFnZS5leGl0cyA9IFtdO1xuXG4gIC8qKlxuICAgKiBDdXJyZW50IHBhdGggYmVpbmcgcHJvY2Vzc2VkXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBwYWdlLmN1cnJlbnQgPSAnJztcblxuICAvKipcbiAgICogTnVtYmVyIG9mIHBhZ2VzIG5hdmlnYXRlZCB0by5cbiAgICogQHR5cGUge251bWJlcn1cbiAgICpcbiAgICogICAgIHBhZ2UubGVuID09IDA7XG4gICAqICAgICBwYWdlKCcvbG9naW4nKTtcbiAgICogICAgIHBhZ2UubGVuID09IDE7XG4gICAqL1xuXG4gIHBhZ2UubGVuID0gMDtcblxuICAvKipcbiAgICogR2V0IG9yIHNldCBiYXNlcGF0aCB0byBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFzZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICBpZiAoMCA9PT0gYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGJhc2U7XG4gICAgYmFzZSA9IHBhdGg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEJpbmQgd2l0aCB0aGUgZ2l2ZW4gYG9wdGlvbnNgLlxuICAgKlxuICAgKiBPcHRpb25zOlxuICAgKlxuICAgKiAgICAtIGBjbGlja2AgYmluZCB0byBjbGljayBldmVudHMgW3RydWVdXG4gICAqICAgIC0gYHBvcHN0YXRlYCBiaW5kIHRvIHBvcHN0YXRlIFt0cnVlXVxuICAgKiAgICAtIGBkaXNwYXRjaGAgcGVyZm9ybSBpbml0aWFsIGRpc3BhdGNoIFt0cnVlXVxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBwYWdlLnN0YXJ0ID0gZnVuY3Rpb24ob3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIGlmIChydW5uaW5nKSByZXR1cm47XG4gICAgcnVubmluZyA9IHRydWU7XG4gICAgaWYgKGZhbHNlID09PSBvcHRpb25zLmRpc3BhdGNoKSBkaXNwYXRjaCA9IGZhbHNlO1xuICAgIGlmIChmYWxzZSA9PT0gb3B0aW9ucy5kZWNvZGVVUkxDb21wb25lbnRzKSBkZWNvZGVVUkxDb21wb25lbnRzID0gZmFsc2U7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLnBvcHN0YXRlKSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gICAgaWYgKGZhbHNlICE9PSBvcHRpb25zLmNsaWNrKSB7XG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGNsaWNrRXZlbnQsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICB9XG4gICAgaWYgKHRydWUgPT09IG9wdGlvbnMuaGFzaGJhbmcpIGhhc2hiYW5nID0gdHJ1ZTtcbiAgICBpZiAoIWRpc3BhdGNoKSByZXR1cm47XG4gICAgdmFyIHVybCA9IChoYXNoYmFuZyAmJiB+bG9jYXRpb24uaGFzaC5pbmRleE9mKCcjIScpKSA/IGxvY2F0aW9uLmhhc2guc3Vic3RyKDIpICsgbG9jYXRpb24uc2VhcmNoIDogbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2ggKyBsb2NhdGlvbi5oYXNoO1xuICAgIHBhZ2UucmVwbGFjZSh1cmwsIG51bGwsIHRydWUsIGRpc3BhdGNoKTtcbiAgfTtcblxuICAvKipcbiAgICogVW5iaW5kIGNsaWNrIGFuZCBwb3BzdGF0ZSBldmVudCBoYW5kbGVycy5cbiAgICpcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFydW5uaW5nKSByZXR1cm47XG4gICAgcGFnZS5jdXJyZW50ID0gJyc7XG4gICAgcGFnZS5sZW4gPSAwO1xuICAgIHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGNsaWNrRXZlbnQsIG9uY2xpY2ssIGZhbHNlKTtcbiAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvbnBvcHN0YXRlLCBmYWxzZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNob3cgYHBhdGhgIHdpdGggb3B0aW9uYWwgYHN0YXRlYCBvYmplY3QuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gc3RhdGVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gZGlzcGF0Y2hcbiAgICogQHBhcmFtIHtib29sZWFuPX0gcHVzaFxuICAgKiBAcmV0dXJuIHshQ29udGV4dH1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgcGFnZS5zaG93ID0gZnVuY3Rpb24ocGF0aCwgc3RhdGUsIGRpc3BhdGNoLCBwdXNoKSB7XG4gICAgdmFyIGN0eCA9IG5ldyBDb250ZXh0KHBhdGgsIHN0YXRlKTtcbiAgICBwYWdlLmN1cnJlbnQgPSBjdHgucGF0aDtcbiAgICBpZiAoZmFsc2UgIT09IGRpc3BhdGNoKSBwYWdlLmRpc3BhdGNoKGN0eCk7XG4gICAgaWYgKGZhbHNlICE9PSBjdHguaGFuZGxlZCAmJiBmYWxzZSAhPT0gcHVzaCkgY3R4LnB1c2hTdGF0ZSgpO1xuICAgIHJldHVybiBjdHg7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdvZXMgYmFjayBpbiB0aGUgaGlzdG9yeVxuICAgKiBCYWNrIHNob3VsZCBhbHdheXMgbGV0IHRoZSBjdXJyZW50IHJvdXRlIHB1c2ggc3RhdGUgYW5kIHRoZW4gZ28gYmFjay5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGggLSBmYWxsYmFjayBwYXRoIHRvIGdvIGJhY2sgaWYgbm8gbW9yZSBoaXN0b3J5IGV4aXN0cywgaWYgdW5kZWZpbmVkIGRlZmF1bHRzIHRvIHBhZ2UuYmFzZVxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIHBhZ2UuYmFjayA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlKSB7XG4gICAgaWYgKHBhZ2UubGVuID4gMCkge1xuICAgICAgLy8gdGhpcyBtYXkgbmVlZCBtb3JlIHRlc3RpbmcgdG8gc2VlIGlmIGFsbCBicm93c2Vyc1xuICAgICAgLy8gd2FpdCBmb3IgdGhlIG5leHQgdGljayB0byBnbyBiYWNrIGluIGhpc3RvcnlcbiAgICAgIGhpc3RvcnkuYmFjaygpO1xuICAgICAgcGFnZS5sZW4tLTtcbiAgICB9IGVsc2UgaWYgKHBhdGgpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhwYXRoLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9ZWxzZXtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhiYXNlLCBzdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cblxuICAvKipcbiAgICogUmVnaXN0ZXIgcm91dGUgdG8gcmVkaXJlY3QgZnJvbSBvbmUgcGF0aCB0byBvdGhlclxuICAgKiBvciBqdXN0IHJlZGlyZWN0IHRvIGFub3RoZXIgcm91dGVcbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGZyb20gLSBpZiBwYXJhbSAndG8nIGlzIHVuZGVmaW5lZCByZWRpcmVjdHMgdG8gJ2Zyb20nXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gdG9cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG4gIHBhZ2UucmVkaXJlY3QgPSBmdW5jdGlvbihmcm9tLCB0bykge1xuICAgIC8vIERlZmluZSByb3V0ZSBmcm9tIGEgcGF0aCB0byBhbm90aGVyXG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZnJvbSAmJiAnc3RyaW5nJyA9PT0gdHlwZW9mIHRvKSB7XG4gICAgICBwYWdlKGZyb20sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBwYWdlLnJlcGxhY2UoLyoqIEB0eXBlIHshc3RyaW5nfSAqLyAodG8pKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBXYWl0IGZvciB0aGUgcHVzaCBzdGF0ZSBhbmQgcmVwbGFjZSBpdCB3aXRoIGFub3RoZXJcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBmcm9tICYmICd1bmRlZmluZWQnID09PSB0eXBlb2YgdG8pIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHBhZ2UucmVwbGFjZShmcm9tKTtcbiAgICAgIH0sIDApO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVwbGFjZSBgcGF0aGAgd2l0aCBvcHRpb25hbCBgc3RhdGVgIG9iamVjdC5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtPYmplY3Q9fSBzdGF0ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBpbml0XG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGRpc3BhdGNoXG4gICAqIEByZXR1cm4geyFDb250ZXh0fVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuXG4gIHBhZ2UucmVwbGFjZSA9IGZ1bmN0aW9uKHBhdGgsIHN0YXRlLCBpbml0LCBkaXNwYXRjaCkge1xuICAgIHZhciBjdHggPSBuZXcgQ29udGV4dChwYXRoLCBzdGF0ZSk7XG4gICAgcGFnZS5jdXJyZW50ID0gY3R4LnBhdGg7XG4gICAgY3R4LmluaXQgPSBpbml0O1xuICAgIGN0eC5zYXZlKCk7IC8vIHNhdmUgYmVmb3JlIGRpc3BhdGNoaW5nLCB3aGljaCBtYXkgcmVkaXJlY3RcbiAgICBpZiAoZmFsc2UgIT09IGRpc3BhdGNoKSBwYWdlLmRpc3BhdGNoKGN0eCk7XG4gICAgcmV0dXJuIGN0eDtcbiAgfTtcblxuICAvKipcbiAgICogRGlzcGF0Y2ggdGhlIGdpdmVuIGBjdHhgLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbnRleHR9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIHBhZ2UuZGlzcGF0Y2ggPSBmdW5jdGlvbihjdHgpIHtcbiAgICB2YXIgcHJldiA9IHByZXZDb250ZXh0LFxuICAgICAgaSA9IDAsXG4gICAgICBqID0gMDtcblxuICAgIHByZXZDb250ZXh0ID0gY3R4O1xuXG4gICAgZnVuY3Rpb24gbmV4dEV4aXQoKSB7XG4gICAgICB2YXIgZm4gPSBwYWdlLmV4aXRzW2orK107XG4gICAgICBpZiAoIWZuKSByZXR1cm4gbmV4dEVudGVyKCk7XG4gICAgICBmbihwcmV2LCBuZXh0RXhpdCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbmV4dEVudGVyKCkge1xuICAgICAgdmFyIGZuID0gcGFnZS5jYWxsYmFja3NbaSsrXTtcblxuICAgICAgaWYgKGN0eC5wYXRoICE9PSBwYWdlLmN1cnJlbnQpIHtcbiAgICAgICAgY3R4LmhhbmRsZWQgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKCFmbikgcmV0dXJuIHVuaGFuZGxlZChjdHgpO1xuICAgICAgZm4oY3R4LCBuZXh0RW50ZXIpO1xuICAgIH1cblxuICAgIGlmIChwcmV2KSB7XG4gICAgICBuZXh0RXhpdCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0RW50ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFVuaGFuZGxlZCBgY3R4YC4gV2hlbiBpdCdzIG5vdCB0aGUgaW5pdGlhbFxuICAgKiBwb3BzdGF0ZSB0aGVuIHJlZGlyZWN0LiBJZiB5b3Ugd2lzaCB0byBoYW5kbGVcbiAgICogNDA0cyBvbiB5b3VyIG93biB1c2UgYHBhZ2UoJyonLCBjYWxsYmFjaylgLlxuICAgKlxuICAgKiBAcGFyYW0ge0NvbnRleHR9IGN0eFxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIHVuaGFuZGxlZChjdHgpIHtcbiAgICBpZiAoY3R4LmhhbmRsZWQpIHJldHVybjtcbiAgICB2YXIgY3VycmVudDtcblxuICAgIGlmIChoYXNoYmFuZykge1xuICAgICAgY3VycmVudCA9IGJhc2UgKyBsb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMhJywgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjdXJyZW50ID0gbG9jYXRpb24ucGF0aG5hbWUgKyBsb2NhdGlvbi5zZWFyY2g7XG4gICAgfVxuXG4gICAgaWYgKGN1cnJlbnQgPT09IGN0eC5jYW5vbmljYWxQYXRoKSByZXR1cm47XG4gICAgcGFnZS5zdG9wKCk7XG4gICAgY3R4LmhhbmRsZWQgPSBmYWxzZTtcbiAgICBsb2NhdGlvbi5ocmVmID0gY3R4LmNhbm9uaWNhbFBhdGg7XG4gIH1cblxuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gZXhpdCByb3V0ZSBvbiBgcGF0aGAgd2l0aFxuICAgKiBjYWxsYmFjayBgZm4oKWAsIHdoaWNoIHdpbGwgYmUgY2FsbGVkXG4gICAqIG9uIHRoZSBwcmV2aW91cyBjb250ZXh0IHdoZW4gYSBuZXdcbiAgICogcGFnZSBpcyB2aXNpdGVkLlxuICAgKi9cbiAgcGFnZS5leGl0ID0gZnVuY3Rpb24ocGF0aCwgZm4pIHtcbiAgICBpZiAodHlwZW9mIHBhdGggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwYWdlLmV4aXQoJyonLCBwYXRoKTtcbiAgICB9XG5cbiAgICB2YXIgcm91dGUgPSBuZXcgUm91dGUocGF0aCk7XG4gICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyArK2kpIHtcbiAgICAgIHBhZ2UuZXhpdHMucHVzaChyb3V0ZS5taWRkbGV3YXJlKGFyZ3VtZW50c1tpXSkpO1xuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogUmVtb3ZlIFVSTCBlbmNvZGluZyBmcm9tIHRoZSBnaXZlbiBgc3RyYC5cbiAgICogQWNjb21tb2RhdGVzIHdoaXRlc3BhY2UgaW4gYm90aCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICogYW5kIHJlZ3VsYXIgcGVyY2VudC1lbmNvZGVkIGZvcm0uXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWwgLSBVUkwgY29tcG9uZW50IHRvIGRlY29kZVxuICAgKi9cbiAgZnVuY3Rpb24gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCh2YWwpIHtcbiAgICBpZiAodHlwZW9mIHZhbCAhPT0gJ3N0cmluZycpIHsgcmV0dXJuIHZhbDsgfVxuICAgIHJldHVybiBkZWNvZGVVUkxDb21wb25lbnRzID8gZGVjb2RlVVJJQ29tcG9uZW50KHZhbC5yZXBsYWNlKC9cXCsvZywgJyAnKSkgOiB2YWw7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBhIG5ldyBcInJlcXVlc3RcIiBgQ29udGV4dGBcbiAgICogd2l0aCB0aGUgZ2l2ZW4gYHBhdGhgIGFuZCBvcHRpb25hbCBpbml0aWFsIGBzdGF0ZWAuXG4gICAqXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdD19IHN0YXRlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIENvbnRleHQocGF0aCwgc3RhdGUpIHtcbiAgICBpZiAoJy8nID09PSBwYXRoWzBdICYmIDAgIT09IHBhdGguaW5kZXhPZihiYXNlKSkgcGF0aCA9IGJhc2UgKyAoaGFzaGJhbmcgPyAnIyEnIDogJycpICsgcGF0aDtcbiAgICB2YXIgaSA9IHBhdGguaW5kZXhPZignPycpO1xuXG4gICAgdGhpcy5jYW5vbmljYWxQYXRoID0gcGF0aDtcbiAgICB0aGlzLnBhdGggPSBwYXRoLnJlcGxhY2UoYmFzZSwgJycpIHx8ICcvJztcbiAgICBpZiAoaGFzaGJhbmcpIHRoaXMucGF0aCA9IHRoaXMucGF0aC5yZXBsYWNlKCcjIScsICcnKSB8fCAnLyc7XG5cbiAgICB0aGlzLnRpdGxlID0gZG9jdW1lbnQudGl0bGU7XG4gICAgdGhpcy5zdGF0ZSA9IHN0YXRlIHx8IHt9O1xuICAgIHRoaXMuc3RhdGUucGF0aCA9IHBhdGg7XG4gICAgdGhpcy5xdWVyeXN0cmluZyA9IH5pID8gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXRoLnNsaWNlKGkgKyAxKSkgOiAnJztcbiAgICB0aGlzLnBhdGhuYW1lID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudCh+aSA/IHBhdGguc2xpY2UoMCwgaSkgOiBwYXRoKTtcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xuXG4gICAgLy8gZnJhZ21lbnRcbiAgICB0aGlzLmhhc2ggPSAnJztcbiAgICBpZiAoIWhhc2hiYW5nKSB7XG4gICAgICBpZiAoIX50aGlzLnBhdGguaW5kZXhPZignIycpKSByZXR1cm47XG4gICAgICB2YXIgcGFydHMgPSB0aGlzLnBhdGguc3BsaXQoJyMnKTtcbiAgICAgIHRoaXMucGF0aCA9IHBhcnRzWzBdO1xuICAgICAgdGhpcy5oYXNoID0gZGVjb2RlVVJMRW5jb2RlZFVSSUNvbXBvbmVudChwYXJ0c1sxXSkgfHwgJyc7XG4gICAgICB0aGlzLnF1ZXJ5c3RyaW5nID0gdGhpcy5xdWVyeXN0cmluZy5zcGxpdCgnIycpWzBdO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgYENvbnRleHRgLlxuICAgKi9cblxuICBwYWdlLkNvbnRleHQgPSBDb250ZXh0O1xuXG4gIC8qKlxuICAgKiBQdXNoIHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgQ29udGV4dC5wcm90b3R5cGUucHVzaFN0YXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcGFnZS5sZW4rKztcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh0aGlzLnN0YXRlLCB0aGlzLnRpdGxlLCBoYXNoYmFuZyAmJiB0aGlzLnBhdGggIT09ICcvJyA/ICcjIScgKyB0aGlzLnBhdGggOiB0aGlzLmNhbm9uaWNhbFBhdGgpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTYXZlIHRoZSBjb250ZXh0IHN0YXRlLlxuICAgKlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBDb250ZXh0LnByb3RvdHlwZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUodGhpcy5zdGF0ZSwgdGhpcy50aXRsZSwgaGFzaGJhbmcgJiYgdGhpcy5wYXRoICE9PSAnLycgPyAnIyEnICsgdGhpcy5wYXRoIDogdGhpcy5jYW5vbmljYWxQYXRoKTtcbiAgfTtcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBgUm91dGVgIHdpdGggdGhlIGdpdmVuIEhUVFAgYHBhdGhgLFxuICAgKiBhbmQgYW4gYXJyYXkgb2YgYGNhbGxiYWNrc2AgYW5kIGBvcHRpb25zYC5cbiAgICpcbiAgICogT3B0aW9uczpcbiAgICpcbiAgICogICAtIGBzZW5zaXRpdmVgICAgIGVuYWJsZSBjYXNlLXNlbnNpdGl2ZSByb3V0ZXNcbiAgICogICAtIGBzdHJpY3RgICAgICAgIGVuYWJsZSBzdHJpY3QgbWF0Y2hpbmcgZm9yIHRyYWlsaW5nIHNsYXNoZXNcbiAgICpcbiAgICogQGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7T2JqZWN0PX0gb3B0aW9uc1xuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gUm91dGUocGF0aCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMucGF0aCA9IChwYXRoID09PSAnKicpID8gJyguKiknIDogcGF0aDtcbiAgICB0aGlzLm1ldGhvZCA9ICdHRVQnO1xuICAgIHRoaXMucmVnZXhwID0gcGF0aHRvUmVnZXhwKHRoaXMucGF0aCxcbiAgICAgIHRoaXMua2V5cyA9IFtdLFxuICAgICAgb3B0aW9ucyk7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIGBSb3V0ZWAuXG4gICAqL1xuXG4gIHBhZ2UuUm91dGUgPSBSb3V0ZTtcblxuICAvKipcbiAgICogUmV0dXJuIHJvdXRlIG1pZGRsZXdhcmUgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2FsbGJhY2sgYGZuKClgLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgUm91dGUucHJvdG90eXBlLm1pZGRsZXdhcmUgPSBmdW5jdGlvbihmbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gZnVuY3Rpb24oY3R4LCBuZXh0KSB7XG4gICAgICBpZiAoc2VsZi5tYXRjaChjdHgucGF0aCwgY3R4LnBhcmFtcykpIHJldHVybiBmbihjdHgsIG5leHQpO1xuICAgICAgbmV4dCgpO1xuICAgIH07XG4gIH07XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoaXMgcm91dGUgbWF0Y2hlcyBgcGF0aGAsIGlmIHNvXG4gICAqIHBvcHVsYXRlIGBwYXJhbXNgLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cblxuICBSb3V0ZS5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihwYXRoLCBwYXJhbXMpIHtcbiAgICB2YXIga2V5cyA9IHRoaXMua2V5cyxcbiAgICAgIHFzSW5kZXggPSBwYXRoLmluZGV4T2YoJz8nKSxcbiAgICAgIHBhdGhuYW1lID0gfnFzSW5kZXggPyBwYXRoLnNsaWNlKDAsIHFzSW5kZXgpIDogcGF0aCxcbiAgICAgIG0gPSB0aGlzLnJlZ2V4cC5leGVjKGRlY29kZVVSSUNvbXBvbmVudChwYXRobmFtZSkpO1xuXG4gICAgaWYgKCFtKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMSwgbGVuID0gbS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgdmFyIGtleSA9IGtleXNbaSAtIDFdO1xuICAgICAgdmFyIHZhbCA9IGRlY29kZVVSTEVuY29kZWRVUklDb21wb25lbnQobVtpXSk7XG4gICAgICBpZiAodmFsICE9PSB1bmRlZmluZWQgfHwgIShoYXNPd25Qcm9wZXJ0eS5jYWxsKHBhcmFtcywga2V5Lm5hbWUpKSkge1xuICAgICAgICBwYXJhbXNba2V5Lm5hbWVdID0gdmFsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBcInBvcHVsYXRlXCIgZXZlbnRzLlxuICAgKi9cblxuICB2YXIgb25wb3BzdGF0ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxvYWRlZCA9IGZhbHNlO1xuICAgIGlmICgndW5kZWZpbmVkJyA9PT0gdHlwZW9mIHdpbmRvdykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZG9jdW1lbnQucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykge1xuICAgICAgbG9hZGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb2FkZWQgPSB0cnVlO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gb25wb3BzdGF0ZShlKSB7XG4gICAgICBpZiAoIWxvYWRlZCkgcmV0dXJuO1xuICAgICAgaWYgKGUuc3RhdGUpIHtcbiAgICAgICAgdmFyIHBhdGggPSBlLnN0YXRlLnBhdGg7XG4gICAgICAgIHBhZ2UucmVwbGFjZShwYXRoLCBlLnN0YXRlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhZ2Uuc2hvdyhsb2NhdGlvbi5wYXRobmFtZSArIGxvY2F0aW9uLmhhc2gsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBmYWxzZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSkoKTtcbiAgLyoqXG4gICAqIEhhbmRsZSBcImNsaWNrXCIgZXZlbnRzLlxuICAgKi9cblxuICBmdW5jdGlvbiBvbmNsaWNrKGUpIHtcblxuICAgIGlmICgxICE9PSB3aGljaChlKSkgcmV0dXJuO1xuXG4gICAgaWYgKGUubWV0YUtleSB8fCBlLmN0cmxLZXkgfHwgZS5zaGlmdEtleSkgcmV0dXJuO1xuICAgIGlmIChlLmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcblxuXG5cbiAgICAvLyBlbnN1cmUgbGlua1xuICAgIC8vIHVzZSBzaGFkb3cgZG9tIHdoZW4gYXZhaWxhYmxlXG4gICAgdmFyIGVsID0gZS5wYXRoID8gZS5wYXRoWzBdIDogZS50YXJnZXQ7XG4gICAgd2hpbGUgKGVsICYmICdBJyAhPT0gZWwubm9kZU5hbWUpIGVsID0gZWwucGFyZW50Tm9kZTtcbiAgICBpZiAoIWVsIHx8ICdBJyAhPT0gZWwubm9kZU5hbWUpIHJldHVybjtcblxuXG5cbiAgICAvLyBJZ25vcmUgaWYgdGFnIGhhc1xuICAgIC8vIDEuIFwiZG93bmxvYWRcIiBhdHRyaWJ1dGVcbiAgICAvLyAyLiByZWw9XCJleHRlcm5hbFwiIGF0dHJpYnV0ZVxuICAgIGlmIChlbC5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgZWwuZ2V0QXR0cmlidXRlKCdyZWwnKSA9PT0gJ2V4dGVybmFsJykgcmV0dXJuO1xuXG4gICAgLy8gZW5zdXJlIG5vbi1oYXNoIGZvciB0aGUgc2FtZSBwYXRoXG4gICAgdmFyIGxpbmsgPSBlbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICBpZiAoIWhhc2hiYW5nICYmIGVsLnBhdGhuYW1lID09PSBsb2NhdGlvbi5wYXRobmFtZSAmJiAoZWwuaGFzaCB8fCAnIycgPT09IGxpbmspKSByZXR1cm47XG5cblxuXG4gICAgLy8gQ2hlY2sgZm9yIG1haWx0bzogaW4gdGhlIGhyZWZcbiAgICBpZiAobGluayAmJiBsaW5rLmluZGV4T2YoJ21haWx0bzonKSA+IC0xKSByZXR1cm47XG5cbiAgICAvLyBjaGVjayB0YXJnZXRcbiAgICBpZiAoZWwudGFyZ2V0KSByZXR1cm47XG5cbiAgICAvLyB4LW9yaWdpblxuICAgIGlmICghc2FtZU9yaWdpbihlbC5ocmVmKSkgcmV0dXJuO1xuXG5cblxuICAgIC8vIHJlYnVpbGQgcGF0aFxuICAgIHZhciBwYXRoID0gZWwucGF0aG5hbWUgKyBlbC5zZWFyY2ggKyAoZWwuaGFzaCB8fCAnJyk7XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIFwiL1tkcml2ZSBsZXR0ZXJdOlwiIG9uIE5XLmpzIG9uIFdpbmRvd3NcbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHBhdGgubWF0Y2goL15cXC9bYS16QS1aXTpcXC8vKSkge1xuICAgICAgcGF0aCA9IHBhdGgucmVwbGFjZSgvXlxcL1thLXpBLVpdOlxcLy8sICcvJyk7XG4gICAgfVxuXG4gICAgLy8gc2FtZSBwYWdlXG4gICAgdmFyIG9yaWcgPSBwYXRoO1xuXG4gICAgaWYgKHBhdGguaW5kZXhPZihiYXNlKSA9PT0gMCkge1xuICAgICAgcGF0aCA9IHBhdGguc3Vic3RyKGJhc2UubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzaGJhbmcpIHBhdGggPSBwYXRoLnJlcGxhY2UoJyMhJywgJycpO1xuXG4gICAgaWYgKGJhc2UgJiYgb3JpZyA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIHBhZ2Uuc2hvdyhvcmlnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFdmVudCBidXR0b24uXG4gICAqL1xuXG4gIGZ1bmN0aW9uIHdoaWNoKGUpIHtcbiAgICBlID0gZSB8fCB3aW5kb3cuZXZlbnQ7XG4gICAgcmV0dXJuIG51bGwgPT09IGUud2hpY2ggPyBlLmJ1dHRvbiA6IGUud2hpY2g7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGhyZWZgIGlzIHRoZSBzYW1lIG9yaWdpbi5cbiAgICovXG5cbiAgZnVuY3Rpb24gc2FtZU9yaWdpbihocmVmKSB7XG4gICAgdmFyIG9yaWdpbiA9IGxvY2F0aW9uLnByb3RvY29sICsgJy8vJyArIGxvY2F0aW9uLmhvc3RuYW1lO1xuICAgIGlmIChsb2NhdGlvbi5wb3J0KSBvcmlnaW4gKz0gJzonICsgbG9jYXRpb24ucG9ydDtcbiAgICByZXR1cm4gKGhyZWYgJiYgKDAgPT09IGhyZWYuaW5kZXhPZihvcmlnaW4pKSk7XG4gIH1cblxuICBwYWdlLnNhbWVPcmlnaW4gPSBzYW1lT3JpZ2luO1xuIiwidmFyIGlzYXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuLyoqXG4gKiBFeHBvc2UgYHBhdGhUb1JlZ2V4cGAuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gcGF0aFRvUmVnZXhwXG5tb2R1bGUuZXhwb3J0cy5wYXJzZSA9IHBhcnNlXG5tb2R1bGUuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZVxubW9kdWxlLmV4cG9ydHMudG9rZW5zVG9GdW5jdGlvbiA9IHRva2Vuc1RvRnVuY3Rpb25cbm1vZHVsZS5leHBvcnRzLnRva2Vuc1RvUmVnRXhwID0gdG9rZW5zVG9SZWdFeHBcblxuLyoqXG4gKiBUaGUgbWFpbiBwYXRoIG1hdGNoaW5nIHJlZ2V4cCB1dGlsaXR5LlxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbnZhciBQQVRIX1JFR0VYUCA9IG5ldyBSZWdFeHAoW1xuICAvLyBNYXRjaCBlc2NhcGVkIGNoYXJhY3RlcnMgdGhhdCB3b3VsZCBvdGhlcndpc2UgYXBwZWFyIGluIGZ1dHVyZSBtYXRjaGVzLlxuICAvLyBUaGlzIGFsbG93cyB0aGUgdXNlciB0byBlc2NhcGUgc3BlY2lhbCBjaGFyYWN0ZXJzIHRoYXQgd29uJ3QgdHJhbnNmb3JtLlxuICAnKFxcXFxcXFxcLiknLFxuICAvLyBNYXRjaCBFeHByZXNzLXN0eWxlIHBhcmFtZXRlcnMgYW5kIHVuLW5hbWVkIHBhcmFtZXRlcnMgd2l0aCBhIHByZWZpeFxuICAvLyBhbmQgb3B0aW9uYWwgc3VmZml4ZXMuIE1hdGNoZXMgYXBwZWFyIGFzOlxuICAvL1xuICAvLyBcIi86dGVzdChcXFxcZCspP1wiID0+IFtcIi9cIiwgXCJ0ZXN0XCIsIFwiXFxkK1wiLCB1bmRlZmluZWQsIFwiP1wiLCB1bmRlZmluZWRdXG4gIC8vIFwiL3JvdXRlKFxcXFxkKylcIiAgPT4gW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiXFxkK1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZF1cbiAgLy8gXCIvKlwiICAgICAgICAgICAgPT4gW1wiL1wiLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIFwiKlwiXVxuICAnKFtcXFxcLy5dKT8oPzooPzpcXFxcOihcXFxcdyspKD86XFxcXCgoKD86XFxcXFxcXFwufFteKCldKSspXFxcXCkpP3xcXFxcKCgoPzpcXFxcXFxcXC58W14oKV0pKylcXFxcKSkoWysqP10pP3woXFxcXCopKSdcbl0uam9pbignfCcpLCAnZycpXG5cbi8qKlxuICogUGFyc2UgYSBzdHJpbmcgZm9yIHRoZSByYXcgdG9rZW5zLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gcGFyc2UgKHN0cikge1xuICB2YXIgdG9rZW5zID0gW11cbiAgdmFyIGtleSA9IDBcbiAgdmFyIGluZGV4ID0gMFxuICB2YXIgcGF0aCA9ICcnXG4gIHZhciByZXNcblxuICB3aGlsZSAoKHJlcyA9IFBBVEhfUkVHRVhQLmV4ZWMoc3RyKSkgIT0gbnVsbCkge1xuICAgIHZhciBtID0gcmVzWzBdXG4gICAgdmFyIGVzY2FwZWQgPSByZXNbMV1cbiAgICB2YXIgb2Zmc2V0ID0gcmVzLmluZGV4XG4gICAgcGF0aCArPSBzdHIuc2xpY2UoaW5kZXgsIG9mZnNldClcbiAgICBpbmRleCA9IG9mZnNldCArIG0ubGVuZ3RoXG5cbiAgICAvLyBJZ25vcmUgYWxyZWFkeSBlc2NhcGVkIHNlcXVlbmNlcy5cbiAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgcGF0aCArPSBlc2NhcGVkWzFdXG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIFB1c2ggdGhlIGN1cnJlbnQgcGF0aCBvbnRvIHRoZSB0b2tlbnMuXG4gICAgaWYgKHBhdGgpIHtcbiAgICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gICAgICBwYXRoID0gJydcbiAgICB9XG5cbiAgICB2YXIgcHJlZml4ID0gcmVzWzJdXG4gICAgdmFyIG5hbWUgPSByZXNbM11cbiAgICB2YXIgY2FwdHVyZSA9IHJlc1s0XVxuICAgIHZhciBncm91cCA9IHJlc1s1XVxuICAgIHZhciBzdWZmaXggPSByZXNbNl1cbiAgICB2YXIgYXN0ZXJpc2sgPSByZXNbN11cblxuICAgIHZhciByZXBlYXQgPSBzdWZmaXggPT09ICcrJyB8fCBzdWZmaXggPT09ICcqJ1xuICAgIHZhciBvcHRpb25hbCA9IHN1ZmZpeCA9PT0gJz8nIHx8IHN1ZmZpeCA9PT0gJyonXG4gICAgdmFyIGRlbGltaXRlciA9IHByZWZpeCB8fCAnLydcbiAgICB2YXIgcGF0dGVybiA9IGNhcHR1cmUgfHwgZ3JvdXAgfHwgKGFzdGVyaXNrID8gJy4qJyA6ICdbXicgKyBkZWxpbWl0ZXIgKyAnXSs/JylcblxuICAgIHRva2Vucy5wdXNoKHtcbiAgICAgIG5hbWU6IG5hbWUgfHwga2V5KyssXG4gICAgICBwcmVmaXg6IHByZWZpeCB8fCAnJyxcbiAgICAgIGRlbGltaXRlcjogZGVsaW1pdGVyLFxuICAgICAgb3B0aW9uYWw6IG9wdGlvbmFsLFxuICAgICAgcmVwZWF0OiByZXBlYXQsXG4gICAgICBwYXR0ZXJuOiBlc2NhcGVHcm91cChwYXR0ZXJuKVxuICAgIH0pXG4gIH1cblxuICAvLyBNYXRjaCBhbnkgY2hhcmFjdGVycyBzdGlsbCByZW1haW5pbmcuXG4gIGlmIChpbmRleCA8IHN0ci5sZW5ndGgpIHtcbiAgICBwYXRoICs9IHN0ci5zdWJzdHIoaW5kZXgpXG4gIH1cblxuICAvLyBJZiB0aGUgcGF0aCBleGlzdHMsIHB1c2ggaXQgb250byB0aGUgZW5kLlxuICBpZiAocGF0aCkge1xuICAgIHRva2Vucy5wdXNoKHBhdGgpXG4gIH1cblxuICByZXR1cm4gdG9rZW5zXG59XG5cbi8qKlxuICogQ29tcGlsZSBhIHN0cmluZyB0byBhIHRlbXBsYXRlIGZ1bmN0aW9uIGZvciB0aGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9ICAgc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gY29tcGlsZSAoc3RyKSB7XG4gIHJldHVybiB0b2tlbnNUb0Z1bmN0aW9uKHBhcnNlKHN0cikpXG59XG5cbi8qKlxuICogRXhwb3NlIGEgbWV0aG9kIGZvciB0cmFuc2Zvcm1pbmcgdG9rZW5zIGludG8gdGhlIHBhdGggZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIHRva2Vuc1RvRnVuY3Rpb24gKHRva2Vucykge1xuICAvLyBDb21waWxlIGFsbCB0aGUgdG9rZW5zIGludG8gcmVnZXhwcy5cbiAgdmFyIG1hdGNoZXMgPSBuZXcgQXJyYXkodG9rZW5zLmxlbmd0aClcblxuICAvLyBDb21waWxlIGFsbCB0aGUgcGF0dGVybnMgYmVmb3JlIGNvbXBpbGF0aW9uLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldID09PSAnb2JqZWN0Jykge1xuICAgICAgbWF0Y2hlc1tpXSA9IG5ldyBSZWdFeHAoJ14nICsgdG9rZW5zW2ldLnBhdHRlcm4gKyAnJCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChvYmopIHtcbiAgICB2YXIgcGF0aCA9ICcnXG4gICAgdmFyIGRhdGEgPSBvYmogfHwge31cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgICAgaWYgKHR5cGVvZiB0b2tlbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcGF0aCArPSB0b2tlblxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZSA9IGRhdGFbdG9rZW4ubmFtZV1cbiAgICAgIHZhciBzZWdtZW50XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBiZSBkZWZpbmVkJylcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoaXNhcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgaWYgKCF0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCByZXBlYXQsIGJ1dCByZWNlaXZlZCBcIicgKyB2YWx1ZSArICdcIicpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgaWYgKHRva2VuLm9wdGlvbmFsKSB7XG4gICAgICAgICAgICBjb250aW51ZVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBcIicgKyB0b2tlbi5uYW1lICsgJ1wiIHRvIG5vdCBiZSBlbXB0eScpXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWx1ZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHNlZ21lbnQgPSBlbmNvZGVVUklDb21wb25lbnQodmFsdWVbal0pXG5cbiAgICAgICAgICBpZiAoIW1hdGNoZXNbaV0udGVzdChzZWdtZW50KSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYWxsIFwiJyArIHRva2VuLm5hbWUgKyAnXCIgdG8gbWF0Y2ggXCInICsgdG9rZW4ucGF0dGVybiArICdcIiwgYnV0IHJlY2VpdmVkIFwiJyArIHNlZ21lbnQgKyAnXCInKVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHBhdGggKz0gKGogPT09IDAgPyB0b2tlbi5wcmVmaXggOiB0b2tlbi5kZWxpbWl0ZXIpICsgc2VnbWVudFxuICAgICAgICB9XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgc2VnbWVudCA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcblxuICAgICAgaWYgKCFtYXRjaGVzW2ldLnRlc3Qoc2VnbWVudCkpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgXCInICsgdG9rZW4ubmFtZSArICdcIiB0byBtYXRjaCBcIicgKyB0b2tlbi5wYXR0ZXJuICsgJ1wiLCBidXQgcmVjZWl2ZWQgXCInICsgc2VnbWVudCArICdcIicpXG4gICAgICB9XG5cbiAgICAgIHBhdGggKz0gdG9rZW4ucHJlZml4ICsgc2VnbWVudFxuICAgIH1cblxuICAgIHJldHVybiBwYXRoXG4gIH1cbn1cblxuLyoqXG4gKiBFc2NhcGUgYSByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nLlxuICpcbiAqIEBwYXJhbSAge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVN0cmluZyAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFsuKyo/PV4hOiR7fSgpW1xcXXxcXC9dKS9nLCAnXFxcXCQxJylcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGNhcHR1cmluZyBncm91cCBieSBlc2NhcGluZyBzcGVjaWFsIGNoYXJhY3RlcnMgYW5kIG1lYW5pbmcuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBncm91cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVHcm91cCAoZ3JvdXApIHtcbiAgcmV0dXJuIGdyb3VwLnJlcGxhY2UoLyhbPSE6JFxcLygpXSkvZywgJ1xcXFwkMScpXG59XG5cbi8qKlxuICogQXR0YWNoIHRoZSBrZXlzIGFzIGEgcHJvcGVydHkgb2YgdGhlIHJlZ2V4cC5cbiAqXG4gKiBAcGFyYW0gIHtSZWdFeHB9IHJlXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gYXR0YWNoS2V5cyAocmUsIGtleXMpIHtcbiAgcmUua2V5cyA9IGtleXNcbiAgcmV0dXJuIHJlXG59XG5cbi8qKlxuICogR2V0IHRoZSBmbGFncyBmb3IgYSByZWdleHAgZnJvbSB0aGUgb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZmxhZ3MgKG9wdGlvbnMpIHtcbiAgcmV0dXJuIG9wdGlvbnMuc2Vuc2l0aXZlID8gJycgOiAnaSdcbn1cblxuLyoqXG4gKiBQdWxsIG91dCBrZXlzIGZyb20gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7UmVnRXhwfSBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEByZXR1cm4ge1JlZ0V4cH1cbiAqL1xuZnVuY3Rpb24gcmVnZXhwVG9SZWdleHAgKHBhdGgsIGtleXMpIHtcbiAgLy8gVXNlIGEgbmVnYXRpdmUgbG9va2FoZWFkIHRvIG1hdGNoIG9ubHkgY2FwdHVyaW5nIGdyb3Vwcy5cbiAgdmFyIGdyb3VwcyA9IHBhdGguc291cmNlLm1hdGNoKC9cXCgoPyFcXD8pL2cpXG5cbiAgaWYgKGdyb3Vwcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JvdXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXlzLnB1c2goe1xuICAgICAgICBuYW1lOiBpLFxuICAgICAgICBwcmVmaXg6IG51bGwsXG4gICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgb3B0aW9uYWw6IGZhbHNlLFxuICAgICAgICByZXBlYXQ6IGZhbHNlLFxuICAgICAgICBwYXR0ZXJuOiBudWxsXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHBhdGgsIGtleXMpXG59XG5cbi8qKlxuICogVHJhbnNmb3JtIGFuIGFycmF5IGludG8gYSByZWdleHAuXG4gKlxuICogQHBhcmFtICB7QXJyYXl9ICBwYXRoXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBhcnJheVRvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciBwYXJ0cyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aDsgaSsrKSB7XG4gICAgcGFydHMucHVzaChwYXRoVG9SZWdleHAocGF0aFtpXSwga2V5cywgb3B0aW9ucykuc291cmNlKVxuICB9XG5cbiAgdmFyIHJlZ2V4cCA9IG5ldyBSZWdFeHAoJyg/OicgKyBwYXJ0cy5qb2luKCd8JykgKyAnKScsIGZsYWdzKG9wdGlvbnMpKVxuXG4gIHJldHVybiBhdHRhY2hLZXlzKHJlZ2V4cCwga2V5cylcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBwYXRoIHJlZ2V4cCBmcm9tIHN0cmluZyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAga2V5c1xuICogQHBhcmFtICB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cbmZ1bmN0aW9uIHN0cmluZ1RvUmVnZXhwIChwYXRoLCBrZXlzLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSBwYXJzZShwYXRoKVxuICB2YXIgcmUgPSB0b2tlbnNUb1JlZ0V4cCh0b2tlbnMsIG9wdGlvbnMpXG5cbiAgLy8gQXR0YWNoIGtleXMgYmFjayB0byB0aGUgcmVnZXhwLlxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva2Vucy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh0eXBlb2YgdG9rZW5zW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAga2V5cy5wdXNoKHRva2Vuc1tpXSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYXR0YWNoS2V5cyhyZSwga2V5cylcbn1cblxuLyoqXG4gKiBFeHBvc2UgYSBmdW5jdGlvbiBmb3IgdGFraW5nIHRva2VucyBhbmQgcmV0dXJuaW5nIGEgUmVnRXhwLlxuICpcbiAqIEBwYXJhbSAge0FycmF5fSAgdG9rZW5zXG4gKiBAcGFyYW0gIHtBcnJheX0gIGtleXNcbiAqIEBwYXJhbSAge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiB0b2tlbnNUb1JlZ0V4cCAodG9rZW5zLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG5cbiAgdmFyIHN0cmljdCA9IG9wdGlvbnMuc3RyaWN0XG4gIHZhciBlbmQgPSBvcHRpb25zLmVuZCAhPT0gZmFsc2VcbiAgdmFyIHJvdXRlID0gJydcbiAgdmFyIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV1cbiAgdmFyIGVuZHNXaXRoU2xhc2ggPSB0eXBlb2YgbGFzdFRva2VuID09PSAnc3RyaW5nJyAmJiAvXFwvJC8udGVzdChsYXN0VG9rZW4pXG5cbiAgLy8gSXRlcmF0ZSBvdmVyIHRoZSB0b2tlbnMgYW5kIGNyZWF0ZSBvdXIgcmVnZXhwIHN0cmluZy5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tlbnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cblxuICAgIGlmICh0eXBlb2YgdG9rZW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICByb3V0ZSArPSBlc2NhcGVTdHJpbmcodG9rZW4pXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBwcmVmaXggPSBlc2NhcGVTdHJpbmcodG9rZW4ucHJlZml4KVxuICAgICAgdmFyIGNhcHR1cmUgPSB0b2tlbi5wYXR0ZXJuXG5cbiAgICAgIGlmICh0b2tlbi5yZXBlYXQpIHtcbiAgICAgICAgY2FwdHVyZSArPSAnKD86JyArIHByZWZpeCArIGNhcHR1cmUgKyAnKSonXG4gICAgICB9XG5cbiAgICAgIGlmICh0b2tlbi5vcHRpb25hbCkge1xuICAgICAgICBpZiAocHJlZml4KSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoPzonICsgcHJlZml4ICsgJygnICsgY2FwdHVyZSArICcpKT8nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FwdHVyZSA9ICcoJyArIGNhcHR1cmUgKyAnKT8nXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhcHR1cmUgPSBwcmVmaXggKyAnKCcgKyBjYXB0dXJlICsgJyknXG4gICAgICB9XG5cbiAgICAgIHJvdXRlICs9IGNhcHR1cmVcbiAgICB9XG4gIH1cblxuICAvLyBJbiBub24tc3RyaWN0IG1vZGUgd2UgYWxsb3cgYSBzbGFzaCBhdCB0aGUgZW5kIG9mIG1hdGNoLiBJZiB0aGUgcGF0aCB0b1xuICAvLyBtYXRjaCBhbHJlYWR5IGVuZHMgd2l0aCBhIHNsYXNoLCB3ZSByZW1vdmUgaXQgZm9yIGNvbnNpc3RlbmN5LiBUaGUgc2xhc2hcbiAgLy8gaXMgdmFsaWQgYXQgdGhlIGVuZCBvZiBhIHBhdGggbWF0Y2gsIG5vdCBpbiB0aGUgbWlkZGxlLiBUaGlzIGlzIGltcG9ydGFudFxuICAvLyBpbiBub24tZW5kaW5nIG1vZGUsIHdoZXJlIFwiL3Rlc3QvXCIgc2hvdWxkbid0IG1hdGNoIFwiL3Rlc3QvL3JvdXRlXCIuXG4gIGlmICghc3RyaWN0KSB7XG4gICAgcm91dGUgPSAoZW5kc1dpdGhTbGFzaCA/IHJvdXRlLnNsaWNlKDAsIC0yKSA6IHJvdXRlKSArICcoPzpcXFxcLyg/PSQpKT8nXG4gIH1cblxuICBpZiAoZW5kKSB7XG4gICAgcm91dGUgKz0gJyQnXG4gIH0gZWxzZSB7XG4gICAgLy8gSW4gbm9uLWVuZGluZyBtb2RlLCB3ZSBuZWVkIHRoZSBjYXB0dXJpbmcgZ3JvdXBzIHRvIG1hdGNoIGFzIG11Y2ggYXNcbiAgICAvLyBwb3NzaWJsZSBieSB1c2luZyBhIHBvc2l0aXZlIGxvb2thaGVhZCB0byB0aGUgZW5kIG9yIG5leHQgcGF0aCBzZWdtZW50LlxuICAgIHJvdXRlICs9IHN0cmljdCAmJiBlbmRzV2l0aFNsYXNoID8gJycgOiAnKD89XFxcXC98JCknXG4gIH1cblxuICByZXR1cm4gbmV3IFJlZ0V4cCgnXicgKyByb3V0ZSwgZmxhZ3Mob3B0aW9ucykpXG59XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBnaXZlbiBwYXRoIHN0cmluZywgcmV0dXJuaW5nIGEgcmVndWxhciBleHByZXNzaW9uLlxuICpcbiAqIEFuIGVtcHR5IGFycmF5IGNhbiBiZSBwYXNzZWQgaW4gZm9yIHRoZSBrZXlzLCB3aGljaCB3aWxsIGhvbGQgdGhlXG4gKiBwbGFjZWhvbGRlciBrZXkgZGVzY3JpcHRpb25zLiBGb3IgZXhhbXBsZSwgdXNpbmcgYC91c2VyLzppZGAsIGBrZXlzYCB3aWxsXG4gKiBjb250YWluIGBbeyBuYW1lOiAnaWQnLCBkZWxpbWl0ZXI6ICcvJywgb3B0aW9uYWw6IGZhbHNlLCByZXBlYXQ6IGZhbHNlIH1dYC5cbiAqXG4gKiBAcGFyYW0gIHsoU3RyaW5nfFJlZ0V4cHxBcnJheSl9IHBhdGhcbiAqIEBwYXJhbSAge0FycmF5fSAgICAgICAgICAgICAgICAgW2tleXNdXG4gKiBAcGFyYW0gIHtPYmplY3R9ICAgICAgICAgICAgICAgIFtvcHRpb25zXVxuICogQHJldHVybiB7UmVnRXhwfVxuICovXG5mdW5jdGlvbiBwYXRoVG9SZWdleHAgKHBhdGgsIGtleXMsIG9wdGlvbnMpIHtcbiAga2V5cyA9IGtleXMgfHwgW11cblxuICBpZiAoIWlzYXJyYXkoa2V5cykpIHtcbiAgICBvcHRpb25zID0ga2V5c1xuICAgIGtleXMgPSBbXVxuICB9IGVsc2UgaWYgKCFvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHt9XG4gIH1cblxuICBpZiAocGF0aCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgIHJldHVybiByZWdleHBUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgaWYgKGlzYXJyYXkocGF0aCkpIHtcbiAgICByZXR1cm4gYXJyYXlUb1JlZ2V4cChwYXRoLCBrZXlzLCBvcHRpb25zKVxuICB9XG5cbiAgcmV0dXJuIHN0cmluZ1RvUmVnZXhwKHBhdGgsIGtleXMsIG9wdGlvbnMpXG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiXG52YXIgb3JpZyA9IGRvY3VtZW50LnRpdGxlO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBzZXQ7XG5cbmZ1bmN0aW9uIHNldChzdHIpIHtcbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgZG9jdW1lbnQudGl0bGUgPSBzdHIucmVwbGFjZSgvJVtvc10vZywgZnVuY3Rpb24oXyl7XG4gICAgc3dpdGNoIChfKSB7XG4gICAgICBjYXNlICclbyc6XG4gICAgICAgIHJldHVybiBvcmlnO1xuICAgICAgY2FzZSAnJXMnOlxuICAgICAgICByZXR1cm4gYXJnc1tpKytdO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydHMucmVzZXQgPSBmdW5jdGlvbigpe1xuICBzZXQob3JpZyk7XG59O1xuIiwidmFyIGJlbCA9IHJlcXVpcmUoJ2JlbCcpIC8vIHR1cm5zIHRlbXBsYXRlIHRhZyBpbnRvIERPTSBlbGVtZW50c1xudmFyIG1vcnBoZG9tID0gcmVxdWlyZSgnbW9ycGhkb20nKSAvLyBlZmZpY2llbnRseSBkaWZmcyArIG1vcnBocyB0d28gRE9NIGVsZW1lbnRzXG52YXIgZGVmYXVsdEV2ZW50cyA9IHJlcXVpcmUoJy4vdXBkYXRlLWV2ZW50cy5qcycpIC8vIGRlZmF1bHQgZXZlbnRzIHRvIGJlIGNvcGllZCB3aGVuIGRvbSBlbGVtZW50cyB1cGRhdGVcblxubW9kdWxlLmV4cG9ydHMgPSBiZWxcblxuLy8gVE9ETyBtb3ZlIHRoaXMgKyBkZWZhdWx0RXZlbnRzIHRvIGEgbmV3IG1vZHVsZSBvbmNlIHdlIHJlY2VpdmUgbW9yZSBmZWVkYmFja1xubW9kdWxlLmV4cG9ydHMudXBkYXRlID0gZnVuY3Rpb24gKGZyb21Ob2RlLCB0b05vZGUsIG9wdHMpIHtcbiAgaWYgKCFvcHRzKSBvcHRzID0ge31cbiAgaWYgKG9wdHMuZXZlbnRzICE9PSBmYWxzZSkge1xuICAgIGlmICghb3B0cy5vbkJlZm9yZUVsVXBkYXRlZCkgb3B0cy5vbkJlZm9yZUVsVXBkYXRlZCA9IGNvcGllclxuICB9XG5cbiAgcmV0dXJuIG1vcnBoZG9tKGZyb21Ob2RlLCB0b05vZGUsIG9wdHMpXG5cbiAgLy8gbW9ycGhkb20gb25seSBjb3BpZXMgYXR0cmlidXRlcy4gd2UgZGVjaWRlZCB3ZSBhbHNvIHdhbnRlZCB0byBjb3B5IGV2ZW50c1xuICAvLyB0aGF0IGNhbiBiZSBzZXQgdmlhIGF0dHJpYnV0ZXNcbiAgZnVuY3Rpb24gY29waWVyIChmLCB0KSB7XG4gICAgLy8gY29weSBldmVudHM6XG4gICAgdmFyIGV2ZW50cyA9IG9wdHMuZXZlbnRzIHx8IGRlZmF1bHRFdmVudHNcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGV2ID0gZXZlbnRzW2ldXG4gICAgICBpZiAodFtldl0pIHsgLy8gaWYgbmV3IGVsZW1lbnQgaGFzIGEgd2hpdGVsaXN0ZWQgYXR0cmlidXRlXG4gICAgICAgIGZbZXZdID0gdFtldl0gLy8gdXBkYXRlIGV4aXN0aW5nIGVsZW1lbnRcbiAgICAgIH0gZWxzZSBpZiAoZltldl0pIHsgLy8gaWYgZXhpc3RpbmcgZWxlbWVudCBoYXMgaXQgYW5kIG5ldyBvbmUgZG9lc250XG4gICAgICAgIGZbZXZdID0gdW5kZWZpbmVkIC8vIHJlbW92ZSBpdCBmcm9tIGV4aXN0aW5nIGVsZW1lbnRcbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIG9sZFZhbHVlID0gZi52YWx1ZVxuICAgIHZhciBuZXdWYWx1ZSA9IHQudmFsdWVcbiAgICAvLyBjb3B5IHZhbHVlcyBmb3IgZm9ybSBlbGVtZW50c1xuICAgIGlmICgoZi5ub2RlTmFtZSA9PT0gJ0lOUFVUJyAmJiBmLnR5cGUgIT09ICdmaWxlJykgfHwgZi5ub2RlTmFtZSA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIGlmICghbmV3VmFsdWUgJiYgIXQuaGFzQXR0cmlidXRlKCd2YWx1ZScpKSB7XG4gICAgICAgIHQudmFsdWUgPSBmLnZhbHVlXG4gICAgICB9IGVsc2UgaWYgKG5ld1ZhbHVlICE9PSBvbGRWYWx1ZSkge1xuICAgICAgICBmLnZhbHVlID0gbmV3VmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGYubm9kZU5hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgIGlmICh0LmdldEF0dHJpYnV0ZSgndmFsdWUnKSA9PT0gbnVsbCkgZi52YWx1ZSA9IHQudmFsdWVcbiAgICB9XG4gIH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gW1xuICAvLyBhdHRyaWJ1dGUgZXZlbnRzIChjYW4gYmUgc2V0IHdpdGggYXR0cmlidXRlcylcbiAgJ29uY2xpY2snLFxuICAnb25kYmxjbGljaycsXG4gICdvbm1vdXNlZG93bicsXG4gICdvbm1vdXNldXAnLFxuICAnb25tb3VzZW92ZXInLFxuICAnb25tb3VzZW1vdmUnLFxuICAnb25tb3VzZW91dCcsXG4gICdvbmRyYWdzdGFydCcsXG4gICdvbmRyYWcnLFxuICAnb25kcmFnZW50ZXInLFxuICAnb25kcmFnbGVhdmUnLFxuICAnb25kcmFnb3ZlcicsXG4gICdvbmRyb3AnLFxuICAnb25kcmFnZW5kJyxcbiAgJ29ua2V5ZG93bicsXG4gICdvbmtleXByZXNzJyxcbiAgJ29ua2V5dXAnLFxuICAnb251bmxvYWQnLFxuICAnb25hYm9ydCcsXG4gICdvbmVycm9yJyxcbiAgJ29ucmVzaXplJyxcbiAgJ29uc2Nyb2xsJyxcbiAgJ29uc2VsZWN0JyxcbiAgJ29uY2hhbmdlJyxcbiAgJ29uc3VibWl0JyxcbiAgJ29ucmVzZXQnLFxuICAnb25mb2N1cycsXG4gICdvbmJsdXInLFxuICAnb25pbnB1dCcsXG4gIC8vIG90aGVyIGNvbW1vbiBldmVudHNcbiAgJ29uY29udGV4dG1lbnUnLFxuICAnb25mb2N1c2luJyxcbiAgJ29uZm9jdXNvdXQnXG5dXG4iLCJ2YXIgcGFnZSA9IHJlcXVpcmUoJ3BhZ2UnKTtcbnZhciBlbXB0eSA9IHJlcXVpcmUoJ2VtcHR5LWVsZW1lbnQnKTtcbnZhciB0ZW1wbGF0ZSA9IHJlcXVpcmUoJy4vdGVtcGxhdGUnKTtcbnZhciB0aXRsZSA9IHJlcXVpcmUoJ3RpdGxlJyk7XG5cbnBhZ2UoJy8nLCBmdW5jdGlvbiAoY3R4LCBuZXh0KSB7XG4gIHRpdGxlKCdQbGF0emlncmFtJyk7XG4gIHZhciBtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY29udGFpbmVyJyk7XG5cbiAgdmFyIHBpY3R1cmVzID0gW1xuICAgIHtcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgdXNlcm5hbWU6ICdMdWlzJyxcbiAgICAgICAgYXZhdGFyOiAnaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL1hvdlhMcFd5Nk00Z2dvdWNuV05nZTRoZ3JqQXNYMjJfaFQyV0RnX2hFMGUtRk5TY0VuS3I4ejZKNDc5anZuaGpXOF9neXU2VTZZNE5sTXgzY2c9dzUxMjAtaDMyMDAtcnctbm8nXG4gICAgICB9LFxuICAgICAgdXJsOiAnaHR0cDovL21hdGVyaWFsaXplY3NzLmNvbS9pbWFnZXMvb2ZmaWNlLmpwZycsXG4gICAgICBsaWtlczogMTIzLFxuICAgICAgbGlrZWQ6IHRydWUsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKClcbiAgICB9LFxuICAgIHtcbiAgICAgIHVzZXI6IHtcbiAgICAgICAgdXNlcm5hbWU6ICdHZXJtYW4nLFxuICAgICAgICBhdmF0YXI6ICdodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vNEVpYlZhdUs1VUlmck50ZVc4aHA3dEJSRUd0bmhUU3hkRWhtTFI4ajVnRS1kNUpscUZ3MUgzQlhmcWtWS093enFhTmJ2Ym1wUEFqMVJsLWM9dzUxMjAtaDMyMDAtcnctbm8nXG4gICAgICB9LFxuICAgICAgdXJsOiAnaHR0cDovL21hdGVyaWFsaXplY3NzLmNvbS9pbWFnZXMvc2FtcGxlLTEuanBnJyxcbiAgICAgIGxpa2VzOiAyMzQsXG4gICAgICBsaWtlZDogZmFsc2UsXG4gICAgICBjcmVhdGVkQXQ6IG5ldyBEYXRlKCkuc2V0RGF0ZShuZXcgRGF0ZSgpLmdldERhdGUoKSAtIDEwKVxuICAgIH0sXG4gICAge1xuICAgICAgdXNlcjoge1xuICAgICAgICB1c2VybmFtZTogJ0x1aXMnLFxuICAgICAgICBhdmF0YXI6ICdodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vWG92WExwV3k2TTRnZ291Y25XTmdlNGhncmpBc1gyMl9oVDJXRGdfaEUwZS1GTlNjRW5Lcjh6Nko0Nzlqdm5oalc4X2d5dTZVNlk0TmxNeDNjZz13NTEyMC1oMzIwMC1ydy1ubydcbiAgICAgIH0sXG4gICAgICB1cmw6ICdodHRwOi8vbWF0ZXJpYWxpemVjc3MuY29tL2ltYWdlcy9vZmZpY2UuanBnJyxcbiAgICAgIGxpa2VzOiAxMjMsXG4gICAgICBsaWtlZDogdHJ1ZSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKVxuICAgIH0sXG4gICAge1xuICAgICAgdXNlcjoge1xuICAgICAgICB1c2VybmFtZTogJ0dlcm1hbicsXG4gICAgICAgIGF2YXRhcjogJ2h0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS80RWliVmF1SzVVSWZyTnRlVzhocDd0QlJFR3RuaFRTeGRFaG1MUjhqNWdFLWQ1SmxxRncxSDNCWGZxa1ZLT3d6cWFOYnZibXBQQWoxUmwtYz13NTEyMC1oMzIwMC1ydy1ubydcbiAgICAgIH0sXG4gICAgICB1cmw6ICdodHRwOi8vbWF0ZXJpYWxpemVjc3MuY29tL2ltYWdlcy9zYW1wbGUtMS5qcGcnLFxuICAgICAgbGlrZXM6IDIzNCxcbiAgICAgIGxpa2VkOiBmYWxzZSxcbiAgICAgIGNyZWF0ZWRBdDogbmV3IERhdGUoKS5zZXREYXRlKG5ldyBEYXRlKCkuZ2V0RGF0ZSgpIC0gMTApXG4gICAgfVxuICBdO1xuXG4gIGVtcHR5KG1haW4pLmFwcGVuZENoaWxkKHRlbXBsYXRlKHBpY3R1cmVzKSk7XG59KVxuIiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcbnZhciBsYXlvdXQgPSByZXF1aXJlKCcuLi9sYXlvdXQnKTtcbnZhciBwaWN0dXJlID0gcmVxdWlyZSgnLi4vcGljdHVyZS1jYXJkJyk7XG5cbi8vbW9kdWxlLmV4cG9ydHMgcGFyYSBkZWNpciBxdWUgZXN0ZSBhcmNoaXZvIGV4cG9ydGEgdG9kbyBlc3RlIGNvbnRlbmlkb1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGljdHVyZXMpIHtcbiAgdmFyIGVsID0geW9gPGRpdiBjbGFzcz1cImNvbnRhaW5lciB0aW1lbGluZVwiPlxuICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cblxuICAgICAgICAke3BpY3R1cmVzLm1hcCggZnVuY3Rpb24gKHBpYykge1xuICAgICAgICAgIHJldHVybiBwaWN0dXJlKHBpYyk7XG4gICAgICAgIH0pfVxuICAgIFxuICAgIDwvZGl2PlxuICA8L2Rpdj5gO1xuXG4gIHJldHVybiBsYXlvdXQoZWwpO1xufVxuIiwidmFyIHBhZ2UgPSByZXF1aXJlKCdwYWdlJyk7XG5cbnJlcXVpcmUoJy4vaG9tZXBhZ2UnKTtcbnJlcXVpcmUoJy4vc2lnbnVwJyk7XG5yZXF1aXJlKCcuL3NpZ25pbicpO1xuXG5wYWdlKCk7XG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxhbmRpbmcoYm94KSB7XG4gIHJldHVybiB5b2A8ZGl2IGNsYXNzPVwiY29udGFpbmVyIGxhbmRpbmdcIj5cbiAgICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMCBwdXNoLXMxXCI+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJyb3dcIj5cblxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjb2wgbTUgaGlkZS1vbi1zbWFsbC1vbmx5XCI+XG4gICAgICAgICAgICA8aW1nIGNsYXNzPVwiaXBob25lXCIgc3JjPVwiaXBob25lLnBuZ1wiIC8+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAke2JveH1cblxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5gXG59XG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGxheW91dChjb250ZW50KSB7XG4gIHJldHVybiB5b2A8ZGl2PlxuICAgIDxuYXYgY2xhc3M9XCJoZWFkZXJcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJuYXYtd3JhcHBlclwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInJvd1wiPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sIHMxMCBtNiBcIj5cbiAgICAgICAgICAgICAgPGEgaHJlZj1cIi9cIiBjbGFzcz1cImJyYW5kLWxvZ28gcGxhdHppZ3JhbVwiPlBsYXR6aWdyYW08L2E+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbCBzMiBtMSBwdXNoLW01XCI+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCIjXCIgY2xhc3M9XCJidG4gYnRuLWxhcmdlIGJ0bi1mbGF0IGRyb3Bkb3duLWJ1dHRvbiBuby1wYWRkaW5nIGJ1dHRvbi11c2VyLWhlYWRlclwiIGRhdGEtYWN0aXZhdGVzPVwiZHJvcC11c2VyXCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS11c2VyXCIgYXJpYS1oaWRkZW49XCJ0cnVlXCI+PC9pPlxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICAgIDx1bCBpZD1cImRyb3AtdXNlclwiIGNsYXNzPVwiZHJvcGRvd24tY29udGVudFwiPlxuICAgICAgICAgICAgICAgIDxsaT48YSBocmVmPVwiI1wiPlNhbGlyPC9hPjwvbGk+XG4gICAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvbmF2PlxuICAgIDxkaXYgY2xhc3M9XCJjb250ZW50XCI+XG4gICAgICAke2NvbnRlbnR9XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuICBgO1xufVxuIiwidmFyIHlvID0gcmVxdWlyZSgneW8teW8nKTtcblxuaWYgKCF3aW5kb3cuSW50bCkge1xuICB3aW5kb3cuSW50bCA9IHJlcXVpcmUoJ2ludGwnKTsgLy8gcG9seWZpbGwgZm9yIGBJbnRsYFxufVxuXG52YXIgSW50bFJlbGF0aXZlRm9ybWF0ID0gd2luZG93LkludGxSZWxhdGl2ZUZvcm1hdCA9IHJlcXVpcmUoJ2ludGwtcmVsYXRpdmVmb3JtYXQnKTtcblxucmVxdWlyZSgnaW50bC1yZWxhdGl2ZWZvcm1hdC9kaXN0L2xvY2FsZS1kYXRhL2VuLmpzJyk7XG5yZXF1aXJlKCdpbnRsLXJlbGF0aXZlZm9ybWF0L2Rpc3QvbG9jYWxlLWRhdGEvZXMuanMnKTtcblxudmFyIHJmID0gbmV3IEludGxSZWxhdGl2ZUZvcm1hdCgnZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWN0dXJlQ2FyZChwaWMpIHtcblxuICB2YXIgZWw7XG5cbiAgZnVuY3Rpb24gcmVuZGVyKHBpY3R1cmUpIHtcbiAgICByZXR1cm4geW9gPGRpdiBjbGFzcz1cImNvbCBzMTIgbTYgbDZcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJjYXJkICR7cGljdHVyZS5saWtlZCA/ICdsaWtlZCcgOiAnJ31cIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtaW1hZ2VcIj5cbiAgICAgICAgICA8aW1nIGNsYXNzPVwiYWN0aXZhdG9yXCIgc3JjPVwiJHtwaWN0dXJlLnVybH1cIj5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWNvbnRlbnRcIj5cbiAgICAgICAgICA8YSBocmVmPVwiL3VzZXIvJHtwaWN0dXJlLnVzZXIudXNlcm5hbWV9XCIgY2xhc3M9XCJjYXJkLXRpdGxlXCI+XG4gICAgICAgICAgICA8aW1nIHNyYz1cIiR7cGljdHVyZS51c2VyLmF2YXRhcn1cIiBjbGFzcz1cImF2YXRhclwiLz5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidXNlcm5hbWVcIj4ke3BpY3R1cmUudXNlci51c2VybmFtZX08L3NwYW4+XG5cbiAgICAgICAgICA8L2E+XG4gICAgICAgICAgPHNtYWxsIGNsYXNzPVwicmlnaHQgdGltZVwiPiR7cmYuZm9ybWF0KHBpY3R1cmUuY3JlYXRlZEF0KX08L3NtYWxsPlxuICAgICAgICAgIDxwPlxuICAgICAgICAgICAgPGEgY2xhc3M9XCJsZWZ0XCIgaHJlZj1cIiNcIiBvbmNsaWNrPSR7bGlrZS5iaW5kKG51bGwsIHRydWUpfT48aSBjbGFzcz1cImZhIGZhLWhlYXJ0LW9cIiBhcmlhLWhpZGRlbj1cInRydWVcIj48L2k+PC9hPlxuICAgICAgICAgICAgPGEgY2xhc3M9XCJsZWZ0XCIgaHJlZj1cIiNcIiBvbmNsaWNrPSR7bGlrZS5iaW5kKG51bGwsIGZhbHNlKX0+PGkgY2xhc3M9XCJmYSBmYS1oZWFydFwiIGFyaWEtaGlkZGVuPVwidHJ1ZVwiPjwvaT48L2E+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxlZnQgbGlrZXNcIj4ke3BpY3R1cmUubGlrZXN9IG1lIGd1c3RhPC9zcGFuPlxuICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5gO1xuICB9XG5cbiAgZnVuY3Rpb24gbGlrZShsaWtlZCl7XG4gICAgcGljLmxpa2VkID0gbGlrZWQ7XG4gICAgcGljLmxpa2VzICs9IGxpa2VkID8gMSA6IC0xO1xuICAgIHZhciBuZXdFbCA9IHJlbmRlcihwaWMpO1xuICAgIHlvLnVwZGF0ZShlbCwgbmV3RWwpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGVsID0gcmVuZGVyKHBpYyk7XG4gIHJldHVybiBlbDtcbn1cbiIsInZhciBwYWdlID0gcmVxdWlyZSgncGFnZScpO1xudmFyIGVtcHR5ID0gcmVxdWlyZSgnZW1wdHktZWxlbWVudCcpO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIHRpdGxlID0gcmVxdWlyZSgndGl0bGUnKTtcblxucGFnZSgnL3NpZ25pbicsIGZ1bmN0aW9uIChjdHgsIG5leHQpIHtcbiAgdGl0bGUoJ1BsYXR6aWdyYW0gLSBTaWduIEluJyk7XG4gIHZhciBtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY29udGFpbmVyJyk7XG4gIGVtcHR5KG1haW4pLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbn0pXG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xudmFyIGxhbmRpbmcgPSByZXF1aXJlKCcuLi9sYW5kaW5nJyk7XG5cbi8vbW9kdWxlLmV4cG9ydHMgcGFyYSBkZWNpciBxdWUgZXN0ZSBhcmNoaXZvIGV4cG9ydGEgdG9kbyBlc3RlIGNvbnRlbmlkb1xudmFyIHNpZ25pbkZvcm0gPSB5b2A8ZGl2IGNsYXNzPVwiY29sIHMxMiBtN1wiPlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cInNpZ251cC1ib3hcIj5cbiAgICAgIDxoMSBjbGFzcz1cInBsYXR6aWdyYW1cIj5QbGF0emlncmFtPC9oMT5cblxuICAgICAgPGZvcm0gY2xhc3M9XCJzaWdudXAtZm9ybVwiPlxuXG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGEgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tc21hbGwtb25seVwiPkluaWNpYXIgc2VzacOzbiBjb24gRmFjZWJvb2s8L2E+XG4gICAgICAgICAgPGEgY2xhc3M9XCJidG4gYnRuLWZiIGhpZGUtb24tbWVkLWFuZC11cFwiPjxpIGNsYXNzPVwiZmEgZmEtZmFjZWJvb2stb2ZmaWNpYWxcIj48L2k+IEluaWNpYXIgc2VzacOzbjwvYT5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJkaXZpZGVyXCI+PC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uXCI+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cInVzZXJuYW1lXCIgcGxhY2Vob2xkZXI9XCJOb21icmUgdXN1YXJpb1wiIC8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIG5hbWU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiQ29udHJhc2XDsWFcIiAvPlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gd2F2ZXMtZWZmZWN0IHdhdmVzLWxpZ2h0IGJ0bi1zaWdudXBcIiB0eXBlPVwic3VibWl0XCI+SW5pY2lhIFNlc2lvbjwvYnV0dG9uPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZm9ybT5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJyb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwibG9naW4tYm94XCI+XG4gICAgICDCv05vIHRpZW5lcyB1bmEgY3VlbnRhPyA8YSBocmVmPVwiL3NpZ251cFwiPlJlZ2lzdHJhdGU8L2E+XG4gICAgPC9kaXY+XG4gIDwvZGl2PlxuPC9kaXY+YDtcbm1vZHVsZS5leHBvcnRzID0gbGFuZGluZyhzaWduaW5Gb3JtKTtcbiIsInZhciBwYWdlID0gcmVxdWlyZSgncGFnZScpO1xudmFyIGVtcHR5ID0gcmVxdWlyZSgnZW1wdHktZWxlbWVudCcpO1xudmFyIHRlbXBsYXRlID0gcmVxdWlyZSgnLi90ZW1wbGF0ZScpO1xudmFyIHRpdGxlID0gcmVxdWlyZSgndGl0bGUnKTtcblxucGFnZSgnL3NpZ251cCcsIGZ1bmN0aW9uIChjdHgsIG5leHQpIHtcbiAgdGl0bGUoJ1BsYXR6aWdyYW0gLSBTaWduIFVwJyk7XG4gIHZhciBtYWluID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tY29udGFpbmVyJyk7XG4gIGVtcHR5KG1haW4pLmFwcGVuZENoaWxkKHRlbXBsYXRlKTtcbn0pXG4iLCJ2YXIgeW8gPSByZXF1aXJlKCd5by15bycpO1xudmFyIGxhbmRpbmcgPSByZXF1aXJlKCcuLi9sYW5kaW5nJyk7XG5cbi8vbW9kdWxlLmV4cG9ydHMgcGFyYSBkZWNpciBxdWUgZXN0ZSBhcmNoaXZvIGV4cG9ydGEgdG9kbyBlc3RlIGNvbnRlbmlkb1xudmFyIHNpZ251cEZvcm0gPSB5b2A8ZGl2IGNsYXNzPVwiY29sIHMxMiBtN1wiPlxuICA8ZGl2IGNsYXNzPVwicm93XCI+XG4gICAgPGRpdiBjbGFzcz1cInNpZ251cC1ib3hcIj5cbiAgICAgIDxoMSBjbGFzcz1cInBsYXR6aWdyYW1cIj5QbGF0emlncmFtPC9oMT5cblxuICAgICAgPGZvcm0gY2xhc3M9XCJzaWdudXAtZm9ybVwiPlxuICAgICAgICA8aDIgY2xhc3M9XCJwbGF0emlncmFtLXRleHRcIj5SZWdpc3RyYXRlIHBhcmEgdmVyIGZvdG9zIGRlIHR1cyBhbWlnb3MgZXN0dWRpYW5kbyBlbiBQbGF0emk8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1mYiBoaWRlLW9uLXNtYWxsLW9ubHlcIj5JbmljaWFyIHNlc2nDs24gY29uIEZhY2Vib29rPC9hPlxuICAgICAgICAgIDxhIGNsYXNzPVwiYnRuIGJ0bi1mYiBoaWRlLW9uLW1lZC1hbmQtdXBcIj48aSBjbGFzcz1cImZhIGZhLWZhY2Vib29rLW9mZmljaWFsXCI+PC9pPiBJbmljaWFyIHNlc2nDs248L2E+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZGl2aWRlclwiPjwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvblwiPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZW1haWxcIiBuYW1lPVwiZW1haWxcIiBwbGFjZWhvbGRlcj1cIkNvcnJlbyBlbGVjdHLDs25pY29cIiAvPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJuYW1lXCIgcGxhY2Vob2xkZXI9XCJOb21icmUgY29tcGxldG9cIiAvPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJ1c2VybmFtZVwiIHBsYWNlaG9sZGVyPVwiTm9tYnJlIHVzdWFyaW9cIiAvPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBuYW1lPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIkNvbnRyYXNlw7FhXCIgLz5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIHdhdmVzLWVmZmVjdCB3YXZlcy1saWdodCBidG4tc2lnbnVwXCIgdHlwZT1cInN1Ym1pdFwiPlJlZ8Otc3RyYXRlPC9idXR0b24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9mb3JtPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInJvd1wiPlxuICAgIDxkaXYgY2xhc3M9XCJsb2dpbi1ib3hcIj5cbiAgICAgIMK/VGllbmVzIHVuYSBjdWVudGE/IDxhIGhyZWY9XCIvc2lnbmluXCI+RW50cmFyPC9hPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbjwvZGl2PmA7XG5tb2R1bGUuZXhwb3J0cyA9IGxhbmRpbmcoc2lnbnVwRm9ybSk7XG4iXX0=
