---
title: 史上最简单高效的状态管理
date: 2024-12-27
tags: [use-immer, immer, state-manager, react]
---

# 史上最简单高效的状态管理

## 场景

1. 简单组件的内部状态管理
2. 复杂的业务组件状态管理
3. 整个应用的状态管理

## 优势

使用 use-immer 管理状态的优势：

- [接近原生 JS 的开发体验] 使用接近 js 原生对象的风格操作不可变数据，引入的概念少；
- [与 React 无缝结合] 与 react 结合，状态变更可预测，调试友好，diff 变更时无心智负担；
- [灵活拓展] 按需拓展场景，如 Selector、Mutation 等，状态流转白盒化；

### 1 接近原生 JS 的开发体验

1. 相对于 zustand、redux 等，引入的概念少，API 设计简单

```typescript
function List() {
    const [state, dispatch] = useImmer({
        loading: true,
        posts: []
    })

    useEffect(() => {
        getAllPosts().then(posts => {
            dispatch(draft => {
                draft.loading = false;
                draft.posts = posts;
            })
        })
    }, [])
}
```

2. ts 的 class 可以作为类型使用，immer 结合 class 定义状态，结构清晰、类型友好：

```typescript
export class State {
  [immerable] = true;

  loading = true;
  posts: Post[] = [];
}

function List() {
    const [state, dispatch] = useImmer(() => new State());
}
```

### 2 与 React 无缝结合

1. 上述的代码片段已经展示了使用 user-immer 管理组件的内部状态，简单方便；
2. 通过 React Context 在组件树中传递组件状态

```typescript
// 1. 创建 Context Ref
const ModelContext = createContext<{ state: State, dispatch }>();

// 2. 提供 State
function Root() {
    const [state, dispatch] = useImmer(() => new State());

    return (
        <ModelContext.Provider value={{ state, dispatch }}>
            {children}
        </StateRefContext.Provider>
    )
}

// 3. 定义 hooks
export const useModel = () => useContext(ModelContext);

// 4. 子组件访问
function List() {
    const model = useModel();

    // model.state.loading
}
```

3. 基于 immer 的不可变数据，diff 无心智负担

```typescript
function List() {
    const model = useModel();

    useEffect(() => {
        // posts 发生变化
    }, [model.state.posts])
}
```

### 3 灵活拓展使用场景

1. 纯函数风格的 Selector，Mutation

```typescript
import { immerable, produce } from 'immer';

// 1. 定义状态
export class State {
  [immerable] = true;

  loading = true;
  posts: Post[] = [];

  static set(state: State, recipe: (draft: State) => void) {
    return produce(state, recipe);
  }
}

// 2. 定义 Selector、Mutation
const getPosts = (state: State) => model.posts
const setPosts = (draft: State, posts: State['posts']) => {
    draft.posts = posts
}
```

2. 缓存 Selector 结果，避免不必要的渲染，提升性能

```typescript
// 3. 定义 useSelector 缓存结果，避免不
function useSelector<T>(
  selector: (state: State) => T,
  deps: DependencyList = []
): T {
  const model = useModel();
  const state = useModelState();

  return useMemo(() => selector(state), [state, selector, ...deps]);
}

function Lists() {
    const posts = useSelector(getPosts);
}
```

3. 子组件驱动数据更新，满足复杂的业务场景

```typescript
function useDispatch() {
    const model = useModel();
    return useMemo(() => model.dispatch, [model.dispatch]);
}

function Lists() {
    const posts = useSelector(getPosts);
    const dispatch = useDispatch();

    useEffect(() => {
        getAllPosts().then(posts => {
            dispatch(draft => setPosts(draft, posts))
        })
    }, [])
}
```

