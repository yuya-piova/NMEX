export const DashboardActions = {
  // 教室開校状況の取得
  async fetchUnitStatus(commit, state) {
    try {
      // 1. 店舗一覧ページを取得
      const url = `${NX.CONST.host}/tenpo.aspx`;
      // SnapDataは既存のライブラリを使用
      const openSnap = await SnapData.quickFetch({ url: url, noCache: true });
      const $openTable = openSnap.getAsJQuery('table');

      // テーブル整形 (1行目はヘッダーなので無視などの既存ロジック)
      $openTable.find('tr:eq(0)').remove();
      const openNXTable = $NX($openTable).makeNXTable();

      // 2. 表示対象の教室リスト (必要に応じて設定で変えられるようにしても良い)
      const targetBases = [
        { code: '3416', name: '広島駅前' },
        { code: '3406', name: '古江' },
        { code: '3401', name: '皆実町' },
        { code: '3410', name: '安芸府中' },
        { code: '3405', name: '中筋' }
      ];

      // 3. データを抽出してオブジェクト化
      const unitStatus = targetBases.map(base => {
        const status = openNXTable.xlookup(base.name, '教室', '状態');
        const pcCheck = openNXTable.xlookup(base.name, '教室', 5); // 5列目がPCチェック欄と仮定

        // 開校ページのURL生成
        // 本日の日付を取得 (ExDate利用)
        const today = new ExDate().as('yyyy-mm-dd');
        const after30 = new ExDate().afterdays(30).as('yyyy-mm-dd');
        let openUrl = `${NX.CONST.host}/tenpo_input.aspx?tenpo_cd=${base.code}&dt=${today}`;

        let boothUrl = `${NX.CONST.host}/kanren/booth2.aspx?hyoji_cb=2&input1_dt=${today}&input2_dt=${after30}&tenpo_cd=${
          base.code
        }&basename=${encodeURIComponent(base.name)}`;

        // 特定条件なら自動オープンモードにするなどのロジックも可
        if (status === '開校前' && pcCheck === '○') {
          openUrl += '&mode=autoOpen';
        }

        return {
          ...base,
          status,
          pcCheck,
          openUrl,
          boothUrl
        };
      });

      // 4. Stateを更新
      commit({ unitStatus });
    } catch (e) {
      console.error('UnitStatus Fetch Error:', e);
    }
  },
  async fetchTasks(commit, state) {
    try {
      // 社員番号を取得 (myprofilesは既存のグローバルオブジェクト)
      const myNumber = myprofiles.getone({ mynumber: '' });
      if (!myNumber) {
        console.warn('社員番号が設定されていません');
        return;
      }

      const path = `/todo/todo_list.aspx?tanto_cd=${myNumber}&base_dt=`;

      // SnapDataを使用してデータ取得 (既存のグローバルクラス)
      // noCache: false にするとキャッシュが効きますが、タスクは更新頻度が高いので都度取得推奨
      const snap = await SnapData.quickFetch({ url: `${NX.CONST.host}${path}`, noCache: true });
      const $table = snap
        .getAsJQuery('table')
        .filter(function() {
          return $(this).parents('table').length === 0;
        })
        .children('tbody');

      // データ解析
      const tasks = $table
        .children('tr:not(:first-child)')
        .map(function() {
          const $tr = $(this);
          const trId = $tr.attr('id') || '';

          // IDが有効な行のみ対象 (tdXXXX という形式)
          if (!trId.startsWith('td')) return null;

          const taskId = trId.replace('td', '');
          // 期限日 (yy/mm/dd形式なので20を付与してDate化)
          // findTdGetTxt は nmexg.js 等で定義されている拡張メソッドと想定
          const dueText = $tr
            .find('td')
            .eq(8)
            .text()
            .trim();
          const due = new Date('20' + dueText);

          // 対象者名 (「校舎：」「生徒：」などの接頭辞を除去)
          const targetName = $tr
            .find('td')
            .eq(2)
            .text()
            .replace(/校舎：|生徒：/g, '')
            .trim();

          // タスク名
          const taskName = $tr
            .find('td')
            .eq(3)
            .find('a')
            .text()
            .trim();

          // 進捗
          const progress = $tr
            .find('td')
            .eq(6)
            .text()
            .trim();

          // 生徒CD検索 (生徒連絡へのリンク用)
          // studentInfoClass は既存グローバルクラス
          let student_cd = null;
          try {
            const studentInfo = new studentInfoClass();
            const found = studentInfo.search(['生徒名', targetName]);
            if (found) student_cd = found['生徒NO'];
          } catch (e) {
            /* エラー無視 */
          }

          return {
            id: taskId,
            title: taskName,
            target: targetName,
            due: dueText,
            isOverdue: new Date() > due, // 期限切れ判定
            progress,
            student_cd
          };
        })
        .get(); // jQueryオブジェクトを配列に変換

      // 期限の古い順にソート
      tasks.sort((a, b) => new Date('20' + a.due) - new Date('20' + b.due));

      commit({ tasks });
    } catch (e) {
      console.error('Task Fetch Error:', e);
    }
  },

  /**
   * タスクを完了にする
   */
  async completeTask(commit, state, taskId) {
    if (!taskId) return;

    // 完了処理 (拡張機能のメッセージング機能を使ってバックグラウンドで処理させる)
    // nmextf.js の実装に倣い、完了フラグ(setState=F)を送信
    chrome.runtime.sendMessage({
      opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?setState=F&doSave=true&id=${taskId}`
    });

    // 画面上から即座に消すために、現在のStateから該当タスクを除外して更新
    const newTasks = (state.tasks || []).filter(t => t.id !== taskId);
    commit({ tasks: newTasks });

    // (任意) PX_Toast が使えるなら表示
    if (typeof PX_Toast === 'function') PX_Toast('タスクを完了にしました');
  },
  /**
   * エラータスク（期限切れ、設定ミスなど）の取得
   */
  async fetchErrorTasks(commit, state) {
    try {
      const tenpo_cd = 'a5031'; // 中四国（nmextf.jsより）

      // 日付フォーマットヘルパー
      const today = new Date();
      const formatDate = d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
      const todayStr = formatDate(today);

      // 1. 過去の未完了タスクを取得
      const undonePath = `/todo/todo_tenpo_list.aspx?tenpo_cd=${tenpo_cd}&personal_flg=1&student_flg=1&teacher_flg=1&tenpo_flg=1&instruction_id=&jyotai_cb=1&category_cb=&progress_vl1=0&progress_vl2=100&base_dt=&taio_dt=&sort_cb=1`;
      const undoneSnap = await SnapData.quickFetch({ url: `${NX.CONST.host}${undonePath}`, noCache: true });

      // 2. 本日の全タスクを取得
      const todayPath = `/todo/todo_tenpo_list.aspx?tenpo_cd=${tenpo_cd}&personal_flg=1&student_flg=1&teacher_flg=1&tenpo_flg=1&instruction_id=&jyotai_cb=&category_cb=&progress_vl1=0&progress_vl2=100&base_dt=${todayStr}&taio_dt=&sort_cb=1`;
      const todaySnap = await SnapData.quickFetch({ url: `${NX.CONST.host}${todayPath}`, noCache: true });

      // データ解析ヘルパー
      const parseTable = $table => {
        return $table
          .filter((_, el) => $(el).parents('table').length === 0) // 親テーブルのみ
          .children('tbody')
          .children('tr:not(:first-child)')
          .map(function() {
            const $tr = $(this);
            const trId = $tr.attr('id') || '';
            if (!trId.startsWith('td') || trId.includes('-')) return null;

            const texts = $tr
              .find('td')
              .map((i, el) =>
                $(el)
                  .text()
                  .trim()
              )
              .get();
            return {
              id: trId.replace('td', ''),
              taskName: `${texts[1] || ''} ${texts[3] || ''}`,
              state: texts[5] || '',
              range: texts[7] || '',
              due: texts[8] || '',
              // 判定用フラグ
              isIncorrectRange: (texts[7] || '') === '' || texts[7].startsWith('～') || texts[7].endsWith('～'),
              isPast: new Date('20' + texts[8]).getTime() < new Date().getTime(),
              isNeedFollow: (texts[3] || '').includes('１対１指導要フォロー'),
              isEnded: ['削除', '完了', '中止'].some(s => (texts[5] || '').includes(s))
            };
          })
          .get()
          .filter(t => t !== null);
      };

      const undoneList = parseTable(undoneSnap.getAsJQuery('table'));
      const todayList = parseTable(todaySnap.getAsJQuery('table'));

      // フィルタリング
      const errorTasks = [];

      // 過去分: 範囲エラー or 期限切れ or フォロー必要
      undoneList.forEach(t => {
        if (t.isIncorrectRange || t.isPast || t.isNeedFollow) {
          errorTasks.push({ ...t, type: 'past' });
        }
      });

      // 本日分: 完了済なのに範囲エラーのもの
      todayList.forEach(t => {
        if (t.isEnded && t.isIncorrectRange) {
          errorTasks.push({ ...t, type: 'today' });
        }
      });

      commit({ errorTasks });
    } catch (e) {
      console.error('ErrorTask Fetch Error:', e);
    }
  },

  /**
   * タスクの期限適正化 (autoClose)
   */
  async fixTaskDeadline(commit, state, taskIds) {
    if (!Array.isArray(taskIds)) taskIds = [taskIds];

    for (const id of taskIds) {
      chrome.runtime.sendMessage({
        opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?doAction=autoClose&id=${id}`
      });
    }
    // 画面更新のために再取得してもよいが、とりあえずStateから消す
    const newErrors = (state.errorTasks || []).filter(t => !taskIds.includes(t.id));
    commit({ errorTasks: newErrors });
  },

  /**
   * 指導フォロー削除 (中止 & autoClose)
   */
  async deleteInstructionTask(commit, state, taskIds) {
    if (!Array.isArray(taskIds)) taskIds = [taskIds];

    for (const id of taskIds) {
      chrome.runtime.sendMessage({
        opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?setState=C&doAction=autoClose&id=${id}`
      });
    }
    const newErrors = (state.errorTasks || []).filter(t => !taskIds.includes(t.id));
    commit({ errorTasks: newErrors });
  },
  /**
   * AsCoachデータの取得 (来校前/在室/帰宅)
   */
  async fetchAsCoachData(commit, state) {
    try {
      // 対象店舗（元のコードに準拠）
      const targets = [
        { code: '3406', name: '古江' },
        { code: '3416', name: '広島駅前' }
      ];

      let waiting = [];
      let going = [];
      let gone = [];

      // 各店舗のデータを並列取得
      await Promise.all(
        targets.map(async shop => {
          // 1. ブース表（生徒リスト）取得
          const boothUrl = `${NX.CONST.host}/gapp/student_list_ajax.aspx?tenpo_cd=${shop.code}&sort_cb=3`;
          const boothSnap = await SnapData.quickFetch({ url: boothUrl, noCache: true });
          // HTML文字列として返ってくるので整形
          const boothRaw = boothSnap.getAsRawString();
          const $boothTable = $(`<html>`).html(boothRaw);

          // 2. 振替リスト取得
          const furikaeUrl = `${NX.CONST.host}/tehai/shido_furikae_list_body.aspx?kekka_cb=01&tenpo_cd=${shop.code}`;
          const furikaeSnap = await SnapData.quickFetch({ url: furikaeUrl, noCache: true });
          const $furikaeTable = furikaeSnap.getAsJQuery('table');

          // データ解析
          $boothTable.find('tr:gt(0)').each(function() {
            const $tr = $(this);
            const tds = $tr.find('td');
            if (tds.length === 0) return;

            const student_nm = tds
              .eq(0)
              .text()
              .trim();
            const inout = tds
              .eq(2)
              .text()
              .trim(); // 入退
            const lect_time = tds
              .eq(4)
              .text()
              .trim(); // 17:00～18:20

            // inputタグのonclick属性などから生徒コードを抽出 (nmextf.jsのロジック)
            // 例: onclick="...('511306')..."
            const onclickText = $tr.find('input[value="対応メモ"]').attr('onclick') || '';
            const match = onclickText.match(/'(\d+)'/);
            const student_cd = match ? match[1] : null;

            // フラグ判定
            const hasFurikae = $furikaeTable.find(`td:contains("${student_nm}")`).length > 0;
            const hasContact = $tr.find('input[value="連絡"]').length > 0;
            const hasTask = $tr.find('input[value="タスク"]').length > 0;

            // 時間判定 (現在時刻と比較して遅刻/授業中などを判定可能だが、今回は単純な入退室判定のみ実装)

            const item = {
              shopName: shop.name,
              student_nm,
              student_cd,
              lect_time,
              inout,
              hasFurikae,
              hasContact,
              hasTask
            };

            // 振り分けロジック
            // 入も退もなければ「来校前(waiting)」
            // 入があって退がなければ「在室(going)」
            // 退があれば「帰宅(gone)」
            if (inout.includes('退')) {
              gone.push(item);
            } else if (inout.includes('入')) {
              going.push(item);
            } else {
              waiting.push(item);
            }
          });
        })
      );

      commit({ asCoach: { waiting, going, gone } });
    } catch (e) {
      console.error('AsCoach Fetch Error:', e);
    }
  }
};
