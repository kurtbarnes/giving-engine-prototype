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

function GiftDetailModal({ gift, onClose }) {
  return (
    <div className="tmpl-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="tmpl-modal-panel" style={{ maxWidth: 420 }}>
        <div className="mhdr"><b style={{ fontWeight: 700 }}>{gift.id}</b><button className="x" onClick={onClose}>&times;</button></div>
        <div className="mbody">
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "Sora, sans-serif", marginBottom: 4 }}>{fmtMoney(gift.amount)}</div>
          <div style={{ marginBottom: 16 }}><StatPill status={gift.status} /></div>
          {[["Donor", gift.donor], ["Email", gift.email], ["Type", <TypeLabel type={gift.type} />], ["Designation", gift.designation], ["Date", gift.date], ["Rainforest transaction", gift.txId], ["RE NXT sync", gift.synced ? "Synced" : "Pending"]].map(([k, v]) => (
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
  );
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

      {selected && <GiftDetailModal gift={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ============================================================
   DONORS
   ============================================================ */
function ReSyncLabel({ status }) {
  const map = {
    synced: { text: "Synced", color: "#16A34A" },
    partial: { text: "Partially synced", color: "#B54708" },
    pending: { text: "Not synced", color: "#C41E3A" },
  };
  const m = map[status] || map.pending;
  return <span style={{ color: m.color, fontWeight: 700, fontSize: 12.5 }}>{m.text}</span>;
}

function kvRow(k, v) {
  return (
    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5, gap: 12 }}>
      <span style={{ color: "#98A2B3", flexShrink: 0 }}>{k}</span><span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function DonorDirectory() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("total_desc");
  const [selectedId, setSelectedId] = useState(null);

  const filtered = useMemo(() => {
    let rows = MOCK_DONORS.filter((d) => {
      if (filter === "recurring" && !d.recurringGifts.some((r) => r.status === "active")) return false;
      if (filter === "pledge" && !d.pledges.some((p) => p.balance > 0)) return false;
      if (filter === "unsynced" && d.reSynced === "synced") return false;
      if (q) {
        const needle = q.toLowerCase();
        if (!(d.name.toLowerCase().includes(needle) || d.email.toLowerCase().includes(needle) || d.reConstituentId.toLowerCase().includes(needle))) return false;
      }
      return true;
    });
    if (sort === "total_desc") rows = [...rows].sort((a, b) => b.totalGiving - a.totalGiving);
    if (sort === "recent") rows = [...rows].sort((a, b) => b.lastGiftDate.localeCompare(a.lastGiftDate));
    if (sort === "name_asc") rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    return rows;
  }, [q, filter, sort]);

  const totals = useMemo(() => {
    const totalGiven = MOCK_DONORS.reduce((a, d) => a + d.totalGiving, 0);
    const recurringCount = MOCK_DONORS.filter((d) => d.recurringGifts.some((r) => r.status === "active")).length;
    const unsyncedCount = MOCK_DONORS.filter((d) => d.reSynced !== "synced").length;
    return { count: MOCK_DONORS.length, totalGiven, recurringCount, unsyncedCount };
  }, []);

  if (selectedId) return <DonorProfile donorId={selectedId} onBack={() => setSelectedId(null)} />;

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Donors</h1>
        <p>Every individual who has given, with full giving history, active recurring gifts and pledges, and RE NXT sync status in one place.</p>
      </div>

      <div className="ge-stat-row">
        <div className="ge-stat"><div className="ge-stat-label">Total donors</div><div className="ge-stat-value">{totals.count}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Lifetime giving</div><div className="ge-stat-value">{fmtMoney(totals.totalGiven)}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Active recurring donors</div><div className="ge-stat-value">{totals.recurringCount}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Not synced to RE NXT</div><div className="ge-stat-value" style={{ color: totals.unsyncedCount ? "#C41E3A" : "#1A2027" }}>{totals.unsyncedCount}</div></div>
      </div>

      <div className="ge-card">
        <div className="ge-card-pad" style={{ paddingBottom: 0 }}>
          <div className="ge-toolbar">
            <div className="ge-search"><input placeholder="Search donor name, email, or constituent ID…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="ge-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All donors</option>
              <option value="recurring">Has active recurring gift</option>
              <option value="pledge">Has open pledge balance</option>
              <option value="unsynced">Not fully synced to RE NXT</option>
            </select>
            <select className="ge-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="total_desc">Total giving: high to low</option>
              <option value="recent">Most recent gift</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
            <button className="ge-btn ge-btn-ghost ge-btn-sm">Export CSV</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ge-table">
            <thead>
              <tr>
                <th>Donor</th><th>Total giving</th><th>Gifts</th><th>Last gift</th><th>Recurring</th><th>Pledge</th><th>RE NXT</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} onClick={() => setSelectedId(d.id)} style={{ cursor: "pointer" }}>
                  <td><b>{d.name}</b><div style={{ fontSize: 12, color: "#98A2B3" }}>{d.email}</div></td>
                  <td><b>{fmtMoney(d.totalGiving)}</b></td>
                  <td>{d.giftCount}</td>
                  <td>{d.lastGiftDate}</td>
                  <td>{d.recurringGifts.some((r) => r.status === "active") ? <span style={{ color: "#16A34A", fontWeight: 700, fontSize: 12.5 }}>Active</span> : <span style={{ color: "#98A2B3", fontSize: 12.5 }}>—</span>}</td>
                  <td>{d.pledges.some((p) => p.balance > 0) ? <span style={{ color: "#B54708", fontWeight: 700, fontSize: 12.5 }}>{fmtMoney(d.pledges[0].balance)} due</span> : <span style={{ color: "#98A2B3", fontSize: 12.5 }}>—</span>}</td>
                  <td><ReSyncLabel status={d.reSynced} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#98A2B3" }}>No donors match these filters.</div>}
        </div>
        <div style={{ padding: "12px 20px", fontSize: 12.5, color: "#98A2B3" }}>Showing {filtered.length} of {MOCK_DONORS.length} donors</div>
      </div>
    </div>
  );
}

function DonorProfile({ donorId, onBack }) {
  const donor = MOCK_DONORS.find((d) => d.id === donorId);
  const [selectedGift, setSelectedGift] = useState(null);
  if (!donor) return null;

  return (
    <div>
      <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ marginBottom: 18 }} onClick={onBack}>&larr; All donors</button>
      <div className="ge-page-head" style={{ marginBottom: 22 }}>
        <div className="ge-eyebrow">Admin Console &middot; Donors</div>
        <h1>{donor.name}</h1>
        <p>Donor since {donor.firstGiftDate} &middot; {donor.giftCount} gift{donor.giftCount === 1 ? "" : "s"} &middot; {fmtMoney(donor.totalGiving)} lifetime</p>
      </div>

      <div className="ge-formbuilder-grid">
        <div>
          {donor.recurringGifts.length > 0 && (
            <div className="ge-card ge-card-pad ge-field-group" style={{ marginBottom: 20 }}>
              <h3>Active recurring gifts</h3>
              {donor.recurringGifts.map((r) => (
                <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F0F2F5" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtMoney(r.amount)} &middot; {FREQ_LABEL[r.frequency] || r.frequency}</div>
                    <div style={{ fontSize: 12.5, color: "#98A2B3", marginTop: 2 }}>{r.designation} &middot; Next charge {r.nextChargeDate}</div>
                  </div>
                  <span className={"ge-pill " + (r.status === "active" ? "ge-pill-settled" : "ge-pill-refunded")}>{r.status === "active" ? "Active" : "Paused"}</span>
                </div>
              ))}
            </div>
          )}

          {donor.pledges.length > 0 && (
            <div className="ge-card ge-card-pad ge-field-group" style={{ marginBottom: 20 }}>
              <h3>Pledges</h3>
              {donor.pledges.map((p) => {
                const pct = Math.min(100, Math.round((p.totalPaid / p.totalPledged) * 100));
                return (
                  <div key={p.id} style={{ padding: "10px 0 14px", borderBottom: "1px solid #F0F2F5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.designation}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtMoney(p.totalPaid)} / {fmtMoney(p.totalPledged)}</div>
                    </div>
                    <div style={{ height: 8, background: "#F0F2F5", borderRadius: 100, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: "#14213D", borderRadius: 100 }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 12.5, color: "#98A2B3" }}>
                      <span>{p.installments} payment{p.installments === 1 ? "" : "s"} received</span>
                      <span>{fmtMoney(p.balance)} balance &middot; next due {p.nextDueDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="ge-card">
            <div className="ge-card-pad" style={{ paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontFamily: "Sora, sans-serif", fontSize: 14.5 }}>Past gifts</h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="ge-table">
                <thead>
                  <tr><th>Gift ID</th><th>Amount</th><th>Type</th><th>Designation</th><th>Date</th><th>Status</th><th>RE NXT</th></tr>
                </thead>
                <tbody>
                  {donor.gifts.map((g) => (
                    <tr key={g.id} onClick={() => setSelectedGift(g)} style={{ cursor: "pointer" }}>
                      <td className="ge-mono">{g.id}</td>
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
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="ge-card ge-card-pad" style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#14213D", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontFamily: "Sora, sans-serif", fontSize: 15, flexShrink: 0 }}>
                {donor.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{donor.name}</div>
                <div style={{ fontSize: 12.5, color: "#98A2B3" }}>{donor.id}</div>
              </div>
            </div>
            {kvRow("Email", donor.email)}
            {kvRow("Phone", donor.phone)}
            {kvRow("Address", <>{donor.address.line1}<br />{donor.address.city}, {donor.address.state} {donor.address.zip}</>)}
            {kvRow("Last gift", donor.lastGiftDate)}
            {kvRow("Largest gift", fmtMoney(donor.largestGift))}
          </div>

          <div className="ge-card ge-card-pad">
            <h3 style={{ margin: "0 0 4px", fontFamily: "Sora, sans-serif", fontSize: 14.5 }}>RE NXT sync</h3>
            <p style={{ fontSize: 12.5, color: "#98A2B3", margin: "0 0 14px" }}>Constituent record linked from Raiser's Edge NXT.</p>
            {kvRow("Constituent ID", <span className="ge-mono">{donor.reConstituentId}</span>)}
            {kvRow("Sync status", <ReSyncLabel status={donor.reSynced} />)}
            {kvRow("Gifts synced", donor.gifts.filter((g) => g.synced).length + " / " + donor.gifts.length)}
            <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>View in Raiser's Edge NXT</button>
          </div>
        </div>
      </div>

      {selectedGift && <GiftDetailModal gift={selectedGift} onClose={() => setSelectedGift(null)} />}
    </div>
  );
}

/* ============================================================
   FORMS LIST
   ============================================================ */
function FormStatusPill({ status }) {
  return <span className={"ge-pill " + (status === "active" ? "ge-pill-settled" : "ge-pill-refunded")}>{status === "active" ? "Active" : "Inactive"}</span>;
}

function FormsList({ onNew, onEdit }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_FORMS.filter((f) => {
      if (status !== "all" && f.status !== status) return false;
      if (q && !f.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status]);

  const totals = useMemo(() => {
    const totalRaised = MOCK_FORMS.reduce((a, f) => a + f.totalRaised, 0);
    const activeCount = MOCK_FORMS.filter((f) => f.status === "active").length;
    const avgConv = MOCK_FORMS.reduce((a, f) => a + f.conversionRate, 0) / MOCK_FORMS.length;
    return { totalRaised, activeCount, avgConv };
  }, []);

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Forms</h1>
        <p>Every donation form configured for your organization, with performance at a glance. Every form shares the same checkout engine — only fields, template, and distribution differ.</p>
      </div>

      <div className="ge-stat-row">
        <div className="ge-stat"><div className="ge-stat-label">Total forms</div><div className="ge-stat-value">{MOCK_FORMS.length}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Active</div><div className="ge-stat-value">{totals.activeCount}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Total raised</div><div className="ge-stat-value">{fmtMoney(totals.totalRaised)}</div></div>
        <div className="ge-stat"><div className="ge-stat-label">Avg. conversion rate</div><div className="ge-stat-value">{totals.avgConv.toFixed(1)}%</div></div>
      </div>

      <div className="ge-card">
        <div className="ge-card-pad" style={{ paddingBottom: 0 }}>
          <div className="ge-toolbar">
            <div className="ge-search"><input placeholder="Search forms…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <select className="ge-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="ge-btn ge-btn-primary ge-btn-sm" onClick={onNew}>+ New form</button>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="ge-table">
            <thead>
              <tr><th>Form</th><th>Status</th><th>Total raised</th><th>Conversion rate</th><th>Created</th></tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f.id} onClick={() => onEdit(f)} style={{ cursor: "pointer" }}>
                  <td><b>{f.name}</b><div style={{ fontSize: 12, color: "#98A2B3" }}>{ORGS[f.template].tmplName}</div></td>
                  <td><FormStatusPill status={f.status} /></td>
                  <td><b>{fmtMoney(f.totalRaised)}</b></td>
                  <td>{f.conversionRate}%</td>
                  <td>{f.createdDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#98A2B3" }}>No forms match these filters.</div>}
        </div>
        <div style={{ padding: "12px 20px", fontSize: 12.5, color: "#98A2B3" }}>Showing {filtered.length} of {MOCK_FORMS.length} forms</div>
      </div>
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

const FORM_TYPES = [
  { id: "story", name: "Full page + form", tag: "Story mode", desc: "A narrative landing page with hero image, goal meter, and a docked giving card — donors never leave your story." },
  { id: "standalone", name: "Standalone / embeddable form", tag: "Page or embed", desc: "A self-contained donation form you can embed inline on any page, or host at its own URL." },
  { id: "modal", name: "Modal embedded form", tag: "Popup overlay", desc: "A “Donate” button on your existing site opens this form in a zero-redirect overlay." },
];

const FORM_DESIGNS = [
  { id: "classic", name: "Classic NXT", brand: "#1B4B8F", desc: "A close visual match to today's Raiser's Edge NXT donation form — familiar for migrating organizations." },
  { id: "zeffy", name: "Zeffy-inspired", brand: "#FF6B4A", desc: "Short, mobile-first, generous white space, minimal fields visible at once." },
  { id: "fundraiseup", name: "FundraiseUp-inspired", brand: "#6D4AFF", desc: "Bold, conversion-optimized styling built for a zero-redirect overlay experience." },
];

const STORY_LAYOUTS = [
  { id: "hero-left", name: "Hero left, sticky give card", grad: "linear-gradient(135deg,#2F5D50,#12241F)", desc: "Large hero image and headline on the left; the giving card docks to the right and follows as visitors scroll." },
  { id: "hero-center", name: "Centered hero", grad: "linear-gradient(135deg,#1D3F35,#3E6E5C)", desc: "Full-width centered headline and hero image above the fold, with the giving card just below." },
  { id: "minimal-narrative", name: "Minimal narrative", grad: "linear-gradient(135deg,#4A6E60,#1D3F35)", desc: "Text-forward storytelling with a smaller hero image and the giving card inline at the end of the story." },
];

const WIZARD_STEP_LABELS = {
  type: "Type", design: "Design", story_layout: "Layout", story_content: "Story",
  gift_types: "Gift types", designations: "Designations", donor_fields: "Donor fields",
  custom_fields: "Custom fields", fee: "Fee coverage", distribution: "Distribution", review: "Review",
};

function wizardSteps(type) {
  if (type === "story") return ["type", "story_layout", "story_content", "gift_types", "designations", "donor_fields", "custom_fields", "fee", "review"];
  if (type) return ["type", "design", "gift_types", "designations", "donor_fields", "custom_fields", "fee", "distribution", "review"];
  return ["type"];
}

function resolvePreview(type, design) {
  if (type === "story") return { templateId: "story", accent: null };
  if (type === "modal") return { templateId: "modal", accent: (FORM_DESIGNS.find((d) => d.id === design) || FORM_DESIGNS[2]).brand };
  if (design === "classic") return { templateId: "classic", accent: null };
  if (design === "zeffy") return { templateId: "minimal", accent: null };
  return { templateId: "modal", accent: FORM_DESIGNS[2].brand };
}

function OptionCards({ options, value, onChange, columns = 1 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 12 }}>
      {options.map((o) => (
        <div key={o.id} onClick={() => onChange(o.id)}
          style={{ border: "2px solid " + (value === o.id ? "#14213D" : "#E4E7EC"), borderRadius: 12, padding: 16, cursor: "pointer", background: value === o.id ? "#FAFBFF" : "#fff" }}>
          {o.grad && <div style={{ height: 64, borderRadius: 8, background: o.grad, marginBottom: 12 }} />}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.name}</div>
            {o.tag && <span className="ge-tag" style={{ flexShrink: 0 }}>{o.tag}</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "#667085", lineHeight: 1.5 }}>{o.desc}</div>
        </div>
      ))}
    </div>
  );
}

function FormBuilder({ formName = "Untitled form", onBack }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [published, setPublished] = useState(false);

  const [type, setType] = useState(null);
  const [design, setDesign] = useState(null);
  const [storyLayout, setStoryLayout] = useState("hero-left");
  const [storyHeadline, setStoryHeadline] = useState("2,400 acres of shoreline are one signature away from being saved.");
  const [goalEnabled, setGoalEnabled] = useState(true);
  const [goalTarget, setGoalTarget] = useState("250000");
  const [ctaText, setCtaText] = useState("Give now");

  const [gt, setGt] = useState({ one_time: true, recurring: true, pledge: true, org_gift: true });
  const [fields, setFields] = useState({ title: true, address: "optional", phone: false, anonymous: true, tribute: true, comments: true, consent: true, ackOptOut: true });
  const [otherFund, setOtherFund] = useState(true);
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [customFieldIds, setCustomFieldIds] = useState([]);
  const [feeCoverDefault, setFeeCoverDefault] = useState(false);
  const [feeCopy, setFeeCopy] = useState("Add a little extra so 100% of my gift reaches you.");
  const [dist, setDist] = useState("both");
  const [slug, setSlug] = useState("spring-appeal");

  const steps = useMemo(() => wizardSteps(type), [type]);
  const stepKey = steps[stepIndex] || "type";
  const allCustomFields = useMemo(() => [
    ...MOCK_DONOR_FIELDS.map((f) => ({ ...f, group: "Donor" })),
    ...MOCK_GIFT_FIELDS.map((f) => ({ ...f, group: "Gift" })),
  ], []);

  function goStepIndex(idx) {
    if (idx >= 0 && idx < steps.length && idx <= maxReached) setStepIndex(idx);
  }
  function goToStep(key) { goStepIndex(steps.indexOf(key)); }
  function next() {
    if ((stepKey === "type" && !type) || (stepKey === "design" && !design)) return;
    const nextIdx = Math.min(steps.length - 1, stepIndex + 1);
    setStepIndex(nextIdx);
    setMaxReached((m) => Math.max(m, nextIdx));
  }
  function back() { setStepIndex((s) => Math.max(0, s - 1)); }
  function toggleCustomField(id) {
    setCustomFieldIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  const { templateId, accent } = type ? resolvePreview(type, design) : { templateId: null, accent: null };
  const enabledFieldCount = Object.values(fields).filter((v) => v === true).length;

  if (published) {
    return (
      <div className="ge-confirm-wrap" style={{ maxWidth: 460, margin: "60px auto" }}>
        <div className="ge-confirm-check">&#10003;</div>
        <h2>{formName === "Untitled form" ? "Your form is live" : `${formName} is live`}</h2>
        <p>This form is now accepting gifts using the configuration you just set up. You can come back and edit it any time from the Forms list.</p>
        <button className="ge-btn ge-btn-primary" onClick={onBack}>Back to Forms</button>
      </div>
    );
  }

  return (
    <div>
      {onBack && <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ marginBottom: 18 }} onClick={onBack}>&larr; All forms</button>}
      <div className="ge-page-head">
        <div className="ge-eyebrow">Admin Console</div>
        <h1>Form builder — {formName}</h1>
        <p>Configure this form step by step — type, design, gift options, and fields — then review everything before publishing.</p>
      </div>

      <div className="ge-onb-steps" style={{ marginBottom: 26, flexWrap: "wrap", rowGap: 14 }}>
        {steps.map((key, i) => (
          <React.Fragment key={key}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: i <= maxReached ? "pointer" : "default" }} onClick={() => goStepIndex(i)}>
              <div className={"ge-onb-step-dot " + (i < stepIndex ? "done" : i === stepIndex ? "current" : "")}>{i < stepIndex ? "✓" : i + 1}</div>
              <div style={{ fontSize: 10.5, color: "#98A2B3", fontWeight: 600, whiteSpace: "nowrap" }}>{WIZARD_STEP_LABELS[key]}</div>
            </div>
            {i < steps.length - 1 && <div className={"ge-onb-step-line " + (i < stepIndex ? "done" : "")} style={{ minWidth: 16 }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="ge-formbuilder-grid">
        <div>
          <div className="ge-card ge-card-pad ge-field-group">
            {stepKey === "type" && (
              <React.Fragment>
                <h3>What type of form is this?</h3>
                <OptionCards options={FORM_TYPES} value={type} onChange={setType} />
              </React.Fragment>
            )}

            {stepKey === "design" && (
              <React.Fragment>
                <h3>Choose a design</h3>
                <OptionCards options={FORM_DESIGNS} value={design} onChange={setDesign} columns={3} />
              </React.Fragment>
            )}

            {stepKey === "story_layout" && (
              <React.Fragment>
                <h3>Choose a story layout</h3>
                <OptionCards options={STORY_LAYOUTS} value={storyLayout} onChange={setStoryLayout} columns={3} />
              </React.Fragment>
            )}

            {stepKey === "story_content" && (
              <React.Fragment>
                <h3>Tell your story</h3>
                <div style={{ marginBottom: 14 }}>
                  <label className="ge-label">Headline</label>
                  <input className="ge-input" value={storyHeadline} onChange={(e) => setStoryHeadline(e.target.value)} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="ge-label">Hero image</label>
                  <div className="ge-doc-drop">Drag an image here, or click to upload</div>
                </div>
                <FieldRow label="Show fundraising goal meter"><Toggle on={goalEnabled} onClick={() => setGoalEnabled((v) => !v)} /></FieldRow>
                {goalEnabled && (
                  <div style={{ marginTop: 10, marginBottom: 4 }}>
                    <label className="ge-label">Goal amount</label>
                    <input className="ge-input" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value.replace(/[^0-9]/g, ""))} />
                  </div>
                )}
                <div style={{ marginTop: 14 }}>
                  <label className="ge-label">Give button text</label>
                  <input className="ge-input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
                </div>
                <div style={{ marginTop: 14 }}>
                  <label className="ge-label">Hosted page URL</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13.5, color: "#98A2B3" }}>give.riverbendhumane.org/</span>
                    <input className="ge-input" style={{ width: 160 }} value={slug} onChange={(e) => setSlug(e.target.value)} />
                  </div>
                </div>
              </React.Fragment>
            )}

            {stepKey === "gift_types" && (
              <React.Fragment>
                <h3>Gift types</h3>
                <FieldRow label="One-time gifts"><Toggle on={gt.one_time} onClick={() => setGt((s) => ({ ...s, one_time: !s.one_time }))} /></FieldRow>
                <FieldRow label="Recurring gifts"><Toggle on={gt.recurring} onClick={() => setGt((s) => ({ ...s, recurring: !s.recurring }))} /></FieldRow>
                <FieldRow label="Pledge payments" desc="Donor looks up an existing RE NXT pledge and pays it down"><Toggle on={gt.pledge} onClick={() => setGt((s) => ({ ...s, pledge: !s.pledge }))} /></FieldRow>
                <FieldRow label="Organization / business gifts"><Toggle on={gt.org_gift} onClick={() => setGt((s) => ({ ...s, org_gift: !s.org_gift }))} /></FieldRow>
              </React.Fragment>
            )}

            {stepKey === "designations" && (
              <React.Fragment>
                <h3>Designations</h3>
                <FieldRow label="Allow “Other” write-in fund" desc="Reveals a required free-text field only when selected"><Toggle on={otherFund} onClick={() => setOtherFund((v) => !v)} /></FieldRow>
                <FieldRow label="Allow donors to split gifts across designations" desc="Available on every form type and design"><Toggle on={splitEnabled} onClick={() => setSplitEnabled((v) => !v)} /></FieldRow>
              </React.Fragment>
            )}

            {stepKey === "donor_fields" && (
              <React.Fragment>
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
              </React.Fragment>
            )}

            {stepKey === "custom_fields" && (
              <React.Fragment>
                <h3>Custom fields</h3>
                <p style={{ fontSize: 12.5, color: "#98A2B3", margin: "0 0 14px" }}>Optional. These are configured in Settings → General — turn any of them on to include as a field on this form.</p>
                {["Donor", "Gift"].map((group) => (
                  <div key={group} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "#98A2B3", marginBottom: 6 }}>{group} fields</div>
                    {allCustomFields.filter((f) => f.group === group).map((f) => (
                      <FieldRow key={f.id} label={f.name} desc={f.type}>
                        <Toggle on={customFieldIds.includes(f.id)} onClick={() => toggleCustomField(f.id)} />
                      </FieldRow>
                    ))}
                  </div>
                ))}
              </React.Fragment>
            )}

            {stepKey === "fee" && (
              <React.Fragment>
                <h3>Fee coverage (Donor Cover)</h3>
                <FieldRow label="Pre-check fee coverage by default" desc="Product default is unchecked (opt-in) per idea RENXT-I-5533"><Toggle on={feeCoverDefault} onClick={() => setFeeCoverDefault((v) => !v)} /></FieldRow>
                <div style={{ marginTop: 10 }}>
                  <label className="ge-label">Disclosure copy</label>
                  <input className="ge-input" value={feeCopy} onChange={(e) => setFeeCopy(e.target.value)} />
                </div>
              </React.Fragment>
            )}

            {stepKey === "distribution" && (
              <React.Fragment>
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
              </React.Fragment>
            )}

            {stepKey === "review" && (
              <React.Fragment>
                <h3>Review &amp; publish</h3>
                {[
                  ["Type", (FORM_TYPES.find((t) => t.id === type) || {}).name, "type"],
                  type === "story"
                    ? ["Layout", (STORY_LAYOUTS.find((l) => l.id === storyLayout) || {}).name, "story_layout"]
                    : ["Design", (FORM_DESIGNS.find((d) => d.id === design) || {}).name, "design"],
                  ...(type === "story" ? [["Story", `“${storyHeadline}”${goalEnabled ? ` · Goal ${fmtMoney(Number(goalTarget) || 0)}` : ""}`, "story_content"]] : []),
                  ["Gift types", Object.entries(gt).filter(([, v]) => v).map(([k]) => ({ one_time: "One-time", recurring: "Recurring", pledge: "Pledge payments", org_gift: "Org gifts" }[k])).join(", ") || "None selected", "gift_types"],
                  ["Designations", (otherFund ? "“Other” fund allowed" : "No “Other” fund") + " · " + (splitEnabled ? "Split gifts allowed" : "Split gifts off"), "designations"],
                  ["Donor fields", enabledFieldCount + " optional field" + (enabledFieldCount === 1 ? "" : "s") + " on · address " + fields.address, "donor_fields"],
                  ["Custom fields", customFieldIds.length ? allCustomFields.filter((f) => customFieldIds.includes(f.id)).map((f) => f.name).join(", ") : "None added", "custom_fields"],
                  ["Fee coverage", feeCoverDefault ? "Pre-checked by default" : "Opt-in (unchecked by default)", "fee"],
                  ...(type !== "story" ? [["Distribution", { embed: "Embedded only", hosted: "Hosted page only", both: "Embedded + hosted page" }[dist] + (dist !== "embed" ? ` · give.riverbendhumane.org/${slug}` : ""), "distribution"]] : []),
                ].map(([k, v, jumpKey]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5, gap: 12 }}>
                    <span style={{ color: "#98A2B3", flexShrink: 0 }}>{k}</span>
                    <span style={{ fontWeight: 600, textAlign: "right" }}>{v}</span>
                    <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ flexShrink: 0 }} onClick={() => goToStep(jumpKey)}>Edit</button>
                  </div>
                ))}
              </React.Fragment>
            )}
          </div>

          <div className="ge-onb-foot">
            <button className="ge-btn ge-btn-ghost" onClick={back} disabled={stepIndex === 0} style={{ opacity: stepIndex === 0 ? 0.4 : 1 }}>Back</button>
            {stepKey === "review"
              ? <button className="ge-btn ge-btn-primary" onClick={() => setPublished(true)}>Publish form</button>
              : <button className="ge-btn ge-btn-primary" onClick={next} disabled={(stepKey === "type" && !type) || (stepKey === "design" && !design)}>Continue</button>}
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="ge-card ge-card-pad">
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 6px" }}>Live preview</h3>
            <p style={{ fontSize: 12.5, color: "#98A2B3", margin: "0 0 12px" }}>
              {templateId ? "This config, rendered in the closest matching template." : "Choose a form type to see a live preview."}
            </p>
            {templateId ? (
              <React.Fragment>
                <div style={{ border: "1px solid #E4E7EC", borderRadius: 10, overflow: "hidden", transform: "scale(0.86)", transformOrigin: "top left", width: "116%", height: 340 }}>
                  <div style={{ height: 340, overflow: "hidden" }}>
                    {accent
                      ? React.createElement(TEMPLATE_COMPONENTS[templateId], { org: ORGS[templateId], key: templateId + design, accent })
                      : React.createElement(TEMPLATE_COMPONENTS[templateId], { org: ORGS[templateId], key: templateId })}
                  </div>
                </div>
                {type === "story" && <p style={{ fontSize: 11.5, color: "#98A2B3", margin: "10px 0 0" }}>Previewing the {(STORY_LAYOUTS.find((l) => l.id === storyLayout) || {}).name} layout.</p>}
              </React.Fragment>
            ) : (
              <div style={{ height: 200, borderRadius: 10, border: "1.5px dashed #D0D5DD", display: "flex", alignItems: "center", justifyContent: "center", color: "#98A2B3", fontSize: 13 }}>No preview yet</div>
            )}
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
        <div className="ge-eyebrow">Settings</div>
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
        <div className="ge-eyebrow">Settings</div>
        <h1>Payments</h1>
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

/* ============================================================
   SECURITY
   ============================================================ */
function SecuritySettings() {
  const [require2fa, setRequire2fa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [ipAllowlist, setIpAllowlist] = useState(true);
  const auditLog = [
    { id: 1, event: "Signed in", user: "kurt@riverbendhumane.org", ip: "73.14.201.9", time: "2026-08-14 09:12" },
    { id: 2, event: "API key regenerated", user: "admin@riverbendhumane.org", ip: "73.14.201.9", time: "2026-08-12 15:44" },
    { id: 3, event: "Form published: Spring Appeal", user: "kurt@riverbendhumane.org", ip: "73.14.201.9", time: "2026-08-10 11:03" },
    { id: 4, event: "Signed in", user: "admin@riverbendhumane.org", ip: "204.15.66.2", time: "2026-08-08 08:27" },
    { id: 5, event: "Payout bank account updated", user: "kurt@riverbendhumane.org", ip: "73.14.201.9", time: "2026-08-01 14:52" },
  ];

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Settings</div>
        <h1>Security</h1>
        <p>Access controls and activity for your Giving Engine admin console.</p>
      </div>
      <div className="ge-formbuilder-grid">
        <div>
          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Access controls</h3>
            <FieldRow label="Require two-factor authentication" desc="Applies to every admin user on this account"><Toggle on={require2fa} onClick={() => setRequire2fa((v) => !v)} /></FieldRow>
            <FieldRow label="Restrict admin console to allowed IPs" desc="Only requests from the list below may sign in"><Toggle on={ipAllowlist} onClick={() => setIpAllowlist((v) => !v)} /></FieldRow>
            <FieldRow label="Session timeout">
              <select className="ge-select" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="480">8 hours</option>
              </select>
            </FieldRow>
          </div>

          {ipAllowlist && (
            <div className="ge-card ge-card-pad ge-field-group">
              <h3>Allowed IP addresses</h3>
              {["73.14.201.9/32", "204.15.66.0/24"].map((ip) => (
                <div key={ip} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F0F2F5" }}>
                  <span className="ge-mono">{ip}</span>
                  <button className="ge-btn ge-btn-ghost ge-btn-sm">Remove</button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <input className="ge-input" placeholder="e.g. 198.51.100.4/32" />
                <button className="ge-btn ge-btn-ghost ge-btn-sm">Add</button>
              </div>
            </div>
          )}

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Recent activity</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="ge-table">
                <thead><tr><th>Event</th><th>User</th><th>IP address</th><th>Time</th></tr></thead>
                <tbody>
                  {auditLog.map((a) => (
                    <tr key={a.id}><td>{a.event}</td><td>{a.user}</td><td className="ge-mono">{a.ip}</td><td>{a.time}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="ge-card ge-card-pad">
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 10px" }}>Payment data handling</h3>
            <p style={{ fontSize: 12.5, color: "#667085", lineHeight: 1.6, margin: 0 }}>
              Card and bank details are tokenized directly by Rainforest and never touch Giving Engine servers. Your account qualifies for PCI SAQ A, the lightest self-assessment tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FUNDRAISING
   ============================================================ */
function FundraisingSettings() {
  const [tab, setTab] = useState("funds");
  const [importing, setImporting] = useState(false);
  const [funds, setFunds] = useState(MOCK_FUNDS);
  const [campaigns, setCampaigns] = useState(MOCK_CAMPAIGNS);
  const [appeals, setAppeals] = useState(MOCK_APPEALS);

  function importFromRE() {
    setImporting(true);
    setTimeout(() => {
      setImporting(false);
      if (tab === "funds") setFunds((f) => [...f, { id: "imp" + Date.now(), name: "Wildlife Rescue Fund", code: "WLD-009", active: true }]);
      if (tab === "campaigns") setCampaigns((c) => [...c, { id: "imp" + Date.now(), name: "Emergency Response Fund", code: "CAM-EMR-01", active: true, goal: 40000 }]);
      if (tab === "appeals") setAppeals((a) => [...a, { id: "imp" + Date.now(), name: "Email Appeal — June", code: "APL-2026-JUN", active: true }]);
    }, 1100);
  }

  const rows = tab === "funds" ? funds : tab === "campaigns" ? campaigns : appeals;
  function toggleActive(id) {
    const setter = tab === "funds" ? setFunds : tab === "campaigns" ? setCampaigns : setAppeals;
    setter((list) => list.map((r) => r.id === id ? { ...r, active: !r.active } : r));
  }

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Settings</div>
        <h1>Fundraising</h1>
        <p>Funds, campaigns, and appeals available across every donation form. Pull these directly from Raiser's Edge NXT to keep them in sync.</p>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div className="ge-radiogroup">
          {[["funds", "Funds & designations"], ["campaigns", "Campaigns"], ["appeals", "Appeals"]].map(([v, l]) => (
            <button key={v} className={tab === v ? "on" : ""} onClick={() => setTab(v)}>{l}</button>
          ))}
        </div>
        <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={importFromRE} disabled={importing}>
          {importing ? "Importing…" : "⟳ Pull from Raiser's Edge NXT"}
        </button>
      </div>

      <div className="ge-card">
        <div style={{ overflowX: "auto" }}>
          <table className="ge-table">
            <thead>
              <tr>
                <th>Name</th><th>RE NXT code</th>{tab === "campaigns" && <th>Goal</th>}<th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.name}</b></td>
                  <td className="ge-mono">{r.code}</td>
                  {tab === "campaigns" && <td>{fmtMoney(r.goal)}</td>}
                  <td><span className={"ge-pill " + (r.active ? "ge-pill-settled" : "ge-pill-refunded")}>{r.active ? "Active" : "Inactive"}</span></td>
                  <td style={{ textAlign: "right" }}><button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={() => toggleActive(r.id)}>{r.active ? "Deactivate" : "Activate"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "12px 20px", fontSize: 12.5, color: "#98A2B3" }}>{rows.length} {tab === "funds" ? "funds" : tab}</div>
      </div>
    </div>
  );
}

/* ============================================================
   GENERAL
   ============================================================ */
function CustomFieldsCard() {
  const [tab, setTab] = useState("donor");
  const [donorFields, setDonorFields] = useState(MOCK_DONOR_FIELDS);
  const [giftFields, setGiftFields] = useState(MOCK_GIFT_FIELDS);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Text");

  const fields = tab === "donor" ? donorFields : giftFields;
  const setFields = tab === "donor" ? setDonorFields : setGiftFields;

  function toggle(id, key) {
    setFields((list) => list.map((f) => f.id === id ? { ...f, [key]: !f[key] } : f));
  }
  function addField() {
    if (!newName.trim()) return;
    setFields((list) => [...list, { id: tab + Date.now(), name: newName, type: newType, syncRE: false, onForms: false }]);
    setNewName("");
  }

  return (
    <div className="ge-card ge-card-pad ge-field-group">
      <h3>Custom fields</h3>
      <div className="ge-radiogroup" style={{ marginBottom: 14 }}>
        {[["donor", "Donor fields"], ["gift", "Gift fields"]].map(([v, l]) => (
          <button key={v} className={tab === v ? "on" : ""} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>
      {fields.map((f) => (
        <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F2F5", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{f.name}</div>
            <div style={{ fontSize: 12, color: "#98A2B3" }}>{f.type}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#667085" }}>Sync to RE NXT<Toggle on={f.syncRE} onClick={() => toggle(f.id, "syncRE")} /></label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#667085" }}>On forms<Toggle on={f.onForms} onClick={() => toggle(f.id, "onForms")} /></label>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <input className="ge-input" placeholder="New field name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <select className="ge-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
          {["Text", "Number", "Date", "Dropdown", "Checkbox"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={addField}>+ Add field</button>
      </div>
    </div>
  );
}

function DomainsCard() {
  const [domains] = useState([
    { id: 1, domain: "give.riverbendhumane.org", status: "verified", primary: true },
    { id: 2, domain: "donate.riverbendhumane.org", status: "pending", primary: false },
  ]);
  const dns = [
    { type: "TXT", host: "give.riverbendhumane.org", value: "v=spf1 include:_spf.givingengine.com ~all", status: "verified" },
    { type: "CNAME", host: "em.give.riverbendhumane.org", value: "mail.givingengine.com", status: "verified" },
    { type: "TXT", host: "_dmarc.riverbendhumane.org", value: "v=DMARC1; p=quarantine;", status: "pending" },
  ];
  return (
    <div className="ge-card ge-card-pad ge-field-group">
      <h3>Linked domains</h3>
      {domains.map((d) => (
        <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #F0F2F5" }}>
          <div>
            <span className="ge-mono">{d.domain}</span>{d.primary && <span className="ge-tag" style={{ marginLeft: 8 }}>Primary</span>}
          </div>
          <span className={"ge-pill " + (d.status === "verified" ? "ge-pill-settled" : "ge-pill-pending")}>{d.status === "verified" ? "Verified" : "Pending"}</span>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 20 }}>
        <input className="ge-input" placeholder="e.g. donate.yourorg.org" />
        <button className="ge-btn ge-btn-ghost ge-btn-sm">Add domain</button>
      </div>

      <h3>Email DNS records</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="ge-table">
          <thead><tr><th>Type</th><th>Host</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>
            {dns.map((r, i) => (
              <tr key={i}>
                <td>{r.type}</td>
                <td className="ge-mono">{r.host}</td>
                <td className="ge-mono" style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.value}</td>
                <td><span className={"ge-pill " + (r.status === "verified" ? "ge-pill-settled" : "ge-pill-pending")}>{r.status === "verified" ? "Verified" : "Pending"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GeneralPreferencesCard() {
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en-US");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  return (
    <div className="ge-card ge-card-pad ge-field-group">
      <h3>Basic settings</h3>
      <FieldRow label="Currency">
        <select className="ge-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
          {["USD", "CAD", "GBP", "EUR", "AUD"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </FieldRow>
      <FieldRow label="Language">
        <select className="ge-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </FieldRow>
      <FieldRow label="Date format">
        <select className="ge-select" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </FieldRow>
    </div>
  );
}

function GeneralSettings() {
  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Settings</div>
        <h1>General</h1>
        <p>Custom fields, linked domains, and basic account preferences.</p>
      </div>
      <div className="ge-formbuilder-grid">
        <div>
          <CustomFieldsCard />
          <DomainsCard />
        </div>
        <div style={{ position: "sticky", top: 20 }}>
          <GeneralPreferencesCard />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INTEGRATIONS
   ============================================================ */
function IntegrationsSettings() {
  const [connected, setConnected] = useState(true);
  const [env, setEnv] = useState("sandbox");
  const [clientId, setClientId] = useState("ge-client-8827kj");
  const [clientSecret, setClientSecret] = useState("sk_live_9f2a7c1e4b6d8f30");
  const [showSecret, setShowSecret] = useState(false);
  const [orgId, setOrgId] = useState("00d5f000-riverbend");
  const [syncMode, setSyncMode] = useState("batch");
  const [batchTemplate, setBatchTemplate] = useState("GE-{form_name}-{date}");
  const [batchFreq, setBatchFreq] = useState("daily");
  const [batchGroup, setBatchGroup] = useState("form");

  const batchPreview = batchTemplate
    .replace("{form_name}", "Spring-Appeal")
    .replace("{date}", new Date().toISOString().slice(0, 10))
    .replace("{fund}", "General");

  return (
    <div>
      <div className="ge-page-head">
        <div className="ge-eyebrow">Settings</div>
        <h1>Integrations</h1>
        <p>Connect Giving Engine to Raiser's Edge NXT to sync gifts and constituents automatically.</p>
      </div>

      <div className="ge-formbuilder-grid">
        <div>
          <div className="ge-card ge-card-pad ge-field-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Raiser's Edge NXT</h3>
              <span className={"ge-pill " + (connected ? "ge-pill-settled" : "ge-pill-refunded")}>{connected ? "Connected" : "Not connected"}</span>
            </div>
            <FieldRow label="Environment">
              <div className="ge-radiogroup">
                {[["sandbox", "Sandbox"], ["production", "Production"]].map(([v, l]) => (
                  <button key={v} className={env === v ? "on" : ""} onClick={() => setEnv(v)}>{l}</button>
                ))}
              </div>
            </FieldRow>
            <div style={{ marginTop: 14 }}>
              <label className="ge-label">Organization ID</label>
              <input className="ge-input" value={orgId} onChange={(e) => setOrgId(e.target.value)} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="ge-label">Client ID</label>
              <input className="ge-input" value={clientId} onChange={(e) => setClientId(e.target.value)} />
            </div>
            <div style={{ marginTop: 14 }}>
              <label className="ge-label">Client secret</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ge-input" type={showSecret ? "text" : "password"} value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} />
                <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={() => setShowSecret((v) => !v)}>{showSecret ? "Hide" : "Show"}</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
              <button className="ge-btn ge-btn-primary ge-btn-sm" onClick={() => setConnected(true)}>{connected ? "Reconnect" : "Connect"}</button>
              {connected && <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={() => setConnected(false)}>Disconnect</button>}
            </div>
          </div>

          <div className="ge-card ge-card-pad ge-field-group">
            <h3>Gift sync mode</h3>
            <FieldRow label="How gifts are written to RE NXT">
              <div className="ge-radiogroup">
                {[["direct", "Direct insert"], ["batch", "Batch insert"]].map(([v, l]) => (
                  <button key={v} className={syncMode === v ? "on" : ""} onClick={() => setSyncMode(v)}>{l}</button>
                ))}
              </div>
            </FieldRow>
            <p style={{ fontSize: 12.5, color: "#98A2B3", margin: "4px 0 0" }}>
              {syncMode === "direct"
                ? "Each settled gift is written to RE NXT immediately as its own transaction."
                : "Settled gifts are grouped into RE NXT batches on the schedule below, then committed together."}
            </p>

            {syncMode === "batch" && (
              <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #F0F2F5" }}>
                <div style={{ marginBottom: 14 }}>
                  <label className="ge-label">Batch name template</label>
                  <input className="ge-input" value={batchTemplate} onChange={(e) => setBatchTemplate(e.target.value)} />
                  <div style={{ fontSize: 12, color: "#98A2B3", marginTop: 6 }}>Available tokens: <span className="ge-mono">{"{form_name}"}</span>, <span className="ge-mono">{"{date}"}</span>, <span className="ge-mono">{"{fund}"}</span></div>
                </div>
                <FieldRow label="Create a new batch">
                  <select className="ge-select" value={batchFreq} onChange={(e) => setBatchFreq(e.target.value)}>
                    <option value="realtime">Continuously (near real-time)</option>
                    <option value="hourly">Every hour</option>
                    <option value="daily">Once a day</option>
                    <option value="manual">Manually only</option>
                  </select>
                </FieldRow>
                <FieldRow label="Group gifts into batches by" desc="Determines how many separate batches are created per run">
                  <select className="ge-select" value={batchGroup} onChange={(e) => setBatchGroup(e.target.value)}>
                    <option value="single">Single batch</option>
                    <option value="form">Form</option>
                    <option value="fund">Fund / designation</option>
                    <option value="day">Gift date</option>
                  </select>
                </FieldRow>
                <div style={{ background: "#F5F6F8", borderRadius: 8, padding: "10px 14px", fontSize: 12.5, color: "#475467", marginTop: 6 }}>
                  Next batch name preview: <span className="ge-mono" style={{ fontWeight: 700 }}>{batchPreview}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ position: "sticky", top: 20 }}>
          <div className="ge-card ge-card-pad">
            <h3 style={{ fontFamily: "Sora, sans-serif", fontSize: 14.5, margin: "0 0 10px" }}>Last sync</h3>
            {[["Status", "Success"], ["Gifts synced", "212 of 214"], ["Last run", "2026-08-14 06:00"], ["Next run", batchFreq === "manual" ? "Manual only" : "2026-08-15 06:00"]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5 }}>
                <span style={{ color: "#98A2B3" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <button className="ge-btn ge-btn-ghost ge-btn-sm" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}>Run sync now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
