import Globe from "react-globe.gl";

function TestPage() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Globe
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="#000000"
      />
    </div>
  );
}

export default TestPage;