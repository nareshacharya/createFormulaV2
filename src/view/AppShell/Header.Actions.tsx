import { eventBus } from "../../utils/bus";

const HeaderActions = () => {
  const handleNormalize = () => {
    eventBus.emit("normalize-formula");
  };

  return (
    <div className="flex items-center gap-4">
      {/* Action Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNormalize}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="Normalize Formula"
        >
          <i className="ri-scales-line text-white text-lg"></i>
        </button>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
          title="More Actions"
        >
          <i className="ri-more-2-fill text-white text-lg"></i>
        </button>
      </div>

      {/* Primary Action */}
      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap">
        Run Compliance
      </button>
    </div>
  );
};

export default HeaderActions;
