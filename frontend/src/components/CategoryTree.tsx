import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { categoryApi } from '../services/categoryApi';
import type { CategoryResponse } from '../types/api';

const TreeNode = ({ category, activeId, depth }: { category: CategoryResponse; activeId: number | null; depth: number }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = category.children.length > 0;
  const isActive = category.categoryId === activeId;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          padding: '0.375rem 0.5rem',
          paddingLeft: `${0.5 + depth * 1}rem`,
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          background: isActive ? 'rgba(212,163,115,0.1)' : 'transparent',
          color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
          fontWeight: isActive ? 600 : 400,
          fontSize: '0.875rem',
        }}
        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {hasChildren ? (
          <span onClick={() => setExpanded(!expanded)} style={{ display: 'flex', color: 'var(--text-muted)' }}>
            {expanded ? <ChevronDownIcon style={{ width: '0.875rem', height: '0.875rem' }} /> : <ChevronRightIcon style={{ width: '0.875rem', height: '0.875rem' }} />}
          </span>
        ) : (
          <span style={{ width: '0.875rem' }} />
        )}
        <Link
          to={`/categories/${category.slug}`}
          onClick={(e) => e.stopPropagation()}
          style={{ textDecoration: 'none', color: 'inherit', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {category.name}
        </Link>
      </div>
      {expanded && hasChildren && (
        <div>
          {category.children.map((child) => (
            <TreeNode key={child.categoryId} category={child} activeId={activeId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

interface CategoryTreeProps {
  activeCategoryId?: number | null;
  collapsed?: boolean;
}

export const CategoryTree = ({ activeCategoryId = null, collapsed = false }: CategoryTreeProps) => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryApi.getTree()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
        Loading categories...
      </div>
    );
  }

  if (collapsed) return null;

  return (
    <nav style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0.5rem 0.5rem 0.25rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Categories
      </div>
      {categories.map((cat) => (
        <TreeNode key={cat.categoryId} category={cat} activeId={activeCategoryId} depth={0} />
      ))}
    </nav>
  );
};
