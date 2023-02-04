import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, Vec3, Vec2, RigidBody, CCFloat, EventMouse, Camera, find, Collider, ITriggerEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Controller')
export class Controller extends Component {
    private direction = new Vec3();
    private speed = 15;
    private rigidBody: RigidBody | null = null;
    private mainCamera: Camera | null = null;
    private operationDirection = new Vec3();
    private isOperationPull = true;
    private mousePosition = new Vec3;
    private collider: Collider | null = null;
    @property({ type: CCFloat, slide: true, range: [0, 50]})
    public operationRadius = 30;
    @property({ type: CCFloat, slide: true, range: [0, 180]})
    public operationTheta = 60;
    @property(Node)
    public indicator: Node | null = null;
    public operationSpeed = .5;
    
    public static instance:Controller;
    onLoad(){
        Controller.instance = this;
    }
    start() {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);
        this.rigidBody = this.getComponent(RigidBody);
        this.mainCamera = find('Main Camera').getComponent(Camera);
        this.collider = this.indicator.getComponentInChildren(Collider);
        this.collider.on('onTriggerStay', this.onOperation, this);
    }

    update(deltaTime: number) {
        this.mainCamera.screenToWorld(this.mousePosition, this.operationDirection);
        this.operationDirection.subtract(this.node.worldPosition);
        this.operationDirection.z = 0;
        this.operationDirection.normalize();
        this.indicator.eulerAngles = new Vec3(this.indicator.eulerAngles.z, Math.atan2(this.operationDirection.y, this.operationDirection.x) * (180 / Math.PI),this.indicator.eulerAngles.z);
        this.rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), Vec3.normalize(new Vec3(), this.direction), this.speed * deltaTime));
    }

    onKeyDown (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this.direction.y += 1;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this.direction.y -= 1;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this.direction.x -= 1;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this.direction.x += 1;
        }
    }

    onKeyUp (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this.direction.y -= 1;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this.direction.y += 1;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this.direction.x += 1;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this.direction.x -= 1;
        }
    }

    onMouseDown (event: EventMouse) {
        this.collider.enabled = true;
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            this.isOperationPull = true;
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this.isOperationPull = false;
        }
    }

    onMouseUp (event: EventMouse) {
        this.collider.enabled = false;
    }

    onOperation (event: ITriggerEvent) {
        const direction = new Vec3();
        if (this.isOperationPull) {
            Vec3.subtract(direction, event.selfCollider.node.worldPosition, event.otherCollider.node.worldPosition);
        } else {
            Vec3.subtract(direction, event.otherCollider.node.worldPosition, event.selfCollider.node.worldPosition);
        }
        direction.z = 0;
        const length = Math.max(direction.length(), 1);
        direction.normalize();
        event.otherCollider.getComponent(RigidBody).applyImpulse(direction.multiplyScalar(this.operationSpeed / length));
    }

    onMouseMove (event: EventMouse) {
        event.getLocation(this.mousePosition);
    }
}

