/**
 * フォーム要素間の値同期（旧 netztracer）
 * sourceの変更をtargetに即座に反映させます
 * * @param {HTMLElement|jQuery|string} source - 変更元の要素
 * @param {HTMLElement|jQuery|string} target - 変更先の要素（セレクタ可）
 * @param {boolean} [isAppendMode=false] - テキストの場合に追記モードにするか
 */
export function bindSync(source, target, isAppendMode = false) {
  const $source = $(source);

  $source.on('change', () => {
    const sourceType = $source.attr('type');
    const sourceVal = $source.val();
    const sourceText = $source.text();
    const sourceChecked = $source.prop('checked');

    $(target).each((i, el) => {
      const $target = $(el);
      let isChanged = false;

      switch (sourceType) {
        case 'checkbox':
          isChanged = sourceChecked !== $target.prop('checked');
          if (isChanged) $target.prop('checked', sourceChecked);
          break;

        case 'radio':
          // ラジオボタンの場合、同じ値を持つものだけをチェックする等のロジックが必要か要確認
          // 元コードの挙動：sourceの値とtargetの値が一致したらチェックを入れる
          isChanged = sourceVal === $target.val();
          $target.prop('checked', isChanged);
          break;

        case 'containtext': // 独自タイプまたは特定のdivなどを想定
          isChanged = sourceText !== $target.text();
          if (isChanged) $target.text(sourceText);
          break;

        default:
          // text, number, select, textarea 等
          const targetVal = $target.val();
          isChanged = sourceVal !== targetVal;
          if (isChanged) {
            const newVal = isAppendMode ? `${targetVal}${sourceVal}` : sourceVal;
            $target.val(newVal);
          }
          break;
      }

      // 値が変わった場合のみイベントを発火（無限ループ防止のためチェック推奨）
      if (isChanged) {
        $target
          .trigger('change')
          // Nativeイベントも発火（ReactやVueなどが混在している場合に有効）
          .get(0)
          .dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  return $source;
}
