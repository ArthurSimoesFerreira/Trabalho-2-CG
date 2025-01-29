import vertShaderSrc from "./phong2.vert.js";
import fragShaderSrc from "./phong2.frag.js";

import Shader from "./shader.js";
import { HalfEdgeDS } from "./half-edge.js";

export default class Mesh {
  constructor(delta) {
    // model data structure
    this.heds = new HalfEdgeDS();

    // Matriz de modelagem
    this.angle = 0;
    this.delta = delta;
    this.model = mat4.create();

    // Centro de massa
    this.centerOfMass = [0, 0, 0];
    this.currentHeight = 0;
    this.MaxYVert = [0, 0, 0];

    // Shader program
    this.vertShd = null;
    this.fragShd = null;
    this.program = null;

    // Data location
    this.vaoLoc = -1;
    this.indicesLoc = -1;

    this.uModelLoc = -1;
    this.uViewLoc = -1;
    this.uProjectionLoc = -1;

    // texture
    this.colorMap = [];
    this.colorMapLoc = -1;

    this.texColorMap = -1;
    this.uColorMap = -1;
  }

  isReady() {
    return this.heds.isReady();
  }

  calculateCenterOfMass(vertices) {
    const numVertices = vertices.length;
    let sumX = 0,
      sumY = 0,
      sumZ = 0;

    vertices.forEach((vertex) => {
      sumX += vertex[0];
      sumY += vertex[1];
      sumZ += vertex[2];
    });

    const centerX = sumX / numVertices;
    const centerY = sumY / numVertices;
    const centerZ = sumZ / numVertices;

    return [centerX, centerY, centerZ];
  }

  calculateHeight(vertices) {
    const yValues = vertices.map((v) => v[1]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    return maxY - minY;
  }

  async loadMeshV4() {
    //const resp = await fetch('model.obj');
    const resp = await fetch("bunny.obj");
    const text = await resp.text();
    //console.log(text);

    // Split the text by lines
    const lines = text.split("\n"); //

    const vertices = []; //
    const normals = []; //
    const faces = []; //
    const indices = [];

    let maxY = -Infinity;
    let minY = Infinity;

    let sumX = 0;
    let sumY = 0;
    let sumZ = 0;
    // Parse each line of the OBJ file
    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const type = parts[0];
      //console.log(parts);
      if (type === "v") {
        // Vertex data: v x y z
        //const vertex = parts.slice(1).map(Number); // Convert to numbers
        //vertices.push(vertex);
        vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          1
        );
        if (parseFloat(parts[2]) > maxY) {
          maxY = parseFloat(parts[2]);
          this.MaxYVert = [
            parseFloat(parts[1]),
            parseFloat(parts[2]),
            parseFloat(parts[3]),
          ];
        }
        if (parseFloat(parts[2]) < minY) {
          minY = parseFloat(parts[2]);
        }
        sumX += parseFloat(parts[1]);
        sumY += parseFloat(parts[2]);
        sumZ += parseFloat(parts[3]);
      }
      else if (type === "f") {
        for (let i = 1; i < parts.length; i++) {
          const vertex = parts[i].split("/");
          indices.push(parseInt(vertex[0]) - 1);
        }
      }
    });

    this.currentHeight = maxY - minY;
    this.centerOfMass = [
      sumX / vertices.length,
      sumY / vertices.length,
      sumZ / vertices.length,
    ];


    console.log(this.centerOfMass);
    console.log(this.currentHeight);

    this.heds.build(vertices, indices); // Build the half-edge data structure
    // find MaxYvert neighbors
    //let neighbors = this.heds.findNeighbors(this.MaxYVert);

    // Identificar os vértices das orelhas
    const earVertices = this.heds.vertices.filter(v => v.position[1] > maxY - 0.2 * this.currentHeight);
    earVertices.forEach(v => v.scalar = 1.0); // Marcar os vértices das orelhas com um escalar de 1.0
  }

  createShader(gl) {
    this.vertShd = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    this.fragShd = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    this.program = Shader.createProgram(gl, this.vertShd, this.fragShd);

    gl.useProgram(this.program);
  }

  createUniforms(gl) {
    this.uModelLoc = gl.getUniformLocation(this.program, "u_model");
    this.uViewLoc = gl.getUniformLocation(this.program, "u_view");
    this.uProjectionLoc = gl.getUniformLocation(this.program, "u_projection");
  }

  createVAO(gl) {
    const vbos = this.heds.getVBOs();
    console.log(vbos);

    var coordsAttributeLocation = gl.getAttribLocation(
      this.program,
      "position"
    );
    const coordsBuffer = Shader.createBuffer(
      gl,
      gl.ARRAY_BUFFER,
      new Float32Array(vbos[0])
    );

    var scalarsAttributeLocation = gl.getAttribLocation(this.program, "scalar");
    const scalarsBuffer = Shader.createBuffer(
      gl,
      gl.ARRAY_BUFFER,
      new Float32Array(vbos[1])
    );

    var normalsAttributeLocation = gl.getAttribLocation(this.program, "normal");
    const normalsBuffer = Shader.createBuffer(
      gl,
      gl.ARRAY_BUFFER,
      new Float32Array(vbos[2])
    );

    this.vaoLoc = Shader.createVAO(
      gl,
      coordsAttributeLocation,
      coordsBuffer,
      scalarsAttributeLocation,
      scalarsBuffer,
      normalsAttributeLocation,
      normalsBuffer
    );

    this.indicesLoc = Shader.createBuffer(
      gl,
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint32Array(vbos[3])
    );
  }

  init(gl, light) {
    this.createShader(gl);
    this.createUniforms(gl);
    this.createVAO(gl);

    light.createUniforms(gl, this.program);
  }

  updateModelMatrix() {
    //this.angle += 0.005;

    mat4.identity(this.model);
    mat4.translate(this.model, this.model, [
      -this.centerOfMass[0],
      -this.centerOfMass[1],
      -this.centerOfMass[2],
    ]);

    const targetHeight = 50.0; // Altura desejada
    const scaleFactor = targetHeight / this.currentHeight;
    // Fator de escala com base na altura atual
    mat4.scale(this.model, this.model, [scaleFactor, scaleFactor, scaleFactor]);

    mat4.rotateY(this.model, this.model, this.angle);
  }

  draw(gl, cam, light) {
    // faces orientadas no sentido anti-horário
    gl.frontFace(gl.CCW);

    // face culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // updates the model transformations
    this.updateModelMatrix();

    const model = this.model;
    const view = cam.getView();
    const proj = cam.getProj();

    gl.useProgram(this.program);
    gl.uniformMatrix4fv(this.uModelLoc, false, model);
    gl.uniformMatrix4fv(this.uViewLoc, false, view);
    gl.uniformMatrix4fv(this.uProjectionLoc, false, proj);

    gl.drawElements(
      gl.TRIANGLES,
      this.heds.faces.length * 3,
      gl.UNSIGNED_INT,
      0
    );

    gl.disable(gl.CULL_FACE);
  }
}
