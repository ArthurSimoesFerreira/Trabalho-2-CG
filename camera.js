export default class Camera {
  constructor(gl) {
    this.eyePosition = vec3.fromValues(1.0, 1.0, 1.0);
    this.lookAtPosition = vec3.fromValues(0.0, 0.0, 0.0);
    this.upVector = vec3.fromValues(0.0, 1.0, 0.0);

    this.fieldOfView = Math.PI / 2;
    this.aspectRatio = gl.canvas.width / gl.canvas.height;

    this.nearPlane = 0.1;
    this.farPlane = 1000.0;

    this.left = -100;
    this.right = 100;
    this.top = 100;
    this.bottom = -100;

    this.rotationAngle = 0;
    this.currentMode = "ortho";

    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
  }

  getView() {
    return this.viewMatrix;
  }

  getProj() {
    return this.projectionMatrix;
  }

  updateViewMatrix() {
    mat4.identity(this.viewMatrix);
    if (this.currentMode === "perspective") {
      this.rotationAngle += 0.01;
      const radius = 150.0;

      this.eyePosition = vec3.fromValues(
        radius * Math.cos(this.rotationAngle),
        radius * Math.sin(this.rotationAngle),
        radius * 0.7
      );
      mat4.lookAt(this.viewMatrix, this.eyePosition, this.lookAtPosition, this.upVector);
    } else if (this.currentMode === "ortho") {
      this.eyePosition = vec3.fromValues(50, 50, 50);
      this.lookAtPosition = vec3.fromValues(0, 0, 0);
      mat4.lookAt(this.viewMatrix, this.eyePosition, this.lookAtPosition, this.upVector);
    }
  }

  updateProjectionMatrix() {
    mat4.identity(this.projectionMatrix);
    if (this.currentMode === "perspective") {
      mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspectRatio, this.nearPlane, this.farPlane);
    } else if (this.currentMode === "ortho") {
      mat4.ortho(this.projectionMatrix, this.left, this.right, this.bottom, this.top, this.nearPlane, this.farPlane);
    }
  }

  updateCam() {
    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }
}