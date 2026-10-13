import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import {
  ArrowClockwise,
  ArrowRight,
  BowlFood,
  Camera,
  Cards,
  CaretRight,
  CaretUp,
  Check,
  CheckCircle,
  ClockCounterClockwise,
  CookingPot,
  DiceFive,
  DownloadSimple,
  FileArrowUp,
  Fire,
  FloppyDisk,
  ForkKnife,
  House,
  Images,
  LightbulbFilament,
  ListPlus,
  MagnifyingGlass,
  Notebook,
  PencilSimple,
  Plus,
  SealCheck,
  ShareNetwork,
  ShoppingCart,
  Sparkle,
  Star,
  Timer,
  Trash,
  UploadSimple,
  User,
  X,
} from "@phosphor-icons/react";

import { defaultRecipes } from "./data/defaultRecipes.js";
import { RouletteWheel } from "./components/RouletteWheel.jsx";
import { MealComboModal } from "./components/MealComboModal.jsx";
import { MysteryCardModal } from "./components/MysteryCardModal.jsx";
import { ShoppingListModal } from "./components/ShoppingListModal.jsx";
import { RecipeDetailModal } from "./components/RecipeDetailModal.jsx";
import { PolaroidCardModal } from "./components/PolaroidCardModal.jsx";

const DataExport = registerPlugin("DataExport");

const STORAGE_KEYS = {
  recipes: "xiaolu-food-wheel:v8:recipes",
  wheelIds: "xiaolu-food-wheel:v8:wheel-ids",
  records: "xiaolu-food-wheel:v8:records",
  selectedRecipeId: "xiaolu-food-wheel:v8:selected-recipe",
  avoidRecent: "xiaolu-food-wheel:v8:avoid-recent",
  shoppingList: "xiaolu-food-wheel:v8:shopping-list",
};

const LEGACY_KEYS = {
  recipesV7: "xiaolu-food-wheel:v7:recipes",
  wheelIdsV7: "xiaolu-food-wheel:v7:wheel-ids",
  recordsV7: "xiaolu-food-wheel:v7:records",
  selectedV7: "xiaolu-food-wheel:v7:selected-recipe",
  avoidRecentV7: "xiaolu-food-wheel:v7:avoid-recent",
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

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
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
    // Local storage quota fallback
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

function getLunarDateText(date = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric",
    });
    const parts = formatter.format(date);
    return `农历${parts.replace("日", "")}`;
  } catch {
    return "农历吉日适宜";
  }
}

function todayParts() {
  const today = new Date();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(today);
  const lunar = getLunarDateText(today);
  return {
    monthDay: `${month} / ${day}`,
    dateInput: formatDateInput(today),
    weekday,
    lunar,
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
  const defaultMatch = defaultRecipes.find((d) => d.id === recipe?.id || d.name === recipe?.name);

  return {
    id: recipe?.id || createId("recipe"),
    name: String(recipe?.name || "未命名菜").trim(),
    tagline: recipe?.tagline || defaultMatch?.tagline || "香气四溢，值得期待",
    note: String(recipe?.note || defaultMatch?.note || "小璐想吃的话，就安排它").trim(),
    category: String(recipe?.category || defaultMatch?.category || "家常菜").trim(),
    type: recipe?.type || defaultMatch?.type || "meat",
    time: recipe?.time || defaultMatch?.time || "20分钟",
    difficulty: recipe?.difficulty || defaultMatch?.difficulty || "入门 ⭐⭐",
    heat: recipe?.heat || defaultMatch?.heat || "🔥 8.5万",
    image: recipe?.image || defaultMatch?.image || "",
    color: recipe?.color || palette[index % palette.length],
    ingredients: recipe?.ingredients || defaultMatch?.ingredients || [],
    steps: recipe?.steps || defaultMatch?.steps || [],
    tips: recipe?.tips || defaultMatch?.tips || "",
    fortune: recipe?.fortune || defaultMatch?.fortune || "今日宜用心烹饪，治愈疲惫生活！",
    createdAt: recipe?.createdAt || now,
    updatedAt: recipe?.updatedAt || now,
  };
}

function makeDefaultRecords() {
  const braisedRibs = defaultRecipes.find((r) => r.id === "braised-ribs")?.image || "";
  const stirFryGreens = defaultRecipes.find((r) => r.id === "stir-fry-greens")?.image || "";
  const cornRibSoup = defaultRecipes.find((r) => r.id === "corn-rib-soup")?.image || "";
  const scallionNoodles = defaultRecipes.find((r) => r.id === "scallion-noodles")?.image || "";

  return [
    {
      id: "record-1",
      name: "红烧排骨",
      recipeId: "braised-ribs",
      date: shiftDate(-1),
      image: braisedRibs,
      rating: 5,
      note: "红亮诱人，炖得酥烂脱骨，小璐炫了两大碗米饭！",
    },
    {
      id: "record-2",
      name: "清炒时蔬",
      recipeId: "stir-fry-greens",
      date: shiftDate(-2),
      image: stirFryGreens,
      rating: 5,
      note: "翠绿爽脆，大火快炒锁住鲜甜，解腻刚刚好。",
    },
    {
      id: "record-3",
      name: "玉米排骨汤",
      recipeId: "corn-rib-soup",
      date: shiftDate(-3),
      image: cornRibSoup,
      rating: 5,
      note: "慢煲了一小时，汤清味甜，玉米鲜甜多汁。",
    },
    {
      id: "record-4",
      name: "葱油拌面",
      recipeId: "scallion-noodles",
      date: shiftDate(-4),
      image: scallionNoodles,
      rating: 4,
      note: "小火慢熬的焦香葱油，拌在细面上香飘满屋。",
    },
  ].map((rec, i) => ensureRecordShape(rec, i));
}

function ensureRecordShape(record) {
  return {
    id: record?.id || createId("record"),
    name: String(record?.name || "未命名菜").trim(),
    recipeId: record?.recipeId || "",
    date: normalizeRecordDate(record?.date),
    image: typeof record?.image === "string" ? record.image : "",
    rating: typeof record?.rating === "number" ? record.rating : 5,
    note: String(record?.note || "用心做的一餐，吃得超满足！").trim(),
    createdAt: record?.createdAt || new Date().toISOString(),
    updatedAt: record?.updatedAt || new Date().toISOString(),
  };
}

function dedupeIds(ids) {
  return Array.from(new Set((ids || []).filter(Boolean)));
}

function buildInitialData() {
  const storedRecipes =
    loadStored(STORAGE_KEYS.recipes, null) || loadStored(LEGACY_KEYS.recipesV7, null);
  const recipeSource =
    Array.isArray(storedRecipes) && storedRecipes.length ? storedRecipes : defaultRecipes;
  const recipes = recipeSource.map(ensureRecipeShape);
  const recipeIdSet = new Set(recipes.map((r) => r.id));

  const storedWheelIds =
    loadStored(STORAGE_KEYS.wheelIds, null) || loadStored(LEGACY_KEYS.wheelIdsV7, null);
  let wheelIds = [];
  if (Array.isArray(storedWheelIds)) {
    wheelIds = storedWheelIds.filter((id) => recipeIdSet.has(id));
  } else {
    wheelIds = defaultRecipes.map((r) => r.id).filter((id) => recipeIdSet.has(id));
  }
  if (!wheelIds.length && recipes.length) {
    wheelIds = recipes.slice(0, Math.min(8, recipes.length)).map((r) => r.id);
  }
  wheelIds = dedupeIds(wheelIds);

  const storedRecords =
    loadStored(STORAGE_KEYS.records, null) || loadStored(LEGACY_KEYS.recordsV7, null);
  const recordSource =
    Array.isArray(storedRecords) && storedRecords.length ? storedRecords : makeDefaultRecords();
  const records = recordSource.map(ensureRecordShape);

  const storedSelected =
    loadStored(STORAGE_KEYS.selectedRecipeId, null) ||
    loadStored(LEGACY_KEYS.selectedV7, null);
  const selectedRecipeId = wheelIds.includes(storedSelected)
    ? storedSelected
    : wheelIds[0] || recipes[0]?.id || "";

  const selectedIndex = Math.max(0, wheelIds.findIndex((id) => id === selectedRecipeId));
  const initialPointerRotation = wheelIds.length ? selectedIndex * (360 / wheelIds.length) : 0;

  const storedShoppingList = loadStored(STORAGE_KEYS.shoppingList, []);

  return {
    recipes,
    wheelIds,
    records,
    selectedRecipeId,
    initialPointerRotation,
    avoidRecent: Boolean(
      loadStored(STORAGE_KEYS.avoidRecent, loadStored(LEGACY_KEYS.avoidRecentV7, false)),
    ),
    shoppingList: Array.isArray(storedShoppingList) ? storedShoppingList : [],
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
  const [tagline, setTagline] = useState(recipe?.tagline ?? "");
  const [note, setNote] = useState(recipe?.note ?? "");
  const [category, setCategory] = useState(recipe?.category ?? "家常菜");
  const [time, setTime] = useState(recipe?.time ?? "15分钟");
  const [type, setType] = useState(recipe?.type ?? "meat");
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
      tagline: tagline.trim() || `${name.trim()}，美味诱人`,
      note: note.trim() || "小璐想吃的话，就安排它",
      category: category.trim() || "家常菜",
      type,
      time: time.trim() || "15分钟",
      difficulty: recipe?.difficulty || "入门 ⭐⭐",
      image: nextImage,
      color: recipe?.color || palette[name.length % palette.length],
      ingredients: recipe?.ingredients || [],
      steps: recipe?.steps || [],
      tips: recipe?.tips || "",
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
          <div className="form-two-cols">
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
              <span>烹饪耗时</span>
              <input
                value={time}
                onChange={(event) => setTime(event.target.value)}
                placeholder="15分钟"
                maxLength={10}
              />
            </label>
          </div>
          <label>
            <span>荤素定位</span>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="meat">荤菜 / 硬菜</option>
              <option value="veg">素菜 / 蔬菜</option>
              <option value="soup">营养靓汤</option>
              <option value="staple">面点主食</option>
            </select>
          </label>
          <label>
            <span>风味特色</span>
            <input
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              placeholder="比如：酸辣开胃，鱼肉滑嫩"
              maxLength={24}
            />
          </label>
          <label>
            <span>心得备注</span>
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
          <button className="primary-action filled-warm" type="submit" disabled={!name.trim() || saving}>
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
  const [rating, setRating] = useState(record?.rating ?? 5);
  const [note, setNote] = useState(record?.note ?? "今天做这道菜，味道绝佳，干饭超香！");
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
      rating,
      note: note.trim() || "用心做的一餐，吃得超满足！",
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
            <p className="eyebrow">做菜打卡 · 生活手账</p>
            <h2>{isEditing ? "编辑打卡记录" : "记录今天吃了什么"}</h2>
          </div>
          <button className="icon-button ghost" type="button" onClick={onClose} aria-label="关闭">
            <X size={22} />
          </button>
        </div>

        <form className="data-form" onSubmit={submit}>
          <label>
            <span>用餐日期</span>
            <input value={date} type="date" onChange={(event) => setDate(event.target.value)} />
          </label>
          <label>
            <span>从菜谱快速关联</span>
            <select value={recipeId} onChange={(event) => chooseRecipe(event.target.value)}>
              <option value="">不关联菜谱，手动填写</option>
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

          <div className="form-rating-row">
            <span>美味评分</span>
            <div className="stars-picker">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`star-pick-btn ${star <= rating ? "active" : ""}`}
                  onClick={() => setRating(star)}
                >
                  <Star size={24} weight={star <= rating ? "fill" : "regular"} />
                </button>
              ))}
              <span className="rating-text-label">
                {rating === 5 ? "绝了！太香了" : rating === 4 ? "很好吃" : "普通家常"}
              </span>
            </div>
          </div>

          <label>
            <span>今天的心得或短评</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="比如：小璐夸赞厨艺大涨、火候刚好"
              maxLength={40}
            />
          </label>

          <label className="file-drop">
            <Camera size={22} />
            <span>{fileName || (image ? "已选择成品图，可重新上传" : "拍照或上传这次做菜的成品图")}</span>
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
              <span>成品图预览</span>
            </div>
          )}
          <button className="primary-action filled-warm" type="submit" disabled={!name.trim() || saving}>
            <FloppyDisk size={20} />
            {saving ? "正在保存" : "打卡保存"}
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
    matchesQuery([recipe.name, recipe.category, recipe.note, recipe.tagline], query),
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
                result.added ? `已同步 ${result.added} 道菜到转盘。` : "菜谱里的菜都在转盘里了。",
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
            placeholder="搜索菜名、分类或口味"
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
                  <span>{recipe.category} · {recipe.tagline || recipe.note}</span>
                </div>
                <button
                  className={`mini-action ${inWheel ? "is-on" : ""}`}
                  type="button"
                  onClick={() => onToggleWheel(recipe.id)}
                >
                  {inWheel ? <Check size={16} /> : <Plus size={16} />}
                  {inWheel ? "已在转盘" : "加入转盘"}
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

export function App() {
  const initialDataRef = useRef(null);
  if (!initialDataRef.current) initialDataRef.current = buildInitialData();

  const importDataInputRef = useRef(null);
  const spinningRef = useRef(false);
  const spinTimeoutRef = useRef(null);
  const pointerRotationRef = useRef(initialDataRef.current.initialPointerRotation);

  const { monthDay, dateInput, weekday, lunar } = useMemo(todayParts, []);
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
  const [shoppingList, setShoppingList] = useState(initialDataRef.current.shoppingList);

  const [homeFilter, setHomeFilter] = useState("all");

  const [showRecipePicker, setShowRecipePicker] = useState(false);
  const [recipeEditor, setRecipeEditor] = useState(null);
  const [recordEditor, setRecordEditor] = useState(null);
  const [showMealCombo, setShowMealCombo] = useState(false);
  const [showMysteryCard, setShowMysteryCard] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [detailRecipe, setDetailRecipe] = useState(null);
  const [polaroidRecord, setPolaroidRecord] = useState(null);

  const [syncMessage, setSyncMessage] = useState("");
  const [dataMessage, setDataMessage] = useState("");
  const [globalToast, setGlobalToast] = useState("");

  function showToast(msg) {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(""), 2400);
  }

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
    let pool = wheelRecipes;
    if (homeFilter !== "all") {
      pool = pool.filter((r) => {
        if (homeFilter === "meat") return r.type === "meat" || r.category?.includes("荤") || r.category?.includes("硬菜");
        if (homeFilter === "veg") return r.type === "veg" || r.category?.includes("素");
        if (homeFilter === "soup") return r.type === "soup" || r.category?.includes("汤");
        if (homeFilter === "quick") return r.category?.includes("快手") || r.type === "staple";
        return true;
      });
    }

    if (avoidRecent) {
      const filtered = pool.filter((recipe) => {
        return !recentCooked.ids.has(recipe.id) && !recentCooked.names.has(normalizeName(recipe.name));
      });
      if (filtered.length) return filtered;
    }

    return pool.length ? pool : wheelRecipes;
  }, [avoidRecent, homeFilter, recentCooked, wheelRecipes]);

  const avoidedRecentCount = avoidRecent ? wheelRecipes.length - spinPool.length : 0;

  const selectedLastRecord = useMemo(() => {
    if (!selectedRecipe) return null;
    const selectedName = normalizeName(selectedRecipe.name);
    return (
      records.find(
        (record) =>
          record.recipeId === selectedRecipe.id || normalizeName(record.name) === selectedName,
      ) || null
    );
  }, [records, selectedRecipe]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) =>
      matchesQuery([recipe.name, recipe.category, recipe.note, recipe.tagline], diaryQuery),
    );
  }, [diaryQuery, recipes]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      matchesQuery(
        [record.name, record.date, formatDisplayDate(record.date), formatWeekday(record.date), record.note],
        diaryQuery,
      ),
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
    saveStored(STORAGE_KEYS.shoppingList, shoppingList);
  }, [shoppingList]);

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
    const freshPool =
      drawPool.length > 1
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
    showToast("菜谱保存成功 ✨");
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
    showToast("做菜打卡成功 🍲");
  }

  function deleteRecord(recordId) {
    const record = records.find((item) => item.id === recordId);
    if (!record) return;
    const confirmed = window.confirm(`删除 ${formatDisplayDate(record.date)} 的「${record.name}」打卡吗？`);
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
      tagline: `${formatDisplayDate(record.date)} 亲自做过`,
      note: `${formatDisplayDate(record.date)} 做过，已同步到菜谱`,
      category: "做过的菜",
      type: "meat",
      time: "20分钟",
      difficulty: "入门 ⭐⭐",
      heat: "🔥 5.2万",
      image: record.image,
      color: palette[(recipes.length + index) % palette.length],
      ingredients: [],
      steps: [],
      tips: "",
      fortune: "自己动手，丰衣足食，美味无穷！",
      createdAt: now,
      updatedAt: now,
    }));
    setRecipes((current) => [...newRecipes, ...current]);
    setSyncMessage(`已同步 ${newRecipes.length} 道新菜到菜谱。`);
  }

  function resetLocalData() {
    const confirmed = window.confirm("恢复初始数据吗？本地新增菜谱、做菜记录与买菜清单会被清空。");
    if (!confirmed) return;
    const nextData = {
      recipes: defaultRecipes.map(ensureRecipeShape),
      wheelIds: defaultRecipes.map((recipe) => recipe.id),
      records: makeDefaultRecords(),
      selectedRecipeId: "mapo-tofu",
      shoppingList: [],
    };
    setRecipes(nextData.recipes);
    setWheelIds(nextData.wheelIds);
    setRecords(nextData.records);
    setSelectedRecipeId(nextData.selectedRecipeId);
    setShoppingList(nextData.shoppingList);
    pointerRotationRef.current = 0;
    setPointerRotation(0);
    setAvoidRecent(false);
    setSyncMessage("");
    setDataMessage("已恢复初始数据。");
  }

  function handleAddIngredientsToShoppingList(recipe) {
    if (!recipe) return;
    const ingredientsToAdd =
      recipe.ingredients && recipe.ingredients.length
        ? recipe.ingredients.map((ing) => ({
            id: createId("item"),
            name: ing.name,
            amount: ing.amount,
            category: ing.category || "其他",
            fromRecipe: recipe.name,
            checked: false,
          }))
        : [
            {
              id: createId("item"),
              name: recipe.name,
              amount: "1份主食材",
              category: "主要食材",
              fromRecipe: recipe.name,
              checked: false,
            },
          ];

    setShoppingList((prev) => {
      const existingNames = new Set(prev.map((p) => p.name));
      const filtered = ingredientsToAdd.filter((item) => !existingNames.has(item.name));
      return [...prev, ...filtered];
    });
    showToast(`已将 ${recipe.name} 所需食材放入菜篮！🛒`);
  }

  function handleToggleShoppingItem(itemId) {
    setShoppingList((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
    );
  }

  function handleAddCustomShoppingItem(item) {
    setShoppingList((prev) => [...prev, { ...item, id: createId("item"), checked: false }]);
  }

  function handleDeleteShoppingItem(itemId) {
    setShoppingList((prev) => prev.filter((i) => i.id !== itemId));
  }

  function handleClearShoppingItems() {
    setShoppingList([]);
  }

  async function exportLocalData() {
    const payload = {
      app: "小璐今天吃什么",
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      data: {
        recipes,
        records,
        wheelIds,
        selectedRecipeId: selectedRecipe?.id || selectedRecipeId || "",
        shoppingList,
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
      const nextShoppingList = Array.isArray(source?.shoppingList) ? source.shoppingList : [];

      setRecipes(nextRecipes);
      setRecords(nextRecords);
      setWheelIds(nextWheelIds);
      setSelectedRecipeId(nextSelectedId);
      setAvoidRecent(nextAvoidRecent);
      setShoppingList(nextShoppingList);
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
  const pendingShoppingCount = shoppingList.filter((i) => !i.checked).length;

  return (
    <main className={`app-canvas view-${activeNav}`} id="top">
      {/* Top Header Bar */}
      <header className="top-bar">
        <div className="top-brand-group">
          <h1>小璐今天吃什么</h1>
          <span className="brand-seal-badge">兼职</span>
        </div>
        <div className="top-actions-cluster">
          <button
            className="icon-action-btn"
            type="button"
            onClick={() => setShowShoppingList(true)}
            aria-label="买菜清单"
            title="菜篮子"
          >
            <ShoppingCart size={22} />
            {pendingShoppingCount > 0 && (
              <span className="cart-badge-dot">{pendingShoppingCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Global Toast */}
      {globalToast && <div className="floating-global-toast">{globalToast}</div>}

      {/* TAB 1: 首页 */}
      {activeNav === "home" && (
        <section className="home-view">
          {/* Greeting Date & Lunar Row */}
          <div className="vintage-daily-header">
            <div className="daily-calendar-block">
              <span className="big-calendar-date">{monthDay}</span>
              <div className="calendar-sub-info">
                <span className="weekday-text">{weekday}</span>
                <span className="lunar-text">{lunar}</span>
              </div>
            </div>
            <div className="header-greeting-callout">
              <p className="callout-handwrite">今天，让小璐帮你决定吧~</p>
              <button
                className="add-dish-handwrite-btn"
                type="button"
                onClick={() => setShowRecipePicker(true)}
              >
                <Plus size={18} weight="bold" />
                <div className="btn-copy">
                  <strong>添加菜品</strong>
                  <small>添加想吃的菜</small>
                </div>
              </button>
            </div>
          </div>

          {/* Quick Decision Feature Entries */}
          <div className="decision-features-row">
            <button
              className="feature-entry-btn combo-entry"
              type="button"
              onClick={() => setShowMealCombo(true)}
            >
              <div className="entry-icon-wrap">
                <ForkKnife size={20} weight="fill" />
              </div>
              <div className="entry-texts">
                <strong>帮我配一餐</strong>
                <small>一荤一素一汤 · 智能组合</small>
              </div>
              <Sparkle size={16} className="entry-spark" />
            </button>

            <button
              className="feature-entry-btn mystery-entry"
              type="button"
              onClick={() => setShowMysteryCard(true)}
            >
              <div className="entry-icon-wrap">
                <DiceFive size={20} weight="fill" />
              </div>
              <div className="entry-texts">
                <strong>盲盒翻牌</strong>
                <small>每日天选吉签</small>
              </div>
              <Sparkle size={16} className="entry-spark" />
            </button>
          </div>

          {/* Roulette Utility Filters */}
          <div className="roulette-control-bar">
            <div className="filter-chips-scroll">
              <button
                type="button"
                className={`filter-chip ${homeFilter === "all" ? "active" : ""}`}
                onClick={() => setHomeFilter("all")}
              >
                全部
              </button>
              <button
                type="button"
                className={`filter-chip ${homeFilter === "meat" ? "active" : ""}`}
                onClick={() => setHomeFilter("meat")}
              >
                🥩 荤菜
              </button>
              <button
                type="button"
                className={`filter-chip ${homeFilter === "veg" ? "active" : ""}`}
                onClick={() => setHomeFilter("veg")}
              >
                🥬 素菜
              </button>
              <button
                type="button"
                className={`filter-chip ${homeFilter === "soup" ? "active" : ""}`}
                onClick={() => setHomeFilter("soup")}
              >
                🥣 靓汤
              </button>
              <button
                type="button"
                className={`filter-chip ${homeFilter === "quick" ? "active" : ""}`}
                onClick={() => setHomeFilter("quick")}
              >
                ⚡ 快手
              </button>
            </div>

            <div className="roulette-toggle-row">
              <button
                className={`toggle-chip ${avoidRecent ? "is-on" : ""}`}
                type="button"
                onClick={() => setAvoidRecent((current) => !current)}
              >
                <ClockCounterClockwise size={15} />
                避开7天内做过
              </button>
              <span className="utility-pill">
                <CookingPot size={15} />
                {avoidRecent && avoidedRecentCount > 0
                  ? `${spinPool.length} 道候选`
                  : `${wheelRecipes.length} 道转盘`}
              </span>
            </div>
          </div>

          {/* The Antique Porcelain Roulette Wheel */}
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
              <button className="primary-action filled-warm" type="button" onClick={() => setShowRecipePicker(true)}>
                <ListPlus size={20} />
                从菜谱添加
              </button>
            </section>
          )}

          {/* Tear-off Ticket Style "今日推荐" Card */}
          {selectedRecipe && (
            <section className="vintage-ticket-card" aria-live="polite">
              <div className="ticket-deckle-edge edge-left" />
              <div className="ticket-deckle-edge edge-right" />

              <div className="ticket-stamp-seal">
                <span>今日</span>
                <span>推荐</span>
              </div>

              <div className="ticket-main-body">
                <div className="ticket-text-col">
                  <h2
                    className="ticket-dish-name"
                    onClick={() => setDetailRecipe(selectedRecipe)}
                    title="点击查看做法"
                  >
                    {selectedRecipe.name}
                  </h2>
                  <p className="ticket-dish-note">
                    {selectedRecipe.tagline || selectedRecipe.note}
                  </p>

                  <div className="ticket-metadata-tags">
                    <span className="meta-tag">{selectedRecipe.category}</span>
                    <span className="meta-tag time-tag">
                      <Timer size={13} />
                      {selectedRecipe.time || "20分钟"}
                    </span>
                    <span className="meta-tag">
                      {selectedLastRecord
                        ? `上次 ${formatDisplayDate(selectedLastRecord.date)}`
                        : "还没做过"}
                    </span>
                  </div>

                  <div className="ticket-action-btns">
                    <button
                      className="ticket-action-pill ghost"
                      type="button"
                      onClick={spinWheel}
                      disabled={spinning || !wheelRecipes.length}
                    >
                      <ArrowClockwise size={16} />
                      换一个
                    </button>
                    <button
                      className="ticket-action-pill ghost"
                      type="button"
                      onClick={() => setDetailRecipe(selectedRecipe)}
                    >
                      <CookingPot size={16} />
                      看做法
                    </button>
                    <button
                      className="ticket-action-pill warm"
                      type="button"
                      onClick={() => handleAddIngredientsToShoppingList(selectedRecipe)}
                      title="加到买菜清单"
                    >
                      <ShoppingCart size={16} />
                      加菜篮
                    </button>
                  </div>
                </div>

                <div
                  className="ticket-dish-figure"
                  onClick={() => setDetailRecipe(selectedRecipe)}
                  title="点击查看做法"
                >
                  <DishImage
                    className="ticket-dish-img"
                    src={selectedRecipe.image}
                    alt={selectedRecipe.name}
                    placeholderSize={32}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Section: 我的菜谱日记 (Horizontal Scroll Bar matching reference design) */}
          <section className="diary-strip-section">
            <div className="strip-header">
              <div className="strip-title-row">
                <h3>我的菜谱日记</h3>
                <span className="strip-decor-leaf">🌿</span>
              </div>
              <button
                type="button"
                className="strip-more-btn"
                onClick={() => {
                  setActiveNav("diary");
                  setDiaryMode("records");
                }}
              >
                <span>全部记录</span>
                <CaretRight size={15} />
              </button>
            </div>

            <div className="diary-horizontal-scroll">
              {records.slice(0, 8).map((rec) => (
                <div
                  key={rec.id}
                  className="diary-dish-thumb-card"
                  onClick={() => setPolaroidRecord(rec)}
                  title="点击生成拍立得美食手账"
                >
                  <div className="thumb-plate-frame">
                    <DishImage src={rec.image} alt={rec.name} placeholderSize={24} />
                  </div>
                  <strong className="thumb-dish-name">{rec.name}</strong>
                  <span className="thumb-dish-date">{rec.date?.slice(5)}</span>
                </div>
              ))}

              <div
                className="diary-upload-thumb-card"
                onClick={() => setRecordEditor({})}
              >
                <div className="upload-dashed-frame">
                  <Camera size={26} weight="duotone" />
                  <span>上传成品图</span>
                </div>
                <small className="upload-tip-text">记录生活</small>
              </div>
            </div>
          </section>

          {/* Section: 学做菜 · 精选教程 (matching reference design) */}
          <section className="recipes-tutorial-section">
            <div className="strip-header">
              <div className="strip-title-row">
                <h3>学做菜 · 精选教程</h3>
              </div>
              <button
                type="button"
                className="strip-more-btn"
                onClick={() => {
                  setActiveNav("diary");
                  setDiaryMode("recipes");
                }}
              >
                <span>查看更多</span>
                <CaretRight size={15} />
              </button>
            </div>

            <div className="tutorial-cards-col">
              {recipes.slice(0, 4).map((recipe) => (
                <article
                  key={recipe.id}
                  className="tutorial-media-card"
                  onClick={() => setDetailRecipe(recipe)}
                >
                  <div className="tutorial-thumb-container">
                    <DishImage
                      src={recipe.image}
                      alt={recipe.name}
                      placeholderSize={28}
                      className="tutorial-cover-img"
                    />
                    <div className="tutorial-video-badge">
                      <div className="play-triangle-icon" />
                      <span>{recipe.time || "15分钟"}</span>
                    </div>
                  </div>

                  <div className="tutorial-content-info">
                    <strong className="tutorial-title">
                      {recipe.name} | {recipe.tagline}
                    </strong>
                    <p className="tutorial-desc">{recipe.note}</p>

                    <div className="tutorial-tags-row">
                      <span className="tut-tag">{recipe.category}</span>
                      <span className="tut-tag">家常美味</span>
                      <span className="tut-heat">{recipe.heat || "🔥 10万+"}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      )}

      {/* TAB 2: 日记 (菜谱库 & 做菜打卡) */}
      {activeNav === "diary" && (
        <section className="tab-view diary-view">
          <div className="tab-heading">
            <div>
              <p className="eyebrow">本地日记 · 美食手账</p>
              <h2>菜谱与做菜打卡</h2>
            </div>
            <div className="segmented-control" role="tablist" aria-label="日记内容">
              <button
                className={diaryMode === "recipes" ? "active" : ""}
                type="button"
                onClick={() => setDiaryMode("recipes")}
              >
                菜谱库
              </button>
              <button
                className={diaryMode === "records" ? "active" : ""}
                type="button"
                onClick={() => setDiaryMode("records")}
              >
                打卡记录
              </button>
            </div>
          </div>

          <label className="search-field diary-search">
            <MagnifyingGlass size={18} />
            <input
              value={diaryQuery}
              type="search"
              placeholder={diaryMode === "recipes" ? "搜索菜名、分类或特色" : "搜索菜名、日期或心得"}
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
                  <h2>
                    {diaryQuery
                      ? `${filteredRecipes.length} / ${recipes.length} 道菜`
                      : `${recipes.length} 道菜`}
                  </h2>
                </div>
                <button
                  className="link-button strong filled-warm"
                  type="button"
                  onClick={() => setRecipeEditor({ addToWheel: false })}
                >
                  <Plus size={18} />
                  新建菜谱
                </button>
              </div>

              <div className="recipe-list">
                {filteredRecipes.map((recipe) => {
                  const inWheel = wheelIds.includes(recipe.id);
                  return (
                    <article className="recipe-row" key={recipe.id}>
                      <div
                        className="recipe-row-clickable"
                        onClick={() => setDetailRecipe(recipe)}
                      >
                        <DishImage src={recipe.image} alt={recipe.name} placeholderSize={23} />
                        <div className="row-copy">
                          <strong>{recipe.name}</strong>
                          <span>
                            {recipe.category} · {recipe.tagline || recipe.note}
                          </span>
                        </div>
                      </div>
                      <div className="row-actions">
                        <button
                          className={`icon-pill ${inWheel ? "is-on" : ""}`}
                          type="button"
                          onClick={() => toggleWheelRecipe(recipe.id)}
                          title={inWheel ? "移出转盘" : "加入转盘"}
                        >
                          {inWheel ? <CheckCircle size={18} /> : <ListPlus size={18} />}
                        </button>
                        <button
                          className="icon-pill"
                          type="button"
                          onClick={() => handleAddIngredientsToShoppingList(recipe)}
                          title="食材加菜篮"
                        >
                          <ShoppingCart size={18} />
                        </button>
                        <button
                          className="icon-pill"
                          type="button"
                          onClick={() => setRecipeEditor({ recipe, addToWheel: false })}
                          title="编辑菜谱"
                        >
                          <PencilSimple size={18} />
                        </button>
                        <button
                          className="icon-pill danger"
                          type="button"
                          onClick={() => deleteRecipe(recipe.id)}
                          title="删除"
                        >
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
                    <span>
                      {recipes.length
                        ? "换个关键词，或者新建一道菜。"
                        : "新建菜谱后，可以从首页快捷加入转盘与买菜清单。"}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}

          {diaryMode === "records" && (
            <section className="panel manage-panel">
              <div className="section-heading record-heading">
                <div>
                  <p className="eyebrow">做菜打卡</p>
                  <h2>
                    {diaryQuery
                      ? `${filteredRecords.length} / ${records.length} 条记录`
                      : `${records.length} 条记录`}
                  </h2>
                </div>
                <div className="heading-actions">
                  <button
                    className="link-button strong filled-warm"
                    type="button"
                    onClick={() => setRecordEditor({})}
                  >
                    <Camera size={18} />
                    打卡记录
                  </button>
                  <button className="link-button" type="button" onClick={syncRecordsToRecipes}>
                    <Sparkle size={18} />
                    同步到菜谱
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
                    <div
                      className="record-row-clickable"
                      onClick={() => setPolaroidRecord(record)}
                      title="点击生成拍立得手账"
                    >
                      <DishImage src={record.image} alt={record.name} placeholderSize={20} />
                      <div className="row-copy">
                        <div className="record-title-stars">
                          <strong>{record.name}</strong>
                          <span className="record-stars-pill">
                            {"⭐".repeat(record.rating || 5)}
                          </span>
                        </div>
                        <span className="record-user-note">
                          “{record.note || "今天做的一餐，超满足！"}”
                        </span>
                      </div>
                    </div>
                    <div className="row-actions compact">
                      <button
                        className="icon-pill"
                        type="button"
                        onClick={() => setPolaroidRecord(record)}
                        title="生成拍立得卡片"
                      >
                        <ShareNetwork size={18} />
                      </button>
                      <button
                        className="icon-pill"
                        type="button"
                        onClick={() => setRecordEditor({ record })}
                        title="编辑"
                      >
                        <PencilSimple size={18} />
                      </button>
                      <button
                        className="icon-pill danger"
                        type="button"
                        onClick={() => deleteRecord(record.id)}
                        title="删除"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </article>
                ))}
                {!filteredRecords.length && (
                  <div className="empty-state">
                    <Images size={34} />
                    <strong>{records.length ? "没有找到记录" : "还没有做菜记录"}</strong>
                    <span>
                      {records.length
                        ? "换个菜名或日期试试。"
                        : "记录日期、菜名、评分和图片，就能生成精致拍立得美食手账！"}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </section>
      )}

      {/* TAB 3: 菜篮子 (买菜清单直接管理) */}
      {activeNav === "shopping" && (
        <section className="tab-view shopping-view">
          <div className="tab-heading">
            <div>
              <p className="eyebrow">菜篮子 · 待买清单</p>
              <h2>智能买菜清单</h2>
            </div>
          </div>
          <section className="panel manage-panel">
            <ShoppingListModal
              items={shoppingList}
              onToggleItem={handleToggleShoppingItem}
              onAddItem={handleAddCustomShoppingItem}
              onDeleteItem={handleDeleteShoppingItem}
              onClearItems={handleClearShoppingItems}
              onClose={() => setActiveNav("home")}
            />
          </section>
        </section>
      )}

      {/* TAB 4: 我的 */}
      {activeNav === "mine" && (
        <section className="tab-view mine-view">
          <section className="panel mine-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">本地小厨房</p>
                <h2>我的美食天地</h2>
              </div>
              <SealCheck size={32} className="soft-icon" />
            </div>

            <div className="stats-grid">
              <div>
                <strong>{recipes.length}</strong>
                <span>菜谱总数</span>
              </div>
              <div>
                <strong>{wheelIds.length}</strong>
                <span>转盘候选</span>
              </div>
              <div>
                <strong>{records.length}</strong>
                <span>做菜打卡</span>
              </div>
              <div>
                <strong>{shoppingList.length}</strong>
                <span>待买食材</span>
              </div>
            </div>

            {latestRecord && (
              <div
                className="latest-card"
                onClick={() => setPolaroidRecord(latestRecord)}
                title="点击生成拍立得卡片"
              >
                <DishImage src={latestRecord.image} alt={latestRecord.name} placeholderSize={26} />
                <div>
                  <span>最近一次烹饪</span>
                  <strong>{latestRecord.name}</strong>
                  <p>
                    {formatDisplayDate(latestRecord.date)} · {formatWeekday(latestRecord.date)} · ⭐
                    {latestRecord.rating || 5}星
                  </p>
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
                  打卡记录
                </button>
                <button
                  className="outline-action quiet-danger"
                  type="button"
                  onClick={resetLocalData}
                >
                  <Trash size={18} />
                  恢复初始
                </button>
              </div>

              <div className="mine-actions-row backup-row">
                <button
                  className="outline-action"
                  type="button"
                  onClick={() => importDataInputRef.current?.click()}
                >
                  <FileArrowUp size={18} />
                  导入数据
                </button>
                <button className="outline-action filled-warm" type="button" onClick={exportLocalData}>
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

      {/* Bottom Floating Navigation Bar */}
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
          className={activeNav === "shopping" ? "active" : ""}
          type="button"
          onClick={() => setShowShoppingList(true)}
        >
          <div className="nav-icon-badge-box">
            <ShoppingCart size={23} weight={activeNav === "shopping" ? "fill" : "regular"} />
            {pendingShoppingCount > 0 && <span className="nav-dot">{pendingShoppingCount}</span>}
          </div>
          菜篮
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

      {/* Modals & Dialogs */}
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

      {showMealCombo && (
        <MealComboModal
          recipes={recipes}
          onClose={() => setShowMealCombo(false)}
          onSelectRecipe={(recipeId) => {
            setSelectedRecipeId(recipeId);
            setShowMealCombo(false);
          }}
          onAddToShoppingList={handleAddIngredientsToShoppingList}
          onViewRecipeDetail={(r) => {
            setShowMealCombo(false);
            setDetailRecipe(r);
          }}
        />
      )}

      {showMysteryCard && (
        <MysteryCardModal
          recipes={recipes}
          onClose={() => setShowMysteryCard(false)}
          onPickRecipe={(recipeId) => {
            setSelectedRecipeId(recipeId);
            const index = wheelRecipes.findIndex((r) => r.id === recipeId);
            if (index >= 0) {
              setPointerToIndex(index, wheelRecipes.length);
            }
            setShowMysteryCard(false);
            showToast("已设为今日天选推荐！✨");
          }}
          onViewRecipeDetail={(r) => {
            setShowMysteryCard(false);
            setDetailRecipe(r);
          }}
        />
      )}

      {showShoppingList && (
        <ShoppingListModal
          items={shoppingList}
          onToggleItem={handleToggleShoppingItem}
          onAddItem={handleAddCustomShoppingItem}
          onDeleteItem={handleDeleteShoppingItem}
          onClearItems={handleClearShoppingItems}
          onClose={() => setShowShoppingList(false)}
        />
      )}

      {detailRecipe && (
        <RecipeDetailModal
          recipe={detailRecipe}
          onClose={() => setDetailRecipe(null)}
          onPickAsTodayRecommendation={(id) => {
            setSelectedRecipeId(id);
            const index = wheelRecipes.findIndex((r) => r.id === id);
            if (index >= 0) {
              setPointerToIndex(index, wheelRecipes.length);
            }
            showToast("已定为今日推荐！✨");
          }}
          onAddToShoppingList={handleAddIngredientsToShoppingList}
          onOpenRecordEditor={(payload) => setRecordEditor(payload)}
        />
      )}

      {polaroidRecord && (
        <PolaroidCardModal
          record={polaroidRecord}
          onClose={() => setPolaroidRecord(null)}
        />
      )}
    </main>
  );
}
