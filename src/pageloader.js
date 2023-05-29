import gsap from "gsap"
import { App } from "./app"

class PageLoader {
    constructor() {
        this.onAssetsProgress = ({ percent: e }) => {
            this.percent !== e && (this.percent = e,
                window.requestIdleCallback ? requestIdleCallback(() => {
                    gsap.set(this.dom.progress, {
                        xPercent: this.percent
                    })
                }) : gsap.set(this.dom.progress, {
                    xPercent: this.percent
                }))
        }

        this.onAssetsLoaded = () => {
            this.onAssetsProgress({
                percent: 100
            })

            setTimeout(() => {
                this.hide()
            }, 1000)
        }

        this.dom = {
            loader: document.querySelector(".js-loader"),
            progress: document.querySelector(".js-progress")
        }
        this.percent = 0
        this.throttledProgressFunc = this.throttle(this.onAssetsProgress, 50)

        App.Runtime.on("AssetsProgress", this.throttledProgressFunc)
        App.Runtime.on("AssetLoader:completed", this.onAssetsLoaded)

        this.hiddenPromise = new Promise(e => {
            this.hiddenResolve = e
        })
    }

    hide() {
        this.removeEvents()

        const e = gsap.timeline({
            defaults: {
                ease: "expo.inOut"
            }
        }).to(this.dom.loader, {
            duration: 1,
            autoAlpha: 0
        }, 0).call(() => {
            this.hiddenResolve()
            gsap.to(App.MainScene.options, {
                cameraTranslateZ: 0,
                duration: 3,
                ease: "power4.out"
            })
        }, null, .3)

        return App.Gui && e.to(App.Gui.containerElem_, {
            opacity: 1,
            duration: 1
        }, 2), this.hiddenPromise
    }

    throttle(e, t) {
        let n = false

        return function() {
            n || (e.apply(this, arguments),
                    n = true,
                    setTimeout(function() {
                        n = false
                    }, t)
            )
        }
    }

    removeEvents() {
        App.Runtime.off("AssetsProgress", this.throttledProgressFunc)
        App.Runtime.off("AssetLoader:completed", this.onAssetsLoaded)
    }
}

export {
    PageLoader
}