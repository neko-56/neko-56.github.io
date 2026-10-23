(function(){
  'use strict';
  const form=document.getElementById('moritaSurvey');
  const pane=document.getElementById('materialPane');
  const title=document.getElementById('viewerTitle');
  const body=document.getElementById('viewerBody');
  const note=document.getElementById('viewerNote');
  const close=document.getElementById('closeViewer');
  const expand=document.getElementById('expandViewer');
  const copyBtn=document.getElementById('copyAnswers');
  const clearBtn=document.getElementById('clearAnswers');
  const status=document.getElementById('copyStatus');
  const previewBtn=document.getElementById('previewAnswers');
  const previewDialog=document.getElementById('answersPreview');
  const previewText=document.getElementById('answersPreviewText');
  const previewCopy=document.getElementById('copyPreviewAnswers');
  const previewStatus=document.getElementById('previewCopyStatus');
  const storageKey='kek1992-morita-review-v055';
  const oldStorageKey='kek1992-morita-review-v045';
  let legacyAnswers={};
  const scrollKey='kek1992-morita-review-scroll-v045';
  const mobile=window.matchMedia('(max-width: 980px)');
  const paneHome=document.createComment('material pane');
  pane.before(paneHome);
  const dialog=document.createElement('dialog');
  dialog.className='viewer-dialog';
  dialog.setAttribute('aria-labelledby','viewerTitle');
  dialog.setAttribute('aria-modal','true');
  document.body.appendChild(dialog);
  let viewerTrigger=null;

  function syncViewerLayout(){
    const modal=pane.classList.contains('viewer-expanded') ||
      (pane.classList.contains('has-content') && mobile.matches);
    pane.classList.toggle('mobile-open',modal && mobile.matches);
    document.body.classList.toggle('viewer-overlay-open',modal);
    document.body.classList.toggle('viewer-has-content',pane.classList.contains('has-content'));
    if(modal && !dialog.open){
      dialog.appendChild(pane);
      dialog.showModal();
      close.focus();
    }else if(!modal && dialog.open){
      dialog.close();
      paneHome.after(pane);
    }
  }

  function closeViewer(){
    pane.classList.remove('viewer-expanded','mobile-open','has-content');
    expand.setAttribute('aria-pressed','false');
    expand.textContent='大きく表示';
    syncViewerLayout();
    title.textContent='ここに資料を表示します';
    body.innerHTML='<div class="viewer-placeholder"><p>左側の候補画像や再現画面をクリックすると、ここで大きく確認できます。</p><p>質問と回答欄は左側に残るので、そのまま続けて回答できます。</p></div>';
    note.textContent='';
    if(viewerTrigger && viewerTrigger.isConnected)viewerTrigger.focus();
  }

  dialog.addEventListener('cancel',e=>{e.preventDefault();closeViewer();});
  mobile.addEventListener('change',syncViewerLayout);

  function focusable(root){
    return [...root.querySelectorAll('button,a[href],input,select,textarea,iframe,[tabindex]')]
      .filter(el=>el.tabIndex>=0 && !el.disabled && el.getClientRects().length);
  }

  function trapViewerTab(e,frame){
    if(e.key!=='Tab' || !dialog.open)return;
    const outer=focusable(pane);
    const inner=frame?focusable(frame.contentDocument):outer;
    const active=frame?frame.contentDocument.activeElement:document.activeElement;
    const boundary=e.shiftKey?inner[0]:inner[inner.length-1];
    if(active!==boundary && inner.includes(active))return;
    e.preventDefault();
    const index=frame?outer.indexOf(frame):-1;
    const target=frame
      ?outer[(index+(e.shiftKey?-1:1)+outer.length)%outer.length]
      :(e.shiftKey?outer[outer.length-1]:outer[0]);
    if(target)target.focus();
  }
  document.addEventListener('keydown',e=>trapViewerTab(e));

  function escapeHtml(s){return String(s||'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}

  function showViewer(el){
    viewerTrigger=el;
    const kind=el.dataset.viewer;
    const src=el.dataset.src||'';
    title.textContent=el.dataset.title||'参考資料';
    note.textContent=el.dataset.note||'';
    if(kind==='image'){
      body.innerHTML='<div class="viewer-image-wrap"><img src="'+escapeHtml(src)+'" alt="'+escapeHtml(el.dataset.title||'参考資料')+'"></div>';
    }else if(kind==='emulator'){
      body.innerHTML='<iframe class="viewer-emulator" src="'+escapeHtml(src)+'" title="'+escapeHtml(el.dataset.title||'表示候補')+'"></iframe>';
      const frame=body.querySelector('iframe');
      frame.addEventListener('load',()=>{
        // Canvas handles Escape itself, so intercept it before its input handler.
        try{frame.contentDocument.addEventListener('keydown',e=>{
          if(e.key==='Escape' && dialog.open){
            e.preventDefault();e.stopPropagation();closeViewer();
          }else{
            trapViewerTab(e,frame);
          }
        },true);}catch(e){/* External frames retain their own keyboard handling. */}
      });
    }else if(kind==='link'){
      body.innerHTML='<div class="viewer-link-card"><p>'+escapeHtml(el.dataset.note||'関連資料です。')+'</p><a href="'+escapeHtml(src)+'" target="_blank" rel="noopener noreferrer">資料を別タブで開く ↗</a></div>';
      note.textContent='';
    }
    pane.classList.add('has-content');
    syncViewerLayout();
  }

  document.querySelectorAll('[data-viewer]').forEach(el=>el.addEventListener('click',()=>showViewer(el)));
  document.getElementById('referenceCandidates').addEventListener('toggle',function(){
    if(!this.open)return;
    this.querySelectorAll('iframe[data-preview-src]').forEach(frame=>{
      const url=new URL(frame.dataset.previewSrc,window.location.href);
      url.searchParams.set('preview','1');
      url.searchParams.set('animate','0');
      frame.src=url.href;
      delete frame.dataset.previewSrc;
    });
  });
  function setExpanded(on){
    pane.classList.toggle('viewer-expanded',!!on);
    expand.setAttribute('aria-pressed',on?'true':'false');
    expand.textContent=on?'右ペインに戻す':'大きく表示';
    syncViewerLayout();
    if(!on && !dialog.open)expand.focus();
  }
  expand.addEventListener('click',()=>setExpanded(!pane.classList.contains('viewer-expanded')));

  document.querySelectorAll('.machine-photo img').forEach(img=>{img.addEventListener('error',()=>{img.style.display='none';const b=img.closest('.machine-photo');if(b){const s=b.querySelector('span');if(s)s.textContent='画像を読み込めませんでした。出典リンクから確認できます';}});});
  close.addEventListener('click',closeViewer);

  function collect(){
    const data={};
    for(const el of form.elements){
      if(!el.name || el.type==='button')continue;
      if(el.type==='checkbox'){
        if(!data[el.name])data[el.name]=[];
        if(el.checked)data[el.name].push(el.value);
      }else if(el.type==='radio'){
        if(el.checked)data[el.name]=el.value;
      }else data[el.name]=el.value;
    }
    return data;
  }
  function renderLegacy(){
    const section=document.getElementById('legacyAnswers');
    section.hidden=Object.keys(legacyAnswers).length===0;
    document.getElementById('legacyAnswersText').textContent=ReviewAnswers.legacyText(legacyAnswers);
  }
  function save(){
    try{localStorage.setItem(storageKey,JSON.stringify({...collect(),__legacy:legacyAnswers}));}
    catch(e){status.textContent='このブラウザでは自動保存できません。入力した回答をコピーしてメールへ貼り付けてください。';}
  }
  function restore(){
    let data={};
    try{data=JSON.parse(localStorage.getItem(storageKey)||localStorage.getItem(oldStorageKey)||'{}');}catch(e){}
    const restored=ReviewAnswers.normalize(data);
    legacyAnswers=restored.legacy;
    for(const [name,value] of Object.entries(restored.answers)){
      const controls=[...form.elements].filter(el=>el.name===name);
      for(const el of controls){
        if(el.type==='checkbox')el.checked=value.includes(el.value);
        else if(el.type==='radio')el.checked=el.value===value;
        else el.value=value;
      }
      // Retain answers that no longer have a matching option.
      if(Array.isArray(value)){
        const unmatched=value.filter(v=>!controls.some(el=>el.value===v));
        if(unmatched.length)legacyAnswers[name]=unmatched.join(' / ');
      }
    }
    renderLegacy();
  }
  function onAnswerChange(e){
    const el=e.target;
    if(el.type==='checkbox'){
      const group=[...form.elements].filter(x=>x.type==='checkbox' && x.name===el.name);
      const choices=ReviewAnswers.toggleChoice(group.filter(x=>x.checked).map(x=>x.value),el.value,el.checked,
        group.filter(x=>x.hasAttribute('data-exclusive')).map(x=>x.value));
      group.forEach(x=>{x.checked=choices.includes(x.value);});
    }
    save();
  }
  form.addEventListener('input',onAnswerChange);
  form.addEventListener('change',onAnswerChange);
  restore();

  document.querySelectorAll('.primary-tabs a').forEach(a=>a.addEventListener('click',()=>{
    try{sessionStorage.setItem(scrollKey,String(window.scrollY));}catch(e){}
    save();
  }));
  let savedScroll=0;
  try{savedScroll=Number(sessionStorage.getItem(scrollKey)||0);sessionStorage.removeItem(scrollKey);}catch(e){}
  if(savedScroll>0)requestAnimationFrame(()=>window.scrollTo(0,savedScroll));

  function answersText(){return ReviewAnswers.format(collect(),legacyAnswers);}
  previewBtn.addEventListener('click',()=>{
    const text=answersText();
    const empty=text===ReviewAnswers.format({});
    previewText.textContent=empty?'まだ回答が入力されていません。':text;
    previewCopy.disabled=empty;
    previewStatus.textContent='';
    document.body.classList.add('answers-preview-open');
    previewDialog.showModal();
    document.getElementById('backToAnswers').focus();
  });
  for(const id of ['closeAnswersPreview','backToAnswers']){
    document.getElementById(id).addEventListener('click',()=>previewDialog.close());
  }
  previewDialog.addEventListener('close',()=>{
    document.body.classList.remove('answers-preview-open');
    previewBtn.focus();
  });
  previewDialog.addEventListener('keydown',e=>{
    if(e.key!=='Tab')return;
    const controls=focusable(previewDialog);
    const edge=e.shiftKey?controls[0]:controls[controls.length-1];
    if(document.activeElement===edge){
      e.preventDefault();
      (e.shiftKey?controls[controls.length-1]:controls[0]).focus();
    }
  });
  async function copyAnswers(confirmationStatus){
    const text=answersText();
    let message;
    try{await navigator.clipboard.writeText(text);message='回答をコピーしました。メール本文に貼り付けられます。';}
    catch(e){
      const ta=document.createElement('textarea');ta.value=text;
      // The fallback must live inside the active modal so it can receive focus.
      (previewDialog.open?previewDialog:document.body).appendChild(ta);
      ta.select();
      try{message=document.execCommand('copy')?'回答をコピーしました。':'コピーできませんでした。確認画面の回答文を選択してメールへ貼り付けてください。';}
      catch(error){message='コピーできませんでした。確認画面の回答文を選択してメールへ貼り付けてください。';}
      ta.remove();
      if(previewDialog.open)previewCopy.focus();
    }
    status.textContent=message;
    if(confirmationStatus)confirmationStatus.textContent=message;
  }
  copyBtn.addEventListener('click',()=>copyAnswers());
  previewCopy.addEventListener('click',()=>copyAnswers(previewStatus));
  clearBtn.addEventListener('click',()=>{
    if(!confirm('入力した回答をすべてクリアしますか？'))return;
    form.reset();legacyAnswers={};renderLegacy();
    try{localStorage.removeItem(storageKey);localStorage.removeItem(oldStorageKey);}catch(e){}
    status.textContent='入力をクリアしました。';
  });
})();
