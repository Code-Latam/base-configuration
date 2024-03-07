function findApiInFolder(items, childIndex) {
    return items.hasOwnProperty(childIndex);
}

function addChildToFolder(newChildIndex, targetFolderIndex, items) {
    if (!items.hasOwnProperty(targetFolderIndex)) {
        console.log(`Target folder ${targetFolderIndex} not found.`);
        return {};
    }

    // Add the new child to the items object
    items[newChildIndex] = {
        "index": newChildIndex,
        "children": [],
        "data": `${newChildIndex}`
        // Add other properties as needed
    };

    // Add the new child to the target folder's children array
    items[targetFolderIndex].children.push(newChildIndex);
    return items
}

module.exports.findApiInFolder = findApiInFolder;
module.exports.addChildToFolder = addChildToFolder;