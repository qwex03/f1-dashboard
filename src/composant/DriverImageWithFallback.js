import { useState } from "react";

function DriverImageWithFallback({ driverName, familyName, className }) {
  const [imageError, setImageError] = useState(false);
  const initials = `${familyName.charAt(0)}${driverName.charAt(0)}`.toUpperCase();

  if (imageError) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-gradient-to-br from-red-500 to-red-700 text-white font-bold text-2xl rounded-full border-4 border-white shadow-xl`}
        title={`${driverName} ${familyName}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={`/driver-img/${familyName.toLowerCase()}.avif`}
      alt={familyName}
      className={className}
      onError={() => setImageError(true)}
    />
  );
}

export default DriverImageWithFallback;
