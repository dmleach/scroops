/**
 * The base class for all objects
 */

class BaseClass {

    /**
     * The Scroops classes are envelopes around the classes provided by the
     * game. The game object around which the class is wrapped is stored
     * in the gameObject property.
     */
    constructor(gameObject) {
        this.incrementProfilerCount('BaseClass.constructor');

        this.gameObject = gameObject;
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

    /**
     * Returns the id of the game object wrapped inside this class
     */
    get id() {
        this.incrementProfilerCount('BaseClass.id');

        return this.gameObject.id;
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
     * Returns the name of the game object wrapped inside this class
     */
    get name() {
        this.incrementProfilerCount('BaseClass.name');

        return this.gameObject.name;
    }

    /**
     * Returns the position of the game object wrapped inside this class
     */
    get pos() {
        this.incrementProfilerCount('BaseClass.pos');

        return this.gameObject.pos;
    }

    get room() {
        this.incrementProfilerCount('BaseClass.room');

        return this.gameObject.room;
    }

    get roomName() {
        this.incrementProfilerCount('BaseClass.roomName');

        return this.gameObject.room.name;
    }
}

module.exports = BaseClass;
