import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  canBuy,
  canDonate,
  dateLabel,
  daysLeft,
  emptyData,
  finalUnitPrice,
  hydrate,
  money,
  normalizeUser,
  roles,
  today,
} from "./services/domain.js";
import { createDemo, demoTransaction } from "./services/demo.js";
import {
  Brand,
  Empty,
  Field,
  HeroArt,
  Icon,
  Metric,
  Modal,
  ProductArt,
  ProductCard,
  Status,
} from "./components/UI.jsx";
import {
  api,
  login,
  payloads,
  setAccessToken,
  cadastrarUsuario,
  listarFarmaciasPendentes,
  aprovarFarmacia,
  listarOngsPendentes,
  aprovarOng,
} from "./services/api.js";


function Login({ onLogin, onDemo }) {
  const [role, setRole] = useState("FARMACIA");
  const [show, setShow] = useState(false),
    [register, setRegister] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    const f = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (register) {
        await cadastrarUsuario(payloads.usuario(f));;
        setRegister(false);
        setSuccess(
          "Cadastro enviado. Farmácias e ONGs podem depender de aprovação para operar.",
        );
      } else onLogin(await login(f.email, f.senha));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-layout">
      <aside className="login-story">
        <Brand light />
        <div className="story-copy">
          <h1>
            Menos desperdício. <span>Mais acesso à saúde.</span>
          </h1>
          <p>
            O MedShare conecta farmácias, clientes e ONGs para redistribuir
            medicamentos próximos ao vencimento com desconto ou por doação.
          </p>
        </div>
        <HeroArt />
        <small className="login-footer">
          © {new Date().getFullYear()} MedShare.
        </small>
      </aside>
      <main className="login-main">
        <div className="login-form">
          <h2>{register ? "Faça parte do MedShare" : "Seja bem-vindo"}</h2>
          <p className="muted">
            {register
              ? "Conecte sua comunidade a uma saúde mais acessível."
              : "Entre para acessar sua conta no MedShare."}
          </p>
          <form onSubmit={submit} key={String(register)}>
            {register && (
              <>
                <Field label="Nome">
                  <input
                    name="nome"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </Field>
                <Field label="Perfil">
                  <select
                    name="tipo"
                    value={role === "ADMIN" ? "CLIENTE" : role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {Object.entries(roles)
                      .filter(([k]) => k !== "ADMIN")
                      .map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                  </select>
                </Field>
              </>
            )}
            <Field label="E-mail">
              <input
                name="email"
                type="email"
                placeholder="farmacia@saopaulo.com.br"
                required
                maxLength={100}
                autoComplete="email"
              />
            </Field>
            <Field label="Senha">
              <span className="password-input">
                <input
                  name="senha"
                  type={show ? "text" : "password"}
                  placeholder="••••••••••"
                  required
                  autoComplete={register ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  <Icon name="eye" size={17} />
                </button>
              </span>
            </Field>
            {register && (
              <>
                <Field
                  label={
                    role === "CLIENTE"
                      ? "CPF (apenas números)"
                      : "CNPJ (apenas números)"
                  }
                >
                  <input
                    name="documento"
                    required
                    inputMode="numeric"
                    pattern={role === "CLIENTE" ? "[0-9]{11}" : "[0-9]{14}"}
                    maxLength={role === "CLIENTE" ? 11 : 14}
                  />
                </Field>
                {role === "ONG" ? (
                  <Field label="Área de atuação">
                    <input name="areaAtuacao" required maxLength={100} />
                  </Field>
                ) : (
                  <Field label="Endereço">
                    <input name="endereco" required maxLength={150} />
                  </Field>
                )}
              </>
            )}
            {error && (
              <div className="notice error" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="notice success" role="status">
                {success}
              </div>
            )}
            <button className="button full" disabled={busy}>
              {busy
                ? "Aguarde…"
                : register
                  ? "Criar conta"
                  : "Entrar no MedShare"}
            </button>
          </form>
          <button
            className="text-button register-link"
            onClick={() => {
              setRegister(!register);
              if (role === "ADMIN") setRole("CLIENTE");
              setError("");
              setSuccess("");
            }}
          >
            {register
              ? "Já tenho uma conta. Voltar ao login"
              : "Não tem uma conta? Cadastre sua organização"}
          </button>
          <div className="profile-demo">
            <span className="eyebrow">EXPLORAR DEMONSTRAÇÃO COMO</span>
            <div className="role-options">
              {Object.entries(roles).map(([key, label]) => (
                <button
                  type="button"
                  className={role === key ? "selected" : ""}
                  key={key}
                  onClick={() => setRole(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="button outline full"
              onClick={() => onDemo(role)}
            >
              Abrir demonstração <Icon name="arrow" size={16} />
            </button>
            <p className="demo-help">
              Dados fictícios. Nenhuma operação é enviada à API.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function App({
  usuarioInicial = null,
  tokenInicial = null,
} = {}) {
  const [user, setUser] = useState(() =>
      usuarioInicial ? normalizeUser(usuarioInicial) : null,
    ),
    [demo, setDemo] = useState(false),
    [data, setData] = useState(emptyData),
    [loading, setLoading] = useState(false),
    [errors, setErrors] = useState([]),
    [page, setPage] = useState("home"),
    [search, setSearch] = useState(""),
    [modal, setModal] = useState(null),
    [busy, setBusy] = useState(false),
    [actionError, setActionError] = useState(""),
    [toast, setToast] = useState("");
  const [selected, setSelected] = useState(null);
  const actionLock = useRef(false),
    generation = useRef(0);
  useEffect(() => {
    setAccessToken(tokenInicial);
  }, [tokenInicial]);
  const reload = useCallback(async () => {
    if (!user || demo) return;
    const version = ++generation.current;
    setLoading(true);
    setErrors([]);
    const keys = {
      ADMIN: ["usuarios", "medicamentos", "lotes", "vendas", "doacoes"],
      FARMACIA: ["medicamentos", "lotes"],
      CLIENTE: ["medicamentos", "lotes", "vendas"],
      ONG: ["medicamentos", "lotes", "doacoes"],
    }[user.tipo];
    const results = await Promise.allSettled(
      keys.map((key) => api[key].list()),
    );
    if (version !== generation.current) return;
    const raw = emptyData(),
      problems = [];
    results.forEach((result, i) => {
      if (result.status === "fulfilled") raw[keys[i]] = result.value;
      else problems.push(`${keys[i]}: ${result.reason.message}`);
    });
    if (user.tipo !== "ADMIN") raw.usuarios = [user];
    setData(hydrate(raw));
    setErrors(problems);
    setLoading(false);
  }, [user, demo]);
  useEffect(() => {
    reload();
    return () => {
      generation.current++;
    };
  }, [reload]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  function enter(u, isDemo = false) {
    setData(isDemo ? createDemo() : emptyData());
    setDemo(isDemo);
    setUser(u);
    setPage("home");
    setSearch("");
    setSelected(null);
    setErrors([]);
  }
  function enterDemo(role) {
    const d = createDemo();
    enter(
      d.usuarios.find((u) => u.tipo === role),
      true,
    );
  }
  function logout() {
    generation.current++;
    setAccessToken(null);
    setUser(null);
    setModal(null);
    setSelected(null);
    setData(emptyData());
    setLoading(false);
    setToast("");
  }
  function open(m) {
    setActionError("");
    setModal(m);
  }
  async function mutate(action, success) {
    if (actionLock.current) return;
    actionLock.current = true;
    setBusy(true);
    setActionError("");
    try {
      await action();
      setModal(null);
      setToast(success);
      if (!demo) await reload();
    } catch (err) {
      setActionError(err.message);
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }
  if (!user) return <Login onLogin={(u) => enter(u)} onDemo={enterDemo} />;
  const lotById = (id) => data.lotes.find((l) => l.id === String(id));
  const ownLots = data.lotes.filter((l) => l.idFarmacia === user.id);
  const donationLots = data.lotes.filter(canDonate);
  const ownDonations = data.doacoes.filter((d) => d.idOng === user.id);
  const ownSales = data.vendas.filter((v) => v.idCliente === user.id);
  const purchaseLot = selected ? lotById(selected.id) : null;
  const confirmLot = modal?.lot ? lotById(modal.lot.id) : null;
  function transact(e) {
    e.preventDefault();
    const quantity = Number(new FormData(e.currentTarget).get("quantidade"));
    const lot = confirmLot;
    const kind = modal.type === "buy" ? "venda" : "doacao";
    if (
      !lot ||
      !(kind === "venda" ? canBuy(lot) : canDonate(lot)) ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > lot.quantidade
    ) {
      setActionError(
        "O lote ou a quantidade não está disponível. Atualize os dados.",
      );
      return;
    }
    mutate(
      async () => {
        if (demo)
          setData((previous) =>
            demoTransaction(previous, kind, lot, user, quantity),
          );
        else if (kind === "venda")
          await api.vendas.create(payloads.venda(lot, user, quantity));
        else await api.doacoes.create(payloads.doacao(lot, user, quantity));
      },
      kind === "venda"
        ? "Compra registrada com sucesso."
        : "Lote reservado para sua organização. Combine a retirada com a farmácia.",
    );
  }
  function saveLot(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    f.idFarmacia = user.id;
    mutate(async () => {
      const body = payloads.lote(f);
      if (demo) {
        const id = String(Date.now());
        setData((prev) =>
          hydrate({ ...prev, lotes: [...prev.lotes, { ...body, id }] }),
        );
      } else await api.lotes.create(body);
    }, "Lote cadastrado. A classificação será determinada pelo backend.");
  }
  function saveMedication(e) {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget));
    mutate(async () => {
      const body = { ...f, tipoTarja: "LIVRE" };
      if (demo)
        setData((prev) => ({
          ...prev,
          medicamentos: [
            ...prev.medicamentos,
            { ...body, id: String(Date.now()) },
          ],
        }));
      else await api.medicamentos.create(body);
    }, "Medicamento cadastrado.");
  }
  return (
    <>
      <header className="topbar">
        <button
          className="brand-button"
          onClick={() => {
            setPage("home");
            setSelected(null);
          }}
          aria-label="Página inicial"
        >
          <Brand />
          {user.tipo !== "CLIENTE" && (
            <span className="profile-tag">
              {user.tipo === "FARMACIA" ? "FARMÁCIA" : user.tipo}
            </span>
          )}
        </button>
        {user.tipo === "CLIENTE" && page === "home" && !purchaseLot && (
          <label className="search-box">
            <Icon name="search" size={17} />
            <input
              aria-label="Buscar medicamento"
              placeholder="Buscar medicamento…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        )}
        <nav className="top-nav" aria-label="Navegação principal">
          {user.tipo === "CLIENTE" ? (
            <>
              <button
                className={page === "home" ? "active" : ""}
                onClick={() => {
                  setPage("home");
                  setSelected(null);
                }}
              >
                Comprar
              </button>
              <button
                className={page === "history" ? "active" : ""}
                onClick={() => setPage("history")}
              >
                Minhas compras
              </button>
            </>
          ) : user.tipo === "ONG" ? (
            <>
              <button
                className={page === "home" ? "active" : ""}
                onClick={() => setPage("home")}
              >
                Doações
              </button>
              <button
                className={page === "history" ? "active" : ""}
                onClick={() => setPage("history")}
              >
                Meus resgates
              </button>
            </>
          ) : (
            <span className="user-name">{user.nome}</span>
          )}
          <span className="avatar" title={user.nome}>
            {user.nome.slice(0, 1)}
          </span>
          <button
            className="icon-button"
            aria-label="Sair"
            title="Sair"
            onClick={logout}
          >
            <Icon name="logout" size={18} />
          </button>
        </nav>
      </header>
      {demo && (
        <div className="demo-banner">
          <span>
            <strong>Modo demonstração</strong> · Dados fictícios, salvos apenas
            enquanto esta tela estiver aberta.
          </span>
          <label>
            Ver como{" "}
            <select
              aria-label="Perfil da demonstração"
              value={user.tipo}
              onChange={(e) => {
                setUser(data.usuarios.find((u) => u.tipo === e.target.value));
                setPage("home");
                setSelected(null);
                setSearch("");
                setModal(null);
              }}
            >
              {Object.entries(roles).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      <main
        className={`workspace ${user.tipo === "CLIENTE" ? "market-workspace" : ""}`}
      >
        <div className="connection-row">
          <span className="workspace-location">
            MedShare <span aria-hidden="true">/</span> {roles[user.tipo]}
          </span>
          {!demo && (
            <button
              className="text-button refresh"
              disabled={loading}
              onClick={reload}
            >
              <Icon name="refresh" size={15} />
              {loading ? "Atualizando…" : "Atualizar dados"}
            </button>
          )}
        </div>
        {errors.length > 0 && (
          <div className="notice error" role="alert">
            <strong>Não foi possível carregar todos os dados.</strong>
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
            <span>
              Os números abaixo consideram somente as respostas recebidas.
            </span>
          </div>
        )}
        {loading ? (
          <div className="loading" role="status">
            <span className="spinner" />
            Carregando dados da API…
          </div>
        ) : (
          <>
            {user.tipo === "FARMACIA" && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>Dashboard Farmácia</h1>
                    <p>Acompanhe e destine os lotes próximos ao vencimento.</p>
                  </div>
                  <div className="heading-actions">
                    <button
                      className="button outline"
                      onClick={() => open({ type: "medication" })}
                    >
                      Cadastrar medicamento
                    </button>
                    <button
                      className="button"
                      onClick={() => open({ type: "lot" })}
                    >
                      <Icon name="plus" size={16} />
                      Cadastrar Novo Lote
                    </button>
                  </div>
                </div>
                <div className="metrics four">
                  <Metric label="Total de Lotes" value={ownLots.length} />
                  <Metric
                    label="Em Desconto"
                    value={`${ownLots.filter((l) => l.status === "DESCONTO").length} Lotes`}
                    color="red"
                  />
                  <Metric
                    label="Para Doação"
                    value={`${ownLots.filter((l) => l.status === "DISPONIVEL_DOACAO").length} Lotes`}
                    color="blue"
                  />
                  <Metric
                    label="Vencidos / Descarte"
                    value={`${ownLots.filter((l) => ["VENCIDO", "DESCARTE"].includes(l.status)).length} Lotes`}
                    color="gray"
                  />
                </div>
                <section aria-label="Estoque da farmácia">
                  <div className="section-heading inventory-heading">
                    <h2>Estoque de medicamentos</h2>
                  </div>
                  <LotTable lots={ownLots} />
                </section>
              </>
            )}
            {user.tipo === "ADMIN" && <Admin data={data} />}
            {user.tipo === "ONG" && page === "home" && (
              <>
                <section className="welcome-banner">
                  <div>
                    <h1>Olá, {user.nome}</h1>
                    <p>
                      Apoie sua comunidade resgatando lotes de medicamentos de
                      forma gratuita. Os itens abaixo estão disponíveis para
                      doação pelas farmácias parceiras.
                    </p>
                  </div>
                  <span>
                    <Icon name="heart" size={29} />
                  </span>
                </section>
                <div className="metrics three">
                  <Metric
                    label="Lotes disponíveis para ONG"
                    value={`${donationLots.length} Lotes`}
                    color="blue"
                  />
                  <Metric
                    label="Meus lotes reservados"
                    value={ownDonations.filter((d) => !d.dataRetirada).length}
                  />
                  <Metric
                    label="Total de unidades recebidas"
                    value={ownDonations
                      .filter((d) => d.dataRetirada)
                      .reduce((n, d) => n + d.quantidade, 0)}
                  />
                </div>
                <div className="section-heading">
                  <h2>Doações disponíveis próximas ao vencimento</h2>
                  <p>
                    Clique em Reivindicar para reservar o lote e combinar a
                    retirada física.
                  </p>
                </div>
                <div className="product-grid donation-grid">
                  {donationLots.map((lot) => (
                    <ProductCard
                      key={lot.id}
                      lot={lot}
                      donation
                      onClick={() => open({ type: "donate", lot })}
                    />
                  ))}
                </div>
                {!donationLots.length && (
                  <Empty title="Nenhuma doação disponível" />
                )}
              </>
            )}
            {user.tipo === "CLIENTE" &&
              page === "home" &&
              (purchaseLot ? (
                <ProductDetail
                  lot={purchaseLot}
                  onBack={() => setSelected(null)}
                  onBuy={() => open({ type: "buy", lot: purchaseLot })}
                />
              ) : (
                <Marketplace
                  lots={data.lotes.filter(canBuy)}
                  search={search}
                  onSelect={setSelected}
                />
              ))}
            {page === "history" && ["CLIENTE", "ONG"].includes(user.tipo) && (
              <>
                <div className="page-heading">
                  <div>
                    <h1>
                      {user.tipo === "ONG" ? "Meus resgates" : "Minhas compras"}
                    </h1>
                    <p>Acompanhe as operações registradas para sua conta.</p>
                  </div>
                </div>
                <History
                  transactions={user.tipo === "ONG" ? ownDonations : ownSales}
                  lots={data.lotes}
                  donation={user.tipo === "ONG"}
                />
              </>
            )}
          </>
        )}
      </main>
      <footer className="app-footer">
        <Brand />
        <span>Menos desperdício. Mais acesso à saúde.</span>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
          <button
            className="icon-button"
            aria-label="Fechar aviso"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      )}
      {modal && (
        <Modal
          title={
            {
              buy: "Confirmar Compra",
              donate: "Confirmar Reivindicação",
              lot: "Cadastrar novo lote",
              medication: "Cadastrar medicamento",
            }[modal.type]
          }
          subtitle={
            modal.type === "buy"
              ? "Confira seu pedido antes de confirmar."
              : modal.type === "donate"
                ? "Ao confirmar, o lote será reservado para sua organização."
                : "Preencha os dados para registrar na plataforma."
          }
          busy={busy}
          onClose={() => {
            if (!busy) setModal(null);
          }}
          icon={["lot", "medication"].includes(modal.type) ? "plus" : "check"}
        >
          {["buy", "donate"].includes(modal.type) && confirmLot && (
            <TransactionForm
              lot={confirmLot}
              donation={modal.type === "donate"}
              busy={busy}
              error={actionError}
              onSubmit={transact}
              onClose={() => setModal(null)}
            />
          )}
          {modal.type === "lot" && (
            <form onSubmit={saveLot}>
              <Field label="Medicamento">
                <select name="idMedicamento" required defaultValue="">
                  <option value="" disabled>
                    Selecione o medicamento
                  </option>
                  {data.medicamentos.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome}
                    </option>
                  ))}
                </select>
              </Field>
              {!data.medicamentos.length && (
                <p className="muted">Cadastre um medicamento primeiro.</p>
              )}
              <div className="form-grid">
                <Field label="Quantidade">
                  <input
                    name="quantidade"
                    type="number"
                    min="1"
                    max="2147483647"
                    step="1"
                    required
                  />
                </Field>
                <Field label="Validade">
                  <input
                    name="dataValidade"
                    type="date"
                    min={today()}
                    required
                  />
                </Field>
              </div>
              <Field label="Preço original por unidade (R$)">
                <input
                  name="precoOriginal"
                  type="number"
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  required
                />
              </Field>
              <p className="form-note">
                O status e o desconto devem ser calculados pelo motor de decisão
                do backend.
              </p>
              <FormActions
                busy={busy}
                error={actionError}
                label="Cadastrar lote"
                onClose={() => setModal(null)}
                disabled={!data.medicamentos.length}
              />
            </form>
          )}
          {modal.type === "medication" && (
            <form onSubmit={saveMedication}>
              <Field label="Nome">
                <input name="nome" maxLength={70} required />
              </Field>
              <Field label="Princípio ativo">
                <input name="principioAtivo" maxLength={150} required />
              </Field>
              <Field label="Categoria">
                <input name="categoria" maxLength={100} required />
              </Field>
              <p className="form-note">
                Este MVP aceita apenas medicamentos com tipo de tarja LIVRE,
                conforme seu modelo de dados.
              </p>
              <FormActions
                busy={busy}
                error={actionError}
                label="Cadastrar medicamento"
                onClose={() => setModal(null)}
              />
            </form>
          )}
        </Modal>
      )}
    </>
  );
}

function FormActions({ busy, error, label, onClose, disabled = false }) {
  return (
    <>
      {error && (
        <div className="notice error" role="alert">
          {error}
        </div>
      )}
      <div className="modal-actions">
        <button className="button full" disabled={busy || disabled}>
          {busy ? "Enviando…" : label}
        </button>
        <button
          type="button"
          className="button outline full"
          disabled={busy}
          onClick={onClose}
        >
          Cancelar e Voltar
        </button>
      </div>
    </>
  );
}
function TransactionForm({ lot, donation, busy, error, onSubmit, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const valid =
    Number.isInteger(quantity) && quantity >= 1 && quantity <= lot.quantidade;
  return (
    <form onSubmit={onSubmit}>
      <div className="order-summary">
        <span className="eyebrow">
          {donation ? "RESUMO DO RESGATE" : "RESUMO DO PEDIDO"}
        </span>
        <dl>
          <div>
            <dt>Medicamento</dt>
            <dd>{lot.medicamento.nome}</dd>
          </div>
          <div>
            <dt>Lote / disponível</dt>
            <dd>
              #{lot.id} · {lot.quantidade} un.
            </dd>
          </div>
          <div>
            <dt>Farmácia parceira</dt>
            <dd>
              {lot.farmacia.nome ||
                lot.farmacia.usuario?.nome ||
                `Farmácia #${lot.idFarmacia}`}
            </dd>
          </div>
        </dl>
        <Field
          label={donation ? "Quantidade a reservar" : "Quantidade comprada"}
        >
          <input
            name="quantidade"
            type="number"
            min="1"
            max={lot.quantidade}
            step="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
          />
        </Field>
        <div className="order-total">
          <strong>
            {donation ? "Custo de aquisição" : "Total estimado a pagar"}
          </strong>
          <div>
            {!donation && valid && (
              <del>{money(lot.precoOriginal * quantity)}</del>
            )}
            <strong>
              {donation
                ? "Gratuito (Doação Social)"
                : valid
                  ? money(finalUnitPrice(lot) * quantity)
                  : "—"}
            </strong>
          </div>
        </div>
        <p className="form-note">
          {donation
            ? "A confirmação reserva as unidades. A retirada será combinada com a farmácia."
            : "O valor final e o estoque serão validados pela API. Este formulário registra a venda; não processa pagamento."}
        </p>
      </div>
      <FormActions
        busy={busy}
        error={error}
        label={
          donation ? "Confirmar e Reservar" : "Confirmar Compra Consciente"
        }
        onClose={onClose}
        disabled={!valid}
      />
    </form>
  );
}
function LotTable({ lots }) {
  return (
    <div className="table-panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "Nome do Medicamento",
                "Lote",
                "Quantidade",
                "Validade",
                "Status",
                "Preço Original",
                "Preço Final",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lots.map((l) => (
              <tr key={l.id}>
                <td className="strong">
                  {l.medicamento.nome || `Medicamento #${l.idMedicamento}`}
                </td>
                <td className="muted">#{l.id}</td>
                <td>{l.quantidade.toLocaleString("pt-BR")} un.</td>
                <td>
                  {daysLeft(l.dataValidade) === null
                    ? "—"
                    : daysLeft(l.dataValidade) < 0
                      ? "Vencido"
                      : `Em ${daysLeft(l.dataValidade)} dias`}
                </td>
                <td>
                  <Status status={l.status} />
                </td>
                <td className="muted">{money(l.precoOriginal)}</td>
                <td className="price">
                  {l.status === "DISPONIVEL_DOACAO"
                    ? "Gratuito"
                    : ["VENCIDO", "DESCARTE"].includes(l.status)
                      ? "Indisponível"
                      : money(finalUnitPrice(l))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!lots.length && <Empty title="Nenhum lote cadastrado" />}
    </div>
  );
}
function Marketplace({ lots, search, onSelect }) {
  const [categories, setCategories] = useState([]),
    [discounts, setDiscounts] = useState([]),
    [validities, setValidities] = useState([]),
    [sort, setSort] = useState("discount");
  const categoryOptions = [
    ...new Set(lots.map((l) => l.medicamento.categoria).filter(Boolean)),
  ];
  const toggle = (value, setter) =>
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  const term = search.trim().toLocaleLowerCase("pt-BR");
  const filtered = lots
    .filter(
      (l) =>
        (!term ||
          `${l.medicamento.nome} ${l.medicamento.principioAtivo || l.medicamento.principio_ativo || ""}`
            .toLocaleLowerCase("pt-BR")
            .includes(term)) &&
        (!categories.length || categories.includes(l.medicamento.categoria)) &&
        (!discounts.length ||
          discounts.some((d) => l.percentualDesconto >= d)) &&
        (!validities.length ||
          validities.some((d) => daysLeft(l.dataValidade) <= d)),
    )
    .sort((a, b) =>
      sort === "price"
        ? finalUnitPrice(a) - finalUnitPrice(b)
        : sort === "expiry"
          ? daysLeft(a.dataValidade) - daysLeft(b.dataValidade)
          : b.percentualDesconto - a.percentualDesconto,
    );
  return (
    <section aria-labelledby="market-title">
      <div className="page-heading market-heading">
        <div>
          <h1 id="market-title">Medicamentos com desconto</h1>
          <p>Encontre lotes disponíveis nas farmácias parceiras.</p>
        </div>
      </div>
      <div className="market-layout">
        <aside className="filters">
          <h2>Filtros</h2>
          <FilterGroup
            label="CATEGORIA"
            options={categoryOptions.map((v) => [v, v])}
            selected={categories}
            toggle={(v) => toggle(v, setCategories)}
          />
          <FilterGroup
            label="FAIXA DE DESCONTO"
            options={[
              [10, "A partir de 10%"],
              [30, "A partir de 30%"],
              [50, "A partir de 50%"],
            ]}
            selected={discounts}
            toggle={(v) => toggle(v, setDiscounts)}
          />
          <FilterGroup
            label="VALIDADE"
            options={[
              [30, "Até 30 dias"],
              [60, "Até 60 dias"],
              [90, "Até 90 dias"],
            ]}
            selected={validities}
            toggle={(v) => toggle(v, setValidities)}
          />
          {!!(categories.length + discounts.length + validities.length) && (
            <button
              className="text-button"
              onClick={() => {
                setCategories([]);
                setDiscounts([]);
                setValidities([]);
              }}
            >
              Limpar filtros
            </button>
          )}
          <div className="filter-note">
            <Icon name="leaf" size={21} />
            <p>Sua compra ajuda a reduzir o desperdício de medicamentos.</p>
          </div>
        </aside>
        <section
          className="market-results"
          aria-label="Medicamentos disponíveis"
        >
          <div className="results-toolbar">
            <span>
              Mostrando <strong>{filtered.length}</strong> medicamentos em
              promoção
            </span>
            <label>
              Ordenar por:{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="discount">Maior Desconto</option>
                <option value="price">Menor Preço</option>
                <option value="expiry">Menor Validade</option>
              </select>
            </label>
          </div>
          <div className="product-grid">
            {filtered.map((l) => (
              <ProductCard key={l.id} lot={l} onClick={() => onSelect(l)} />
            ))}
          </div>
          {!filtered.length && (
            <Empty title="Nenhum medicamento encontrado">
              Tente outra busca ou ajuste os filtros.
            </Empty>
          )}
        </section>
      </div>
    </section>
  );
}
function FilterGroup({ label, options, selected, toggle }) {
  return (
    <fieldset className="filter-group">
      <legend>{label}</legend>
      {options.length ? (
        options.map(([v, text]) => (
          <label key={v}>
            <input
              type="checkbox"
              checked={selected.includes(v)}
              onChange={() => toggle(v)}
            />
            {text}
          </label>
        ))
      ) : (
        <small className="muted">Nenhuma categoria disponível.</small>
      )}
    </fieldset>
  );
}
function ProductDetail({ lot, onBack, onBuy }) {
  return (
    <>
      <button className="text-button back-link" onClick={onBack}>
        ← Voltar ao Marketplace
      </button>
      <section className="detail-layout">
        <div className="detail-art">
          <ProductArt
            name={lot.medicamento.nome}
            category={lot.medicamento.categoria}
            index={lot.idMedicamento}
            large
          />
          <span className="detail-art-note">
            <Icon name="leaf" size={17} /> Uma escolha consciente faz a
            diferença.
          </span>
        </div>
        <div className="detail-copy">
          <span className="eyebrow red">
            {lot.percentualDesconto}% DE DESCONTO · VENCE EM{" "}
            {daysLeft(lot.dataValidade)} DIAS
          </span>
          <h1>{lot.medicamento.nome}</h1>
          <p className="muted">
            {lot.medicamento.principioAtivo || lot.medicamento.principio_ativo}{" "}
            · {lot.medicamento.categoria}
          </p>
          <div className="detail-price">
            <del>{money(lot.precoOriginal)}</del>
            <strong>{money(finalUnitPrice(lot))}</strong>
            <span>por unidade</span>
          </div>
          <div className="stock-info">
            <div>
              <span>VALIDADE DO LOTE</span>
              <strong>{dateLabel(lot.dataValidade)}</strong>
            </div>
            <div>
              <span>ESTOQUE DO LOTE</span>
              <strong>{lot.quantidade} unidades disponíveis</strong>
            </div>
          </div>
          <div className="pharmacy-box">
            <Icon name="building" />
            <div>
              <strong>
                {lot.farmacia.nome ||
                  lot.farmacia.usuario?.nome ||
                  `Farmácia #${lot.idFarmacia}`}
              </strong>
              <small>
                {lot.farmacia.endereco ||
                  "Combine a retirada com a farmácia parceira."}
              </small>
            </div>
          </div>
          <div className="heading-actions">
            <button className="button" disabled={!canBuy(lot)} onClick={onBuy}>
              <Icon name="bag" size={16} />
              Comprar agora
            </button>
            <button className="button outline" onClick={onBack}>
              Voltar ao Marketplace
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function History({ transactions, lots, donation }) {
  return (
    <div className="table-panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {[
                "Registro",
                "Medicamento",
                "Quantidade",
                "Data",
                donation ? "Retirada" : "Total",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id}>
                <td>#{t.id}</td>
                <td>
                  {lots.find((l) => l.id === t.idLote)?.medicamento.nome ||
                    `Lote #${t.idLote}`}
                </td>
                <td>{t.quantidade} un.</td>
                <td>{dateLabel(t.data)}</td>
                <td>
                  {donation
                    ? t.dataRetirada
                      ? dateLabel(t.dataRetirada)
                      : "A combinar"
                    : money(t.precoFinal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!transactions.length && (
        <Empty
          title={
            donation
              ? "Você ainda não reservou doações"
              : "Você ainda não realizou compras"
          }
        />
      )}
    </div>
  );
}
function Admin({ data }) {
  const sold = data.vendas.reduce((n, t) => n + t.quantidade, 0),
    donated = data.doacoes.reduce((n, t) => n + t.quantidade, 0),
    revenue = data.vendas.reduce((n, t) => n + t.precoFinal, 0);
  const categories = [
    ["DESCONTO", "Desconto progressivo", "#c7283e"],
    ["DISPONIVEL_DOACAO", "Disponíveis para doação", "#2462bd"],
    ["NORMAL", "Normal", "#102b56"],
    ["VENCIDO", "Vencidos", "#788294"],
    ["DESCARTE", "Descarte", "#bbc1cc"],
  ].map(([key, label, color]) => ({
    key,
    label,
    color,
    value: data.lotes.filter((l) => l.status === key).length,
  }));
  const count = categories.reduce((n, c) => n + c.value, 0);
  let offset = 0;
  const segments = categories
    .map((c) => {
      const start = offset;
      offset += count ? (c.value / count) * 100 : 0;
      return `${c.color} ${start}% ${offset}%`;
    })
    .join(",");
  const months = Array.from({ length: 5 }, (_, i) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - 4 + i, 1);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("pt-BR", { month: "short" }),
      venda: 0,
      doacao: 0,
    };
  });
  const events = [...data.vendas, ...data.doacoes].sort((a, b) =>
    String(b.data || "").localeCompare(String(a.data || "")),
  );
  events.forEach((t) => {
    const m = months.find((m) => m.key === t.data?.slice(0, 7));
    if (m) m[t.kind] += t.quantidade;
  });
  const max = Math.max(1, ...months.map((m) => m.venda + m.doacao));
  const userName = (id) =>
    data.usuarios.find((u) => u.id === id)?.nome || `Usuário #${id}`;
  const lot = (id) => data.lotes.find((l) => l.id === id);
  function exportCSV() {
    const cell = (v) =>
      `"${String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replaceAll('"', '""')}"`;
    const rows = [
      ["Data", "Medicamento", "Origem", "Destinatário", "Quantidade", "Tipo"],
      ...events.map((t) => [
        dateLabel(t.data),
        lot(t.idLote)?.medicamento.nome || `Lote #${t.idLote}`,
        userName(lot(t.idLote)?.idFarmacia),
        userName(t.kind === "venda" ? t.idCliente : t.idOng),
        t.quantidade,
        t.kind === "venda" ? "Venda" : "Doação",
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF" + rows.map((r) => r.map(cell).join(";")).join("\r\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medshare-relatorio-${today()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <FarmaciasPendentes />
      <OngsPendentes />

      <div className="page-heading">
        <div>
          <h1>Painel Administrativo Geral</h1>
          <p>
            Métricas de eficiência operacional, logística e sustentabilidade.
          </p>
        </div>
        <button className="button outline" onClick={exportCSV}>
          <Icon name="download" size={16} />
          Exportar Relatório
        </button>
      </div>
      <div className="metrics five">
        <Metric
          label="Unidades redirecionadas"
          value={`${(sold + donated).toLocaleString("pt-BR")} un.`}
          note="Compradas + reservadas"
        />
        <Metric
          label="Vendidos com desconto"
          value={`${sold.toLocaleString("pt-BR")} un.`}
          color="red"
        />
        <Metric
          label="Reservados por ONGs"
          value={`${donated.toLocaleString("pt-BR")} un.`}
          note="Inclui retiradas pendentes"
          color="blue"
        />
        <Metric label="Valor de vendas" value={money(revenue)} />
        <Metric
          label="Unidades em estoque"
          value={data.lotes
            .reduce((n, l) => n + l.quantidade, 0)
            .toLocaleString("pt-BR")}
          color="blue"
        />
      </div>
      <div className="charts">
        <section className="chart-panel">
          <h2>Distribuição por status dos lotes</h2>
          <div className="donut-layout">
            <div
              className="donut"
              style={{
                background: count ? `conic-gradient(${segments})` : "#edf0f1",
              }}
              role="img"
              aria-label={categories
                .map((c) => `${c.label}: ${c.value}`)
                .join(", ")}
            >
              <div>
                <strong>{count}</strong>
                <span>Lotes cadastrados</span>
              </div>
            </div>
            <ul className="chart-legend">
              {categories.map((c) => (
                <li key={c.key}>
                  <i style={{ background: c.color }} />
                  {c.label} <strong>{c.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
        <section className="chart-panel">
          <h2>Redirecionamentos por mês (unidades)</h2>
          <div className="bars">
            {months.map((m) => (
              <div className="bar-column" key={m.key}>
                <div
                  className="bar-track"
                  title={`${m.label}: ${m.venda} vendidas, ${m.doacao} reservadas`}
                >
                  <span
                    className="bar-donation"
                    style={{ height: `${(m.doacao / max) * 100}%` }}
                  />
                  <span
                    className="bar-sale"
                    style={{ height: `${(m.venda / max) * 100}%` }}
                  />
                </div>
                <small>{m.label}</small>
              </div>
            ))}
          </div>
          <div className="bar-legend">
            <span>
              <i className="sale-dot" />
              Vendas
            </span>
            <span>
              <i className="donation-dot" />
              Doações reservadas
            </span>
          </div>
          <details className="chart-data">
            <summary>Ver valores por mês</summary>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Vendas</th>
                  <th>Doações</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m) => (
                  <tr key={m.key}>
                    <td>{m.key}</td>
                    <td>{m.venda}</td>
                    <td>{m.doacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
      </div>
      <section className="table-panel activity">
        <h2>Log de atividades recentes</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {[
                  "Data",
                  "Medicamento",
                  "Origem (Doador/Vendedor)",
                  "Destinatário / Canal",
                  "Qtd",
                  "Tipo de Transação",
                ].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 20).map((t) => (
                <tr key={`${t.kind}-${t.id}`}>
                  <td>{dateLabel(t.data)}</td>
                  <td className="strong">
                    {lot(t.idLote)?.medicamento.nome || `Lote #${t.idLote}`}
                  </td>
                  <td className="muted">
                    {userName(lot(t.idLote)?.idFarmacia)}
                  </td>
                  <td className="muted">
                    {userName(t.kind === "venda" ? t.idCliente : t.idOng)}
                  </td>
                  <td>{t.quantidade} un.</td>
                  <td>
                    <span
                      className={`badge ${t.kind === "venda" ? "status-DESCONTO" : "status-DISPONIVEL_DOACAO"}`}
                    >
                      {t.kind === "venda"
                        ? "Compra com desconto"
                        : "Doação Social"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!events.length && (
          <Empty title="Nenhuma transação registrada">
            As compras e reservas de doação aparecerão aqui.
          </Empty>
        )}
      </section>
    </>
  );
}
function FarmaciasPendentes() {
  const [farmacias, setFarmacias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aprovandoId, setAprovandoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await listarFarmaciasPendentes();

        if (ativo) {
          setFarmacias(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  async function aprovar(id) {
    setErro("");
    setAprovandoId(id);

    try {
      await aprovarFarmacia(id);

      setFarmacias((lista) =>
        lista.filter((farmacia) => farmacia.id !== id)
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setAprovandoId(null);
    }
  }

  return (
    <section className="table-panel">
      <h2 style={{ padding: "20px" }}>
        Farmácias aguardando aprovação
      </h2>

      {erro && (
        <div className="notice error" role="alert">
          {erro}
        </div>
      )}

      {carregando ? (
        <p style={{ padding: "20px" }}>Carregando farmácias…</p>
      ) : farmacias.length === 0 ? (
        <p style={{ padding: "20px" }}>
          Nenhuma farmácia aguardando aprovação.
        </p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>CNPJ</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {farmacias.map((farmacia) => (
                <tr key={farmacia.id}>
                  <td>{farmacia.nome}</td>
                  <td>{farmacia.email}</td>
                  <td>{farmacia.cnpj}</td>
                  <td>
                    <button
                      className="button"
                      disabled={aprovandoId !== null}
                      onClick={() => aprovar(farmacia.id)}
                    >
                      {aprovandoId === farmacia.id
                        ? "Aprovando…"
                        : "Aprovar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
function OngsPendentes() {
  const [ongs, setOngs] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [aprovandoId, setAprovandoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await listarOngsPendentes();

        if (ativo) {
          setOngs(dados);
        }
      } catch (error) {
        if (ativo) {
          setErro(error.message);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  async function aprovar(id) {
    setErro("");
    setAprovandoId(id);

    try {
      await aprovarOng(id);

      setOngs((lista) =>
        lista.filter((ong) => ong.id !== id)
      );
    } catch (error) {
      setErro(error.message);
    } finally {
      setAprovandoId(null);
    }
  }

  return (
    <section
      className="table-panel"
      style={{ marginTop: "24px" }}
    >
      <h2 style={{ padding: "20px" }}>
        ONGs aguardando aprovação
      </h2>

      {erro && (
        <div className="notice error" role="alert">
          {erro}
        </div>
      )}

      {carregando ? (
        <p style={{ padding: "20px" }}>
          Carregando ONGs…
        </p>
      ) : ongs.length > 0 ? (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>CNPJ</th>
                <th>Área de atuação</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {ongs.map((ong) => (
                <tr key={ong.id}>
                  <td>{ong.nome}</td>
                  <td>{ong.email}</td>
                  <td>{ong.cnpj}</td>
                  <td>{ong.areaAtuacao}</td>
                  <td>
                    <button
                      className="button"
                      disabled={aprovandoId !== null}
                      onClick={() => aprovar(ong.id)}
                    >
                      {aprovandoId === ong.id
                        ? "Aprovando…"
                        : "Aprovar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !erro ? (
        <p style={{ padding: "20px" }}>
          Nenhuma ONG aguardando aprovação.
        </p>
      ) : null}
    </section>
  );
}