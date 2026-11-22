// ミミィのえいご ― 学習データ
// 単語の書き方:  英語|日本語|絵文字(なければ空)|級(5 or 4, 省略時5)
// ※英検協会は公式の単語リストを公開していないため、
//   ここでは5級・4級でよく出る語を中心に選んでいます（全網羅ではありません）。

const CATEGORIES = [
{ id:"animals", name:"どうぶつ", icon:"🐶", list:`
dog|いぬ|🐶
cat|ねこ|🐱
bird|とり|🐦
fish|さかな|🐟
rabbit|うさぎ|🐰
bear|くま|🐻
lion|ライオン|🦁
tiger|トラ|🐯
elephant|ゾウ|🐘
monkey|サル|🐵
panda|パンダ|🐼
horse|うま|🐴
cow|うし|🐮
pig|ぶた|🐷
sheep|ひつじ|🐑
mouse|ねずみ|🐭
frog|カエル|🐸
koala|コアラ|🐨
penguin|ペンギン|🐧
dolphin|イルカ|🐬
duck|アヒル|🦆
chicken|ニワトリ|🐔
giraffe|キリン|🦒
zebra|シマウマ|🦓
fox|キツネ|🦊
snake|ヘビ|🐍|4
turtle|カメ|🐢|4
whale|クジラ|🐳|4
bee|ハチ|🐝|4
butterfly|チョウ|🦋|4
animal|どうぶつ||5
pet|ペット||5
`},
{ id:"food", name:"たべもの", icon:"🍎", list:`
apple|りんご|🍎
banana|バナナ|🍌
orange|オレンジ|🍊
grapes|ぶどう|🍇
strawberry|いちご|🍓
lemon|レモン|🍋
melon|メロン|🍈
peach|もも|🍑
cherry|さくらんぼ|🍒
tomato|トマト|🍅
potato|じゃがいも|🥔
carrot|にんじん|🥕
onion|たまねぎ|🧅
corn|とうもろこし|🌽
egg|たまご|🥚
bread|パン|🍞
rice|ごはん・おこめ|🍚
cake|ケーキ|🍰
pizza|ピザ|🍕
hamburger|ハンバーガー|🍔
sandwich|サンドイッチ|🥪
salad|サラダ|🥗
soup|スープ|🍲
ice cream|アイスクリーム|🍦
cookie|クッキー|🍪
chocolate|チョコレート|🍫
candy|あめ・おかし|🍬
doughnut|ドーナツ|🍩
cheese|チーズ|🧀
spaghetti|スパゲッティ|🍝
curry|カレー|🍛
milk|ぎゅうにゅう|🥛
juice|ジュース|🧃
water|みず|💧
tea|おちゃ|🍵
coffee|コーヒー|☕
breakfast|あさごはん|🥞
lunch|ひるごはん|🍱
dinner|ゆうごはん|🍽️
food|たべもの||5
fruit|くだもの||5
vegetable|やさい|🥦|4
`},
{ id:"colors", name:"いろ", icon:"🎨", list:`
red|あか|🔴
blue|あお|🔵
yellow|きいろ|🟡
green|みどり|🟢
white|しろ|⚪
black|くろ|⚫
pink|ピンク|🎀
purple|むらさき|🟣
brown|ちゃいろ|🟤
color|いろ|🎨
`},
{ id:"numbers", name:"かず", icon:"🔢", list:`
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
thirteen|13|13
fourteen|14|14
fifteen|15|15
sixteen|16|16
seventeen|17|17
eighteen|18|18
nineteen|19|19
twenty|20|20
thirty|30|30
forty|40|40
fifty|50|50
hundred|100|100
first|1ばんめ・さいしょの||4
second|2ばんめ||4
third|3ばんめ||4
`},
{ id:"family", name:"かぞく・ひと", icon:"👨‍👩‍👧", list:`
father|おとうさん|👨
mother|おかあさん|👩
brother|きょうだい（あに・おとうと）|👦
sister|しまい（あね・いもうと）|👧
grandfather|おじいさん|👴
grandmother|おばあさん|👵
baby|あかちゃん|👶
family|かぞく|👨‍👩‍👧
friend|ともだち|🧑‍🤝‍🧑
boy|おとこのこ||5
girl|おんなのこ||5
man|おとこのひと||5
woman|おんなのひと||5
people|ひとびと||5
uncle|おじ|🧔|4
aunt|おば|👱‍♀️|4
`},
{ id:"school", name:"がっこう", icon:"🏫", list:`
school|がっこう|🏫
teacher|せんせい|🧑‍🏫
student|せいと・がくせい|🧑‍🎓
book|ほん|📕
notebook|ノート|📓
pen|ペン|🖊️
pencil|えんぴつ|✏️
eraser|けしゴム||5
bag|かばん|🎒
desk|つくえ||5
chair|いす|🪑
ruler|じょうぎ|📏
scissors|はさみ|✂️
computer|コンピューター|💻
English|えいご|🔤
math|さんすう・すうがく|➗
science|りか|🔬
music|おんがく|🎵
art|ずこう・びじゅつ|🖌️
P.E.|たいいく|🤸
homework|しゅくだい||5
library|としょかん|📚
class|じゅぎょう・クラス||5
classroom|きょうしつ||5
dictionary|じしょ||4
history|れきし|📜|4
test|テスト|💯|4
`},
{ id:"body", name:"からだ", icon:"👂", list:`
head|あたま|👤
face|かお|😀
eye|め|👁️
ear|みみ|👂
nose|はな|👃
mouth|くち|👄
tooth|は|🦷
hair|かみのけ|💇
hand|て|✋
arm|うで|💪
leg|あし（ももから下）|🦵
foot|あし（足くびから下）|🦶
`},
{ id:"clothes", name:"ふく・もちもの", icon:"👕", list:`
T-shirt|Tシャツ|👕
shirt|シャツ|👔
cap|ぼうし（つばが前だけ）|🧢
hat|ぼうし（まわりにつば）|👒
shoes|くつ|👟
dress|ワンピース・ドレス|👗
jacket|ジャケット|🧥
socks|くつした|🧦
gloves|てぶくろ|🧤
glasses|めがね|👓
umbrella|かさ|☂️
pants|ズボン|👖
watch|うでどけい・〜を見る|⌚
`},
{ id:"house", name:"いえ・もの", icon:"🏠", list:`
house|いえ|🏠
home|いえ・じたく|🏡
room|へや||5
bed|ベッド|🛏️
door|ドア|🚪
window|まど|🪟
table|テーブル||5
clock|とけい（おきどけい）|🕰️
phone|でんわ|📱
TV|テレビ|📺
camera|カメラ|📷
key|かぎ|🔑
box|はこ|📦
cup|カップ||5
bath|おふろ|🛁
kitchen|だいどころ||5
piano|ピアノ|🎹
guitar|ギター|🎸
letter|てがみ・もじ|✉️
picture|え・しゃしん|🖼️
present|プレゼント|🎁|4
money|おかね|💰|4
map|ちず|🗺️|4
ticket|きっぷ・チケット|🎫|4
`},
{ id:"nature", name:"てんき・しぜん", icon:"☀️", list:`
sun|たいよう|☀️
moon|つき|🌙
star|ほし|⭐
sky|そら||5
sunny|はれた|🌞
cloudy|くもった|☁️
rainy|あめの|🌧️
snowy|ゆきの|🌨️
windy|かぜのつよい|🌬️
rain|あめ|☔
snow|ゆき|❄️
tree|き|🌳
flower|はな|🌸
mountain|やま|⛰️
river|かわ|🏞️
sea|うみ|🌊
rainbow|にじ|🌈
spring|はる|🌱
summer|なつ|🌻
fall|あき|🍁
winter|ふゆ|⛄
weather|てんき||5
garden|にわ||4
beach|はまべ|🏖️|4
`},
{ id:"time", name:"ようび・つき・じかん", icon:"📅", list:`
Sunday|にちようび||5
Monday|げつようび||5
Tuesday|かようび||5
Wednesday|すいようび||5
Thursday|もくようび||5
Friday|きんようび||5
Saturday|どようび||5
January|1がつ||5
February|2がつ||5
March|3がつ||5
April|4がつ||5
May|5がつ||5
June|6がつ||5
July|7がつ||5
August|8がつ||5
September|9がつ||5
October|10がつ||5
November|11がつ||5
December|12がつ||5
morning|あさ|🌅
afternoon|ごご|🌇
evening|ゆうがた|🌆
night|よる|🌃
today|きょう||5
day|ひ・1にち||5
week|しゅう||5
month|つき（1か月）||5
year|とし・〜さい||5
time|じかん|⏰
birthday|たんじょうび|🎂
tomorrow|あした||4
yesterday|きのう||4
weekend|しゅうまつ||4
vacation|やすみ（長いおやすみ）||4
`},
{ id:"sports", name:"スポーツ・あそび", icon:"⚽", list:`
soccer|サッカー|⚽
baseball|やきゅう|⚾
basketball|バスケットボール|🏀
tennis|テニス|🎾
volleyball|バレーボール|🏐
table tennis|たっきゅう|🏓
badminton|バドミントン|🏸
softball|ソフトボール|🥎
ski|スキーをする|⛷️
skate|スケートをする|⛸️
dance|おどる・ダンス|💃
game|ゲーム|🎮
song|うた||5
sport|スポーツ||5
festival|おまつり|🎆|4
concert|コンサート||4
`},
{ id:"town", name:"まち・のりもの", icon:"🚌", list:`
station|えき|🚉
hospital|びょういん|🏥
store|おみせ|🏪
restaurant|レストラン|🍴
park|こうえん|⛲
zoo|どうぶつえん||5
post office|ゆうびんきょく|🏤
city|とし|🏙️
town|まち|🏘️
car|くるま|🚗
bus|バス|🚌
train|でんしゃ|🚃
bike|じてんしゃ|🚲
plane|ひこうき|✈️
ship|ふね|🚢
taxi|タクシー|🚕
museum|はくぶつかん・びじゅつかん|🏛️|4
airport|くうこう|🛫|4
bank|ぎんこう|🏦|4
country|くに||4
`},
{ id:"jobs", name:"しごと", icon:"🧑‍⚕️", list:`
doctor|いしゃ|🩺
nurse|かんごし|👩‍⚕️
pilot|パイロット|🧑‍✈️
cook|りょうりにん・りょうりする|🧑‍🍳
police officer|けいさつかん|👮
firefighter|しょうぼうし|🧑‍🚒
singer|かしゅ|🧑‍🎤
farmer|のうか|🧑‍🌾
artist|がか|🧑‍🎨
scientist|かがくしゃ|🧑‍🔬|4
astronaut|うちゅうひこうし|🧑‍🚀|4
`},
{ id:"verbs", name:"うごき", icon:"🏃", list:`
run|はしる|🏃
walk|あるく|🚶
swim|およぐ|🏊
jump|とぶ・ジャンプする||5
eat|たべる|😋
drink|のむ|🥤
sleep|ねむる|😴
read|よむ|📖
write|かく（もじ）|✍️
draw|かく（え）|🖍️
sing|うたう|🎤
play|あそぶ・（スポーツを）する・ひく|🪀
study|べんきょうする|📝
listen|きく|🎧
speak|はなす|🗣️
like|すき|❤️
love|だいすき|💕
help|てつだう・たすける|🤝
wash|あらう|🧼
clean|そうじする|🧹
ride|のる|🚴
go|いく||5
come|くる||5
see|見える・あう||5
look|見る||5
have|もっている・かっている||5
want|ほしい||5
make|つくる||5
open|あける||5
close|しめる||5
stand|たつ||5
sit|すわる||5
live|すむ||5
use|つかう||5
know|しっている||5
get up|おきる||5
buy|かう|🛒|4
visit|たずねる||4
travel|りょこうする|🧳|4
wait|まつ||4
come back|もどってくる||4
forget|わすれる||4
begin|はじまる・はじめる||4
finish|おわる・おえる||4
bring|もってくる||4
take|とる・もっていく||4
`},
{ id:"adj", name:"ようす", icon:"😊", list:`
big|おおきい||5
small|ちいさい||5
long|ながい||5
short|みじかい・せがひくい||5
tall|せがたかい||5
new|あたらしい|🆕
old|ふるい・としをとった||5
happy|うれしい|😊
sad|かなしい|😢
hungry|おなかがすいた|🤤
sleepy|ねむい|😪
tired|つかれた|😫
fine|げんきな||5
good|よい|👍
nice|すてきな||5
cute|かわいい|🥰
beautiful|うつくしい||5
cool|かっこいい・すずしい|😎
hot|あつい|🥵
cold|さむい・つめたい|🥶
warm|あたたかい||5
busy|いそがしい||5
fast|はやい|💨
easy|かんたんな||5
favorite|いちばんすきな||5
delicious|とてもおいしい||5
many|たくさんの||5
young|わかい||4
early|はやい（じかんが）||4
late|おそい・おくれた||4
slow|おそい（はやさが）||4
difficult|むずかしい||4
interesting|おもしろい（きょうみぶかい）||4
famous|ゆうめいな||4
popular|にんきのある||4
sick|びょうきの||4
`},
{ id:"basic", name:"きほんのことば", icon:"💬", list:`
hello|こんにちは|👋
goodbye|さようなら||5
thank you|ありがとう|🙏
sorry|ごめんなさい||5
yes|はい||5
no|いいえ||5
please|おねがいします||5
what|なに||5
where|どこ||5
when|いつ||5
who|だれ||5
how|どう・どうやって||5
how many|いくつ||5
which|どちら||5
whose|だれの||5
now|いま||5
here|ここ||5
there|そこ・あそこ||5
every day|まいにち||5
very|とても||5
always|いつも||4
usually|ふだんは||4
often|よく・しばしば||4
sometimes|ときどき||4
why|なぜ||4
`},
];

// 会話（英検の「会話の応答」「会話文の穴うめ」ふう）  a=正解, w=まちがい
const DIALOGS = [
{q:"How are you?", ja:"げんき？", a:"I'm fine, thank you.", w:["It's sunny.","I'm ten.","Yes, I do."]},
{q:"What's your name?", ja:"おなまえは？", a:"My name is Mimi.", w:["I'm fine.","It's blue.","At home."]},
{q:"How old are you?", ja:"なんさい？", a:"I'm ten years old.", w:["I'm happy.","It's Monday.","Yes, I am."]},
{q:"Where do you live?", ja:"どこにすんでいるの？", a:"I live in Tokyo.", w:["I like dogs.","On Sunday.","It's mine."]},
{q:"What color do you like?", ja:"なにいろがすき？", a:"I like pink.", w:["I'm fine.","It's ten.","Yes, I do."]},
{q:"Do you like cats?", ja:"ねこはすき？", a:"Yes, I do.", w:["Yes, it is.","No, I'm not.","I'm a cat."]},
{q:"Is this your bag?", ja:"これはあなたのかばん？", a:"Yes, it is.", w:["Yes, I do.","No, I can't.","I like bags."]},
{q:"Can you swim?", ja:"およげる？", a:"Yes, I can.", w:["Yes, I do.","No, it isn't.","I'm a fish."]},
{q:"What time is it?", ja:"なんじ？", a:"It's seven o'clock.", w:["It's Monday.","It's sunny.","I'm seven."]},
{q:"What day is it today?", ja:"きょうはなんようび？", a:"It's Monday.", w:["It's ten.","It's cold.","I'm fine."]},
{q:"How's the weather?", ja:"てんきはどう？", a:"It's sunny.", w:["It's Tuesday.","I'm fine, thanks.","It's two."]},
{q:"Who is that girl?", ja:"あの女の子はだれ？", a:"She's my sister.", w:["He's my brother.","It's my bag.","She's ten."]},
{q:"Whose pen is this?", ja:"これはだれのペン？", a:"It's mine.", w:["It's red.","I'm fine.","It's in the box."]},
{q:"Where is my cap?", ja:"ぼくのぼうしはどこ？", a:"It's on the desk.", w:["It's blue.","Yes, it is.","It's a cap."]},
{q:"When is your birthday?", ja:"たんじょうびはいつ？", a:"It's in May.", w:["It's in the box.","I'm eleven.","It's a cake."]},
{q:"How many pencils do you have?", ja:"えんぴつを何本もっている？", a:"I have three.", w:["It's mine.","Yes, I have.","It's long."]},
{q:"What are you doing?", ja:"なにをしているの？", a:"I'm reading a book.", w:["I like books.","Yes, I am.","It's a book."]},
{q:"Thank you.", ja:"ありがとう。", a:"You're welcome.", w:["Thank you.","Yes, I do.","I'm ten."]},
{q:"Let's play soccer.", ja:"サッカーしよう。", a:"OK. Let's go.", w:["Yes, I do.","I'm fine.","It's a ball."]},
{q:"Nice to meet you.", ja:"はじめまして。", a:"Nice to meet you, too.", w:["I'm fine.","You're welcome.","Good night."]},
{q:"Can I use your pen?", ja:"ペンをかりてもいい？", a:"Sure. Here you are.", w:["Yes, I do.","I'm a pen.","It's Monday."]},
{q:"What subject do you like?", ja:"なんのきょうかがすき？", a:"I like science.", w:["I like dogs.","It's Monday.","I'm a student."]},
{q:"What's this?", ja:"これはなに？", a:"It's an apple.", w:["It's mine.","Yes, it is.","I'm fine."]},
{q:"What sport do you play?", ja:"なんのスポーツをするの？", a:"I play tennis.", w:["I play the piano.","I like pink.","On Sunday."]},
{q:"Do you have any pets?", ja:"ペットをかっている？", a:"Yes, I have a dog.", w:["Yes, I am.","No, it isn't.","I like pizza."]},
{q:"Are you hungry?", ja:"おなかすいた？", a:"Yes, I am.", w:["Yes, I do.","No, it isn't.","I'm a girl."]},
{q:"Which do you like, cats or dogs?", ja:"ねことイヌ、どっちがすき？", a:"I like dogs.", w:["Yes, I do.","No, I don't.","It's a cat."]},
{q:"Where are you from?", ja:"どこの出身？", a:"I'm from Japan.", w:["I'm ten.","I'm fine.","At seven."]},
{q:"See you tomorrow.", ja:"またあしたね。", a:"See you.", w:["Good morning.","Nice to meet you.","Yes, please."]},
{q:"Is it cold today?", ja:"きょうはさむい？", a:"Yes, it is.", w:["Yes, I am.","No, I don't.","It's Sunday."]},
{q:"How do you go to school?", ja:"どうやって学校へいくの？", a:"I walk.", w:["At eight.","Yes, I do.","At school."]},
{q:"What time do you get up?", ja:"なんじにおきるの？", a:"At six thirty.", w:["On Monday.","I'm six.","In the park."]},
{q:"How much is this?", ja:"これはいくら？", a:"It's 500 yen.", w:["It's big.","It's mine.","It's Monday."], lv:4},
{q:"Would you like some tea?", ja:"おちゃはいかが？", a:"Yes, please.", w:["Yes, I am.","No, I'm not.","It's tea."], lv:4},
{q:"What did you do yesterday?", ja:"きのうはなにをしたの？", a:"I went to the zoo.", w:["I go to the zoo.","Yes, I did.","It's sunny."], lv:4},
{q:"Who made this cake?", ja:"このケーキはだれがつくったの？", a:"My mother did.", w:["It's a cake.","Yes, it is.","At home."], lv:4},
{q:"What are you going to do this weekend?", ja:"しゅうまつはなにをするつもり？", a:"I'm going to visit my aunt.", w:["I visited my aunt.","Yes, I am.","It's Saturday."], lv:4},
{q:"Why were you late?", ja:"なぜおくれたの？", a:"Because I missed the bus.", w:["At eight.","Yes, I was.","I'm late."], lv:4},
];

// ならべかえ（英検の「語句ならべかえ」ふう）
const SENTENCES = [
{ja:"わたしはいぬがすきです。", en:"I like dogs."},
{ja:"これはわたしのかばんです。", en:"This is my bag."},
{ja:"あなたはテニスをしますか。", en:"Do you play tennis?"},
{ja:"わたしは10さいです。", en:"I am ten years old."},
{ja:"かれはわたしの兄です。", en:"He is my brother."},
{ja:"あなたの名前はなんですか。", en:"What is your name?"},
{ja:"わたしはまい朝ミルクをのみます。", en:"I drink milk every morning."},
{ja:"まどをあけてください。", en:"Please open the window."},
{ja:"いっしょにうたいましょう。", en:"Let's sing together."},
{ja:"ねこはどこにいますか。", en:"Where is the cat?"},
{ja:"わたしはおよぐことができます。", en:"I can swim."},
{ja:"わたしの姉はピアノをひけます。", en:"My sister can play the piano."},
{ja:"わたしはいま本をよんでいます。", en:"I am reading a book now."},
{ja:"あなたはなにいろがすきですか。", en:"What color do you like?"},
{ja:"きょうははれています。", en:"It is sunny today."},
{ja:"わたしは日曜日に公園へいきます。", en:"I go to the park on Sundays."},
{ja:"これはだれのぼうしですか。", en:"Whose cap is this?"},
{ja:"かのじょはわたしの友だちです。", en:"She is my friend."},
{ja:"いまなんじですか。", en:"What time is it now?"},
{ja:"あなたはペットをかっていますか。", en:"Do you have a pet?"},
{ja:"わたしの父はいしゃです。", en:"My father is a doctor."},
{ja:"かれはサッカーがすきではありません。", en:"He does not like soccer."},
{ja:"あなたのたんじょうびはいつですか。", en:"When is your birthday?"},
{ja:"わたしはまいにち英語をべんきょうします。", en:"I study English every day."},
{ja:"かのじょはじょうずにおどります。", en:"She dances very well."},
{ja:"つくえの上に本が1さつあります。", en:"There is a book on the desk.", lv:4},
{ja:"わたしはきのうどうぶつえんにいきました。", en:"I went to the zoo yesterday.", lv:4},
{ja:"わたしはあしたおじをたずねるつもりです。", en:"I am going to visit my uncle tomorrow.", lv:4},
{ja:"わたしはしゅくだいをしなければなりません。", en:"I have to do my homework.", lv:4},
{ja:"かのじょはわたしの姉より背がたかい。", en:"She is taller than my sister.", lv:4},
{ja:"わたしはテレビを見ていました。", en:"I was watching TV.", lv:4},
];

// ぶんぽう教室
const GRAMMAR = [
{id:"be", name:"〜です（am・is・are）", tip:"わたしは am、あなたは are、ひとりの人や もの は is", cmp:["I am happy.","She is happy."], title:"I am / You are / He is", lv:5,
 text:"「〜です」は <b>am / are / is</b> をつかうよ。<br>I（わたし）→ <b>am</b>、 you（あなた）や みんな → <b>are</b>、 he・she・it（ひとり・1つ）→ <b>is</b>。",
 ex:[["I am a student.","わたしは生徒です。"],["You are kind.","あなたはやさしい。"],["She is my sister.","かのじょはわたしの姉です。"]],
 quiz:[{q:"I ( ) happy.",o:["am","is","are"],a:0},{q:"He ( ) my father.",o:["am","is","are"],a:1},{q:"You ( ) cute.",o:["am","is","are"],a:2},{q:"It ( ) a pen.",o:["are","is","am"],a:1}]},
{id:"aan", name:"a と an", tip:"a・i・u・e・o の 音で はじまると an", cmp:["a banana","an apple"], title:"a と an", lv:5,
 text:"1つのものには <b>a</b> をつけるよ。<br>でも、<b>a・i・u・e・o の音</b>ではじまることばには <b>an</b> になるよ。（an apple, an egg）",
 ex:[["a dog","1ぴきのいぬ"],["an apple","1こ のりんご"],["an orange","1こ のオレンジ"]],
 quiz:[{q:"( ) egg",o:["a","an"],a:1},{q:"( ) cat",o:["a","an"],a:0},{q:"( ) ice cream",o:["a","an"],a:1},{q:"( ) banana",o:["a","an"],a:0}]},
{id:"plural", name:"2つ いじょうは s", tip:"2つ いじょうは おしりに s", cmp:["one dog","two dogs"], title:"2つ以上は s がつく", lv:5,
 text:"2つ以上のときは、ことばのおわりに <b>s</b> をつけるよ。<br>box や bus みたいに s・x・ch・sh でおわるときは <b>es</b>。",
 ex:[["two dogs","2ひきのいぬ"],["three boxes","3つのはこ"],["many books","たくさんの本"]],
 quiz:[{q:"two ( )",o:["cat","cats","cates"],a:1},{q:"three ( )",o:["box","boxs","boxes"],a:2},{q:"I like ( ).",o:["apple","apples"],a:1}]},
{id:"verb", name:"「すき？」と きく（Do）", tip:"しつもんは Do で はじめる", cmp:["You like cats.","Do you like cats?"], title:"I like 〜 / Do you like 〜?", lv:5,
 text:"「すき」「する」みたいな <b>うごきのことば</b>をつかうよ。<br>しつもんするときは、まえに <b>Do</b> をつけるよ。こたえは <b>Yes, I do. / No, I don't.</b>",
 ex:[["I like music.","わたしは音楽がすきです。"],["Do you play soccer?","あなたはサッカーをしますか。"],["No, I don't.","いいえ、しません。"]],
 quiz:[{q:"( ) you like dogs?",o:["Are","Do","Is"],a:1},{q:"Do you play tennis? — Yes, I ( ).",o:["am","do","can"],a:1},{q:"I ( ) not like carrots.",o:["am","do","is"],a:1}]},
{id:"3s", name:"かれ・かのじょは s がつく", tip:"he・she・Tom の ときは うごきに s", cmp:["I play tennis.","She plays tennis."], title:"He likes 〜（s がつく）", lv:5,
 text:"he・she・Tom みたいに<b>「ほかのひとり」</b>がするときは、うごきのことばに <b>s</b> がつくよ。<br>しつもんは <b>Does</b>、「しない」は <b>doesn't</b>。",
 ex:[["She plays the piano.","かのじょはピアノをひきます。"],["He likes baseball.","かれはやきゅうがすきです。"],["Does she swim?","かのじょはおよぎますか。"]],
 quiz:[{q:"She ( ) cats.",o:["like","likes"],a:1},{q:"( ) he play soccer?",o:["Do","Does","Is"],a:1},{q:"Tom ( ) English every day.",o:["study","studies"],a:1}]},
{id:"can", name:"できる（can）", tip:"できる は can。can の あとは そのままの かたち", cmp:["I swim.","I can swim."], title:"can（〜できる）", lv:5,
 text:"「〜できる」は <b>can</b> + うごきのことば。<br>can のあとのことばには s がつかないよ。<br>「できない」は <b>can't</b>。",
 ex:[["I can swim.","わたしはおよげます。"],["She can play the guitar.","かのじょはギターをひけます。"],["Can you ski?","スキーできる？"]],
 quiz:[{q:"I ( ) run fast.",o:["can","am","do"],a:0},{q:"He can ( ) well.",o:["sings","sing"],a:1},{q:"Can you swim? — Yes, I ( ).",o:["do","am","can"],a:2}]},
{id:"ing", name:"いま している（〜ing）", tip:"いま している は am・is・are ＋ 〜ing", cmp:["I read a book.","I am reading a book."], title:"いましていること（〜ing）", lv:5,
 text:"「いま〜している」は <b>am / are / is + 〜ing</b>。",
 ex:[["I am eating lunch.","わたしはひるごはんを食べています。"],["They are playing soccer.","かれらはサッカーをしています。"],["What are you doing?","なにをしているの？"]],
 quiz:[{q:"I am ( ) a book.",o:["read","reading","reads"],a:1},{q:"She ( ) singing.",o:["is","are","do"],a:0},{q:"What are you ( )?",o:["do","doing","does"],a:1}]},
{id:"wh", name:"なに・どこ・いつ・だれ", tip:"What なに、Where どこ、When いつ、Who だれ", cmp:["Where is the cat?","Who is that girl?"], title:"What / Where / When / Who", lv:5,
 text:"<b>What</b>＝なに、<b>Where</b>＝どこ、<b>When</b>＝いつ、<b>Who</b>＝だれ、<b>How</b>＝どう。しつもんのいちばん前におくよ。",
 ex:[["What is this?","これはなに？"],["Where is my bag?","わたしのかばんはどこ？"],["When is your birthday?","たんじょうびはいつ？"]],
 quiz:[{q:"( ) is your name? — Mimi.",o:["What","Where","Who"],a:0},{q:"( ) is the cat? — On the bed.",o:["When","Where","Who"],a:1},{q:"( ) is that boy? — My brother.",o:["What","Who","When"],a:1}]},
{id:"past", name:"きのうの こと（ed）", tip:"すんだ ことは ed。go は went", cmp:["I play tennis.","I played tennis."], title:"きのうのこと（〜ed）", lv:4,
 text:"すんだことは、うごきのことばに <b>ed</b> をつけるよ（played, watched）。<br>go → <b>went</b>、eat → <b>ate</b> みたいに形がかわることばもあるよ。",
 ex:[["I played tennis yesterday.","きのうテニスをしました。"],["She went to the park.","かのじょは公園へいきました。"],["Did you eat lunch?","ひるごはんたべた？"]],
 quiz:[{q:"I ( ) TV last night.",o:["watch","watched"],a:1},{q:"He ( ) to school yesterday.",o:["goed","went","go"],a:1},{q:"( ) you play soccer yesterday?",o:["Do","Did","Are"],a:1}]},
{id:"future", name:"これからの こと", tip:"これからは be going to か will", cmp:["I play tennis.","I am going to play tennis."], title:"これからのこと（will / be going to）", lv:4,
 text:"「〜するつもり」は <b>be going to + うごき</b>、「〜するだろう」は <b>will + うごき</b>。",
 ex:[["I am going to visit Kyoto.","京都をたずねるつもりです。"],["It will be sunny tomorrow.","あしたははれるでしょう。"]],
 quiz:[{q:"I am going ( ) play tennis.",o:["to","for","at"],a:0},{q:"It will ( ) rainy tomorrow.",o:["is","be","are"],a:1}]},
];

// ABC（フォニックス）
const PHONICS = [
["A","apple","🍎","エとアのあいだ「ア」"],["B","bear","🐻","くちびるをとじて「ブッ」"],["C","cat","🐱","のどのおくで「クッ」"],
["D","dog","🐶","したを上の歯ぐきに「ドゥッ」"],["E","egg","🥚","口をよこに「エ」"],["F","fish","🐟","上の歯で下くちびる「フッ」"],
["G","grapes","🍇","のどのおくで「グッ」"],["H","horse","🐴","いきだけで「ハッ」"],["I","igloo","🛖","みじかい「イ」"],
["J","juice","🧃","「ジュ」"],["K","koala","🐨","「クッ」"],["L","lion","🦁","したを上の歯ぐきにつけて「ル」"],
["M","monkey","🐵","くちをとじて「ンム」"],["N","nose","👃","したを上につけて「ンヌ」"],["O","octopus","🐙","口を大きくあけて「ア」に近い「オ」"],
["P","pig","🐷","くちびるでいきを「プッ」"],["Q","queen","👸","「クwッ」"],["R","rabbit","🐰","したをどこにもつけず「ゥル」"],
["S","sun","☀️","いきで「スー」"],["T","tiger","🐯","「トゥッ」"],["U","umbrella","☂️","力をぬいて「ア」"],
["V","violin","🎻","上の歯で下くちびる「ヴ」"],["W","water","💧","くちびるをまるく「ゥワ」"],["X","box","📦","おわりで「クス」"],
["Y","yo-yo","🪀","「ィヤ」"],["Z","zebra","🦓","ハチの羽の音「ズー」"],
];

// みみトレ（にている音のききわけ）
const PAIRS = [
["thirteen","13","thirty","30"],["fourteen","14","forty","40"],["fifteen","15","fifty","50"],
["light","ひかり","right","みぎ"],["rice","ごはん","lice","シラミ"],["sea","うみ","she","かのじょ"],
["hat","ぼうし","hot","あつい"],["cap","ぼうし","cup","カップ"],["bag","かばん","bug","むし"],
["cat","ねこ","cut","きる"],["ship","ふね","sheep","ひつじ"],["sit","すわる","seat","せき"],
["walk","あるく","work","はたらく"],["pen","ペン","pan","フライパン"],["bed","ベッド","bad","わるい"],
["three","3","tree","き"],["fan","せんぷうき","van","バン（車）"],["mouse","ねずみ","mouth","くち"],
["long","ながい","wrong","まちがった"],["bus","バス","bath","おふろ"],["play","あそぶ","pray","いのる"],
];

// きせかえ（★でかう）
const OUTFITS = [
{id:"ribbon", name:"リボン", cost:15, icon:"🎀"},
{id:"flower", name:"おはな", cost:30, icon:"🌼"},
{id:"glasses", name:"まるメガネ", cost:45, icon:"👓"},
{id:"scarf", name:"マフラー", cost:60, icon:"🧣"},
{id:"crown", name:"おうかん", cost:90, icon:"👑"},
{id:"phones", name:"ヘッドホン", cost:120, icon:"🎧"},
{id:"wand", name:"ほしのステッキ", cost:160, icon:"🪄"},
{id:"cape", name:"マント", cost:200, icon:"🦸"},
];
const BACKS = [
{id:"bg0", name:"ピンク", cost:0, c:["#ffe3ef","#fff6fb"]},
{id:"bg1", name:"そら", cost:25, c:["#d6efff","#f3fbff"]},
{id:"bg2", name:"もり", cost:50, c:["#dcf5df","#f5fff4"]},
{id:"bg3", name:"ゆうやけ", cost:80, c:["#ffe0c7","#fff1e6"]},
{id:"bg4", name:"よぞら", cost:130, c:["#cfd3ff","#eef0ff"]},
];
