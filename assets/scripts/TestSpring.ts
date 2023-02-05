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

    protected lines: Line[] = [];

    private _springMaps = new Set();

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
        const springs = this.springs;

        for (let i = springs.length - 1; i >= 0; i -= 2) {
            const rigidBodyA = springs[i];
            const rigidBodyB = springs[i - 1];
            this.lines[i] ??= this.addComponent(Line);
            const curveRange = new CurveRange();
            curveRange.constant = 0.2
            this.lines[i].width = curveRange;
            (this.lines[i].positions as Vec3[]) = [rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition];
        }
        this.springs.map(item => item.node.worldPosition);

    }
    add(ballOne:RigidBody,ballTwo:RigidBody){
        if (this._springMaps.has(ballOne.uuid + ballTwo.uuid) || this._springMaps.has(ballTwo.uuid + ballOne.uuid)) return;
        const springs = this.springs;
        const length = springs.length;
        springs.length += 2;
        springs[length] = ballOne;
        springs[length + 1] = ballTwo;
        this._springMaps.add(ballOne.uuid + ballTwo.uuid);
    }
    remove(ballOne: Node) {
        const springs = this.springs;
        for (let i = springs.length - 1; i >= 0; i -= 2) {
            const rigidBodyA = springs[i];
            const rigidBodyB = springs[i - 1];
            if (rigidBodyA.node === ballOne || rigidBodyB.node === ballOne) {
                this._springMaps.delete(rigidBodyA.uuid + rigidBodyB.uuid);
                this._springMaps.delete(rigidBodyB.uuid + rigidBodyA.uuid);
                js.array.fastRemoveAt(springs, i);
                js.array.fastRemoveAt(springs, i - 1);
                if (this.lines[i]) {
                    this.lines[i].enabled = false;
                    this.lines[i].destroy()

                }
                js.array.fastRemoveAt(this.lines, i);
            }
        }

    }
}

