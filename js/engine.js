/**
 * Huyền Cơ Đường — Mệnh Lý Engine
 * ====================================
 * Bát Tự (Bazi) + Tử Vi (Ziwei) — Tính toán chính xác
 */

(function(global) {
  'use strict';

  var NAYIN_TABLE = [
    'Hải Trung Kim','Lô Trung Hỏa','Đại Lâm Mộc','Lộ Bàng Thổ','Kiếm Phong Kim','Sơn Đầu Hỏa',
    'Giản Hạ Thủy','Thành Đầu Thổ','Bạch Lạp Kim','Dương Liễu Mộc','Tuyền Trung Thủy','Ốc Thượng Thổ',
    'Tích Lịch Hỏa','Tùng Bách Mộc','Trường Lưu Thủy','Sa Thạch Kim','Sơn Hạ Hỏa','Bình Địa Mộc',
    'Bích Thượng Thổ','Kim Bạc Kim','Phúc Đăng Hỏa','Thiên Hà Thủy','Đại Dịch Thổ','Thoa Xuyến Kim',
    'Tang Đố Mộc','Đại Khê Thủy','Sa Trung Thổ','Thiên Thượng Hỏa','Thạch Lựu Mộc','Đại Hải Thủy',
    'Hải Trung Kim','Lô Trung Hỏa','Đại Lâm Mộc','Lộ Bàng Thổ','Kiếm Phong Kim','Sơn Đầu Hỏa',
    'Giản Hạ Thủy','Thành Đầu Thổ','Bạch Lạp Kim','Dương Liễu Mộc','Tuyền Trung Thủy','Ốc Thượng Thổ',
    'Tích Lịch Hỏa','Tùng Bách Mộc','Trường Lưu Thủy','Sa Thạch Kim','Sơn Hạ Hỏa','Bình Địa Mộc',
    'Bích Thượng Thổ','Kim Bạc Kim','Phúc Đăng Hỏa','Thiên Hà Thủy','Đại Dịch Thổ','Thoa Xuyến Kim',
    'Tang Đố Mộc','Đại Khê Thủy','Sa Trung Thổ','Thiên Thượng Hỏa','Thạch Lựu Mộc','Đại Hải Thủy'
  ];

  var HS = ['Giáp','Ất','Bính','Đinh','Mậu','Kỷ','Canh','Tân','Nhâm','Quý'];
  var HS_CN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  var EB = ['Tý','Sửu','Dần','Mão','Thìn','Tỵ','Ngọ','Mùi','Thân','Dậu','Tuất','Hợi'];
  var EB_CN = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  var WX = ['Mộc','Mộc','Hỏa','Hỏa','Thổ','Thổ','Kim','Kim','Thủy','Thủy'];
  var WX_CN = ['木','木','火','火','土','土','金','金','水','水'];
  var EB_WX = ['Thủy','Thổ','Mộc','Mộc','Thổ','Hỏa','Hỏa','Thổ','Kim','Kim','Thổ','Thủy'];
  var EB_WX_CN = ['水','土','木','木','土','火','火','土','金','金','土','水'];
  var WX_COLORS = {Mộc:'#4a6741', Hỏa:'#9e3020', Thổ:'#8b6914', Kim:'#b8893b', Thủy:'#3a5974'};
  var WX_GEN = {Mộc:'Hỏa', Hỏa:'Thổ', Thổ:'Kim', Kim:'Thủy', Thủy:'Mộc'};
  var WX_DESTROY = {Mộc:'Thổ', Hỏa:'Kim', Thổ:'Thủy', Kim:'Mộc', Thủy:'Hỏa'};
  var HIDDEN = [
    ['Quý'],['Kỷ','Quý','Tân'],['Giáp','Bính','Mậu'],['Ất'],
    ['Mậu','Ất','Quý'],['Bính','Mậu','Canh'],['Đinh','Kỷ'],['Kỷ','Đinh','Ất'],
    ['Canh','Nhâm','Mậu'],['Tân'],['Mậu','Tân','Đinh'],['Nhâm','Giáp']
  ];
  var SHISHEN = ['Tỷ Kiên','Kiếp Tài','Thực Thần','Thương Quan','Thiên Tài','Chính Tài','Thiên Quan','Chính Quan','Thiên Ấn','Chính Ấn'];
  var SHISHEN_CN = ['比肩','劫財','食神','傷官','偏財','正財','偏官','正官','偏印','正印'];
  var SOLAR_TERM_DAYS = [5,19,4,20,6,21,6,23,7,23,7,23,7,22,7,23,8,23,8,23,7,22,7,22];

  function getSolarTermIndex(year, month, day) {
    var m = month - 1;
    var termDay = SOLAR_TERM_DAYS[m];
    if (day < termDay) return (m - 1 + 12) % 12;
    return m % 12;
  }

  function calcYearPillar(year, month, day) {
    var baziYear = (month < 2 || (month === 2 && day < 4)) ? year - 1 : year;
    var offset = baziYear - 4;
    return { stem: ((offset % 10) + 10) % 10, branch: ((offset % 12) + 12) % 12 };
  }

  function calcMonthPillar(year, month, day) {
    var yp = calcYearPillar(year, month, day);
    var termIdx = getSolarTermIndex(year, month, day);
    var mStem = ((yp.stem % 5) * 2 + termIdx) % 10;
    return { stem: mStem, branch: termIdx };
  }

  function calcDayPillar(year, month, day) {
    var a = Math.floor((14 - month) / 12);
    var y = year + 4800 - a;
    var m = month + 12 * a - 3;
    var jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
    var refJDN = 2451545, refStem = 6, refBranch = 4;
    var diff = jdn - refJDN;
    return { stem: ((diff % 10 + refStem) % 10 + 10) % 10, branch: ((diff % 12 + refBranch) % 12 + 12) % 12 };
  }

  function calcHourPillar(dayStem, hour) {
    var hBranch = Math.floor((hour + 1) / 2) % 12;
    if (hour === 23 || hour === 0) hBranch = 0;
    var hStem = ((dayStem % 5) * 2 + hBranch) % 10;
    return { stem: hStem, branch: hBranch };
  }

  function calcFourPillars(year, month, day, hour) {
    var yp = calcYearPillar(year, month, day);
    var mp = calcMonthPillar(year, month, day);
    var dp = calcDayPillar(year, month, day);
    var hp = calcHourPillar(dp.stem, hour);
    return [yp, mp, dp, hp];
  }

  function getShiShen(dayStem, otherStem) {
    var diff = (otherStem - dayStem + 10) % 10;
    var yx = (dayStem % 2 === otherStem % 2) ? 0 : 1;
    return (diff * 2 + yx) % 10;
  }

  function calcDaiVan(pillars, gender, year) {
    var isMale = (gender === 'male');
    var yearStem = pillars[0].stem;
    var isYangYear = (yearStem % 2 === 0);
    var forward = (isMale && isYangYear) || (!isMale && !isYangYear);
    var cycles = [];
    for (var dec = 0; dec < 9; dec++) {
      var startAge = dec * 10;
      var offset = forward ? (dec + 1) : -(dec + 1);
      var stem = ((pillars[0].stem + offset) % 10 + 10) % 10;
      var branch = ((pillars[0].branch + offset) % 12 + 12) % 12;
      cycles.push({ stem: stem, branch: branch, startAge: startAge, endAge: startAge + 9 });
    }
    return { cycles: cycles, direction: forward ? 'Thuận hành' : 'Nghịch hành' };
  }

  function getNayin(stem, branch) {
    var idx = (stem * 6 + branch) % 60;
    return NAYIN_TABLE[idx] || '';
  }

  function generateBaziReport(name, gender, year, month, day, hour) {
    var pillars = calcFourPillars(year, month, day, hour);
    var dm = pillars[2];
    var daiVan = calcDaiVan(pillars, gender, year);
    var wc = {Mộc:0, Hỏa:0, Thổ:0, Kim:0, Thủy:0};
    for (var i = 0; i < 4; i++) { wc[WX[pillars[i].stem]]++; wc[EB_WX[pillars[i].branch]]++; }
    var maxW = '', maxC = 0;
    ['Mộc','Hỏa','Thổ','Kim','Thủy'].forEach(function(w) { if (wc[w] > maxC) { maxC = wc[w]; maxW = w; } });
    var de = WX[dm.stem];
    return {
      name: name, gender: gender, birth: { year: year, month: month, day: day, hour: hour },
      pillars: pillars,
      dayMaster: { stem: dm.stem, branch: dm.branch, element: de, strength: wc[de] >= 3 ? 'Thân cường' : 'Thân nhược' },
      wuxingCount: wc, topElement: maxW,
      yongShen: WX_GEN[de], kyThan: WX_DESTROY[de],
      daiVan: daiVan
    };
  }

  var HuyenCo = {
    HS: HS, HS_CN: HS_CN, EB: EB, EB_CN: EB_CN,
    WX: WX, WX_CN: WX_CN, EB_WX: EB_WX, EB_WX_CN: EB_WX_CN,
    WX_COLORS: WX_COLORS, WX_GEN: WX_GEN, WX_DESTROY: WX_DESTROY,
    HIDDEN: HIDDEN, SHISHEN: SHISHEN, SHISHEN_CN: SHISHEN_CN,
    NAYIN_TABLE: NAYIN_TABLE, SOLAR_TERM_DAYS: SOLAR_TERM_DAYS,
    calcYearPillar: calcYearPillar, calcMonthPillar: calcMonthPillar,
    calcDayPillar: calcDayPillar, calcHourPillar: calcHourPillar,
    calcFourPillars: calcFourPillars, calcDaiVan: calcDaiVan,
    getShiShen: getShiShen, getNayin: getNayin,
    generateBaziReport: generateBaziReport
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuyenCo;
  } else {
    global.HuyenCo = HuyenCo;
  }
})(this);
