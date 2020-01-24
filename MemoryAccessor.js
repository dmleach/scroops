class MemoryAccessor {
    static internalGetFromMemory(baseObject, valueKey, defaultValue) {
        if (Array.isArray(valueKey) === false) {
            valueKey = [valueKey];
        }

        let memoryObject = (baseObject === undefined) ? Memory : baseObject;
        let memoryKey = valueKey.shift();
        let memoryValue = memoryObject[memoryKey];

        if (memoryValue === undefined) {
            return defaultValue;
        }

        if (valueKey.length === 0) {
            return memoryValue;
        }

        return this.internalGetFromMemory(memoryValue, valueKey, defaultValue);
    }

    static getFromMemory(key, defaultValue) {
        return this.internalGetFromMemory(Memory, key, defaultValue);
    }

    static internalPutIntoMemory(baseObject, valueKey, value) {
        if (Array.isArray(valueKey) === false) {
            valueKey = [valueKey];
        }

        let memoryObject = (baseObject === undefined) ? Memory : baseObject;
        let memoryKey = valueKey.shift();

        if (valueKey.length === 0) {
            memoryObject[memoryKey] = value;
            return value;
        }

        let memoryValue = memoryObject[memoryKey];

        if (memoryValue === undefined) {
            memoryValue = {};
            memoryObject[memoryKey] = memoryValue;
        }

        return this.internalPutIntoMemory(memoryValue, valueKey, value);
    }

    static putIntoMemory(key, value) {
        return this.internalPutIntoMemory(Memory, key, value);
    }
}

module.exports = MemoryAccessor;