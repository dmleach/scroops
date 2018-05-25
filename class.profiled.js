var BaseClass = require('class.base');

/**
 * ProfiledClass is the ancestor for all classes that can write code profiling
 * information to memory
 */
class ProfiledClass extends BaseClass {
    static activateProfiler() {
        this.setProfilerValue('isActive', true);
    }

    static deactivateProfiler() {
        this.setProfilerValue('isActive', false);
    }

    static getProfilerValue(label) {
        return super.readFromCache('Profiler.' + label);
    }

    incrementProfilerCount(label) {
        ProfiledClass.incrementProfilerValue(label);
    }

    static incrementProfilerCount(label) {
        this.incrementProfilerValue(label);
    }

    static get isProfilerActive() {
        return this.getProfilerValue('isActive') == true;
    }

    static incrementProfilerValue(label) {
        let value = this.getProfilerValue(label);

        if (value) {
            this.setProfilerValue(label, value + 1);
        } else {
            this.setProfilerValue(label, 1);
        }
    }

    static setProfilerValue(label, value) {
        if (!this.isProfilerActive) {
            return false;
        }

        super.writeToCache('Profiler.' + label, value);
    }
}

module.exports = ProfiledClass;
