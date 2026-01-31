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
        let openUrl = `${NX.CONST.host}/tenpo_input.aspx?tenpo_cd=${base.code}&dt=${today}`;

        // 特定条件なら自動オープンモードにするなどのロジックも可
        if (status === '開校前' && pcCheck === '○') {
          openUrl += '&mode=autoOpen';
        }

        return {
          ...base,
          status,
          pcCheck,
          openUrl
        };
      });

      // 4. Stateを更新
      commit({ unitStatus });
    } catch (e) {
      console.error('UnitStatus Fetch Error:', e);
    }
  }
};
