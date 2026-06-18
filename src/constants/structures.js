// Central registry of the 8 compensation structures.
// Each entry drives: Step 2 selector cards, Step 3 dynamic parameter form,
// the dashboard parameter summary, and the scenario "key metric" column.
//
// Field schema (consumed by Step3Parameters):
//   { key, label, type, ...typeProps, hint?, showIf?(params) }
// Types: 'text' | 'currency' | 'number' | 'toggle' | 'percentSelect' | 'tiers'
//   toggle:        { options: [{ value, label }] }
//   percentSelect: { min, max, step }   (values are whole-number percents)
//   tiers:         tier builder (up to 4) -> [{ upper, pct }]

export const STRUCTURES = {
  base_collections: {
    id: 'base_collections',
    name: 'Base + Collections Bonus',
    description:
      'Fixed base salary, bonus % on collections above a minimum goal.',
    metric: { key: 'collections', label: 'Monthly Collections', format: 'currency' },
    defaults: {
      salaryType: 'Annual',
      baseSalary: 60000,
      targetPct: 25,
      avgPerVisit: 75,
      visitPeriod: 'Month',
      bonusPct: 20,
    },
    fields: [
      {
        key: 'salaryType',
        label: 'Salary input type',
        type: 'toggle',
        options: [
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Annual', label: 'Annual' },
        ],
      },
      { key: 'baseSalary', label: 'Base salary amount', type: 'currency' },
      {
        key: 'targetPct',
        label: 'Salary-to-collections target %',
        type: 'percentSelect',
        min: 15,
        max: 40,
        step: 1,
        hint: 'The share of collections payroll should not exceed. Default 25%.',
      },
      { key: 'avgPerVisit', label: 'Average collections per visit', type: 'currency' },
      {
        key: 'visitPeriod',
        label: 'Visit period',
        type: 'toggle',
        options: [
          { value: 'Month', label: 'Month' },
          { value: 'Week', label: 'Week' },
        ],
      },
      {
        key: 'bonusPct',
        label: 'Bonus % on overage',
        type: 'percentSelect',
        min: 15,
        max: 35,
        step: 5,
      },
    ],
  },

  base_profit: {
    id: 'base_profit',
    name: 'Base + Profit Bonus',
    description: 'Fixed base salary, bonus % on net profit above a threshold.',
    metric: { key: 'profit', label: 'Monthly Net Profit', format: 'currency' },
    defaults: {
      salaryType: 'Monthly',
      baseSalary: 5000,
      profitThreshold: 20000,
      bonusPct: 15,
      monthlyCollections: 60000,
    },
    fields: [
      {
        key: 'salaryType',
        label: 'Salary input type',
        type: 'toggle',
        options: [
          { value: 'Monthly', label: 'Monthly' },
          { value: 'Annual', label: 'Annual' },
        ],
      },
      { key: 'baseSalary', label: 'Base salary amount', type: 'currency' },
      { key: 'profitThreshold', label: 'Monthly profit threshold', type: 'currency' },
      {
        key: 'bonusPct',
        label: 'Bonus % of net profit above threshold',
        type: 'percentSelect',
        min: 10,
        max: 30,
        step: 5,
      },
      {
        key: 'monthlyCollections',
        label: 'Monthly collections (for sustainability)',
        type: 'currency',
      },
    ],
  },

  collections_only: {
    id: 'collections_only',
    name: 'Collections-Only (No Base)',
    description:
      'No guaranteed salary — team member earns a straight % of collections.',
    metric: { key: 'collections', label: 'Monthly Collections', format: 'currency' },
    defaults: {
      collectionsPct: 40,
      avgPerVisit: 75,
      visitPeriod: 'Month',
      targetComp: 6000,
    },
    fields: [
      {
        key: 'collectionsPct',
        label: 'Collections % earned by team member',
        type: 'percentSelect',
        min: 30,
        max: 55,
        step: 5,
      },
      { key: 'avgPerVisit', label: 'Average collections per visit', type: 'currency' },
      {
        key: 'visitPeriod',
        label: 'Visit period',
        type: 'toggle',
        options: [
          { value: 'Month', label: 'Month' },
          { value: 'Week', label: 'Week' },
        ],
      },
      {
        key: 'targetComp',
        label: 'Target monthly take-home',
        type: 'currency',
        hint: 'Used to reverse-calculate the visits needed to hit this number.',
      },
    ],
  },

  tiered_collections: {
    id: 'tiered_collections',
    name: 'Tiered Collections Bonus',
    description: 'Escalating bonus % as collections hit higher bands.',
    metric: { key: 'collections', label: 'Monthly Collections', format: 'currency' },
    defaults: {
      baseSalary: 4000,
      monthlyGoal: 40000,
      tiers: [
        { upper: 50000, pct: 15 },
        { upper: 60000, pct: 20 },
        { upper: 75000, pct: 25 },
      ],
    },
    fields: [
      { key: 'baseSalary', label: 'Base salary (monthly)', type: 'currency' },
      { key: 'monthlyGoal', label: 'Monthly collections goal', type: 'currency' },
      { key: 'tiers', label: 'Bonus tiers (above goal)', type: 'tiers' },
    ],
  },

  per_visit: {
    id: 'per_visit',
    name: 'Per-Visit Rate',
    description: 'Fixed dollar amount per patient visit — no base, no bonus.',
    metric: { key: 'visits', label: 'Visits / Month', format: 'number' },
    defaults: {
      visitRate: 25,
      visitsPerMonth: 300,
      avgPerVisit: 75,
    },
    fields: [
      { key: 'visitRate', label: 'Rate per visit', type: 'currency' },
      {
        key: 'visitsPerMonth',
        label: 'Estimated visits per month',
        type: 'number',
        hint: 'Scenario baseline — the "At Goal" row uses this.',
      },
      {
        key: 'avgPerVisit',
        label: 'Average collections per visit',
        type: 'currency',
        hint: 'Used for the sustainability calculation.',
      },
    ],
  },

  flat_milestone: {
    id: 'flat_milestone',
    name: 'Flat Milestone Bonus',
    description:
      'Fixed $ bonus paid when a specific collections or visit target is hit.',
    metric: { key: 'performance', label: 'Performance', format: 'auto' },
    defaults: {
      baseSalary: 4000,
      milestoneType: 'Collections Target',
      milestoneTarget: 50000,
      bonusAmount: 1000,
      hasStretch: false,
      stretchTarget: 65000,
      stretchBonus: 2000,
    },
    fields: [
      { key: 'baseSalary', label: 'Base salary (monthly)', type: 'currency' },
      {
        key: 'milestoneType',
        label: 'Milestone type',
        type: 'toggle',
        options: [
          { value: 'Collections Target', label: 'Collections Target' },
          { value: 'Visit Target', label: 'Visit Target' },
        ],
      },
      {
        key: 'milestoneTarget',
        label: 'Milestone target',
        type: 'currency',
        currencyIf: (p) => p.milestoneType === 'Collections Target',
      },
      { key: 'bonusAmount', label: 'Bonus amount on hitting milestone', type: 'currency' },
      {
        key: 'hasStretch',
        label: 'Add a second stretch milestone?',
        type: 'toggle',
        options: [
          { value: false, label: 'No' },
          { value: true, label: 'Yes' },
        ],
      },
      {
        key: 'stretchTarget',
        label: 'Stretch milestone target',
        type: 'currency',
        showIf: (p) => p.hasStretch === true,
        currencyIf: (p) => p.milestoneType === 'Collections Target',
      },
      {
        key: 'stretchBonus',
        label: 'Stretch bonus amount',
        type: 'currency',
        showIf: (p) => p.hasStretch === true,
      },
    ],
  },

  hybrid_two_tier: {
    id: 'hybrid_two_tier',
    name: 'Base + Two-Tier Bonus',
    description:
      'Base salary + lower bonus % up to a cap, higher % beyond the cap.',
    metric: { key: 'collections', label: 'Monthly Collections', format: 'currency' },
    defaults: {
      baseSalary: 4000,
      monthlyGoal: 40000,
      tier1Pct: 15,
      tier1Cap: 15000,
      tier2Pct: 25,
    },
    fields: [
      { key: 'baseSalary', label: 'Base salary (monthly)', type: 'currency' },
      { key: 'monthlyGoal', label: 'Monthly collections goal', type: 'currency' },
      {
        key: 'tier1Pct',
        label: 'Tier 1 bonus % (overage up to cap)',
        type: 'percentSelect',
        min: 5,
        max: 30,
        step: 5,
      },
      {
        key: 'tier1Cap',
        label: 'Tier 1 cap (overage $ where rate escalates)',
        type: 'currency',
      },
      {
        key: 'tier2Pct',
        label: 'Tier 2 bonus % (overage above cap)',
        type: 'percentSelect',
        min: 5,
        max: 40,
        step: 5,
      },
    ],
  },

  revenue_share: {
    id: 'revenue_share',
    name: 'Revenue Share',
    description: 'Team member earns a % of total gross practice revenue.',
    metric: { key: 'revenue', label: 'Gross Monthly Revenue', format: 'currency' },
    defaults: {
      sharePct: 10,
      hasBase: false,
      baseSalary: 4000,
      practiceRevenue: 60000,
    },
    fields: [
      {
        key: 'sharePct',
        label: 'Revenue share %',
        type: 'percentSelect',
        min: 5,
        max: 20,
        step: 5,
      },
      {
        key: 'hasBase',
        label: 'Include a base salary?',
        type: 'toggle',
        options: [
          { value: false, label: 'No' },
          { value: true, label: 'Yes' },
        ],
      },
      {
        key: 'baseSalary',
        label: 'Base salary (monthly)',
        type: 'currency',
        showIf: (p) => p.hasBase === true,
      },
      {
        key: 'practiceRevenue',
        label: 'Practice gross monthly revenue',
        type: 'currency',
      },
    ],
  },
}

// Ordered list for the Step 2 card selector.
export const STRUCTURE_LIST = Object.values(STRUCTURES)

export const DEFAULT_TARGET_PCT = 30
