(function(){
  const STORAGE_KEY = 'todo.tasks';

  const listEl = document.getElementById('task-list');
  const addForm = document.getElementById('add-form');
  const newTaskInput = document.getElementById('new-task');
  const newDueInput = document.getElementById('new-due');
  const searchInput = document.getElementById('search');

  let tasks = [];
  let currentSearch = '';
  let editingId = null;

  function escapeHtml(str){
    return str.replace(/[&<>"']/g, function(tag){
      const chars = {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"};
      return chars[tag] || tag;
    });
  }

  function todayString(){
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function isFutureDate(dateStr){
    if(!dateStr) return true;
    const today = todayString();
    return dateStr > today;
  }

  function saveTasks(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasksFromStorage(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      const parsed = JSON.parse(raw);
      if(!Array.isArray(parsed)) return null;
      return parsed;
    }catch(e){
      console.error('Błąd parsowania LocalStorage', e);
      return null;
    }
  }

  function parseInitialDOM(){
    const items = [];
    const lis = listEl.querySelectorAll('li');
    lis.forEach(li => {
      const id = li.getAttribute('data-id') || String(Date.now()) + Math.random();
      const textEl = li.querySelector('.text');
      const dueEl = li.querySelector('.due');
      const text = textEl ? textEl.textContent.trim() : '';
      const due = dueEl ? dueEl.textContent.trim() : '';
      items.push({id: String(id), text, due});
    });
    return items;
  }

  function render(){
    const q = currentSearch.trim().toLowerCase();
    listEl.innerHTML = '';
    const filtered = tasks.filter(t => {
      if(q.length < 2) return true;
      return t.text.toLowerCase().includes(q);
    });

    filtered.forEach(task => {
      const li = document.createElement('li');
      li.dataset.id = task.id;

      const textSpan = document.createElement('span');
      textSpan.className = 'text';
      if(q.length >= 2){
        const lower = task.text.toLowerCase();
        const idx = lower.indexOf(q);
        if(idx !== -1){
          const before = escapeHtml(task.text.slice(0, idx));
          const match = escapeHtml(task.text.slice(idx, idx+q.length));
          const after = escapeHtml(task.text.slice(idx+q.length));
          textSpan.innerHTML = before + '<mark>' + match + '</mark>' + after;
        }else{
          textSpan.textContent = task.text;
        }
      } else {
        textSpan.textContent = task.text;
      }

      const dueSpan = document.createElement('span');
      dueSpan.className = 'due';
      dueSpan.textContent = task.due || '';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete';
      delBtn.type = 'button';
      delBtn.setAttribute('aria-label','Usuń');
      delBtn.textContent = '🗑️';

      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      });

      li.addEventListener('click', (e) => {
        if(e.target === delBtn) return;
        startEdit(task.id, li);
      });

      li.appendChild(textSpan);
      li.appendChild(dueSpan);
      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  }

  function addTask(text, due){
    const id = String(Date.now()) + Math.random();
    const task = {id, text: text.trim(), due: due || ''};
    tasks.unshift(task);
    saveTasks();
    render();
  }

  function deleteTask(id){
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
  }

  function updateTask(id, newText, newDue){
    newText = newText.trim();
    const idx = tasks.findIndex(t => t.id === id);
    if(idx === -1) return;
    tasks[idx].text = newText;
    tasks[idx].due = newDue || '';
    saveTasks();
    render();
  }

  function startEdit(id, liElement){
    if(editingId) return;
    editingId = id;
    const task = tasks.find(t => t.id === id);
    if(!task) return;

    liElement.innerHTML = '';

    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.className = 'edit-text';
    inputText.value = task.text;
    inputText.maxLength = 255;

    const inputDue = document.createElement('input');
    inputDue.type = 'date';
    inputDue.className = 'edit-due';
    inputDue.value = task.due || '';

    liElement.appendChild(inputText);
    liElement.appendChild(inputDue);

    inputText.focus();

    function finish(save){
      document.removeEventListener('click', outside);
      inputText.removeEventListener('keydown', onKey);
      editingId = null;
      if(save){
        const newText = inputText.value.trim();
        const newDue = inputDue.value;
        if(newText.length < 3 || newText.length > 80){
          alert('Treść zadania musi mieć od 3 do 80 znaków');
          render();
          return;
        }
        if(newDue && !isFutureDate(newDue)){
          alert('Data musi być pusta lub w przyszłości');
          render();
          return;
        }
        updateTask(id, newText, newDue);
      }else{
        render();
      }
    }

    function outside(e){
      if(!liElement.contains(e.target)){
        finish(true);
      }
    }

    function onKey(e){
      if(e.key === 'Enter'){
        e.preventDefault();
        finish(true);
      } else if(e.key === 'Escape'){
        finish(false);
      }
    }

    document.addEventListener('click', outside);
    inputText.addEventListener('keydown', onKey);
    inputDue.addEventListener('keydown', onKey);
  }

  function init(){
    const stored = loadTasksFromStorage();
    if(stored && Array.isArray(stored) && stored.length){
      tasks = stored;
    } else {
      tasks = parseInitialDOM();
      saveTasks();
    }

    render();

    addForm.addEventListener('submit', function(e){
      e.preventDefault();
      const text = newTaskInput.value || '';
      const due = newDueInput.value || '';
      if(text.trim().length < 3 || text.trim().length > 255){
        alert('Treść zadania musi mieć od 3 do 255 znaków');
        return;
      }
      if(due && !isFutureDate(due)){
        alert('Data musi być pusta lub w przyszłości');
        return;
      }
      addTask(text, due);
      addForm.reset();
    });

    searchInput.addEventListener('input', function(e){
      currentSearch = e.target.value;
      render();
    });

  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
