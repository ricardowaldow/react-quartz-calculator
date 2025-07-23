import React, { useState } from 'react';

// Definição dos valores dos cristais
const crystalValues = {
  quartz: 1,
  rubelita: 2,
  esmeralda: 3,
  safira: 4,
  rubi: 6,
  ambar: 8,
};

// Lista de tipos de cristais
const crystalTypes = Object.keys(crystalValues);

// Função para calcular o lucro base sem combos
const calculateBaseProfit = (counts) => {
  return Object.keys(counts).reduce((total, type) => total + (counts[type] * crystalValues[type]), 0);
};

// Função para calcular o melhor lucro com combos
const calculateBestProfit = (counts) => {
  const typesWithCounts = crystalTypes.filter(type => counts[type] > 0);
  const numDifferent = typesWithCounts.length;

  // Lucro base sem combo
  const baseProfit = calculateBaseProfit(counts);
  let maxProfit = baseProfit;
  let bestCombo = 'Sem combo';

  // Combo de diferentes
  if (numDifferent === 5) {
    const profit = baseProfit + 8;
    if (profit > maxProfit) {
      maxProfit = profit;
      bestCombo = 'Combo de 5 diferentes (+$8)';
    }
  } else if (numDifferent === 6) {
    const profit = baseProfit + 12;
    if (profit > maxProfit) {
      maxProfit = profit;
      bestCombo = 'Combo de 6 diferentes (+$12)';
    }
  }

  // Combos de iguais
  crystalTypes.forEach(sameType => {
    const countSame = counts[sameType];

    // Combo de 3 iguais
    if (countSame === 3) {
      let localMax = baseProfit;
      let localBestDouble = null;
      let bestDoubleProfit = 0;

      crystalTypes.forEach(doubleType => {
        if (doubleType !== sameType && counts[doubleType] > 0) {
          const doubledValue = crystalValues[doubleType] * 2;
          const profitFromDoubled = counts[doubleType] * doubledValue;
          const originalFromDoubled = counts[doubleType] * crystalValues[doubleType];
          const profit = baseProfit - originalFromDoubled + profitFromDoubled;

          if (profit > localMax) {
            localMax = profit;
            localBestDouble = doubleType;
            bestDoubleProfit = profit - baseProfit;
          }
        }
      });

      if (localMax > maxProfit) {
        maxProfit = localMax;
        bestCombo = `Combo de 3 ${sameType} (dobrar ${localBestDouble} +$${bestDoubleProfit})`;
      }
    }

    // Combo de 4 iguais
    if (countSame >= 4) {
      let localMax = baseProfit;
      let localBestDoubles = [];

      const otherTypes = crystalTypes
        .filter(type => type !== sameType && counts[type] > 0)
        .sort((a, b) => (counts[b] * crystalValues[b]) - (counts[a] * crystalValues[a]));

      if (otherTypes.length >= 2) {
        const double1 = otherTypes[0];
        const double2 = otherTypes[1];
        const profitFromDouble1 = counts[double1] * (crystalValues[double1] * 2) - counts[double1] * crystalValues[double1];
        const profitFromDouble2 = counts[double2] * (crystalValues[double2] * 2) - counts[double2] * crystalValues[double2];
        localMax += profitFromDouble1 + profitFromDouble2;
        localBestDoubles = [double1, double2];
      } else if (otherTypes.length === 1) {
        const double1 = otherTypes[0];
        const profitFromDouble1 = counts[double1] * (crystalValues[double1] * 2) - counts[double1] * crystalValues[double1];
        localMax += profitFromDouble1;
        localBestDoubles = [double1];
      }

      if (localMax > maxProfit) {
        maxProfit = localMax;
        bestCombo = `Combo de 4 ${sameType} (dobrar ${localBestDoubles.join(' e ')} +$${localMax - baseProfit})`;
      }
    }
  });

  return { maxProfit, bestCombo };
};

const QuartzCalculatorApp = () => {
  const [counts, setCounts] = useState({
    quartz: 0,
    rubelita: 0,
    esmeralda: 0,
    safira: 0,
    rubi: 0,
    ambar: 0,
  });

  const [result, setResult] = useState(null);

  const handleChange = (type, value) => {
    setCounts(prev => ({ ...prev, [type]: Math.max(0, parseInt(value) || 0) }));
  };

  const handleCalculate = () => {
    const { maxProfit, bestCombo } = calculateBestProfit(counts);
    setResult({ maxProfit, bestCombo });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>Quartzculator</h1>
      <p>Insira a quantidade de cada cristal e calcule o melhor combo para máxima venda na rodada.</p>
  
      {crystalTypes.map(type => (
        <div key={type} style={{ marginBottom: '10px' }}>
          <label>{type.charAt(0).toUpperCase() + type.slice(1)} (${crystalValues[type]} cada):</label>
          <input
            type="number"
            min="0"
            value={counts[type]}
            onChange={e => handleChange(type, e.target.value)}
            style={{ marginLeft: '10px', width: '50px' }}
          />
        </div>
      ))}

      <button onClick={handleCalculate} style={{ marginTop: '20px', padding: '10px' }}>
        Calcular Melhor Venda
      </button>

      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Resultado:</h2>
          <p><strong>Lucro Máximo:</strong> ${result.maxProfit}</p>
          <p><strong>Melhor Combo:</strong> {result.bestCombo}</p>
          <p><em>Nota: Isso assume venda de todos os cristais sem guardar no baú. Autunitas não são consideradas aqui (valor 0 e risco de explosão).</em></p>
        </div>
      )}
    </div>
  );
};

export default QuartzCalculatorApp;