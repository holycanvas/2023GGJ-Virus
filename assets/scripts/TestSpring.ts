import { _decorator, Component, Node, Collider, CCFloat, RigidBody, Vec3, js, clamp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestSpring')
export class TestSpring extends Component {
    @property([RigidBody])
    public springs: RigidBody[] = [];

    @property(CCFloat)
    public springStrength = 1;

    @property(CCFloat)
    public max = 2;

    @property(CCFloat)
    public min = 1;

    @property(CCFloat)
    public maxDistance = 5;

    start() {

    }

    update(deltaTime: number) {
        const middle = (this.max + this.min) / 2;
        const range = (this.max - this.min) / 2;
        const directionA = new Vec3();
        for (let i = this.springs.length - 1; i >= 0; i -= 2) {
            const rigidBodyA = this.springs[i];
            const rigidBodyB = this.springs[i - 1];
            const distance = Vec3.distance(rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition);
            if (distance >= this.maxDistance) {
                js.array.fastRemoveAt(this.springs, i);
                js.array.fastRemoveAt(this.springs, i - 1);
                continue;
            }
            Vec3.subtract(directionA, rigidBodyB.node.worldPosition, rigidBodyA.node.worldPosition);
            directionA.z = 0;
            directionA.normalize();
            const force = directionA.multiplyScalar(clamp(distance - middle, range, -range) / range * this.springStrength);
            rigidBodyA.applyForce(force);
            rigidBodyB.applyForce(force.negative());
        }
    }
}

