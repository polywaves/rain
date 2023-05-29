import { App } from "./app"

class RAFCollection {
    constructor() {
        this.fire = e => {
            let t = 0
            const n = this.callbacks.length
            for (t; t < n; t++) this.callbacks[t].cb(e)
        }

        this.callbacks = []
        App.Runtime.on(App.Pointer.RAF, this.fire)
    }

    add(e, t) {
        this.callbacks.push({
            index: t,
            cb: e
        })

        this.callbacks.sort(this.sort)
    }

    remove(e) {
        for (let t = 0; t < this.callbacks.length; t++) {
            this.callbacks[t].cb === e && this.callbacks.splice(t, 1)
        }
    }

    sort(e, t) {
        return e.index > t.index ? 1 : -1
    }
}

export {
    RAFCollection
}