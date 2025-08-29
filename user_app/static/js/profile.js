$(function(){
  const $ = window.$;
  const created = document.querySelector('.created-tests');
  const completed = document.querySelector('.completed-tests');
  const userBlock = document.querySelector('.user-block');
  const leftArrow = document.querySelector('.arrow-block img[src*="arrow_left"]');
  const rightArrow = document.querySelector('.arrow-block img[src*="arrow_right"]');
  const radios = document.querySelectorAll('input[name="btn"]');
  const testsPerPage = document.querySelector("#is_author").value;
  let currentPage = 0, currentEditing = null;
  if (testsPerPage==4){
    document.querySelector(".tests-block").className = "tests-block-user"
    completed.className = "completed-tests-user"
    created.className = "created-tests-user"
    userBlock.className = "user-block-user"
  }
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const getCsrf = ()=> (qs('meta[name="csrf-token"]')||{}).content||null;

  const pageNumberEl = (function(){
    const existing = qs('.arrow-block .page-number');
    if(existing) return existing;
    const block = qs('.arrow-block');
    if(!block) return null;
    const span = document.createElement('span');
    span.className = 'page-number';
    span.textContent = '1';
    const imgs = block.querySelectorAll('img');
    if(imgs.length >= 2){
      block.insertBefore(span, imgs[1]);
    } else {
      block.appendChild(span);
    }
    return span;
  })();

  const rightPrint = txt=>{
    const cont = qs('.messages#messages'); if(!cont) return;
    const m = document.createElement('div');
    m.className='message'; m.id='message'; m.textContent=txt;
    if(txt.toLowerCase().includes('збереж')) {
      Object.assign(m.style,{background:'#d4edda',color:'#155724',border:'1px solid #c3e6cb'});
    } else {
      Object.assign(m.style,{background:'#f8d7da',color:'#721c24',border:'1px solid #f5c6cb'});
    }
    cont.appendChild(m);
    setTimeout(()=>m.classList.add('show'),100);
    setTimeout(()=>{ m.classList.add('hide'); setTimeout(()=>m.remove(),500); },5000);
  };

  const showPage = (container,page)=>{
    if(!container) return;
    const tests = Array.from(container.querySelectorAll('.test'));
    tests.forEach(t=>t.classList.remove('visible'));
    const start = page*testsPerPage, end = start+testsPerPage;
    tests.slice(start,end).forEach(t=>t.classList.add('visible'));
    if(leftArrow) leftArrow.style.opacity = page>0 ? '1' : '0.3';
    if(rightArrow) rightArrow.style.opacity = end < tests.length ? '1' : '0.3';
    if(pageNumberEl) {
      pageNumberEl.textContent = String(page + 1);
    }
  };
  const activeContainer = ()=>{
    const checked = document.querySelector('input[name="btn"]:checked');
    return (!checked || checked.value==='option1') ? created : completed;
  };
  const updateView = ()=>{
    const checked = document.querySelector('input[name="btn"]:checked');
    const isCreated = !checked || checked.value==='option1';
    if(created) created.style.display = isCreated ? 'flex':'none';
    if(completed) completed.style.display = !isCreated ? 'flex':'none';
    currentPage = 0;
    showPage(activeContainer(), currentPage);
    initEditingFeatures();
  };

  radios.forEach(r=>r.addEventListener('change', updateView));
  if(leftArrow) leftArrow.addEventListener('click', ()=>{ if(currentPage>0){ currentPage--; showPage(activeContainer(),currentPage);} });
  if(rightArrow) rightArrow.addEventListener('click', ()=>{
    const c = activeContainer();
    const total = c ? c.querySelectorAll('.test').length : 0;
    if((currentPage+1)*testsPerPage < total){ currentPage++; showPage(c,currentPage); }
  });

  const toggleBtn = qs('.toggle-password');
  if(toggleBtn){
    const pw = qs('#user-password');
    const icon = toggleBtn.querySelector('img');
    toggleBtn.addEventListener('click', ()=>{
      if(!pw) return;
      if(pw.type==='password'){ pw.type='text'; if(icon) icon.src = (icon.src||'').replace('hide_close','hide_open')||'/user/images/hide_open.svg'; }
      else { pw.type='password'; if(icon) icon.src = (icon.src||'').replace('hide_open','hide_close')||'/user/images/hide_close.svg'; }
    });
  }

  const createEditModal = ()=>{
    if(qs('#editTestModal')) return;
    const html = `
      <div id="editTestModal" class="edit-modal" style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;">
        <div class="edit-modal-backdrop" style="position:absolute;inset:0;background:rgba(0,0,0,0.4)"></div>
        <div class="edit-modal-window" role="dialog" aria-modal="true" style="position:relative;max-width:520px;width:90%;background:#fff;padding:18px;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.2);">
          <h3 style="margin-top:0;">Редагувати тест</h3>
          <form id="editTestForm">
            <div style="margin-bottom:10px;"><label for="editTestTitle">Назва</label><br><input id="editTestTitle" name="title" type="text" style="width:100%;padding:8px;" required /></div>
            <div style="margin-bottom:10px;"><label for="editTestDesc">Опис (опціонально)</label><br><textarea id="editTestDesc" name="description" style="width:100%;padding:8px;" rows="4"></textarea></div>
            <div style="display:flex;gap:8px;justify-content:flex-end;"><button type="button" id="cancelEditBtn">Відміна</button><button type="submit" id="saveEditBtn">Зберегти</button></div>
          </form>
        </div>
      </div>`;
    document.body.insertAdjacentHTML('beforeend',html);
    const modal = qs('#editTestModal');
    const close = ()=>{ modal.style.display='none'; currentEditing=null; };
    modal.querySelector('.edit-modal-backdrop').addEventListener('click', close);
    modal.querySelector('#cancelEditBtn').addEventListener('click', close);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape' && modal.style.display==='flex') close(); });
    modal.querySelector('#editTestForm').addEventListener('submit', e=>{ e.preventDefault(); saveEditFromModal(); });
  };

  const openEditModal = (test)=>{
    createEditModal();
    currentEditing = test;
    const modal = qs('#editTestModal');
    const title = modal.querySelector('#editTestTitle');
    const desc = modal.querySelector('#editTestDesc');
    const titleNode = test.querySelector('.test-title') || test.querySelector('.name');
    title.value = test.dataset.title || (titleNode && titleNode.innerText) || '';
    desc.value = test.dataset.description || '';
    modal.style.display='flex';
    setTimeout(()=>title.focus(),50);
  };

  const saveTestToServer = (id,title,description)=>{
    const csrf = getCsrf();
    $.ajax({
      url:'/profile/api/update_test',
      method:'POST',
      data: JSON.stringify({id,title,description}),
      contentType:'application/json',
      headers: csrf ? {'X-CSRFToken':csrf} : {},
      success: data => { if(data && data.success) rightPrint('Тест збережено'); else rightPrint('Помилка: '+((data&&data.error)?data.error:'Помилка збереження на сервері')); },
      error: xhr => rightPrint('Помилка мережі — не збережено ('+xhr.status+')')
    });
  };

  const saveSettingToServer = (field,value)=>{
    const csrf = getCsrf();
    $.ajax({
      url: '/profile/api/update_setting',
      method: 'POST',
      data: JSON.stringify({field,value}),
      contentType: 'application/json',
      headers: csrf ? {'X-CSRFToken':csrf} : {},
      success: d => { if(d && d.success) rightPrint('Збережено'); else rightPrint('Помилка: '+((d&&d.error)?d.error:'помилка')); },
      error: xhr => {
        if(xhr.status===405||xhr.status===415){
          const fd = new FormData(); fd.append(field,value);
          $.ajax({
            url: '/update_user',
            method: 'POST',
            data: fd,
            processData: false,
            contentType: false,
            success: d2 => { if(d2 && d2.success) rightPrint('Збережено'); else rightPrint('Помилка: '+((d2&&d2.error)?d2.error:'помилка')); },
            error: ()=> rightPrint('Помилка мережі — не збережено')
          });
          return;
        }
        rightPrint('Помилка мережі — не збережено ('+xhr.status+')');
      }
    });
  };

  const saveEditFromModal = ()=>{
    if(!currentEditing) return;
    const modal = qs('#editTestModal');
    const title = modal.querySelector('#editTestTitle').value.trim();
    const desc = modal.querySelector('#editTestDesc').value.trim();
    const titleNode = currentEditing.querySelector('.test-title') || currentEditing.querySelector('.name');
    if(titleNode) titleNode.innerText = title;
    currentEditing.dataset.title = title;
    currentEditing.dataset.description = desc;
    const id = currentEditing.dataset.id;
    if(id) saveTestToServer(id,title,desc);
    modal.style.display='none';
    currentEditing = null;
  };

  const ensureEditButtons = container=>{
    if(!container) return;
    Array.from(container.querySelectorAll('.test')).forEach(test=>{
      if(test.querySelector('.edit-name')) return;
      const btn = document.createElement('button');
      btn.type='button'; btn.className='edit-name'; btn.innerHTML='<img src="/user/images/edit.svg">';
      btn.addEventListener('click', ()=>openEditModal(test));
      const actions = test.querySelector('.name-block') || test;
      actions.appendChild(btn);
    });
  };

  const initEditingFeatures = ()=>{
    [created,completed].forEach(c=>ensureEditButtons(c));
  };

  const userDesc = qs('.add-description');
  if(userDesc){
    let t=null;
    userDesc.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=>saveSettingToServer('description',userDesc.value),600); });
    userDesc.addEventListener('blur', ()=>saveSettingToServer('description',userDesc.value));
  }

  const enableInlineSettings = ()=>{
    qsa('.settings-block').forEach(block=>{
      if(block._inited) return; block._inited=true;
      const textEl = block.querySelector('.text');
      const imgBtn = block.querySelector('.img_button');
      if(!textEl||!imgBtn) return;
      imgBtn.addEventListener('click', ()=>{
        const field = imgBtn.dataset.field || textEl.dataset.field || null;
        if(field==='password'){
          const pw = block.querySelector('#user-password'); if(!pw) return;
          pw.removeAttribute('readonly'); pw.focus();
          const savePw = ()=>{ pw.setAttribute('readonly',''); saveSettingToServer('password',pw.value); };
          pw.addEventListener('blur', savePw, {once:true});
          pw.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); pw.blur(); } });
          return;
        }
        const cur = textEl.innerText.trim();
        const input = document.createElement('input'); input.type='text'; input.value = cur; input.style.width='100%';
        const parent = textEl.parentNode;
        try{ parent && parent.contains(textEl) ? parent.replaceChild(input,textEl) : block.appendChild(input); } catch(e){ block.appendChild(input); }
        input.focus();
        const save = ()=>{
          const val = input.value.trim();
          const p = document.createElement('p'); p.className='text'; if(field) p.dataset.field = field; p.innerText = val;
          try{ input.parentNode.replaceChild(p,input); } catch(e){ block.appendChild(p); }
          if(field) saveSettingToServer(field,val);
        };
        input.addEventListener('blur', ()=>save(), {once:true});
        input.addEventListener('keydown', e=>{
          if(e.key==='Enter'){ e.preventDefault(); input.blur(); }
          if(e.key==='Escape'){ try{ const p2=document.createElement('p'); p2.className='text'; p2.innerText=cur; input.parentNode.replaceChild(p2,input); }catch(e){} }
        });
      });
    });
  };

  initEditingFeatures();
  enableInlineSettings();
  updateView();
});
