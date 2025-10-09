
const HeaderActions = () => {
  return (
    <div className="flex items-center gap-4">
      {/* Action Icons */}
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="Notes"
        >
          <i className="ri-file-text-line text-white text-sm"></i>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="History"
        >
          <i className="ri-history-line text-white text-sm"></i>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="Reports"
        >
          <i className="ri-bar-chart-line text-white text-sm"></i>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="Settings"
        >
          <i className="ri-settings-3-line text-white text-sm"></i>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="More"
        >
          <i className="ri-more-2-line text-white text-sm"></i>
        </button>
      </div>
      
      {/* Primary Action */}
      <button
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed whitespace-nowrap"
        disabled
      >
        Run Compliance
      </button>
    </div>
  );
};

export default HeaderActions;
