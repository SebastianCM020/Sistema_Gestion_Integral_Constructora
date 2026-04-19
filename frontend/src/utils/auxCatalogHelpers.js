export function cloneAuxCatalogs(catalogs) {
  return catalogs.map((catalog) => ({
    ...catalog,
    items: catalog.items.map((item) => ({ ...item })),
  }));
}

export function filterCatalogItems(items, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [item.itemCode, item.itemLabel, item.updatedBy].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(normalizedSearch);
  });
}

export function sortCatalogItems(items) {
  return [...items].sort((leftItem, rightItem) => {
    const leftOrder = leftItem.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = rightItem.sortOrder ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return leftItem.itemLabel.localeCompare(rightItem.itemLabel, 'es');
  });
}

export function buildCatalogSummary(catalogs) {
  return catalogs.reduce(
    (accumulator, catalog) => {
      accumulator.totalItems += catalog.items.length;
      accumulator.activeItems += catalog.items.filter((item) => item.isActive).length;
      return accumulator;
    },
    { totalItems: 0, activeItems: 0 }
  );
}

export function buildCatalogItemPayload(catalog, values, existingItem = null) {
  return {
    itemId: existingItem?.itemId ?? `${catalog.catalogId}-${Date.now()}`,
    itemCode: values.itemCode?.trim() ?? '',
    itemLabel: values.itemLabel.trim(),
    isActive: values.isActive,
    sortOrder: catalog.supportsSortOrder ? Number(values.sortOrder || 0) : null,
    updatedAt: new Date().toISOString(),
    updatedBy: 'Ana Beltrán',
  };
}

export function validateCatalogItem(values, catalog) {
  const errors = {};

  if (!values.itemLabel.trim()) {
    errors.itemLabel = 'Ingrese un nombre o etiqueta para continuar.';
  }

  if (catalog.supportsCode && !values.itemCode.trim()) {
    errors.itemCode = 'Ingrese un código para identificar este registro.';
  }

  if (catalog.supportsSortOrder && (values.sortOrder === '' || Number(values.sortOrder) < 0)) {
    errors.sortOrder = 'Defina un orden válido para este registro.';
  }

  return errors;
}

export function countPendingCatalogChanges(savedCatalogs, draftCatalogs) {
  return JSON.stringify(savedCatalogs) === JSON.stringify(draftCatalogs) ? 0 : 1;
}