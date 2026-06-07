import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  ArrowClockwise,
  BowlFood,
  Camera,
  Cards,
  CaretUp,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  CookingPot,
  DownloadSimple,
  FileArrowUp,
  FloppyDisk,
  House,
  Images,
  ListPlus,
  MagnifyingGlass,
  Notebook,
  PencilSimple,
  Plus,
  SealCheck,
  Sparkle,
  Trash,
  UploadSimple,
  User,
  X,
} from "@phosphor-icons/react";
import mapoTofu from "./assets/dishes/mapo-tofu.jpg";
import braisedRibs from "./assets/dishes/braised-ribs.jpg";
import stirFryGreens from "./assets/dishes/stir-fry-greens.jpg";
import cornRibSoup from "./assets/dishes/corn-rib-soup.jpg";
import scallionNoodles from "./assets/dishes/scallion-noodles.jpg";
import tomatoEgg from "./assets/dishes/tomato-egg.jpg";
import colaWings from "./assets/dishes/cola-wings.jpg";
import garlicBroccoli from "./assets/dishes/garlic-broccoli.jpg";
import yuXiangPork from "./assets/dishes/yu-xiang-pork.jpg";

const DataExport = registerPlugin("DataExport");

const STORAGE_KEYS = {
  recipes: "xiaolu-food-wheel:v7:recipes",
  wheelIds: "xiaolu-food-wheel:v7:wheel-ids",
  records: "xiaolu-food-wheel:v7:records",
  selectedRecipeId: "xiaolu-food-wheel:v7:selected-recipe",
  avoidRecent: "xiaolu-food-wheel:v7:avoid-recent",
};

const LEGACY_KEYS = {
  dishes: "xiaolu-food-wheel:v6:dishes",
  history: "xiaolu-food-wheel:v6:history",
  selected: "xiaolu-food-wheel:v6:selected",
};

const palette = [
  "#c96b5d",
  "#8b9c73",
  "#c49a62",
  "#b86f4d",
  "#7f956c",
  "#a77f68",
  "#d18b61",
  "#6f8c7a",
  "#bd7468",
];

const wheelPalette = [
  "#c85f51",
  "#7f9468",
  "#d19a5f",
  "#ad705f",
  "#92a778",
  "#c27758",
  "#ddad69",
  "#75947a",
  "#bd6b72",
  "#a88963",
  "#d7835a",
  "#698c72",
];

const builtInDishImageSet = new Set([
  mapoTofu,
  braisedRibs,
  stirFryGreens,
  cornRibSoup,
  scallionNoodles,
  tomatoEgg,
  colaWings,
  garlicBroccoli,
  yuXiangPork,
]);

const defaultRecipes = [
  {
    id: "mapo-tofu",
    name: "麻婆豆腐",
    note: "香辣下饭，经典川味",
    category: "下饭菜",
    image: mapoTofu,
    color: "#c96b5d",
  },
  {
    id: "tomato-egg",
    name: "番茄炒蛋",
    note: "酸甜开胃，家常必备",
    category: "快手菜",
    image: tomatoEgg,
    color: "#db8a5a",
  },
  {
    id: "braised-ribs",
    name: "红烧排骨",
    note: "浓油赤酱，周末奖励",
    category: "硬菜",
    image: braisedRibs,
    color: "#a85f45",
  },
  {
    id: "stir-fry-greens",
    name: "清炒时蔬",
    note: "清爽一点，刚刚好",
    category: "素菜",
    image: stirFryGreens,
    color: "#8b9c73",
  },
  {
    id: "cola-wings",
    name: "可乐鸡翅",
    note: "甜咸适中，简单好吃",
    category: "家常菜",
    image: colaWings,
    color: "#b86f4d",
  },
  {
    id: "garlic-broccoli",
    name: "蒜蓉西兰花",
    note: "翠绿清香，配饭不腻",
    category: "素菜",
    image: garlicBroccoli,
    color: "#7f956c",
  },
  {
    id: "yu-xiang-pork",
    name: "鱼香肉丝",
    note: "酸甜咸香，超级下饭",
    category: "川菜",
    image: yuXiangPork,
    color: "#c07b58",
  },
  {
    id: "scallion-noodles",
    name: "葱油拌面",
    note: "懒人晚餐，香气很足",
    category: "面食",
    image: scallionNoodles,
    color: "#c49a62",
  },
  {
    id: "corn-rib-soup",
    name: "玉米排骨汤",
    note: "清甜热乎，适合慢慢喝",
    category: "汤",
    image: cornRibSoup,
    color: "#d19a63",
  },
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Local photo uploads can fill browser storage; keep the app responsive.
  }
}

function formatDateInput(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDateInput(date);
}

function normalizeRecordDate(value) {
  if (typeof value !== "string") return formatDateInput();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{2}-\d{2}$/.test(value)) return `${new Date().getFullYear()}-${value}`;
  return formatDateInput();
}

function formatDisplayDate(value) {
  const date = normalizeRecordDate(value);
  const [, month, day] = date.split("-");
  return `${month} / ${day}`;
}

function formatWeekday(value) {
  const date = new Date(`${normalizeRecordDate(value)}T12:00:00`);
  return new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);
}

function todayParts() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(today);
  return {
    monthDay: `${month} / ${day}`,
    dateInput: formatDateInput(today),
    weekday,
  };
}

function normalizeName(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
}

function matchesQuery(fields, query) {
  const rawQuery = String(query ?? "").trim().toLowerCase();
  const compactQuery = normalizeName(query);
  if (!rawQuery && !compactQuery) return true;

  return fields.some((field) => {
    const text = String(field ?? "");
    return text.toLowerCase().includes(rawQuery) || normalizeName(text).includes(compactQuery);
  });
}

function dateDayNumber(value) {
  return Math.floor(new Date(`${normalizeRecordDate(value)}T12:00:00`).getTime() / 86400000);
}

function randomIndex(count) {
  if (!count) return 0;
  if (window.crypto?.getRandomValues) {
    const value = new Uint32Array(1);
    window.crypto.getRandomValues(value);
    return value[0] % count;
  }

  return Math.floor(Math.random() * count);
}

function normalizeAngle(value) {
  return ((value % 360) + 360) % 360;
}

function angleDelta(from, to) {
  return (to - normalizeAngle(from) + 360) % 360;
}

function ensureRecipeShape(recipe, index) {
  const now = new Date().toISOString();
  const rawImage = typeof recipe?.image === "string" ? recipe.image : "";
  const isAutoAssignedCustomImage =
    String(recipe?.id || "").startsWith("recipe-") && builtInDishImageSet.has(rawImage);

  return {
    id: recipe?.id || createId("recipe"),
    name: String(recipe?.name || "未命名菜").trim(),
    note: String(recipe?.note || "小璐想吃的话，就安排它").trim(),
    category: String(recipe?.category || "家常菜").trim(),
    image: isAutoAssignedCustomImage ? "" : rawImage,
    color: recipe?.color || palette[index % palette.length],
    createdAt: recipe?.createdAt || now,
    updatedAt: recipe?.updatedAt || now,
  };
}

function makeDefaultRecords() {
  return [
    { id: "record-1", name: "红烧排骨", recipeId: "braised-ribs", date: shiftDate(-1), image: braisedRibs },
    { id: "record-2", name: "清炒时蔬", recipeId: "stir-fry-greens", date: shiftDate(-2), image: stirFryGreens },
    { id: "record-3", name: "玉米排骨汤", recipeId: "corn-rib-soup", date: shiftDate(-3), image: cornRibSoup },
    { id: "record-4", name: "葱油拌面", recipeId: "scallion-noodles", date: shiftDate(-4), image: scallionNoodles },
  ].map((record, index) => ensureRecordShape(record, index));
}

function ensureRecordShape(record, index) {
  return {
    id: record?.id || createId("record"),
    name: String(record?.name || "未命名菜").trim(),
    recipeId: record?.recipeId || "",
    date: normalizeRecordDate(record?.date),
    image: typeof record?.image === "string" ? record.image : "",
    createdAt: record?.createdAt || new Date().toISOString(),
    updatedAt: record?.updatedAt || new Date().toISOString(),
  };
}

function dedupeIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

function buildInitialData() {
  const storedRecipes = loadStored(STORAGE_KEYS.recipes, null);
  const legacyDishes = loadStored(LEGACY_KEYS.dishes, []);
  const recipeSource = Array.isArray(storedRecipes) && storedRecipes.length
    ? storedRecipes
    : Array.isArray(legacyDishes) && legacyDishes.length
      ? legacyDishes
      : defaultRecipes;
  const recipes = recipeSource.map(ensureRecipeShape);
  const recipeIdSet = new Set(recipes.map((recipe) => recipe.id));

  const storedWheelIds = loadStored(STORAGE_KEYS.wheelIds, null);
  let wheelIds = [];
  if (Array.isArray(storedWheelIds)) {
    wheelIds = storedWheelIds.filter((id) => recipeIdSet.has(id));
  } else if (Array.isArray(legacyDishes) && legacyDishes.length) {
    wheelIds = legacyDishes.map((dish) => dish.id).filter((id) => recipeIdSet.has(id));
  } else {
    wheelIds = defaultRecipes.map((recipe) => recipe.id).filter((id) => recipeIdSet.has(id));
  }
  if (!wheelIds.length && recipes.length) {
    wheelIds = recipes.slice(0, Math.min(8, recipes.length)).map((recipe) => recipe.id);
  }
  wheelIds = dedupeIds(wheelIds);

  const storedRecords = loadStored(STORAGE_KEYS.records, null);
  const legacyHistory = loadStored(LEGACY_KEYS.history, []);
  const recordSource = Array.isArray(storedRecords)
    ? storedRecords
    : Array.isArray(legacyHistory) && legacyHistory.length
      ? legacyHistory
      : makeDefaultRecords();
  const records = recordSource.map(ensureRecordShape);

  const storedSelected = loadStored(
    STORAGE_KEYS.selectedRecipeId,
    loadStored(LEGACY_KEYS.selected, null),
  );
  const selectedRecipeId = wheelIds.includes(storedSelected)
    ? storedSelected
    : wheelIds[0] || recipes[0]?.id || "";
  const selectedIndex = Math.max(0, wheelIds.findIndex((id) => id === selectedRecipeId));
  const initialPointerRotation = wheelIds.length ? selectedIndex * (360 / wheelIds.length) : 0;

  return {
    recipes,
    wheelIds,
    records,
    selectedRecipeId,
    initialPointerRotation,
    avoidRecent: Boolean(loadStored(STORAGE_KEYS.avoidRecent, false)),
  };
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const maxSide = 1100;
        const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
        const width = Math.round(image.width * ratio);
        const height = Math.round(image.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.84));
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function DishImage({ src, alt, className = "", placeholderSize = 28 }) {
  if (src) {
    return <img className={className} src={src} alt={alt} />;
  }

  return (
    <div className={`dish-placeholder ${className}`} role="img" aria-label={`${alt}未上传图片`}>
      <BowlFood size={placeholderSize} weight="duotone" />
      <span>未上传</span>
    </div>
  );
}

function RecipeFormModal({ recipe, onClose, onSave, addToWheel }) {
  const isEditing = Boolean(recipe);
  const [name, setName] = useState(recipe?.name ?? "");
  const [note, setNote] = useState(recipe?.note ?? "");
  const [category, setCategory] = useState(recipe?.category ?? "家常菜");
  const [image, setImage] = useState(recipe?.image ?? "");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const nextImage = file ? await compressImage(file) : image;
    const now = new Date().toISOString();
    onSave({
      id: recipe?.id || createId("recipe"),
      name: name.trim(),
      note: note.trim() || "小璐想吃的话，就安排它",
      category: category.trim() || "家常菜",
      image: nextImage,
      color: recipe?.color || palette[name.length % palette.length],
      createdAt: recipe?.createdAt || now,
      updatedAt: now,
      addToWheel,
    });
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">菜谱库</p>
            <h2>{isEditing ? "编辑菜谱" : "新建菜谱"}</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        <form className="data-form" onSubmit={submit}>
          <label>
            <span>菜名</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="比如：酸菜鱼"
              maxLength={18}
            />
          </label>
          <label>
            <span>分类</span>
            <input
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="家常菜"
              maxLength={10}
            />
          </label>
          <label>
            <span>备注</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="比如：周末认真吃一顿"
              maxLength={28}
            />
          </label>
          <label className="file-drop">
            <UploadSimple size={22} />
            <span>{fileName || (image ? "已选择菜品图片，可重新上传" : "选择本地图片")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setFileName(nextFile?.name ?? "");
              }}
            />
          </label>
          {image && (
            <div className="form-preview">
              <img src={image} alt="菜谱预览" />
              <span>当前图片</span>
            </div>
          )}
          <button className="primary-action" type="submit" disabled={!name.trim() || saving}>
            <FloppyDisk size={20} />
            {saving ? "正在保存" : "保存菜谱"}
          </button>
        </form>
      </section>
    </div>
  );
}

function RecordFormModal({ record, recipes, defaultRecipe, defaultDate, onClose, onSave }) {
  const isEditing = Boolean(record);
  const initialRecipe = defaultRecipe || recipes.find((recipe) => recipe.id === record?.recipeId);
  const [date, setDate] = useState(record?.date ?? defaultDate);
  const [recipeId, setRecipeId] = useState(record?.recipeId ?? initialRecipe?.id ?? "");
  const [name, setName] = useState(record?.name ?? initialRecipe?.name ?? "");
  const [image, setImage] = useState(record?.image ?? initialRecipe?.image ?? "");
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  function chooseRecipe(nextId) {
    setRecipeId(nextId);
    const picked = recipes.find((recipe) => recipe.id === nextId);
    if (!picked) return;
    setName(picked.name);
    setImage(picked.image);
  }

  async function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const picked = recipes.find((recipe) => recipe.id === recipeId);
    const nextImage = file ? await compressImage(file) : image || picked?.image || "";
    const now = new Date().toISOString();
    onSave({
      id: record?.id || createId("record"),
      name: name.trim(),
      recipeId: recipeId || picked?.id || "",
      date: normalizeRecordDate(date),
      image: nextImage,
      createdAt: record?.createdAt || now,
      updatedAt: now,
    });
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">做菜记录</p>
            <h2>{isEditing ? "编辑记录" : "记录今天吃了什么"}</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        <form className="data-form" onSubmit={submit}>
          <label>
            <span>日期</span>
            <input value={date} type="date" onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span>从菜谱选择</span>
            <select value={recipeId} onChange={(event) => chooseRecipe(event.target.value)}>
              <option value="">不绑定菜谱，手动填写</option>
              {recipes.map((recipe) => (
                <option value={recipe.id} key={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>菜名</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="比如：土豆牛腩"
              maxLength={18}
            />
          </label>
          <label className="file-drop">
            <Camera size={22} />
            <span>{fileName || (image ? "已选择成品图，可重新上传" : "上传这次做菜的图片")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const nextFile = event.target.files?.[0] ?? null;
                setFile(nextFile);
                setFileName(nextFile?.name ?? "");
              }}
            />
          </label>
          {image && (
            <div className="form-preview">
              <img src={image} alt="做菜记录预览" />
              <span>当前图片</span>
            </div>
          )}
          <button className="primary-action" type="submit" disabled={!name.trim() || saving}>
            <FloppyDisk size={20} />
            {saving ? "正在保存" : "保存记录"}
          </button>
        </form>
      </section>
    </div>
  );
}

function RecipePickerModal({ recipes, wheelIds, onClose, onToggleWheel, onCreateRecipe, onSyncAllWheel }) {
  const [query, setQuery] = useState("");
  const [syncNotice, setSyncNotice] = useState("");
  const wheelSet = new Set(wheelIds);
  const availableCount = recipes.filter((recipe) => !wheelSet.has(recipe.id)).length;
  const filteredRecipes = recipes.filter((recipe) =>
    matchesQuery([recipe.name, recipe.category, recipe.note], query),
  );

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="modal-sheet picker-sheet">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">从菜谱添加</p>
            <h2>挑几道放进转盘</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        <div className="picker-summary">
          <div>
            <strong>{wheelIds.length}</strong>
            <span>转盘里</span>
          </div>
          <div>
            <strong>{availableCount}</strong>
            <span>可添加</span>
          </div>
        </div>
        <div className="picker-actions">
          <button
            className="outline-action"
            type="button"
            onClick={() => {
              const result = onSyncAllWheel();
              setSyncNotice(
                result.added
                  ? `已同步 ${result.added} 道菜到转盘。`
                  : "菜谱里的菜都在转盘里了。",
                );
            }}
            disabled={!availableCount}
          >
            <ListPlus size={18} />
            {recipes.length && !availableCount ? "已同步完" : "同步全部"}
          </button>
          <button className="outline-action filled" type="button" onClick={onCreateRecipe}>
            <Plus size={18} />
            新建菜谱
          </button>
        </div>
        {syncNotice && <p className="picker-note">{syncNotice}</p>}

        <label className="search-field">
          <MagnifyingGlass size={18} />
          <input
            value={query}
            type="search"
            placeholder="搜索菜名、分类或备注"
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="清空搜索">
              <X size={16} />
            </button>
          )}
        </label>

        <div className="recipe-list picker-list">
          {filteredRecipes.map((recipe) => {
            const inWheel = wheelSet.has(recipe.id);
            return (
              <article className="recipe-row" key={recipe.id}>
                <DishImage src={recipe.image} alt={recipe.name} placeholderSize={23} />
                <div className="row-copy">
                  <strong>{recipe.name}</strong>
                  <span>{recipe.category} · {recipe.note}</span>
                </div>
                <button
                  className={`mini-action ${inWheel ? "is-on" : ""}`}
                  type="button"
                  onClick={() => onToggleWheel(recipe.id)}
                >
                  {inWheel ? <Check size={16} /> : <Plus size={16} />}
                  {inWheel ? "已加入" : "加入"}
                </button>
              </article>
            );
          })}
          {!filteredRecipes.length && (
            <div className="empty-state">
              <BowlFood size={34} />
              <strong>{recipes.length ? "没有找到这道菜" : "菜谱还是空的"}</strong>
              <span>{recipes.length ? "换个关键词试试，或者直接新建菜谱。" : "先新建一道菜，再放进转盘。"}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function RouletteWheel({
  recipes,
  selectedRecipe,
  selectedIndex,
  spinning,
  pointerRotation,
  onSelect,
  onSpin,
}) {
  const slice = 360 / Math.max(recipes.length, 1);
  const selectedCenter = selectedIndex * slice;
  const separator = Math.min(1.25, slice * 0.06);
  const wheelGradient = `conic-gradient(from ${-slice / 2}deg, ${recipes
    .map((recipe, index) => {
      const start = index * slice;
      const end = start + slice;
      const segmentColor = wheelPalette[index % wheelPalette.length];
      return [
        `rgba(255, 250, 232, 0.88) ${start}deg ${start + separator}deg`,
        `${segmentColor} ${start + separator}deg ${end - separator}deg`,
        `rgba(90, 111, 77, 0.22) ${end - separator}deg ${end}deg`,
      ].join(", ");
    })
    .join(", ")})`;
  const selectedGradient = `conic-gradient(from ${selectedCenter - slice / 2}deg, rgba(255, 247, 226, 0.72) 0deg ${slice}deg, transparent ${slice}deg 360deg)`;

  return (
    <div className="wheel-stage" aria-live="polite">
      <div
        className="roulette"
        data-pointer-angle={normalizeAngle(pointerRotation).toFixed(3)}
        data-selected-index={selectedIndex}
        data-selected-name={selectedRecipe?.name ?? ""}
        data-slice-size={slice.toFixed(3)}
        style={{
          background: wheelGradient,
        }}
      >
        <div
          className={`selected-sector ${spinning ? "is-waiting" : ""}`}
          style={{
            background: selectedGradient,
          }}
        />
        <div
          className={`wheel-arrow ${spinning ? "is-spinning" : ""}`}
          style={{ "--pointer-rotation": `${pointerRotation}deg` }}
        >
          <CaretUp size={32} weight="fill" />
        </div>
        <div className="wheel-inner">
          {recipes.map((recipe, index) => {
            const angle = index * slice;
            return (
              <button
                className={`wheel-item ${index === selectedIndex && !spinning ? "is-active" : ""}`}
                style={{
                  "--item-angle": `${angle}deg`,
                  "--reverse-angle": `${-angle}deg`,
                }}
                key={recipe.id}
                type="button"
                onClick={() => onSelect(recipe.id)}
                aria-label={recipe.name}
              >
                <DishImage src={recipe.image} alt={recipe.name} placeholderSize={21} />
              </button>
            );
          })}
          <button className="spin-button" type="button" onClick={onSpin} disabled={spinning}>
            <span>{spinning ? "抽签中" : "开始抽签"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function App() {
  const initialDataRef = useRef(null);
  if (!initialDataRef.current) initialDataRef.current = buildInitialData();
  const importDataInputRef = useRef(null);
  const spinningRef = useRef(false);
  const spinTimeoutRef = useRef(null);
  const pointerRotationRef = useRef(initialDataRef.current.initialPointerRotation);

  const { monthDay, dateInput, weekday } = useMemo(todayParts, []);
  const [recipes, setRecipes] = useState(initialDataRef.current.recipes);
  const [wheelIds, setWheelIds] = useState(initialDataRef.current.wheelIds);
  const [records, setRecords] = useState(initialDataRef.current.records);
  const [selectedRecipeId, setSelectedRecipeId] = useState(initialDataRef.current.selectedRecipeId);
  const [pointerRotation, setPointerRotation] = useState(initialDataRef.current.initialPointerRotation);
  const [spinning, setSpinning] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [diaryMode, setDiaryMode] = useState("recipes");
  const [diaryQuery, setDiaryQuery] = useState("");
  const [avoidRecent, setAvoidRecent] = useState(initialDataRef.current.avoidRecent);
  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [recipeEditor, setRecipeEditor] = useState(null);
  const [recordEditor, setRecordEditor] = useState(null);
  const [syncMessage, setSyncMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");

  const recipeMap = useMemo(() => {
    return new Map(recipes.map((recipe) => [recipe.id, recipe]));
  }, [recipes]);

  const wheelRecipes = useMemo(() => {
    return wheelIds.map((id) => recipeMap.get(id)).filter(Boolean);
  }, [recipeMap, wheelIds]);

  const selectedRecipe = useMemo(() => {
    return recipeMap.get(selectedRecipeId) || wheelRecipes[0] || recipes[0] || null;
  }, [recipeMap, recipes, selectedRecipeId, wheelRecipes]);

  const selectedIndex = useMemo(() => {
    if (!selectedRecipe) return 0;
    const index = wheelRecipes.findIndex((recipe) => recipe.id === selectedRecipe.id);
    return Math.max(0, index);
  }, [selectedRecipe, wheelRecipes]);

  const syncableRecords = useMemo(() => {
    const knownNames = new Set(recipes.map((recipe) => normalizeName(recipe.name)));
    const seen = new Set();
    return records.filter((record) => {
      const key = normalizeName(record.name);
      if (!key || knownNames.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recipes, records]);

  const recentCooked = useMemo(() => {
    const todayNumber = dateDayNumber(dateInput);
    const ids = new Set();
    const names = new Set();

    records.forEach((record) => {
      const diff = todayNumber - dateDayNumber(record.date);
      if (diff < 0 || diff > 6) return;
      if (record.recipeId) ids.add(record.recipeId);
      names.add(normalizeName(record.name));
    });

    return { ids, names };
  }, [dateInput, records]);

  const spinPool = useMemo(() => {
    if (!avoidRecent) return wheelRecipes;

    const filtered = wheelRecipes.filter((recipe) => {
      return !recentCooked.ids.has(recipe.id) && !recentCooked.names.has(normalizeName(recipe.name));
    });

    return filtered.length ? filtered : wheelRecipes;
  }, [avoidRecent, recentCooked, wheelRecipes]);

  const avoidedRecentCount = avoidRecent ? wheelRecipes.length - spinPool.length : 0;

  const selectedLastRecord = useMemo(() => {
    if (!selectedRecipe) return null;
    const selectedName = normalizeName(selectedRecipe.name);
    return records.find((record) => record.recipeId === selectedRecipe.id || normalizeName(record.name) === selectedName) || null;
  }, [records, selectedRecipe]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => matchesQuery([recipe.name, recipe.category, recipe.note], diaryQuery));
  }, [diaryQuery, recipes]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      matchesQuery([record.name, record.date, formatDisplayDate(record.date), formatWeekday(record.date)], diaryQuery),
    );
  }, [diaryQuery, records]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.recipes, recipes);
  }, [recipes]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.wheelIds, wheelIds);
  }, [wheelIds]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.records, records);
  }, [records]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.avoidRecent, avoidRecent);
  }, [avoidRecent]);

  useEffect(() => {
    saveStored(STORAGE_KEYS.selectedRecipeId, selectedRecipe?.id || "");
  }, [selectedRecipe?.id]);

  useEffect(() => {
    const recipeIds = new Set(recipes.map((recipe) => recipe.id));
    setWheelIds((current) => current.filter((id) => recipeIds.has(id)));
  }, [recipes]);

  useEffect(() => {
    if (!wheelRecipes.length) return;
    if (!wheelRecipes.some((recipe) => recipe.id === selectedRecipeId)) {
      setSelectedRecipeId(wheelRecipes[0].id);
    }
  }, [selectedRecipeId, wheelRecipes]);

  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current);
      }
    };
  }, []);

  function setPointerToIndex(index, count, extraTurns = 0) {
    if (!count || index < 0) return pointerRotationRef.current;
    const targetAngle = index * (360 / count);
    const nextRotation =
      pointerRotationRef.current + extraTurns + angleDelta(pointerRotationRef.current, targetAngle);

    pointerRotationRef.current = nextRotation;
    setPointerRotation(nextRotation);
    return nextRotation;
  }

  function selectWheelRecipe(recipeId) {
    if (spinningRef.current) return;
    const index = wheelRecipes.findIndex((recipe) => recipe.id === recipeId);
    if (index < 0) return;

    setSelectedRecipeId(recipeId);
    setPointerToIndex(index, wheelRecipes.length);
  }

  function spinWheel() {
    if (spinningRef.current || !wheelRecipes.length) return;
    const drawPool = spinPool.length ? spinPool : wheelRecipes;
    const freshPool = drawPool.length > 1
      ? drawPool.filter((recipe) => recipe.id !== selectedRecipeId)
      : drawPool;
    const nextRecipe = freshPool[randomIndex(freshPool.length)];
    const nextIndex = wheelRecipes.findIndex((recipe) => recipe.id === nextRecipe.id);
    if (nextIndex < 0) return;

    spinningRef.current = true;
    setSpinning(true);
    setPointerToIndex(nextIndex, wheelRecipes.length, 1440);

    if (spinTimeoutRef.current) {
      window.clearTimeout(spinTimeoutRef.current);
    }

    spinTimeoutRef.current = window.setTimeout(() => {
      setSelectedRecipeId(nextRecipe.id);
      spinningRef.current = false;
      setSpinning(false);
      spinTimeoutRef.current = null;
    }, 1240);
  }

  function saveRecipe(nextRecipe) {
    const { addToWheel, ...recipeToSave } = nextRecipe;
    setRecipes((current) => {
      const exists = current.some((recipe) => recipe.id === recipeToSave.id);
      return exists
        ? current.map((recipe) => (recipe.id === recipeToSave.id ? recipeToSave : recipe))
        : [recipeToSave, ...current];
    });
    if (addToWheel) {
      const nextWheelIds = dedupeIds([recipeToSave.id, ...wheelIds]);
      setWheelIds(nextWheelIds);
      setSelectedRecipeId(recipeToSave.id);
      setPointerToIndex(0, nextWheelIds.length);
    }
    setRecipeEditor(null);
  }

  function deleteRecipe(recipeId) {
    const recipe = recipeMap.get(recipeId);
    if (!recipe) return;
    const confirmed = window.confirm(`删除「${recipe.name}」这道菜谱吗？做菜记录会保留。`);
    if (!confirmed) return;
    setRecipes((current) => current.filter((item) => item.id !== recipeId));
    const nextWheelIds = wheelIds.filter((id) => id !== recipeId);
    setWheelIds(nextWheelIds);
    if (selectedRecipeId === recipeId) {
      const fallbackId = nextWheelIds[0] || "";
      setSelectedRecipeId(fallbackId);
      setPointerToIndex(nextWheelIds.indexOf(fallbackId), nextWheelIds.length);
    } else {
      setPointerToIndex(nextWheelIds.indexOf(selectedRecipeId), nextWheelIds.length);
    }
  }

  function toggleWheelRecipe(recipeId) {
    const inWheel = wheelIds.includes(recipeId);
    const nextWheelIds = inWheel
      ? wheelIds.filter((id) => id !== recipeId)
      : dedupeIds([...wheelIds, recipeId]);
    const nextSelectedId = !inWheel
      ? recipeId
      : selectedRecipeId === recipeId
        ? nextWheelIds[0] || ""
        : selectedRecipeId;

    setWheelIds(nextWheelIds);
    setSelectedRecipeId(nextSelectedId);
    if (nextSelectedId) {
      setPointerToIndex(nextWheelIds.indexOf(nextSelectedId), nextWheelIds.length);
    }
  }

  function syncAllRecipesToWheel() {
    const recipeIds = recipes.map((recipe) => recipe.id);
    const nextWheelIds = dedupeIds([...wheelIds, ...recipeIds]);
    const added = nextWheelIds.length - wheelIds.length;
    const nextSelectedId =
      selectedRecipeId && nextWheelIds.includes(selectedRecipeId)
        ? selectedRecipeId
        : nextWheelIds[0] || "";

    setWheelIds(nextWheelIds);
    setSelectedRecipeId(nextSelectedId);
    if (nextSelectedId) {
      setPointerToIndex(nextWheelIds.indexOf(nextSelectedId), nextWheelIds.length);
    }

    return {
      added,
      total: nextWheelIds.length,
    };
  }

  function saveRecord(nextRecord) {
    setRecords((current) => {
      const exists = current.some((record) => record.id === nextRecord.id);
      const nextRecords = exists
        ? current.map((record) => (record.id === nextRecord.id ? nextRecord : record))
        : [nextRecord, ...current];
      return nextRecords.sort((a, b) => b.date.localeCompare(a.date));
    });
    setRecordEditor(null);
  }

  function deleteRecord(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    const confirmed = window.confirm(`删除 ${formatDisplayDate(record.date)} 的「${record.name}」记录吗？`);
    if (!confirmed) return;
    setRecords((current) => current.filter((item) => item.id !== recordId));
  }

  function syncRecordsToRecipes() {
    const existingNames = new Set(recipes.map((recipe) => normalizeName(recipe.name)));
    const syncBatch = [];

    for (const record of records) {
      const key = normalizeName(record.name);
      if (!key || existingNames.has(key)) continue;
      existingNames.add(key);
      syncBatch.push(record);
    }

    if (!syncBatch.length) {
      setSyncMessage("没有新的菜需要同步。");
      return;
    }
    const now = new Date().toISOString();
    const newRecipes = syncBatch.map((record, index) => ({
      id: createId("recipe"),
      name: record.name,
      note: `${formatDisplayDate(record.date)} 做过，已同步到菜谱`,
      category: "做过的菜",
      image: record.image,
      color: palette[(recipes.length + index) % palette.length],
      createdAt: now,
      updatedAt: now,
    }));
    setRecipes((current) => [...newRecipes, ...current]);
    setSyncMessage(`已同步 ${newRecipes.length} 道新菜到菜谱。`);
  }

  function resetLocalData() {
    const confirmed = window.confirm("恢复初始数据吗？本地新增菜谱、图片和做菜记录会被清空。");
    if (!confirmed) return;
    const nextData = {
      recipes: defaultRecipes.map(ensureRecipeShape),
      wheelIds: defaultRecipes.map((recipe) => recipe.id),
      records: makeDefaultRecords(),
      selectedRecipeId: "mapo-tofu",
    };
    setRecipes(nextData.recipes);
    setWheelIds(nextData.wheelIds);
    setRecords(nextData.records);
    setSelectedRecipeId(nextData.selectedRecipeId);
    pointerRotationRef.current = 0;
    setPointerRotation(0);
    setAvoidRecent(false);
    setSyncMessage("");
    setDataMessage("已恢复初始数据。");
  }

  async function exportLocalData() {
    const payload = {
      app: "小璐今天吃什么",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        recipes,
        records,
        wheelIds,
        selectedRecipeId: selectedRecipe?.id || selectedRecipeId || "",
        settings: {
          avoidRecent,
        },
      },
    };
    const json = JSON.stringify(payload, null, 2);
    const fileName = `小璐今天吃什么-数据备份-${dateInput}.json`;

    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android") {
      try {
        setDataMessage("请选择导出文件的保存位置。");
        await DataExport.saveJson({ fileName, content: json });
        setDataMessage(`已导出 ${recipes.length} 道菜谱、${records.length} 条记录。`);
      } catch (error) {
        const message = String(error?.message || error || "");
        if (message.toLowerCase().includes("cancel")) {
          setDataMessage("已取消导出。");
          return;
        }
        setDataMessage("导出失败：请选择可写入的位置后重试。");
      }
      return;
    }

    const blob = new Blob([json], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDataMessage(`已导出 ${recipes.length} 道菜谱、${records.length} 条记录。`);
  }

  async function importLocalData(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const source = parsed?.data ?? parsed;
      const importedRecipes = Array.isArray(source?.recipes) ? source.recipes : null;
      const importedRecords = Array.isArray(source?.records) ? source.records : null;

      if (!importedRecipes || !importedRecords) {
        throw new Error("invalid backup");
      }

      const confirmed = window.confirm("导入会覆盖当前菜谱、做菜记录和转盘数据，要继续吗？");
      if (!confirmed) return;

      const nextRecipes = importedRecipes.map(ensureRecipeShape);
      const recipeIds = new Set(nextRecipes.map((recipe) => recipe.id));
      const importedWheelIds = Array.isArray(source?.wheelIds)
        ? source.wheelIds
        : Array.isArray(source?.wheel)
          ? source.wheel
          : [];
      let nextWheelIds = dedupeIds(importedWheelIds).filter((id) => recipeIds.has(id));

      if (!nextWheelIds.length && nextRecipes.length) {
        nextWheelIds = nextRecipes.slice(0, Math.min(8, nextRecipes.length)).map((recipe) => recipe.id);
      }

      const nextRecords = importedRecords
        .map(ensureRecordShape)
        .sort((a, b) => b.date.localeCompare(a.date));
      const importedSelectedId = source?.selectedRecipeId;
      const nextSelectedId = nextWheelIds.includes(importedSelectedId)
        ? importedSelectedId
        : nextWheelIds[0] || nextRecipes[0]?.id || "";
      const nextAvoidRecent =
        typeof source?.settings?.avoidRecent === "boolean" ? source.settings.avoidRecent : avoidRecent;

      setRecipes(nextRecipes);
      setRecords(nextRecords);
      setWheelIds(nextWheelIds);
      setSelectedRecipeId(nextSelectedId);
      setAvoidRecent(nextAvoidRecent);
      setPointerToIndex(Math.max(0, nextWheelIds.indexOf(nextSelectedId)), nextWheelIds.length);
      setSyncMessage("");
      setDataMessage(
        `已导入 ${nextRecipes.length} 道菜谱、${nextRecords.length} 条记录、${nextWheelIds.length} 个转盘菜品。`,
      );
    } catch {
      setDataMessage("导入失败：请选择由本应用导出的 JSON 数据文件。");
    }
  }

  const latestRecord = records[0];

  return (
    <main className={`app-canvas view-${activeNav}`} id="top">
      <header className="top-bar">
        <h1>小璐今天吃什么</h1>
      </header>

      {activeNav === "home" && (
        <section className="home-view">
          <div className="daily-row">
            <div className="daily-date">
              <strong>{monthDay}</strong>
              <span>{weekday} · 本地菜单</span>
            </div>
            <button className="add-dish-button" type="button" onClick={() => setShowRecipePicker(true)}>
              <Plus size={23} />
              <span>添加菜品</span>
            </button>
          </div>
          <div className="home-utility">
            <button
              className={`toggle-chip ${avoidRecent ? "is-on" : ""}`}
              type="button"
              onClick={() => setAvoidRecent((current) => !current)}
            >
              <ClockCounterClockwise size={17} />
              避开7天内做过
            </button>
            <span className="utility-pill">
              <CookingPot size={16} />
              {avoidRecent && avoidedRecentCount > 0
                ? `${spinPool.length} 道候选`
                : `${wheelRecipes.length} 道转盘`}
            </span>
          </div>

          {wheelRecipes.length ? (
            <RouletteWheel
              recipes={wheelRecipes}
              selectedRecipe={selectedRecipe}
              selectedIndex={selectedIndex}
              spinning={spinning}
              pointerRotation={pointerRotation}
              onSelect={selectWheelRecipe}
              onSpin={spinWheel}
            />
          ) : (
            <section className="empty-wheel">
              <BowlFood size={48} />
              <h2>转盘还没有菜</h2>
              <p>从菜谱里选几道，小璐就不用纠结了。</p>
              <button className="primary-action" type="button" onClick={() => setShowRecipePicker(true)}>
                <ListPlus size={20} />
                从菜谱添加
              </button>
            </section>
          )}

          {selectedRecipe && (
            <section className="recommend-card" aria-live="polite">
              <div className="stamp">今日推荐</div>
              <div className="recommend-copy">
                <h2>{selectedRecipe.name}</h2>
                <p>{selectedRecipe.note}</p>
                <div className="recommend-tags">
                  <span>{selectedRecipe.category}</span>
                  <span>
                    {selectedLastRecord
                      ? `上次 ${formatDisplayDate(selectedLastRecord.date)}`
                      : "还没记录"}
                  </span>
                </div>
                <div className="recommend-actions">
                  <button className="outline-action" type="button" onClick={spinWheel} disabled={spinning || !wheelRecipes.length}>
                    <ArrowClockwise size={18} />
                    换一个
                  </button>
                </div>
              </div>
              <DishImage
                className="recommend-image"
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                placeholderSize={30}
              />
            </section>
          )}
        </section>
      )}

      {activeNav === "diary" && (
        <section className="tab-view diary-view">
          <div className="tab-heading">
            <div>
              <p className="eyebrow">本地日记</p>
              <h2>菜谱和做菜记录</h2>
            </div>
            <div className="segmented-control" role="tablist" aria-label="日记内容">
              <button
                className={diaryMode === "recipes" ? "active" : ""}
                type="button"
                onClick={() => setDiaryMode("recipes")}
              >
                菜谱
              </button>
              <button
                className={diaryMode === "records" ? "active" : ""}
                type="button"
                onClick={() => setDiaryMode("records")}
              >
                记录
              </button>
            </div>
          </div>
          <label className="search-field diary-search">
            <MagnifyingGlass size={18} />
            <input
              value={diaryQuery}
              type="search"
              placeholder={diaryMode === "recipes" ? "搜索菜名、分类或备注" : "搜索菜名或日期"}
              onChange={(event) => setDiaryQuery(event.target.value)}
            />
            {diaryQuery && (
              <button type="button" onClick={() => setDiaryQuery("")} aria-label="清空搜索">
                <X size={16} />
              </button>
            )}
          </label>

          {diaryMode === "recipes" && (
            <section className="panel manage-panel">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">菜谱库</p>
                  <h2>{diaryQuery ? `${filteredRecipes.length} / ${recipes.length} 道菜` : `${recipes.length} 道菜`}</h2>
                </div>
                <button className="link-button strong" type="button" onClick={() => setRecipeEditor({ addToWheel: false })}>
                  <Plus size={20} />
                  新建
                </button>
              </div>
              <div className="recipe-list">
                {filteredRecipes.map((recipe) => {
                  const inWheel = wheelIds.includes(recipe.id);
                  return (
                    <article className="recipe-row" key={recipe.id}>
                      <DishImage src={recipe.image} alt={recipe.name} placeholderSize={23} />
                      <div className="row-copy">
                        <strong>{recipe.name}</strong>
                        <span>{recipe.category} · {recipe.note}</span>
                      </div>
                      <div className="row-actions">
                        <button className={`icon-pill ${inWheel ? "is-on" : ""}`} type="button" onClick={() => toggleWheelRecipe(recipe.id)}>
                          {inWheel ? <CheckCircle size={18} /> : <ListPlus size={18} />}
                        </button>
                        <button className="icon-pill" type="button" onClick={() => setRecipeEditor({ recipe, addToWheel: false })}>
                          <PencilSimple size={18} />
                        </button>
                        <button className="icon-pill danger" type="button" onClick={() => deleteRecipe(recipe.id)}>
                          <Trash size={18} />
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!filteredRecipes.length && (
                  <div className="empty-state">
                    <Cards size={34} />
                    <strong>{recipes.length ? "没有找到菜谱" : "还没有菜谱"}</strong>
                    <span>{recipes.length ? "换个关键词，或者新建一道菜。" : "新建菜谱后，可以从首页快捷加入转盘。"}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {diaryMode === "records" && (
            <section className="panel manage-panel">
              <div className="section-heading record-heading">
                <div>
                  <p className="eyebrow">哪天做了什么菜</p>
                  <h2>{diaryQuery ? `${filteredRecords.length} / ${records.length} 条记录` : `${records.length} 条记录`}</h2>
                </div>
                <div className="heading-actions">
                  <button className="link-button strong" type="button" onClick={() => setRecordEditor({})}>
                    <Camera size={20} />
                    新增
                  </button>
                  <button className="link-button" type="button" onClick={syncRecordsToRecipes}>
                    <Sparkle size={19} />
                    同步
                  </button>
                </div>
              </div>
              {syncMessage && <p className="sync-note">{syncMessage}</p>}
              <div className="record-list">
                {filteredRecords.map((record) => (
                  <article className="record-row" key={record.id}>
                    <div className="record-date">
                      <strong>{formatDisplayDate(record.date)}</strong>
                      <span>{formatWeekday(record.date)}</span>
                    </div>
                    <DishImage src={record.image} alt={record.name} placeholderSize={20} />
                    <div className="row-copy">
                      <strong>{record.name}</strong>
                      <span>{record.recipeId ? "来自菜谱" : "手动记录"}</span>
                    </div>
                    <div className="row-actions compact">
                      <button className="icon-pill" type="button" onClick={() => setRecordEditor({ record })}>
                        <PencilSimple size={18} />
                      </button>
                      <button className="icon-pill danger" type="button" onClick={() => deleteRecord(record.id)}>
                        <Trash size={18} />
                      </button>
                    </div>
                  </article>
                ))}
                {!filteredRecords.length && (
                  <div className="empty-state">
                    <Images size={34} />
                    <strong>{records.length ? "没有找到记录" : "还没有做菜记录"}</strong>
                    <span>{records.length ? "换个菜名或日期试试。" : "记录日期、菜名和图片，就能慢慢攒成小璐菜单。"}</span>
                  </div>
                )}
              </div>
            </section>
          )}
        </section>
      )}

      {activeNav === "mine" && (
        <section className="tab-view">
          <section className="panel mine-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">我的</p>
                <h2>本地小厨房</h2>
              </div>
              <SealCheck size={30} className="soft-icon" />
            </div>
            <div className="stats-grid">
              <div>
                <strong>{recipes.length}</strong>
                <span>菜谱</span>
              </div>
              <div>
                <strong>{wheelIds.length}</strong>
                <span>转盘菜</span>
              </div>
              <div>
                <strong>{records.length}</strong>
                <span>做菜记录</span>
              </div>
              <div>
                <strong>{syncableRecords.length}</strong>
                <span>待同步</span>
              </div>
            </div>
            {latestRecord && (
              <div className="latest-card">
                <DishImage src={latestRecord.image} alt={latestRecord.name} placeholderSize={26} />
                <div>
                  <span>最近一次</span>
                  <strong>{latestRecord.name}</strong>
                  <p>{formatDisplayDate(latestRecord.date)} · {formatWeekday(latestRecord.date)}</p>
                </div>
              </div>
            )}
            <div className="mine-actions">
              <div className="mine-actions-row primary-row">
                <button
                  className="outline-action"
                  type="button"
                  onClick={() => {
                    setActiveNav("diary");
                    setDiaryMode("recipes");
                  }}
                >
                  <CookingPot size={18} />
                  管理菜谱
                </button>
                <button
                  className="outline-action"
                  type="button"
                  onClick={() => {
                    setActiveNav("diary");
                    setDiaryMode("records");
                  }}
                >
                  <ClockCounterClockwise size={18} />
                  管理记录
                </button>
                <button className="outline-action quiet-danger" type="button" onClick={resetLocalData}>
                  <Trash size={18} />
                  恢复初始
                </button>
              </div>
              <div className="mine-actions-row backup-row">
                <button className="outline-action" type="button" onClick={() => importDataInputRef.current?.click()}>
                  <FileArrowUp size={18} />
                  导入数据
                </button>
                <button className="outline-action filled" type="button" onClick={exportLocalData}>
                  <DownloadSimple size={18} />
                  导出数据
                </button>
              </div>
              <input
                ref={importDataInputRef}
                className="visually-hidden"
                type="file"
                accept="application/json,.json"
                onChange={importLocalData}
              />
              {dataMessage && <p className="data-note">{dataMessage}</p>}
            </div>
          </section>
        </section>
      )}

      <nav className="bottom-nav" aria-label="底部导航">
        <button
          className={activeNav === "home" ? "active" : ""}
          type="button"
          onClick={() => setActiveNav("home")}
        >
          <House size={23} weight={activeNav === "home" ? "fill" : "regular"} />
          首页
        </button>
        <button
          className={activeNav === "diary" ? "active" : ""}
          type="button"
          onClick={() => setActiveNav("diary")}
        >
          <Notebook size={23} weight={activeNav === "diary" ? "fill" : "regular"} />
          日记
        </button>
        <button
          className={activeNav === "mine" ? "active" : ""}
          type="button"
          onClick={() => setActiveNav("mine")}
        >
          <User size={23} weight={activeNav === "mine" ? "fill" : "regular"} />
          我的
        </button>
      </nav>

      {showRecipePicker && (
        <RecipePickerModal
          recipes={recipes}
          wheelIds={wheelIds}
          onClose={() => setShowRecipePicker(false)}
          onToggleWheel={toggleWheelRecipe}
          onSyncAllWheel={syncAllRecipesToWheel}
          onCreateRecipe={() => {
            setShowRecipePicker(false);
            setRecipeEditor({ addToWheel: true });
          }}
        />
      )}

      {recipeEditor && (
        <RecipeFormModal
          recipe={recipeEditor.recipe}
          addToWheel={recipeEditor.addToWheel}
          onClose={() => setRecipeEditor(null)}
          onSave={saveRecipe}
        />
      )}

      {recordEditor && (
        <RecordFormModal
          record={recordEditor.record}
          recipes={recipes}
          defaultRecipe={recordEditor.defaultRecipe}
          defaultDate={dateInput}
          onClose={() => setRecordEditor(null)}
          onSave={saveRecord}
        />
      )}
    </main>
  );
}
