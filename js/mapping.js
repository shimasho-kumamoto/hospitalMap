//======================================================================================================地図描画

//地図描画変数
//GPSデータの取得
var map;

var deflat = 33.229117;
var deflng = 130.825562;

function initMap() {
  var myLatLng={lat: 33.229117, lng: 130.825562};

  //mapを表示
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: myLatLng
  });
}

//------------------------------------------------------------------------------------------------------位置情報取得処理
function start_func() {
  initialize(deflat, deflng);
  /*get_location();*/
}

//位置情報を取得
function get_location() {
  if (navigator.geolocation) {
    // 現在の位置情報取得を実施 正常に位置情報が取得できると、successCallbackがコールバックされます。
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    initialize(deflat, deflng);
  }
}

// ( 2 )位置情報が正常に取得されたら
function successCallback(pos) {
  var Potition_latitude = pos.coords.latitude;
  var Potition_longitude = pos.coords.longitude;

  // 位置情報が取得出来たらGoogle Mapを表示する
  initialize(Potition_latitude, Potition_longitude);
}

function errorCallback(error) {
  initialize(deflat, deflng);
}

// ( 3 )Google Map API を使い、地図を読み込み
function initialize(x, y) {
  // Geolocationで取得した座標を代入
  var myLatLng = {
    lat: x,
    lng: y
  };

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: myLatLng
  });
}

//==============================================================================================マーカー＆infowindow


//----------------------------------------------------------------------------------------------空の配列宣言
var datalist = [" "];
var visitno = [" "];
var visitinfo = [" "];

//--------------------------------------------------------------------------------------------------------------------マーカークリック回数を記録し別ページに飛ぶアクションの変数
var clicks = 0;
var zoom = 1;

//--------------------------------------------------------------------------------------------------------------------他のinfowinがあればcloseするための変数
var currentInfowin = null;


//----------------------------------------------------------------------------------------------CSVファイルの読み込み


$(function() {
  var csvList;
  var target = '#hospitallist';
  var insert = '';
  $.ajax({
    url: './data/location.csv',
    success: function(data) {

      //----------------------------------------------------------------------------------------------csvを配列に格納
      csvList = $.csv()(data);

      //----------------------------------------------------------------------------------------------データを別配列に格納
      for (var i = 1; i < csvList.length - 1; i++) {

        //-------------------------------------------------------------------------------------------------------------座標重複時にLngをプラス方向にずらす
        var lng = '';
        var flg = 0;
        for (var j = 2; j < i; j++) {
          if (csvList[i][5] == csvList[j][5] && csvList[i][6] == csvList[j][6]) {
            flg = 1;
          }
        }

        if (flg == 1) {
          lng = Number(csvList[i][6]) + 0.00005;
        } else {
          lng = csvList[i][6];
        }

        datalist.push(new google.maps.LatLng(csvList[i][5], lng));
        var no = 1;
        //visitno.push(String(csvList[i][4]));
        visitinfo.push('<div id="infowindow"><div id="title">' + csvList[i][1] + '</div></br><div id="tel">' + csvList[i][2] + '</div></br><a href="http://maps.google.com/maps?daddr=' + csvList[i][5] + ',' + csvList[i][6] + '&saddr=%E7%8F%BE%E5%9C%A8%E5%9C%B0&dirflg=d&t=m">　現在地からルート検索</a>');
      };
      $(target).append(insert);
    }
  });
});

//吹き出しを作成し、mouseOver & Outイベント作成
function attachMessage(marker, msg, latlng) {
  //infowindowを作成
  var infowin = new google.maps.InfoWindow({
    content: msg
  });

  //---------------------------------------------------------------------------------マウスオーバーでinfowinを開く&別のinfowinを閉じる
  google.maps.event.addListener(marker, 'mouseover', function(event) {
    if (currentInfowin) {
      currentInfowin.close();
    }
    infowin.open(map, marker);
    currentInfowin = infowin;
  });
  //---------------------------------------------------------------------------------クリック処理（mapのzoomによって処理を変える）
  google.maps.event.addListener(marker, 'click', function(event) {
    zoom = map.getZoom();
    map.panTo(latlng);
    map.setZoom(20);
    if (clicks == 1 && zoom < 20) {
      clicks = 0;
    } else {
      clicks = 1;
    }
  });
}

//マーカー用配列
var markers = [];

//複数マーカーを表示
function drop() {
  for (var i = 0; i < datalist.length; i++) {
    markers.push(new google.maps.Marker({
      position: datalist[i],
      map: map,
      zIndex: datalist.length - i,
    }));
    attachMessage(markers[i], visitinfo[i], datalist[i]);
  }
}
