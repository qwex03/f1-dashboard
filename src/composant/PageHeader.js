export default function PageHeader({ title, description }) {
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 px-2">
        <div className="w-1 h-10 bg-red-600 rounded-full"></div>
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {title}
        </h1>
      </div>
      <p className="text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
