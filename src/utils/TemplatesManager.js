class TemplatesManager {
  constructor(initDefauts = true) {
    this._templates = [];
    this._subscribers = [];
   if(initDefauts) this._initDefaultTemplates();
  }

  // Основные методы API
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber must be a function');
    }
    
    const subscription = {
      id: Symbol('subscriber'),
      callback
    };
    
    this._subscribers.push(subscription);
    return () => this._unsubscribe(subscription.id);
  }

  addTemplate(name = null) {
    const newName = name || `template ${this._templates.length + 1}`;
    this._validateTemplate(newName);
    
    this._templates = [...this._templates, newName];
    this._notify();
    return this._templates.length - 1;
  }

  removeTemplate(index) {
    this._validateIndex(index);
    this._templates = this._templates.filter((_, i) => i !== index);
    this._notify();
    return this._templates;
  }

  updateTemplate(index, newValue) {
    this._validateIndex(index);
    
    if (this._templates[index] !== newValue) {
      this._validateTemplate(newValue);
      this._templates = this._templates.map((t, i) => 
        i === index ? newValue : t
      );
      this._notify();
    }
    
    return this._templates;
  }

  resetToDefault() {
    this._initDefaultTemplates();
    this._notify();
  }

  get templates() {
    return [...this._templates];
  }

  getTemplate(index) {
    this._validateIndex(index);
    return this._templates[index];
  }

  // Приватные методы
  _notify() {
    console.log('[TemplatesManager] Notifying subscribers:', this._subscribers.length);
  this._validateTemplates();
  this._subscribers.forEach(({ callback }) => {
    try {
      callback(this.templates);
    } catch (error) {
      console.error('[TemplatesManager] Subscriber error:', error);
    }
  });
  }

  _unsubscribe(id) {
    this._subscribers = this._subscribers.filter(sub => sub.id !== id);
  }

  _initDefaultTemplates() {
    this._templates = ['template 1', 'template 2'];
    this._validateTemplates();
  }

  _validateIndex(index) {
    if (!Number.isInteger(index) || index < 0 || index >= this._templates.length) {
      throw new Error(`Invalid template index: ${index}`);
    }
  }

  _validateTemplate(value) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error('Template must be a non-empty string');
    }
    
    if (this._templates.includes(value)) {
      throw new Error(`Template "${value}" already exists`);
    }
  }

  _validateTemplates() {
    if (!Array.isArray(this._templates)) {
      throw new Error('Templates must be stored as an array');
    }
    
    const unique = new Set(this._templates);
    if (unique.size !== this._templates.length) {
      throw new Error('Template names must be unique');
    }
  }
}

export const templatesManager = new TemplatesManager();