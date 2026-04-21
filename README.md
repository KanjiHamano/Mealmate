# MealMate Student - First Version

Mobile-first prototype for single university students who live alone and want daily meal decisions handled automatically.

## 1) App structure

- `Onboarding`: collect weight goal, target period, lifestyle, and time preference.
- `Inventory`: user adds available ingredients in fridge/kitchen.
- `Today Plan`: generate breakfast/lunch/dinner with simple recipes and nutrition estimate.
- `Recipe Detail`: ingredients, step-by-step instructions, cook time.
- `Substitute Suggestions`: instant alternatives for missing ingredients, prioritized from what user already has.
- `Regenerate/Edit`: refresh meal plan quickly without restarting setup.

Current implementation files:
- `index.html`: screen templates and app shell
- `styles.css`: mobile-first UI styling
- `app.js`: state, meal generation logic, substitutions, rendering

## 2) Main user flow

1. User opens app -> onboarding form appears.
2. User enters goal and lifestyle constraints.
3. User enters ingredients they currently have.
4. User taps "Generate today plan".
5. App shows breakfast/lunch/dinner with cook time, calories, protein.
6. User opens each recipe detail as needed.
7. If ingredients are missing, app shows practical substitutes instantly.
8. User can regenerate plan anytime.

## 3) Best screen layout (mobile-first)

- Sticky mental model: one card per step.
- Vertical single-column layout.
- Large touch targets with low cognitive load.
- Prioritize "next action" button near bottom of each card.

Recommended hierarchy:
- Header: motivational 1-line message.
- Primary card: one task only (fill goal, add ingredients, view plan).
- Secondary details hidden until needed (recipe detail screen).

## 4) Wireframe ideas

### A. Onboarding

```
+-----------------------------------+
| MealMate Student                  |
| Today, eat without overthinking   |
|-----------------------------------|
| [Current weight   ____ ]          |
| [Target weight    ____ ]          |
| [Target period    ____ ]          |
| [Lifestyle       v    ]           |
| [Cook time       v    ]           |
| [ Save and continue ]             |
+-----------------------------------+
```

### B. Ingredient input

```
+-----------------------------------+
| What do you have?                 |
| [ eggs, tofu, rice      ][Add]    |
|-----------------------------------|
| [eggs x] [tofu x] [rice x]        |
|                                   |
| [ Generate today plan ]           |
+-----------------------------------+
```

### C. Today plan

```
+-----------------------------------+
| Today meal plan      [Regenerate] |
| Goal summary line                  |
| Kcal / protein summary             |
|-----------------------------------|
| Breakfast: ... [View recipe]       |
| Substitutes: chicken->tofu/eggs    |
|-----------------------------------|
| Lunch: ... [View recipe]           |
|-----------------------------------|
| Dinner: ... [View recipe]          |
+-----------------------------------+
```

### D. Recipe detail

```
+-----------------------------------+
| Recipe title            [Back]     |
| 15 min | 550 kcal | 25g protein    |
| Ingredients (list)                 |
| Steps 1..N                         |
+-----------------------------------+
```

## 5) Clean UI proposal

- Tone: supportive, efficient, non-judgmental.
- Colors: calm blue accents, neutral gray background.
- Components: rounded cards, chip tags, clear CTA buttons.
- Copywriting: short action labels ("Generate", "View recipe", "Regenerate").
- Interaction: one decision at a time to reduce fatigue.

## 6) First app version status

Implemented now:
- Mobile-first onboarding + ingredient inventory + plan generation flow
- Breakfast/lunch/dinner with simple recipes
- Goal summary and nutrition estimate
- Instant ingredient substitutions based on current inventory
- Recipe detail view
- Regenerate meal plan action

## Run

Open `index.html` in your browser.

If you want, next version can add:
- save data to localStorage
- budget mode (cheap meals first)
- grocery shortfall list
- weekly auto-plan mode
