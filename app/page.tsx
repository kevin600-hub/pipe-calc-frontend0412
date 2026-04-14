'use client';

import { useState, useEffect } from 'react';

export default function Page() {
  const [q, setQ] = useState('');
  const [d, setD] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [statusText, setStatusText] = useState('正在处理，请稍候...');

  const BACKEND_URL = "https://onrender.com";

  // 1. 支付处理逻辑
  const handlePay = async () => {
    if (!q || !d) return alert("请输入完整参数！");
    
    // 存入本地，回来时用
    localStorage.setItem('pending_q', q);
    localStorage.setItem('pending_d', d);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/create-checkout-session`, { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // 跳转到 Stripe
      }
    } catch (err) {
      alert("连接后端失败");
      setLoading(false);
    }
  };

  // 2. 检测支付返回
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');

    if (sessionId) {
      const savedQ = localStorage.getItem('pending_q');
      const savedD = localStorage.getItem('pending_d');
      setLoading(true);
      setStatusText("正在验证支付结果...");
      pollResult(sessionId, savedQ, savedD);
    }
  }, []);

  // 3. 轮询结果
  const pollResult = async (sessionId: string, q_val: string | null, d_val: string | null) => {
    try {
      const res = await fetch(`${BACKEND_URL}/calculate?session_id=${sessionId}&q_m3h=${q_val}&d_mm=${d_val}`);
      
      if (res.status === 402) {
        setTimeout(() => pollResult(sessionId, q_val, d_val), 2000);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setLoading(false);
      } else {
        alert("计算失败，请重试");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-8">管道流速计算器</h1>

        {!loading && !result && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">流量 (m³/h)</label>
              <input type="number" value={q} onChange={(e) => setQ(e.target.value)} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="输入流量" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">管径 (mm)</label>
              <input type="number" value={d} onChange={(e) => setD(e.target.value)} className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="输入管径" />
            </div>
            <button onClick={handlePay} className="w-full bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 transition-colors">
              支付 $5.00 并计算
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-10 space-y-4">
            <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-500">{statusText}</p>
          </div>
        )}

        {result && (
          <div className="text-center space-y-4 py-4">
            <div className="text-5xl text-green-500">✅</div>
            <p className="text-gray-600 text-lg">计算出的流速为：</p>
            <div className="text-5xl font-black text-blue-600">
              {result.result} <span className="text-xl">m/s</span>
            </div>
            <button onClick={() => window.location.href = '/'} className="mt-8 text-blue-500 hover:underline">重新计算</button>
          </div>
        )}
      </div>
    </main>
  );
}
