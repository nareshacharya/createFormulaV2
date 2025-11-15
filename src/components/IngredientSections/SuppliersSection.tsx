/* eslint-disable jsx-a11y/label-has-associated-control */
import type { Ingredient } from "../../services/pega";
import { tw } from "../../utils/tailwindToInline";
import Badge from "../Badge";

interface SuppliersSectionProps {
  ingredient: Ingredient;
}

const SuppliersSection = ({
  ingredient: _ingredient,
}: SuppliersSectionProps) => {
  // Mock suppliers data
  const mockSuppliers = [
    {
      id: "SUP001",
      name: "Givaudan",
      status: "Preferred",
      price: 23.4,
      currency: "USD",
      unit: "kg",
      leadTime: "2-3 weeks",
      minOrder: "25 kg",
      lastOrder: "2024-01-15",
      quality: "Premium",
      certifications: ["ISO 9001", "IFRA", "Kosher"],
      contact: {
        name: "Sarah Johnson",
        email: "sarah.johnson@givaudan.com",
        phone: "+1-555-0123",
      },
    },
    {
      id: "SUP002",
      name: "Firmenich",
      status: "Approved",
      price: 22.8,
      currency: "USD",
      unit: "kg",
      leadTime: "3-4 weeks",
      minOrder: "50 kg",
      lastOrder: "2023-12-10",
      quality: "Standard",
      certifications: ["ISO 9001", "REACH"],
      contact: {
        name: "Michael Chen",
        email: "michael.chen@firmenich.com",
        phone: "+1-555-0124",
      },
    },
    {
      id: "SUP003",
      name: "IFF",
      status: "Alternative",
      price: 24.1,
      currency: "USD",
      unit: "kg",
      leadTime: "1-2 weeks",
      minOrder: "10 kg",
      lastOrder: "2023-11-20",
      quality: "Premium",
      certifications: ["ISO 9001", "IFRA", "Halal", "Kosher"],
      contact: {
        name: "Emma Rodriguez",
        email: "emma.rodriguez@iff.com",
        phone: "+1-555-0125",
      },
    },
  ];

  const getStatusVariant = (status: string) => {
    const statusMap = {
      Preferred: "success",
      Approved: "info",
      Alternative: "warning",
      Inactive: "default",
    } as const;

    return statusMap[status as keyof typeof statusMap] || "default";
  };

  const getQualityVariant = (quality: string) => {
    return quality === "Premium" ? "purple" : "default";
  };

  return (
    <div style={tw("space-y-6")}>
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Available Suppliers
        </h3>
        <div style={tw("space-y-4")}>
          {mockSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              style={tw("border border-gray-200 rounded-lg p-4")}
            >
              {/* Supplier Header */}
              <div style={tw("flex items-start justify-between mb-4")}>
                <div>
                  <div style={tw("flex items-center space-x-3 mb-2")}>
                    <h4 style={tw("text-lg font-medium text-gray-900")}>
                      {supplier.name}
                    </h4>
                    <Badge variant={getStatusVariant(supplier.status)}>
                      {supplier.status}
                    </Badge>
                    <Badge
                      variant={getQualityVariant(supplier.quality)}
                      size="sm"
                    >
                      {supplier.quality}
                    </Badge>
                  </div>
                  <p style={tw("text-sm text-gray-600")}>
                    Supplier ID: {supplier.id}
                  </p>
                </div>
                <div style={tw("text-right")}>
                  <p style={tw("text-lg font-semibold text-gray-900")}>
                    ${supplier.price.toFixed(2)}
                  </p>
                  <p style={tw("text-sm text-gray-600")}>per {supplier.unit}</p>
                </div>
              </div>

              {/* Supplier Details Grid */}
              <div style={tw("grid grid-cols-2 gap-4 mb-4")}>
                <div>
                  <label
                    style={tw("block text-xs font-medium text-gray-500 mb-1")}
                  >
                    Lead Time
                  </label>
                  <p style={tw("text-sm text-gray-900")}>{supplier.leadTime}</p>
                </div>
                <div>
                  <label
                    style={tw("block text-xs font-medium text-gray-500 mb-1")}
                  >
                    Minimum Order
                  </label>
                  <p style={tw("text-sm text-gray-900")}>{supplier.minOrder}</p>
                </div>
                <div>
                  <label
                    style={tw("block text-xs font-medium text-gray-500 mb-1")}
                  >
                    Last Order
                  </label>
                  <p style={tw("text-sm text-gray-900")}>
                    {supplier.lastOrder}
                  </p>
                </div>
                <div>
                  <label
                    style={tw("block text-xs font-medium text-gray-500 mb-1")}
                  >
                    Contact
                  </label>
                  <p style={tw("text-sm text-gray-900")}>
                    {supplier.contact.name}
                  </p>
                </div>
              </div>

              {/* Certifications */}
              <div style={tw("mb-4")}>
                <label
                  style={tw("block text-xs font-medium text-gray-500 mb-2")}
                >
                  Certifications
                </label>
                <div style={tw("flex flex-wrap gap-2")}>
                  {supplier.certifications.map((cert) => (
                    <Badge key={cert} variant="info" size="sm">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contact Information */}
              <div style={tw("bg-gray-50 rounded-lg p-3")}>
                <label
                  style={tw("block text-xs font-medium text-gray-500 mb-2")}
                >
                  Contact Information
                </label>
                <div style={tw("space-y-1")}>
                  <div style={tw("flex items-center space-x-2")}>
                    <i className="ri-mail-line text-gray-400 text-sm"></i>
                    <span style={tw("text-sm text-gray-700")}>
                      {supplier.contact.email}
                    </span>
                  </div>
                  <div style={tw("flex items-center space-x-2")}>
                    <i className="ri-phone-line text-gray-400 text-sm"></i>
                    <span style={tw("text-sm text-gray-700")}>
                      {supplier.contact.phone}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supplier Performance */}
      <div>
        <h3 style={tw("text-lg font-semibold text-gray-900 mb-4")}>
          Supplier Performance
        </h3>
        <div style={tw("bg-blue-50 border border-blue-200 rounded-lg p-4")}>
          <div style={tw("flex items-start")}>
            <i className="ri-bar-chart-line text-blue-600 mt-0.5 mr-2"></i>
            <div>
              <p style={tw("text-sm text-blue-800 font-medium")}>
                Performance Metrics
              </p>
              <p style={tw("text-sm text-blue-700 mt-1")}>
                Detailed supplier performance analytics including delivery
                times, quality scores, and pricing trends would be available
                through integration with procurement systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppliersSection;
