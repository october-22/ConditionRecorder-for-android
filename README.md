--------------------------------------------------------

# ConditionRecorder for android (Beta)

--------------------------------------------------------
## 概要
--------------------------------------------------------

"Condition Recorder"は、日々の体調管理、記録を行います。

- GoogleスプレッドシートとGAS（Google Apps Script）によって制御されます。
- 入力内容はオンラインでGoogleドライブと同期されます。
- "database"ワークシートを使って、データを自由に抽出・改変可能です。
- その日の体調を5段階で記録し、色分けにより体調の変化を俯瞰できます。
- 血圧記録、メモ、簡易的なグラフ作成機能があります。

--------------------------------------------------------
## 導入
--------------------------------------------------------

1. 以下のURLから共有スプレッドシートを開きます。(閲覧のみの状態)
   
   https://docs.google.com/spreadsheets/d/1v4ArXOPi_Cq02EfkH2FQ4UKafyTPSMKkiWczRoje9Zw/edit?usp=sharing
   

3. スプレッドシートを自身のGoogleドライブにコピーします。
   メニュー > コピーを作成

4. コピーされたスプレッドシートに直接入力できますが、スマホで利用する場合は次の手順が必要です。

5. Playストアで「Googleスプレッドシート」アプリをインストールし、自分のGoogleアカウントでログイン。

6. コピーしたスプレッドシートを選択し、利用開始。

--------------------------------------------------------
## 使い方
--------------------------------------------------------

1. **mood** : プルダウンリストで気分を選択します。

2. **memo** : プルダウンリストで状態を選択します。
   - 選択すると、上のセルにテキストが追加されます（反映に2〜3秒かかる場合があります）。
   - 複数の項目を順番に追加可能で、CSV形式で保存されます。
   - オリジナル項目の追加も可能です（リスト末尾の編集ボタンで編集できます）。

3. **bp** : 血圧を入力します。
   - 上の血圧、下の血圧、脈拍をCSV形式で入力します。
   - 入力例: 120,70,75

4. **graph** : 簡易的なグラフを作成します。
   - データが蓄積されたらグラフを作成してみましょう。
   - グラフには、午前中・午後の血圧、起床時間、就寝時間が表示されます。
   - 血圧は起床時と就寝前の2回測定し、最初の入力が起床時、最後の入力が就寝時として扱います。

5. **input** : 「OK」で保存、または「cancel」で入力をクリアします。

--------------------------------------------------------
## ワークシートの説明
--------------------------------------------------------

- **input** : 入力用インターフェース。
- **chart** : 「mood」で入力された気分を色で表示。
- **bp** : 血圧の午前・午後の記録。
- **database** : すべての記録が保存されるシート。
- **graph** : グラフを作成した際に生成されるシート。

--------------------------------------------------------
## AppsScript にアクセスする場合
--------------------------------------------------------

- 拡張機能からAppsScriptにアクセスしようとすると「Bad Request Error 400」が表示されることがあります。
- 複数のGoogleアカウントがログイン中だとエラーが発生する場合があるため、すべてログアウトし、再度ログインし直してからアクセスしてください。
