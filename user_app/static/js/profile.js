$(function(){
	const $ = window.$;
	const created = document.querySelector('.created-tests');
	const completed = document.querySelector('.completed-tests');
	const userBlock = document.querySelector('.user-block');
	const leftArrow = document.querySelector('.arrow-block object[data*="arrow_left"], .arrow-block img[src*="arrow_left"]');
	const rightArrow = document.querySelector('.arrow-block object[data*="arrow_right"], .arrow-block img[src*="arrow_right"]');
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
		const imgs = block.querySelectorAll('object');
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
		if(pageNumberEl) pageNumberEl.textContent = String(page + 1);
	};
	const activeContainer = ()=> {
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
            <div class="edit-modal-window" role="dialog" aria-modal="true" style="position:relative;max-width:720px;width:95%;background:#fff;padding:18px;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.2);max-height:90vh;overflow:auto;">
            <h3 style="margin-top:0;">Редагувати тест</h3>
            <form id="editTestForm">
                <div style="margin-bottom:10px;"><label for="editTestTitle">Назва</label><br><input id="editTestTitle" name="title" type="text" style="width:100%;padding:8px;" required /></div>
                <div style="margin-bottom:10px;"><label for="editTestDesc">Опис (опціонально)</label><br><textarea id="editTestDesc" name="description" style="width:100%;padding:8px;" rows="3"></textarea></div>
                <hr>
                <div id="edit-questions" style="display:flex;flex-direction:column;gap:12px;"></div>
                <div style="margin-top:8px;display:flex;gap:8px;">
                    <button type="button" id="addQuestionBtn">Додати питання</button>
                </div>
                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
                    <button type="button" id="cancelEditBtn">Відміна</button>
                    <button type="submit" id="saveEditBtn">Зберегти</button>
                </div>
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
        modal.querySelector('#addQuestionBtn').addEventListener('click', ()=>{ addQuestionToModal({text:'', options:['',''], correct:0}); });
    };

	const renderQuestionNode = (q, idx)=>{
		const wrapper = document.createElement('div');
		wrapper.className = 'edit-question';
		wrapper.style = 'border:1px solid #ddd;padding:8px;border-radius:6px;';

		const header = document.createElement('div');
		header.style = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
		const h = document.createElement('div');
		h.innerHTML = `<strong>Питання ${idx+1}</strong>`;
		const del = document.createElement('button');
		del.type='button'; del.textContent='Видалити'; del.style='background:#f8d7da;border:1px solid #f5c6cb;padding:4px 8px;border-radius:4px;';
		del.addEventListener('click', ()=>{ wrapper.remove(); refreshQuestionHeaders(); });
		header.appendChild(h); header.appendChild(del);
		wrapper.appendChild(header);

		const ta = document.createElement('textarea');
		ta.className='edit-q-text'; ta.rows=2; ta.style.width='100%'; ta.value = q.text || '';
		wrapper.appendChild(ta);

		const optsBlock = document.createElement('div');
		optsBlock.style='margin-top:8px;display:flex;flex-direction:column;gap:6px;';
		const opts = q.options && q.options.length ? q.options.slice() : ['',''];

		const updateRadioNames = ()=>{
			const radios = optsBlock.querySelectorAll('input[type="radio"]');
			const name = 'correct-'+Date.now()+'-'+Math.random();
			radios.forEach(r=>r.name = name);
		};

		const addOpt = () => {
			const optRow = document.createElement('div'); optRow.style='display:flex;gap:8px;align-items:center;';
			const inp = document.createElement('input'); inp.type='text'; inp.value=''; inp.style='flex:1;padding:6px;';
			const mark = document.createElement('input'); mark.type='radio'; mark.name = 'correct-'+Math.random();
			const rm = document.createElement('button'); rm.type='button'; rm.textContent='x'; rm.style='padding:4px;';
			rm.addEventListener('click', ()=>{ optRow.remove(); updateRadioNames(); });
			optRow.appendChild(mark); optRow.appendChild(inp); optRow.appendChild(rm);
			optsBlock.appendChild(optRow);
			updateRadioNames();
			return {optRow, inp, mark};
		};
		const optionRows = [];
		opts.forEach((o,i)=>{
			const r = addOpt();
			r.inp.value = o || '';
			optionRows.push(r);
		});
		const addOptBtn = document.createElement('button');
		addOptBtn.type='button'; addOptBtn.textContent='Додати варіант'; addOptBtn.style='width:150px;margin-top:6px;';
		addOptBtn.addEventListener('click', ()=>{ const r=addOpt(); r.inp.focus(); });
		wrapper.appendChild(optsBlock);
		wrapper.appendChild(addOptBtn);

		setTimeout(()=>{
			const radios = optsBlock.querySelectorAll('input[type="radio"]');
			let correctIndex = (q.correct===null || q.correct===undefined) ? 0 : q.correct;
			if(typeof correctIndex === 'string' && correctIndex.match(/^\d+$/)) correctIndex = parseInt(correctIndex);
			if(radios[correctIndex]) radios[correctIndex].checked = true;
		}, 0);

		wrapper.getQuestionData = ()=>{
			const text = wrapper.querySelector('.edit-q-text').value.trim();
			const rows = Array.from(optsBlock.querySelectorAll('div')).filter(d=>d.querySelector('input[type="text"]'));
			const options = rows.map(r=> (r.querySelector('input[type="text"]').value||'').trim() ).filter(v => v !== '');
			const radios = Array.from(rows.map(r=> r.querySelector('input[type="radio"]') ));
			let correct = 0;
			radios.forEach((rd,i)=>{ if(rd && rd.checked) correct = i; });
			return { text, options, correct };
		};
		return wrapper;
	};

	const addQuestionToModal = (qdata)=>{
		const block = qs('#edit-questions');
		if(!block) return;
		const idx = block.querySelectorAll('.edit-question').length;
		const node = renderQuestionNode(qdata, idx);
		block.appendChild(node);
		refreshQuestionHeaders();
	};

	const refreshQuestionHeaders = ()=>{
		const qsNodes = qs('#edit-questions').querySelectorAll('.edit-question');
		qsNodes.forEach((n,i)=>{ const h = n.querySelector('strong'); if(h) h.textContent = 'Питання '+(i+1); });
	};

	const openEditModal = (test)=>{
		createEditModal();
		const modal = qs('#editTestModal');
		if(modal.style.display==='flex') return;
		currentEditing = test;
		const title = modal.querySelector('#editTestTitle');
		const desc = modal.querySelector('#editTestDesc');
		const id = test.dataset.id || test.dataset.testId || test.dataset.id;
		title.value = '';
		desc.value = '';
		const questionsBlock = modal.querySelector('#edit-questions');
		questionsBlock.innerHTML = '';
		const url = '/profile/api/get_test?id=' + encodeURIComponent(id);
		const csrf = getCsrf();
		if (test.isLoading) return;
		test.isLoading = true;
		$.ajax({
			url: url,
			method: 'GET',
			dataType: 'json',
			headers: csrf ? {'X-CSRFToken':csrf} : {},
			success: res => {
				test.isLoading = false;
				if(!res || !res.success || !res.test){
					rightPrint('Не вдалось завантажити тест');
					return;
				}
				const t = res.test;
				title.value = t.title || '';
				desc.value = t.description || '';
				(currentEditing.dataset||{});
				const qsArr = t.questions || [];
				if(!qsArr.length) addQuestionToModal({text:'', options:['',''], correct:0});
				qsArr.forEach(q=>{
					let opts = q.options || [];
					if(typeof opts === 'string'){
						try{ opts = JSON.parse(opts); }catch(e){ opts = opts.split(',').map(s=>s.trim()); }
					}
					addQuestionToModal({text: q.text || q.question || '', options: opts.length ? opts : ['',''], correct: q.correct===undefined ? 0 : q.correct});
				});
				modal.style.display='flex';
				setTimeout(()=>title.focus(),50);
			},
			error: ()=> {
				test.isLoading = false;
				rightPrint('Помилка мережі під час завантаження тесту');
			}
		});
	};

	const saveEditFromModal = ()=>{
		if(!currentEditing) return;
		const modal = qs('#editTestModal');
		const title = modal.querySelector('#editTestTitle').value.trim();
		const desc = modal.querySelector('#editTestDesc').value.trim();
		const qnodes = Array.from(modal.querySelectorAll('.edit-question'));
		const questions = qnodes.map(n=> n.getQuestionData() ).filter(q => q.text !== '').map(q=>{
			return { text: q.text, options: q.options, correct: q.correct };
		});
		const id = currentEditing.dataset.id || currentEditing.dataset.testId || currentEditing.dataset.id;
		const payload = { id: id, title: title, description: desc, questions: questions };
		const csrf = getCsrf();
		$.ajax({
			url: '/profile/api/update_test_full',
			method: 'POST',
			data: JSON.stringify(payload),
			contentType: 'application/json',
			headers: csrf ? {'X-CSRFToken':csrf} : {},
			success: data => {
				if(data && data.success){
					rightPrint('Тест збережено');
					const titleNode = currentEditing.querySelector('.test-title') || currentEditing.querySelector('.name');
					if(titleNode) titleNode.innerText = title;
					currentEditing.dataset.title = title;
					currentEditing.dataset.description = desc;
					location.reload();
				} else {
					rightPrint('Помилка: '+((data&&data.error)?data.error:'Не збережено'));
				}
				modal.style.display='none';
				currentEditing = null;
			},
			error: xhr => {
				rightPrint('Помилка мережі — не збережено ('+xhr.status+')');
			}
		});
	};

	const ensureEditButtons = container=>{
		if(!container) return;
		Array.from(container.querySelectorAll('.test')).forEach(test=>{
			if(test.querySelector('.edit-name')) return;
			if(!test.dataset.id){
				const a = test.querySelector('a[href*="/test/"]');
				if(a && a.href){
					const m = a.href.match(/\/test\/(\d+)/);
					if(m) test.dataset.id = m[1];
				}
			}
			const btn = document.createElement('button');
			btn.type='button'; btn.className='edit-name'; btn.innerHTML='<img src="/user/images/edit.svg">';
			btn.addEventListener('click', (ev)=>{
				ev.preventDefault();
				if(!test.dataset.id){
					rightPrint('ID теста не знайдено — неможливо відкрити редагування');
					return;
				}
				openEditModal(test);
			});
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
