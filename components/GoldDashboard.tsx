'use client';
import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time } from 'lightweight-charts';
import { Bell, RefreshCw } from 'lucide-react';

type Signal = { direction:'BUY'|'SELL'|'WAIT'; price:number; ema50:number; support:number; resistance:number; entry:number|null; sl:number|null; tp1:number|null; tp2:number|null; reason:string; riskNote:string };
type Payload = { symbol:string; updatedAt:string; candles:any[]; signal:Signal; error?:string };
const fmt=(n:number|null)=> n===null?'—':n.toFixed(2);

export default function GoldDashboard(){
  const [data,setData]=useState<Payload|null>(null); const [err,setErr]=useState(''); const [manual,setManual]=useState({lot:'0.02', dailyLoss:'50', target:'25-50'});
  const chartRef=useRef<HTMLDivElement>(null); const chart=useRef<IChartApi|null>(null); const series=useRef<ISeriesApi<'Candlestick'>|null>(null);
  async function load(){
    setErr('');
    try{ const r=await fetch('/api/xau',{cache:'no-store'}); const j=await r.json(); if(!r.ok) throw new Error(j.error||'API Error'); setData(j); render(j); notify(j.signal); }
    catch(e:any){setErr(e.message)}
  }
  function notify(s:Signal){ if(typeof window==='undefined') return; if(!('Notification' in window)) return; if(Notification.permission==='granted' && s.direction!=='WAIT') new Notification(`XAUUSD ${s.direction}`,{body:`Entry ${fmt(s.entry)} | SL ${fmt(s.sl)} | TP1 ${fmt(s.tp1)}`}); }
  function askNotify(){ if('Notification' in window) Notification.requestPermission(); }
  function render(j:Payload){
    if(!chartRef.current) return;
    if(!chart.current){ chart.current=createChart(chartRef.current,{height:chartRef.current.clientHeight, layout:{background:{color:'#0d1b2e'}, textColor:'#dbeafe'}, grid:{vertLines:{color:'#132844'},horzLines:{color:'#132844'}}, timeScale:{timeVisible:true,secondsVisible:false}}); series.current=chart.current.addCandlestickSeries(); }
    const cs:CandlestickData[]=[...j.candles].reverse().map(c=>({time:(new Date(c.time).getTime()/1000) as Time, open:c.open, high:c.high, low:c.low, close:c.close}));
    series.current?.setData(cs); chart.current?.timeScale().fitContent();
  }
  useEffect(()=>{load(); const id=setInterval(load,60000); return()=>clearInterval(id)},[]);
  const s=data?.signal;
  return <div className="wrap">
    <div className="top"><div className="brand"><h1>iCool Gold Signals</h1><p>واجهة سكالبينغ مباشرة للذهب XAU/USD — تحديث كل 60 ثانية</p></div><div className="row"><button className="btn" onClick={askNotify}><Bell size={16}/> تفعيل التنبيهات</button><button className="btn" onClick={load}><RefreshCw size={16}/> تحديث</button></div></div>
    {err && <div className="card warn" style={{marginTop:14}}>خطأ: {err}<br/>تأكد من وضع TWELVEDATA_API_KEY في Vercel Environment Variables.</div>}
    <div className="grid">
      <div className="card"><div className="row"><span className="badge">{data?.symbol||'XAU/USD'}</span><span className="badge">آخر تحديث: {data?new Date(data.updatedAt).toLocaleTimeString('ar-LB'): '—'}</span></div><div className="price">{s?fmt(s.price):'—'}</div><div className={`signal ${s?.direction||'WAIT'}`}>{s?.direction==='BUY'?'شراء BUY':s?.direction==='SELL'?'بيع SELL':'انتظار WAIT'}</div><p>{s?.reason||'تحميل البيانات...'}</p><div className="nums"><div className="num"><small>EMA 50</small><b>{fmt(s?.ema50??null)}</b></div><div className="num"><small>Support</small><b>{fmt(s?.support??null)}</b></div><div className="num"><small>Resistance</small><b>{fmt(s?.resistance??null)}</b></div><div className="num"><small>Lot</small><b>{manual.lot}</b></div><div className="num"><small>Entry</small><b>{fmt(s?.entry??null)}</b></div><div className="num"><small>SL</small><b>{fmt(s?.sl??null)}</b></div><div className="num"><small>TP1</small><b>{fmt(s?.tp1??null)}</b></div><div className="num"><small>TP2</small><b>{fmt(s?.tp2??null)}</b></div></div></div>
      <div className="card"><h2>قواعد الحساب 2500$</h2><div className="settings"><div><label>اللوت</label><input value={manual.lot} onChange={e=>setManual({...manual,lot:e.target.value})}/></div><div><label>حد الخسارة اليومي $</label><input value={manual.dailyLoss} onChange={e=>setManual({...manual,dailyLoss:e.target.value})}/></div><div><label>الهدف اليومي $</label><input value={manual.target} onChange={e=>setManual({...manual,target:e.target.value})}/></div></div><ul className="rules"><li>لا تدخل أول 10–15 دقيقة من افتتاح السوق.</li><li>صفقتان خاسرتان متتاليتان = توقف فورًا.</li><li>لا تدخل قبل خبر قوي أو أثناء سبريد عالي.</li><li>الإشارة للتنبيه والتحليل وليست ضمان ربح.</li></ul><div className="warn">{s?.riskNote}</div></div>
    </div>
    <div className="card" style={{marginTop:14}}><h2>الشارت المباشر 5m</h2><div ref={chartRef} className="chartBox"/></div>
    <div className="footer">البيانات من Twelve Data عبر API خاص بك. لا يتم تخزين مفتاح API في المتصفح. هذه أداة مساعدة وليست نصيحة مالية ملزمة.</div>
  </div>
}
