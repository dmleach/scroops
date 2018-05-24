/**
 * The base class for all objects
 */

class BaseClass {

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

    
}

module.exports = BaseClass;
