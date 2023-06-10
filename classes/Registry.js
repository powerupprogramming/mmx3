import { Entity } from "./Entity.js";
import { StateComponent, TransitionComponent, PositionComponent, SpriteComponent, RigidbodyComponent, AnimationComponent, CollisionComponent, ActionableComponent, HitboxComponent, HealthComponent, ItemDropComponent, ItemComponent, CameraComponent } from "./Component.js";
import { AnimationSystem, ActionableSystem, CollisionSystem, MovementSystem, RenderSystem, TransitionSystem, HitboxSystem, HealthSystem, ItemSystem, StateSystem } from "./System.js"
import { ACTIONABLE, ANIMATION, CHARACTER, COLLISION, HEALTH, HITBOX, RIGIDBODY, ITEM, ITEMDROP, POSITION, SPRITE, TRANSITION, STATE, CAMERA } from "../constants/ComponentConstants.js";
import { ACTIONABLE_SYSTEM, ANIMATION_SYSTEM, COLLISION_SYSTEM, HITBOX_SYSTEM, MOVEMENT_SYSTEM, RENDER_SYSTEM, TRANSITION_SYSTEM, HEALTH_SYSTEM, ITEM_SYSTEM, STATE_SYSTEM } from "../constants/SystemConstants.js";




class Registry {

    static componentEntityMapping = {}
    static systems = {}               // object { name (string) : RenderSystem,VelocitySystem, etc (string) }

    constructor() {
        this.numberOfEntities = 0;
        this.entitiesToBeAdded = [];    // entities[]
        this.entitiesToBeKilled = []    // entities[]
        this.entityToComponents = {}
        /*
        1st key indice is entity id, second 
        {
            0: {
                POSITION: true,
                SPRITE: true
            }
        }       

        */
        /*
        Fixed array length for components - 1st order
        map for second order
            {
                "Position": {
                    1: PositionComponent
                }
            }
        */


    }

    //3
    update = () => {

        for (let entity of this.entitiesToBeAdded) {
            this.addEntityToSystem(entity);
        }

        this.entitiesToBeAdded = [];


        for (let entityToBeKilled of this.entitiesToBeKilled) {
            // remove entities from systenm
            for (let system of Object.values(Registry.systems)) {


                for (let i = 0; i < system.entities.length; i++) {

                    system.entities = system.entities.filter((entity) => entity.id !== entityToBeKilled.id);

                }

            }

            // must destroy the components that belong to each entity
            // Go through each component it has
            // key is component constant


            for (let key of Object.keys(this.entityToComponents[entityToBeKilled.id])) {
                delete Registry.componentEntityMapping[key][entityToBeKilled.id];
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

    createEntity = (components, type) => {
        const newEntity = new Entity(this.numberOfEntities, this, type);
        for (let i = 0; i < components.length; i++) {

            const component = components[i];
            this.addComponentToEntity(component)
        }


        this.entitiesToBeAdded.push(newEntity);
        this.numberOfEntities++;


        const spriteComponent = Registry.getComponent(SPRITE, newEntity.id)

        if (spriteComponent.sprite.src.includes("undefined") == true) {
            const animationComponent = Registry.getComponent(ANIMATION, newEntity.id);
            if (animationComponent) {
                const { mode, direction } = animationComponent;
                if (mode)
                    spriteComponent.sprite.src = `../assets/MegamanX/${mode}/${direction}/0.png`.toLowerCase()
            }
        }

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
            case STATE_SYSTEM: {
                newSystem = new StateSystem(STATE_SYSTEM);
                break;
            }

            default: {
                break;
            }
        }
        Registry.systems[systemType] = newSystem;
    }


    addComponentToEntity = (component) => {

        const componentObj = component["value"];

        if (!this.entityToComponents[this.numberOfEntities]) {
            this.entityToComponents[this.numberOfEntities] = {}
        }
        this.entityToComponents[this.numberOfEntities][component.name] = true;


        switch (component["name"]) {
            case POSITION: {

                if (!Registry.componentEntityMapping[POSITION]) {

                    Registry.componentEntityMapping[POSITION] = {}
                }
                Registry.componentEntityMapping[POSITION][this.numberOfEntities] = new PositionComponent(POSITION, componentObj);
                break;
            }
            case RIGIDBODY: {
                if (!Registry.componentEntityMapping[RIGIDBODY]) {
                    Registry.componentEntityMapping[RIGIDBODY] = {};
                }
                // if (entity.id !== 0)
                Registry.componentEntityMapping[RIGIDBODY][this.numberOfEntities] = new RigidbodyComponent(RIGIDBODY, componentObj);

                break;
            }
            case SPRITE: {
                if (!Registry.componentEntityMapping[SPRITE]) {
                    Registry.componentEntityMapping[SPRITE] = {};
                }
                Registry.componentEntityMapping[SPRITE][this.numberOfEntities] = new SpriteComponent(SPRITE, componentObj);


                break;
            }
            case ANIMATION: {
                if (!Registry.componentEntityMapping[ANIMATION]) {
                    Registry.componentEntityMapping[ANIMATION] = {};
                }
                Registry.componentEntityMapping[ANIMATION][this.numberOfEntities] = new AnimationComponent(ANIMATION, componentObj);
                break;
            }
            case CAMERA: {
                if (!Registry.componentEntityMapping[CAMERA]) {
                    Registry.componentEntityMapping[CAMERA] = {};
                }
                Registry.componentEntityMapping[CAMERA][this.numberOfEntities] = new CameraComponent(CAMERA, componentObj);
                break;
            }
            case COLLISION: {
                if (!Registry.componentEntityMapping[COLLISION]) {
                    Registry.componentEntityMapping[COLLISION] = {};
                }
                Registry.componentEntityMapping[COLLISION][this.numberOfEntities] = new CollisionComponent(COLLISION, componentObj);
                break;
            }
            case TRANSITION: {
                if (!Registry.componentEntityMapping[TRANSITION]) {
                    Registry.componentEntityMapping[TRANSITION] = {};
                }
                Registry.componentEntityMapping[TRANSITION][this.numberOfEntities] = new TransitionComponent(TRANSITION, componentObj);
                break;
            }
            // case CHARACTER: {
            //
            //     if (!Registry.componentEntityMapping[CHARACTER]) {
            //         Registry.componentEntityMapping[CHARACTER] = {};
            //     }
            //     Registry.componentEntityMapping[CHARACTER][this.numberOfEntities] = new CharacterComponent(CHARACTER, componentObj);
            //     break;
            // }
            case ACTIONABLE: {
                if (!Registry.componentEntityMapping[ACTIONABLE]) {
                    Registry.componentEntityMapping[ACTIONABLE] = {};
                }
                Registry.componentEntityMapping[ACTIONABLE][this.numberOfEntities] = new ActionableComponent(ACTIONABLE, componentObj);
                break;
            }
            case HITBOX: {
                if (!Registry.componentEntityMapping[HITBOX]) {
                    Registry.componentEntityMapping[HITBOX] = {};
                }
                Registry.componentEntityMapping[HITBOX][this.numberOfEntities] = new HitboxComponent(HITBOX, componentObj);
                break;
            }
            case HEALTH: {
                if (!Registry.componentEntityMapping[HEALTH]) {
                    Registry.componentEntityMapping[HEALTH] = {};
                }
                Registry.componentEntityMapping[HEALTH][this.numberOfEntities] = new HealthComponent(HEALTH, componentObj);
                break;
            }

            case ITEM: {
                if (!Registry.componentEntityMapping[ITEM]) {
                    Registry.componentEntityMapping[ITEM] = {};
                }
                Registry.componentEntityMapping[ITEM][this.numberOfEntities] = new ItemComponent(ITEM, componentObj);
                break;
            }
            case ITEMDROP: {
                if (!Registry.componentEntityMapping[ITEMDROP]) {
                    Registry.componentEntityMapping[ITEMDROP] = {};
                }
                Registry.componentEntityMapping[ITEMDROP][this.numberOfEntities] = new ItemDropComponent(ITEMDROP, componentObj);
                break;
            }
            case STATE: {
                if (!Registry.componentEntityMapping[STATE]) {
                    Registry.componentEntityMapping[STATE] = {};
                }
                Registry.componentEntityMapping[STATE][this.numberOfEntities] = new StateComponent(STATE, componentObj)
                break;
            }




            default: {
                break;
            }



        }

        // console.log("This componentEntityMapping was updated for component: ", component["name"], " and id: ", this.numberOfEntities, " here is final result: ", Registry.componentEntityMapping)

    }

    //4
    // entity : Entity
    addEntityToSystem = (entity) => {


        Object.values(Registry.systems).forEach((system) => {
            let addToSystem = true;

            const componentRequirements = system["componentRequirements"];

            for (let i = 0; i < componentRequirements.length; i++) {
                const req = componentRequirements[i];           // req is name of component like RIGIDBODY or NODE
                const entityId = entity.id;
                if (Registry.componentEntityMapping[req] === undefined || Registry.componentEntityMapping[req][entityId] === undefined) {
                    addToSystem = false;
                    break;
                }

            }
            if (addToSystem) {
                system.entities.push(entity);
                // reorder 
                if (system.systemType === RENDER_SYSTEM) system.reorderEntities();

            }
        })
    }

    // 5
    // returns System
    // systemType: string
    static getSystem = (systemType) => {
        return Registry.systems[systemType];
    }

    static getComponent = (componentType, entityId) => {


        if (Registry.componentEntityMapping[componentType]) {
            return Registry.componentEntityMapping[componentType][entityId];
        } else {

            return undefined;
        }
    }


    removeAllEntities = () => {
        Object.values(Registry.systems).forEach((system) => {
            system.removeAllEntities();
        })
    }
}

export default Registry;