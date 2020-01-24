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

    get memoryKey() {
        return undefined;
    }

    putIntoMemory(key, value) {
        let memoryRoot = Memory[this.memoryKey];
        memoryRoot[key] = value;
    }
}

module.exports = MemoryAccessor;