webpackJsonp([1,3],{

/***/ "./node_modules/reflect-metadata/Reflect.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {
/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    "use strict";
    var hasOwn = Object.prototype.hasOwnProperty;
    // feature test for Object.create support
    var supportsCreate = typeof Object.create === "function";
    // feature test for __proto__ support
    var supportsProto = { __proto__: [] } instanceof Array;
    // feature test for Symbol support
    var supportsSymbol = typeof Symbol === "function";
    var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
    var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
    // create an object in dictionary mode (a.k.a. "slow" mode in v8)
    var createDictionary = supportsCreate ? function () { return MakeDictionary(Object.create(null)); } :
        supportsProto ? function () { return MakeDictionary({ __proto__: null }); } :
            function () { return MakeDictionary({}); };
    var HashMap;
    (function (HashMap) {
        var downLevel = !supportsCreate && !supportsProto;
        HashMap.has = downLevel
            ? function (map, key) { return hasOwn.call(map, key); }
            : function (map, key) { return key in map; };
        HashMap.get = downLevel
            ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
            : function (map, key) { return map[key]; };
    })(HashMap || (HashMap = {}));
    // Load global or shim versions of Map, Set, and WeakMap
    var functionPrototype = Object.getPrototypeOf(Function);
    var _Map = typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
    var _Set = typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
    var _WeakMap = typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
    // [[Metadata]] internal slot
    var Metadata = new _WeakMap();
    /**
      * Applies a set of decorators to a property of a target object.
      * @param decorators An array of decorators.
      * @param target The target object.
      * @param targetKey (Optional) The property key to decorate.
      * @param targetDescriptor (Optional) The property descriptor for the target key
      * @remarks Decorators are applied in reverse order.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Example = Reflect.decorate(decoratorsArray, Example);
      *
      *     // property (on constructor)
      *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Object.defineProperty(Example, "staticMethod",
      *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
      *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
      *
      *     // method (on prototype)
      *     Object.defineProperty(Example.prototype, "method",
      *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
      *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
      *
      */
    function decorate(decorators, target, targetKey, targetDescriptor) {
        if (!IsUndefined(targetKey)) {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsObject(target))
                throw new TypeError();
            if (!IsObject(targetDescriptor) && !IsUndefined(targetDescriptor) && !IsNull(targetDescriptor))
                throw new TypeError();
            if (IsNull(targetDescriptor))
                targetDescriptor = undefined;
            targetKey = ToPropertyKey(targetKey);
            return DecorateProperty(decorators, target, targetKey, targetDescriptor);
        }
        else {
            if (!IsArray(decorators))
                throw new TypeError();
            if (!IsConstructor(target))
                throw new TypeError();
            return DecorateConstructor(decorators, target);
        }
    }
    Reflect.decorate = decorate;
    /**
      * A default metadata decorator factory that can be used on a class, class member, or parameter.
      * @param metadataKey The key for the metadata entry.
      * @param metadataValue The value for the metadata entry.
      * @returns A decorator function.
      * @remarks
      * If `metadataKey` is already defined for the target and target key, the
      * metadataValue for that key will be overwritten.
      * @example
      *
      *     // constructor
      *     @Reflect.metadata(key, value)
      *     class Example {
      *     }
      *
      *     // property (on constructor, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticProperty;
      *     }
      *
      *     // property (on prototype, TypeScript only)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         property;
      *     }
      *
      *     // method (on constructor)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         static staticMethod() { }
      *     }
      *
      *     // method (on prototype)
      *     class Example {
      *         @Reflect.metadata(key, value)
      *         method() { }
      *     }
      *
      */
    function metadata(metadataKey, metadataValue) {
        function decorator(target, targetKey) {
            if (!IsUndefined(targetKey)) {
                if (!IsObject(target))
                    throw new TypeError();
                targetKey = ToPropertyKey(targetKey);
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
            }
            else {
                if (!IsConstructor(target))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, /*targetKey*/ undefined);
            }
        }
        return decorator;
    }
    Reflect.metadata = metadata;
    /**
      * Define a unique metadata entry on the target.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param metadataValue A value that contains attached metadata.
      * @param target The target object on which to define metadata.
      * @param targetKey (Optional) The property key for the target.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     Reflect.defineMetadata("custom:annotation", options, Example);
      *
      *     // property (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
      *
      *     // property (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
      *
      *     // method (on constructor)
      *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
      *
      *     // method (on prototype)
      *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
      *
      *     // decorator factory as metadata-producing annotation.
      *     function MyAnnotation(options): Decorator {
      *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
      *     }
      *
      */
    function defineMetadata(metadataKey, metadataValue, target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, targetKey);
    }
    Reflect.defineMetadata = defineMetadata;
    /**
      * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryHasMetadata(metadataKey, target, targetKey);
    }
    Reflect.hasMetadata = hasMetadata;
    /**
      * Gets a value indicating whether the target object has the provided metadata key defined.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function hasOwnMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryHasOwnMetadata(metadataKey, target, targetKey);
    }
    Reflect.hasOwnMetadata = hasOwnMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryGetMetadata(metadataKey, target, targetKey);
    }
    Reflect.getMetadata = getMetadata;
    /**
      * Gets the metadata value for the provided metadata key on the target object.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function getOwnMetadata(metadataKey, target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryGetOwnMetadata(metadataKey, target, targetKey);
    }
    Reflect.getOwnMetadata = getOwnMetadata;
    /**
      * Gets the metadata keys defined on the target object or its prototype chain.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getMetadataKeys(Example.prototype, "method");
      *
      */
    function getMetadataKeys(target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryMetadataKeys(target, targetKey);
    }
    Reflect.getMetadataKeys = getMetadataKeys;
    /**
      * Gets the unique metadata keys defined on the target object.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns An array of unique metadata keys.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.getOwnMetadataKeys(Example);
      *
      *     // property (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
      *
      */
    function getOwnMetadataKeys(target, targetKey) {
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        return OrdinaryOwnMetadataKeys(target, targetKey);
    }
    Reflect.getOwnMetadataKeys = getOwnMetadataKeys;
    /**
      * Deletes the metadata entry from the target object with the provided key.
      * @param metadataKey A key used to store and retrieve metadata.
      * @param target The target object on which the metadata is defined.
      * @param targetKey (Optional) The property key for the target.
      * @returns `true` if the metadata entry was found and deleted; otherwise, false.
      * @example
      *
      *     class Example {
      *         // property declarations are not part of ES6, though they are valid in TypeScript:
      *         // static staticProperty;
      *         // property;
      *
      *         constructor(p) { }
      *         static staticMethod(p) { }
      *         method(p) { }
      *     }
      *
      *     // constructor
      *     result = Reflect.deleteMetadata("custom:annotation", Example);
      *
      *     // property (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
      *
      *     // property (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
      *
      *     // method (on constructor)
      *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
      *
      *     // method (on prototype)
      *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
      *
      */
    function deleteMetadata(metadataKey, target, targetKey) {
        // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#deletemetadata-metadatakey-p-
        if (!IsObject(target))
            throw new TypeError();
        if (!IsUndefined(targetKey))
            targetKey = ToPropertyKey(targetKey);
        var metadataMap = GetOrCreateMetadataMap(target, targetKey, /*create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        if (!metadataMap.delete(metadataKey))
            return false;
        if (metadataMap.size > 0)
            return true;
        var targetMetadata = Metadata.get(target);
        targetMetadata.delete(targetKey);
        if (targetMetadata.size > 0)
            return true;
        Metadata.delete(target);
        return true;
    }
    Reflect.deleteMetadata = deleteMetadata;
    function DecorateConstructor(decorators, target) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsConstructor(decorated))
                    throw new TypeError();
                target = decorated;
            }
        }
        return target;
    }
    function DecorateProperty(decorators, target, propertyKey, descriptor) {
        for (var i = decorators.length - 1; i >= 0; --i) {
            var decorator = decorators[i];
            var decorated = decorator(target, propertyKey, descriptor);
            if (!IsUndefined(decorated) && !IsNull(decorated)) {
                if (!IsObject(decorated))
                    throw new TypeError();
                descriptor = decorated;
            }
        }
        return descriptor;
    }
    function GetOrCreateMetadataMap(O, P, Create) {
        var targetMetadata = Metadata.get(O);
        if (IsUndefined(targetMetadata)) {
            if (!Create)
                return undefined;
            targetMetadata = new _Map();
            Metadata.set(O, targetMetadata);
        }
        var metadataMap = targetMetadata.get(P);
        if (IsUndefined(metadataMap)) {
            if (!Create)
                return undefined;
            metadataMap = new _Map();
            targetMetadata.set(P, metadataMap);
        }
        return metadataMap;
    }
    // Ordinary Object Internal Methods and Internal Slots
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinary-object-internal-methods-and-internal-slots
    // OrdinaryHasMetadata(MetadataKey, O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryhasmetadata--metadatakey-o-p-
    function OrdinaryHasMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return true;
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryHasMetadata(MetadataKey, parent, P);
        return false;
    }
    // OrdinaryHasOwnMetadata(MetadataKey, O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryhasownmetadata--metadatakey-o-p-
    function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ false);
        if (IsUndefined(metadataMap))
            return false;
        return ToBoolean(metadataMap.has(MetadataKey));
    }
    // OrdinaryGetMetadata(MetadataKey, O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarygetmetadata--metadatakey-o-p-
    function OrdinaryGetMetadata(MetadataKey, O, P) {
        var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
        if (hasOwn)
            return OrdinaryGetOwnMetadata(MetadataKey, O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (!IsNull(parent))
            return OrdinaryGetMetadata(MetadataKey, parent, P);
        return undefined;
    }
    // OrdinaryGetOwnMetadata(MetadataKey, O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarygetownmetadata--metadatakey-o-p-
    function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ false);
        if (IsUndefined(metadataMap))
            return undefined;
        return metadataMap.get(MetadataKey);
    }
    // OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarydefineownmetadata--metadatakey-metadatavalue-o-p-
    function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ true);
        metadataMap.set(MetadataKey, MetadataValue);
    }
    // OrdinaryMetadataKeys(O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinarymetadatakeys--o-p-
    function OrdinaryMetadataKeys(O, P) {
        var ownKeys = OrdinaryOwnMetadataKeys(O, P);
        var parent = OrdinaryGetPrototypeOf(O);
        if (parent === null)
            return ownKeys;
        var parentKeys = OrdinaryMetadataKeys(parent, P);
        if (parentKeys.length <= 0)
            return ownKeys;
        if (ownKeys.length <= 0)
            return parentKeys;
        var set = new _Set();
        var keys = [];
        for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
            var key = ownKeys_1[_i];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
            var key = parentKeys_1[_a];
            var hasKey = set.has(key);
            if (!hasKey) {
                set.add(key);
                keys.push(key);
            }
        }
        return keys;
    }
    // OrdinaryOwnMetadataKeys(O, P)
    // https://github.com/rbuckton/ReflectDecorators/blob/master/spec/metadata.md#ordinaryownmetadatakeys--o-p-
    function OrdinaryOwnMetadataKeys(O, P) {
        var metadataMap = GetOrCreateMetadataMap(O, P, /*create*/ false);
        var keys = [];
        if (IsUndefined(metadataMap))
            return keys;
        var keysObj = metadataMap.keys();
        var iterator = GetIterator(keysObj);
        while (true) {
            var next = IteratorStep(iterator);
            try {
                if (!next)
                    return keys;
                var nextValue = IteratorValue(next);
                keys.push(nextValue);
            }
            catch (e) {
                try {
                    if (next) {
                        next = false;
                        IteratorClose(iterator);
                    }
                }
                finally {
                    throw e;
                }
            }
            finally {
                if (next)
                    IteratorClose(iterator);
            }
        }
    }
    // ECMAScript Specification
    // https://tc39.github.io/ecma262/
    // 6 ECMAScript Data Typ0es and Values
    // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
    function Type(x) {
        if (x === null)
            return Tag.Null;
        switch (typeof x) {
            case "undefined": return Tag.Undefined;
            case "boolean": return Tag.Boolean;
            case "string": return Tag.String;
            case "symbol": return Tag.Symbol;
            case "number": return Tag.Number;
            case "object": return x === null ? Tag.Null : Tag.Object;
            default: return Tag.Object;
        }
    }
    // 6.1 ECMAScript Language Types
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types
    var Tag;
    (function (Tag) {
        Tag[Tag["Undefined"] = 0] = "Undefined";
        Tag[Tag["Null"] = 1] = "Null";
        Tag[Tag["Boolean"] = 2] = "Boolean";
        Tag[Tag["String"] = 3] = "String";
        Tag[Tag["Symbol"] = 4] = "Symbol";
        Tag[Tag["Number"] = 5] = "Number";
        Tag[Tag["Object"] = 6] = "Object";
    })(Tag || (Tag = {}));
    // 6.1.1 The Undefined Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
    function IsUndefined(x) {
        return x === undefined;
    }
    // 6.1.2 The Null Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
    function IsNull(x) {
        return x === null;
    }
    // 6.1.5 The Symbol Type
    // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
    function IsSymbol(x) {
        return typeof x === "symbol";
    }
    // 6.1.7 The Object Type
    // https://tc39.github.io/ecma262/#sec-object-type
    function IsObject(x) {
        return typeof x === "object" ? x !== null : typeof x === "function";
    }
    // 7.1 Type Conversion
    // https://tc39.github.io/ecma262/#sec-type-conversion
    // 7.1.1 ToPrimitive(input [, PreferredType])
    // https://tc39.github.io/ecma262/#sec-toprimitive
    function ToPrimitive(input, PreferredType) {
        switch (Type(input)) {
            case Tag.Undefined: return input;
            case Tag.Null: return input;
            case Tag.Boolean: return input;
            case Tag.String: return input;
            case Tag.Symbol: return input;
            case Tag.Number: return input;
        }
        var hint = PreferredType === Tag.String ? "string" : PreferredType === Tag.Number ? "number" : "default";
        var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
        if (exoticToPrim !== undefined) {
            var result = exoticToPrim.call(input, hint);
            if (IsObject(result))
                throw new TypeError();
            return result;
        }
        return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
    }
    // 7.1.1.1 OrdinaryToPrimitive(O, hint)
    // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
    function OrdinaryToPrimitive(O, hint) {
        if (hint === "string") {
            var toString = O.toString;
            if (IsCallable(toString)) {
                var result = toString.call(O);
                if (!IsObject(result))
                    return result;
            }
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        else {
            var valueOf = O.valueOf;
            if (IsCallable(valueOf)) {
                var result = valueOf.call(O);
                if (!IsObject(result))
                    return result;
            }
            var toString = O.toString;
            if (IsCallable(toString)) {
                var result = toString.call(O);
                if (!IsObject(result))
                    return result;
            }
        }
        throw new TypeError();
    }
    // 7.1.2 ToBoolean(argument)
    // https://tc39.github.io/ecma262/2016/#sec-toboolean
    function ToBoolean(argument) {
        return !!argument;
    }
    // 7.1.12 ToString(argument)
    // https://tc39.github.io/ecma262/#sec-tostring
    function ToString(argument) {
        return "" + argument;
    }
    // 7.1.14 ToPropertyKey(argument)
    // https://tc39.github.io/ecma262/#sec-topropertykey
    function ToPropertyKey(argument) {
        var key = ToPrimitive(argument, Tag.String);
        if (IsSymbol(key))
            return key;
        return ToString(key);
    }
    // 7.2 Testing and Comparison Operations
    // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
    // 7.2.2 IsArray(argument)
    // https://tc39.github.io/ecma262/#sec-isarray
    function IsArray(argument) {
        return Array.isArray
            ? Array.isArray(argument)
            : argument instanceof Object
                ? argument instanceof Array
                : Object.prototype.toString.call(argument) === "[object Array]";
    }
    // 7.2.3 IsCallable(argument)
    // https://tc39.github.io/ecma262/#sec-iscallable
    function IsCallable(argument) {
        // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
        return typeof argument === "function";
    }
    // 7.2.4 IsConstructor(argument)
    // https://tc39.github.io/ecma262/#sec-isconstructor
    function IsConstructor(argument) {
        // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
        return typeof argument === "function";
    }
    // 7.3 Operations on Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-objects
    // 7.3.9 GetMethod(V, P)
    // https://tc39.github.io/ecma262/#sec-getmethod
    function GetMethod(V, P) {
        var func = V[P];
        if (func === undefined || func === null)
            return undefined;
        if (!IsCallable(func))
            throw new TypeError();
        return func;
    }
    // 7.4 Operations on Iterator Objects
    // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
    function GetIterator(obj) {
        var method = GetMethod(obj, iteratorSymbol);
        if (!IsCallable(method))
            throw new TypeError(); // from Call
        var iterator = method.call(obj);
        if (!IsObject(iterator))
            throw new TypeError();
        return iterator;
    }
    // 7.4.4 IteratorValue(iterResult)
    // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
    function IteratorValue(iterResult) {
        return iterResult.value;
    }
    // 7.4.5 IteratorStep(iterator)
    // https://tc39.github.io/ecma262/#sec-iteratorstep
    function IteratorStep(iterator) {
        var result = iterator.next();
        return result.done ? false : result;
    }
    // 7.4.6 IteratorClose(iterator, completion)
    // https://tc39.github.io/ecma262/#sec-iteratorclose
    function IteratorClose(iterator) {
        var f = iterator["return"];
        if (f)
            f.call(iterator);
    }
    // 9.1 Ordinary Object Internal Methods and Internal Slots
    // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
    // 9.1.1.1 OrdinaryGetPrototypeOf(O)
    // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
    function OrdinaryGetPrototypeOf(O) {
        var proto = Object.getPrototypeOf(O);
        if (typeof O !== "function" || O === functionPrototype)
            return proto;
        // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
        // Try to determine the superclass constructor. Compatible implementations
        // must either set __proto__ on a subclass constructor to the superclass constructor,
        // or ensure each class has a valid `constructor` property on its prototype that
        // points back to the constructor.
        // If this is not the same as Function.[[Prototype]], then this is definately inherited.
        // This is the case when in ES6 or when using __proto__ in a compatible browser.
        if (proto !== functionPrototype)
            return proto;
        // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
        var prototype = O.prototype;
        var prototypeProto = prototype && Object.getPrototypeOf(prototype);
        if (prototypeProto == null || prototypeProto === Object.prototype)
            return proto;
        // If the constructor was not a function, then we cannot determine the heritage.
        var constructor = prototypeProto.constructor;
        if (typeof constructor !== "function")
            return proto;
        // If we have some kind of self-reference, then we cannot determine the heritage.
        if (constructor === O)
            return proto;
        // we have a pretty good guess at the heritage.
        return constructor;
    }
    // naive Map shim
    function CreateMapPolyfill() {
        var cacheSentinel = {};
        var arraySentinel = [];
        var MapIterator = (function () {
            function MapIterator(keys, values, selector) {
                this._index = 0;
                this._keys = keys;
                this._values = values;
                this._selector = selector;
            }
            MapIterator.prototype["@@iterator"] = function () { return this; };
            MapIterator.prototype[iteratorSymbol] = function () { return this; };
            MapIterator.prototype.next = function () {
                var index = this._index;
                if (index >= 0 && index < this._keys.length) {
                    var result = this._selector(this._keys[index], this._values[index]);
                    if (index + 1 >= this._keys.length) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    else {
                        this._index++;
                    }
                    return { value: result, done: false };
                }
                return { value: undefined, done: true };
            };
            MapIterator.prototype.throw = function (error) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                throw error;
            };
            MapIterator.prototype.return = function (value) {
                if (this._index >= 0) {
                    this._index = -1;
                    this._keys = arraySentinel;
                    this._values = arraySentinel;
                }
                return { value: value, done: true };
            };
            return MapIterator;
        }());
        return (function () {
            function Map() {
                this._keys = [];
                this._values = [];
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            }
            Object.defineProperty(Map.prototype, "size", {
                get: function () { return this._keys.length; },
                enumerable: true,
                configurable: true
            });
            Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
            Map.prototype.get = function (key) {
                var index = this._find(key, /*insert*/ false);
                return index >= 0 ? this._values[index] : undefined;
            };
            Map.prototype.set = function (key, value) {
                var index = this._find(key, /*insert*/ true);
                this._values[index] = value;
                return this;
            };
            Map.prototype.delete = function (key) {
                var index = this._find(key, /*insert*/ false);
                if (index >= 0) {
                    var size = this._keys.length;
                    for (var i = index + 1; i < size; i++) {
                        this._keys[i - 1] = this._keys[i];
                        this._values[i - 1] = this._values[i];
                    }
                    this._keys.length--;
                    this._values.length--;
                    if (key === this._cacheKey) {
                        this._cacheKey = cacheSentinel;
                        this._cacheIndex = -2;
                    }
                    return true;
                }
                return false;
            };
            Map.prototype.clear = function () {
                this._keys.length = 0;
                this._values.length = 0;
                this._cacheKey = cacheSentinel;
                this._cacheIndex = -2;
            };
            Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
            Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
            Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
            Map.prototype["@@iterator"] = function () { return this.entries(); };
            Map.prototype[iteratorSymbol] = function () { return this.entries(); };
            Map.prototype._find = function (key, insert) {
                if (this._cacheKey === key)
                    return this._cacheIndex;
                var index = this._keys.indexOf(key);
                if (index < 0 && insert) {
                    index = this._keys.length;
                    this._keys.push(key);
                    this._values.push(undefined);
                }
                return this._cacheKey = key, this._cacheIndex = index;
            };
            return Map;
        }());
        function getKey(key, _) {
            return key;
        }
        function getValue(_, value) {
            return value;
        }
        function getEntry(key, value) {
            return [key, value];
        }
    }
    // naive Set shim
    function CreateSetPolyfill() {
        return (function () {
            function Set() {
                this._map = new _Map();
            }
            Object.defineProperty(Set.prototype, "size", {
                get: function () { return this._map.size; },
                enumerable: true,
                configurable: true
            });
            Set.prototype.has = function (value) { return this._map.has(value); };
            Set.prototype.add = function (value) { return this._map.set(value, value), this; };
            Set.prototype.delete = function (value) { return this._map.delete(value); };
            Set.prototype.clear = function () { this._map.clear(); };
            Set.prototype.keys = function () { return this._map.keys(); };
            Set.prototype.values = function () { return this._map.values(); };
            Set.prototype.entries = function () { return this._map.entries(); };
            Set.prototype["@@iterator"] = function () { return this.keys(); };
            Set.prototype[iteratorSymbol] = function () { return this.keys(); };
            return Set;
        }());
    }
    // naive WeakMap shim
    function CreateWeakMapPolyfill() {
        var UUID_SIZE = 16;
        var keys = createDictionary();
        var rootKey = CreateUniqueKey();
        return (function () {
            function WeakMap() {
                this._key = CreateUniqueKey();
            }
            WeakMap.prototype.has = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.has(table, this._key) : false;
            };
            WeakMap.prototype.get = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? HashMap.get(table, this._key) : undefined;
            };
            WeakMap.prototype.set = function (target, value) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                table[this._key] = value;
                return this;
            };
            WeakMap.prototype.delete = function (target) {
                var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                return table !== undefined ? delete table[this._key] : false;
            };
            WeakMap.prototype.clear = function () {
                // NOTE: not a real clear, just makes the previous data unreachable
                this._key = CreateUniqueKey();
            };
            return WeakMap;
        }());
        function CreateUniqueKey() {
            var key;
            do
                key = "@@WeakMap@@" + CreateUUID();
            while (HashMap.has(keys, key));
            keys[key] = true;
            return key;
        }
        function GetOrCreateWeakMapTable(target, create) {
            if (!hasOwn.call(target, rootKey)) {
                if (!create)
                    return undefined;
                Object.defineProperty(target, rootKey, { value: createDictionary() });
            }
            return target[rootKey];
        }
        function FillRandomBytes(buffer, size) {
            for (var i = 0; i < size; ++i)
                buffer[i] = Math.random() * 0xff | 0;
            return buffer;
        }
        function GenRandomBytes(size) {
            if (typeof Uint8Array === "function") {
                if (typeof crypto !== "undefined")
                    return crypto.getRandomValues(new Uint8Array(size));
                if (typeof msCrypto !== "undefined")
                    return msCrypto.getRandomValues(new Uint8Array(size));
                return FillRandomBytes(new Uint8Array(size), size);
            }
            return FillRandomBytes(new Array(size), size);
        }
        function CreateUUID() {
            var data = GenRandomBytes(UUID_SIZE);
            // mark as random - RFC 4122 § 4.4
            data[6] = data[6] & 0x4f | 0x40;
            data[8] = data[8] & 0xbf | 0x80;
            var result = "";
            for (var offset = 0; offset < UUID_SIZE; ++offset) {
                var byte = data[offset];
                if (offset === 4 || offset === 6 || offset === 8)
                    result += "-";
                if (byte < 16)
                    result += "0";
                result += byte.toString(16).toLowerCase();
            }
            return result;
        }
    }
    // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
    function MakeDictionary(obj) {
        obj.__ = undefined;
        delete obj.__;
        return obj;
    }
    // patch global Reflect
    (function (__global) {
        if (typeof __global.Reflect !== "undefined") {
            if (__global.Reflect !== Reflect) {
                for (var p in Reflect) {
                    if (hasOwn.call(Reflect, p)) {
                        __global.Reflect[p] = Reflect[p];
                    }
                }
            }
        }
        else {
            __global.Reflect = Reflect;
        }
    })(typeof global !== "undefined" ? global :
        typeof self !== "undefined" ? self :
            Function("return this;")());
})(Reflect || (Reflect = {}));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11)))

/***/ }),

/***/ "./node_modules/zone.js/dist/zone.js":
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global, process) {/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/
(function (global, factory) {
     true ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (factory());
}(this, (function () { 'use strict';

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


var Zone$1 = (function (global) {
    if (global['Zone']) {
        throw new Error('Zone already loaded.');
    }
    var Zone = (function () {
        function Zone(parent, zoneSpec) {
            this._properties = null;
            this._parent = parent;
            this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
            this._properties = zoneSpec && zoneSpec.properties || {};
            this._zoneDelegate =
                new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
        }
        Zone.assertZonePatched = function () {
            if (global.Promise !== ZoneAwarePromise) {
                throw new Error('Zone.js has detected that ZoneAwarePromise `(window|global).Promise` ' +
                    'has been overwritten.\n' +
                    'Most likely cause is that a Promise polyfill has been loaded ' +
                    'after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. ' +
                    'If you must load one, do so before loading zone.js.)');
            }
        };
        Object.defineProperty(Zone, "current", {
            get: function () {
                return _currentZoneFrame.zone;
            },
            enumerable: true,
            configurable: true
        });
        
        Object.defineProperty(Zone, "currentTask", {
            get: function () {
                return _currentTask;
            },
            enumerable: true,
            configurable: true
        });
        
        Object.defineProperty(Zone.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });
        
        Object.defineProperty(Zone.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        
        Zone.prototype.get = function (key) {
            var zone = this.getZoneWith(key);
            if (zone)
                return zone._properties[key];
        };
        Zone.prototype.getZoneWith = function (key) {
            var current = this;
            while (current) {
                if (current._properties.hasOwnProperty(key)) {
                    return current;
                }
                current = current._parent;
            }
            return null;
        };
        Zone.prototype.fork = function (zoneSpec) {
            if (!zoneSpec)
                throw new Error('ZoneSpec required!');
            return this._zoneDelegate.fork(this, zoneSpec);
        };
        Zone.prototype.wrap = function (callback, source) {
            if (typeof callback !== 'function') {
                throw new Error('Expecting function got: ' + callback);
            }
            var _callback = this._zoneDelegate.intercept(this, callback, source);
            var zone = this;
            return function () {
                return zone.runGuarded(_callback, this, arguments, source);
            };
        };
        Zone.prototype.run = function (callback, applyThis, applyArgs, source) {
            if (applyThis === void 0) { applyThis = null; }
            if (applyArgs === void 0) { applyArgs = null; }
            if (source === void 0) { source = null; }
            _currentZoneFrame = new ZoneFrame(_currentZoneFrame, this);
            try {
                return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
            }
            finally {
                _currentZoneFrame = _currentZoneFrame.parent;
            }
        };
        Zone.prototype.runGuarded = function (callback, applyThis, applyArgs, source) {
            if (applyThis === void 0) { applyThis = null; }
            if (applyArgs === void 0) { applyArgs = null; }
            if (source === void 0) { source = null; }
            _currentZoneFrame = new ZoneFrame(_currentZoneFrame, this);
            try {
                try {
                    return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                }
                catch (error) {
                    if (this._zoneDelegate.handleError(this, error)) {
                        throw error;
                    }
                }
            }
            finally {
                _currentZoneFrame = _currentZoneFrame.parent;
            }
        };
        Zone.prototype.runTask = function (task, applyThis, applyArgs) {
            task.runCount++;
            if (task.zone != this)
                throw new Error('A task can only be run in the zone which created it! (Creation: ' + task.zone.name +
                    '; Execution: ' + this.name + ')');
            var previousTask = _currentTask;
            _currentTask = task;
            _currentZoneFrame = new ZoneFrame(_currentZoneFrame, this);
            try {
                if (task.type == 'macroTask' && task.data && !task.data.isPeriodic) {
                    task.cancelFn = null;
                }
                try {
                    return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
                }
                catch (error) {
                    if (this._zoneDelegate.handleError(this, error)) {
                        throw error;
                    }
                }
            }
            finally {
                _currentZoneFrame = _currentZoneFrame.parent;
                _currentTask = previousTask;
            }
        };
        Zone.prototype.scheduleMicroTask = function (source, callback, data, customSchedule) {
            return this._zoneDelegate.scheduleTask(this, new ZoneTask('microTask', this, source, callback, data, customSchedule, null));
        };
        Zone.prototype.scheduleMacroTask = function (source, callback, data, customSchedule, customCancel) {
            return this._zoneDelegate.scheduleTask(this, new ZoneTask('macroTask', this, source, callback, data, customSchedule, customCancel));
        };
        Zone.prototype.scheduleEventTask = function (source, callback, data, customSchedule, customCancel) {
            return this._zoneDelegate.scheduleTask(this, new ZoneTask('eventTask', this, source, callback, data, customSchedule, customCancel));
        };
        Zone.prototype.cancelTask = function (task) {
            var value = this._zoneDelegate.cancelTask(this, task);
            task.runCount = -1;
            task.cancelFn = null;
            return value;
        };
        return Zone;
    }());
    Zone.__symbol__ = __symbol__;
    
    var ZoneDelegate = (function () {
        function ZoneDelegate(zone, parentDelegate, zoneSpec) {
            this._taskCounts = { microTask: 0, macroTask: 0, eventTask: 0 };
            this.zone = zone;
            this._parentDelegate = parentDelegate;
            this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
            this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
            this._forkCurrZone = zoneSpec && (zoneSpec.onFork ? this.zone : parentDelegate.zone);
            this._interceptZS =
                zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
            this._interceptDlgt =
                zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);
            this._interceptCurrZone =
                zoneSpec && (zoneSpec.onIntercept ? this.zone : parentDelegate.zone);
            this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
            this._invokeDlgt =
                zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);
            this._invokeCurrZone = zoneSpec && (zoneSpec.onInvoke ? this.zone : parentDelegate.zone);
            this._handleErrorZS =
                zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
            this._handleErrorDlgt =
                zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);
            this._handleErrorCurrZone =
                zoneSpec && (zoneSpec.onHandleError ? this.zone : parentDelegate.zone);
            this._scheduleTaskZS =
                zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
            this._scheduleTaskDlgt =
                zoneSpec && (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);
            this._scheduleTaskCurrZone =
                zoneSpec && (zoneSpec.onScheduleTask ? this.zone : parentDelegate.zone);
            this._invokeTaskZS =
                zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
            this._invokeTaskDlgt =
                zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);
            this._invokeTaskCurrZone =
                zoneSpec && (zoneSpec.onInvokeTask ? this.zone : parentDelegate.zone);
            this._cancelTaskZS =
                zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
            this._cancelTaskDlgt =
                zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);
            this._cancelTaskCurrZone =
                zoneSpec && (zoneSpec.onCancelTask ? this.zone : parentDelegate.zone);
            this._hasTaskZS = zoneSpec && (zoneSpec.onHasTask ? zoneSpec : parentDelegate._hasTaskZS);
            this._hasTaskDlgt =
                zoneSpec && (zoneSpec.onHasTask ? parentDelegate : parentDelegate._hasTaskDlgt);
            this._hasTaskCurrZone = zoneSpec && (zoneSpec.onHasTask ? this.zone : parentDelegate.zone);
        }
        ZoneDelegate.prototype.fork = function (targetZone, zoneSpec) {
            return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) :
                new Zone(targetZone, zoneSpec);
        };
        ZoneDelegate.prototype.intercept = function (targetZone, callback, source) {
            return this._interceptZS ?
                this._interceptZS.onIntercept(this._interceptDlgt, this._interceptCurrZone, targetZone, callback, source) :
                callback;
        };
        ZoneDelegate.prototype.invoke = function (targetZone, callback, applyThis, applyArgs, source) {
            return this._invokeZS ?
                this._invokeZS.onInvoke(this._invokeDlgt, this._invokeCurrZone, targetZone, callback, applyThis, applyArgs, source) :
                callback.apply(applyThis, applyArgs);
        };
        ZoneDelegate.prototype.handleError = function (targetZone, error) {
            return this._handleErrorZS ?
                this._handleErrorZS.onHandleError(this._handleErrorDlgt, this._handleErrorCurrZone, targetZone, error) :
                true;
        };
        ZoneDelegate.prototype.scheduleTask = function (targetZone, task) {
            try {
                if (this._scheduleTaskZS) {
                    return this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt, this._scheduleTaskCurrZone, targetZone, task);
                }
                else if (task.scheduleFn) {
                    task.scheduleFn(task);
                }
                else if (task.type == 'microTask') {
                    scheduleMicroTask(task);
                }
                else {
                    throw new Error('Task is missing scheduleFn.');
                }
                return task;
            }
            finally {
                if (targetZone == this.zone) {
                    this._updateTaskCount(task.type, 1);
                }
            }
        };
        ZoneDelegate.prototype.invokeTask = function (targetZone, task, applyThis, applyArgs) {
            try {
                return this._invokeTaskZS ?
                    this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) :
                    task.callback.apply(applyThis, applyArgs);
            }
            finally {
                if (targetZone == this.zone && (task.type != 'eventTask') &&
                    !(task.data && task.data.isPeriodic)) {
                    this._updateTaskCount(task.type, -1);
                }
            }
        };
        ZoneDelegate.prototype.cancelTask = function (targetZone, task) {
            var value;
            if (this._cancelTaskZS) {
                value = this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt, this._cancelTaskCurrZone, targetZone, task);
            }
            else if (!task.cancelFn) {
                throw new Error('Task does not support cancellation, or is already canceled.');
            }
            else {
                value = task.cancelFn(task);
            }
            if (targetZone == this.zone) {
                // this should not be in the finally block, because exceptions assume not canceled.
                this._updateTaskCount(task.type, -1);
            }
            return value;
        };
        ZoneDelegate.prototype.hasTask = function (targetZone, isEmpty) {
            return this._hasTaskZS &&
                this._hasTaskZS.onHasTask(this._hasTaskDlgt, this._hasTaskCurrZone, targetZone, isEmpty);
        };
        ZoneDelegate.prototype._updateTaskCount = function (type, count) {
            var counts = this._taskCounts;
            var prev = counts[type];
            var next = counts[type] = prev + count;
            if (next < 0) {
                throw new Error('More tasks executed then were scheduled.');
            }
            if (prev == 0 || next == 0) {
                var isEmpty = {
                    microTask: counts.microTask > 0,
                    macroTask: counts.macroTask > 0,
                    eventTask: counts.eventTask > 0,
                    change: type
                };
                try {
                    this.hasTask(this.zone, isEmpty);
                }
                finally {
                    if (this._parentDelegate) {
                        this._parentDelegate._updateTaskCount(type, count);
                    }
                }
            }
        };
        return ZoneDelegate;
    }());
    var ZoneTask = (function () {
        function ZoneTask(type, zone, source, callback, options, scheduleFn, cancelFn) {
            this.runCount = 0;
            this.type = type;
            this.zone = zone;
            this.source = source;
            this.data = options;
            this.scheduleFn = scheduleFn;
            this.cancelFn = cancelFn;
            this.callback = callback;
            var self = this;
            this.invoke = function () {
                _numberOfNestedTaskFrames++;
                try {
                    return zone.runTask(self, this, arguments);
                }
                finally {
                    if (_numberOfNestedTaskFrames == 1) {
                        drainMicroTaskQueue();
                    }
                    _numberOfNestedTaskFrames--;
                }
            };
        }
        ZoneTask.prototype.toString = function () {
            if (this.data && typeof this.data.handleId !== 'undefined') {
                return this.data.handleId;
            }
            else {
                return Object.prototype.toString.call(this);
            }
        };
        // add toJSON method to prevent cyclic error when
        // call JSON.stringify(zoneTask)
        ZoneTask.prototype.toJSON = function () {
            return {
                type: this.type,
                source: this.source,
                data: this.data,
                zone: this.zone.name,
                invoke: this.invoke,
                scheduleFn: this.scheduleFn,
                cancelFn: this.cancelFn,
                runCount: this.runCount,
                callback: this.callback
            };
        };
        return ZoneTask;
    }());
    var ZoneFrame = (function () {
        function ZoneFrame(parent, zone) {
            this.parent = parent;
            this.zone = zone;
        }
        return ZoneFrame;
    }());
    function __symbol__(name) {
        return '__zone_symbol__' + name;
    }
    
    var symbolSetTimeout = __symbol__('setTimeout');
    var symbolPromise = __symbol__('Promise');
    var symbolThen = __symbol__('then');
    var _currentZoneFrame = new ZoneFrame(null, new Zone(null, null));
    var _currentTask = null;
    var _microTaskQueue = [];
    var _isDrainingMicrotaskQueue = false;
    var _uncaughtPromiseErrors = [];
    var _numberOfNestedTaskFrames = 0;
    function scheduleQueueDrain() {
        // if we are not running in any task, and there has not been anything scheduled
        // we must bootstrap the initial task creation by manually scheduling the drain
        if (_numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0) {
            // We are not running in Task, so we need to kickstart the microtask queue.
            if (global[symbolPromise]) {
                global[symbolPromise].resolve(0)[symbolThen](drainMicroTaskQueue);
            }
            else {
                global[symbolSetTimeout](drainMicroTaskQueue, 0);
            }
        }
    }
    function scheduleMicroTask(task) {
        scheduleQueueDrain();
        _microTaskQueue.push(task);
    }
    function consoleError(e) {
        var rejection = e && e.rejection;
        if (rejection) {
            console.error('Unhandled Promise rejection:', rejection instanceof Error ? rejection.message : rejection, '; Zone:', e.zone.name, '; Task:', e.task && e.task.source, '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
        }
        console.error(e);
    }
    function drainMicroTaskQueue() {
        if (!_isDrainingMicrotaskQueue) {
            _isDrainingMicrotaskQueue = true;
            while (_microTaskQueue.length) {
                var queue = _microTaskQueue;
                _microTaskQueue = [];
                for (var i = 0; i < queue.length; i++) {
                    var task = queue[i];
                    try {
                        task.zone.runTask(task, null, null);
                    }
                    catch (e) {
                        consoleError(e);
                    }
                }
            }
            while (_uncaughtPromiseErrors.length) {
                var _loop_1 = function () {
                    var uncaughtPromiseError = _uncaughtPromiseErrors.shift();
                    try {
                        uncaughtPromiseError.zone.runGuarded(function () {
                            throw uncaughtPromiseError;
                        });
                    }
                    catch (e) {
                        consoleError(e);
                    }
                };
                while (_uncaughtPromiseErrors.length) {
                    _loop_1();
                }
            }
            _isDrainingMicrotaskQueue = false;
        }
    }
    function isThenable(value) {
        return value && value.then;
    }
    function forwardResolution(value) {
        return value;
    }
    function forwardRejection(rejection) {
        return ZoneAwarePromise.reject(rejection);
    }
    var symbolState = __symbol__('state');
    var symbolValue = __symbol__('value');
    var source = 'Promise.then';
    var UNRESOLVED = null;
    var RESOLVED = true;
    var REJECTED = false;
    var REJECTED_NO_CATCH = 0;
    function makeResolver(promise, state) {
        return function (v) {
            resolvePromise(promise, state, v);
            // Do not return value or you will break the Promise spec.
        };
    }
    function resolvePromise(promise, state, value) {
        if (promise[symbolState] === UNRESOLVED) {
            if (value instanceof ZoneAwarePromise && value.hasOwnProperty(symbolState) &&
                value.hasOwnProperty(symbolValue) && value[symbolState] !== UNRESOLVED) {
                clearRejectedNoCatch(value);
                resolvePromise(promise, value[symbolState], value[symbolValue]);
            }
            else if (isThenable(value)) {
                value.then(makeResolver(promise, state), makeResolver(promise, false));
            }
            else {
                promise[symbolState] = state;
                var queue = promise[symbolValue];
                promise[symbolValue] = value;
                for (var i = 0; i < queue.length;) {
                    scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
                }
                if (queue.length == 0 && state == REJECTED) {
                    promise[symbolState] = REJECTED_NO_CATCH;
                    try {
                        throw new Error('Uncaught (in promise): ' + value +
                            (value && value.stack ? '\n' + value.stack : ''));
                    }
                    catch (e) {
                        var error_1 = e;
                        error_1.rejection = value;
                        error_1.promise = promise;
                        error_1.zone = Zone.current;
                        error_1.task = Zone.currentTask;
                        _uncaughtPromiseErrors.push(error_1);
                        scheduleQueueDrain();
                    }
                }
            }
        }
        // Resolving an already resolved promise is a noop.
        return promise;
    }
    function clearRejectedNoCatch(promise) {
        if (promise[symbolState] === REJECTED_NO_CATCH) {
            promise[symbolState] = REJECTED;
            for (var i = 0; i < _uncaughtPromiseErrors.length; i++) {
                if (promise === _uncaughtPromiseErrors[i].promise) {
                    _uncaughtPromiseErrors.splice(i, 1);
                    break;
                }
            }
        }
    }
    function scheduleResolveOrReject(promise, zone, chainPromise, onFulfilled, onRejected) {
        clearRejectedNoCatch(promise);
        var delegate = promise[symbolState] ? onFulfilled || forwardResolution : onRejected || forwardRejection;
        zone.scheduleMicroTask(source, function () {
            try {
                resolvePromise(chainPromise, true, zone.run(delegate, null, [promise[symbolValue]]));
            }
            catch (error) {
                resolvePromise(chainPromise, false, error);
            }
        });
    }
    var ZoneAwarePromise = (function () {
        function ZoneAwarePromise(executor) {
            var promise = this;
            if (!(promise instanceof ZoneAwarePromise)) {
                throw new Error('Must be an instanceof Promise.');
            }
            promise[symbolState] = UNRESOLVED;
            promise[symbolValue] = []; // queue;
            try {
                executor && executor(makeResolver(promise, RESOLVED), makeResolver(promise, REJECTED));
            }
            catch (e) {
                resolvePromise(promise, false, e);
            }
        }
        ZoneAwarePromise.toString = function () {
            return 'function ZoneAwarePromise() { [native code] }';
        };
        ZoneAwarePromise.resolve = function (value) {
            return resolvePromise(new this(null), RESOLVED, value);
        };
        ZoneAwarePromise.reject = function (error) {
            return resolvePromise(new this(null), REJECTED, error);
        };
        ZoneAwarePromise.race = function (values) {
            var resolve;
            var reject;
            var promise = new this(function (res, rej) {
                _a = [res, rej], resolve = _a[0], reject = _a[1];
                var _a;
            });
            function onResolve(value) {
                promise && (promise = null || resolve(value));
            }
            function onReject(error) {
                promise && (promise = null || reject(error));
            }
            for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                var value = values_1[_i];
                if (!isThenable(value)) {
                    value = this.resolve(value);
                }
                value.then(onResolve, onReject);
            }
            return promise;
        };
        ZoneAwarePromise.all = function (values) {
            var resolve;
            var reject;
            var promise = new this(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            var count = 0;
            var resolvedValues = [];
            for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
                var value = values_2[_i];
                if (!isThenable(value)) {
                    value = this.resolve(value);
                }
                value.then((function (index) { return function (value) {
                    resolvedValues[index] = value;
                    count--;
                    if (!count) {
                        resolve(resolvedValues);
                    }
                }; })(count), reject);
                count++;
            }
            if (!count)
                resolve(resolvedValues);
            return promise;
        };
        ZoneAwarePromise.prototype.then = function (onFulfilled, onRejected) {
            var chainPromise = new this.constructor(null);
            var zone = Zone.current;
            if (this[symbolState] == UNRESOLVED) {
                this[symbolValue].push(zone, chainPromise, onFulfilled, onRejected);
            }
            else {
                scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
            }
            return chainPromise;
        };
        ZoneAwarePromise.prototype.catch = function (onRejected) {
            return this.then(null, onRejected);
        };
        return ZoneAwarePromise;
    }());
    // Protect against aggressive optimizers dropping seemingly unused properties.
    // E.g. Closure Compiler in advanced mode.
    ZoneAwarePromise['resolve'] = ZoneAwarePromise.resolve;
    ZoneAwarePromise['reject'] = ZoneAwarePromise.reject;
    ZoneAwarePromise['race'] = ZoneAwarePromise.race;
    ZoneAwarePromise['all'] = ZoneAwarePromise.all;
    var NativePromise = global[__symbol__('Promise')] = global['Promise'];
    global['Promise'] = ZoneAwarePromise;
    function patchThen(NativePromise) {
        var NativePromiseProtototype = NativePromise.prototype;
        var NativePromiseThen = NativePromiseProtototype[__symbol__('then')] =
            NativePromiseProtototype.then;
        NativePromiseProtototype.then = function (onResolve, onReject) {
            var nativePromise = this;
            return new ZoneAwarePromise(function (resolve, reject) {
                NativePromiseThen.call(nativePromise, resolve, reject);
            })
                .then(onResolve, onReject);
        };
    }
    if (NativePromise) {
        patchThen(NativePromise);
        if (typeof global['fetch'] !== 'undefined') {
            var fetchPromise = void 0;
            try {
                // In MS Edge this throws
                fetchPromise = global['fetch']();
            }
            catch (e) {
                // In Chrome this throws instead.
                fetchPromise = global['fetch']('about:blank');
            }
            // ignore output to prevent error;
            fetchPromise.then(function () { return null; }, function () { return null; });
            if (fetchPromise.constructor != NativePromise &&
                fetchPromise.constructor != ZoneAwarePromise) {
                patchThen(fetchPromise.constructor);
            }
        }
    }
    // This is not part of public API, but it is usefull for tests, so we expose it.
    Promise[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
    /*
     * This code patches Error so that:
     *   - It ignores un-needed stack frames.
     *   - It Shows the associated Zone for reach frame.
     */
    var FrameType;
    (function (FrameType) {
        /// Skip this frame when printing out stack
        FrameType[FrameType["blackList"] = 0] = "blackList";
        /// This frame marks zone transition
        FrameType[FrameType["transition"] = 1] = "transition";
    })(FrameType || (FrameType = {}));
    var NativeError = global[__symbol__('Error')] = global.Error;
    // Store the frames which should be removed from the stack frames
    var blackListedStackFrames = {};
    // We must find the frame where Error was created, otherwise we assume we don't understand stack
    var zoneAwareFrame;
    global.Error = ZoneAwareError;
    // How should the stack frames be parsed.
    var frameParserStrategy = null;
    var stackRewrite = 'stackRewrite';
    // fix #595, create property descriptor
    // for error properties
    var createProperty = function (props, key) {
        // if property is already defined, skip it.
        if (props[key]) {
            return;
        }
        // define a local property
        // in case error property is not settable
        var name = __symbol__(key);
        props[key] = {
            configurable: true,
            enumerable: true,
            get: function () {
                // if local property has no value
                // use internal error's property value
                if (!this[name]) {
                    var error_2 = this[__symbol__('error')];
                    if (error_2) {
                        this[name] = error_2[key];
                    }
                }
                return this[name];
            },
            set: function (value) {
                // setter will set value to local property value
                this[name] = value;
            }
        };
    };
    // fix #595, create property descriptor
    // for error method properties
    var createMethodProperty = function (props, key) {
        if (props[key]) {
            return;
        }
        props[key] = {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function () {
                var error = this[__symbol__('error')];
                var errorMethod = (error && error[key]) || this[key];
                if (errorMethod) {
                    return errorMethod.apply(error, arguments);
                }
            }
        };
    };
    var createErrorProperties = function () {
        var props = Object.create(null);
        var error = new NativeError();
        var keys = Object.getOwnPropertyNames(error);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(error, key)) {
                createProperty(props, key);
            }
        }
        var proto = NativeError.prototype;
        if (proto) {
            var pKeys = Object.getOwnPropertyNames(proto);
            for (var i = 0; i < pKeys.length; i++) {
                var key = pKeys[i];
                // skip constructor
                if (key !== 'constructor' && key !== 'toString' && key !== 'toSource') {
                    createProperty(props, key);
                }
            }
        }
        // some other properties are not
        // in NativeError
        createProperty(props, 'originalStack');
        createProperty(props, 'zoneAwareStack');
        // define toString, toSource as method property
        createMethodProperty(props, 'toString');
        createMethodProperty(props, 'toSource');
        return props;
    };
    var errorProperties = createErrorProperties();
    // for derived Error class which extends ZoneAwareError
    // we should not override the derived class's property
    // so we create a new props object only copy the properties
    // from errorProperties which not exist in derived Error's prototype
    var getErrorPropertiesForPrototype = function (prototype) {
        // if the prototype is ZoneAwareError.prototype
        // we just return the prebuilt errorProperties.
        if (prototype === ZoneAwareError.prototype) {
            return errorProperties;
        }
        var newProps = Object.create(null);
        var cKeys = Object.getOwnPropertyNames(errorProperties);
        var keys = Object.getOwnPropertyNames(prototype);
        cKeys.forEach(function (cKey) {
            if (keys.filter(function (key) {
                return key === cKey;
            })
                .length === 0) {
                newProps[cKey] = errorProperties[cKey];
            }
        });
        return newProps;
    };
    /**
     * This is ZoneAwareError which processes the stack frame and cleans up extra frames as well as
     * adds zone information to it.
     */
    function ZoneAwareError() {
        // make sure we have a valid this
        // if this is undefined(call Error without new) or this is global
        // or this is some other objects, we should force to create a
        // valid ZoneAwareError by call Object.create()
        if (!(this instanceof ZoneAwareError)) {
            return ZoneAwareError.apply(Object.create(ZoneAwareError.prototype), arguments);
        }
        // Create an Error.
        var error = NativeError.apply(this, arguments);
        this[__symbol__('error')] = error;
        // Save original stack trace
        error.originalStack = error.stack;
        // Process the stack trace and rewrite the frames.
        if (ZoneAwareError[stackRewrite] && error.originalStack) {
            var frames_1 = error.originalStack.split('\n');
            var zoneFrame = _currentZoneFrame;
            var i = 0;
            // Find the first frame
            while (frames_1[i] !== zoneAwareFrame && i < frames_1.length) {
                i++;
            }
            for (; i < frames_1.length && zoneFrame; i++) {
                var frame = frames_1[i];
                if (frame.trim()) {
                    var frameType = blackListedStackFrames.hasOwnProperty(frame) && blackListedStackFrames[frame];
                    if (frameType === FrameType.blackList) {
                        frames_1.splice(i, 1);
                        i--;
                    }
                    else if (frameType === FrameType.transition) {
                        if (zoneFrame.parent) {
                            // This is the special frame where zone changed. Print and process it accordingly
                            frames_1[i] += " [" + zoneFrame.parent.zone.name + " => " + zoneFrame.zone.name + "]";
                            zoneFrame = zoneFrame.parent;
                        }
                        else {
                            zoneFrame = null;
                        }
                    }
                    else {
                        frames_1[i] += " [" + zoneFrame.zone.name + "]";
                    }
                }
            }
            error.stack = error.zoneAwareStack = frames_1.join('\n');
        }
        // use defineProperties here instead of copy property value
        // because of issue #595 which will break angular2.
        Object.defineProperties(this, getErrorPropertiesForPrototype(Object.getPrototypeOf(this)));
        return this;
    }
    // Copy the prototype so that instanceof operator works as expected
    ZoneAwareError.prototype = NativeError.prototype;
    ZoneAwareError[Zone.__symbol__('blacklistedStackFrames')] = blackListedStackFrames;
    ZoneAwareError[stackRewrite] = false;
    if (NativeError.hasOwnProperty('stackTraceLimit')) {
        // Extend default stack limit as we will be removing few frames.
        NativeError.stackTraceLimit = Math.max(NativeError.stackTraceLimit, 15);
        // make sure that ZoneAwareError has the same property which forwards to NativeError.
        Object.defineProperty(ZoneAwareError, 'stackTraceLimit', {
            get: function () {
                return NativeError.stackTraceLimit;
            },
            set: function (value) {
                return NativeError.stackTraceLimit = value;
            }
        });
    }
    if (NativeError.hasOwnProperty('captureStackTrace')) {
        Object.defineProperty(ZoneAwareError, 'captureStackTrace', {
            // add named function here because we need to remove this
            // stack frame when prepareStackTrace below
            value: function zoneCaptureStackTrace(targetObject, constructorOpt) {
                NativeError.captureStackTrace(targetObject, constructorOpt);
            }
        });
    }
    Object.defineProperty(ZoneAwareError, 'prepareStackTrace', {
        get: function () {
            return NativeError.prepareStackTrace;
        },
        set: function (value) {
            if (!value || typeof value !== 'function') {
                return NativeError.prepareStackTrace = value;
            }
            return NativeError.prepareStackTrace = function (error, structuredStackTrace) {
                // remove additional stack information from ZoneAwareError.captureStackTrace
                if (structuredStackTrace) {
                    for (var i = 0; i < structuredStackTrace.length; i++) {
                        var st = structuredStackTrace[i];
                        // remove the first function which name is zoneCaptureStackTrace
                        if (st.getFunctionName() === 'zoneCaptureStackTrace') {
                            structuredStackTrace.splice(i, 1);
                            break;
                        }
                    }
                }
                return value.apply(this, [error, structuredStackTrace]);
            };
        }
    });
    // Now we need to populet the `blacklistedStackFrames` as well as find the
    // run/runGuraded/runTask frames. This is done by creating a detect zone and then threading
    // the execution through all of the above methods so that we can look at the stack trace and
    // find the frames of interest.
    var detectZone = Zone.current.fork({
        name: 'detect',
        onInvoke: function (parentZoneDelegate, currentZone, targetZone, delegate, applyThis, applyArgs, source) {
            // Here only so that it will show up in the stack frame so that it can be black listed.
            return parentZoneDelegate.invoke(targetZone, delegate, applyThis, applyArgs, source);
        },
        onHandleError: function (parentZD, current, target, error) {
            if (error.originalStack && Error === ZoneAwareError) {
                var frames_2 = error.originalStack.split(/\n/);
                var runFrame = false, runGuardedFrame = false, runTaskFrame = false;
                while (frames_2.length) {
                    var frame = frames_2.shift();
                    // On safari it is possible to have stack frame with no line number.
                    // This check makes sure that we don't filter frames on name only (must have
                    // linenumber)
                    if (/:\d+:\d+/.test(frame)) {
                        // Get rid of the path so that we don't accidintely find function name in path.
                        // In chrome the seperator is `(` and `@` in FF and safari
                        // Chrome: at Zone.run (zone.js:100)
                        // Chrome: at Zone.run (http://localhost:9876/base/build/lib/zone.js:100:24)
                        // FireFox: Zone.prototype.run@http://localhost:9876/base/build/lib/zone.js:101:24
                        // Safari: run@http://localhost:9876/base/build/lib/zone.js:101:24
                        var fnName = frame.split('(')[0].split('@')[0];
                        var frameType = FrameType.transition;
                        if (fnName.indexOf('ZoneAwareError') !== -1) {
                            zoneAwareFrame = frame;
                        }
                        if (fnName.indexOf('runGuarded') !== -1) {
                            runGuardedFrame = true;
                        }
                        else if (fnName.indexOf('runTask') !== -1) {
                            runTaskFrame = true;
                        }
                        else if (fnName.indexOf('run') !== -1) {
                            runFrame = true;
                        }
                        else {
                            frameType = FrameType.blackList;
                        }
                        blackListedStackFrames[frame] = frameType;
                        // Once we find all of the frames we can stop looking.
                        if (runFrame && runGuardedFrame && runTaskFrame) {
                            ZoneAwareError[stackRewrite] = true;
                            break;
                        }
                    }
                }
            }
            return false;
        }
    });
    // carefully constructor a stack frame which contains all of the frames of interest which
    // need to be detected and blacklisted.
    var detectRunFn = function () {
        detectZone.run(function () {
            detectZone.runGuarded(function () {
                throw new Error('blacklistStackFrames');
            });
        });
    };
    // Cause the error to extract the stack frames.
    detectZone.runTask(detectZone.scheduleMacroTask('detect', detectRunFn, null, function () { return null; }, null));
    return global['Zone'] = Zone;
})(typeof window === 'object' && window || typeof self === 'object' && self || global);

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Suppress closure compiler errors about unknown 'Zone' variable
 * @fileoverview
 * @suppress {undefinedVars}
 */
var zoneSymbol = function (n) { return "__zone_symbol__" + n; };
var _global$1 = typeof window === 'object' && window || typeof self === 'object' && self || global;
function bindArguments(args, source) {
    for (var i = args.length - 1; i >= 0; i--) {
        if (typeof args[i] === 'function') {
            args[i] = Zone.current.wrap(args[i], source + '_' + i);
        }
    }
    return args;
}
function patchPrototype(prototype, fnNames) {
    var source = prototype.constructor['name'];
    var _loop_1 = function (i) {
        var name_1 = fnNames[i];
        var delegate = prototype[name_1];
        if (delegate) {
            prototype[name_1] = (function (delegate) {
                return function () {
                    return delegate.apply(this, bindArguments(arguments, source + '.' + name_1));
                };
            })(delegate);
        }
    };
    for (var i = 0; i < fnNames.length; i++) {
        _loop_1(i);
    }
}
var isWebWorker = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);
var isNode = (!('nw' in _global$1) && typeof process !== 'undefined' &&
    {}.toString.call(process) === '[object process]');
var isBrowser = !isNode && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']);
function patchProperty(obj, prop) {
    var desc = Object.getOwnPropertyDescriptor(obj, prop) || { enumerable: true, configurable: true };
    var originalDesc = Object.getOwnPropertyDescriptor(obj, 'original' + prop);
    if (!originalDesc && desc.get) {
        Object.defineProperty(obj, 'original' + prop, { enumerable: false, configurable: true, get: desc.get });
    }
    // A property descriptor cannot have getter/setter and be writable
    // deleting the writable and value properties avoids this error:
    //
    // TypeError: property descriptors must not specify a value or be writable when a
    // getter or setter has been specified
    delete desc.writable;
    delete desc.value;
    // substr(2) cuz 'onclick' -> 'click', etc
    var eventName = prop.substr(2);
    var _prop = '_' + prop;
    desc.set = function (fn) {
        if (this[_prop]) {
            this.removeEventListener(eventName, this[_prop]);
        }
        if (typeof fn === 'function') {
            var wrapFn = function (event) {
                var result;
                result = fn.apply(this, arguments);
                if (result != undefined && !result)
                    event.preventDefault();
            };
            this[_prop] = wrapFn;
            this.addEventListener(eventName, wrapFn, false);
        }
        else {
            this[_prop] = null;
        }
    };
    // The getter would return undefined for unassigned properties but the default value of an
    // unassigned property is null
    desc.get = function () {
        var r = this[_prop] || null;
        // result will be null when use inline event attribute,
        // such as <button onclick="func();">OK</button>
        // because the onclick function is internal raw uncompiled handler
        // the onclick will be evaluated when first time event was triggered or
        // the property is accessed, https://github.com/angular/zone.js/issues/525
        // so we should use original native get to retrieve the handler
        if (r === null) {
            if (originalDesc && originalDesc.get) {
                r = originalDesc.get.apply(this, arguments);
                if (r) {
                    desc.set.apply(this, [r]);
                    if (typeof this['removeAttribute'] === 'function') {
                        this.removeAttribute(prop);
                    }
                }
            }
        }
        return this[_prop] || null;
    };
    Object.defineProperty(obj, prop, desc);
}

function patchOnProperties(obj, properties) {
    var onProperties = [];
    for (var prop in obj) {
        if (prop.substr(0, 2) == 'on') {
            onProperties.push(prop);
        }
    }
    for (var j = 0; j < onProperties.length; j++) {
        patchProperty(obj, onProperties[j]);
    }
    if (properties) {
        for (var i = 0; i < properties.length; i++) {
            patchProperty(obj, 'on' + properties[i]);
        }
    }
}

var EVENT_TASKS = zoneSymbol('eventTasks');
// For EventTarget
var ADD_EVENT_LISTENER = 'addEventListener';
var REMOVE_EVENT_LISTENER = 'removeEventListener';
function findExistingRegisteredTask(target, handler, name, capture, remove) {
    var eventTasks = target[EVENT_TASKS];
    if (eventTasks) {
        for (var i = 0; i < eventTasks.length; i++) {
            var eventTask = eventTasks[i];
            var data = eventTask.data;
            var listener = data.handler;
            if ((data.handler === handler || listener.listener === handler) &&
                data.useCapturing === capture && data.eventName === name) {
                if (remove) {
                    eventTasks.splice(i, 1);
                }
                return eventTask;
            }
        }
    }
    return null;
}
function findAllExistingRegisteredTasks(target, name, capture, remove) {
    var eventTasks = target[EVENT_TASKS];
    if (eventTasks) {
        var result = [];
        for (var i = eventTasks.length - 1; i >= 0; i--) {
            var eventTask = eventTasks[i];
            var data = eventTask.data;
            if (data.eventName === name && data.useCapturing === capture) {
                result.push(eventTask);
                if (remove) {
                    eventTasks.splice(i, 1);
                }
            }
        }
        return result;
    }
    return null;
}
function attachRegisteredEvent(target, eventTask, isPrepend) {
    var eventTasks = target[EVENT_TASKS];
    if (!eventTasks) {
        eventTasks = target[EVENT_TASKS] = [];
    }
    if (isPrepend) {
        eventTasks.unshift(eventTask);
    }
    else {
        eventTasks.push(eventTask);
    }
}
var defaultListenerMetaCreator = function (self, args) {
    return {
        useCapturing: args[2],
        eventName: args[0],
        handler: args[1],
        target: self || _global$1,
        name: args[0],
        invokeAddFunc: function (addFnSymbol, delegate) {
            if (delegate && delegate.invoke) {
                return this.target[addFnSymbol](this.eventName, delegate.invoke, this.useCapturing);
            }
            else {
                return this.target[addFnSymbol](this.eventName, delegate, this.useCapturing);
            }
        },
        invokeRemoveFunc: function (removeFnSymbol, delegate) {
            if (delegate && delegate.invoke) {
                return this.target[removeFnSymbol](this.eventName, delegate.invoke, this.useCapturing);
            }
            else {
                return this.target[removeFnSymbol](this.eventName, delegate, this.useCapturing);
            }
        }
    };
};
function makeZoneAwareAddListener(addFnName, removeFnName, useCapturingParam, allowDuplicates, isPrepend, metaCreator) {
    if (useCapturingParam === void 0) { useCapturingParam = true; }
    if (allowDuplicates === void 0) { allowDuplicates = false; }
    if (isPrepend === void 0) { isPrepend = false; }
    if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
    var addFnSymbol = zoneSymbol(addFnName);
    var removeFnSymbol = zoneSymbol(removeFnName);
    var defaultUseCapturing = useCapturingParam ? false : undefined;
    function scheduleEventListener(eventTask) {
        var meta = eventTask.data;
        attachRegisteredEvent(meta.target, eventTask, isPrepend);
        return meta.invokeAddFunc(addFnSymbol, eventTask);
    }
    function cancelEventListener(eventTask) {
        var meta = eventTask.data;
        findExistingRegisteredTask(meta.target, eventTask.invoke, meta.eventName, meta.useCapturing, true);
        return meta.invokeRemoveFunc(removeFnSymbol, eventTask);
    }
    return function zoneAwareAddListener(self, args) {
        var data = metaCreator(self, args);
        data.useCapturing = data.useCapturing || defaultUseCapturing;
        // - Inside a Web Worker, `this` is undefined, the context is `global`
        // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
        // see https://github.com/angular/zone.js/issues/190
        var delegate = null;
        if (typeof data.handler == 'function') {
            delegate = data.handler;
        }
        else if (data.handler && data.handler.handleEvent) {
            delegate = function (event) { return data.handler.handleEvent(event); };
        }
        var validZoneHandler = false;
        try {
            // In cross site contexts (such as WebDriver frameworks like Selenium),
            // accessing the handler object here will cause an exception to be thrown which
            // will fail tests prematurely.
            validZoneHandler = data.handler && data.handler.toString() === '[object FunctionWrapper]';
        }
        catch (e) {
            // Returning nothing here is fine, because objects in a cross-site context are unusable
            return;
        }
        // Ignore special listeners of IE11 & Edge dev tools, see
        // https://github.com/angular/zone.js/issues/150
        if (!delegate || validZoneHandler) {
            return data.invokeAddFunc(addFnSymbol, data.handler);
        }
        if (!allowDuplicates) {
            var eventTask = findExistingRegisteredTask(data.target, data.handler, data.eventName, data.useCapturing, false);
            if (eventTask) {
                // we already registered, so this will have noop.
                return data.invokeAddFunc(addFnSymbol, eventTask);
            }
        }
        var zone = Zone.current;
        var source = data.target.constructor['name'] + '.' + addFnName + ':' + data.eventName;
        zone.scheduleEventTask(source, delegate, data, scheduleEventListener, cancelEventListener);
    };
}
function makeZoneAwareRemoveListener(fnName, useCapturingParam, metaCreator) {
    if (useCapturingParam === void 0) { useCapturingParam = true; }
    if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
    var symbol = zoneSymbol(fnName);
    var defaultUseCapturing = useCapturingParam ? false : undefined;
    return function zoneAwareRemoveListener(self, args) {
        var data = metaCreator(self, args);
        data.useCapturing = data.useCapturing || defaultUseCapturing;
        // - Inside a Web Worker, `this` is undefined, the context is `global`
        // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
        // see https://github.com/angular/zone.js/issues/190
        var eventTask = findExistingRegisteredTask(data.target, data.handler, data.eventName, data.useCapturing, true);
        if (eventTask) {
            eventTask.zone.cancelTask(eventTask);
        }
        else {
            data.invokeRemoveFunc(symbol, data.handler);
        }
    };
}


var zoneAwareAddEventListener = makeZoneAwareAddListener(ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER);
var zoneAwareRemoveEventListener = makeZoneAwareRemoveListener(REMOVE_EVENT_LISTENER);
function patchEventTargetMethods(obj, addFnName, removeFnName, metaCreator) {
    if (addFnName === void 0) { addFnName = ADD_EVENT_LISTENER; }
    if (removeFnName === void 0) { removeFnName = REMOVE_EVENT_LISTENER; }
    if (metaCreator === void 0) { metaCreator = defaultListenerMetaCreator; }
    if (obj && obj[addFnName]) {
        patchMethod(obj, addFnName, function () { return makeZoneAwareAddListener(addFnName, removeFnName, true, false, false, metaCreator); });
        patchMethod(obj, removeFnName, function () { return makeZoneAwareRemoveListener(removeFnName, true, metaCreator); });
        return true;
    }
    else {
        return false;
    }
}
var originalInstanceKey = zoneSymbol('originalInstance');
// wrap some native API on `window`
function patchClass(className) {
    var OriginalClass = _global$1[className];
    if (!OriginalClass)
        return;
    _global$1[className] = function () {
        var a = bindArguments(arguments, className);
        switch (a.length) {
            case 0:
                this[originalInstanceKey] = new OriginalClass();
                break;
            case 1:
                this[originalInstanceKey] = new OriginalClass(a[0]);
                break;
            case 2:
                this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
                break;
            case 3:
                this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
                break;
            case 4:
                this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
                break;
            default:
                throw new Error('Arg list too long.');
        }
    };
    var instance = new OriginalClass(function () { });
    var prop;
    for (prop in instance) {
        // https://bugs.webkit.org/show_bug.cgi?id=44721
        if (className === 'XMLHttpRequest' && prop === 'responseBlob')
            continue;
        (function (prop) {
            if (typeof instance[prop] === 'function') {
                _global$1[className].prototype[prop] = function () {
                    return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
                };
            }
            else {
                Object.defineProperty(_global$1[className].prototype, prop, {
                    set: function (fn) {
                        if (typeof fn === 'function') {
                            this[originalInstanceKey][prop] = Zone.current.wrap(fn, className + '.' + prop);
                        }
                        else {
                            this[originalInstanceKey][prop] = fn;
                        }
                    },
                    get: function () {
                        return this[originalInstanceKey][prop];
                    }
                });
            }
        }(prop));
    }
    for (prop in OriginalClass) {
        if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
            _global$1[className][prop] = OriginalClass[prop];
        }
    }
}

function createNamedFn(name, delegate) {
    try {
        return (Function('f', "return function " + name + "(){return f(this, arguments)}"))(delegate);
    }
    catch (e) {
        // if we fail, we must be CSP, just return delegate.
        return function () {
            return delegate(this, arguments);
        };
    }
}
function patchMethod(target, name, patchFn) {
    var proto = target;
    while (proto && Object.getOwnPropertyNames(proto).indexOf(name) === -1) {
        proto = Object.getPrototypeOf(proto);
    }
    if (!proto && target[name]) {
        // somehow we did not find it, but we can see it. This happens on IE for Window properties.
        proto = target;
    }
    var delegateName = zoneSymbol(name);
    var delegate;
    if (proto && !(delegate = proto[delegateName])) {
        delegate = proto[delegateName] = proto[name];
        proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name));
    }
    return delegate;
}
// TODO: support cancel task later if necessary

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function patchTimer(window, setName, cancelName, nameSuffix) {
    var setNative = null;
    var clearNative = null;
    setName += nameSuffix;
    cancelName += nameSuffix;
    var tasksByHandleId = {};
    function scheduleTask(task) {
        var data = task.data;
        data.args[0] = function () {
            task.invoke.apply(this, arguments);
            delete tasksByHandleId[data.handleId];
        };
        data.handleId = setNative.apply(window, data.args);
        tasksByHandleId[data.handleId] = task;
        return task;
    }
    function clearTask(task) {
        delete tasksByHandleId[task.data.handleId];
        return clearNative(task.data.handleId);
    }
    setNative =
        patchMethod(window, setName, function (delegate) { return function (self, args) {
            if (typeof args[0] === 'function') {
                var zone = Zone.current;
                var options = {
                    handleId: null,
                    isPeriodic: nameSuffix === 'Interval',
                    delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 : null,
                    args: args
                };
                var task = zone.scheduleMacroTask(setName, args[0], options, scheduleTask, clearTask);
                if (!task) {
                    return task;
                }
                // Node.js must additionally support the ref and unref functions.
                var handle = task.data.handleId;
                if (handle.ref && handle.unref) {
                    task.ref = handle.ref.bind(handle);
                    task.unref = handle.unref.bind(handle);
                }
                return task;
            }
            else {
                // cause an error by calling it directly.
                return delegate.apply(window, args);
            }
        }; });
    clearNative =
        patchMethod(window, cancelName, function (delegate) { return function (self, args) {
            var task = typeof args[0] === 'number' ? tasksByHandleId[args[0]] : args[0];
            if (task && typeof task.type === 'string') {
                if (task.cancelFn && task.data.isPeriodic || task.runCount === 0) {
                    // Do not cancel already canceled functions
                    task.zone.cancelTask(task);
                }
            }
            else {
                // cause an error by calling it directly.
                delegate.apply(window, args);
            }
        }; });
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/*
 * This is necessary for Chrome and Chrome mobile, to enable
 * things like redefining `createdCallback` on an element.
 */
var _defineProperty = Object[zoneSymbol('defineProperty')] = Object.defineProperty;
var _getOwnPropertyDescriptor = Object[zoneSymbol('getOwnPropertyDescriptor')] =
    Object.getOwnPropertyDescriptor;
var _create = Object.create;
var unconfigurablesKey = zoneSymbol('unconfigurables');
function propertyPatch() {
    Object.defineProperty = function (obj, prop, desc) {
        if (isUnconfigurable(obj, prop)) {
            throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
        }
        var originalConfigurableFlag = desc.configurable;
        if (prop !== 'prototype') {
            desc = rewriteDescriptor(obj, prop, desc);
        }
        return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
    };
    Object.defineProperties = function (obj, props) {
        Object.keys(props).forEach(function (prop) {
            Object.defineProperty(obj, prop, props[prop]);
        });
        return obj;
    };
    Object.create = function (obj, proto) {
        if (typeof proto === 'object' && !Object.isFrozen(proto)) {
            Object.keys(proto).forEach(function (prop) {
                proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
            });
        }
        return _create(obj, proto);
    };
    Object.getOwnPropertyDescriptor = function (obj, prop) {
        var desc = _getOwnPropertyDescriptor(obj, prop);
        if (isUnconfigurable(obj, prop)) {
            desc.configurable = false;
        }
        return desc;
    };
}

function _redefineProperty(obj, prop, desc) {
    var originalConfigurableFlag = desc.configurable;
    desc = rewriteDescriptor(obj, prop, desc);
    return _tryDefineProperty(obj, prop, desc, originalConfigurableFlag);
}

function isUnconfigurable(obj, prop) {
    return obj && obj[unconfigurablesKey] && obj[unconfigurablesKey][prop];
}
function rewriteDescriptor(obj, prop, desc) {
    desc.configurable = true;
    if (!desc.configurable) {
        if (!obj[unconfigurablesKey]) {
            _defineProperty(obj, unconfigurablesKey, { writable: true, value: {} });
        }
        obj[unconfigurablesKey][prop] = true;
    }
    return desc;
}
function _tryDefineProperty(obj, prop, desc, originalConfigurableFlag) {
    try {
        return _defineProperty(obj, prop, desc);
    }
    catch (e) {
        if (desc.configurable) {
            // In case of errors, when the configurable flag was likely set by rewriteDescriptor(), let's
            // retry with the original flag value
            if (typeof originalConfigurableFlag == 'undefined') {
                delete desc.configurable;
            }
            else {
                desc.configurable = originalConfigurableFlag;
            }
            try {
                return _defineProperty(obj, prop, desc);
            }
            catch (e) {
                var descJson = null;
                try {
                    descJson = JSON.stringify(desc);
                }
                catch (e) {
                    descJson = descJson.toString();
                }
                console.log("Attempting to configure '" + prop + "' with descriptor '" + descJson + "' on object '" + obj + "' and got error, giving up: " + e);
            }
        }
        else {
            throw e;
        }
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var WTF_ISSUE_555 = 'Anchor,Area,Audio,BR,Base,BaseFont,Body,Button,Canvas,Content,DList,Directory,Div,Embed,FieldSet,Font,Form,Frame,FrameSet,HR,Head,Heading,Html,IFrame,Image,Input,Keygen,LI,Label,Legend,Link,Map,Marquee,Media,Menu,Meta,Meter,Mod,OList,Object,OptGroup,Option,Output,Paragraph,Pre,Progress,Quote,Script,Select,Source,Span,Style,TableCaption,TableCell,TableCol,Table,TableRow,TableSection,TextArea,Title,Track,UList,Unknown,Video';
var NO_EVENT_TARGET = 'ApplicationCache,EventSource,FileReader,InputMethodContext,MediaController,MessagePort,Node,Performance,SVGElementInstance,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebKitNamedFlow,Window,Worker,WorkerGlobalScope,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload,IDBRequest,IDBOpenDBRequest,IDBDatabase,IDBTransaction,IDBCursor,DBIndex,WebSocket'
    .split(',');
var EVENT_TARGET = 'EventTarget';
function eventTargetPatch(_global) {
    var apis = [];
    var isWtf = _global['wtf'];
    if (isWtf) {
        // Workaround for: https://github.com/google/tracing-framework/issues/555
        apis = WTF_ISSUE_555.split(',').map(function (v) { return 'HTML' + v + 'Element'; }).concat(NO_EVENT_TARGET);
    }
    else if (_global[EVENT_TARGET]) {
        apis.push(EVENT_TARGET);
    }
    else {
        // Note: EventTarget is not available in all browsers,
        // if it's not available, we instead patch the APIs in the IDL that inherit from EventTarget
        apis = NO_EVENT_TARGET;
    }
    for (var i = 0; i < apis.length; i++) {
        var type = _global[apis[i]];
        patchEventTargetMethods(type && type.prototype);
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// we have to patch the instance since the proto is non-configurable
function apply(_global) {
    var WS = _global.WebSocket;
    // On Safari window.EventTarget doesn't exist so need to patch WS add/removeEventListener
    // On older Chrome, no need since EventTarget was already patched
    if (!_global.EventTarget) {
        patchEventTargetMethods(WS.prototype);
    }
    _global.WebSocket = function (a, b) {
        var socket = arguments.length > 1 ? new WS(a, b) : new WS(a);
        var proxySocket;
        // Safari 7.0 has non-configurable own 'onmessage' and friends properties on the socket instance
        var onmessageDesc = Object.getOwnPropertyDescriptor(socket, 'onmessage');
        if (onmessageDesc && onmessageDesc.configurable === false) {
            proxySocket = Object.create(socket);
            ['addEventListener', 'removeEventListener', 'send', 'close'].forEach(function (propName) {
                proxySocket[propName] = function () {
                    return socket[propName].apply(socket, arguments);
                };
            });
        }
        else {
            // we can patch the real socket
            proxySocket = socket;
        }
        patchOnProperties(proxySocket, ['close', 'error', 'message', 'open']);
        return proxySocket;
    };
    for (var prop in WS) {
        _global.WebSocket[prop] = WS[prop];
    }
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var eventNames = 'copy cut paste abort blur focus canplay canplaythrough change click contextmenu dblclick drag dragend dragenter dragleave dragover dragstart drop durationchange emptied ended input invalid keydown keypress keyup load loadeddata loadedmetadata loadstart message mousedown mouseenter mouseleave mousemove mouseout mouseover mouseup pause play playing progress ratechange reset scroll seeked seeking select show stalled submit suspend timeupdate volumechange waiting mozfullscreenchange mozfullscreenerror mozpointerlockchange mozpointerlockerror error webglcontextrestored webglcontextlost webglcontextcreationerror'
    .split(' ');
function propertyDescriptorPatch(_global) {
    if (isNode) {
        return;
    }
    var supportsWebSocket = typeof WebSocket !== 'undefined';
    if (canPatchViaPropertyDescriptor()) {
        // for browsers that we can patch the descriptor:  Chrome & Firefox
        if (isBrowser) {
            patchOnProperties(HTMLElement.prototype, eventNames);
        }
        patchOnProperties(XMLHttpRequest.prototype, null);
        if (typeof IDBIndex !== 'undefined') {
            patchOnProperties(IDBIndex.prototype, null);
            patchOnProperties(IDBRequest.prototype, null);
            patchOnProperties(IDBOpenDBRequest.prototype, null);
            patchOnProperties(IDBDatabase.prototype, null);
            patchOnProperties(IDBTransaction.prototype, null);
            patchOnProperties(IDBCursor.prototype, null);
        }
        if (supportsWebSocket) {
            patchOnProperties(WebSocket.prototype, null);
        }
    }
    else {
        // Safari, Android browsers (Jelly Bean)
        patchViaCapturingAllTheEvents();
        patchClass('XMLHttpRequest');
        if (supportsWebSocket) {
            apply(_global);
        }
    }
}
function canPatchViaPropertyDescriptor() {
    if (isBrowser && !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick') &&
        typeof Element !== 'undefined') {
        // WebKit https://bugs.webkit.org/show_bug.cgi?id=134364
        // IDL interface attributes are not configurable
        var desc = Object.getOwnPropertyDescriptor(Element.prototype, 'onclick');
        if (desc && !desc.configurable)
            return false;
    }
    var xhrDesc = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'onreadystatechange');
    // add enumerable and configurable here because in opera
    // by default XMLHttpRequest.prototype.onreadystatechange is undefined
    // without adding enumerable and configurable will cause onreadystatechange
    // non-configurable
    Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', {
        enumerable: true,
        configurable: true,
        get: function () {
            return true;
        }
    });
    var req = new XMLHttpRequest();
    var result = !!req.onreadystatechange;
    // restore original desc
    Object.defineProperty(XMLHttpRequest.prototype, 'onreadystatechange', xhrDesc || {});
    return result;
}

var unboundKey = zoneSymbol('unbound');
// Whenever any eventListener fires, we check the eventListener target and all parents
// for `onwhatever` properties and replace them with zone-bound functions
// - Chrome (for now)
function patchViaCapturingAllTheEvents() {
    var _loop_1 = function (i) {
        var property = eventNames[i];
        var onproperty = 'on' + property;
        self.addEventListener(property, function (event) {
            var elt = event.target, bound, source;
            if (elt) {
                source = elt.constructor['name'] + '.' + onproperty;
            }
            else {
                source = 'unknown.' + onproperty;
            }
            while (elt) {
                if (elt[onproperty] && !elt[onproperty][unboundKey]) {
                    bound = Zone.current.wrap(elt[onproperty], source);
                    bound[unboundKey] = elt[onproperty];
                    elt[onproperty] = bound;
                }
                elt = elt.parentElement;
            }
        }, true);
    };
    for (var i = 0; i < eventNames.length; i++) {
        _loop_1(i);
    }
    
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
function registerElementPatch(_global) {
    if (!isBrowser || !('registerElement' in _global.document)) {
        return;
    }
    var _registerElement = document.registerElement;
    var callbacks = ['createdCallback', 'attachedCallback', 'detachedCallback', 'attributeChangedCallback'];
    document.registerElement = function (name, opts) {
        if (opts && opts.prototype) {
            callbacks.forEach(function (callback) {
                var source = 'Document.registerElement::' + callback;
                if (opts.prototype.hasOwnProperty(callback)) {
                    var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
                    if (descriptor && descriptor.value) {
                        descriptor.value = Zone.current.wrap(descriptor.value, source);
                        _redefineProperty(opts.prototype, callback, descriptor);
                    }
                    else {
                        opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                    }
                }
                else if (opts.prototype[callback]) {
                    opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                }
            });
        }
        return _registerElement.apply(document, [name, opts]);
    };
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
var set = 'set';
var clear = 'clear';
var blockingMethods = ['alert', 'prompt', 'confirm'];
var _global = typeof window === 'object' && window || typeof self === 'object' && self || global;
patchTimer(_global, set, clear, 'Timeout');
patchTimer(_global, set, clear, 'Interval');
patchTimer(_global, set, clear, 'Immediate');
patchTimer(_global, 'request', 'cancel', 'AnimationFrame');
patchTimer(_global, 'mozRequest', 'mozCancel', 'AnimationFrame');
patchTimer(_global, 'webkitRequest', 'webkitCancel', 'AnimationFrame');
for (var i = 0; i < blockingMethods.length; i++) {
    var name_1 = blockingMethods[i];
    patchMethod(_global, name_1, function (delegate, symbol, name) {
        return function (s, args) {
            return Zone.current.run(delegate, _global, args, name);
        };
    });
}
eventTargetPatch(_global);
propertyDescriptorPatch(_global);
patchClass('MutationObserver');
patchClass('WebKitMutationObserver');
patchClass('FileReader');
propertyPatch();
registerElementPatch(_global);
// Treat XMLHTTPRequest as a macrotask.
patchXHR(_global);
var XHR_TASK = zoneSymbol('xhrTask');
var XHR_SYNC = zoneSymbol('xhrSync');
var XHR_LISTENER = zoneSymbol('xhrListener');
var XHR_SCHEDULED = zoneSymbol('xhrScheduled');
function patchXHR(window) {
    function findPendingTask(target) {
        var pendingTask = target[XHR_TASK];
        return pendingTask;
    }
    function scheduleTask(task) {
        self[XHR_SCHEDULED] = false;
        var data = task.data;
        // remove existing event listener
        var listener = data.target[XHR_LISTENER];
        if (listener) {
            data.target.removeEventListener('readystatechange', listener);
        }
        var newListener = data.target[XHR_LISTENER] = function () {
            if (data.target.readyState === data.target.DONE) {
                if (!data.aborted && self[XHR_SCHEDULED]) {
                    task.invoke();
                }
            }
        };
        data.target.addEventListener('readystatechange', newListener);
        var storedTask = data.target[XHR_TASK];
        if (!storedTask) {
            data.target[XHR_TASK] = task;
        }
        sendNative.apply(data.target, data.args);
        self[XHR_SCHEDULED] = true;
        return task;
    }
    function placeholderCallback() { }
    function clearTask(task) {
        var data = task.data;
        // Note - ideally, we would call data.target.removeEventListener here, but it's too late
        // to prevent it from firing. So instead, we store info for the event listener.
        data.aborted = true;
        return abortNative.apply(data.target, data.args);
    }
    var openNative = patchMethod(window.XMLHttpRequest.prototype, 'open', function () { return function (self, args) {
        self[XHR_SYNC] = args[2] == false;
        return openNative.apply(self, args);
    }; });
    var sendNative = patchMethod(window.XMLHttpRequest.prototype, 'send', function () { return function (self, args) {
        var zone = Zone.current;
        if (self[XHR_SYNC]) {
            // if the XHR is sync there is no task to schedule, just execute the code.
            return sendNative.apply(self, args);
        }
        else {
            var options = { target: self, isPeriodic: false, delay: null, args: args, aborted: false };
            return zone.scheduleMacroTask('XMLHttpRequest.send', placeholderCallback, options, scheduleTask, clearTask);
        }
    }; });
    var abortNative = patchMethod(window.XMLHttpRequest.prototype, 'abort', function (delegate) { return function (self, args) {
        var task = findPendingTask(self);
        if (task && typeof task.type == 'string') {
            // If the XHR has already completed, do nothing.
            // If the XHR has already been aborted, do nothing.
            // Fix #569, call abort multiple times before done will cause
            // macroTask task count be negative number
            if (task.cancelFn == null || (task.data && task.data.aborted)) {
                return;
            }
            task.zone.cancelTask(task);
        }
        // Otherwise, we are trying to abort an XHR which has not yet been sent, so there is no task
        // to cancel. Do nothing.
    }; });
}
/// GEO_LOCATION
if (_global['navigator'] && _global['navigator'].geolocation) {
    patchPrototype(_global['navigator'].geolocation, ['getCurrentPosition', 'watchPosition']);
}

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

})));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(11), __webpack_require__(20)))

/***/ }),

/***/ "./src/main/webapp/app/polyfills.ts":
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* tslint:disable */
__webpack_require__("./node_modules/reflect-metadata/Reflect.ts");
__webpack_require__("./node_modules/zone.js/dist/zone.js");


/***/ }),

/***/ 11:
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(5))(48);

/***/ }),

/***/ 20:
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(5))(607);

/***/ }),

/***/ 5:
/***/ (function(module, exports) {

module.exports = vendor;

/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

module.exports = (__webpack_require__(5))(232);

/***/ })

},["./src/main/webapp/app/polyfills.ts"]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9+L3JlZmxlY3QtbWV0YWRhdGEvUmVmbGVjdC50cyIsIndlYnBhY2s6Ly8vLi9+L3pvbmUuanMvZGlzdC96b25lLmpzIiwid2VicGFjazovLy8uL3NyYy9tYWluL3dlYmFwcC9hcHAvcG9seWZpbGxzLnRzIiwid2VicGFjazovLy9kZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL2dsb2JhbC5qcyBmcm9tIGRsbC1yZWZlcmVuY2UgdmVuZG9yIiwid2VicGFjazovLy9kZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIGZyb20gZGxsLXJlZmVyZW5jZSB2ZW5kb3IiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwidmVuZG9yXCIiLCJ3ZWJwYWNrOi8vL2RlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qcyBmcm9tIGRsbC1yZWZlcmVuY2UgdmVuZG9yIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7Ozs7Ozs7Ozs7OztnRkFhZ0Y7QUFDaEYsSUFBVSxPQUFPLENBK29EaEI7QUEvb0RELFdBQVUsT0FBTztJQUNiLFlBQVksQ0FBQztJQXNGYixJQUFNLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQztJQUUvQyx5Q0FBeUM7SUFDekMsSUFBTSxjQUFjLEdBQUcsT0FBTyxNQUFNLENBQUMsTUFBTSxLQUFLLFVBQVUsQ0FBQztJQUUzRCxxQ0FBcUM7SUFDckMsSUFBTSxhQUFhLEdBQUcsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFlBQVksS0FBSyxDQUFDO0lBRXpELGtDQUFrQztJQUNsQyxJQUFNLGNBQWMsR0FBRyxPQUFPLE1BQU0sS0FBSyxVQUFVLENBQUM7SUFDcEQsSUFBTSxpQkFBaUIsR0FBRyxjQUFjLElBQUksT0FBTyxNQUFNLENBQUMsV0FBVyxLQUFLLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxH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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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OEI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLGlCQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsa0JBQWtCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0Isa0NBQWtDO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsMEJBQTBCLEVBQUU7QUFDbEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBEQUEwRCwrQkFBK0IsRUFBRTtBQUMzRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsaUJBQWlCO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLHVGQUF1RjtBQUN2RjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG1CQUFtQix1QkFBdUI7QUFDMUM7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsNEJBQTRCO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1RkFBdUY7QUFDdkY7QUFDQTtBQUNBLE1BQU0sRUFBRTtBQUNSLHVGQUF1RjtBQUN2RjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkI7QUFDM0I7QUFDQTtBQUNBLE1BQU0sRUFBRTtBQUNSLGlHQUFpRztBQUNqRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU0sRUFBRTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7Ozs7Ozs7Ozs7QUNwMERELG9CQUFvQjtBQUNwQixrRUFBa0M7QUFDbEMsMkRBQTJCOzs7Ozs7OztBQ0YzQiw4Qzs7Ozs7OztBQ0FBLCtDOzs7Ozs7O0FDQUEsd0I7Ozs7Ozs7QUNBQSwrQyIsImZpbGUiOiJwb2x5ZmlsbHMuYnVuZGxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbkNvcHlyaWdodCAoQykgTWljcm9zb2Z0LiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG5MaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdCB1c2VcclxudGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGVcclxuTGljZW5zZSBhdCBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcclxuXHJcblRISVMgQ09ERSBJUyBQUk9WSURFRCBPTiBBTiAqQVMgSVMqIEJBU0lTLCBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTllcclxuS0lORCwgRUlUSEVSIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIFdJVEhPVVQgTElNSVRBVElPTiBBTlkgSU1QTElFRFxyXG5XQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgVElUTEUsIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLFxyXG5NRVJDSEFOVEFCTElUWSBPUiBOT04tSU5GUklOR0VNRU5ULlxyXG5cclxuU2VlIHRoZSBBcGFjaGUgVmVyc2lvbiAyLjAgTGljZW5zZSBmb3Igc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zXHJcbmFuZCBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cclxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxubmFtZXNwYWNlIFJlZmxlY3Qge1xyXG4gICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgdHlwZSBvYmplY3QgPSB7fTsgLy8gcGxhY2Vob2xkZXIgdW50aWwgaHR0cHM6Ly9naXRodWIuY29tL01pY3Jvc29mdC9UeXBlU2NyaXB0L3B1bGwvMTI1MDFcclxuXHJcbiAgICB0eXBlIEhhc2hNYXA8Vj4gPSBSZWNvcmQ8c3RyaW5nLCBWPjtcclxuXHJcbiAgICBpbnRlcmZhY2UgQnVmZmVyTGlrZSB7XHJcbiAgICAgICAgW29mZnNldDogbnVtYmVyXTogbnVtYmVyO1xyXG4gICAgICAgIGxlbmd0aDogbnVtYmVyO1xyXG4gICAgfVxyXG5cclxuICAgIHR5cGUgSXRlcmF0b3JSZXN1bHQ8VD4gPSB7IHZhbHVlOiBULCBkb25lOiBmYWxzZSB9IHwgeyB2YWx1ZTogbmV2ZXIsIGRvbmU6IHRydWUgfTtcclxuXHJcbiAgICBpbnRlcmZhY2UgSXRlcmF0b3I8VD4ge1xyXG4gICAgICAgIG5leHQodmFsdWU/OiBhbnkpOiBJdGVyYXRvclJlc3VsdDxUPjtcclxuICAgICAgICB0aHJvdz8odmFsdWU6IGFueSk6IEl0ZXJhdG9yUmVzdWx0PFQ+O1xyXG4gICAgICAgIHJldHVybj8odmFsdWU/OiBUKTogSXRlcmF0b3JSZXN1bHQ8VD47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIEl0ZXJhYmxlPFQ+IHtcclxuICAgICAgICBcIkBAaXRlcmF0b3JcIigpOiBJdGVyYXRvcjxUPjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgSXRlcmFibGVJdGVyYXRvcjxUPiBleHRlbmRzIEl0ZXJhdG9yPFQ+IHtcclxuICAgICAgICBcIkBAaXRlcmF0b3JcIigpOiBJdGVyYWJsZUl0ZXJhdG9yPFQ+O1xyXG4gICAgfVxyXG5cclxuICAgIGludGVyZmFjZSBNYXA8SywgVj4gZXh0ZW5kcyBJdGVyYWJsZTxbSywgVl0+IHtcclxuICAgICAgICBzaXplOiBudW1iZXI7XHJcbiAgICAgICAgaGFzKGtleTogSyk6IGJvb2xlYW47XHJcbiAgICAgICAgZ2V0KGtleTogSyk6IFY7XHJcbiAgICAgICAgc2V0KGtleTogSywgdmFsdWU/OiBWKTogdGhpcztcclxuICAgICAgICBkZWxldGUoa2V5OiBLKTogYm9vbGVhbjtcclxuICAgICAgICBjbGVhcigpOiB2b2lkO1xyXG4gICAgICAgIGtleXMoKTogSXRlcmFibGVJdGVyYXRvcjxLPjtcclxuICAgICAgICB2YWx1ZXMoKTogSXRlcmFibGVJdGVyYXRvcjxWPjtcclxuICAgICAgICBlbnRyaWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8W0ssIFZdPjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgTWFwQ29uc3RydWN0b3Ige1xyXG4gICAgICAgIG5ldyAoKTogTWFwPGFueSwgYW55PjtcclxuICAgICAgICBuZXcgPEssIFY+KCk6IE1hcDxLLCBWPjtcclxuICAgICAgICBwcm90b3R5cGU6IE1hcDxhbnksIGFueT47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFNldDxUPiBleHRlbmRzIEl0ZXJhYmxlPFQ+IHtcclxuICAgICAgICBzaXplOiBudW1iZXI7XHJcbiAgICAgICAgaGFzKHZhbHVlOiBUKTogYm9vbGVhbjtcclxuICAgICAgICBhZGQodmFsdWU6IFQpOiB0aGlzO1xyXG4gICAgICAgIGRlbGV0ZSh2YWx1ZTogVCk6IGJvb2xlYW47XHJcbiAgICAgICAgY2xlYXIoKTogdm9pZDtcclxuICAgICAgICBrZXlzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XHJcbiAgICAgICAgdmFsdWVzKCk6IEl0ZXJhYmxlSXRlcmF0b3I8VD47XHJcbiAgICAgICAgZW50cmllcygpOiBJdGVyYWJsZUl0ZXJhdG9yPFtULCBUXT47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFNldENvbnN0cnVjdG9yIHtcclxuICAgICAgICBuZXcgKCk6IFNldDxhbnk+O1xyXG4gICAgICAgIG5ldyA8VD4oKTogU2V0PFQ+O1xyXG4gICAgICAgIHByb3RvdHlwZTogU2V0PGFueT47XHJcbiAgICB9XHJcblxyXG4gICAgaW50ZXJmYWNlIFdlYWtNYXA8SywgVj4ge1xyXG4gICAgICAgIGNsZWFyKCk6IHZvaWQ7XHJcbiAgICAgICAgZGVsZXRlKGtleTogSyk6IGJvb2xlYW47XHJcbiAgICAgICAgZ2V0KGtleTogSyk6IFY7XHJcbiAgICAgICAgaGFzKGtleTogSyk6IGJvb2xlYW47XHJcbiAgICAgICAgc2V0KGtleTogSywgdmFsdWU/OiBWKTogV2Vha01hcDxLLCBWPjtcclxuICAgIH1cclxuXHJcbiAgICBpbnRlcmZhY2UgV2Vha01hcENvbnN0cnVjdG9yIHtcclxuICAgICAgICBuZXcgKCk6IFdlYWtNYXA8YW55LCBhbnk+O1xyXG4gICAgICAgIG5ldyA8SywgVj4oKTogV2Vha01hcDxLLCBWPjtcclxuICAgICAgICBwcm90b3R5cGU6IFdlYWtNYXA8YW55LCBhbnk+O1xyXG4gICAgfVxyXG5cclxuICAgIHR5cGUgTWVtYmVyRGVjb3JhdG9yID0gPFQ+KHRhcmdldDogT2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nIHwgc3ltYm9sLCBkZXNjcmlwdG9yPzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8VD4pID0+IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPFQ+IHwgdm9pZDtcclxuXHJcbiAgICBkZWNsYXJlIGNvbnN0IFN5bWJvbDogeyBpdGVyYXRvcjogc3ltYm9sLCB0b1ByaW1pdGl2ZTogc3ltYm9sIH07XHJcbiAgICBkZWNsYXJlIGNvbnN0IFNldDogU2V0Q29uc3RydWN0b3I7XHJcbiAgICBkZWNsYXJlIGNvbnN0IFdlYWtNYXA6IFdlYWtNYXBDb25zdHJ1Y3RvcjtcclxuICAgIGRlY2xhcmUgY29uc3QgTWFwOiBNYXBDb25zdHJ1Y3RvcjtcclxuICAgIGRlY2xhcmUgY29uc3QgZ2xvYmFsOiBhbnk7XHJcbiAgICBkZWNsYXJlIGNvbnN0IGNyeXB0bzogQ3J5cHRvO1xyXG4gICAgZGVjbGFyZSBjb25zdCBtc0NyeXB0bzogQ3J5cHRvO1xyXG5cclxuICAgIGNvbnN0IGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XHJcblxyXG4gICAgLy8gZmVhdHVyZSB0ZXN0IGZvciBPYmplY3QuY3JlYXRlIHN1cHBvcnRcclxuICAgIGNvbnN0IHN1cHBvcnRzQ3JlYXRlID0gdHlwZW9mIE9iamVjdC5jcmVhdGUgPT09IFwiZnVuY3Rpb25cIjtcclxuXHJcbiAgICAvLyBmZWF0dXJlIHRlc3QgZm9yIF9fcHJvdG9fXyBzdXBwb3J0XHJcbiAgICBjb25zdCBzdXBwb3J0c1Byb3RvID0geyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheTtcclxuXHJcbiAgICAvLyBmZWF0dXJlIHRlc3QgZm9yIFN5bWJvbCBzdXBwb3J0XHJcbiAgICBjb25zdCBzdXBwb3J0c1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIGNvbnN0IHRvUHJpbWl0aXZlU3ltYm9sID0gc3VwcG9ydHNTeW1ib2wgJiYgdHlwZW9mIFN5bWJvbC50b1ByaW1pdGl2ZSAhPT0gXCJ1bmRlZmluZWRcIiA/IFN5bWJvbC50b1ByaW1pdGl2ZSA6IFwiQEB0b1ByaW1pdGl2ZVwiO1xyXG4gICAgY29uc3QgaXRlcmF0b3JTeW1ib2wgPSBzdXBwb3J0c1N5bWJvbCAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yICE9PSBcInVuZGVmaW5lZFwiID8gU3ltYm9sLml0ZXJhdG9yIDogXCJAQGl0ZXJhdG9yXCI7XHJcblxyXG4gICAgLy8gY3JlYXRlIGFuIG9iamVjdCBpbiBkaWN0aW9uYXJ5IG1vZGUgKGEuay5hLiBcInNsb3dcIiBtb2RlIGluIHY4KVxyXG4gICAgY29uc3QgY3JlYXRlRGljdGlvbmFyeSA9XHJcbiAgICAgICAgc3VwcG9ydHNDcmVhdGUgPyA8Vj4oKSA9PiBNYWtlRGljdGlvbmFyeShPYmplY3QuY3JlYXRlKG51bGwpIGFzIEhhc2hNYXA8Vj4pIDpcclxuICAgICAgICAgICAgc3VwcG9ydHNQcm90byA/IDxWPigpID0+IE1ha2VEaWN0aW9uYXJ5KHsgX19wcm90b19fOiBudWxsIGFzIGFueSB9IGFzIEhhc2hNYXA8Vj4pIDpcclxuICAgICAgICAgICAgICAgIDxWPigpID0+IE1ha2VEaWN0aW9uYXJ5KHt9IGFzIEhhc2hNYXA8Vj4pO1xyXG5cclxuICAgIG5hbWVzcGFjZSBIYXNoTWFwIHtcclxuICAgICAgICBjb25zdCBkb3duTGV2ZWwgPSAhc3VwcG9ydHNDcmVhdGUgJiYgIXN1cHBvcnRzUHJvdG87XHJcbiAgICAgICAgZXhwb3J0IGNvbnN0IGhhcyA9IGRvd25MZXZlbFxyXG4gICAgICAgICAgICA/IDxWPihtYXA6IEhhc2hNYXA8Vj4sIGtleTogc3RyaW5nIHwgbnVtYmVyIHwgc3ltYm9sKSA9PiBoYXNPd24uY2FsbChtYXAsIGtleSlcclxuICAgICAgICAgICAgOiA8Vj4obWFwOiBIYXNoTWFwPFY+LCBrZXk6IHN0cmluZyB8IG51bWJlciB8IHN5bWJvbCkgPT4ga2V5IGluIG1hcDtcclxuICAgICAgICBleHBvcnQgY29uc3QgZ2V0ID0gZG93bkxldmVsXHJcbiAgICAgICAgICAgID8gPFY+KG1hcDogSGFzaE1hcDxWPiwga2V5OiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wpOiBWIHwgdW5kZWZpbmVkID0+IGhhc093bi5jYWxsKG1hcCwga2V5KSA/IG1hcFtrZXldIDogdW5kZWZpbmVkXHJcbiAgICAgICAgICAgIDogPFY+KG1hcDogSGFzaE1hcDxWPiwga2V5OiBzdHJpbmcgfCBudW1iZXIgfCBzeW1ib2wpOiBWIHwgdW5kZWZpbmVkID0+IG1hcFtrZXldO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIExvYWQgZ2xvYmFsIG9yIHNoaW0gdmVyc2lvbnMgb2YgTWFwLCBTZXQsIGFuZCBXZWFrTWFwXHJcbiAgICBjb25zdCBmdW5jdGlvblByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihGdW5jdGlvbik7XHJcbiAgICBjb25zdCBfTWFwOiB0eXBlb2YgTWFwID0gdHlwZW9mIE1hcCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBNYXAucHJvdG90eXBlLmVudHJpZXMgPT09IFwiZnVuY3Rpb25cIiA/IE1hcCA6IENyZWF0ZU1hcFBvbHlmaWxsKCk7XHJcbiAgICBjb25zdCBfU2V0OiB0eXBlb2YgU2V0ID0gdHlwZW9mIFNldCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTZXQucHJvdG90eXBlLmVudHJpZXMgPT09IFwiZnVuY3Rpb25cIiA/IFNldCA6IENyZWF0ZVNldFBvbHlmaWxsKCk7XHJcbiAgICBjb25zdCBfV2Vha01hcDogdHlwZW9mIFdlYWtNYXAgPSB0eXBlb2YgV2Vha01hcCA9PT0gXCJmdW5jdGlvblwiID8gV2Vha01hcCA6IENyZWF0ZVdlYWtNYXBQb2x5ZmlsbCgpO1xyXG5cclxuICAgIC8vIFtbTWV0YWRhdGFdXSBpbnRlcm5hbCBzbG90XHJcbiAgICBjb25zdCBNZXRhZGF0YSA9IG5ldyBfV2Vha01hcDxvYmplY3QsIE1hcDxzdHJpbmcgfCBzeW1ib2wgfCB1bmRlZmluZWQsIE1hcDxhbnksIGFueT4+PigpO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEFwcGxpZXMgYSBzZXQgb2YgZGVjb3JhdG9ycyB0byBhIHRhcmdldCBvYmplY3QuXHJcbiAgICAgICogQHBhcmFtIGRlY29yYXRvcnMgQW4gYXJyYXkgb2YgZGVjb3JhdG9ycy5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0LlxyXG4gICAgICAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgYXBwbHlpbmcgdGhlIHByb3ZpZGVkIGRlY29yYXRvcnMuXHJcbiAgICAgICogQHJlbWFya3MgRGVjb3JhdG9ycyBhcmUgYXBwbGllZCBpbiByZXZlcnNlIG9yZGVyIG9mIHRoZWlyIHBvc2l0aW9ucyBpbiB0aGUgYXJyYXkuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHsgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXHJcbiAgICAgICogICAgIEV4YW1wbGUgPSBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnNBcnJheSwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZShkZWNvcmF0b3JzOiBDbGFzc0RlY29yYXRvcltdLCB0YXJnZXQ6IEZ1bmN0aW9uKTogRnVuY3Rpb247XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogQXBwbGllcyBhIHNldCBvZiBkZWNvcmF0b3JzIHRvIGEgcHJvcGVydHkgb2YgYSB0YXJnZXQgb2JqZWN0LlxyXG4gICAgICAqIEBwYXJhbSBkZWNvcmF0b3JzIEFuIGFycmF5IG9mIGRlY29yYXRvcnMuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IFRoZSBwcm9wZXJ0eSBrZXkgdG8gZGVjb3JhdGUuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldERlc2NyaXB0b3IgQSBwcm9wZXJ0eSBkZXNjcmlwdG9yXHJcbiAgICAgICogQHJlbWFya3MgRGVjb3JhdG9ycyBhcmUgYXBwbGllZCBpbiByZXZlcnNlIG9yZGVyLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZCgpIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIixcclxuICAgICAgKiAgICAgICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIikpKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpKSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZShkZWNvcmF0b3JzOiAoUHJvcGVydHlEZWNvcmF0b3IgfCBNZXRob2REZWNvcmF0b3IpW10sIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk6IHN0cmluZyB8IHN5bWJvbCwgdGFyZ2V0RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvciB8IG51bGwpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogQXBwbGllcyBhIHNldCBvZiBkZWNvcmF0b3JzIHRvIGEgcHJvcGVydHkgb2YgYSB0YXJnZXQgb2JqZWN0LlxyXG4gICAgICAqIEBwYXJhbSBkZWNvcmF0b3JzIEFuIGFycmF5IG9mIGRlY29yYXRvcnMuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IFRoZSBwcm9wZXJ0eSBrZXkgdG8gZGVjb3JhdGUuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldERlc2NyaXB0b3IgQSBwcm9wZXJ0eSBkZXNjcmlwdG9yXHJcbiAgICAgICogQHJlbWFya3MgRGVjb3JhdG9ycyBhcmUgYXBwbGllZCBpbiByZXZlcnNlIG9yZGVyLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZCgpIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIixcclxuICAgICAgKiAgICAgICAgIFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9yc0FycmF5LCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIikpKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpKSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWNvcmF0ZShkZWNvcmF0b3JzOiAoUHJvcGVydHlEZWNvcmF0b3IgfCBNZXRob2REZWNvcmF0b3IpW10sIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk6IHN0cmluZyB8IHN5bWJvbCwgdGFyZ2V0RGVzY3JpcHRvcjogUHJvcGVydHlEZXNjcmlwdG9yKTogUHJvcGVydHlEZXNjcmlwdG9yO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEFwcGxpZXMgYSBzZXQgb2YgZGVjb3JhdG9ycyB0byBhIHByb3BlcnR5IG9mIGEgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gZGVjb3JhdG9ycyBBbiBhcnJheSBvZiBkZWNvcmF0b3JzLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3QuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgdG8gZGVjb3JhdGUuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldERlc2NyaXB0b3IgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkgZGVzY3JpcHRvciBmb3IgdGhlIHRhcmdldCBrZXlcclxuICAgICAgKiBAcmVtYXJrcyBEZWNvcmF0b3JzIGFyZSBhcHBsaWVkIGluIHJldmVyc2Ugb3JkZXIuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICBFeGFtcGxlID0gUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiLFxyXG4gICAgICAqICAgICAgICAgUmVmbGVjdC5kZWNvcmF0ZShkZWNvcmF0b3JzQXJyYXksIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIsXHJcbiAgICAgICogICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKSkpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIsXHJcbiAgICAgICogICAgICAgICBSZWZsZWN0LmRlY29yYXRlKGRlY29yYXRvcnNBcnJheSwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIsXHJcbiAgICAgICogICAgICAgICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIikpKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlY29yYXRlKGRlY29yYXRvcnM6IChDbGFzc0RlY29yYXRvciB8IE1lbWJlckRlY29yYXRvcilbXSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCwgdGFyZ2V0RGVzY3JpcHRvcj86IFByb3BlcnR5RGVzY3JpcHRvciB8IG51bGwpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCBGdW5jdGlvbiB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgaWYgKCFJc1VuZGVmaW5lZCh0YXJnZXRLZXkpKSB7XHJcbiAgICAgICAgICAgIGlmICghSXNBcnJheShkZWNvcmF0b3JzKSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXREZXNjcmlwdG9yKSAmJiAhSXNVbmRlZmluZWQodGFyZ2V0RGVzY3JpcHRvcikgJiYgIUlzTnVsbCh0YXJnZXREZXNjcmlwdG9yKSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICBpZiAoSXNOdWxsKHRhcmdldERlc2NyaXB0b3IpKSB0YXJnZXREZXNjcmlwdG9yID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB0YXJnZXRLZXkgPSBUb1Byb3BlcnR5S2V5KHRhcmdldEtleSk7XHJcbiAgICAgICAgICAgIHJldHVybiBEZWNvcmF0ZVByb3BlcnR5KDxNZW1iZXJEZWNvcmF0b3JbXT5kZWNvcmF0b3JzLCB0YXJnZXQsIHRhcmdldEtleSwgdGFyZ2V0RGVzY3JpcHRvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoIUlzQXJyYXkoZGVjb3JhdG9ycykpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICAgICAgaWYgKCFJc0NvbnN0cnVjdG9yKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICAgICAgcmV0dXJuIERlY29yYXRlQ29uc3RydWN0b3IoPENsYXNzRGVjb3JhdG9yW10+ZGVjb3JhdG9ycywgPEZ1bmN0aW9uPnRhcmdldCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEEgZGVmYXVsdCBtZXRhZGF0YSBkZWNvcmF0b3IgZmFjdG9yeSB0aGF0IGNhbiBiZSB1c2VkIG9uIGEgY2xhc3MsIGNsYXNzIG1lbWJlciwgb3IgcGFyYW1ldGVyLlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBUaGUga2V5IGZvciB0aGUgbWV0YWRhdGEgZW50cnkuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhVmFsdWUgVGhlIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEgZW50cnkuXHJcbiAgICAgICogQHJldHVybnMgQSBkZWNvcmF0b3IgZnVuY3Rpb24uXHJcbiAgICAgICogQHJlbWFya3NcclxuICAgICAgKiBJZiBgbWV0YWRhdGFLZXlgIGlzIGFscmVhZHkgZGVmaW5lZCBmb3IgdGhlIHRhcmdldCBhbmQgdGFyZ2V0IGtleSwgdGhlXHJcbiAgICAgICogbWV0YWRhdGFWYWx1ZSBmb3IgdGhhdCBrZXkgd2lsbCBiZSBvdmVyd3JpdHRlbi5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXHJcbiAgICAgICogICAgIEBSZWZsZWN0Lm1ldGFkYXRhKGtleSwgdmFsdWUpXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yLCBUeXBlU2NyaXB0IG9ubHkpXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICAgICAgQFJlZmxlY3QubWV0YWRhdGEoa2V5LCB2YWx1ZSlcclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUsIFR5cGVTY3JpcHQgb25seSlcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICBAUmVmbGVjdC5tZXRhZGF0YShrZXksIHZhbHVlKVxyXG4gICAgICAqICAgICAgICAgcHJvcGVydHk7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIEBSZWZsZWN0Lm1ldGFkYXRhKGtleSwgdmFsdWUpXHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICBAUmVmbGVjdC5tZXRhZGF0YShrZXksIHZhbHVlKVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIG1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIG1ldGFkYXRhVmFsdWU6IGFueSkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGRlY29yYXRvcih0YXJnZXQ6IEZ1bmN0aW9uKTogdm9pZDtcclxuICAgICAgICBmdW5jdGlvbiBkZWNvcmF0b3IodGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleTogc3RyaW5nIHwgc3ltYm9sKTogdm9pZDtcclxuICAgICAgICBmdW5jdGlvbiBkZWNvcmF0b3IodGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCk6IHZvaWQge1xyXG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHRhcmdldEtleSkpIHtcclxuICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0S2V5ID0gVG9Qcm9wZXJ0eUtleSh0YXJnZXRLZXkpO1xyXG4gICAgICAgICAgICAgICAgT3JkaW5hcnlEZWZpbmVPd25NZXRhZGF0YShtZXRhZGF0YUtleSwgbWV0YWRhdGFWYWx1ZSwgdGFyZ2V0LCB0YXJnZXRLZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFJc0NvbnN0cnVjdG9yKHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICAgICAgICAgIE9yZGluYXJ5RGVmaW5lT3duTWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUsIHRhcmdldCwgLyp0YXJnZXRLZXkqLyB1bmRlZmluZWQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBkZWNvcmF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogRGVmaW5lIGEgdW5pcXVlIG1ldGFkYXRhIGVudHJ5IG9uIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YVZhbHVlIEEgdmFsdWUgdGhhdCBjb250YWlucyBhdHRhY2hlZCBtZXRhZGF0YS5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRvIGRlZmluZSBtZXRhZGF0YS5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIGRlY29yYXRvciBmYWN0b3J5IGFzIG1ldGFkYXRhLXByb2R1Y2luZyBhbm5vdGF0aW9uLlxyXG4gICAgICAqICAgICBmdW5jdGlvbiBNeUFubm90YXRpb24ob3B0aW9ucyk6IENsYXNzRGVjb3JhdG9yIHtcclxuICAgICAgKiAgICAgICAgIHJldHVybiB0YXJnZXQgPT4gUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIHRhcmdldCk7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlZmluZU1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIG1ldGFkYXRhVmFsdWU6IGFueSwgdGFyZ2V0OiBvYmplY3QpOiB2b2lkO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIERlZmluZSBhIHVuaXF1ZSBtZXRhZGF0YSBlbnRyeSBvbiB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFWYWx1ZSBBIHZhbHVlIHRoYXQgY29udGFpbnMgYXR0YWNoZWQgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0byBkZWZpbmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIE51bWJlciwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgTnVtYmVyLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICBSZWZsZWN0LmRlZmluZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgTnVtYmVyLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIE51bWJlciwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIGRlY29yYXRvciBmYWN0b3J5IGFzIG1ldGFkYXRhLXByb2R1Y2luZyBhbm5vdGF0aW9uLlxyXG4gICAgICAqICAgICBmdW5jdGlvbiBNeUFubm90YXRpb24ob3B0aW9ucyk6IFByb3BlcnR5RGVjb3JhdG9yIHtcclxuICAgICAgKiAgICAgICAgIHJldHVybiAodGFyZ2V0LCBrZXkpID0+IFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCB0YXJnZXQsIGtleSk7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlZmluZU1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIG1ldGFkYXRhVmFsdWU6IGFueSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleTogc3RyaW5nIHwgc3ltYm9sKTogdm9pZDtcclxuXHJcbiAgICAvKipcclxuICAgICAgKiBEZWZpbmUgYSB1bmlxdWUgbWV0YWRhdGEgZW50cnkgb24gdGhlIHRhcmdldC5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhVmFsdWUgQSB2YWx1ZSB0aGF0IGNvbnRhaW5zIGF0dGFjaGVkIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdG8gZGVmaW5lIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXRLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgUmVmbGVjdC5kZWZpbmVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIG9wdGlvbnMsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBkZWNvcmF0b3IgZmFjdG9yeSBhcyBtZXRhZGF0YS1wcm9kdWNpbmcgYW5ub3RhdGlvbi5cclxuICAgICAgKiAgICAgZnVuY3Rpb24gTXlBbm5vdGF0aW9uKG9wdGlvbnMpOiBEZWNvcmF0b3Ige1xyXG4gICAgICAqICAgICAgICAgcmV0dXJuICh0YXJnZXQsIGtleT8pID0+IFJlZmxlY3QuZGVmaW5lTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBvcHRpb25zLCB0YXJnZXQsIGtleSk7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlZmluZU1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIG1ldGFkYXRhVmFsdWU6IGFueSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCk6IHZvaWQge1xyXG4gICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgIGlmICghSXNVbmRlZmluZWQodGFyZ2V0S2V5KSkgdGFyZ2V0S2V5ID0gVG9Qcm9wZXJ0eUtleSh0YXJnZXRLZXkpO1xyXG4gICAgICAgIHJldHVybiBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlLCB0YXJnZXQsIHRhcmdldEtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogR2V0cyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluIGhhcyB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBtZXRhZGF0YSBrZXkgd2FzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbjsgb3RoZXJ3aXNlLCBgZmFsc2VgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc01ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBoYXNNZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCk6IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogR2V0cyBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluIGhhcyB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEga2V5IHdhcyBkZWZpbmVkIG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW47IG90aGVyd2lzZSwgYGZhbHNlYC5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxyXG4gICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc01ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBoYXNNZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCwgdGFyZ2V0S2V5OiBzdHJpbmcgfCBzeW1ib2wpOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbiBoYXMgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBkZWZpbmVkLlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXRLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEga2V5IHdhcyBkZWZpbmVkIG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW47IG90aGVyd2lzZSwgYGZhbHNlYC5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxyXG4gICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgICAgIGNvbnN0cnVjdG9yKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIGNvbnN0cnVjdG9yXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc01ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBoYXNNZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCwgdGFyZ2V0S2V5Pzogc3RyaW5nIHwgc3ltYm9sKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgaWYgKCFJc1VuZGVmaW5lZCh0YXJnZXRLZXkpKSB0YXJnZXRLZXkgPSBUb1Byb3BlcnR5S2V5KHRhcmdldEtleSk7XHJcbiAgICAgICAgcmV0dXJuIE9yZGluYXJ5SGFzTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgdGFyZ2V0S2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAgKiBHZXRzIGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSB0YXJnZXQgb2JqZWN0IGhhcyB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBtZXRhZGF0YSBrZXkgd2FzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Q7IG90aGVyd2lzZSwgYGZhbHNlYC5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gaGFzT3duTWV0YWRhdGEobWV0YWRhdGFLZXk6IGFueSwgdGFyZ2V0OiBvYmplY3QpOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHRhcmdldCBvYmplY3QgaGFzIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBtZXRhZGF0YSBrZXkgd2FzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Q7IG90aGVyd2lzZSwgYGZhbHNlYC5cclxuICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIGNsYXNzIEV4YW1wbGUge1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHkgZGVjbGFyYXRpb25zIGFyZSBub3QgcGFydCBvZiBFUzYsIHRob3VnaCB0aGV5IGFyZSB2YWxpZCBpbiBUeXBlU2NyaXB0OlxyXG4gICAgICAqICAgICAgICAgLy8gc3RhdGljIHN0YXRpY1Byb3BlcnR5O1xyXG4gICAgICAqICAgICAgICAgLy8gcHJvcGVydHk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzT3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzT3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0Lmhhc093bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzT3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBoYXNPd25NZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCwgdGFyZ2V0S2V5OiBzdHJpbmcgfCBzeW1ib2wpOiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHRhcmdldCBvYmplY3QgaGFzIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cclxuICAgICAgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG1ldGFkYXRhIGtleSB3YXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdDsgb3RoZXJ3aXNlLCBgZmFsc2VgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuaGFzT3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5oYXNPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGhhc093bk1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk/OiBzdHJpbmcgfCBzeW1ib2wpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHRhcmdldEtleSkpIHRhcmdldEtleSA9IFRvUHJvcGVydHlLZXkodGFyZ2V0S2V5KTtcclxuICAgICAgICByZXR1cm4gT3JkaW5hcnlIYXNPd25NZXRhZGF0YShtZXRhZGF0YUtleSwgdGFyZ2V0LCB0YXJnZXRLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW4uXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRNZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCk6IGFueTtcclxuXHJcbiAgICAvKipcclxuICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBvbiB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluLlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXRLZXkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cclxuICAgICAgKiBAcmV0dXJucyBUaGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBtZXRhZGF0YSBrZXkgaWYgZm91bmQ7IG90aGVyd2lzZSwgYHVuZGVmaW5lZGAuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0TWV0YWRhdGEobWV0YWRhdGFLZXk6IGFueSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleTogc3RyaW5nIHwgc3ltYm9sKTogYW55O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQgbWV0YWRhdGEga2V5IG9uIHRoZSB0YXJnZXQgb2JqZWN0IG9yIGl0cyBwcm90b3R5cGUgY2hhaW4uXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk/OiBzdHJpbmcgfCBzeW1ib2wpOiBhbnkge1xyXG4gICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgIGlmICghSXNVbmRlZmluZWQodGFyZ2V0S2V5KSkgdGFyZ2V0S2V5ID0gVG9Qcm9wZXJ0eUtleSh0YXJnZXRLZXkpO1xyXG4gICAgICAgIHJldHVybiBPcmRpbmFyeUdldE1ldGFkYXRhKG1ldGFkYXRhS2V5LCB0YXJnZXQsIHRhcmdldEtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogR2V0cyB0aGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBwcm92aWRlZCBtZXRhZGF0YSBrZXkgb24gdGhlIHRhcmdldCBvYmplY3QuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRPd25NZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCk6IGFueTtcclxuXHJcbiAgICAvKipcclxuICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgVGhlIG1ldGFkYXRhIHZhbHVlIGZvciB0aGUgbWV0YWRhdGEga2V5IGlmIGZvdW5kOyBvdGhlcndpc2UsIGB1bmRlZmluZWRgLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldE93bk1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk6IHN0cmluZyB8IHN5bWJvbCk6IGFueTtcclxuXHJcbiAgICAvKipcclxuICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIG1ldGFkYXRhIGtleSBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gbWV0YWRhdGFLZXkgQSBrZXkgdXNlZCB0byBzdG9yZSBhbmQgcmV0cmlldmUgbWV0YWRhdGEuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IChPcHRpb25hbCkgVGhlIHByb3BlcnR5IGtleSBmb3IgdGhlIHRhcmdldC5cclxuICAgICAgKiBAcmV0dXJucyBUaGUgbWV0YWRhdGEgdmFsdWUgZm9yIHRoZSBtZXRhZGF0YSBrZXkgaWYgZm91bmQ7IG90aGVyd2lzZSwgYHVuZGVmaW5lZGAuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0T3duTWV0YWRhdGEobWV0YWRhdGFLZXk6IGFueSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCk6IGFueSB7XHJcbiAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgaWYgKCFJc1VuZGVmaW5lZCh0YXJnZXRLZXkpKSB0YXJnZXRLZXkgPSBUb1Byb3BlcnR5S2V5KHRhcmdldEtleSk7XHJcbiAgICAgICAgcmV0dXJuIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEobWV0YWRhdGFLZXksIHRhcmdldCwgdGFyZ2V0S2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAgKiBHZXRzIHRoZSBtZXRhZGF0YSBrZXlzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3Qgb3IgaXRzIHByb3RvdHlwZSBjaGFpbi5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHVuaXF1ZSBtZXRhZGF0YSBrZXlzLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGFkYXRhS2V5cyh0YXJnZXQ6IG9iamVjdCk6IGFueVtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIGtleXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHVuaXF1ZSBtZXRhZGF0YSBrZXlzLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJwcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZ2V0TWV0YWRhdGFLZXlzKHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk6IHN0cmluZyB8IHN5bWJvbCk6IGFueVtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgdGhlIG1ldGFkYXRhIGtleXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdCBvciBpdHMgcHJvdG90eXBlIGNoYWluLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgdW5pcXVlIG1ldGFkYXRhIGtleXMuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE1ldGFkYXRhS2V5cyhFeGFtcGxlKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRNZXRhZGF0YUtleXMoRXhhbXBsZSwgXCJzdGF0aWNNZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0TWV0YWRhdGFLZXlzKEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldE1ldGFkYXRhS2V5cyh0YXJnZXQ6IG9iamVjdCwgdGFyZ2V0S2V5Pzogc3RyaW5nIHwgc3ltYm9sKTogYW55W10ge1xyXG4gICAgICAgIGlmICghSXNPYmplY3QodGFyZ2V0KSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgIGlmICghSXNVbmRlZmluZWQodGFyZ2V0S2V5KSkgdGFyZ2V0S2V5ID0gVG9Qcm9wZXJ0eUtleSh0YXJnZXRLZXkpO1xyXG4gICAgICAgIHJldHVybiBPcmRpbmFyeU1ldGFkYXRhS2V5cyh0YXJnZXQsIHRhcmdldEtleSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogR2V0cyB0aGUgdW5pcXVlIG1ldGFkYXRhIGtleXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHVuaXF1ZSBtZXRhZGF0YSBrZXlzLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGdldE93bk1ldGFkYXRhS2V5cyh0YXJnZXQ6IG9iamVjdCk6IGFueVtdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIEdldHMgdGhlIHVuaXF1ZSBtZXRhZGF0YSBrZXlzIGRlZmluZWQgb24gdGhlIHRhcmdldCBvYmplY3QuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IG9iamVjdCBvbiB3aGljaCB0aGUgbWV0YWRhdGEgaXMgZGVmaW5lZC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0S2V5IFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgQW4gYXJyYXkgb2YgdW5pcXVlIG1ldGFkYXRhIGtleXMuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRPd25NZXRhZGF0YUtleXModGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleTogc3RyaW5nIHwgc3ltYm9sKTogYW55W107XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogR2V0cyB0aGUgdW5pcXVlIG1ldGFkYXRhIGtleXMgZGVmaW5lZCBvbiB0aGUgdGFyZ2V0IG9iamVjdC5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXRLZXkgKE9wdGlvbmFsKSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHVuaXF1ZSBtZXRhZGF0YSBrZXlzLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgY29uc3RydWN0b3IocCkgeyB9XHJcbiAgICAgICogICAgICAgICBzdGF0aWMgc3RhdGljTWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICAgICAgbWV0aG9kKHApIHsgfVxyXG4gICAgICAqICAgICB9XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gY29uc3RydWN0b3JcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5nZXRPd25NZXRhZGF0YUtleXMoRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLCBcInN0YXRpY1Byb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBwcm90b3R5cGUpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZ2V0T3duTWV0YWRhdGFLZXlzKEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmdldE93bk1ldGFkYXRhS2V5cyhFeGFtcGxlLnByb3RvdHlwZSwgXCJtZXRob2RcIik7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBnZXRPd25NZXRhZGF0YUtleXModGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCk6IGFueVtdIHtcclxuICAgICAgICBpZiAoIUlzT2JqZWN0KHRhcmdldCkpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKHRhcmdldEtleSkpIHRhcmdldEtleSA9IFRvUHJvcGVydHlLZXkodGFyZ2V0S2V5KTtcclxuICAgICAgICByZXR1cm4gT3JkaW5hcnlPd25NZXRhZGF0YUtleXModGFyZ2V0LCB0YXJnZXRLZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICAqIERlbGV0ZXMgdGhlIG1ldGFkYXRhIGVudHJ5IGZyb20gdGhlIHRhcmdldCBvYmplY3Qgd2l0aCB0aGUgcHJvdmlkZWQga2V5LlxyXG4gICAgICAqIEBwYXJhbSBtZXRhZGF0YUtleSBBIGtleSB1c2VkIHRvIHN0b3JlIGFuZCByZXRyaWV2ZSBtZXRhZGF0YS5cclxuICAgICAgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2JqZWN0IG9uIHdoaWNoIHRoZSBtZXRhZGF0YSBpcyBkZWZpbmVkLlxyXG4gICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEgZW50cnkgd2FzIGZvdW5kIGFuZCBkZWxldGVkOyBvdGhlcndpc2UsIGZhbHNlLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKi9cclxuICAgIGV4cG9ydCBmdW5jdGlvbiBkZWxldGVNZXRhZGF0YShtZXRhZGF0YUtleTogYW55LCB0YXJnZXQ6IG9iamVjdCk6IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogRGVsZXRlcyB0aGUgbWV0YWRhdGEgZW50cnkgZnJvbSB0aGUgdGFyZ2V0IG9iamVjdCB3aXRoIHRoZSBwcm92aWRlZCBrZXkuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSBUaGUgcHJvcGVydHkga2V5IGZvciB0aGUgdGFyZ2V0LlxyXG4gICAgICAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgbWV0YWRhdGEgZW50cnkgd2FzIGZvdW5kIGFuZCBkZWxldGVkOyBvdGhlcndpc2UsIGZhbHNlLlxyXG4gICAgICAqIEBleGFtcGxlXHJcbiAgICAgICpcclxuICAgICAgKiAgICAgY2xhc3MgRXhhbXBsZSB7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eSBkZWNsYXJhdGlvbnMgYXJlIG5vdCBwYXJ0IG9mIEVTNiwgdGhvdWdoIHRoZXkgYXJlIHZhbGlkIGluIFR5cGVTY3JpcHQ6XHJcbiAgICAgICogICAgICAgICAvLyBzdGF0aWMgc3RhdGljUHJvcGVydHk7XHJcbiAgICAgICogICAgICAgICAvLyBwcm9wZXJ0eTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAgICAgc3RhdGljIHN0YXRpY01ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgICAgIG1ldGhvZChwKSB7IH1cclxuICAgICAgKiAgICAgfVxyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIHByb3BlcnR5IChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljUHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcInByb3BlcnR5XCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gY29uc3RydWN0b3IpXHJcbiAgICAgICogICAgIHJlc3VsdCA9IFJlZmxlY3QuZGVsZXRlTWV0YWRhdGEoXCJjdXN0b206YW5ub3RhdGlvblwiLCBFeGFtcGxlLCBcInN0YXRpY01ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBtZXRob2QgKG9uIHByb3RvdHlwZSlcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUucHJvdG90eXBlLCBcIm1ldGhvZFwiKTtcclxuICAgICAgKlxyXG4gICAgICAqL1xyXG4gICAgZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1ldGFkYXRhKG1ldGFkYXRhS2V5OiBhbnksIHRhcmdldDogb2JqZWN0LCB0YXJnZXRLZXk6IHN0cmluZyB8IHN5bWJvbCk6IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgICogRGVsZXRlcyB0aGUgbWV0YWRhdGEgZW50cnkgZnJvbSB0aGUgdGFyZ2V0IG9iamVjdCB3aXRoIHRoZSBwcm92aWRlZCBrZXkuXHJcbiAgICAgICogQHBhcmFtIG1ldGFkYXRhS2V5IEEga2V5IHVzZWQgdG8gc3RvcmUgYW5kIHJldHJpZXZlIG1ldGFkYXRhLlxyXG4gICAgICAqIEBwYXJhbSB0YXJnZXQgVGhlIHRhcmdldCBvYmplY3Qgb24gd2hpY2ggdGhlIG1ldGFkYXRhIGlzIGRlZmluZWQuXHJcbiAgICAgICogQHBhcmFtIHRhcmdldEtleSAoT3B0aW9uYWwpIFRoZSBwcm9wZXJ0eSBrZXkgZm9yIHRoZSB0YXJnZXQuXHJcbiAgICAgICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBtZXRhZGF0YSBlbnRyeSB3YXMgZm91bmQgYW5kIGRlbGV0ZWQ7IG90aGVyd2lzZSwgZmFsc2UuXHJcbiAgICAgICogQGV4YW1wbGVcclxuICAgICAgKlxyXG4gICAgICAqICAgICBjbGFzcyBFeGFtcGxlIHtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5IGRlY2xhcmF0aW9ucyBhcmUgbm90IHBhcnQgb2YgRVM2LCB0aG91Z2ggdGhleSBhcmUgdmFsaWQgaW4gVHlwZVNjcmlwdDpcclxuICAgICAgKiAgICAgICAgIC8vIHN0YXRpYyBzdGF0aWNQcm9wZXJ0eTtcclxuICAgICAgKiAgICAgICAgIC8vIHByb3BlcnR5O1xyXG4gICAgICAqXHJcbiAgICAgICogICAgICAgICBjb25zdHJ1Y3RvcihwKSB7IH1cclxuICAgICAgKiAgICAgICAgIHN0YXRpYyBzdGF0aWNNZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgICAgICBtZXRob2QocCkgeyB9XHJcbiAgICAgICogICAgIH1cclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBjb25zdHJ1Y3RvclxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSk7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gcHJvcGVydHkgKG9uIGNvbnN0cnVjdG9yKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZSwgXCJzdGF0aWNQcm9wZXJ0eVwiKTtcclxuICAgICAgKlxyXG4gICAgICAqICAgICAvLyBwcm9wZXJ0eSAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwicHJvcGVydHlcIik7XHJcbiAgICAgICpcclxuICAgICAgKiAgICAgLy8gbWV0aG9kIChvbiBjb25zdHJ1Y3RvcilcclxuICAgICAgKiAgICAgcmVzdWx0ID0gUmVmbGVjdC5kZWxldGVNZXRhZGF0YShcImN1c3RvbTphbm5vdGF0aW9uXCIsIEV4YW1wbGUsIFwic3RhdGljTWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICogICAgIC8vIG1ldGhvZCAob24gcHJvdG90eXBlKVxyXG4gICAgICAqICAgICByZXN1bHQgPSBSZWZsZWN0LmRlbGV0ZU1ldGFkYXRhKFwiY3VzdG9tOmFubm90YXRpb25cIiwgRXhhbXBsZS5wcm90b3R5cGUsIFwibWV0aG9kXCIpO1xyXG4gICAgICAqXHJcbiAgICAgICovXHJcbiAgICBleHBvcnQgZnVuY3Rpb24gZGVsZXRlTWV0YWRhdGEobWV0YWRhdGFLZXk6IGFueSwgdGFyZ2V0OiBvYmplY3QsIHRhcmdldEtleT86IHN0cmluZyB8IHN5bWJvbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yYnVja3Rvbi9SZWZsZWN0RGVjb3JhdG9ycy9ibG9iL21hc3Rlci9zcGVjL21ldGFkYXRhLm1kI2RlbGV0ZW1ldGFkYXRhLW1ldGFkYXRha2V5LXAtXHJcbiAgICAgICAgaWYgKCFJc09iamVjdCh0YXJnZXQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgaWYgKCFJc1VuZGVmaW5lZCh0YXJnZXRLZXkpKSB0YXJnZXRLZXkgPSBUb1Byb3BlcnR5S2V5KHRhcmdldEtleSk7XHJcbiAgICAgICAgY29uc3QgbWV0YWRhdGFNYXAgPSBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKHRhcmdldCwgdGFyZ2V0S2V5LCAvKmNyZWF0ZSovIGZhbHNlKTtcclxuICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYgKCFtZXRhZGF0YU1hcC5kZWxldGUobWV0YWRhdGFLZXkpKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYgKG1ldGFkYXRhTWFwLnNpemUgPiAwKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICBjb25zdCB0YXJnZXRNZXRhZGF0YSA9IE1ldGFkYXRhLmdldCh0YXJnZXQpO1xyXG4gICAgICAgIHRhcmdldE1ldGFkYXRhLmRlbGV0ZSh0YXJnZXRLZXkpO1xyXG4gICAgICAgIGlmICh0YXJnZXRNZXRhZGF0YS5zaXplID4gMCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgTWV0YWRhdGEuZGVsZXRlKHRhcmdldCk7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gRGVjb3JhdGVDb25zdHJ1Y3RvcihkZWNvcmF0b3JzOiBDbGFzc0RlY29yYXRvcltdLCB0YXJnZXQ6IEZ1bmN0aW9uKTogRnVuY3Rpb24ge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY29yYXRvciA9IGRlY29yYXRvcnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY29yYXRlZCA9IGRlY29yYXRvcih0YXJnZXQpO1xyXG4gICAgICAgICAgICBpZiAoIUlzVW5kZWZpbmVkKGRlY29yYXRlZCkgJiYgIUlzTnVsbChkZWNvcmF0ZWQpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIUlzQ29uc3RydWN0b3IoZGVjb3JhdGVkKSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpO1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0ID0gPEZ1bmN0aW9uPmRlY29yYXRlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGFyZ2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIERlY29yYXRlUHJvcGVydHkoZGVjb3JhdG9yczogTWVtYmVyRGVjb3JhdG9yW10sIHRhcmdldDogb2JqZWN0LCBwcm9wZXJ0eUtleTogc3RyaW5nIHwgc3ltYm9sLCBkZXNjcmlwdG9yOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQpOiBQcm9wZXJ0eURlc2NyaXB0b3IgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSBkZWNvcmF0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY29yYXRvciA9IGRlY29yYXRvcnNbaV07XHJcbiAgICAgICAgICAgIGNvbnN0IGRlY29yYXRlZCA9IGRlY29yYXRvcih0YXJnZXQsIHByb3BlcnR5S2V5LCBkZXNjcmlwdG9yKTtcclxuICAgICAgICAgICAgaWYgKCFJc1VuZGVmaW5lZChkZWNvcmF0ZWQpICYmICFJc051bGwoZGVjb3JhdGVkKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChkZWNvcmF0ZWQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdG9yID0gPFByb3BlcnR5RGVzY3JpcHRvcj5kZWNvcmF0ZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlc2NyaXB0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTWV0YWRhdGEgUHJvcG9zYWxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yYnVja3Rvbi9SZWZsZWN0RGVjb3JhdG9ycy9ibG9iL21hc3Rlci9zcGVjL21ldGFkYXRhLm1kXHJcblxyXG4gICAgLy8gT3BlcmF0aW9ucyBvbiBPYmplY3RzXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcGVyYXRpb25zLW9uLW9iamVjdHNcclxuXHJcbiAgICAvLyBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE8sIFAsIENyZWF0ZSlcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yYnVja3Rvbi9SZWZsZWN0RGVjb3JhdG9ycy9ibG9iL21hc3Rlci9zcGVjL21ldGFkYXRhLm1kI2dldG9yY3JlYXRlbWV0YWRhdGFtYXAtLW8tcC1jcmVhdGUtXHJcbiAgICBmdW5jdGlvbiBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE86IG9iamVjdCwgUDogc3RyaW5nIHwgc3ltYm9sIHwgdW5kZWZpbmVkLCBDcmVhdGU6IHRydWUpOiBNYXA8YW55LCBhbnk+O1xyXG4gICAgZnVuY3Rpb24gR2V0T3JDcmVhdGVNZXRhZGF0YU1hcChPOiBvYmplY3QsIFA6IHN0cmluZyB8IHN5bWJvbCB8IHVuZGVmaW5lZCwgQ3JlYXRlOiBmYWxzZSk6IE1hcDxhbnksIGFueT4gfCB1bmRlZmluZWQ7XHJcbiAgICBmdW5jdGlvbiBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE86IG9iamVjdCwgUDogc3RyaW5nIHwgc3ltYm9sIHwgdW5kZWZpbmVkLCBDcmVhdGU6IGJvb2xlYW4pOiBNYXA8YW55LCBhbnk+IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBsZXQgdGFyZ2V0TWV0YWRhdGEgPSBNZXRhZGF0YS5nZXQoTyk7XHJcbiAgICAgICAgaWYgKElzVW5kZWZpbmVkKHRhcmdldE1ldGFkYXRhKSkge1xyXG4gICAgICAgICAgICBpZiAoIUNyZWF0ZSkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgdGFyZ2V0TWV0YWRhdGEgPSBuZXcgX01hcDxzdHJpbmcgfCBzeW1ib2wgfCB1bmRlZmluZWQsIE1hcDxhbnksIGFueT4+KCk7XHJcbiAgICAgICAgICAgIE1ldGFkYXRhLnNldChPLCB0YXJnZXRNZXRhZGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBtZXRhZGF0YU1hcCA9IHRhcmdldE1ldGFkYXRhLmdldChQKTtcclxuICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKSB7XHJcbiAgICAgICAgICAgIGlmICghQ3JlYXRlKSByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBtZXRhZGF0YU1hcCA9IG5ldyBfTWFwPGFueSwgYW55PigpO1xyXG4gICAgICAgICAgICB0YXJnZXRNZXRhZGF0YS5zZXQoUCwgbWV0YWRhdGFNYXApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbWV0YWRhdGFNYXA7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3JkaW5hcnkgT2JqZWN0IEludGVybmFsIE1ldGhvZHMgYW5kIEludGVybmFsIFNsb3RzXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcmRpbmFyeS1vYmplY3QtaW50ZXJuYWwtbWV0aG9kcy1hbmQtaW50ZXJuYWwtc2xvdHNcclxuXHJcbiAgICAvLyBPcmRpbmFyeUhhc01ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JidWNrdG9uL1JlZmxlY3REZWNvcmF0b3JzL2Jsb2IvbWFzdGVyL3NwZWMvbWV0YWRhdGEubWQjb3JkaW5hcnloYXNtZXRhZGF0YS0tbWV0YWRhdGFrZXktby1wLVxyXG4gICAgZnVuY3Rpb24gT3JkaW5hcnlIYXNNZXRhZGF0YShNZXRhZGF0YUtleTogYW55LCBPOiBvYmplY3QsIFA6IHN0cmluZyB8IHN5bWJvbCB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGNvbnN0IGhhc093biA9IE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApO1xyXG4gICAgICAgIGlmIChoYXNPd24pIHJldHVybiB0cnVlO1xyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTyk7XHJcbiAgICAgICAgaWYgKCFJc051bGwocGFyZW50KSkgcmV0dXJuIE9yZGluYXJ5SGFzTWV0YWRhdGEoTWV0YWRhdGFLZXksIHBhcmVudCwgUCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9yZGluYXJ5SGFzT3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcmRpbmFyeWhhc293bm1ldGFkYXRhLS1tZXRhZGF0YWtleS1vLXAtXHJcbiAgICBmdW5jdGlvbiBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5OiBhbnksIE86IG9iamVjdCwgUDogc3RyaW5nIHwgc3ltYm9sIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XHJcbiAgICAgICAgY29uc3QgbWV0YWRhdGFNYXAgPSBHZXRPckNyZWF0ZU1ldGFkYXRhTWFwKE8sIFAsIC8qY3JlYXRlKi8gZmFsc2UpO1xyXG4gICAgICAgIGlmIChJc1VuZGVmaW5lZChtZXRhZGF0YU1hcCkpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gVG9Cb29sZWFuKG1ldGFkYXRhTWFwLmhhcyhNZXRhZGF0YUtleSkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9yZGluYXJ5R2V0TWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcmRpbmFyeWdldG1ldGFkYXRhLS1tZXRhZGF0YWtleS1vLXAtXHJcbiAgICBmdW5jdGlvbiBPcmRpbmFyeUdldE1ldGFkYXRhKE1ldGFkYXRhS2V5OiBhbnksIE86IG9iamVjdCwgUDogc3RyaW5nIHwgc3ltYm9sIHwgdW5kZWZpbmVkKTogYW55IHtcclxuICAgICAgICBjb25zdCBoYXNPd24gPSBPcmRpbmFyeUhhc093bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBPLCBQKTtcclxuICAgICAgICBpZiAoaGFzT3duKSByZXR1cm4gT3JkaW5hcnlHZXRPd25NZXRhZGF0YShNZXRhZGF0YUtleSwgTywgUCk7XHJcbiAgICAgICAgY29uc3QgcGFyZW50ID0gT3JkaW5hcnlHZXRQcm90b3R5cGVPZihPKTtcclxuICAgICAgICBpZiAoIUlzTnVsbChwYXJlbnQpKSByZXR1cm4gT3JkaW5hcnlHZXRNZXRhZGF0YShNZXRhZGF0YUtleSwgcGFyZW50LCBQKTtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9yZGluYXJ5R2V0T3duTWV0YWRhdGEoTWV0YWRhdGFLZXksIE8sIFApXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcmRpbmFyeWdldG93bm1ldGFkYXRhLS1tZXRhZGF0YWtleS1vLXAtXHJcbiAgICBmdW5jdGlvbiBPcmRpbmFyeUdldE93bk1ldGFkYXRhKE1ldGFkYXRhS2V5OiBhbnksIE86IG9iamVjdCwgUDogc3RyaW5nIHwgc3ltYm9sIHwgdW5kZWZpbmVkKTogYW55IHtcclxuICAgICAgICBjb25zdCBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypjcmVhdGUqLyBmYWxzZSk7XHJcbiAgICAgICAgaWYgKElzVW5kZWZpbmVkKG1ldGFkYXRhTWFwKSkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gbWV0YWRhdGFNYXAuZ2V0KE1ldGFkYXRhS2V5KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5LCBNZXRhZGF0YVZhbHVlLCBPLCBQKVxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3JidWNrdG9uL1JlZmxlY3REZWNvcmF0b3JzL2Jsb2IvbWFzdGVyL3NwZWMvbWV0YWRhdGEubWQjb3JkaW5hcnlkZWZpbmVvd25tZXRhZGF0YS0tbWV0YWRhdGFrZXktbWV0YWRhdGF2YWx1ZS1vLXAtXHJcbiAgICBmdW5jdGlvbiBPcmRpbmFyeURlZmluZU93bk1ldGFkYXRhKE1ldGFkYXRhS2V5OiBhbnksIE1ldGFkYXRhVmFsdWU6IGFueSwgTzogb2JqZWN0LCBQOiBzdHJpbmcgfCBzeW1ib2wgfCB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypjcmVhdGUqLyB0cnVlKTtcclxuICAgICAgICBtZXRhZGF0YU1hcC5zZXQoTWV0YWRhdGFLZXksIE1ldGFkYXRhVmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9yZGluYXJ5TWV0YWRhdGFLZXlzKE8sIFApXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vcmJ1Y2t0b24vUmVmbGVjdERlY29yYXRvcnMvYmxvYi9tYXN0ZXIvc3BlYy9tZXRhZGF0YS5tZCNvcmRpbmFyeW1ldGFkYXRha2V5cy0tby1wLVxyXG4gICAgZnVuY3Rpb24gT3JkaW5hcnlNZXRhZGF0YUtleXMoTzogb2JqZWN0LCBQOiBzdHJpbmcgfCBzeW1ib2wgfCB1bmRlZmluZWQpOiBhbnlbXSB7XHJcbiAgICAgICAgY29uc3Qgb3duS2V5cyA9IE9yZGluYXJ5T3duTWV0YWRhdGFLZXlzKE8sIFApO1xyXG4gICAgICAgIGNvbnN0IHBhcmVudCA9IE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTyk7XHJcbiAgICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkgcmV0dXJuIG93bktleXM7XHJcbiAgICAgICAgY29uc3QgcGFyZW50S2V5cyA9IE9yZGluYXJ5TWV0YWRhdGFLZXlzKHBhcmVudCwgUCk7XHJcbiAgICAgICAgaWYgKHBhcmVudEtleXMubGVuZ3RoIDw9IDApIHJldHVybiBvd25LZXlzO1xyXG4gICAgICAgIGlmIChvd25LZXlzLmxlbmd0aCA8PSAwKSByZXR1cm4gcGFyZW50S2V5cztcclxuICAgICAgICBjb25zdCBzZXQgPSBuZXcgX1NldDxhbnk+KCk7XHJcbiAgICAgICAgY29uc3Qga2V5czogYW55W10gPSBbXTtcclxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBvd25LZXlzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGhhc0tleSA9IHNldC5oYXMoa2V5KTtcclxuICAgICAgICAgICAgaWYgKCFoYXNLZXkpIHtcclxuICAgICAgICAgICAgICAgIHNldC5hZGQoa2V5KTtcclxuICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAoY29uc3Qga2V5IG9mIHBhcmVudEtleXMpIHtcclxuICAgICAgICAgICAgY29uc3QgaGFzS2V5ID0gc2V0LmhhcyhrZXkpO1xyXG4gICAgICAgICAgICBpZiAoIWhhc0tleSkge1xyXG4gICAgICAgICAgICAgICAgc2V0LmFkZChrZXkpO1xyXG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGtleXM7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT3JkaW5hcnlPd25NZXRhZGF0YUtleXMoTywgUClcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9yYnVja3Rvbi9SZWZsZWN0RGVjb3JhdG9ycy9ibG9iL21hc3Rlci9zcGVjL21ldGFkYXRhLm1kI29yZGluYXJ5b3dubWV0YWRhdGFrZXlzLS1vLXAtXHJcbiAgICBmdW5jdGlvbiBPcmRpbmFyeU93bk1ldGFkYXRhS2V5cyhPOiBvYmplY3QsIFA6IHN0cmluZyB8IHN5bWJvbCB8IHVuZGVmaW5lZCk6IGFueVtdIHtcclxuICAgICAgICBjb25zdCBtZXRhZGF0YU1hcCA9IEdldE9yQ3JlYXRlTWV0YWRhdGFNYXAoTywgUCwgLypjcmVhdGUqLyBmYWxzZSk7XHJcbiAgICAgICAgY29uc3Qga2V5czogYW55W10gPSBbXTtcclxuICAgICAgICBpZiAoSXNVbmRlZmluZWQobWV0YWRhdGFNYXApKSByZXR1cm4ga2V5cztcclxuICAgICAgICBjb25zdCBrZXlzT2JqID0gbWV0YWRhdGFNYXAua2V5cygpO1xyXG4gICAgICAgIGNvbnN0IGl0ZXJhdG9yID0gR2V0SXRlcmF0b3Ioa2V5c09iaik7XHJcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcclxuICAgICAgICAgICAgbGV0IG5leHQgPSBJdGVyYXRvclN0ZXAoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFuZXh0KSByZXR1cm4ga2V5cztcclxuICAgICAgICAgICAgICAgIGNvbnN0IG5leHRWYWx1ZSA9IEl0ZXJhdG9yVmFsdWUobmV4dCk7XHJcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2gobmV4dFZhbHVlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobmV4dCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZpbmFsbHkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmluYWxseSB7XHJcbiAgICAgICAgICAgICAgICBpZiAobmV4dCkgSXRlcmF0b3JDbG9zZShpdGVyYXRvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRUNNQVNjcmlwdCBTcGVjaWZpY2F0aW9uXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvXHJcblxyXG4gICAgLy8gNiBFQ01BU2NyaXB0IERhdGEgVHlwMGVzIGFuZCBWYWx1ZXNcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtZGF0YS10eXBlcy1hbmQtdmFsdWVzXHJcbiAgICBmdW5jdGlvbiBUeXBlKHg6IGFueSk6IFRhZyB7XHJcbiAgICAgICAgaWYgKHggPT09IG51bGwpIHJldHVybiBUYWcuTnVsbDtcclxuICAgICAgICBzd2l0Y2ggKHR5cGVvZiB4KSB7XHJcbiAgICAgICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjogcmV0dXJuIFRhZy5VbmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGNhc2UgXCJib29sZWFuXCI6IHJldHVybiBUYWcuQm9vbGVhbjtcclxuICAgICAgICAgICAgY2FzZSBcInN0cmluZ1wiOiByZXR1cm4gVGFnLlN0cmluZztcclxuICAgICAgICAgICAgY2FzZSBcInN5bWJvbFwiOiByZXR1cm4gVGFnLlN5bWJvbDtcclxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOiByZXR1cm4gVGFnLk51bWJlcjtcclxuICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOiByZXR1cm4geCA9PT0gbnVsbCA/IFRhZy5OdWxsIDogVGFnLk9iamVjdDtcclxuICAgICAgICAgICAgZGVmYXVsdDogcmV0dXJuIFRhZy5PYmplY3Q7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIDYuMSBFQ01BU2NyaXB0IExhbmd1YWdlIFR5cGVzXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1lY21hc2NyaXB0LWxhbmd1YWdlLXR5cGVzXHJcbiAgICBjb25zdCBlbnVtIFRhZyB7XHJcbiAgICAgICAgVW5kZWZpbmVkLFxyXG4gICAgICAgIE51bGwsXHJcbiAgICAgICAgQm9vbGVhbixcclxuICAgICAgICBTdHJpbmcsXHJcbiAgICAgICAgU3ltYm9sLFxyXG4gICAgICAgIE51bWJlcixcclxuICAgICAgICBPYmplY3RcclxuICAgIH1cclxuXHJcbiAgICAvLyA2LjEuMSBUaGUgVW5kZWZpbmVkIFR5cGVcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtdW5kZWZpbmVkLXR5cGVcclxuICAgIGZ1bmN0aW9uIElzVW5kZWZpbmVkKHg6IGFueSk6IHggaXMgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4geCA9PT0gdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDYuMS4yIFRoZSBOdWxsIFR5cGVcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtbnVsbC10eXBlXHJcbiAgICBmdW5jdGlvbiBJc051bGwoeDogYW55KTogeCBpcyBudWxsIHtcclxuICAgICAgICByZXR1cm4geCA9PT0gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyA2LjEuNSBUaGUgU3ltYm9sIFR5cGVcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWVjbWFzY3JpcHQtbGFuZ3VhZ2UtdHlwZXMtc3ltYm9sLXR5cGVcclxuICAgIGZ1bmN0aW9uIElzU3ltYm9sKHg6IGFueSk6IHggaXMgc3ltYm9sIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHggPT09IFwic3ltYm9sXCI7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNi4xLjcgVGhlIE9iamVjdCBUeXBlXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QtdHlwZVxyXG4gICAgZnVuY3Rpb24gSXNPYmplY3Q8VD4oeDogVCB8IHVuZGVmaW5lZCB8IG51bGwgfCBib29sZWFuIHwgc3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyKTogeCBpcyBUIHtcclxuICAgICAgICByZXR1cm4gdHlwZW9mIHggPT09IFwib2JqZWN0XCIgPyB4ICE9PSBudWxsIDogdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjEgVHlwZSBDb252ZXJzaW9uXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10eXBlLWNvbnZlcnNpb25cclxuXHJcbiAgICAvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvcHJpbWl0aXZlXHJcbiAgICBmdW5jdGlvbiBUb1ByaW1pdGl2ZShpbnB1dDogYW55LCBQcmVmZXJyZWRUeXBlPzogVGFnKTogdW5kZWZpbmVkIHwgbnVsbCB8IGJvb2xlYW4gfCBzdHJpbmcgfCBzeW1ib2wgfCBudW1iZXIge1xyXG4gICAgICAgIHN3aXRjaCAoVHlwZShpbnB1dCkpIHtcclxuICAgICAgICAgICAgY2FzZSBUYWcuVW5kZWZpbmVkOiByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgICAgIGNhc2UgVGFnLk51bGw6IHJldHVybiBpbnB1dDtcclxuICAgICAgICAgICAgY2FzZSBUYWcuQm9vbGVhbjogcmV0dXJuIGlucHV0O1xyXG4gICAgICAgICAgICBjYXNlIFRhZy5TdHJpbmc6IHJldHVybiBpbnB1dDtcclxuICAgICAgICAgICAgY2FzZSBUYWcuU3ltYm9sOiByZXR1cm4gaW5wdXQ7XHJcbiAgICAgICAgICAgIGNhc2UgVGFnLk51bWJlcjogcmV0dXJuIGlucHV0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBoaW50OiBcInN0cmluZ1wiIHwgXCJudW1iZXJcIiB8IFwiZGVmYXVsdFwiID0gUHJlZmVycmVkVHlwZSA9PT0gVGFnLlN0cmluZyA/IFwic3RyaW5nXCIgOiBQcmVmZXJyZWRUeXBlID09PSBUYWcuTnVtYmVyID8gXCJudW1iZXJcIiA6IFwiZGVmYXVsdFwiO1xyXG4gICAgICAgIGNvbnN0IGV4b3RpY1RvUHJpbSA9IEdldE1ldGhvZChpbnB1dCwgdG9QcmltaXRpdmVTeW1ib2wpO1xyXG4gICAgICAgIGlmIChleG90aWNUb1ByaW0gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBleG90aWNUb1ByaW0uY2FsbChpbnB1dCwgaGludCk7XHJcbiAgICAgICAgICAgIGlmIChJc09iamVjdChyZXN1bHQpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBPcmRpbmFyeVRvUHJpbWl0aXZlKGlucHV0LCBoaW50ID09PSBcImRlZmF1bHRcIiA/IFwibnVtYmVyXCIgOiBoaW50KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjEuMS4xIE9yZGluYXJ5VG9QcmltaXRpdmUoTywgaGludClcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9yZGluYXJ5dG9wcmltaXRpdmVcclxuICAgIGZ1bmN0aW9uIE9yZGluYXJ5VG9QcmltaXRpdmUoTzogb2JqZWN0LCBoaW50OiBcInN0cmluZ1wiIHwgXCJudW1iZXJcIik6IHVuZGVmaW5lZCB8IG51bGwgfCBib29sZWFuIHwgc3RyaW5nIHwgc3ltYm9sIHwgbnVtYmVyIHtcclxuICAgICAgICBpZiAoaGludCA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBjb25zdCB0b1N0cmluZyA9IE8udG9TdHJpbmc7XHJcbiAgICAgICAgICAgIGlmIChJc0NhbGxhYmxlKHRvU3RyaW5nKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdG9TdHJpbmcuY2FsbChPKTtcclxuICAgICAgICAgICAgICAgIGlmICghSXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU9mID0gTy52YWx1ZU9mO1xyXG4gICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh2YWx1ZU9mKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdmFsdWVPZi5jYWxsKE8pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBjb25zdCB2YWx1ZU9mID0gTy52YWx1ZU9mO1xyXG4gICAgICAgICAgICBpZiAoSXNDYWxsYWJsZSh2YWx1ZU9mKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gdmFsdWVPZi5jYWxsKE8pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHRvU3RyaW5nID0gTy50b1N0cmluZztcclxuICAgICAgICAgICAgaWYgKElzQ2FsbGFibGUodG9TdHJpbmcpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0b1N0cmluZy5jYWxsKE8pO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFJc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjEuMiBUb0Jvb2xlYW4oYXJndW1lbnQpXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvMjAxNi8jc2VjLXRvYm9vbGVhblxyXG4gICAgZnVuY3Rpb24gVG9Cb29sZWFuKGFyZ3VtZW50OiBhbnkpOiBib29sZWFuIHtcclxuICAgICAgICByZXR1cm4gISFhcmd1bWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjEuMTIgVG9TdHJpbmcoYXJndW1lbnQpXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3N0cmluZ1xyXG4gICAgZnVuY3Rpb24gVG9TdHJpbmcoYXJndW1lbnQ6IGFueSk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIFwiXCIgKyBhcmd1bWVudDtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjEuMTQgVG9Qcm9wZXJ0eUtleShhcmd1bWVudClcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvcHJvcGVydHlrZXlcclxuICAgIGZ1bmN0aW9uIFRvUHJvcGVydHlLZXkoYXJndW1lbnQ6IGFueSk6IHN0cmluZyB8IHN5bWJvbCB7XHJcbiAgICAgICAgY29uc3Qga2V5ID0gVG9QcmltaXRpdmUoYXJndW1lbnQsIFRhZy5TdHJpbmcpO1xyXG4gICAgICAgIGlmIChJc1N5bWJvbChrZXkpKSByZXR1cm4ga2V5O1xyXG4gICAgICAgIHJldHVybiBUb1N0cmluZyhrZXkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDcuMiBUZXN0aW5nIGFuZCBDb21wYXJpc29uIE9wZXJhdGlvbnNcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRlc3RpbmctYW5kLWNvbXBhcmlzb24tb3BlcmF0aW9uc1xyXG5cclxuICAgIC8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2FycmF5XHJcbiAgICBmdW5jdGlvbiBJc0FycmF5KGFyZ3VtZW50OiBhbnkpOiBhcmd1bWVudCBpcyBhbnlbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXlcclxuICAgICAgICAgICAgPyBBcnJheS5pc0FycmF5KGFyZ3VtZW50KVxyXG4gICAgICAgICAgICA6IGFyZ3VtZW50IGluc3RhbmNlb2YgT2JqZWN0XHJcbiAgICAgICAgICAgICAgICA/IGFyZ3VtZW50IGluc3RhbmNlb2YgQXJyYXlcclxuICAgICAgICAgICAgICAgIDogT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFyZ3VtZW50KSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDcuMi4zIElzQ2FsbGFibGUoYXJndW1lbnQpXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pc2NhbGxhYmxlXHJcbiAgICBmdW5jdGlvbiBJc0NhbGxhYmxlKGFyZ3VtZW50OiBhbnkpOiBhcmd1bWVudCBpcyBGdW5jdGlvbiB7XHJcbiAgICAgICAgLy8gTk9URTogVGhpcyBpcyBhbiBhcHByb3hpbWF0aW9uIGFzIHdlIGNhbm5vdCBjaGVjayBmb3IgW1tDYWxsXV0gaW50ZXJuYWwgbWV0aG9kLlxyXG4gICAgICAgIHJldHVybiB0eXBlb2YgYXJndW1lbnQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjIuNCBJc0NvbnN0cnVjdG9yKGFyZ3VtZW50KVxyXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNjb25zdHJ1Y3RvclxyXG4gICAgZnVuY3Rpb24gSXNDb25zdHJ1Y3Rvcihhcmd1bWVudDogYW55KTogYXJndW1lbnQgaXMgRnVuY3Rpb24ge1xyXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgYW4gYXBwcm94aW1hdGlvbiBhcyB3ZSBjYW5ub3QgY2hlY2sgZm9yIFtbQ29uc3RydWN0XV0gaW50ZXJuYWwgbWV0aG9kLlxyXG4gICAgICAgIHJldHVybiB0eXBlb2YgYXJndW1lbnQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjMgT3BlcmF0aW9ucyBvbiBPYmplY3RzXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vcGVyYXRpb25zLW9uLW9iamVjdHNcclxuXHJcbiAgICAvLyA3LjMuOSBHZXRNZXRob2QoViwgUClcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWdldG1ldGhvZFxyXG4gICAgZnVuY3Rpb24gR2V0TWV0aG9kKFY6IGFueSwgUDogYW55KTogRnVuY3Rpb24gfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IGZ1bmMgPSBWW1BdO1xyXG4gICAgICAgIGlmIChmdW5jID09PSB1bmRlZmluZWQgfHwgZnVuYyA9PT0gbnVsbCkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICBpZiAoIUlzQ2FsbGFibGUoZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICByZXR1cm4gZnVuYztcclxuICAgIH1cclxuXHJcbiAgICAvLyA3LjQgT3BlcmF0aW9ucyBvbiBJdGVyYXRvciBPYmplY3RzXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vcGVyYXRpb25zLW9uLWl0ZXJhdG9yLW9iamVjdHNcclxuXHJcbiAgICBmdW5jdGlvbiBHZXRJdGVyYXRvcjxUPihvYmo6IEl0ZXJhYmxlPFQ+KTogSXRlcmF0b3I8VD4ge1xyXG4gICAgICAgIGNvbnN0IG1ldGhvZCA9IEdldE1ldGhvZChvYmosIGl0ZXJhdG9yU3ltYm9sKTtcclxuICAgICAgICBpZiAoIUlzQ2FsbGFibGUobWV0aG9kKSkgdGhyb3cgbmV3IFR5cGVFcnJvcigpOyAvLyBmcm9tIENhbGxcclxuICAgICAgICBjb25zdCBpdGVyYXRvciA9IG1ldGhvZC5jYWxsKG9iaik7XHJcbiAgICAgICAgaWYgKCFJc09iamVjdChpdGVyYXRvcikpIHRocm93IG5ldyBUeXBlRXJyb3IoKTtcclxuICAgICAgICByZXR1cm4gaXRlcmF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNy40LjQgSXRlcmF0b3JWYWx1ZShpdGVyUmVzdWx0KVxyXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLzIwMTYvI3NlYy1pdGVyYXRvcnZhbHVlXHJcbiAgICBmdW5jdGlvbiBJdGVyYXRvclZhbHVlPFQ+KGl0ZXJSZXN1bHQ6IEl0ZXJhdG9yUmVzdWx0PFQ+KTogVCB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXJSZXN1bHQudmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gNy40LjUgSXRlcmF0b3JTdGVwKGl0ZXJhdG9yKVxyXG4gICAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXRlcmF0b3JzdGVwXHJcbiAgICBmdW5jdGlvbiBJdGVyYXRvclN0ZXA8VD4oaXRlcmF0b3I6IEl0ZXJhdG9yPFQ+KTogSXRlcmF0b3JSZXN1bHQ8VD4gfCBmYWxzZSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gaXRlcmF0b3IubmV4dCgpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQuZG9uZSA/IGZhbHNlIDogcmVzdWx0O1xyXG4gICAgfVxyXG5cclxuICAgIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1pdGVyYXRvcmNsb3NlXHJcbiAgICBmdW5jdGlvbiBJdGVyYXRvckNsb3NlPFQ+KGl0ZXJhdG9yOiBJdGVyYXRvcjxUPikge1xyXG4gICAgICAgIGNvbnN0IGYgPSBpdGVyYXRvcltcInJldHVyblwiXTtcclxuICAgICAgICBpZiAoZikgZi5jYWxsKGl0ZXJhdG9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyA5LjEgT3JkaW5hcnkgT2JqZWN0IEludGVybmFsIE1ldGhvZHMgYW5kIEludGVybmFsIFNsb3RzXHJcbiAgICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vcmRpbmFyeS1vYmplY3QtaW50ZXJuYWwtbWV0aG9kcy1hbmQtaW50ZXJuYWwtc2xvdHNcclxuXHJcbiAgICAvLyA5LjEuMS4xIE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTylcclxuICAgIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9yZGluYXJ5Z2V0cHJvdG90eXBlb2ZcclxuICAgIGZ1bmN0aW9uIE9yZGluYXJ5R2V0UHJvdG90eXBlT2YoTzogYW55KTogb2JqZWN0IHtcclxuICAgICAgICBjb25zdCBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKTtcclxuICAgICAgICBpZiAodHlwZW9mIE8gIT09IFwiZnVuY3Rpb25cIiB8fCBPID09PSBmdW5jdGlvblByb3RvdHlwZSkgcmV0dXJuIHByb3RvO1xyXG5cclxuICAgICAgICAvLyBUeXBlU2NyaXB0IGRvZXNuJ3Qgc2V0IF9fcHJvdG9fXyBpbiBFUzUsIGFzIGl0J3Mgbm9uLXN0YW5kYXJkLlxyXG4gICAgICAgIC8vIFRyeSB0byBkZXRlcm1pbmUgdGhlIHN1cGVyY2xhc3MgY29uc3RydWN0b3IuIENvbXBhdGlibGUgaW1wbGVtZW50YXRpb25zXHJcbiAgICAgICAgLy8gbXVzdCBlaXRoZXIgc2V0IF9fcHJvdG9fXyBvbiBhIHN1YmNsYXNzIGNvbnN0cnVjdG9yIHRvIHRoZSBzdXBlcmNsYXNzIGNvbnN0cnVjdG9yLFxyXG4gICAgICAgIC8vIG9yIGVuc3VyZSBlYWNoIGNsYXNzIGhhcyBhIHZhbGlkIGBjb25zdHJ1Y3RvcmAgcHJvcGVydHkgb24gaXRzIHByb3RvdHlwZSB0aGF0XHJcbiAgICAgICAgLy8gcG9pbnRzIGJhY2sgdG8gdGhlIGNvbnN0cnVjdG9yLlxyXG5cclxuICAgICAgICAvLyBJZiB0aGlzIGlzIG5vdCB0aGUgc2FtZSBhcyBGdW5jdGlvbi5bW1Byb3RvdHlwZV1dLCB0aGVuIHRoaXMgaXMgZGVmaW5hdGVseSBpbmhlcml0ZWQuXHJcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgY2FzZSB3aGVuIGluIEVTNiBvciB3aGVuIHVzaW5nIF9fcHJvdG9fXyBpbiBhIGNvbXBhdGlibGUgYnJvd3Nlci5cclxuICAgICAgICBpZiAocHJvdG8gIT09IGZ1bmN0aW9uUHJvdG90eXBlKSByZXR1cm4gcHJvdG87XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBzdXBlciBwcm90b3R5cGUgaXMgT2JqZWN0LnByb3RvdHlwZSwgbnVsbCwgb3IgdW5kZWZpbmVkLCB0aGVuIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGhlcml0YWdlLlxyXG4gICAgICAgIGNvbnN0IHByb3RvdHlwZSA9IE8ucHJvdG90eXBlO1xyXG4gICAgICAgIGNvbnN0IHByb3RvdHlwZVByb3RvID0gcHJvdG90eXBlICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90b3R5cGUpO1xyXG4gICAgICAgIGlmIChwcm90b3R5cGVQcm90byA9PSBudWxsIHx8IHByb3RvdHlwZVByb3RvID09PSBPYmplY3QucHJvdG90eXBlKSByZXR1cm4gcHJvdG87XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBjb25zdHJ1Y3RvciB3YXMgbm90IGEgZnVuY3Rpb24sIHRoZW4gd2UgY2Fubm90IGRldGVybWluZSB0aGUgaGVyaXRhZ2UuXHJcbiAgICAgICAgY29uc3QgY29uc3RydWN0b3IgPSBwcm90b3R5cGVQcm90by5jb25zdHJ1Y3RvcjtcclxuICAgICAgICBpZiAodHlwZW9mIGNvbnN0cnVjdG9yICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiBwcm90bztcclxuXHJcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBzb21lIGtpbmQgb2Ygc2VsZi1yZWZlcmVuY2UsIHRoZW4gd2UgY2Fubm90IGRldGVybWluZSB0aGUgaGVyaXRhZ2UuXHJcbiAgICAgICAgaWYgKGNvbnN0cnVjdG9yID09PSBPKSByZXR1cm4gcHJvdG87XHJcblxyXG4gICAgICAgIC8vIHdlIGhhdmUgYSBwcmV0dHkgZ29vZCBndWVzcyBhdCB0aGUgaGVyaXRhZ2UuXHJcbiAgICAgICAgcmV0dXJuIGNvbnN0cnVjdG9yO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIG5haXZlIE1hcCBzaGltXHJcbiAgICBmdW5jdGlvbiBDcmVhdGVNYXBQb2x5ZmlsbCgpOiBNYXBDb25zdHJ1Y3RvciB7XHJcbiAgICAgICAgY29uc3QgY2FjaGVTZW50aW5lbCA9IHt9O1xyXG4gICAgICAgIGNvbnN0IGFycmF5U2VudGluZWw6IGFueVtdID0gW107XHJcblxyXG4gICAgICAgIGNsYXNzIE1hcEl0ZXJhdG9yPEssIFYsIFIgZXh0ZW5kcyAoSyB8IFYgfCBbSywgVl0pPiBpbXBsZW1lbnRzIEl0ZXJhYmxlSXRlcmF0b3I8Uj4ge1xyXG4gICAgICAgICAgICBwcml2YXRlIF9rZXlzOiBLW107XHJcbiAgICAgICAgICAgIHByaXZhdGUgX3ZhbHVlczogVltdO1xyXG4gICAgICAgICAgICBwcml2YXRlIF9pbmRleCA9IDA7XHJcbiAgICAgICAgICAgIHByaXZhdGUgX3NlbGVjdG9yOiAoa2V5OiBLLCB2YWx1ZTogVikgPT4gUjtcclxuICAgICAgICAgICAgY29uc3RydWN0b3Ioa2V5czogS1tdLCB2YWx1ZXM6IFZbXSwgc2VsZWN0b3I6IChrZXk6IEssIHZhbHVlOiBWKSA9PiBSKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0ga2V5cztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3ZhbHVlcyA9IHZhbHVlcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdG9yID0gc2VsZWN0b3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXCJAQGl0ZXJhdG9yXCIoKSB7IHJldHVybiB0aGlzOyB9XHJcbiAgICAgICAgICAgIFtpdGVyYXRvclN5bWJvbF0oKSB7IHJldHVybiB0aGlzOyB9XHJcbiAgICAgICAgICAgIG5leHQoKTogSXRlcmF0b3JSZXN1bHQ8Uj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9pbmRleDtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgdGhpcy5fa2V5cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLl9zZWxlY3Rvcih0aGlzLl9rZXlzW2luZGV4XSwgdGhpcy5fdmFsdWVzW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4ICsgMSA+PSB0aGlzLl9rZXlzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9pbmRleCA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9rZXlzID0gYXJyYXlTZW50aW5lbDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gYXJyYXlTZW50aW5lbDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiByZXN1bHQsIGRvbmU6IGZhbHNlIH07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyB2YWx1ZTogPG5ldmVyPnVuZGVmaW5lZCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRocm93KGVycm9yOiBhbnkpOiBJdGVyYXRvclJlc3VsdDxSPiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cyA9IGFycmF5U2VudGluZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gYXJyYXlTZW50aW5lbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybih2YWx1ZT86IFIpOiBJdGVyYXRvclJlc3VsdDxSPiB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2luZGV4ID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cyA9IGFycmF5U2VudGluZWw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzID0gYXJyYXlTZW50aW5lbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiA8bmV2ZXI+dmFsdWUsIGRvbmU6IHRydWUgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGNsYXNzIE1hcDxLLCBWPiB7XHJcbiAgICAgICAgICAgIHByaXZhdGUgX2tleXM6IEtbXSA9IFtdO1xyXG4gICAgICAgICAgICBwcml2YXRlIF92YWx1ZXM6IChWIHwgdW5kZWZpbmVkKVtdID0gW107XHJcbiAgICAgICAgICAgIHByaXZhdGUgX2NhY2hlS2V5ID0gY2FjaGVTZW50aW5lbDtcclxuICAgICAgICAgICAgcHJpdmF0ZSBfY2FjaGVJbmRleCA9IC0yO1xyXG4gICAgICAgICAgICBnZXQgc2l6ZSgpIHsgcmV0dXJuIHRoaXMuX2tleXMubGVuZ3RoOyB9XHJcbiAgICAgICAgICAgIGhhcyhrZXk6IEspOiBib29sZWFuIHsgcmV0dXJuIHRoaXMuX2ZpbmQoa2V5LCAvKmluc2VydCovIGZhbHNlKSA+PSAwOyB9XHJcbiAgICAgICAgICAgIGdldChrZXk6IEspOiBWIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5fZmluZChrZXksIC8qaW5zZXJ0Ki8gZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ID49IDAgPyB0aGlzLl92YWx1ZXNbaW5kZXhdIDogdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNldChrZXk6IEssIHZhbHVlOiBWKTogdGhpcyB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuX2ZpbmQoa2V5LCAvKmluc2VydCovIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZGVsZXRlKGtleTogSyk6IGJvb2xlYW4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLl9maW5kKGtleSwgLyppbnNlcnQqLyBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNpemUgPSB0aGlzLl9rZXlzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gaW5kZXggKyAxOyBpIDwgc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2tleXNbaSAtIDFdID0gdGhpcy5fa2V5c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzW2kgLSAxXSA9IHRoaXMuX3ZhbHVlc1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5sZW5ndGgtLTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl92YWx1ZXMubGVuZ3RoLS07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gdGhpcy5fY2FjaGVLZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY2FjaGVLZXkgPSBjYWNoZVNlbnRpbmVsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUluZGV4ID0gLTI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNsZWFyKCk6IHZvaWQge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzLmxlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUtleSA9IGNhY2hlU2VudGluZWw7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jYWNoZUluZGV4ID0gLTI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAga2V5cygpIHsgcmV0dXJuIG5ldyBNYXBJdGVyYXRvcih0aGlzLl9rZXlzLCB0aGlzLl92YWx1ZXMsIGdldEtleSk7IH1cclxuICAgICAgICAgICAgdmFsdWVzKCkgeyByZXR1cm4gbmV3IE1hcEl0ZXJhdG9yKHRoaXMuX2tleXMsIHRoaXMuX3ZhbHVlcywgZ2V0VmFsdWUpOyB9XHJcbiAgICAgICAgICAgIGVudHJpZXMoKSB7IHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcy5fa2V5cywgdGhpcy5fdmFsdWVzLCBnZXRFbnRyeSk7IH1cclxuICAgICAgICAgICAgXCJAQGl0ZXJhdG9yXCIoKSB7IHJldHVybiB0aGlzLmVudHJpZXMoKTsgfVxyXG4gICAgICAgICAgICBbaXRlcmF0b3JTeW1ib2xdKCkgeyByZXR1cm4gdGhpcy5lbnRyaWVzKCk7IH1cclxuICAgICAgICAgICAgcHJpdmF0ZSBfZmluZChrZXk6IEssIGluc2VydD86IGJvb2xlYW4pOiBudW1iZXIge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2NhY2hlS2V5ID09PSBrZXkpIHJldHVybiB0aGlzLl9jYWNoZUluZGV4O1xyXG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5fa2V5cy5pbmRleE9mKGtleSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCAwICYmIGluc2VydCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gdGhpcy5fa2V5cy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fa2V5cy5wdXNoKGtleSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmFsdWVzLnB1c2godW5kZWZpbmVkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZUtleSA9IGtleSwgdGhpcy5fY2FjaGVJbmRleCA9IGluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0S2V5PEssIFY+KGtleTogSywgXzogVikge1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VmFsdWU8SywgVj4oXzogSywgdmFsdWU6IFYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RW50cnk8SywgVj4oa2V5OiBLLCB2YWx1ZTogVikge1xyXG4gICAgICAgICAgICByZXR1cm4gW2tleSwgdmFsdWVdIGFzIFtLLCBWXTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmFpdmUgU2V0IHNoaW1cclxuICAgIGZ1bmN0aW9uIENyZWF0ZVNldFBvbHlmaWxsKCk6IFNldENvbnN0cnVjdG9yIHtcclxuICAgICAgICByZXR1cm4gY2xhc3MgU2V0PFQ+IHtcclxuICAgICAgICAgICAgcHJpdmF0ZSBfbWFwID0gbmV3IF9NYXA8YW55LCBhbnk+KCk7XHJcbiAgICAgICAgICAgIGdldCBzaXplKCkgeyByZXR1cm4gdGhpcy5fbWFwLnNpemU7IH1cclxuICAgICAgICAgICAgaGFzKHZhbHVlOiBUKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbHVlKTsgfVxyXG4gICAgICAgICAgICBhZGQodmFsdWU6IFQpOiBTZXQ8VD4geyByZXR1cm4gdGhpcy5fbWFwLnNldCh2YWx1ZSwgdmFsdWUpLCB0aGlzOyB9XHJcbiAgICAgICAgICAgIGRlbGV0ZSh2YWx1ZTogVCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fbWFwLmRlbGV0ZSh2YWx1ZSk7IH1cclxuICAgICAgICAgICAgY2xlYXIoKTogdm9pZCB7IHRoaXMuX21hcC5jbGVhcigpOyB9XHJcbiAgICAgICAgICAgIGtleXMoKSB7IHJldHVybiB0aGlzLl9tYXAua2V5cygpOyB9XHJcbiAgICAgICAgICAgIHZhbHVlcygpIHsgcmV0dXJuIHRoaXMuX21hcC52YWx1ZXMoKTsgfVxyXG4gICAgICAgICAgICBlbnRyaWVzKCkgeyByZXR1cm4gdGhpcy5fbWFwLmVudHJpZXMoKTsgfVxyXG4gICAgICAgICAgICBcIkBAaXRlcmF0b3JcIigpIHsgcmV0dXJuIHRoaXMua2V5cygpOyB9XHJcbiAgICAgICAgICAgIFtpdGVyYXRvclN5bWJvbF0oKSB7IHJldHVybiB0aGlzLmtleXMoKTsgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmFpdmUgV2Vha01hcCBzaGltXHJcbiAgICBmdW5jdGlvbiBDcmVhdGVXZWFrTWFwUG9seWZpbGwoKTogV2Vha01hcENvbnN0cnVjdG9yIHtcclxuICAgICAgICBjb25zdCBVVUlEX1NJWkUgPSAxNjtcclxuICAgICAgICBjb25zdCBrZXlzID0gY3JlYXRlRGljdGlvbmFyeTxib29sZWFuPigpO1xyXG4gICAgICAgIGNvbnN0IHJvb3RLZXkgPSBDcmVhdGVVbmlxdWVLZXkoKTtcclxuICAgICAgICByZXR1cm4gY2xhc3MgV2Vha01hcDxLLCBWPiB7XHJcbiAgICAgICAgICAgIHByaXZhdGUgX2tleSA9IENyZWF0ZVVuaXF1ZUtleSgpO1xyXG4gICAgICAgICAgICBoYXModGFyZ2V0OiBLKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlPEs+KHRhcmdldCwgLypjcmVhdGUqLyBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFibGUgIT09IHVuZGVmaW5lZCA/IEhhc2hNYXAuaGFzKHRhYmxlLCB0aGlzLl9rZXkpIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZ2V0KHRhcmdldDogSyk6IFYge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBHZXRPckNyZWF0ZVdlYWtNYXBUYWJsZTxLPih0YXJnZXQsIC8qY3JlYXRlKi8gZmFsc2UpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhYmxlICE9PSB1bmRlZmluZWQgPyBIYXNoTWFwLmdldCh0YWJsZSwgdGhpcy5fa2V5KSA6IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZXQodGFyZ2V0OiBLLCB2YWx1ZTogVik6IFdlYWtNYXA8SywgVj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdGFibGUgPSBHZXRPckNyZWF0ZVdlYWtNYXBUYWJsZTxLPih0YXJnZXQsIC8qY3JlYXRlKi8gdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB0YWJsZVt0aGlzLl9rZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBkZWxldGUodGFyZ2V0OiBLKTogYm9vbGVhbiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB0YWJsZSA9IEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlPEs+KHRhcmdldCwgLypjcmVhdGUqLyBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFibGUgIT09IHVuZGVmaW5lZCA/IGRlbGV0ZSB0YWJsZVt0aGlzLl9rZXldIDogZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2xlYXIoKTogdm9pZCB7XHJcbiAgICAgICAgICAgICAgICAvLyBOT1RFOiBub3QgYSByZWFsIGNsZWFyLCBqdXN0IG1ha2VzIHRoZSBwcmV2aW91cyBkYXRhIHVucmVhY2hhYmxlXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9rZXkgPSBDcmVhdGVVbmlxdWVLZXkoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIENyZWF0ZVVuaXF1ZUtleSgpOiBzdHJpbmcge1xyXG4gICAgICAgICAgICBsZXQga2V5OiBzdHJpbmc7XHJcbiAgICAgICAgICAgIGRvIGtleSA9IFwiQEBXZWFrTWFwQEBcIiArIENyZWF0ZVVVSUQoKTtcclxuICAgICAgICAgICAgd2hpbGUgKEhhc2hNYXAuaGFzKGtleXMsIGtleSkpO1xyXG4gICAgICAgICAgICBrZXlzW2tleV0gPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gR2V0T3JDcmVhdGVXZWFrTWFwVGFibGU8Sz4odGFyZ2V0OiBLLCBjcmVhdGU6IHRydWUpOiBIYXNoTWFwPGFueT47XHJcbiAgICAgICAgZnVuY3Rpb24gR2V0T3JDcmVhdGVXZWFrTWFwVGFibGU8Sz4odGFyZ2V0OiBLLCBjcmVhdGU6IGZhbHNlKTogSGFzaE1hcDxhbnk+IHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGZ1bmN0aW9uIEdldE9yQ3JlYXRlV2Vha01hcFRhYmxlPEs+KHRhcmdldDogSywgY3JlYXRlOiBib29sZWFuKTogSGFzaE1hcDxhbnk+IHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAgICAgaWYgKCFoYXNPd24uY2FsbCh0YXJnZXQsIHJvb3RLZXkpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNyZWF0ZSkgcmV0dXJuIHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIHJvb3RLZXksIHsgdmFsdWU6IGNyZWF0ZURpY3Rpb25hcnk8YW55PigpIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAoPGFueT50YXJnZXQpW3Jvb3RLZXldO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gRmlsbFJhbmRvbUJ5dGVzKGJ1ZmZlcjogQnVmZmVyTGlrZSwgc2l6ZTogbnVtYmVyKTogQnVmZmVyTGlrZSB7XHJcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgKytpKSBidWZmZXJbaV0gPSBNYXRoLnJhbmRvbSgpICogMHhmZiB8IDA7XHJcbiAgICAgICAgICAgIHJldHVybiBidWZmZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBHZW5SYW5kb21CeXRlcyhzaXplOiBudW1iZXIpOiBCdWZmZXJMaWtlIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBVaW50OEFycmF5ID09PSBcImZ1bmN0aW9uXCIpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3J5cHRvICE9PSBcInVuZGVmaW5lZFwiKSByZXR1cm4gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheShzaXplKSkgYXMgVWludDhBcnJheTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbXNDcnlwdG8gIT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBtc0NyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoc2l6ZSkpIGFzIFVpbnQ4QXJyYXk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gRmlsbFJhbmRvbUJ5dGVzKG5ldyBVaW50OEFycmF5KHNpemUpLCBzaXplKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gRmlsbFJhbmRvbUJ5dGVzKG5ldyBBcnJheShzaXplKSwgc2l6ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBDcmVhdGVVVUlEKCkge1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gR2VuUmFuZG9tQnl0ZXMoVVVJRF9TSVpFKTtcclxuICAgICAgICAgICAgLy8gbWFyayBhcyByYW5kb20gLSBSRkMgNDEyMiDCpyA0LjRcclxuICAgICAgICAgICAgZGF0YVs2XSA9IGRhdGFbNl0gJiAweDRmIHwgMHg0MDtcclxuICAgICAgICAgICAgZGF0YVs4XSA9IGRhdGFbOF0gJiAweGJmIHwgMHg4MDtcclxuICAgICAgICAgICAgbGV0IHJlc3VsdCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGZvciAobGV0IG9mZnNldCA9IDA7IG9mZnNldCA8IFVVSURfU0laRTsgKytvZmZzZXQpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGJ5dGUgPSBkYXRhW29mZnNldF07XHJcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0ID09PSA0IHx8IG9mZnNldCA9PT0gNiB8fCBvZmZzZXQgPT09IDgpIHJlc3VsdCArPSBcIi1cIjtcclxuICAgICAgICAgICAgICAgIGlmIChieXRlIDwgMTYpIHJlc3VsdCArPSBcIjBcIjtcclxuICAgICAgICAgICAgICAgIHJlc3VsdCArPSBieXRlLnRvU3RyaW5nKDE2KS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVzZXMgYSBoZXVyaXN0aWMgdXNlZCBieSB2OCBhbmQgY2hha3JhIHRvIGZvcmNlIGFuIG9iamVjdCBpbnRvIGRpY3Rpb25hcnkgbW9kZS5cclxuICAgIGZ1bmN0aW9uIE1ha2VEaWN0aW9uYXJ5PFQ+KG9iajogVCk6IFQge1xyXG4gICAgICAgICg8YW55Pm9iaikuX18gPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgZGVsZXRlICg8YW55Pm9iaikuX187XHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuXHJcbiAgICAvLyBwYXRjaCBnbG9iYWwgUmVmbGVjdFxyXG4gICAgKGZ1bmN0aW9uIChfX2dsb2JhbDogYW55KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBfX2dsb2JhbC5SZWZsZWN0ICE9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgIGlmIChfX2dsb2JhbC5SZWZsZWN0ICE9PSBSZWZsZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IHAgaW4gUmVmbGVjdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChoYXNPd24uY2FsbChSZWZsZWN0LCBwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBfX2dsb2JhbC5SZWZsZWN0W3BdID0gKDxhbnk+UmVmbGVjdClbcF07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBfX2dsb2JhbC5SZWZsZWN0ID0gUmVmbGVjdDtcclxuICAgICAgICB9XHJcbiAgICB9KShcclxuICAgICAgICB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDpcclxuICAgICAgICAgICAgdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDpcclxuICAgICAgICAgICAgICAgIEZ1bmN0aW9uKFwicmV0dXJuIHRoaXM7XCIpKCkpO1xyXG59XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vfi9yZWZsZWN0LW1ldGFkYXRhL1JlZmxlY3QudHMiLCIvKipcbiogQGxpY2Vuc2VcbiogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4qXG4qIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4qIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiovXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoKSA6XG4gICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgICAoZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cblxudmFyIFpvbmUkMSA9IChmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgaWYgKGdsb2JhbFsnWm9uZSddKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignWm9uZSBhbHJlYWR5IGxvYWRlZC4nKTtcbiAgICB9XG4gICAgdmFyIFpvbmUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBab25lKHBhcmVudCwgem9uZVNwZWMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICAgICAgICAgICAgdGhpcy5fbmFtZSA9IHpvbmVTcGVjID8gem9uZVNwZWMubmFtZSB8fCAndW5uYW1lZCcgOiAnPHJvb3Q+JztcbiAgICAgICAgICAgIHRoaXMuX3Byb3BlcnRpZXMgPSB6b25lU3BlYyAmJiB6b25lU3BlYy5wcm9wZXJ0aWVzIHx8IHt9O1xuICAgICAgICAgICAgdGhpcy5fem9uZURlbGVnYXRlID1cbiAgICAgICAgICAgICAgICBuZXcgWm9uZURlbGVnYXRlKHRoaXMsIHRoaXMuX3BhcmVudCAmJiB0aGlzLl9wYXJlbnQuX3pvbmVEZWxlZ2F0ZSwgem9uZVNwZWMpO1xuICAgICAgICB9XG4gICAgICAgIFpvbmUuYXNzZXJ0Wm9uZVBhdGNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZ2xvYmFsLlByb21pc2UgIT09IFpvbmVBd2FyZVByb21pc2UpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1pvbmUuanMgaGFzIGRldGVjdGVkIHRoYXQgWm9uZUF3YXJlUHJvbWlzZSBgKHdpbmRvd3xnbG9iYWwpLlByb21pc2VgICcgK1xuICAgICAgICAgICAgICAgICAgICAnaGFzIGJlZW4gb3ZlcndyaXR0ZW4uXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdNb3N0IGxpa2VseSBjYXVzZSBpcyB0aGF0IGEgUHJvbWlzZSBwb2x5ZmlsbCBoYXMgYmVlbiBsb2FkZWQgJyArXG4gICAgICAgICAgICAgICAgICAgICdhZnRlciBab25lLmpzIChQb2x5ZmlsbGluZyBQcm9taXNlIGFwaSBpcyBub3QgbmVjZXNzYXJ5IHdoZW4gem9uZS5qcyBpcyBsb2FkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnSWYgeW91IG11c3QgbG9hZCBvbmUsIGRvIHNvIGJlZm9yZSBsb2FkaW5nIHpvbmUuanMuKScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWm9uZSwgXCJjdXJyZW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfY3VycmVudFpvbmVGcmFtZS56b25lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWm9uZSwgXCJjdXJyZW50VGFza1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2N1cnJlbnRUYXNrO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWm9uZS5wcm90b3R5cGUsIFwicGFyZW50XCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wYXJlbnQ7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShab25lLnByb3RvdHlwZSwgXCJuYW1lXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9uYW1lO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIFxuICAgICAgICBab25lLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgem9uZSA9IHRoaXMuZ2V0Wm9uZVdpdGgoa2V5KTtcbiAgICAgICAgICAgIGlmICh6b25lKVxuICAgICAgICAgICAgICAgIHJldHVybiB6b25lLl9wcm9wZXJ0aWVzW2tleV07XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLmdldFpvbmVXaXRoID0gZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgd2hpbGUgKGN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudC5fcHJvcGVydGllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50ID0gY3VycmVudC5fcGFyZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLmZvcmsgPSBmdW5jdGlvbiAoem9uZVNwZWMpIHtcbiAgICAgICAgICAgIGlmICghem9uZVNwZWMpXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdab25lU3BlYyByZXF1aXJlZCEnKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lRGVsZWdhdGUuZm9yayh0aGlzLCB6b25lU3BlYyk7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLndyYXAgPSBmdW5jdGlvbiAoY2FsbGJhY2ssIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0aW5nIGZ1bmN0aW9uIGdvdDogJyArIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBfY2FsbGJhY2sgPSB0aGlzLl96b25lRGVsZWdhdGUuaW50ZXJjZXB0KHRoaXMsIGNhbGxiYWNrLCBzb3VyY2UpO1xuICAgICAgICAgICAgdmFyIHpvbmUgPSB0aGlzO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gem9uZS5ydW5HdWFyZGVkKF9jYWxsYmFjaywgdGhpcywgYXJndW1lbnRzLCBzb3VyY2UpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKGNhbGxiYWNrLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKSB7XG4gICAgICAgICAgICBpZiAoYXBwbHlUaGlzID09PSB2b2lkIDApIHsgYXBwbHlUaGlzID0gbnVsbDsgfVxuICAgICAgICAgICAgaWYgKGFwcGx5QXJncyA9PT0gdm9pZCAwKSB7IGFwcGx5QXJncyA9IG51bGw7IH1cbiAgICAgICAgICAgIGlmIChzb3VyY2UgPT09IHZvaWQgMCkgeyBzb3VyY2UgPSBudWxsOyB9XG4gICAgICAgICAgICBfY3VycmVudFpvbmVGcmFtZSA9IG5ldyBab25lRnJhbWUoX2N1cnJlbnRab25lRnJhbWUsIHRoaXMpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZURlbGVnYXRlLmludm9rZSh0aGlzLCBjYWxsYmFjaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MsIHNvdXJjZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBfY3VycmVudFpvbmVGcmFtZSA9IF9jdXJyZW50Wm9uZUZyYW1lLnBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgWm9uZS5wcm90b3R5cGUucnVuR3VhcmRlZCA9IGZ1bmN0aW9uIChjYWxsYmFjaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MsIHNvdXJjZSkge1xuICAgICAgICAgICAgaWYgKGFwcGx5VGhpcyA9PT0gdm9pZCAwKSB7IGFwcGx5VGhpcyA9IG51bGw7IH1cbiAgICAgICAgICAgIGlmIChhcHBseUFyZ3MgPT09IHZvaWQgMCkgeyBhcHBseUFyZ3MgPSBudWxsOyB9XG4gICAgICAgICAgICBpZiAoc291cmNlID09PSB2b2lkIDApIHsgc291cmNlID0gbnVsbDsgfVxuICAgICAgICAgICAgX2N1cnJlbnRab25lRnJhbWUgPSBuZXcgWm9uZUZyYW1lKF9jdXJyZW50Wm9uZUZyYW1lLCB0aGlzKTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3pvbmVEZWxlZ2F0ZS5pbnZva2UodGhpcywgY2FsbGJhY2ssIGFwcGx5VGhpcywgYXBwbHlBcmdzLCBzb3VyY2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX3pvbmVEZWxlZ2F0ZS5oYW5kbGVFcnJvcih0aGlzLCBlcnJvcikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgX2N1cnJlbnRab25lRnJhbWUgPSBfY3VycmVudFpvbmVGcmFtZS5wYXJlbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLnJ1blRhc2sgPSBmdW5jdGlvbiAodGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpIHtcbiAgICAgICAgICAgIHRhc2sucnVuQ291bnQrKztcbiAgICAgICAgICAgIGlmICh0YXNrLnpvbmUgIT0gdGhpcylcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgdGFzayBjYW4gb25seSBiZSBydW4gaW4gdGhlIHpvbmUgd2hpY2ggY3JlYXRlZCBpdCEgKENyZWF0aW9uOiAnICsgdGFzay56b25lLm5hbWUgK1xuICAgICAgICAgICAgICAgICAgICAnOyBFeGVjdXRpb246ICcgKyB0aGlzLm5hbWUgKyAnKScpO1xuICAgICAgICAgICAgdmFyIHByZXZpb3VzVGFzayA9IF9jdXJyZW50VGFzaztcbiAgICAgICAgICAgIF9jdXJyZW50VGFzayA9IHRhc2s7XG4gICAgICAgICAgICBfY3VycmVudFpvbmVGcmFtZSA9IG5ldyBab25lRnJhbWUoX2N1cnJlbnRab25lRnJhbWUsIHRoaXMpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGFzay50eXBlID09ICdtYWNyb1Rhc2snICYmIHRhc2suZGF0YSAmJiAhdGFzay5kYXRhLmlzUGVyaW9kaWMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYW5jZWxGbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lRGVsZWdhdGUuaW52b2tlVGFzayh0aGlzLCB0YXNrLCBhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fem9uZURlbGVnYXRlLmhhbmRsZUVycm9yKHRoaXMsIGVycm9yKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBfY3VycmVudFpvbmVGcmFtZSA9IF9jdXJyZW50Wm9uZUZyYW1lLnBhcmVudDtcbiAgICAgICAgICAgICAgICBfY3VycmVudFRhc2sgPSBwcmV2aW91c1Rhc2s7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLnNjaGVkdWxlTWljcm9UYXNrID0gZnVuY3Rpb24gKHNvdXJjZSwgY2FsbGJhY2ssIGRhdGEsIGN1c3RvbVNjaGVkdWxlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZURlbGVnYXRlLnNjaGVkdWxlVGFzayh0aGlzLCBuZXcgWm9uZVRhc2soJ21pY3JvVGFzaycsIHRoaXMsIHNvdXJjZSwgY2FsbGJhY2ssIGRhdGEsIGN1c3RvbVNjaGVkdWxlLCBudWxsKSk7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmUucHJvdG90eXBlLnNjaGVkdWxlTWFjcm9UYXNrID0gZnVuY3Rpb24gKHNvdXJjZSwgY2FsbGJhY2ssIGRhdGEsIGN1c3RvbVNjaGVkdWxlLCBjdXN0b21DYW5jZWwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl96b25lRGVsZWdhdGUuc2NoZWR1bGVUYXNrKHRoaXMsIG5ldyBab25lVGFzaygnbWFjcm9UYXNrJywgdGhpcywgc291cmNlLCBjYWxsYmFjaywgZGF0YSwgY3VzdG9tU2NoZWR1bGUsIGN1c3RvbUNhbmNlbCkpO1xuICAgICAgICB9O1xuICAgICAgICBab25lLnByb3RvdHlwZS5zY2hlZHVsZUV2ZW50VGFzayA9IGZ1bmN0aW9uIChzb3VyY2UsIGNhbGxiYWNrLCBkYXRhLCBjdXN0b21TY2hlZHVsZSwgY3VzdG9tQ2FuY2VsKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fem9uZURlbGVnYXRlLnNjaGVkdWxlVGFzayh0aGlzLCBuZXcgWm9uZVRhc2soJ2V2ZW50VGFzaycsIHRoaXMsIHNvdXJjZSwgY2FsbGJhY2ssIGRhdGEsIGN1c3RvbVNjaGVkdWxlLCBjdXN0b21DYW5jZWwpKTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZS5wcm90b3R5cGUuY2FuY2VsVGFzayA9IGZ1bmN0aW9uICh0YXNrKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLl96b25lRGVsZWdhdGUuY2FuY2VsVGFzayh0aGlzLCB0YXNrKTtcbiAgICAgICAgICAgIHRhc2sucnVuQ291bnQgPSAtMTtcbiAgICAgICAgICAgIHRhc2suY2FuY2VsRm4gPSBudWxsO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gWm9uZTtcbiAgICB9KCkpO1xuICAgIFpvbmUuX19zeW1ib2xfXyA9IF9fc3ltYm9sX187XG4gICAgXG4gICAgdmFyIFpvbmVEZWxlZ2F0ZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZ1bmN0aW9uIFpvbmVEZWxlZ2F0ZSh6b25lLCBwYXJlbnREZWxlZ2F0ZSwgem9uZVNwZWMpIHtcbiAgICAgICAgICAgIHRoaXMuX3Rhc2tDb3VudHMgPSB7IG1pY3JvVGFzazogMCwgbWFjcm9UYXNrOiAwLCBldmVudFRhc2s6IDAgfTtcbiAgICAgICAgICAgIHRoaXMuem9uZSA9IHpvbmU7XG4gICAgICAgICAgICB0aGlzLl9wYXJlbnREZWxlZ2F0ZSA9IHBhcmVudERlbGVnYXRlO1xuICAgICAgICAgICAgdGhpcy5fZm9ya1pTID0gem9uZVNwZWMgJiYgKHpvbmVTcGVjICYmIHpvbmVTcGVjLm9uRm9yayA/IHpvbmVTcGVjIDogcGFyZW50RGVsZWdhdGUuX2ZvcmtaUyk7XG4gICAgICAgICAgICB0aGlzLl9mb3JrRGxndCA9IHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkZvcmsgPyBwYXJlbnREZWxlZ2F0ZSA6IHBhcmVudERlbGVnYXRlLl9mb3JrRGxndCk7XG4gICAgICAgICAgICB0aGlzLl9mb3JrQ3VyclpvbmUgPSB6b25lU3BlYyAmJiAoem9uZVNwZWMub25Gb3JrID8gdGhpcy56b25lIDogcGFyZW50RGVsZWdhdGUuem9uZSk7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcmNlcHRaUyA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uSW50ZXJjZXB0ID8gem9uZVNwZWMgOiBwYXJlbnREZWxlZ2F0ZS5faW50ZXJjZXB0WlMpO1xuICAgICAgICAgICAgdGhpcy5faW50ZXJjZXB0RGxndCA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uSW50ZXJjZXB0ID8gcGFyZW50RGVsZWdhdGUgOiBwYXJlbnREZWxlZ2F0ZS5faW50ZXJjZXB0RGxndCk7XG4gICAgICAgICAgICB0aGlzLl9pbnRlcmNlcHRDdXJyWm9uZSA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uSW50ZXJjZXB0ID8gdGhpcy56b25lIDogcGFyZW50RGVsZWdhdGUuem9uZSk7XG4gICAgICAgICAgICB0aGlzLl9pbnZva2VaUyA9IHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkludm9rZSA/IHpvbmVTcGVjIDogcGFyZW50RGVsZWdhdGUuX2ludm9rZVpTKTtcbiAgICAgICAgICAgIHRoaXMuX2ludm9rZURsZ3QgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkludm9rZSA/IHBhcmVudERlbGVnYXRlIDogcGFyZW50RGVsZWdhdGUuX2ludm9rZURsZ3QpO1xuICAgICAgICAgICAgdGhpcy5faW52b2tlQ3VyclpvbmUgPSB6b25lU3BlYyAmJiAoem9uZVNwZWMub25JbnZva2UgPyB0aGlzLnpvbmUgOiBwYXJlbnREZWxlZ2F0ZS56b25lKTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yWlMgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkhhbmRsZUVycm9yID8gem9uZVNwZWMgOiBwYXJlbnREZWxlZ2F0ZS5faGFuZGxlRXJyb3JaUyk7XG4gICAgICAgICAgICB0aGlzLl9oYW5kbGVFcnJvckRsZ3QgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkhhbmRsZUVycm9yID8gcGFyZW50RGVsZWdhdGUgOiBwYXJlbnREZWxlZ2F0ZS5faGFuZGxlRXJyb3JEbGd0KTtcbiAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yQ3VyclpvbmUgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkhhbmRsZUVycm9yID8gdGhpcy56b25lIDogcGFyZW50RGVsZWdhdGUuem9uZSk7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZVRhc2taUyA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uU2NoZWR1bGVUYXNrID8gem9uZVNwZWMgOiBwYXJlbnREZWxlZ2F0ZS5fc2NoZWR1bGVUYXNrWlMpO1xuICAgICAgICAgICAgdGhpcy5fc2NoZWR1bGVUYXNrRGxndCA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uU2NoZWR1bGVUYXNrID8gcGFyZW50RGVsZWdhdGUgOiBwYXJlbnREZWxlZ2F0ZS5fc2NoZWR1bGVUYXNrRGxndCk7XG4gICAgICAgICAgICB0aGlzLl9zY2hlZHVsZVRhc2tDdXJyWm9uZSA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uU2NoZWR1bGVUYXNrID8gdGhpcy56b25lIDogcGFyZW50RGVsZWdhdGUuem9uZSk7XG4gICAgICAgICAgICB0aGlzLl9pbnZva2VUYXNrWlMgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkludm9rZVRhc2sgPyB6b25lU3BlYyA6IHBhcmVudERlbGVnYXRlLl9pbnZva2VUYXNrWlMpO1xuICAgICAgICAgICAgdGhpcy5faW52b2tlVGFza0RsZ3QgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkludm9rZVRhc2sgPyBwYXJlbnREZWxlZ2F0ZSA6IHBhcmVudERlbGVnYXRlLl9pbnZva2VUYXNrRGxndCk7XG4gICAgICAgICAgICB0aGlzLl9pbnZva2VUYXNrQ3VyclpvbmUgPVxuICAgICAgICAgICAgICAgIHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkludm9rZVRhc2sgPyB0aGlzLnpvbmUgOiBwYXJlbnREZWxlZ2F0ZS56b25lKTtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbFRhc2taUyA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uQ2FuY2VsVGFzayA/IHpvbmVTcGVjIDogcGFyZW50RGVsZWdhdGUuX2NhbmNlbFRhc2taUyk7XG4gICAgICAgICAgICB0aGlzLl9jYW5jZWxUYXNrRGxndCA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uQ2FuY2VsVGFzayA/IHBhcmVudERlbGVnYXRlIDogcGFyZW50RGVsZWdhdGUuX2NhbmNlbFRhc2tEbGd0KTtcbiAgICAgICAgICAgIHRoaXMuX2NhbmNlbFRhc2tDdXJyWm9uZSA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uQ2FuY2VsVGFzayA/IHRoaXMuem9uZSA6IHBhcmVudERlbGVnYXRlLnpvbmUpO1xuICAgICAgICAgICAgdGhpcy5faGFzVGFza1pTID0gem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uSGFzVGFzayA/IHpvbmVTcGVjIDogcGFyZW50RGVsZWdhdGUuX2hhc1Rhc2taUyk7XG4gICAgICAgICAgICB0aGlzLl9oYXNUYXNrRGxndCA9XG4gICAgICAgICAgICAgICAgem9uZVNwZWMgJiYgKHpvbmVTcGVjLm9uSGFzVGFzayA/IHBhcmVudERlbGVnYXRlIDogcGFyZW50RGVsZWdhdGUuX2hhc1Rhc2tEbGd0KTtcbiAgICAgICAgICAgIHRoaXMuX2hhc1Rhc2tDdXJyWm9uZSA9IHpvbmVTcGVjICYmICh6b25lU3BlYy5vbkhhc1Rhc2sgPyB0aGlzLnpvbmUgOiBwYXJlbnREZWxlZ2F0ZS56b25lKTtcbiAgICAgICAgfVxuICAgICAgICBab25lRGVsZWdhdGUucHJvdG90eXBlLmZvcmsgPSBmdW5jdGlvbiAodGFyZ2V0Wm9uZSwgem9uZVNwZWMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9mb3JrWlMgPyB0aGlzLl9mb3JrWlMub25Gb3JrKHRoaXMuX2ZvcmtEbGd0LCB0aGlzLnpvbmUsIHRhcmdldFpvbmUsIHpvbmVTcGVjKSA6XG4gICAgICAgICAgICAgICAgbmV3IFpvbmUodGFyZ2V0Wm9uZSwgem9uZVNwZWMpO1xuICAgICAgICB9O1xuICAgICAgICBab25lRGVsZWdhdGUucHJvdG90eXBlLmludGVyY2VwdCA9IGZ1bmN0aW9uICh0YXJnZXRab25lLCBjYWxsYmFjaywgc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW50ZXJjZXB0WlMgP1xuICAgICAgICAgICAgICAgIHRoaXMuX2ludGVyY2VwdFpTLm9uSW50ZXJjZXB0KHRoaXMuX2ludGVyY2VwdERsZ3QsIHRoaXMuX2ludGVyY2VwdEN1cnJab25lLCB0YXJnZXRab25lLCBjYWxsYmFjaywgc291cmNlKSA6XG4gICAgICAgICAgICAgICAgY2FsbGJhY2s7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmVEZWxlZ2F0ZS5wcm90b3R5cGUuaW52b2tlID0gZnVuY3Rpb24gKHRhcmdldFpvbmUsIGNhbGxiYWNrLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5faW52b2tlWlMgP1xuICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZVpTLm9uSW52b2tlKHRoaXMuX2ludm9rZURsZ3QsIHRoaXMuX2ludm9rZUN1cnJab25lLCB0YXJnZXRab25lLCBjYWxsYmFjaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MsIHNvdXJjZSkgOlxuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGFwcGx5VGhpcywgYXBwbHlBcmdzKTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZURlbGVnYXRlLnByb3RvdHlwZS5oYW5kbGVFcnJvciA9IGZ1bmN0aW9uICh0YXJnZXRab25lLCBlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2hhbmRsZUVycm9yWlMgP1xuICAgICAgICAgICAgICAgIHRoaXMuX2hhbmRsZUVycm9yWlMub25IYW5kbGVFcnJvcih0aGlzLl9oYW5kbGVFcnJvckRsZ3QsIHRoaXMuX2hhbmRsZUVycm9yQ3VyclpvbmUsIHRhcmdldFpvbmUsIGVycm9yKSA6XG4gICAgICAgICAgICAgICAgdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZURlbGVnYXRlLnByb3RvdHlwZS5zY2hlZHVsZVRhc2sgPSBmdW5jdGlvbiAodGFyZ2V0Wm9uZSwgdGFzaykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fc2NoZWR1bGVUYXNrWlMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NjaGVkdWxlVGFza1pTLm9uU2NoZWR1bGVUYXNrKHRoaXMuX3NjaGVkdWxlVGFza0RsZ3QsIHRoaXMuX3NjaGVkdWxlVGFza0N1cnJab25lLCB0YXJnZXRab25lLCB0YXNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGFzay5zY2hlZHVsZUZuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2suc2NoZWR1bGVGbih0YXNrKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGFzay50eXBlID09ICdtaWNyb1Rhc2snKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjaGVkdWxlTWljcm9UYXNrKHRhc2spO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUYXNrIGlzIG1pc3Npbmcgc2NoZWR1bGVGbi4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Wm9uZSA9PSB0aGlzLnpvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fdXBkYXRlVGFza0NvdW50KHRhc2sudHlwZSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBab25lRGVsZWdhdGUucHJvdG90eXBlLmludm9rZVRhc2sgPSBmdW5jdGlvbiAodGFyZ2V0Wm9uZSwgdGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ludm9rZVRhc2taUyA/XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ludm9rZVRhc2taUy5vbkludm9rZVRhc2sodGhpcy5faW52b2tlVGFza0RsZ3QsIHRoaXMuX2ludm9rZVRhc2tDdXJyWm9uZSwgdGFyZ2V0Wm9uZSwgdGFzaywgYXBwbHlUaGlzLCBhcHBseUFyZ3MpIDpcbiAgICAgICAgICAgICAgICAgICAgdGFzay5jYWxsYmFjay5hcHBseShhcHBseVRoaXMsIGFwcGx5QXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Wm9uZSA9PSB0aGlzLnpvbmUgJiYgKHRhc2sudHlwZSAhPSAnZXZlbnRUYXNrJykgJiZcbiAgICAgICAgICAgICAgICAgICAgISh0YXNrLmRhdGEgJiYgdGFzay5kYXRhLmlzUGVyaW9kaWMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRhc2tDb3VudCh0YXNrLnR5cGUsIC0xKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIFpvbmVEZWxlZ2F0ZS5wcm90b3R5cGUuY2FuY2VsVGFzayA9IGZ1bmN0aW9uICh0YXJnZXRab25lLCB0YXNrKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWU7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2FuY2VsVGFza1pTKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLl9jYW5jZWxUYXNrWlMub25DYW5jZWxUYXNrKHRoaXMuX2NhbmNlbFRhc2tEbGd0LCB0aGlzLl9jYW5jZWxUYXNrQ3VyclpvbmUsIHRhcmdldFpvbmUsIHRhc2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIXRhc2suY2FuY2VsRm4pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Rhc2sgZG9lcyBub3Qgc3VwcG9ydCBjYW5jZWxsYXRpb24sIG9yIGlzIGFscmVhZHkgY2FuY2VsZWQuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRhc2suY2FuY2VsRm4odGFzayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGFyZ2V0Wm9uZSA9PSB0aGlzLnpvbmUpIHtcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHNob3VsZCBub3QgYmUgaW4gdGhlIGZpbmFsbHkgYmxvY2ssIGJlY2F1c2UgZXhjZXB0aW9ucyBhc3N1bWUgbm90IGNhbmNlbGVkLlxuICAgICAgICAgICAgICAgIHRoaXMuX3VwZGF0ZVRhc2tDb3VudCh0YXNrLnR5cGUsIC0xKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZURlbGVnYXRlLnByb3RvdHlwZS5oYXNUYXNrID0gZnVuY3Rpb24gKHRhcmdldFpvbmUsIGlzRW1wdHkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9oYXNUYXNrWlMgJiZcbiAgICAgICAgICAgICAgICB0aGlzLl9oYXNUYXNrWlMub25IYXNUYXNrKHRoaXMuX2hhc1Rhc2tEbGd0LCB0aGlzLl9oYXNUYXNrQ3VyclpvbmUsIHRhcmdldFpvbmUsIGlzRW1wdHkpO1xuICAgICAgICB9O1xuICAgICAgICBab25lRGVsZWdhdGUucHJvdG90eXBlLl91cGRhdGVUYXNrQ291bnQgPSBmdW5jdGlvbiAodHlwZSwgY291bnQpIHtcbiAgICAgICAgICAgIHZhciBjb3VudHMgPSB0aGlzLl90YXNrQ291bnRzO1xuICAgICAgICAgICAgdmFyIHByZXYgPSBjb3VudHNbdHlwZV07XG4gICAgICAgICAgICB2YXIgbmV4dCA9IGNvdW50c1t0eXBlXSA9IHByZXYgKyBjb3VudDtcbiAgICAgICAgICAgIGlmIChuZXh0IDwgMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignTW9yZSB0YXNrcyBleGVjdXRlZCB0aGVuIHdlcmUgc2NoZWR1bGVkLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHByZXYgPT0gMCB8fCBuZXh0ID09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgaXNFbXB0eSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWljcm9UYXNrOiBjb3VudHMubWljcm9UYXNrID4gMCxcbiAgICAgICAgICAgICAgICAgICAgbWFjcm9UYXNrOiBjb3VudHMubWFjcm9UYXNrID4gMCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUYXNrOiBjb3VudHMuZXZlbnRUYXNrID4gMCxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlOiB0eXBlXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc1Rhc2sodGhpcy56b25lLCBpc0VtcHR5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9wYXJlbnREZWxlZ2F0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcGFyZW50RGVsZWdhdGUuX3VwZGF0ZVRhc2tDb3VudCh0eXBlLCBjb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBab25lRGVsZWdhdGU7XG4gICAgfSgpKTtcbiAgICB2YXIgWm9uZVRhc2sgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBab25lVGFzayh0eXBlLCB6b25lLCBzb3VyY2UsIGNhbGxiYWNrLCBvcHRpb25zLCBzY2hlZHVsZUZuLCBjYW5jZWxGbikge1xuICAgICAgICAgICAgdGhpcy5ydW5Db3VudCA9IDA7XG4gICAgICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICAgICAgdGhpcy56b25lID0gem9uZTtcbiAgICAgICAgICAgIHRoaXMuc291cmNlID0gc291cmNlO1xuICAgICAgICAgICAgdGhpcy5kYXRhID0gb3B0aW9ucztcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVGbiA9IHNjaGVkdWxlRm47XG4gICAgICAgICAgICB0aGlzLmNhbmNlbEZuID0gY2FuY2VsRm47XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmludm9rZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBfbnVtYmVyT2ZOZXN0ZWRUYXNrRnJhbWVzKys7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHpvbmUucnVuVGFzayhzZWxmLCB0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9udW1iZXJPZk5lc3RlZFRhc2tGcmFtZXMgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHJhaW5NaWNyb1Rhc2tRdWV1ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIF9udW1iZXJPZk5lc3RlZFRhc2tGcmFtZXMtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIFpvbmVUYXNrLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEgJiYgdHlwZW9mIHRoaXMuZGF0YS5oYW5kbGVJZCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhLmhhbmRsZUlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gYWRkIHRvSlNPTiBtZXRob2QgdG8gcHJldmVudCBjeWNsaWMgZXJyb3Igd2hlblxuICAgICAgICAvLyBjYWxsIEpTT04uc3RyaW5naWZ5KHpvbmVUYXNrKVxuICAgICAgICBab25lVGFzay5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgICAgICAgICAgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICBkYXRhOiB0aGlzLmRhdGEsXG4gICAgICAgICAgICAgICAgem9uZTogdGhpcy56b25lLm5hbWUsXG4gICAgICAgICAgICAgICAgaW52b2tlOiB0aGlzLmludm9rZSxcbiAgICAgICAgICAgICAgICBzY2hlZHVsZUZuOiB0aGlzLnNjaGVkdWxlRm4sXG4gICAgICAgICAgICAgICAgY2FuY2VsRm46IHRoaXMuY2FuY2VsRm4sXG4gICAgICAgICAgICAgICAgcnVuQ291bnQ6IHRoaXMucnVuQ291bnQsXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IHRoaXMuY2FsbGJhY2tcbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBab25lVGFzaztcbiAgICB9KCkpO1xuICAgIHZhciBab25lRnJhbWUgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBmdW5jdGlvbiBab25lRnJhbWUocGFyZW50LCB6b25lKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgICAgICAgICAgIHRoaXMuem9uZSA9IHpvbmU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFpvbmVGcmFtZTtcbiAgICB9KCkpO1xuICAgIGZ1bmN0aW9uIF9fc3ltYm9sX18obmFtZSkge1xuICAgICAgICByZXR1cm4gJ19fem9uZV9zeW1ib2xfXycgKyBuYW1lO1xuICAgIH1cbiAgICBcbiAgICB2YXIgc3ltYm9sU2V0VGltZW91dCA9IF9fc3ltYm9sX18oJ3NldFRpbWVvdXQnKTtcbiAgICB2YXIgc3ltYm9sUHJvbWlzZSA9IF9fc3ltYm9sX18oJ1Byb21pc2UnKTtcbiAgICB2YXIgc3ltYm9sVGhlbiA9IF9fc3ltYm9sX18oJ3RoZW4nKTtcbiAgICB2YXIgX2N1cnJlbnRab25lRnJhbWUgPSBuZXcgWm9uZUZyYW1lKG51bGwsIG5ldyBab25lKG51bGwsIG51bGwpKTtcbiAgICB2YXIgX2N1cnJlbnRUYXNrID0gbnVsbDtcbiAgICB2YXIgX21pY3JvVGFza1F1ZXVlID0gW107XG4gICAgdmFyIF9pc0RyYWluaW5nTWljcm90YXNrUXVldWUgPSBmYWxzZTtcbiAgICB2YXIgX3VuY2F1Z2h0UHJvbWlzZUVycm9ycyA9IFtdO1xuICAgIHZhciBfbnVtYmVyT2ZOZXN0ZWRUYXNrRnJhbWVzID0gMDtcbiAgICBmdW5jdGlvbiBzY2hlZHVsZVF1ZXVlRHJhaW4oKSB7XG4gICAgICAgIC8vIGlmIHdlIGFyZSBub3QgcnVubmluZyBpbiBhbnkgdGFzaywgYW5kIHRoZXJlIGhhcyBub3QgYmVlbiBhbnl0aGluZyBzY2hlZHVsZWRcbiAgICAgICAgLy8gd2UgbXVzdCBib290c3RyYXAgdGhlIGluaXRpYWwgdGFzayBjcmVhdGlvbiBieSBtYW51YWxseSBzY2hlZHVsaW5nIHRoZSBkcmFpblxuICAgICAgICBpZiAoX251bWJlck9mTmVzdGVkVGFza0ZyYW1lcyA9PT0gMCAmJiBfbWljcm9UYXNrUXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAvLyBXZSBhcmUgbm90IHJ1bm5pbmcgaW4gVGFzaywgc28gd2UgbmVlZCB0byBraWNrc3RhcnQgdGhlIG1pY3JvdGFzayBxdWV1ZS5cbiAgICAgICAgICAgIGlmIChnbG9iYWxbc3ltYm9sUHJvbWlzZV0pIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxbc3ltYm9sUHJvbWlzZV0ucmVzb2x2ZSgwKVtzeW1ib2xUaGVuXShkcmFpbk1pY3JvVGFza1F1ZXVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdsb2JhbFtzeW1ib2xTZXRUaW1lb3V0XShkcmFpbk1pY3JvVGFza1F1ZXVlLCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzY2hlZHVsZU1pY3JvVGFzayh0YXNrKSB7XG4gICAgICAgIHNjaGVkdWxlUXVldWVEcmFpbigpO1xuICAgICAgICBfbWljcm9UYXNrUXVldWUucHVzaCh0YXNrKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29uc29sZUVycm9yKGUpIHtcbiAgICAgICAgdmFyIHJlamVjdGlvbiA9IGUgJiYgZS5yZWplY3Rpb247XG4gICAgICAgIGlmIChyZWplY3Rpb24pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBQcm9taXNlIHJlamVjdGlvbjonLCByZWplY3Rpb24gaW5zdGFuY2VvZiBFcnJvciA/IHJlamVjdGlvbi5tZXNzYWdlIDogcmVqZWN0aW9uLCAnOyBab25lOicsIGUuem9uZS5uYW1lLCAnOyBUYXNrOicsIGUudGFzayAmJiBlLnRhc2suc291cmNlLCAnOyBWYWx1ZTonLCByZWplY3Rpb24sIHJlamVjdGlvbiBpbnN0YW5jZW9mIEVycm9yID8gcmVqZWN0aW9uLnN0YWNrIDogdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkcmFpbk1pY3JvVGFza1F1ZXVlKCkge1xuICAgICAgICBpZiAoIV9pc0RyYWluaW5nTWljcm90YXNrUXVldWUpIHtcbiAgICAgICAgICAgIF9pc0RyYWluaW5nTWljcm90YXNrUXVldWUgPSB0cnVlO1xuICAgICAgICAgICAgd2hpbGUgKF9taWNyb1Rhc2tRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcXVldWUgPSBfbWljcm9UYXNrUXVldWU7XG4gICAgICAgICAgICAgICAgX21pY3JvVGFza1F1ZXVlID0gW107XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGFzayA9IHF1ZXVlW2ldO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFzay56b25lLnJ1blRhc2sodGFzaywgbnVsbCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVFcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChfdW5jYXVnaHRQcm9taXNlRXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdW5jYXVnaHRQcm9taXNlRXJyb3IgPSBfdW5jYXVnaHRQcm9taXNlRXJyb3JzLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1bmNhdWdodFByb21pc2VFcnJvci56b25lLnJ1bkd1YXJkZWQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IHVuY2F1Z2h0UHJvbWlzZUVycm9yO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVFcnJvcihlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgd2hpbGUgKF91bmNhdWdodFByb21pc2VFcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIF9sb29wXzEoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfaXNEcmFpbmluZ01pY3JvdGFza1F1ZXVlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gaXNUaGVuYWJsZSh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWUgJiYgdmFsdWUudGhlbjtcbiAgICB9XG4gICAgZnVuY3Rpb24gZm9yd2FyZFJlc29sdXRpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmb3J3YXJkUmVqZWN0aW9uKHJlamVjdGlvbikge1xuICAgICAgICByZXR1cm4gWm9uZUF3YXJlUHJvbWlzZS5yZWplY3QocmVqZWN0aW9uKTtcbiAgICB9XG4gICAgdmFyIHN5bWJvbFN0YXRlID0gX19zeW1ib2xfXygnc3RhdGUnKTtcbiAgICB2YXIgc3ltYm9sVmFsdWUgPSBfX3N5bWJvbF9fKCd2YWx1ZScpO1xuICAgIHZhciBzb3VyY2UgPSAnUHJvbWlzZS50aGVuJztcbiAgICB2YXIgVU5SRVNPTFZFRCA9IG51bGw7XG4gICAgdmFyIFJFU09MVkVEID0gdHJ1ZTtcbiAgICB2YXIgUkVKRUNURUQgPSBmYWxzZTtcbiAgICB2YXIgUkVKRUNURURfTk9fQ0FUQ0ggPSAwO1xuICAgIGZ1bmN0aW9uIG1ha2VSZXNvbHZlcihwcm9taXNlLCBzdGF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKHByb21pc2UsIHN0YXRlLCB2KTtcbiAgICAgICAgICAgIC8vIERvIG5vdCByZXR1cm4gdmFsdWUgb3IgeW91IHdpbGwgYnJlYWsgdGhlIFByb21pc2Ugc3BlYy5cbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzb2x2ZVByb21pc2UocHJvbWlzZSwgc3RhdGUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChwcm9taXNlW3N5bWJvbFN0YXRlXSA9PT0gVU5SRVNPTFZFRCkge1xuICAgICAgICAgICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgWm9uZUF3YXJlUHJvbWlzZSAmJiB2YWx1ZS5oYXNPd25Qcm9wZXJ0eShzeW1ib2xTdGF0ZSkgJiZcbiAgICAgICAgICAgICAgICB2YWx1ZS5oYXNPd25Qcm9wZXJ0eShzeW1ib2xWYWx1ZSkgJiYgdmFsdWVbc3ltYm9sU3RhdGVdICE9PSBVTlJFU09MVkVEKSB7XG4gICAgICAgICAgICAgICAgY2xlYXJSZWplY3RlZE5vQ2F0Y2godmFsdWUpO1xuICAgICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKHByb21pc2UsIHZhbHVlW3N5bWJvbFN0YXRlXSwgdmFsdWVbc3ltYm9sVmFsdWVdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzVGhlbmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbihtYWtlUmVzb2x2ZXIocHJvbWlzZSwgc3RhdGUpLCBtYWtlUmVzb2x2ZXIocHJvbWlzZSwgZmFsc2UpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHByb21pc2Vbc3ltYm9sU3RhdGVdID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgdmFyIHF1ZXVlID0gcHJvbWlzZVtzeW1ib2xWYWx1ZV07XG4gICAgICAgICAgICAgICAgcHJvbWlzZVtzeW1ib2xWYWx1ZV0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDspIHtcbiAgICAgICAgICAgICAgICAgICAgc2NoZWR1bGVSZXNvbHZlT3JSZWplY3QocHJvbWlzZSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSwgcXVldWVbaSsrXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPT0gMCAmJiBzdGF0ZSA9PSBSRUpFQ1RFRCkge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlW3N5bWJvbFN0YXRlXSA9IFJFSkVDVEVEX05PX0NBVENIO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNhdWdodCAoaW4gcHJvbWlzZSk6ICcgKyB2YWx1ZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKHZhbHVlICYmIHZhbHVlLnN0YWNrID8gJ1xcbicgKyB2YWx1ZS5zdGFjayA6ICcnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJvcl8xID0gZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yXzEucmVqZWN0aW9uID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcl8xLnByb21pc2UgPSBwcm9taXNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMS56b25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3JfMS50YXNrID0gWm9uZS5jdXJyZW50VGFzaztcbiAgICAgICAgICAgICAgICAgICAgICAgIF91bmNhdWdodFByb21pc2VFcnJvcnMucHVzaChlcnJvcl8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjaGVkdWxlUXVldWVEcmFpbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFJlc29sdmluZyBhbiBhbHJlYWR5IHJlc29sdmVkIHByb21pc2UgaXMgYSBub29wLlxuICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xlYXJSZWplY3RlZE5vQ2F0Y2gocHJvbWlzZSkge1xuICAgICAgICBpZiAocHJvbWlzZVtzeW1ib2xTdGF0ZV0gPT09IFJFSkVDVEVEX05PX0NBVENIKSB7XG4gICAgICAgICAgICBwcm9taXNlW3N5bWJvbFN0YXRlXSA9IFJFSkVDVEVEO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBfdW5jYXVnaHRQcm9taXNlRXJyb3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKHByb21pc2UgPT09IF91bmNhdWdodFByb21pc2VFcnJvcnNbaV0ucHJvbWlzZSkge1xuICAgICAgICAgICAgICAgICAgICBfdW5jYXVnaHRQcm9taXNlRXJyb3JzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNjaGVkdWxlUmVzb2x2ZU9yUmVqZWN0KHByb21pc2UsIHpvbmUsIGNoYWluUHJvbWlzZSwgb25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgY2xlYXJSZWplY3RlZE5vQ2F0Y2gocHJvbWlzZSk7XG4gICAgICAgIHZhciBkZWxlZ2F0ZSA9IHByb21pc2Vbc3ltYm9sU3RhdGVdID8gb25GdWxmaWxsZWQgfHwgZm9yd2FyZFJlc29sdXRpb24gOiBvblJlamVjdGVkIHx8IGZvcndhcmRSZWplY3Rpb247XG4gICAgICAgIHpvbmUuc2NoZWR1bGVNaWNyb1Rhc2soc291cmNlLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKGNoYWluUHJvbWlzZSwgdHJ1ZSwgem9uZS5ydW4oZGVsZWdhdGUsIG51bGwsIFtwcm9taXNlW3N5bWJvbFZhbHVlXV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgIHJlc29sdmVQcm9taXNlKGNoYWluUHJvbWlzZSwgZmFsc2UsIGVycm9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBab25lQXdhcmVQcm9taXNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gWm9uZUF3YXJlUHJvbWlzZShleGVjdXRvcikge1xuICAgICAgICAgICAgdmFyIHByb21pc2UgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKCEocHJvbWlzZSBpbnN0YW5jZW9mIFpvbmVBd2FyZVByb21pc2UpKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGFuIGluc3RhbmNlb2YgUHJvbWlzZS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb21pc2Vbc3ltYm9sU3RhdGVdID0gVU5SRVNPTFZFRDtcbiAgICAgICAgICAgIHByb21pc2Vbc3ltYm9sVmFsdWVdID0gW107IC8vIHF1ZXVlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBleGVjdXRvciAmJiBleGVjdXRvcihtYWtlUmVzb2x2ZXIocHJvbWlzZSwgUkVTT0xWRUQpLCBtYWtlUmVzb2x2ZXIocHJvbWlzZSwgUkVKRUNURUQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZVByb21pc2UocHJvbWlzZSwgZmFsc2UsIGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFpvbmVBd2FyZVByb21pc2UudG9TdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2Z1bmN0aW9uIFpvbmVBd2FyZVByb21pc2UoKSB7IFtuYXRpdmUgY29kZV0gfSc7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmVBd2FyZVByb21pc2UucmVzb2x2ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVQcm9taXNlKG5ldyB0aGlzKG51bGwpLCBSRVNPTFZFRCwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgICAgICBab25lQXdhcmVQcm9taXNlLnJlamVjdCA9IGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgcmV0dXJuIHJlc29sdmVQcm9taXNlKG5ldyB0aGlzKG51bGwpLCBSRUpFQ1RFRCwgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBab25lQXdhcmVQcm9taXNlLnJhY2UgPSBmdW5jdGlvbiAodmFsdWVzKSB7XG4gICAgICAgICAgICB2YXIgcmVzb2x2ZTtcbiAgICAgICAgICAgIHZhciByZWplY3Q7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyB0aGlzKGZ1bmN0aW9uIChyZXMsIHJlaikge1xuICAgICAgICAgICAgICAgIF9hID0gW3JlcywgcmVqXSwgcmVzb2x2ZSA9IF9hWzBdLCByZWplY3QgPSBfYVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVzb2x2ZSh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHByb21pc2UgJiYgKHByb21pc2UgPSBudWxsIHx8IHJlc29sdmUodmFsdWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KGVycm9yKSB7XG4gICAgICAgICAgICAgICAgcHJvbWlzZSAmJiAocHJvbWlzZSA9IG51bGwgfHwgcmVqZWN0KGVycm9yKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDAsIHZhbHVlc18xID0gdmFsdWVzOyBfaSA8IHZhbHVlc18xLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlc18xW19pXTtcbiAgICAgICAgICAgICAgICBpZiAoIWlzVGhlbmFibGUodmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdGhpcy5yZXNvbHZlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUudGhlbihvblJlc29sdmUsIG9uUmVqZWN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9O1xuICAgICAgICBab25lQXdhcmVQcm9taXNlLmFsbCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgICAgICAgICAgIHZhciByZXNvbHZlO1xuICAgICAgICAgICAgdmFyIHJlamVjdDtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IHRoaXMoZnVuY3Rpb24gKHJlcywgcmVqKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSA9IHJlcztcbiAgICAgICAgICAgICAgICByZWplY3QgPSByZWo7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjb3VudCA9IDA7XG4gICAgICAgICAgICB2YXIgcmVzb2x2ZWRWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMCwgdmFsdWVzXzIgPSB2YWx1ZXM7IF9pIDwgdmFsdWVzXzIubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gdmFsdWVzXzJbX2ldO1xuICAgICAgICAgICAgICAgIGlmICghaXNUaGVuYWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB0aGlzLnJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YWx1ZS50aGVuKChmdW5jdGlvbiAoaW5kZXgpIHsgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlZFZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNvbHZlZFZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9OyB9KShjb3VudCksIHJlamVjdCk7XG4gICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghY291bnQpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNvbHZlZFZhbHVlcyk7XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzZTtcbiAgICAgICAgfTtcbiAgICAgICAgWm9uZUF3YXJlUHJvbWlzZS5wcm90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICAgICAgICAgICAgdmFyIGNoYWluUHJvbWlzZSA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKG51bGwpO1xuICAgICAgICAgICAgdmFyIHpvbmUgPSBab25lLmN1cnJlbnQ7XG4gICAgICAgICAgICBpZiAodGhpc1tzeW1ib2xTdGF0ZV0gPT0gVU5SRVNPTFZFRCkge1xuICAgICAgICAgICAgICAgIHRoaXNbc3ltYm9sVmFsdWVdLnB1c2goem9uZSwgY2hhaW5Qcm9taXNlLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY2hlZHVsZVJlc29sdmVPclJlamVjdCh0aGlzLCB6b25lLCBjaGFpblByb21pc2UsIG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaGFpblByb21pc2U7XG4gICAgICAgIH07XG4gICAgICAgIFpvbmVBd2FyZVByb21pc2UucHJvdG90eXBlLmNhdGNoID0gZnVuY3Rpb24gKG9uUmVqZWN0ZWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgb25SZWplY3RlZCk7XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBab25lQXdhcmVQcm9taXNlO1xuICAgIH0oKSk7XG4gICAgLy8gUHJvdGVjdCBhZ2FpbnN0IGFnZ3Jlc3NpdmUgb3B0aW1pemVycyBkcm9wcGluZyBzZWVtaW5nbHkgdW51c2VkIHByb3BlcnRpZXMuXG4gICAgLy8gRS5nLiBDbG9zdXJlIENvbXBpbGVyIGluIGFkdmFuY2VkIG1vZGUuXG4gICAgWm9uZUF3YXJlUHJvbWlzZVsncmVzb2x2ZSddID0gWm9uZUF3YXJlUHJvbWlzZS5yZXNvbHZlO1xuICAgIFpvbmVBd2FyZVByb21pc2VbJ3JlamVjdCddID0gWm9uZUF3YXJlUHJvbWlzZS5yZWplY3Q7XG4gICAgWm9uZUF3YXJlUHJvbWlzZVsncmFjZSddID0gWm9uZUF3YXJlUHJvbWlzZS5yYWNlO1xuICAgIFpvbmVBd2FyZVByb21pc2VbJ2FsbCddID0gWm9uZUF3YXJlUHJvbWlzZS5hbGw7XG4gICAgdmFyIE5hdGl2ZVByb21pc2UgPSBnbG9iYWxbX19zeW1ib2xfXygnUHJvbWlzZScpXSA9IGdsb2JhbFsnUHJvbWlzZSddO1xuICAgIGdsb2JhbFsnUHJvbWlzZSddID0gWm9uZUF3YXJlUHJvbWlzZTtcbiAgICBmdW5jdGlvbiBwYXRjaFRoZW4oTmF0aXZlUHJvbWlzZSkge1xuICAgICAgICB2YXIgTmF0aXZlUHJvbWlzZVByb3RvdG90eXBlID0gTmF0aXZlUHJvbWlzZS5wcm90b3R5cGU7XG4gICAgICAgIHZhciBOYXRpdmVQcm9taXNlVGhlbiA9IE5hdGl2ZVByb21pc2VQcm90b3RvdHlwZVtfX3N5bWJvbF9fKCd0aGVuJyldID1cbiAgICAgICAgICAgIE5hdGl2ZVByb21pc2VQcm90b3RvdHlwZS50aGVuO1xuICAgICAgICBOYXRpdmVQcm9taXNlUHJvdG90b3R5cGUudGhlbiA9IGZ1bmN0aW9uIChvblJlc29sdmUsIG9uUmVqZWN0KSB7XG4gICAgICAgICAgICB2YXIgbmF0aXZlUHJvbWlzZSA9IHRoaXM7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFpvbmVBd2FyZVByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIE5hdGl2ZVByb21pc2VUaGVuLmNhbGwobmF0aXZlUHJvbWlzZSwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4ob25SZXNvbHZlLCBvblJlamVjdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmIChOYXRpdmVQcm9taXNlKSB7XG4gICAgICAgIHBhdGNoVGhlbihOYXRpdmVQcm9taXNlKTtcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWxbJ2ZldGNoJ10gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB2YXIgZmV0Y2hQcm9taXNlID0gdm9pZCAwO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBJbiBNUyBFZGdlIHRoaXMgdGhyb3dzXG4gICAgICAgICAgICAgICAgZmV0Y2hQcm9taXNlID0gZ2xvYmFsWydmZXRjaCddKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIC8vIEluIENocm9tZSB0aGlzIHRocm93cyBpbnN0ZWFkLlxuICAgICAgICAgICAgICAgIGZldGNoUHJvbWlzZSA9IGdsb2JhbFsnZmV0Y2gnXSgnYWJvdXQ6YmxhbmsnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlnbm9yZSBvdXRwdXQgdG8gcHJldmVudCBlcnJvcjtcbiAgICAgICAgICAgIGZldGNoUHJvbWlzZS50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIG51bGw7IH0sIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG51bGw7IH0pO1xuICAgICAgICAgICAgaWYgKGZldGNoUHJvbWlzZS5jb25zdHJ1Y3RvciAhPSBOYXRpdmVQcm9taXNlICYmXG4gICAgICAgICAgICAgICAgZmV0Y2hQcm9taXNlLmNvbnN0cnVjdG9yICE9IFpvbmVBd2FyZVByb21pc2UpIHtcbiAgICAgICAgICAgICAgICBwYXRjaFRoZW4oZmV0Y2hQcm9taXNlLmNvbnN0cnVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBUaGlzIGlzIG5vdCBwYXJ0IG9mIHB1YmxpYyBBUEksIGJ1dCBpdCBpcyB1c2VmdWxsIGZvciB0ZXN0cywgc28gd2UgZXhwb3NlIGl0LlxuICAgIFByb21pc2VbWm9uZS5fX3N5bWJvbF9fKCd1bmNhdWdodFByb21pc2VFcnJvcnMnKV0gPSBfdW5jYXVnaHRQcm9taXNlRXJyb3JzO1xuICAgIC8qXG4gICAgICogVGhpcyBjb2RlIHBhdGNoZXMgRXJyb3Igc28gdGhhdDpcbiAgICAgKiAgIC0gSXQgaWdub3JlcyB1bi1uZWVkZWQgc3RhY2sgZnJhbWVzLlxuICAgICAqICAgLSBJdCBTaG93cyB0aGUgYXNzb2NpYXRlZCBab25lIGZvciByZWFjaCBmcmFtZS5cbiAgICAgKi9cbiAgICB2YXIgRnJhbWVUeXBlO1xuICAgIChmdW5jdGlvbiAoRnJhbWVUeXBlKSB7XG4gICAgICAgIC8vLyBTa2lwIHRoaXMgZnJhbWUgd2hlbiBwcmludGluZyBvdXQgc3RhY2tcbiAgICAgICAgRnJhbWVUeXBlW0ZyYW1lVHlwZVtcImJsYWNrTGlzdFwiXSA9IDBdID0gXCJibGFja0xpc3RcIjtcbiAgICAgICAgLy8vIFRoaXMgZnJhbWUgbWFya3Mgem9uZSB0cmFuc2l0aW9uXG4gICAgICAgIEZyYW1lVHlwZVtGcmFtZVR5cGVbXCJ0cmFuc2l0aW9uXCJdID0gMV0gPSBcInRyYW5zaXRpb25cIjtcbiAgICB9KShGcmFtZVR5cGUgfHwgKEZyYW1lVHlwZSA9IHt9KSk7XG4gICAgdmFyIE5hdGl2ZUVycm9yID0gZ2xvYmFsW19fc3ltYm9sX18oJ0Vycm9yJyldID0gZ2xvYmFsLkVycm9yO1xuICAgIC8vIFN0b3JlIHRoZSBmcmFtZXMgd2hpY2ggc2hvdWxkIGJlIHJlbW92ZWQgZnJvbSB0aGUgc3RhY2sgZnJhbWVzXG4gICAgdmFyIGJsYWNrTGlzdGVkU3RhY2tGcmFtZXMgPSB7fTtcbiAgICAvLyBXZSBtdXN0IGZpbmQgdGhlIGZyYW1lIHdoZXJlIEVycm9yIHdhcyBjcmVhdGVkLCBvdGhlcndpc2Ugd2UgYXNzdW1lIHdlIGRvbid0IHVuZGVyc3RhbmQgc3RhY2tcbiAgICB2YXIgem9uZUF3YXJlRnJhbWU7XG4gICAgZ2xvYmFsLkVycm9yID0gWm9uZUF3YXJlRXJyb3I7XG4gICAgLy8gSG93IHNob3VsZCB0aGUgc3RhY2sgZnJhbWVzIGJlIHBhcnNlZC5cbiAgICB2YXIgZnJhbWVQYXJzZXJTdHJhdGVneSA9IG51bGw7XG4gICAgdmFyIHN0YWNrUmV3cml0ZSA9ICdzdGFja1Jld3JpdGUnO1xuICAgIC8vIGZpeCAjNTk1LCBjcmVhdGUgcHJvcGVydHkgZGVzY3JpcHRvclxuICAgIC8vIGZvciBlcnJvciBwcm9wZXJ0aWVzXG4gICAgdmFyIGNyZWF0ZVByb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BzLCBrZXkpIHtcbiAgICAgICAgLy8gaWYgcHJvcGVydHkgaXMgYWxyZWFkeSBkZWZpbmVkLCBza2lwIGl0LlxuICAgICAgICBpZiAocHJvcHNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGRlZmluZSBhIGxvY2FsIHByb3BlcnR5XG4gICAgICAgIC8vIGluIGNhc2UgZXJyb3IgcHJvcGVydHkgaXMgbm90IHNldHRhYmxlXG4gICAgICAgIHZhciBuYW1lID0gX19zeW1ib2xfXyhrZXkpO1xuICAgICAgICBwcm9wc1trZXldID0ge1xuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIC8vIGlmIGxvY2FsIHByb3BlcnR5IGhhcyBubyB2YWx1ZVxuICAgICAgICAgICAgICAgIC8vIHVzZSBpbnRlcm5hbCBlcnJvcidzIHByb3BlcnR5IHZhbHVlXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvcl8yID0gdGhpc1tfX3N5bWJvbF9fKCdlcnJvcicpXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yXzIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbbmFtZV0gPSBlcnJvcl8yW2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNbbmFtZV07XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAvLyBzZXR0ZXIgd2lsbCBzZXQgdmFsdWUgdG8gbG9jYWwgcHJvcGVydHkgdmFsdWVcbiAgICAgICAgICAgICAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvLyBmaXggIzU5NSwgY3JlYXRlIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAgICAvLyBmb3IgZXJyb3IgbWV0aG9kIHByb3BlcnRpZXNcbiAgICB2YXIgY3JlYXRlTWV0aG9kUHJvcGVydHkgPSBmdW5jdGlvbiAocHJvcHMsIGtleSkge1xuICAgICAgICBpZiAocHJvcHNba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHByb3BzW2tleV0gPSB7XG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgICAgICB2YWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvciA9IHRoaXNbX19zeW1ib2xfXygnZXJyb3InKV07XG4gICAgICAgICAgICAgICAgdmFyIGVycm9yTWV0aG9kID0gKGVycm9yICYmIGVycm9yW2tleV0pIHx8IHRoaXNba2V5XTtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JNZXRob2QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycm9yTWV0aG9kLmFwcGx5KGVycm9yLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBjcmVhdGVFcnJvclByb3BlcnRpZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIHZhciBlcnJvciA9IG5ldyBOYXRpdmVFcnJvcigpO1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGVycm9yKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIC8vIEF2b2lkIGJ1Z3Mgd2hlbiBoYXNPd25Qcm9wZXJ0eSBpcyBzaGFkb3dlZFxuICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChlcnJvciwga2V5KSkge1xuICAgICAgICAgICAgICAgIGNyZWF0ZVByb3BlcnR5KHByb3BzLCBrZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBwcm90byA9IE5hdGl2ZUVycm9yLnByb3RvdHlwZTtcbiAgICAgICAgaWYgKHByb3RvKSB7XG4gICAgICAgICAgICB2YXIgcEtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90byk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IHBLZXlzW2ldO1xuICAgICAgICAgICAgICAgIC8vIHNraXAgY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICBpZiAoa2V5ICE9PSAnY29uc3RydWN0b3InICYmIGtleSAhPT0gJ3RvU3RyaW5nJyAmJiBrZXkgIT09ICd0b1NvdXJjZScpIHtcbiAgICAgICAgICAgICAgICAgICAgY3JlYXRlUHJvcGVydHkocHJvcHMsIGtleSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIHNvbWUgb3RoZXIgcHJvcGVydGllcyBhcmUgbm90XG4gICAgICAgIC8vIGluIE5hdGl2ZUVycm9yXG4gICAgICAgIGNyZWF0ZVByb3BlcnR5KHByb3BzLCAnb3JpZ2luYWxTdGFjaycpO1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShwcm9wcywgJ3pvbmVBd2FyZVN0YWNrJyk7XG4gICAgICAgIC8vIGRlZmluZSB0b1N0cmluZywgdG9Tb3VyY2UgYXMgbWV0aG9kIHByb3BlcnR5XG4gICAgICAgIGNyZWF0ZU1ldGhvZFByb3BlcnR5KHByb3BzLCAndG9TdHJpbmcnKTtcbiAgICAgICAgY3JlYXRlTWV0aG9kUHJvcGVydHkocHJvcHMsICd0b1NvdXJjZScpO1xuICAgICAgICByZXR1cm4gcHJvcHM7XG4gICAgfTtcbiAgICB2YXIgZXJyb3JQcm9wZXJ0aWVzID0gY3JlYXRlRXJyb3JQcm9wZXJ0aWVzKCk7XG4gICAgLy8gZm9yIGRlcml2ZWQgRXJyb3IgY2xhc3Mgd2hpY2ggZXh0ZW5kcyBab25lQXdhcmVFcnJvclxuICAgIC8vIHdlIHNob3VsZCBub3Qgb3ZlcnJpZGUgdGhlIGRlcml2ZWQgY2xhc3MncyBwcm9wZXJ0eVxuICAgIC8vIHNvIHdlIGNyZWF0ZSBhIG5ldyBwcm9wcyBvYmplY3Qgb25seSBjb3B5IHRoZSBwcm9wZXJ0aWVzXG4gICAgLy8gZnJvbSBlcnJvclByb3BlcnRpZXMgd2hpY2ggbm90IGV4aXN0IGluIGRlcml2ZWQgRXJyb3IncyBwcm90b3R5cGVcbiAgICB2YXIgZ2V0RXJyb3JQcm9wZXJ0aWVzRm9yUHJvdG90eXBlID0gZnVuY3Rpb24gKHByb3RvdHlwZSkge1xuICAgICAgICAvLyBpZiB0aGUgcHJvdG90eXBlIGlzIFpvbmVBd2FyZUVycm9yLnByb3RvdHlwZVxuICAgICAgICAvLyB3ZSBqdXN0IHJldHVybiB0aGUgcHJlYnVpbHQgZXJyb3JQcm9wZXJ0aWVzLlxuICAgICAgICBpZiAocHJvdG90eXBlID09PSBab25lQXdhcmVFcnJvci5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvclByb3BlcnRpZXM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld1Byb3BzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgdmFyIGNLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXJyb3JQcm9wZXJ0aWVzKTtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhwcm90b3R5cGUpO1xuICAgICAgICBjS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChjS2V5KSB7XG4gICAgICAgICAgICBpZiAoa2V5cy5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXkgPT09IGNLZXk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBuZXdQcm9wc1tjS2V5XSA9IGVycm9yUHJvcGVydGllc1tjS2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdQcm9wcztcbiAgICB9O1xuICAgIC8qKlxuICAgICAqIFRoaXMgaXMgWm9uZUF3YXJlRXJyb3Igd2hpY2ggcHJvY2Vzc2VzIHRoZSBzdGFjayBmcmFtZSBhbmQgY2xlYW5zIHVwIGV4dHJhIGZyYW1lcyBhcyB3ZWxsIGFzXG4gICAgICogYWRkcyB6b25lIGluZm9ybWF0aW9uIHRvIGl0LlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFpvbmVBd2FyZUVycm9yKCkge1xuICAgICAgICAvLyBtYWtlIHN1cmUgd2UgaGF2ZSBhIHZhbGlkIHRoaXNcbiAgICAgICAgLy8gaWYgdGhpcyBpcyB1bmRlZmluZWQoY2FsbCBFcnJvciB3aXRob3V0IG5ldykgb3IgdGhpcyBpcyBnbG9iYWxcbiAgICAgICAgLy8gb3IgdGhpcyBpcyBzb21lIG90aGVyIG9iamVjdHMsIHdlIHNob3VsZCBmb3JjZSB0byBjcmVhdGUgYVxuICAgICAgICAvLyB2YWxpZCBab25lQXdhcmVFcnJvciBieSBjYWxsIE9iamVjdC5jcmVhdGUoKVxuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgWm9uZUF3YXJlRXJyb3IpKSB7XG4gICAgICAgICAgICByZXR1cm4gWm9uZUF3YXJlRXJyb3IuYXBwbHkoT2JqZWN0LmNyZWF0ZShab25lQXdhcmVFcnJvci5wcm90b3R5cGUpLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIC8vIENyZWF0ZSBhbiBFcnJvci5cbiAgICAgICAgdmFyIGVycm9yID0gTmF0aXZlRXJyb3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdGhpc1tfX3N5bWJvbF9fKCdlcnJvcicpXSA9IGVycm9yO1xuICAgICAgICAvLyBTYXZlIG9yaWdpbmFsIHN0YWNrIHRyYWNlXG4gICAgICAgIGVycm9yLm9yaWdpbmFsU3RhY2sgPSBlcnJvci5zdGFjaztcbiAgICAgICAgLy8gUHJvY2VzcyB0aGUgc3RhY2sgdHJhY2UgYW5kIHJld3JpdGUgdGhlIGZyYW1lcy5cbiAgICAgICAgaWYgKFpvbmVBd2FyZUVycm9yW3N0YWNrUmV3cml0ZV0gJiYgZXJyb3Iub3JpZ2luYWxTdGFjaykge1xuICAgICAgICAgICAgdmFyIGZyYW1lc18xID0gZXJyb3Iub3JpZ2luYWxTdGFjay5zcGxpdCgnXFxuJyk7XG4gICAgICAgICAgICB2YXIgem9uZUZyYW1lID0gX2N1cnJlbnRab25lRnJhbWU7XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgICAgICAvLyBGaW5kIHRoZSBmaXJzdCBmcmFtZVxuICAgICAgICAgICAgd2hpbGUgKGZyYW1lc18xW2ldICE9PSB6b25lQXdhcmVGcmFtZSAmJiBpIDwgZnJhbWVzXzEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICg7IGkgPCBmcmFtZXNfMS5sZW5ndGggJiYgem9uZUZyYW1lOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJhbWUgPSBmcmFtZXNfMVtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZnJhbWUudHJpbSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZVR5cGUgPSBibGFja0xpc3RlZFN0YWNrRnJhbWVzLmhhc093blByb3BlcnR5KGZyYW1lKSAmJiBibGFja0xpc3RlZFN0YWNrRnJhbWVzW2ZyYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZyYW1lVHlwZSA9PT0gRnJhbWVUeXBlLmJsYWNrTGlzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVzXzEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZyYW1lVHlwZSA9PT0gRnJhbWVUeXBlLnRyYW5zaXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh6b25lRnJhbWUucGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBpcyB0aGUgc3BlY2lhbCBmcmFtZSB3aGVyZSB6b25lIGNoYW5nZWQuIFByaW50IGFuZCBwcm9jZXNzIGl0IGFjY29yZGluZ2x5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJhbWVzXzFbaV0gKz0gXCIgW1wiICsgem9uZUZyYW1lLnBhcmVudC56b25lLm5hbWUgKyBcIiA9PiBcIiArIHpvbmVGcmFtZS56b25lLm5hbWUgKyBcIl1cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lRnJhbWUgPSB6b25lRnJhbWUucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgem9uZUZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYW1lc18xW2ldICs9IFwiIFtcIiArIHpvbmVGcmFtZS56b25lLm5hbWUgKyBcIl1cIjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycm9yLnN0YWNrID0gZXJyb3Iuem9uZUF3YXJlU3RhY2sgPSBmcmFtZXNfMS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgICAvLyB1c2UgZGVmaW5lUHJvcGVydGllcyBoZXJlIGluc3RlYWQgb2YgY29weSBwcm9wZXJ0eSB2YWx1ZVxuICAgICAgICAvLyBiZWNhdXNlIG9mIGlzc3VlICM1OTUgd2hpY2ggd2lsbCBicmVhayBhbmd1bGFyMi5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywgZ2V0RXJyb3JQcm9wZXJ0aWVzRm9yUHJvdG90eXBlKE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGlzKSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgLy8gQ29weSB0aGUgcHJvdG90eXBlIHNvIHRoYXQgaW5zdGFuY2VvZiBvcGVyYXRvciB3b3JrcyBhcyBleHBlY3RlZFxuICAgIFpvbmVBd2FyZUVycm9yLnByb3RvdHlwZSA9IE5hdGl2ZUVycm9yLnByb3RvdHlwZTtcbiAgICBab25lQXdhcmVFcnJvcltab25lLl9fc3ltYm9sX18oJ2JsYWNrbGlzdGVkU3RhY2tGcmFtZXMnKV0gPSBibGFja0xpc3RlZFN0YWNrRnJhbWVzO1xuICAgIFpvbmVBd2FyZUVycm9yW3N0YWNrUmV3cml0ZV0gPSBmYWxzZTtcbiAgICBpZiAoTmF0aXZlRXJyb3IuaGFzT3duUHJvcGVydHkoJ3N0YWNrVHJhY2VMaW1pdCcpKSB7XG4gICAgICAgIC8vIEV4dGVuZCBkZWZhdWx0IHN0YWNrIGxpbWl0IGFzIHdlIHdpbGwgYmUgcmVtb3ZpbmcgZmV3IGZyYW1lcy5cbiAgICAgICAgTmF0aXZlRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gTWF0aC5tYXgoTmF0aXZlRXJyb3Iuc3RhY2tUcmFjZUxpbWl0LCAxNSk7XG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGF0IFpvbmVBd2FyZUVycm9yIGhhcyB0aGUgc2FtZSBwcm9wZXJ0eSB3aGljaCBmb3J3YXJkcyB0byBOYXRpdmVFcnJvci5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFpvbmVBd2FyZUVycm9yLCAnc3RhY2tUcmFjZUxpbWl0Jywge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIE5hdGl2ZUVycm9yLnN0YWNrVHJhY2VMaW1pdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBOYXRpdmVFcnJvci5zdGFja1RyYWNlTGltaXQgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChOYXRpdmVFcnJvci5oYXNPd25Qcm9wZXJ0eSgnY2FwdHVyZVN0YWNrVHJhY2UnKSkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWm9uZUF3YXJlRXJyb3IsICdjYXB0dXJlU3RhY2tUcmFjZScsIHtcbiAgICAgICAgICAgIC8vIGFkZCBuYW1lZCBmdW5jdGlvbiBoZXJlIGJlY2F1c2Ugd2UgbmVlZCB0byByZW1vdmUgdGhpc1xuICAgICAgICAgICAgLy8gc3RhY2sgZnJhbWUgd2hlbiBwcmVwYXJlU3RhY2tUcmFjZSBiZWxvd1xuICAgICAgICAgICAgdmFsdWU6IGZ1bmN0aW9uIHpvbmVDYXB0dXJlU3RhY2tUcmFjZSh0YXJnZXRPYmplY3QsIGNvbnN0cnVjdG9yT3B0KSB7XG4gICAgICAgICAgICAgICAgTmF0aXZlRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGFyZ2V0T2JqZWN0LCBjb25zdHJ1Y3Rvck9wdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWm9uZUF3YXJlRXJyb3IsICdwcmVwYXJlU3RhY2tUcmFjZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gTmF0aXZlRXJyb3IucHJlcGFyZVN0YWNrVHJhY2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXZhbHVlIHx8IHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBOYXRpdmVFcnJvci5wcmVwYXJlU3RhY2tUcmFjZSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIE5hdGl2ZUVycm9yLnByZXBhcmVTdGFja1RyYWNlID0gZnVuY3Rpb24gKGVycm9yLCBzdHJ1Y3R1cmVkU3RhY2tUcmFjZSkge1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSBhZGRpdGlvbmFsIHN0YWNrIGluZm9ybWF0aW9uIGZyb20gWm9uZUF3YXJlRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2VcbiAgICAgICAgICAgICAgICBpZiAoc3RydWN0dXJlZFN0YWNrVHJhY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHJ1Y3R1cmVkU3RhY2tUcmFjZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ID0gc3RydWN0dXJlZFN0YWNrVHJhY2VbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyByZW1vdmUgdGhlIGZpcnN0IGZ1bmN0aW9uIHdoaWNoIG5hbWUgaXMgem9uZUNhcHR1cmVTdGFja1RyYWNlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3QuZ2V0RnVuY3Rpb25OYW1lKCkgPT09ICd6b25lQ2FwdHVyZVN0YWNrVHJhY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RydWN0dXJlZFN0YWNrVHJhY2Uuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5hcHBseSh0aGlzLCBbZXJyb3IsIHN0cnVjdHVyZWRTdGFja1RyYWNlXSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgLy8gTm93IHdlIG5lZWQgdG8gcG9wdWxldCB0aGUgYGJsYWNrbGlzdGVkU3RhY2tGcmFtZXNgIGFzIHdlbGwgYXMgZmluZCB0aGVcbiAgICAvLyBydW4vcnVuR3VyYWRlZC9ydW5UYXNrIGZyYW1lcy4gVGhpcyBpcyBkb25lIGJ5IGNyZWF0aW5nIGEgZGV0ZWN0IHpvbmUgYW5kIHRoZW4gdGhyZWFkaW5nXG4gICAgLy8gdGhlIGV4ZWN1dGlvbiB0aHJvdWdoIGFsbCBvZiB0aGUgYWJvdmUgbWV0aG9kcyBzbyB0aGF0IHdlIGNhbiBsb29rIGF0IHRoZSBzdGFjayB0cmFjZSBhbmRcbiAgICAvLyBmaW5kIHRoZSBmcmFtZXMgb2YgaW50ZXJlc3QuXG4gICAgdmFyIGRldGVjdFpvbmUgPSBab25lLmN1cnJlbnQuZm9yayh7XG4gICAgICAgIG5hbWU6ICdkZXRlY3QnLFxuICAgICAgICBvbkludm9rZTogZnVuY3Rpb24gKHBhcmVudFpvbmVEZWxlZ2F0ZSwgY3VycmVudFpvbmUsIHRhcmdldFpvbmUsIGRlbGVnYXRlLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKSB7XG4gICAgICAgICAgICAvLyBIZXJlIG9ubHkgc28gdGhhdCBpdCB3aWxsIHNob3cgdXAgaW4gdGhlIHN0YWNrIGZyYW1lIHNvIHRoYXQgaXQgY2FuIGJlIGJsYWNrIGxpc3RlZC5cbiAgICAgICAgICAgIHJldHVybiBwYXJlbnRab25lRGVsZWdhdGUuaW52b2tlKHRhcmdldFpvbmUsIGRlbGVnYXRlLCBhcHBseVRoaXMsIGFwcGx5QXJncywgc291cmNlKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25IYW5kbGVFcnJvcjogZnVuY3Rpb24gKHBhcmVudFpELCBjdXJyZW50LCB0YXJnZXQsIGVycm9yKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3Iub3JpZ2luYWxTdGFjayAmJiBFcnJvciA9PT0gWm9uZUF3YXJlRXJyb3IpIHtcbiAgICAgICAgICAgICAgICB2YXIgZnJhbWVzXzIgPSBlcnJvci5vcmlnaW5hbFN0YWNrLnNwbGl0KC9cXG4vKTtcbiAgICAgICAgICAgICAgICB2YXIgcnVuRnJhbWUgPSBmYWxzZSwgcnVuR3VhcmRlZEZyYW1lID0gZmFsc2UsIHJ1blRhc2tGcmFtZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHdoaWxlIChmcmFtZXNfMi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZyYW1lID0gZnJhbWVzXzIuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gT24gc2FmYXJpIGl0IGlzIHBvc3NpYmxlIHRvIGhhdmUgc3RhY2sgZnJhbWUgd2l0aCBubyBsaW5lIG51bWJlci5cbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBjaGVjayBtYWtlcyBzdXJlIHRoYXQgd2UgZG9uJ3QgZmlsdGVyIGZyYW1lcyBvbiBuYW1lIG9ubHkgKG11c3QgaGF2ZVxuICAgICAgICAgICAgICAgICAgICAvLyBsaW5lbnVtYmVyKVxuICAgICAgICAgICAgICAgICAgICBpZiAoLzpcXGQrOlxcZCsvLnRlc3QoZnJhbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgcmlkIG9mIHRoZSBwYXRoIHNvIHRoYXQgd2UgZG9uJ3QgYWNjaWRpbnRlbHkgZmluZCBmdW5jdGlvbiBuYW1lIGluIHBhdGguXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBJbiBjaHJvbWUgdGhlIHNlcGVyYXRvciBpcyBgKGAgYW5kIGBAYCBpbiBGRiBhbmQgc2FmYXJpXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaHJvbWU6IGF0IFpvbmUucnVuICh6b25lLmpzOjEwMClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENocm9tZTogYXQgWm9uZS5ydW4gKGh0dHA6Ly9sb2NhbGhvc3Q6OTg3Ni9iYXNlL2J1aWxkL2xpYi96b25lLmpzOjEwMDoyNClcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIEZpcmVGb3g6IFpvbmUucHJvdG90eXBlLnJ1bkBodHRwOi8vbG9jYWxob3N0Ojk4NzYvYmFzZS9idWlsZC9saWIvem9uZS5qczoxMDE6MjRcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNhZmFyaTogcnVuQGh0dHA6Ly9sb2NhbGhvc3Q6OTg3Ni9iYXNlL2J1aWxkL2xpYi96b25lLmpzOjEwMToyNFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZuTmFtZSA9IGZyYW1lLnNwbGl0KCcoJylbMF0uc3BsaXQoJ0AnKVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmcmFtZVR5cGUgPSBGcmFtZVR5cGUudHJhbnNpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbk5hbWUuaW5kZXhPZignWm9uZUF3YXJlRXJyb3InKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB6b25lQXdhcmVGcmFtZSA9IGZyYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZuTmFtZS5pbmRleE9mKCdydW5HdWFyZGVkJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuR3VhcmRlZEZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuTmFtZS5pbmRleE9mKCdydW5UYXNrJykgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuVGFza0ZyYW1lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZuTmFtZS5pbmRleE9mKCdydW4nKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBydW5GcmFtZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcmFtZVR5cGUgPSBGcmFtZVR5cGUuYmxhY2tMaXN0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYmxhY2tMaXN0ZWRTdGFja0ZyYW1lc1tmcmFtZV0gPSBmcmFtZVR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBPbmNlIHdlIGZpbmQgYWxsIG9mIHRoZSBmcmFtZXMgd2UgY2FuIHN0b3AgbG9va2luZy5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5GcmFtZSAmJiBydW5HdWFyZGVkRnJhbWUgJiYgcnVuVGFza0ZyYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgWm9uZUF3YXJlRXJyb3Jbc3RhY2tSZXdyaXRlXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBjYXJlZnVsbHkgY29uc3RydWN0b3IgYSBzdGFjayBmcmFtZSB3aGljaCBjb250YWlucyBhbGwgb2YgdGhlIGZyYW1lcyBvZiBpbnRlcmVzdCB3aGljaFxuICAgIC8vIG5lZWQgdG8gYmUgZGV0ZWN0ZWQgYW5kIGJsYWNrbGlzdGVkLlxuICAgIHZhciBkZXRlY3RSdW5GbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGV0ZWN0Wm9uZS5ydW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZGV0ZWN0Wm9uZS5ydW5HdWFyZGVkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2JsYWNrbGlzdFN0YWNrRnJhbWVzJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAvLyBDYXVzZSB0aGUgZXJyb3IgdG8gZXh0cmFjdCB0aGUgc3RhY2sgZnJhbWVzLlxuICAgIGRldGVjdFpvbmUucnVuVGFzayhkZXRlY3Rab25lLnNjaGVkdWxlTWFjcm9UYXNrKCdkZXRlY3QnLCBkZXRlY3RSdW5GbiwgbnVsbCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gbnVsbDsgfSwgbnVsbCkpO1xuICAgIHJldHVybiBnbG9iYWxbJ1pvbmUnXSA9IFpvbmU7XG59KSh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cgfHwgdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYgfHwgZ2xvYmFsKTtcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLyoqXG4gKiBTdXBwcmVzcyBjbG9zdXJlIGNvbXBpbGVyIGVycm9ycyBhYm91dCB1bmtub3duICdab25lJyB2YXJpYWJsZVxuICogQGZpbGVvdmVydmlld1xuICogQHN1cHByZXNzIHt1bmRlZmluZWRWYXJzfVxuICovXG52YXIgem9uZVN5bWJvbCA9IGZ1bmN0aW9uIChuKSB7IHJldHVybiBcIl9fem9uZV9zeW1ib2xfX1wiICsgbjsgfTtcbnZhciBfZ2xvYmFsJDEgPSB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB3aW5kb3cgfHwgdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYgfHwgZ2xvYmFsO1xuZnVuY3Rpb24gYmluZEFyZ3VtZW50cyhhcmdzLCBzb3VyY2UpIHtcbiAgICBmb3IgKHZhciBpID0gYXJncy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbaV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGFyZ3NbaV0gPSBab25lLmN1cnJlbnQud3JhcChhcmdzW2ldLCBzb3VyY2UgKyAnXycgKyBpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJncztcbn1cbmZ1bmN0aW9uIHBhdGNoUHJvdG90eXBlKHByb3RvdHlwZSwgZm5OYW1lcykge1xuICAgIHZhciBzb3VyY2UgPSBwcm90b3R5cGUuY29uc3RydWN0b3JbJ25hbWUnXTtcbiAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBuYW1lXzEgPSBmbk5hbWVzW2ldO1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBwcm90b3R5cGVbbmFtZV8xXTtcbiAgICAgICAgaWYgKGRlbGVnYXRlKSB7XG4gICAgICAgICAgICBwcm90b3R5cGVbbmFtZV8xXSA9IChmdW5jdGlvbiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVsZWdhdGUuYXBwbHkodGhpcywgYmluZEFyZ3VtZW50cyhhcmd1bWVudHMsIHNvdXJjZSArICcuJyArIG5hbWVfMSkpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9KShkZWxlZ2F0ZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZm5OYW1lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBfbG9vcF8xKGkpO1xuICAgIH1cbn1cbnZhciBpc1dlYldvcmtlciA9ICh0eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUgIT09ICd1bmRlZmluZWQnICYmIHNlbGYgaW5zdGFuY2VvZiBXb3JrZXJHbG9iYWxTY29wZSk7XG52YXIgaXNOb2RlID0gKCEoJ253JyBpbiBfZ2xvYmFsJDEpICYmIHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHt9LnRvU3RyaW5nLmNhbGwocHJvY2VzcykgPT09ICdbb2JqZWN0IHByb2Nlc3NdJyk7XG52YXIgaXNCcm93c2VyID0gIWlzTm9kZSAmJiAhaXNXZWJXb3JrZXIgJiYgISEodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93WydIVE1MRWxlbWVudCddKTtcbmZ1bmN0aW9uIHBhdGNoUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gICAgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgcHJvcCkgfHwgeyBlbnVtZXJhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfTtcbiAgICB2YXIgb3JpZ2luYWxEZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosICdvcmlnaW5hbCcgKyBwcm9wKTtcbiAgICBpZiAoIW9yaWdpbmFsRGVzYyAmJiBkZXNjLmdldCkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCAnb3JpZ2luYWwnICsgcHJvcCwgeyBlbnVtZXJhYmxlOiBmYWxzZSwgY29uZmlndXJhYmxlOiB0cnVlLCBnZXQ6IGRlc2MuZ2V0IH0pO1xuICAgIH1cbiAgICAvLyBBIHByb3BlcnR5IGRlc2NyaXB0b3IgY2Fubm90IGhhdmUgZ2V0dGVyL3NldHRlciBhbmQgYmUgd3JpdGFibGVcbiAgICAvLyBkZWxldGluZyB0aGUgd3JpdGFibGUgYW5kIHZhbHVlIHByb3BlcnRpZXMgYXZvaWRzIHRoaXMgZXJyb3I6XG4gICAgLy9cbiAgICAvLyBUeXBlRXJyb3I6IHByb3BlcnR5IGRlc2NyaXB0b3JzIG11c3Qgbm90IHNwZWNpZnkgYSB2YWx1ZSBvciBiZSB3cml0YWJsZSB3aGVuIGFcbiAgICAvLyBnZXR0ZXIgb3Igc2V0dGVyIGhhcyBiZWVuIHNwZWNpZmllZFxuICAgIGRlbGV0ZSBkZXNjLndyaXRhYmxlO1xuICAgIGRlbGV0ZSBkZXNjLnZhbHVlO1xuICAgIC8vIHN1YnN0cigyKSBjdXogJ29uY2xpY2snIC0+ICdjbGljaycsIGV0Y1xuICAgIHZhciBldmVudE5hbWUgPSBwcm9wLnN1YnN0cigyKTtcbiAgICB2YXIgX3Byb3AgPSAnXycgKyBwcm9wO1xuICAgIGRlc2Muc2V0ID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIGlmICh0aGlzW19wcm9wXSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgdGhpc1tfcHJvcF0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhciB3cmFwRm4gPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3VsdCAhPSB1bmRlZmluZWQgJiYgIXJlc3VsdClcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzW19wcm9wXSA9IHdyYXBGbjtcbiAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIHdyYXBGbiwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpc1tfcHJvcF0gPSBudWxsO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvLyBUaGUgZ2V0dGVyIHdvdWxkIHJldHVybiB1bmRlZmluZWQgZm9yIHVuYXNzaWduZWQgcHJvcGVydGllcyBidXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgYW5cbiAgICAvLyB1bmFzc2lnbmVkIHByb3BlcnR5IGlzIG51bGxcbiAgICBkZXNjLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHIgPSB0aGlzW19wcm9wXSB8fCBudWxsO1xuICAgICAgICAvLyByZXN1bHQgd2lsbCBiZSBudWxsIHdoZW4gdXNlIGlubGluZSBldmVudCBhdHRyaWJ1dGUsXG4gICAgICAgIC8vIHN1Y2ggYXMgPGJ1dHRvbiBvbmNsaWNrPVwiZnVuYygpO1wiPk9LPC9idXR0b24+XG4gICAgICAgIC8vIGJlY2F1c2UgdGhlIG9uY2xpY2sgZnVuY3Rpb24gaXMgaW50ZXJuYWwgcmF3IHVuY29tcGlsZWQgaGFuZGxlclxuICAgICAgICAvLyB0aGUgb25jbGljayB3aWxsIGJlIGV2YWx1YXRlZCB3aGVuIGZpcnN0IHRpbWUgZXZlbnQgd2FzIHRyaWdnZXJlZCBvclxuICAgICAgICAvLyB0aGUgcHJvcGVydHkgaXMgYWNjZXNzZWQsIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3pvbmUuanMvaXNzdWVzLzUyNVxuICAgICAgICAvLyBzbyB3ZSBzaG91bGQgdXNlIG9yaWdpbmFsIG5hdGl2ZSBnZXQgdG8gcmV0cmlldmUgdGhlIGhhbmRsZXJcbiAgICAgICAgaWYgKHIgPT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbERlc2MgJiYgb3JpZ2luYWxEZXNjLmdldCkge1xuICAgICAgICAgICAgICAgIHIgPSBvcmlnaW5hbERlc2MuZ2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgaWYgKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzYy5zZXQuYXBwbHkodGhpcywgW3JdKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzWydyZW1vdmVBdHRyaWJ1dGUnXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUocHJvcCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXNbX3Byb3BdIHx8IG51bGw7XG4gICAgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBkZXNjKTtcbn1cblxuZnVuY3Rpb24gcGF0Y2hPblByb3BlcnRpZXMob2JqLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIG9uUHJvcGVydGllcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3AgaW4gb2JqKSB7XG4gICAgICAgIGlmIChwcm9wLnN1YnN0cigwLCAyKSA9PSAnb24nKSB7XG4gICAgICAgICAgICBvblByb3BlcnRpZXMucHVzaChwcm9wKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG9uUHJvcGVydGllcy5sZW5ndGg7IGorKykge1xuICAgICAgICBwYXRjaFByb3BlcnR5KG9iaiwgb25Qcm9wZXJ0aWVzW2pdKTtcbiAgICB9XG4gICAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXRjaFByb3BlcnR5KG9iaiwgJ29uJyArIHByb3BlcnRpZXNbaV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG52YXIgRVZFTlRfVEFTS1MgPSB6b25lU3ltYm9sKCdldmVudFRhc2tzJyk7XG4vLyBGb3IgRXZlbnRUYXJnZXRcbnZhciBBRERfRVZFTlRfTElTVEVORVIgPSAnYWRkRXZlbnRMaXN0ZW5lcic7XG52YXIgUkVNT1ZFX0VWRU5UX0xJU1RFTkVSID0gJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuZnVuY3Rpb24gZmluZEV4aXN0aW5nUmVnaXN0ZXJlZFRhc2sodGFyZ2V0LCBoYW5kbGVyLCBuYW1lLCBjYXB0dXJlLCByZW1vdmUpIHtcbiAgICB2YXIgZXZlbnRUYXNrcyA9IHRhcmdldFtFVkVOVF9UQVNLU107XG4gICAgaWYgKGV2ZW50VGFza3MpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudFRhc2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnRUYXNrID0gZXZlbnRUYXNrc1tpXTtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZXZlbnRUYXNrLmRhdGE7XG4gICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBkYXRhLmhhbmRsZXI7XG4gICAgICAgICAgICBpZiAoKGRhdGEuaGFuZGxlciA9PT0gaGFuZGxlciB8fCBsaXN0ZW5lci5saXN0ZW5lciA9PT0gaGFuZGxlcikgJiZcbiAgICAgICAgICAgICAgICBkYXRhLnVzZUNhcHR1cmluZyA9PT0gY2FwdHVyZSAmJiBkYXRhLmV2ZW50TmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdmUpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRUYXNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBldmVudFRhc2s7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBmaW5kQWxsRXhpc3RpbmdSZWdpc3RlcmVkVGFza3ModGFyZ2V0LCBuYW1lLCBjYXB0dXJlLCByZW1vdmUpIHtcbiAgICB2YXIgZXZlbnRUYXNrcyA9IHRhcmdldFtFVkVOVF9UQVNLU107XG4gICAgaWYgKGV2ZW50VGFza3MpIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gZXZlbnRUYXNrcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdmFyIGV2ZW50VGFzayA9IGV2ZW50VGFza3NbaV07XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGV2ZW50VGFzay5kYXRhO1xuICAgICAgICAgICAgaWYgKGRhdGEuZXZlbnROYW1lID09PSBuYW1lICYmIGRhdGEudXNlQ2FwdHVyaW5nID09PSBjYXB0dXJlKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goZXZlbnRUYXNrKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VGFza3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGF0dGFjaFJlZ2lzdGVyZWRFdmVudCh0YXJnZXQsIGV2ZW50VGFzaywgaXNQcmVwZW5kKSB7XG4gICAgdmFyIGV2ZW50VGFza3MgPSB0YXJnZXRbRVZFTlRfVEFTS1NdO1xuICAgIGlmICghZXZlbnRUYXNrcykge1xuICAgICAgICBldmVudFRhc2tzID0gdGFyZ2V0W0VWRU5UX1RBU0tTXSA9IFtdO1xuICAgIH1cbiAgICBpZiAoaXNQcmVwZW5kKSB7XG4gICAgICAgIGV2ZW50VGFza3MudW5zaGlmdChldmVudFRhc2spO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZXZlbnRUYXNrcy5wdXNoKGV2ZW50VGFzayk7XG4gICAgfVxufVxudmFyIGRlZmF1bHRMaXN0ZW5lck1ldGFDcmVhdG9yID0gZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB1c2VDYXB0dXJpbmc6IGFyZ3NbMl0sXG4gICAgICAgIGV2ZW50TmFtZTogYXJnc1swXSxcbiAgICAgICAgaGFuZGxlcjogYXJnc1sxXSxcbiAgICAgICAgdGFyZ2V0OiBzZWxmIHx8IF9nbG9iYWwkMSxcbiAgICAgICAgbmFtZTogYXJnc1swXSxcbiAgICAgICAgaW52b2tlQWRkRnVuYzogZnVuY3Rpb24gKGFkZEZuU3ltYm9sLCBkZWxlZ2F0ZSkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlICYmIGRlbGVnYXRlLmludm9rZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldFthZGRGblN5bWJvbF0odGhpcy5ldmVudE5hbWUsIGRlbGVnYXRlLmludm9rZSwgdGhpcy51c2VDYXB0dXJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0W2FkZEZuU3ltYm9sXSh0aGlzLmV2ZW50TmFtZSwgZGVsZWdhdGUsIHRoaXMudXNlQ2FwdHVyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52b2tlUmVtb3ZlRnVuYzogZnVuY3Rpb24gKHJlbW92ZUZuU3ltYm9sLCBkZWxlZ2F0ZSkge1xuICAgICAgICAgICAgaWYgKGRlbGVnYXRlICYmIGRlbGVnYXRlLmludm9rZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRhcmdldFtyZW1vdmVGblN5bWJvbF0odGhpcy5ldmVudE5hbWUsIGRlbGVnYXRlLmludm9rZSwgdGhpcy51c2VDYXB0dXJpbmcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudGFyZ2V0W3JlbW92ZUZuU3ltYm9sXSh0aGlzLmV2ZW50TmFtZSwgZGVsZWdhdGUsIHRoaXMudXNlQ2FwdHVyaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59O1xuZnVuY3Rpb24gbWFrZVpvbmVBd2FyZUFkZExpc3RlbmVyKGFkZEZuTmFtZSwgcmVtb3ZlRm5OYW1lLCB1c2VDYXB0dXJpbmdQYXJhbSwgYWxsb3dEdXBsaWNhdGVzLCBpc1ByZXBlbmQsIG1ldGFDcmVhdG9yKSB7XG4gICAgaWYgKHVzZUNhcHR1cmluZ1BhcmFtID09PSB2b2lkIDApIHsgdXNlQ2FwdHVyaW5nUGFyYW0gPSB0cnVlOyB9XG4gICAgaWYgKGFsbG93RHVwbGljYXRlcyA9PT0gdm9pZCAwKSB7IGFsbG93RHVwbGljYXRlcyA9IGZhbHNlOyB9XG4gICAgaWYgKGlzUHJlcGVuZCA9PT0gdm9pZCAwKSB7IGlzUHJlcGVuZCA9IGZhbHNlOyB9XG4gICAgaWYgKG1ldGFDcmVhdG9yID09PSB2b2lkIDApIHsgbWV0YUNyZWF0b3IgPSBkZWZhdWx0TGlzdGVuZXJNZXRhQ3JlYXRvcjsgfVxuICAgIHZhciBhZGRGblN5bWJvbCA9IHpvbmVTeW1ib2woYWRkRm5OYW1lKTtcbiAgICB2YXIgcmVtb3ZlRm5TeW1ib2wgPSB6b25lU3ltYm9sKHJlbW92ZUZuTmFtZSk7XG4gICAgdmFyIGRlZmF1bHRVc2VDYXB0dXJpbmcgPSB1c2VDYXB0dXJpbmdQYXJhbSA/IGZhbHNlIDogdW5kZWZpbmVkO1xuICAgIGZ1bmN0aW9uIHNjaGVkdWxlRXZlbnRMaXN0ZW5lcihldmVudFRhc2spIHtcbiAgICAgICAgdmFyIG1ldGEgPSBldmVudFRhc2suZGF0YTtcbiAgICAgICAgYXR0YWNoUmVnaXN0ZXJlZEV2ZW50KG1ldGEudGFyZ2V0LCBldmVudFRhc2ssIGlzUHJlcGVuZCk7XG4gICAgICAgIHJldHVybiBtZXRhLmludm9rZUFkZEZ1bmMoYWRkRm5TeW1ib2wsIGV2ZW50VGFzayk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNhbmNlbEV2ZW50TGlzdGVuZXIoZXZlbnRUYXNrKSB7XG4gICAgICAgIHZhciBtZXRhID0gZXZlbnRUYXNrLmRhdGE7XG4gICAgICAgIGZpbmRFeGlzdGluZ1JlZ2lzdGVyZWRUYXNrKG1ldGEudGFyZ2V0LCBldmVudFRhc2suaW52b2tlLCBtZXRhLmV2ZW50TmFtZSwgbWV0YS51c2VDYXB0dXJpbmcsIHRydWUpO1xuICAgICAgICByZXR1cm4gbWV0YS5pbnZva2VSZW1vdmVGdW5jKHJlbW92ZUZuU3ltYm9sLCBldmVudFRhc2spO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gem9uZUF3YXJlQWRkTGlzdGVuZXIoc2VsZiwgYXJncykge1xuICAgICAgICB2YXIgZGF0YSA9IG1ldGFDcmVhdG9yKHNlbGYsIGFyZ3MpO1xuICAgICAgICBkYXRhLnVzZUNhcHR1cmluZyA9IGRhdGEudXNlQ2FwdHVyaW5nIHx8IGRlZmF1bHRVc2VDYXB0dXJpbmc7XG4gICAgICAgIC8vIC0gSW5zaWRlIGEgV2ViIFdvcmtlciwgYHRoaXNgIGlzIHVuZGVmaW5lZCwgdGhlIGNvbnRleHQgaXMgYGdsb2JhbGBcbiAgICAgICAgLy8gLSBXaGVuIGBhZGRFdmVudExpc3RlbmVyYCBpcyBjYWxsZWQgb24gdGhlIGdsb2JhbCBjb250ZXh0IGluIHN0cmljdCBtb2RlLCBgdGhpc2AgaXMgdW5kZWZpbmVkXG4gICAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci96b25lLmpzL2lzc3Vlcy8xOTBcbiAgICAgICAgdmFyIGRlbGVnYXRlID0gbnVsbDtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhLmhhbmRsZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgZGVsZWdhdGUgPSBkYXRhLmhhbmRsZXI7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGF0YS5oYW5kbGVyICYmIGRhdGEuaGFuZGxlci5oYW5kbGVFdmVudCkge1xuICAgICAgICAgICAgZGVsZWdhdGUgPSBmdW5jdGlvbiAoZXZlbnQpIHsgcmV0dXJuIGRhdGEuaGFuZGxlci5oYW5kbGVFdmVudChldmVudCk7IH07XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHZhbGlkWm9uZUhhbmRsZXIgPSBmYWxzZTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEluIGNyb3NzIHNpdGUgY29udGV4dHMgKHN1Y2ggYXMgV2ViRHJpdmVyIGZyYW1ld29ya3MgbGlrZSBTZWxlbml1bSksXG4gICAgICAgICAgICAvLyBhY2Nlc3NpbmcgdGhlIGhhbmRsZXIgb2JqZWN0IGhlcmUgd2lsbCBjYXVzZSBhbiBleGNlcHRpb24gdG8gYmUgdGhyb3duIHdoaWNoXG4gICAgICAgICAgICAvLyB3aWxsIGZhaWwgdGVzdHMgcHJlbWF0dXJlbHkuXG4gICAgICAgICAgICB2YWxpZFpvbmVIYW5kbGVyID0gZGF0YS5oYW5kbGVyICYmIGRhdGEuaGFuZGxlci50b1N0cmluZygpID09PSAnW29iamVjdCBGdW5jdGlvbldyYXBwZXJdJztcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gUmV0dXJuaW5nIG5vdGhpbmcgaGVyZSBpcyBmaW5lLCBiZWNhdXNlIG9iamVjdHMgaW4gYSBjcm9zcy1zaXRlIGNvbnRleHQgYXJlIHVudXNhYmxlXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWdub3JlIHNwZWNpYWwgbGlzdGVuZXJzIG9mIElFMTEgJiBFZGdlIGRldiB0b29scywgc2VlXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL3pvbmUuanMvaXNzdWVzLzE1MFxuICAgICAgICBpZiAoIWRlbGVnYXRlIHx8IHZhbGlkWm9uZUhhbmRsZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmludm9rZUFkZEZ1bmMoYWRkRm5TeW1ib2wsIGRhdGEuaGFuZGxlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFhbGxvd0R1cGxpY2F0ZXMpIHtcbiAgICAgICAgICAgIHZhciBldmVudFRhc2sgPSBmaW5kRXhpc3RpbmdSZWdpc3RlcmVkVGFzayhkYXRhLnRhcmdldCwgZGF0YS5oYW5kbGVyLCBkYXRhLmV2ZW50TmFtZSwgZGF0YS51c2VDYXB0dXJpbmcsIGZhbHNlKTtcbiAgICAgICAgICAgIGlmIChldmVudFRhc2spIHtcbiAgICAgICAgICAgICAgICAvLyB3ZSBhbHJlYWR5IHJlZ2lzdGVyZWQsIHNvIHRoaXMgd2lsbCBoYXZlIG5vb3AuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGEuaW52b2tlQWRkRnVuYyhhZGRGblN5bWJvbCwgZXZlbnRUYXNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgem9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGRhdGEudGFyZ2V0LmNvbnN0cnVjdG9yWyduYW1lJ10gKyAnLicgKyBhZGRGbk5hbWUgKyAnOicgKyBkYXRhLmV2ZW50TmFtZTtcbiAgICAgICAgem9uZS5zY2hlZHVsZUV2ZW50VGFzayhzb3VyY2UsIGRlbGVnYXRlLCBkYXRhLCBzY2hlZHVsZUV2ZW50TGlzdGVuZXIsIGNhbmNlbEV2ZW50TGlzdGVuZXIpO1xuICAgIH07XG59XG5mdW5jdGlvbiBtYWtlWm9uZUF3YXJlUmVtb3ZlTGlzdGVuZXIoZm5OYW1lLCB1c2VDYXB0dXJpbmdQYXJhbSwgbWV0YUNyZWF0b3IpIHtcbiAgICBpZiAodXNlQ2FwdHVyaW5nUGFyYW0gPT09IHZvaWQgMCkgeyB1c2VDYXB0dXJpbmdQYXJhbSA9IHRydWU7IH1cbiAgICBpZiAobWV0YUNyZWF0b3IgPT09IHZvaWQgMCkgeyBtZXRhQ3JlYXRvciA9IGRlZmF1bHRMaXN0ZW5lck1ldGFDcmVhdG9yOyB9XG4gICAgdmFyIHN5bWJvbCA9IHpvbmVTeW1ib2woZm5OYW1lKTtcbiAgICB2YXIgZGVmYXVsdFVzZUNhcHR1cmluZyA9IHVzZUNhcHR1cmluZ1BhcmFtID8gZmFsc2UgOiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHpvbmVBd2FyZVJlbW92ZUxpc3RlbmVyKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBtZXRhQ3JlYXRvcihzZWxmLCBhcmdzKTtcbiAgICAgICAgZGF0YS51c2VDYXB0dXJpbmcgPSBkYXRhLnVzZUNhcHR1cmluZyB8fCBkZWZhdWx0VXNlQ2FwdHVyaW5nO1xuICAgICAgICAvLyAtIEluc2lkZSBhIFdlYiBXb3JrZXIsIGB0aGlzYCBpcyB1bmRlZmluZWQsIHRoZSBjb250ZXh0IGlzIGBnbG9iYWxgXG4gICAgICAgIC8vIC0gV2hlbiBgYWRkRXZlbnRMaXN0ZW5lcmAgaXMgY2FsbGVkIG9uIHRoZSBnbG9iYWwgY29udGV4dCBpbiBzdHJpY3QgbW9kZSwgYHRoaXNgIGlzIHVuZGVmaW5lZFxuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvem9uZS5qcy9pc3N1ZXMvMTkwXG4gICAgICAgIHZhciBldmVudFRhc2sgPSBmaW5kRXhpc3RpbmdSZWdpc3RlcmVkVGFzayhkYXRhLnRhcmdldCwgZGF0YS5oYW5kbGVyLCBkYXRhLmV2ZW50TmFtZSwgZGF0YS51c2VDYXB0dXJpbmcsIHRydWUpO1xuICAgICAgICBpZiAoZXZlbnRUYXNrKSB7XG4gICAgICAgICAgICBldmVudFRhc2suem9uZS5jYW5jZWxUYXNrKGV2ZW50VGFzayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkYXRhLmludm9rZVJlbW92ZUZ1bmMoc3ltYm9sLCBkYXRhLmhhbmRsZXIpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuXG52YXIgem9uZUF3YXJlQWRkRXZlbnRMaXN0ZW5lciA9IG1ha2Vab25lQXdhcmVBZGRMaXN0ZW5lcihBRERfRVZFTlRfTElTVEVORVIsIFJFTU9WRV9FVkVOVF9MSVNURU5FUik7XG52YXIgem9uZUF3YXJlUmVtb3ZlRXZlbnRMaXN0ZW5lciA9IG1ha2Vab25lQXdhcmVSZW1vdmVMaXN0ZW5lcihSRU1PVkVfRVZFTlRfTElTVEVORVIpO1xuZnVuY3Rpb24gcGF0Y2hFdmVudFRhcmdldE1ldGhvZHMob2JqLCBhZGRGbk5hbWUsIHJlbW92ZUZuTmFtZSwgbWV0YUNyZWF0b3IpIHtcbiAgICBpZiAoYWRkRm5OYW1lID09PSB2b2lkIDApIHsgYWRkRm5OYW1lID0gQUREX0VWRU5UX0xJU1RFTkVSOyB9XG4gICAgaWYgKHJlbW92ZUZuTmFtZSA9PT0gdm9pZCAwKSB7IHJlbW92ZUZuTmFtZSA9IFJFTU9WRV9FVkVOVF9MSVNURU5FUjsgfVxuICAgIGlmIChtZXRhQ3JlYXRvciA9PT0gdm9pZCAwKSB7IG1ldGFDcmVhdG9yID0gZGVmYXVsdExpc3RlbmVyTWV0YUNyZWF0b3I7IH1cbiAgICBpZiAob2JqICYmIG9ialthZGRGbk5hbWVdKSB7XG4gICAgICAgIHBhdGNoTWV0aG9kKG9iaiwgYWRkRm5OYW1lLCBmdW5jdGlvbiAoKSB7IHJldHVybiBtYWtlWm9uZUF3YXJlQWRkTGlzdGVuZXIoYWRkRm5OYW1lLCByZW1vdmVGbk5hbWUsIHRydWUsIGZhbHNlLCBmYWxzZSwgbWV0YUNyZWF0b3IpOyB9KTtcbiAgICAgICAgcGF0Y2hNZXRob2Qob2JqLCByZW1vdmVGbk5hbWUsIGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1ha2Vab25lQXdhcmVSZW1vdmVMaXN0ZW5lcihyZW1vdmVGbk5hbWUsIHRydWUsIG1ldGFDcmVhdG9yKTsgfSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbnZhciBvcmlnaW5hbEluc3RhbmNlS2V5ID0gem9uZVN5bWJvbCgnb3JpZ2luYWxJbnN0YW5jZScpO1xuLy8gd3JhcCBzb21lIG5hdGl2ZSBBUEkgb24gYHdpbmRvd2BcbmZ1bmN0aW9uIHBhdGNoQ2xhc3MoY2xhc3NOYW1lKSB7XG4gICAgdmFyIE9yaWdpbmFsQ2xhc3MgPSBfZ2xvYmFsJDFbY2xhc3NOYW1lXTtcbiAgICBpZiAoIU9yaWdpbmFsQ2xhc3MpXG4gICAgICAgIHJldHVybjtcbiAgICBfZ2xvYmFsJDFbY2xhc3NOYW1lXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGEgPSBiaW5kQXJndW1lbnRzKGFyZ3VtZW50cywgY2xhc3NOYW1lKTtcbiAgICAgICAgc3dpdGNoIChhLmxlbmd0aCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXNbb3JpZ2luYWxJbnN0YW5jZUtleV0gPSBuZXcgT3JpZ2luYWxDbGFzcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXNbb3JpZ2luYWxJbnN0YW5jZUtleV0gPSBuZXcgT3JpZ2luYWxDbGFzcyhhWzBdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICB0aGlzW29yaWdpbmFsSW5zdGFuY2VLZXldID0gbmV3IE9yaWdpbmFsQ2xhc3MoYVswXSwgYVsxXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgdGhpc1tvcmlnaW5hbEluc3RhbmNlS2V5XSA9IG5ldyBPcmlnaW5hbENsYXNzKGFbMF0sIGFbMV0sIGFbMl0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgIHRoaXNbb3JpZ2luYWxJbnN0YW5jZUtleV0gPSBuZXcgT3JpZ2luYWxDbGFzcyhhWzBdLCBhWzFdLCBhWzJdLCBhWzNdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcmcgbGlzdCB0b28gbG9uZy4nKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IE9yaWdpbmFsQ2xhc3MoZnVuY3Rpb24gKCkgeyB9KTtcbiAgICB2YXIgcHJvcDtcbiAgICBmb3IgKHByb3AgaW4gaW5zdGFuY2UpIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9idWdzLndlYmtpdC5vcmcvc2hvd19idWcuY2dpP2lkPTQ0NzIxXG4gICAgICAgIGlmIChjbGFzc05hbWUgPT09ICdYTUxIdHRwUmVxdWVzdCcgJiYgcHJvcCA9PT0gJ3Jlc3BvbnNlQmxvYicpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGluc3RhbmNlW3Byb3BdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgX2dsb2JhbCQxW2NsYXNzTmFtZV0ucHJvdG90eXBlW3Byb3BdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tvcmlnaW5hbEluc3RhbmNlS2V5XVtwcm9wXS5hcHBseSh0aGlzW29yaWdpbmFsSW5zdGFuY2VLZXldLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoX2dsb2JhbCQxW2NsYXNzTmFtZV0ucHJvdG90eXBlLCBwcm9wLCB7XG4gICAgICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpc1tvcmlnaW5hbEluc3RhbmNlS2V5XVtwcm9wXSA9IFpvbmUuY3VycmVudC53cmFwKGZuLCBjbGFzc05hbWUgKyAnLicgKyBwcm9wKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXNbb3JpZ2luYWxJbnN0YW5jZUtleV1bcHJvcF0gPSBmbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tvcmlnaW5hbEluc3RhbmNlS2V5XVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KHByb3ApKTtcbiAgICB9XG4gICAgZm9yIChwcm9wIGluIE9yaWdpbmFsQ2xhc3MpIHtcbiAgICAgICAgaWYgKHByb3AgIT09ICdwcm90b3R5cGUnICYmIE9yaWdpbmFsQ2xhc3MuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgIF9nbG9iYWwkMVtjbGFzc05hbWVdW3Byb3BdID0gT3JpZ2luYWxDbGFzc1twcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlTmFtZWRGbihuYW1lLCBkZWxlZ2F0ZSkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiAoRnVuY3Rpb24oJ2YnLCBcInJldHVybiBmdW5jdGlvbiBcIiArIG5hbWUgKyBcIigpe3JldHVybiBmKHRoaXMsIGFyZ3VtZW50cyl9XCIpKShkZWxlZ2F0ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGlmIHdlIGZhaWwsIHdlIG11c3QgYmUgQ1NQLCBqdXN0IHJldHVybiBkZWxlZ2F0ZS5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cbn1cbmZ1bmN0aW9uIHBhdGNoTWV0aG9kKHRhcmdldCwgbmFtZSwgcGF0Y2hGbikge1xuICAgIHZhciBwcm90byA9IHRhcmdldDtcbiAgICB3aGlsZSAocHJvdG8gJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgICB9XG4gICAgaWYgKCFwcm90byAmJiB0YXJnZXRbbmFtZV0pIHtcbiAgICAgICAgLy8gc29tZWhvdyB3ZSBkaWQgbm90IGZpbmQgaXQsIGJ1dCB3ZSBjYW4gc2VlIGl0LiBUaGlzIGhhcHBlbnMgb24gSUUgZm9yIFdpbmRvdyBwcm9wZXJ0aWVzLlxuICAgICAgICBwcm90byA9IHRhcmdldDtcbiAgICB9XG4gICAgdmFyIGRlbGVnYXRlTmFtZSA9IHpvbmVTeW1ib2wobmFtZSk7XG4gICAgdmFyIGRlbGVnYXRlO1xuICAgIGlmIChwcm90byAmJiAhKGRlbGVnYXRlID0gcHJvdG9bZGVsZWdhdGVOYW1lXSkpIHtcbiAgICAgICAgZGVsZWdhdGUgPSBwcm90b1tkZWxlZ2F0ZU5hbWVdID0gcHJvdG9bbmFtZV07XG4gICAgICAgIHByb3RvW25hbWVdID0gY3JlYXRlTmFtZWRGbihuYW1lLCBwYXRjaEZuKGRlbGVnYXRlLCBkZWxlZ2F0ZU5hbWUsIG5hbWUpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlbGVnYXRlO1xufVxuLy8gVE9ETzogc3VwcG9ydCBjYW5jZWwgdGFzayBsYXRlciBpZiBuZWNlc3NhcnlcblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuZnVuY3Rpb24gcGF0Y2hUaW1lcih3aW5kb3csIHNldE5hbWUsIGNhbmNlbE5hbWUsIG5hbWVTdWZmaXgpIHtcbiAgICB2YXIgc2V0TmF0aXZlID0gbnVsbDtcbiAgICB2YXIgY2xlYXJOYXRpdmUgPSBudWxsO1xuICAgIHNldE5hbWUgKz0gbmFtZVN1ZmZpeDtcbiAgICBjYW5jZWxOYW1lICs9IG5hbWVTdWZmaXg7XG4gICAgdmFyIHRhc2tzQnlIYW5kbGVJZCA9IHt9O1xuICAgIGZ1bmN0aW9uIHNjaGVkdWxlVGFzayh0YXNrKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGFzay5kYXRhO1xuICAgICAgICBkYXRhLmFyZ3NbMF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0YXNrLmludm9rZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZGVsZXRlIHRhc2tzQnlIYW5kbGVJZFtkYXRhLmhhbmRsZUlkXTtcbiAgICAgICAgfTtcbiAgICAgICAgZGF0YS5oYW5kbGVJZCA9IHNldE5hdGl2ZS5hcHBseSh3aW5kb3csIGRhdGEuYXJncyk7XG4gICAgICAgIHRhc2tzQnlIYW5kbGVJZFtkYXRhLmhhbmRsZUlkXSA9IHRhc2s7XG4gICAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbGVhclRhc2sodGFzaykge1xuICAgICAgICBkZWxldGUgdGFza3NCeUhhbmRsZUlkW3Rhc2suZGF0YS5oYW5kbGVJZF07XG4gICAgICAgIHJldHVybiBjbGVhck5hdGl2ZSh0YXNrLmRhdGEuaGFuZGxlSWQpO1xuICAgIH1cbiAgICBzZXROYXRpdmUgPVxuICAgICAgICBwYXRjaE1ldGhvZCh3aW5kb3csIHNldE5hbWUsIGZ1bmN0aW9uIChkZWxlZ2F0ZSkgeyByZXR1cm4gZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHZhciB6b25lID0gWm9uZS5jdXJyZW50O1xuICAgICAgICAgICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgICAgICAgICBoYW5kbGVJZDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXNQZXJpb2RpYzogbmFtZVN1ZmZpeCA9PT0gJ0ludGVydmFsJyxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IChuYW1lU3VmZml4ID09PSAnVGltZW91dCcgfHwgbmFtZVN1ZmZpeCA9PT0gJ0ludGVydmFsJykgPyBhcmdzWzFdIHx8IDAgOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB2YXIgdGFzayA9IHpvbmUuc2NoZWR1bGVNYWNyb1Rhc2soc2V0TmFtZSwgYXJnc1swXSwgb3B0aW9ucywgc2NoZWR1bGVUYXNrLCBjbGVhclRhc2spO1xuICAgICAgICAgICAgICAgIGlmICghdGFzaykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFzaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gTm9kZS5qcyBtdXN0IGFkZGl0aW9uYWxseSBzdXBwb3J0IHRoZSByZWYgYW5kIHVucmVmIGZ1bmN0aW9ucy5cbiAgICAgICAgICAgICAgICB2YXIgaGFuZGxlID0gdGFzay5kYXRhLmhhbmRsZUlkO1xuICAgICAgICAgICAgICAgIGlmIChoYW5kbGUucmVmICYmIGhhbmRsZS51bnJlZikge1xuICAgICAgICAgICAgICAgICAgICB0YXNrLnJlZiA9IGhhbmRsZS5yZWYuYmluZChoYW5kbGUpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrLnVucmVmID0gaGFuZGxlLnVucmVmLmJpbmQoaGFuZGxlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhc2s7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBjYXVzZSBhbiBlcnJvciBieSBjYWxsaW5nIGl0IGRpcmVjdGx5LlxuICAgICAgICAgICAgICAgIHJldHVybiBkZWxlZ2F0ZS5hcHBseSh3aW5kb3csIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyB9KTtcbiAgICBjbGVhck5hdGl2ZSA9XG4gICAgICAgIHBhdGNoTWV0aG9kKHdpbmRvdywgY2FuY2VsTmFtZSwgZnVuY3Rpb24gKGRlbGVnYXRlKSB7IHJldHVybiBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICAgICAgdmFyIHRhc2sgPSB0eXBlb2YgYXJnc1swXSA9PT0gJ251bWJlcicgPyB0YXNrc0J5SGFuZGxlSWRbYXJnc1swXV0gOiBhcmdzWzBdO1xuICAgICAgICAgICAgaWYgKHRhc2sgJiYgdHlwZW9mIHRhc2sudHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAodGFzay5jYW5jZWxGbiAmJiB0YXNrLmRhdGEuaXNQZXJpb2RpYyB8fCB0YXNrLnJ1bkNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIERvIG5vdCBjYW5jZWwgYWxyZWFkeSBjYW5jZWxlZCBmdW5jdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgdGFzay56b25lLmNhbmNlbFRhc2sodGFzayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gY2F1c2UgYW4gZXJyb3IgYnkgY2FsbGluZyBpdCBkaXJlY3RseS5cbiAgICAgICAgICAgICAgICBkZWxlZ2F0ZS5hcHBseSh3aW5kb3csIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9OyB9KTtcbn1cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLypcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGZvciBDaHJvbWUgYW5kIENocm9tZSBtb2JpbGUsIHRvIGVuYWJsZVxuICogdGhpbmdzIGxpa2UgcmVkZWZpbmluZyBgY3JlYXRlZENhbGxiYWNrYCBvbiBhbiBlbGVtZW50LlxuICovXG52YXIgX2RlZmluZVByb3BlcnR5ID0gT2JqZWN0W3pvbmVTeW1ib2woJ2RlZmluZVByb3BlcnR5JyldID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3Rbem9uZVN5bWJvbCgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJyldID1cbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xudmFyIF9jcmVhdGUgPSBPYmplY3QuY3JlYXRlO1xudmFyIHVuY29uZmlndXJhYmxlc0tleSA9IHpvbmVTeW1ib2woJ3VuY29uZmlndXJhYmxlcycpO1xuZnVuY3Rpb24gcHJvcGVydHlQYXRjaCgpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBkZXNjKSB7XG4gICAgICAgIGlmIChpc1VuY29uZmlndXJhYmxlKG9iaiwgcHJvcCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBhc3NpZ24gdG8gcmVhZCBvbmx5IHByb3BlcnR5IFxcJycgKyBwcm9wICsgJ1xcJyBvZiAnICsgb2JqKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgb3JpZ2luYWxDb25maWd1cmFibGVGbGFnID0gZGVzYy5jb25maWd1cmFibGU7XG4gICAgICAgIGlmIChwcm9wICE9PSAncHJvdG90eXBlJykge1xuICAgICAgICAgICAgZGVzYyA9IHJld3JpdGVEZXNjcmlwdG9yKG9iaiwgcHJvcCwgZGVzYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF90cnlEZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIGRlc2MsIG9yaWdpbmFsQ29uZmlndXJhYmxlRmxhZyk7XG4gICAgfTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvYmosIHByb3BzKSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHByb3BzKS5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBwcm9wc1twcm9wXSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gICAgT2JqZWN0LmNyZWF0ZSA9IGZ1bmN0aW9uIChvYmosIHByb3RvKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdG8gPT09ICdvYmplY3QnICYmICFPYmplY3QuaXNGcm96ZW4ocHJvdG8pKSB7XG4gICAgICAgICAgICBPYmplY3Qua2V5cyhwcm90bykuZm9yRWFjaChmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICAgICAgICAgIHByb3RvW3Byb3BdID0gcmV3cml0ZURlc2NyaXB0b3Iob2JqLCBwcm9wLCBwcm90b1twcm9wXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX2NyZWF0ZShvYmosIHByb3RvKTtcbiAgICB9O1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAob2JqLCBwcm9wKSB7XG4gICAgICAgIHZhciBkZXNjID0gX2dldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHByb3ApO1xuICAgICAgICBpZiAoaXNVbmNvbmZpZ3VyYWJsZShvYmosIHByb3ApKSB7XG4gICAgICAgICAgICBkZXNjLmNvbmZpZ3VyYWJsZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXNjO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIF9yZWRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVzYykge1xuICAgIHZhciBvcmlnaW5hbENvbmZpZ3VyYWJsZUZsYWcgPSBkZXNjLmNvbmZpZ3VyYWJsZTtcbiAgICBkZXNjID0gcmV3cml0ZURlc2NyaXB0b3Iob2JqLCBwcm9wLCBkZXNjKTtcbiAgICByZXR1cm4gX3RyeURlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVzYywgb3JpZ2luYWxDb25maWd1cmFibGVGbGFnKTtcbn1cblxuZnVuY3Rpb24gaXNVbmNvbmZpZ3VyYWJsZShvYmosIHByb3ApIHtcbiAgICByZXR1cm4gb2JqICYmIG9ialt1bmNvbmZpZ3VyYWJsZXNLZXldICYmIG9ialt1bmNvbmZpZ3VyYWJsZXNLZXldW3Byb3BdO1xufVxuZnVuY3Rpb24gcmV3cml0ZURlc2NyaXB0b3Iob2JqLCBwcm9wLCBkZXNjKSB7XG4gICAgZGVzYy5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgIGlmICghZGVzYy5jb25maWd1cmFibGUpIHtcbiAgICAgICAgaWYgKCFvYmpbdW5jb25maWd1cmFibGVzS2V5XSkge1xuICAgICAgICAgICAgX2RlZmluZVByb3BlcnR5KG9iaiwgdW5jb25maWd1cmFibGVzS2V5LCB7IHdyaXRhYmxlOiB0cnVlLCB2YWx1ZToge30gfSk7XG4gICAgICAgIH1cbiAgICAgICAgb2JqW3VuY29uZmlndXJhYmxlc0tleV1bcHJvcF0gPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZGVzYztcbn1cbmZ1bmN0aW9uIF90cnlEZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIGRlc2MsIG9yaWdpbmFsQ29uZmlndXJhYmxlRmxhZykge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBfZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBkZXNjKTtcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgaWYgKGRlc2MuY29uZmlndXJhYmxlKSB7XG4gICAgICAgICAgICAvLyBJbiBjYXNlIG9mIGVycm9ycywgd2hlbiB0aGUgY29uZmlndXJhYmxlIGZsYWcgd2FzIGxpa2VseSBzZXQgYnkgcmV3cml0ZURlc2NyaXB0b3IoKSwgbGV0J3NcbiAgICAgICAgICAgIC8vIHJldHJ5IHdpdGggdGhlIG9yaWdpbmFsIGZsYWcgdmFsdWVcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3JpZ2luYWxDb25maWd1cmFibGVGbGFnID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGRlc2MuY29uZmlndXJhYmxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzYy5jb25maWd1cmFibGUgPSBvcmlnaW5hbENvbmZpZ3VyYWJsZUZsYWc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfZGVmaW5lUHJvcGVydHkob2JqLCBwcm9wLCBkZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlc2NKc29uID0gbnVsbDtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjSnNvbiA9IEpTT04uc3RyaW5naWZ5KGRlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBkZXNjSnNvbiA9IGRlc2NKc29uLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyB0byBjb25maWd1cmUgJ1wiICsgcHJvcCArIFwiJyB3aXRoIGRlc2NyaXB0b3IgJ1wiICsgZGVzY0pzb24gKyBcIicgb24gb2JqZWN0ICdcIiArIG9iaiArIFwiJyBhbmQgZ290IGVycm9yLCBnaXZpbmcgdXA6IFwiICsgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG52YXIgV1RGX0lTU1VFXzU1NSA9ICdBbmNob3IsQXJlYSxBdWRpbyxCUixCYXNlLEJhc2VGb250LEJvZHksQnV0dG9uLENhbnZhcyxDb250ZW50LERMaXN0LERpcmVjdG9yeSxEaXYsRW1iZWQsRmllbGRTZXQsRm9udCxGb3JtLEZyYW1lLEZyYW1lU2V0LEhSLEhlYWQsSGVhZGluZyxIdG1sLElGcmFtZSxJbWFnZSxJbnB1dCxLZXlnZW4sTEksTGFiZWwsTGVnZW5kLExpbmssTWFwLE1hcnF1ZWUsTWVkaWEsTWVudSxNZXRhLE1ldGVyLE1vZCxPTGlzdCxPYmplY3QsT3B0R3JvdXAsT3B0aW9uLE91dHB1dCxQYXJhZ3JhcGgsUHJlLFByb2dyZXNzLFF1b3RlLFNjcmlwdCxTZWxlY3QsU291cmNlLFNwYW4sU3R5bGUsVGFibGVDYXB0aW9uLFRhYmxlQ2VsbCxUYWJsZUNvbCxUYWJsZSxUYWJsZVJvdyxUYWJsZVNlY3Rpb24sVGV4dEFyZWEsVGl0bGUsVHJhY2ssVUxpc3QsVW5rbm93bixWaWRlbyc7XG52YXIgTk9fRVZFTlRfVEFSR0VUID0gJ0FwcGxpY2F0aW9uQ2FjaGUsRXZlbnRTb3VyY2UsRmlsZVJlYWRlcixJbnB1dE1ldGhvZENvbnRleHQsTWVkaWFDb250cm9sbGVyLE1lc3NhZ2VQb3J0LE5vZGUsUGVyZm9ybWFuY2UsU1ZHRWxlbWVudEluc3RhbmNlLFNoYXJlZFdvcmtlcixUZXh0VHJhY2ssVGV4dFRyYWNrQ3VlLFRleHRUcmFja0xpc3QsV2ViS2l0TmFtZWRGbG93LFdpbmRvdyxXb3JrZXIsV29ya2VyR2xvYmFsU2NvcGUsWE1MSHR0cFJlcXVlc3QsWE1MSHR0cFJlcXVlc3RFdmVudFRhcmdldCxYTUxIdHRwUmVxdWVzdFVwbG9hZCxJREJSZXF1ZXN0LElEQk9wZW5EQlJlcXVlc3QsSURCRGF0YWJhc2UsSURCVHJhbnNhY3Rpb24sSURCQ3Vyc29yLERCSW5kZXgsV2ViU29ja2V0J1xuICAgIC5zcGxpdCgnLCcpO1xudmFyIEVWRU5UX1RBUkdFVCA9ICdFdmVudFRhcmdldCc7XG5mdW5jdGlvbiBldmVudFRhcmdldFBhdGNoKF9nbG9iYWwpIHtcbiAgICB2YXIgYXBpcyA9IFtdO1xuICAgIHZhciBpc1d0ZiA9IF9nbG9iYWxbJ3d0ZiddO1xuICAgIGlmIChpc1d0Zikge1xuICAgICAgICAvLyBXb3JrYXJvdW5kIGZvcjogaHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS90cmFjaW5nLWZyYW1ld29yay9pc3N1ZXMvNTU1XG4gICAgICAgIGFwaXMgPSBXVEZfSVNTVUVfNTU1LnNwbGl0KCcsJykubWFwKGZ1bmN0aW9uICh2KSB7IHJldHVybiAnSFRNTCcgKyB2ICsgJ0VsZW1lbnQnOyB9KS5jb25jYXQoTk9fRVZFTlRfVEFSR0VUKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoX2dsb2JhbFtFVkVOVF9UQVJHRVRdKSB7XG4gICAgICAgIGFwaXMucHVzaChFVkVOVF9UQVJHRVQpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gTm90ZTogRXZlbnRUYXJnZXQgaXMgbm90IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnMsXG4gICAgICAgIC8vIGlmIGl0J3Mgbm90IGF2YWlsYWJsZSwgd2UgaW5zdGVhZCBwYXRjaCB0aGUgQVBJcyBpbiB0aGUgSURMIHRoYXQgaW5oZXJpdCBmcm9tIEV2ZW50VGFyZ2V0XG4gICAgICAgIGFwaXMgPSBOT19FVkVOVF9UQVJHRVQ7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXBpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdHlwZSA9IF9nbG9iYWxbYXBpc1tpXV07XG4gICAgICAgIHBhdGNoRXZlbnRUYXJnZXRNZXRob2RzKHR5cGUgJiYgdHlwZS5wcm90b3R5cGUpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuLy8gd2UgaGF2ZSB0byBwYXRjaCB0aGUgaW5zdGFuY2Ugc2luY2UgdGhlIHByb3RvIGlzIG5vbi1jb25maWd1cmFibGVcbmZ1bmN0aW9uIGFwcGx5KF9nbG9iYWwpIHtcbiAgICB2YXIgV1MgPSBfZ2xvYmFsLldlYlNvY2tldDtcbiAgICAvLyBPbiBTYWZhcmkgd2luZG93LkV2ZW50VGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgc28gbmVlZCB0byBwYXRjaCBXUyBhZGQvcmVtb3ZlRXZlbnRMaXN0ZW5lclxuICAgIC8vIE9uIG9sZGVyIENocm9tZSwgbm8gbmVlZCBzaW5jZSBFdmVudFRhcmdldCB3YXMgYWxyZWFkeSBwYXRjaGVkXG4gICAgaWYgKCFfZ2xvYmFsLkV2ZW50VGFyZ2V0KSB7XG4gICAgICAgIHBhdGNoRXZlbnRUYXJnZXRNZXRob2RzKFdTLnByb3RvdHlwZSk7XG4gICAgfVxuICAgIF9nbG9iYWwuV2ViU29ja2V0ID0gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgdmFyIHNvY2tldCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxID8gbmV3IFdTKGEsIGIpIDogbmV3IFdTKGEpO1xuICAgICAgICB2YXIgcHJveHlTb2NrZXQ7XG4gICAgICAgIC8vIFNhZmFyaSA3LjAgaGFzIG5vbi1jb25maWd1cmFibGUgb3duICdvbm1lc3NhZ2UnIGFuZCBmcmllbmRzIHByb3BlcnRpZXMgb24gdGhlIHNvY2tldCBpbnN0YW5jZVxuICAgICAgICB2YXIgb25tZXNzYWdlRGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ioc29ja2V0LCAnb25tZXNzYWdlJyk7XG4gICAgICAgIGlmIChvbm1lc3NhZ2VEZXNjICYmIG9ubWVzc2FnZURlc2MuY29uZmlndXJhYmxlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcHJveHlTb2NrZXQgPSBPYmplY3QuY3JlYXRlKHNvY2tldCk7XG4gICAgICAgICAgICBbJ2FkZEV2ZW50TGlzdGVuZXInLCAncmVtb3ZlRXZlbnRMaXN0ZW5lcicsICdzZW5kJywgJ2Nsb3NlJ10uZm9yRWFjaChmdW5jdGlvbiAocHJvcE5hbWUpIHtcbiAgICAgICAgICAgICAgICBwcm94eVNvY2tldFtwcm9wTmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzb2NrZXRbcHJvcE5hbWVdLmFwcGx5KHNvY2tldCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB3ZSBjYW4gcGF0Y2ggdGhlIHJlYWwgc29ja2V0XG4gICAgICAgICAgICBwcm94eVNvY2tldCA9IHNvY2tldDtcbiAgICAgICAgfVxuICAgICAgICBwYXRjaE9uUHJvcGVydGllcyhwcm94eVNvY2tldCwgWydjbG9zZScsICdlcnJvcicsICdtZXNzYWdlJywgJ29wZW4nXSk7XG4gICAgICAgIHJldHVybiBwcm94eVNvY2tldDtcbiAgICB9O1xuICAgIGZvciAodmFyIHByb3AgaW4gV1MpIHtcbiAgICAgICAgX2dsb2JhbC5XZWJTb2NrZXRbcHJvcF0gPSBXU1twcm9wXTtcbiAgICB9XG59XG5cbi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cbnZhciBldmVudE5hbWVzID0gJ2NvcHkgY3V0IHBhc3RlIGFib3J0IGJsdXIgZm9jdXMgY2FucGxheSBjYW5wbGF5dGhyb3VnaCBjaGFuZ2UgY2xpY2sgY29udGV4dG1lbnUgZGJsY2xpY2sgZHJhZyBkcmFnZW5kIGRyYWdlbnRlciBkcmFnbGVhdmUgZHJhZ292ZXIgZHJhZ3N0YXJ0IGRyb3AgZHVyYXRpb25jaGFuZ2UgZW1wdGllZCBlbmRlZCBpbnB1dCBpbnZhbGlkIGtleWRvd24ga2V5cHJlc3Mga2V5dXAgbG9hZCBsb2FkZWRkYXRhIGxvYWRlZG1ldGFkYXRhIGxvYWRzdGFydCBtZXNzYWdlIG1vdXNlZG93biBtb3VzZWVudGVyIG1vdXNlbGVhdmUgbW91c2Vtb3ZlIG1vdXNlb3V0IG1vdXNlb3ZlciBtb3VzZXVwIHBhdXNlIHBsYXkgcGxheWluZyBwcm9ncmVzcyByYXRlY2hhbmdlIHJlc2V0IHNjcm9sbCBzZWVrZWQgc2Vla2luZyBzZWxlY3Qgc2hvdyBzdGFsbGVkIHN1Ym1pdCBzdXNwZW5kIHRpbWV1cGRhdGUgdm9sdW1lY2hhbmdlIHdhaXRpbmcgbW96ZnVsbHNjcmVlbmNoYW5nZSBtb3pmdWxsc2NyZWVuZXJyb3IgbW96cG9pbnRlcmxvY2tjaGFuZ2UgbW96cG9pbnRlcmxvY2tlcnJvciBlcnJvciB3ZWJnbGNvbnRleHRyZXN0b3JlZCB3ZWJnbGNvbnRleHRsb3N0IHdlYmdsY29udGV4dGNyZWF0aW9uZXJyb3InXG4gICAgLnNwbGl0KCcgJyk7XG5mdW5jdGlvbiBwcm9wZXJ0eURlc2NyaXB0b3JQYXRjaChfZ2xvYmFsKSB7XG4gICAgaWYgKGlzTm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBzdXBwb3J0c1dlYlNvY2tldCA9IHR5cGVvZiBXZWJTb2NrZXQgIT09ICd1bmRlZmluZWQnO1xuICAgIGlmIChjYW5QYXRjaFZpYVByb3BlcnR5RGVzY3JpcHRvcigpKSB7XG4gICAgICAgIC8vIGZvciBicm93c2VycyB0aGF0IHdlIGNhbiBwYXRjaCB0aGUgZGVzY3JpcHRvcjogIENocm9tZSAmIEZpcmVmb3hcbiAgICAgICAgaWYgKGlzQnJvd3Nlcikge1xuICAgICAgICAgICAgcGF0Y2hPblByb3BlcnRpZXMoSFRNTEVsZW1lbnQucHJvdG90eXBlLCBldmVudE5hbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBwYXRjaE9uUHJvcGVydGllcyhYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUsIG51bGwpO1xuICAgICAgICBpZiAodHlwZW9mIElEQkluZGV4ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgcGF0Y2hPblByb3BlcnRpZXMoSURCSW5kZXgucHJvdG90eXBlLCBudWxsKTtcbiAgICAgICAgICAgIHBhdGNoT25Qcm9wZXJ0aWVzKElEQlJlcXVlc3QucHJvdG90eXBlLCBudWxsKTtcbiAgICAgICAgICAgIHBhdGNoT25Qcm9wZXJ0aWVzKElEQk9wZW5EQlJlcXVlc3QucHJvdG90eXBlLCBudWxsKTtcbiAgICAgICAgICAgIHBhdGNoT25Qcm9wZXJ0aWVzKElEQkRhdGFiYXNlLnByb3RvdHlwZSwgbnVsbCk7XG4gICAgICAgICAgICBwYXRjaE9uUHJvcGVydGllcyhJREJUcmFuc2FjdGlvbi5wcm90b3R5cGUsIG51bGwpO1xuICAgICAgICAgICAgcGF0Y2hPblByb3BlcnRpZXMoSURCQ3Vyc29yLnByb3RvdHlwZSwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN1cHBvcnRzV2ViU29ja2V0KSB7XG4gICAgICAgICAgICBwYXRjaE9uUHJvcGVydGllcyhXZWJTb2NrZXQucHJvdG90eXBlLCBudWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLy8gU2FmYXJpLCBBbmRyb2lkIGJyb3dzZXJzIChKZWxseSBCZWFuKVxuICAgICAgICBwYXRjaFZpYUNhcHR1cmluZ0FsbFRoZUV2ZW50cygpO1xuICAgICAgICBwYXRjaENsYXNzKCdYTUxIdHRwUmVxdWVzdCcpO1xuICAgICAgICBpZiAoc3VwcG9ydHNXZWJTb2NrZXQpIHtcbiAgICAgICAgICAgIGFwcGx5KF9nbG9iYWwpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gY2FuUGF0Y2hWaWFQcm9wZXJ0eURlc2NyaXB0b3IoKSB7XG4gICAgaWYgKGlzQnJvd3NlciAmJiAhT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihIVE1MRWxlbWVudC5wcm90b3R5cGUsICdvbmNsaWNrJykgJiZcbiAgICAgICAgdHlwZW9mIEVsZW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIFdlYktpdCBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM0MzY0XG4gICAgICAgIC8vIElETCBpbnRlcmZhY2UgYXR0cmlidXRlcyBhcmUgbm90IGNvbmZpZ3VyYWJsZVxuICAgICAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRWxlbWVudC5wcm90b3R5cGUsICdvbmNsaWNrJyk7XG4gICAgICAgIGlmIChkZXNjICYmICFkZXNjLmNvbmZpZ3VyYWJsZSlcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHhockRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKFhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSwgJ29ucmVhZHlzdGF0ZWNoYW5nZScpO1xuICAgIC8vIGFkZCBlbnVtZXJhYmxlIGFuZCBjb25maWd1cmFibGUgaGVyZSBiZWNhdXNlIGluIG9wZXJhXG4gICAgLy8gYnkgZGVmYXVsdCBYTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUub25yZWFkeXN0YXRlY2hhbmdlIGlzIHVuZGVmaW5lZFxuICAgIC8vIHdpdGhvdXQgYWRkaW5nIGVudW1lcmFibGUgYW5kIGNvbmZpZ3VyYWJsZSB3aWxsIGNhdXNlIG9ucmVhZHlzdGF0ZWNoYW5nZVxuICAgIC8vIG5vbi1jb25maWd1cmFibGVcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLCAnb25yZWFkeXN0YXRlY2hhbmdlJywge1xuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgdmFyIHJlc3VsdCA9ICEhcmVxLm9ucmVhZHlzdGF0ZWNoYW5nZTtcbiAgICAvLyByZXN0b3JlIG9yaWdpbmFsIGRlc2NcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoWE1MSHR0cFJlcXVlc3QucHJvdG90eXBlLCAnb25yZWFkeXN0YXRlY2hhbmdlJywgeGhyRGVzYyB8fCB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxudmFyIHVuYm91bmRLZXkgPSB6b25lU3ltYm9sKCd1bmJvdW5kJyk7XG4vLyBXaGVuZXZlciBhbnkgZXZlbnRMaXN0ZW5lciBmaXJlcywgd2UgY2hlY2sgdGhlIGV2ZW50TGlzdGVuZXIgdGFyZ2V0IGFuZCBhbGwgcGFyZW50c1xuLy8gZm9yIGBvbndoYXRldmVyYCBwcm9wZXJ0aWVzIGFuZCByZXBsYWNlIHRoZW0gd2l0aCB6b25lLWJvdW5kIGZ1bmN0aW9uc1xuLy8gLSBDaHJvbWUgKGZvciBub3cpXG5mdW5jdGlvbiBwYXRjaFZpYUNhcHR1cmluZ0FsbFRoZUV2ZW50cygpIHtcbiAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0eSA9IGV2ZW50TmFtZXNbaV07XG4gICAgICAgIHZhciBvbnByb3BlcnR5ID0gJ29uJyArIHByb3BlcnR5O1xuICAgICAgICBzZWxmLmFkZEV2ZW50TGlzdGVuZXIocHJvcGVydHksIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIGVsdCA9IGV2ZW50LnRhcmdldCwgYm91bmQsIHNvdXJjZTtcbiAgICAgICAgICAgIGlmIChlbHQpIHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSBlbHQuY29uc3RydWN0b3JbJ25hbWUnXSArICcuJyArIG9ucHJvcGVydHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzb3VyY2UgPSAndW5rbm93bi4nICsgb25wcm9wZXJ0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHdoaWxlIChlbHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWx0W29ucHJvcGVydHldICYmICFlbHRbb25wcm9wZXJ0eV1bdW5ib3VuZEtleV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYm91bmQgPSBab25lLmN1cnJlbnQud3JhcChlbHRbb25wcm9wZXJ0eV0sIHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kW3VuYm91bmRLZXldID0gZWx0W29ucHJvcGVydHldO1xuICAgICAgICAgICAgICAgICAgICBlbHRbb25wcm9wZXJ0eV0gPSBib3VuZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWx0ID0gZWx0LnBhcmVudEVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuICAgIH07XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBldmVudE5hbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIF9sb29wXzEoaSk7XG4gICAgfVxuICAgIFxufVxuXG4vKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5mdW5jdGlvbiByZWdpc3RlckVsZW1lbnRQYXRjaChfZ2xvYmFsKSB7XG4gICAgaWYgKCFpc0Jyb3dzZXIgfHwgISgncmVnaXN0ZXJFbGVtZW50JyBpbiBfZ2xvYmFsLmRvY3VtZW50KSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBfcmVnaXN0ZXJFbGVtZW50ID0gZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50O1xuICAgIHZhciBjYWxsYmFja3MgPSBbJ2NyZWF0ZWRDYWxsYmFjaycsICdhdHRhY2hlZENhbGxiYWNrJywgJ2RldGFjaGVkQ2FsbGJhY2snLCAnYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrJ107XG4gICAgZG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50ID0gZnVuY3Rpb24gKG5hbWUsIG9wdHMpIHtcbiAgICAgICAgaWYgKG9wdHMgJiYgb3B0cy5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5mb3JFYWNoKGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHZhciBzb3VyY2UgPSAnRG9jdW1lbnQucmVnaXN0ZXJFbGVtZW50OjonICsgY2FsbGJhY2s7XG4gICAgICAgICAgICAgICAgaWYgKG9wdHMucHJvdG90eXBlLmhhc093blByb3BlcnR5KGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob3B0cy5wcm90b3R5cGUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvci52YWx1ZSA9IFpvbmUuY3VycmVudC53cmFwKGRlc2NyaXB0b3IudmFsdWUsIHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfcmVkZWZpbmVQcm9wZXJ0eShvcHRzLnByb3RvdHlwZSwgY2FsbGJhY2ssIGRlc2NyaXB0b3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0cy5wcm90b3R5cGVbY2FsbGJhY2tdID0gWm9uZS5jdXJyZW50LndyYXAob3B0cy5wcm90b3R5cGVbY2FsbGJhY2tdLCBzb3VyY2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKG9wdHMucHJvdG90eXBlW2NhbGxiYWNrXSkge1xuICAgICAgICAgICAgICAgICAgICBvcHRzLnByb3RvdHlwZVtjYWxsYmFja10gPSBab25lLmN1cnJlbnQud3JhcChvcHRzLnByb3RvdHlwZVtjYWxsYmFja10sIHNvdXJjZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZWdpc3RlckVsZW1lbnQuYXBwbHkoZG9jdW1lbnQsIFtuYW1lLCBvcHRzXSk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xudmFyIHNldCA9ICdzZXQnO1xudmFyIGNsZWFyID0gJ2NsZWFyJztcbnZhciBibG9ja2luZ01ldGhvZHMgPSBbJ2FsZXJ0JywgJ3Byb21wdCcsICdjb25maXJtJ107XG52YXIgX2dsb2JhbCA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHdpbmRvdyB8fCB0eXBlb2Ygc2VsZiA9PT0gJ29iamVjdCcgJiYgc2VsZiB8fCBnbG9iYWw7XG5wYXRjaFRpbWVyKF9nbG9iYWwsIHNldCwgY2xlYXIsICdUaW1lb3V0Jyk7XG5wYXRjaFRpbWVyKF9nbG9iYWwsIHNldCwgY2xlYXIsICdJbnRlcnZhbCcpO1xucGF0Y2hUaW1lcihfZ2xvYmFsLCBzZXQsIGNsZWFyLCAnSW1tZWRpYXRlJyk7XG5wYXRjaFRpbWVyKF9nbG9iYWwsICdyZXF1ZXN0JywgJ2NhbmNlbCcsICdBbmltYXRpb25GcmFtZScpO1xucGF0Y2hUaW1lcihfZ2xvYmFsLCAnbW96UmVxdWVzdCcsICdtb3pDYW5jZWwnLCAnQW5pbWF0aW9uRnJhbWUnKTtcbnBhdGNoVGltZXIoX2dsb2JhbCwgJ3dlYmtpdFJlcXVlc3QnLCAnd2Via2l0Q2FuY2VsJywgJ0FuaW1hdGlvbkZyYW1lJyk7XG5mb3IgKHZhciBpID0gMDsgaSA8IGJsb2NraW5nTWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBuYW1lXzEgPSBibG9ja2luZ01ldGhvZHNbaV07XG4gICAgcGF0Y2hNZXRob2QoX2dsb2JhbCwgbmFtZV8xLCBmdW5jdGlvbiAoZGVsZWdhdGUsIHN5bWJvbCwgbmFtZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHJldHVybiBab25lLmN1cnJlbnQucnVuKGRlbGVnYXRlLCBfZ2xvYmFsLCBhcmdzLCBuYW1lKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cbmV2ZW50VGFyZ2V0UGF0Y2goX2dsb2JhbCk7XG5wcm9wZXJ0eURlc2NyaXB0b3JQYXRjaChfZ2xvYmFsKTtcbnBhdGNoQ2xhc3MoJ011dGF0aW9uT2JzZXJ2ZXInKTtcbnBhdGNoQ2xhc3MoJ1dlYktpdE11dGF0aW9uT2JzZXJ2ZXInKTtcbnBhdGNoQ2xhc3MoJ0ZpbGVSZWFkZXInKTtcbnByb3BlcnR5UGF0Y2goKTtcbnJlZ2lzdGVyRWxlbWVudFBhdGNoKF9nbG9iYWwpO1xuLy8gVHJlYXQgWE1MSFRUUFJlcXVlc3QgYXMgYSBtYWNyb3Rhc2suXG5wYXRjaFhIUihfZ2xvYmFsKTtcbnZhciBYSFJfVEFTSyA9IHpvbmVTeW1ib2woJ3hoclRhc2snKTtcbnZhciBYSFJfU1lOQyA9IHpvbmVTeW1ib2woJ3hoclN5bmMnKTtcbnZhciBYSFJfTElTVEVORVIgPSB6b25lU3ltYm9sKCd4aHJMaXN0ZW5lcicpO1xudmFyIFhIUl9TQ0hFRFVMRUQgPSB6b25lU3ltYm9sKCd4aHJTY2hlZHVsZWQnKTtcbmZ1bmN0aW9uIHBhdGNoWEhSKHdpbmRvdykge1xuICAgIGZ1bmN0aW9uIGZpbmRQZW5kaW5nVGFzayh0YXJnZXQpIHtcbiAgICAgICAgdmFyIHBlbmRpbmdUYXNrID0gdGFyZ2V0W1hIUl9UQVNLXTtcbiAgICAgICAgcmV0dXJuIHBlbmRpbmdUYXNrO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzY2hlZHVsZVRhc2sodGFzaykge1xuICAgICAgICBzZWxmW1hIUl9TQ0hFRFVMRURdID0gZmFsc2U7XG4gICAgICAgIHZhciBkYXRhID0gdGFzay5kYXRhO1xuICAgICAgICAvLyByZW1vdmUgZXhpc3RpbmcgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gZGF0YS50YXJnZXRbWEhSX0xJU1RFTkVSXTtcbiAgICAgICAgaWYgKGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBkYXRhLnRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKCdyZWFkeXN0YXRlY2hhbmdlJywgbGlzdGVuZXIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuZXdMaXN0ZW5lciA9IGRhdGEudGFyZ2V0W1hIUl9MSVNURU5FUl0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS50YXJnZXQucmVhZHlTdGF0ZSA9PT0gZGF0YS50YXJnZXQuRE9ORSkge1xuICAgICAgICAgICAgICAgIGlmICghZGF0YS5hYm9ydGVkICYmIHNlbGZbWEhSX1NDSEVEVUxFRF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGFzay5pbnZva2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGRhdGEudGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3JlYWR5c3RhdGVjaGFuZ2UnLCBuZXdMaXN0ZW5lcik7XG4gICAgICAgIHZhciBzdG9yZWRUYXNrID0gZGF0YS50YXJnZXRbWEhSX1RBU0tdO1xuICAgICAgICBpZiAoIXN0b3JlZFRhc2spIHtcbiAgICAgICAgICAgIGRhdGEudGFyZ2V0W1hIUl9UQVNLXSA9IHRhc2s7XG4gICAgICAgIH1cbiAgICAgICAgc2VuZE5hdGl2ZS5hcHBseShkYXRhLnRhcmdldCwgZGF0YS5hcmdzKTtcbiAgICAgICAgc2VsZltYSFJfU0NIRURVTEVEXSA9IHRydWU7XG4gICAgICAgIHJldHVybiB0YXNrO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwbGFjZWhvbGRlckNhbGxiYWNrKCkgeyB9XG4gICAgZnVuY3Rpb24gY2xlYXJUYXNrKHRhc2spIHtcbiAgICAgICAgdmFyIGRhdGEgPSB0YXNrLmRhdGE7XG4gICAgICAgIC8vIE5vdGUgLSBpZGVhbGx5LCB3ZSB3b3VsZCBjYWxsIGRhdGEudGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIgaGVyZSwgYnV0IGl0J3MgdG9vIGxhdGVcbiAgICAgICAgLy8gdG8gcHJldmVudCBpdCBmcm9tIGZpcmluZy4gU28gaW5zdGVhZCwgd2Ugc3RvcmUgaW5mbyBmb3IgdGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgICBkYXRhLmFib3J0ZWQgPSB0cnVlO1xuICAgICAgICByZXR1cm4gYWJvcnROYXRpdmUuYXBwbHkoZGF0YS50YXJnZXQsIGRhdGEuYXJncyk7XG4gICAgfVxuICAgIHZhciBvcGVuTmF0aXZlID0gcGF0Y2hNZXRob2Qod2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSwgJ29wZW4nLCBmdW5jdGlvbiAoKSB7IHJldHVybiBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICBzZWxmW1hIUl9TWU5DXSA9IGFyZ3NbMl0gPT0gZmFsc2U7XG4gICAgICAgIHJldHVybiBvcGVuTmF0aXZlLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIH07IH0pO1xuICAgIHZhciBzZW5kTmF0aXZlID0gcGF0Y2hNZXRob2Qod2luZG93LlhNTEh0dHBSZXF1ZXN0LnByb3RvdHlwZSwgJ3NlbmQnLCBmdW5jdGlvbiAoKSB7IHJldHVybiBmdW5jdGlvbiAoc2VsZiwgYXJncykge1xuICAgICAgICB2YXIgem9uZSA9IFpvbmUuY3VycmVudDtcbiAgICAgICAgaWYgKHNlbGZbWEhSX1NZTkNdKSB7XG4gICAgICAgICAgICAvLyBpZiB0aGUgWEhSIGlzIHN5bmMgdGhlcmUgaXMgbm8gdGFzayB0byBzY2hlZHVsZSwganVzdCBleGVjdXRlIHRoZSBjb2RlLlxuICAgICAgICAgICAgcmV0dXJuIHNlbmROYXRpdmUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHsgdGFyZ2V0OiBzZWxmLCBpc1BlcmlvZGljOiBmYWxzZSwgZGVsYXk6IG51bGwsIGFyZ3M6IGFyZ3MsIGFib3J0ZWQ6IGZhbHNlIH07XG4gICAgICAgICAgICByZXR1cm4gem9uZS5zY2hlZHVsZU1hY3JvVGFzaygnWE1MSHR0cFJlcXVlc3Quc2VuZCcsIHBsYWNlaG9sZGVyQ2FsbGJhY2ssIG9wdGlvbnMsIHNjaGVkdWxlVGFzaywgY2xlYXJUYXNrKTtcbiAgICAgICAgfVxuICAgIH07IH0pO1xuICAgIHZhciBhYm9ydE5hdGl2ZSA9IHBhdGNoTWV0aG9kKHdpbmRvdy5YTUxIdHRwUmVxdWVzdC5wcm90b3R5cGUsICdhYm9ydCcsIGZ1bmN0aW9uIChkZWxlZ2F0ZSkgeyByZXR1cm4gZnVuY3Rpb24gKHNlbGYsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHRhc2sgPSBmaW5kUGVuZGluZ1Rhc2soc2VsZik7XG4gICAgICAgIGlmICh0YXNrICYmIHR5cGVvZiB0YXNrLnR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBYSFIgaGFzIGFscmVhZHkgY29tcGxldGVkLCBkbyBub3RoaW5nLlxuICAgICAgICAgICAgLy8gSWYgdGhlIFhIUiBoYXMgYWxyZWFkeSBiZWVuIGFib3J0ZWQsIGRvIG5vdGhpbmcuXG4gICAgICAgICAgICAvLyBGaXggIzU2OSwgY2FsbCBhYm9ydCBtdWx0aXBsZSB0aW1lcyBiZWZvcmUgZG9uZSB3aWxsIGNhdXNlXG4gICAgICAgICAgICAvLyBtYWNyb1Rhc2sgdGFzayBjb3VudCBiZSBuZWdhdGl2ZSBudW1iZXJcbiAgICAgICAgICAgIGlmICh0YXNrLmNhbmNlbEZuID09IG51bGwgfHwgKHRhc2suZGF0YSAmJiB0YXNrLmRhdGEuYWJvcnRlZCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrLnpvbmUuY2FuY2VsVGFzayh0YXNrKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPdGhlcndpc2UsIHdlIGFyZSB0cnlpbmcgdG8gYWJvcnQgYW4gWEhSIHdoaWNoIGhhcyBub3QgeWV0IGJlZW4gc2VudCwgc28gdGhlcmUgaXMgbm8gdGFza1xuICAgICAgICAvLyB0byBjYW5jZWwuIERvIG5vdGhpbmcuXG4gICAgfTsgfSk7XG59XG4vLy8gR0VPX0xPQ0FUSU9OXG5pZiAoX2dsb2JhbFsnbmF2aWdhdG9yJ10gJiYgX2dsb2JhbFsnbmF2aWdhdG9yJ10uZ2VvbG9jYXRpb24pIHtcbiAgICBwYXRjaFByb3RvdHlwZShfZ2xvYmFsWyduYXZpZ2F0b3InXS5nZW9sb2NhdGlvbiwgWydnZXRDdXJyZW50UG9zaXRpb24nLCAnd2F0Y2hQb3NpdGlvbiddKTtcbn1cblxuLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG59KSkpO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L3pvbmUuanMvZGlzdC96b25lLmpzXG4vLyBtb2R1bGUgaWQgPSAuL25vZGVfbW9kdWxlcy96b25lLmpzL2Rpc3Qvem9uZS5qc1xuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCIvKiB0c2xpbnQ6ZGlzYWJsZSAqL1xuaW1wb3J0ICdyZWZsZWN0LW1ldGFkYXRhL1JlZmxlY3QnO1xuaW1wb3J0ICd6b25lLmpzL2Rpc3Qvem9uZSc7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9+L3RzbGludC1sb2FkZXIhLi9zcmMvbWFpbi93ZWJhcHAvYXBwL3BvbHlmaWxscy50cyIsIm1vZHVsZS5leHBvcnRzID0gKF9fd2VicGFja19yZXF1aXJlX18oNSkpKDQ4KTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBkZWxlZ2F0ZWQgLi9ub2RlX21vZHVsZXMvd2VicGFjay9idWlsZGluL2dsb2JhbC5qcyBmcm9tIGRsbC1yZWZlcmVuY2UgdmVuZG9yXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJtb2R1bGUuZXhwb3J0cyA9IChfX3dlYnBhY2tfcmVxdWlyZV9fKDUpKSg2MDcpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGRlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMgZnJvbSBkbGwtcmVmZXJlbmNlIHZlbmRvclxuLy8gbW9kdWxlIGlkID0gMjBcbi8vIG1vZHVsZSBjaHVua3MgPSAxIiwibW9kdWxlLmV4cG9ydHMgPSB2ZW5kb3I7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJ2ZW5kb3JcIlxuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDEiLCJtb2R1bGUuZXhwb3J0cyA9IChfX3dlYnBhY2tfcmVxdWlyZV9fKDUpKSgyMzIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGRlbGVnYXRlZCAuL25vZGVfbW9kdWxlcy9jc3MtbG9hZGVyL2xpYi9jc3MtYmFzZS5qcyBmcm9tIGRsbC1yZWZlcmVuY2UgdmVuZG9yXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMSJdLCJzb3VyY2VSb290IjoiIn0=