import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import gpData from "../json/calendar.json"; 


function CalendrierPage() {
  const globeRef = useRef();
  const [selectedGP, setSelectedGP] = useState(null);

  useEffect(() => {
    if (!globeRef.current) return;

    const scene = globeRef.current.scene();
    const starCount = 100000;
    const starGeometry = new THREE.BufferGeometry();
    const starVertices = [];

    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const starCanvas = document.createElement("canvas");
    starCanvas.width = starCanvas.height = 64;
    const ctx = starCanvas.getContext("2d");

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "white");
    gradient.addColorStop(0.2, "white");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.5)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      size: 2,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
  }, []);

  return (
    <div className="h-full w-full">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="#000000"
        showAtmosphere={true}
        pointsData={gpData}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "red"} 
        pointAltitude={0.02} 
        pointRadius={0.8} 
        onPointClick={(point) => setSelectedGP(point)}
      />

      {selectedGP && (
       <div
        className="
        absolute top-1/2 left-1/2 
        transform -translate-x-1/2 -translate-y-1/2
        bg-white/10 backdrop-blur-md 
        border border-white/30
        rounded-2xl shadow-2xl
        p-6 w-80 max-w-[90%]
        text-white
        animate-fadeIn
        "
      >
        <h2 className="text-2xl font-extrabold mb-2">{selectedGP.gp}</h2>
        <p className="text-sm mb-1"><span className="font-semibold">Circuit:</span> {selectedGP.circuit}</p>
        <p className="text-sm mb-1"><span className="font-semibold">Ville:</span> {selectedGP.city}</p>
        <p className="text-sm mb-4"><span className="font-semibold">Date:</span> {selectedGP.date}</p>
        <button
        onClick={() => setSelectedGP(null)}
        className="
        w-full py-2 bg-red-600 hover:bg-red-500 
        rounded-xl font-semibold
        transition-colors duration-200
        shadow-md
        "
        >
        Fermer
        </button>
      </div>
      )}
    </div>
  );
}

export default CalendrierPage;
