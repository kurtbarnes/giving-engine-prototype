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
