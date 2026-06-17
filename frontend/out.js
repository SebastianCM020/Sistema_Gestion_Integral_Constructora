var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all3) => {
  for (var name in all3)
    __defProp(target, name, { get: all3[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/axios/lib/helpers/bind.js
function bind(fn, thisArg) {
  return function wrap() {
    return fn.apply(thisArg, arguments);
  };
}
var init_bind = __esm({
  "node_modules/axios/lib/helpers/bind.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/utils.js
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor) && isFunction(val.constructor.isBuffer) && val.constructor.isBuffer(val);
}
function isArrayBufferView(val) {
  let result;
  if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
    result = ArrayBuffer.isView(val);
  } else {
    result = val && val.buffer && isArrayBuffer(val.buffer);
  }
  return result;
}
function getGlobal() {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  return {};
}
function forEach(obj, fn, { allOwnKeys = false } = {}) {
  if (obj === null || typeof obj === "undefined") {
    return;
  }
  let i;
  let l;
  if (typeof obj !== "object") {
    obj = [obj];
  }
  if (isArray(obj)) {
    for (i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    if (isBuffer(obj)) {
      return;
    }
    const keys = allOwnKeys ? Object.getOwnPropertyNames(obj) : Object.keys(obj);
    const len = keys.length;
    let key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      fn.call(null, obj[key], key, obj);
    }
  }
}
function findKey(obj, key) {
  if (isBuffer(obj)) {
    return null;
  }
  key = key.toLowerCase();
  const keys = Object.keys(obj);
  let i = keys.length;
  let _key;
  while (i-- > 0) {
    _key = keys[i];
    if (key === _key.toLowerCase()) {
      return _key;
    }
  }
  return null;
}
function merge(...objs) {
  const { caseless, skipUndefined } = isContextDefined(this) && this || {};
  const result = {};
  const assignValue = (val, key) => {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return;
    }
    const targetKey = caseless && findKey(result, key) || key;
    const existing = hasOwnProperty(result, targetKey) ? result[targetKey] : void 0;
    if (isPlainObject(existing) && isPlainObject(val)) {
      result[targetKey] = merge(existing, val);
    } else if (isPlainObject(val)) {
      result[targetKey] = merge({}, val);
    } else if (isArray(val)) {
      result[targetKey] = val.slice();
    } else if (!skipUndefined || !isUndefined(val)) {
      result[targetKey] = val;
    }
  };
  for (let i = 0, l = objs.length; i < l; i++) {
    objs[i] && forEach(objs[i], assignValue);
  }
  return result;
}
function isSpecCompliantForm(thing) {
  return !!(thing && isFunction(thing.append) && thing[toStringTag] === "FormData" && thing[iterator]);
}
var toString, getPrototypeOf, iterator, toStringTag, kindOf, kindOfTest, typeOfTest, isArray, isUndefined, isArrayBuffer, isString, isFunction, isNumber, isObject, isBoolean, isPlainObject, isEmptyObject, isDate, isFile, isReactNativeBlob, isReactNative, isBlob, isFileList, isStream, G, FormDataCtor, isFormData, isURLSearchParams, isReadableStream, isRequest, isResponse, isHeaders, trim, _global, isContextDefined, extend, stripBOM, inherits, toFlatObject, endsWith, toArray, isTypedArray, forEachEntry, matchAll, isHTMLForm, toCamelCase, hasOwnProperty, isRegExp, reduceDescriptors, freezeMethods, toObjectSet, noop, toFiniteNumber, toJSONObject, isAsyncFn, isThenable, _setImmediate, asap, isIterable, utils_default;
var init_utils = __esm({
  "node_modules/axios/lib/utils.js"() {
    "use strict";
    init_bind();
    ({ toString } = Object.prototype);
    ({ getPrototypeOf } = Object);
    ({ iterator, toStringTag } = Symbol);
    kindOf = /* @__PURE__ */ ((cache) => (thing) => {
      const str = toString.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    })(/* @__PURE__ */ Object.create(null));
    kindOfTest = (type) => {
      type = type.toLowerCase();
      return (thing) => kindOf(thing) === type;
    };
    typeOfTest = (type) => (thing) => typeof thing === type;
    ({ isArray } = Array);
    isUndefined = typeOfTest("undefined");
    isArrayBuffer = kindOfTest("ArrayBuffer");
    isString = typeOfTest("string");
    isFunction = typeOfTest("function");
    isNumber = typeOfTest("number");
    isObject = (thing) => thing !== null && typeof thing === "object";
    isBoolean = (thing) => thing === true || thing === false;
    isPlainObject = (val) => {
      if (kindOf(val) !== "object") {
        return false;
      }
      const prototype2 = getPrototypeOf(val);
      return (prototype2 === null || prototype2 === Object.prototype || Object.getPrototypeOf(prototype2) === null) && !(toStringTag in val) && !(iterator in val);
    };
    isEmptyObject = (val) => {
      if (!isObject(val) || isBuffer(val)) {
        return false;
      }
      try {
        return Object.keys(val).length === 0 && Object.getPrototypeOf(val) === Object.prototype;
      } catch (e) {
        return false;
      }
    };
    isDate = kindOfTest("Date");
    isFile = kindOfTest("File");
    isReactNativeBlob = (value) => {
      return !!(value && typeof value.uri !== "undefined");
    };
    isReactNative = (formData) => formData && typeof formData.getParts !== "undefined";
    isBlob = kindOfTest("Blob");
    isFileList = kindOfTest("FileList");
    isStream = (val) => isObject(val) && isFunction(val.pipe);
    G = getGlobal();
    FormDataCtor = typeof G.FormData !== "undefined" ? G.FormData : void 0;
    isFormData = (thing) => {
      if (!thing) return false;
      if (FormDataCtor && thing instanceof FormDataCtor) return true;
      const proto = getPrototypeOf(thing);
      if (!proto || proto === Object.prototype) return false;
      if (!isFunction(thing.append)) return false;
      const kind = kindOf(thing);
      return kind === "formdata" || // detect form-data instance
      kind === "object" && isFunction(thing.toString) && thing.toString() === "[object FormData]";
    };
    isURLSearchParams = kindOfTest("URLSearchParams");
    [isReadableStream, isRequest, isResponse, isHeaders] = [
      "ReadableStream",
      "Request",
      "Response",
      "Headers"
    ].map(kindOfTest);
    trim = (str) => {
      return str.trim ? str.trim() : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
    };
    _global = (() => {
      if (typeof globalThis !== "undefined") return globalThis;
      return typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
    })();
    isContextDefined = (context) => !isUndefined(context) && context !== _global;
    extend = (a, b, thisArg, { allOwnKeys } = {}) => {
      forEach(
        b,
        (val, key) => {
          if (thisArg && isFunction(val)) {
            Object.defineProperty(a, key, {
              // Null-proto descriptor so a polluted Object.prototype.get cannot
              // hijack defineProperty's accessor-vs-data resolution.
              __proto__: null,
              value: bind(val, thisArg),
              writable: true,
              enumerable: true,
              configurable: true
            });
          } else {
            Object.defineProperty(a, key, {
              __proto__: null,
              value: val,
              writable: true,
              enumerable: true,
              configurable: true
            });
          }
        },
        { allOwnKeys }
      );
      return a;
    };
    stripBOM = (content) => {
      if (content.charCodeAt(0) === 65279) {
        content = content.slice(1);
      }
      return content;
    };
    inherits = (constructor, superConstructor, props, descriptors) => {
      constructor.prototype = Object.create(superConstructor.prototype, descriptors);
      Object.defineProperty(constructor.prototype, "constructor", {
        __proto__: null,
        value: constructor,
        writable: true,
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(constructor, "super", {
        __proto__: null,
        value: superConstructor.prototype
      });
      props && Object.assign(constructor.prototype, props);
    };
    toFlatObject = (sourceObj, destObj, filter2, propFilter) => {
      let props;
      let i;
      let prop;
      const merged = {};
      destObj = destObj || {};
      if (sourceObj == null) return destObj;
      do {
        props = Object.getOwnPropertyNames(sourceObj);
        i = props.length;
        while (i-- > 0) {
          prop = props[i];
          if ((!propFilter || propFilter(prop, sourceObj, destObj)) && !merged[prop]) {
            destObj[prop] = sourceObj[prop];
            merged[prop] = true;
          }
        }
        sourceObj = filter2 !== false && getPrototypeOf(sourceObj);
      } while (sourceObj && (!filter2 || filter2(sourceObj, destObj)) && sourceObj !== Object.prototype);
      return destObj;
    };
    endsWith = (str, searchString, position) => {
      str = String(str);
      if (position === void 0 || position > str.length) {
        position = str.length;
      }
      position -= searchString.length;
      const lastIndex = str.indexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
    };
    toArray = (thing) => {
      if (!thing) return null;
      if (isArray(thing)) return thing;
      let i = thing.length;
      if (!isNumber(i)) return null;
      const arr = new Array(i);
      while (i-- > 0) {
        arr[i] = thing[i];
      }
      return arr;
    };
    isTypedArray = /* @__PURE__ */ ((TypedArray) => {
      return (thing) => {
        return TypedArray && thing instanceof TypedArray;
      };
    })(typeof Uint8Array !== "undefined" && getPrototypeOf(Uint8Array));
    forEachEntry = (obj, fn) => {
      const generator = obj && obj[iterator];
      const _iterator = generator.call(obj);
      let result;
      while ((result = _iterator.next()) && !result.done) {
        const pair = result.value;
        fn.call(obj, pair[0], pair[1]);
      }
    };
    matchAll = (regExp, str) => {
      let matches;
      const arr = [];
      while ((matches = regExp.exec(str)) !== null) {
        arr.push(matches);
      }
      return arr;
    };
    isHTMLForm = kindOfTest("HTMLFormElement");
    toCamelCase = (str) => {
      return str.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function replacer(m, p1, p2) {
        return p1.toUpperCase() + p2;
      });
    };
    hasOwnProperty = (({ hasOwnProperty: hasOwnProperty2 }) => (obj, prop) => hasOwnProperty2.call(obj, prop))(Object.prototype);
    isRegExp = kindOfTest("RegExp");
    reduceDescriptors = (obj, reducer) => {
      const descriptors = Object.getOwnPropertyDescriptors(obj);
      const reducedDescriptors = {};
      forEach(descriptors, (descriptor, name) => {
        let ret;
        if ((ret = reducer(descriptor, name, obj)) !== false) {
          reducedDescriptors[name] = ret || descriptor;
        }
      });
      Object.defineProperties(obj, reducedDescriptors);
    };
    freezeMethods = (obj) => {
      reduceDescriptors(obj, (descriptor, name) => {
        if (isFunction(obj) && ["arguments", "caller", "callee"].includes(name)) {
          return false;
        }
        const value = obj[name];
        if (!isFunction(value)) return;
        descriptor.enumerable = false;
        if ("writable" in descriptor) {
          descriptor.writable = false;
          return;
        }
        if (!descriptor.set) {
          descriptor.set = () => {
            throw Error("Can not rewrite read-only method '" + name + "'");
          };
        }
      });
    };
    toObjectSet = (arrayOrString, delimiter) => {
      const obj = {};
      const define2 = (arr) => {
        arr.forEach((value) => {
          obj[value] = true;
        });
      };
      isArray(arrayOrString) ? define2(arrayOrString) : define2(String(arrayOrString).split(delimiter));
      return obj;
    };
    noop = () => {
    };
    toFiniteNumber = (value, defaultValue) => {
      return value != null && Number.isFinite(value = +value) ? value : defaultValue;
    };
    toJSONObject = (obj) => {
      const stack = new Array(10);
      const visit = (source, i) => {
        if (isObject(source)) {
          if (stack.indexOf(source) >= 0) {
            return;
          }
          if (isBuffer(source)) {
            return source;
          }
          if (!("toJSON" in source)) {
            stack[i] = source;
            const target = isArray(source) ? [] : {};
            forEach(source, (value, key) => {
              const reducedValue = visit(value, i + 1);
              !isUndefined(reducedValue) && (target[key] = reducedValue);
            });
            stack[i] = void 0;
            return target;
          }
        }
        return source;
      };
      return visit(obj, 0);
    };
    isAsyncFn = kindOfTest("AsyncFunction");
    isThenable = (thing) => thing && (isObject(thing) || isFunction(thing)) && isFunction(thing.then) && isFunction(thing.catch);
    _setImmediate = ((setImmediateSupported, postMessageSupported) => {
      if (setImmediateSupported) {
        return setImmediate;
      }
      return postMessageSupported ? ((token, callbacks) => {
        _global.addEventListener(
          "message",
          ({ source, data }) => {
            if (source === _global && data === token) {
              callbacks.length && callbacks.shift()();
            }
          },
          false
        );
        return (cb) => {
          callbacks.push(cb);
          _global.postMessage(token, "*");
        };
      })(`axios@${Math.random()}`, []) : (cb) => setTimeout(cb);
    })(typeof setImmediate === "function", isFunction(_global.postMessage));
    asap = typeof queueMicrotask !== "undefined" ? queueMicrotask.bind(_global) : typeof process !== "undefined" && process.nextTick || _setImmediate;
    isIterable = (thing) => thing != null && isFunction(thing[iterator]);
    utils_default = {
      isArray,
      isArrayBuffer,
      isBuffer,
      isFormData,
      isArrayBufferView,
      isString,
      isNumber,
      isBoolean,
      isObject,
      isPlainObject,
      isEmptyObject,
      isReadableStream,
      isRequest,
      isResponse,
      isHeaders,
      isUndefined,
      isDate,
      isFile,
      isReactNativeBlob,
      isReactNative,
      isBlob,
      isRegExp,
      isFunction,
      isStream,
      isURLSearchParams,
      isTypedArray,
      isFileList,
      forEach,
      merge,
      extend,
      trim,
      stripBOM,
      inherits,
      toFlatObject,
      kindOf,
      kindOfTest,
      endsWith,
      toArray,
      forEachEntry,
      matchAll,
      isHTMLForm,
      hasOwnProperty,
      hasOwnProp: hasOwnProperty,
      // an alias to avoid ESLint no-prototype-builtins detection
      reduceDescriptors,
      freezeMethods,
      toObjectSet,
      toCamelCase,
      noop,
      toFiniteNumber,
      findKey,
      global: _global,
      isContextDefined,
      isSpecCompliantForm,
      toJSONObject,
      isAsyncFn,
      isThenable,
      setImmediate: _setImmediate,
      asap,
      isIterable
    };
  }
});

// node_modules/axios/lib/helpers/parseHeaders.js
var ignoreDuplicateOf, parseHeaders_default;
var init_parseHeaders = __esm({
  "node_modules/axios/lib/helpers/parseHeaders.js"() {
    "use strict";
    init_utils();
    ignoreDuplicateOf = utils_default.toObjectSet([
      "age",
      "authorization",
      "content-length",
      "content-type",
      "etag",
      "expires",
      "from",
      "host",
      "if-modified-since",
      "if-unmodified-since",
      "last-modified",
      "location",
      "max-forwards",
      "proxy-authorization",
      "referer",
      "retry-after",
      "user-agent"
    ]);
    parseHeaders_default = (rawHeaders) => {
      const parsed = {};
      let key;
      let val;
      let i;
      rawHeaders && rawHeaders.split("\n").forEach(function parser(line) {
        i = line.indexOf(":");
        key = line.substring(0, i).trim().toLowerCase();
        val = line.substring(i + 1).trim();
        if (!key || parsed[key] && ignoreDuplicateOf[key]) {
          return;
        }
        if (key === "set-cookie") {
          if (parsed[key]) {
            parsed[key].push(val);
          } else {
            parsed[key] = [val];
          }
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
        }
      });
      return parsed;
    };
  }
});

// node_modules/axios/lib/core/AxiosHeaders.js
function trimSPorHTAB(str) {
  let start = 0;
  let end = str.length;
  while (start < end) {
    const code = str.charCodeAt(start);
    if (code !== 9 && code !== 32) {
      break;
    }
    start += 1;
  }
  while (end > start) {
    const code = str.charCodeAt(end - 1);
    if (code !== 9 && code !== 32) {
      break;
    }
    end -= 1;
  }
  return start === 0 && end === str.length ? str : str.slice(start, end);
}
function normalizeHeader(header) {
  return header && String(header).trim().toLowerCase();
}
function sanitizeHeaderValue(str) {
  return trimSPorHTAB(str.replace(INVALID_HEADER_VALUE_CHARS_RE, ""));
}
function normalizeValue(value) {
  if (value === false || value == null) {
    return value;
  }
  return utils_default.isArray(value) ? value.map(normalizeValue) : sanitizeHeaderValue(String(value));
}
function parseTokens(str) {
  const tokens = /* @__PURE__ */ Object.create(null);
  const tokensRE = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let match;
  while (match = tokensRE.exec(str)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}
function matchHeaderValue(context, value, header, filter2, isHeaderNameFilter) {
  if (utils_default.isFunction(filter2)) {
    return filter2.call(this, value, header);
  }
  if (isHeaderNameFilter) {
    value = header;
  }
  if (!utils_default.isString(value)) return;
  if (utils_default.isString(filter2)) {
    return value.indexOf(filter2) !== -1;
  }
  if (utils_default.isRegExp(filter2)) {
    return filter2.test(value);
  }
}
function formatHeader(header) {
  return header.trim().toLowerCase().replace(/([a-z\d])(\w*)/g, (w, char, str) => {
    return char.toUpperCase() + str;
  });
}
function buildAccessors(obj, header) {
  const accessorName = utils_default.toCamelCase(" " + header);
  ["get", "set", "has"].forEach((methodName) => {
    Object.defineProperty(obj, methodName + accessorName, {
      // Null-proto descriptor so a polluted Object.prototype.get cannot turn
      // this data descriptor into an accessor descriptor on the way in.
      __proto__: null,
      value: function(arg1, arg2, arg3) {
        return this[methodName].call(this, header, arg1, arg2, arg3);
      },
      configurable: true
    });
  });
}
var $internals, INVALID_HEADER_VALUE_CHARS_RE, isValidHeaderName, AxiosHeaders, AxiosHeaders_default;
var init_AxiosHeaders = __esm({
  "node_modules/axios/lib/core/AxiosHeaders.js"() {
    "use strict";
    init_utils();
    init_parseHeaders();
    $internals = /* @__PURE__ */ Symbol("internals");
    INVALID_HEADER_VALUE_CHARS_RE = /[^\x09\x20-\x7E\x80-\xFF]/g;
    isValidHeaderName = (str) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(str.trim());
    AxiosHeaders = class {
      constructor(headers) {
        headers && this.set(headers);
      }
      set(header, valueOrRewrite, rewrite) {
        const self2 = this;
        function setHeader(_value, _header, _rewrite) {
          const lHeader = normalizeHeader(_header);
          if (!lHeader) {
            throw new Error("header name must be a non-empty string");
          }
          const key = utils_default.findKey(self2, lHeader);
          if (!key || self2[key] === void 0 || _rewrite === true || _rewrite === void 0 && self2[key] !== false) {
            self2[key || _header] = normalizeValue(_value);
          }
        }
        const setHeaders = (headers, _rewrite) => utils_default.forEach(headers, (_value, _header) => setHeader(_value, _header, _rewrite));
        if (utils_default.isPlainObject(header) || header instanceof this.constructor) {
          setHeaders(header, valueOrRewrite);
        } else if (utils_default.isString(header) && (header = header.trim()) && !isValidHeaderName(header)) {
          setHeaders(parseHeaders_default(header), valueOrRewrite);
        } else if (utils_default.isObject(header) && utils_default.isIterable(header)) {
          let obj = {}, dest, key;
          for (const entry of header) {
            if (!utils_default.isArray(entry)) {
              throw TypeError("Object iterator must return a key-value pair");
            }
            obj[key = entry[0]] = (dest = obj[key]) ? utils_default.isArray(dest) ? [...dest, entry[1]] : [dest, entry[1]] : entry[1];
          }
          setHeaders(obj, valueOrRewrite);
        } else {
          header != null && setHeader(valueOrRewrite, header, rewrite);
        }
        return this;
      }
      get(header, parser) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils_default.findKey(this, header);
          if (key) {
            const value = this[key];
            if (!parser) {
              return value;
            }
            if (parser === true) {
              return parseTokens(value);
            }
            if (utils_default.isFunction(parser)) {
              return parser.call(this, value, key);
            }
            if (utils_default.isRegExp(parser)) {
              return parser.exec(value);
            }
            throw new TypeError("parser must be boolean|regexp|function");
          }
        }
      }
      has(header, matcher) {
        header = normalizeHeader(header);
        if (header) {
          const key = utils_default.findKey(this, header);
          return !!(key && this[key] !== void 0 && (!matcher || matchHeaderValue(this, this[key], key, matcher)));
        }
        return false;
      }
      delete(header, matcher) {
        const self2 = this;
        let deleted = false;
        function deleteHeader(_header) {
          _header = normalizeHeader(_header);
          if (_header) {
            const key = utils_default.findKey(self2, _header);
            if (key && (!matcher || matchHeaderValue(self2, self2[key], key, matcher))) {
              delete self2[key];
              deleted = true;
            }
          }
        }
        if (utils_default.isArray(header)) {
          header.forEach(deleteHeader);
        } else {
          deleteHeader(header);
        }
        return deleted;
      }
      clear(matcher) {
        const keys = Object.keys(this);
        let i = keys.length;
        let deleted = false;
        while (i--) {
          const key = keys[i];
          if (!matcher || matchHeaderValue(this, this[key], key, matcher, true)) {
            delete this[key];
            deleted = true;
          }
        }
        return deleted;
      }
      normalize(format) {
        const self2 = this;
        const headers = {};
        utils_default.forEach(this, (value, header) => {
          const key = utils_default.findKey(headers, header);
          if (key) {
            self2[key] = normalizeValue(value);
            delete self2[header];
            return;
          }
          const normalized = format ? formatHeader(header) : String(header).trim();
          if (normalized !== header) {
            delete self2[header];
          }
          self2[normalized] = normalizeValue(value);
          headers[normalized] = true;
        });
        return this;
      }
      concat(...targets) {
        return this.constructor.concat(this, ...targets);
      }
      toJSON(asStrings) {
        const obj = /* @__PURE__ */ Object.create(null);
        utils_default.forEach(this, (value, header) => {
          value != null && value !== false && (obj[header] = asStrings && utils_default.isArray(value) ? value.join(", ") : value);
        });
        return obj;
      }
      [Symbol.iterator]() {
        return Object.entries(this.toJSON())[Symbol.iterator]();
      }
      toString() {
        return Object.entries(this.toJSON()).map(([header, value]) => header + ": " + value).join("\n");
      }
      getSetCookie() {
        return this.get("set-cookie") || [];
      }
      get [Symbol.toStringTag]() {
        return "AxiosHeaders";
      }
      static from(thing) {
        return thing instanceof this ? thing : new this(thing);
      }
      static concat(first, ...targets) {
        const computed = new this(first);
        targets.forEach((target) => computed.set(target));
        return computed;
      }
      static accessor(header) {
        const internals = this[$internals] = this[$internals] = {
          accessors: {}
        };
        const accessors = internals.accessors;
        const prototype2 = this.prototype;
        function defineAccessor(_header) {
          const lHeader = normalizeHeader(_header);
          if (!accessors[lHeader]) {
            buildAccessors(prototype2, _header);
            accessors[lHeader] = true;
          }
        }
        utils_default.isArray(header) ? header.forEach(defineAccessor) : defineAccessor(header);
        return this;
      }
    };
    AxiosHeaders.accessor([
      "Content-Type",
      "Content-Length",
      "Accept",
      "Accept-Encoding",
      "User-Agent",
      "Authorization"
    ]);
    utils_default.reduceDescriptors(AxiosHeaders.prototype, ({ value }, key) => {
      let mapped = key[0].toUpperCase() + key.slice(1);
      return {
        get: () => value,
        set(headerValue) {
          this[mapped] = headerValue;
        }
      };
    });
    utils_default.freezeMethods(AxiosHeaders);
    AxiosHeaders_default = AxiosHeaders;
  }
});

// node_modules/axios/lib/core/AxiosError.js
function hasOwnOrPrototypeToJSON(source) {
  if (utils_default.hasOwnProp(source, "toJSON")) {
    return true;
  }
  let prototype2 = Object.getPrototypeOf(source);
  while (prototype2 && prototype2 !== Object.prototype) {
    if (utils_default.hasOwnProp(prototype2, "toJSON")) {
      return true;
    }
    prototype2 = Object.getPrototypeOf(prototype2);
  }
  return false;
}
function redactConfig(config, redactKeys) {
  const lowerKeys = new Set(redactKeys.map((k) => String(k).toLowerCase()));
  const seen = [];
  const visit = (source) => {
    if (source === null || typeof source !== "object") return source;
    if (utils_default.isBuffer(source)) return source;
    if (seen.indexOf(source) !== -1) return void 0;
    if (source instanceof AxiosHeaders_default) {
      source = source.toJSON();
    }
    seen.push(source);
    let result;
    if (utils_default.isArray(source)) {
      result = [];
      source.forEach((v, i) => {
        const reducedValue = visit(v);
        if (!utils_default.isUndefined(reducedValue)) {
          result[i] = reducedValue;
        }
      });
    } else {
      if (!utils_default.isPlainObject(source) && hasOwnOrPrototypeToJSON(source)) {
        seen.pop();
        return source;
      }
      result = /* @__PURE__ */ Object.create(null);
      for (const [key, value] of Object.entries(source)) {
        const reducedValue = lowerKeys.has(key.toLowerCase()) ? REDACTED : visit(value);
        if (!utils_default.isUndefined(reducedValue)) {
          result[key] = reducedValue;
        }
      }
    }
    seen.pop();
    return result;
  };
  return visit(config);
}
var REDACTED, AxiosError, AxiosError_default;
var init_AxiosError = __esm({
  "node_modules/axios/lib/core/AxiosError.js"() {
    "use strict";
    init_utils();
    init_AxiosHeaders();
    REDACTED = "[REDACTED ****]";
    AxiosError = class _AxiosError extends Error {
      static from(error, code, config, request, response, customProps) {
        const axiosError = new _AxiosError(error.message, code || error.code, config, request, response);
        axiosError.cause = error;
        axiosError.name = error.name;
        if (error.status != null && axiosError.status == null) {
          axiosError.status = error.status;
        }
        customProps && Object.assign(axiosError, customProps);
        return axiosError;
      }
      /**
       * Create an Error with the specified message, config, error code, request and response.
       *
       * @param {string} message The error message.
       * @param {string} [code] The error code (for example, 'ECONNABORTED').
       * @param {Object} [config] The config.
       * @param {Object} [request] The request.
       * @param {Object} [response] The response.
       *
       * @returns {Error} The created error.
       */
      constructor(message, code, config, request, response) {
        super(message);
        Object.defineProperty(this, "message", {
          // Null-proto descriptor so a polluted Object.prototype.get cannot turn
          // this data descriptor into an accessor descriptor on the way in.
          __proto__: null,
          value: message,
          enumerable: true,
          writable: true,
          configurable: true
        });
        this.name = "AxiosError";
        this.isAxiosError = true;
        code && (this.code = code);
        config && (this.config = config);
        request && (this.request = request);
        if (response) {
          this.response = response;
          this.status = response.status;
        }
      }
      toJSON() {
        const config = this.config;
        const redactKeys = config && utils_default.hasOwnProp(config, "redact") ? config.redact : void 0;
        const serializedConfig = utils_default.isArray(redactKeys) && redactKeys.length > 0 ? redactConfig(config, redactKeys) : utils_default.toJSONObject(config);
        return {
          // Standard
          message: this.message,
          name: this.name,
          // Microsoft
          description: this.description,
          number: this.number,
          // Mozilla
          fileName: this.fileName,
          lineNumber: this.lineNumber,
          columnNumber: this.columnNumber,
          stack: this.stack,
          // Axios
          config: serializedConfig,
          code: this.code,
          status: this.status
        };
      }
    };
    AxiosError.ERR_BAD_OPTION_VALUE = "ERR_BAD_OPTION_VALUE";
    AxiosError.ERR_BAD_OPTION = "ERR_BAD_OPTION";
    AxiosError.ECONNABORTED = "ECONNABORTED";
    AxiosError.ETIMEDOUT = "ETIMEDOUT";
    AxiosError.ECONNREFUSED = "ECONNREFUSED";
    AxiosError.ERR_NETWORK = "ERR_NETWORK";
    AxiosError.ERR_FR_TOO_MANY_REDIRECTS = "ERR_FR_TOO_MANY_REDIRECTS";
    AxiosError.ERR_DEPRECATED = "ERR_DEPRECATED";
    AxiosError.ERR_BAD_RESPONSE = "ERR_BAD_RESPONSE";
    AxiosError.ERR_BAD_REQUEST = "ERR_BAD_REQUEST";
    AxiosError.ERR_CANCELED = "ERR_CANCELED";
    AxiosError.ERR_NOT_SUPPORT = "ERR_NOT_SUPPORT";
    AxiosError.ERR_INVALID_URL = "ERR_INVALID_URL";
    AxiosError.ERR_FORM_DATA_DEPTH_EXCEEDED = "ERR_FORM_DATA_DEPTH_EXCEEDED";
    AxiosError_default = AxiosError;
  }
});

// node_modules/axios/lib/helpers/null.js
var null_default;
var init_null = __esm({
  "node_modules/axios/lib/helpers/null.js"() {
    null_default = null;
  }
});

// node_modules/axios/lib/helpers/toFormData.js
function isVisitable(thing) {
  return utils_default.isPlainObject(thing) || utils_default.isArray(thing);
}
function removeBrackets(key) {
  return utils_default.endsWith(key, "[]") ? key.slice(0, -2) : key;
}
function renderKey(path, key, dots) {
  if (!path) return key;
  return path.concat(key).map(function each(token, i) {
    token = removeBrackets(token);
    return !dots && i ? "[" + token + "]" : token;
  }).join(dots ? "." : "");
}
function isFlatArray(arr) {
  return utils_default.isArray(arr) && !arr.some(isVisitable);
}
function toFormData(obj, formData, options) {
  if (!utils_default.isObject(obj)) {
    throw new TypeError("target must be an object");
  }
  formData = formData || new (null_default || FormData)();
  options = utils_default.toFlatObject(
    options,
    {
      metaTokens: true,
      dots: false,
      indexes: false
    },
    false,
    function defined(option, source) {
      return !utils_default.isUndefined(source[option]);
    }
  );
  const metaTokens = options.metaTokens;
  const visitor = options.visitor || defaultVisitor;
  const dots = options.dots;
  const indexes = options.indexes;
  const _Blob = options.Blob || typeof Blob !== "undefined" && Blob;
  const maxDepth = options.maxDepth === void 0 ? 100 : options.maxDepth;
  const useBlob = _Blob && utils_default.isSpecCompliantForm(formData);
  if (!utils_default.isFunction(visitor)) {
    throw new TypeError("visitor must be a function");
  }
  function convertValue(value) {
    if (value === null) return "";
    if (utils_default.isDate(value)) {
      return value.toISOString();
    }
    if (utils_default.isBoolean(value)) {
      return value.toString();
    }
    if (!useBlob && utils_default.isBlob(value)) {
      throw new AxiosError_default("Blob is not supported. Use a Buffer instead.");
    }
    if (utils_default.isArrayBuffer(value) || utils_default.isTypedArray(value)) {
      return useBlob && typeof Blob === "function" ? new Blob([value]) : Buffer.from(value);
    }
    return value;
  }
  function defaultVisitor(value, key, path) {
    let arr = value;
    if (utils_default.isReactNative(formData) && utils_default.isReactNativeBlob(value)) {
      formData.append(renderKey(path, key, dots), convertValue(value));
      return false;
    }
    if (value && !path && typeof value === "object") {
      if (utils_default.endsWith(key, "{}")) {
        key = metaTokens ? key : key.slice(0, -2);
        value = JSON.stringify(value);
      } else if (utils_default.isArray(value) && isFlatArray(value) || (utils_default.isFileList(value) || utils_default.endsWith(key, "[]")) && (arr = utils_default.toArray(value))) {
        key = removeBrackets(key);
        arr.forEach(function each(el, index) {
          !(utils_default.isUndefined(el) || el === null) && formData.append(
            // eslint-disable-next-line no-nested-ternary
            indexes === true ? renderKey([key], index, dots) : indexes === null ? key : key + "[]",
            convertValue(el)
          );
        });
        return false;
      }
    }
    if (isVisitable(value)) {
      return true;
    }
    formData.append(renderKey(path, key, dots), convertValue(value));
    return false;
  }
  const stack = [];
  const exposedHelpers = Object.assign(predicates, {
    defaultVisitor,
    convertValue,
    isVisitable
  });
  function build(value, path, depth = 0) {
    if (utils_default.isUndefined(value)) return;
    if (depth > maxDepth) {
      throw new AxiosError_default(
        "Object is too deeply nested (" + depth + " levels). Max depth: " + maxDepth,
        AxiosError_default.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
    }
    if (stack.indexOf(value) !== -1) {
      throw Error("Circular reference detected in " + path.join("."));
    }
    stack.push(value);
    utils_default.forEach(value, function each(el, key) {
      const result = !(utils_default.isUndefined(el) || el === null) && visitor.call(formData, el, utils_default.isString(key) ? key.trim() : key, path, exposedHelpers);
      if (result === true) {
        build(el, path ? path.concat(key) : [key], depth + 1);
      }
    });
    stack.pop();
  }
  if (!utils_default.isObject(obj)) {
    throw new TypeError("data must be an object");
  }
  build(obj);
  return formData;
}
var predicates, toFormData_default;
var init_toFormData = __esm({
  "node_modules/axios/lib/helpers/toFormData.js"() {
    "use strict";
    init_utils();
    init_AxiosError();
    init_null();
    predicates = utils_default.toFlatObject(utils_default, {}, null, function filter(prop) {
      return /^is[A-Z]/.test(prop);
    });
    toFormData_default = toFormData;
  }
});

// node_modules/axios/lib/helpers/AxiosURLSearchParams.js
function encode(str) {
  const charMap = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+"
  };
  return encodeURIComponent(str).replace(/[!'()~]|%20/g, function replacer(match) {
    return charMap[match];
  });
}
function AxiosURLSearchParams(params, options) {
  this._pairs = [];
  params && toFormData_default(params, this, options);
}
var prototype, AxiosURLSearchParams_default;
var init_AxiosURLSearchParams = __esm({
  "node_modules/axios/lib/helpers/AxiosURLSearchParams.js"() {
    "use strict";
    init_toFormData();
    prototype = AxiosURLSearchParams.prototype;
    prototype.append = function append(name, value) {
      this._pairs.push([name, value]);
    };
    prototype.toString = function toString2(encoder) {
      const _encode = encoder ? function(value) {
        return encoder.call(this, value, encode);
      } : encode;
      return this._pairs.map(function each(pair) {
        return _encode(pair[0]) + "=" + _encode(pair[1]);
      }, "").join("&");
    };
    AxiosURLSearchParams_default = AxiosURLSearchParams;
  }
});

// node_modules/axios/lib/helpers/buildURL.js
function encode2(val) {
  return encodeURIComponent(val).replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, "+");
}
function buildURL(url, params, options) {
  if (!params) {
    return url;
  }
  const _encode = options && options.encode || encode2;
  const _options = utils_default.isFunction(options) ? {
    serialize: options
  } : options;
  const serializeFn = _options && _options.serialize;
  let serializedParams;
  if (serializeFn) {
    serializedParams = serializeFn(params, _options);
  } else {
    serializedParams = utils_default.isURLSearchParams(params) ? params.toString() : new AxiosURLSearchParams_default(params, _options).toString(_encode);
  }
  if (serializedParams) {
    const hashmarkIndex = url.indexOf("#");
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }
    url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
  }
  return url;
}
var init_buildURL = __esm({
  "node_modules/axios/lib/helpers/buildURL.js"() {
    "use strict";
    init_utils();
    init_AxiosURLSearchParams();
  }
});

// node_modules/axios/lib/core/InterceptorManager.js
var InterceptorManager, InterceptorManager_default;
var init_InterceptorManager = __esm({
  "node_modules/axios/lib/core/InterceptorManager.js"() {
    "use strict";
    init_utils();
    InterceptorManager = class {
      constructor() {
        this.handlers = [];
      }
      /**
       * Add a new interceptor to the stack
       *
       * @param {Function} fulfilled The function to handle `then` for a `Promise`
       * @param {Function} rejected The function to handle `reject` for a `Promise`
       * @param {Object} options The options for the interceptor, synchronous and runWhen
       *
       * @return {Number} An ID used to remove interceptor later
       */
      use(fulfilled, rejected, options) {
        this.handlers.push({
          fulfilled,
          rejected,
          synchronous: options ? options.synchronous : false,
          runWhen: options ? options.runWhen : null
        });
        return this.handlers.length - 1;
      }
      /**
       * Remove an interceptor from the stack
       *
       * @param {Number} id The ID that was returned by `use`
       *
       * @returns {void}
       */
      eject(id) {
        if (this.handlers[id]) {
          this.handlers[id] = null;
        }
      }
      /**
       * Clear all interceptors from the stack
       *
       * @returns {void}
       */
      clear() {
        if (this.handlers) {
          this.handlers = [];
        }
      }
      /**
       * Iterate over all the registered interceptors
       *
       * This method is particularly useful for skipping over any
       * interceptors that may have become `null` calling `eject`.
       *
       * @param {Function} fn The function to call for each interceptor
       *
       * @returns {void}
       */
      forEach(fn) {
        utils_default.forEach(this.handlers, function forEachHandler(h) {
          if (h !== null) {
            fn(h);
          }
        });
      }
    };
    InterceptorManager_default = InterceptorManager;
  }
});

// node_modules/axios/lib/defaults/transitional.js
var transitional_default;
var init_transitional = __esm({
  "node_modules/axios/lib/defaults/transitional.js"() {
    "use strict";
    transitional_default = {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
      legacyInterceptorReqResOrdering: true
    };
  }
});

// node_modules/axios/lib/platform/browser/classes/URLSearchParams.js
var URLSearchParams_default;
var init_URLSearchParams = __esm({
  "node_modules/axios/lib/platform/browser/classes/URLSearchParams.js"() {
    "use strict";
    init_AxiosURLSearchParams();
    URLSearchParams_default = typeof URLSearchParams !== "undefined" ? URLSearchParams : AxiosURLSearchParams_default;
  }
});

// node_modules/axios/lib/platform/browser/classes/FormData.js
var FormData_default;
var init_FormData = __esm({
  "node_modules/axios/lib/platform/browser/classes/FormData.js"() {
    "use strict";
    FormData_default = typeof FormData !== "undefined" ? FormData : null;
  }
});

// node_modules/axios/lib/platform/browser/classes/Blob.js
var Blob_default;
var init_Blob = __esm({
  "node_modules/axios/lib/platform/browser/classes/Blob.js"() {
    "use strict";
    Blob_default = typeof Blob !== "undefined" ? Blob : null;
  }
});

// node_modules/axios/lib/platform/browser/index.js
var browser_default;
var init_browser = __esm({
  "node_modules/axios/lib/platform/browser/index.js"() {
    init_URLSearchParams();
    init_FormData();
    init_Blob();
    browser_default = {
      isBrowser: true,
      classes: {
        URLSearchParams: URLSearchParams_default,
        FormData: FormData_default,
        Blob: Blob_default
      },
      protocols: ["http", "https", "file", "blob", "url", "data"]
    };
  }
});

// node_modules/axios/lib/platform/common/utils.js
var utils_exports = {};
__export(utils_exports, {
  hasBrowserEnv: () => hasBrowserEnv,
  hasStandardBrowserEnv: () => hasStandardBrowserEnv,
  hasStandardBrowserWebWorkerEnv: () => hasStandardBrowserWebWorkerEnv,
  navigator: () => _navigator,
  origin: () => origin
});
var hasBrowserEnv, _navigator, hasStandardBrowserEnv, hasStandardBrowserWebWorkerEnv, origin;
var init_utils2 = __esm({
  "node_modules/axios/lib/platform/common/utils.js"() {
    hasBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
    _navigator = typeof navigator === "object" && navigator || void 0;
    hasStandardBrowserEnv = hasBrowserEnv && (!_navigator || ["ReactNative", "NativeScript", "NS"].indexOf(_navigator.product) < 0);
    hasStandardBrowserWebWorkerEnv = (() => {
      return typeof WorkerGlobalScope !== "undefined" && // eslint-disable-next-line no-undef
      self instanceof WorkerGlobalScope && typeof self.importScripts === "function";
    })();
    origin = hasBrowserEnv && window.location.href || "http://localhost";
  }
});

// node_modules/axios/lib/platform/index.js
var platform_default;
var init_platform = __esm({
  "node_modules/axios/lib/platform/index.js"() {
    init_browser();
    init_utils2();
    platform_default = {
      ...utils_exports,
      ...browser_default
    };
  }
});

// node_modules/axios/lib/helpers/toURLEncodedForm.js
function toURLEncodedForm(data, options) {
  return toFormData_default(data, new platform_default.classes.URLSearchParams(), {
    visitor: function(value, key, path, helpers) {
      if (platform_default.isNode && utils_default.isBuffer(value)) {
        this.append(key, value.toString("base64"));
        return false;
      }
      return helpers.defaultVisitor.apply(this, arguments);
    },
    ...options
  });
}
var init_toURLEncodedForm = __esm({
  "node_modules/axios/lib/helpers/toURLEncodedForm.js"() {
    "use strict";
    init_utils();
    init_toFormData();
    init_platform();
  }
});

// node_modules/axios/lib/helpers/formDataToJSON.js
function parsePropPath(name) {
  return utils_default.matchAll(/\w+|\[(\w*)]/g, name).map((match) => {
    return match[0] === "[]" ? "" : match[1] || match[0];
  });
}
function arrayToObject(arr) {
  const obj = {};
  const keys = Object.keys(arr);
  let i;
  const len = keys.length;
  let key;
  for (i = 0; i < len; i++) {
    key = keys[i];
    obj[key] = arr[key];
  }
  return obj;
}
function formDataToJSON(formData) {
  function buildPath(path, value, target, index) {
    let name = path[index++];
    if (name === "__proto__") return true;
    const isNumericKey = Number.isFinite(+name);
    const isLast = index >= path.length;
    name = !name && utils_default.isArray(target) ? target.length : name;
    if (isLast) {
      if (utils_default.hasOwnProp(target, name)) {
        target[name] = utils_default.isArray(target[name]) ? target[name].concat(value) : [target[name], value];
      } else {
        target[name] = value;
      }
      return !isNumericKey;
    }
    if (!target[name] || !utils_default.isObject(target[name])) {
      target[name] = [];
    }
    const result = buildPath(path, value, target[name], index);
    if (result && utils_default.isArray(target[name])) {
      target[name] = arrayToObject(target[name]);
    }
    return !isNumericKey;
  }
  if (utils_default.isFormData(formData) && utils_default.isFunction(formData.entries)) {
    const obj = {};
    utils_default.forEachEntry(formData, (name, value) => {
      buildPath(parsePropPath(name), value, obj, 0);
    });
    return obj;
  }
  return null;
}
var formDataToJSON_default;
var init_formDataToJSON = __esm({
  "node_modules/axios/lib/helpers/formDataToJSON.js"() {
    "use strict";
    init_utils();
    formDataToJSON_default = formDataToJSON;
  }
});

// node_modules/axios/lib/defaults/index.js
function stringifySafely(rawValue, parser, encoder) {
  if (utils_default.isString(rawValue)) {
    try {
      (parser || JSON.parse)(rawValue);
      return utils_default.trim(rawValue);
    } catch (e) {
      if (e.name !== "SyntaxError") {
        throw e;
      }
    }
  }
  return (encoder || JSON.stringify)(rawValue);
}
var own, defaults, defaults_default;
var init_defaults = __esm({
  "node_modules/axios/lib/defaults/index.js"() {
    "use strict";
    init_utils();
    init_AxiosError();
    init_transitional();
    init_toFormData();
    init_toURLEncodedForm();
    init_platform();
    init_formDataToJSON();
    own = (obj, key) => obj != null && utils_default.hasOwnProp(obj, key) ? obj[key] : void 0;
    defaults = {
      transitional: transitional_default,
      adapter: ["xhr", "http", "fetch"],
      transformRequest: [
        function transformRequest(data, headers) {
          const contentType = headers.getContentType() || "";
          const hasJSONContentType = contentType.indexOf("application/json") > -1;
          const isObjectPayload = utils_default.isObject(data);
          if (isObjectPayload && utils_default.isHTMLForm(data)) {
            data = new FormData(data);
          }
          const isFormData2 = utils_default.isFormData(data);
          if (isFormData2) {
            return hasJSONContentType ? JSON.stringify(formDataToJSON_default(data)) : data;
          }
          if (utils_default.isArrayBuffer(data) || utils_default.isBuffer(data) || utils_default.isStream(data) || utils_default.isFile(data) || utils_default.isBlob(data) || utils_default.isReadableStream(data)) {
            return data;
          }
          if (utils_default.isArrayBufferView(data)) {
            return data.buffer;
          }
          if (utils_default.isURLSearchParams(data)) {
            headers.setContentType("application/x-www-form-urlencoded;charset=utf-8", false);
            return data.toString();
          }
          let isFileList2;
          if (isObjectPayload) {
            const formSerializer = own(this, "formSerializer");
            if (contentType.indexOf("application/x-www-form-urlencoded") > -1) {
              return toURLEncodedForm(data, formSerializer).toString();
            }
            if ((isFileList2 = utils_default.isFileList(data)) || contentType.indexOf("multipart/form-data") > -1) {
              const env = own(this, "env");
              const _FormData = env && env.FormData;
              return toFormData_default(
                isFileList2 ? { "files[]": data } : data,
                _FormData && new _FormData(),
                formSerializer
              );
            }
          }
          if (isObjectPayload || hasJSONContentType) {
            headers.setContentType("application/json", false);
            return stringifySafely(data);
          }
          return data;
        }
      ],
      transformResponse: [
        function transformResponse(data) {
          const transitional2 = own(this, "transitional") || defaults.transitional;
          const forcedJSONParsing = transitional2 && transitional2.forcedJSONParsing;
          const responseType = own(this, "responseType");
          const JSONRequested = responseType === "json";
          if (utils_default.isResponse(data) || utils_default.isReadableStream(data)) {
            return data;
          }
          if (data && utils_default.isString(data) && (forcedJSONParsing && !responseType || JSONRequested)) {
            const silentJSONParsing = transitional2 && transitional2.silentJSONParsing;
            const strictJSONParsing = !silentJSONParsing && JSONRequested;
            try {
              return JSON.parse(data, own(this, "parseReviver"));
            } catch (e) {
              if (strictJSONParsing) {
                if (e.name === "SyntaxError") {
                  throw AxiosError_default.from(e, AxiosError_default.ERR_BAD_RESPONSE, this, null, own(this, "response"));
                }
                throw e;
              }
            }
          }
          return data;
        }
      ],
      /**
       * A timeout in milliseconds to abort a request. If set to 0 (default) a
       * timeout is not created.
       */
      timeout: 0,
      xsrfCookieName: "XSRF-TOKEN",
      xsrfHeaderName: "X-XSRF-TOKEN",
      maxContentLength: -1,
      maxBodyLength: -1,
      env: {
        FormData: platform_default.classes.FormData,
        Blob: platform_default.classes.Blob
      },
      validateStatus: function validateStatus(status) {
        return status >= 200 && status < 300;
      },
      headers: {
        common: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": void 0
        }
      }
    };
    utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "query"], (method) => {
      defaults.headers[method] = {};
    });
    defaults_default = defaults;
  }
});

// node_modules/axios/lib/core/transformData.js
function transformData(fns, response) {
  const config = this || defaults_default;
  const context = response || config;
  const headers = AxiosHeaders_default.from(context.headers);
  let data = context.data;
  utils_default.forEach(fns, function transform(fn) {
    data = fn.call(config, data, headers.normalize(), response ? response.status : void 0);
  });
  headers.normalize();
  return data;
}
var init_transformData = __esm({
  "node_modules/axios/lib/core/transformData.js"() {
    "use strict";
    init_utils();
    init_defaults();
    init_AxiosHeaders();
  }
});

// node_modules/axios/lib/cancel/isCancel.js
function isCancel(value) {
  return !!(value && value.__CANCEL__);
}
var init_isCancel = __esm({
  "node_modules/axios/lib/cancel/isCancel.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/cancel/CanceledError.js
var CanceledError, CanceledError_default;
var init_CanceledError = __esm({
  "node_modules/axios/lib/cancel/CanceledError.js"() {
    "use strict";
    init_AxiosError();
    CanceledError = class extends AxiosError_default {
      /**
       * A `CanceledError` is an object that is thrown when an operation is canceled.
       *
       * @param {string=} message The message.
       * @param {Object=} config The config.
       * @param {Object=} request The request.
       *
       * @returns {CanceledError} The created error.
       */
      constructor(message, config, request) {
        super(message == null ? "canceled" : message, AxiosError_default.ERR_CANCELED, config, request);
        this.name = "CanceledError";
        this.__CANCEL__ = true;
      }
    };
    CanceledError_default = CanceledError;
  }
});

// node_modules/axios/lib/core/settle.js
function settle(resolve, reject, response) {
  const validateStatus2 = response.config.validateStatus;
  if (!response.status || !validateStatus2 || validateStatus2(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError_default(
      "Request failed with status code " + response.status,
      response.status >= 400 && response.status < 500 ? AxiosError_default.ERR_BAD_REQUEST : AxiosError_default.ERR_BAD_RESPONSE,
      response.config,
      response.request,
      response
    ));
  }
}
var init_settle = __esm({
  "node_modules/axios/lib/core/settle.js"() {
    "use strict";
    init_AxiosError();
  }
});

// node_modules/axios/lib/helpers/parseProtocol.js
function parseProtocol(url) {
  const match = /^([-+\w]{1,25}):(?:\/\/)?/.exec(url);
  return match && match[1] || "";
}
var init_parseProtocol = __esm({
  "node_modules/axios/lib/helpers/parseProtocol.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/speedometer.js
function speedometer(samplesCount, min) {
  samplesCount = samplesCount || 10;
  const bytes = new Array(samplesCount);
  const timestamps = new Array(samplesCount);
  let head = 0;
  let tail = 0;
  let firstSampleTS;
  min = min !== void 0 ? min : 1e3;
  return function push(chunkLength) {
    const now = Date.now();
    const startedAt = timestamps[tail];
    if (!firstSampleTS) {
      firstSampleTS = now;
    }
    bytes[head] = chunkLength;
    timestamps[head] = now;
    let i = tail;
    let bytesCount = 0;
    while (i !== head) {
      bytesCount += bytes[i++];
      i = i % samplesCount;
    }
    head = (head + 1) % samplesCount;
    if (head === tail) {
      tail = (tail + 1) % samplesCount;
    }
    if (now - firstSampleTS < min) {
      return;
    }
    const passed = startedAt && now - startedAt;
    return passed ? Math.round(bytesCount * 1e3 / passed) : void 0;
  };
}
var speedometer_default;
var init_speedometer = __esm({
  "node_modules/axios/lib/helpers/speedometer.js"() {
    "use strict";
    speedometer_default = speedometer;
  }
});

// node_modules/axios/lib/helpers/throttle.js
function throttle(fn, freq) {
  let timestamp = 0;
  let threshold = 1e3 / freq;
  let lastArgs;
  let timer;
  const invoke = (args, now = Date.now()) => {
    timestamp = now;
    lastArgs = null;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    fn(...args);
  };
  const throttled = (...args) => {
    const now = Date.now();
    const passed = now - timestamp;
    if (passed >= threshold) {
      invoke(args, now);
    } else {
      lastArgs = args;
      if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          invoke(lastArgs);
        }, threshold - passed);
      }
    }
  };
  const flush = () => lastArgs && invoke(lastArgs);
  return [throttled, flush];
}
var throttle_default;
var init_throttle = __esm({
  "node_modules/axios/lib/helpers/throttle.js"() {
    throttle_default = throttle;
  }
});

// node_modules/axios/lib/helpers/progressEventReducer.js
var progressEventReducer, progressEventDecorator, asyncDecorator;
var init_progressEventReducer = __esm({
  "node_modules/axios/lib/helpers/progressEventReducer.js"() {
    init_speedometer();
    init_throttle();
    init_utils();
    progressEventReducer = (listener, isDownloadStream, freq = 3) => {
      let bytesNotified = 0;
      const _speedometer = speedometer_default(50, 250);
      return throttle_default((e) => {
        const rawLoaded = e.loaded;
        const total = e.lengthComputable ? e.total : void 0;
        const loaded = total != null ? Math.min(rawLoaded, total) : rawLoaded;
        const progressBytes = Math.max(0, loaded - bytesNotified);
        const rate = _speedometer(progressBytes);
        bytesNotified = Math.max(bytesNotified, loaded);
        const data = {
          loaded,
          total,
          progress: total ? loaded / total : void 0,
          bytes: progressBytes,
          rate: rate ? rate : void 0,
          estimated: rate && total ? (total - loaded) / rate : void 0,
          event: e,
          lengthComputable: total != null,
          [isDownloadStream ? "download" : "upload"]: true
        };
        listener(data);
      }, freq);
    };
    progressEventDecorator = (total, throttled) => {
      const lengthComputable = total != null;
      return [
        (loaded) => throttled[0]({
          lengthComputable,
          total,
          loaded
        }),
        throttled[1]
      ];
    };
    asyncDecorator = (fn) => (...args) => utils_default.asap(() => fn(...args));
  }
});

// node_modules/axios/lib/helpers/isURLSameOrigin.js
var isURLSameOrigin_default;
var init_isURLSameOrigin = __esm({
  "node_modules/axios/lib/helpers/isURLSameOrigin.js"() {
    init_platform();
    isURLSameOrigin_default = platform_default.hasStandardBrowserEnv ? /* @__PURE__ */ ((origin2, isMSIE) => (url) => {
      url = new URL(url, platform_default.origin);
      return origin2.protocol === url.protocol && origin2.host === url.host && (isMSIE || origin2.port === url.port);
    })(
      new URL(platform_default.origin),
      platform_default.navigator && /(msie|trident)/i.test(platform_default.navigator.userAgent)
    ) : () => true;
  }
});

// node_modules/axios/lib/helpers/cookies.js
var cookies_default;
var init_cookies = __esm({
  "node_modules/axios/lib/helpers/cookies.js"() {
    init_utils();
    init_platform();
    cookies_default = platform_default.hasStandardBrowserEnv ? (
      // Standard browser envs support document.cookie
      {
        write(name, value, expires, path, domain, secure, sameSite) {
          if (typeof document === "undefined") return;
          const cookie = [`${name}=${encodeURIComponent(value)}`];
          if (utils_default.isNumber(expires)) {
            cookie.push(`expires=${new Date(expires).toUTCString()}`);
          }
          if (utils_default.isString(path)) {
            cookie.push(`path=${path}`);
          }
          if (utils_default.isString(domain)) {
            cookie.push(`domain=${domain}`);
          }
          if (secure === true) {
            cookie.push("secure");
          }
          if (utils_default.isString(sameSite)) {
            cookie.push(`SameSite=${sameSite}`);
          }
          document.cookie = cookie.join("; ");
        },
        read(name) {
          if (typeof document === "undefined") return null;
          const cookies = document.cookie.split(";");
          for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].replace(/^\s+/, "");
            const eq = cookie.indexOf("=");
            if (eq !== -1 && cookie.slice(0, eq) === name) {
              return decodeURIComponent(cookie.slice(eq + 1));
            }
          }
          return null;
        },
        remove(name) {
          this.write(name, "", Date.now() - 864e5, "/");
        }
      }
    ) : (
      // Non-standard browser env (web workers, react-native) lack needed support.
      {
        write() {
        },
        read() {
          return null;
        },
        remove() {
        }
      }
    );
  }
});

// node_modules/axios/lib/helpers/isAbsoluteURL.js
function isAbsoluteURL(url) {
  if (typeof url !== "string") {
    return false;
  }
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}
var init_isAbsoluteURL = __esm({
  "node_modules/axios/lib/helpers/isAbsoluteURL.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/combineURLs.js
function combineURLs(baseURL, relativeURL) {
  return relativeURL ? baseURL.replace(/\/?\/$/, "") + "/" + relativeURL.replace(/^\/+/, "") : baseURL;
}
var init_combineURLs = __esm({
  "node_modules/axios/lib/helpers/combineURLs.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/core/buildFullPath.js
function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
  let isRelativeUrl = !isAbsoluteURL(requestedURL);
  if (baseURL && (isRelativeUrl || allowAbsoluteUrls === false)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
}
var init_buildFullPath = __esm({
  "node_modules/axios/lib/core/buildFullPath.js"() {
    "use strict";
    init_isAbsoluteURL();
    init_combineURLs();
  }
});

// node_modules/axios/lib/core/mergeConfig.js
function mergeConfig(config1, config2) {
  config2 = config2 || {};
  const config = /* @__PURE__ */ Object.create(null);
  Object.defineProperty(config, "hasOwnProperty", {
    // Null-proto descriptor so a polluted Object.prototype.get cannot turn
    // this data descriptor into an accessor descriptor on the way in.
    __proto__: null,
    value: Object.prototype.hasOwnProperty,
    enumerable: false,
    writable: true,
    configurable: true
  });
  function getMergedValue(target, source, prop, caseless) {
    if (utils_default.isPlainObject(target) && utils_default.isPlainObject(source)) {
      return utils_default.merge.call({ caseless }, target, source);
    } else if (utils_default.isPlainObject(source)) {
      return utils_default.merge({}, source);
    } else if (utils_default.isArray(source)) {
      return source.slice();
    }
    return source;
  }
  function mergeDeepProperties(a, b, prop, caseless) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(a, b, prop, caseless);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a, prop, caseless);
    }
  }
  function valueFromConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    }
  }
  function defaultToConfig2(a, b) {
    if (!utils_default.isUndefined(b)) {
      return getMergedValue(void 0, b);
    } else if (!utils_default.isUndefined(a)) {
      return getMergedValue(void 0, a);
    }
  }
  function mergeDirectKeys(a, b, prop) {
    if (utils_default.hasOwnProp(config2, prop)) {
      return getMergedValue(a, b);
    } else if (utils_default.hasOwnProp(config1, prop)) {
      return getMergedValue(void 0, a);
    }
  }
  const mergeMap = {
    url: valueFromConfig2,
    method: valueFromConfig2,
    data: valueFromConfig2,
    baseURL: defaultToConfig2,
    transformRequest: defaultToConfig2,
    transformResponse: defaultToConfig2,
    paramsSerializer: defaultToConfig2,
    timeout: defaultToConfig2,
    timeoutMessage: defaultToConfig2,
    withCredentials: defaultToConfig2,
    withXSRFToken: defaultToConfig2,
    adapter: defaultToConfig2,
    responseType: defaultToConfig2,
    xsrfCookieName: defaultToConfig2,
    xsrfHeaderName: defaultToConfig2,
    onUploadProgress: defaultToConfig2,
    onDownloadProgress: defaultToConfig2,
    decompress: defaultToConfig2,
    maxContentLength: defaultToConfig2,
    maxBodyLength: defaultToConfig2,
    beforeRedirect: defaultToConfig2,
    transport: defaultToConfig2,
    httpAgent: defaultToConfig2,
    httpsAgent: defaultToConfig2,
    cancelToken: defaultToConfig2,
    socketPath: defaultToConfig2,
    allowedSocketPaths: defaultToConfig2,
    responseEncoding: defaultToConfig2,
    validateStatus: mergeDirectKeys,
    headers: (a, b, prop) => mergeDeepProperties(headersToObject(a), headersToObject(b), prop, true)
  };
  utils_default.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
    if (prop === "__proto__" || prop === "constructor" || prop === "prototype") return;
    const merge2 = utils_default.hasOwnProp(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
    const a = utils_default.hasOwnProp(config1, prop) ? config1[prop] : void 0;
    const b = utils_default.hasOwnProp(config2, prop) ? config2[prop] : void 0;
    const configValue = merge2(a, b, prop);
    utils_default.isUndefined(configValue) && merge2 !== mergeDirectKeys || (config[prop] = configValue);
  });
  return config;
}
var headersToObject;
var init_mergeConfig = __esm({
  "node_modules/axios/lib/core/mergeConfig.js"() {
    "use strict";
    init_utils();
    init_AxiosHeaders();
    headersToObject = (thing) => thing instanceof AxiosHeaders_default ? { ...thing } : thing;
  }
});

// node_modules/axios/lib/helpers/resolveConfig.js
function setFormDataHeaders(headers, formHeaders, policy) {
  if (policy !== "content-only") {
    headers.set(formHeaders);
    return;
  }
  Object.entries(formHeaders).forEach(([key, val]) => {
    if (FORM_DATA_CONTENT_HEADERS.includes(key.toLowerCase())) {
      headers.set(key, val);
    }
  });
}
var FORM_DATA_CONTENT_HEADERS, encodeUTF8, resolveConfig_default;
var init_resolveConfig = __esm({
  "node_modules/axios/lib/helpers/resolveConfig.js"() {
    init_platform();
    init_utils();
    init_isURLSameOrigin();
    init_cookies();
    init_buildFullPath();
    init_mergeConfig();
    init_AxiosHeaders();
    init_buildURL();
    FORM_DATA_CONTENT_HEADERS = ["content-type", "content-length"];
    encodeUTF8 = (str) => encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/gi,
      (_, hex) => String.fromCharCode(parseInt(hex, 16))
    );
    resolveConfig_default = (config) => {
      const newConfig = mergeConfig({}, config);
      const own2 = (key) => utils_default.hasOwnProp(newConfig, key) ? newConfig[key] : void 0;
      const data = own2("data");
      let withXSRFToken = own2("withXSRFToken");
      const xsrfHeaderName = own2("xsrfHeaderName");
      const xsrfCookieName = own2("xsrfCookieName");
      let headers = own2("headers");
      const auth = own2("auth");
      const baseURL = own2("baseURL");
      const allowAbsoluteUrls = own2("allowAbsoluteUrls");
      const url = own2("url");
      newConfig.headers = headers = AxiosHeaders_default.from(headers);
      newConfig.url = buildURL(
        buildFullPath(baseURL, url, allowAbsoluteUrls),
        config.params,
        config.paramsSerializer
      );
      if (auth) {
        headers.set(
          "Authorization",
          "Basic " + btoa((auth.username || "") + ":" + (auth.password ? encodeUTF8(auth.password) : ""))
        );
      }
      if (utils_default.isFormData(data)) {
        if (platform_default.hasStandardBrowserEnv || platform_default.hasStandardBrowserWebWorkerEnv) {
          headers.setContentType(void 0);
        } else if (utils_default.isFunction(data.getHeaders)) {
          setFormDataHeaders(headers, data.getHeaders(), own2("formDataHeaderPolicy"));
        }
      }
      if (platform_default.hasStandardBrowserEnv) {
        if (utils_default.isFunction(withXSRFToken)) {
          withXSRFToken = withXSRFToken(newConfig);
        }
        const shouldSendXSRF = withXSRFToken === true || withXSRFToken == null && isURLSameOrigin_default(newConfig.url);
        if (shouldSendXSRF) {
          const xsrfValue = xsrfHeaderName && xsrfCookieName && cookies_default.read(xsrfCookieName);
          if (xsrfValue) {
            headers.set(xsrfHeaderName, xsrfValue);
          }
        }
      }
      return newConfig;
    };
  }
});

// node_modules/axios/lib/adapters/xhr.js
var isXHRAdapterSupported, xhr_default;
var init_xhr = __esm({
  "node_modules/axios/lib/adapters/xhr.js"() {
    init_utils();
    init_settle();
    init_transitional();
    init_AxiosError();
    init_CanceledError();
    init_parseProtocol();
    init_platform();
    init_AxiosHeaders();
    init_progressEventReducer();
    init_resolveConfig();
    isXHRAdapterSupported = typeof XMLHttpRequest !== "undefined";
    xhr_default = isXHRAdapterSupported && function(config) {
      return new Promise(function dispatchXhrRequest(resolve, reject) {
        const _config = resolveConfig_default(config);
        let requestData = _config.data;
        const requestHeaders = AxiosHeaders_default.from(_config.headers).normalize();
        let { responseType, onUploadProgress, onDownloadProgress } = _config;
        let onCanceled;
        let uploadThrottled, downloadThrottled;
        let flushUpload, flushDownload;
        function done() {
          flushUpload && flushUpload();
          flushDownload && flushDownload();
          _config.cancelToken && _config.cancelToken.unsubscribe(onCanceled);
          _config.signal && _config.signal.removeEventListener("abort", onCanceled);
        }
        let request = new XMLHttpRequest();
        request.open(_config.method.toUpperCase(), _config.url, true);
        request.timeout = _config.timeout;
        function onloadend() {
          if (!request) {
            return;
          }
          const responseHeaders = AxiosHeaders_default.from(
            "getAllResponseHeaders" in request && request.getAllResponseHeaders()
          );
          const responseData = !responseType || responseType === "text" || responseType === "json" ? request.responseText : request.response;
          const response = {
            data: responseData,
            status: request.status,
            statusText: request.statusText,
            headers: responseHeaders,
            config,
            request
          };
          settle(
            function _resolve(value) {
              resolve(value);
              done();
            },
            function _reject(err) {
              reject(err);
              done();
            },
            response
          );
          request = null;
        }
        if ("onloadend" in request) {
          request.onloadend = onloadend;
        } else {
          request.onreadystatechange = function handleLoad() {
            if (!request || request.readyState !== 4) {
              return;
            }
            if (request.status === 0 && !(request.responseURL && request.responseURL.startsWith("file:"))) {
              return;
            }
            setTimeout(onloadend);
          };
        }
        request.onabort = function handleAbort() {
          if (!request) {
            return;
          }
          reject(new AxiosError_default("Request aborted", AxiosError_default.ECONNABORTED, config, request));
          done();
          request = null;
        };
        request.onerror = function handleError(event) {
          const msg = event && event.message ? event.message : "Network Error";
          const err = new AxiosError_default(msg, AxiosError_default.ERR_NETWORK, config, request);
          err.event = event || null;
          reject(err);
          done();
          request = null;
        };
        request.ontimeout = function handleTimeout() {
          let timeoutErrorMessage = _config.timeout ? "timeout of " + _config.timeout + "ms exceeded" : "timeout exceeded";
          const transitional2 = _config.transitional || transitional_default;
          if (_config.timeoutErrorMessage) {
            timeoutErrorMessage = _config.timeoutErrorMessage;
          }
          reject(
            new AxiosError_default(
              timeoutErrorMessage,
              transitional2.clarifyTimeoutError ? AxiosError_default.ETIMEDOUT : AxiosError_default.ECONNABORTED,
              config,
              request
            )
          );
          done();
          request = null;
        };
        requestData === void 0 && requestHeaders.setContentType(null);
        if ("setRequestHeader" in request) {
          utils_default.forEach(requestHeaders.toJSON(), function setRequestHeader(val, key) {
            request.setRequestHeader(key, val);
          });
        }
        if (!utils_default.isUndefined(_config.withCredentials)) {
          request.withCredentials = !!_config.withCredentials;
        }
        if (responseType && responseType !== "json") {
          request.responseType = _config.responseType;
        }
        if (onDownloadProgress) {
          [downloadThrottled, flushDownload] = progressEventReducer(onDownloadProgress, true);
          request.addEventListener("progress", downloadThrottled);
        }
        if (onUploadProgress && request.upload) {
          [uploadThrottled, flushUpload] = progressEventReducer(onUploadProgress);
          request.upload.addEventListener("progress", uploadThrottled);
          request.upload.addEventListener("loadend", flushUpload);
        }
        if (_config.cancelToken || _config.signal) {
          onCanceled = (cancel) => {
            if (!request) {
              return;
            }
            reject(!cancel || cancel.type ? new CanceledError_default(null, config, request) : cancel);
            request.abort();
            done();
            request = null;
          };
          _config.cancelToken && _config.cancelToken.subscribe(onCanceled);
          if (_config.signal) {
            _config.signal.aborted ? onCanceled() : _config.signal.addEventListener("abort", onCanceled);
          }
        }
        const protocol = parseProtocol(_config.url);
        if (protocol && !platform_default.protocols.includes(protocol)) {
          reject(
            new AxiosError_default(
              "Unsupported protocol " + protocol + ":",
              AxiosError_default.ERR_BAD_REQUEST,
              config
            )
          );
          return;
        }
        request.send(requestData || null);
      });
    };
  }
});

// node_modules/axios/lib/helpers/composeSignals.js
var composeSignals, composeSignals_default;
var init_composeSignals = __esm({
  "node_modules/axios/lib/helpers/composeSignals.js"() {
    init_CanceledError();
    init_AxiosError();
    init_utils();
    composeSignals = (signals, timeout) => {
      const { length } = signals = signals ? signals.filter(Boolean) : [];
      if (timeout || length) {
        let controller = new AbortController();
        let aborted;
        const onabort = function(reason) {
          if (!aborted) {
            aborted = true;
            unsubscribe();
            const err = reason instanceof Error ? reason : this.reason;
            controller.abort(
              err instanceof AxiosError_default ? err : new CanceledError_default(err instanceof Error ? err.message : err)
            );
          }
        };
        let timer = timeout && setTimeout(() => {
          timer = null;
          onabort(new AxiosError_default(`timeout of ${timeout}ms exceeded`, AxiosError_default.ETIMEDOUT));
        }, timeout);
        const unsubscribe = () => {
          if (signals) {
            timer && clearTimeout(timer);
            timer = null;
            signals.forEach((signal2) => {
              signal2.unsubscribe ? signal2.unsubscribe(onabort) : signal2.removeEventListener("abort", onabort);
            });
            signals = null;
          }
        };
        signals.forEach((signal2) => signal2.addEventListener("abort", onabort));
        const { signal } = controller;
        signal.unsubscribe = () => utils_default.asap(unsubscribe);
        return signal;
      }
    };
    composeSignals_default = composeSignals;
  }
});

// node_modules/axios/lib/helpers/trackStream.js
var streamChunk, readBytes, readStream, trackStream;
var init_trackStream = __esm({
  "node_modules/axios/lib/helpers/trackStream.js"() {
    streamChunk = function* (chunk, chunkSize) {
      let len = chunk.byteLength;
      if (!chunkSize || len < chunkSize) {
        yield chunk;
        return;
      }
      let pos = 0;
      let end;
      while (pos < len) {
        end = pos + chunkSize;
        yield chunk.slice(pos, end);
        pos = end;
      }
    };
    readBytes = async function* (iterable, chunkSize) {
      for await (const chunk of readStream(iterable)) {
        yield* streamChunk(chunk, chunkSize);
      }
    };
    readStream = async function* (stream) {
      if (stream[Symbol.asyncIterator]) {
        yield* stream;
        return;
      }
      const reader = stream.getReader();
      try {
        for (; ; ) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          yield value;
        }
      } finally {
        await reader.cancel();
      }
    };
    trackStream = (stream, chunkSize, onProgress, onFinish) => {
      const iterator2 = readBytes(stream, chunkSize);
      let bytes = 0;
      let done;
      let _onFinish = (e) => {
        if (!done) {
          done = true;
          onFinish && onFinish(e);
        }
      };
      return new ReadableStream(
        {
          async pull(controller) {
            try {
              const { done: done2, value } = await iterator2.next();
              if (done2) {
                _onFinish();
                controller.close();
                return;
              }
              let len = value.byteLength;
              if (onProgress) {
                let loadedBytes = bytes += len;
                onProgress(loadedBytes);
              }
              controller.enqueue(new Uint8Array(value));
            } catch (err) {
              _onFinish(err);
              throw err;
            }
          },
          cancel(reason) {
            _onFinish(reason);
            return iterator2.return();
          }
        },
        {
          highWaterMark: 2
        }
      );
    };
  }
});

// node_modules/axios/lib/helpers/estimateDataURLDecodedBytes.js
function estimateDataURLDecodedBytes(url) {
  if (!url || typeof url !== "string") return 0;
  if (!url.startsWith("data:")) return 0;
  const comma = url.indexOf(",");
  if (comma < 0) return 0;
  const meta = url.slice(5, comma);
  const body = url.slice(comma + 1);
  const isBase64 = /;base64/i.test(meta);
  if (isBase64) {
    let effectiveLen = body.length;
    const len = body.length;
    for (let i = 0; i < len; i++) {
      if (body.charCodeAt(i) === 37 && i + 2 < len) {
        const a = body.charCodeAt(i + 1);
        const b = body.charCodeAt(i + 2);
        const isHex = (a >= 48 && a <= 57 || a >= 65 && a <= 70 || a >= 97 && a <= 102) && (b >= 48 && b <= 57 || b >= 65 && b <= 70 || b >= 97 && b <= 102);
        if (isHex) {
          effectiveLen -= 2;
          i += 2;
        }
      }
    }
    let pad = 0;
    let idx = len - 1;
    const tailIsPct3D = (j) => j >= 2 && body.charCodeAt(j - 2) === 37 && // '%'
    body.charCodeAt(j - 1) === 51 && // '3'
    (body.charCodeAt(j) === 68 || body.charCodeAt(j) === 100);
    if (idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
        idx--;
      } else if (tailIsPct3D(idx)) {
        pad++;
        idx -= 3;
      }
    }
    if (pad === 1 && idx >= 0) {
      if (body.charCodeAt(idx) === 61) {
        pad++;
      } else if (tailIsPct3D(idx)) {
        pad++;
      }
    }
    const groups = Math.floor(effectiveLen / 4);
    const bytes2 = groups * 3 - (pad || 0);
    return bytes2 > 0 ? bytes2 : 0;
  }
  if (typeof Buffer !== "undefined" && typeof Buffer.byteLength === "function") {
    return Buffer.byteLength(body, "utf8");
  }
  let bytes = 0;
  for (let i = 0, len = body.length; i < len; i++) {
    const c = body.charCodeAt(i);
    if (c < 128) {
      bytes += 1;
    } else if (c < 2048) {
      bytes += 2;
    } else if (c >= 55296 && c <= 56319 && i + 1 < len) {
      const next = body.charCodeAt(i + 1);
      if (next >= 56320 && next <= 57343) {
        bytes += 4;
        i++;
      } else {
        bytes += 3;
      }
    } else {
      bytes += 3;
    }
  }
  return bytes;
}
var init_estimateDataURLDecodedBytes = __esm({
  "node_modules/axios/lib/helpers/estimateDataURLDecodedBytes.js"() {
  }
});

// node_modules/axios/lib/env/data.js
var VERSION;
var init_data = __esm({
  "node_modules/axios/lib/env/data.js"() {
    VERSION = "1.16.0";
  }
});

// node_modules/axios/lib/adapters/fetch.js
var DEFAULT_CHUNK_SIZE, isFunction2, test, factory, seedCache, getFetch, adapter;
var init_fetch = __esm({
  "node_modules/axios/lib/adapters/fetch.js"() {
    init_platform();
    init_utils();
    init_AxiosError();
    init_composeSignals();
    init_trackStream();
    init_AxiosHeaders();
    init_progressEventReducer();
    init_resolveConfig();
    init_settle();
    init_estimateDataURLDecodedBytes();
    init_data();
    DEFAULT_CHUNK_SIZE = 64 * 1024;
    ({ isFunction: isFunction2 } = utils_default);
    test = (fn, ...args) => {
      try {
        return !!fn(...args);
      } catch (e) {
        return false;
      }
    };
    factory = (env) => {
      const globalObject = utils_default.global ?? globalThis;
      const { ReadableStream: ReadableStream2, TextEncoder } = globalObject;
      env = utils_default.merge.call(
        {
          skipUndefined: true
        },
        {
          Request: globalObject.Request,
          Response: globalObject.Response
        },
        env
      );
      const { fetch: envFetch, Request, Response } = env;
      const isFetchSupported = envFetch ? isFunction2(envFetch) : typeof fetch === "function";
      const isRequestSupported = isFunction2(Request);
      const isResponseSupported = isFunction2(Response);
      if (!isFetchSupported) {
        return false;
      }
      const isReadableStreamSupported = isFetchSupported && isFunction2(ReadableStream2);
      const encodeText = isFetchSupported && (typeof TextEncoder === "function" ? /* @__PURE__ */ ((encoder) => (str) => encoder.encode(str))(new TextEncoder()) : async (str) => new Uint8Array(await new Request(str).arrayBuffer()));
      const supportsRequestStream = isRequestSupported && isReadableStreamSupported && test(() => {
        let duplexAccessed = false;
        const request = new Request(platform_default.origin, {
          body: new ReadableStream2(),
          method: "POST",
          get duplex() {
            duplexAccessed = true;
            return "half";
          }
        });
        const hasContentType = request.headers.has("Content-Type");
        if (request.body != null) {
          request.body.cancel();
        }
        return duplexAccessed && !hasContentType;
      });
      const supportsResponseStream = isResponseSupported && isReadableStreamSupported && test(() => utils_default.isReadableStream(new Response("").body));
      const resolvers = {
        stream: supportsResponseStream && ((res) => res.body)
      };
      isFetchSupported && (() => {
        ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((type) => {
          !resolvers[type] && (resolvers[type] = (res, config) => {
            let method = res && res[type];
            if (method) {
              return method.call(res);
            }
            throw new AxiosError_default(
              `Response type '${type}' is not supported`,
              AxiosError_default.ERR_NOT_SUPPORT,
              config
            );
          });
        });
      })();
      const getBodyLength = async (body) => {
        if (body == null) {
          return 0;
        }
        if (utils_default.isBlob(body)) {
          return body.size;
        }
        if (utils_default.isSpecCompliantForm(body)) {
          const _request = new Request(platform_default.origin, {
            method: "POST",
            body
          });
          return (await _request.arrayBuffer()).byteLength;
        }
        if (utils_default.isArrayBufferView(body) || utils_default.isArrayBuffer(body)) {
          return body.byteLength;
        }
        if (utils_default.isURLSearchParams(body)) {
          body = body + "";
        }
        if (utils_default.isString(body)) {
          return (await encodeText(body)).byteLength;
        }
      };
      const resolveBodyLength = async (headers, body) => {
        const length = utils_default.toFiniteNumber(headers.getContentLength());
        return length == null ? getBodyLength(body) : length;
      };
      return async (config) => {
        let {
          url,
          method,
          data,
          signal,
          cancelToken,
          timeout,
          onDownloadProgress,
          onUploadProgress,
          responseType,
          headers,
          withCredentials = "same-origin",
          fetchOptions,
          maxContentLength,
          maxBodyLength
        } = resolveConfig_default(config);
        const hasMaxContentLength = utils_default.isNumber(maxContentLength) && maxContentLength > -1;
        const hasMaxBodyLength = utils_default.isNumber(maxBodyLength) && maxBodyLength > -1;
        let _fetch = envFetch || fetch;
        responseType = responseType ? (responseType + "").toLowerCase() : "text";
        let composedSignal = composeSignals_default(
          [signal, cancelToken && cancelToken.toAbortSignal()],
          timeout
        );
        let request = null;
        const unsubscribe = composedSignal && composedSignal.unsubscribe && (() => {
          composedSignal.unsubscribe();
        });
        let requestContentLength;
        try {
          if (hasMaxContentLength && typeof url === "string" && url.startsWith("data:")) {
            const estimated = estimateDataURLDecodedBytes(url);
            if (estimated > maxContentLength) {
              throw new AxiosError_default(
                "maxContentLength size of " + maxContentLength + " exceeded",
                AxiosError_default.ERR_BAD_RESPONSE,
                config,
                request
              );
            }
          }
          if (hasMaxBodyLength && method !== "get" && method !== "head") {
            const outboundLength = await resolveBodyLength(headers, data);
            if (typeof outboundLength === "number" && isFinite(outboundLength) && outboundLength > maxBodyLength) {
              throw new AxiosError_default(
                "Request body larger than maxBodyLength limit",
                AxiosError_default.ERR_BAD_REQUEST,
                config,
                request
              );
            }
          }
          if (onUploadProgress && supportsRequestStream && method !== "get" && method !== "head" && (requestContentLength = await resolveBodyLength(headers, data)) !== 0) {
            let _request = new Request(url, {
              method: "POST",
              body: data,
              duplex: "half"
            });
            let contentTypeHeader;
            if (utils_default.isFormData(data) && (contentTypeHeader = _request.headers.get("content-type"))) {
              headers.setContentType(contentTypeHeader);
            }
            if (_request.body) {
              const [onProgress, flush] = progressEventDecorator(
                requestContentLength,
                progressEventReducer(asyncDecorator(onUploadProgress))
              );
              data = trackStream(_request.body, DEFAULT_CHUNK_SIZE, onProgress, flush);
            }
          }
          if (!utils_default.isString(withCredentials)) {
            withCredentials = withCredentials ? "include" : "omit";
          }
          const isCredentialsSupported = isRequestSupported && "credentials" in Request.prototype;
          if (utils_default.isFormData(data)) {
            const contentType = headers.getContentType();
            if (contentType && /^multipart\/form-data/i.test(contentType) && !/boundary=/i.test(contentType)) {
              headers.delete("content-type");
            }
          }
          headers.set("User-Agent", "axios/" + VERSION, false);
          const resolvedOptions = {
            ...fetchOptions,
            signal: composedSignal,
            method: method.toUpperCase(),
            headers: headers.normalize().toJSON(),
            body: data,
            duplex: "half",
            credentials: isCredentialsSupported ? withCredentials : void 0
          };
          request = isRequestSupported && new Request(url, resolvedOptions);
          let response = await (isRequestSupported ? _fetch(request, fetchOptions) : _fetch(url, resolvedOptions));
          if (hasMaxContentLength) {
            const declaredLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
            if (declaredLength != null && declaredLength > maxContentLength) {
              throw new AxiosError_default(
                "maxContentLength size of " + maxContentLength + " exceeded",
                AxiosError_default.ERR_BAD_RESPONSE,
                config,
                request
              );
            }
          }
          const isStreamResponse = supportsResponseStream && (responseType === "stream" || responseType === "response");
          if (supportsResponseStream && response.body && (onDownloadProgress || hasMaxContentLength || isStreamResponse && unsubscribe)) {
            const options = {};
            ["status", "statusText", "headers"].forEach((prop) => {
              options[prop] = response[prop];
            });
            const responseContentLength = utils_default.toFiniteNumber(response.headers.get("content-length"));
            const [onProgress, flush] = onDownloadProgress && progressEventDecorator(
              responseContentLength,
              progressEventReducer(asyncDecorator(onDownloadProgress), true)
            ) || [];
            let bytesRead = 0;
            const onChunkProgress = (loadedBytes) => {
              if (hasMaxContentLength) {
                bytesRead = loadedBytes;
                if (bytesRead > maxContentLength) {
                  throw new AxiosError_default(
                    "maxContentLength size of " + maxContentLength + " exceeded",
                    AxiosError_default.ERR_BAD_RESPONSE,
                    config,
                    request
                  );
                }
              }
              onProgress && onProgress(loadedBytes);
            };
            response = new Response(
              trackStream(response.body, DEFAULT_CHUNK_SIZE, onChunkProgress, () => {
                flush && flush();
                unsubscribe && unsubscribe();
              }),
              options
            );
          }
          responseType = responseType || "text";
          let responseData = await resolvers[utils_default.findKey(resolvers, responseType) || "text"](
            response,
            config
          );
          if (hasMaxContentLength && !supportsResponseStream && !isStreamResponse) {
            let materializedSize;
            if (responseData != null) {
              if (typeof responseData.byteLength === "number") {
                materializedSize = responseData.byteLength;
              } else if (typeof responseData.size === "number") {
                materializedSize = responseData.size;
              } else if (typeof responseData === "string") {
                materializedSize = typeof TextEncoder === "function" ? new TextEncoder().encode(responseData).byteLength : responseData.length;
              }
            }
            if (typeof materializedSize === "number" && materializedSize > maxContentLength) {
              throw new AxiosError_default(
                "maxContentLength size of " + maxContentLength + " exceeded",
                AxiosError_default.ERR_BAD_RESPONSE,
                config,
                request
              );
            }
          }
          !isStreamResponse && unsubscribe && unsubscribe();
          return await new Promise((resolve, reject) => {
            settle(resolve, reject, {
              data: responseData,
              headers: AxiosHeaders_default.from(response.headers),
              status: response.status,
              statusText: response.statusText,
              config,
              request
            });
          });
        } catch (err) {
          unsubscribe && unsubscribe();
          if (composedSignal && composedSignal.aborted && composedSignal.reason instanceof AxiosError_default) {
            const canceledError = composedSignal.reason;
            canceledError.config = config;
            request && (canceledError.request = request);
            err !== canceledError && (canceledError.cause = err);
            throw canceledError;
          }
          if (err && err.name === "TypeError" && /Load failed|fetch/i.test(err.message)) {
            throw Object.assign(
              new AxiosError_default(
                "Network Error",
                AxiosError_default.ERR_NETWORK,
                config,
                request,
                err && err.response
              ),
              {
                cause: err.cause || err
              }
            );
          }
          throw AxiosError_default.from(err, err && err.code, config, request, err && err.response);
        }
      };
    };
    seedCache = /* @__PURE__ */ new Map();
    getFetch = (config) => {
      let env = config && config.env || {};
      const { fetch: fetch2, Request, Response } = env;
      const seeds = [Request, Response, fetch2];
      let len = seeds.length, i = len, seed, target, map = seedCache;
      while (i--) {
        seed = seeds[i];
        target = map.get(seed);
        target === void 0 && map.set(seed, target = i ? /* @__PURE__ */ new Map() : factory(env));
        map = target;
      }
      return target;
    };
    adapter = getFetch();
  }
});

// node_modules/axios/lib/adapters/adapters.js
function getAdapter(adapters, config) {
  adapters = utils_default.isArray(adapters) ? adapters : [adapters];
  const { length } = adapters;
  let nameOrAdapter;
  let adapter2;
  const rejectedReasons = {};
  for (let i = 0; i < length; i++) {
    nameOrAdapter = adapters[i];
    let id;
    adapter2 = nameOrAdapter;
    if (!isResolvedHandle(nameOrAdapter)) {
      adapter2 = knownAdapters[(id = String(nameOrAdapter)).toLowerCase()];
      if (adapter2 === void 0) {
        throw new AxiosError_default(`Unknown adapter '${id}'`);
      }
    }
    if (adapter2 && (utils_default.isFunction(adapter2) || (adapter2 = adapter2.get(config)))) {
      break;
    }
    rejectedReasons[id || "#" + i] = adapter2;
  }
  if (!adapter2) {
    const reasons = Object.entries(rejectedReasons).map(
      ([id, state]) => `adapter ${id} ` + (state === false ? "is not supported by the environment" : "is not available in the build")
    );
    let s = length ? reasons.length > 1 ? "since :\n" + reasons.map(renderReason).join("\n") : " " + renderReason(reasons[0]) : "as no adapter specified";
    throw new AxiosError_default(
      `There is no suitable adapter to dispatch the request ` + s,
      "ERR_NOT_SUPPORT"
    );
  }
  return adapter2;
}
var knownAdapters, renderReason, isResolvedHandle, adapters_default;
var init_adapters = __esm({
  "node_modules/axios/lib/adapters/adapters.js"() {
    init_utils();
    init_null();
    init_xhr();
    init_fetch();
    init_AxiosError();
    knownAdapters = {
      http: null_default,
      xhr: xhr_default,
      fetch: {
        get: getFetch
      }
    };
    utils_default.forEach(knownAdapters, (fn, value) => {
      if (fn) {
        try {
          Object.defineProperty(fn, "name", { __proto__: null, value });
        } catch (e) {
        }
        Object.defineProperty(fn, "adapterName", { __proto__: null, value });
      }
    });
    renderReason = (reason) => `- ${reason}`;
    isResolvedHandle = (adapter2) => utils_default.isFunction(adapter2) || adapter2 === null || adapter2 === false;
    adapters_default = {
      /**
       * Resolve an adapter from a list of adapter names or functions.
       * @type {Function}
       */
      getAdapter,
      /**
       * Exposes all known adapters
       * @type {Object<string, Function|Object>}
       */
      adapters: knownAdapters
    };
  }
});

// node_modules/axios/lib/core/dispatchRequest.js
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
  if (config.signal && config.signal.aborted) {
    throw new CanceledError_default(null, config);
  }
}
function dispatchRequest(config) {
  throwIfCancellationRequested(config);
  config.headers = AxiosHeaders_default.from(config.headers);
  config.data = transformData.call(config, config.transformRequest);
  if (["post", "put", "patch"].indexOf(config.method) !== -1) {
    config.headers.setContentType("application/x-www-form-urlencoded", false);
  }
  const adapter2 = adapters_default.getAdapter(config.adapter || defaults_default.adapter, config);
  return adapter2(config).then(
    function onAdapterResolution(response) {
      throwIfCancellationRequested(config);
      config.response = response;
      try {
        response.data = transformData.call(config, config.transformResponse, response);
      } finally {
        delete config.response;
      }
      response.headers = AxiosHeaders_default.from(response.headers);
      return response;
    },
    function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);
        if (reason && reason.response) {
          config.response = reason.response;
          try {
            reason.response.data = transformData.call(
              config,
              config.transformResponse,
              reason.response
            );
          } finally {
            delete config.response;
          }
          reason.response.headers = AxiosHeaders_default.from(reason.response.headers);
        }
      }
      return Promise.reject(reason);
    }
  );
}
var init_dispatchRequest = __esm({
  "node_modules/axios/lib/core/dispatchRequest.js"() {
    "use strict";
    init_transformData();
    init_isCancel();
    init_defaults();
    init_CanceledError();
    init_AxiosHeaders();
    init_adapters();
  }
});

// node_modules/axios/lib/helpers/validator.js
function assertOptions(options, schema, allowUnknown) {
  if (typeof options !== "object") {
    throw new AxiosError_default("options must be an object", AxiosError_default.ERR_BAD_OPTION_VALUE);
  }
  const keys = Object.keys(options);
  let i = keys.length;
  while (i-- > 0) {
    const opt = keys[i];
    const validator = Object.prototype.hasOwnProperty.call(schema, opt) ? schema[opt] : void 0;
    if (validator) {
      const value = options[opt];
      const result = value === void 0 || validator(value, opt, options);
      if (result !== true) {
        throw new AxiosError_default(
          "option " + opt + " must be " + result,
          AxiosError_default.ERR_BAD_OPTION_VALUE
        );
      }
      continue;
    }
    if (allowUnknown !== true) {
      throw new AxiosError_default("Unknown option " + opt, AxiosError_default.ERR_BAD_OPTION);
    }
  }
}
var validators, deprecatedWarnings, validator_default;
var init_validator = __esm({
  "node_modules/axios/lib/helpers/validator.js"() {
    "use strict";
    init_data();
    init_AxiosError();
    validators = {};
    ["object", "boolean", "number", "function", "string", "symbol"].forEach((type, i) => {
      validators[type] = function validator(thing) {
        return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
      };
    });
    deprecatedWarnings = {};
    validators.transitional = function transitional(validator, version, message) {
      function formatMessage(opt, desc) {
        return "[Axios v" + VERSION + "] Transitional option '" + opt + "'" + desc + (message ? ". " + message : "");
      }
      return (value, opt, opts) => {
        if (validator === false) {
          throw new AxiosError_default(
            formatMessage(opt, " has been removed" + (version ? " in " + version : "")),
            AxiosError_default.ERR_DEPRECATED
          );
        }
        if (version && !deprecatedWarnings[opt]) {
          deprecatedWarnings[opt] = true;
          console.warn(
            formatMessage(
              opt,
              " has been deprecated since v" + version + " and will be removed in the near future"
            )
          );
        }
        return validator ? validator(value, opt, opts) : true;
      };
    };
    validators.spelling = function spelling(correctSpelling) {
      return (value, opt) => {
        console.warn(`${opt} is likely a misspelling of ${correctSpelling}`);
        return true;
      };
    };
    validator_default = {
      assertOptions,
      validators
    };
  }
});

// node_modules/axios/lib/core/Axios.js
var validators2, Axios, Axios_default;
var init_Axios = __esm({
  "node_modules/axios/lib/core/Axios.js"() {
    "use strict";
    init_utils();
    init_buildURL();
    init_InterceptorManager();
    init_dispatchRequest();
    init_mergeConfig();
    init_buildFullPath();
    init_validator();
    init_AxiosHeaders();
    init_transitional();
    validators2 = validator_default.validators;
    Axios = class {
      constructor(instanceConfig) {
        this.defaults = instanceConfig || {};
        this.interceptors = {
          request: new InterceptorManager_default(),
          response: new InterceptorManager_default()
        };
      }
      /**
       * Dispatch a request
       *
       * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
       * @param {?Object} config
       *
       * @returns {Promise} The Promise to be fulfilled
       */
      async request(configOrUrl, config) {
        try {
          return await this._request(configOrUrl, config);
        } catch (err) {
          if (err instanceof Error) {
            let dummy = {};
            Error.captureStackTrace ? Error.captureStackTrace(dummy) : dummy = new Error();
            const stack = (() => {
              if (!dummy.stack) {
                return "";
              }
              const firstNewlineIndex = dummy.stack.indexOf("\n");
              return firstNewlineIndex === -1 ? "" : dummy.stack.slice(firstNewlineIndex + 1);
            })();
            try {
              if (!err.stack) {
                err.stack = stack;
              } else if (stack) {
                const firstNewlineIndex = stack.indexOf("\n");
                const secondNewlineIndex = firstNewlineIndex === -1 ? -1 : stack.indexOf("\n", firstNewlineIndex + 1);
                const stackWithoutTwoTopLines = secondNewlineIndex === -1 ? "" : stack.slice(secondNewlineIndex + 1);
                if (!String(err.stack).endsWith(stackWithoutTwoTopLines)) {
                  err.stack += "\n" + stack;
                }
              }
            } catch (e) {
            }
          }
          throw err;
        }
      }
      _request(configOrUrl, config) {
        if (typeof configOrUrl === "string") {
          config = config || {};
          config.url = configOrUrl;
        } else {
          config = configOrUrl || {};
        }
        config = mergeConfig(this.defaults, config);
        const { transitional: transitional2, paramsSerializer, headers } = config;
        if (transitional2 !== void 0) {
          validator_default.assertOptions(
            transitional2,
            {
              silentJSONParsing: validators2.transitional(validators2.boolean),
              forcedJSONParsing: validators2.transitional(validators2.boolean),
              clarifyTimeoutError: validators2.transitional(validators2.boolean),
              legacyInterceptorReqResOrdering: validators2.transitional(validators2.boolean)
            },
            false
          );
        }
        if (paramsSerializer != null) {
          if (utils_default.isFunction(paramsSerializer)) {
            config.paramsSerializer = {
              serialize: paramsSerializer
            };
          } else {
            validator_default.assertOptions(
              paramsSerializer,
              {
                encode: validators2.function,
                serialize: validators2.function
              },
              true
            );
          }
        }
        if (config.allowAbsoluteUrls !== void 0) {
        } else if (this.defaults.allowAbsoluteUrls !== void 0) {
          config.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls;
        } else {
          config.allowAbsoluteUrls = true;
        }
        validator_default.assertOptions(
          config,
          {
            baseUrl: validators2.spelling("baseURL"),
            withXsrfToken: validators2.spelling("withXSRFToken")
          },
          true
        );
        config.method = (config.method || this.defaults.method || "get").toLowerCase();
        let contextHeaders = headers && utils_default.merge(headers.common, headers[config.method]);
        headers && utils_default.forEach(["delete", "get", "head", "post", "put", "patch", "query", "common"], (method) => {
          delete headers[method];
        });
        config.headers = AxiosHeaders_default.concat(contextHeaders, headers);
        const requestInterceptorChain = [];
        let synchronousRequestInterceptors = true;
        this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
          if (typeof interceptor.runWhen === "function" && interceptor.runWhen(config) === false) {
            return;
          }
          synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;
          const transitional3 = config.transitional || transitional_default;
          const legacyInterceptorReqResOrdering = transitional3 && transitional3.legacyInterceptorReqResOrdering;
          if (legacyInterceptorReqResOrdering) {
            requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
          } else {
            requestInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
          }
        });
        const responseInterceptorChain = [];
        this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
          responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
        });
        let promise;
        let i = 0;
        let len;
        if (!synchronousRequestInterceptors) {
          const chain = [dispatchRequest.bind(this), void 0];
          chain.unshift(...requestInterceptorChain);
          chain.push(...responseInterceptorChain);
          len = chain.length;
          promise = Promise.resolve(config);
          while (i < len) {
            promise = promise.then(chain[i++], chain[i++]);
          }
          return promise;
        }
        len = requestInterceptorChain.length;
        let newConfig = config;
        while (i < len) {
          const onFulfilled = requestInterceptorChain[i++];
          const onRejected = requestInterceptorChain[i++];
          try {
            newConfig = onFulfilled(newConfig);
          } catch (error) {
            onRejected.call(this, error);
            break;
          }
        }
        try {
          promise = dispatchRequest.call(this, newConfig);
        } catch (error) {
          return Promise.reject(error);
        }
        i = 0;
        len = responseInterceptorChain.length;
        while (i < len) {
          promise = promise.then(responseInterceptorChain[i++], responseInterceptorChain[i++]);
        }
        return promise;
      }
      getUri(config) {
        config = mergeConfig(this.defaults, config);
        const fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
        return buildURL(fullPath, config.params, config.paramsSerializer);
      }
    };
    utils_default.forEach(["delete", "get", "head", "options"], function forEachMethodNoData(method) {
      Axios.prototype[method] = function(url, config) {
        return this.request(
          mergeConfig(config || {}, {
            method,
            url,
            data: (config || {}).data
          })
        );
      };
    });
    utils_default.forEach(["post", "put", "patch", "query"], function forEachMethodWithData(method) {
      function generateHTTPMethod(isForm) {
        return function httpMethod(url, data, config) {
          return this.request(
            mergeConfig(config || {}, {
              method,
              headers: isForm ? {
                "Content-Type": "multipart/form-data"
              } : {},
              url,
              data
            })
          );
        };
      }
      Axios.prototype[method] = generateHTTPMethod();
      if (method !== "query") {
        Axios.prototype[method + "Form"] = generateHTTPMethod(true);
      }
    });
    Axios_default = Axios;
  }
});

// node_modules/axios/lib/cancel/CancelToken.js
var CancelToken, CancelToken_default;
var init_CancelToken = __esm({
  "node_modules/axios/lib/cancel/CancelToken.js"() {
    "use strict";
    init_CanceledError();
    CancelToken = class _CancelToken {
      constructor(executor) {
        if (typeof executor !== "function") {
          throw new TypeError("executor must be a function.");
        }
        let resolvePromise;
        this.promise = new Promise(function promiseExecutor(resolve) {
          resolvePromise = resolve;
        });
        const token = this;
        this.promise.then((cancel) => {
          if (!token._listeners) return;
          let i = token._listeners.length;
          while (i-- > 0) {
            token._listeners[i](cancel);
          }
          token._listeners = null;
        });
        this.promise.then = (onfulfilled) => {
          let _resolve;
          const promise = new Promise((resolve) => {
            token.subscribe(resolve);
            _resolve = resolve;
          }).then(onfulfilled);
          promise.cancel = function reject() {
            token.unsubscribe(_resolve);
          };
          return promise;
        };
        executor(function cancel(message, config, request) {
          if (token.reason) {
            return;
          }
          token.reason = new CanceledError_default(message, config, request);
          resolvePromise(token.reason);
        });
      }
      /**
       * Throws a `CanceledError` if cancellation has been requested.
       */
      throwIfRequested() {
        if (this.reason) {
          throw this.reason;
        }
      }
      /**
       * Subscribe to the cancel signal
       */
      subscribe(listener) {
        if (this.reason) {
          listener(this.reason);
          return;
        }
        if (this._listeners) {
          this._listeners.push(listener);
        } else {
          this._listeners = [listener];
        }
      }
      /**
       * Unsubscribe from the cancel signal
       */
      unsubscribe(listener) {
        if (!this._listeners) {
          return;
        }
        const index = this._listeners.indexOf(listener);
        if (index !== -1) {
          this._listeners.splice(index, 1);
        }
      }
      toAbortSignal() {
        const controller = new AbortController();
        const abort = (err) => {
          controller.abort(err);
        };
        this.subscribe(abort);
        controller.signal.unsubscribe = () => this.unsubscribe(abort);
        return controller.signal;
      }
      /**
       * Returns an object that contains a new `CancelToken` and a function that, when called,
       * cancels the `CancelToken`.
       */
      static source() {
        let cancel;
        const token = new _CancelToken(function executor(c) {
          cancel = c;
        });
        return {
          token,
          cancel
        };
      }
    };
    CancelToken_default = CancelToken;
  }
});

// node_modules/axios/lib/helpers/spread.js
function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
}
var init_spread = __esm({
  "node_modules/axios/lib/helpers/spread.js"() {
    "use strict";
  }
});

// node_modules/axios/lib/helpers/isAxiosError.js
function isAxiosError(payload) {
  return utils_default.isObject(payload) && payload.isAxiosError === true;
}
var init_isAxiosError = __esm({
  "node_modules/axios/lib/helpers/isAxiosError.js"() {
    "use strict";
    init_utils();
  }
});

// node_modules/axios/lib/helpers/HttpStatusCode.js
var HttpStatusCode, HttpStatusCode_default;
var init_HttpStatusCode = __esm({
  "node_modules/axios/lib/helpers/HttpStatusCode.js"() {
    HttpStatusCode = {
      Continue: 100,
      SwitchingProtocols: 101,
      Processing: 102,
      EarlyHints: 103,
      Ok: 200,
      Created: 201,
      Accepted: 202,
      NonAuthoritativeInformation: 203,
      NoContent: 204,
      ResetContent: 205,
      PartialContent: 206,
      MultiStatus: 207,
      AlreadyReported: 208,
      ImUsed: 226,
      MultipleChoices: 300,
      MovedPermanently: 301,
      Found: 302,
      SeeOther: 303,
      NotModified: 304,
      UseProxy: 305,
      Unused: 306,
      TemporaryRedirect: 307,
      PermanentRedirect: 308,
      BadRequest: 400,
      Unauthorized: 401,
      PaymentRequired: 402,
      Forbidden: 403,
      NotFound: 404,
      MethodNotAllowed: 405,
      NotAcceptable: 406,
      ProxyAuthenticationRequired: 407,
      RequestTimeout: 408,
      Conflict: 409,
      Gone: 410,
      LengthRequired: 411,
      PreconditionFailed: 412,
      PayloadTooLarge: 413,
      UriTooLong: 414,
      UnsupportedMediaType: 415,
      RangeNotSatisfiable: 416,
      ExpectationFailed: 417,
      ImATeapot: 418,
      MisdirectedRequest: 421,
      UnprocessableEntity: 422,
      Locked: 423,
      FailedDependency: 424,
      TooEarly: 425,
      UpgradeRequired: 426,
      PreconditionRequired: 428,
      TooManyRequests: 429,
      RequestHeaderFieldsTooLarge: 431,
      UnavailableForLegalReasons: 451,
      InternalServerError: 500,
      NotImplemented: 501,
      BadGateway: 502,
      ServiceUnavailable: 503,
      GatewayTimeout: 504,
      HttpVersionNotSupported: 505,
      VariantAlsoNegotiates: 506,
      InsufficientStorage: 507,
      LoopDetected: 508,
      NotExtended: 510,
      NetworkAuthenticationRequired: 511,
      WebServerIsDown: 521,
      ConnectionTimedOut: 522,
      OriginIsUnreachable: 523,
      TimeoutOccurred: 524,
      SslHandshakeFailed: 525,
      InvalidSslCertificate: 526
    };
    Object.entries(HttpStatusCode).forEach(([key, value]) => {
      HttpStatusCode[value] = key;
    });
    HttpStatusCode_default = HttpStatusCode;
  }
});

// node_modules/axios/lib/axios.js
function createInstance(defaultConfig) {
  const context = new Axios_default(defaultConfig);
  const instance = bind(Axios_default.prototype.request, context);
  utils_default.extend(instance, Axios_default.prototype, context, { allOwnKeys: true });
  utils_default.extend(instance, context, null, { allOwnKeys: true });
  instance.create = function create2(instanceConfig) {
    return createInstance(mergeConfig(defaultConfig, instanceConfig));
  };
  return instance;
}
var axios, axios_default;
var init_axios = __esm({
  "node_modules/axios/lib/axios.js"() {
    "use strict";
    init_utils();
    init_bind();
    init_Axios();
    init_mergeConfig();
    init_defaults();
    init_formDataToJSON();
    init_CanceledError();
    init_CancelToken();
    init_isCancel();
    init_data();
    init_toFormData();
    init_AxiosError();
    init_spread();
    init_isAxiosError();
    init_AxiosHeaders();
    init_adapters();
    init_HttpStatusCode();
    axios = createInstance(defaults_default);
    axios.Axios = Axios_default;
    axios.CanceledError = CanceledError_default;
    axios.CancelToken = CancelToken_default;
    axios.isCancel = isCancel;
    axios.VERSION = VERSION;
    axios.toFormData = toFormData_default;
    axios.AxiosError = AxiosError_default;
    axios.Cancel = axios.CanceledError;
    axios.all = function all(promises) {
      return Promise.all(promises);
    };
    axios.spread = spread;
    axios.isAxiosError = isAxiosError;
    axios.mergeConfig = mergeConfig;
    axios.AxiosHeaders = AxiosHeaders_default;
    axios.formToJSON = (thing) => formDataToJSON_default(utils_default.isHTMLForm(thing) ? new FormData(thing) : thing);
    axios.getAdapter = adapters_default.getAdapter;
    axios.HttpStatusCode = HttpStatusCode_default;
    axios.default = axios;
    axios_default = axios;
  }
});

// node_modules/axios/index.js
var Axios2, AxiosError2, CanceledError2, isCancel2, CancelToken2, VERSION2, all2, Cancel, isAxiosError2, spread2, toFormData2, AxiosHeaders2, HttpStatusCode2, formToJSON, getAdapter2, mergeConfig2, create;
var init_axios2 = __esm({
  "node_modules/axios/index.js"() {
    init_axios();
    ({
      Axios: Axios2,
      AxiosError: AxiosError2,
      CanceledError: CanceledError2,
      isCancel: isCancel2,
      CancelToken: CancelToken2,
      VERSION: VERSION2,
      all: all2,
      Cancel,
      isAxiosError: isAxiosError2,
      spread: spread2,
      toFormData: toFormData2,
      AxiosHeaders: AxiosHeaders2,
      HttpStatusCode: HttpStatusCode2,
      formToJSON,
      getAdapter: getAdapter2,
      mergeConfig: mergeConfig2,
      create
    } = axios_default);
  }
});

// src/utils/axios.js
var api, axios_default2;
var init_axios3 = __esm({
  "src/utils/axios.js"() {
    init_axios2();
    api = axios_default.create({
      baseURL: "/api/v1",
      headers: {
        "Content-Type": "application/json"
      }
    });
    api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("icaro_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("icaro_token");
          localStorage.removeItem("icaro_user");
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
    axios_default2 = api;
  }
});

// node_modules/dexie/dist/dexie.js
var require_dexie = __commonJS({
  "node_modules/dexie/dist/dexie.js"(exports, module2) {
    (function(global2, factory2) {
      typeof exports === "object" && typeof module2 !== "undefined" ? module2.exports = factory2() : typeof define === "function" && define.amd ? define(factory2) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, global2.Dexie = factory2());
    })(exports, (function() {
      "use strict";
      var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() {
          this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      }
      var __assign = function() {
        __assign = Object.assign || function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
      }
      typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      var _global2 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : global;
      var keys = Object.keys;
      var isArray2 = Array.isArray;
      if (typeof Promise !== "undefined" && !_global2.Promise) {
        _global2.Promise = Promise;
      }
      function extend2(obj, extension) {
        if (typeof extension !== "object")
          return obj;
        keys(extension).forEach(function(key) {
          obj[key] = extension[key];
        });
        return obj;
      }
      var getProto = Object.getPrototypeOf;
      var _hasOwn = {}.hasOwnProperty;
      function hasOwn(obj, prop) {
        return _hasOwn.call(obj, prop);
      }
      function props(proto, extension) {
        if (typeof extension === "function")
          extension = extension(getProto(proto));
        (typeof Reflect === "undefined" ? keys : Reflect.ownKeys)(extension).forEach(function(key) {
          setProp(proto, key, extension[key]);
        });
      }
      var defineProperty = Object.defineProperty;
      function setProp(obj, prop, functionOrGetSet, options) {
        defineProperty(obj, prop, extend2(functionOrGetSet && hasOwn(functionOrGetSet, "get") && typeof functionOrGetSet.get === "function" ? {
          get: functionOrGetSet.get,
          set: functionOrGetSet.set,
          configurable: true
        } : { value: functionOrGetSet, configurable: true, writable: true }, options));
      }
      function derive(Child) {
        return {
          from: function(Parent) {
            Child.prototype = Object.create(Parent.prototype);
            setProp(Child.prototype, "constructor", Child);
            return {
              extend: props.bind(null, Child.prototype)
            };
          }
        };
      }
      var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
      function getPropertyDescriptor(obj, prop) {
        var pd = getOwnPropertyDescriptor(obj, prop);
        var proto;
        return pd || (proto = getProto(obj)) && getPropertyDescriptor(proto, prop);
      }
      var _slice = [].slice;
      function slice(args, start, end) {
        return _slice.call(args, start, end);
      }
      function override(origFunc, overridedFactory) {
        return overridedFactory(origFunc);
      }
      function assert(b) {
        if (!b)
          throw new Error("Assertion Failed");
      }
      function asap$1(fn) {
        if (_global2.setImmediate)
          setImmediate(fn);
        else
          setTimeout(fn, 0);
      }
      function arrayToObject2(array, extractor) {
        return array.reduce(function(result, item, i) {
          var nameAndValue = extractor(item, i);
          if (nameAndValue)
            result[nameAndValue[0]] = nameAndValue[1];
          return result;
        }, {});
      }
      function getByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string" && hasOwn(obj, keyPath))
          return obj[keyPath];
        if (!keyPath)
          return obj;
        if (typeof keyPath !== "string") {
          var rv = [];
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            var val = getByKeyPath(obj, keyPath[i]);
            rv.push(val);
          }
          return rv;
        }
        var period = keyPath.indexOf(".");
        if (period !== -1) {
          var innerObj = obj[keyPath.substr(0, period)];
          return innerObj == null ? void 0 : getByKeyPath(innerObj, keyPath.substr(period + 1));
        }
        return void 0;
      }
      function setByKeyPath(obj, keyPath, value) {
        if (!obj || keyPath === void 0)
          return;
        if ("isFrozen" in Object && Object.isFrozen(obj))
          return;
        if (typeof keyPath !== "string" && "length" in keyPath) {
          assert(typeof value !== "string" && "length" in value);
          for (var i = 0, l = keyPath.length; i < l; ++i) {
            setByKeyPath(obj, keyPath[i], value[i]);
          }
        } else {
          var period = keyPath.indexOf(".");
          if (period !== -1) {
            var currentKeyPath = keyPath.substr(0, period);
            var remainingKeyPath = keyPath.substr(period + 1);
            if (remainingKeyPath === "")
              if (value === void 0) {
                if (isArray2(obj) && !isNaN(parseInt(currentKeyPath)))
                  obj.splice(currentKeyPath, 1);
                else
                  delete obj[currentKeyPath];
              } else
                obj[currentKeyPath] = value;
            else {
              var innerObj = obj[currentKeyPath];
              if (!innerObj || !hasOwn(obj, currentKeyPath))
                innerObj = obj[currentKeyPath] = {};
              setByKeyPath(innerObj, remainingKeyPath, value);
            }
          } else {
            if (value === void 0) {
              if (isArray2(obj) && !isNaN(parseInt(keyPath)))
                obj.splice(keyPath, 1);
              else
                delete obj[keyPath];
            } else
              obj[keyPath] = value;
          }
        }
      }
      function delByKeyPath(obj, keyPath) {
        if (typeof keyPath === "string")
          setByKeyPath(obj, keyPath, void 0);
        else if ("length" in keyPath)
          [].map.call(keyPath, function(kp) {
            setByKeyPath(obj, kp, void 0);
          });
      }
      function shallowClone(obj) {
        var rv = {};
        for (var m in obj) {
          if (hasOwn(obj, m))
            rv[m] = obj[m];
        }
        return rv;
      }
      var concat = [].concat;
      function flatten(a) {
        return concat.apply([], a);
      }
      var intrinsicTypeNames = "BigUint64Array,BigInt64Array,Array,Boolean,String,Date,RegExp,Blob,File,FileList,FileSystemFileHandle,FileSystemDirectoryHandle,ArrayBuffer,DataView,Uint8ClampedArray,ImageBitmap,ImageData,Map,Set,CryptoKey".split(",").concat(flatten([8, 16, 32, 64].map(function(num) {
        return ["Int", "Uint", "Float"].map(function(t) {
          return t + num + "Array";
        });
      }))).filter(function(t) {
        return _global2[t];
      });
      var intrinsicTypes = new Set(intrinsicTypeNames.map(function(t) {
        return _global2[t];
      }));
      function cloneSimpleObjectTree(o) {
        var rv = {};
        for (var k in o)
          if (hasOwn(o, k)) {
            var v = o[k];
            rv[k] = !v || typeof v !== "object" || intrinsicTypes.has(v.constructor) ? v : cloneSimpleObjectTree(v);
          }
        return rv;
      }
      var circularRefs = null;
      function deepClone(any) {
        circularRefs = /* @__PURE__ */ new WeakMap();
        var rv = innerDeepClone(any);
        circularRefs = null;
        return rv;
      }
      function innerDeepClone(x) {
        if (!x || typeof x !== "object")
          return x;
        var rv = circularRefs.get(x);
        if (rv)
          return rv;
        if (isArray2(x)) {
          rv = [];
          circularRefs.set(x, rv);
          for (var i = 0, l = x.length; i < l; ++i) {
            rv.push(innerDeepClone(x[i]));
          }
        } else if (intrinsicTypes.has(x.constructor)) {
          rv = x;
        } else {
          var proto = getProto(x);
          rv = proto === Object.prototype ? {} : Object.create(proto);
          circularRefs.set(x, rv);
          for (var prop in x) {
            if (hasOwn(x, prop)) {
              rv[prop] = innerDeepClone(x[prop]);
            }
          }
        }
        return rv;
      }
      var toString3 = {}.toString;
      function toStringTag2(o) {
        return toString3.call(o).slice(8, -1);
      }
      var iteratorSymbol = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
      var getIteratorOf = typeof iteratorSymbol === "symbol" ? function(x) {
        var i;
        return x != null && (i = x[iteratorSymbol]) && i.apply(x);
      } : function() {
        return null;
      };
      function delArrayItem(a, x) {
        var i = a.indexOf(x);
        if (i >= 0)
          a.splice(i, 1);
        return i >= 0;
      }
      var NO_CHAR_ARRAY = {};
      function getArrayOf(arrayLike) {
        var i, a, x, it;
        if (arguments.length === 1) {
          if (isArray2(arrayLike))
            return arrayLike.slice();
          if (this === NO_CHAR_ARRAY && typeof arrayLike === "string")
            return [arrayLike];
          if (it = getIteratorOf(arrayLike)) {
            a = [];
            while (x = it.next(), !x.done)
              a.push(x.value);
            return a;
          }
          if (arrayLike == null)
            return [arrayLike];
          i = arrayLike.length;
          if (typeof i === "number") {
            a = new Array(i);
            while (i--)
              a[i] = arrayLike[i];
            return a;
          }
          return [arrayLike];
        }
        i = arguments.length;
        a = new Array(i);
        while (i--)
          a[i] = arguments[i];
        return a;
      }
      var isAsyncFunction = typeof Symbol !== "undefined" ? function(fn) {
        return fn[Symbol.toStringTag] === "AsyncFunction";
      } : function() {
        return false;
      };
      var dexieErrorNames = [
        "Modify",
        "Bulk",
        "OpenFailed",
        "VersionChange",
        "Schema",
        "Upgrade",
        "InvalidTable",
        "MissingAPI",
        "NoSuchDatabase",
        "InvalidArgument",
        "SubTransaction",
        "Unsupported",
        "Internal",
        "DatabaseClosed",
        "PrematureCommit",
        "ForeignAwait"
      ];
      var idbDomErrorNames = [
        "Unknown",
        "Constraint",
        "Data",
        "TransactionInactive",
        "ReadOnly",
        "Version",
        "NotFound",
        "InvalidState",
        "InvalidAccess",
        "Abort",
        "Timeout",
        "QuotaExceeded",
        "Syntax",
        "DataClone"
      ];
      var errorList = dexieErrorNames.concat(idbDomErrorNames);
      var defaultTexts = {
        VersionChanged: "Database version changed by other database connection",
        DatabaseClosed: "Database has been closed",
        Abort: "Transaction aborted",
        TransactionInactive: "Transaction has already completed or failed",
        MissingAPI: "IndexedDB API missing. Please visit https://tinyurl.com/y2uuvskb"
      };
      function DexieError(name, msg) {
        this.name = name;
        this.message = msg;
      }
      derive(DexieError).from(Error).extend({
        toString: function() {
          return this.name + ": " + this.message;
        }
      });
      function getMultiErrorMessage(msg, failures) {
        return msg + ". Errors: " + Object.keys(failures).map(function(key) {
          return failures[key].toString();
        }).filter(function(v, i, s) {
          return s.indexOf(v) === i;
        }).join("\n");
      }
      function ModifyError(msg, failures, successCount, failedKeys) {
        this.failures = failures;
        this.failedKeys = failedKeys;
        this.successCount = successCount;
        this.message = getMultiErrorMessage(msg, failures);
      }
      derive(ModifyError).from(DexieError);
      function BulkError(msg, failures) {
        this.name = "BulkError";
        this.failures = Object.keys(failures).map(function(pos) {
          return failures[pos];
        });
        this.failuresByPos = failures;
        this.message = getMultiErrorMessage(msg, this.failures);
      }
      derive(BulkError).from(DexieError);
      var errnames = errorList.reduce(function(obj, name) {
        return obj[name] = name + "Error", obj;
      }, {});
      var BaseException = DexieError;
      var exceptions = errorList.reduce(function(obj, name) {
        var fullName = name + "Error";
        function DexieError2(msgOrInner, inner) {
          this.name = fullName;
          if (!msgOrInner) {
            this.message = defaultTexts[name] || fullName;
            this.inner = null;
          } else if (typeof msgOrInner === "string") {
            this.message = "".concat(msgOrInner).concat(!inner ? "" : "\n " + inner);
            this.inner = inner || null;
          } else if (typeof msgOrInner === "object") {
            this.message = "".concat(msgOrInner.name, " ").concat(msgOrInner.message);
            this.inner = msgOrInner;
          }
        }
        derive(DexieError2).from(BaseException);
        obj[name] = DexieError2;
        return obj;
      }, {});
      exceptions.Syntax = SyntaxError;
      exceptions.Type = TypeError;
      exceptions.Range = RangeError;
      var exceptionMap = idbDomErrorNames.reduce(function(obj, name) {
        obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      function mapError(domError, message) {
        if (!domError || domError instanceof DexieError || domError instanceof TypeError || domError instanceof SyntaxError || !domError.name || !exceptionMap[domError.name])
          return domError;
        var rv = new exceptionMap[domError.name](message || domError.message, domError);
        if ("stack" in domError) {
          setProp(rv, "stack", {
            get: function() {
              return this.inner.stack;
            }
          });
        }
        return rv;
      }
      var fullNameExceptions = errorList.reduce(function(obj, name) {
        if (["Syntax", "Type", "Range"].indexOf(name) === -1)
          obj[name + "Error"] = exceptions[name];
        return obj;
      }, {});
      fullNameExceptions.ModifyError = ModifyError;
      fullNameExceptions.DexieError = DexieError;
      fullNameExceptions.BulkError = BulkError;
      function nop() {
      }
      function mirror(val) {
        return val;
      }
      function pureFunctionChain(f1, f2) {
        if (f1 == null || f1 === mirror)
          return f2;
        return function(val) {
          return f2(f1(val));
        };
      }
      function callBoth(on1, on2) {
        return function() {
          on1.apply(this, arguments);
          on2.apply(this, arguments);
        };
      }
      function hookCreatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res !== void 0)
            arguments[0] = res;
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res2 !== void 0 ? res2 : res;
        };
      }
      function hookDeletingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          f1.apply(this, arguments);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = this.onerror = null;
          f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
        };
      }
      function hookUpdatingChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function(modifications) {
          var res = f1.apply(this, arguments);
          extend2(modifications, res);
          var onsuccess = this.onsuccess, onerror = this.onerror;
          this.onsuccess = null;
          this.onerror = null;
          var res2 = f2.apply(this, arguments);
          if (onsuccess)
            this.onsuccess = this.onsuccess ? callBoth(onsuccess, this.onsuccess) : onsuccess;
          if (onerror)
            this.onerror = this.onerror ? callBoth(onerror, this.onerror) : onerror;
          return res === void 0 ? res2 === void 0 ? void 0 : res2 : extend2(res, res2);
        };
      }
      function reverseStoppableEventChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          if (f2.apply(this, arguments) === false)
            return false;
          return f1.apply(this, arguments);
        };
      }
      function promisableChain(f1, f2) {
        if (f1 === nop)
          return f2;
        return function() {
          var res = f1.apply(this, arguments);
          if (res && typeof res.then === "function") {
            var thiz = this, i = arguments.length, args = new Array(i);
            while (i--)
              args[i] = arguments[i];
            return res.then(function() {
              return f2.apply(thiz, args);
            });
          }
          return f2.apply(this, arguments);
        };
      }
      var debug = typeof location !== "undefined" && /^(http|https):\/\/(localhost|127\.0\.0\.1)/.test(location.href);
      function setDebug(value, filter2) {
        debug = value;
      }
      var INTERNAL = {};
      var ZONE_ECHO_LIMIT = 100, _a$1 = typeof Promise === "undefined" ? [] : (function() {
        var globalP = Promise.resolve();
        if (typeof crypto === "undefined" || !crypto.subtle)
          return [globalP, getProto(globalP), globalP];
        var nativeP = crypto.subtle.digest("SHA-512", new Uint8Array([0]));
        return [nativeP, getProto(nativeP), globalP];
      })(), resolvedNativePromise = _a$1[0], nativePromiseProto = _a$1[1], resolvedGlobalPromise = _a$1[2], nativePromiseThen = nativePromiseProto && nativePromiseProto.then;
      var NativePromise = resolvedNativePromise && resolvedNativePromise.constructor;
      var patchGlobalPromise = !!resolvedGlobalPromise;
      function schedulePhysicalTick() {
        queueMicrotask(physicalTick);
      }
      var asap2 = function(callback, args) {
        microtickQueue.push([callback, args]);
        if (needsNewPhysicalTick) {
          schedulePhysicalTick();
          needsNewPhysicalTick = false;
        }
      };
      var isOutsideMicroTick = true, needsNewPhysicalTick = true, unhandledErrors = [], rejectingErrors = [], rejectionMapper = mirror;
      var globalPSD = {
        id: "global",
        global: true,
        ref: 0,
        unhandleds: [],
        onunhandled: nop,
        pgp: false,
        env: {},
        finalize: nop
      };
      var PSD = globalPSD;
      var microtickQueue = [];
      var numScheduledCalls = 0;
      var tickFinalizers = [];
      function DexiePromise(fn) {
        if (typeof this !== "object")
          throw new TypeError("Promises must be constructed via new");
        this._listeners = [];
        this._lib = false;
        var psd = this._PSD = PSD;
        if (typeof fn !== "function") {
          if (fn !== INTERNAL)
            throw new TypeError("Not a function");
          this._state = arguments[1];
          this._value = arguments[2];
          if (this._state === false)
            handleRejection(this, this._value);
          return;
        }
        this._state = null;
        this._value = null;
        ++psd.ref;
        executePromiseTask(this, fn);
      }
      var thenProp = {
        get: function() {
          var psd = PSD, microTaskId = totalEchoes;
          function then(onFulfilled, onRejected) {
            var _this = this;
            var possibleAwait = !psd.global && (psd !== PSD || microTaskId !== totalEchoes);
            var cleanup = possibleAwait && !decrementExpectedAwaits();
            var rv = new DexiePromise(function(resolve, reject) {
              propagateToListener(_this, new Listener(nativeAwaitCompatibleWrap(onFulfilled, psd, possibleAwait, cleanup), nativeAwaitCompatibleWrap(onRejected, psd, possibleAwait, cleanup), resolve, reject, psd));
            });
            if (this._consoleTask)
              rv._consoleTask = this._consoleTask;
            return rv;
          }
          then.prototype = INTERNAL;
          return then;
        },
        set: function(value) {
          setProp(this, "then", value && value.prototype === INTERNAL ? thenProp : {
            get: function() {
              return value;
            },
            set: thenProp.set
          });
        }
      };
      props(DexiePromise.prototype, {
        then: thenProp,
        _then: function(onFulfilled, onRejected) {
          propagateToListener(this, new Listener(null, null, onFulfilled, onRejected, PSD));
        },
        catch: function(onRejected) {
          if (arguments.length === 1)
            return this.then(null, onRejected);
          var type2 = arguments[0], handler = arguments[1];
          return typeof type2 === "function" ? this.then(null, function(err) {
            return err instanceof type2 ? handler(err) : PromiseReject(err);
          }) : this.then(null, function(err) {
            return err && err.name === type2 ? handler(err) : PromiseReject(err);
          });
        },
        finally: function(onFinally) {
          return this.then(function(value) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return value;
            });
          }, function(err) {
            return DexiePromise.resolve(onFinally()).then(function() {
              return PromiseReject(err);
            });
          });
        },
        timeout: function(ms, msg) {
          var _this = this;
          return ms < Infinity ? new DexiePromise(function(resolve, reject) {
            var handle = setTimeout(function() {
              return reject(new exceptions.Timeout(msg));
            }, ms);
            _this.then(resolve, reject).finally(clearTimeout.bind(null, handle));
          }) : this;
        }
      });
      if (typeof Symbol !== "undefined" && Symbol.toStringTag)
        setProp(DexiePromise.prototype, Symbol.toStringTag, "Dexie.Promise");
      globalPSD.env = snapShot();
      function Listener(onFulfilled, onRejected, resolve, reject, zone) {
        this.onFulfilled = typeof onFulfilled === "function" ? onFulfilled : null;
        this.onRejected = typeof onRejected === "function" ? onRejected : null;
        this.resolve = resolve;
        this.reject = reject;
        this.psd = zone;
      }
      props(DexiePromise, {
        all: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            if (values.length === 0)
              resolve([]);
            var remaining = values.length;
            values.forEach(function(a, i) {
              return DexiePromise.resolve(a).then(function(x) {
                values[i] = x;
                if (!--remaining)
                  resolve(values);
              }, reject);
            });
          });
        },
        resolve: function(value) {
          if (value instanceof DexiePromise)
            return value;
          if (value && typeof value.then === "function")
            return new DexiePromise(function(resolve, reject) {
              value.then(resolve, reject);
            });
          var rv = new DexiePromise(INTERNAL, true, value);
          return rv;
        },
        reject: PromiseReject,
        race: function() {
          var values = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
          return new DexiePromise(function(resolve, reject) {
            values.map(function(value) {
              return DexiePromise.resolve(value).then(resolve, reject);
            });
          });
        },
        PSD: {
          get: function() {
            return PSD;
          },
          set: function(value) {
            return PSD = value;
          }
        },
        totalEchoes: { get: function() {
          return totalEchoes;
        } },
        newPSD: newScope,
        usePSD,
        scheduler: {
          get: function() {
            return asap2;
          },
          set: function(value) {
            asap2 = value;
          }
        },
        rejectionMapper: {
          get: function() {
            return rejectionMapper;
          },
          set: function(value) {
            rejectionMapper = value;
          }
        },
        follow: function(fn, zoneProps) {
          return new DexiePromise(function(resolve, reject) {
            return newScope(function(resolve2, reject2) {
              var psd = PSD;
              psd.unhandleds = [];
              psd.onunhandled = reject2;
              psd.finalize = callBoth(function() {
                var _this = this;
                run_at_end_of_this_or_next_physical_tick(function() {
                  _this.unhandleds.length === 0 ? resolve2() : reject2(_this.unhandleds[0]);
                });
              }, psd.finalize);
              fn();
            }, zoneProps, resolve, reject);
          });
        }
      });
      if (NativePromise) {
        if (NativePromise.allSettled)
          setProp(DexiePromise, "allSettled", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve) {
              if (possiblePromises.length === 0)
                resolve([]);
              var remaining = possiblePromises.length;
              var results = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return results[i] = { status: "fulfilled", value };
                }, function(reason) {
                  return results[i] = { status: "rejected", reason };
                }).then(function() {
                  return --remaining || resolve(results);
                });
              });
            });
          });
        if (NativePromise.any && typeof AggregateError !== "undefined")
          setProp(DexiePromise, "any", function() {
            var possiblePromises = getArrayOf.apply(null, arguments).map(onPossibleParallellAsync);
            return new DexiePromise(function(resolve, reject) {
              if (possiblePromises.length === 0)
                reject(new AggregateError([]));
              var remaining = possiblePromises.length;
              var failures = new Array(remaining);
              possiblePromises.forEach(function(p, i) {
                return DexiePromise.resolve(p).then(function(value) {
                  return resolve(value);
                }, function(failure) {
                  failures[i] = failure;
                  if (!--remaining)
                    reject(new AggregateError(failures));
                });
              });
            });
          });
        if (NativePromise.withResolvers)
          DexiePromise.withResolvers = NativePromise.withResolvers;
      }
      function executePromiseTask(promise, fn) {
        try {
          fn(function(value) {
            if (promise._state !== null)
              return;
            if (value === promise)
              throw new TypeError("A promise cannot be resolved with itself.");
            var shouldExecuteTick = promise._lib && beginMicroTickScope();
            if (value && typeof value.then === "function") {
              executePromiseTask(promise, function(resolve, reject) {
                value instanceof DexiePromise ? value._then(resolve, reject) : value.then(resolve, reject);
              });
            } else {
              promise._state = true;
              promise._value = value;
              propagateAllListeners(promise);
            }
            if (shouldExecuteTick)
              endMicroTickScope();
          }, handleRejection.bind(null, promise));
        } catch (ex) {
          handleRejection(promise, ex);
        }
      }
      function handleRejection(promise, reason) {
        rejectingErrors.push(reason);
        if (promise._state !== null)
          return;
        var shouldExecuteTick = promise._lib && beginMicroTickScope();
        reason = rejectionMapper(reason);
        promise._state = false;
        promise._value = reason;
        addPossiblyUnhandledError(promise);
        propagateAllListeners(promise);
        if (shouldExecuteTick)
          endMicroTickScope();
      }
      function propagateAllListeners(promise) {
        var listeners = promise._listeners;
        promise._listeners = [];
        for (var i = 0, len = listeners.length; i < len; ++i) {
          propagateToListener(promise, listeners[i]);
        }
        var psd = promise._PSD;
        --psd.ref || psd.finalize();
        if (numScheduledCalls === 0) {
          ++numScheduledCalls;
          asap2(function() {
            if (--numScheduledCalls === 0)
              finalizePhysicalTick();
          }, []);
        }
      }
      function propagateToListener(promise, listener) {
        if (promise._state === null) {
          promise._listeners.push(listener);
          return;
        }
        var cb = promise._state ? listener.onFulfilled : listener.onRejected;
        if (cb === null) {
          return (promise._state ? listener.resolve : listener.reject)(promise._value);
        }
        ++listener.psd.ref;
        ++numScheduledCalls;
        asap2(callListener, [cb, promise, listener]);
      }
      function callListener(cb, promise, listener) {
        try {
          var ret, value = promise._value;
          if (!promise._state && rejectingErrors.length)
            rejectingErrors = [];
          ret = debug && promise._consoleTask ? promise._consoleTask.run(function() {
            return cb(value);
          }) : cb(value);
          if (!promise._state && rejectingErrors.indexOf(value) === -1) {
            markErrorAsHandled(promise);
          }
          listener.resolve(ret);
        } catch (e) {
          listener.reject(e);
        } finally {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
          --listener.psd.ref || listener.psd.finalize();
        }
      }
      function physicalTick() {
        usePSD(globalPSD, function() {
          beginMicroTickScope() && endMicroTickScope();
        });
      }
      function beginMicroTickScope() {
        var wasRootExec = isOutsideMicroTick;
        isOutsideMicroTick = false;
        needsNewPhysicalTick = false;
        return wasRootExec;
      }
      function endMicroTickScope() {
        var callbacks, i, l;
        do {
          while (microtickQueue.length > 0) {
            callbacks = microtickQueue;
            microtickQueue = [];
            l = callbacks.length;
            for (i = 0; i < l; ++i) {
              var item = callbacks[i];
              item[0].apply(null, item[1]);
            }
          }
        } while (microtickQueue.length > 0);
        isOutsideMicroTick = true;
        needsNewPhysicalTick = true;
      }
      function finalizePhysicalTick() {
        var unhandledErrs = unhandledErrors;
        unhandledErrors = [];
        unhandledErrs.forEach(function(p) {
          p._PSD.onunhandled.call(null, p._value, p);
        });
        var finalizers = tickFinalizers.slice(0);
        var i = finalizers.length;
        while (i)
          finalizers[--i]();
      }
      function run_at_end_of_this_or_next_physical_tick(fn) {
        function finalizer() {
          fn();
          tickFinalizers.splice(tickFinalizers.indexOf(finalizer), 1);
        }
        tickFinalizers.push(finalizer);
        ++numScheduledCalls;
        asap2(function() {
          if (--numScheduledCalls === 0)
            finalizePhysicalTick();
        }, []);
      }
      function addPossiblyUnhandledError(promise) {
        if (!unhandledErrors.some(function(p) {
          return p._value === promise._value;
        }))
          unhandledErrors.push(promise);
      }
      function markErrorAsHandled(promise) {
        var i = unhandledErrors.length;
        while (i)
          if (unhandledErrors[--i]._value === promise._value) {
            unhandledErrors.splice(i, 1);
            return;
          }
      }
      function PromiseReject(reason) {
        return new DexiePromise(INTERNAL, false, reason);
      }
      function wrap(fn, errorCatcher) {
        var psd = PSD;
        return function() {
          var wasRootExec = beginMicroTickScope(), outerScope = PSD;
          try {
            switchToZone(psd, true);
            return fn.apply(this, arguments);
          } catch (e) {
            errorCatcher && errorCatcher(e);
          } finally {
            switchToZone(outerScope, false);
            if (wasRootExec)
              endMicroTickScope();
          }
        };
      }
      var task = { awaits: 0, echoes: 0, id: 0 };
      var taskCounter = 0;
      var zoneStack = [];
      var zoneEchoes = 0;
      var totalEchoes = 0;
      var zone_id_counter = 0;
      function newScope(fn, props2, a1, a2) {
        var parent = PSD, psd = Object.create(parent);
        psd.parent = parent;
        psd.ref = 0;
        psd.global = false;
        psd.id = ++zone_id_counter;
        globalPSD.env;
        psd.env = patchGlobalPromise ? {
          Promise: DexiePromise,
          PromiseProp: {
            value: DexiePromise,
            configurable: true,
            writable: true
          },
          all: DexiePromise.all,
          race: DexiePromise.race,
          allSettled: DexiePromise.allSettled,
          any: DexiePromise.any,
          resolve: DexiePromise.resolve,
          reject: DexiePromise.reject
        } : {};
        if (props2)
          extend2(psd, props2);
        ++parent.ref;
        psd.finalize = function() {
          --this.parent.ref || this.parent.finalize();
        };
        var rv = usePSD(psd, fn, a1, a2);
        if (psd.ref === 0)
          psd.finalize();
        return rv;
      }
      function incrementExpectedAwaits() {
        if (!task.id)
          task.id = ++taskCounter;
        ++task.awaits;
        task.echoes += ZONE_ECHO_LIMIT;
        return task.id;
      }
      function decrementExpectedAwaits() {
        if (!task.awaits)
          return false;
        if (--task.awaits === 0)
          task.id = 0;
        task.echoes = task.awaits * ZONE_ECHO_LIMIT;
        return true;
      }
      if (("" + nativePromiseThen).indexOf("[native code]") === -1) {
        incrementExpectedAwaits = decrementExpectedAwaits = nop;
      }
      function onPossibleParallellAsync(possiblePromise) {
        if (task.echoes && possiblePromise && possiblePromise.constructor === NativePromise) {
          incrementExpectedAwaits();
          return possiblePromise.then(function(x) {
            decrementExpectedAwaits();
            return x;
          }, function(e) {
            decrementExpectedAwaits();
            return rejection(e);
          });
        }
        return possiblePromise;
      }
      function zoneEnterEcho(targetZone) {
        ++totalEchoes;
        if (!task.echoes || --task.echoes === 0) {
          task.echoes = task.awaits = task.id = 0;
        }
        zoneStack.push(PSD);
        switchToZone(targetZone, true);
      }
      function zoneLeaveEcho() {
        var zone = zoneStack[zoneStack.length - 1];
        zoneStack.pop();
        switchToZone(zone, false);
      }
      function switchToZone(targetZone, bEnteringZone) {
        var currentZone = PSD;
        if (bEnteringZone ? task.echoes && (!zoneEchoes++ || targetZone !== PSD) : zoneEchoes && (!--zoneEchoes || targetZone !== PSD)) {
          queueMicrotask(bEnteringZone ? zoneEnterEcho.bind(null, targetZone) : zoneLeaveEcho);
        }
        if (targetZone === PSD)
          return;
        PSD = targetZone;
        if (currentZone === globalPSD)
          globalPSD.env = snapShot();
        if (patchGlobalPromise) {
          var GlobalPromise = globalPSD.env.Promise;
          var targetEnv = targetZone.env;
          if (currentZone.global || targetZone.global) {
            Object.defineProperty(_global2, "Promise", targetEnv.PromiseProp);
            GlobalPromise.all = targetEnv.all;
            GlobalPromise.race = targetEnv.race;
            GlobalPromise.resolve = targetEnv.resolve;
            GlobalPromise.reject = targetEnv.reject;
            if (targetEnv.allSettled)
              GlobalPromise.allSettled = targetEnv.allSettled;
            if (targetEnv.any)
              GlobalPromise.any = targetEnv.any;
          }
        }
      }
      function snapShot() {
        var GlobalPromise = _global2.Promise;
        return patchGlobalPromise ? {
          Promise: GlobalPromise,
          PromiseProp: Object.getOwnPropertyDescriptor(_global2, "Promise"),
          all: GlobalPromise.all,
          race: GlobalPromise.race,
          allSettled: GlobalPromise.allSettled,
          any: GlobalPromise.any,
          resolve: GlobalPromise.resolve,
          reject: GlobalPromise.reject
        } : {};
      }
      function usePSD(psd, fn, a1, a2, a3) {
        var outerScope = PSD;
        try {
          switchToZone(psd, true);
          return fn(a1, a2, a3);
        } finally {
          switchToZone(outerScope, false);
        }
      }
      function nativeAwaitCompatibleWrap(fn, zone, possibleAwait, cleanup) {
        return typeof fn !== "function" ? fn : function() {
          var outerZone = PSD;
          if (possibleAwait)
            incrementExpectedAwaits();
          switchToZone(zone, true);
          try {
            return fn.apply(this, arguments);
          } finally {
            switchToZone(outerZone, false);
            if (cleanup)
              queueMicrotask(decrementExpectedAwaits);
          }
        };
      }
      function execInGlobalContext(cb) {
        if (Promise === NativePromise && task.echoes === 0) {
          if (zoneEchoes === 0) {
            cb();
          } else {
            enqueueNativeMicroTask(cb);
          }
        } else {
          setTimeout(cb, 0);
        }
      }
      var rejection = DexiePromise.reject;
      function tempTransaction(db2, mode, storeNames, fn) {
        if (!db2.idbdb || !db2._state.openComplete && !PSD.letThrough && !db2._vip) {
          if (db2._state.openComplete) {
            return rejection(new exceptions.DatabaseClosed(db2._state.dbOpenError));
          }
          if (!db2._state.isBeingOpened) {
            if (!db2._state.autoOpen)
              return rejection(new exceptions.DatabaseClosed());
            db2.open().catch(nop);
          }
          return db2._state.dbReadyPromise.then(function() {
            return tempTransaction(db2, mode, storeNames, fn);
          });
        } else {
          var trans = db2._createTransaction(mode, storeNames, db2._dbSchema);
          try {
            trans.create();
            db2._state.PR1398_maxLoop = 3;
          } catch (ex) {
            if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
              console.warn("Dexie: Need to reopen db");
              db2.close({ disableAutoOpen: false });
              return db2.open().then(function() {
                return tempTransaction(db2, mode, storeNames, fn);
              });
            }
            return rejection(ex);
          }
          return trans._promise(mode, function(resolve, reject) {
            return newScope(function() {
              PSD.trans = trans;
              return fn(resolve, reject, trans);
            });
          }).then(function(result) {
            if (mode === "readwrite")
              try {
                trans.idbtrans.commit();
              } catch (_a2) {
              }
            return mode === "readonly" ? result : trans._completion.then(function() {
              return result;
            });
          });
        }
      }
      var DEXIE_VERSION = "4.4.2";
      var maxString = String.fromCharCode(65535);
      var minKey = -Infinity;
      var INVALID_KEY_ARGUMENT = "Invalid key provided. Keys must be of type string, number, Date or Array<string | number | Date>.";
      var STRING_EXPECTED = "String expected.";
      var DEFAULT_MAX_CONNECTIONS = 1e3;
      var DBNAMES_DB = "__dbnames";
      var READONLY = "readonly";
      var READWRITE = "readwrite";
      function combine(filter1, filter2) {
        return filter1 ? filter2 ? function() {
          return filter1.apply(this, arguments) && filter2.apply(this, arguments);
        } : filter1 : filter2;
      }
      var AnyRange = {
        type: 3,
        lower: -Infinity,
        lowerOpen: false,
        upper: [[]],
        upperOpen: false
      };
      function workaroundForUndefinedPrimKey(keyPath) {
        return typeof keyPath === "string" && !/\./.test(keyPath) ? function(obj) {
          if (obj[keyPath] === void 0 && keyPath in obj) {
            obj = deepClone(obj);
            delete obj[keyPath];
          }
          return obj;
        } : function(obj) {
          return obj;
        };
      }
      function Entity2() {
        throw exceptions.Type("Entity instances must never be new:ed. Instances are generated by the framework bypassing the constructor.");
      }
      function cmp2(a, b) {
        try {
          var ta = type(a);
          var tb = type(b);
          if (ta !== tb) {
            if (ta === "Array")
              return 1;
            if (tb === "Array")
              return -1;
            if (ta === "binary")
              return 1;
            if (tb === "binary")
              return -1;
            if (ta === "string")
              return 1;
            if (tb === "string")
              return -1;
            if (ta === "Date")
              return 1;
            if (tb !== "Date")
              return NaN;
            return -1;
          }
          switch (ta) {
            case "number":
            case "Date":
            case "string":
              return a > b ? 1 : a < b ? -1 : 0;
            case "binary": {
              return compareUint8Arrays(getUint8Array(a), getUint8Array(b));
            }
            case "Array":
              return compareArrays(a, b);
          }
        } catch (_a2) {
        }
        return NaN;
      }
      function compareArrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          var res = cmp2(a[i], b[i]);
          if (res !== 0)
            return res;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function compareUint8Arrays(a, b) {
        var al = a.length;
        var bl = b.length;
        var l = al < bl ? al : bl;
        for (var i = 0; i < l; ++i) {
          if (a[i] !== b[i])
            return a[i] < b[i] ? -1 : 1;
        }
        return al === bl ? 0 : al < bl ? -1 : 1;
      }
      function type(x) {
        var t = typeof x;
        if (t !== "object")
          return t;
        if (ArrayBuffer.isView(x))
          return "binary";
        var tsTag = toStringTag2(x);
        return tsTag === "ArrayBuffer" ? "binary" : tsTag;
      }
      function getUint8Array(a) {
        if (a instanceof Uint8Array)
          return a;
        if (ArrayBuffer.isView(a))
          return new Uint8Array(a.buffer, a.byteOffset, a.byteLength);
        return new Uint8Array(a);
      }
      function builtInDeletionTrigger(table, keys2, res) {
        var yProps = table.schema.yProps;
        if (!yProps)
          return res;
        if (keys2 && res.numFailures > 0)
          keys2 = keys2.filter(function(_, i) {
            return !res.failures[i];
          });
        return Promise.all(yProps.map(function(_a2) {
          var updatesTable = _a2.updatesTable;
          return keys2 ? table.db.table(updatesTable).where("k").anyOf(keys2).delete() : table.db.table(updatesTable).clear();
        })).then(function() {
          return res;
        });
      }
      var PropModification2 = (function() {
        function PropModification3(spec) {
          this["@@propmod"] = spec;
        }
        PropModification3.prototype.execute = function(value) {
          var _a2;
          var spec = this["@@propmod"];
          if (spec.add !== void 0) {
            var term = spec.add;
            if (isArray2(term)) {
              return __spreadArray(__spreadArray([], isArray2(value) ? value : [], true), term, true).sort();
            }
            if (typeof term === "number")
              return (Number(value) || 0) + term;
            if (typeof term === "bigint") {
              try {
                return BigInt(value) + term;
              } catch (_b) {
                return BigInt(0) + term;
              }
            }
            throw new TypeError("Invalid term ".concat(term));
          }
          if (spec.remove !== void 0) {
            var subtrahend_1 = spec.remove;
            if (isArray2(subtrahend_1)) {
              return isArray2(value) ? value.filter(function(item) {
                return !subtrahend_1.includes(item);
              }).sort() : [];
            }
            if (typeof subtrahend_1 === "number")
              return Number(value) - subtrahend_1;
            if (typeof subtrahend_1 === "bigint") {
              try {
                return BigInt(value) - subtrahend_1;
              } catch (_c) {
                return BigInt(0) - subtrahend_1;
              }
            }
            throw new TypeError("Invalid subtrahend ".concat(subtrahend_1));
          }
          var prefixToReplace = (_a2 = spec.replacePrefix) === null || _a2 === void 0 ? void 0 : _a2[0];
          if (prefixToReplace && typeof value === "string" && value.startsWith(prefixToReplace)) {
            return spec.replacePrefix[1] + value.substring(prefixToReplace.length);
          }
          return value;
        };
        return PropModification3;
      })();
      function applyUpdateSpec(obj, changes) {
        var keyPaths = keys(changes);
        var numKeys = keyPaths.length;
        var anythingModified = false;
        for (var i = 0; i < numKeys; ++i) {
          var keyPath = keyPaths[i];
          var value = changes[keyPath];
          var origValue = getByKeyPath(obj, keyPath);
          if (value instanceof PropModification2) {
            setByKeyPath(obj, keyPath, value.execute(origValue));
            anythingModified = true;
          } else if (origValue !== value) {
            setByKeyPath(obj, keyPath, value);
            anythingModified = true;
          }
        }
        return anythingModified;
      }
      var Table = (function() {
        function Table2() {
        }
        Table2.prototype._trans = function(mode, fn, writeLocked) {
          var trans = this._tx || PSD.trans;
          var tableName = this.name;
          var task2 = debug && typeof console !== "undefined" && console.createTask && console.createTask("Dexie: ".concat(mode === "readonly" ? "read" : "write", " ").concat(this.name));
          function checkTableInTransaction(resolve, reject, trans2) {
            if (!trans2.schema[tableName])
              throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
            return fn(trans2.idbtrans, trans2);
          }
          var wasRootExec = beginMicroTickScope();
          try {
            var p = trans && trans.db._novip === this.db._novip ? trans === PSD.trans ? trans._promise(mode, checkTableInTransaction, writeLocked) : newScope(function() {
              return trans._promise(mode, checkTableInTransaction, writeLocked);
            }, { trans, transless: PSD.transless || PSD }) : tempTransaction(this.db, mode, [this.name], checkTableInTransaction);
            if (task2) {
              p._consoleTask = task2;
              p = p.catch(function(err) {
                console.trace(err);
                return rejection(err);
              });
            }
            return p;
          } finally {
            if (wasRootExec)
              endMicroTickScope();
          }
        };
        Table2.prototype.get = function(keyOrCrit, cb) {
          var _this = this;
          if (keyOrCrit && keyOrCrit.constructor === Object)
            return this.where(keyOrCrit).first(cb);
          if (keyOrCrit == null)
            return rejection(new exceptions.Type("Invalid argument to Table.get()"));
          return this._trans("readonly", function(trans) {
            return _this.core.get({ trans, key: keyOrCrit }).then(function(res) {
              return _this.hook.reading.fire(res);
            });
          }).then(cb);
        };
        Table2.prototype.where = function(indexOrCrit) {
          if (typeof indexOrCrit === "string")
            return new this.db.WhereClause(this, indexOrCrit);
          if (isArray2(indexOrCrit))
            return new this.db.WhereClause(this, "[".concat(indexOrCrit.join("+"), "]"));
          var keyPaths = keys(indexOrCrit);
          if (keyPaths.length === 1)
            return this.where(keyPaths[0]).equals(indexOrCrit[keyPaths[0]]);
          var compoundIndex = this.schema.indexes.concat(this.schema.primKey).filter(function(ix) {
            if (ix.compound && keyPaths.every(function(keyPath) {
              return ix.keyPath.indexOf(keyPath) >= 0;
            })) {
              for (var i = 0; i < keyPaths.length; ++i) {
                if (keyPaths.indexOf(ix.keyPath[i]) === -1)
                  return false;
              }
              return true;
            }
            return false;
          }).sort(function(a, b) {
            return a.keyPath.length - b.keyPath.length;
          })[0];
          if (compoundIndex && this.db._maxKey !== maxString) {
            var keyPathsInValidOrder = compoundIndex.keyPath.slice(0, keyPaths.length);
            return this.where(keyPathsInValidOrder).equals(keyPathsInValidOrder.map(function(kp) {
              return indexOrCrit[kp];
            }));
          }
          if (!compoundIndex && debug)
            console.warn("The query ".concat(JSON.stringify(indexOrCrit), " on ").concat(this.name, " would benefit from a ") + "compound index [".concat(keyPaths.join("+"), "]"));
          var idxByName = this.schema.idxByName;
          function equals(a, b) {
            return cmp2(a, b) === 0;
          }
          var _a2 = keyPaths.reduce(function(_a3, keyPath) {
            var prevIndex = _a3[0], prevFilterFn = _a3[1];
            var index = idxByName[keyPath];
            var value = indexOrCrit[keyPath];
            return [
              prevIndex || index,
              prevIndex || !index ? combine(prevFilterFn, index && index.multi ? function(x) {
                var prop = getByKeyPath(x, keyPath);
                return isArray2(prop) && prop.some(function(item) {
                  return equals(value, item);
                });
              } : function(x) {
                return equals(value, getByKeyPath(x, keyPath));
              }) : prevFilterFn
            ];
          }, [null, null]), idx = _a2[0], filterFunction = _a2[1];
          return idx ? this.where(idx.name).equals(indexOrCrit[idx.keyPath]).filter(filterFunction) : compoundIndex ? this.filter(filterFunction) : this.where(keyPaths).equals("");
        };
        Table2.prototype.filter = function(filterFunction) {
          return this.toCollection().and(filterFunction);
        };
        Table2.prototype.count = function(thenShortcut) {
          return this.toCollection().count(thenShortcut);
        };
        Table2.prototype.offset = function(offset) {
          return this.toCollection().offset(offset);
        };
        Table2.prototype.limit = function(numRows) {
          return this.toCollection().limit(numRows);
        };
        Table2.prototype.each = function(callback) {
          return this.toCollection().each(callback);
        };
        Table2.prototype.toArray = function(thenShortcut) {
          return this.toCollection().toArray(thenShortcut);
        };
        Table2.prototype.toCollection = function() {
          return new this.db.Collection(new this.db.WhereClause(this));
        };
        Table2.prototype.orderBy = function(index) {
          return new this.db.Collection(new this.db.WhereClause(this, isArray2(index) ? "[".concat(index.join("+"), "]") : index));
        };
        Table2.prototype.reverse = function() {
          return this.toCollection().reverse();
        };
        Table2.prototype.mapToClass = function(constructor) {
          var _a2 = this, db2 = _a2.db, tableName = _a2.name;
          this.schema.mappedClass = constructor;
          if (constructor.prototype instanceof Entity2) {
            constructor = (function(_super) {
              __extends(class_1, _super);
              function class_1() {
                return _super !== null && _super.apply(this, arguments) || this;
              }
              Object.defineProperty(class_1.prototype, "db", {
                get: function() {
                  return db2;
                },
                enumerable: false,
                configurable: true
              });
              class_1.prototype.table = function() {
                return tableName;
              };
              return class_1;
            })(constructor);
          }
          var inheritedProps = /* @__PURE__ */ new Set();
          for (var proto = constructor.prototype; proto; proto = getProto(proto)) {
            Object.getOwnPropertyNames(proto).forEach(function(propName) {
              return inheritedProps.add(propName);
            });
          }
          var readHook = function(obj) {
            if (!obj)
              return obj;
            var res = Object.create(constructor.prototype);
            for (var m in obj)
              if (!inheritedProps.has(m))
                try {
                  res[m] = obj[m];
                } catch (_) {
                }
            return res;
          };
          if (this.schema.readHook) {
            this.hook.reading.unsubscribe(this.schema.readHook);
          }
          this.schema.readHook = readHook;
          this.hook("reading", readHook);
          return constructor;
        };
        Table2.prototype.defineClass = function() {
          function Class(content) {
            extend2(this, content);
          }
          return this.mapToClass(Class);
        };
        Table2.prototype.add = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({
              trans,
              type: "add",
              keys: key != null ? [key] : null,
              values: [objToAdd]
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.upsert = function(key, modifications) {
          var _this = this;
          var keyPath = this.schema.primKey.keyPath;
          return this._trans("readwrite", function(trans) {
            return _this.core.get({ trans, key }).then(function(existing) {
              var obj = existing !== null && existing !== void 0 ? existing : {};
              applyUpdateSpec(obj, modifications);
              if (keyPath)
                setByKeyPath(obj, keyPath, key);
              return _this.core.mutate({
                trans,
                type: "put",
                values: [obj],
                keys: [key],
                upsert: true,
                updates: { keys: [key], changeSpecs: [modifications] }
              }).then(function(res) {
                return res.numFailures ? DexiePromise.reject(res.failures[0]) : !!existing;
              });
            });
          });
        };
        Table2.prototype.update = function(keyOrObject, modifications) {
          if (typeof keyOrObject === "object" && !isArray2(keyOrObject)) {
            var key = getByKeyPath(keyOrObject, this.schema.primKey.keyPath);
            if (key === void 0)
              return rejection(new exceptions.InvalidArgument("Given object does not contain its primary key"));
            return this.where(":id").equals(key).modify(modifications);
          } else {
            return this.where(":id").equals(keyOrObject).modify(modifications);
          }
        };
        Table2.prototype.put = function(obj, key) {
          var _this = this;
          var _a2 = this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
          var objToAdd = obj;
          if (keyPath && auto) {
            objToAdd = workaroundForUndefinedPrimKey(keyPath)(obj);
          }
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({
              trans,
              type: "put",
              values: [objToAdd],
              keys: key != null ? [key] : null
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : res.lastResult;
          }).then(function(lastResult) {
            if (keyPath) {
              try {
                setByKeyPath(obj, keyPath, lastResult);
              } catch (_) {
              }
            }
            return lastResult;
          });
        };
        Table2.prototype.delete = function(key) {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: [key] }).then(function(res) {
              return builtInDeletionTrigger(_this, [key], res);
            }).then(function(res) {
              return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
            });
          });
        };
        Table2.prototype.clear = function() {
          var _this = this;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "deleteRange", range: AnyRange }).then(function(res) {
              return builtInDeletionTrigger(_this, null, res);
            });
          }).then(function(res) {
            return res.numFailures ? DexiePromise.reject(res.failures[0]) : void 0;
          });
        };
        Table2.prototype.bulkGet = function(keys2) {
          var _this = this;
          return this._trans("readonly", function(trans) {
            return _this.core.getMany({
              keys: keys2,
              trans
            }).then(function(result) {
              return result.map(function(res) {
                return _this.hook.reading.fire(res);
              });
            });
          });
        };
        Table2.prototype.bulkAdd = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkAdd(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToAdd = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({
              trans,
              type: "add",
              keys: keys2,
              values: objectsToAdd,
              wantResults
            }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkAdd(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkPut = function(objects, keysOrOptions, options) {
          var _this = this;
          var keys2 = Array.isArray(keysOrOptions) ? keysOrOptions : void 0;
          options = options || (keys2 ? void 0 : keysOrOptions);
          var wantResults = options ? options.allKeys : void 0;
          return this._trans("readwrite", function(trans) {
            var _a2 = _this.schema.primKey, auto = _a2.auto, keyPath = _a2.keyPath;
            if (keyPath && keys2)
              throw new exceptions.InvalidArgument("bulkPut(): keys argument invalid on tables with inbound keys");
            if (keys2 && keys2.length !== objects.length)
              throw new exceptions.InvalidArgument("Arguments objects and keys must have the same length");
            var numObjects = objects.length;
            var objectsToPut = keyPath && auto ? objects.map(workaroundForUndefinedPrimKey(keyPath)) : objects;
            return _this.core.mutate({
              trans,
              type: "put",
              keys: keys2,
              values: objectsToPut,
              wantResults
            }).then(function(_a3) {
              var numFailures = _a3.numFailures, results = _a3.results, lastResult = _a3.lastResult, failures = _a3.failures;
              var result = wantResults ? results : lastResult;
              if (numFailures === 0)
                return result;
              throw new BulkError("".concat(_this.name, ".bulkPut(): ").concat(numFailures, " of ").concat(numObjects, " operations failed"), failures);
            });
          });
        };
        Table2.prototype.bulkUpdate = function(keysAndChanges) {
          var _this = this;
          var coreTable = this.core;
          var keys2 = keysAndChanges.map(function(entry) {
            return entry.key;
          });
          var changeSpecs = keysAndChanges.map(function(entry) {
            return entry.changes;
          });
          var offsetMap = [];
          return this._trans("readwrite", function(trans) {
            return coreTable.getMany({ trans, keys: keys2, cache: "clone" }).then(function(objs) {
              var resultKeys = [];
              var resultObjs = [];
              keysAndChanges.forEach(function(_a2, idx) {
                var key = _a2.key, changes = _a2.changes;
                var obj = objs[idx];
                if (obj) {
                  for (var _i = 0, _b = Object.keys(changes); _i < _b.length; _i++) {
                    var keyPath = _b[_i];
                    var value = changes[keyPath];
                    if (keyPath === _this.schema.primKey.keyPath) {
                      if (cmp2(value, key) !== 0) {
                        throw new exceptions.Constraint("Cannot update primary key in bulkUpdate()");
                      }
                    } else {
                      setByKeyPath(obj, keyPath, value);
                    }
                  }
                  offsetMap.push(idx);
                  resultKeys.push(key);
                  resultObjs.push(obj);
                }
              });
              var numEntries = resultKeys.length;
              return coreTable.mutate({
                trans,
                type: "put",
                keys: resultKeys,
                values: resultObjs,
                updates: {
                  keys: keys2,
                  changeSpecs
                }
              }).then(function(_a2) {
                var numFailures = _a2.numFailures, failures = _a2.failures;
                if (numFailures === 0)
                  return numEntries;
                for (var _i = 0, _b = Object.keys(failures); _i < _b.length; _i++) {
                  var offset = _b[_i];
                  var mappedOffset = offsetMap[Number(offset)];
                  if (mappedOffset != null) {
                    var failure = failures[offset];
                    delete failures[offset];
                    failures[mappedOffset] = failure;
                  }
                }
                throw new BulkError("".concat(_this.name, ".bulkUpdate(): ").concat(numFailures, " of ").concat(numEntries, " operations failed"), failures);
              });
            });
          });
        };
        Table2.prototype.bulkDelete = function(keys2) {
          var _this = this;
          var numKeys = keys2.length;
          return this._trans("readwrite", function(trans) {
            return _this.core.mutate({ trans, type: "delete", keys: keys2 }).then(function(res) {
              return builtInDeletionTrigger(_this, keys2, res);
            });
          }).then(function(_a2) {
            var numFailures = _a2.numFailures, lastResult = _a2.lastResult, failures = _a2.failures;
            if (numFailures === 0)
              return lastResult;
            throw new BulkError("".concat(_this.name, ".bulkDelete(): ").concat(numFailures, " of ").concat(numKeys, " operations failed"), failures);
          });
        };
        return Table2;
      })();
      function Events(ctx) {
        var evs = {};
        var rv = function(eventName, subscriber) {
          if (subscriber) {
            var i2 = arguments.length, args = new Array(i2 - 1);
            while (--i2)
              args[i2 - 1] = arguments[i2];
            evs[eventName].subscribe.apply(null, args);
            return ctx;
          } else if (typeof eventName === "string") {
            return evs[eventName];
          }
        };
        rv.addEventType = add3;
        for (var i = 1, l = arguments.length; i < l; ++i) {
          add3(arguments[i]);
        }
        return rv;
        function add3(eventName, chainFunction, defaultFunction) {
          if (typeof eventName === "object")
            return addConfiguredEvents(eventName);
          if (!chainFunction)
            chainFunction = reverseStoppableEventChain;
          if (!defaultFunction)
            defaultFunction = nop;
          var context = {
            subscribers: [],
            fire: defaultFunction,
            subscribe: function(cb) {
              if (context.subscribers.indexOf(cb) === -1) {
                context.subscribers.push(cb);
                context.fire = chainFunction(context.fire, cb);
              }
            },
            unsubscribe: function(cb) {
              context.subscribers = context.subscribers.filter(function(fn) {
                return fn !== cb;
              });
              context.fire = context.subscribers.reduce(chainFunction, defaultFunction);
            }
          };
          evs[eventName] = rv[eventName] = context;
          return context;
        }
        function addConfiguredEvents(cfg) {
          keys(cfg).forEach(function(eventName) {
            var args = cfg[eventName];
            if (isArray2(args)) {
              add3(eventName, cfg[eventName][0], cfg[eventName][1]);
            } else if (args === "asap") {
              var context = add3(eventName, mirror, function fire() {
                var i2 = arguments.length, args2 = new Array(i2);
                while (i2--)
                  args2[i2] = arguments[i2];
                context.subscribers.forEach(function(fn) {
                  asap$1(function fireEvent() {
                    fn.apply(null, args2);
                  });
                });
              });
            } else
              throw new exceptions.InvalidArgument("Invalid event config");
          });
        }
      }
      function makeClassConstructor(prototype2, constructor) {
        derive(constructor).from({ prototype: prototype2 });
        return constructor;
      }
      function createTableConstructor(db2) {
        return makeClassConstructor(Table.prototype, function Table2(name, tableSchema, trans) {
          this.db = db2;
          this._tx = trans;
          this.name = name;
          this.schema = tableSchema;
          this.hook = db2._allTables[name] ? db2._allTables[name].hook : Events(null, {
            creating: [hookCreatingChain, nop],
            reading: [pureFunctionChain, mirror],
            updating: [hookUpdatingChain, nop],
            deleting: [hookDeletingChain, nop]
          });
        });
      }
      function isPlainKeyRange(ctx, ignoreLimitFilter) {
        return !(ctx.filter || ctx.algorithm || ctx.or) && (ignoreLimitFilter ? ctx.justLimit : !ctx.replayFilter);
      }
      function addFilter(ctx, fn) {
        ctx.filter = combine(ctx.filter, fn);
      }
      function addReplayFilter(ctx, factory2, isLimitFilter) {
        var curr = ctx.replayFilter;
        ctx.replayFilter = curr ? function() {
          return combine(curr(), factory2());
        } : factory2;
        ctx.justLimit = isLimitFilter && !curr;
      }
      function addMatchFilter(ctx, fn) {
        ctx.isMatch = combine(ctx.isMatch, fn);
      }
      function getIndexOrStore(ctx, coreSchema) {
        if (ctx.isPrimKey)
          return coreSchema.primaryKey;
        var index = coreSchema.getIndexByKeyPath(ctx.index);
        if (!index)
          throw new exceptions.Schema("KeyPath " + ctx.index + " on object store " + coreSchema.name + " is not indexed");
        return index;
      }
      function openCursor(ctx, coreTable, trans) {
        var index = getIndexOrStore(ctx, coreTable.schema);
        return coreTable.openCursor({
          trans,
          values: !ctx.keysOnly,
          reverse: ctx.dir === "prev",
          unique: !!ctx.unique,
          query: {
            index,
            range: ctx.range
          }
        });
      }
      function iter(ctx, fn, coreTrans, coreTable) {
        var filter2 = ctx.replayFilter ? combine(ctx.filter, ctx.replayFilter()) : ctx.filter;
        if (!ctx.or) {
          return iterate(openCursor(ctx, coreTable, coreTrans), combine(ctx.algorithm, filter2), fn, !ctx.keysOnly && ctx.valueMapper);
        } else {
          var set_1 = {};
          var union = function(item, cursor, advance) {
            if (!filter2 || filter2(cursor, advance, function(result) {
              return cursor.stop(result);
            }, function(err) {
              return cursor.fail(err);
            })) {
              var primaryKey = cursor.primaryKey;
              var key = "" + primaryKey;
              if (key === "[object ArrayBuffer]")
                key = "" + new Uint8Array(primaryKey);
              if (!hasOwn(set_1, key)) {
                set_1[key] = true;
                fn(item, cursor, advance);
              }
            }
          };
          return Promise.all([
            ctx.or._iterate(union, coreTrans),
            iterate(openCursor(ctx, coreTable, coreTrans), ctx.algorithm, union, !ctx.keysOnly && ctx.valueMapper)
          ]);
        }
      }
      function iterate(cursorPromise, filter2, fn, valueMapper) {
        var mappedFn = valueMapper ? function(x, c, a) {
          return fn(valueMapper(x), c, a);
        } : fn;
        var wrappedFn = wrap(mappedFn);
        return cursorPromise.then(function(cursor) {
          if (cursor) {
            return cursor.start(function() {
              var c = function() {
                return cursor.continue();
              };
              if (!filter2 || filter2(cursor, function(advancer) {
                return c = advancer;
              }, function(val) {
                cursor.stop(val);
                c = nop;
              }, function(e) {
                cursor.fail(e);
                c = nop;
              }))
                wrappedFn(cursor.value, cursor, function(advancer) {
                  return c = advancer;
                });
              c();
            });
          }
        });
      }
      var Collection = (function() {
        function Collection2() {
        }
        Collection2.prototype._read = function(fn, cb) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readonly", fn).then(cb);
        };
        Collection2.prototype._write = function(fn) {
          var ctx = this._ctx;
          return ctx.error ? ctx.table._trans(null, rejection.bind(null, ctx.error)) : ctx.table._trans("readwrite", fn, "locked");
        };
        Collection2.prototype._addAlgorithm = function(fn) {
          var ctx = this._ctx;
          ctx.algorithm = combine(ctx.algorithm, fn);
        };
        Collection2.prototype._iterate = function(fn, coreTrans) {
          return iter(this._ctx, fn, coreTrans, this._ctx.table.core);
        };
        Collection2.prototype.clone = function(props2) {
          var rv = Object.create(this.constructor.prototype), ctx = Object.create(this._ctx);
          if (props2)
            extend2(ctx, props2);
          rv._ctx = ctx;
          return rv;
        };
        Collection2.prototype.raw = function() {
          this._ctx.valueMapper = null;
          return this;
        };
        Collection2.prototype.each = function(fn) {
          var ctx = this._ctx;
          return this._read(function(trans) {
            return iter(ctx, fn, trans, ctx.table.core);
          });
        };
        Collection2.prototype.count = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            var coreTable = ctx.table.core;
            if (isPlainKeyRange(ctx, true)) {
              return coreTable.count({
                trans,
                query: {
                  index: getIndexOrStore(ctx, coreTable.schema),
                  range: ctx.range
                }
              }).then(function(count2) {
                return Math.min(count2, ctx.limit);
              });
            } else {
              var count = 0;
              return iter(ctx, function() {
                ++count;
                return false;
              }, trans, coreTable).then(function() {
                return count;
              });
            }
          }).then(cb);
        };
        Collection2.prototype.sortBy = function(keyPath, cb) {
          var parts = keyPath.split(".").reverse(), lastPart = parts[0], lastIndex = parts.length - 1;
          function getval(obj, i) {
            if (i)
              return getval(obj[parts[i]], i - 1);
            return obj[lastPart];
          }
          var order = this._ctx.dir === "next" ? 1 : -1;
          function sorter(a, b) {
            var aVal = getval(a, lastIndex), bVal = getval(b, lastIndex);
            return cmp2(aVal, bVal) * order;
          }
          return this.toArray(function(a) {
            return a.sort(sorter);
          }).then(cb);
        };
        Collection2.prototype.toArray = function(cb) {
          var _this = this;
          return this._read(function(trans) {
            var ctx = _this._ctx;
            if (isPlainKeyRange(ctx, true) && ctx.limit > 0) {
              var valueMapper_1 = ctx.valueMapper;
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                limit: ctx.limit,
                values: true,
                direction: ctx.dir === "prev" ? "prev" : void 0,
                query: {
                  index,
                  range: ctx.range
                }
              }).then(function(_a2) {
                var result = _a2.result;
                return valueMapper_1 ? result.map(valueMapper_1) : result;
              });
            } else {
              var a_1 = [];
              return iter(ctx, function(item) {
                return a_1.push(item);
              }, trans, ctx.table.core).then(function() {
                return a_1;
              });
            }
          }, cb);
        };
        Collection2.prototype.offset = function(offset) {
          var ctx = this._ctx;
          if (offset <= 0)
            return this;
          ctx.offset += offset;
          if (isPlainKeyRange(ctx)) {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function(cursor, advance) {
                if (offsetLeft === 0)
                  return true;
                if (offsetLeft === 1) {
                  --offsetLeft;
                  return false;
                }
                advance(function() {
                  cursor.advance(offsetLeft);
                  offsetLeft = 0;
                });
                return false;
              };
            });
          } else {
            addReplayFilter(ctx, function() {
              var offsetLeft = offset;
              return function() {
                return --offsetLeft < 0;
              };
            });
          }
          return this;
        };
        Collection2.prototype.limit = function(numRows) {
          this._ctx.limit = Math.min(this._ctx.limit, numRows);
          addReplayFilter(this._ctx, function() {
            var rowsLeft = numRows;
            return function(cursor, advance, resolve) {
              if (--rowsLeft <= 0)
                advance(resolve);
              return rowsLeft >= 0;
            };
          }, true);
          return this;
        };
        Collection2.prototype.until = function(filterFunction, bIncludeStopEntry) {
          addFilter(this._ctx, function(cursor, advance, resolve) {
            if (filterFunction(cursor.value)) {
              advance(resolve);
              return bIncludeStopEntry;
            } else {
              return true;
            }
          });
          return this;
        };
        Collection2.prototype.first = function(cb) {
          return this.limit(1).toArray(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.last = function(cb) {
          return this.reverse().first(cb);
        };
        Collection2.prototype.filter = function(filterFunction) {
          addFilter(this._ctx, function(cursor) {
            return filterFunction(cursor.value);
          });
          addMatchFilter(this._ctx, filterFunction);
          return this;
        };
        Collection2.prototype.and = function(filter2) {
          return this.filter(filter2);
        };
        Collection2.prototype.or = function(indexName) {
          return new this.db.WhereClause(this._ctx.table, indexName, this);
        };
        Collection2.prototype.reverse = function() {
          this._ctx.dir = this._ctx.dir === "prev" ? "next" : "prev";
          if (this._ondirectionchange)
            this._ondirectionchange(this._ctx.dir);
          return this;
        };
        Collection2.prototype.desc = function() {
          return this.reverse();
        };
        Collection2.prototype.eachKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.key, cursor);
          });
        };
        Collection2.prototype.eachUniqueKey = function(cb) {
          this._ctx.unique = "unique";
          return this.eachKey(cb);
        };
        Collection2.prototype.eachPrimaryKey = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          return this.each(function(val, cursor) {
            cb(cursor.primaryKey, cursor);
          });
        };
        Collection2.prototype.keys = function(cb) {
          var ctx = this._ctx;
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.key);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.primaryKeys = function(cb) {
          var ctx = this._ctx;
          if (isPlainKeyRange(ctx, true) && ctx.limit > 0) {
            return this._read(function(trans) {
              var index = getIndexOrStore(ctx, ctx.table.core.schema);
              return ctx.table.core.query({
                trans,
                values: false,
                limit: ctx.limit,
                direction: ctx.dir === "prev" ? "prev" : void 0,
                query: {
                  index,
                  range: ctx.range
                }
              });
            }).then(function(_a2) {
              var result = _a2.result;
              return result;
            }).then(cb);
          }
          ctx.keysOnly = !ctx.isMatch;
          var a = [];
          return this.each(function(item, cursor) {
            a.push(cursor.primaryKey);
          }).then(function() {
            return a;
          }).then(cb);
        };
        Collection2.prototype.uniqueKeys = function(cb) {
          this._ctx.unique = "unique";
          return this.keys(cb);
        };
        Collection2.prototype.firstKey = function(cb) {
          return this.limit(1).keys(function(a) {
            return a[0];
          }).then(cb);
        };
        Collection2.prototype.lastKey = function(cb) {
          return this.reverse().firstKey(cb);
        };
        Collection2.prototype.distinct = function() {
          var ctx = this._ctx, idx = ctx.index && ctx.table.schema.idxByName[ctx.index];
          if (!idx || !idx.multi)
            return this;
          var set = {};
          addFilter(this._ctx, function(cursor) {
            var strKey = cursor.primaryKey.toString();
            var found = hasOwn(set, strKey);
            set[strKey] = true;
            return !found;
          });
          return this;
        };
        Collection2.prototype.modify = function(changes) {
          var _this = this;
          var ctx = this._ctx;
          return this._write(function(trans) {
            var modifyer;
            if (typeof changes === "function") {
              modifyer = changes;
            } else {
              modifyer = function(item) {
                return applyUpdateSpec(item, changes);
              };
            }
            var coreTable = ctx.table.core;
            var _a2 = coreTable.schema.primaryKey, outbound = _a2.outbound, extractKey = _a2.extractKey;
            var limit = 200;
            var modifyChunkSize = _this.db._options.modifyChunkSize;
            if (modifyChunkSize) {
              if (typeof modifyChunkSize == "object") {
                limit = modifyChunkSize[coreTable.name] || modifyChunkSize["*"] || 200;
              } else {
                limit = modifyChunkSize;
              }
            }
            var totalFailures = [];
            var successCount = 0;
            var failedKeys = [];
            var applyMutateResult = function(expectedCount, res) {
              var failures = res.failures, numFailures = res.numFailures;
              successCount += expectedCount - numFailures;
              for (var _i = 0, _a3 = keys(failures); _i < _a3.length; _i++) {
                var pos = _a3[_i];
                totalFailures.push(failures[pos]);
              }
            };
            var isUnconditionalDelete = changes === deleteCallback;
            return _this.clone().primaryKeys().then(function(keys2) {
              var criteria = isPlainKeyRange(ctx) && ctx.limit === Infinity && (typeof changes !== "function" || isUnconditionalDelete) && {
                index: ctx.index,
                range: ctx.range
              };
              var nextChunk = function(offset) {
                var count = Math.min(limit, keys2.length - offset);
                var keysInChunk = keys2.slice(offset, offset + count);
                return (isUnconditionalDelete ? Promise.resolve([]) : coreTable.getMany({
                  trans,
                  keys: keysInChunk,
                  cache: "immutable"
                })).then(function(values) {
                  var addValues = [];
                  var putValues = [];
                  var putKeys = outbound ? [] : null;
                  var deleteKeys = isUnconditionalDelete ? keysInChunk : [];
                  if (!isUnconditionalDelete)
                    for (var i = 0; i < count; ++i) {
                      var origValue = values[i];
                      var ctx_1 = {
                        value: deepClone(origValue),
                        primKey: keys2[offset + i]
                      };
                      if (modifyer.call(ctx_1, ctx_1.value, ctx_1) !== false) {
                        if (ctx_1.value == null) {
                          deleteKeys.push(keys2[offset + i]);
                        } else if (!outbound && cmp2(extractKey(origValue), extractKey(ctx_1.value)) !== 0) {
                          deleteKeys.push(keys2[offset + i]);
                          addValues.push(ctx_1.value);
                        } else {
                          putValues.push(ctx_1.value);
                          if (outbound)
                            putKeys.push(keys2[offset + i]);
                        }
                      }
                    }
                  return Promise.resolve(addValues.length > 0 && coreTable.mutate({ trans, type: "add", values: addValues }).then(function(res) {
                    for (var pos in res.failures) {
                      deleteKeys.splice(parseInt(pos), 1);
                    }
                    applyMutateResult(addValues.length, res);
                  })).then(function() {
                    return (putValues.length > 0 || criteria && typeof changes === "object") && coreTable.mutate({
                      trans,
                      type: "put",
                      keys: putKeys,
                      values: putValues,
                      criteria,
                      changeSpec: typeof changes !== "function" && changes,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return applyMutateResult(putValues.length, res);
                    });
                  }).then(function() {
                    return (deleteKeys.length > 0 || criteria && isUnconditionalDelete) && coreTable.mutate({
                      trans,
                      type: "delete",
                      keys: deleteKeys,
                      criteria,
                      isAdditionalChunk: offset > 0
                    }).then(function(res) {
                      return builtInDeletionTrigger(ctx.table, deleteKeys, res);
                    }).then(function(res) {
                      return applyMutateResult(deleteKeys.length, res);
                    });
                  }).then(function() {
                    return keys2.length > offset + count && nextChunk(offset + limit);
                  });
                });
              };
              return nextChunk(0).then(function() {
                if (totalFailures.length > 0)
                  throw new ModifyError("Error modifying one or more objects", totalFailures, successCount, failedKeys);
                return keys2.length;
              });
            });
          });
        };
        Collection2.prototype.delete = function() {
          var ctx = this._ctx, range = ctx.range;
          if (isPlainKeyRange(ctx) && !ctx.table.schema.yProps && (ctx.isPrimKey || range.type === 3)) {
            return this._write(function(trans) {
              var primaryKey = ctx.table.core.schema.primaryKey;
              var coreRange = range;
              return ctx.table.core.count({ trans, query: { index: primaryKey, range: coreRange } }).then(function(count) {
                return ctx.table.core.mutate({ trans, type: "deleteRange", range: coreRange }).then(function(_a2) {
                  var failures = _a2.failures, numFailures = _a2.numFailures;
                  if (numFailures)
                    throw new ModifyError("Could not delete some values", Object.keys(failures).map(function(pos) {
                      return failures[pos];
                    }), count - numFailures);
                  return count - numFailures;
                });
              });
            });
          }
          return this.modify(deleteCallback);
        };
        return Collection2;
      })();
      var deleteCallback = function(value, ctx) {
        return ctx.value = null;
      };
      function createCollectionConstructor(db2) {
        return makeClassConstructor(Collection.prototype, function Collection2(whereClause, keyRangeGenerator) {
          this.db = db2;
          var keyRange = AnyRange, error = null;
          if (keyRangeGenerator)
            try {
              keyRange = keyRangeGenerator();
            } catch (ex) {
              error = ex;
            }
          var whereCtx = whereClause._ctx;
          var table = whereCtx.table;
          var readingHook = table.hook.reading.fire;
          this._ctx = {
            table,
            index: whereCtx.index,
            isPrimKey: !whereCtx.index || table.schema.primKey.keyPath && whereCtx.index === table.schema.primKey.name,
            range: keyRange,
            keysOnly: false,
            dir: "next",
            unique: "",
            algorithm: null,
            filter: null,
            replayFilter: null,
            justLimit: true,
            isMatch: null,
            offset: 0,
            limit: Infinity,
            error,
            or: whereCtx.or,
            valueMapper: readingHook !== mirror ? readingHook : null
          };
        });
      }
      function simpleCompare(a, b) {
        return a < b ? -1 : a === b ? 0 : 1;
      }
      function simpleCompareReverse(a, b) {
        return a > b ? -1 : a === b ? 0 : 1;
      }
      function fail(collectionOrWhereClause, err, T) {
        var collection = collectionOrWhereClause instanceof WhereClause ? new collectionOrWhereClause.Collection(collectionOrWhereClause) : collectionOrWhereClause;
        collection._ctx.error = T ? new T(err) : new TypeError(err);
        return collection;
      }
      function emptyCollection(whereClause) {
        return new whereClause.Collection(whereClause, function() {
          return rangeEqual("");
        }).limit(0);
      }
      function upperFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toUpperCase();
        } : function(s) {
          return s.toLowerCase();
        };
      }
      function lowerFactory(dir) {
        return dir === "next" ? function(s) {
          return s.toLowerCase();
        } : function(s) {
          return s.toUpperCase();
        };
      }
      function nextCasing(key, lowerKey, upperNeedle, lowerNeedle, cmp3, dir) {
        var length = Math.min(key.length, lowerNeedle.length);
        var llp = -1;
        for (var i = 0; i < length; ++i) {
          var lwrKeyChar = lowerKey[i];
          if (lwrKeyChar !== lowerNeedle[i]) {
            if (cmp3(key[i], upperNeedle[i]) < 0)
              return key.substr(0, i) + upperNeedle[i] + upperNeedle.substr(i + 1);
            if (cmp3(key[i], lowerNeedle[i]) < 0)
              return key.substr(0, i) + lowerNeedle[i] + upperNeedle.substr(i + 1);
            if (llp >= 0)
              return key.substr(0, llp) + lowerKey[llp] + upperNeedle.substr(llp + 1);
            return null;
          }
          if (cmp3(key[i], lwrKeyChar) < 0)
            llp = i;
        }
        if (length < lowerNeedle.length && dir === "next")
          return key + upperNeedle.substr(key.length);
        if (length < key.length && dir === "prev")
          return key.substr(0, upperNeedle.length);
        return llp < 0 ? null : key.substr(0, llp) + lowerNeedle[llp] + upperNeedle.substr(llp + 1);
      }
      function addIgnoreCaseAlgorithm(whereClause, match, needles, suffix) {
        var upper, lower, compare, upperNeedles, lowerNeedles, direction, nextKeySuffix, needlesLen = needles.length;
        if (!needles.every(function(s) {
          return typeof s === "string";
        })) {
          return fail(whereClause, STRING_EXPECTED);
        }
        function initDirection(dir) {
          upper = upperFactory(dir);
          lower = lowerFactory(dir);
          compare = dir === "next" ? simpleCompare : simpleCompareReverse;
          var needleBounds = needles.map(function(needle) {
            return { lower: lower(needle), upper: upper(needle) };
          }).sort(function(a, b) {
            return compare(a.lower, b.lower);
          });
          upperNeedles = needleBounds.map(function(nb) {
            return nb.upper;
          });
          lowerNeedles = needleBounds.map(function(nb) {
            return nb.lower;
          });
          direction = dir;
          nextKeySuffix = dir === "next" ? "" : suffix;
        }
        initDirection("next");
        var c = new whereClause.Collection(whereClause, function() {
          return createRange(upperNeedles[0], lowerNeedles[needlesLen - 1] + suffix);
        });
        c._ondirectionchange = function(direction2) {
          initDirection(direction2);
        };
        var firstPossibleNeedle = 0;
        c._addAlgorithm(function(cursor, advance, resolve) {
          var key = cursor.key;
          if (typeof key !== "string")
            return false;
          var lowerKey = lower(key);
          if (match(lowerKey, lowerNeedles, firstPossibleNeedle)) {
            return true;
          } else {
            var lowestPossibleCasing = null;
            for (var i = firstPossibleNeedle; i < needlesLen; ++i) {
              var casing = nextCasing(key, lowerKey, upperNeedles[i], lowerNeedles[i], compare, direction);
              if (casing === null && lowestPossibleCasing === null)
                firstPossibleNeedle = i + 1;
              else if (lowestPossibleCasing === null || compare(lowestPossibleCasing, casing) > 0) {
                lowestPossibleCasing = casing;
              }
            }
            if (lowestPossibleCasing !== null) {
              advance(function() {
                cursor.continue(lowestPossibleCasing + nextKeySuffix);
              });
            } else {
              advance(resolve);
            }
            return false;
          }
        });
        return c;
      }
      function createRange(lower, upper, lowerOpen, upperOpen) {
        return {
          type: 2,
          lower,
          upper,
          lowerOpen,
          upperOpen
        };
      }
      function rangeEqual(value) {
        return {
          type: 1,
          lower: value,
          upper: value
        };
      }
      var WhereClause = (function() {
        function WhereClause2() {
        }
        Object.defineProperty(WhereClause2.prototype, "Collection", {
          get: function() {
            return this._ctx.table.db.Collection;
          },
          enumerable: false,
          configurable: true
        });
        WhereClause2.prototype.between = function(lower, upper, includeLower, includeUpper) {
          includeLower = includeLower !== false;
          includeUpper = includeUpper === true;
          try {
            if (this._cmp(lower, upper) > 0 || this._cmp(lower, upper) === 0 && (includeLower || includeUpper) && !(includeLower && includeUpper))
              return emptyCollection(this);
            return new this.Collection(this, function() {
              return createRange(lower, upper, !includeLower, !includeUpper);
            });
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
        };
        WhereClause2.prototype.equals = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return rangeEqual(value);
          });
        };
        WhereClause2.prototype.above = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, true);
          });
        };
        WhereClause2.prototype.aboveOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(value, void 0, false);
          });
        };
        WhereClause2.prototype.below = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value, false, true);
          });
        };
        WhereClause2.prototype.belowOrEqual = function(value) {
          if (value == null)
            return fail(this, INVALID_KEY_ARGUMENT);
          return new this.Collection(this, function() {
            return createRange(void 0, value);
          });
        };
        WhereClause2.prototype.startsWith = function(str) {
          if (typeof str !== "string")
            return fail(this, STRING_EXPECTED);
          return this.between(str, str + maxString, true, true);
        };
        WhereClause2.prototype.startsWithIgnoreCase = function(str) {
          if (str === "")
            return this.startsWith(str);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x.indexOf(a[0]) === 0;
          }, [str], maxString);
        };
        WhereClause2.prototype.equalsIgnoreCase = function(str) {
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return x === a[0];
          }, [str], "");
        };
        WhereClause2.prototype.anyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.indexOf(x) !== -1;
          }, set, "");
        };
        WhereClause2.prototype.startsWithAnyOfIgnoreCase = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return emptyCollection(this);
          return addIgnoreCaseAlgorithm(this, function(x, a) {
            return a.some(function(n) {
              return x.indexOf(n) === 0;
            });
          }, set, maxString);
        };
        WhereClause2.prototype.anyOf = function() {
          var _this = this;
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          var compare = this._cmp;
          try {
            set.sort(compare);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          if (set.length === 0)
            return emptyCollection(this);
          var c = new this.Collection(this, function() {
            return createRange(set[0], set[set.length - 1]);
          });
          c._ondirectionchange = function(direction) {
            compare = direction === "next" ? _this._ascending : _this._descending;
            set.sort(compare);
          };
          var i = 0;
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (compare(key, set[i]) > 0) {
              ++i;
              if (i === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (compare(key, set[i]) === 0) {
              return true;
            } else {
              advance(function() {
                cursor.continue(set[i]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.notEqual = function(value) {
          return this.inAnyRange([
            [minKey, value],
            [value, this.db._maxKey]
          ], { includeLowers: false, includeUppers: false });
        };
        WhereClause2.prototype.noneOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (set.length === 0)
            return new this.Collection(this);
          try {
            set.sort(this._ascending);
          } catch (e) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var ranges = set.reduce(function(res, val) {
            return res ? res.concat([[res[res.length - 1][1], val]]) : [[minKey, val]];
          }, null);
          ranges.push([set[set.length - 1], this.db._maxKey]);
          return this.inAnyRange(ranges, {
            includeLowers: false,
            includeUppers: false
          });
        };
        WhereClause2.prototype.inAnyRange = function(ranges, options) {
          var _this = this;
          var cmp3 = this._cmp, ascending = this._ascending, descending = this._descending, min = this._min, max = this._max;
          if (ranges.length === 0)
            return emptyCollection(this);
          if (!ranges.every(function(range) {
            return range[0] !== void 0 && range[1] !== void 0 && ascending(range[0], range[1]) <= 0;
          })) {
            return fail(this, "First argument to inAnyRange() must be an Array of two-value Arrays [lower,upper] where upper must not be lower than lower", exceptions.InvalidArgument);
          }
          var includeLowers = !options || options.includeLowers !== false;
          var includeUppers = options && options.includeUppers === true;
          function addRange2(ranges2, newRange) {
            var i = 0, l = ranges2.length;
            for (; i < l; ++i) {
              var range = ranges2[i];
              if (cmp3(newRange[0], range[1]) < 0 && cmp3(newRange[1], range[0]) > 0) {
                range[0] = min(range[0], newRange[0]);
                range[1] = max(range[1], newRange[1]);
                break;
              }
            }
            if (i === l)
              ranges2.push(newRange);
            return ranges2;
          }
          var sortDirection = ascending;
          function rangeSorter(a, b) {
            return sortDirection(a[0], b[0]);
          }
          var set;
          try {
            set = ranges.reduce(addRange2, []);
            set.sort(rangeSorter);
          } catch (ex) {
            return fail(this, INVALID_KEY_ARGUMENT);
          }
          var rangePos = 0;
          var keyIsBeyondCurrentEntry = includeUppers ? function(key) {
            return ascending(key, set[rangePos][1]) > 0;
          } : function(key) {
            return ascending(key, set[rangePos][1]) >= 0;
          };
          var keyIsBeforeCurrentEntry = includeLowers ? function(key) {
            return descending(key, set[rangePos][0]) > 0;
          } : function(key) {
            return descending(key, set[rangePos][0]) >= 0;
          };
          function keyWithinCurrentRange(key) {
            return !keyIsBeyondCurrentEntry(key) && !keyIsBeforeCurrentEntry(key);
          }
          var checkKey = keyIsBeyondCurrentEntry;
          var c = new this.Collection(this, function() {
            return createRange(set[0][0], set[set.length - 1][1], !includeLowers, !includeUppers);
          });
          c._ondirectionchange = function(direction) {
            if (direction === "next") {
              checkKey = keyIsBeyondCurrentEntry;
              sortDirection = ascending;
            } else {
              checkKey = keyIsBeforeCurrentEntry;
              sortDirection = descending;
            }
            set.sort(rangeSorter);
          };
          c._addAlgorithm(function(cursor, advance, resolve) {
            var key = cursor.key;
            while (checkKey(key)) {
              ++rangePos;
              if (rangePos === set.length) {
                advance(resolve);
                return false;
              }
            }
            if (keyWithinCurrentRange(key)) {
              return true;
            } else if (_this._cmp(key, set[rangePos][1]) === 0 || _this._cmp(key, set[rangePos][0]) === 0) {
              return false;
            } else {
              advance(function() {
                if (sortDirection === ascending)
                  cursor.continue(set[rangePos][0]);
                else
                  cursor.continue(set[rangePos][1]);
              });
              return false;
            }
          });
          return c;
        };
        WhereClause2.prototype.startsWithAnyOf = function() {
          var set = getArrayOf.apply(NO_CHAR_ARRAY, arguments);
          if (!set.every(function(s) {
            return typeof s === "string";
          })) {
            return fail(this, "startsWithAnyOf() only works with strings");
          }
          if (set.length === 0)
            return emptyCollection(this);
          return this.inAnyRange(set.map(function(str) {
            return [str, str + maxString];
          }));
        };
        return WhereClause2;
      })();
      function createWhereClauseConstructor(db2) {
        return makeClassConstructor(WhereClause.prototype, function WhereClause2(table, index, orCollection) {
          this.db = db2;
          this._ctx = {
            table,
            index: index === ":id" ? null : index,
            or: orCollection
          };
          this._cmp = this._ascending = cmp2;
          this._descending = function(a, b) {
            return cmp2(b, a);
          };
          this._max = function(a, b) {
            return cmp2(a, b) > 0 ? a : b;
          };
          this._min = function(a, b) {
            return cmp2(a, b) < 0 ? a : b;
          };
          this._IDBKeyRange = db2._deps.IDBKeyRange;
          if (!this._IDBKeyRange)
            throw new exceptions.MissingAPI();
        });
      }
      function eventRejectHandler(reject) {
        return wrap(function(event) {
          preventDefault(event);
          reject(event.target.error);
          return false;
        });
      }
      function preventDefault(event) {
        if (event.stopPropagation)
          event.stopPropagation();
        if (event.preventDefault)
          event.preventDefault();
      }
      var DEXIE_STORAGE_MUTATED_EVENT_NAME = "storagemutated";
      var STORAGE_MUTATED_DOM_EVENT_NAME = "x-storagemutated-1";
      var globalEvents = Events(null, DEXIE_STORAGE_MUTATED_EVENT_NAME);
      var Transaction = (function() {
        function Transaction2() {
        }
        Transaction2.prototype._lock = function() {
          assert(!PSD.global);
          ++this._reculock;
          if (this._reculock === 1 && !PSD.global)
            PSD.lockOwnerFor = this;
          return this;
        };
        Transaction2.prototype._unlock = function() {
          assert(!PSD.global);
          if (--this._reculock === 0) {
            if (!PSD.global)
              PSD.lockOwnerFor = null;
            while (this._blockedFuncs.length > 0 && !this._locked()) {
              var fnAndPSD = this._blockedFuncs.shift();
              try {
                usePSD(fnAndPSD[1], fnAndPSD[0]);
              } catch (e) {
              }
            }
          }
          return this;
        };
        Transaction2.prototype._locked = function() {
          return this._reculock && PSD.lockOwnerFor !== this;
        };
        Transaction2.prototype.create = function(idbtrans) {
          var _this = this;
          if (!this.mode)
            return this;
          var idbdb = this.db.idbdb;
          var dbOpenError = this.db._state.dbOpenError;
          assert(!this.idbtrans);
          if (!idbtrans && !idbdb) {
            switch (dbOpenError && dbOpenError.name) {
              case "DatabaseClosedError":
                throw new exceptions.DatabaseClosed(dbOpenError);
              case "MissingAPIError":
                throw new exceptions.MissingAPI(dbOpenError.message, dbOpenError);
              default:
                throw new exceptions.OpenFailed(dbOpenError);
            }
          }
          if (!this.active)
            throw new exceptions.TransactionInactive();
          assert(this._completion._state === null);
          idbtrans = this.idbtrans = idbtrans || (this.db.core ? this.db.core.transaction(this.storeNames, this.mode, { durability: this.chromeTransactionDurability }) : idbdb.transaction(this.storeNames, this.mode, {
            durability: this.chromeTransactionDurability
          }));
          idbtrans.onerror = wrap(function(ev) {
            preventDefault(ev);
            _this._reject(idbtrans.error);
          });
          idbtrans.onabort = wrap(function(ev) {
            preventDefault(ev);
            _this.active && _this._reject(new exceptions.Abort(idbtrans.error));
            _this.active = false;
            _this.on("abort").fire(ev);
          });
          idbtrans.oncomplete = wrap(function() {
            _this.active = false;
            _this._resolve();
            if ("mutatedParts" in idbtrans) {
              globalEvents.storagemutated.fire(idbtrans["mutatedParts"]);
            }
          });
          return this;
        };
        Transaction2.prototype._promise = function(mode, fn, bWriteLock) {
          var _this = this;
          if (mode === "readwrite" && this.mode !== "readwrite")
            return rejection(new exceptions.ReadOnly("Transaction is readonly"));
          if (!this.active)
            return rejection(new exceptions.TransactionInactive());
          if (this._locked()) {
            return new DexiePromise(function(resolve, reject) {
              _this._blockedFuncs.push([
                function() {
                  _this._promise(mode, fn, bWriteLock).then(resolve, reject);
                },
                PSD
              ]);
            });
          } else if (bWriteLock) {
            return newScope(function() {
              var p2 = new DexiePromise(function(resolve, reject) {
                _this._lock();
                var rv = fn(resolve, reject, _this);
                if (rv && rv.then)
                  rv.then(resolve, reject);
              });
              p2.finally(function() {
                return _this._unlock();
              });
              p2._lib = true;
              return p2;
            });
          } else {
            var p = new DexiePromise(function(resolve, reject) {
              var rv = fn(resolve, reject, _this);
              if (rv && rv.then)
                rv.then(resolve, reject);
            });
            p._lib = true;
            return p;
          }
        };
        Transaction2.prototype._root = function() {
          return this.parent ? this.parent._root() : this;
        };
        Transaction2.prototype.waitFor = function(promiseLike) {
          var root = this._root();
          var promise = DexiePromise.resolve(promiseLike);
          if (root._waitingFor) {
            root._waitingFor = root._waitingFor.then(function() {
              return promise;
            });
          } else {
            root._waitingFor = promise;
            root._waitingQueue = [];
            var store = root.idbtrans.objectStore(root.storeNames[0]);
            (function spin() {
              ++root._spinCount;
              while (root._waitingQueue.length)
                root._waitingQueue.shift()();
              if (root._waitingFor)
                store.get(-Infinity).onsuccess = spin;
            })();
          }
          var currentWaitPromise = root._waitingFor;
          return new DexiePromise(function(resolve, reject) {
            promise.then(function(res) {
              return root._waitingQueue.push(wrap(resolve.bind(null, res)));
            }, function(err) {
              return root._waitingQueue.push(wrap(reject.bind(null, err)));
            }).finally(function() {
              if (root._waitingFor === currentWaitPromise) {
                root._waitingFor = null;
              }
            });
          });
        };
        Transaction2.prototype.abort = function() {
          if (this.active) {
            this.active = false;
            if (this.idbtrans)
              this.idbtrans.abort();
            this._reject(new exceptions.Abort());
          }
        };
        Transaction2.prototype.table = function(tableName) {
          var memoizedTables = this._memoizedTables || (this._memoizedTables = {});
          if (hasOwn(memoizedTables, tableName))
            return memoizedTables[tableName];
          var tableSchema = this.schema[tableName];
          if (!tableSchema) {
            throw new exceptions.NotFound("Table " + tableName + " not part of transaction");
          }
          var transactionBoundTable = new this.db.Table(tableName, tableSchema, this);
          transactionBoundTable.core = this.db.core.table(tableName);
          memoizedTables[tableName] = transactionBoundTable;
          return transactionBoundTable;
        };
        return Transaction2;
      })();
      function createTransactionConstructor(db2) {
        return makeClassConstructor(Transaction.prototype, function Transaction2(mode, storeNames, dbschema, chromeTransactionDurability, parent) {
          var _this = this;
          if (mode !== "readonly")
            storeNames.forEach(function(storeName) {
              var _a2;
              var yProps = (_a2 = dbschema[storeName]) === null || _a2 === void 0 ? void 0 : _a2.yProps;
              if (yProps)
                storeNames = storeNames.concat(yProps.map(function(p) {
                  return p.updatesTable;
                }));
            });
          this.db = db2;
          this.mode = mode;
          this.storeNames = storeNames;
          this.schema = dbschema;
          this.chromeTransactionDurability = chromeTransactionDurability;
          this.idbtrans = null;
          this.on = Events(this, "complete", "error", "abort");
          this.parent = parent || null;
          this.active = true;
          this._reculock = 0;
          this._blockedFuncs = [];
          this._resolve = null;
          this._reject = null;
          this._waitingFor = null;
          this._waitingQueue = null;
          this._spinCount = 0;
          this._completion = new DexiePromise(function(resolve, reject) {
            _this._resolve = resolve;
            _this._reject = reject;
          });
          this._completion.then(function() {
            _this.active = false;
            _this.on.complete.fire();
          }, function(e) {
            var wasActive = _this.active;
            _this.active = false;
            _this.on.error.fire(e);
            _this.parent ? _this.parent._reject(e) : wasActive && _this.idbtrans && _this.idbtrans.abort();
            return rejection(e);
          });
        });
      }
      function createIndexSpec(name, keyPath, unique, multi, auto, compound, isPrimKey, type2) {
        return {
          name,
          keyPath,
          unique,
          multi,
          auto,
          compound,
          src: (unique && !isPrimKey ? "&" : "") + (multi ? "*" : "") + (auto ? "++" : "") + nameFromKeyPath(keyPath),
          type: type2
        };
      }
      function nameFromKeyPath(keyPath) {
        return typeof keyPath === "string" ? keyPath : keyPath ? "[" + [].join.call(keyPath, "+") + "]" : "";
      }
      function createTableSchema(name, primKey, indexes) {
        return {
          name,
          primKey,
          indexes,
          mappedClass: null,
          idxByName: arrayToObject2(indexes, function(index) {
            return [index.name, index];
          })
        };
      }
      function safariMultiStoreFix(storeNames) {
        return storeNames.length === 1 ? storeNames[0] : storeNames;
      }
      var getMaxKey = function(IdbKeyRange) {
        try {
          IdbKeyRange.only([[]]);
          getMaxKey = function() {
            return [[]];
          };
          return [[]];
        } catch (e) {
          getMaxKey = function() {
            return maxString;
          };
          return maxString;
        }
      };
      function getKeyExtractor(keyPath) {
        if (keyPath == null) {
          return function() {
            return void 0;
          };
        } else if (typeof keyPath === "string") {
          return getSinglePathKeyExtractor(keyPath);
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function getSinglePathKeyExtractor(keyPath) {
        var split = keyPath.split(".");
        if (split.length === 1) {
          return function(obj) {
            return obj[keyPath];
          };
        } else {
          return function(obj) {
            return getByKeyPath(obj, keyPath);
          };
        }
      }
      function arrayify(arrayLike) {
        return [].slice.call(arrayLike);
      }
      var _id_counter = 0;
      function getKeyPathAlias(keyPath) {
        return keyPath == null ? ":id" : typeof keyPath === "string" ? keyPath : "[".concat(keyPath.join("+"), "]");
      }
      function createDBCore(db2, IdbKeyRange, tmpTrans) {
        function extractSchema(db3, trans) {
          var tables2 = arrayify(db3.objectStoreNames);
          var tempStore = tables2.length > 0 ? trans.objectStore(tables2[0]) : {};
          return {
            schema: {
              name: db3.name,
              tables: tables2.map(function(table) {
                return trans.objectStore(table);
              }).map(function(store) {
                var keyPath = store.keyPath, autoIncrement = store.autoIncrement;
                var compound = isArray2(keyPath);
                var outbound = keyPath == null;
                var indexByKeyPath = {};
                var result = {
                  name: store.name,
                  primaryKey: {
                    name: null,
                    isPrimaryKey: true,
                    outbound,
                    compound,
                    keyPath,
                    autoIncrement,
                    unique: true,
                    extractKey: getKeyExtractor(keyPath)
                  },
                  indexes: arrayify(store.indexNames).map(function(indexName) {
                    return store.index(indexName);
                  }).map(function(index) {
                    var name = index.name, unique = index.unique, multiEntry = index.multiEntry, keyPath2 = index.keyPath;
                    var compound2 = isArray2(keyPath2);
                    var result2 = {
                      name,
                      compound: compound2,
                      keyPath: keyPath2,
                      unique,
                      multiEntry,
                      extractKey: getKeyExtractor(keyPath2)
                    };
                    indexByKeyPath[getKeyPathAlias(keyPath2)] = result2;
                    return result2;
                  }),
                  getIndexByKeyPath: function(keyPath2) {
                    return indexByKeyPath[getKeyPathAlias(keyPath2)];
                  }
                };
                indexByKeyPath[":id"] = result.primaryKey;
                if (keyPath != null) {
                  indexByKeyPath[getKeyPathAlias(keyPath)] = result.primaryKey;
                }
                return result;
              })
            },
            hasGetAll: tables2.length > 0 && "getAll" in tempStore && !(typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604),
            hasIdb3Features: "getAllRecords" in tempStore
          };
        }
        function makeIDBKeyRange(range) {
          if (range.type === 3)
            return null;
          if (range.type === 4)
            throw new Error("Cannot convert never type to IDBKeyRange");
          var lower = range.lower, upper = range.upper, lowerOpen = range.lowerOpen, upperOpen = range.upperOpen;
          var idbRange = lower === void 0 ? upper === void 0 ? null : IdbKeyRange.upperBound(upper, !!upperOpen) : upper === void 0 ? IdbKeyRange.lowerBound(lower, !!lowerOpen) : IdbKeyRange.bound(lower, upper, !!lowerOpen, !!upperOpen);
          return idbRange;
        }
        function createDbCoreTable(tableSchema) {
          var tableName = tableSchema.name;
          function mutate(_a3) {
            var trans = _a3.trans, type2 = _a3.type, keys2 = _a3.keys, values = _a3.values, range = _a3.range;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var store = trans.objectStore(tableName);
              var outbound = store.keyPath == null;
              var isAddOrPut = type2 === "put" || type2 === "add";
              if (!isAddOrPut && type2 !== "delete" && type2 !== "deleteRange")
                throw new Error("Invalid operation type: " + type2);
              var length = (keys2 || values || { length: 1 }).length;
              if (keys2 && values && keys2.length !== values.length) {
                throw new Error("Given keys array must have same length as given values array.");
              }
              if (length === 0)
                return resolve({
                  numFailures: 0,
                  failures: {},
                  results: [],
                  lastResult: void 0
                });
              var req;
              var reqs = [];
              var failures = [];
              var numFailures = 0;
              var errorHandler = function(event) {
                ++numFailures;
                preventDefault(event);
              };
              if (type2 === "deleteRange") {
                if (range.type === 4)
                  return resolve({
                    numFailures,
                    failures,
                    results: [],
                    lastResult: void 0
                  });
                if (range.type === 3)
                  reqs.push(req = store.clear());
                else
                  reqs.push(req = store.delete(makeIDBKeyRange(range)));
              } else {
                var _a4 = isAddOrPut ? outbound ? [values, keys2] : [values, null] : [keys2, null], args1 = _a4[0], args2 = _a4[1];
                if (isAddOrPut) {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = args2 && args2[i] !== void 0 ? store[type2](args1[i], args2[i]) : store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                } else {
                  for (var i = 0; i < length; ++i) {
                    reqs.push(req = store[type2](args1[i]));
                    req.onerror = errorHandler;
                  }
                }
              }
              var done = function(event) {
                var lastResult = event.target.result;
                reqs.forEach(function(req2, i2) {
                  return req2.error != null && (failures[i2] = req2.error);
                });
                resolve({
                  numFailures,
                  failures,
                  results: type2 === "delete" ? keys2 : reqs.map(function(req2) {
                    return req2.result;
                  }),
                  lastResult
                });
              };
              req.onerror = function(event) {
                errorHandler(event);
                done(event);
              };
              req.onsuccess = done;
            });
          }
          function openCursor2(_a3) {
            var trans = _a3.trans, values = _a3.values, query2 = _a3.query, reverse = _a3.reverse, unique = _a3.unique;
            return new Promise(function(resolve, reject) {
              resolve = wrap(resolve);
              var index = query2.index, range = query2.range;
              var store = trans.objectStore(tableName);
              var source = index.isPrimaryKey ? store : store.index(index.name);
              var direction = reverse ? unique ? "prevunique" : "prev" : unique ? "nextunique" : "next";
              var req = values || !("openKeyCursor" in source) ? source.openCursor(makeIDBKeyRange(range), direction) : source.openKeyCursor(makeIDBKeyRange(range), direction);
              req.onerror = eventRejectHandler(reject);
              req.onsuccess = wrap(function(ev) {
                var cursor = req.result;
                if (!cursor) {
                  resolve(null);
                  return;
                }
                cursor.___id = ++_id_counter;
                cursor.done = false;
                var _cursorContinue = cursor.continue.bind(cursor);
                var _cursorContinuePrimaryKey = cursor.continuePrimaryKey;
                if (_cursorContinuePrimaryKey)
                  _cursorContinuePrimaryKey = _cursorContinuePrimaryKey.bind(cursor);
                var _cursorAdvance = cursor.advance.bind(cursor);
                var doThrowCursorIsNotStarted = function() {
                  throw new Error("Cursor not started");
                };
                var doThrowCursorIsStopped = function() {
                  throw new Error("Cursor not stopped");
                };
                cursor.trans = trans;
                cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsNotStarted;
                cursor.fail = wrap(reject);
                cursor.next = function() {
                  var _this = this;
                  var gotOne = 1;
                  return this.start(function() {
                    return gotOne-- ? _this.continue() : _this.stop();
                  }).then(function() {
                    return _this;
                  });
                };
                cursor.start = function(callback) {
                  var iterationPromise = new Promise(function(resolveIteration, rejectIteration) {
                    resolveIteration = wrap(resolveIteration);
                    req.onerror = eventRejectHandler(rejectIteration);
                    cursor.fail = rejectIteration;
                    cursor.stop = function(value) {
                      cursor.stop = cursor.continue = cursor.continuePrimaryKey = cursor.advance = doThrowCursorIsStopped;
                      resolveIteration(value);
                    };
                  });
                  var guardedCallback = function() {
                    if (req.result) {
                      try {
                        callback();
                      } catch (err) {
                        cursor.fail(err);
                      }
                    } else {
                      cursor.done = true;
                      cursor.start = function() {
                        throw new Error("Cursor behind last entry");
                      };
                      cursor.stop();
                    }
                  };
                  req.onsuccess = wrap(function(ev2) {
                    req.onsuccess = guardedCallback;
                    guardedCallback();
                  });
                  cursor.continue = _cursorContinue;
                  cursor.continuePrimaryKey = _cursorContinuePrimaryKey;
                  cursor.advance = _cursorAdvance;
                  guardedCallback();
                  return iterationPromise;
                };
                resolve(cursor);
              }, reject);
            });
          }
          function query(hasGetAll2, hasIdb3Features2) {
            return function(request) {
              return new Promise(function(resolve, reject) {
                var _a3;
                resolve = wrap(resolve);
                var trans = request.trans, values = request.values, limit = request.limit, query2 = request.query;
                var direction = (_a3 = request.direction) !== null && _a3 !== void 0 ? _a3 : "next";
                var nonInfinitLimit = limit === Infinity ? void 0 : limit;
                var index = query2.index, range = query2.range;
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                if (limit === 0)
                  return resolve({ result: [] });
                if (hasIdb3Features2) {
                  var options = {
                    query: idbKeyRange,
                    count: nonInfinitLimit,
                    direction
                  };
                  var req = values ? source.getAll(options) : source.getAllKeys(options);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else if (hasGetAll2 && direction === "next") {
                  var req = values ? source.getAll(idbKeyRange, nonInfinitLimit) : source.getAllKeys(idbKeyRange, nonInfinitLimit);
                  req.onsuccess = function(event) {
                    return resolve({ result: event.target.result });
                  };
                  req.onerror = eventRejectHandler(reject);
                } else {
                  var count_1 = 0;
                  var req_1 = values || !("openKeyCursor" in source) ? source.openCursor(idbKeyRange, direction) : source.openKeyCursor(idbKeyRange, direction);
                  var result_1 = [];
                  req_1.onsuccess = function() {
                    var cursor = req_1.result;
                    if (!cursor)
                      return resolve({ result: result_1 });
                    result_1.push(values ? cursor.value : cursor.primaryKey);
                    if (++count_1 === limit)
                      return resolve({ result: result_1 });
                    cursor.continue();
                  };
                  req_1.onerror = eventRejectHandler(reject);
                }
              });
            };
          }
          return {
            name: tableName,
            schema: tableSchema,
            mutate,
            getMany: function(_a3) {
              var trans = _a3.trans, keys2 = _a3.keys;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var length = keys2.length;
                var result = new Array(length);
                var keyCount = 0;
                var callbackCount = 0;
                var req;
                var successHandler = function(event) {
                  var req2 = event.target;
                  if ((result[req2._pos] = req2.result) != null)
                    ;
                  if (++callbackCount === keyCount)
                    resolve(result);
                };
                var errorHandler = eventRejectHandler(reject);
                for (var i = 0; i < length; ++i) {
                  var key = keys2[i];
                  if (key != null) {
                    req = store.get(keys2[i]);
                    req._pos = i;
                    req.onsuccess = successHandler;
                    req.onerror = errorHandler;
                    ++keyCount;
                  }
                }
                if (keyCount === 0)
                  resolve(result);
              });
            },
            get: function(_a3) {
              var trans = _a3.trans, key = _a3.key;
              return new Promise(function(resolve, reject) {
                resolve = wrap(resolve);
                var store = trans.objectStore(tableName);
                var req = store.get(key);
                req.onsuccess = function(event) {
                  return resolve(event.target.result);
                };
                req.onerror = eventRejectHandler(reject);
              });
            },
            query: query(hasGetAll, hasIdb3Features),
            openCursor: openCursor2,
            count: function(_a3) {
              var query2 = _a3.query, trans = _a3.trans;
              var index = query2.index, range = query2.range;
              return new Promise(function(resolve, reject) {
                var store = trans.objectStore(tableName);
                var source = index.isPrimaryKey ? store : store.index(index.name);
                var idbKeyRange = makeIDBKeyRange(range);
                var req = idbKeyRange ? source.count(idbKeyRange) : source.count();
                req.onsuccess = wrap(function(ev) {
                  return resolve(ev.target.result);
                });
                req.onerror = eventRejectHandler(reject);
              });
            }
          };
        }
        var _a2 = extractSchema(db2, tmpTrans), schema = _a2.schema, hasGetAll = _a2.hasGetAll, hasIdb3Features = _a2.hasIdb3Features;
        var tables = schema.tables.map(function(tableSchema) {
          return createDbCoreTable(tableSchema);
        });
        var tableMap = {};
        tables.forEach(function(table) {
          return tableMap[table.name] = table;
        });
        return {
          stack: "dbcore",
          transaction: db2.transaction.bind(db2),
          table: function(name) {
            var result = tableMap[name];
            if (!result)
              throw new Error("Table '".concat(name, "' not found"));
            return tableMap[name];
          },
          MIN_KEY: -Infinity,
          MAX_KEY: getMaxKey(IdbKeyRange),
          schema
        };
      }
      function createMiddlewareStack(stackImpl, middlewares) {
        return middlewares.reduce(function(down, _a2) {
          var create2 = _a2.create;
          return __assign(__assign({}, down), create2(down));
        }, stackImpl);
      }
      function createMiddlewareStacks(middlewares, idbdb, _a2, tmpTrans) {
        var IDBKeyRange = _a2.IDBKeyRange;
        _a2.indexedDB;
        var dbcore = createMiddlewareStack(createDBCore(idbdb, IDBKeyRange, tmpTrans), middlewares.dbcore);
        return {
          dbcore
        };
      }
      function generateMiddlewareStacks(db2, tmpTrans) {
        var idbdb = tmpTrans.db;
        var stacks = createMiddlewareStacks(db2._middlewares, idbdb, db2._deps, tmpTrans);
        db2.core = stacks.dbcore;
        db2.tables.forEach(function(table) {
          var tableName = table.name;
          if (db2.core.schema.tables.some(function(tbl) {
            return tbl.name === tableName;
          })) {
            table.core = db2.core.table(tableName);
            if (db2[tableName] instanceof db2.Table) {
              db2[tableName].core = table.core;
            }
          }
        });
      }
      function setApiOnPlace(db2, objs, tableNames, dbschema) {
        tableNames.forEach(function(tableName) {
          var schema = dbschema[tableName];
          objs.forEach(function(obj) {
            var propDesc = getPropertyDescriptor(obj, tableName);
            if (!propDesc || "value" in propDesc && propDesc.value === void 0) {
              if (obj === db2.Transaction.prototype || obj instanceof db2.Transaction) {
                setProp(obj, tableName, {
                  get: function() {
                    return this.table(tableName);
                  },
                  set: function(value) {
                    defineProperty(this, tableName, {
                      value,
                      writable: true,
                      configurable: true,
                      enumerable: true
                    });
                  }
                });
              } else {
                obj[tableName] = new db2.Table(tableName, schema);
              }
            }
          });
        });
      }
      function removeTablesApi(db2, objs) {
        objs.forEach(function(obj) {
          for (var key in obj) {
            if (obj[key] instanceof db2.Table)
              delete obj[key];
          }
        });
      }
      function lowerVersionFirst(a, b) {
        return a._cfg.version - b._cfg.version;
      }
      function runUpgraders(db2, oldVersion, idbUpgradeTrans, reject) {
        var globalSchema = db2._dbSchema;
        if (idbUpgradeTrans.objectStoreNames.contains("$meta") && !globalSchema.$meta) {
          globalSchema.$meta = createTableSchema("$meta", parseIndexSyntax("")[0], []);
          db2._storeNames.push("$meta");
        }
        var trans = db2._createTransaction("readwrite", db2._storeNames, globalSchema);
        trans.create(idbUpgradeTrans);
        trans._completion.catch(reject);
        var rejectTransaction = trans._reject.bind(trans);
        var transless = PSD.transless || PSD;
        newScope(function() {
          PSD.trans = trans;
          PSD.transless = transless;
          if (oldVersion === 0) {
            keys(globalSchema).forEach(function(tableName) {
              createTable(idbUpgradeTrans, tableName, globalSchema[tableName].primKey, globalSchema[tableName].indexes);
            });
            generateMiddlewareStacks(db2, idbUpgradeTrans);
            DexiePromise.follow(function() {
              return db2.on.populate.fire(trans);
            }).catch(rejectTransaction);
          } else {
            generateMiddlewareStacks(db2, idbUpgradeTrans);
            return getExistingVersion(db2, trans, oldVersion).then(function(oldVersion2) {
              return updateTablesAndIndexes(db2, oldVersion2, trans, idbUpgradeTrans);
            }).catch(rejectTransaction);
          }
        });
      }
      function patchCurrentVersion(db2, idbUpgradeTrans) {
        createMissingTables(db2._dbSchema, idbUpgradeTrans);
        if (idbUpgradeTrans.db.version % 10 === 0 && !idbUpgradeTrans.objectStoreNames.contains("$meta")) {
          idbUpgradeTrans.db.createObjectStore("$meta").add(Math.ceil(idbUpgradeTrans.db.version / 10 - 1), "version");
        }
        var globalSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        adjustToExistingIndexNames(db2, db2._dbSchema, idbUpgradeTrans);
        var diff = getSchemaDiff(globalSchema, db2._dbSchema);
        var _loop_1 = function(tableChange2) {
          if (tableChange2.change.length || tableChange2.recreate) {
            console.warn("Unable to patch indexes of table ".concat(tableChange2.name, " because it has changes on the type of index or primary key."));
            return { value: void 0 };
          }
          var store = idbUpgradeTrans.objectStore(tableChange2.name);
          tableChange2.add.forEach(function(idx) {
            if (debug)
              console.debug("Dexie upgrade patch: Creating missing index ".concat(tableChange2.name, ".").concat(idx.src));
            addIndex(store, idx);
          });
        };
        for (var _i = 0, _a2 = diff.change; _i < _a2.length; _i++) {
          var tableChange = _a2[_i];
          var state_1 = _loop_1(tableChange);
          if (typeof state_1 === "object")
            return state_1.value;
        }
      }
      function getExistingVersion(db2, trans, oldVersion) {
        if (trans.storeNames.includes("$meta")) {
          return trans.table("$meta").get("version").then(function(metaVersion) {
            return metaVersion != null ? metaVersion : oldVersion;
          });
        } else {
          return DexiePromise.resolve(oldVersion);
        }
      }
      function updateTablesAndIndexes(db2, oldVersion, trans, idbUpgradeTrans) {
        var queue = [];
        var versions = db2._versions;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, db2.idbdb, idbUpgradeTrans);
        var versToRun = versions.filter(function(v) {
          return v._cfg.version >= oldVersion;
        });
        if (versToRun.length === 0) {
          return DexiePromise.resolve();
        }
        versToRun.forEach(function(version) {
          queue.push(function() {
            var oldSchema = globalSchema;
            var newSchema = version._cfg.dbschema;
            adjustToExistingIndexNames(db2, oldSchema, idbUpgradeTrans);
            adjustToExistingIndexNames(db2, newSchema, idbUpgradeTrans);
            globalSchema = db2._dbSchema = newSchema;
            var diff = getSchemaDiff(oldSchema, newSchema);
            diff.add.forEach(function(tuple) {
              createTable(idbUpgradeTrans, tuple[0], tuple[1].primKey, tuple[1].indexes);
            });
            diff.change.forEach(function(change) {
              if (change.recreate) {
                throw new exceptions.Upgrade("Not yet support for changing primary key");
              } else {
                var store_1 = idbUpgradeTrans.objectStore(change.name);
                change.add.forEach(function(idx) {
                  return addIndex(store_1, idx);
                });
                change.change.forEach(function(idx) {
                  store_1.deleteIndex(idx.name);
                  addIndex(store_1, idx);
                });
                change.del.forEach(function(idxName) {
                  return store_1.deleteIndex(idxName);
                });
              }
            });
            var contentUpgrade = version._cfg.contentUpgrade;
            if (contentUpgrade && version._cfg.version > oldVersion) {
              generateMiddlewareStacks(db2, idbUpgradeTrans);
              trans._memoizedTables = {};
              var upgradeSchema_1 = shallowClone(newSchema);
              diff.del.forEach(function(table) {
                upgradeSchema_1[table] = oldSchema[table];
              });
              removeTablesApi(db2, [db2.Transaction.prototype]);
              setApiOnPlace(db2, [db2.Transaction.prototype], keys(upgradeSchema_1), upgradeSchema_1);
              trans.schema = upgradeSchema_1;
              var contentUpgradeIsAsync_1 = isAsyncFunction(contentUpgrade);
              if (contentUpgradeIsAsync_1) {
                incrementExpectedAwaits();
              }
              var returnValue_1;
              var promiseFollowed = DexiePromise.follow(function() {
                returnValue_1 = contentUpgrade(trans);
                if (returnValue_1) {
                  if (contentUpgradeIsAsync_1) {
                    var decrementor = decrementExpectedAwaits.bind(null, null);
                    returnValue_1.then(decrementor, decrementor);
                  }
                }
              });
              return returnValue_1 && typeof returnValue_1.then === "function" ? DexiePromise.resolve(returnValue_1) : promiseFollowed.then(function() {
                return returnValue_1;
              });
            }
          });
          queue.push(function(idbtrans) {
            var newSchema = version._cfg.dbschema;
            deleteRemovedTables(newSchema, idbtrans);
            removeTablesApi(db2, [db2.Transaction.prototype]);
            setApiOnPlace(db2, [db2.Transaction.prototype], db2._storeNames, db2._dbSchema);
            trans.schema = db2._dbSchema;
          });
          queue.push(function(idbtrans) {
            if (db2.idbdb.objectStoreNames.contains("$meta")) {
              if (Math.ceil(db2.idbdb.version / 10) === version._cfg.version) {
                db2.idbdb.deleteObjectStore("$meta");
                delete db2._dbSchema.$meta;
                db2._storeNames = db2._storeNames.filter(function(name) {
                  return name !== "$meta";
                });
              } else {
                idbtrans.objectStore("$meta").put(version._cfg.version, "version");
              }
            }
          });
        });
        function runQueue() {
          return queue.length ? DexiePromise.resolve(queue.shift()(trans.idbtrans)).then(runQueue) : DexiePromise.resolve();
        }
        return runQueue().then(function() {
          createMissingTables(globalSchema, idbUpgradeTrans);
        });
      }
      function getSchemaDiff(oldSchema, newSchema) {
        var diff = {
          del: [],
          add: [],
          change: []
        };
        var table;
        for (table in oldSchema) {
          if (!newSchema[table])
            diff.del.push(table);
        }
        for (table in newSchema) {
          var oldDef = oldSchema[table], newDef = newSchema[table];
          if (!oldDef) {
            diff.add.push([table, newDef]);
          } else {
            var change = {
              name: table,
              def: newDef,
              recreate: false,
              del: [],
              add: [],
              change: []
            };
            if ("" + (oldDef.primKey.keyPath || "") !== "" + (newDef.primKey.keyPath || "") || oldDef.primKey.auto !== newDef.primKey.auto) {
              change.recreate = true;
              diff.change.push(change);
            } else {
              var oldIndexes = oldDef.idxByName;
              var newIndexes = newDef.idxByName;
              var idxName = void 0;
              for (idxName in oldIndexes) {
                if (!newIndexes[idxName])
                  change.del.push(idxName);
              }
              for (idxName in newIndexes) {
                var oldIdx = oldIndexes[idxName], newIdx = newIndexes[idxName];
                if (!oldIdx)
                  change.add.push(newIdx);
                else if (oldIdx.src !== newIdx.src)
                  change.change.push(newIdx);
              }
              if (change.del.length > 0 || change.add.length > 0 || change.change.length > 0) {
                diff.change.push(change);
              }
            }
          }
        }
        return diff;
      }
      function createTable(idbtrans, tableName, primKey, indexes) {
        var store = idbtrans.db.createObjectStore(tableName, primKey.keyPath ? { keyPath: primKey.keyPath, autoIncrement: primKey.auto } : { autoIncrement: primKey.auto });
        indexes.forEach(function(idx) {
          return addIndex(store, idx);
        });
        return store;
      }
      function createMissingTables(newSchema, idbtrans) {
        keys(newSchema).forEach(function(tableName) {
          if (!idbtrans.db.objectStoreNames.contains(tableName)) {
            if (debug)
              console.debug("Dexie: Creating missing table", tableName);
            createTable(idbtrans, tableName, newSchema[tableName].primKey, newSchema[tableName].indexes);
          }
        });
      }
      function deleteRemovedTables(newSchema, idbtrans) {
        [].slice.call(idbtrans.db.objectStoreNames).forEach(function(storeName) {
          return newSchema[storeName] == null && idbtrans.db.deleteObjectStore(storeName);
        });
      }
      function addIndex(store, idx) {
        store.createIndex(idx.name, idx.keyPath, {
          unique: idx.unique,
          multiEntry: idx.multi
        });
      }
      function buildGlobalSchema(db2, idbdb, tmpTrans) {
        var globalSchema = {};
        var dbStoreNames = slice(idbdb.objectStoreNames, 0);
        dbStoreNames.forEach(function(storeName) {
          var store = tmpTrans.objectStore(storeName);
          var keyPath = store.keyPath;
          var primKey = createIndexSpec(nameFromKeyPath(keyPath), keyPath || "", true, false, !!store.autoIncrement, keyPath && typeof keyPath !== "string", true);
          var indexes = [];
          for (var j = 0; j < store.indexNames.length; ++j) {
            var idbindex = store.index(store.indexNames[j]);
            keyPath = idbindex.keyPath;
            var index = createIndexSpec(idbindex.name, keyPath, !!idbindex.unique, !!idbindex.multiEntry, false, keyPath && typeof keyPath !== "string", false);
            indexes.push(index);
          }
          globalSchema[storeName] = createTableSchema(storeName, primKey, indexes);
        });
        return globalSchema;
      }
      function readGlobalSchema(db2, idbdb, tmpTrans) {
        db2.verno = idbdb.version / 10;
        var globalSchema = db2._dbSchema = buildGlobalSchema(db2, idbdb, tmpTrans);
        db2._storeNames = slice(idbdb.objectStoreNames, 0);
        setApiOnPlace(db2, [db2._allTables], keys(globalSchema), globalSchema);
      }
      function verifyInstalledSchema(db2, tmpTrans) {
        var installedSchema = buildGlobalSchema(db2, db2.idbdb, tmpTrans);
        var diff = getSchemaDiff(installedSchema, db2._dbSchema);
        return !(diff.add.length || diff.change.some(function(ch) {
          return ch.add.length || ch.change.length;
        }));
      }
      function adjustToExistingIndexNames(db2, schema, idbtrans) {
        var storeNames = idbtrans.db.objectStoreNames;
        for (var i = 0; i < storeNames.length; ++i) {
          var storeName = storeNames[i];
          var store = idbtrans.objectStore(storeName);
          db2._hasGetAll = "getAll" in store;
          for (var j = 0; j < store.indexNames.length; ++j) {
            var indexName = store.indexNames[j];
            var keyPath = store.index(indexName).keyPath;
            var dexieName = typeof keyPath === "string" ? keyPath : "[" + slice(keyPath).join("+") + "]";
            if (schema[storeName]) {
              var indexSpec = schema[storeName].idxByName[dexieName];
              if (indexSpec) {
                indexSpec.name = indexName;
                delete schema[storeName].idxByName[dexieName];
                schema[storeName].idxByName[indexName] = indexSpec;
              }
            }
          }
        }
        if (typeof navigator !== "undefined" && /Safari/.test(navigator.userAgent) && !/(Chrome\/|Edge\/)/.test(navigator.userAgent) && _global2.WorkerGlobalScope && _global2 instanceof _global2.WorkerGlobalScope && [].concat(navigator.userAgent.match(/Safari\/(\d*)/))[1] < 604) {
          db2._hasGetAll = false;
        }
      }
      function parseIndexSyntax(primKeyAndIndexes) {
        return primKeyAndIndexes.split(",").map(function(index, indexNum) {
          var _a2;
          var typeSplit = index.split(":");
          var type2 = (_a2 = typeSplit[1]) === null || _a2 === void 0 ? void 0 : _a2.trim();
          index = typeSplit[0].trim();
          var name = index.replace(/([&*]|\+\+)/g, "");
          var keyPath = /^\[/.test(name) ? name.match(/^\[(.*)\]$/)[1].split("+") : name;
          return createIndexSpec(name, keyPath || null, /\&/.test(index), /\*/.test(index), /\+\+/.test(index), isArray2(keyPath), indexNum === 0, type2);
        });
      }
      var Version = (function() {
        function Version2() {
        }
        Version2.prototype._createTableSchema = function(name, primKey, indexes) {
          return createTableSchema(name, primKey, indexes);
        };
        Version2.prototype._parseIndexSyntax = function(primKeyAndIndexes) {
          return parseIndexSyntax(primKeyAndIndexes);
        };
        Version2.prototype._parseStoresSpec = function(stores, outSchema) {
          var _this = this;
          keys(stores).forEach(function(tableName) {
            if (stores[tableName] !== null) {
              var indexes = _this._parseIndexSyntax(stores[tableName]);
              var primKey = indexes.shift();
              if (!primKey) {
                throw new exceptions.Schema("Invalid schema for table " + tableName + ": " + stores[tableName]);
              }
              primKey.unique = true;
              if (primKey.multi)
                throw new exceptions.Schema("Primary key cannot be multiEntry*");
              indexes.forEach(function(idx) {
                if (idx.auto)
                  throw new exceptions.Schema("Only primary key can be marked as autoIncrement (++)");
                if (!idx.keyPath)
                  throw new exceptions.Schema("Index must have a name and cannot be an empty string");
              });
              var tblSchema = _this._createTableSchema(tableName, primKey, indexes);
              outSchema[tableName] = tblSchema;
            }
          });
        };
        Version2.prototype.stores = function(stores) {
          var db2 = this.db;
          this._cfg.storesSource = this._cfg.storesSource ? extend2(this._cfg.storesSource, stores) : stores;
          var versions = db2._versions;
          var storesSpec = {};
          var dbschema = {};
          versions.forEach(function(version) {
            extend2(storesSpec, version._cfg.storesSource);
            dbschema = version._cfg.dbschema = {};
            version._parseStoresSpec(storesSpec, dbschema);
          });
          db2._dbSchema = dbschema;
          removeTablesApi(db2, [db2._allTables, db2, db2.Transaction.prototype]);
          setApiOnPlace(db2, [db2._allTables, db2, db2.Transaction.prototype, this._cfg.tables], keys(dbschema), dbschema);
          db2._storeNames = keys(dbschema);
          return this;
        };
        Version2.prototype.upgrade = function(upgradeFunction) {
          this._cfg.contentUpgrade = promisableChain(this._cfg.contentUpgrade || nop, upgradeFunction);
          return this;
        };
        return Version2;
      })();
      function createVersionConstructor(db2) {
        return makeClassConstructor(Version.prototype, function Version2(versionNumber) {
          this.db = db2;
          this._cfg = {
            version: versionNumber,
            storesSource: null,
            dbschema: {},
            tables: {},
            contentUpgrade: null
          };
        });
      }
      var connections = createConnectionsManager();
      function createConnectionsManager() {
        if (typeof FinalizationRegistry !== "undefined" && typeof WeakRef !== "undefined") {
          var _refs_1 = /* @__PURE__ */ new Set();
          var _registry_1 = new FinalizationRegistry(function(ref) {
            _refs_1.delete(ref);
          });
          var toArray2 = function() {
            return Array.from(_refs_1).map(function(ref) {
              return ref.deref();
            }).filter(function(db2) {
              return db2 !== void 0;
            });
          };
          var add3 = function(db2) {
            var ref = new WeakRef(db2._novip);
            _refs_1.add(ref);
            _registry_1.register(db2._novip, ref, ref);
            if (_refs_1.size > db2._options.maxConnections) {
              var oldestRef = _refs_1.values().next().value;
              _refs_1.delete(oldestRef);
              _registry_1.unregister(oldestRef);
            }
          };
          var remove3 = function(db2) {
            if (!db2)
              return;
            var iterator2 = _refs_1.values();
            var result = iterator2.next();
            while (!result.done) {
              var ref = result.value;
              if (ref.deref() === db2._novip) {
                _refs_1.delete(ref);
                _registry_1.unregister(ref);
                return;
              }
              result = iterator2.next();
            }
          };
          return { toArray: toArray2, add: add3, remove: remove3 };
        } else {
          var connections_1 = [];
          var toArray2 = function() {
            return connections_1;
          };
          var add3 = function(db2) {
            connections_1.push(db2._novip);
          };
          var remove3 = function(db2) {
            if (!db2)
              return;
            var index = connections_1.indexOf(db2._novip);
            if (index !== -1) {
              connections_1.splice(index, 1);
            }
          };
          return { toArray: toArray2, add: add3, remove: remove3 };
        }
      }
      function getDbNamesTable(indexedDB2, IDBKeyRange) {
        var dbNamesDB = indexedDB2["_dbNamesDB"];
        if (!dbNamesDB) {
          dbNamesDB = indexedDB2["_dbNamesDB"] = new Dexie$1(DBNAMES_DB, {
            addons: [],
            indexedDB: indexedDB2,
            IDBKeyRange
          });
          dbNamesDB.version(1).stores({ dbnames: "name" });
        }
        return dbNamesDB.table("dbnames");
      }
      function hasDatabasesNative(indexedDB2) {
        return indexedDB2 && typeof indexedDB2.databases === "function";
      }
      function getDatabaseNames(_a2) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        return hasDatabasesNative(indexedDB2) ? Promise.resolve(indexedDB2.databases()).then(function(infos) {
          return infos.map(function(info) {
            return info.name;
          }).filter(function(name) {
            return name !== DBNAMES_DB;
          });
        }) : getDbNamesTable(indexedDB2, IDBKeyRange).toCollection().primaryKeys();
      }
      function _onDatabaseCreated(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).put({ name }).catch(nop);
      }
      function _onDatabaseDeleted(_a2, name) {
        var indexedDB2 = _a2.indexedDB, IDBKeyRange = _a2.IDBKeyRange;
        !hasDatabasesNative(indexedDB2) && name !== DBNAMES_DB && getDbNamesTable(indexedDB2, IDBKeyRange).delete(name).catch(nop);
      }
      function vip(fn) {
        return newScope(function() {
          PSD.letThrough = true;
          return fn();
        });
      }
      function idbReady() {
        var isSafari = !navigator.userAgentData && /Safari\//.test(navigator.userAgent) && !/Chrom(e|ium)\//.test(navigator.userAgent);
        if (!isSafari || !indexedDB.databases)
          return Promise.resolve();
        var intervalId;
        return new Promise(function(resolve) {
          var tryIdb = function() {
            return indexedDB.databases().finally(resolve);
          };
          intervalId = setInterval(tryIdb, 100);
          tryIdb();
        }).finally(function() {
          return clearInterval(intervalId);
        });
      }
      var _a;
      function isEmptyRange(node) {
        return !("from" in node);
      }
      var RangeSet2 = function(fromOrTree, to) {
        if (this) {
          extend2(this, arguments.length ? { d: 1, from: fromOrTree, to: arguments.length > 1 ? to : fromOrTree } : { d: 0 });
        } else {
          var rv = new RangeSet2();
          if (fromOrTree && "d" in fromOrTree) {
            extend2(rv, fromOrTree);
          }
          return rv;
        }
      };
      props(RangeSet2.prototype, (_a = {
        add: function(rangeSet) {
          mergeRanges2(this, rangeSet);
          return this;
        },
        addKey: function(key) {
          addRange(this, key, key);
          return this;
        },
        addKeys: function(keys2) {
          var _this = this;
          keys2.forEach(function(key) {
            return addRange(_this, key, key);
          });
          return this;
        },
        hasKey: function(key) {
          var node = getRangeSetIterator(this).next(key).value;
          return node && cmp2(node.from, key) <= 0 && cmp2(node.to, key) >= 0;
        }
      }, _a[iteratorSymbol] = function() {
        return getRangeSetIterator(this);
      }, _a));
      function addRange(target, from, to) {
        var diff = cmp2(from, to);
        if (isNaN(diff))
          return;
        if (diff > 0)
          throw RangeError();
        if (isEmptyRange(target))
          return extend2(target, { from, to, d: 1 });
        var left = target.l;
        var right = target.r;
        if (cmp2(to, target.from) < 0) {
          left ? addRange(left, from, to) : target.l = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.to) > 0) {
          right ? addRange(right, from, to) : target.r = { from, to, d: 1, l: null, r: null };
          return rebalance(target);
        }
        if (cmp2(from, target.from) < 0) {
          target.from = from;
          target.l = null;
          target.d = right ? right.d + 1 : 1;
        }
        if (cmp2(to, target.to) > 0) {
          target.to = to;
          target.r = null;
          target.d = target.l ? target.l.d + 1 : 1;
        }
        var rightWasCutOff = !target.r;
        if (left && !target.l) {
          mergeRanges2(target, left);
        }
        if (right && rightWasCutOff) {
          mergeRanges2(target, right);
        }
      }
      function mergeRanges2(target, newSet) {
        function _addRangeSet(target2, _a2) {
          var from = _a2.from, to = _a2.to, l = _a2.l, r = _a2.r;
          addRange(target2, from, to);
          if (l)
            _addRangeSet(target2, l);
          if (r)
            _addRangeSet(target2, r);
        }
        if (!isEmptyRange(newSet))
          _addRangeSet(target, newSet);
      }
      function rangesOverlap2(rangeSet1, rangeSet2) {
        var i1 = getRangeSetIterator(rangeSet2);
        var nextResult1 = i1.next();
        if (nextResult1.done)
          return false;
        var a = nextResult1.value;
        var i2 = getRangeSetIterator(rangeSet1);
        var nextResult2 = i2.next(a.from);
        var b = nextResult2.value;
        while (!nextResult1.done && !nextResult2.done) {
          if (cmp2(b.from, a.to) <= 0 && cmp2(b.to, a.from) >= 0)
            return true;
          cmp2(a.from, b.from) < 0 ? a = (nextResult1 = i1.next(b.from)).value : b = (nextResult2 = i2.next(a.from)).value;
        }
        return false;
      }
      function getRangeSetIterator(node) {
        var state = isEmptyRange(node) ? null : { s: 0, n: node };
        return {
          next: function(key) {
            var keyProvided = arguments.length > 0;
            while (state) {
              switch (state.s) {
                case 0:
                  state.s = 1;
                  if (keyProvided) {
                    while (state.n.l && cmp2(key, state.n.from) < 0)
                      state = { up: state, n: state.n.l, s: 1 };
                  } else {
                    while (state.n.l)
                      state = { up: state, n: state.n.l, s: 1 };
                  }
                case 1:
                  state.s = 2;
                  if (!keyProvided || cmp2(key, state.n.to) <= 0)
                    return { value: state.n, done: false };
                case 2:
                  if (state.n.r) {
                    state.s = 3;
                    state = { up: state, n: state.n.r, s: 0 };
                    continue;
                  }
                case 3:
                  state = state.up;
              }
            }
            return { done: true };
          }
        };
      }
      function rebalance(target) {
        var _a2, _b;
        var diff = (((_a2 = target.r) === null || _a2 === void 0 ? void 0 : _a2.d) || 0) - (((_b = target.l) === null || _b === void 0 ? void 0 : _b.d) || 0);
        var r = diff > 1 ? "r" : diff < -1 ? "l" : "";
        if (r) {
          var l = r === "r" ? "l" : "r";
          var rootClone = __assign({}, target);
          var oldRootRight = target[r];
          target.from = oldRootRight.from;
          target.to = oldRootRight.to;
          target[r] = oldRootRight[r];
          rootClone[r] = oldRootRight[l];
          target[l] = rootClone;
          rootClone.d = computeDepth(rootClone);
        }
        target.d = computeDepth(target);
      }
      function computeDepth(_a2) {
        var r = _a2.r, l = _a2.l;
        return (r ? l ? Math.max(r.d, l.d) : r.d : l ? l.d : 0) + 1;
      }
      function extendObservabilitySet(target, newSet) {
        keys(newSet).forEach(function(part) {
          if (target[part])
            mergeRanges2(target[part], newSet[part]);
          else
            target[part] = cloneSimpleObjectTree(newSet[part]);
        });
        return target;
      }
      function obsSetsOverlap(os1, os2) {
        return os1.all || os2.all || Object.keys(os1).some(function(key) {
          return os2[key] && rangesOverlap2(os2[key], os1[key]);
        });
      }
      var cache = {};
      var unsignaledParts = {};
      var isTaskEnqueued = false;
      function signalSubscribersLazily(part, optimistic) {
        extendObservabilitySet(unsignaledParts, part);
        if (!isTaskEnqueued) {
          isTaskEnqueued = true;
          setTimeout(function() {
            isTaskEnqueued = false;
            var parts = unsignaledParts;
            unsignaledParts = {};
            signalSubscribersNow(parts, false);
          }, 0);
        }
      }
      function signalSubscribersNow(updatedParts, deleteAffectedCacheEntries) {
        if (deleteAffectedCacheEntries === void 0) {
          deleteAffectedCacheEntries = false;
        }
        var queriesToSignal = /* @__PURE__ */ new Set();
        if (updatedParts.all) {
          for (var _i = 0, _a2 = Object.values(cache); _i < _a2.length; _i++) {
            var tblCache = _a2[_i];
            collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
          }
        } else {
          for (var key in updatedParts) {
            var parts = /^idb\:\/\/(.*)\/(.*)\//.exec(key);
            if (parts) {
              var dbName = parts[1], tableName = parts[2];
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (tblCache)
                collectTableSubscribers(tblCache, updatedParts, queriesToSignal, deleteAffectedCacheEntries);
            }
          }
        }
        queriesToSignal.forEach(function(requery) {
          return requery();
        });
      }
      function collectTableSubscribers(tblCache, updatedParts, outQueriesToSignal, deleteAffectedCacheEntries) {
        var updatedEntryLists = [];
        for (var _i = 0, _a2 = Object.entries(tblCache.queries.query); _i < _a2.length; _i++) {
          var _b = _a2[_i], indexName = _b[0], entries = _b[1];
          var filteredEntries = [];
          for (var _c = 0, entries_1 = entries; _c < entries_1.length; _c++) {
            var entry = entries_1[_c];
            if (obsSetsOverlap(updatedParts, entry.obsSet)) {
              entry.subscribers.forEach(function(requery) {
                return outQueriesToSignal.add(requery);
              });
            } else if (deleteAffectedCacheEntries) {
              filteredEntries.push(entry);
            }
          }
          if (deleteAffectedCacheEntries)
            updatedEntryLists.push([indexName, filteredEntries]);
        }
        if (deleteAffectedCacheEntries) {
          for (var _d = 0, updatedEntryLists_1 = updatedEntryLists; _d < updatedEntryLists_1.length; _d++) {
            var _e = updatedEntryLists_1[_d], indexName = _e[0], filteredEntries = _e[1];
            tblCache.queries.query[indexName] = filteredEntries;
          }
        }
      }
      function dexieOpen(db2) {
        var state = db2._state;
        var indexedDB2 = db2._deps.indexedDB;
        if (state.isBeingOpened || db2.idbdb)
          return state.dbReadyPromise.then(function() {
            return state.dbOpenError ? rejection(state.dbOpenError) : db2;
          });
        state.isBeingOpened = true;
        state.dbOpenError = null;
        state.openComplete = false;
        var openCanceller = state.openCanceller;
        var nativeVerToOpen = Math.round(db2.verno * 10);
        var schemaPatchMode = false;
        function throwIfCancelled() {
          if (state.openCanceller !== openCanceller)
            throw new exceptions.DatabaseClosed("db.open() was cancelled");
        }
        var resolveDbReady = state.dbReadyResolve, upgradeTransaction = null, wasCreated = false;
        var tryOpenDB = function() {
          return new DexiePromise(function(resolve, reject) {
            throwIfCancelled();
            if (!indexedDB2)
              throw new exceptions.MissingAPI();
            var dbName = db2.name;
            var req = state.autoSchema || !nativeVerToOpen ? indexedDB2.open(dbName) : indexedDB2.open(dbName, nativeVerToOpen);
            if (!req)
              throw new exceptions.MissingAPI();
            req.onerror = eventRejectHandler(reject);
            req.onblocked = wrap(db2._fireOnBlocked);
            req.onupgradeneeded = wrap(function(e) {
              upgradeTransaction = req.transaction;
              if (state.autoSchema && !db2._options.allowEmptyDB) {
                req.onerror = preventDefault;
                upgradeTransaction.abort();
                req.result.close();
                var delreq = indexedDB2.deleteDatabase(dbName);
                delreq.onsuccess = delreq.onerror = wrap(function() {
                  reject(new exceptions.NoSuchDatabase("Database ".concat(dbName, " doesnt exist")));
                });
              } else {
                upgradeTransaction.onerror = eventRejectHandler(reject);
                var oldVer = e.oldVersion > Math.pow(2, 62) ? 0 : e.oldVersion;
                wasCreated = oldVer < 1;
                db2.idbdb = req.result;
                if (schemaPatchMode) {
                  patchCurrentVersion(db2, upgradeTransaction);
                }
                runUpgraders(db2, oldVer / 10, upgradeTransaction, reject);
              }
            }, reject);
            req.onsuccess = wrap(function() {
              upgradeTransaction = null;
              var idbdb = db2.idbdb = req.result;
              var objectStoreNames = slice(idbdb.objectStoreNames);
              if (objectStoreNames.length > 0)
                try {
                  var tmpTrans = idbdb.transaction(safariMultiStoreFix(objectStoreNames), "readonly");
                  if (state.autoSchema)
                    readGlobalSchema(db2, idbdb, tmpTrans);
                  else {
                    adjustToExistingIndexNames(db2, db2._dbSchema, tmpTrans);
                    if (!verifyInstalledSchema(db2, tmpTrans) && !schemaPatchMode) {
                      console.warn("Dexie SchemaDiff: Schema was extended without increasing the number passed to db.version(). Dexie will add missing parts and increment native version number to workaround this.");
                      idbdb.close();
                      nativeVerToOpen = idbdb.version + 1;
                      schemaPatchMode = true;
                      return resolve(tryOpenDB());
                    }
                  }
                  generateMiddlewareStacks(db2, tmpTrans);
                } catch (e) {
                }
              connections.add(db2);
              idbdb.onversionchange = wrap(function(ev) {
                state.vcFired = true;
                db2.on("versionchange").fire(ev);
              });
              idbdb.onclose = wrap(function() {
                db2.close({ disableAutoOpen: false });
              });
              if (wasCreated)
                _onDatabaseCreated(db2._deps, dbName);
              resolve();
            }, reject);
          }).catch(function(err) {
            switch (err === null || err === void 0 ? void 0 : err.name) {
              case "UnknownError":
                if (state.PR1398_maxLoop > 0) {
                  state.PR1398_maxLoop--;
                  console.warn("Dexie: Workaround for Chrome UnknownError on open()");
                  return tryOpenDB();
                }
                break;
              case "VersionError":
                if (nativeVerToOpen > 0) {
                  nativeVerToOpen = 0;
                  return tryOpenDB();
                }
                break;
            }
            return DexiePromise.reject(err);
          });
        };
        return DexiePromise.race([
          openCanceller,
          (typeof navigator === "undefined" ? DexiePromise.resolve() : idbReady()).then(tryOpenDB)
        ]).then(function() {
          throwIfCancelled();
          state.onReadyBeingFired = [];
          return DexiePromise.resolve(vip(function() {
            return db2.on.ready.fire(db2.vip);
          })).then(function fireRemainders() {
            if (state.onReadyBeingFired.length > 0) {
              var remainders_1 = state.onReadyBeingFired.reduce(promisableChain, nop);
              state.onReadyBeingFired = [];
              return DexiePromise.resolve(vip(function() {
                return remainders_1(db2.vip);
              })).then(fireRemainders);
            }
          });
        }).finally(function() {
          if (state.openCanceller === openCanceller) {
            state.onReadyBeingFired = null;
            state.isBeingOpened = false;
          }
        }).catch(function(err) {
          state.dbOpenError = err;
          try {
            upgradeTransaction && upgradeTransaction.abort();
          } catch (_a2) {
          }
          if (openCanceller === state.openCanceller) {
            db2._close();
          }
          return rejection(err);
        }).finally(function() {
          state.openComplete = true;
          resolveDbReady();
        }).then(function() {
          if (wasCreated) {
            var everything_1 = {};
            db2.tables.forEach(function(table) {
              table.schema.indexes.forEach(function(idx) {
                if (idx.name)
                  everything_1["idb://".concat(db2.name, "/").concat(table.name, "/").concat(idx.name)] = new RangeSet2(-Infinity, [[[]]]);
              });
              everything_1["idb://".concat(db2.name, "/").concat(table.name, "/")] = everything_1["idb://".concat(db2.name, "/").concat(table.name, "/:dels")] = new RangeSet2(-Infinity, [[[]]]);
            });
            globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME).fire(everything_1);
            signalSubscribersNow(everything_1, true);
          }
          return db2;
        });
      }
      function awaitIterator(iterator2) {
        var callNext = function(result) {
          return iterator2.next(result);
        }, doThrow = function(error) {
          return iterator2.throw(error);
        }, onSuccess = step(callNext), onError = step(doThrow);
        function step(getNext) {
          return function(val) {
            var next = getNext(val), value = next.value;
            return next.done ? value : !value || typeof value.then !== "function" ? isArray2(value) ? Promise.all(value).then(onSuccess, onError) : onSuccess(value) : value.then(onSuccess, onError);
          };
        }
        return step(callNext)();
      }
      function extractTransactionArgs(mode, _tableArgs_, scopeFunc) {
        var i = arguments.length;
        if (i < 2)
          throw new exceptions.InvalidArgument("Too few arguments");
        var args = new Array(i - 1);
        while (--i)
          args[i - 1] = arguments[i];
        scopeFunc = args.pop();
        var tables = flatten(args);
        return [mode, tables, scopeFunc];
      }
      function enterTransactionScope(db2, mode, storeNames, parentTransaction, scopeFunc) {
        return DexiePromise.resolve().then(function() {
          var transless = PSD.transless || PSD;
          var trans = db2._createTransaction(mode, storeNames, db2._dbSchema, parentTransaction);
          trans.explicit = true;
          var zoneProps = {
            trans,
            transless
          };
          if (parentTransaction) {
            trans.idbtrans = parentTransaction.idbtrans;
          } else {
            try {
              trans.create();
              trans.idbtrans._explicit = true;
              db2._state.PR1398_maxLoop = 3;
            } catch (ex) {
              if (ex.name === errnames.InvalidState && db2.isOpen() && --db2._state.PR1398_maxLoop > 0) {
                console.warn("Dexie: Need to reopen db");
                db2.close({ disableAutoOpen: false });
                return db2.open().then(function() {
                  return enterTransactionScope(db2, mode, storeNames, null, scopeFunc);
                });
              }
              return rejection(ex);
            }
          }
          var scopeFuncIsAsync = isAsyncFunction(scopeFunc);
          if (scopeFuncIsAsync) {
            incrementExpectedAwaits();
          }
          var returnValue;
          var promiseFollowed = DexiePromise.follow(function() {
            returnValue = scopeFunc.call(trans, trans);
            if (returnValue) {
              if (scopeFuncIsAsync) {
                var decrementor = decrementExpectedAwaits.bind(null, null);
                returnValue.then(decrementor, decrementor);
              } else if (typeof returnValue.next === "function" && typeof returnValue.throw === "function") {
                returnValue = awaitIterator(returnValue);
              }
            }
          }, zoneProps);
          return (returnValue && typeof returnValue.then === "function" ? DexiePromise.resolve(returnValue).then(function(x) {
            return trans.active ? x : rejection(new exceptions.PrematureCommit("Transaction committed too early. See http://bit.ly/2kdckMn"));
          }) : promiseFollowed.then(function() {
            return returnValue;
          })).then(function(x) {
            if (parentTransaction)
              trans._resolve();
            return trans._completion.then(function() {
              return x;
            });
          }).catch(function(e) {
            trans._reject(e);
            return rejection(e);
          });
        });
      }
      function pad(a, value, count) {
        var result = isArray2(a) ? a.slice() : [a];
        for (var i = 0; i < count; ++i)
          result.push(value);
        return result;
      }
      function createVirtualIndexMiddleware(down) {
        return __assign(__assign({}, down), { table: function(tableName) {
          var table = down.table(tableName);
          var schema = table.schema;
          var indexLookup = {};
          var allVirtualIndexes = [];
          function addVirtualIndexes(keyPath, keyTail, lowLevelIndex) {
            var keyPathAlias = getKeyPathAlias(keyPath);
            var indexList = indexLookup[keyPathAlias] = indexLookup[keyPathAlias] || [];
            var keyLength = keyPath == null ? 0 : typeof keyPath === "string" ? 1 : keyPath.length;
            var isVirtual = keyTail > 0;
            var virtualIndex = __assign(__assign({}, lowLevelIndex), { name: isVirtual ? "".concat(keyPathAlias, "(virtual-from:").concat(lowLevelIndex.name, ")") : lowLevelIndex.name, lowLevelIndex, isVirtual, keyTail, keyLength, extractKey: getKeyExtractor(keyPath), unique: !isVirtual && lowLevelIndex.unique });
            indexList.push(virtualIndex);
            if (!virtualIndex.isPrimaryKey) {
              allVirtualIndexes.push(virtualIndex);
            }
            if (keyLength > 1) {
              var virtualKeyPath = keyLength === 2 ? keyPath[0] : keyPath.slice(0, keyLength - 1);
              addVirtualIndexes(virtualKeyPath, keyTail + 1, lowLevelIndex);
            }
            indexList.sort(function(a, b) {
              return a.keyTail - b.keyTail;
            });
            return virtualIndex;
          }
          var primaryKey = addVirtualIndexes(schema.primaryKey.keyPath, 0, schema.primaryKey);
          indexLookup[":id"] = [primaryKey];
          for (var _i = 0, _a2 = schema.indexes; _i < _a2.length; _i++) {
            var index = _a2[_i];
            addVirtualIndexes(index.keyPath, 0, index);
          }
          function findBestIndex(keyPath) {
            var result2 = indexLookup[getKeyPathAlias(keyPath)];
            return result2 && result2[0];
          }
          function translateRange(range, keyTail) {
            return {
              type: range.type === 1 ? 2 : range.type,
              lower: pad(range.lower, range.lowerOpen ? down.MAX_KEY : down.MIN_KEY, keyTail),
              lowerOpen: true,
              upper: pad(range.upper, range.upperOpen ? down.MIN_KEY : down.MAX_KEY, keyTail),
              upperOpen: true
            };
          }
          function translateRequest(req) {
            var index2 = req.query.index;
            return index2.isVirtual ? __assign(__assign({}, req), { query: {
              index: index2.lowLevelIndex,
              range: translateRange(req.query.range, index2.keyTail)
            } }) : req;
          }
          var result = __assign(__assign({}, table), { schema: __assign(__assign({}, schema), { primaryKey, indexes: allVirtualIndexes, getIndexByKeyPath: findBestIndex }), count: function(req) {
            return table.count(translateRequest(req));
          }, query: function(req) {
            return table.query(translateRequest(req));
          }, openCursor: function(req) {
            var _a3 = req.query.index, keyTail = _a3.keyTail, isVirtual = _a3.isVirtual, keyLength = _a3.keyLength;
            if (!isVirtual)
              return table.openCursor(req);
            function createVirtualCursor(cursor) {
              function _continue(key) {
                key != null ? cursor.continue(pad(key, req.reverse ? down.MAX_KEY : down.MIN_KEY, keyTail)) : req.unique ? cursor.continue(cursor.key.slice(0, keyLength).concat(req.reverse ? down.MIN_KEY : down.MAX_KEY, keyTail)) : cursor.continue();
              }
              var virtualCursor = Object.create(cursor, {
                continue: { value: _continue },
                continuePrimaryKey: {
                  value: function(key, primaryKey2) {
                    cursor.continuePrimaryKey(pad(key, down.MAX_KEY, keyTail), primaryKey2);
                  }
                },
                primaryKey: {
                  get: function() {
                    return cursor.primaryKey;
                  }
                },
                key: {
                  get: function() {
                    var key = cursor.key;
                    return keyLength === 1 ? key[0] : key.slice(0, keyLength);
                  }
                },
                value: {
                  get: function() {
                    return cursor.value;
                  }
                }
              });
              return virtualCursor;
            }
            return table.openCursor(translateRequest(req)).then(function(cursor) {
              return cursor && createVirtualCursor(cursor);
            });
          } });
          return result;
        } });
      }
      var virtualIndexMiddleware = {
        stack: "dbcore",
        name: "VirtualIndexMiddleware",
        level: 1,
        create: createVirtualIndexMiddleware
      };
      function getObjectDiff(a, b, rv, prfx) {
        rv = rv || {};
        prfx = prfx || "";
        keys(a).forEach(function(prop) {
          if (!hasOwn(b, prop)) {
            rv[prfx + prop] = void 0;
          } else {
            var ap = a[prop], bp = b[prop];
            if (typeof ap === "object" && typeof bp === "object" && ap && bp) {
              var apTypeName = toStringTag2(ap);
              var bpTypeName = toStringTag2(bp);
              if (apTypeName !== bpTypeName) {
                rv[prfx + prop] = b[prop];
              } else if (apTypeName === "Object") {
                getObjectDiff(ap, bp, rv, prfx + prop + ".");
              } else if (ap !== bp) {
                rv[prfx + prop] = b[prop];
              }
            } else if (ap !== bp)
              rv[prfx + prop] = b[prop];
          }
        });
        keys(b).forEach(function(prop) {
          if (!hasOwn(a, prop)) {
            rv[prfx + prop] = b[prop];
          }
        });
        return rv;
      }
      function getEffectiveKeys(primaryKey, req) {
        if (req.type === "delete")
          return req.keys;
        return req.keys || req.values.map(primaryKey.extractKey);
      }
      var hooksMiddleware = {
        stack: "dbcore",
        name: "HooksMiddleware",
        level: 2,
        create: function(downCore) {
          return __assign(__assign({}, downCore), { table: function(tableName) {
            var downTable = downCore.table(tableName);
            var primaryKey = downTable.schema.primaryKey;
            var tableMiddleware = __assign(__assign({}, downTable), { mutate: function(req) {
              var dxTrans = PSD.trans;
              var _a2 = dxTrans.table(tableName).hook, deleting = _a2.deleting, creating = _a2.creating, updating = _a2.updating;
              switch (req.type) {
                case "add":
                  if (creating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "put":
                  if (creating.fire === nop && updating.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "delete":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return addPutOrDelete(req);
                  }, true);
                case "deleteRange":
                  if (deleting.fire === nop)
                    break;
                  return dxTrans._promise("readwrite", function() {
                    return deleteRange(req);
                  }, true);
              }
              return downTable.mutate(req);
              function addPutOrDelete(req2) {
                var dxTrans2 = PSD.trans;
                var keys2 = req2.keys || getEffectiveKeys(primaryKey, req2);
                if (!keys2)
                  throw new Error("Keys missing");
                req2 = req2.type === "add" || req2.type === "put" ? __assign(__assign({}, req2), { keys: keys2 }) : __assign({}, req2);
                if (req2.type !== "delete")
                  req2.values = __spreadArray([], req2.values, true);
                if (req2.keys)
                  req2.keys = __spreadArray([], req2.keys, true);
                return getExistingValues(downTable, req2, keys2).then(function(existingValues) {
                  var contexts = keys2.map(function(key, i) {
                    var existingValue = existingValues[i];
                    var ctx = { onerror: null, onsuccess: null };
                    if (req2.type === "delete") {
                      deleting.fire.call(ctx, key, existingValue, dxTrans2);
                    } else if (req2.type === "add" || existingValue === void 0) {
                      var generatedPrimaryKey = creating.fire.call(ctx, key, req2.values[i], dxTrans2);
                      if (key == null && generatedPrimaryKey != null) {
                        key = generatedPrimaryKey;
                        req2.keys[i] = key;
                        if (!primaryKey.outbound) {
                          setByKeyPath(req2.values[i], primaryKey.keyPath, key);
                        }
                      }
                    } else {
                      var objectDiff = getObjectDiff(existingValue, req2.values[i]);
                      var additionalChanges_1 = updating.fire.call(ctx, objectDiff, key, existingValue, dxTrans2);
                      if (additionalChanges_1) {
                        var requestedValue_1 = req2.values[i];
                        Object.keys(additionalChanges_1).forEach(function(keyPath) {
                          if (hasOwn(requestedValue_1, keyPath)) {
                            requestedValue_1[keyPath] = additionalChanges_1[keyPath];
                          } else {
                            setByKeyPath(requestedValue_1, keyPath, additionalChanges_1[keyPath]);
                          }
                        });
                      }
                    }
                    return ctx;
                  });
                  return downTable.mutate(req2).then(function(_a3) {
                    var failures = _a3.failures, results = _a3.results, numFailures = _a3.numFailures, lastResult = _a3.lastResult;
                    for (var i = 0; i < keys2.length; ++i) {
                      var primKey = results ? results[i] : keys2[i];
                      var ctx = contexts[i];
                      if (primKey == null) {
                        ctx.onerror && ctx.onerror(failures[i]);
                      } else {
                        ctx.onsuccess && ctx.onsuccess(
                          req2.type === "put" && existingValues[i] ? req2.values[i] : primKey
                        );
                      }
                    }
                    return { failures, results, numFailures, lastResult };
                  }).catch(function(error) {
                    contexts.forEach(function(ctx) {
                      return ctx.onerror && ctx.onerror(error);
                    });
                    return Promise.reject(error);
                  });
                });
              }
              function deleteRange(req2) {
                return deleteNextChunk(req2.trans, req2.range, 1e4);
              }
              function deleteNextChunk(trans, range, limit) {
                return downTable.query({
                  trans,
                  values: false,
                  query: { index: primaryKey, range },
                  limit
                }).then(function(_a3) {
                  var result = _a3.result;
                  return addPutOrDelete({
                    type: "delete",
                    keys: result,
                    trans
                  }).then(function(res) {
                    if (res.numFailures > 0)
                      return Promise.reject(res.failures[0]);
                    if (result.length < limit) {
                      return {
                        failures: [],
                        numFailures: 0,
                        lastResult: void 0
                      };
                    } else {
                      return deleteNextChunk(trans, __assign(__assign({}, range), { lower: result[result.length - 1], lowerOpen: true }), limit);
                    }
                  });
                });
              }
            } });
            return tableMiddleware;
          } });
        }
      };
      function getExistingValues(table, req, effectiveKeys) {
        return req.type === "add" ? Promise.resolve([]) : table.getMany({
          trans: req.trans,
          keys: effectiveKeys,
          cache: "immutable"
        });
      }
      function getFromTransactionCache(keys2, cache2, clone) {
        try {
          if (!cache2)
            return null;
          if (cache2.keys.length < keys2.length)
            return null;
          var result = [];
          for (var i = 0, j = 0; i < cache2.keys.length && j < keys2.length; ++i) {
            if (cmp2(cache2.keys[i], keys2[j]) !== 0)
              continue;
            result.push(clone ? deepClone(cache2.values[i]) : cache2.values[i]);
            ++j;
          }
          return result.length === keys2.length ? result : null;
        } catch (_a2) {
          return null;
        }
      }
      var cacheExistingValuesMiddleware = {
        stack: "dbcore",
        level: -1,
        create: function(core) {
          return {
            table: function(tableName) {
              var table = core.table(tableName);
              return __assign(__assign({}, table), { getMany: function(req) {
                if (!req.cache) {
                  return table.getMany(req);
                }
                var cachedResult = getFromTransactionCache(req.keys, req.trans["_cache"], req.cache === "clone");
                if (cachedResult) {
                  return DexiePromise.resolve(cachedResult);
                }
                return table.getMany(req).then(function(res) {
                  req.trans["_cache"] = {
                    keys: req.keys,
                    values: req.cache === "clone" ? deepClone(res) : res
                  };
                  return res;
                });
              }, mutate: function(req) {
                if (req.type !== "add")
                  req.trans["_cache"] = null;
                return table.mutate(req);
              } });
            }
          };
        }
      };
      function isCachableContext(ctx, table) {
        return ctx.trans.mode === "readonly" && !!ctx.subscr && !ctx.trans.explicit && ctx.trans.db._options.cache !== "disabled" && !table.schema.primaryKey.outbound;
      }
      function isCachableRequest(type2, req) {
        switch (type2) {
          case "query":
            return req.values && !req.unique;
          case "get":
            return false;
          case "getMany":
            return false;
          case "count":
            return false;
          case "openCursor":
            return false;
        }
      }
      var observabilityMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Observability",
        create: function(core) {
          var dbName = core.schema.name;
          var FULL_RANGE = new RangeSet2(core.MIN_KEY, core.MAX_KEY);
          return __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            if (PSD.subscr && mode !== "readonly") {
              throw new exceptions.ReadOnly("Readwrite transaction in liveQuery context. Querier source: ".concat(PSD.querier));
            }
            return core.transaction(stores, mode, options);
          }, table: function(tableName) {
            var table = core.table(tableName);
            var schema = table.schema;
            var primaryKey = schema.primaryKey, indexes = schema.indexes;
            var extractKey = primaryKey.extractKey, outbound = primaryKey.outbound;
            var indexesWithAutoIncPK = primaryKey.autoIncrement && indexes.filter(function(index) {
              return index.compound && index.keyPath.includes(primaryKey.keyPath);
            });
            var tableClone = __assign(__assign({}, table), { mutate: function(req) {
              var _a2, _b;
              var trans = req.trans;
              var mutatedParts = req.mutatedParts || (req.mutatedParts = {});
              var getRangeSet = function(indexName) {
                var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                return mutatedParts[part] || (mutatedParts[part] = new RangeSet2());
              };
              var pkRangeSet = getRangeSet("");
              var delsRangeSet = getRangeSet(":dels");
              var type2 = req.type;
              var _c = req.type === "deleteRange" ? [req.range] : req.type === "delete" ? [req.keys] : req.values.length < 50 ? [
                getEffectiveKeys(primaryKey, req).filter(function(id) {
                  return id;
                }),
                req.values
              ] : [], keys2 = _c[0], newObjs = _c[1];
              var oldCache = req.trans["_cache"];
              if (isArray2(keys2)) {
                pkRangeSet.addKeys(keys2);
                var oldObjs = type2 === "delete" || keys2.length === newObjs.length ? getFromTransactionCache(keys2, oldCache) : null;
                if (!oldObjs) {
                  delsRangeSet.addKeys(keys2);
                }
                if (oldObjs || newObjs) {
                  trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs);
                }
              } else if (keys2) {
                var range = {
                  from: (_a2 = keys2.lower) !== null && _a2 !== void 0 ? _a2 : core.MIN_KEY,
                  to: (_b = keys2.upper) !== null && _b !== void 0 ? _b : core.MAX_KEY
                };
                delsRangeSet.add(range);
                pkRangeSet.add(range);
              } else {
                pkRangeSet.add(FULL_RANGE);
                delsRangeSet.add(FULL_RANGE);
                schema.indexes.forEach(function(idx) {
                  return getRangeSet(idx.name).add(FULL_RANGE);
                });
              }
              return table.mutate(req).then(function(res) {
                if (keys2 && (req.type === "add" || req.type === "put")) {
                  pkRangeSet.addKeys(res.results);
                  if (indexesWithAutoIncPK) {
                    indexesWithAutoIncPK.forEach(function(idx) {
                      var idxVals = req.values.map(function(v) {
                        return idx.extractKey(v);
                      });
                      var pkPos = idx.keyPath.findIndex(function(prop) {
                        return prop === primaryKey.keyPath;
                      });
                      for (var i = 0, len = res.results.length; i < len; ++i) {
                        idxVals[i][pkPos] = res.results[i];
                      }
                      getRangeSet(idx.name).addKeys(idxVals);
                    });
                  }
                }
                trans.mutatedParts = extendObservabilitySet(trans.mutatedParts || {}, mutatedParts);
                return res;
              });
            } });
            var getRange = function(_a2) {
              var _b, _c;
              var _d = _a2.query, index = _d.index, range = _d.range;
              return [
                index,
                new RangeSet2((_b = range.lower) !== null && _b !== void 0 ? _b : core.MIN_KEY, (_c = range.upper) !== null && _c !== void 0 ? _c : core.MAX_KEY)
              ];
            };
            var readSubscribers = {
              get: function(req) {
                return [primaryKey, new RangeSet2(req.key)];
              },
              getMany: function(req) {
                return [primaryKey, new RangeSet2().addKeys(req.keys)];
              },
              count: getRange,
              query: getRange,
              openCursor: getRange
            };
            keys(readSubscribers).forEach(function(method) {
              tableClone[method] = function(req) {
                var subscr = PSD.subscr;
                var isLiveQuery = !!subscr;
                var cachable = isCachableContext(PSD, table) && isCachableRequest(method, req);
                var obsSet = cachable ? req.obsSet = {} : subscr;
                if (isLiveQuery) {
                  var getRangeSet = function(indexName) {
                    var part = "idb://".concat(dbName, "/").concat(tableName, "/").concat(indexName);
                    return obsSet[part] || (obsSet[part] = new RangeSet2());
                  };
                  var pkRangeSet_1 = getRangeSet("");
                  var delsRangeSet_1 = getRangeSet(":dels");
                  var _a2 = readSubscribers[method](req), queriedIndex = _a2[0], queriedRanges = _a2[1];
                  if (method === "query" && queriedIndex.isPrimaryKey && !req.values) {
                    delsRangeSet_1.add(queriedRanges);
                  } else {
                    getRangeSet(queriedIndex.name || "").add(queriedRanges);
                  }
                  if (!queriedIndex.isPrimaryKey) {
                    if (method === "count") {
                      delsRangeSet_1.add(FULL_RANGE);
                    } else {
                      var keysPromise_1 = method === "query" && outbound && req.values && table.query(__assign(__assign({}, req), { values: false }));
                      return table[method].apply(this, arguments).then(function(res) {
                        if (method === "query") {
                          if (outbound && req.values) {
                            return keysPromise_1.then(function(_a3) {
                              var resultingKeys = _a3.result;
                              pkRangeSet_1.addKeys(resultingKeys);
                              return res;
                            });
                          }
                          var pKeys = req.values ? res.result.map(extractKey) : res.result;
                          if (req.values) {
                            pkRangeSet_1.addKeys(pKeys);
                          } else {
                            delsRangeSet_1.addKeys(pKeys);
                          }
                        } else if (method === "openCursor") {
                          var cursor_1 = res;
                          var wantValues_1 = req.values;
                          return cursor_1 && Object.create(cursor_1, {
                            key: {
                              get: function() {
                                delsRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.key;
                              }
                            },
                            primaryKey: {
                              get: function() {
                                var pkey = cursor_1.primaryKey;
                                delsRangeSet_1.addKey(pkey);
                                return pkey;
                              }
                            },
                            value: {
                              get: function() {
                                wantValues_1 && pkRangeSet_1.addKey(cursor_1.primaryKey);
                                return cursor_1.value;
                              }
                            }
                          });
                        }
                        return res;
                      });
                    }
                  }
                }
                return table[method].apply(this, arguments);
              };
            });
            return tableClone;
          } });
        }
      };
      function trackAffectedIndexes(getRangeSet, schema, oldObjs, newObjs) {
        function addAffectedIndex(ix) {
          var rangeSet = getRangeSet(ix.name || "");
          function extractKey(obj) {
            return obj != null ? ix.extractKey(obj) : null;
          }
          var addKeyOrKeys = function(key) {
            return ix.multiEntry && isArray2(key) ? key.forEach(function(key2) {
              return rangeSet.addKey(key2);
            }) : rangeSet.addKey(key);
          };
          (oldObjs || newObjs).forEach(function(_, i) {
            var oldKey = oldObjs && extractKey(oldObjs[i]);
            var newKey = newObjs && extractKey(newObjs[i]);
            if (cmp2(oldKey, newKey) !== 0) {
              if (oldKey != null)
                addKeyOrKeys(oldKey);
              if (newKey != null)
                addKeyOrKeys(newKey);
            }
          });
        }
        schema.indexes.forEach(addAffectedIndex);
      }
      function adjustOptimisticFromFailures(tblCache, req, res) {
        if (res.numFailures === 0)
          return req;
        if (req.type === "deleteRange") {
          return null;
        }
        var numBulkOps = req.keys ? req.keys.length : "values" in req && req.values ? req.values.length : 1;
        if (res.numFailures === numBulkOps) {
          return null;
        }
        var clone = __assign({}, req);
        if (isArray2(clone.keys)) {
          clone.keys = clone.keys.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        if ("values" in clone && isArray2(clone.values)) {
          clone.values = clone.values.filter(function(_, i) {
            return !(i in res.failures);
          });
        }
        return clone;
      }
      function isAboveLower(key, range) {
        return range.lower === void 0 ? true : range.lowerOpen ? cmp2(key, range.lower) > 0 : cmp2(key, range.lower) >= 0;
      }
      function isBelowUpper(key, range) {
        return range.upper === void 0 ? true : range.upperOpen ? cmp2(key, range.upper) < 0 : cmp2(key, range.upper) <= 0;
      }
      function isWithinRange(key, range) {
        return isAboveLower(key, range) && isBelowUpper(key, range);
      }
      function applyOptimisticOps(result, req, ops, table, cacheEntry, immutable) {
        if (!ops || ops.length === 0)
          return result;
        var index = req.query.index;
        var multiEntry = index.multiEntry;
        var queryRange = req.query.range;
        var primaryKey = table.schema.primaryKey;
        var extractPrimKey = primaryKey.extractKey;
        var extractIndex = index.extractKey;
        var extractLowLevelIndex = (index.lowLevelIndex || index).extractKey;
        var finalResult = ops.reduce(function(result2, op) {
          var modifedResult = result2;
          var includedValues = [];
          if (op.type === "add" || op.type === "put") {
            var includedPKs = new RangeSet2();
            for (var i = op.values.length - 1; i >= 0; --i) {
              var value = op.values[i];
              var pk = extractPrimKey(value);
              if (includedPKs.hasKey(pk))
                continue;
              var key = extractIndex(value);
              if (multiEntry && isArray2(key) ? key.some(function(k) {
                return isWithinRange(k, queryRange);
              }) : isWithinRange(key, queryRange)) {
                includedPKs.addKey(pk);
                includedValues.push(value);
              }
            }
          }
          switch (op.type) {
            case "add": {
              var existingKeys_1 = new RangeSet2().addKeys(req.values ? result2.map(function(v) {
                return extractPrimKey(v);
              }) : result2);
              modifedResult = result2.concat(req.values ? includedValues.filter(function(v) {
                var key2 = extractPrimKey(v);
                if (existingKeys_1.hasKey(key2))
                  return false;
                existingKeys_1.addKey(key2);
                return true;
              }) : includedValues.map(function(v) {
                return extractPrimKey(v);
              }).filter(function(k) {
                if (existingKeys_1.hasKey(k))
                  return false;
                existingKeys_1.addKey(k);
                return true;
              }));
              break;
            }
            case "put": {
              var keySet_1 = new RangeSet2().addKeys(op.values.map(function(v) {
                return extractPrimKey(v);
              }));
              modifedResult = result2.filter(
                function(item) {
                  return !keySet_1.hasKey(req.values ? extractPrimKey(item) : item);
                }
              ).concat(
                req.values ? includedValues : includedValues.map(function(v) {
                  return extractPrimKey(v);
                })
              );
              break;
            }
            case "delete":
              var keysToDelete_1 = new RangeSet2().addKeys(op.keys);
              modifedResult = result2.filter(function(item) {
                return !keysToDelete_1.hasKey(req.values ? extractPrimKey(item) : item);
              });
              break;
            case "deleteRange":
              var range_1 = op.range;
              modifedResult = result2.filter(function(item) {
                return !isWithinRange(extractPrimKey(item), range_1);
              });
              break;
          }
          return modifedResult;
        }, result);
        if (finalResult === result)
          return result;
        var sorter = function(a, b) {
          return cmp2(extractLowLevelIndex(a), extractLowLevelIndex(b)) || cmp2(extractPrimKey(a), extractPrimKey(b));
        };
        finalResult.sort(req.direction === "prev" || req.direction === "prevunique" ? function(a, b) {
          return sorter(b, a);
        } : sorter);
        if (req.limit && req.limit < Infinity) {
          if (finalResult.length > req.limit) {
            finalResult.length = req.limit;
          } else if (result.length === req.limit && finalResult.length < req.limit) {
            cacheEntry.dirty = true;
          }
        }
        return immutable ? Object.freeze(finalResult) : finalResult;
      }
      function areRangesEqual(r1, r2) {
        return cmp2(r1.lower, r2.lower) === 0 && cmp2(r1.upper, r2.upper) === 0 && !!r1.lowerOpen === !!r2.lowerOpen && !!r1.upperOpen === !!r2.upperOpen;
      }
      function compareLowers(lower1, lower2, lowerOpen1, lowerOpen2) {
        if (lower1 === void 0)
          return lower2 !== void 0 ? -1 : 0;
        if (lower2 === void 0)
          return 1;
        var c = cmp2(lower1, lower2);
        if (c === 0) {
          if (lowerOpen1 && lowerOpen2)
            return 0;
          if (lowerOpen1)
            return 1;
          if (lowerOpen2)
            return -1;
        }
        return c;
      }
      function compareUppers(upper1, upper2, upperOpen1, upperOpen2) {
        if (upper1 === void 0)
          return upper2 !== void 0 ? 1 : 0;
        if (upper2 === void 0)
          return -1;
        var c = cmp2(upper1, upper2);
        if (c === 0) {
          if (upperOpen1 && upperOpen2)
            return 0;
          if (upperOpen1)
            return -1;
          if (upperOpen2)
            return 1;
        }
        return c;
      }
      function isSuperRange(r1, r2) {
        return compareLowers(r1.lower, r2.lower, r1.lowerOpen, r2.lowerOpen) <= 0 && compareUppers(r1.upper, r2.upper, r1.upperOpen, r2.upperOpen) >= 0;
      }
      function findCompatibleQuery(dbName, tableName, type2, req) {
        var _a2;
        var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
        if (!tblCache)
          return [];
        var queries = tblCache.queries[type2];
        if (!queries)
          return [null, false, tblCache, null];
        var indexName = req.query ? req.query.index.name : null;
        var entries = queries[indexName || ""];
        if (!entries)
          return [null, false, tblCache, null];
        switch (type2) {
          case "query":
            var reqDirection_1 = (_a2 = req.direction) !== null && _a2 !== void 0 ? _a2 : "next";
            var equalEntry = entries.find(function(entry) {
              var _a3;
              return entry.req.limit === req.limit && entry.req.values === req.values && ((_a3 = entry.req.direction) !== null && _a3 !== void 0 ? _a3 : "next") === reqDirection_1 && areRangesEqual(entry.req.query.range, req.query.range);
            });
            if (equalEntry)
              return [
                equalEntry,
                true,
                tblCache,
                entries
              ];
            var superEntry = entries.find(function(entry) {
              var _a3;
              var limit = "limit" in entry.req ? entry.req.limit : Infinity;
              return limit >= req.limit && ((_a3 = entry.req.direction) !== null && _a3 !== void 0 ? _a3 : "next") === reqDirection_1 && (req.values ? entry.req.values : true) && isSuperRange(entry.req.query.range, req.query.range);
            });
            return [superEntry, false, tblCache, entries];
          case "count":
            var countQuery = entries.find(function(entry) {
              return areRangesEqual(entry.req.query.range, req.query.range);
            });
            return [countQuery, !!countQuery, tblCache, entries];
        }
      }
      function subscribeToCacheEntry(cacheEntry, container, requery, signal) {
        cacheEntry.subscribers.add(requery);
        signal.addEventListener("abort", function() {
          cacheEntry.subscribers.delete(requery);
          if (cacheEntry.subscribers.size === 0) {
            enqueForDeletion(cacheEntry, container);
          }
        });
      }
      function enqueForDeletion(cacheEntry, container) {
        setTimeout(function() {
          if (cacheEntry.subscribers.size === 0) {
            delArrayItem(container, cacheEntry);
          }
        }, 3e3);
      }
      var cacheMiddleware = {
        stack: "dbcore",
        level: 0,
        name: "Cache",
        create: function(core) {
          var dbName = core.schema.name;
          var coreMW = __assign(__assign({}, core), { transaction: function(stores, mode, options) {
            var idbtrans = core.transaction(stores, mode, options);
            if (mode === "readwrite") {
              var ac_1 = new AbortController();
              var signal = ac_1.signal;
              var endTransaction = function(wasCommitted) {
                return function() {
                  ac_1.abort();
                  if (mode === "readwrite") {
                    var affectedSubscribers_1 = /* @__PURE__ */ new Set();
                    for (var _i = 0, stores_1 = stores; _i < stores_1.length; _i++) {
                      var storeName = stores_1[_i];
                      var tblCache = cache["idb://".concat(dbName, "/").concat(storeName)];
                      if (tblCache) {
                        var table = core.table(storeName);
                        var ops = tblCache.optimisticOps.filter(function(op) {
                          return op.trans === idbtrans;
                        });
                        if (idbtrans._explicit && wasCommitted && idbtrans.mutatedParts) {
                          for (var _a2 = 0, _b = Object.values(tblCache.queries.query); _a2 < _b.length; _a2++) {
                            var entries = _b[_a2];
                            for (var _c = 0, _d = entries.slice(); _c < _d.length; _c++) {
                              var entry = _d[_c];
                              if (obsSetsOverlap(entry.obsSet, idbtrans.mutatedParts)) {
                                delArrayItem(entries, entry);
                                entry.subscribers.forEach(function(requery) {
                                  return affectedSubscribers_1.add(requery);
                                });
                              }
                            }
                          }
                        } else if (ops.length > 0) {
                          tblCache.optimisticOps = tblCache.optimisticOps.filter(function(op) {
                            return op.trans !== idbtrans;
                          });
                          for (var _e = 0, _f = Object.values(tblCache.queries.query); _e < _f.length; _e++) {
                            var entries = _f[_e];
                            for (var _g = 0, _h = entries.slice(); _g < _h.length; _g++) {
                              var entry = _h[_g];
                              if (entry.res != null && idbtrans.mutatedParts) {
                                if (wasCommitted && !entry.dirty) {
                                  var freezeResults = Object.isFrozen(entry.res);
                                  var modRes = applyOptimisticOps(entry.res, entry.req, ops, table, entry, freezeResults);
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                    entry.subscribers.forEach(function(requery) {
                                      return affectedSubscribers_1.add(requery);
                                    });
                                  } else if (modRes !== entry.res) {
                                    entry.res = modRes;
                                    entry.promise = DexiePromise.resolve({
                                      result: modRes
                                    });
                                  }
                                } else {
                                  if (entry.dirty) {
                                    delArrayItem(entries, entry);
                                  }
                                  entry.subscribers.forEach(function(requery) {
                                    return affectedSubscribers_1.add(requery);
                                  });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    affectedSubscribers_1.forEach(function(requery) {
                      return requery();
                    });
                  }
                };
              };
              idbtrans.addEventListener("abort", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("error", endTransaction(false), {
                signal
              });
              idbtrans.addEventListener("complete", endTransaction(true), {
                signal
              });
            }
            return idbtrans;
          }, table: function(tableName) {
            var downTable = core.table(tableName);
            var primKey = downTable.schema.primaryKey;
            var tableMW = __assign(__assign({}, downTable), { mutate: function(req) {
              var trans = PSD.trans;
              if (primKey.outbound || trans.db._options.cache === "disabled" || trans.explicit || trans.idbtrans.mode !== "readwrite") {
                return downTable.mutate(req);
              }
              var tblCache = cache["idb://".concat(dbName, "/").concat(tableName)];
              if (!tblCache)
                return downTable.mutate(req);
              var promise = downTable.mutate(req);
              if ((req.type === "add" || req.type === "put") && (req.values.length >= 50 || getEffectiveKeys(primKey, req).some(function(key) {
                return key == null;
              }))) {
                promise.then(function(res) {
                  var reqWithResolvedKeys = __assign(__assign({}, req), { values: req.values.map(function(value, i) {
                    var _a2;
                    if (res.failures[i])
                      return value;
                    var valueWithKey = ((_a2 = primKey.keyPath) === null || _a2 === void 0 ? void 0 : _a2.includes(".")) ? deepClone(value) : __assign({}, value);
                    setByKeyPath(valueWithKey, primKey.keyPath, res.results[i]);
                    return valueWithKey;
                  }) });
                  var adjustedReq = adjustOptimisticFromFailures(tblCache, reqWithResolvedKeys, res);
                  tblCache.optimisticOps.push(adjustedReq);
                  queueMicrotask(function() {
                    return req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  });
                });
              } else {
                tblCache.optimisticOps.push(req);
                req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                promise.then(function(res) {
                  if (res.numFailures > 0) {
                    delArrayItem(tblCache.optimisticOps, req);
                    var adjustedReq = adjustOptimisticFromFailures(tblCache, req, res);
                    if (adjustedReq) {
                      tblCache.optimisticOps.push(adjustedReq);
                    }
                    req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                  }
                });
                promise.catch(function() {
                  delArrayItem(tblCache.optimisticOps, req);
                  req.mutatedParts && signalSubscribersLazily(req.mutatedParts);
                });
              }
              return promise;
            }, query: function(req) {
              var _a2;
              if (!isCachableContext(PSD, downTable) || !isCachableRequest("query", req))
                return downTable.query(req);
              var freezeResults = ((_a2 = PSD.trans) === null || _a2 === void 0 ? void 0 : _a2.db._options.cache) === "immutable";
              var _b = PSD, requery = _b.requery, signal = _b.signal;
              var _c = findCompatibleQuery(dbName, tableName, "query", req), cacheEntry = _c[0], exactMatch = _c[1], tblCache = _c[2], container = _c[3];
              if (cacheEntry && exactMatch) {
                cacheEntry.obsSet = req.obsSet;
              } else {
                var promise = downTable.query(req).then(function(res) {
                  var result = res.result;
                  if (cacheEntry)
                    cacheEntry.res = result;
                  if (freezeResults) {
                    for (var i = 0, l = result.length; i < l; ++i) {
                      Object.freeze(result[i]);
                    }
                    Object.freeze(result);
                  } else {
                    res.result = deepClone(result);
                  }
                  return res;
                }).catch(function(error) {
                  if (container && cacheEntry)
                    delArrayItem(container, cacheEntry);
                  return Promise.reject(error);
                });
                cacheEntry = {
                  obsSet: req.obsSet,
                  promise,
                  subscribers: /* @__PURE__ */ new Set(),
                  type: "query",
                  req,
                  dirty: false
                };
                if (container) {
                  container.push(cacheEntry);
                } else {
                  container = [cacheEntry];
                  if (!tblCache) {
                    tblCache = cache["idb://".concat(dbName, "/").concat(tableName)] = {
                      queries: {
                        query: {},
                        count: {}
                      },
                      objs: /* @__PURE__ */ new Map(),
                      optimisticOps: [],
                      unsignaledParts: {}
                    };
                  }
                  tblCache.queries.query[req.query.index.name || ""] = container;
                }
              }
              subscribeToCacheEntry(cacheEntry, container, requery, signal);
              return cacheEntry.promise.then(function(res) {
                return {
                  result: applyOptimisticOps(res.result, req, tblCache === null || tblCache === void 0 ? void 0 : tblCache.optimisticOps, downTable, cacheEntry, freezeResults)
                };
              });
            } });
            return tableMW;
          } });
          return coreMW;
        }
      };
      function vipify(target, vipDb) {
        return new Proxy(target, {
          get: function(target2, prop, receiver) {
            if (prop === "db")
              return vipDb;
            return Reflect.get(target2, prop, receiver);
          }
        });
      }
      var Dexie$1 = (function() {
        function Dexie3(name, options) {
          var _this = this;
          this._middlewares = {};
          this.verno = 0;
          var deps = Dexie3.dependencies;
          this._options = options = __assign({
            addons: Dexie3.addons,
            autoOpen: true,
            indexedDB: deps.indexedDB,
            IDBKeyRange: deps.IDBKeyRange,
            cache: "cloned",
            maxConnections: DEFAULT_MAX_CONNECTIONS
          }, options);
          this._deps = {
            indexedDB: options.indexedDB,
            IDBKeyRange: options.IDBKeyRange
          };
          var addons = options.addons;
          this._dbSchema = {};
          this._versions = [];
          this._storeNames = [];
          this._allTables = {};
          this.idbdb = null;
          this._novip = this;
          var state = {
            dbOpenError: null,
            isBeingOpened: false,
            onReadyBeingFired: null,
            openComplete: false,
            dbReadyResolve: nop,
            dbReadyPromise: null,
            cancelOpen: nop,
            openCanceller: null,
            autoSchema: true,
            PR1398_maxLoop: 3,
            autoOpen: options.autoOpen
          };
          state.dbReadyPromise = new DexiePromise(function(resolve) {
            state.dbReadyResolve = resolve;
          });
          state.openCanceller = new DexiePromise(function(_, reject) {
            state.cancelOpen = reject;
          });
          this._state = state;
          this.name = name;
          this.on = Events(this, "populate", "blocked", "versionchange", "close", {
            ready: [promisableChain, nop]
          });
          this.once = function(event, callback) {
            var fn = function() {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              _this.on(event).unsubscribe(fn);
              callback.apply(_this, args);
            };
            return _this.on(event, fn);
          };
          this.on.ready.subscribe = override(this.on.ready.subscribe, function(subscribe) {
            return function(subscriber, bSticky) {
              Dexie3.vip(function() {
                var state2 = _this._state;
                if (state2.openComplete) {
                  if (!state2.dbOpenError)
                    DexiePromise.resolve().then(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else if (state2.onReadyBeingFired) {
                  state2.onReadyBeingFired.push(subscriber);
                  if (bSticky)
                    subscribe(subscriber);
                } else {
                  subscribe(subscriber);
                  var db_1 = _this;
                  if (!bSticky)
                    subscribe(function unsubscribe() {
                      db_1.on.ready.unsubscribe(subscriber);
                      db_1.on.ready.unsubscribe(unsubscribe);
                    });
                }
              });
            };
          });
          this.Collection = createCollectionConstructor(this);
          this.Table = createTableConstructor(this);
          this.Transaction = createTransactionConstructor(this);
          this.Version = createVersionConstructor(this);
          this.WhereClause = createWhereClauseConstructor(this);
          this.on("versionchange", function(ev) {
            if (ev.newVersion > 0)
              console.warn("Another connection wants to upgrade database '".concat(_this.name, "'. Closing db now to resume the upgrade."));
            else
              console.warn("Another connection wants to delete database '".concat(_this.name, "'. Closing db now to resume the delete request."));
            _this.close({ disableAutoOpen: false });
          });
          this.on("blocked", function(ev) {
            if (!ev.newVersion || ev.newVersion < ev.oldVersion)
              console.warn("Dexie.delete('".concat(_this.name, "') was blocked"));
            else
              console.warn("Upgrade '".concat(_this.name, "' blocked by other connection holding version ").concat(ev.oldVersion / 10));
          });
          this._maxKey = getMaxKey(options.IDBKeyRange);
          this._createTransaction = function(mode, storeNames, dbschema, parentTransaction) {
            return new _this.Transaction(mode, storeNames, dbschema, _this._options.chromeTransactionDurability, parentTransaction);
          };
          this._fireOnBlocked = function(ev) {
            _this.on("blocked").fire(ev);
            connections.toArray().filter(function(c) {
              return c.name === _this.name && c !== _this && !c._state.vcFired;
            }).map(function(c) {
              return c.on("versionchange").fire(ev);
            });
          };
          this.use(cacheExistingValuesMiddleware);
          this.use(cacheMiddleware);
          this.use(observabilityMiddleware);
          this.use(virtualIndexMiddleware);
          this.use(hooksMiddleware);
          var vipDB = new Proxy(this, {
            get: function(_, prop, receiver) {
              if (prop === "_vip")
                return true;
              if (prop === "table")
                return function(tableName) {
                  return vipify(_this.table(tableName), vipDB);
                };
              var rv = Reflect.get(_, prop, receiver);
              if (rv instanceof Table)
                return vipify(rv, vipDB);
              if (prop === "tables")
                return rv.map(function(t) {
                  return vipify(t, vipDB);
                });
              if (prop === "_createTransaction")
                return function() {
                  var tx = rv.apply(this, arguments);
                  return vipify(tx, vipDB);
                };
              return rv;
            }
          });
          this.vip = vipDB;
          addons.forEach(function(addon) {
            return addon(_this);
          });
        }
        Dexie3.prototype.version = function(versionNumber) {
          if (isNaN(versionNumber) || versionNumber < 0.1)
            throw new exceptions.Type("Given version is not a positive number");
          versionNumber = Math.round(versionNumber * 10) / 10;
          if (this.idbdb || this._state.isBeingOpened)
            throw new exceptions.Schema("Cannot add version when database is open");
          this.verno = Math.max(this.verno, versionNumber);
          var versions = this._versions;
          var versionInstance = versions.filter(function(v) {
            return v._cfg.version === versionNumber;
          })[0];
          if (versionInstance)
            return versionInstance;
          versionInstance = new this.Version(versionNumber);
          versions.push(versionInstance);
          versions.sort(lowerVersionFirst);
          versionInstance.stores({});
          this._state.autoSchema = false;
          return versionInstance;
        };
        Dexie3.prototype._whenReady = function(fn) {
          var _this = this;
          return this.idbdb && (this._state.openComplete || PSD.letThrough || this._vip) ? fn() : new DexiePromise(function(resolve, reject) {
            if (_this._state.openComplete) {
              return reject(new exceptions.DatabaseClosed(_this._state.dbOpenError));
            }
            if (!_this._state.isBeingOpened) {
              if (!_this._state.autoOpen) {
                reject(new exceptions.DatabaseClosed());
                return;
              }
              _this.open().catch(nop);
            }
            _this._state.dbReadyPromise.then(resolve, reject);
          }).then(fn);
        };
        Dexie3.prototype.use = function(_a2) {
          var stack = _a2.stack, create2 = _a2.create, level = _a2.level, name = _a2.name;
          if (name)
            this.unuse({ stack, name });
          var middlewares = this._middlewares[stack] || (this._middlewares[stack] = []);
          middlewares.push({
            stack,
            create: create2,
            level: level == null ? 10 : level,
            name
          });
          middlewares.sort(function(a, b) {
            return a.level - b.level;
          });
          return this;
        };
        Dexie3.prototype.unuse = function(_a2) {
          var stack = _a2.stack, name = _a2.name, create2 = _a2.create;
          if (stack && this._middlewares[stack]) {
            this._middlewares[stack] = this._middlewares[stack].filter(function(mw) {
              return create2 ? mw.create !== create2 : name ? mw.name !== name : false;
            });
          }
          return this;
        };
        Dexie3.prototype.open = function() {
          var _this = this;
          return usePSD(
            globalPSD,
            function() {
              return dexieOpen(_this);
            }
          );
        };
        Dexie3.prototype._close = function() {
          this.on.close.fire(new CustomEvent("close"));
          var state = this._state;
          connections.remove(this);
          if (this.idbdb) {
            try {
              this.idbdb.close();
            } catch (e) {
            }
            this.idbdb = null;
          }
          if (!state.isBeingOpened) {
            state.dbReadyPromise = new DexiePromise(function(resolve) {
              state.dbReadyResolve = resolve;
            });
            state.openCanceller = new DexiePromise(function(_, reject) {
              state.cancelOpen = reject;
            });
          }
        };
        Dexie3.prototype.close = function(_a2) {
          var _b = _a2 === void 0 ? { disableAutoOpen: true } : _a2, disableAutoOpen = _b.disableAutoOpen;
          var state = this._state;
          if (disableAutoOpen) {
            if (state.isBeingOpened) {
              state.cancelOpen(new exceptions.DatabaseClosed());
            }
            this._close();
            state.autoOpen = false;
            state.dbOpenError = new exceptions.DatabaseClosed();
          } else {
            this._close();
            state.autoOpen = this._options.autoOpen || state.isBeingOpened;
            state.openComplete = false;
            state.dbOpenError = null;
          }
        };
        Dexie3.prototype.delete = function(closeOptions) {
          var _this = this;
          if (closeOptions === void 0) {
            closeOptions = { disableAutoOpen: true };
          }
          var hasInvalidArguments = arguments.length > 0 && typeof arguments[0] !== "object";
          var state = this._state;
          return new DexiePromise(function(resolve, reject) {
            var doDelete = function() {
              _this.close(closeOptions);
              var req = _this._deps.indexedDB.deleteDatabase(_this.name);
              req.onsuccess = wrap(function() {
                _onDatabaseDeleted(_this._deps, _this.name);
                resolve();
              });
              req.onerror = eventRejectHandler(reject);
              req.onblocked = _this._fireOnBlocked;
            };
            if (hasInvalidArguments)
              throw new exceptions.InvalidArgument("Invalid closeOptions argument to db.delete()");
            if (state.isBeingOpened) {
              state.dbReadyPromise.then(doDelete);
            } else {
              doDelete();
            }
          });
        };
        Dexie3.prototype.backendDB = function() {
          return this.idbdb;
        };
        Dexie3.prototype.isOpen = function() {
          return this.idbdb !== null;
        };
        Dexie3.prototype.hasBeenClosed = function() {
          var dbOpenError = this._state.dbOpenError;
          return dbOpenError && dbOpenError.name === "DatabaseClosed";
        };
        Dexie3.prototype.hasFailed = function() {
          return this._state.dbOpenError !== null;
        };
        Dexie3.prototype.dynamicallyOpened = function() {
          return this._state.autoSchema;
        };
        Object.defineProperty(Dexie3.prototype, "tables", {
          get: function() {
            var _this = this;
            return keys(this._allTables).map(function(name) {
              return _this._allTables[name];
            });
          },
          enumerable: false,
          configurable: true
        });
        Dexie3.prototype.transaction = function() {
          var args = extractTransactionArgs.apply(this, arguments);
          return this._transaction.apply(this, args);
        };
        Dexie3.prototype._transaction = function(mode, tables, scopeFunc) {
          var _this = this;
          var parentTransaction = PSD.trans;
          if (!parentTransaction || parentTransaction.db !== this || mode.indexOf("!") !== -1)
            parentTransaction = null;
          var onlyIfCompatible = mode.indexOf("?") !== -1;
          mode = mode.replace("!", "").replace("?", "");
          var idbMode, storeNames;
          try {
            storeNames = tables.map(function(table) {
              var storeName = table instanceof _this.Table ? table.name : table;
              if (typeof storeName !== "string")
                throw new TypeError("Invalid table argument to Dexie.transaction(). Only Table or String are allowed");
              return storeName;
            });
            if (mode == "r" || mode === READONLY)
              idbMode = READONLY;
            else if (mode == "rw" || mode == READWRITE)
              idbMode = READWRITE;
            else
              throw new exceptions.InvalidArgument("Invalid transaction mode: " + mode);
            if (parentTransaction) {
              if (parentTransaction.mode === READONLY && idbMode === READWRITE) {
                if (onlyIfCompatible) {
                  parentTransaction = null;
                } else
                  throw new exceptions.SubTransaction("Cannot enter a sub-transaction with READWRITE mode when parent transaction is READONLY");
              }
              if (parentTransaction) {
                storeNames.forEach(function(storeName) {
                  if (parentTransaction && parentTransaction.storeNames.indexOf(storeName) === -1) {
                    if (onlyIfCompatible) {
                      parentTransaction = null;
                    } else
                      throw new exceptions.SubTransaction("Table " + storeName + " not included in parent transaction.");
                  }
                });
              }
              if (onlyIfCompatible && parentTransaction && !parentTransaction.active) {
                parentTransaction = null;
              }
            }
          } catch (e) {
            return parentTransaction ? parentTransaction._promise(null, function(_, reject) {
              reject(e);
            }) : rejection(e);
          }
          var enterTransaction = enterTransactionScope.bind(null, this, idbMode, storeNames, parentTransaction, scopeFunc);
          return parentTransaction ? parentTransaction._promise(idbMode, enterTransaction, "lock") : PSD.trans ? usePSD(PSD.transless, function() {
            return _this._whenReady(enterTransaction);
          }) : this._whenReady(enterTransaction);
        };
        Dexie3.prototype.table = function(tableName) {
          if (!hasOwn(this._allTables, tableName)) {
            throw new exceptions.InvalidTable("Table ".concat(tableName, " does not exist"));
          }
          return this._allTables[tableName];
        };
        return Dexie3;
      })();
      var symbolObservable = typeof Symbol !== "undefined" && "observable" in Symbol ? Symbol.observable : "@@observable";
      var Observable = (function() {
        function Observable2(subscribe) {
          this._subscribe = subscribe;
        }
        Observable2.prototype.subscribe = function(x, error, complete) {
          return this._subscribe(!x || typeof x === "function" ? { next: x, error, complete } : x);
        };
        Observable2.prototype[symbolObservable] = function() {
          return this;
        };
        return Observable2;
      })();
      var domDeps;
      try {
        domDeps = {
          indexedDB: _global2.indexedDB || _global2.mozIndexedDB || _global2.webkitIndexedDB || _global2.msIndexedDB,
          IDBKeyRange: _global2.IDBKeyRange || _global2.webkitIDBKeyRange
        };
      } catch (e) {
        domDeps = { indexedDB: null, IDBKeyRange: null };
      }
      function liveQuery2(querier) {
        var hasValue = false;
        var currentValue;
        var observable = new Observable(function(observer) {
          var scopeFuncIsAsync = isAsyncFunction(querier);
          function execute(ctx) {
            var wasRootExec = beginMicroTickScope();
            try {
              if (scopeFuncIsAsync) {
                incrementExpectedAwaits();
              }
              var rv = newScope(querier, ctx);
              if (scopeFuncIsAsync) {
                rv = rv.finally(decrementExpectedAwaits);
              }
              return rv;
            } finally {
              wasRootExec && endMicroTickScope();
            }
          }
          var closed = false;
          var abortController;
          var accumMuts = {};
          var currentObs = {};
          var subscription = {
            get closed() {
              return closed;
            },
            unsubscribe: function() {
              if (closed)
                return;
              closed = true;
              if (abortController)
                abortController.abort();
              if (startedListening)
                globalEvents.storagemutated.unsubscribe(mutationListener);
            }
          };
          observer.start && observer.start(subscription);
          var startedListening = false;
          var doQuery = function() {
            return execInGlobalContext(_doQuery);
          };
          function shouldNotify() {
            return obsSetsOverlap(currentObs, accumMuts);
          }
          var mutationListener = function(parts) {
            extendObservabilitySet(accumMuts, parts);
            if (shouldNotify()) {
              doQuery();
            }
          };
          var _doQuery = function() {
            if (closed || !domDeps.indexedDB) {
              return;
            }
            accumMuts = {};
            var subscr = {};
            if (abortController)
              abortController.abort();
            abortController = new AbortController();
            var ctx = {
              subscr,
              signal: abortController.signal,
              requery: doQuery,
              querier,
              trans: null
            };
            var ret = execute(ctx);
            if (!startedListening) {
              globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, mutationListener);
              startedListening = true;
            }
            Promise.resolve(ret).then(function(result) {
              hasValue = true;
              currentValue = result;
              if (closed || ctx.signal.aborted) {
                return;
              }
              if (shouldNotify()) {
                doQuery();
              } else {
                currentObs = subscr;
                if (shouldNotify()) {
                  doQuery();
                } else {
                  accumMuts = {};
                  execInGlobalContext(function() {
                    return !closed && observer.next && observer.next(result);
                  });
                }
              }
            }, function(err) {
              hasValue = false;
              if (!["DatabaseClosedError", "AbortError"].includes(err === null || err === void 0 ? void 0 : err.name)) {
                if (!closed)
                  execInGlobalContext(function() {
                    if (closed)
                      return;
                    observer.error && observer.error(err);
                  });
              }
            });
          };
          setTimeout(doQuery, 0);
          return subscription;
        });
        observable.hasValue = function() {
          return hasValue;
        };
        observable.getValue = function() {
          return currentValue;
        };
        return observable;
      }
      var Dexie2 = Dexie$1;
      props(Dexie2, __assign(__assign({}, fullNameExceptions), {
        delete: function(databaseName) {
          var db2 = new Dexie2(databaseName, { addons: [] });
          return db2.delete();
        },
        exists: function(name) {
          return new Dexie2(name, { addons: [] }).open().then(function(db2) {
            db2.close();
            return true;
          }).catch("NoSuchDatabaseError", function() {
            return false;
          });
        },
        getDatabaseNames: function(cb) {
          try {
            return getDatabaseNames(Dexie2.dependencies).then(cb);
          } catch (_a2) {
            return rejection(new exceptions.MissingAPI());
          }
        },
        defineClass: function() {
          function Class(content) {
            extend2(this, content);
          }
          return Class;
        },
        ignoreTransaction: function(scopeFunc) {
          return PSD.trans ? usePSD(PSD.transless || globalPSD, scopeFunc) : scopeFunc();
        },
        vip,
        async: function(generatorFn) {
          return function() {
            try {
              var rv = awaitIterator(generatorFn.apply(this, arguments));
              if (!rv || typeof rv.then !== "function")
                return DexiePromise.resolve(rv);
              return rv;
            } catch (e) {
              return rejection(e);
            }
          };
        },
        spawn: function(generatorFn, args, thiz) {
          try {
            var rv = awaitIterator(generatorFn.apply(thiz, args || []));
            if (!rv || typeof rv.then !== "function")
              return DexiePromise.resolve(rv);
            return rv;
          } catch (e) {
            return rejection(e);
          }
        },
        currentTransaction: {
          get: function() {
            return PSD.trans || null;
          }
        },
        waitFor: function(promiseOrFunction, optionalTimeout) {
          var promise = DexiePromise.resolve(typeof promiseOrFunction === "function" ? Dexie2.ignoreTransaction(promiseOrFunction) : promiseOrFunction).timeout(optionalTimeout || 6e4);
          return PSD.trans ? PSD.trans.waitFor(promise) : promise;
        },
        Promise: DexiePromise,
        debug: {
          get: function() {
            return debug;
          },
          set: function(value) {
            setDebug(value);
          }
        },
        derive,
        extend: extend2,
        props,
        override,
        Events,
        on: globalEvents,
        liveQuery: liveQuery2,
        extendObservabilitySet,
        getByKeyPath,
        setByKeyPath,
        delByKeyPath,
        shallowClone,
        deepClone,
        getObjectDiff,
        cmp: cmp2,
        asap: asap$1,
        minKey,
        addons: [],
        connections: {
          get: connections.toArray
        },
        errnames,
        dependencies: domDeps,
        cache,
        semVer: DEXIE_VERSION,
        version: DEXIE_VERSION.split(".").map(function(n) {
          return parseInt(n);
        }).reduce(function(p, c, i) {
          return p + c / Math.pow(10, i * 2);
        })
      }));
      Dexie2.maxKey = getMaxKey(Dexie2.dependencies.IDBKeyRange);
      if (typeof dispatchEvent !== "undefined" && typeof addEventListener !== "undefined") {
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(updatedParts) {
          if (!propagatingLocally) {
            var event_1;
            event_1 = new CustomEvent(STORAGE_MUTATED_DOM_EVENT_NAME, {
              detail: updatedParts
            });
            propagatingLocally = true;
            dispatchEvent(event_1);
            propagatingLocally = false;
          }
        });
        addEventListener(STORAGE_MUTATED_DOM_EVENT_NAME, function(_a2) {
          var detail = _a2.detail;
          if (!propagatingLocally) {
            propagateLocally(detail);
          }
        });
      }
      function propagateLocally(updateParts) {
        var wasMe = propagatingLocally;
        try {
          propagatingLocally = true;
          globalEvents.storagemutated.fire(updateParts);
          signalSubscribersNow(updateParts, true);
        } finally {
          propagatingLocally = wasMe;
        }
      }
      var propagatingLocally = false;
      var bc;
      var createBC = function() {
      };
      if (typeof BroadcastChannel !== "undefined") {
        createBC = function() {
          bc = new BroadcastChannel(STORAGE_MUTATED_DOM_EVENT_NAME);
          bc.onmessage = function(ev) {
            return ev.data && propagateLocally(ev.data);
          };
        };
        createBC();
        if (typeof bc.unref === "function") {
          bc.unref();
        }
        globalEvents(DEXIE_STORAGE_MUTATED_EVENT_NAME, function(changedParts) {
          if (!propagatingLocally) {
            bc.postMessage(changedParts);
          }
        });
      }
      if (typeof addEventListener !== "undefined") {
        addEventListener("pagehide", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pagehide");
            bc === null || bc === void 0 ? void 0 : bc.close();
            for (var _i = 0, _a2 = connections.toArray(); _i < _a2.length; _i++) {
              var db2 = _a2[_i];
              db2.close({ disableAutoOpen: false });
            }
          }
        });
        addEventListener("pageshow", function(event) {
          if (!Dexie$1.disableBfCache && event.persisted) {
            if (debug)
              console.debug("Dexie: handling persisted pageshow");
            createBC();
            propagateLocally({ all: new RangeSet2(-Infinity, [[]]) });
          }
        });
      }
      function add2(value) {
        return new PropModification2({ add: value });
      }
      function remove2(value) {
        return new PropModification2({ remove: value });
      }
      function replacePrefix2(a, b) {
        return new PropModification2({ replacePrefix: [a, b] });
      }
      DexiePromise.rejectionMapper = mapError;
      setDebug(debug);
      var namedExports = /* @__PURE__ */ Object.freeze({
        __proto__: null,
        DEFAULT_MAX_CONNECTIONS,
        Dexie: Dexie$1,
        Entity: Entity2,
        PropModification: PropModification2,
        RangeSet: RangeSet2,
        add: add2,
        cmp: cmp2,
        default: Dexie$1,
        liveQuery: liveQuery2,
        mergeRanges: mergeRanges2,
        rangesOverlap: rangesOverlap2,
        remove: remove2,
        replacePrefix: replacePrefix2
      });
      __assign(Dexie$1, namedExports, { default: Dexie$1 });
      return Dexie$1;
    }));
  }
});

// src/data/mockProjects.js
var mockProjects;
var init_mockProjects = __esm({
  "src/data/mockProjects.js"() {
    mockProjects = [
      {
        id: "prj-2001",
        code: "ALT-01",
        name: "Complejo Residencial Altavista",
        description: "Proyecto residencial de uso mixto con tres torres, urbanismo y zonas comunes.",
        contractorEntity: "Fiduciaria Altavista SAS",
        contractNumber: "CT-2025-011",
        totalBudget: 825e7,
        startDate: "2025-11-10",
        plannedEndDate: "2027-02-28",
        status: "active",
        managerName: "Ana Beltr\xE1n",
        createdAt: "2025-10-15T09:30:00.000Z",
        updatedAt: "2026-04-09T16:20:00.000Z"
      },
      {
        id: "prj-2002",
        code: "ALM-02",
        name: "Proyecto Alameda Industrial",
        description: "Parque industrial para bodegas y plataformas de operaci\xF3n log\xEDstica.",
        contractorEntity: "Grupo Alameda Infraestructura",
        contractNumber: "CT-2024-072",
        totalBudget: 1195e7,
        startDate: "2024-08-05",
        plannedEndDate: "2026-03-31",
        status: "closed",
        managerName: "Diego Rojas",
        createdAt: "2024-07-11T11:10:00.000Z",
        updatedAt: "2026-03-25T10:40:00.000Z"
      },
      {
        id: "prj-2003",
        code: "TOR-03",
        name: "Torre Norte Empresarial",
        description: "Desarrollo corporativo con torre de oficinas, locales y s\xF3tanos t\xE9cnicos.",
        contractorEntity: "Desarrolladora Torre Norte",
        contractNumber: "CT-2026-003",
        totalBudget: 146e8,
        startDate: "2026-02-15",
        plannedEndDate: "2027-09-30",
        status: "active",
        managerName: "Laura Paredes",
        createdAt: "2026-01-22T08:20:00.000Z",
        updatedAt: "2026-04-10T14:35:00.000Z"
      },
      {
        id: "prj-2004",
        code: "LOG-04",
        name: "Centro Log\xEDstico Sabana",
        description: "Construcci\xF3n de plataforma log\xEDstica con bodegas, v\xEDas internas y patios de maniobra.",
        contractorEntity: "Operadora Sabana Log\xEDstica",
        contractNumber: "CT-2025-054",
        totalBudget: 98e8,
        startDate: "2025-09-01",
        plannedEndDate: "2026-12-15",
        status: "suspended",
        managerName: "Sof\xEDa Mar\xEDn",
        createdAt: "2025-08-18T13:05:00.000Z",
        updatedAt: "2026-04-05T12:55:00.000Z"
      },
      {
        id: "prj-2005",
        code: "BOD-05",
        name: "Bodega Central de Materiales",
        description: "Infraestructura de soporte para recepci\xF3n, almacenamiento y despacho de materiales.",
        contractorEntity: "ICARO Gesti\xF3n Integral",
        contractNumber: "INT-2025-009",
        totalBudget: 315e7,
        startDate: "2025-06-03",
        plannedEndDate: "2026-08-30",
        status: "active",
        managerName: "Marta Gil",
        createdAt: "2025-05-20T07:40:00.000Z",
        updatedAt: "2026-04-08T17:10:00.000Z"
      }
    ];
  }
});

// src/services/projects.service.js
var projects_service_exports = {};
__export(projects_service_exports, {
  createProject: () => createProject,
  fetchProjectDetail: () => fetchProjectDetail,
  fetchProjects: () => fetchProjects,
  fetchProyectosAsignados: () => fetchProyectosAsignados,
  patchProjectStatus: () => patchProjectStatus,
  updateProject: () => updateProject
});
var mockStore, nextMockId, isMockMode, normalize, toBackend, fetchProjects, fetchProjectDetail, createProject, updateProject, patchProjectStatus, fetchProyectosAsignados;
var init_projects_service = __esm({
  "src/services/projects.service.js"() {
    init_axios3();
    init_mockProjects();
    mockStore = [...mockProjects];
    nextMockId = 3e3;
    isMockMode = (error) => !error.response || error.code === "ERR_NETWORK" || error.code === "ECONNREFUSED";
    normalize = (p) => {
      const rawStatus = (p.status || p.estado || "active").toLowerCase();
      return {
        ...p,
        id: p.id,
        code: p.code ?? p.codigo ?? "",
        name: p.name ?? p.nombre ?? "",
        description: p.description ?? p.descripcion ?? "",
        contractorEntity: p.contractorEntity ?? p.entidadContratante ?? "",
        contractNumber: p.contractNumber ?? p.numeroContrato ?? "",
        totalBudget: p.totalBudget ?? p.presupuestoTotal ?? 0,
        startDate: p.startDate ?? p.fechaInicio ?? "",
        plannedEndDate: p.plannedEndDate ?? p.fechaFinPrevista ?? "",
        status: rawStatus,
        managerName: p.managerName ?? (p.responsable ? `${p.responsable.nombre} ${p.responsable.apellido}` : ""),
        idResponsable: p.idResponsable ?? p.responsableId ?? "",
        // Mantener campos originales
        codigo: p.codigo ?? p.code ?? "",
        nombre: p.nombre ?? p.name ?? "",
        estado: rawStatus.toUpperCase()
      };
    };
    toBackend = (values) => ({
      codigo: values.code?.trim().toUpperCase(),
      nombre: values.name?.trim(),
      descripcion: values.description?.trim(),
      entidadContratante: values.contractorEntity?.trim(),
      numeroContrato: values.contractNumber?.trim(),
      presupuestoTotal: Number(values.totalBudget),
      fechaInicio: values.startDate,
      fechaFinPrevista: values.plannedEndDate,
      estado: (values.status || "active").toUpperCase(),
      idResponsable: values.idResponsable || null
    });
    fetchProjects = async () => {
      try {
        const { data } = await axios_default2.get("/proyectos");
        const raw = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        return raw.map(normalize);
      } catch (error) {
        if (isMockMode(error)) {
          console.warn("[projects.service] Backend no disponible \u2014 usando datos mock");
          return mockStore.map(normalize);
        }
        throw error;
      }
    };
    fetchProjectDetail = async (id) => {
      try {
        const { data } = await axios_default2.get(`/proyectos/${id}`);
        return normalize(data.data);
      } catch (error) {
        if (isMockMode(error)) {
          return normalize(mockStore.find((p) => p.id === id) ?? mockStore[0]);
        }
        throw error;
      }
    };
    createProject = async (projectData) => {
      try {
        const payload = toBackend(projectData);
        const { data } = await axios_default2.post("/proyectos", payload);
        return normalize(data.data);
      } catch (error) {
        if (isMockMode(error)) {
          const newProject = normalize({
            id: `prj-mock-${++nextMockId}`,
            ...projectData,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          mockStore = [newProject, ...mockStore];
          return newProject;
        }
        throw error;
      }
    };
    updateProject = async (id, projectData) => {
      try {
        const payload = toBackend(projectData);
        const { data } = await axios_default2.put(`/proyectos/${id}`, payload);
        return normalize(data.data);
      } catch (error) {
        if (isMockMode(error)) {
          mockStore = mockStore.map(
            (p) => p.id === id ? { ...p, ...projectData, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : p
          );
          return normalize(mockStore.find((p) => p.id === id));
        }
        throw error;
      }
    };
    patchProjectStatus = async (id, estado) => {
      try {
        const estadoMap = {
          active: "ACTIVO",
          inactive: "INACTIVO",
          suspended: "SUSPENDIDO",
          closed: "FINALIZADO"
        };
        const backendState = estadoMap[estado.toLowerCase()] || estado.toUpperCase();
        const { data } = await axios_default2.patch(`/proyectos/${id}/estado`, { estado: backendState });
        return normalize(data.data);
      } catch (error) {
        if (isMockMode(error)) {
          mockStore = mockStore.map(
            (p) => p.id === id ? { ...p, status: estado.toLowerCase(), estado: estado.toUpperCase(), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } : p
          );
          return normalize(mockStore.find((p) => p.id === id));
        }
        throw error;
      }
    };
    fetchProyectosAsignados = async () => {
      try {
        const { data } = await axios_default2.get("/proyectos");
        const raw = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
        return { data: raw.map(normalize), total: raw.length };
      } catch (error) {
        if (isMockMode(error)) {
          console.warn("[projects.service] Backend no disponible \uFFFD fetchProyectosAsignados retorna vacio");
          return { data: [], total: 0 };
        }
        throw error;
      }
    };
  }
});

// src/data/mockAssignedProjects.js
var mockAssignedProjects_exports = {};
__export(mockAssignedProjects_exports, {
  getAssignedProjectsForUser: () => getAssignedProjectsForUser,
  mockAssignedProjectsByUser: () => mockAssignedProjectsByUser
});
function getAssignedProjectsForUser(email) {
  return mockAssignedProjectsByUser[email?.trim().toLowerCase()] ?? [];
}
var mockAssignedProjectsByUser;
var init_mockAssignedProjects = __esm({
  "src/data/mockAssignedProjects.js"() {
    mockAssignedProjectsByUser = {
      "admin@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "reports-admin",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-01T07:10:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "reports-admin",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-01T07:12:00.000Z"
        }
      ],
      "contador@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "billing-full",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-02T07:20:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "billing-full",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-03T08:40:00.000Z"
        }
      ],
      "gerencia@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "billing-readonly",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-02T09:05:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "billing-readonly",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-03T09:30:00.000Z"
        }
      ],
      "bodega@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "warehouse-operation",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-02T06:30:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "warehouse-operation",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-04T06:45:00.000Z"
        }
      ],
      "auxiliar@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "full",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-03T08:15:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "full",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-04T09:10:00.000Z"
        }
      ],
      "residente@icaro.com": [
        {
          id: "prj-2001",
          code: "ALT-01",
          name: "Complejo Residencial Altavista",
          accessMode: "full",
          startDate: "2026-01-15",
          endDate: "2026-12-20",
          assignedAt: "2026-04-01T08:00:00.000Z"
        },
        {
          id: "prj-2003",
          code: "TOR-03",
          name: "Torre Norte Empresarial",
          accessMode: "full",
          startDate: "2026-02-10",
          endDate: "2026-11-30",
          assignedAt: "2026-04-02T07:45:00.000Z"
        },
        {
          id: "prj-2006",
          code: "PAR-06",
          name: "Parqueadero Cubierto Central",
          accessMode: "restricted-entry",
          startDate: "2026-03-01",
          endDate: "2026-10-18",
          assignedAt: "2026-04-05T09:20:00.000Z"
        }
      ]
    };
  }
});

// src/data/mockInventoryByProject.js
var mockInventoryByProject_exports = {};
__export(mockInventoryByProject_exports, {
  mockInventoryByProject: () => mockInventoryByProject
});
var mockInventoryByProject;
var init_mockInventoryByProject = __esm({
  "src/data/mockInventoryByProject.js"() {
    mockInventoryByProject = {
      "prj-2001": [
        {
          id: "mat-001",
          code: "MAT-CEM-001",
          name: "Cemento estructural Tipo UG",
          unit: "bulto",
          availableQuantity: 148,
          active: true,
          minimumThreshold: 30,
          warehouseLocation: "Bodega principal A-2",
          lastUpdatedAt: "2026-04-11T12:30:00.000Z",
          syncStatus: "synced"
        },
        {
          id: "mat-002",
          code: "MAT-ACR-014",
          name: "Acr\xEDlico impermeabilizante flexible",
          unit: "gal\xF3n",
          availableQuantity: 22,
          active: true,
          minimumThreshold: 6,
          warehouseLocation: "Contenedor t\xE9cnico T-1",
          lastUpdatedAt: "2026-04-11T10:10:00.000Z",
          syncStatus: "pending"
        },
        {
          id: "mat-003",
          code: "MAT-MAL-008",
          name: "Malla electrosoldada 6 mm",
          unit: "panel",
          availableQuantity: 12,
          active: true,
          minimumThreshold: 4,
          warehouseLocation: "Patio cubierto P-4",
          lastUpdatedAt: "2026-04-11T08:50:00.000Z",
          syncStatus: "synced"
        }
      ],
      "prj-2003": [
        {
          id: "mat-101",
          code: "MAT-TUB-021",
          name: "Tuber\xEDa sanitaria PVC 6 pulgadas",
          unit: "tramo",
          availableQuantity: 35,
          active: true,
          minimumThreshold: 10,
          warehouseLocation: "Almac\xE9n norte N-3",
          lastUpdatedAt: "2026-04-11T11:15:00.000Z",
          syncStatus: "synced"
        },
        {
          id: "mat-102",
          code: "MAT-ARE-005",
          name: "Arena lavada para relleno fino",
          unit: "m3",
          availableQuantity: 8,
          active: true,
          minimumThreshold: 3,
          warehouseLocation: "Patio norte N-2",
          lastUpdatedAt: "2026-04-11T09:20:00.000Z",
          syncStatus: "pending"
        },
        {
          id: "mat-103",
          code: "MAT-GEO-004",
          name: "Geotextil no tejido 200 g",
          unit: "rollo",
          availableQuantity: 4,
          active: true,
          minimumThreshold: 2,
          warehouseLocation: "Contenedor sanitario S-1",
          lastUpdatedAt: "2026-04-11T07:45:00.000Z",
          syncStatus: "synced"
        }
      ],
      "prj-2006": []
    };
  }
});

// src/views/obra/MobileConsumptionView.jsx
var MobileConsumptionView_exports = {};
__export(MobileConsumptionView_exports, {
  MobileConsumptionView: () => MobileConsumptionView
});
module.exports = __toCommonJS(MobileConsumptionView_exports);
var import_react24 = __toESM(require("react"), 1);
var import_lucide_react19 = require("lucide-react");

// src/components/ui/AppHeader.jsx
var import_react4 = __toESM(require("react"), 1);
var import_lucide_react3 = require("lucide-react");

// src/components/ui/RoleBadge.jsx
var import_react = __toESM(require("react"), 1);
function RoleBadge({ roleName }) {
  const roleConfig = {
    "Administrador del Sistema": {
      bg: "bg-indigo-50 border-indigo-200/60 text-indigo-700",
      dot: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
    },
    "Presidente / Gerente": {
      bg: "bg-amber-50 border-amber-200/60 text-amber-700",
      dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
    },
    "Residente": {
      bg: "bg-emerald-50 border-emerald-200/60 text-emerald-700",
      dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
    },
    "Auxiliar de Contabilidad": {
      bg: "bg-sky-50 border-sky-200/60 text-sky-700",
      dot: "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"
    },
    "default": {
      bg: "bg-slate-50 border-slate-200/60 text-slate-700",
      dot: "bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]"
    }
  };
  const config = roleConfig[roleName] || roleConfig["default"];
  return /* @__PURE__ */ import_react.default.createElement("span", { className: `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm transition-all duration-200 ${config.bg}` }, /* @__PURE__ */ import_react.default.createElement("span", { className: `h-1.5 w-1.5 rounded-full ${config.dot}` }), /* @__PURE__ */ import_react.default.createElement("span", { className: "opacity-75 font-normal text-[10px] uppercase tracking-wider" }, "Rol:"), /* @__PURE__ */ import_react.default.createElement("span", null, roleName));
}

// src/components/ui/UserMenu.jsx
var import_react2 = __toESM(require("react"), 1);
var import_lucide_react = require("lucide-react");
function UserMenu({ currentUser, isOpen, onToggle, onGoHome, onOpenProfile, onLogout }) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "relative" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: onToggle,
      className: "flex h-[38px] items-center gap-2.5 rounded-[10px] border border-[#D1D5DB] bg-white px-2.5 text-left hover:bg-[#F7F9FC] transition-all duration-200",
      "aria-expanded": isOpen
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "hidden sm:block" }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-xs font-semibold text-[#2F3A45] leading-tight" }, currentUser.name), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-[10px] text-gray-500 leading-tight" }, currentUser.roleName)),
    /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex h-7 w-7 items-center justify-center rounded-full border border-[#1F4E79]/15 bg-[#DCEAF7] text-[11px] font-bold text-[#1F4E79]" }, currentUser.initials),
    /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ChevronDown, { size: 14, className: "text-gray-500" })
  ), isOpen ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "absolute right-0 mt-2 w-64 overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-[0_12px_32px_rgba(17,24,39,0.12)] z-40" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3" }, /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-sm font-semibold text-[#2F3A45]" }, currentUser.name), /* @__PURE__ */ import_react2.default.createElement("p", { className: "text-xs text-gray-500" }, currentUser.email)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "p-2" }, /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: onGoHome,
      className: "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
    },
    /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.LayoutDashboard, { size: 18, className: "text-[#1F4E79]" }),
    "Panel principal"
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: onOpenProfile,
      className: "flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]"
    },
    /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.User, { size: 18, className: "text-[#1F4E79]" }),
    "Mi perfil operativo"
  ), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onLogout({ expired: false }),
      className: "mt-1 flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/5"
    },
    /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.LogOut, { size: 18 }),
    "Cerrar sesi\xF3n"
  ))) : null);
}

// src/components/ui/NotificationMailbox.jsx
var import_react3 = __toESM(require("react"), 1);
var import_react_router_dom = require("react-router-dom");
var import_lucide_react2 = require("lucide-react");

// src/services/compras.service.js
init_axios3();
var fetchNotificaciones = async () => {
  const { data } = await axios_default2.get("/compras/notificaciones");
  return data;
};

// src/components/ui/NotificationMailbox.jsx
function NotificationMailbox({ currentUser }) {
  const [isOpen, setIsOpen] = (0, import_react3.useState)(false);
  const [notifications, setNotifications] = (0, import_react3.useState)([]);
  const [loading, setLoading] = (0, import_react3.useState)(false);
  const [unreadCount, setUnreadCount] = (0, import_react3.useState)(0);
  const dropdownRef = (0, import_react3.useRef)(null);
  const navigate = (0, import_react_router_dom.useNavigate)();
  const handleNotifClick = (notif) => {
    setIsOpen(false);
    if (currentUser.roleName === "Presidente / Gerente" || currentUser.roleName === "Administrador del Sistema") {
      navigate("/module/review");
    } else if (currentUser.roleName === "Contador") {
      navigate("/module/accounting-review");
    } else if (currentUser.roleName === "Bodeguero") {
      const projectId = notif.requerimiento?.idProyecto || "";
      const t = Date.now();
      if (projectId) {
        navigate(`/module/inventory?idProyecto=${projectId}&t=${t}`);
      } else {
        navigate(`/module/inventory?t=${t}`);
      }
    } else {
      const projectId = notif.requerimiento?.idProyecto || "";
      if (projectId) {
        navigate(`/module/requirements?idProyecto=${projectId}`);
      } else {
        navigate("/module/requirements");
      }
    }
  };
  const showMailbox = [
    "Presidente / Gerente",
    "Residente",
    "Administrador del Sistema",
    "Auxiliar de Contabilidad",
    "Contador",
    "Bodeguero"
  ].includes(currentUser.roleName);
  const loadNotifications = async () => {
    if (!showMailbox) return;
    try {
      setLoading(true);
      const result = await fetchNotificaciones();
      const list = result.data || [];
      setNotifications(list);
      setUnreadCount(list.length);
    } catch (error) {
      console.error("[NotificationMailbox] Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react3.useEffect)(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15e3);
    return () => clearInterval(interval);
  }, [currentUser]);
  (0, import_react3.useEffect)(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  if (!showMailbox) return null;
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setUnreadCount(0);
    }
  };
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "relative inline-flex items-center ml-2", ref: dropdownRef }, /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      onClick: handleToggle,
      className: "relative flex h-[38px] w-[38px] items-center justify-center rounded-[10px] border border-[#D1D5DB] bg-white text-[#2F3A45] hover:bg-[#F7F9FC] hover:text-[#1F4E79] transition-all duration-200 focus:outline-none",
      title: "Buz\xF3n de Notificaciones"
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Bell, { size: 18, className: unreadCount > 0 ? "animate-swing" : "" }),
    unreadCount > 0 && /* @__PURE__ */ import_react3.default.createElement("span", { className: "absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white" }, unreadCount)
  ), isOpen && /* @__PURE__ */ import_react3.default.createElement("div", { className: "absolute right-0 top-11 z-50 mt-2 w-80 overflow-hidden rounded-[14px] border border-[#D1D5DB] bg-white/95 backdrop-blur shadow-[0_12px_40px_rgba(17,24,39,0.15)] animate-fade-in" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center justify-between border-b border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Inbox, { size: 16, className: "text-[#1F4E79]" }), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-wider text-[#2F3A45]" }, "Buz\xF3n de Compra")), /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      onClick: (e) => {
        e.stopPropagation();
        loadNotifications();
      },
      disabled: loading,
      className: "text-gray-400 hover:text-[#1F4E79] transition-colors disabled:opacity-50",
      title: "Refrescar"
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.RefreshCw, { size: 14, className: loading ? "animate-spin" : "" })
  )), /* @__PURE__ */ import_react3.default.createElement("div", { className: "max-h-[280px] overflow-y-auto divide-y divide-[#D1D5DB]/50" }, loading && notifications.length === 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex items-center justify-center py-8 text-xs text-gray-400" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.RefreshCw, { size: 14, className: "animate-spin mr-2" }), "Cargando notificaciones...") : notifications.length === 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col items-center justify-center py-10 px-4 text-center" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F9FC] text-gray-400 mb-2" }, /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Inbox, { size: 20 })), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs font-medium text-[#2F3A45]" }, "No hay notificaciones"), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-[10px] text-gray-500 mt-1" }, currentUser.roleName === "Presidente / Gerente" ? "No hay requerimientos de compra pendientes de revisi\xF3n." : currentUser.roleName === "Contador" ? "No hay requerimientos pendientes de validaci\xF3n contable." : currentUser.roleName === "Bodeguero" ? "No hay requerimientos aprobados listos para recepci\xF3n." : "Tus requerimientos no han tenido cambios de estado recientes.")) : notifications.map((notif) => {
    const isApproved = notif.tipo === "APROBADO" || notif.tipo === "APPROVED";
    const isRejected = notif.tipo === "RECHAZADO" || notif.tipo === "REJECTED";
    return /* @__PURE__ */ import_react3.default.createElement(
      "div",
      {
        key: notif.id,
        onClick: () => handleNotifClick(notif),
        className: "p-3 hover:bg-[#F7F9FC]/70 transition-colors flex items-start gap-3 cursor-pointer"
      },
      /* @__PURE__ */ import_react3.default.createElement("div", { className: "mt-0.5 shrink-0" }, isApproved ? /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.CheckCircle2, { size: 16, className: "text-[#16A34A]" }) : isRejected ? /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.AlertCircle, { size: 16, className: "text-[#DC2626]" }) : /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Bell, { size: 16, className: "text-[#1F4E79]" })),
      /* @__PURE__ */ import_react3.default.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-xs font-semibold text-[#2F3A45]" }, notif.titulo), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-[11px] text-gray-600 mt-0.5 leading-snug" }, notif.mensaje), /* @__PURE__ */ import_react3.default.createElement("p", { className: "text-[9px] text-gray-400 mt-1" }, new Date(notif.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), " \xB7 ", new Date(notif.fecha).toLocaleDateString()))
    );
  }))));
}

// src/components/ui/AppHeader.jsx
function AppHeader({
  currentUser,
  currentAreaLabel,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenNavigation
}) {
  const [menuOpen, setMenuOpen] = (0, import_react4.useState)(false);
  return /* @__PURE__ */ import_react4.default.createElement("header", { className: "sticky top-0 z-30 border-b border-[#D1D5DB] bg-white/95 backdrop-blur" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 md:px-6" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-3 min-w-0" }, /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      onClick: onOpenNavigation,
      className: "inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45] hover:bg-gray-50 lg:hidden",
      "aria-label": "Abrir navegaci\xF3n"
    },
    /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Menu, { size: 20 })
  ), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      onClick: onGoHome,
      className: "flex min-w-0 items-center gap-3 rounded-[12px] hover:bg-[#F7F9FC] px-1 py-1 text-left"
    },
    /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#1F4E79] text-white" }, /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.Building2, { size: 22 })),
    /* @__PURE__ */ import_react4.default.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ import_react4.default.createElement("p", { className: "truncate text-sm font-semibold text-[#2F3A45]" }, "ICARO Gesti\xF3n Integral"), /* @__PURE__ */ import_react4.default.createElement("p", { className: "truncate text-xs text-gray-500" }, currentAreaLabel))
  )), /* @__PURE__ */ import_react4.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "hidden md:flex items-center" }, /* @__PURE__ */ import_react4.default.createElement(RoleBadge, { roleName: currentUser.roleName })), /* @__PURE__ */ import_react4.default.createElement(NotificationMailbox, { currentUser }), /* @__PURE__ */ import_react4.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onLogout({ expired: false }),
      className: "hidden h-[38px] items-center gap-2 rounded-[10px] border border-[#DC2626]/20 bg-[#DC2626]/5 px-3 text-xs font-semibold uppercase tracking-wider text-[#DC2626] transition-all duration-200 hover:bg-[#DC2626]/10 hover:border-[#DC2626]/30 md:inline-flex"
    },
    /* @__PURE__ */ import_react4.default.createElement(import_lucide_react3.LogOut, { size: 14, className: "opacity-80" }),
    /* @__PURE__ */ import_react4.default.createElement("span", null, "Salir")
  ), /* @__PURE__ */ import_react4.default.createElement(
    UserMenu,
    {
      currentUser,
      isOpen: menuOpen,
      onToggle: () => setMenuOpen((previous) => !previous),
      onGoHome: () => {
        setMenuOpen(false);
        onGoHome();
      },
      onOpenProfile: () => {
        setMenuOpen(false);
        onOpenProfile();
      },
      onLogout: (payload) => {
        setMenuOpen(false);
        onLogout(payload);
      }
    }
  ))));
}

// src/components/ui/SidebarNavigation.jsx
var import_react5 = __toESM(require("react"), 1);
var import_lucide_react4 = require("lucide-react");
function SidebarNavigation({
  modules,
  activeItemId,
  isOpen,
  currentUser,
  onClose,
  onGoHome,
  onOpenModule,
  onOpenProfile,
  onLogout
}) {
  const content = /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex h-full flex-col rounded-r-[20px] border-r border-[#D1D5DB] bg-white lg:rounded-r-none lg:border lg:rounded-[12px]" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center justify-between border-b border-[#D1D5DB] px-5 py-4 lg:hidden" }, /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-sm font-semibold text-[#2F3A45]" }, "Navegaci\xF3n principal"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-500" }, "M\xF3dulos habilitados para su rol")), /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45]"
    },
    /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.X, { size: 18 })
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-4 py-5 border-b border-[#D1D5DB]" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.14em] text-gray-400" }, "Sesi\xF3n actual"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "mt-2 text-sm font-semibold text-[#2F3A45]" }, currentUser.name), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-gray-500" }, currentUser.roleName)), /* @__PURE__ */ import_react5.default.createElement("nav", { className: "flex-1 overflow-y-auto px-3 py-4" }, /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        onGoHome();
        onClose();
      },
      className: `flex w-full items-center gap-3 rounded-[12px] px-4 py-3 text-left text-sm font-medium transition-colors ${activeItemId === "dashboard" ? "bg-[#1F4E79] text-white shadow-sm" : "text-[#2F3A45] hover:bg-[#F7F9FC]"}`
    },
    /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.LayoutDashboard, { size: 18 }),
    "Panel principal"
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-6" }, /* @__PURE__ */ import_react5.default.createElement("p", { className: "px-4 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400" }, "M\xF3dulos disponibles"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-3 space-y-2" }, modules.map((moduleItem) => {
    const Icon = moduleItem.icon;
    const isActive = activeItemId === moduleItem.id;
    return /* @__PURE__ */ import_react5.default.createElement(
      "button",
      {
        key: moduleItem.id,
        type: "button",
        onClick: () => {
          onOpenModule(moduleItem.id);
          onClose();
        },
        className: `flex w-full items-start gap-3 rounded-[12px] px-4 py-3 text-left transition-colors ${isActive ? "border border-[#1F4E79]/10 bg-[#DCEAF7]/80 text-[#1F4E79]" : "text-[#2F3A45] hover:bg-[#F7F9FC]"}`
      },
      /* @__PURE__ */ import_react5.default.createElement(Icon, { size: 18, className: "mt-0.5 shrink-0" }),
      /* @__PURE__ */ import_react5.default.createElement("span", null, /* @__PURE__ */ import_react5.default.createElement("span", { className: "block text-sm font-medium" }, moduleItem.name), /* @__PURE__ */ import_react5.default.createElement("span", { className: "mt-1 block text-xs text-gray-500" }, moduleItem.description))
    );
  })))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "border-t border-[#D1D5DB] p-3 space-y-2" }, /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => {
        onOpenProfile();
        onClose();
      },
      className: "flex h-[44px] w-full items-center gap-3 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50"
    },
    /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.User, { size: 18, className: "text-[#1F4E79]" }),
    "Mi perfil operativo"
  ), /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => onLogout({ expired: false }),
      className: "flex h-[44px] w-full items-center gap-3 rounded-[12px] bg-[#F7F9FC] px-4 text-sm font-medium text-[#DC2626] hover:bg-[#DC2626]/5"
    },
    /* @__PURE__ */ import_react5.default.createElement(import_lucide_react4.LogOut, { size: 18 }),
    "Cerrar sesi\xF3n"
  )));
  return /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, /* @__PURE__ */ import_react5.default.createElement("aside", { className: "hidden lg:block lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)]" }, content), isOpen ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "fixed inset-0 z-40 lg:hidden" }, /* @__PURE__ */ import_react5.default.createElement(
    "button",
    {
      type: "button",
      className: "absolute inset-0 bg-[#111827]/45",
      onClick: onClose,
      "aria-label": "Cerrar navegaci\xF3n"
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative h-full max-w-[340px]" }, content)) : null);
}

// src/components/ui/EmptyState.jsx
var import_react6 = __toESM(require("react"), 1);
function EmptyState({ title, description, actionLabel, onAction }) {
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "rounded-[12px] border border-dashed border-[#D1D5DB] bg-[#F7F9FC] px-5 py-6 text-center" }, /* @__PURE__ */ import_react6.default.createElement("h3", { className: "text-sm font-semibold text-[#2F3A45] mb-1" }, title), /* @__PURE__ */ import_react6.default.createElement("p", { className: "text-sm text-gray-500 max-w-md mx-auto" }, description), actionLabel && onAction ? /* @__PURE__ */ import_react6.default.createElement(
    "button",
    {
      type: "button",
      onClick: onAction,
      className: "mt-4 inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40 transition-colors"
    },
    actionLabel
  ) : null);
}

// src/components/obra/AvailableMaterialsList.jsx
var import_react7 = __toESM(require("react"), 1);
var import_lucide_react5 = require("lucide-react");

// src/utils/projectHelpers.js
function formatShortDate(dateValue) {
  if (!dateValue) {
    return "Sin definir";
  }
  try {
    let dateObj = dateValue instanceof Date ? dateValue : null;
    if (!dateObj) {
      if (typeof dateValue === "string" && dateValue.length === 10) {
        dateObj = /* @__PURE__ */ new Date(`${dateValue}T00:00:00`);
      } else {
        dateObj = new Date(dateValue);
      }
    }
    if (isNaN(dateObj.getTime())) {
      return "Fecha inv\xE1lida";
    }
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting short date:", error);
    return "Error fecha";
  }
}
function formatDateTime(dateValue) {
  if (!dateValue) {
    return "Sin registro";
  }
  try {
    const dateObj = new Date(dateValue);
    if (isNaN(dateObj.getTime())) return "Fecha inv\xE1lida";
    return new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(dateObj);
  } catch (error) {
    return "Error fecha";
  }
}

// src/utils/consumptionHelpers.js
var defaultConsumptionFormValues = {
  quantity: "",
  observations: ""
};
function formatConsumptionQuantity(value) {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}
function getSelectedProject(projects, projectId) {
  return projects.find((project) => project.id === projectId) ?? null;
}
function filterMaterials(materials, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return materials;
  }
  return materials.filter(
    (material) => material.code.toLowerCase().includes(normalizedQuery) || material.name.toLowerCase().includes(normalizedQuery)
  );
}
function getSelectedMaterial(materials, materialId) {
  return materials.find((material) => material.id === materialId) ?? null;
}
function validateConsumptionForm({ projectId, materialId, quantity }) {
  const errors = {};
  const numericQuantity = Number(quantity);
  if (!projectId) {
    errors.projectId = "Seleccione un proyecto asignado para continuar.";
  }
  if (!materialId) {
    errors.materialId = "Seleccione un material para registrar el consumo.";
  }
  if (!quantity) {
    errors.quantity = "Ingrese la cantidad consumida.";
  } else if (Number.isNaN(numericQuantity)) {
    errors.quantity = "La cantidad consumida debe ser num\xE9rica.";
  } else if (numericQuantity <= 0) {
    errors.quantity = "La cantidad consumida debe ser mayor a cero.";
  }
  return errors;
}
function createConsumptionPayload({ project, material, values }) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  return {
    id: `con-${Date.now()}`,
    projectId: project.id,
    projectCode: project.code,
    projectName: project.name,
    materialId: material.id,
    materialCode: material.code,
    materialName: material.name,
    unit: material.unit,
    quantityConsumed: Number(values.quantity),
    observations: values.observations.trim(),
    registeredAt: timestamp,
    status: "registered",
    syncStatus: "pending",
    syncTimestamp: null
  };
}
function hasConsumptionDraft(values, selectedMaterialId) {
  return Boolean(selectedMaterialId || values.quantity || values.observations.trim());
}
function clearConsumptionForm() {
  return { ...defaultConsumptionFormValues };
}
function formatConsumptionDate(dateValue) {
  return formatDateTime(dateValue);
}
function getMaterialAvailabilityTone(material) {
  if (!material) {
    return "neutral";
  }
  if (material.availableQuantity <= 0) {
    return "danger";
  }
  if (material.availableQuantity <= (material.minimumThreshold ?? 0)) {
    return "warning";
  }
  return "success";
}

// src/components/obra/AvailableMaterialsList.jsx
var toneStyles = {
  success: "border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]",
  warning: "border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]",
  danger: "border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]",
  neutral: "border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]"
};
function AvailableMaterialsList({ materials, selectedMaterialId, onSelect, query }) {
  if (!materials.length) {
    return /* @__PURE__ */ import_react7.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-sm font-semibold text-[#2F3A45]" }, "No hay resultados para la b\xFAsqueda actual"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Ajuste el t\xE9rmino de b\xFAsqueda para encontrar un material disponible dentro del proyecto activo."));
  }
  return /* @__PURE__ */ import_react7.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("h2", { className: "text-lg font-semibold text-[#2F3A45]" }, "Materiales disponibles"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Seleccione el material que va a consumir. El stock visible corresponde al proyecto activo.")), /* @__PURE__ */ import_react7.default.createElement("span", { className: "text-sm font-medium text-gray-500" }, materials.length, " resultado", materials.length === 1 ? "" : "s")), query ? /* @__PURE__ */ import_react7.default.createElement("p", { className: "mt-3 text-xs text-gray-500" }, "Filtro actual: \u201C", query, "\u201D") : null, /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-4 space-y-3" }, materials.map((material) => {
    const tone = getMaterialAvailabilityTone(material);
    const isSelected = selectedMaterialId === material.id;
    return /* @__PURE__ */ import_react7.default.createElement(
      "button",
      {
        key: material.id,
        type: "button",
        onClick: () => onSelect(material.id),
        className: `w-full rounded-[12px] border p-4 text-left transition ${isSelected ? "border-[#1F4E79] bg-[#DCEAF7]/30 shadow-sm" : "border-[#D1D5DB] bg-[#F7F9FC] hover:bg-white"}`
      },
      /* @__PURE__ */ import_react7.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, material.code), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mt-1 text-sm font-semibold text-[#2F3A45]" }, material.name), /* @__PURE__ */ import_react7.default.createElement("p", { className: "mt-2 text-xs text-gray-500" }, "Ubicaci\xF3n: ", material.warehouseLocation)), /* @__PURE__ */ import_react7.default.createElement(import_lucide_react5.Box, { size: 18, className: "text-[#1F4E79]" })),
      /* @__PURE__ */ import_react7.default.createElement("div", { className: "mt-3 flex flex-wrap gap-2" }, /* @__PURE__ */ import_react7.default.createElement("span", { className: `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneStyles[tone]}` }, tone === "danger" ? /* @__PURE__ */ import_react7.default.createElement(import_lucide_react5.PackageX, { size: 14 }) : /* @__PURE__ */ import_react7.default.createElement(import_lucide_react5.PackageCheck, { size: 14 }), "Stock: ", formatConsumptionQuantity(material.availableQuantity), " ", material.unit), /* @__PURE__ */ import_react7.default.createElement("span", { className: "inline-flex items-center rounded-full border border-[#D1D5DB] bg-white px-3 py-1 text-xs font-medium text-[#2F3A45]" }, "Unidad: ", material.unit))
    );
  })));
}

// src/components/obra/ChangeProjectConsumptionModal.jsx
var import_react10 = __toESM(require("react"), 1);

// src/components/ui/ModalShell.jsx
var import_react8 = __toESM(require("react"), 1);
var import_lucide_react6 = require("lucide-react");
function ModalShell({ title, description, children, onClose, widthClass = "max-w-xl" }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/45 p-4 backdrop-blur-sm" }, /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", className: "absolute inset-0", onClick: onClose, "aria-label": "Cerrar modal" }), /* @__PURE__ */ import_react8.default.createElement("div", { className: `relative w-full ${widthClass} overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-white shadow-[0_18px_50px_rgba(17,24,39,0.18)]` }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-start justify-between gap-4 border-b border-[#D1D5DB] bg-gray-50/70 px-6 py-5" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement("h3", { className: "text-lg font-semibold text-[#2F3A45]" }, title), description ? /* @__PURE__ */ import_react8.default.createElement("p", { className: "mt-1 text-sm text-gray-500" }, description) : null), /* @__PURE__ */ import_react8.default.createElement(
    "button",
    {
      type: "button",
      onClick: onClose,
      className: "inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#D1D5DB] text-gray-500 hover:bg-white hover:text-[#2F3A45]"
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react6.X, { size: 18 })
  )), /* @__PURE__ */ import_react8.default.createElement("div", { className: "max-h-[calc(100vh-10rem)] overflow-y-auto p-6" }, children)));
}

// src/components/obra/ProjectConsumptionSelector.jsx
var import_react9 = __toESM(require("react"), 1);
var import_lucide_react7 = require("lucide-react");

// src/utils/progressHelpers.js
function getProjectAccessLabel(accessMode) {
  if (accessMode === "restricted-entry") {
    return "Ingreso restringido";
  }
  return "Acceso operativo";
}
function getProjectContextText(project) {
  if (!project) {
    return "Sin proyecto asignado";
  }
  return `${project.code} \xB7 ${project.name}`;
}
function getProjectDatesText(project) {
  if (!project) {
    return "Sin vigencia disponible";
  }
  return `${formatShortDate(project.startDate)} a ${formatShortDate(project.endDate)}`;
}

// src/components/obra/ProjectConsumptionSelector.jsx
function ProjectConsumptionSelector({ projects, selectedProjectId, onSelect }) {
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "space-y-3" }, projects.map((project) => {
    const isSelected = project.id === selectedProjectId;
    return /* @__PURE__ */ import_react9.default.createElement(
      "button",
      {
        key: project.id,
        type: "button",
        onClick: () => onSelect(project.id),
        className: `w-full rounded-[12px] border p-4 text-left transition ${isSelected ? "border-[#1F4E79] bg-[#DCEAF7]/50 shadow-sm" : "border-[#D1D5DB] bg-white hover:bg-[#F7F9FC]"}`
      },
      /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react9.default.createElement("div", null, /* @__PURE__ */ import_react9.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, project.code), /* @__PURE__ */ import_react9.default.createElement("p", { className: "mt-1 text-sm font-semibold text-[#2F3A45]" }, project.name)), isSelected ? /* @__PURE__ */ import_react9.default.createElement("span", { className: "rounded-full bg-[#1F4E79] px-3 py-1 text-xs font-semibold text-white" }, "Actual") : null),
      /* @__PURE__ */ import_react9.default.createElement("div", { className: "mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "inline-flex items-center gap-2" }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react7.FolderKanban, { size: 14, className: "text-[#1F4E79]" }), getProjectAccessLabel(project.accessMode)), /* @__PURE__ */ import_react9.default.createElement("div", { className: "inline-flex items-center gap-2" }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react7.CalendarRange, { size: 14, className: "text-[#1F4E79]" }), getProjectDatesText(project)))
    );
  }));
}

// src/components/obra/ChangeProjectConsumptionModal.jsx
function ChangeProjectConsumptionModal({ projects, currentProjectId, hasDraft, onCancel, onConfirm }) {
  const [selectedProjectId, setSelectedProjectId] = (0, import_react10.useState)(currentProjectId);
  return /* @__PURE__ */ import_react10.default.createElement(
    ModalShell,
    {
      title: "Cambiar proyecto",
      description: "Seleccione uno de los proyectos asignados para continuar con el registro de consumo.",
      onClose: onCancel,
      widthClass: "max-w-3xl"
    },
    /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-5" }, hasDraft ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "rounded-[12px] border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#9A6700]" }, "Cambiar de proyecto limpiar\xE1 el material seleccionado y el borrador actual para evitar inconsistencias de contexto.") : null, /* @__PURE__ */ import_react10.default.createElement(ProjectConsumptionSelector, { projects, selectedProjectId, onSelect: setSelectedProjectId }), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col-reverse gap-3 border-t border-[#D1D5DB] pt-5 sm:flex-row sm:justify-end" }, /* @__PURE__ */ import_react10.default.createElement("button", { type: "button", onClick: onCancel, className: "h-[44px] rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-gray-50" }, "Cancelar"), /* @__PURE__ */ import_react10.default.createElement("button", { type: "button", onClick: () => onConfirm(selectedProjectId), className: "h-[44px] rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]" }, "Confirmar proyecto")))
  );
}

// src/components/obra/ConsumptionContextHeader.jsx
var import_react12 = __toESM(require("react"), 1);
var import_lucide_react9 = require("lucide-react");

// src/components/obra/ConsumptionPendingSyncBadge.jsx
var import_react11 = __toESM(require("react"), 1);
var import_lucide_react8 = require("lucide-react");
function ConsumptionPendingSyncBadge({ count = 0, syncStatus = "pending" }) {
  if (count > 0 || syncStatus === "pending") {
    return /* @__PURE__ */ import_react11.default.createElement("span", { className: "inline-flex items-center gap-2 rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-3 py-1 text-xs font-semibold text-[#9A6700]" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react8.CloudOff, { size: 14 }), count > 0 ? `${count} pendientes de sincronizaci\xF3n` : "Sincronizaci\xF3n pendiente");
  }
  return /* @__PURE__ */ import_react11.default.createElement("span", { className: "inline-flex items-center gap-2 rounded-full border border-[#16A34A]/15 bg-[#16A34A]/10 px-3 py-1 text-xs font-semibold text-[#166534]" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react8.CloudCheck, { size: 14 }), "Sincronizaci\xF3n al d\xEDa");
}

// src/components/obra/ConsumptionContextHeader.jsx
function ConsumptionContextHeader({ currentProject, hasMultipleProjects, totalAssignedProjects, pendingSyncCount, onGoHome, onOpenProjectModal }) {
  return /* @__PURE__ */ import_react12.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", onClick: onGoHome, className: "inline-flex h-[40px] items-center gap-2 rounded-[12px] border border-[#D1D5DB] px-3 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react9.ArrowLeft, { size: 16 }), "Volver al panel"), totalAssignedProjects ? /* @__PURE__ */ import_react12.default.createElement("div", { className: "inline-flex items-center gap-2 rounded-[12px] bg-[#E8F0F8] px-3 py-1.5 text-sm font-medium text-[#1F4E79]" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react9.FolderSync, { size: 16 }), /* @__PURE__ */ import_react12.default.createElement("span", null, totalAssignedProjects, " proyecto", totalAssignedProjects !== 1 ? "s" : "", " asignado", totalAssignedProjects !== 1 ? "s" : "")) : null), /* @__PURE__ */ import_react12.default.createElement("div", { className: "mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" }, /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-sm font-medium text-[#1F4E79]" }, "Registro mobile-first para consumo en campo"), /* @__PURE__ */ import_react12.default.createElement("h1", { className: "mt-1 text-2xl font-semibold text-[#2F3A45]" }, "Consumo en obra"), /* @__PURE__ */ import_react12.default.createElement("p", { className: "mt-2 text-sm text-gray-600" }, "Seleccione proyecto y material, valide stock y registre el consumo con una interacci\xF3n clara y r\xE1pida desde m\xF3vil.")), /* @__PURE__ */ import_react12.default.createElement(ConsumptionPendingSyncBadge, { count: pendingSyncCount })), /* @__PURE__ */ import_react12.default.createElement("div", { className: "mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react12.default.createElement("div", null, /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, "Proyecto activo"), /* @__PURE__ */ import_react12.default.createElement("p", { className: "mt-1 text-base font-semibold text-[#2F3A45]" }, getProjectContextText(currentProject)), /* @__PURE__ */ import_react12.default.createElement("div", { className: "mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "inline-flex items-center gap-2" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react9.MapPinned, { size: 14, className: "text-[#1F4E79]" }), getProjectAccessLabel(currentProject?.accessMode)), /* @__PURE__ */ import_react12.default.createElement("div", { className: "inline-flex items-center gap-2" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react9.FolderSync, { size: 14, className: "text-[#1F4E79]" }), getProjectDatesText(currentProject)))), hasMultipleProjects ? /* @__PURE__ */ import_react12.default.createElement("button", { type: "button", onClick: onOpenProjectModal, className: "inline-flex min-h-[44px] items-center justify-center rounded-[12px] border border-[#1F4E79] px-4 text-sm font-medium text-[#1F4E79] hover:bg-[#DCEAF7]/40" }, "Cambiar proyecto") : null), !hasMultipleProjects ? /* @__PURE__ */ import_react12.default.createElement("p", { className: "mt-3 text-sm text-gray-500" }, "Solo tiene un proyecto asignado para esta jornada.") : null));
}

// src/components/obra/ConsumptionDraftPanel.jsx
var import_react13 = __toESM(require("react"), 1);
var import_lucide_react10 = require("lucide-react");
function ConsumptionDraftPanel({ selectedMaterial, values, onReset }) {
  return /* @__PURE__ */ import_react13.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react13.default.createElement("div", null, /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-sm font-semibold text-[#2F3A45]" }, "Borrador actual"), /* @__PURE__ */ import_react13.default.createElement("p", { className: "mt-1 text-sm text-gray-500" }, "Revise el contexto antes de registrar el consumo.")), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      type: "button",
      onClick: onReset,
      className: "inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#D1D5DB] text-[#2F3A45] hover:bg-[#F7F9FC]",
      "aria-label": "Limpiar borrador"
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react10.RotateCcw, { size: 16 })
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "mt-4 space-y-3 text-sm text-gray-600" }, /* @__PURE__ */ import_react13.default.createElement("p", null, "Material actual: ", /* @__PURE__ */ import_react13.default.createElement("span", { className: "font-semibold text-[#2F3A45]" }, selectedMaterial ? `${selectedMaterial.code} \xB7 ${selectedMaterial.name}` : "Sin seleccionar")), /* @__PURE__ */ import_react13.default.createElement("p", null, "Cantidad digitada: ", /* @__PURE__ */ import_react13.default.createElement("span", { className: "font-semibold text-[#2F3A45]" }, values.quantity || "Sin registro")), /* @__PURE__ */ import_react13.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-3" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react10.FileText, { size: 14, className: "text-[#1F4E79]" }), "Observaci\xF3n r\xE1pida"), /* @__PURE__ */ import_react13.default.createElement("p", { className: "mt-2 text-sm text-[#2F3A45]" }, values.observations.trim() || "No hay observaciones capturadas en este borrador."))));
}

// src/components/obra/ConsumptionErrorState.jsx
var import_react14 = __toESM(require("react"), 1);
var import_lucide_react11 = require("lucide-react");
function ConsumptionErrorState({ title, description, onRetry, onGoHome, onDismiss }) {
  return /* @__PURE__ */ import_react14.default.createElement("section", { className: "rounded-[12px] border border-[#DC2626]/15 bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#DC2626]/10 text-[#DC2626]" }, /* @__PURE__ */ import_react14.default.createElement(import_lucide_react11.AlertTriangle, { size: 22 })), /* @__PURE__ */ import_react14.default.createElement("div", null, /* @__PURE__ */ import_react14.default.createElement("h2", { className: "text-lg font-semibold text-[#2F3A45]" }, title), /* @__PURE__ */ import_react14.default.createElement("p", { className: "mt-1 text-sm text-gray-600" }, description))), /* @__PURE__ */ import_react14.default.createElement("div", { className: "mt-5 flex flex-wrap gap-3" }, onRetry ? /* @__PURE__ */ import_react14.default.createElement("button", { type: "button", onClick: onRetry, className: "inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]" }, /* @__PURE__ */ import_react14.default.createElement(import_lucide_react11.RotateCcw, { size: 16 }), "Reintentar") : null, onDismiss ? /* @__PURE__ */ import_react14.default.createElement("button", { type: "button", onClick: onDismiss, className: "inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]" }, "Cerrar mensaje") : null, onGoHome ? /* @__PURE__ */ import_react14.default.createElement("button", { type: "button", onClick: onGoHome, className: "inline-flex h-[44px] items-center justify-center rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]" }, "Volver al panel") : null));
}

// src/components/obra/ConsumptionForm.jsx
var import_react15 = __toESM(require("react"), 1);
var import_lucide_react12 = require("lucide-react");
function ConsumptionForm({ values, errors, selectedMaterial, isSubmitting, onChange, onSubmit, onReset }) {
  return /* @__PURE__ */ import_react15.default.createElement("form", { onSubmit, className: "rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react15.default.createElement("h2", { className: "text-lg font-semibold text-[#2F3A45]" }, "Registrar consumo"), /* @__PURE__ */ import_react15.default.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "Ingrese la cantidad consumida y una observaci\xF3n si necesita dejar trazabilidad de campo."), /* @__PURE__ */ import_react15.default.createElement("div", { className: "mt-5 space-y-4" }, /* @__PURE__ */ import_react15.default.createElement("div", null, /* @__PURE__ */ import_react15.default.createElement("label", { htmlFor: "consumption-quantity", className: "block text-sm font-medium text-[#2F3A45]" }, "Cantidad consumida"), /* @__PURE__ */ import_react15.default.createElement("div", { className: "mt-2 flex items-center overflow-hidden rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC]" }, /* @__PURE__ */ import_react15.default.createElement(
    "input",
    {
      id: "consumption-quantity",
      type: "number",
      min: "0",
      step: "0.01",
      value: values.quantity,
      onChange: (event) => onChange("quantity", event.target.value),
      disabled: !selectedMaterial || isSubmitting,
      className: "h-[48px] w-full bg-transparent px-4 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed",
      placeholder: "Ingrese la cantidad consumida"
    }
  ), /* @__PURE__ */ import_react15.default.createElement("span", { className: "px-4 text-sm font-semibold text-[#2F3A45]" }, selectedMaterial?.unit ?? "Unidad")), errors.quantity ? /* @__PURE__ */ import_react15.default.createElement("p", { className: "mt-2 text-sm text-[#DC2626]" }, errors.quantity) : null), /* @__PURE__ */ import_react15.default.createElement("div", null, /* @__PURE__ */ import_react15.default.createElement("label", { htmlFor: "consumption-observations", className: "block text-sm font-medium text-[#2F3A45]" }, "Observaciones"), /* @__PURE__ */ import_react15.default.createElement(
    "textarea",
    {
      id: "consumption-observations",
      value: values.observations,
      onChange: (event) => onChange("observations", event.target.value),
      disabled: isSubmitting,
      className: "mt-2 min-h-[112px] w-full rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-4 py-3 text-sm text-[#2F3A45] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed",
      placeholder: "Opcional: detalle del frente, responsable o justificaci\xF3n breve"
    }
  )), /* @__PURE__ */ import_react15.default.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, /* @__PURE__ */ import_react15.default.createElement("button", { type: "submit", disabled: isSubmitting, className: "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c] disabled:cursor-not-allowed disabled:bg-[#94A3B8]" }, /* @__PURE__ */ import_react15.default.createElement(import_lucide_react12.SendHorizonal, { size: 16 }), isSubmitting ? "Registrando consumo..." : "Registrar consumo"), /* @__PURE__ */ import_react15.default.createElement("button", { type: "button", onClick: onReset, disabled: isSubmitting, className: "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC] disabled:cursor-not-allowed disabled:text-gray-400" }, /* @__PURE__ */ import_react15.default.createElement(import_lucide_react12.RotateCcw, { size: 16 }), "Limpiar formulario"))));
}

// src/components/obra/ConsumptionLoadingState.jsx
var import_react16 = __toESM(require("react"), 1);
function ConsumptionLoadingState() {
  return /* @__PURE__ */ import_react16.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react16.default.createElement("div", { className: "h-28 animate-pulse rounded-[12px] bg-white shadow-sm" }), /* @__PURE__ */ import_react16.default.createElement("div", { className: "h-32 animate-pulse rounded-[12px] bg-white shadow-sm" }), /* @__PURE__ */ import_react16.default.createElement("div", { className: "h-48 animate-pulse rounded-[12px] bg-white shadow-sm" }));
}

// src/components/obra/ConsumptionSuccessState.jsx
var import_react17 = __toESM(require("react"), 1);
var import_lucide_react13 = require("lucide-react");
function ConsumptionSuccessState({ record, onRegisterAnother, onGoHome }) {
  return /* @__PURE__ */ import_react17.default.createElement("section", { className: "rounded-[12px] border border-[#16A34A]/15 bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "flex items-start gap-4" }, /* @__PURE__ */ import_react17.default.createElement("div", { className: "flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#16A34A]/10 text-[#16A34A]" }, /* @__PURE__ */ import_react17.default.createElement(import_lucide_react13.CircleCheckBig, { size: 24 })), /* @__PURE__ */ import_react17.default.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ import_react17.default.createElement("h2", { className: "text-lg font-semibold text-[#2F3A45]" }, "El consumo fue registrado correctamente"), /* @__PURE__ */ import_react17.default.createElement("p", { className: "mt-1 text-sm text-gray-600" }, "El registro qued\xF3 listo para sincronizaci\xF3n y puede continuar con otra tarea sin perder contexto del proyecto."))), /* @__PURE__ */ import_react17.default.createElement("div", { className: "mt-5 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]" }, /* @__PURE__ */ import_react17.default.createElement("p", null, /* @__PURE__ */ import_react17.default.createElement("span", { className: "font-semibold" }, "Proyecto:"), " ", record.projectCode, " \xB7 ", record.projectName), /* @__PURE__ */ import_react17.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react17.default.createElement("span", { className: "font-semibold" }, "Material:"), " ", record.materialCode, " \xB7 ", record.materialName), /* @__PURE__ */ import_react17.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react17.default.createElement("span", { className: "font-semibold" }, "Cantidad registrada:"), " ", formatConsumptionQuantity(record.quantityConsumed), " ", record.unit), /* @__PURE__ */ import_react17.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react17.default.createElement("span", { className: "font-semibold" }, "Fecha:"), " ", formatConsumptionDate(record.registeredAt)), /* @__PURE__ */ import_react17.default.createElement("div", { className: "mt-3" }, /* @__PURE__ */ import_react17.default.createElement(ConsumptionPendingSyncBadge, { syncStatus: record.syncStatus }))), /* @__PURE__ */ import_react17.default.createElement("div", { className: "mt-5 grid gap-3 sm:grid-cols-2" }, /* @__PURE__ */ import_react17.default.createElement("button", { type: "button", onClick: onRegisterAnother, className: "inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]" }, /* @__PURE__ */ import_react17.default.createElement(import_lucide_react13.Repeat, { size: 16 }), "Registrar otro consumo"), /* @__PURE__ */ import_react17.default.createElement("button", { type: "button", onClick: onGoHome, className: "inline-flex h-[44px] items-center justify-center gap-2 rounded-[12px] border border-[#D1D5DB] px-4 text-sm font-medium text-[#2F3A45] hover:bg-[#F7F9FC]" }, /* @__PURE__ */ import_react17.default.createElement(import_lucide_react13.Home, { size: 16 }), "Volver al panel")));
}

// src/components/obra/ConsumptionSummaryCard.jsx
var import_react18 = __toESM(require("react"), 1);
var import_lucide_react14 = require("lucide-react");
function ConsumptionSummaryCard({ summary }) {
  const items = [
    { id: "availableMaterials", label: "Materiales activos", value: summary.availableMaterials, icon: import_lucide_react14.Boxes },
    { id: "pendingSync", label: "Pendientes sync", value: summary.pendingSync, icon: import_lucide_react14.UploadCloud }
  ];
  return /* @__PURE__ */ import_react18.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "grid gap-3 sm:grid-cols-2" }, items.map((item) => {
    const Icon = item.icon;
    return /* @__PURE__ */ import_react18.default.createElement("article", { key: item.id, className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4" }, /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex items-center justify-between gap-3" }, /* @__PURE__ */ import_react18.default.createElement("div", null, /* @__PURE__ */ import_react18.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, item.label), /* @__PURE__ */ import_react18.default.createElement("p", { className: "mt-2 text-2xl font-semibold text-[#2F3A45]" }, item.value)), /* @__PURE__ */ import_react18.default.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-[12px] bg-white text-[#1F4E79]" }, /* @__PURE__ */ import_react18.default.createElement(Icon, { size: 18 }))));
  })), /* @__PURE__ */ import_react18.default.createElement("div", { className: "mt-3 rounded-[12px] border border-[#D1D5DB] bg-white px-4 py-3 text-sm text-gray-600" }, "Consumo acumulado hoy en el proyecto activo: ", /* @__PURE__ */ import_react18.default.createElement("span", { className: "font-semibold text-[#2F3A45]" }, summary.todayConsumption)));
}

// src/components/obra/MaterialSearchBar.jsx
var import_react19 = __toESM(require("react"), 1);
var import_lucide_react15 = require("lucide-react");
function MaterialSearchBar({ value, onChange }) {
  return /* @__PURE__ */ import_react19.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-4 shadow-sm" }, /* @__PURE__ */ import_react19.default.createElement("label", { className: "block text-sm font-semibold text-[#2F3A45]", htmlFor: "material-search" }, "Busque o seleccione un material"), /* @__PURE__ */ import_react19.default.createElement("div", { className: "mt-3 flex items-center gap-3 rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] px-3" }, /* @__PURE__ */ import_react19.default.createElement(import_lucide_react15.Search, { size: 16, className: "text-[#1F4E79]" }), /* @__PURE__ */ import_react19.default.createElement(
    "input",
    {
      id: "material-search",
      type: "text",
      value,
      onChange: (event) => onChange(event.target.value),
      placeholder: "Buscar material por c\xF3digo o nombre",
      className: "h-[44px] w-full bg-transparent text-sm text-[#2F3A45] outline-none placeholder:text-gray-400"
    }
  )));
}

// src/components/obra/MaterialStockCard.jsx
var import_react20 = __toESM(require("react"), 1);
var import_lucide_react16 = require("lucide-react");
var toneMap = {
  success: "border-[#16A34A]/15 bg-[#DCFCE7] text-[#166534]",
  warning: "border-[#F59E0B]/15 bg-[#FFF7ED] text-[#92400E]",
  danger: "border-[#DC2626]/15 bg-[#FEE2E2] text-[#991B1B]",
  neutral: "border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]"
};
function MaterialStockCard({ material }) {
  const tone = getMaterialAvailabilityTone(material);
  return /* @__PURE__ */ import_react20.default.createElement("section", { className: "rounded-[12px] border border-[#D1D5DB] bg-white p-5 shadow-sm" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "flex items-start justify-between gap-3" }, /* @__PURE__ */ import_react20.default.createElement("div", null, /* @__PURE__ */ import_react20.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, "Material seleccionado"), /* @__PURE__ */ import_react20.default.createElement("h2", { className: "mt-1 text-lg font-semibold text-[#2F3A45]" }, material.code, " \xB7 ", material.name)), /* @__PURE__ */ import_react20.default.createElement("div", { className: `inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}` }, /* @__PURE__ */ import_react20.default.createElement(import_lucide_react16.TriangleAlert, { size: 14 }), tone === "danger" ? "Sin stock" : tone === "warning" ? "Stock cr\xEDtico" : "Disponible")), /* @__PURE__ */ import_react20.default.createElement("div", { className: "mt-4 grid gap-3 sm:grid-cols-3" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4" }, /* @__PURE__ */ import_react20.default.createElement("p", { className: "text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, "Stock disponible"), /* @__PURE__ */ import_react20.default.createElement("p", { className: "mt-2 text-2xl font-semibold text-[#2F3A45]" }, formatConsumptionQuantity(material.availableQuantity), " ", material.unit)), /* @__PURE__ */ import_react20.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, /* @__PURE__ */ import_react20.default.createElement(import_lucide_react16.Boxes, { size: 14, className: "text-[#1F4E79]" }), " Umbral m\xEDnimo"), /* @__PURE__ */ import_react20.default.createElement("p", { className: "mt-2 text-sm font-semibold text-[#2F3A45]" }, formatConsumptionQuantity(material.minimumThreshold), " ", material.unit)), /* @__PURE__ */ import_react20.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4" }, /* @__PURE__ */ import_react20.default.createElement("div", { className: "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400" }, /* @__PURE__ */ import_react20.default.createElement(import_lucide_react16.MapPin, { size: 14, className: "text-[#1F4E79]" }), " Ubicaci\xF3n"), /* @__PURE__ */ import_react20.default.createElement("p", { className: "mt-2 text-sm font-semibold text-[#2F3A45]" }, material.warehouseLocation), /* @__PURE__ */ import_react20.default.createElement("p", { className: "mt-1 text-xs text-gray-500" }, "Actualizado ", formatConsumptionDate(material.lastUpdatedAt)))));
}

// src/components/obra/StockInsufficientModal.jsx
var import_react21 = __toESM(require("react"), 1);
function StockInsufficientModal({ material, quantity, validation, onClose }) {
  return /* @__PURE__ */ import_react21.default.createElement(
    ModalShell,
    {
      title: "La cantidad ingresada supera el stock disponible",
      description: "No es posible registrar este consumo con los datos actuales. Revise la cantidad para continuar.",
      onClose,
      widthClass: "max-w-lg"
    },
    /* @__PURE__ */ import_react21.default.createElement("div", { className: "rounded-[12px] border border-[#D1D5DB] bg-[#F7F9FC] p-4 text-sm text-[#2F3A45]" }, /* @__PURE__ */ import_react21.default.createElement("p", null, /* @__PURE__ */ import_react21.default.createElement("span", { className: "font-semibold" }, "Material:"), " ", material.code, " \xB7 ", material.name), /* @__PURE__ */ import_react21.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react21.default.createElement("span", { className: "font-semibold" }, "Cantidad ingresada:"), " ", formatConsumptionQuantity(quantity), " ", material.unit), /* @__PURE__ */ import_react21.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react21.default.createElement("span", { className: "font-semibold" }, "Stock disponible:"), " ", formatConsumptionQuantity(validation.availableQuantity), " ", material.unit), /* @__PURE__ */ import_react21.default.createElement("p", { className: "mt-2" }, /* @__PURE__ */ import_react21.default.createElement("span", { className: "font-semibold" }, "Diferencia:"), " ", formatConsumptionQuantity(validation.shortageQuantity), " ", material.unit)),
    /* @__PURE__ */ import_react21.default.createElement("div", { className: "mt-6 flex justify-end" }, /* @__PURE__ */ import_react21.default.createElement("button", { type: "button", onClick: onClose, className: "inline-flex h-[44px] items-center justify-center rounded-[12px] bg-[#1F4E79] px-4 text-sm font-medium text-white hover:bg-[#153a5c]" }, "Corregir cantidad"))
  );
}

// src/components/obra/StockValidationBanner.jsx
var import_react22 = __toESM(require("react"), 1);
var import_lucide_react17 = require("lucide-react");
var toneMap2 = {
  idle: {
    icon: import_lucide_react17.CircleAlert,
    className: "border-[#D1D5DB] bg-[#F7F9FC] text-[#2F3A45]"
  },
  error: {
    icon: import_lucide_react17.ShieldAlert,
    className: "border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]"
  },
  ok: {
    icon: import_lucide_react17.CircleCheckBig,
    className: "border-[#16A34A]/20 bg-[#DCFCE7] text-[#166534]"
  },
  warning: {
    icon: import_lucide_react17.CircleAlert,
    className: "border-[#F59E0B]/20 bg-[#FFF7ED] text-[#92400E]"
  },
  block: {
    icon: import_lucide_react17.ShieldAlert,
    className: "border-[#DC2626]/20 bg-[#FEE2E2] text-[#991B1B]"
  }
};
function StockValidationBanner({ validation }) {
  const meta = toneMap2[validation.status] ?? toneMap2.idle;
  const Icon = meta.icon;
  return /* @__PURE__ */ import_react22.default.createElement("section", { className: `rounded-[12px] border p-4 shadow-sm ${meta.className}` }, /* @__PURE__ */ import_react22.default.createElement("div", { className: "flex items-start gap-3" }, /* @__PURE__ */ import_react22.default.createElement("div", { className: "flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/70" }, /* @__PURE__ */ import_react22.default.createElement(Icon, { size: 18 })), /* @__PURE__ */ import_react22.default.createElement("div", null, /* @__PURE__ */ import_react22.default.createElement("p", { className: "text-sm font-semibold" }, "Validaci\xF3n de stock"), /* @__PURE__ */ import_react22.default.createElement("p", { className: "mt-1 text-sm" }, validation.message))));
}

// src/data/icaroData.js
var import_lucide_react18 = require("lucide-react");
var moduleCatalog = [
  {
    id: "administration",
    name: "Administraci\xF3n",
    description: "Gestione usuarios, permisos y par\xE1metros cr\xEDticos del sistema.",
    icon: import_lucide_react18.UserCog,
    helperText: "Mantenga la operaci\xF3n controlada por perfiles y accesos.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "projects",
    name: "Proyectos y parametrizaci\xF3n",
    description: "Configure obras, etapas y datos base para la operaci\xF3n diaria.",
    icon: import_lucide_react18.FolderCog,
    helperText: "Centralice par\xE1metros antes de abrir nuevos frentes de trabajo.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "rubros",
    name: "Rubros y carga masiva",
    description: "Administre rubros, plantillas y actualizaciones por lote.",
    icon: import_lucide_react18.Building2,
    helperText: "Evite reprocesos estandarizando cat\xE1logos y estructuras de costo.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "catalog",
    name: "Cat\xE1logo y materiales",
    description: "Mantenga referencias, unidades y materiales activos.",
    icon: import_lucide_react18.Boxes,
    helperText: "Actualice materiales cr\xEDticos antes de compras o recepci\xF3n.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "progress",
    name: "Avance de obra",
    description: "Registre hitos, rendimientos y novedades por frente.",
    icon: import_lucide_react18.HardHat,
    helperText: "Consolide avances diarios con soporte operativo claro.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "evidence",
    name: "Evidencia y sincronizaci\xF3n",
    description: "Consolide soportes, fotos y cargas pendientes desde campo.",
    icon: import_lucide_react18.Cable,
    helperText: "Priorice sincronizaciones pendientes para no perder contexto.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "consumption",
    name: "Consumo en obra",
    description: "Controle consumos, salidas y movimientos por proyecto.",
    icon: import_lucide_react18.PackageSearch,
    helperText: "Detecte variaciones antes de afectar inventario o costos.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "requirements",
    name: "Requerimientos de compra",
    description: "Genere y env\xEDe solicitudes a revisi\xF3n con trazabilidad.",
    icon: import_lucide_react18.ClipboardList,
    helperText: "Agrupe necesidades frecuentes y evite solicitudes incompletas.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "review",
    name: "Bandeja Gerencial",
    description: "Aprobaci\xF3n final de requerimientos (Sprint 6).",
    icon: import_lucide_react18.ClipboardCheck,
    helperText: "Apruebe o rechace requerimientos de compra.",
    statusLabel: "M\xF3dulo Principal"
  },
  {
    id: "accounting-review",
    name: "Requerimientos",
    description: "Ver y validar nuevos requerimientos de compras.",
    icon: import_lucide_react18.ClipboardCheck,
    helperText: "Valide requerimientos nuevos antes de que pasen a revisi\xF3n gerencial.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "change-orders",
    name: "\xD3rdenes de Cambio",
    description: "Gestione solicitudes de ampliaci\xF3n de cantidades por rubro.",
    icon: import_lucide_react18.ClipboardList,
    helperText: "Incremente el margen disponible de un rubro antes de reportar excedentes.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "inventory",
    name: "Bodega y Recepciones",
    description: "Recepcione materiales de requerimientos aprobados y controle el stock f\xEDsico por proyecto.",
    icon: import_lucide_react18.Warehouse,
    helperText: "Seleccione un proyecto y constate los requerimientos pendientes de recibir.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "inventory-movements",
    name: "Control de movimientos de inventario",
    description: "Consulte entradas, salidas y alertas de stock por proyecto.",
    icon: import_lucide_react18.ArrowLeftRight,
    helperText: "Rastree origen, cantidad y stock resultante de cada movimiento.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "accounting",
    name: "Consolidaci\xF3n y cierre contable",
    description: "Prepare cierres, conciliaciones y seguimiento del periodo.",
    icon: import_lucide_react18.ReceiptText,
    helperText: "Verifique soportes antes de cerrar periodo o emitir planillas.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "payroll",
    name: "Planillas y documentos de cobro",
    description: "Genere, consulte y descargue planillas PDF por proyecto y periodo.",
    icon: import_lucide_react18.FileSpreadsheet,
    helperText: "Controle elegibilidad, cola de generaci\xF3n y descarga documental.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "reports",
    name: "Reportes y dashboards",
    description: "Consulte indicadores operativos, contables y ejecutivos.",
    icon: import_lucide_react18.BarChart3,
    helperText: "Priorice tableros por rol para tomar decisiones m\xE1s r\xE1pido.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "audit",
    name: "Auditor\xEDa y trazabilidad",
    description: "Revise cambios cr\xEDticos, accesos y eventos del sistema.",
    icon: import_lucide_react18.ShieldCheck,
    helperText: "Rastree eventos sensibles antes de cerrar incidencias.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "system-validations",
    name: "Validaciones y control de acceso",
    description: "Consulte estados de validacion, sesion, permisos y errores controlados.",
    icon: import_lucide_react18.ShieldAlert,
    helperText: "Centralice respuestas consistentes para validaciones, bloqueos y accesos.",
    statusLabel: "Disponible para su rol"
  },
  {
    id: "technical-settings",
    name: "Configuraci\xF3n t\xE9cnica general",
    description: "Administre parametros globales, catalogos auxiliares y ajustes administrativos.",
    icon: import_lucide_react18.SlidersHorizontal,
    helperText: "Mantenga la configuracion central lista para validar, guardar y auditar.",
    statusLabel: "Disponible para su rol"
  }
];
function getModulesForUser(user) {
  return moduleCatalog.filter((moduleItem) => user.moduleIds.includes(moduleItem.id));
}

// src/hooks/useConsumptionState.js
var import_react23 = require("react");

// src/utils/stockValidationHelpers.js
function getStockValidation(material, quantityRaw) {
  if (!material) {
    return {
      status: "idle",
      message: "Seleccione un material para validar el stock disponible.",
      availableQuantity: 0,
      remainingQuantity: 0,
      requestedQuantity: 0
    };
  }
  if (!quantityRaw) {
    return {
      status: "idle",
      message: "Ingrese la cantidad consumida para validar el stock.",
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity: 0
    };
  }
  const requestedQuantity = Number(quantityRaw);
  if (Number.isNaN(requestedQuantity)) {
    return {
      status: "error",
      message: "La cantidad consumida debe ser num\xE9rica.",
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity: 0
    };
  }
  if (requestedQuantity <= 0) {
    return {
      status: "error",
      message: "La cantidad consumida debe ser mayor a cero.",
      availableQuantity: material.availableQuantity,
      remainingQuantity: material.availableQuantity,
      requestedQuantity
    };
  }
  if (requestedQuantity > material.availableQuantity) {
    return {
      status: "block",
      message: `La cantidad ingresada supera el stock disponible. Solo hay ${material.availableQuantity} ${material.unit} disponibles para este material.`,
      availableQuantity: material.availableQuantity,
      remainingQuantity: 0,
      requestedQuantity,
      shortageQuantity: requestedQuantity - material.availableQuantity
    };
  }
  const remainingQuantity = material.availableQuantity - requestedQuantity;
  const warningThreshold = Math.max(material.minimumThreshold ?? 0, material.availableQuantity * 0.2);
  if (remainingQuantity <= warningThreshold) {
    return {
      status: "warning",
      message: `El consumo puede registrarse, pero el stock quedar\xE1 en ${remainingQuantity} ${material.unit}. Revise si requiere reposici\xF3n.`,
      availableQuantity: material.availableQuantity,
      remainingQuantity,
      requestedQuantity
    };
  }
  return {
    status: "ok",
    message: `El stock es suficiente. Despu\xE9s del registro quedar\xE1n ${remainingQuantity} ${material.unit} disponibles.`,
    availableQuantity: material.availableQuantity,
    remainingQuantity,
    requestedQuantity
  };
}

// src/services/consumo.service.js
init_axios3();

// node_modules/uuid/dist/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}

// node_modules/uuid/dist/v4.js
function v4(options, buf, offset) {
  if (!buf && !options && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// node_modules/dexie/import-wrapper.mjs
var import_dexie = __toESM(require_dexie(), 1);
var DexieSymbol = /* @__PURE__ */ Symbol.for("Dexie");
var Dexie = globalThis[DexieSymbol] || (globalThis[DexieSymbol] = import_dexie.default);
if (import_dexie.default.semVer !== Dexie.semVer) {
  throw new Error(`Two different versions of Dexie loaded in the same app: ${import_dexie.default.semVer} and ${Dexie.semVer}`);
}
var {
  liveQuery,
  mergeRanges,
  rangesOverlap,
  RangeSet,
  cmp,
  Entity,
  PropModification,
  replacePrefix,
  add,
  remove,
  DexieYProvider
} = Dexie;
var import_wrapper_default = Dexie;

// src/db/database.js
var DB_NAME = "icaro_local_v1";
var db = new import_wrapper_default(DB_NAME);
db.version(2).stores({
  materiales_local: [
    "&id",
    "codigo",
    "categoria",
    "nombre",
    "activo",
    "sync_status",
    "server_updated_at"
  ].join(", "),
  inventario_local: [
    "[id_material+id_proyecto]",
    "id_material",
    "id_proyecto",
    "sync_status"
  ].join(", "),
  movimientos_inventario_local: [
    "&id",
    "id_material",
    "id_proyecto",
    "id_usuario",
    "tipo_movimiento",
    "sync_status",
    "local_created_at"
  ].join(", "),
  /**
   * Tabla: avances_local (Sprint 5)
   * Registros de avance de obra con evidencia fotográfica local.
   */
  avances_local: [
    "&id",
    // UUID local
    "idProyecto",
    "idRubro",
    "sync_status",
    // 'pending' | 'synced' | 'error'
    "local_created_at"
  ].join(", ")
});
db.version(3).stores({
  materiales_local: [
    "&id",
    "codigo",
    "categoria",
    "nombre",
    "activo",
    "sync_status",
    "server_updated_at"
  ].join(", "),
  inventario_local: [
    "[id_material+id_proyecto]",
    "id_material",
    "id_proyecto",
    "sync_status"
  ].join(", "),
  movimientos_inventario_local: [
    "&id",
    "id_material",
    "id_proyecto",
    "id_usuario",
    "tipo_movimiento",
    "sync_status",
    "local_created_at"
  ].join(", "),
  avances_local: [
    "&id",
    "idProyecto",
    "idRubro",
    "sync_status",
    "local_created_at"
  ].join(", "),
  /**
   * Tabla: consumos_local (Sprint 9)
   * Consumos en obra registrados offline por el Residente.
   * idempotencyKey garantiza que el servidor nunca procese dos veces el mismo consumo.
   */
  consumos_local: [
    "&id",
    // UUID local (idempotencyKey del cliente)
    "&idempotencyKey",
    // UUID único — enviado al servidor para prevenir duplicados
    "idProyecto",
    "idMaterial",
    "idUsuario",
    "sync_status",
    // 'pending' | 'synced' | 'error'
    "local_created_at"
  ].join(", ")
});
db.on("ready", () => {
  console.log("[ICARO DB] IndexedDB inicializada correctamente \u2192", DB_NAME);
});
db.on("blocked", () => {
  console.warn("[ICARO DB] Otra pesta\xF1a est\xE1 bloqueando la actualizaci\xF3n de la BD.");
});
var database_default = db;

// src/db/consumosLocalService.js
var guardarConsumoLocal = async ({
  idProyecto,
  idMaterial,
  idUsuario,
  cantidad,
  observacion = ""
}) => {
  const localId = v4_default();
  const idempotencyKey = v4_default();
  const record = {
    id: localId,
    idempotencyKey,
    // Sprint 9 HU-S9-4: La clave viaja al servidor para evitar duplicados
    idProyecto,
    idMaterial,
    idUsuario,
    cantidad: parseFloat(cantidad),
    observacion,
    sync_status: "pending",
    sync_attempts: 0,
    sync_error: null,
    server_id: null,
    local_created_at: (/* @__PURE__ */ new Date()).toISOString(),
    sync_timestamp: null
  };
  await database_default.consumos_local.add(record);
  return record;
};
var getConsumosPendientes = async () => {
  return database_default.consumos_local.where("sync_status").equals("pending").toArray();
};
var marcarConsumoSincronizado = async (localId, serverData) => {
  await database_default.consumos_local.update(localId, {
    sync_status: "synced",
    server_id: serverData?.id ?? null,
    sync_timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    sync_error: null
  });
};
var marcarConsumoError = async (localId, errorMsg, permanent = false) => {
  const updates = {
    sync_error: errorMsg,
    sync_timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  if (permanent) {
    updates.sync_status = "error";
  } else {
    updates.sync_status = "pending";
  }
  const current = await database_default.consumos_local.get(localId);
  if (current) {
    updates.sync_attempts = (current.sync_attempts || 0) + 1;
  }
  await database_default.consumos_local.update(localId, updates);
};
var contarConsumosPendientes = async () => {
  return database_default.consumos_local.where("sync_status").equals("pending").count();
};

// src/services/consumo.service.js
var isNetworkError = (error) => !navigator.onLine || error?.message?.includes("Failed to fetch") || error?.message?.includes("NetworkError") || error?.message?.includes("Load failed") || error?.code === "ERR_NETWORK";
var fetchMaterialesDisponibles = async (idProyecto, isOnline = true) => {
  if (!idProyecto) return { data: [], total: 0, fromCache: false };
  if (isOnline) {
    try {
      const { data } = await axios_default2.get(
        `/consumo/proyectos/${idProyecto}/materiales-disponibles`
      );
      return { data: data.data ?? [], total: data.total ?? 0, fromCache: false };
    } catch (error) {
      if (error.response && error.response.status < 500) throw error;
      console.warn("[consumo] materiales no disponibles online, usando mock/vac\xEDo:", error.message);
    }
  }
  return { data: [], total: 0, fromCache: true };
};
var registrarConsumoApi = async ({
  idProyecto,
  idMaterial,
  idUsuario,
  cantidad,
  observacion = "",
  isOnline = true
}) => {
  if (isOnline) {
    try {
      const { data } = await axios_default2.post(
        `/consumo/proyectos/${idProyecto}/consumir`,
        {
          idMaterial,
          cantidad,
          observacion
          // idempotencyKey omitido en modo online puro (sin retry previo)
          // El servidor asignará uno si no se proporciona
        }
      );
      return {
        success: true,
        offline: false,
        data: data.data,
        message: data.message,
        stockAnterior: data.stockAnterior,
        stockActual: data.stockActual,
        idempotente: data.idempotente ?? false
      };
    } catch (error) {
      if (error.response && !isNetworkError(error)) {
        const errData = error.response.data || {};
        return {
          success: false,
          offline: false,
          message: errData.error || `Error HTTP ${error.response.status}`,
          code: errData.codigo || null,
          detalle: errData.detalle || null
        };
      }
      if (!isNetworkError(error)) {
        console.error("[consumo] Error inesperado (no de red):", error);
        return {
          success: false,
          offline: false,
          message: `Error interno: ${error.message}`
        };
      }
    }
  }
  try {
    const localRecord = await guardarConsumoLocal({
      idProyecto,
      idMaterial,
      idUsuario,
      cantidad,
      observacion
    });
    const pendientes = await contarConsumosPendientes();
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register("sync-consumos");
      } catch (syncErr) {
        console.warn("[consumo] Background Sync no disponible:", syncErr.message);
      }
    }
    return {
      success: true,
      offline: true,
      localId: localRecord.id,
      pendientes,
      message: `\u{1F4F6} Sin conexi\xF3n: El consumo fue guardado localmente y se sincronizar\xE1 cuando haya red. (${pendientes} pendiente(s))`
    };
  } catch (offlineErr) {
    console.error("[consumo] Error al guardar offline:", offlineErr);
    return {
      success: false,
      offline: true,
      message: `Error al guardar offline: ${offlineErr.message}`
    };
  }
};

// src/db/avancesLocalService.js
var avancesLocalService = {
  /**
   * Guarda un avance localmente con su evidencia
   */
  async saveLocal(avanceData, evidenciaBlob) {
    const localId = v4_default();
    const record = {
      id: localId,
      ...avanceData,
      evidencia: evidenciaBlob,
      // IndexedDB soporta Blobs
      sync_status: "pending",
      local_created_at: (/* @__PURE__ */ new Date()).toISOString(),
      sync_error: null
    };
    await database_default.avances_local.add(record);
    return record;
  },
  /**
   * Obtiene todos los avances pendientes de sincronizar
   */
  async getPending() {
    return await database_default.avances_local.where("sync_status").equals("pending").toArray();
  },
  /**
   * Marca un avance como sincronizado
   */
  async markAsSynced(localId, serverResponse) {
    await database_default.avances_local.update(localId, {
      sync_status: "synced",
      server_id: serverResponse.id,
      sync_timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  },
  /**
   * Marca un avance con error de sincronización
   */
  async markAsError(localId, errorMsg) {
    await database_default.avances_local.update(localId, {
      sync_status: "error",
      sync_error: errorMsg
    });
  },
  /**
   * Obtiene el historial de avances locales (útil para la UI)
   */
  async getAllLocal() {
    return await database_default.avances_local.orderBy("local_created_at").reverse().toArray();
  }
};

// src/services/syncManager.js
var API_BASE = "/api/v1";
var MAX_RETRY_ATTEMPTS = 3;
var isSyncing = false;
var isPermanentError = (statusCode) => statusCode >= 400 && statusCode < 500 && statusCode !== 408 && statusCode !== 429;
var getAuthHeaders = (isFormData2 = false) => {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("icaro_token") || ""}`
  };
  if (!isFormData2) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};
var sincronizarConsumos = async ({ onProgress } = {}) => {
  const pendientes = await getConsumosPendientes();
  let synced = 0, failed = 0, permanent = 0;
  const errors = [];
  for (let i = 0; i < pendientes.length; i++) {
    const consumo = pendientes[i];
    onProgress?.("consumos", pendientes.length, i);
    if ((consumo.sync_attempts || 0) >= MAX_RETRY_ATTEMPTS) {
      await marcarConsumoError(
        consumo.id,
        `Super\xF3 el m\xE1ximo de ${MAX_RETRY_ATTEMPTS} intentos de sincronizaci\xF3n.`,
        true
        // permanente
      );
      permanent++;
      errors.push(`Consumo ${consumo.id}: m\xE1ximo de reintentos alcanzado.`);
      continue;
    }
    try {
      const response = await fetch(
        `${API_BASE}/consumo/proyectos/${consumo.idProyecto}/consumir`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            idMaterial: consumo.idMaterial,
            cantidad: consumo.cantidad,
            observacion: consumo.observacion || "",
            idempotencyKey: consumo.idempotencyKey
            // ← clave de idempotencia
          })
        }
      );
      if (response.ok || response.status === 200) {
        const data = await response.json().catch(() => ({}));
        await marcarConsumoSincronizado(consumo.id, data?.data || {});
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        const mensaje = err.error || `Error HTTP ${response.status}`;
        if (isPermanentError(response.status)) {
          await marcarConsumoError(consumo.id, mensaje, true);
          permanent++;
          errors.push(`Consumo rechazado: ${mensaje}`);
        } else {
          await marcarConsumoError(consumo.id, mensaje, false);
          failed++;
          errors.push(`Error temporal en consumo (${response.status}): se reintentar\xE1.`);
        }
      }
    } catch (networkErr) {
      await marcarConsumoError(consumo.id, networkErr.message, false);
      failed++;
      console.warn("[SyncManager] Sin red \u2014 sync consumos interrumpida:", networkErr.message);
      break;
    }
  }
  return { synced, failed, permanent, errors };
};
var sincronizarAvances = async ({ onProgress } = {}) => {
  const avancesPendientes = await avancesLocalService.getPending();
  let synced = 0, failed = 0, permanent = 0;
  const errors = [];
  for (let i = 0; i < avancesPendientes.length; i++) {
    const avance = avancesPendientes[i];
    onProgress?.("avances", avancesPendientes.length, i);
    try {
      const formData = new FormData();
      formData.append("idRubro", avance.idRubro);
      formData.append("idProyecto", avance.idProyecto);
      formData.append("cantidadEjecutada", avance.cantidadAvance);
      if (avance.notas) formData.append("observaciones", avance.notas);
      if (avance.fechaRegistro) formData.append("fechaRegistro", avance.fechaRegistro);
      if (avance.evidencia) formData.append("evidencia", avance.evidencia, "evidencia_sync.jpg");
      const response = await fetch(`${API_BASE}/avances`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("icaro_token") || ""}` },
        body: formData
      });
      if (response.ok) {
        const respData = await response.json();
        await avancesLocalService.markAsSynced(avance.id, respData.data || {});
        synced++;
      } else {
        const err = await response.json().catch(() => ({}));
        const mensaje = err.error || err.message || `Error HTTP ${response.status}`;
        if (isPermanentError(response.status)) {
          await avancesLocalService.markAsError(avance.id, mensaje);
          permanent++;
          errors.push(`Avance rechazado: ${mensaje}`);
        } else {
          failed++;
          errors.push(`Error temporal en avance (${response.status}): se reintentar\xE1.`);
        }
      }
    } catch (networkErr) {
      console.warn("[SyncManager] Sin red \u2014 sync avances interrumpida:", networkErr.message);
      failed++;
      break;
    }
  }
  return { synced, failed, permanent, errors };
};
var getPendingCounts = async () => {
  const [avancesPending, consumosPending] = await Promise.all([
    avancesLocalService.getPending().then((a) => a.length).catch(() => 0),
    getConsumosPendientes().then((c) => c.length).catch(() => 0)
  ]);
  return {
    avances: avancesPending,
    consumos: consumosPending,
    total: avancesPending + consumosPending
  };
};
var ejecutarSincronizacion = async ({
  onStart = null,
  onProgress = null,
  onComplete = null,
  onError = null
} = {}) => {
  if (isSyncing) {
    console.info("[SyncManager] Ya hay una sincronizaci\xF3n en curso. Ignorando nueva invocaci\xF3n.");
    return { synced: 0, failed: 0, permanent: 0, errors: ["Sincronizaci\xF3n ya en curso."], byType: {} };
  }
  isSyncing = true;
  onStart?.();
  const resumen = {
    synced: 0,
    failed: 0,
    permanent: 0,
    errors: [],
    byType: {}
  };
  try {
    const resConsumos = await sincronizarConsumos({ onProgress });
    resumen.synced += resConsumos.synced;
    resumen.failed += resConsumos.failed;
    resumen.permanent += resConsumos.permanent;
    resumen.errors.push(...resConsumos.errors);
    resumen.byType.consumos = resConsumos;
    const resAvances = await sincronizarAvances({ onProgress });
    resumen.synced += resAvances.synced;
    resumen.failed += resAvances.failed;
    resumen.permanent += resAvances.permanent;
    resumen.errors.push(...resAvances.errors);
    resumen.byType.avances = resAvances;
    console.info(
      `[SyncManager] Completado \u2014 Enviados: ${resumen.synced}, Temporales: ${resumen.failed}, Permanentes: ${resumen.permanent}`
    );
    onComplete?.(resumen);
    return resumen;
  } catch (fatalError) {
    console.error("[SyncManager] Error fatal durante sincronizaci\xF3n:", fatalError);
    onError?.(fatalError);
    resumen.errors.push(`Error fatal: ${fatalError.message}`);
    return resumen;
  } finally {
    isSyncing = false;
  }
};
var registrarSyncAutomatico = (opciones = {}) => {
  const handleOnline = () => {
    console.info("[SyncManager] Conexi\xF3n restaurada \u2014 iniciando sincronizaci\xF3n autom\xE1tica.");
    ejecutarSincronizacion(opciones);
  };
  window.addEventListener("online", handleOnline);
  if (navigator.onLine) {
    getPendingCounts().then(({ total }) => {
      if (total > 0) {
        console.info(`[SyncManager] ${total} \xEDtem(s) pendiente(s) \u2014 sincronizando al iniciar.`);
        ejecutarSincronizacion(opciones);
      }
    }).catch(() => {
    });
  }
  return () => {
    window.removeEventListener("online", handleOnline);
  };
};

// src/hooks/useConsumptionState.js
var adaptarMaterialServidor = (item) => ({
  id: item.idMaterial || item.id,
  code: item.material?.codigo ?? "",
  name: item.material?.nombre ?? "",
  unit: item.material?.unidad ?? "",
  availableQuantity: parseFloat(item.stockDisponible ?? 0),
  active: item.material?.activo ?? true,
  minimumThreshold: 0,
  warehouseLocation: "",
  lastUpdatedAt: item.ultimaActualizacion ?? null,
  syncStatus: "synced",
  idMaterial: item.idMaterial || item.id
});
function useConsumptionState(currentUser) {
  const [loadStatus, setLoadStatus] = (0, import_react23.useState)("loading");
  const [retryCount, setRetryCount] = (0, import_react23.useState)(0);
  const [assignedProjects, setAssignedProjects] = (0, import_react23.useState)([]);
  const [currentProjectId, setCurrentProjectId] = (0, import_react23.useState)("");
  const [materialesByProject, setMaterialesByProject] = (0, import_react23.useState)({});
  const [loadingMateriales, setLoadingMateriales] = (0, import_react23.useState)(false);
  const [materialQuery, setMaterialQuery] = (0, import_react23.useState)("");
  const [selectedMaterialId, setSelectedMaterialId] = (0, import_react23.useState)("");
  const [values, setValues] = (0, import_react23.useState)(defaultConsumptionFormValues);
  const [errors, setErrors] = (0, import_react23.useState)({});
  const [submitStatus, setSubmitStatus] = (0, import_react23.useState)("idle");
  const [submitError, setSubmitError] = (0, import_react23.useState)(null);
  const [lastRecord, setLastRecord] = (0, import_react23.useState)(null);
  const [activeOverlay, setActiveOverlay] = (0, import_react23.useState)(null);
  const [isOffline, setIsOffline] = (0, import_react23.useState)(!navigator.onLine);
  const [consumptionRecords, setConsumptionRecords] = (0, import_react23.useState)([]);
  const [pendingSyncCount, setPendingSyncCount] = (0, import_react23.useState)(0);
  const cleanupSyncRef = (0, import_react23.useRef)(null);
  const activeMaterials = (0, import_react23.useMemo)(
    () => (materialesByProject[currentProjectId] ?? []).filter((m) => m.active),
    [materialesByProject, currentProjectId]
  );
  const filteredMaterials = (0, import_react23.useMemo)(
    () => filterMaterials(activeMaterials, materialQuery),
    [activeMaterials, materialQuery]
  );
  const selectedMaterial = (0, import_react23.useMemo)(
    () => getSelectedMaterial(activeMaterials, selectedMaterialId),
    [activeMaterials, selectedMaterialId]
  );
  const currentProject = (0, import_react23.useMemo)(
    () => getSelectedProject(assignedProjects, currentProjectId),
    [assignedProjects, currentProjectId]
  );
  const stockValidation = (0, import_react23.useMemo)(
    () => getStockValidation(selectedMaterial, values.quantity),
    [selectedMaterial, values.quantity]
  );
  const hasDraft = hasConsumptionDraft(values, selectedMaterialId);
  const consumptionSummary = (0, import_react23.useMemo)(
    () => ({
      assignedProjects: assignedProjects.length,
      availableMaterials: activeMaterials.length,
      pendingSync: pendingSyncCount,
      todayConsumption: "\u2014"
    }),
    [assignedProjects.length, activeMaterials.length, pendingSyncCount]
  );
  (0, import_react23.useEffect)(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
  (0, import_react23.useEffect)(() => {
    if (isOffline) {
      if (cleanupSyncRef.current) cleanupSyncRef.current();
      return;
    }
    const intervalId = registrarSyncAutomatico(async () => {
      const resumen = await ejecutarSincronizacion();
      if (resumen.synced > 0) {
        if (currentProjectId) cargarMateriales(currentProjectId);
        actualizarPendientes();
      }
    });
    cleanupSyncRef.current = () => clearInterval(intervalId);
    return () => clearInterval(intervalId);
  }, [isOffline, currentProjectId]);
  const actualizarPendientes = async () => {
    try {
      const { total } = await getPendingCounts();
      setPendingSyncCount(total);
    } catch {
    }
  };
  (0, import_react23.useEffect)(() => {
    let cancelled = false;
    const cargarProyectos = async () => {
      setLoadStatus("loading");
      try {
        if (!navigator.onLine) {
          setLoadStatus("error");
          return;
        }
        const projectsService = await Promise.resolve().then(() => (init_projects_service(), projects_service_exports));
        const resp = await projectsService.fetchProyectosAsignados?.();
        if (cancelled) return;
        if (resp?.data?.length > 0) {
          const proyectosAdaptados = resp.data.map((p) => ({
            id: p.id,
            code: p.codigo,
            name: p.nombre,
            startDate: p.fechaInicio,
            endDate: p.fechaFinPrevista,
            accessMode: "full"
          }));
          setAssignedProjects(proyectosAdaptados);
          setCurrentProjectId(proyectosAdaptados[0]?.id ?? "");
        } else {
          setAssignedProjects([]);
        }
        setLoadStatus("ready");
      } catch (error) {
        if (cancelled) return;
        try {
          const { getAssignedProjectsForUser: getAssignedProjectsForUser2 } = await Promise.resolve().then(() => (init_mockAssignedProjects(), mockAssignedProjects_exports));
          const proyectosMock = getAssignedProjectsForUser2(currentUser.email);
          if (!cancelled) {
            setAssignedProjects(proyectosMock);
            setCurrentProjectId(proyectosMock[0]?.id ?? "");
            setLoadStatus("ready");
          }
        } catch {
          if (!cancelled) setLoadStatus("error");
        }
      }
      actualizarPendientes();
    };
    cargarProyectos();
    return () => {
      cancelled = true;
    };
  }, [retryCount, currentUser.email]);
  const cargarMateriales = async (idProyecto) => {
    if (!idProyecto) return;
    setLoadingMateriales(true);
    try {
      const resp = await fetchMaterialesDisponibles(idProyecto, navigator.onLine);
      const materialesAdaptados = (resp.data ?? []).map(adaptarMaterialServidor);
      setMaterialesByProject((prev) => ({
        ...prev,
        [idProyecto]: materialesAdaptados
      }));
    } catch (error) {
      const { mockInventoryByProject: mockInventoryByProject2 } = await Promise.resolve().then(() => (init_mockInventoryByProject(), mockInventoryByProject_exports));
      if (mockInventoryByProject2[idProyecto]) {
        setMaterialesByProject((prev) => ({
          ...prev,
          [idProyecto]: mockInventoryByProject2[idProyecto]
        }));
      } else {
        setMaterialesByProject((prev) => ({ ...prev, [idProyecto]: [] }));
      }
    } finally {
      setLoadingMateriales(false);
    }
  };
  (0, import_react23.useEffect)(() => {
    if (currentProjectId) {
      cargarMateriales(currentProjectId);
      setSelectedMaterialId("");
      setMaterialQuery("");
    }
  }, [currentProjectId]);
  (0, import_react23.useEffect)(() => {
    if (!activeMaterials.length) {
      setSelectedMaterialId("");
      return;
    }
    if (activeMaterials.length === 1) {
      setSelectedMaterialId(activeMaterials[0].id);
      return;
    }
    if (!activeMaterials.some((m) => m.id === selectedMaterialId)) {
      setSelectedMaterialId("");
    }
  }, [activeMaterials, selectedMaterialId]);
  const resetDraft = () => {
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus("idle");
    setSubmitError(null);
  };
  const handleChangeValue = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: void 0 }));
    if (submitStatus !== "idle") {
      setSubmitStatus("idle");
      setSubmitError(null);
    }
  };
  const handleConfirmProject = (nextProjectId) => {
    setCurrentProjectId(nextProjectId);
    setSelectedMaterialId("");
    setMaterialQuery("");
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitStatus("idle");
    setSubmitError(null);
    setActiveOverlay(null);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateConsumptionForm({
      projectId: currentProjectId,
      materialId: selectedMaterialId,
      quantity: values.quantity
    });
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    if (stockValidation.status === "block") {
      setActiveOverlay({ type: "stock-insufficient" });
      return;
    }
    setSubmitStatus("submitting");
    setSubmitError(null);
    try {
      const resultado = await registrarConsumoApi({
        idProyecto: currentProjectId,
        idMaterial: selectedMaterialId,
        idUsuario: currentUser.id,
        cantidad: Number(values.quantity),
        observacion: values.observations?.trim() || "",
        isOnline: navigator.onLine
      });
      if (!resultado.success) {
        setSubmitError({ message: resultado.message, code: resultado.code, detalle: resultado.detalle });
        setSubmitStatus("error");
        return;
      }
      const nextRecord = createConsumptionPayload({ project: currentProject, material: selectedMaterial, values });
      if (resultado.offline) {
        nextRecord.syncStatus = "pending";
        nextRecord.offline = true;
      } else {
        nextRecord.syncStatus = "synced";
        nextRecord.serverId = resultado.data?.id;
        nextRecord.stockActual = resultado.stockActual;
      }
      setConsumptionRecords((prev) => [nextRecord, ...prev]);
      setLastRecord(nextRecord);
      if (resultado.stockActual !== void 0) {
        setMaterialesByProject((prev) => ({
          ...prev,
          [currentProjectId]: (prev[currentProjectId] ?? []).map(
            (m) => m.id === selectedMaterialId ? { ...m, availableQuantity: resultado.stockActual } : m
          )
        }));
      }
      actualizarPendientes();
      setValues(clearConsumptionForm());
      setErrors({});
      setSubmitStatus("success");
    } catch (fatalError) {
      setSubmitError({ message: "Error inesperado. Reintente la operaci\xF3n." });
      setSubmitStatus("error");
    }
  };
  const handleRegisterAnother = () => {
    setSubmitStatus("idle");
    setValues(clearConsumptionForm());
    setErrors({});
    setSubmitError(null);
    if (currentProjectId) cargarMateriales(currentProjectId);
  };
  const handleManualSync = async () => {
    const resumen = await ejecutarSincronizacion();
    if (resumen.synced > 0 && currentProjectId) {
      cargarMateriales(currentProjectId);
    }
    actualizarPendientes();
  };
  return {
    state: {
      loadStatus,
      retryCount,
      assignedProjects,
      currentProjectId,
      loadingMateriales,
      materialQuery,
      selectedMaterialId,
      values,
      errors,
      submitStatus,
      submitError,
      lastRecord,
      activeOverlay,
      isOffline,
      pendingSyncCount,
      activeMaterials,
      filteredMaterials,
      selectedMaterial,
      currentProject,
      stockValidation,
      hasDraft,
      consumptionSummary
    },
    actions: {
      setMobileNavOpen: () => {
      },
      // Handled in component
      setRetryCount,
      setMaterialQuery,
      setSelectedMaterialId,
      handleChangeValue,
      resetDraft,
      handleConfirmProject,
      handleSubmit,
      handleRegisterAnother,
      handleManualSync,
      setActiveOverlay,
      setSubmitStatus,
      setSubmitError
    }
  };
}

// src/views/obra/MobileConsumptionView.jsx
function MobileConsumptionView({
  currentUser,
  isRestricted = false,
  onGoHome,
  onOpenProfile,
  onLogout,
  onOpenModule
}) {
  const [mobileNavOpen, setMobileNavOpen] = import_react24.default.useState(false);
  const { state, actions } = useConsumptionState(currentUser);
  const {
    loadStatus,
    assignedProjects,
    currentProjectId,
    loadingMateriales,
    materialQuery,
    selectedMaterialId,
    values,
    errors,
    submitStatus,
    submitError,
    lastRecord,
    activeOverlay,
    isOffline,
    pendingSyncCount,
    activeMaterials,
    filteredMaterials,
    selectedMaterial,
    currentProject,
    stockValidation,
    hasDraft,
    consumptionSummary
  } = state;
  const {
    setRetryCount,
    setMaterialQuery,
    setSelectedMaterialId,
    handleChangeValue,
    resetDraft,
    handleConfirmProject,
    handleSubmit,
    handleRegisterAnother,
    handleManualSync,
    setActiveOverlay,
    setSubmitStatus,
    setSubmitError
  } = actions;
  const modules = getModulesForUser(currentUser);
  const isResident = currentUser.roleName === "Residente" && !isRestricted;
  return /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex min-h-screen flex-col bg-gray-50 font-sans" }, /* @__PURE__ */ import_react24.default.createElement(
    SidebarNavigation,
    {
      isOpen: mobileNavOpen,
      onClose: () => setMobileNavOpen(false),
      currentUser,
      modules,
      onOpenModule,
      onOpenProfile,
      onLogout,
      onGoHome
    }
  ), /* @__PURE__ */ import_react24.default.createElement(
    AppHeader,
    {
      onMenuClick: () => setMobileNavOpen(true),
      title: "Consumo en Obra",
      rightAction: isOffline && /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600" }, /* @__PURE__ */ import_react24.default.createElement(import_lucide_react19.WifiOff, { size: 18 }))
    }
  ), /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex flex-1 pt-16 lg:pl-64 lg:pt-0" }, /* @__PURE__ */ import_react24.default.createElement("main", { className: "w-full" }, /* @__PURE__ */ import_react24.default.createElement("div", { className: "mx-auto w-full max-w-lg space-y-4 p-4 pb-24 lg:max-w-3xl lg:p-6" }, isRestricted && /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex items-start gap-3 rounded-[10px] border border-amber-200 bg-amber-50 p-4" }, /* @__PURE__ */ import_react24.default.createElement(import_lucide_react19.ShieldAlert, { size: 20, className: "shrink-0 text-amber-600" }), /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex-1 text-sm text-amber-800" }, "Modo de acceso restringido activo. Solo puede consultar informaci\xF3n.")), isOffline && /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex flex-col gap-2 rounded-[10px] border border-red-200 bg-red-50 p-4" }, /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ import_react24.default.createElement(import_lucide_react19.WifiOff, { size: 20, className: "shrink-0 text-red-600" }), /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-sm font-semibold text-red-800" }, "Trabajando sin conexi\xF3n")), !isRestricted && /* @__PURE__ */ import_react24.default.createElement("p", { className: "pl-8 text-xs text-red-700" }, "Sus consumos se guardar\xE1n localmente y se sincronizar\xE1n autom\xE1ticamente cuando recupere la conexi\xF3n.")), !isOffline && pendingSyncCount > 0 && /* @__PURE__ */ import_react24.default.createElement(
    "div",
    {
      id: "pending-sync-banner",
      className: "flex items-center gap-3 rounded-[10px] border border-blue-200 bg-blue-50 px-4 py-3"
    },
    /* @__PURE__ */ import_react24.default.createElement(import_lucide_react19.RefreshCw, { size: 18, className: "shrink-0 text-blue-600" }),
    /* @__PURE__ */ import_react24.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react24.default.createElement("span", { className: "text-sm font-medium text-blue-800" }, pendingSyncCount, " consumo(s) pendiente(s) de sincronizar")),
    /* @__PURE__ */ import_react24.default.createElement(
      "button",
      {
        onClick: handleManualSync,
        className: "shrink-0 rounded-[8px] bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-800 hover:bg-blue-200"
      },
      "Sincronizar ahora"
    )
  ), submitStatus === "error" && submitError && /* @__PURE__ */ import_react24.default.createElement(
    "div",
    {
      id: "security-error-banner",
      className: `rounded-[10px] border px-4 py-3 ${submitError.code === "PROYECTO_NO_AUTORIZADO" ? "border-red-200 bg-red-50" : submitError.code === "CONFLICTO_CONCURRENCIA" ? "border-orange-200 bg-orange-50" : "border-red-200 bg-red-50"}`
    },
    /* @__PURE__ */ import_react24.default.createElement("p", { className: "text-sm font-medium text-red-800" }, submitError.message),
    submitError.code && /* @__PURE__ */ import_react24.default.createElement("p", { className: "mt-1 text-xs text-red-600" }, "C\xF3digo: ", submitError.code),
    submitError.detalle && /* @__PURE__ */ import_react24.default.createElement("p", { className: "mt-1 text-xs text-red-600" }, "Disponible: ", submitError.detalle.stockDisponible, " \u2014 Solicitado: ", submitError.detalle.cantidadSolicitada),
    /* @__PURE__ */ import_react24.default.createElement(
      "button",
      {
        onClick: () => {
          setSubmitStatus("idle");
          setSubmitError(null);
        },
        className: "mt-2 text-xs text-red-700 underline hover:text-red-900"
      },
      "Cerrar"
    )
  ), loadStatus === "loading" ? /* @__PURE__ */ import_react24.default.createElement(ConsumptionLoadingState, null) : null, loadStatus === "error" ? /* @__PURE__ */ import_react24.default.createElement(
    ConsumptionErrorState,
    {
      title: "No fue posible cargar el consumo en obra",
      description: "Revise la conexi\xF3n o reintente la carga para recuperar proyectos, materiales y stock disponible.",
      onRetry: () => setRetryCount((v) => v + 1),
      onGoHome
    }
  ) : null, loadStatus === "ready" ? /* @__PURE__ */ import_react24.default.createElement(import_react24.default.Fragment, null, assignedProjects.length ? /* @__PURE__ */ import_react24.default.createElement(
    ConsumptionContextHeader,
    {
      currentProject,
      hasMultipleProjects: assignedProjects.length > 1,
      totalAssignedProjects: assignedProjects.length,
      pendingSyncCount: consumptionSummary.pendingSync,
      onGoHome,
      onOpenProjectModal: () => setActiveOverlay({ type: "change-project" })
    }
  ) : /* @__PURE__ */ import_react24.default.createElement(
    EmptyState,
    {
      title: "No tiene proyectos asignados en este momento",
      description: "A\xFAn no hay proyectos disponibles para registrar consumo. Vuelva al panel principal para continuar.",
      actionLabel: "Volver al panel principal",
      onAction: onGoHome
    }
  ), assignedProjects.length ? /* @__PURE__ */ import_react24.default.createElement(ConsumptionSummaryCard, { summary: consumptionSummary }) : null, assignedProjects.length && !activeMaterials.length && !loadingMateriales ? /* @__PURE__ */ import_react24.default.createElement(
    EmptyState,
    {
      title: "No hay materiales disponibles para este proyecto",
      description: "No hay materiales con stock disponible en el inventario de este proyecto. Cambie de proyecto o contacte al bodeguero.",
      actionLabel: assignedProjects.length > 1 ? "Cambiar proyecto" : "Volver al panel principal",
      onAction: assignedProjects.length > 1 ? () => setActiveOverlay({ type: "change-project" }) : onGoHome
    }
  ) : null, loadingMateriales ? /* @__PURE__ */ import_react24.default.createElement("div", { className: "rounded-[12px] bg-white p-6 shadow-sm text-center text-sm text-gray-500" }, "Cargando materiales disponibles...") : null, assignedProjects.length && activeMaterials.length ? /* @__PURE__ */ import_react24.default.createElement(import_react24.default.Fragment, null, /* @__PURE__ */ import_react24.default.createElement(MaterialSearchBar, { value: materialQuery, onChange: setMaterialQuery }), /* @__PURE__ */ import_react24.default.createElement(
    AvailableMaterialsList,
    {
      materials: filteredMaterials,
      selectedMaterialId,
      onSelect: setSelectedMaterialId,
      query: materialQuery
    }
  ), selectedMaterial ? /* @__PURE__ */ import_react24.default.createElement(MaterialStockCard, { material: selectedMaterial }) : /* @__PURE__ */ import_react24.default.createElement(
    EmptyState,
    {
      title: "Seleccione un material para continuar",
      description: "El proyecto ya est\xE1 definido. Elija un material disponible para revisar su stock y registrar el consumo."
    }
  ), hasDraft && submitStatus !== "success" ? /* @__PURE__ */ import_react24.default.createElement(
    ConsumptionDraftPanel,
    {
      selectedMaterial,
      values,
      onReset: resetDraft
    }
  ) : null, selectedMaterial ? /* @__PURE__ */ import_react24.default.createElement(StockValidationBanner, { validation: stockValidation }) : null, submitStatus === "success" && lastRecord ? /* @__PURE__ */ import_react24.default.createElement(
    ConsumptionSuccessState,
    {
      record: lastRecord,
      onRegisterAnother: handleRegisterAnother,
      onGoHome
    }
  ) : /* @__PURE__ */ import_react24.default.createElement(
    ConsumptionForm,
    {
      values,
      errors,
      selectedMaterial,
      isSubmitting: submitStatus === "submitting",
      onChange: handleChangeValue,
      onSubmit: handleSubmit,
      onReset: resetDraft
    }
  )) : null) : null))), activeOverlay?.type === "change-project" ? /* @__PURE__ */ import_react24.default.createElement(
    ChangeProjectConsumptionModal,
    {
      projects: assignedProjects,
      currentProjectId,
      hasDraft,
      onCancel: () => setActiveOverlay(null),
      onConfirm: handleConfirmProject
    }
  ) : null, activeOverlay?.type === "stock-insufficient" && selectedMaterial ? /* @__PURE__ */ import_react24.default.createElement(
    StockInsufficientModal,
    {
      material: selectedMaterial,
      quantity: Number(values.quantity || 0),
      validation: stockValidation,
      onClose: () => setActiveOverlay(null)
    }
  ) : null);
}
