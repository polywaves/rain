import { App } from "./app"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

class AssetLoader {
    constructor(e = "AssetsProgress") {
        this.load = ({
                         element: e = document.body,
                         progress: t = true
                     } = {}) => {
            e && (this.element = e, this.addFonts(),
                this.addMedia())

            let n = 0
            if (t) {
                for (let i = 0; i < this.promisesToLoad.length; i++) {
                    this.promisesToLoad[i].then(() => {
                        n++
                        this.progressCallback(n * 100 / this.promisesToLoad.length)
                    })
                }
            }

            return this.loaded = new Promise(i => {
                Promise.all(this.promisesToLoad).then(() => {
                    this.reset()
                    i()
                    App.Runtime.emit("AssetLoader:completed")
                })
            }), this.loaded
        }

        this.progressCallback = e => {
            App.Runtime.emit(this.progressEventName, {
                percent: Math.ceil(e)
            })
        }

        this.add = e => (this.promisesToLoad.push(e), e)

        this.addMedia = () => {
            const e = this.element.querySelectorAll("img")
            for (let n = 0; n < e.length; n++) this.addImage(e[n])

            const t = this.element.querySelectorAll("video:not([lazy])")
            for (let n = 0; n < t.length; n++) {
                this.add(new Promise(i => {
                    t[n].crossOrigin = ""
                    t[n].addEventListener("canplaythrough", function r() {
                        t[n].removeEventListener("canplaythrough", r)
                        t[n].addEventListener("timeupdate", function s() {
                            t[n].removeEventListener("timeupdate", s)
                            t[n].pause()
                            i()
                        })
                    })
                    t[n].addEventListener("error", i)
                    t[n].src === "" && t[n].dataset.src && (t[n].src = t[n].dataset.src)
                    t[n].load()
                    t[n].play()
                }))
            }
        }

        this.addFonts = () => {
            document.fonts && this.add(document.fonts.ready)
            !this.fontsLoaded && window.Typekit && this.add(new Promise(e => {
                window.Typekit.load({
                    active: () => {
                        this.fontsLoaded = true
                        e()
                    }
                })
            }))
        }

        this.loadGltf = e => (this.gltfs[e] || (this.gltfs[e] = this.add(new Promise((t, n) => {
            this.gltfLoader.load(e, i => {
                t(i)
            }, void 0, n)
        }))), this.gltfs[e])

        this.loadTexture = (e, t) => (this.textures[e] || (this.textures[e] = this.add(new Promise((n, i) => {
            this.textureLoader.load(e, r => {
                n(App.WebGL.generateTexture(r, t))
            }, void 0, i)
        }))), this.textures[e])

        this.reset = () => {
            this.promisesToLoad = []
        }

        this.promisesToLoad = []
        this.fontsLoaded = false
        this.loaded = false
        this.progressEventName = e
        this.gltfs = {}
        this.textures = {}
        this.textureLoader = new THREE.TextureLoader
        this.gltfLoader = new GLTFLoader
    }

    addImage(e) {
        return this.add(new Promise(t => {
            e.complete && e.naturalWidth !== 0 ? t(e) : (e.addEventListener("load", () => {
                t(e)
            }), e.addEventListener("error", () => {
                t(e)
            }))
        }))
    }
}

export {
    AssetLoader
}