import { CCClass, Collider, Node, Component, Rect, SphereCollider, Vec2, _decorator, math, input, Input, EventKeyboard, KeyCode, Vec3, clamp, lerp, nextPow2 } from "cc";
const { ccclass, property } = _decorator;
@ccclass('CameraController')
class CameraController extends Component
{   
    @property(Node)
    public target: Node | null = null;
    @property(SphereCollider)
    public collider: SphereCollider;
    public focusAreaSize: Vec2 = new Vec2(5,5);
    public offset: Vec2 = new Vec2(0, 1);
    public cameraHeight = 30;
    // left and right input
    private inputX: number = 0;
    // up and down input
    private inputY: number = 0;

    

    start()
    {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }
    onDestroy(){
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
        
    }
    lateUpdate(deltaTime: number){
        this.move(deltaTime);
    }
    move(deltaTime: number){
        let src = new Vec2(this.node.position.x, this.node.position.y);
        let dst = new Vec2(this.target.position.x, this.target.position.y);
        let nextPosition = new Vec2();
        nextPosition = Vec2.lerp(nextPosition, src, dst, deltaTime);
        this.node.setPosition(nextPosition.x, nextPosition.y, this.cameraHeight);
    }
    onKeyDown (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.inputY += 1;
                break;
            case KeyCode.KEY_S:
                this.inputY -= 1;
                break;
            case KeyCode.KEY_A:
                this.inputX -= 1;
                break;
            case KeyCode.KEY_D:
                this.inputX += 1;
                break;
                                
            default:
                break;
        }

    }

    onKeyUp (event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.KEY_W:
                this.inputY -= 1;
                break;
            case KeyCode.KEY_S:
                this.inputY += 1;
                break;
            case KeyCode.KEY_A:
                this.inputX += 1;
                break;
            case KeyCode.KEY_D:
                this.inputX -= 1;
                break;
                                
            default:
                break;
        }
    }

}

