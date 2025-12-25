var ret = {};
$('select[name=tenpo_cd]')
  .find('option')
  .each(function() {
    ret[$(this).val()] = true;
  });
console.log(JSON.stringify(ret));
