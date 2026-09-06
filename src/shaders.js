export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.34, 0.86, length(centered));
    edge = mix(0.78, 1.0, edge);

    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(8.0, 22.0, dist);
    depth = mix(0.5, 1.0, depth);

    vec3 navyBias = vec3(0.09, 0.16, 0.27);
    vec3 color = mix(navyBias, tex.rgb, depth);
    color *= edge;

    gl_FragColor = vec4(color, tex.a);
  }
`;
