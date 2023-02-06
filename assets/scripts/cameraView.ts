import { _decorator, Component, Node, Sprite, Camera, SpriteFrame, RenderTexture } from 'cc';
const { ccclass,requireComponent, property } = _decorator;

@ccclass('cameraView')
@requireComponent(Sprite)
export class cameraView extends Component {
    public sprite: Sprite;
    @property(Camera)
    public camera: Camera;
    public renderTex: RenderTexture;
    start() {
        
        this.sprite = this.getComponent(Sprite);
        const sp = new SpriteFrame();
        const renderTex = this.renderTex = new RenderTexture();
        renderTex.reset({
            width: 168,
            height: 128,
            
        });
        
        this.camera.targetTexture = renderTex;
        //this.sprite.color.set(this.sprite.color.r, this.sprite.color.g, this.sprite.color.b , 100);
        sp.texture = renderTex;
        sp.flipUVY = true;
        this.sprite.spriteFrame = sp;
        
    }

    update(deltaTime: number) {
    }
}

