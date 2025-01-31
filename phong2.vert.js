export default
  `#version 300 es
precision highp float;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

in vec4 position;
in vec4 normal;
in float scalar;

out vec4 fPosition;
out vec4 fNormal;
out float fScalar;

void main() {
  mat4 modelView = u_view * u_model;

  gl_Position  = u_projection * modelView * position;

  // Passa os dados para o fragment shader
  fPosition = position;
  fNormal = normal;
  fScalar = scalar;
}`