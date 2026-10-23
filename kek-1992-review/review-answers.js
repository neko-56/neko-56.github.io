(function(root){
  'use strict';
  const fields=[
    ['cern_workflow','1. CERNでの接続・編集・保存・表示確認の流れ'],
    ['cern_terminal_note','CERNで見ていた端末・画面・操作の記憶'],
    ['cern_terminal_name','覚えている手元の端末名'],
    ['cern_host_note','接続先の計算機や、ソフトが動いていた場所'],
    ['cern_check_note','編集画面から表示確認への切り替え方'],
    ['kek_check_note','2. KEK側での表示・操作・時期の記憶'],
    ['kek_check_method','KEK側での確認方法（複数回答）',true],
    ['kek_display_mode','KEK側の画面の見え方'],
    ['green_origin_note','3. 講演資料の緑色画像を用意した経緯'],
    ['green_created','緑色画像の作成時期・作成した方'],
    ['green_environment','緑色画像の作成に使った機械・ソフト'],
    ['green_depiction','緑色画像が表している場所・場面'],
    ['green_appearance','緑色画像の配色・文字・形について'],
    ['html_learning_note','補足：HTMLの学び方・使ったエディタ'],
    ['html_learning','HTMLの学び方（複数回答）',true],
    ['source_leads','当時の資料や詳しい方の心当たり'],
    ['other_note','その他・こちらの理解が違っている点'],
    ['cern_display_candidate','CERN側の比較画面の印象（使用機種の特定ではありません）',true],
    ['cern_comparison_note','CERN側の比較画面で近い点・違う点'],
    ['kek_display_candidate','KEK側の比較画面の印象（使用機種の特定ではありません）',true],
    ['kek_comparison_note','KEK側の比較画面で近い点・違う点']
  ];
  const legacyLabels={
    cern_terminal:'旧版：CERNの端末候補の選択',
    cern_check_method:'旧版：CERNでの確認方法の選択',
    cern_check_same_screen:'旧版：「同じ機械・画面」の選択',
    green_origin:'旧版：緑色画像の由来の選択'
  };
  const aliases={
    cern_display_candidate:{
      '標準LMB表示 — 機種指定なし':'表示候補Aの見え方が近い',
      'IBM RS/6000候補':'表示候補Bの見え方が近い',
      'Sun-4候補':'表示候補Cの見え方が近い',
      'PRIAM VAX候補':'表示候補Dの見え方が近い',
      'NeXTSTEP Terminal + LMB候補':'表示候補Eのウィンドウ形状が近い',
      'color NeXT + LMB（講演資料配色）候補':'表示候補Fの見え方が近い',
      '覚えていない':'比較できない・覚えていない'
    },
    kek_display_candidate:{
      'ウィンドウなし／コンソール全画面候補':'表示候補K1の見え方が近い',
      'DECstation 5000/125 / DECterm候補':'表示候補K2の見え方が近い',
      'DECstation 5000/125 / 講演資料配色候補':'表示候補K3の見え方が近い',
      '覚えていない':'比較できない・覚えていない'
    }
  };
  function validObject(value){return value && typeof value==='object' && !Array.isArray(value);}
  function normalize(raw){
    if(!validObject(raw))raw={};
    const answers={},legacy={};
    const known=new Set(fields.map(f=>f[0]));
    const remember=(name,value)=>{
      const text=Array.isArray(value)?value.filter(v=>typeof v==='string').join(' / '):value;
      if(typeof text==='string' && text.trim())legacy[name]=text;
    };
    if(validObject(raw.__legacy))Object.entries(raw.__legacy).forEach(([n,v])=>remember(n,v));
    for(const [name,,multiple] of fields){
      const value=raw[name];
      if(multiple){
        const values=Array.isArray(value)?value:(typeof value==='string'?[value]:[]);
        answers[name]=[...new Set(values.filter(v=>typeof v==='string' && v.trim()).map(v=>aliases[name]?.[v]||v))];
      }else answers[name]=typeof value==='string'?value:'';
    }
    for(const [name,value] of Object.entries(raw)){
      if(name!=='__legacy' && !known.has(name))remember(name,value);
    }
    return {answers,legacy};
  }
  function toggleChoice(values,value,checked,exclusive){
    const rest=values.filter(v=>v!==value);
    if(!checked)return rest;
    if(exclusive.includes(value))return [value];
    return [...new Set([...rest.filter(v=>!exclusive.includes(v)),value])];
  }
  function legacyText(legacy){
    return Object.entries(legacy).map(([n,v])=>'【'+(legacyLabels[n]||'旧版：'+n)+'】\n'+v).join('\n\n');
  }
  function format(answers,legacy={}){
    const out=['1992年 KEK WWW 表示環境について — 回答'];
    for(const [name,label,multiple] of fields){
      const value=answers[name];
      const text=multiple?(Array.isArray(value)?value.map(v=>'・'+v).join('\n'):''):String(value||'').trim();
      if(text)out.push('【'+label+'】\n'+text);
    }
    const old=legacyText(legacy);
    if(old)out.push('以前のページで入力された回答（当時の選択内容をそのまま記載）\n\n'+old);
    return out.join('\n\n');
  }
  const api={fields,normalize,toggleChoice,format,legacyText};
  if(typeof module==='object' && module.exports)module.exports=api;
  else root.ReviewAnswers=api;
})(typeof window==='undefined'?globalThis:window);
