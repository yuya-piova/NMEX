export const NX_Utils = {
  /**
   * Formats a phone number based on predefined phone groups.
   * @returns {string|false} - The formatted phone number or false if the argument is not a string or the length is invalid.
   */
  phoneformat: str => {
    if (!typeof str === 'string') {
      console.error('NX_Utils', 'Argument must be String.', str);
      return false;
    }
    // データは http://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/number_shitei.html より入手後、整形
    const group = LCT.INQ.phonegroup;
    // 市外局番の桁数を取得して降順に並べ替える
    const code = Object.keys(group)
      .map(num => parseInt(num, 10))
      .sort((a, b) => b - a);
    // 入力文字から数字以外を削除してnumber変数に格納する
    const number = String(str)
      .replace(/[０-９]/g, function($s) {
        return String.fromCharCode($s.charCodeAt(0) - 65248);
      })
      .replace(/\D/g, '');
    // 電話番号が10～11桁じゃなかったらfalseを返して終了する
    if (number.length < 10 || number.length > 11) {
      return false;
    }
    // 市外局番がどのグループに属するか確認していく
    for (const leng of code) {
      const area = number.slice(0, leng);
      const city = group[leng][area];
      if (city) {
        const formattedNumber = `${area}-${number.substr(leng, city)}`;
        return number.substr(leng + city) ? `${formattedNumber}-${number.substr(leng + city)}` : formattedNumber;
      }
    }
  },
  /**
   * Converts a string to its Katakana representation.
   * @returns {string|false} - The Katakana string or false if the argument is not a string.
   */
  toKatakana: str => {
    if (!typeof str === 'string') {
      console.error('NX_Utils', 'Argument must be String.', str);
      return false;
    }
    return str.replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
  }
};

/**
 * フォーム要素間の値同期（旧 netztracer）
 * sourceの変更をtargetに即座に反映させます
 * * @param {HTMLElement|jQuery|string} source - 変更元の要素
 * @param {HTMLElement|jQuery|string} target - 変更先の要素（セレクタ可）
 * @param {boolean} [isAppendMode=false] - テキストの場合に追記モードにするか
 */
export default function bindSync(source, target, isAppendMode = false) {
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

/**
 * メールを送信する（非同期）
 * @param {Object} params
 * @param {string} params.to - 送信先メールアドレス
 * @param {string} params.subject - 件名
 * @param {string} params.body - 本文
 * @param {Object} [params.options] - bcc, from, name などのオプション
 * @returns {Promise<Object>} 送信結果のオブジェクト
 */
export async function sendMailAsync({ to, subject, body, options = {} }) {
  if (!to) {
    throw new Error('送信先メールアドレスが指定されていません。');
  }

  const postdata = {
    to,
    subject,
    body,
    options
  };

  const endpoint = typeof NX !== 'undefined' ? NX.ENDPOINT.sendMail : '';
  if (!endpoint) {
    throw new Error('メール送信先のエンドポイント(NX.ENDPOINT.sendMail)が未定義です。');
  }

  try {
    // $.post は Promise を返すので await で待機可能
    const data = await $.post(endpoint, postdata);

    // サーバーの返し方によっては文字列で返ってくることがあるため安全にパース
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Mail send error:', error);
    throw new Error('メールの送信に失敗しました。');
  }
}

/**
 * Zoomミーティングを作成する（非同期）
 */
export async function createZoomMeetingAsync({ topic, startdt, duration = 30 }) {
  const endpoint = typeof NX !== 'undefined' ? NX.ENDPOINT.zoomMaker : '';
  if (!endpoint) throw new Error('NX.ENDPOINT.zoomMaker が未定義です。');

  try {
    const data = await $.post(endpoint, { topic, startdt, duration });
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Zoom creation error:', error);
    throw new Error('Zoomミーティングの作成に失敗しました。');
  }
}
