const ci = {},
    ft = {},
    Qa = ["mouseenter", "mouseleave", "pointerenter", "pointerleave"]

function R9(l) {
    ft[l] === void 0 && (ft[l] = [])
}

function sh(l, e) {
    if (ft[l]) {
        for (let t = 0; t < ft[l].length; t++) {
            ft[l][t](...e)
        }
    }
}

function ah(l, e) {
    const t = []
    let n = e

    do {
        if (n.nodeType !== 1) break

        const i = l.matches(n)
        i.length && t.push({
            delegatedTarget: n,
            stack: i
        })
    } while (n = n.parentElement)

    return t
}

function I9(l, e) {
    Object.defineProperty(l, "currentTarget", {
        configurable: true,
        enumerable: true,
        get: () => e
    })
}

function D9(l) {
    return typeof l == "string" ? document.querySelectorAll(l) : l
}

function es(l) {
    let e = ah(ci[l.type], l.target)

    if (e.length) {
        for (let t = 0; t < e.length; t++) {
            for (let n = 0; n < e[t].stack.length; n++) {
                Qa.indexOf(l.type) !== -1 ? (I9(l, e[t].delegatedTarget),
                l.target === e[t].delegatedTarget && e[t].stack[n].data(l)) : (I9(l,
                    e[t].delegatedTarget), e[t].stack[n].data(l))
            }
        }
    }
}

class Runtime {
    on(e, t, n, i) {
        const r = e.split(" ");
        for (let s = 0; s < r.length; s++) {
            if (typeof t == "function" && n === void 0) {
                R9(r[s]), ft[r[s]].push(t)

                continue
            }

            if (t.nodeType && t.nodeType === 1 || t === window || t === document) {
                t.addEventListener(r[s], n, i);
                continue
            }

            t = D9(t)

            for (let a = 0; a < t.length; a++) t[a].addEventListener(r[s], n, i)
        }
    }

    off(e, t, n, i) {
        const r = e.split(" ")
        for (let s = 0; s < r.length; s++) {
            if (t === void 0) {
                ft[r[s]] = []

                continue
            }

            if (typeof t == "function") {
                R9(r[s])

                for (let c = 0; c < ft[r[s]].length; c++) ft[r[s]][c] === t && ft[r[s]].splice(c, 1)

                continue
            }

            const a = ci[r[s]]
            if (a !== void 0 && (a.remove(t, n), a.size === 0)) {
                delete ci[r[s]]
                Qa.indexOf(r[s]) !== -1 ? document.removeEventListener(r[s], es, true) : document.removeEventListener(r[s], es)

                continue
            }

            if (t.removeEventListener !== void 0) {
                t.removeEventListener(r[s], n, i)

                continue
            }

            t = D9(t)
            for (let c = 0; c < t.length; c++) t[c].removeEventListener(r[s], n, i)
        }
    }

    emit(e, ...t) {
        sh(e, t)
    }
}

export {
    Runtime
}