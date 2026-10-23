(function(root,factory){
  if(typeof module==="object"&&module.exports) module.exports=factory();
  else root.HistoricalFonts=factory();
})(typeof self!=="undefined"?self:this,function(){
  "use strict";

  function intValue(v,fallback){
    const n=parseInt(v,10);return Number.isFinite(n)?n:fallback;
  }

  const ASCII_GLYPH_NAMES = {
    " ":"space","!":"exclam","\"":"quotedbl","#":"numbersign","$":"dollar",
    "%":"percent","&":"ampersand","'":"apostrophe","(":"parenleft",")":"parenright",
    "*":"asterisk","+":"plus",",":"comma","-":"hyphen",".":"period","/":"slash",
    ":":"colon",";":"semicolon","<":"less","=":"equal",">":"greater","?":"question",
    "@":"at","[":"bracketleft","\\":"backslash","]":"bracketright","^":"asciicircum",
    "_":"underscore","`":"grave","{":"braceleft","|":"bar","}":"braceright","~":"asciitilde"
  };

  function bdfGlyphNameForASCII(ch){
    if(/^[A-Za-z0-9]$/.test(ch))return ch;
    return ASCII_GLYPH_NAMES[ch]||null;
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
      kind:"bdf",
      label:"DEC Terminal V2.2 — X Consortium licensed raster",
      url:"assets/fonts/dec/term14.bdf",
      sha256:"d9daba2437558c3a75bfba33b8fb21a78063e4f42bede5d61a53c9a4d5887ae7",
      glyphCount:195,
      cell:{w:8,h:15},
      baseline:12,
      metadataTargetId:"kek_75dpi_normal",
      rasterEquivalentTargetId:"kek_vrt19_100dpi_little",
      rasterMatch:{matched:195,total:195,asciiMatched:95,asciiTotal:95},
      licensePath:"LICENSES/DEC-X-CONSORTIUM.txt",
      provenancePath:"docs/DEC_TERMINAL_PROVENANCE.md",
      publicSource:"Debian Sources xfonts-75dpi 1:1.0.0-4 / font-bitstream-75dpi-X11R7.0-1.0.0/term14.bdf",
      licenseName:"DEC / X Consortium permissive grant",
      evidence:"Public term14.bdf raster verified 195/195 against the ULTRIX 4.3 terminal10 target."
    }
  };

  const PUBLIC_FONT_ASSETS = Object.assign({}, DEC_PUBLIC_ASSETS, {
    meyrin_cern_rs6000: {
      id:"meyrin_cern_rs6000",
      kind:"vector",
      label:"Meyrin — CERN IBM RISC System/6000 reconstruction",
      familyName:"MeyrinRuntime",
      url:"assets/fonts/meyrin/Meyrin.woff",
      sha256:"a669b20af5d7c00eac496012cda61150b39a5b7fb6cb16f0c6a8383504d94cc1",
      publicSource:"https://github.com/optional-is/Meyrin",
      licenseName:"SIL Open Font License 1.1",
      licensePath:"assets/fonts/meyrin/License.md",
      evidence:"2013 CERN Hackday reconstruction made from photographed IBM System/6000 terminal glyphs; source describes a 9×14 glyph grid."
    },
    x11_fixed_6x13: {
      id:"x11_fixed_6x13",
      kind:"bdf",
      label:"X11 fixed — misc 6×13 bitmap",
      url:"assets/fonts/x11/6x13.bdf",
      sha256:"c68c55ca8effcdc2714fffa9c8e07df290411867b00b547eeae952f7473efc9b",
      glyphCount:4121,
      cell:{w:6,h:13},
      baseline:11,
      publicSource:"https://sources.debian.org/src/xfonts-base/1%3A1.0.5%2Bnmu1/font-misc-misc/6x13.bdf/",
      licenseName:"Public-domain font (embedded BDF COPYRIGHT property)",
      licensePath:"LICENSES/X11-FIXED-6X13-PUBLIC-DOMAIN.txt",
      evidence:"The X11 sample implementation includes the fixed bitmap family; 6×13 is the canonical fixed-family cell used as the standard X11 comparison."
    },
    x3270_3270_14: {
      id:"x3270_3270_14",
      kind:"bdf",
      label:"x3270 3270 — 14-point IBM 3270 bitmap",
      url:"assets/fonts/ibm3270/3270.bdf",
      sourceVersion:"x3270 4.1ga10 (2021-10-31 release)",
      sha256:"3d71ea77ade51a7d2d6de326bd98fd14724b0e0086ecc0bd2d5083483d34838b",
      glyphCount:431,
      cell:{w:9,h:14},
      baseline:11,
      expectedCharsetRegistry:"3270cg",
      expectedCharsetEncoding:"1a",
      licenseName:"x3270 / GTRC permissive 3-clause redistribution grant",
      licensePath:"LICENSES/X3270-3270-BDF.txt",
      evidence:"Complete x3270 4.1ga10 x3270/3270.bdf bundled package-locally: 431 glyphs, 9×14 cell, CHARSET_REGISTRY 3270cg. Printable ASCII is resolved by STARTCHAR glyph names because the source follows 3270 character-generator ordering. No network font fetch is required."
    }
  });

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
      this.glyphsByName=new Map();
      this.properties={};
      this.charsetRegistry="";
      this.cellWidth=0;this.cellHeight=0;this.baseline=0;
      this.sourceName="";
      this.fileSHA256="";
      this.byteLength=0;
      this.provenanceId="";
      this.licenseName="";
      this.publicSource="";
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
          if(glyph.name)f.glyphsByName.set(glyph.name,glyph);
          glyph=null;inBitmap=false;
        }else if(glyph&&inBitmap&&/^[0-9A-Fa-f]+$/.test(line.trim())){
          glyph.bitmap.push(line.trim().toUpperCase());
        }
      }

      f.ascent=intValue(f.properties.FONT_ASCENT,0);
      f.descent=intValue(f.properties.FONT_DESCENT,0);
      f.charsetRegistry=normalize(f.properties.CHARSET_REGISTRY||"");
      if(!f.ascent&&!f.descent){
        const h=f.boundingBox[1]||0,y=f.boundingBox[3]||0;
        f.ascent=Math.max(0,h+y);
        f.descent=Math.max(0,-y);
      }
      const ascii=[];
      for(let cp=32;cp<=126;cp++){
        const g=f.glyphForChar(String.fromCharCode(cp));
        if(g)ascii.push(g);
      }
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
      const name=bdfGlyphNameForASCII(ch);
      // x3270's 3270 BDF deliberately uses 3270 character-generator order,
      // not Unicode/ASCII code-point order.  For that registry, resolve the
      // human-readable STARTCHAR name first so ASCII LMB text selects the
      // intended 3270 glyph instead of an unrelated CG slot.
      if(this.charsetRegistry.startsWith("3270cg")&&name){
        const byName=this.glyphsByName.get(name);
        if(byName)return byName;
      }
      const direct=this.glyphs.get(cp);
      if(direct)return direct;
      if(name&&this.glyphsByName.has(name))return this.glyphsByName.get(name);
      return this.glyphsByName.get("question")||this.glyphs.get(63)||null;
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
        if(!this.glyphForChar(String.fromCharCode(cp)))missingASCII.push(cp);
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
        charsetRegistry:this.charsetRegistry||"",
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
      this.provenanceId="";
      this.licenseName="";
      this.publicSource="";
    }
    summary(){
      return {
        kind:this.kind,
        family:this.family,
        source:this.sourceName,
        sha256:this.fileSHA256||"",
        byteLength:this.byteLength||0,
        provenanceId:this.provenanceId||"",
        licenseName:this.licenseName||"",
        publicSource:this.publicSource||""
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


  async function loadVectorFontURL(url,familyName,sourceName){
    familyName=familyName||"HistoricalWebFont";
    const response=await fetch(url,{cache:"no-cache",mode:"cors"});
    if(!response.ok)throw new Error(`font fetch failed: ${response.status} ${response.statusText}`);
    const data=await response.arrayBuffer();
    const face=new FontFace(familyName,data);
    await face.load();
    document.fonts.add(face);
    const backend=new CanvasFontBackend('"'+familyName+'"',sourceName||url);
    backend.fileSHA256=await sha256Hex(data);
    backend.byteLength=data.byteLength;
    return backend;
  }

  function validatePublicAssetBackend(asset,backend){
    if(!asset||!backend)return backend;
    if(asset.kind==="bdf"){
      const s=backend.summary();
      if(asset.sha256&&normalize(s.sha256)!==normalize(asset.sha256)){
        throw new Error(`font asset validation failed: SHA-256 ${s.sha256||"(empty)"}, expected ${asset.sha256}`);
      }
      if(asset.glyphCount&&s.glyphCount!==asset.glyphCount){
        throw new Error(`font asset validation failed: glyph count ${s.glyphCount}, expected ${asset.glyphCount}`);
      }
      if(asset.cell&&(s.cellWidth!==asset.cell.w||s.cellHeight!==asset.cell.h)){
        throw new Error(`font asset validation failed: cell ${s.cellWidth}x${s.cellHeight}, expected ${asset.cell.w}x${asset.cell.h}`);
      }
      if(asset.expectedCharsetRegistry&&normalize(s.charsetRegistry)!==normalize(asset.expectedCharsetRegistry)){
        throw new Error(`font asset validation failed: charset registry ${s.charsetRegistry||"(empty)"}, expected ${asset.expectedCharsetRegistry}`);
      }
      if(asset.expectedCharsetEncoding&&normalize(backend.properties&&backend.properties.CHARSET_ENCODING)!==normalize(asset.expectedCharsetEncoding)){
        throw new Error(`font asset validation failed: charset encoding ${(backend.properties&&backend.properties.CHARSET_ENCODING)||"(empty)"}, expected ${asset.expectedCharsetEncoding}`);
      }
      if(!s.asciiComplete){
        throw new Error(`font asset validation failed: ASCII display set incomplete (${s.missingASCII.length} missing)`);
      }
    }
    return backend;
  }

  async function loadPublicAsset(asset){
    if(!asset)throw new Error("font asset is not defined");
    let backend;
    if(asset.kind==="bdf") backend=await loadBDFURL(asset.url,asset.label);
    else if(asset.kind==="vector") backend=await loadVectorFontURL(asset.url,asset.familyName,asset.label);
    else throw new Error("unsupported font asset kind: "+asset.kind);
    validatePublicAssetBackend(asset,backend);
    backend.provenanceId=asset.id||"";
    backend.licenseName=asset.licenseName||"";
    backend.publicSource=asset.publicSource||"";
    return backend;
  }

  function applyKnownAssetProvenance(font){
    const hash=String(font.fileSHA256||"").toLowerCase();
    for(const asset of Object.values(PUBLIC_FONT_ASSETS)){
      if(!asset.sha256||hash!==asset.sha256.toLowerCase())continue;
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
    parseXLFD,compareXLFD,classifyDECtermFont,bdfGlyphNameForASCII,DEC_TARGETS,DEC_PUBLIC_ASSETS,PUBLIC_FONT_ASSETS,
    loadVectorFont,loadVectorFontURL,loadPublicAsset,validatePublicAssetBackend,loadBDF,loadBDFBytes,loadBDFURL,sha256Hex
  };
});