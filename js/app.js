document.addEventListener("DOMContentLoaded", ()=>{
  try{ AOS.init({ duration: 800, once: false, offset: 50 }); }catch(e){}
  try{ particlesJS("particles-js",{particles:{number:{value:80},color:{value:["#00e5ff","#7b61ff"]},shape:{type:"circle"},opacity:{value:0.5,random:true},size:{value:3,random:true},line_linked:{enable:true,distance:150,color:"#ffffff",opacity:0.15,width:1},move:{enable:true,speed:1.2,random:true}}}); }catch(e){}
});
const WHATSAPP_NUM="5517997474065";
let valorProjeto=160, etapaAtual=1, roiChart=null, logoBase64=null, todosSelecionados=false;
const TABELA_PRECOS = {"Clientes e CRM":15,"Estoque e Produtos":15,"Financeiro Completo":20,"Caixa PDV":15,"WhatsApp Automatico":20,"Agendamento":10,"Dashboard e Relatorios":15,"App Android":35,"App iOS":35,"Nota Fiscal NFe":25,"Delivery e iFood":15,"Fidelidade Cashback":10,"Multi-empresas":15,"Ordens de Servico":15,"Comissoes":8,"Backup Automatico":8};
function getPrecoModulo(n){return TABELA_PRECOS[n]||10;}
function carregarLogoPDF(){const img=new Image();img.crossOrigin="anonymous";img.src='./assets/logo.png';img.onload=function(){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);logoBase64=c.toDataURL('image/png');};}
carregarLogoPDF();
const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);if(themeToggle)themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';}
if(themeToggle)themeToggle.addEventListener("click",()=>{aplicarTema((document.documentElement.getAttribute("data-theme")||"dark")==="light"?"dark":"light");});
aplicarTema(localStorage.getItem("theme")||"dark");
function nextEtapa(n){document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active"));document.getElementById("etapa"+n).classList.add("active");etapaAtual=n;document.getElementById("progress").style.width=(n*25)+"%";window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"});salvarLeadParcial();}
function salvarLeadInicial(){const n=document.getElementById("leadNomeInicio").value.trim(),w=document.getElementById("leadWhatsappInicio").value.trim();if(!n||w.length<10){alert("Preencha nome e WhatsApp");return;}salvarLeadParcial(true);nextEtapa(2);}
function selecionarTodos(){todosSelecionados=!todosSelecionados;document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados);calcular();}
function normalizar(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}
function interpretarIA(){const t=normalizar(document.getElementById("descricao").value);let s={};if(t.includes("estoque")||t.includes("sabor"))s["Estoque e Produtos"]=1;if(t.includes("venda")||t.includes("pdv"))s["Caixa PDV"]=1;if(t.includes("whats")||t.includes("zap"))s["WhatsApp Automatico"]=1;let d=Object.keys(s);if(d.length==0)d=["Clientes e CRM","Caixa PDV"];document.querySelectorAll(".modulo").forEach(c=>c.checked=d.includes(c.dataset.nome));document.getElementById("ia-result").style.display="block";document.getElementById("ia-result").innerHTML="Detectado: "+d.join(", ");calcular();}
function calcular(){
  let total=160,mods=[];
  document.querySelectorAll(".modulo").forEach(m=>{if(m.checked){let p=getPrecoModulo(m.dataset.nome);total+=p;mods.push({nome:m.dataset.nome,valor:p});}});
  total+=Number(document.getElementById("usuarios").value);
  valorProjeto=total;
  let mensalPix=Math.round(total*0.9);
  let anualDe=total*12;
  let anualCartao=Math.round(anualDe*0.8);
  let anualPix=Math.round(anualCartao*0.9);
  let parcela=(anualCartao/12).toFixed(2);
  document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalValor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalPix").innerText=mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("anualDe").innerText="De "+anualDe.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  document.getElementById("anualValor").innerText=anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" (12x R$ "+parcela+")";
  document.getElementById("anualPix").innerText=anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Mensal/Anual";
  let html=mods.length?"":"<li>Base R$ 160/mês</li>";mods.forEach(i=>html+=`<li>${i.nome} (+R$ ${i.valor}/mês)</li>`);
  document.getElementById("escopo").innerHTML=html;
  document.getElementById("prazo").innerText="Prazo: "+(total<=300?"10 a 15 dias":"15 a 25 dias");
  document.getElementById("roiValor").innerText=Math.round(total*0.85).toString();
  window._dadosPlano={total,mensalPix,anualDe,anualCartao,anualPix,parcela};
  desenharROI(total,Math.round(total*0.85));
}
function desenharROI(inv,eco){const c=document.getElementById("roiChart");if(!c)return;if(roiChart)roiChart.destroy();const labels=Array.from({length:12},(_,i)=>`Mês ${i+1}`);roiChart=new Chart(c.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"Invest",data:labels.map(()=>inv),borderColor:"#7b61ff"},{label:"Economia",data:labels.map((_,i)=>eco*(i+1)),borderColor:"#00e5ff",fill:true}]},options:{plugins:{legend:{labels:{color:"#fff"}}},scales:{x:{ticks:{color:"#aaa"}},y:{ticks:{color:"#aaa"}}}});}
const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";
function salvarLeadParcial(forcar=false){
  const nome=document.getElementById("leadNomeInicio")?.value||"";const zap=document.getElementById("leadWhatsappInicio")?.value||"";
  if(!forcar&&(nome.length<2||zap.length<10))return;
  const lead={data:new Date().toLocaleString("pt-BR"),nome,zap,whatsapp:zap,negocio:document.getElementById("negocio")?.value,valor:document.getElementById("valor")?.innerText,escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", "),etapa:`Etapa ${etapaAtual}`};
  try{localStorage.setItem("leadParcialDA",JSON.stringify(lead));}catch(e){}
  try{fetch(`${SUPABASE_URL}/rest/v1/leads`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(lead)});}catch(e){}
}
async function gerarPDFBlob(){
  const {jsPDF}=window.jspdf;const doc=new jsPDF('p','mm','a4');const W=210;
  doc.setFillColor(5,8,22);doc.rect(0,0,W,297,"F");
  doc.setTextColor(255,255,255);doc.text("DA SOFTWARE - Proposta Mensal e Anual",15,20);
  const d=window._dadosPlano;
  doc.text(`Cliente: ${document.getElementById("leadNomeInicio").value} - ${document.getElementById("leadWhatsappInicio").value}`,15,30);
  doc.text(`Mensal: ${d.total} / Mensal PIX: ${d.mensalPix}`,15,40);
  doc.text(`Anual Cartao: ${d.anualCartao} (12x ${d.parcela}) - De ${d.anualDe}`,15,50);
  doc.text(`Anual PIX: ${d.anualPix} - Renovacao apos 12 meses`,15,60);
  let y=70;document.querySelectorAll(".modulo:checked").forEach(m=>{doc.text("- "+m.dataset.nome,15,y);y+=6;});
  return doc;
}
async function enviarWhatsappComPDF(){
  calcular();salvarLeadParcial(true);
  const doc=await gerarPDFBlob();doc.save(`DA-${document.getElementById("leadNomeInicio").value}.pdf`);
  const d=window._dadosPlano;
  const plano=document.querySelector('input[name="plano"]:checked')?.value;
  let esc="";document.querySelectorAll(".modulo:checked").forEach(m=>{esc+=`> ${m.dataset.nome}\n`;});
  const msg=`*${document.getElementById("leadNomeInicio").value} - PLANO ${plano.toUpperCase()}*\nMensal: R$ ${d.total}/mês | PIX mensal R$ ${d.mensalPix}\nAnual: R$ ${d.anualCartao} (12x R$ ${d.parcela}) | PIX anual R$ ${d.anualPix}\nModulos:\n${esc}\nWhats: ${document.getElementById("leadWhatsappInicio").value}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`,"_blank");
}
document.addEventListener("change",()=>{if(etapaAtual>=2)calcular();salvarLeadParcial();});
calcular();
