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
      'Fixed base salary, bonus % once collections cover your target payroll share.',
    overview:
      'The bonus only kicks in once the base salary settles into a healthy share of collections — not before. Set your salary-to-collections target (the maximum % of collections you want this role to cost), and the tool calculates the collections level where that target is met. Below that level, the base is costing more than your target allows. Above it, every extra dollar collected gets shared.',
    guide: [
      {
        heading: 'Why this model works',
        text: 'The bonus threshold is not a fixed number that requires periodic adjustment — it is a ratio. As the base salary changes, the breakeven point recalculates automatically, keeping payroll aligned with collections without manual recalibration.',
      },
      {
        heading: 'When to use it',
        text: 'This model suits roles where a guaranteed base is appropriate, but payroll cost must remain within a defined share of collections before any additional compensation is paid.',
      },
      {
        heading: 'Considerations',
        text: 'Set the salary-to-collections target too low, and the bonus becomes difficult to reach, reducing its effect as an incentive. Set it too high, and the practice guarantees a higher payroll cost than the role\'s output may justify, independent of whether a bonus is ever paid.',
      },
    ],
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
    overview:
      'This rewards profitability, not just revenue. The bonus only triggers when the practice clears a profit threshold — so the team member wins when the whole business wins, not just when the schedule is full. Use this for someone whose decisions affect costs and efficiency across the practice, not just their own numbers. Only works if they have enough visibility into the financials to understand what they\'re being rewarded for.',
    guide: [
      {
        heading: 'How to think about your profit number',
        text: [
          'This is a number you bring to the tool — typically collections, less operating expenses, for the period you\'re measuring.',
          'For a whole-practice bonus, use the practice\'s standard operating expenses — staff costs, rent, supplies, and overhead the business carries regardless of who\'s working.',
          'For a division, provider, or specific role, whole-practice profit usually won\'t reflect what that person can actually influence. Calculate profit specifically for that slice — collections it generates, less costs directly traceable to it.',
          'A useful test: could this person reasonably affect this cost through their own decisions? If yes, include it. If no — costs run through the business that this role has no influence over, such as the owner\'s personal expenses run through the practice — it\'s worth leaving out, since including it rewards or penalises someone for decisions that were never theirs to make.',
        ],
      },
      {
        heading: 'Why this model works',
        text: 'A profit-based bonus ties the reward to outcomes, not just activity. The team member only benefits when the business — or the part of it they influence — is genuinely better off, not simply when the schedule is full.',
      },
      {
        heading: 'When to use it',
        text: 'Best suited to a role where decisions affect costs and efficiency, not only their own production — someone managing a division, overseeing a team, or with real visibility into how the numbers are built. It only works if they understand what they\'re being measured against.',
      },
      {
        heading: 'Considerations',
        text: 'The bonus only motivates if the profit figure is one the team member can see and trust. If costs they don\'t control are folded into the number, or if it\'s unclear how their own bonus affects the figure it\'s based on, the incentive weakens — get the definition right before the conversation, not during it.',
      },
    ],
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
    overview:
      'No guaranteed salary — the team member earns a straight percentage of what they collect. Zero fixed payroll cost for the practice; uncapped earning potential for them. Use this for a confident, experienced producer who doesn\'t need the security of a base. Where it goes wrong: offering it to someone who isn\'t yet producing consistently enough to carry the uncertainty.',
    guide: [
      {
        heading: 'Why this model works',
        text: 'With no base to fall back on, the incentive is direct and immediate — every visit and every dollar collected translates straight into income, with no ceiling.',
      },
      {
        heading: 'When to use it',
        text: 'Best suited to a confident, experienced producer who doesn\'t need the security of a guaranteed salary, and who can sustain consistent production without the stability a base provides.',
      },
      {
        heading: 'Considerations',
        text: 'This model carries real income volatility for the team member — a slow month means a slow paycheck, with nothing to cushion it. It can also create payroll unpredictability for the practice in the other direction, since there\'s no fixed cost to plan around. Offering this to someone who isn\'t yet producing consistently shifts risk onto them that they may not be ready to carry.',
      },
    ],
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
        hint: 'Enter the monthly take-home this team member is aiming for. The tool will calculate the collections and visits needed to get there, based on the collections % and average collections per visit you\'ve set.',
      },
    ],
  },

  tiered_collections: {
    id: 'tiered_collections',
    name: 'Tiered Collections Bonus',
    description: 'Escalating bonus % as collections hit higher bands.',
    overview:
      'A flat bonus treats every dollar above goal the same way. This model doesn\'t — the rate escalates the further they push past the target. Use it when a strong performer has plateaued on a flat bonus and needs a new reason to push. Review the thresholds annually — what was a stretch target last year may be standard performance this year.',
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
    overview:
      'Fixed dollar amount per visit. No ambiguity, no complexity. Use this for sessional or irregular arrangements where a full employment structure doesn\'t make sense. The limitation: no incentive around billing quality or collections follow-through. If that matters for the role, set that expectation separately and explicitly.',
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
    overview:
      'Hit the number, earn the reward. The clearest incentive structure there is. Use it for defined performance pushes — a new practice building toward a target, or a specific period where you want sharp focus. Build in a stretch milestone from the start. Once the first target is hit, motivation flattens without something else to work toward.',
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
    overview:
      'A standard base + bonus with a gear shift built in. One rate up to a cap, a higher rate beyond it. The base covers security, the first tier rewards consistency, the second tier rewards genuine high performance. Use this when a flat bonus rate no longer feels like enough to retain a strong producer. Set the cap at a real stretch target — not so low it triggers every month, not so high it never does.',
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
    overview:
      'The team member earns a percentage of total practice revenue — not just their own production. Their incentives are fully aligned with yours. Every decision that grows the practice directly affects their income. Reserve this for someone with genuine influence over practice-wide outcomes. Offering it too broadly creates payroll exposure that isn\'t backed by proportional value.',
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
