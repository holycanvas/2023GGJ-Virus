import { _decorator, Component, Node, SpriteFrame, input, EventMouse, Sprite, Input, Label, Scene, director } from 'cc';
const { ccclass, property, requireComponent } = _decorator;

@ccclass('tuto')
@requireComponent(Sprite)
export class tuto extends Component {
    @property([SpriteFrame])
    public tutos;
    public labels:readonly Node[];
    public sprite;
    public next = 0;
    start() {
        this.sprite = this.getComponent(Sprite);
        input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.labels = this.node.children;
        
    }
    onMouseDown(event: EventMouse) {
        for(let label of this.labels){
            label.active = false;
        }
        
        if (event.getButton() === EventMouse.BUTTON_LEFT) {
            this.sprite.spriteFrame = this.tutos[this.next];
            this.next++;
            if(this.next==3){
                this.node.active = false;
                
                input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
                director.loadScene('MainScene');
            }
        } 
    }

    update(deltaTime: number) {
        
    }
}

