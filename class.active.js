var BaseClass = require('class.base');

/**
 * ActiveClass is the ancestor for all classes that take an action based on
 * their environment. Creeps and towers are both examples of active classes
 */
class ActiveClass extends BaseClass {

    /**
     * The main method of an active class. It determines the activity that
     * should be taken and calls the appropriate activity method
     */
    act() {
        this.incrementProfilerCount('ActiveClass.act');

        this.doActivityMethod(this.activity);
    }

    /**
     * Calls the appropriate activity method for the given activity
     */
    doActivityMethod(activity) {
        this.incrementProfilerCount('ActiveClass.doActivityMethod');

        throw new Error('doActivityMethod method has not been defined for ' + this.name);
    }

    /**
     * Determines the activity that should be done
     */
    get activity() {
        this.incrementProfilerCount('ActiveClass.activity');

        throw new Error('activity method has not been defined for ' + this.name);
    }

}

module.exports = ActiveClass;
