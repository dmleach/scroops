let MemoryAccessor = require('MemoryAccessor');

class WorkQueue extends MemoryAccessor
{
    static get WORK_QUEUE_CLASS_MEMORY_KEY() { return 'UtilityWorkQueue'; }
    static get WORK_QUEUE_MEMORY_KEY() { return [this.WORK_QUEUE_CLASS_MEMORY_KEY, 'queue']; }
    static get WORK_QUEUE_INDEX_LOW_KEY() { return [this.WORK_QUEUE_CLASS_MEMORY_KEY, 'indexLow']; }
    static get WORK_QUEUE_INDEX_HIGH_KEY() { return [this.WORK_QUEUE_CLASS_MEMORY_KEY, 'indexHigh']; }

    static get highIndex() { return this.getFromMemory(this.WORK_QUEUE_INDEX_HIGH_KEY); }
    static get lowIndex() { return this.getFromMemory(this.WORK_QUEUE_INDEX_LOW_KEY); }

    static push(work) {
        let newIndex = this.highIndex + 1;

        if (newIndex === undefined) {
            newIndex = 0;
            this.putIntoMemory(this.WORK_QUEUE_INDEX_LOW_KEY, 0);
        }

        this.putIntoMemory(this.WORK_QUEUE_INDEX_HIGH_KEY,newIndex);
        this.putIntoMemory(this.queueIndexKey(newIndex), work);
        return newIndex;
    }

    static queueIndexKey(index) { return [this.WORK_QUEUE_MEMORY_KEY, index]; }
}

// WorkQueue.putIntoMemory(['HarderTest', 'Difficulty'], 'harder');
let workObject = { 'one': 1, 'two': 2, 'three': 3 };
WorkQueue.push(workObject);