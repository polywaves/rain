import * as THREE from "three"
import { App } from "./app"
import gsap from "gsap"
import * as OPTIONS from "./options"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer"

require('./shaders')

class Pass {
    constructor() {
        this.enabled = true
        this.clear = false
        this.renderToScreen = false
    }
    setSize() {}
    render() {
        console.error("THREE.Pass: .render() must be implemented in derived pass.")
    }
}

const Hh = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    Io = new THREE.BufferGeometry()

Io.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0]), 3))
Io.setAttribute("uv", new THREE.BufferAttribute(new Float32Array([0, 2, 0, 0, 2, 0]), 2))

class C3 {
    constructor(e) {
        this._mesh = new THREE.Mesh(Io, e)
    }
    dispose() {
        this._mesh.geometry.dispose()
    }
    render(e) {
        e.render(this._mesh, Hh)
    }
    get material() {
        return this._mesh.material
    }
    set material(e) {
        this._mesh.material = e
    }
}

class io extends Pass {
    constructor(e, t) {
        super()
        this.textureID = t !== void 0 ? t : "tDiffuse"
        e instanceof THREE.ShaderMaterial ? (this.uniforms = e.uniforms, this.material = e) : e && (
            this.uniforms = THREE.UniformsUtils.clone(e.uniforms),
                this.material = new THREE.ShaderMaterial({
                    defines: Object.assign({}, e.defines),
                    uniforms: this.uniforms,
                    vertexShader: e.vertexShader,
                    fragmentShader: e.fragmentShader
                })
        )
        this.fsQuad = new C3(this.material)
    }

    render(e, t, n) {
        this.uniforms[this.textureID] && (this.uniforms[this.textureID].value = n.texture)
        this.fsQuad.material = this.material
        this.renderToScreen ? (e.setRenderTarget(null), this.fsQuad.render(e)) : (
            e.setRenderTarget(t),
            this.clear && e.clear(
                e.autoClearColor,
                e.autoClearDepth,
                e.autoClearStencil
            ), this.fsQuad.render(e)
        )
    }
}

new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const P3 = new THREE.BufferGeometry
P3.setAttribute("position", new Float32Array([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3))
P3.setAttribute("uv", new Float32Array([0, 2, 0, 0, 2, 0], 2))

class jh extends Pass {
    constructor(e, t, n, i, r) {
        super()
        this.scene = e
        this.camera = t
        this.overrideMaterial = n
        this.clearColor = i
        this.clearAlpha = r !== void 0 ? r : 0
        this.clear = true
        this.clearDepth = false
        this.needsSwap = false
        this._oldClearColor = new THREE.Color
    }

    render(e, t, n) {
        const i = e.autoClear
        e.autoClear = false
        let r, s
        this.overrideMaterial !== void 0 && (s = this.scene.overrideMaterial,
            this.scene.overrideMaterial = this.overrideMaterial)
        this.clearColor && (e.getClearColor(this._oldClearColor),
            r = e.getClearAlpha(),
            e.setClearColor(this.clearColor, this.clearAlpha))
        this.clearDepth && e.clearDepth()
        e.setRenderTarget(this.renderToScreen ? null : n)

        this.clear && e.clear(e.autoClearColor, e.autoClearDepth, e.autoClearStencil)
        e.render(this.scene, this.camera)

        this.clearColor && e.setClearColor(this._oldClearColor, r)
        this.overrideMaterial !== void 0 && (this.scene.overrideMaterial = s)
        e.autoClear = i
    }
}

class Di extends Pass {
    constructor(e, t, n, i) {
        super()
        this.strength = t !== void 0 ? t : 1
        this.radius = n
        this.threshold = i
        this.resolution = e !== void 0 ? new THREE.Vector2(e.x, e.y) : new THREE.Vector2(256, 256)
        this.clearColor = new THREE.Color(0, 0, 0)
        this.renderTargetsHorizontal = []
        this.renderTargetsVertical = []
        this.nMips = 5

        let r = Math.round(this.resolution.x / 2),
            s = Math.round(this.resolution.y / 2)
        this.renderTargetBright = new THREE.WebGLRenderTarget(r, s)
        this.renderTargetBright.texture.name = "UnrealBloomPass.bright"
        this.renderTargetBright.texture.generateMipmaps = false

        for (let o = 0; o < this.nMips; o++) {
            const h = new THREE.WebGLRenderTarget(r, s)
            h.texture.name = "UnrealBloomPass.h" + o
            h.texture.generateMipmaps = false
            this.renderTargetsHorizontal.push(h)

            const d = new THREE.WebGLRenderTarget(r, s)
            d.texture.name = "UnrealBloomPass.v" + o
            d.texture.generateMipmaps = false
            this.renderTargetsVertical.push(d)
            r = Math.round(r / 2)
            s = Math.round(s / 2)
        }

        q9 === void 0 && console.error("THREE.UnrealBloomPass relies on LuminosityHighPassShader")
        const a = q9

        this.highPassUniforms = THREE.UniformsUtils.clone(a.uniforms)
        this.highPassUniforms.luminosityThreshold.value = i
        this.highPassUniforms.smoothWidth.value = .01
        this.materialHighPassFilter = new THREE.ShaderMaterial({
            uniforms: this.highPassUniforms,
            vertexShader: a.vertexShader,
            fragmentShader: a.fragmentShader,
            defines: {}
        })
        this.separableBlurMaterials = []
        const c = [3, 5, 7, 9, 11]

        r = Math.round(this.resolution.x / 2)
        s = Math.round(this.resolution.y / 2)

        for (let o = 0; o < this.nMips; o++) {
            this.separableBlurMaterials.push(this.getSeperableBlurMaterial(c[o]))
            this.separableBlurMaterials[o].uniforms.texSize.value = new THREE.Vector2(r, s)
            r = Math.round(r / 2), s = Math.round(s / 2)
        }

        this.compositeMaterial = this.getCompositeMaterial(this.nMips)
        this.compositeMaterial.uniforms.blurTexture1.value = this.renderTargetsVertical[0].texture
        this.compositeMaterial.uniforms.blurTexture2.value = this.renderTargetsVertical[1].texture
        this.compositeMaterial.uniforms.blurTexture3.value = this.renderTargetsVertical[2].texture
        this.compositeMaterial.uniforms.blurTexture4.value = this.renderTargetsVertical[3].texture
        this.compositeMaterial.uniforms.blurTexture5.value = this.renderTargetsVertical[4].texture
        this.compositeMaterial.uniforms.bloomStrength.value = t
        this.compositeMaterial.uniforms.bloomRadius.value = .1
        this.compositeMaterial.needsUpdate = true

        const u = [1, .8, .6, .4, .2]
        this.compositeMaterial.uniforms.bloomFactors.value = u
        this.bloomTintColors = [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, 1)
        ]
        this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors
        xs === void 0 && console.error("THREE.UnrealBloomPass relies on CopyShader")
        const f = xs

        this.copyUniforms = THREE.UniformsUtils.clone(f.uniforms)
        this.copyUniforms.opacity.value = 1
        this.materialCopy = new THREE.ShaderMaterial({
            uniforms: this.copyUniforms,
            vertexShader: f.vertexShader,
            fragmentShader: f.fragmentShader,
            blending: THREE.TwoPassDoubleSide,
            depthTest: false,
            depthWrite: false,
            transparent: true
        })

        this.enabled = true
        this.needsSwap = false
        this._oldClearColor = new THREE.Color
        this.oldClearAlpha = 1
        this.basic = new THREE.MeshBasicMaterial
        this.fsQuad = new C3(null)
    }

    dispose() {
        for (let e = 0; e < this.renderTargetsHorizontal.length; e++) this.renderTargetsHorizontal[e].dispose()
        for (let e = 0; e < this.renderTargetsVertical.length; e++) this.renderTargetsVertical[e].dispose()
        this.renderTargetBright.dispose()
    }

    setSize(e, t) {
        let n = Math.round(e / 2),
            i = Math.round(t / 2)
        this.renderTargetBright.setSize(n, i)

        for (let r = 0; r < this.nMips; r++) {
            this.renderTargetsHorizontal[r].setSize(n, i)
            this.renderTargetsVertical[r].setSize(n, i)
            this.separableBlurMaterials[r].uniforms.texSize.value = new THREE.Vector2(n, i)
            n = Math.round(n / 2)
            i = Math.round(i / 2)
        }
    }

    render(e, t, n, i, r) {
        e.getClearColor(this._oldClearColor)
        this.oldClearAlpha = e.getClearAlpha()

        const s = e.autoClear

        e.autoClear = false
        e.setClearColor(this.clearColor, 0)
        r && e.state.buffers.stencil.setTest(false)
        this.renderToScreen && (this.fsQuad.material = this.basic,
            this.basic.map = n.texture,
            e.setRenderTarget(null),
            e.clear(),
            this.fsQuad.render(e))
        this.highPassUniforms.tDiffuse.value = n.texture
        this.highPassUniforms.luminosityThreshold.value = this.threshold
        this.fsQuad.material = this.materialHighPassFilter
        e.setRenderTarget(this.renderTargetBright)
        e.clear()
        this.fsQuad.render(e)

        let a = this.renderTargetBright
        for (let c = 0; c < this.nMips; c++) {
            this.fsQuad.material = this.separableBlurMaterials[c]
            this.separableBlurMaterials[c].uniforms.colorTexture.value = a.texture
            this.separableBlurMaterials[c].uniforms.direction.value = Di.BlurDirectionX

            e.setRenderTarget(this.renderTargetsHorizontal[c])
            e.clear()

            this.fsQuad.render(e)
            this.separableBlurMaterials[c].uniforms.colorTexture.value = this.renderTargetsHorizontal[c].texture
            this.separableBlurMaterials[c].uniforms.direction.value = Di.BlurDirectionY

            e.setRenderTarget(this.renderTargetsVertical[c])
            e.clear()

            this.fsQuad.render(e)
            a = this.renderTargetsVertical[c]
        }

        this.fsQuad.material = this.compositeMaterial
        this.compositeMaterial.uniforms.bloomStrength.value = this.strength
        this.compositeMaterial.uniforms.bloomRadius.value = this.radius
        this.compositeMaterial.uniforms.bloomTintColors.value = this.bloomTintColors

        e.setRenderTarget(this.renderTargetsHorizontal[0])
        e.clear()

        this.fsQuad.render(e)
        this.fsQuad.material = this.materialCopy
        this.copyUniforms.tDiffuse.value = this.renderTargetsHorizontal[0].texture
        r && e.state.buffers.stencil.setTest(true)
        this.renderToScreen ? (e.setRenderTarget(null),
            this.fsQuad.render(e)) : (e.setRenderTarget(n),
            this.fsQuad.render(e))

        e.setClearColor(this._oldClearColor, this.oldClearAlpha)
        e.autoClear = s
    }

    getSeperableBlurMaterial(e) {
        sb.defines = {
            KERNEL_RADIUS: e,
            SIGMA: e
        }

        return new THREE.ShaderMaterial(sb)
    }

    getCompositeMaterial(e) {
        cp.defines = {
            NUM_MIPS: e
        }

        return new THREE.ShaderMaterial(cp)
    }
}

Di.BlurDirectionX = new THREE.Vector2(1, 0)
Di.BlurDirectionY = new THREE.Vector2(0, 1)

class Yh extends THREE.Line {
    constructor(e, t) {
        const n = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, 1, 0],
            i = new THREE.BufferGeometry

        i.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n), 3))
        i.computeBoundingSphere()

        const r = new THREE.LineBasicMaterial({
            fog: false
        })

        super(i, r)
        this.light = e
        this.color = t
        this.type = "RectAreaLightHelper"

        const s = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0],
            a = new THREE.BufferGeometry

        a.setAttribute("position", new THREE.BufferAttribute(new Float32Array(s), 3))
        a.computeBoundingSphere()
        this.add(new THREE.Mesh(a, new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            fog: false
        })))
    }

    updateMatrixWorld() {
        if (this.scale.set(.5 * this.light.width, .5 * this.light.height, 1), this.color !== void 0) {
            this.material.color.set(this.color)
            this.children[0].material.color.set(this.color)
        } else {
            this.material.color.copy(this.light.color).multiplyScalar(this.light.intensity)
            const e = this.material.color,
                t = Math.max(e.r, e.g, e.b)

            t > 1 && e.multiplyScalar(1 / t)
            this.children[0].material.color.copy(this.material.color)
        }

        this.matrixWorld.extractRotation(this.light.matrixWorld).scale(this.scale).copyPosition(this.light.matrixWorld)
        this.children[0].matrixWorld.copy(this.matrixWorld)
    }

    dispose() {
        this.geometry.dispose()
        this.material.dispose()

        this.children[0].geometry.dispose()
        this.children[0].material.dispose()
    }
}



class tf extends THREE.ShaderMaterial {
    constructor(e = {}) {
        super({
            vertexShader: Jh,
            fragmentShader: ef,
            uniforms: {
                uTime: {
                    value: 0
                },
                uBgTexture: {
                    value: e.renderTarget.texture
                },
                uNormalTexture: {
                    value: e.normalMap
                },
                uHeightRange: {
                    value: e.heightRange
                },
                uBaseBrightness: {
                    value: .07
                },
                uRefraction: {
                    value: .05
                }
            }
        })
    }
}

function L3(...l) {
    const e = t => t && typeof t == "object";
    return l.reduce((t, n) => (Object.keys(n).forEach(i => {
        const r = t[i],
            s = n[i];
        Array.isArray(r) && Array.isArray(s) ? t[i] = r.concat(...s) : e(r) && e(s) ? t[i] = L3(r, s) : t[i] = s
    }), t), {})
}



class sf extends THREE.ShaderMaterial {
    constructor(e = {}) {
        e = L3({
            uniforms: {
                uDiffuse: {
                    value: null
                },
                uDistortionAmount: {
                    value: .1065
                },
                uBlurStrength: {
                    value: 6.3
                },
                uRoughnessTexture: {
                    value: null
                },
                uOpacityTexture: {
                    value: null
                },
                uNormalTexture: {
                    value: null
                },
                uTexScale: {
                    value: new THREE.Vector2(1.38, 4.07)
                },
                uTime: {
                    value: 0
                },
                uRainCount: {
                    value: 0
                }
            }
        }, e)

        super({
            vertexShader: nf,
            fragmentShader: rf,
            uniforms: e.uniforms
        })
    }
}



class j9 {
    get camera() {
        return this._camera
    }

    get material() {
        return this._mesh.material
    }

    set material(e) {
        this._mesh.material = e
    }

    constructor(e) {
        const t = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
            n = new THREE.PlaneGeometry(2, 2)

        this._mesh = new THREE.Mesh(n, e)
        this._camera = t
    }

    dispose() {
        this._mesh.geometry.dispose()
    }

    render(e) {
        e.render(this._mesh, this._camera)
    }
}





class Minmapper {
    constructor() {
        this.material = new THREE.ShaderMaterial({
            vertexShader: cf,
            fragmentShader: uf,
            uniforms: {
                map: {
                    value: null
                },
                originalMapSize: {
                    value: new THREE.Vector2
                },
                parentMapSize: {
                    value: new THREE.Vector2
                },
                parentLevel: {
                    value: 0
                }
            }
        })

        this.swapTarget = new THREE.WebGLRenderTarget
        this.swapTarget.texture.minFilter = THREE.NearestFilter
        this.swapTarget.texture.magFilter = THREE.NearestFilter

        this.copyQuad = new j9(new THREE.RawShaderMaterial({
            vertexShader: of,
            fragmentShader: lf,
            uniforms: {
                uTexture: {
                    value: null
                }
            },
            depthTest: false,
            depthWrite: false,
            blending: THREE.FrontSide
        }))
        this.mipQuad = new j9(this.material)
        this.size = new THREE.Vector2
        this.targetSize = new THREE.Vector2
        this.maxMipMapLevel = 1
    }

    resize(e, t) {
        const n = Math.floor(e.x),
            i = Math.floor(e.y)

        this.size.set(n, i)
        this.targetSize.set(Math.floor(this.size.x * 1.5), this.size.y)
        t.setSize(this.targetSize.x, this.targetSize.y)
        this.swapTarget.setSize(this.targetSize.x, this.targetSize.y)
    }

    update(e, t, n) {
        const i = n.autoClear,
            r = n.getRenderTarget()

        n.autoClear = false
        this.copyQuad.material.uniforms.uTexture.value = e
        n.setRenderTarget(this.swapTarget)
        this.copyQuad.render(n)

        let s = this.size.x,
            a = this.size.y,
            c = 0

        for (; s > this.maxMipMapLevel && a > this.maxMipMapLevel;) {
            this.material.uniforms.map.value = this.swapTarget.texture
            this.material.uniforms.parentLevel.value = c
            this.material.uniforms.parentMapSize.value.set(s, a)
            this.material.uniforms.originalMapSize.value.set(this.size.x, this.size.y)

            s = Math.floor(s / 2)
            a = Math.floor(a / 2)

            const u = this.targetSize.y - 2 * a
            n.setRenderTarget(t)

            this.mipQuad.camera.setViewOffset(s, a, -this.size.x, -u, this.targetSize.x, this.targetSize.y)
            this.mipQuad.render(n)
            n.setRenderTarget(this.swapTarget)

            this.material.uniforms.map.value = t.texture
            this.mipQuad.render(n)
            c ++
        }

        n.setRenderTarget(r)
        n.autoClear = i
    }

    dispose() {
        this.swapTarget.dispose()
        this.mipQuad.dispose()
        this.copyQuad.dispose()
    }
}

class ff extends THREE.Mesh {
    constructor(t, n, i) {
        super(t, n)

        this.onResize = () => {
            this.textureSize.set(window.innerWidth * .5, window.innerHeight * .5)
            this.mipmapper.resize(this.textureSize, this.renderTarget)
        }

        this.name = i
        this.ignoreObjects = []
        this.renderReflection = true
        this.camera = null
        this.scene = null
        this.sceneCamera = null
        this.enabled = true
        this.reflectorPlane = new THREE.Plane
        this.normal = new THREE.Vector3
        this.reflectorWorldPosition = new THREE.Vector3
        this.cameraWorldPosition = new THREE.Vector3
        this.rotationMatrix = new THREE.Matrix4
        this.lookAtPosition = new THREE.Vector3(0, 0, -1)
        this.clipPlane = new THREE.Vector4
        this.view = new THREE.Vector3
        this.target = new THREE.Vector3
        this.q = new THREE.Vector4
        this.textureSize = new THREE.Vector2(window.innerWidth * .5, window.innerHeight * .5)
        this.textureMatrix = new THREE.Matrix4
        this.renderTarget = new THREE.WebGLRenderTarget(this.textureSize.x, this.textureSize.y, {
            minFilter: THREE.LinearFilter
        })
        this.mipmapper = new Minmapper
        this.mipmapper.resize(this.textureSize, this.renderTarget)
        this.material.uniforms.uTextureMatrix = {
            value: this.textureMatrix
        }
        this.material.uniforms.uTexture = {
            value: this.renderTarget.texture
        }
        this.material.uniforms.uMipmapTextureSize = {
            value: this.mipmapper.targetSize
        }

        this.renderCount = 0
        App.Runtime.on(App.Pointer.RESIZE, this.onResize)
    }

    onBeforeRender() {
        if (!this.enabled || (this.renderCount++,
            this.reflectorWorldPosition.setFromMatrixPosition(this.matrixWorld),
            this.cameraWorldPosition.setFromMatrixPosition(this.sceneCamera.matrixWorld),
            this.rotationMatrix.extractRotation(this.matrixWorld),
            this.rotationMatrix.makeRotationX(THREE.MathUtils.degToRad(-90)),
            this.normal.set(0, 0, 1),
            this.normal.applyMatrix4(this.rotationMatrix),
            this.view.subVectors(this.reflectorWorldPosition, this.cameraWorldPosition),
        this.view.dot(this.normal) > 0)) return

        this.view.reflect(this.normal).negate()
        this.view.add(this.reflectorWorldPosition)

        this.rotationMatrix.extractRotation(this.sceneCamera.matrixWorld)

        this.lookAtPosition.set(0, 0, -1)
        this.lookAtPosition.applyMatrix4(this.rotationMatrix)
        this.lookAtPosition.add(this.cameraWorldPosition)

        this.target.subVectors(this.reflectorWorldPosition, this.lookAtPosition)
        this.target.reflect(this.normal).negate()
        this.target.add(this.reflectorWorldPosition)

        this.camera.position.copy(this.view)
        this.camera.up.set(0, 1, 0)
        this.camera.up.applyMatrix4(this.rotationMatrix)
        this.camera.up.reflect(this.normal)
        this.camera.lookAt(this.target)
        this.camera.far = this.sceneCamera.far
        this.camera.updateMatrixWorld()
        this.camera.projectionMatrix.copy(this.sceneCamera.projectionMatrix)

        this.textureMatrix.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1)
        this.textureMatrix.multiply(this.camera.projectionMatrix)
        this.textureMatrix.multiply(this.camera.matrixWorldInverse)
        this.textureMatrix.multiply(this.matrixWorld)

        this.reflectorPlane.setFromNormalAndCoplanarPoint(this.normal, this.reflectorWorldPosition)
        this.reflectorPlane.applyMatrix4(this.camera.matrixWorldInverse)

        this.clipPlane.set(this.reflectorPlane.normal.x,
            this.reflectorPlane.normal.y,
            this.reflectorPlane.normal.z,
            this.reflectorPlane.constant)

        const t = this.camera.projectionMatrix
        if (this.q.x = (Math.sign(this.clipPlane.x) + t.elements[8]) / t.elements[0],
            this.q.y = (Math.sign(this.clipPlane.y) + t.elements[9]) / t.elements[5],
            this.q.z = -1, this.q.w = (1 + t.elements[10]) / t.elements[14],
            this.clipPlane.multiplyScalar(2 / this.clipPlane.dot(this.q)),
            t.elements[2] = this.clipPlane.x,
            t.elements[6] = this.clipPlane.y,
            t.elements[10] = this.clipPlane.z + 1 - .003,
            t.elements[14] = this.clipPlane.w,
        this.renderCount % 2 !== 0) {
            this.visible = false

            for (let n = 0; n < this.ignoreObjects.length; n++) this.ignoreObjects[n].visible = false

            if (this.renderReflection) {
                const n = App.WebGL.renderer.getRenderTarget();
                App.WebGL.renderer.setRenderTarget(this.renderTarget)
                App.WebGL.renderer.setViewport(0, 0,
                    this.textureSize.x / App.WebGL.renderer.getPixelRatio(),
                    this.textureSize.y / App.WebGL.renderer.getPixelRatio())
                App.WebGL.renderer.setScissor(0, 0, this.textureSize.x, this.textureSize.y)
                App.WebGL.renderer.setScissorTest(true)
                App.WebGL.renderer.clear(true)
                App.WebGL.renderer.render(this.scene, this.camera)
                App.WebGL.renderer.setRenderTarget(null)
                App.WebGL.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
                App.WebGL.renderer.setScissor(0, 0, window.innerWidth, window.innerHeight)
                App.WebGL.renderer.setRenderTarget(n)

                this.mipmapper.update(this.renderTarget.texture, this.renderTarget, App.WebGL.renderer)
            }

            this.visible = true

            for (let n = 0; n < this.ignoreObjects.length; n++) this.ignoreObjects[n].visible = true
        }
    }

    updateCameraScene(t, n) {
        this.sceneCamera = t
        this.camera = t.clone()
        this.scene = n
    }
}

class df extends ff {
    constructor(e, t, n, i, r, s, a) {
        super(e.clone(), new sf(a), s)

        this.material.uniforms.uRoughnessTexture.value = t
        this.material.uniforms.uNormalTexture.value = n
        this.material.uniforms.uOpacityTexture.value = i
        this.material.uniforms.uRainCount.value = r

        this.geometry.computeBoundingBox()
        this.geometry.computeBoundingSphere()

        this.updateMatrix()
        this.updateMatrixWorld()
        this.updateCameraScene(App.MainScene.controls.enabled ? App.MainScene.devCamera : App.MainScene.camera, App.MainScene)
    }
}


class MainScene extends THREE.Scene {
    constructor() {
        super()

        this.onRaf = () => {
            this.renderCount ++
            this.controls.update()
            this.smoothMouse[0].lerp(App.pointer.glNormalized, .03)
            this.smoothMouse[1].lerp(App.pointer.glNormalized, .07)

            this.updateCamera()
            this.meshes.rain.material.uniforms.uTime.value += App.WebGL.clockDelta * this.meshes.rain.speed
            this.meshes.floor.material.uniforms.uTime.value += App.WebGL.clockDelta * this.meshes.rain.speed

            if (this.renderCount % 2 !== 0) {
                this.meshes.rain.visible = false
                this.meshes.floor.enabled = false
                App.WebGL.renderer.setRenderTarget(this.rainBgRt)
                App.WebGL.renderer.render(this, this.controls.enabled ? this.devCamera : this.camera)
                App.WebGL.renderer.setRenderTarget(null)
                this.meshes.rain.visible = true
                this.meshes.floor.enabled = true
            }

            this.controls.enabled ? App.WebGL.renderer.render(this, this.devCamera) : this.composer.render()
        }

        this.onPointerDown = t => {
            if(t.target === document.body) {
                App.Audio.lerpSpeed("rain", .2, 500)
                App.Audio.filterTo({
                    key: "rain",
                    duration: 500,
                    type: "lowpass",
                    from: {
                        frequency: 12e3
                    },
                    to: {
                        frequency: 500
                    }
                })

                gsap.timeline({
                    defaults: {
                        duration: 2,
                        ease: "power2.out",
                        overwrite: true
                    }
                }).to(this.meshes.rain, {
                    speed: .02
                }, "<").to(this.options, {
                    cameraTranslateZ: -3
                }, "<")
            }
        }

        this.onPointerUp = t => {
            if (t.target === document.body) {
                App.Audio.lerpSpeed("rain", 1, 750)
                App.Audio.filterTo({
                    key: "rain",
                    duration: 750,
                    type: "lowpass",
                    to: {
                        frequency: 12e3
                    },
                    from: {
                        frequency: 500
                    }
                })

                gsap.timeline({
                    defaults: {
                        duration: 1,
                        ease: "power2.inOut",
                        overwrite: true
                    }
                }).to(this.meshes.rain, {
                    speed: 1
                }, "<").to(this.options, {
                    cameraTranslateZ: 0
                }, "<")
            }
        }

        this.onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight
            this.camera.updateProjectionMatrix()
            this.composer.setSize(window.innerWidth, window.innerHeight)
            this.fxaaPass.material.uniforms.resolution.value.x = 1 / (window.innerWidth * App.WebGL.renderer.getPixelRatio())
            this.fxaaPass.material.uniforms.resolution.value.y = 1 / (window.innerHeight * App.WebGL.renderer.getPixelRatio())
        }


        // OPTIONS HERE
        this.options = {
            color: new THREE.Color(OPTIONS.color),
            color2: new THREE.Color(OPTIONS.color2),
            bloomEnabled: true,
            controls: App.urlParams.has("controls"),
            mouseMoveAngle: new THREE.Vector2(.5, .08),
            cameraZOffset: OPTIONS.cameraZOffset,
            cameraTranslateZ: OPTIONS.cameraTranslateZ
        }

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .5, 1e3)
        this.cameraPosition = new THREE.Vector3(0, 2, 9)
        this.camera.position.copy(this.cameraPosition)
        this.cameraLookAt = new THREE.Vector3(0, 2, 0)

        this.devCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, .1, 1e3)
        this.devCamera.position.set(0, 4, 10)

        this.background = new THREE.Color(OPTIONS.background)
        this.controls = new OrbitControls(this.devCamera, App.WebGL.renderer.domElement)
        this.controls.enabled = this.options.controls
        this.controls.enableDamping = true
        this.controls.target = this.cameraLookAt
        this.dummyObject = new THREE.Object3D
        this._quaternion = new THREE.Quaternion
        this._euler = new THREE.Euler
        this.smoothMouse = [new THREE.Vector2, new THREE.Vector2]
        this.renderCount = 1

        this.composer = new EffectComposer(App.WebGL.renderer)

        this.load()

        App.Runtime.on("App:start", () => {
            this.build()
            this.addEvents()

            setTimeout(() => {
                App.Runtime.on(App.Pointer.POINTERDOWN, this.onPointerDown)
                App.Runtime.on(App.Pointer.POINTERUP, this.onPointerUp)
            }, 2500)
        })
    }

    build() {
        this.meshes = {}

        this.buildRain()
        this.buildFloor()

        this.meshes.walls = new THREE.Mesh(this.assets.models.walls, new THREE.MeshPhongMaterial({
            color: 1118481,
            normalMap: this.assets.textures.brickNormal,
            normalScale: new THREE.Vector2(.5, .5),
            shininess: 50
        }))
        this.add(this.meshes.walls)

        this.meshes.door = new THREE.Group
        this.meshes.door.shutter = new THREE.Mesh(this.assets.models.shutter, new THREE.MeshPhysicalMaterial({
            map: this.assets.textures.shutterDiffuse,
            roughnessMap: this.assets.textures.shutterGlossiness,
            normalMap: this.assets.textures.shutterNormal,
            reflectivity: .8,
            roughness: .5,
            metalness: .3,
            specularIntensity: .5
        }))
        this.meshes.door.sideCover = new THREE.Mesh(this.assets.models.sideCover, new THREE.MeshPhysicalMaterial({
            map: this.assets.textures.sideCoverDiffuse,
            reflectivity: .7,
            roughness: .5,
            metalness: .2,
            specularIntensity: .5
        }))
        this.meshes.door.topCover = new THREE.Mesh(this.assets.models.topCover, new THREE.MeshPhysicalMaterial({
            map: this.assets.textures.topCoverDiffuse,
            reflectivity: .7,
            roughness: .5,
            metalness: .2,
            specularIntensity: .5
        }))

        this.meshes.door.add(this.meshes.door.shutter)
        this.meshes.door.add(this.meshes.door.sideCover)
        this.meshes.door.add(this.meshes.door.topCover)
        this.add(this.meshes.door)

        // LIGHTS HERE
        this.lights = {}

        // Top ambient
        this.lights.pLight2 = new THREE.PointLight(this.options.color2, 2, 30)
        this.lights.pLight2.position.y = 30
        this.lights.pLight2.position.z = 0
        this.add(this.lights.pLight2)

        // Lamp
        this.lights.rLight1 = new THREE.RectAreaLight(this.options.color, 66)
        this.lights.rLight1.position.set(0, 8.066, -9.8)
        this.lights.rLight1.rotation.set(THREE.MathUtils.degToRad(90), THREE.MathUtils.degToRad(180), 0)
        this.lights.rLight1.width = 19.1
        this.lights.rLight1.height = .2
        this.add(this.lights.rLight1)

        this.lights.rLight1Helper = new Yh(this.lights.rLight1)
        this.add(this.lights.rLight1Helper)

        this.startFlicker()
        this.buildPasses()
    }

    buildRain() {
        this.rainBgRt = new THREE.WebGLRenderTarget(window.innerWidth * .1, window.innerHeight * .1)
        const t = 1e4
        this.meshes.rain = new THREE.InstancedMesh(new THREE.PlaneGeometry, new tf({
            renderTarget: this.rainBgRt,
            normalMap: this.assets.textures.rainNormal,
            heightRange: 20
        }), t)

        const n = [], i = []
        for (let r = 0; r < t; r++) {
            this.dummyObject.position.set(THREE.MathUtils.randFloat(-10, 10), 0,
                THREE.MathUtils.randFloat(-20, 10))
            this.dummyObject.scale.set(.03, THREE.MathUtils.randFloat(.3, .5), .03)
            this.dummyObject.updateMatrix()
            this.meshes.rain.setMatrixAt(r, this.dummyObject.matrix)

            n.push(Math.random())
            i.push(this.dummyObject.scale.y * 10)
        }

        this.meshes.rain.geometry.setAttribute("aProgress", new THREE.InstancedBufferAttribute(new Float32Array(n), 1))
        this.meshes.rain.geometry.setAttribute("aSpeed", new THREE.InstancedBufferAttribute(new Float32Array(i), 1))
        this.meshes.rain.rotation.set(-.1, 0, .1)
        this.meshes.rain.position.y = 9
        this.meshes.rain.position.z = 9
        this.meshes.rain.count = 2e3
        this.meshes.rain.speed = 1
        this.add(this.meshes.rain)
    }

    buildFloor() {
        this.meshes.floor = new df(
            this.assets.models.floor,
            this.assets.textures.floorRoughness,
            this.assets.textures.floorNormal,
            this.assets.textures.floorOpacity,
            this.meshes.rain.count
        )
        this.meshes.floor.ignoreObjects.push(this.meshes.rain)
        this.add(this.meshes.floor)
    }

    buildPasses() {
        this.renderScene = new jh(this, this.camera)
        this.fxaaPass = new io(Xh)
        this.fxaaPass.material.uniforms.resolution.value.x = 1 / (window.innerWidth * App.WebGL.renderer.getPixelRatio())
        this.fxaaPass.material.uniforms.resolution.value.y = 1 / (window.innerHeight * App.WebGL.renderer.getPixelRatio())
        this.bloomPass = new Di(new THREE.Vector2(window.innerWidth, window.innerHeight), 2.011, .935, .424)
        this.bloomPass.enabled = this.options.bloomEnabled

        this.composer.addPass(this.renderScene)
        this.composer.addPass(this.fxaaPass)
        this.composer.addPass(this.bloomPass)
    }

    startFlicker() {
        let t
        setInterval(() => {
            if(Math.random() < .5) {
                clearTimeout(t)
                this.turnLightOff()

                t = setTimeout(() => {
                    this.turnLightOn()
                    t = setTimeout(() => {
                        this.turnLightOff()
                        t = setTimeout(() => {
                            this.turnLightOn()
                        }, 200 * Math.random())
                    }, 200 * Math.random())
                }, 200 * Math.random())
            }
        }, 3e3)
    }

    turnLightOff() {
        this.lights.rLight1.color.set(0)
    }

    turnLightOn() {
        this.lights.rLight1.color.copy(this.options.color)
    }

    updateCamera() {
        this.camera.position.copy(this.cameraPosition)
        this.camera.lookAt(this.cameraLookAt)

        if(!this.controls.enabled) {
            this.camera.translateZ(-this.options.cameraZOffset)
            this._euler.set(
                this.smoothMouse[0].y * this.options.mouseMoveAngle.y,
                -this.smoothMouse[0].x * this.options.mouseMoveAngle.x,
                0
            )
            this._quaternion.setFromEuler(this._euler)
            this.camera.quaternion.multiply(this._quaternion)
            this._euler.set(0, 0, (this.smoothMouse[0].x - this.smoothMouse[1].x) * -.1)
            this._quaternion.setFromEuler(this._euler)
            this.camera.quaternion.multiply(this._quaternion)
            this.camera.translateZ(this.options.cameraTranslateZ)
            this.camera.translateZ(this.options.cameraZOffset)
            this.camera.updateMatrixWorld()
        }
    }

    addEvents() {
        App.Runtime.on(App.Pointer.RESIZE, this.onResize)
        App.RAFCollection.add(this.onRaf, 3)
    }

    load() {
        this.assets = {
            textures: {},
            models: {}
        }

        App.AssetLoader.loadTexture("./images/rain-normal.png", {
            flipY: false
        }).then(n => {
            this.assets.textures.rainNormal = n
        })

        App.AssetLoader.loadTexture("./images/brick-normal2.jpg", {
            wrapping: THREE.RepeatWrapping
        }).then(n => {
            n.rotation = THREE.MathUtils.degToRad(90), n.repeat.set(5, 8),
                this.assets.textures.brickNormal = n
        })

        App.AssetLoader.loadTexture("./images/asphalt-pbr01/roughness.jpg", {
            wrapping: THREE.RepeatWrapping
        }).then(n => {
            this.assets.textures.floorRoughness = n
        })

        App.AssetLoader.loadTexture("./images/asphalt-pbr01/opacity.jpg", {
            wrapping: THREE.RepeatWrapping
        }).then(n => {
            this.assets.textures.floorOpacity = n
        })

        App.AssetLoader.loadTexture("./images/asphalt-pbr01/normal.png", {
            wrapping: THREE.RepeatWrapping
        }).then(n => {
            n.anisotropy = App.WebGL.renderer.capabilities.getMaxAnisotropy()
            n.needsUpdate = true
            this.assets.textures.floorNormal = n
        })

        const t = {
            shutterDiffuse: "shutter-Diffuse",
            shutterGlossiness: "shutter-Glossiness",
            shutterNormal: "shutter-Normal",
            sideCoverDiffuse: "side-cover-Diffuse",
            topCoverDiffuse: "top-cover-Diffuse"
        }

        for (const n in t) {
            App.AssetLoader.loadTexture(`./images/door/${t[n]}.png`, {
                flipY: false
            }).then(i => {
                this.assets.textures[n] = i
            })
        }

        App.AssetLoader.loadGltf("./models/scene.glb").then(n => {
            this.assets.models.floor = n.scene.getObjectByName("floor").geometry
            this.assets.models.walls = n.scene.getObjectByName("walls").geometry
            this.assets.models.shutter = n.scene.getObjectByName("shutter").geometry
            this.assets.models.sideCover = n.scene.getObjectByName("side-cover").geometry
            this.assets.models.topCover = n.scene.getObjectByName("top-cover").geometry
        })
    }
}

export {
    MainScene
}