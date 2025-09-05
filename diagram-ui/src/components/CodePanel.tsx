type Props = { title: string; children: React.ReactNode };

export default function CodePanel({ title, children }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 border dark:bg-slate-800 dark:border-slate-700">
      <div className="text-sm mb-2 font-medium">{title}</div>
      <pre className="text-xs bg-gray-50 dark:bg-slate-900/40 dark:text-slate-100 rounded-xl p-3 overflow-auto max-h-64 break-words">
        <code>{children}</code>
      </pre>
    </div>
  );
}
