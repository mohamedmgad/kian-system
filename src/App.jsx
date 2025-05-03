// تمت إضافة تقرير المدفوعات + المصاريف + التصدير PDF
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import * as XLSX from "xlsx";
import html2pdf from 'html2pdf.js';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { useReactToPrint } from 'react-to-print';

export default function ConstructionSystem() {
  // تحميل من localStorage
  const saved = typeof window !== 'undefined' ? localStorage.getItem('projectsData') : null;
  const initialProjects = saved ? JSON.parse(saved) : [
    { id: 'p1', name: 'مشروع 1', data: { items: [], workers: [], materials: [], suppliers: [], expenses: [], contracts: [], payments: [] } }
  ];
  const [projects, setProjects] = useState(initialProjects.map(p => ({
    ...p,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString()
  })));
  const [selectedProjectId, setSelectedProjectId] = useState('p1');

  const currentProject = projects.find(p => p.id === selectedProjectId);
  const data = currentProject?.data || {};
  const setData = updatedData => {
    setProjects($1);
    localStorage.setItem('projectsData', JSON.stringify($1));
  };
  const [newExpense, setNewExpense] = useState({ type: "", amount: "", date: "", notes: "", relatedItem: "" });

  const addExpense = () => {
    if (!newExpense.type || !newExpense.amount) return;
    setData({ ...data, expenses: [...data.expenses, newExpense] });
    setNewExpense({ type: "", amount: "", date: "", notes: "", relatedItem: "" });
  };

  const reportRef = useRef();
  const handlePrint = useReactToPrint({ content: () => reportRef.current });
  const handleDownloadPDF = () => {
    const element = reportRef.current;
    const options = {
      margin: 0.5,
      filename: 'تقرير_المشروع.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57'];

  const expenseChartData = data.expenses.reduce((acc, curr) => {
    const found = acc.find(e => e.name === curr.type);
    if (found) found.value += parseFloat(curr.amount || 0);
    else acc.push({ name: curr.type, value: parseFloat(curr.amount || 0) });
    return acc;
  }, []);

  const budgetChartData = data.items.map(item => ({ name: item.name, value: parseFloat(item.estimatedBudget || 0) }));
  const contractChartData = data.contracts.map(c => ({ name: c.company, value: parseFloat(c.contractValue || 0) }));
  const spendingPerItem = data.materials.reduce((acc, m) => {
    const k = m.relatedItem || "غير محدد";
    const v = parseFloat(m.price || 0);
    if (acc[k]) acc[k] += v; else acc[k] = v;
    return acc;
  }, {});
  data.expenses.forEach(e => {
    const k = e.relatedItem || "غير محدد";
    const v = parseFloat(e.amount || 0);
    if (spendingPerItem[k]) spendingPerItem[k] += v; else spendingPerItem[k] = v;
  });

  const budgetVsActualData = data.items.map(i => ({ name: i.name, budget: parseFloat(i.estimatedBudget || 0), spent: spendingPerItem[i.name] || 0 }));
  const paymentsByRecipient = data.payments.reduce((acc, p) => {
    if (!p.recipient) return acc;
    const name = p.recipient;
    const amount = parseFloat(p.amount || 0);
    const existing = acc.find(e => e.name === name);
    if (existing) existing.value += amount;
    else acc.push({ name, value: amount });
    return acc;
  }, []);

  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">شركة كيان المتحدة للتجارة العامة والمقاولات العامة</h2>
        <p className="text-sm text-gray-500">تقرير المشروع المالي والإداري</p>
      </div>
      <div className="mb-4">
        $1
<Button size="sm" variant="outline" onClick={() => {
  const newName = prompt('اسم جديد للمشروع');
  if (newName) {
    setProjects(projects.map(p => p.id === selectedProjectId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p));
  }
}}>✏️ تعديل الاسم</Button>
<Button size="sm" variant="destructive" onClick={() => {
  if (projects.length === 1) return alert('لا يمكن حذف آخر مشروع');
  if (confirm('هل أنت متأكد من حذف هذا المشروع؟')) {
    const remaining = projects.filter(p => p.id !== selectedProjectId);
    setProjects(remaining);
    setSelectedProjectId(remaining[0].id);
  }
}}>🗑️ حذف المشروع</Button>
          <Button size="sm" onClick={() => {
            const name = prompt('اسم المشروع الجديد');
            if (name) {
              const id = 'p' + (projects.length + 1);
              setProjects([...projects, { id, name, data: { items: [], workers: [], materials: [], suppliers: [], expenses: [], contracts: [], payments: [] }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
              setSelectedProjectId(id);
            }
          }}>➕ مشروع جديد</Button>
        </div>
        <Label>اختر المشروع</Label>
        <select className="border rounded px-2 py-1" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name} – {new Date(p.createdAt).toLocaleDateString()}</option>)}
        </select>
      </div>
      <h1 className="text-3xl font-bold mb-4">نظام إدارة المشروع الإنشائي</h1>

      {/* باقي المحتوى كما هو */}

      <div className="mt-6 space-x-4">
        <input
          type="file"
          accept="application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const toast = document.createElement('div');
                toast.style.position = 'fixed';
                toast.style.top = '20px';
                toast.style.right = '20px';
                toast.style.background = '#4caf50';
                toast.style.color = '#fff';
                toast.style.padding = '10px 20px';
                toast.style.borderRadius = '6px';
                toast.style.zIndex = '9999';
                toast.innerText = '✅ تم استيراد البيانات بنجاح';
                document.body.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
                const imported = JSON.parse(event.target?.result);
                if (Array.isArray(imported)) {
                  localStorage.setItem('projectsData', JSON.stringify(imported));
                  window.location.reload();
                } else {
                  const toast = document.createElement('div');
toast.style.position = 'fixed';
toast.style.top = '20px';
toast.style.right = '20px';
toast.style.background = '#f44336';
toast.style.color = '#fff';
toast.style.padding = '10px 20px';
toast.style.borderRadius = '6px';
toast.style.zIndex = '9999';
toast.innerText = '❌ صيغة الملف غير صحيحة';
document.body.appendChild(toast);
setTimeout(() => toast.remove(), 3000);
                }
              } catch (err) {
                const toast = document.createElement('div');
toast.style.position = 'fixed';
toast.style.top = '20px';
toast.style.right = '20px';
toast.style.background = '#f44336';
toast.style.color = '#fff';
toast.style.padding = '10px 20px';
toast.style.borderRadius = '6px';
toast.style.zIndex = '9999';
toast.innerText = '⚠️ حدث خطأ أثناء قراءة الملف';
document.body.appendChild(toast);
setTimeout(() => toast.remove(), 3000);
              }
            };
            reader.readAsText(file);
          }}
          className="border px-2 py-1 rounded text-sm"
        />
        <Button onClick={() => {
          const blob = new Blob([JSON.stringify(projects, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'نسخة_احتياطية_للمشاريع.json';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }}>💾 تحميل نسخة JSON</Button>
        <Button variant="outline" onClick={() => {
          if (confirm('سيتم مسح جميع البيانات وإعادة النظام إلى حالته الأولية. هل أنت متأكد؟')) {
            const defaultProjects = [
              { id: 'p1', name: 'مشروع 1', data: { items: [], workers: [], materials: [], suppliers: [], expenses: [], contracts: [], payments: [] } }
            ];
            localStorage.removeItem('projectsData');
            window.location.reload();
          }
        }}>🔄 استعادة الإعدادات الافتراضية</Button>
        <Button onClick={handlePrint}>🖨️ طباعة التقرير</Button>
        <Button onClick={handleDownloadPDF}>📥 تحميل PDF</Button>
        <Button onClick={() => exportToExcel()}>📤 ترحيل البيانات إلى Excel</Button>
      </div>
            <div className="mt-12 text-center opacity-70 print:opacity-100">
          <p className="text-sm">يعتمد هذا التقرير من قبل شركة كيان المتحدة للتجارة العامة والمقاولات العامة</p>
          <img src="/mnt/data/الختم1.png" alt="ختم الشركة" className="mx-auto mt-2 w-32 h-auto opacity-90 print:opacity-100" />
        </div>
      </div>
    );
  }
