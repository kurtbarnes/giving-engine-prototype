function TopNav({ view, setView }) {
  const tabs = [
    { id: "donor", label: "Donor Checkout" },
    { id: "admin", label: "Admin Console" },
    { id: "onboarding", label: "Merchant Onboarding" },
  ];
  return (
    <div className="ge-topnav">
      <div className="ge-brand">
        <div className="ge-brand-mark">GE</div>
        Giving Engine
        <span className="ge-brand-sub">Interactive Prototype</span>
      </div>
      <div className="ge-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={"ge-tab" + (view === t.id ? " active" : "")} onClick={() => setView(t.id)}>{t.label}</button>
        ))}
      </div>
    </div>
  );
}

function TemplateGallery({ onOpen }) {
  return (
    <div className="ge-container">
      <div className="ge-page-head">
        <div className="ge-eyebrow">Donor Checkout</div>
        <h1>Five checkout templates, one engine</h1>
        <p>Every template below shares the same checkout logic, field configuration, and payment flow — only the layout and visual style change. Click any card to try the live, interactive flow as a donor would see it.</p>
      </div>
      <div className="ge-gallery-grid">
        {TEMPLATE_ORDER.map((id) => {
          const org = ORGS[id];
          return (
            <button key={id} className="ge-tmpl-card" onClick={() => onOpen(id)}>
              <div className="ge-tmpl-thumb" style={{ background: org.thumbGrad, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 15, fontWeight: 700, opacity: 0.92, textAlign: "center", padding: "0 20px" }}>
                  {org.tmplName}
                </div>
              </div>
              <div className="ge-tmpl-body">
                <div className="ge-tmpl-org" style={{ color: "#667085" }}>{org.name}</div>
                <div className="ge-tmpl-name">{org.tmplName}</div>
                <p className="ge-tmpl-desc">{org.tmplDesc}</p>
                <div className="ge-tmpl-tags">
                  <span className="ge-tag">One-time + recurring</span>
                  <span className="ge-tag">Live demo</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutView({ templateId, onBack }) {
  const org = ORGS[templateId];
  const Comp = TEMPLATE_COMPONENTS[templateId];
  return (
    <div>
      <div className="ge-backbar">
        <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={onBack}>&larr; All templates</button>
        <b>{org.tmplName}</b><span>&mdash; {org.name} (demo data, no real payment)</span>
      </div>
      <div className="ge-checkout-stage">
        <Comp org={org} key={templateId} />
      </div>
    </div>
  );
}

function AdminConsole() {
  const [page, setPage] = useState("gifts");
  const items = [
    { section: "Overview", items: [["gifts", "Gift history"]] },
    { section: "Forms", items: [["builder", "Form builder"], ["branding", "Branding"]] },
    { section: "Payments", items: [["merchant", "Payment processing"]] },
  ];
  return (
    <div className="ge-admin-shell">
      <div className="ge-admin-side">
        {items.map((sec) => (
          <div key={sec.section}>
            <div className="ge-admin-side-label">{sec.section}</div>
            {sec.items.map(([id, label]) => (
              <button key={id} className={"ge-admin-side-item" + (page === id ? " active" : "")} onClick={() => setPage(id)}>{label}</button>
            ))}
          </div>
        ))}
      </div>
      <div className="ge-admin-content">
        {page === "gifts" && <GiftHistory />}
        {page === "builder" && <FormBuilder />}
        {page === "branding" && <Branding />}
        {page === "merchant" && <MerchantAccountSummary goOnboard={() => setPage("__onb")} />}
        {page === "__onb" && <OnboardingWizard />}
      </div>
    </div>
  );
}

function App() {
  const [view, setView] = useState("donor");
  const [template, setTemplate] = useState(null);

  function goView(v) { setView(v); if (v !== "donor") setTemplate(null); }

  return (
    <div className="ge-app">
      <TopNav view={view} setView={goView} />
      <div className="ge-main">
        {view === "donor" && (template ? <CheckoutView templateId={template} onBack={() => setTemplate(null)} /> : <TemplateGallery onOpen={setTemplate} />)}
        {view === "admin" && <AdminConsole />}
        {view === "onboarding" && <OnboardingWizard />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
