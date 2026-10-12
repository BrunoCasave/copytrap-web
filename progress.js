// A DOM dialog keeps file access inside real browser gestures, including Safari.
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'progress-transfer';
  dialog.setAttribute('aria-label', '進捗の書き出し・読み込み');
  dialog.innerHTML = `
    <style>
      #progress-transfer{width:min(360px,calc(100vw - 32px));max-height:calc(100dvh - 24px);overflow:auto;padding:22px;border:2px solid #426674;border-radius:20px;background:#192c39;color:#f4e7c3;font:24px system-ui;text-align:center}
      #progress-transfer::backdrop{background:#08141cd9}
      #progress-transfer header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:22px}
      #progress-transfer button{width:88px;height:72px;flex-shrink:0}
      #progress-transfer header button{width:48px;height:48px;font-size:28px;border:0;border-radius:12px}
      #progress-transfer .actions{display:flex;justify-content:center;gap:28px}
      #progress-transfer svg{width:38px;height:38px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;vertical-align:middle}
      #progress-transfer output{display:block;min-height:40px;margin:16px 0 8px;color:#80e0d7}
      #progress-transfer button:disabled{opacity:.4;cursor:default}
      #progress-transfer [hidden]{display:none}
    </style>
    <header><span id="transfer-count"></span><button id="transfer-close" aria-label="閉じる">×</button></header>
    <div class="actions">
      <button id="transfer-export" aria-label="進捗をファイルに保存"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3v24m-8-8 8 8 8-8M5 27v9h30v-9"/></svg></button>
      <button id="transfer-import" aria-label="進捗ファイルを読み込む"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 27V3m-8 8 8-8 8 8M5 27v9h30v-9"/></svg></button>
    </div>
    <input id="transfer-file" type="file" accept=".echo,text/plain" hidden>
    <output id="transfer-status" aria-live="polite"></output>
    <button id="transfer-confirm" aria-label="既存の記録を残して追加する" hidden>✓</button>`;
  document.body.appendChild(dialog);
  const get = id => dialog.querySelector('#transfer-' + id);
  let target = '', data = '', total = 0, generation = 0;
  const send = (method, value) => value === undefined
    ? window.echoUnity.SendMessage(target, method)
    : window.echoUnity.SendMessage(target, method, value);
  const status = (symbol, label) => {get('status').textContent = symbol;get('status').setAttribute('aria-label', label);};
  const reset = () => {get('confirm').hidden = true;get('confirm').disabled = false;status('', '');};
  const close = () => {generation++;dialog.close();send('CloseProgressTransfer');document.getElementById('unity-canvas').focus();};
  get('close').onclick = close;
  dialog.addEventListener('cancel', event => {event.preventDefault();close();});
  // Unity's global keyboard listener must not act on keys used inside the dialog.
  dialog.addEventListener('keydown', event => event.stopPropagation());
  get('export').onclick = () => {
    generation++;reset();
    const url = URL.createObjectURL(new Blob([data], {type:'text/plain;charset=utf-8'}));
    const link = document.createElement('a');link.href = url;
    link.download = 'copy-trap-' + new Date().toISOString().slice(0,10) + '.echo';
    document.body.appendChild(link);link.click();link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
    // Download completion is browser-owned; do not claim that the file was saved.
    status('↓', '保存先はブラウザで確認してください');
  };
  get('import').onclick = () => {generation++;reset();get('file').value = '';get('file').click();};
  get('file').onchange = async () => {
    const file = get('file').files[0], currentGeneration = generation;
    if(!file)return;
    if(file.size > 32768){status('×', 'このファイルは読み込めません');return;}
    try {
      const text = await file.text();
      if(dialog.open && currentGeneration === generation)send('PreviewProgressFile', text);
    } catch {if(dialog.open && currentGeneration === generation)status('×', 'ファイルを読み込めませんでした');}
  };
  get('confirm').onclick = () => {get('confirm').disabled = true;send('ConfirmProgressFile');};
  window.echoProgress = {
    open(receiver, payload, count, stageCount) {
      target = receiver;data = payload;total = stageCount;generation++;reset();
      get('count').textContent = '✓ ' + count + ' / ' + total;
      dialog.showModal();get('close').focus();
    },
    preview(valid, added, current) {
      if(!dialog.open)return;
      get('confirm').hidden = !valid;
      status(valid ? current + ' → ' + (current + added) + '（+' + added + '）' : '×',
        valid ? added + '面のクリア記録を追加します。既存の記録は残ります' : 'このファイルは読み込めません');
    },
    saved(payload, count) {
      data = payload;get('count').textContent = '✓ ' + count + ' / ' + total;
      get('confirm').hidden = true;status('✓', '進捗を追加しました');
    }
  };
})();
