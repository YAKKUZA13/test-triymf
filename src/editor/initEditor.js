import { TemplateSelect } from '../components/TemplateSelect.js';
import { templatesManager } from '../utils/TemplatesManager.js';
import 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/icons/default';
import 'tinymce/models/dom/model';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';

// Регистрация веб-компонента
if (!customElements.get('template-select')) {
    customElements.define('template-select', TemplateSelect);
  }

export function initEditor() {
  if (tinymce.get('editor')) {
    tinymce.remove('#editor');
  }
  
  const editorElement = document.getElementById('editor');
  editorElement.setAttribute('data-original-tabindex', editorElement.tabIndex);
  editorElement.tabIndex = -1;

  tinymce.init({
    selector: '#editor',
    plugins: 'lists link',
    toolbar: 'undo redo | bold italic | insertTemplate',
    menubar: false,
    statusbar: false,
    skin: 'oxide',
    skin_url: './skins/ui/oxide',
    content_css: './skins/content/default/content.css',
    content_style: ``,
    height: '100%',
    width: '100%',
    branding: false,
    extended_valid_elements: 'template-select[data-valid|aria-label]',
    valid_elements: '*[*]',
    custom_elements: 'template-select, ~template-select',
    
    setup: (editor) => {
      // Инициализация ARIA
      editor.on('init', () => {
        editorElement.style.display = 'none';
        editorElement.setAttribute('aria-hidden', 'false');
        const iframe = editor.iframeElement;
        iframe.setAttribute('role', 'textbox');
        iframe.setAttribute('aria-multiline', 'true');
        iframe.setAttribute('aria-label', 'Rich Text Editor');
      });
    
      // Обработчик вставки шаблона
     editor.ui.registry.addButton('insertTemplate', {
        icon: 'plus',
        text: 'Insert Template',
        onAction: () => {
          try {
            console.log('Кнопка нажата!');
            
            // Проверка наличия шаблонов
            if (!templatesManager.templates?.length) {
              editor.notificationManager.open({
                text: 'Create templates first!',
                type: 'error',
                timeout: 2000
              });
              return;
            }

            // Вставка элемента с обработкой ошибок
          const templateNode = document.createElement('template-select');
          editor.dom.add(editor.getBody(), templateNode); // Вставка через DOM API
            // Обновление свойств компонента
            setTimeout(() => {
              const components = editor.dom.select('template-select');
              if (components.length > 0) {
                const newComponent = components[components.length - 1];
                newComponent.templates = [...templatesManager.templates];
                newComponent.selectedValue = templatesManager.templates[0];
              }
            }, 50);
          } catch (error) {
            console.error('Ошибка при вставке шаблона:', error);
          }
        }
      });

      // Обновление компонентов при изменениях
      editor.on('NodeChange', () => {
        editor.dom.select('template-select').forEach(component => {
          if (!component.templates || component.templates.length !== templatesManager.templates.length) {
            component.templates = [...templatesManager.templates];
          }
        });
      });
      console.log("КНОПКИ",editor.ui.registry.getAll().buttons)
      // Обработчик фокуса
      editor.on('focus', () => {
        const activeSelect = editor.dom.select('template-select[focus]');
        activeSelect.length > 0 
          ? activeSelect[0].shadowRoot.querySelector('select').focus()
          : editor.focus();
      });
    }
  });

  // Принудительный фокус после инициализации
  setTimeout(() => {
    const editorInstance = tinymce.get('editor');
    if (editorInstance) {
      editorInstance.focus();
      editorInstance.setContent('<p>Start typing here...</p>');
    }
  }, 1000);
}