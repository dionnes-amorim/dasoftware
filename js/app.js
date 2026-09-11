document.addEventListener("DOMContentLoaded", ()=>{ try{AOS.init();}catch(e){} });
const WHATSAPP_NUM="5517997474065";
const TABELA_PRECOS={"Clientes e CRM":20,"Estoque e Produtos":20,"Financeiro Completo":30,"Caixa PDV":20,"Ordens de Servico":20,"WhatsApp Automatico":30,"Agendamento":15,"Dashboard e Relatorios":20,"App Android":40,"App iOS":40,"Multi-empresas":30,"Nota Fiscal NFe":30,"Delivery e iFood":25,"Comissoes":10,"Contratos":10,"Chat Interno":10,"Assinatura Digital":15,"Fidelidade Cashback":15,"Catalogo Online":15,"Backup Automatico":10};
let valorProjeto=160, roiChart=null, todosSelecionados=false;

const MODULOS_DEFS=[
 {nome:"Clientes e CRM", peso:2, termos:["cliente","paciente","aluno","contato","crm","ficha","cadastro"]},
 {nome:"Estoque e Produtos", peso:2, termos:["estoque","produto","peça","peca","inventario","mercadoria","insumo"]},
 {nome:"Financeiro Completo", peso:2, termos:["financeiro","dinheiro","caixa","lucro","despesa","conta a pagar","conta a receber","fluxo"]},
 {nome:"Caixa PDV", peso:2, termos:["pdv","venda","balcão","balcao","frente de caixa","vender"]},
 {nome:"Ordens de Servico", peso:3, termos:["ordem","os","serviço","aparelho","celular","defeito","conserto","oficina","manutenção","garantia","equipamento","veiculo","carro"]},
 {nome:"WhatsApp Automatico", peso:2, termos:["whats","zap","mensagem","avisar cliente","notificação","automatico"]},
 {nome:"Agendamento", peso:3, termos:["agendamento","agenda","horário","marcar","reserva","consulta","atendimento"]},
 {nome:"Dashboard e Relatorios", peso:1, termos:["relatorio","dashboard","grafico","indicador","resultado"]},
 {nome:"App Android", peso:2, termos:["app","aplicativo","celular","mobile","android"]},
 {nome:"Nota Fiscal NFe", peso:3, termos:["nota","nfe","nfse","fiscal","imposto"]},
 {nome:"Delivery e iFood", peso:3, termos:["delivery","ifood","entrega","motoboy","cardapio"]},
 {nome:"Comissoes", peso:2, termos:["comissão","comissao","porcentagem vendedor","funcionario"]},
 {nome:"Contratos", peso:2, termos:["contrato","mensalidade","plano","recorrencia","assinatura"]},
 {nome:"Fidelidade Cashback", peso:2, termos:["fidelidade","cashback","pontos","desconto cliente"]},
 {nome:"Catalogo Online", peso:2, termos:["catalogo","site","vitrine","mostrar produto"]},
 {nome:"Chat Interno", peso:1, termos:["chat","conversa equipe","mensagem interna"]},
];

function renderChecks(){
 const container=document.getElementById("checksContainer");
 container.innerHTML=Object.keys(TABELA_PRECOS).map(nome=>`<label class="check"><input type="checkbox" class="modulo" data-nome="${nome}"> ${nome} <span class="price">+R$ ${TABELA_PRECOS[nome]}</span></label>`).join("");
}
renderChecks();

function normalizar(str){
 return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

function interpretarIA(){
 const raw=document.getElementById("descricao").value;
 const t=normalizar(raw);
 const res=document.getElementById("ia-result");
 if(!t.trim()){alert("Descreva sua ideia primeiro");return;}
 let scores={};
 MODULOS_DEFS.forEach(def=>{
   let score=0;
   def.termos.forEach(termo=>{
     if(t.includes(normalizar(termo))) score+=def.peso;
   });
   // sinônimos leigos
   if(t.includes("caderno") || t.includes("planilha") || t.includes("papel") || t.includes("perco controle")){ scores["Clientes e CRM"]=(scores["Clientes e CRM"]||0)+1; scores["Dashboard e Relatorios"]=(scores["Dashboard e Relatorios"]||0)+1; }
   if(t.includes("esquece") || t.includes("aviso") || t.includes("lembrar")){ scores["WhatsApp Automatico"]=(scores["WhatsApp Automatico"]||0)+2; }
   if(t.includes("tempo") || t.includes("demora") || t.includes("manual")){ scores["Dashboard e Relatorios"]=(scores["Dashboard e Relatorios"]||0)+1; }
   if(score>0) scores[def.nome]=(scores[def.nome]||0)+score;
 });
 // Se nada detectado, sugere base
 if(Object.keys(scores).length===0){ scores["Clientes e CRM"]=2; scores["Financeiro Completo"]=2; scores["Dashboard e Relatorios"]=1; }
 let ordenados=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
 document.querySelectorAll(".modulo").forEach(c=>c.checked=false);
 document.querySelectorAll(".modulo").forEach(c=>{ if(ordenados.includes(c.dataset.nome)) c.checked=true; });
 res.style.display="block";
 res.innerHTML=`<strong>Detectamos ${ordenados.length} módulos ideais para sua descrição:</strong><br>• ${ordenados.join("<br>• ")}<br><small style="opacity:.7">Você pode ajustar na próxima etapa.</small>`;
 calcular();
}

function getPreco(nome){return TABELA_PRECOS[nome]||15;}
function calcular(){
 let total=160, mods=[];
 document.querySelectorAll(".modulo").forEach(m=>{ if(m.checked){ total+=getPreco(m.dataset.nome); mods.push({nome:m.dataset.nome,valor:getPreco(m.dataset.nome)}); }});
 total+=Number(document.getElementById("usuarios").value||0);
 valorProjeto=total;
 document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
 document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Sistema personalizado";
 let prazo=total<=200?"7 a 12 dias úteis":total<=320?"12 a 20 dias úteis":"20 a 35 dias úteis";
 document.getElementById("prazo").innerHTML=`<strong>Prazo estimado:</strong> ${prazo} | <strong>Módulos:</strong> ${mods.length}`;
 document.getElementById("escopo").innerHTML=mods.map(i=>`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${i.nome} <span style="opacity:.5">(+R$ ${i.valor})</span></li>`).join("") || "<li>Sistema base incluso - R$ 160</li>";

 let horas=Number(document.getElementById("horasManual").value||0);
 let vHora=Number(document.getElementById("valorHora").value||0);
 let economiaMes=horas*4*vHora;
 if(economiaMes>0){
   document.getElementById("economia").innerText=`Estimativa: até R$ ${economiaMes.toLocaleString("pt-BR")} /mês em horas operacionais que podem ser otimizadas*`;
   document.getElementById("roiInfo1").innerText=`Horas informadas: ${horas}h/semana`;
   document.getElementById("roiInfo2").innerText=`Economia potencial estimada: R$ ${economiaMes.toLocaleString("pt-BR")}/mês`;
   desenharROI(total, economiaMes);
 }else{
   document.getElementById("economia").innerText=`Informe horas manuais para estimar impacto.`;
   desenharROI(total, total*0.4);
 }
}
function desenharROI(inv,eco){
 const c=document.getElementById("roiChart"); if(!c) return; if(roiChart) roiChart.destroy();
 const labels=Array.from({length:12},(_,i)=>`Mês ${i+1}`); const ecoAcum=labels.map((_,i)=>eco*(i+1)); const invArr=labels.map(()=>inv);
 roiChart=new Chart(c.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"Economia acumulada estimada",data:ecoAcum,borderColor:"#00e5ff",backgroundColor:"rgba(0,229,255,.15)",fill:true,tension:.4},{label:"Investimento",data:invArr,borderColor:"#7b61ff",borderDash:[6,4],pointRadius:0}]},options:{responsive:true,plugins:{legend:{labels:{color:"#fff",font:{size:11}}}},scales:{y:{ticks:{color:"#888"}},x:{ticks:{color:"#888"}}}}});
}
function nextEtapa(n){document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active"));document.getElementById("etapa"+n).classList.add("active");document.getElementById("progress").style.width=(n*33.3)+"%";window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"});}
function selecionarTodos(){todosSelecionados=!todosSelecionados;document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados);calcular();}
function reiniciarSimulacao(){document.querySelectorAll(".modulo").forEach(m=>m.checked=false);document.getElementById("descricao").value="";document.getElementById("ia-result").style.display="none";calcular();nextEtapa(1);}

const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){document.documentElement.setAttribute("data-theme",t);localStorage.setItem("theme",t);if(themeToggle) themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>';}
if(themeToggle) themeToggle.addEventListener("click",()=>{const a=document.documentElement.getAttribute("data-theme")||"dark";aplicarTema(a==="light"?"dark":"light");});
aplicarTema(localStorage.getItem("theme")||"dark");

const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";
async function salvarLead(){
 const lead={data:new Date().toLocaleString("pt-BR"),nome:document.getElementById("leadNome").value||'Não informou',empresa:document.getElementById("leadEmpresa").value||'Não informou',whatsapp:document.getElementById("leadWhatsapp").value,email:document.getElementById("leadEmail").value,cidade:document.getElementById("leadCidade").value||'Não informou',negocio:document.getElementById("negocio").value,valor:document.getElementById("valor").innerText,descricao:document.getElementById("descricao").value||'Quero um sistema sob medida',horas:document.getElementById("horasManual").value||0,escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", ")||'Sistema base'};
 try{const local=JSON.parse(localStorage.getItem("leadsDA")||"[]");local.push(lead);localStorage.setItem("leadsDA",JSON.stringify(local));}catch(e){}
 try{await fetch(`${SUPABASE_URL}/rest/v1/leads`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(lead)});}catch(e){console.log("Fallback local - Supabase offline",e);}
}
function validar(){const n=document.getElementById("leadNome").value.trim(),w=document.getElementById("leadWhatsapp").value.trim(),e=document.getElementById("leadEmail").value.trim();if(!n||!w||!e){alert("Preencha Nome, WhatsApp e E-mail");return false;}return true;}
async function gerarPDFBlob(){
 const {jsPDF}=window.jspdf; const doc=new jsPDF('p','mm','a4'); const W=210;
 doc.setFillColor(5,8,22); doc.rect(0,0,W,297,"F");
 doc.setFillColor(0,229,255); doc.rect(0,0,W,6,"F");
 doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont("helvetica","bold"); doc.text("DA SOFTWARE",15,14);
 doc.setFontSize(7); doc.setTextColor(180,180,200); doc.text("SISTEMAS SOB MEDIDA A PARTIR DE R$ 160",15,18);
 doc.setTextColor(255,255,255); doc.setFontSize(11); doc.text("Proposta Comercial",15,27);
 doc.setFontSize(8); doc.setTextColor(200,200,220);
 doc.text(`Cliente: ${document.getElementById("leadNome").value}`,15,32);
 doc.text(`Segmento: ${document.getElementById("negocio").value} | ${document.getElementById("prazo").innerText}`,15,36);
 doc.text(`Investimento: ${document.getElementById("valor").innerText} | ${document.getElementById("economia").innerText}`,15,40);
 doc.setFontSize(9); doc.setTextColor(255,255,255); doc.text("Escopo:",15,47);
 doc.setFontSize(8); let y=51; document.querySelectorAll(".modulo:checked").forEach(m=>{doc.setTextColor(220,220,255); doc.text(`- ${m.dataset.nome} (+R$ ${getPreco(m.dataset.nome)})`,15,y); y+=5;});
 doc.setFontSize(7); doc.setTextColor(150,150,170); doc.text("Valores são estimativas. Economia baseada em horas informadas pelo cliente, sem promessa de lucro.",15, y+10);
 try{const canvas=document.getElementById("roiChart"); if(canvas){doc.addPage(); doc.setFillColor(5,8,22); doc.rect(0,0,W,297,"F"); doc.addImage(canvas.toDataURL("image/png"),'PNG',10,15,W-20,80);} }catch(e){}
 return doc;
}
async function enviarWhatsappComPDF(){
 if(!validar()) return; calcular(); await salvarLead();
 const doc=await gerarPDFBlob(); doc.save(`Proposta-DA-${document.getElementById("leadNome").value||"Cliente"}.pdf`);
 let esc=""; document.querySelectorAll(".modulo:checked").forEach(m=>{esc+=`• ${m.dataset.nome} (+R$ ${getPreco(m.dataset.nome)})\n`;});
 const msg=`*NOVA SIMULAÇÃO - DA SOFTWARE*\n\n*Cliente:* ${document.getElementById("leadNome").value}\n*Empresa:* ${document.getElementById("leadEmpresa").value}\n*Cidade:* ${document.getElementById("leadCidade").value}\n*Segmento:* ${document.getElementById("negocio").value}\n*Investimento:* ${document.getElementById("valor").innerText}\n*${document.getElementById("prazo").innerText}*\n*${document.getElementById("economia").innerText}*\n\n*MÓDULOS:*\n${esc||"- Base R$ 160"}\n*DESCRIÇÃO:*\n${document.getElementById("descricao").value}\n\n*CONTATO:* ${document.getElementById("leadWhatsapp").value} | ${document.getElementById("leadEmail").value}`;
 window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`,"_blank");
}
let recognition=null,gravando=false,textoAcumulado="";
function toggleGravacao(){
 const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){alert("Use Chrome no celular");return;}
 const icon=document.getElementById("iconMic"), status=document.getElementById("audioStatus");
 if(gravando){gravando=false;icon.className="fa-solid fa-microphone";status.style.display="none";try{recognition.stop();}catch(e){}return;}
 textoAcumulado=document.getElementById("descricao").value?document.getElementById("descricao").value+" ":"";
 recognition=new SR(); recognition.lang="pt-BR"; recognition.continuous=true; recognition.interimResults=true;
 recognition.onstart=()=>{gravando=true;icon.className="fa-solid fa-stop";status.style.display="block";};
 recognition.onresult=(e)=>{let final="";for(let i=0;i<e.results.length;i++) if(e.results[i].isFinal) final+=e.results[i][0].transcript+" "; const desc=document.getElementById("descricao"); if(final) desc.value=textoAcumulado+final;};
 recognition.onend=()=>{if(gravando) try{recognition.start();}catch(e){} else {gravando=false;}};
 recognition.start();
}
document.addEventListener("change",()=>{if(document.getElementById("etapa2").classList.contains("active")||document.getElementById("etapa3").classList.contains("active")) calcular();});
calcular();
