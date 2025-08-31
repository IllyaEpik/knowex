function showSimpleModal(title, content) {
  // Удалить предыдущую модалку, если есть
  const oldBg = document.getElementById('simple-modal-bg');
  if (oldBg) oldBg.remove();

  // Создать элементы
  const bg = document.createElement('div');
  bg.id = 'simple-modal-bg';
  bg.style = 'display:flex; position:fixed; z-index:1000; left:0; top:0; width:100vw; height:100vh; background:rgba(0,0,0,0.5); align-items:center; justify-content:center;';

  const win = document.createElement('div');
  win.id = 'simple-modal-window';
  win.style = 'background:#fff; padding:30px; border-radius:10px; min-width:300px; max-width:90vw; position:relative; box-shadow:0 8px 30px rgba(0,0,0,0.2);';

  const closeBtn = document.createElement('span');
  closeBtn.id = 'simple-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.style = 'position:absolute; right:10px; top:10px; cursor:pointer; font-size:24px;';

  const h3 = document.createElement('h3');
  h3.textContent = title;

  const cont = document.createElement('div');
  cont.innerHTML = content;

  
  // Сборка
  win.appendChild(closeBtn);
  win.appendChild(h3);
  win.appendChild(cont);
  bg.appendChild(win);
  document.body.appendChild(bg);

  // Закрытие
  closeBtn.onclick = () => bg.remove();
  bg.onclick = e => { if (e.target === bg) bg.remove(); };
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { bg.remove(); document.removeEventListener('keydown', esc); }
  });
}