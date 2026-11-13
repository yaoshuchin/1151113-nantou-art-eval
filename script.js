/**
 * 115南投國中美術班評鑑系統 - 核心互動邏輯
 * 包含：主題色彩切換、字體大小調整、A/B/C/D 模式導覽、投影片控制器、Q&A篩選、評鑑即時紀錄CRUD
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. 全域狀態管理與偏好設定 (Theme & Font)
  // ==========================================
  const htmlRoot = document.documentElement;

  // 讀取 LocalStorage 或預設值
  const savedTheme = localStorage.getItem("ntjh_theme") || "green";
  const savedFont = localStorage.getItem("ntjh_font") || "md";

  setTheme(savedTheme);
  setFontSize(savedFont);

  // 主題按鈕點擊監聽
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const themeVal = btn.getAttribute("data-theme-val");
      setTheme(themeVal);
    });
  });

  // 字體按鈕點擊監聽
  document.querySelectorAll(".font-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const fontVal = btn.getAttribute("data-font-size");
      setFontSize(fontVal);
    });
  });

  function setTheme(theme) {
    htmlRoot.setAttribute("data-theme", theme);
    localStorage.setItem("ntjh_theme", theme);
    document.querySelectorAll(".theme-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-theme-val") === theme);
    });
  }

  function setFontSize(font) {
    htmlRoot.setAttribute("data-font", font);
    localStorage.setItem("ntjh_font", font);
    document.querySelectorAll(".font-btn").forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-font-size") === font);
    });
  }

  // 全螢幕切換
  const btnFullscreen = document.getElementById("btnFullscreen");
  const fsIcon = document.getElementById("fsIcon");
  btnFullscreen.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn("Fullscreen request error:", err);
      });
      fsIcon.textContent = "✖";
      btnFullscreen.title = "結束全螢幕";
    } else {
      document.exitFullscreen().catch(err => {
        console.warn("Exit fullscreen error:", err);
      });
      fsIcon.textContent = "⛶";
      btnFullscreen.title = "切換全螢幕";
    }
  });

  // ==========================================
  // 2. 模式切換 (Tabs: Slides / QA / Agenda / Records)
  // ==========================================
  const tabButtons = document.querySelectorAll(".tab-btn");
  const viewPanels = {
    slides: document.getElementById("view-slides"),
    qa: document.getElementById("view-qa"),
    agenda: document.getElementById("view-agenda"),
    records: document.getElementById("view-records")
  };

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetMode = btn.getAttribute("data-mode");
      switchMode(targetMode);
    });
  });

  function switchMode(modeKey) {
    tabButtons.forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-mode") === modeKey);
    });

    Object.keys(viewPanels).forEach(key => {
      if (viewPanels[key]) {
        viewPanels[key].classList.toggle("active", key === modeKey);
      }
    });

    // 捲動回頂端
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ==========================================
  // 3. 投影片控制器 (Slide Deck Controller)
  // ==========================================
  const slideDeck = document.getElementById("slideDeck");
  const slideCards = document.querySelectorAll(".slide-card");
  const prevSlideBtn = document.getElementById("prevSlideBtn");
  const nextSlideBtn = document.getElementById("nextSlideBtn");
  const currentSlideNumEl = document.getElementById("currentSlideNum");
  const totalSlideNumEl = document.getElementById("totalSlideNum");
  const slideSelect = document.getElementById("slideSelect");
  const toggleNotesBtn = document.getElementById("toggleNotesBtn");
  const notesBtnText = document.getElementById("notesBtnText");
  const toggleViewModeBtn = document.getElementById("toggleViewModeBtn");
  const viewModeText = document.getElementById("viewModeText");

  let currentSlideIndex = 1;
  const totalSlides = slideCards.length;
  totalSlideNumEl.textContent = totalSlides;

  // 預設為單頁演示模式
  slideDeck.classList.add("single-mode");

  // 簡報清單標題陣列 (用於下拉選單)
  const slideTitles = [
    "1. 封面：孕育一棵藝術大樹",
    "2. 敘事脈絡：六大維度導覽",
    "3. 土壤篇：行政與管理生態系",
    "4. 土壤篇：嚴謹鑑定與穩健招生",
    "5. 陽光與水：多元互補職人師資",
    "6. 陽光與水：教學研發動能與共備",
    "7. 枝幹篇：三年循序漸進美學藍圖",
    "8. 枝幹篇：跨域融合與多元教學實踐",
    "9. 養分篇：精準投資澆灌美感場域",
    "10. 養分篇：境教之美與全校共享",
    "11. 養分篇：八大專業創作基地",
    "12. 果實篇：得獎與升學全方位成就",
    "13. 果實篇：113 藝師藝友特色計畫",
    "14. 果實篇：113-114 藝起來尋美計畫",
    "15. 年輪淬鍊：112年評鑑建議蛻變回應",
    "16. 結語：扎根南投，繁枝茂葉"
  ];

  // 填充下拉選單
  slideTitles.forEach((t, i) => {
    const opt = document.createElement("option");
    opt.value = i + 1;
    opt.textContent = t;
    slideSelect.appendChild(opt);
  });

  // 顯示指定投影片
  function goToSlide(index) {
    if (index < 1) index = 1;
    if (index > totalSlides) index = totalSlides;

    currentSlideIndex = index;
    currentSlideNumEl.textContent = currentSlideIndex;
    slideSelect.value = currentSlideIndex;

    slideCards.forEach(card => {
      const cardNum = parseInt(card.getAttribute("data-slide"), 10);
      card.classList.toggle("active", cardNum === currentSlideIndex);
    });

    // 禁用/啟用箭頭
    prevSlideBtn.disabled = currentSlideIndex === 1;
    nextSlideBtn.disabled = currentSlideIndex === totalSlides;
    prevSlideBtn.style.opacity = currentSlideIndex === 1 ? "0.5" : "1";
    nextSlideBtn.style.opacity = currentSlideIndex === totalSlides ? "0.5" : "1";

    if (slideDeck.classList.contains("continuous-mode")) {
      const targetCard = document.querySelector(`.slide-card[data-slide="${currentSlideIndex}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }

  // 箭頭點擊
  prevSlideBtn.addEventListener("click", () => goToSlide(currentSlideIndex - 1));
  nextSlideBtn.addEventListener("click", () => goToSlide(currentSlideIndex + 1));

  // 下拉選單選擇
  slideSelect.addEventListener("change", (e) => {
    goToSlide(parseInt(e.target.value, 10));
  });

  // Slide 2 架構卡片點擊直達特定頁面
  document.querySelectorAll(".framework-card").forEach(card => {
    card.addEventListener("click", () => {
      const targetPage = parseInt(card.getAttribute("data-target"), 10);
      if (targetPage) {
        goToSlide(targetPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });

  // 切換演講筆記 (Speaker Notes)
  let notesVisible = true;
  toggleNotesBtn.addEventListener("click", () => {
    notesVisible = !notesVisible;
    document.querySelectorAll(".speaker-notes").forEach(note => {
      note.classList.toggle("hidden", !notesVisible);
    });
    notesBtnText.textContent = notesVisible ? "隱藏校長講稿與重點" : "顯示校長講稿與重點";
  });

  // 切換單頁演示 vs. 全頁流暢模式
  let isContinuous = false;
  toggleViewModeBtn.addEventListener("click", () => {
    isContinuous = !isContinuous;
    slideDeck.classList.toggle("single-mode", !isContinuous);
    slideDeck.classList.toggle("continuous-mode", isContinuous);
    viewModeText.textContent = isContinuous ? "切換單頁演示模式" : "全頁流暢瀏覽";
  });

  // QR Code 彈跳視窗控制
  const btnQrCode = document.getElementById("btnQrCode");
  const qrModal = document.getElementById("qrModal");
  const qrModalCloseBtn = document.getElementById("qrModalCloseBtn");

  function openQrModal() {
    if (qrModal) qrModal.classList.add("active");
  }
  function closeQrModal() {
    if (qrModal) qrModal.classList.remove("active");
  }

  if (btnQrCode) btnQrCode.addEventListener("click", openQrModal);
  if (qrModalCloseBtn) qrModalCloseBtn.addEventListener("click", closeQrModal);
  if (qrModal) {
    qrModal.addEventListener("click", (e) => {
      if (e.target === qrModal) closeQrModal();
    });
  }

  // 複製網址按鈕
  document.querySelectorAll(".btn-copy-url").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const inputEl = document.getElementById(targetId);
      if (inputEl) {
        navigator.clipboard.writeText(inputEl.value).then(() => {
          const oldText = btn.textContent;
          btn.textContent = "已複製！";
          setTimeout(() => { btn.textContent = oldText; }, 2000);
        });
      }
    });
  });

  // 海報預覽 Modal 控制
  const btnShowPoster = document.getElementById("btnShowPoster");
  const posterModal = document.getElementById("posterModal");
  const posterModalCloseBtn = document.getElementById("posterModalCloseBtn");
  const posterThumbnail = document.querySelector(".poster-thumbnail");

  function openPosterModal() {
    if (posterModal) posterModal.classList.add("active");
  }
  function closePosterModal() {
    if (posterModal) posterModal.classList.remove("active");
  }

  if (btnShowPoster) btnShowPoster.addEventListener("click", openPosterModal);
  if (posterThumbnail) posterThumbnail.addEventListener("click", openPosterModal);
  if (posterModalCloseBtn) posterModalCloseBtn.addEventListener("click", closePosterModal);
  if (posterModal) {
    posterModal.addEventListener("click", (e) => {
      if (e.target === posterModal) closePosterModal();
    });
  }

  // 鍵盤導航 (方向鍵左右 / 空白鍵)
  window.addEventListener("keydown", (e) => {
    if (!viewPanels.slides.classList.contains("active")) return;
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;

    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goToSlide(currentSlideIndex + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goToSlide(currentSlideIndex - 1);
    } else if (e.key === "Home") {
      goToSlide(1);
    } else if (e.key === "End") {
      goToSlide(totalSlides);
    }
  });

  goToSlide(1);

  // ==========================================
  // 4. B模式：Q&A 風琴折疊與分類篩選
  // ==========================================
  const qaCards = document.querySelectorAll(".qa-card");
  const qaPills = document.querySelectorAll(".qa-pill");

  qaCards.forEach(card => {
    const header = card.querySelector(".qa-header");
    header.addEventListener("click", () => {
      card.classList.toggle("open");
    });
  });

  qaPills.forEach(pill => {
    pill.addEventListener("click", () => {
      qaPills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const filterVal = pill.getAttribute("data-filter");
      qaCards.forEach(card => {
        const cat = card.getAttribute("data-category");
        if (filterVal === "all" || cat === filterVal) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // ==========================================
  // 5. D模式：評鑑即時紀錄 CRUD & 匯出
  // ==========================================
  const recordsTbody = document.getElementById("recordsTbody");
  const btnAddNewRecord = document.getElementById("btnAddNewRecord");
  const recordModal = document.getElementById("recordModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCancelBtn = document.getElementById("modalCancelBtn");
  const recordForm = document.getElementById("recordForm");
  const modalTitle = document.getElementById("modalTitle");

  const recIdInput = document.getElementById("recId");
  const recCommitteeInput = document.getElementById("recCommittee");
  const recCategoryInput = document.getElementById("recCategory");
  const recQuestionInput = document.getElementById("recQuestion");
  const recResponseInput = document.getElementById("recResponse");
  const recActionInput = document.getElementById("recAction");
  const recDeptInput = document.getElementById("recDept");
  const recStatusInput = document.getElementById("recStatus");

  const sumTotalEl = document.getElementById("sumTotal");
  const sumClarifiedEl = document.getElementById("sumClarified");
  const sumTrackingEl = document.getElementById("sumTracking");

  const btnExportMarkdown = document.getElementById("btnExportMarkdown");
  const btnPrintRecords = document.getElementById("btnPrintRecords");
  const btnResetRecords = document.getElementById("btnResetRecords");

  // 初始預設範例資料 (符合訪視情境)
  const defaultRecords = [
    {
      id: "rec_1",
      committee: "黃教授（專家學者）",
      category: "枝幹：課程與教學",
      question: "請說明七到九年級『四組分組教學』之分組標準與師資配比？如何確保每位學生都能輪替接觸到不同媒材？",
      response: "校長及教務主任回應：每學期依媒材輪替機制排定，由校內正式教師與外聘業師共同授課，每組維持6~7人精緻規模，每學期均能深耕特定工藝，三年完整歷練四大核心範疇。",
      action: "於課程計畫書增列三年輪替選組明細檢核表，供委員審閱佐證。",
      dept: "教務處/特教組",
      status: "現場已釐清"
    },
    {
      id: "rec_2",
      committee: "陳教授（專業委員）",
      category: "果實：成果與特色",
      question: "肯定學校『藝師藝友』引進在地傳統木雕大師與雷雕結合之成果，建議未來可持續擴大與南投工藝研究發展中心進行產官學深化對接。",
      response: "感謝委員指導！本校地理位置鄰近臺灣工藝研究中心，目前已有參訪與入校合作，未來將研擬簽訂正式MOU推動青年工藝學徒培力計畫。",
      action: "納入116學年度課程研發推動專案，編寫產學合作計畫草案。",
      dept: "輔導室特教組",
      status: "列入改善追蹤"
    },
    {
      id: "rec_3",
      committee: "教育處督學",
      category: "土壤：行政與管理",
      question: "招生方面近三年學生維持在滿編69人，適應不良或退場轉銜之實際案例數量為何？如何保障學生權益？",
      response: "特教組長回應：近兩年僅有1位學生因家庭遷居轉學，無因學業或創作壓力而退場之個案。本校建置每日聯絡簿生活札記與雙軌晤談機制，及早發現並提供心理支持。",
      action: "持續落實特推會轉銜輔導規章，維持常規關懷紀錄存查。",
      dept: "輔導室",
      status: "現場已釐清"
    }
  ];

  // 載入紀錄
  let evaluationRecords = [];
  try {
    const raw = localStorage.getItem("ntjh_evaluation_records");
    if (raw) {
      evaluationRecords = JSON.parse(raw);
    } else {
      evaluationRecords = [...defaultRecords];
    }
  } catch (err) {
    evaluationRecords = [...defaultRecords];
  }

  function saveRecords() {
    localStorage.setItem("ntjh_evaluation_records", JSON.stringify(evaluationRecords));
    renderRecords();
  }

  function renderRecords() {
    recordsTbody.innerHTML = "";

    if (evaluationRecords.length === 0) {
      recordsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-secondary);">目前尚無提問紀錄，請點選上方「新增委員提問紀錄」建立第一筆！</td></tr>`;
    } else {
      evaluationRecords.forEach(rec => {
        const tr = document.createElement("tr");

        const isClarified = rec.status === "現場已釐清";
        const statusClass = isClarified ? "clarified" : "tracking";

        tr.innerHTML = `
          <td>
            <strong>${escapeHtml(rec.committee)}</strong><br>
            <span class="rec-badge">${escapeHtml(rec.category)}</span>
          </td>
          <td>${escapeHtml(rec.question)}</td>
          <td>${escapeHtml(rec.response || "（尚無現場回應）")}</td>
          <td>
            <strong>${escapeHtml(rec.dept)}</strong><br>
            <small style="color:var(--text-secondary);">${escapeHtml(rec.action || "無")}</small>
          </td>
          <td>
            <span class="status-badge ${statusClass}">${escapeHtml(rec.status)}</span>
            <div class="action-btns">
              <button class="action-btn-sm edit-btn" data-id="${rec.id}">編輯</button>
              <button class="action-btn-sm del del-btn" data-id="${rec.id}">刪除</button>
            </div>
          </td>
        `;
        recordsTbody.appendChild(tr);
      });
    }

    // 更新統計數據
    sumTotalEl.textContent = evaluationRecords.length;
    sumClarifiedEl.textContent = evaluationRecords.filter(r => r.status === "現場已釐清").length;
    sumTrackingEl.textContent = evaluationRecords.filter(r => r.status !== "現場已釐清").length;

    // 綁定編輯與刪除按鈕
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => openEditModal(btn.getAttribute("data-id")));
    });

    document.querySelectorAll(".del-btn").forEach(btn => {
      btn.addEventListener("click", () => deleteRecord(btn.getAttribute("data-id")));
    });
  }

  function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[m]);
  }

  // Modal 控制
  function openAddModal() {
    modalTitle.textContent = "新增委員提問與建議";
    recIdInput.value = "";
    recordForm.reset();
    recDeptInput.value = "輔導室特教組";
    recStatusInput.value = "現場已釐清";
    recordModal.classList.add("active");
  }

  function openEditModal(id) {
    const item = evaluationRecords.find(r => r.id === id);
    if (!item) return;

    modalTitle.textContent = "編輯委員提問與建議";
    recIdInput.value = item.id;
    recCommitteeInput.value = item.committee;
    recCategoryInput.value = item.category;
    recQuestionInput.value = item.question;
    recResponseInput.value = item.response || "";
    recActionInput.value = item.action || "";
    recDeptInput.value = item.dept || "輔導室特教組";
    recStatusInput.value = item.status || "現場已釐清";

    recordModal.classList.add("active");
  }

  function closeModal() {
    recordModal.classList.remove("active");
  }

  btnAddNewRecord.addEventListener("click", openAddModal);
  modalCloseBtn.addEventListener("click", closeModal);
  modalCancelBtn.addEventListener("click", closeModal);

  // 表單送出儲存
  recordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const id = recIdInput.value.trim();
    const newRecord = {
      id: id || "rec_" + Date.now(),
      committee: recCommitteeInput.value.trim(),
      category: recCategoryInput.value,
      question: recQuestionInput.value.trim(),
      response: recResponseInput.value.trim(),
      action: recActionInput.value.trim(),
      dept: recDeptInput.value.trim(),
      status: recStatusInput.value
    };

    if (id) {
      // 編輯既有
      const idx = evaluationRecords.findIndex(r => r.id === id);
      if (idx !== -1) evaluationRecords[idx] = newRecord;
    } else {
      // 新增
      evaluationRecords.unshift(newRecord);
    }

    saveRecords();
    closeModal();
  });

  // 刪除紀錄
  function deleteRecord(id) {
    if (confirm("確定要刪除這筆評鑑紀錄嗎？")) {
      evaluationRecords = evaluationRecords.filter(r => r.id !== id);
      saveRecords();
    }
  }

  // 重設為範例資料
  btnResetRecords.addEventListener("click", () => {
    if (confirm("這將會清除目前的自訂編輯紀錄，並恢復為系統預設範例資料。確定重設嗎？")) {
      evaluationRecords = [...defaultRecords];
      saveRecords();
    }
  });

  // 列印紀錄表
  btnPrintRecords.addEventListener("click", () => {
    window.print();
  });

  // 匯出為 Markdown 格式
  btnExportMarkdown.addEventListener("click", () => {
    let md = `# 115南投國中美術班評鑑 - 訪視委員提問與建議追蹤表\n\n`;
    md += `*製表時間：${new Date().toLocaleString()}*\n\n`;
    md += `| 委員姓名 / 單位 | 評鑑維度 | 委員提問與建議意見 | 學校現場回應要點 | 後續追蹤行動與主責處室 | 狀態 |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

    evaluationRecords.forEach(r => {
      const q = r.question.replace(/\n/g, " ");
      const a = (r.response || "").replace(/\n/g, " ");
      const act = (r.action || "").replace(/\n/g, " ");
      md += `| ${r.committee} | ${r.category} | ${q} | ${a} | ${r.dept}：${act} | ${r.status} |\n`;
    });

    navigator.clipboard.writeText(md).then(() => {
      alert("✅ 已成功複製 Markdown 格式表格！您可以直接貼到 Word、HackMD 或會議記錄檔中。");
    }).catch(err => {
      console.error("Clipboard copy error:", err);
      alert("複製失敗，請手動選取文字。");
    });
  });

  // 初次渲染
  renderRecords();
});
