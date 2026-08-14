/* ============================================================
   SHARED CONFIRMATION PANEL
   ============================================================ */
function ConfirmPanel({ checkout, org, accent, label }) {
  const amt = checkout.total;
  return (
    <div className="ge-confirm-wrap">
      <div className="ge-confirm-check" style={{ background: accent || "#16A34A" }}>&#10003;</div>
      <h2>Thank you, {checkout.firstName || "friend"}!</h2>
      <div className="ge-confirm-amt" style={{ color: accent }}>{fmtMoney(amt)}</div>
      <p>
        Your {FREQ_LABEL[checkout.frequency].toLowerCase()} gift to {org.name} is complete.
        A receipt has been emailed to {checkout.email || "your inbox"}.
        {checkout.frequency !== "one_time" ? " Your first installment processes immediately." : ""}
      </p>
      <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={checkout.reset}>Make another gift</button>
    </div>
  );
}

function ProgressDots({ step, count = 3, color }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i < step ? color : "#E4E7EC" }} />
      ))}
    </div>
  );
}

/* ============================================================
   1. CLASSIC NXT
   ============================================================ */
function ClassicNXT({ org }) {
  const c = useCheckout(org);
  const other = org.designations.find((d) => d.id === "other");
  return (
    <div className="tmpl-classic">
      <div className="wrap">
        <div className="hdr">
          <div className="logo">{org.initials}</div>
          <div><h1>{org.name}</h1><p>Secure Online Giving</p></div>
        </div>
        <div className="progress">
          {[1, 2, 3].map((n) => <div key={n} className={c.step >= n ? "on" : ""} />)}
        </div>
        <div className="body">
          {c.step === 1 && (
            <React.Fragment>
              <div className="field-block">
                <label className="section-label">Designation</label>
                <select value={c.designationId} onChange={(e) => c.setDesignationId(e.target.value)}>
                  {org.designations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {other && c.designationId === "other" && (
                  <input type="text" placeholder="Please specify a fund" style={{ marginTop: 10 }}
                    value={c.otherText} onChange={(e) => c.setOtherText(e.target.value)} />
                )}
              </div>
              <div className="field-block">
                <label className="section-label">Gift amount</label>
                <div className="amount-grid">
                  {org.amounts.map((a) => (
                    <button key={a} className={"amount-btn" + (!c.customAmount && c.amount === a ? " on" : "")}
                      onClick={() => { c.setAmount(a); c.setCustomAmount(""); }}>{fmtMoney(a)}</button>
                  ))}
                </div>
                <input type="text" placeholder="Other amount" style={{ marginTop: 10 }}
                  value={c.customAmount} onChange={(e) => c.setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} />
                <div className="freq-row">
                  {Object.keys(FREQ_LABEL).map((f) => (
                    <button key={f} className={c.frequency === f ? "on" : ""} onClick={() => c.setFrequency(f)}>{FREQ_LABEL[f]}</button>
                  ))}
                </div>
                {c.frequency !== "one_time" && <div className="foot-note">Your first gift will process immediately.</div>}
              </div>
              <button className="submit-btn" onClick={c.goNext}>Continue</button>
            </React.Fragment>
          )}
          {c.step === 2 && (
            <React.Fragment>
              <div className="field-block">
                <label className="section-label">Donor information</label>
                <div className="row2">
                  <div><span className="fieldlabel">First name *</span><input type="text" value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} /></div>
                  <div><span className="fieldlabel">Last name *</span><input type="text" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} /></div>
                </div>
                <span className="fieldlabel" style={{ marginTop: 10 }}>Email *</span>
                <input type="email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} />
                <label className="checkline"><input type="checkbox" checked={c.anonymous} onChange={(e) => c.setAnonymous(e.target.checked)} /> Make this gift anonymous</label>
                <label className="checkline"><input type="checkbox" checked={c.tributeOn} onChange={(e) => c.setTributeOn(e.target.checked)} /> Give in honor or memory of someone</label>
                {c.tributeOn && (
                  <div className="row2" style={{ marginTop: 8 }}>
                    <input type="text" placeholder="Honoree first name" />
                    <input type="text" placeholder="Honoree last name" />
                  </div>
                )}
              </div>
              <div className="field-block">
                <label className="section-label">Payment</label>
                <input type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                <div className="row2" style={{ marginTop: 8 }}>
                  <input type="text" placeholder="MM / YY" defaultValue="04 / 29" />
                  <input type="text" placeholder="CVC" defaultValue="123" />
                </div>
                <label className="checkline"><input type="checkbox" checked={c.feeCover} onChange={(e) => c.setFeeCover(e.target.checked)} /> Add {fmtMoney(Math.round(c.chosenAmount * 0.029 + 0.3))} so 100% of my gift reaches {org.name}</label>
              </div>
              <button className="submit-btn" onClick={c.submit} disabled={c.submitting}>
                {c.submitting ? "Processing\u2026" : `Give ${fmtMoney(c.total)} now`}
              </button>
              <div className="foot-note" onClick={c.goBack} style={{ cursor: "pointer" }}>&larr; Back</div>
            </React.Fragment>
          )}
          {c.step === 3 && <ConfirmPanel checkout={c} org={org} accent="#1B4B8F" />}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   2. MINIMAL CHECKOUT
   ============================================================ */
function MinimalCheckout({ org }) {
  const c = useCheckout(org);
  return (
    <div className="tmpl-minimal">
      <div className="wrap">
        <div className="badge">{org.initials}</div>
        <ProgressDots step={c.step} color="#FF6B4A" />
        {c.step === 1 && (
          <React.Fragment>
            <h1>Support {org.name}</h1>
            <p className="sub">Every gift helps a young person in our community.</p>
            <div className="freq-pill-row">
              {["one_time", "monthly"].map((f) => (
                <button key={f} className={c.frequency === f ? "on" : ""} onClick={() => c.setFrequency(f)}>{FREQ_LABEL[f]} gift</button>
              ))}
            </div>
            <div className="amount-grid">
              {org.amounts.map((a) => (
                <button key={a} className={"amount-btn" + (!c.customAmount && c.amount === a ? " on" : "")}
                  onClick={() => { c.setAmount(a); c.setCustomAmount(""); }}>{fmtMoney(a)}</button>
              ))}
            </div>
            <input type="text" placeholder="Custom amount" value={c.customAmount}
              onChange={(e) => c.setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} />
            <select value={c.designationId} onChange={(e) => c.setDesignationId(e.target.value)}>
              {org.designations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <button className="submit-btn" onClick={c.goNext}>Continue &rarr;</button>
          </React.Fragment>
        )}
        {c.step === 2 && (
          <React.Fragment>
            <h1>Almost there</h1>
            <p className="sub">{fmtMoney(c.chosenAmount)} {FREQ_LABEL[c.frequency].toLowerCase()} to {org.name}</p>
            <input type="text" placeholder="First name" value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} />
            <input type="text" placeholder="Last name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} />
            <input type="email" placeholder="Email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} />
            <input type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
            <label className="checkline"><input type="checkbox" checked={c.feeCover} onChange={(e) => c.setFeeCover(e.target.checked)} /> Cover the {fmtMoney(Math.round(c.chosenAmount * 0.029 + 0.3))} processing fee</label>
            <button className="submit-btn" onClick={c.submit} disabled={c.submitting}>
              {c.submitting ? "Processing\u2026" : `Donate ${fmtMoney(c.total)}`}
            </button>
            <div className="trust-row" onClick={c.goBack} style={{ cursor: "pointer" }}>&larr; BACK &nbsp; · &nbsp; SECURE CHECKOUT</div>
          </React.Fragment>
        )}
        {c.step === 3 && <ConfirmPanel checkout={c} org={org} accent="#FF6B4A" />}
      </div>
    </div>
  );
}

/* ============================================================
   3. STORY PAGE
   ============================================================ */
function StoryPage({ org }) {
  const c = useCheckout(org);
  const pct = Math.min(100, Math.round((org.goal.raised / org.goal.target) * 100));
  return (
    <div className="tmpl-story">
      <div className="hero">
        <div className="hero-inner">
          <div className="eyebrow">Protect the Coastline Campaign</div>
          <h1>2,400 acres of shoreline are one signature away from being saved.</h1>
          <p className="lead">Your gift funds land acquisition, trail restoration, and the conservation easements that keep this coastline wild for good.</p>
        </div>
      </div>
      <div className="content-grid">
        <div>
          <div className="goal-card">
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#5B6B62", fontWeight: 700 }}>
              <span>CAMPAIGN PROGRESS</span><span>{pct}%</span>
            </div>
            <div className="goal-bar-track"><div className="goal-bar-fill" style={{ width: pct + "%" }} /></div>
            <div className="goal-nums"><span><b>{fmtMoney(org.goal.raised)}</b> raised</span><span>Goal: {fmtMoney(org.goal.target)}</span></div>
          </div>
          <div className="story-body">
            <h3>Why this land matters</h3>
            <p>The Munro Point shoreline is one of the last undeveloped stretches on the coast, home to nesting shorebirds and a salt marsh that buffers three neighborhoods from storm surge. Coastal Land Trust has an option to purchase, but it expires this fall.</p>
            <h3>Where your gift goes</h3>
            <p>Gifts to the Conservation Fund go directly toward the purchase price and legal costs of permanent easements. Gifts to Trail Restoration keep the 6 miles of public trail already open to visitors in good repair.</p>
          </div>
        </div>
        <div className="give-card">
          {c.step === 1 && (
            <React.Fragment>
              <h2>Make a gift</h2>
              <div className="designation-list">
                {org.designations.map((d) => (
                  <div key={d.id} className={"desig-opt" + (c.designationId === d.id ? " on" : "")}
                    onClick={() => c.setDesignationId(d.id)}>{d.name}</div>
                ))}
              </div>
              <div className="amount-grid">
                {org.amounts.map((a) => (
                  <button key={a} className={"amount-btn" + (!c.customAmount && c.amount === a ? " on" : "")}
                    onClick={() => { c.setAmount(a); c.setCustomAmount(""); }}>{fmtMoney(a)}</button>
                ))}
              </div>
              <input type="text" placeholder="Custom amount" value={c.customAmount}
                onChange={(e) => c.setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} />
              <div className="freq-row">
                {["one_time", "monthly", "annual"].map((f) => (
                  <button key={f} className={c.frequency === f ? "on" : ""} onClick={() => c.setFrequency(f)}>{FREQ_LABEL[f]}</button>
                ))}
              </div>
              <button className="submit-btn" onClick={c.goNext}>Continue</button>
            </React.Fragment>
          )}
          {c.step === 2 && (
            <React.Fragment>
              <h2>Your details</h2>
              <input type="text" placeholder="First name" value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} />
              <input type="text" placeholder="Last name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} />
              <input type="email" placeholder="Email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} />
              <input type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <button className="submit-btn" onClick={c.submit} disabled={c.submitting}>
                {c.submitting ? "Processing\u2026" : `Give ${fmtMoney(c.chosenAmount)}`}
              </button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12.5, color: "#5B6B62", cursor: "pointer" }} onClick={c.goBack}>&larr; Back</div>
            </React.Fragment>
          )}
          {c.step === 3 && <ConfirmPanel checkout={c} org={org} accent="#2F5D50" />}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   4. MODAL OVERLAY
   ============================================================ */
function ModalOverlay({ org }) {
  const c = useCheckout(org);
  const [open, setOpen] = useState(true);
  return (
    <div className="tmpl-modal-host">
      <div className="tmpl-modal-nav">
        <div className="site-logo">{org.name}</div>
        <button className="tmpl-modal-donate-btn" onClick={() => setOpen(true)}>Donate</button>
      </div>
      <div className="tmpl-modal-hero">
        <h1>Music changes lives. So does your gift.</h1>
        <p>The Symphony's education programs reach 14,000 students a year across the region — entirely funded by gifts like yours.</p>
        <button className="tmpl-modal-donate-btn" onClick={() => setOpen(true)}>Support the Symphony</button>
      </div>
      {open && (
        <div className="tmpl-modal-overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="tmpl-modal-panel">
            <div className="mhdr"><span /><button className="x" onClick={() => setOpen(false)}>&times;</button></div>
            <div className="mbody">
              {c.step === 1 && (
                <React.Fragment>
                  <h2>Give to {org.name}</h2>
                  <div className="wallet-row">
                    <div className="wallet-btn">&#63743; Apple Pay</div>
                    <div className="wallet-btn">G Pay</div>
                  </div>
                  <div className="freq-row">
                    {["one_time", "monthly"].map((f) => (
                      <button key={f} className={c.frequency === f ? "on" : ""} onClick={() => c.setFrequency(f)}>{FREQ_LABEL[f]}</button>
                    ))}
                  </div>
                  <div className="amount-grid">
                    {org.amounts.map((a) => (
                      <button key={a} className={"amount-btn" + (!c.customAmount && c.amount === a ? " on" : "")}
                        onClick={() => { c.setAmount(a); c.setCustomAmount(""); }}>{fmtMoney(a)}</button>
                    ))}
                  </div>
                  <input type="text" placeholder="Other amount" value={c.customAmount}
                    onChange={(e) => c.setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))} />
                  <select value={c.designationId} onChange={(e) => c.setDesignationId(e.target.value)}>
                    {org.designations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button className="submit-btn" onClick={c.goNext}>Continue</button>
                </React.Fragment>
              )}
              {c.step === 2 && (
                <React.Fragment>
                  <h2>Your information</h2>
                  <input type="email" placeholder="Email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} />
                  <input type="text" placeholder="First name" value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} />
                  <input type="text" placeholder="Last name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} />
                  <input type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
                  <button className="submit-btn" onClick={c.submit} disabled={c.submitting}>
                    {c.submitting ? "Processing\u2026" : `Give ${fmtMoney(c.chosenAmount)} now`}
                  </button>
                  <div style={{ textAlign: "center", marginTop: 10, fontSize: 12.5, color: "#6A6086", cursor: "pointer" }} onClick={c.goBack}>&larr; Back</div>
                </React.Fragment>
              )}
              {c.step === 3 && <ConfirmPanel checkout={c} org={org} accent="#6D4AFF" />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   5. SPLIT DESIGNATION
   ============================================================ */
function SplitDesignation({ org }) {
  const c = useCheckout(org);
  const [splitMode, setSplitMode] = useState(false);

  function setAlloc(id, val) {
    c.setSplitAlloc((s) => ({ ...s, [id]: val.replace(/[^0-9]/g, "") }));
  }

  return (
    <div className="tmpl-split">
      <div className="wrap">
        <div className="hdr">
          <h1>{org.name}</h1>
          <p>Direct your gift to one fund, or split it across several.</p>
        </div>
        <div className="body">
          {c.step === 1 && (
            <React.Fragment>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1B2A4A" }}>
                  {splitMode ? "Allocate your gift" : "Choose a fund"}
                </span>
                <button className="ge-btn ge-btn-ghost ge-btn-sm" onClick={() => setSplitMode((v) => !v)}>
                  {splitMode ? "Give to one fund instead" : "Split across multiple funds"}
                </button>
              </div>
              {!splitMode && (
                <div className="desig-table">
                  {org.designations.map((d) => (
                    <div key={d.id} className={"desig-row" + (c.designationId === d.id ? " on" : "")}
                      onClick={() => c.setDesignationId(d.id)} style={{ cursor: "pointer" }}>
                      <div className="name">{d.name}{d.desc && <span>{d.desc}</span>}</div>
                    </div>
                  ))}
                </div>
              )}
              {splitMode && (
                <div className="desig-table">
                  {org.designations.map((d) => (
                    <div key={d.id} className={"desig-row" + (Number(c.splitAlloc[d.id]) > 0 ? " on" : "")}>
                      <div className="name">{d.name}{d.desc && <span>{d.desc}</span>}</div>
                      <input type="number" placeholder="$0" value={c.splitAlloc[d.id] || ""} onChange={(e) => setAlloc(d.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}
              {!splitMode && (
                <div className="amount-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 9, marginBottom: 16 }}>
                  {org.amounts.map((a) => (
                    <button key={a} className={"amount-btn" + (!c.customAmount && c.amount === a ? " on" : "")}
                      style={{ border: "1.5px solid #EFE3D6", borderRadius: 8, padding: "11px 4px", fontWeight: 700, background: (!c.customAmount && c.amount === a) ? "#C1440E" : "#fff", color: (!c.customAmount && c.amount === a) ? "#fff" : "#1B2A4A" }}
                      onClick={() => { c.setAmount(a); c.setCustomAmount(""); }}>{fmtMoney(a)}</button>
                  ))}
                </div>
              )}
              <div className="split-total">
                <span>Total gift</span>
                <span className="amt">{fmtMoney(splitMode ? c.splitTotal : (c.customAmount || c.amount))}</span>
              </div>
              <div className="freq-row">
                {["one_time", "monthly", "quarterly"].map((f) => (
                  <button key={f} className={c.frequency === f ? "on" : ""} onClick={() => c.setFrequency(f)}>{FREQ_LABEL[f]}</button>
                ))}
              </div>
              <button className="submit-btn" onClick={c.goNext}>Continue</button>
            </React.Fragment>
          )}
          {c.step === 2 && (
            <React.Fragment>
              <div className="row2">
                <input type="text" placeholder="First name" value={c.firstName} onChange={(e) => c.setFirstName(e.target.value)} />
                <input type="text" placeholder="Last name" value={c.lastName} onChange={(e) => c.setLastName(e.target.value)} />
              </div>
              <input type="email" placeholder="Email" value={c.email} onChange={(e) => c.setEmail(e.target.value)} />
              <input type="text" placeholder="Card number" defaultValue="4242 4242 4242 4242" />
              <label style={{ display: "flex", gap: 8, fontSize: 13, color: "#5B5347", margin: "6px 0 14px" }}>
                <input type="checkbox" checked={c.feeCover} onChange={(e) => c.setFeeCover(e.target.checked)} />
                Add {fmtMoney(Math.round((splitMode ? c.splitTotal : c.chosenAmount) * 0.029 + 0.3))} to cover processing fees
              </label>
              <button className="submit-btn" onClick={c.submit} disabled={c.submitting}>
                {c.submitting ? "Processing\u2026" : `Give ${fmtMoney(splitMode ? c.splitTotal : c.total)} now`}
              </button>
              <div style={{ textAlign: "center", marginTop: 10, fontSize: 12.5, color: "#8A8578", cursor: "pointer" }} onClick={c.goBack}>&larr; Back</div>
            </React.Fragment>
          )}
          {c.step === 3 && <ConfirmPanel checkout={c} org={org} accent="#C1440E" />}
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_COMPONENTS = {
  classic: ClassicNXT, minimal: MinimalCheckout, story: StoryPage, modal: ModalOverlay, split: SplitDesignation,
};
