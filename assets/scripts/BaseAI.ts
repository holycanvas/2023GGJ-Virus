import { _decorator, Component, Node, RigidBody, Vec3, math } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('BaseAI')
@requireComponent(RigidBody)
export class BaseAI extends Component {
    protected _speed: Vec3 = new Vec3(math.randomRange(-1, 1), math.randomRange(-1, 1));
    protected _rigidBody!:RigidBody

    start() {
        this._rigidBody = this.getComponent(RigidBody);
    }
    move() {
        this._rigidBody.setLinearVelocity(this._speed);
    }
    update(deltaTime: number) {

    }
}


