"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Upload, Download, FileImage, Loader2, X } from "lucide-react";

// PDF.js 타입 선언
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

interface ConvertedImage {
  pageNum: number;
  dataUrl: string;
  width: number;
  height: number;
}

interface PDFToImageConverterProps {
  onImageSelect?: (image: { dataUrl: string; fileName: string }) => void;
  initialFile?: File | null;
}

export default function PDFToImageConverter({
  onImageSelect,
  initialFile,
}: PDFToImageConverterProps) {
  // 변환 설정 상태
  const [conversionSettings, setConversionSettings] = useState({
    scale: 2.0, // 기본 해상도 2.0으로 증가
    quality: 0.9, // JPEG 품질 0.9로 증가
    format: "jpeg" as "jpeg" | "png", // 이미지 형식
    maxPages: 10, // 최대 페이지 수
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isPDFJSReady, setIsPDFJSReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // initialFile이 변경될 때 자동으로 PDF 변환 시작
  useEffect(() => {
    if (initialFile && !pdfFile) {
      setPdfFile(initialFile);
      // convertPDFToImages는 나중에 선언되므로 여기서 직접 호출하지 않음
      // 대신 파일만 설정하고 사용자가 수동으로 변환하도록 함
    }
  }, [initialFile, pdfFile]);

  // PDF.js 초기화
  useEffect(() => {
    setupPDFWorker().catch((error) => {
      console.error("PDF.js 초기화 실패:", error);
      setError("PDF.js 초기화에 실패했습니다. 페이지를 새로고침해주세요.");
    });
  }, []);

  // PDF.js 워커 설정
  const setupPDFWorker = async () => {
    return new Promise<void>((resolve, reject) => {
      if (typeof window !== "undefined") {
        if (window.pdfjsLib) {
          // 이미 로드된 경우 워커만 설정
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          setIsPDFJSReady(true);
          resolve();
          return;
        }

        // PDF.js CDN에서 로드
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          // 로드 완료 후 워커 설정
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            setIsPDFJSReady(true);
            resolve();
          } else {
            reject(new Error("PDF.js 로드 실패"));
          }
        };
        script.onerror = () => {
          reject(new Error("PDF.js 스크립트 로드 실패"));
        };
        document.head.appendChild(script);
      } else {
        reject(new Error("브라우저 환경이 아닙니다"));
      }
    });
  };

  // PDF를 이미지로 변환
  const convertPDFToImages = useCallback(
    async (file: File, pdfPassword = "") => {
      setIsConverting(true);
      setError("");
      setImages([]);

      // Canvas2D 경고 억제 (개발 환경에서만)
      if (process.env.NODE_ENV === "development") {
        const originalWarn = console.warn;
        console.warn = (...args) => {
          if (
            args[0] &&
            typeof args[0] === "string" &&
            args[0].includes("willReadFrequently")
          ) {
            return; // Canvas2D 경고 억제
          }
          originalWarn.apply(console, args);
        };
      }

      try {
        if (!isPDFJSReady) {
          throw new Error(
            "PDF.js가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요."
          );
        }

        if (!window.pdfjsLib) {
          throw new Error(
            "PDF.js가 로드되지 않았습니다. 잠시 후 다시 시도해주세요."
          );
        }

        const arrayBuffer = await file.arrayBuffer();

        // PDF 문서 로드 (비밀번호 포함 + 성능 최적화)
        const loadingTask = window.pdfjsLib.getDocument({
          data: arrayBuffer,
          password: pdfPassword,
          useWorkerFetch: false,
          isEvalSupported: false,
          // 성능 최적화 옵션
          disableFontFace: true, // 폰트 로딩 비활성화
          verbosity: 0, // 로그 레벨 최소화
        });

        const pdf = await loadingTask.promise;

        // 성능 최적화: 최대 10페이지만 처리하고 병렬로 변환
        const maxPages = Math.min(pdf.numPages, conversionSettings.maxPages);
        const promises = [];

        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
          const pagePromise = (async () => {
            const page = await pdf.getPage(pageNum);

            // 뷰포트 설정 (해상도 최적화)
            const viewport = page.getViewport({
              scale: conversionSettings.scale,
            });

            // 캔버스 생성
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d", {
              willReadFrequently: true,
            });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // 페이지 렌더링
            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;

            // 캔버스를 이미지로 변환 (품질 최적화)
            const imageDataUrl = canvas.toDataURL(
              `image/${conversionSettings.format}`,
              conversionSettings.format === "jpeg"
                ? conversionSettings.quality
                : undefined
            );

            return {
              pageNum,
              dataUrl: imageDataUrl,
              width: viewport.width,
              height: viewport.height,
            };
          })();

          promises.push(pagePromise);
        }

        // 모든 페이지를 병렬로 처리
        const convertedImages = await Promise.all(promises);

        setImages(convertedImages);
      } catch (err: any) {
        // 비밀번호 관련 오류 처리
        if (
          err.name === "PasswordException" ||
          err.message?.includes("No password given") ||
          err.message?.includes("Incorrect password")
        ) {
          setShowPasswordModal(true);
          setPendingFile(file);
          setIsConverting(false);
          return;
        }

        setError(
          `변환 중 오류가 발생했습니다: ${err.message || "알 수 없는 오류"}`
        );
        console.error("PDF 변환 오류:", err);
      } finally {
        setIsConverting(false);
      }
    },
    [conversionSettings, isPDFJSReady]
  );

  // PDF를 캔버스에 직접 추가하는 함수
  const addPDFToCanvas = useCallback(
    async (file: File) => {
      try {
        if (!isPDFJSReady || !window.pdfjsLib) {
          throw new Error("PDF.js가 준비되지 않았습니다.");
        }

        setIsConverting(true);
        setError("");

        console.log("PDF 캔버스 직접 추가 시작:", file.name);

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({
          data: arrayBuffer,
          password: password,
          useWorkerFetch: false,
          isEvalSupported: false,
          disableFontFace: true,
          verbosity: 0,
        });

        const pdf = await loadingTask.promise;
        console.log("PDF 로딩 완료, 첫 페이지 렌더링 시작");

        // 첫 번째 페이지만 렌더링
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 }); // 고품질로 설정

        // 캔버스 생성 및 최적화
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", {
          willReadFrequently: false, // 수정: 성능 최적화
          alpha: true,
        });

        if (!context) {
          throw new Error("Canvas 2D 컨텍스트 생성 실패");
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // 배경을 흰색으로 설정 (PDF 투명도 문제 해결)
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 페이지 렌더링
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        console.log("페이지 렌더링 완료");

        // 이미지 데이터 생성 - PNG로 변경 (투명도 보존)
        const imageDataUrl = canvas.toDataURL("image/png", 1.0);

        console.log("이미지 변환 완료, 데이터 크기:", imageDataUrl.length);

        // 캔버스에 추가
        if (onImageSelect) {
          onImageSelect({
            dataUrl: imageDataUrl,
            fileName: `${file.name.replace(".pdf", "")}_canvas.png`,
          });
          console.log("PDF가 캔버스에 성공적으로 추가됨");
        }

        // 메모리 정리
        canvas.width = 0;
        canvas.height = 0;
      } catch (error: any) {
        console.error("PDF 캔버스 추가 실패:", error);

        if (error.name === "PasswordException") {
          setShowPasswordModal(true);
          setPendingFile(file);
          return;
        }

        setError(`PDF 캔버스 추가 실패: ${error.message}`);
      } finally {
        setIsConverting(false);
      }
    },
    [conversionSettings, password, onImageSelect, isPDFJSReady]
  );

  // 파일 선택 처리
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isPDFJSReady) {
        setError("PDF.js가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const file = e.target.files?.[0];
      if (file && file.type === "application/pdf") {
        setPdfFile(file);
        try {
          await convertPDFToImages(file);
        } catch (error) {
          console.error("파일 선택 후 변환 실패:", error);
        }
      } else if (file) {
        setError("PDF 파일만 업로드 가능합니다.");
      }
    },
    [convertPDFToImages, isPDFJSReady]
  );

  // 파일 드롭 처리
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);

      if (!isPDFJSReady) {
        setError("PDF.js가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const files = e.dataTransfer?.files;
      if (files && files[0] && files[0].type === "application/pdf") {
        const file = files[0];
        setPdfFile(file);

        try {
          // Shift 키를 누른 상태로 드롭하면 캔버스에 직접 추가
          if (e.shiftKey && onImageSelect) {
            await addPDFToCanvas(file);
          } else {
            // 일반 드롭은 이미지 변환
            await convertPDFToImages(file);
          }
        } catch (error) {
          console.error("드롭 후 처리 실패:", error);
        }
      } else {
        setError("PDF 파일만 업로드 가능합니다.");
      }
    },
    [onImageSelect, addPDFToCanvas, convertPDFToImages, isPDFJSReady]
  );

  // 드래그 이벤트 처리
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // 비밀번호 제출 처리
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingFile && password) {
      setShowPasswordModal(false);
      setPdfFile(pendingFile);
      convertPDFToImages(pendingFile, password);
      setPassword("");
    }
  };

  // 비밀번호 모달 닫기
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPendingFile(null);
    setPassword("");
    setIsConverting(false);
  };

  // 이미지 다운로드
  const downloadImage = (image: ConvertedImage, fileName: string) => {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = image.dataUrl;
    link.click();
  };

  // 모든 이미지 다운로드 (ZIP)
  const downloadAllImages = () => {
    images.forEach((image, index) => {
      setTimeout(() => {
        downloadImage(image, `page-${image.pageNum}.png`);
      }, index * 200);
    });
  };

  // 초기화
  const resetConverter = () => {
    setPdfFile(null);
    setImages([]);
    setError("");
    setShowPasswordModal(false);
    setPendingFile(null);
    setPassword("");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* 비밀번호 입력 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              PDF 비밀번호 입력
            </h3>
            <p className="text-gray-600 mb-4">
              이 PDF는 비밀번호로 보호되어 있습니다.
            </p>

            <form onSubmit={handlePasswordSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                autoFocus
              />

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  확인
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PDF to Image Converter
        </h1>
        <p className="text-gray-600">PDF 파일을 고품질 이미지로 변환합니다</p>
      </div>

      {/* PDF.js 상태 표시 */}
      {!isPDFJSReady && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <Loader2 className="inline h-4 w-4 mr-2 animate-spin text-yellow-600" />
            <span className="text-yellow-800">
              PDF.js 로딩 중... 잠시만 기다려주세요.
            </span>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <X className="inline h-4 w-4 mr-2 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* PDF 업로드 영역 */}
      {!pdfFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-xl font-medium text-gray-900 mb-2">
            PDF 파일을 여기에 드래그하거나 클릭하여 선택
          </p>
          <p className="text-gray-500 mb-4">최대 10MB까지 업로드 가능</p>

          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
          >
            파일 선택
          </label>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 파일 정보 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileImage className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">{pdfFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetConverter}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              다시 선택
            </button>
          </div>

          {/* 로딩 상태 */}
          {isConverting && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
              <p className="text-lg font-medium text-gray-900">
                PDF를 이미지로 변환 중...
              </p>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* 변환된 이미지들 */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  변환 완료 ({images.length}개 페이지)
                </h2>
                <button
                  onClick={downloadAllImages}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  모두 다운로드
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <div
                    key={image.pageNum}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    <div className="aspect-w-3 aspect-h-4 bg-gray-100">
                      <img
                        src={image.dataUrl}
                        alt={`Page ${image.pageNum}`}
                        className="w-full h-64 object-contain bg-white"
                      />
                    </div>
                    <div className="p-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          페이지 {image.pageNum}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              downloadImage(image, `page-${image.pageNum}.png`)
                            }
                            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            다운로드
                          </button>
                          {onImageSelect && (
                            <button
                              onClick={() =>
                                onImageSelect({
                                  dataUrl: image.dataUrl,
                                  fileName: `page-${image.pageNum}.png`,
                                })
                              }
                              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              캔버스에 추가
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(image.width / 2)} ×{" "}
                        {Math.round(image.height / 2)} px
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PDF 파일 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${
          !isPDFJSReady ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        onDrop={isPDFJSReady ? handleDrop : undefined}
        onDragOver={handleDrag}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onClick={isPDFJSReady ? () => fileInputRef.current?.click() : undefined}
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          PDF 파일을 여기에 드래그하거나 클릭하여 업로드
        </h3>
        <p className="text-gray-500 mb-4">또는 파일 선택 버튼을 클릭하세요</p>
        <p className="text-xs text-blue-600 mb-4">
          💡 <strong>팁:</strong> Shift + 드래그로 PDF를 캔버스에 직접 추가할 수
          있습니다
        </p>
        {!isPDFJSReady && (
          <p className="text-xs text-yellow-600">
            ⚠️ PDF.js 로딩 중... 잠시만 기다려주세요
          </p>
        )}

        {/* 변환 설정 */}
        <div className="max-w-md mx-auto space-y-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">변환 설정</h4>

          {/* 해상도 설정 */}
          <div className="flex items-center justify-between">
            <label htmlFor="scale-select" className="text-sm text-gray-700">
              해상도 (배율):
            </label>
            <select
              id="scale-select"
              name="scale"
              value={conversionSettings.scale}
              onChange={(e) =>
                setConversionSettings((prev) => ({
                  ...prev,
                  scale: parseFloat(e.target.value),
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={1.0}>1.0x (기본)</option>
              <option value={1.5}>1.5x (권장)</option>
              <option value={2.0}>2.0x (고품질)</option>
              <option value={3.0}>3.0x (최고품질)</option>
            </select>
          </div>

          {/* 이미지 형식 설정 */}
          <div className="flex items-center justify-between">
            <label htmlFor="format-select" className="text-sm text-gray-700">
              이미지 형식:
            </label>
            <select
              id="format-select"
              name="format"
              value={conversionSettings.format}
              onChange={(e) =>
                setConversionSettings((prev) => ({
                  ...prev,
                  format: e.target.value as "jpeg" | "png",
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="jpeg">JPEG (압축)</option>
              <option value="png">PNG (무손실)</option>
            </select>
          </div>

          {/* JPEG 품질 설정 */}
          {conversionSettings.format === "jpeg" && (
            <div className="flex items-center justify-between">
              <label htmlFor="quality-select" className="text-sm text-gray-700">
                JPEG 품질:
              </label>
              <select
                id="quality-select"
                name="quality"
                value={conversionSettings.quality}
                onChange={(e) =>
                  setConversionSettings((prev) => ({
                    ...prev,
                    quality: parseFloat(e.target.value),
                  }))
                }
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={0.7}>70% (작은 파일)</option>
                <option value={0.8}>80% (균형)</option>
                <option value={0.9}>90% (고품질)</option>
                <option value={1.0}>100% (최고품질)</option>
              </select>
            </div>
          )}

          {/* 최대 페이지 수 설정 */}
          <div className="flex items-center justify-between">
            <label htmlFor="maxPages-select" className="text-sm text-gray-700">
              최대 페이지:
            </label>
            <select
              id="maxPages-select"
              name="maxPages"
              value={conversionSettings.maxPages}
              onChange={(e) =>
                setConversionSettings((prev) => ({
                  ...prev,
                  maxPages: parseInt(e.target.value),
                }))
              }
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={5}>5페이지</option>
              <option value={10}>10페이지</option>
              <option value={20}>20페이지</option>
              <option value={50}>50페이지</option>
            </select>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <input
            ref={fileInputRef}
            id="pdf-file-input"
            name="pdfFile"
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="PDF 파일 선택"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={!isPDFJSReady}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-describedby="pdf-file-input"
          >
            {!isPDFJSReady ? (
              <>
                <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              "파일 선택"
            )}
          </button>

          {/* PDF를 캔버스에 직접 추가하는 버튼 */}
          {onImageSelect && (
            <button
              onClick={() => {
                if (pdfFile) {
                  addPDFToCanvas(pdfFile);
                } else {
                  setError("먼저 PDF 파일을 선택해주세요.");
                }
              }}
              disabled={!pdfFile || isConverting || !isPDFJSReady}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConverting ? (
                <>
                  <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <FileImage className="inline h-4 w-4 mr-2" />
                  캔버스에 PDF 추가
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 사용법 및 성능 안내 */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          사용법 & 성능 최적화
        </h3>
        <ul className="space-y-2 text-blue-800">
          <li>• PDF 파일을 드래그하거나 파일 선택 버튼을 클릭하여 업로드</li>
          <li>• 비밀번호로 보호된 PDF도 지원합니다</li>
          <li>
            • 🎯 <strong>피그잼 스타일:</strong> "캔버스에 PDF 추가" 버튼으로
            PDF를 직접 캔버스에 추가
          </li>
          <li>
            • ⌨️ <strong>단축키:</strong> Shift + 드래그로 PDF를 캔버스에 직접
            추가
          </li>
          <li>
            • ⚡ <strong>성능 최적화:</strong> 최대{" "}
            {conversionSettings.maxPages}페이지만 처리, 병렬 변환
          </li>
          <li>
            • 🖼️ <strong>이미지 품질:</strong>{" "}
            {conversionSettings.format.toUpperCase()} 형식,{" "}
            {conversionSettings.format === "jpeg"
              ? `${Math.round(conversionSettings.quality * 100)}% 품질`
              : "무손실"}
          </li>
          <li>
            • 📱 <strong>해상도:</strong> {conversionSettings.scale}x 스케일로{" "}
            {conversionSettings.scale >= 2.0 ? "고품질" : "최적화된"} 크기
          </li>
          <li>• 개별 페이지 또는 전체 페이지를 한 번에 다운로드 가능</li>
          <li>• 브라우저에서 직접 변환되어 파일이 서버로 전송되지 않습니다</li>
        </ul>
      </div>
    </div>
  );
}
