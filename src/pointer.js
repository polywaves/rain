import gsap from "gsap"
import { App } from "./app"

function Bh(l, e) {
    let t = null

    return () => {
        clearTimeout(t)
        const n = arguments,
            i = this

        t = setTimeout(function() {
            l.apply(i, n)
        }, e)
    }
}

class Pointer {
    constructor() {
        this.MOUSEMOVE = "global:mousemove"
        this.TOUCHMOVE = "global:touchmove"
        this.MOUSEDRAG = "global:mousedrag"
        this.TOUCHDRAG = "global:touchdrag"
        this.POINTERDOWN = "global:pointerdown"
        this.POINTERUP = "global:pointerup"
        this.RAF = "global:raf"
        this.RESIZE = "global:resize"
        this.currentRafId = null
        this.enabled = {}
        this.dragInfo = {
            x: 0,
            y: 0,
            px: 0,
            py: 0
        }
        this.stopMouseDown = false
        this.stopMouseUp = false
    }

    enablePointerEvents() {
        typeof App.Pointer.enabled.pointerEvents == "undefined" && (App.Pointer.enabled.pointerEvents = true,
            App.Runtime.on("mousemove touchmove", window, App.Pointer.handleMousemove, {
                passive: true
            }),
            App.Runtime.on("mousedown touchstart", window, App.Pointer.handleMousedown),
            App.Runtime.on("mouseup touchend", window, App.Pointer.handleMouseup))
    }

    enableResize(e = false) {
        typeof App.Pointer.enabled.resize == "undefined" && (App.Pointer.enabled.resize = true,
            e ? App.Runtime.on("resize", window, Bh(t => App.Pointer.handleResize(t), e)) : App.Runtime.on("resize", window, App.Pointer.handleResize))
    }

    enableRAF() {
        typeof App.Pointer.enabled.raf == "undefined" && (App.Pointer.enabled.raf = true,
            gsap ? (App.Pointer.currentRafId = null,
                gsap.ticker.add(App.Pointer.handleRaf)) : App.Pointer.currentRafId = window.requestAnimationFrame(App.Pointer.handleRaf))
    }

    enableDrag() {
        typeof App.Pointer.enabled.drag == "undefined" && (App.Pointer.enabled.drag = true)
    }

    handleMousemove(e) {
        if (App.pointer.default.x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX,
            App.pointer.default.y = e.changedTouches ? e.changedTouches[0].clientY : e.clientY,
            App.pointer.gl.set(App.pointer.default.x - window.innerWidth / 2,
                -App.pointer.default.y + window.innerHeight / 2),
            App.pointer.glNormalized.set(App.pointer.default.x / window.innerWidth * 2 - 1,
                -(App.pointer.default.y / window.innerHeight) * 2 + 1),
            e.changedTouches ? App.Runtime.emit(App.Pointer.TOUCHMOVE, e) : App.Runtime.emit(App.Pointer.MOUSEMOVE, e),
            App.pointer.isDragging) {
            const t = {
                deltaX: App.pointer.default.x - App.Pointer.dragInfo.px,
                deltaY: App.pointer.default.y - App.Pointer.dragInfo.py,
                startX: App.Pointer.dragInfo.x,
                startY: App.Pointer.dragInfo.y,
                totalX: App.pointer.default.x - App.Pointer.dragInfo.x,
                totalY: App.pointer.default.y - App.Pointer.dragInfo.y
            }

            App.Runtime.emit(e.changedTouches ? App.Pointer.TOUCHDRAG : App.Pointer.MOUSEDRAG, e, t)
            App.Pointer.dragInfo.px = App.pointer.default.x
            App.Pointer.dragInfo.py = App.pointer.default.y
        }
    }

    handleMousedown(e) {
        if (e.type === "touchstart") {
            App.Pointer.stopMouseDown = true
        } else {
            if (App.Pointer.stopMouseDown) {
                App.Pointer.stopMouseDown = false

                return
            }

            App.Pointer.stopMouseDown = false
        }

        App.Pointer.handleMousemove(e)
        App.Pointer.enabled.drag && (App.pointer.isDragging = true,
            App.Pointer.dragInfo.x = App.Pointer.dragInfo.px = App.pointer.default.x,
            App.Pointer.dragInfo.y = App.Pointer.dragInfo.py = App.pointer.default.y)
        App.Runtime.emit(App.Pointer.POINTERDOWN, e)
    }

    handleMouseup(e) {
        if (App.pointer.isDragging = false, e.type === "touchend") {
            App.Pointer.stopMouseUp = true;
        } else {
            if (App.Pointer.stopMouseUp) {
                App.Pointer.stopMouseUp = false;
                return
            }
            App.Pointer.stopMouseUp = false
        }

        App.Pointer.stopMouseDown = false
        App.Pointer.handleMousemove(e)
        App.Pointer.dragInfo = {
            x: 0,
            y: 0,
            px: 0,
            py: 0
        }
        App.Runtime.emit(App.Pointer.POINTERUP, e)
    }

    handleResize(e) {
        App.Runtime.emit(App.Pointer.RESIZE, e)
    }

    handleRaf(e) {
        App.Gui && App.Gui.fps.begin()
        App.Runtime.emit(App.Pointer.RAF, e)
        App.Pointer.currentRafId !== null && (App.Pointer.currentRafId = window.requestAnimationFrame(App.Pointer.handleRaf))
        App.Gui && App.Gui.fps.end()
    }

    detectTouchDevice() {
        "ontouchstart" in document.documentElement && (App.isTouch = true,
            App.html.classList.add("is-touch"))
    }
}

export {
    Pointer
}