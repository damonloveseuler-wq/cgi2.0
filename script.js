// 천지인 2.0 순수 자바스크립트 엔진
class CheonjiinApp {
  constructor() {
    this.text = "";
    this.soundEnabled = true;
    this.audioCtx = null;

    // 제스처 매핑 테이블
    this.gestureMap = {
      "r1_1": { tap: "ㅣ", right: "ㅓ", up: "ㅕ", left: "ㅣ" },
      "r1_2": { tap: "ㆍ", right: "ㅏ", up: "ㅑ", down: "ㆍ" },
      "r1_3": { tap: "ㅡ", up: "ㅗ", down: "ㅛ", left: "ㅡ" },
      "r2_1": { tap: "ㄱ", right: "ㅋ", up: "ㄲ" },
      "r2_2": { tap: "ㄴ", right: "ㄹ" },
      "r2_3": { tap: "ㄷ", right: "ㅌ", up: "ㄸ" },
      "r3_1": { tap: "ㅂ", right: "ㅍ", up: "ㅃ" },
      "r3_2": { tap: "ㅅ", right: "ㅎ", up: "ㅆ" },
      "r3_3": { tap: "ㅈ", right: "ㅊ", up: "ㅉ" },
      "r4_1": { tap: "ㅇ", right: "ㅁ" },
    };

    // 간단 한자 사전
    this.hanjaDict = {
      "한": [{ ch: "韓", mean: "한국 한" }, { ch: "漢", mean: "한나라 한" }, { ch: "寒", mean: "찰 한" }],
      "국": [{ ch: "國", mean: "나라 국" }, { ch: "局", mean: "판 국" }],
      "대": [{ ch: "大", mean: "큰 대" }, { ch: "代", mean: "대신할 대" }],
      "민": [{ ch: "民", mean: "백성 민" }, { ch: "敏", mean: "민첩할 민" }],
      "일": [{ ch: "日", mean: "날 일" }, { ch: "一", mean: "한 일" }],
      "월": [{ ch: "月", mean: "달 월" }],
      "화": [{ ch: "火", mean: "불 화" }, { ch: "花", mean: "꽃 화" }, { ch: "華", mean: "빛날 화" }],
      "수": [{ ch: "水", mean: "물 수" }, { ch: "手", mean: "손 수" }],
      "목": [{ ch: "木", mean: "나무 목" }, { ch: "目", mean: "눈 목" }],
      "금": [{ ch: "金", mean: "쇠 금" }],
      "토": [{ ch: "土", mean: "흙 토" }]
    };

    this.initElements();
    this.initEvents();
  }

  initElements() {
    this.outputEl = document.getElementById("outputText");
    this.feedbackEl = document.getElementById("gestureFeedback");
    this.clearBtn = document.getElementById("clearBtn");
    this.copyBtn = document.getElementById("copyBtn");
    this.soundToggleBtn = document.getElementById("soundToggleBtn");
    this.keys = document.querySelectorAll(".key-btn");
    this.hanjaModal = document.getElementById("hanjaModal");
    this.closeHanjaBtn = document.getElementById("closeHanjaBtn");
    this.hanjaSearchInput = document.getElementById("hanjaSearchInput");
    this.hanjaList = document.getElementById("hanjaList");
  }

  initEvents() {
    this.clearBtn.addEventListener("click", () => {
      this.text = "";
      this.updateDisplay();
    });

    this.copyBtn.addEventListener("click", () => {
      if (this.text) {
        navigator.clipboard.writeText(this.text);
        alert("복사되었습니다!");
      }
    });

    this.soundToggleBtn.addEventListener("click", () => {
      this.soundEnabled = !this.soundEnabled;
      this.soundToggleBtn.classList.toggle("active", this.soundEnabled);
      this.soundToggleBtn.textContent = this.soundEnabled ? "🔊 소리" : "🔇 무음";
    });

    this.closeHanjaBtn.addEventListener("click", () => {
      this.hanjaModal.style.display = "none";
    });

    this.hanjaSearchInput.addEventListener("input", (e) => {
      this.renderHanja(e.target.value.trim());
    });

    // 터치 및 마우스 드래그 제스처 바인딩
    this.keys.forEach(btn => {
      let startX = 0, startY = 0;
      const keyId = btn.getAttribute("data-id");

      const handleStart = (x, y) => {
        startX = x;
        startY = y;
        this.playSound();
      };

      const handleEnd = (x, y) => {
        const dx = x - startX;
        const dy = y - startY;
        const dist = Math.hypot(dx, dy);

        let direction = "tap";
        if (dist > 25) {
          if (Math.abs(dx) > Math.abs(dy)) {
            direction = dx > 0 ? "right" : "left";
          } else {
            direction = dy > 0 ? "down" : "up";
          }
        }
        this.handleKeyPress(keyId, direction);
      };

      btn.addEventListener("mousedown", (e) => handleStart(e.clientX, e.clientY));
      btn.addEventListener("mouseup", (e) => handleEnd(e.clientX, e.clientY));

      btn.addEventListener("touchstart", (e) => {
        const t = e.touches[0];
        handleStart(t.clientX, t.clientY);
      }, { passive: true });

      btn.addEventListener("touchend", (e) => {
        const t = e.changedTouches[0];
        handleEnd(t.clientX, t.clientY);
      });
    });
  }

  handleKeyPress(keyId, direction) {
    if (keyId === "backspace") {
      this.text = this.text.slice(0, -1);
      this.updateDisplay();
      return;
    }
    if (keyId === "space") {
      this.text += " ";
      this.updateDisplay();
      return;
    }
    if (keyId === "enter") {
      this.text += "\n";
      this.updateDisplay();
      return;
    }
    if (keyId === "period") {
      this.text += ".";
      this.updateDisplay();
      return;
    }
    if (keyId === "hanjaToggle") {
      this.openHanja();
      return;
    }
    if (keyId === "emoji") {
      this.text += "😊";
      this.updateDisplay();
      return;
    }
    if (keyId === "langToggle" || keyId === "symToggle") {
      alert("해당 모드는 상단 화면에서 지원됩니다.");
      return;
    }

    const mapping = this.gestureMap[keyId];
    if (mapping) {
      const char = mapping[direction] || mapping["tap"];
      this.text += char;
      this.showFeedback(char, direction);
      this.updateDisplay();
    }
  }

  showFeedback(char, dir) {
    if (dir !== "tap") {
      const arrows = { right: "→", left: "←", up: "↑", down: "↓" };
      this.feedbackEl.textContent = `${arrows[dir] || ""} ${char}`;
      setTimeout(() => { this.feedbackEl.textContent = ""; }, 800);
    }
  }

  updateDisplay() {
    if (!this.text) {
      this.outputEl.textContent = "키보드를 입력하세요...";
      this.outputEl.classList.add("placeholder");
    } else {
      this.outputEl.textContent = this.text;
      this.outputEl.classList.remove("placeholder");
    }
  }

  openHanja() {
    this.hanjaModal.style.display = "flex";
    const lastChar = this.text.slice(-1);
    this.hanjaSearchInput.value = lastChar;
    this.renderHanja(lastChar);
  }

  renderHanja(query) {
    this.hanjaList.innerHTML = "";
    const list = this.hanjaDict[query] || [];
    if (list.length === 0) {
      this.hanjaList.innerHTML = '<div style="grid-column: span 4; color: #888;">검색 결과가 없습니다.</div>';
      return;
    }
    list.forEach(item => {
      const div = document.createElement("div");
      div.className = "hanja-item";
      div.innerHTML = `<strong style="font-size:1.3rem;">${item.ch}</strong><br><small style="color:#666;">${item.mean}</small>`;
      div.addEventListener("click", () => {
        if (this.text.endsWith(query)) {
          this.text = this.text.slice(0, -query.length) + item.ch;
        } else {
          this.text += item.ch;
        }
        this.updateDisplay();
        this.hanjaModal.style.display = "none";
      });
      this.hanjaList.appendChild(div);
    });
  }

  playSound() {
    if (!this.soundEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // AudioContext 제한 무시
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new CheonjiinApp();
});
