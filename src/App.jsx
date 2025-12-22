import React, { useState, useEffect, useRef , useMemo} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars } from '@react-three/drei';


import { 
  Shield, 
  Cpu, 
  Activity, 
  Server, 
  Terminal, 
  Lock, 
  Network, 
  GitCommit, 
  Mail, 
  Github, 
  ExternalLink,
  ChevronRight, 
  ChevronDown,
  Database,
  Layers,
  Zap,
  Eye,
  Scan,
  Radio,
  Smartphone,
  Mic,
  MapPin,
  Brain,
  Bluetooth,
  Code
} from 'lucide-react';

const pageRenderStart = performance.now();

// --- Utility Components ---

const MonoLabel = ({ children, className = "" }) => (
  <span className={`font-mono text-[10px] sm:text-xs uppercase tracking-wider text-neutral-500 ${className}`}>
    {children}
  </span>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-4 mb-12 border-b border-neutral-800 pb-4">
    <span className="font-mono text-cyan-500 text-sm">0{number}</span>
    <h2 className="text-2xl font-semibold text-neutral-100 tracking-tight">{title}</h2>
    <div className="flex-grow" />
    <div className="h-1 w-1 bg-cyan-500 rounded-full animate-pulse" />
  </div>
);



function FooterRenderTime() {
  const [renderTime, setRenderTime] = useState(null);

  useEffect(() => {
    // defer to next frame → avoids sync commit updates
    requestAnimationFrame(() => {
      const end = performance.now();
      setRenderTime((end - pageRenderStart).toFixed(2));
    });
  }, []);

  return (
    <span>
      RENDER_TIME: {renderTime ? `${renderTime}ms` : "—"}
    </span>
  );
}

// --- Visualizations ---
const DNAHelix = ({ turns = 3, radius = 2, height = 15 }) => {
  const pointsPerTurn = 40;
  
  // Memoize the geometry data so we don't recalculate on every frame
  const { backbone1Curve, backbone2Curve, rungs } = useMemo(() => {
    const b1Points = [];
    const b2Points = [];
    const rungData = [];

    const totalPoints = turns * pointsPerTurn;
    const heightStep = height / totalPoints;
    const angleStep = (Math.PI * 2) / pointsPerTurn;

    for (let i = 0; i <= totalPoints; i++) {
      const angle = i * angleStep;
      const y = i * heightStep - height / 2;

      // Calculate positions for both strands (180 degrees apart)
      const x1 = Math.cos(angle) * radius;
      const z1 = Math.sin(angle) * radius;
      
      const x2 = Math.cos(angle + Math.PI) * radius;
      const z2 = Math.sin(angle + Math.PI) * radius;

      const p1 = new THREE.Vector3(x1, y, z1);
      const p2 = new THREE.Vector3(x2, y, z2);

      b1Points.push(p1);
      b2Points.push(p2);

      // Add a rung every few points (e.g., every 4th point)
      if (i % 4 === 0) {
        rungData.push({ start: p1, end: p2 });
      }
    }

    return {
      backbone1Curve: new THREE.CatmullRomCurve3(b1Points),
      backbone2Curve: new THREE.CatmullRomCurve3(b2Points),
      rungs: rungData
    };
  }, [turns, radius, height]);

  return (
    <group>
      {/* Strand 1 */}
      <mesh>
        <tubeGeometry args={[backbone1Curve, 100, 0.15, 8, false]} />
        <meshStandardMaterial color="white" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Strand 2 */}
      <mesh>
        <tubeGeometry args={[backbone2Curve, 100, 0.15, 8, false]} />
        <meshStandardMaterial color="white" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Rungs (Base Pairs) */}
      {rungs.map((rung, index) => {
        // Calculate position (midpoint)
        const mid = new THREE.Vector3().addVectors(rung.start, rung.end).multiplyScalar(0.5);
        
        // Calculate orientation (quaternion)
        const direction = new THREE.Vector3().subVectors(rung.end, rung.start);
        const length = direction.length();
        const orientation = new THREE.Quaternion();
        orientation.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());

        return (
          <mesh key={index} position={mid} quaternion={orientation}>
            <cylinderGeometry args={[0.08, 0.08, length, 8]} />
            <meshStandardMaterial color="white" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Rotator Component
 * Handles the specific rotation logic requested:
 * 1. Tilted axis (handled by parent/self rotation order or container)
 * 2. Spinning around its own Y axis
 */
const Rotator = ({ children }) => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate around the local Y axis
      groupRef.current.rotation.y -= delta * 0.5; // Adjust speed here
    }
  });

  return (
    // Outer group handles the Tilt
    <group rotation={[0, 0, Math.PI / 6]}> 
      {/* Inner group handles the Spin */}
      <group ref={groupRef}>
        {children}
      </group>
    </group>
  );
};

const SystemIntegrationViz = () => {
    return (
      <div className="w-full h-96 bg-black relative overflow-hidden">
        <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
          {/* Background Color */}
          <color attach="background" args={['black']} />

          {/* Lighting to make the white stand out with depth */}
          <ambientLight intensity={0.2} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="white" />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#444" />
          <directionalLight position={[0, 0, 5]} intensity={1} />

          {/* The DNA Content */}
          <Rotator>
            {/* Increased height and reduced turns for a more "open" and stretched look */}
            <DNAHelix turns={3} height={35} radius={3} />
          </Rotator>

          {/* Orbit Controls for user interaction (optional) */}
          <OrbitControls enableZoom={true} enablePan={false} />
        </Canvas>

        {/* Overlay Text */}
        <div className="absolute bottom-8 left-8 text-white font-mono opacity-60 pointer-events-none">
          <h1 className="text-2xl font-bold tracking-wider">DNA SEQUENCE</h1>
          <p className="text-xs">Visualisation AI made</p>
        </div>
      </div>
    );
};


const ArchitectureDiagram = ({ type }) => {
  if (type === 'breathesense') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 font-mono text-[10px] text-neutral-400 select-none">
        
        <div className="flex gap-4 mb-4">
            <div className="border border-neutral-700 p-2 rounded bg-neutral-900 w-24 text-center">
                <span className="text-cyan-500 block mb-1">Sensors</span>
                Gas/Flow
            </div>
            <div className="border border-neutral-700 p-2 rounded bg-neutral-900 w-24 text-center">
                <span className="text-cyan-500 block mb-1">Mic</span>
                Auscultation
            </div>
        </div>

        
        <div className="h-8 w-full flex justify-center relative">
            <div className="absolute bottom-0 h-4 w-px bg-neutral-700"></div>
            <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-neutral-700"></div>
            <div className="absolute top-0 left-1/4 h-4 w-px bg-neutral-700"></div>
            <div className="absolute top-0 right-1/4 h-4 w-px bg-neutral-700"></div>
        </div>

        
        <div className="h-8 w-px bg-neutral-700 mb-2"></div>
        
        
        <div className="border border-cyan-900/50 p-3 rounded bg-neutral-900/50 w-64 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
            <span className="relative z-10 text-neutral-200">Processing Layer (ESP32/Edge)</span>
        </div>

        
        <div className="h-8 w-full flex justify-center relative">
            <div className="absolute top-0 h-4 w-px bg-neutral-700"></div>
            <div className="absolute top-1/2 left-1/4 right-1/4 h-px bg-neutral-700"></div>
            <div className="absolute top-1/2 left-1/4 h-4 w-px bg-neutral-700 mt-0"></div>
            <div className="absolute top-1/2 right-1/4 h-4 w-px bg-neutral-700 mt-0"></div>
        </div>

        
        <div className="flex gap-8 mt-1">
            <div className="border border-purple-900/50 p-2 rounded bg-neutral-900 w-28 text-center">
                <span className="text-purple-400 block">Model A</span>
                Breath Chem
            </div>
            <div className="border border-purple-900/50 p-2 rounded bg-neutral-900 w-28 text-center">
                <span className="text-purple-400 block">Model B</span>
                Audio Ptrn
            </div>
        </div>

        
        <div className="h-6 w-px bg-neutral-700 mt-2"></div>
        <div className="border border-neutral-700 p-2 rounded bg-neutral-950 w-32 text-center text-xs text-white">
            Confidence Fusion
        </div>
      </div>
    );
  }
  return null;
};

//Main Components

const DomainCard = ({ title, icon: Icon, description, technologies }) => (
  <div className="border border-neutral-800 bg-neutral-900/30 p-6 hover:border-neutral-700 transition-all group">
    <div className="flex items-start gap-4 mb-4">
      {Icon && (
        <div className="p-2 rounded bg-neutral-950 border border-neutral-800 text-cyan-400 group-hover:text-cyan-300">
          <Icon size={24} />
        </div>
      )}
      <div>
        <h3 className="text-lg font-medium text-neutral-200 leading-tight">{title}</h3>
        <p className="text-sm text-neutral-500 mt-2 leading-relaxed">{description}</p>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-neutral-800/50">
      <MonoLabel>Key Areas</MonoLabel>
      <div className="flex flex-wrap gap-2 mt-3">
        {technologies.map((tech, i) => (
          <span
            key={i}
            className="text-[10px] font-mono text-neutral-600 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  </div>
);


const ProjectCard = ({ project, expanded, onClick }) => {
  const Icon = project.icon;

  const githubState =
    project.github_url === "Private"
      ? "private"
      : project.github_url === "Private till completed"
      ? "locked"
      : project.github_url
      ? "public"
      : "none";

  return (
    <div
      className={`border transition-all duration-300 cursor-pointer overflow-hidden mb-4 ${
        expanded
          ? "border-cyan-500/30 bg-neutral-900"
          : "border-neutral-800 bg-neutral-900/20 hover:border-neutral-700"
      }`}
      onClick={onClick}
    >
      {/* HEADER */}
      <div className="p-6 flex items-start gap-4">
        <div
          className={`p-2 rounded bg-neutral-950 border border-neutral-800 ${
            expanded ? "text-cyan-400" : "text-neutral-400"
          }`}
        >
          <Icon size={24} />
        </div>

        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
            <div>
              <h3
                className={`text-lg font-medium ${
                  expanded ? "text-white" : "text-neutral-200"
                }`}
              >
                {project.title}
              </h3>
              <p className="text-sm text-neutral-500 mt-1">
                {project.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3">
              
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  project.status === "ACTIVE"
                    ? "border-green-900 text-green-500 bg-green-900/10"
                    : project.status === "RESEARCH"
                    ? "border-purple-900 text-purple-500 bg-purple-900/10"
                    : "border-orange-900 text-orange-500 bg-orange-900/10"
                }`}
              >
                {project.status}
              </span>

              
              {expanded && githubState === "public" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(project.github_url, "_blank");
                  }}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-700 text-neutral-300 hover:border-cyan-500 hover:text-cyan-400 transition"
                >
                  <Github size={12} />
                  GitHub
                  <ExternalLink size={10} />
                </button>
              )}

              {expanded && githubState === "locked" && (
                <div className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border border-neutral-800 text-neutral-500">
                  <Lock size={12} />
                  Private till completed
                </div>
              )}

              {expanded && githubState === "private" && (
                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                  <Lock size={12} />
                  Private
                </div>
              )}

              {expanded ? (
                <ChevronDown size={16} className="text-cyan-500" />
              ) : (
                <ChevronRight size={16} className="text-neutral-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EXPANDED CONTENT */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          expanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-0 border-t border-neutral-800/50 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <MonoLabel>System Architecture</MonoLabel>
              <ul className="mt-3 space-y-2">
                {project.tech.map((tech, i) => (
                  <li
                    key={i}
                    className="text-sm text-neutral-400 flex items-center gap-2"
                  >
                    <Code size={12} className="text-cyan-900" />
                    {tech}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <MonoLabel>Key Metrics / Features</MonoLabel>
              <div className="mt-3 space-y-3">
                {project.features.map((feat, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-sm border-b border-neutral-800/50 pb-1"
                  >
                    <span className="text-neutral-500">{feat.label}</span>
                    <span className="font-mono text-cyan-400 text-xs">
                      {feat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineItem = ({ year, title, desc, role }) => (
  <div className="relative pl-8 pb-12 border-l border-neutral-800 last:pb-0 last:border-l-0 group">
    <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-neutral-900 border border-cyan-900 group-hover:bg-cyan-900/50 transition-colors rounded-full" />
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
        <span className="font-mono text-cyan-500 text-sm">{year}</span>
        <h4 className="text-neutral-200 font-medium">{title}</h4>
        <span className="text-xs font-mono text-neutral-600 border border-neutral-800 px-2 py-0.5 rounded">{role}</span>
    </div>
    <p className="text-sm text-neutral-500 max-w-xl leading-relaxed">{desc}</p>
  </div>
);

const SkillBadge = ({ name, type }) => {
    let colorClass = "text-neutral-400 border-neutral-800 bg-neutral-900/50";
    if (type === 'core') colorClass = "text-cyan-400 border-cyan-900/30 bg-cyan-950/10";
    if (type === 'learning') colorClass = "text-yellow-600 border-yellow-900/30 bg-yellow-950/10";

    return (
        <span className={`text-xs font-mono px-3 py-1.5 rounded border ${colorClass} flex items-center gap-2`}>
            {name}
            {type === 'learning' && <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full animate-pulse" />}
        </span>
    );
};

export default function Portfolio() {
  const [activeProject, setActiveProject] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const projects = [
    {
      id: 0,
      title: "Talks - Secure Messaging App",
      subtitle: "Android Privacy-first E2EE Communication Architecture",
      status: "ACTIVE",
      icon: Smartphone,
      tech: ["Encryption Protocol (X3DH + Double Ratchet)", "Android (Java + Kotlin)", "Custom Key Management & Session Handling", "Encrypted SQLite Storage (AES)"],
      features: [
        { label: "Encryption", value: "True End-to-End" },
        { label: "Threat Model", value: "Zero-Trust Server" },
        { label: "Key Safety", value: "Client-Only Key Storage" }
      ],
      github_url: "Private till completed"
    },
    {
      id: 1,
      title: "AssistOne",
      subtitle: "Smart Assistive Hardware for the Visually Impaired",
      status: "PROTOTYPE",
      icon: Eye,
      tech: [
        "Real-time obstacle detection and navigation",
        "Embedded C++ firmware",
        "GPS modules with companion mobile app",
        "OpenCV-based computer vision",
        "Text-to-Speech audio feedback",
        "IoT-based device to app communication"
      ],
      features: [
        { label: "Latency", value: "Instant real-time response" },
        { label: "Tracking", value: "Continuous live location tracking" },
        { label: "Assistant", value: "Context-aware AI guidance" },
        { label: "Output", value: "Audio cues and haptic feedback" }
      ],
      github_url: "Private"
    },
    {
      id: 2,
      title: "BreatheSense",
      subtitle: "AI-Based Breathing & Lung Health Analyzer",
      status: "RESEARCH",
      icon: Activity,
      tech: [
        "Breath Gas Sensors (VOC Detection)",
        "Digital Stethoscope Audio Processing",
        "AI-Based Signal Analysis",
        "Microcontroller + Edge Processing"
      ],
      features: [
        { label: "Breath Input", value: "Chemical patterns in exhaled air" },
        { label: "Audio Input", value: "Lung sounds (wheeze, crackle, airflow)" },
        { label: "Output", value: "Disease probability + confidence score" }
      ],
      github_url: "Private"
    },
    {
      id: 3,
      title: "Brain Tumor Segmentation",
      subtitle: "End-to-End MRI-Based Tumor Analysis Pipeline",
      status: "RESEARCH",
      icon: Scan,
      tech: ["Python", "PyTorch", "U-Net-Based Models", "MRI Preprocessing & Mask Handling"],
      features: [
        { label: "Primary Task", value: "Pixel-Level Tumor Instance Segmentation" },
        { label: "Evaluation Metric", value: "Dice Score ≥ 0.90 on Validation Data" },
        { label: "Model Output", value: "Tumor Mask + Severity Score" }
      ],
      github_url: "Private"
    }
  ];

    const domains = [
    {
      title: "Software Systems",
      icon: Server,
      description: "Building secure, scalable systems with focus on cryptography, End-to-End Encrypted messaging, and distributed architecture across Android, web, and backend platforms.",
      technologies: ["Cryptography", "Key Management", "Android Architecture", "Backend Systems", "Web Apps", "System-level Engineering"]
    },
    {
      title: "Hardware & Embedded Systems",
      icon: Cpu,
      description: "End-to-end hardware projects integrating sensors, microcontrollers, communication modules with software layers for real-world assistive and health monitoring applications.",
      technologies: ["Sensor Integration", "Computer Vision", "NLP", "MCU Programming", "GPS Tracking", "IoT Communication"]
    },
    {
      title: "Applied AI & Medical Research",
      icon: Brain,
      description: "Research-focused AI pipelines for medical imaging, specializing in brain tumor detection, instance segmentation, and clinical decision support with emphasis on accuracy and interpretability.",
      technologies: ["MRI Segmentation", "U-Net Architecture", "Medical Imaging", "Instance Segmentation", "Severity Scoring", "Clinical Visualization"]
    }
  ];

  return (
    <div className={`min-h-screen bg-black text-neutral-300 font-sans selection:bg-cyan-900 selection:text-cyan-100 ${mounted ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 h-14 flex items-center justify-between px-6 md:px-12
                      bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 shadow-lg transition-all duration-300">
        
        <div className="font-mono text-sm tracking-widest text-neutral-100 flex items-center gap-2 hover:text-cyan-500 transition-colors cursor-pointer">
          <Terminal size={16} className="text-cyan-500" />
          AYUSH M
        </div>
        
        
        <div className="flex gap-6 text-[10px] sm:text-xs font-mono">
          <a
            href="#projects"
            className="relative group text-neutral-500 hover:text-cyan-500 transition-colors"
          >
            PROJECTS
            <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <a
            href="#domains"
            className="relative group text-neutral-500 hover:text-cyan-500 transition-colors"
          >
            DOMAINS
            <span className="absolute left-0 -bottom-1 w-0 h-[1.5px] bg-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </a>
          <span className="text-cyan-500/80">SYS_READY</span>
        </div>
      </nav>


      <main className="pt-36 px-6 md:px-10 max-w-6xl mx-auto pb-24">
        
        {/* Hero Section */}
        <section className="min-h-[60vh] flex flex-col lg:flex-row items-center gap-12 mb-32">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono text-cyan-500">
              <Terminal size={12} />
              <span>17 YR OLD • DEVELOPER • INNOVATOR</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
              Ayush Mallick.
            </h1>
            <h2 className="text-2xl md:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-neutral-200 to-neutral-600 leading-tight">
              Building Real Systems Across<br/>Software • Hardware • Research
            </h2>
            <p className="text-lg text-neutral-400 max-w-xl leading-relaxed">
              17 year old passionate developer bridging software, hardware, and applied AI. From secure messaging systems to medical imaging to assistive embedded devices, designing end-to-end solutions with technical depth.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-4">
               <button className="px-6 py-2 bg-neutral-100 text-neutral-950 text-sm font-medium hover:bg-cyan-500 hover:text-black transition-colors rounded-sm"
               onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>
                View Work
                </button>
                <button className="px-6 py-2 border border-neutral-700 text-neutral-300 font-medium text-sm hover:border-neutral-500 transition-colors flex items-center gap-2"
                onClick={() => window.open('https://github.com/ayushm-75/', '_blank')}>
                  <Github size={16} /> GitHub
                </button>

                <button
                  className="px-6 py-2 border border-neutral-800 text-neutral-400 text-sm font-medium hover:border-neutral-600 hover:text-white transition-colors rounded-sm font-mono"
                  onClick={() => document.querySelector('section.border-t').scrollIntoView({ behavior: 'smooth' })}
                >
                  Contact Me.
                </button>

            </div>
          </div>
          
          <div className="flex-1 w-full h-64 lg:h-96">
            <SystemIntegrationViz />
          </div>
        </section>

        {/* Domains Section */}
        <div id="domains" className="mb-32">
          <SectionHeader number="1" title="Domains of Execution" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {domains.map((domain, idx) => (
              <DomainCard key={idx} {...domain} />
            ))}
          </div>
        </div>

        {/* Skills Section */}
        <div className="mb-32">
            <SectionHeader number="2" title="Technical Proficiency" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div>
                    <h4 className="text-sm font-medium text-neutral-300 mb-4 flex items-center gap-2">
                        <Code size={16} /> Languages
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {["Java", "Kotlin", "Python", "C++", "JavaScript", "HTML/CSS", "React"].map(s => (
                            <SkillBadge key={s} name={s} type="core" />
                        ))}
                         <SkillBadge name="Dart" type="learning" />
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-neutral-300 mb-4 flex items-center gap-2">
                        <Cpu size={16} /> Systems & Hardware
                    </h4>
                    <div className="flex flex-wrap gap-2">
                         {["Embedded Systems", "Sensors", "Android Dev", "Cryptography", "Web Arch"].map(s => (
                            <SkillBadge key={s} name={s} type="normal" />
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-neutral-300 mb-4 flex items-center gap-2">
                        <Activity size={16} /> Research & AI
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {["PyTorch", "Medical AI", "Computer Vision", "Data Pipelines"].map(s => (
                            <SkillBadge key={s} name={s} type="normal" />
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* Projects Section */}
        <div id="projects" className="mb-32">
          <SectionHeader number="3" title="Notable Projects" />
          <div className="space-y-4">
            {projects.map((p) => (
                <ProjectCard 
                    key={p.id} 
                    project={p} 
                    expanded={activeProject === p.id} 
                    onClick={() => setActiveProject(activeProject === p.id ? -1 : p.id)}
                    github={p.github_url}
                />
            ))}
          </div>
        </div>

        {/* Deep Dive Section*/}
        <div className="mb-32">
            <div className="flex items-center gap-2 mb-6">
                <MonoLabel className="text-cyan-500">DEEP DIVE ANALYSIS</MonoLabel>
                <div className="h-px bg-neutral-800 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border border-neutral-800 bg-neutral-900/20">
                <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-neutral-800 bg-neutral-950 p-8 flex flex-col items-center justify-center relative min-h-[300px]">
                    <div className="absolute top-4 left-4 text-xs font-mono text-neutral-600">FIG 1.1: BREATHESENSE FLOW</div>
                    <ArchitectureDiagram type="breathesense" />
                </div>
                <div className="lg:col-span-3 p-8 lg:p-10">
                    <h3 className="text-2xl font-semibold text-neutral-100 mb-6">Project Focus: BreatheSense</h3>
                    
                    <div className="space-y-8">
                        <div>
                            <MonoLabel className="text-cyan-900 mb-2 block">The Engineering Problem</MonoLabel>
                            <p className="text-neutral-400 text-sm leading-relaxed">
                                Respiratory disease diagnosis typically requires expensive clinical equipment. The goal was to build a non-invasive, portable prototype that correlates chemical breath markers (VOCs) with physical lung sounds (Auscultation) for higher diagnostic confidence.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <MonoLabel className="text-cyan-900 mb-2 block">Technical Constraints</MonoLabel>
                                <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside marker:text-neutral-700">
                                    <li>Sensor cross-sensitivity noise</li>
                                    <li>Real-time audio filtering on edge</li>
                                    <li>Synchronizing multi-modal data streams</li>
                                </ul>
                            </div>
                            <div>
                                <MonoLabel className="text-cyan-900 mb-2 block">Outcome</MonoLabel>
                                <ul className="text-sm text-neutral-400 space-y-2 list-disc list-inside marker:text-neutral-700">
                                    <li>Dual-model confidence weighting</li>
                                    <li>Successful prototype validation</li>
                                    <li>Foundation for low-cost screening</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        

        {/* Timeline */}
        <div className="mb-12">
            <SectionHeader number="4" title="Progression" />
            <div className="max-w-3xl">
              <TimelineItem 
                year="2024 - Present"
                title="Research-Oriented Systems & Product Engineering"
                role="Developer"
                desc="Working on research-grade medical imaging systems (brain tumor segmentation, severity analysis) and architecting Talks, a privacy-first secure messaging platform. Focused on scalable architectures, cryptography, and real-world constraints."
              />

              <TimelineItem 
                  year="2023"
                  title="Embedded Systems & Applied Intelligence"
                  role="Developer"
                  desc="Built hardware-focused systems like AssistOne, integrating sensors, microcontrollers, and embedded logic. Gained hands-on experience bridging physical hardware limitations with intelligent software control."
              />

              <TimelineItem 
                  year="2022"
                  title="Android & Software Foundations"
                  role="Student"
                  desc="Started with Android development fundamentals and core programming concepts. Built small applications to understand UI, app lifecycle, and practical software development workflows."
              />

              <TimelineItem 
                  year="2021"
                  title="Early Exploration in Web & Programming"
                  role="Beginner"
                  desc="Explored web development and general programming concepts, building curiosity and foundational understanding that shaped later specialization in systems and application development."
              />
            </div>
        </div>

        {/* Contact */}
        <section className="border-t border-neutral-900 pt-16 pb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Initialize Contact.</h2>
                    <p className="text-neutral-500 max-w-md">
                        Open to collaboration on privacy-first systems, secure communication, and medical imaging research.
                    </p>
                </div>
                <div className="flex gap-6">
                    <a href="mailto:ayushmallick228@gmail.com" className="group flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-cyan-500 transition-colors">EMAIL</span>
                        <span className="text-neutral-300 group-hover:text-white">ayushmallick228@gmail.com</span>
                    </a>
                    <a href="https://www.reddit.com/user/OrbitalSoup/" className="group flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-neutral-600 group-hover:text-cyan-500 transition-colors">REDDIT</span>
                        <span className="text-neutral-300">u/OrbitalSoup</span>
                    </a>
                </div>
            </div>
            <div className="mt-16 text-[10px] font-mono text-neutral-700 flex justify-between">
                <span>© 2025 AYUSH M. NO TRACKERS. NO ANALYTICS.</span>
                <FooterRenderTime />
            </div>
        </section>
      </main>
    </div>
  );
}