import mapoTofu from "../assets/dishes/mapo-tofu.jpg";
import braisedRibs from "../assets/dishes/braised-ribs.jpg";
import stirFryGreens from "../assets/dishes/stir-fry-greens.jpg";
import cornRibSoup from "../assets/dishes/corn-rib-soup.jpg";
import scallionNoodles from "../assets/dishes/scallion-noodles.jpg";
import tomatoEgg from "../assets/dishes/tomato-egg.jpg";
import colaWings from "../assets/dishes/cola-wings.jpg";
import garlicBroccoli from "../assets/dishes/garlic-broccoli.jpg";
import yuXiangPork from "../assets/dishes/yu-xiang-pork.jpg";

export const defaultRecipes = [
  {
    id: "mapo-tofu",
    name: "麻婆豆腐",
    tagline: "香辣下饭，经典川味 🌶️",
    note: "豆腐嫩滑，肉末酥香，麻辣鲜爽超下饭",
    category: "下饭菜",
    type: "meat", // meat | veg | soup | staple
    time: "15分钟",
    difficulty: "入门 ⭐⭐",
    heat: "🔥 12.6万",
    image: mapoTofu,
    color: "#c96b5d",
    ingredients: [
      { name: "嫩豆腐", amount: "1盒 (400g)", category: "豆品" },
      { name: "牛肉末/猪肉末", amount: "80g", category: "肉类" },
      { name: "郫县豆瓣酱", amount: "1.5汤匙", category: "调料" },
      { name: "花椒粉", amount: "1茶匙", category: "调料" },
      { name: "青蒜苗", amount: "2根", category: "蔬菜" },
      { name: "蒜末姜末", amount: "适量", category: "调料" },
      { name: "水淀粉", amount: "3汤匙", category: "调料" },
    ],
    steps: [
      "豆腐切2cm小方块，放入加了一茶匙盐的沸水中焯烫30秒，去豆腥并使豆腐不易散碎，捞出控干。",
      "热锅倒入适量植物油，下入肉末小火煸炒至水分收干、金黄酥香。",
      "加入郫县豆瓣酱和姜蒜末，转小火炒出红亮红油，随后倒入适量清水或高汤煮沸。",
      "滑入焯好水的豆腐块，轻轻推匀，调入少许生抽，盖盖中小火煨炖3分钟入味。",
      "分三次淋入薄水淀粉轻轻推锅勾芡收汁，撒入切好的青蒜碎推匀后关火出锅，最后趁热撒上一层现磨花椒粉即可。"
    ],
    tips: "焯豆腐加少许盐能让蛋白质凝固不易破碎；出锅趁热撒花椒粉才能激发出独特的麻香味！",
    fortune: "今日宜麻辣下饭，红红火火，把所有烦恼通通干掉！"
  },
  {
    id: "tomato-egg",
    name: "番茄炒蛋",
    tagline: "酸甜开胃，家常必备 🍅",
    note: "掌握番茄去皮和炒蛋嫩滑的诀窍，拌饭绝绝子",
    category: "快手菜",
    type: "veg",
    time: "10分钟",
    difficulty: "零失败 ⭐",
    heat: "🔥 8.3万",
    image: tomatoEgg,
    color: "#db8a5a",
    ingredients: [
      { name: "熟透西红柿", amount: "2个 (约300g)", category: "蔬菜" },
      { name: "新鲜鸡蛋", amount: "3个", category: "蛋类" },
      { name: "小葱", amount: "1根", category: "蔬菜" },
      { name: "白糖", amount: "1茶匙", category: "调料" },
      { name: "食盐", amount: "1茶匙", category: "调料" },
      { name: "食用油", amount: "2汤匙", category: "调料" },
    ],
    steps: [
      "西红柿顶部划十字刀，开水烫30秒撕去外皮，切成适口的小滚刀块。",
      "鸡蛋打入碗中，加一小撮盐和1汤匙清水充分搅打均匀，加水能让炒蛋蓬松嫩滑。",
      "热锅下稍多一点油，烧至微冒青烟倒入蛋液，大火快速划散凝固后立即盛出，不要炒老。",
      "锅底留少许油，下葱白爆香，倒入番茄块中火慢炒2分钟，用锅铲轻压压出浓郁红沙汤汁。",
      "调入白糖中和酸味并加盐提味，倒回炒好的鸡蛋翻拌均匀吸饱番茄汁，撒上翠绿葱花出锅。"
    ],
    tips: "挑选软熟起沙的番茄出汁更浓郁；蛋液里加一勺清水是让炒蛋松软滑嫩的秘密武器！",
    fortune: "今日宜酸甜可口，治愈身心，每一口都是温柔的阳光味。"
  },
  {
    id: "braised-ribs",
    name: "红烧排骨",
    tagline: "浓油赤酱，肉香软烂 🍖",
    note: "周末认真犒赏自己，酥软脱骨，香气满屋",
    category: "硬菜",
    type: "meat",
    time: "45分钟",
    difficulty: "进阶 ⭐⭐⭐",
    heat: "🔥 15.2万",
    image: braisedRibs,
    color: "#a85f45",
    ingredients: [
      { name: "精选肋排", amount: "500g", category: "肉类" },
      { name: "老冰糖", amount: "25g", category: "调料" },
      { name: "生姜与大葱", amount: "姜4片/葱1截", category: "蔬菜" },
      { name: "八角/桂皮/香叶", amount: "八角2个/桂皮1小块", category: "调料" },
      { name: "生抽与老抽", amount: "生抽2勺/老抽1勺", category: "调料" },
      { name: "料酒", amount: "2汤匙", category: "调料" },
      { name: "熟白芝麻", amount: "少许", category: "调料" },
    ],
    steps: [
      "肋排斩小段，冷水下锅加入姜片料酒，大火煮沸焯水2分钟撇去血沫，温水冲洗干净沥干备用。",
      "热锅凉油，放入冰糖开最小火慢炒，用铲子顺时针搅动，待冰糖完全融化并泛起密集细密的琥珀色小气泡。",
      "立刻倒入控干水分的排骨，迅速大火翻炒，让每块排骨均匀裹上红亮诱人的糖色。",
      "加入姜片、葱段、八角、桂皮、香叶炒出复合香气，烹入生抽、老抽和料酒翻炒均匀。",
      "一次性倒入没过排骨的足量开水（切忌冷水），大火烧开后盖锅盖转小火慢炖35分钟至肉质软烂。",
      "挑出香料残渣，大火翻炒收浓酱汁直至汤汁浓稠油亮挂在排骨上，出锅撒上白芝麻点缀。"
    ],
    tips: "炒糖色时要全程最小火，看到起密集琥珀色小泡立即下排骨；炖肉一定要加开水，肉质才能软烂不柴！",
    fortune: "今日宜大口吃肉，丰衣足食，满满能量让你元气爆棚！"
  },
  {
    id: "stir-fry-greens",
    name: "清炒时蔬",
    tagline: "碧绿脆嫩，爽口解腻 🥬",
    note: "清爽素雅，营养丰富，健康低卡无负担",
    category: "素菜",
    type: "veg",
    time: "8分钟",
    difficulty: "简单 ⭐",
    heat: "🔥 6.8万",
    image: stirFryGreens,
    color: "#8b9c73",
    ingredients: [
      { name: "时令绿叶蔬菜", amount: "350g (菜心/油麦菜/上海青)", category: "蔬菜" },
      { name: "大蒜", amount: "3瓣 (切片)", category: "蔬菜" },
      { name: "食盐", amount: "0.5茶匙", category: "调料" },
      { name: "白糖/鸡精", amount: "少许提鲜", category: "调料" },
      { name: "食用油", amount: "1.5汤匙", category: "调料" },
    ],
    steps: [
      "时蔬彻底洗净沥干水分（水分过多容易导致炒菜变成水煮菜，影响翠绿口感）。",
      "热锅注入食用油，待油温七成热时倒入蒜片，中火煸炒出浓郁蒜香。",
      "转大火，倒入沥干的时蔬迅速翻炒约1分钟，使菜叶均匀受热并迅速断生变软。",
      "出锅前30秒调入食盐和极少许白糖提鲜，颠勺大火翻匀后立即关火装盘。"
    ],
    tips: "炒蔬菜三要素：热锅、宽油、大火快炒，锁住植物叶绿素，才能保持鲜亮碧绿脆爽！",
    fortune: "今日宜清淡养胃，如沐春风，身体轻盈整天都舒服。"
  },
  {
    id: "cola-wings",
    name: "可乐鸡翅",
    tagline: "酱香浓郁，甜咸适中 🍗",
    note: "肉质鲜嫩多汁，外焦里嫩，简单好做零失误",
    category: "家常菜",
    type: "meat",
    time: "25分钟",
    difficulty: "入门 ⭐⭐",
    heat: "🔥 11.4万",
    image: colaWings,
    color: "#b86f4d",
    ingredients: [
      { name: "新鲜鸡中翅", amount: "8-10个 (约400g)", category: "肉类" },
      { name: "原味可乐", amount: "半罐 (160ml)", category: "饮品" },
      { name: "生姜与大葱", amount: "姜4片/大葱1截", category: "蔬菜" },
      { name: "生抽与老抽", amount: "生抽2勺/老抽半勺调色", category: "调料" },
      { name: "料酒", amount: "1汤匙", category: "调料" },
      { name: "熟白芝麻", amount: "少许", category: "调料" },
    ],
    steps: [
      "鸡翅两面各划两刀便于腌制入味，冷水加姜片料酒下锅焯水去腥，沸腾1分钟后捞出擦干表面水分。",
      "平底锅微热刷少许底油，放入鸡翅中小火慢煎，煎至两面金黄且鸡皮微微逼出油脂。",
      "投入葱段和姜片煸炒出香，烹入生抽和老抽翻炒至鸡翅均匀上色。",
      "倒入可乐，液面大致与鸡翅齐平，大火烧开后盖上锅盖转小火焖煮15分钟至鸡肉软嫩入味。",
      "开盖转大火收汁，不断用锅铲轻轻翻动鸡翅，让酱汁浓缩并紧紧挂在鸡翅表面，出锅撒上白芝麻。"
    ],
    tips: "鸡翅提前划刀更容易入味；收汁阶段可乐糖分浓缩快，需要守在锅边不停翻炒防止糊底。",
    fortune: "今日宜吃鸡翅，大吉大利，美味甜香带给你一整天的好心情！"
  },
  {
    id: "garlic-broccoli",
    name: "蒜蓉西兰花",
    tagline: "翠绿清香，低卡健康 🥦",
    note: "金银双蒜风味层次分明，配饭不腻超清爽",
    category: "素菜",
    type: "veg",
    time: "10分钟",
    difficulty: "零失败 ⭐",
    heat: "🔥 7.9万",
    image: garlicBroccoli,
    color: "#7f956c",
    ingredients: [
      { name: "新鲜西兰花", amount: "1朵 (约300g)", category: "蔬菜" },
      { name: "大蒜", amount: "5瓣 (剁成细腻蒜末)", category: "蔬菜" },
      { name: "蚝油", amount: "1汤匙", category: "调料" },
      { name: "生抽", amount: "1汤匙", category: "调料" },
      { name: "食盐", amount: "0.5茶匙", category: "调料" },
      { name: "水淀粉", amount: "2汤匙", category: "调料" },
    ],
    steps: [
      "西兰花切成小朵，放进淡盐水中浸泡10分钟洗净杂质后沥水。",
      "锅中烧足量开水，滴几滴植物油并加半茶匙盐，下西兰花焯烫60秒变翠绿立即捞出，摆入盘中。",
      "锅中热油，先下入一半蒜末小火慢炒至金黄酥香（金蒜）。",
      "加入剩余的一半生蒜末（银蒜），调入蚝油、生抽和少许清水煮开，淋入水淀粉勾薄芡成浓香蒜汁。",
      "将熬好的浓郁金银蒜蓉酱汁均匀淋在摆好的西兰花上即可上桌。"
    ],
    tips: "金银蒜做法让蒜香味既有焦香又有生蒜的清甜；焯水加油盐能保持西兰花长久碧绿不发黄。",
    fortune: "今日宜补充维生素，清爽身心，健康生活从一朵翠绿西兰花开始！"
  },
  {
    id: "yu-xiang-pork",
    name: "鱼香肉丝",
    tagline: "酸甜咸香，川味下饭王 🥢",
    note: "经典万能鱼香汁，肉丝滑嫩，木耳笋丝清脆爽口",
    category: "川菜",
    type: "meat",
    time: "20分钟",
    difficulty: "进阶 ⭐⭐⭐",
    heat: "🔥 13.8万",
    image: yuXiangPork,
    color: "#c07b58",
    ingredients: [
      { name: "猪里脊肉", amount: "250g (切细丝)", category: "肉类" },
      { name: "黑木耳", amount: "50g (泡发切丝)", category: "蔬菜" },
      { name: "胡萝卜与青椒", amount: "各半个 (切细丝)", category: "蔬菜" },
      { name: "郫县豆瓣酱/泡椒", amount: "1汤匙 (剁碎)", category: "调料" },
      { name: "万能鱼香汁", amount: "陈醋2勺/白糖2勺/生抽2勺/淀粉1勺/清水3勺", category: "调料" },
      { name: "葱姜蒜末", amount: "各1大勺", category: "调料" },
    ],
    steps: [
      "里脊肉顺纹切丝，加料酒1勺、生抽1勺、白胡椒粉和淀粉抓匀上浆，最后封1勺食用油锁水腌制10分钟。",
      "小碗调好万能鱼香汁：陈醋2勺、白糖2勺、生抽2勺、老抽半勺、玉米淀粉1勺、清水3勺搅拌均匀备用。",
      "热锅温油滑入肉丝，大火快速滑炒至肉丝变白断生，立即盛出控油备用。",
      "锅底留少许油，下葱姜蒜末和剁碎的豆瓣酱、泡椒末小火炒出红油与浓厚香气。",
      "倒入胡萝卜丝、木耳丝和青椒丝大火翻炒断生，倒回肉丝翻炒均匀。",
      "沿锅边淋入调好的鱼香料汁，大火快速翻炒收汁，见汤汁浓稠光亮即可关火出锅。"
    ],
    tips: "万能鱼香汁口诀：糖醋生抽比例2:2:2，酸甜微辣咸鲜回甘；肉丝滑油动作要快，保持嫩度！",
    fortune: "今日宜大饱口福，酸甜开胃，胃口大开连吃三碗米饭！"
  },
  {
    id: "scallion-noodles",
    name: "葱油拌面",
    tagline: "葱香浓郁，江南风味 🍜",
    note: "懒人晚餐的不二之选，焦香小葱与劲道面条的绝妙碰撞",
    category: "面食",
    type: "staple",
    time: "15分钟",
    difficulty: "入门 ⭐⭐",
    heat: "🔥 9.5万",
    image: scallionNoodles,
    color: "#c49a62",
    ingredients: [
      { name: "鲜切细面条", amount: "200g (或挂面)", category: "主食" },
      { name: "新鲜小香葱", amount: "一把 (约80g，取葱绿切长段)", category: "蔬菜" },
      { name: "食用油", amount: "4汤匙", category: "调料" },
      { name: "生抽与老抽", amount: "生抽3勺/老抽2勺", category: "调料" },
      { name: "白糖", amount: "1.5汤匙", category: "调料" },
    ],
    steps: [
      "香葱洗净彻底擦干水分（防止下油锅爆溅），切成5cm长的葱段，留葱绿为佳。",
      "锅中倒入植物油，冷油下入葱段，全程开最小火慢熬，让葱香缓缓融入油中。",
      "慢熬约8-10分钟，待葱段逐渐缩水变脆并呈现焦黄色时，用筷子捞出一半焦葱段留作装饰备用。",
      "锅内余油中调入生抽、老抽和白糖，小火慢慢搅拌煮沸至起密集小泡即可关火，葱油调味汁完成。",
      "另起锅烧开水，下入面条煮熟至刚刚断生，捞出控干水分装入面碗。",
      "淋上2-3勺自制滚烫葱油酱汁，铺上香脆焦葱段，迅速挑拌均匀即可享用。"
    ],
    tips: "熬葱油一定要全程最小火耐心慢炸，葱香才会深沉不发苦；煮好的面条沥干水分拌汁更入味！",
    fortune: "今日宜嗦面吸粉，碳水快乐，简简单单也是人间至味！"
  },
  {
    id: "corn-rib-soup",
    name: "玉米排骨汤",
    tagline: "清甜甘润，暖心暖胃 🥣",
    note: "慢火炖煮出乳白原汤，玉米清甜与排骨肉香完美交融",
    category: "靓汤",
    type: "soup",
    time: "60分钟",
    difficulty: "入门 ⭐⭐",
    heat: "🔥 14.1万",
    image: cornRibSoup,
    color: "#d19a63",
    ingredients: [
      { name: "新鲜排骨/大骨", amount: "400g", category: "肉类" },
      { name: "甜玉米", amount: "1根 (切厚轮状)", category: "蔬菜" },
      { name: "胡萝卜", amount: "1根 (切滚刀块)", category: "蔬菜" },
      { name: "生姜与葱结", amount: "生姜4片/葱结1个", category: "蔬菜" },
      { name: "料酒", amount: "1汤匙", category: "调料" },
      { name: "食盐与枸杞", amount: "盐适量/枸杞10粒", category: "调料" },
    ],
    steps: [
      "排骨冷水下锅加入姜片料酒，大火煮沸后撇尽浮沫，捞出用温水冲洗干净沥水。",
      "准备砂锅或炖汤锅，倒入足量温开水，放入排骨、生姜片和葱结。",
      "大火烧开后转小火慢煲35分钟，让排骨肉质与骨香慢慢释放。",
      "倒入切好的甜玉米块和胡萝卜块，盖好锅盖继续小火慢炖20分钟至食材软熟。",
      "临出锅前5分钟挑出已软烂的葱结，投入枸杞，调入适量食盐搅拌均匀即可关火享用。"
    ],
    tips: "煲汤讲究一气呵成，炖煮过程中尽量不频繁开盖添水；玉米天然清甜无需加鸡精味精！",
    fortune: "今日宜喝温润靓汤，滋补身心，一口热汤熨帖整天的疲倦。"
  },
];
