// ===== 単語の本（Lesson 2〜35） =====
// 書き方：英語|日本語|絵文字   （a / an / the は自動で外して「つけることば」として表示）
// 同じつづりで意味がちがうことばは  light#2  のように # で区別します。
// この順番で「きょうのワンセット」の新しいことばになります。
const BOOK = [
{ n:2, title:"Food", ja:"たべもの", icon:"🍞", list:`
bread|パン|🍞
butter|バター|🧈
jam|ジャム|
hamburger|ハンバーガー|🍔
hot dog|ホットドッグ|🌭
French fries|フライドポテト|🍟
sandwich|サンドイッチ|🥪
pizza|ピザ|🍕
ham and eggs|ハムエッグ|🍳
cheese|チーズ|🧀
sausage|ソーセージ|
soup|スープ|🍲
steak|ステーキ|🥩
pasta|パスタ|🍝
curry and rice|カレーライス|🍛
stew|シチュー|
salad|サラダ|🥗
rice|ごはん・おこめ|🍚
beef|ぎゅうにく|
pork|ぶたにく|
chicken#food|とりにく|🍗
fish|さかな|🐟
`},
{ n:3, title:"Dessert and Drink", ja:"デザートとのみもの", icon:"🍰", list:`
candy|あめ（おかし）|🍬
chocolate|チョコレート|🍫
gum|ガム|
potato chips|ポテトチップス|
popcorn|ポップコーン|🍿
donut|ドーナツ|🍩
apple pie|アップルパイ|🥧
cake|ケーキ|🍰
cream puff|シュークリーム|
cookie|クッキー|🍪
pudding|プリン|🍮
yogurt|ヨーグルト|
ice cream|アイスクリーム|🍨
soft ice cream|ソフトクリーム|🍦
sherbet|シャーベット|🍧
cola|コーラ|🥤
juice|ジュース|🧃
shake|シェイク|
milk|ぎゅうにゅう|🥛
coffee|コーヒー|☕
tea|こうちゃ|
cocoa|ココア|
green tea|りょくちゃ|🍵
water|みず|💧
`},
{ n:4, title:"Colors and Shapes", ja:"いろとかたち", icon:"🎨", list:`
white|しろ|⚪
yellow|きいろ|🟡
orange|オレンジ（いろ・くだもの）|
green|みどり|🟢
purple|むらさき|🟣
pink|ピンク|🎀
red|あか|🔴
brown|ちゃいろ|🟤
gray|はいいろ|
black|くろ|⚫
blue|あお|🔵
a star|ほし|⭐
a circle|まる|⭕
a triangle|さんかく・トライアングル|🔺
a square|しかく（せいほうけい）|🟥
a rectangle|ちょうほうけい|
a pentagon|ごかっけい|
a ring|わ・ゆびわ|💍
a heart|ハート|❤️
a diamond|ひしがた|🔷
`},
{ n:5, title:"My face and body", ja:"かおとからだ", icon:"👂", list:`
an eyebrow|まゆげ|
hair|かみのけ|💇
an ear|みみ|👂
a nose|はな|👃
a mouth|くち|👄
a chin|あご|
a cheek|ほお|
an eye|め|👁️
an eyelash|まつげ|
a lip|くちびる|💋
a tongue|した|👅
a tooth|は（1本）|🦷
a head|あたま|
a neck|くび|
a chest|むね|
a knee|ひざ|
a heel|かかと|
a toe|あしのゆび|
an ankle|あしくび|
a stomach|おなか|
an elbow|ひじ|
a wrist|てくび|
a finger|ゆび|☝️
a thumb|おやゆび|👍
an arm|うで|💪
a hand|て|✋
a hip|こし|
a foot|あし（足くびから下）|🦶
a leg|あし（ももから下）|🦵
a back|せなか|
a shoulder|かた|
`},
{ n:6, title:"Clothing", ja:"みにつけるもの", icon:"👕", list:`
a shirt|シャツ|👔
a T-shirt|Tシャツ|👕
a sweatshirt|トレーナー|
a jacket|ジャケット・うわぎ|🧥
a sweater|セーター|
a vest|ベスト|
a cardigan|カーディガン|
a suit|スーツ|
jeans|ジーンズ|
pants|ズボン|👖
a skirt|スカート|
a wedding dress|ウエディングドレス|
an apron|エプロン|
pajamas|パジャマ|
a raincoat|レインコート|
a uniform|せいふく|
a cap|ぼうし（キャップ）|🧢
a hat|ぼうし（ハット）|👒
gloves|てぶくろ|🧤
a scarf|マフラー|🧣
a belt|ベルト|
a tie|ネクタイ|
glasses|めがね|👓
a handkerchief|ハンカチ|
socks|くつした|🧦
shoes|くつ|👟
rain boots|ながぐつ|👢
`},
{ n:7, title:"Stand up, please.", ja:"うごき", icon:"🏃", list:`
walk|あるく|🚶
run|はしる|🏃
jump|とぶ・ジャンプする|
skip|スキップする|
turn|まわる・まがる|
stop|とまる|🛑
stand up|たつ|
sit down|すわる|
clap|てをたたく|👏
open a window|まどをあける|
shut a door|ドアをしめる|
cook|りょうりする・りょうりにん|🧑‍🍳
catch a ball|ボールをとる|
throw a ball|ボールをなげる|
call|よぶ・でんわする|📞
sing|うたう|🎤
dance|おどる|💃
fly|とぶ（そらを）|
`},
{ n:8, title:"Numbers", ja:"かず", icon:"🔢", list:`
one|1|1
two|2|2
three|3|3
four|4|4
five|5|5
six|6|6
seven|7|7
eight|8|8
nine|9|9
ten|10|10
eleven|11|11
twelve|12|12
`},
{ n:9, title:"The world", ja:"せかい", icon:"🌏", list:`
Norway|ノルウェー|🇳🇴
Denmark|デンマーク|🇩🇰
Great Britain|イギリス|🇬🇧
Spain|スペイン|🇪🇸
France|フランス|🇫🇷
Germany|ドイツ|🇩🇪
Switzerland|スイス|🇨🇭
Italy|イタリア|🇮🇹
Egypt|エジプト|🇪🇬
Russia|ロシア|🇷🇺
India|インド|🇮🇳
China|ちゅうごく|🇨🇳
Singapore|シンガポール|🇸🇬
Japan|にほん|🇯🇵
Korea|かんこく|🇰🇷
Australia|オーストラリア|🇦🇺
Canada|カナダ|🇨🇦
the United States|アメリカ|🇺🇸
Brazil|ブラジル|🇧🇷
`},
{ n:10, title:"My family", ja:"かぞく", icon:"👨‍👩‍👧", list:`
sister|しまい（あね・いもうと）|👧
brother|きょうだい（あに・おとうと）|👦
grandmother|おばあさん|👵
grandma|おばあちゃん|
grandfather|おじいさん|👴
grandpa|おじいちゃん|
father|おとうさん|👨
dad|パパ（おとうさん）|
mother|おかあさん|👩
mom|ママ（おかあさん）|
parents|りょうしん|
uncle|おじ|🧔
aunt|おば|👱‍♀️
cousin|いとこ|
son|むすこ|
wife|つま|
husband|おっと|
daughter|むすめ|
`},
{ n:11, title:"Our house", ja:"いえ（そと）", icon:"🏠", list:`
a garage|ガレージ|
a car|くるま|🚗
a chimney|えんとつ|
a roof|やね|
a shutter|シャッター|
a gate|もん|
a step|だん（かいだんの1だん）|
a door|ドア|🚪
an intercom|インターホン|
a nameplate|ひょうさつ|
a flower bed|かだん|
a window|まど|🪟
a garden|にわ|
a pond|いけ|
a lawn|しばふ|
a wall|かべ|🧱
a fence|フェンス・へい|
`},
{ n:12, title:"In our house", ja:"いえのなか", icon:"🛁", list:`
an entrance|げんかん|
stairs|かいだん|
a dining room|ダイニング（しょくじのへや）|
a kitchen|だいどころ|
a living room|いま（リビング）|
a bedroom|しんしつ|
a bathroom|おふろば|
a toilet|トイレ|🚽
soap|せっけん|🧼
shampoo|シャンプー|
rinse|リンス|
a shower|シャワー|🚿
a mirror|かがみ|🪞
a toothbrush|はブラシ|🪥
a tissue|ティッシュ|
a hair dryer|ドライヤー|
a washing machine|せんたくき|
slippers|スリッパ|
a scale|たいじゅうけい|
`},
{ n:13, title:"Our living room", ja:"いま", icon:"🛋️", list:`
an air conditioner|エアコン|
a TV|テレビ|📺
a telephone|でんわ|☎️
a photo|しゃしん|
a stereo|ステレオ|
a computer|コンピューター|💻
a printer|プリンター|🖨️
a keyboard|キーボード|⌨️
a picture|え（かいが）|🖼️
a vacuum cleaner|そうじき|
a cell phone|けいたいでんわ|📱
a floor|ゆか|
a cushion|クッション|
a newspaper|しんぶん|📰
a remote control|リモコン|
a table|テーブル|
a magazine|ざっし|
a vase|かびん|🏺
a rug|しきもの|
a light|あかり・でんとう|💡
a sofa|ソファー|🛋️
`},
{ n:14, title:"Our kitchen", ja:"だいどころ", icon:"🍳", list:`
a microwave oven|でんしレンジ|
oil|あぶら|
pepper|こしょう|
salt|しお|🧂
a sink|ながし|
a frying pan|フライパン|
a pot|なべ|
a gas stove|ガスコンロ|
a refrigerator|れいぞうこ|
a cupboard|しょっきだな|
a glass|コップ（グラス）|🥃
a dish|さら|
a plate|おさら（とりざら）|🍽️
a spoon|スプーン|🥄
a fork|フォーク|🍴
a knife|ナイフ|🔪
a kettle|やかん|
a tablecloth|テーブルクロス|
a trash can|ごみばこ|🗑️
sugar|さとう|
a cup|カップ|
a teapot|ティーポット|🫖
`},
{ n:15, title:"My room", ja:"わたしのへや", icon:"🛏️", list:`
a curtain|カーテン|
a CD|CD|💿
a CD player|CDプレーヤー|
a camera|カメラ|📷
a bookcase|ほんだな|
a globe|ちきゅうぎ|🌐
a desk|つくえ|
a calendar|カレンダー|📅
a book|ほん|📕
a bat|バット|🏏
a poster|ポスター|
a chair|いす|🪑
a ball|ボール|
a comic book|まんが|
an album|アルバム|
a glove|グローブ|
a bag|かばん|🎒
a bed|ベッド|🛏️
a pillow|まくら|
`},
{ n:16, title:"In the country", ja:"いなか", icon:"🌾", list:`
woods|はやし・もり|
the sky|そら|
a temple|おてら|
a bush|しげみ|
an orchard|かじゅえん|
an expressway|こうそくどうろ|🛣️
a rice field|たんぼ|🌾
a hill|おか|
an amusement park|ゆうえんち|🎡
a lake|みずうみ|
a hotel|ホテル|🏨
a road|みち|
a ball park|やきゅうじょう|🏟️
`},
{ n:17, title:"In the town", ja:"まち", icon:"🏙️", list:`
a station|えき|🚉
a museum|はくぶつかん・びじゅつかん|🏛️
a supermarket|スーパー|
a parking lot|ちゅうしゃじょう|🅿️
a family restaurant|ファミリーレストラン|
a factory|こうじょう|🏭
a bus stop|バスてい|🚏
a crosswalk|おうだんほどう|
a park|こうえん|⛲
a vending machine|じどうはんばいき|
a school|がっこう|🏫
a police station|けいさつしょ|
a post office|ゆうびんきょく|🏤
a fire station|しょうぼうしょ|
a convenience store|コンビニ|🏪
an intersection|こうさてん|
a bookstore|ほんや|
a theater|げきじょう・えいがかん|🎭
a department store|デパート|🏬
a street|とおり|
a traffic light|しんごう|🚦
a bank|ぎんこう|🏦
a hospital|びょういん|🏥
`},
{ n:18, title:"Fruits", ja:"くだもの", icon:"🍎", list:`
apple|りんご|🍎
banana|バナナ|🍌
orange|オレンジ（いろ・くだもの）|
cherry|さくらんぼ|🍒
strawberry|いちご|🍓
blueberry|ブルーベリー|🫐
grapes|ぶどう|🍇
grapefruit|グレープフルーツ|
lemon|レモン|🍋
melon|メロン|🍈
watermelon|すいか|🍉
peach|もも|🍑
fig|いちじく|
pear|ようなし|🍐
persimmon|かき（くだもの）|
kiwi|キウイ|🥝
mango|マンゴー|🥭
pineapple|パイナップル|🍍
chestnut|くり|🌰
walnut|くるみ|
coconut|ココナッツ|🥥
`},
{ n:19, title:"Vegetables", ja:"やさい", icon:"🥕", list:`
carrot|にんじん|🥕
onion|たまねぎ|🧅
potato|じゃがいも|🥔
cucumber|きゅうり|🥒
lettuce|レタス|🥬
tomato|トマト|🍅
cabbage|キャベツ|
celery|セロリ|
corn|とうもろこし|🌽
green pepper|ピーマン|🫑
asparagus|アスパラガス|
broccoli|ブロッコリー|🥦
parsley|パセリ|
radish|ラディッシュ（はつかだいこん）|
pumpkin|かぼちゃ|🎃
spinach|ほうれんそう|
turnip|かぶ|
beans|まめ|
eggplant|なす|🍆
okra|オクラ|
mushroom|きのこ（マッシュルーム）|🍄
garlic|にんにく|🧄
ginger|しょうが|
leek|ねぎ|
`},
{ n:20, title:"Sports", ja:"スポーツ", icon:"⚽", list:`
baseball|やきゅう|⚾
basketball|バスケットボール|🏀
soccer|サッカー|⚽
volleyball|バレーボール|🏐
rugby|ラグビー|🏉
softball|ソフトボール|🥎
badminton|バドミントン|🏸
tennis|テニス|🎾
table tennis|たっきゅう|🏓
gymnastics|たいそう|🤸
the high jump|はしりたかとび|
marathon|マラソン|
track and field|りくじょうきょうぎ|
weight lifting|じゅうりょうあげ|🏋️
boxing|ボクシング|🥊
golf|ゴルフ|⛳
bowling|ボウリング|🎳
skating|スケート|⛸️
skiing|スキー|⛷️
skateboarding|スケートボード|🛹
surfing|サーフィン|🏄
swimming|すいえい|🏊
`},
{ n:21, title:"Instruments", ja:"がっき", icon:"🎹", list:`
castanets|カスタネット|
a harmonica|ハーモニカ|
a recorder|リコーダー|
cymbals|シンバル|
a tambourine|タンバリン|
a triangle|さんかく・トライアングル|🔺
a piano|ピアノ|🎹
a violin|バイオリン|🎻
a cello|チェロ|
a bass|ベース（コントラバス）|
drums|ドラム|🥁
a guitar|ギター|🎸
a saxophone|サックス|🎷
a clarinet|クラリネット|
a flute|フルート|
a trumpet|トランペット|🎺
an accordion|アコーディオン|
a xylophone|もっきん|
a harp|ハープ|
`},
{ n:22, title:"Our elementary school", ja:"しょうがっこう", icon:"🏫", list:`
a school building|こうしゃ|
a gym|たいいくかん|
a swing|ブランコ|
a pool|プール|
a playground|うんどうじょう|
a jungle gym|ジャングルジム|
a track|トラック（きょうそうのコース）|
a bar|てつぼう|
a nurse's room|ほけんしつ|
a principal's room|こうちょうしつ|
a teachers' room|しょくいんしつ|
a computer room|コンピューターしつ|
a library|としょしつ・としょかん|📚
Japanese|こくご（にほんご）|
math|さんすう|➗
social studies|しゃかい|🗾
science|りか|🔬
music|おんがく|🎵
fine arts|ずこう（びじゅつ）|🎨
P.E.|たいいく|🤸
English|えいご|🔤
`},
{ n:23, title:"Our classroom", ja:"きょうしつ", icon:"✏️", list:`
a clock|とけい（かけどけい）|🕰️
a speaker|スピーカー|🔈
a class schedule|じかんわり|
a map|ちず|🗺️
a blackboard|こくばん|
chalk|チョーク|
a notebook|ノート|📓
a textbook|きょうかしょ|📘
a dictionary|じしょ|
a pencil|えんぴつ|✏️
a mechanical pencil|シャープペンシル|
a pen|ペン|🖊️
an eraser|けしゴム|
a ruler|じょうぎ|📏
scissors|はさみ|✂️
paste|のり|
a stapler|ホッチキス|
paint|えのぐ|
crayons|クレヨン|🖍️
`},
{ n:24, title:"The sea", ja:"うみ", icon:"🌊", list:`
a beach|はまべ|🏖️
a seagull|カモメ|
a beach umbrella|ビーチパラソル|⛱️
a shell|かいがら|🐚
a wave|なみ|
a crab|カニ|🦀
goggles|ゴーグル|🥽
an inner tube|うきわ|
a swimsuit|みずぎ|🩱
a turtle|カメ|🐢
a whale|クジラ|🐳
a palm tree|ヤシのき|🌴
a lighthouse|とうだい|
an island|しま|🏝️
an octopus|タコ|🐙
a shark|サメ|🦈
a squid|イカ|🦑
a dolphin|イルカ|🐬
a yacht|ヨット|⛵
a boat|ボート|🚣
a shrimp|エビ|🦐
a ship|ふね|🚢
`},
{ n:25, title:"Mountains", ja:"やま", icon:"⛰️", list:`
a bear|クマ|🐻
a monkey|サル|🐵
a tent|テント|⛺
a chipmunk|シマリス|🐿️
a fire|たきび・ひ|🔥
a backpack|リュック|
a barbecue|バーベキュー|🍖
a river|かわ|🏞️
a stone|いし|🪨
a bridge|はし（わたるはし）|🌉
an owl|フクロウ|🦉
a spider|クモ|🕷️
a cicada|セミ|
a dragonfly|トンボ|
a woodpecker|キツツキ|
a snake|ヘビ|🐍
a deer|シカ|🦌
a skunk|スカンク|🦨
a fox|キツネ|🦊
`},
{ n:26, title:"At the zoo", ja:"どうぶつえん", icon:"🦁", list:`
a giraffe|キリン|🦒
a zebra|シマウマ|🦓
an ostrich|ダチョウ|
an elephant|ゾウ|🐘
a lion|ライオン|🦁
a cheetah|チーター|🐆
a gorilla|ゴリラ|🦍
a chimpanzee|チンパンジー|
an alligator|ワニ|🐊
a hippopotamus|カバ|🦛
a rhinoceros|サイ|🦏
a camel|ラクダ|🐫
a panda|パンダ|🐼
a tiger|トラ|🐯
a flamingo|フラミンゴ|🦩
a peacock|クジャク|🦚
a koala|コアラ|🐨
a kangaroo|カンガルー|🦘
a penguin|ペンギン|🐧
a sea lion|アシカ|🦭
`},
{ n:27, title:"On the farm", ja:"のうじょう", icon:"🐄", list:`
a swallow|ツバメ|
a pigeon|ハト|🕊️
a dog|いぬ|🐶
a cat|ねこ|🐱
a pig|ぶた|🐷
a crow|カラス|
a sparrow|スズメ|
a butterfly|チョウ|🦋
a rabbit|うさぎ|🐰
a bee|ハチ|🐝
a hen|めんどり|🐔
a mole|モグラ|
a horse|うま|🐴
a sheep|ひつじ|🐑
a cow|うし|🐮
a goat|ヤギ|🐐
a swan|ハクチョウ|🦢
a duck|アヒル・カモ|🦆
a mouse|ねずみ|🐭
a frog|カエル|🐸
`},
{ n:28, title:"Time and the days of the week", ja:"じかんとようび", icon:"⏰", list:`
thirteen|13|13
fourteen|14|14
fifteen|15|15
sixteen|16|16
seventeen|17|17
eighteen|18|18
nineteen|19|19
twenty|20|20
twenty-one|21|21
thirty|30|30
forty|40|40
fifty|50|50
sixty|60|60
seventy|70|70
eighty|80|80
ninety|90|90
hundred|100|100
morning|あさ|🌅
noon|しょうご（ひるの12じ）|🕛
afternoon|ごご|🌇
night|よる|🌃
midnight|まよなか|
Sunday|にちようび|
Monday|げつようび|
Tuesday|かようび|
Wednesday|すいようび|
Thursday|もくようび|
Friday|きんようび|
Saturday|どようび|
`},
{ n:29, title:"Seasons", ja:"きせつ", icon:"🍁", list:`
spring|はる|🌱
March|3がつ|
April|4がつ|
May|5がつ|
summer|なつ|🌻
June|6がつ|
July|7がつ|
August|8がつ|
fall|あき|🍁
September|9がつ|
October|10がつ|
November|11がつ|
winter|ふゆ|⛄
December|12がつ|
January|1がつ|
February|2がつ|
`},
{ n:30, title:"Flowers and Trees", ja:"はなとき", icon:"🌷", list:`
cherry blossoms|さくら|🌸
a pansy|パンジー|
a tulip|チューリップ|🌷
a dandelion|たんぽぽ|
an azalea|ツツジ|
a violet|スミレ|
a carnation|カーネーション|
a lily|ユリ|
a rose|バラ|🌹
a hydrangea|アジサイ|
a morning glory|アサガオ|
a sunflower|ひまわり|
a cactus|サボテン|🌵
a cosmos|コスモス|
a dahlia|ダリア|
a pine tree|まつ|🌲
a bamboo|たけ|🎋
`},
{ n:31, title:"Vehicles", ja:"のりもの", icon:"🚌", list:`
a train|でんしゃ|🚃
a subway|ちかてつ|🚇
a bus|バス|🚌
a taxi|タクシー|🚕
a monorail|モノレール|🚝
a tricycle|さんりんしゃ|
a bicycle|じてんしゃ|🚲
a motorcycle|オートバイ|🏍️
a balloon|ききゅう・ふうせん|🎈
a helicopter|ヘリコプター|🚁
an airplane|ひこうき|✈️
an ambulance|きゅうきゅうしゃ|🚑
a police car|パトカー|🚓
a fire engine|しょうぼうしゃ|🚒
a truck|トラック|🚚
a garbage truck|ごみしゅうしゅうしゃ|
a bulldozer|ブルドーザー|
a crane truck|クレーンしゃ|🏗️
`},
{ n:32, title:"Jobs", ja:"しごと", icon:"🧑‍⚕️", list:`
a baseball player|やきゅうせんしゅ|
an actor|はいゆう|
a singer|かしゅ|🧑‍🎤
a pilot|パイロット|🧑‍✈️
a flight attendant|きゃくしつじょうむいん|
an astronaut|うちゅうひこうし|🧑‍🚀
a cartoonist|まんがか|
a painter|がか|
a writer|さっか|
a carpenter|だいく|🔨
a cook|りょうりする・りょうりにん|🧑‍🍳
a farmer|のうか|🧑‍🌾
a doctor|いしゃ|🩺
a nurse|かんごし|👩‍⚕️
a scientist|かがくしゃ|🧑‍🔬
a firefighter|しょうぼうし|🧑‍🚒
a police officer|けいさつかん|👮
a teacher|せんせい|🧑‍🏫
a lawyer|べんごし|⚖️
a politician|せいじか|
an office worker|かいしゃいん|💼
`},
{ n:33, title:"Space", ja:"うちゅうとそら", icon:"🚀", list:`
a shooting star|ながれぼし|🌠
a rocket|ロケット|🚀
a space shuttle|スペースシャトル|
the moon|つき|🌙
the Milky Way|あまのがわ|🌌
an alien|うちゅうじん|👽
a satellite|じんこうえいせい|🛰️
a star|ほし|⭐
a UFO|ユーフォー|🛸
the sky|そら|
the sun|たいよう|☀️
a rainbow|にじ|🌈
the wind|かぜ|
thunder|かみなり|⚡
snow|ゆき|❄️
rain|あめ|☔
a cloud|くも|☁️
the Earth|ちきゅう|🌍
`},
{ n:34, title:"High and low", ja:"たかいとひくい", icon:"⛰️", list:`
high|たかい|
low|ひくい|
heavy|おもい|
light#2|かるい・あかるい|
thick|あつい（ぶあつい）|
thin|うすい・ほそい|
deep|ふかい|
shallow|あさい|
right|みぎ|➡️
left|ひだり|⬅️
dark|くらい|
hard|かたい|
soft|やわらかい|
clean|きれいな・そうじする|
dirty|よごれた|
cold|さむい・つめたい|🥶
hot|あつい|🥵
new|あたらしい|🆕
old|ふるい・としをとった|
fast|はやい|💨
slow|おそい（はやさが）|
good|よい|👍
bad|わるい|👎
`},
{ n:35, title:"My day", ja:"1にちのせいかつ", icon:"🌞", list:`
get up|おきる|
wash my face|かおをあらう|
comb my hair|かみをとかす|
put on my clothes|ふくをきる|
eat breakfast|あさごはんをたべる|
brush my teeth|はをみがく|
leave home|いえをでる|
get to school|がっこうにつく|
listen to the teacher|せんせいのはなしをきく|
raise my hand|てをあげる|🙋
eat lunch|ひるごはんをたべる|
talk with my friend|ともだちとはなす|
clean our classroom|きょうしつをそうじする|
return home|いえにかえる|
watch TV|テレビをみる|
play a video game|テレビゲームをする|
eat dinner|ゆうごはんをたべる|
help my mother|おかあさんをてつだう|
do my homework|しゅくだいをする|
take a bath|おふろにはいる|
go to bed|ねる|🛌
`},
];

// ===== 本のレッスンにあわせた かいわ・ならべかえ（文はアプリ用に作ったもの） =====
// u = レッスン番号。その日のレッスンの文が「かいわ・ぶん」に出やすくなる。
DIALOGS.push(
{u:8, q:"How old are you?", ja:"なんさい？", a:"I'm nine years old.", w:["I'm fine.","It's nine o'clock.","Yes, I am."]},
{u:9, q:"Where are you from?", ja:"どこの出身？", a:"I'm from Canada.", w:["I'm Canada.","Yes, I do.","It's a map."]},
{u:10, q:"Who is this?", ja:"この人はだれ？", a:"It's my aunt.", w:["It's a cake.","Yes, it is.","I'm ten."]},
{u:12, q:"Is this a kitchen?", ja:"ここはだいどころ？", a:"Yes, it is.", w:["Yes, I do.","No, I don't.","It's a kitchen."]},
{u:12, q:"Is that your toothbrush?", ja:"あれはあなたのはブラシ？", a:"No, it isn't.", w:["No, I don't.","Yes, I can.","It's blue."]},
{u:13, q:"What is this?", ja:"これはなに？", a:"It's a vase.", w:["It's mine.","Yes, it is.","It's Monday."]},
{u:13, q:"What is that?", ja:"あれはなに？", a:"It's a sofa.", w:["It's on the floor.","Yes, it is.","I like it."]},
{u:14, q:"Whose cup is this?", ja:"これはだれのカップ？", a:"It's my sister's.", w:["It's a cup.","It's on the table.","Yes, it is."]},
{u:15, q:"Where is my pillow?", ja:"わたしのまくらはどこ？", a:"It's on the bed.", w:["It's white.","Yes, it is.","It's a pillow."]},
{u:16, q:"Where is your favorite place?", ja:"すきな場所はどこ？", a:"It's the lake.", w:["It's red.","Yes, I do.","At three."]},
{u:17, q:"Where is the bank?", ja:"ぎんこうはどこ？", a:"It's next to the station.", w:["It's a bank.","Yes, it is.","By bus."]},
{u:19, q:"Do you like tomatoes?", ja:"トマトはすき？", a:"Yes, I do.", w:["Yes, it is.","No, I'm not.","It's red."]},
{u:19, q:"Do you like onions?", ja:"たまねぎはすき？", a:"No, I don't.", w:["No, it isn't.","Yes, I am.","It's an onion."]},
{u:21, q:"Does your sister play the violin?", ja:"おねえさんはバイオリンをひく？", a:"Yes, she does.", w:["Yes, she is.","Yes, I do.","No, I can't."]},
{u:21, q:"Does your brother play the drums?", ja:"おにいさんはドラムをたたく？", a:"No, he doesn't.", w:["No, he isn't.","No, I don't.","Yes, they are."]},
{u:22, q:"What's your favorite subject?", ja:"すきなきょうかはなに？", a:"It's music.", w:["It's Monday.","I'm a student.","Yes, it is."]},
{u:24, q:"Is there a boat on the beach?", ja:"はまべにボートはある？", a:"Yes, there is.", w:["Yes, it is.","Yes, I do.","No, I'm not."]},
{u:24, q:"Are there any dolphins in the sea?", ja:"うみにイルカはいる？", a:"Yes, there are.", w:["Yes, they do.","Yes, it is.","No, I'm not."]},
{u:25, q:"How many monkeys are there?", ja:"サルは何びきいる？", a:"Three monkeys.", w:["Three o'clock.","Yes, there are.","They are big."]},
{u:27, q:"What animal do you like?", ja:"なんのどうぶつがすき？", a:"I like rabbits.", w:["I have a pen.","Yes, I do.","It's a rabbit."]},
{u:27, q:"What animal do you have?", ja:"なんのどうぶつをかっている？", a:"I have a cat.", w:["I like cats.","Yes, I have.","It's mine."]},
{u:28, q:"What time is it now?", ja:"いまなんじ？", a:"It's four thirty.", w:["It's Monday.","It's sunny.","I'm four."]},
{u:28, q:"What day is it today?", ja:"きょうはなんようび？", a:"It's Tuesday.", w:["It's two.","It's cold.","It's mine."]},
{u:29, q:"What season do you like best?", ja:"いちばんすきなきせつは？", a:"I like winter best.", w:["It's in May.","Yes, I do.","It's cold."]},
{u:29, q:"When is your birthday?", ja:"たんじょうびはいつ？", a:"It's in October.", w:["It's on the desk.","I'm ten.","It's a cake."]},
{u:30, q:"Which do you like better, lilies or tulips?", ja:"ユリとチューリップ、どっちがすき？", a:"I like tulips better.", w:["Yes, I do.","It's a tulip.","No, I don't."]},
{u:30, q:"What color is the rose?", ja:"そのバラはなにいろ？", a:"It's red.", w:["It's a rose.","Yes, it is.","It's Monday."]},
{u:31, q:"How does your father go to work?", ja:"おとうさんはどうやってしごとにいくの？", a:"By car.", w:["At eight.","Yes, he does.","It's a car."]},
{u:32, q:"What do you want to be?", ja:"なにになりたい？", a:"I want to be a pilot.", w:["I'm a pilot.","Yes, I do.","I like pilots."]},
{u:33, q:"Are you interested in rockets?", ja:"ロケットにきょうみある？", a:"Yes, very much.", w:["Yes, I do.","No, it isn't.","It's a rocket."]},
{u:35, q:"What time do you go to bed?", ja:"なんじにねるの？", a:"At nine.", w:["On Sunday.","Yes, I do.","In my room."]},
);
SENTENCES.push(
{u:4, ja:"それは青い星です。", en:"It is a blue star."},
{u:5, ja:"はなをさわって。", en:"Touch your nose."},
{u:6, ja:"赤いぼうしをさわって。", en:"Touch your red cap."},
{u:7, ja:"すわってください。", en:"Sit down, please."},
{u:8, ja:"わたしは9さいです。", en:"I am nine years old."},
{u:9, ja:"わたしはイタリアの出身です。", en:"I am from Italy."},
{u:10, ja:"こちらはわたしのそぼです。", en:"This is my grandmother."},
{u:11, ja:"あれはもんです。", en:"That is a gate."},
{u:14, ja:"これはわたしのスプーンではありません。", en:"This is not my spoon."},
{u:15, ja:"ボールはいすの下にあります。", en:"The ball is under the chair."},
{u:16, ja:"おかにいきましょう。", en:"Let's go to the hill."},
{u:17, ja:"ほんやはびょういんの前にあります。", en:"The bookstore is in front of the hospital."},
{u:18, ja:"わたしはももがすきです。", en:"I like peaches."},
{u:18, ja:"わたしはレモンがすきではありません。", en:"I do not like lemons."},
{u:20, ja:"わたしの兄はバスケットボールがすきです。", en:"My brother likes basketball."},
{u:20, ja:"かのじょはじょうずにテニスをします。", en:"She plays tennis well."},
{u:22, ja:"わたしたちの学校にはプールがあります。", en:"We have a pool."},
{u:23, ja:"わたしたちの教室には時計があります。", en:"There is a clock in our classroom."},
{u:23, ja:"つくえの上にたくさんのえんぴつがあります。", en:"There are many pencils on the desk."},
{u:26, ja:"ゾウは大きい。", en:"Elephants are big."},
{u:26, ja:"キリンは首が長い。", en:"A giraffe has a long neck."},
{u:31, ja:"わたしの姉はバスで学校に行きます。", en:"My sister goes to school by bus."},
{u:32, ja:"わたしの母は先生です。", en:"My mother is a teacher."},
{u:34, ja:"この川はふかい。", en:"This river is deep."},
{u:34, ja:"あのかばんはおもい。", en:"That bag is heavy."},
{u:35, ja:"わたしは7時に朝ごはんを食べます。", en:"I eat breakfast at seven."},
);
