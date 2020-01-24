for (let prop in Memory) {
    if (Object.prototype.hasOwnProperty.call(Memory, prop)) {
        Memory[prop] = undefined;
    }
}