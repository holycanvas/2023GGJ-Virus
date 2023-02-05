import { _decorator, Component, Node, Collider, CCFloat, RigidBody, Vec3, js, clamp, Line, CurveRange } from 'cc';
import { Ball } from './Ball';
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
    add(ballOne:RigidBody,ballTwo:RigidBody){
        const springs = this.springs;
        const length = springs.length;
        springs.length += 2;
        springs[length] = ballOne;
        springs[length + 1] = ballTwo;
        const line = ballTwo.getComponent(Line) || ballOne.getComponent(Line);
        (line.positions as unknown as Vec3[]).push(ballTwo.node.worldPosition,ballOne.node.worldPosition);
        
    }
    remove(ballOne: Node) {
        const springs = this.springs;
        for (let i = springs.length - 1; i >= 0; i -= 2) {
            const rigidBodyA = springs[i];
            const rigidBodyB = springs[i - 1];
            if (rigidBodyA.node === ballOne || rigidBodyB.node === ballOne) {
                js.array.fastRemoveAt(springs, i);
                js.array.fastRemoveAt(springs, i - 1);
            }
            // 来一次超级浪费性能的遍历
            Ball.balls.forEach(item=>(item.getComponent(Line)?.positions as unknown as Vec3[])?.filter(item=>item !== ballOne.position))
        }

    }
}

