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
        let Profiler = require('helper.profiler');
        Profiler.increment('ActiveClass.act');

        this.doActivityMethod(this.activity);
    }

    /**
     * Calls the appropriate activity method for the given activity
     */
    doActivityMethod(activity) {
        let Profiler = require('helper.doActivityMethod');
        Profiler.increment('ActiveClass.act');

        throw new Error('doActivityMethod method has not been defined for ' + this.name);
    }

    /**
     * Determines the activity that should be done
     */
    get activity() {
        let Profiler = require('helper.activity');
        Profiler.increment('ActiveClass.act');

        throw new Error('activity method has not been defined for ' + this.name);
    }

}

module.exports = ActiveClass;
