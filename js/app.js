// IMPORTA SUPABASE DIRETO
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseSite = supabase;

document.addEventListener("DOMContentLoaded", ()=>{
  try{ AOS.init({ duration: 800, once: false, offset: 50 }); }catch(e){}
  try{ particlesJS("particles-js",{particles:{number:{value:80},color:{value:["#00e5ff","#7b61ff"]},shape:{type:"circle"},opacity:{value:0.5,random:true},size:{value:3,random:true},line_linked:{enable:true,distance:150,color:"#ffffff",opacity:0.15,width:1},move:{enable:true,speed:1.2,random:true}}}); }catch(e){}
});

const WHATSAPP_NUM="5517997474065";
let valorProjeto=160, etapaAtual=1, roiChart=null, logoBase64=null, todosSelecionados=false;
const TABELA_PRECOS = {"Clientes e CRM":15,"Estoque e Produtos":15,"Financeiro Completo":20,"Caixa PDV":15,"Ordens de Servico":15,"WhatsApp Automatico":20,"Agendamento":10,"Dashboard e Relatorios":15,"App Android":35,"App iOS":35,"Multi-empresas":15,"Nota Fiscal NFe":25,"Delivery e iFood":15,"Comissoes":8,"Contratos":8,"Chat Interno":8,"Assinatura Digital":10,"Fidelidade Cashback":10,"Catalogo Online":10,"Backup Automatico":8};
function getPrecoModulo(nome){ return TABELA_PRECOS[nome]??10; }
function carregarLogoPDF(){ const img=new Image(); img.crossOrigin="anonymous"; img.src='./assets/logo.png'; img.onload=()=>{ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; c.getContext('2d').drawImage(img,0,0); logoBase64=c.toDataURL('image/png'); }; }
carregarLogoPDF();

const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){ document.documentElement.setAttribute("data-theme",t); localStorage.setItem("theme",t); if(themeToggle) themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>'; }
if(themeToggle) themeToggle.addEventListener("click",()=>{ const a=document.documentElement.getAttribute("data-theme")||"dark"; aplicarTema(a==="light"?"dark":"light"); });
aplicarTema(localStorage.getItem("theme")||"dark");

function abrirImg(src){ const m=document.getElementById("img-modal"); const i=document.getElementById("img-modal-src"); if(!m||!i) return; i.src=src; m.classList.add("show"); document.body.style.overflow="hidden"; }
function fecharImg(){ const m=document.getElementById("img-modal"); if(m){ m.classList.remove("show"); document.body.style.overflow=""; } }
window.abrirImg=abrirImg; window.fecharImg=fecharImg;

function nextEtapa(n){
  document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active"));
  document.getElementById("etapa"+n).classList.add("active");
  etapaAtual=n;
  document.getElementById("progress").style.width=(n*25)+"%";
  window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"});
  salvarLeadParcial();
}
window.nextEtapa=nextEtapa;

function reiniciarSimulacao(){
  document.querySelectorAll(".modulo").forEach(m=>m.checked=false);
  document.getElementById("descricao").value=""; document.getElementById("negocio").selectedIndex=0; document.getElementById("usuarios").selectedIndex=0;
  document.getElementById("leadEmpresa").value=""; document.getElementById("leadEmail").value=""; document.getElementById("leadCidade").value="";
  const a=document.getElementById("leadNomeInicio"); if(a) a.value=""; const b=document.getElementById("leadWhatsappInicio"); if(b) b.value="";
  document.getElementById("ia-result").style.display="none"; document.getElementById("leadStatus").style.display="none";
  todosSelecionados=false; calcular(); nextEtapa(1);
}
window.reiniciarSimulacao=reiniciarSimulacao;

function selecionarTodos(){
  todosSelecionados=!todosSelecionados;
  document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados);
  const btn=document.querySelector(".btn-selecionar-todos");
  if(btn) btn.innerHTML=todosSelecionados?'<i class="fa-solid fa-xmark"></i> Desmarcar Todos':'<i class="fa-solid fa-layer-group"></i> Selecionar Todos - <span>Plano completo no máx R$ 487/mês</span>';
  calcular(); salvarLeadParcial();
}
window.selecionarTodos=selecionarTodos;

function normalizar(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }
const MODULOS_INTELIGENTE=[
  {nome:"Clientes e CRM", termos:["cliente","crm","caderno","planilha"]},
  {nome:"Estoque e Produtos", termos:["estoque","produto","sabor"]},
  {nome:"Financeiro Completo", termos:["financeiro","lucro","caixa"]},
  {nome:"WhatsApp Automatico", termos:["whats","zap","avisar"]},
  {nome:"Agendamento", termos:["agenda","horario"]},
  {nome:"Dashboard e Relatorios", termos:["relatorio","dashboard"]},
];

function interpretarIA(){
  const raw=document.getElementById("descricao").value; const r=document.getElementById("ia-result");
  if(!raw.trim()){ r.style.display="block"; r.innerHTML="Descrição é opcional."; return; }
  const t=normalizar(raw); let scores={};
  MODULOS_INTELIGENTE.forEach(mod=>{ mod.termos.forEach(term=>{ if(t.includes(normalizar(term))) scores[mod.nome]=(scores[mod.nome]||0)+1; }); });
  let detectados=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
  if(detectados.length===0) detectados=["Clientes e CRM","Dashboard e Relatorios"];
  document.querySelectorAll(".modulo").forEach(c=>c.checked=false);
  document.querySelectorAll(".modulo").forEach(c=>{ if(detectados.includes(c.dataset.nome)) c.checked=true; });
  r.style.display="block"; r.innerHTML=`<strong>IA detectou ${detectados.length}:</strong><br>• ${detectados.join("<br>• ")}`;
  calcular(); salvarLeadParcial();
}
window.interpretarIA=interpretarIA;

function calcular(){
  let total=160,mods=[];
  document.querySelectorAll(".modulo").forEach(m=>{ if(m.checked){ total+=getPrecoModulo(m.dataset.nome); mods.push({nome:m.dataset.nome,valor:getPrecoModulo(m.dataset.nome)}); } });
  total+=Number(document.getElementById("usuarios").value); valorProjeto=total;
  let mensalPix=Math.round(total*0.9), anualDe=total*12, anualCartao=Math.round(anualDe*0.8), anualPix=Math.round(anualCartao*0.9), parcelaAnual=(anualCartao/12).toFixed(2).replace('.',',');
  document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalValor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalPix").innerText=mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("anualDe").innerText="De "+anualDe.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  document.getElementById("anualValor").innerText=anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" (12x R$ "+parcelaAnual+")";
  document.getElementById("anualPix").innerText=anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  let prazo=total<=200?"5 a 10 dias":total<=300?"10 a 15 dias":total<=400?"15 a 25 dias":"25 a 40 dias";
  document.getElementById("prazo").innerHTML=`<strong>Prazo:</strong> ${prazo} | <strong>Módulos:</strong> ${mods.length}`;
  document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Mensal/Anual";
  let html=mods.length?"":"<li>Base - R$ 160/mês</li>"; mods.forEach(i=> html+=`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${i.nome} (+R$ ${i.valor})</li>`);
  document.getElementById("escopo").innerHTML=html;
  let eco=Math.round(total*0.85); document.getElementById("economia").innerText=`Economia: R$ ${eco}/mês`; document.getElementById("roiValor").innerText=eco;
  desenharROI(total,eco); window._dadosPlano={total,mensalPix,anualDe,anualCartao,anualPix,parcelaAnual};
}
window.calcular=calcular;

function desenharROI(inv,eco){
  const c=document.getElementById("roiChart"); if(!c) return; if(roiChart) roiChart.destroy();
  const labels=Array.from({length:12},(_,i)=>`Mês ${i+1}`); const ecoAcum=labels.map((_,i)=>eco*(i+1)); const invArr=labels.map(()=>inv);
  roiChart=new Chart(c.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"Economia",data:ecoAcum,borderColor:"#00ff88"},{label:"Invest",data:invArr,borderColor:"#7b61ff"}]},options:{responsive:true}});
}

function validarInicial(){
  const n=document.getElementById("leadNomeInicio").value.trim(); const w=document.getElementById("leadWhatsappInicio").value.replace(/\D/g,'');
  if(n.length<2){ alert("Nome"); return false; } if(w.length<10){ alert("Zap com DDD"); return false; } return true;
}

async function salvarLeadInicial(){
  if(!validarInicial()) return;
  const ok = await salvarLeadParcial(true);
  if(ok){ document.getElementById("leadStatus").style.display="block"; nextEtapa(2); }
  else{ alert("Erro ao salvar no Supabase - veja console F12"); }
}
window.salvarLeadInicial=salvarLeadInicial;

// FUNÇÃO QUE REALMENTE SALVA AGORA
async function salvarLeadParcial(forcar=false){
  const nome=document.getElementById("leadNomeInicio")?.value?.trim()||"";
  const zap=document.getElementById("leadWhatsappInicio")?.value||"";
  if(!forcar && (nome.length<2 || zap.replace(/\D/g,'').length<10)) return false;

  const lead={
    data:new Date().toLocaleString("pt-BR"),
    nome:nome||'Nao informou',
    whatsapp:zap,
    empresa:document.getElementById("leadEmpresa")?.value||'Nao informou',
    email:document.getElementById("leadEmail")?.value||'Nao informou',
    cidade:document.getElementById("leadCidade")?.value||'Nao informou',
    negocio:document.getElementById("negocio")?.value||'Nao selecionou',
    valor:document.getElementById("valor")?.innerText||'R$ 160/mês',
    descricao:document.getElementById("descricao")?.value||'Parou no inicio',
    escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", ")||'Base',
    etapa:`Etapa ${etapaAtual}`,
    plano:document.querySelector('input[name="plano"]:checked')?.value||'mensal',
    status:'Interesse'
  };

  try{ localStorage.setItem("leadParcialDA",JSON.stringify(lead)); }catch(e){}

  const { data, error } = await supabase.from('leads').insert([lead]).select();
  if(error){ console.error("ERRO SUPABASE:", error); return false; }
  else{ console.log("SALVOU:", data); return true; }
}
window.salvarLeadParcial=salvarLeadParcial;

async function enviarWhatsappComPDF(){
  if(!validarInicial()){ nextEtapa(1); return; }
  calcular(); await salvarLeadParcial(true);
  const d=window._dadosPlano; const nome=document.getElementById("leadNomeInicio").value; const zap=document.getElementById("leadWhatsappInicio").value;
  const msg=`*NOVA LEAD - DA SOFTWARE*\nCliente:${nome}\nZap:${zap}\nValor:${d.total}\nNegocio:${document.getElementById("negocio").value}\nDesc:${document.getElementById("descricao").value}`;
  window.open(`https://wa.me/5517997474065?text=${encodeURIComponent(msg)}`,"_blank");
}
window.enviarWhatsappComPDF=enviarWhatsappComPDF;

let recognition=null, gravando=false, textoAcumulado="";
function toggleGravacao(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR){alert("Use Chrome");return;}
  const btn=document.getElementById("btnAudio"), icon=document.getElementById("iconMic"), status=document.getElementById("audioStatus"), descricao=document.getElementById("descricao");
  if(gravando){ gravando=false; btn.classList.remove("gravando"); icon.className="fa-solid fa-microphone"; status.style.display="none"; try{recognition.stop();}catch(e){} return; }
  textoAcumulado=descricao.value?descricao.value+" ":""; recognition=new SR(); recognition.lang="pt-BR"; recognition.continuous=true; recognition.interimResults=true;
  recognition.onstart=()=>{ gravando=true; btn.classList.add("gravando"); icon.className="fa-solid fa-stop"; status.style.display="block"; };
  recognition.onresult=(e)=>{ let final=""; for(let i=0;i<e.results.length;i++){ if(e.results[i].isFinal) final+=e.results[i][0].transcript+" "; } if(final){ descricao.value=textoAcumulado+final; interpretarIA(); } };
  recognition.start();
}
window.toggleGravacao=toggleGravacao;
function reiniciarSimulacao(){ location.reload(); }

document.addEventListener("change",()=>{ if(etapaAtual>=2) calcular(); salvarLeadParcial(); });
calcular();
