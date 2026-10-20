
(function(){
  const themes=["green","white","decwindows","amber","kek"];
  const saved=localStorage.getItem("neko56-display-theme");
  if(themes.includes(saved)) document.documentElement.dataset.theme=saved;

  window.NEKO56_THEME_LABELS={
    green:"Green phosphor",white:"White phosphor",decwindows:"DECwindows",
    amber:"Amber plasma",kek:"KEK reconstruction"
  };

  window.NEKO56_APPLY_THEME=function(theme){
    if(!window.NEKO56_THEME_LABELS[theme]) return;
    document.documentElement.dataset.theme=theme;
    localStorage.setItem("neko56-display-theme",theme);
    const out=document.getElementById("current-theme");
    if(out) out.textContent=window.NEKO56_THEME_LABELS[theme];
  };

  document.addEventListener("DOMContentLoaded",function(){
    const current=document.documentElement.dataset.theme||"green";
    const out=document.getElementById("current-theme");
    if(out) out.textContent=window.NEKO56_THEME_LABELS[current]||current;
    document.querySelectorAll("[data-theme-choice]").forEach(function(b){
      b.addEventListener("click",()=>window.NEKO56_APPLY_THEME(b.dataset.themeChoice));
    });

    const cfg=window.NEKO56_CONFIG||{};
    const code=(cfg.goatcounterCode||"").trim();
    if(code){
      const s=document.createElement("script");
      s.async=true;
      s.src="https://gc.zgo.at/count.js";
      s.dataset.goatcounter="https://"+code+".goatcounter.com/count";
      document.head.appendChild(s);
    }
  });
})();
