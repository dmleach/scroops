class BaseClass {
    constructor(gameObject) {
        this.gameObject = gameObject;
    }

    static createById(id) {
        let gameObject = Game.getObjectById(id);

        if (!gameObject) {
            throw "Could not find object with id " + id;
        }

        return new BaseClass(gameObject);
    }

    get name() {
        return this.gameObject.name;
    }

    get pos() {
        if (this.gameObject instanceof RoomObject) {
            return this.gameObject.pos;
        }

        throw "Only room objects have a position value";
    }
}

module.exports = BaseClass;
