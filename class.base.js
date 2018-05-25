/**
 * The base class for all objects
 */

class BaseClass {

    /**
     * Converts a cache value label (like 'testing.1.2') into array of key
     * values (like ['testing'][1][2])
     */
    static cacheIndexByLabel(label) {
        this.incrementProfilerCount('BaseClass.cacheIndexByLabel');

        if (typeof label !== 'string') {
            throw new Error('Value given to cacheIndexByLabel must be of type string');
        }

        return label.split('.');
    }

    /**
     * Writes the given message to the console log if this object's id is in
     * the array of debug ids
     */
    debugLog(message) {
        this.incrementProfilerCount('BaseClass.debugLog');

        let debugIds = [];

        if (debugIds.indexOf(this.id) !== -1) {
            console.log('[' + this.name + '] ' + message);
        }
    }

    incrementProfilerCount(label) {
        if (!this.profiler) {
            let ProfilerClass = require('helper.profiler');
            this.profiler = ProfilerClass;
        }

        this.profiler.increment('BaseClass.incrementProfilerCount');
        this.profiler.increment(label);
    }

    static incrementProfilerCount(label) {
        let ProfilerClass = require('helper.profiler');
        ProfilerClass.increment('BaseClass.incrementProfilerCount (static)');
        ProfilerClass.increment(label);
    }

    /**
     * Returns a value from the cache. The label should be a period-delimited
     * string of memory indexes, starting at the root of Game.memory
     */
    static readFromCache(label) {
        this.incrementProfilerCount('BaseClass.readFromCache');

        let index = this.cacheIndexByLabel(label);
        let element = Memory;

        for (let idxIndex in index) {
            let properties = Object.getOwnPropertyNames(element);

            if (properties.indexOf(index[idxIndex]) !== -1) {
                element = element[index[idxIndex]];
            } else {
                return undefined;
            }
        }

        return element;
    }

    /**
     * Internal recursive function used to write values to the cache. Use
     * writeToCache instead of this function to write a value
     */
    static setCacheObjectValue(object, key, value) {
        if (key.length == 1) {
            object[key] = value;
        } else {
            let topIndex = key.shift();

            if (typeof object[topIndex] !== 'object') {
                object[topIndex] = {};
            }

            this.setCacheObjectValue(object[topIndex], key, value);
        }
    }

    /**
     * Writes a value to the cache. The label should be a period-delimited
     * string of memory indexes, starting at the root of Game.memory. The
     * value is the value to write. A value of undefined will effectively
     * delete the key from the cache
     */
    static writeToCache(label, value) {
        this.incrementProfilerCount('BaseClass.writeToCache');

        let index = this.cacheIndexByLabel(label);

        this.setCacheObjectValue(Memory, index, value);
    }

}

module.exports = BaseClass;
