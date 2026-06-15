import { motion } from 'motion/react';

interface LogoProps {
  size?: number;
  animate?: 'spin' | 'pulse' | 'none';
  className?: string;
}

export function Logo({ size = 80, animate = 'none', className = '' }: LogoProps) {
  const animations = {
    spin: {
      rotateY: [0, 360],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    none: {}
  };

  return (
    <motion.div
      className={className}
      animate={animations[animate]}
      style={{ 
        width: size, 
        height: size,
        transformStyle: 'preserve-3d'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Fondo circular con gradiente */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0055A4" />
            <stop offset="100%" stopColor="#003d7a" />
          </linearGradient>
          <linearGradient id="helmetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF8C00" />
            <stop offset="100%" stopColor="#E67E00" />
          </linearGradient>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e8e8e8" />
          </linearGradient>
          
          {/* Sombra */}
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Círculo de fondo */}
        <circle cx="100" cy="100" r="95" fill="url(#bgGradient)" />
        
        {/* Escudo de protección (forma de escudo) */}
        <path
          d="M100 40 L140 55 L140 90 Q140 130 100 150 Q60 130 60 90 L60 55 Z"
          fill="url(#shieldGradient)"
          filter="url(#shadow)"
          opacity="0.95"
        />
        
        {/* Borde del escudo */}
        <path
          d="M100 40 L140 55 L140 90 Q140 130 100 150 Q60 130 60 90 L60 55 Z"
          stroke="#0055A4"
          strokeWidth="2"
          fill="none"
          opacity="0.5"
        />
        
        {/* Casco de seguridad */}
        <g filter="url(#shadow)">
          {/* Parte superior del casco */}
          <path
            d="M85 70 Q100 60 115 70 L115 95 Q115 105 100 108 Q85 105 85 95 Z"
            fill="url(#helmetGradient)"
          />
          
          {/* Visera del casco */}
          <ellipse
            cx="100"
            cy="95"
            rx="16"
            ry="4"
            fill="#FF6B00"
          />
          
          {/* Detalle del casco - línea central */}
          <line
            x1="100"
            y1="70"
            x2="100"
            y2="95"
            stroke="#FFFFFF"
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* Ventilaciones laterales */}
          <circle cx="90" cy="80" r="2" fill="#FFFFFF" opacity="0.4" />
          <circle cx="110" cy="80" r="2" fill="#FFFFFF" opacity="0.4" />
        </g>
        
        {/* Símbolo de verificación (checkmark) */}
        <g>
          <path
            d="M92 115 L97 120 L108 108"
            stroke="#0055A4"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
        
        {/* Texto ST (SafeTrack) */}
        <text
          x="100"
          y="140"
          fontFamily="Arial, sans-serif"
          fontSize="24"
          fontWeight="bold"
          fill="#FFFFFF"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ST
        </text>
        
        {/* Acentos decorativos - líneas diagonales en las esquinas */}
        <line x1="30" y1="170" x2="45" y2="170" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        <line x1="155" y1="170" x2="170" y2="170" stroke="#FF8C00" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        
        {/* Anillo exterior decorativo */}
        <circle 
          cx="100" 
          cy="100" 
          r="95" 
          stroke="#FF8C00" 
          strokeWidth="3" 
          fill="none" 
          opacity="0.3"
          strokeDasharray="10 5"
        />
      </svg>
    </motion.div>
  );
}
