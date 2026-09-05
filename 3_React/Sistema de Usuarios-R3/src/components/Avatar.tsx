import { useState } from 'react';
import { getAssetUrl } from '../utils/assets';

type Props = {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
};

/**
 * Obtiene las 1 o 2 iniciales a partir de un nombre y apellido.
 * Ejemplo: "Agustina Banegas" -> "AB"
 */
function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'U';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({ src, name = '', size = 40, className = '' }: Props) {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(name);
  const fullUrl = src ? getAssetUrl(src) : '';

  if (fullUrl && !imgError) {
    return (
      <div
        className={`avatar-container ${className}`.trim()}
        style={{ width: size, height: size }}
      >
        <img
          src={fullUrl}
          alt={`Foto de ${name}`}
          className="avatar-img"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`avatar-container avatar-initials ${className}`.trim()}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(12, Math.floor(size * 0.4)),
      }}
      role="img"
      aria-label={`Avatar con iniciales ${initials}`}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
