const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    // Camera orbitale
    const camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3,
        8,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);

    // Luce
    const light = new BABYLON.HemisphericLight(
        "light1",
        new BABYLON.Vector3(0, 1, 0),
        scene
    );

    // Highlight layer
    const hl = new BABYLON.HighlightLayer("hl1", scene);

    let selectedRoot = null;

    // Drag su piano XZ
    const dragBehavior = new BABYLON.PointerDragBehavior({
        dragPlaneNormal: new BABYLON.Vector3(0, 1, 0)
    });
    dragBehavior.moveAttached = true;

    // 1) Carica l’ambiente (scene.gbl)
    const spaceResult = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "./",
        "scene.glb",
        scene
    );

    // Rendo l’ambiente NON cliccabile
    spaceResult.meshes.forEach(m => {
        m.isPickable = false;
    });

    // 2) Carica la sedia
    const sediaResult = await BABYLON.SceneLoader.ImportMeshAsync(
        "",
        "./",
        "sedia.glb",
        scene
    );

    const sediaRoot = sediaResult.meshes[0];
    sediaRoot.name = "sediaRoot";
    sediaRoot.position = new BABYLON.Vector3(1, 0, 2);
    sediaRoot.scaling = new BABYLON.Vector3(0.8, 0.8, 0.8);

    // Rendo la sedia selezionabile
    sediaResult.meshes.forEach(m => {
        if (!m.metadata) m.metadata = {};
        m.metadata.selectable = true;
        m.metadata.root = sediaRoot;
    });

    // Funzione di selezione
    function selectRoot(rootMesh) {
        if (selectedRoot) {
            hl.removeAllMeshes();
            selectedRoot.removeBehavior(dragBehavior);
        }

        selectedRoot = rootMesh;

        if (selectedRoot) {
            console.log("Selezionato:", selectedRoot.name);
            hl.addMesh(selectedRoot, BABYLON.Color3.Yellow());
            selectedRoot.addBehavior(dragBehavior);
        } else {
            console.log("Nessun oggetto selezionato");
        }
    }

    // Click del mouse
    scene.onPointerDown = function (evt, pickResult) {
        if (pickResult.hit && pickResult.pickedMesh) {
            const mesh = pickResult.pickedMesh;
            console.log("Hai cliccato:", mesh.name);

            if (mesh.metadata && mesh.metadata.selectable) {
                selectRoot(mesh.metadata.root);
            } else {
                selectRoot(null);
            }
        } else {
            selectRoot(null);
        }
    };

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
