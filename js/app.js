(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const STORE = { users: "fitplan.users", session: "fitplan.session", theme: "fitplan.theme" };

  let heightUnit = "cm";
  let current = null; // last computed result
  let dietDay = todayIndex();

  // ---------- helpers ----------
  function todayIndex() { return (new Date().getDay() + 6) % 7; } // Monday = 0
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const r1 = (n) => Math.round(n * 10) / 10;
  const r0 = (n) => Math.round(n);
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  function fraction(q) {
    const whole = Math.floor(q);
    const rem = q - whole;
    if (Math.abs(rem * 4 - Math.round(rem * 4)) > 0.01) return String(r1(q));
    const part = ["", "¼", "½", "¾"][Math.round(rem * 4)];
    return (whole || !part ? String(whole) : "") + part;
  }

  function addMinutes(hhmm, mins) {
    const [h, m] = hhmm.split(":").map(Number);
    const t = (h * 60 + m + mins + 1440) % 1440;
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  }
  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
  }

  // ---------- BMI standards ----------
  const STANDARDS = {
    asian: [
      { max: 18.5, name: "Underweight", key: "under", color: "var(--under)" },
      { max: 23,   name: "Normal",      key: "normal", color: "var(--normal)" },
      { max: 27.5, name: "Overweight",  key: "over", color: "var(--over)" },
      { max: Infinity, name: "Obese",   key: "obese", color: "var(--obese)" },
    ],
    who: [
      { max: 18.5, name: "Underweight", key: "under", color: "var(--under)" },
      { max: 25,   name: "Normal",      key: "normal", color: "var(--normal)" },
      { max: 30,   name: "Overweight",  key: "over", color: "var(--over)" },
      { max: Infinity, name: "Obese",   key: "obese", color: "var(--obese)" },
    ],
  };

  // ---------- read + validate form ----------
  function readForm() {
    const p = {
      name: $("name").value.trim(),
      age: parseFloat($("age").value),
      gender: $("gender").value,
      weight: parseFloat($("weight").value),
      activity: parseFloat($("activity").value),
      level: $("level").value,
      goal: $("goal").value,
      diet: $("diet").value,
      wtime: $("wtime").value,
      standard: $("standard").value,
      heightUnit,
      feet: $("feet").value,
      inches: $("inches").value,
      heightRaw: $("height").value,
    };
    p.height = heightUnit === "cm"
      ? parseFloat(p.heightRaw)
      : (parseFloat(p.feet) || 0) * 30.48 + (parseFloat(p.inches) || 0) * 2.54;

    if (!(p.age >= 10 && p.age <= 100)) return { error: "Please enter an age between 10 and 100." };
    if (!(p.weight >= 20 && p.weight <= 300)) return { error: "Please enter a weight between 20 and 300 kg." };
    if (!(p.height >= 100 && p.height <= 250)) return { error: "Please enter a valid height (100–250 cm or 3'4\"–8'2\")." };
    return { profile: p };
  }

  // ---------- core calculations ----------
  function calculate(p) {
    const hM = p.height / 100;
    const bmi = p.weight / (hM * hM);
    const cats = STANDARDS[p.standard];
    const cat = cats.find((c) => bmi < c.max);
    const normalMax = cats[1].max - 0.1;
    const healthyLow = 18.5 * hM * hM;
    const healthyHigh = normalMax * hM * hM;
    const ideal = 21.5 * hM * hM;

    let goal = p.goal;
    if (goal === "auto") goal = cat.key === "under" ? "gain" : cat.key === "normal" ? "maintain" : "lose";

    // Mifflin-St Jeor
    const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.gender === "male" ? 5 : -161);
    const tdee = bmr * p.activity;
    const minKcal = p.gender === "male" ? 1500 : 1200;

    let target = tdee;
    if (goal === "lose") {
      const deficit = p.age < 18 ? 300 : bmi >= 30 ? 650 : 500;
      target = Math.max(tdee - deficit, minKcal);
    } else if (goal === "gain") {
      target = tdee + (p.age < 18 ? 300 : 400);
    }
    target = Math.round(target / 10) * 10;

    // weight change
    let toChange = 0;
    if (p.weight > healthyHigh) toChange = p.weight - healthyHigh;
    else if (p.weight < healthyLow) toChange = healthyLow - p.weight;
    const weeklyRate = Math.abs(target - tdee) * 7 / 7700; // kg / week
    const weeks = weeklyRate > 0.05 && toChange > 0 ? Math.ceil(toChange / weeklyRate) : 0;

    // macros
    const refWeight = goal === "lose" ? Math.min(p.weight, healthyHigh)
      : goal === "gain" ? Math.max(p.weight, healthyLow) : p.weight;
    const protPerKg = goal === "maintain" ? 1.2 : goal === "gain" ? 1.6 : 1.4;
    const protein = r0(refWeight * protPerKg);
    const fat = r0(target * 0.25 / 9);
    const carbs = Math.max(0, r0((target - protein * 4 - fat * 9) / 4));

    const water = r1(p.weight * 0.035);
    const bodyFat = clamp(1.2 * bmi + 0.23 * p.age - 10.8 * (p.gender === "male" ? 1 : 0) - 5.4, 3, 60);
    const sleep = p.age < 18 ? "8–10 h" : p.age >= 65 ? "7–8 h" : "7–9 h";
    const lowImpact = p.age >= 60 || bmi >= 30;

    return { p, bmi, cat, cats, healthyLow, healthyHigh, ideal, goal, bmr, tdee, target, toChange, weeklyRate,
      weeks, protein, fat, carbs, water, bodyFat, sleep, lowImpact };
  }

  // ---------- summary ----------
  function renderSummary(R) {
    const { p } = R;
    $("greeting").textContent = p.name ? `${p.name}'s results` : "Your results";
    $("bmiValue").textContent = r1(R.bmi);
    const badge = $("bmiCat");
    badge.textContent = R.cat.name;
    badge.style.background = R.cat.color;

    // gauge 14 → 40
    const MIN = 14, MAX = 40, span = MAX - MIN;
    let prev = MIN;
    $("gauge").innerHTML = R.cats.map((c) => {
      const end = Math.min(c.max, MAX);
      const w = ((end - prev) / span) * 100;
      prev = end;
      return `<div style="width:${w}%;background:${c.color}" title="${c.name}"></div>`;
    }).join("");
    $("gaugeLabels").innerHTML = R.cats.slice(0, 3)
      .map((c) => `<span style="left:${((c.max - MIN) / span) * 100}%">${c.max}</span>`).join("");
    $("gaugeMarker").style.left = `${((clamp(R.bmi, MIN, MAX) - MIN) / span) * 100}%`;

    // verdict
    const lo = r1(R.healthyLow), hi = r1(R.healthyHigh), diff = r1(R.toChange);
    let v;
    if (R.cat.key === "under") v = `⬇️ Your weight is <b>too low</b> for your height. You need to gain about <b>${diff} kg</b> to reach the healthy range (${lo}–${hi} kg).`;
    else if (R.cat.key === "normal") v = `✅ Your weight is <b>just right</b>. Your healthy range is <b>${lo}–${hi} kg</b>. Keep it there with a balanced diet and regular exercise.`;
    else v = `⬆️ Your weight is <b>higher than recommended</b>. You need to lose about <b>${diff} kg</b> to reach the healthy range (${lo}–${hi} kg).`;
    if (R.weeks) v += ` At a safe pace of ~${r1(R.weeklyRate)} kg/week, that takes about <b>${R.weeks} weeks</b> (≈${Math.ceil(R.weeks / 4.3)} months).`;
    $("verdict").innerHTML = v;

    const goalName = { lose: "Lose weight", gain: "Gain weight", maintain: "Maintain" }[R.goal];
    const stats = [
      ["Healthy weight", `${lo}–${hi} kg`, `Ideal ≈ ${r1(R.ideal)} kg`],
      ["Goal", goalName, p.goal === "auto" ? "Chosen from your BMI" : "Your choice"],
      ["Daily calories", `${R.target} kcal`, R.goal === "maintain" ? "To maintain" : R.goal === "lose" ? `${r0(R.tdee - R.target)} kcal deficit` : `${r0(R.target - R.tdee)} kcal surplus`],
      ["Maintenance (TDEE)", `${r0(R.tdee)} kcal`, `BMR ${r0(R.bmr)} kcal`],
      ["Water", `${R.water} L / day`, "+0.5 L on workout days"],
      ["Est. body fat", `${r1(R.bodyFat)} %`, "Estimate from BMI & age"],
      ["Sleep", R.sleep, "Every night"],
      ["Height", `${r1(p.height)} cm`, `${Math.floor(p.height / 30.48)}' ${r1((p.height / 2.54) % 12)}"`],
    ];
    $("stats").innerHTML = stats.map(([k, v, s]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div><div class="s">${s}</div></div>`).join("");

    // warnings
    const w = [];
    if (R.bmi < 16) w.push(["danger", "Your BMI is very low (below 16). Please see a doctor before you start any plan."]);
    if (R.bmi >= 35) w.push(["danger", "Your BMI is 35 or higher. Please get a medical check-up before you start. The exercise plan uses low-impact moves to protect your joints."]);
    if (p.age < 18) w.push(["warn", "For people under 18, adult BMI ranges aren't exact. Doctors use growth charts instead. Don't crash diet. Focus on healthy food and being active."]);
    if (p.age >= 60) w.push(["warn", "For age 60+, the plan uses low-impact exercises. Add balance training and check with your doctor if you have heart, joint or blood-pressure problems."]);
    if (p.goal === "lose" && R.cat.key === "under") w.push(["danger", "You're already underweight, so losing more weight isn't recommended. Choose 'Auto' or 'Gain weight'."]);
    if (p.goal === "gain" && (R.cat.key === "over" || R.cat.key === "obese")) w.push(["warn", "Your BMI is already above normal. If you want to build muscle, keep the calorie surplus small and focus on strength training."]);
    if (R.goal === "lose" && R.target <= (p.gender === "male" ? 1500 : 1200)) w.push(["warn", "Your calories are at the safe minimum. Don't eat less than this. Move more instead."]);
    $("warnings").innerHTML = w.map(([t, m]) => `<div class="alert ${t}">${m}</div>`).join("");
  }

  // ---------- diet ----------
  const MEAL_SLOTS = [
    { key: "breakfast", label: "Breakfast", share: 0.25, icon: "🍳" },
    { key: "snack",     label: "Mid-morning snack", share: 0.10, icon: "🍎", offset: 0 },
    { key: "lunch",     label: "Lunch", share: 0.30, icon: "🍛" },
    { key: "snack",     label: "Evening snack", share: 0.10, icon: "🥜", offset: 3 },
    { key: "dinner",    label: "Dinner", share: 0.25, icon: "🍲" },
  ];
  const MEAL_TIMES = {
    morning: ["07:30", "10:30", "13:00", "16:00", "19:30"],
    evening: ["07:00", "10:00", "12:30", "16:00", "19:45"],
  };

  const UNIT_SINGULAR = { slices: "slice", eggs: "egg", cups: "cup" };

  function allowed(type, diet) {
    if (diet === "n") return true;
    if (diet === "e") return type !== "n";
    return type === "v";
  }

  function roundQty(q, unit) {
    if (["cup", "bowl"].includes(unit)) return Math.max(0.25, Math.round(q * 4) / 4);
    if (["tbsp", "tsp"].includes(unit)) return Math.max(0.5, Math.round(q * 2) / 2);
    if (unit === "g") return Math.max(10, Math.round(q / 10) * 10);
    return Math.max(1, Math.round(q));
  }

  function buildMeal(option, kcalTarget) {
    // Very low-calorie items (salads, tea, sambol) are kept as is.
    // Protein-rich items are never shrunk, so cutting calories comes from rice / bread / starch.
    const fixed = (i) => i.k <= 40;
    const proteinRich = (i) => (i.p * 4) / i.k >= 0.3;
    const base = option.items.reduce((s, i) => s + i.k, 0);
    const factor = clamp(kcalTarget / base, 0.5, 2.2);
    const protFactor = Math.max(1, factor);
    const lockedKcal = option.items.reduce((s, i) => s + (fixed(i) ? i.k : proteinRich(i) ? i.k * protFactor : 0), 0);
    const flexBase = option.items.reduce((s, i) => s + (!fixed(i) && !proteinRich(i) ? i.k : 0), 0);
    const flexFactor = flexBase ? clamp((kcalTarget - lockedKcal) / flexBase, 0.4, 2.2) : 1;
    const items = option.items.map((i) => {
      const q = fixed(i) ? i.q : roundQty(i.q * (proteinRich(i) ? protFactor : flexFactor), i.u);
      const ratio = q / i.q;
      return { ...i, q, k: r0(i.k * ratio), p: r1(i.p * ratio) };
    });
    return { name: option.name, items, kcal: items.reduce((s, i) => s + i.k, 0), protein: items.reduce((s, i) => s + i.p, 0) };
  }

  function dayMeals(R, day) {
    return MEAL_SLOTS.map((slot, idx) => {
      const options = MEALS[slot.key].filter((o) => allowed(o.t, R.p.diet));
      const opt = options[(day * 2 + (slot.offset || 0) + idx) % options.length];
      return { slot, time: MEAL_TIMES[R.p.wtime][idx], ...buildMeal(opt, R.target * slot.share) };
    });
  }

  function renderDiet(R) {
    $("dietDays").innerHTML = DAYS.map((d, i) =>
      `<button type="button" data-day="${i}" class="${i === dietDay ? "active" : ""}">${d.slice(0, 3)}</button>`).join("");

    const meals = dayMeals(R, dietDay);
    const total = meals.reduce((s, m) => s + m.kcal, 0);
    const prot = meals.reduce((s, m) => s + m.protein, 0);

    $("macros").innerHTML = [
      ["Target calories", `${R.target} kcal`],
      ["This day's menu", `≈ ${total} kcal`],
      ["Protein (aim)", `${R.protein} g (menu ≈ ${r0(prot)} g)`],
      ["Carbohydrates", `${R.carbs} g`],
      ["Fat", `${R.fat} g`],
      ["Water", `${R.water} L`],
    ].map(([k, v]) => `<div class="macro"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");

    $("meals").innerHTML = meals.map((m) => `
      <article class="meal">
        <div class="meal-head">
          <h3>${m.slot.icon} ${m.slot.label}</h3>
          <span class="meal-time">${fmtTime(m.time)}</span>
        </div>
        <p class="meal-name">${esc(m.name)}</p>
        <ul>${m.items.map((i) => `<li>${fraction(i.q)} ${i.q <= 1 ? (UNIT_SINGULAR[i.u] || i.u) : i.u} –${esc(i.f)} <span class="kc">(${i.k} kcal)</span></li>`).join("")}</ul>
        <div class="meal-total">≈ ${m.kcal} kcal · ${r0(m.protein)} g protein</div>
      </article>`).join("");

    const tips = {
      lose: [
        "Fill half your plate with vegetables and greens (gotukola, mukunuwenna, kankun).",
        "Use red rice, kurakkan or wholemeal instead of white rice, white bread or noodles.",
        "Avoid sugary tea, soft drinks, short eats (rolls, patties), and deep-fried food.",
        "Use less thick coconut milk. Make curries with thin milk or none.",
        "Finish dinner at least 2–3 hours before bed.",
      ],
      gain: [
        "Eat every 3 hours and don't skip meals. Add an extra snack before bed if you're still hungry (milk + peanuts).",
        "Add healthy calorie-dense foods: peanuts, cashews, bananas, dates, eggs, milk and curd.",
        "Eat protein at every meal to build muscle, not just fat.",
        "Drink milk or a smoothie after workouts.",
        "Don't gain weight with junk food. Use whole foods.",
      ],
      maintain: [
        "Keep your portions steady and weigh yourself once a week.",
        "Eat a mix of grains, protein, vegetables and fruit every day.",
        "Limit sugar, salt and fried food. Treat foods are fine once a week.",
        "Eat at regular times so you don't get too hungry.",
      ],
    }[R.goal];
    $("dietTips").innerHTML = `<h3>Diet tips</h3><ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  }

  // ---------- workout ----------
  const LEVELS = {
    beginner:     { sets: 2, reps: "10–12", hold: "20–30 s", cardio: 20 },
    intermediate: { sets: 3, reps: "12–15", hold: "40 s",    cardio: 30 },
    advanced:     { sets: 4, reps: "15–20", hold: "60 s",    cardio: 40 },
  };
  const BEGINNER_SWAP = { pushup: "kneePush", jog: "walkJog", hiit: "walkJog", skip: "walkJog", burpee: "squat", dips: "curl", climber: "plank" };

  // c(key, minutes) = cardio / mobility, s(key) = strength exercise
  const c = (key, min) => ({ key, min });
  const s = (key) => ({ key });

  function weekTemplate(goal, L) {
    const cm = L.cardio;
    if (goal === "lose") return [
      { title: "Cardio + core", type: "Cardio", main: [c("jog", cm + 10)], extra: [s("plank"), s("crunch"), s("birdDog")] },
      { title: "Full-body strength", type: "Strength", main: [s("squat"), s("pushup"), s("lunge"), s("row"), s("bridge"), s("plank")] },
      { title: "Steady cardio", type: "Cardio", main: [c("cycle", cm + 15)], extra: [c("stretch", 10)] },
      { title: "Full-body strength", type: "Strength", main: [s("deadlift"), s("press"), s("squat"), s("pushup"), s("climber"), s("legRaise")] },
      { title: "Fat-burn intervals", type: "HIIT", main: [c("hiit", Math.max(15, cm - 5)), c("skip", 5)], extra: [s("plank"), s("bridge")] },
      { title: "Active day", type: "Active", main: [c("walk", 45), c("swim", 20)], extra: [c("stretch", 10)] },
      { title: "Rest & recovery", type: "Rest", main: [c("yoga", 20)], rest: true },
    ];
    if (goal === "gain") return [
      { title: "Upper body", type: "Strength", main: [s("benchPress"), s("row"), s("press"), s("pushup"), s("curl"), s("dips")] },
      { title: "Lower body", type: "Strength", main: [s("squat"), s("deadlift"), s("lunge"), s("bridge"), s("calf"), s("legRaise")] },
      { title: "Active recovery", type: "Light", main: [c("walk", 20), c("yoga", 20)], rest: true },
      { title: "Upper body", type: "Strength", main: [s("pushup"), s("row"), s("benchPress"), s("press"), s("curl"), s("plank")] },
      { title: "Lower body + core", type: "Strength", main: [s("squat"), s("deadlift"), s("lunge"), s("calf"), s("plank"), s("birdDog")] },
      { title: "Light cardio", type: "Cardio", main: [c("cycle", 20)], extra: [c("stretch", 15)] },
      { title: "Rest", type: "Rest", main: [c("stretch", 10)], rest: true },
    ];
    return [
      { title: "Full-body strength", type: "Strength", main: [s("squat"), s("pushup"), s("row"), s("lunge"), s("plank")] },
      { title: "Cardio", type: "Cardio", main: [c("jog", cm + 10)], extra: [s("crunch")] },
      { title: "Yoga & mobility", type: "Mobility", main: [c("yoga", 30)], extra: [s("birdDog")] },
      { title: "Full-body strength", type: "Strength", main: [s("deadlift"), s("press"), s("bridge"), s("benchPress"), s("climber")] },
      { title: "Cardio intervals", type: "Cardio", main: [c("cycle", cm), c("skip", 5)] },
      { title: "Sport / outdoor", type: "Active", main: [c("walk", 45)], extra: [c("stretch", 10)] },
      { title: "Rest", type: "Rest", main: [c("stretch", 10)], rest: true },
    ];
  }

  function pick(key, R) {
    let k = key;
    if (R.p.level === "beginner" && BEGINNER_SWAP[k]) k = BEGINNER_SWAP[k];
    if (R.lowImpact && LOW_IMPACT_SWAP[k]) k = LOW_IMPACT_SWAP[k];
    return k;
  }

  function buildSession(day, R, L) {
    const repsText = R.goal === "gain" ? "8–12 (heavier)" : L.reps;
    const sets = R.goal === "gain" && R.p.level !== "beginner" ? L.sets + 1 : L.sets;
    const lines = [];
    const used = new Set();
    let minutes = 0, kcal = 0;
    const kcalFor = (met, min) => (met * R.p.weight * min) / 60;

    const add = (item, block) => {
      const k = pick(item.key, R);
      if (used.has(k)) return; // a swap can turn two moves into the same one
      used.add(k);
      const ex = EXERCISES[k];
      let detail, min;
      if (item.min) { min = item.min; detail = `${min} min`; }
      else if (ex.timed) { min = sets * 1.5; detail = `${sets} × ${L.hold}`; }
      else { min = sets * 1.75; detail = `${sets} × ${repsText}`; }
      minutes += min;
      kcal += kcalFor(ex.met, min);
      lines.push({ block, name: ex.name, detail, video: EXERCISE_VIDEOS[k] });
    };

    if (!day.rest) {
      lines.push({ block: "Warm-up", name: "Marching on the spot + joint rotations", detail: "5 min", video: EXERCISE_VIDEOS.warmup });
      minutes += 5; kcal += kcalFor(3.5, 5);
    }
    day.main.forEach((i) => add(i, day.rest ? "Light" : "Main workout"));
    (day.extra || []).forEach((i) => add(i, EXERCISES[i.key].kind === "mobility" ? "Cool-down" : "Core / finisher"));
    if (!day.rest && !(day.extra || []).some((i) => EXERCISES[i.key].kind === "mobility")) {
      lines.push({ block: "Cool-down", name: "Stretching (hamstrings, chest, shoulders)", detail: "5 min", video: EXERCISE_VIDEOS.cooldown });
      minutes += 5; kcal += kcalFor(2.3, 5);
    }
    return { lines, minutes: Math.round(minutes / 5) * 5, kcal: r0(kcal) };
  }

  function workoutStart(R) { return R.p.wtime === "morning" ? "06:00" : "17:30"; }

  function renderWorkout(R) {
    const L = LEVELS[R.p.level];
    const week = weekTemplate(R.goal, L);
    const start = workoutStart(R);
    const today = todayIndex();
    let weekKcal = 0;

    $("week").innerHTML = week.map((day, i) => {
      const sess = buildSession(day, R, L);
      weekKcal += sess.kcal;
      let lastBlock = "";
      const rows = sess.lines.map((l) => {
        const head = l.block !== lastBlock ? `<div class="ex-block">${l.block}</div>` : "";
        lastBlock = l.block;
        return `${head}<div class="ex">${l.video ? `<button type="button" class="ex-play" data-video="${l.video}" data-title="${esc(l.name)}" title="Watch how to do it"><span class="play">▶</span>${l.name}</button>` : `<span>${l.name}</span>`}<span class="d">${l.detail}</span></div>`;
      }).join("");
      return `
        <article class="day ${i === today ? "today" : ""}">
          <div class="day-head"><h3>${DAYS[i]}${i === today ? " · Today" : ""}</h3><span class="day-type">${day.type}</span></div>
          <div class="day-meta">${day.title} · ⏰ ${fmtTime(start)} – ${fmtTime(addMinutes(start, sess.minutes))} · ${sess.minutes} min · 🔥 ~${sess.kcal} kcal</div>
          ${rows}
        </article>`;
    }).join("");

    const goalText = { lose: "burn fat and keep muscle", gain: "build muscle and healthy weight", maintain: "stay fit and keep your weight steady" }[R.goal];
    $("workoutIntro").innerHTML =
      `${R.p.level === "intermediate" ? "An" : "A"} ${R.p.level} plan to <b>${goalText}</b>. Workouts start at <b>${fmtTime(start)}</b>. ` +
      `This week you'll burn about <b>${weekKcal} kcal</b> from exercise. Rest 45–90 s between sets.` +
      (R.lowImpact ? " <b>Low-impact moves</b> are used to protect your joints." : "");

    const tips = [
      "Go slowly at first. Good form matters more than speed or heavy weights.",
      "Use the 'talk test' for cardio. You should be able to talk, but not sing.",
      `Drink about ${r1(R.water + 0.5)} L of water on workout days.`,
      "Make it harder every 2 weeks: add 1 set, add 2–3 reps, or add 5 min of cardio.",
      "Stop right away if you feel chest pain, dizziness or sharp joint pain.",
    ];
    if (R.goal === "gain") tips.unshift("Use dumbbells or gym machines heavy enough that the last 2 reps are hard.");
    if (R.goal === "lose") tips.unshift("Walk for 10 minutes after lunch and dinner. It helps with blood sugar and fat loss.");
    $("workoutTips").innerHTML = `<h3>Exercise tips</h3><ul>${tips.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  }

  // ---------- daily timetable ----------
  function renderTimeline(R) {
    const L = LEVELS[R.p.level];
    const week = weekTemplate(R.goal, L);
    const today = week[todayIndex()];
    const sess = buildSession(today, R, L);
    const meals = dayMeals(R, todayIndex());
    const start = workoutStart(R);
    const morning = R.p.wtime === "morning";
    const workout = [start, "🏋️ Workout", `${today.title} · ${sess.minutes} min (see Exercise plan)`];

    const items = [
      [morning ? "05:30" : "06:00", "⏰ Wake up", "Drink 1–2 glasses of water"],
      ...(morning ? [workout] : []),
      ...meals.map((m) => [m.time, `${m.slot.icon} ${m.slot.label}`, `${m.name} · ≈ ${m.kcal} kcal`]),
      [addMinutes(meals[2].time, 30), "🚶 Short walk", "10 min walk after lunch"],
      ...(morning ? [] : [workout]),
      ["21:00", "📵 Screen off", "Relax, light stretching, no heavy food"],
      [morning ? "22:00" : "22:30", "😴 Sleep", `Aim for ${R.sleep} of sleep`],
    ].sort((a, b) => a[0].localeCompare(b[0]));

    // spread water reminders through the day
    const glasses = Math.round((R.water * 1000) / 250);
    items.push(["", "💧 Water", `${R.water} L total ≈ ${glasses} glasses. Drink one glass every 1–1.5 hours.`]);

    $("timeline").innerHTML = items.map(([t, what, note]) =>
      `<li><span class="t">${t ? fmtTime(t) : "All day"}</span><span class="dot"></span><span class="what"><b>${what}</b><span>${esc(note)}</span></span></li>`).join("");
  }

  // ---------- progress ----------
  function renderProgress() {
    const hist = getHistory();
    if (!hist.length) {
      $("chart").innerHTML = "";
      $("history").innerHTML = `<p class="muted">No saved entries yet.</p>`;
      return;
    }
    const first = hist[0].weight;
    $("history").innerHTML = `<table><thead><tr><th>Date</th><th>Weight</th><th>BMI</th><th>Status</th><th>Change</th><th></th></tr></thead><tbody>${
      hist.map((h, i) => `<tr><td>${esc(h.date)}</td><td>${h.weight} kg</td><td>${h.bmi}</td><td>${esc(h.cat)}</td>
        <td>${i ? (h.weight - first > 0 ? "+" : "") + r1(h.weight - first) + " kg" : "–"}</td>
        <td><button data-del="${i}" aria-label="Delete entry">✕</button></td></tr>`).join("")
    }</tbody></table>`;

    if (hist.length < 2) { $("chart").innerHTML = ""; return; }
    const W = 600, H = 160, pad = 28;
    const ws = hist.map((h) => h.weight);
    const min = Math.min(...ws) - 1, max = Math.max(...ws) + 1;
    const x = (i) => pad + (i * (W - pad * 2)) / (hist.length - 1);
    const y = (v) => H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    const pts = ws.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    $("chart").innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Weight over time">
      <polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round" />
      ${ws.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="var(--accent)"><title>${hist[i].date}: ${v} kg</title></circle>
        <text x="${x(i)}" y="${y(v) - 10}" font-size="11" text-anchor="middle" fill="var(--muted)">${v}</text>`).join("")}
    </svg>`;
  }

  // ---------- orchestration ----------
  function generate(p) {
    current = calculate(p);
    renderSummary(current);
    renderDiet(current);
    renderWorkout(current);
    renderTimeline(current);
    renderProgress();
    $("results").classList.remove("hidden");
    animateResults();
  }

  // ---------- animations (see fx.js) ----------
  function animateResults() {
    FX.enter("#summaryCard", { y: 30 });
    FX.countUp($("bmiValue"), current.bmi, 1);
    FX.pop($("bmiCat"));
    FX.growX("#gauge div", { delay: 0.15 });
    FX.slideLeft($("gaugeMarker"), $("gaugeMarker").style.left);
    FX.enter("#verdict", { y: 12, delay: 0.25 });
    FX.stagger("#stats .stat", { delay: 0.3, gap: 0.04 });
    FX.stagger("#warnings .alert", { x: -16, y: 0, delay: 0.5 });
    FX.stagger(".tabs .tab", { y: 10, delay: 0.35 });
    animatePanel(document.querySelector(".tab-panel:not(.hidden)"));
  }

  function animatePanel(panel) {
    if (!panel) return;
    FX.enter(panel, { y: 18, duration: 0.4 });
    if (panel.id === "tab-diet") animateDiet();
    if (panel.id === "tab-schedule") FX.stagger("#timeline li", { x: -20, y: 0, gap: 0.04, delay: 0.1 });
    if (panel.id === "tab-progress") {
      FX.draw(document.querySelector("#chart polyline"));
      FX.stagger("#chart circle, #chart text", { y: 6, gap: 0.03, delay: 0.4 });
      FX.stagger("#history tbody tr", { x: -12, y: 0, gap: 0.04, delay: 0.1 });
    }
    FX.reveal(panel.querySelectorAll(".day, .tips"));
  }

  function animateDiet() {
    FX.stagger("#macros .macro", { y: 10, gap: 0.03 });
    FX.stagger("#meals .meal", { y: 20, gap: 0.07, delay: 0.1 });
  }

  function setHeightUnit(unit) {
    heightUnit = unit;
    document.querySelectorAll(".seg button").forEach((b) => b.classList.toggle("active", b.dataset.unit === unit));
    $("heightCm").classList.toggle("hidden", unit !== "cm");
    $("heightFt").classList.toggle("hidden", unit !== "ft");
  }

  function fillForm(p) {
    ["name", "age", "gender", "weight", "activity", "level", "goal", "diet", "wtime", "standard"].forEach((k) => {
      if (p[k] !== undefined && $(k)) $(k).value = p[k];
    });
    setHeightUnit(p.heightUnit || "cm");
    $("height").value = p.heightRaw || "";
    $("feet").value = p.feet || "";
    $("inches").value = p.inches || "";
  }

  function applyTheme(t) { document.documentElement.dataset.theme = t; }

  // ---------- events ----------
  $("profileForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const { profile, error } = readForm();
    $("formError").textContent = error || "";
    if (error) { FX.shake($("formCard")); return; }
    updateUser((u) => { u.profile = profile; });
    generate(profile);
    $("formCard").classList.add("hidden");
    $("summaryCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("resetBtn").addEventListener("click", () => {
    $("profileForm").reset();
    setHeightUnit("cm");
    $("formError").textContent = "";
  });

  $("editBtn").addEventListener("click", () => {
    const u = currentUser();
    if (u && u.profile) fillForm(u.profile);
    $("cancelEdit").classList.remove("hidden");
    $("formCard").classList.remove("hidden");
    animateForm();
    $("formCard").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  function animateForm() {
    FX.enter($("formCard"), { y: 24 });
    FX.stagger("#profileForm .grid > *", { y: 12, gap: 0.03, delay: 0.1 });
  }

  $("cancelEdit").addEventListener("click", () => {
    $("formError").textContent = "";
    $("formCard").classList.add("hidden");
  });

  document.querySelectorAll(".seg button").forEach((b) => b.addEventListener("click", () => {
    const cm = heightUnit === "cm" ? parseFloat($("height").value) : null;
    const ftIn = heightUnit === "ft" ? (parseFloat($("feet").value) || 0) * 30.48 + (parseFloat($("inches").value) || 0) * 2.54 : null;
    setHeightUnit(b.dataset.unit);
    FX.enter(b.dataset.unit === "cm" ? $("heightCm") : $("heightFt"), { y: 0, x: 10, duration: 0.3 });
    // convert the value already typed
    if (b.dataset.unit === "ft" && cm) {
      const totalIn = cm / 2.54;
      $("feet").value = Math.floor(totalIn / 12);
      $("inches").value = r1(totalIn % 12);
    } else if (b.dataset.unit === "cm" && ftIn) {
      $("height").value = r1(ftIn);
    }
  }));

  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("active", x === t));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("hidden", p.id !== `tab-${t.dataset.tab}`));
    FX.bump(t);
    animatePanel($(`tab-${t.dataset.tab}`));
  }));

  $("dietDays").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-day]");
    if (!b || !current) return;
    dietDay = Number(b.dataset.day);
    renderDiet(current);
    FX.bump(document.querySelector(`#dietDays button[data-day="${dietDay}"]`));
    animateDiet();
  });

  $("saveBtn").addEventListener("click", () => {
    if (!current) return;
    const hist = getHistory();
    hist.push({
      date: new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
      weight: current.p.weight, bmi: r1(current.bmi), cat: current.cat.name,
    });
    setHistory(hist);
    renderProgress();
    $("saveBtn").textContent = "Saved ✓";
    FX.pop($("saveBtn"));
    FX.stagger("#history tbody tr:last-child", { x: -16, y: 0 });
    FX.draw(document.querySelector("#chart polyline"), { duration: 0.6 });
    setTimeout(() => ($("saveBtn").textContent = "Save to progress"), 1500);
  });

  $("history").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-del]");
    if (!b) return;
    const hist = getHistory();
    hist.splice(Number(b.dataset.del), 1);
    setHistory(hist);
    renderProgress();
  });

  $("clearHistory").addEventListener("click", () => {
    if (!confirm("Delete all saved progress?")) return;
    setHistory([]);
    renderProgress();
  });

  $("printBtn").addEventListener("click", () => window.print());

  // ---------- exercise videos ----------
  const dialog = $("videoDialog");
  function openVideo(id, title) {
    $("videoTitle").textContent = title;
    $("videoLink").href = `https://www.youtube.com/watch?v=${id}`;
    // YouTube blocks embedded players on pages opened straight from disk (file://),
    // so show a clickable thumbnail there instead of the player.
    $("videoFrame").innerHTML = location.protocol === "file:"
      ? `<a class="video-thumb" href="https://www.youtube.com/watch?v=${id}" target="_blank" rel="noopener">
           <img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" /><span>▶</span></a>`
      : `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${esc(title)}"
           allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    dialog.showModal();
    FX.dialogIn(dialog);
  }
  $("week").addEventListener("click", (e) => {
    const b = e.target.closest(".ex-play");
    if (b) openVideo(b.dataset.video, b.dataset.title);
  });
  $("videoClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { $("videoFrame").innerHTML = ""; }); // stops playback

  $("themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    FX.spin($("themeBtn"));
    store.set(STORE.theme, next);
  });

  // ---------- accounts ----------
  // Accounts live in this browser's localStorage. Passwords are never stored:
  // only a salted PBKDF2 hash is kept.
  let authMode = "login";
  const getUsers = () => store.get(STORE.users, {});
  const saveUsers = (u) => store.set(STORE.users, u);
  const sessionKey = () => store.get(STORE.session, null);
  function currentUser() { const k = sessionKey(); return k ? getUsers()[k] || null : null; }
  function updateUser(fn) {
    const users = getUsers(), k = sessionKey();
    if (!users[k]) return;
    fn(users[k]);
    saveUsers(users);
  }
  function getHistory() { const u = currentUser(); return (u && u.history) || []; }
  function setHistory(h) { updateUser((u) => { u.history = h; }); }

  const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  async function hashPassword(password, saltHex) {
    const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)));
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, key, 256);
    return toHex(bits);
  }

  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    document.querySelectorAll(".auth-tabs button").forEach((b) => b.classList.toggle("active", b.dataset.auth === mode));
    $("confirmWrap").classList.toggle("hidden", !signup);
    $("authTitle").textContent = signup ? "Create your account" : "Welcome back";
    $("authSub").textContent = signup ? "Sign up, then fill in your details to get your plan." : "Log in to see your plan.";
    $("authSubmit").textContent = signup ? "Sign up" : "Log in";
    $("authPass").autocomplete = signup ? "new-password" : "current-password";
    $("authError").textContent = "";
    if (signup) FX.enter($("confirmWrap"), { y: -8, duration: 0.3 });
    FX.enter([$("authTitle"), $("authSub")], { y: 6, duration: 0.3 });
  }

  document.querySelectorAll(".auth-tabs button").forEach((b) => b.addEventListener("click", () => setAuthMode(b.dataset.auth)));

  $("authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = $("authUser").value.trim();
    const key = username.toLowerCase();
    const pass = $("authPass").value;
    const err = (m) => { $("authError").textContent = m; if (m) FX.shake($("authCard")); };

    if (!window.crypto || !crypto.subtle) return err("Login needs a secure page. Open the app from localhost or https.");
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) return err("Username must be 3–30 letters, numbers, _ . or -");
    if (pass.length < 6) return err("Password must be at least 6 characters.");

    const users = getUsers();
    if (authMode === "signup") {
      if (users[key]) return err("That username is taken. Try another, or log in.");
      if (pass !== $("authPass2").value) return err("Passwords don't match.");
      const salt = toHex(crypto.getRandomValues(new Uint8Array(16)));
      users[key] = { username, salt, hash: await hashPassword(pass, salt), created: Date.now(), profile: null, history: [] };
      saveUsers(users);
    } else {
      const u = users[key];
      if (!u || (await hashPassword(pass, u.salt)) !== u.hash) return err("Wrong username or password.");
    }
    store.set(STORE.session, key);
    $("authForm").reset();
    err("");
    showApp();
  });

  $("logoutBtn").addEventListener("click", () => {
    try { localStorage.removeItem(STORE.session); } catch { /* ignore */ }
    current = null;
    showApp();
  });

  // Decide what to show: login screen, empty details form, or the user's saved plan.
  function showApp() {
    const u = currentUser();
    $("authCard").classList.toggle("hidden", !!u);
    $("userBox").classList.toggle("hidden", !u);
    $("profileForm").reset();
    setHeightUnit("cm");
    $("formError").textContent = "";
    $("cancelEdit").classList.add("hidden");
    $("results").classList.add("hidden");
    $("formCard").classList.add("hidden");
    if (!u) {
      setAuthMode("login");
      FX.enter($("authCard"), { y: 30, scale: 0.97 });
      FX.stagger("#authCard .auth-tabs, #authForm > *", { y: 10, gap: 0.05, delay: 0.15 });
      return;
    }
    FX.enter($("userBox"), { x: 20, y: 0 });

    $("userName").textContent = u.username;
    $("userAvatar").textContent = u.username.charAt(0);
    if (u.profile) {
      fillForm(u.profile);
      const { profile } = readForm();
      if (profile) { generate(profile); return; }
    }
    $("name").value = u.username;
    $("formCard").classList.remove("hidden");
    animateForm();
  }

  // ---------- init ----------
  applyTheme(store.get(STORE.theme, null) || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  // remove data saved by the old single-user version
  try { localStorage.removeItem("fitplan.profile"); localStorage.removeItem("fitplan.history"); } catch { /* ignore */ }
  showApp();
})();
