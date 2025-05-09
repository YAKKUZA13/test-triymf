import './styles/main.css';
import { TemplateSelect } from './components/TemplateSelect';  
import { initEditor } from './editor/initEditor';
import { TemplatesPanel } from './components/TemplatesPanel';
import '@webcomponents/webcomponentsjs/webcomponents-bundle.js';

document.addEventListener('DOMContentLoaded',  () => {
    const editorContainer = document.getElementById('editor-container');
  if (editorContainer) {
    editorContainer.style.display = 'block';
  }
  if (!customElements.get('template-select')) {
  customElements.define('template-select', TemplateSelect);
}

    initEditor();
  
  const panelContainer = document.querySelector('.templates-panel');
  const templatesPanel = new TemplatesPanel();
  panelContainer.appendChild(templatesPanel.element);
});