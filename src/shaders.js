export const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    // Compute view-space normal and view position for specular Fresnel rim
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;
  uniform float uOpacity;

  varying vec2 vUv;
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 tex = texture2D(uMap, vUv);

    // Subtle edge softening and bevel curvature
    vec2 centered = vUv - 0.5;
    float edge = 1.0 - smoothstep(0.38, 0.88, length(centered));
    edge = mix(0.82, 1.0, edge);

    // Depth falloff from camera for atmospheric perspective
    float dist = distance(vWorldPosition, uCameraPosition);
    float depth = 1.0 - smoothstep(7.0, 24.0, dist);
    depth = mix(0.42, 1.0, depth);

    // Deep midnight navy ambient tone
    vec3 navyBias = vec3(0.04, 0.09, 0.17);
    vec3 color = mix(navyBias, tex.rgb, depth);
    color *= edge;

    // Specular Fresnel rim light: gold/champagne accent (#dfb96c) on card edges
    vec3 viewDir = normalize(vViewPosition);
    vec3 norm = normalize(vNormal);
    float fresnel = 1.0 - max(0.0, dot(viewDir, norm));
    fresnel = pow(fresnel, 2.8);

    vec3 goldRim = vec3(0.87, 0.73, 0.42);
    color += goldRim * (fresnel * 0.35 * depth);

    // Subtle card border bezel
    vec2 borderCoord = abs(vUv - 0.5) * 2.0;
    float border = smoothstep(0.95, 0.985, max(borderCoord.x, borderCoord.y));
    color = mix(color, goldRim * 1.15, border * 0.4 * depth);

    gl_FragColor = vec4(color, tex.a * uOpacity);
  }
`;
