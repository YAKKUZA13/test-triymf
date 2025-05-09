import { templatesManager } from '../utils/TemplatesManager.js';

export class TemplateSelect extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._selectedValue = '';
    this._templates = [];
    this._isMounted = false;
    this._handleChange = this._handleChange.bind(this); // Привязка контекста для обработчика
     this._handleMouseDown = this._handleMouseDown.bind(this);
    this._unsubscribe = templatesManager.subscribe(templates => {
      this.templates = templates;
      this._handleTemplatesUpdate();
    });
  }

connectedCallback() {
  this._isMounted = true;
  
  const uniqueTemplates = [...new Set(templatesManager.templates)];
  this.templates = uniqueTemplates;

  this._selectedValue = uniqueTemplates.length > 0 
    ? uniqueTemplates[0] 
    : '';

  if (uniqueTemplates.length === 0) {
    console.warn('No templates available');
  }

  this._render();
}

  disconnectedCallback() {
    this._unsubscribe();
    this._isMounted = false;
    // Удаляем все обработчики при демонтировании
    const select = this.shadowRoot.querySelector('select');
    if (select) {
      select.removeEventListener('change', this._handleChange);
    }
  }

  set templates(value) {
    if (JSON.stringify(this._templates) === JSON.stringify(value)) return; // Оптимизация: избегаем лишних обновлений
    this._templates = [...value];
    if (this._isMounted) {
      this._render();
      this._validateSelection();
    }
  }

  get value() {
    return this._isValid ? this._selectedValue : null;
  }

  get _isValid() {
    return this._templates.includes(this._selectedValue);
  }

  _handleTemplatesUpdate() {
    if (!this._isValid && this._templates.length > 0) {
      this._selectedValue = this._templates[0];
      this.dispatchEvent(new CustomEvent('change', { // Уведомляем об изменении значения
        detail: { value: this.value, isValid: true },
        bubbles: true,
        composed: true
      }));
    }
    this._render();
  }

  _validateSelection() {
    if (!this._isValid) {
      this._selectedValue = '';
      this.dispatchEvent(new Event('invalid', { bubbles: true }));
    }
  }

  _render() {
    this.shadowRoot.innerHTML = this._isValid 
      ? this._renderSelect() 
      : this._renderError();
    this._setupSelectBehavior();
  }

  _renderSelect() {
    if (this._templates.length === 0) {
      return `
        <select class="custom-select" disabled>
          <option>No templates available</option>
        </select>
      `;
    }
    return `
      <style>
      :host {
        display: inline-block;
        position: relative;
        min-width: 200px;
        margin: 4px;
        font-family: Arial, sans-serif;
        z-index: 10000; /* Важно для TinyMCE */
      }

      .custom-select {
        width: 100%;
        padding: 8px 32px 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 4px;
        background: #fff url("data:image/svg+xml,%3csvg...") no-repeat right 8px center/12px;
        appearance: none;
        -webkit-appearance: none;
        cursor: pointer;
        font-size: 14px;
        color: #333;
      }

      .custom-select:focus {
        outline: none;
        border-color: #80bdff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
    </style>
      <select class="custom-select">
        ${this._templates.map(t => `
          <option value="${t}" ${t === this._selectedValue ? 'selected' : ''}>
            ${t}
          </option>
        `).join('')}
      </select>
    `;
  }

 _setupSelectBehavior() {
  const select = this.shadowRoot.querySelector('select');
  if (!select) return;

  // Удаляем старые обработчики
  select.removeEventListener('change', this._handleChange);
  select.removeEventListener('mousedown', this._handleMouseDown);

  // Добавляем новые
  select.addEventListener('change', this._handleChange);
  select.addEventListener('mousedown', this._handleMouseDown); // Новый обработчик
  select.value = this._selectedValue;
}

// Новый метод для обработки mousedown
_handleMouseDown(e) {
  e.stopPropagation(); // Блокируем всплытие события
}

  _handleChange(e) {
    this._selectedValue = e.target.value;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { 
        value: this.value,
        isValid: this._isValid 
      },
      bubbles: true,
      composed: true
    }));
  }

  // _renderError() остаётся без изменений
  _renderError() {
    return `
      <style>
        .error {
          padding: 6px 12px;
          background: #fff5f5;
          border: 1px solid #ffcccc;
          color: #dc3545;
          border-radius: 4px;
          font-size: 14px;
        }
      </style>
      <div class="error" part="error">Invalid Template</div>
    `;
  }

  
}

customElements.define('template-select', TemplateSelect);

  

