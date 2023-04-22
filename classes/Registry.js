import { Entity } from "./Entity.js";
import { TransitionComponent, PositionComponent, SpriteComponent, MovementComponent, AnimationComponent, CollisionComponent, ActionableComponent, HitboxComponent, HealthComponent, ItemDropComponent, ItemComponent } from "./Component.js";
import { AnimationSystem, ActionableSystem, CollisionSystem, MovementSystem, RenderSystem, TransitionSystem, HitboxSystem, HealthSystem, ItemSystem } from "./System.js"
import { ACTIONABLE, ANIMATION, CHARACTER, COLLISION, HEALTH, HITBOX, MOVEMENT, ITEM, ITEMDROP, POSITION, SPRITE, TRANSITION } from "../constants/ComponentConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HITBOX_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, TRANSITION_SYSTEM, HEALTH_SYSTEM, ITEM_SYSTEM } from "../constants/SystemConstants.js";




class Registry {
    constructor() {
        this.numberOfEntities = 0;
        this.systems = {}               // object { name (string) : RenderSystem,VelocitySystem, etc (string) }
        this.entitiesToBeAdded = [];    // entities[]
        this.entitiesToBeKilled = []    // entities[]

        /*
        Fixed array length for components - 1st order
        map for second order
            {
                "Position": {
                    1: PositionComponent
                }
            }
        */
        this.componentEntityMapping = {}


    }

    //3
    update = () => {

        for (let entity of this.entitiesToBeAdded) {
            this.addEntityToSystem(entity);
        }

        this.entitiesToBeAdded = [];


        for (let entityToBeKilled of this.entitiesToBeKilled) {
            // remove entities from systenm
            // Go through each component it has

            for (let system of Object.values(this.systems)) {


                for (let i = 0; i < system.entities.length; i++) {

                    system.entities = system.entities.filter((entity) => entity.id !== entityToBeKilled.id);

                }

            }
        }

        this.entitiesToBeKilled = [];
    }


    //1
    /*
    component =  Array of Objects : 
    [
        { 
            name: string, componentName , 
            value: Object { 
                k: v 
            } 
        }
    ]

    */

    // components is an array
    // Currently, if entity has components that are added on later, the entity will not be put into the proper system

    createEntity = (components) => {
        const newEntity = new Entity(this.numberOfEntities, this);
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            this.addComponentToEntity(component)
        }


        this.entitiesToBeAdded.push(newEntity);
        this.numberOfEntities++;
        return newEntity;
    }

    // 2
    // systemType string : RenderSystem, VelocitySystem, etc
    addSystem = (systemType) => {
        let newSystem;
        switch (systemType) {
            case RENDER_SYSTEM: {
                newSystem = new RenderSystem(RENDER_SYSTEM);
                break;
            }
            case ANIMATION_SYSTEM: {
                newSystem = new AnimationSystem(ANIMATION_SYSTEM);
                break;
            }
            case COLLISION_SYSTEM: {
                newSystem = new CollisionSystem(COLLISION_SYSTEM);
                break;
            }
            case MOVEMENT_SYSTEM: {
                newSystem = new MovementSystem(MOVEMENT_SYSTEM);
                break;
            }
            case TRANSITION_SYSTEM: {
                newSystem = new TransitionSystem(TRANSITION_SYSTEM);
                break;
            }
            case ACTIONABLE_SYSTEM: {
                newSystem = new ActionableSystem(ACTIONABLE_SYSTEM);
                break;
            }
            case HITBOX_SYSTEM: {
                newSystem = new HitboxSystem(HITBOX_SYSTEM);
                break;
            }
            case HEALTH_SYSTEM: {
                newSystem = new HealthSystem(HEALTH_SYSTEM);
                break;
            }
            case ITEM_SYSTEM: {
                newSystem = new ItemSystem(ITEM_SYSTEM);
                break;
            }
            default: {
                break;
            }
        }
        this.systems[systemType] = newSystem;
    }


    addComponentToEntity = (component) => {
        console.log("TEST ", this.componentEntityMapping[POSITION])
        console.log("TEST ", component["name"])

        switch (component["name"]) {
            case POSITION: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[POSITION]) {

                    this.componentEntityMapping[POSITION] = {}
                }
                this.componentEntityMapping[POSITION][this.numberOfEntities] = new PositionComponent(POSITION, componentObj);
                break;
            }
            case MOVEMENT: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[MOVEMENT]) {
                    this.componentEntityMapping[MOVEMENT] = {};
                }
                this.componentEntityMapping[MOVEMENT][this.numberOfEntities] = new MovementComponent(MOVEMENT, componentObj);
                break;
            }
            case SPRITE: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[SPRITE]) {
                    this.componentEntityMapping[SPRITE] = {};
                }
                this.componentEntityMapping[SPRITE][this.numberOfEntities] = new SpriteComponent(SPRITE, componentObj);
                break;
            }
            case ANIMATION: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[ANIMATION]) {
                    this.componentEntityMapping[ANIMATION] = {};
                }
                this.componentEntityMapping[ANIMATION][this.numberOfEntities] = new AnimationComponent(ANIMATION, componentObj);
                break;
            }
            // case PLAYER: {
            //     const componentObj = component["value"];
            //     if (!this.componentEntityMapping[PLAYER]) {
            //         this.componentEntityMapping[PLAYER] = {};
            //     }
            //     this.componentEntityMapping[PLAYER][this.numberOfEntities] = new PlayerComponent(PLAYER, componentObj);
            //     break;
            // }
            case COLLISION: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[COLLISION]) {
                    this.componentEntityMapping[COLLISION] = {};
                }
                this.componentEntityMapping[COLLISION][this.numberOfEntities] = new CollisionComponent(COLLISION, componentObj);
                break;
            }
            case TRANSITION: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[TRANSITION]) {
                    this.componentEntityMapping[TRANSITION] = {};
                }
                this.componentEntityMapping[TRANSITION][this.numberOfEntities] = new TransitionComponent(TRANSITION, componentObj);
                break;
            }
            case CHARACTER: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[CHARACTER]) {
                    this.componentEntityMapping[CHARACTER] = {};
                }
                this.componentEntityMapping[CHARACTER][this.numberOfEntities] = new CharacterComponent(CHARACTER, componentObj);
                break;
            }
            case ACTIONABLE: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[ACTIONABLE]) {
                    this.componentEntityMapping[ACTIONABLE] = {};
                }
                this.componentEntityMapping[ACTIONABLE][this.numberOfEntities] = new ActionableComponent(ACTIONABLE, componentObj);
                break;
            }
            case HITBOX: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[HITBOX]) {
                    this.componentEntityMapping[HITBOX] = {};
                }
                this.componentEntityMapping[HITBOX][this.numberOfEntities] = new HitboxComponent(HITBOX, componentObj);
                break;
            }
            case HEALTH: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[HEALTH]) {
                    this.componentEntityMapping[HEALTH] = {};
                }
                this.componentEntityMapping[HEALTH][this.numberOfEntities] = new HealthComponent(HEALTH, componentObj);
                break;
            }

            case ITEM: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[ITEM]) {
                    this.componentEntityMapping[ITEM] = {};
                }
                this.componentEntityMapping[ITEM][this.numberOfEntities] = new ItemComponent(ITEM, componentObj);
                break;
            }
            case ITEMDROP: {
                const componentObj = component["value"];
                if (!this.componentEntityMapping[ITEMDROP]) {
                    this.componentEntityMapping[ITEMDROP] = {};
                }
                this.componentEntityMapping[ITEMDROP][this.numberOfEntities] = new ItemDropComponent(ITEMDROP, componentObj);
                break;
            }




            default: {
                break;
            }



        }

        console.log("This componentEntityMapping was updated for component: ", component["name"], " and id: ", this.numberOfEntities, " here is final result: ", this.componentEntityMapping)

    }

    //4
    // entity : Entity
    addEntityToSystem = (entity) => {

        Object.values(this.systems).forEach((system) => {
            let addToSystem = true;

            const componentRequirements = system["componentRequirements"];

            for (let i = 0; i < componentRequirements.length; i++) {
                const req = componentRequirements[i];           // req is name of component like MOVEMENT or NODE
                const entityId = entity.id;
                console.log("SYSTEM: ", system)
                console.log("adf; ", req)
                console.log("ddd; ", this.componentEntityMapping[req])
                if (this.componentEntityMapping[req] === undefined || this.componentEntityMapping[req][entityId] === undefined) {
                    addToSystem = false;
                    break;
                }

            }
            if (addToSystem) {
                system.entities.push(entity);
            }
        })
    }

    // 5
    // returns System
    // systemType: string
    getSystem = (systemType) => {
        return this.systems[systemType];
    }


    removeAllEntities = () => {
        Object.values(this.systems).forEach((system) => {
            system.removeAllEntities();
        })
    }
}

export default Registry;