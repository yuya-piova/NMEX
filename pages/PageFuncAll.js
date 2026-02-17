export default class PageFuncAll {
  constructor() {
    this.path = location.pathname;
  }

  applyAreaMode() {
    //予定表ページは除外
    if (this.path === '/netz/netz1/schedule/yotei.aspx') return;
    const myNumber = myprofiles.getone({ mynumber: '000231' });
    const nowBaseArr = NX.NOWBASE[myNumber] || [];

    ['tenpo_cd', 'main_tenpo_cd'].forEach(name => {
      const $select = $(`select[name=${name}]`);
      if (!$select.length) return; // 要素が存在しない場合はスキップ

      $select.find('option, optgroup').hide();

      const optionsHtml = NMEX_Utils.makeOption(nowBaseArr) + '<option value="allmode">全教室表示</option>';
      $select.append(optionsHtml);

      $select.on('change', e => {
        const $this = $(e.currentTarget);
        if ($this.val() === 'allmode') {
          $this.find('option, optgroup').show();
          $this.find('option[value="allmode"]').remove();
        }
      });
    });
  }
  /**
   * Datepickerの一括設定
   */
  setDatePicker() {
    // 日本語設定
    if ($.datepicker && $.datepicker.regional.ja) $.datepicker.setDefaults($.datepicker.regional.ja);

    // 基本設定のベース
    const baseConfig = {
      numberOfMonths: 3,
      showCurrentAtPos: 1,
      showOtherMonths: true,
      dateFormat: 'yy/mm/dd',
      beforeShow: input => $(input).attr('autocomplete', 'off')
    };

    // ヘルパー: フレームのリサイズを伴う設定を生成
    const getFrameResizeConfig = (openRows, closeRows, dateFormat = 'yy/mm/dd') => ({
      ...baseConfig,
      dateFormat,
      beforeShow: function(input) {
        $(input).attr('autocomplete', 'off');
        $('frameset', parent.document).attr('rows', openRows);
      },
      onClose: function() {
        $('frameset', parent.document).attr('rows', closeRows);
      }
    });

    // ヘルパー: YMD分割入力の同期設定
    const syncYmd = (dateText, prefix, hasYear = true) => {
      const parts = dateText.split('/');
      if (hasYear) {
        const [y, m, d] = parts;
        $(`input[name$=${prefix}_y]`).val(y);
        $(`input[name$=${prefix}_m]`).val(m);
        $(`input[name$=${prefix}_d]`)
          .val(d)
          .trigger('change');
      } else {
        const [m, d] = parts;
        $(`input[name$=${prefix}_m]`).val(m);
        $(`input[name$=${prefix}_d]`)
          .val(d)
          .trigger('change');
      }
    };

    const defaultRows = $('frameset', parent.document).attr('rows') || '130,*';

    // --- ページ別ロジック ---
    switch (this.path) {
      // 1. 標準的なヘッド拡張（yyyy/mm/dd）
      case '/netz/netz1/toiawase_list_head.aspx':
      case '/netz/netz1/tehai/shido_furikae_list_head.aspx':
      case '/netz/netz1/tehai/tehai_list_head.aspx':
      case '/netz/netz1/kanren/booth_select_head.aspx':
      case '/netz/netz1/k/keiyaku_list_head.aspx':
      case '/netz/netz1/shingaku/shingaku_hokoku_list_head.aspx':
      case '/netz/netz1/k/kaiyaku_list_head.aspx':
      case '/netz/netz1/t/teacher_toroku_list_head.aspx':
        $('[name^=input_dt1],[name^=input_dt2],[name^=input1_dt],[name^=input2_dt]').datepicker(getFrameResizeConfig('340,*', defaultRows));
        break;

      // 2. ヘッド拡張（mm/ddのみ）
      case '/netz/netz1/s/teian_list_head.aspx':
        $('input[name^=input_dt],input[name^=next_dt]').datepicker(getFrameResizeConfig('340,*', '165,*', 'mm/dd'));
        break;

      // 3. 手配画面（特殊分割）
      case '/netz/netz1/tehai/shido2_input_sp_h.aspx':
        $('input[name^=input_f_]').datepicker({
          ...getFrameResizeConfig('340,*', '130,*'),
          onSelect: dt => syncYmd(dt, '_f_dt')
        });
        $('input[name^=input_t_]').datepicker({
          ...getFrameResizeConfig('340,*', '130,*', 'mm/dd'),
          onSelect: dt => syncYmd(dt, '_t_dt', false)
        });
        break;

      // 4. 年月日分割入力（汎用）
      case '/netz/netz1/tehai/shido_furikae_input.aspx':
      case '/netz/netz1/kanren/shido_yotei_edit.aspx':
        $('input[name$=_tm_y],input[name$=_tm_m],input[name$=_tm_d]').datepicker({
          ...baseConfig,
          onSelect: dt => syncYmd(dt, '_tm')
        });
        break;

      case '/netz/netz1/t/teacher_toroku_input.aspx':
        $('[name$=_dt_y],[name$=_dt_m],[name$=_dt_d]').datepicker({
          ...baseConfig,
          onSelect: function(dt) {
            const prefix = $(this)
              .attr('name')
              .split('_')[0];
            syncYmd(dt, `${prefix}_dt`);
          }
        });
        break;

      // 5. 年月のみ
      case '/netz/netz1/s/student_schedule_list.aspx':
        $('[name=input_ng]').datepicker({
          ...baseConfig,
          numberOfMonths: 2,
          showCurrentAtPos: 0,
          dateFormat: 'yy/mm'
        });
        break;

      // 6. 複雑なセル内同期
      case '/netz/netz1/tehai/shido_edit_list.aspx':
        $('[name$=_dt]').datepicker(baseConfig);
        $('input[name^=shido_tm_d],input[name^=shido_tm_m]').datepicker({
          ...baseConfig,
          onSelect: (dt, inst) => {
            const [y, m, d] = dt.split('/');
            const $td = $(`#${inst.id}`).closest('td');
            $td
              .find('input[name^=shido_tm_m]')
              .val(m)
              .trigger('change');
            $td
              .find('input[name^=shido_tm_d]')
              .val(d)
              .trigger('change');
          }
        });
        break;
    }

    // --- 全ページ共通の追加設定 ---
    $('[name=next_dt_m],[name=next_dt_d]').datepicker({
      ...baseConfig,
      dateFormat: 'mm/dd',
      onSelect: dt => syncYmd(dt, 'next_dt', false)
    });

    $('[name=input_dt_y],[name=input_dt_m],[name=input_dt_d]').datepicker({
      ...baseConfig,
      onSelect: dt => syncYmd(dt, 'input_dt')
    });
  }
  setDblcopyTable() {
    $(document).on('dblclick', '.dblcopytable', function() {
      const table = this;
      showChoiceModal(
        'Tableエクスポート　出力形式を選んでください',
        [
          { label: 'CSV', value: 'csv' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'Cancel', value: 'cancel' }
        ],
        choice => {
          switch (choice) {
            case 'csv':
              clipper(NMEX_Utils.tableToCSV(table, '\t'));
              PX_Toast('CSVコピー完了');
              break;
            case 'markdown':
              clipper(NMEX_Utils.tableToMarkdown(table));
              PX_Toast('Markdownコピー完了');
              break;
          }
        }
      );
    });
  }
}
