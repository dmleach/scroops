var BaseClass = require('class.base');

/**
 * ProfiledClass is the ancestor for all classes that can write code profiling
 * information to memory
 */
class ProfiledClass extends BaseClass {
    static get PROFILER_MEMORY_KEY() { return 'Profiler'; }
    static get PROFILER_MEMORY_ACTIVE_KEY() { return 'isActive'; }

    static activate() {
        this.set(this.PROFILER_MEMORY_ACTIVE_KEY, true);
    }

    static deactivate() {
        this.set(this.PROFILER_MEMORY_ACTIVE_KEY, false);
    }

    static get(label) {
        if (!Memory[this.PROFILER_MEMORY_KEY]) {
            return undefined;
        }

        if (!Memory[this.PROFILER_MEMORY_KEY][label]) {
            return undefined;
        }

        return Memory[this.PROFILER_MEMORY_KEY][label];
    }

    incrementProfilerCount(label) {
        ProfiledClass.increment(this.PROFILER_MEMORY_KEY + '.' + label);
    }

    static incrementProfilerCount(label) {
        this.increment(this.PROFILER_MEMORY_KEY + '.' + label);
    }

    static get isActive() {
        return this.get(this.PROFILER_MEMORY_ACTIVE_KEY) == true;
    }

    static increment(label) {
        if (!this.isActive) {
            return false;
        }

        let value = this.get(label);

        if (value) {
            this.set(label, value + 1);
        } else {
            this.set(label, 1);
        }
    }

    static set(label, value) {
        if (!this.isActive) {
            return false;
        }

        if (!Memory[this.PROFILER_MEMORY_KEY]) {
            Memory[this.PROFILER_MEMORY_KEY] = {};
        }

        Memory[this.PROFILER_MEMORY_KEY][label] = value;
    }
}

module.exports = ProfiledClass;
