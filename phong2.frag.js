export default
  `#version 300 es
precision highp float;

// Luz PRINCIPAL 
uniform vec4 light_pos;

uniform vec4 light_amb_c;
uniform float light_amb_k;

uniform vec4 light_dif_c;
uniform float light_dif_k;

uniform vec4 light_esp_c;
uniform float light_esp_k;
uniform float light_esp_p;

// Luz Secundária (Amarela)
uniform vec4 light2_pos;

uniform vec4 light2_amb_c;
uniform float light2_amb_k;

uniform vec4 light2_dif_c;
uniform float light2_dif_k;

uniform vec4 light2_esp_c;
uniform float light2_esp_k;
uniform float light2_esp_p;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

uniform sampler2D uColorMap;

in vec4 fPosition;
in vec4 fNormal;
in float fScalar;

out vec4 minhaColor;

void main()
{
  mat4 modelView = u_view * u_model;

  // Converte posição e normal para o sistema da câmera
  vec4 viewPosition = modelView * fPosition;
  vec4 viewNormal = transpose(inverse(modelView)) * fNormal;
  viewNormal = normalize(viewNormal);

  // ----------- LUZ PRINCIPAL -----------
  vec4 viewLightPos = u_view * light_pos;

  vec4 lightDir = normalize(viewLightPos - viewPosition);

  vec4 cameraDir = normalize(-viewPosition);

  float fatorDif1 = max(0.0, dot(lightDir, viewNormal));

  vec4 halfVec1 = normalize(lightDir + cameraDir);
  float fatorEsp1 = pow(max(0.0, dot(halfVec1, viewNormal)), light_esp_p);

  // --- LUZ SECUNDÁRIA ---
  vec4 viewLight2Pos = u_view * light2_pos;

  vec4 light2Dir = normalize(viewLight2Pos - viewPosition);

  float fatorDif2 = max(0.0, dot(light2Dir, viewNormal));

  vec4 halfVec2 = normalize(light2Dir + cameraDir);
  float fatorEsp2 = pow(max(0.0, dot(halfVec2, viewNormal)), light2_esp_p);

  vec2 texCoords = vec2(fScalar, 0);
  vec4 fColor = texture(uColorMap, texCoords);

  // Combinação das contribuições das duas luzes
  vec4 light1Contribution = light_amb_k * light_amb_c +
                            fatorDif1 * light_dif_k * light_dif_c +
                            fatorEsp1 * light_esp_k * light_esp_c;

  vec4 light2Contribution = light2_amb_k * light2_amb_c +
                            fatorDif2 * light2_dif_k * light2_dif_c +
                            fatorEsp2 * light2_esp_k * light2_esp_c;

  // Cor final do vértice
  // Se o escalar for 1.0, colorir de vermelho
  if (fScalar > 0.99) {
    minhaColor = vec4(1.0, 0.0, 0.0, 1.0); // Vermelho
  } else {
    minhaColor = 0.45 * fColor + 0.55 * (light1Contribution + light2Contribution);
  }
}`;
