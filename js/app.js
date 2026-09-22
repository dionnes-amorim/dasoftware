document.addEventListener("DOMContentLoaded", ()=>{
  try{ AOS.init({ duration: 800, once: false, offset: 50 }); }catch(e){}
  try{ particlesJS("particles-js",{particles:{number:{value:80},color:{value:["#00e5ff","#7b61ff"]},shape:{type:"circle"},opacity:{value:0.5,random:true},size:{value:3,random:true},line_linked:{enable:true,distance:150,color:"#ffffff",opacity:0.15,width:1},move:{enable:true,speed:1.2,random:true}}}); }catch(e){}
});
const WHATSAPP_NUM="5517997474065";
let valorProjeto=160, etapaAtual=1, roiChart=null, logoBase64=null, todosSelecionados=false;
const TABELA_PRECOS = {"Clientes e CRM":15,"Estoque e Produtos":15,"Financeiro Completo":20,"Caixa PDV":15,"Ordens de Servico":15,"WhatsApp Automatico":20,"Agendamento":10,"Dashboard e Relatorios":15,"App Android":35,"App iOS":35,"Multi-empresas":15,"Nota Fiscal NFe":25,"Delivery e iFood":15,"Comissoes":8,"Contratos":8,"Chat Interno":8,"Assinatura Digital":10,"Fidelidade Cashback":10,"Catalogo Online":10,"Backup Automatico":8};
function getPrecoModulo(nome){ return TABELA_PRECOS[nome]!== undefined? TABELA_PRECOS[nome] : 10; }
function carregarLogoPDF(){ const img=new Image(); img.crossOrigin="anonymous"; img.src='./assets/logo.png'; img.onload=function(){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; c.getContext('2d').drawImage(img,0,0); logoBase64=c.toDataURL('image/png'); }; }
carregarLogoPDF();
const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){ document.documentElement.setAttribute("data-theme",t); localStorage.setItem("theme",t); if(themeToggle) themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>'; }
if(themeToggle) themeToggle.addEventListener("click",()=>{ const a=document.documentElement.getAttribute("data-theme")||"dark"; aplicarTema(a==="light"?"dark":"light"); });
aplicarTema(localStorage.getItem("theme")||"dark");

function nextEtapa(n){
  document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active"));
  document.getElementById("etapa"+n).classList.add("active");
  etapaAtual=n;
  document.getElementById("progress").style.width=(n*25)+"%";
  window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"});
  salvarLeadParcial();
}
function reiniciarSimulacao(){
  document.querySelectorAll(".modulo").forEach(m=>m.checked=false);
  document.getElementById("descricao").value="";
  document.getElementById("negocio").selectedIndex=0;
  document.getElementById("usuarios").selectedIndex=0;
  document.getElementById("leadEmpresa").value="";
  document.getElementById("leadEmail").value="";
  document.getElementById("leadCidade").value="";
  const elNomeInicio = document.getElementById("leadNomeInicio");
  const elZapInicio = document.getElementById("leadWhatsappInicio");
  if(elNomeInicio) elNomeInicio.value="";
  if(elZapInicio) elZapInicio.value="";
  document.getElementById("ia-result").style.display="none";
  todosSelecionados=false; calcular(); nextEtapa(1);
}
function selecionarTodos(){
  todosSelecionados=!todosSelecionados;
  document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados);
  const btn=document.querySelector(".btn-selecionar-todos");
  if(btn) btn.innerHTML=todosSelecionados?'<i class="fa-solid fa-xmark"></i> Desmarcar Todos':'<i class="fa-solid fa-layer-group"></i> Selecionar Todos - <span>Plano completo no máx R$ 487/mês</span>';
  calcular();
}
function normalizar(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }
const MODULOS_INTELIGENTE = [
  {nome:"Clientes e CRM", termos:["cliente","paciente","aluno","contato","crm","cadastro","ficha","caderno","planilha","perco cliente"]},
  {nome:"Estoque e Produtos", termos:["estoque","produto","peca","mercadoria","inventario","insumo","sabor"]},
  {nome:"Financeiro Completo", termos:["financeiro","dinheiro","caixa","lucro","despesa","conta a pagar","fluxo de caixa"]},
  {nome:"Caixa PDV", termos:["pdv","venda","balcao","frente de caixa","vender"]},
  {nome:"Ordens de Servico", termos:["ordem","os","servico","aparelho","celular","defeito","conserto","oficina"]},
  {nome:"WhatsApp Automatico", termos:["whats","zap","wpp","mensagem","avisar cliente","notificacao"]},
  {nome:"Agendamento", termos:["agendamento","agenda","horario","marcar horario","reserva"]},
  {nome:"Dashboard e Relatorios", termos:["relatorio","dashboard","grafico","indicador","controle","organizar"]},
  {nome:"App Android", termos:["app","aplicativo","celular","mobile","android","na rua"]},
  {nome:"Nota Fiscal NFe", termos:["nota","nfe","nfse","fiscal"]},
  {nome:"Delivery e iFood", termos:["delivery","ifood","entrega","motoboy","cardapio"]},
  {nome:"Fidelidade Cashback", termos:["fidelidade","cashback","pontos","fidelizar"]},
  {nome:"Catalogo Online", termos:["catalogo","site","vitrine","mostrar produto","loja virtual"]},
];
function interpretarIA(){
  const raw=document.getElementById("descricao").value;
  const r=document.getElementById("ia-result");
  if(!raw.trim()){ r.style.display="block"; r.innerHTML=`Descrição é opcional. Pode pular direto para os módulos.`; return; }
  const t=normalizar(raw);
  let scores={};
  MODULOS_INTELIGENTE.forEach(mod=>{ mod.termos.forEach(term=>{ if(t.includes(normalizar(term))) scores[mod.nome]=(scores[mod.nome]||0)+1; }); });
  if(t.match(/caderno|papel|planilha|perco|anoto/)) scores["Clientes e CRM"]=(scores["Clientes e CRM"]||0)+2;
  if(t.match(/esqueco|esquece|avisar|aviso|lembrar|zap|zapp|wats|what/)) scores["WhatsApp Automatico"]=(scores["WhatsApp Automatico"]||0)+3;
  let detectados=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
  if(detectados.length===0) detectados=["Clientes e CRM","Dashboard e Relatorios"];
  document.querySelectorAll(".modulo").forEach(c=>c.checked=false);
  document.querySelectorAll(".modulo").forEach(c=>{ if(detectados.includes(c.dataset.nome)) c.checked=true; });
  r.style.display="block"; r.innerHTML=`<strong>IA detectou ${detectados.length} módulos:</strong><br>• ${detectados.join("<br>• ")}`;
  calcular();
}
function calcular(){
  let total=160,mods=[];
  document.querySelectorAll(".modulo").forEach(m=>{ if(m.checked){ let preco=getPrecoModulo(m.dataset.nome); total+=preco; mods.push({nome:m.dataset.nome,valor:preco}); } });
  total+=Number(document.getElementById("usuarios").value);
  valorProjeto=total;
  let mensalPix = Math.round(total * 0.9);
  let anualDe = total * 12;
  let anualCartao = Math.round(anualDe * 0.8);
  let anualPix = Math.round(anualCartao * 0.9);
  let parcelaAnual = (anualCartao/12).toFixed(2).replace('.',',');

  document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  const elMensal = document.getElementById("mensalValor");
  const elMensalPix = document.getElementById("mensalPix");
  const elAnualDe = document.getElementById("anualDe");
  const elAnualValor = document.getElementById("anualValor");
  const elAnualPix = document.getElementById("anualPix");
  if(elMensal) elMensal.innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  if(elMensalPix) elMensalPix.innerText=mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+"/mês";
  if(elAnualDe) elAnualDe.innerText="De "+anualDe.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  if(elAnualValor) elAnualValor.innerText=anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})+" (12x R$ "+parcelaAnual+")";
  if(elAnualPix) elAnualPix.innerText=anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  let prazo=total<=200?"5 a 10 dias":total<=300?"10 a 15 dias":total<=400?"15 a 25 dias":"25 a 40 dias";
  document.getElementById("prazo").innerHTML=`<strong>Prazo:</strong> ${prazo} | <strong>Módulos:</strong> ${mods.length} | Renovação após 12 meses`;
  document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Plano Mensal/Anual";
  let html=mods.length?"":"<li>Sistema base incluso - R$ 160/mês</li>"; mods.forEach(i=> html+=`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${i.nome} <span style="opacity:.5">(+R$ ${i.valor}/mês)</span></li>`);
  document.getElementById("escopo").innerHTML=html;
  let eco=Math.round(total*0.85);
  document.getElementById("economia").innerText=`Economia potencial: R$ ${eco.toLocaleString("pt-BR")}/mês`;
  const elRoi=document.getElementById("roiValor"); if(elRoi) elRoi.innerText=eco.toLocaleString("pt-BR");
  desenharROI(total,eco);
  window._dadosPlano={total,mensalPix,anualDe,anualCartao,anualPix,parcelaAnual};
}
function desenharROI(inv,eco){
  const c=document.getElementById("roiChart"); if(!c) return; if(roiChart) roiChart.destroy();
  const labels=Array.from({length:12},(_,i)=>`Mês ${i+1}`); const ecoAcum=labels.map((_,i)=>eco*(i+1)); const invArr=labels.map(()=>inv);
  roiChart=new Chart(c.getContext("2d"),{type:"line",data:{labels,datasets:[{label:"Economia Acumulada",data:ecoAcum,borderColor:"#00e5ff",backgroundColor:"rgba(0,229,255,.15)",fill:true,tension:.4,borderWidth:3,pointRadius:4},{label:"Investimento Mensal",data:invArr,borderColor:"#7b61ff",backgroundColor:"rgba(123,97,255,.1)",fill:false,borderDash:[6,4],pointRadius:0}]},options:{responsive:true,animation:false,plugins:{legend:{labels:{color:"#fff",font:{size:11}}}},scales:{y:{ticks:{color:"#888"}},x:{ticks:{color:"#888"}}}}});
}
const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";

function validarInicial(){ const n=document.getElementById("leadNomeInicio").value.trim(),w=document.getElementById("leadWhatsappInicio").value.trim(); if(!n||w.length<10){alert("Preencha Nome e WhatsApp com DDD");return false;} return true; }
function salvarLeadInicial(){ if(!validarInicial()) return; salvarLeadParcial(true); nextEtapa(2); }
function salvarLeadParcial(forcar=false){
  const nome = document.getElementById("leadNomeInicio")?.value || "";
  const zap = document.getElementById("leadWhatsappInicio")?.value || "";
  if(!forcar && (nome.length<2 || zap.length<10)) return;
  const lead={data:new Date().toLocaleString("pt-BR"),nome: nome || 'Nao informou',whatsapp: zap,empresa:document.getElementById("leadEmpresa")?.value||'Nao informou',email:document.getElementById("leadEmail")?.value||'Nao informou',cidade:document.getElementById("leadCidade")?.value||'Nao informou',negocio:document.getElementById("negocio")?.value||'Nao selecionou',valor:document.getElementById("valor")?.innerText||'R$ 160/mês',descricao:document.getElementById("descricao")?.value||'Parou no inicio',escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", ")||'Base',etapa:`Etapa ${etapaAtual}`,plano:document.querySelector('input[name="plano"]:checked')?.value||'mensal'};
  try{ localStorage.setItem("leadParcialDA",JSON.stringify(lead)); }catch(e){}
  try{ fetch(`${SUPABASE_URL}/rest/v1/leads`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(lead)}); }catch(e){}
}
async function gerarPDFBlob(){
  await new Promise(r=>setTimeout(r, 500));
  if(!roiChart){ calcular(); await new Promise(r=>setTimeout(r, 800)); }
  const {jsPDF}=window.jspdf; const doc=new jsPDF('p','mm','a4'); const W=210, H=297;
  doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); doc.setFillColor(0,229,255); doc.rect(0,0,W,7,"F");
  if(logoBase64){ try{ doc.addImage(logoBase64,'PNG',15,10,11,11); }catch(e){} doc.setTextColor(255,255,255); doc.setFontSize(15); doc.setFont("helvetica","bold"); doc.text("SOFTWARE",29,18); }
  doc.setFontSize(7); doc.setTextColor(180,180,200); doc.text("SISTEMAS SOB MEDIDA - MENSAL OU ANUAL",15,23);
  doc.setDrawColor(0,229,255); doc.line(15,25,W-15,25);
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.text("Proposta Comercial - Mensal e Anual",15,33);
  doc.setFontSize(9); doc.setTextColor(200,200,220); doc.setFont("helvetica","normal");
  const nomeInicio = document.getElementById("leadNomeInicio")?.value || "";
  const zapInicio = document.getElementById("leadWhatsappInicio")?.value || "";
  doc.text(`Cliente: ${nomeInicio} | WhatsApp: ${zapInicio}`,15,38);
  doc.text(`Segmento: ${document.getElementById("negocio").value} | Data: ${new Date().toLocaleDateString("pt-BR")}`,15,42);
  doc.text(`Empresa: ${document.getElementById("leadEmpresa").value||'Nao informou'} | Cidade: ${document.getElementById("leadCidade").value||'Nao informou'}`,15,46);
  const d = window._dadosPlano || {total:valorProjeto,mensalPix:Math.round(valorProjeto*0.9),anualDe:valorProjeto*12,anualCartao:Math.round(valorProjeto*12*0.8),anualPix:Math.round(valorProjeto*12*0.8*0.9),parcelaAnual:(Math.round(valorProjeto*12*0.8)/12).toFixed(2)};
  doc.setFillColor(16,22,42); doc.roundedRect(15,50,W-30,32,3,3,"F");
  doc.setTextColor(0,229,255); doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.text("MENSAL",18,56);
  doc.setTextColor(255,255,255); doc.setFontSize(14); doc.text(`${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês`,18,63);
  doc.setFontSize(8); doc.setTextColor(0,255,136); doc.text(`PIX mensal: ${d.mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês (10% OFF)`,18,67);
  doc.setTextColor(123,97,255); doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.text("ANUAL 20% OFF",95,56);
  doc.setTextColor(255,255,255); doc.setFontSize(11); doc.text(`${d.anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} (12x R$ ${d.parcelaAnual})`,95,63);
  doc.setFontSize(8); doc.setTextColor(0,255,136); doc.text(`PIX ANUAL: ${d.anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})} - 28% OFF total`,95,67);
  doc.setTextColor(180,180,200); doc.setFontSize(7); doc.text("Renovação após 12 meses mantendo desconto",18,77);
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.text(`Prazo: ${document.getElementById("prazo").innerText}`,15,86);
  doc.setFontSize(9); doc.text("Descricao:",15,92);
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(200,200,200);
  let descLinhas=doc.splitTextToSize(document.getElementById("descricao").value || "Cliente optou por escolher modulos manualmente", W-30);
  doc.text(descLinhas,15,96); let y=96+descLinhas.length*4+6;
  doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.text("Escopo mensal:",15,y); y+=6;
  doc.setFontSize(8); doc.setFont("helvetica","normal");
  document.querySelectorAll(".modulo:checked").forEach(m=>{
    let preco=getPrecoModulo(m.dataset.nome);
    if(y> H-25){ doc.addPage(); doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); y=15; }
    doc.setFillColor(23,32,51); doc.roundedRect(15,y-3,W-30,8,2,2,"F");
    doc.setTextColor(230,230,255); doc.text(`- ${m.dataset.nome} (+R$ ${preco}/mês)`,18,y+1); y+=10;
  });
  doc.addPage(); doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); doc.setFillColor(0,229,255); doc.rect(0,0,W,7,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.text("ANALISE - RETORNO ESTIMADO",15,16);
  try{ const canvas=document.getElementById("roiChart"); if(canvas){ doc.addImage(canvas.toDataURL("image/png",1.0),'PNG',10,28, W-20, 85); } }catch(e){}
  return doc;
}
async function enviarWhatsappComPDF(){
  if(!validarInicial()){ nextEtapa(1); return; }
  calcular(); salvarLeadParcial(true); desenharROI(valorProjeto, Math.round(valorProjeto*0.85));
  await new Promise(r=>setTimeout(r, 600));
  const doc=await gerarPDFBlob();
  const nomeInicio = document.getElementById("leadNomeInicio")?.value || "Cliente";
  doc.save(`Proposta-DA-${nomeInicio}.pdf`);
  let esc=""; document.querySelectorAll(".modulo:checked").forEach(m=>{ esc+=`> ${m.dataset.nome} (+R$ ${getPrecoModulo(m.dataset.nome)}/mês)\n`; });
  const d = window._dadosPlano;
  const planoSel = document.querySelector('input[name="plano"]:checked')?.value || 'mensal';
  const msg=`*NOVA SOLICITACAO - DA SOFTWARE (${planoSel.toUpperCase()})*\n--------------------------------\n*Cliente:* ${document.getElementById("leadNomeInicio").value}\n*Empresa:* ${document.getElementById("leadEmpresa").value||'Nao informou'}\n*Cidade:* ${document.getElementById("leadCidade").value||'Nao informou'}\n\n*PLANO:*\nMensal: *${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês* | PIX mensal: *${d.mensalPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}/mês*\nAnual Cartão: *${d.anualCartao.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}* (12x R$ ${d.parcelaAnual})\nAnual PIX: *${d.anualPix.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}* (28% OFF)\nRenovação após 12 meses\n\n*MODULOS:*\n${esc||"- Base R$ 160/mês\n"}\n*NECESSIDADE:*\n${document.getElementById("descricao").value||"Quero um sistema sob medida"}\n\n*CONTATOS:*\nWhatsApp: ${document.getElementById("leadWhatsappInicio").value}\nEmail: ${document.getElementById("leadEmail").value||'Nao informou'}`;
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`,"_blank");
}
let recognition=null, gravando=false; let textoAcumulado="";
function toggleGravacao(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Use Chrome!");return;}
  const btn=document.getElementById("btnAudio"), icon=document.getElementById("iconMic"), status=document.getElementById("audioStatus");
  const descricao=document.getElementById("descricao");
  if(gravando){ gravando=false; if(btn) btn.classList.remove("gravando"); if(icon) icon.className="fa-solid fa-microphone"; if(status) status.style.display="none"; try{ recognition.stop(); }catch(e){} return; }
  textoAcumulado=descricao.value?descricao.value+" ":"";
  recognition=new SR(); recognition.lang="pt-BR"; recognition.continuous=true; recognition.interimResults=true;
  recognition.onstart=()=>{ gravando=true; if(btn) btn.classList.add("gravando"); if(icon) icon.className="fa-solid fa-stop"; if(status){ status.style.display="block"; status.innerHTML='<i class="fa-solid fa-circle" style="color:red;"></i> Ouvindo...'; } };
  recognition.onresult=(e)=>{ let final=""; for(let i=0;i<e.results.length;i++){ if(e.results[i].isFinal) final+=e.results[i][0].transcript+" "; } if(final){ descricao.value=textoAcumulado+final; interpretarIA(); } };
  recognition.onend=()=>{ if(gravando){ try{ recognition.start(); }catch(e){} } else { pararGravacao(); } };
  recognition.start();
}
function pararGravacao(){ gravando=false; const b=document.getElementById("btnAudio"); if(b) b.classList.remove("gravando"); const i=document.getElementById("iconMic"); if(i) i.className="fa-solid fa-microphone"; const s=document.getElementById("audioStatus"); if(s) s.style.display="none"; try{ if(recognition) recognition.stop(); }catch(e){} }
document.addEventListener("change",()=>{ if(etapaAtual>=2) calcular(); salvarLeadParcial(); });
calcular();
