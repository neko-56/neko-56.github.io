(function(){
  "use strict";
  for(const box of document.querySelectorAll("[data-candidate-switcher]")){
    const buttons=[...box.querySelectorAll("[data-candidate]")];
    const frame=box.querySelector("[data-candidate-frame]");
    const external=box.querySelector("[data-candidate-external]");
    const title=box.querySelector("[data-candidate-title]");
    const note=box.querySelector("[data-candidate-note]");
    const source=box.querySelector("[data-candidate-source]");
    const extLink=box.querySelector("[data-candidate-external-link]");
    const extText=box.querySelector("[data-candidate-external-text]");

    function activate(btn, focus){
      buttons.forEach(b=>{
        const active=b===btn;
        b.classList.toggle("is-active",active);
        b.setAttribute("aria-selected",active?"true":"false");
        b.tabIndex=active?0:-1;
      });
      if(title)title.textContent=btn.dataset.title||btn.textContent.trim();
      if(note)note.textContent=btn.dataset.note||"";
      if(source){
        const url=btn.dataset.sourceUrl||"";
        if(url){
          source.hidden=false;
          source.href=url;
          source.textContent=btn.dataset.sourceLabel||"根拠資料を開く ↗";
        }else{
          source.hidden=true;
          source.removeAttribute("href");
        }
      }

      if(btn.dataset.kind==="external"){
        if(frame)frame.hidden=true;
        if(external)external.hidden=false;
        if(extLink){
          extLink.href=btn.dataset.url||"#";
          extLink.textContent=btn.dataset.linkLabel||"公式復元を開く ↗";
        }
        if(extText)extText.textContent=btn.dataset.externalText||"";
      }else{
        if(external)external.hidden=true;
        if(frame){
          frame.hidden=false;
          const src=btn.dataset.src;
          if(src && frame.getAttribute("src")!==src)frame.setAttribute("src",src);
          frame.setAttribute("title",(btn.dataset.title||btn.textContent.trim())+" 表示復元");
        }
      }
      if(focus)btn.focus();
    }

    buttons.forEach((btn,i)=>{
      btn.addEventListener("click",()=>activate(btn,false));
      btn.addEventListener("keydown",e=>{
        if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
        e.preventDefault();
        let j=i;
        if(e.key==="ArrowLeft")j=(i-1+buttons.length)%buttons.length;
        if(e.key==="ArrowRight")j=(i+1)%buttons.length;
        if(e.key==="Home")j=0;
        if(e.key==="End")j=buttons.length-1;
        activate(buttons[j],true);
      });
    });
    const initial=buttons.find(b=>b.classList.contains("is-active"))||buttons[0];
    if(initial)activate(initial,false);
  }
})();
