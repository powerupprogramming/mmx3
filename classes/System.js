import { CHANGESTATE, JUMPING, LEFT, TRANSITIONSTATE } from "../constants/AnimationComponentConstants.js";
import { ACTIONABLE, ANIMATION, COLLISION, HEALTH, HITBOX, ITEM, RIGIDBODY, POSITION, SPRITE, TRANSITION, STATE } from "../constants/ComponentConstants.js";
import { GROUNDCOLLISION } from "../constants/EventConstants.js";
import { canvas, c, MILLISECONDS_PER_FRAME, PIXELS_PER_METER } from "../index.js";
import { StandingState } from "../states/MegamanStates.js";
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

    update = (dt) => {
        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];

            const Collision = Registry.getComponent(COLLISION, entity.id);
            const Position = Registry.getComponent(POSITION, entity.id);
            const RigidBody = Registry.getComponent(RIGIDBODY, entity.id);
            const Animation = Registry.getComponent(ANIMATION, entity.id);

            const { velocity, acceleration, sumForces, mass, maxV } = RigidBody;

            sumForces.y = mass * 9.8 * PIXELS_PER_METER;

            // Integrate the forces 
            acceleration.x = sumForces.x * (1 / mass);
            acceleration.y = sumForces.y * (1 / mass);

            // Integrate acceleration into velocity
            velocity.x += acceleration.x * dt;
            velocity.y += acceleration.y * dt;

            if (Collision) {

                if (Collision.collisionLeft || Collision.collisionRight) {
                    velocity.x = 0;
                    velocity.knockbackX = 0;
                    Position.x = Position.previousX;
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
            }

            Collision.collisionBottom = false;
            Collision.collisionTop = false;
            Collision.collisionLeft = false;
            Collision.collisionRight = false;

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



            // if (Animation) {
            //     if (RigidBody.vX > 0) {
            //         Animation.facing = "right"
            //     }
            //     if (RigidBody.vX < 0) {
            //         Animation.facing = "left"
            //     }

            //     if (RigidBody.vY < 0) {
            //         Animation.facing = "up";
            //     }

            //     if (RigidBody.vY > 0) {
            //         Animation.facing = "down";
            //     }
            //     // TODO: put into user input
            //     if (RigidBody.vX || RigidBody.vY) {
            //         Animation.shouldAnimate = true
            //     } else {
            //         Animation.shouldAnimate = false
            //     }
            // }
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
                            eventBus[player.id][TRANSITIONSTATE](new StandingState(), player.id)

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
                }
                if (
                    playerLeftPoint.x < ex + ewidth &&
                    playerLeftPoint.x + (velocity.x * deltaTime) + velocity.knockbackX > ex &&
                    playerLeftPoint.y < ey + eheight &&
                    playerLeftPoint.y + 1 + (velocity.y * deltaTime) + velocity.knockbackY > ey
                ) {
                    Collision.collisionLeft = true;
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

                const { Position: e1Position } = e1.components;
                const { Position: e2Position } = e2.components;

                const { x: x1, y: y1, width: width1, height: height1 } = e1Position;
                const { x: x2, y: y2, width: width2, height: height2 } = e2Position;


                if (
                    x1 < x2 + width2 &&
                    x1 + width1 > x2 &&
                    y1 < y2 + height2 &&
                    y1 + height1 > y2
                ) {

                    const { Hitbox: hitbox1 } = e1.components;
                    const { Hitbox: hitbox2 } = e2.components;
                    let kbReceiver = undefined;
                    let kbSender = undefined;

                    // If hitbox1 owner is linkweapon, and hitbox2 owner is enemy
                    // If hitbox1 owner is enem7, and hitbox2 owner is link weapon
                    if (
                        (hitbox1.owner === 3 && hitbox2.owner === 2)
                        ||
                        (hitbox1.owner === 2 && hitbox2.owner === 3)
                    ) {
                        // If link's sword overlaps with the enemy, do damage to enemy
                        const linkAttack = hitbox1.owner === 3 ? e1 : e2;
                        const enemy = hitbox1.owner === 2 ? e1 : e2;



                        const { damage } = linkAttack.components["Hitbox"]

                        if (damage) {

                            const { invulnerableTime } = enemy.components["Health"];

                            if (invulnerableTime === 0) {
                                // Do damage
                                enemy.components["Health"].remainingHealth -= damage;
                                enemy.components["Health"].invulnerableTime = Date.now() + 1000; // We will be handling this later

                                // Apply Knockback
                                kbReceiver = enemy;
                                kbSender = linkAttack;
                                new Audio("../assets/audio/enemyHurt.mp3").play();


                            }


                        }

                    }
                    // If enemy overlaps with Link, do damage to link
                    // If enemy projectile overlaps with Link, we'll do damage to link
                    else if (
                        (hitbox1.owner === 1 && hitbox2.owner % 2 === 0)
                        ||
                        (hitbox1.owner % 2 === 0 && hitbox2.owner === 1)
                    ) {
                        // If link's sword overlaps with the enemy, do damage to enemy
                        const link = hitbox1.owner === 1 ? e1 : e2;
                        const enemy = hitbox1.owner === 1 ? e2 : e1;            // enemy or enemyProjectil

                        const { damage } = enemy.components["Hitbox"]

                        if (damage) {

                            const { invulnerableTime } = link.components["Health"];

                            if (invulnerableTime === 0) {
                                // Do damage
                                link.components["Health"].remainingHealth -= damage;
                                link.components["Health"].invulnerableTime = Date.now() + 1000;

                                kbReceiver = link;
                                kbSender = enemy;
                                new Audio("../assets/audio/linkHurt.mp3").play();

                            }


                        }


                    }


                    if (kbReceiver && kbSender) {
                        const receiverCenterX = kbReceiver.components["Position"].x - (kbReceiver.components["Position"].width / 2);
                        const receiverCenterY = kbReceiver.components["Position"].y - (kbReceiver.components["Position"].height / 2);

                        const senderCenterX = kbSender.components["Position"].x - (kbSender.components["Position"].width / 2);
                        const senderCenterY = kbSender.components["Position"].y - (kbSender.components["Position"].height / 2);

                        let differenceX = senderCenterX - receiverCenterX;
                        let differenceY = senderCenterY - receiverCenterY;

                        let absoluteDiffX = differenceX < 0 ? differenceX * -1 : differenceX;
                        let absoluteDiffY = differenceY < 0 ? differenceY * -1 : differenceY;

                        let side = undefined;

                        // Whatever is greater will determine the axis that collision occurred on.
                        if (absoluteDiffX > absoluteDiffY) {
                            // It is either left or right
                            if (differenceX < 0) {
                                side = "right"
                                // Apply knock back 
                                kbReceiver.components["Movement"].knockbackVx = 10
                            } else {
                                side = "left"
                                kbReceiver.components["Movement"].knockbackVx = -10;
                            }
                        }
                        else {
                            // It is either top or bottom

                            if (differenceY < 0) {
                                side = "top";
                                kbReceiver.components["Movement"].knockbackVy = 10;
                            } else {
                                side = "bottom";
                                kbReceiver.components["Movement"].knockbackVy = -10;
                            }
                        }


                    }


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
            const { srcRect, sprite } = Sprite;

            c.beginPath();

            if (srcRect) {

                c.globalCompositeOperation = "source-over"
                // c.imageSmoothingEnabled = true;
                // c.imageSmoothingQuality = "high";
                const { x: sx, y: sy, width: sw, height: sh } = srcRect;

                c.drawImage(sprite, sx, sy, sw, sh, x, y, width, height);
            }
            else {

                c.globalCompositeOperation = "destination-over"
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

                if (entity.registry.getComponent(HITBOX, entity.id)) {

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

    update = () => {

        for (let i = 0; i < this.entities.length; i++) {
            const entity = this.entities[i];



            const Animation = Registry.getComponent(ANIMATION, entity.id);
            const { mode, direction, currentFrame } = Animation;
            const { animationLength, hold } = Animation.frames[mode];


            const numOfFrames = Animation.frames[mode][direction];


            if (currentFrame === hold) {

                const Sprite = Registry.getComponent(SPRITE, entity.id);

                Sprite.sprite.src = `../assets/MegamanX/${mode}/${direction}/${currentFrame}.png`.toLowerCase()


            } else {
                const nextFrame = Math.floor(((Animation.currentTimeOfAnimation - Animation.startOfAnimation) / animationLength) % numOfFrames);
                const Sprite = Registry.getComponent(SPRITE, entity.id);

                Sprite.sprite.src = `../assets/MegamanX/${mode}/${direction}/${nextFrame}.png`.toLowerCase()

                Animation.currentFrame = nextFrame;



            }

            Animation.currentTimeOfAnimation = Date.now();










            // const { facing, shouldAnimate, isAttackingA, isStatic, removeOn, isAttackingB } = entity.components["Animation"];

            // if (isStatic) {
            //     const currentFrame = Math.floor(
            //         (gameTime - entity.components["Animation"]["currentTimeOfAnimation"]) *
            //         entity.components["Animation"]["frames"]["frameSpeedRate"] / 1000
            //     ) % entity.components["Animation"]["frames"]["numFrames"];


            //     entity.components["Sprite"]["srcRect"] = entity.components["Animation"]["frames"]["srcRect"][currentFrame];

            //     entity.components["Animation"]["frames"]["currentFrame"] = currentFrame;
            // }
            // else if (shouldAnimate || isAttackingA || isAttackingB) {

            //     let mode;
            //     if (!shouldAnimate && (isAttackingA || isAttackingB)) {
            //         mode = "attack";
            //     } else {
            //         mode = "move"
            //     }

            //     const currentFrame = Math.floor(
            //         (gameTime - entity.components["Animation"]["currentTimeOfAnimation"]) *
            //         entity.components["Animation"]["frames"][facing][mode]["frameSpeedRate"] / 1000
            //     ) % entity.components["Animation"]["frames"][facing][mode]["numFrames"];


            //     entity.components["Sprite"]["srcRect"] = entity.components["Animation"]["frames"][facing][mode]["srcRect"][currentFrame];

            //     entity.components["Animation"]["frames"][facing][mode]["currentFrame"] = currentFrame;
            // }
            // else if (!shouldAnimate && !isAttackingA && !isAttackingB) {
            //     entity.components["Sprite"]["srcRect"] = entity.components["Animation"]["frames"][facing]["move"]["srcRect"][0];
            //     entity.components["Animation"]["frames"][facing]["move"]["currentFrame"] = 0;
            // }

            // if (removeOn && removeOn === entity.components["Animation"]["frames"]["currentFrame"]) {
            //     entity.registry.entitiesToBeRemoved.push(entity);

            // }

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



            const stateComponent = Registry.getComponent(STATE, id);

            if (stateComponent.currentState) {

                stateComponent.currentState.execute(id);

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

            if (stateComponent.currentState.priority > newState.priority) {
                return;
            }



            // this.currentState.exit()
            stateComponent.prevState = stateComponent.currentState;
        }

        // this currentSTate.enter()
        stateComponent.currentState = newState;
        stateComponent.currentState.enter(id);

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


