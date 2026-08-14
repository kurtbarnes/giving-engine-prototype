const { useState, useMemo, useEffect } = React;

/* ============================================================
   MOCK DATA
   ============================================================ */
const ORGS = {
  classic: {
    id: "classic", name: "Riverbend Humane Society", initials: "RH",
    tmplName: "Classic NXT", tmplDesc: "A close visual match to today's Raiser's Edge NXT donation form \u2014 familiar for migrating organizations.",
    thumbGrad: "linear-gradient(135deg,#1B4B8F,#0E2E5C)",
    designations: [
      { id: "where", name: "Where Needed Most" },
      { id: "shelter", name: "Shelter Medical Fund" },
      { id: "foster", name: "Foster Program" },
      { id: "spay", name: "Spay & Neuter Fund" },
      { id: "other", name: "Other" },
    ],
    amounts: [25, 50, 100, 250, 500, 1000],
  },
  minimal: {
    id: "minimal", name: "Bright Futures Youth Center", initials: "BF",
    tmplName: "Minimal Checkout", tmplDesc: "Zeffy-inspired: short, mobile-first, generous white space, minimal fields visible at once.",
    thumbGrad: "linear-gradient(135deg,#FF6B4A,#7A2E1D)",
    designations: [
      { id: "general", name: "General Fund" },
      { id: "afterschool", name: "After-School Program" },
      { id: "camp", name: "Summer Camp Scholarships" },
    ],
    amounts: [15, 35, 75, 150],
  },
  story: {
    id: "story", name: "Coastal Land Trust", initials: "CL",
    tmplName: "Story Page", tmplDesc: "Raisely-inspired standalone landing page: hero narrative, goal meter, docked checkout card.",
    thumbGrad: "linear-gradient(135deg,#2F5D50,#12241F)",
    designations: [
      { id: "conservation", name: "Conservation Fund" },
      { id: "trail", name: "Trail Restoration" },
      { id: "land", name: "Land Acquisition" },
    ],
    amounts: [50, 100, 250, 500],
    goal: { raised: 185400, target: 250000 },
  },
  modal: {
    id: "modal", name: "City Symphony", initials: "CS",
    tmplName: "Modal Overlay", tmplDesc: "Fundraise Up-inspired: zero-redirect overlay triggered from a Donate button on the org's own site.",
    thumbGrad: "linear-gradient(135deg,#6D4AFF,#241C3C)",
    designations: [
      { id: "annual", name: "Annual Fund" },
      { id: "education", name: "Education & Outreach" },
      { id: "endowment", name: "Endowment" },
    ],
    amounts: [50, 100, 250, 1000],
  },
  split: {
    id: "split", name: "United Regional Food Bank", initials: "UF",
    tmplName: "Split Designation", tmplDesc: "Purpose-built for one payment allocated across several funds at once, with amount entry per fund.",
    thumbGrad: "linear-gradient(135deg,#C1440E,#1B2A4A)",
    designations: [
      { id: "sourcing", name: "Food Sourcing", desc: "$0.10 provides one meal equivalent" },
      { id: "mobile", name: "Mobile Pantry", desc: "Delivers to rural routes" },
      { id: "nutrition", name: "Nutrition Education", desc: "Classes & cooking demos" },
      { id: "facilities", name: "Facilities Fund", desc: "Warehouse & refrigeration" },
    ],
    amounts: [50, 100, 250, 500],
  },
};
const TEMPLATE_ORDER = ["classic", "minimal", "story", "modal", "split"];

function fmtMoney(n) {
  return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* ---- gift history mock rows ---- */
const FIRST_NAMES = ["Maria", "James", "Linda", "Robert", "Susan", "David", "Karen", "Michael", "Nancy", "Thomas", "Betty", "Carlos", "Aisha", "Wei", "Priya"];
const LAST_NAMES = ["Alvarez", "Nguyen", "Johnson", "Smith", "Patel", "Brown", "Garcia", "Chen", "Williams", "Davis", "Martinez", "Lee", "Clark", "Robinson"];
const STATUSES = ["settled", "settled", "settled", "settled", "pending", "failed", "refunded"];
const TYPES = ["one_time", "one_time", "recurring", "recurring", "pledge_payment"];
const ALL_DESIGNATIONS = ["Where Needed Most", "Shelter Medical Fund", "Annual Fund", "General Fund", "Conservation Fund", "Food Sourcing"];

function seedRandom(seed) {
  let s = seed;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
const rand = seedRandom(42);

const MOCK_GIFTS = Array.from({ length: 48 }).map((_, i) => {
  const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
  const status = STATUSES[Math.floor(rand() * STATUSES.length)];
  const type = TYPES[Math.floor(rand() * TYPES.length)];
  const amount = [25, 50, 75, 100, 150, 250, 500, 1000][Math.floor(rand() * 8)];
  const daysAgo = Math.floor(rand() * 45);
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return {
    id: "GFT-" + (10450 + i),
    donor: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    amount, status, type,
    designation: ALL_DESIGNATIONS[Math.floor(rand() * ALL_DESIGNATIONS.length)],
    date: d.toISOString().slice(0, 10),
    txId: "rf_" + Math.random().toString(36).slice(2, 10),
    synced: rand() > 0.12,
  };
});

/* ---- donor directory (derived from gift history) ---- */
const STREETS = ["Maple Ave", "Oak St", "Sunset Blvd", "Cedar Ln", "5th Ave", "Elm St", "River Rd", "Highland Dr", "Park Pl", "Birch Way"];
const CITIES = [["Portland", "OR", "972"], ["Austin", "TX", "787"], ["Denver", "CO", "802"], ["Raleigh", "NC", "276"], ["Columbus", "OH", "432"], ["Sacramento", "CA", "958"], ["Madison", "WI", "537"], ["Richmond", "VA", "232"]];
const RECUR_FREQS = ["monthly", "monthly", "monthly", "quarterly", "annual"];

function futureDate(minDays, maxDays) {
  const d = new Date();
  d.setDate(d.getDate() + minDays + Math.floor(rand() * (maxDays - minDays)));
  return d.toISOString().slice(0, 10);
}

function buildDonors() {
  const byEmail = new Map();
  MOCK_GIFTS.forEach((g) => {
    if (!byEmail.has(g.email)) byEmail.set(g.email, []);
    byEmail.get(g.email).push(g);
  });

  let i = 0;
  const donors = [];
  for (const [email, gifts] of byEmail.entries()) {
    i++;
    const sortedGifts = [...gifts].sort((a, b) => b.date.localeCompare(a.date));
    const oldestFirst = [...gifts].sort((a, b) => a.date.localeCompare(b.date));
    const settled = gifts.filter((g) => g.status === "settled");
    const totalGiving = settled.reduce((a, g) => a + g.amount, 0);
    const largestGift = gifts.reduce((m, g) => Math.max(m, g.amount), 0);
    const city = CITIES[Math.floor(rand() * CITIES.length)];

    const recurringSource = gifts.find((g) => g.type === "recurring");
    const recurringGifts = recurringSource ? [{
      id: "RG-" + (5000 + i),
      designation: recurringSource.designation,
      amount: recurringSource.amount,
      frequency: RECUR_FREQS[Math.floor(rand() * RECUR_FREQS.length)],
      status: rand() > 0.15 ? "active" : "paused",
      startDate: oldestFirst[0].date,
      nextChargeDate: futureDate(1, 28),
    }] : [];

    const pledgeGifts = gifts.filter((g) => g.type === "pledge_payment");
    const pledges = pledgeGifts.length ? (() => {
      const paid = pledgeGifts.reduce((a, g) => a + g.amount, 0);
      const totalPledged = paid + (Math.round((paid * (0.5 + rand() * 1.5)) / 50) * 50 || 50);
      return [{
        id: "PLG-" + (7000 + i),
        designation: pledgeGifts[0].designation,
        totalPledged,
        totalPaid: paid,
        balance: totalPledged - paid,
        installments: pledgeGifts.length,
        nextDueDate: futureDate(7, 60),
      }];
    })() : [];

    const syncedCount = gifts.filter((g) => g.synced).length;
    const reSynced = syncedCount === gifts.length ? "synced" : syncedCount === 0 ? "pending" : "partial";

    donors.push({
      id: "DNR-" + (30000 + i),
      name: gifts[0].donor,
      email,
      phone: "(" + (200 + Math.floor(rand() * 700)) + ") " + (200 + Math.floor(rand() * 700)) + "-" + (1000 + Math.floor(rand() * 8999)),
      address: {
        line1: (100 + Math.floor(rand() * 8899)) + " " + STREETS[Math.floor(rand() * STREETS.length)],
        city: city[0], state: city[1], zip: city[2] + Math.floor(10 + rand() * 89),
      },
      gifts: sortedGifts,
      giftCount: gifts.length,
      totalGiving,
      largestGift,
      firstGiftDate: oldestFirst[0].date,
      lastGiftDate: sortedGifts[0].date,
      recurringGifts,
      pledges,
      reConstituentId: "CNST-" + (100000 + Math.floor(rand() * 899999)),
      reSynced,
    });
  }
  return donors;
}
const MOCK_DONORS = buildDonors();

/* ---- forms list mock data ---- */
const FORM_NAMES = ["Spring Appeal", "Year-End Giving", "Annual Fund Drive", "Monthly Giving Circle", "Gala Ticket & Gift", "Capital Campaign", "Memorial Tribute Fund", "Disaster Relief Fund"];
const MOCK_FORMS = FORM_NAMES.map((name, i) => {
  const template = TEMPLATE_ORDER[i % TEMPLATE_ORDER.length];
  const active = rand() > 0.25;
  return {
    id: "FRM-" + (900 + i),
    name,
    template,
    status: active ? "active" : "inactive",
    totalRaised: Math.round((2000 + rand() * 48000) / 50) * 50,
    conversionRate: Math.round((22 + rand() * 40) * 10) / 10,
    createdDate: futureDate(-330, -30),
  };
});

/* ---- fundraising settings mock data ---- */
const MOCK_FUNDS = [
  { id: "where", name: "Where Needed Most", code: "GEN-001", active: true },
  { id: "shelter", name: "Shelter Medical Fund", code: "SHL-014", active: true },
  { id: "foster", name: "Foster Program", code: "FOS-007", active: true },
  { id: "spay", name: "Spay & Neuter Fund", code: "SPN-002", active: true },
  { id: "endowment", name: "Endowment", code: "END-001", active: false },
];
const MOCK_CAMPAIGNS = [
  { id: "annual26", name: "2026 Annual Fund", code: "CAM-2026-01", active: true, goal: 150000 },
  { id: "capital", name: "New Shelter Capital Campaign", code: "CAM-CAP-01", active: true, goal: 2000000 },
  { id: "yearend25", name: "Year-End 2025", code: "CAM-2025-YE", active: false, goal: 80000 },
];
const MOCK_APPEALS = [
  { id: "spring26", name: "Spring Appeal 2026", code: "APL-2026-SPR", active: true },
  { id: "gala26", name: "Gala Invitation", code: "APL-2026-GALA", active: true },
  { id: "mail25", name: "Fall Direct Mail 2025", code: "APL-2025-FALL", active: false },
];

/* ---- general settings mock data ---- */
const MOCK_DONOR_FIELDS = [
  { id: "df1", name: "Preferred name", type: "Text", syncRE: true, onForms: false },
  { id: "df2", name: "Employer", type: "Text", syncRE: true, onForms: true },
  { id: "df3", name: "Volunteer interest", type: "Dropdown", syncRE: false, onForms: true },
];
const MOCK_GIFT_FIELDS = [
  { id: "gf1", name: "In honor of relationship", type: "Text", syncRE: true, onForms: true },
  { id: "gf2", name: "Matching gift company", type: "Text", syncRE: true, onForms: false },
  { id: "gf3", name: "Solicitor", type: "Dropdown", syncRE: false, onForms: false },
];

/* ============================================================
   SHARED CHECKOUT STATE HOOK
   ============================================================ */
function useCheckout(org) {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(org.amounts[1]);
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("one_time");
  const [designationId, setDesignationId] = useState(org.designations[0].id);
  const [otherText, setOtherText] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [feeCover, setFeeCover] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [tributeOn, setTributeOn] = useState(false);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [splitAlloc, setSplitAlloc] = useState(() =>
    Object.fromEntries(org.designations.map((d) => [d.id, 0]))
  );

  const chosenAmount = customAmount ? Number(customAmount) || 0 : amount;
  const feeAmount = feeCover ? Math.round(chosenAmount * 0.029 + 0.3) : 0;
  const total = chosenAmount + feeAmount;
  const splitTotal = Object.values(splitAlloc).reduce((a, b) => a + Number(b || 0), 0);

  function goNext() { setStep((s) => Math.min(3, s + 1)); }
  function goBack() { setStep((s) => Math.max(1, s - 1)); }
  function submit() {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); setStep(3); }, 900);
  }
  function reset() {
    setStep(1); setSubmitted(false); setFirstName(""); setLastName(""); setEmail("");
    setCustomAmount(""); setAmount(org.amounts[1]);
  }

  return {
    step, setStep, goNext, goBack,
    amount, setAmount, customAmount, setCustomAmount, chosenAmount,
    frequency, setFrequency,
    designationId, setDesignationId, otherText, setOtherText,
    firstName, setFirstName, lastName, setLastName, email, setEmail,
    feeCover, setFeeCover, feeAmount, total,
    anonymous, setAnonymous, tributeOn, setTributeOn, comments, setComments,
    submitting, submitted, submit, reset,
    splitAlloc, setSplitAlloc, splitTotal,
  };
}

const FREQ_LABEL = { one_time: "One time", monthly: "Monthly", quarterly: "Quarterly", annual: "Annual" };
