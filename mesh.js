import vertShaderSrc from "./phong2.vert.js";
import fragShaderSrc from "./phong2.frag.js";
import Shader from "./shader.js";
import { HalfEdgeDS } from "./half-edge.js";

export default class Mesh {
  constructor(delta) {
    // Estrutura de dados do modelo
    this.halfEdgeDS = new HalfEdgeDS();

    // Matriz de modelagem
    this.rotationAngle = 0;
    this.delta = delta;
    this.modelMatrix = mat4.create();

    // Centro de massa e altura do modelo
    this.centerOfMass = [0, 0, 0];
    this.modelHeight = 0;
    this.highestVertex = [0, 0, 0];

    // Programas e shaders
    this.vertexShader = null;
    this.fragmentShader = null;
    this.shaderProgram = null;

    // Localizações de dados
    this.vaoLocation = -1;
    this.indicesLocation = -1;

    this.modelMatrixLocation = -1;
    this.viewMatrixLocation = -1;
    this.projectionMatrixLocation = -1;

    // Textura
    this.colorMap = [];
    this.colorMapLocation = -1;
    this.textureColorMap = -1;
    this.uColorMapLocation = -1;
  }

  isReady() {
    return this.halfEdgeDS.isReady();
  }

  calculateCenterOfMass(vertices) {
    const numVertices = vertices.length;
    let sumX = 0, sumY = 0, sumZ = 0;

    vertices.forEach((vertex) => {
      sumX += vertex[0];
      sumY += vertex[1];
      sumZ += vertex[2];
    });

    return [sumX / numVertices, sumY / numVertices, sumZ / numVertices];
  }

  calculateHeight(vertices) {
    const yValues = vertices.map((v) => v[1]);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);
    return maxY - minY;
  }

  async loadMeshV4() {
    const response = await fetch("bunny.obj");
    const text = await response.text();
    const lines = text.split("\n");

    const vertices = [];
    const indices = [];

    let maxY = -Infinity;
    let minY = Infinity;

    let sumX = 0, sumY = 0, sumZ = 0;

    lines.forEach((line) => {
      const parts = line.trim().split(/\s+/);
      const type = parts[0];

      if (type === "v") {
        vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3]),
          1
        );

        if (parseFloat(parts[2]) > maxY) {
          maxY = parseFloat(parts[2]);
          this.highestVertex = [
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
      } else if (type === "f") {
        for (let i = 1; i < parts.length; i++) {
          const vertex = parts[i].split("/");
          indices.push(parseInt(vertex[0]) - 1);
        }
      }
    });

    this.modelHeight = maxY - minY;
    this.centerOfMass = [
      sumX / vertices.length,
      sumY / vertices.length,
      sumZ / vertices.length,
    ];

    this.halfEdgeDS.build(vertices, indices);

    // Identificar os vértices das orelhas
    const earVertices = this.halfEdgeDS.vertices.filter(v => v.position[1] > maxY - 0.2 * this.modelHeight);
    earVertices.forEach(v => v.scalar = 1.0); // Marcar os vértices das orelhas com um escalar de 1.0
  }

  createShader(gl) {
    this.vertexShader = Shader.createShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
    this.fragmentShader = Shader.createShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
    this.shaderProgram = Shader.createProgram(gl, this.vertexShader, this.fragmentShader);

    gl.useProgram(this.shaderProgram);
  }

  createUniforms(gl) {
    this.modelMatrixLocation = gl.getUniformLocation(this.shaderProgram, "u_model");
    this.viewMatrixLocation = gl.getUniformLocation(this.shaderProgram, "u_view");
    this.projectionMatrixLocation = gl.getUniformLocation(this.shaderProgram, "u_projection");
  }

  createVAO(gl) {
    const vbos = this.halfEdgeDS.getVBOs();

    const positionAttributeLocation = gl.getAttribLocation(this.shaderProgram, "position");
    const positionBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[0]));

    const scalarAttributeLocation = gl.getAttribLocation(this.shaderProgram, "scalar");
    const scalarBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[1]));

    const normalAttributeLocation = gl.getAttribLocation(this.shaderProgram, "normal");
    const normalBuffer = Shader.createBuffer(gl, gl.ARRAY_BUFFER, new Float32Array(vbos[2]));

    this.vaoLocation = Shader.createVAO(
      gl,
      positionAttributeLocation,
      positionBuffer,
      scalarAttributeLocation,
      scalarBuffer,
      normalAttributeLocation,
      normalBuffer
    );

    this.indicesLocation = Shader.createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(vbos[3]));
  }

  init(gl, light) {
    this.createShader(gl);
    this.createUniforms(gl);
    this.createVAO(gl);

    light.createUniforms(gl, this.shaderProgram);
  }

  updateModelMatrix() {
    mat4.identity(this.modelMatrix);
    mat4.translate(this.modelMatrix, this.modelMatrix, [
      -this.centerOfMass[0],
      -this.centerOfMass[1],
      -this.centerOfMass[2],
    ]);

    const targetHeight = 50.0;
    const scaleFactor = targetHeight / this.modelHeight;
    mat4.scale(this.modelMatrix, this.modelMatrix, [scaleFactor, scaleFactor, scaleFactor]);

    mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotationAngle);
  }

  draw(gl, cam, light) {
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.updateModelMatrix();

    const model = this.modelMatrix;
    const view = cam.getView();
    const proj = cam.getProj();

    gl.useProgram(this.shaderProgram);
    gl.uniformMatrix4fv(this.modelMatrixLocation, false, model);
    gl.uniformMatrix4fv(this.viewMatrixLocation, false, view);
    gl.uniformMatrix4fv(this.projectionMatrixLocation, false, proj);

    gl.drawElements(gl.TRIANGLES, this.halfEdgeDS.faces.length * 3, gl.UNSIGNED_INT, 0);

    gl.disable(gl.CULL_FACE);
  }
}