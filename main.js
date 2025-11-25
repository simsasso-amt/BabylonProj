const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function () {
    const scene = new BABYLON.Scene(engine);

    // Camera
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

    // Highlight layer per evidenziare la sedia selezionata
    const hl = new BABYLON.HighlightLayer("hl1", scene);

    // 🔹 Variabile di selezione (DEVE stare QUI, prima di selectRoot)
    let selectedRoot = null;

    // Comportamento di drag su piano orizzontale (X/Z)
    const dragBehavior = new BABYLON.PointerDragBehavior({
        dragPlaneNormal: new BABYLON.Vector3(0, 1, 0)
    });
    dragBehavior.moveAttached = true;

    // 🔹 Funzione che usa selectedRoot
    function selectRoot(rootMesh) {
        // rimuovi highlight/drag da eventuale selezione precedente
        if (selectedRoot) {
            hl.removeAllMeshes();
            selectedRoot.removeBehavior(dragBehavior);
        }

        selectedRoot = rootMesh;

        if (selectedRoot) {
            hl.addMesh(selectedRoot, BABYLON.Color3.Yellow());
            selectedRoot.addBehavior(dragBehavior);
        }
    }

    // ****************************
    // Caricamento modello spazio
    // ****************************
    await BABYLON.SceneLoader.AppendAsync("./", "space.glb", scene);

    // ****************************
    // Caricamento sedia
    // ****************************
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

    sediaResult.meshes.forEach(m => {
        if (!m.metadata) m.metadata = {};
        m.metadata.selectable = true;
        m.metadata.root = sediaRoot;
    });

    // 🖱 Gestione click
    scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                const pick = pointerInfo.pickInfo;
                if (pick && pick.hit && pick.pickedMesh) {
                    const mesh = pick.pickedMesh;

                    if (mesh.metadata && mesh.metadata.selectable) {
                        const root = mesh.metadata.root || mesh;
                        selectRoot(root);
                    } else {
                        selectRoot(null);
                    }
                } else {
                    selectRoot(null);
                }
                break;
        }
    });

    return scene;
};

createScene().then(scene => {
    engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());
