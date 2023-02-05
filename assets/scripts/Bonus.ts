import { _decorator, Component, Node, SpriteFrame, Sprite, Collider, ICollisionEvent } from 'cc';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

export const enum BonusType {
    POWER,
    SPEED,
    INVINCIBLE,
    COUNT,
}

@ccclass('Bonus')
export class Bonus extends Component {
    @property([SpriteFrame])
    public spriteFrames: SpriteFrame[] = [];

    public type: BonusType = BonusType.POWER;

    start() {
        this.type = Math.floor(Math.random() * BonusType.COUNT);
        this.getComponent(Sprite).spriteFrame = this.spriteFrames[this.type];
        this.getComponent(Collider).on('onCollisionEnter', this.onCollisionEnter, this);
    }

    update(deltaTime: number) {
        
    }

    onCollisionEnter (event: ICollisionEvent) {
        if (event.otherCollider.node === LevelManager.instance.virus.node) {
            LevelManager.instance.virus.addBonus(this.type);
            this.node.destroy();
        }
    }
}

