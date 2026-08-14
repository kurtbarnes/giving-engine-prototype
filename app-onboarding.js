const ONB_STEPS = ["Organization", "Controller", "Bank account", "Documents", "Review"];

function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);

  function next() { if (step === ONB_STEPS.length - 1) setDone(true); else setStep((s) => s + 1); }
  function back() { setStep((s) => Math.max(0, s - 1)); }

  return (
    <div className="ge-onb-wrap">
      <div className="ge-rf-badge">&#127796; Embedded via Rainforest — you never leave AppsNXT</div>
      {!done && (
        <div className="ge-onb-steps">
          {ONB_STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div className={"ge-onb-step-dot " + (i < step ? "done" : i === step ? "current" : "")}>{i < step ? "\u2713" : i + 1}</div>
                <div style={{ fontSize: 10.5, color: "#98A2B3", fontWeight: 600, whiteSpace: "nowrap" }}>{label}</div>
              </div>
              {i < ONB_STEPS.length - 1 && <div className={"ge-onb-step-line " + (i < step ? "done" : "")} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {done ? (
        <div className="ge-onb-card" style={{ textAlign: "center" }}>
          <div className="ge-confirm-check" style={{ background: "#B54708" }}>&#8987;</div>
          <h2>Application submitted</h2>
          <p className="sub" style={{ margin: "0 auto 22px", maxWidth: 380 }}>
            Rainforest is reviewing Riverbend Humane Society's application. Most reviews complete within 1–2 business days.
            You'll be notified here and by email the moment a decision is made — forms can be built and previewed now, but won't accept live payments until status shows <b>Approved</b>.
          </p>
          <div style={{ display: "inline-block", textAlign: "left", background: "#FEF3E8", border: "1px solid #FCE3C7", borderRadius: 10, padding: "12px 18px", marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#B54708", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Status</div>
            <div style={{ fontWeight: 700 }}>Pending review</div>
          </div>
          <div><button className="ge-btn ge-btn-ghost" onClick={() => { setDone(false); setStep(0); }}>Restart demo</button></div>
        </div>
      ) : (
        <div className="ge-onb-card">
          {step === 0 && (
            <React.Fragment>
              <h2>Tell us about your organization</h2>
              <p className="sub">This becomes the legal entity on file with your Rainforest sub-merchant account.</p>
              <div className="ge-formrow full"><div><span className="ge-label ge-fieldlabel-req">Legal organization name</span><input className="ge-input" defaultValue="Riverbend Humane Society" /></div></div>
              <div className="ge-formrow">
                <div><span className="ge-label ge-fieldlabel-req">EIN / Tax ID</span><input className="ge-input" defaultValue="47-1928374" /></div>
                <div><span className="ge-label">501(c)(3) status</span><select className="ge-input"><option>Confirmed nonprofit</option><option>Fiscally sponsored</option><option>Other</option></select></div>
              </div>
              <div className="ge-formrow full"><div><span className="ge-label ge-fieldlabel-req">Business address</span><input className="ge-input" defaultValue="118 Riverbend Ave, Traverse City, MI" /></div></div>
            </React.Fragment>
          )}
          {step === 1 && (
            <React.Fragment>
              <h2>Verify the controller</h2>
              <p className="sub">Rainforest requires identity verification for the person who controls financial decisions — this is Rainforest's embedded KYC component, not a form we store.</p>
              <div className="ge-formrow">
                <div><span className="ge-label ge-fieldlabel-req">Full legal name</span><input className="ge-input" defaultValue="Dana Whitfield" /></div>
                <div><span className="ge-label ge-fieldlabel-req">Title</span><input className="ge-input" defaultValue="Executive Director" /></div>
              </div>
              <div className="ge-formrow">
                <div><span className="ge-label ge-fieldlabel-req">Date of birth</span><input className="ge-input" placeholder="MM / DD / YYYY" /></div>
                <div><span className="ge-label ge-fieldlabel-req">Last 4 of SSN</span><input className="ge-input" placeholder="••••" /></div>
              </div>
              <div className="ge-formrow full"><div><span className="ge-label">Government-issued ID</span><div className="ge-doc-drop">Drag a photo ID here, or click to upload</div></div></div>
            </React.Fragment>
          )}
          {step === 2 && (
            <React.Fragment>
              <h2>Connect a payout account</h2>
              <p className="sub">Where Rainforest sends your organization's funds. AppsNXT uses next-day funding by default.</p>
              <div className="ge-formrow full"><div><span className="ge-label ge-fieldlabel-req">Bank name</span><input className="ge-input" defaultValue="First Traverse Credit Union" /></div></div>
              <div className="ge-formrow">
                <div><span className="ge-label ge-fieldlabel-req">Routing number</span><input className="ge-input" placeholder="9 digits" /></div>
                <div><span className="ge-label ge-fieldlabel-req">Account number</span><input className="ge-input" placeholder="••••••••" /></div>
              </div>
            </React.Fragment>
          )}
          {step === 3 && (
            <React.Fragment>
              <h2>Supporting documents</h2>
              <p className="sub">Rainforest's underwriting may request these to complete review — shown here as flagged for this application.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {["IRS 501(c)(3) determination letter", "Voided check or bank letter"].map((d) => (
                  <div key={d} className="ge-doc-drop" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{d}</span><button className="ge-btn ge-btn-ghost ge-btn-sm">Upload</button>
                  </div>
                ))}
              </div>
            </React.Fragment>
          )}
          {step === 4 && (
            <React.Fragment>
              <h2>Review & submit</h2>
              <p className="sub">Confirm the details below before submitting to Rainforest for underwriting.</p>
              {[["Organization", "Riverbend Humane Society"], ["EIN", "47-1928374"], ["Controller", "Dana Whitfield, Executive Director"], ["Payout account", "First Traverse Credit Union \u2022\u2022\u2022\u2022"], ["Documents", "2 of 2 attached"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F0F2F5", fontSize: 13.5 }}>
                  <span style={{ color: "#98A2B3" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </React.Fragment>
          )}
          <div className="ge-onb-foot">
            <button className="ge-btn ge-btn-ghost" onClick={back} disabled={step === 0} style={{ opacity: step === 0 ? 0.4 : 1 }}>Back</button>
            <button className="ge-btn ge-btn-primary" onClick={next}>{step === ONB_STEPS.length - 1 ? "Submit application" : "Continue"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
