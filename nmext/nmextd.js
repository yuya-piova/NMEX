$(function() {
  if (document.domain != 'lms2.s-diverse.com') return;
  console.log('nmextd is running!');
  window.addEventListener('message', function(event) {
    // 送信元を確認
    if (event.origin === 'https://menu.edu-netz.com' || event.origin === 'https://menu2.edu-netz.com') {
      popmenu.appendItems([
        {
          text: 'ブース表から出欠登録',
          handler: () => {
            event.data.forEach(student => {
              $(`tr:contains("${student.replace('　', ' ')}")`)
                .find('.chakra-checkbox')
                .trigger('click');
            });
          }
        }
      ]);
    }
  });
});
