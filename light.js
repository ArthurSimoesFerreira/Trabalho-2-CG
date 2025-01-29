export default class Light {
  constructor() {
    // Primeira luz
    this.pos1 = vec4.fromValues(-100, 100, 0, 1.0);

    this.amb_c1 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.amb_k1 = 0.2;

    this.dif_c1 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.dif_k1 = 0.6;

    this.esp_c1 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    this.esp_k1 = 0.3;
    this.esp_p1 = 5.0;

    // Segunda luz (amarela)
    this.pos2 = vec4.fromValues(100, 100, 0, 1.0);

    this.amb_c2 = vec4.fromValues(1.0, 1.0, 0.0, 1.0);
    this.amb_k2 = 0.2;

    this.dif_c2 = vec4.fromValues(1.0, 1.0, 0.0, 1.0);
    this.dif_k2 = 0.6;

    this.esp_c2 = vec4.fromValues(1.0, 1.0, 0.0, 1.0);
    this.esp_k2 = 0.3;
    this.esp_p2 = 5.0;
  }

  createUniforms(gl, program) {
    // Configuração da primeira luz
    const pos1Loc = gl.getUniformLocation(program, "light_pos");
    gl.uniform4fv(pos1Loc, this.pos1);

    const ambC1Loc = gl.getUniformLocation(program, "light_amb_c");
    gl.uniform4fv(ambC1Loc, this.amb_c1);
    const ambK1Loc = gl.getUniformLocation(program, "light_amb_k");
    gl.uniform1f(ambK1Loc, this.amb_k1);

    const difC1Loc = gl.getUniformLocation(program, "light_dif_c");
    gl.uniform4fv(difC1Loc, this.dif_c1);
    const difK1Loc = gl.getUniformLocation(program, "light_dif_k");
    gl.uniform1f(difK1Loc, this.dif_k1);

    const espC1Loc = gl.getUniformLocation(program, "light_esp_c");
    gl.uniform4fv(espC1Loc, this.esp_c1);
    const espK1Loc = gl.getUniformLocation(program, "light_esp_k");
    gl.uniform1f(espK1Loc, this.esp_k1);
    const espP1Loc = gl.getUniformLocation(program, "light_esp_p");
    gl.uniform1f(espP1Loc, this.esp_p1);

    // Configuração da segunda luz
    const pos2Loc = gl.getUniformLocation(program, "light2_pos");
    gl.uniform4fv(pos2Loc, this.pos2);

    const ambC2Loc = gl.getUniformLocation(program, "light2_amb_c");
    gl.uniform4fv(ambC2Loc, this.amb_c2);
    const ambK2Loc = gl.getUniformLocation(program, "light2_amb_k");
    gl.uniform1f(ambK2Loc, this.amb_k2);

    const difC2Loc = gl.getUniformLocation(program, "light2_dif_c");
    gl.uniform4fv(difC2Loc, this.dif_c2);
    const difK2Loc = gl.getUniformLocation(program, "light2_dif_k");
    gl.uniform1f(difK2Loc, this.dif_k2);

    const espC2Loc = gl.getUniformLocation(program, "light2_esp_c");
    gl.uniform4fv(espC2Loc, this.esp_c2);
    const espK2Loc = gl.getUniformLocation(program, "light2_esp_k");
    gl.uniform1f(espK2Loc, this.esp_k2);
    const espP2Loc = gl.getUniformLocation(program, "light2_esp_p");
    gl.uniform1f(espP2Loc, this.esp_p2);
  }

  updateLight() {
    // TODO: Change light positions dynamically (if needed)
  }
}
