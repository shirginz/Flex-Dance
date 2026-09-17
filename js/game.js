"use strict";

(() => {
  const { properties, defaults, levels } = window.FlexDanceData;
  const STORAGE_KEY = "flex-dance-progress-v1";
  const STORAGE_VERSION = 1;
  const TOLERANCE = 1; // CSS pixel tolerance for browser subpixel rounding.
  const $ = (id) => document.getElementById(id);
  const ui = {
    board: $("play-board"), target: $("target-board"), controls: $("property-controls"),
    form: $("controls-form"), feedback: $("feedback"), next: $("next-level"),
    check: $("check-button"), navigation: $("level-navigation"), dialog: $("finish-dialog")
  };
  let storageAvailable = true;
  let currentSolved = false;
  const selects = {};

  function createFreshState() {
    return {
      version: STORAGE_VERSION, current: 0,
      completed: levels.map(() => false), attempts: levels.map(() => 0),
      choices: levels.map(() => ({ ...defaults }))
    };
  }

  function isValidChoice(choice) {
    return choice && typeof choice === "object" && properties.every(({ key, values }) => values.includes(choice[key]));
  }

  // Reject malformed saves as a whole, including impossible unlocked-stage gaps.
  function isValidState(value) {
    if (!value || value.version !== STORAGE_VERSION || !Number.isInteger(value.current) || value.current < 0 || value.current >= levels.length) return false;
    if (![value.completed, value.attempts, value.choices].every((list) => Array.isArray(list) && list.length === levels.length)) return false;
    if (!value.completed.every((item) => typeof item === "boolean") || !value.attempts.every((item) => Number.isSafeInteger(item) && item >= 0) || !value.choices.every(isValidChoice)) return false;
    let foundUnfinished = false;
    for (const completed of value.completed) {
      if (!completed) foundUnfinished = true;
      else if (foundUnfinished) return false;
    }
    return value.completed.slice(0, value.current).every(Boolean);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return createFreshState();
      const parsed = JSON.parse(raw);
      if (isValidState(parsed)) return parsed;
      showStorageMessage("נתוני השמירה לא תקינים. נפתחה התקדמות חדשה.");
    } catch (error) {
      if (error instanceof SyntaxError) showStorageMessage("קובץ השמירה המקומי לא תקין. המשחק מתחיל מחדש.");
      else { storageAvailable = false; showStorageMessage("השמירה אינה זמינה בדפדפן הזה. אפשר לשחק, אך רענון יאפס את ההתקדמות."); }
    }
    return createFreshState();
  }

  function showStorageMessage(message) {
    $("storage-status").textContent = message;
    $("storage-status").classList.add("is-warning");
  }

  let state = loadState();

  function saveState() {
    if (!storageAvailable) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { storageAvailable = false; showStorageMessage("לא ניתן לשמור כרגע. ההתקדמות תישמר רק עד סגירת הדף או רענונו."); }
  }

  function buildControls() {
    for (const property of properties) {
      const wrapper = document.createElement("div");
      wrapper.className = "property-field";
      const label = document.createElement("label");
      label.htmlFor = property.css;
      const name = document.createElement("bdi");
      name.textContent = property.css;
      const explanation = document.createElement("span");
      explanation.textContent = property.label;
      label.append(name, explanation);
      const select = document.createElement("select");
      select.id = property.css;
      select.name = property.css;
      for (const value of property.values) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.append(option);
      }
      select.addEventListener("change", handleChoiceChange);
      selects[property.key] = select;
      wrapper.append(label, select);
      ui.controls.append(wrapper);
    }
  }

  function renderDancers(board, count) {
    const fragment = document.createDocumentFragment();
    for (let number = 1; number <= count; number += 1) {
      const dancer = document.createElement("div");
      dancer.className = "dancer";
      const illustration = document.createElement("img");
      illustration.src = "assets/dancer.svg";
      illustration.alt = "";
      illustration.className = "dancer-illustration";
      illustration.width = 32;
      illustration.height = 38;
      const badge = document.createElement("span");
      badge.className = "dancer-number";
      badge.textContent = String(number);
      dancer.append(illustration, badge);
      dancer.setAttribute("aria-label", `רקדנית ${number}`);
      fragment.append(dancer);
    }
    board.replaceChildren(fragment);
  }

  function applyProperties(board, choice) {
    for (const { key } of properties) board.style[key] = choice[key];
  }

  function readControls() {
    return Object.fromEntries(properties.map(({ key }) => [key, selects[key].value]));
  }

  function updateLiveBoard() {
    const choice = state.choices[state.current];
    applyProperties(ui.board, choice);
    $("css-preview").textContent = ["display: flex;", ...properties.map(({ key, css }) => `${css}: ${choice[key]};`)].join("\n");
    const isColumn = choice.flexDirection.startsWith("column");
    const isReverse = choice.flexDirection.endsWith("reverse");
    const direction = isColumn ? (isReverse ? "מלמטה למעלה" : "מלמעלה למטה") : (isReverse ? "מימין לשמאל" : "משמאל לימין");
    $("axis-note").textContent = `הציר הראשי: ${isColumn ? "אנכי" : "אופקי"}, ${direction}. justify-content פועל ${isColumn ? "לגובה" : "לרוחב"}; align-items פועל ${isColumn ? "לרוחב" : "לגובה"}.`;
    const overflow = ui.board.scrollWidth > ui.board.clientWidth || ui.board.scrollHeight > ui.board.clientHeight;
    $("overflow-note").textContent = overflow ? "חלק מהרקדניות מחוץ ללוח. נסי לאפשר גלישה באמצעות flex-wrap." : "כל שינוי בעמדת הכוריאוגרפיה מתעדכן כאן מיד.";
  }

  function setFeedback(message, type = "") {
    ui.feedback.textContent = message;
    ui.feedback.className = `feedback ${type}`.trim();
  }

  function clearValidation() {
    currentSolved = false;
    ui.next.disabled = true;
    ui.check.disabled = false;
    ui.board.classList.remove("is-success", "is-error");
  }

  function handleChoiceChange() {
    state.choices[state.current] = readControls();
    clearValidation();
    updateLiveBoard();
    setFeedback("הסידור השתנה. לחצי על בדיקת הסידור כדי לבדוק אותו.");
    saveState();
  }

  function isUnlocked(index) {
    return index === 0 || state.completed.slice(0, index).every(Boolean);
  }

  function renderProgress() {
    const completedCount = state.completed.filter(Boolean).length;
    $("level-counter").textContent = `שלב ${state.current + 1} מתוך ${levels.length}`;
    $("completed-count").textContent = `${completedCount} משימות הושלמו`;
    $("game-progress").max = levels.length;
    $("game-progress").value = completedCount;
    $("attempt-count").textContent = String(state.attempts[state.current]);
    // Keep existing buttons, preserving keyboard focus when a solution is checked.
    [...ui.navigation.children].forEach((button, index) => {
      button.disabled = !isUnlocked(index);
      button.classList.toggle("completed", state.completed[index]);
      if (index === state.current) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
      const status = state.completed[index] ? "הושלם" : isUnlocked(index) ? "פתוח" : "נעול";
      button.setAttribute("aria-label", `שלב ${index + 1}: ${levels[index].title.split(" / ")[1]}, ${status}`);
      button.title = `שלב ${index + 1} — ${status}`;
      button.textContent = `${index + 1}${state.completed[index] ? " ✓" : ""}`;
    });
  }

  function loadLevel(index, moveFocus = true) {
    if (!Number.isInteger(index) || index < 0 || index >= levels.length || !isUnlocked(index)) return;
    state.current = index;
    const level = levels[index];
    $("level-title").textContent = level.title;
    $("level-instruction").textContent = level.instruction;
    $("level-topic").textContent = level.topic;
    $("hint-text").textContent = level.hint;
    $("hint-text").hidden = true;
    $("hint-button").setAttribute("aria-expanded", "false");
    for (const { key } of properties) selects[key].value = state.choices[index][key];
    renderDancers(ui.board, level.count);
    renderDancers(ui.target, level.count);
    applyProperties(ui.target, level.target);
    clearValidation();
    updateLiveBoard();
    ui.next.textContent = index === levels.length - 1 ? "סיום ההופעה ✦" : "למשימה הבאה ←";
    setFeedback(state.completed[index] ? "כבר השלמת את השלב. אפשר לתרגל ולבדוק שוב, או לבחור שלב פתוח בסרגל." : "המשימה מוכנה. בחרי ערכים כדי להתחיל.");
    renderProgress();
    saveState();
    if (moveFocus) $("level-title").focus({ preventScroll: false });
  }

  function relativeBoxes(board) {
    const origin = board.getBoundingClientRect();
    return [...board.children].map((dancer) => {
      const box = dancer.getBoundingClientRect();
      return { x: box.left - origin.left, y: box.top - origin.top, width: box.width, height: box.height };
    });
  }

  // Compare actual layout, not a single literal CSS answer. This accepts equivalent
  // solutions, but rejects reordered numbered items and items outside the board.
  function layoutsMatch() {
    const actual = relativeBoxes(ui.board);
    const expected = relativeBoxes(ui.target);
    return actual.length === expected.length && actual.every((box, index) =>
      ["x", "y", "width", "height"].every((key) => Math.abs(box[key] - expected[index][key]) <= TOLERANCE)
    );
  }

  function checkSolution(event) {
    event.preventDefault();
    if (currentSolved) return;
    state.attempts[state.current] += 1;
    // Clear a prior shake before measuring positions; transforms are only feedback.
    ui.board.classList.remove("is-error");
    if (layoutsMatch()) {
      currentSolved = true;
      state.completed[state.current] = true;
      ui.board.classList.add("is-success");
      ui.next.disabled = false;
      ui.check.disabled = true;
      setFeedback(`מעולה, כל הרקדניות מוכנות! ${levels[state.current].lesson}`, "success");
      ui.next.focus({ preventScroll: true });
    } else {
      setFeedback("עוד לא: המיקום או סדר המספרים שונים מהיעד. השווי בין הלוחות, שני ערכים ונסי שוב.", "error");
      void ui.board.offsetWidth; // Restart visual feedback on consecutive attempts.
      ui.board.classList.add("is-error");
    }
    renderProgress();
    saveState();
  }

  function resetLevel() {
    state.choices[state.current] = { ...defaults };
    loadLevel(state.current, false);
    setFeedback("הערכים אופסו לברירת המחדל. מספר הניסיונות וההתקדמות הקודמת נשמרו.");
  }

  function advanceLevel() {
    if (!currentSolved) return;
    if (state.current < levels.length - 1) loadLevel(state.current + 1);
    else {
      const attempts = state.attempts.reduce((sum, count) => sum + count, 0);
      $("finish-stats").textContent = `10 משימות הושלמו · ${attempts} בדיקות סידור בסך הכול`;
      ui.dialog.showModal();
    }
  }

  function restartGame() {
    if (!window.confirm("להתחיל מחדש? כל ההתקדמות ומספרי הניסיונות בדפדפן הזה יאופסו.")) return;
    state = createFreshState();
    loadLevel(0);
  }

  function initialize() {
    buildControls();
    levels.forEach((level, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-button";
      button.addEventListener("click", () => loadLevel(index));
      ui.navigation.append(button);
    });
    ui.form.addEventListener("submit", checkSolution);
    ui.next.addEventListener("click", advanceLevel);
    $("reset-level").addEventListener("click", resetLevel);
    $("restart-game").addEventListener("click", restartGame);
    $("hint-button").addEventListener("click", () => {
      const hint = $("hint-text");
      hint.hidden = !hint.hidden;
      $("hint-button").setAttribute("aria-expanded", String(!hint.hidden));
    });
    $("close-finish").addEventListener("click", () => ui.dialog.close());
    ui.dialog.addEventListener("close", () => ui.next.focus({ preventScroll: true }));
    loadLevel(state.current, false);
  }

  initialize();
})();
