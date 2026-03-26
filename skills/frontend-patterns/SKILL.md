---
name: frontend-patterns
description: "Creates React components using compound, render-prop, and HOC patterns. Implements custom hooks, manages state with Zustand and TanStack Query, optimizes rendering with memoization and code splitting, and adds accessibility with ARIA attributes and keyboard navigation. Use when building React UI, implementing hooks, managing client state, optimizing bundle size, or working with .tsx files."
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Frontend Patterns Skill

## Pattern Selection Guide

| Need | Pattern | When |
|------|---------|------|
| Flexible multi-part UI (tabs, accordions) | Compound Components | Building reusable UI kits |
| Share stateful logic across components | Custom Hooks | Extracting reusable behavior |
| Cross-cutting concerns (auth, logging) | HOC | Wrapping many components identically |
| Server state with caching | TanStack Query | Fetching/mutating API data |
| Client-only global state | Zustand | Shared UI state (theme, sidebar) |

## Component Patterns

### Compound Components
```tsx
const Tabs = ({ children, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
};

Tabs.List = ({ children }) => <div className="tabs-list">{children}</div>;
Tabs.Tab = ({ id, children }) => {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  );
};
Tabs.Panel = ({ id, children }) => {
  const { activeTab } = useTabsContext();
  return activeTab === id ? <div>{children}</div> : null;
};

// Usage
<Tabs defaultTab="tab1">
  <Tabs.List>
    <Tabs.Tab id="tab1">Tab 1</Tabs.Tab>
    <Tabs.Tab id="tab2">Tab 2</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel id="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### Custom Hooks
```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}
```

### Higher-Order Components
```tsx
function withAuth<P extends object>(Component: ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    return <Component {...props} />;
  };
}
```

## State Management

### Zustand Store
```tsx
interface Store {
  items: Item[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
}

const useStore = create<Store>((set) => ({
  items: [],
  isLoading: false,
  fetchItems: async () => {
    set({ isLoading: true });
    const items = await api.getItems();
    set({ items, isLoading: false });
  },
  addItem: (item) => set((s) => ({ items: [...s.items, item] })),
  removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));

// Selectors for performance
const useItems = () => useStore((s) => s.items);
```

### TanStack Query
```tsx
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: string) => [...todoKeys.lists(), { filters }] as const,
  detail: (id: string) => [...todoKeys.all, 'detail', id] as const,
};

export const useTodos = (filters?: string) =>
  useQuery({
    queryKey: todoKeys.list(filters ?? ''),
    queryFn: () => fetchTodos(filters),
  });

// Mutation with optimistic update
export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      const previous = queryClient.getQueryData(todoKeys.lists());
      queryClient.setQueryData(todoKeys.lists(), (old) =>
        old?.map((t) => (t.id === newTodo.id ? newTodo : t))
      );
      return { previous };
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(todoKeys.lists(), context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
  });
};
```

## Performance

### Memoization
```tsx
const expensiveValue = useMemo(() => {
  return items.filter(x => x.active).reduce((acc, x) => acc + x.value, 0);
}, [items]);

const handleClick = useCallback((id: string) => {
  setSelected(id);
}, []);

const MemoizedList = memo(({ items }: { items: Item[] }) => (
  <ul>{items.map(item => <li key={item.id}>{item.name}</li>)}</ul>
));
```

### Code Splitting
```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

<Suspense fallback={<PageSkeleton />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/settings" element={<Settings />} />
  </Routes>
</Suspense>
```

### Virtual Lists
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }: { items: Item[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
  });

  return (
    <div ref={parentRef} style={{ height: 400, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ position: 'absolute', top: virtualItem.start, height: virtualItem.size }}
          >
            {items[virtualItem.index].name}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

### Error Boundaries
```tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error caught:', error, info);
  }

  render() {
    if (this.state.hasError) return <ErrorFallback error={this.state.error} />;
    return this.props.children;
  }
}
```

## Accessibility

```tsx
// Focus management
const modalRef = useRef<HTMLDivElement>(null);
useEffect(() => { modalRef.current?.focus(); }, []);

// ARIA attributes
<button aria-label="Close modal" aria-expanded={isOpen} aria-controls="modal-content">
  <CloseIcon />
</button>

// Keyboard navigation
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown': setFocusedIndex(i => Math.min(i + 1, items.length - 1)); break;
    case 'ArrowUp': setFocusedIndex(i => Math.max(i - 1, 0)); break;
    case 'Enter': handleSelect(focusedIndex); break;
  }
};
```
