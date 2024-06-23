const selectors = {
  listsContainer: '[data-lists]',
  newListForm: '[data-new-list-form]',
  newListInput: '[data-new-list-input]',
  deleteListButton: '[data-delete-list-button]',
  listDisplayContainer: '[data-list-display-container]',
  listTitleElement: '[data-list-title]',
  listCountElement: '[data-list-count]',
  tasksContainer: '[data-tasks]',
  taskTemplate: '#task-template',
  newTaskForm: '[data-new-task-form]',
  newTaskInput: '[data-new-task-input]',
  clearCompleteTasksButton: '[data-clear-complete-tasks-button]',
};

const getElements = (selectors) => {
  const elements = {};
  for (const key in selectors) {
    elements[key] = document.querySelector(selectors[key]);
  }
  return elements;
};

const elements = getElements(selectors);

const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListId';

let lists = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);

const saveAndRender = () => {
  localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(lists));
  localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
  render();
};

const createItem = (name) => ({ id: Date.now().toString(), name, tasks: [] });

const clearElement = (element) => {
  element.innerHTML = '';
};

const renderTaskCount = (list) => {
  const incompleteCount = list.tasks.filter(task => !task.complete).length;
  elements.listCountElement.textContent = `${incompleteCount} ${incompleteCount === 1 ? 'task' : 'tasks'} remaining`;
};

const renderTasks = (list) => {
  clearElement(elements.tasksContainer);
  list.tasks.forEach(task => {
    const taskElement = document.importNode(elements.taskTemplate.content, true);
    const checkbox = taskElement.querySelector('input');
    checkbox.id = task.id;
    checkbox.checked = task.complete;
    taskElement.querySelector('label').htmlFor = task.id;
    taskElement.querySelector('label').append(task.name);
    elements.tasksContainer.appendChild(taskElement);
  });
};

const renderLists = () => {
  clearElement(elements.listsContainer);
  lists.forEach(list => {
    const listElement = document.createElement('li');
    listElement.dataset.listId = list.id;
    listElement.classList.add('list-name', list.id === selectedListId && 'active-list');
    listElement.textContent = list.name;
    elements.listsContainer.appendChild(listElement);
  });
};

const render = () => {
  renderLists();
  const selectedList = lists.find(list => list.id === selectedListId);
  elements.listDisplayContainer.style.display = selectedListId == null ? 'none' : '';
  if (selectedListId) {
    elements.listTitleElement.textContent = selectedList.name;
    renderTaskCount(selectedList);
    renderTasks(selectedList);
  }
};

elements.listsContainer.addEventListener('click', ({ target }) => {
  if (target.tagName.toLowerCase() === 'li') {
    selectedListId = target.dataset.listId;
    saveAndRender();
  }
});

elements.tasksContainer.addEventListener('click', ({ target }) => {
  if (target.tagName.toLowerCase() === 'input') {
    const selectedList = lists.find(list => list.id === selectedListId);
    const selectedTask = selectedList.tasks.find(task => task.id === target.id);
    selectedTask.complete = target.checked;
    saveAndRender();
  }
});

elements.clearCompleteTasksButton.addEventListener('click', () => {
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
  saveAndRender();
});

elements.deleteListButton.addEventListener('click', () => {
  lists = lists.filter(list => list.id !== selectedListId);
  selectedListId = null;
  saveAndRender();
});

elements.newListForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const listName = elements.newListInput.value.trim();
  if (!listName) return;
  lists.push(createItem(listName));
  elements.newListInput.value = '';
  saveAndRender();
});

elements.newTaskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const taskName = elements.newTaskInput.value.trim();
  if (!taskName) return;
  const selectedList = lists.find(list => list.id === selectedListId);
  selectedList.tasks.push(createItem(taskName));
  elements.newTaskInput.value = '';
  saveAndRender();
});

render();
