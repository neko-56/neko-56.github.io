# KEK実機 graphics option / X server 確認手順

Phase 6.3 / 2026-10-21

目的は、DECstation 5000/125上のDECtermが75dpi/14pt経路と
100dpi/10pt経路のどちらを実際に選んだかを、推測ではなく実機証拠で決めることです。

## 1. 最優先: graphics optionを確認

DECの保守資料では、consoleの`cnfg`出力例として次が確認できます。

- `PMAG-CA` → `PX -- D=8` : 2D PX
- `PMAG-DA` → `PXG -- D=8, z=24` : 3D PXG

したがって、実機を起動できる場合はconsoleでgraphics moduleの型番を記録します。
起動できない場合はTURBOchannel optionのラベル/part numberを写真で記録します。

重要: DECstation 5000/125 + VRT19には、1991年のDEC価格表上、PX版
`PM322-KN`とPXG版`PM323-KN`の両方があります。前面の5000/125表示と
VRT19らしいモニターだけでは判別できません。

## 2. `/etc/ttys` を保存

ULTRIX/UWSではX serverの起動コマンドが`/etc/ttys`に記録されます。
ファイル全体を変更せずコピー/撮影し、`:0`の行を特に保存します。

見るポイント:

- server executable名
- `-fd 75` / `-fd 100`
- `-dpi 75` / `-dpi 100`
- その他font path指定

`Xws`が無指定で動いていたなら75dpi既定、`Xws -fd 100 -dpi 100`なら
100dpiを明示選択した証拠になります。

## 3. 起動中の状態を保存

DECwindowsを起動できる場合、次を「設定変更せず」読み取ります。

```sh
ps -ax
xset q
xdpyinfo
xrdb -query
```

保存したいもの:

- 実際のX server process/command line
- Font Path
- display dimensions / reported resolution
- `Dxterm` / `DECterm` resource

これらは現在残る実機状態の証拠です。1992年当時と同じだったかは別途評価します。

## 4. DECterm自身

可能ならDECtermを起動し、Customize/Optionsでfont setとscreen modeを
写真・テキストで記録します。操作前の初期値を先に保存してください。

## 5. 証拠の優先順位

1. 当時保存された設定ファイル/バックアップ
2. 現存システムディスクの`/etc/ttys`・X resources
3. graphics optionの実物型番
4. 現在起動したserver/font path
5. モニター物理DPIからの推定

5は補助情報であり、1〜4を上書きしません。

## 現在の結論

graphics option / X serverが未同定なので、75dpiと100dpiのどちらも
KEK runtime defaultとは断定しません。ただし両経路のDEC Terminal Little Fontは、
現在確認できた範囲で同じ8×15 glyph rasterへ収束するため、GitHub Pages上の
文字bitmapを変更する必要はありません。
