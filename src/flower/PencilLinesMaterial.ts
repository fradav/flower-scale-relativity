import fragmentShader from './pencilLines.frag.glsl'
import vertexShader from './pencilLines.vert.glsl'
import { ShaderMaterial, Vector2 } from 'three'

export class PencilLinesMaterial extends ShaderMaterial {
	constructor() {
		super({
			uniforms: {
				tDiffuse: { value: null },
				uNormals: { value: null },
				uResolution: {
					value: new Vector2(1, 1)
				}
			},
			fragmentShader,
			vertexShader
		})
	}
}
