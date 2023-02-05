import { _decorator, Component, Node, Collider, CCFloat, RigidBody, Vec3, js, clamp, Line, CurveRange, Prefab, instantiate, UITransform } from 'cc';
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


    private _springMaps = new Set();
    @property(Prefab)
    public linePrefab
    protected lines: Node[] = [];
    static tempVec3 = new Vec3();
    @property(Node)
    normalCellContainer: Node;
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
            const line: Node = this.lines[i] ??= instantiate(this.linePrefab);
            this.normalCellContainer.addChild(line);
            line.setWorldPosition(Vec3.add(TestSpring.tempVec3, rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition).multiplyScalar(50).add3f(240, 0, 0));
            const sub = Vec3.subtract(TestSpring.tempVec3, rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition).clone().normalize();
            line.getComponent(UITransform).setContentSize(Vec3.len(Vec3.subtract(TestSpring.tempVec3, rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition)) * 20, 4);
            line.eulerAngles = new Vec3(line.eulerAngles.x, line.eulerAngles.y, Math.atan2(sub.y, sub.x) * (180 / Math.PI));
            //@ts-expect-error
            window.aaa = line
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
                    this.lines[i].removeFromParent()
                    js.array.fastRemoveAt(this.lines, i);
                }
            }
        }

    }
}

