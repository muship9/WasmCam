import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [isFiltering, setIsFiltering] = useState(false);
	const [wasmLoaded, setWasmLoaded] = useState(false);

	useEffect(() => {
		const loadWasm = async () => {
			const go = new window.Go();
			const result = await WebAssembly.instantiateStreaming(
				fetch("/go.wasm"),
				go.importObject,
			);
			go.run(result.instance);
			setWasmLoaded(true);
		};

		loadWasm();

		if (videoRef.current) {
			navigator.mediaDevices
				.getUserMedia({ video: true })
				.then((stream) => {
					if (videoRef.current) {
						videoRef.current.srcObject = stream;
					}
				})
				.catch((err) => console.error("Camera access error:", err));
		}
	}, []);

	useEffect(() => {
		if (!wasmLoaded) return;

		let animationId: number;
		const processFrame = () => {
			if (videoRef.current && canvasRef.current) {
				const ctx = canvasRef.current.getContext("2d");
				if (ctx) {
					// キャンバスサイズをビデオに合わせる
					canvasRef.current.width = videoRef.current.videoWidth;
					canvasRef.current.height = videoRef.current.videoHeight;

					// ビデオフレームをキャンバスに描画
					ctx.drawImage(videoRef.current, 0, 0);

					if (isFiltering) {
						console.log("hoge");
						// 画像データを取得
						const imageData = ctx.getImageData(
							0,
							0,
							canvasRef.current.width,
							canvasRef.current.height,
						);

						// WASMで実装したセピアフィルタを適用
						// @ts-ignore - wasmLoaded が true のときだけ実行され、この時点で関数は定義済み
						const resultData = window.applySepiaFilter(imageData.data);

						// 結果を新しいImageDataオブジェクトに設定
						const processedImageData = new ImageData(
							resultData,
							canvasRef.current.width,
							canvasRef.current.height,
						);

						// 処理結果をキャンバスに描画
						ctx.putImageData(processedImageData, 0, 0);
					}
				}
			}

			// 次のフレームを処理
			animationId = requestAnimationFrame(processFrame);
		};

		// 処理開始
		animationId = requestAnimationFrame(processFrame);

		// コンポーネントのクリーンアップ
		return () => {
			if (animationId) {
				cancelAnimationFrame(animationId);
			}
		};
	}, [wasmLoaded, isFiltering]);

	return (
		<div className="App">
			<div className="video-container">
				<video ref={videoRef} autoPlay playsInline muted />
				<canvas ref={canvasRef} />
			</div>
			<button
				onClick={() => setIsFiltering(!isFiltering)}
				disabled={!wasmLoaded}
			>
				{isFiltering ? "フィルタをオフ" : "セピアフィルタを適用"}
			</button>
			{!wasmLoaded && <p>WASMモジュールをロード中...</p>}
		</div>
	);
}

export default App;
