import Registry from "../classes/Registry.js"
import { STANDING, RUNNING, TAKEOFF, LANDING, JUMPING, LEFT, RIGHT, CLIMBING, DASHING, CHANGESTATE, ADDVELOCITYLEFT, ADDVELOCITYRIGHT, SHOOTING, CHARGING, CHANGESUB } from "../constants/AnimationComponentConstants.js"
import { ANIMATION, POSITION, RIGIDBODY, SPRITE, STATE } from "../constants/ComponentConstants.js"
import { COMBINATION } from "../constants/EventConstants.js";
import { MOVEMENT_SYSTEM, RENDER_SYSTEM } from "../constants/SystemConstants.js";
import { CreateAnimationComponent, CreateBusterShotAnimationComponent, CreateHitboxComponent, CreatePositionComponent, CreateRigidbodyComponent, CreateSpriteComponent } from "../utilities/CreateComponents.js";



class MegamanState {

    constructor() {
        this.startTime = Date.now();
    }

    transition = (id) => {
        const animationComponent = Registry.getComponent(ANIMATION, id);
        const stateComponent = Registry.getComponent(STATE, id);
        const rigidbodyComponent = Registry.getComponent(RIGIDBODY, id);
        const { prevState, currentState, currentSub } = stateComponent;

        if (stateComponent) {

            if (currentState) {
                switch (currentState.name) {
                    // case ADDVELOCITY: {

                    //     if (prevState && prevState.name !== ADDVELOCITY) {
                    //         rigidbodyComponent.velocity.x += animationComponent.direction === LEFT ? -50 : 50;
                    //     }
                    //     break;
                    // }

                    case RUNNING: {
                        if (currentState.name !== JUMPING && currentState.name !== CLIMBING) {
                            if (animationComponent) {
                                // Add to it
                                rigidbodyComponent.velocity.x = animationComponent.direction === LEFT ? -125 : 125;
                                animationComponent.mode = RUNNING;
                            }
                        }

                        break;
                    }
                    case DASHING: {

                        if (animationComponent && prevState && (prevState.name === STANDING || prevState.name === RUNNING)) {
                            rigidbodyComponent.velocity.x = animationComponent.direction === LEFT ? -400 : 400
                            animationComponent.mode = DASHING;
                        }
                        break
                    }
                    case STANDING: {

                        if (animationComponent) {
                            animationComponent.mode = STANDING;
                        }
                        break;
                    }
                    case JUMPING: {

                        rigidbodyComponent.velocity.y = -300;

                        if (animationComponent) {

                            animationComponent.mode = JUMPING

                        }
                    }
                    default: {
                        break;
                    }
                }
            }

        }

    }

    subTransition = (id) => {
        const animationComponent = Registry.getComponent(ANIMATION, id);
        const stateComponent = Registry.getComponent(STATE, id);
        const { currentSub } = stateComponent;

        if (currentSub) {
            switch (currentSub.name) {
                case SHOOTING: {
                    animationComponent.subMode = SHOOTING
                    break;
                }

                case CHARGING: {
                    // animationComponent.subMode = CHARGING
                    break;
                }

                default: {
                    break
                }
            }
        }
    }
}


export class RunningState extends MegamanState {
    constructor(frame) {
        super();
        this.name = RUNNING;
        this.frame = frame
        this.priority = 1;
    }

    enter = (id) => {
        const stateComponent = Registry.getComponent(STATE, id);
        stateComponent.priorityCurrentState = 1;
        this.transition(id)
    }

    execute = () => { }

    exit = () => { }

}

export class StandingState extends MegamanState {
    constructor() {
        super();
        this.name = STANDING;
        this.priority = 1
    }

    enter = (id) => {
        const stateComponent = Registry.getComponent(STATE, id);
        const rigidbodyComponent = Registry.getComponent(RIGIDBODY, id);
        rigidbodyComponent.velocity.x = 0;
        stateComponent.priorityCurrentState = 1;
        this.transition(id)
    }

    execute = () => { }

    exit = () => { }

}



class Takeoff {
    constructor() { }

    enter = () => { }

    execute = () => {
    }

    exit = () => { }
}

export class DashingState extends MegamanState {
    constructor() {
        super()
        this.name = DASHING
    }

    enter = (id) => {
        const stateComponent = Registry.getComponent(STATE, id)

        stateComponent.priorityCurrentState = 2
        this.transition(id)
    }

    execute = (id, eventBus) => {

        if (Date.now() > this.startTime + 500) {

            if (eventBus[id][ADDVELOCITYLEFT] || eventBus[id][ADDVELOCITYRIGHT] || eventBus[id][RUNNING]) {
                eventBus[id][CHANGESTATE](
                    new RunningState(), id
                )
            } else {
                eventBus[id][CHANGESTATE](
                    new StandingState(), id
                )
            }

        }

    }

    exit = () => { }
}

// export class AddVelocityState extends MegamanState {
//     constructor() {
//         super();
//         this.name = ADDVELOCITY;
//         this.priority = COMBINATION // true will be our combination state
//     }

//     enter = (id) => {
//         const stateComponent = Registry.getComponent(STATE, id);
//         stateComponent.priorityCurrentState = this.priority;

//         this.transition(id);
//     }

//     execute = () => { }

//     exit = () => { }
// }

export class ShootingState extends MegamanState {
    constructor() {
        super()
        this.name = SHOOTING
        this.priority = COMBINATION
    }

    enter = (id) => {
        const stateComponent = Registry.getComponent(STATE, id);
        this.subTransition(id);

    }

    execute = (id, eventBus) => {
        // create lemons
        const stateComponent = Registry.getComponent(STATE, id);
        const animationComponent = Registry.getComponent(ANIMATION, id);



        // clear state
        if (Date.now() >= this.startTime + 200) {
            eventBus[id][CHANGESUB](undefined, id)
            animationComponent.subMode = null;
        }


    }

    exit = () => {

    }
}

export class ChargingState extends MegamanState {

    constructor() {
        super()
        this.name = CHARGING
        this.priority = COMBINATION
    }

    enter = (id) => {
        const State = Registry.getComponent(STATE, id)
        const { currentSub } = State

        this.startTime = Date.now()
        this.subTransition(id);

    }

    execute = (id) => {

    }

    exit = (id) => {
        const Animation = Registry.getComponent(ANIMATION, id)
        const Position = Registry.getComponent(POSITION, id)

        let shotId, x, assetPath, hitbox, rigid, sprite, position, animation;

        if (Animation.direction === LEFT) {
            x = Position.x
        } else {
            x = Position.x + Position.width - 10
        }

        if (Date.now() <= this.startTime + 1000) {
            shotId = 0;
            assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

            hitbox = CreateHitboxComponent(0, 0, 20, 20)
            rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
            sprite = CreateSpriteComponent(assetPath);
            position = CreatePositionComponent(Animation.direction === LEFT ? x : x - 10, Position.y + (Position.height / 2 - 10), 20, 20)
            animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
        } else if (Date.now() >= this.startTime + 1000 && Date.now() <= this.startTime + 2000) {
            shotId = 1
            assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

            hitbox = CreateHitboxComponent(0, 0, 20, 20)
            rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
            sprite = CreateSpriteComponent(assetPath);
            position = CreatePositionComponent(Animation.direction === LEFT ? x - 37 : x - 8, Position.y + (Position.height / 3) - 5, 50, 50)
            animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
        } else {
            shotId = 2;
            assetPath = `./assets/Projectiles/${Animation.direction}/${shotId}/0.png`

            hitbox = CreateHitboxComponent(0, 0, 100, 100)
            rigid = CreateRigidbodyComponent(Animation.direction === LEFT ? -500 : 500, 0, 0, 0, 0, 0, 20);
            sprite = CreateSpriteComponent(assetPath);
            position = CreatePositionComponent(Animation.direction === LEFT ? x - 35 : x - 10, Position.y, 100, 100)
            animation = CreateBusterShotAnimationComponent(shotId, Animation.direction);
        }





        // Get any system in order to get entity to get Registry value
        const RenderSystem = Registry.getSystem(RENDER_SYSTEM);
        const { registry } = RenderSystem.entities[0];

        if (registry) {
            const e = registry.createEntity([hitbox, rigid, sprite, position, animation]);

        }
    }


}






export class JumpingState extends MegamanState {
    constructor() {
        super();
        this.name = JUMPING;
        this.priority = 2;
    }

    enter = (id) => {
        const stateComponent = Registry.getComponent(STATE, id);
        stateComponent.priorityCurrentState = 2;
        this.transition(id);

    }

    execute = (id) => { }

    exit = () => { }
}