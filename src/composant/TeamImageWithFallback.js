import { useState } from "react";

const teamColors = {
  redbull: "#0600EF",
  mercedes: "#00D2BE",
  ferrari: "#DC0000",
  mclaren: "#FF8700",
  astonmartin: "#006C3B",
  alpine: "#0082FA",
  haasf1team: "#EBEBEB",
  alfatauri: "#3671C6",
  williams: "#005AFF",
  sauber: "#23183E",
  rbf1team: "#0600EF",
  audi: "#00342E",
  cadillacf1team: "#1E3050",
  kicksauber: "#23183E",
};

function TeamImageWithFallback({ teamName, className }) {
  const [imageError, setImageError] = useState(false);
  const normalizedName = teamName.toLowerCase().replace(/\s+/g, "");
  const bgColor = teamColors[normalizedName] || "#1F2937";
  const initials = teamName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  if (imageError) {
    return (
      <div
        className={`${className} flex items-center justify-center text-white font-bold text-sm rounded`}
        style={{ backgroundColor: bgColor }}
        title={teamName}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`team-img/${normalizedName}.avif`}
      alt={teamName}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

export default TeamImageWithFallback;   