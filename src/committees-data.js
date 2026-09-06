// MUNTAL Model United Nations — Committees Data & Bespoke SVG Artworks

export const COMMITTEES = [
  {
    id: 'disec',
    num: '01',
    code: 'DISEC',
    name: 'Disarmament & International Security',
    shortName: 'Disarmament & Int. Security',
    mandate: 'Global non-proliferation treaties, autonomous strike doctrines, and outer space demilitarization.',
    description: 'The Disarmament and International Security Committee is the First Committee of the General Assembly, dealing with global disarmament, non-proliferation, and international threats to peace.',
    quote: 'The prevention of conflict begins with the calculation of deterrent equilibrium.',
    category: 'First Committee of the General Assembly',
    level: 'Advanced',
    delegates: '48 Delegates',
    crisis: 'Dynamic Crisis Mechanics',
    room: 'Hall of Treaties, Wing A',
    topics: [
      {
        letter: 'A',
        title: 'Regulation and Proliferation Safeguards for Hypersonic Glide Vehicles and Orbital Interceptors',
        summary: 'Examining the destabilizing potential of sub-orbital strike platforms on existing strategic stability treaties, early warning systems, and escalation thresholds.'
      },
      {
        letter: 'B',
        title: 'Bilateral Protocols on Autonomous Counter-Battery Drone Swarms in Non-Permissive Airspace',
        summary: 'Establishing strict verification protocols and human-in-the-loop mandates for algorithmic targeting arrays operating across disputed sovereign borders.'
      }
    ],
    accent: '#5e9bff',
    glowColor: 'rgba(94, 155, 255, 0.45)'
  },
  {
    id: 'who',
    num: '02',
    code: 'WHO',
    name: 'World Health Organization',
    shortName: 'World Health Organization',
    mandate: 'Pandemic preparedness architectures, bio-surveillance ethics, and global pharmaceutical equity.',
    description: 'The World Health Organization is the specialized agency responsible for international public health, coordinating responses to global health emergencies and advancing universal medical resilience.',
    quote: 'Public health is not an administrative routine; it is the frontline of human resilience.',
    category: 'Specialized Agency of the United Nations',
    level: 'Intermediate — High',
    delegates: '42 Delegates',
    crisis: 'Continuous Epidemiological Crisis',
    room: 'Pavilion of Science, Wing C',
    topics: [
      {
        letter: 'A',
        title: 'Global Genomic Sequencing Surveillance and Intellectual Property Waivers in Zoonotic Outbreaks',
        summary: 'Structuring multilateral access guarantees for synthesized mRNA vaccines and monoclonal treatments while maintaining intellectual property guarantees for sovereign research labs.'
      },
      {
        letter: 'B',
        title: 'Ethics and Cross-Border Containment of Synthetic Pathogen Escapes in Dual-Use Laboratories',
        summary: 'Formulating independent inspectorate protocols and rapid response biocontainment corridors under revised International Health Regulations.'
      }
    ],
    accent: '#7cb5ff',
    glowColor: 'rgba(124, 181, 255, 0.45)'
  },
  {
    id: 'unsc',
    num: '03',
    code: 'UNSC',
    name: 'Security Council',
    shortName: 'Security Council',
    mandate: 'Real-time geopolitical crisis resolution, peacekeeping mandates, and deterrence enforcement.',
    description: 'The Security Council is the principal organ of the United Nations, responsible for maintaining international peace and security.',
    quote: 'Fifteen seats, veto prerogatives, and decisions that rewrite the geography of power.',
    category: 'Principal Organ under UN Charter',
    level: 'Expert / High Stakes',
    delegates: '15 Delegations',
    crisis: 'Midnight Crisis Simulation',
    room: 'Grand Chamber of Nations',
    topics: [
      {
        letter: 'A',
        title: 'Maritime Security and Escort Mandates in Contested Littoral Chokepoints and Sovereign Straits',
        summary: 'Addressing weaponized unmanned surface vessels, commercial shipping blockades, and rules of engagement under UNCLOS Article 38 for international straits.'
      },
      {
        letter: 'B',
        title: 'De-escalation Frameworks for Cross-Strait Critical Infrastructure and Cyber-Kinetic Sabotage',
        summary: 'Navigating immediate ceasefire timelines, multilateral monitoring detachments, and Chapter VII resolution thresholds during emergent proxy skirmishes.'
      }
    ],
    accent: '#8fc3ff',
    glowColor: 'rgba(143, 195, 255, 0.55)'
  },
  {
    id: 'unhrc',
    num: '04',
    code: 'UNHRC',
    name: 'Human Rights Council',
    shortName: 'Human Rights Council',
    mandate: 'Humanitarian corridors, digital civil liberties, and post-conflict truth and reconciliation commissions.',
    description: 'The Human Rights Council is the United Nations body responsible for strengthening the promotion and protection of human rights around the globe.',
    quote: 'Universal dignity codified not as an ideal, but as an enforceable sovereign obligation.',
    category: 'Subsidiary Body of the UN General Assembly',
    level: 'Intermediate',
    delegates: '47 Delegates',
    crisis: 'Humanitarian Ad-Hoc Sessions',
    room: 'Atrium of Justice, Wing B',
    topics: [
      {
        letter: 'A',
        title: 'Protection of Displaced Populations and Humanitarian Access in Asymmetric War Zones',
        summary: 'Mandating neutral humanitarian passage corridors, demilitarized refugee staging grounds, and legal protections against forced demographic resettlement.'
      },
      {
        letter: 'B',
        title: 'Algorithmic Surveillance, Facial Biometrics, and Extrajudicial Digital Detention Standards',
        summary: 'Formulating global covenants against commercial spyware export to authoritarian regimes and defining digital due process standards for biometric tracking.'
      }
    ],
    accent: '#64a2ff',
    glowColor: 'rgba(100, 162, 255, 0.45)'
  },
  {
    id: 'ecofin',
    num: '05',
    code: 'ECOFIN',
    name: 'Economic & Financial Affairs',
    shortName: 'Economic & Financial Affairs',
    mandate: 'Sovereign debt restructuring, green finance sanctions, and critical supply-chain stability.',
    description: 'The Economic and Financial Committee deals with international trade, sovereign debt architecture, global financial stability, and sustainable development goals.',
    quote: 'Capital allocation is the true battleground of twenty-first century geopolitical strategy.',
    category: 'Second Committee of the General Assembly',
    level: 'Intermediate — Advanced',
    delegates: '50 Delegates',
    crisis: 'Economic Shock Scenario',
    room: 'Exchange Forum, Wing D',
    topics: [
      {
        letter: 'A',
        title: 'Multilateral Sovereign Debt Restructuring Mechanisms and Counter-Default Liquidity Facilities',
        summary: 'Mitigating systemic debt distress in developing economies while countering predatory vulture funds and coordinating equitable debt haircuts among Paris Club and bilateral creditors.'
      },
      {
        letter: 'B',
        title: 'Critical Rare-Earth Mineral Cartels, Export Embargoes, and Resilient Green Supply Networks',
        summary: 'Establishing international commodity stability reserves and WTO-compliant subsidies for domestic lithium, nickel, and cobalt refining networks.'
      }
    ],
    accent: '#5294ff',
    glowColor: 'rgba(82, 148, 255, 0.42)'
  }
];

// Bespoke SVG Artworks generating the exact chiaroscuro midnight-blue aesthetic seen in the reference image
export function getCommitteeSvgArtwork(code) {
  switch (code) {
    case 'DISEC':
      return `
        <svg viewBox="0 0 400 480" class="committee-card__svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="disec-glow" cx="50%" cy="65%" r="60%">
              <stop offset="0%" stop-color="#7cb5ff" stop-opacity="0.32" />
              <stop offset="45%" stop-color="#183b68" stop-opacity="0.2" />
              <stop offset="100%" stop-color="#030b18" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="disec-line" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#9cc4ff" stop-opacity="0.85" />
              <stop offset="50%" stop-color="#5e9bff" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#183b68" stop-opacity="0.1" />
            </linearGradient>
            <radialGradient id="disec-core" cx="50%" cy="85%" r="50%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="25%" stop-color="#5e9bff" stop-opacity="0.6" />
              <stop offset="70%" stop-color="#071b33" stop-opacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="480" fill="#040e1c" />
          <circle cx="200" cy="380" r="260" fill="url(#disec-glow)" />

          <!-- Telemetry coordinates & fine grid -->
          <g stroke="#3a608f" stroke-width="0.5" stroke-opacity="0.25">
            <line x1="0" y1="120" x2="400" y2="120" stroke-dasharray="2 4" />
            <line x1="0" y1="240" x2="400" y2="240" stroke-dasharray="2 4" />
            <line x1="200" y1="0" x2="200" y2="480" stroke-dasharray="3 6" />
            <line x1="80" y1="0" x2="80" y2="480" stroke-dasharray="1 8" />
            <line x1="320" y1="0" x2="320" y2="480" stroke-dasharray="1 8" />
          </g>

          <!-- Radar coordinate reticle -->
          <circle cx="200" cy="360" r="190" fill="none" stroke="#5e9bff" stroke-width="0.8" stroke-opacity="0.3" stroke-dasharray="4 8" />
          <circle cx="200" cy="360" r="140" fill="none" stroke="#7cb5ff" stroke-width="0.6" stroke-opacity="0.4" />
          <circle cx="200" cy="360" r="90" fill="none" stroke="#9cc4ff" stroke-width="0.9" stroke-opacity="0.5" />

          <!-- Earth Wireframe Horizon -->
          <g transform="translate(200, 390)">
            <ellipse cx="0" cy="0" rx="170" ry="170" fill="#05152b" stroke="#7cb5ff" stroke-width="1.2" stroke-opacity="0.65" />
            <!-- Latitude lines -->
            <ellipse cx="0" cy="-60" rx="155" ry="32" fill="none" stroke="#5e9bff" stroke-width="0.75" stroke-opacity="0.4" />
            <ellipse cx="0" cy="-15" rx="168" ry="42" fill="none" stroke="#5e9bff" stroke-width="0.9" stroke-opacity="0.55" />
            <ellipse cx="0" cy="35" rx="162" ry="46" fill="none" stroke="#3d6fa3" stroke-width="0.7" stroke-opacity="0.35" />
            <ellipse cx="0" cy="85" rx="138" ry="40" fill="none" stroke="#254b73" stroke-width="0.6" stroke-opacity="0.25" />
            
            <!-- Longitude meridians -->
            <ellipse cx="0" cy="0" rx="45" ry="170" fill="none" stroke="#7cb5ff" stroke-width="0.8" stroke-opacity="0.45" />
            <ellipse cx="0" cy="0" rx="100" ry="170" fill="none" stroke="#5e9bff" stroke-width="0.7" stroke-opacity="0.35" />
            <line x1="0" y1="-170" x2="0" y2="170" stroke="#9cc4ff" stroke-width="1" stroke-opacity="0.7" />
          </g>

          <!-- Orbital ballistic defense rings & satellite trajectory -->
          <g stroke="url(#disec-line)">
            <path d="M -40 280 C 60 160, 320 180, 440 330" fill="none" stroke-width="1.8" stroke-dasharray="5 3" />
            <path d="M 0 340 C 140 210, 360 220, 420 380" fill="none" stroke-width="1" stroke-opacity="0.6" />
            <path d="M 40 420 C 120 280, 290 260, 380 430" fill="none" stroke-width="0.8" stroke-opacity="0.4" />
          </g>

          <!-- Intercept nodes & targeting markers -->
          <circle cx="156" cy="222" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #9cc4ff)" />
          <circle cx="156" cy="222" r="8" fill="none" stroke="#9cc4ff" stroke-width="0.8" stroke-opacity="0.8" />
          <line x1="148" y1="222" x2="164" y2="222" stroke="#9cc4ff" stroke-width="0.6" />
          <line x1="156" y1="214" x2="156" y2="230" stroke="#9cc4ff" stroke-width="0.6" />

          <circle cx="284" cy="254" r="2.5" fill="#ffffff" filter="drop-shadow(0 0 5px #7cb5ff)" />
          <circle cx="284" cy="254" r="6" fill="none" stroke="#7cb5ff" stroke-width="0.7" stroke-opacity="0.7" />

          <!-- Dramatic horizon crest flare -->
          <ellipse cx="200" cy="222" rx="140" ry="12" fill="url(#disec-core)" opacity="0.35" />
        </svg>
      `;

    case 'WHO':
      return `
        <svg viewBox="0 0 400 480" class="committee-card__svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="who-glow" cx="45%" cy="55%" r="65%">
              <stop offset="0%" stop-color="#80beff" stop-opacity="0.35" />
              <stop offset="50%" stop-color="#163866" stop-opacity="0.22" />
              <stop offset="100%" stop-color="#030b18" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="dna-strand1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="50%" stop-color="#7eb7ff" stop-opacity="0.8" />
              <stop offset="100%" stop-color="#244d80" stop-opacity="0.3" />
            </linearGradient>
            <linearGradient id="dna-strand2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#5294ff" stop-opacity="0.75" />
              <stop offset="60%" stop-color="#2c62a3" stop-opacity="0.4" />
              <stop offset="100%" stop-color="#0b1e38" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="400" height="480" fill="#040e1b" />
          <circle cx="190" cy="270" r="230" fill="url(#who-glow)" />

          <!-- Epidemiological coordinate sphere -->
          <g transform="translate(195, 305)">
            <ellipse cx="0" cy="0" rx="155" ry="155" fill="#051428" stroke="#4f89cf" stroke-width="0.8" stroke-opacity="0.45" />
            <ellipse cx="0" cy="-45" rx="142" ry="34" fill="none" stroke="#36659c" stroke-width="0.6" stroke-opacity="0.3" />
            <ellipse cx="0" cy="15" rx="153" ry="40" fill="none" stroke="#5e9bff" stroke-width="0.75" stroke-opacity="0.4" />
            <ellipse cx="0" cy="70" rx="135" ry="32" fill="none" stroke="#254a75" stroke-width="0.6" stroke-opacity="0.25" />
            <ellipse cx="0" cy="0" rx="42" ry="155" fill="none" stroke="#5e9bff" stroke-width="0.7" stroke-opacity="0.35" />
            <ellipse cx="0" cy="0" rx="98" ry="155" fill="none" stroke="#3d72ad" stroke-width="0.6" stroke-opacity="0.25" />
          </g>

          <!-- Bio-molecular network nodes -->
          <g stroke="#7cb5ff" stroke-width="0.6" stroke-opacity="0.35">
            <line x1="90" y1="180" x2="140" y2="220" />
            <line x1="140" y1="220" x2="170" y2="175" />
            <line x1="170" y1="175" x2="230" y2="210" />
            <line x1="230" y1="210" x2="280" y2="160" />
            <line x1="140" y1="220" x2="160" y2="290" />
            <line x1="230" y1="210" x2="220" y2="295" />
          </g>

          <!-- Double Helix undulating strand across the planetary surface -->
          <path d="M 60 410 Q 110 330 160 270 T 260 170 T 350 90" fill="none" stroke="url(#dna-strand1)" stroke-width="2.5" />
          <path d="M 100 430 Q 145 350 200 280 T 290 190 T 380 115" fill="none" stroke="url(#dna-strand2)" stroke-width="2" stroke-dasharray="6 2" />

          <!-- DNA cross rungs with glowing nucleobase nodes -->
          <g stroke="#9cc4ff" stroke-width="1.2" stroke-opacity="0.7">
            <line x1="82" y1="418" x2="98" y2="428" />
            <line x1="118" y1="365" x2="140" y2="378" />
            <line x1="158" y1="305" x2="182" y2="318" />
            <line x1="202" y1="248" x2="228" y2="260" />
            <line x1="250" y1="192" x2="276" y2="204" />
            <line x1="298" y1="138" x2="324" y2="150" />
            <line x1="342" y1="88" x2="368" y2="102" />
          </g>

          <!-- Luminous bio-nodes -->
          <circle cx="160" cy="270" r="4.5" fill="#ffffff" filter="drop-shadow(0 0 8px #9cc4ff)" />
          <circle cx="202" cy="248" r="3.5" fill="#ffffff" filter="drop-shadow(0 0 6px #7cb5ff)" />
          <circle cx="260" cy="170" r="5" fill="#ffffff" filter="drop-shadow(0 0 10px #bde0ff)" />
          <circle cx="298" cy="138" r="3" fill="#9cc4ff" />

          <!-- Radiant humanitarian rings -->
          <circle cx="260" cy="170" r="16" fill="none" stroke="#9cc4ff" stroke-width="0.8" stroke-opacity="0.6" stroke-dasharray="3 4" />
          <circle cx="160" cy="270" r="14" fill="none" stroke="#7cb5ff" stroke-width="0.7" stroke-opacity="0.5" stroke-dasharray="2 3" />
        </svg>
      `;

    case 'UNSC':
      return `
        <svg viewBox="0 0 400 480" class="committee-card__svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="unsc-spotlight" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#cde2ff" stop-opacity="0.5" />
              <stop offset="25%" stop-color="#6eaaff" stop-opacity="0.32" />
              <stop offset="65%" stop-color="#14345e" stop-opacity="0.15" />
              <stop offset="100%" stop-color="#020813" stop-opacity="0" />
            </radialGradient>
            <radialGradient id="earth-glow" cx="50%" cy="90%" r="55%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
              <stop offset="20%" stop-color="#8fc3ff" stop-opacity="0.7" />
              <stop offset="60%" stop-color="#19457a" stop-opacity="0.3" />
              <stop offset="100%" stop-color="#030c1a" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="amphi-rail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#1a3f6e" stop-opacity="0.2" />
              <stop offset="50%" stop-color="#9fcbff" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#1a3f6e" stop-opacity="0.2" />
            </linearGradient>
          </defs>
          <rect width="400" height="480" fill="#030a16" />
          
          <!-- Atmospheric Volumetric Light Cone -->
          <polygon points="120,0 280,0 380,480 20,480" fill="url(#unsc-spotlight)" opacity="0.8" />
          <circle cx="200" cy="240" r="220" fill="url(#unsc-spotlight)" />

          <!-- Grand Amphitheater Chamber Rings (Security Council Horseshoe Table Architecture) -->
          <g transform="translate(200, 185)">
            <!-- Highest Outer Tier Arch -->
            <path d="M -180 80 A 190 68 0 0 1 180 80" fill="none" stroke="#5283b8" stroke-width="0.8" stroke-opacity="0.35" />
            <!-- Middle Tier -->
            <path d="M -155 55 A 165 58 0 0 1 155 55" fill="none" stroke="#7cb5ff" stroke-width="1.2" stroke-opacity="0.55" />
            <!-- The Iconic Horseshoe Council Table Rim -->
            <path d="M -130 30 A 140 48 0 0 1 130 30" fill="none" stroke="url(#amphi-rail)" stroke-width="2.6" filter="drop-shadow(0 0 8px rgba(156,196,255,0.7))" />
            <!-- Inner Dais Ring -->
            <path d="M -95 10 A 105 34 0 0 1 95 10" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.8" />
            <!-- Dais core dais floor -->
            <ellipse cx="0" cy="0" rx="60" ry="18" fill="#081e3b" stroke="#7eb7ff" stroke-width="0.9" stroke-opacity="0.7" />
            
            <!-- Delegate seat positions (15 delegations in curved array) -->
            <circle cx="-110" cy="30" r="2.5" fill="#ffffff" />
            <circle cx="-85" cy="18" r="2.5" fill="#ffffff" />
            <circle cx="-55" cy="10" r="2.5" fill="#ffffff" />
            <circle cx="-25" cy="6" r="2.5" fill="#ffffff" />
            <circle cx="0" cy="5" r="3" fill="#ffffff" filter="drop-shadow(0 0 4px #9cc4ff)" />
            <circle cx="25" cy="6" r="2.5" fill="#ffffff" />
            <circle cx="55" cy="10" r="2.5" fill="#ffffff" />
            <circle cx="85" cy="18" r="2.5" fill="#ffffff" />
            <circle cx="110" cy="30" r="2.5" fill="#ffffff" />
          </g>

          <!-- Grand Midnight Planet Earth Horizon rising in backdrop -->
          <g transform="translate(200, 395)">
            <ellipse cx="0" cy="0" rx="180" ry="180" fill="#041224" stroke="#8ec1ff" stroke-width="1.6" stroke-opacity="0.85" />
            
            <!-- Continental landmass silhouette abstractions -->
            <path d="M -110 -60 Q -80 -40 -60 -70 Q -30 -90 10 -65 Q 40 -80 70 -50 Q 110 -60 135 -30 Q 100 10 70 30 Q 20 40 -20 20 Q -70 30 -120 -10 Z" fill="#0e2a4f" opacity="0.75" />
            
            <!-- Latitude grid -->
            <ellipse cx="0" cy="-55" rx="165" ry="38" fill="none" stroke="#5e9bff" stroke-width="0.85" stroke-opacity="0.5" />
            <ellipse cx="0" cy="0" rx="178" ry="46" fill="none" stroke="#7cb5ff" stroke-width="1" stroke-opacity="0.6" />
            <ellipse cx="0" cy="55" rx="165" ry="40" fill="none" stroke="#3b699c" stroke-width="0.75" stroke-opacity="0.35" />
            <!-- Meridians -->
            <ellipse cx="0" cy="0" rx="55" ry="180" fill="none" stroke="#7cb5ff" stroke-width="0.85" stroke-opacity="0.45" />
            <ellipse cx="0" cy="0" rx="115" ry="180" fill="none" stroke="#4a7eb8" stroke-width="0.7" stroke-opacity="0.3" />
            <line x1="0" y1="-180" x2="0" y2="180" stroke="#9cc4ff" stroke-width="1.2" stroke-opacity="0.7" />
          </g>

          <!-- Luminous Planetary Horizon Arc -->
          <ellipse cx="200" cy="215" rx="150" ry="14" fill="url(#earth-glow)" opacity="0.45" />
          
          <!-- Sovereign orbital chokepoint arcs -->
          <path d="M 30 360 C 90 260, 310 240, 370 340" fill="none" stroke="#ffffff" stroke-width="1" stroke-opacity="0.55" stroke-dasharray="4 6" />
          <circle cx="280" cy="265" r="3" fill="#ffffff" filter="drop-shadow(0 0 6px #ffffff)" />
        </svg>
      `;

    case 'UNHRC':
      return `
        <svg viewBox="0 0 400 480" class="committee-card__svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="unhrc-beam" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
              <stop offset="25%" stop-color="#7ab4ff" stop-opacity="0.35" />
              <stop offset="70%" stop-color="#143157" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#020814" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="portal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#163459" stop-opacity="0.4" />
              <stop offset="50%" stop-color="#67a6f5" stop-opacity="0.85" />
              <stop offset="100%" stop-color="#07182e" stop-opacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="400" height="480" fill="#030c19" />
          
          <!-- Soaring Vertical Portal Beam of Justice -->
          <rect x="160" y="0" width="80" height="480" fill="url(#unhrc-beam)" opacity="0.75" />
          <circle cx="200" cy="220" r="180" fill="url(#unhrc-beam)" />

          <!-- Classical Monolithic Portal Slabs -->
          <g stroke="#5e9bff" stroke-width="1.2">
            <!-- Left Monolith Column -->
            <path d="M 40 480 L 40 80 L 140 80 L 140 480 Z" fill="#05152a" stroke-opacity="0.5" />
            <line x1="140" y1="80" x2="140" y2="480" stroke="#9cc4ff" stroke-width="1.6" stroke-opacity="0.8" />
            
            <!-- Right Monolith Column -->
            <path d="M 260 480 L 260 80 L 360 80 L 360 480 Z" fill="#05152a" stroke-opacity="0.5" />
            <line x1="260" y1="80" x2="260" y2="480" stroke="#9cc4ff" stroke-width="1.6" stroke-opacity="0.8" />
            
            <!-- Top Architrave / Lintel -->
            <rect x="25" y="60" width="350" height="24" fill="#091f3d" stroke="#7eb7ff" stroke-width="1.4" stroke-opacity="0.75" />
          </g>

          <!-- Sculpted Ceremonial Olive Branch / Laurel of Human Dignity -->
          <g transform="translate(200, 180) scale(0.9)" stroke="#ffffff" stroke-width="1.4" fill="none">
            <!-- Central stem -->
            <path d="M 0 90 C -20 40, -10 -20, 0 -60" stroke-width="2" stroke-opacity="0.9" />
            <!-- Left Leaves -->
            <path d="M -4 60 C -30 50, -45 35, -35 25 C -22 25, -12 40, -4 48" fill="#13355e" stroke-opacity="0.8" />
            <path d="M -8 20 C -40 10, -52 -5, -40 -15 C -28 -15, -16 0, -6 10" fill="#184173" stroke-opacity="0.85" />
            <path d="M -6 -20 C -36 -32, -45 -48, -32 -55 C -20 -52, -12 -38, -4 -30" fill="#1e4d87" stroke-opacity="0.9" />
            <!-- Right Leaves -->
            <path d="M 2 45 C 28 35, 42 20, 32 10 C 20 10, 10 25, 2 34" fill="#13355e" stroke-opacity="0.8" />
            <path d="M 1 5 C 32 -5, 48 -20, 36 -30 C 24 -30, 14 -15, 2 -5" fill="#184173" stroke-opacity="0.85" />
            <path d="M 0 -35 C 26 -48, 38 -62, 28 -70 C 16 -68, 8 -54, 0 -45" fill="#1e4d87" stroke-opacity="0.9" />
            <!-- Top leaf tip -->
            <path d="M 0 -60 C -10 -85, 0 -100, 0 -100 C 0 -100, 10 -85, 0 -60" fill="#7cb5ff" stroke-opacity="0.95" />
          </g>

          <!-- Silhouettes of delegates / humanity standing in portal illumination -->
          <g fill="#020813" opacity="0.92">
            <!-- Ground threshold line -->
            <rect x="140" y="410" width="120" height="70" />
            <!-- Central delegate silhouettes -->
            <circle cx="175" cy="385" r="5" fill="#040e1c" />
            <path d="M 166 415 C 166 395, 184 395, 184 415 Z" fill="#040e1c" />
            
            <circle cx="200" cy="380" r="5.5" fill="#040e1c" />
            <path d="M 190 415 C 190 392, 210 392, 210 415 Z" fill="#040e1c" />
            
            <circle cx="225" cy="386" r="4.8" fill="#040e1c" />
            <path d="M 217 415 C 217 396, 233 396, 233 415 Z" fill="#040e1c" />
          </g>

          <!-- Rim of light shining around delegates -->
          <line x1="140" y1="410" x2="260" y2="410" stroke="#9cc4ff" stroke-width="1.5" stroke-opacity="0.85" filter="drop-shadow(0 0 6px #7cb5ff)" />
        </svg>
      `;

    case 'ECOFIN':
      return `
        <svg viewBox="0 0 400 480" class="committee-card__svg" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="ecofin-glow" cx="50%" cy="65%" r="60%">
              <stop offset="0%" stop-color="#73b0ff" stop-opacity="0.32" />
              <stop offset="45%" stop-color="#14345d" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#020814" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="chart-curve" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#3d72b0" stop-opacity="0.4" />
              <stop offset="60%" stop-color="#7cb5ff" stop-opacity="0.85" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0.95" />
            </linearGradient>
            <linearGradient id="bar-fill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#7cb5ff" stop-opacity="0.6" />
              <stop offset="100%" stop-color="#091d38" stop-opacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="400" height="480" fill="#030b18" />
          <circle cx="200" cy="320" r="230" fill="url(#ecofin-glow)" />

          <!-- Financial Topology Matrix Grid -->
          <g stroke="#3a608c" stroke-width="0.6" stroke-opacity="0.25">
            <line x1="0" y1="140" x2="400" y2="140" stroke-dasharray="2 4" />
            <line x1="0" y1="220" x2="400" y2="220" stroke-dasharray="2 4" />
            <line x1="0" y1="300" x2="400" y2="300" stroke-dasharray="2 4" />
            <line x1="0" y1="380" x2="400" y2="380" stroke-dasharray="2 4" />
            
            <line x1="70" y1="0" x2="70" y2="480" stroke-dasharray="1 6" />
            <line x1="150" y1="0" x2="150" y2="480" stroke-dasharray="1 6" />
            <line x1="230" y1="0" x2="230" y2="480" stroke-dasharray="1 6" />
            <line x1="310" y1="0" x2="310" y2="480" stroke-dasharray="1 6" />
          </g>

          <!-- Perspective Isometric Globe / Currency Base Grid -->
          <g transform="translate(200, 390)">
            <ellipse cx="0" cy="0" rx="170" ry="170" fill="#051428" stroke="#528acc" stroke-width="1" stroke-opacity="0.6" />
            <ellipse cx="0" cy="-50" rx="155" ry="36" fill="none" stroke="#3b699c" stroke-width="0.7" stroke-opacity="0.4" />
            <ellipse cx="0" cy="10" rx="168" ry="42" fill="none" stroke="#68a5f0" stroke-width="0.85" stroke-opacity="0.5" />
            <ellipse cx="0" cy="70" rx="142" ry="36" fill="none" stroke="#254a75" stroke-width="0.6" stroke-opacity="0.3" />
            <ellipse cx="0" cy="0" rx="45" ry="170" fill="none" stroke="#5e9bff" stroke-width="0.75" stroke-opacity="0.4" />
            <ellipse cx="0" cy="0" rx="105" ry="170" fill="none" stroke="#3b6eab" stroke-width="0.65" stroke-opacity="0.3" />
          </g>

          <!-- Ascending Fiscal Candlestick / Bar Vectors -->
          <g stroke="#7cb5ff" stroke-width="1">
            <!-- Bar 1 -->
            <rect x="180" y="240" width="14" height="110" fill="url(#bar-fill)" stroke-opacity="0.6" />
            <line x1="187" y1="220" x2="187" y2="240" stroke-opacity="0.8" />
            
            <!-- Bar 2 -->
            <rect x="206" y="200" width="14" height="150" fill="url(#bar-fill)" stroke-opacity="0.7" />
            <line x1="213" y1="180" x2="213" y2="200" stroke-opacity="0.9" />

            <!-- Bar 3 -->
            <rect x="232" y="160" width="14" height="190" fill="url(#bar-fill)" stroke-opacity="0.8" />
            <line x1="239" y1="140" x2="239" y2="160" stroke="#ffffff" stroke-opacity="0.95" />

            <!-- Bar 4 -->
            <rect x="258" y="125" width="14" height="225" fill="url(#bar-fill)" stroke-opacity="0.9" />
            <line x1="265" y1="105" x2="265" y2="125" stroke="#ffffff" stroke-opacity="1" />
          </g>

          <!-- Soaring Logarithmic Yield Curve -->
          <path d="M 30 380 C 110 370, 160 310, 210 220 T 310 95 T 380 40" fill="none" stroke="url(#chart-curve)" stroke-width="2.5" filter="drop-shadow(0 0 10px rgba(124, 181, 255, 0.6))" />

          <!-- High-frequency Data Points -->
          <circle cx="210" cy="220" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #7cb5ff)" />
          <circle cx="310" cy="95" r="5" fill="#ffffff" filter="drop-shadow(0 0 8px #9cc4ff)" />
          <circle cx="310" cy="95" r="12" fill="none" stroke="#9cc4ff" stroke-width="0.8" stroke-opacity="0.6" />
          <circle cx="380" cy="40" r="3.5" fill="#ffffff" />
        </svg>
      `;

    default:
      return `<svg viewBox="0 0 400 480" class="committee-card__svg"><rect width="400" height="480" fill="#040e1b" /></svg>`;
  }
}
