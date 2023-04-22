import { Entity } from "./Entity.js";
import { TransitionComponent, CharacterComponent, PositionComponent, SpriteComponent, MovementComponent, AnimationComponent, CollisionComponent, PlayerComponent, ActionableComponent, HitboxComponent, NodeComponent, HealthComponent } from "./Component.js";
import { AnimationSystem, ActionableSystem, CollisionSystem, MovementSystem, RenderSystem, TransitionSystem, HitboxSystem, DamageSystem } from "./System.js"




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
    createEntity = (components) => {
        const newEntity = new Entity(this.numberOfEntities++, this);
        let newEntityComponents = {}
        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            switch (component["name"]) {
                case "Position": {
                    const componentObj = component["value"];
                    newEntityComponents["Position"] = new PositionComponent(component["name"], componentObj);
                    break;
                }
                case "Movement": {
                    const componentObj = component["value"];
                    newEntityComponents["Movement"] = new MovementComponent(component["name"], componentObj);
                    break;
                }
                case "Sprite": {
                    const componentObj = component["value"];
                    newEntityComponents["Sprite"] = new SpriteComponent(component["name"], componentObj);
                    break;
                }
                case "Animation": {
                    const componentObj = component["value"];
                    newEntityComponents["Animation"] = new AnimationComponent(component["name"], componentObj);
                    break;
                }
                case "Player": {
                    const componentObj = component["value"];
                    newEntityComponents["Player"] = new PlayerComponent(component["name"], componentObj);
                    break;
                }
                case "Collision": {
                    const componentObj = component["value"];
                    newEntityComponents["Collision"] = new CollisionComponent(component["name"], componentObj);
                    break;
                }
                case "Transition": {
                    const componentObj = component["value"];
                    newEntityComponents["Transition"] = new TransitionComponent(component["name"], componentObj);
                    break;
                }
                case "Character": {
                    const componentObj = component["value"];
                    newEntityComponents["Character"] = new CharacterComponent(component["name"], componentObj);
                    break;
                }
                case "Actionable": {

                    const componentObj = component["value"];
                    newEntityComponents["Actionable"] = new ActionableComponent(component["name"], componentObj);
                    break;
                }
                case "Hitbox": {
                    const componentObj = component["value"];
                    newEntityComponents["Hitbox"] = new HitboxComponent(component["name"], componentObj);
                    break;
                }
                case "Health": {
                    const componentObj = component["value"];
                    newEntityComponents["Health"] = new HealthComponent(component["name"], componentObj);
                    break;
                }

                case "Node": {
                    const componentObj = component["value"];

                    newEntityComponents["Node"] = new NodeComponent(component["name"], componentObj);
                    break;
                }

                default:
                    break;
            }
        }


        // TODO: THIS IS WHAT MUST BE CHANGED
        newEntity.components = newEntityComponents;
        this.entitiesToBeAdded.push(newEntity);

        return newEntity;
    }

    // 2
    // systemType string : RenderSystem, VelocitySystem, etc
    addSystem = (systemType) => {
        let newSystem;
        switch (systemType) {
            case "RenderSystem": {
                newSystem = new RenderSystem(systemType);
                break;
            }
            case "AnimationSystem": {
                newSystem = new AnimationSystem(systemType);
                break;
            }
            case "CollisionSystem": {
                newSystem = new CollisionSystem(systemType);
                break;
            }
            case "MovementSystem": {
                newSystem = new MovementSystem(systemType);
                break;
            }
            case "TransitionSystem": {
                newSystem = new TransitionSystem(systemType);
                break;
            }
            case "ActionableSystem": {
                newSystem = new ActionableSystem(systemType);
                break;
            }
            case "DamageSystem": {
                newSystem = new DamageSystem(systemType);
                break;
            }
            case "HitboxSystem": {
                newSystem = new HitboxSystem(systemType);
                break;
            }
            default: {
                break;
            }
        }
        this.systems[systemType] = newSystem;
    }

    //4
    // entity : Entity
    addEntityToSystem = (entity) => {

        Object.values(this.systems).forEach((system) => {
            let addToSystem = true;

            const componentRequirements = system["componentRequirements"];

            for (let i = 0; i < componentRequirements.length; i++) {
                const req = componentRequirements[i];
                // TODO: THIS MUST BE CHANGED, ENTITY CANNOT HAVE COMPONENTS 
                if (entity.components[req] === undefined) {
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

export { Registry };