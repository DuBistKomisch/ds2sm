(function () {

// --- globals

var canvas = null;
var draw = null;
var sprites = new Image();
var hover = -1;
var lang = 'en';
var swapped = false;

// --- main

$(document).ready(function ()
{
  canvas = $('#chart')[0];
  draw = canvas.getContext('2d');
  
  // register events
  $('#my-sm').keyup(typing);
  $('#chart').mousemove(mouse);
  $('#chart').click(click);

  // load spritesheet
  sprites.onload = typing;
  sprites.src = 'images/icons.png';
  
  // select language
  var langs = '';
  for (var l in str)
    langs += ' <li onclick="javascript:document.set_lang(\'' + l + '\');" title="' + str[l]['by'] + ' ' + str[l]['credit'] + '">' + str[l].name + '</li>';
  $('#lang-menu').html(langs);
  if (document.location.hash)
    document.set_lang(document.location.hash.substring(1));
  else
    document.set_lang('en');
  $('#lang').mouseenter(function() { $('#lang-menu').show(); });
  $('#lang').mouseleave(function() { $('#lang-menu').hide(); });
  
  // initial render
  render();
});

document.set_lang = function(l)
{
  lang = str[l] != undefined ? l : 'en';
  document.location = "#" + lang;
  
  // update interface
  $('#lang-selected').text(str[lang]['name']);
  $('#lang-menu').hide();
  $('#p2').text(str[lang]['ner']);
  $('#p6').text(str[lang]['updated'] + ' 2014-08-11');
  $('#p4').html(str[lang]['by'] + ' <a href="http://jakebarnes.com.au">Jake Barnes</a>');
  $('#p5').html('<a href="http://jakebarnes.com.au/ds2sm/">' + str[lang]['full'] + '</a> / <a href="http://steamcommunity.com/sharedfiles/filedetails/?id=259425063">' + str[lang]['guide'] + '</a>');
  $('#p8').text(str[lang][swapped ? 'sm3' : 'sm1']);
  $('#p9').text(str[lang]['sm2']);
  render();
}

function render()
{
  // clear
  canvas.height = canvas.height;
  
  // read data
  var tier = getTier();
  
  // static
  draw.textAlign = 'right';
  draw.textBaseline = 'bottom';
  draw.drawImage(sprites, 640, 0, 32, 32, 50, 357, 32, 32);
  draw.drawImage(sprites, 672, 0, 20, 24, 8, 8, 20, 24);
  
  // range boxes
  for (var i = 0; i < items.length; i++)
  {
    var x = 376.5 + 40 * i, top, bottom;
    var down = swapped ? items[i].up : items[i].down;
    var up = swapped ? items[i].down : items[i].up;
    
    draw.beginPath();
    if (i == hover)
      draw.rect(230.5, top = 341.5 - down * 40, x + 30 - 230.5, bottom = 60 + (down + up) * 40);
    else
      draw.rect(x, top = 351.5 - down * 40, 30, bottom = 40 + (down + up) * 40);
    bottom += top;
    
    if (i == hover || hover == -1)
    {
      draw.strokeStyle = 'rgba(0, 204, 0, 1.0)';
      draw.fillStyle = 'rgba(0, 204, 0, 0.2)';
    }
    else
    {
      draw.strokeStyle = 'rgba(0, 204, 0, 0.25)';
      draw.fillStyle = 'rgba(0, 204, 0, 0.05)';
    }
    draw.stroke();
    draw.fill();
    
    draw.beginPath();
    draw.moveTo(x + 14.5, 50 + 600 * (i % 2));
    draw.lineTo(x + 14.5, (i % 2 == 0) ? top : bottom)
    draw.lineWidth = 2;
    draw.stroke();
    draw.lineWidth = 1;
  }
  
  // images
  for (var i = 0; i < items.length; i++)
  {
    var x = 360 + 80 * (i / 2), y = 600 * (i % 2);
    
    // glow
    if (i == hover)
    {
      // gradient
      var grad = draw.createRadialGradient(x + 32, y + 48, 0, x + 32, y + 48, 48);
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
      
      // draw
      draw.beginPath();
      draw.arc(x + 32, y + 48, 48, 0, Math.PI * 2);
      draw.fillStyle = grad;
      draw.fill();
    }
    
    // sprites
    draw.drawImage(sprites, items[i].sx * 64, 0, 64, 95, x, y, 64, 95);
    if (items[i].ner != undefined)
      draw.drawImage(sprites, 6 * 64, 0, 64, 95, x + 32, y + 48, 32, 47.5);
  }
  
  // tier box
  if (tier != -1)
  {
    var x = 230.5, y = 341.5;
    draw.beginPath();
    draw.moveTo(x, y);
    draw.lineTo(x + 85, y);
    draw.lineTo(x + 90, y + 10);
    draw.lineTo(x + 585, y + 10);
    draw.lineTo(x + 585, y + 50);
    draw.lineTo(x + 90, y + 50);
    draw.lineTo(x + 85, y + 60);
    draw.lineTo(x, y + 60);
    draw.lineTo(x - 5, y + 55);
    draw.lineTo(x - 140, y + 55);
    draw.lineTo(x - 140, y + 5);
    draw.lineTo(x - 5, y + 5);
    draw.lineTo(x, y);
    draw.strokeStyle = '#00d';
    draw.stroke();
    draw.fillStyle = 'rgba(0, 0, 221, 0.1)';
    draw.fill();
  }
  
  // tiers
  var down = 0, up = 0;
  if (hover != -1)
  {
    down = swapped ? items[hover].up : items[hover].down;
    up = swapped ? items[hover].down : items[hover].up;
  }
  draw.font = '15px sans-serif';
  draw.fillStyle = draw.strokeStyle = '#444';
  if (tier == -1 && hover != -1) draw.fillStyle = draw.strokeStyle = '#060'; // [special casing intensifies]
  for (var i = 0; i < tiers.length; i++)
  {
    var y = 359.5 - tier * 40 + i * 40;
    
    // souls
    if (i >= tier - down && i < tier) draw.fillStyle = draw.strokeStyle = '#060';
    if (i == tier && tier != -1) draw.fillStyle = draw.strokeStyle = '#008';
    draw.textAlign = 'right';
    draw.fillText(format(tiers[i]), 315, y)
    
    draw.beginPath();
    draw.moveTo(320, y - 8);
    draw.lineTo(Math.abs(i - tier) <= 6 ? 815 : 350, y - 8); // extend in middle
    draw.stroke();
    
    // tier
    if (i == tier + 1) draw.fillStyle = draw.strokeStyle = '#060';
    if (i == tier + up + 1) draw.fillStyle = draw.strokeStyle = '#444';
    draw.font = 'bold 15px sans-serif';
    draw.textAlign = 'left';
    draw.fillText(i + 1, 325, y + 20)
    draw.font = '15px sans-serif';
  }
  
  // hardcoded 999,999,999
  var y = 359.5 - tier * 40 + i * 40;
  if (tier - down == i) draw.fillStyle = draw.strokeStyle = '#060';
  draw.textAlign = 'right';
  draw.fillText('999 999 999', 315, y)
  
  draw.beginPath();
  draw.moveTo(320, y - 8);
  draw.lineTo(Math.abs(i - tier) <= 6 ? 815 : 350, y - 8);
  draw.stroke();
  
  // text
  $('#p1').text(hover != -1 ? str[lang]['item'+hover+'-label'] : str[lang]['none']);
  $('#p3').text(hover != -1 ? str[lang]['item'+hover+'-desc'] : '');
  if (hover != -1 && items[hover].ner != undefined)
    $('#p2').show();
  else
    $('#p2').hide();
}

// --- utility

function format(thousands)
{
  if (thousands <= 0)
    return '0';
    
  var result = (thousands % 1000) + ' 000';
  
  // millions?
  if (thousands >= 1000)
  {
    // pad
    if (result.length == 5)
      result = '00' + result;
    if (result.length == 6)
      result = '0' + result;
    
    result = Math.floor(thousands / 1000) + ' ' + result;
  }
  
  return result;
}

function getTier()
{
  // read
  var text = $('#my-sm').val();
  text = text.replace(/[^\d]/g, ''); // ignore non-numeric characters
  if (text.length == 0) // Number("") == 0, wat?
    return -1;
  
  // convert
  var n = Number(text);
  if (/*Number.*/isNaN(n)) // invalid
    return -1;
  if (n < 0) // clamp to 0
    n = 0;
  if (n > 999999999) // clamp to 999,999,999
    n = 999999999;
  
  // look up tier
  var i = tiers.length;
  while (n < tiers[i-1] * 1000 && i > 0)
    i--;
  return i - 1; // zero-indexed
}

// transform mouse event coordinates into local canvas coordinates
function getCursorPosition(e) {
  var x;
  var y;
  if (e.pageX != undefined && e.pageY != undefined)
  {
    x = e.pageX;
    y = e.pageY;
  }
  else
  {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= $('#chart')[0].offsetLeft;
  y -= $('#chart')[0].offsetTop;
  
  return {"x": x - 0.5, "y": y - 0.5};
}

// --- event handlers

function typing(event)
{
  // maximum boilerplate
  render();
}

function mouse(e)
{
  var pos = getCursorPosition(e);
  
  // find overlapping image
  var found = -1;
  for (var i = 0; i < items.length; i++)
  {
    var x = 360 + 80 * (i / 2), y = 600 * (i % 2);
    if (pos.x > x && pos.x < x + 64 && pos.y > y && pos.y < y + 96)
    {
      found = i;
      break;
    }
  }
  
  // trigger redraw when necessary
  if (hover != found)
  {
    hover = found;
    render();
  }
}

function click(e)
{
  var pos = getCursorPosition(e);
  
  if (pos.x > 45 && pos.x < 87 && pos.y > 352 && pos.y < 394)
  {
    swapped = !swapped;
    $('#p8').text(str[lang][swapped ? 'sm3' : 'sm1']);
    render();
  }
}

// --- data

// soul memory tiers
var tiers = [
  0, 10, 20, 30, 40,
  50, 70, 90, 110, 130,
  150, 180, 210, 240, 270,
  300, 350, 400, 450,
  500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400,
  1500, 1750, 2000, 2250, 2500, 2750,
  3000, 5000, 7000,
  9000, 12000,
  15000,
  20000,
  30000,
  45000
];

// multiplayer items
var items = [
  {'sx':9,'down':3,'up':1},
  {'sx':9,'down':6,'up':4,'ner':true},
  {'sx':8,'down':4,'up':2},
  {'sx':8,'down':7,'up':5,'ner':true},
  {'sx':7,'down':5,'up':2},
  {'sx':4,'down':5,'up':5},
  {'sx':2,'down':0,'up':4},
  {'sx':1,'down':3,'up':3},
  {'sx':3,'down':1,'up':3},
  {'sx':0,'down':1,'up':3},
  {'sx':5,'down':5,'up':4}
];

var str = {
  'en': {
    'name': 'English',
    'credit': 'DuBistKomisch',
    'sm1': 'Item user\'s soul memory',
    'sm2': 'Range of available players',
    'sm3': 'Host\'s soul memory',
    'ner': '+ Name-Engraved Ring',
    'none': 'No item selected',
    'updated': 'updated on',
    'by': 'by',
    'full': 'full',
    'guide': 'guide',
    'item0-label': 'White Sign Soapstone',
    'item0-desc': 'Be summoned as a phantom to another world in order to help that world\'s master for a certain time. You will be rewarded with a Token of Fidelity for successfully assisting the other player.',
    'item1-label': 'White Sign Soapstone',
    'item1-desc': 'A special ring that can be engraved with the name of a god. Becomes easier to connect to worlds of players who choose the same god.',
    'item2-label': 'Small White Sign Soapstone',
    'item2-desc': 'Be summoned as a shade to another world in order to help that world\'s master for a certain time. You will be rewarded for successfully assisting the other player.',
    'item3-label': 'Small White Sign Soapstone',
    'item3-desc': 'A special ring that can be engraved with the name of a god. Becomes easier to connect to worlds of players who choose the same god.',
    'item4-label': 'Red Sign Soapstone',
    'item4-desc': 'Be summoned to another world as a dark spirit, and defeat the summoner to acquire a Token of Spite.',
    'item5-label': 'Dragon Eye',
    'item5-desc': 'Invade a world with a Dragon Scale to claim the scale from its master.',
    'item6-label': 'Cracked Red Eye Orb',
    'item6-desc': 'Defeat the master of the world you have invaded to acquire a Token of Spite.',
    'item7-label': 'Cracked Blue Eye Orb',
    'item7-desc': 'Can only be used by members of the Blue Sentinels covenant. Punish the guilty to strengthen the bond with your covenant.',
    'item8-label': 'Crest of the Rat',
    'item8-desc': 'Join this covenant and wear this ring to lure trespassers of the Rat King\'s territory into your world.',
    'item9-label': 'Bell Keeper\'s Seal',
    'item9-desc': 'Join this covenant and wear this ring to be automatically summoned to the world of an invader of the bell keeper\'s domain.',
    'item10-label': 'Guardian\'s Seal',
    'item10-desc': 'Join this covenant and wear this ring to be automatically summoned to the worlds of blue apostles who have been invaded by dark spirits.'
  },
  'de': {
    'name': 'Deutsch',
    'credit': 'SenSenSen',
    'sm1': 'Gegenstandnutzers Seelenerinnerung',
    'sm2': 'Bereiche der erreichbaren Spieler',
    'sm3': 'Seelenerinnerung des Hosts',
    'ner': '+ Ring mit Namensgravur',
    'none': 'Kein Gegenstand ausgewählt',
    'updated': 'geupdated am',
    'by': 'von',
    'full': 'voll',
    'guide': 'Anleitung',
    'item0-label': 'Weißer Symbol-Speckstein',
    'item0-desc': 'Werdet als Phantom in eine andere Welt gerufen und helft dem Herrn jener Welt eine Zeit lang. Unterstützt Ihr den anderen Spieler erfolgreich, erhaltet Ihr ein Zeichen der Treue.',
    'item1-label': 'Weißer Symbol-Speckstein',
    'item1-desc': 'In diesen besonderen Ring kann der Name eines Gottes graviert werden. Ihr könnt leichter zu Welten von Spielern Verbindung aufnehmen, die sich für denselben Gott entschieden haben.',
    'item2-label': 'Kleiner Weißer Symbol-Speckstein',
    'item2-desc': 'Werdet als Schatten in eine andere Welt gerufen und helft dem Herrn jener Welt eine Zeit lang. Unterstützt Ihr den anderen Spieler erfolgreich, werdet Ihr belohnt',
    'item3-label': 'Kleiner Weißer Symbol-Speckstein',
    'item3-desc': 'In diesen besonderen Ring kann der Name eines Gottes graviert werden. Ihr könnt leichter zu Welten von Spielern Verbindung aufnehmen, die sich für denselben Gott entschieden haben.',
    'item4-label': 'Roter Symbol-Speckstein',
    'item4-desc': 'Werdet als Finstergeist in eine andere Welt gerufen und besiegt den Rufer, um ein Zeichen des Grolls zu erhalten',
    'item5-label': 'Drachenauge',
    'item5-desc': 'Überfallt eine Welt mit einer Drachenschuppe, um die Schuppe ihres Herrn zu erhalten',
    'item6-label': 'Geborstener Roter Augapfel',
    'item6-desc': 'Besiegt den Herrn der Welt, die Ihr überfallt, um win Zeichen des Grolls zu erhalten.',
    'item7-label': 'Geborstener Blauer Augapfel',
    'item7-desc': 'Überfallt die Welt der Schuldigen. Kann nur von Mitgliedern des Blaue Wächter-Eides verwendet werden. Bestraft die Schuldigen, um das Band zu Eurem Eid zu stärken',
    'item8-label': 'Wappen der Ratte',
    'item8-desc': 'Leistet diesen Eid und tragt diesen Ring, um Eindringlinge im Gebiet des Rattenkönigs in Eure Welt zu locken.',
    'item9-label': 'Siegel des Glockenhüters',
    'item9-desc': 'Leistet diesen Eid und tragt diesen Ring, um automatisch in die Welt eines Eindringlings im Reich der Glockenhüter beschworen zu werden.',
    'item10-label': 'Siegel des Wächters',
    'item10-desc': 'Leistet diesen Eid und tragt diesen Ring, um automatisch in die Welten der Blauen Apostel beschworen zu werden, die von dunklen Geistern überfallen wurden.'
  },
  'ru': {
    'name': 'Русский',
    'credit': 'Google Translate',
    'sm1': 'Памяти душа Item пользователя',
    'sm2': 'Диапазон доступных игроков',
    'sm3': 'Памяти душа хозяина',
    'ner': '+ Именное кольцо',
    'none': 'Предмет не выбран',
    'updated': 'обновление',
    'by': 'написана',
    'full': 'полный',
    'guide': 'руководство',
    'item0-label': 'Белый мелок',
    'item0-desc': 'Вас в виде фантома могут призвать в иной мир, чтобы в течение некоторого времени помогали хозяину этого мира. За успешную помощь вы получите Знак Верности или Медаль Света.',
    'item1-label': 'Белый мелок',
    'item1-desc': 'Особое кольцо, на которое можно нанести имя бога. Так будет проще соединиться с мирами игроков, выбравших того же бога.',
    'item2-label': 'Маленький белый мелок',
    'item2-desc': 'Вас в виде фантома могут призвать в иной мир, чтобы в течение некоторого времени помогали хозяину этого мира. За успешную помощь вы будете вознаграждены.',
    'item3-label': 'Маленький белый мелок',
    'item3-desc': 'Особое кольцо, на которое можно нанести имя бога. Так будет проще соединиться с мирами игроков, выбравших того же бога.',
    'item4-label': 'Красный мелок',
    'item4-desc': 'Перенеситесь в иной мир в виде темного фантома и победите призвавшего вас, и вы получите знак злобы.',
    'item5-label': 'Глаз Дракона',
    'item5-desc': 'Отправьтесь в мир, где находится чешуя дракона, чтобы забрать чешую у хозяина этого мира.',
    'item6-label': 'Треснувшее красное око',
    'item6-desc': 'Позволяет вторгнуться в иной мир. Победите хозяина мира, в который вы перенеслись, и вы получите знак злобы.',
    'item7-label': 'Треснувшее синее око',
    'item7-desc': 'Переносит вас в мир виновного. Этот предмет могут использовать только Синие Стражи. Накажите виновного, чтобы укрепить связь со своим орденом.',
    'item8-label': 'Эмблема крыс',
    'item8-desc': 'Вступите в этот орден и наденьте это кольцо, и тогда вы сможете заманивать в свой мир тех, кто проникает на территорию короля крыс.',
    'item9-label': 'Перстень звонаря',
    'item9-desc': 'Вступите в этот орден и наденьте это кольцо, и тогда вас смогут сразу призвать в мир игрока, вторгшегося во владения звонарей.',
    'item10-label': 'Перстень Стража',
    'item10-desc': 'Присоединитесь к этому ковенанту и наденьте кольцо, чтобы вас автоматически призывали в миры апостолов Лазурного пути, если туда вторглись духи Тьмы.'
  },
  'pt': {
    'name': 'Português',
    'credit': 'SorinM4rkov',
    'sm1': 'Memória de almas do usuário do item',
    'sm2': 'Intervalo com jogadores disponíveis',
    'sm3': 'Memória de almas do hospedeiro',
    'ner': '+ Anel com o Nome Gravado',
    'none': 'Nenhum item selecionado',
    'updated': 'atualizado em',
    'by': 'por',
    'full': 'completo',
    'guide': 'guia',
    'item0-label': 'Pedra do Sinal Branco',
    'item0-desc': 'Seja invocado como fantasma a outro mundo para ajudar o mestre de lá por um certo período de tempo. Você será recommponsado com um Símbolo de Fidelidade se conseguir ajudar o outro jogador com sucesso.',
    'item1-label': 'Pedra do Sinal Branco',
    'item1-desc': 'Anel especial que pode ser gravado com o nome de um deus. Facilita a conexão com o mundo de jogadores que escolheram o mesmo deus.',
    'item2-label': 'Pedra do Sinal Branco Pequena',
    'item2-desc': 'Seja invocado como uma sombra a outro mundo para ajudar o mestre de lá por um certo período de tempo. Você será recommponsado se conseguir ajudar o outro jogador com sucesso.',
    'item3-label': 'Pedra do Sinal Branco Pequena',
    'item3-desc': 'Anel especial que pode ser gravado com o nome de um deus. Facilita a conexão com o mundo de jogadores que escolheram o mesmo deus.',
    'item4-label': 'Pedra do Sinal Vermelho',
    'item4-desc': 'Seja invocado como espírito sombrio a outro mundo a derrote o invocador para adquirir um Símbolo de Rancor.',
    'item5-label': 'Olho de Dragão',
    'item5-desc': 'Invade um mundo com uma escama de gradão para obter a escama do mestre de lá.',
    'item6-label': 'Orbe do Olho Vermelho Quebrado',
    'item6-desc': 'Derrote o mestre do mundo que você invadiu para adquirir um Símbolo de Rancor.',
    'item7-label': 'Orbe do Olho Azul Quebrado',
    'item7-desc': 'Só pode ser usado por membros do pacto dos Sentinelas Azuis. Puna os cupados para contribuir ao seu pacto.',
    'item8-label': 'Emblema do Rato',
    'item8-desc': 'Junte-se a este pacto e use este anel para atrair invasores do território do Rei Rato para o seu mundo.',
    'item9-label': 'Selo de Guardião do Sino',
    'item9-desc': 'Junte-se a este pacto e use este anel para ser automaticamente invocado ao mundo de um invasor do domínio dos guardiões do sino.',
    'item10-label': 'Selo do Guardião',
    'item10-desc': 'Junte-se a este pacto e use este anel para ser automaticamente invocado aos mundos dos aspóstolos azuis invadidos por espíritos sombrios.'
  },
  'fr': {
    'name': 'Français',
    'credit': 'Fuzati',
    'sm1': 'Mémoire d\'âmes de l\'utilisateur',
    'sm2': 'Etendue des joueurs joignables',
    'sm3': 'Mémoire d\'âmes de l\'hôte',
    'ner': '+ Anneau-Cartouche',
    'none': 'Aucun objet sélectionné',
    'updated': 'mis à jour le',
    'by': 'par',
    'full': 'complet',
    'guide': 'guide',
    'item0-label': 'Stéatite de Marque Blanche',
    'item0-desc': 'Permet de se faire invoquer dans un autre monde sous la forme de Spectre pour y aider un autre joueur pendat un certain temps. Si vous respectez le contrat, vous recevrez une Marque de loyauté.',
    'item1-label': 'Stéatite de Marque Blanche',
    'item1-desc': 'Un anneau spécial sur lequel il est possible de graver le nom d\'un dieu. Il est alors plus simple pour son porteur de se connecter aux mondes des joueurs ayant choisi de rendre hommage au même dieu.',
    'item2-label': 'Petite Stéatite de Marque Blanche',
    'item2-desc': 'Permet de se faire invoquer dans un autre monde sous la forme d\'une Ombre pour y aider un autre joueur pendat un certain temps. Si vous respectez le contrat, vous recevrez une récompense.',
    'item3-label': 'Petite Stéatite de Marque Blanche',
    'item3-desc': 'Un anneau spécial sur lequel il est possible de graver le nom d\'un dieu. Il est alors plus simple pour son porteur de se connecter aux mondes des joueurs ayant choisi de rendre hommage au même dieu.',
    'item4-label': 'Stéatite de Marque Rouge',
    'item4-desc': 'Permet de se faire invoquer dans un autre monde sous forme d\'Esprit sombre et d\'y triompher de l\'Invocateur pour gagner une Marque de loyauté.',
    'item5-label': 'Œil du Dragon',
    'item5-desc': 'Il permet d\'envahir un monde pourvu d\'une Écaille de Dragon, afin de la dérober à son propriétaire.',
    'item6-label': 'Orbe d\'Œil Rouge Fissuré',
    'item6-desc': 'Triomphez du Maître du monde que vous avez envahi pour remporter une Marque de malveillance.',
    'item7-label': 'Orbe d\'Œil Bleu Fissuré',
    'item7-desc': 'Seuls les personnages ayant prêté serment auprès des Sentinelles bleuse peuvent l\'emploter. Châtiez les coupables pour renforcer votre serment.',
    'item8-label': 'Emblème du Rat',
    'item8-desc': 'Prêtez serment d\'allégeance au Roi rat et portez cet anneau pour attirer dans votre monde les intrus qui s\'infiltrent sur le territoire du Roi.',
    'item9-label': 'Sceau de Garde-Cloche',
    'item9-desc': 'Prêtez serment d\'allégeance aux Garde-cloches et portez cet anneau pour attirer dans votre monde les intrus qui s\'infiltrent sur leur territoire.',
    'item10-label': 'Sceau de Gardien',
    'item10-desc': 'Prêtez serment d\'allégeance et portez cet anneau pour rejoindre automatiquement les mondes d\'Apôtres bleus envahis par des esprits maléfiques.'
  },
  'it': {
    'name': 'Italiano',
    'credit': 'Caus7iK',
    'sm1': 'Memoria delle anime di chi utilizza l\'oggetto',
    'sm2': 'Intervallo dei giocatori disponibili',
    'sm3': 'Memoria delle anime dell\'host',
    'ner': '+ Anello con Nome',
    'none': 'Nessun oggetto selezionato',
    'updated': 'aggiornato al',
    'by': 'da',
    'full': 'intero',
    'guide': 'guida',
    'item0-label': 'Pietra Bianca',
    'item0-desc': 'Ti evoca come fantasma in un altro mondo per assistere il signore di quel mondo per un certo tempo. Verrai ricompensato con un Segno di Fedeltà per aver con successo aiutato l\'altro giocatore.',
    'item1-label': 'Pietra Bianca',
    'item1-desc': 'Uno speciale anello che può essere inciso col nome di una divinità. Rende più semplice la connessione fra giocatori che hanno scelto lo stesso dio.',
    'item2-label': 'Pietra Bianca Piccola',
    'item2-desc': 'Ti evoca come ombra in un altro mondo per assistere il signore di quel mondo per un certo tempo. Verrai ricompensato per aver con successo aiutato l\'altro giocatore.',
    'item3-label': 'Pietra Bianca Piccola',
    'item3-desc': 'Uno speciale anello che può essere inciso col nome di una divinità. Rende più semplice la connessione fra giocatori che hanno scelto lo stesso dio.',
    'item4-label': 'Pietra Rossa',
    'item4-desc': 'Vieni evocato come spirito oscuro in un altro mondo, sconfiggi chi ti ha evocato per acquisire un Simbolo di Rancore.',
    'item5-label': 'Occhio del Drago',
    'item5-desc': 'Invadi un mondo con una Scaglia di Drago per reclamare la scaglia dal suo signore.',
    'item6-label': 'Globo dell\'Occhio Rosso Incrinato',
    'item6-desc': 'Sconfiggi il signore del mondo che hai invaso per acquisire un Segno di Rancore.',
    'item7-label': 'Globo dell\'Occhio Blu Incrinato',
    'item7-desc': 'Può essure usato solo dai membri del pattto delle Sentinelle del Blu. Punisci il colpevole per rafforzare il legame col tuo patto.',
    'item8-label': 'Sigillo del Ratto',
    'item8-desc': 'Unisciti al patto e indossa questo anello per attirare nel tuo mondo coloro che sconfinano nel terrirorio del Re Ratto.',
    'item9-label': 'Sigillo dei Custodi della Campana',
    'item9-desc': 'Unisciti a questo patto e indossa questo anello per essere automaticamente evocato nel mondo di un invasore del dominio dei custodi della campana.',
    'item10-label': 'Sigillo del Guardiano',
    'item10-desc': 'Unisciti al patto e indossa questo anello per essere automaticamnte evocato nei mondi delle sentinelle del blu invase da spiriti oscuri.'
  },
  'es': {
    'name': 'Español',
    'credit': 'Matutin',
    'sm1': 'Memoria de almas de quien utiliza el objeto',
    'sm2': 'Rango de jugadores disponibles',
    'sm3': 'Memoria de almas del anfitrion',
    'ner': '+ Anillo del Nombre Grabado',
    'none': 'Ningun objeto seleccionado',
    'updated': 'actualizado el',
    'by': 'por',
    'full': 'completa',
    'guide': 'guia',
    'item0-label': 'Saponita de Señal Blanca',
    'item0-desc': 'Eres conjurado a otro mundo como espectro para ayudar al dueño de ese mundo durante un tiempo. Recibirás un Símbolo de fidelidad por ayudar con éxito al otro jugador.',
    'item1-label': 'Saponita de Señal Blanca',
    'item1-desc': 'Un anillo especial en el que puede grabarse el nombre de un dios. Hace que resulte más fácil conectar con los mundos de jugadores que han elegido el mismo dios.',
    'item2-label': 'Saponita Señal Blanca Pequeña',
    'item2-desc': 'Eres conjurado a otro mundo como sombra para ayudar al dueño de ese mundo durante un tiempo. Serás recompensado por ayudar con éxito al otro jugador.',
    'item3-label': 'Saponita Señal Blanca Pequeña',
    'item3-desc': 'Un anillo especial en el que puede grabarse el nombre de un dios. Hace que resulte más fácil conectar con los mundos de jugadores que han elegido el mismo dios.',
    'item4-label': 'Saponita de Señal Roja',
    'item4-desc': 'Eres conjurado a otro mundo como un espíritu obscuro y debes derrotar al invocador para consequir un Símbolo de rencor.',
    'item5-label': 'Ojo de Dragón',
    'item5-desc': 'Invade un mundo con una Escama de dragón para reclamar la escama de su dueño.',
    'item6-label': 'Orbe del Ojo Rojo Roto',
    'item6-desc': 'Derrota al dueño del mundo que has invadido para conequir un Símbolo de rencor.',
    'item7-label': 'Orbe del Ojo Azul Roto',
    'item7-desc': 'Solo lo pueden usar los miembros del juramento de los Centinelas Azules Castiga al culpable para contribuir a tu juramento.',
    'item8-label': 'Cresta de la Rata',
    'item8-desc': 'Únete a este juramento y ponte este anillo para atraer a tu mundo a los intrusos del territorio del Rey Rata.',
    'item9-label': 'Sello del Guardian de la Campana',
    'item9-desc': 'Únete a este juramento y ponte este anillo para ser conjurado automáticamente al mundo de un invasor de los dominios de los protectores de la campana.',
    'item10-label': 'Sello del Guardián',
    'item10-desc': 'Únete a este juramento y ponte este anillo para ser conjurado automáticamente a los mundos de los apóstoles azules invadidos por espiritus oscuros.'
  },
  'pl': {
    'name': 'Polski',
    'credit': 'MrCrivit',
    'sm1': 'Pamięć dusz gracza używającego przedmiotu',
    'sm2': 'Zasięg dostępnych graczy',
    'sm3': 'Pamięć dusz hosta',
    'ner': '+ Grawerowany Pierścień',
    'none': 'Nie wybrano przedmiotu',
    'updated': 'zaktualizowano',
    'by': 'by',
    'full': 'pełna',
    'guide': 'przewodnik',
    'item0-label': 'Biały Steatytowy Rysik',
    'item0-desc': 'Czasem możesz trafić jako upiór do innego świata na wezwanie jego władcy. Za udzielenie tam pomocy innemu graczowi otrzymasz znak wierności.',
    'item1-label': 'Biały Steatytowy Rysik',
    'item1-desc': 'Specjalny pierścień, na którym można wygrawerować imię boga. Ułatwi łączenie się ze światami graczy, którzy wybrali tego samego boga.',
    'item2-label': 'Mały Biały Steatytowy Rysik',
    'item2-desc': 'Czasem możesz trafić jako cień do innego świata na wezwanie jego władcy. Za udzielenie tam pomocy innemu graczowi otrzymasz zawsze nagrodę.',
    'item3-label': 'Mały Biały Steatytowy Rysik',
    'item3-desc': 'Specjalny pierścień, na którym można wygrawerować imię boga. Ułatwi łączenie się ze światami graczy, którzy wybrali tego samego boga.',
    'item4-label': 'Czerwony Steatytowy Rysik',
    'item4-desc': 'Czasem możesz trafić jako mroczny duch do innego świata na wezwanie jego władcy. Za pokonanie władcy świata otrzymasz znak niechęci.',
    'item5-label': 'Smocze Oko',
    'item5-desc': 'Pozwala zaatakować świat ze smoczą łuską, by odebrać łuskę jego władcy.',
    'item6-label': 'Pęknięta Kula Czerwonego Oka',
    'item6-desc': 'Pokonaj władcę najechanego przez ciebie świata, by zdobyć znak niechęci.',
    'item7-label': 'Pęknięta Kula Niebieskiego Oka',
    'item7-desc': 'Mogą jej używać jedynie członkowie przymierza Błękitnych Strażników. Ukarz winnych, by przysłużyć się swemu przymierzu.',
    'item8-label': 'Szczurza Pieczęć',
    'item8-desc': 'Przystąp do tego przymierza i noś ten pierścień, by zwabić intruzów z terytorium Króla Szczurów do swojego świata.',
    'item9-label': 'Pieczęć Strażników Dzwonu',
    'item9-desc': 'Przystąp do tego przymierza i noś ten pierścień, by automatycznie przyzwano cię do świata najeżdżającego królestwo Strażników Dzwonu.',
    'item10-label': 'Pieczęć Strażnika',
    'item10-desc': 'Przystąp do tego przymierza i noś ten pierścień, by automatycznie przyzwano cię do świata Apostołów Błękitu, których zaatakowały mroczne duchy.'
  },
  'zh': {
    'name': '漢語',
    'credit': 'Kiki',
    'sm1': '正在使用物品的玩家的靈魂記憶',
    'sm2': '在線玩家的範圍',
    'sm3': '主人的靈魂記憶',
    'ner': '+ 刻名戒指',
    'none': '沒有選中的物品',
    'updated': '更新',
    'by': '由',
    'full': '完成',
    'guide': '指南',
    'item0-label': '白標記蠟石',
    'item0-desc': '以半靈體受召前往其他世界，即可於固定時間内救助該世界的主人。救助成功，可獲得賞賜。',
    'item1-label': '白標記蠟石',
    'item1-desc': '可刻上諸神之名的特別戒指，裝備者與選擇相同神祇者的世界，將更易於連結。',
    'item2-label': '白標記小蠟石',
    'item2-desc': '以半靈體受召前往其他世界，即可於固定時間内救助該世界的主人。救助成功，可獲得賞賜。',
    'item3-label': '白標記小蠟石',
    'item3-desc': '可刻上諸神之名的特別戒指，裝備者與選擇相同神祇者的世界，將更易於連結。',
    'item4-label': '紅標記蠟石',
    'item4-desc': '可從記號處以闇靈身分受召前往其他世界，只要打倒世界主人，就可獲得憎恨之證。',
    'item5-label': '古龍眼珠',
    'item5-desc': '尋找其他世界中的「龍鱗」，並侵入該世界奪取之。',
    'item6-label': '龜裂血紅眼眸寶珠',
    'item6-desc': '侵入後若能打倒該世界的主人，就可獲得憎恨之證。',
    'item7-label': '龜裂深藍眼眸寶珠',
    'item7-desc': '只有「青之守護者」誓約者才能使用。誅滅罪人的誓約者，可提高誓約貢獻度。',
    'item8-label': '鼠族徽記',
    'item8-desc': '訂立誓約的情況下穿戴在身，可將侵入萬鼠之王領域者，強制召喚到自己的世界中。',
    'item9-label': '鐘衛徽記',
    'item9-desc': '訂立誓約的情況下穿戴在身，可自動將自己召喚至侵入鐘衛領域者的世界中。',
    'item10-label': '守護徽記',
    'item10-desc': '訂立誓約的情況下穿戴在身，可自動將自己召喚至，漕到闇靈侵入的青教教徒世界中。'
  }
}

})();
