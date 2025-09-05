type Props = { text: string };

export default function Tooltip({ text }: Props) {
  return (
    <span className="relative inline-flex items-center group">
      <span
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-700 text-[10px] leading-none cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
        tabIndex={0}
        aria-label="Info"
      >
        !
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-xl dark:bg-slate-200 dark:text-slate-900 opacity-0 scale-95 group-hover:opacity-100 group-focus-within:opacity-100 group-hover:scale-100 group-focus-within:scale-100 transition duration-100 w-64 sm:w-72 max-w-[80vw] text-left leading-5 whitespace-normal break-words"
      >
        {text}
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 dark:bg-slate-200" />
      </span>
    </span>
  );
}
