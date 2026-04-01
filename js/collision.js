// Collision Detection Utilities

const Collision = {
    // Check if two rectangles overlap (AABB collision)
    checkRectCollision(rect1, rect2) {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    },

    // Get collision box with optional padding/shrinking
    getCollisionBox(entity, padding = 0) {
        return {
            x: entity.x + padding,
            y: entity.y + padding,
            width: entity.width - (padding * 2),
            height: entity.height - (padding * 2)
        };
    },

    // Check collision between player and an obstacle/coin with adjustable hitboxes
    checkEntityCollision(player, entity, playerPadding = 15, entityPadding = 5) {
        const playerBox = this.getCollisionBox(player, playerPadding);
        const entityBox = this.getCollisionBox(entity, entityPadding);
        return this.checkRectCollision(playerBox, entityBox);
    }
};
