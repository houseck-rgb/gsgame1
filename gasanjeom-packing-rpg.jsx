import { useState, useEffect, useRef } from "react";

const STEPS = [
  {
    id: 1,
    emoji: "🧾",
    title: "영수증 확인",
    desc: "오더렉 영수증을 꼼꼼히 확인하세요",
    action: "영수증 확인 완료!",
    shake: false,
    exp: 10,
  },
  {
    id: 2,
    emoji: "📋",
    title: "품목 / 수량 확인",
    desc: "숯불고기 수량, 반찬 4칸, 게장 수량 체크",
    action: "품목 확인 완료!",
    shake: false,
    exp: 15,
  },
  {
    id: 3,
    emoji: "🍲",
    title: "된장찌개 + 공기밥 먼저",
    desc: "봉투 바닥에 🍲 된장찌개 + 🍚 공기밥 제일 먼저!",
    action: "바닥 안착!",
    shake: true,
    exp: 20,
    warning: "🔥 흔들리면 FAIL! 뜨거운 국물 조심!",
  },
  {
    id: 4,
    emoji: "🥩",
    title: "숯불고기 + 소금 + 쌈장",
    desc: "🥩 숯불고기 올리고 🧂 소금 + 🥣 쌈장 세팅",
    action: "고기 세팅 완료!",
    shake: false,
    exp: 20,
  },
  {
    id: 5,
    emoji: "🥬",
    title: "야채 + 4칸 반찬",
    desc: "🥬 신선한 야채 + 🍱 4칸 반찬 올리기",
    action: "야채 & 반찬 완료!",
    shake: false,
    exp: 20,
  },
  {
    id: 6,
    emoji: "🦀",
    title: "리뷰양념게장 + 명함",
    desc: "🦀 리뷰양념게장 올리고 💳 명함 위에 얹기",
    action: "게장 & 명함 완료!",
    shake: false,
    exp: 25,
  },
  {
    id: 7,
    emoji: "📦",
    title: "각잡아 테이핑",
    desc: "봉투 각 잡고 깔끔하게 테이핑 완료",
    action: "각! 완료!",
    shake: false,
    exp: 20,
  },
  {
    id: 8,
    emoji: "📄",
    title: "영수증 부착 완료",
    desc: "영수증을 봉투 겉면에 깔끔하게 붙이기",
    action: "영수증 부착!",
    shake: false,
    exp: 30,
  },
];

const TOTAL_EXP = STEPS.reduce((a, s) => a + s.exp, 0);

function useSound() {
  const beepRef = useRef(null);
  const playBeep = (type = "success") => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === "success") {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "perfect") {
        [523, 659, 784, 1047].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = f;
          g.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.35);
          o.start(ctx.currentTime + i * 0.1);
          o.stop(ctx.currentTime + i * 0.1 + 0.35);
        });
      } else if (type === "fail") {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(); osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };
  return { playBeep };
}

function HeartParticles({ active }) {
  const hearts = ["❤️", "💛", "🧡", "💚", "💙"];
  if (!active) return null;
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
            fontSize: `${1.2 + Math.random() * 1.5}rem`,
            animation: `floatUp 1.2s ease-out forwards`,
            animationDelay: `${Math.random() * 0.4}s`,
          }}
        >
          {hearts[Math.floor(Math.random() * hearts.length)]}
        </div>
      ))}
    </div>
  );
}

function ShakeWarning({ active }) {
  if (!active) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #ff4444, #ff8800)",
      color: "#fff",
      borderRadius: "12px",
      padding: "10px 18px",
      fontFamily: "'Black Han Sans', sans-serif",
      fontSize: "0.95rem",
      textAlign: "center",
      animation: "pulseWarn 0.6s ease infinite",
      marginBottom: "12px",
      letterSpacing: "0.03em",
    }}>
      🔥 흔들리면 FAIL! 뜨거운 국물 조심!
    </div>
  );
}

function PerfectScreen({ onReset }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a0a 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Black Han Sans', sans-serif",
      padding: "20px",
      textAlign: "center",
    }}>
      <div style={{ animation: "spinZoom 0.8s cubic-bezier(0.34,1.56,0.64,1) both", fontSize: "5rem" }}>⭐</div>
      <div style={{
        fontSize: "2.6rem",
        color: "#FFD700",
        textShadow: "0 0 30px #FFD700, 0 0 60px #ff8800",
        marginTop: "16px",
        animation: "glowPulse 1.5s ease infinite",
        letterSpacing: "0.05em",
      }}>
        PERFECT PACKING
      </div>
      <div style={{ fontSize: "1.3rem", color: "#aaffaa", marginTop: "8px", letterSpacing: "0.1em" }}>
        🏆 포장 마스터 달성!
      </div>
      <div style={{
        marginTop: "28px",
        background: "rgba(255,215,0,0.12)",
        border: "2px solid #FFD700",
        borderRadius: "16px",
        padding: "18px 32px",
        color: "#FFD700",
        fontSize: "1.1rem",
        lineHeight: "2",
      }}>
        ✅ 된장찌개 + 공기밥 (바닥)<br/>
        ✅ 숯불고기 + 소금 + 쌈장<br/>
        ✅ 야채 + 4칸 반찬<br/>
        ✅ 리뷰양념게장 + 명함<br/>
        ✅ 각잡아 테이핑<br/>
        ✅ 영수증 부착 완료
      </div>
      <div style={{
        marginTop: "24px",
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "center",
        fontSize: "2rem",
        animation: "bounceRow 1s ease infinite",
      }}>
        {"🥩🦀🥬🍲🍱💳📦📄".split("").map((e, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
        ))}
      </div>
      <button
        onClick={onReset}
        style={{
          marginTop: "36px",
          background: "linear-gradient(135deg, #FFD700, #ff8800)",
          border: "none",
          borderRadius: "14px",
          padding: "14px 40px",
          fontSize: "1.1rem",
          fontFamily: "'Black Han Sans', sans-serif",
          color: "#0a0a1a",
          cursor: "pointer",
          letterSpacing: "0.05em",
          boxShadow: "0 0 20px rgba(255,215,0,0.4)",
        }}
      >
        🔄 다시 포장하기
      </button>
    </div>
  );
}

export default function PackingRPG() {
  const [step, setStep] = useState(0);
  const [exp, setExp] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [showHearts, setShowHearts] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [done, setDone] = useState(false);
  const [failAnim, setFailAnim] = useState(false);
  const [successFlash, setSuccessFlash] = useState(false);
  const [packingAnim, setPackingAnim] = useState(false);
  const { playBeep } = useSound();
  const current = STEPS[step];

  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  const handleSuccess = () => {
    if (packingAnim) return;
    setSuccessFlash(true);
    setShowHearts(true);
    playBeep("success");
    vibrate([80, 40, 80]);
    const newExp = exp + current.exp;
    setExp(newExp);
    setTimeout(() => setSuccessFlash(false), 400);
    setTimeout(() => setShowHearts(false), 1400);

    if (step + 1 >= STEPS.length) {
      setTimeout(() => {
        setPackingAnim(true);
        playBeep("perfect");
        vibrate([100, 50, 100, 50, 200]);
        setTimeout(() => setDone(true), 2000);
      }, 800);
    } else {
      setTimeout(() => setStep(s => s + 1), 600);
    }
  };

  const handleFail = () => {
    if (hearts <= 1) {
      setHearts(0);
      playBeep("fail");
      vibrate([300, 100, 300]);
      setFailAnim(true);
      setTimeout(() => {
        setFailAnim(false);
        setHearts(3);
        setStep(0);
        setExp(0);
      }, 1600);
      return;
    }
    setHearts(h => h - 1);
    setShaking(true);
    playBeep("fail");
    vibrate([200, 100, 200]);
    setFailAnim(true);
    setTimeout(() => { setShaking(false); setFailAnim(false); }, 700);
  };

  if (done) return <PerfectScreen onReset={() => { setDone(false); setStep(0); setExp(0); setHearts(3); setPackingAnim(false); }} />;

  const expPct = Math.round((exp / TOTAL_EXP) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0e0e1f 0%, #1a0d2e 40%, #0a1520 100%)",
      fontFamily: "'Black Han Sans', sans-serif",
      color: "#f0ead6",
      padding: "0 0 40px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Noto+Sans+KR:wght@400;700&display=swap');
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
        }
        @keyframes pulseWarn {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
        @keyframes glowPulse {
          0%,100% { text-shadow: 0 0 30px #FFD700, 0 0 60px #ff8800; }
          50% { text-shadow: 0 0 60px #FFD700, 0 0 120px #ff4400; }
        }
        @keyframes spinZoom {
          0% { transform: scale(0) rotate(-180deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes shakeCard {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-12px) rotate(-2deg); }
          40% { transform: translateX(12px) rotate(2deg); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
        }
        @keyframes successFlashAnim {
          0% { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes packingBounce {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.15) rotate(3deg); }
        }
        @keyframes slideInUp {
          0% { transform: translateY(40px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes barFill {
          from { width: 0%; }
        }
        @keyframes bounceRow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes failFlash {
          0%,100% { background: rgba(255,0,0,0); }
          50% { background: rgba(255,0,0,0.25); }
        }
      `}</style>

      {/* BG grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(255,200,100,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,100,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {showHearts && <HeartParticles active={showHearts} />}

      {failAnim && <div style={{
        position: "fixed", inset: 0, zIndex: 90, pointerEvents: "none",
        animation: "failFlash 0.35s ease 2",
      }} />}

      {successFlash && <div style={{
        position: "fixed", inset: 0, zIndex: 90, pointerEvents: "none",
        background: "rgba(100,255,150,0.18)",
        animation: "successFlashAnim 0.4s ease forwards",
      }} />}

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a0d2e 0%, #0e1a0e 100%)",
        borderBottom: "2px solid rgba(255,200,80,0.3)",
        padding: "16px 20px 12px",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "480px", margin: "0 auto" }}>
          <div>
            <div style={{ fontSize: "0.75rem", color: "#ff8c42", letterSpacing: "0.1em" }}>🥩 가산점 고기야</div>
            <div style={{ fontSize: "1.15rem", color: "#FFD700", letterSpacing: "0.05em" }}>포장 RPG 시스템</div>
          </div>
          <div style={{ display: "flex", gap: "4px", fontSize: "1.4rem" }}>
            {[...Array(3)].map((_, i) => (
              <span key={i} style={{ opacity: i < hearts ? 1 : 0.2, transition: "opacity 0.3s" }}>❤️</span>
            ))}
          </div>
        </div>

        {/* EXP Bar */}
        <div style={{ maxWidth: "480px", margin: "10px auto 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#aaa", marginBottom: "4px" }}>
            <span>EXP</span>
            <span>{exp} / {TOTAL_EXP} ({expPct}%)</span>
          </div>
          <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "99px", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${expPct}%`,
              background: "linear-gradient(90deg, #FFD700, #ff8800)",
              borderRadius: "99px",
              transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              boxShadow: "0 0 8px rgba(255,200,0,0.6)",
            }} />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "16px 20px 0" }}>
        <div style={{ display: "flex", gap: "4px", overflowX: "auto", paddingBottom: "4px" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              flex: "0 0 auto",
              width: "32px", height: "32px",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.85rem",
              background: i < step ? "rgba(255,215,0,0.2)" : i === step ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.05)",
              border: i === step ? "2px solid #FFD700" : i < step ? "2px solid rgba(255,215,0,0.4)" : "2px solid rgba(255,255,255,0.1)",
              boxShadow: i === step ? "0 0 12px rgba(255,215,0,0.4)" : "none",
              transition: "all 0.3s",
            }}>
              {i < step ? "✓" : s.id}
            </div>
          ))}
        </div>
      </div>

      {/* Main Card */}
      <div style={{ maxWidth: "480px", margin: "20px auto 0", padding: "0 16px" }}>
        <div style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))",
          border: "1.5px solid rgba(255,200,80,0.25)",
          borderRadius: "24px",
          padding: "28px 24px",
          animation: shaking ? "shakeCard 0.5s ease" : packingAnim ? "packingBounce 0.5s ease infinite" : "slideInUp 0.4s ease",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}>
          {/* Step badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{
              background: "linear-gradient(135deg, #FFD700, #ff8800)",
              color: "#0a0a1a",
              borderRadius: "99px",
              padding: "4px 14px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}>
              STEP {current.id} / {STEPS.length}
            </div>
            <div style={{ color: "#FFD700", fontSize: "0.85rem" }}>+{current.exp} EXP</div>
          </div>

          {/* Emoji & Title */}
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ fontSize: "4.5rem", lineHeight: 1, marginBottom: "10px" }}>{current.emoji}</div>
            <div style={{ fontSize: "1.6rem", color: "#FFD700", letterSpacing: "0.04em" }}>{current.title}</div>
          </div>

          {/* Warning */}
          <ShakeWarning active={!!current.shake} />

          {/* Desc */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            borderRadius: "12px",
            padding: "14px 16px",
            fontSize: "0.95rem",
            color: "#d4c9b0",
            textAlign: "center",
            lineHeight: 1.7,
            fontFamily: "'Noto Sans KR', sans-serif",
            fontWeight: 400,
            marginBottom: "24px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            {current.desc}
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleFail}
              style={{
                flex: 1,
                background: "linear-gradient(135deg, rgba(255,60,60,0.2), rgba(200,0,0,0.1))",
                border: "1.5px solid rgba(255,80,80,0.4)",
                borderRadius: "14px",
                padding: "14px",
                color: "#ff7070",
                fontSize: "0.95rem",
                fontFamily: "'Black Han Sans', sans-serif",
                cursor: "pointer",
                letterSpacing: "0.05em",
                transition: "all 0.2s",
              }}
            >
              ❌ FAIL
            </button>
            <button
              onClick={handleSuccess}
              style={{
                flex: 2,
                background: "linear-gradient(135deg, #FFD700, #ff9500)",
                border: "none",
                borderRadius: "14px",
                padding: "14px",
                color: "#0a0a1a",
                fontSize: "1rem",
                fontFamily: "'Black Han Sans', sans-serif",
                cursor: "pointer",
                letterSpacing: "0.05em",
                boxShadow: "0 4px 20px rgba(255,200,0,0.35)",
                transition: "all 0.2s",
              }}
            >
              ✅ {current.action}
            </button>
          </div>
        </div>

        {/* Checklist Summary */}
        <div style={{
          marginTop: "20px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "16px",
          padding: "16px 18px",
        }}>
          <div style={{ fontSize: "0.8rem", color: "#888", letterSpacing: "0.08em", marginBottom: "10px" }}>📦 포장 순서</div>
          {[
            "🍲 된장찌개 + 🍚 공기밥 (봉투 바닥)",
            "🥩 숯불고기 + 🧂 소금 + 🥣 쌈장",
            "🥬 야채 + 🍱 4칸 반찬",
            "🦀 리뷰양념게장 + 💳 명함",
            "📦 각잡아 테이핑",
            "📄 영수증 부착",
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "6px 0",
              borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.05)" : "none",
              color: step > i + 2 ? "#5a5" : step === i + 2 ? "#FFD700" : "#666",
              fontSize: "0.88rem",
              fontFamily: "'Noto Sans KR', sans-serif",
              transition: "color 0.3s",
            }}>
              <span>{step > i + 2 ? "✅" : step === i + 2 ? "▶️" : "⬜"}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
