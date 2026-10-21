(function(root){
  "use strict";

  class DisplayRenderer{
    constructor(canvas){
      this.canvas=canvas;
      this.ctx=canvas.getContext("2d",{alpha:false,desynchronized:false});
      this.profile=null;
      this.grid=false;
      this.fontBackend=null;
      this.presentationScale=1;
      this.screenMode="profile";
      this.logicalWidth=0;
      this.logicalHeight=0;
      this.glyphCache=new Map();
      this.uiTextCache=new Map();
    }

    setPresentationScale(scale){
      this.presentationScale=Math.max(1,Number(scale)||1);
      this._updateCSSSize();
    }

    setScreenMode(mode){
      this.screenMode=mode||"profile";
    }

    setProfile(profile){
      const changed=!this.profile||this.profile.id!==profile.id;
      this.profile=profile;
      this.logicalWidth=profile.framebufferWidth;
      this.logicalHeight=profile.framebufferHeight;

      // The canvas backing store IS the reconstructed framebuffer.
      // Do not multiply it by devicePixelRatio or presentation scale: that
      // would re-rasterize terminal pixels and reintroduce antialiasing.
      if(this.canvas.width!==this.logicalWidth)this.canvas.width=this.logicalWidth;
      if(this.canvas.height!==this.logicalHeight)this.canvas.height=this.logicalHeight;
      this.ctx.setTransform(1,0,0,1,0,0);
      this.ctx.imageSmoothingEnabled=false;
      this._updateCSSSize();
      if(changed){
        this.glyphCache.clear();
        this.uiTextCache.clear();
      }
    }

    _updateCSSSize(){
      if(!this.logicalWidth||!this.logicalHeight)return;
      const cssW=Math.round(this.logicalWidth*this.presentationScale);
      const cssH=Math.round(this.logicalHeight*this.presentationScale);
      this.canvas.style.width=cssW+"px";
      this.canvas.style.height=cssH+"px";
      this.canvas.style.aspectRatio=this.logicalWidth+" / "+this.logicalHeight;
      this.canvas.style.imageRendering="pixelated";
    }

    setGrid(enabled){this.grid=!!enabled;}
    setFontBackend(backend){
      if(this.fontBackend!==backend)this.glyphCache.clear();
      this.fontBackend=backend||null;
    }

    _palette(p){
      if(!p.alternateTerminalPalette){
        return {foreground:p.foreground,background:p.background,mode:"profile"};
      }
      const mode=this.screenMode==="profile"?(p.screenModeDefault||"light_on_dark"):this.screenMode;
      if(mode==="dark_on_light"){
        return {
          foreground:p.alternateTerminalPalette.foreground,
          background:p.alternateTerminalPalette.background,
          mode
        };
      }
      return {foreground:p.foreground,background:p.background,mode:"light_on_dark"};
    }

    _sharpFallbackGlyph(ch,family,cellW,cellH,baseline,fontPx,threshold){
      const key=[family,fontPx,cellW,cellH,baseline,threshold,ch].join("|");
      const cached=this.glyphCache.get(key);
      if(cached)return cached;

      const c=document.createElement("canvas");
      c.width=cellW;c.height=cellH;
      const g=c.getContext("2d",{alpha:true});
      g.clearRect(0,0,cellW,cellH);
      g.font=fontPx+"px "+family;
      g.textBaseline="alphabetic";
      g.textAlign="left";
      g.fillStyle="#fff";
      g.shadowBlur=0;
      const m=g.measureText(ch);
      const left=Number.isFinite(m.actualBoundingBoxLeft)?m.actualBoundingBoxLeft:0;
      const right=Number.isFinite(m.actualBoundingBoxRight)?m.actualBoundingBoxRight:m.width;
      const glyphW=Math.max(0,left+right);
      const originX=Math.round((cellW-glyphW)/2+left);
      g.fillText(ch,originX,Math.round(baseline));

      const src=g.getImageData(0,0,cellW,cellH).data;
      const pixels=[];
      for(let y=0;y<cellH;y++){
        for(let x=0;x<cellW;x++){
          if(src[(y*cellW+x)*4+3]>=threshold)pixels.push(x,y);
        }
      }
      this.glyphCache.set(key,pixels);
      return pixels;
    }

    _drawSharpFallbackChar(ctx,ch,x,top,family,cellW,cellH,baseline,fontPx,foreground,threshold){
      if(ch===" ")return;
      const pixels=this._sharpFallbackGlyph(
        ch,family,cellW,cellH,baseline,fontPx,threshold
      );
      ctx.fillStyle=foreground;
      for(let i=0;i<pixels.length;i+=2){
        ctx.fillRect(x+pixels[i],top+pixels[i+1],1,1);
      }
    }

    _uiTextBitmap(text,family,fontPx,weight,threshold){
      const key=["ui",text,family,fontPx,weight,threshold].join("|");
      const cached=this.uiTextCache.get(key);
      if(cached)return cached;

      const measure=document.createElement("canvas").getContext("2d",{alpha:true});
      measure.font=`${weight||"normal"} ${fontPx}px ${family}`;
      const width=Math.max(1,Math.ceil(measure.measureText(text).width)+4);
      const height=Math.max(1,Math.ceil(fontPx*1.45));
      const baseline=Math.max(1,Math.round(fontPx*1.08));
      const c=document.createElement("canvas");
      c.width=width;c.height=height;
      const g=c.getContext("2d",{alpha:true});
      g.clearRect(0,0,width,height);
      g.font=`${weight||"normal"} ${fontPx}px ${family}`;
      g.textBaseline="alphabetic";
      g.textAlign="left";
      g.fillStyle="#fff";
      g.shadowBlur=0;
      g.fillText(text,1,baseline);
      const src=g.getImageData(0,0,width,height).data;
      const pixels=[];
      for(let y=0;y<height;y++){
        for(let x=0;x<width;x++){
          if(src[(y*width+x)*4+3]>=threshold)pixels.push(x,y);
        }
      }
      const out={width,height,pixels};
      this.uiTextCache.set(key,out);
      return out;
    }

    _drawUIText(ctx,text,x,top,opts){
      const bitmap=this._uiTextBitmap(
        text,opts.family,opts.fontPx,opts.weight||"normal",opts.threshold||96
      );
      let left=Math.round(x);
      if(opts.align==="center")left-=Math.floor(bitmap.width/2);
      else if(opts.align==="right")left-=bitmap.width;
      ctx.fillStyle=opts.color;
      const y0=Math.round(top);
      for(let i=0;i<bitmap.pixels.length;i+=2){
        ctx.fillRect(left+bitmap.pixels[i],y0+bitmap.pixels[i+1],1,1);
      }
      return bitmap.width;
    }

    _bevelRect(ctx,x,y,w,h,colors,pressed){
      x=Math.round(x);y=Math.round(y);w=Math.round(w);h=Math.round(h);
      ctx.fillStyle=colors.surface;ctx.fillRect(x,y,w,h);
      const hi=pressed?colors.shadow:colors.highlight;
      const lo=pressed?colors.highlight:colors.shadow;
      ctx.fillStyle=hi;
      ctx.fillRect(x,y,w,1);ctx.fillRect(x,y,1,h);
      ctx.fillStyle=lo;
      ctx.fillRect(x,y+h-1,w,1);ctx.fillRect(x+w-1,y,1,h);
    }

    _drawDECWindowsChrome(ctx,p){
      const chrome=p.windowChrome;
      if(!chrome)return;
      const wr=chrome.rect,c=chrome.colors;
      const x=Math.round(wr.x),y=Math.round(wr.y),w=Math.round(wr.w),h=Math.round(wr.h);
      const outer=Math.max(1,Math.round(chrome.outerBorder||1));
      const inner=Math.max(1,Math.round(chrome.innerBorder||2));

      // dxwm documents a thin outer border and a thick inner border.
      ctx.fillStyle=c.highlight;ctx.fillRect(x,y,w,h);
      ctx.fillStyle=c.border;ctx.fillRect(x+outer,y+outer,w-outer*2,h-outer*2);
      ctx.fillStyle=c.surface;
      ctx.fillRect(x+outer+inner,y+outer+inner,w-(outer+inner)*2,h-(outer+inner)*2);

      const inset=outer+inner;
      const titleY=y+inset;
      const titleH=Math.round(chrome.titleBarHeight||22);
      const buttonW=titleH;
      const contentX=x+inset;
      const contentW=w-inset*2;

      this._bevelRect(ctx,contentX,titleY,buttonW,titleH,c,false);
      this._bevelRect(ctx,contentX+buttonW,titleY,contentW-buttonW*3,titleH,
        Object.assign({},c,{surface:c.activeTitle}),false);
      this._bevelRect(ctx,contentX+contentW-buttonW*2,titleY,buttonW,titleH,c,false);
      this._bevelRect(ctx,contentX+contentW-buttonW,titleY,buttonW,titleH,c,false);

      // Documented banner functions: shrink, title, push-to-back, resize.
      ctx.fillStyle=c.text;
      ctx.fillRect(contentX+6,titleY+7,buttonW-12,titleH-12);
      const backX=contentX+contentW-buttonW*2;
      ctx.strokeStyle=c.text;ctx.lineWidth=1;
      ctx.strokeRect(backX+6,titleY+6,buttonW-11,titleH-11);
      ctx.strokeRect(backX+8,titleY+8,buttonW-11,titleH-11);
      const resizeX=contentX+contentW-buttonW;
      ctx.fillRect(resizeX+6,titleY+titleH-8,buttonW-11,1);
      ctx.fillRect(resizeX+titleH-8,titleY+6,1,titleH-11);

      const family=chrome.uiFontFamily||"Helvetica, Arial, sans-serif";
      this._drawUIText(ctx,chrome.title||"DECterm",
        contentX+buttonW+(contentW-buttonW*3)/2,titleY+3,{
          family,fontPx:chrome.titleFontPx||12,weight:"bold",color:c.text,
          threshold:92,align:"center"
        });

      const menuY=titleY+titleH+2;
      const menuH=Math.round(chrome.menuBarHeight||20);
      this._bevelRect(ctx,contentX,menuY,contentW,menuH,c,false);
      let mx=contentX+8;
      for(const item of chrome.menuItems||[]){
        const tw=this._drawUIText(ctx,item,mx,menuY+3,{
          family,fontPx:chrome.uiFontPx||12,color:c.text,threshold:92,align:"left"
        });
        mx+=tw+12;
      }

      const r=p.terminalRect;
      // Client text plane border only; glyph pixels remain untouched inside it.
      ctx.fillStyle=c.shadow;
      ctx.fillRect(r.x-2,r.y-2,r.w+4,1);
      ctx.fillRect(r.x-2,r.y-2,1,r.h+4);
      ctx.fillStyle=c.highlight;
      ctx.fillRect(r.x-2,r.y+r.h+1,r.w+4,1);
      ctx.fillRect(r.x+r.w+1,r.y-2,1,r.h+4);

      if(p.verticalScrollbar){
        const sw=Math.round(chrome.scrollbarWidth||15);
        const sx=r.x+r.w+4,sy=r.y,sh=r.h;
        this._bevelRect(ctx,sx,sy,sw,sh,c,true);
        this._bevelRect(ctx,sx,sy,sw,sw,c,false);
        this._bevelRect(ctx,sx,sy+sh-sw,sw,sw,c,false);
        ctx.fillStyle=c.text;
        const mid=Math.floor(sx+sw/2);
        for(let i=0;i<4;i++)ctx.fillRect(mid-i,sy+5+i,i*2+1,1);
        for(let i=0;i<4;i++)ctx.fillRect(mid-i,sy+sh-6-i,i*2+1,1);
        const thumbY=sy+sw+Math.round((sh-sw*3)*0.15);
        this._bevelRect(ctx,sx+2,thumbY,sw-4,Math.max(22,Math.round(sh*.22)),c,false);
      }
    }

    draw(lines,visibleCells){
      const p=this.profile,ctx=this.ctx;
      if(!p)return;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.imageSmoothingEnabled=false;
      visibleCells=visibleCells==null?p.cols*p.rows:visibleCells;
      const palette=this._palette(p);

      // Historical framebuffer only. No photographic blur, glow, scanline
      // softening, CSS filtering, or research labels are painted here.
      ctx.save();
      ctx.shadowBlur=0;
      ctx.globalAlpha=1;
      ctx.fillStyle=p.windowChrome?(p.desktop||palette.background):palette.background;
      ctx.fillRect(0,0,this.logicalWidth,this.logicalHeight);
      if(p.windowChrome)this._drawDECWindowsChrome(ctx,p);

      const r=p.terminalRect;
      ctx.fillStyle=palette.background;
      ctx.fillRect(r.x,r.y,r.w,r.h);

      let cellW=Math.round(p.cell.w),cellH=Math.round(p.cell.h);
      let baseline=Math.round(p.baseline),bdfScale=1;

      if(this.fontBackend&&this.fontBackend.kind==="bdf"){
        const bf=this.fontBackend;
        // Historical bitmap pixels map 1:1 to the reconstructed framebuffer.
        bdfScale=1;
        cellW=Math.round(bf.cellWidth);
        cellH=Math.round(bf.cellHeight);
        baseline=Math.round(bf.baseline);
      }

      const gridW=p.cols*cellW;
      const gridH=p.rows*cellH;
      const tx=Math.round(r.x+(r.w-gridW)/2);
      const ty=Math.round(r.y+(r.h-gridH)/2);
      this.lastGeometry={
        cellW,cellH,baseline,bdfScale,gridW,gridH,tx,ty,
        terminalRect:{x:r.x,y:r.y,w:r.w,h:r.h},
        windowRect:p.windowChrome?Object.assign({},p.windowChrome.rect):null,
        screenMode:palette.mode
      };

      const isBDF=this.fontBackend&&this.fontBackend.kind==="bdf";
      const family=(this.fontBackend&&this.fontBackend.kind==="canvas")
        ?this.fontBackend.family:p.fontFamily;
      const threshold=Math.max(1,Math.min(254,p.fallbackRasterThreshold||96));

      let cellIndex=0;
      for(let row=0;row<p.rows;row++){
        const line=(lines[row]||"").slice(0,p.cols);
        const topY=ty+row*cellH;
        const baseY=topY+baseline;
        for(let col=0;col<line.length;col++){
          if(cellIndex>=visibleCells)break;
          const ch=line[col];
          const x=tx+col*cellW;
          if(isBDF){
            this.fontBackend.drawChar(ctx,ch,x,baseY,1,palette.foreground);
          }else{
            // Fallback is deliberately rasterized to hard 1-bit logical pixels.
            // It is a diagnostic stand-in, not a claim about the historical glyph.
            this._drawSharpFallbackChar(
              ctx,ch,x,topY,family,cellW,cellH,baseline,
              Math.round(p.fontPx),palette.foreground,threshold
            );
          }
          cellIndex++;
        }
      }

      const prompt=(lines[p.rows-1]||"");
      const promptStartCells=lines.slice(0,p.rows-1)
        .reduce((n,l)=>n+(l||"").length,0);

      if(visibleCells>=promptStartCells+prompt.length){
        const cursorCol=Math.min(p.cols-1,prompt.length);
        const cx=tx+cursorCol*cellW;
        const cy=ty+(p.rows-1)*cellH;
        ctx.fillStyle=palette.foreground;
        if(p.cursor==="underline"){
          ctx.fillRect(cx,cy+cellH-2,Math.max(2,Math.round(cellW*.82)),2);
        }else{
          ctx.fillRect(cx,cy+1,Math.max(2,Math.round(cellW*.82)),Math.max(2,cellH-2));
        }
      }

      if(this.grid){
        ctx.save();
        ctx.globalAlpha=.28;
        ctx.strokeStyle="#b8862d";
        ctx.lineWidth=1;
        for(let c=0;c<=p.cols;c++){
          const x=tx+c*cellW+.5;
          ctx.beginPath();ctx.moveTo(x,ty);ctx.lineTo(x,ty+p.rows*cellH);ctx.stroke();
        }
        for(let rr=0;rr<=p.rows;rr++){
          const y=ty+rr*cellH+.5;
          ctx.beginPath();ctx.moveTo(tx,y);ctx.lineTo(tx+p.cols*cellW,y);ctx.stroke();
        }
        ctx.restore();
      }

      ctx.restore();
    }
  }

  root.DisplayRenderer=DisplayRenderer;
})(typeof self!=="undefined"?self:this);
