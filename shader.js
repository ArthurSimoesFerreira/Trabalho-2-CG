export default class Shader {
  static createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Erro ao compilar shader:", gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  static createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Erro ao linkar shader program:", gl.getProgramInfoLog(program));
    }
    return program;
  }

  static isArrayBuffer(value) {
    return value && value.buffer instanceof ArrayBuffer && value.byteLength !== undefined;
  }

  static createBuffer(gl, type, data) {
    if (data.length == 0)
      return null;

    if (!Shader.isArrayBuffer(data)) {
      console.warn('Data is not an instance of ArrayBuffer');
      return null;
    }

    var buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, gl.STATIC_DRAW);

    return buffer;
  }

  static createVAO(gl, posAttribLoc, posBuffer, colorAttribLoc = null, colorBuffer = null, normAttribLoc = null, normBuffer = null) {
    var vao = gl.createVertexArray();

    gl.bindVertexArray(vao);

    if (posAttribLoc != null && posAttribLoc != undefined) {
      gl.enableVertexAttribArray(posAttribLoc);
      var size = 4;
      var type = gl.FLOAT;
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.vertexAttribPointer(posAttribLoc, size, type, false, 0, 0);
    }

    if (colorAttribLoc != null && colorAttribLoc != undefined) {
      gl.enableVertexAttribArray(colorAttribLoc);
      size = 1;
      type = gl.FLOAT;
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.vertexAttribPointer(colorAttribLoc, size, type, false, 0, 0);
    }

    if (normAttribLoc != null && normAttribLoc != undefined) {
      gl.enableVertexAttribArray(normAttribLoc);
      size = 4;
      type = gl.FLOAT;
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
      gl.vertexAttribPointer(normAttribLoc, size, type, false, 0, 0);
    }

    return vao;
  }
}