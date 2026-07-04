
const sections=["SOF","AOF","MOF","EOF"];
const baseUrl = "../";
let current="Hull";

function makeTabs(){
 const tabs=document.getElementById("deptTabs");
 sections.forEach((s,i)=>{
  tabs.innerHTML+=`<li class="nav-item"><button class="nav-link ${i==0?'active':''}" onclick="showDept('${s}',this)">${s}</button></li>`;
 });
}

async function loadStatus(sec){
 const r=await fetch(baseUrl+sec+"ToDisplay.json?t="+Date.now());
 return await r.json();
}

async function loadDrawings(sec){
 const r=await fetch(baseUrl+sec+"Drawings.json?t="+Date.now());
 return await r.json();
}

async function refresh(){
 let today=0,tom=0,delay=0,wIssued=0,wTotal=0;
 for(const s of sections){
   const st=await loadStatus(s);
   const issued=parseInt(st["5"]||0);
   const total=parseInt(st["1"]||0);
   wIssued+=issued;
   wTotal+=total;
   const d=await loadDrawings(s);
   let dToday=0,dTom=0,dDelay=0;
   const now=new Date();
   const t0=now.toISOString().slice(0,10);
   const t1=new Date(now);t1.setDate(now.getDate()+1);
   const t1s=t1.toISOString().slice(0,10);
   Object.values(d).forEach(x=>{
      if(x.Issue_Date===t0)dToday++;
      if(x.Target_Date===t1s)dTom++;
      if(x.Issue_Date==="" && x.Target_Date<t0)dDelay++;
   });
   today+=dToday;tom+=dTom;delay+=dDelay;
 }
 document.getElementById("today").textContent=today;
 document.getElementById("tomorrow").textContent=tom;
 document.getElementById("delay").textContent=delay;
 document.getElementById("weekly").textContent=(wTotal?Math.round(wIssued*100/wTotal):0)+"%";
 showDept(current);
}

async function showDept(sec,btn){
 current=sec;
 document.querySelectorAll(".nav-link").forEach(x=>x.classList.remove("active"));
 if(btn)btn.classList.add("active");
 const st=await loadStatus(sec);
 const issued=parseInt(st["5"]||0);
 const total=parseInt(st["1"]||0);
 const pct=total?Math.round(issued*100/total):0;
 document.getElementById("deptContent").innerHTML=`
<div class="card">
<div class="card-body">
<h4>${sec}</h4>
<div class="mb-2">${pct}% Complete</div>
<div class="progress mb-3">
<div class="progress-bar bg-success" style="width:${pct}%">${pct}%</div>
</div>
<ul class="list-group">
<li class="list-group-item">Total Drawings : ${total}</li>
<li class="list-group-item">Issued : ${issued}</li>
<li class="list-group-item">Pending : ${total-issued}</li>
</ul>
<canvas id="c" class="mt-3"></canvas>
</div></div>`;
 const ctx=document.getElementById("c");
 new Chart(ctx,{type:"doughnut",
 data:{datasets:[{data:[issued,total-issued],backgroundColor:["#2ea043","#FF4B33"]}]},
 options:{plugins:{legend:{display:false}}}});
}

makeTabs();
refresh();
setInterval(refresh,30000);
