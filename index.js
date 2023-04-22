import Registry from "./classes/Registry.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HEALTH_SYSTEM, HITBOX_SYSTEM, ITEM_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, TRANSITION_SYSTEM } from "./constants/SystemConstants.js";
import { CreatePositionComponent, CreateSpriteComponent } from "./utilities/CreateComponents.js";

export const canvas = document.getElementById("gameScreen");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

export const c = canvas.getContext("2d");
export const TILE_SIZE = 70



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


        const p = CreatePositionComponent(50, 50, 50, 50);
        const s = CreateSpriteComponent("./assets/X-sprites.png", p.value);

        const Entity = this.registry.createEntity([p, s]);


        console.log(this.registry.componentEntityMapping)
    }

    update = () => {

        this.gameTime = Date.now();

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


            this.registry.getSystem(ANIMATION_SYSTEM).update(this.gameTime);
            this.registry.getSystem(COLLISION_SYSTEM).update(this.player)
            this.registry.getSystem(MOVEMENT_SYSTEM).update()
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


        requestAnimationFrame(this.update)
    }



    render = () => {
        if (!this.isPaused) {
            this.registry.getSystem(RENDER_SYSTEM).update(this.isDebug, this.eventBus);
        }
        requestAnimationFrame(this.render);
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
            if (type === "keydown") {

                switch (key) {
                    case "w": {

                        break;
                    }
                    case "a": {

                        break;
                    }

                    case "s": {

                        break;
                    }
                    case "d": {

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
                        break;
                    }
                    case "d": {
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
game.update();
game.render();

