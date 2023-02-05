import { _decorator, Component, Node, Prefab, instantiate, find, Vec3, Vec2, CCInteger, Material, RigidBody, js } from 'cc';
import { BorderController } from './BorderController';
import { TestSpring } from './TestSpring';
import { UIManager } from './UIManager';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {
    public static instance: LevelManager;
    @property(Prefab)
    public normalCell: Prefab | null = null;

    @property(CCInteger)
    public normalCellNum = 500;

    @property(Vec2)
    public normalCellRange = new Vec2(100, 100);
    @property(Prefab)
    public defenderCell: Prefab | null = null;
    @property(CCInteger)
    public defenderNum = 500;

    @property(Vec2)
    public defenderRange = new Vec2(100, 100);

    @property(Vec2)
    public defenderSafeRange = new Vec2(50, 50);
    @property(Material)
    public virusMaterial = null;

    @property(Material)
    public normalMaterial = null;

    @property(Material)
    public curedMaterial = null;

    @property(Material)
    public defenderMaterial = null;

    public springManager: TestSpring | null = null;
    public uiManager: UIManager | null = null;
    public normalCellContainer;
    public affectedNum:number = 0;


    @property(Prefab)
    upborder: Prefab;
    @property(Prefab)
    bottomborder: Prefab;
    @property(Prefab)
    leftborder: Prefab;
    @property(Prefab)
    rightborder: Prefab;

    generateBorders(){
        const scene = this.node.scene;
        const up = instantiate(this.upborder);
        scene.addChild(up);
        up.setPosition(0, this.normalCellRange.y/2, 0);
        const bottom = instantiate(this.bottomborder);
        scene.addChild(bottom);
        bottom.setPosition(0, -this.normalCellRange.y/2, 0);
        const left = instantiate(this.leftborder);
        scene.addChild(left);
        left.setPosition(-this.normalCellRange.x/2, 0, 0);
        const right = instantiate(this.rightborder);
        scene.addChild(right);
        right.setPosition(this.normalCellRange.x/2, 0, 0);  
    }


    onLoad () {
        LevelManager.instance = this;
        this.generateBorders();
        this.normalCellContainer = find('NormalCellContainer');
        this.springManager = this.getComponent(TestSpring);
        this.uiManager = find('Canvas').getComponent(UIManager);
    }
    start() {
        
        for (let i = 0; i < this.normalCellNum; i++) {
            const node = instantiate(this.normalCell);
            this.normalCellContainer.addChild(node);
            node.position = new Vec3(Math.random() * this.normalCellRange.x - this.normalCellRange.x / 2,
                Math.random() * this.normalCellRange.y - this.normalCellRange.y / 2, 0);
        }
        const defenderCellContainer = find('DefenderCellContainer');
        for (let i = 0; i < this.defenderNum; i++) {
            const node = instantiate(this.defenderCell);
            defenderCellContainer.addChild(node);
            const xValue = Math.random() * this.defenderRange.x - this.defenderRange.x / 2
            const isXNagetive = xValue < 0;
            const yValue = Math.random() * this.defenderRange.y - this.defenderRange.y / 2
            const isYNagetive = yValue < 0;

            node.position = new Vec3(
                isXNagetive ? xValue - this.defenderSafeRange.x : xValue + this.defenderSafeRange.x,
                isYNagetive ? yValue - this.defenderSafeRange.y : yValue + this.defenderSafeRange.y
            );
        }
    }

    update(deltaTime: number) {

    }





}

