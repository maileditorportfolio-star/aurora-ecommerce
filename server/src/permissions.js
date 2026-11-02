const PERMISSIONS = {
  PRODUCTS_WRITE: 'products.write',
  ORDERS_READ: 'orders.read',
  ORDERS_WRITE: 'orders.write',
  CUSTOMERS_READ: 'customers.read',
  ANALYTICS_READ: 'analytics.read',
  DESIGN_WRITE: 'design.write',
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

/** Keeps only known permission keys and removes duplicates. */
const normalizePermissions = (value) => {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((permission) => ALL_PERMISSIONS.includes(permission)))];
};

module.exports = { PERMISSIONS, ALL_PERMISSIONS, normalizePermissions };
