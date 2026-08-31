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

/**
 * Закреплённый порядок верхнего уровня.
 *
 * Клиент попросил исключение: три основных раздела всегда идут в этом порядке,
 * а всё, что появится в каталоге дальше, выстраивается за ними по алфавиту.
 * По алфавиту эти три встали бы иначе — «Комплектующие, Накладки, Пиропатроны».
 *
 * Сопоставляем по id, а не по названию: id приходят из RemOnline и на них уже
 * держится вся навигация (они стоят в адресах страниц), тогда как название
 * можно переименовать в любой момент.
 */
export const PINNED_ROOT_CATEGORY_IDS = [
  754099, // Накладки
  754101, // Пиропатроны
  754100, // Комплектующие Airbag SRS
];

/**
 * Порядок категорий верхнего уровня: сначала закреплённые, потом по алфавиту.
 *
 * Только для корня. Внутри разделов порядок остаётся алфавитным — там
 * закреплять нечего, это марки машин и типы деталей.
 */
export const sortRootCategories = (items) => {
  if (!Array.isArray(items)) return [];

  const rank = (item) => PINNED_ROOT_CATEGORY_IDS.indexOf(Number(item?.id));
  const pinned = items.filter((item) => rank(item) !== -1).sort((a, b) => rank(a) - rank(b));
  const rest = items.filter((item) => rank(item) === -1);

  return [...pinned, ...sortAlphabetically(rest)];
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
  
  // Приводим к числу для сравнения
  const idNum = Number(id);
  
  for (const node of tree) {
    if (Number(node.id) === idNum) return node;
    
    if (node.children && node.children.length > 0) {
      const found = getCategoryFromTree(node.children, idNum);
      if (found) return found;
    }
  }
  
  return null;
};

// Получить путь категорий от корня до указанной категории
export const getCategoryPath = (tree, targetId, currentPath = []) => {
  if (!Array.isArray(tree)) return null;
  
  // Приводим к числу для сравнения
  const targetIdNum = Number(targetId);
  
  for (const node of tree) {
    const newPath = [...currentPath, node];
    
    // Сравниваем как числа
    if (Number(node.id) === targetIdNum) {
      return newPath;
    }
    
    if (node.children && node.children.length > 0) {
      const found = getCategoryPath(node.children, targetIdNum, newPath);
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
  
  // level === 0 — это корень каталога, у него свой порядок.
  return level === 0 ? sortRootCategories(currentLevel) : sortAlphabetically(currentLevel);
};

// Проверить, есть ли у категории дети
export const hasChildren = (tree, categoryId) => {
  const category = getCategoryFromTree(tree, categoryId);
  return category && category.children && category.children.length > 0;
};