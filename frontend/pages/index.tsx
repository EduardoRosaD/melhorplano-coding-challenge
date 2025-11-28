import { useEffect, useState } from "react";
import api, { fetchFilteredPlans, PlanSearchParams, fetchPlansByAffinity, AffinitySearchParams } from "../services/api";
import PlanCard from "../components/PlanCard";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import styles from "../styles/Home.module.scss";

interface Plan {
  id: number;
  name: string;
  speed: string;
  price: number;
  operator: string;
  city: string;
  dataCap: number;
  benefits?: string[];
  affinityScore?: number;
}

interface PaginatedPlans {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const OPERATORS = ["Vivo", "Claro", "TIM", "Oi"];
const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Recife",
  "Porto Alegre",
  "Salvador",
  "Fortaleza",
  "Brasília",
];

export default function Home() {
  const [searchType, setSearchType] = useState<"exact" | "affinity">("exact");
  const [filters, setFilters] = useState<PlanSearchParams>({
    page: 1,
    pageSize: 5,
  });
  const [affinityFilters, setAffinityFilters] = useState<AffinitySearchParams>({
    page: 1,
    pageSize: 10,
  });
  const [result, setResult] = useState<PaginatedPlans | null>(null);
  const [loading, setLoading] = useState(false);
  const [planNames, setPlanNames] = useState<string[]>([]);

  useEffect(() => {
    setLoading(true);
    if (searchType === "exact") {
      fetchFilteredPlans(filters)
        .then(setResult)
        .finally(() => setLoading(false));
    } else {
      fetchPlansByAffinity(affinityFilters)
        .then(setResult)
        .finally(() => setLoading(false));
    }
  }, [filters, affinityFilters, searchType]);

  useEffect(() => {
    // Buscar nomes dos planos ao montar
    api
      .get("/plans/search", { params: { page: 1, pageSize: 1000 } })
      .then((res) => {
        const names = res.data.plans.map((p: any) => p.name);
        setPlanNames(Array.from(new Set(names)));
      });
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    if (searchType === "exact") {
      setFilters((prev) => ({
        ...prev,
        [name]: value ? value : undefined,
        page: 1,
      }));
    } else {
      setAffinityFilters((prev) => ({
        ...prev,
        [name]: value ? (name === 'maxPrice' || name === 'minDataCap' ? Number(value) : value) : undefined,
        page: 1,
      }));
    }
  }

  function handlePageChange(newPage: number) {
    if (searchType === "exact") {
      setFilters((prev) => ({ ...prev, page: newPage }));
    } else {
      setAffinityFilters((prev) => ({ ...prev, page: newPage }));
    }
  }

  function handleSearchTypeChange(type: "exact" | "affinity") {
    setSearchType(type);
    if (type === "exact") {
      setFilters({ page: 1, pageSize: 5 });
    } else {
      setAffinityFilters({ page: 1, pageSize: 10 });
    }
  }

  return (
    <>
      <Menu />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Sidebar de Filtros */}
        <aside
          style={{
            width: 300,
            minHeight: 500,
            background: "#f7fafc",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: 32,
            marginRight: 32,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          {/* Seletores de Tipo de Busca */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              onClick={() => handleSearchTypeChange("exact")}
              style={{
                aspectRatio: "1",
                width: 100,
                height: 100,
                padding: 12,
                borderRadius: 12,
                border: searchType === "exact" ? "3px solid #009688" : "2px solid #b2dfdb",
                background: searchType === "exact" ? "#e0f2f1" : "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              title="Busca Exata"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke={searchType === "exact" ? "#009688" : "#00897b"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#00897b", textAlign: "center" }}>
                Busca Exata
              </span>
            </button>
            <button
              onClick={() => handleSearchTypeChange("affinity")}
              style={{
                aspectRatio: "1",
                width: 100,
                height: 100,
                padding: 12,
                borderRadius: 12,
                border: searchType === "affinity" ? "3px solid #009688" : "2px solid #b2dfdb",
                background: searchType === "affinity" ? "#e0f2f1" : "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
              title="Busca por Afinidade"
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill={searchType === "affinity" ? "#009688" : "none"}
                stroke={searchType === "affinity" ? "#009688" : "#00897b"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#00897b", textAlign: "center" }}>
                Por Afinidade
              </span>
            </button>
          </div>

          <h2
            style={{
              color: "#00897b",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            {searchType === "exact" ? "Filtrar planos" : "Preferências"}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {searchType === "exact" && (
              <>
                <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
                  Nome do plano
                </label>
                <select
                  name="name"
                  onChange={handleChange}
                  defaultValue=""
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1.5px solid #b2dfdb",
                    background: "#fff",
                    fontSize: 15,
                  }}
                >
                  <option value="">Selecione</option>
                  {planNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </>
            )}
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Operadora
            </label>
            <select
              name="operator"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Cidade
            </label>
            <select
              name="city"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              {searchType === "exact" ? "Preço" : "Preço Máximo"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {searchType === "exact" && (
                <input
                  type="number"
                  name="minPrice"
                  placeholder="Mín."
                  onChange={handleChange}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "2px solid #009688",
                    background: "#fff",
                    fontSize: 16,
                    width: 110,
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                />
              )}
              <input
                type="number"
                name="maxPrice"
                placeholder={searchType === "exact" ? "Máx." : "R$ Máximo"}
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: searchType === "exact" ? 110 : "100%",
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              {searchType === "exact" && (
                <button
                  type="button"
                  style={{
                    background: "#009688",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    marginLeft: 4,
                  }}
                  title="Buscar por preço"
                  tabIndex={-1}
                  disabled
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" stroke="#fff" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                  </svg>
                </button>
              )}
            </div>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              {searchType === "exact" ? "Franquia (GB)" : "Franquia Mínima (GB)"}
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {searchType === "exact" && (
                <input
                  type="number"
                  name="minDataCap"
                  placeholder="Mín."
                  onChange={handleChange}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "2px solid #009688",
                    background: "#fff",
                    fontSize: 16,
                    width: 110,
                    outline: "none",
                    transition: "border 0.2s",
                  }}
                />
              )}
              <input
                type="number"
                name={searchType === "exact" ? "maxDataCap" : "minDataCap"}
                placeholder={searchType === "exact" ? "Máx." : "GB Mínimo"}
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: searchType === "exact" ? 110 : "100%",
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              {searchType === "exact" && (
                <button
                  type="button"
                  style={{
                    background: "#009688",
                    border: "none",
                    borderRadius: "50%",
                    width: 36,
                    height: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    marginLeft: 4,
                  }}
                  title="Buscar por franquia"
                  tabIndex={-1}
                  disabled
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" stroke="#fff" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </aside>
        {/* Conteúdo principal */}
        <div className={styles.container} style={{ flex: 1 }}>
          <h1 className={styles.titulo}>
            {searchType === "exact" ? "Buscar ofertas de planos" : "Planos por Afinidade"}
          </h1>
          <p className={styles.subtitulo}>
            {searchType === "exact"
              ? "Filtre por preço, franquia, operadora, cidade, nome e navegue pelos resultados!"
              : "Veja os planos ordenados por afinidade com suas preferências!"}
          </p>
          {/* Resultados */}
          {loading ? (
            <div style={{ textAlign: "center", margin: 32 }}>Carregando...</div>
          ) : result && result.plans.length > 0 ? (
            <>
              <section className={styles.planos}>
                {result.plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </section>
              {/* Paginação */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: 24,
                }}
              >
                <button
                  onClick={() => handlePageChange(result.page - 1)}
                  disabled={result.page === 1}
                  style={{
                    marginRight: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: result.page === 1 ? "#eee" : "#fff",
                    cursor: result.page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>
                <span style={{ alignSelf: "center", fontWeight: 500 }}>
                  Página {result.page} de {result.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(result.page + 1)}
                  disabled={result.page === result.totalPages}
                  style={{
                    marginLeft: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background:
                      result.page === result.totalPages ? "#eee" : "#fff",
                    cursor:
                      result.page === result.totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", margin: 32 }}>
              Nenhum plano encontrado.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
