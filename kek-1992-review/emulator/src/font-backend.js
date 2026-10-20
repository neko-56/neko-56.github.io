(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory();
  else root.HistoricalFonts=factory();
})(typeof self!=="undefined"?self:this,function(){
  "use strict";

  function intValue(v, fallback){
    const n=parseInt(v,10); return Number.isFinite(n)?n:fallback;
  }

  class BDFGlyph {
    constructor(name){
      this.name=name; this.encoding=-1; this.dwidth=[0,0]; this.bbx=[0,0,0,0]; this.bitmap=[];
    }
  }

  class BDFFont {
    constructor(){
      this.kind="bdf";
      this.name="BDF";
      this.family="BDF bitmap";
      this.boundingBox=[0,0,0,0];
      this.ascent=0; this.descent=0;
      this.glyphs=new Map();
      this.properties={};
      this.cellWidth=0; this.cellHeight=0; this.baseline=0;
      this.sourceName="";
    }

    static parse(text, sourceName){
      const f=new BDFFont();
      f.sourceName=sourceName||"local .bdf";
      const lines=String(text).replace(/\r/g,"").split("\n");
      let glyph=null, inBitmap=false, inProps=false;

      for(const raw of lines){
        const line=raw.trimEnd();
        if(line.startsWith("FONT ")) f.name=line.slice(5).trim();
        else if(line.startsWith("FAMILY_NAME ")) f.family=line.slice(12).replace(/^"|"$/g,"").trim();
        else if(line.startsWith("FONTBOUNDINGBOX ")){
          const a=line.split(/\s+/).slice(1).map(Number); if(a.length>=4) f.boundingBox=a.slice(0,4);
        } else if(line==="STARTPROPERTIES" || line.startsWith("STARTPROPERTIES ")){ inProps=true; }
        else if(line==="ENDPROPERTIES"){ inProps=false; }
        else if(inProps){
          const m=line.match(/^([A-Z0-9_]+)\s+(.+)$/);
          if(m) f.properties[m[1]]=m[2].replace(/^"|"$/g,"");
        } else if(line.startsWith("STARTCHAR ")){
          glyph=new BDFGlyph(line.slice(10).trim()); inBitmap=false;
        } else if(glyph && line.startsWith("ENCODING ")){
          glyph.encoding=intValue(line.slice(9),-1);
        } else if(glyph && line.startsWith("DWIDTH ")){
          const a=line.split(/\s+/).slice(1).map(Number); glyph.dwidth=[a[0]||0,a[1]||0];
        } else if(glyph && line.startsWith("BBX ")){
          const a=line.split(/\s+/).slice(1).map(Number); glyph.bbx=[a[0]||0,a[1]||0,a[2]||0,a[3]||0];
        } else if(glyph && line==="BITMAP"){
          inBitmap=true; glyph.bitmap=[];
        } else if(glyph && line==="ENDCHAR"){
          if(glyph.encoding>=0) f.glyphs.set(glyph.encoding,glyph);
          glyph=null; inBitmap=false;
        } else if(glyph && inBitmap && /^[0-9A-Fa-f]+$/.test(line.trim())){
          glyph.bitmap.push(line.trim().toUpperCase());
        }
      }

      f.ascent=intValue(f.properties.FONT_ASCENT,0);
      f.descent=intValue(f.properties.FONT_DESCENT,0);
      if(!f.ascent && !f.descent){
        const h=f.boundingBox[1]||0, y=f.boundingBox[3]||0;
        f.ascent=Math.max(0,h+y); f.descent=Math.max(0,-y);
      }
      const ascii=[...f.glyphs.entries()].filter(([cp])=>cp>=32&&cp<=126).map(([,g])=>g);
      f.cellWidth=Math.max(1,...ascii.map(g=>g.dwidth[0]||g.bbx[0]||0),f.boundingBox[0]||0);
      f.cellHeight=Math.max(1,f.ascent+f.descent,f.boundingBox[1]||0);
      f.baseline=Math.max(1,f.ascent||Math.max(1,f.cellHeight+(f.boundingBox[3]||0)));
      return f;
    }

    glyphForChar(ch){
      const cp=ch.codePointAt(0);
      return this.glyphs.get(cp)||this.glyphs.get(63)||null;
    }

    drawChar(ctx,ch,x,baselineY,scale,foreground){
      const g=this.glyphForChar(ch);
      if(!g || ch===" ") return;
      scale=scale||1;
      const [w,h,xoff,yoff]=g.bbx;
      const top=baselineY-(h+yoff)*scale;
      const left=x+xoff*scale;
      ctx.save();
      ctx.shadowBlur=0;
      ctx.fillStyle=foreground;
      for(let row=0;row<Math.min(h,g.bitmap.length);row++){
        const hex=g.bitmap[row];
        const bits=hex.split("").map(c=>parseInt(c,16).toString(2).padStart(4,"0")).join("");
        for(let col=0;col<w;col++){
          if(bits[col]==="1") ctx.fillRect(left+col*scale,top+row*scale,scale,scale);
        }
      }
      ctx.restore();
    }

    summary(){
      return {
        kind:this.kind, source:this.sourceName, name:this.name, family:this.family,
        glyphCount:this.glyphs.size, cellWidth:this.cellWidth, cellHeight:this.cellHeight,
        ascent:this.ascent, descent:this.descent
      };
    }
  }

  class CanvasFontBackend {
    constructor(family, sourceName){
      this.kind="canvas";
      this.family=family||'"Courier New",Courier,monospace';
      this.sourceName=sourceName||"profile fallback";
    }
    summary(){ return {kind:this.kind,family:this.family,source:this.sourceName}; }
  }

  async function loadVectorFont(file, familyName){
    familyName=familyName||"UserHistoricalFont";
    const data=await file.arrayBuffer();
    const face=new FontFace(familyName,data);
    await face.load();
    document.fonts.add(face);
    return new CanvasFontBackend('"'+familyName+'"',file.name);
  }

  async function loadBDF(file){
    const text=await file.text();
    return BDFFont.parse(text,file.name);
  }

  return {BDFFont,CanvasFontBackend,loadVectorFont,loadBDF};
});