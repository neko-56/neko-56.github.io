(() => {
  const copyButton = document.getElementById('copyAnswers');
  const printButton = document.getElementById('printPage');
  const status = document.getElementById('copyStatus');
  const fields = [...document.querySelectorAll('textarea[data-label]')];

  function buildText() {
    const answered = fields.filter((field) => field.value.trim());
    const lines = [
      'KEK 1992 WWW — 確認回答メモ',
      '',
    ];

    if (!answered.length) {
      lines.push('（まだ回答が入力されていません）');
      return lines.join('\n');
    }

    answered.forEach((field) => {
      lines.push(field.dataset.label);
      lines.push(field.value.trim());
      lines.push('');
    });
    lines.push('※未記入の質問は省略しています。');
    return lines.join('\n');
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', '');
    helper.style.position = 'fixed';
    helper.style.opacity = '0';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    helper.remove();
  }

  copyButton?.addEventListener('click', async () => {
    try {
      await copyText(buildText());
      status.textContent = '入力済みの回答をコピーしました。';
    } catch (err) {
      status.textContent = 'コピーできませんでした。印刷または手動コピーをご利用ください。';
      console.error(err);
    }
  });

  printButton?.addEventListener('click', () => window.print());
})();
