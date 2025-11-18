// Centralized salary computation logic
// Rules:
// - Read raw values from form (numbers or strings)
// - If salary_type === 'monthly': multiply by 100000 and round to nearest integer
// - Else (daily/hourly): save exactly as typed (no scaling, no rounding)
// - Map to salary_min/salary_max based on salary_structure

export type SalaryType = 'monthly' | 'daily' | 'hourly'
export type SalaryStructure = 'fixed' | 'range' | 'min_only' | 'max_only' | 'negotiable'

const toNum = (v: number | string | null | undefined): number | null => {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) throw new Error('Invalid numeric amount')
  return n
}

export function computeSalaryValues(
  salary_type: SalaryType,
  salary_structure: SalaryStructure,
  amount_min?: number | string | null,
  amount_max?: number | string | null
): { salary_min: number | null; salary_max: number | null } {
  const minIn = toNum(amount_min)
  const maxIn = toNum(amount_max)

  // Derive final numeric values based on salary_type
  let value_min: number | null
  let value_max: number | null

  if (salary_type === 'monthly') {
    // Lakhs → MMK with rounding to avoid floating-point precision errors
    value_min = minIn !== null ? Math.round(minIn * 100000) : null
    value_max = maxIn !== null ? Math.round(maxIn * 100000) : null
  } else {
    // daily/hourly: save exactly as typed (no scaling, no rounding)
    value_min = minIn
    value_max = maxIn
  }

  switch (salary_structure) {
    case 'fixed':
      if (value_min === null) throw new Error('Fixed amount required')
      return { salary_min: value_min, salary_max: value_min }
    case 'range':
      if (value_min === null || value_max === null) throw new Error('Range amounts required')
      return { salary_min: value_min, salary_max: value_max }
    case 'min_only':
      if (value_min === null) throw new Error('Min amount required')
      return { salary_min: value_min, salary_max: null }
    case 'max_only':
      if (value_max === null) throw new Error('Max amount required')
      return { salary_min: null, salary_max: value_max }
    case 'negotiable':
      return { salary_min: null, salary_max: null }
    default:
      // Type guards ensure we don't get here in normal usage
      return { salary_min: null, salary_max: null }
  }
}
