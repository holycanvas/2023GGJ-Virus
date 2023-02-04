import { _decorator, Component, Node, Prefab, instantiate, find, Vec3, Vec2, CCInteger } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {

    @property(Prefab)
    public normalCell: Prefab | null = null;

    @property(CCInteger)
    public normalCellNum = 500;

    @property(Vec2)
    public normalCellRange = new Vec2(100, 100);

    start () {
        const normalCellContainer = find('NormalCellContainer');
        for (let i = 0; i < this.normalCellNum; i++) {
            const node = instantiate(this.normalCell);
            normalCellContainer.addChild(node);
            node.position = new Vec3(Math.random() * this.normalCellRange.x - this.normalCellRange.x / 2, 
                Math.random() * this.normalCellRange.y - this.normalCellRange.y / 2, 0);
        }
    }

    update(deltaTime: number) {
        
    }
}

