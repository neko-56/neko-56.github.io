(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory();
  else root.HistoricalFonts=factory();
})(typeof self!=="undefined"?self:this,function(){
  "use strict";

  function intValue(v,fallback){
    const n=parseInt(v,10);return Number.isFinite(n)?n:fallback;
  }

  function parseXLFD(name){
    if(!name || name[0]!=="-") return null;
    const parts=name.split("-");
    // Leading "-" creates parts[0] === "".
    if(parts.length < 15) return null;
    return {
      foundry:parts[1]||"",
      family:parts[2]||"",
      weight:parts[3]||"",
      slant:parts[4]||"",
      setwidth:parts[5]||"",
      addstyle:parts[6]||"",
      pixelSize:intValue(parts[7],0),
      pointSize:intValue(parts[8],0),
      resolutionX:intValue(parts[9],0),
      resolutionY:intValue(parts[10],0),
      spacing:parts[11]||"",
      averageWidth:intValue(parts[12],0),
      registry:parts[13]||"",
      encoding:parts[14]||""
    };
  }

  const DEC_TARGETS = {
    kek_vrt19_100dpi_little: {
      id:"kek_vrt19_100dpi_little",
      label:"DECterm Little Font — 100 dpi, 10 point (ULTRIX media-confirmed; 100dpi server branch)",
      xlfd:"-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1",
      expected:{
        foundry:"dec",family:"terminal",weight:"medium",slant:"r",setwidth:"normal",
        pixelSize:14,pointSize:100,resolutionX:100,resolutionY:100,
        spacing:"c",averageWidth:80,registry:"iso8859",encoding:"1"
      },
      cell:{w:8,h:15},
      baseline:12,
      expectedPCFSHA256:"46cdbd6f8656ddd7704df99f2103274c9ae9ffe1fc829ae57f92f6bb910d89d5",
      expectedBDFSHA256:"7cfc76e2e45ebfceb0e8d7fb1632e0710a550bac4dbe14e2ddf7c2bc94e84033",
      sourceSubset:"UDWFONT15430",
      confidence:"MEDIA-CONFIRMED GLYPH TARGET; RUNTIME SERVER BRANCH UNRESOLVED"
    },
    kek_75dpi_normal: {
      id:"kek_75dpi_normal",
      label:"DECterm Little Font — Xws branch default, 75 dpi, 14 point",
      xlfd:"-DEC-Terminal-Medium-R-Normal--14-140-75-75-C-80-ISO8859-1",
      expected:{
        foundry:"dec",family:"terminal",weight:"medium",slant:"r",setwidth:"normal",
        pixelSize:14,pointSize:140,resolutionX:75,resolutionY:75,
        spacing:"c",averageWidth:80,registry:"iso8859",encoding:"1"
      },
      cell:{w:8,h:15},
      baseline:12,
      sourceSubset:"UDWFONT430",
      confidence:"DOCUMENTED Xws-BRANCH DEFAULT; NOT A KEK-MACHINE DEFAULT; ULTRIX 4.3 75dpi PCF NOT YET DIRECTLY EXTRACTED"
    },
    kek_100dpi_big: {
      id:"kek_100dpi_big",
      label:"DECterm Big candidate — 100 dpi, 14 point",
      xlfd:"-Bitstream-Terminal-Medium-R-Normal--18-140-100-100-C-110-ISO8859-1",
      expected:{
        foundry:"bitstream",family:"terminal",weight:"medium",slant:"r",setwidth:"normal",
        pixelSize:18,pointSize:140,resolutionX:100,resolutionY:100,
        spacing:"c",averageWidth:110,registry:"iso8859",encoding:"1"
      },
      cell:{w:11,h:18},
      confidence:"BIG-FONT REFERENCE"
    }
  };

  const DEC_PUBLIC_ASSETS = {
    xconsortium_terminal_v22_verified: {
      id:"xconsortium_terminal_v22_verified",
      label:"DEC Terminal V2.2 — X Consortium licensed raster",
      url:"assets/fonts/dec-terminal/dec-terminal-xconsortium-verified.bdf",
      sha256:"b93ab33ead159d11a4e503ab71c72b7b51802a35de27d5a326ab4648f448f081",
      glyphCount:195,
      cell:{w:8,h:15},
      baseline:12,
      metadataTargetId:"kek_75dpi_normal",
      rasterEquivalentTargetId:"kek_vrt19_100dpi_little",
      rasterMatch:{matched:195,total:195,asciiMatched:95,asciiTotal:95},
      licensePath:"LICENSES/DEC-X-CONSORTIUM.txt",
      provenancePath:"docs/DEC_TERMINAL_PROVENANCE.md",
      publicSource:"https://sources.debian.org/src/xfonts-75dpi/1%3A1.0.3/font-bitstream-75dpi/term14.bdf/"
    }
  };

  function normalize(v){
    return String(v??"").trim().toLowerCase();
  }

  function compareXLFD(parsed,target){
    if(!parsed || !target) return {
      score:0,matched:0,total:0,status:"UNREADABLE",differences:["FONT property is not parseable as XLFD"]
    };
    const keys=[
      "foundry","family","weight","slant","setwidth","pixelSize","pointSize",
      "resolutionX","resolutionY","spacing","averageWidth","registry","encoding"
    ];
    let matched=0;
    const differences=[];
    for(const k of keys){
      const a=typeof target.expected[k]==="number" ? Number(parsed[k]) : normalize(parsed[k]);
      const b=typeof target.expected[k]==="number" ? Number(target.expected[k]) : normalize(target.expected[k]);
      if(a===b) matched++;
      else differences.push(`${k}: loaded=${parsed[k]} expected=${target.expected[k]}`);
    }
    const score=matched/keys.length;
    let status="MISMATCH";
    if(score===1) status="EXACT METADATA MATCH";
    else if(score>=0.83) status="NEAR MATCH";
    else if(score>=0.58) status="PARTIAL MATCH";
    return {score,matched,total:keys.length,status,differences};
  }

  function classifyDECtermFont(font){
    const parsed=parseXLFD(font.name);
    const comparisons=Object.values(DEC_TARGETS).map(t=>({
      target:t,
      result:compareXLFD(parsed,t)
    })).sort((a,b)=>b.result.score-a.result.score);
    return {
      parsed,
      best:comparisons[0]||null,
      all:comparisons
    };
  }

  class BDFGlyph{
    constructor(name){
      this.name=name;this.encoding=-1;this.dwidth=[0,0];
      this.bbx=[0,0,0,0];this.bitmap=[];
    }
  }

  class BDFFont{
    constructor(){
      this.kind="bdf";
      this.name="BDF";
      this.family="BDF bitmap";
      this.boundingBox=[0,0,0,0];
      this.ascent=0;this.descent=0;
      this.glyphs=new Map();
      this.properties={};
      this.cellWidth=0;this.cellHeight=0;this.baseline=0;
      this.sourceName="";
      this.fileSHA256="";
      this.byteLength=0;
      this.provenanceId="";
      this.metadataTargetId="";
      this.rasterEquivalentTargetId="";
      this.rasterMatch=null;
    }

    static parse(text,sourceName){
      const f=new BDFFont();
      f.sourceName=sourceName||"local .bdf";
      const lines=String(text).replace(/\r/g,"").split("\n");
      let glyph=null,inBitmap=false,inProps=false;

      for(const raw of lines){
        const line=raw.trimEnd();
        if(line.startsWith("FONT ")) f.name=line.slice(5).trim();
        else if(line.startsWith("FAMILY_NAME ")) f.family=line.slice(12).replace(/^"|"$/g,"").trim();
        else if(line.startsWith("FONTBOUNDINGBOX ")){
          const a=line.split(/\s+/).slice(1).map(Number);
          if(a.length>=4)f.boundingBox=a.slice(0,4);
        }else if(line==="STARTPROPERTIES"||line.startsWith("STARTPROPERTIES ")){
          inProps=true;
        }else if(line==="ENDPROPERTIES"){
          inProps=false;
        }else if(inProps){
          const m=line.match(/^([A-Z0-9_]+)\s+(.+)$/);
          if(m)f.properties[m[1]]=m[2].replace(/^"|"$/g,"");
        }else if(line.startsWith("STARTCHAR ")){
          glyph=new BDFGlyph(line.slice(10).trim());inBitmap=false;
        }else if(glyph&&line.startsWith("ENCODING ")){
          glyph.encoding=intValue(line.slice(9),-1);
        }else if(glyph&&line.startsWith("DWIDTH ")){
          const a=line.split(/\s+/).slice(1).map(Number);
          glyph.dwidth=[a[0]||0,a[1]||0];
        }else if(glyph&&line.startsWith("BBX ")){
          const a=line.split(/\s+/).slice(1).map(Number);
          glyph.bbx=[a[0]||0,a[1]||0,a[2]||0,a[3]||0];
        }else if(glyph&&line==="BITMAP"){
          inBitmap=true;glyph.bitmap=[];
        }else if(glyph&&line==="ENDCHAR"){
          if(glyph.encoding>=0)f.glyphs.set(glyph.encoding,glyph);
          glyph=null;inBitmap=false;
        }else if(glyph&&inBitmap&&/^[0-9A-Fa-f]+$/.test(line.trim())){
          glyph.bitmap.push(line.trim().toUpperCase());
        }
      }

      f.ascent=intValue(f.properties.FONT_ASCENT,0);
      f.descent=intValue(f.properties.FONT_DESCENT,0);
      if(!f.ascent&&!f.descent){
        const h=f.boundingBox[1]||0,y=f.boundingBox[3]||0;
        f.ascent=Math.max(0,h+y);
        f.descent=Math.max(0,-y);
      }
      const ascii=[...f.glyphs.entries()]
        .filter(([cp])=>cp>=32&&cp<=126)
        .map(([,g])=>g);
      f.cellWidth=Math.max(
        1,
        ...ascii.map(g=>g.dwidth[0]||g.bbx[0]||0),
        f.boundingBox[0]||0
      );
      f.cellHeight=Math.max(
        1,
        f.ascent+f.descent,
        f.boundingBox[1]||0
      );
      f.baseline=Math.max(
        1,
        f.ascent||Math.max(1,f.cellHeight+(f.boundingBox[3]||0))
      );
      return f;
    }

    glyphForChar(ch){
      const cp=ch.codePointAt(0);
      return this.glyphs.get(cp)||this.glyphs.get(63)||null;
    }

    drawChar(ctx,ch,x,baselineY,scale,foreground){
      const g=this.glyphForChar(ch);
      if(!g||ch===" ")return;
      scale=scale||1;
      const [w,h,xoff,yoff]=g.bbx;
      const top=baselineY-(h+yoff)*scale;
      const left=x+xoff*scale;

      ctx.save();
      ctx.shadowBlur=0;
      ctx.fillStyle=foreground;
      for(let row=0;row<Math.min(h,g.bitmap.length);row++){
        const hex=g.bitmap[row];
        const bits=hex.split("")
          .map(c=>parseInt(c,16).toString(2).padStart(4,"0"))
          .join("");
        for(let col=0;col<w;col++){
          if(bits[col]==="1"){
            ctx.fillRect(
              Math.round(left+col*scale),
              Math.round(top+row*scale),
              scale,scale
            );
          }
        }
      }
      ctx.restore();
    }

    summary(){
      const classified=classifyDECtermFont(this);
      const missingASCII=[];
      for(let cp=32;cp<=126;cp++){
        if(!this.glyphs.has(cp))missingASCII.push(cp);
      }
      return {
        kind:this.kind,
        source:this.sourceName,
        name:this.name,
        family:this.family,
        glyphCount:this.glyphs.size,
        cellWidth:this.cellWidth,
        cellHeight:this.cellHeight,
        ascent:this.ascent,
        descent:this.descent,
        baseline:this.baseline,
        sha256:this.fileSHA256||"",
        byteLength:this.byteLength||0,
        provenanceId:this.provenanceId||"",
        metadataTargetId:this.metadataTargetId||"",
        rasterEquivalentTargetId:this.rasterEquivalentTargetId||"",
        rasterMatch:this.rasterMatch||null,
        asciiComplete:missingASCII.length===0,
        missingASCII,
        xlfd:classified.parsed,
        decCandidate:classified.best ? {
          id:classified.best.target.id,
          label:classified.best.target.label,
          status:classified.best.result.status,
          score:classified.best.result.score,
          differences:classified.best.result.differences
        } : null
      };
    }
  }

  class CanvasFontBackend{
    constructor(family,sourceName){
      this.kind="canvas";
      this.family=family||'"Courier New",Courier,monospace';
      this.sourceName=sourceName||"profile fallback";
      this.fileSHA256="";
      this.byteLength=0;
    }
    summary(){
      return {
        kind:this.kind,
        family:this.family,
        source:this.sourceName,
        sha256:this.fileSHA256||"",
        byteLength:this.byteLength||0
      };
    }
  }

  async function sha256Hex(buffer){
    if(typeof crypto==="undefined"||!crypto.subtle)return "";
    const hash=await crypto.subtle.digest("SHA-256",buffer);
    return Array.from(new Uint8Array(hash))
      .map(b=>b.toString(16).padStart(2,"0"))
      .join("");
  }

  async function loadVectorFont(file,familyName){
    familyName=familyName||"UserHistoricalFont";
    const data=await file.arrayBuffer();
    const face=new FontFace(familyName,data);
    await face.load();
    document.fonts.add(face);
    const backend=new CanvasFontBackend('"'+familyName+'"',file.name);
    backend.fileSHA256=await sha256Hex(data);
    backend.byteLength=data.byteLength;
    return backend;
  }

  function applyKnownAssetProvenance(font){
    const hash=String(font.fileSHA256||"").toLowerCase();
    for(const asset of Object.values(DEC_PUBLIC_ASSETS)){
      if(hash!==asset.sha256.toLowerCase())continue;
      font.provenanceId=asset.id;
      font.metadataTargetId=asset.metadataTargetId||"";
      font.rasterEquivalentTargetId=asset.rasterEquivalentTargetId;
      font.rasterMatch=asset.rasterMatch;
      break;
    }
    return font;
  }

  async function loadBDFBytes(data,sourceName){
    const buffer=data instanceof ArrayBuffer ? data :
      data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);
    const text=new TextDecoder("utf-8").decode(buffer);
    const f=BDFFont.parse(text,sourceName||"BDF bitmap");
    f.fileSHA256=await sha256Hex(buffer);
    f.byteLength=buffer.byteLength;
    return applyKnownAssetProvenance(f);
  }

  async function loadBDF(file){
    return loadBDFBytes(await file.arrayBuffer(),file.name);
  }

  async function loadBDFURL(url,sourceName){
    const response=await fetch(url,{cache:"no-cache"});
    if(!response.ok)throw new Error(`BDF fetch failed: ${response.status} ${response.statusText}`);
    const data=await response.arrayBuffer();
    return loadBDFBytes(data,sourceName||url);
  }

  return {
    BDFFont,CanvasFontBackend,
    parseXLFD,compareXLFD,classifyDECtermFont,DEC_TARGETS,DEC_PUBLIC_ASSETS,
    loadVectorFont,loadBDF,loadBDFBytes,loadBDFURL,sha256Hex
  };
});