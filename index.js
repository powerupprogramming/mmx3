import Registry from "./classes/Registry.js";
import { RUNNING, STANDING } from "./constants/AnimationComponentConstants.js";
import { ANIMATION, RIGIDBODY } from "./constants/ComponentConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HEALTH_SYSTEM, HITBOX_SYSTEM, ITEM_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, TRANSITION_SYSTEM } from "./constants/SystemConstants.js";
import { CreateCollisionComponent, CreateMegamanXAnimationComponent, CreateRigidbodyComponent, CreatePositionComponent, CreateSpriteComponent } from "./utilities/CreateComponents.js";

export const canvas = document.getElementById("gameScreen");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const c = canvas.getContext("2d");
export const TILE_SIZE = 70


const FPS = 60;
export const MILLISECONDS_PER_FRAME = 1000 / FPS           // for 60 frame a second, its 16.666 MILLISECONDS per frame
export const PIXELS_PER_METER = 50;


class Game {

    constructor() {
        this.player = undefined;
        this.registry = new Registry();
        this.gameTime = Date.now();
        // this.numRows = 13;
        // this.numCols = 18;
        this.isDebug = false;
        this.eventBus = [];
        this.audioObject = undefined;
        // this.inventoryScreen = new InventoryScreen();
        this.audioPath = "";
        this.isPaused = false;
        this.deltaTime = 0;
        this.millisecondsPreviousFrame = 0;
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

        document.addEventListener("keyup", this.handleUserInput)
        document.addEventListener("keydown", this.handleUserInput)


        const p = CreatePositionComponent(250, 50, 50, 50);
        const s = CreateSpriteComponent("./assets/X-sprites.png", { x: 0, y: 60, width: 50, height: 50 });
        const a = CreateMegamanXAnimationComponent();
        const m = CreateRigidbodyComponent(0, 0, 0, 0, 0, 0, 85);         // in kg
        const c = CreateCollisionComponent();

        this.player = this.registry.createEntity([p, s, a, m, c]);

        for (let i = 0; i < 5; i++) {
            const xVal = i * 50 + 200;
            const newP = CreatePositionComponent(xVal, 400, 50, 50);
            this.registry.createEntity([newP, s, c]);
        }

        const p2 = CreatePositionComponent(400, 100, 50, 50);
        this.registry.createEntity([p2, s, c]);

        const p3 = CreatePositionComponent(250, 100, 50, 50);
        this.registry.createEntity([p3, s, c]);



    }


    run = () => {
        let timeToWait = MILLISECONDS_PER_FRAME - (Date.now() - this.millisecondsPreviousFrame);
        if (timeToWait > 0 && timeToWait <= MILLISECONDS_PER_FRAME) {
            // TODO: Throttle game
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
            // console.log("NOT: ", timeToWait)
            this.deltaTime = (Date.now() - this.millisecondsPreviousFrame) / 1000
            if (this.deltaTime > 0.033) {
                this.deltaTime = 0.033
            }
            this.millisecondsPreviousFrame = Date.now();
            this.update();
            this.render();
        }


        requestAnimationFrame(this.run)
    }

    update = () => {


        if (!this.isPaused) {

            for (let i = 0; i < this.eventBus.length; i++) {
                const event = this.eventBus[i];

                if (event) {

                    const { args, func } = event;
                    if (args.eventTime <= this.gameTime) {
                        func(args);
                        this.eventBus = this.eventBus.slice(0, i).concat(this.eventBus.slice(i + 1));
                    }
                }

            }


            this.registry.update();


            this.registry.getSystem(ANIMATION_SYSTEM).update();
            this.registry.getSystem(COLLISION_SYSTEM).update(this.player, this.deltaTime)
            this.registry.getSystem(MOVEMENT_SYSTEM).update(this.deltaTime)
            this.registry.getSystem(HITBOX_SYSTEM).update();
            this.registry.getSystem(HEALTH_SYSTEM).update(this.registry);
            this.registry.getSystem(TRANSITION_SYSTEM).update(this.player, this.eventBus, this.loadNewScreen)
            this.registry.getSystem(ACTIONABLE_SYSTEM).update(this.player, this.eventBus);
            this.registry.getSystem(ITEM_SYSTEM).update(this.player)


            // for (let i = 0; i < this.registry.enemies.length; i++) {
            //     const enemy = this.registry.enemies[i];

            //     enemy.stateMachine.update();
            // }



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

        if (this.player) {
            const RigidBody = this.player.registry.getComponent(RIGIDBODY, this.player.id);
            const Animation = this.player.registry.getComponent(ANIMATION, this.player.id);
            if (type === "keydown") {

                switch (key) {
                    case "w": {

                        break;
                    }
                    case "a": {
                        RigidBody.velocity.x = -400;
                        Animation.mode = RUNNING;
                        break;
                    }

                    case "s": {

                        break;
                    }
                    case "d": {
                        RigidBody.velocity.x = 400;
                        Animation.mode = RUNNING;
                        break

                        break;
                    }
                    case "g": {
                        this.isDebug = !this.isDebug;
                        break;
                    }
                    case "v": {

                        break;
                    }
                    case "c": {
                        // jump
                        RigidBody.velocity.y = -300;
                        break;
                    }
                    case "p": {
                        this.isPaused = !this.isPaused;
                    }

                    default: {
                        break;
                    }
                }

            }
            else if (type === "keyup") {
                switch (key) {
                    case "w": {

                        break;
                    }
                    case "s": {
                        break;
                    }
                    case "a": {
                        RigidBody.velocity.x = 0;

                        Animation.mode = STANDING;
                        break;
                    }
                    case "d": {
                        RigidBody.velocity.x = 0;

                        Animation.mode = STANDING;
                        break;
                    }
                    case "v": {

                        break;
                    }
                    case "c": {
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }


}


const game = new Game();
game.initialize();
game.run();


