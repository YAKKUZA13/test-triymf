import { templatesManager } from '../utils/TemplatesManager.js';

export class TemplatesPanel {
  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'templates-panel-container';
    this.selectedIndex = -1;
    this.render();
    this.setupEventListeners();
    this.renderList();
    
    templatesManager.subscribe(() => {
      this.renderList();
      this.updateEditField();
      this.toggleDeleteButton();
    });
  }

  render() {
    this.element.innerHTML = `
      <style>
        .templates-panel {
          padding: 15px;
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .templates-list {
          list-style: none;
          padding: 0;
          margin: 15px 0;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .template-item {
          padding: 8px 12px;
          margin: 4px 0;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .template-item:hover {
          background: #e9ecef;
        }
        
        .template-item.selected {
          background: #007bff;
          color: white;
        }
        
        .controls {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
        }
        
        .controls button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        
        .controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        #editInput {
          width: 100%;
          padding: 8px;
          border: 1px solid #ced4da;
          border-radius: 4px;
          margin-top: 10px;
        }
      </style>
      
      <div class="templates-panel">
        <h3>Templates</h3>
        <div class="controls">
          <button id="addTemplate" class="btn-add">+ Add New</button>
          <button id="removeTemplate" class="btn-remove" disabled>- Delete</button>
        </div>
        <ul class="templates-list" id="templatesList"></ul>
        <input 
          id="editInput" 
          placeholder="Edit selected template"
          disabled
        >
      </div>
    `;
  }

  setupEventListeners() {
    this.element.querySelector('#addTemplate').addEventListener('click', () => {
      templatesManager.addTemplate();
      this.selectedIndex = templatesManager.templates.length - 1;
    });

    this.element.querySelector('#removeTemplate').addEventListener('click', () => {
      if (this.selectedIndex >= 0 && confirm('Delete this template?')) {
        templatesManager.removeTemplate(this.selectedIndex);
        this.selectedIndex = -1;
      }
    });

    const editInput = this.element.querySelector('#editInput');
    editInput.addEventListener('input', () => this.validateInput(editInput));
    editInput.addEventListener('blur', () => this.updateTemplate());
    editInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.updateTemplate();
    });
  }

  renderList() {
    const list = this.element.querySelector('#templatesList');
    list.innerHTML = templatesManager.templates.length === 0 
      ? '<div class="empty-state">No templates yet</div>' 
      : '';
    
    templatesManager.templates.forEach((template, index) => {
      const li = document.createElement('li');
      li.className = `template-item ${this.selectedIndex === index ? 'selected' : ''}`;
      li.textContent = template;
      
      li.addEventListener('click', () => {
        this.selectedIndex = index;
        this.renderList();
        this.updateEditField();
        this.toggleDeleteButton();
      });
      
      list.appendChild(li);
    });
  }

  updateEditField() {
    const editInput = this.element.querySelector('#editInput');
    const isValidSelection = this.selectedIndex >= 0 && 
      this.selectedIndex < templatesManager.templates.length;
    
    editInput.disabled = !isValidSelection;
    
    if (isValidSelection) {
      editInput.value = templatesManager.templates[this.selectedIndex];
    } else {
      editInput.value = '';
    }
  }

  validateInput(input) {
    const value = input.value.trim();
    const isDuplicate = templatesManager.templates.includes(value);
    
    if (value === '') {
      input.setCustomValidity('Template name cannot be empty');
    } else if (isDuplicate) {
      input.setCustomValidity('Template name already exists');
    } else {
      input.setCustomValidity('');
    }
  }

  updateTemplate() {
    const editInput = this.element.querySelector('#editInput');
    const newValue = editInput.value.trim();
    
    if (this.selectedIndex >= 0 && newValue && 
      !templatesManager.templates.includes(newValue)) {
      templatesManager.updateTemplate(this.selectedIndex, newValue);
    } else {
      editInput.value = templatesManager.templates[this.selectedIndex] || '';
    }
  }

  toggleDeleteButton() {
    const deleteBtn = this.element.querySelector('#removeTemplate');
    deleteBtn.disabled = this.selectedIndex === -1 || 
      templatesManager.templates.length === 0;
  }
}