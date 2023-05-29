import * as THREE from "three"

const App = {
    isTouch: false,
    pointer: {
        default: new THREE.Vector2,
        gl: new THREE.Vector2,
        glNormalized: new THREE.Vector2,
        isDragging: false
    },
    urlParams: new URLSearchParams(window.location.search)
}

export {
    App
}