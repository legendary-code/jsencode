(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.JSEncode = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,n=Array(e.length);t<e.length;t++)n[t]=e[t];return n}return Array.from(e)}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(t,n,r){return n&&e(t.prototype,n),r&&e(t,r),t}}(),DecodeStream=function(){function e(t){_classCallCheck(this,e),this._text=t,this._index=0}return _createClass(e,[{key:"reset",value:function(){this._index=0}},{key:"peek",value:function(){return this._index<this._text.length?this._text[this._index]:null}},{key:"next",value:function(){return this._index<this._text.length?this._text[this._index++]:null}},{key:"expect",value:function(e){this.expectNotEof(),this._expect(e,this.next())}},{key:"_expect",value:function(e,t){if(t!==e)throw"expected '"+e+"' at offset "+this._index}},{key:"expectEof",value:function(){if(!this.isEof())throw"expected end of input"}},{key:"expectNotEof",value:function(){if(this.isEof())throw"unexpected end of input"}},{key:"isEof",value:function(){return this._index>=this._text.length}}]),e}(),JSEncoder=function(){function e(t){_classCallCheck(this,e),this._types={},t&&t.types&&this.registerTypes.apply(this,_toConsumableArray(t.types))}return _createClass(e,[{key:"registerTypes",value:function(){var e=!0,t=!1,n=void 0;try{for(var r=arguments.length,o=Array(r),i=0;r>i;i++)o[i]=arguments[i];for(var c,u=o[Symbol.iterator]();!(e=(c=u.next()).done);e=!0){var a=c.value;if(a.constructor!==Function)throw"type"+a+" must be a Function";var s=this._getTypeName(a);if(!s)throw"anonymous type cannot be registered";if(this._types.hasOwnProperty(s))throw"type "+s+" already registered";this._types[s]=a}}catch(l){t=!0,n=l}finally{try{!e&&u["return"]&&u["return"]()}finally{if(t)throw n}}}},{key:"encode",value:function(e){return this._encodeAny(e)}},{key:"_getTypeName",value:function(e){var t=e.name;return void 0===t?this._guessTypeName(e):t||null}},{key:"_guessTypeName",value:function(e){var t=/function\s([^(]{1,})\(/,n=t.exec(e.toString());return n&&n.length>1?n[1].trim():null}},{key:"_canEncode",value:function(e){if(null==e)return!0;switch(e.constructor){case String:case Number:case Boolean:case Array:case Object:return!0;case Function:return!1}return e.constructor.constructor===Function}},{key:"_encodeAny",value:function(e){if(null===e)return this._encodeNull();switch(e.constructor){case String:return this._encodeString(e);case Number:return this._encodeNumber(e);case Boolean:return this._encodeBoolean(e);case Array:return this._encodeArray(e);case Object:return this._encodeDictionary(e);case Function:throw"cannot encode Function"}if(e.constructor.constructor===Function)return this._encodeObject(e);throw"unable to encode unsupported type "+e.constructor.name}},{key:"_encodeNull",value:function(){return"n"}},{key:"_encodeString",value:function(e){return e.length+":"+e}},{key:"_encodeNumber",value:function(e){return"("+e+")"}},{key:"_encodeBoolean",value:function(e){return e?"t":"f"}},{key:"_encodeArray",value:function(e){var t="[",n=!0,r=!1,o=void 0;try{for(var i,c=e[Symbol.iterator]();!(n=(i=c.next()).done);n=!0){var u=i.value;this._canEncode(u)&&(t+=this._encodeAny(u))}}catch(a){r=!0,o=a}finally{try{!n&&c["return"]&&c["return"]()}finally{if(r)throw o}}return t+"]"}},{key:"_encodeDictionary",value:function(e){var t="{";for(var n in e)e.hasOwnProperty(n)&&this._canEncode(e[n])&&(t+=this._encodeString(n),t+=this._encodeAny(e[n]));return t+"}"}},{key:"_encodeObject",value:function(e){var t=this._getTypeName(e.constructor);if(!t)throw"could not determine type for value "+e;var n="<"+this._encodeString(t);for(var r in e)e.hasOwnProperty(r)&&this._canEncode(e[r])&&(n+=this._encodeString(r),n+=this._encodeAny(e[r]));return n+">"}},{key:"decode",value:function(e){var t=new DecodeStream(e),n=this._decodeAny(t);return t.expectEof(),n}},{key:"_decodeAny",value:function(e){switch(e.expectNotEof(),e.peek()){case"n":return this._decodeNull(e);case"(":return this._decodeNumber(e);case"t":case"f":return this._decodeBoolean(e);case"[":return this._decodeArray(e);case"{":return this._decodeDictionary(e);case"<":return this._decodeObject(e)}return this._decodeString(e)}},{key:"_decodeNull",value:function(e){return e.expect("n"),null}},{key:"_decodeString",value:function(e){for(var t="",n="";!e.isEof()&&this._isNumber(e.peek());)t+=e.next();var r=Number(t);if(Math.floor(r)!==r||0>r)throw t+" is not a valid length value for string";e.expect(":");for(var o=0;r>o;++o)e.expectNotEof(),n+=e.next();return n}},{key:"_decodeNumber",value:function(e){var t="";for(e.expect("(");!e.isEof()&&")"!=e.peek();)t+=e.next();e.expect(")");var n=Number(t);if(isNaN(n))throw t+" is not a valid Number value";return n}},{key:"_decodeBoolean",value:function(e){if(e.expectNotEof(),e.peek("t")||e.peek("f"))return"t"===e.next();throw e.peek()+" is not a valid Boolean value"}},{key:"_decodeArray",value:function(e){var t=[];for(e.expect("[");!e.isEof()&&"]"!=e.peek();)t.push(this._decodeAny(e));return e.expect("]"),t}},{key:"_decodeDictionary",value:function(e){var t={};for(e.expect("{");!e.isEof()&&"}"!=e.peek();){var n=this._decodeString(e);t[n]=this._decodeAny(e)}return e.expect("}"),t}},{key:"_decodeObject",value:function(e){e.expect("<");var t=this._decodeString(e);if(!this._types.hasOwnProperty(t))throw t+" is not a known registered type";for(var n=this._types[t],r=new n;!e.isEof()&&">"!=e.peek();){var o=this._decodeString(e);r[o]=this._decodeAny(e)}return e.expect(">"),r}},{key:"_isNumber",value:function(e){return!isNaN(Number(e))}}]),e}();exports["default"]=JSEncoder,module.exports=exports["default"];

},{}]},{},[1])(1)
});