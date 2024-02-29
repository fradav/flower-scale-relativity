import { Pass } from 'three/examples/jsm/postprocessing/Pass'
import { FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass'
import { getSurfaceIdMaterial, getDebugSurfaceIdMaterial } from './FindSurfaces'
import {
  Scene,
  Camera,
  WebGLRenderTarget,
  WebGLRenderer,
  Vector2,
  MeshNormalMaterial,
  ShaderMaterial,
  DepthTexture,
  Texture,
  RGBAFormat,
  HalfFloatType,
  NearestFilter,
  Color,
  Vector4,
  PerspectiveCamera,
} from 'three'

class CustomOutlinePass extends Pass {
  renderScene: Scene
  renderCamera: Camera
  resolution: Vector2
  fsQuad: FullScreenQuad
  surfaceBuffer: WebGLRenderTarget
  normalOverrideMaterial: MeshNormalMaterial
  surfaceIdOverrideMaterial: ShaderMaterial
  surfaceIdDebugOverrideMaterial: ShaderMaterial

  constructor(
    resolution: Vector2,
    scene: Scene,
    camera: Camera
  ) {
    super()

    this.renderScene = scene
    this.renderCamera = camera
    this.resolution = new Vector2(resolution.x, resolution.y)

    this.fsQuad = new FullScreenQuad()
    this.fsQuad.material = this.createOutlinePostProcessMaterial()

    const surfaceBuffer = new WebGLRenderTarget(
      this.resolution.x,
      this.resolution.y
    )
    surfaceBuffer.texture.format = RGBAFormat
    surfaceBuffer.texture.type = HalfFloatType
    surfaceBuffer.texture.minFilter = NearestFilter
    surfaceBuffer.texture.magFilter = NearestFilter
    surfaceBuffer.texture.generateMipmaps = false
    surfaceBuffer.stencilBuffer = false
    this.surfaceBuffer = surfaceBuffer

    this.normalOverrideMaterial = new MeshNormalMaterial()
    this.surfaceIdOverrideMaterial = getSurfaceIdMaterial()
    this.surfaceIdDebugOverrideMaterial = getDebugSurfaceIdMaterial();
  }

  dispose(): void {
    this.surfaceBuffer.dispose()
    this.fsQuad.dispose()
  }

  updateMaxSurfaceId(maxSurfaceId: number): void {
    this.surfaceIdOverrideMaterial.uniforms.maxSurfaceId.value = maxSurfaceId
  }

  setSize(width: number, height: number): void {
    this.surfaceBuffer.setSize(width, height)
    this.resolution.set(width, height)

    const fsQuadMaterial = this.fsQuad.material as ShaderMaterial // Update the type of this.fsQuad.material to ShaderMaterial
    fsQuadMaterial.uniforms.screenSize.value.set(
      this.resolution.x,
      this.resolution.y,
      1 / this.resolution.x,
      1 / this.resolution.y
    )
  }

  getDebugVisualizeValue() {
    const fsQuadMaterial = this.fsQuad.material as ShaderMaterial
    return fsQuadMaterial.uniforms.debugVisualize.value;
  }

  isUsingSurfaceIds() {
    const debugVisualize = this.getDebugVisualizeValue();

    return (
      debugVisualize == 0 || // Main outlines v2 mode
      debugVisualize == 5 || // Render just surfaceID debug buffer
      debugVisualize == 6
    ); // Render just outlines with surfaceId
  }

  render(
    renderer: WebGLRenderer,
    writeBuffer: WebGLRenderTarget,
    readBuffer: WebGLRenderTarget
  ): void {
    const depthBufferValue = writeBuffer.depthBuffer
    writeBuffer.depthBuffer = false

    renderer.setRenderTarget(this.surfaceBuffer)
    
    const overrideMaterialValue = this.renderScene.overrideMaterial
    if (this.isUsingSurfaceIds()) {
      // Render the "surface ID buffer"
      if (this.getDebugVisualizeValue() == 5) {
        this.renderScene.overrideMaterial = this.surfaceIdDebugOverrideMaterial;
      } else {
        this.renderScene.overrideMaterial = this.surfaceIdOverrideMaterial;
      }
    } else {
      // Render normal buffer
      this.renderScene.overrideMaterial = this.normalOverrideMaterial;
    }

    // this.renderScene.overrideMaterial = this.surfaceIdOverrideMaterial
    renderer.render(this.renderScene, this.renderCamera)
    this.renderScene.overrideMaterial = overrideMaterialValue

    // Update the type of this.fsQuad.material to ShaderMaterial
    const fsQuadMaterial = this.fsQuad.material as ShaderMaterial
     
    fsQuadMaterial.uniforms['depthBuffer'].value = readBuffer.depthTexture
    fsQuadMaterial.uniforms['surfaceBuffer'].value = this.surfaceBuffer.texture
    fsQuadMaterial.uniforms['sceneColorBuffer'].value = readBuffer.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
      this.fsQuad.render(renderer)
    } else {
      renderer.setRenderTarget(writeBuffer)
      this.fsQuad.render(renderer)
    }

    writeBuffer.depthBuffer = depthBufferValue
  }

  get vertexShader(): string {
    return `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
      `
  }

  get fragmentShader() {
    return `
                #include <packing>
                // The above include imports "perspectiveDepthToViewZ"
                // and other GLSL functions from ThreeJS we need for reading depth.
                uniform sampler2D sceneColorBuffer;
                uniform sampler2D depthBuffer;
                uniform sampler2D surfaceBuffer;
                uniform float cameraNear;
                uniform float cameraFar;
                uniform vec4 screenSize;
                uniform vec3 outlineColor;
                uniform vec2 multiplierParameters;
    
                varying vec2 vUv;
    
                // Helper functions for reading from depth buffer.
                float readDepth (sampler2D depthSampler, vec2 coord) {
                    float fragCoordZ = texture2D(depthSampler, coord).x;
                    float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
                    return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
                }
                float getLinearDepth(vec3 pos) {
                    return -(viewMatrix * vec4(pos, 1.0)).z;
                }
    
                float getLinearScreenDepth(sampler2D map) {
                        vec2 uv = gl_FragCoord.xy * screenSize.zw;
                        return readDepth(map,uv);
                }
                // Helper functions for reading normals and depth of neighboring pixels.
                float getPixelDepth(int x, int y) {
                    // screenSize.zw is pixel size 
                    // vUv is current position
                    return readDepth(depthBuffer, vUv + screenSize.zw * vec2(x, y));
                }
                // "surface value" is either the normal or the "surfaceID"
                vec3 getSurfaceValue(int x, int y) {
                    vec3 val = texture2D(surfaceBuffer, vUv + screenSize.zw * vec2(x, y)).rgb;
                    return val;
                }
    
                float saturateValue(float num) {
                    return clamp(num, 0.0, 1.0);
                }
    
                float getSufaceIdDiff(vec3 surfaceValue) {
                    float surfaceIdDiff = 0.0;
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(1, 0));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(0, 1));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(0, 1));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(0, -1));
    
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(1, 1));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(1, -1));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(-1, 1));
                    surfaceIdDiff += distance(surfaceValue, getSurfaceValue(-1, -1));
                    return surfaceIdDiff;
                }
    
                void main() {
                    vec4 sceneColor = texture2D(sceneColorBuffer, vUv);
                    float depth = getPixelDepth(0, 0);
                    vec3 surfaceValue = getSurfaceValue(0, 0);
    
                    // Get the difference between depth of neighboring pixels and current.
                    float depthDiff = 0.0;
                    depthDiff += abs(depth - getPixelDepth(1, 0));
                    depthDiff += abs(depth - getPixelDepth(-1, 0));
                    depthDiff += abs(depth - getPixelDepth(0, 1));
                    depthDiff += abs(depth - getPixelDepth(0, -1));
    
                    // Get the difference between surface values of neighboring pixels
                    // and current
                    float surfaceValueDiff = getSufaceIdDiff(surfaceValue);
                    
                    // Apply multiplier & bias to each 
                    float depthBias = multiplierParameters.x;
                    float depthMultiplier = multiplierParameters.y;
    
                    depthDiff = depthDiff * depthMultiplier;
                    depthDiff = saturateValue(depthDiff);
                    depthDiff = pow(depthDiff, depthBias);
    
                    if (surfaceValueDiff != 0.0) surfaceValueDiff = 1.0;
    
                    float outline = saturateValue(surfaceValueDiff + depthDiff);
                
                    // Combine outline with scene color.
                    vec4 outlineColor = vec4(outlineColor, 1.0);
                    gl_FragColor = vec4(mix(sceneColor, outlineColor, outline));
                }
                `
  }

  createOutlinePostProcessMaterial() {
    return new ShaderMaterial({
      uniforms: {
        debugVisualize: { value: 0 },
        sceneColorBuffer: { value: DepthTexture },
        depthBuffer: { value: Texture },
        surfaceBuffer: { value: Texture },
        outlineColor: { value: new Color(0x000000) },
        //4 scalar values packed in one uniform:
        //  depth multiplier, depth bias
        multiplierParameters: {
          value: new Vector4(0.9, 20,1,1),
        },
        cameraNear: {
          value: (this.renderCamera as PerspectiveCamera).near,
        },
        cameraFar: {
          value: (this.renderCamera as PerspectiveCamera).far,
        },
        screenSize: {
          value: new Vector4(
            this.resolution.x,
            this.resolution.y,
            1 / this.resolution.x,
            1 / this.resolution.y
          ),
        },
      },
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    })
  }
}

export { CustomOutlinePass }
