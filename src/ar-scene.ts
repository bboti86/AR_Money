import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { CalculationResult, PALLET_WIDTH_M, PALLET_LENGTH_M, PALLET_MAX_HEIGHT_M } from './calculator';

export class ARMoneyScene {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  
  private hitTestSource: XRHitTestSource | null = null;
  private hitTestSourceRequested = false;
  private reticle: THREE.Mesh;
  
  private currentResult: CalculationResult | null = null;
  private instantiatedGroup: THREE.Group | null = null;

  constructor(container: HTMLElement) {
    this.container = container;

    // Setup Scene
    this.scene = new THREE.Scene();

    // Setup Camera
    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Setup Light
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 3);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    // Setup Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // Setup AR Button
    const arButtonContainer = document.getElementById('ar-button-container');
    if (arButtonContainer) {
      const arButton = ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] });
      // override some ARButton styling so it fits Tailwind UI
      arButton.style.position = 'relative';
      arButton.style.bottom = 'auto';
      arButton.style.padding = '12px 24px';
      arButton.style.border = '1px solid #10b981';
      arButton.style.borderRadius = '8px';
      arButton.style.background = '#10b981';
      arButton.style.color = '#fff';
      arButton.style.fontWeight = 'bold';
      arButton.style.cursor = 'pointer';
      
      arButtonContainer.appendChild(arButton);
    }

    // Reticle
    this.reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }) // Reticle color
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    // Controller
    const controller = this.renderer.xr.getController(0);
    controller.addEventListener('select', this.onSelect.bind(this));
    this.scene.add(controller);

    // Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));

    // Animation Loop
    this.renderer.setAnimationLoop(this.render.bind(this));
  }

  public updateCalculation(result: CalculationResult) {
    this.currentResult = result;
  }

  private onSelect() {
    if (this.reticle.visible && this.currentResult) {
      // Create the group of pallets if not already created, or clear and recreate
      if (this.instantiatedGroup) {
        this.scene.remove(this.instantiatedGroup);
      }
      
      this.instantiatedGroup = this.createPalletsGroup(this.currentResult);
      
      this.reticle.matrix.decompose(
        this.instantiatedGroup.position,
        this.instantiatedGroup.quaternion,
        this.instantiatedGroup.scale
      );
      
      this.scene.add(this.instantiatedGroup);
    }
  }

  private createPalletsGroup(result: CalculationResult): THREE.Group {
    const group = new THREE.Group();
    
    // Using an unnatural neon magenta color as requested by user
    const material = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    
    const fullPallets = result.fullPallets;
    const gap = 0.1; // 10cm gap
    
    const cols = Math.ceil(Math.sqrt(fullPallets + (result.remainderBills > 0 ? 1 : 0)));
    
    let currentIndex = 0;
    
    // Add full pallets
    for (let i = 0; i < fullPallets; i++) {
      const geometry = new THREE.BoxGeometry(PALLET_WIDTH_M, PALLET_MAX_HEIGHT_M, PALLET_LENGTH_M);
      const mesh = new THREE.Mesh(geometry, material);
      
      const row = Math.floor(currentIndex / cols);
      const col = currentIndex % cols;
      
      mesh.position.set(
        col * (PALLET_WIDTH_M + gap),
        PALLET_MAX_HEIGHT_M / 2, // shift up to rest on floor
        row * (PALLET_LENGTH_M + gap)
      );
      
      group.add(mesh);
      currentIndex++;
    }

    // Add remainder
    if (result.remainderBills > 0 && result.remainderDimensions.height > 0) {
      const geometry = new THREE.BoxGeometry(
        result.remainderDimensions.width,
        result.remainderDimensions.height,
        result.remainderDimensions.length
      );
      const mesh = new THREE.Mesh(geometry, material);
      
      const row = Math.floor(currentIndex / cols);
      const col = currentIndex % cols;
      
      mesh.position.set(
        col * (PALLET_WIDTH_M + gap),
        result.remainderDimensions.height / 2,
        row * (PALLET_LENGTH_M + gap)
      );
      
      group.add(mesh);
    }

    return group;
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private render(timestamp: number, frame: XRFrame) {
    if (frame) {
      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();

      if (this.hitTestSourceRequested === false && session) {
        session.requestReferenceSpace('viewer').then((referenceSpace) => {
          session.requestHitTestSource({ space: referenceSpace })?.then((source) => {
            this.hitTestSource = source;
          });
        });
        session.addEventListener('end', () => {
          this.hitTestSourceRequested = false;
          this.hitTestSource = null;
        });
        this.hitTestSourceRequested = true;
      }

      if (this.hitTestSource && referenceSpace) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          if (pose) {
            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          this.reticle.visible = false;
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
