const assert=require('assert');
const R=require('../../review-answers.js');

const old={
  html_learning:'既存のWWWページやHTMLを参考にした',
  kek_check_method:'HTMLファイルの内容を見て確認した',
  cern_display_candidate:'IBM RS/6000候補',
  kek_display_candidate:'DECstation 5000/125 / DECterm候補',
  cern_terminal:'VAX / PRIAM系',
  green_origin:'後年、説明・再現のために作成した画面',
  cern_terminal_note:'当時の自由記述'
};
const migrated=R.normalize(old);
assert.deepStrictEqual(migrated.answers.html_learning,[old.html_learning]);
assert.deepStrictEqual(migrated.answers.kek_check_method,[old.kek_check_method]);
assert.deepStrictEqual(migrated.answers.cern_display_candidate,['表示候補Bの見え方が近い']);
assert.deepStrictEqual(migrated.answers.kek_display_candidate,['表示候補K2の見え方が近い']);
assert.strictEqual(migrated.answers.cern_terminal_note,old.cern_terminal_note);
assert.strictEqual(migrated.legacy.cern_terminal,old.cern_terminal);
assert.strictEqual(migrated.legacy.green_origin,old.green_origin);

const output=R.format(migrated.answers,migrated.legacy);
assert.ok(output.includes('表示候補Bの見え方が近い'));
assert.ok(!output.includes('IBM RS/6000候補'),'visual resemblance must not be exported as machine identification');
assert.ok(output.includes('使用機種の特定ではありません'));
assert.ok(output.includes('旧版：緑色画像の由来の選択'));
assert.ok(output.includes(old.green_origin),'unmappable legacy answers must remain available');
const roundTrip=R.normalize({...migrated.answers,__legacy:migrated.legacy});
assert.deepStrictEqual(roundTrip,migrated,'saving the migrated response must not lose old answers');

let choices=R.toggleChoice([], '人から教わった',true,['覚えていない']);
choices=R.toggleChoice(choices,'既存のHTMLを参考にした',true,['覚えていない']);
assert.strictEqual(choices.length,2);
choices=R.toggleChoice(choices,'覚えていない',true,['覚えていない']);
assert.deepStrictEqual(choices,['覚えていない']);
choices=R.toggleChoice(choices,'人から教わった',true,['覚えていない']);
assert.deepStrictEqual(choices,['人から教わった']);
assert.deepStrictEqual(R.toggleChoice(choices,'人から教わった',false,['覚えていない']),[]);

const multi=R.normalize({html_learning:['説明を受けた','資料を読んだ','説明を受けた']});
assert.deepStrictEqual(multi.answers.html_learning,['説明を受けた','資料を読んだ']);
assert.ok(R.format(multi.answers).includes('・説明を受けた\n・資料を読んだ'));
for(const invalid of [null,undefined,'broken',42,[],true]){
  assert.deepStrictEqual(R.normalize(invalid).legacy,{});
  assert.ok(!R.format(R.normalize(invalid).answers).includes('undefined'));
}
console.log('PASS: reviewer answers, multi-selection, impression wording, and legacy response migration');
