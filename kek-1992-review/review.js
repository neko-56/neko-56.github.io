(function(){
  'use strict';
  const form=document.getElementById('moritaSurvey');
  const pane=document.getElementById('materialPane');
  const title=document.getElementById('viewerTitle');
  const body=document.getElementById('viewerBody');
  const note=document.getElementById('viewerNote');
  const close=document.getElementById('closeViewer');
  const copyBtn=document.getElementById('copyAnswers');
  const clearBtn=document.getElementById('clearAnswers');
  const status=document.getElementById('copyStatus');
  const storageKey='kek1992-morita-review-v043';
  const scrollKey='kek1992-morita-review-scroll-v043';

  function escapeHtml(s){return String(s||'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}

  function showViewer(el){
    const kind=el.dataset.viewer;
    const src=el.dataset.src||'';
    title.textContent=el.dataset.title||'参考資料';
    note.textContent=el.dataset.note||'';
    if(kind==='image'){
      body.innerHTML='<div class="viewer-image-wrap"><img src="'+escapeHtml(src)+'" alt=""></div>';
    }else if(kind==='emulator'){
      body.innerHTML='<iframe class="viewer-emulator" src="'+escapeHtml(src)+'" title="'+escapeHtml(el.dataset.title||'表示候補')+'"></iframe>';
    }else if(kind==='link'){
      body.innerHTML='<div class="viewer-link-card"><p>'+escapeHtml(el.dataset.note||'関連資料です。')+'</p><a href="'+escapeHtml(src)+'" target="_blank" rel="noopener noreferrer">資料を別タブで開く ↗</a></div>';
      note.textContent='';
    }
    pane.classList.add('has-content');
    if(window.matchMedia('(max-width: 980px)').matches){
      pane.classList.add('mobile-open');
    }
  }

  document.querySelectorAll('[data-viewer]').forEach(el=>el.addEventListener('click',()=>showViewer(el)));
  close.addEventListener('click',()=>{
    pane.classList.remove('mobile-open','has-content');
    title.textContent='ここに資料を表示します';
    body.innerHTML='<div class="viewer-placeholder"><p>左側の候補画像や再現画面をクリックすると、ここで大きく確認できます。</p><p>質問と回答欄は左側に残るので、そのまま続けて回答できます。</p></div>';
    note.textContent='';
  });

  function save(){
    const data={};
    [...form.elements].forEach(el=>{
      if(!el.name)return;
      if(el.type==='radio'){
        if(el.checked)data[el.name]=el.value;
      }else if(el.type!=='button')data[el.name]=el.value;
    });
    localStorage.setItem(storageKey,JSON.stringify(data));
  }
  function restore(){
    let data={};
    try{data=JSON.parse(localStorage.getItem(storageKey)||'{}');}catch(e){}
    Object.entries(data).forEach(([name,value])=>{
      const els=form.elements[name];
      if(!els)return;
      const list=els.length!==undefined && !els.tagName ? [...els] : [els];
      list.forEach(el=>{
        if(el.type==='radio')el.checked=el.value===value;
        else el.value=value;
      });
    });
  }
  form.addEventListener('input',save);
  form.addEventListener('change',save);
  restore();

  document.querySelectorAll('.primary-tabs a').forEach(a=>a.addEventListener('click',()=>{
    sessionStorage.setItem(scrollKey,String(window.scrollY));
    save();
  }));
  const savedScroll=Number(sessionStorage.getItem(scrollKey)||0);
  if(savedScroll>0){requestAnimationFrame(()=>window.scrollTo(0,savedScroll));sessionStorage.removeItem(scrollKey);}

  const labels={
    cern_terminal:'CERNで使用した端末',
    cern_terminal_note:'端末についての補足',
    html_learning:'HTMLの書き方を知った方法',
    html_learning_note:'HTML作成についての補足',
    green_origin:'薄緑色の再現画像の由来',
    green_origin_note:'薄緑色画面についての補足',
    cern_check_method:'CERNでの内容確認方法',
    cern_display_candidate:'CERN側で近い表示候補',
    cern_check_note:'CERNでの表示・確認についての補足',
    kek_check_method:'KEKUXでの内容確認方法',
    kek_display_candidate:'KEKUX側で近い表示候補',
    kek_check_note:'KEKUXでの表示・確認についての補足',
    other_note:'その他、当時について'
  };
  function answersText(){
    const data={};
    [...form.elements].forEach(el=>{
      if(!el.name)return;
      if(el.type==='radio'){
        if(el.checked)data[el.name]=el.value;
      }else if(el.type!=='button' && String(el.value||'').trim())data[el.name]=String(el.value).trim();
    });
    const out=['1992年 KEK WWW 表示環境について — 回答'];
    Object.keys(labels).forEach(k=>{if(data[k])out.push('', '【'+labels[k]+'】', data[k]);});
    return out.join('\n');
  }
  copyBtn.addEventListener('click',async()=>{
    const text=answersText();
    try{await navigator.clipboard.writeText(text);status.textContent='回答をコピーしました。メール本文に貼り付けられます。';}
    catch(e){
      const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();status.textContent='回答をコピーしました。';
    }
  });
  clearBtn.addEventListener('click',()=>{
    if(!confirm('入力した回答をすべてクリアしますか？'))return;
    form.reset();localStorage.removeItem(storageKey);status.textContent='入力をクリアしました。';
  });
})();
