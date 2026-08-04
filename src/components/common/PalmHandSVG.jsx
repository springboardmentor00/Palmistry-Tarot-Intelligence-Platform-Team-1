import React from 'react';

// 5 FINGER palm SVG with labeled palm lines
const PalmHandSVG = ({ animate = false, showLabels = true, size = 280 }) => {
  const animClass = animate ? 'palm-line-animated' : '';
  const delay1 = animate ? 'palm-line-animated-delay-1' : '';
  const delay2 = animate ? 'palm-line-animated-delay-2' : '';
  const delay3 = animate ? 'palm-line-animated-delay-3' : '';
  const delay4 = animate ? 'palm-line-animated-delay-4' : '';

  return (
    <svg
      viewBox="0 0 300 440"
      width={size}
      height={size * 1.47}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="palmGrad" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor="#f5d0a9" />
          <stop offset="70%" stopColor="#e8b88a" />
          <stop offset="100%" stopColor="#d4a574" />
        </radialGradient>
        <filter id="palmShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b3dff" />
          <stop offset="100%" stopColor="#c4a8ff" />
        </linearGradient>
        <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f5a833" />
          <stop offset="100%" stopColor="#f8c971" />
        </linearGradient>
        <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#ffa8a8" />
        </linearGradient>
        <linearGradient id="lineGrad4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#51cf66" />
          <stop offset="100%" stopColor="#96f2a0" />
        </linearGradient>
      </defs>

      {/* ===== HAND SHAPE WITH 5 FINGERS ===== */}
      <g filter="url(#palmShadow)">
        {/* Thumb - finger 1 */}
        <path
          d="M 68 280 Q 30 250 18 210 Q 10 180 22 165 Q 34 150 48 160 Q 62 170 72 200 Q 78 220 82 245"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Thumb tip */}
        <ellipse cx="28" cy="175" rx="14" ry="18" fill="url(#palmGrad)" stroke="#c4956a" strokeWidth="1.5" />
        {/* Thumb nail */}
        <ellipse cx="25" cy="168" rx="8" ry="10" fill="#fde8d0" stroke="#c4956a" strokeWidth="1" />
        {/* Thumb joint line */}
        <path d="M 38 185 Q 30 188 22 195" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />

        {/* Index finger - finger 2 */}
        <path
          d="M 95 190 Q 92 150 90 110 Q 88 80 95 65 Q 102 50 112 55 Q 122 60 122 80 Q 122 100 120 130 Q 118 160 118 190"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Index tip */}
        <ellipse cx="107" cy="58" rx="16" ry="18" fill="url(#palmGrad)" stroke="#c4956a" strokeWidth="1.5" />
        {/* Index nail */}
        <ellipse cx="107" cy="50" rx="10" ry="11" fill="#fde8d0" stroke="#c4956a" strokeWidth="1" />
        {/* Index joint lines */}
        <path d="M 93 110 Q 105 108 118 112" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />
        <path d="M 94 145 Q 106 143 117 147" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />

        {/* Middle finger - finger 3 */}
        <path
          d="M 130 190 Q 128 145 126 100 Q 124 60 132 42 Q 140 25 152 30 Q 164 35 162 60 Q 160 85 158 110 Q 155 150 152 190"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Middle tip */}
        <ellipse cx="147" cy="35" rx="17" ry="20" fill="url(#palmGrad)" stroke="#c4956a" strokeWidth="1.5" />
        {/* Middle nail */}
        <ellipse cx="147" cy="26" rx="11" ry="12" fill="#fde8d0" stroke="#c4956a" strokeWidth="1" />
        {/* Middle joint lines */}
        <path d="M 129 100 Q 145 97 157 102" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />
        <path d="M 129 140 Q 145 137 156 142" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />

        {/* Ring finger - finger 4 */}
        <path
          d="M 162 195 Q 165 155 168 115 Q 170 80 178 65 Q 186 50 196 56 Q 206 62 204 82 Q 202 100 198 130 Q 194 160 190 195"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Ring tip */}
        <ellipse cx="190" cy="58" rx="16" ry="18" fill="url(#palmGrad)" stroke="#c4956a" strokeWidth="1.5" />
        {/* Ring nail */}
        <ellipse cx="190" cy="50" rx="10" ry="11" fill="#fde8d0" stroke="#c4956a" strokeWidth="1" />
        {/* Ring joint lines */}
        <path d="M 168 115 Q 183 112 197 117" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />
        <path d="M 167 150 Q 182 147 196 152" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />

        {/* Pinky (Little) finger - finger 5 */}
        <path
          d="M 198 200 Q 205 170 212 140 Q 218 115 226 105 Q 234 95 242 102 Q 250 109 246 125 Q 242 140 236 160 Q 230 180 222 205"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Pinky tip */}
        <ellipse cx="236" cy="100" rx="14" ry="16" fill="url(#palmGrad)" stroke="#c4956a" strokeWidth="1.5" />
        {/* Pinky nail */}
        <ellipse cx="236" cy="93" rx="9" ry="10" fill="#fde8d0" stroke="#c4956a" strokeWidth="1" />
        {/* Pinky joint lines */}
        <path d="M 214 140 Q 228 137 240 142" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />
        <path d="M 212 168 Q 226 165 238 170" fill="none" stroke="#c4956a" strokeWidth="1" opacity="0.5" />

        {/* Palm base */}
        <path
          d="M 82 245 Q 80 280 85 310 Q 90 350 105 380 Q 120 410 150 425 Q 180 410 195 380 Q 210 350 215 310 Q 220 280 222 205"
          fill="url(#palmGrad)"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Left side of palm connecting to thumb */}
        <path
          d="M 82 245 Q 78 220 72 200"
          fill="none"
          stroke="#c4956a"
          strokeWidth="1.5"
        />
        {/* Wrist line */}
        <path d="M 85 380 Q 120 395 150 400 Q 180 395 215 380" fill="none" stroke="#c4956a" strokeWidth="1.5" opacity="0.6" />
      </g>

      {/* ===== PALM LINES ===== */}

      {/* Heart Line */}
      <path
        d="M 85 255 Q 110 240 140 245 Q 170 250 200 240 Q 220 232 235 225"
        fill="none"
        stroke="url(#lineGrad3)"
        strokeWidth="3"
        strokeLinecap="round"
        className={animClass}
      />

      {/* Head Line */}
      <path
        d="M 90 285 Q 120 275 150 280 Q 180 285 210 270 Q 225 262 235 258"
        fill="none"
        stroke="url(#lineGrad1)"
        strokeWidth="3"
        strokeLinecap="round"
        className={`${animClass} ${delay1}`}
      />

      {/* Life Line */}
      <path
        d="M 95 250 Q 92 280 95 310 Q 100 345 115 370 Q 130 390 150 400"
        fill="none"
        stroke="url(#lineGrad2)"
        strokeWidth="3"
        strokeLinecap="round"
        className={`${animClass} ${delay2}`}
      />

      {/* Fate Line */}
      <path
        d="M 150 390 Q 150 360 150 330 Q 150 300 148 275 Q 147 260 145 250"
        fill="none"
        stroke="url(#lineGrad4)"
        strokeWidth="3"
        strokeLinecap="round"
        className={`${animClass} ${delay3}`}
      />

      {/* Sun Line */}
      <path
        d="M 175 380 Q 178 350 180 320 Q 182 295 183 275 Q 184 265 185 258"
        fill="none"
        stroke="#f5a833"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
        className={`${animClass} ${delay4}`}
      />

      {/* ===== LINE LABELS ===== */}
      {showLabels && (
        <g fontSize="11" fontFamily="Inter, sans-serif" fontWeight="600">
          {/* Heart Line Label */}
          <rect x="225" y="218" width="70" height="20" rx="6" fill="rgba(255,107,107,0.2)" stroke="#ff6b6b" strokeWidth="1" />
          <text x="260" y="232" fill="#ff6b6b" textAnchor="middle">Heart</text>

          {/* Head Line Label */}
          <rect x="225" y="250" width="70" height="20" rx="6" fill="rgba(139,61,255,0.2)" stroke="#8b3dff" strokeWidth="1" />
          <text x="260" y="264" fill="#a875ff" textAnchor="middle">Head</text>

          {/* Life Line Label */}
          <rect x="55" y="330" width="60" height="20" rx="6" fill="rgba(245,168,51,0.2)" stroke="#f5a833" strokeWidth="1" />
          <text x="85" y="344" fill="#f5a833" textAnchor="middle">Life</text>

          {/* Fate Line Label */}
          <rect x="125" y="345" width="60" height="20" rx="6" fill="rgba(81,207,102,0.2)" stroke="#51cf66" strokeWidth="1" />
          <text x="155" y="359" fill="#51cf66" textAnchor="middle">Fate</text>

          {/* Sun Line Label */}
          <rect x="195" y="290" width="60" height="20" rx="6" fill="rgba(245,168,51,0.15)" stroke="#f5a833" strokeWidth="1" />
          <text x="225" y="304" fill="#f5a833" textAnchor="middle">Sun</text>

          {/* Finger Labels */}
          <text x="28" y="148" fill="#c4956a" fontSize="9" textAnchor="middle">Thumb</text>
          <text x="107" y="30" fill="#c4956a" fontSize="9" textAnchor="middle">Index</text>
          <text x="147" y="7" fill="#c4956a" fontSize="9" textAnchor="middle">Middle</text>
          <text x="190" y="30" fill="#c4956a" fontSize="9" textAnchor="middle">Ring</text>
          <text x="236" y="76" fill="#c4956a" fontSize="9" textAnchor="middle">Pinky</text>
        </g>
      )}
    </svg>
  );
};

export default PalmHandSVG;