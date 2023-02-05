import { _decorator, Component, Node, RigidBody, Vec3, math, UITransform } from 'cc';
import { Ball } from './Ball';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BaseAI')
export class BaseAI extends Ball {
    protected _speed: Vec3 = new Vec3(math.randomRange(-1, 1), math.randomRange(-1, 1));
    private _velocity = new Vec3();
    private _uiTransform: UITransform | null = null;
    private _originWidth = 0;
    private _originHeight = 0;

    start() {
        super.start();
        this.move();
        this._uiTransform = this.getComponent(UITransform);
        this._originWidth = this._uiTransform.width;
        this._originHeight = this._uiTransform.height;
    }
    move() {
        // this._rigidBody.setLinearVelocity(this._speed);
    }
    update(deltaTime: number) {
        this._rigidBody.getLinearVelocity(this._velocity);
        const length = this._velocity.length();
        if (length > 10) {
            this._uiTransform.width = this._originWidth * (0.5 + 5 / length);
            this._uiTransform.height = this._originHeight * (0.5 + 5 / length);  
        }
    }
}


