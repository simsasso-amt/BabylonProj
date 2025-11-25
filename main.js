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

    // 2) Carico una sedia
    const sediaResult = await BABYLON.SceneLoader.ImportMeshAsync(
        "",        // nome dei mesh (vuoto = tutti)
        "./",      // path
        "sedia.glb",
        scene
    );
    const sediaRoot = sediaResult.meshes[0];
    sediaRoot.position = new BABYLON.Vector3(1, 0, 2);
    sediaRoot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);
    sediaRoot.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);

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
