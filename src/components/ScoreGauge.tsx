import { gradeTone } from '@/lib/scoring';
import type { Grade } from '@/lib/types';

const TONE: Record<string, string> = {
  pass: 'var(--pass)',
  warn: 'var(--warn)',
  fail: 'var(--fail)',
};

interface ScoreGaugeProps {
  score: number;
  grade: Grade;
  size?: number;
}

/**
 * Anillo de puntuación en SVG puro. Sin librería de gráficos: es un único
 * círculo y así no entra JS extra en el bundle de la página de informe.
 */
export function ScoreGauge({ score, grade, size = 168 }: ScoreGaugeProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - Math.max(0, Math.min(100, score)) / 100);
  const color = TONE[gradeTone(grade)];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Puntuación ${score} sobre 100, nota ${grade}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--bg-inset)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)' }}
        />
      </svg>

      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-5xl font-semibold leading-none tracking-tight" style={{ color }}>
          {grade}
        </span>
        <span className="mt-1.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
          {score}/100
        </span>
      </div>
    </div>
  );
}
