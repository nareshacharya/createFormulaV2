import type { Ingredient } from "../../services/pega";
import Badge from "../Badge";
import { tw } from "../../utils/tailwindToInline";

interface DocumentsSectionProps {
  ingredient: Ingredient;
}

const DocumentsSection = ({
  ingredient: _ingredient,
}: DocumentsSectionProps) => {
  // Mock documents data
  const mockDocuments = [
    {
      id: "DOC001",
      name: "Safety Data Sheet (SDS)",
      type: "Safety",
      version: "2.1",
      date: "2024-01-15",
      size: "245 KB",
      format: "PDF",
      status: "Current",
      description: "Complete safety information and handling procedures",
    },
    {
      id: "DOC002",
      name: "Certificate of Analysis",
      type: "Quality",
      version: "1.3",
      date: "2024-01-10",
      size: "156 KB",
      format: "PDF",
      status: "Current",
      description: "Analytical test results for current batch",
    },
    {
      id: "DOC003",
      name: "IFRA Certificate",
      type: "Compliance",
      version: "1.0",
      date: "2023-12-20",
      size: "89 KB",
      format: "PDF",
      status: "Current",
      description: "IFRA compliance certification document",
    },
    {
      id: "DOC004",
      name: "Technical Data Sheet",
      type: "Technical",
      version: "3.2",
      date: "2023-11-30",
      size: "312 KB",
      format: "PDF",
      status: "Current",
      description: "Detailed technical specifications and properties",
    },
    {
      id: "DOC005",
      name: "Allergen Declaration",
      type: "Compliance",
      version: "1.1",
      date: "2023-11-15",
      size: "67 KB",
      format: "PDF",
      status: "Current",
      description: "Official allergen declaration statement",
    },
    {
      id: "DOC006",
      name: "Kosher Certificate",
      type: "Certification",
      version: "1.0",
      date: "2023-10-01",
      size: "123 KB",
      format: "PDF",
      status: "Expiring Soon",
      description: "Kosher certification valid until March 2024",
    },
  ];

  const getTypeVariant = (type: string) => {
    const typeMap = {
      Safety: "error",
      Quality: "success",
      Compliance: "warning",
      Technical: "info",
      Certification: "purple",
    } as const;

    return typeMap[type as keyof typeof typeMap] || "default";
  };

  const getStatusVariant = (status: string) => {
    const statusMap = {
      Current: "success",
      "Expiring Soon": "warning",
      Expired: "error",
      Draft: "default",
    } as const;

    return statusMap[status as keyof typeof statusMap] || "default";
  };

  const getFileIcon = (format: string) => {
    const iconMap = {
      PDF: "ri-file-pdf-line",
      DOC: "ri-file-word-line",
      XLS: "ri-file-excel-line",
      TXT: "ri-file-text-line",
    } as const;

    return iconMap[format as keyof typeof iconMap] || "ri-file-line";
  };

  return (
    <div style={tw("space-y-6")}>
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Available Documents
        </h3>
        <div style={tw("space-y-3")}>
          {mockDocuments.map((doc) => (
            <div
              key={doc.id}
              style={tw(
                "border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              )}
            >
              <div style={tw("flex items-start justify-between")}>
                <div style={tw("flex items-start space-x-3 flex-1")}>
                  {/* File Icon */}
                  <div
                    style={tw(
                      "flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"
                    )}
                  >
                    <i
                      className={`${getFileIcon(doc.format)} text-blue-600`}
                    ></i>
                  </div>

                  {/* Document Info */}
                  <div style={tw("flex-1 min-w-0")}>
                    <div style={tw("flex items-center space-x-2 mb-1")}>
                      <h4
                        style={tw("text-sm font-medium text-gray-900 truncate")}
                      >
                        {doc.name}
                      </h4>
                      <Badge variant={getTypeVariant(doc.type)} size="sm">
                        {doc.type}
                      </Badge>
                      <Badge variant={getStatusVariant(doc.status)} size="sm">
                        {doc.status}
                      </Badge>
                    </div>

                    <p style={tw("text-xs text-gray-600 mb-2")}>
                      {doc.description}
                    </p>

                    <div
                      style={tw(
                        "flex items-center space-x-4 text-xs text-gray-500"
                      )}
                    >
                      <span>Version {doc.version}</span>
                      <span>{doc.date}</span>
                      <span>{doc.size}</span>
                      <span>{doc.format}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={tw("flex space-x-2 ml-4")}>
                  <button
                    style={tw(
                      "p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                    )}
                  >
                    <i className="ri-eye-line text-sm"></i>
                  </button>
                  <button
                    style={tw(
                      "p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                    )}
                  >
                    <i className="ri-download-line text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document Categories */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Document Categories
        </h3>
        <div style={tw("grid grid-cols-2 gap-4")}>
          {[
            "Safety",
            "Quality",
            "Compliance",
            "Technical",
            "Certification",
          ].map((category) => {
            const count = mockDocuments.filter(
              (doc) => doc.type === category
            ).length;
            return (
              <div key={category} style={tw("p-3 bg-gray-50 rounded-lg")}>
                <div style={tw("flex items-center justify-between")}>
                  <span style={tw("text-sm font-medium text-gray-700")}>
                    {category}
                  </span>
                  <Badge variant={getTypeVariant(category)} size="sm">
                    {count}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Document Actions */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Document Actions
        </h3>
        <div style={tw("flex space-x-3")}>
          <button
            style={tw(
              "flex-1 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            )}
          >
            <i className="ri-download-line mr-2"></i>
            Download All
          </button>
          <button
            style={tw(
              "flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            )}
          >
            <i className="ri-mail-line mr-2"></i>
            Email Documents
          </button>
          <button
            style={tw(
              "flex-1 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors cursor-pointer"
            )}
          >
            <i className="ri-upload-line mr-2"></i>
            Upload New
          </button>
        </div>
      </div>

      {/* Document Status Alert */}
      <div style={tw("bg-yellow-50 border border-yellow-200 rounded-lg p-4")}>
        <div style={tw("flex items-start")}>
          <i className="ri-alert-line text-yellow-600 mt-0.5 mr-2"></i>
          <div>
            <p style={tw("text-sm text-yellow-800 font-medium")}>
              Document Expiration Notice
            </p>
            <p style={tw("text-sm text-yellow-700 mt-1")}>
              1 document is expiring soon. Please review and update
              certifications as needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsSection;
