(function(root){
  "use strict";

  function drawScanlines(ctx,x,y,w,h,alpha){
    if(!alpha)return;
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle="#000";
    for(let yy=y;yy<y+h;yy+=3)ctx.fillRect(x,yy,w,1);
    ctx.restore();
  }

  class DisplayRenderer{
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext("2d",{alpha:false});
      this.profile=null;this.grid=false;this.fontBackend=null;
    }
    setProfile(profile){
      this.profile=profile;
      if(this.canvas.width!==profile.framebufferWidth)this.canvas.width=profile.framebufferWidth;
      if(this.canvas.height!==profile.framebufferHeight)this.canvas.height=profile.framebufferHeight;
      this.canvas.style.aspectRatio=profile.framebufferWidth+" / "+profile.framebufferHeight;
    }
    setGrid(enabled){this.grid=!!enabled;}
    setFontBackend(backend){this.fontBackend=backend||null;}

    draw(lines,visibleCells){
      const p=this.profile,ctx=this.ctx;if(!p)return;
      visibleCells=visibleCells==null?p.cols*p.rows:visibleCells;
      ctx.save();ctx.fillStyle=p.desktop;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      if(p.id.startsWith("kek_decterm"))this.drawDECDesktop(ctx,p);else this.drawCERNDisplay(ctx,p);

      const r=p.terminalRect,titleOffset=p.id.startsWith("kek_decterm")?34:0;
      const scrollOffset=p.verticalScrollbar?18:0;
      let cellW=p.cell.w,cellH=p.cell.h,baseline=p.baseline,bdfScale=1;

      if(this.fontBackend&&this.fontBackend.kind==="bdf"){
        const bf=this.fontBackend;
        const availW=r.w-36-scrollOffset,availH=r.h-titleOffset-28;
        const maxScale=Math.max(1,Math.floor(Math.min(
          availW/(p.cols*bf.cellWidth),availH/(p.rows*bf.cellHeight)
        )));
        // Native integer-pixel scaling only: no fractional resampling of bitmap glyphs.
        bdfScale=maxScale;
        cellW=bf.cellWidth*bdfScale;cellH=bf.cellHeight*bdfScale;baseline=bf.baseline*bdfScale;
      }

      const gridW=p.cols*cellW,gridH=p.rows*cellH;
      const tx=r.x+18,ty=r.y+titleOffset+16;
      const tw=Math.min(r.w-36-scrollOffset,gridW),th=Math.min(r.h-titleOffset-28,gridH);
      ctx.fillStyle=p.background;ctx.fillRect(tx-10,ty-14,tw+20,th+18);

      const isBDF=this.fontBackend&&this.fontBackend.kind==="bdf";
      const family=(this.fontBackend&&this.fontBackend.kind==="canvas")?this.fontBackend.family:p.fontFamily;
      if(!isBDF){
        ctx.font=p.fontPx+"px "+family;ctx.textBaseline="alphabetic";ctx.fillStyle=p.foreground;
        if(p.phosphorGlow){ctx.shadowColor=p.foreground;ctx.shadowBlur=3.2;}
      }

      let cellIndex=0;
      for(let row=0;row<p.rows;row++){
        const line=(lines[row]||"").slice(0,p.cols);
        const baseY=ty+row*cellH+baseline;
        for(let col=0;col<line.length;col++){
          if(cellIndex>=visibleCells)break;
          const ch=line[col],x=tx+col*cellW;
          if(isBDF)this.fontBackend.drawChar(ctx,ch,x,baseY,bdfScale,p.foreground);
          else ctx.fillText(ch,x,baseY);
          cellIndex++;
        }
      }
      ctx.shadowBlur=0;

      const prompt=(lines[p.rows-1]||"");
      const promptStartCells=lines.slice(0,p.rows-1).reduce((n,l)=>n+(l||"").length,0);
      if(visibleCells>=promptStartCells+prompt.length){
        const cursorCol=Math.min(p.cols-1,prompt.length),cx=tx+cursorCol*cellW,cy=ty+(p.rows-1)*cellH;
        ctx.globalAlpha=.86;ctx.fillStyle=p.foreground;
        if(p.cursor==="underline")ctx.fillRect(cx,cy+cellH-3,Math.max(2,cellW*.82),2);
        else ctx.fillRect(cx,cy+2,Math.max(2,cellW*.82),Math.max(2,cellH-4));
        ctx.globalAlpha=1;
      }

      if(this.grid){
        ctx.save();ctx.globalAlpha=.12;ctx.strokeStyle="#ffcc66";ctx.lineWidth=.5;
        for(let c=0;c<=p.cols;c++){const x=tx+c*cellW;ctx.beginPath();ctx.moveTo(x,ty);ctx.lineTo(x,ty+p.rows*cellH);ctx.stroke();}
        for(let rr=0;rr<=p.rows;rr++){const y=ty+rr*cellH;ctx.beginPath();ctx.moveTo(tx,y);ctx.lineTo(tx+p.cols*cellW,y);ctx.stroke();}
        ctx.restore();
      }
      drawScanlines(ctx,tx-10,ty-14,tw+20,th+18,p.scanlineAlpha);
      if(p.crtVignette){
        const g=ctx.createRadialGradient(this.canvas.width/2,this.canvas.height/2,this.canvas.height*.10,this.canvas.width/2,this.canvas.height/2,this.canvas.height*.72);
        g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(.78,"rgba(0,0,0,.025)");g.addColorStop(1,"rgba(0,0,0,.26)");
        ctx.fillStyle=g;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      }
      ctx.restore();
    }

    drawCERNDisplay(ctx,p){
      const r=p.terminalRect;
      ctx.fillStyle="#3f433f";ctx.fillRect(r.x-28,r.y-42,r.w+56,r.h+84);
      ctx.strokeStyle="#686d67";ctx.lineWidth=2;ctx.strokeRect(r.x-28,r.y-42,r.w+56,r.h+84);
      ctx.fillStyle="#c8cdc8";ctx.font="12px -apple-system,BlinkMacSystemFont,sans-serif";
      const label=p.id==="cern_rs6000_reference"?"IBM RISC System/6000 reference · original LMB observed in 2013":
        p.id==="cern_3270_alternate"?"IBM 3270-class alternate hypothesis":"CERN terminal room · hardware not identified";
      ctx.fillText(label,r.x-12,r.y-16);
    }

    drawDECDesktop(ctx,p){
      ctx.fillStyle=p.desktop;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
      ctx.fillStyle="#d7d8d1";ctx.fillRect(0,0,this.canvas.width,30);ctx.strokeStyle="#555b56";ctx.strokeRect(0,0,this.canvas.width,30);
      ctx.fillStyle="#111";ctx.font="14px Helvetica,Arial,sans-serif";ctx.fillText("DECwindows",12,20);ctx.fillText("kekux.kek.jp",this.canvas.width-130,20);
      const r=p.terminalRect;
      ctx.fillStyle="#bfc2bb";ctx.fillRect(r.x-4,r.y-4,r.w+8,r.h+8);ctx.strokeStyle="#343a35";ctx.lineWidth=2;ctx.strokeRect(r.x-4,r.y-4,r.w+8,r.h+8);
      ctx.fillStyle=p.titlebar;ctx.fillRect(r.x,r.y,r.w,32);ctx.strokeStyle="#535853";ctx.strokeRect(r.x,r.y,r.w,32);
      ctx.fillStyle="#111";ctx.font="13px Helvetica,Arial,sans-serif";ctx.fillText("DECterm — kekux.kek.jp",r.x+16,r.y+21);
      if(p.verticalScrollbar){
        const sx=r.x+r.w-17,sy=r.y+33,sh=r.h-34;
        ctx.fillStyle="#b9bbb5";ctx.fillRect(sx,sy,16,sh);ctx.strokeStyle="#5a5d58";ctx.strokeRect(sx,sy,16,sh);
        ctx.fillStyle="#d7d8d1";ctx.fillRect(sx+2,sy+2,12,16);ctx.fillRect(sx+2,sy+sh-18,12,16);
        ctx.fillStyle="#8b8e88";ctx.fillRect(sx+3,sy+24,10,Math.max(24,sh*.30));
      }
    }
  }
  root.DisplayRenderer=DisplayRenderer;
})(typeof self!=="undefined"?self:this);