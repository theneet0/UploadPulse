import { Bridge } from './bridge';
import './index.css';
import { AppUI } from './ui';

async function bootstrap() {
  const root = document.getElementById('app');
  if (!root) {
    console.error('Root element #app not found.');
    return;
  }

  const initialSettings = await Bridge.getSettings();
  const appUI = new AppUI(root, initialSettings);
  await appUI.init();
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
