// ===== Firebase Config =====
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

// ===== Kandidat =====
let mpkCandidates = [
  {name:"Kandidat 1", img:"https://picsum.photos/200?random=1"},
  {name:"Kandidat 2", img:"https://picsum.photos/200?random=2"},
  {name:"Kandidat 3", img:"https://picsum.photos/200?random=3"},
  {name:"Kandidat 4", img:"https://picsum.photos/200?random=4"}
];
let osisCandidates = [
  {name:"Kandidat 1", img:"https://picsum.photos/200?random=5"},
  {name:"Kandidat 2", img:"https://picsum.photos/200?random=6"},
  {name:"Kandidat 3", img:"https://picsum.photos/200?random=7"},
  {name:"Kandidat 4", img:"https://picsum.photos/200?random=8"},
  {name:"Kandidat 5", img:"https://picsum.photos/200?random=9"},
  {name:"Kandidat 6", img:"https://picsum.photos/200?random=10"}
];
let votes = {mpk:{}, osis:{}};

// ===== Render Kandidat =====
function renderCandidates(){
  const mpkWrap=document.getElementById("mpkCandidates");
  const osisWrap=document.getElementById("osisCandidates");
  mpkWrap.innerHTML=""; osisWrap.innerHTML="";
  mpkCandidates.forEach((c,i)=>{
    mpkWrap.innerHTML+=`<div class="card" onclick="selectCandidate('mpk',${i},this)">
      <div class="number">#${i+1}</div>
      <img src="${c.img}"><h3>${c.name}</h3>
      <input type="radio" name="mpk" value="${i}"></div>`;
  });
  osisCandidates.forEach((c,i)=>{
    osisWrap.innerHTML+=`<div class="card" onclick="selectCandidate('osis',${i},this)">
      <div class="number">#${i+1}</div>
      <img src="${c.img}"><h3>${c.name}</h3>
      <input type="radio" name="osis" value="${i}"></div>`;
  });
}
renderCandidates();

// ===== Pilih Kandidat =====
function selectCandidate(type,index,el){
  document.querySelectorAll(`#${type}Candidates .card`).forEach(c=>c.classList.remove("selected"));
  el.classList.add("selected");
  el.querySelector('input').checked=true;
}

// ===== Voting =====
async function submitVote(){
  const mpk=document.querySelector('input[name="mpk"]:checked');
  const osis=document.querySelector('input[name="osis"]:checked');
  if(!mpk || !osis){ showNotif("Pilih kandidat MPK dan OSIS!","red"); return; }
  try {
    await db.collection("votes").doc("mpk").set(
      { [mpk.value]: firebase.firestore.FieldValue.increment(1) }, { merge:true }
    );
    await db.collection("votes").doc("osis").set(
      { [osis.value]: firebase.firestore.FieldValue.increment(1) }, { merge:true }
    );
    localStorage.setItem("voted","true");
    document.getElementById("voteSection").style.display="none";
    document.getElementById("thankYouPage").style.display="block";
    showNotif("Suara berhasil dikirim ✅","#28a745");
  } catch(err){ showNotif("Gagal kirim suara ⚠️","red"); }
}

// ===== Admin Login =====
function toggleLogin(){ 
  document.getElementById("voteSection").style.display="none"; 
  document.getElementById("adminLogin").classList.add("active"); 
}
function checkAdmin(){
  if(document.getElementById("adminPass").value==="admin123"){
    document.getElementById("adminLogin").classList.remove("active");
    document.getElementById("voteSection").style.display="none";
    document.getElementById("thankYouPage").style.display="none";
    document.getElementById("adminPanel").style.display="block";

    document.getElementById("adminSettings").classList.remove("hidden");
    document.getElementById("btnLoginPanitia").style.display="none";

    loadVotes();
    showTab("hasil");
    showNotif("✔️ Login berhasil","#28a745");
  } else showNotif("Password salah!","red");
}
document.getElementById("adminPass").addEventListener("keyup",e=>{
  if(e.key==="Enter"){ checkAdmin(); }
});
function backToVoting(){
  document.getElementById("adminLogin").classList.remove("active");
  document.getElementById("adminPanel").style.display="none";
  if(localStorage.getItem("voted")==="true"){
    document.getElementById("thankYouPage").style.display="block";
    document.getElementById("voteSection").style.display="none";
  } else {
    document.getElementById("voteSection").style.display="block";
    document.getElementById("thankYouPage").style.display="none";
  }
}
function logoutAdmin(){
  document.getElementById("adminPanel").style.display="none";
  document.getElementById("adminSettings").classList.add("hidden");
  document.getElementById("btnLoginPanitia").style.display="inline-block";
  if(localStorage.getItem("voted")==="true"){
    document.getElementById("thankYouPage").style.display="block";
    document.getElementById("voteSection").style.display="none";
  } else {
    document.getElementById("voteSection").style.display="block";
    document.getElementById("thankYouPage").style.display="none";
  }
  showNotif("Panitia logout ✔️","#007bff");
}

// ===== Tab Control =====
function showTab(tab){
  document.getElementById("tab-hasil").style.display = (tab==="hasil")?"block":"none";
  document.getElementById("tab-edit").style.display = (tab==="edit")?"block":"none";
  document.getElementById("btnHasil").classList.remove("active");
  document.getElementById("btnEdit").classList.remove("active");
  if(tab==="hasil") document.getElementById("btnHasil").classList.add("active");
  if(tab==="edit") document.getElementById("btnEdit").classList.add("active");
}

// ===== Reset Voting Modal =====
function resetVote(){ document.getElementById("resetModal").style.display="flex"; }
function closeResetModal(){ document.getElementById("resetModal").style.display="none"; }
async function confirmReset(){
  try {
    let resetMPK={}, resetOSIS={};
    mpkCandidates.forEach((c,i)=> resetMPK[i]=0 );
    osisCandidates.forEach((c,i)=> resetOSIS[i]=0 );
    await db.collection("votes").doc("mpk").set(resetMPK);
    await db.collection("votes").doc("osis").set(resetOSIS);
    localStorage.removeItem("voted");
    showTab("hasil");
    showNotif("✅ Voting berhasil direset","#ffc107");
  } catch(err){ showNotif("⚠️ Gagal reset voting","red"); }
  closeResetModal();
}

// ===== Chart Realtime =====
let mpkChart, osisChart;
function loadVotes(){
  db.collection("votes").doc("mpk").onSnapshot((snap)=>{
    votes.mpk=snap.exists?snap.data():{};
    renderCharts(); renderEditVotes();
  });
  db.collection("votes").doc("osis").onSnapshot((snap)=>{
    votes.osis=snap.exists?snap.data():{};
    renderCharts(); renderEditVotes();
  });
}
function renderCharts(){
  const mpkData=mpkCandidates.map((c,i)=>votes.mpk[i]||0);
  const osisData=osisCandidates.map((c,i)=>votes.osis[i]||0);
  const totalMPK=mpkData.reduce((a,b)=>a+b,0);
  const totalOSIS=osisData.reduce((a,b)=>a+b,0);
  document.getElementById("titleMPK").innerHTML=`Hasil Voting MPK (Total: ${totalMPK})`;
  document.getElementById("titleOSIS").innerHTML=`Hasil Voting OSIS (Total: ${totalOSIS})`;
  if(mpkChart) mpkChart.destroy();
  if(osisChart) osisChart.destroy();
  mpkChart=new Chart(document.getElementById("chartMPK"),{
    type:"bar",
    data:{labels:mpkCandidates.map(c=>c.name),
      datasets:[{label:"Suara MPK",data:mpkData,backgroundColor:"#4CAF50"}]},
    options:{scales:{y:{beginAtZero:true}}}
  });
  osisChart=new Chart(document.getElementById("chartOSIS"),{
    type:"bar",
    data:{labels:osisCandidates.map(c=>c.name),
      datasets:[{label:"Suara OSIS",data:osisData,backgroundColor:"#2196F3"}]},
    options:{scales:{y:{beginAtZero:true}}}
  });
}

// ===== Edit Voting =====
function renderEditVotes(){
  const container=document.getElementById("editVotes"); container.innerHTML="";
  mpkCandidates.forEach((c,i)=>{
    container.innerHTML+=`<div><h4>MPK ${c.name}</h4><input type="number" id="editMPK${i}" value="${votes.mpk[i]||0}" min="0"></div>`;
  });
  osisCandidates.forEach((c,i)=>{
    container.innerHTML+=`<div><h4>OSIS ${c.name}</h4><input type="number" id="editOSIS${i}" value="${votes.osis[i]||0}" min="0"></div>`;
  });
}
async function saveEdits(){
  mpkCandidates.forEach((c,i)=>{ votes.mpk[i]=parseInt(document.getElementById(`editMPK${i}`).value)||0; });
  osisCandidates.forEach((c,i)=>{ votes.osis[i]=parseInt(document.getElementById(`editOSIS${i}`).value)||0; });
  await db.collection("votes").doc("mpk").set(votes.mpk);
  await db.collection("votes").doc("osis").set(votes.osis);
  showNotif("Perubahan tersimpan ✔️","#28a745");
  renderCharts();
}

// ===== Download CSV =====
function downloadCSV(){
  let csv="Tipe,Kandidat,Suara\n";
  mpkCandidates.forEach((c,i)=>csv+=`MPK,${c.name},${votes.mpk[i]||0}\n`);
  osisCandidates.forEach((c,i)=>csv+=`OSIS,${c.name},${votes.osis[i]||0}\n`);
  const blob=new Blob([csv],{type:"text/csv"});
  const link=document.createElement("a");
  link.href=URL.createObjectURL(blob);
  link.download="hasil_voting.csv"; link.click();
}

// ===== Notif Slide =====
function showNotif(msg,color="#28a745"){
  const notif=document.getElementById("notifSlide");
  notif.textContent=msg; notif.style.background=color;
  notif.classList.add("show");
  setTimeout(()=>notif.classList.remove("show"),3000);
}

// ===== Status awal =====
window.onload=function(){
  if(localStorage.getItem("voted")==="true"){
    document.getElementById("voteSection").style.display="none";
    document.getElementById("thankYouPage").style.display="block";
  } else {
    document.getElementById("voteSection").style.display="block";
  }
};

// ===== Toggle Settings Dropdown =====
function toggleSettings(){
  const dropdown = document.getElementById("settingsDropdown");
  if(dropdown.style.display==="block"){ dropdown.style.display="none"; }
  else { dropdown.style.display="block"; }
}
window.addEventListener("click", function(e){
  if(!e.target.matches('.settings-btn')){
    document.getElementById("settingsDropdown").style.display="none";
  }
});