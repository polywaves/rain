import { App } from "./app"
import { Howl, Howler } from "howler"

class Audio {
    constructor() {
        this.sounds = {}
        this.html5 = false
        const e = navigator ? navigator.userAgent : "",
            t = e.match(/Mac OS X 10_15/),
            n = e.indexOf("Safari") !== -1 && e.indexOf("Chrome") === -1,
            i = e.match(/Version\/(.*?) /)

        t && n && parseInt(i[1], 10) === 15 && (this.html5 = true)

        App.AssetLoader.add(new Promise((r, s) => {
            this.sounds.rain = new Howl({
                src: "./audio/rain.mp3",
                loop: true,
                html5: this.html5,
                onload: () => {
                    r()
                },
                onloaderror: (a, c) => {
                    console.error(a, c), s()
                }
            })
        }))

        document.addEventListener("visibilitychange", () => {
            document.hidden ? Howler.mute(true) : Howler.mute(false)
        })
    }

    play({
        key: e,
        speed: t
    }) {
        if (!this.sounds[e]) {
            console.error(`Sound not found - ${e}`)

            return
        }

        if (this.sounds[e].play(), t && !this.html5) {
            for (let n = 0; n < this.sounds[e]._sounds.length; n++) {
                if (this.sounds[e]._sounds[n]._node.bufferSource.playbackRate) {
                    this.sounds[e]._sounds[n]._node.bufferSource.playbackRate.value = t
                }
            }
        }
    }

    lerpSpeed(e, t, n) {
        let i, r

        if (this.sounds[e]) {
            for (let s = 0; s < this.sounds[e]._sounds.length; s++) {
                const a = this.sounds[e]._sounds[s],
                    c = (r = (i = a == null ? void 0 : a._node) == null ? void 0 : i.bufferSource) == null ? void 0 : r.playbackRate.value

                if (!c) return

                const u = (c > t ? c - t : t - c) / (n / 50)

                window.clearInterval(this.lerpInterval)
                this.lerpInterval = setInterval(() => {
                    let o, h, d
                    const f = (d = (h = (o = a == null ? void 0 : a._node) == null ? void 0 : o.bufferSource) == null ? void 0 : h.playbackRate) == null ? void 0 : d.value

                    if (!f) {
                        window.clearInterval(this.lerpInterval)

                        return
                    }

                    if (c > t) {
                        if (f <= t) {
                            window.clearInterval(this.lerpInterval)

                            return
                        }
                        a._node.bufferSource.playbackRate.value = f - u
                    } else {
                        if (f >= t) {
                            window.clearInterval(this.lerpInterval)

                            return
                        }
                        a._node.bufferSource.playbackRate.value = f + u
                    }
                }, 50)
            }
        }
    }

    filterTo({
        key: e,
        type: t,
        duration: n,
        from: i = {},
        to: r = {}
    }) {
        const s = Object.assign({
            frequency: 350,
            q: 1,
            gain: 0,
            detune: 0
        }, i)

        const a = Object.assign({
            frequency: 350,
            q: 1,
            gain: 0,
            detune: 0
        }, r)

        if (this.sounds[e]) {
            for (let c = 0; c < this.sounds[e]._sounds.length; c++) {
                const u = this.sounds[e]._sounds[c]
                if (!u._node.bufferSource) return

                const f = Howler.ctx.createBiquadFilter()
                f.type = t
                f.frequency.value = s.frequency
                f.Q.value = s.q
                f.gain.value = s.gain
                f.detune.value = s.detune

                u._node.bufferSource.disconnect()
                u.filter && u.filter.disconnect()
                u._node.bufferSource.connect(f)
                u.filter = f

                f.connect(u._node)
                f.frequency.exponentialRampToValueAtTime(a.frequency, u._node.context.currentTime + n / 1000)

                s.detune !== a.detune && f.detune.exponentialRampToValueAtTime(a.detune, u._node.context.currentTime + n / 1000)
                s.q !== a.q && f.q.exponentialRampToValueAtTime(a.q, u._node.context.currentTime + n / 1000)
            }
        }
    }
}

export {
    Audio
}