'use strict';

const STORAGE_KEY = 'mariospizza:last-recipe';

// Configurações fixas do método
const ROOM_TEMP_HOURS = 1; // tempo do poolish fora da geladeira antes de refrigerar
const FRIDGE_TEMP = 4;     // °C, temperatura da geladeira

const PRESETS = {
  classica: {
    label: 'Clássica',
    hydration: 60,
    salt: 2.8,
    ballWeight: 250,
    poolishPct: 30,
    poolishHours: 10, // horas na geladeira
    finalHours: 24,
    ambientTemp: 22,
  },
  contemporanea: {
    label: 'Contemporânea',
    hydration: 70,
    salt: 2.8,
    ballWeight: 270,
    poolishPct: 30,
    poolishHours: 10,
    finalHours: 24,
    ambientTemp: 22,
  },
};

const FIELDS = [
  'numPizzas',
  'ballWeight',
  'hydration',
  'salt',
  'poolishPct',
  'ambientTemp',
  'poolishHours',
  'finalHours',
];

// --- Cálculo do fermento ---
// Modelo: poolish fica 1h em temperatura ambiente + N horas na geladeira (~4°C).
// Convertemos os dois trechos em "horas equivalentes a 20°C" usando regra de
// van't Hoff aproximada (atividade do fermento dobra a cada +8°C):
//   equiv = horas × 2^((T − 20) / 8)
// Depois aplicamos a curva clássica do poolish para fermento fresco a 20°C:
//   F_fresh(t) ≈ 1.5 / t^1.1   (% sobre a farinha do poolish)
// E convertemos pra seco instantâneo dividindo por 3.
function calcEquivalentHoursAt20C(roomHours, roomTemp, fridgeHours) {
  const fromRoom = roomHours * Math.pow(2, (roomTemp - 20) / 8);
  const fromFridge = fridgeHours * Math.pow(2, (FRIDGE_TEMP - 20) / 8);
  return fromRoom + fromFridge;
}

function calcInstantYeastPct(fridgeHours, ambientTemp) {
  const equivHours = calcEquivalentHoursAt20C(ROOM_TEMP_HOURS, ambientTemp, fridgeHours);
  const freshAt20 = 1.5 / Math.pow(Math.max(equivHours, 0.5), 1.1);
  const dryPct = freshAt20 / 3;
  return Math.max(dryPct, 0.005);
}

function calcRecipe(inputs) {
  const {
    numPizzas,
    ballWeight,
    hydration,
    salt,
    poolishPct,
    ambientTemp,
    poolishHours,
  } = inputs;

  const yeastPct = calcInstantYeastPct(poolishHours, ambientTemp);

  const totalMass = numPizzas * ballWeight;

  // peso_total = farinha * (1 + H/100 + S/100 + (P * yeastPct)/10000)
  // fermento incide apenas sobre a farinha do poolish (P% da farinha total)
  const denominator = 1 + hydration / 100 + salt / 100 + (poolishPct * yeastPct) / 10000;
  const totalFlour = totalMass / denominator;

  const totalWater = totalFlour * (hydration / 100);
  const totalSalt = totalFlour * (salt / 100);

  const poolishFlour = totalFlour * (poolishPct / 100);
  const poolishWater = poolishFlour; // 100% hidratação
  const totalYeast = poolishFlour * (yeastPct / 100);

  const finalFlour = totalFlour - poolishFlour;
  const finalWater = totalWater - poolishWater;

  return {
    yeastPct,
    totalMass,
    totalFlour,
    totalWater,
    totalSalt,
    totalYeast,
    poolish: {
      flour: poolishFlour,
      water: poolishWater,
      yeast: totalYeast,
    },
    finalDough: {
      flour: finalFlour,
      water: finalWater,
      salt: totalSalt,
    },
    warnings: buildWarnings({ hydration, poolishPct, finalWater, ambientTemp, poolishHours }),
  };
}

function buildWarnings({ hydration, poolishPct, finalWater, ambientTemp, poolishHours }) {
  const w = [];
  if (finalWater < 0) {
    w.push(`O poolish está usando ${poolishPct}% da farinha, mas a hidratação total é só ${hydration}%. Não sobra água para a massa final. Reduza a % do poolish ou aumente a hidratação.`);
  } else if (finalWater >= 0 && finalWater < 5) {
    w.push('Sobra muito pouca água para a massa final. Considere reduzir a % do poolish.');
  }
  if (ambientTemp >= 30) {
    w.push('Temperatura ambiente alta — o fermento foi reduzido, mas considere encurtar a hora fora da geladeira.');
  }
  if (poolishHours < 4) {
    w.push('Menos de 4h de geladeira não é tempo suficiente para o poolish desenvolver sabor. Recomendado 6–18h.');
  }
  return w;
}

// --- Formatação ---
function fmtG(grams) {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2).replace('.', ',')} kg`;
  }
  if (grams >= 10) {
    return `${grams.toFixed(0)} g`;
  }
  return `${grams.toFixed(2).replace('.', ',')} g`;
}

function fmtHours(h) {
  if (h >= 24 && h % 24 === 0) {
    const d = h / 24;
    return `${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  return `${h}h`;
}

// --- DOM ---
function $(id) {
  return document.getElementById(id);
}

function readInputs() {
  const inputs = {};
  for (const id of FIELDS) {
    const el = $(id);
    inputs[id] = Number(el.value);
  }
  return inputs;
}

function writeInputs(values) {
  for (const id of FIELDS) {
    if (values[id] !== undefined) {
      const el = $(id);
      el.value = values[id];
      updateSliderDisplay(el);
    }
  }
}

function updateSliderDisplay(el) {
  const display = $(`${el.id}Value`);
  if (display) {
    display.textContent = el.value;
  }
  updateSliderTrack(el);
}

function updateSliderTrack(el) {
  if (el.type !== 'range') return;
  const min = Number(el.min);
  const max = Number(el.max);
  const val = Number(el.value);
  const pct = ((val - min) / (max - min)) * 100;
  el.style.setProperty('--track-pct', `${pct}%`);
}

function setActivePreset(name) {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const isActive = btn.dataset.preset === name;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
}

function applyPreset(name) {
  const p = PRESETS[name];
  if (!p) return;
  writeInputs(p);
  setActivePreset(name);
}

function renderRecipe(recipe, inputs) {
  $('result').hidden = false;

  const warningBox = $('warning');
  if (recipe.warnings.length > 0) {
    warningBox.innerHTML = recipe.warnings.map(w => `<div>⚠️ ${w}</div>`).join('');
    warningBox.hidden = false;
  } else {
    warningBox.hidden = true;
  }

  $('totalMass').textContent = fmtG(recipe.totalMass);
  $('totalFlour').textContent = fmtG(recipe.totalFlour);
  $('totalWater').textContent = fmtG(recipe.totalWater);
  $('totalSalt').textContent = fmtG(recipe.totalSalt);
  $('totalYeast').textContent = fmtG(recipe.totalYeast);

  $('poolishFlour').textContent = fmtG(recipe.poolish.flour);
  $('poolishWater').textContent = fmtG(recipe.poolish.water);
  $('poolishYeast').textContent = fmtG(recipe.poolish.yeast);
  $('poolishTimeLabel').textContent = fmtHours(inputs.poolishHours);

  $('finalFlour').textContent = fmtG(Math.max(recipe.finalDough.flour, 0));
  $('finalWater').textContent = fmtG(Math.max(recipe.finalDough.water, 0));
  $('finalSalt').textContent = fmtG(recipe.finalDough.salt);
  $('finalTimeLabel').textContent = fmtHours(inputs.finalHours);
  $('ballCountLabel').textContent = `${inputs.numPizzas} × ${inputs.ballWeight} g`;

  const now = new Date();
  $('recipeTimestamp').textContent = `Calculado em ${now.toLocaleString('pt-BR')}`;

  $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveLast(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Falha ao salvar receita:', e);
  }
}

function loadLast() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Falha ao carregar receita:', e);
    return null;
  }
}

function calculate() {
  const inputs = readInputs();
  for (const [k, v] of Object.entries(inputs)) {
    if (!Number.isFinite(v) || v <= 0) {
      alert(`Valor inválido em ${k}.`);
      return;
    }
  }
  const recipe = calcRecipe(inputs);
  renderRecipe(recipe, inputs);

  const activePreset = document.querySelector('.preset-btn.active')?.dataset.preset || 'contemporanea';
  saveLast({ preset: activePreset, inputs, timestamp: Date.now() });
}

function init() {
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => applyPreset(btn.dataset.preset));
  });

  // sliders: live-update do valor mostrado e da cor do track
  for (const id of FIELDS) {
    const el = $(id);
    if (!el) continue;
    el.addEventListener('input', () => updateSliderDisplay(el));
    updateSliderDisplay(el);
  }

  $('calcBtn').addEventListener('click', calculate);

  const last = loadLast();
  if (last && last.inputs) {
    writeInputs(last.inputs);
    if (last.preset) setActivePreset(last.preset);
    const recipe = calcRecipe(last.inputs);
    renderRecipe(recipe, last.inputs);
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  } else {
    applyPreset('contemporanea');
  }
}

document.addEventListener('DOMContentLoaded', init);
