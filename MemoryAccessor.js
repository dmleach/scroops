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
        let cachedValue;

        if (key instanceof Array) {
            if (key.length === 0) {
                return undefined;
            }

            let keyCopy = [];

            for (let keyValue of key) {
                keyCopy.push(keyValue);
            }

            if (keyCopy[0] !== this.memoryKey) {
                keyCopy.unshift(this.memoryKey);
            }

            // this.debug('Getting from memory at key ' + keyCopy);
            cachedValue = this._getFromMemoryUsingArray(Memory, keyCopy);
            // this.debug('Found at key: ' + cachedValue);
            return cachedValue;
        }

        let memoryRoot = Memory[this.memoryKey];
        cachedValue = memoryRoot[key];
        return (cachedValue === undefined) ? defaultValue : cachedValue;
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

        let memoryObjectProperty = memoryObject[firstKey];

        if (memoryObjectProperty === undefined) {
            return undefined;
        }

        if (keyArray.length === 0) {
            return memoryObjectProperty;
        }

        return this._getFromMemoryUsingArray(memoryObjectProperty, keyArray);
    }

    get isShowingDebugMessages() {
        return false;
    }

    get memoryKey() {
        return undefined;
    }

    putIntoMemory(key, value) {
        if (key instanceof Array) {
            if (key.length === 0) {
                return undefined;
            }

            let keyCopy = [];

            for (let keyValue of key) {
                keyCopy.push(keyValue);
            }

            if (keyCopy[0] !== this.memoryKey) {
                keyCopy.unshift(this.memoryKey);
            }

            this.debug('Putting into memory at key ' + keyCopy + ' value ' + value);
            return this._putIntoMemoryUsingObjectAndArray(Memory, keyCopy, value);
        }

        let memoryRoot = Memory[this.memoryKey];
        memoryRoot[key] = value;
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