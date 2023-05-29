import { App } from "./app"
import * as THREE from "three"

function Ma(l) {
    return l.replace(/#define\sGLSLIFY\s./, "")
}

function af() {
    THREE.ShaderChunk.defaultVert = Ma(Zh)
    THREE.ShaderChunk.defaultFrag = Ma($h)
    THREE.ShaderChunk.normalsVert = Ma(Qh)
}

class WebGL {
    constructor() {
        this.start = () => {
            this.addEvents()
        }

        this.onRaf = e => {
            this.clockDelta = this.clock.getDelta()
            this.globalUniforms.uDelta.value = this.clockDelta > .016 ? .016 : this.clockDelta
            this.globalUniforms.uTime.value = e
            this.renderer.info.reset()
        }

        this.onResize = () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight)
        }

        this.dom = {
            canvas: document.querySelector("canvas")
        }

        this.setup()
        App.Runtime.on("App:start", this.start)
    }

    setup() {
        this.renderer = new THREE.WebGLRenderer({
            alpha: false,
            antialias: true,
            canvas: this.dom.canvas,
            powerPreference: "high-performance",
            stencil: false
        })

        this.renderer.setPixelRatio(window.devicePixelRatio >= 2 ? 2 : window.devicePixelRatio)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.info.autoReset = false
        this.clock = new THREE.Clock
        this.globalUniforms = {
            uDelta: {
                value: 0
            },
            uTime: {
                value: 0
            }
        }

        af()
    }

    addEvents() {
        App.Runtime.on(App.Pointer.RESIZE, this.onResize)
        App.RAFCollection.add(this.onRaf, 0)
    }

    generateTexture(e, t = {}, n = false) {
        return e instanceof HTMLImageElement && (e = new THREE.Texture(e)),
            e.minFilter = t.minFilter || (n ? THREE.LinearFilter : THREE.LinearMipMapLinearFilter),
            e.magFilter = t.magFilter || THREE.LinearFilter,
            e.wrapS = e.wrapT = t.wrapping || THREE.ClampToEdgeWrapping,
            e.flipY = t.flipY !== void 0 ? t.flipY : true,
            e.mapping = t.mapping !== void 0 ? t.mapping : THREE.UVMapping,
            this.renderer.initTexture(e),
            e
    }
}

export {
    WebGL
}