export const defaultUserFilters = {
  query: '',
  role: 'all',
  status: 'all',
  sortBy: 'name',
};

export const defaultUserFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'Residente',
  isActive: true,
};

export function formatDateTime(dateValue) {
  if (!dateValue) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

export function getUserFullName(user) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function filterUsers(users, filters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return users.filter((user) => {
    const matchesQuery =
      !normalizedQuery ||
      getUserFullName(user).toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery);

    const matchesRole = filters.role === 'all' || user.role === filters.role;
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && user.isActive) ||
      (filters.status === 'inactive' && !user.isActive);

    return matchesQuery && matchesRole && matchesStatus;
  });
}

export function sortUsers(users, sortBy) {
  const nextUsers = [...users];

  nextUsers.sort((leftUser, rightUser) => {
    if (sortBy === 'lastLogin') {
      return new Date(rightUser.lastLogin || 0).getTime() - new Date(leftUser.lastLogin || 0).getTime();
    }

    if (sortBy === 'createdAt') {
      return new Date(rightUser.createdAt).getTime() - new Date(leftUser.createdAt).getTime();
    }

    return getUserFullName(leftUser).localeCompare(getUserFullName(rightUser), 'es');
  });

  return nextUsers;
}

export function getUserSummary(users) {
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;

  const roleDistribution = users.reduce((accumulator, user) => {
    accumulator[user.role] = (accumulator[user.role] ?? 0) + 1;
    return accumulator;
  }, {});

  const topRoles = Object.entries(roleDistribution)
    .sort((leftRole, rightRole) => rightRole[1] - leftRole[1])
    .slice(0, 3)
    .map(([role, total]) => ({ role, total }));

  return {
    totalUsers: users.length,
    activeUsers,
    inactiveUsers,
    topRoles,
  };
}

export function validateUserForm(values, existingUsers, currentUserId = null) {
  const errors = {};

  if (!values.firstName.trim()) {
    errors.firstName = 'El nombre es obligatorio.';
  }

  if (!values.lastName.trim()) {
    errors.lastName = 'El apellido es obligatorio.';
  }

  if (!values.email.trim()) {
    errors.email = 'El correo corporativo es obligatorio.';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Ingrese un correo con formato válido.';
  } else {
    const duplicateUser = existingUsers.find(
      (user) => user.email.toLowerCase() === values.email.trim().toLowerCase() && user.id !== currentUserId
    );

    if (duplicateUser) {
      errors.email = 'Ya existe un usuario registrado con este correo.';
    }
  }

  if (!values.role) {
    errors.role = 'Seleccione un rol para continuar.';
  }

  return errors;
}

export function createUserPayload(values) {
  const timestamp = new Date().toISOString();

  return {
    id: `usr-${Date.now()}`,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    role: values.role,
    isActive: values.isActive,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLogin: null,
    phone: '',
    projectScope: 'Pendiente de asignación',
    notes: 'Usuario creado desde administración interna.',
    permissions: [],
  };
}

export function updateUserPayload(user, values) {
  return {
    ...user,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    role: values.role,
    isActive: values.isActive,
    updatedAt: new Date().toISOString(),
  };
}