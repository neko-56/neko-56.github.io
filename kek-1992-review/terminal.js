
(function(){
  const typed=document.getElementById("typed");
  const base=document.getElementById("base");
  if(!typed||!base) return;
  let buffer="";
  const targets={
    "2":"https://info.cern.ch/hypertext/WWW/TheProject.html",
    "3":"https://info.cern.ch/hypertext/DataSources/bySubject/Physics/HEP.html",
    "6":"https://info.cern.ch/hypertext/DataSources/ByAccess.html",
    "7":"https://info.cern.ch/hypertext/DataSources/bySubject/Overview.html"
  };
  function render(){typed.textContent=buffer?(" "+buffer):"";}
  function resetLater(){
    setTimeout(()=>{base.textContent="1-7, Quit, or Help:";buffer="";render();},1800);
  }
  function message(s){base.textContent=s;buffer="";render();resetLater();}
  function submit(){
    const cmd=buffer.trim().toLowerCase();
    if(!cmd)return;
    if(cmd==="help"||cmd==="h"){ location.href="original-source.html"; return; }
    if(cmd==="quit"||cmd==="q"){ message("Quit requested. Browser exit is not emulated."); return; }
    if(/^[1-7]$/.test(cmd)){
      if(targets[cmd]){ location.href=targets[cmd]; return; }
      const labels={"1":"LineMode/QuickGuide.html","4":"kiwi.html","5":"Root.html"};
      message("Historical target not yet restored: "+labels[cmd]);
      return;
    }
    message("Command not recognized.");
  }
  document.addEventListener("keydown",e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(e.key==="Enter"){e.preventDefault();submit();return;}
    if(e.key==="Backspace"){e.preventDefault();buffer=buffer.slice(0,-1);render();return;}
    if(e.key==="Escape"){e.preventDefault();buffer="";render();return;}
    if(/^[0-9a-zA-Z]$/.test(e.key)&&buffer.length<12){e.preventDefault();buffer+=e.key;render();}
  });
})();
