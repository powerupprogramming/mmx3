import Registry from "./classes/Registry.js";
import { ADDVELOCITYLEFT, ADDVELOCITYRIGHT, CHANGESTATE, DASHING, DASHINGFRAMES, JUMPING, JUMPINGFRAMES, LEFT, RIGHT, RUNNING, RUNNINGFRAMES, STANDING, STANDINGFRAMES } from "./constants/AnimationComponentConstants.js";
import { MEGAMAN } from "./constants/AssetConstants.js";
import { ANIMATION, RIGIDBODY, STATE } from "./constants/ComponentConstants.js";
import { GROUNDCOLLISION } from "./constants/EventConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HEALTH_SYSTEM, HITBOX_SYSTEM, ITEM_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, STATE_SYSTEM, TRANSITION_SYSTEM } from "./constants/SystemConstants.js";
import { DashingState, JumpingState, RunningState, StandingState } from "./states/MegamanStates.js";
import { CreateCollisionComponent, CreateMegamanXAnimationComponent, CreateRigidbodyComponent, CreatePositionComponent, CreateSpriteComponent, CreateMegamanXStateComponent } from "./utilities/CreateComponents.js";


export const canvas = document.getElementById("gameScreen");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const c = canvas.getContext("2d");
export const TILE_SIZE = 70


const FPS = 60;
export const MILLISECONDS_PER_FRAME = 1000 / FPS           // for 60 frame a second, its 16.666 MIaLLISECONDS per frame
export const PIXELS_PER_METER = 50;


class Game {

    constructor() {
        this.player = undefined;
        this.registry = new Registry();
        this.gameTime = Date.now();

        this.isDebug = false;
        this.eventBus = { a: { aa: 1 } };           // { a: {} }
        this.audioObject = undefined;

        this.audioPath = "";
        this.isPaused = false;
        this.deltaTime = 0;
        this.millisecondsPreviousFrame = 0;

        this.assets = {
            [MEGAMAN]: {
                [STANDING]: {
                    [LEFT]: [],
                    [RIGHT]: []
                },
                [RUNNING]: {
                    [LEFT]: [],
                    [RIGHT]: []
                },
                [JUMPING]: {
                    [LEFT]: [],
                    [RIGHT]: []
                },
                [DASHING]: {
                    [LEFT]: [],
                    [RIGHT]: []
                }

            }
        }
    }

    initialize = () => {


        this.registry.addSystem(MOVEMENT_SYSTEM);
        this.registry.addSystem(RENDER_SYSTEM);
        this.registry.addSystem(ANIMATION_SYSTEM);
        this.registry.addSystem(COLLISION_SYSTEM);
        this.registry.addSystem(TRANSITION_SYSTEM);
        this.registry.addSystem(HITBOX_SYSTEM);
        this.registry.addSystem(ACTIONABLE_SYSTEM);
        this.registry.addSystem(HEALTH_SYSTEM);
        this.registry.addSystem(ITEM_SYSTEM);
        this.registry.addSystem(STATE_SYSTEM)

        document.addEventListener("keyup", this.handleUserInput)
        document.addEventListener("keydown", this.handleUserInput)


        const p = CreatePositionComponent(250, 50, 120, 90);
        const s = CreateSpriteComponent("./assets/X-sprites.png", { x: 0, y: 60, width: 50, height: 50 });
        const a = CreateMegamanXAnimationComponent();
        const m = CreateRigidbodyComponent(0, 0, 0, 0, 0, 0, 85);         // in kg
        const c = CreateCollisionComponent();

        const playerSprite = CreateSpriteComponent();
        const playerState = CreateMegamanXStateComponent();



        this.player = this.registry.createEntity([p, playerSprite, a, m, c, playerState]);


        for (let i = 0; i < 50; i++) {
            const xVal = i * 50 + 200;
            const newP = CreatePositionComponent(xVal, 400, 50, 50);
            this.registry.createEntity([newP, s, c]);
        }

        // const p2 = CreatePositionComponent(1000, 350, 50, 50);
        // this.registry.createEntity([p2, s, c]);

        const backgroundSprite = CreateSpriteComponent("./assets/Background/Intro-Stage.png");
        const backgroundPosition = CreatePositionComponent(0, 0, 20000, 5000);

        // this.registry.createEntity([backgroundPosition, backgroundSprite])
        this.loadAssets();



    }


    run = () => {
        console.log("This event bus: ", this.eventBus[this.player.id])
        let timeToWait = MILLISECONDS_PER_FRAME - (Date.now() - this.millisecondsPreviousFrame);
        if (timeToWait > 0 && timeToWait <= MILLISECONDS_PER_FRAME) {
            setTimeout(() => {
                this.deltaTime = (Date.now() - this.millisecondsPreviousFrame) / 1000
                if (this.deltaTime > 0.033) {
                    this.deltaTime = 0.033
                }
                this.millisecondsPreviousFrame = Date.now();
                this.update();
                this.render();
            }, timeToWait)
        } else {
            this.deltaTime = (Date.now() - this.millisecondsPreviousFrame) / 1000
            if (this.deltaTime > 0.033) {
                this.deltaTime = 0.033
            }
            this.millisecondsPreviousFrame = Date.now();
            this.update();
            this.render();
        }

        // Set player state



        requestAnimationFrame(this.run)
    }

    update = () => {

        if (!this.isPaused) {


            this.registry.update();

            if (this.eventBus[this.player.id] && this.eventBus[this.player.id][GROUNDCOLLISION]) {
                delete this.eventBus[this.player.id][GROUNDCOLLISION]
            }


            this.registry.getSystem(ANIMATION_SYSTEM).update(this.assets);
            this.registry.getSystem(COLLISION_SYSTEM).update(this.player, this.eventBus, this.deltaTime)
            this.registry.getSystem(MOVEMENT_SYSTEM).update(this.deltaTime)
            this.registry.getSystem(HITBOX_SYSTEM).update();
            this.registry.getSystem(HEALTH_SYSTEM).update(this.registry);
            this.registry.getSystem(TRANSITION_SYSTEM).update(this.player, this.eventBus, this.loadNewScreen)
            this.registry.getSystem(ACTIONABLE_SYSTEM).update(this.player, this.eventBus);
            this.registry.getSystem(ITEM_SYSTEM).update(this.player)
            this.registry.getSystem(STATE_SYSTEM).update(this.eventBus)


            // Clear certain events
            if (this.eventBus[this.player.id][GROUNDCOLLISION]) {
                this.eventBus[this.player.id][GROUNDCOLLISION]()
            }

        }


    }



    render = () => {
        if (!this.isPaused) {
            this.registry.getSystem(RENDER_SYSTEM).update(this.isDebug, this.eventBus);
        }
    }



    handleUserInput = (e) => {
        /*
            {
                key: string
                type: string
            }

        */

        const { key, type } = e;

        console.log("Key : ", key)

        if (this.player) {
            const { id } = this.player;
            const RigidBody = Registry.getComponent(RIGIDBODY, id);
            const State = Registry.getComponent(STATE, id);
            const Animation = Registry.getComponent(ANIMATION, id);
            if (type === "keydown") {

                switch (key) {
                    case "ArrowUp": {

                        break;
                    }
                    case "ArrowLeft": {

                        Animation.direction = LEFT


                        if (this.eventBus[id][GROUNDCOLLISION] && State.currentState && State.currentState.name !== JUMPING && State.currentState.name !== DASHING && State.currentState.name !== ADDVELOCITYLEFT) {
                            if (!this.eventBus[id][RUNNING]) {
                                this.eventBus[id][RUNNING] = () => { }
                            }
                            this.eventBus[id][CHANGESTATE](new RunningState(0), id)
                        }
                        else {
                            if (!this.eventBus[id][ADDVELOCITYLEFT]) {
                                RigidBody.velocity.x -= 50;

                            }
                            this.eventBus[id][ADDVELOCITYLEFT] = () => { }
                            // this.eventBus[id][CHANGESTATE](new AddVelocityState(), id)

                        }

                        break;
                    }

                    case "ArrowDown": {

                        break;
                    }
                    case "ArrowRight": {
                        Animation.direction = RIGHT



                        if (this.eventBus[id][GROUNDCOLLISION] && State.currentState && State.currentState.name !== JUMPING && State.currentState.name !== DASHING && State.currentState.name !== ADDVELOCITYRIGHT) {
                            if (!this.eventBus[id][RUNNING]) {
                                this.eventBus[id][RUNNING] = () => { }
                            }
                            this.eventBus[id][CHANGESTATE](new RunningState(0), id)
                        } else {
                            if (!this.eventBus[id][ADDVELOCITYRIGHT]) {
                                RigidBody.velocity.x += 50;

                            }
                            this.eventBus[id][ADDVELOCITYRIGHT] = () => { }
                            // this.eventBus[id][CHANGESTATE](new AddVelocityState(), id)
                        }

                        break
                    }
                    case "g": {
                        this.isDebug = !this.isDebug;
                        break;
                    }
                    case "v": {
                        if (State.currentState && State.currentState.name !== DASHING && !this.eventBus[id][ADDVELOCITYLEFT] && !this.eventBus[id][ADDVELOCITYRIGHT])
                            this.eventBus[id][CHANGESTATE](new DashingState(), id)
                        break;
                    }
                    case "c": {

                        if (this.eventBus[id][GROUNDCOLLISION]) {
                            // jump
                            this.eventBus[id][CHANGESTATE](new JumpingState(), id)
                        }
                        break;
                    }
                    case "p": {
                        this.isPaused = !this.isPaused;
                        break;
                    }

                    default: {
                        break;
                    }
                }

            }
            else if (type === "keyup") {
                switch (key) {
                    case "ArrowUp": {

                        break;
                    }
                    case "ArrowDown": {
                        break;
                    }
                    case "ArrowLeft": {
                        if (this.eventBus[id][RUNNING]) {
                            delete this.eventBus[id][RUNNING]
                        }
                        if (this.eventBus[id][ADDVELOCITYLEFT]) {
                            delete this.eventBus[id][ADDVELOCITYLEFT]
                        }

                        this.eventBus[id][CHANGESTATE](new StandingState(), id)
                        // State.currentState = { STANDING: 0 };
                        // State.currentState.standing = 0;
                        // State.currentState.running = null;
                        break;
                    }
                    case "ArrowRight": {
                        if (this.eventBus[id][RUNNING]) {
                            delete this.eventBus[id][RUNNING]
                        }
                        if (this.eventBus[id][ADDVELOCITYRIGHT]) {
                            delete this.eventBus[id][ADDVELOCITYRIGHT]
                        }

                        this.eventBus[id][CHANGESTATE](new StandingState(), id)

                        // State.currentState.standing = 0;
                        // State.currentState.running = null;

                        break;
                    }
                    case "v": {

                        break;
                    }
                    case "c": {
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }
        }
    }

    loadAssets = () => {

        // Load Megaman X assets to be used in Animations
        const modes = [RUNNING, STANDING, JUMPING, DASHING];
        const directions = [LEFT, RIGHT]
        const basePath = "./assets/MegamanX/";

        for (let mode of modes) {
            for (let direction of directions) {
                let counter = 0;
                let endPath = ''
                let terminatingValue = undefined;
                if (mode === RUNNING) terminatingValue = RUNNINGFRAMES;
                else if (mode === JUMPING) terminatingValue = JUMPINGFRAMES;
                else if (mode === STANDING) terminatingValue = STANDINGFRAMES
                else if (mode === DASHING) terminatingValue = DASHINGFRAMES
                while (counter < terminatingValue) {
                    endPath = `${mode}/${direction}/${counter}`;
                    const newAsset = new Image();
                    newAsset.src = basePath + endPath + ".png";
                    this.assets[MEGAMAN][mode][direction].push(newAsset)
                    counter++;
                }

            }
        }
    }

}


const game = new Game();
game.initialize();
game.run();


