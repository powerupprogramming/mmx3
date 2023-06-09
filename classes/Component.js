class Component {
    constructor(componentType) {
        this.componentType = componentType; // string
    }
}


class PositionComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);

        this.x = componentObj.x;
        this.y = componentObj.y;
        this.previousX = componentObj.x;
        this.previousY = componentObj.y;
        this.width = componentObj.width;
        this.height = componentObj.height;

        /*
        {
            x: 1,
            y: 123,
            width: 50,
            height: 50
        }

        */
    }
}


class CollisionComponent extends Component {
    constructor(componentType) {
        super(componentType);
        this.collisionBottom = false;
        this.collisionTop = false;
        this.collisionLeft = false;
        this.collisionRight = false;
    }
}

class RigidbodyComponent extends Component {
    constructor(componentType, componentObj) {      // Movement
        super(componentType);
        this.velocity = { x: componentObj.vX, y: componentObj.vY, knockbackX: 0, knockbackY: 0 }
        this.acceleration = { x: componentObj.aX, y: componentObj.aY }
        this.sumForces = { x: componentObj.sX, y: componentObj.sY }
        this.mass = componentObj.mass;
        this.maxV = 200;             // TODO: change 

    }
}

class TransitionComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);

        this.screen = componentObj.screen;
        this.coX = componentObj.coX;
        this.coY = componentObj.coY;
    }
}

class CameraComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);

    }
}


class ActionableComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.func = componentObj.func;
        this.args = componentObj.args
    }
}


class SpriteComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.sprite = new Image();
        this.sprite.src = componentObj.path;
        this.srcRect = componentObj.srcRect;
        this.depth = componentObj.depth;
        /*
            {
                x,
                y,
                width,
                height
            }
        */
    }
}

class AnimationComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.isStatic = componentObj.isStatic;          // keep
        this.frames = componentObj.frames;              // keep
        this.alternatingFrameRange = componentObj.alternatingFrameRange;
        /*
            {
                running: {
                    right: {
                        srcRect: [
                            {x,y,width,height},
                            {x,y,width,height}
                        ],
                    },
                    left: {...}
                },
                attack: {}
            }
        */
        this.currentFrame = 0;                      // keep
        this.startOfAnimation = Date.now();         // keep
        this.currentTimeOfAnimation = Date.now();   // keep
        this.mode = componentObj.mode;                     // keep - running, standing, attacking, run-attack, jumping
        this.subMode = componentObj.subMode         // shooting/chargin
        this.direction = componentObj.direction;    // keep
        this.facing = componentObj.facing;          // keep string
        // this.removeOn = componentObj.removeOn;
        // this.shouldAnimate = componentObj.shouldAnimate;
        // this.isAttackingA = false;
        // this.isAttackingB = false;
    }
}

class InventoryComponent extends Component {
    constructor(componentType) {
        super(componentType);
        this.activeA = undefined
        /*
            {
                srcRect: ...
                name: ...
                path ..
                damage ... 
                weaponEntity: Entity
            }

        */
        this.activeB = undefined
        this.inventory = {
            sword: undefined,
            bomb: 1,
            rupies: 2,
            keys: 3
        }
    }
}

class HealthComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.totalHealth = componentObj.totalHealth
        this.remainingHealth = componentObj.remainingHealth;
        this.invulnerableTime = 0;
    }
}

class HitboxComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.owner = componentObj.owner;            // Link = 1, enemy = 2 , LinkWeapon = 3 , enemyProjectile = 4
        this.damage = componentObj.damage;
        this.xOffset = componentObj.xOffset;
        this.yOffset = componentObj.yOffset;
        this.width = componentObj.width;
        this.height = componentObj.height
    }

}

class ItemDropComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);
        this.itemDrop = componentObj.itemDrop;
    }
}

class ItemComponent extends Component {
    constructor(componenType, componentObj) {
        super(componenType)
        this.itemType = componentObj.itemType
    }
}


class StateComponent extends Component {
    constructor(componentType, componentObj) {
        super(componentType);

        // Low & high equal to priority - the higher the priority the more it should be the one to be displayed..
        // this.mainStates = componentObj.mainStates
        // this.combinationStates = componentObj.combinationStates
        // this.pureTransitions = componentObj.pureTransitions
        this.prevState = componentObj.prevState;
        this.currentState = componentObj.currentState;
        this.priorityCurrentState = componentObj.priorityCurrentState;      // higher the stronger

        this.currentSub = componentObj.currentSub;

        this.prevGlobalState = componentObj.prevGlobalState;
        this.globalState = componentObj.globalState;
        // this.possibleStates = componentObj.possibleStates;
    }
}


export { RigidbodyComponent, CameraComponent, HitboxComponent, ItemComponent, PositionComponent, ItemDropComponent, SpriteComponent, AnimationComponent, CollisionComponent, TransitionComponent, ActionableComponent, InventoryComponent, HealthComponent, StateComponent }