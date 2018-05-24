class ProfilerHelper {

    static get PROFILER_MEMORY_KEY() { return 'Profiler'; }
    static get PROFILER_MEMORY_ACTIVE_KEY() { return 'isActive'; }

    static activate() {
        this.set(this.PROFILER_MEMORY_ACTIVE_KEY, true);
    }

    static deactivate() {
        this.set(this.PROFILER_MEMORY_ACTIVE_KEY, false);
    }

    static get isActive() {
        return this.get(this.PROFILER_MEMORY_ACTIVE_KEY) == true;
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

module.exports = ProfilerHelper;
