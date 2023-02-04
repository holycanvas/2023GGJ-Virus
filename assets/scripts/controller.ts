import { _decorator, Component, Node, input, Input, EventKeyboard, KeyCode, Vec3, Vec2, RigidBody, CCFloat, EventMouse, Camera, find, Collider, ITriggerEvent, Vec4 } from 'cc';
import { Ball, BallType } from './Ball';
import { LevelManager } from './LevelManager';
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
    public operationStrength = 100;
    public isOperating = false;

    private _moveState = new Vec4();
    private _ball: Ball | null = null;
    
    public static instance:Controller;
    onLoad(){
        Controller.instance = this;
        this._ball = this.getComponent(Ball);
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
        if (this._ball.ballType === BallType.cured) {
            LevelManager.instance.uiManager.onDead();
            return;
        }
        this.mainCamera.screenToWorld(this.mousePosition, this.operationDirection);
        this.operationDirection.subtract(this.node.worldPosition);
        this.operationDirection.z = 0;
        this.operationDirection.normalize();
        this.indicator.eulerAngles = new Vec3(this.indicator.eulerAngles.z, Math.atan2(this.operationDirection.y, this.operationDirection.x) * (180 / Math.PI),this.indicator.eulerAngles.z);
        this.direction.y = this._moveState.x + this._moveState.y;
        this.direction.x = this._moveState.z + this._moveState.w;
        if (!this.direction.equals(Vec3.ZERO)) {
            this.rigidBody.applyImpulse(Vec3.multiplyScalar(new Vec3(), this.direction.normalize(), this.speed * deltaTime));
        }
    }

    onKeyDown (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this._moveState.x = 1;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this._moveState.y = -1;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this._moveState.z = -1;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this._moveState.w = 1;
        } else if (event.keyCode === KeyCode.KEY_Q) {
            this.isOperating = true;
            this.isOperationPull = true;
        } else if (event.keyCode === KeyCode.KEY_E) {
            this.isOperating = true;
            this.isOperationPull = false;
        }
    }

    onKeyUp (event: EventKeyboard) {
        if (event.keyCode === KeyCode.KEY_W) {
            this._moveState.x = 0;
        } else if (event.keyCode === KeyCode.KEY_S) {
            this._moveState.y = 0;
        } else if (event.keyCode === KeyCode.KEY_A) {
            this._moveState.z = 0;
        } else if (event.keyCode === KeyCode.KEY_D) {
            this._moveState.w = 0;
        } else if (event.keyCode === KeyCode.KEY_Q || event.keyCode === KeyCode.KEY_E) {
            this.isOperating = false;
        }
    }

    onMouseDown (event: EventMouse) {
        this.isOperating = true;
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            this.isOperationPull = true;
        } else if (event.getButton() === EventMouse.BUTTON_RIGHT) {
            this.isOperationPull = false;
        }
    }

    onMouseUp (event: EventMouse) {
        this.isOperating = false;
    }

    onOperation (event: ITriggerEvent) {
        if (!this.isOperating) return;
        const direction = new Vec3();
        if (this.isOperationPull) {
            Vec3.subtract(direction, event.selfCollider.node.worldPosition, event.otherCollider.node.worldPosition);
        } else {
            Vec3.subtract(direction, event.otherCollider.node.worldPosition, event.selfCollider.node.worldPosition);
        }
        direction.z = 0;
        const length = Math.max(direction.length(), 1);
        direction.normalize();
        event.otherCollider.getComponent(RigidBody).applyForce(direction.multiplyScalar(this.operationStrength / length));
    }

    onMouseMove (event: EventMouse) {
        event.getLocation(this.mousePosition);
    }
}

