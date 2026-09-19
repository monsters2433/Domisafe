import type { CheckResult, Grade } from './types';

/**
 * Media ponderada de los checks. Los que no están disponibles (falta de clave
 * de API, cupo agotado, proveedor caído) se excluyen del cálculo en vez de
 * penalizar: un problema nuestro no debe bajar la nota del dominio.
 */
export function computeScore(checks: CheckResult[]): number {
  const usable = checks.filter((check) => check.status !== 'unavailable' && check.weight > 0);
  if (usable.length === 0) return 0;

  const totalWeight = usable.reduce((sum, check) => sum + check.weight, 0);
  const weighted = usable.reduce((sum, check) => sum + check.score * check.weight, 0);

  return Math.round(weighted / totalWeight);
}

export function toGrade(score: number): Grade {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 75) return 'B';
  if (score >= 65) return 'C';
  if (score >= 50) return 'D';
  if (score >= 35) return 'E';
  return 'F';
}

export function gradeTone(grade: Grade): 'pass' | 'warn' | 'fail' {
  if (grade === 'A+' || grade === 'A' || grade === 'B') return 'pass';
  if (grade === 'C' || grade === 'D') return 'warn';
  return 'fail';
}

export function scoreVerdict(score: number): string {
  if (score >= 95) return 'Configuración de seguridad ejemplar.';
  if (score >= 85) return 'Buena postura de seguridad, con detalles menores por pulir.';
  if (score >= 75) return 'Base sólida, pero hay puntos que conviene reforzar.';
  if (score >= 65) return 'Configuración aceptable con carencias claras.';
  if (score >= 50) return 'Varias debilidades relevantes que deberías corregir.';
  if (score >= 35) return 'Problemas serios de configuración.';
  return 'Configuración de seguridad muy deficiente.';
}
