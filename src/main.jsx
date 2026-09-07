import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import QRCode from "qrcode";
import "./styles.css";

const notaries = [
  { id: "RW-NOT-00482", name: "Jean Claude N.", office: "Nyarugenge Notary Office", district: "Nyarugenge", status: "ACTIVE", cases: 1284, avg: "3.8 hrs" },
  { id: "RW-NOT-00317", name: "Alice M.", office: "Kicukiro Notary Office", district: "Kicukiro", status: "ACTIVE", cases: 742, avg: "5.1 hrs" },
  { id: "RW-NOT-00194", name: "Patrick R.", office: "Gasabo Notary Office", district: "Gasabo", status: "REVIEW", cases: 963, avg: "2.8 days" }
];

const initialDocs = [
  { id: "RW-2026-00018492", type: "Agreement", applicant: "Igiti Enterprises Ltd", notary: "Jean Claude N.", date: "07 Sep 2026", status: "VALID" },
  { id: "RW-2026-00018491", type: "Signature Authentication", applicant: "Sample Citizen", notary: "Alice M.", date: "07 Sep 2026", status: "VALID" },
  { id: "RW-2026-00018473", type: "Certified Copy", applicant: "Sample Business Ltd", notary: "Patrick R.", date: "06 Sep 2026", status: "REVIEW" }
];

function App() {
  const [role, setRole] = useState("minijust");
  const [page, setPage] = useState("overview");
  const [docs, setDocs] = useState(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [search, setSearch] = useState("");

  const nav = role === "minijust"
    ? [
        ["overview","Command Centre"],
        ["notaries","Notaries"],
        ["documents","Documents"],
        ["verify","Public Verification"],
        ["reports","Reports"]
      ]
    : [
        ["notaryhome","My Dashboard"],
        ["applications","Applications"],
        ["appointments","Appointments"],
        ["issued","Issued Documents"],
        ["notaryverify","Verification"],
        ["messages","Messages"],
        ["profile","My Profile"]
      ];

  function switchRole(next) {
    setRole(next);
    setPage(next === "minijust" ? "overview" : "notaryhome");
    setSelectedDoc(null);
  }

  function addDemoDocument() {
    const id = `RW-2026-000${18500 + docs.length}`;
    setDocs([{ id, type: "Agreement", applicant: "Demo Company Ltd", notary: "Jean Claude N.", date: "07 Sep 2026", status: "VALID" }, ...docs]);
    setPage(role === "minijust" ? "documents" : "applications");
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="crest">RW</div>
          <div><strong>e-Notary</strong><span>Rwanda Prototype</span></div>
        </div>

        <div className="role-switch">
          <button className={role==="minijust" ? "role active":"role"} onClick={()=>switchRole("minijust")}>
            <span>◆</span> MINIJUST
          </button>
          <button className={role==="notary" ? "role active":"role"} onClick={()=>switchRole("notary")}>
            <span>♙</span> Notary Portal
          </button>
        </div>

        <div className="nav-label">{role==="minijust" ? "SUPERVISION" : "MY WORKSPACE"}</div>
        <nav>
          {nav.map(([key,label]) => (
            <button key={key} className={page===key ? "nav active":"nav"} onClick={()=>setPage(key)}>
              <span>{({
                overview:"▦",notaries:"♙",documents:"▤",verify:"⌕",reports:"◫",
                notaryhome:"▦",applications:"▤",appointments:"◷",issued:"✓",
                notaryverify:"⌕",messages:"✉",profile:"○"
              })[key]}</span>{label}
            </button>
          ))}
        </nav>

        <div className="side-note">
          <b>Prototype mode</b>
          <p>All records are simulated. No government or personal data is connected.</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <div className="eyebrow">{role==="minijust" ? "MINIJUST • NOTARIAL SERVICES" : "AUTHORIZED NOTARY • NOTARIAL WORKSPACE"}</div>
            <h1>{role==="minijust"
              ? (page === "overview" ? "National Command Centre" : page[0].toUpperCase()+page.slice(1))
              : ({
                  notaryhome:"My Dashboard", applications:"Applications", appointments:"Appointments",
                  issued:"Issued Documents", notaryverify:"Verification", messages:"Messages", profile:"My Profile"
                })[page]
            }</h1>
          </div>
          <div className="top-actions">
            <span className="user-chip">{role==="minijust" ? "MINIJUST Officer" : "Jean Claude N. • RW-NOT-00482"}</span>
            <span className="live"><i/> Demo environment</span>
            <button className="primary" onClick={addDemoDocument}>+ New demo case</button>
          </div>
        </header>

        {role === "minijust" && page === "overview" && <Overview setPage={setPage} />}
        {role === "minijust" && page === "notaries" && <Notaries />}
        {role === "minijust" && page === "documents" && <Documents docs={docs.filter(d => Object.values(d).join(" ").toLowerCase().includes(search.toLowerCase()))} search={search} setSearch={setSearch} onSelect={setSelectedDoc} />}
        {role === "minijust" && page === "verify" && <Verification scanResult={scanResult} setScanResult={setScanResult} />}
        {role === "minijust" && page === "reports" && <Reports />}

        {role === "notary" && page === "notaryhome" && <NotaryDashboard setPage={setPage} />}
        {role === "notary" && page === "applications" && <NotaryApplications docs={docs} onSelect={setSelectedDoc} />}
        {role === "notary" && page === "appointments" && <NotaryAppointments />}
        {role === "notary" && page === "issued" && <IssuedDocuments docs={docs} onSelect={setSelectedDoc} />}
        {role === "notary" && page === "notaryverify" && <Verification scanResult={scanResult} setScanResult={setScanResult} />}
        {role === "notary" && page === "messages" && <NotaryMessages />}
        {role === "notary" && page === "profile" && <NotaryProfile />}

        {selectedDoc && <DocumentModal doc={selectedDoc} close={()=>setSelectedDoc(null)} />}
      </main>
    </div>
  );
}

function Stat({label,value,trend}) {
  return <div className="stat"><span>{label}</span><strong>{value}</strong><small>{trend}</small></div>
}

function Overview({setPage}) {
  return <section>
    <div className="stats">
      <Stat label="Applications this month" value="8,492" trend="+12.4% vs last month"/>
      <Stat label="Completed" value="7,930" trend="93.4% completion"/>
      <Stat label="Pending" value="562" trend="43 overdue"/>
      <Stat label="Avg. processing time" value="5.1 hrs" trend="-18% improvement"/>
    </div>

    <div className="grid two">
      <div className="card">
        <div className="card-head"><div><b>Service activity</b><span>September 2026</span></div><button onClick={()=>setPage("reports")}>View report →</button></div>
        <div className="bars">
          {[42,58,51,74,66,82,78,91,69,88,94,80].map((h,i)=><div className="bar-wrap" key={i}><div className="bar" style={{height:h+"%"}}/><small>{i+1}</small></div>)}
        </div>
      </div>
      <div className="card">
        <div className="card-head"><div><b>System alerts</b><span>Needs attention</span></div></div>
        <Alert title="43 overdue applications" text="Across 7 notarial offices" type="warning"/>
        <Alert title="3 notaries require review" text="Unusual processing patterns detected" type="danger"/>
        <Alert title="98.7% verification success" text="QR/document checks are operating normally" type="good"/>
      </div>
    </div>

    <div className="card">
      <div className="card-head"><div><b>District performance</b><span>Current month</span></div><button onClick={()=>setPage("notaries")}>Manage notaries →</button></div>
      <table><thead><tr><th>District</th><th>Applications</th><th>Completed</th><th>Avg. time</th><th>Service level</th></tr></thead>
      <tbody>
        {[
          ["Nyarugenge","2,184","2,091","3.8 hrs","96%"],
          ["Gasabo","2,037","1,882","5.4 hrs","92%"],
          ["Kicukiro","1,746","1,648","5.1 hrs","94%"],
          ["Other districts","2,525","2,309","6.2 hrs","91%"]
        ].map(r=><tr key={r[0]}>{r.map((x,i)=><td key={i}>{i===4?<span className="pill good">{x}</span>:x}</td>)}</tr>)}
      </tbody></table>
    </div>
  </section>
}


function NotaryDashboard({setPage}) {
  return <section>
    <div className="welcome">
      <div><div className="eyebrow">GOOD AFTERNOON</div><h2>Welcome back, Jean Claude</h2><p>Here is your notarial workload and today's priorities.</p></div>
      <div className="notary-status"><span className="status-check">✓</span><div><b>Authorization active</b><small>RW-NOT-00482 • Valid</small></div></div>
    </div>

    <div className="stats">
      <Stat label="Pending applications" value="12" trend="4 received today"/>
      <Stat label="Under review" value="7" trend="3 awaiting verification"/>
      <Stat label="Completed this month" value="184" trend="+9.2% vs last month"/>
      <Stat label="Average processing" value="3.8 hrs" trend="Within service target"/>
    </div>

    <div className="grid two">
      <div className="card">
        <div className="card-head"><div><b>Today's queue</b><span>Priority cases requiring action</span></div><button onClick={()=>setPage("applications")}>View all →</button></div>
        {[
          ["RW-2026-00018492","Agreement","Igiti Enterprises Ltd","09:30","Review"],
          ["RW-2026-00018488","Signature Authentication","Sample Citizen","10:15","Verify"],
          ["RW-2026-00018481","Certified Copy","Demo Company Ltd","11:00","Review"]
        ].map(x=><div className="queue" key={x[0]}><div><b className="mono">{x[0]}</b><span>{x[1]} • {x[2]}</span></div><div><small>{x[3]}</small><button className="action-btn">{x[4]}</button></div></div>)}
      </div>

      <div className="card">
        <div className="card-head"><div><b>My performance</b><span>September 2026</span></div></div>
        <div className="performance"><div><strong>96%</strong><span>Completed within target</span></div><div><strong>184</strong><span>Documents issued</span></div><div><strong>0</strong><span>Overdue cases</span></div></div>
        <div className="mini-progress"><span style={{width:"96%"}}/></div>
      </div>
    </div>

    <div className="card">
      <div className="card-head"><div><b>Required verification checklist</b><span>Complete before issuing a notarized document</span></div></div>
      <div className="check-grid">
        {["Confirm applicant identity","Review original document","Check supporting documents","Confirm signatures / declarations","Record notarial decision","Apply digital signature & QR"].map((x,i)=><div key={x} className="check-item"><span>{i<4?"✓":"○"}</span>{x}</div>)}
      </div>
    </div>
  </section>
}

function NotaryApplications({docs,onSelect}) {
  return <section>
    <div className="stats">
      <Stat label="New" value="4" trend="Received today"/>
      <Stat label="Under review" value="7" trend="Action required"/>
      <Stat label="Awaiting applicant" value="1" trend="Supporting document"/>
      <Stat label="Overdue" value="0" trend="Excellent"/>
    </div>
    <div className="card">
      <div className="card-head"><div><b>My applications</b><span>Cases assigned to RW-NOT-00482</span></div><button className="primary">Filter</button></div>
      <table><thead><tr><th>Reference</th><th>Service</th><th>Applicant</th><th>Submitted</th><th>Stage</th><th>Action</th></tr></thead>
      <tbody>{docs.map((d,i)=><tr key={d.id}><td className="mono">{d.id}</td><td>{d.type}</td><td>{d.applicant}</td><td>{d.date}</td><td><span className={"pill "+(i===2?"warn":"good")}>{i===2?"AWAITING":"REVIEW"}</span></td><td><button className="linkbtn" onClick={()=>onSelect(d)}>Open case →</button></td></tr>)}</tbody></table>
    </div>
  </section>
}

function NotaryAppointments() {
  return <section><div className="card"><div className="card-head"><div><b>Appointments</b><span>Your scheduled applicant visits</span></div><button className="primary">+ Add appointment</button></div>
    {[
      ["09:30","Igiti Enterprises Ltd","Agreement","RW-2026-00018492"],
      ["10:15","Sample Citizen","Signature Authentication","RW-2026-00018488"],
      ["11:00","Demo Company Ltd","Certified Copy","RW-2026-00018481"],
      ["14:30","Sample Business Ltd","Agreement","RW-2026-00018473"]
    ].map(x=><div className="appointment" key={x[3]}><strong>{x[0]}</strong><div><b>{x[1]}</b><span>{x[2]} • {x[3]}</span></div><button className="linkbtn">Open case</button></div>)}
  </div></section>
}

function IssuedDocuments({docs,onSelect}) {
  return <section><div className="card"><div className="card-head"><div><b>Issued documents</b><span>Documents you have notarized and issued</span></div></div>
    <table><thead><tr><th>Reference</th><th>Type</th><th>Applicant</th><th>Date</th><th>Status</th><th>QR</th></tr></thead>
    <tbody>{docs.filter(d=>d.status==="VALID").map(d=><tr key={d.id}><td className="mono">{d.id}</td><td>{d.type}</td><td>{d.applicant}</td><td>{d.date}</td><td><span className="pill good">VALID</span></td><td><button className="linkbtn" onClick={()=>onSelect(d)}>View QR</button></td></tr>)}</tbody></table>
  </div></section>
}

function NotaryMessages() {
  return <section><div className="card"><div className="card-head"><div><b>Messages</b><span>Communication with applicants and MINIJUST</span></div><button className="primary">New message</button></div>
    <div className="message unread"><div className="avatar">M</div><div><b>MINIJUST Supervision</b><span>Monthly reporting reminder</span><p>Please ensure all September cases have complete audit records.</p></div><small>Today</small></div>
    <div className="message"><div className="avatar">I</div><div><b>Igiti Enterprises Ltd</b><span>Application RW-2026-00018492</span><p>Supporting document uploaded for review.</p></div><small>Today</small></div>
  </div></section>
}

function NotaryProfile() {
  return <section><div className="grid two"><div className="card profile-card"><div className="profile-avatar">JN</div><div className="eyebrow">AUTHORIZED NOTARY</div><h2>Jean Claude N.</h2><p className="muted">Notary ID: RW-NOT-00482</p><div className="profile-status">✓ Authorization ACTIVE</div></div>
  <div className="card"><div className="card-head"><div><b>Authorization details</b><span>Official registry information</span></div></div>
    <p className="detail-row"><span>Office</span><b>Nyarugenge Notary Office</b></p><p className="detail-row"><span>District</span><b>Nyarugenge</b></p><p className="detail-row"><span>Authorization status</span><b>Active</b></p><p className="detail-row"><span>Cases processed</span><b>1,284</b></p>
  </div></div></section>
}

function Alert({title,text,type}) {
  return <div className="alert"><span className={"dot "+type}/><div><b>{title}</b><p>{text}</p></div></div>
}

function Notaries() {
  return <section>
    <div className="stats">
      <Stat label="Authorized notaries" value="247" trend="239 active"/>
      <Stat label="Applications handled" value="8,492" trend="This month"/>
      <Stat label="Under review" value="3" trend="Requires MINIJUST action"/>
    </div>
    <div className="card">
      <div className="card-head"><div><b>Notary registry</b><span>Simulated national registry</span></div><input className="search" placeholder="Search notaries…"/></div>
      <table><thead><tr><th>Notary ID</th><th>Name</th><th>Office</th><th>Cases</th><th>Avg. time</th><th>Status</th></tr></thead>
      <tbody>{notaries.map(n=><tr key={n.id}><td className="mono">{n.id}</td><td><b>{n.name}</b></td><td>{n.office}</td><td>{n.cases.toLocaleString()}</td><td>{n.avg}</td><td><span className={"pill "+(n.status==="ACTIVE"?"good":"warn")}>{n.status}</span></td></tr>)}</tbody></table>
    </div>
  </section>
}

function Documents({docs,search,setSearch,onSelect}) {
  return <section>
    <div className="card">
      <div className="card-head"><div><b>Document registry</b><span>Every notarized record receives a unique reference and QR verification endpoint.</span></div><input value={search} onChange={e=>setSearch(e.target.value)} className="search" placeholder="Search records…"/></div>
      <table><thead><tr><th>Reference</th><th>Type</th><th>Applicant</th><th>Notary</th><th>Date</th><th>Status</th><th></th></tr></thead>
      <tbody>{docs.map(d=><tr key={d.id}><td className="mono">{d.id}</td><td>{d.type}</td><td>{d.applicant}</td><td>{d.notary}</td><td>{d.date}</td><td><span className={"pill "+(d.status==="VALID"?"good":"warn")}>{d.status}</span></td><td><button className="linkbtn" onClick={()=>onSelect(d)}>QR / View</button></td></tr>)}</tbody></table>
    </div>
  </section>
}

function DocumentModal({doc,close}) {
  const [qr,setQr] = useState("");
  React.useEffect(()=>{ QRCode.toDataURL(`https://verify.enotary.rw/document/${doc.id}`).then(setQr); },[doc.id]);
  return <div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
    <button className="close" onClick={close}>×</button>
    <div className="eyebrow">DOCUMENT VERIFICATION</div>
    <h2>{doc.id}</h2>
    <div className="verify-box"><span>✓</span><div><b>VALID DOCUMENT</b><small>Issued by an authorized notary</small></div></div>
    <div className="qr-area">{qr ? <img src={qr} alt="Document QR code"/> : <div className="qr-loading">Generating QR…</div>}<div><b>Scan to verify</b><p>This QR resolves to the public verification service.</p></div></div>
    <div className="details"><p><span>Type</span><b>{doc.type}</b></p><p><span>Applicant</span><b>{doc.applicant}</b></p><p><span>Notary</span><b>{doc.notary}</b></p><p><span>Date</span><b>{doc.date}</b></p></div>
  </div></div>
}

function Verification({scanResult,setScanResult}) {
  const [ref,setRef] = useState("RW-2026-00018492");
  function verify(){ setScanResult(initialDocs.find(d=>d.id===ref) || {id:ref,status:"NOT FOUND"}); }
  return <section>
    <div className="verify-hero">
      <div><div className="eyebrow">PUBLIC VERIFICATION SERVICE</div><h2>Verify a Rwandan notarial document</h2><p>Scan a document QR code or enter its reference number. The public service confirms authenticity without exposing confidential document contents.</p></div>
      <div className="verify-form"><input value={ref} onChange={e=>setRef(e.target.value)} placeholder="RW-2026-00000000"/><button className="primary" onClick={verify}>Verify document</button></div>
    </div>
    {scanResult && <div className="verification-result">
      {scanResult.status==="VALID" ? <><div className="big-check">✓</div><h2>Document verified</h2><p className="muted">This record exists in the simulated national registry.</p><div className="result-grid">{Object.entries(scanResult).map(([k,v])=><div key={k}><span>{k}</span><b>{v}</b></div>)}</div></> : <><div className="big-x">!</div><h2>Record not found</h2><p className="muted">No matching record was found in the prototype database.</p></>}
    </div>}
  </section>
}

function Reports() {
  return <section>
    <div className="stats"><Stat label="Monthly transactions" value="8,492" trend="+12.4%"/><Stat label="Revenue recorded" value="42.3M RWF" trend="Simulated"/><Stat label="QR verifications" value="14,284" trend="+21%"/></div>
    <div className="grid two">
      <div className="card"><div className="card-head"><div><b>Executive report</b><span>September 2026</span></div><button className="primary" onClick={()=>alert("Demo: PDF report generation would run here.")}>Generate PDF</button></div>
        <div className="report-list"><p><b>1.</b> National transaction volume increased 12.4%.</p><p><b>2.</b> 93.4% of applications were completed.</p><p><b>3.</b> 43 applications exceeded the service target.</p><p><b>4.</b> Three notaries were flagged for supervisory review.</p><p><b>5.</b> QR verification success rate was 98.7%.</p></div>
      </div>
      <div className="card"><div className="card-head"><div><b>Recommended MINIJUST actions</b><span>Automated signals</span></div></div>
        <Alert title="Review 3 notaries" text="Compare processing patterns with sector averages." type="danger"/>
        <Alert title="Follow up 43 overdue cases" text="Notify responsible offices and monitor closure." type="warning"/>
        <Alert title="Expand QR verification" text="Promote public verification on issued documents." type="good"/>
      </div>
    </div>
  </section>
}

createRoot(document.getElementById("root")).render(<App />);