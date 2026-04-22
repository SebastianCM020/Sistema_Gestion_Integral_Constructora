const DEFAULT_STATUS_DATE = '2026-04-11';

export const defaultProjectAccessFilters = {
  query: '',
  projectId: 'all',
  role: 'all',
  status: 'all',
  accessMode: 'all',
  sortBy: 'updatedAt',
};

export const defaultProjectAccessFormValues = {
  userId: '',
  projectId: '',
  startDate: '',
  endDate: '',
  accessMode: 'active',
};

export function formatShortDate(dateValue) {
  if (!dateValue) {
    return 'Sin definir';
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateValue}T00:00:00`));
}

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

export function getStatusForAssignment(assignment, todayValue = DEFAULT_STATUS_DATE) {
  if (assignment.accessMode === 'revoked') {
    return { value: 'revoked', label: 'Revocada', tone: 'danger' };
  }

  if (assignment.endDate && assignment.endDate < todayValue) {
    return { value: 'expired', label: 'Expirada', tone: 'warning' };
  }

  if (assignment.accessMode === 'readonly') {
    return { value: 'readonly', label: 'Solo lectura', tone: 'info' };
  }

  return { value: 'active', label: 'Activa', tone: 'success' };
}

export function getAccessModeMeta(accessMode) {
  if (accessMode === 'readonly') {
    return { label: 'Solo lectura', tone: 'info' };
  }

  if (accessMode === 'revoked') {
    return { label: 'Revocado', tone: 'danger' };
  }

  return { label: 'Activo', tone: 'success' };
}

export function getDateRangeSummary(assignment, todayValue = DEFAULT_STATUS_DATE) {
  const status = getStatusForAssignment(assignment, todayValue);

  if (status.value === 'revoked') {
    return 'Acceso revocado. Se conserva la asignación solo para trazabilidad.';
  }

  if (status.value === 'expired') {
    return `La vigencia finalizó el ${formatShortDate(assignment.endDate)}.`;
  }

  if (assignment.endDate) {
    return `Vigente desde el ${formatShortDate(assignment.startDate)} hasta el ${formatShortDate(assignment.endDate)}.`;
  }

  return `Vigente desde el ${formatShortDate(assignment.startDate)} sin fecha final definida.`;
}

export function filterProjectAssignments(assignments, filters, todayValue = DEFAULT_STATUS_DATE) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return assignments.filter((assignment) => {
    const status = getStatusForAssignment(assignment, todayValue);
    const matchesQuery =
      !normalizedQuery ||
      assignment.userName.toLowerCase().includes(normalizedQuery) ||
      assignment.userEmail.toLowerCase().includes(normalizedQuery);

    const matchesProject = filters.projectId === 'all' || assignment.projectId === filters.projectId;
    const matchesRole = filters.role === 'all' || assignment.userRole === filters.role;
    const matchesStatus = filters.status === 'all' || status.value === filters.status;
    const matchesAccessMode = filters.accessMode === 'all' || assignment.accessMode === filters.accessMode;

    return matchesQuery && matchesProject && matchesRole && matchesStatus && matchesAccessMode;
  });
}

export function sortProjectAssignments(assignments, sortBy) {
  const nextAssignments = [...assignments];

  nextAssignments.sort((leftAssignment, rightAssignment) => {
    if (sortBy === 'userName') {
      return leftAssignment.userName.localeCompare(rightAssignment.userName, 'es');
    }

    if (sortBy === 'projectName') {
      return leftAssignment.projectName.localeCompare(rightAssignment.projectName, 'es');
    }

    if (sortBy === 'startDate') {
      return new Date(rightAssignment.startDate).getTime() - new Date(leftAssignment.startDate).getTime();
    }

    return new Date(rightAssignment.updatedAt).getTime() - new Date(leftAssignment.updatedAt).getTime();
  });

  return nextAssignments;
}

export function getProjectAssignmentSummary(assignments, todayValue = DEFAULT_STATUS_DATE) {
  return assignments.reduce(
    (summary, assignment) => {
      const status = getStatusForAssignment(assignment, todayValue);
      summary.total += 1;

      if (status.value === 'active') {
        summary.active += 1;
      }

      if (status.value === 'expired') {
        summary.expired += 1;
      }

      if (status.value === 'revoked') {
        summary.revoked += 1;
      }

      if (status.value === 'readonly') {
        summary.readonly += 1;
      }

      return summary;
    },
    { total: 0, active: 0, expired: 0, revoked: 0, readonly: 0 }
  );
}

export function validateProjectAssignmentForm(values, assignments, users, projects, currentAssignmentId = null) {
  const errors = {};

  if (!values.userId) {
    errors.userId = 'Seleccione un usuario para continuar.';
  }

  if (!values.projectId) {
    errors.projectId = 'Seleccione un proyecto para continuar.';
  }

  if (!values.startDate) {
    errors.startDate = 'La fecha de inicio es obligatoria.';
  }

  if (!values.endDate) {
    errors.endDate = 'La fecha de fin es obligatoria.';
  }

  if (values.startDate && values.endDate && values.endDate < values.startDate) {
    errors.endDate = 'La fecha fin no puede ser anterior a la fecha inicio.';
  }

  if (!values.accessMode) {
    errors.accessMode = 'Seleccione un modo de acceso.';
  }

  const userExists = users.some((user) => user.id === values.userId);
  const projectExists = projects.some((project) => project.id === values.projectId);

  if (values.userId && !userExists) {
    errors.userId = 'El usuario seleccionado ya no está disponible.';
  }

  if (values.projectId && !projectExists) {
    errors.projectId = 'El proyecto seleccionado ya no está disponible.';
  }

  if (values.userId && values.projectId) {
    const duplicateAssignment = assignments.find(
      (assignment) =>
        assignment.userId === values.userId &&
        assignment.projectId === values.projectId &&
        assignment.id !== currentAssignmentId &&
        assignment.accessMode !== 'revoked'
    );

    if (duplicateAssignment) {
      errors.projectId = 'Ya existe una asignación vigente o consultable para este usuario en el proyecto.';
    }
  }

  return errors;
}

export function createProjectAssignmentPayload(values, users, projects) {
  const timestamp = new Date().toISOString();
  const selectedUser = users.find((user) => user.id === values.userId);
  const selectedProject = projects.find((project) => project.id === values.projectId);

  return {
    id: `asg-${Date.now()}`,
    userId: selectedUser.id,
    userName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
    userEmail: selectedUser.email,
    userRole: selectedUser.role,
    projectId: selectedProject.id,
    projectCode: selectedProject.code,
    projectName: selectedProject.name,
    startDate: values.startDate,
    endDate: values.endDate,
    accessMode: values.accessMode,
    createdAt: timestamp,
    updatedAt: timestamp,
    notes: 'Asignación creada desde administración de accesos por proyecto.',
  };
}

export function updateProjectAssignmentPayload(assignment, values, users, projects) {
  const selectedUser = users.find((user) => user.id === values.userId);
  const selectedProject = projects.find((project) => project.id === values.projectId);

  return {
    ...assignment,
    userId: selectedUser.id,
    userName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
    userEmail: selectedUser.email,
    userRole: selectedUser.role,
    projectId: selectedProject.id,
    projectCode: selectedProject.code,
    projectName: selectedProject.name,
    startDate: values.startDate,
    endDate: values.endDate,
    accessMode: values.accessMode,
    updatedAt: new Date().toISOString(),
  };
}

export function updateProjectAccessModePayload(assignment, accessMode) {
  return {
    ...assignment,
    accessMode,
    updatedAt: new Date().toISOString(),
  };
}

export function updateProjectAccessDatesPayload(assignment, values) {
  return {
    ...assignment,
    startDate: values.startDate,
    endDate: values.endDate,
    updatedAt: new Date().toISOString(),
  };
}