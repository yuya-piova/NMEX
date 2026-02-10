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
    const newErrors = (state.errorTasks || []).filter(t => t.id !== taskId);

    commit({
      tasks: newTasks,
      errorTasks: newErrors
    });

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
  },
  /**
   * 管理機能: チェック実行
   * @param {string} type - 'text', 'open', 'schedule', 'interview'
   * @param {object} params - { from, to, nendo, season }
   */
  async runManagementCheck(commit, state, { type, params }) {
    // 実行中表示のために一旦クリア
    commit({ managementResults: [] });

    try {
      let results = [];
      const { from, to } = params;

      // 対象校舎リスト (nmextf.jsのロジック: 広島エリア b34)
      // NXBaseが使えない場合を考慮して、主要な校舎コードを定義しておきます
      let targetBases = [
        { code: '3401', name: '皆実町' },
        { code: '3403', name: '宇品' },
        { code: '3405', name: '中筋' },
        { code: '3406', name: '古江' },
        { code: '3410', name: '安芸府中' },
        { code: '3416', name: '広島駅前' },
        { code: '3419', name: '祇園' },
        { code: '3423', name: '五日市' },
        { code: '3452', name: '庚午' }
      ];

      // NXBaseが利用可能なら動的に取得
      if (typeof NXBase !== 'undefined') {
        try {
          targetBases = new NXBase().rawNXT
            .filterByCondition(['unitcd', 'b34', false], ['closed', ''], ['realbase', 'TRUE'])
            .pickColumns(['basecd', 'basename'])
            .toObjectArray()
            .map(b => ({ code: b.basecd, name: b.basename }));
        } catch (e) {
          console.warn('NXBase failed', e);
        }
      }

      // --- 1. テキスト配布チェック ---
      if (type === 'text') {
        for (const base of targetBases) {
          const url = `/text/text_list_body.aspx?tenpo_cd=${base.code}&publish_cd=&input1_dt=${from}&input2_dt=${to}&haifu_flg=1`;
          const snap = await SnapData.quickFetch({ url: `${NX.CONST.host}${url}`, noCache: true });
          const $html = snap.getAsJQuery();
          const count = $html.find('input[name=delivery_ch]').length;

          if (count > 0) {
            results.push({
              title: `${base.name}`,
              text: `${count}個 未配布`,
              url: `${NX.CONST.host}${url}`,
              type: 'warning'
            });
          }
        }
      }

      // --- 2. 開校チェック ---
      else if (type === 'open') {
        for (const base of targetBases) {
          const url = `/tenpo_yotei.aspx?input_f_dt=${from}&input_t_dt=${to}&tenpo_cd=${base.code}`;
          const snap = await SnapData.quickFetch({ url: `${NX.CONST.host}${url}`, noCache: true });
          const $html = snap.getAsJQuery();
          // 赤色(#ffcccc)の背景になっているセル＝閉校日なのに設定がおかしい日
          const count = $html.find('input[value="#ffcccc"]').length;

          if (count > 0) {
            results.push({
              title: `${base.name}`,
              text: `${count}件 エラー`,
              url: `${NX.CONST.host}${url}`,
              type: 'danger'
            });
          }
        }
      }

      // --- 3. 講習SJ入力チェック ---
      else if (type === 'schedule') {
        // 全社または広島県校舎(c3400)
        const url = `/s/schedule_input_check.aspx?tenpo_cd=c3400&input_cb=1&input1_dt=${from}&input2_dt=${to}`;
        const snap = await SnapData.quickFetch({ url: `${NX.CONST.host}${url}`, noCache: true });

        // テーブル解析 (行ごとに処理)
        const $rows = snap.getAsJQuery('table tr:gt(0)');
        $rows.each(function() {
          const tds = $(this).find('td');
          if (tds.length < 5) return;
          const baseName = tds
            .eq(0)
            .text()
            .trim();
          const countTotal = parseInt(tds.eq(1).text()) || 0;
          const countInput = parseInt(tds.eq(2).text()) || 0;
          const diff = countTotal - countInput;

          if (diff > 0) {
            results.push({
              title: baseName,
              text: `未入力 ${diff}件`,
              url: `${NX.CONST.host}${url}`,
              type: 'warning'
            });
          }
        });
      }

      // --- 4. 面談過去対応チェック ---
      else if (type === 'interview') {
        // 面談チェックはパラメータが複雑なため、とりあえず固定のロジックで実装
        const nendo = params.nendo || NX.VAR.nendo;
        const season = params.season || '2'; // デフォルト夏
        const ns = `${nendo}${season}`;

        // 共通パラメータ
        const commParam = `nendo_season_cb=${ns}&tanto_cd=&tanto_cb=1&kado_flg=1&menu_cb=&cb=&sort_cb=4&mendan_status_cb=nn&kaiyaku_flg=1&gen_course_flg=1&mikomi_flg=1&mendan_aite_flg=1&mendan_tanto_flg=1&shukei_cb=0&shibo_cb_flg=1`;

        // 中四国全体で取得 (a5031)
        const nextUrl = `/s/teian_list_body.aspx?${commParam}&tenpo_cd=a5031&next_dt1=${NX.DT.CMP_START.md}&next_dt2=${NX.DT.today.md}&gakunen_cb=&input_dt1=&input_dt2=&course_ng=`;

        const snap = await SnapData.quickFetch({ url: `${NX.CONST.host}${nextUrl}`, noCache: true });

        // 簡易解析: 「保留」「日程調整」「面談待」の行を探す
        // NXTableのような高度な解析ライブラリがない前提で、jQueryでカウント
        const $table = snap.getAsJQuery('table');
        const counts = {}; // { baseName: count }

        $table.find('tr:gt(0)').each(function() {
          const $tr = $(this);
          const baseName = $tr
            .find('td')
            .eq(0)
            .text()
            .trim(); // 教室名
          const status = $tr
            .find('td')
            .eq(6)
            .text()
            .trim(); // 状態 (列インデックスは推定)

          if (['保留', '日程調整', '面談待'].includes(status)) {
            counts[baseName] = (counts[baseName] || 0) + 1;
          }
        });

        for (const [base, count] of Object.entries(counts)) {
          results.push({
            title: base,
            text: `未対応 ${count}件`,
            url: `${NX.CONST.host}${nextUrl}`, // フィルタ済みURLではないがリンク用
            type: 'info'
          });
        }
      }

      if (results.length === 0) {
        results.push({ title: '完了', text: '対象データはありません', type: 'success' });
      }

      commit({ managementResults: results });
    } catch (e) {
      console.error('Check Error:', e);
      commit({ managementResults: [{ title: 'Error', text: e.message, type: 'danger' }] });
    }
  },
  /**
   * 通知の一括チェック (15分おきに実行予定)
   */
  async fetchNotifications(commit, state) {
    const notifications = [];
    const host = NX.CONST.host;

    try {
      // 1. index_info.aspx のチェック (複数の一括通知)
      //    (連絡事項、トーク、ワークフロー、予定など)
      const indexInfoSnap = await SnapData.quickFetch({ url: `${host}/index_info.aspx`, noCache: true });
      const indexInfoHtml = indexInfoSnap.getAsRawString(); // または .result など

      // チェック定義リスト (拡張性確保)
      const indexChecks = [
        { key: '未処理の生徒連絡事項', icon: 'fa-solid fa-envelope', url: '/s/student_renraku.aspx', type: 'warning' },
        {
          key: '未確認の講師トーク',
          icon: 'fa-solid fa-chalkboard-user',
          url: '/talk/talkmenu.aspx?talk_type=lecturer&midoku_flg=1&condition_type=tenpo',
          type: 'info'
        },
        { key: 'ワークフロー', icon: 'fa-solid fa-ticket', url: '/sso/mobilenetzmenu.aspx?page_kind=1&app_name=workflow', type: 'warning' },
        {
          key: '未確認の生徒トーク',
          icon: 'fa-solid fa-comments',
          url: '/talk/talkmenu.aspx?talk_type=student&midoku_flg=1&condition_type=tenpo',
          type: 'info'
        },
        { key: '未確認の予定', icon: 'fa-solid fa-calendar-days', url: '/schedule/yotei_list.aspx?ch_flg=1', type: 'info' }
      ];

      indexChecks.forEach(check => {
        if (indexInfoHtml.includes(check.key)) {
          notifications.push({
            id: check.key,
            label: check.key,
            icon: check.icon,
            url: `${host}${check.url}`,
            type: check.type,
            count: '!' // 件数が不明なものは ! マーク等
          });
        }
      });

      // 2. 解約未承認チェック
      const myGroup = 'a5031'; //myprofiles.getone({ mygroup: '' });
      const cancelUrl = `/k/kaiyaku_list_body.aspx?tenpo_cd=${myGroup}&disp_cb=0&input_dt1=&input_dt2=&kaiyaku_cb=&status_cb=3&end_dt=&sort_cb=1`;
      const cancelSnap = await SnapData.quickFetch({
        url: `${host}${cancelUrl}`,
        noCache: false,
        expiration: 30,
        storeName: 'FluxData',
        key: 'notifyCanceled'
      });

      const cancelCount = cancelSnap.getAsJQuery('input[value=承認]').length;

      if (cancelCount > 0) {
        notifications.push({
          id: 'cancel',
          label: `解約未承認 (${cancelCount}件)`,
          icon: 'fa-solid fa-user-large-slash',
          url: `${host}${cancelUrl}`,
          type: 'danger',
          count: cancelCount
        });
      }

      // 3. 担任未設定チェック
      //    中四国ブロック全体(a5031)などでチェック
      const coachUrl = `/s/student_tanto_list.aspx?tanto_cb=0&tenpo_cd=a5031`;
      const coachSnap = await SnapData.quickFetch({
        url: `${host}${coachUrl}`,
        noCache: false,
        expiration: 15,
        storeName: 'FluxData',
        key: 'notifyNoCoach'
      });
      const noCoachCount = coachSnap.getAsJQuery('table input[type=checkbox]').length;

      if (noCoachCount > 0) {
        notifications.push({
          id: 'nocoach',
          label: `担任未設定 (${noCoachCount}件)`,
          icon: 'fa-solid fa-user-tag',
          url: `${host}${coachUrl}`,
          type: 'warning',
          count: noCoachCount
        });
      }

      commit({ notifications });
    } catch (e) {
      console.error('Notification Fetch Error:', e);
    }
  },
  /**
   * 今月の契約数取得
   */
  async fetchContracts(commit, state) {
    try {
      const groupCd = 'a5031'; //myprofiles.getone({ mygroup: '' }) || 'a5031';
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const formatDate = d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

      const params = {
        tenpo_cd: groupCd,
        input_dt1: formatDate(firstDay),
        input_dt2: formatDate(today),
        tenpo_cb: 1,
        cancel_cb: 1,
        keiyaku_cb: 1,
        kanri_cb: 1,
        week_vl: 4,
        sort_cb: 1,
        tax_cb: 0,
        gakunen_cb: '',
        kiteigessya_cb: '',
        nyukai_cb: ''
      };

      const qs = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `/k/keiyaku_list_body.aspx?${qs}`;
      const fullUrl = `${NX.CONST.host}${url}`; // ★URL保存用

      const snap = await SnapData.quickFetch({ url: fullUrl, noCache: true });
      const count = snap.getAsJQuery('table input[name=b_keiyaku]').length;

      commit({
        contractCount: count,
        contractUrl: fullUrl
      });
    } catch (e) {
      console.error('Fetch Contract Error:', e);
      commit({ contractCount: '-' });
    }
  },

  /**
   * 今月の契約数取得
   */
  async fetchTrials(commit, state) {
    try {
      const groupCd = 'a5031'; //myprofiles.getone({ mygroup: '' }) || 'a5031';
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const formatDate = d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

      const params = {
        tenpo_cd: groupCd,
        input_dt1: formatDate(firstDay),
        input_dt2: formatDate(today),
        tenpo_cb: 1,
        cancel_cb: 1,
        keiyaku_cb: 2,
        kanri_cb: 1,
        week_vl: 4,
        sort_cb: 1,
        tax_cb: 0,
        gakunen_cb: '',
        kiteigessya_cb: '',
        nyukai_cb: ''
      };

      const qs = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `/k/keiyaku_list_body.aspx?${qs}`;
      const fullUrl = `${NX.CONST.host}${url}`; // ★URL保存用

      const snap = await SnapData.quickFetch({ url: fullUrl, noCache: true });
      const count = snap.getAsJQuery('table input[name=b_keiyaku]').length;

      commit({
        trialCount: count,
        trialUrl: fullUrl
      });
    } catch (e) {
      console.error('Fetch Contract Error:', e);
      commit({ trialCount: '-' });
    }
  },

  /**
   * 今月の解約数取得
   */
  async fetchCancels(commit, state) {
    try {
      const groupCd = 'a5031'; //myprofiles.getone({ mygroup: '' }) || 'a5031';
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const formatDate = d => `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

      const params = {
        tenpo_cd: groupCd,
        input_dt1: formatDate(firstDay),
        input_dt2: formatDate(today),
        disp_cb: 3,
        kaiyaku_cb: 1,
        status_cb: 7,
        sort_cb: 1,
        end_dt: ''
      };

      const qs = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join('&');
      const url = `/k/kaiyaku_list_body.aspx?${qs}`;
      const fullUrl = `${NX.CONST.host}${url}`; // ★URL保存用

      const snap = await SnapData.quickFetch({ url: fullUrl, noCache: true });
      const count = snap.getAsJQuery('table input[name=b_kaiyaku]').length;

      // ★ URLもcommit
      commit({
        cancelCount: count,
        cancelUrl: fullUrl
      });
    } catch (e) {
      console.error('Fetch Cancel Error:', e);
      commit({ cancelCount: '-' });
    }
  },
  /**
   * ブロック売上データの取得
   */
  async fetchBlockSales(commit, state, { year, baseCd, force } = {}) {
    const d = new Date();
    year = year || d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear();
    baseCd = baseCd || 'a5031';
    const targetYear = parseInt(year);
    // [キャッシュ確認]
    // 強制更新(force)でなく、かつStateに同じ条件のデータがあれば、何もしない(return)
    if (!force && state.blockSales && state.blockSales.year === targetYear && state.blockSales.baseCd === baseCd) {
      console.log('BlockSales: Using State Cache');
      return;
    }

    const months = [];
    for (let m = 4; m <= 12; m++) months.push({ y: targetYear, m: m });
    for (let m = 1; m <= 3; m++) months.push({ y: targetYear + 1, m: m });

    const targets = ['入会金', '初回月謝', '月謝', '売上値引', '講習料', '模試教材売上', '合宿売上', 'その他', '合計'];

    const dataMap = {};
    targets.forEach(t => (dataMap[t] = {}));

    if (typeof PX_Toast === 'function' && force) PX_Toast('データ取得中...', 'Processing');

    try {
      await Promise.all(
        months.map(async ({ y, m }) => {
          const mm = String(m).padStart(2, '0');
          const url = `${NX.CONST.host}/u/yosandata.aspx?tenpo_cd=${baseCd}&shido_ng=${y}/${mm}`;

          // SnapDataで取得 (forceならネットから、falseならローカルDBキャッシュから)
          const snap = await SnapData.quickFetch({ url: url, force: force, storeName: `FluxSales_${baseCd}`, key: `${y}/${mm}` });

          // ★NXTableで解析 (コード削減箇所)
          const table = $NX(snap.getAsJQuery('table')).makeNXTable();
          const records = table.toObjectArray(); // [{ "科目": "入会金", "現状売上": "10,000", ... }, ...]

          records.forEach(row => {
            // 1列目(科目名)を取得
            // 項目名が"科目"でない場合も考慮し、Objectの1番目の値を取得
            const name = Object.values(row)[0] || '';

            let key = targets.find(t => name.includes(t) && t !== '合計');
            if (!key && name === '合計') key = '合計';

            if (key) {
              // ヘッダー名に「現状売上」を含む列を探して値を取得
              // (ヘッダーが変わっても "現状売上" という文字さえあれば動くようにfind)
              const valKey = Object.keys(row).find(k => k.includes('現状売上')) || Object.keys(row)[2];
              const valStr = (row[valKey] || '0').replace(/,/g, '');
              dataMap[key][`${m}月`] = parseInt(valStr) || 0;
            }
          });
        })
      );

      // 集計処理
      const finalData = targets.map(key => {
        const rowData = { category: key };
        let rowTotal = 0;
        months.forEach(({ m }) => {
          const val = dataMap[key][`${m}月`] || 0;
          rowData[`${m}月`] = val;
          rowTotal += val;
        });
        rowData['total'] = rowTotal;
        return rowData;
      });

      // State更新
      commit({
        blockSales: {
          year: targetYear,
          baseCd: baseCd,
          data: finalData,
          updatedAt: new Date().toLocaleTimeString()
        }
      });

      if (typeof PX_Toast === 'function' && force) PX_Toast('データ取得完了');
    } catch (e) {
      console.error('Block Sales Fetch Error:', e);
      if (typeof PX_Toast === 'function') PX_Toast('取得エラー', 'error');
    }
  },
  /**
   * 生徒数集計データの取得 (枠組み)
   */
  async fetchStudentCounts(commit, state, { year, baseCd, subject, force }) {
    console.log(`Fetch Student Counts: Year=${year}, Base=${baseCd}, Subject=${subject}`);

    if (typeof PX_Toast === 'function') PX_Toast('データ取得ロジックは未実装です', 'Processing');

    // とりあえず更新時刻だけ更新してStateに入れる
    commit({
      studentCounts: {
        year,
        baseCd,
        subject,
        updatedAt: new Date().toLocaleTimeString(),
        data: []
      }
    });
  }
};
