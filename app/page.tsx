'use client';

import { useState } from 'react';

export default function Page() {
  const [q_m3h, setQ] = useState('');
  const [d_mm, setD] = useState('');
  const [result, setResult] = useState<{ value: string; unit: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    if (!q_m3h || !d_mm) {
      alert('请输入完整参数');
      return;
    }

    setLoading(true);
    try {
      // 连接到后端服务
      const url = `https://pipe-calculator-backend0412.onrender.com/calculate?q_m3h=${q_m3h}&d_mm=${d_mm}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.result) {
        setResult({ value: data.result, unit: data.unit });
      } else {
        alert('计算出错：' + (data.error || '未知错误'));
      }
    } catch (error) {
      alert('无法连接到后端服务器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '500px', margin: '50px auto', padding: '20px', lineHeight: '1.6' }}>
      <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2>管道流速计算</h2>
        
        <label>流量 (m³/h):</label>
        <input
          type="number"
          placeholder="例如: 100"
          value={q_m3h}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
        />

        <label>管径 (mm):</label>
        <input
          type="number"
          placeholder="例如: 50"
          value={d_mm}
          onChange={(e) => setD(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
        />

        <button
          onClick={calculate}
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: loading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
        >
          {loading ? '计算中...' : '立即计算'}
        </button>

        {result && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '4px' }}>
            <strong>计算结果：</strong>
            <span>{result.value}</span> <span>{result.unit}</span>
          </div>
        )}
      </div>
    </div>
  );
}

