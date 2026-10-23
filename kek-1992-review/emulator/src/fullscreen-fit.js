(function(){
  "use strict";

  const panel=document.getElementById("displayPanel");
  const scroll=document.getElementById("displayScroll");
  const wrap=document.getElementById("monitorWrap");
  const shell=document.getElementById("monitorShell");
  if(!panel||!scroll||!wrap||!shell)return;

  function reset(){
    wrap.style.transform="";
    wrap.style.transformOrigin="";
    wrap.style.marginBottom="";
    scroll.style.height="";
    scroll.style.alignItems="";
  }

  function fit(){
    if(document.fullscreenElement!==panel){
      reset();
      return;
    }

    // app.js redraws on fullscreenchange. Wait until that redraw has restored
    // the profile's normal CSS pixel size, then scale the *whole physical monitor
    // assembly* (bezel + active area) as one object. This avoids the old state
    // where a 1280x1024 framebuffer was shown at 100% and only one bezel edge was
    // visible because the shell was larger than the browser viewport.
    requestAnimationFrame(function(){
      const panelStyle=getComputedStyle(panel);
      const px=(v)=>parseFloat(v)||0;
      const availableW=Math.max(1,panel.clientWidth
        -px(panelStyle.paddingLeft)-px(panelStyle.paddingRight)-24);
      const availableH=Math.max(1,panel.clientHeight
        -px(panelStyle.paddingTop)-px(panelStyle.paddingBottom)-24);

      // offsetWidth/offsetHeight are untransformed layout dimensions.
      const naturalW=Math.max(1,shell.offsetWidth);
      const naturalH=Math.max(1,shell.offsetHeight);
      const scale=Math.min(1,availableW/naturalW,availableH/naturalH);

      wrap.style.transform=`scale(${scale})`;
      wrap.style.transformOrigin="top center";
      // Transforms do not affect layout height, so compensate the unused layout
      // space to keep the fitted monitor visually centered and prevent scrolling.
      wrap.style.marginBottom=`${-(naturalH*(1-scale))}px`;
      scroll.style.height=availableH+"px";
      scroll.style.alignItems="flex-start";
    });
  }

  document.addEventListener("fullscreenchange",function(){
    // app.js redraws after 50 ms; run after it so our scale is final.
    setTimeout(fit,90);
  });
  window.addEventListener("resize",function(){
    if(document.fullscreenElement===panel)setTimeout(fit,30);
  });
})();
