import { ADDVELOCITYLEFT, ADDVELOCITYRIGHT, CHANGESTATE, CHANGESUB, JUMPING, LEFT, LEVEL2BUSTER, NOSUB, PROJECTILES, RUNNING, SHOOTING, TRANSITIONSTATE } from "../constants/AnimationComponentConstants.js";
import { MEGAMAN } from "../constants/AssetConstants.js";
import { ACTIONABLE, ANIMATION, COLLISION, HEALTH, HITBOX, ITEM, RIGIDBODY, POSITION, SPRITE, TRANSITION, STATE } from "../constants/ComponentConstants.js";
import { COMBINATION, GROUNDCOLLISION, LEFTWALLCOLLISION, RIGHTKEYDOWN, RIGHTWALLCOLLISION } from "../constants/EventConstants.js";
import { canvas, c, MILLISECONDS_PER_FRAME, PIXELS_PER_METER } from "../index.js";
import { RunningState, StandingState } from "../states/MegamanStates.js";
import Registry from "./Registry.js";

class System {
    constructor(systemType) {
        this.systemType = systemType;
        this.entities = []
    }
}


class MovementSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [RIGIDBODY, POSITION];
    }

    update = (dt, eventBus) => {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];

            const Collision = Registry.getComponent(COLLISION, entity.id);
            const Position = Registry.getComponent(POSITION, entity.id);
            const RigidBody = Registry.getComponent(RIGIDBODY, entity.id);
            const Animation = Registry.getComponent(ANIMATION, entity.id);

            const { velocity, acceleration, sumForces, mass, maxV } = RigidBody;

            // Only apply to megaman for now
            if (entity.id === 0) {
                sumForces.y += mass * 9.8 * PIXELS_PER_METER;



            }



            // Integrate the forces 
            acceleration.x = sumForces.x * (1 / mass);
            acceleration.y = sumForces.y * (1 / mass);

            // if (entity.id === 0) console.log("Acceleration ", acceleration.y)


            // Integrate acceleration into velocity
            velocity.x += acceleration.x * dt;
            velocity.y += acceleration.y * dt;

            if (Collision) {

                if (Collision.collisionLeft || Collision.collisionRight) {
                    velocity.x = 0;
                    velocity.knockbackX = 0;
                    // Position.x = Position.previousX; Jake for wall climb
                } else {
                    Position.previousX = Position.x;
                }

                if (Collision.collisionTop || Collision.collisionBottom) {
                    velocity.y = 0;
                    velocity.knockbackY = 0;
                    Position.y = Position.previousY;
                } else {
                    Position.previousY = Position.y;
                }

                Collision.collisionBottom = false;
                Collision.collisionTop = false;
                Collision.collisionLeft = false;

                if (entity.id === 0) {
                    if (eventBus[entity.id] && eventBus[entity.id][RIGHTKEYDOWN] && eventBus[entity.id][RIGHTWALLCOLLISION] && !eventBus[entity.id][GROUNDCOLLISION]) {
                        // console.log("HERE")
                        Collision.collisionRight = true;
                    } else {
                        Collision.collisionRight = false
                    }
                } else {
                    Collision.collisionBottom = false;
                    Collision.collisionTop = false;
                    Collision.collisionLeft = false;
                    Collision.collisionRight = false

                }

            }



            // Constant acceleration:
            Position.x = Position.x + ((velocity.x * dt) + (velocity.knockbackX * dt)) + ((acceleration.x * dt * dt) / 2);
            Position.y = Position.y + ((velocity.y * dt) + (velocity.knockbackY * dt)) + ((acceleration.y * dt * dt) / 2);



            const f = 0.95;     // friction coefficient

            if (RigidBody.knockbackVx < 0) {
                RigidBody.knockbackVx = f * Math.ceil(RigidBody.knockbackVx)
            }
            else if (RigidBody.knockbackVx > 0) {
                RigidBody.knockbackVx = f * Math.floor(RigidBody.knockbackVx)
            }

            if (RigidBody.knockbackVy < 0) {
                RigidBody.knockbackVy = f * Math.ceil(RigidBody.knockbackVy);
            }
            else if (RigidBody.knockbackVy > 0) {
                RigidBody.knockbackVy = f * Math.floor(RigidBody.knockbackVy);
            }



            sumForces.y = 0;

        }
    }
}


class CollisionSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [POSITION, COLLISION]
    }

    update = (player, eventBus, deltaTime) => {

        if (player) {
            for (let i = 0; i < this.entities.length; i++) {

                const entity = this.entities[i];



                if (player.id === entity.id) continue;


                const { x: px, y: py, width: pwidth, height: pheight } = Registry.getComponent(POSITION, player.id)
                const { x: ex, y: ey, width: ewidth, height: eheight } = Registry.getComponent(POSITION, entity.id)
                const RigidBody = Registry.getComponent(RIGIDBODY, player.id)
                const Collision = Registry.getComponent(COLLISION, player.id)

                const { velocity } = RigidBody;

                const playerBottomPoint = { x: px + (pwidth / 2), y: py + pheight };
                const playerRightPoint = { x: px + pwidth, y: py + (pheight / 2) };

                const playerLeftPoint = { x: px, y: py + (pheight / 2) };
                const playerTopPoint = { x: px + (pwidth / 2), y: py }

                // the width is not very applicable but we'll use 1
                if (
                    playerBottomPoint.x < ex + ewidth &&
                    playerBottomPoint.x + 1 + (velocity.x * deltaTime) + velocity.knockbackX > ex &&
                    playerBottomPoint.y < ey + eheight &&
                    playerBottomPoint.y + (velocity.y * deltaTime) + velocity.knockbackY > ey
                ) {
                    Collision.collisionBottom = true;

                    if (!eventBus[player.id]) {
                        eventBus[player.id] = {}
                    }
                    eventBus[player.id][GROUNDCOLLISION] = () => {
                        const stateComponent = Registry.getComponent(STATE, player.id);
                        if (stateComponent.currentState && stateComponent.currentState.name === JUMPING) {

                            if (eventBus[player.id][ADDVELOCITYLEFT] || eventBus[player.id][ADDVELOCITYRIGHT] || eventBus[player.id][RUNNING]) {
                                eventBus[player.id][TRANSITIONSTATE](new RunningState(), player.id)

                            } else {

                                eventBus[player.id][TRANSITIONSTATE](new StandingState(), player.id)

                            }

                        }
                    }

                }

                if (
                    playerTopPoint.x < ex + ewidth &&
                    playerTopPoint.x + (velocity.x * deltaTime) + velocity.knockbackX > ex &&
                    playerTopPoint.y < ey + eheight &&
                    playerTopPoint.y + (velocity.y * deltaTime) + velocity.knockbackY > ey
                ) {
                    Collision.collisionTop = true;
                }

                if (
                    playerRightPoint.x < ex + ewidth &&
                    playerRightPoint.x + (velocity.x * deltaTime) + velocity.knockbackX > ex &&
                    playerRightPoint.y < ey + eheight &&
                    playerRightPoint.y + 1 + (velocity.y * deltaTime) + velocity.knockbackY > ey
                ) {
                    Collision.collisionRight = true;

                    // If state isn't knocked back , comma cling wall
                    eventBus[player.id][RIGHTWALLCOLLISION] = () => { }


                }
                if (
                    playerLeftPoint.x < ex + ewidth &&
                    playerLeftPoint.x + (velocity.x * deltaTime) + velocity.knockbackX > ex &&
                    playerLeftPoint.y < ey + eheight &&
                    playerLeftPoint.y + 1 + (velocity.y * deltaTime) + velocity.knockbackY > ey
                ) {
                    Collision.collisionLeft = true;

                    console.log("LEFT")

                    eventBus[player.id][LEFTWALLCOLLISION] = () => { }
                }



            }
        }
    }
}

class ActionableSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [ACTIONABLE];
    }

    update = (player, eventBus) => {
        for (let i = 0; i < this.entities.length; i++) {

            if (player) {
                const entity = this.entities[i];

                const { x: px, y: py, width: pwidth, height: pheight } = player.components["Position"];
                const { x: ex, y: ey, width: ewidth, height: eheight } = entity.components["Position"];

                if (
                    px < ex + ewidth &&
                    px + pwidth > ex &&
                    py < ey + eheight &&
                    py + pheight > ey
                ) {


                    const { Actionable } = entity.components;
                    const { args, func } = Actionable;
                    // LINK_PICKUP_SWORD_1(player);

                    const event = {
                        args: {
                            ...args,
                            eventTime: 0
                        },
                        func
                    };

                    eventBus.push(event);


                }
            }
        }
    }
}

class TransitionSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [POSITION, TRANSITION]
    }

    update = (player, eventBus, loadNewScreen) => {

        if (player) {
            for (let i = 0; i < this.entities.length; i++) {


                const entity = this.entities[i];

                const { x: px, y: py, width: pwidth, height: pheight } = player.components["Position"];
                const { x: ex, y: ey, width: ewidth, height: eheight } = entity.components["Position"];

                if (
                    px < ex + ewidth &&
                    px + pwidth > ex &&
                    py < ey + eheight &&
                    py + pheight > ey
                ) {


                    const { Transition } = entity.components;


                    const event = {
                        args: {
                            ...Transition,
                            eventTime: 0
                        },
                        func: loadNewScreen
                    };

                    eventBus.push(event);


                }


            }
        }
    }
}

class ItemSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [ITEM];
    }

    update = (player) => {

        if (player) {

            for (let i = 0; i < this.entities.length; i++) {


                const e1 = this.entities[i];
                const { Position: e1Position, Item } = e1.components;
                const { Position: playerPosition } = player.components;

                const { x: x1, y: y1, width: width1, height: height1 } = e1Position;
                const { x: px, y: py, width: pwidth, height: pheight } = playerPosition;


                if (
                    x1 < px + pwidth &&
                    x1 + width1 > px &&
                    y1 < py + pheight &&
                    y1 + height1 > py
                ) {
                    const { itemType } = Item;

                    ITEM_DROP_TABLE[itemType].onPickup(e1, player);
                }

            }


        }
    }


}

class HitboxSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [HITBOX, POSITION]
    }

    update = () => {
        for (let i = this.entities.length - 1; i > 0; i--) {
            for (let j = 0; j < i; j++) {
                const e1 = this.entities[i];
                const e2 = this.entities[j];

                if (e1.id === e2.id) continue;


                let { x: x1, y: y1, width: width1, height: height1 } = Registry.getComponent(POSITION, e1.id);;
                let { x: x2, y: y2, width: width2, height: height2 } = Registry.getComponent(POSITION, e2.id);

                const { xOffset: xOffset1, yOffset: yOffset1, width: hitboxWidth1, height: hitboxHeight1 } = Registry.getComponent(HITBOX, e1.id)
                const { xOffset: xOffset2, yOffset: yOffset2, width: hitboxWidth2, height: hitboxHeight2 } = Registry.getComponent(HITBOX, e2.id)



                x1 += xOffset1;
                y1 += yOffset1
                width1 += hitboxWidth1
                height1 += hitboxHeight1

                x2 += xOffset2
                y2 += yOffset2
                width2 += hitboxWidth2
                height2 += hitboxHeight2



                if (
                    x1 < x2 + width2 &&
                    x1 + width1 > x2 &&
                    y1 < y2 + height2 &&
                    y1 + height1 > y2
                ) {


                }

            }
        }


    }
}


class HealthSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [HEALTH];
    }

    update = (registry) => {

        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];
            const { remainingHealth, invulnerableTime } = entity.components["Health"];

            if (Date.now() >= invulnerableTime) {
                entity.components["Health"].invulnerableTime = 0;
            }

            if (remainingHealth <= 0) {

                if (entity.components["ItemDrop"]) {
                    const { itemDrop } = entity.components["ItemDrop"];


                    // Call the functions

                    for (let key in itemDrop) {

                        const value = itemDrop[key];

                        if (Math.random() < value) {
                            const { x, y } = entity.components["Position"];
                            ITEM_DROP_TABLE[key].onDrop(registry, x, y);
                            break;
                        }
                    }
                }



                registry.entitiesToBeRemoved.push(entity);
            }
        }
    }
}


class RenderSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [POSITION, SPRITE];
    }

    update = (isDebug, eventBus) => {
        c.clearRect(0, 0, canvas.width, canvas.height)
        for (let i = 0; i < this.entities.length; i++) {

            const entity = this.entities[i]

            const Position = Registry.getComponent(POSITION, entity.id);
            const Sprite = Registry.getComponent(SPRITE, entity.id);
            let Collision = undefined;

            if (Registry.componentEntityMapping[COLLISION] && Registry.getComponent(COLLISION, entity.id)) {
                Collision = Registry.getComponent(COLLISION, entity.id)
            }

            const { x, y, width, height } = Position;
            const { srcRect, sprite, depth } = Sprite;

            c.beginPath();


            if (depth === "background") {

                c.globalCompositeOperation = "destination-over"
                // c.imageSmoothingEnabled = true;
                // c.imageSmoothingQuality = "high";
                // const { x: sx, y: sy, width: sw, height: sh } = srcRect;

                // c.drawImage(sprite, sx, sy, sw, sh, x, y, width, height);
                c.drawImage(sprite, x, y, width, height);

            }
            else {


                c.imageSmoothingEnabled = true;
                c.imageSmoothingQuality = "high";
                c.globalCompositeOperation = "source-over"

                c.drawImage(sprite, x, y, width, height)



            }

            if (isDebug) {

                c.globalCompositeOperation = "source-over"
                const { id } = entity;

                c.beginPath();
                c.fillStyle = "black"
                c.font = "15px Arial"
                c.fillText(id, x, y + 70, 50);
                c.stroke();


                if (Collision) {
                    c.beginPath();
                    c.rect(x, y, width, height);
                    c.lineWidth = 2;
                    c.strokeStyle = "red"
                    c.stroke();

                }

                if (Registry.getComponent(HITBOX, entity.id)) {

                    c.beginPath();
                    c.rect(x, y, width, height);
                    c.linkWidth = 2;
                    c.strokeStyle = "orange";
                    c.stroke();
                }



            }


        }

    }
}


class AnimationSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [POSITION, SPRITE, ANIMATION]
    }

    update = (assets) => {

        for (let i = 0; i < this.entities.length; i++) {

            const entity = this.entities[i];

            const Animation = Registry.getComponent(ANIMATION, entity.id);
            const { mode, direction, currentFrame, startOfAnimation, subMode, alternatingFrameRange } = Animation;
            let animationLength, hold;
            if (mode) {
                animationLength = Animation.frames[mode].animationLength;
                hold = Animation.frames[mode].hold;
            } else {
                animationLength = Animation.frames.animationLength
            }


            const numOfFrames = mode ? Animation.frames[mode][direction] : Animation.frames.numFrames;
            const Sprite = Registry.getComponent(SPRITE, entity.id);

            if (currentFrame === hold) {


                if (subMode) {

                    Sprite.sprite = assets[MEGAMAN][subMode][mode][direction][currentFrame];
                }
                else {
                    Sprite.sprite = assets[MEGAMAN][NOSUB][mode][direction][currentFrame];

                }

            }
            else if (alternatingFrameRange && currentFrame >= alternatingFrameRange[0]) {



                // Clamp animation speed
                if (Animation.currentTimeOfAnimation + 50 > Date.now()) continue;


                // Since must be projectile, num of frames equals type since type is just a number

                if (currentFrame === alternatingFrameRange[0]) {
                    Animation.currentFrame += 1;
                    Sprite.sprite = assets[MEGAMAN][PROJECTILES][numOfFrames][direction][alternatingFrameRange[0]]
                }
                // if it is less than max
                else if (currentFrame <= alternatingFrameRange[1]) {
                    Sprite.sprite = assets[MEGAMAN][PROJECTILES][numOfFrames][direction][Animation.currentFrame]
                    Animation.currentFrame += 1;

                }

                // if greater than final frame, set to range[0]
                else if (currentFrame > alternatingFrameRange[1]) {
                    // loop around
                    Animation.currentFrame = alternatingFrameRange[0]
                    Sprite.sprite = assets[MEGAMAN][PROJECTILES][numOfFrames][direction][Animation.currentFrame]
                }



            }
            else {
                const nextFrame = Math.floor(((Animation.currentTimeOfAnimation - Animation.startOfAnimation) / animationLength) % numOfFrames);

                // Must be projectile if no mode
                if (mode === undefined) {
                    // Clamp animation speed
                    if (Animation.currentTimeOfAnimation + 50 > Date.now()) continue;

                    Sprite.sprite = assets[MEGAMAN][PROJECTILES][numOfFrames][direction][nextFrame];
                }
                if (subMode === SHOOTING) {
                    Sprite.sprite = assets[MEGAMAN][SHOOTING][mode][direction][nextFrame]

                }
                else if (mode && direction) {

                    Sprite.sprite = assets[MEGAMAN][NOSUB][mode][direction][nextFrame]
                }

                Animation.currentFrame = nextFrame;
            }

            Animation.currentTimeOfAnimation = Date.now();


        }
    }
}

class StateSystem extends System {
    constructor(systemType) {
        super(systemType);
        this.componentRequirements = [STATE]
    }

    update = (eventBus) => {
        for (let i = 0; i < this.entities.length; i++) {
            const id = this.entities[i].id;

            if (eventBus[id] === undefined) {
                eventBus[id] = {};
            }

            if (!eventBus[id][CHANGESTATE]) {
                eventBus[id][CHANGESTATE] = this.changeState;
            }

            if (!eventBus[id][TRANSITIONSTATE]) {
                eventBus[id][TRANSITIONSTATE] = this.transitionState;
            }

            if (!eventBus[id][CHANGESUB]) {
                eventBus[id][CHANGESUB] = this.changeSub;
            }


            const stateComponent = Registry.getComponent(STATE, id);

            if (stateComponent.currentState) {

                stateComponent.currentState.execute(id, eventBus);

            }

            if (stateComponent.currentSub) {
                stateComponent.currentSub.execute(id, eventBus)
            }



        }
    }

    transitionState = (newState, id) => {
        const stateComponent = Registry.getComponent(STATE, id);



        if (stateComponent.currentState) {

            // this.currentState.exit()
            stateComponent.prevState = stateComponent.currentState;
        }

        // this currentSTate.enter()
        stateComponent.currentState = newState;
        stateComponent.currentState.enter(id);
    }


    // {RUNNING: 0 }
    changeState = (newState, id) => {
        const stateComponent = Registry.getComponent(STATE, id);


        if (stateComponent.currentState) {

            if (stateComponent.currentState.priority > newState.priority && newState.priority !== COMBINATION) {
                return;
            }



            // this.currentState.exit()
            stateComponent.prevState = stateComponent.currentState;
        }


        // this currentSTate.enter()
        stateComponent.currentState = newState;
        stateComponent.currentState.enter(id);

    }

    changeSub = (newState, id) => {
        const stateComponent = Registry.getComponent(STATE, id);


        if (stateComponent && stateComponent.currentSub) {

            // if (stateComponent.currentSub.priority > newState.priority && newState.priority !== COMBINATION) {
            //     return;
            // }

            stateComponent.currentSub.exit(id)
            // stateComponent.prevState = stateComponent.currentSub;
        }


        // this currentSub.enter()
        if (stateComponent) {
            stateComponent.currentSub = newState;
            if (stateComponent.currentSub)
                stateComponent.currentSub.enter(id);


        }


    }



}

const DetermineDirectionOfContact = (receiver, sender) => {

    const rPosition = receiver.registry.getComponent(POSITION, receiver.id);
    const sPosition = receiver.registry.getComponent(POSITION, sender.id);


    const receiverCenterX = rPosition.x - (rPosition.width / 2);
    const receiverCenterY = rPosition.y - (rPosition.height / 2);

    const senderCenterX = sPosition.x - (sPosition.width / 2);
    const senderCenterY = sPosition.y - (sPosition.height / 2);

    let differenceX = senderCenterX - receiverCenterX;
    let differenceY = senderCenterY - receiverCenterY;

    let absoluteDiffX = differenceX < 0 ? differenceX * -1 : differenceX;
    let absoluteDiffY = differenceY < 0 ? differenceY * -1 : differenceY;

    let side = undefined;

    // Whatever is greater will determine the axis that collision occurred on.
    if (absoluteDiffX > absoluteDiffY) {
        // It is either left or right
        const rRigidbody = receiver.registry.getComponent(RIGIDBODY, receiver.id);
        if (differenceX < 0) {
            side = "right"
            // Apply knock back 
        } else {
            side = "left"
        }
    }
    else {
        // It is either top or bottom

        if (differenceY < 0) {
            side = "top";
        } else {
            side = "bottom";
        }
    }
    return side;
}

// const DeterminePointOfContact = (receiver, sender) => {
//     const rPosition = receiver.registry.getComponent(POSITION, receiver.id);
//     const sPosition = receiver.registry.getComponent(POSITION, sender.id);

//     // Test bottom, get point
//     const point = { x: rPosition.x + rPosition.width / 2, y: rPosition.y }


// }

export { StateSystem, MovementSystem, RenderSystem, ItemSystem, AnimationSystem, CollisionSystem, HealthSystem, TransitionSystem, ActionableSystem, HitboxSystem };


