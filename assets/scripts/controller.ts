import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, Vec3, Vec2, RigidBody } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {
    private direction = new Vec3();
    private speed = 3;
    private rigidBody: RigidBody | null = null;
    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        this.rigidBody = this.getComponent(RigidBody);
    }

    update(deltaTime: number) {
        this.rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), Vec3.normalize(new Vec3(), this.direction), this.speed * deltaTime));
        //this.node.position = Vec3.scaleAndAdd(new Vec3, this.node.position, this.direction, this.speed * deltaTime);
    }

    onKeyDown (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this.direction.y = 1;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this.direction.y = -1;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this.direction.x = -1;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this.direction.x = 1;
        }
    }

    onKeyUp (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this.direction.y = 0;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this.direction.y = 0;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this.direction.x = 0;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this.direction.x = 0;
        }
    }
}

