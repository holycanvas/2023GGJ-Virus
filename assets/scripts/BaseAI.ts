import { _decorator, Component, Node, RigidBody, Vec3, math } from 'cc';
import { Ball } from './Ball';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BaseAI')
export class BaseAI extends Ball {
    protected _speed: Vec3 = new Vec3(math.randomRange(-1, 1), math.randomRange(-1, 1));

    start() {
        super.start();
        this.move();
    }
    move() {
        this._rigidBody.setLinearVelocity(this._speed);
    }
    update(deltaTime: number) {

    }
}


