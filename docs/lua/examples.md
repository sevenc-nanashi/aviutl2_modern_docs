---
title: Luaスクリプト：使用例
description: AviUtl ExEdit2のLuaスクリプトの使用例について説明しています。
---

# 使用例

## テキスト内でスクリプトを使う例

以下のテキストでオブジェクト時間のタイムカウンタが表示します。

```autxt
現在のオブジェクトの時間=<?mes(string.format("%02d:%02d.%02d",obj.time/60,obj.time%60,（obj.time*100）%100))?>
```

## オブジェクトの座標や角度を時間経過で変化させる例

以下のスクリプトで時間と共に右方向に移動しながら右回転します。

```aulua
obj.ox = obj.ox + obj.time * 10
obj.rz = obj.rz + obj.time * 360
```

## オブジェクトにフィルタ効果をかける例

以下のスクリプトで時間と共に明るくなったり暗くなったりします。

```aulua
i = math.cos(obj.time * math.pi * 2) * 50
obj.effect("色調補正", "明るさ", 100 + i)
```

## オブジェクトを複数描画させる例

以下のスクリプトでオブジェクトを円状に10個描画します。

```aulua
n = 10
l = obj.w * 2
for i = 0, n do
	r = 360 * i / n
	x = math.sin(r * math.pi / 180) * l
	y = -math.cos(r * math.pi / 180) * l
	obj.draw(x, y, 0, 1, 1, 0, 0, r)
end
```

## アニメーション効果、カスタムオブジェクト等を1ファイルで複数登録する例

スクリプトファイル（\*.anm2,\*.obj2,\*.scn2,\*.cam2,\*.tra2）のファイル名の先頭を`@`にして以下のように各スクリプトの先頭に`@名前`のように定義すると複数のスクリプトを纏めて定義することが出来ます。
※script.anm2,script.obj2のスクリプトもこの形式になっています。

### 複数登録する場合のファイル内容 `@複数登録例.anm`

```aulua
@sample1
--track0:速度,-10,10,10
obj.ox = obj.ox + obj.track0 * obj.time
@sample2
--track0:速度,-10,10,10
obj.oy = obj.oy + obj.track0 * obj.time
```

### 単独登録する場合のファイル内容 `単独登録例.anm`

```aulua
--track0:速度,-10,10,10
obj.ox = obj.ox + obj.track0 * obj.time
```

## シーンチェンジスクリプトの例

以下のスクリプトで時間と共にクロスフェードします。
シーンチェンジスクリプトではフレームバッファにシーンチェンジ後の画像オブジェクトにシーンチェンジ前の画像が入っていてどちらを表示するかの割合をobj.getvalue("scenechange")で取得して処理します。
※0ならオブジェクト、1ならフレームバッファ側になります。

```aulua
a = 1 - obj.getvalue("scenechange")
obj.draw(0, 0, 0, 1, a)
```

## アンカーポイントの表示と座標の取得をする例

以下のスクリプトでアンカーポイントの表示と座標の取得をします。

### 変数項目の配列を使う場合

```aulua
--value@pos:座標,{}
num = 3
obj.setanchor("pos", num, "loop")
for i = 0, num - 1 do
	x = pos[i * 2 + 1]
	y = pos[i * 2 + 2]
end
```

※3D座標の場合はXYZの3座標ずつ配列に入ります。
※pos={}は初期値を入れておくことも出来ます。

### トラックバーを使う場合

```aulua
--track0:X,-1000,1000,0
--track1:Y,-1000,1000,0
--track2:Z,-1000,1000,0
num = obj.setanchor("track", 0, "xyz", "line")
for i = 0, num - 1 do
	x = obj.getvalue(0, 0, i)
	y = obj.getvalue(1, 0, i)
	z = obj.getvalue(2, 0, i)
end
```

### 複数回のobj.setanchor()を使う場合

```aulua
--value@pos1:座標1,{}
--value@pos2:座標2,{}
obj.setanchor("pos1", 4, "loop", "color", RGB(0, 255, 255))
obj.setanchor("pos2", 2, "line", "color", RGB(0, 255, 0))
```

## トラックバー移動スクリプトの例

以下のスクリプトでトラックバーの値を開始点から終了点まで等速で移動させます。
トラックバー移動スクリプトでは通常のオブジェクト関係の変数や関数は使用出来ません。
スクリプトファイル（\*.tra2）の先頭で`--twopoint`のように指定すると中間点を無視する設定になります。
`--speed:加速初期値（0/1）,減速初期値（0/1）`のように指定すると加減速の設定が出来るようになります。
`--param:初期値`のように指定するとトラックバーの設定値が指定出来るようになります。
`--param:項目名,初期値`のように指定すると設定ダイアログの項目名を指定することが出来ます。
`--param`を複数行指定することで複数の設定値を持つことが出来ます。
`--timecontrol`のように指定するとトラックバーの時間制御編集が出来るようになります。

```aulua
index, ratio = math.modf(obj.getpoint("index"))
st = obj.getpoint(index)
ed = obj.getpoint(index + 1)
return st + (ed - st) * ratio
```

### 複数の設定値を指定した場合

```aulua
param1, param2 = obj.getpoint("param")
```

## ピクセルシェーダーを利用する例

以下のスクリプトでオブジェクトの明るさを調整することが出来ます。

```aulua
--track@bright:明るさ,-100,100,0,0.01
--[[pixelshader@psmain:
cbuffer constant0: register(b0) {
    float bright;
};
float4 psmain(float4 pos: SV_Position): SV_Target {
    return float4(bright, bright, bright, 1);
}
]]
obj.pixelshader("psmain", "object", nil, { bright / 100 }, "add")
```
