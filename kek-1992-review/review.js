(() => {
  const form = document.getElementById('moritaSurvey');
  const copyButton = document.getElementById('copyAnswers');
  const printButton = document.getElementById('printPage');
  const status = document.getElementById('copyStatus');

  const sections = [
    {title:'1. CERNでHTMLを書いた端末', radio:'cern_terminal', note:'cern_terminal_note'},
    {title:'2. 最初のHTMLの書き方', radio:'html_learning', note:'html_learning_note'},
    {title:'3. 薄緑背景・白文字の再現画像', radio:'green_origin', note:'green_origin_note'},
    {title:'4. CERNでHTMLを書いたあとの確認方法', radio:'cern_check', note:'cern_check_note'},
    {title:'5. KEKUXでのWWWページ確認方法', radio:'kek_check', note:'kek_check_note'},
    {title:'6. その他、当時について', radio:null, note:'other_note'}
  ];

  function selected(name){
    if(!name) return '';
    const el = form?.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : '';
  }

  function note(name){
    if(!name) return '';
    const el = form?.elements.namedItem(name);
    return el && 'value' in el ? el.value.trim() : '';
  }

  function buildText(){
    const lines = ['KEK 1992 WWW — ご確認回答メモ', ''];
    let answered = false;
    for(const section of sections){
      const choice = selected(section.radio);
      const free = note(section.note);
      if(!choice && !free) continue;
      answered = true;
      lines.push(`【${section.title}】`);
      if(choice) lines.push(`選択: ${choice}`);
      if(free) lines.push(`補足: ${free}`);
      lines.push('');
    }
    if(!answered) lines.push('（まだ回答が入力されていません）');
    else lines.push('※未回答の項目は省略しています。');
    return lines.join('\n');
  }

  async function copyText(text){
    if(navigator.clipboard && window.isSecureContext){
      await navigator.clipboard.writeText(text); return;
    }
    const helper=document.createElement('textarea');
    helper.value=text; helper.setAttribute('readonly','');
    helper.style.position='fixed'; helper.style.opacity='0';
    document.body.appendChild(helper); helper.select();
    document.execCommand('copy'); helper.remove();
  }

  form?.addEventListener('change', (event) => {
    if(event.target.matches('input[type="radio"]')){
      const name=event.target.name;
      form.querySelectorAll(`input[name="${name}"]`).forEach(input=>{
        input.closest('label')?.classList.toggle('is-selected', input.checked);
      });
    }
  });

  copyButton?.addEventListener('click', async()=>{
    try{await copyText(buildText()); status.textContent='入力済みの回答をメール用テキストとしてコピーしました。';}
    catch(err){status.textContent='コピーできませんでした。印刷または手動コピーをご利用ください。'; console.error(err);}
  });
  printButton?.addEventListener('click',()=>window.print());

  const pane = document.getElementById('referencePane');
  const paneTitle = document.getElementById('referencePaneTitle');
  const paneNote = document.getElementById('referencePaneNote');
  const panePlaceholder = document.getElementById('referencePanePlaceholder');
  const paneImageWrap = document.getElementById('referencePaneImageWrap');
  const paneImage = document.getElementById('referencePaneImage');
  const paneEmulatorWrap = document.getElementById('referencePaneEmulatorWrap');
  const paneEmulator = document.getElementById('referencePaneEmulator');
  const closePane = document.getElementById('closeReferencePane');
  const backdrop = document.getElementById('referencePaneBackdrop');
  let lastTrigger = null;

  const isOverlayMode = () => window.matchMedia('(max-width: 1100px)').matches;

  function showPane(trigger){
    if(!pane || !trigger) return;
    const kind = trigger.dataset.viewerKind;
    const src = trigger.dataset.viewerSrc;
    const title = trigger.dataset.viewerTitle || '参考資料';
    const description = trigger.dataset.viewerNote || '';
    if(!kind || !src) return;

    lastTrigger = trigger;
    paneTitle.textContent = title;
    paneNote.textContent = description;
    panePlaceholder.hidden = true;
    paneImageWrap.hidden = kind !== 'image';
    paneEmulatorWrap.hidden = kind !== 'emulator';

    if(kind === 'image'){
      paneImage.src = src;
      paneImage.alt = title;
      if(paneEmulator.getAttribute('src') !== 'about:blank') paneEmulator.src = 'about:blank';
    }else{
      paneEmulator.src = src;
      paneImage.removeAttribute('src');
    }

    pane.classList.add('has-content');
    if(isOverlayMode()){
      pane.classList.add('is-open');
      backdrop.hidden = false;
      document.body.classList.add('reference-pane-open');
      closePane.focus({preventScroll:true});
    }else{
      pane.classList.remove('is-open');
      backdrop.hidden = true;
      pane.scrollTo({top:0, behavior:'smooth'});
    }
  }

  function hidePane(){
    if(!pane) return;
    if(isOverlayMode()){
      pane.classList.remove('is-open');
      backdrop.hidden = true;
      document.body.classList.remove('reference-pane-open');
      lastTrigger?.focus({preventScroll:true});
      return;
    }
    paneTitle.textContent = '左の縮小画像をクリックしてください';
    paneNote.textContent = '質問は左側に残ったままです。画像や表示候補だけをここで大きく確認できます。';
    panePlaceholder.hidden = false;
    paneImageWrap.hidden = true;
    paneEmulatorWrap.hidden = true;
    paneEmulator.src = 'about:blank';
    paneImage.removeAttribute('src');
    pane.classList.remove('has-content');
    lastTrigger?.focus({preventScroll:true});
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-viewer-kind]');
    if(trigger){
      event.preventDefault();
      showPane(trigger);
    }
  });
  closePane?.addEventListener('click', hidePane);
  backdrop?.addEventListener('click', hidePane);
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && pane?.classList.contains('is-open')) hidePane();
  });
  window.addEventListener('resize', () => {
    if(!isOverlayMode()){
      pane?.classList.remove('is-open');
      backdrop.hidden = true;
      document.body.classList.remove('reference-pane-open');
    }
  });
})();
