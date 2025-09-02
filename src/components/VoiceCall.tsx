"use client";

import React, { useState, useRef, useEffect, memo } from "react";

interface VoiceCallProps {
  isConnected?: boolean;
  onCallStart?: () => void;
  onCallEnd?: () => void;
}

const VoiceCall = memo<VoiceCallProps>(
  ({ isConnected = false, onCallStart, onCallEnd }) => {
    const [isCallActive, setIsCallActive] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const microphoneRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const audioElementRef = useRef<HTMLAudioElement | null>(null);

    // 음성 파장 분석 함수
    const analyzeAudio = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      // 평균 음성 레벨 계산
      const average =
        dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;
      setAudioLevel(average);

      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    };

    // 마이크 권한 요청 및 오디오 분석 시작
    const startAudioAnalysis = async () => {
      try {
        console.log("마이크 권한 요청 중...");
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });

        microphoneRef.current = stream;

        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);

        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        analyserRef.current.smoothingTimeConstant = 0.8;

        source.connect(analyserRef.current);
        analyzeAudio();
      } catch (error) {
        console.error("마이크 접근 권한이 필요합니다:", error);
      }
    };

    // 오디오 분석 중지
    const stopAudioAnalysis = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (microphoneRef.current) {
        microphoneRef.current.getTracks().forEach((track) => track.stop());
        microphoneRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      analyserRef.current = null;
      setAudioLevel(0);
    };

    // 통화 시작
    const handleCallStart = async () => {
      console.log("handleCallStart 함수 호출됨");
      console.log("현재 isConnected 상태:", isConnected);

      if (!isConnected) {
        console.log("협업 세션이 연결되지 않음");
        alert("먼저 협업 세션에 연결해주세요.");
        return;
      }

      // HTTPS 환경 확인
      if (location.protocol !== "https:" && location.hostname !== "localhost") {
        console.log("HTTPS 환경이 아님:", location.protocol, location.hostname);
        alert("마이크 접근을 위해서는 HTTPS 환경이 필요합니다.");
        return;
      }

      try {
        console.log("통화 시작 시도...");
        setIsCallActive(true);
        console.log("isCallActive 상태를 true로 설정");
        await startAudioAnalysis();
        console.log("통화 시작 성공!");
        onCallStart?.();
      } catch (error) {
        console.error("통화 시작 실패:", error);
        setIsCallActive(false);

        let errorMessage = "통화 시작에 실패했습니다.";
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            errorMessage =
              "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.";
          } else if (error.name === "NotFoundError") {
            errorMessage =
              "마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.";
          } else if (error.name === "NotSupportedError") {
            errorMessage = "이 브라우저는 마이크 접근을 지원하지 않습니다.";
          }
        }

        alert(errorMessage);
      }
    };

    // 통화 종료
    const handleCallEnd = () => {
      setIsCallActive(false);
      stopAudioAnalysis();
      onCallEnd?.();
    };

    // 음소거 토글
    const toggleMute = () => {
      if (microphoneRef.current) {
        const audioTrack = microphoneRef.current.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsMuted(!audioTrack.enabled);
        }
      }
    };

    // 컴포넌트 언마운트 시 정리
    useEffect(() => {
      return () => {
        stopAudioAnalysis();
      };
    }, []);

    // 음성 파장 바 생성
    const renderAudioBars = () => {
      const bars = [];
      const barCount = 20;
      const maxHeight = 40;

      for (let i = 0; i < barCount; i++) {
        const height =
          isCallActive && !isMuted
            ? (audioLevel / 255) * maxHeight * (0.5 + Math.random() * 0.5)
            : 2;

        bars.push(
          <div
            key={i}
            className="bg-blue-500 rounded-full transition-all duration-75"
            style={{
              width: "3px",
              height: `${Math.max(2, height)}px`,
              opacity: isCallActive && !isMuted ? 0.8 : 0.3,
            }}
          />
        );
      }

      return bars;
    };

    return (
      <div
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderRadius: "16px",
          padding: "16px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e5e7eb",
          minWidth: "120px",
        }}
      >
        {/* 숨겨진 오디오 엘리먼트 */}
        <audio
          ref={audioElementRef}
          autoPlay={false}
          muted={false}
          style={{ display: "none" }}
        />

        {/* 제목 */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: "600",
            color: "#374151",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          음성 통화
        </div>

        {/* 음성 파장 표시 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "2px",
            height: "40px",
            marginBottom: "12px",
            padding: "8px",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            width: "100%",
          }}
        >
          {renderAudioBars()}
        </div>

        {/* 볼륨 레벨 표시 */}
        {isCallActive && (
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            볼륨: {Math.round((audioLevel / 255) * 100)}%
          </div>
        )}

        {/* 상태 표시 */}
        <div
          style={{
            fontSize: "12px",
            color: isCallActive ? "#059669" : "#6b7280",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          {isCallActive ? "통화 중" : "대기 중"}
        </div>

        {/* 음성 전달 상태 표시 */}
        {isCallActive && (
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              marginBottom: "8px",
              textAlign: "center",
              padding: "4px 8px",
              backgroundColor: "#f3f4f6",
              borderRadius: "4px",
            }}
          >
            💡 현재는 로컬 마이크 테스트만 가능합니다
          </div>
        )}

        {/* 버튼들 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          {!isCallActive ? (
            <>
              <button
                onClick={() => {
                  console.log("통화 시작 버튼 클릭됨!");
                  handleCallStart();
                }}
                disabled={!isConnected}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: isConnected
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "#d1d5db",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  border: "none",
                  cursor: isConnected ? "pointer" : "not-allowed",
                  opacity: isConnected ? 1 : 0.6,
                }}
                title={isConnected ? "통화 시작" : "먼저 연결해주세요"}
              >
                📞 통화 시작
              </button>

              {/* 마이크 권한 테스트 버튼 */}
              <button
                onClick={async () => {
                  try {
                    console.log("마이크 권한 테스트 중...");
                    const stream = await navigator.mediaDevices.getUserMedia({
                      audio: true,
                    });
                    console.log("마이크 권한 테스트 성공:", stream);
                    alert("마이크 권한이 정상적으로 작동합니다!");
                    stream.getTracks().forEach((track) => track.stop());
                  } catch (error) {
                    console.error("마이크 권한 테스트 실패:", error);
                    alert(
                      "마이크 권한이 필요합니다. 브라우저 설정을 확인해주세요."
                    );
                  }
                }}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
                title="마이크 권한 테스트"
              >
                🎤 권한 테스트
              </button>

              {/* 간단한 클릭 테스트 버튼 */}
              <button
                onClick={() => {
                  console.log("테스트 버튼 클릭됨!");
                  alert("버튼 클릭이 정상적으로 작동합니다!");
                }}
                style={{
                  width: "100%",
                  padding: "6px 12px",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  border: "none",
                  cursor: "pointer",
                }}
                title="클릭 테스트"
              >
                🔧 클릭 테스트
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleMute}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: isMuted
                    ? "linear-gradient(135deg, #ef4444, #dc2626)"
                    : "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  border: "none",
                  cursor: "pointer",
                }}
                title={isMuted ? "음소거 해제" : "음소거"}
              >
                {isMuted ? "🔇 음소거 해제" : "🔇 음소거"}
              </button>

              <button
                onClick={handleCallEnd}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "white",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  border: "none",
                  cursor: "pointer",
                }}
                title="통화 종료"
              >
                📞 통화 종료
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
);

VoiceCall.displayName = "VoiceCall";

export default VoiceCall;
