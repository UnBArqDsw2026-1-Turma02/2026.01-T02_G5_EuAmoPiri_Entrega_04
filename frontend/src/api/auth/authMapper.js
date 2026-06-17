/**
 * Mapeamento Auth (padrão Adapter)
 *
 * Traduz formatos de dados entre a UI e o backend.
 */

function formatBirthDate(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function mapApiUserToFrontend(apiUser) {
  if (!apiUser) return null;

  const role = apiUser.accountType === 'MORADOR'
    ? 'morador'
    : apiUser.accountType === 'TURISTA'
      ? 'turista'
      : null;

  return {
    id: apiUser.id,
    name: apiUser.name ?? '',
    email: apiUser.email ?? '',
    role,
    profession: apiUser.profession ?? '',
    contact: apiUser.phone ?? '',
    birthDate: formatBirthDate(apiUser.birthDate),
    bio: apiUser.biography ?? '',
    profilePhotoUrl: apiUser.profilePhotoUrl ?? null,
    avatarUrl: null,
  };
}

export function mapProfileToApi(profile) {
  const payload = {};

  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.contact !== undefined) payload.phone = profile.contact;
  if (profile.profession !== undefined) payload.profession = profile.profession;
  if (profile.bio !== undefined) payload.biography = profile.bio;
  if (profile.birthDate !== undefined) payload.birthDate = profile.birthDate;

  if (profile.role !== undefined) {
    payload.accountType = profile.role === 'morador' ? 'MORADOR' : 'TURISTA';
  }

  return payload;
}

export function mapRegisterToApi({ name, email, password, role, birthDate, phone }) {
  return {
    accountType: role === 'morador' ? 'MORADOR' : 'TURISTA',
    name,
    email,
    password,
    confirmPassword: password,
    birthDate: birthDate || '2000-01-01',
    phone: phone || '(00) 00000-0000',
  };
}
