var helperStructures = {
    
    getStructures: function(room, structureType = false) {
        var result = [];
        var roomStructures = room.find(FIND_STRUCTURES);
        
        for (var idxStructure in roomStructures) {
            var roomStructure = roomStructures[idxStructure];
            
            if (structureType === false || roomStructure.structureType == structureType) {
                result.push(roomStructure);
            } 
        }
        
        return result;
    }
    
}

module.exports = helperStructures;