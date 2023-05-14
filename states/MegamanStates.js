import Registry from "../classes/Registry.js"
import { STANDING, RUNNING, TAKEOFF, LANDING, JUMPING, LEFT, RIGHT, CLIMBING } from "../constants/AnimationComponentConstants.js"
import { ANIMATION, RIGIDBODY, SPRITE, STATE } from "../constants/ComponentConstants.js"



class MegamanState {

    transition = (id) => {
        const animationComponent = Registry.getComponent(ANIMATION, id);
        const stateComponent = Registry.getComponent(STATE, id);

        if (stateComponent) {
            switch (stateComponent.currentState.name) {
                case RUNNING: {
                    const { prevState, currentState } = stateComponent;
                    // console.log("prev state: ", prevState.name)
                    if (currentState.name !== JUMPING && currentState.name !== CLIMBING) {
                        if (animationComponent) {
                            animationComponent.mode = RUNNING;
                        }
                    }

                    break;
                }
                case STANDING: {

                    if (animationComponent) {
                        animationComponent.mode = STANDING;
                    }
                    break;
                }
                case JUMPING: {

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