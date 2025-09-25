(function(){
  document.addEventListener('DOMContentLoaded', init);
  function init(){
    try{
      const THEMES = [
        { key: 'planeta', label: 'Planeta', emoji: '🪐' },
        { key: 'estrela', label: 'Estrela', emoji: '⭐' },
        { key: 'galaxia', label: 'Galáxia', emoji: '🌌' },
        { key: 'lua', label: 'Lua', emoji: '🌙' },
        { key: 'foguete', label: 'Foguete', emoji: '🚀' },
        { key: 'buraco', label: 'Buraco Negro', emoji: '🕳️' }
      ];
      const QUESTIONS = [
        { id:'q1', theme:'planeta', title:'📞 Situação', text:'Durante uma ligação feita para tratar do contrato de Juliana, quem atende é Carlos, que afirma ser o responsável pelo financiamento. Qual deve ser o procedimento correto para garantir a segurança das informações?', options:[
          {key:'A',text:'Confirmar apenas o nome completo de Carlos e verificar se ele é casado com Juliana no cartório.'},
          {key:'B',text:'Confirmar o nome completo de Juliana (titular do contrato), solicitar os dois últimos dígitos do CPF dela e um dado sobre o veículo financiado.'},
          {key:'C',text:'Solicitar que Carlos envie uma autorização por escrito sem confirmar nenhum dado.'},
          {key:'D',text:'Confirmar o nome completo de Carlos, o CPF dele e um dado sobre o veículo financiado.'}
        ], correct:'B' },
        { id:'q2', theme:'estrela', title:'Verdadeiro ou Falso', text:'Antes de encerrar qualquer atendimento (negócio ou não negócio) é obrigatório realizar o CAD OK?', options:[{key:'A',text:'Verdadeiro'},{key:'B',text:'Falso'}], correct:'A' },
        { id:'q3', theme:'galaxia', title:'Comunicação final no atendimento', text:'Qual das opções abaixo representa corretamente o que deve ser informado ao cliente ao final do atendimento?', options:[
          {key:'A',text:'Informar que ele poderá receber uma pesquisa via SMS para avaliar o atendimento e que os contatos da central estão disponíveis no site do Santander Financiamentos ou no verso do carnê.'},
          {key:'B',text:'Informar que o cliente deve retornar a ligação em até 24 horas para confirmar os dados do contrato.'},
          {key:'C',text:'Informar que o atendimento será encerrado automaticamente após 5 minutos.'},
          {key:'D',text:'Informar que ele receberá um boleto atualizado por e-mail.'}
        ], correct:'A' },
        { id:'q4', theme:'lua', title:'Detalhamento da dívida', text:'João possui a parcela 20 no valor de R$ 2.000 com 10 dias de atraso. Ele aceitou a negociação. Nesse caso, é necessário fazer o detalhamento da dívida?', options:[
          {key:'A',text:'Sim. Devemos informar o número do contrato, produto, parcela, dias em atraso e valor atualizado.'},
          {key:'B',text:'Não. Basta registrar que o cliente aceitou a negociação.'},
          {key:'C',text:'Sim. Mas apenas o valor da parcela e o número do contrato são suficientes.'},
          {key:'D',text:'Não. O detalhamento só é necessário se o cliente solicitar.'}
        ], correct:'A' },
        { id:'q5', theme:'foguete', title:'Ao final da negociação', text:'O que deve ser informado ao cliente ao final de uma negociação?', options:[
          {key:'A',text:'Que o boleto será reemitido com novo vencimento sem nenhuma consequência.'},
          {key:'B',text:'Que o contrato será cancelado automaticamente após o vencimento.'},
          {key:'C',text:'Que o cliente poderá pagar quando quiser, sem impacto no contrato.'},
          {key:'D',text:'Que poderá haver ligações diárias, cobrança de juros e encargos (multa de 2% e mora de até 1% ao mês), restrição ao crédito e possível busca e apreensão.'}
        ], correct:'D' },
        { id:'q6', theme:'buraco', title:'Confirmação de dados', text:'Quais informações devem ser confirmadas com o cliente durante o atendimento?', options:[
          {key:'A',text:'Confirmar o nome completo do cliente e um dado relacionado ao bem.'},
          {key:'B',text:'Informar o nome completo ao cliente, solicitar que confirme se está correto e, em seguida, pedir os dois últimos dígitos do CPF.'},
          {key:'C',text:'Informar o CPF do cliente e solicitar que ele confirme seu nome completo.'},
          {key:'D',text:'Confirmar apenas o nome completo do cliente.'}
        ], correct:'B' }
      ];
      const SCORE_PAIR_BONUS = 2;
      const $ = (sel)=> document.querySelector(sel);
      const $$ = (sel)=> document.querySelectorAll(sel);
      function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
      function toast(msg,ms=2000){ const t=$('#toast'); if(!t) return; t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),ms); }

      const state = { player:{ name:'' }, deck:[], started:false, previewActive:false, previewInterval:null, answeredThemes:new Set(), correctAnswers:0, pairsFound:0, score(){ return this.correctAnswers + this.pairsFound*SCORE_PAIR_BONUS; }, selected:[], lockBoard:false };

      function createDeck(){ const byKey=Object.fromEntries(THEMES.map(t=>[t.key,t])); const deck=[]; for(const q of QUESTIONS){ for(let i=0;i<2;i++){ deck.push({ id:q.id+'_'+i, theme:q.theme, label:byKey[q.theme].label, emoji:byKey[q.theme].emoji, flipped:false, matched:false, el:null }); } } return shuffle(deck); }
      function renderBoard(){ const board=$('#board'); if(!board) return; board.innerHTML=''; state.deck.forEach(card=>{ const it=document.createElement('button'); it.className='card3d'; it.setAttribute('aria-label',`Carta ${card.label}`); it.innerHTML=`<div class="inner"><div class="face front"><div class="card-emoji">✨</div><div class="card-theme">Memorize</div></div><div class="face back"><div class="card-emoji">${card.emoji}</div><div class="card-theme">${card.label}</div></div></div>`; it.addEventListener('click',()=>onCardClick(card)); card.el=it; board.appendChild(it); }); }
      function setCardFlip(c,f){ c.flipped=f; c.el?.classList.toggle('flipped',f); }
      function setCardMatched(c){ c.matched=true; c.el?.classList.add('matched'); }
      function goto(id){ $$('.screen').forEach(s=>s.classList.remove('active')); const scr=document.querySelector(id); if(scr) scr.classList.add('active'); }

      function setupGame(){ state.deck=createDeck(); state.started=false; state.previewActive=false; state.answeredThemes=new Set(); state.correctAnswers=0; state.pairsFound=0; state.selected=[]; state.lockBoard=false; renderBoard(); updateHUD(); const hint=$('#hint'); if(hint) hint.textContent='Dica: Você pode usar a pré‑visualização (20s) para memorizar as posições antes de começar.'; const btnPrev=$('#btn-preview'), btnStart=$('#btn-start'); if(btnPrev) btnPrev.disabled=false; if(btnStart) btnStart.disabled=false; $('#preview-timer')?.classList.add('hidden'); }
      function updateHUD(){ $('#hud-correct').textContent=state.correctAnswers; $('#hud-pairs').textContent=state.pairsFound; $('#hud-score').textContent=state.score(); }

      function startPreview(){ if(state.started||state.previewActive) return; state.previewActive=true; $('#btn-preview').disabled=true; $('#btn-start').disabled=true; $('#hint').textContent='Pré‑visualização em andamento: memorize as posições!'; state.deck.forEach(c=>setCardFlip(c,true)); let remaining=20; const badge=$('#preview-timer'); badge.classList.remove('hidden'); badge.textContent=remaining+'s'; state.previewInterval=setInterval(()=>{ remaining--; badge.textContent=remaining+'s'; if(remaining<=0){ clearInterval(state.previewInterval); endPreview(); } },1000); }
      function endPreview(){ state.previewActive=false; $('#preview-timer').classList.add('hidden'); state.deck.forEach(c=>setCardFlip(c,false)); $('#hint').textContent='Pré‑visualização encerrada. Clique em "Iniciar jogo" para começar!'; $('#btn-start').disabled=false; }
      function startGame(){ if(state.started||state.previewActive) return; state.started=true; $('#btn-preview').disabled=true; $('#btn-start').disabled=true; $('#hint').textContent='Vire duas cartas. Ao formar um par, responda a pergunta do tema!'; }

      function onCardClick(card){ if(!state.started){ toast('Clique em "Iniciar jogo" para começar.'); return;} if(state.previewActive||state.lockBoard||card.matched||card.flipped) return; setCardFlip(card,true); state.selected.push(card); if(state.selected.length===2){ state.lockBoard=true; const [c1,c2]=state.selected; if(c1.theme===c2.theme&&c1.id!==c2.id){ setTimeout(()=>{ setCardMatched(c1); setCardMatched(c2); state.pairsFound++; updateHUD(); toast('Par encontrado! +'+SCORE_PAIR_BONUS+' pontos'); state.selected=[]; openQuestionModal(c1.theme); },350);} else { setTimeout(()=>{ setCardFlip(c1,false); setCardFlip(c2,false); state.selected=[]; state.lockBoard=false; },700);} } }

      const qModal = document.getElementById('question-modal'); const qTitle=$('#question-title'); const qText=$('#question-text'); const qOptions=$('#options');
      function openQuestionModal(theme){ if(state.answeredThemes.has(theme)){ state.lockBoard=false; if(state.pairsFound===QUESTIONS.length && state.answeredThemes.size===QUESTIONS.length){ endGame(); } return; } const q=QUESTIONS.find(x=>x.theme===theme); if(!q){ state.lockBoard=false; return; } qTitle.textContent=q.title; qText.textContent=q.text; qOptions.innerHTML=''; q.options.forEach(opt=>{ const b=document.createElement('button'); b.type='button'; b.className='option-btn'; b.innerHTML=`<strong>${opt.key})</strong> ${opt.text}`; b.addEventListener('click',()=>handleAnswer(q,opt.key)); qOptions.appendChild(b); }); try{ qModal.showModal(); }catch(e){ qModal.setAttribute('open','open'); }}
      function handleAnswer(q, chosen){ qOptions.querySelectorAll('button').forEach(b=>b.disabled=true); const correct=(chosen===q.correct); qOptions.querySelectorAll('button').forEach(b=>{ const k=b.textContent.trim().charAt(0); if(k===q.correct) b.classList.add('correct'); if(k===chosen&&!correct) b.classList.add('wrong'); }); if(correct){ state.correctAnswers++; toast('Resposta correta! +1 ponto'); } else { toast('Resposta incorreta.'); } state.answeredThemes.add(q.theme); updateHUD(); setTimeout(()=>{ try{ qModal.close(); }catch{} state.lockBoard=false; if(state.pairsFound===QUESTIONS.length && state.answeredThemes.size===QUESTIONS.length){ setTimeout(endGame,400); } },450); }

      function endGame(){ $('#final-name').textContent = state.player.name || '—'; $('#final-correct').textContent = state.correctAnswers; $('#final-pairs').textContent = state.pairsFound; $('#final-score').textContent = state.score(); const fb=buildFeedback(state.correctAnswers,state.pairsFound,state.score()); $('#final-feedback').textContent=fb; goto('#final-screen'); }
      function buildFeedback(c,p,s){ if(c===6&&p===6) return 'Perfeito! Você dominou as perguntas e a memória espacial. Parabéns, comandante!'; if(c>=5) return 'Excelente! Ótimo domínio do conteúdo e boa estratégia de memória.'; if(c>=3) return 'Bom resultado! Continue praticando para evoluir ainda mais.'; return 'Você está no caminho! Revisar o conteúdo e tentar novamente vai turbinar seu desempenho.'; }

      const form = $('#player-form'); if(form){ form.addEventListener('submit',(e)=>{ e.preventDefault(); const name=$('#player-name')?.value.trim()||''; if(!name){ toast('Por favor, informe seu nome.'); return;} state.player.name=name; const hud=$('#hud-name'); if(hud) hud.textContent=name; setupGame(); goto('#game-screen'); return false; }); }
      $('#btn-preview')?.addEventListener('click', startPreview);
      $('#btn-start')?.addEventListener('click', startGame);
      $('#btn-restart')?.addEventListener('click', ()=>{ setupGame(); goto('#game-screen'); });
    }catch(err){ console.error('[Jogo] Erro na init:', err); alert('Ocorreu um erro ao iniciar o jogo. Abra o Console (F12) e me envie a mensagem exibida.'); }
  }
})();
