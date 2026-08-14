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
