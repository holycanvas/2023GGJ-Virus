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

    private lineGroup: Node | null = null;
    start() {
        this.lineGroup = this.normalCellContainer.getChildByName('Line');
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
        if (this.lines.length > springs.length / 2) {
            for (let i = springs.length / 2 - 1; i < this.lines.length; i++) {
                this.lines[i].active = false;
            }
        } else {
            for (let i = this.lines.length; i < springs.length / 2; i++) {
                const line = instantiate(this.linePrefab);
                this.lines.push(line);
                this.lineGroup.addChild(line);
            }
        }

        for (let i = 0; i < springs.length; i += 2) {
            const rigidBodyA = springs[i];
            const rigidBodyB = springs[i + 1];
            const line: Node = this.lines[i / 2];
            line.active = true;
            line.setWorldPosition(Vec3.add(TestSpring.tempVec3, rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition).multiplyScalar(0.5));
            const sub = Vec3.subtract(new Vec3(), rigidBodyA.node.worldPosition, rigidBodyB.node.worldPosition);
            line.getComponent(UITransform).setContentSize(sub.length(), 0.1);
            line.eulerAngles = new Vec3(line.eulerAngles.x, line.eulerAngles.y, Math.atan2(sub.y, sub.x) * (180 / Math.PI));
        }

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
            }
        }

    }
}

