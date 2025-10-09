
import { ReactNode } from 'react';

interface ListRowProps {
  children: ReactNode;
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  compact?: boolean;
  className?: string;
}

const ListRow = ({ 
  children, 
  onClick, 
  onHover, 
  compact = false,
  className = ''
}: ListRowProps) => {
  return (
    <div
      className={`
        border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors
        ${compact ? 'py-2' : 'py-3'}
        hover:bg-gray-50
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
    >
      {children}
    </div>
  );
};

export default ListRow;
