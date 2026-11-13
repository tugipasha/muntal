export const vertexShader = /* glsl */ `
  attribute vec3 aTileColor;

  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vColor = aTileColor;

    #ifdef USE_INSTANCING
      vec4 localPosition = instanceMatrix * vec4(position, 1.0);
      vec3 transformedNormal = mat3(instanceMatrix) * normal;
    #else
      vec4 localPosition = vec4(position, 1.0);
      vec3 transformedNormal = normal;
    #endif

    vec4 worldPosition = modelMatrix * localPosition;
    vWorldPosition = worldPosition.xyz;

    vNormal = normalize(normalMatrix * transformedNormal);
    vec4 mvPosition = modelViewMatrix * localPosition;
    vViewPosition = -mvPosition.xyz;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vColor;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.38, 0.88, length(centered));
    edge = mix(0.82, 1.0, edge);

    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(7.0, 24.0, dist);
    depth = mix(0.42, 1.0, depth);

    vec3 navyBias = vec3(0.04, 0.09, 0.17);
    vec3 color = mix(navyBias, vColor, depth);
    color *= edge;

    vec3 viewDir = normalize(vViewPosition);
    vec3 norm = normalize(vNormal);
    float f = 1.0 - max(0.0, dot(viewDir, norm));
    float fresnel = f * f * f;

    vec3 goldRim = vec3(0.87, 0.73, 0.42);
    color += goldRim * (fresnel * 0.35 * depth);

    vec2 borderCoord = abs(centered) * 2.0;
    float border = smoothstep(0.95, 0.985, max(borderCoord.x, borderCoord.y));
    color = mix(color, goldRim * 1.15, border * 0.4 * depth);

    gl_FragColor = vec4(color, 1.0);
  }
`;
