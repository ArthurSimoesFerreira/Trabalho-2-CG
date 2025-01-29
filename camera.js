export default class Camera {
  constructor(gl) {
    // Posição da camera
    this.eye = vec3.fromValues(1.0, 1.0, 1.0);
    this.at = vec3.fromValues(0.0, 0.0, 0.0);
    this.up = vec3.fromValues(0.0, 1.0, 0.0);

    // Parâmetros da projeção
    this.fovy = Math.PI / 2;
    this.aspect = gl.canvas.width / gl.canvas.height;

    this.near = 0.1;
    this.far = 1000.0;

    // Configurações da câmera ortográfica
    this.left = -100;
    this.right = 100;
    this.top = 100;
    this.bottom = -100;

    this.angle = 0;
    //this.type = "perspective";
    this.currentMode = "ortho";

    // Matrizes View e Projection
    this.view = mat4.create();
    this.proj = mat4.create();
  }

  getView() {
    return this.view;
  }

  getProj() {
    return this.proj;
  }

  updateViewMatrix() {
    mat4.identity(this.view);
    if (this.currentMode === "perspective") {
      // Câmera perspectiva: orbita em torno da origem
      this.angle += 0.01; // Incremento para simular órbita
      const radius = 150.0;

      this.eye = vec3.fromValues(
        radius * Math.cos(this.angle),
        radius * Math.sin(this.angle),
        radius * 0.7
      );
      mat4.lookAt(this.view, this.eye, this.at, this.up);
    } else if (this.currentMode === "ortho") {
      // Câmera ortogonal: fixa em (50, 50, 50) olhando para a origem
      this.eye = vec3.fromValues(50, 50, 50);
      this.at = vec3.fromValues(0, 0, 0);
      mat4.lookAt(this.view, this.eye, this.at, this.up);
    }
  }

  updateProjectionMatrix() {
    mat4.identity(this.proj);
    if (this.currentMode === "perspective") {
      mat4.perspective(this.proj, this.fovy, this.aspect, this.near, this.far);
    } else if (this.currentMode === "ortho") {
      mat4.ortho(
        this.proj,
        this.left,
        this.right,
        this.bottom,
        this.top,
        this.near,
        this.far
      );
    }
  }

  updateCam() {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
}
