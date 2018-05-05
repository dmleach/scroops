class BaseClass {

    /**
     * The Scroops classes are envelopes around the classes provided by the
     * game. The game object around which the class is wrapped is stored
     * in the gameObject property.
     */
    constructor(gameObject) {
        this.gameObject = gameObject;
    }

    /**
     * Creates an instance of the base class wrapped around the game object
     * with the given id
     */
    static createById(id) {
        let gameObject = Game.getObjectById(id);

        if (!gameObject) {
            throw new Error "Could not find object with id " + id;
        }

        return new BaseClass(gameObject);
    }

    /**
     * Returns the name of the game object wrapped inside this class
     */
    get name() {
        return this.gameObject.name;
    }

    /**
     * Returns the position of the game object wrapped inside this class.
     * Throws an error if the game object does not have a position (i.e. it's
     * not a room object
     */
    get pos() {
        if (this.gameObject instanceof RoomObject) {
            return this.gameObject.pos;
        }

        throw new Error "Only room objects have a position value";
    }
}

module.exports = BaseClass;
