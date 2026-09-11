document.addEventListener("DOMContentLoaded", ()=>{
  try{ AOS.init({ duration: 800, once: false, offset: 50 }); }catch(e){}
  try{ particlesJS("particles-js",{particles:{number:{value:80},color:{value:["#00e5ff","#7b61ff"]},shape:{type:"circle"},opacity:{value:0.5,random:true},size:{value:3,random:true},line_linked:{enable:true,distance:150,color:"#ffffff",opacity:0.15,width:1},move:{enable:true,speed:1.2,random:true}}}); }catch(e){}
});
const WHATSAPP_NUM="5517997474065";
const SENHA_ADMIN="admin123";
let valorProjeto=160, etapaAtual=1, roiChart=null, logoBase64=null, notificacaoAtual=null, todosSelecionados=false;
const TABELA_PRECOS = {"Clientes e CRM":20,"Estoque e Produtos":20,"Financeiro Completo":30,"Caixa PDV":20,"Ordens de Servico":20,"WhatsApp Automatico":30,"Agendamento":15,"Dashboard e Relatorios":20,"App Android":40,"App iOS":40,"Multi-empresas":30,"Nota Fiscal NFe":30,"Delivery e iFood":25,"Comissoes":10,"Contratos":10,"Chat Interno":10,"Assinatura Digital":15,"Fidelidade Cashback":15,"Catalogo Online":15,"Backup Automatico":10};
function getPrecoModulo(nome){ return TABELA_PRECOS[nome]!== undefined? TABELA_PRECOS[nome] : 15; }
function carregarLogoPDF(){ const img=new Image(); img.crossOrigin="anonymous"; img.src='./assets/logo.png'; img.onload=function(){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; c.getContext('2d').drawImage(img,0,0); logoBase64=c.toDataURL('image/png'); }; }
carregarLogoPDF();
const themeToggle=document.getElementById("themeToggle");
function aplicarTema(t){ document.documentElement.setAttribute("data-theme",t); localStorage.setItem("theme",t); if(themeToggle) themeToggle.innerHTML=t==="light"?'<i class="fa-solid fa-moon"></i>':'<i class="fa-solid fa-sun"></i>'; }
if(themeToggle) themeToggle.addEventListener("click",()=>{ const a=document.documentElement.getAttribute("data-theme")||"dark"; aplicarTema(a==="light"?"dark":"light"); });
aplicarTema(localStorage.getItem("theme")||"dark");
function abrirAdmin(){ document.getElementById("admin-login").classList.add("show"); }
function logarAdmin(){ const s=document.getElementById("adminSenha").value; if(s===SENHA_ADMIN){ window.location.href="./admin.html"; } else{ alert("Senha incorreta!"); } }
function nextEtapa(n){ document.querySelectorAll(".etapa").forEach(e=>e.classList.remove("active")); document.getElementById("etapa"+n).classList.add("active"); etapaAtual=n; document.getElementById("progress").style.width=(n*33.3)+"%"; window.scrollTo({top:document.getElementById("simulador").offsetTop-80,behavior:"smooth"}); }
function reiniciarSimulacao(){ document.querySelectorAll(".modulo").forEach(m=>m.checked=false); document.getElementById("descricao").value=""; document.getElementById("negocio").selectedIndex=0; document.getElementById("usuarios").selectedIndex=0; document.getElementById("leadNome").value=""; document.getElementById("leadEmpresa").value=""; document.getElementById("leadWhatsapp").value=""; document.getElementById("leadEmail").value=""; document.getElementById("leadCidade").value=""; document.getElementById("ia-result").style.display="none"; todosSelecionados=false; calcular(); nextEtapa(1); }
function selecionarTodos(){ todosSelecionados=!todosSelecionados; document.querySelectorAll(".modulo").forEach(m=>m.checked=todosSelecionados); const btn=document.querySelector(".btn-selecionar-todos"); if(btn) btn.innerHTML=todosSelecionados?'<i class="fa-solid fa-xmark"></i> Desmarcar Todos':'<i class="fa-solid fa-layer-group"></i> Selecionar Todos - <span>Mais completo, porem maior investimento</span>'; calcular(); }

// IA SUPER INTELIGENTE - ENTENDE TUDO
function normalizar(s){ return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim(); }

const MODULOS_INTELIGENTE = [
  {nome:"Clientes e CRM", termos:["cliente","paciente","aluno","contato","crm","cadastro","ficha","caderno","planilha","agenda de cliente","lista de cliente","perco cliente","nome telefone"]},
  {nome:"Estoque e Produtos", termos:["estoque","produto","peca","mercadoria","inventario","insumo","perco peca","sumico","controle de peca","pecas"]},
  {nome:"Financeiro Completo", termos:["financeiro","dinheiro","caixa","lucro","despesa","conta a pagar","conta a receber","fluxo de caixa","fechar caixa","quanto ganhei","controle financeiro"]},
  {nome:"Caixa PDV", termos:["pdv","venda","balcao","frente de caixa","vender","vendas no balcao"]},
  {nome:"Ordens de Servico", termos:["ordem","os","servico","aparelho","celular","defeito","conserto","oficina","manutencao","garantia","equipamento","veiculo","carro","moto","arrumar","tecnica"]},
  {nome:"WhatsApp Automatico", termos:["whats","zap","wpp","mensagem","avisar cliente","notificacao","aviso","cliente esquece","aviso automatico","mandar zap","zap automatico"]},
  {nome:"Agendamento", termos:["agendamento","agenda","horario","marcar horario","reserva","consulta","atendimento marcado","horario cliente"]},
  {nome:"Dashboard e Relatorios", termos:["relatorio","dashboard","grafico","indicador","relatorios","controle","nao sei quanto","organizar"]},
  {nome:"App Android", termos:["app","aplicativo","celular","mobile","android","na rua","fora da loja","app celular"]},
  {nome:"App iOS", termos:["iphone","ios","app apple","app iphone"]},
  {nome:"Nota Fiscal NFe", termos:["nota","nfe","nfse","fiscal","imposto","emitir nota","nota fiscal"]},
  {nome:"Delivery e iFood", termos:["delivery","ifood","entrega","motoboy","cardapio","pedido entrega","entregador"]},
  {nome:"Comissoes", termos:["comissao","porcentagem vendedor","funcionario","comissao funcionario"]},
  {nome:"Contratos", termos:["contrato","mensalidade","plano","recorrencia","assinatura mensal"]},
  {nome:"Fidelidade Cashback", termos:["fidelidade","cashback","pontos","cliente voltar","fidelizar"]},
  {nome:"Catalogo Online", termos:["catalogo","site","vitrine","mostrar produto","catalogo online","loja virtual"]},
  {nome:"Chat Interno", termos:["chat interno","conversa equipe","mensagem equipe"]},
  {nome:"Assinatura Digital", termos:["assinatura","assinar","contrato digital"]},
  {nome:"Backup Automatico", termos:["backup","seguranca","nuvem","perder dados"]}
];

function interpretarIA(){
  const raw = document.getElementById("descricao").value;
  const r = document.getElementById("ia-result");
  if(!raw.trim()){
    r.style.display="block";
    r.innerHTML=`Você pode pular essa etapa. É opcional. Selecione os módulos manualmente na próxima etapa se preferir.`;
    return;
  }
  const t = normalizar(raw);
  let scores = {};
  MODULOS_INTELIGENTE.forEach(mod=>{
    mod.termos.forEach(term=>{
      if(t.includes(normalizar(term))){
        scores[mod.nome] = (scores[mod.nome]||0)+1;
      }
    });
  });
  // Reforços inteligentes para linguagem leiga
  if(t.match(/caderno|papel|planilha|anoto|perco/)) scores["Clientes e CRM"]=(scores["Clientes e CRM"]||0)+1;
  if(t.match(/esqueco|esquece|avisar|aviso|lembrar/)) scores["WhatsApp Automatico"]=(scores["WhatsApp Automatico"]||0)+2;
  if(t.match(/tempo|demora|manual|fazendo conta/)) scores["Dashboard e Relatorios"]=(scores["Dashboard e Relatorios"]||0)+1;

  let detectados = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
  if(detectados.length===0){ detectados=["Clientes e CRM","Financeiro Completo","Dashboard e Relatorios"]; }

  document.querySelectorAll(".modulo").forEach(c=>c.checked=false);
  document.querySelectorAll(".modulo").forEach(c=>{ if(detectados.includes(c.dataset.nome)) c.checked=true; });

  r.style.display="block";
  r.innerHTML=`<strong>IA super inteligente detectou ${detectados.length} módulos ideais:</strong><br>• ${detectados.join("<br>• ")}<br><small style="opacity:.6">Mesmo escrevendo de qualquer jeito, a gente entendeu. Ajuste se quiser na próxima etapa.</small>`;
  calcular();
}

function calcular(){
  let total=160,mods=[];
  document.querySelectorAll(".modulo").forEach(m=>{ if(m.checked){ let preco=getPrecoModulo(m.dataset.nome); total+=preco; mods.push({nome:m.dataset.nome,valor:preco}); } });
  total+=Number(document.getElementById("usuarios").value);
  valorProjeto=total;
  document.getElementById("valor").innerText=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  let prazo=total<=200?"5 a 10 dias":total<=300?"10 a 15 dias":total<=400?"15 a 25 dias":"25 a 40 dias";
  document.getElementById("prazo").innerHTML=`<strong>Prazo estimado:</strong> ${prazo} | <strong>Módulos:</strong> ${mods.length}`;
  document.getElementById("projetoNome").innerText=document.getElementById("negocio").value+" - Personalizado";
  let html=mods.length?"":"<li>Sistema base incluso - R$ 160</li>"; mods.forEach(i=> html+=`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${i.nome} <span style="opacity:.5">(+R$ ${i.valor})</span></li>`);
  document.getElementById("escopo").innerHTML=html;
  document.getElementById("economia").innerText=`Proposta gerada para avaliação. Sem promessa de lucro garantido.`;
  desenharROI();
}
function desenharROI(){
  const c=document.getElementById("roiChart"); if(!c) return; if(roiChart) roiChart.destroy();
  const labels=["Organização","Tempo","Controle","Escala"];
  roiChart=new Chart(c.getContext("2d"),{type:"bar",data:{labels,datasets:[{label:"Nível de organização com sistema",data:[90,85,95,80],backgroundColor:["#00e5ff","#7b61ff","#00ff88","#ffb700"],borderRadius:8}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{ticks:{color:"#888"},grid:{color:"rgba(255,255,255,.05)"}},x:{ticks:{color:"#888"},grid:{display:false}}}}});
}
function validar(){ const n=document.getElementById("leadNome").value.trim(),w=document.getElementById("leadWhatsapp").value.trim(),e=document.getElementById("leadEmail").value.trim(); if(!n||!w||!e){alert("Preencha Nome, WhatsApp e E-mail");return false;} return true; }
const SUPABASE_URL="https://ecrpiuhsbhuqcxbbpqfh.supabase.co";
const SUPABASE_KEY="sb_publishable_I7Hw7KieW3VNFqb9LYrFoQ_tFWWABwl";
async function salvarLead(){
  const lead={data:new Date().toLocaleString("pt-BR"),nome:document.getElementById("leadNome").value||'Nao informou',empresa:document.getElementById("leadEmpresa").value||'Nao informou',whatsapp:document.getElementById("leadWhatsapp").value,email:document.getElementById("leadEmail").value,cidade:document.getElementById("leadCidade").value||'Nao informou',negocio:document.getElementById("negocio").value,valor:document.getElementById("valor").innerText,descricao:document.getElementById("descricao").value||'Quero um sistema sob medida',escopo:Array.from(document.querySelectorAll(".modulo:checked")).map(m=>m.dataset.nome).join(", ")||'Sistema base'};
  try{ const local=JSON.parse(localStorage.getItem("leadsDA")||"[]"); local.push(lead); localStorage.setItem("leadsDA",JSON.stringify(local)); }catch(e){}
  try{ await fetch(`${SUPABASE_URL}/rest/v1/leads`,{method:"POST",headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(lead)}); }catch(e){ console.log("Fallback local",e); }
}
async function gerarPDFBlob(){
  await new Promise(r=>setTimeout(r, 500)); if(!roiChart){ calcular(); await new Promise(r=>setTimeout(r, 800)); }
  const {jsPDF}=window.jspdf; const doc=new jsPDF('p','mm','a4'); const W=210, H=297;
  doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); doc.setFillColor(0,229,255); doc.rect(0,0,W,7,"F");
  if(logoBase64){ try{ doc.addImage(logoBase64,'PNG',15,10,11,11); }catch(e){} doc.setTextColor(255,255,255); doc.setFontSize(15); doc.setFont("helvetica","bold"); doc.text("SOFTWARE",29,18); } else { doc.setTextColor(0,229,255); doc.setFontSize(15); doc.text("DA SOFTWARE",15,18); }
  doc.setFontSize(7); doc.setTextColor(180,180,200); doc.text("SISTEMAS SOB MEDIDA - CALCULO REAL DE SISTEMA",15,23);
  doc.setDrawColor(0,229,255); doc.line(15,25,W-15,25);
  doc.setTextColor(255,255,255); doc.setFontSize(12); doc.setFont("helvetica","bold"); doc.text("Proposta Comercial Premium",15,32);
  doc.setFontSize(9); doc.setTextColor(200,200,220); doc.setFont("helvetica","normal");
  doc.text(`Cliente: ${document.getElementById("leadNome").value} ${document.getElementById("leadEmpresa").value? "- " + document.getElementById("leadEmpresa").value : ""}`,15,37);
  doc.text(`Segmento: ${document.getElementById("negocio").value} | Data: ${new Date().toLocaleDateString("pt-BR")}`,15,41);
  doc.text(`Contato: ${document.getElementById("leadWhatsapp").value} | ${document.getElementById("leadEmail").value} | ${document.getElementById("leadCidade").value}`,15,45);
  doc.setFillColor(16,22,42); doc.roundedRect(15,49,W-30,22,3,3,"F");
  doc.setTextColor(0,229,255); doc.setFontSize(8); doc.setFont("helvetica","bold"); doc.text("INVESTIMENTO - CALCULO REAL",18,55);
  doc.setTextColor(255,255,255); doc.setFontSize(20); doc.text(`${document.getElementById("valor").innerText}`,18,64);
  doc.setFontSize(7); doc.setTextColor(160,180,200); doc.text(doc.splitTextToSize(`${document.getElementById("prazo").innerText} | Em ate 12x no cartao | PIX com condicao especial`, 90), 105, 53);
  doc.setTextColor(255,255,255); doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.text("Descricao do Cliente:",15,76);
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(200,200,200);
  let descLinhas=doc.splitTextToSize(document.getElementById("descricao").value || "Cliente optou por escolher modulos manualmente", W-30);
  doc.text(descLinhas,15,80); let y=80+descLinhas.length*4+6;
  doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(255,255,255); doc.text("Escopo Incluido:",15,y); y+=6;
  doc.setFontSize(8); doc.setFont("helvetica","normal");
  document.querySelectorAll(".modulo:checked").forEach(m=>{
    let preco=getPrecoModulo(m.dataset.nome);
    if(y> H-25){ doc.addPage(); doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); y=15; }
    doc.setFillColor(23,32,51); doc.roundedRect(15,y-3,W-30,8,2,2,"F");
    doc.setTextColor(230,230,255); doc.text(`- ${m.dataset.nome} (+R$ ${preco})`,18,y+1); y+=10;
  });
  doc.addPage(); doc.setFillColor(5,8,22); doc.rect(0,0,W,H,"F"); doc.setFillColor(0,229,255); doc.rect(0,0,W,7,"F");
  doc.setTextColor(255,255,255); doc.setFontSize(13); doc.setFont("helvetica","bold"); doc.text("PROPOSTA PARA AVALIACAO",15,16);
  doc.setFontSize(8); doc.setFont("helvetica","normal"); doc.setTextColor(180,180,200); doc.text(`${document.getElementById("prazo").innerText}`,15,22); doc.text(`Sem promessa de lucro garantido - avaliacao tecnica`,15,26);
  try{ const canvas=document.getElementById("roiChart"); if(canvas){ doc.addImage(canvas.toDataURL("image/png",1.0),'PNG',10,30, W-20, 85); } }catch(e){}
  return doc;
}
async function enviarWhatsappComPDF(){
  if(!validar()) return;
  calcular(); salvarLead(); desenharROI();
  await new Promise(r=>setTimeout(r, 600));
  const doc=await gerarPDFBlob();
  doc.save(`Proposta-DA-${document.getElementById("leadNome").value||"Cliente"}.pdf`);
  let esc=""; document.querySelectorAll(".modulo:checked").forEach(m=>{ esc+=`> ${m.dataset.nome} (+R$ ${getPrecoModulo(m.dataset.nome)})\n`; });
  const valor=document.getElementById("valor").innerText;
  const msg="*NOVA SOLICITACAO - DA SOFTWARE*\n--------------------------------\n\n*Cliente:* "+document.getElementById("leadNome").value+"\n*Empresa:* "+(document.getElementById("leadEmpresa").value||'Nao informou')+"\n*Cidade:* "+(document.getElementById("leadCidade").value||'Nao informou')+"\n\n*PROJETO:*\nSegmento: "+document.getElementById("negocio").value+"\nInvestimento: *"+valor+"*\n"+document.getElementById("prazo").innerText+"\n\n*MODULOS INCLUSOS:*\n"+(esc||"- Sistema base incluso - R$ 160\n")+"\n*NECESSIDADE:*\n"+(document.getElementById("descricao").value||"Cliente optou por escolher modulos manualmente")+"\n\n*CONTATOS:*\nWhatsApp: "+document.getElementById("leadWhatsapp").value+"\nEmail: "+document.getElementById("leadEmail").value+"\n\nQuero avaliar a proposta!";
  window.open(`https://wa.me/${WHATSAPP_NUM}?text=${encodeURIComponent(msg)}`,"_blank");
}
let recognition=null, gravando=false; let textoAcumulado="";
function toggleGravacao(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert("Use Google Chrome no celular!");return;}
  const btn=document.getElementById("btnAudio"), icon=document.getElementById("iconMic"), status=document.getElementById("audioStatus");
  const descricao=document.getElementById("descricao");
  if(gravando){ gravando=false; if(btn) btn.classList.remove("gravando"); if(icon) icon.className="fa-solid fa-microphone"; if(status) status.style.display="none"; try{ recognition.stop(); }catch(e){} return; }
  textoAcumulado=descricao.value?descricao.value+" ":"";
  recognition=new SR(); recognition.lang="pt-BR"; recognition.continuous=true; recognition.interimResults=true;
  recognition.onstart=()=>{ gravando=true; if(btn) btn.classList.add("gravando"); if(icon) icon.className="fa-solid fa-stop"; if(status){ status.style.display="block"; status.innerHTML='<i class="fa-solid fa-circle" style="color:red; animation: pulse 1s infinite;"></i> Ouvindo... clique de novo para parar'; } };
  recognition.onresult=(e)=>{ let final=""; for(let i=0;i<e.results.length;i++){ if(e.results[i].isFinal) final+=e.results[i][0].transcript+" "; } if(final){ descricao.value=textoAcumulado+final; interpretarIA(); } else { let parcial=""; for(let i=0;i<e.results.length;i++) parcial+=e.results[i][0].transcript; descricao.value=textoAcumulado+parcial; } };
  recognition.onend=()=>{ if(gravando){ try{ recognition.start(); }catch(e){} } else { const b=document.getElementById("btnAudio"); if(b) b.classList.remove("gravando"); const i=document.getElementById("iconMic"); if(i) i.className="fa-solid fa-microphone"; const s=document.getElementById("audioStatus"); if(s) s.style.display="none"; } };
  recognition.start();
}
function pararGravacao(){ gravando=false; const b=document.getElementById("btnAudio"); if(b) b.classList.remove("gravando"); const i=document.getElementById("iconMic"); if(i) i.className="fa-solid fa-microphone"; const s=document.getElementById("audioStatus"); if(s) s.style.display="none"; try{ if(recognition) recognition.stop(); }catch(e){} }
const nomesBase=["Ana","Carlos","Lucas","Mariana","Rafael","Juliana","Fernando","Patricia","Diego","Bruna","Thiago","Camila","Roberto","Leticia","Gustavo","Amanda","Felipe","Larissa","Rodrigo","Isabela","Marcelo","Vanessa","Leandro","Priscila","Fabio","Renata","Alexandre","Tatiane","Eduardo","Debora","Samuel","Aline","Henrique","Simone","Andre","Cristiane","Paulo","Michele","Ricardo","Elisa","Jorge","Carla","Vinicius","Luciana","Caio","Bianca","Danilo","Silvia","Igor","Regiane","Murilo","Sandra","Cesar","Fatima","Erick","Rosana","Maicon","Eliane","Wesley","Josiane","Alex","Kelly","Diogo","Cintia","Cleber","Daiane","Douglas","Elaine","Everton","Flavia","Gilberto","Gisele","Helio","Jaqueline","Jean","Jessica","Joao","Juliane","Karina","Leonardo","Lilian","Luciano","Luana","Marcos","Marcela","Mauricio","Monica","Nelson","Natalia","Otavio","Paula","Reinaldo","Renan","Rogerio","Sabrina","Sandro","Sueli","Valter","Viviane","Wilson","Tania","Claudio","Denise","Edson","Elisangela","Emerson","Fabiana","Fabiano","Fernanda","Francisco","Gabriel","Giovanna","Guilherme","Helena","Ivan","Janaina","Jonas","Julia","Julio","Leila","Livia","Luiz","Luiza","Mauro","Milena","Naiara","Neusa","Nilson","Orlando","Paula","Roseli","Sergio","Sheila","Sidnei","Solange","Tais","Valeria","Vanderlei","Vitor"];
const cidades=["Sao Paulo, SP","Rio de Janeiro, RJ","Belo Horizonte, MG","Curitiba, PR","Porto Alegre, RS","Salvador, BA","Recife, PE","Fortaleza, CE","Goiania, GO","Brasilia, DF","Sao Jose do Rio Preto, SP","Mirassol, SP","Uberaba, MG","Ribeirao Preto, SP","Campinas, SP","Sorocaba, SP","Uberlandia, MG","Londrina, PR","Maringa, PR","Joinville, SC","Florianopolis, SC","Cuiaba, MT","Campo Grande, MS","Manaus, AM","Belem, PA","Vitoria, ES","Santos, SP","Jundiai, SP","Osasco, SP","Guarulhos, SP","Contagem, MG","Anapolis, GO","Palmas, TO","Juiz de Fora, MG"];
const negociosLista=["Assistencia - R$","Mercado - R$","Oficina - R$","Lava Jato - R$","Restaurante - R$","Clinica - R$","Pet Shop - R$","Academia - R$","Imobiliaria - R$","Farmacia - R$","Startup Completa - R$","Auto Pecas - R$"];
const modulosPool=["Clientes e CRM","Estoque","Financeiro","PDV","Ordens","WhatsApp","Agendamento","Dashboard","App Android","App iOS","Multi-empresas","NFe","Delivery","Comissoes","Contratos","Chat","Assinatura","Fidelidade","Catalogo","Backup"];
function gerarNotificacoes(qtd){ const lista=[]; for(let i=0;i<qtd;i++){ const nome=nomesBase[Math.floor(Math.random()*nomesBase.length)]; const cidade=cidades[Math.floor(Math.random()*cidades.length)]; const negocioBase=negociosLista[Math.floor(Math.random()*negociosLista.length)]; const valor=Math.floor(Math.random()*(400-100+1))+100; const data=new Date(Date.now()-Math.floor(Math.random()*1000*60*60*72)); const dataStr=data.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); const escopo=modulosPool.sort(()=>0.5-Math.random()).slice(0,Math.floor(Math.random()*4)+2); lista.push({nome:`${nome} - ${cidade}`,nomeCurto:nome,cidade,projeto:`${negocioBase} ${valor}`,valor,negocio:negocioBase.replace(" - R$",""),dataStr,escopo}); } return lista; }
const notificacoes=gerarNotificacoes(300); let ultimoIdx=-1;
function abrirDetalheNotificacao(){ if(!notificacaoAtual) return; document.getElementById("modal-titulo").innerText=`${notificacaoAtual.nomeCurto} simulou um projeto`; document.getElementById("modal-data").innerText=`Gerado em: ${notificacaoAtual.dataStr} - ${notificacaoAtual.cidade}`; document.getElementById("modal-negocio").innerText=`${notificacaoAtual.projeto} | ${notificacaoAtual.negocio}`; const ul=document.getElementById("modal-escopo"); ul.innerHTML=""; notificacaoAtual.escopo.forEach(m=>{ ul.innerHTML+=`<li><i class="fa-solid fa-check" style="color:#00e5ff"></i> ${m}</li>`; }); document.getElementById("notif-modal").classList.add("show"); }
setInterval(()=>{ let idx; do{ idx=Math.floor(Math.random()*notificacoes.length); }while(idx===ultimoIdx); ultimoIdx=idx; notificacaoAtual=notificacoes[idx]; document.getElementById("notif-name").innerText=notificacoes[idx].nome; document.getElementById("notif-project").innerText=notificacoes[idx].projeto; document.getElementById("sales-notification").classList.add("show"); setTimeout(()=>document.getElementById("sales-notification").classList.remove("show"),5000); },8500);
document.addEventListener("change",()=>{ if(etapaAtual>=2) calcular(); }); calcular();
