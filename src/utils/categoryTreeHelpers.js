// Функция сортировки по алфавиту (английский → кириллица → цифры)
export const sortAlphabetically = (items) => {
  if (!Array.isArray(items)) return [];
  
  return [...items].sort((a, b) => {
    const titleA = a.title || '';
    const titleB = b.title || '';
    
    const isEnglishA = /^[A-Za-z]/.test(titleA);
    const isEnglishB = /^[A-Za-z]/.test(titleB);
    const isCyrillicA = /^[А-Яа-яЁёІіЇїЄє]/.test(titleA);
    const isCyrillicB = /^[А-Яа-яЁёІіЇїЄє]/.test(titleB);
    
    if (isEnglishA && !isEnglishB) return -1;
    if (!isEnglishA && isEnglishB) return 1;
    if (isCyrillicA && !isCyrillicB && !isEnglishB) return -1;
    if (!isCyrillicA && isCyrillicB && !isEnglishA) return 1;
    
    return titleA.localeCompare(titleB, 'uk', { sensitivity: 'base' });
  });
};

// Преобразование дерева в плоский список категорий
export const flattenCategoryTree = (tree, parentId = null) => {
  if (!Array.isArray(tree)) return [];
  
  let result = [];
  
  tree.forEach(node => {
    // Добавляем текущий узел, если у него есть title
    if (node.title) {
      result.push({
        id: node.id,
        title: node.title,
        parent_id: parentId,
        image: node.image || 'noimage.png'
      });
    }
    
    // Рекурсивно обрабатываем детей
    if (node.children && node.children.length > 0) {
      result = result.concat(
        flattenCategoryTree(node.children, node.id || parentId)
      );
    }
  });
  
  return result;
};

// Получить все категории определенного parent_id
export const getCategoriesByParentId = (tree, parentId) => {
  const flattened = flattenCategoryTree(tree);
  return sortAlphabetically(
    flattened.filter(cat => String(cat.parent_id) === String(parentId))
  );
};

// Получить категорию по id
export const getCategoryById = (tree, id) => {
  const flattened = flattenCategoryTree(tree);
  return flattened.find(cat => String(cat.id) === String(id));
};

// Получить категорию по id из дерева (с сохранением структуры children)
export const getCategoryFromTree = (tree, id) => {
  if (!Array.isArray(tree)) return null;
  
  for (const node of tree) {
    if (node.id === id) return node;
    
    if (node.children && node.children.length > 0) {
      const found = getCategoryFromTree(node.children, id);
      if (found) return found;
    }
  }
  
  return null;
};

// Получить путь категорий от корня до указанной категории
export const getCategoryPath = (tree, targetId, currentPath = []) => {
  if (!Array.isArray(tree)) return null;
  
  for (const node of tree) {
    const newPath = [...currentPath, node];
    
    if (node.id === targetId) {
      return newPath;
    }
    
    if (node.children && node.children.length > 0) {
      const found = getCategoryPath(node.children, targetId, newPath);
      if (found) return found;
    }
  }
  
  return null;
};

// Получить детей категории на определенном уровне пути
export const getChildrenAtLevel = (tree, selectedPath, level) => {
  if (!Array.isArray(tree) || !Array.isArray(selectedPath)) return [];
  
  let currentLevel = tree;
  
  // Проходим по пути до нужного уровня
  for (let i = 0; i < level && i < selectedPath.length; i++) {
    const categoryId = selectedPath[i];
    const category = currentLevel.find(cat => cat.id === categoryId);
    
    if (!category || !category.children || category.children.length === 0) {
      return [];
    }
    
    currentLevel = category.children;
  }
  
  return sortAlphabetically(currentLevel);
};

// Проверить, есть ли у категории дети
export const hasChildren = (tree, categoryId) => {
  const category = getCategoryFromTree(tree, categoryId);
  return category && category.children && category.children.length > 0;
};