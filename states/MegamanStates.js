import Registry from "../classes/Registry.js"
import { STANDING, RUNNING, TAKEOFF, LANDING, JUMPING, LEFT, RIGHT, CLIMBING, DASHING, CHANGESTATE, ADDVELOCITYLEFT, ADDVELOCITYRIGHT, SHOOTING, CHARGING, CHANGESUB, TPOSITION } from "../constants/AnimationComponentConstants.js"
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

export class TPositionState extends MegamanState {
    // essentially frozen 
    constructor() {
        super();

        this.name = TPOSITION
    }

    enter = () => { };
    execute = () => { };
    exit = () => { }
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