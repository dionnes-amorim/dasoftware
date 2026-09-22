document.addEventListener("DOMContentLoaded", ()=>{
  try{ AOS.init({ duration: 800, once: false, offset: 50 }); }catch(e){}
  try{ particlesJS("particles-js",{particles:{number:{value:80},color:{value:["#00e5ff","#7b61ff"]},shape:{type:"circle"},opacity:{value:0.5,random:true},size:{value:3,random:true},line_linked:{enable:true,distance:150,color:"#ffffff",opacity:0.15,width:1},move:{enable:true,speed:1.2,random:true}}}); }catch(e){}
});
const WHATSAPP_NUM="5517997474065";
let valorProjeto=160, etapaAtual=1, roiChart=null, logoBase64=null, todosSelecionados=false;
const TABELA_PRECOS = {
  "Clientes e CRM":15,"Estoque e Produtos":15,"Financeiro Completo":20,"Caixa PDV":15,
  "Ordens de Servico":15,"WhatsApp Automatico":20,"Agendamento":10,"Dashboard e Relatorios":15,
  "App Android":35,"App iOS":35,"Multi-empresas":15,"Nota Fiscal NFe":25,"Delivery e iFood":15,
  "Comissoes":8,"Contratos":8,"Chat Interno":8,"Assinatura Digital":10,"Fidelidade Cashback":10,
  "Catalogo Online":10,"Backup Automatico":8
};
function getPrecoModulo(n){return TABELA_PRECOS[n]||10;}
function carregarLogoPDF(){const img=new Image();img.crossOrigin="anonymous";img.src='./assets/logo.png';img.onload=function(){const c=document.createElement('canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);logoBase64=c.toDataURL('image/png');};}
carregarLogoPDF();
const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);if(themeToggle)themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';}
if(themeToggle)themeToggle.addEventListener("click",()=>{const a=document.documentElement.getAttribute("data-theme")||"dark";aplicarTema(a==="light"?"dark":"light");});
aplicarTema(localStorage.getItem("theme")||"dark");
function nextEtapa(n){document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active"));document.getElementById("etapa"+n).classList.add("active");etapaAtual=n;document.getElementById("progress").style.width=(n*25)+"%";window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"});salvarLeadParcial();}
function reiniciarSimulacao(){document.querySelectorAll(".modulo").forEach(m=>m.checked=false);document.getElementById("descricao").value="";document.getElementById("negocio").selectedIndex=0;document.getElementById("usuarios").selectedIndex=0;document.getElementById("leadEmpresa").value="";document.getElementById("leadEmail").value="";document.getElementById("leadCidade").value="";document.getElementById("ia-result").style.display="none";todosSelecionados=false;calcular();nextEtapa(1);}
function selecionarTodos(){todosSelecionados=!todosSelecionados;document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados);const btn=document.querySelector(".btn-selecionar-todos");if(btn)btn.innerHTML=todosSelecionados?'<i class="fa-solid fa-xmark"></i> Desmarcar Todos':'<i class="fa-solid fa-layer-group"></i> Selecionar Todos - Máx R$ 487/mês';calcular();}
function normalizar(s){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();}
const MODULOS_INTELIGENTE=[{nome:"Clientes e CRM",termos:["cliente","crm","caderno","planilha"]},{nome:"Estoque e Produtos",termos:["estoque","produto","sabor"]},{nome:"Financeiro Completo",termos:["financeiro","caixa","lucro"]},{nome:"Caixa PDV",termos:["pdv","venda"]},{nome:"WhatsApp Automatico",termos:["whats","zap","avisar"]},{nome:"Agendamento",termos:["agenda","horario"]},{nome:"Delivery e iFood",termos:["delivery","ifood"]},{nome:"Fidelidade Cashback",termos:["fidelidade","pontos"]},];
function interpretarIA(){const raw=document.getElementById("descricao").value;const r=document.getElementById("ia-result");if(!raw.trim()){r.style.display="block";r.innerHTML="Descrição opcional.";return;}const t=normalizar(raw);let scores={};MODULOS_INTELIGENTE.forEach(mod=>{mod.termos.forEach(term=>{if(t.includes(normalizar(term)))scores[mod.nome]=(scores[mod.nome]||0)+1;});});let detectados=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,6).map(e=>e[0]);if(detectados.length===0)detectados=["Clientes e CRM","Caixa PDV"];document.querySelectorAll(".modulo").forEach(c=>c.checked=false);document.querySelectorAll(".modulo").forEach(c=>{if(detectados.includes(c.dataset.nome))c.checked=true;});r.style.display="block";r.innerHTML=`<strong>Detectamos:</strong><br>• ${detectados.join("<br>• ")}`;calcular();}
function calcular(){
  let total=160,mods=[];
  document.querySelectorAll(".modulo").forEach(m=>{if(m.checked){let p=getPrecoModulo(m.dataset.nome);total+=p;mods.push({nome:m.dataset.nome,valor:p});}});
  total+=Number(document.getElementById("usuarios").value);
  valorProjeto=total;

  // MENSAL
  let mensalPix = Math.round(total*0.9);
  // ANUAL: 12 meses com 20% OFF, PIX anual mais 10%
  let anualDe = total*12;
  let anualCartao = Math.round(anualDe*0.8);
  let anualPix = Math.round(anualCartao*0.9);
  let parcelaAnual = (anualCartao/12).toFixed(2).replace('.',',');

  document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalValor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  document.getElementById("mensalPix").innerText=mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês no PIX";
  document.getElementById("anualDe").innerText="De "+anualDe.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" por";
  document.getElementById("anualValor").innerText=anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" no anual (12x R$ "+parcelaAnual+")";
  document.getElementById("anualPix").innerText=anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" no PIX anual";

  let prazo=total<=200?"5 a 10 dias":total<=300?"10 a 15 dias":total<=400?"15 a 25 dias":"25 a 40 dias";
  document.getElementById("prazo").innerHTML=`<strong>Prazo:</strong> ${prazo} | <strong>Plano mensal + anual disponível</strong>`;
  document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Plano Mensal/Anual";
  let html=mods.length?"":"<li>Sistema base - R$ 160/mês</li>"; mods.forEach(i=> html+=`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${i.nome} <span style="opacity:.5">(+R$ ${i.valor}/mês)</span></li>`);
  document.getElementById("escopo").innerHTML=html;
  let eco=Math.round(total*0.85); document.getElementById("economia").innerText=`Economia: R$ ${eco.toLocaleString("pt-BR")}/mês`;
  document.getElementById("roiValor").innerText=eco.toLocaleString("pt-BR");
  desenharROI(total,eco);

  // Salva pra PDF
  window._dadosPlano = {total, mensalPix, anualDe, anualCartao, anualPix, parcelaAnual};
}
function desenharROI(inv,eco){const c=document.getElementById("roiChart");if(!c)return;if(roiChart)roiChart.destroy();const labels=Array.from({length:12},(_,i)=>`Mês ${i+1}`);const ecoAcum=labels.map((_,i)=>eco*(i+1));const invArr=labels.map(()=>inv);roiChart=new Chart(c.getContext("2d"),{type:"line",data:{labels,[STRIPPED] Mensal",data:invArr,[STRIPPED] Acumulada",data:ecoAcum,[STRIPPED]
function validarInicial(){const n=document.getElementById("leadNomeInicio").value.trim(),w=document.getElementById("leadWhatsappInicio").value.trim();if(!n||w.length<10){alert("Preencha Nome e WhatsApp");return false;}return true;}
const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";
function salvarLeadInicial(){if(!validarInicial())return;salvarLeadParcial(true);nextEtapa(2);}
function salvarLeadParcial(forcar=false){
  const nome=document.getElementById("leadNomeInicio")?.value||"";const zap=document.getElementById("leadWhatsappInicio")?.value||"";
  if(!forcar&&(nome.length<2||zap.length<10))return;
  const lead={data:new Date().toLocaleString("pt-BR"),nome:nome||'Não informou',whatsapp:zap||'Não informou',empresa:document.getElementById("leadEmpresa")?.value||'Ainda não',email:document.getElementById("leadEmail")?.value||'Ainda não',cidade:document.getElementById("leadCidade")?.value||'Não informou',negocio:document.getElementById("negocio")?.value||'Não selecionou',valor:document.getElementById("valor")?.innerText||'R$ 160/mês',descricao:document.getElementById("descricao")?.value||'Parou no início',escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", ")||'Base',etapa:`Etapa ${etapaAtual}`, plano_selecionado: document.querySelector('input[name="plano"]:checked')?.value || 'mensal'};
  try{localStorage.setItem("leadParcialDA",JSON.stringify(lead));}catch(e){}
  try{fetch(`${SUPABASE_URL}/rest/v1/leads`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(lead)});}catch(e){}
}
async function gerarPDFBlob(){
  await new Promise(r=>setTimeout(r,400));
  const {jsPDF}=window.jspdf;const doc=new jsPDF('p','mm','a4');const W=210,H=297;
  doc.setFillColor(5,8,22);doc.rect(0,0,W,H,"F");doc.setFillColor(0,229,255);doc.rect(0,0,W,7,"F");
  if(logoBase64){try{doc.addImage(logoBase64,'PNG',15,10,11,11);}catch(e){}doc.setTextColor(255,255,255);doc.setFontSize(15);doc.setFont("helvetica","bold");doc.text("SOFTWARE",29,18);}
  doc.setFontSize(7);doc.setTextColor(180,180,200);doc.text("PLANO MENSAL OU ANUAL COM DESCONTO",15,23);
  doc.setDrawColor(0,229,255);doc.line(15,25,W-15,25);
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont("helvetica","bold");doc.text("Proposta Mensal e Anual",15,33);
  doc.setFontSize(9);doc.setTextColor(200,200,220);doc.setFont("helvetica","normal");
  doc.text(`Cliente: ${document.getElementById("leadNomeInicio").value}`,15,38);
  doc.text(`Segmento: ${document.getElementById("negocio").value} | ${new Date().toLocaleDateString("pt-BR")}`,15,42);
  doc.text(`WhatsApp: ${document.getElementById("leadWhatsappInicio").value}`,15,46);
  const d=window._dadosPlano||{total:valorProjeto,mensalPix:Math.round(valorProjeto*0.9),anualDe:valorProjeto*12,anualCartao:Math.round(valorProjeto*12*0.8),anualPix:Math.round(valorProjeto*12*0.8*0.9),parcelaAnual:(Math.round(valorProjeto*12*0.8)/12).toFixed(2)};
  doc.setFillColor(16,22,42);doc.roundedRect(15,50,W-30,36,3,3,"F");
  doc.setTextColor(0,229,255);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text("MENSAL",18,56);
  doc.setTextColor(255,255,255);doc.setFontSize(16);doc.text(`${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês`,18,64);
  doc.setFontSize(8);doc.setTextColor(0,255,136);doc.text(`PIX mensal: ${d.mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês`,18,68);
  doc.setTextColor(123,97,255);doc.setFontSize(8);doc.setFont("helvetica","bold");doc.text("ANUAL 20% OFF (MAIS VENDIDO)",18,76);
  doc.setTextColor(255,255,255);doc.setFontSize(12);doc.text(`${d.anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} anual (12x R$ ${d.parcelaAnual})`,18,82);
  doc.setTextColor(0,255,136);doc.setFontSize(9);doc.text(`ANUAL NO PIX: ${d.anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} - Economiza 28%`,95,64);
  doc.setTextColor(200,200,200);doc.setFontSize(7);doc.text("Renovação após 12 meses mantendo desconto",18,86);
  doc.setTextColor(255,255,255);doc.setFontSize(9);doc.setFont("helvetica","bold");doc.text(`Prazo: ${document.getElementById("prazo").innerText}`,15,92);
  let y=98; doc.setFontSize(8);doc.setFont("helvetica","normal");doc.setTextColor(200,200,200);
  let descLinhas=doc.splitTextToSize(document.getElementById("descricao").value||"Modulos manuais",W-30);doc.text(descLinhas,15,y);y+=descLinhas.length*4+6;
  doc.setTextColor(255,255,255);doc.text("Módulos:",15,y);y+=6;
  document.querySelectorAll(".modulo:checked").forEach(m=>{if(y>H-20){doc.addPage();doc.setFillColor(5,8,22);doc.rect(0,0,W,H,"F");y=15;}doc.setFillColor(23,32,51);doc.roundedRect(15,y-3,W-30,8,2,2,"F");doc.setTextColor(230,230,255);doc.text(`- ${m.dataset.nome} (+R$ ${getPrecoModulo(m.dataset.nome)}/mês)`,18,y+1);y+=10;});
  doc.addPage();doc.setFillColor(5,8,22);doc.rect(0,0,W,H,"F");doc.setFillColor(0,229,255);doc.rect(0,0,W,7,"F");
  doc.setTextColor(255,255,255);doc.setFontSize(13);doc.setFont("helvetica","bold");doc.text("RETORNO ESTIMADO",15,16);
  try{const canvas=document.getElementById("roiChart");if(canvas){doc.addImage(canvas.toDataURL("image/png",1.0),'PNG',10,28,W-20,85);}}catch(e){}
  doc.setFontSize(8);doc.setTextColor(180,180,200);doc.text("Plano mensal flexível ou anual com 20% OFF + 10% no PIX. Renovação após 12 meses.",15,H-10);
  return doc;
}
async function enviarWhatsappComPDF(){
  if(!validarInicial()){nextEtapa(1);return;}
  calcular();salvarLeadParcial(true);
  await new Promise(r=>setTimeout(r,500));
  const doc=await gerarPDFBlob();
  doc.save(`DA-Plano-${document.getElementById("leadNomeInicio").value}.pdf`);
  const d=window._dadosPlano;
  let esc="";document.querySelectorAll(".modulo:checked").forEach(m=>{esc+=`> ${m.dataset.nome} (+R$ ${getPrecoModulo(m.dataset.nome)}/mês)\n`;});
  const planoSel=document.querySelector('input[name="plano"]:checked')?.value||'mensal';
  const msg=`*NOVA SOLICITAÇÃO - PLANO ${planoSel.toUpperCase()} - DA SOFTWARE*\n--------------------------------\n*Cliente:* ${document.getElementById("leadNomeInicio").value}\n*Empresa:* ${document.getElementById("leadEmpresa").value||'Não informou'}\n*Cidade:* ${document.getElementById("leadCidade").value||'Não informou'}\n\n*MENSAL:* *${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês* | PIX mensal: *${d.mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês*\n*ANUAL CARTÃO:* *${d.anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}* (12x R$ ${d.parcelaAnual}) - De ${d.anualDe.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}\n*ANUAL PIX:* *${d.anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}* - 28% OFF total\n*Renovação:* Após 12 meses mantém desconto\n\n*MÓDULOS:*\n${esc||"- Base R$ 160/mês\n"}\n*Necessidade:*\n${document.getElementById("descricao").value||"Sistema sob medida"}\n\n*Contato:* ${document.getElementById("leadWhatsappInicio").value} | ${document.getElementById("leadEmail").value||'Não informou'}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`,"_blank");
}
let recognition=null,gravando=false,textoAcumulado="";
function toggleGravacao(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){alert("Use Chrome");return;}const btn=document.getElementById("btnAudio"),icon=document.getElementById("iconMic"),status=document.getElementById("audioStatus");const descricao=document.getElementById("descricao");if(gravando){gravando=false;if(btn)btn.classList.remove("gravando");if(icon)icon.className="fa-solid fa-microphone";if(status)status.style.display="none";try{recognition.stop();}catch(e){}return;}textoAcumulado=descricao.value?descricao.value+" ":"";recognition=new SR();recognition.lang="pt-BR";recognition.continuous=true;recognition.interimResults=true;recognition.onstart=()=>{gravando=true;if(btn)btn.classList.add("gravando");if(icon)icon.className="fa-solid fa-stop";if(status)status.style.display="block";};recognition.onresult=(e)=>{let final="";for(let i=0;i<e.results.length;i++){if(e.results[i].isFinal)final+=e.results[i][0].transcript+" ";}if(final){descricao.value=textoAcumulado+final;interpretarIA();}};recognition.onend=()=>{if(gravando){try{recognition.start();}catch(e){}}else{pararGravacao();}};recognition.start();}
function pararGravacao(){gravando=false;const b=document.getElementById("btnAudio");if(b)b.classList.remove("gravando");const i=document.getElementById("iconMic");if(i)i.className="fa-solid fa-microphone";const s=document.getElementById("audioStatus");if(s)s.style.display="none";try{if(recognition)recognition.stop();}catch(e){}}
document.addEventListener("change",()=>{if(etapaAtual>=2)calcular();salvarLeadParcial();});
calcular();
