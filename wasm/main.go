//go:build js && wasm
// +build js,wasm

package main

import (
	"syscall/js"
)

func applySepia(this js.Value, args []js.Value) interface{} {
	// 画像データを取得
	data := args[0]
	length := data.Get("length").Int()

	// 結果を格納する新しいUint8ClampedArrayを作成
	result := js.Global().Get("Uint8ClampedArray").New(length)

	// ピクセルごとに処理（RGBAの4要素ごと）
	for i := 0; i < length; i += 4 {
		r := data.Index(i).Int()
		g := data.Index(i + 1).Int()
		b := data.Index(i + 2).Int()
		a := data.Index(i + 3).Int()

		// セピアトーン変換の計算
		newR := int(0.393*float64(r) + 0.769*float64(g) + 0.189*float64(b))
		newG := int(0.349*float64(r) + 0.686*float64(g) + 0.168*float64(b))
		newB := int(0.272*float64(r) + 0.534*float64(g) + 0.131*float64(b))

		// 値が255を超えないようにする
		if newR > 255 {
			newR = 255
		}
		if newG > 255 {
			newG = 255
		}
		if newB > 255 {
			newB = 255
		}

		result.SetIndex(i, newR)
		result.SetIndex(i+1, newG)
		result.SetIndex(i+2, newB)
		result.SetIndex(i+3, a) // アルファ値はそのまま
	}

	return result
}

func main() {
	js.Global().Set("applySepiaFilter", js.FuncOf(applySepia))
}
