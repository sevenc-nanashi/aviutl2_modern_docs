---
title: Luaスクリプト：更新履歴
description: AviUtl ExEdit2のLuaスクリプトの更新履歴について説明しています。
---

# 更新履歴

## 2.00 beta24 <Badge text='2025/12/14' />

- フィルタオブジェクト対応向けの'--filter'の定義,obj.getinfo("filter")を追加

## 2.00 beta23a <Badge text='2025/12/7' />

- obj.getinfo("bpm")を追加

## 2.00 beta23 <Badge text='2025/12/6' />

- obj.getvalue()に"frame_s","frame_e"の指定を追加

## 2.00 beta22a <Badge text='2025/12/2' />

- '--group'にグループの終端の設定方法を追加

## 2.00 beta22 <Badge text='2025/11/30' />

- '--group'の定義を追加
- obj.getpoint("timecontrol")の引数を追加

## 2.00 beta21 <Badge text='2025/11/22' />

- obj.setoption("sampler")のサンプラーの種類を追加

## 2.00 beta20 <Badge text='2025/11/16' />

- obj.sx,obj.sy,obj.szの項目を追加
- obj.getvalue()に基準拡大率("sx","sy","sz")の指定を追加

## 2.00 beta19 <Badge text='2025/11/8' />

- グループ制御に追加したスクリプトのobj.draw()が正しく描画されないのを修正
- obj.getvalue("scenechange")の精度を修正
- obj.computeshader()にサンプラーの指定を追加
- obj.pixelshader(),obj.computeshader()のresourceに"random"を追加
- obj.data(),'--data'の定義を追加

## 2.00 beta18a <Badge text='2025/11/2' />

- `--dialog`の`/chk`をnumber型で返却するように修正
- obj.effect_idを追加

## 2.00 beta18 <Badge text='2025/11/1' />

- obj.rand1()の乱数範囲を調整
- obj.pixelshader()にサンプラーの指定を追加
- ピクセルシェーダー定義の説明を追加
- チェックボックス項目定義にboolean型にする指定を追加
- obj.getoption("track_mode")の説明を追加

## 2.00 beta17 <Badge text='2025/10/26' />

- obj.rand()の最大最小値の引数の精度を修正
- obj.rand1()を追加

## 2.00 beta16 <Badge text='2025/10/19' />

- オブジェクトが無い状態で引数無しのobj.getpixel()の返却が正しくないのを修正
- obj.getvalue()にオブジェクトの存在確認の指定方法を追加

## 2.00 beta15 <Badge text='2025/10/12' />

- obj.module()を追加
- obj.getaudio()に音声チャンネルの指定方法を追加

## 2.00 beta14 <Badge text='2025/10/5' />

- テキスト設定項目に入力したバックスラッシュ文字が正しく変数に反映されないのを修正
- obj.idを追加

## 2.00 beta13 <Badge text='2025/9/27' />

- テキスト設定項目に入力したダブルクォート文字が正しく変数に反映されないのを修正
- obj.getpixeldata(),obj.putpixeldata()を追加
- obj.getinfo("version")を追加

## 2.00 beta12 <Badge text='2025/9/21' />

- obj.getvalue("layer.x")で指定したレイヤーにオブジェクトが無い場合は値を返却しないように修正
- シーンチェンジスクリプトでobj.setanchor()を利用出来るように修正
- 設定項目の定義にテキスト設定項目(--text)を追加
- obj.getvalue()に基準中心座標("cx","cy","cz")の指定を追加

## 2.00 beta11 <Badge text='2025/9/13' />

- スクリプト制御、スクリプトファイルの種別で含めるライブラリを変更
- obj.copybuffer()でオブジェクトを更新した時に一部のobj変数の変更が破棄されるのを修正
- obj.layerの値を描画対象のオブジェクトのレイヤー番号となるように修正
- obj.drawpoly()の配列指定(座標+色+法線)が正しく描画出来ないのを修正
- obj.drawpoly()に頂点リストのテーブルで指定する方法を追加
- obj.getinfo("clock"),obj.getinfo("script_time")を追加

## 2.00 beta10 <Badge text='2025/9/7' />

- obj.setanchor()で直接テーブル変数を指定した場合に落ちるのを修正
- スクリプト制御に不要なluaのライブラリ関数を含めないように修正

## 2.00 beta9 <Badge text='2025/8/30' />

- トラックバー移動スクリプトでのobj.randのデフォルトの種の計算を修正
- テキストの個別オブジェクトの表示タイミングがobj変数に反映されないのを修正

## 2.00 beta8 <Badge text='2025/8/24' />

- 出力ログの内容によって落ちる場合があるのを修正
- obj.getpixel()のキャッシュ処理の修正と処理説明を追加
- obj.putpixel(),obj.copypixel()を追加
- obj.pixeloption()のオプションを一部追加
- obj.setoption()の合成モードの処理を一部修正

## 2.00 beta6 <Badge text='2025/8/10' />

- obj.copybuffer()で画像ファイルのコピーが正しく反映されない場合があるのを修正
- obj.copybuffer()でオブジェクトを更新した時にobj変数が更新されていないのを修正
- オブジェクトの画像が無い状態でobj.drawpoly()を呼び出すと落ちる場合があるのを修正

## 2.00 beta5 <Badge text='2025/8/3' />

- obj.effect()のパラメータ値を数値型で指定した場合の対策を追加

## 2.00 beta4 <Badge text='2025/7/27' />

- 仮想バッファ、キャッシュバッファが正しく生成されない場合があるのを修正

## 2.00 beta2 <Badge text='2025/7/12' />

- copybuffer()のコピー先種別を追加
