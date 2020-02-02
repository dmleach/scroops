let ScroopsObjectClass = require('ScroopsObject');

class MemoryAccessor extends ScroopsObjectClass
{
    constructor() {
        super();

        if (this.memoryKey === undefined) {
            this.error("Memory accessor must define a memory key value");
            return;
        }

        if (Memory[this.memoryKey] === undefined) {
            Memory[this.memoryKey] = {};
        }
    }

    getFromMemory(key, defaultValue = undefined) {
        let memoryRoot = Memory[this.memoryKey];
        let cachedValue = memoryRoot[key];
        return (cachedValue === undefined) ? defaultValue : cachedValue;
    }

    getFromMemoryUsingArray(keyArray) {
        return this._getFromMemoryUsingArray(Memory, keyArray);
    }

    _getFromMemoryUsingArray(memoryObject, keyArray) {
        if (memoryObject === undefined) {
            return undefined;
        }

        if (!(keyArray instanceof Array)) {
            return undefined;
        }

        let firstKey = keyArray.shift();

        if (firstKey === undefined) {
            return undefined;
        }

        if (keyArray.length === 0) {
            return memoryObject[firstKey];
        }

        let memoryObjectProperty = memoryObject[firstKey];

        if (memoryObjectProperty === undefined) {
            return undefined;
        }

        this._getFromMemoryUsingArray(memoryObjectProperty, keyArray);
    }

    get isShowingDebugMessages() {
        return false;
    }

    get memoryKey() {
        return undefined;
    }

    putIntoMemory(key, value) {
        let memoryRoot = Memory[this.memoryKey];
        memoryRoot[key] = value;
    }

    putIntoMemoryUsingArray(keyArray, value) {
        return this._putIntoMemoryUsingObjectAndArray(Memory, keyArray, value);
    }

    _putIntoMemoryUsingObjectAndArray(memoryObject, keyArray, value) {
        if (memoryObject === undefined) {
            return undefined;
        }

        if (!(keyArray instanceof Array)) {
            return undefined;
        }

        let firstKey = keyArray.shift();

        if (firstKey === undefined) {
            return undefined;
        }

        if (keyArray.length === 0) {
            memoryObject[firstKey] = value;
            return;
        }

        let memoryObjectProperty = memoryObject[firstKey];

        if (memoryObjectProperty === undefined) {
            memoryObject[firstKey] = {};
        }

        this._putIntoMemoryUsingObjectAndArray(memoryObject[firstKey], keyArray, value);
    }
}

module.exports = MemoryAccessor;