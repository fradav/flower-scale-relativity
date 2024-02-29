import { Mesh, BufferGeometry, ShaderMaterial } from 'three';

class FindSurfaces {
  surfaceId: number;

  constructor() {
    this.surfaceId = 0;
  }

  getSurfaceIdAttribute(mesh: Mesh): Float32Array {
    const bufferGeometry = mesh.geometry as BufferGeometry;
    const numVertices = bufferGeometry.attributes.position.count;
    const vertexIdToSurfaceId = this._generateSurfaceIds(mesh);

    const colors: number[] = [];
    for (let i = 0; i < numVertices; i++) {
      const vertexId = i;
      let surfaceId = vertexIdToSurfaceId[vertexId];

      colors.push(surfaceId, 0, 0, 1);
    }

    const colorsTypedArray = new Float32Array(colors);
    return colorsTypedArray;
  }

  _generateSurfaceIds(mesh: Mesh): { [key: number]: number } {
    const bufferGeometry = mesh.geometry as BufferGeometry;
    const numVertices = bufferGeometry.attributes.position.count;
    const numIndices = bufferGeometry.index!.count;
    const indexBuffer = bufferGeometry.index!.array;
    const vertexBuffer = bufferGeometry.attributes.position.array;
    const vertexMap: { [key: number]: number[] } = {};
    for (let i = 0; i < numIndices; i += 3) {
      const i1 = indexBuffer[i + 0];
      const i2 = indexBuffer[i + 1];
      const i3 = indexBuffer[i + 2];

      add(i1, i2);
      add(i1, i3);
      add(i2, i3);
    }
    function add(a: number, b: number) {
      if (vertexMap[a] == undefined) vertexMap[a] = [];
      if (vertexMap[b] == undefined) vertexMap[b] = [];

      if (vertexMap[a].indexOf(b) == -1) vertexMap[a].push(b);
      if (vertexMap[b].indexOf(a) == -1) vertexMap[b].push(a);
    }

    const frontierNodes = Object.keys(vertexMap).map((v) => Number(v));
    const exploredNodes: { [key: number]: boolean } = {};
    const vertexIdToSurfaceId: { [key: number]: number } = {};

    while (frontierNodes.length > 0) {
      const node = frontierNodes.pop();
      if (exploredNodes[node!]) continue;

      const surfaceVertices = getNeighborsNonRecursive(node!);
      for (let v of surfaceVertices) {
        exploredNodes[v] = true;
        vertexIdToSurfaceId[v] = this.surfaceId;
      }

      this.surfaceId += 1;
    }
    function getNeighborsNonRecursive(node: number): number[] {
      const frontier = [node];
      const explored: { [key: number]: boolean } = {};
      const result: number[] = [];

      while (frontier.length > 0) {
        const currentNode = frontier.pop();
        if (explored[currentNode!]) continue;
        const neighbors = vertexMap[currentNode!];
        result.push(currentNode!);

        explored[currentNode!] = true;

        for (let n of neighbors) {
          if (!explored[n]) {
            frontier.push(n);
          }
        }
      }

      return result;
    }

    return vertexIdToSurfaceId;
  }
}

export default FindSurfaces;

export function getSurfaceIdMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    uniforms: {
      maxSurfaceId: { value: 1 },
    },
    vertexShader: getVertexShader(),
    fragmentShader: getFragmentShader(),
    vertexColors: true,
  });
}

function getVertexShader(): string {
  return `
  varying vec2 v_uv;
  varying vec4 vColor;

  void main() {
     v_uv = uv;
     vColor=vec4(color, 1.0);

     gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `;
}

function getFragmentShader(): string {
  return `
  varying vec2 v_uv;
  varying vec4 vColor;
  uniform float maxSurfaceId;

  void main() {
    // Normalize the surfaceId when writing to texture
    // Surface ID needs rounding as precision can be lost in perspective correct interpolation 
    // - see https://github.com/OmarShehata/webgl-outlines/issues/9 for other solutions eg. flat interpolation.
    float surfaceId = round(vColor.r) / maxSurfaceId;
    gl_FragColor = vec4(surfaceId, 0.0, 0.0, 1.0);
  }
  `;
}

export function getDebugSurfaceIdMaterial() {
  return new ShaderMaterial({
    uniforms: {},
    vertexShader: getVertexShader(),
    fragmentShader: `
  varying vec2 v_uv;
  varying vec4 vColor;

  void main() {      
      int surfaceId = int(round(vColor.r) * 100.0);
      float R = float(surfaceId % 255) / 255.0;
      float G = float((surfaceId + 50) % 255) / 255.0;
      float B = float((surfaceId * 20) % 255) / 255.0;

      gl_FragColor = vec4(R, G, B, 1.0);
  }
  `,
    vertexColors: true,
  });
}