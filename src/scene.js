import { App } from './app'
import { Audio } from './audio'
import { Pointer } from './pointer'
import { Runtime } from './runtime'
import { AssetLoader } from './assetloader'
import { PageLoader } from './pageloader'
import { RAFCollection } from './rafcollection'
import { WebGL } from './webgl'
import { MainScene } from './mainscene'


App.Runtime = new Runtime
App.PageLoader = new PageLoader
App.AssetLoader = new AssetLoader
App.Audio = new Audio
App.WebGL = new WebGL
App.MainScene = new MainScene
App.Pointer = new Pointer
App.RAFCollection = new RAFCollection

App.Pointer.detectTouchDevice()
App.Pointer.enableRAF()
App.Pointer.enableResize()
App.Pointer.enablePointerEvents()
App.Pointer.enableDrag()

window.store = App
App.AssetLoader.load().then(() => {
    App.Runtime.emit("App:start")
    App.Audio.play({
        key: "rain"
    })
})