import { Plan } from "../models/plan";

export const allPlansMock: Plan[] = [
  {
    id: 1,
    name: "Plano Básico",
    speed: "100Mbps",
    price: 79.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 200,
  },
  {
    id: 2,
    name: "Plano Intermediário",
    speed: "300Mbps",
    price: 99.9,
    operator: "Claro",
    city: "Rio de Janeiro",
    dataCap: 400,
  },
  {
    id: 3,
    name: "Plano Premium",
    speed: "600Mbps",
    price: 149.9,
    operator: "TIM",
    city: "Belo Horizonte",
    dataCap: 800,
  },
  {
    id: 4,
    name: "Plano Família",
    speed: "500Mbps",
    price: 129.9,
    operator: "Vivo",
    city: "Curitiba",
    dataCap: 600,
  },
  {
    id: 5,
    name: "Plano Ultra",
    speed: "1Gbps",
    price: 199.9,
    operator: "Claro",
    city: "São Paulo",
    dataCap: 1000,
  },
  {
    id: 6,
    name: "Plano Econômico",
    speed: "50Mbps",
    price: 59.9,
    operator: "Oi",
    city: "Recife",
    dataCap: 100,
  },
  {
    id: 7,
    name: "Plano Regional",
    speed: "200Mbps",
    price: 89.9,
    operator: "TIM",
    city: "Porto Alegre",
    dataCap: 300,
  },
  {
    id: 8,
    name: "Plano Flex",
    speed: "400Mbps",
    price: 109.9,
    operator: "Vivo",
    city: "Salvador",
    dataCap: 500,
  },
  {
    id: 9,
    name: "Plano Jovem",
    speed: "150Mbps",
    price: 69.9,
    operator: "Claro",
    city: "Fortaleza",
    dataCap: 250,
  },
  {
    id: 10,
    name: "Plano Top",
    speed: "2Gbps",
    price: 299.9,
    operator: "TIM",
    city: "Brasília",
    dataCap: 2000,
  },
  {
    id: 11,
    name: "Vivo Turbo",
    speed: "250Mbps",
    price: 109.9,
    operator: "Vivo",
    city: "Campinas",
    dataCap: 350,
  },
  {
    id: 12,
    name: "Vivo Max",
    speed: "800Mbps",
    price: 179.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 1200,
  },
  {
    id: 13,
    name: "Vivo Light",
    speed: "70Mbps",
    price: 64.9,
    operator: "Vivo",
    city: "Ribeirão Preto",
    dataCap: 150,
  },
  {
    id: 14,
    name: "Vivo Família Plus",
    speed: "600Mbps",
    price: 139.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 900,
  },
  {
    id: 15,
    name: "Vivo Ultra HD",
    speed: "1.5Gbps",
    price: 249.9,
    operator: "Vivo",
    city: "Sorocaba",
    dataCap: 1800,
  },
  {
    id: 16,
    name: "Vivo Conecta+",
    speed: "120Mbps",
    price: 89.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 220,
  },
  {
    id: 17,
    name: "Vivo Família 400",
    speed: "400Mbps",
    price: 129.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 700,
  },
  {
    id: 18,
    name: "Vivo Ultra 2Gbps",
    speed: "2Gbps",
    price: 299.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 2200,
  },
  {
    id: 19,
    name: "Vivo Light 60",
    speed: "60Mbps",
    price: 59.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 120,
  },
  {
    id: 20,
    name: "Vivo Max 900",
    speed: "900Mbps",
    price: 189.9,
    operator: "Vivo",
    city: "São Paulo",
    dataCap: 1400,
  },
];

export function getPlans(): Plan[] {
  return allPlansMock;
}

export function getAllPlans(): Plan[] {
  return allPlansMock;
}

function filterByMinSpeed(plans: Plan[], minSpeed?: number): Plan[] {
  if (!minSpeed) {
    return plans;
  }
  return plans.filter((plan) => {
    const speedValue = parseInt(plan.speed.replace("Mbps", ""));
    return speedValue >= minSpeed;
  });
}

function filterByMaxPrice(plans: Plan[], maxPrice?: number): Plan[] {
  if (!maxPrice) {
    return plans;
  }
  return plans.filter((plan) => plan.price <= maxPrice);
}

function clonePlansUnder100(plans: Plan[]): Plan[] {
  return plans.map((plan) => {
    if (plan.price < 100) {
      return { ...plan };
    }
    return plan;
  });
}

export function handlePlan(
  plans: Plan[],
  minSpeed?: number,
  maxPrice?: number
): Plan[] {
  let filtered = filterByMinSpeed(plans, minSpeed);
  filtered = filterByMaxPrice(filtered, maxPrice);
  return clonePlansUnder100(filtered);
}

export interface PlanSearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minDataCap?: number;
  maxDataCap?: number;
  operator?: string;
  city?: string;
  name?: string;
}

export interface PaginatedPlans {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

let filteredPlansCache: Plan[] | null = null;
let lastFiltersCache: string | null = null;

export function searchPlans(
  filters: PlanSearchFilters,
  page: number = 1,
  pageSize: number = 5
): PaginatedPlans {
  const filtersKey = JSON.stringify(filters);

  if (lastFiltersCache !== filtersKey) {
    let filtered = allPlansMock;
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((plan) => plan.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((plan) => plan.price <= filters.maxPrice!);
    }
    if (filters.minDataCap !== undefined) {
      filtered = filtered.filter((plan) => plan.dataCap >= filters.minDataCap!);
    }
    if (filters.maxDataCap !== undefined) {
      filtered = filtered.filter((plan) => plan.dataCap <= filters.maxDataCap!);
    }
    if (filters.operator) {
      filtered = filtered.filter(
        (plan) =>
          plan.operator.toLowerCase() === filters.operator!.toLowerCase()
      );
    }
    if (filters.city) {
      filtered = filtered.filter(
        (plan) => plan.city.toLowerCase() === filters.city!.toLowerCase()
      );
    }
    if (filters.name) {
      filtered = filtered.filter((plan) =>
        plan.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }
    filteredPlansCache = filtered;
    lastFiltersCache = filtersKey;
  }

  if (filteredPlansCache) {
    if (page % 2 === 0) {
      filteredPlansCache.sort((a, b) => b.price - a.price);
    } else {
      filteredPlansCache.sort((a, b) => a.price - b.price);
    }
  }

  const total = filteredPlansCache ? filteredPlansCache.length : 0;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const plans = filteredPlansCache ? filteredPlansCache.slice(start, end) : [];

  return {
    plans,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export interface UserPreferences {
  operator?: string;
  city?: string;
  maxPrice?: number;
  minDataCap?: number;
}

export interface PlanWithAffinity extends Plan {
  affinityScore: number;
}

export function calculateAffinityScore(
  plan: Plan,
  preferences: UserPreferences
): number {
  let score = 0;

  if (preferences.operator && plan.operator.toLowerCase() === preferences.operator.toLowerCase()) {
    score += 40;
  }

  if (preferences.city && plan.city.toLowerCase() === preferences.city.toLowerCase()) {
    score += 30;
  }

  if (preferences.maxPrice !== undefined) {
    if (plan.price <= preferences.maxPrice) {
      score += 20;
    }
  } else {
    score += 20;
  }

  if (preferences.minDataCap !== undefined) {
    if (plan.dataCap >= preferences.minDataCap) {
      score += 10;
    }
  } else {
    score += 10;
  }

  return Math.round(score * 100) / 100;
}


export function getPlansByAffinity(
  preferences: UserPreferences,
  page: number = 1,
  pageSize: number = 10
): PaginatedPlans & { plans: PlanWithAffinity[] } {
  const plansWithAffinity: PlanWithAffinity[] = allPlansMock.map((plan) => ({
    ...plan,
    affinityScore: calculateAffinityScore(plan, preferences),
  }));

  plansWithAffinity.sort((a, b) => b.affinityScore - a.affinityScore);

  const total = plansWithAffinity.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const plans = plansWithAffinity.slice(start, end);

  return {
    plans,
    total,
    page,
    pageSize,
    totalPages,
  };
}
