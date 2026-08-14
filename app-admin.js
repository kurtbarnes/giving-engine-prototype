/* ============================================================
   GIFT HISTORY
   ============================================================ */
function StatPill({ status }) {
  const map = { settled: "Settled", pending: "Pending", failed: "Failed", refunded: "Refunded" };
  return <span className={"ge-pill ge-pill-" + status}>{map[status]}</span>;
}
function TypeLabel({ type }) {
  const map = { one_time: "One-time", recurring: "Recurring", pledge_payment: "Pledge payment" };
  return <span>{map[type]}</span>;
}

function GiftHistory() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("date_desc");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let rows = MOCK_GIFTS.filter((g) => {
      if (status !== "all" && g.status !== status) return false;
      if (type !== "all" && g.type !== type) return false;
      if (q && !(g.donor.toLowerCase().includes(q.toLowerCase()) || g.email.toLowerCase().includes(q.toLowerCase()) || g.id.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
    if (sort === "date_desc") rows = [...rows].sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "date_asc") rows = [...rows].sort((a, b) => a.date.localeCompare(b.date));
    if (sort === "amount_desc") rows = [...rows].sort((a, b) => b.amount - a.amount);
    return rows;
  }, [q, status, type, sort]);

  const totals = useMemo(() => {
    const settled = MOCK_GIFTS.filter((g) => g.status === "settled");
    const sum = settled.reduce((a, g) => a + g.amount, 0);
    const recurring = MOCK_GIFTS.filter((g) => g.type === "recurring").length;
    const failedCount = MOCK_GIFTS.filter((g) => g.status === "failed").length;
    return { sum, count: settled.length, recurring, failedCount };
  }, []);

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Gift history</h1>
        <p>Search, filter, and review every gift across all forms and templates. Every settled gift links to its Rainforest transaction ID and RE NXT sync status.</p>
      </div>

      <div className="ge-stat-row">
        <div className="ge-stat"><div className="ge-stat-label">Total raised (settled)</div><div className="ge-stat-value">{fmtMoney(totals.sum)}</div><div className="ge-stat-sub">Last 45 days</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Settled gifts</div><div className="ge-stat-value">{totals.count}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Active recurring installments</div><div className="ge-stat-value">{totals.recurring}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Failed charges</div><div className="ge-stat-value" style={{ color: totals.failedCount ? "#C41E3A" : "#1A2027" }}>{totals.failedCount}</div><div className="ge-stat-sub" style={{ color: "#B54708" }}>Needs review</div></div>
      </div>

      <div className="ge-card">
        <div className="ge-card-pad" style={{ paddingBottom: 0 }}>
          <div className="ge-toolbar">
            <div className="ge-search"><input placeholder="Search donor name, email, or gift ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="ge-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="settled">Settled</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select className="ge-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="all">All gift types</option>
              <option value="one_time">One-time</option>
              <option value="recurring">Recurring</option>
              <option value="pledge_payment">Pledge payment</option>
            </select>
            <select className="ge-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="date_desc">Newest first</option>
              <option value="date_asc">Oldest first</option>
              <option value="amount_desc">Amount: high to low</option>
            </select>
            <button className="ge-btn ge-btn-ghost ge-btn-sm">Export CSV</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ge-table">
            <thead>
              <tr>
                <th>Gift ID</th><th>Donor</th><th>Amount</th><th>Type</th><th>Designation</th><th>Date</th><th>Status</th><th>RE NXT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((g) => (
                <tr key={g.id} onClick={() => setSelected(g)} style={{ cursor: "pointer" }}>
                  <td className="ge-mono">{g.id}</td>
                  <td><b>{g.donor}</b><div style={{ fontSize: 12, color: "#98A2B3" }}>{g.email}</div></td>
                  <td><b>{fmtMoney(g.amount)}</b></td>
                  <td><TypeLabel type={g.type} /></td>
                  <td>{g.designation}</td>
                  <td>{g.date}</td>
                  <td><StatPill status={g.status} /></td>
                  <td>{g.synced ? <span style={{ color: "#16A34A", fontWeight: 700, fontSize: 12.5 }}>Synced</span> : <span style={{ color: "#B54708", fontWeight: 700, fontSize: 12.5 }}>Pending</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#98A2B3" }}>No gifts match these filters.</div>}
        </div>
        <div style={{ padding: "12px 20px", fontSize: 12.5, color: "#98A2B3" }}>Showing {Math.min(20, filtered.length)} of {filtered.length} gifts</div>
      </div>

      {selected && (
        <div className="tmpl-modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="tmpl-modal-panel" style={{ maxWidth: 420 }}>
            <div className="mhdr"><b style={{ fontWeight: 700 }}>{selected.id}</b><button className="x" onClick={() => setSelected(null)}>&times;</button></div>
            <div className="mbody">
              <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: 4 }}>{fmtMoney(selected.amount)}</div>
              <div style={{ marginBottom: 16 }}><StatPill status={selected.status} /></div>
              {[["Donor", selected.donor], ["Email", selected.email], ["Type", <TypeLabel type={selected.type} />], ["Designation", selected.designation], ["Date", selected.date], ["Rainforest transaction", selected.txId], ["RE NXT sync", selected.synced ? "Synced" : "Pending"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5 }}>
                  <span style={{ color: "#98A2B3" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <button className="ge-btn ge-btn-ghost ge-btn-sm">Resend receipt</button>
                <button className="ge-btn ge-btn-ghost ge-btn-sm">Refund</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   FORM BUILDER
   ============================================================ */
function Toggle({ on, onClick }) {
  return <button className={"ge-toggle" + (on ? " on" : "")} onClick={onClick} />;
}
function FieldRow({ label, desc, children }) {
  return (
    <div className="ge-field-row">
      <div><div className="ge-field-row-label">{label}</div>{desc && <div className="ge-field-row-desc">{desc}</div>}</div>
      {children}
    </div>
  );
}

function FormBuilder() {
  const [gt, setGt] = useState({ one_time: true, recurring: true, pledge: true, org_gift: true });
  const [fields, setFields] = useState({ title: true, address: "optional", phone: false, anonymous: true, tribute: true, comments: true, consent: true, ackOptOut: true });
  const [otherFund, setOtherFund] = useState(true);
  const [feeCoverDefault, setFeeCoverDefault] = useState(false);
  const [feeCopy, setFeeCopy] = useState("Add a little extra so 100% of my gift reaches you.");
  const [template, setTemplate] = useState("classic");
  const [dist, setDist] = useState("both");
  const [slug, setSlug] = useState("spring-appeal");

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Form builder — Spring Appeal</h1>
        <p>Configure gift types, fields, and distribution for this form. Every field below maps directly to the Form entity in the design document (§6, §9).</p>
      </div>
      <div className="ge-formbuilder-grid">
        <div>
          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Gift types</h3>
            <FieldRow label="One-time gifts"><Toggle on={gt.one_time} onClick={() => setGt((s) => ({ ...s, one_time: !s.one_time }))} /></FieldRow>
            <FieldRow label="Recurring gifts"><Toggle on={gt.recurring} onClick={() => setGt((s) => ({ ...s, recurring: !s.recurring }))} /></FieldRow>
            <FieldRow label="Pledge payments" desc="Donor looks up an existing RE NXT pledge and pays it down"><Toggle on={gt.pledge} onClick={() => setGt((s) => ({ ...s, pledge: !s.pledge }))} /></FieldRow>
            <FieldRow label="Organization / business gifts"><Toggle on={gt.org_gift} onClick={() => setGt((s) => ({ ...s, org_gift: !s.org_gift }))} /></FieldRow>
          </div>

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Designations</h3>
            <FieldRow label="Allow “Other” write-in fund" desc="Reveals a required free-text field only when selected"><Toggle on={otherFund} onClick={() => setOtherFund((v) => !v)} /></FieldRow>
            <FieldRow label="Allow donors to split gifts across designations"><Toggle on={true} onClick={() => {}} /></FieldRow>
          </div>

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Donor fields</h3>
            <FieldRow label="Title (Mr./Mrs./Mx.)"><Toggle on={fields.title} onClick={() => setFields((s) => ({ ...s, title: !s.title }))} /></FieldRow>
            <FieldRow label="Address">
              <div className="ge-radiogroup">
                {["required", "optional", "off"].map((v) => (
                  <button key={v} className={fields.address === v ? "on" : ""} onClick={() => setFields((s) => ({ ...s, address: v }))}>{v[0].toUpperCase() + v.slice(1)}</button>
                ))}
              </div>
            </FieldRow>
            <FieldRow label="Phone number"><Toggle on={fields.phone} onClick={() => setFields((s) => ({ ...s, phone: !s.phone }))} /></FieldRow>
            <FieldRow label="Anonymous gift option"><Toggle on={fields.anonymous} onClick={() => setFields((s) => ({ ...s, anonymous: !s.anonymous }))} /></FieldRow>
            <FieldRow label="Tribute (honor / memorial)" desc="Structured first + last honoree name"><Toggle on={fields.tribute} onClick={() => setFields((s) => ({ ...s, tribute: !s.tribute }))} /></FieldRow>
            <FieldRow label="Comments" desc="1,000 character limit (org default)"><Toggle on={fields.comments} onClick={() => setFields((s) => ({ ...s, comments: !s.comments }))} /></FieldRow>
            <FieldRow label="Communication consent checkboxes"><Toggle on={fields.consent} onClick={() => setFields((s) => ({ ...s, consent: !s.consent }))} /></FieldRow>
            <FieldRow label="Let donor opt out of mailed acknowledgement"><Toggle on={fields.ackOptOut} onClick={() => setFields((s) => ({ ...s, ackOptOut: !s.ackOptOut }))} /></FieldRow>
          </div>

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Fee coverage (Donor Cover)</h3>
            <FieldRow label="Pre-check fee coverage by default" desc="Product default is unchecked (opt-in) per idea RENXT-I-5533"><Toggle on={feeCoverDefault} onClick={() => setFeeCoverDefault((v) => !v)} /></FieldRow>
            <div style={{ marginTop: 10 }}>
              <label className="ge-label">Disclosure copy</label>
              <input className="ge-input" value={feeCopy} onChange={(e) => setFeeCopy(e.target.value)} />
            </div>
          </div>

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Distribution</h3>
            <FieldRow label="Where this form appears">
              <div className="ge-radiogroup">
                {[["embed", "Embedded only"], ["hosted", "Hosted page only"], ["both", "Both"]].map(([v, l]) => (
                  <button key={v} className={dist === v ? "on" : ""} onClick={() => setDist(v)}>{l}</button>
                ))}
              </div>
            </FieldRow>
            {dist !== "embed" && (
              <div style={{ marginTop: 12 }}>
                <label className="ge-label">Hosted page URL</label>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13.5, color: "#98A2B3" }}>give.riverbendhumane.org/</span>
                  <input className="ge-input" style={{ width: 160 }} value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="ge-card ge-card-pad">
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 12px" }}>Template</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TEMPLATE_ORDER.map((id) => (
                <div key={id} onClick={() => setTemplate(id)}
                  style={{ borderRadius: 8, padding: 8, border: "2px solid " + (template === id ? "#14213D" : "#E4E7EC"), cursor: "pointer" }}>
                  <div style={{ height: 40, borderRadius: 5, background: ORGS[id].thumbGrad, marginBottom: 6 }} />
                  <div style={{ fontSize: 11.5, fontWeight: 700 }}>{ORGS[id].tmplName}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="ge-card ge-card-pad" style={{ marginTop: 16 }}>
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 6px" }}>Live preview</h3>
            <p style={{ fontSize: 12.5, color: "#98A2B3", margin: "0 0 12px" }}>This config, rendered in the selected template.</p>
            <div style={{ border: "1px solid #E4E7EC", borderRadius: 10, overflow: "hidden", transform: "scale(0.86)", transformOrigin: "top left", width: "116%", height: 340 }}>
              <div style={{ height: 340, overflow: "hidden" }}>
                {React.createElement(TEMPLATE_COMPONENTS[template], { org: ORGS[template], key: template })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BRANDING
   ============================================================ */
function Branding() {
  const palette = ["#14213D", "#1B4B8F", "#0E7C7B", "#C1440E", "#6D4AFF", "#2F5D50", "#FF6B4A", "#B54708"];
  const [primary, setPrimary] = useState("#1B4B8F");
  const [font, setFont] = useState("Inter");

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Brand kit</h1>
        <p>Set your organization's logo, colors, and font once — every form and template inherits it by default, closing idea RENXT-I-6264 (branding shouldn't be re-set per form).</p>
      </div>
      <div className="ge-formbuilder-grid">
        <div className="ge-card ge-card-pad">
          <div className="ge-field-group">
            <h3>Logo</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontFamily: "Sora, sans-serif", fontSize: 22 }}>RH</div>
              <button className="ge-btn ge-btn-ghost ge-btn-sm">Upload new logo</button>
            </div>
          </div>
          <div className="ge-field-group">
            <h3>Primary color</h3>
            <div className="ge-swatch-row">
              {palette.map((c) => (
                <div key={c} className={"ge-swatch" + (primary === c ? " on" : "")} style={{ background: c }} onClick={() => setPrimary(c)} />
              ))}
            </div>
          </div>
          <div className="ge-field-group">
            <h3>Typeface</h3>
            <div className="ge-radiogroup">
              {["Inter", "Sora", "DM Sans"].map((f) => (
                <button key={f} className={font === f ? "on" : ""} onClick={() => setFont(f)}>{f}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="ge-card ge-card-pad">
          <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 14px" }}>Preview</h3>
          <div style={{ border: "1px solid #E4E7EC", borderRadius: 10, padding: 20, fontFamily: font }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, marginBottom: 12 }}>RH</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 10 }}>Riverbend Humane Society</div>
            <button style={{ background: primary, color: "#fff", border: "none", padding: "10px 18px", borderRadius: 8, fontWeight: 700, fontFamily: font }}>Give $100 now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MERCHANT ACCOUNT (admin summary view)
   ============================================================ */
function MerchantAccountSummary({ goOnboard }) {
  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Payment processing</h1>
        <p>Your organization's Rainforest sub-merchant account and payout details.</p>
      </div>
      <div className="ge-card ge-card-pad" style={{ maxWidth: 560 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Riverbend Humane Society</div>
            <div style={{ fontSize: 12.5, color: "#98A2B3" }}>Sub-merchant ID: rf_sm_8827KJ</div>
          </div>
          <span className="ge-pill ge-pill-settled">Approved</span>
        </div>
        {[["Payout bank account", "\u2022\u2022\u2022\u2022 4471"], ["Payout schedule", "Next-day funding"], ["Payment methods", "Card, ACH, Apple Pay, Google Pay"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5 }}>
            <span style={{ color: "#98A2B3" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
          </div>
        ))}
        <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ marginTop: 16 }} onClick={goOnboard}>View onboarding flow</button>
      </div>
    </div>
  );
}
