import './style.css';
import { calculateMoneyPhysicalVolume } from './calculator';
import { ARMoneyScene } from './ar-scene';

  const container = document.getElementById('ui-container');
  let arScene: ARMoneyScene | null = null;
  
  if (container) {
    arScene = new ARMoneyScene(document.body);
  }

  const amountInput = document.getElementById('amount') as HTMLInputElement;
  const resultPanel = document.getElementById('result-panel') as HTMLDivElement;
  const presetBtns = document.querySelectorAll('.preset-btn');

  function formatNumber(num: number): string {
    return new Intl.NumberFormat('hu-HU').format(num);
  }

  function updateCalculation() {
    const val = parseFloat(amountInput.value);
    if (isNaN(val) || val <= 0) {
      resultPanel.classList.add('hidden');
      return;
    }

    const result = calculateMoneyPhysicalVolume(val);
    
    let text = `<strong>Összesen:</strong> ${formatNumber(result.totalBills)} db húszezres<br/>`;
    text += `<strong>Súly:</strong> ${formatNumber(result.totalWeightKg)} kg<br/>`;
    text += `<strong>Teljes raklapok száma:</strong> ${formatNumber(result.fullPallets)} db<br/>`;
    
    if (result.remainderBills > 0) {
      const w = (result.remainderDimensions.width * 100).toFixed(1);
      const l = (result.remainderDimensions.length * 100).toFixed(1);
      const h = (result.remainderDimensions.height * 100).toFixed(1);
      text += `<strong>Maradék kupac:</strong> ${w}cm x ${l}cm x ${h}cm (${formatNumber(result.remainderBills)} db bankjegy)`;
    }

    resultPanel.innerHTML = text;
    resultPanel.classList.remove('hidden');

    if (arScene) {
      arScene.updateCalculation(result);
    }
  }

  amountInput.addEventListener('input', updateCalculation);

  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.target as HTMLButtonElement;
      const val = target.getAttribute('data-val');
      if (val) {
        amountInput.value = val;
        updateCalculation();
      }
    });
  });
