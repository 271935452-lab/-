(() => {
  const file = '回款核销-本次更新记录.html';
  const addItem = () => {
    document.querySelectorAll('.repay-menu-list').forEach(list => {
      const isPrd = list.previousElementSibling?.querySelector('span')?.textContent.trim() === 'PRD';
      if (!isPrd || list.querySelector('[data-update-record]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'repay-menu-item';
      button.dataset.updateRecord = '1';
      button.innerHTML = '<i>↻</i><span>本次更新记录</span>';
      button.addEventListener('click', () => { location.href = file; });
      list.appendChild(button);
    });
  };
  new MutationObserver(addItem).observe(document.body, { childList: true, subtree: true });
  addItem();
})();
