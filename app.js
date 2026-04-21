const app = document.getElementById("app");
const bottomNav = document.getElementById("bottom-nav");
const screenTitle = document.getElementById("screen-title");
const screenSubtitle = document.getElementById("screen-subtitle");
const headerHomeBtn = document.getElementById("header-home-btn");

const MIN_INGREDIENTS = 3;
const BEST_RANGE = [4, 6];

const state = {
  profile: null,
  inventory: [],
  todaysPlan: null,
  currentRecipe: null,
  route: "home",
  ingredientFeedback: "",
  generationState: { kind: "idle", message: "" },
};

const POPULAR_INGREDIENT_GROUPS = [
  { label: "Protein", items: ["eggs", "chicken", "tofu", "tuna"] },
  { label: "Carbs", items: ["rice", "pasta", "udon", "oats"] },
  { label: "Vegetables", items: ["cabbage", "carrot", "frozen veg", "green onion"] },
  { label: "Dairy", items: ["milk", "yogurt", "cheese"] },
];

const INGREDIENT_ALTERNATIVES = {
  chicken: ["tofu", "eggs", "tuna", "beans"],
  beef: ["chicken", "tofu", "eggs"],
  salmon: ["tuna", "mackerel", "eggs"],
  milk: ["soy milk", "yogurt", "water + egg"],
  spinach: ["cabbage", "frozen veg", "lettuce"],
  broccoli: ["cabbage", "carrot", "frozen veg"],
};

const MEAL_LIBRARY = {
  breakfast: [
    {
      title: "Microwave Egg Rice Bowl",
      ingredients: ["eggs", "rice", "soy sauce", "green onion"],
      steps: ["Beat eggs in a bowl and microwave for 1 minute.", "Heat rice and top with eggs.", "Add soy sauce and chopped green onion."],
      cookMin: 8,
      kcal: 430,
      protein: 21,
      image: "https://images.unsplash.com/photo-1569058242403-c6734ce0f1a6?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Overnight Oats Student Mix",
      ingredients: ["oats", "milk", "banana", "peanut butter"],
      steps: ["Mix oats and milk in a container.", "Add sliced banana and peanut butter.", "Rest 5+ hours in fridge, serve cold."],
      cookMin: 5,
      kcal: 390,
      protein: 14,
      image: "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  lunch: [
    {
      title: "One-Pan Chicken Veg Rice",
      ingredients: ["chicken", "rice", "frozen veg", "salt", "pepper"],
      steps: ["Cook chicken in a pan with salt and pepper.", "Add frozen veg and stir 3 minutes.", "Serve over warm rice."],
      cookMin: 18,
      kcal: 620,
      protein: 38,
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Tofu Kimchi Rice",
      ingredients: ["tofu", "kimchi", "rice", "sesame oil"],
      steps: ["Pan-fry tofu until golden.", "Add kimchi and stir-fry 2 minutes.", "Top rice with tofu kimchi mix and sesame oil."],
      cookMin: 15,
      kcal: 560,
      protein: 25,
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    },
  ],
  dinner: [
    {
      title: "Tuna Pasta Bowl",
      ingredients: ["pasta", "tuna", "olive oil", "garlic", "cabbage"],
      steps: ["Boil pasta and reserve some pasta water.", "Saute garlic and cabbage in olive oil.", "Add tuna and pasta, toss with pasta water."],
      cookMin: 20,
      kcal: 590,
      protein: 32,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
    },
    {
      title: "Simple Chicken Soup Udon",
      ingredients: ["chicken", "udon", "carrot", "soy sauce", "egg"],
      steps: ["Boil chicken and carrot in water for 8 minutes.", "Add udon and soy sauce.", "Drop egg and simmer for 2 minutes."],
      cookMin: 22,
      kcal: 540,
      protein: 34,
      image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=1200&q=80",
    },
  ],
};

function cloneTemplate(id) {
  return document.getElementById(id).content.cloneNode(true);
}
function normalizeIngredient(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
function cleanIngredient(name) {
  const alias = { egg: "eggs", vegetables: "frozen veg", veggie: "frozen veg", noodles: "udon", noodle: "udon", oat: "oats" };
  const n = normalizeIngredient(name);
  return alias[n] || n;
}
function setRoute(route) {
  state.route = route === "plan" && !state.todaysPlan ? "inventory" : route;
  if (route !== "recipe") state.currentRecipe = null;
  render();
}
function calculateGoalDirection() {
  if (!state.profile) return "maintain";
  const diff = state.profile.targetWeight - state.profile.currentWeight;
  if (Math.abs(diff) < 0.5) return "maintain";
  return diff < 0 ? "lose" : "gain";
}

function render() {
  app.innerHTML = "";
  renderHeader();
  renderBottomNav();
  if (state.route === "recipe" && state.currentRecipe) return renderRecipeDetail(state.currentRecipe);
  if (state.route === "inventory") return renderInventory();
  if (state.route === "plan") return renderPlan();
  if (state.route === "onboarding") return renderOnboarding();
  return renderHome();
}

function renderHeader() {
  const meta = {
    home: { title: "Home", subtitle: "Best possible meals from your ingredients." },
    onboarding: { title: "Setup", subtitle: "Tell us your goal once." },
    inventory: { title: "Inventory", subtitle: "Add 3 minimum, 4-6 recommended." },
    plan: { title: "Today's Plan", subtitle: "Exact match if possible, fallback when needed." },
    recipe: { title: "Recipe", subtitle: "Cook with substitutes and clear guidance." },
  };
  const current = meta[state.route] || meta.home;
  screenTitle.textContent = current.title;
  screenSubtitle.textContent = current.subtitle;
  headerHomeBtn.style.display = state.route === "home" ? "none" : "inline-flex";
}

function renderBottomNav() {
  bottomNav.innerHTML = "";
  [
    { id: "home", label: "Home" },
    { id: "inventory", label: "Inventory" },
    { id: "plan", label: "Today Plan" },
  ].forEach((tab) => {
    const button = document.createElement("button");
    button.className = `tab-btn ${state.route === tab.id ? "active" : ""}`;
    button.textContent = tab.label;
    button.addEventListener("click", () => setRoute(tab.id));
    bottomNav.appendChild(button);
  });
}
headerHomeBtn.addEventListener("click", () => setRoute("home"));

function renderHome() {
  const hasPlan = Boolean(state.todaysPlan);
  const section = document.createElement("section");
  section.className = "hero";
  section.innerHTML = `
    <h2>Eat better with zero daily overthinking.</h2>
    <p class="muted">We generate a practical 1-day plan from your ingredients and gracefully fallback when exact recipes are not possible.</p>
    <div class="home-grid">
      <div class="mini-card"><h4>Inventory count</h4><p>${state.inventory.length} items</p></div>
      <div class="mini-card"><h4>Today's plan</h4><p>${hasPlan ? "Generated" : "Not yet"}</p></div>
      <div class="mini-card"><h4>Ready to generate</h4><p>${state.inventory.length >= MIN_INGREDIENTS ? "Yes" : "Need more ingredients"}</p></div>
      <div class="mini-card steps-card"><h4>3-step flow</h4><ol><li>Add ingredients</li><li>Generate plan</li><li>Cook with substitutes if needed</li></ol></div>
    </div>
    <div class="home-actions">
      <button class="btn primary" id="start-setup">Start setup</button>
      <button class="btn secondary" id="edit-inventory">Edit ingredients</button>
      <button class="btn ghost" id="view-plan">View today's plan</button>
    </div>`;
  section.querySelector("#start-setup").addEventListener("click", () => setRoute("onboarding"));
  section.querySelector("#edit-inventory").addEventListener("click", () => setRoute(state.profile ? "inventory" : "onboarding"));
  section.querySelector("#view-plan").addEventListener("click", () => setRoute(state.todaysPlan ? "plan" : "inventory"));
  app.appendChild(section);
}

function renderOnboarding() {
  const node = cloneTemplate("onboarding-template");
  node.getElementById("onboarding-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    state.profile = {
      currentWeight: Number(data.get("currentWeight")),
      targetWeight: Number(data.get("targetWeight")),
      targetWeeks: Number(data.get("targetWeeks")),
      lifestyle: String(data.get("lifestyle")),
      cookTime: Number(data.get("cookTime")),
    };
    setRoute("inventory");
  });
  app.appendChild(node);
}

function renderInventory() {
  const node = cloneTemplate("inventory-template");
  const form = node.getElementById("ingredient-form");
  const input = node.getElementById("ingredient-input");
  const tags = node.getElementById("ingredient-tags");
  const feedback = node.getElementById("ingredient-feedback");
  const empty = node.getElementById("inventory-empty");
  const guidance = node.getElementById("ingredient-guidance");
  const quick = node.getElementById("quick-add-groups");
  const genBtn = node.getElementById("generate-plan");

  function updateGuidance() {
    const c = state.inventory.length;
    guidance.innerHTML =
      c < MIN_INGREDIENTS
        ? `<strong>Add at least ${MIN_INGREDIENTS} ingredients to generate a plan.</strong> Best results with ${BEST_RANGE[0]}-${BEST_RANGE[1]} ingredients.`
        : `<strong>Ready to generate.</strong> You added ${c} ingredients. Best quality is usually ${BEST_RANGE[0]}-${BEST_RANGE[1]}.`;
    genBtn.disabled = c < MIN_INGREDIENTS;
  }
  function renderQuickAdd() {
    quick.innerHTML = "";
    POPULAR_INGREDIENT_GROUPS.forEach((g) => {
      const wrap = document.createElement("div");
      wrap.className = "quick-group";
      wrap.innerHTML = `<h4>${g.label}</h4><div class="chips">${g.items.map((i) => `<button type="button" class="chip-btn" data-item="${i}">+ ${i}</button>`).join("")}</div>`;
      quick.appendChild(wrap);
    });
    quick.querySelectorAll(".chip-btn").forEach((b) =>
      b.addEventListener("click", () => {
        const ing = cleanIngredient(b.dataset.item || "");
        if (ing && !state.inventory.includes(ing)) state.inventory.push(ing);
        state.ingredientFeedback = `Added ${ing}.`;
        feedback.classList.remove("warn");
        refreshTags();
      })
    );
  }
  function refreshTags() {
    tags.innerHTML = "";
    empty.textContent = state.inventory.length ? "" : "No ingredients yet. Add 3 minimum, 4-6 for better plans.";
    state.inventory.forEach((item) => {
      const el = document.createElement("div");
      el.className = "tag";
      el.innerHTML = `<span>${item}</span><button data-item="${item}" aria-label="Remove ingredient">x</button>`;
      tags.appendChild(el);
    });
    tags.querySelectorAll("button").forEach((btn) =>
      btn.addEventListener("click", () => {
        const tag = btn.closest(".tag");
        if (tag) tag.classList.add("removing");
        setTimeout(() => {
          state.inventory = state.inventory.filter((i) => i !== btn.dataset.item);
          state.ingredientFeedback = `Removed ${btn.dataset.item}.`;
          feedback.classList.add("warn");
          refreshTags();
        }, 130);
      })
    );
    feedback.textContent = state.ingredientFeedback;
    updateGuidance();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const ing = cleanIngredient(input.value);
    if (!ing) {
      state.ingredientFeedback = "Type an ingredient first.";
      feedback.classList.add("warn");
    } else if (state.inventory.includes(ing)) {
      state.ingredientFeedback = `${ing} is already added.`;
      feedback.classList.add("warn");
    } else {
      state.inventory.push(ing);
      state.ingredientFeedback = `Added ${ing}.`;
      feedback.classList.remove("warn");
      input.value = "";
    }
    refreshTags();
  });

  genBtn.addEventListener("click", async () => {
    if (state.inventory.length < MIN_INGREDIENTS) {
      state.generationState = { kind: "not_enough_ingredients", message: `Add at least ${MIN_INGREDIENTS} ingredients. Best with ${BEST_RANGE[0]}-${BEST_RANGE[1]}.` };
      setRoute("plan");
      return;
    }
    genBtn.textContent = "Generating...";
    genBtn.disabled = true;
    await new Promise((r) => setTimeout(r, 700));
    try {
      const result = generatePlan({ relaxed: false, substituteFriendly: false });
      state.todaysPlan = result.plan;
      state.generationState = { kind: result.state, message: result.message };
    } catch (_e) {
      state.todaysPlan = null;
      state.generationState = { kind: "system_error", message: "System / AI error happened. Please retry." };
    }
    setRoute("plan");
  });

  renderQuickAdd();
  refreshTags();
  app.appendChild(node);
}

function evaluateMealMatch(meal, inventorySet, options = {}) {
  const matched = meal.ingredients.filter((i) => inventorySet.has(i));
  const missing = meal.ingredients.filter((i) => !inventorySet.has(i));
  const substitutePairs = missing
    .map((m) => ({ missing: m, options: (INGREDIENT_ALTERNATIVES[m] || []).filter((x) => inventorySet.has(x)) }))
    .filter((x) => x.options.length);
  let quality = "needs_shopping";
  if (!missing.length) quality = "exact_match";
  else if (missing.length <= 1 && matched.length >= 3) quality = "good_match";
  else if (substitutePairs.length && missing.length <= 2) quality = "uses_substitutes";
  else if (missing.length <= 2 && options.relaxed) quality = "needs_few_items";
  let score = matched.length * 10 - missing.length * 3 + substitutePairs.length * 4;
  if (quality === "exact_match") score += 10;
  if (quality === "good_match") score += 7;
  if (quality === "uses_substitutes") score += 5;
  if (options.substituteFriendly) score += substitutePairs.length * 4;
  return { meal, matched, missing, substitutePairs, quality, score, explanation: `matches ${matched.length}/${meal.ingredients.length}, missing ${missing.length}${substitutePairs.length ? `, ${substitutePairs.length} substitutable` : ""}` };
}
function pickMeal(type, options) {
  const inventorySet = new Set(state.inventory);
  return MEAL_LIBRARY[type].map((m) => evaluateMealMatch(m, inventorySet, options)).sort((a, b) => b.score - a.score)[0];
}
function generatePlan(options = {}) {
  if (state.inventory.length < MIN_INGREDIENTS) return { state: "not_enough_ingredients", message: `Add at least ${MIN_INGREDIENTS} ingredients to generate.`, plan: null };
  const meals = {
    breakfast: pickMeal("breakfast", options),
    lunch: pickMeal("lunch", options),
    dinner: pickMeal("dinner", options),
  };
  if (!meals.breakfast || !meals.lunch || !meals.dinner) return { state: "unknown_error", message: "Unknown fallback error. Please retry.", plan: null };
  const all = Object.values(meals);
  const totalKcal = all.reduce((sum, x) => sum + x.meal.kcal, 0);
  const totalProtein = all.reduce((sum, x) => sum + x.meal.protein, 0);
  const exact = all.some((x) => x.quality === "exact_match");
  const partial = all.some((x) => x.quality === "uses_substitutes" || x.quality === "needs_few_items");
  let stateKind = "success";
  let message = "Success: your meal plan is ready.";
  if (!exact && partial) {
    stateKind = "partial_recipe_match_found";
    message = "No exact recipe found, but here is the best option using your current ingredients.";
  } else if (!exact) {
    stateKind = "no_exact_recipe_match";
    message = "No exact recipe match. Showing recipes that use the most of your ingredients.";
  }
  return { state: stateKind, message, plan: { meals, totalKcal, totalProtein, mode: calculateGoalDirection() } };
}
function generationStatusMeta(kind) {
  const map = {
    idle: { cls: "", text: "Generate when ready." },
    success: { cls: "good", text: "Success: plan generated." },
    not_enough_ingredients: { cls: "warn", text: `Not enough ingredients. Add at least ${MIN_INGREDIENTS}.` },
    no_exact_recipe_match: { cls: "warn", text: "No exact recipe match found. Showing best possible fallback." },
    partial_recipe_match_found: { cls: "warn", text: "Partial match found with substitutes and a short shopping list." },
    system_error: { cls: "error", text: "System / AI error. Retry generation." },
    unknown_error: { cls: "error", text: "Unknown fallback error. Retry or start over." },
  };
  return map[kind] || map.unknown_error;
}
function qualityBadge(m) {
  const labels = {
    exact_match: { label: "Exact match", cls: "good" },
    good_match: { label: "Good match", cls: "good" },
    uses_substitutes: { label: "Uses substitutes", cls: "warn" },
    needs_few_items: { label: `Needs ${m.missing.length} more`, cls: "warn" },
    needs_shopping: { label: "Needs shopping", cls: "warn" },
  };
  return labels[m.quality] || { label: "Fallback", cls: "warn" };
}
function coverageSummary() {
  const inv = new Set(state.inventory);
  const covered = new Set();
  const missing = new Set();
  const subs = [];
  Object.values(state.todaysPlan.meals).forEach((m) => {
    m.meal.ingredients.forEach((ing) => (inv.has(ing) ? covered.add(ing) : missing.add(ing)));
    m.substitutePairs.forEach((s) => subs.push(`${s.missing} -> ${s.options.slice(0, 2).join(" / ")}`));
  });
  return { covered: [...covered], missing: [...missing], substitutes: subs };
}
function goalSentence() {
  if (!state.profile || !state.todaysPlan) return "";
  const modeMap = { lose: "calorie-aware", gain: "higher-energy", maintain: "balanced" };
  const p = state.profile;
  return `Target: ${p.currentWeight}kg -> ${p.targetWeight}kg in ${p.targetWeeks} weeks. Plan style: ${modeMap[state.todaysPlan.mode]}.`;
}

function renderMealCard(label, mealMatch) {
  const meal = mealMatch.meal;
  const badge = qualityBadge(mealMatch);
  const subText = mealMatch.substitutePairs.length ? mealMatch.substitutePairs.map((s) => `${s.missing} -> ${s.options.join(" / ")}`).join(" | ") : "No substitute needed.";
  const wrapper = document.createElement("article");
  wrapper.className = "meal";
  wrapper.innerHTML = `
    <div class="meal-image" style="background-image: linear-gradient(120deg, rgba(249,115,22,0.18), rgba(239,68,68,0.08)), url('${meal.image}');"></div>
    <div class="meal-body">
      <p class="meal-topline">${label}</p>
      <p class="meal-title">${meal.title}</p>
      <div class="label-row"><span class="quality-label ${badge.cls}">${badge.label}</span></div>
      <p class="meal-note">Chosen because it ${mealMatch.explanation} and fits your goal/cook-time profile.</p>
      <div class="meta-grid">
        <div class="mini"><span>Calories</span><strong>${meal.kcal}</strong></div>
        <div class="mini"><span>Protein</span><strong>${meal.protein}g</strong></div>
        <div class="mini"><span>Cook</span><strong>${meal.cookMin}m</strong></div>
      </div>
      <div class="substitute-box"><strong>Quick substitutes:</strong> ${subText}</div>
      <div class="actions"><button class="btn primary view-recipe">View recipe</button></div>
    </div>`;
  wrapper.querySelector(".view-recipe").addEventListener("click", () => {
    state.currentRecipe = mealMatch;
    setRoute("recipe");
  });
  return wrapper;
}

function renderPlan() {
  const meta = generationStatusMeta(state.generationState.kind);
  if (!state.todaysPlan) {
    const empty = document.createElement("section");
    empty.className = "card plan-empty";
    empty.innerHTML = `<h2>No plan yet</h2><div class="status-box ${meta.cls}">${state.generationState.message || meta.text}</div><p class="muted">Generate your first daily meal plan from inventory.</p><button class="btn primary" id="go-generate">Go to inventory</button>`;
    empty.querySelector("#go-generate").addEventListener("click", () => setRoute("inventory"));
    app.appendChild(empty);
    return;
  }
  const node = cloneTemplate("plan-template");
  node.getElementById("goal-summary").textContent = goalSentence();
  const statusBox = node.getElementById("generation-status");
  statusBox.className = `status-box ${meta.cls}`;
  statusBox.textContent = state.generationState.message || meta.text;
  const kcalGoal = state.todaysPlan.mode === "lose" ? 1800 : state.todaysPlan.mode === "gain" ? 2400 : 2100;
  const proteinGoal = 90;
  node.getElementById("nutrition-summary").innerHTML = `<div class="nutrition-grid"><div class="stat"><div class="label">Daily calories</div><div class="value">${state.todaysPlan.totalKcal} kcal</div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, Math.round((state.todaysPlan.totalKcal / kcalGoal) * 100))}%"></div></div></div><div class="stat"><div class="label">Daily protein</div><div class="value">${state.todaysPlan.totalProtein} g</div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, Math.round((state.todaysPlan.totalProtein / proteinGoal) * 100))}%"></div></div></div></div>`;
  const coverage = coverageSummary();
  const easyLabel = coverage.missing.length > 0 && coverage.missing.length <= 2 ? `<div class="label-row"><span class="quality-label good">Easy to complete</span><span class="quality-label">Budget-friendly</span></div>` : "";
  node.getElementById("missing-summary").innerHTML = `<h3>Coverage & shopping</h3><p class="muted compact">Covered ingredients</p><div class="chips">${(coverage.covered.length ? coverage.covered : ["none yet"]).map((i) => `<span class="chip">${i}</span>`).join("")}</div><p class="muted compact">Missing ingredients (${coverage.missing.length})</p><div class="chips">${(coverage.missing.length ? coverage.missing : ["none"]).map((i) => `<span class="chip">${i}</span>`).join("")}</div><p class="muted compact">Substitutes available</p><div class="chips">${(coverage.substitutes.length ? coverage.substitutes : ["none needed"]).map((i) => `<span class="chip">${i}</span>`).join("")}</div>${easyLabel}`;
  node.getElementById("retry-actions").innerHTML = `<div class="row"><button class="btn secondary" id="action-add">Add more ingredients</button><button class="btn secondary" id="action-relaxed">Generate relaxed match</button></div><div class="row"><button class="btn secondary" id="action-subs">Use substitute-friendly recipes</button><button class="btn ghost" id="action-reset">Start over</button></div>`;
  node.getElementById("action-add").addEventListener("click", () => setRoute("inventory"));
  node.getElementById("action-relaxed").addEventListener("click", () => regenerateWith({ relaxed: true, substituteFriendly: false }, "Relaxed mode"));
  node.getElementById("action-subs").addEventListener("click", () => regenerateWith({ relaxed: true, substituteFriendly: true }, "Substitute mode"));
  node.getElementById("action-reset").addEventListener("click", () => {
    state.todaysPlan = null;
    state.generationState = { kind: "idle", message: "Start over and generate again." };
    setRoute("inventory");
  });
  const list = node.getElementById("meal-list");
  list.appendChild(renderMealCard("Breakfast", state.todaysPlan.meals.breakfast));
  list.appendChild(renderMealCard("Lunch", state.todaysPlan.meals.lunch));
  list.appendChild(renderMealCard("Dinner", state.todaysPlan.meals.dinner));
  node.getElementById("regenerate-plan").addEventListener("click", () => regenerateWith({ relaxed: false, substituteFriendly: false }, "Standard mode"));
  app.appendChild(node);
}

function regenerateWith(options, modeLabel) {
  const result = generatePlan(options);
  state.todaysPlan = result.plan;
  state.generationState = { kind: result.state, message: `${result.message} (${modeLabel})` };
  render();
}

function renderRecipeDetail(mealMatch) {
  const recipe = mealMatch.meal;
  const badge = qualityBadge(mealMatch);
  const node = cloneTemplate("recipe-template");
  node.getElementById("recipe-title").textContent = recipe.title;
  node.getElementById("recipe-meta").innerHTML = `${recipe.cookMin} min · ${recipe.kcal} kcal · ${recipe.protein}g protein <span class="quality-label ${badge.cls}">${badge.label}</span><br/>Chosen because it ${mealMatch.explanation}.`;
  node.getElementById("recipe-image").style.backgroundImage = `linear-gradient(120deg, rgba(249,115,22,0.22), rgba(239,68,68,0.12)), url('${recipe.image}')`;
  node.getElementById("recipe-substitutes").innerHTML = mealMatch.substitutePairs.length ? `<strong>Substitutes:</strong> ${mealMatch.substitutePairs.map((s) => `${s.missing} -> ${s.options.join(" / ")}`).join(" | ")}` : "<strong>Substitutes:</strong> You have what you need.";
  recipe.ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    node.getElementById("recipe-ingredients").appendChild(li);
  });
  recipe.steps.forEach((step) => {
    const li = document.createElement("li");
    li.textContent = step;
    node.getElementById("recipe-steps").appendChild(li);
  });
  node.getElementById("close-recipe").addEventListener("click", () => setRoute("plan"));
  app.appendChild(node);
}

render();
