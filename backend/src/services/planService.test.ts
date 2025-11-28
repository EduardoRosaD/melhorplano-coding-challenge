import {
  calculateAffinityScore,
  getPlansByAffinity,
  UserPreferences,
  PlanWithAffinity,
} from "./planService";
import { Plan } from "../models/plan";

describe("Plan Affinity Service", () => {
  describe("calculateAffinityScore", () => {
    const samplePlan: Plan = {
      id: 1,
      name: "Plano Teste",
      speed: "100Mbps",
      price: 90,
      operator: "Vivo",
      city: "São Paulo",
      dataCap: 500,
    };

    it("deve retornar score 100 quando todas as preferências correspondem perfeitamente", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
        city: "São Paulo",
        maxPrice: 100,
        minDataCap: 500,
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(100);
    });

    it("deve retornar 40 pontos quando apenas a operadora corresponde", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(70); 
    });

    it("deve retornar 30 pontos quando apenas a cidade corresponde", () => {
      const preferences: UserPreferences = {
        city: "São Paulo",
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(60);
    });

    it("deve dar pontuação de preço proporcional", () => {
      const preferences: UserPreferences = {
        maxPrice: 200,
        minDataCap: 500,
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(30);
    });

    it("deve dar pontuação máxima de preço quando o plano é muito barato", () => {
      const cheapPlan: Plan = {
        ...samplePlan,
        price: 10,
      };

      const preferences: UserPreferences = {
        maxPrice: 200,
        minDataCap: 500,
      };

      const score = calculateAffinityScore(cheapPlan, preferences);
      expect(score).toBe(30);
    });

    it("deve considerar case-insensitive para operadora", () => {
      const preferences: UserPreferences = {
        operator: "vivo",
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(70);
    });

    it("deve considerar case-insensitive para cidade", () => {
      const preferences: UserPreferences = {
        city: "são paulo",
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(60);
    });

    it("deve dar pontuação proporcional para franquia acima do mínimo", () => {
      const preferences: UserPreferences = {
        minDataCap: 250, 
        maxPrice: 100, 
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(30);
    });

    it("deve retornar 0 quando nenhuma preferência é fornecida mas todas as condições são atendidas", () => {
      const preferences: UserPreferences = {};

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(30);
    });

    it("deve retornar score correto para plano com operadora e cidade diferentes", () => {
      const preferences: UserPreferences = {
        operator: "Claro",
        city: "Rio de Janeiro",
      };

      const score = calculateAffinityScore(samplePlan, preferences);
      expect(score).toBe(30);
    });
  });

  describe("getPlansByAffinity", () => {
    it("deve retornar todos os planos ordenados por afinidade", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
        city: "São Paulo",
      };

      const result = getPlansByAffinity(preferences, 1, 20);

      expect(result.plans.length).toBe(20);
      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(1);

      for (let i = 0; i < result.plans.length - 1; i++) {
        expect(result.plans[i].affinityScore).toBeGreaterThanOrEqual(
          result.plans[i + 1].affinityScore
        );
      }
    });

    it("deve retornar planos Vivo de São Paulo no topo quando essas são as preferências", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
        city: "São Paulo",
      };

      const result = getPlansByAffinity(preferences, 1, 5);

      expect(result.plans[0].affinityScore).toBeGreaterThanOrEqual(70);
      expect(result.plans[0].operator).toBe("Vivo");
      expect(result.plans[0].city).toBe("São Paulo");
    });

    it("deve paginar corretamente os resultados", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
      };

      const page1 = getPlansByAffinity(preferences, 1, 5);
      const page2 = getPlansByAffinity(preferences, 2, 5);

      expect(page1.plans.length).toBe(5);
      expect(page2.plans.length).toBe(5);
      expect(page1.page).toBe(1);
      expect(page2.page).toBe(2);
      expect(page1.totalPages).toBe(4);
      
      expect(page1.plans[0].id).not.toBe(page2.plans[0].id);
    });

    it("deve calcular totalPages corretamente", () => {
      const preferences: UserPreferences = {};

      const result = getPlansByAffinity(preferences, 1, 7);

      expect(result.total).toBe(20);
      expect(result.totalPages).toBe(3);
    });

    it("deve retornar página vazia quando pageSize excede resultados", () => {
      const preferences: UserPreferences = {};

      const result = getPlansByAffinity(preferences, 5, 10);

      expect(result.plans.length).toBe(0);
      expect(result.page).toBe(5);
    });

    it("deve incluir affinityScore em cada plano retornado", () => {
      const preferences: UserPreferences = {
        operator: "TIM",
        city: "Brasília",
        maxPrice: 300,
        minDataCap: 1000,
      };

      const result = getPlansByAffinity(preferences, 1, 5);

      result.plans.forEach((plan: PlanWithAffinity) => {
        expect(plan).toHaveProperty("affinityScore");
        expect(typeof plan.affinityScore).toBe("number");
        expect(plan.affinityScore).toBeGreaterThanOrEqual(0);
        expect(plan.affinityScore).toBeLessThanOrEqual(100);
      });
    });

    it("deve priorizar operadora sobre cidade no ranking", () => {
      const preferences: UserPreferences = {
        operator: "Vivo",
        city: "Rio de Janeiro",
      };

      const result = getPlansByAffinity(preferences, 1, 10);

      const firstVivoIndex = result.plans.findIndex((p) => p.operator === "Vivo");

      expect(firstVivoIndex).toBe(0);
      expect(result.plans[0].operator).toBe("Vivo");
    });

    it("deve funcionar com preferências vazias", () => {
      const preferences: UserPreferences = {};

      const result = getPlansByAffinity(preferences, 1, 10);

      expect(result.plans.length).toBe(10);
      expect(result.total).toBe(20);
      
      result.plans.forEach((plan: PlanWithAffinity) => {
        expect(plan.affinityScore).toBeGreaterThan(0);
      });
    });

    it("deve dar score máximo para match perfeito", () => {
      const testPlan: Plan = {
        id: 999,
        name: "Plano Match Perfeito",
        speed: "100Mbps",
        price: 50,
        operator: "Vivo",
        city: "São Paulo",
        dataCap: 1000,
      };
      
      const preferences: UserPreferences = {
        operator: "Vivo",
        city: "São Paulo",
        maxPrice: 1000,
        minDataCap: 100, 
      };

      const score = calculateAffinityScore(testPlan, preferences);
      expect(score).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    it("deve lidar com preços muito altos nas preferências", () => {
      const plan: Plan = {
        id: 1,
        name: "Plano Caro",
        speed: "100Mbps",
        price: 500,
        operator: "Vivo",
        city: "São Paulo",
        dataCap: 1000,
      };

      const preferences: UserPreferences = {
        maxPrice: 1000000,
      };

      const score = calculateAffinityScore(plan, preferences);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("deve lidar com franquias muito altas nas preferências", () => {
      const plan: Plan = {
        id: 1,
        name: "Plano Pequeno",
        speed: "100Mbps",
        price: 100,
        operator: "Vivo",
        city: "São Paulo",
        dataCap: 100,
      };

      const preferences: UserPreferences = {
        minDataCap: 10000, 
      };

      const score = calculateAffinityScore(plan, preferences);
      expect(score).toBeGreaterThan(0); 
    });

    it("deve arredondar scores para 2 casas decimais", () => {
      const plan: Plan = {
        id: 1,
        name: "Plano Teste",
        speed: "100Mbps",
        price: 99.99,
        operator: "Vivo",
        city: "São Paulo",
        dataCap: 333,
      };

      const preferences: UserPreferences = {
        maxPrice: 150,
        minDataCap: 200,
      };

      const score = calculateAffinityScore(plan, preferences);
      
      const decimalPlaces = (score.toString().split(".")[1] || "").length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });
  });
});
