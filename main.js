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

    // Rendo tutti i mesh della sedia "selezionabili"
    sediaResult.meshes.forEach(m => {
        if (!m.metadata) m.metadata = {};
        m.metadata.selectable = true;
        m.metadata.root = sediaRoot; // così se clicchi un pezzo, risaliamo al root
    });

    // 🔍 Funzione per selezionare un oggetto (sedia)
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

    // 🖱 Gestione click del mouse
    scene.onPointerObservable.add(pointerInfo => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                const pick = pointerInfo.pickInfo;
                if (pick && pick.hit && pick.pickedMesh) {
                    const mesh = pick.pickedMesh;

                    // Se il mesh ha metadata.selectable, prendiamo il suo root
                    if (mesh.metadata && mesh.metadata.selectable) {
                        const root = mesh.metadata.root || mesh;
                        selectRoot(root);
                    } else {
                        // clic su vuoto o oggetto non selezionabile → deseleziona
                        selectRoot(null);
                    }
                } else {
                    // clic nel vuoto
                    selectRoot(null);
                }
                break;
        }
    });

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
