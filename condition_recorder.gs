/****************************************************************
onEdit() B11入力によるトリガーイベント
*****************************************************************/
function onEdit(e) {
  var range = e.range;
  var sheet_input = e.source.getActiveSheet();

  // pulldown add memo //////////////////////////////////////////////////
  if (sheet_input.getName() == 'input' && range.getA1Notation() == 'B6'){
    var line = sheet_input.getRange('B5').getValue();
    var memo = sheet_input.getRange('B6').getValue();

    if (memo == '軽い'){
      line = line + memo 
    }else{
      line = line + memo + ', '
    }
    sheet_input.getRange('B5').setValue(line);
    sheet_input.getRange('B6').setValue('');
    return  
  }

   // pulldown graph ////////////////////////////////////////////
  if (sheet_input.getName() == 'input' && range.getA1Notation() == 'B10'){
    var select = sheet_input.getRange('B10').getValue();

    if (select == 'グラフ削除'){
      delete_graph();  
    }else{
      create_graph(select)  
    }
    sheet_input.getRange('B10').setValue('');
    return
  }

  // input OK or CANCEL ///////////////////////////////////////////////////
  if (sheet_input.getName() == 'input' && range.getA1Notation() == 'B12') {

    var input_value = sheet_input.getRange('B12').getValue();
    if (input_value == 'OK'){
      var mood = sheet_input.getRange('B3').getValue();
      var memo = sheet_input.getRange('B5').getValue();
      var bp = sheet_input.getRange('B8').getValue();
      var nowdate = new Date();

      //save /////////////////////////////////

      save_database(nowdate, mood, memo, bp);
      save_chart(nowdate, mood, memo, bp);
      save_bp(nowdate, bp);
      
      ////////////////////////////////////////
    }
    sheet_input.getRange('B3').setValue('');
    sheet_input.getRange('B5').setValue('');
    sheet_input.getRange('B6').setValue('');
    sheet_input.getRange('B8').setValue('');
    sheet_input.getRange('B10').setValue('');
    sheet_input.getRange('B12').setValue('');
  }
}

/****************************************************************
sheet_databaseに記録する。
*****************************************************************/
//databaseに日時とmoodを記録。
function save_database(nowdate, mood, memo, bp){
  var date = get_date(nowdate);
  var time = get_time(nowdate);
  var sheet_database = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('database');
  sheet_database.appendRow([date, time, mood, bp, memo]);
}

/****************************************************************
sheet_chartに記録する。
*****************************************************************/
function save_chart(nowdate, mood, memo, bp){
  var date = get_date(nowdate);
  var time = get_time(nowdate);
  var lastdate = get_lastdate();
  var lastrow = get_lastrow();
  var color = get_color(mood);
  var comment = time + '\n\nbp : ' + bp + '\nmemo : ' + memo; 
  var sheet_chart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chart');

  if (lastdate == "not data"){//sheet_chartが未入力なら一行名に日付と色を置く。
    sheet_chart.appendRow([date,'']); 
    sheet_chart.getRange(1, 2).setBackground(color);
    sheet_chart.getRange(1, 2).setComment(comment);
    return
  }
  if (date == lastdate){//同一日なら同一行に色を置く。
    lastcolumn = get_lastcolumn(lastrow);
    sheet_chart.getRange(lastrow, lastcolumn).setBackground(color);
    sheet_chart.getRange(lastrow, lastcolumn).setComment(comment);

  }else{//次の日なら新し行に日付と色を置く。
    sheet_chart.appendRow([date, '']); 
    sheet_chart.getRange(lastrow + 1, 2).setBackground(color);
    sheet_chart.getRange(lastrow + 1, 2).setComment(comment);
  }
}

/****************************************************************
* sheet_bpに記録する。
* 例えば午前に二度入力があった場合、上書きされる。原則午前一回の入力
* 午後一回の入力とする。
*****************************************************************/
function save_bp(nowdate, bp){
  if (bp == ''){
    return
  }
  var date = get_date(nowdate);
  var time = get_time(nowdate);
  var bp___ = bp.split(',');//血圧(上)、血圧(下)、脈拍
  var sheet_bp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bp');
  var rowindex = get_rowindex_sheet_bp(date);
  var am_or_pm = get_period(time);

  if (rowindex == -1){//新しい日付なら
    if (am_or_pm == 'am'){//午前
      sheet_bp.appendRow([date, bp___[0], bp___[1], bp___[2]]); //B,C,D列に
    }else{//午後
      sheet_bp.appendRow([date, '', '', '', bp___[0], bp___[1], bp___[2]]);//E,F,G列に
    }
  }else{//既に存在する日付なら
    if (am_or_pm == 'am'){//午前
      sheet_bp.getRange(rowindex, 2).setValue(bp___[0]);
      sheet_bp.getRange(rowindex, 3).setValue(bp___[1]);
      sheet_bp.getRange(rowindex, 4).setValue(bp___[2]);  
    }else{//午後
      sheet_bp.getRange(rowindex, 5).setValue(bp___[0]);
      sheet_bp.getRange(rowindex, 6).setValue(bp___[1]);
      sheet_bp.getRange(rowindex, 7).setValue(bp___[2]);
    }
  }
}

/****************************************************************
 * グラフを作成　血圧(AM)・血圧(PM)・血圧(AMPM)・起床時間・就寝時間
*****************************************************************/
function create_graph(select) {

  delete_graph(); //既にsheet_graphがある場合は削除。
  
  if (select == '血圧(AM)' || select == '血圧(PM)' || select == '血圧(AMPM)'){
    create_sheet_graph_bp(select);
  }else if (select == '起床時間'){
    create_sheet_graph_wakeuptime();
  }else if (select == '就寝時間'){
    create_sheet_graph_bedtime()
  }else{
    return
  }
  
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_graph = spreadsheet.getSheetByName("graph");
  var lastrow = sheet_graph.getLastRow();
  var lastcolumn = sheet_graph.getLastColumn()
  var dataRange = sheet_graph.getRange(1, 1, lastrow, lastcolumn);
  
  var chartBuilder = sheet_graph.newChart();
  chartBuilder.setChartType(Charts.ChartType.LINE);
  chartBuilder.addRange(dataRange);
  chartBuilder.setPosition(1, 1, 0, 0);
  chartBuilder.setOption('useFirstColumnAsDomain', true);
  
  sheet_graph.insertChart(chartBuilder.build());
}

/*************************************************************
 * sheet_praph作成し、sheet_bpから必要なデータをコピーする。
 * ***********************************************************/
function create_sheet_graph_bp(am_pm_ampm){

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_bp = spreadsheet.getSheetByName('bp');
  var sheet_graph = spreadsheet.insertSheet('graph');
  var lastrow = sheet_bp.getLastRow();

  //column A copy
  var rangeA = sheet_bp.getRange('A1:A' + lastrow);
  rangeA.copyTo(sheet_graph.getRange('A1'));

  if (am_pm_ampm == '血圧(AM)'){ // column BCD copy
    var rangeBCD = sheet_bp.getRange('B1:D' + lastrow);
    rangeBCD.copyTo(sheet_graph.getRange('B1'));
  
  }else if(am_pm_ampm == '血圧(PM)'){ //column EFG copy
    var rangeEFG = sheet_bp.getRange('E1:G' + lastrow);
    rangeEFG.copyTo(sheet_graph.getRange('B1'));
  
  }else{ //グラフ(AMPM) //column BCDEFG copy
    var rangeBCDEFG = sheet_bp.getRange('B1:G' + lastrow);
    rangeBCDEFG.copyTo(sheet_graph.getRange('B1'));
  }
}

/*************************************************************
 * sheet_praph作成し、起床時間をdatabaseから取得する
 * ***********************************************************/
function create_sheet_graph_wakeuptime(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_database = spreadsheet.getSheetByName('database');
  var sheet_graph = spreadsheet.insertSheet('graph');
  var lastrow = sheet_database.getLastRow();

  var data = sheet_database.getRange("A1:B" + lastrow).getValues();
  var extractedData = [];
  var currentDate = '';

  // 日付が変わったら最初の記録のみを取得
  for (var i = 0; i < data.length; i++) {
    var date = get_date(data[i][0]);
    var time = get_time(data[i][1]);

    if (date !== currentDate) {
      extractedData.push([date, time]);
      currentDate = date;
      currentTime = time;
    }
  }
  sheet_graph.getRange(1, 1, extractedData.length, 2).setValues(extractedData);
}

/*************************************************************
 * sheet_praph作成し、就寝時間をdatabaseから取得する
 * ***********************************************************/
function create_sheet_graph_bedtime(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_database = spreadsheet.getSheetByName('database');
  var sheet_graph = spreadsheet.insertSheet('graph');
  var lastrow = sheet_database.getLastRow();
  var data = sheet_database.getRange("A1:B" + lastrow).getValues();

  var prev_date = '';
  var prev_time = '';
  var list_bedtime = [];

  for (var i = 0; i < data.length; i++) {
    var current_date = get_date(data[i][0]);
    var current_time = get_time(data[i][1]);
    
    if (prev_date == ''){
      prev_date = current_date;
      prev_time = current_time;
    }else if(prev_date == current_date){
      prev_date = current_date;
      prev_time = current_time;
    }else if (prev_date != current_date){
      list_bedtime.push([prev_date, prev_time]);
      prev_date = current_date;
      prev_time = current_time;
    }
  }
  sheet_graph.getRange(1, 1, list_bedtime.length, 2).setValues(list_bedtime);
}


/****************************************************************
グラフシートを削除
sheet"graph"があった場合は削除。
*****************************************************************/

function delete_graph(){
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet_graph = spreadsheet.getSheetByName("graph");
  if (sheet_graph) {
    spreadsheet.deleteSheet(sheet_graph);
  }
}

/****************************************************************
* 日時型から文字列の日付のみを取り出す。
*****************************************************************/
function get_date(nowdate) {
  return Utilities.formatDate(nowdate, "JST", "yyyy/MM/dd");
}

/****************************************************************
* 日時型から文字列の時刻のみを取り出す。
*****************************************************************/
function get_time(nowdate) {
  return Utilities.formatDate(nowdate, "JST", "HH:mm:ss");
}

/****************************************************************
 * sheet_bpから同一日付があるか検索し、あれば該当行位置を返す。
 * 無ければ-1を返す。
 * date : 文字列型日付
*****************************************************************/

function get_rowindex_sheet_bp(date){
  var sheet_bp = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('bp');
  var data = sheet_bp.getDataRange().getValues();

  for (var i = 0; i < data.length; i++) {
    var rowdate = get_date(data[i][0]);
    if (rowdate === date) {
      return i + 1;
    }
  }
  return -1;
}

/****************************************************************
moodからcolorを取得する。
*****************************************************************/
function get_color(mood){
  if ("良い" == mood){
    return '#FF8000';  
  }else if("まあまあ" == mood){
    return '#FFFF00';
  }else if ("普通" == mood){
    return '#80FF00';
  }else if ("少し悪い" == mood){
    return '#66B2FF';
  }else if ("悪い" == mood){
    return '#0066CC';
  }else if ('' == mood){ //mood記録無しメモのみ記録
    return '#E0E0E0';
  }
}

/****************************************************************
sheet_chart指定行から、最終列の次を取得
*****************************************************************/
function get_lastcolumn(row) {
  var sheet_chart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chart');
  var column = 2;
  var color = sheet_chart.getRange(row, column).getBackground();
  
  while (color != "#ffffff") {
    column++;
    color = sheet_chart.getRange(row, column).getBackground();
  }
  return column;
}

/****************************************************************
sheet_chart最終行を取得
*****************************************************************/
function get_lastrow() {
  var sheet_chart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chart');
  var lastrow = sheet_chart.getLastRow();
  return lastrow;
}

/****************************************************************
sheet_chartから最終行の日付を取得。
*****************************************************************/
function get_lastdate(){
  var sheet_chart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chart');
  var lastrow = sheet_chart.getLastRow();
  if (lastrow == 0){//sheet_chartが未入力だった場合
    return 'not data'
  }
  var column = 1;
  var lastdate = sheet_chart.getRange(lastrow, column).getValue();
  //lastdateをstringにキャスト
  var dateObject = new Date(lastdate);
  lastdate = Utilities.formatDate(dateObject, "JST", "yyyy/MM/dd");
  return lastdate;
}

/****************************************************************
string型時刻から午前か午後かを判別する。
*****************************************************************/
function get_period(time) {
  time = new Date('2000/01/01 ' + time);
  return time.getHours() < 12 ? 'am' : 'pm';
}

/****************************************************************
test用関数　メッセージ出力
*****************************************************************/
function message(msg1, msg2='', msg3='') {
  Browser.msgBox(msg1 + ' : ' + msg2 + ' : ' + msg3);
}


function test_set_color(mood, cell){
  var sheet_chart = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('chart');
  var color = get_color(mood)
  sheet_chart.getRange(cell).setBackground(color)
}

function test_change_color(){
  test_set_color("悪い", "B2")
  test_set_color("少し悪い", "B1")
  test_set_color("少し悪い", "C1")
  test_set_color("少し悪い", "D2")
  test_set_color("普通", "E2")
  test_set_color("普通", "F2")
  test_set_color("普通", "C3")
  test_set_color("まあまあ", "D1")
  test_set_color("まあまあ", "C2")
  test_set_color("良い", "B3")
}

