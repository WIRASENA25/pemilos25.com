/* ---------- FIREBASE (compat) ---------- */
/* replace with your firebase config if berbeda */
const firebaseConfig = {
  apiKey: "AIzaSyCWPLoDWhCiteW7jZaF_IcREHrexQFgBOQ",
  authDomain: "pemilos25.firebaseapp.com",
  projectId: "pemilos25",
  storageBucket: "pemilos25.appspot.com",
  messagingSenderId: "85101207195",
  appId: "1:85101207195:web:97c577ac50af545897703e"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ---------- DATA (contoh kandidat) ---------- */
const mpkCandidates = [
  { name: "Kandidat 1", img: "Chelin.jpg" },
  { name: "Kandidat 2", img: "Friska.jpg" },

];
const osisCandidates = [
  { name: "Kandidat 1", img: "Raihanna.jpg" },
  { name: "Kandidat 2", img: "Asyraf.jpg" },
  { name: "Kandidat 3", img: "Chessy.jpg" },
  { name: "Kandidat 4", img: "Mirza.jpg" },

];

/* ---------- STATE ---------- */
let votes = { mpk: {}, osis: {} };
let chartMpk = null, chartOsis = null;

/* ---------- RENDER KANDIDAT ---------- */
function renderCandidates() {
  const mpkWrap = document.getElementById("mpkCandidates");
  const osisWrap = document.getElementById("osisCandidates");
  mpkWrap.innerHTML = "";
  osisWrap.innerHTML = "";

  mpkCandidates.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.tabIndex = 0;
    div.innerHTML = `
      <img src="${c.img}" alt="${c.name}">
      <h3>${c.name}</h3>
      <input type="radio" name="mpk" value="${i}" aria-label="Pilih ${c.name}">
    `;
    div.addEventListener("click", () => selectCandidate("mpk", i, div));
    div.addEventListener("keydown", (e) => { if (e.key === "Enter") selectCandidate("mpk", i, div); });
    mpkWrap.appendChild(div);
  });

  osisCandidates.forEach((c, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.tabIndex = 0;
    div.innerHTML = `
      <img src="${c.img}" alt="${c.name}">
      <h3>${c.name}</h3>
      <input type="radio" name="osis" value="${i}" aria-label="Pilih ${c.name}">
    `;
    div.addEventListener("click", () => selectCandidate("osis", i, div));
    div.addEventListener("keydown", (e) => { if (e.key === "Enter") selectCandidate("osis", i, div); });
    osisWrap.appendChild(div);
  });
}
renderCandidates();

/* ---------- SELECT ---------- */
function selectCandidate(type, idx, el) {
  const wrap = document.getElementById(type + "Candidates");
  wrap.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
  el.classList.add("selected");
  const input = el.querySelector('input[type="radio"]');
  if (input) input.checked = true;
}

/* ---------- SUBMIT VOTE ---------- */
async function submitVote() {
  const mpk = document.querySelector('input[name="mpk"]:checked');
  const osis = document.querySelector('input[name="osis"]:checked');

  if (!mpk || !osis) {
    showNotif("Pilih kandidat MPK dan OSIS!", "#c0392b");
    return;
  }

  try {
    // increment di firestore (merge)
    await db.collection("votes").doc("mpk").set(
      { [mpk.value]: firebase.firestore.FieldValue.increment(1) }, { merge: true }
    );
    await db.collection("votes").doc("osis").set(
      { [osis.value]: firebase.firestore.FieldValue.increment(1) }, { merge: true }
    );

    localStorage.setItem("voted", "true");
    document.getElementById("voteSection").style.display = "none";
    document.getElementById("thankYouPage").style.display = "flex";

    // ensure navbar login visible
    document.getElementById("btnLoginPanitia").style.display = "inline-block";

    showNotif("Suara berhasil dikirim ✅", "#28a745");
  } catch (err) {
    console.error(err);
    showNotif("Gagal mengirim suara", "#c0392b");
  }
}

/* ---------- NOTIF ---------- */
function showNotif(msg, bg = "#003366") {
  const n = document.getElementById("notifSlide");
  n.textContent = msg;
  n.style.background = bg;
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 3000);
}

/* ---------- ADMIN LOGIN ---------- */
function toggleLogin() {
  const ol = document.getElementById("adminLogin");
  ol.classList.toggle("active");
  ol.style.display = ol.classList.contains("active") ? "flex" : "none";
  ol.setAttribute("aria-hidden", ol.classList.contains("active") ? "false" : "true");
  // focus to password
  if (ol.classList.contains("active")) {
    setTimeout(() => document.getElementById("adminPass").focus(), 120);
  }
}
document.getElementById("closeLogin").addEventListener("click", toggleLogin);

function checkAdmin() {
  const pass = document.getElementById("adminPass").value || "";
  if (pass === "admin123") {
    // show admin panel
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminLogin").classList.remove("active");
    document.getElementById("voteSection").style.display = "none";
    document.getElementById("thankYouPage").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    document.getElementById("adminSettings").classList.remove("hidden");
    document.getElementById("adminSettings").setAttribute("aria-hidden", "false");

    // show tab hasil & load votes
    loadVotes();
    showTab("hasil");
    showNotif("✔️ Login berhasil", "#28a745");
  } else {
    showNotif("Password salah!", "#c0392b");
  }
}
document.getElementById("adminPass").addEventListener("keyup", (e) => { if (e.key === "Enter") checkAdmin(); });

function logoutAdmin() {
  document.getElementById("adminPanel").style.display = "none";
  document.getElementById("adminSettings").classList.add("hidden");
  document.getElementById("adminSettings").setAttribute("aria-hidden", "true");
  document.getElementById("settingsDropdown").style.display = "none";

  // return to vote or thank you
  if (localStorage.getItem("voted") === "true") {
    document.getElementById("thankYouPage").style.display = "flex";
    document.getElementById("voteSection").style.display = "none";
  } else {
    document.getElementById("voteSection").style.display = "block";
    document.getElementById("thankYouPage").style.display = "none";
  }
  showNotif("Panitia logout ✔️", "#007bff");
}

/* settings dropdown toggle (in nav) */
document.getElementById("settingsToggle")?.addEventListener("click", (e) => {
  e.stopPropagation();
  const dd = document.getElementById("settingsDropdown");
  dd.style.display = dd.style.display === "block" ? "none" : "block";
});
window.addEventListener("click", (e) => {
  if (!e.target.closest(".settings-menu")) {
    document.getElementById("settingsDropdown").style.display = "none";
  }
});

/* ---------- LOAD VOTES (realtime snapshots) ---------- */
function loadVotes() {
  // listen mpk
  db.collection("votes").doc("mpk").onSnapshot((snap) => {
    votes.mpk = snap.exists ? snap.data() : {};
    drawCharts();
    renderEdit();
  });
  // listen osis
  db.collection("votes").doc("osis").onSnapshot((snap) => {
    votes.osis = snap.exists ? snap.data() : {};
    drawCharts();
    renderEdit();
  });
}

/* ---------- DRAW CHARTS ---------- */
function drawCharts() {
  try {
    const labelsM = mpkCandidates.map(c => c.name);
    const dataM = mpkCandidates.map((_, i) => votes.mpk[i] || 0);
    const labelsO = osisCandidates.map(c => c.name);
    const dataO = osisCandidates.map((_, i) => votes.osis[i] || 0);

    const ctxM = document.getElementById("chartMPK")?.getContext?.("2d");
    const ctxO = document.getElementById("chartOSIS")?.getContext?.("2d");
    if (!ctxM || !ctxO) return;

    if (chartMpk) chartMpk.destroy();
    if (chartOsis) chartOsis.destroy();

    chartMpk = new Chart(ctxM, {
      type: "bar",
      data: { labels: labelsM, datasets: [{ label: "Suara", data: dataM }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });
    chartOsis = new Chart(ctxO, {
      type: "bar",
      data: { labels: labelsO, datasets: [{ label: "Suara", data: dataO }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
    });

    document.getElementById("titleMPK").textContent = `Hasil Voting MPK (Total: ${dataM.reduce((a,b)=>a+b,0)})`;
    document.getElementById("titleOSIS").textContent = `Hasil Voting OSIS (Total: ${dataO.reduce((a,b)=>a+b,0)})`;
  } catch(err) {
    console.error("drawCharts error:", err);
  }
}

/* ---------- EDIT / SAVE ---------- */
function renderEdit() {
  const edit = document.getElementById("editVotes");
  if(!edit) return;
  let html = "<h4>MPK</h4>";
  mpkCandidates.forEach((c, i) => {
    html += `<label style="display:block;margin:6px 0;">${c.name}: <input type="number" id="edit-mpk-${i}" value="${votes.mpk[i]||0}" min="0"></label>`;
  });
  html += "<h4 style='margin-top:10px'>OSIS</h4>";
  osisCandidates.forEach((c, i) => {
    html += `<label style="display:block;margin:6px 0;">${c.name}: <input type="number" id="edit-osis-${i}" value="${votes.osis[i]||0}" min="0"></label>`;
  });
  edit.innerHTML = html;
}
async function saveEdits() {
  try {
    const newM = {}, newO = {};
    mpkCandidates.forEach((_, i) => newM[i] = parseInt(document.getElementById(`edit-mpk-${i}`).value) || 0);
    osisCandidates.forEach((_, i) => newO[i] = parseInt(document.getElementById(`edit-osis-${i}`).value) || 0);
    await db.collection("votes").doc("mpk").set(newM);
    await db.collection("votes").doc("osis").set(newO);
    showNotif("✔️ Data voting diperbarui", "#28a745");
  } catch (err) {
    console.error(err);
    showNotif("Gagal menyimpan perubahan", "#c0392b");
  }
}

/* ---------- CSV EXPORT ---------- */
function downloadCSV() {
  try {
    const rows = [["Jenis","Kandidat","Suara"]];
    mpkCandidates.forEach((c,i) => rows.push(["MPK", c.name, votes.mpk[i]||0]));
    osisCandidates.forEach((c,i) => rows.push(["OSIS", c.name, votes.osis[i]||0]));
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "hasil_voting.csv"; a.click();
    URL.revokeObjectURL(url);
  } catch(err) {
    console.error(err);
    showNotif("Gagal export CSV", "#c0392b");
  }
}

/* ---------- RESET VOTES ---------- */
function resetVote() {
  const modal = document.getElementById("resetModal");
  modal.style.display = "flex";
}
function closeResetModal() {
  document.getElementById("resetModal").style.display = "none";
}
async function confirmReset() {
  try {
    const batch = db.batch();
    const snap = await db.collection("votes").get();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    localStorage.removeItem("voted");
    showNotif("✅ Semua data voting sudah direset", "#28a745");
    closeResetModal();
    location.reload();
  } catch (err) {
    console.error(err);
    showNotif("❌ Gagal reset voting", "#c0392b");
    closeResetModal();
  }
}
window.addEventListener("click", (e) => {
  const modal = document.getElementById("resetModal");
  if (e.target === modal) closeResetModal();
});

/* ---------- TABS ---------- */
function showTab(tab) {
  document.getElementById("tab-hasil").style.display = (tab === "hasil") ? "block" : "none";
  document.getElementById("tab-edit").style.display = (tab === "edit") ? "block" : "none";
  document.getElementById("btnHasil")?.classList.remove("active");
  document.getElementById("btnEdit")?.classList.remove("active");
  if (tab === "hasil") document.getElementById("btnHasil")?.classList.add("active");
  if (tab === "edit") document.getElementById("btnEdit")?.classList.add("active");
}

/* ---------- INIT PAGE ---------- */
window.addEventListener("load", () => {
  // toggle initial areas
  if (localStorage.getItem("voted") === "true") {
    document.getElementById("voteSection").style.display = "none";
    document.getElementById("thankYouPage").style.display = "flex";
  } else {
    document.getElementById("voteSection").style.display = "block";
    document.getElementById("thankYouPage").style.display = "none";
  }

  // ensure login button visible / clickable
  const btnLogin = document.getElementById("btnLoginPanitia");
  btnLogin.style.display = "inline-block";
  btnLogin.style.pointerEvents = "auto";

  // small accessibility: allow Enter on focused login button
  btnLogin.addEventListener("keyup", (e) => { if (e.key === "Enter") toggleLogin(); });
});