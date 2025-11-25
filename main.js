const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function() {
    const scene = new BABYLON.Scene(engine);

    // Aggiungiamo una luce
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);

    // Aggiungiamo una camera orbitante
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 4,
        5,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Carichiamo il file GLB/GLTF
    await BABYLON.SceneLoader.AppendAsync(
        "./",        // cartella
        "scene.glb", // nome del file
        scene
    );

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => {
        scene.render();
    });
});

window.addEventListener("resize", () => {
    engine.resize();
});
